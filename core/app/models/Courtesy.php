<?php

/**
* Client Class
*
* @package CodeIgniter
* @category Models
* @Author ITM Dev Team
* @Since Version 1.0.0
*/
class Courtesy extends CI_Model
{
    public $model;
    public $active;
    public $attrib;
    public $inactive;
    public $anchor_attrib;

    public function __construct()
    {
        $this->model = '';
        parent::__construct();

        $this->attrib = array('class' => 'center');
        $this->active = array('class' => 'label label-success');
        $this->inactive = array('class' => 'label label-danger');
    }

    public function get_list()
    {
        $this->db->close();
        $table_content = $this->Page->get_settings('courtesies');

        $rol_id = $this->session->userdata('rol_id');

        $table = $table_content['COURTESIES_TABLE'];
        if ($rol_id != 1 && !in_array('g_courtesies', $this->session->userdata('permissions')))
        {
            $limit = count($table->contents[0]->contents->contents) - 1;

            array_splice($table->contents[0]->contents->contents, $limit, 1);
            array_splice($table->contents[2]->contents->contents, $limit, 1);
        }

        $table_content = $this->build->build_components($table);

        // Call API here!
        $params = new stdClass();
        $endpoint = HOST . GET_COURTESIES_ROUTE;

        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        if ($response->code == 200)
        {
            $rows = $response->message;
            foreach ($rows as $row)
            {
                $aux = '';
                $this->anchor_attrib = array();

                $aux .= custom('td', '', $row->courtesy_type);
                $aux .= custom('td', '', $row->reseller_name);
                $aux .= custom('td', '', $row->quantity_courtesy);
                $aux .= custom('td', '', $row->min);
                $aux .= custom('td', '', $row->max);

                $status = '';
                $delete = '';
                if ($row->active_status == 1)
                {
                    $status = custom('span', $this->active, 'Active');
                }
                else
                {
                    $status = custom('span', $this->inactive, 'Inactive');
                }

                $status_attrib = $this->attrib;
                $status_attrib['data-status'] =  $row->courtesy_id;
                $aux .= custom('td', $status_attrib, $status);

                $aux .= custom('td', '', $row->pax_name);
                $aux .= custom('td', '', $row->service_name);


                if ($rol_id == 1 || in_array('u_courtesies', $this->session->userdata('permissions')))
                {
                    $path = 'courtesies/' . $row->courtesy_id;
                    $this->anchor_attrib['class'] = 'edit';
                    $this->anchor_attrib['href'] = base_url($path);
                    $edit = custom('i', array('class' => 'fas fa-edit'), '');

                    $edit = custom('a', $this->anchor_attrib, $edit);
                }
                if ($rol_id == 1 || in_array('d_courtesies', $this->session->userdata('permissions')))
                {
                    if ($row->active_status == 1) {
                        $this->anchor_attrib['href'] = '#';
                        $this->anchor_attrib['class'] = 'delete';
                        $this->anchor_attrib['data-id'] = $row->courtesy_id;
                        $delete = custom('i', array('class' => 'fas fa-trash'), '');

                        $delete = custom('a', $this->anchor_attrib, $delete);
                    }

                    $aux .= custom('td', $this->attrib, $edit . $delete);
                }

                $this->model .= custom('tr', '', $aux);
            }
        }
        else
        {
            $aux = '';
            for ($i = 0; $i < 5; $i++)
                $aux .= custom('td', '', '');

            $this->model = custom('tr', '', $aux);
        }

        $this->model = str_replace('{rows}', $this->model, $table_content);

        return $this->model;
    }

    public function get_form()
    {
        $this->db->close();
        $contents = $this->Page->get_settings('courtesies');

        $this->model = $this->build->build_components(
            $contents['COURTESIES_FORM']
        );

        return $this->model;
    }

    public function get_data($id)
    {
        $endpoint = HOST . GET_COURTESIES_ROUTE . '/' . $id;

        $params = new stdClass();
        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );
        $courtesy = new stdClass();

        if ($response->code == 200)
        {
            $courtesy->courtesy_id = $response->message->courtesy_id;
            $courtesy->reseller_id = $response->message->reseller_id;
            $courtesy->quantity_courtesy = $response->message->quantity_courtesy;
            $courtesy->active_status = $response->message->active_status;
            $courtesy->min   = $response->message->min;
            $courtesy->max   = $response->message->max;
            $courtesy->courtesy_type_id   = $response->message->courtesy_type_id;
            $courtesy->pax_id   = $response->message->pax_id;
            $courtesy->service_id   = $response->message->service_id;
        }else{
            redirect('/courtesies/list');
        }

        return $courtesy;
    }
}

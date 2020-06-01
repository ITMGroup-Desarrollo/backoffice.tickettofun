<?php

/**
* Client Class
*
* @package CodeIgniter
* @category Models
* @Author ITM Dev Team
* @Since Version 1.0.0
*/
class Ship extends CI_Model
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
        $this->active = array('class' => LABEL_SUCCESS);
        $this->inactive = array('class' => LABEL_DANGER);
    }

    public function get_list()
    {
        $this->db->close();
        $table_content = $this->Page->get_settings('ships');

        $rol_id = $this->session->userdata('rol_id');

        $table = $table_content['SHIPS_TABLE'];
        if ($rol_id != 1 && !in_array('g_ships', $this->session->userdata('permissions')))
        {
            $limit = count($table->contents[0]->contents->contents) - 1;

            array_splice($table->contents[0]->contents->contents, $limit, 1);
            array_splice($table->contents[2]->contents->contents, $limit, 1);
        }

        $table_content = $this->build->build_components($table);

        // Call API here!
        $params = new stdClass();
        $endpoint = GET_SHIPS_ROUTE;

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

                $aux .= custom('td', '', $row->ship_name);
                $aux .= custom('td', '', $row->reseller_name);
                $aux .= custom('td', '', $row->ship_capacity);

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
                $status_attrib['data-status'] =  $row->ship_id;
                $aux .= custom('td', $status_attrib, $status);

                if ($rol_id == 1 || in_array('u_ships', $this->session->userdata('permissions')))
                {
                    $path = 'ships/' . $row->ship_id;
                    $this->anchor_attrib['class'] = 'edit';
                    $this->anchor_attrib['href'] = base_url($path);
                    $edit = custom('i', array('class' => 'fas fa-edit'), '');

                    $edit = custom('a', $this->anchor_attrib, $edit);
                }
                if ($rol_id == 1 || in_array('d_ships', $this->session->userdata('permissions')))
                {
                    if ($row->active_status == 1) {
                        $this->anchor_attrib['href'] = '#';
                        $this->anchor_attrib['class'] = 'delete';
                        $this->anchor_attrib['data-id'] = $row->ship_id;
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
        $contents = $this->Page->get_settings('ships');

        $this->model = $this->build->build_components(
            $contents['SHIPS_FORM']
        );

        return $this->model;
    }

    public function get_data($id)
    {
        $endpoint = GET_SHIPS_ROUTE . '/' . $id;

        $params = new stdClass();
        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );
        $ship = new stdClass();

        if ($response->code == 200)
        {
            $ship->id = $response->message->ship_id;
            $ship->name = $response->message->ship_name;
            $ship->reseller = $response->message->reseller_id;
            $ship->capacity = $response->message->ship_capacity;
            $ship->active = $response->message->active_status;
        }else{
            redirect('/ships/list');
        }

        return $ship;
    }
}

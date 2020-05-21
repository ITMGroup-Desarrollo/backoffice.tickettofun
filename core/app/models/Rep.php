<?php

/**
* Client Class
*
* @package CodeIgniter
* @category Models
* @author ITM Dev Team
* @since Version 1.0.0
*/
class Rep extends CI_Model
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
        $table_content = $this->Page->get_settings('reps');

        $table_content = $this->build->build_components(
            $table_content['REPS_TABLE']
        );

        // Call API here!
        $params = new stdClass();
        $endpoint = GET_REPS_ROUTE;

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

                $aux .= custom('td', '', $row->first_name);
                $aux .= custom('td', '', $row->last_name);
                $aux .= custom('td', '', $row->code);

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
                $status_attrib['data-status'] =  $row->rep_id;
                $aux .= custom('td', $status_attrib, $status);

                $path = 'reps/' . $row->rep_id;
                $this->anchor_attrib['class'] = 'edit';
                $this->anchor_attrib['href'] = base_url($path);
                $edit = custom('i', array('class' => 'fas fa-edit'), '');

                $edit = custom('a', $this->anchor_attrib, $edit);

                if ($row->active_status == 1) {
                    $this->anchor_attrib['href'] = '#';
                    $this->anchor_attrib['class'] = 'delete';
                    $this->anchor_attrib['data-id'] = $row->rep_id;
                    $delete = custom('i', array('class' => 'fas fa-trash'), '');

                    $delete = custom('a', $this->anchor_attrib, $delete);
                }

                $aux .= custom('td', $this->attrib, $edit . $delete);

                $this->model .= custom('tr', '', $aux);
            }
        }
        else
        {
            $aux = '';
            for ($i = 0; $i < 3; $i++)
                $aux .= custom('td', '', '');

            $this->model = custom('tr', '', $aux);
        }

        $this->model = str_replace('{rows}', $this->model, $table_content);

        return $this->model;
    }

    public function get_form()
    {
        $this->db->close();
        $contents = $this->Page->get_settings('reps');

        $this->model = $this->build->build_components(
            $contents['REPS_FORM']
        );

        return $this->model;
    }

    public function get_data($id)
    {
        $endpoint = GET_REPS_ROUTE . '/' . $id;

        $params = new stdClass();
        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        $sales_rep = new stdClass();

        if ($response->code == 200)
        {
            $sales_rep->id = $response->message->rep_id;
            $sales_rep->reseller_id = $response->message->reseller_id;
            $sales_rep->first_name = $response->message->first_name;
            $sales_rep->last_name = $response->message->last_name;
            $sales_rep->user_id = $response->message->user_id;
            $sales_rep->code_rep = $response->message->code;
            $sales_rep->email_addr = $response->message->email_addr;
            $sales_rep->active = $response->message->active_status;
            $sales_rep->boot_id = (isset($response->message->rep_id) && !empty($response->message->rep_id)? $response->message->rep_id : 0);
        }
        else
        {
            redirect('/reps/list');
        }

        return $sales_rep;
    }
}

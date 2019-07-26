<?php

/**
* Client Class
*
* @package CodeIgniter
* @category Models
* @Author ITM Dev Team
* @Since Version 1.0.0
*/
class Service extends CI_Model
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
        $table_content = $this->Page->get_settings('services');
        $table_content = $this->build->build_components(
            $table_content['SERVICES_TABLE']
        );

        // Call API here!
        $params = new stdClass();
        $endpoint = HOST . GET_SERVICES_ROUTE;

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

                $aux .= custom('td', '', $row->service_name);
                $aux .= custom('td', '', $row->code);
                $aux .= custom('td', '', $row->location_name);
                $aux .= custom('td', $this->attrib, $row->min_available_num);
                $aux .= custom('td', $this->attrib, $row->max_available_num);

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
                $status_attrib['data-status'] =  $row->service_id;
                $aux .= custom('td', $status_attrib, $status);

                $path = 'services/' . $row->service_id;
                $this->anchor_attrib['class'] = 'edit';
                $this->anchor_attrib['href'] = base_url($path);
                $edit = custom('i', array('class' => 'ion-edit'), '');

                $edit = custom('a', $this->anchor_attrib, $edit);

                if ($row->active_status == 1) {
                    $this->anchor_attrib['href'] = '#';
                    $this->anchor_attrib['class'] = 'delete';
                    $this->anchor_attrib['data-id'] = $row->service_id;
                    $delete = custom('i', array('class' => 'ion-close'), '');

                    $delete = custom('a', $this->anchor_attrib, $delete);
                }

                $aux .= custom('td', $this->attrib, $edit . $delete);

                $this->model .= custom('tr', '', $aux);
            }
        }
        else
        {
            $this->model = custom('tr', '', '');
        }

        $this->model = str_replace('{rows}', $this->model, $table_content);

        return $this->model;
    }

    public function get_form()
    {
        $this->db->close();
        $contents = $this->Page->get_settings('services');

        $this->model = $this->build->build_components(
            $contents['SERVICES_FORM']
        );

        return $this->model;
    }

    public function get_data($id)
    {
        $endpoint = HOST . GET_SERVICES_ROUTE . '/' . $id;

        $params = new stdClass();
        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        $service = new stdClass();

        if ($response->code == 200)
        {
            $service->code     = $response->message->code;
            $service->id       = $response->message->service_id;
            $service->location = $response->message->location_id;
            $service->name     = $response->message->service_name;
            $service->active   = $response->message->active_status;
            $service->max      = $response->message->min_available_num;
            $service->min      = $response->message->max_available_num;
        }

        return $service;
    }
}

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
        // Get token
        $params = new stdClass();
        $endpoint = HOST . SERVICES_ENDPOINT;

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
                $aux .= custom('td', '', $row->service_name);
                $aux .= custom('td', '', $row->code);
                $aux .= custom('td', '', $row->location_name);
                $aux .= custom('td', $this->attrib, $row->min_available_num);
                $aux .= custom('td', $this->attrib, $row->max_available_num);

                $status = '';
                if ($row->active_status == 1)
                {
                    $status = custom('span', $this->active, 'Active');
                }
                else
                {
                    $status = custom('span', $this->inactive, 'Inactive');
                }

                $aux .= custom('td', '', $status);

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
}

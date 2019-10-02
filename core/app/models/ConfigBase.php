<?php

/**
* Client Class
*
* @package CodeIgniter
* @category Models
* @Author ITM Dev Team
* @Since Version 1.0.0
*/
class ConfigBase extends CI_Model
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
        $table_content = $this->Page->get_settings('config');
        $table_content = $this->build->build_components(
            $table_content['CONFIG_BASE_TABLE']
        );
        
        // Call API here!
        $params = new stdClass();
        $endpoint = HOST . GET_CONFIG_BASE_ROUTE;
        
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

                $aux .= custom('td', '', $row->channel_name);
                $aux .= custom('td', '', $row->reseller_name);
                $aux .= custom('td', '', $row->service_name);
                $aux .= custom('td', '', $row->start_date);
                $aux .= custom('td', '', $row->end_date);
                $aux .= custom('td', '', $row->schedule_start);
                $aux .= custom('td', '', $row->schedule_end);
                $aux .= custom('td', '', $row->min_available);
                $aux .= custom('td', '', $row->max_available);
                $aux .= custom('td', '', $row->available);

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
                $status_attrib['data-status'] =  $row->base_id;
                $aux .= custom('td', $status_attrib, $status);

                $path = 'allotments/configuration/' . $row->base_id;
                $this->anchor_attrib['class'] = 'edit';
                $this->anchor_attrib['href'] = base_url($path);
                $edit = custom('i', array('class' => 'fas fa-edit'), '');

                $edit = custom('a', $this->anchor_attrib, $edit);

                if ($row->active_status == 1) {
                    $this->anchor_attrib['href'] = '#';
                    $this->anchor_attrib['class'] = 'delete';
                    $this->anchor_attrib['data-id'] = $row->base_id;
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
            for ($i = 0; $i < 12; $i++)
                $aux .= custom('td', '', '');

            $this->model = custom('tr', '', $aux);
        }
        
        $this->model = str_replace('{rows}', $this->model, $table_content);

        return $this->model;
    }

    public function get_form()
    {
        $this->db->close();
        $contents = $this->Page->get_settings('config');

        $this->model = $this->build->build_components(
            $contents['CONFIG_FORM']
        );

        return $this->model;
    }

    public function get_data($id)
    {
        $endpoint = HOST . GET_CONFIG_BASE_ROUTE . '/' . $id;

        $params = new stdClass();
        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );
        $config = new stdClass();

        if ($response->code == 200)
        {
            // print_r($response->message); exit;
            $config->id = $response->message->base_id;
            $config->channel = $response->message->channel_id;
            $config->reseller = $response->message->reseller_id;
            $config->arrive_id = $response->message->arrive_id;
            $config->service = $response->message->service_id;
            $config->start_date = $response->message->start_date;
            $config->end_date = $response->message->end_date;
            $config->schedule_start = $response->message->schedule_start;
            $config->schedule_end = $response->message->schedule_end;
            $config->overlap = $response->message->overlap;
            $config->shared = $response->message->shared_schedule;
            $config->min_available = $response->message->min_available;
            $config->max_available = $response->message->max_available;
            $config->available = $response->message->available;
            $config->active = $response->message->active_status;
        }else{
            redirect('/configuration');
        }

        return $config;
    }
}

<?php

/**
* Client Class
*
* @package CodeIgniter
* @category Models
* @Author ITM Dev Team
* @Since Version 1.0.0
*/
class Allotment extends CI_Model
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
        $table_content = $this->Page->get_settings('config');

        $rol_id = $this->session->userdata('rol_id');

        if ($rol_id != 1 && !in_array('g_allotments', $this->session->userdata('permissions')))
        {
            $table = $table_content['CONFIG_BASE_TABLE'];

            array_splice($table->contents[0]->contents->contents, 10, 1);
            array_splice($table->contents[2]->contents->contents, 10, 1);

            $table_content['CONFIG_BASE_TABLE'] = $table;
        }

        $table_content = $this->build->build_components(
            $table_content['CONFIG_BASE_TABLE']
        );

        // Call API here!
        $params = new stdClass();
        if (isset($_POST['dates']) && $_POST['dates'] != '') {
            $dates = explode('to',$_POST['dates']);
        } else {
            $dates[0] = date('Y-m-d');
        }

        $params->start_date = $dates[0];
        $endpoint = GET_ALLOTMENTS_ROUTE;

        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('POST', $endpoint, $params, $token)
        );

        $data_headerbar= [];
        if ($response->code == 200)
        {
            $rows = $response->message;
            $data_headerbar = $rows[0];
        }

        $this->model = str_replace('{rows}', $this->model, $table_content);
        return array(
            'table-data' => $this->model,
            'data-header' => $data_headerbar
        );
    }

    public function get_list_clone()
    {
        $this->db->close();
        $table_content = $this->Page->get_settings('clone');

        $table = $table_content['CLONE_ALLOTMENT_TABLE'];
        $table_content = $this->build->build_components($table);

        $this->model = str_replace('{rows}', '', $table_content);

        return $this->model;
    }

    public function get_list_allotment_update()
    {
        $this->db->close();
        $table_content = $this->Page->get_settings('allotments-config');

        $table = $table_content['ALLOTMENT_CONFIG_TABLE'];
        $table_content = $this->build->build_components($table);

        $this->model = str_replace('{rows}', '', $table_content);

        return $this->model;
    }

    public function get_table_html($id) //arrive_id of slug
    {
        $this->db->close();
        $table_content = $this->Page->get_settings('schedules');
        $table_content = $this->build->build_components(
            $table_content['SCHEDULE_TABLE']
        );

        $this->model = str_replace('{rows}', $this->model, $table_content);
        return $this->model;
    }

    public function get_form($slug = null, $option = null)
    {
        $this->db->close();
        $contents = $this->Page->get_settings($option);

        $form = 'CONFIG_FORM';
        switch ($slug) {
            case 'filters':
                $form = 'CONFIG_FORM_FILTERS';
                break;
            case 'schedule_filters':
                $form = 'SCHEDULE_FORM_FILTERS';
                break;
            case 'clone':
                $form = 'CLONE_FORM_FILTERS';
                break;
            case 'form_edit':
                $form = 'ALLOTMENT_CONFIG_FORM';
                break;
            case 'transfer':
                $form = 'TRANSFER_FORM';
                break;
        }

        $this->model = $this->build->build_components(
            $contents[$form]
        );

        return $this->model;
    }

    public function get_data($slug = '',$id)
    {
        switch($slug)
        {
            case 'arrives':
                $endpoint = GET_ALLOTMENTS_ROUTE . '/' . $slug . '/' . $id;
            break;
            case 'ship':
                $endpoint = GET_ALLOTMENTS_ROUTE . '/' . $slug . '/' . $id;
            break;
            default:
                $endpoint = GET_ALLOTMENTS_ROUTE . '/' . $id;
            break;

        }

        $endpoint = GET_ALLOTMENTS_ROUTE . '/' . $id;

        $params = new stdClass();
        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );
        $config = new stdClass();

        if ($response->code == 200)
        {
            $config->id = $response->message->allotment_id;
            $config->channel = $response->message->channel_id;
            $config->reseller = $response->message->reseller_id;
            $config->arrive_id = $response->message->arrive_id;
            $config->service = $response->message->service_id;
            $config->cruise = $response->message->ship_id;
            $config->start_date = $response->message->start_date;
            $config->end_date = $response->message->end_date;
            $config->schedule_start = $response->message->schedule_start;
            $config->schedule_end = $response->message->schedule_end;
            $config->overlap = $response->message->overlap;
            $config->shared = $response->message->shared_schedule;
            $config->private = $response->message->private_service;
            $config->min_available = $response->message->min_available;
            $config->max_available = $response->message->max_available;
            $config->available = $response->message->available;
            $config->active = $response->message->active_status;
            $config->stand_by = $response->message->stand_by;

        }else{
            redirect('/configuration');
        }

        return $config;
    }

    public function get_arrive_data($id, $date)
    {
        $endpoints = GET_ARRIVES_ROUTE . '/ship/' . $id;

        $this->load->library('session');
        $token = $this->session->userdata('token');

        $params = new stdClass();
        $params->start_date = $date;
        $params->end_date = $date;

        $response = json_decode(
            $this->api->request_api("POST", $endpoints, $params, $token)
        );

        $config = new stdClass();

        if ($response->code == 200)
        {
            $arrive = $response->message[0];
            $config->code = 200;
            $config->id = $arrive->arrive_id;
            $config->channel = $arrive->channel_id;
            $config->channel_name = $arrive->channel_name;
            $config->vendor = $arrive->reseller_id;
            $config->vendor_name = $arrive->reseller_name;
            $config->cruise = $arrive->ship_id;
            $config->cruise_name = $arrive->ship_name;
            $config->arrival_date = $arrive->arrival_date;
            $config->arrival_time = date('h:i', strtotime($arrive->arrival_time_markup))." - ".date('h:i', strtotime($arrive->departure_time_markup));
        } else {
            $config->code = $response->code;
        }

        return $config;
    }

    public function get_data_id($type, $id)
    {
        $endpoints = HOST;

        switch($type)
        {
            case 'reseller':
                $endpoints .= GET_RESELLERS_ROUTE . '/' . $id;
            break;
            case 'cruise':
                $endpoints .= GET_SHIPS_ROUTE . '/' . $id;
            break;
        }

        $this->load->library('session');
        $token = $this->session->userdata('token');

        $params = new stdClass();
        $response = json_decode(
            $this->api->request_api("GET", $endpoints, $params, $token)
        );

        $config = new stdClass();
        if ($response->code == 200)
        {
            $config->code = 200;

            if($type == 'cruise')
            {
                $config->cruise_name = $response->message->ship_name;

            }
            $config->vendor_name = $response->message->reseller_name;

        } else {
            $config->code = $response->code;
        }

        return $config;

    }

    function div_element($label, $text)
    {
        $tag = '<div class="col-sm-3" id="det-date">
                    <label>
                    '.$label.'
                    </label>
                    <div>
                    '.$text.'
                    </div>
                </div>';

        return $tag;
    }
}

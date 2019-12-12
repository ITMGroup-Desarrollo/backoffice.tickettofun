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
        $this->active = array('class' => 'label label-success');
        $this->inactive = array('class' => 'label label-danger');
    }

    public function get_list()
    {
        $this->db->close();
        $table_content = $this->Page->get_settings('config');

        $rol_id = $this->session->userdata('rol_id');

        if ($rol_id != 1 && $rol_id != 2 && $rol_id != 3)
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
        $endpoint = HOST . GET_ALLOTMENTS_ROUTE;

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

    public function get_table_html($id) //arrive_id of slug
    {
        $this->db->close();
        $table_content = $this->Page->get_settings('schedules');
        $table_content = $this->build->build_components(
            $table_content['SCHEDULE_TABLE']
        );

        $this->model = str_replace('{rows}', $this->model, $table_content);
        return /* array(  */$this->model /* ) */;
    }

    public function get_form($slug = null, $option = null)
    {
        $this->db->close();
        $contents = $this->Page->get_settings($option);

        $form = 'CONFIG_FORM';
        if ($slug == 'filters')
        {
            $form = 'CONFIG_FORM_FILTERS';
        }
        else if ($slug == 'schedule_filters')
        {
            $form = 'SCHEDULE_FORM_FILTERS';
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
                $endpoint = HOST . GET_ALLOTMENTS_ROUTE . '/' . $slug . '/' . $id;
            break;
            case 'ship':
                $endpoint = HOST . GET_ALLOTMENTS_ROUTE . '/' . $slug . '/' . $id;
            break;
            default:
                $endpoint = HOST . GET_ALLOTMENTS_ROUTE . '/' . $id;
            break;

        }

        $endpoint = HOST . GET_ALLOTMENTS_ROUTE . '/' . $id;

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

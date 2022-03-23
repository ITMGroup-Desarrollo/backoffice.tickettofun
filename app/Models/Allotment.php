<?php
namespace App\Models;

use CodeIgniter\Model;
use App\Libraries\Api;
use App\Libraries\Build;

use stdClass;

/**
* Client Class
*
* @package CodeIgniter
* @category Models
* @Author ITM Dev Team
* @Since Version 1.0.0
*/
class Allotment extends Model
{
    public $api;
    public $page;
    public $build;
    public $model;
    public $active;
    public $attrib;
    public $session;
    public $inactive;
    public $anchor_attrib;

    public function __construct()
    {
        parent::__construct();

        $this->api     = new Api();
        $this->build   = new Build();
        $this->page    = new \App\Models\Page();
        $this->session = \Config\Services::session();

        $this->model    = '';
        $this->attrib   = array('class' => 'center');
        $this->active   = array('class' => LABEL_SUCCESS);
        $this->inactive = array('class' => LABEL_DANGER);
    }

    public function get_list()
    {
        $rol_id        = $this->session->get('rol_id');
        $table_content = $this->page->get_settings('config');

        if ($rol_id != 1 && !in_array('g_allotments', $this->session->get('permissions')))
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

        if (isset($_POST['dates']) && $_POST['dates'] != '')
        {
            $dates = explode('to',$_POST['dates']);
        } else {
            $dates[0] = date('Y-m-d');
        }

        $token              = $this->session->get('token');
        $endpoint           = GET_ALLOTMENTS_ROUTE;
        $params->start_date = $dates[0];

        $response = json_decode(
            $this->api->request_api('POST', $endpoint, $params, $token)
        );

        $data_headerbar= [];
        if ($response->code == 200)
        {
            $rows           = $response->message;
            $data_headerbar = $rows[0];
        }

        $this->model = str_replace('{rows}', $this->model, $table_content);

        return array(
            'table-data'  => $this->model,
            'data-header' => $data_headerbar
        );
    }

    public function get_list_clone()
    {
        $table_content = $this->page->get_settings('clone');

        $table         = $table_content['CLONE_ALLOTMENT_TABLE'];
        $table_content = $this->build->build_components($table);

        $this->model = str_replace('{rows}', '', $table_content);

        return $this->model;
    }

    public function get_list_allotment_update()
    {
        $table_content = $this->page->get_settings('allotments-config');

        $table         = $table_content['ALLOTMENT_CONFIG_TABLE'];
        $table_content = $this->build->build_components($table);

        $this->model = str_replace('{rows}', '', $table_content);

        return $this->model;
    }

    public function get_table_html($id) //arrive_id of slug
    {
        $table_content = $this->page->get_settings('schedules');
        $table_content = $this->build->build_components(
            $table_content['SCHEDULE_TABLE']
        );

        $this->model = str_replace('{rows}', $this->model, $table_content);

        return $this->model;
    }

    public function get_form($slug = null, $option = null)
    {
        $contents = $this->page->get_settings($option);

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

    public function get_data($id, $slug = '')
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

        $endpoint = GET_ALLOTMENTS_ROUTE . '/' . $id; // TODO: Review why endpoint ignores slug cases

        $params = new stdClass();
        $token  = $this->session->get('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        $config = new stdClass();

        if ($response->code == 200)
        {
            $config->id             = $response->message->allotment_id;
            $config->channel        = $response->message->channel_id;
            $config->reseller       = $response->message->reseller_id;
            $config->arrive_id      = $response->message->arrive_id;
            $config->service        = $response->message->service_id;
            $config->cruise         = $response->message->ship_id;
            $config->start_date     = $response->message->start_date;
            $config->end_date       = $response->message->end_date;
            $config->schedule_start = $response->message->schedule_start;
            $config->schedule_end   = $response->message->schedule_end;
            $config->overlap        = $response->message->overlap;
            $config->shared         = $response->message->shared_schedule;
            $config->private        = $response->message->private_service;
            $config->min_available  = $response->message->min_available;
            $config->max_available  = $response->message->max_available;
            $config->available      = $response->message->available;
            $config->active         = $response->message->active_status;
            $config->stand_by       = $response->message->stand_by;

        }

        return $config;
    }

    public function get_arrive_data($id, $date)
    {
        $token     = $this->session->get('token');
        $endpoints = GET_ARRIVES_ROUTE . '/ship/' . $id;

        $params             = new stdClass();
        $params->end_date   = $date;
        $params->start_date = $date;

        $response = json_decode(
            $this->api->request_api("POST", $endpoints, $params, $token)
        );

        $config = new stdClass();

        if ($response->code == 200)
        {
            $arrive               = $response->message[0];

            $arrive_date    = date('h:i', strtotime($arrive->arrival_time_markup));
            $departure_date = date('h:i', strtotime($arrive->departure_time_markup));

            $config->id           = $arrive->arrive_id;
            $config->code         = 200;
            $config->vendor       = $arrive->reseller_id;
            $config->cruise       = $arrive->ship_id;
            $config->channel      = $arrive->channel_id;
            $config->vendor_name  = $arrive->reseller_name;
            $config->cruise_name  = $arrive->ship_name;
            $config->arrival_date = $arrive->arrival_date;
            $config->channel_name = $arrive->channel_name;
            $config->arrival_time = $arrive_date . " - " . $departure_date;
        }
        else
        {
            $config->code         = $response->code;
        }

        return $config;
    }

    public function get_data_id($type, $id)
    {
        $endpoints = getenv('apiHost');

        switch($type)
        {
            case 'reseller':
                $endpoints .= GET_RESELLERS_ROUTE . '/' . $id;
            break;
            case 'cruise':
                $endpoints .= GET_SHIPS_ROUTE . '/' . $id;
            break;
        }

        $token  = $this->session->get('token');
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

        } else
        {
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

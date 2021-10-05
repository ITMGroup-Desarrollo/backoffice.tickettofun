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
class Arrive extends Model
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
       
        $table_content = $this->page->get_settings('arrives');

        $table_content = $this->build->build_components(
            $table_content['ARRIVES_TABLE']
        );

        $this->model = str_replace('{rows}', $this->model, $table_content);

        return $this->model;
    }

    public function get_form($option = null)
    {
        $contents = $this->page->get_settings('arrives');

        $form = 'ARRIVES_FORM';
        if ($option == 'search')
        {
            $form = 'ARRIVES_FORM_SEARCH';
        }

        $this->model = $this->build->build_components(
            $contents[$form]
        );

        return $this->model;
    }

    public function get_data($id, $slug = '')
    {
        $params   = new stdClass();
        $endpoint = GET_ARRIVES_ROUTE . '/' . $id;

        if ($slug == 'arriveallotment')
        {
            $params->start_date = date('Y-m-d');
            $endpoint           = GET_ARRIVES_ROUTE . '/' . $slug . '/' . $id;
        }

        $token = $this->session->get('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        $arrives = new stdClass();

        if ($response->code == 200)
        {
            $arrives->id            = $response->message->arrive_id;
            $arrives->ship_name     = $response->message->ship_name;
            $arrives->channel_id    = $response->message->channel_id;
            $arrives->reseller_id   = $response->message->reseller_id;
            $arrives->channel_name  = $response->message->channel_name;
            $arrives->reseller_name = $response->message->reseller_name;
            
            $arrives->active                = $response->message->active_status;
            $arrives->ship_id               = $response->message->ship_id;
            $arrives->markup_end            = $response->message->markup_end;
            $arrives->arrival_date          = $response->message->arrival_date;
            $arrives->markup_start          = $response->message->markup_start;
            $arrives->arrival_time          = $response->message->arrival_time;           
            $arrives->departure_time        = $response->message->departure_time;
            $arrives->arrival_time_markup   = $response->message->arrival_time_markup;
            $arrives->departure_time_markup = $response->message->departure_time_markup;
        }
        else
        {
            redirect('allotments/arrives');
        }

        return $arrives;
    }

    public function get_list_allotments()
    {
        $table_content = $this->page->get_settings('arrives');

        $table_content = $this->build->build_components(
            $table_content['ALLOTMENTS_ON_ARRIVES_TABLE']
        );

        $this->model = str_replace('{rows}', '', $table_content);

        return $this->model;
    }
}

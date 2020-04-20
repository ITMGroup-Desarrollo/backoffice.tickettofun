<?php

/**
* Client Class
*
* @package CodeIgniter
* @category Models
* @Author ITM Dev Team
* @Since Version 1.0.0
*/
class Arrive extends CI_Model
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
        $table_content = $this->Page->get_settings('arrives');

        $table_content = $this->build->build_components(
            $table_content['ARRIVES_TABLE']
        );

        $this->model = str_replace('{rows}', $this->model, $table_content);

        return $this->model;
    }

    public function get_form($option = null)
    {
        $this->db->close();
        $contents = $this->Page->get_settings('arrives');

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
        $params = new stdClass();
        switch($slug){
            case 'arriveallotment':
                $endpoint = HOST . GET_ARRIVES_ROUTE . '/' . $slug . '/' . $id;
                $params->start_date = date('Y-m-d');
                break;
            default:
                $endpoint = HOST . GET_ARRIVES_ROUTE . '/' . $id; break;
        }

        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        $arrives = new stdClass();

        if ($response->code == 200)
        {
            $arrives->id = $response->message->arrive_id;

            $arrives->channel_id = $response->message->channel_id;
            $arrives->channel_name = $response->message->channel_name;
            $arrives->reseller_id = $response->message->reseller_id;
            $arrives->reseller_name = $response->message->reseller_name;
            $arrives->ship_name = $response->message->ship_name;

            $arrives->ship_id = $response->message->ship_id;
            $arrives->arrival_date = $response->message->arrival_date;
            $arrives->arrival_time = $response->message->arrival_time;
            $arrives->arrival_time_markup = $response->message->arrival_time_markup;
            $arrives->departure_time = $response->message->departure_time;
            $arrives->departure_time_markup = $response->message->departure_time_markup;
            $arrives->markup_start = $response->message->markup_start;
            $arrives->markup_end = $response->message->markup_end;
            $arrives->active = $response->message->active_status;

        }
        else
        {
            redirect('allotments/arrives');
        }

        return $arrives;
    }

    public function get_list_allotments()
    {
        $this->db->close();
        $table_content = $this->Page->get_settings('arrives');

        $table_content = $this->build->build_components(
            $table_content['ALLOTMENTS_ON_ARRIVES_TABLE']
        );

        $this->model = str_replace('{rows}', '', $table_content);

        return $this->model;
    }


    public function get_formbtn()
    {
        $this->db->close();
        $contents = $this->Page->get_settings('arrives');

        $form = 'ALLOTMENTS_FORM';

        $this->model = $this->build->build_components(
            $contents[$form]
        );

        return $this->model;
    }


}

<?php

/**
* Client Class
*
* @package CodeIgniter
* @category Models
* @Author ITM Dev Team
* @Since Version 1.0.0
*/
class Allotment_reservation extends CI_Model
{
    public $model;
    public $active;
    public $attrib;
    public $inactive;
    public $pending;
    public $anchor_attrib;

    public function __construct()
    {
        $this->model = '';
        parent::__construct();

        $this->attrib = array('class' => 'center');
        $this->active = array('class' => 'label label-success');
        $this->inactive = array('class' => 'label label-danger');
        $this->pending = array('class' => 'label label-warning');

    }

    public function get_list()
    {
        $this->db->close();
        $table_content = $this->Page->get_settings('allotments');

        $rol_id = $this->session->userdata('rol_id');

        if ($rol_id != 1 && $rol_id != 2 && $rol_id != 3)
        {
            $table = $table_content['ALLOTMENT_RESERVATIONS_TABLE'];

            array_splice($table->contents[0]->contents->contents, 10, 1);
            array_splice($table->contents[2]->contents->contents, 10, 1);

            $table_content['ALLOTMENT_RESERVATIONS_TABLE'] = $table;
        }

        $table_content = $this->build->build_components(
            $table_content['ALLOTMENT_RESERVATIONS_TABLE']
        );

        $this->model = str_replace('{rows}', '', $table_content);

        return $this->model;
    }

    public function get_form($option = null)
    {
        $this->db->close();
        $contents = $this->Page->get_settings('allotments');

        $form = 'ALLOTMENT_RESERVATIONS_FORM';
        if ($option == 'search')
        {
            $form = 'ALLOTMENTS_RESERVATIONS_FORM_SEARCH';
        }

        $this->model = $this->build->build_components(
            $contents[$form]
        );

        return $this->model;
    }

    public function get_data($id)
    {

        $endpoint = HOST . GET_ALLOTMENT_RESERVATIONS_ROUTE . '/' . $id;

        $params = new stdClass();
        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        $allotment_reservatoin = new stdClass();

        if ($response->code == 200)
        {
            $allotment_reservatoin->pax = $response->message->pax;
            $allotment_reservatoin->id = $response->message->reservation_id;
            $allotment_reservatoin->start_date = $response->message->start_date;
            $allotment_reservatoin->max_available = $response->message->max_available;
            $allotment_reservatoin->process_status = $response->message->process_status;
            $allotment_reservatoin->process_status_id = $response->message->process_status_id;
        }
        else
        {
            redirect('/allotments/list');
        };

        return $allotment_reservatoin;
    }
}

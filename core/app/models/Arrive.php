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

        // Call API here!
        $params = new stdClass();
        $endpoint = HOST . GET_ARRIVES_ROUTE;

        $this->load->library('session');
        $token = $this->session->userdata('token');
        $response = json_decode(
            $this->api->request_api('POST', $endpoint, $params, $token)
        );

        if ($response->code == 200)
        {
            $rows = $response->message;
            foreach ($rows as $row)
            {

                $aux = $schedule = '';
                $this->anchor_attrib = array();

                $aux .= custom('td', '', $row->reseller_name);
                $aux .= custom('td', '', $row->ship_name);
                $aux .= custom('td', '', $row->arrival_date);
                $aux .= custom('td', '', $row->arrival_time);
                $aux .= custom('td', '', $row->departure_time);
                $aux .= custom('td', '', $row->markup_start);
                $aux .= custom('td', '', $row->markup_end);

                $status = '';
                $delete = '';
                if ($row->active_status == 1)
                {
                    $this->active['data-status'] = $row->arrive_id;
                    $status = custom('span', $this->active, 'Active');
                }
                else
                {
                    $this->inactive['data-status'] = $row->arrive_id;
                    $status = custom('span', $this->inactive, 'Inactive');
                }

                $status_attrib = $this->attrib;
                $aux .= custom('td', $status_attrib, $status);

                $params = array();
                $params['start_date'] = $row->arrival_date;

                if ($row->arrive_config === 1)
                {
                    $path = 'allotments/configuration?ship='.$row->ship_id.'&date='.$row->arrival_date;
                    $this->anchor_attrib['class'] = 'schedule';
                    $this->anchor_attrib['href'] = base_url($path);
                    $schedule = custom('i', array('class' => 'fas fa-calendar-alt'), '');
                    $schedule = custom('a', $this->anchor_attrib, $schedule);
                }

                $path = 'arrives/' . $row->arrive_id;
                $this->anchor_attrib['class'] = 'edit';
                $this->anchor_attrib['href'] = base_url($path);
                $edit = custom('i', array('class' => 'fas fa-edit'), '');
                $edit = custom('a', $this->anchor_attrib, $edit);

                if ($row->active_status == 1)
                {
                    $this->anchor_attrib['href'] = '#';
                    $this->anchor_attrib['class'] = 'delete';
                    $this->anchor_attrib['data-id'] = $row->arrive_id;
                    $delete = custom('i', array('class' => 'fas fa-trash'), '');

                    $delete = custom('a', $this->anchor_attrib, $delete);
                }

                $aux .= custom('td', $this->attrib, $schedule . $edit . $delete);

                $this->model .= custom('tr', '', $aux);
            }
        }

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

    public function get_data($id)
    {
        $endpoint = HOST . GET_ARRIVES_ROUTE . '/' . $id;

        $params = new stdClass();
        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );
        $arrives = new stdClass();

        if ($response->code == 200)
        {
            $arrives->id = $response->message->arrive_id;
            $arrives->ships = $response->message->ship_id;
            $arrives->arrival_date = $response->message->arrival_date;
            $arrives->arrival_time = $response->message->arrival_time;
            $arrives->departure_time = $response->message->departure_time;
            $arrives->markup_start = $response->message->markup_start;
            $arrives->markup_end = $response->message->markup_end;
            $arrives->active = $response->message->active_status;

        }else{
            redirect('allotments/arrives');
        }

        return $arrives;
    }

    public function get_data_json($data)
    {
        $endpoint = HOST . GET_ARRIVES_ROUTE;
        $arriveJson = array();

        if (!empty($data['reseller']) && empty($data['ship']))
        {
            $endpoint .= '/reseller/' . $data['reseller'];
        }
        else if(!empty($data['reseller']) && !empty($data['ship']))
        {
            $endpoint .= '/ship/' . $data['ship'];
        }

        $dateArrive = explode('to', $data['dates']);

        $params = new stdClass();
        $params = array("start_date" => (empty($dateArrive[0])?null:trim($dateArrive[0])),
                        "end_date" => (empty($dateArrive[1])?null:trim($dateArrive[1])));

        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('POST', $endpoint, $params, $token)
        );

        if ($response->code == 200)
        {
            $rows = $response->message;

            foreach ($rows as $row)
            {
                $status = '<span class="label label-' . ($row->active_status == 1?'success':'danger') . '" data-status="' . $row->arrive_id . '">' . ($row->active_status == 1?'Active':'Inactive') . '</span>';
                $action = '<a class="edit" href="' . $row->arrive_id . '">
                                <i class="fas fa-edit"></i>
                           </a>';

                if ($row->active_status == 1) {
                    $action .= '<a class="delete" href="#" data-id="'. $row->arrive_id .'">
                                    <i class="fas fa-trash"></i>
                                </a>';
                }

                $arriveJson[] = array('reseller' => $row->reseller_name,
                                      'ship' => $row->ship_name,
                                      'arrival_date' =>  $row->arrival_date,
                                      'arrival_time' => $row->arrival_time,
                                      'departure_time' => $row->departure_time,
                                      'markup_start' => $row->markup_start,
                                      'markup_end' => $row->markup_end,
                                      'status' => $status,
                                      'action' => $action);
            }
        }

        echo json_encode($arriveJson);
    }

    public function get_ships_list($id)
    {
        $endpoint = HOST . GET_ARRIVES_ROUTE.'/shipsarrive/' . $id;
        $arriveJson = array();

        $params = new stdClass();
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
                $arriveJson[] = array("id" => $row->ship_id,
                                      "ship" => $row->ship_name);
            }
        }

        echo json_encode($arriveJson);
    }

}

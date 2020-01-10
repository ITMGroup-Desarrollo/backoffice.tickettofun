<?php

/**
* Arrives Class
*
* @package CodeIgniter
* @category Models
* @Author ITM Dev Team
* @Since Version 1.0.0
*/
class Calendar extends CI_Model
{
    public $model;

    public function __construct()
    {
        $this->model = '';
        parent::__construct();
    }

    public function get_arrives()
    {
        $this->db->close();

        // Call API here!
        $params = new stdClass();
        $endpoint = HOST . GET_ARRIVES_ROUTE;

        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('POST', $endpoint, $params, $token)
        );

        $events = array();
        if ($response->code == 200)
        {
            $rows = $response->message;

            foreach ($rows as $row)
            {
                $event = new stdClass();
                $event->title = $row->ship_name;

                $arrival_date = strtotime($row->arrival_date . ' ' . $row->arrival_time);
                $departure_date = strtotime($row->arrival_date . ' ' . $row->departure_time);

                $event->start = date("c", $arrival_date);
                $event->end = date("c", $departure_date);
                $event->allDay = false;

                $events[] = $event;
            }
        }

        $events = "window.eventData = " . json_encode($events) . PHP_EOL;
        $script = custom('script', array('type' => 'text/javascript'), $events);

        return $script;
    }
}

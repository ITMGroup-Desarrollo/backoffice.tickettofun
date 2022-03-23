<?php
namespace App\Models;

use CodeIgniter\Model;
use App\Libraries\Api;
use App\Libraries\Build;

use stdClass;

/**
* Arrives Class
*
* @package CodeIgniter
* @category Models
* @Author ITM Dev Team
* @Since Version 1.0.0
*/
class Calendar extends Model
{
    public $api;
    public $model;
    public $session;

    public function __construct()
    {
        $this->model = '';
        parent::__construct();

        $this->api     = new Api();
        $this->session = \Config\Services::session();
    }

    public function get_arrives()
    {
        // Call API here!
        $params   = new stdClass();
        $endpoint = GET_ARRIVES_ROUTE;

        $token = $this->session->get('token');

        $response = json_decode(
            $this->api->request_api('POST', $endpoint, $params, $token)
        );

        $events = array();
        if ($response->code == 200)
        {
            $rows = $response->message;

            foreach ($rows as $row)
            {
                // TODO:  Fix store procedure to evaluate active_status
                if ($row->active_status == 1)
                {
                    $event        = new stdClass();
                    $event->title = $row->reseller_name . PHP_EOL . $row->ship_name;

                    if ($row->arrival_time == '0' || $row->arrival_time == '') {
                        $row->arrival_time   = '00:00:00';
                        $row->departure_time = '00:00:00';
                    }

                    $arrival_date   = strtotime($row->arrival_date . ' ' . $row->arrival_time);
                    $departure_date = strtotime($row->arrival_date . ' ' . $row->departure_time);

                    $event->end    = date("c", $departure_date);
                    $event->start  = date("c", $arrival_date);

                    $event->allDay = false;

                    $events[] = $event;
                }
            }
        }

        $events = "window.eventData = " . json_encode($events) . PHP_EOL;
        $script = custom('script', array('type' => 'text/javascript'), $events);

        return $script;
    }
}

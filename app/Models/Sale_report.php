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
* @author ITM Dev Team
* @since Version 1.0.0
*/
class Sale_report extends Model
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
        $table_content = $this->page->get_settings('sale-reports');

        $table = $table_content['SALES_TABLE'];
        if ($rol_id != 1 && !in_array('g_sale_reports', $this->session->get('permissions')))
        {
            $limit = count($table->contents[0]->contents->contents) - 1;

            array_splice($table->contents[0]->contents->contents, $limit, 1);
            array_splice($table->contents[2]->contents->contents, $limit, 1);
        }

        $table_content = $this->build->build_components($table);

        // Call API here!
        $params   = new stdClass();
        $endpoint = GET_BOOKINGS_DATE_ROUTE;
        $params->start_date = date('Y-m-d');
        $params->end_date = date('Y-m-d');

        $token = $this->session->get('token');

        $response = json_decode(
            $this->api->request_api('POST', $endpoint, $params, $token)
        );

        if ($response->code == 200)
        {
            $rows = $response->message;

            foreach ($rows as $row)
            {
                $aux = '';
                $this->anchor_attrib = array();

                $aux .= custom('td', '', $row->booking_reference);
                $aux .= custom('td', '', $row->service_name);
                $aux .= custom('td', '', $row->schedule_start);
                $aux .= custom('td', '', $row->pax_name);
                $aux .= custom('td', '', $row->quantity);


                $status = '';
                $delete = '';
                if ($row->status_name == 'Confirmed')
                {
                    $status = custom('span', $this->active, $row->status_name);
                }
                else
                {
                    $status = custom('span', $this->inactive, $row->status_name);
                }

                $status_attrib                = $this->attrib;
                $status_attrib['data-status'] =  $row->booking_id;

                $aux .= custom('td', $status_attrib, $status);

                $this->model .= custom('tr', '', $aux);
            }
        }
        else
        {
            $aux = '';
            for ($i = 0; $i < 6; $i++) {
                $aux .= custom('td', '', '');
            }

            $this->model = custom('tr', '', $aux);
        }

        $this->model = str_replace('{rows}', $this->model, $table_content);

        return $this->model;
    }

    public function get_form($form='')
    {
        $contents = $this->page->get_settings('sale-reports');

        if(empty($form))
            $form = 'SALES_TABLE';

        switch($form){
            case 'filters':
                $form = 'SALES_FORM_FILTERS';
            break;
        }

        $this->model = $this->build->build_components(
            $contents[$form]
        );

        return $this->model;
    }

    public function get_sales($start_date,$end_date){

        // Call API here!
        $params   = new stdClass();
        $endpoint = GET_BOOKINGS_DATE_ROUTE;
        $params->start_date = $start_date;
        $params->end_date = $end_date;

        $token = $this->session->get('token');

        $response = json_decode(
            $this->api->request_api('POST', $endpoint, $params, $token)
        );

        if ($response->code == 200)
            return $response->message;

        return null;

    }
}

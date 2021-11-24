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
class Booth extends Model
{
    public $model;
    public $active;
    public $attrib;
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
        $table_content = $this->page->get_settings('booths');

        $table_content = $this->build->build_components(
            $table_content['BOOTHS_TABLE']
        );

        // Call API here!
        $params   = new stdClass();
        $endpoint = GET_BOOTHS_ROUTE;

        $token = $this->session->get('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        if ($response->code == 200)
        {
            $rows = $response->message;

            foreach ($rows as $row)
            {
                $aux                 = '';
                $this->anchor_attrib = array();

                $aux .= custom('td', '', $row->booth_name);
                $aux .= custom('td', '', $row->location_name);

                $status = '';
                $delete = '';
                if ($row->active_status == 1)
                {
                    $status = custom('span', $this->active, 'Active');
                }
                else
                {
                    $status = custom('span', $this->inactive, 'Inactive');
                }

                $status_attrib                = $this->attrib;
                $status_attrib['data-status'] =  $row->booth_id;

                $aux .= custom('td', $status_attrib, $status);

                $path = 'booths/' . $row->booth_id;

                $this->anchor_attrib['class'] = 'edit';
                $this->anchor_attrib['href']  = base_url($path);
                
                $edit = custom('i', array('class' => 'fas fa-edit'), '');
                $edit = custom('a', $this->anchor_attrib, $edit);

                if ($row->active_status == 1) {
                    $this->anchor_attrib['href']    = '#';
                    $this->anchor_attrib['class']   = 'delete';
                    $this->anchor_attrib['data-id'] = $row->booth_id;

                    $delete = custom('i', array('class' => 'fas fa-trash'), '');
                    $delete = custom('a', $this->anchor_attrib, $delete);
                }

                $aux .= custom('td', $this->attrib, $edit . $delete);

                $this->model .= custom('tr', '', $aux);
            }
        }
        else
        {
            $aux = '';
            for ($i = 0; $i < 3; $i++) {
                $aux .= custom('td', '', '');
            }
            
            $this->model = custom('tr', '', $aux);
        }

        $this->model = str_replace('{rows}', $this->model, $table_content);

        return $this->model;
    }

    public function get_form($frmName="")
    {
        $contents = $this->page->get_settings('booths');

        if(empty($frmName))
            $frmName = "BOOTHS_FORM";

        $this->model = $this->build->build_components(
            $contents[$frmName]
        );

        return $this->model;
    }

    public function get_rep_data()
    {
        $params   = new stdClass();
        $endpoint = GET_REPS_ROUTE;

        $token = $this->session->get('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        $sales_rep = new stdClass();

        if ($response->code == 200)
        {
            $sales_rep = $response->message;
        }
        else
        {
            redirect('/booths/list');
        }

        return $sales_rep;
    }

    public function get_data($id)
    {
        $params   = new stdClass();
        $booth = new stdClass();
        $endpoint = GET_BOOTHS_ROUTE . '/' . $id;

        $token = $this->session->get('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        if ($response->code == 200)
        {
            $booth->response = $response->message->response;
            $booth->booth_id = $response->message->booth_id;
            $booth->booth_name = $response->message->booth_name;
            $booth->location_id = $response->message->location_id;
            $booth->location_name = $response->message->location_name;
            $booth->active_status = $response->message->active_status;
           
        }
        else
        {
            redirect('/booths/list');
        }

        return $booth;
    }

    public function clearObjt(array $objectCart)
    {
        $format = array();
        foreach($objectCart as $valueCart)
        {
            array_push($format, $valueCart);
        }
        return $format;
    }
}

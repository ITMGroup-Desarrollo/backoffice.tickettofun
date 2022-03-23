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
class Service extends Model
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
        $table_content = $this->page->get_settings('services');

        $table = $table_content['SERVICES_TABLE'];
        if ($rol_id != 1 && !in_array('g_services', $this->session->get('permissions')))
        {
            $limit = count($table->contents[0]->contents->contents) - 1;

            array_splice($table->contents[0]->contents->contents, $limit, 1);
            array_splice($table->contents[2]->contents->contents, $limit, 1);
        }

        $table_content = $this->build->build_components($table);

        // Call API here!
        $params   = new stdClass();
        $endpoint = GET_SERVICES_ROUTE;

        $token = $this->session->get('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        if ($response->code == 200)
        {
            $rows = $response->message;

            foreach ($rows as $row)
            {
                $aux = '';
                $this->anchor_attrib = array();

                $aux .= custom('td', '', $row->service_name);
                $aux .= custom('td', '', $row->location_name);
                $aux .= custom('td', '', $row->duration);
                $aux .= custom('td', $this->attrib, $row->min_available_num);
                $aux .= custom('td', $this->attrib, $row->max_available_num);

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

                $status_attrib = $this->attrib;
                $status_attrib['data-status'] =  $row->service_id;
                $aux .= custom('td', $status_attrib, $status);

                if ($rol_id == 1 || in_array('u_services', $this->session->get('permissions')))
                {
                    $path = 'services/' . $row->service_id;
                    
                    $this->anchor_attrib['class'] = 'edit';
                    $this->anchor_attrib['href']  = base_url($path);

                    $edit = custom('i', array('class' => 'fas fa-edit'), '');
                    $edit = custom('a', $this->anchor_attrib, $edit);
                }

                if ($rol_id == 1 || in_array('d_services', $this->session->get('permissions')))
                {
                    if ($row->active_status == 1) 
                    {
                        $this->anchor_attrib['href']    = '#';
                        $this->anchor_attrib['class']   = 'delete';
                        $this->anchor_attrib['data-id'] = $row->service_id;
                    
                        $delete = custom('i', array('class' => 'fas fa-trash'), '');
                        $delete = custom('a', $this->anchor_attrib, $delete);
                    }

                    $aux .= custom('td', $this->attrib, $edit . $delete);
                }

                $this->model .= custom('tr', '', $aux);
            }
        }
        else
        {
            $aux = '';
            for ($i = 0; $i < 7; $i++)
            {
                $aux .= custom('td', '', '');
            }

            $this->model = custom('tr', '', $aux);
        }

        $this->model = str_replace('{rows}', $this->model, $table_content);

        return $this->model;
    }

    public function get_form()
    {
        $contents = $this->page->get_settings('services');

        $this->model = $this->build->build_components(
            $contents['SERVICES_FORM']
        );

        return $this->model;
    }

    public function get_data($id)
    {
        $params = new stdClass();
        $endpoint = GET_SERVICES_ROUTE . '/' . $id;

        $token = $this->session->get('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        $service = new stdClass();

        if ($response->code == 200)
        {
            $service->id       = $response->message->service_id;
            $service->max      = $response->message->min_available_num;
            $service->min      = $response->message->max_available_num;
            $service->name     = $response->message->service_name;
            $service->active   = $response->message->active_status;
            $service->location = $response->message->location_id;
            $service->duration = $response->message->duration;
            
        }

        return $service;
    }
}

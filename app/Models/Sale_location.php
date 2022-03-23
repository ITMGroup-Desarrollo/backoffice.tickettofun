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
class Sale_location extends Model
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
        $table_content = $this->page->get_settings('sale-locations');

        $table = $table_content['SALE_LOCATIONS_TABLE'];
        if ($rol_id != 1 && !in_array('g_sale_locations', $this->session->get('permissions')))
        {
            $limit = count($table->contents[0]->contents->contents) - 1;

            array_splice($table->contents[0]->contents->contents, $limit, 1);
            array_splice($table->contents[2]->contents->contents, $limit, 1);
        }

        $table_content = $this->build->build_components($table);

        // Call API here!
        $params   = new stdClass();
        $endpoint = GET_SALE_LOCATION_ROUTE;

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

                $aux .= custom('td', '', $row->name);
                $aux .= custom('td', '', $row->unity_name);
                $aux .= custom('td', '', $row->code);

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
                $status_attrib['data-status'] =  $row->sale_location_id;
                
                $aux .= custom('td', $status_attrib, $status);

                if ($rol_id == 1 || in_array('u_sale_locations', $this->session->get('permissions')))
                {
                    $path = 'sale-locations/' . $row->sale_location_id;
                
                    $this->anchor_attrib['class'] = 'edit';
                    $this->anchor_attrib['href']  = base_url($path);
                
                    $edit = custom('i', array('class' => 'fas fa-edit'), '');
                    $edit = custom('a', $this->anchor_attrib, $edit);
                }
                if ($rol_id == 1 || in_array('d_sale_locations', $this->session->get('permissions')))
                {
                    if ($row->active_status == 1) 
                    {
                        $this->anchor_attrib['href']    = '#';
                        $this->anchor_attrib['class']   = 'delete';
                        $this->anchor_attrib['data-id'] = $row->sale_location_id;
                    
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
            for ($i = 0; $i < 5; $i++) {
                $aux .= custom('td', '', '');
            }

            $this->model = custom('tr', '', $aux);
        }

        $this->model = str_replace('{rows}', $this->model, $table_content);

        return $this->model;
    }

    public function get_form()
    {
        $contents = $this->page->get_settings('sale-locations');

        $this->model = $this->build->build_components(
            $contents['SALE_LOCATIONS_FORM']
        );

        return $this->model;
    }

    public function get_data($id)
    {
        $params   = new stdClass();
        $endpoint = GET_SALE_LOCATION_ROUTE . '/' . $id;

        $token = $this->session->get('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );
        $location = new stdClass();

        if ($response->code == 200)
        {
            $location->id        = $response->message->sale_location_id;
            $location->name      = $response->message->name;
            $location->unity     = $response->message->unity_id;
            $location->code = $response->message->code;
            $location->active    = $response->message->active_status;
        }
        else
        {
            redirect('/sale-locations/list');
        }

        return $location;
    }
}

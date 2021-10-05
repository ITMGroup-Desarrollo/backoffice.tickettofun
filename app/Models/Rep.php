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
class Rep extends Model
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
        $table_content = $this->page->get_settings('reps');

        $table_content = $this->build->build_components(
            $table_content['REPS_TABLE']
        );

        // Call API here!
        $params   = new stdClass();
        $endpoint = GET_REPS_ROUTE;

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

                $aux .= custom('td', '', $row->first_name);
                $aux .= custom('td', '', $row->last_name);
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
                $status_attrib['data-status'] =  $row->rep_id;

                $aux .= custom('td', $status_attrib, $status);

                $path = 'reps/' . $row->rep_id;

                $this->anchor_attrib['class'] = 'edit';
                $this->anchor_attrib['href']  = base_url($path);

                $edit = custom('i', array('class' => 'fas fa-edit'), '');
                $edit = custom('a', $this->anchor_attrib, $edit);

                if ($row->active_status == 1) 
                {
                    $this->anchor_attrib['href']    = '#';
                    $this->anchor_attrib['class']   = 'delete';
                    $this->anchor_attrib['data-id'] = $row->rep_id;
                
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

    public function get_form()
    {
        $contents = $this->page->get_settings('reps');

        $this->model = $this->build->build_components(
            $contents['REPS_FORM']
        );

        return $this->model;
    }

    public function get_data($id)
    {
        $params   = new stdClass();
        $endpoint = GET_REPS_ROUTE . '/' . $id;

        $token = $this->session->get('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        $sales_rep = new stdClass();

        if ($response->code == 200)
        {
            $sales_rep->id          = $response->message->rep_id;
            
            $booth_id = 0;
            if (isset($response->message->rep_id) && !empty($response->message->rep_id))
            {
                $response->message->rep_id;
            }

            $sales_rep->active      = $response->message->active_status;
            $sales_rep->user_id     = $response->message->user_id;
            $sales_rep->code_rep    = $response->message->code;
            $sales_rep->booth_id    = $booth_id;
            $sales_rep->last_name   = $response->message->last_name;
            $sales_rep->first_name  = $response->message->first_name;
            $sales_rep->email_addr  = $response->message->email_addr;
            $sales_rep->reseller_id = $response->message->reseller_id;
        }
        else
        {
            redirect('/reps/list');
        }

        return $sales_rep;
    }
}

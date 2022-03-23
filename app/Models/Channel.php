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
class Channel extends Model
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
        $table_content = $this->page->get_settings('channels');

        if ($rol_id != 1 && !in_array('g_channels', $this->session->get('permissions')))
        {
            $table = $table_content['CHANNELS_TABLE'];

            array_splice($table->contents[0]->contents->contents, 2, 1);
            array_splice($table->contents[2]->contents->contents, 2, 1);

            $table_content['CHANNELS_TABLE'] = $table;
        }

        $table_content = $this->build->build_components(
            $table_content['CHANNELS_TABLE']
        );

        // Call API here!
        $params   = new stdClass();
        $endpoint = GET_CHANNELS_ROUTE;
        
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

                $aux .= custom('td', '', $row->channel_name);

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
                $status_attrib['data-status'] =  $row->channel_id;

                $aux .= custom('td', $status_attrib, $status);

                if ($rol_id == 1 || in_array('u_channels', $this->session->get('permissions')))
                {
                    $path = 'channels/' . $row->channel_id;

                    $this->anchor_attrib['class'] = 'edit';
                    $this->anchor_attrib['href']  = base_url($path);
                    
                    $edit = custom('i', array('class' => 'fas fa-edit'), '');
                    $edit = custom('a', $this->anchor_attrib, $edit);
                }
                if ($rol_id == 1 || in_array('d_channels', $this->session->get('permissions')))
                {
                    if ($row->active_status == 1) 
                    {
                        $this->anchor_attrib['href']    = '#';
                        $this->anchor_attrib['class']   = 'delete';
                        $this->anchor_attrib['data-id'] = $row->channel_id;
                
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
        $contents = $this->page->get_settings('channels');

        $this->model = $this->build->build_components(
            $contents['CHANNELS_FORM']
        );

        return $this->model;
    }

    public function get_data($id)
    {
        $params   = new stdClass();
        $channel  = new stdClass();
        $endpoint = GET_CHANNELS_ROUTE . '/' . $id;

        $token = $this->session->get('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        if ($response->code == 200)
        {
            $channel->id       = $response->message->channel_id;
            $channel->name     = $response->message->channel_name;
            $channel->active   = $response->message->active_status;
        }
        else
        {
            redirect('/channels/list');
        }

        return $channel;
    }
}

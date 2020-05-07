<?php

/**
* Client Class
*
* @package CodeIgniter
* @category Models
* @author ITM Dev Team
* @since Version 1.0.0
*/
class Channel extends CI_Model
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
        $table_content = $this->Page->get_settings('channels');

        $rol_id = $this->session->userdata('rol_id');

        if (!in_array('g_channels', $this->session->userdata('permissions')))
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
        $params = new stdClass();
        $endpoint = HOST . GET_CHANNELS_ROUTE;

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

                $status_attrib = $this->attrib;
                $status_attrib['data-status'] =  $row->channel_id;
                $aux .= custom('td', $status_attrib, $status);

                if (in_array('u_channels', $this->session->userdata('permissions')))
                {
                    $path = 'channels/' . $row->channel_id;
                    $this->anchor_attrib['class'] = 'edit';
                    $this->anchor_attrib['href'] = base_url($path);
                    $edit = custom('i', array('class' => 'fas fa-edit'), '');

                    $edit = custom('a', $this->anchor_attrib, $edit);
                }
                if (in_array('d_channels', $this->session->userdata('permissions')))
                {
                    if ($row->active_status == 1) {
                        $this->anchor_attrib['href'] = '#';
                        $this->anchor_attrib['class'] = 'delete';
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
            for ($i = 0; $i < 3; $i++)
                $aux .= custom('td', '', '');

            $this->model = custom('tr', '', $aux);
        }

        $this->model = str_replace('{rows}', $this->model, $table_content);

        return $this->model;
    }

    public function get_form()
    {
        $this->db->close();
        $contents = $this->Page->get_settings('channels');

        $this->model = $this->build->build_components(
            $contents['CHANNELS_FORM']
        );

        return $this->model;
    }

    public function get_data($id)
    {
        $endpoint = HOST . GET_CHANNELS_ROUTE . '/' . $id;

        $params = new stdClass();
        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        $channel = new stdClass();

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

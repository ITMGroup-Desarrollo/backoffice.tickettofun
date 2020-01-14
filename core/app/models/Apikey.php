<?php

/**
* Client Class
*
* @package CodeIgniter
* @category Models
* @Author ITM Dev Team
* @Since Version 1.0.0
*/
class Apikey extends CI_Model
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
        $table_content = $this->Page->get_settings('apikeys');

        $rol_id = $this->session->userdata('rol_id');

        $table = $table_content['APIKEYS_TABLE'];
        if ($rol_id != 1 && $rol_id != 2 && $rol_id != 3)
        {
            $limit = count($table->contents[0]->contents->contents) - 1;

            array_splice($table->contents[0]->contents->contents, $limit, 1);
            array_splice($table->contents[2]->contents->contents, $limit, 1);
        }

        $table_content = $this->build->build_components($table);

        // Call API here!
        $params = new stdClass();
        $endpoint = HOST . GET_APIKEYS_ROUTE;

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

                $aux .= custom('td', '', $row->key_description);
                $aux .= custom('td', '', $row->key_seq);
                $aux .= custom('td', '', $row->user_email);

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
                $status_attrib['data-status'] =  $row->id;
                $aux .= custom('td', $status_attrib, $status);

                if ($rol_id == 1)
                {
                    $path = 'apikeys/' . $row->id;
                    $this->anchor_attrib['class'] = 'edit';
                    $this->anchor_attrib['href'] = base_url($path);
                    $edit = custom('i', array('class' => 'fas fa-edit'), '');

                    $edit = custom('a', $this->anchor_attrib, $edit);

                    if ($row->active_status == 1) {
                        $this->anchor_attrib['href'] = '#';
                        $this->anchor_attrib['class'] = 'delete';
                        $this->anchor_attrib['data-id'] = $row->id;
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
            for ($i = 0; $i < 5; $i++)
                $aux .= custom('td', '', '');

            $this->model = custom('tr', '', $aux);
        }

        $this->model = str_replace('{rows}', $this->model, $table_content);

        return $this->model;
    }

    public function get_form()
    {
        $this->db->close();
        $contents = $this->Page->get_settings('apikeys');

        $this->model = $this->build->build_components(
            $contents['APIKEYS_FORM']
        );

        return $this->model;
    }

    public function get_data($id)
    {
        $endpoint = HOST . GET_APIKEYS_ROUTE . '/' . $id;

        $params = new stdClass();
        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        $apikey = new stdClass();

        if ($response->code == 200)
        {
            $apikey->id               = $response->message->id;
            $apikey->key              = $response->message->key_seq;
            $apikey->description      = $response->message->key_description;
            $apikey->email            = $response->message->user_email;
            $apikey->active           = $response->message->active_status;

        }
        else
        {
            redirect('/apikeys/list');
        }

        return $apikey;
    }
}

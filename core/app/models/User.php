<?php

/**
* Client Class
*
* @package CodeIgniter
* @category Models
* @Author ITM Dev Team
* @Since Version 1.0.0
*/
class User extends CI_Model
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
        $this->active = array('class' => LABEL_SUCCESS);
        $this->inactive = array('class' => LABEL_DANGER);
    }

    public function get_list()
    {
        $this->db->close();
        $table_content = $this->Page->get_settings('users');

        $rol_id = $this->session->userdata('rol_id');

        $table = $table_content['USERS_TABLE'];
        if ($rol_id != 1 && !in_array('g_users', $this->session->userdata('permissions')))
        {
            $limit = count($table->contents[0]->contents->contents) - 1;

            array_splice($table->contents[0]->contents->contents, $limit, 1);
            array_splice($table->contents[2]->contents->contents, $limit, 1);
        }

        $table_content = $this->build->build_components($table);

        // Call API here!
        $params = new stdClass();
        $endpoint = GET_USERS_ROUTE;

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

                $aux .= custom('td', '', $row->first_name);
                $aux .= custom('td', '', $row->last_name);
                $aux .= custom('td', '', $row->rol_name);
                $aux .= custom('td', '', $row->email_addr);

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
                $status_attrib['data-status'] =  $row->user_id;
                $aux .= custom('td', $status_attrib, $status);

                if ($rol_id == 1 || in_array('u_users', $this->session->userdata('permissions')))
                {
                    $path = 'users/' . $row->user_id;
                    $this->anchor_attrib['class'] = 'edit';
                    $this->anchor_attrib['href'] = base_url($path);
                    $edit = custom('i', array('class' => 'fas fa-edit'), '');

                    $edit = custom('a', $this->anchor_attrib, $edit);
                }

                if ($rol_id == 1 || in_array('d_users', $this->session->userdata('permissions')))
                {
                    if ($row->active_status == 1) {
                        $this->anchor_attrib['href'] = '#';
                        $this->anchor_attrib['class'] = 'delete';
                        $this->anchor_attrib['data-id'] = $row->user_id;
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
            for ($i = 0; $i < 4; $i++)
                $aux .= custom('td', '', '');

            $this->model = custom('tr', '', $aux);
        }

        $this->model = str_replace('{rows}', $this->model, $table_content);

        return $this->model;
    }

    public function get_form()
    {
        $this->db->close();
        $contents = $this->Page->get_settings('users');

        $this->model = $this->build->build_components(
            $contents['USERS_FORM']
        );

        return $this->model;
    }

    public function get_data($id)
    {
        $endpoint = GET_USERS_ROUTE . '/' . $id;

        $params = new stdClass();
        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        $user = new stdClass();

        if ($response->code == 200)
        {
            $user->id            = $response->message->user_id;
            $user->rol           = $response->message->rol_id;
            $user->first_name    = $response->message->first_name;
            $user->last_name     = $response->message->last_name;
            $user->email_addr    = $response->message->email_addr;
            $user->active        = $response->message->active_status;
        }
        else
        {
            redirect('/users/list');
        }

        return $user;
    }
}

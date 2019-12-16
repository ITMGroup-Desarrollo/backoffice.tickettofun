<?php

/**
* Client Class
*
* @package CodeIgniter
* @category Models
* @Author ITM Dev Team
* @Since Version 1.0.0
*/
class Account_profile extends CI_Model
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

    public function get_form()
    {
        $this->db->close();
        $contents = $this->Page->get_settings('profile');

        $this->model .= $this->build->build_components(
            $contents['ACCOUNT_PROFILE_FORM']
        );

        $this->model = str_replace('{id}', 'account-profile', $this->model);

        return $this->model;
    }

    public function get_data($id)
    {
        $endpoint = HOST . GET_USERS_ROUTE . '/' . $id;

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
            $user->avatar        = $response->message->avatar;
        }

        return $user;
    }
}

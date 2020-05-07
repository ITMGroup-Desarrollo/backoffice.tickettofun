<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
* User session class
*
* Handle user session
*
* @package CodeIgniter
* @subpackage Libraries
* @category Session
* @author ITM Dev Team
* @since Version 1.0.0
*/
class User_session
{
    protected $CI;

    public function __construct()
    {
        $this->CI =& get_instance();
    }

    /**
    * Set user information user on session
    *
    * @param json user credentials
    * @return int code
    */
    public function set_session($credentials)
    {
        $this->CI->load->library('session');

        $user_data = array(
            'user_id'   => $credentials->user->user_id,
            'user_name' => $credentials->user->user_name,
            'rol_id'    => $credentials->user->rol_id,
            'token'     => $credentials->token,
            'avatar'    => $credentials->user->avatar,
            'page_default' => $credentials->user->page_default,
            'permissions' => $this->get_permissions($credentials->user->permissions)
        );

        $this->CI->load->helper('cookie');
        if ($credentials->remember == 1)
        {
          set_cookie('mail', $credentials->email, strtotime('+30 days'));
        }
        else
        {
          delete_cookie('mail');
        }

        $this->CI->session->set_userdata($user_data);

        return 200;
    }

    /**
    * Validate if exist an active session
    *
    * @return bool
    */
    public function active_session()
    {
        $active = FALSE;

        $this->CI->load->library('session');
        $active = ($this->CI->session->userdata('user_id')) ? TRUE : FALSE;

        return $active;
    }

    private function get_permissions($data_permissions){
        
        $permissions = array();

        for ($ipermissions=0; $ipermissions < count($data_permissions); $ipermissions++) {
            $permissions[$ipermissions] = $data_permissions[$ipermissions]->menu_name;
        }

        return $permissions;
    }
}

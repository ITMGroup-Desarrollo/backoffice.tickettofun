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
            'permissions' => $this->_get_permissions($credentials->user->permissions)
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

    public function get_actions($table) {
        return $this->_get_actions_elements($table);
    }

    private function _get_permissions($data_permissions) {

        $permissions = array();

        for ($i = 0; $i < count($data_permissions); $i++) {
            $permissions[$i] = $data_permissions[$i]->menu_name;
        }

        return $permissions;
    }

    /**
    * Validate permissions on table
    *
    * @param string table name
    * @return array permissions on table an actions buttons
    */
    private function _get_actions_elements($table) {
        $this->CI->load->library('session');

        $anchor_attrib = array();

        $permissions = array(
            'g' => 0,
            'gElement' => '',
            'i' => 0,
            'iElement' => '',
            'u' => 0,
            'uElement' => '',
            'd' => 0,
            'dElement' => '',
            'statusElement' => ''
        );

        $status_attrib = array(
            'class' => 'badge badge-{status}',
            'data-status' => '{status_value}'
        );

        $permissions['statusElement'] = custom('span', $status_attrib, '{s_text}');

        $rol = $this->CI->session->userdata('rol_id');

        $get = "g_{table}";
        $insert = "i_{table}";
        $update = "u_{table}";
        $delete = "d_{table}";

        if ($rol == 1 || in_array($get, $this->CI->session->userdata('permissions'))) {
            $permissions['g'] = 1;
        }

        if ($rol == 1 || in_array($insert, $this->CI->session->userdata('permissions'))) {
            $permissions['i'] = 1;

            if ($table == 'arrives') {
                $anchor_attrib['class'] = 'schedule';
                $anchor_attrib['href'] = base_url() . 'allotments/itinerary/{id}';

                $itinerary = custom('i', array('class' => 'fas fa-calendar-alt'), '');
                $itinerary = custom('a', $anchor_attrib, $itinerary);

                $anchor_attrib['class'] = 'clone';
                $anchor_attrib['href'] = base_url() . 'allotments/clone/{id}';

                $clone = custom('i', array('class' => 'fas fa-clone'), '');
                $clone = custom('a', $anchor_attrib, $clone);

                $permissions['iElement'] = $clone . $itinerary;
            }
        }

        if ($rol == 1 || in_array($update, $this->CI->session->userdata('permissions'))) {
            $permissions['u'] = 1;
            $anchor_attrib['class'] = 'edit';
            $anchor_attrib['href'] = base_url() . 'arrives/{id}';

            $edit = custom('i', array('class' => 'fas fa-edit'), '');
            $edit = custom('a', $anchor_attrib, $edit);

            $permissions['uElement'] = $edit;
        }

        if ($rol == 1 || in_array($delete, $this->CI->session->userdata('permissions'))) {
            $permissions['d'] = 1;

            $anchor_attrib['href'] = '#';
            $anchor_attrib['class'] = 'delete';
            $anchor_attrib['data-id'] = '{id}';

            $delete = custom('i', array('class' => 'fas fa-trash'), '');
            $delete = custom('a', $anchor_attrib, $delete);

            $permissions['dElement'] = $delete;
        }

        return $permissions;
    }
}

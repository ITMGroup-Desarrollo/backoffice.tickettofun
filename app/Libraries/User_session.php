<?php
namespace App\Libraries;

use Config\Services;

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
    protected $session;

    public function __construct()
    {
        $this->session = Services::session();
    }

    /**
    * Set user information user on session
    *
    * @param json user credentials
    * @return int code
    */
    public function set_session($credentials)
    {
        $user_data = array(
            'user_id'      => $credentials->user->user_id,
            'user_name'    => $credentials->user->user_name,
            'rol_id'       => $credentials->user->rol_id,
            'token'        => $credentials->token,
            'avatar'       => $credentials->user->avatar,
            'page_default' => $credentials->user->page_default,
            'permissions'  => $this->_get_permissions($credentials->user->permissions),
            'business_unities' => $credentials->user->business_unities,
        );

        if ($credentials->remember == 1)
        {
          set_cookie('mail', $credentials->email, strtotime('+30 days'));
        }
        else
        {
          delete_cookie('mail');
        }

        $this->session->set($user_data);

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
        $active = ($this->session->get('user_id')) ? TRUE : FALSE;

        return $active;
    }

    public function get_business_unities_params(): string
    {
        $businessUnities = '';
        if (count($this->session->get('business_unities')) > 0) {
            $values = '';
            $businessUnities = $this->session->get('business_unities');

            foreach ($businessUnities as $businessUnit) {
                $values .= $businessUnit->unity_id.',';
            }

            $unities = trim($values, ',');

            $businessUnities = http_build_query(['filter[unities]' => $unities]);
        }

        return $businessUnities;
    }

    public function get_business_unties_element($witLabel = true, $selected = '', $form = ''): string
    {
        $businessUnitElement = '';

        if (count($this->session->get('business_unities')) > 0) {
            $label = '';

            $labelClass = ['class' => 'mr-2'];
            $divClass =  ['class' => 'form-group mr-sm-3 form-bussines-unities'];

            switch ($form) {
                case 'wrapper':
                    $divClass =  ['class' => 'form-group row form-bussines-unities'];
                    $labelClass = ['class' => 'col-sm-2 col-md-2 control-label'];
                    break;
                case 'inline':
                    $divClass =  ['class' => 'form-inline mr-sm-3 mb-5 form-bussines-unities'];
                    break;
                case 'calendar':
                        $divClass =  ['class' => 'form-inline my-2 form-bussines-unities'];
                        break;
                default:
                    break;
            }

            if ($witLabel) {
                $label = custom('label', $labelClass, 'Business unit');
            }

            $options = custom('option', ['value' => ''], '-- Choose option --');

            $businessUnities = $this->session->get('business_unities');
            foreach ($businessUnities as $businessUnit) {
                $attrib = [
                    'value' => $businessUnit->unity_id
                ];

                if ($selected == $businessUnit->unity_id) {
                    $attrib['selected'] = 'selected';
                }

                $options .= custom('option', $attrib, $businessUnit->unity_name);
            }

            $attrib = [
                'name' => 'business_unit',
                'class' => 'form-control',
            ];

            $select = custom('select', $attrib, $options);

            if ($form != 'inline') {
                $select =  custom(
                    'div',
                    ['class' => 'col-sm-10 col-md-8'],
                    $select
                );
            }

            $businessUnitElement = custom(
                'div',
                $divClass,
                $label.$select
            );
        }

        return $businessUnitElement;
    }

    public function get_actions($table)
    {
        return $this->_get_actions_elements($table);
    }

    private function _get_permissions($data_permissions)
    {
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
    private function _get_actions_elements($table)
    {
        $anchor_attrib = array();

        $permissions = array(
            'g'             => 0,
            'gElement'      => '',
            'i'             => 0,
            'iElement'      => '',
            'u'             => 0,
            'uElement'      => '',
            'd'             => 0,
            'dElement'      => '',
            's'       => 0,
            'statusElement' => ''
        );

        $status_attrib = array(
            'class'       => 'badge badge-{status}',
            'data-status' => '{status_value}'
        );

        $permissions['statusElement'] = custom('span', $status_attrib, '{s_text}');

        $rol = $this->session->get('rol_id');

        $get    = "g_{$table}";
        $insert = "i_{$table}";
        $update = "u_{$table}";
        $delete = "d_{$table}";
        $schedule = "s_{$table}";

        if ($rol == 1 || in_array($get, $this->session->get('permissions')))
        {
            $permissions['g'] = 1;
        }

        if ($rol == 1 || in_array($insert, $this->session->get('permissions')))
        {
            $permissions['i'] = 1;

            if ($table == 'arrives')
            {
                $anchor_attrib['class'] = 'schedule';
                $anchor_attrib['href']  = base_url() . '/allotments/itinerary/{id}';

                $itinerary = custom('i', array('class' => 'fas fa-calendar-alt'), '');
                $itinerary = custom('a', $anchor_attrib, $itinerary);

                $anchor_attrib['class'] = 'clone';
                $anchor_attrib['href']  = base_url() . '/allotments/clone/{id}';

                $clone = custom('i', array('class' => 'fas fa-clone'), '');
                $clone = custom('a', $anchor_attrib, $clone);

                $permissions['iElement'] = $clone . $itinerary;
            }
        }

        if ($rol == 1 || in_array($update, $this->session->get('permissions')))
        {
            $permissions['u']       = 1;
            $anchor_attrib['class'] = 'edit';
            $anchor_attrib['href']  = base_url() . '/arrives/{id}';

            $edit = custom('i', array('class' => 'fas fa-edit'), '');
            $edit = custom('a', $anchor_attrib, $edit);

            $permissions['uElement'] = $edit;
        }

        if ($rol == 1 || in_array($delete, $this->session->get('permissions'))) {
            $permissions['d'] = 1;

            $anchor_attrib['href']    = '#';
            $anchor_attrib['class']   = 'delete';
            $anchor_attrib['data-id'] = '{id}';

            $delete = custom('i', array('class' => 'fas fa-trash'), '');
            $delete = custom('a', $anchor_attrib, $delete);

            $permissions['dElement'] = $delete;
        }

        if ($rol == 1 || in_array($schedule, $this->session->get('permissions'))) {
            $permissions['s'] = 1;
        }

        return $permissions;
    }
}

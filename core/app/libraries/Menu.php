<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
* Menu class
*
* @package Seal CMS
* @subpackage Libraries
* @category Menu
* @since Version 1.0.0
*/

class Menu {

    protected $CI;

    public $menu;
    public $sub_menu;
    public $arrow_attrib;
    public $anchor_attrib;    

    public function __construct()
    {
        $this->CI =& get_instance();

        $this->menu = '';
        $this->sub_menu = '';

        $this->anchor_attrib = array(
            'href' => '',
            'class'  => ''
        );

        $this->arrow_attrib = array('class' => 'fa fa-chevron-down');
    }

    public function get($options)
    {
        $menu = '';

        $this->CI->load->database();
        $this->CI->load->library('session');

        $values = array(
            $this->CI->session->userdata('rol_id'),
            $this->CI->session->userdata('user_id')
        );

        $query_result = $this->CI->db->query('CALL get_menu(?,?)', $values);

        if ($query_result->num_rows())
        {
            $result = $query_result->result();
            $this->CI->db->close();

            $grouper = '';
            $grouper_title = '';
            $nav_bar = '{current_user}';
            foreach ($result as $row)
            {
                if (empty($grouper_title))
                    $grouper_title = $row->grouper_name;

                if ($grouper_title != $row->grouper_name)
                {
                    $menu = custom('ul', '', $menu);
                    $nav_bar .= custom('div', array('class' => 'menu-section'),
                        $grouper . $menu
                    );

                    $menu = '';
                    $grouper_title = $row->grouper_name;
                }

                $grouper = custom($row->container_html, '', $grouper_title);
                $menu .= $this->_get_menu($row, $options);
            }

            if ( ! empty($menu))
            {
                $menu = custom('ul', '', $menu);
                $nav_bar .= custom('div', array('class' => 'menu-section'),
                    $grouper . $menu
                );
            }
        }

        $this->menu = $nav_bar . '{bottom_menu}';

        return $this->menu;
    }

    private function _get_menu($options, $actives)
    {
        $this->menu          ='';
        $this->anchor_attrib = array();

        $links  = explode(',', trim($options->pages, ','));
        $menus  = explode(',', trim($options->menus, ','));
        $glyphs = explode(',', trim($options->glyphs, ','));

        for ($i = 0; $i < count($links); $i++)
        {
            $glyph = '';
            if ( ! empty($glyphs[$i]))
                $glyph = custom('i', array('class' => $glyphs[$i]));

            $menu = custom('span', '', $menus[$i]);

            $submenu_active = '';
            if (strtolower($menus[$i]) == $actives[0])
            {
                $submenu_active = $actives[1];
                $this->anchor_attrib['class'] = 'active';
            }

            $sub_menu = '';
            if ( ! empty($options->sub_menus))
            {
                $sub_menu = $this->_get_submenu($options, $submenu_active);
                $this->anchor_attrib['href'] = '#';
                $this->anchor_attrib['data-toggle'] = "sidebar";
            }
            else
            {
                $this->anchor_attrib['href'] = base_url($links[$i]);
            }

            $menu .= custom('i', $this->arrow_attrib, '');
            $menu = custom('a', $this->anchor_attrib, $glyph . $menu);

            $menu .= $sub_menu;
            $this->menu .= custom('li', '', $menu);
        }

        return $this->menu;
    }

    private function _get_submenu($options, $active)
    {
        $menus = '';
        $this->sub_menu = '';

        $menu_names = explode(',', trim($options->sub_menus, ''));
        $links      = explode(',', trim($options->sub_pages, ''));

        for ($i = 0; $i < count($links); $i++)
        {
            $option = '/' . strtolower($menu_names[$i]);

            $anchor_attrib = array();
            if (strtolower($menu_names[$i]) == $active)
                $anchor_attrib['class'] = 'active';

            $anchor_attrib['href'] = base_url($links[$i] . $option);

            $menu = custom('a', $anchor_attrib, $menu_names[$i]);
            $menu = custom('li', '', $menu);

            $menus .= $menu;
       }

        $this->sub_menu = custom(
            'ul',
            array('class' => 'submenu'),
            $menus
        );

        return $this->sub_menu;
    }
}

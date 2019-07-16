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
    public $li_attrib;
    public $nav_attrib;
    public $anchor_attrib;

    public function __construct()
    {
        $this->CI =& get_instance();

        $this->menu = '';
        $this->sub_menu = '';

        $this->anchor_attrib = array(
            'href' => '',
            'css'  => ''
        );

        $this->li_attrib  = array('class' => 'nav-item pcoded-hasmenu');
        $this->nav_attrib = array('class' => 'nav pcoded-inner-navbar');
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
            $nav_bar = '';
            $grouper_title = '';
            foreach ($result as $row)
            {
                if (empty($grouper_title))
                    $grouper_title = $row->grouper_name;

                if ($grouper_title != $row->grouper_name)
                {
                    $nav_bar .= $grouper . $menu;

                    $menu = '';
                    $grouper_title = $row->grouper_name;
                }

                $grouper = custom($row->container_html, '', $grouper_title);
                $grouper = custom(
                    'li',
                    array('class' => 'nav-item pcoded-menu-caption'),
                    $grouper
                );

                $menu .= $this->_get_menu($row, $options);
            }

            if ( ! empty($menu))
                $nav_bar .= $grouper . $menu;
        }

        $this->menu = custom('ul', $this->nav_attrib, $nav_bar);

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
            $this->anchor_attrib['class']  = 'nav-link';

            $glyph = '';
            if ( ! empty($glyphs[$i]))
            {
                $glyph = custom('i', array('class' => $glyphs[$i]));
                $glyph = custom(
                    'span',
                    array('class' => 'pcoded-micon'),
                    $glyph
                );
            }

            $menu = custom(
                'span',
                array('class' => 'pcoded-mtext'),
                $menus[$i]
            );

            $submenu_active = '';
            if (strtolower($menus[$i]) == $actives[0])
            {
                $submenu_active = $actives[1];
                $this->li_attrib['class'] .= ' active pcoded-trigger';
            }
            else
            {
                $this->li_attrib['class'] = 'nav-item pcoded-hasmenu';
            }


            $sub_menu = '';
            if ( ! empty($options->sub_menus))
            {
                $sub_menu = $this->_get_submenu($options, $submenu_active);
                $this->anchor_attrib['href'] = '#';
            }
            else
            {
                $this->anchor_attrib['href'] = base_url($links[$i]);
            }

            $menu = custom('a', $this->anchor_attrib, $glyph . $menu);

            $menu .= $sub_menu;
            $this->menu .= custom('li', $this->li_attrib, $menu);
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

            $li_attrib = array();
            if (strtolower($menu_names[$i]) == $active)
            {
                $li_attrib = array(
                    'class' => 'active'
                );
            }

            $this->anchor_attrib['href'] = base_url($links[$i] . $option);

            $menu = custom('a', $this->anchor_attrib, $menu_names[$i]);
            $menu = custom('li', $li_attrib, $menu);

            $menus .= $menu;
       }

        $this->sub_menu = custom(
            'ul',
            array('class' => 'pcoded-submenu'),
            $menus
        );

        return $this->sub_menu;
    }
}

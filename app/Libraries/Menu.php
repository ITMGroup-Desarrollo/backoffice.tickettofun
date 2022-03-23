<?php
namespace App\Libraries;

/**
* Menu class
*
* @package Seal CMS
* @subpackage Libraries
* @category Menu
* @since Version 1.0.0
*/

class Menu 
{
    public $db;
    public $menu;
    public $session;
    public $sub_menu;
    public $arrow_attrib;
    public $anchor_attrib;

    public function __construct()
    {
        $this->menu     = '';
        $this->sub_menu = '';

        $this->anchor_attrib = array(
            'href'  => '',
            'class' => ''
        );

        $this->arrow_attrib = array('class' => 'fas fa-chevron-down');

        $this->db      = \Config\Database::connect();
        $this->session = \Config\Services::session();
    }

    public function get($options)
    {
        $menu          = '';
        $nav_bar       = '';
        $grouper       = '';
        $grouper_title = '';

        $values = array(
            $this->session->get('user_id')
        );

        $result = $this->db->query('CALL get_menu(?)', [$values]);

        foreach ($result->getResult() as $row)
        {
            if (empty($grouper_title))
                $grouper_title = $row->grouper_name;

            if ($grouper_title != $row->grouper_name)
            {
                $menu = custom('ul', '', $menu);
    
                $nav_bar .= custom('div', array('class' => 'menu-section'),
                    $grouper . $menu
                );

                $menu          = '';
                $grouper_title = $row->grouper_name;
            }

            $grouper = custom($row->container_html, '', $grouper_title);
    
            $menu .= $this->_get_menu($row, $options);
        }

        $result->freeResult();

        if ( ! empty($menu))
        {
            $menu = custom('ul', '', $menu);
    
            $nav_bar .= custom('div', array('class' => 'menu-section'),
                $grouper . $menu
            );
        }
    
        $this->menu = $nav_bar;

        return $this->menu;
    }

    private function _get_menu($options, $actives)
    {
        $this->menu = '';

        $links  = explode(',', trim($options->pages, ','));
        $menus  = explode(',', trim($options->menus, ','));
        $glyphs = explode(',', trim($options->glyphs, ','));

        for ($i = 0; $i < count($links); $i++)
        {
            $glyph = '';
            $this->anchor_attrib = array();

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

                $this->anchor_attrib['href']        = '#';
                $this->anchor_attrib['data-toggle'] = "sidebar";

                $menu .= custom('i', $this->arrow_attrib, '');
            }
            else
            {
                $this->anchor_attrib['href'] = base_url($links[$i]);
            }

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
            {
                $anchor_attrib['class'] = 'active';
            }
            
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

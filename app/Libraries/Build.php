<?php
namespace App\Libraries;

/**
* Build Content Class
*
* @package Seal CMS
* @subpackage Libraries
* @since Version 1.0.0
*/
class Build {

    protected $CI;

    public $page;
    public $menu;
    public $rol_id;
    public $session;
    public $submenu;
    public $columns;
    public $component;

    public function __construct()
    {
        $this->component = '';
        $this->session   = \Config\Services::session();
    }

    public function build_components($contents)
    {
        $content         = '';
        $this->component = '';

        $this->rol_id = $this->session->get('rol_id');

        // Validate object for correcty structure
        if ( ! is_object($contents))
            return '';

        if (is_array($contents->element))
            return '';

        if (property_exists($contents, 'withPrivilegies')) 
        {
            if ($contents->withPrivilegies == 'default') {
                if ($this->rol_id != 1 && !in_array('g_roles', $this->session->get('permissions'))) 
                {
                    return '';
                }
            }
            else if ($this->rol_id != 1 && $this->rol_id != $contents->withPrivilegies) {
                return '';
            }
        }

        $attrib  = $contents->attrib;
        $element = $contents->element;

        if (is_object($contents->attrib))
            $attrib = json_decode(json_encode($contents->attrib), true);

        if (is_object($contents->contents))
        {
            $content = $this->build_components($contents->contents);
            $this->component = $this->build_element($element, $attrib, $content);
        }
        else if (is_array($contents->contents))
        {
            if ($element == 'ul')
            {
                $li_elements = array();
                foreach ($contents->contents as $value) 
                {
                    $li_elements[] = $this->_get_element($value);
                }
                    
                $content .= $this->build_element(
                    $element
                    , $attrib
                    , $li_elements
                );
            }
            else if ($element == 'row') 
            {
                $content = $this->_get_row($attrib, $contents->contents);
            }
            else
            {
                foreach ($contents->contents as $value)
                {
                    $content .= $this->_get_element($value);
                }
            }

            if (! empty($element) && $element != 'ul')
            {
                $this->component = $this->build_element(
                    $element,
                    $attrib,
                    $content
                );
            }
            else
            {
                $this->component = $content;
            }
        }
        else
        {
            $this->component = $this->build_element(
                $element,
                $attrib,
                $contents->contents
            );
        }

        if (property_exists($contents, 'short_code'))
        {
            $data = array();
            $library = trim(trim($contents->short_code,'['), ']');

            if (count(explode('=', $library)) > 1)
            {
                $parts = explode('=', $library);

                $library = $parts[0];

                foreach (explode('|', $parts[1]) as $options)
                {
                    switch ($options)
                    {
                        case 'current_page':
                            $options = $this->page_name;
                            break;
                        case 'menu':
                            $options = $this->menu;
                            break;
                        case 'submenu':
                            $options = $this->submenu;
                            break;
                    }

                    $data[] = $options;
                }
            }

            $library = "App\\Libraries\\" . ucfirst($library);

            $short_code = new $library;

            if (count($data) > 0)
            {
                $content .= $short_code->get($data);
            }
            else
            {
                $content .= $short_code->get();
            }

            $this->component = $this->build_element($element, $attrib, $content);
        }

        return $this->component;
    }

    public function build_element($element, $attrib, $content)
    {
        switch ($element)
        {
            case 'anchor':
                return anchor('#', $content, $attrib);
                break;
            case 'ul':
                return ul($content, $attrib);
                break;
            case 'img':
                return img($attrib);
                break;
            case 'br':
                return str_repeat('<br />', $attrib['count']);
                break;
            case 'row':
                return custom('tr', '', $content);
                break;
            case 'custom-ul':
                return custom('ul', $attrib, $content);
                break;
            default:
                return custom($element, $attrib, $content);
                break;
        }
    }

    private function _get_row($attrib, $content)
    {
        $this->columns = '';
        $element = $attrib['column_tag'];

        foreach ($content as $row)
            $this->columns .= custom($element, '', $row);

        return $this->columns;
    }

    private function _get_element($value)
    {
        $element = '';
        if (is_object($value))
        {
            $element .= $this->build_components($value);
        }
        else
        {
            if (strpos($value, '{') !== FALSE
                && strpos($value, '}') !== FALSE)
            {
                $element .= $value;
            }
            else
            {
                $element .= $this->build_element('p', '', $value);
            }
        }

        return $element;
    }

    private function _get_library($library)
    {
        $this->CI->load->library($library);

        return $this->CI->$library;
    }
}

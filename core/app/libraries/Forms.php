<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
* Forms class
*
* @package Seal CMS
* @subpackage Libraries
* @category Form
* @since Version 1.0.0
*/

class Forms
{
    protected $CI;

    public $form;
    public $attrib;
    public $content_form;

    public function __construct()
    {
        $this->form = '';
        $this->content_form = '';

        $this->CI =& get_instance();
    }

    public function get($params = '')
    {
        $this->CI->load->database();

        $query        = 'CALL get_form(?)';
        $query_result = $this->CI->db->query($query, $params);

        if ($query_result->num_rows())
        {
            $result = $query_result->result();

            $query_result->free_result();
            $this->CI->db->close();

            foreach ($result as $row)
            {
                $extra = '';

                $this->attrib = $this->_get_attributes(
                    $row->element_attributes
                );

                if ($row->element_type == 'BUTTON')
                {
                    $extra = $row->label_name;
                    $row->label_name = '';
                }
                else if ($row->element_type == 'SELECT')
                {
                    $extra = $row->catalog_id;
                }

                $element = $this->_get_element($row->element_type, $extra);

                if ( ! empty($row->label_name))
                {
                    if ( ! empty($row->label_attributes))
                    {
                        $this->attrib = $this->_get_attributes(
                            $row->label_attributes
                        );
                    }

                    $label = form_label($row->label_name, '', $this->attrib);
                    $element = $label . $element;
                }

                if ( ! empty($row->content_tag))
                {
                    $this->attrib = $this->_get_attributes(
                        $row->content_attributes
                    );

                    if ( ! $this->_contains_array($this->attrib))
                    {
                        $this->content_form .= custom(
                            $row->content_tag,
                            $this->attrib,
                            $element
                        );
                    }
                    else
                    {
                        for ($i = 0; $i < count($this->attrib); $i++)
                        {
                            $element = custom(
                                $row->content_tag,
                                $this->attrib[$i],
                                $element
                            );
                        }

                        $this->content_form .= $element;
                    }
                }
                else
                {
                    $this->content_form .= $element;
                }

                $this->attrib = array();
            }
        }

        $this->form = $this->content_form;

        return $this->form;
    }

    public function get_catalog($catalog_id)
    {
        return $this->_get_catalog($catalog_id);
    }

    private function _contains_array($array)
    {
        foreach ($array as $item)
            if (is_array($item))
                return true;

        return false;
    }

    private function _get_attributes($json_object)
    {
        $attributes = array();

        $object = json_decode($json_object);

        if ( ! is_array($object))
        {
            foreach ($object as $key => $value)
              $attributes[$key] = $value;
        }
        else
        {
            for ($i = 0; $i < count($object); $i++)
            {
                foreach ($object[$i] as $key => $value)
                    $attributes[$i][$key] = $value;
            }

        }

        return $attributes;
    }

    private function _get_element($form_element, $extra = '')
    {
        $element = '';

        switch ($form_element)
        {
            case 'INPUT':
                $element = form_input($this->attrib);
                break;
            case 'CHECKBOX':
                $element = form_checkbox($this->attrib);
                break;
            case 'BUTTON':
                $element = custom('BUTTON', $this->attrib, $extra);
                break;
            case 'SELECT':
                $options = $this->_get_catalog($extra);
                $element = form_dropdown('', $options, '', $this->attrib);
                break;
        }

        $this->attrib = array();

        return $element;
    }

    private function _get_catalog($catalog_id)
    {
        $catalog = array();
        $options = array();

        $this->CI->db->close();
        $this->CI->load->database();

        $query = 'CALL get_catalog(?)';
        $query_result = $this->CI->db->query($query, $catalog_id);

        if ($query_result->num_rows())
        {
            $result  = $query_result->result();

            $query_result->free_result();
            $this->CI->db->close();

            foreach ($result as $row)
            {
                // Valid if value is not a ranges values
                if (count(explode(':', $row->option_value)) > 1)
                {
                    $range = explode(':', $row->option_value);
                    for($i = $range[0]; $i <= $range[1]; $i++)
                    {
                        $caption = $row->option_description;

                        if( $i == $range[0])
                            $options[$caption] = $caption;

                        $j = $i;
                        if ( $i < 10)
                            $j = '0' . $i;

                        $options[$j] = $j;
                    }

                    $catalog[] = $options;
                    $options = array();
                }
                else
                {
                    $options[$row->option_value] = $row->option_description;
                }
            }

        }

        if (count($catalog) > 1)
            return $catalog;

        return $options;
    }
}

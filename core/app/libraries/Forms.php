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
    public $form_attrib;
    public $content_form;
    public $button_attrib;
    public $wrapper_attrib;

    public function __construct()
    {
        $this->form = '';
        $this->form_attrib = '';
        $this->content_form = '';

        $this->wrapper_attrib = array('class' => 'col-sm-10 col-md-8');
        $this->button_attrib = array('class' => 'btn btn-default cancel');

        $this->CI =& get_instance();
    }

    public function get($params = '')
    {
        $this->content_form = '';
        $this->CI->load->database();

        $query        = 'CALL get_form(?)';
        $query_result = $this->CI->db->query($query, $params);

        $num_rows = $query_result->num_rows();
        $result   = $query_result->result();

        $query_result->free_result();
        $this->CI->db->close();

        if ($num_rows)
        {
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
                else if ($row->element_type == 'COMBOBOX')
                {
                    $extra = $row->catalog_id;
                }

                $element = $this->_get_element(
                    $row->element_type,
                    $extra,
                    $row->api_endpoint,
                    $row->keyvalue_pair,
                    $row->extra_name
                );

                if ( ! empty($row->label_name))
                {
                    if ( ! empty($row->label_attributes))
                    {
                        $this->attrib = $this->_get_attributes(
                            $row->label_attributes
                        );
                    }

                    if ($row->element_type == 'CHECKBOX')
                    {
                        $element .= custom(
                            'label',
                            $this->attrib,
                            $row->label_name
                        );
                    }
                    else if ($params[0] != 'signin' && $params[0] != 'update_call_extra')
                    {
                        $label = form_label($row->label_name, '', $this->attrib);
                        $wrapper = custom('div', $this->wrapper_attrib, $element);
                        $element = $label . $wrapper;
                    }
                    else
                    {
                        $label = form_label($row->label_name, '', $this->attrib);
                        $element = $label . $element;
                    }
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

        if ($params[0] != 'signin' && $params[0] != 'update_call_extra')
        {
            $typeForm = explode('_', $params[0]);

            $this->form_attrib = array(
                'class' => 'form-horizontal'
            );

            $this->button_attrib = array('class' => 'btn btn-default cancel');

            $this->CI->load->Model('Page');
            $this->CI->load->library('Build');

            $this->CI->db->close();

            $content = $this->CI->Page->get_settings('');
            $content = $this->CI->build->build_components(
                $content['BUTTONS_FORM']
            );

            if (in_array('search', $typeForm))
            {
                $this->form_attrib = array(
                    'class' => 'form-inline',
                    'method' => 'post',
                );

                $this->button_attrib['class'] = 'btn btn-success search';
                $buttons = custom('BUTTON', $this->button_attrib, 'Search');
            }
            else if ($params[0] == 'diary') {
                $buttons = '';
                $content = '';
            }
            else {
                $buttons = custom('BUTTON', $this->button_attrib, 'Cancel');

                $this->button_attrib['class'] = 'btn btn-success save';
                $buttons .= custom('BUTTON', $this->button_attrib, 'Save');
            }

            $content = str_replace('{buttons}', $buttons, $content);

            $this->content_form .= $content;
            $this->form = custom('form', $this->form_attrib, $this->content_form);
        }
        else
        {
            $this->form = $this->content_form;
        }

        return $this->form;
    }

    public function get_catalog($catalog_id, $api_endpoint, $keyvalue_pair, $extra_name, $type = 'normal')
    {
        if ( ! empty($api_endpoint))
            return $this->_get_catalog_api($api_endpoint, $keyvalue_pair, $extra_name, $type);

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

    private function _get_element($form_element, $extra = '', $api_endpoint = '',
        $keyvalue_pair = '', $extra_name = '')
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
            case 'COMBOBOX':
                $options = $this->get_catalog(
                    $extra,
                    $api_endpoint,
                    $keyvalue_pair,
                    $extra_name
                );

                if ( ! empty($extra_name))
                {
                    $element = custom('select', $this->attrib, $options);
                }
                else
                {
                    $element = form_dropdown('', $options, '', $this->attrib);
                }
                break;
            case 'MULTIPLE':
                $options = $this->get_catalog(
                    $extra,
                    $api_endpoint,
                    $keyvalue_pair,
                    $extra_name,
                    'multiple'
                );

                if ( ! empty($extra_name))
                {
                    $element = custom('select', $this->attrib, $options);
                }
                else
                {
                    $element = form_dropdown('', $options, '', $this->attrib);
                }
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

        $num_rows = $query_result->num_rows();
        $result   = $query_result->result();

        $query_result->num_rows();
        $this->CI->db->close();

        if ($num_rows)
        {
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

    private function _get_catalog_api($api_endpoint, $keyvalue_pair, $extra_name, $type)
    {
        $catalog = array();
        $options = array();
        $params = new stdClass();

        $key_value = explode(',', $keyvalue_pair);
        $name = $key_value[1];
        $value = $key_value[0];

        $endpoint = $api_endpoint;

        $this->CI->load->library('api');
        $this->CI->load->library('session');
        $token = $this->CI->session->userdata('token');

        $response = json_decode(
            $this->CI->api->request_api('GET', $endpoint, $params, $token)
        );

        $options[''] = ($type === 'normal' ? '-- Choose option --' : '');

        if ($response->code == 200)
        {
            $rows = $response->message;

            if ( ! empty($extra_name))
            {
                $options = "";
                if($type === 'normal')
                {
                    $options = custom('option', '', '-- Choose option --');
                }

                foreach ($rows as $row) {
                    $attrib = array();
                    if((int)$row->active_status === 1)
                    {
                        $attrib['value'] = $row->$value;
                        $attrib['data-value'] = $row->$extra_name;

                        $options .= custom('option', $attrib, $row->$name);
                    }
                }
            }
            else
            {
                foreach ($rows as $row) {
                    if((int)$row->active_status === 1)
                    {
                        $options[$row->$value] = $row->$name;
                    }
                }
            }
        }

        return $options;
    }
}

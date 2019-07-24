<?php

/**
* Page Class
*
* @package CodeIgniter
* @subpackage Seal CMS
* @category Models
* @Since Version 1.0.0
*/
class Page extends CI_Model
{
    public $logo = '';
    public $menu = '';
    public $metas = '';
    public $scripts = '';
    public $page_name = '';
    public $menu_active = '';
    public $settings = array();
    public $submenu_active = '';
    public $settings_values = '';


    public function __construct()
    {
        parent::__construct();
        $this->settings_values = '';
    }

    public function get_contents()
    {
        $contents = array();

        // Close open connections
        $this->db->close();
        $this->load->library('session');
        $user_name = $this->session->userdata('user_name');

        // If page need an special settings
        $this->settings_values .=  ',' . $this->page_name;

        $this->build->page_name = $this->page_name;

        $this->build->menu = $this->menu_active;
        $this->build->submenu = $this->submenu_active;

        $this->settings = $this->get_settings($this->settings_values);

        $this->metas = $this->_get_meta();
        $this->scripts = $this->_get_scripts();

        $title = ucwords($this->page_name) . ' :: ';

        if ( ! empty($this->settings['GLOBAL']->title))
          $title .= $this->settings['GLOBAL']->title;

        $favIcon = '';
        if ( ! empty($this->settings['GLOBAL']->favIcon))
        {
            $favIcon = link_tag(
                $this->settings['GLOBAL']->favIcon,
                'icon',
                'image/x-icon'
            );

            $this->logo = $this->settings['GLOBAL']->logo;
        }

        $body = '';
        if ($this->page_name != 'signin')
        {
            $build = $this->build;
            $body = $build->build_components($this->settings['BODY']);
            $current_user = $build->build_components($this->settings['ACCOUNT']);
            $bottom_menu = $build->build_components($this->settings['BOTTOM-MENU']);

            $current_user = str_replace('{user_name}', $user_name, $current_user);
            $body = str_replace('{current_user}', $current_user, $body);
            $body = str_replace('{bottom_menu}', $bottom_menu, $body);

            $components = $this->_get_components();
            $body = str_replace('{contents}', $components, $body);
        }
        else
        {
            $body = $this->_get_components();
        }

        $contents = array();
        $content['title']    = $title;
        $content['favicon']  = $favIcon;
        $content['metas']    = $this->metas;
        $content['id']       = $this->page_name;
        $content['scripts']  = $this->scripts['js'];
        $content['css']      = $this->scripts['css'];
        $content['contents'] = $body;

        return $content;
    }

    private function _get_meta()
    {
        $this->meta_tags = '';
        $this->load->database();

        $query = 'CALL get_meta(?)';

        $query_result = $this->db->query($query, $this->page_name);

        if ($query_result->num_rows())
        {
            foreach ($query_result->result() as $row)
            {
                $meta_array = array();

                if ($row->meta_type === 'name')
                {
                    $meta_array['name'] = $row->meta_value;
                }
                else
                {
                    $meta_array['type'] = $row->meta_type;
                    $meta_array['name'] = $row->meta_value;
                }

                if ($row->meta_content !== NULL)
                    $meta_array['content'] = $row->meta_content;

                $this->meta_tags .= meta($meta_array);
            }
        }

        $query_result->free_result();
        $this->db->close();

        $this->meta_tags = trim($this->meta_tags);

        return $this->meta_tags;
    }

    private function _get_scripts()
    {
        $this->load->database();

        $query = 'CALL get_scripts(?)';
        $query_result = $this->db->query($query, $this->page_name);

        $this->scripts = array(
            'css' => '',
            'js' => ''
        );

        if ($query_result->num_rows())
        {
            foreach ($query_result->result() as $row)
            {
                if ($row->script_type === 'CSS')
                {
                    if ( ! empty($row->code_description))
                    {
                        $this->scripts['css'] .= custom(
                            'style',
                            '',
                            $row->code_description
                        );
                    }
                    else
                    {
                        if (count(explode('http', $row->script_addr)) > 1)
                        {
                            $this->scripts['css'] .= link_tag(
                                $row->script_addr
                            );
                        }
                        else
                        {
                            $this->scripts['css'] .= link_tag(
                                base_url($row->script_addr)
                            );
                        }
                    }
                }
                else {
                    if ( ! empty($row->code_description))
                    {
                        $this->scripts['js'] .= custom(
                            'script',
                            '',
                            $row->code_description
                        );
                    }
                    else
                    {
                        $this->scripts['js'] .= custom(
                            'script',
                            array('src' => base_url($row->script_addr)),
                            ''
                        );
                    }
                }
            }

            $base_url = "window.baseUrl = '" . base_url() . "'" . PHP_EOL;
            $scripts = custom('script', '', $base_url) . $this->scripts['js'];

            if ($this->page_name != 'signin')
            {
                $this->load->library('session');
                $token = $this->session->userdata('token');

                $script = "window.token = '{$token}'";
                $token = custom('script', '', $script);

                $scripts .= $token;
            }

            $this->scripts['js'] = $scripts;
        }

        $query_result->free_result();
        $this->db->close();

        $this->scripts['js']  = trim($this->scripts['js']);
        $this->scripts['css'] = trim($this->scripts['css']);

        return $this->scripts;
    }

    public function get_settings($name)
    {
        return $this->_get_settings($name);
    }

    private function _get_settings($name)
    {
        $settings = [];
        $this->load->database();

        $query = 'CALL get_settings(?)';

        $query_result = $this->db->query($query, $name);

        if ($query_result->num_rows())
        {
            foreach ($query_result->result() as $row)
                $settings[$row->setting_name] = json_decode($row->setting_seq);
        }

        $query_result->free_result();
        $this->db->close();

        return $settings;
    }

    private function _get_components()
    {
        $contents = '';
        $this->load->database();

        $query = 'CALL get_contents(?)';
        $data  = array($this->page_name);

        $query_result = $this->db->query($query, $data);

        if ($query_result->num_rows())
        {
            $result = $query_result->result();

            $query_result->free_result();
            $this->db->close();

            foreach ($result as $row)
            {
                $description = json_decode($row->content_seq);
                $contents .= $this->build->build_components($description);
            }
        }

        if ($this->page_name == 'signin')
            $contents = str_replace('{y}', date('Y'), $contents);

        // Set logo
        $contents = str_replace('{logo}', $this->logo, $contents);

        return $contents;
    }
}

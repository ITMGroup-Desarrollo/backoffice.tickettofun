<?php
namespace App\Models;

use CodeIgniter\Model;
use App\Libraries\Build;

/**
* Page Class
*
* @package CodeIgniter
* @subpackage Seal CMS
* @category Models
* @Since Version 1.0.0
*/
class Page extends Model
{
    public $logo            = '';
    public $menu            = '';
    public $metas           = '';
    public $build;
    public $sesion;
    public $scripts         = '';
    public $settings        = array();
    public $page_name       = '';
    public $menu_active     = '';
    public $script_attrib   = array();
    public $submenu_active  = '';
    public $settings_values = '';

    public function __construct()
    {
        parent::__construct();

        $this->build   = new Build();
        $this->session = \Config\Services::session();

        $this->settings_values = '';
        $this->script_attrib   = array('type' => 'text/javascript');
    }

    public function get_contents()
    {
        $user_name   = $this->session->get('user_name');
        $user_avatar = getenv('avatarAddr') . 'generic.jpg';

        if ( ! empty($this->session->get('avatar'))) {
            $user_avatar = getenv('avatarAddr') . $this->session->get('avatar');
        }

        // If page need an special settings
        $this->settings_values .=  $this->page_name;

        $this->build->page_name = $this->page_name;

        $this->build->menu    = $this->menu_active;
        $this->build->submenu = $this->submenu_active;

        $this->settings = $this->get_settings($this->settings_values);

        $this->metas   = $this->_get_meta();
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
            $body         = $this->build->build_components($this->settings['BODY']);
            $menu_bar     = $this->build->build_components($this->settings['MENU_BAR']);
            $bottom_menu  = $this->build->build_components($this->settings['BOTTOM-MENU']);
            $icon_mobile  = $this->build->build_components($this->settings['MOBILE_ICON_MENU']);
            $current_user = $this->build->build_components($this->settings['ACCOUNT']);

            $current_user = str_replace('{base}', base_url(), $current_user);
            $current_user = str_replace('{user_name}',$user_name, $current_user);
            $current_user = str_replace('{img_avatar}', $user_avatar, $current_user);

            $body = str_replace('{bottom_menu}', $bottom_menu, $body);
            $body = str_replace('{current_user}', $current_user, $body);

            $components = $this->_get_components();

            $menu_bar_page = 'MENU_BAR_' . strtoupper($this->page_name);
            if (array_key_exists($menu_bar_page, $this->settings)) {
                $menu_bar = $this->build->build_components($this->settings[$menu_bar_page]);
            }

            $menu_bar = str_replace('{menu_icon_mobile}', $icon_mobile, $menu_bar);

            $components = $menu_bar . $components;
            $body = str_replace('{contents}', $components, $body);
        }
        else
        {
            $body = $this->_get_components();

            $str_aux = '';
            if (get_cookie('mail') != '')
                $str_aux = get_cookie('mail');

            $body = str_replace('{mail}', $str_aux, $body);
        }

        $content = array();
        $content['title']    = $title;
        $content['favicon']  = $favIcon;
        $content['metas']    = $this->metas;
        $content['id']       = $this->page_name;
        $content['scripts']  = $this->scripts['js'];
        $content['css']      = $this->scripts['css'];
        $content['contents'] = $body;

        return $content;
    }

    public function get_settings($name)
    {
        return $this->_get_settings($name);
    }

    private function _get_meta()
    {
        $this->meta_tags = '';

        $query  = 'CALL get_meta(?)';
        $result = $this->db->query($query, [$this->page_name]);

        foreach ($result->getResult() as $row)
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

        $result->freeResult();
        $this->meta_tags = trim($this->meta_tags);

        return $this->meta_tags;
    }

    private function _get_scripts()
    {
        $query  = 'CALL get_scripts(?)';
        $result = $this->db->query($query, [$this->page_name]);

        $this->scripts = array(
            'css' => '',
            'js' => ''
        );

        foreach ($result->getResult() as $row)
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
                        $this->script_attrib,
                        $row->code_description
                    );
                }
                else
                {
                    $attrib = $this->script_attrib;
                    $attrib['src'] = base_url($row->script_addr);

                    $this->scripts['js'] .= custom(
                        'script',
                        $attrib,
                        ''
                    );
                }
            }
        }

        $result->freeResult();

        $base_url = "window.baseUrl = '" . base_url() . "'" . PHP_EOL;

        $scripts = custom('script', $this->script_attrib, $base_url);
        $scripts .= $this->scripts['js'];

        if ($this->page_name != 'signin')
        {
            $api_host = getenv("apiHost");
            $token    = $this->session->get('token');

            $this->script_attrib = array('type' => 'text/javascript');

            $script = "window.token = '{$token}'\n";
            $script .= "window.api_host = '{$api_host}'";

            $api_config = custom('script', $this->script_attrib, $script);

            $scripts = $api_config . $scripts;
        }

        $this->scripts['js']  = $scripts;
        $this->scripts['js']  = trim($this->scripts['js']);
        $this->scripts['css'] = trim($this->scripts['css']);

        return $this->scripts;
    }

    private function _get_settings($name)
    {
        $settings = [];
        $query    = 'CALL get_settings(?)';
        $result   = $this->db->query($query, [$name]);

        foreach ($result->getResult() as $row){
            $settings[$row->setting_name] = json_decode($row->setting_seq);
        }

        $result->freeResult();

        return $settings;
    }

    private function _get_components()
    {
        $contents = '';
        $query    = 'CALL get_contents(?)';
        $data     = array($this->page_name);
        $result   = $this->db->query($query, $data);

        foreach ($result->getResult() as $row)
        {
            $description = json_decode($row->content_seq);
            $contents .= $this->build->build_components($description);
        }

        $result->freeResult();

        if ($this->page_name == 'signin')
            $contents = str_replace('{y}', date('Y'), $contents);

        // Set logo
        $contents = str_replace('{logo}', $this->logo, $contents);

        return $contents;
    }
}

<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Channels extends CI_Controller
{
    /**
    *Index page for this controller
    */
    public function index()
    {
        $this->load->library('user_session', NULL, 'user');

        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = $this->uri->segment(1);
        $option = $this->uri->segment(2);

        $this->load->Model('Page');
        $this->Page->page_name = $view;
        $this->Page->menu_active = 'sales channels';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('Channel');

        if ($option == 'list')
        {
            $table = $this->Channel->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of channels', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->Channel->get_form();
            $form = str_replace('{id}', 'add-channel', $form);

            $data['contents'] = str_replace(
                '{title}', 'New channel', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $channel = 'window.user_create_id = ' . $this->session->userdata('user_id');
            $script = custom('script', '', $channel);
            $data['scripts'] = $script .  $data['scripts'];
        }

        $this->load->view('Master', $data);
    }

    /**
    *Update page for this controller
    */
    public function update()
    {
        $this->load->library('user_session', NULL, 'user');

        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = $this->uri->segment(1);
        $option = $this->uri->segment(2);

        $this->load->Model('Page');
        $this->Page->page_name = $view;

        $data = $this->Page->get_contents();

        $this->load->Model('Channel');

        $form = $this->Channel->get_form();
        $form = str_replace('{id}', 'update-channel', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit channel', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $channel = $this->Channel->get_data($option);
        $channel = 'window.channel = ' . json_encode($channel);

        $script = custom('script', '', $channel);
        $data['scripts'] = $script .  $data['scripts'];

        $this->load->view('Master', $data);
    }
}

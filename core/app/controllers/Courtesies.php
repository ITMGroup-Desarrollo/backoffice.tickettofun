<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Courtesies extends CI_Controller
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
        $this->Page->menu_active = 'courtesies';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('Courtesy');
        
        if ($option == 'list')
        {
            $table = $this->Courtesy->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of courtesy', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->Courtesy->get_form();
            $form = str_replace('{id}', 'add-courtesy', $form);

            $data['contents'] = str_replace(
                '{title}', 'New courtesy', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $courtesy = 'window.user_create_id = ' . $this->session->userdata('user_id');
            $script = custom('script', '', $courtesy);
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

        $this->load->Model('Courtesy');

        $form = $this->Courtesy->get_form();
        $form = str_replace('{id}', 'update-courtesy', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit courtesy', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $courtesy = $this->Courtesy->get_data($option);
        $courtesy = 'window.courtesies = ' . json_encode($courtesy);

        $user_courtesy = 'window.user_create_id = ' . $this->session->userdata('user_id');
        $script_user = custom('script', '', $user_courtesy);


        $script = custom('script', '', $courtesy);
        $data['scripts'] = $script_user. $script .  $data['scripts'];

        $this->load->view('Master', $data);
    }
}

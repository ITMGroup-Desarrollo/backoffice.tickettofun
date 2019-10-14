<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Business extends CI_Controller
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
        $this->Page->menu_active = 'business unities';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('Business_unity');

        if ($option == 'list')
        {
            $table = $this->Business_unity->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of business unities', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->Business_unity->get_form();
            $form = str_replace('{id}', 'add-business', $form);

            $data['contents'] = str_replace(
                '{title}', 'New business unity', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $business = 'window.user_create_id = ' . $this->session->userdata('user_id');
            $script = custom('script', '', $business);
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

        $this->load->Model('Business_unity');

        $form = $this->Business_unity->get_form();
        $form = str_replace('{id}', 'update-business', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit business unity', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $business = $this->Business_unity->get_data($option);
        $business = 'window.business = ' . json_encode($business);

        $script = custom('script', '', $business);
        $data['scripts'] = $script .  $data['scripts'];

        $this->load->view('Master', $data);
    }
}

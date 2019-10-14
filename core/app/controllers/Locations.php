<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Locations extends CI_Controller
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
        $this->Page->menu_active = 'locations';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('Location');

        if ($option == 'list')
        {
            $table = $this->Location->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of locations', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->Location->get_form();
            $form = str_replace('{id}', 'add-location', $form);

            $data['contents'] = str_replace(
                '{title}', 'New location', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $location = 'window.user_create_id = ' . $this->session->userdata('user_id');
            $script = custom('script', '', $location);
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

        $this->load->Model('Location');

        $form = $this->Location->get_form();
        $form = str_replace('{id}', 'update-location', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit location', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $location = $this->Location->get_data($option);
        $location = 'window.locations = ' . json_encode($location);

        $script = custom('script', '', $location);
        $data['scripts'] = $script .  $data['scripts'];

        $this->load->view('Master', $data);
    }
}

<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Destinations extends CI_Controller
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
        $this->Page->menu_active = $view;
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('Destination');

        if ($option == 'list') 
        {
            $table = $this->Destination->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of destinations', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->Destination->get_form();
            $form = str_replace('{id}', 'add-destination', $form);

            $data['contents'] = str_replace(
                '{title}', 'New destination', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );
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

        $this->load->Model('Destination');

        $form = $this->Destination->get_form();
        $form = str_replace('{id}', 'update-destination', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit destination', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $destination = $this->Destination->get_data($option);
        $destination = 'window.destination = ' . json_encode($destination);

        $script = custom('script', '', $destination);
        $data['scripts'] = $script .  $data['scripts'];

        $this->load->view('Master', $data);
    }
}

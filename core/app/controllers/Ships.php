<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Ships extends CI_Controller
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
        $this->Page->menu_active = 'cruise';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('Ship');

        if ($option == 'list')
        {
            $table = $this->Ship->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of Cruises', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->Ship->get_form();
            $form = str_replace('{id}', 'add-ship', $form);

            $data['contents'] = str_replace(
                '{title}', 'New Cruise', $data['contents']
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

        $this->load->Model('Ship');

        $form = $this->Ship->get_form();
        $form = str_replace('{id}', 'update-ship', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit Cruise', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $ship = $this->Ship->get_data($option);
        $ship = 'window.ships = ' . json_encode($ship);

        $script = custom('script', '', $ship);
        $data['scripts'] = $script .  $data['scripts'];

        $this->load->view('Master', $data);
    }
}

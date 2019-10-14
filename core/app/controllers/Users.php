<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Users extends CI_Controller
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

        $this->load->Model('User');

        if ($option == 'list')
        {
            $table = $this->User->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of users', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->User->get_form();
            $form = str_replace('{id}', 'add-user', $form);

            $data['contents'] = str_replace(
                '{title}', 'New user', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $user = 'window.user_create_id = ' . $this->session->userdata('user_id');
            $script = custom('script', '', $user);
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
        $this->Page->menu_active = $view;
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('User');

        $form = $this->User->get_form();
        $form = str_replace('{id}', 'update-user', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit user', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $user = $this->User->get_data($option);
        $user = 'window.user = ' . json_encode($user);

        $script = custom('script', '', $user);
        $data['scripts'] = $script .  $data['scripts'];

        $this->load->view('Master', $data);
    }
}

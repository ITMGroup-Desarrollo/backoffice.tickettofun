<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Roles extends CI_Controller
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
        $this->Page->menu_active = 'roles';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('Rol');

        if ($option == 'list')
        {
            $table = $this->Rol->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of roles', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->Rol->get_form();
            $form = str_replace('{id}', 'add-rol', $form);

            $data['contents'] = str_replace(
                '{title}', 'New role', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $rol = 'window.user_create_id = ' . $this->session->userdata('user_id');
            $script = custom('script', '', $rol);
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

        $this->load->Model('Rol');

        $form = $this->Rol->get_form();
        $form = str_replace('{id}', 'update-rol', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit role', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $rol = $this->Rol->get_data($option);
        $rol = 'window.rol = ' . json_encode($rol);

        $script = custom('script', '', $rol);
        $data['scripts'] = $script .  $data['scripts'];

        $this->load->view('Master', $data);
    }
}

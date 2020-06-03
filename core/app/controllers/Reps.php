<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Reps extends CI_Controller
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
        $this->Page->menu_active = 'reps';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('Rep');

        if ($option == 'list')
        {
            $table = $this->Rep->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of reps', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );

            $rep = 'window.user_create_id = ' . $this->session->userdata('user_id');
            $script = custom('script', '', $rep);
            $data['scripts'] = $script .  $data['scripts'];
        }
        else
        {
            $form = $this->Rep->get_form();
            $form = str_replace('{id}', 'add-rep', $form);

            $data['contents'] = str_replace(
                '{title}', 'New rep', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $rep = 'window.user_create_id = ' . $this->session->userdata('user_id');
            $script = custom('script', '', $rep);
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

        $this->load->Model('Rep');

        $form = $this->Rep->get_form();
        $form = str_replace('{id}', 'update-rep', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit rep', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $rep = $this->Rep->get_data($option);

        $rep = 'window.repData = ' . json_encode($rep);

        $script = custom('script', '', $rep);
        $data['scripts'] = $script .  $data['scripts'];

        $rep = 'window.user_create_id = ' . $this->session->userdata('user_id');
        $script = custom('script', '', $rep);
        $data['scripts'] = $script .  $data['scripts'];

        $this->load->view('Master', $data);
    }
}

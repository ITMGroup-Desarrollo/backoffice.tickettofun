<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Profile extends CI_Controller
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

        $this->load->Model('Page');
        $this->Page->page_name = $view;

        $data = $this->Page->get_contents();
        $this->load->Model('Account_profile');

        $form = $this->Account_profile->get_form();

        $data['contents'] = str_replace(
            '{title}', 'Account Profle settings', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $profile = $this->Account_profile->get_data($this->session->userdata('user_id'));

        $profile = 'window.profile = ' . json_encode($profile);
        $script = custom('script', '', $profile);

        $data['scripts'] = $script .  $data['scripts'];

        $pathAvatar = "window.pathAvatar = '{$this->config->item("avatar_addr")}'";
        $script = custom('script', '', $pathAvatar);

        $data['scripts'] = $script .  $data['scripts'];

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

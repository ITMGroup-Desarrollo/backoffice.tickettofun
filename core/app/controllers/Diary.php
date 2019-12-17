<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Diary extends CI_Controller
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
        $this->Page->menu_active = 'diary';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $date = new DateTime();
        $date->modify('+1 day');

        $next_date = $date->format('l jS F Y');

        $data['contents'] = str_replace('{date}', $next_date, $data['contents']);

        $this->load->Model('Diaries');
        $locations = $this->Diaries->get_location_distribution();

        $data['contents'] = str_replace(
            '{spec}', $locations['tours'], $data['contents']
        );

        $data['contents'] = str_replace(
            '{sub-title}', 'Port of Costa Maya', $data['contents']
        );

        $data['contents'] = str_replace(
            '{total_tours}', $locations['total_tours'], $data['contents']
        );

        $data['contents'] = str_replace(
            '{details}', $locations['details'], $data['contents']
        );

        $form = $this->Diaries->get_form();
        $data['contents'] = str_replace(
            'form-send', $form, $data['contents']
        );

        $userRol = 'window.user = ' . $this->session->userdata('rol_id');
        $script = custom('script', '', $userRol);
        $data['scripts'] = $script .  $data['scripts'];

        $this->load->view('Master', $data);
    }
}

<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Dairy extends CI_Controller
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
        $this->Page->menu_active = 'dairy';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $date = new DateTime();
        $date->modify('+1 day');

        $next_date = $date->format('l jS F Y');

        $data['contents'] = str_replace('{date}', $next_date, $data['contents']);

        $this->load->Model('Daries');
        $locations = $this->Daries->get_location_distribution();

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

        $this->load->view('Master', $data);
    }
}

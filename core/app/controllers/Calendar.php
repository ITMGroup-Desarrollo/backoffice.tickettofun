<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Calendar extends CI_Controller
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
        $this->Page->menu_active = 'calendar';

        $data = $this->Page->get_contents();

        $data['contents'] = str_replace(
            '{title}', 'Ship calendar', $data['contents']
        );


        $this->load->view('Master', $data);
    }
}

<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Services extends CI_Controller
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

        $data = $this->Page->get_contents();

        $this->load->Model('Service');

        if ($option == 'list') 
        {
            $table = $this->Service->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of services', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->Service->get_form();

            $data['contents'] = str_replace(
                '{title}', 'New service', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );
        }

        $this->load->view('Master', $data);
    }
}

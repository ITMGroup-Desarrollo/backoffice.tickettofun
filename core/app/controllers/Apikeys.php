<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Apikeys extends CI_Controller
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

        $this->load->Model('Apikey');

        if ($option == 'list') 
        {
            $table = $this->Apikey->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of apikeys', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->Apikey->get_form();
            $form = str_replace('{id}', 'add-apikey', $form);

            $data['contents'] = str_replace(
                '{title}', 'New apikey', $data['contents']
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

        $this->load->Model('Apikey');

        $form = $this->Apikey->get_form();
        $form = str_replace('{id}', 'update-apikey', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit apikey', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $apikey = $this->Apikey->get_data($option);
       
        $apikey = 'window.apikey = ' . json_encode($apikey);

        $script = custom('script', '', $apikey);
        $data['scripts'] = $script .  $data['scripts'];

        $this->load->view('Master', $data);
    }
}

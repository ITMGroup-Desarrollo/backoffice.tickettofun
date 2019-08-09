<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Resellers extends CI_Controller
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
        $this->Page->menu_active = 'vendors';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('Reseller');

        if ($option == 'list') 
        {
            $table = $this->Reseller->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of resellers', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->Reseller->get_form();
            $form = str_replace('{id}', 'add-reseller', $form);

            $data['contents'] = str_replace(
                '{title}', 'New reseller', $data['contents']
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

        $this->load->Model('Reseller');

        $form = $this->Reseller->get_form();
        $form = str_replace('{id}', 'update-reseller', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit reseller', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $reseller = $this->Reseller->get_data($option);
        $reseller = 'window.reseller = ' . json_encode($reseller);

        $script = custom('script', '', $reseller);
        $data['scripts'] = $script .  $data['scripts'];

        $this->load->view('Master', $data);
    }
}

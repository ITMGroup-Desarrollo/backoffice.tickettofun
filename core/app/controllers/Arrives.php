<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Arrives extends CI_Controller
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
        $this->Page->menu_active = 'arrives';
        $this->Page->submenu_active = $option;
        
        $data = $this->Page->get_contents();
        $this->load->Model('Arrive');
        
        if ($option == 'list')
        {
            $table = $this->Arrive->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of ship arrives', $data['contents']
            );
            
            $form = $this->Arrive->get_form('search');
            $form = str_replace('{id}', 'search', $form);

            $data['contents'] = str_replace(
                '{search}', $form, $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', '<hr>'.$table, $data['contents']
            );
        }
        else
        {
            $form = $this->Arrive->get_form();
            $form = str_replace('{id}', 'add-arrives', $form);

            $data['contents'] = str_replace(
                '{title}', 'New cruise arrive', $data['contents']
            );

            $data['contents'] = str_replace(
                '{search}', '', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $userId = 'window.user = ' . $this->session->userdata('user_id');
            $script = custom('script', '', $userId);
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
        //$this->Page->page_name = $view;
        $this->Page->page_name = 'arrives';

        $data = $this->Page->get_contents();

        $this->load->Model('Arrive');

        $form = $this->Arrive->get_form();
        $form = str_replace('{id}', 'update-arrives', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit cruise arrive', $data['contents']
        );

        $data['contents'] = str_replace(
            '{search}', '', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );
        
        $arrives = $this->Arrive->get_data($option);
        $arrives = 'window.arrives = ' . json_encode($arrives);

        $script = custom('script', '', $arrives);
        $data['scripts'] = $script .  $data['scripts'];

        $this->load->view('Master', $data);
    }


    public function dataJson()
    {
        $this->load->library('user_session', NULL, 'user');
        $this->load->Model('Page');
        $this->load->Model('Arrive');

        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $this->Arrive->get_data_json($_POST);
    }
    
    public function shipList()
    {   
        $id = @$_POST['id'];

        $this->load->library('user_session', NULL, 'user');
        $this->load->Model('Page');
        $this->load->Model('Arrive');

        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        
        $this->Arrive->get_ships_list($id);
    }
}

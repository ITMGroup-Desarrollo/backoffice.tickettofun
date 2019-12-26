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
                '{title}', 'List of calls', $data['contents']
            );

            $form = $this->Arrive->get_form('search');
            $form = str_replace('{id}', 'search', $form);

            $data['contents'] = str_replace(
                '{search}', $form, $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', "<hr />".$table, $data['contents']
            );

            $data['contents'] = str_replace(
                '{allotmentsTitle}', '', $data['contents']
            );

            $data['contents'] = str_replace(
                '{allotments}', '', $data['contents']
            );
            $data['contents'] = str_replace(
                '{contentbtn}', '', $data['contents']
            );

        }
        else
        {
            $form = $this->Arrive->get_form();
            $form = str_replace('{id}', 'add-arrives', $form);

            $data['contents'] = str_replace(
                '{title}', 'New call', $data['contents']
            );

            $data['contents'] = str_replace(
                '{search}', '', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );
            $data['contents'] = str_replace(
                '{allotmentsTitle}', '', $data['contents']
            );
            $data['contents'] = str_replace(
                '{allotments}', '', $data['contents']
            );

            $data['contents'] = str_replace(
                '{contentbtn}', '', $data['contents']
            );
        }

        $userId = 'window.user = ' . $this->session->userdata('user_id');
        $script = custom('script', '', $userId);
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

        $table = $this->Arrive->get_list_allotments();

        $data['contents'] = str_replace(
            '{allotmentsTitle}', 'Edit Allotments of Cruise', $data['contents']
        );

        $data['contents'] = str_replace(
            '{allotments}', $table, $data['contents']
        );

        $formbtn = $this->Arrive->get_formbtn();
        $formbtn = str_replace('{id}', 'allotmentsbtn', $formbtn);
        $formbtn = str_replace('btn btn-success save', 'btn btn-info load-allotments', $formbtn);
        $formbtn = str_replace('Save', 'Simulate', $formbtn);

        $data['contents'] = str_replace(
            '{contentbtn}', $formbtn, $data['contents']
        );

        $arrives = $this->Arrive->get_data($option);
        $arrives = 'window.arrives = ' . json_encode($arrives);

        $data['contents'] = str_replace(
            '{classcontainererrors}', ' hidden', $data['contents']
        );

        $userId = 'window.user = ' . $this->session->userdata('user_id');
        $script = custom('script', '', $userId);
        $data['scripts'] = $script .  $data['scripts'];

        $script = custom('script', '', $arrives);
        $data['scripts'] = $script .  $data['scripts'];

        $this->load->view('Master', $data);
    }

}

<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Allotment_reservations extends CI_Controller
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
        $this->Page->menu_active = 'allotments';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('Allotment_reservation');

        if ($option == 'list')
        {

            $table = $this->Allotment_reservation->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of allotment reservations', $data['contents']
            );

            $form = $this->Allotment_reservation->get_form('search');
            $form = str_replace('{id}', 'search', $form);

            $data['contents'] = str_replace(
                '{search}', $form, $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', '<hr>'.$table, $data['contents']
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
        $this->Page->page_name = $view;

        $data = $this->Page->get_contents();

        $this->load->Model('Allotment_reservation');

        $form = $this->Allotment_reservation->get_form();
        $form = str_replace('{id}', 'update-allotment', $form);

        $data['contents'] = str_replace(
            '{title}', 'Update allotment', $data['contents']
        );

        $data['contents'] = str_replace(
            '{search}', '', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $Allotment_reservation = $this->Allotment_reservation->get_data($option);
        $Allotment_reservation = 'window.allotments = ' . json_encode($Allotment_reservation);


        $script = custom('script', '', $Allotment_reservation);
        $data['scripts'] = $script .  $data['scripts'];

        $userId = 'window.user = ' . $this->session->userdata('user_id');
        $script = custom('script', '', $userId);
        $data['scripts'] = $script .  $data['scripts'];

        $this->load->view('Master', $data);
    }

    public function create_configuration()
    {
        $this->load->library('user_session', NULL, 'user');

        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = 'config';//$this->uri->segment(2);
        $option = $this->uri->segment(3);

        // echo $view; echo $option; exit;

        $this->load->Model('Page');
        $this->Page->page_name = $view;
        $this->Page->menu_active = 'new';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('ConfigBase');

        $form = $this->ConfigBase->get_form();
        $form = str_replace('{id}', 'add-config', $form);

        $data['contents'] = str_replace(
            '{title}', 'New configuration', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $userId = 'window.user = ' . $this->session->userdata('user_id');
        // $script = custom('script', '', $config);
        $script = custom('script', '', $userId);
        $data['scripts'] = $script . $data['scripts'];

        $this->load->view('Master', $data);
    }

    /**
    *Configuration page for to connect config_base with this controller
    */
    public function configuration()
    {
        $this->load->library('user_session', NULL, 'user');

        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = 'config';// $this->uri->segment(1);
        $option = $this->uri->segment(2);
        // echo $option; exit;

        $this->load->Model('Page');
        $this->Page->page_name = $view;
        $this->Page->menu_active = 'list';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('ConfigBase');

        $table = $this->ConfigBase->get_list();

        $data['contents'] = str_replace(
            '{title}', 'Configuration schedules', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $table, $data['contents']
        );

        $this->load->view('Master', $data);
    }

    /**
    *Update page for this controller
    */
    public function configuration_update()
    {
        $this->load->library('user_session', NULL, 'user');

        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = 'config';// $this->uri->segment(1);
        $option = $this->uri->segment(3);

        $this->load->Model('Page');
        $this->Page->page_name = $view;

        $data = $this->Page->get_contents();

        $this->load->Model('ConfigBase');

        $form = $this->ConfigBase->get_form();
        $form = str_replace('{id}', 'update-config', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit schedules config', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $config = $this->ConfigBase->get_data($option);
        $config = 'window.config = ' . json_encode($config);

        $userId = 'window.user = ' . $this->session->userdata('user_id');
        $script = custom('script', '', $config);
        $script .= custom('script', '', $userId);
        $data['scripts'] = $script . $data['scripts'];

        $this->load->view('Master', $data);
    }

}

<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Equivalences extends CI_Controller
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
        $this->Page->menu_active = 'equivalences';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('Equivalence');

        if ($option == 'list')
        {
            $table = $this->Equivalence->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of equivalences', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->Equivalence->get_form();
            $form = str_replace('{id}', 'add-equivalence', $form);

            $data['contents'] = str_replace(
                '{title}', 'New equivalence', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $equivalence = 'window.user = ' . $this->session->userdata('user_id');
            $script = custom('script', '', $equivalence);
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
        $this->Page->page_name = $view;

        $data = $this->Page->get_contents();

        $this->load->Model('Equivalence');

        $form = $this->Equivalence->get_form();
        $form = str_replace('{id}', 'update-equivalence', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit equivalence', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $equivalence = $this->Equivalence->get_data($option);
        $equivalence = 'window.equivalences = ' . json_encode($equivalence);

        $script = custom('script', '', $equivalence);
        $data['scripts'] = $script .  $data['scripts'];

        $this->load->view('Master', $data);
    }
}

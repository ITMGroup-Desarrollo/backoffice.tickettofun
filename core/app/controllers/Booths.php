<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Booths extends CI_Controller
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
        $this->Page->menu_active = 'booths';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('Booth');

        if ($option == 'list')
        {
            $table = $this->Booth->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of booths', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else if($option == 'new' || $option == 'edit')
        {
            $form = $this->Booth->get_form();
            $form = str_replace('{id}', 'add-booth', $form);

            $data['contents'] = str_replace(
                '{title}', 'New booth', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $reps = $this->Booth->get_reps_in_booth($option);
            var_dump($reps);
            exit();
            $reps = 'window.reps = ' . json_encode($reps);

            $booth = 'window.user_create_id = ' . $this->session->userdata('user_id');
            $script = custom('script', '', $booth);
            $data['scripts'] = $script .$scriptrep. $data['scripts'];
        }else
        {
            $form = $this->Booth->get_form_booth();

            $form = str_replace('{id}', 'add-booth', $form);

            $data['contents'] = str_replace(
                '{title}', 'Booths Configuration', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $booths = $this->Booth->get_booth_data($option);

            $reps = 'window.boothData = ' . json_encode($reps);

            $booth = 'window.user_create_id = ' . $this->session->userdata('user_id');
            $script = custom('script', '', $booth);
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

        $this->load->Model('Booth');

        $form = $this->Booth->get_form();
        $form = str_replace('{id}', 'update-booth', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit booth', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $booth = $this->Booth->get_data($option);
        $booth = 'window.booth = ' . json_encode($booth);

        $reps = $this->Booth->get_rep_data($option);
        $reps = 'window.reps = ' . json_encode($reps);

        $script = custom('script', '', $booth);
        $scriptrep = custom('script', '', $reps);

        $booth_user = 'window.user_create_id = ' . $this->session->userdata('user_id');
        $script_user = custom('script', '', $booth_user);

        $data['scripts'] = $script . $scriptrep . $script_user. $data['scripts'];

        $this->load->view('Master', $data);
    }
}

<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Prices extends CI_Controller
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
        $this->Page->menu_active = 'prices';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('Price');

        if ($option == 'list')
        {
            $table = $this->Price->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of Price', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->Price->get_form();
            $form = str_replace('{id}', 'add-price', $form);

            $data['contents'] = str_replace(
                '{title}', 'New price', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $equivalece = $this->Price->get_equivalences();
            $equivalece = 'window.equivalences = ' . json_encode($equivalece);

            $script_equivalence = custom('script', '', $equivalece);

            $price = 'window.user_create_id = ' . $this->session->userdata('user_id');
            $script = custom('script', '', $price);
            $data['scripts'] = $script . $script_equivalence. $data['scripts'];
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

        $this->load->Model('Price');

        $form = $this->Price->get_form();
        $form = str_replace('{id}', 'update-price', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit price', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $price = $this->Price->get_data($option);
        $price = 'window.prices = ' . json_encode($price);

        $user_price = 'window.user_create_id = ' . $this->session->userdata('user_id');
        $script_user = custom('script', '', $user_price);


        $script = custom('script', '', $price);
        $data['scripts'] = $script_user. $script .  $data['scripts'];

        $this->load->view('Master', $data);
    }
}

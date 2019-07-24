<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Signin extends CI_Controller
{
    /**
    *Index page for this controller
    */
    public function index()
    {
        $this->load->library('user_session', NULL, 'user');

        $view = $this->uri->segment(1);
        $view = (empty($view)) ? 'signin' : $view;

        if ($this->user->active_session())
            redirect(base_url('services'));

        $this->load->Model('Page');
        $this->Page->page_name = $view;

        $data = $this->Page->get_contents();

        // Get token
        $response = json_decode(
            $this->api->get_token()
        );

        if ($response->code == 200)
        {
            $script = "window.token = '{$response->message}'";
            $token = custom('script', '', $script);

            $data['scripts'] .= $token;
        }

        $this->load->view('Master', $data);
    }

    /**
    * Set credentials on session object.
    *
    * @param  php://input JSON form information
    * @return 200         Success code
    */
    public function set_data()
    {
        $this->load->library('user_session', NULL, 'user');

        $credentials = json_decode(file_get_contents('php://input'));

        $this->user->set_session($credentials);

        echo 200;
    }

    /**
    * Close active session
    *
    * @return void
    */
    public function logout()
    {
        $this->load->library('session');
        $this->session->sess_destroy();
    }
}

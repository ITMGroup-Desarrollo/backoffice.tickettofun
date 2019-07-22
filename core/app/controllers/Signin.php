<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Signin extends CI_Controller
{
    /**
    *Index page for this controller
    */
    public function index()
    {
        //$this->load->library('grant_access');

        $view = $this->uri->segment(1);
        $view = (empty($view)) ? 'signin' : $view;

        //if ($this->grant_access->active_session())
          //  redirect(base_url('dashboard'));

        $this->load->Model('Page');
        $this->Page->page_name = $view;

        $data = $this->Page->get_contents();

        // Get token
        $params = new stdClass();
        $params->id = API_KEY;
        $endpoint = TOKEN_ENDPOINT;

        $response = json_decode(
            $this->api->get_token('POST', $endpoint, $params)
        );

        if ($response->code == 200)
        {
            $script = "window.token = '{$response->message}'";
            $token = custom('script', '', $script);

            $data['scripts'] .= $token;
        }

        $this->load->view('Master', $data);
    }
}

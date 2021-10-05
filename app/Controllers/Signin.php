<?php
namespace App\Controllers;

use App\Libraries\Api;

class Signin extends BaseController
{
    public $api;
    public function __construct()
    {
        $this->api = new Api();
    }

    /**
    *Index page for this controller
    */
    public function index()
    {
        $view = $this->request->uri->getSegment(1);
        $view = (empty($view)) ? 'signin' : $view;

        if ($this->user->active_session())
            redirect(base_url($this->session->userdata()['page_default']));
        
        $this->page->page_name = $view;

        $data = $this->page->get_contents();

        // Get token
        $response = json_decode(
            $this->api->get_token()
        );

        if ($response->code == 200)
        {
            $api_host = getenv("apiHost");

            $script = "window.token = '{$response->message}'\n";
            $script .= "window.api_host = '{$api_host}'";

            $token = custom(
                'script', array('type' => 'text/javascript'), $script
            );

            $data['scripts'] = $token . $data['scripts'];
        }

        return view('Master', $data);
    }

    /**
    * Set credentials on session object.
    *
    * @param  php://input JSON form information
    * @return 200         Success code
    */
    public function set_data()
    {
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
        $user_data = array(
            'user_id',
            'user_name',
            'rol_id',
            'token',
            'avatar',
            'page_default',
            'permissions'
        );

        $this->session->remove($user_data);
    }
}

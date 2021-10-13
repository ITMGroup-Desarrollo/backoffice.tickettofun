<?php
namespace App\Controllers;

use App\Libraries\User_session;

class Users extends BaseController
{
    public $user_model;

    public function __construct()
    {
        $this->user_model = new \App\Models\User();
    }

    /**
    *Index page for this controller
    */
    public function index()
    {
        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = $this->request->uri->getSegment(1);
        $option = $this->request->uri->getSegment(2);

        $this->page->page_name      = $view;
        $this->page->menu_active    = $view;
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        if ($option == 'list')
        {
            $table = $this->user_model->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of users', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->user_model->get_form();
            $form = str_replace('{id}', 'add-user', $form);

            $data['contents'] = str_replace(
                '{title}', 'New user', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $user = 'window.user_create_id = ' . $this->session->get('user_id');
            $script = custom('script', '', $user);
            $data['scripts'] = $script .  $data['scripts'];
        }

        return view('Master', $data);
    }

    /**
    *Update page for this controller
    */
    public function update()
    {
        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = $this->request->uri->getSegment(1);
        $option = $this->request->uri->getSegment(2);

        $this->page->page_name      = $view;
        $this->page->menu_active    = $view;
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        $form = $this->user_model->get_form();
        $form = str_replace('{id}', 'update-user', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit user', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $user = $this->user_model->get_data($option);
        $user = 'window.user = ' . json_encode($user);

        $script = custom('script', '', $user);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }

    /**
     * Get actions elements
     * @param  php://input JSON form information
     * @return JSON        $response permissions information
     */
    public function permissions()
    {
        $this->user_actions = new User_session();

        $response = array(
            'code' => 200,
            'message' => '',
        );

        $permissions = array(
            'g' => 0,
            'gElement' => '',
            'i' => 0,
            'iElement' => '',
            'u' => 0,
            'uElement' => '',
            'd' => 0,
            'dElement' => '',
            'statusElement' => ''
        );

        $status_attrib = array(
            'class' => 'badge badge-{status}',
            'data-status' => '{status_value}'
        );

        $permissions['statusElement'] = custom('span', $status_attrib, '{s_text}');

        if ($_SERVER['REQUEST_METHOD'] == 'POST')
        {
            $data = json_decode(file_get_contents('php://input'));
            
            $permissions = $this->user_actions->get_actions($data->table, $permissions);
        }

        $response['message'] = $permissions;

        return $this->response->setJson($response);
    }
}

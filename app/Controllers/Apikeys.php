<?php
namespace App\Controllers;

class Apikeys extends BaseController
{
    public $api_key;

    public function __construct()
    {
        $this->api_key = new \App\Models\Apikey();
    }

    /**
    *Index page for this controller
    */
    public function index()
    {
        if ( ! $this->user->active_session())
            return redirect()->to(base_url('signin'));

        $view   = $this->request->uri->getSegment(1);
        $option = $this->request->uri->getSegment(2);


        $this->page->page_name      = $view;
        $this->page->menu_active    = 'apikeys';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        if ($option == 'list')
        {
            $table = $this->api_key->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of apikeys', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->api_key->get_form();
            $form = str_replace('{id}', 'add-apikey', $form);

            $data['contents'] = str_replace(
                '{title}', 'New apikey', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $apikey = 'window.user_create_id = ' . $this->session->get('user_id');
            $script = custom('script', '', $apikey);
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
            return redirect()->to(base_url('signin'));

        $view   = $this->request->uri->getSegment(1);
        $option = $this->request->uri->getSegment(2);

        $this->page->page_name = $view;

        $data = $this->page->get_contents();

        $form = $this->api_key->get_form();
        $form = str_replace('{id}', 'update-apikey', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit apikey', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $apikey = $this->api_key->get_data($option);
        $apikey = 'window.apikey = ' . json_encode($apikey);

        $script = custom('script', '', $apikey);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }
}

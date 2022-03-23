<?php
namespace App\Controllers;

class Services extends BaseController
{
    public $service;

    public function __construct()
    {
        $this->service = new \App\Models\Service();
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
        $this->page->menu_active    = $view;
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        if ($option == 'list')
        {
            $table = $this->service->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of services', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->service->get_form();
            $form = str_replace('{id}', 'add-service', $form);

            $data['contents'] = str_replace(
                '{title}', 'New service', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $service = 'window.user_create_id = ' . $this->session->get('user_id');
            $script = custom('script', '', $service);
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

        $form = $this->service->get_form();
        $form = str_replace('{id}', 'update-service', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit service', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $service = $this->service->get_data($option);
        $service = 'window.service = ' . json_encode($service);

        $script = custom('script', '', $service);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }
}

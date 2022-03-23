<?php
namespace App\Controllers;

class Ships extends BaseController
{
    public $ship;

    public function __construct()
    {
        $this->ship = new \App\Models\Ship();
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
        $this->page->menu_active    = 'cruise';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        if ($option == 'list')
        {
            $table = $this->ship->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of cruises', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->ship->get_form();
            $form = str_replace('{id}', 'add-ship', $form);

            $data['contents'] = str_replace(
                '{title}', 'New cruise', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $ship = 'window.user_create_id = ' . $this->session->get('user_id');
            $script = custom('script', '', $ship);
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

        $form = $this->ship->get_form();
        $form = str_replace('{id}', 'update-ship', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit cruise', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $ship = $this->ship->get_data($option);
        $ship = 'window.ships = ' . json_encode($ship);

        $script = custom('script', '', $ship);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }
}

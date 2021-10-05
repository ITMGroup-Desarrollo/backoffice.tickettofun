<?php
namespace App\Controllers;

class Destinations extends BaseController
{
    public $destination;

    public function __construct()
    {
        $this->destination = new \App\Models\Destination();
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
        $this->page->menu_active    = 'destinations';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        if ($option == 'list')
        {
            $table = $this->destination->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of destinations', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->destination->get_form();
            $form = str_replace('{id}', 'add-destination', $form);

            $data['contents'] = str_replace(
                '{title}', 'New destination', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $destination = 'window.user_create_id = ' . $this->session->get('user_id');
            $script = custom('script', '', $destination);
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

        $this->page->page_name = $view;

        $data = $this->page->get_contents();

        $form = $this->destination->get_form();
        $form = str_replace('{id}', 'update-destination', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit destination', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $destination = $this->destination->get_data($option);
        $destination = 'window.destination = ' . json_encode($destination);

        $script = custom('script', '', $destination);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }
}

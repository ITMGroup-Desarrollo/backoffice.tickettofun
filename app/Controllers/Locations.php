<?php
namespace App\Controllers;

class Locations extends BaseController
{
    public $location;

    public function __construct()
    {
        $this->location = new \App\Models\Location();
    }

    /**
    * Index page for this controller
    */
    public function index()
    {
        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = $this->request->uri->getSegment(1);
        $option = $this->request->uri->getSegment(2);

        
        $this->page->page_name      = $view;
        $this->page->menu_active    = 'locations';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        if ($option == 'list')
        {
            $table = $this->location->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of locations', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->location->get_form();
            $form = str_replace('{id}', 'add-location', $form);

            $data['contents'] = str_replace(
                '{title}', 'New location', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $location = 'window.user_create_id = ' . $this->session->get('user_id');
            $script = custom('script', '', $location);
            $data['scripts'] = $script .  $data['scripts'];
        }

        return view('Master', $data);
    }

    /**
    * Update page for this controller
    */
    public function update()
    {
        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = $this->request->uri->getSegment(1);
        $option = $this->request->uri->getSegment(2);

        
        $this->page->page_name = $view;

        $data = $this->page->get_contents();

        $form = $this->location->get_form();
        $form = str_replace('{id}', 'update-location', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit location', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $location = $this->location->get_data($option);
        $location = 'window.locations = ' . json_encode($location);

        $script          = custom('script', '', $location);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }
}

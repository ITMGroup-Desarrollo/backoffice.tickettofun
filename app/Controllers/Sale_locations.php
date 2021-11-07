<?php
namespace App\Controllers;

class Sale_locations extends BaseController
{
    public $sale_location;

    public function __construct()
    {
        $this->sale_location = new \App\Models\Sale_location();
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
        $this->page->menu_active    = 'sale-locations';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        if ($option == 'list')
        {
            $table = $this->sale_location->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of Sale locations', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->sale_location->get_form();
            $form = str_replace('{id}', 'add-sale-location', $form);

            $data['contents'] = str_replace(
                '{title}', 'New sale location', $data['contents']
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

        $form = $this->sale_location->get_form();
        $form = str_replace('{id}', 'update-sale-location', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit sale location', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $location = $this->sale_location->get_data($option);
        $location = 'window.locations = ' . json_encode($location);

        $script          = custom('script', '', $location);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }
}

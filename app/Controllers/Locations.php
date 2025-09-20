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
            return redirect()->to(base_url('signin'));

        $view   = $this->request->uri->getSegment(1);
        $option = $this->request->uri->getSegment(2);


        $this->page->page_name      = $view;
        $this->page->menu_active    = 'locations';
        $this->page->submenu_active = $option;

        $businessUnitElement = '';
        $data = $this->page->get_contents();

        if ($option == 'list')
        {
            if (count($this->session->get('business_unities')) > 1) {
                $businessUnitElement = $this->user->get_business_unties_element(true, '', 'inline');
            }

            $table = $this->location->get_list($this->user->get_business_unities_params());

            $data['contents'] = str_replace(
                '{title}', 'List of locations', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $businessUnitElement.$table, $data['contents']
            );
        }
        else
        {
            if (count($this->session->get('business_unities')) > 1) {
                $businessUnitElement = $this->user->get_business_unties_element(true, '', 'wrapper');
            }

            $form = $this->location->get_form();
            $form = str_replace('{id}', 'add-location', $businessUnitElement.$form);

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
            return redirect()->to(base_url('signin'));

        $view   = $this->request->uri->getSegment(1);
        $option = $this->request->uri->getSegment(2);

        $this->page->page_name = $view;

        $data = $this->page->get_contents();

        $businessUnitElement = $this->user->get_business_unties_element(true, '', 'wrapper');

        $form = $this->location->get_form();
        $form = str_replace('{id}', 'update-location', $businessUnitElement.$form);

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

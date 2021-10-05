<?php
namespace App\Controllers;

class Business extends BaseController
{
    public $business_unity;

    public function __construct()
    {
        $this->business_unity = new \App\Models\Business_unity();
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
        $this->page->menu_active    = 'business unities';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        if ($option == 'list')
        {
            $table = $this->business_unity->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of business unities', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->business_unity->get_form();
            $form = str_replace('{id}', 'add-business', $form);

            $data['contents'] = str_replace(
                '{title}', 'New business unity', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $business = 'window.user_create_id = ' . $this->session->get('user_id');
            $script = custom('script', '', $business);
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

        $form = $this->business_unity->get_form();
        $form = str_replace('{id}', 'update-business', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit business unity', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $business = $this->business_unity->get_data($option);
        $business = 'window.business = ' . json_encode($business);

        $script = custom('script', '', $business);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }
}

<?php
namespace App\Controllers;

class Resellers extends BaseController
{
    public $reseller;

    public function __construct()
    {
        $this->reseller = new \App\Models\Reseller();
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
        $this->page->menu_active    = 'vendors';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        if ($option == 'list')
        {
            $table = $this->reseller->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of vendors', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->reseller->get_form();
            $form = str_replace('{id}', 'add-reseller', $form);

            $data['contents'] = str_replace(
                '{title}', 'New vendor', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $reseller = 'window.user_create_id = ' . $this->session->get('user_id');
            $script = custom('script', '', $reseller);
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

        $form = $this->reseller->get_form();
        $form = str_replace('{id}', 'update-reseller', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit vendor', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $reseller = $this->reseller->get_data($option);
        $reseller = 'window.reseller = ' . json_encode($reseller);

        $script = custom('script', '', $reseller);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }
}

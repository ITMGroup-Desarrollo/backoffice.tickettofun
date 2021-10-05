<?php
namespace App\Controllers;

class Courtesies extends BaseController
{
    public $courtesy;

    public function __construct()
    {
        $this->courtesy = new \App\Models\Courtesy();
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
        
        $this->page->page_name = $view;
        $this->page->menu_active = 'courtesies';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        if ($option == 'list')
        {
            $table = $this->Courtesy->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of courtesy', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->Courtesy->get_form();
            $form = str_replace('{id}', 'add-courtesy', $form);

            $data['contents'] = str_replace(
                '{title}', 'New courtesy', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $courtesy = 'window.user_create_id = ' . $this->session->get('user_id');
            $script = custom('script', '', $courtesy);
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

        $form = $this->Courtesy->get_form();
        $form = str_replace('{id}', 'update-courtesy', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit courtesy', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $courtesy = $this->Courtesy->get_data($option);
        $courtesy = 'window.courtesies = ' . json_encode($courtesy);

        $user_courtesy = 'window.user_create_id = ' . $this->session->get('user_id');
        $script_user = custom('script', '', $user_courtesy);


        $script = custom('script', '', $courtesy);
        $data['scripts'] = $script_user. $script .  $data['scripts'];

        return view('Master', $data);
    }
}

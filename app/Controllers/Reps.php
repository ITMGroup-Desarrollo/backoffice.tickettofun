<?php
namespace App\Controllers;

class Reps extends BaseController
{
    public $rep;

    public function __construct()
    {
        $this->rep = new \App\Models\Rep();
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
        $this->page->menu_active = 'reps';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        if ($option == 'list')
        {
            $table = $this->rep->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of reps', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );

            $rep = 'window.user_create_id = ' . $this->session->get('user_id');
            $script = custom('script', '', $rep);
            $data['scripts'] = $script .  $data['scripts'];
        }
        else
        {
            $form = $this->rep->get_form();
            $form = str_replace('{id}', 'add-rep', $form);

            $data['contents'] = str_replace(
                '{title}', 'New rep', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $rep = 'window.user_create_id = ' . $this->session->get('user_id');
            $script = custom('script', '', $rep);
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

        $form = $this->rep->get_form();
        $form = str_replace('{id}', 'update-rep', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit rep', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $rep = $this->rep->get_data($option);

        $rep = 'window.repData = ' . json_encode($rep);

        $script = custom('script', '', $rep);
        $data['scripts'] = $script .  $data['scripts'];

        $rep = 'window.user_create_id = ' . $this->session->get('user_id');
        $script = custom('script', '', $rep);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }
}

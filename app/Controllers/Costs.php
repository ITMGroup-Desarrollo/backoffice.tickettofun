<?php
namespace App\Controllers;

class Costs extends BaseController
{
    public $cost;

    public function __construct()
    {
        $this->cost = new \App\Models\Cost();
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
        $this->page->menu_active    = 'costs';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        if ($option == 'list')
        {
            $table = $this->cost->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of Cost', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->cost->get_form();
            $form = str_replace('{id}', 'add-cost', $form);

            $data['contents'] = str_replace(
                '{title}', 'New cost', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $cost              = 'window.user_create_id = ' . $this->session->get('user_id');
            $script             = custom('script', '', $cost);
            $data['scripts']    = $script . $data['scripts'];
            
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

        $form = $this->cost->get_form();
        $form = str_replace('{id}', 'update-cost', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit cost', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $cost = $this->cost->get_data($option);
        $cost = 'window.costs = ' . json_encode($cost);

        $user_cost  = 'window.user_create_id = ' . $this->session->get('user_id');
        $script_user = custom('script', '', $user_cost);


        $script          = custom('script', '', $cost);
        $data['scripts'] = $script_user. $script .  $data['scripts'];

        return view('Master', $data);
    }
}

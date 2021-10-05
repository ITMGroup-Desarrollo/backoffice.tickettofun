<?php
namespace App\Controllers;

class Booths extends BaseController
{
    public $booth;

    public function __construct()
    {
        $this->booth = new \App\Models\Booth();
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
        $this->page->menu_active    = 'booths';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        if ($option == 'list')
        {
            $table = $this->booth->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of booths', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->booth->get_form();
            $form = str_replace('{id}', 'add-booth', $form);

            $data['contents'] = str_replace(
                '{title}', 'New booth', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $reps = $this->booth->get_rep_data();
            $reps = 'window.reps = ' . json_encode($reps);

            $booth           = 'window.user_create_id = ' . $this->session->get('user_id');
            $script          = custom('script', '', $booth);
            $scriptrep       = custom('script', '', $reps);
            $data['scripts'] = $script .$scriptrep. $data['scripts'];
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

        $form = $this->booth->get_form();
        $form = str_replace('{id}', 'update-booth', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit booth', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $booth = $this->booth->get_data($option);
        $booth = 'window.booth = ' . json_encode($booth);

        $reps = $this->booth->get_rep_data($option);
        $reps = 'window.reps = ' . json_encode($reps);

        $script    = custom('script', '', $booth);
        $scriptrep = custom('script', '', $reps);

        $booth_user  = 'window.user_create_id = ' . $this->session->get('user_id');
        $script_user = custom('script', '', $booth_user);

        $data['scripts'] = $script . $scriptrep . $script_user. $data['scripts'];

        return view('Master', $data);
    }
}

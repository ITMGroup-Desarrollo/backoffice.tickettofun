<?php
namespace App\Controllers;

class Equivalences extends BaseController
{
    public $equivalence;

    public function __construct()
    {
        $this->equivalence = new \App\Models\Equivalence ();
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
        $this->page->menu_active    = 'equivalences';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        if ($option == 'list')
        {
            $table = $this->equivalence->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of equivalences', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->equivalence->get_form();
            $form = str_replace('{id}', 'add-equivalence', $form);

            $data['contents'] = str_replace(
                '{title}', 'New equivalence', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $equivalence = 'window.user = ' . $this->session->get('user_id');
            $script = custom('script', '', $equivalence);
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

        $form = $this->equivalence->get_form();
        $form = str_replace('{id}', 'update-equivalence', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit equivalence', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $equivalence = $this->equivalence->get_data($option);
        $equivalence = 'window.equivalences = ' . json_encode($equivalence);

        $script = custom('script', '', $equivalence);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }
}

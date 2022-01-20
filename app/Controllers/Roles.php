<?php
namespace App\Controllers;

class Roles extends BaseController
{
    public $rol;

    public function __construct()
    {
        $this->rol = new \App\Models\Rol();
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
        $this->page->menu_active    = 'roles';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        if ($option == 'list')
        {
            $table = $this->rol->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of roles', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->rol->get_form();
            $form = str_replace('{id}', 'add-rol', $form);

            $data['contents'] = str_replace(
                '{title}', 'New role', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $rol = 'window.user_create_id = ' . $this->session->get('user_id');
            $script = custom('script', '', $rol);
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
            return redirect()->to(base_url('signin'));

        $view   = $this->request->uri->getSegment(1);
        $option = $this->request->uri->getSegment(2);

        $this->page->page_name = $view;

        $data = $this->page->get_contents();

        $form = $this->rol->get_form();
        $form = str_replace('{id}', 'update-rol', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit role', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $rol = $this->rol->get_data($option);
        $rol = 'window.rol = ' . json_encode($rol);

        $script          = custom('script', '', $rol);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }
}

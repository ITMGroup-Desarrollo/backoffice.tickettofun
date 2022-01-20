<?php
namespace App\Controllers;

class Profile extends BaseController
{
    public $account_profile;

    public function __construct()
    {
        $this->account_profile = new \App\Models\Account_profile();
    }

    /**
    *Index page for this controller
    */
    public function index()
    {
        if ( ! $this->user->active_session())
            return redirect()->to(base_url('signin'));

        $view   = $this->request->uri->getSegment(1);

        $this->page->page_name = $view;

        $data = $this->page->get_contents();

        $form = $this->account_profile->get_form();

        $data['contents'] = str_replace(
            '{title}', 'Account Profle settings', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $profile = $this->account_profile->get_data($this->session->get('user_id'));

        $profile = 'window.profile = ' . json_encode($profile);
        $script = custom('script', '', $profile);

        $data['scripts'] = $script .  $data['scripts'];

        $pathAvatar = "window.pathAvatar = '{$this->config->item("avatar_addr")}'";
        $script = custom('script', '', $pathAvatar);

        $data['scripts'] = $script .  $data['scripts'];

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

        $this->page->page_name      = $view;
        $this->page->menu_active    = $view;
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        $user = new \App\Models\User();

        $form = $user->get_form();
        $form = str_replace('{id}', 'update-user', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit user', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $user = $this->User->get_data($option);
        $user = 'window.user = ' . json_encode($user);

        $script = custom('script', '', $user);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }
}

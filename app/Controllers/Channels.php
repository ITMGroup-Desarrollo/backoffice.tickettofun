<?php
namespace App\Controllers;

class Channels extends BaseController
{
    public $channel;

    public function __construct()
    {
        $this->channel = new \App\Models\Channel();
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
        $this->page->menu_active    = 'sales channels';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        if ($option == 'list')
        {
            $table = $this->channel->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of channels', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->channel->get_form();
            $form = str_replace('{id}', 'add-channel', $form);

            $data['contents'] = str_replace(
                '{title}', 'New channel', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $channel = 'window.user_create_id = ' . $this->session->get('user_id');
            $script = custom('script', '', $channel);
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

        $form = $this->channel->get_form();
        $form = str_replace('{id}', 'update-channel', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit channel', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $channel = $this->channel->get_data($option);
        $channel = 'window.channel = ' . json_encode($channel);

        $script = custom('script', '', $channel);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }
}

<?php
namespace App\Controllers;

use App\Libraries\Build;

class Prices extends BaseController
{
    public $price;
    public $build;

    public function __construct()
    {
        $this->build   = new Build();
        $this->price = new \App\Models\Price();
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
        $this->page->menu_active    = 'prices';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        if ($option == 'list')
        {
            $table = $this->price->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of Price', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $table, $data['contents']
            );
        }
        else
        {
            $form = $this->price->get_form();
            $form = str_replace('{id}', 'add-price', $form);

            $contents = $this->page->get_settings('prices');
            $table = $this->build->build_components($contents['PRICES_CONFIG_TABLE']);

            $data['contents'] = str_replace(
                '{title}', 'New price', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );

            $data['contents'] = str_replace(
                '{table}', $table, $data['contents']
            );

            $price           = 'window.user_create_id = ' . $this->session->get('user_id');
            $script          = custom('script', '', $price);
            $data['scripts'] = $script . $data['scripts'];
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

        $form = $this->price->get_form();
        $form = str_replace('{id}', 'update-price', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit price', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $data['contents'] = str_replace(
            '{table}', '', $data['contents']
        );

        $price = $this->price->get_data($option);
        $price = 'window.prices = ' . json_encode($price);

        $user_price  = 'window.user_create_id = ' . $this->session->get('user_id');
        $script_user = custom('script', '', $user_price);


        $script          = custom('script', '', $price);
        $data['scripts'] = $script_user. $script .  $data['scripts'];

        return view('Master', $data);
    }
}

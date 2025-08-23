<?php
namespace App\Controllers;

class Allotment_reservations extends BaseController
{
    public $allotment;
    public $allotment_reservation;

    public function __construct()
    {
        $this->allotment             = new \App\Models\Allotment();
        $this->allotment_reservation = new \App\Models\Allotment_reservation();
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
        $this->page->menu_active    = 'allotments';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        if ($option == 'reservation')
        {
            $table = $this->allotment_reservation->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of allotment reservations', $data['contents']
            );

            $businessUnitElement = $this->user->get_business_unties_element();

            $form = $this->allotment_reservation->get_form('search');
            $form = str_replace('{id}', 'search', $businessUnitElement.$form);

            $data['contents'] = str_replace(
                '{search}', $form, $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', '<hr>' . $table, $data['contents']
            );
        }

        $userId = 'window.user = ' . $this->session->get('user_id');

        $script          = custom('script', '', $userId);
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
        $option = $this->request->uri->getSegment(3);

        $this->page->page_name = $view;

        $data = $this->page->get_contents();

        $form = $this->allotment_reservation->get_form();
        $form = str_replace('{id}', 'update-allotment', $form);

        $data['contents'] = str_replace(
            '{title}', 'Update allotment', $data['contents']
        );

        $data['contents'] = str_replace(
            '{search}', '', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $allotment_reservation = $this->allotment_reservation->get_data($option);
        $allotment_reservation = 'window.allotments = ' . json_encode($allotment_reservation);


        $script          = custom('script', '', $allotment_reservation);
        $data['scripts'] = $script .  $data['scripts'];

        $userId = 'window.user = ' . $this->session->get('user_id');

        $script          = custom('script', '', $userId);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }

    public function create_configuration()
    {
        if ( ! $this->user->active_session())
            return redirect()->to(base_url('signin'));

        $view   = 'config';
        $option = $this->request->uri->getSegment(3);

        $this->page->page_name      = $view;
        $this->page->menu_active    = 'new';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        $form = $this->allotment->get_form();
        $form = str_replace('{id}', 'add-config', $form);

        $data['contents'] = str_replace(
            '{title}', 'New configuration', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $userId = 'window.user = ' . $this->session->get('user_id');

        $script          = custom('script', '', $userId);
        $data['scripts'] = $script . $data['scripts'];

        return view('Master', $data);
    }

    /**
    *Configuration page for to connect config_base with this controller
    */
    public function configuration()
    {
        if ( ! $this->user->active_session())
            return redirect()->to(base_url('signin'));

        $view   = 'config';
        $option = $this->request->uri->getSegment(2);


        $this->page->page_name      = $view;
        $this->page->menu_active    = 'list';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();
        $table = $this->allotment->get_list();

        $data['contents'] = str_replace(
            '{title}', 'Configuration schedules', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $table, $data['contents']
        );

        return view('Master', $data);
    }

    /**
    *Update page for this controller
    */
    public function configuration_update()
    {
        if ( ! $this->user->active_session())
            return redirect()->to(base_url('signin'));

        $view   = 'config';
        $option = $this->request->uri->getSegment(3);

        $this->page->page_name = $view;

        $data = $this->page->get_contents();

        $form = $this->allotment->get_form();
        $form = str_replace('{id}', 'update-config', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit schedules config', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $config = $this->allotment->get_data($option);
        $config = 'window.config = ' . json_encode($config);

        $userId = 'window.user = ' . $this->session->get('user_id');
        $script = custom('script', '', $config);
        $script .= custom('script', '', $userId);

        $data['scripts'] = $script . $data['scripts'];

        return view('Master', $data);
    }

}

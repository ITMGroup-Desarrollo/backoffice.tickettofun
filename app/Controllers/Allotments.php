<?php
namespace App\Controllers;

class Allotments extends BaseController
{
    public $arrive;
    public $allotment;

    public function __construct()
    {
        $this->arrive = new \App\Models\Arrive();
        $this->allotment = new \App\Models\Allotment();
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
        $this->page->menu_active    = 'cruise';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        if ($option == 'list')
        {
            $table = $this->allotment->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of allotment', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', '', $data['contents']
            );
        }
        else
        {
            $form = $this->allotment->get_form();
            $form = str_replace('{id}', 'add-allotment', $form);

            $data['contents'] = str_replace(
                '{title}', 'New allotment', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );
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

        $this->ship = new \App\Models\Ship();

        $form = $this->ship->get_form();
        $form = str_replace('{id}', 'update-ship', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit cruise', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $ship = $this->Ship->get_data('',$option);
        $ship = 'window.ships = ' . json_encode($ship);

        $script = custom('script', '', $ship);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }

    public function itinerary()
    {
        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = 'schedules';
        $option = $this->request->uri->getSegment(2);
        $id     = $this->request->uri->getSegment(3);


        $this->page->page_name = $view;
        $this->page->menu_active = 'allotments';

        $data = $this->page->get_contents();

        $arrive_data = $this->arrive->get_data($id);

        $call = $arrive_data->reseller_name . ' / ';
        $call .= $arrive_data->ship_name . ' / ';
        $call .= $arrive_data->arrival_date . ' / ';
        $call .= $arrive_data->arrival_time . '-' . $arrive_data->departure_time;

        $dynamic_element = $this->_get_dynamic_html($id);

        $data['contents'] = str_replace('{call}', $call, $data['contents']);

        $header_keys = [
            '{title}',
            '{content}'
        ];

        $header_elements = [
            'Schedules List',
            $dynamic_element['filters_form'] . '<hr>' . $dynamic_element['table']
        ];

        $data['contents'] = str_replace(
            $header_keys, $header_elements, $data['contents']
        );

        $userId = 'window.user = ' . $this->session->get('user_id');
        $script2 = custom('script', '', $userId);

        $arrive = 'window.arrive_data = ' . json_encode($arrive_data);
        $script = custom('script', '', $arrive);
        $data['scripts'] = $script . $script2 . $data['scripts'];

        return view('Master', $data);
    }

    public function get_dynamic_html($id)
    {
        echo json_encode($this->_get_dynamic_html($id));
    }

    private function _get_dynamic_html($id)
    {
        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = 'schedules';
        $id     = $this->request->uri->getSegment(3);

        $this->page->page_name = $view;

        $table = $this->allotment->get_table_html($id);

        $filters_form = $this->allotment->get_form('schedule_filters','schedules');
        $filters_form = str_replace('{id}', 'dynamic-filters', $filters_form);

        return array(
            'filters_form' => $filters_form,
            'table' => $table
        );
    }

    /**
    *Configuration page for to connect config_base with this controller
    */
    public function configuration()
    {
        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = 'config';
        $option = $this->request->uri->getSegment(2);

        $this->page->page_name      = $view;
        $this->page->menu_active    = 'allotments';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        $table = $this->allotment->get_list();
        $form = $this->allotment->get_form('filters',$view);

        $header_keys = [
            '{title}',
            '{channel-name}',
            '{reseller-name}',
            '{service-name}',
            '{filters}',
            '{content}'
        ];

        $date_today = !empty($table['data-header']) ? $table['data-header']->start_date:date('Y-m-d');

        $header_elements = [
            'Configuration schedules',
            'Start date: '.date_format(date_create($date_today), 'l jS F Y'),
            '',
            '',
            $form,
            '<hr>'.$table['table-data']
        ];

        $data['contents'] = str_replace(
            $header_keys, $header_elements, $data['contents']
        );

        $userId = 'window.user = ' . $this->session->get('user_id');

        $script          = custom('script', '', $userId);
        $data['scripts'] = $script . $data['scripts'];

        return view('Master', $data);
    }

    public function create_configuration()
    {
        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = 'config';
        $option = $this->request->uri->getSegment(2);

        $this->page->page_name      = $view;
        $this->page->menu_active    = 'allotments';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        $form = $this->allotment->get_form(null, 'config');
        $form = str_replace('{id}', 'add-config', $form);

        $data['contents'] = str_replace(
            '{title}', 'New configuration', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $data['contents'] = str_replace(
            '{channel-name}', '', $data['contents']
        );
        $data['contents'] = str_replace(
            '{reseller-name}', '', $data['contents']
        );
        $data['contents'] = str_replace(
            '{service-name}', '', $data['contents']
        );

        $data['contents'] = str_replace(
            '{filters}', '', $data['contents']
        );

        $userId = 'window.user = ' . $this->session->get('user_id');

        $script = custom('script', '', $userId);
        $data['scripts'] = $script . $data['scripts'];

        return view('Master', $data);
    }

    /**
    *Update page for this controller
    */
    public function configuration_update()
    {
        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = 'config';// $this->request->uri->getSegment(1);
        $option = $this->request->uri->getSegment(3);

        $this->page->page_name = $view;
        $this->page->menu_active = 'allotments';

        $data = $this->page->get_contents();

        $form = $this->allotment->get_form(null, 'config');
        $form = str_replace('{id}', 'update-config', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit schedules config', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $data['contents'] = str_replace(
            '{channel-name}', '', $data['contents']
        );
        $data['contents'] = str_replace(
            '{reseller-name}', '', $data['contents']
        );
        $data['contents'] = str_replace(
            '{service-name}', '', $data['contents']
        );

        $data['contents'] = str_replace(
            '{filters}', '', $data['contents']
        );

        $config = $this->allotment->get_data('',$option);
        $config = 'window.config = ' . json_encode($config);

        $userId = 'window.user = ' . $this->session->get('user_id');
        $script = custom('script', '', $config);
        $script .= custom('script', '', $userId);
        $data['scripts'] = $script . $data['scripts'];

        return view('Master', $data);
    }

    /**
    *clone page for this controller
    */
    public function clone()
    {
        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $this->page->page_name = 'clone';

        $data = $this->page->get_contents();
        $form = $this->allotment->get_form('clone', 'clone');

        $data['contents'] = str_replace('{title}', 'Allotments',  $data['contents']);
        $data['contents'] = str_replace('{call}', '',  $data['contents']);

        $data['contents'] = str_replace(
            '{Form}', $form, $data['contents']
        );

        $table = $this->allotment->get_list_clone();

        $data['contents'] = str_replace(
            '{content}', $table, $data['contents']
        );

        $data['contents'] = str_replace(
            '{id}', 'clone-form', $data['contents']
        );

        $vendor      = "";
        $cruise      = "";
        $channel     = "";
        $arrivalDate = "";
        $arrivalTime = "";

        $dataArrive = array();

        if ($this->request->uri->getSegment(3))
        {
            $arrive_data = $this->arrive->get_data($this->request->uri->getSegment(3));

            $channel     = $arrive_data->channel_name;
            $vendor      = $arrive_data->reseller_name;
            $cruise      = $arrive_data->ship_name;
            $arrivalDate = $arrive_data->arrival_date;
            $arrivalTime = $arrive_data->arrival_time_markup." - ".$arrive_data->departure_time_markup;

            $dataArrive['arriveId']  = $this->request->uri->getSegment(3);
            $dataArrive['channelId'] = $arrive_data->channel_id;
            $dataArrive['vendorId']  = $arrive_data->reseller_id;
            $dataArrive['vendor']    = $arrive_data->reseller_name;
            $dataArrive['cruiseId']  = $arrive_data->ship_id;
            $dataArrive['cruise']    = $arrive_data->ship_name;
            $dataArrive['date']      = $arrivalDate;
        }
        else
        {
            if (!empty($this->input->post('modalchannel')))
            {
                $channel     = $this->input->post('modalchanneltext');
                $vendor      = $this->input->post('modalvendortext');
                $arrivalDate = $this->input->post('modaldate');

                if ($this->input->post('modalcruise') != null && $this->input->post('modaldate') != null) {
                    $cruise = $this->input->post('modalcruisetext');
                    $cruiseId = $this->input->post('modalcruise');

                    $dataArrive['cruiseId'] = $cruiseId;
                    $dataArrive['cruise'] = $cruise;
                }

                $dataArrive['arriveId']  = null;
                $dataArrive['channelId'] = $this->input->post('modalchannel');
                $dataArrive['vendorId']  = $this->input->post('modalvendor');
                $dataArrive['vendor']    = $vendor;
                $dataArrive['date']      = $arrivalDate;
            }

        }

        $data['contents'] = str_replace(
            '{channel-text}', $channel, $data['contents']
        );
        $data['contents'] = str_replace(
            '{reseller-text}', $vendor, $data['contents']
        );
        $data['contents'] = str_replace(
            '{cruise-text}', $cruise, $data['contents']
        );
        $data['contents'] = str_replace(
            '{arrival-text}', $arrivalDate, $data['contents']
        );
        $data['contents'] = str_replace(
            '{time-text}', $arrivalTime, $data['contents']
        );

        $userId          = 'window.user = ' . $this->session->get('user_id');
        $script          = custom('script', '', $userId);
        $data['scripts'] = $script .  $data['scripts'];

        $dayaArrive = 'window.dataArrive = ' . json_encode($dataArrive);
        $script     = custom('script', '', $dayaArrive);

        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }

    /**
    *config page for this controller
    */
    public function config()
    {
        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $this->page->page_name = 'allotments-config';

        $data = $this->page->get_contents();

        $data['contents'] = str_replace('{title}', 'Allotments',  $data['contents']);
        $data['contents'] = str_replace('{call}', '',  $data['contents']);

        $cruiseId = $this->input->post('cruise');

        $html = "";
        $channel = $vendor = $cruise = $arrivalDate = $arrivalTime = "";

        switch ($this->input->post('channel')) {
            case 1:
                $cruiseId = $this->input->post('cruise');
                $date     = $this->input->post('date');
                $arrive   = $this->allotment->get_arrive_data($cruiseId, $date);

                if ($arrive->code == 200) {
                    $channel      = $arrive->channel_name;
                    $vendor       = $arrive->vendor_name;
                    $cruise       = $arrive->cruise_name;
                    $arrivalDate  = $arrive->arrival_date;
                    $arrivalTime  = $arrive->arrival_time;
                }

                $html = $this->allotment->div_element('CHANNEL', $channel);
                $html .= $this->allotment->div_element('VENDOR', $vendor);
                $html .= $this->allotment->div_element('CRUISE', $cruise);
                $html .= $this->allotment->div_element('ARRIVAL DATE', $arrivalDate);
                $html .= $this->allotment->div_element('ARRIVAL TIME', $arrivalTime);

            break;
            case 2:
                $html     = $this->allotment->div_element('CHANNEL', 'Web');
                $reseller = $this->allotment->get_data_id('reseller', $this->input->post('vendor'));

                if ($reseller->code == 200){
                    $vendor = $reseller->vendor_name;
                }

                $html .= $this->allotment->div_element('VENDOR', $vendor);
                $html .= $this->allotment->div_element('DATE', $this->input->post('date'));
            break;
            case 3:
                $html     = $this->allotment->div_element('CHANNEL', 'LMPS');
                $reseller = $this->allotment->get_data_id('reseller', $this->input->post('vendor'));

                if ($reseller->code == 200){
                    $vendor = $reseller->vendor_name;
                }
                $html .= $this->allotment->div_element('VENDOR', $vendor);

                if (!empty($this->input->post('cruise')))
                {
                    $cruise = $this->allotment->get_data_id('cruise', $this->input->post('cruise'));
                    if ($cruise->code == 200){
                        $vendorCruise = $cruise->vendor_name;
                        $cruise = $cruise->cruise_name;
                    }

                    $html .= $this->allotment->div_element('VENDOR CRUISE', $vendorCruise);
                    $html .= $this->allotment->div_element('CRUISE', $cruise);
                }

                $html .= $this->allotment->div_element('DATE', $this->input->post('date'));
            break;
        }

        $data['contents'] = str_replace(
            '{detail}', $html, $data['contents']
        );

        $form = $this->allotment->get_form('form_edit', 'allotments-config');

        $data['contents'] = str_replace(
            '{Form}', $form, $data['contents']
        );

        $table = $this->allotment->get_list_allotment_update();

        $data['contents'] = str_replace(
            '{content}', $table, $data['contents']
        );

        $data['contents'] = str_replace(
            '{id}', 'clone-form', $data['contents']
        );

        $userId          = 'window.user = ' . $this->session->get('user_id');
        $script          = custom('script', '', $userId);
        $data['scripts'] = $script .  $data['scripts'];

        $dayaArrive      = 'window.dataArrive = ' . json_encode($this->input->post());
        $script          = custom('script', '', $dayaArrive);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }

    public function transfer()
    {
        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = $this->request->uri->getSegment(1);
        $option = $this->request->uri->getSegment(2);

        $this->page->page_name = $option;
        $this->page->menu_active = 'allotments';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        $form = $this->allotment->get_form($option,$view);

        $form = str_replace('{id}', 'form-transfer', $form);

        $data['contents'] = str_replace(
            '{title}', 'Transferring of allotments', $data['contents']
        );

        $data['contents'] = str_replace(
            '{search}', '', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $userId          = 'window.user_create_id = ' . $this->session->get('user_id');
        $script          = custom('script', '', $userId);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }

}

<?php
namespace App\Controllers;

use stdClass;
use App\Libraries\Api;

class Allotments extends BaseController
{
    public $api;
    public $arrive;
    public $allotment;

    public function __construct()
    {
        $this->api       = new Api();
        $this->arrive    = new \App\Models\Arrive();
        $this->allotment = new \App\Models\Allotment();
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
            return redirect()->to(base_url('signin'));

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
            return redirect()->to(base_url('signin'));

        $view   = 'schedules';
        $id     = $this->request->uri->getSegment(3);

        $this->page->page_name = $view;
        $this->page->menu_active = 'allotments';

        $data = $this->page->get_contents();

        $arrive_data = $this->arrive->get_data($id);

        $call = $arrive_data->reseller_name . ' / ';
        $call .= $arrive_data->ship_name . ' / ';
        $call .= $arrive_data->arrival_date . ' / ';
        $call .= $arrive_data->arrival_time . '-' . $arrive_data->departure_time;

        $params = new stdClass();

        $token              = $this->session->get('token');
        $endpoint           = GET_ALLOTMENTS_ROUTE;
        $params->start_date = $arrive_data->arrival_date;

        $response = json_decode(
            $this->api->request_api('POST', $endpoint, $params, $token)
        );

        $dataRows = "";
        if ($response->code == 200)
        {
            $rows = $response->message;

            for ($i = 0; $i < count($rows); $i++)
            {
                if ($rows[$i]->active_status == 1) {
                    $column = "";

                    $shared = "No";
                    if ($rows[$i]->shared_schedule == 1) {
                        $shared = "Yes";
                    }

                    $private = "No";
                    if ($rows[$i]->private_service == 1) {
                        $private = "Yes";
                    }

                    $column = custom('td', '', $rows[$i]->allotment_id);
                    $column .= custom('td', '', $rows[$i]->channel_name);
                    $column .= custom('td', '', $rows[$i]->reseller_name);
                    $column .= custom('td', '', $rows[$i]->ship_name);
                    $column .= custom('td', '', $rows[$i]->service_name);
                    $column .= custom('td', '', "{$rows[$i]->min_available} - {$rows[$i]->max_available}");
                    $column .= custom('td', '', "{$rows[$i]->schedule_start} - {$rows[$i]->schedule_end}");
                    $column .= custom('td', '', $shared);
                    $column .= custom('td', '', $private);

                    $dataRows .= custom('tr', '', $column);
                }
            }
        }

        $data['contents'] = str_replace('{rows}', $dataRows, $data['contents']);
        $data['contents'] = str_replace('{cruise-edit}', $call, $data['contents']);
        $data['contents'] = str_replace('{id}', 'schedules-search', $data['contents']);
        $data['contents'] = str_replace('{title}', 'Schedules suggested', $data['contents']);
        $data['contents'] = str_replace('{text}', 'Allotments for ', $data['contents']);

        $userId = 'window.user = ' . $this->session->get('user_id');
        $script = custom('script', '', $userId);

        $arrive = 'window.arrive_data = ' . json_encode($arrive_data);
        $script .= custom('script', '', $arrive);

        $data['scripts'] = $script . $data['scripts'];

        return view('Master', $data);
    }

    public function get_dynamic_html($id)
    {
        echo json_encode($this->_get_dynamic_html($id));
    }

    private function _get_dynamic_html($id)
    {
        if ( ! $this->user->active_session())
            return redirect()->to(base_url('signin'));

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
            return redirect()->to(base_url('signin'));

        $view   = 'config';
        $option = $this->request->uri->getSegment(2);

        $this->page->page_name      = $view;
        $this->page->menu_active    = 'allotments';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        $table = $this->allotment->get_list();

        $form = $this->allotment->get_form('filters', $view);
        $form = str_replace('{id}', 'filters', $form);

        $data['contents'] = str_replace('{filters}', $form, $data['contents']);
        $data['contents'] = str_replace('{content}', $table['table-data'], $data['contents']);
        $data['contents'] = str_replace('{title}', 'Configuration schedules', $data['contents']);

        $userId = 'window.user = ' . $this->session->get('user_id');

        $script          = custom('script', '', $userId);
        $data['scripts'] = $script . $data['scripts'];

        return view('Master', $data);
    }

    public function create_configuration()
    {
        if ( ! $this->user->active_session())
            return redirect()->to(base_url('signin'));

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
            return redirect()->to(base_url('signin'));

        $view   = 'config';// $this->request->uri->getSegment(1);
        $id = $this->request->uri->getSegment(3);
        $option = $this->request->uri->getSegment(2);

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

        $config = $this->allotment->get_data($id, $option);

        if (! property_exists($config, 'id')) {
            return redirect()->to('allotments/configuration');
        }

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
            return redirect()->to(base_url('signin'));

        $this->page->page_name = 'clone';

        $data = $this->page->get_contents();

        $data['contents'] = str_replace('{title}', 'Clone allotments',  $data['contents']);
        $data['contents'] = str_replace('{call}', '',  $data['contents']);

        $data['contents'] = str_replace('{text-form}', 'Search allotment to clone',  $data['contents']);
        $data['contents'] = preg_replace('/{id}/', 'search-form', $data['contents'], 1);

        $data['contents'] = str_replace(
            '{content}', '', $data['contents']
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
        $display = 'none';

        /* if ($this->request->uri->getSegment(3))
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

            $display = 'block';
        }
        else
        {
            if (!empty($this->request->getPost('channel')))
            {
                $channel     = $this->request->getPost('modalchanneltext');
                $vendor      = $this->request->getPost('modalvendortext');
                $arrivalDate = $this->request->getPost('date');

                if ($this->request->getPost('cruise') != null && $this->request->getPost('date') != null) {
                    $cruise = $this->request->getPost('modalcruisetext');
                    $cruiseId = $this->request->getPost('cruise');

                    $dataArrive['cruiseId'] = $cruiseId;
                    $dataArrive['cruise'] = $cruise;
                }

                $dataArrive['arriveId']  = null;
                $dataArrive['channelId'] = $this->request->getPost('channel');
                $dataArrive['vendorId']  = $this->request->getPost('reseller');
                $dataArrive['vendor']    = $vendor;
                $dataArrive['date']      = $arrivalDate;
            }

        }
 */
        $data['contents'] = str_replace(
            '{display}', $display, $data['contents']
        );

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
            return redirect()->to(base_url('signin'));

        $this->page->page_name = 'allotments-config';

        $data = $this->page->get_contents();

        $data['contents'] = str_replace('{title}', 'Allotments',  $data['contents']);
        $data['contents'] = str_replace('{call}', '',  $data['contents']);

        $cruiseId = $this->request->getPost('cruise');

        $html = "";
        $channel = $vendor = $cruise = $arrivalDate = $arrivalTime = "";

        switch ($this->request->getPost('channel')) {
            case 1:
                $cruiseId = $this->request->getPost('cruise');
                $date     = $this->request->getPost('date');
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
                $reseller = $this->allotment->get_data_id('reseller', $this->request->getPost('vendor'));

                if ($reseller->code == 200){
                    $vendor = $reseller->vendor_name;
                }

                $html .= $this->allotment->div_element('VENDOR', $vendor);
                $html .= $this->allotment->div_element('DATE', $this->request->getPost('date'));
            break;
            case 3:
                $html     = $this->allotment->div_element('CHANNEL', 'LMPS');
                $reseller = $this->allotment->get_data_id('reseller', $this->request->getPost('vendor'));

                if ($reseller->code == 200){
                    $vendor = $reseller->vendor_name;
                }
                $html .= $this->allotment->div_element('VENDOR', $vendor);

                if (!empty($this->request->getPost('cruise')))
                {
                    $cruise = $this->allotment->get_data_id('cruise', $this->request->getPost('cruise'));
                    if ($cruise->code == 200){
                        $vendorCruise = $cruise->vendor_name;
                        $cruise = $cruise->cruise_name;
                    }

                    $html .= $this->allotment->div_element('VENDOR CRUISE', $vendorCruise);
                    $html .= $this->allotment->div_element('CRUISE', $cruise);
                }

                $html .= $this->allotment->div_element('DATE', $this->request->getPost('date'));
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

        $dayaArrive      = 'window.dataArrive = ' . json_encode($this->request->getPost());
        $script          = custom('script', '', $dayaArrive);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }

    public function transfer()
    {
        if ( ! $this->user->active_session())
            return redirect()->to(base_url('signin'));

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

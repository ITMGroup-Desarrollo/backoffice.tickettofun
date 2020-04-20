<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Allotments extends CI_Controller
{
    /**
    *Index page for this controller
    */
    public function index()
    {
        $this->load->library('user_session', NULL, 'user');

        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = $this->uri->segment(1);
        $option = $this->uri->segment(2);

        $this->load->Model('Page');
        $this->Page->page_name = $view;
        $this->Page->menu_active = 'cruise';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('Allotment');

        if ($option == 'list')
        {

            $table = $this->Allotment->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of allotment', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', '', $data['contents']
            );
        }
        else
        {
            $form = $this->Allotment->get_form();
            $form = str_replace('{id}', 'add-allotment', $form);

            $data['contents'] = str_replace(
                '{title}', 'New allotment', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );
        }

        $this->load->view('Master', $data);
    }

    /**
    *Update page for this controller
    */
    public function update()
    {
        $this->load->library('user_session', NULL, 'user');

        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = $this->uri->segment(1);
        $option = $this->uri->segment(2);

        $this->load->Model('Page');
        $this->Page->page_name = $view;

        $data = $this->Page->get_contents();

        $this->load->Model('Ship');

        $form = $this->Ship->get_form();
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

        $this->load->view('Master', $data);
    }

    public function itinerary() {
        $this->load->library('user_session', NULL, 'user');

        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = 'schedules';
        $option = $this->uri->segment(2);
        $id = $this->uri->segment(3);

        $this->load->Model('Page');
        $this->Page->page_name = $view;
        $this->Page->menu_active = 'allotments';

        $data = $this->Page->get_contents();

        $this->load->Model('Arrive');
        $arrive_data = $this->Arrive->get_data($id);

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

        $userId = 'window.user = ' . $this->session->userdata('user_id');
        $script2 = custom('script', '', $userId);

        $arrive = 'window.arrive_data = ' . json_encode($arrive_data);
        $script = custom('script', '', $arrive);
        $data['scripts'] = $script . $script2 . $data['scripts'];

        $this->load->view('Master', $data);
    }

    public function get_dynamic_html($id) {
        echo json_encode($this->_get_dynamic_html($id));
    }

    private function _get_dynamic_html($id) {
        $this->load->library('user_session', NULL, 'user');

        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = 'schedules';
        $id = $this->uri->segment(3);

        $this->load->Model('Page');
        $this->Page->page_name = $view;

        $this->load->Model('Allotment');

        $table = $this->Allotment->get_table_html($id);

        $filters_form = $this->Allotment->get_form('schedule_filters','schedules');
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
        $this->load->library('user_session', NULL, 'user');

        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = 'config';
        $option = $this->uri->segment(2);

        $this->load->Model('Page');
        $this->Page->page_name = $view;
        $this->Page->menu_active = 'allotments';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('Allotment');

        $table = $this->Allotment->get_list();

        $form = $this->Allotment->get_form('filters');

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

        $userId = 'window.user = ' . $this->session->userdata('user_id');

        $script = custom('script', '', $userId);
        $data['scripts'] = $script . $data['scripts'];

        $this->load->view('Master', $data);
    }

    public function create_configuration()
    {
        $this->load->library('user_session', NULL, 'user');

        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = 'config';
        $option = $this->uri->segment(2);

        $this->load->Model('Page');
        $this->Page->page_name = $view;
        $this->Page->menu_active = 'allotments';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('Allotment');

        $form = $this->Allotment->get_form(null, 'config');
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

        $userId = 'window.user = ' . $this->session->userdata('user_id');

        $script = custom('script', '', $userId);
        $data['scripts'] = $script . $data['scripts'];

        $this->load->view('Master', $data);
    }

    /**
    *Update page for this controller
    */
    public function configuration_update()
    {
        $this->load->library('user_session', NULL, 'user');

        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = 'config';// $this->uri->segment(1);
        $option = $this->uri->segment(3);

        $this->load->Model('Page');
        $this->Page->page_name = $view;
        $this->Page->menu_active = 'allotments';

        $data = $this->Page->get_contents();

        $this->load->Model('Allotment');

        $form = $this->Allotment->get_form(null, 'config');
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

        $config = $this->Allotment->get_data('',$option);
        $config = 'window.config = ' . json_encode($config);

        $userId = 'window.user = ' . $this->session->userdata('user_id');
        $script = custom('script', '', $config);
        $script .= custom('script', '', $userId);
        $data['scripts'] = $script . $data['scripts'];

        $this->load->view('Master', $data);
    }

    public function clone()
    {
        $this->load->library('user_session', NULL, 'user');

        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $this->load->Model('Page');
        $this->Page->page_name = 'clone';

        $data = $this->Page->get_contents();
        $this->load->Model('Allotment');

        $form = $this->Allotment->get_form('clone', 'clone');

        $data['contents'] = str_replace('{title}', 'Allotments',  $data['contents']);
        $data['contents'] = str_replace('{call}', '',  $data['contents']);

        $data['contents'] = str_replace(
            '{Form}', $form, $data['contents']
        );

        $table = $this->Allotment->get_list_clone();

        $data['contents'] = str_replace(
            '{content}', $table, $data['contents']
        );

        $data['contents'] = str_replace(
            '{id}', 'clone-form', $data['contents']
        );

        $channel = $vendor = $cruise = $arrivalDate = $arrivalTime = "";
        $dataArrive = array();

        if ($this->uri->segment(3))
        {
            $this->load->Model('Arrive');
            $arrive_data = $this->Arrive->get_data($this->uri->segment(3));

            $channel = $arrive_data->channel_name;
            $vendor = $arrive_data->reseller_name;
            $cruise = $arrive_data->ship_name;
            $arrivalDate = $arrive_data->arrival_date;
            $arrivalTime = $arrive_data->arrival_time_markup." - ".$arrive_data->departure_time_markup;

            $dataArrive['arriveId'] = $this->uri->segment(3);
            $dataArrive['channelId'] = $arrive_data->channel_id;
            $dataArrive['vendorId'] = $arrive_data->reseller_id;
            $dataArrive['vendor'] = $arrive_data->reseller_name;
            $dataArrive['cruiseId'] = $arrive_data->ship_id;
            $dataArrive['cruise'] = $arrive_data->ship_name;
            $dataArrive['date'] = $arrivalDate;
        }
        else
        {
            if (!empty($this->input->post('modalchannel')))
            {
                $channel = $this->input->post('modalchanneltext');
                $vendor =   $this->input->post('modalvendortext');
                $arrivalDate = $this->input->post('modaldate');

                if ($this->input->post('modalcruise') != null && $this->input->post('modaldate') != null) {
                    $this->load->Model('Arrive');
                    $cruise = $this->input->post('modalcruisetext');
                    $cruiseId = $this->input->post('modalcruise');

                    $dataArrive['cruiseId'] = $cruiseId;
                    $dataArrive['cruise'] = $cruise;
                }

                $dataArrive['arriveId'] = null;
                $dataArrive['channelId'] = $this->input->post('modalchannel');
                $dataArrive['vendorId'] = $this->input->post('modalvendor');
                $dataArrive['vendor'] = $vendor;
                $dataArrive['date'] = $arrivalDate;
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

        $userId = 'window.user = ' . $this->session->userdata('user_id');
        $script = custom('script', '', $userId);
        $data['scripts'] = $script .  $data['scripts'];

        $dayaArrive = 'window.dataArrive = ' . json_encode($dataArrive);
        $script = custom('script', '', $dayaArrive);
        $data['scripts'] = $script .  $data['scripts'];

        $this->load->view('Master', $data);
    }

}

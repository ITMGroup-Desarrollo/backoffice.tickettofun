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

        $ship = $this->Ship->get_data($option);
        $ship = 'window.ships = ' . json_encode($ship);

        $script = custom('script', '', $ship);
        $data['scripts'] = $script .  $data['scripts'];

        $this->load->view('Master', $data);
    }

    public function itinerary(){
        $this->load->library('user_session', NULL, 'user');

        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = 'schedules'/* $this->uri->segment(1) */;
        $option = $this->uri->segment(2);
        $id = $this->uri->segment(3);

        $this->load->Model('Page');
        $this->Page->page_name = $view;

        $data = $this->Page->get_contents();

        $this->load->Model('Arrive');

        $json_data = $this->Arrive->get_data($id);

        echo "<pre>"; print_r($json_data); exit;

        $arrival_parts = explode(":", $json_data->arrival_time);
        $depart_parts = explode(":", $json_data->departure_time);

        $start_time = strtotime($json_data->arrival_time) + strtotime($json_data->markup_start);
        $end_time = strtotime($json_data->departure_time) - strtotime($json_data->markup_end);
        echo "start_time " . date('H:i', $start_time) . "<br>";
        echo "end_time " . date('H:i', $end_time);
        $arrival_time = new DateTime($json_data->arrival_date.' '.date('H:i',$start_time));//fecha inicial
        $departure_time = new DateTime($json_data->arrival_date.' '.date('H:i',$end_time));//fecha de cierre
        $ship_docking = $arrival_time->diff($departure_time);
        $atrack_time = $ship_docking->format('%H');

        // Obetener duracion del servicio (Tour) que se requiere
        // $total_atrack_time = $arrival_parts[1] + $arrival_parts[0]*60;

        // echo "<pre>";
        // print_r($json_data);
        echo "Ship docking ".$atrack_time." horas";
        // exit;
        $data['contents'] = str_replace(
            // '{title}', 'Generating schedules '.$view.' '.$option.' '.$id, $data['contents']
            '{title}', 'Generating schedules ', $data['contents']
        );

        $arrival = new DateTime($json_data->arrival_date);
        $arrivalTime = new DateTime($json_data->arrival_time);
        $departureTime = new DateTime($json_data->departure_time);
        $header_keys = [
            '{ship-name}',
            '{date-start}',
            '{arrival}',
            '{departure}'
        ];
        $header_elements = [
            $json_data->ship_name,
            $arrival->format('F dS, Y'),
            'Arrive: '.$arrivalTime->format('H:ia'),
            'Departure: '.$departureTime->format('H:ia')
        ];

        $data['contents'] = str_replace(
            $header_keys, $header_elements, $data['contents']
        );

        $this->load->view('Master', $data);
    }

    /**
    *Configuration page for to connect config_base with this controller
    */
    public function configuration()
    {
        $this->load->library('user_session', NULL, 'user');

        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = 'config';// $this->uri->segment(1);
        $option = $this->uri->segment(2);

        $this->load->Model('Page');
        $this->Page->page_name = $view;
        $this->Page->menu_active = 'list';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('Allotment');

        $table = $this->Allotment->get_list();

        $data['contents'] = str_replace(
            '{title}', 'Configuration schedules', $data['contents']
        );

        $data['contents'] = str_replace(
            '{channel-name}', $table[1] ? $table[1]->channel_name:'', $data['contents']
        );
        $data['contents'] = str_replace(
            '{reseller-name}', $table[1] ? $table[1]->reseller_name:'', $data['contents']
        );
        $data['contents'] = str_replace(
            '{service-name}', $table[1] ? $table[1]->service_name:'', $data['contents']
        );

        $form = $this->Allotment->get_form('filters');

        $data['contents'] = str_replace(
            '{filters}', $form, $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', '<hr>'.$table[0], $data['contents']
        );

        $this->load->view('Master', $data);
    }

    public function create_configuration()
    {
        $this->load->library('user_session', NULL, 'user');

        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = 'config';//$this->uri->segment(2);
        $option = $this->uri->segment(3);

        $this->load->Model('Page');
        $this->Page->page_name = $view;
        $this->Page->menu_active = 'new';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('Allotment');

        $form = $this->Allotment->get_form();
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

        // $form = $this->Allotment->get_form('filters');

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

        $data = $this->Page->get_contents();

        $this->load->Model('Allotment');

        $form = $this->Allotment->get_form();
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

        // $form = $this->Allotment->get_form('filters');

        $data['contents'] = str_replace(
            '{filters}', '', $data['contents']
        );

        $config = $this->Allotment->get_data($option);
        $config = 'window.config = ' . json_encode($config);

        $userId = 'window.user = ' . $this->session->userdata('user_id');
        $script = custom('script', '', $config);
        $script .= custom('script', '', $userId);
        $data['scripts'] = $script . $data['scripts'];

        $this->load->view('Master', $data);
    }

}

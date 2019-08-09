<?php

/**
* Client Class
*
* @package CodeIgniter
* @category Models
* @Author ITM Dev Team
* @Since Version 1.0.0
*/
class Ship extends CI_Model
{
    public $model;
    public $active;
    public $attrib;
    public $inactive;
    public $anchor_attrib;

    public function __construct()
    {
        $this->model = '';
        parent::__construct();

        $this->attrib = array('class' => 'center');
        $this->active = array('class' => 'label label-success');
        $this->inactive = array('class' => 'label label-danger');
    }

    public function get_list()
    {
        $this->db->close();
        $table_content = $this->Page->get_settings('ships');
        $table_content = $this->build->build_components(
            $table_content['SHIPS_TABLE']
        );

        // Call API here!
        $params = new stdClass();
        $endpoint = HOST . GET_SHIPS_ROUTE;

        $this->load->library('session');
        $token = $this->session->userdata('token');
        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        if ($response->code == 200)
        {
            $rows = $response->message;
            foreach ($rows as $row)
            {
                $aux = '';
                $this->anchor_attrib = array();

                $aux .= custom('td', '', $row->ship_name);
                $aux .= custom('td', '', $row->reseller_name);
                $aux .= custom('td', '', $row->ship_capacity);
                $aux .= custom('td', '', $row->ship_weight);

                $status = '';
                $delete = '';
                if ($row->active_status == 1)
                {
                    $status = custom('span', $this->active, 'Active');
                }
                else
                {
                    $status = custom('span', $this->inactive, 'Inactive');
                }

                $status_attrib = $this->attrib;
                $status_attrib['data-status'] =  $row->ship_id;
                $aux .= custom('td', $status_attrib, $status);

                $path = 'ships/' . $row->ship_id;
                $this->anchor_attrib['class'] = 'edit';
                $this->anchor_attrib['href'] = base_url($path);
                $edit = custom('i', array('class' => 'fas fa-edit'), '');

                $edit = custom('a', $this->anchor_attrib, $edit);

                if ($row->active_status == 1) {
                    $this->anchor_attrib['href'] = '#';
                    $this->anchor_attrib['class'] = 'delete';
                    $this->anchor_attrib['data-id'] = $row->ship_id;
                    $delete = custom('i', array('class' => 'fas fa-trash'), '');

                    $delete = custom('a', $this->anchor_attrib, $delete);
                }

                $aux .= custom('td', $this->attrib, $edit . $delete);

                $this->model .= custom('tr', '', $aux);
            }
        }
        else
        {
            $aux = '';
            for ($i = 0; $i < 6; $i++)
                $aux .= custom('td', '', '');

            $this->model = custom('tr', '', $aux);
        }

        $this->model = str_replace('{rows}', $this->model, $table_content);

        return $this->model;
    }

    public function get_form()
    {
        $this->db->close();
        $contents = $this->Page->get_settings('ships');

        $this->model = $this->build->build_components(
            $contents['SHIPS_FORM']
        );

        return $this->model;
    }

    public function get_data($id)
    {
        $endpoint = HOST . GET_SHIPS_ROUTE . '/' . $id;

        $params = new stdClass();
        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );
        $ship = new stdClass();

        if ($response->code == 200)
        {
            $ship->id = $response->message->ship_id;
            $ship->name = $response->message->ship_name;
            $ship->reseller = $response->message->reseller_id;
            $ship->capacity = $response->message->ship_capacity;
            $ship->weight = $response->message->ship_weight;
            $ship->active = $response->message->active_status;
        }else{
            redirect('/ships/list');
        }

        return $ship;
    }
}

<?php

/**
* Client Class
*
* @package CodeIgniter
* @category Models
* @Author ITM Dev Team
* @Since Version 1.0.0
*/
class Reseller extends CI_Model
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
        $table_content = $this->Page->get_settings('resellers');
        $table_content = $this->build->build_components(
            $table_content['RESELLERS_TABLE']
        );

        // Call API here!
        $params = new stdClass();
        $endpoint = HOST . GET_RESELLERS_ROUTE;

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

                $aux .= custom('td', '', $row->reseller_name);
                $aux .= custom('td', '', $row->channel_name);
                               

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
                $status_attrib['data-status'] =  $row->reseller_id;
                $aux .= custom('td', $status_attrib, $status);

                $path = 'resellers/' . $row->reseller_id;
                $this->anchor_attrib['class'] = 'edit';
                $this->anchor_attrib['href'] = base_url($path);
                $edit = custom('i', array('class' => 'ion-edit'), '');

                $edit = custom('a', $this->anchor_attrib, $edit);

                if ($row->active_status == 1) {
                    $this->anchor_attrib['href'] = '#';
                    $this->anchor_attrib['class'] = 'delete';
                    $this->anchor_attrib['data-id'] = $row->reseller_id;
                    $delete = custom('i', array('class' => 'ion-close'), '');

                    $delete = custom('a', $this->anchor_attrib, $delete);
                }

                $aux .= custom('td', $this->attrib, $edit . $delete);

                $this->model .= custom('tr', '', $aux);
            }
        }
        else
        {
            $aux = '';
            for ($i = 0; $i < 7; $i++)
                $aux .= custom('td', '', '');

            $this->model = custom('tr', '', $aux);
        }

        $this->model = str_replace('{rows}', $this->model, $table_content);

        return $this->model;
    }

    public function get_form()
    {
        $this->db->close();
        $contents = $this->Page->get_settings('resellers');

        $this->model = $this->build->build_components(
            $contents['RESELLERS_FORM']
        );

        return $this->model;
    }

    public function get_data($id)
    {
        $endpoint = HOST . GET_RESELLERS_ROUTE . '/' . $id;

        $params = new stdClass();
        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        $reseller = new stdClass();

        if ($response->code == 200)
        {
            $reseller->id               = $response->message->reseller_id;
            $reseller->channel_id       = $response->message->channel_id;
            $reseller->channel_name     = $response->message->channel_name;
            $reseller->reseller_name    = $response->message->reseller_name;
            $reseller->active           = $response->message->active_status;
            
        }

        return $reseller;
    }
}

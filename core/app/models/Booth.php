<?php

/**
* Client Class
*
* @package CodeIgniter
* @category Models
* @author ITM Dev Team
* @since Version 1.0.0
*/
class Booth extends CI_Model
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
        $this->active = array('class' => LABEL_SUCCESS);
        $this->inactive = array('class' => LABEL_DANGER);
    }

    public function get_list()
    {
        $this->db->close();
        $table_content = $this->Page->get_settings('booths');

        $table_content = $this->build->build_components(
            $table_content['BOOTHS_TABLE']
        );

        // Call API here!
        $params = new stdClass();
        $endpoint = GET_BOOTHS_ROUTE;

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

                $aux .= custom('td', '', $row->booth_name);
                $aux .= custom('td', '', $row->location_name);

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
                $status_attrib['data-status'] =  $row->booth_id;
                $aux .= custom('td', $status_attrib, $status);

                $path = 'booths/' . $row->booth_id;
                $this->anchor_attrib['class'] = 'edit';
                $this->anchor_attrib['href'] = base_url($path);
                $edit = custom('i', array('class' => 'fas fa-edit'), '');

                $edit = custom('a', $this->anchor_attrib, $edit);

                if ($row->active_status == 1) {
                    $this->anchor_attrib['href'] = '#';
                    $this->anchor_attrib['class'] = 'delete';
                    $this->anchor_attrib['data-id'] = $row->booth_id;
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
            for ($i = 0; $i < 3; $i++)
                $aux .= custom('td', '', '');

            $this->model = custom('tr', '', $aux);
        }

        $this->model = str_replace('{rows}', $this->model, $table_content);

        return $this->model;
    }

    public function get_form()
    {
        $this->db->close();
        $contents = $this->Page->get_settings('booths');

        $this->model = $this->build->build_components(
            $contents['BOOTHS_FORM']
        );

        return $this->model;
    }

    public function get_rep_data(){
        $endpoint = GET_REPS_ROUTE;

        $params = new stdClass();
        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        $sales_rep = new stdClass();

        if ($response->code == 200)
        {
            $sales_rep = $response->message;
        }
        else
        {
            redirect('/booths/list');
        }

        return $sales_rep;
    }

    public function get_data($id)
    {
        $endpoint = GET_BOOTHS_ROUTE . '/' . $id;

        $params = new stdClass();
        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        if ($response->code == 200)
        {
            $response = json_decode(json_encode($response), true);
            $boothData = array();

            foreach($response['message'] as $key => $rowData){

                $boothData[$rowData["booth_id"]]['response'] = $rowData["response"];
                $boothData[$rowData["booth_id"]]['booth_id'] = $rowData["booth_id"];
                $boothData[$rowData["booth_id"]]['booth_name'] = $rowData["booth_name"];
                $boothData[$rowData["booth_id"]]['location_id'] = $rowData["location_id"];
                $boothData[$rowData["booth_id"]]['location_name'] = $rowData["location_name"];
                $boothData[$rowData["booth_id"]]['active'] = $rowData["active_status"];
                $boothData[$rowData["booth_id"]]['reps'][$rowData["rep_id"]]['rep_id'] = $rowData["rep_id"];
                $boothData[$rowData["booth_id"]]['reps'][$rowData["rep_id"]]['reseller_id'] = $rowData["reseller_id"];
                $boothData[$rowData["booth_id"]]['reps'][$rowData["rep_id"]]['reseller_name'] = $rowData["reseller_name"];
                $boothData[$rowData["booth_id"]]['reps'][$rowData["rep_id"]]['code'] = $rowData["code"];
                $boothData[$rowData["booth_id"]]['reps'][$rowData["rep_id"]]['user_id'] = $rowData["user_id"];
                $boothData[$rowData["booth_id"]]['reps'][$rowData["rep_id"]]['name'] = $rowData["name"];
                $boothData[$rowData["booth_id"]]['reps'][$rowData["rep_id"]]['lastname'] = $rowData["lastname"];
                $boothData[$rowData["booth_id"]]['reps'][$rowData["rep_id"]]['fullname'] = $rowData["lastname"];
                $boothData[$rowData["booth_id"]]['reps'][$rowData["rep_id"]]['start_date'] = $rowData["start_date"];
                $boothData[$rowData["booth_id"]]['reps'][$rowData["rep_id"]]['end_date'] = $rowData["end_date"];
                $boothData[$rowData['booth_id']]['reps'] = $this->clearObjt($boothData[$rowData['booth_id']]['reps']);

            }

            $response = $this->clearObjt($boothData);
        }
        else
        {
            redirect('/booths/list');
        }

        return $response = (object) $response[0];
    }

    public function clearObjt(array $objectCart)
    {
        $format = array();
        foreach($objectCart as $valueCart)
        {
            array_push($format, $valueCart);
        }
        return $format;
    }
}

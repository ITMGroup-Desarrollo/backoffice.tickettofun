<?php

/**
* Dary Model
*
* @package CodeIgniter
* @category Models
* @Author ITM Dev Team
* @Since Version 1.0.0
*/
class Diaries extends CI_Model
{
    public $model;
    public $settings;

    public function __construct()
    {
        $this->model = array(
            'tours' => '',
            'details' => ''
        );

        $this->settings = '';
    }

    public function get_location_distribution($next_date = NULL, $view = NULL)
    {
        $this->db->close();

        $locations = array();

        $this->settings = $this->Page->get_settings('diary');

        $element = $this->build->build_components($this->settings['SPEC']);

        $table = '';
        $ship_details = '';
        if ($view == NULL)
        {
            $table = $this->build->build_components($this->settings['DIARY_TABLE']);
            $ship_details = $this->build->build_components($this->settings['SHIP_SPEC']);
        }
        else
        {
            $table = $this->build->build_components($this->settings['DIARY_TABLE_PDF']);
            $ship_details = $this->build->build_components($this->settings['SHIP_SPEC_PDF']);
        }

        if ($next_date == NULL) {
            // Tours
            $date = new DateTime();
            $date->modify('+1 day');

            $next_date = $date->format('Y-m-d');
        }

        $this->db->close();
        $this->load->database();
        $query = 'CALL get_allotment_reservation(?, ?, ?, ?, ?, ?)';
        $data = array('bydate', NULL, $next_date, NULL, NULL, NULL);

        $query_result = $this->db->query($query, $data);

        $num_rows = $query_result->num_rows();
        $result   = $query_result->result();

        $query_result->free_result();
        $this->db->close();

        $id = 0;
        $total = 0;
        $body = '';
        $details = '';
        $arrive_id = 0;
        $ship_name = '';
        $total_tours = 0;

        if ($result[0]->response == 200)
        {
            foreach ($result as $row)
            {
                if ($id == 0)
                {
                    $id = $row->ship_id;
                    $ship_name = $row->ship_name . ' | ';
                    $ship_name .= $row->arrival_time . '-' . $row->departure_time;

                    $extradata1 = array (
                        'allaboard' => $row->all_aboard_time,
                        'shorex' => $row->shorex_name,
                        'assistant' => $row->assistant_name,
                        'ship' => $row->ship_time,
                        'origin' => $row->origin_port_name,
                        'destiny' => $row->destiny_port_name,
                        'next' => $row->next_port_name,
                        'idarrive' => $row->arrive_id
                    );

                }

                if ($id != $row->ship_id)
                {
                    $aux = "<br/><hr><p>Total of tours : {$total_tours}</p>";
                    $ship_name .= $aux;

                    $id = $row->ship_id;
                    $schedules = str_replace('{rows}', $body, $table);
                    $details .= str_replace(
                        '{tours_details}', $schedules, $ship_details
                    );

                    $details = str_replace(
                        '{ship-cruise}', $ship_name, $details
                    );

                    $extradata = array (
                        'allaboard' => $row->all_aboard_time,
                        'shorex' => $row->shorex_name,
                        'assistant' => $row->assistant_name,
                        'ship' => $row->ship_time,
                        'origin' => $row->origin_port_name,
                        'destiny' => $row->destiny_port_name,
                        'next' => $row->next_port_name,
                        'idarrive' => $row->arrive_id
                    );

                    $details = $this->_set_values_headship($extradata, $details);

                    $body = '';
                    $total_tours = 0;
                    $ship_name = $row->ship_name . ' | ';
                    $ship_name .= $row->arrival_time . '-' . $row->departure_time;
                }

                $aux = '';
                $aux .= custom('td', '', $row->service_name);
                $aux .= custom('td', '', $row->service_equivalence_name);
                $aux .= custom('td', '', $row->schedule_start);
                $aux .= custom('td', '', $row->schedule_end);
                $aux .= custom('td', '', $row->duration);
                if ($row->private_service == 1){
                    $aux .= custom('td', '', 'Yes');
                }else{
                    $aux .= custom('td', '', 'No');
                }
                $aux .= custom('td', '', $row->pax);
                $aux .= custom('td', '', $row->min_available);
                $aux .= custom('td', '', $row->max_available);
                $aux .= custom('td', '', $row->available);

                $total += $row->pax;
                $total_tours += $row->pax;
                $body .=  custom('tr', '', $aux);
            }
        }
        else
        {
            for ($i =0; $i < 8; $i++)
                $body .= custom('td', '', '');
        }

        $aux = "<br/><hr><p>Total of tours : {$total_tours}</p>";
        $ship_name .= $aux;

        $this->model['total_tours'] = $total;
        $table = str_replace('{rows}', $body, $table);
        $details .= str_replace('{tours_details}', $table, $ship_details);
        $details = str_replace('{ship-cruise}', $ship_name, $details);

        if ($result[0]->response == 200)
        {
            $details = $this->_set_values_headship($extradata1, $details);
        }
        else
        {
            $details = str_replace('btn btn-primary btn-md', 'btn btn-primary btn-md hidden', $details);
        }

        $this->model['details'] = $details;

        // If is a print option don't build this secction
        if ($view == null) {
            // Locations distribution
            $this->load->database();
            $query = 'CALL get_sales_tours(?)';
            $data = array($next_date);

            $query_result = $this->db->query($query, $data);

            $num_rows = $query_result->num_rows();
            $result   = $query_result->result();

            $query_result->free_result();
            $this->db->close();

            if ($num_rows)
            {
                foreach ($result as $row)
                {
                    if ($row->response == 200)
                        $locations[$row->location_name] = $row->total;
                }
            }

            foreach ($locations as $key => $value)
            {
                $items = str_replace('{count}', $value, $element);
                $items = str_replace('{location}', $key, $items);

                $this->model['tours'] .= $items;
            }
        }

        return $this->model;
    }

    private function _set_values_headship(array $extradata, string $details)
    {
        $details = str_replace('{h-name}', $extradata['allaboard'], $details);
        $details = str_replace('{s-name}', $extradata['shorex'], $details);
        $details = str_replace('{a-name}', $extradata['assistant'], $details);
        $details = str_replace('{sh-time}',$extradata['ship'], $details);
        $details = str_replace('{o-port}', $extradata['origin'] , $details);
        $details = str_replace('{d-port}', $extradata ['destiny'], $details);
        $details = str_replace('{n-port}', $extradata ['next'], $details);

        $details = str_replace('{data-idarrive}', $extradata ['idarrive'], $details);
        $details = str_replace('{data-allaboard}', $extradata ['allaboard'], $details);
        $details = str_replace('{data-shorex}', $extradata ['shorex'], $details);
        $details = str_replace('{data-assistant}', $extradata ['assistant'], $details);
        $details = str_replace('{data-ship}', $extradata ['ship'], $details);
        $details = str_replace('{data-origin}', $extradata ['origin'], $details);
        $details = str_replace('{data-destiny}', $extradata ['destiny'], $details);
        $details = str_replace('{data-next}', $extradata ['next'], $details);

        $details = str_replace('{idarriveList1}', $extradata ['idarrive'], $details);
        $details = str_replace('{idarriveList2}', $extradata ['idarrive'], $details);

        return $details;
    }

    public function get_form()
    {
        $this->db->close();
        $contents = $this->Page->get_settings('diary');

        $form = 'DIARY_FORM';

        $this->model = $this->build->build_components(
            $contents[$form]
        );

        return $this->model;
    }
}

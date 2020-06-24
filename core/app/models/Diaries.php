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

        if ($next_date == NULL)
        {
            $date = new DateTime();
            $date->modify('+1 day');

            $next_date = $date->format('Y-m-d');
        }

        $this->db->close();
        $this->load->database();

        $query = 'CALL get_allotment_reservation(?, ?, ?, ?, ?, ?, ?)';
        $data = array('bydate', NULL, $next_date, NULL, NULL, NULL, NULL);

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
        $ship_time = '';
        $total_tours = 0;
        $extra_data = new stdClass();

        if ($result[0]->response == 200)
        {
            foreach ($result as $row)
            {
                $this->model['code'] = 200;
                $ship_details = str_replace('{type}', 'flex', $ship_details);

                if ($id == 0)
                {
                    $id = $row->ship_id;
                    $ship_name = $row->ship_name . ' <';
                    $ship_name .= $row->arrival_time . '-' . $row->departure_time . '>';

                    $extra_data = $row;

                    $ship_time = $row->ship_time;
                }

                if ($id != $row->ship_id)
                {
                    if ($view == 'DIARY_TABLE_PDF')
                    {
                        $aux = "<span> | Total of tours : {$total_tours}</span> <span> | Ship time : {$ship_time}</span>";
                    }
                    else
                    {
                        $ship_details = str_replace(
                            '{total_tours}',
                            $total_tours,
                            $ship_details
                        );
                    }

                    $id = $row->ship_id;
                    $schedules = str_replace('{rows}', $body, $table);
                    $details .= str_replace(
                        '{tours_details}', $schedules, $ship_details
                    );

                    $details = str_replace(
                        '{ship_cruise}', $ship_name, $details
                    );

                    $details = $this->_set_values_headship($extra_data, $details);

                    $body = '';
                    $total_tours = 0;
                    $ship_name = $row->ship_name . ' | ';
                    $ship_name .= $row->arrival_time . '-' . $row->departure_time;

                    $extra_data = $row;

                    $ship_time = $row->ship_time;
                }

                $aux = '';
                $aux .= custom('td', '', $row->service_name);
                if ($view != 'DIARY_TABLE_PDF')
                {
                    $aux .= custom('td', '', $row->service_equivalence_name);
                }
                $aux .= custom('td', '', $row->schedule_start);
                $aux .= custom('td', '', $row->schedule_end);
                $aux .= custom('td', '', $row->duration);
                if ($view != 'DIARY_TABLE_PDF')
                {
                    if ($row->private_service == 1){
                        $aux .= custom('td', '', 'Yes');
                    }else{
                        $aux .= custom('td', '', 'No');
                    }
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
            $this->model['code'] = 404;
            $this->model['message'] = 'Not found data for this date';
        }

        if ($view == 'DIARY_TABLE_PDF')
        {
            $aux = "<span> | Total of tours : {$total_tours}</span> <span> | Ship time : {$ship_time}</span>";
        }
        else
        {
            $ship_details = str_replace('{type}', 'flex', $ship_details);
            $ship_details = str_replace('{total_tours}', $total_tours, $ship_details);
        }

        $this->model['total_tours'] = $total;
        $table = str_replace('{rows}', $body, $table);
        $details .= str_replace('{tours_details}', $table, $ship_details);

        $details = str_replace('{ship_cruise}', $ship_name, $details);
        $details = $this->_set_values_headship($extra_data, $details);

        if ($id == 0)
            $details = str_replace('btn btn-primary btn-md', 'btn btn-primary btn-md hidden', $details);

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

    private function _set_values_headship(object $extra_data, string $details)
    {
        foreach ($extra_data as $key => $value)
        {
            $replace_key = '{' . $key . '}';
            $details = str_replace($replace_key, $value, $details);
        }

        return $details;
    }
}

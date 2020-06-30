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
    public $print;
    public $settings;
    public $tableModel;
    public $specifications;

    public function __construct()
    {
        $this->model = array(
            'tours' => '',
            'details' => ''
        );

        $this->print = 0;
        $this->settings = '';
        $this->tableModel = 'DIARY_TABLE';
        $this->specifications = 'SHIP_SPEC';
    }

    public function get_location_distribution($next_date = NULL, $view = NULL)
    {
        $this->db->close();

        $locations = array();

        $this->settings = $this->Page->get_settings('diary');

        $element = $this->build->build_components($this->settings['SPEC']);

        $table = '';
        $ship_details = '';

        if ($view == 'PRINT')
        {
            $this->print = 1;
            $this->tableModel = 'DIARY_TABLE_PDF';
            $this->specifications = 'SHIP_SPEC_PDF';
        }

        $table = $this->build->build_components($this->settings[$this->tableModel]);
        $ship_details = $this->build->build_components($this->settings[$this->specifications]);

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
                    $ship_name = "{$row->ship_name} &#60;";
                    $ship_name .= "{$row->arrival_time} - {$row->departure_time}&#62;";

                    $extra_data = $row;
                    $ship_time = $row->ship_time;
                }

                if ($id != $row->ship_id)
                {
                    if ($this->print == 1)
                    {
                        $ship_details = str_replace(
                            '{ship_time}'
                            , $ship_time
                            , $ship_details
                        );

                        $ship_details = str_replace(
                            '{total_tours}'
                            , $total_tours
                            , $ship_details
                        );
                    }
                    else
                    {
                        $ship_details = str_replace(
                            '{total_tours}'
                            , $total_tours
                            , $ship_details
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
                    $ship_name = "{$row->ship_name} &#60;";
                    $ship_name .= "{$row->arrival_time} - {$row->departure_time}&#62;";

                    $extra_data = $row;
                    $ship_time = $row->ship_time;
                }

                $aux = '';
                $aux .= custom('td', '', $row->service_name);

                if ($this->print == 0) // Remove columns on print
                {
                    $aux .= custom('td', '', $row->service_equivalence_name);
                }

                $aux .= custom('td', '', $row->schedule_start);
                $aux .= custom('td', '', $row->schedule_end);
                $aux .= custom('td', '', $row->duration);

                if ($this->print == 0) // Remove columns on print
                {
                    if ($row->private_service == 1)
                    {
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

            if ($this->print == 1)
            {
                $ship_details = str_replace('{ship_time}', $ship_time, $ship_details);
                $ship_details = str_replace('{total_tours}', $total_tours, $ship_details);
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

            $this->model['display'] = 'block';
            $this->model['details'] = $details;
            $this->model['message'] = '';

            // If is a print option don't build this secction
            if ($this->print == 0) {
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
        }
        else
        {
            // For POST request
            $this->model['code'] = 404;
            $this->model['message'] = 'Not found calls for this date';

            // For default view
            $this->model['display'] = 'none';
            $this->model['total_tours'] = $total_tours;
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

<?php
namespace App\Models;

use CodeIgniter\Model;
use App\Libraries\Api;
use App\Libraries\Build;

use stdClass;
use DateTime;

/**
* Dary Model
*
* @package CodeIgniter
* @category Models
* @Author ITM Dev Team
* @Since Version 1.0.0
*/
class Diaries extends Model
{
    public $db;
    public $api;
    public $page;
    public $build;
    public $model;
    public $print;
    public $session;
    public $settings;
    public $tableModel;
    public $specifications;

    public function __construct()
    {
        $this->model = array(
            'tours' => '',
            'details' => ''
        );

        $this->api     = new Api();
        $this->build   = new Build();
        $this->page    = new \App\Models\Page();

        $this->db      = \Config\Database::connect();
        $this->session = \Config\Services::session();

        $this->print          = 0;
        $this->settings       = '';
        $this->tableModel     = 'DIARY_TABLE';
        $this->specifications = 'SHIP_SPEC';
    }

    public function get_location_distribution($next_date = NULL, $view = NULL, $channel_id = 1)
    {
        $this->settings = $this->page->get_settings('diary');

        $element = $this->build->build_components($this->settings['SPEC']);
        if ($channel_id === 3) {
            $this->specifications = 'SHIP_SPEC_LMPS';
        }

        $table        = '';
        $ship_details = '';

        if ($view == 'PRINT')
        {
            $this->print          = 1;
            $this->tableModel     = 'DIARY_TABLE_PDF';
            $this->specifications = 'SHIP_SPEC_PDF';
        }

        $table        = $this->build->build_components($this->settings[$this->tableModel]);
        $ship_details = $this->build->build_components($this->settings[$this->specifications]);

        if ($next_date == NULL)
        {
            $date = new DateTime();
            $date->modify('+1 day');

            $next_date = $date->format('Y-m-d');
        }

        $query = 'CALL get_allotment_reservation(?, ?, ?, ?, ?, ?, ?)';
        $data = array('bydate', NULL, $next_date, $channel_id, NULL, NULL, NULL);

        $result = $this->db->query($query, $data);

        $id          = 0;
        $body        = '';
        $total       = 0;
        $details     = '';
        $ship_name   = '';
        $ship_time   = '';
        $total_tours = 0;

        $extra_data  = new stdClass();

        $row = $result->getRow();

        if ($row->response == 200)
        {
            foreach ($result->getResult() as $row)
            {
                $this->model['code'] = 200;

                $ship_details = str_replace('{type}', 'flex', $ship_details);

                if ($id == 0)
                {
                    $id        = $row->ship_id;
                    $ship_name = "{$row->ship_name} &#60;";

                    $ship_name .= "{$row->arrival_time} - {$row->departure_time}&#62;";

                    $extra_data = $row;
                    if (!is_null($row->ship_time)) {
                        $ship_time  = $row->ship_time;
                    }
                }

                if ($id != $row->ship_id)
                {
                    if ($this->print == 1)
                    {
                        $details .= str_replace(
                            '{ship_time}', $ship_time, $ship_details
                        );

                        $details = str_replace(
                            '{total_tours}', $total, $details
                        );
                    }
                    else
                    {
                        $details .= str_replace(
                            '{type}', 'flex', $ship_details
                        );

                        $details = str_replace(
                            '{total_tours}', $total_tours, $details
                        );
                    }

                    $id        = $row->ship_id;
                    $schedules = str_replace('{rows}', $body, $table);

                    $details = str_replace(
                        '{tours_details}', $schedules, $details
                    );

                    $details = str_replace(
                        '{ship_cruise}', $ship_name, $details
                    );

                    $details = $this->_set_values_headship($extra_data, $details);

                    $body        = '';
                    $total_tours = 0;
                    $ship_name   = "{$row->ship_name} &#60;";

                    $ship_name .= "{$row->arrival_time} - {$row->departure_time}&#62;";

                    $extra_data = $row;
                    if (!is_null($row->ship_time)) {
                        $ship_time  = $row->ship_time;
                    }
                }

                $aux = '';
                $aux .= custom('td', '', $row->service_name);

                if ($this->print == 0) // Remove columns on print
                {
                    $aux .= custom('td', '', $row->service_equivalence_name);
                }

                $duration = '0';
                $time1 = date_create($row->schedule_start);
                $time2 = date_create($row->schedule_end);

                $difference = date_diff($time1, $time2);

                $duration = $difference->h . ':';

                if ($difference->i < 10) {
                    $duration .= '0' . $difference->i;
                } else {
                    $duration .= $difference->i;
                }

                $aux .= custom('td', '', $row->schedule_start);
                $aux .= custom('td', '', $row->schedule_end);
                $aux .= custom('td', '', $duration);

                if ($this->print == 0) // Remove columns on print
                {
                    if ($row->private_service == 1)
                    {
                        $aux .= custom('td', '', 'Yes');
                    }
                    else
                    {
                        $aux .= custom('td', '', 'No');
                    }
                }

                $aux .= custom('td', '', $row->pax);
                $aux .= custom('td', '', $row->min_available);
                $aux .= custom('td', '', $row->max_available);
                $aux .= custom('td', '', $row->available);

                $total       += $row->pax;
                $total_tours += $row->pax;

                $body .=  custom('tr', '', $aux);
            }

            $result->freeResult();

            if ($this->print == 1)
            {
                $details .= str_replace('{ship_time}', $ship_time, $ship_details);
                $details = str_replace('{total_tours}', $total, $details);
            }
            else
            {
                $details .= str_replace('{type}', 'flex', $ship_details);
                $details = str_replace('{total_tours}', $total_tours, $details);
            }

            $this->model['total_tours'] = $total;
            $table                      = str_replace('{rows}', $body, $table);

            $details = str_replace('{tours_details}', $table, $details);

            $details = str_replace('{ship_cruise}', $ship_name, $details);
            $details = $this->_set_values_headship($extra_data, $details);

            $this->model['display'] = 'block';
            $this->model['details'] = $details;
            $this->model['message'] = '';

            // If is a print option don't build this secction
            if ($this->print == 0) {
                // Locations distribution
                $data   = array($next_date, $channel_id);
                $query  = 'CALL get_sales_tours(?,?)';
                $result = $this->db->query($query, $data);

                foreach ($result->getResult() as $row)
                {
                    if ($row->response == 200)
                    {
                        $items = str_replace('{count}', $row->total, $element);
                        $items = str_replace('{location}', $row->location_name, $items);

                        $this->model['tours'] .= $items;
                    }
                }

                $result->freeResult();
            }
        }
        else
        {
            // For POST request
            $this->model['code']    = 404;
            $this->model['message'] = 'Not found calls for this date';

            // For default view
            $this->model['display']     = 'none';
            $this->model['total_tours'] = $total;
        }

        return $this->model;
    }

    public function get_form(int $channel = 1)
    {
        $contents = $this->page->get_settings('diary');

        $form = 'DIARY_FORM';
        if ($channel == 3) {
            $form = 'PRINT';
        }

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

            if ($value == NULL) {
                $value = '';
            }

            $details = str_replace($replace_key, $value, $details);
        }

        return $details;
    }
}

<?php

/**
 * Client Class
 *
 * @package CodeIgniter
 * @category Models
 * @author ITM Dev Team
 * @since Version 1.0.0
 */

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class Layout extends CI_Model
{
    public $model;
    public $active;
    public $attrib;
    public $inactive;
    public $anchor_attrib;
    const RESELLER = 'resellers';
    const SHIP = 'ships';
    const SERVICE = 'services';
    const WORD = 'LAYOUT_TABLE';

    public function __construct()
    {
        $this->model = '';
        $this->layoutFile = array();
        parent::__construct();

        $this->attrib = array('class' => 'center');
        $this->active = array('class' => 'label label-success');
        $this->inactive = array('class' => 'label label-danger');
    }

    public function get_list()
    {
        $this->db->close();
        $table_content = $this->Page->get_settings('layouts');

        $listLayout = $this->filter_layout($table_content, $this::WORD);

        $rol_id = $this->session->userdata('rol_id');

        $table = $table_content['LAYOUT_TABLE'];

        if ($rol_id != 1 && !in_array('g_roles', $this->session->userdata('permissions'))) {
            $limit = count($table->contents[0]->contents->contents) - 1;

            array_splice($table->contents[0]->contents->contents, $limit, 1);
            array_splice($table->contents[2]->contents->contents, $limit, 1);
        }

        $table_content = $this->build->build_components($table);

        if (count($listLayout) > 0) {

            foreach ($listLayout as $row) {
                $aux = '';
                $this->anchor_attrib = array();

                $aux .= custom('td', '', $row->file_name);
                $aux .= custom('td', '', $row->description);


                $path = 'layouts/export/' . $row->code;
                $this->anchor_attrib['class'] = 'edit';
                $this->anchor_attrib['href'] = base_url($path);
                $edit = custom('i', array('class' => 'fas fa-file-download'), '');

                $edit = custom('a', $this->anchor_attrib, $edit);
                $aux .= custom('td', $this->attrib, $edit);

                $this->model .= custom('tr', '', $aux);
            }
        } else {
            $aux = '';
            for ($i = 0; $i < 5; $i++)
                $aux .= custom('td', '', '');

            $this->model = custom('tr', '', $aux);
        }

        $this->model = str_replace('{rows}', $this->model, $table_content);

        return $this->model;
    }

    private function filter_layout($listLayout, $searchWord)
    {

        return array_filter($listLayout, function ($key) use ($searchWord) {
            $filter = explode("_", $searchWord);
            return (preg_match("/^$filter[0]/", $key) && !preg_match("/^$searchWord/", $key));
        }, ARRAY_FILTER_USE_KEY);
    }

    private function get_list_resellers()
    {
        $endpoint = GET_RESELLERS_ROUTE;

        $params = new stdClass();
        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        $resellers = array();

        if ($response->code == 200) {
            foreach ($response->message as $element) {
                $reseller = new stdClass();

                $reseller->id               = $element->reseller_id;
                $reseller->channel_id       = $element->channel_id;
                $reseller->channel_name     = $element->channel_name;
                $reseller->name    = $element->reseller_name;
                $reseller->active           = $element->active_status;

                $resellers[] = $reseller;
            }
        }

        return $resellers;
    }

    private function get_list_ships()
    {
        $endpoint = GET_SHIPS_ROUTE;

        $params = new stdClass();
        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        $ships = array();

        if ($response->code == 200) {
            foreach ($response->message as $element) {

                $ship = new stdClass();

                $ship->id = $element->ship_id;
                $ship->name = $element->ship_name;
                $ship->reseller = $element->reseller_id;
                $ship->capacity = $element->ship_capacity;
                $ship->active = $element->active_status;

                $ships[] = $ship;
            }
        }

        return $ships;
    }

    private function get_list_services()
    {
        $endpoint = GET_SERVICES_ROUTE;

        $params = new stdClass();
        $this->load->library('session');
        $token = $this->session->userdata('token');

        $response = json_decode(
            $this->api->request_api('GET', $endpoint, $params, $token)
        );

        $services = array();

        if ($response->code == 200) {
            foreach ($response->message as $element) {

                $service = new stdClass();

                $service->id       = $element->service_id;
                $service->location = $element->location_id;
                $service->name     = $element->service_name;
                $service->active   = $element->active_status;
                $service->duration   = $element->duration;
                $service->max      = $element->min_available_num;
                $service->min      = $element->max_available_num;

                $services[] = $service;
            }
        }

        return $services;
    }

    public function build_layout($code, &$file_name)
    {

        $layout = $this->get_layout($code);

        $file_name = $layout->file_name;

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Layout');
        $sheetDataValidation = $spreadsheet->createSheet(1);
        $sheetDataValidation->setTitle('Lista');

        $this->setHeadersLayout($sheet, $layout->schema->headers);

        if (property_exists($layout, 'source')) {

            $this->setHeadersLayout($sheetDataValidation, $layout->source->headers);

            $this->setDataSourceToLayout($sheet, $sheetDataValidation, $layout->source);
        }

        return $spreadsheet;
    }

    private function setDataValidationByColumn(Worksheet $sheet, $column, $startCellIndex, $endCellIndex)
    {

        //Setting data validation on a cell
        $validation = $sheet->getCell($column . $startCellIndex)->getDataValidation();
        $validation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST);
        $validation->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_INFORMATION);
        $validation->setAllowBlank(false);
        $validation->setShowInputMessage(true);
        $validation->setShowErrorMessage(true);
        $validation->setShowDropDown(true);
        $validation->setErrorTitle('Input error');
        $validation->setError('Value is not in list.');
        $validation->setPromptTitle('Pick from list');
        $validation->setPrompt('Please pick a value from the drop-down list.');
        $validation->setFormula1('Lista!$' . $column . '$' . $startCellIndex . ':$' . $column . '$' . $endCellIndex);


        for ($i = 3; $i <= 101; $i++) {
            $sheet->getCell($column . $i)->setDataValidation(clone $validation);
        }
    }

    private function setListDataValidation(Worksheet $sheet, $list, $column, $cellIndex, $field)
    {
        foreach ($list as $item) {
            $sheet->setCellValue($column . $cellIndex, $item->$field);
            $cellIndex += 1;
        }
    }

    private function get_layout($code)
    {
        $this->db->close();
        $this->load->Model('Page');
        $contents = $this->Page->get_settings('layouts');

        $layout = null;

        $listLayout = $this->filter_layout($contents, $this::WORD);

        foreach ($listLayout as $row) {
            if ($row->code == $code) {
                $layout = $row;
            }
        }

        if (!is_object($layout)) {
            redirect('layouts/download');
        }

        if (!$this->validateSchema($layout, 'schema')) {
            redirect('layouts/download');
        }

        if (property_exists($layout, 'source') && !$this->validateSchema($layout, 'source')) {
            redirect('layouts/download');
        }

        return $layout;
    }

    private function validateSchema($layout, $schema)
    {
        $errorFlag = true;

        if (!property_exists($layout, $schema)) {

            $errorFlag = false;
        } else if (!property_exists($layout->$schema, 'headers') || !is_array($layout->$schema->headers)) {

            $errorFlag = false;
        }

        $headers = $layout->$schema->headers;

        foreach ($headers as $property) {
            if (!is_object($property)) {
                $errorFlag = false;
                break;
            }
        }

        return $errorFlag;
    }

    private function setHeadersLayout(Worksheet $sheet, $headers)
    {

        $column = $sheet->getHighestColumn();
        $cellIndex = 1;

        foreach ($headers as $property) {
            $sheet->setCellValue($column . $cellIndex, $property->field)->getColumnDimension($column)->setAutoSize(true);

            $column++;
        }
    }

    private function setDataSourceToLayout(Worksheet $sheetLayout, Worksheet $sheetData, $source)
    {

        $list = array();
        $column = 'A';
        $cellIndex = 1;
        $found = false;

        $headers = $source->headers;

        foreach ($headers as $property) {

            switch ($property->select->catalog) {
                case $this::RESELLER:
                    $list = $this->get_list_resellers();

                    while (!$found) {

                        if ($property->field == $sheetData->getCell($column . $cellIndex)->getValue()) {
                            $found = true;
                        } else
                            $column++;
                    }

                    $this->setListDataValidation($sheetData, $list, $column, ($cellIndex + 1), $property->select->text);
                    $this->setDataValidationByColumn($sheetLayout, $column, ($cellIndex + 1), (count($list) + 1));

                    break;
                case $this::SHIP:
                    $list = $this->get_list_ships();

                    while (!$found) {

                        if ($property->field == $sheetData->getCell($column . $cellIndex)->getValue()) {
                            $found = true;
                        } else {
                            $column++;
                        }
                    }

                    $this->setListDataValidation($sheetData, $list, $column, ($cellIndex + 1), $property->select->text);
                    $this->setDataValidationByColumn($sheetLayout, $column, ($cellIndex + 1), (count($list) + 1));

                    break;
                case $this::SERVICE:
                    $list = $this->get_list_services();

                    while (!$found) {

                        if ($property->field == $sheetData->getCell($column . $cellIndex)->getValue()) {
                            $found = true;
                        } else {
                            $column++;
                        }
                    }

                    $this->setListDataValidation($sheetData, $list, $column, ($cellIndex + 1), $property->select->text);
                    $this->setDataValidationByColumn($sheetLayout, $column, ($cellIndex + 1), (count($list) + 1));

                    break;
                default:
                    break;
            }

            $column = 'A';
            $list = array();
            $found = false;
        }
    }
}

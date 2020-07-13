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
use PhpOffice\PhpSpreadsheet\Worksheet\Row;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class Layout extends CI_Model
{
    public $model;
    public $active;
    public $attrib;
    public $inactive;
    public $anchor_attrib;

    private $dataRows = array();
    private $dataErrors = array();

    const RESELLER = 'resellers';
    const SHIP = 'ships';
    const SERVICE = 'services';
    const TEMPLATE = 'LAYOUTS';

    const NAME = 'name';
    const MAIL = 'mail';
    const CP = 'cp';
    const RFC = 'rfc';
    const MONEY = 'money';
    const ALPHANUMERIC = 'alphanumeric';
    const ALPHA = 'alpha';
    const DATE = 'date';
    const DECIMAL = 'decimal';
    const NUMERIC = 'numeric';
    const NUMERICPOS = 'numericpos';
    const TIME = 'time';




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

        $listLayout = $this->_get_list_layouts($table_content);

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

    public function get_layout($code)
    {

        return $this->_get_layout($code);
    }

    public function get_form()
    {
        $this->db->close();
        $contents = $this->Page->get_settings('layouts');

        $this->model = $this->build->build_components(
            $contents['LAYOUT_FORM']
        );

        return $this->model;
    }

    public function get_list_layouts()
    {
        $this->db->close();
        $content = $this->Page->get_settings('layouts');

        $list = array();

        $result = $this->_get_list_layouts($content);

        foreach ($result as $item) {
            $layout = new stdClass();
            $layout->code = $item->code;
            $layout->file_name = $item->file_name;
            $list[] = $layout;
        }

        return $list;
    }

    public function get_data_rows()
    {
        return $this->dataRows;
    }

    public function get_data_errors()
    {
        return $this->dataErrors;
    }

    private function _get_list_layouts($content)
    {
        return $this->_filter_layout($content, $this::TEMPLATE);
    }

    private function _filter_layout($listLayout, $searchWord)
    {
        return array_filter($listLayout, function ($key) use ($searchWord) {
            return (preg_match("/^$searchWord/", $key));
        }, ARRAY_FILTER_USE_KEY);
    }

    private function _get_list_resellers()
    {
        $endpoint = GET_RESELLERS_ROUTE;

        $params = new stdClass();

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

    private function _get_list_ships()
    {
        $endpoint = GET_SHIPS_ROUTE;

        $params = new stdClass();

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

    private function _get_list_services()
    {
        $endpoint = GET_SERVICES_ROUTE;

        $params = new stdClass();

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

        $layout = $this->_get_layout($code);

        $file_name = $layout->file_name;

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Layout');
        $sheetDataValidation = $spreadsheet->createSheet(1);
        $sheetDataValidation->setTitle('Lista');

        $this->_set_headers_layout($sheet, $layout->schema->headers);

        if (property_exists($layout, 'source')) {

            $this->_set_headers_layout($sheetDataValidation, $layout->source->headers);

            $this->_set_data_source_to_layout($sheet, $sheetDataValidation, $layout->source);
        }

        return $spreadsheet;
    }

    private function _set_data_validation_by_column(Worksheet $sheet, $column, $startCellIndex, $endCellIndex)
    {

        //Setting data validation on a cell
        $validation = $sheet->getCell($column . $startCellIndex)->getDataValidation();
        $validation->setType(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::TYPE_LIST);
        $validation->setErrorStyle(\PhpOffice\PhpSpreadsheet\Cell\DataValidation::STYLE_INFORMATION);
        $validation->setAllowBlank(FALSE);
        $validation->setShowInputMessage(TRUE);
        $validation->setShowErrorMessage(TRUE);
        $validation->setShowDropDown(TRUE);
        $validation->setErrorTitle('Input error');
        $validation->setError('Value is not in list.');
        $validation->setPromptTitle('Pick from list');
        $validation->setPrompt('Please pick a value from the drop-down list.');
        $validation->setFormula1('Lista!$' . $column . '$' . $startCellIndex . ':$' . $column . '$' . $endCellIndex);


        for ($i = 3; $i <= 101; $i++) {
            $sheet->getCell($column . $i)->setDataValidation(clone $validation);
        }
    }

    private function _set_list_data_validation(Worksheet $sheet, $list, $column, $cellIndex, $field)
    {
        foreach ($list as $item) {
            $sheet->setCellValue($column . $cellIndex, $item->$field);
            $cellIndex += 1;
        }
    }

    private function _get_layout($code)
    {
        $this->db->close();
        $this->load->Model('Page');
        $contents = $this->Page->get_settings('layouts');

        $layout = null;

        $listLayout = $this->_filter_layout($contents, $this::TEMPLATE);

        foreach ($listLayout as $row) {
            if ($row->code == $code) {
                $layout = $row;
            }
        }

        if (!is_object($layout)) {
            redirect('layouts/download');
        }

        if (!$this->_validate_schema($layout, 'schema')) {
            redirect('layouts/download');
        }

        if (property_exists($layout, 'source') && !$this->_validate_schema($layout, 'source')) {
            redirect('layouts/download');
        }

        return $layout;
    }

    private function _validate_schema($layout, $schema)
    {
        $errorFlag = TRUE;

        if (!property_exists($layout, $schema)) {

            $errorFlag = FALSE;
        } else if (!property_exists($layout->$schema, 'headers') || !is_array($layout->$schema->headers)) {

            $errorFlag = FALSE;
        }

        $headers = $layout->$schema->headers;

        foreach ($headers as $property) {
            if (!is_object($property)) {
                $errorFlag = FALSE;
                break;
            }
        }

        return $errorFlag;
    }

    private function _set_headers_layout(Worksheet $sheet, $headers)
    {
        foreach ($headers as $property) {
            $sheet->setCellValue($property->column, $property->field)->getColumnDimension(substr($property->column, 0, 1))->setAutoSize(TRUE);
        }
    }

    private function _set_data_source_to_layout(Worksheet $sheetLayout, Worksheet $sheetData, $source)
    {

        $list = array();
        $cellIndex = 1;

        $headers = $source->headers;

        foreach ($headers as $property) {

            switch ($property->select->catalog) {
                case $this::RESELLER:
                    $list = $this->_get_list_resellers();
                    break;
                case $this::SHIP:
                    $list = $this->_get_list_ships();
                    break;
                case $this::SERVICE:
                    $list = $this->_get_list_services();
                    break;
                default:
                    break;
            }

            $this->_set_list_data_validation($sheetData, $list, substr($property->column, 0, 1), ($cellIndex + 1), $property->select->text);
            $this->_set_data_validation_by_column($sheetLayout, substr($property->column, 0, 1), ($cellIndex + 1), (count($list) + 1));

            $list = array();
        }
    }

    public function validate_headers(Worksheet $sheet, $layout)
    {
        $headers = $layout->schema->headers;

        $isfound = TRUE;

        foreach ($headers as $property) {

            if ($property->field != $sheet->getCell($property->column)->getValue()) {
                $isfound = FALSE;
                break;
            }
        }

        return $isfound;
    }

    public function validate_data_row(Worksheet $sheet, $layout)
    {
        $headers = $layout->schema->headers;

        $isValid = TRUE;

        foreach ($sheet->getRowIterator(2) as $row) {

            if ((!$this->_is_empty_data_row($row))) {
                $rowElement = array();
                if (!$this->_is_valid_data_row($row, $headers, $rowElement))
                    $isValid = FALSE;

                $this->dataRows[] = $rowElement;
            }
        }

        return $isValid;
    }

    private function _is_empty_data_row(Row $row)
    {

        $rowEmpty = TRUE;
        $cellIterator = $row->getCellIterator();
        $cellIterator->setIterateOnlyExistingCells(FALSE);

        foreach ($cellIterator as $cell) {

            if (!empty(trim($cell->getValue())))
                $rowEmpty = FALSE;
        }

        return $rowEmpty;
    }

    private function _is_valid_data_row(Row $row, $headers, &$rowElement)
    {
        $isValid = TRUE;
        $cellIterator = $row->getCellIterator();
        $cellIterator->setIterateOnlyExistingCells(FALSE);
        $message = "";

        $styleArray = [
            'borders' => [
                'outline' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THICK,
                    'color' => ['argb' => 'FFFF0000'],
                ],
            ],
        ];

        foreach ($headers as $property) {

            foreach ($cellIterator as $cell) {

                if (substr($property->column, 0, 1) == $cell->getColumn() && (property_exists($property, 'format') && !empty(trim($property->format)))) {
                    if (!Layout::is_valid_value($cell->getFormattedValue(), $property->format, $message, $property->required)) {

                        $cell->getStyle()->applyFromArray($styleArray);
                        $this->dataErrors[] = array(
                            "Line" => $row->getRowIndex(),
                            "Field" => $property->field,
                            "Error" => $message,
                            "Value" => $cell->getFormattedValue()
                        );

                        $message = "";
                        $isValid = FALSE;
                    }

                    $rowElement[$property->field] =  $cell->getFormattedValue();
                } else if (substr($property->column, 0, 1) == $cell->getColumn()) {
                    $rowElement[$property->field] =  $cell->getFormattedValue();
                }
            }
        }

        return $isValid;
    }

    public static function is_valid_value($value, $type, &$message, $isRequired = FALSE)
    {

        $pattern = '';
        $value = trim($value);

        switch ($type) {
            case Layout::NAME:
                $pattern = "/^[\u00e1\u00e9\u00ed\u00f3\u00fa\u00c1\u00c9\u00cd\u00d3\u00da\u00f1\u00d1a-zA-Z\s\.]*$/";
                break;
            case Layout::MAIL:
                $pattern = "/^[a-zA-Z][\w\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\w\.-]*[a-zA-Z0-9]\.[a-zA-Z][a-zA-Z\.]*[a-zA-Z]$/";
                break;
            case Layout::CP:
                $pattern = "/^[0-9]{5}$/";
                break;
            case Layout::RFC:
                $pattern = "/^[a-zA-Z]{3,4}(\d{6})((\D|\d){3})?$/";
                break;
            case Layout::MONEY:
                $pattern = "/^\$?[0-9,]*[0-9]+(\.[0-9]+)?$/";
                break;
            case Layout::ALPHANUMERIC:
                $pattern = "/^[a-zA-Z0-9]+$/";
                break;
            case Layout::ALPHA:
                $pattern = "/^[a-zA-Z]+$/";
                break;
            case Layout::DATE:
                $pattern = "/^(\d{4})([\/|-])(0[1-9]|1[0-2])([\/|-])([0][1-9]|[12][0-9]|3[01])$/";
                break;
            case Layout::DECIMAL:
                $pattern = "/^-?[0-9]+(\.[0-9]*)?$/";
                break;
            case Layout::NUMERIC:
                $pattern = "/^-?[0-9]+$/";
                break;
            case Layout::NUMERICPOS:
                $pattern = "/^[0-9]+$/";
                break;
            case Layout::TIME:
                $pattern = "/^(0[1-9]|1\d|2[0-3]):([0-5]\d):([0-5]\d)$/";
                break;
        }

        if (empty($value) && $isRequired) {
            $message = "The field is required";
            return FALSE;
        }


        if (!preg_match($pattern, $value)) {
            $message = "Invalid format.";
            return FALSE;
        }


        return TRUE;
    }
}

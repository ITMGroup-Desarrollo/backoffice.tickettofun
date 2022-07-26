<?php
namespace App\Controllers;
require APPPATH . 'Libraries/vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class Sale_reports extends BaseController
{
    public $sale_report;

    public function __construct()
    {
        $this->sale_report = new \App\Models\Sale_report();
    }

    /**
    *Index page for this controller
    */
    public function index()
    {
        if (!$this->user->active_session())
            return redirect()->to(base_url('signin'));

        $view   = $this->request->uri->getSegment(1);
        $option = $this->request->uri->getSegment(2);

        $this->page->page_name = $view;
        $this->page->menu_active = 'sale-reports';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        $table = $this->sale_report->get_list();

        $form = $this->sale_report->get_form('filters');
        $form = str_replace('{id}', 'filters', $form);
        $data['contents'] = str_replace('{filters}', $form, $data['contents']);

        $data['contents'] = str_replace(
            '{title}',
            'List of sales',
            $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}',
            $table,
            $data['contents']
        );

        $rep = 'window.user_create_id = ' . $this->session->get('user_id');
        $script = custom('script', '', $rep);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }

    public function export()
    {
        $end_date   = $this->request->uri->getSegment(4);
        $start_date = $this->request->uri->getSegment(3);

        $response = $this->sale_report->get_sales($start_date, $end_date);

        // Filter just confirmed sales
        $response = array_filter($response , function($data) {
            return $data->process_status_id == 6;
        });

        $bookings = $response;

        if(is_null($response))
            return;

        $response = $this->groupByResellerService($response);

        $file_name   = 'sales';

        // Some styles defenition
        $default = array(
            'bold'     => TRUE,
            'color'    => [
                'rgb'  => '000000'
            ]
        );

        // Header font color
        $hFColor = array (
            'bold'     => TRUE,
            'color'    => [
                'rgb'  => 'FBFCFC'
            ]
        );

        // Header cruise background
        $hBackground = array(
            'fillType' => Fill::FILL_GRADIENT_LINEAR,
            'rotation' => 0,
            'color'    => [
                'rgb'  => 'BBD5F0'
            ]
        );

        // Header pax background
        $hPBackground = array(
            'fillType' => Fill::FILL_GRADIENT_LINEAR,
            'rotation' => 0,
            'color'    => [
                'rgb'  => '517094'
            ]
        );

        // Footer total background
        $fTBackground = array(
            'fillType' => Fill::FILL_GRADIENT_LINEAR,
            'rotation' => 0,
            'color'    => [
                'rgb'  => 'A1C5ED'
            ]
        );

        $spreadsheet = new Spreadsheet();
        $spreadsheet->setActiveSheetIndex(0);

        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Sales Report');

        $sheet->getColumnDimension('B')->setAutoSize(true);
        $sheet->getColumnDimension('C')->setWidth(11);
        $sheet->getColumnDimension('D')->setWidth(10);
        $sheet->getColumnDimension('E')->setWidth(12);

        $sheet->getStyle('C10:E10')->getAlignment()->setHorizontal('center');

        $sheet->mergeCells('B1:I4');

        $sheet->getStyle('B1')->getFont()->setSize(28);
        $sheet->getStyle('B1')->getAlignment()->setHorizontal('center');
        $sheet->getStyle('B1')->getAlignment()->setVertical('center');

        $sheet->getStyle('B1')->getFont()->applyFromArray($default);

        $sheet->setCellValue('B1', 'Reporte diario de ventas Last Minute');

        // Set logo
        $drawing = new Drawing();
        $drawing->setName('Logo');
        $drawing->setDescription('Logo');
        $drawing->setPath(APPPATH . '../public/img/costa-maya.png');
        $drawing->setCoordinates('I1');
        $drawing->setHeight(76);

        $drawing->setWorksheet($sheet);

        $sheet->setCellValue('B7', 'Fecha:');

        if ($start_date != $end_date) {
            $sheet->setCellValue('C7', Date::PHPToExcel($start_date));

            $sheet->getStyle('C7')->getNumberFormat()
                ->setFormatCode(NumberFormat::FORMAT_DATE_DDMMYYYY);

            $sheet->getStyle('D7')->getAlignment()->setHorizontal('center');
            $sheet->setCellValue('D7', 'al');

            $sheet->setCellValue('E7', Date::PHPToExcel($start_date));

            $sheet->getStyle('E7')->getNumberFormat()
                ->setFormatCode(NumberFormat::FORMAT_DATE_DDMMYYYY);

            $sheet->getStyle('D7:E7')->getFill()->applyFromArray($hBackground);

        } else {
            $sheet->setCellValue('C7', Date::PHPToExcel($start_date));

            $sheet->getStyle('C7')->getNumberFormat()
                ->setFormatCode(NumberFormat::FORMAT_DATE_DDMMYYYY);
        }

        $sheet->setCellValue('B8', 'Forma de pago:');
        $sheet->setCellValue('C8', 'Voucher');

        $sheet->getStyle('B7:C8')->getFill()->applyFromArray($hBackground);

        $sheet->getStyle('C10:E10')->getFont()->applyFromArray($hFColor);
        $sheet->getStyle('C10:E10')->getFill()->applyFromArray($hPBackground);

        $start_pos = 10;

        $sheet->setCellValue("C{$start_pos}", 'Adultos');
        $sheet->setCellValue("D{$start_pos}", 'Menores');
        $sheet->setCellValue("E{$start_pos}", 'Total');

        $start_pos++;

        $adultGeneral = 0;
        $totalGeneral = 0.0;
        $childrenGeneral = 0;

        $adult = 0;
        $total = 0.0;
        $children = 0;

        foreach ($response as $key_reseller => $reseller) {
            $cruise_pos = 2;

            $sheet->getStyle("B{$start_pos}:E{$start_pos}")->getFill()
                ->applyFromArray($hBackground);

            $sheet->getStyle("B{$start_pos}:E{$start_pos}")->getFont()
                ->applyFromArray($default);

            $sheet->setCellValue("B{$start_pos}", $key_reseller);

            // Create sheet for detail
            $cruiseSheet = $spreadsheet->createSheet();
            $cruiseSheet->setTitle($key_reseller);

            $cruiseSheet->setCellValue("B{$cruise_pos}", $key_reseller);
            $cruiseSheet->setCellValue("C{$cruise_pos}", 'Adultos');
            $cruiseSheet->setCellValue("D{$cruise_pos}", 'Menores');

            $cruiseSheet->getColumnDimension('B')->setAutoSize(true);
            $cruiseSheet->getColumnDimension('C')->setAutoSize(true);
            $cruiseSheet->getColumnDimension('D')->setAutoSize(true);

            $cruiseSheet->getStyle("C{$cruise_pos}:D{$cruise_pos}")->getAlignment()
                ->setHorizontal('center');

            $cruiseSheet->getStyle("B{$cruise_pos}:D{$cruise_pos}")->getFill()
                ->applyFromArray($hBackground);

            $cruiseSheet->getStyle("B{$cruise_pos}:D{$cruise_pos}")->getFont()
                ->applyFromArray($default);

            $cruiseSheet->setCellValue("B{$cruise_pos}", $key_reseller);

            $start_pos++;
            $cruise_pos++;

            foreach ($reseller as $key_service => $service) {
                $adult    = $adult + $service["adult"];
                $children = $children + $service["children"];
                $total    = $total + $service["total"];

                $sheet->setCellValue("B{$start_pos}", $key_service);
                $sheet->setCellValue("C{$start_pos}", $service["adult"]);
                $sheet->setCellValue("D{$start_pos}", $service["children"]);
                $sheet->setCellValue("E{$start_pos}", $service["total"]);

                $sheet->getStyle("E{$start_pos}")->getNumberFormat()
                    ->setFormatCode(NumberFormat::FORMAT_CURRENCY_USD_SIMPLE);

                // Set detail cruise information
                $code = $service["code"];

                $cruiseSheet->setCellValue("B{$cruise_pos}", "{$code} {$key_service}");
                $cruiseSheet->setCellValue("C{$cruise_pos}", $service["adult"]);
                $cruiseSheet->setCellValue("D{$cruise_pos}", $service["children"]);

                $start_pos++;
                $cruise_pos++;

                // Add boking details
                $cruiseSheet->setCellValue("B10", 'Booking Reference');
                $cruiseSheet->setCellValue("C10", 'Guest');
                $cruiseSheet->setCellValue("D10", '# Cabin');
                $cruiseSheet->setCellValue("E10", 'Adultos');
                $cruiseSheet->setCellValue("F10", 'Menores');
                $cruiseSheet->setCellValue("G10", 'Ticket');

                $cruiseSheet->getColumnDimension('G')->setAutoSize(true);

                $cruiseSheet->getStyle('B10:G10')->getFont()
                    ->applyFromArray($hFColor);
                $cruiseSheet->getStyle('B10:G10')->getFill()
                    ->applyFromArray($hPBackground);

                $cruiseSheet->getStyle("C10:G10")->getAlignment()
                    ->setHorizontal('center');

                $sales = array_filter($bookings, function($data) USE($key_reseller) {
                    return $data->reseller_name == $key_reseller;
                });

                $booking_pos = 11;
                foreach($sales as $booking) {
                    if ($booking->pax_name == 'Adult')
                    {
                        $cruiseSheet->setCellValue("B{$booking_pos}", $booking->booking_reference);
                        $cruiseSheet->setCellValue("C{$booking_pos}", $booking->guest_name);
                        $cruiseSheet->setCellValue("D{$booking_pos}", $booking->cabin);
                        $cruiseSheet->setCellValue("E{$booking_pos}", $booking->quantity);
                        $cruiseSheet->setCellValue("G{$booking_pos}", 'View PDF');

                        $url = "https://lmps.cancunhostingcenter.com/#/status?booking={$booking->uuid_seq}";

                        $cruiseSheet->getCell("G{$booking_pos}")->getHyperlink()
                            ->setUrl($url);

                        $booking_pos++;
                    }
                    else if ($booking->pax_name == 'Children')
                    {
                        $last_pos = ($booking_pos - 1);
                        $cruiseSheet->setCellValue("F{$last_pos}", $booking->quantity);
                    }
                }
            }

            $sheet->getStyle("B{$start_pos}:E{$start_pos}")->getFill()
                ->applyFromArray($fTBackground);

            $sheet->getStyle("B{$start_pos}:E{$start_pos}")->getFont()
                ->applyFromArray($default);

            $sheet->setCellValue("B{$start_pos}", "Total {$key_reseller}");
            $sheet->setCellValue("C{$start_pos}", $adult);
            $sheet->setCellValue("D{$start_pos}", $children);
            $sheet->setCellValue("E{$start_pos}", $total);

            $sheet->getStyle("E{$start_pos}")->getNumberFormat()
                ->setFormatCode(NumberFormat::FORMAT_CURRENCY_USD_SIMPLE);

             // Set detail cruise information
            $cruiseSheet->setCellValue("B{$cruise_pos}", "Total");
            $cruiseSheet->setCellValue("C{$cruise_pos}", $adult);
            $cruiseSheet->setCellValue("D{$cruise_pos}", $children);

            $cruiseSheet->getStyle("B{$cruise_pos}:D{$cruise_pos}")->getFill()
                ->applyFromArray($fTBackground);

            $cruiseSheet->getStyle("B{$cruise_pos}:D{$cruise_pos}")->getFont()
                ->applyFromArray($default);

            $adultGeneral    = $adultGeneral  + $adult;
            $childrenGeneral = $childrenGeneral + $children;
            $totalGeneral    = $totalGeneral + $total;

            $start_pos++;

            $adult = 0;
            $children = 0;
            $total = 0.0;
        }

        $start_pos++;

        $sheet->getStyle("B{$start_pos}:E{$start_pos}")->getFont()
            ->applyFromArray($default);

        $sheet->setCellValue("B{$start_pos}", "Total General");
        $sheet->setCellValue("C{$start_pos}", $adultGeneral);
        $sheet->setCellValue("D{$start_pos}", $childrenGeneral);
        $sheet->setCellValue("E{$start_pos}", $totalGeneral);

        $sheet->getStyle("E{$start_pos}")->getNumberFormat()
                ->setFormatCode(NumberFormat::FORMAT_CURRENCY_USD_SIMPLE);

        $writer = new Xlsx($spreadsheet);

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="'. $file_name .'.xlsx"');
        header('Cache-Control: max-age=0');

        $writer->save('php://output'); // download file
        exit();
    }

    private function groupByResellerService($data){
        //Agrupar por reseller
        $data = $this->group_by("reseller_name", $data);

        //Agrupar por servicio
        foreach($data as &$service){
            $service = $this->group_by("service_name", $service);
        }

        $adult    = 0;
        $children = 0;
        $courtesy = 0;
        $total    = 0.0;

        //Realizar conteo de pax
        foreach($data as &$reseller) {
            foreach($reseller as &$service) {
                $code = '';
                foreach($service as $element) {

                    switch($element->pax_name) {
                        case "Adult":
                            $adult = $adult + $element->quantity;
                            break;
                        case "Children":
                            $children = $children + $element->quantity;
                            break;
                        case "Courtesy":
                            $courtesy = $courtesy + $element->quantity;
                            break;
                    }

                    $total = $total + $element->total;

                    $code = $element->lmps_code;
                }

                //Generando nueva estructura
                $service = array(
                    "adult"    => $adult,
                    "children" => $children,
                    "courtesy" => $courtesy,
                    "total"    => $total,
                    "code"     => $code
                );

                //Reiniciando valores
                $adult    = 0;
                $children = 0;
                $courtesy = 0;
                $total    = 0.0;
            }

        }

        return $data;

    }

    private function group_by($key, $data) {
        $result = array();

        foreach($data as $val) {
            if(property_exists($val, $key)){
                $result[$val->$key][] = $val;
            }else{
                $result[""][] = $val;
            }
        }

        return $result;
    }

}

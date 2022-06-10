<?php
namespace App\Controllers;
require APPPATH . 'Libraries/vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;


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

    public function export(){

        
        $start_date = $this->request->uri->getSegment(3);
        $end_date = $this->request->uri->getSegment(4);

        $response = $this->sale_report->get_sales($start_date,$end_date);       

        if(is_null($response))
            return;

        $response = $this->groupByResellerService($response);

        

        $file_name = 'sales';
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $sheet->getStyle('A5')->getFont()->applyFromArray(
            [
                'bold'     => TRUE,
                'color'    => [
                    'rgb'  => '000000'
                ]
            ]
        );

        $sheet->setCellValue('A5', 'Reporte diario de ventas Last Minute');
        
        $sheet->setCellValue('A7', 'Fecha:');
        $sheet->setCellValue('B7', $start_date . ' al ' . $end_date);

        $sheet->setCellValue('A8', 'Forma de pago:');
        $sheet->setCellValue('B8', 'Voucher');

        $start_pos = 10;
        
        // Background 
        $sheet->getStyle('C10:F10')->getFill()->applyFromArray(
            [
                'fillType' => Fill::FILL_GRADIENT_LINEAR,
                'rotation' => 0,
                'color'    => [
                    'rgb'  => '517094'
                ]
            ]
        );

        //Font Style 
        $sheet->getStyle('C10:F10')->getFont()->applyFromArray(
                 [
                    'bold'     => TRUE,
                    'color'    => [
                        'rgb'  => 'FBFCFC'
                    ]
                ]
        );

		$sheet->setCellValue('C'. $start_pos, 'Adultos');

		$sheet->setCellValue('D'. $start_pos, 'Menores');

        $sheet->setCellValue('E'. $start_pos, 'Cortesias');

        $sheet->setCellValue('F'. $start_pos, 'Total');

        $start_pos = $start_pos + 1;

        $adultGeneral = 0;
        $childrenGeneral = 0;
        $courtesyGeneral=0;
        $totalGeneral = 0.0;

        $adult = 0;
        $children = 0;
        $courtesy=0;
        $total = 0.0;

        foreach ($response as $key_reseller => $reseller) {
            $sheet->getStyle('B' . $start_pos . ':F' . $start_pos)->getFill()->applyFromArray(
                [
                    'fillType' => Fill::FILL_GRADIENT_LINEAR,
                    'rotation' => 0,
                    'color'    => [
                        'rgb'  => '8EABCC'
                    ]
                ]
            );

            $sheet->getStyle('B' . $start_pos . ':F' . $start_pos)->getFont()->applyFromArray(
                [
                    'bold'     => TRUE,
                    'color'    => [
                        'rgb'  => '000000'
                    ]
                ]
            );

            $sheet->setCellValue('B'. $start_pos, $key_reseller);
            $start_pos = $start_pos + 1;            
             
            foreach ($reseller as $key_service => $service) {
                $adult = $adult + $service["Adult"];
                $children = $children + $service["Children"];
                $courtesy = $courtesy + $service["Courtesy"];
                $total = $total + $service["total"];                

                $sheet->setCellValue('B' . $start_pos, $key_service);

                $sheet->setCellValue('C' . $start_pos, $service["Adult"]);

                $sheet->setCellValue('D' . $start_pos, $service["Children"]);

                $sheet->setCellValue('E' . $start_pos, $service["Courtesy"]);

                $sheet->setCellValue('F' . $start_pos, "$".$service["total"]);

                $start_pos++;
                
            }           

            $sheet->getStyle('B' . $start_pos . ':F' . $start_pos)->getFont()->applyFromArray(
                [
                    'bold'     => TRUE,
                    'color'    => [
                        'rgb'  => '000000'
                    ]
                ]
            );

            $sheet->setCellValue('B'. $start_pos, "Total " . $key_reseller);
            $sheet->setCellValue('C' . $start_pos, $adult);
            $sheet->setCellValue('D' . $start_pos, $children);
            $sheet->setCellValue('E' . $start_pos, $courtesy);
            $sheet->setCellValue('F' . $start_pos, "$".$total);

            $adultGeneral = $adultGeneral  + $adult;
            $childrenGeneral = $childrenGeneral + $children;
            $courtesyGeneral= $courtesyGeneral + $courtesy;
            $totalGeneral = $totalGeneral + $total;

            $start_pos++;

            $adult = 0;
            $children = 0;
            $courtesy=0;
            $total = 0.0;
        }

        $start_pos++;

        $sheet->getStyle('B' . $start_pos . ':F' . $start_pos)->getFont()->applyFromArray(
            [
                'bold'     => TRUE,
                'color'    => [
                    'rgb'  => '000000'
                ]
            ]
        );

        $sheet->setCellValue('B'. $start_pos, "Total General");
        $sheet->setCellValue('C' . $start_pos, $adultGeneral);
        $sheet->setCellValue('D' . $start_pos, $childrenGeneral);
        $sheet->setCellValue('E' . $start_pos, $courtesyGeneral);
        $sheet->setCellValue('F' . $start_pos, "$" . $totalGeneral);

        $writer = new Xlsx($spreadsheet);

        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment;filename="' . $file_name . '.xlsx"');
        header('Cache-Control: max-age=0');
        $writer->save('php://output');

    }

    private function groupByResellerService($data){
        //Agrupar por reseller
        $data = $this->group_by("reseller_name",$data);

        //Agrupar por servicio
        foreach($data as &$service){
            $service = $this->group_by("service_name",$service);
        }

        $adult = 0;
        $children = 0;
        $courtesy=0;
        $total = 0.0;

        //Realizar conteo de pax
        foreach($data as &$reseller){

            foreach($reseller as &$service){                

                foreach($service as $element){

                    switch($element->pax_name){
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

                }

                //Generando nueva estructura
                $service = array(
                    "Adult" => $adult,
                    "Children" => $children,
                    "Courtesy" => $courtesy,
                    "total" => $total
                );

                //Reiniciando valores
                $adult = 0;
                $children = 0;
                $courtesy=0;
                $total = 0.0;

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

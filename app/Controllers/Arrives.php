<?php
namespace App\Controllers;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class Arrives extends BaseController
{
    public $bd;
    public $arrive;

    public function __construct()
    {
        $this->db      = \Config\Database::connect();
        $this->session = \Config\Services::session();

        $this->arrive = new \App\Models\Arrive();
    }

    /**
    *Index page for this controller
    */
    public function index()
    {
        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = $this->request->uri->getSegment(1);
        $option = $this->request->uri->getSegment(2);

        
        $this->page->page_name      = $view;
        $this->page->menu_active    = 'arrives';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();
     
        $data['contents'] = str_replace(
            'btn-export-excel', 'btn-export-excel hidden', $data['contents']
        );

        if ($option == 'list')
        {
            $table = $this->arrive->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of calls', $data['contents']
            );

            $form = $this->arrive->get_form('search');
            $form = str_replace('{id}', 'search', $form);

            $data['contents'] = str_replace(
                '{search}', $form, $data['contents']
            );

            $data['contents'] = str_replace(
                '{allotmentsTitle}', '', $data['contents']
            );

            $data['contents'] = str_replace(
                '{allotments}', '', $data['contents']
            );
        }
        else
        {
            $form = $this->arrive->get_form();
            $form = str_replace('{id}', 'add-arrives', $form);

            $data['contents'] = str_replace(
                '{title}', 'New call', $data['contents']
            );

            $data['contents'] = str_replace(
                '{search}', '', $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', $form, $data['contents']
            );
            $data['contents'] = str_replace(
                '{allotmentsTitle}', '', $data['contents']
            );
            $data['contents'] = str_replace(
                '{allotments}', '', $data['contents']
            );
        }

        $userId = 'window.user = ' . $this->session->get('user_id');
        $script = custom('script', '', $userId);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }

    /**
    *Update page for this controller
    */
    public function update()
    {
        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = $this->request->uri->getSegment(1);
        $option = $this->request->uri->getSegment(2);

        $this->page->page_name = 'arrives';

        $data = $this->page->get_contents();

        $form = $this->arrive->get_form();
        $form = str_replace('{id}', 'update-arrives', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit cruise arrive', $data['contents']
        );

        $data['contents'] = str_replace(
            '{search}', $form, $data['contents']
        );
/*
        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );
*/
        $table = $this->arrive->get_list_allotments();

        $data['contents'] = str_replace(
            '{allotmentsTitle}', 'Edit Allotments of Cruise', $data['contents']
        );

        $data['contents'] = str_replace(
            '{allotments}', $table, $data['contents']
        );

        $arrives = $this->arrive->get_data($option);
        $arrives = 'window.arrives = ' . json_encode($arrives);

        $userId = 'window.user = ' . $this->session->get('user_id');
        $script = custom('script', '', $userId);

        $data['scripts'] = $script .  $data['scripts'];

        $userRol = 'window.roluser = ' . $this->session->userdata('rol_id');
        $script = custom('script', '', $userRol);

        $data['scripts'] = $script .  $data['scripts'];

        $script = custom('script', '', $arrives);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);

    }

    public function buil_excel() {

        $id = $_GET['id'];

        $this->db->close();
        $this->load->database();

        $query  = 'CALL get_arrive(?, ?, ?, ?, ?, ?, ?)';
        $result = $this->db->query($query, ['id', $id, NULL, NULL, NULL, NULL, NULL]);

        $row = $result->getRow();
        
        $spreadsheet = new Spreadsheet();
        $sheet       = $spreadsheet->getActiveSheet();

        if ($row->response == 200)
        {
            $sheet ->getColumnDimension('B')->setWidth(40);
            $sheet ->getColumnDimension('C')->setWidth(19);
            $sheet ->getColumnDimension('D')->setWidth(16);
            $sheet ->getColumnDimension('E')->setWidth(16);
            $sheet ->getColumnDimension('F')->setWidth(16);
            $sheet ->getColumnDimension('G')->setWidth(10);

            $styletableArrive = array(
                "borders" => array(
                    "allBorders" => array(
                        "borderStyle" => Border::BORDER_THIN,
                        "color" => array("argb" => "517094"),
                    ),
                ),
            );

            $sheet ->getStyle("B2:C7")->applyFromArray($styletableArrive);

            $sheet->getStyle('B2:C7')->getFill()->applyFromArray(
                [
                    'fillType' => Fill::FILL_GRADIENT_LINEAR,
                    'rotation' => 0,
                    'startColor' => [
                        'rgb' => 'DCE6F2'
                    ],
                    'endColor' => [
                        'argb' => 'DCE6F2'
                    ]
                ]
            );

            $darkrow = array(
                'fillType' => Fill::FILL_GRADIENT_LINEAR,
                'rotation' => 0,
                'color' => array('argb' => '8EABCC')
            );

            $sheet->getStyle('B2:C2')->getFill()->applyFromArray($darkrow);
            $sheet->getStyle('B4:C4')->getFill()->applyFromArray($darkrow);
            $sheet->getStyle('B6:C6')->getFill()->applyFromArray($darkrow);

            $sheet->getStyle('B2:B7')->getFont()->applyFromArray(
                [
                   'bold' => False,
                    'color' => [
                        'rgb' => '17202A'
                   ]
               ]
            );

            $sheet->setCellValue('B2', 'CRUISE:');
            $sheet->setCellValue('B3', 'ARRIVAL_DATE:');
            $sheet->setCellValue('B4', 'ARRIVAL_TIME:');
            $sheet->setCellValue('B5', 'DEPARTURE_TIME:');
            $sheet->setCellValue('B5', 'MARKUP_START:');
            $sheet->setCellValue('B6', 'MARKUP_END:');
            $sheet->setCellValue('B7', 'STATUS:');

            foreach ($result->getResult() as $row)
            {
                $sheet->setCellValue('C2', $row->ship_name);
                $sheet->setCellValue('C3', $row->arrival_date);
                $sheet->setCellValue('C4', $row->arrival_time);
                $sheet->setCellValue('C5', $row->departure_time);
                $sheet->setCellValue('C5', $row->markup_start);
                $sheet->setCellValue('C6', $row->markup_end);
                $sheet->setCellValue('C7', $row->active_status);
            }

            $result->freeResult();

            //ALLOTMENTS TABLE ON EXCEL
            $query  = 'CALL get_allotment(?, ?, ?, ?, ?, ?, ?)';
            $result = $this->db->query($query, ['arrive', NULL, NULL, NULL, $id, NULL, NULL]);

            $row      = $result->getRow();
            $num_rows = $result->getNumRows();

            if ($row->response == 200)
            {
                $styleheaderAllotments = array(
                    "borders" => array(
                        "allBorders" => array(
                            "borderStyle" => Border::BORDER_THIN,
                            "color" => array("argb" => "517094"),
                        ),
                    ),
                );
                $sheet ->getStyle("B10:G" .(10 + $num_rows))->applyFromArray($styleheaderAllotments);

                //background default of Header of Allotments
                $sheet->getStyle('B10:G10')->getFill()->applyFromArray(
                    [
                        'fillType' => Fill::FILL_GRADIENT_LINEAR,
                        'rotation' => 0,
                         'color' => [
                             'rgb' => '517094'
                         ]
                    ]
                );

                //Font Style on Header Allotments
                $sheet->getStyle('B10:G10')->getFont()->applyFromArray(
                         [
                            'bold' => TRUE,
                             'color' => [
                                 'rgb' => 'FBFCFC'
                            ]
                        ]
                );

                $sheet->setCellValue('B10', 'SERVICE');
                $sheet->setCellValue('C10', 'SCHEDULE_START');
                $sheet->setCellValue('D10', 'SCHEDULE_END');
                $sheet->setCellValue('E10', 'MIN_CAPACITY');
                $sheet->setCellValue('F10', 'MAX_CAPACITY');
                $sheet->setCellValue('G10', 'STATUS');
                $ind=10;

                //background default of body of Allotments #DCE6F2
                $sheet->getStyle('B11:G'.(10 + $num_rows))->getFill()->applyFromArray(
                    [
                        'fillType' => Fill::FILL_GRADIENT_LINEAR,
                        'rotation' => 0,
                        'color' => [
                            'rgb' => 'DCE6F2'
                        ]
                    ]
                );

                $controw = 0;
                 for ($i = 0; $i < $num_rows; $i++)
                {
                    $ind++;

                    $sheet->setCellValue('B'.$ind, $result[$i]->service_name);
                    $sheet->setCellValue('C'.$ind, $result[$i]->schedule_start_base);
                    $sheet->setCellValue('D'.$ind, $result[$i]->schedule_end_base);
                    $sheet->setCellValue('E'.$ind, $result[$i]->min_available_base);
                    $sheet->setCellValue('F'.$ind, $result[$i]->max_available_base);
                    $sheet->setCellValue('G'.$ind, $result[$i]->active_status_base);

                   //background diferent each 2 rows #8EABCC
                    if ($controw == $i){
                       $sheet->getStyle('B'.$ind.':G'.$ind)->getFill()->applyFromArray(
                        [
                             'fillType' => Fill::FILL_GRADIENT_LINEAR,
                             'rotation' => 0,
                             'color' => [
                                 'rgb' => '8EABCC'
                             ]
                        ]
                       );
                       $controw = $controw + 2;
                   }
                }
            }
        }

        $writer = new Xlsx($spreadsheet);
        $filename = 'Arrive Excel';

        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment;filename="'. $filename .'.xlsx"');
        header('Cache-Control: max-age=0');
        
        $writer->save('php://output'); // download file
    }
}

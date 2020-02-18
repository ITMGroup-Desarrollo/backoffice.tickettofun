<?php
defined('BASEPATH') OR exit('No direct script access allowed');
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class Arrives extends CI_Controller
{
    /**
    *Index page for this controller
    */
    public function index()
    {

        $this->load->library('user_session', NULL, 'user');

        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = $this->uri->segment(1);
        $option = $this->uri->segment(2);

        $this->load->Model('Page');
        $this->Page->page_name = $view;
        $this->Page->menu_active = 'arrives';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();
        $this->load->Model('Arrive');

        $data['contents'] = str_replace(
            'btn-export-excel', 'btn-export-excel hidden', $data['contents']
        );

        if ($option == 'list')
        {
            $table = $this->Arrive->get_list();

            $data['contents'] = str_replace(
                '{title}', 'List of calls', $data['contents']
            );

            $form = $this->Arrive->get_form('search');
            $form = str_replace('{id}', 'search', $form);

            $data['contents'] = str_replace(
                '{search}', $form, $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}', "<hr />".$table, $data['contents']
            );

            $data['contents'] = str_replace(
                '{allotmentsTitle}', '', $data['contents']
            );

            $data['contents'] = str_replace(
                '{allotments}', '', $data['contents']
            );
            $data['contents'] = str_replace(
                '{contentbtn}', '', $data['contents']
            );

        }
        else
        {
            $form = $this->Arrive->get_form();
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

            $data['contents'] = str_replace(
                '{contentbtn}', '', $data['contents']
            );
        }

        $userId = 'window.user = ' . $this->session->userdata('user_id');
        $script = custom('script', '', $userId);
        $data['scripts'] = $script .  $data['scripts'];

        $this->load->view('Master', $data);
    }

    /**
    *Update page for this controller
    */
    public function update()
    {
        $this->load->library('user_session', NULL, 'user');

        if ( ! $this->user->active_session())
            redirect(base_url('signin'));

        $view   = $this->uri->segment(1);
        $option = $this->uri->segment(2);

        $this->load->Model('Page');
        //$this->Page->page_name = $view;
        $this->Page->page_name = 'arrives';

        $data = $this->Page->get_contents();

        $this->load->Model('Arrive');

        $form = $this->Arrive->get_form();
        $form = str_replace('{id}', 'update-arrives', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit cruise arrive', $data['contents']
        );

        $data['contents'] = str_replace(
            '{search}', '', $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}', $form, $data['contents']
        );

        $table = $this->Arrive->get_list_allotments();

        $data['contents'] = str_replace(
            '{allotmentsTitle}', 'Edit Allotments of Cruise', $data['contents']
        );

        $data['contents'] = str_replace(
            '{allotments}', $table, $data['contents']
        );

        $formbtn = $this->Arrive->get_formbtn();
        $formbtn = str_replace('{id}', 'allotmentsbtn', $formbtn);
        $formbtn = str_replace('btn btn-success save', 'btn btn-info load-allotments', $formbtn);
        $formbtn = str_replace('Save', 'Simulate', $formbtn);

        $data['contents'] = str_replace(
            '{contentbtn}', $formbtn, $data['contents']
        );

        $arrives = $this->Arrive->get_data($option);
        $arrives = 'window.arrives = ' . json_encode($arrives);

        $data['contents'] = str_replace(
            '{classcontainererrors}', ' hidden', $data['contents']
        );

        $userId = 'window.user = ' . $this->session->userdata('user_id');
        $script = custom('script', '', $userId);
        $data['scripts'] = $script .  $data['scripts'];

        $script = custom('script', '', $arrives);
        $data['scripts'] = $script .  $data['scripts'];

        $this->load->view('Master', $data);

    }

    public function buil_excel() {

        $id = $_GET['id'];

        $this->db->close();
        $this->load->database();

        $query = 'CALL get_arrive(?, ?, ?, ?, ?, ?)';
        $data = array('id', $id, NULL, NULL, NULL, NULL);

        $query_result = $this->db->query($query, $data);
        $result   = $query_result->result();

        $query_result->free_result();
        $this->db->close();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        if ($result[0]->response == 200)
        {

            $sheet ->getColumnDimension('B')->setWidth(40);
            $sheet ->getColumnDimension('C')->setWidth(19);
            $sheet ->getColumnDimension('D')->setWidth(16);
            $sheet ->getColumnDimension('E')->setWidth(16);
            $sheet ->getColumnDimension('F')->setWidth(16);
            $sheet ->getColumnDimension('G')->setWidth(10);

            $styletableArrive = array(
                "borders" => array(
                    "outline" => array(
                        "borderStyle" => Border::BORDER_THIN,
                        "color" => array("argb" => "517094"),
                    ),
                ),
            );

            $sheet ->getStyle("B2:C7")->applyFromArray($styletableArrive);

            $sheet->getStyle('B2:B7')->getFill()->applyFromArray(
                [
                    'fillType' => Fill::FILL_GRADIENT_LINEAR,
                    'rotation' => 0,
                    'startColor' => [
                        'rgb' => '517094'
                    ],
                    'endColor' => [
                        'argb' => 'FFFFFFFF'
                    ]
                ]
            );

            $sheet->getStyle('B2:B7')->getFont()->applyFromArray(
                [
                   'bold' => TRUE,
                    'color' => [
                        'rgb' => 'FBFCFC'
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

            foreach ($result as $row)
            {
                $sheet->setCellValue('C2', $row->ship_name);
                $sheet->setCellValue('C3', $row->arrival_date);
                $sheet->setCellValue('C4', $row->arrival_time);
                $sheet->setCellValue('C5', $row->departure_time);
                $sheet->setCellValue('C5', $row->markup_start);
                $sheet->setCellValue('C6', $row->markup_end);
                $sheet->setCellValue('C7', $row->active_status);
            }

            //ALLOTMENTS TABLE ON EXCEL
            $this->db->close();
            $this->load->database();
            $query = 'CALL get_allotment(?, ?, ?, ?, ?, ?, ?)';
            $data = array('arrive', NULL, NULL, NULL, $id, NULL, NULL);

            $query_result = $this->db->query($query, $data);

            $num_rows = $query_result->num_rows();
            $result   = $query_result->result();

            $query_result->free_result();
            $this->db->close();

            if ($result[0]->response == 200)
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

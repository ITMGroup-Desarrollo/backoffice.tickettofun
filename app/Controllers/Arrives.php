<?php
namespace App\Controllers;

require APPPATH . 'Libraries/vendor/autoload.php';

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
            return redirect()->to(base_url('signin'));

        $view   = $this->request->uri->getSegment(1);
        $option = $this->request->uri->getSegment(2);

        $this->page->page_name      = $view;
        $this->page->menu_active    = 'arrives';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        if ($option == 'list')
        {
            $data['contents'] = str_replace(
                '{title}', 'List of calls', $data['contents']
            );

            $form = $this->arrive->get_form('search');
            $form = str_replace('{id}', 'search', $form);

            $data['contents'] = str_replace(
                '{search}', $form, $data['contents']
            );

            $data['contents'] = str_replace('{id}', 'channel-filter', $data['contents']);

            $data['contents'] = str_replace(
                '{allotments}', '', $data['contents']
            );

            $data['contents'] = str_replace(
                '{contentbtn}', '', $data['contents']
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
                '{search}', $form, $data['contents']
            );

            $data['contents'] = str_replace('{id}', 'channel-filter', $data['contents']);

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
            return redirect()->to(base_url('signin'));

        $view   = $this->request->uri->getSegment(1);
        $option = $this->request->uri->getSegment(2);

        $this->page->page_name = $view;
        $this->page->custom_menu_bar = 'MENU_BAR_EXPORT';

        $data = $this->page->get_contents();

        $form = $this->arrive->get_form();
        $form = str_replace('{id}', 'update-arrives', $form);

        $data['contents'] = str_replace(
            '{title}', 'Edit cruise arrive', $data['contents']
        );

        $data['contents'] = str_replace(
            '{search}', $form, $data['contents']
        );

        $data['contents'] = str_replace('{id}', 'channel-filter', $data['contents']);
        $data['contents'] = str_replace('{text}', 'Edit Allotments of ', $data['contents']);

        $export_icon = '<i class="fa fa-file-excel"></i>';
        $data['contents'] = str_replace('EXPORT', $export_icon, $data['contents']);

        $arrives = $this->arrive->get_data($option);
        $arrives = 'window.arrives = ' . json_encode($arrives);

        $userId = 'window.user = ' . $this->session->get('user_id');
        $script = custom('script', '', $userId);

        $data['scripts'] = $script .  $data['scripts'];

        $userRol = 'window.roluser = ' . $this->session->get('rol_id');
        $script = custom('script', '', $userRol);

        $data['scripts'] = $script .  $data['scripts'];

        $script = custom('script', '', $arrives);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }

    public function export() {

        $id = $this->request->uri->getSegment(3);

        $arrive = $this->arrive->get_data($id);

        $spreadsheet = new Spreadsheet();
        $sheet       = $spreadsheet->getActiveSheet();

        if (property_exists($arrive, "id"))
        {
            $sheet->getColumnDimension('B')->setWidth(40);
            $sheet->getColumnDimension('C')->setWidth(19);
            $sheet->getColumnDimension('D')->setWidth(16);
            $sheet->getColumnDimension('E')->setWidth(18);
            $sheet->getColumnDimension('F')->setWidth(18);
            $sheet->getColumnDimension('G')->setWidth(10);

            $styletableArrive         = array(
                "borders"             => array(
                    "allBorders"      => array(
                        "borderStyle" => Border::BORDER_THIN,
                        "color"       => array("argb" => "517094"),
                    ),
                ),
            );

            $sheet->getStyle("B2:C6")->applyFromArray($styletableArrive);

            $sheet->getStyle('B2:B6')->getFont()->applyFromArray(
                [
                   'bold'     => True,
                    'color'   => [
                        'rgb' => '17202A'
                   ]
               ]
            );

            $sheet->setCellValue('B2', 'Cruise');
            $sheet->setCellValue('B3', 'Arrival date');
            $sheet->setCellValue('B4', 'Arrival time');
            $sheet->setCellValue('B5', 'Departure tieme');
            $sheet->setCellValue('B5', 'Markup start');
            $sheet->setCellValue('B6', 'Markup end');

            $sheet->setCellValue('C2', $arrive->ship_name);
            $sheet->setCellValue('C3', $arrive->arrival_date);
            $sheet->setCellValue('C4', $arrive->arrival_time);
            $sheet->setCellValue('C5', $arrive->departure_time);
            $sheet->setCellValue('C5', $arrive->markup_start);
            $sheet->setCellValue('C6', $arrive->markup_end);

            $response = $this->arrive->get_allotments_data($id);

            if ($response->code == 200)
            {
                $allotments = $response->message;

                $num_rows = count($allotments);

                $styleheaderAllotments = array(
                    "borders"             => array(
                        "allBorders"      => array(
                            "borderStyle" => Border::BORDER_THIN,
                            "color"       => array("argb" => "517094"),
                        ),
                    ),
                );

                $sheet ->getStyle("B10:F" .(10 + $num_rows))->applyFromArray($styleheaderAllotments);

                // Background default of Header of Allotments
                $sheet->getStyle('B10:F10')->getFill()->applyFromArray(
                    [
                        'fillType' => Fill::FILL_GRADIENT_LINEAR,
                        'rotation' => 0,
                        'color'    => [
                            'rgb'  => '517094'
                        ]
                    ]
                );

                //Font Style on Header Allotments
                $sheet->getStyle('B10:G10')->getFont()->applyFromArray(
                         [
                            'bold'     => TRUE,
                            'color'    => [
                                'rgb'  => 'FBFCFC'
                            ]
                        ]
                );

                $sheet->setCellValue('B10', 'Service');
                $sheet->setCellValue('C10', 'Schedule start');
                $sheet->setCellValue('D10', 'Schedule end');
                $sheet->setCellValue('E10', 'Minimum capacity');
                $sheet->setCellValue('F10', 'Maximum capacity');

                //background default of body of Allotments #DCE6F2
                $sheet->getStyle('B11:F'.(10 + $num_rows))->getFill()->applyFromArray(
                    [
                        'fillType' => Fill::FILL_GRADIENT_LINEAR,
                        'rotation' => 0,
                        'color'    => [
                            'rgb'  => 'DCE6F2'
                        ]
                    ]
                );

                $pos = 11;
                foreach ($allotments as $row)
                {
                    if ($row->active_status == 1) {
                        $sheet->setCellValue('B'.$pos, $row->service_name);
                        $sheet->setCellValue('C'.$pos, $row->schedule_start_base);
                        $sheet->setCellValue('D'.$pos, $row->schedule_end_base);
                        $sheet->setCellValue('E'.$pos, $row->min_available_base);
                        $sheet->setCellValue('F'.$pos, $row->max_available_base);

                        if ($pos % 2 == 0)
                        {
                            $sheet->getStyle('B'.$pos.':F'.$pos)->getFill()->applyFromArray(
                                [
                                    'fillType' => Fill::FILL_GRADIENT_LINEAR,
                                    'rotation' => 0,
                                    'color'    => [
                                        'rgb'  => '8EABCC'
                                    ]
                                ]
                            );
                        }

                        $pos++;
                    }
                }
            }
        }

        $writer = new Xlsx($spreadsheet);
        $filename = 'Arrive Excel';

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="'. $filename .'.xlsx"');
        header('Cache-Control: max-age=0');

        $writer->save('php://output'); // download file
        exit();
    }
}

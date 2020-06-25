<?php
defined('BASEPATH') or exit('No direct script access allowed');

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class Layouts extends CI_Controller
{
    /**
     *Index page for this controller
     */
    public function index()
    {
        $this->load->library('user_session', NULL, 'user');

        if (!$this->user->active_session())
            redirect(base_url('signin'));

        $view   = $this->uri->segment(1);
        $option = $this->uri->segment(2);

        $this->load->Model('Page');
        $this->Page->page_name = $view;
        $this->Page->menu_active = 'Layouts';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('Layout');

        if ($option == 'download') {
            $table = $this->Layout->get_list();

            $data['contents'] = str_replace(
                '{title}',
                'List of layouts',
                $data['contents']
            );

            $data['contents'] = str_replace(
                '{content}',
                $table,
                $data['contents']
            );
        } else {
            redirect(base_url($this->session->userdata('page_default')));
        }

        $this->load->view('Master', $data);
    }

    public function export()
    {

        $this->load->library('user_session', NULL, 'user');

        if (!$this->user->active_session())
            redirect(base_url('signin'));

        $option = $this->uri->segment(3);

        if (empty($option))
            redirect(base_url('layouts/download'));

        $this->load->Model('Layout');

        $file_name = '';

        $spreadsheet = $this->Layout->build_layout($option, $file_name);
        $writer = new Xlsx($spreadsheet);

        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment;filename="' . $file_name . '.xlsx"');
        header('Cache-Control: max-age=0');
        $writer->save('php://output'); // download file
    }
}

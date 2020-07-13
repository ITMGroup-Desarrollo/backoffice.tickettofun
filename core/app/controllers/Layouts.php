<?php
defined('BASEPATH') or exit('No direct script access allowed');

use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;

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

    public function upload()
    {

        $this->load->library('user_session', NULL, 'user');

        if (!$this->user->active_session())
            redirect(base_url('signin'));

        $view   = $this->uri->segment(1);
        $option = $this->uri->segment(2);

        $this->load->Model('Page');
        $this->Page->page_name = $view;
        $this->Page->menu_active = 'layouts';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('Layout');

        $form = $this->Layout->get_form();
        $form = str_replace('{id}', 'upload-layout', $form);

        $data['contents'] = str_replace(
            '{title}',
            'Upload Layuots',
            $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}',
            $form,
            $data['contents']
        );

        $listLayouts = $this->Layout->get_list_layouts();
        $dataLayout = 'window.layoutData = ' . json_encode($listLayouts);
        $script = custom('script', '', $dataLayout);
        $data['scripts'] = $script .  $data['scripts'];

        $layout = 'window.user_create_id = ' . $this->session->userdata('user_id');
        $script = custom('script', '', $layout);
        $data['scripts'] = $script .  $data['scripts'];

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
        $writer->save('php://output');
    }

    public function upload_file()
    {
        try {

            if ($_SERVER['REQUEST_METHOD'] == 'POST') {

                $code = $this->input->post('layout-element');

                $config['upload_path']   = './img/';
                $config['allowed_types'] = 'xlsx';

                $this->load->library('upload', $config);

                if (!$this->upload->do_upload('newfile')) {
                    throw new Exception($this->upload->display_errors());
                } else {

                    $fileName =  $this->upload->data('full_path');
                    /**  Identify the type of $inputFileName  **/
                    $inputFileType = IOFactory::identify($fileName);
                    /**  Create a new Reader of the type that has been identified  **/
                    $reader = IOFactory::createReader($inputFileType);
                    /**  Load $inputFileName to a Spreadsheet Object  **/
                    $spreadsheet = $reader->load($fileName);

                    $this->load->Model('Layout');

                    $layout = $this->Layout->get_layout($code);

                    if (!$this->Layout->validate_headers($spreadsheet->getActiveSheet(), $layout)) {
                        throw new Exception("The file's headers are incorrect.");
                    }

                    $data = array();
                    $this->Layout->validate_data_row($spreadsheet->getActiveSheet(), $layout);

                    unlink($fileName);

                    $response['code'] = 200;
                    $response['message'] = "ok";
                    $response['data'] = $this->Layout->get_data_rows();
                    $response['data_errors'] = $this->Layout->get_data_errors();
                }
            } else {
                throw new Exception("Denied permissions.");
            }
        } catch (Exception $e) {
            $response['code'] = 400;
            $response['message'] = $e->getMessage();
        }

        echo json_encode($response);
    }
}

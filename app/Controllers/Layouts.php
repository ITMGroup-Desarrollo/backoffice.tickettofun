<?php
namespace App\Controllers;

use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;

use Exception;

class Layouts extends BaseController
{
    public $layout;

    public function __construct()
    {
        $this->layout = new \App\Models\Layout();
    }

    /**
     *Index page for this controller
     */
    public function index() // TODO: Fix route {layout/download} download get 404 error
    {
        if (!$this->user->active_session())
            redirect(base_url('signin'));

        $view   = $this->request->uri->getSegment(1);
        $option = $this->request->uri->getSegment(2);
        
        $this->page->page_name      = $view;
        $this->page->menu_active    = 'Layouts';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        if ($option == 'download') {
            $table = $this->layout->get_list();

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

        return view('Master', $data);
    }

    public function upload()
    {
        if (!$this->user->active_session())
            redirect(base_url('signin'));

        $view   = $this->request->uri->getSegment(1);
        $option = $this->request->uri->getSegment(2);
        
        $this->page->page_name      = $view;
        $this->page->menu_active    = 'layouts';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        $form = $this->layout->get_form();
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

        $listLayouts     = $this->layout->get_list_layouts();
        $dataLayout      = 'window.layoutData = ' . json_encode($listLayouts);
        $script          = custom('script', '', $dataLayout);
        $data['scripts'] = $script .  $data['scripts'];

        $layout          = 'window.user_create_id = ' . $this->session->get('user_id');
        $script          = custom('script', '', $layout);
        $data['scripts'] = $script .  $data['scripts'];

        return view('Master', $data);
    }

    public function export()
    {
        if (!$this->user->active_session())
            redirect(base_url('signin'));

        $option = $this->request->uri->getSegment(3);

        if (empty($option))
            redirect(base_url('layouts/download'));

        $file_name = '';

        $spreadsheet = $this->layout->build_layout($option, $file_name);
        $writer = new Xlsx($spreadsheet);

        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment;filename="' . $file_name . '.xlsx"');
        header('Cache-Control: max-age=0');
        $writer->save('php://output');
    }

    public function upload_file()
    {
        try 
        {
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

                    $layout = $this->layout->get_layout($code);

                    if (!$this->layout->validate_headers($spreadsheet->getActiveSheet(), $layout)) {
                        throw new Exception("The file's headers are incorrect.");
                    }

                    $data = array();
                    $this->layout->validate_data_row($spreadsheet->getActiveSheet(), $layout);

                    unlink($fileName);

                    $response['code'] = 200;
                    $response['message'] = "ok";
                    $response['data'] = $this->layout->get_data_rows();
                    $response['data_errors'] = $this->layout->get_data_errors();
                }
            } 
            else 
            {
                throw new Exception("Denied permissions.");
            }
        } catch (Exception $e) {
            $response['code'] = 400;
            $response['message'] = $e->getMessage();
        }

        return $this->response->setJson($response);
    }
}

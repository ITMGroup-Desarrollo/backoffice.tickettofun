<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Diary extends CI_Controller
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
        $this->Page->menu_active = 'diary';
        $this->Page->submenu_active = $option;

        $data = $this->Page->get_contents();

        $this->load->Model('Diaries');
        $locations = $this->Diaries->get_location_distribution();

        $data['contents'] = str_replace(
            '{title}', ucwords($view), $data['contents']
        );

        $data['contents'] = str_replace(
            '{spec}', $locations['tours'], $data['contents']
        );

        $data['contents'] = str_replace(
            '{sub-title}', 'Port of Costa Maya', $data['contents']
        );

        $data['contents'] = str_replace(
            '{total_tours}', $locations['total_tours'], $data['contents']
        );

        $data['contents'] = str_replace(
            '{details}', $locations['details'], $data['contents']
        );

        $form = $this->Diaries->get_form();
        $data['contents'] = str_replace(
            'form-send', $form, $data['contents']
        );

        $userRol = 'window.user = ' . $this->session->userdata('rol_id');
        $script = custom('script', '', $userRol);
        $data['scripts'] = $script .  $data['scripts'];

        $this->load->view('Master', $data);
    }

    /**
    * Get diary by date.
    *
    * @param  php://input JSON form information
    * @return JSON        $response diary information
    */
    public function get_diary()
    {
        $response = array(
            'code' => 500,
            'msg' => 'No podemos procesar su solicitud'
        );

        $this->load->Model('Page');
        $this->Page->page_name = 'diary';

        if ($_SERVER['REQUEST_METHOD'] == 'POST')
        {
            $data = json_decode(file_get_contents('php://input'));

            $this->load->Model('Diaries');
            $diary = $this->Diaries->get_location_distribution($data->date);

            $response['code'] = 200;
            $response['message'] = json_encode($diary);
        }

        echo json_encode($response);
    }

    public function buil_pdf() {

    $this->load->library('pdfgenerator');

       $date = $_GET['date'];

      $this->load->Model('Page');
      $this->load->Model('Diaries');
      $html = $this->Diaries->get_location_distribution($date, 'DIARY_TABLE_PDF');
      $html= $html['details'];
      $formatdate = date('d-m-Y', strtotime($date));

         $htmlend = '<!DOCTYPE html>
             <html>
             <head>
             <title>Diary '.$formatdate.'</title>
             </head>
             <body style="margin:0px;">
             <h1 align="center" style="font-family: sans-serif; font-size:12px; margin:0px; font-weight:bold;">
                Daily operation journal
             </h1>
             <p align="center" style="font-family: sans-serif; font-size:10px; margin:0 0 5px 0;">Port of Costa Maya '. $formatdate .'</p>'
             . $html.
            '</body>
             </html>';

          $filename = 'DiaryPruebaPDF';
          $this->pdfgenerator->generate($htmlend, $filename, true, 'A4', 'portrait');
    }
}

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
            '{option}', $locations['display'], $data['contents']
        );

        $data['contents'] = str_replace(
            '{msg}', $locations['message'], $data['contents']
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
            'message' => 'Something wrong!'
        );

        $this->load->Model('Page');
        $this->Page->page_name = 'diary';

        if ($_SERVER['REQUEST_METHOD'] == 'POST')
        {
            $data = json_decode(file_get_contents('php://input'));

            $this->load->Model('Diaries');
            $diary = $this->Diaries->get_location_distribution($data->date);

            if ($diary['code'] == 200)
            {
                $response['code'] = 200;
                $response['message'] = json_encode($diary);
            }
            else
            {
                $response['code'] = $diary['code'];
                $response['message'] = $diary['message'];
            }
        }

        echo json_encode($response);
    }

    public function print()
    {
        $date = $this->uri->segment(3);

        $this->load->library('pdfgenerator');

        $this->load->Model('Page');
        $this->load->Model('Diaries');

        $settings = $this->Page->get_settings('diary');
        // Build html
        $document = doctype('html5');
        $document = $this->build->build_components($settings['PRINT_DIARY']);
        $contents = $this->Diaries->get_location_distribution($date, 'DIARY_TABLE_PDF');

        $title = 'Diary - ' . $date;
        $header_title = 'Port of Costa Maya ' . date('l jS M Y', strtotime($date));

        $document = str_replace('{title}', $title, $document);
        $document = str_replace('{port_of}', $header_title, $document);
        $document = str_replace('{body}', $contents['details'], $document);

        $filename = 'Diary operation journal';
        $this->pdfgenerator->generate($document, $filename, true, 'A4', 'portrait');
    }
}

<?php
namespace App\Controllers;

class Diary extends BaseController
{
    public $diaries;

    public function __construct()
    {
        $this->diaries= new \App\Models\Diaries();
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
        $this->page->menu_active    = 'diary';
        $this->page->submenu_active = $option;

        $data      = $this->page->get_contents();
        $locations = $this->diaries->get_location_distribution();

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

        $form = $this->diaries->get_form();
        $form = str_replace(
            '{display}', $locations['display'], $form
        );

        $data['contents'] = str_replace(
            'form-send', $form, $data['contents']
        );

        return view('Master', $data);
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

        $this->page->page_name = 'diary';

        if ($_SERVER['REQUEST_METHOD'] == 'POST')
        {
            $data = json_decode(file_get_contents('php://input'));

            $diary = $this->diaries->get_location_distribution($data->date);

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

        return $this->response->setJson($response);
    }

    public function print()
    {
        $date = $this->request->uri->getSegment(3);

        $pdf = new \App\Libraries\Pdfgenerator();

        $settings = $this->page->get_settings('diary');

        // Build html
        $document = doctype('html5');
        $document = $this->build->build_components($settings['PRINT_DIARY']);
        $contents = $this->diaries->get_location_distribution($date, 'PRINT');

        $title        = 'Diary - ' . $date;
        $header_title = 'Port of Costa Maya ' . date('l jS M Y', strtotime($date));

        $document = str_replace('{title}', $title, $document);
        $document = str_replace('{port_of}', $header_title, $document);
        $document = str_replace('{body}', $contents['details'], $document);

        $filename = 'Diary operation journal';
        $pdf->generate($document, $filename, true, 'A4', 'portrait');
    }
}

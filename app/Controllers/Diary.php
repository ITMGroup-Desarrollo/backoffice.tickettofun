<?php
namespace App\Controllers;

use App\Libraries\Build;
use \DateTime;

class Diary extends BaseController
{
    public $build;
    public $diaries;

    public function __construct()
    {
        $this->build   = new Build();
        $this->diaries = new \App\Models\Diaries();
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
            '{spec}', $locations['tours'], $data['contents']
        );

        $data['contents'] = str_replace(
            '{id}', 'form-date', $data['contents']
        );

        $ports = $this->session->get('business_unities');

        if (count($ports) > 1) {
            $businessUnitElement = $this->user->get_business_unties_element(
                false,
                $ports[0]->unity_id,
                'calendar'
            );

            $data['contents'] = str_replace(
                '{sub-title}', '', $data['contents']
            );

            $data['contents'] = str_replace(
                '{port}', $businessUnitElement, $data['contents']
            );
        } else {
            $data['contents'] = str_replace(
                '{sub-title}', $ports[0]->unity_name, $data['contents']
            );

            $data['contents'] = str_replace(
                '{port}', '', $data['contents']
            );
        }

        $data['contents'] = str_replace(
            '{id}', 'form-picker', $data['contents']
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

        $form = str_replace(
            '{id}', 'form-actions', $form
        );

        $data['contents'] = str_replace(
            'form-send', $form, $data['contents']
        );

        return view('Master', $data);
    }

    public function lmps()
    {
        if ( ! $this->user->active_session())
            return redirect()->to(base_url('signin'));

        $view   = $this->request->uri->getSegment(1);

        $this->page->page_name      = $view;
        $this->page->menu_active    = 'diary lmps';
        $this->page->submenu_active = '';

        $date = new DateTime();
        $operation_date = $date->format('Y-m-d');

        $data      = $this->page->get_contents();
        $locations = $this->diaries->get_location_distribution($operation_date, NULL, 3);

        $data['contents'] = str_replace(
            '{spec}', $locations['tours'], $data['contents']
        );

        $data['contents'] = str_replace(
            '{id}', 'form-date', $data['contents']
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

        $form = $this->diaries->get_form(3);

        $form = str_replace(
            '{id}', 'form-actions', $form
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

            $channel = 1;
            if (property_exists($data, 'channel')) {
                $channel = 3;
            }

            $diary = $this->diaries->get_location_distribution(
                $data->date,
                NULL,
                $channel,
                $data->business_unit_id
            );

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
        $business_unit_id = $this->request->uri->getSegment(4);

        $channel = 1;
        if ($this->request->uri->getSegment(5) != null) {
            $channel = $this->request->uri->getSegment(5);
        }

        $pdf = new \App\Libraries\Pdfgenerator();

        $contents = $this->diaries->get_location_distribution(
            $date,
            'PRINT',
            $channel,
            $business_unit_id
        );

        $ports = $this->session->get('business_unities');

        $index = array_search($business_unit_id, array_column($ports, 'unity_id'));
        $port = $ports[$index];

        $title        = 'Diary - ' . $date;
        $header_title = sprintf(
            'Port of %s %s',
            $port->unity_name,
            date('l jS M Y', strtotime($date))
        );

        $data = array();
        $data["title"] = $title;
        $data["port_of"] = $header_title;
        $data["contents"] = $contents['details'];

        // Build html
        $document = view('Print', $data);

        $filename = 'Diary-operation-journal';
        $pdf->generate($document, $filename, 'A4', 'portrait');
    }
}

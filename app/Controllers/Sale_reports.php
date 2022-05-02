<?php
namespace App\Controllers;

class Sale_reports extends BaseController
{
    public $sale_report;

    public function __construct()
    {
        $this->sale_report = new \App\Models\Sale_report();
    }

    /**
    *Index page for this controller
    */
    public function index()
    {
        if (!$this->user->active_session())
            return redirect()->to(base_url('signin'));

        $view   = $this->request->uri->getSegment(1);
        $option = $this->request->uri->getSegment(2);

        $this->page->page_name = $view;
        $this->page->menu_active = 'sale-reports';
        $this->page->submenu_active = $option;

        $data = $this->page->get_contents();

        $table = $this->sale_report->get_list();

        $form = $this->sale_report->get_form('filters');
        $form = str_replace('{id}', 'filters', $form);
        $data['contents'] = str_replace('{filters}', $form, $data['contents']);

        $data['contents'] = str_replace(
            '{title}',
            'List of sales',
            $data['contents']
        );

        $data['contents'] = str_replace(
            '{content}',
            $table,
            $data['contents']
        );

        $rep = 'window.user_create_id = ' . $this->session->get('user_id');
        $script = custom('script', '', $rep);
        $data['scripts'] = $script .  $data['scripts'];
       

        return view('Master', $data);
    }   
}

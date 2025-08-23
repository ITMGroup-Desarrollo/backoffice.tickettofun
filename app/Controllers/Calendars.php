<?php
namespace App\Controllers;

use App\Models\Calendar as Calendar;

class Calendars extends BaseController
{
    /**
    *Index page for this controller
    */
    public function index()
    {
        if ( ! $this->user->active_session())
            return redirect()->to(base_url('signin'));

        $view   = $this->request->uri->getSegment(1);
        $option = $this->request->uri->getSegment(2);

        $this->page->page_name   = $view;
        $this->page->menu_active = 'calendar';

        $data = $this->page->get_contents();

        $businessUnitElement = $this->user->get_business_unties_element();

        $data['contents'] = str_replace(
            '{title}', 'Ship calendar', $data['contents']
        );

        $data['contents'] = str_replace(
            '{unities}', $businessUnitElement, $data['contents']
        );

        $calendar = new Calendar();

        $events = $calendar->get_arrives($this->user->get_business_unities_params());
        $data['scripts'] = $events . $data['scripts'];

        return view('Master', $data);
    }
}

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

        $data['contents'] = str_replace(
            '{title}', 'Ship calendar', $data['contents']
        );

        $calendar = new Calendar();

        $events = $calendar->get_arrives();
        $data['scripts'] = $events . $data['scripts'];

        return view('Master', $data);
    }
}

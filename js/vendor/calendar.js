'use strict'
var events = window.eventData

for (var i = 0, l = events.length; i < l; i++) {
  events[i].end = new Date(events[i].end)
  events[i].start = new Date(events[i].start)
}

document.addEventListener('DOMContentLoaded', function () {
  var element = document.getElementById('full-calendar')

  var calendar = new FullCalendar.Calendar(element, {
    plugins: ['interaction', 'dayGrid', 'timeGrid', 'list'],
    height: 'parent',
    header: {
      left: 'prevYear,prev,next,nextYear today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    defaultView: 'dayGridMonth',
    navLinks: true, // can click day/week names to navigate views
    editable: true,
    eventLimit: true,
    events: events
  })

  calendar.render()
})

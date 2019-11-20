'use strict'
var events = window.eventData

for (var i = 0, l = events.length; i < l; i++) {
  events[i].end = new Date(events[i].end)
  events[i].start = new Date(events[i].start)
}

$(document).ready(function () {
  $('#full-calendar').fullCalendar({
    header: {
      left: 'month,agendaWeek,agendaDay',
      center: 'title',
      right: 'today prev,next'
    },
    selectable: false,
    selectHelper: false,
    editable: false,
    events: events,
    eventBackgroundColor: '#278ccf'
  })
})

'use strict'
$(document).ready(function(){

  $('#full-calendar').fullCalendar({
    header: {
        left: 'month,agendaWeek,agendaDay',
        center: 'title',
        right: 'today prev,next'
    },
    selectable: false,
    selectHelper: false,
    editable: false
  })
})

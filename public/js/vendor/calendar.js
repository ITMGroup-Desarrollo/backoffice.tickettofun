'use strict'
var configCalendar = {}
var events = window.eventData

for (var i = 0, l = events.length; i < l; i++) {
  events[i].end = new Date(events[i].end)
  events[i].start = new Date(events[i].start)
}

var md = new MobileDetect(window.navigator.userAgent)

configCalendar = {
  plugins: ['interaction', 'dayGrid', 'timeGrid', 'list'],
  height: '100%',
  contentHeight: 'auto',
  header: {
    left: 'prevYear,prev,next,nextYear, today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,listWeek'
  },
  defaultView: 'dayGridMonth',
  navLinks: true, // can click day/week names to navigate views
  editable: false,
  views: {
    timeGrid: {
      eventLimit: 4,
      minTime: '06:00:00',
      maxTime: '24:00:00'
    }
  },
  events: events,
  allDaySlot: false
}

if (md.mobile() !== null) {
  configCalendar.plugins = ['dayGrid','list']
  configCalendar.header = {
    left: 'title',
    center: '',
    right: 'prev,next,dayGridMonth,listWeek'
  },
  configCalendar.views = {
    listWeek: { buttonText: 'week' }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var element = document.getElementById('full-calendar')

  var calendar = new FullCalendar.Calendar(element, configCalendar)

  calendar.render()
})

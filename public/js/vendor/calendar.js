'use strict'
var calendar
var configCalendar = {}
var events = window.eventData
const element = document.getElementById('full-calendar')

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

const getArrives = (businessUnit) => {
  let url = `${apiHost}arrives/list`
  const filters = {
     status: 1
  }

  if (businessUnit !== '') {
    filters.unities = businessUnit
  }

  let params = utils.filterQueryParams(filters)

  url = `${url}?${params}`

  utils.fetchApi(JSON.stringify({}), url, 'GET', reBuildCalendar)
}

const reBuildCalendar = (response, code) => {
  try {
    MicroModal.close('wait-modal')

    if (Object.prototype.hasOwnProperty.call(codes, code)) {
      if (code === 404) {
        utils.displayModal(alertModal, 'Not found calls with the selected data')
      } else {
        utils.displayModal(alertModal, response.message)
      }
    } else {
      events = []
      const arrives = response.message
      for (let i = 0, l = arrives.length; i < l; i++) {
        let calendarConfig = JSON.parse(arrives[i].calendar_config)

        events.push({
          allDay: false,
          title: `${arrives[i].unity_name}-${arrives[i].reseller_name}\n${arrives[i].ship_name}`,
          end: new Date(`${arrives[i].arrival_date} ${arrives[i].arrival_time}`),
          start: new Date(`${arrives[i].arrival_date} ${arrives[i].arrival_time}`),
          textColor: calendarConfig.textColor,
          borderColor: calendarConfig.borderColor,
          backgroundColor: calendarConfig.backgroundColor,
        })
      }

      configCalendar.events = events

      calendar.destroy()

      calendar = new FullCalendar.Calendar(element, configCalendar)

      calendar.render()
    }
  } catch (e) {
    console.log(e)
    utils.displayModal(alertModal, '')
  }
}

document.addEventListener('DOMContentLoaded', function () {
  calendar = new FullCalendar.Calendar(element, configCalendar)

  calendar.render()

  const businessUnit = document.querySelector('[name="business_unit"]')

  if (businessUnit !== null) {
    businessUnit.addEventListener('change', (e) => {
      e.preventDefault()

      MicroModal.show('wait-modal')
      const businessUnit = (e.target.value !== '') ? parseInt(e.target.value, 10) : ''
      getArrives(businessUnit)

    })
  }
})

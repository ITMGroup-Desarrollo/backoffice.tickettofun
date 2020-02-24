'use strict'
var info
var form
var user = window.user
var configData = window.config
var objData
const fireEvent = new Event('change')
var editor

var config = {
  loadOptions: function (response, extradata) {
    const data = JSON.parse(response)

    if (data.code === 200) {
      utils.buildOptions(extradata, data.message)
    }

    MicroModal.close('wait-modal')
  },
  loadData: function (response) {
    const data = JSON.parse(response)

    let datatable = []
    if (Array.isArray(data.message)) {
      datatable = data.message.map(data => {
        const dataArray = [
          data.channel_name,
          data.reseller_name,
          data.ship_name,
          data.service_name,
          data.schedule_start,
          data.schedule_end,
          data.min_available,
          data.max_available,
          data.available,
          data.shared_schedule,
          data.private_service,
          data.active_status,
          data.allotment_id,
          data.arrive_active_status,
          data.channel_id,
          data.active_reservations
        ]
        return dataArray
      })
    }

    if ($.fn.DataTable.isDataTable(editor)) {
      editor.destroy()
    }

    // Get num cells
    var configTable = document.getElementById('config-base-registers')
    var columnsCount = configTable.rows[0].cells.length

    const columns = [{
      targets: 9,
      data: 'shared_schedule',
      render: function (data, type, row, meta) {

        const checkbox_container = utils.createElement('div', 'checkbox')
        const checkbox_input = utils.createElement('input', '')
        const checkbox_label = utils.createElement('label', '')
        checkbox_input.setAttribute('type', 'checkbox')
        checkbox_input.setAttribute('readonly', true)
        checkbox_input.setAttribute('disabled', true)

        if(parseInt(row[9]) === 1){
          checkbox_input.setAttribute('checked', true)
        }

        checkbox_label.appendChild(checkbox_input)
        checkbox_container.appendChild(checkbox_label)
        return `<div>${checkbox_container.innerHTML}</div>`;
      }
    },{
      targets: 10,
      data: 'private_service',
      render: function (data, type, row, meta) {

        const checkbox_container = utils.createElement('div', 'checkbox')
        const checkbox_input = utils.createElement('input', '')
        const checkbox_label = utils.createElement('label', '')
        checkbox_input.setAttribute('type', 'checkbox')
        checkbox_input.setAttribute('readonly', true)
        checkbox_input.setAttribute('disabled', true)

        if(parseInt(row[10]) === 1){
          checkbox_input.setAttribute('checked', true)
        }

        checkbox_label.appendChild(checkbox_input)
        checkbox_container.appendChild(checkbox_label)
        return `<div>${checkbox_container.innerHTML}</div>`;
      }
    },{
      targets: 11,
      data: 'allotment_id',
      render: function (data, type, row, meta) {
        if (row[11] === 0) {
          return `<span class="label label-danger" data-status="${row[12]}">Inactive</span>`
        } else {
          return `<span class="label label-success" data-status="${row[12]}">Active</span>`
        }
      }
    }
    ]

    if (columnsCount === 13) {
      columns.push({
        targets: 12,
        data: 'allotment_id',
        className: 'text-center',
        render: function (data, type, row, meta) {
          switch (row[14]) {
            case 1:
              if (row[13] === 1) {
                let html = `<a class="btn-link edit" data-toggle="tooltip" data-placement="left" title="Edit allotment" href="configuration/${row[12]}"><i class="fas fa-edit"></i></a>`

                if (row[11] === 1) {
                  html += `<a class="btn-link delete" data-toggle="tooltip" data-placement="left" title="Delete allotment" data-id="${row[12]}"><i class="fas fa-trash"></i></a>`
                }

                return html
              } else {
                return '';
              }
              break;

            case 2:
              let html = `<a class="btn-link edit" data-toggle="tooltip" data-placement="left" title="Edit allotment" href="configuration/${row[12]}"><i class="fas fa-edit"></i></a>`

              if (row[11] === 1 && row[15] === 0) {
                  html += `<a class="btn-link delete" data-toggle="tooltip" data-placement="left" title="Delete allotment" data-id="${row[12]}"><i class="fas fa-trash"></i></a>`
              }
              return html
              break;
          }

        }
      })
    }

    editor = $('#config-base-registers').DataTable({
      retrieve: true,
      data: datatable,
      columnDefs: columns,
      processing: true,
      stateSave: true,
      sPaginationType: 'full_numbers',
      iDisplayLength: 20,
      aLengthMenu: [
        [20, 50, 100, -1], [20, 50, 100, 'All']
      ]
    })

    editor.draw()
    editor.columns.adjust().draw()

    var options = document.querySelectorAll('.delete')
    if (options) {
      for (var i = 0, l = options.length; i < l; i++) {
        options[i].addEventListener('click', function (e) {
          e.preventDefault()

          var element = e.target
          if (!e.target.getAttribute('data-id')) {
            element = e.target.parentElement
          }

          config.confirm(element)
        })
      }
    }

    MicroModal.close('wait-modal')
  },
  loadServiceSchedules: function () {
    var service = document.querySelector('[name="service"]')
    var startDate = document.querySelector('[name="start_date"]')
    var scheduleStart = document.querySelector('[name="schedule_start"]')
    var schedule = null

    if (scheduleStart.type == 'select-one') {
      document.querySelector('[name="schedule_end"]').value = ""

      if (!service.value) {
        service = configData.service
        schedule = configData.schedule_start
      } else {
        service = service.value
      }

      if (service && startDate.value) {
        for (var i = scheduleStart.options.length - 1; i > 0; i--) {
          scheduleStart.remove(i);
        }

        var objData = new Object()
        objData.start_date = startDate.value

        let dataElement = {
          id: schedule,
          key: 'schedule_start',
          value: 'schedule_start',
          element: document.querySelector('[name="schedule_start"]')
        }

        utils.api(JSON.stringify(objData), `${apiHost}allotments/serviceschedules/${service}`, 'POST', config.loadOptions, dataElement)

      }

    }

  },
  loadInputScheduleEnd: function (schedule = null){
    var service = document.querySelector('[name="service"]')
    var scheduleStart = (schedule) ? schedule : configData.schedule_start

    if (!service.value) {
      service = configData.service
    } else {
      service = service.value
    }

    if (scheduleStart && service){
      utils.api(JSON.stringify({"schedule_start": scheduleStart}), `${apiHost}allotments/servicescheduleend/${service}`, 'POST', config.loadScheduleEnd)

    }else{

      document.querySelector('[name="schedule_end"]').value = "";

    }
  },
  loadScheduleEnd: function (response){
    var data = JSON.parse(response);

    document.querySelector('[name="schedule_end"]').value = data.message.message;

    MicroModal.close();

  },
  showInputSchedule: function () {
    var service = document.querySelector('[name="service"]');
    var scheduleStart = document.querySelector('[name="schedule_start"]')
    var formActive = document.querySelector('#add-config')
    var typeSelectDate = null
    var index = 5

    if (service.value) {
      typeSelectDate = service.options[service.selectedIndex].getAttribute('data-opened')
    } else {
      typeSelectDate = configData.opened_schedule
    }

    if (formActive != null) {
      var form = document.getElementById('add-config')
    } else {
      var form = document.getElementById('update-config')
      index = 6
    }

    var spaceSchedule =  document.getElementsByClassName('form-group')[index].children[1]
    scheduleStart.remove()

    if (parseInt(typeSelectDate) === 1) {
      let optionInputSchedule = utils.createElement('select')
      optionInputSchedule.setAttribute('name', 'schedule_start')
      optionInputSchedule.setAttribute('id', 'schedule_start')
      optionInputSchedule.setAttribute('class', 'form-control')
      optionInputSchedule.append(new Option('-- Choose option --'), '')
      optionInputSchedule.setAttribute('data-validator', 'empty^timeFormat')
      optionInputSchedule.setAttribute('data-validator-msg', 'The schedule is required!^Invalid schedule start!')
      spaceSchedule.appendChild(optionInputSchedule)
      config.loadServiceSchedules()

    } else {
      let optionInputSchedule = utils.createElement('input')
      optionInputSchedule.setAttribute('name', 'schedule_start')
      optionInputSchedule.setAttribute('value', '00:00')
      optionInputSchedule.setAttribute('class', 'form-control time-format')
      optionInputSchedule.setAttribute('autocomplete', 'off')
      optionInputSchedule.setAttribute('placeholder', 'HH:mm')
      optionInputSchedule.setAttribute('data-validator', 'empty^timeFormat')
      optionInputSchedule.setAttribute('data-validator-msg', 'The schedule is required!^Invalid schedule start!')
      spaceSchedule.appendChild(optionInputSchedule)

    }
  },
  confirm: function (element, option = null){

    var _message = ''
    var _confirmModal = document.getElementById('confirm-modal-content')
    _message = utils.createElement('p', '', '', '¿Are you sure delete allotment?')

    _confirmModal.innerHTML = ''
    _confirmModal.appendChild(_message)

    const btnConfirmDelete = document.querySelector('.confirm-delete')


    btnConfirmDelete.addEventListener('click', function (e) {
        e.preventDefault()

        if (option === null) {
          var info = { user_id: window.user }
          var id = element.getAttribute('data-id')
          var url = `${apiHost}allotments/del/${id}`

          utils.api(JSON.stringify(info), url, 'DELETE', config.delete, element)
        } else if (option === 'update') {
          var url = `${apiHost}allotments/edit/${objData.allotment_id}`
          utils.api(JSON.stringify(objData), url, 'PUT', config.update)
        }
    })

    MicroModal.show('confirm-modal')

  },
  add: function (response) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)
    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (codes.hasOwnProperty(response.code)) {
      var message = ''

      if (utils.isJson(response.message)) {
        const maxInput = document.querySelector('[name="max_available"]')
        const minInput = document.querySelector('[name="min_available"]')

        let decode = JSON.parse(response.message)
        message = decode.message

        if (maxInput != null) {
          maxInput.value = (decode.available) ? decode.available : 0
        }

        if (minInput != null) {
          minInput.value = (decode.available > minInput.value) ? minInput.value : decode.available
        }

      } else {
        message = response.message
      }

      _message = utils.createElement('p', '', '', message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
    else if (response.code === 201) {
      _message = utils.createElement('p', '', '', 'Success! Schedule added correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')

      form = document.querySelector('#add-config')
      form.reset()
    }
  },
  update: function (response) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)
    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (codes.hasOwnProperty(response.code)) {
      _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    } else if (response.code === 204) {
      _message = utils.createElement('p', '', '', 'Success! Schedule updated correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  },
  delete: function (response, element) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)
    var id = element.getAttribute('data-id')
    element.style.display = 'none'

    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (codes.hasOwnProperty(response.code)) {
      _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
    else if (response.code == 200)
    {
      var _status = document.querySelector(`[data-status="${id}"]`)
      var _parentELement = _status.parentElement
      _status.parentElement.innerHTML = ''

      element.parentElement.lastChild.style.display = 'none'

      var label = utils.createElement('span', 'label label-danger', '', 'inactive');
      _parentELement.appendChild(label)

      _message = utils.createElement('p', '', '', 'Success! Schedule inactivate correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  },
  setTimeScheduleStart: function () {
    document.querySelectorAll('.time-format').flatpickr({
      enableTime: true,
      noCalendar: true,
      defaultHour: false,
      dateFormat: 'H:i',
      time_24hr: true
    })
  },
  removeOptions: function (element){
    for (var i = element.options.length - 1; i > 0; i--) {
      element.remove(i);
    }
  },
  setData: function () {
    document.querySelector('[name="status"]').value = configData.active
    document.querySelector('[name="channel"]').value = configData.channel
    document.querySelector('[name="reseller"]').value = configData.reseller
    document.querySelector('[name="service"]').value = configData.service
    document.querySelector('[name="cruise"]').value = configData.cruise
    document.querySelector('[name="start_date"]').value = configData.start_date
    document.querySelector('[name="end_date"]').value = configData.end_date
    document.querySelector('[name="overlap"]').value = configData.overlap
    document.querySelector('[name="min_available"]').value = configData.min_available
    document.querySelector('[name="max_available"]').value = configData.max_available
    document.querySelector('[name="shared"]').value = configData.shared
    config.showInputSchedule()
    document.querySelector('[name="schedule_start"]').value = configData.schedule_start
    document.querySelector('[name="schedule_end"]').value = configData.schedule_end

    let private_service =  document.querySelector('[name="private"]')
    if (configData.private === 0){
      private_service.removeAttribute('checked')
    }

    document.querySelector('[name="channel"]').setAttribute('disabled', 'disabled')
    document.querySelector('[name="start_date"]').setAttribute('disabled', 'disabled')
    document.querySelector('[name="end_date"]').setAttribute('disabled', 'disabled')
    document.querySelector('[name="reseller"]').setAttribute('disabled', 'disabled')
    document.querySelector('[name="service"]').setAttribute('disabled', 'disabled')
    document.querySelector('[name="cruise"]').setAttribute('disabled', 'disabled')
    document.querySelector('[name="schedule_end"]').setAttribute('disabled', 'disabled')

    switch (configData.channel) {
      case 1:
        break
      case 2:
        document.querySelector('[name="schedule_start"]').setAttribute('disabled', 'disabled')
        let cruise = document.getElementById('cruise')
        cruise.setAttribute('class','hidden')
        document.querySelector('[name="cruise"]').setAttribute('data-validator','')
        break;
    }

  }
}

var cruise = document.querySelector('[name="cruise"]')
if (cruise != null) {
  cruise.options.length = 0
  cruise.append(new Option('-- Choose option --', ''))
}

var equivalence = document.querySelector('[name="service"]')
if (equivalence != null) {
  equivalence.options.length = 0
  equivalence.append(new Option('-- Choose option --', ''))
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function (e) {
    e.preventDefault()

    form = document.querySelector('#add-config')
    if (form != null) {
      form.reset()
    }

    form = document.querySelector('#update-config')
    if (form != null) {
      config.setData()
    }
  })
}

var save = document.querySelector('.save')
if (save != null) {
  save.addEventListener('click', function (e) {
    e.preventDefault()

    var valid = 'true'
    var fields = document.querySelectorAll('[data-validator]')

    valid = utils.dataValidator(fields)

    if (valid) {
      info = {
        channel_id: document.querySelector('[name="channel"]').value,
        reseller_id: document.querySelector('[name="reseller"]').value,
        service_id: document.querySelector('[name="service"]').value,
        start_date: document.querySelector('[name="start_date"]').value,
        end_date: document.querySelector('[name="end_date"]').value,
        schedule_start: document.querySelector('[name="schedule_start"]').value,
        schedule_end: document.querySelector('[name="schedule_end"]').value,
        overlap: document.querySelector('[name="overlap"]').value,
        min_available: document.querySelector('[name="min_available"]').value,
        max_available: document.querySelector('[name="max_available"]').value,
        shared_schedule: document.querySelector('[name="shared"]').checked ? 1 : 0,
        private_service: document.querySelector('[name="private"]').checked ? 1 : 0,
        user_id: user
      }
      form = document.querySelector('#add-config')

      if (form != null) {
        var url = `${apiHost}allotments/add`
        info.user_id = user
        info.type_movement = 'I'

        utils.api(JSON.stringify(info), url, 'POST', config.add)
      }

      form = document.querySelector('#update-config')

      if (form != null) {
        info.active_status = document.querySelector('[name="status"]').value
        info.arrive_id = configData.arrive_id;
        if (parseInt(info.active_status) === 1) {

          var url = `${apiHost}allotments/edit/${configData.id}`
          utils.api(JSON.stringify(info), url, 'PUT', config.update)
        }else{
          info.allotment_id = configData.id;
          objData = info;

          config.confirm(null, 'update');
        }
      }
    }
  })
}

const search = document.querySelector('.search')
if (search !== null) {
  search.addEventListener('click', function (e) {
    e.preventDefault()

    utilAjaxExecute()
  })
}

var channel = document.querySelector('[name="channel"]')
if (channel != null) {
  channel.addEventListener('change', function (e) {

    form = document.querySelector('#add-config')
    if (form != null) {
      if (!e.target.value){
        return true
      }
    }

    var id = (e.target.value) ? e.target.value : configData.reseller
    const resellerId = (typeof(configData) === "object") ? configData.reseller : null

    var dataElement = {
      id: resellerId,
      key: 'reseller_name',
      value: 'reseller_id',
      element: document.querySelector('[name="reseller"]')
    }

    for (var i = reseller.options.length - 1; i > 0; i--) {
      reseller.remove(i)
    }

    utils.api(JSON.stringify({}), `${apiHost}resellers/channel/${id}`, 'GET', config.loadOptions, dataElement)
  })
}

var reseller = document.querySelector('[name="reseller"]')
if (reseller != null) {
  reseller.options.length = 0
  reseller.append(new Option('-- Choose option --', ''))

  reseller.addEventListener('change', function (e) {
    e.preventDefault()
    form = document.querySelector('#add-config')
    if (form != null) {
      if (!e.target.value){
        return true
      }
    }

    var id = (e.target.value) ? e.target.value : configData.reseller

    if (typeof(configData) === "object") {
      channel = configData.channel;
    } else {
      channel = document.querySelector('[name="channel"]');
    }

    if (channel === 1) {
      var shipId = (typeof(configData) === "object") ? configData.cruise : null

      var dataElement2 = {
        id: shipId,
        key: 'ship_name',
        value: 'ship_id',
        element: document.querySelector('[name="cruise"]')
      }

      utils.api(JSON.stringify({}), `${apiHost}ships/reseller/${id}`, 'GET', config.loadOptions, dataElement2)
    }

    let selectService = document.querySelector('[name="service"]');
    config.removeOptions(selectService)

    var serviceId = (typeof(configData) === "object") ? configData.service : null
    var dataElement = {
      id: serviceId,
      key: 'service_name',
      value: 'service_id',
      extra_data: {
        'data-opened': 'opened_schedule'
      },
      element: document.querySelector('[name="service"]')
    }

    utils.api(JSON.stringify({}), `${apiHost}equivalences/reseller/${id}`, 'GET', config.loadOptions, dataElement)

  })
}

var service = document.querySelector('[name="service"]')

if (service != null) {
  service.addEventListener('change', function(e){
    config.showInputSchedule()
    config.setTimeScheduleStart()

    let scheduleStart = document.querySelector('[name="schedule_start"]')

    scheduleStart.addEventListener('change', function(e) {
      e.preventDefault()
      config.loadInputScheduleEnd(scheduleStart.value)
    })
  })
}

var startDate = document.querySelector('[name="start_date"]')

if (startDate != null) {
  startDate.addEventListener('change', function(e){
    config.loadServiceSchedules()
    var endDate = document.querySelector('[name="end_date"]')
    var service = document.querySelector('[name="service"]')
    var typeSelectDate = service.options[service.selectedIndex].getAttribute('data-opened')

    endDate.value = startDate.value
  })
}


form = document.querySelector('#add-config')
if (form != null) {
  let statusCombo = form.querySelector('[name="status"]')
  statusCombo.parentElement.parentElement.remove()

  let cruise = document.getElementById('cruise')
  cruise.setAttribute('class','hidden')
  document.querySelector('[name="cruise"]').setAttribute('data-validator','')

  document.querySelector('[name="end_date"]').setAttribute('disabled', 'disabled')
  document.querySelector('[name="schedule_end"]').setAttribute('disabled', 'disabled')


  let channelSelect = form.querySelector('[name="channel"]')
  channelSelect.remove(1)
  channelSelect.remove(2)
}

form = document.querySelector('#update-config')
if (form != null) {
  config.setData()
}

var scheduleStart = document.querySelector('[name="schedule_start"]')

if (scheduleStart != null) {
  scheduleStart.addEventListener('change', function(e) {
    e.preventDefault()
    config.loadInputScheduleEnd(scheduleStart.value)
  });
}

var configTable = document.querySelector('#config-base-registers');

const utilAjaxExecute = function () {
  if (configTable !== undefined && configTable !== null && configTable !== undefined && configTable !== undefined) {
    utils.api(JSON.stringify({
      start_date: document.querySelector('.date-range').value
    }), `${apiHost}allotments`, 'POST', config.loadData)
  }

  if (configData !== undefined) {
    if (channel !== null && channel.value !== '') {
      channel.dispatchEvent(fireEvent)
    }
  }

  if (configData) {
    reseller.dispatchEvent(fireEvent)

    $( document ).ready(function () {
      setTimeout(function () {
        reseller.value = configData.reseller
        equivalence.value = configData.service
      }, 2500)

      setTimeout(function () {
        equivalence.value = configData.service
      }, 3500)
    })
  }
}

utilAjaxExecute()

config.setTimeScheduleStart();

document.querySelectorAll('.date-format').flatpickr({
  dateFormat: 'Y-m-d',
  minDate: 'today'
})

document.querySelectorAll('.date-range').flatpickr({
  altFormat: 'F j, Y',
  dateFormat: 'Y-m-d',
  defaultDate: 'today',
  altInput: true
})

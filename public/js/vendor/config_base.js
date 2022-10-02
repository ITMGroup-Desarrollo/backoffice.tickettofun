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
      utils.buildOptions(extradata, data.message, 1)
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
          data.privateService,
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
        const checkboxContainer = utils.createElement('div', 'checkbox')
        const checkboxInput = utils.createElement('input', '')
        const checkboxLabel = utils.createElement('label', '')
        checkboxInput.setAttribute('type', 'checkbox')
        checkboxInput.setAttribute('readonly', true)
        checkboxInput.setAttribute('disabled', true)

        if (parseInt(row[9]) === 1) {
          checkboxInput.setAttribute('checked', true)
        }

        checkboxLabel.appendChild(checkboxInput)
        checkboxContainer.appendChild(checkboxLabel)
        return `<div>${checkboxContainer.innerHTML}</div>`
      }
    }, {
      targets: 10,
      data: 'privateService',
      render: function (data, type, row, meta) {
        const checkboxContainer = utils.createElement('div', 'checkbox')
        const checkboxInput = utils.createElement('input', '')
        const checkboxLabel = utils.createElement('label', '')
        checkboxInput.setAttribute('type', 'checkbox')
        checkboxInput.setAttribute('readonly', true)
        checkboxInput.setAttribute('disabled', true)

        if (parseInt(row[10]) === 1) {
          checkboxInput.setAttribute('checked', true)
        }

        checkboxLabel.appendChild(checkboxInput)
        checkboxContainer.appendChild(checkboxLabel)
        return `<div>${checkboxContainer.innerHTML}</div>`
      }
    }, {
      targets: 11,
      data: 'allotment_id',
      render: function (data, type, row, meta) {
        if (row[11] === 0) {
          return `<span class="badge badge-danger" data-status="${row[12]}">Inactive</span>`
        } else {
          return `<span class="badge badge-success" data-status="${row[12]}">Active</span>`
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
          var html = ''
          switch (row[14]) {
            case 1:
              if (row[13] === 1) {
                html = `<a class="btn-link edit mr-2" data-toggle="tooltip" data-placement="left" title="Edit allotment" href="configuration/${row[12]}"><i class="fas fa-edit"></i></a>`

                if (row[11] === 1) {
                  html += `<a class="btn-link delete" data-toggle="tooltip" data-placement="left" title="Delete allotment" data-id="${row[12]}" href="#"><i class="fas fa-trash"></i></a>`
                }
              }
              break

            case 2:
              html = `<a class="btn-link edit mr-2" data-toggle="tooltip" data-placement="left" title="Edit allotment" href="configuration/${row[12]}"><i class="fas fa-edit"></i></a>`

              if (row[11] === 1 && row[15] === 0) {
                html += `<a class="btn-link delete" data-toggle="tooltip" data-placement="left" title="Delete allotment" data-id="${row[12]}" href="#"><i class="fas fa-trash"></i></a>`
              }
              break
            default:
              html = ''
              break
          }

          return html
        }
      })
    }

    editor = $('#config-base-registers').DataTable({
      fixedHeader: true,
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
  loadServiceSchedules: function (reset = null) {
    var service = document.querySelector('[name="service"]')
    var startDate = document.querySelector('[name="start_date"]')
    var scheduleStart = document.querySelector('[name="schedule_start"]')
    var schedule = null

    if (scheduleStart.type === 'select-one') {
      document.querySelector('[name="schedule_end"]').value = ''
      if (reset) {
        service = configData.service
        schedule = configData.schedule_start
      } else {
        service = service.value
      }

      if (service && startDate.value) {
        for (var i = scheduleStart.options.length - 1; i > 0; i--) {
          scheduleStart.remove(i)
        }

        var objData = new Object()
        objData.start_date = startDate.value

        const dataElement = {
          id: schedule,
          key: 'schedule_start',
          value: 'schedule_start',
          element: document.querySelector('[name="schedule_start"]')
        }

        utils.api(JSON.stringify(objData), `${apiHost}allotments/serviceschedules/${service}`, 'POST', config.loadOptions, dataElement)
      }
    }
  },
  loadInputScheduleEnd: function (schedule = null) {
    var service = document.querySelector('[name="service"]')
    var scheduleStart = schedule
    service = service.value

    if (!schedule) {
      scheduleStart = configData.schedule_start
      service = configData.service
    }

    if (scheduleStart && service) {
      utils.api(JSON.stringify({ schedule_start: scheduleStart }), `${apiHost}allotments/servicescheduleend/${service}`, 'POST', config.loadScheduleEnd)
    } else {
      document.querySelector('[name="schedule_end"]').value = ''
    }
  },
  loadScheduleEnd: function (response) {
    var data = JSON.parse(response)
    document.querySelector('[name="schedule_end"]').value = data.message.message

    MicroModal.close()
  },
  confirm: function (element, option = null) {
    var _message = ''
    var _confirmModal = document.getElementById('confirm-modal-content')
    _message = utils.createElement('p', '', '', '¿Are you sure delete allotment?')

    _confirmModal.innerHTML = ''
    _confirmModal.appendChild(_message)

    const btnConfirmDelete = document.querySelector('.confirm-delete')

    btnConfirmDelete.addEventListener('click', function (e) {
      e.preventDefault()

      var url = ''
      if (option === null) {
        var info = { user_id: window.user }
        var id = element.getAttribute('data-id')
        url = `${apiHost}allotments/del/${id}`

        utils.api(JSON.stringify(info), url, 'DELETE', config.delete, element)
      } else if (option === 'update') {
        url = `${apiHost}allotments/edit/${objData.allotment_id}`
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

    if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
      var message = ''

      if (utils.isJson(response.message)) {
        const maxInput = document.querySelector('[name="max_available"]')
        const minInput = document.querySelector('[name="min_available"]')

        const decode = JSON.parse(response.message)
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
    } else if (response.code === 201) {
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

    if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
      var message = ''

      if (utils.isJson(response.message)) {
        const maxInput = document.querySelector('[name="max_available"]')
        const minInput = document.querySelector('[name="min_available"]')

        const decode = JSON.parse(response.message)
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

    if (id == null) {
      id = element.parentElement.getAttribute('data-id')
    }

    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
      _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    } else if (response.code === 200) {
      var _status = document.querySelector(`[data-status="${id}"]`)
      var _parentELement = _status.parentElement
      _status.parentElement.innerHTML = ''

      element.remove()

      var label = utils.createElement('span', 'badge badge-danger', '', 'inactive')
      _parentELement.appendChild(label)

      _message = utils.createElement('p', '', '', 'Success! Schedule inactivate correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  },
  removeOptions: function (element) {
    for (var i = element.options.length - 1; i > 0; i--) {
      element.remove(i)
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
    document.querySelector('[name="schedule_start"]').value = configData.schedule_start
    document.querySelector('[name="schedule_end"]').value = configData.schedule_end

    const privateService = document.querySelector('[name="private"]')
    if (configData.private === 0) {
      privateService.removeAttribute('checked')
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
        var cruise = document.getElementById('cruise')
        cruise.setAttribute('class', 'hidden')
        document.querySelector('[name="cruise"]').setAttribute('data-validator', '')
        break
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
        privateService: document.querySelector('[name="private"]').checked ? 1 : 0,
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
        info.arrive_id = configData.arrive_id
        info.stand_by = configData.stand_by

        if (parseInt(info.active_status) === 1) {
          url = `${apiHost}allotments/edit/${configData.id}`
          utils.api(JSON.stringify(info), url, 'PUT', config.update)
        } else {
          info.allotment_id = configData.id
          objData = info

          config.confirm(null, 'update')
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
      if (!e.target.value) {
        return true
      }
    }

    var id = (e.target.value) ? e.target.value : configData.reseller
    const resellerId = (typeof configData === 'object') ? configData.reseller : null

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
      if (!e.target.value) {
        return true
      }
    }

    var id = (e.target.value) ? e.target.value : configData.reseller

    if (typeof configData === 'object') {
      channel = configData.channel
    } else {
      channel = document.querySelector('[name="channel"]')
    }

    if (channel === 1) {
      var shipId = (typeof configData === 'object') ? configData.cruise : null

      var dataElement2 = {
        id: shipId,
        key: 'ship_name',
        value: 'ship_id',
        element: document.querySelector('[name="cruise"]')
      }

      utils.api(JSON.stringify({}), `${apiHost}ships/reseller/${id}`, 'GET', config.loadOptions, dataElement2)
    }

    const selectService = document.querySelector('[name="service"]')
    config.removeOptions(selectService)

    var serviceId = (typeof configData === 'object') ? configData.service : null
    var dataElement = {
      id: serviceId,
      key: 'service_name',
      value: 'service_id',
      element: document.querySelector('[name="service"]')
    }

    utils.api(JSON.stringify({}), `${apiHost}equivalences/reseller/${id}`, 'GET', config.loadOptions, dataElement)
  })
}

var startDate = document.querySelector('[name="start_date"]')

if (startDate != null) {
  startDate.addEventListener('change', function (e) {
    var endDate = document.querySelector('[name="end_date"]')

    endDate.value = this.value
  })
}

var scheduleStart = document.querySelector('[name="schedule_start"]')

if (scheduleStart != null) {
  scheduleStart.addEventListener('change', function (e) {
    e.preventDefault()
    config.loadInputScheduleEnd(scheduleStart.value)
  })
}

form = document.querySelector('#add-config')
if (form != null) {
  const statusCombo = form.querySelector('[name="status"]')
  statusCombo.parentElement.parentElement.remove()
/*
  const cruise = document.getElementById('cruise')
  cruise.setAttribute('class', 'hidden')
  document.querySelector('[name="cruise"]').setAttribute('data-validator', '')*/
  document.querySelector('[name="schedule_start"]').value = '00:00'

  document.querySelector('[name="end_date"]').setAttribute('disabled', 'disabled')
  document.querySelector('[name="schedule_end"]').setAttribute('disabled', 'disabled')

  const channelSelect = form.querySelector('[name="channel"]')
  channelSelect.remove(1)
  channelSelect.remove(2)
}

form = document.querySelector('#update-config')
if (form != null) {
  config.setData()
}

var configTable = document.querySelector('#config-base-registers')

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

    $(document).ready(function () {
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

document.querySelectorAll('.time-format').flatpickr({
  enableTime: true,
  noCalendar: true,
  defaultHour: false,
  dateFormat: 'H:i',
  time_24hr: true
})

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

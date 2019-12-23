'use strict'
var info
var form
var editor
var user = window.user
var base = window.baseUrl
var arrivesData = window.arrives

var btnLoad = document.querySelector('.load-allotments')
if (btnLoad != null) {
  btnLoad.innerHTML = 'Load'
  var changeBtnModal = document.querySelector('.confirm-delete')
  changeBtnModal.className = 'btn btn-outline-warning confirm-save-end'
}

const validatemin = function (min, max) {
  var valid = true
  if (min > max) {
    valid = false
  }
  return valid
}

const alerterror = function (register, type) {
  var table = document.getElementById('allotments-registers')
  var gralcapmin = table.getElementsByClassName('capmin')
  var gralcapmax = table.getElementsByClassName('capmax')
  var _focusError = ''
  var _message = ''
  var text = ''

  if (type === 'min') {
    _focusError = gralcapmin[(register - 1)]
    text = `The minimun capacity is required on register number ${register}`
  }

  if (type === 'max') {
    _focusError = gralcapmax[(register - 1)]
    text = `The maximum capacity is required on register number ${register}`
  }

  if (type === 'bigmin') {
    _focusError = gralcapmin[(register - 1)]
    text = `Invalid minimum capacity on register number ${register}`
  }

  _focusError.setAttribute('style', 'box-shadow: 2px 2px 10px 0 #ff1744;')
  $(_focusError).keypress(function () {
    _focusError.removeAttribute('style')
  })

  var _alertModal = document.getElementById('alert-modal-content')
  _message = utils.createElement('p', '', '', text)
  _alertModal.innerHTML = ''
  _alertModal.appendChild(_message)

  MicroModal.show('alert-modal')
}

const confirm = function () {
  var _message = ''
  var _confirmModal = document.getElementById('confirm-modal-content')
  _message = utils.createElement('p', '', '', '¿Are you sure save this configuration?')

  _confirmModal.innerHTML = ''
  _confirmModal.appendChild(_message)

  const btnConfirmSave = document.querySelector('.confirm-save-end')

  btnConfirmSave.addEventListener('click', function (e) {
    e.preventDefault()
    arrives.buildJson('saveEnd')
  })

  MicroModal.show('confirm-modal')
}

var _contentBtns = document.getElementById('allotmentsbtn')
if (_contentBtns != null) {
  var _contenInter = _contentBtns.getElementsByClassName('col-sm-offset-2')
  var _btnSaveDefinitive = utils.createElement('Button', 'btn btn-success btn-save-definitive', '', 'Save')
  _btnSaveDefinitive.addEventListener('click', function (e) {
    e.preventDefault()
    confirm()
  })
  _contenInter[0].appendChild(_btnSaveDefinitive)
}

var arrives = {
  add: function (response) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)
    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (codes.hasOwnProperty(response.code)) {
      _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    } else if (response.code === 201) {
      _message = utils.createElement('p', '', '', 'Success! Cruise call added correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')

      form = document.querySelector('#add-arrives')
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
    }
    else if (response.code == 204) {
      _message = utils.createElement('p', '', '', 'Success! Cruise call updated correctly')

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
    else if (response.code === 200) {
      var _status = document.querySelector(`[data-status="${id}"]`)

      _status.className = 'label label-danger'
      _status.innerHTML = 'inactive'

      _message = utils.createElement('p', '', '', 'Success! Cruise call date inactivate correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  },
  confirmArriveAllotment: function (response, element) {
    response = JSON.parse(response)

    var id = element.getAttribute('data-id');
    var url = `http://localhost:8181/api/v1/arrives/del/${id}`


    if (response.code === 200) {
      MicroModal.close('wait-modal')

      var btnCanccel = document.querySelector('.confirm-delete')
      btnCanccel.setAttribute('data-id', id)
      btnCanccel.removeAttribute('style', 'display')

      var _message = ''
      var _alertModal = document.getElementById('confirm-modal-content')

      _message = utils.createElement('p', '', '', 'The ship have already configurations in use,  do you want to remove?')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('confirm-modal')

    } else {
      utils.api(JSON.stringify({}), url, 'DELETE', arrives.delete, element)
    }
  },
  loadData: function (response) {
    const data = JSON.parse(response)
    let dataTable = []

    if (Array.isArray(data.message)) {
      dataTable = data.message.map(data => {
        const dataArray = [
          data.reseller_name,
          data.ship_name,
          data.arrival_date,
          data.arrival_time,
          data.departure_time,
          data.markup_start,
          data.markup_end,
          data.active_status,
          data.arrive_id
        ]

        return dataArray
      })
    }

    if ($.fn.DataTable.isDataTable(editor)) {
      editor.destroy()
    }

    editor = $('#arrives-registers')
      .DataTable({
        retrieve: true,
        data: dataTable,
        columnDefs: [{
          targets: 7,
          className: 'center',
          data: 'arrive_id',
          render: function ( data, type, row, meta ) {
            if (row[7] === 0) {
              return `<span class="label label-danger" data-status="${row[8]}">Inactive</span>`
            } else {
              return `<span class="label label-success" data-status="${row[8]}">Active</span>`
            }
          }
        },
        {
          targets: 8,
          data: 'allotment_id',
          className: 'center',
          render: function ( data, type, row, meta ) {
            const strAction = `<a class="schedule" href="${base}allotments/itinerary/${row[8]}"><i class="fas fa-calendar-alt"></i></a>`

            if(row[7] === 0) {
              return `${strAction} <a class="edit" href="${row[8]}"><i class="fas fa-edit"></i></a>`
            } else {
              return `${strAction} <a class="edit" href="${row[8]}"><i class="fas fa-edit"></i></a>
                                  <a class="delete" data-id="${row[8]}"><i class="fas fa-trash"></i></a>`
            }
          }
        }],
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
    if(options) {
      for (var i = 0, l = options.length; i < l; i++) {
        options[i].addEventListener('click', function (e) {
          e.preventDefault()

          var element = e.target
          if (!e.target.getAttribute('data-id')) {
            element = e.target.parentElement
          }

          var id = element.getAttribute('data-id')
          var url = `${apiHost}arrives/arriveintoallotment/${id}`

          utils.api(JSON.stringify({}), url, 'GET', arrives.confirmArriveAllotment, element)
        })
      }
    }

    MicroModal.close('wait-modal')
  },
  buildOptions: function (response) {
    const data = JSON.parse(response)

    if (Array.isArray(data.message)) {
      for (i in data.message) {
        ship.append(new Option(data.message[i].ship_name, data.message[i].ship_id, 'selected'))
      }
    }
    MicroModal.close('wait-modal')
  },
  setData: function () {
    document.querySelector('[name="ships"]').value = arrivesData.ships
    document.querySelector('[name="arrival_date"]').value = arrivesData.arrival_date
    document.querySelector('[name="arrival_time"]').value = arrivesData.arrival_time
    document.querySelector('[name="departure_time"]').value = arrivesData.departure_time
    document.querySelector('[name="markup_start"]').value = arrivesData.markup_start
    document.querySelector('[name="markup_end"]').value = arrivesData.markup_end
    document.querySelector('[name="status"]').value = arrivesData.active
  },
  buildRegistersAllotments: function (response, type) {
    var containerErrors = document.getElementById('container-error-arrives')
    containerErrors.innerHTML = ''
    const data = JSON.parse(response)
    let dataTable = []

    if (Array.isArray(data.message)) {
      dataTable = data.message.map(data => {
        const dataArray = [
          data.service_name,
          data.schedule_start_base,
          data.schedule_end_base,
          data.min_available_base,
          data.max_available_base,
          data.allotment_id,
          data.service_id,
          data.active_status_base,
          data.message,
          data.schedule_start,
          data.capacity_max,
          data.capacity_min,
          data.active_status
        ]

        return dataArray
      })
    }
    if (utils.isJson(data.message)) {
      var datajs = JSON.parse(data.message)
      var dataj = datajs.list

      dataTable = dataj.map(data => {
        const dataArray = [
          data.service_name,
          data.schedule_start_base,
          data.schedule_end_base,
          data.min_available_base,
          data.max_available_base,
          data.allotment_id,
          data.service_id,
          data.active_status_base,
          data.message,
          data.schedule_start,
          data.capacity_max,
          data.capacity_min,
          data.active_status
        ]

        return dataArray
      })
    }

    if (type === 'saveEnd') {
      if (data.code === 200) {
        var _alertModal = document.getElementById('alert-modal-content')
        var _message = ''
        _message = utils.createElement('p', '', '', 'Success! Configuration added correctly')
        _alertModal.innerHTML = ''
        _alertModal.appendChild(_message)
        MicroModal.show('alert-modal')
      } else {
        arrives.paintDivError(datajs.error)
      }
    }

    if ($.fn.DataTable.isDataTable(editor)) {
      editor.destroy()
    }

    editor = $('#allotments-registers')
      .DataTable({
        retrieve: true,
        data: dataTable,
        columnDefs: [
          {
            targets: 1,
            className: '',
            data: 'reservation_id',
            render: function ( data, type, row, meta) {
              var _span1 = utils.createElement('span', 'schedule-start-base', '', row[1])
              var _span2 = utils.createElement('span', 'schedule-end-base', '', row[2])
              return _span1.outerHTML + '-' + _span2.outerHTML
            }
          }, {
            targets: 2,
            className: '',
            data: 'reservation_id',
            render: function ( data, type, row, meta) {
              var _span1 = utils.createElement('span', 'min-base', '', row[3])
              var _span2 = utils.createElement('span', 'max-base', '', row[4])
              return _span1.outerHTML + '-' + _span2.outerHTML
            }
          }, {
            targets: 3,
            className: '',
            data: 'reservation_id',
            render: function ( data, type, row, meta) {
              var _tag = ''
              _tag =  utils.createElement('input', 'form-control hrStart', 'hrStart' + row[5], '')
              _tag.setAttribute('value', row[9])
              var statusArrive = parseInt(document.querySelector('[name="status"]').value)
              if ( parseInt(row[7]) === 0 || statusArrive === 0) {
                _tag.setAttribute('disabled', 'disabled')
              }
              return _tag.outerHTML
            }
          }, {
            targets: 4,
            className: '',
            data: 'reservation_id',
            render: function ( data, type, row, meta ) {
              var _tag = ''
              _tag =  utils.createElement('input', 'form-control capmin', '', '')
              _tag.setAttribute('type', 'number')
              _tag.setAttribute('value', row[11])
              var statusArrive = parseInt(document.querySelector('[name="status"]').value)
              if (parseInt(row[7]) === 0 || statusArrive === 0) {
                _tag.setAttribute('disabled', 'disabled')
              }
              return _tag.outerHTML
            }
          }, {
            targets: 5,
            className: '',
            data: 'reservation_id',
            render: function (data, type, row, meta) {
              var _tag = ''
              _tag=  utils.createElement('input', 'form-control capmax', '', '')
              _tag.setAttribute('value', row[10])
              _tag.setAttribute('data-allotment', row[5])
              _tag.setAttribute('data-service', row[6])
              _tag.setAttribute('data-status-base', row[7])
              _tag.setAttribute('data-status', row[12])
              _tag.setAttribute('type', 'number')
              _tag.setAttribute('data-service-name', row[0])
              var statusArrive = parseInt(document.querySelector('[name="status"]').value)
              if (parseInt(row[7]) === 0 || statusArrive === 0) {
                _tag.setAttribute('disabled', 'disabled')
              }
              return _tag.outerHTML
            }
          }, {
            targets: 6,
            className: '',
            data: 'reservation_id',
            render: function ( data, type, row, meta ) {
              var _spanStatus = ''
              if (row[12] === 1) {
                _spanStatus = utils.createElement('span', 'label label-success', '', 'Active')
              } else if (row[12] === 0) {
                _spanStatus = utils.createElement('span', 'label label-danger', '', 'Inactive')
              }
              return _spanStatus.outerHTML
            }
          }, {
            targets: 7,
            className: '',
            data: 'reservation_id',
            render: function ( data, type, row, meta) {
              var _spanError = utils.createElement('span', 'msg-error', '', row[8])
              return _spanError.outerHTML
            }
          }

        ],

        processing: true,
        stateSave: true,
        sPaginationType: 'full_numbers',
        iDisplayLength: 20,
        aLengthMenu: [
          [20, 50, 100, -1], [20, 50, 100, 'All']
        ]
      });
    editor.draw()
    editor.columns.adjust().draw()

    document.getElementsByClassName('hrStart').flatpickr({
      enableTime: true,
      noCalendar: true,
      dateFormat: 'H:i',
      time_24hr: true
    })

    var containerlength = document.getElementById('allotments-registers_length')
    var containerfilter = document.getElementById('allotments-registers_filter')
    var containerinfo = document.getElementById('allotments-registers_info')
    var containerpaginate = document.getElementById('allotments-registers_paginate')

    containerlength.style.display = 'none'
    containerfilter.style.display = 'none'
    containerinfo.style.display = 'none'
    containerpaginate.style.display = 'none'
    MicroModal.close('wait-modal')
  },
  buildJson: function (type) {
    var valid = 'true'
    var fields = document.querySelectorAll('[data-validator]')

    valid = utils.dataValidator(fields)

    if (valid) {
      var frm = new Object()
      frm.arrive_id = arrivesData.id
      frm.ship_id = parseInt(document.querySelector('[name="ships"]').value)
      frm.arrival_date = document.querySelector('[name="arrival_date"]').value
      frm.arrival_time = document.querySelector('[name="arrival_time"]').value
      frm.departure_time = document.querySelector('[name="departure_time"]').value
      frm.markup_start = document.querySelector('[name="markup_start"]').value
      frm.markup_end = document.querySelector('[name="markup_end"]').value
      frm.active_status = parseInt(document.querySelector('[name="status"]').value)

      var frmOrg = new Object()
      frmOrg.user_id = user
      frmOrg.active_status = arrivesData.active
      frmOrg.arrival_date = arrivesData.arrival_date

      var arr = []

      var table = document.getElementById('allotments-registers')
      var cheduleStartBase = table.getElementsByClassName('schedule-start-base')
      var cheduleEndBase = table.getElementsByClassName('schedule-end-base')
      var capMinBase = table.getElementsByClassName('min-base')
      var capMaxBase = table.getElementsByClassName('max-base')

      var gralhrStart = table.getElementsByClassName('hrStart')
      var gralcapmin = table.getElementsByClassName('capmin')
      var gralcapmax = table.getElementsByClassName('capmax')
      let flag = true

      for (let i = 0; i < gralhrStart.length; i++) {
        var obj = new Object()
        obj.allotment_id = parseInt(gralcapmax[i].getAttribute('data-allotment'))
        obj.service_id = parseInt(gralcapmax[i].getAttribute('data-service'))
        obj.service_name = gralcapmax[i].getAttribute('data-service-name')

        obj.schedule_start_base = cheduleStartBase[i].innerText
        obj.schedule_end_base = cheduleEndBase[i].innerText
        obj.min_available_base = parseInt(capMinBase[i].innerText)
        obj.max_available_base = parseInt(capMaxBase[i].innerText)

        if (gralhrStart[i].value !== '') {
          obj.schedule_start = gralhrStart[i].value
        } else {
          obj.schedule_start = cheduleStartBase[i].innerText
        }

        if (gralcapmin[i].value !== '') {
          var min = parseInt(gralcapmin[i].value)
        } else {
          alerterror((i + 1), 'min')
          flag = false
          break
        }

        if (gralcapmax[i].value !== '') {
          var max = parseInt(gralcapmax[i].value)
        } else {
          alerterror((i + 1), 'max')
          flag = false
          break
        }

        var minor = validatemin(min, max)
        if (minor) {
          obj.capacity_min = min
        } else {
          alerterror((i + 1), 'bigmin')
          flag = false
          break
        }

        obj.capacity_max = max
        obj.active_status_base = parseInt(gralcapmax[i].getAttribute('data-status-base'))
        obj.active_status = parseInt(gralcapmax[i].getAttribute('data-status'))
        obj.message = ''

        arr.push(obj)
      }

      var general = new Object()
      general.frm = frm
      general.frmOrg = frmOrg
      general.list = arr

      if (flag && type === 'load') {
        utils.api(JSON.stringify(general), `${apiHost}arrives/simulator/`, 'POST', arrives.buildRegistersAllotments, type)
      }

      if (flag && type === 'saveEnd') {
        utils.api(JSON.stringify(general), `${apiHost}arrives/edit/${arrivesData.id}`, 'PUT', arrives.buildRegistersAllotments, type)
      }
    }
  },
  paintDivError: function (error) {
    var containerErrors = document.getElementById('container-error-arrives')
    for (var i = 0; i < error.length; i++) {
      var content = utils.createElement('p', '', '', error[i])
      containerErrors.appendChild(content)
    }
    containerErrors.classList.remove('hidden')
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function (e) {
    e.preventDefault()
    form = document.querySelector('#add-arrives')
    form.reset()
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
        ship_id: document.querySelector('[name="ships"]').value,
        arrival_date: document.querySelector('[name="arrival_date"]').value,
        arrival_time: document.querySelector('[name="arrival_time"]').value,
        departure_time: document.querySelector('[name="departure_time"]').value,
        markup_start: document.querySelector('[name="markup_start"]').value,
        markup_end: document.querySelector('[name="markup_end"]').value
      }

      form = document.querySelector('#add-arrives')

      if (form != null) {
        var url = `${apiHost}arrives/add`
        info.user_id = user
        utils.api(JSON.stringify(info), url, 'POST', arrives.add)
      }

      form = document.querySelector('#update-arrives')

      if (form != null) {
        info.active_status = document.querySelector('[name="status"]').value

        var url = `${apiHost}arrives/edit/${arrivesData.id}`
        utils.api(JSON.stringify(info), url, 'PUT', arrives.update)
      }
    }
  })
}
var saveallotments = document.querySelector('.load-allotments')
if (saveallotments != null) {
  saveallotments.addEventListener('click', function (e) {
    e.preventDefault()
    arrives.buildJson('load')
  })
}

var confirmDelete = document.querySelector('.confirm-delete')
if (confirmDelete != null) {
  confirmDelete.addEventListener('click', function (e) {
    var element = e.target

    if (!e.target.getAttribute('data-id')) {
      element = e.target.parentElement
    }

    var id = element.getAttribute('data-id')
    var url = `${apiHost}arrives/del/${id}`

    utils.api(JSON.stringify({}), url, 'DELETE', arrives.delete, element)
  })
}

form = document.querySelector('#add-arrives')
if (form != null) {
  var statusCombo = form.querySelector('[name="status"]')
  statusCombo.parentElement.parentElement.remove()
}

form = document.querySelector('#update-arrives')
if (form != null) {
  var btnsdefault = document.querySelector('.form-actions')
  if (btnsdefault != null) {
    btnsdefault.className = 'form-group form-actions hidden'
  }
  arrives.setData()
}

var configTable = document.querySelector('#arrives-registers')
if (configTable !== null) {
  var vendor = document.querySelector('[name="reseller"]')

  vendor.addEventListener('change', function (e) {
    var id = $(this).val()

    for (var i = ship.options.length - 1; i > 0; i--) {
      ship.remove(i)
    }

    utils.api(JSON.stringify({}), `${apiHost}arrives/shipsarrive/${id}`, 'GET', arrives.buildOptions)
  })

  var search = document.querySelector('.search')

  search.addEventListener('click', function (e) {
    e.preventDefault()
    utilAjaxExecute()
  })

  const utilAjaxExecute = function () {
    if (configTable !== undefined && configTable !== null && configTable !== undefined && configTable !== undefined) {
      var url = `${apiHost}arrives`
      let reseller = document.querySelector('[name="reseller"]').value
      let ship = document.querySelector('[name="ship"]').value
      var dates = document.querySelector('[name="dates"]').value
      var info = new Object()

      info.start_date = null
      info.end_date = null

      if (dates.trim() !== '') {
        var arrayDates = dates.split(' to ')

        if (arrayDates.length === 2) {
          info.start_date = arrayDates[0]
          info.end_date = arrayDates[1]
        } else {
          info.start_date = arrayDates[0]
          info.end_date = arrayDates[0]
        }
      }

      if (reseller !== '' && ship === '') {
        url = url + `/reseller/${reseller}`
      } else if (reseller !== '' && ship !== '') {
        url = url + `/ship/${ship}`
      }

      utils.api(JSON.stringify(info), url, 'POST', arrives.loadData)
    }
  }

  $(function () {
    utilAjaxExecute()
  })
}

$(function () {
  document.getElementsByClassName('date-format').flatpickr({
    dateFormat: 'Y-m-d'
  })

  $('.date-range').flatpickr({
    dateFormat: 'Y-m-d',
    mode: 'range'
  })

  document.getElementsByClassName('time-format').flatpickr({
    enableTime: true,
    noCalendar: true,
    dateFormat: 'H:i',
    time_24hr: true
  })

  document.getElementsByClassName('markup').flatpickr({
    enableTime: true,
    noCalendar: true,
    dateFormat: 'H:i',
    defaultDate: '00:30',
    time_24hr: true
  })

  var ship = document.querySelector('[name="ship"]')
  if (ship != null) {
    ship.options.length = 0
    ship.append(new Option('-- Choose option --', ''))
  }
})

var allotmentsTable = document.querySelector('#allotments-registers')
if (allotmentsTable !== null) {
  const id = arrivesData.id
  utils.api(JSON.stringify({}), `${apiHost}allotments/arrive/${id}`, 'GET', arrives.buildRegistersAllotments)
}

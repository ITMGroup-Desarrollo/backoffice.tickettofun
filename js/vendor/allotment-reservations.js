'use strict'
var id
var info
var form
var editor
var user = window.user
var allotmentData = window.allotments

var allotment = {
  update: function (response, elementid) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)

    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (codes.hasOwnProperty(response.code)) {
      var action = utils.isJson(response.message)
      var response2 = ''
      if (action == true) {
        response2 = JSON.parse(response.message)
      } else {
        response2 = response
      }

      _message = utils.createElement('p', '', '', response2.message)
      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    } else if (response.code === 204) {
      var inputPax = document.getElementById(elementid)
      var capmax = inputPax.getAttribute('data-capmax')
      var newpax = inputPax.value
      var newavailable = capmax - newpax
      inputPax.setAttribute('data-paxoriginal', newpax)
      inputPax.setAttribute('value', newpax)
      var _inputavailable = document.querySelector(`[data-idavailable="${elementid}"]`)
      _inputavailable.innerHTML = newavailable
      _message = utils.createElement('p', '', '', 'Success! Allotment updated correctly')
      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)
      MicroModal.show('alert-modal')
    }
  },
  loadData: function (response) {
    const data = JSON.parse(response)

    let dataTable = []

    if (Array.isArray(data.message)) {
      dataTable = data.message.map(data => {
        const dataArray = [
          data.channel_name,
          data.reseller_name,
          data.ship_name,
          data.service_name,
          data.shared_schedule,
          data.schedule_start,
          data.schedule_end,
          data.min_available,
          data.max_available,
          data.available,
          data.pax,
          data.process_status_id,
          data.reservation_id,
          data.allotment_active_status
        ]

        return dataArray
      })
    }

    // Get num cells
    var reservationTable = document.getElementById('allotment-reservations-registers')
    var columnsCount = reservationTable.rows[0].cells.length

    var columns = [{
      targets: 4,
      className: 'center',
      data: 'reservation_id',
      render: function (data, type, row, meta) {
        if (row[4] === 1) {
          return 'yes'
        } else {
          return 'No'
        }
      }
    },
    {
      targets: 5,
      className: 'center',
      data: 'reservation_id',
      render: function (data, type, row, meta) {
        return `${row[5]}-${row[6]}`
      }
    },
    {
      targets: 6,
      className: 'center',
      data: 'reservation_id',
      render: function (data, type, row, meta) {
        return `${row[7]}-${row[8]}`
      }
    },
    {
      targets: 7,
      className: 'center',
      render: function (data, type, row, meta) {
        var _lab = utils.createElement('span', '', '', row[9])
        _lab.setAttribute('data-idavailable', row[12])
        return _lab.outerHTML
      }
    },
    {
      targets: 8,
      width: '160px',
      className: 'center',
      render: function (data, type, row, meta) {
        var _input = utils.createElement('input', 'form-control input-pax', row[12], '')
        _input.setAttribute('style', 'border-radius:3px')
        _input.setAttribute('type', 'number')
        _input.setAttribute('value', row[10])
        _input.setAttribute('data-validator', 'number')
        _input.setAttribute('data-validator-msg', 'The pax is invalid!')
        _input.setAttribute('min', 0)
        _input.setAttribute('data-paxoriginal', row[10])
        _input.setAttribute('data-capmax', row[8])
        _input.setAttribute('disabled', 'disabled')
        var _icon = utils.createElement('i', 'fas fa-edit spanicon', '', '')
        _icon.setAttribute('data-inputpax', row[12])
        _icon.setAttribute('style', 'font-size:14px;')
        var _spanIcon = utils.createElement('span', 'input-group-addon', '', _icon.outerHTML)
        _spanIcon.setAttribute('data-inputpax', row[12])
        _spanIcon.setAttribute('style', 'border:none; background:transparent;')
        var _auxAll = `${_input.outerHTML}${_spanIcon.outerHTML}`
        var _divContainer = utils.createElement('div', 'input-group input-group-sm', '', _auxAll)

        if (row[11] === 6) {
          return _divContainer.outerHTML
        } else {
          return row[10]
        }
      }
    },
    {
      targets: 9,
      className: 'center',
      data: 'reservation_id',
      render: function (data, type, row, meta) {
        let tag = ''
        switch (row[11]) {
          case 3:
            tag = utils.createElement('p', 'label label-danger', '', 'Canceled')
            tag.setAttribute('data-status', row[12])
            return tag.outerHTML
          case 5:
            tag = utils.createElement('p', 'label label-warning', '', 'Pending')
            tag.setAttribute('data-status', row[12])
            return tag.outerHTML
          case 6:
            tag = utils.createElement('p', 'label label-success', '', 'Confirmed')
            tag.setAttribute('data-status', row[12])
            return tag.outerHTML
        }
      }
    }]

    if ($.fn.DataTable.isDataTable(editor)) {
      editor.destroy()
    }

    editor = $('#allotment-reservations-registers')
      .on('order.dt', function () {})
      .on('page.dt', function () {})
      .DataTable({
        retrieve: true,
        data: dataTable,
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

    var _spanIcons = document.querySelectorAll('.spanicon')
    for (var i = 0, l = _spanIcons.length; i < l; i++) {
      _spanIcons[i].addEventListener('click', function (e) {
        e.preventDefault()
        var element = e.target.getAttribute('data-inputpax')
        unlock(element)
      })
    }

    MicroModal.close('wait-modal')
  },
  buildfilterShips: function (response) {
    const data = JSON.parse(response)

    if (Array.isArray(data.message)) {
      for (var i in data.message) {
        ship.append(new Option(data.message[i].ship_name, data.message[i].ship_id, 'selected'))
      }
    }

    MicroModal.close('wait-modal')
  },
  buildfilterVendors: function (response) {
    const data = JSON.parse(response)

    if (Array.isArray(data.message)) {
      for (var i in data.message) {
        vendor.append(new Option(data.message[i].reseller_name, data.message[i].reseller_id, 'selected'))
      }
    }

    MicroModal.close('wait-modal')
  }
}

const unlock = function (elementid) {
  var inputPax = document.getElementById(elementid)
  inputPax.removeAttribute('disabled')
  inputPax.focus()

  inputPax.addEventListener('blur', function (e) {
    e.preventDefault()
    e.stopImmediatePropagation()

    var original = parseInt(inputPax.getAttribute('data-paxoriginal'))
    inputPax.setAttribute('disabled', 'disabled')
    var valid = 'true'
    var newpax = parseInt(inputPax.value)

    valid = utils.dataValidator(inputPax)

    if (valid) {
      if (original !== newpax) {
        var info = {
          type_channel: 1,
          pax: parseInt(inputPax.value),
          user_id: user,
          act_time: null,
          active_status: 6
        }
        var url = `${apiHost}allotment_reservations/edit/${elementid}`
        utils.api(JSON.stringify(info), url, 'PUT', allotment.update, elementid)
      }
    }
  })
}

var ship = document.querySelector('[name="ship"]')
if (ship != null) {
  ship.options.length = 0
  ship.append(new Option('-- Choose option --', ''))
}

$(function () {
  document.querySelectorAll('.date-format').flatpickr({
    altFormat: 'F j, Y',
    dateFormat: 'Y-m-d',
    defaultDate: 'today',
    altInput: true
  })
})

var vendor = document.querySelector('[name="reseller"]')
if (vendor != null) {
  vendor.options.length = 0
  vendor.append(new Option('-- Choose option --', ''))

  vendor.addEventListener('change', function (e) {
    var id = $(this).val()

    info = {
      type: 'reseller_search',
      start_date: document.querySelector('[name="date"]').value
    }

    for (var i = ship.options.length - 1; i > 0; i--) {
      ship.remove(i)
    }

    utils.api(JSON.stringify(info), `${apiHost}allotment_reservations/reseller/${id}`, 'POST', allotment.buildfilterShips)
  })
}

var channel = document.querySelector('[name="channel"]')
if (channel != null) {
  channel.addEventListener('change', function (e) {
    var id = $(this).val()
    var filterShip = document.querySelector('.filter-ship')

    if (id === '1' || id === '') {
      filterShip.className = 'form-group filter-ship'
    } else {
      filterShip.className = 'form-group filter-ship hidden'
    }

    info = {
      type: 'channel_search',
      start_date: document.querySelector('[name="date"]').value
    }

    for (var i = vendor.options.length - 1; i > 0; i--) {
      vendor.remove(i)
    }

    for (var i = ship.options.length - 1; i > 0; i--) {
      ship.remove(i)
    }

    if (id > 0) {
      utils.api(JSON.stringify(info), `${apiHost}allotment_reservations/channel/${id}`, 'POST', allotment.buildfilterVendors)
    }
  })
}

var search = document.querySelector('.search')
if (vendor != null) {
  search.addEventListener('click', function (e) {
    e.preventDefault()
    utilAjaxExecute()
  })
}

var configTable = document.querySelector('#allotment-reservations-registers')
var utilAjaxExecute = function () {
  if (configTable !== undefined && configTable !== null && configTable !== undefined && configTable != undefined) {
    var url = `${apiHost}allotment_reservations`
    var date = document.querySelector('[name="date"]').value
    const ship = document.querySelector('[name="ship"]').value
    const channel = document.querySelector('[name="channel"]').value
    const reseller = document.querySelector('[name="reseller"]').value

    var info = {}
    info.start_date = date

    if (reseller !== '' && ship !== '') {
      url = url + `/ship/${ship}`
    } else if (reseller !== '' && ship === '') {
      url = url + `/reseller/${reseller}`
    } else if (channel !== '' && reseller === '') {
      url = url + `/channel/${channel}`
    }

    utils.api(JSON.stringify(info), url, 'POST', allotment.loadData)
  }
}

$(function () {
  utilAjaxExecute()
})

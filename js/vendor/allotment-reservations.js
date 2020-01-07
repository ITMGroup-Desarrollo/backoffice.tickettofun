'use strict'
var id
var info
var form
var editor
var user = window.user
var allotmentData = window.allotments

var allotment = {
  update: function (response) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)

    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (codes.hasOwnProperty(response.code)) {

      var action = utils.isJson(response.message)
      var response2 = ''
      if (action == true) {
        response2 = JSON.parse(response.message)

        var _fieldPax = document.querySelector('[name="pax"]')
        var _fieldProcess = document.querySelector('[name="process_status"]')
        if (response2.pax === 0 && response2.process_status === 3) {
          _fieldPax.value = 0
          _fieldProcess.value = 3
        } else {
          _fieldPax.value = response2.pax
          _fieldProcess.value = response2.process_status
        }
      } else {
        response2 = response
      }

      _message = utils.createElement('p', '', '', response2.message)
      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
    else if (response.code == 204) {
      _message = utils.createElement('p', '', '', 'Success! Allotment updated correctly')
      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)
      MicroModal.show('alert-modal')
    }
  },
  delete: function (response) {
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
    else if (response.code == 200) {
      _message = utils.createElement('p', '', '', 'Success! allotment canceled correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      utilAjaxExecute();

    }
  },
  loadData: function (response) {
    const data = JSON.parse(response);

    let dataTable = [];

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
        return row[9]
      }
    },
    {
      targets: 8,
      className: 'center',
      render: function (data, type, row, meta) {
        return row[10];
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

    if (columnsCount === 11) {
      columns.push(
        {
          targets: 10,
          data: 'reservation_id',
          className: 'center',
          render: function (data, type, row, meta) {
            if (row[0] === 'Cruise' && row[13] === 1) {

              let _tagAction = ''
              if (row[11] === 6) {
                _tagAction = utils.createElement('a', 'edit')
                _tagAction.setAttribute('href', `reservation/${row[12]}`)
                _tagAction.appendChild(utils.createElement('i', 'fas fa-edit'))

                return _tagAction.outerHTML

              } else {

                return '';

              }
            } else {
              return ''
            }
          }
        }
      )
    }

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

    var options = document.querySelectorAll('.delete')
    for (var i = 0, l = options.length; i < l; i++) {
      options[i].addEventListener('click', function (e) {
        e.preventDefault()

        var element = e.target

        if (!e.target.getAttribute('data-id')) {
          element = e.target.parentElement
        }

        confirm(element)
      })
    }

    MicroModal.close('wait-modal')
  },
  buildOptions: function (response) {
    const data = JSON.parse(response)

    if (Array.isArray(data.message)) {
      for (var i in data.message) {
        ship.append(new Option(data.message[i].ship_name, data.message[i].ship_id, 'selected'))
      }
    }

    MicroModal.close('wait-modal')
  },
  buildOptionsVendor: function (response) {
    const data = JSON.parse(response)

    if (Array.isArray(data.message)) {
      for (var i in data.message) {
        vendor.append(new Option(data.message[i].reseller_name, data.message[i].reseller_id, 'selected'))
      }
    }

    MicroModal.close('wait-modal')
  },
  setData: function () {

    document.querySelector('[name="reserve_date"]').value = allotmentData.start_date
    document.querySelector('[name="reserve_date"]').setAttribute('disabled', 'disabled')

    const pax = allotmentData.pax
    const process = allotmentData.process_status_id

    var _fieldPax = document.querySelector('[name="pax"]')
    var _fieldProcess = document.querySelector('[name="process_status"]')

    if (pax === 0 && process === 3) {
      _fieldPax.value = 0
      _fieldProcess.value = 3
    } else {
      _fieldPax.value = allotmentData.pax
      _fieldProcess.value = allotmentData.process_status_id
    }
  }
}

const confirm = function (element) {
  var _message = ''
  var _confirmModal = document.getElementById('confirm-modal-content')
  _message = utils.createElement('p', '', '', '¿Are you sure delete reservation?')

  _confirmModal.innerHTML = ''
  _confirmModal.appendChild(_message)

  const btnConfirmDelete = document.querySelector('.confirm-delete')
  btnConfirmDelete.addEventListener('click', function (e) {
    e.preventDefault()

    id = element.getAttribute('data-id')

    var info = { user_id: user }

    var url = `${apiHost}allotment_reservations/del/${id}`
    utils.api(JSON.stringify(info), url, 'DELETE', allotment.delete, element)
  })

  MicroModal.show('confirm-modal')
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function (e) {
    e.preventDefault()
    form = document.querySelector('#update-allotment')
    window.location.href = 'allotments/reservation'
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
        type_channel: 1,
        pax: document.querySelector('[name="pax"]').value,
        user_id: user,
        act_time: null,
        active_status: document.querySelector('[name="process_status"]').value
      }

      var url = `${apiHost}allotment_reservations/edit/${allotmentData.id}`
      utils.api(JSON.stringify(info), url, 'PUT', allotment.update)
    }
  })
}

form = document.querySelector('#update-allotment')
if (form != null) {
  allotment.setData()
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

    utils.api(JSON.stringify(info), `${apiHost}allotment_reservations/reseller/${id}`, 'POST', allotment.buildOptions)
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
      utils.api(JSON.stringify(info), `${apiHost}allotment_reservations/channel/${id}`, 'POST', allotment.buildOptionsVendor)
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

const utilAjaxExecute = function () {
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

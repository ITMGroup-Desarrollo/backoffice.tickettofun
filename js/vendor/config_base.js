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
          data.active_status,
          data.allotment_id,
          data.arrive_active_status
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
      data: 'allotment_id',
      render: function (data, type, row, meta) {
        if (row[9] === 0) {
          return `<span class="label label-danger" data-status="${row[10]}">Inactive</span>`
        } else {
          return `<span class="label label-success" data-status="${row[10]}">Active</span>`
        }
      }
    }]

    if (columnsCount === 11) {
      columns.push({
        targets: 10,
        data: 'allotment_id',
        className: 'text-center',
        render: function (data, type, row, meta) {
          if (row[11] === 1) {
            if (row[9] === 0) {
              return `<a class="btn-link edit" href="configuration/${row[10]}"><i class="fas fa-edit"></i></a>`
            } else {
              return `<a class="btn-link" data-toggle="tooltip" data-placement="left" title="Transfer" href="configuration/${row[10]}"><i class="fas fa-exchange-alt"></i></a> <a class="btn-link edit" data-toggle="tooltip" data-placement="left" title="Edit allotment" href="configuration/${row[10]}"><i class="fas fa-edit"></i></a> <a class="btn-link delete" data-toggle="tooltip" data-placement="left" title="Delete allotment" data-id="${row[10]}"><i class="fas fa-trash"></i></a>`
            }
          } else {
            return '';
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
  loadSchedule: function (response){
    var data = JSON.parse(response);

    document.querySelector('[name="schedule_end"]').value = data.message.message;

    MicroModal.close();
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
      let decode = JSON.parse(response.message)

      _message = utils.createElement('p', '', '', decode.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      const maxInput = document.querySelector('[name="max_available"]')
      const minInput = document.querySelector('[name="min_available"]')

      if (maxInput != null) {
        maxInput.value = (decode.available) ? decode.available : 0
      }

      if (minInput != null) {
        minInput.value = (decode.available > minInput.value) ? minInput.value : decode.available
      }

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

      element.parentElement.firstChild.style.display = 'none'

      var label = utils.createElement('span', 'label label-danger', '', 'inactive');
      _parentELement.appendChild(label)

      _message = utils.createElement('p', '', '', 'Success! Schedule inactivate correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
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
    document.querySelector('[name="schedule_start"]').value = configData.schedule_start
    document.querySelector('[name="schedule_end"]').value = configData.schedule_end
    document.querySelector('[name="overlap"]').value = configData.overlap
    document.querySelector('[name="min_available"]').value = configData.min_available
    document.querySelector('[name="max_available"]').value = configData.max_available
    document.querySelector('[name="shared"]').value = configData.shared

    if (document.querySelector('[name="reseller"]') != null && configData) {
      $(document).ready(function () {
        document.querySelector('[name="reseller"]').value = configData.reseller
      })
    }

    if (configData.channel === 1) {
      document.querySelector('[name="channel"]').setAttribute('disabled', 'disabled');
      document.querySelector('[name="reseller"]').setAttribute('disabled', 'disabled');
      document.querySelector('[name="service"]').setAttribute('disabled', 'disabled');
      document.querySelector('[name="cruise"]').setAttribute('disabled', 'disabled');
      document.querySelector('[name="start_date"]').setAttribute('disabled', 'disabled');
      document.querySelector('[name="end_date"]').setAttribute('disabled', 'disabled');
      document.querySelector('[name="schedule_end"]').setAttribute('disabled', 'disabled');
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
    e.preventDefault()

    var id = (e.target.value) ? e.target.value : configData.reseller
    var channelId = (typeof(configData) === "object") ? configData.channel : null

    var dataElement = {
      id: channelId,
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

    var id = (e.target.value) ? e.target.value : configData.reseller

    if (configData.channel === 1) {
      var shipId = (typeof(configData) === "object") ? configData.cruise : null

      var dataElement2 = {
        id: shipId,
        key: 'ship_name',
        value: 'ship_id',
        element: document.querySelector('[name="cruise"]')
      }

      utils.api(JSON.stringify({}), `${apiHost}ships/reseller/${id}`, 'GET', config.loadOptions, dataElement2)
    }

    var serviceId = (typeof(configData) === "object") ? configData.service : null

    var dataElement = {
      id: serviceId,
      key: 'service_name',
      value: 'service_id',
      element: document.querySelector('[name="service"]')
    }

    utils.api(JSON.stringify({}), `${apiHost}equivalences/reseller/${id}`, 'GET', config.loadOptions, dataElement)

  })
}

var scheduleStart = document.querySelector('[name="schedule_start"]')

if (scheduleStart != null) {

  scheduleStart.addEventListener('change', function(e) {
    e.preventDefault()

    var service = document.querySelector('[name="service"]')
    document.querySelector('[name="schedule_end"]')

    if (scheduleStart.value && service.value){

      utils.api(JSON.stringify({"schedule_start": scheduleStart.value}), `${apiHost}allotments/servicescheduleend/${service.value}`, 'POST', config.loadSchedule)

    }else{

      document.querySelector('[name="schedule_end"]').value = "";

    }


  });

}

form = document.querySelector('#add-config')
if (form != null) {
  var statusCombo = form.querySelector('[name="status"]')
  statusCombo.parentElement.parentElement.remove()
  document.getElementById('cruise').setAttribute('class','hidden')

  var channelSelect = form.querySelector('[name="channel"]')
  channelSelect.remove(1)
}

form = document.querySelector('#update-config')
if (form != null) {
  config.setData()
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

$(document).ready(function () {
  document.querySelectorAll('.date-format').flatpickr({
    dateFormat: 'Y-m-d'
  })

  document.querySelectorAll('.date-range').flatpickr({
    altFormat: 'F j, Y',
    dateFormat: 'Y-m-d',
    defaultDate: 'today',
    altInput: true
  })

  document.querySelectorAll('.time-format').flatpickr({
    enableTime: true,
    noCalendar: true,
    dateFormat: 'H:i',
    time_24hr: true
  })
})

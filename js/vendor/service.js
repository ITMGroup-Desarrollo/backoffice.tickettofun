'use strict'
var info
var form
var base = window.baseUrl
var token = window.token
var serviceData = window.service

var service = {
  add: function(response) {
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
    else if (response.code == 201) {
      _message = utils.createElement('p', '', '', 'Success!, service added correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')

      form = document.querySelector('#add-service')
      form.reset();
    }
  },
  update: function(response) {
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
      _message = utils.createElement('p', '', '', 'Success!, service updated correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  },
  delete: function(response, element) {
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
    else if (response.code == 200) {
      var _status = document.querySelector(`[data-status="${id}"]`)
      _status.innerHTML = ''

      var label = utils.createElement('span', 'label label-danger', '', 'inactive');
      _status.appendChild(label)

      _message = utils.createElement('p', '', '', 'Success!, service inactivate correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  },
  setData: function() {
    document.querySelector('[name="code"]').value = serviceData .code
    document.querySelector('[name="status"]').value = serviceData .active
    document.querySelector('[name="service_name"]').value = serviceData.name
    document.querySelector('[name="duration"]').value = serviceData.duration
    document.querySelector('[name="min_available"]').value = serviceData.max
    document.querySelector('[name="max_available"]').value = serviceData.min
    document.querySelector('[name="location"]').value = serviceData .location
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function(e) {
    e.preventDefault()

    form = document.querySelector('#add-service')
    if (form != null)
      form.reset()

    form = document.querySelector('#update-service')

    if (form != null)
      service.setData()
  });
}

var save = document.querySelector('.save')
if (save != null) {
  save.addEventListener('click', function(e) {
    e.preventDefault()

    var valid = 'true'
    var fields = document.querySelectorAll('[data-validator]')

    valid = utils.dataValidator(fields)

    if(valid) {
      info = {
        code: document.querySelector('[name="code"]').value,
        location_id: document.querySelector('[name="location"]').value,
        service_name: document.querySelector('[name="service_name"]').value,
        duration: document.querySelector('[name="duration"]').value,
        min_available_num: document.querySelector('[name="min_available"]').value,
        max_available_num: document.querySelector('[name="max_available"]').value
      }

      form = document.querySelector('#add-service')

      if (form != null) {
        var url = `${apiHost}products/add`
        utils.api(JSON.stringify(info), url, 'POST', service.add)
      }

      form = document.querySelector('#update-service')

      if (form != null) {
        info.active_status = document.querySelector('[name="status"]').value

        var url = `${apiHost}products/edit/${serviceData.id}`
        utils.api(JSON.stringify(info), url, 'PUT', service.update)
      }
    }
  })
}

var options = document.querySelectorAll('.delete')

for (var i = 0, l = options.length; i < l; i++) {
  options[i].addEventListener('click', function(e) {
    e.preventDefault()

    var element = e.target
    if (! e.target.getAttribute('data-id'))
      element = e.target.parentElement

    var id = element.getAttribute('data-id')
    var url = `${apiHost}products/del/${id}`
      utils.api(JSON.stringify({}), url, 'DELETE', service.delete, element)
  })
}

form = document.querySelector('#add-service')
if (form != null) {
  var status_combo = form.querySelector('[name="status"]')
  status_combo.parentElement.parentElement.remove()
}

form = document.querySelector('#update-service')
if (form != null)
  service.setData()

var servicesTable = document.querySelector('#services-registers')
if (servicesTable !== null) {
  $(function() {
    $('#services-registers').dataTable({
        "sPaginationType": "full_numbers",
        "iDisplayLength": 20,
        "aLengthMenu": [[20, 50, 100, -1], [20, 50, 100, "All"]]
    });
  });
}

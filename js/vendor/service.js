'use strict'
var url
var info
var form
var serviceData = window.service
var userCreateId = window.user_create_id

var service = {
  add: function (response) {
    try {
      MicroModal.close('wait-modal')

      response = JSON.parse(response)
      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        utils.displayModal(alertModal, response.message)
      } else if (response.code === 201) {
        utils.displayModal(alertModal, 'Success! Service added correctly')

        document.querySelector('#add-service').reset()
      }
    } catch (e) {
      utils.displayModal(alertModal, '')
    }
  },
  update: function (response) {
    try {
      MicroModal.close('wait-modal')

      response = JSON.parse(response)
      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        utils.displayModal(alertModal, response.message)
      } else if (response.code === 204) {
        utils.displayModal(alertModal, 'Success! Service updated correctly')
      }
    } catch (e) {
      utils.displayModal(alertModal, '')
    }
  },
  delete: function (response, element) {
    try {
      MicroModal.close('wait-modal')

      response = JSON.parse(response)

      var id = element.getAttribute('data-id')
      element.style.display = 'none'

      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        utils.displayModal(alertModal, response.message)
      } else if (response.code === 200) {
        utils.displayModal(alertModal, 'Success! Service inactivate correctly')

        var _status = document.querySelector(`[data-status="${id}"]`)
        _status.innerHTML = ''

        var label = utils.createElement('span', 'badge badge-danger', '', 'Inactive')
        _status.appendChild(label)
      }
    } catch (e) {
      utils.displayModal(alertModal, '')
    }
  },
  setData: function () {
    document.querySelector('[name="status"]').value = serviceData.active
    document.querySelector('[name="service_name"]').value = serviceData.name
    document.querySelector('[name="duration"]').value = serviceData.duration
    document.querySelector('[name="min_available"]').value = serviceData.max
    document.querySelector('[name="max_available"]').value = serviceData.min
    document.querySelector('[name="location"]').value = serviceData.location
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function (e) {
    e.preventDefault()

    form = document.querySelector('#add-service')
    if (form != null) {
      form.reset()
    }

    form = document.querySelector('#update-service')
    if (form != null) {
      service.setData()
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
        user_create_id: userCreateId,
        duration: document.querySelector('[name="duration"]').value,
        location_id: document.querySelector('[name="location"]').value,
        service_name: document.querySelector('[name="service_name"]').value,
        min_available_num: document.querySelector('[name="min_available"]').value,
        max_available_num: document.querySelector('[name="max_available"]').value
      }

      form = document.querySelector('#add-service')
      if (form != null) {
        url = `${apiHost}products/add`
        utils.api(JSON.stringify(info), url, 'POST', service.add)
      }

      form = document.querySelector('#update-service')
      if (form != null) {
        info.active_status = document.querySelector('[name="status"]').value

        url = `${apiHost}products/edit/${serviceData.id}`
        utils.api(JSON.stringify(info), url, 'PUT', service.update)
      }
    }
  })
}

var options = document.querySelectorAll('.delete')
for (var i = 0, l = options.length; i < l; i++) {
  options[i].addEventListener('click', function (e) {
    e.preventDefault()

    var element = e.target
    if (!e.target.getAttribute('data-id')) {
      element = e.target.parentElement
    }

    var id = element.getAttribute('data-id')
    url = `${apiHost}products/del/${id}`
    utils.api(JSON.stringify({}), url, 'DELETE', service.delete, element)
  })
}

form = document.querySelector('#add-service')
if (form != null) {
  var statusCombo = form.querySelector('[name="status"]')
  statusCombo.parentElement.parentElement.remove()
}

form = document.querySelector('#update-service')
if (form != null) {
  service.setData()
}

var servicesTable = document.querySelector('#services-registers')
if (servicesTable !== null) {
  $(function () {
    $('#services-registers').dataTable(utils.getDataTableConfig())
  })
}

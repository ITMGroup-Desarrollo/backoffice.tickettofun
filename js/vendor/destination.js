'use strict'
var url
var info
var form
var destinationData = window.destination
var userCreateId = window.user_create_id

var destination = {
  add: function (response) {
    try {
      MicroModal.close('wait-modal')

      response = JSON.parse(response)

      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        utils.displayModal(alertModal, response.message)
      } else if (response.code === 201) {
        utils.displayModal(alertModal, 'Success! Destination added correctly')
      }

      document.querySelector('#add-destination').reset()
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
        utils.displayModal(alertModal, 'Success! Destination updated correctly')
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
        var _status = document.querySelector(`[data-status="${id}"]`)
        _status.innerHTML = ''

        var label = utils.createElement('span', 'label label-danger', '', 'inactive')
        _status.appendChild(label)

        utils.displayModal(alertModal, 'Success! Destination inactivate correctly')
      }
    } catch (e) {
      utils.displayModal(alertModal, '')
    }
  },
  setData: function () {
    document.querySelector('[name="name"]').value = destinationData.name
    document.querySelector('[name="status"]').value = destinationData.active
    document.querySelector('[name="country"]').value = destinationData.country
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function (e) {
    e.preventDefault()

    form = document.querySelector('#add-destination')
    if (form != null) {
      form.reset()
    }

    form = document.querySelector('#update-destination')
    if (form != null) {
      destination.setData()
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
        name: document.querySelector('[name="name"]').value,
        country: document.querySelector('[name="country"]').value
      }

      form = document.querySelector('#add-destination')

      if (form != null) {
        url = `${apiHost}destinations/add`
        utils.api(JSON.stringify(info), url, 'POST', destination.add)
      }

      form = document.querySelector('#update-destination')

      if (form != null) {
        info.status = document.querySelector('[name="status"]').value

        url = `${apiHost}destinations/edit/${destinationData.id}`
        utils.api(JSON.stringify(info), url, 'PUT', destination.update)
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

    url = `${apiHost}destinations/del/${id}`
    utils.api(JSON.stringify({}), url, 'DELETE', destination.delete, element)
  })
}

form = document.querySelector('#add-destination')
if (form != null) {
  var statusCombo = form.querySelector('[name="status"]')
  statusCombo.parentElement.parentElement.remove()
}

form = document.querySelector('#update-destination')
if (form != null) {
  destination.setData()
}

var destinationsTable = document.querySelector('#destinations-registers')
if (destinationsTable !== null) {
  $(function () {
    $('#destinations-registers').dataTable(utils.getDatatableConfig())
  })
}

'use strict'
var info
var form
var businessData = window.business
var userCreateId = window.user_create_id

var business = {
  add: function (response) {
    try {
      MicroModal.close('wait-modal')

      response = JSON.parse(response)

      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        utils.displayModal(alertModal, response.message)
      } else if (response.code === 201) {
        utils.displayModal(alertModal, 'Success! Business added correctly')

        document.querySelector('#add-business').reset()
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
        utils.displayModal(alertModal, 'Success! Business updated correctly')
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
        utils.displayModal(alertModal, 'Success! Business inactivate correctly')

        var _status = document.querySelector(`[data-status="${id}"]`)
        _status.innerHTML = ''

        var label = utils.createElement('span', 'label label-danger', '', 'inactive')
        _status.appendChild(label)
      }
    } catch (e) {
      utils.displayModal(alertModal, '')
    }
  },
  setData: function () {
    document.querySelector('[name="name"]').value = businessData.name
    document.querySelector('[name="status"]').value = businessData.active
    document.querySelector('[name="destination"]').value = businessData.destination
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function (e) {
    e.preventDefault()

    form = document.querySelector('#add-business')
    if (form != null) {
      form.reset()
    }

    form = document.querySelector('#update-business')
    if (form != null) {
      business.setData()
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
        destination: document.querySelector('[name="destination"]').value
      }

      form = document.querySelector('#add-business')
      if (form != null) {
        var url = `${apiHost}unities/add`
        utils.api(JSON.stringify(info), url, 'POST', business.add)
      }

      form = document.querySelector('#update-business')
      if (form != null) {
        info.status = document.querySelector('[name="status"]').value

        url = `${apiHost}unities/edit/${businessData.id}`
        utils.api(JSON.stringify(info), url, 'PUT', business.update)
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
    var url = `${apiHost}unities/del/${id}`
    utils.api(JSON.stringify({}), url, 'DELETE', business.delete, element)
  })
}

form = document.querySelector('#add-business')
if (form != null) {
  var statusCombo = form.querySelector('[name="status"]')
  statusCombo.parentElement.parentElement.remove()
}

form = document.querySelector('#update-business')
if (form != null) {
  business.setData()
}

var servicesTable = document.querySelector('#services-registers')
if (servicesTable !== null) {
  $(function () {
    $('#services-registers').dataTable(utils.getDatatableConfig())
  })
}

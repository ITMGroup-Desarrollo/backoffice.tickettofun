'use strict'
var url
var info
var form
var rolData = window.rol
var userCreateId = window.user_create_id

var rol = {
  add: function (response) {
    try {
      MicroModal.close('wait-modal')

      response = JSON.parse(response)
      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        utils.displayModal(alertModal, response.message)
      } else if (response.code === 201) {
        utils.displayModal(alertModal, 'Success! Role added correctly')

        document.querySelector('#add-rol').reset()
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
        utils.displayModal(alertModal, 'Success! Role updated correctly')
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
        utils.displayModal(alertModal, 'Success! Role inactivate correctly')

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
    document.querySelector('[name="status"]').value = rolData.active
    document.querySelector('[name="rol_name"]').value = rolData.rol_name
  }
}

var cancel = document.querySelector('.cancel')
if (cancel !== null) {
  cancel.addEventListener('click', function (e) {
    e.preventDefault()

    form = document.querySelector('#update-rol')
    if (form !== null) {
      rol.setData()
    }

    form = document.querySelector('#update-rol')
    if (form !== null) {
      rol.setData()
    }
  })
}

var save = document.querySelector('.save')
if (save !== null) {
  save.addEventListener('click', function (e) {
    e.preventDefault()

    url = ''
    var valid = 'true'
    var fields = document.querySelectorAll('[data-validator]')

    valid = utils.dataValidator(fields)

    if (valid) {
      info = {
        user_create_id: userCreateId,
        role_name: document.querySelector('[name="rol_name"]').value
      }

      form = document.querySelector('#add-rol')
      if (form !== null) {
        url = apiHost + 'roles/add'
        utils.api(JSON.stringify(info), url, 'POST', rol.add)
      }

      form = document.querySelector('#update-rol')
      if (form !== null) {
        info.active_status = document.querySelector('[name="status"]').value

        url = apiHost + `roles/edit/${rolData.id}`
        utils.api(JSON.stringify(info), url, 'PUT', rol.update)
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
    var url = apiHost + `roles/del/${id}`
    utils.api(JSON.stringify({}), url, 'DELETE', rol.delete, element)
  })
}

form = document.querySelector('#add-rol')
if (form !== null) {
  var statusCombo = form.querySelector('[name="status"]')
  statusCombo.parentElement.parentElement.remove()
}

form = document.querySelector('#update-rol')
if (form !== null) {
  rol.setData()
}

var servicesTable = document.querySelector('#roles-registers')
if (servicesTable !== null) {
  $(function () {
    $('#roles-registers').dataTable(utils.getDataTableConfig())
  })
}

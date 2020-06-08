'use strict'
var url
var info
var form
var userData = window.user
var userCreateId = window.user_create_id

var user = {
  add: function (response) {
    try {
      MicroModal.close('wait-modal')

      response = JSON.parse(response)

      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        utils.displayModal(alertModal, response.message)
      } else if (response.code === 201) {
        utils.displayModal(alertModal, 'Success! User added correctly')

        document.querySelector('#add-user').reset()
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
        utils.displayModal(alertModal, 'Success! User updated correctly')
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
        utils.displayModal(alertModal, 'Success! User inactivate correctly')

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
    document.querySelector('[name="rol"]').value = userData.rol
    document.querySelector('[name="status"]').value = userData.active
    document.querySelector('[name="last_name"]').value = userData.last_name
    document.querySelector('[name="first_name"]').value = userData.first_name
    document.querySelector('[name="email_addr"]').value = userData.email_addr
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function (e) {
    e.preventDefault()

    form = document.querySelector('#add-user')
    if (form != null) {
      form.reset()
    }

    form = document.querySelector('#update-user')

    if (form != null) {
      user.setData()
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
        rol_id: document.querySelector('[name="rol"]').value,
        first_name: document.querySelector('[name="first_name"]').value,
        last_name: document.querySelector('[name="last_name"]').value,
        email_addr: document.querySelector('[name="email_addr"]').value
      }

      form = document.querySelector('#add-user')
      if (form != null) {
        info.user_password = document.querySelector('[name="user_password"]').value

        url = `${apiHost}users/add`
        utils.api(JSON.stringify(info), url, 'POST', user.add)
      }

      form = document.querySelector('#update-user')
      if (form != null) {
        info.active_status = document.querySelector('[name="status"]').value

        url = `${apiHost}users/edit/${userData.id}`
        utils.api(JSON.stringify(info), url, 'PUT', user.update)
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

    url = `${apiHost}users/del/${id}`
    utils.api(JSON.stringify({}), url, 'DELETE', user.delete, element)
  })
}

form = document.querySelector('#add-user')
if (form != null) {
  var statusCombo = form.querySelector('[name="status"]')
  statusCombo.parentElement.parentElement.remove()
}

form = document.querySelector('#update-user')
if (form != null) {
  var passwordInput = form.querySelector('[name="user_password"]')
  passwordInput.parentElement.parentElement.remove()

  user.setData()
}

var usersTable = document.querySelector('#users-registers')
if (usersTable !== null) {
  $(function () {
    var config = utils.getDataTableConfig()
    config.order = [[2, 'asc']]

    $('#users-registers').dataTable(config)
  })
}

'use strict'
var info
var form
var apikeyData = window.apikey
var userCreateId = window.user_create_id

var apikey = {
  add: function (response) {
    try {
      MicroModal.close('wait-modal')

      response = JSON.parse(response)

      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        utils.displayModal(alertModal, response.message)
      } else if (response.code === 201) {
        utils.displayModal(alertModal, 'Success! API key added correctly')
      }

      document.querySelector('#add-apikey').reset()
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
        utils.displayModal(alertModal, 'Success! API key updated correctly')
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
        utils.displayModal(alertModal, 'Success! API key inactivate correctly')

        var _status = document.querySelector(`[data-status="${id}"]`)
        _status.innerHTML = ''

        var label = utils.createElement('span', 'badge badge-danger', '', 'inactive')
        _status.appendChild(label)
      }
    } catch (e) {
      utils.displayModal(alertModal, '')
    }
  },
  setData: function () {
    document.querySelector('[name="key_description"]').value = apikeyData.description
    document.querySelector('[name="status"]').value = apikeyData.active
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function (e) {
    e.preventDefault()

    form = document.querySelector('#add-apikey')
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
        user_create_id: userCreateId,
        app_name: document.querySelector('[name="key_description"]').value
      }

      form = document.querySelector('#add-apikey')

      if (form != null) {
        if (document.querySelector('[name="user_id"]').value !== '') {
          info.idUser = document.querySelector('[name="user_id"]').value
        }

        var url = apiHost + 'apikeys/add'
        utils.api(JSON.stringify(info), url, 'POST', apikey.add)
      }

      form = document.querySelector('#update-apikey')

      if (form != null) {
        info.active_status = document.querySelector('[name="status"]').value

        url = apiHost + `apikeys/edit/${apikeyData.id}`
        utils.api(JSON.stringify(info), url, 'PUT', apikey.update)
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
    var url = apiHost + `apikeys/del/${id}`
    utils.api(JSON.stringify({}), url, 'DELETE', apikey.delete, element)
  })
}

form = document.querySelector('#add-apikey')
if (form != null) {
  var statusCombo = form.querySelector('[name="status"]')
  statusCombo.parentElement.parentElement.remove()
}

form = document.querySelector('#update-apikey')
if (form != null) {
  var description = form.querySelector('[name="key_description"]')
  description.setAttribute('readonly', 'readonly')

  var userId = form.querySelector('[name="user_id"]')
  userId.parentElement.parentElement.remove()
  apikey.setData()
}

var servicesTable = document.querySelector('#apikeys-registers')
if (servicesTable !== null) {
  $(function () {
    $('#apikeys-registers').dataTable(utils.getDatatableConfig())
  })
}

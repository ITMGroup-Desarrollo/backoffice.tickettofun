'use strict'
var url
var info
var form
var shipsData = window.ships
var userCreateId = window.user_create_id

var ships = {
  add: function (response) {
    try {
      MicroModal.close('wait-modal')

      response = JSON.parse(response)

      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        utils.displayModal(alertModal, response.message)
      } else if (response.code === 201) {
        utils.displayModal(alertModal, 'Success! Cruise added correctly')
      }

      document.querySelector('#add-ship').reset()
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
        utils.displayModal(alertModal, 'Success! Cruise updated correctly')
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
        utils.displayModal(alertModal, 'Success! Cruise inactivate correctly')

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
    document.querySelector('[name="name"]').value = shipsData.name
    document.querySelector('[name="status"]').value = shipsData.active
    document.querySelector('[name="reseller"]').value = shipsData.reseller
    document.querySelector('[name="capacity"]').value = shipsData.capacity
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function (e) {
    e.preventDefault()

    form = document.querySelector('#add-ship')
    if (form != null) {
      form.reset()
    }

    form = document.querySelector('#update-ship')
    if (form != null) {
      ships.setData()
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
        ship_name: document.querySelector('[name="name"]').value,
        reseller_id: document.querySelector('[name="reseller"]').value,
        ship_capacity: document.querySelector('[name="capacity"]').value
      }

      form = document.querySelector('#add-ship')
      if (form != null) {
        url = `${apiHost}ships/add`
        utils.api(JSON.stringify(info), url, 'POST', ships.add)
      }

      form = document.querySelector('#update-ship')
      if (form != null) {
        info.active_status = document.querySelector('[name="status"]').value

        url = `${apiHost}ships/edit/${shipsData.id}`
        utils.api(JSON.stringify(info), url, 'PUT', ships.update)
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
    var url = `${apiHost}ships/del/${id}`

    utils.api(JSON.stringify({}), url, 'DELETE', ships.delete, element)
  })
}

form = document.querySelector('#add-ship')
if (form != null) {
  var statusCombo = form.querySelector('[name="status"]')
  statusCombo.parentElement.parentElement.remove()
}

form = document.querySelector('#update-ship')
if (form != null) {
  ships.setData()
}

var servicesTable = document.querySelector('#ships-registers')
if (servicesTable !== null) {
  $(function () {
    $('#ships-registers').dataTable(utils.getDatatableConfig())
  })
}

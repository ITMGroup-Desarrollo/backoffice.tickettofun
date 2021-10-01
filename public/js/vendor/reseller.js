'use strict'
var url
var info
var form
var resellerData = window.reseller
var userCreateId = window.user_create_id

var reseller = {
  add: function (response) {
    try {
      MicroModal.close('wait-modal')

      response = JSON.parse(response)
      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        utils.displayModal(alertModal, response.message)
      } else if (response.code === 201) {
        utils.displayModal(alertModal, 'Success! Vendor added correctly')

        document.querySelector('#add-reseller').reset()
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
        utils.displayModal(alertModal, 'Success! Vendor updated correctly')
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
        utils.displayModal(alertModal, 'Success! Vendor inactivate correctly')

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
    document.querySelector('[name="status"]').value = resellerData.active
    document.querySelector('[name="channel"]').value = resellerData.channel_id
    document.querySelector('[name="reseller_name"]').value = resellerData.reseller_name
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function (e) {
    e.preventDefault()

    form = document.querySelector('#add-reseller')
    if (form != null) {
      form.reset()
    }

    form = document.querySelector('#update-reseller')
    if (form != null) {
      reseller.setData()
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
        channel_id: document.querySelector('[name="channel"]').value,
        reseller_name: document.querySelector('[name="reseller_name"]').value
      }

      form = document.querySelector('#add-reseller')
      if (form != null) {
        url = `${apiHost}resellers/add`
        utils.api(JSON.stringify(info), url, 'POST', reseller.add)
      }

      form = document.querySelector('#update-reseller')
      if (form != null) {
        info.active_status = document.querySelector('[name="status"]').value

        url = `${apiHost}resellers/edit/${resellerData.id}`
        utils.api(JSON.stringify(info), url, 'PUT', reseller.update)
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
    var url = `${apiHost}resellers/del/${id}`
    utils.api(JSON.stringify({}), url, 'DELETE', reseller.delete, element)
  })
}

form = document.querySelector('#add-reseller')
if (form !== null) {
  var statusCombo = form.querySelector('[name="status"]')
  statusCombo.parentElement.parentElement.remove()
}

form = document.querySelector('#update-reseller')
if (form != null) {
  reseller.setData()
}

var servicesTable = document.querySelector('#resellers-registers')
if (servicesTable !== null) {
  $(function () {
    var config = utils.getDataTableConfig()
    config.order = [[1, 'asc']]

    $('#resellers-registers').dataTable(config)
  })
}

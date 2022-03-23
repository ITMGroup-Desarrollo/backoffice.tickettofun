'use strict'
var url
var info
var form
var saleLocationsData = window.locations
var userCreateId = window.user_create_id

var locations = {
  add: function (response) {
    try {
      MicroModal.close('wait-modal')

      response = JSON.parse(response)

      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        utils.displayModal(alertModal, response.message)
      } else if (response.code === 201) {
        utils.displayModal(alertModal, 'Success! Sale Location added correctly')

        document.querySelector('#add-sale-location').reset()
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
        utils.displayModal(alertModal, 'Success! Sale Location updated correctly')
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
        utils.displayModal(alertModal, 'Success! Sale Location inactivate correctly')

        var _status = document.querySelector(`[data-status="${id}"]`)
        _status.innerHTML = ''

        var label = utils.createElement('span', 'badge badge-danger', '', 'Inactive')
        _status.appendChild(label)
      }
    } catch (e) {
      utils.displayModal(alertModal, '')
    }
  },
  setData () {
    document.querySelector('[name="name"]').value = saleLocationsData.name
    document.querySelector('[name="unity"]').value = saleLocationsData.unity
    document.querySelector('[name="status"]').value = saleLocationsData.active
    document.querySelector('[name="code"]').value = saleLocationsData.code
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function (e) {
    e.preventDefault()

    form = document.querySelector('#add-sale-location')
    if (form != null) {
      form.reset()
    }

    form = document.querySelector('#update-sale-location')
    if (form != null) {
      locations.setData()
    }
  })
}

var save = document.querySelector('.save')
if (save != null) {
  save.addEventListener('click', function (e) {
    e.preventDefault()

    url = ''
    var valid = 'true'
    var fields = document.querySelectorAll('[data-validator]')

    valid = utils.dataValidator(fields)

    if (valid) {
      info = {
        user_create_id: userCreateId,
        name: document.querySelector('[name="name"]').value,
        unity: document.querySelector('[name="unity"]').value,
        code: document.querySelector('[name="code"]').value
      }

      form = document.querySelector('#add-sale-location')

      if (form != null) {
        url = apiHost + 'sale_locations/add'
        utils.api(JSON.stringify(info), url, 'POST', locations.add)
      }

      form = document.querySelector('#update-sale-location')
      if (form != null) {
        info.status = document.querySelector('[name="status"]').value

        url = apiHost + `sale_locations/edit/${saleLocationsData.id}`
        utils.api(JSON.stringify(info), url, 'PUT', locations.update)
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
    var url = apiHost + `sale_locations/del/${id}`

    utils.api(JSON.stringify({}), url, 'DELETE', locations.delete, element)
  })
}

form = document.querySelector('#add-sale-location')
if (form != null) {
  var statusCombo = form.querySelector('[name="status"]')
  statusCombo.parentElement.parentElement.remove()
}

form = document.querySelector('#update-sale-location')
if (form != null) {
  locations.setData()
}

var servicesTable = document.querySelector('#sale-locations-registers')
if (servicesTable !== null) {
  $(function () {
    $('#sale-locations-registers').dataTable(utils.getDataTableConfig())
  })
}

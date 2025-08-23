'use strict'
var url
var info
var form
var locationsData = window.locations
var userCreateId = window.user_create_id

var locations = {
  add: function (response) {
    try {
      MicroModal.close('wait-modal')

      response = JSON.parse(response)

      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        utils.displayModal(alertModal, response.message)
      } else if (response.code === 201) {
        utils.displayModal(alertModal, 'Success! Location added correctly')

        document.querySelector('#add-location').reset()
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
        utils.displayModal(alertModal, 'Success! Location updated correctly')
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
        utils.displayModal(alertModal, 'Success! Location inactivate correctly')

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
    document.querySelector('[name="name"]').value = locationsData.name
    document.querySelector('[name="business_unit"]').value = locationsData.unity
    document.querySelector('[name="status"]').value = locationsData.active
    document.querySelector('[name="available"]').value = locationsData.available
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function (e) {
    e.preventDefault()

    form = document.querySelector('#add-location')
    if (form != null) {
      form.reset()
    }

    form = document.querySelector('#update-location')
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
        unity: document.querySelector('[name="business_unit"]').value,
        available: document.querySelector('[name="available"]').value
      }

      form = document.querySelector('#add-location')

      if (form != null) {
        url = apiHost + 'locations/add'
        utils.api(JSON.stringify(info), url, 'POST', locations.add)
      }

      form = document.querySelector('#update-location')
      if (form != null) {
        info.status = document.querySelector('[name="status"]').value

        url = apiHost + `locations/edit/${locationsData.id}`
        utils.api(JSON.stringify(info), url, 'PUT', locations.update)
      }
    }
  })
}

form = document.querySelector('#add-location')
if (form != null) {
  var statusCombo = form.querySelector('[name="status"]')
  statusCombo.parentElement.parentElement.remove()

  const unities = document.querySelector('.form-bussines-unities')
  if (unities != null) {
    form.prepend(unities)
  }
}

form = document.querySelector('#update-location')
if (form != null) {
  locations.setData()
}

const businessUnitElement = document.querySelector('[name="business_unit"]')

var servicesTable = document.querySelector('#locations-registers')
if (servicesTable !== null) {
  $(function () {
    $('#locations-registers').dataTable(utils.getDataTableConfig())
  })

  var options = document.querySelectorAll('.delete')
  for (var i = 0, l = options.length; i < l; i++) {
    options[i].addEventListener('click', function (e) {
      e.preventDefault()

      var element = e.target
      if (!e.target.getAttribute('data-id')) {
        element = e.target.parentElement
      }

      var id = element.getAttribute('data-id')
      var url = apiHost + `locations/del/${id}`

      utils.api(JSON.stringify({}), url, 'DELETE', locations.delete, element)
    })
  }

  if (businessUnitElement != null) {
    businessUnitElement.addEventListener('change', (e) => {
      e.preventDefault()

      const table = $(servicesTable).DataTable()
      const option = e.target.options[e.target.selectedIndex]

      if (option.value !== '') {
        table.search(option.text).draw() // filter data by selected option
      } else {
        table.search('').draw() // reset table
      }
    })
  }
}

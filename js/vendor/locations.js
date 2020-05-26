'use strict'
var info
var form
var locationsData = window.locations
var userCreateId = window.user_create_id

var locations = {
  add: function (response) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)
    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
      _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    } else if (response.code === 201) {
      _message = utils.createElement('p', '', '', 'Success! Location added correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')

      form = document.querySelector('#add-location')
      form.reset()
    }
  },
  update: function (response) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)
    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
      _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    } else if (response.code === 204) {
      _message = utils.createElement('p', '', '', 'Success! Location updated correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  },
  delete: function (response, element) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)
    var id = element.getAttribute('data-id')
    element.style.display = 'none'

    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
      _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    } else if (response.code === 200) {
      var _status = document.querySelector(`[data-status="${id}"]`)
      _status.innerHTML = ''

      var label = utils.createElement('span', 'label label-danger', '', 'inactive')
      _status.appendChild(label)

      _message = utils.createElement('p', '', '', 'Success! Location inactivate correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  },
  setData () {
    document.querySelector('[name="name"]').value = locationsData.name
    document.querySelector('[name="unity"]').value = locationsData.unity
    document.querySelector('[name="available"]').value = locationsData.available
    document.querySelector('[name="status"]').value = locationsData.active
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function (e) {
    e.preventDefault()

    form = document.querySelector('#add-location')
    if (form != null) {

    }

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
        unity: document.querySelector('[name="unity"]').value,
        name: document.querySelector('[name="name"]').value,
        available: document.querySelector('[name="available"]').value
      }

      form = document.querySelector('#add-location')
      var url = ''

      if (form != null) {
        info.userCreateId = userCreateId
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

form = document.querySelector('#add-location')
if (form != null) {
  var statusCombo = form.querySelector('[name="status"]')
  statusCombo.parentElement.parentElement.remove()
}

form = document.querySelector('#update-location')
if (form != null) {
  locations.setData()
}

var servicesTable = document.querySelector('#locations-registers')
if (servicesTable !== null) {
  $(function () {
    $('#locations-registers').dataTable({
      sPaginationType: 'full_numbers',
      iDisplayLength: 20,
      aLengthMenu: [[20, 50, 100, -1], [20, 50, 100, 'All']]
    })
  })
}

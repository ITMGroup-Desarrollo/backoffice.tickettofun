'use strict'
var info
var form
var channelData = window.channel
var userCreateId = window.user_create_id

var channel = {
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
      _message = utils.createElement('p', '', '', 'Success! Channel added correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')

      form = document.querySelector('#add-channel')
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
      _message = utils.createElement('p', '', '', 'Success! Channel updated correctly')

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

      var label = utils.createElement('span', 'badge badge-danger', '', 'inactive')
      _status.appendChild(label)

      _message = utils.createElement('p', '', '', 'Success! Channel inactivate correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  },
  setData: function () {
    document.querySelector('[name="status"]').value = channelData.active
    document.querySelector('[name="channel_name"]').value = channelData.name
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function (e) {
    e.preventDefault()

    form = document.querySelector('#add-channel')
    if (form != null) {
      form.reset()
    }

    form = document.querySelector('#update-channel')
    if (form != null) {
      channel.setData()
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
        channel_name: document.querySelector('[name="channel_name"]').value
      }

      form = document.querySelector('#add-channel')

      if (form != null) {
        info.userCreateId = userCreateId
        var url = `${apiHost}channels/add`
        utils.api(JSON.stringify(info), url, 'POST', channel.add)
      }

      form = document.querySelector('#update-channel')

      if (form != null) {
        info.active_status = document.querySelector('[name="status"]').value

        url = `${apiHost}channels/edit/${channelData.id}`
        utils.api(JSON.stringify(info), url, 'PUT', channel.update)
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

    var url = `${apiHost}channels/del/${id}`
    utils.api(JSON.stringify({}), url, 'DELETE', channel.delete, element)
  })
}

form = document.querySelector('#add-channel')
if (form != null) {
  var statusCombo = form.querySelector('[name="status"]')
  statusCombo.parentElement.parentElement.remove()
}

form = document.querySelector('#update-channel')
if (form != null) {
  channel.setData()
}

var channelsTable = document.querySelector('#channels-registers')
if (channelsTable !== null) {
  $(function () {
    $('#channels-registers').dataTable({
      sPaginationType: 'full_numbers',
      iDisplayLength: 20,
      aLengthMenu: [[20, 50, 100, -1], [20, 50, 100, 'All']]
    })
  })
}

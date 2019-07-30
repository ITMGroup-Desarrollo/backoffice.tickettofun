'use strict'
var info
var form
var base = window.baseUrl
var token = window.token
var channelData = window.channel

var channel = {
  add: function(response) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)
    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (response.code == 400) {
      _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
    else if (response.code == 200) {
      _message = utils.createElement('p', '', '', 'Success!, channel added correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
      
      form = document.querySelector('#add-channel')
      form.reset();
    }
  },
  update: function(response) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)
    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (response.code == 400) {
      _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
    else if (response.code == 200) {
      _message = utils.createElement('p', '', '', 'Success!, channel updated correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  },
  delete: function(response, element) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)
    var id = element.getAttribute('data-id')
    element.style.display = 'none'

    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (response.code == 400) {
      _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
    else if (response.code == 200) {
      var _status = document.querySelector(`[data-status="${id}"]`)
      _status.innerHTML = ''

      var label = utils.createElement('span', 'label label-danger', '', 'inactive');
      _status.appendChild(label)

      _message = utils.createElement('p', '', '', 'Success!, channel inactivate correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  },
  setData: function() {
    document.querySelector('[name="status"]').value = channelData.active
    document.querySelector('[name="channel_name"]').value = channelData.name
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function(e) {
    e.preventDefault()

    form = document.querySelector('#add-channel')
    if (form != null)
      form.reset()

    form = document.querySelector('#update-channel')
      if (form != null)
        channel.setData()
  });
}

var save = document.querySelector('.save')
if (save != null) {
  save.addEventListener('click', function(e) {
    e.preventDefault()

    var valid = 'true'
    var fields = document.querySelectorAll('[data-validator]')

    valid = utils.dataValidator(fields)

    if(valid) {
      info = {
        channel_name: document.querySelector('[name="channel_name"]').value
      }

      form = document.querySelector('#add-channel')

      if (form != null) {
        var url = `${apiHost}/api/v1/channels/add`
        utils.api(JSON.stringify(info), url, 'POST', channels.add)
      }

      form = document.querySelector('#update-channel')

      if (form != null) {
        info.active_status = document.querySelector('[name="status"]').value

        var url = `${apiHost}/api/v1/channels/edit/${channelData.id}`
        utils.api(JSON.stringify(info), url, 'PUT', channel.update)
      }
    }
  })
}

var options = document.querySelectorAll('.delete')

for (var i = 0, l = options.length; i < l; i++) {
  options[i].addEventListener('click', function(e) {
    e.preventDefault()

    var element = e.target
    if (! e.target.getAttribute('data-id'))
      element = e.target.parentElement

    var id = element.getAttribute('data-id')

    var url = `${apiHost}/api/v1/channels/del/${id}`
    utils.api(JSON.stringify({}), url, 'DELETE', channel.delete, element)
  })
}

form = document.querySelector('#add-channel')
if (form != null) {
  var status_combo = form.querySelector('[name="status"]')
   status_combo.parentElement.parentElement.remove()
}

form = document.querySelector('#update-channel')
if (form != null)
  channel.setData()

var channelsTable = document.querySelector('#channels-registers')
if (channelsTable !== null) {
  $(function() {
    $('#channels-registers').dataTable({
        "sPaginationType": "full_numbers",
        "iDisplayLength": 20,
        "aLengthMenu": [[20, 50, 100, -1], [20, 50, 100, "All"]]
    });
  });
}

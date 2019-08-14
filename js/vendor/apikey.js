'use strict'
var info
var form
var base = window.baseUrl
var token = window.token
var apikeyData = window.apikey

var apikey= {
  add: function(response) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)
    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (codes.hasOwnProperty(response.code)) {
      _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
    else if (response.code == 201) {
      _message = utils.createElement('p', '', '', 'Success!, apikey added correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')

      form = document.querySelector('#add-apikey')
      form.reset();
    }
  },
  update: function(response) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)
    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (codes.hasOwnProperty(response.code)) {
      _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
    else if (response.code == 204) {
      _message = utils.createElement('p', '', '', 'Success!, apikey updated correctly')

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

    if (codes.hasOwnProperty(response.code)) {
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

      _message = utils.createElement('p', '', '', 'Success!, apikey inactivate correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  },
  setData: function(){
    document.querySelector('[name="key_description"]').value = apikeyData.description
    document.querySelector('[name="status"]').value = apikeyData.active
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function(e) {
    e.preventDefault()

    form = document.querySelector('#add-apikey')
    form.reset();
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
        app_name : document.querySelector('[name="key_description"]').value,
      }

      form = document.querySelector('#add-apikey')

      if (form != null) {
        if(document.querySelector('[name="user_id"]').value !== '')
          info.idUser = document.querySelector('[name="user_id"]').value

        var url = apiHost + 'apikeys/add'
        utils.api(JSON.stringify(info), url, 'POST', apikey.add)
      }

      form = document.querySelector('#update-apikey')

      if (form != null) {
        info.active_status = document.querySelector('[name="status"]').value

        var url = apiHost + `apikeys/edit/${apikeyData.id}`
        utils.api(JSON.stringify(info), url, 'PUT', apikey.update)
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
    var url = apiHost + `apikeys/del/${id}`
      utils.api(JSON.stringify({}), url, 'DELETE', apikey.delete, element)
  })
}

form = document.querySelector('#add-apikey')
if (form != null) {
  var status_combo = form.querySelector('[name="status"]')
  status_combo.parentElement.parentElement.remove()
}

form = document.querySelector('#update-apikey')
if (form != null){
  var description = form.querySelector('[name="key_description"]')
  description.setAttribute('readonly','readonly')

  var user_id = form.querySelector('[name="user_id"]');
  user_id.parentElement.parentElement.remove();
  apikey.setData();
}


var servicesTable = document.querySelector('#apikeys-registers')
if (servicesTable !== null) {
  $(function() {
    $('#apikeys-registers').dataTable({
        "sPaginationType": "full_numbers",
        "iDisplayLength": 20,
        "aLengthMenu": [[20, 50, 100, -1], [20, 50, 100, "All"]]
    });
  });
}

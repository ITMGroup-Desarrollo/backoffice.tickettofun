'use strict'
var info
var form
var base = window.baseUrl
var token = window.token
var userobj = window.user

var user= {
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
      _message = utils.createElement('p', '', '', 'Success!, user added correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
      
      form = document.querySelector('#add-user')
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
      _message = utils.createElement('p', '', '', 'Success!, user updated correctly')

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

      _message = utils.createElement('p', '', '', 'Success!, user inactivate correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function(e) {
    e.preventDefault()

    form = document.querySelector('#add-user')
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
        rol_id: document.querySelector('[name="rol"]').value,
        first_name: document.querySelector('[name="first_name"]').value,
        last_name: document.querySelector('[name="last_name"]').value,
        email_addr: document.querySelector('[name="email_addr"]').value,
      }

      form = document.querySelector('#add-user')

      if (form != null) {
        info.user_password = document.querySelector('[name="user_password"]').value

        var url = 'http://localhost:8181/api/v1/users/add'
        utils.api(JSON.stringify(info), url, 'POST', user.add)
      }

      form = document.querySelector('#update-user')

      if (form != null) {
        info.active_status = document.querySelector('[name="status"]').value

        var url = `http://localhost:8181/api/v1/users/edit/${user.id}`
        utils.api(JSON.stringify(info), url, 'PUT', user.update)
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
    var url = `http://localhost:8181/api/v1/users/del/${id}`
      utils.api(JSON.stringify({}), url, 'DELETE', user.delete, element)
  })
}

form = document.querySelector('#add-user')
if (form != null) {
  var status_combo = form.querySelector('[name="status"]')
  status_combo.parentElement.parentElement.style.display = 'none'
}

form = document.querySelector('#update-user')
if (form != null) {
  var password_input = form.querySelector('[name="user_password"]');
  password_input.parentElement.parentElement.style.display = 'none';

  document.querySelector('[name="status"]').value = userobj.active
  document.querySelector('[name="rol"]').value = userobj.rol
  document.querySelector('[name="first_name"]').value = userobj.first_name
  document.querySelector('[name="last_name"]').value = userobj.last_name
  document.querySelector('[name="email_addr"]').value = userobj.email_addr
}

var usersTable = document.querySelector('#users-registers')
if (usersTable !== null) {
  $(function() {
    $('#users-registers').dataTable({
        "sPaginationType": "full_numbers",
        "iDisplayLength": 20,
        "aLengthMenu": [[20, 50, 100, -1], [20, 50, 100, "All"]]
    });
  });
}

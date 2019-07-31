'use strict'
var info
var form
var base = window.baseUrl
var token = window.token
var profileData = window.profile

var profile = {

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
      _message = utils.createElement('p', '', '', 'Success!, profile updated correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  },

  setData: function() {
    document.querySelector('[name="rol"]').value = profileData.rol
    document.querySelector('[name="status"]').value = profileData.active
    document.querySelector('[name="last_name"]').value = profileData.last_name
    document.querySelector('[name="first_name"]').value = profileData.first_name
    document.querySelector('[name="email_addr"]').value = profileData.email_addr
  }
}

var cancel = document.querySelector('.cancel')

if (cancel != null) {
  cancel.addEventListener('click', function(e) {
    e.preventDefault()

    form = document.querySelector('#account-profile')
    if (form != null)
      user.setData()
  });
}

var saveprofile = document.querySelector('#account-profile .save')

if (saveprofile != null) {
  saveprofile.addEventListener('click', function(e) {
    e.preventDefault()

    var valid = 'true'
    var fields = document.querySelectorAll('#account-profile [data-validator]')

    valid = utils.dataValidator(fields)

    if(valid) {

      info = {
        rol_id: document.querySelector('[name="rol"]').value,
        first_name: document.querySelector('[name="first_name"]').value,
        last_name: document.querySelector('[name="last_name"]').value,
        email_addr: document.querySelector('[name="email_addr"]').value,
        active_status: document.querySelector('[name="status"]').value,
      }

      form = document.querySelector('#account-profile')

      if (form != null) {
        var url = `${apiHost}users/edit/${profileData.id}`
        utils.api(JSON.stringify(info), url, 'PUT', profile.update)
      }
    }
  })
}

var savepwd = document.querySelector('#account-pwd .save')
if (savepwd != null) {

  savepwd.addEventListener('click', function(e) {
    e.preventDefault()

    var valid = 'true'
    var fields = document.querySelectorAll('#account-pwd [data-validator]')

    valid = utils.dataValidator(fields)

    if(valid) {

      info = {
        user_password: document.querySelector('[name="user_password"]').value,
        confirm_password: document.querySelector('[name="confirm_password"]').value,
      }

      form = document.querySelector('#account-pwd')

      if (form != null) {

        if(info.user_password === info.confirm_password) {

          var url = `${apiHost}users/changepassword/${profileData.id}`
          utils.api(JSON.stringify(info), url, 'PUT', profile.update)

        } else {

           var _message = ''
           var _alertModal = document.getElementById('alert-modal-content')

          _message = utils.createElement('p', '', '', 'Error!, The password and the password confirmation do not match. Try again.')

          _alertModal.innerHTML = ''
          _alertModal.appendChild(_message)

          MicroModal.show('alert-modal')

        }
      }
    }

  })

}

form = document.querySelector('#account-profile')

if (form != null) {

  profile.setData()

}
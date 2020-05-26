'use strict'
var info
var form
var profileData = window.profile
var pathAvatar = window.pathAvatar

var profile = {

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
      _message = utils.createElement('p', '', '', 'Success! Profile updated correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  },

  setData: function () {
    document.querySelector('[name="rol"]').value = profileData.rol
    document.querySelector('[name="status"]').value = profileData.active
    document.querySelector('[name="last_name"]').value = profileData.last_name
    document.querySelector('[name="first_name"]').value = profileData.first_name
    document.querySelector('[name="email_addr"]').value = profileData.email_addr
    document.querySelector('[name="img-avatar"]').src = (profileData.avatar === '') ? pathAvatar + 'generic.jpg' : pathAvatar + profileData.avatar
    document.querySelector('[name="hidden-avatar"]').value = profileData.avatar
  },

  setAvatar: function (response) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)
    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
      _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
      document.querySelector('[name="avatar"]').value = ''
    } else if (response.code === 200) {
      var _inputFile = document.querySelector('[name="avatar"]')
      var _imgAvatar = document.querySelector('[name="img-avatar"]')
      var _reader = new FileReader()
      _reader.onloadend = function () {
        _imgAvatar.src = _reader.result
      }
      _reader.readAsDataURL(_inputFile.files[0])
      _inputFile.value = ''
      document.querySelector('[name="hidden-avatar"]').value = response.message
    }
  }
}

var cancel = document.querySelector('.cancel')

if (cancel != null) {
  cancel.addEventListener('click', function (e) {
    e.preventDefault()

    form = document.querySelector('#account-profile')
    if (form != null) {
      profile.setData()
    }
  })
}

var saveprofile = document.querySelector('#account-profile .save')

if (saveprofile != null) {
  saveprofile.addEventListener('click', function (e) {
    e.preventDefault()

    var valid = 'true'
    var fields = document.querySelectorAll('#account-profile [data-validator]')

    valid = utils.dataValidator(fields)

    if (valid) {
      info = {
        rol_id: document.querySelector('[name="rol"]').value,
        first_name: document.querySelector('[name="first_name"]').value,
        last_name: document.querySelector('[name="last_name"]').value,
        email_addr: document.querySelector('[name="email_addr"]').value,
        user_password: document.querySelector('[name="user_password"]').value,
        confirm_password: document.querySelector('[name="confirm_password"]').value,
        active_status: document.querySelector('[name="status"]').value,
        avatar: document.querySelector('[name="hidden-avatar"]').value
      }

      form = document.querySelector('#account-profile')

      if (form != null) {
        if (info.user_password !== info.confirm_password) {
          var _message = ''
          var _alertModal = document.getElementById('alert-modal-content')

          _message = utils.createElement('p', '', '', 'Error! The password and the password confirmation do not match. Try again.')

          _alertModal.innerHTML = ''
          _alertModal.appendChild(_message)

          MicroModal.show('alert-modal')
        } else {
          var url = `${apiHost}users/edit/${profileData.id}`
          utils.api(JSON.stringify(info), url, 'PUT', profile.update)

          profileData.last_name = document.querySelector('[name="last_name"]').value
          profileData.first_name = document.querySelector('[name="first_name"]').value
          profileData.email_addr = document.querySelector('[name="email_addr"]').value
        }
      }
    }
  })
}

form = document.querySelector('#account-profile')

if (form != null) {
  profile.setData()
}

var avatar = document.querySelector('[name="avatar"]')

avatar.addEventListener('change', function (e) {
  e.preventDefault()

  var url = `${apiHost}general/upload_avatar`
  var formAvatar = new FormData()
  var inputFile = document.querySelector('[name="avatar"]')

  formAvatar.append('user_id', profileData.id)
  formAvatar.append('newfile', inputFile.files[0])
  utils.api(formAvatar, url, 'POST', profile.setAvatar, null, 1)
})

'use strict'
var menu
var info
var base = window.baseUrl
var token = window.token

var app = {
  signin: function(response) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)

    if (response.code == 400) {
      var _alertModal = document.getElementById('alert-modal-content')
      var _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')

      document.querySelector('[name="user_mail"]').value = ''
      document.querySelector('[name="user_password"]').value = ''
    }

    if(response.code === 200) {
      var user = JSON.parse(response.message)

      info.remember = 0
      if(document.querySelector('[name="remember"]').checked)
        info.remember =  1

      info.user = user
      info.token = window.token

      console.log(info)
      var url = `${base}signin/set_data`
      utils.post(JSON.stringify(info), url, app.access)
    }
  },
  access: function() {
    location.href = 'users'
  },
  logout: function() {
    location.href = `${base}signin`
  },
  resetMenu: function (elements) {
    for (var i = 0, l = elements.length; i < l; i++) {
      elements[i].classList.remove('toggled')
    }
  },
  hiddenMenu: function(elements) {
    for (var i = 0, l = elements.length; i < l; i++) {
      elements[i].style.display = 'none'
    }
  },
  sidebar: function(menu) {
    var dropdownTriggers = menu.querySelectorAll('[data-toggle="sidebar"]')
    for (var i = 0, l = dropdownTriggers.length; i < l; i++) {
      dropdownTriggers[i].classList.add('menu-item')
      dropdownTriggers[i].addEventListener('click', function (e) {
        e.preventDefault()

        var element = e.target
        if (! e.target.getAttribute('data-toggle'))
          element = e.target.parentElement

        // collapse himself
        if (element.classList.contains('toggled')) {
          element.classList.remove('toggled')

          var submenu = element.parentElement.querySelector('.submenu')
            submenu.style.display = 'none'
        }
        else {
          // reset other menus
          app.resetMenu(menu.querySelectorAll('.menu-item'))
          app.hiddenMenu(menu.querySelectorAll('.submenu'))

          element.classList.add('toggled')

          var submenu = element.parentElement.querySelector('.submenu')
          submenu.style.display = 'block'
        }
      })
    }
  }
}

var login = document.querySelector('[name="signin"]')
if (login !== null) {
  login.addEventListener('click', function (e) {
    e.preventDefault()

    var valid = 'true'
    var fields = document.querySelectorAll('[data-validator]')

    valid = utils.dataValidator(fields)

    if(valid) {
      info = {
        email: document.querySelector('[name="user_mail"]').value,
        password: document.querySelector('[name="user_password"]').value,
      }

      var url = 'http://localhost:8181/auth/login'
      utils.api(JSON.stringify(info), url, 'POST', app.signin)
    }
  })
}

var logout = document.querySelector('[class="signout"]')
if (logout !== null) {
  logout.addEventListener('click', function (e) {
    var url = `${base}signin/logout`
    utils.post(null, url, app.logout)
  })
}

var accountMenu = document.querySelector('.current-user')
if (accountMenu !== null) {
  accountMenu.addEventListener('click', function (e) {
    e.preventDefault()

    var element = document.querySelector('.current-user')

    menu = element.querySelector('.menu')
    if (menu.classList.contains('active')) {
      menu.classList.remove('active')
    }
    else {
      menu.classList.add('active')
    }
  })
}

MicroModal.init()

utils.buildModal('alert-modal', true, true)
utils.buildModal('wait-modal', false, false)

var waitModal = document.getElementById('wait-modal-content')
var waitMessage = utils.createElement(
  'strong',
  '',
  '',
  'Please wait!, we are processing your information'
)

waitModal.appendChild(waitMessage)

var menu = document.querySelector('.main-sidebar')
if (menu !== null)
  app.sidebar(menu)

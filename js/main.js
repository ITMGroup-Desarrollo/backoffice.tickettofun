'use strict'
var menu
var info
var base = window.baseUrl
var token = window.token
var apiHost = `${window.api_host}api/v1/`

var codes = {
  400: 1,
  404: 1,
  422: 1,
  500: 1
}

var app = {
  signin: function (response) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)

    if (response.code !== 200) {
      var _alertModal = document.getElementById('alert-modal-content')
      var _message = utils.createElement('p', '', '', 'Login failed: Email or password incorrect.')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')

      document.querySelector('[name="user_mail"]').value = ''
      document.querySelector('[name="user_password"]').value = ''
    }

    if (response.code === 200) {
      var user = JSON.parse(response.message)

      info.remember = 0
      if (document.querySelector('[name="remember"]').checked) {
        info.remember = 1
      }

      info.user = user
      info.token = window.token

      var url = `${base}signin/set_data`
      utils.post(JSON.stringify(info), url, app.access, user.page_default)
    }
  },
  access: function (response, redirect) {
    window.location.href = redirect
  },
  logout: function () {
    window.location.href = `${base}signin`
  },
  resetMenu: function (elements) {
    for (var i = 0, l = elements.length; i < l; i++) {
      elements[i].classList.remove('toggled')
    }
  },
  hiddenMenu: function (elements) {
    for (var i = 0, l = elements.length; i < l; i++) {
      elements[i].style.display = 'none'
    }
  },
  sidebar: function (menu) {
    var dropdownTriggers = menu.querySelectorAll('[data-toggle="sidebar"]')
    for (var i = 0, l = dropdownTriggers.length; i < l; i++) {
      dropdownTriggers[i].classList.add('menu-item')
      dropdownTriggers[i].addEventListener('click', function (e) {
        e.preventDefault()

        var element = e.target
        if (!e.target.getAttribute('data-toggle')) {
          element = e.target.parentElement
        }
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

          submenu = element.parentElement.querySelector('.submenu')
          submenu.style.display = 'block'
        }
      })
    }

    // mobile sidebar toggler
    var mobileMenu = document.querySelector('#content .sidebar-toggler')
    mobileMenu.addEventListener('click', function (e) {
      e.stopPropagation()

      document.body.classList.add('open-sidebar')
    })

    var content = document.querySelector('#content')
    content.addEventListener('click', function (e) {
      document.body.classList.remove('open-sidebar')
    })
  }
}

var login = document.querySelector('[name="signin"]')
if (login !== null) {
  login.addEventListener('click', function (e) {
    e.preventDefault()

    var valid = 'true'
    var fields = document.querySelectorAll('[data-validator]')

    valid = utils.dataValidator(fields)

    if (valid) {
      info = {
        email: document.querySelector('[name="user_mail"]').value,
        password: document.querySelector('[name="user_password"]').value
      }

      var url = `${window.api_host}auth/login`
      utils.api(JSON.stringify(info), url, 'POST', app.signin)
    }
  })
}

var logouts = document.querySelectorAll('[class="signout"]')
if (logouts.length > 0) {
  for (var i = 0, l = logouts.length; i < l; i++) {
    logouts[i].addEventListener('click', function (e) {
      var url = `${base}signin/logout`
      utils.post(null, url, app.logout)
    })
  }
}

var account = document.querySelector('.current-user .name')
if (account !== null) {
  account.addEventListener('click', function (e) {
    e.preventDefault()
    e.stopPropagation()

    var menu = document.querySelector('.current-user .menu')
    menu.classList.add('active')
  })

  document.body.addEventListener('click', function (e) {
    document.querySelector('.menu').classList.remove('active')
  })
}

MicroModal.init()

utils.buildModal('alert-modal', true, true)
utils.buildModal('wait-modal', false, false)
utils.buildModal('confirm-modal', true, true)

var waitModal = document.getElementById('wait-modal-content')
var waitMessage = utils.createElement(
  'strong',
  '',
  '',
  'Please wait!, we are processing your information'
)

waitModal.appendChild(waitMessage)

menu = document.querySelector('.main-sidebar')
if (menu !== null) {
  app.sidebar(menu)
}

'use strict'

var utils = {
  loadJs: function loadJs (file) {
    (function (d, t) {
      var s = d.createElement(t)
      s.src = `./assets/js/${file}.js`
      s.onload = s.onreadystatechange = function () {
        var rs = this.readyState
        if (rs) if (rs !== 'complete') if (rs !== 'loaded') return
      }

      var src = d.getElementsByTagName(t)[0]
      var par = src.parentNode
      par.insertBefore(s, src)
    })(document, 'script')
  },
  api: function (data, endpoint, httpverb, method, element,contentType) {
    if (method !== null) MicroModal.show('wait-modal')

    var xHR = new XMLHttpRequest()

    xHR.onreadystatechange = function () {
      if (xHR.readyState == 4) {
        if (xHR.status == 204) {
          var response = {
            code: 204,
            status: 'success'
          }

          if (method !== null)
            method(JSON.stringify(response), element)
        }
        else if (method !== null)
          method(xHR.response, element)
      }
    }

    xHR.open(httpverb, endpoint, true)

    if(typeof contentType === 'undefined')
      xHR.setRequestHeader('Content-Type', 'application/json')

    xHR.setRequestHeader('Authorization', token)
    xHR.withCredentials = true
    xHR.send(data)
  },
  post: function (data, endpoint, method, element) {
    if (method !== null) MicroModal.show('wait-modal')

    var xHR = new XMLHttpRequest()

    xHR.onreadystatechange = function () {
      if (xHR.readyState === 4) {
        if (xHR.status === 200) {
          if (method !== null) {
            method(xHR.response, element)
          }
        }
      }
    }

    xHR.open('POST', endpoint, true)
    xHR.setRequestHeader('Content-Type', 'application/json')
    xHR.send(data)
  },
  buildModal: function (id, cnHeader, cnButton) {
    var title = `${id}-title`
    var footer = `${id}-footer`
    var content = `${id}-content`

    var masterContent = this.createElement('div', 'modal micromodal-slide', id)
    masterContent.setAttribute('aria-hidden', true)

    var overlayContent = this.createElement('div', 'modal__overlay')
    overlayContent.setAttribute('tabindex', '-1')
    overlayContent.setAttribute('data-micromodal-close', '')

    var roleContent = this.createElement('div', 'modal__container')
    roleContent.setAttribute('role', 'dialog')
    roleContent.setAttribute('aria-modal', 'true')
    roleContent.setAttribute('aria-modal', content)
    roleContent.setAttribute('aria-labellebdy', title)

    var header = this.createElement('header', 'modal__header')

    if (cnHeader === true) {
      title = this.createElement('h3', 'modal__title', title, '')

      header.appendChild(title)

      var closeButton = this.createElement('button', 'modal__close')
      closeButton.setAttribute('aria-controls', id)
      closeButton.setAttribute('aria-label', 'Close modal')
      closeButton.setAttribute('data-micromodal-close', '')
      closeButton.setAttribute('style', 'padding: 0')

      header.appendChild(closeButton)
    }

    footer = this.createElement('footer', 'modal_footer text-center', footer)
    content = this.createElement('div', 'modal__content', content)

    if (cnButton === true) {
      if (id === 'confirm-modal') {
        var cancelButton = this.createElement(
          'button',
          'btn btn-default',
          '',
          'Cancel'
        )

        cancelButton.setAttribute('aria-label', 'Close modal')
        cancelButton.setAttribute('data-micromodal-close', '')
        cancelButton.setAttribute('style', 'margin-right: 20px');
        footer.appendChild(cancelButton)
      }

      var acceptButton = this.createElement(
        'button',
        'btn btn-outline-warning' + (id === 'confirm-modal'? ' confirm-delete': ''),
        '',
        'Aceptar'
      )

      acceptButton.setAttribute('aria-controls', id)
      acceptButton.setAttribute('aria-label', 'Close modal')
      acceptButton.setAttribute('data-micromodal-close', '')

      footer.appendChild(acceptButton)
    }

    roleContent.appendChild(header)
    roleContent.appendChild(content)
    roleContent.appendChild(footer)
    overlayContent.appendChild(roleContent)
    masterContent.appendChild(overlayContent)

    document.body.appendChild(masterContent)
  },
  createElement: function (tag, className, idName, content) {
    var e = document.createElement(tag)

    if (className !== undefined) e.className = className

    if (idName !== undefined) e.id = idName

    if (content !== undefined) e.innerHTML = content

    return e
  },
  buildOptions: function (data, options) {
    const key = data.key
    const value = data.value
    const element = data.element

    var index = 1
    for (var i in options) {
      element.append(new Option(options[i][key], options[i][value]))
      element.options.item(index++).setAttribute('id', options[i][value])
    }

    if (data.id !== null){
      element.options.namedItem(data.id).selected = true
    }

  },
  dataValidator: function (fields) {
    var valid = 'true'

    for (var i = 0, l = fields.length; i < l; i++) {
      fields[i].value = fields[i].value.trim()

      if (fields[i].getAttribute('data-validator').split('^').length > 1) {
        var options = fields[i].getAttribute('data-validator').split('^')
        var messages = fields[i].getAttribute('data-validator-msg').split('^')

        for (var j = 0, k = options.length; j < k; j++) {
          if (options[j] === 'optional' && fields[i].value === '')
            j = options.length + 1

          valid = validator.isValid(fields[i], options[j], messages[j])

          if (!valid && options[j] !== 'optional')
            return false
        }
      } else {
        valid = validator.isValid(fields[i],
          fields[i].getAttribute('data-validator')
        )

        if (!valid)
          return false
      }
    }
    return valid
  },
  isJson: function (str) {
    try {
      JSON.parse(str)
    } catch (e) {
      return false
    }
    return true
  }
}

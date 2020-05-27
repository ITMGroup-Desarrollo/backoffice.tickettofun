'use strict'

var validator = {
  rgx: {
    number: /^\d+$/,
    empty: /([^\s])/,
    space: /\s+abc/,
    phoneLength: /^\d{10}$/,
    phone: /^(\d)(?!\1+$)\d*$/,
    fileFormat: /\.(jpg|jpeg|png|pdf)$/i,
    fileSize: /([^\s])/,
    mail: /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i,
    timeFormat: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  cssClass: {
    button: 'btn btn-outline-warning'
  },
  isValid: function (element, option, msg) {
    if ((Object.prototype.hasOwnProperty.call(this.rgx, option))) {
      if (element.type === 'file' && option === 'fileSize') {
        if (element.files[0].size / 1024 > 1024) {
          element.value = ''
        }
      }

      if (element.type !== 'file') {
        element.value = element.value.replace(this.rgx.space, '')
      }

      if (!this.rgx[option].test(element.value)) {
        var content = document.getElementById('alert-modal-content')
        content.innerText = ''

        var footerContent = document.getElementById('alert-modal-footer')
        footerContent.innerText = ''

        var acceptButton = utils.createElement(
          'button',
          this.cssClass.button,
          '',
          'Aceptar'
        )

        validator.setFocus(`${element.name}`)

        acceptButton.setAttribute('aria-label', 'Close modal')
        acceptButton.setAttribute('aria-controls', 'alert-modal')
        acceptButton.setAttribute('data-micromodal-close', '')

        if (typeof msg === 'undefined') {
          msg = element.getAttribute('data-validator-msg')
        }

        var leyendMessage = utils.createElement('p', '', '', msg)

        content.appendChild(leyendMessage)
        footerContent.appendChild(acceptButton)

        MicroModal.show('alert-modal')
        return false
      }
    }

    return true
  },
  setFocus: function (name) {
    var element = document.querySelector(`[name="${name}"]`)

    element.value = ''
    element.focus()
  }
}

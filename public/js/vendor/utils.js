'use strict'

var permissions = {
  g: 0,
  gElement: '',
  i: 0,
  iElement: '',
  u: 0,
  uElement: '',
  d: 0,
  dElement: ''
}

var utils = {
  loadJs: function (file) {
    (function (d, t) {
      var s = d.createElement(t)
      s.src = `./assets/js/${file}.js`
      s.onload = s.onreadystatechange = function () {
        var rs = this.readyState
        if (rs) if (rs !== 'complete') if (rs !== 'loaded') {}
      }

      var src = d.getElementsByTagName(t)[0]
      var par = src.parentNode
      par.insertBefore(s, src)
    })(document, 'script')
  },
  api: function (data, endpoint, httpverb, method, element, contentType) {
    var token = window.token

    if (method !== null)
      MicroModal.show('wait-modal')

    var xHR = new XMLHttpRequest()

    xHR.onreadystatechange = function () {
      if (xHR.readyState === 4) {
        if (xHR.status === 204) {
          var response = {
            code: 204,
            status: 'success'
          }

          if (method !== null) {
            method(JSON.stringify(response), element)
          }
        } else if (method !== null) {
          method(xHR.response, element)
        }
      }
    }

    xHR.open(httpverb, endpoint, true)

    if (typeof contentType === 'undefined') {
      xHR.setRequestHeader('Content-Type', 'application/json')
    }

    xHR.setRequestHeader('Authorization', token)
    xHR.mode = 'cors'
    xHR.withCredentials = true
    xHR.send(data)
  },
  fetchApi: async function(data, endpoint, httpverb, method, element) {
    try {
      if (method !== null) {
        MicroModal.show('wait-modal')
      }

      const fetchConfig =  {
        method: httpverb,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': window.token,
        },
        mode: 'cors',
        credentials: 'include'
      }

      if (httpverb != 'GET') {
        fetchConfig.body = data
      }

      const response = await fetch(endpoint, fetchConfig);

      let result
      let code = 200

      if (response.ok) {
        result = await response.json();
      } else {
        code = response.status;
      }

      method(result, code, element)
    } catch (error) {
      utils.displayModal(alertModal)
    }
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
  filterQueryParams: (info) => {
    let params = '';
    Object.keys(info).forEach(function (key) {
      if (info[key] !== null) {
        params += `filter[${key}]=${info[key]}&`
      }
    });

    params = params.slice(0, -1)

    return params
  },
  getLocations: (unitId, locationsElement, method) => {
    const filters = {
      unities: unitId
    }

    let url = `${apiHost}locations`
    let params = utils.filterQueryParams(filters)

    url = `${url}?${params}`

    utils.fetchApi(JSON.stringify({}), url, 'GET', method, locationsElement)
  },
  setPermissions: function (response) {
    try {
      response = JSON.parse(response)
      if (!Object.prototype.hasOwnProperty.call(codes, response.code)) {
        permissions = response.message
      }
    } catch (e) {
      utils.displayModal(alertModal, '')
    }
  },
  displayModal: function (id, message) {
    var _modal = document.getElementById(`${id}-content`)

    // Default message
    var _message = utils.createElement('p', '', '', 'Something wrong!!!')
    if (message !== '') {
      _message = utils.createElement('p', '', '', message)
    }

    _modal.innerHTML = ''
    _modal.appendChild(_message)

    MicroModal.show(id)
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
        cancelButton.setAttribute('style', 'margin-right: 20px')
        footer.appendChild(cancelButton)
      }

      var acceptButton = this.createElement(
        'button',
        'btn btn-outline-warning' + (id === 'confirm-modal' ? ' confirm-delete' : ''),
        '',
        'Accept'
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
  buildOptions: function (data, options, index) {
    const key = data.key
    const value = data.value
    const element = data.element

    if (!Number.isInteger(index)) {
      index = 0
    }

    if (Object.prototype.hasOwnProperty.call('active_status', options[0])) {
      for (var i in options) {
        if (options[i]['active_status'] === 1) {
          element.append(new Option(options[i][key], options[i][value]))
          element.options.item(index).setAttribute('id', options[i][value])

          if (typeof data.extraData === 'object' && data.extraData !== null) {
            for (var [k, v] of Object.entries(data.extraData)) {
              element.options.item(index).setAttribute(k, v)
            }
          }
        }

        index++
      }
    } else {
      for (var i in options) {
        element.append(new Option(options[i][key], options[i][value]))
        element.options.item(index).setAttribute('id', options[i][value])

        if (typeof data.extraData === 'object' && data.extraData !== null) {
          for (var [k, v] of Object.entries(data.extraData)) {
            element.options.item(index).setAttribute(k, v)
          }
        }

        index++
      }
    }

    if (Number.isInteger(data.id) && data.id !== null) {
      element.options.namedItem(data.id).selected = true
    }
  },
  removeOptions: function (element, index) {
    const l = element.options.length

    for (let i = l; i > 0; i--) {
      if (i !== index) {
        element.remove(i)
      }
    }
  },
  dataValidator: function (fields) {
    var valid = 'true'

    for (var i = 0, l = fields.length; i < l; i++) {
      var hidden = true
      var parent = fields[i].closest('.form-group')

      if (parent != null && parent.classList.contains('d-none')) {
        hidden = false
      }

      if (hidden) {
        fields[i].value = fields[i].value.trim()

        if (fields[i].getAttribute('data-validator').split('^').length > 1) {
          var options = fields[i].getAttribute('data-validator').split('^')
          var messages = fields[i].getAttribute('data-validator-msg').split('^')

          for (var j = 0, k = options.length; j < k; j++) {
            if (options[j] === 'optional' && fields[i].value === '') {
              j = options.length + 1
            }

            valid = validator.isValid(fields[i], options[j], messages[j])

            if (!valid && options[j] !== 'optional') {
              return false
            }
          }
        } else {
          valid = validator.isValid(fields[i],
            fields[i].getAttribute('data-validator')
          )

          if (!valid) {
            return false
          }
        }
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
  },
  getDate: function (addDay) {
    var presentDate = new Date()

    if (!Number.isInteger(addDay)) {
      addDay = 0
    }

    presentDate.setDate(presentDate.getDate() + addDay)

    return utils.dateFormat('Y-m-d', presentDate)
  },
  dateFormat: function (frmt, dateObj) {
    const formats = {
      // full year e.g. 2016
      Y: function (date) {
        return date.getFullYear()
      },

      // day in month, padded (01-30)
      d: function (date) {
        return formats.pad(formats.j(date))
      },

      // day in month (1-30)
      j: function (date) {
        return date.getDate()
      },

      // padded month number (01-12)
      m: function (date) {
        return formats.pad(formats.n(date))
      },

      // the month number (1-12)
      n: function (date) {
        return date.getMonth() + 1
      },

      pad: function (number) {
        return ('0' + number).slice(-2)
      }
    }

    var chars = frmt.split('')
    return chars.map(function (c, i) {
      return formats[c] && chars[i - 1] !== '\\' ? formats[c](dateObj) : c !== '\\' ? c : ''
    }).join('')
  },
  getDataTableConfig: function () {
    const configDataTable = {
            fixedHeader: true,
      iDisplayLength: 20,
      sPaginationType: 'full_numbers',
      aLengthMenu: [[20, 50, 100, -1], [20, 50, 100, 'All']]
    }

    return configDataTable
  },
  dropTable: function (table) {
    if (table !== null && $.fn.dataTable.isDataTable(table)) {
      $(table)
        .DataTable()
        .destroy()

      table.parentNode.removeChild(table)
    } else if (table !== null) {
      table.remove()
    }
  },
  addStatusFormat: function (status, id) {
    var textStatus = 'Active'
    var labelStatus = 'success'

    if (status === 0) {
      labelStatus = 'danger'
      textStatus = 'Inactive'
    }

    let statusElement = permissions.statusElement.replace('{status}', labelStatus)
    statusElement = statusElement.replace('{s_text}', textStatus)
    statusElement = statusElement.replace('{status_value}', id)

    return statusElement
  },
  getActionButtons: function (id) {
    const regexId = /{id}/gi

    var actions = ''
    if (permissions.i === 1) {
      actions = `${actions} ${permissions.iElement.replace(regexId, id)}`
    }

    if (permissions.u === 1) {
      actions = `${actions} ${permissions.uElement.replace(regexId, id)}`
    }

    if (permissions.d === 1) {
      actions = `${actions} ${permissions.dElement.replace(regexId, id)}`
    }

    return actions
  }
}

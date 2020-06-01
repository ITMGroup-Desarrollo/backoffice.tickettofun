'use strict'
var info
var form
var id = ''
var url = ''
var user = window.user
var equivalencesData = window.equivalences

var equivalences = {
  add: function (response) {
    try {
      MicroModal.close('wait-modal')

      response = JSON.parse(response)

      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        utils.displayModal(alertModal, response.message)
      } else if (response.code === 201) {
        utils.displayModal(alertModal, 'Success! Equivalence added correctly')
      }

      document.querySelector('#add-equivalence').reset()
    } catch (e) {
      utils.displayModal(alertModal, '')
    }
  },
  update: function (response) {
    try {
      MicroModal.close('wait-modal')

      response = JSON.parse(response)

      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        utils.displayModal(alertModal, response.message)
      } else if (response.code === 204) {
        utils.displayModal(alertModal, 'Success! Equivalence updated correctly')
      }
    } catch (e) {
      utils.displayModal(alertModal, '')
    }
  },
  delete: function (response, element) {
    try {
      MicroModal.close('wait-modal')

      response = JSON.parse(response)

      id = element.getAttribute('data-id')
      element.style.display = 'none'

      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        utils.displayModal(alertModal, response.message)
      } else if (response.code === 200) {
        utils.displayModal(alertModal, 'Success! Equivalence inactivate correctly')

        var _status = document.querySelector(`[data-status="${id}"]`)
        _status.innerHTML = ''

        var label = utils.createElement('span', 'badge badge-danger', '', 'Inactive')
        _status.appendChild(label)
      }
    } catch (e) {
      utils.displayModal(alertModal, '')
    }
  },
  setData: function () {
    document.querySelector('[name="vendor"]').value = equivalencesData.vendor
    document.querySelector('[name="service"]').value = equivalencesData.service
    document.querySelector('[name="code"]').value = equivalencesData.code
    document.querySelector('[name="service_name"]').value = equivalencesData.service_reseller
    document.querySelector('[name="status"]').value = equivalencesData.active
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function (e) {
    e.preventDefault()

    form = document.querySelector('#add-equivalence')
    if (form != null) {
      form.reset()
    }

    form = document.querySelector('#update-equivalence')
    if (form != null) {
      equivalences.setData()
    }
  })
}

var save = document.querySelector('.save')
if (save != null) {
  save.addEventListener('click', function (e) {
    e.preventDefault()

    var valid = 'true'
    var fields = document.querySelectorAll('[data-validator]')

    valid = utils.dataValidator(fields)

    if (valid) {
      info = {
        code: document.querySelector('[name="code"]').value,
        service_id: document.querySelector('[name="service"]').value,
        reseller_id: document.querySelector('[name="vendor"]').value,
        service_name: document.querySelector('[name="service_name"]').value
      }

      form = document.querySelector('#add-equivalence')

      if (form != null) {
        info.user_id = user
        url = `${apiHost}equivalences/add`
        utils.api(JSON.stringify(info), url, 'POST', equivalences.add)
      }

      form = document.querySelector('#update-equivalence')
      if (form != null) {
        info.active_status = document.querySelector('[name="status"]').value

        url = `${apiHost}equivalences/edit/${equivalencesData.id}`
        utils.api(JSON.stringify(info), url, 'PUT', equivalences.update)
      }
    }
  })
}

var options = document.querySelectorAll('.delete')
for (var i = 0, l = options.length; i < l; i++) {
  options[i].addEventListener('click', function (e) {
    e.preventDefault()

    var element = e.target
    if (!e.target.getAttribute('data-id')) {
      element = e.target.parentElement
    }

    id = element.getAttribute('data-id')
    url = `${apiHost}equivalences/del/${id}`

    utils.api(JSON.stringify({}), url, 'DELETE', equivalences.delete, element)
  })
}

form = document.querySelector('#add-equivalence')
if (form != null) {
  var statusCombo = form.querySelector('[name="status"]')
  statusCombo.parentElement.parentElement.remove()
}

form = document.querySelector('#update-equivalence')
if (form != null) {
  equivalences.setData()
}

var servicesTable = document.querySelector('#equivalences-registers')
if (servicesTable !== null) {
  $(function () {
    var config = utils.getDataTableConfig()
    config.order = [[1, 'asc']]
    $('#equivalences-registers').dataTable(config)
  })
}

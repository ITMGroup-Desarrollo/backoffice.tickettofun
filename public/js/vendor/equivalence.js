'use strict'
var info
var form
var id = ''
var url = ''
var userCreateId = window.user
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
    document.querySelector('[name="lmps-code"]').value = equivalencesData.lmps_code
    document.querySelector('[name="service_name"]').value = equivalencesData.service_reseller
    document.querySelector('[name="status"]').value = equivalencesData.active
  },
  serviceList: (response, element) => {
    try {
      MicroModal.close('wait-modal')
      response = JSON.parse(response)

      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
         if (response.code === 404) {
          utils.displayModal(alertModal, 'Not found services')
        } else {
          utils.displayModal(alertModal, response.message)
        }
      } else {
        const data = {
          key: 'service_name',
          value: 'service_id',
          element: element
        }
        console.log(element)
        response.message = response.message.filter((row) => {
          return row.active_status == 1
        })

        utils.buildOptions(data, response.message, 1)
      }
    } catch (e) {
      console.log(e)
      utils.displayModal(alertModal, '')
    }
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
        user_create_id: userCreateId,
        code: document.querySelector('[name="code"]').value,
        lmps_code: document.querySelector('[name="lmps-code"]').value,
        service_id: document.querySelector('[name="service"]').value,
        reseller_id: document.querySelector('[name="vendor"]').value,
        service_name: document.querySelector('[name="service_name"]').value
      }

      form = document.querySelector('#add-equivalence')

      if (form != null) {
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

  const unities = document.querySelector('.form-bussines-unities')
  if (unities != null) {
    form.prepend(unities)
  }

  const service = document.querySelector('[name="service"]')
  utils.removeOptions(service, 0)

  unities.addEventListener('change', (e) => {
    e.preventDefault()

    const service = document.querySelector('[name="service"]')
    utils.removeOptions(service, 0)

    if (e.target.value !== '') {
      const info = {
        unities: e.target.value
      }

      const params = utils.filterQueryParams(info)

      utils.api(JSON.stringify({}), `${apiHost}service/list?${params}`, 'GET', equivalences.serviceList, service)
    }
  })
}

form = document.querySelector('#update-equivalence')
if (form != null) {
  equivalences.setData()
}

const businessUnitElement = document.querySelector('[name="business_unit"]')

var servicesTable = document.querySelector('#equivalences-registers')
if (servicesTable !== null) {
  $(function () {
    var config = utils.getDataTableConfig()
    config.order = [[1, 'asc']]
    $('#equivalences-registers').dataTable(config)
  })

  if (businessUnitElement != null) {
    businessUnitElement.addEventListener('change', (e) => {
      e.preventDefault()

      const table = $(servicesTable).DataTable()
      const option = e.target.options[e.target.selectedIndex]

      if (option.value !== '') {
        table.search(option.text).draw() // filter data by selected option
      } else {
        table.search('').draw() // reset table
      }
    })
  }
}

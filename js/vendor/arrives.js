'use strict'
var id
var url
var form
var data
var initialOptions
var user = window.user
var configTable = utils.getDataTableConfig()

const arrives = {
  list: {
    init: function () {
      utils.post(JSON.stringify(
        { table: 'arrives' }),
        `${base}users/permissions`,
        utils.setPermissions
      )

      var searchBtn = document.querySelector('.search')
      var ship = document.querySelector('[name="ship"]')
      var dateRange = document.querySelector('.date-range')
      var reseller = document.querySelector('[name="reseller"]')

      if (reseller !== null && ship !== null) {
        initialOptions = ship.innerHTML
        reseller.addEventListener('change', function (e) {
          e.preventDefault()

          id = e.target.value
          utils.removeOptions(ship, 0)

          if (id !== '') {
            url = `${apiHost}arrives/shipsarrive/${id}`
            utils.api(JSON.stringify({}), url, 'GET', arrives.list.addShips, ship)
          } else {
            ship.innerHTML = initialOptions
          }
        })
      }

      if (dateRange !== null) {
        dateRange.flatpickr({
          mode: 'range',
          dateFormat: 'Y-m-d',
          defaultDate: [new Date(), new Date().fp_incr(1)]
        })
      }

      if (searchBtn !== null) {
        searchBtn.addEventListener(clickEvent, (e) => {
          e.preventDefault()
          arrives.list.load(ship, reseller)
        })
      }

      var confirmModal = document.getElementById('confirm-modal')
      if (confirmModal !== null) {
        var message = utils.createElement('p', '', '', 'Are you sure to delete this call?')

        var content = confirmModal.querySelector('#confirm-modal-content')
        var btnConfirm = confirmModal.querySelector('.confirm-delete')

        content.innerHTML = ''
        content.appendChild(message)

        btnConfirm.addEventListener(clickEvent, (e) => {
          e.preventDefault()

          var idArrive = e.target.getAttribute('data-id')
          url = `${apiHost}arrives/del/${idArrive}`

          utils.api(JSON.stringify({ user: user }), url, 'DELETE', arrives.list.delete, e.target)
        })
      }

      arrives.list.load(ship, reseller)
    },
    load: function (ship, reseller) {
      var info = {}
      url = `${apiHost}arrives`

      const idShip = parseInt(ship.value, 10)
      const idReseller = parseInt(reseller.value, 10)
      var dates = document.querySelector('[name="dates"]').value

      if (dates.trim() !== '') {
        var aDates = dates.split(' to ')

        info.start_date = aDates[0]
        info.end_date = aDates[0]
        if (aDates.length === 2) {
          info.end_date = aDates[1]
        }
      } else {
        info.start_date = utils.getDate()
        info.end_date = utils.getDate(1)
      }

      if (Number.isInteger(idReseller) && idReseller > 0 && !Number.isInteger(idShip)) {
        url = `${url}/reseller/${idReseller}`
      } else if (Number.isInteger(idShip) && idShip > 0) {
        url = `${url}/ship/${idShip}`
      }

      utils.api(JSON.stringify(info), url, 'POST', arrives.list.deploy)
    },
    deploy: function (response) {
      try {
        MicroModal.close('wait-modal')
        response = JSON.parse(response)

        if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
          if (response.code === 404) {
            utils.displayModal(alertModal, 'Not found calls with the selected data')
          } else {
            utils.displayModal(alertModal, response.message)
          }
        } else {
          var registers = response.message

          utils.dropTable(document.querySelector('#arrives-registers'))

          configTable = arrives.list.getTableConfig(registers)
          const content = document.querySelector('.table-arrives')
          const nodeTable = utils.createElement('table', '', 'arrives-registers', '')

          content.appendChild(nodeTable)

          $(nodeTable).DataTable(configTable).draw()

          var deleteBtns = document.querySelectorAll('.delete')
          for (let i = 0, l = deleteBtns.length; i < l; i++) {
            deleteBtns[i].addEventListener(clickEvent, (e) => {
              e.preventDefault()

              let element = e.target
              var btnConfirm = document.querySelector('.confirm-delete')

              if (!e.target.getAttribute('data-id')) {
                element = e.target.parentElement
              }

              btnConfirm.setAttribute('data-id', element.getAttribute('data-id'))
              MicroModal.show('confirm-modal')
            })
          }
        }
      } catch (e) {
        console.log(e)
        utils.displayModal(alertModal, '')
      }
    },
    delete: function (response, element) {
      try {
        MicroModal.close('wait-modal')

        response = JSON.parse(response)
        if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
          utils.displayModal(alertModal, response.message)
        } else {
          utils.displayModal(alertModal, 'Success! Cruise call date inactive correctly')

          id = element.getAttribute('data-id')
          var statusLabel = document.querySelector(`[data-status="${id}"]`)

          statusLabel.classList.add('badge-danger')
          statusLabel.classList.remove('badge-success')
        }
      } catch (e) {
        utils.displayModal(alertModal, '')
      }
    },
    getTableConfig: (registers) => {
      const config = utils.getDataTableConfig()

      var buttons = utils.getActionButtons(registers[0].arrive_id)

      const columns = [
        { data: 'reseller_name', title: 'Vendor' },
        { data: 'ship_name', title: 'Cruise' },
        { data: 'arrival_date', title: 'Arrival date' },
        { data: 'arrival_time', title: 'Arrival time' },
        { data: 'departure_time', title: 'Departure time' },
        { data: 'markup_start', title: 'Markup start' },
        { data: 'markup_end', title: 'Markup end' },
        {
          data: 'active_status',
          title: 'Status',
          render: (data, type, row, meta) => {
            return utils.addStatusFormat(data, row.arrive_id)
          }
        }
      ]

      if (buttons) {
        columns.push({
          data: 'arrive_id',
          title: 'Actions',
          render: (data, type, row, meta) => {
            return utils.getActionButtons(data)
          }
        })
      }

      config.order = [2, 'asc']
      config.data = registers
      config.columns = columns

      return config
    },
    addShips: function (response, ship) {
      try {
        MicroModal.close('wait-modal')
        const options = JSON.parse(response)

        if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
          utils.displayModal(alertModal, response.message)
        } else {
          data = {
            element: ship,
            value: 'ship_id',
            key: 'ship_name'
          }

          utils.buildOptions(data, options.message, 1)
        }
      } catch (e) {
        utils.displayModal(alertModal, '')
      }
    }
  }
}

// Evaluate if exists table element
form = document.querySelector('#form-arrives-search')
if (form !== null) {
  arrives.list.init()
}

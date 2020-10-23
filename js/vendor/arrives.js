'use strict'
var id
var url
var form
var data
var initialOptions
var user = window.user
var configTable = utils.getDataTableConfig()

const arrives = {
  initList: function () {
    utils.post(JSON.stringify(
      { table: 'arrives' }),
      `${base}users/permissions`,
      utils.setPermissions
    )

    var dateRange = document.querySelector('.date-range')
    var searchBtn = document.querySelector('.search')
    var ship = document.querySelector('[name="ship"]')
    var reseller = document.querySelector('[name="reseller"]')

    if (reseller !== null && ship !== null) {
      initialOptions = ship.innerHTML
      reseller.addEventListener('change', function (e) {
        e.preventDefault()

        id = e.target.value
        utils.removeOptions(ship, 0)

        if (id !== '') {
          url = `${apiHost}arrives/shipsarrive/${id}`
          utils.api(JSON.stringify({}), url, 'GET', arrives.addShips, ship)
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
        arrives.loadArrives(ship, reseller)
      })
    }

    arrives.loadArrives(ship, reseller)
  },
  deployData: function (response) {
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
        const registers = response.message.map(data => {
          const rows = [
            data.reseller_name,
            data.ship_name,
            data.arrival_date,
            data.arrival_time,
            data.departure_time,
            data.markup_start,
            data.markup_end,
            data.active_status,
            data.arrive_id
          ]

          return rows
        })

        const regexId = /{id}/gi

        for (let i = 0, l = registers.length; i < l; i++) {
          var idArrive = registers[i][8]

          var textStatus = 'Active'
          var labelStatus = 'success'

          if (registers[i][7] === 0) {
            labelStatus = 'danger'
            textStatus = 'Inactive'
          }

          var statusElement = permissions.statusElement.replace('{status}', labelStatus)
          statusElement = statusElement.replace('{s_text}', textStatus)
          statusElement = statusElement.replace('{status_value}', registers[i][7])

          registers[i][7] = statusElement

          var actions = ''
          if (permissions.i === 1) {
            actions = `${actions} ${permissions.iElement.replace(regexId, idArrive)}`
          }

          if (permissions.u === 1) {
            actions = `${actions} ${permissions.uElement.replace('{id}', idArrive)}`
          }

          if (permissions.d === 1) {
            actions = `${actions} ${permissions.dElement.replace('{id}', idArrive)}`
          }

          registers[i][8] = actions
        }

        if ($.fn.DataTable.isDataTable(editor)) {
          editor.destroy()
        }

        configTable.data = registers
        configTable.order = [2, 'asc']

        editor = $(dataTable).DataTable(configTable)

        if (registers[0][8].length === 0) {
          editor.column(8).visible(false)
        } else {
          editor.column(8).visible(true)
        }

        editor.draw()
        editor.columns.adjust().draw()
      }
    } catch (e) {
      console.log(e)
      utils.displayModal(alertModal, '')
    }
  },
  loadArrives: function (ship, reseller) {
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

    utils.api(JSON.stringify(info), url, 'POST', arrives.deployData)
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

dataTable = document.querySelector('#arrives-registers')
// Evaluate if exists table element
if (dataTable !== null) {
  arrives.initList()
}

'use strict'
var id
var url
var form
var data
var dataArrive
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
  },
  update: {
    init: function () {
      utils.post(JSON.stringify(
        { table: 'allotments' }),
        `${base}users/permissions`,
        utils.setPermissions
      )

      arrives.update.loadData()
    },
    loadData: function () {
      url = `${apiHost}allotments`

      form.querySelector('[name="ships"]').value = dataArrive.ship_id
      form.querySelector('[name="arrival_date"]').value = dataArrive.arrival_date
      form.querySelector('[name="arrival_time"]').value = dataArrive.arrival_time
      form.querySelector('[name="departure_time"]').value = dataArrive.departure_time
      form.querySelector('[name="markup_start"]').value = dataArrive.markup_start
      form.querySelector('[name="markup_end"]').value = dataArrive.markup_end
      form.querySelector('[name="status"]').value = dataArrive.active

      flatpickr('.date-format', {
        dateFormat: 'Y-m-d',
        minDate: dataArrive.arrival_date
      })

      flatpickr('.time-format', {
        enableTime: true,
        noCalendar: true,
        dateFormat: 'H:i',
        time_24hr: true
      })

      flatpickr('.markup', {
        enableTime: true,
        noCalendar: true,
        dateFormat: 'H:i',
        defaultDate: '00:30',
        time_24hr: true
      })

      url = `${url}/arrive/${dataArrive.id}`
      utils.api(JSON.stringify({}), url, 'GET', arrives.update.deploy)
    },
    deploy: function (response) {
      try {
        MicroModal.close('wait-modal')
        response = JSON.parse(response)

        if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
          utils.displayModal(alertModal, response.message)

          var title = document.querySelector('.msg-title')
          if (response.code === 404) {
            if (title) {
              title.innerText = 'Not allotment configuration found!'
            }
          }
        } else {
          var registers = response.message
          if (utils.isJson(registers)) {
            const dRegisters = JSON.parse(registers)
            registers = dRegisters.list
          }

          if (title) {
            title.innerText = 'Edit Allotments of Cruise'
          }

          var simulateBtn = document.querySelector('.load-allotments')
          var cancelButton = document.querySelector('.form-actions .cancel')

          if (simulateBtn === null) {
            simulateBtn = utils.createElement('button', 'btn btn-info load-allotments ml-1', '', 'Simulate')

            cancelButton.after(simulateBtn)

            simulateBtn.addEventListener('click', (e) => {
              e.preventDefault()

              const info = arrives.update.loadObject()
              if (info.frm !== null) {
                url = `${apiHost}arrives/simulator/`
                utils.api(JSON.stringify(info), url, 'POST', arrives.update.deploy)
              }
            })
          }

          utils.dropTable(document.querySelector('#allotments-registers'))

          configTable = arrives.update.getTableConfig(registers)
          const content = document.querySelector('.table-allotment')
          const nodeTable = utils.createElement('table', '', 'allotments-registers', '')

          content.appendChild(nodeTable)

          $(nodeTable).DataTable(configTable).draw()

          flatpickr('.hrStart', {
            enableTime: true,
            noCalendar: true,
            dateFormat: 'H:i',
            time_24hr: true
          })
        }
      } catch (e) {
        console.log(e)
        utils.displayModal(alertModal, '')
      }
    },
    loadObject: function () {
      var valid = true
      var fields = document.querySelectorAll('[data-validator]')

      var rqstObject = {
        frm: null,
        list: null,
        frmOrg: null
      }

      valid = utils.dataValidator(fields)

      if (valid) {
        var form = {}
        form.arrive_id = dataArrive.id
        form.markup_end = document.querySelector('[name="markup_end"]').value
        form.arrival_date = document.querySelector('[name="arrival_date"]').value
        form.arrival_time = document.querySelector('[name="arrival_time"]').value
        form.markup_start = document.querySelector('[name="markup_start"]').value
        form.ship_id = parseInt(document.querySelector('[name="ships"]').value, 10)

        form.departure_time = document.querySelector('[name="departure_time"]').value
        form.active_status = parseInt(document.querySelector('[name="status"]').value, 10)

        var formOrg = {}
        formOrg.user_id = user
        formOrg.active_status = dataArrive.active
        formOrg.arrival_date = dataArrive.arrival_date

        var allotments = []
        const table = document.querySelector('#allotments-registers')
        const dataAllotment = document.querySelectorAll('.data-allotment')

        const startHours = table.querySelectorAll('.hrStart')
        const maxAvailable = table.querySelectorAll('.capmax')
        const minAvailable = table.querySelectorAll('.capmin')
        const maxCapacityBase = table.querySelectorAll('.max-base')
        const minCapacityBase = table.querySelectorAll('.min-base')
        const schedulesBase = table.querySelectorAll('.schedule-start-base')
        const schedulesEndBase = table.querySelectorAll('.schedule-end-base')

        for (let i = 0, l = startHours.length; i < l; i++) {
          var allotment = {}

          allotment.schedule_start = schedulesBase[i].innerText

          allotment.service_name = dataAllotment[i].dataset.serviceName
          allotment.schedule_start_base = schedulesBase[i].innerText
          allotment.schedule_end_base = schedulesEndBase[i].innerText
          allotment.capacity_min = parseInt(minAvailable[i].value, 10)
          allotment.capacity_max = parseInt(maxAvailable[i].value, 10)
          allotment.active_status = parseInt(dataAllotment[i].dataset.status, 10)
          allotment.service_id = parseInt(dataAllotment[i].dataset.serviceId, 10)
          allotment.allotment_id = parseInt(dataAllotment[i].dataset.allotmentId, 10)
          allotment.min_available_base = parseInt(minCapacityBase[i].innerText, 10)
          allotment.max_available_base = parseInt(maxCapacityBase[i].innerText, 10)
          allotment.active_status_base = parseInt(dataAllotment[i].dataset.statusBase, 10)

          if (!Number.isInteger(allotment.capacity_min)) {
            valid = false
            arrives.errorMsg('missing', 'minimum capacity', minAvailable[i], (i + 1))
            break
          } else if (allotment.capacity_min < 0) {
            valid = false
            arrives.errorMsg('lessThanZero', 'minimum capacity', minAvailable[i], (i + 1))
            break
          } else if (!Number.isInteger(allotment.capacity_max)) {
            valid = false
            arrives.errorMsg('missing', 'maximum capacity', maxAvailable[i], (i + 1))
            break
          } else if (allotment.capacity_max < 0) {
            valid = false
            arrives.errorMsg('lessThanZero', 'maximum capacity', maxAvailable[i], (i + 1))
            break
          } else if (allotment.capacity_min > allotment.capacity_max) {
            valid = false
            arrives.errorMsg('exceded', 'minimum capacity', minAvailable[i], (i + 1))
            break
          }

          if (startHours[i].value !== '') {
            allotment.schedule_start = startHours[i].value
          }

          allotment.message = ''
          allotments.push(allotment)
        }
      }

      if (valid) {
        rqstObject.frm = form
        rqstObject.frmOrg = formOrg
        rqstObject.list = allotments
      }

      return rqstObject
    },
    getTableConfig: (registers) => {
      const config = utils.getDataTableConfig()

      var status
      const statusElement = document.querySelector('[name="status"]')
      if (statusElement !== null) {
        status = parseInt(statusElement.value, 10)
      }

      const columns = [
        { data: 'service_name', title: 'Service' },
        {
          data: 'schedule_start_base',
          title: 'Schedules',
          render: (data, type, row, meta) => {
            var startSchedule = utils.createElement(
              'element', 'schedule-start-base', '', data
            ).outerHTML

            var endSchedule = utils.createElement(
              'element', 'schedule-end-base', '', row.schedule_end_base
            ).outerHTML

            var span = `${startSchedule} - ${endSchedule}`

            return span
          }
        },
        {
          data: 'min_available_base',
          title: 'Capacities',
          render: (data, type, row, meta) => {
            var minBase = utils.createElement(
              'element', 'min-base', '', data
            ).outerHTML

            var maxBase = utils.createElement(
              'element', 'max-base', '', row.max_available_base
            ).outerHTML

            var span = `${minBase} - ${maxBase}`

            return span
          }
        },
        {
          data: 'schedule_start',
          title: 'Schedule start',
          render: (data, type, row, meta) => {
            var startTime = utils.createElement(
              'input', 'form-control-plaintext hrStart', '', ''
            )

            startTime.setAttribute('value', data)

            if (status === 0) {
              startTime.setAttribute('disabled', 'disabled')
            }

            return startTime.outerHTML
          }
        },
        {
          data: 'min_available_base',
          title: 'Min.Capacity',
          render: (data, type, row, meta) => {
            var startTime = utils.createElement(
              'input', 'form-control-plaintext capmin', '', ''
            )

            startTime.setAttribute('type', 'number')
            startTime.setAttribute('value', data)

            if (status === 0) {
              startTime.setAttribute('disabled', 'disabled')
            }

            return startTime.outerHTML
          }
        },
        {
          data: 'max_available_base',
          title: 'Max.Capacity',
          render: (data, type, row, meta) => {
            var startTime = utils.createElement(
              'input', 'form-control-plaintext capmax', '', ''
            )

            startTime.setAttribute('type', 'number')
            startTime.setAttribute('value', data)

            if (status === 0) {
              startTime.setAttribute('disabled', 'disabled')
            }

            return startTime.outerHTML
          }
        },
        {
          data: 'active_status',
          title: 'Status',
          render: (data, type, row, meta) => {
            const labelStatus = utils.addStatusFormat(data, row.allotment_id)

            var dataAllotment = utils.createElement(
              'input', 'data-allotment', '', ''
            )

            dataAllotment.setAttribute('type', 'hidden')

            dataAllotment.dataset.status = row.active_status
            dataAllotment.dataset.serviceId = row.service_id
            dataAllotment.dataset.allotmentId = row.allotment_id
            dataAllotment.dataset.serviceName = row.service_name
            dataAllotment.dataset.statusBase = row.active_status_base

            return `${labelStatus} ${dataAllotment.outerHTML}`
          }
        },
        {
          data: 'allotment_id',
          title: 'Messages',
          render: (data, type, row, meta) => {
            var span = utils.createElement(
              'span', 'msg-error', '', row.message
            )

            return span.outerHTML
          }
        }
      ]

      config.data = registers
      config.columns = columns

      return config
    }
  },
  errorMsg: function (error, type, element, position) {
    var msg = ''
    switch (error) {
      case 'lessThanZero':
        msg = `The  ${type} field doesn't accept negative numbers`
        break
      case 'missing':
        msg = `The ${type} is required on register number ${position}`
        break
      case 'exceded':
        msg = `Invalid ${type} on register number ${position}`
        break
    }

    element.setAttribute('style', 'border-color: #dc3545; box-shadow: 0 0 0 .2rem rgba(220,53,69,.25);')
    element.focus()
    element.addEventListener('keydown', () => {
      element.removeAttribute('style')
    })

    utils.displayModal(alertModal, msg)
  }
}

// Evaluate if exists table element
form = document.querySelector('#form-arrives-search')
if (form !== null) {
  arrives.list.init()
}

// Evaluate if exists update form
form = document.querySelector('#update-arrives')
if (form !== null) {
  dataArrive = window.arrives
  arrives.update.init()
}

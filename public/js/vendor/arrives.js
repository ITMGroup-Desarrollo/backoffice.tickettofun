'use strict'
var id
var url
var form
var data
var dataArrive
var initialOptions
const user = window.user
var pendingChanges = false
var configTable = utils.getDataTableConfig()

const arrives = {
  initPermissions: () => {
    utils.post(
      JSON.stringify({table:'arrives'}),
      `${base}/users/permissions`,
      arrives.setConfigFront
    )
  },
  add: {
    init: () => {
      // Initialize pickers
      flatpickr('.date-format', {
        dateFormat: 'Y-m-d',
        minDate: new Date()
      })

      flatpickr('.time-format', {
          enableTime: true,
          noCalendar: true,
          dateFormat: 'H:i',
          time_24hr: true,
          disableMobile: true
      })

      flatpickr('.markup', {
          enableTime: true,
          noCalendar: true,
          dateFormat: 'H:i',
          defaultDate: '00:30',
          time_24hr: true,
          disabledMobile: true
      })

      var cancel = document.querySelector('.cancel')
      if (cancel != null) {
        cancel.addEventListener(clickEvent, function (e) {
          e.preventDefault()
          form = document.querySelector('#add-arrives')
          form.reset()
        })
      }


      var save = document.querySelector('.save')
      if (save != null) {
        save.addEventListener(clickEvent, function (e) {
          e.preventDefault()

          arrives.add.saveArrive()
        })
      }
    },
    saveArrive: () => {
      var valid = 'true'
      var fields = document.querySelectorAll('[data-validator]')

      valid = utils.dataValidator(fields)

      if (valid) {
        info = {
          ship_id: document.querySelector('[name="ships"]').value,
          arrival_date: document.querySelector('[name="arrival_date"]').value,
          arrival_time: document.querySelector('[name="arrival_time"]').value,
          departure_time: document.querySelector('[name="departure_time"]').value,
          markup_start: document.querySelector('[name="markup_start"]').value,
          markup_end: document.querySelector('[name="markup_end"]').value,
          business_unit: document.querySelector('[name="unities"]').value
        }

        var url = `${apiHost}arrives/add`
        info.user_id = user
        utils.api(JSON.stringify(info), url, 'POST', arrives.add.confirm)
      }
    },
    confirm: (response) => {
      MicroModal.close('wait-modal')

      response = JSON.parse(response)
      var _message = ''
      var _alertModal = document.getElementById('alert-modal-content')

      if (codes.hasOwnProperty(response.code)) {
        _message = utils.createElement('p', '', '', response.message)

        _alertModal.innerHTML = ''
        _alertModal.appendChild(_message)

        MicroModal.show('alert-modal')
      } else if (response.code === 201) {
        _message = utils.createElement('p', '', '', 'Success! Cruise call added correctly')

        _alertModal.innerHTML = ''
        _alertModal.appendChild(_message)

        MicroModal.show('alert-modal')

        form = document.querySelector('#add-arrives')
        form.reset()
      }
    }
  },
  list: {
    init: () => {
      const form = document.querySelector('#search')
      const unities = document.querySelector('.form-bussines-unities')

      form.prepend(unities)

      const searchBtn = document.querySelector('.search')
      const ship = document.querySelector('[name="ship"]')
      const dateRange = document.querySelector('.date-range')
      const reseller = document.querySelector('[name="reseller"]')
      const businessUnit = document.querySelector('[name="business_unit"]')

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
          arrives.list.load(ship, reseller, businessUnit)
        })
      }

      const cancel = document.querySelector('.cancel')
      if (cancel != null) {
        cancel.addEventListener(clickEvent, (e) => {
          e.preventDefault()

          const form = document.querySelector('#add-arrives')
          form.reset()
        })
      }

      const confirmModal = document.getElementById('confirm-modal')
      if (confirmModal !== null) {
        const message = utils.createElement('p', '', '', 'Are you sure to delete this call?')

        const content = confirmModal.querySelector('#confirm-modal-content')
        const btnConfirm = confirmModal.querySelector('.confirm-delete')

        content.innerHTML = ''
        content.appendChild(message)

        btnConfirm.addEventListener(clickEvent, (e) => {
          e.preventDefault()

          const idArrive = e.target.getAttribute('data-id')
          url = `${apiHost}arrives/del/${idArrive}`

          utils.api(JSON.stringify({ user: user }), url, 'DELETE', arrives.list.delete, e.target)
        })
      }

      arrives.list.load(ship, reseller, businessUnit)
    },
    load: function (ship, reseller, businessUnit) {
      const info = {}
      url = `${apiHost}arrives/list`

      info.ship = (ship.value !== '') ? parseInt(ship.value, 10) : null
      info.reseller = (reseller.value !== '') ? parseInt(reseller.value, 10) : null
      info.unities = (businessUnit.value !== '') ? parseInt(businessUnit.value, 10) : null

      const dates = document.querySelector('[name="dates"]').value

      if (dates.trim() !== '') {
        const aDates = dates.split(' to ')

        info.start_date = aDates[0]
        info.end_date = aDates[0]
        if (aDates.length === 2) {
          info.end_date = aDates[1]
        }
      } else {
        info.start_date = utils.getDate()
        info.end_date = utils.getDate(1)
      }

      let params = utils.filterQueryParams(info)

      if (params !== '') {
        url = `${url}?${params}`
      }

      utils.api(null, url, 'GET', arrives.list.deploy)
    },
    deploy: function (response) {
      try {
        MicroModal.close('wait-modal')
        response = JSON.parse(response)

        const table = document.querySelector('#arrives-registers')

        utils.dropTable(table)

        const content = document.querySelector('.table-arrives')
        const nodeTable = utils.createElement('table', 'cell-border stripe', 'arrives-registers', '')

        content.appendChild(nodeTable)

        if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
          configTable = arrives.list.getTableConfig([])

          if (response.code === 404) {
            utils.displayModal(alertModal, 'Not found calls with the selected data')
          } else {
            utils.displayModal(alertModal, response.message)
          }

          $(nodeTable).DataTable(configTable).draw()
        } else {
          const registers = response.message

          configTable = arrives.list.getTableConfig(registers)

          $(nodeTable).DataTable(configTable).draw()

          // TODO: make a gglobal function
          const deleteBtns = document.querySelectorAll('.delete')
          for (let i = 0, l = deleteBtns.length; i < l; i++) {
            deleteBtns[i].addEventListener(clickEvent, (e) => {
              e.preventDefault()

              let element = e.target
              const btnConfirm = document.querySelector('.confirm-delete')

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
          const statusLabel = document.querySelector(`[data-status="${id}"]`)

          statusLabel.classList.add('badge-danger')
          statusLabel.classList.remove('badge-success')
        }
      } catch (e) {
        utils.displayModal(alertModal, '')
      }
    },
    getTableConfig: (registers) => {
      const config = utils.getDataTableConfig()

      const columns = [
        { data: 'unity_name', title: 'Business unit' },
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
        },
        {
          data: 'arrive_id',
          title: 'Actions',
          render: (data, type, row, meta) => {
            return  utils.getActionButtons(row.arrive_id)
          }
        }
      ]

      config.order = [3, 'asc']
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
    loadData: () => {
      url = `${apiHost}allotments`

      form.querySelector('[name="ships"]').value = dataArrive.ship_id
      form.querySelector('[name="arrival_date"]').value = dataArrive.arrival_date
      form.querySelector('[name="arrival_time"]').value = dataArrive.arrival_time
      form.querySelector('[name="departure_time"]').value = dataArrive.departure_time
      form.querySelector('[name="markup_start"]').value = dataArrive.markup_start
      form.querySelector('[name="markup_end"]').value = dataArrive.markup_end
      form.querySelector('[name="status"]').value = dataArrive.active
      form.querySelector('[name="unities"]').value = dataArrive.business_unit

      let channel = document.querySelector('[name="channel"]')
      if (channel != null) {
        for (let i = 0, l = channel.length; i < l - 1; i++) {
          if (channel.options[i].value == 2) {
            channel.remove(i);
          }
        }

        channel.value = 1

        channel.addEventListener('change', (e) => {
          e.preventDefault()

          url = `${apiHost}allotments/arrive/${dataArrive.id}`
          utils.api(JSON.stringify({}), url, 'GET', arrives.update.deploy)
        })
      }

      flatpickr('.date-format', {
        dateFormat: 'Y-m-d',
        minDate: 'today'
      })

      flatpickr('.time-format', {
        enableTime: true,
        noCalendar: true,
        dateFormat: 'H:i',
        time_24hr: true,
        disableMobile: true
      })

      flatpickr('.markup', {
        enableTime: true,
        noCalendar: true,
        dateFormat: 'H:i',
        defaultDate: '00:30',
        time_24hr: true,
        disableMobile: true
      })

      //Listener if exists unapplied changes before to leave page
      window.addEventListener('beforeunload', (e) => {
        if (pendingChanges) {
          e.preventDefault()
          e.returnValue = ''
        }
      })

      var saveButton = document.querySelector('.save')
      if (saveButton != null) {
        saveButton.addEventListener(clickEvent, (e) => {
          e.preventDefault()

          arrives.confirm()
        })
      }

      var confirmButton = document.querySelector('.confirm-save')
      if (confirmButton != null) {
        confirmButton.addEventListener(clickEvent, (e) => {
          e.preventDefault()

          const info = arrives.update.loadObject()
          if (info.frm !== null) {
            pendingChanges = false
            url = `${apiHost}arrives/edit/${dataArrive.id}`
            utils.api(
              JSON.stringify(info),
              url,
              'PUT',
              arrives.update.deploy,
              confirmButton
            )
          }
        })
      }

      url = `${url}/arrive/${dataArrive.id}`
      utils.api(JSON.stringify({}), url, 'GET', arrives.update.deploy)
    },
    deploy: function (response, element) {
      try {
        MicroModal.close('wait-modal')
        response = JSON.parse(response)

        configTable = arrives.update.getTableConfig([])
        const table = document.querySelector('#allotments-registers')

        utils.dropTable(table)

        const content = document.querySelector('.table-allotment')
        const nodeTable = utils.createElement('table', '', 'allotments-registers', '')

        content.appendChild(nodeTable)

        // Get channel
        let channel = document.querySelector('[name="channel"]')

        if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
          configTable = arrives.update.getTableConfig([])

          let dRegisters = {}
          let registers = response.message

          if (utils.isJson(registers)) {
            dRegisters = JSON.parse(registers)
            registers = dRegisters.list
          } else {
            dRegisters = registers
          }

          if (response.code === 404) {
            utils.displayModal(alertModal, 'Not allotment configuration found!')
          } else {
            let error = JSON.parse(dRegisters.error[0])
            utils.displayModal(alertModal, error.message)
          }

          // filter by cruise channel
          registers = registers.filter((row) => {
            return row.channel_id == channel.value
          })

          configTable = arrives.update.getTableConfig(registers)

          $(nodeTable).DataTable(configTable).draw()

          arrives.update.setActions()
        } else {
          if (typeof element !== 'undefined') {
            utils.displayModal(alertModal, 'Success! changes were applied correctly')
          }

          var registers = response.message

          if (utils.isJson(registers)) {
            var  dRegisters = JSON.parse(registers)
            registers = dRegisters.list
          } else if (registers.list) {
            registers = registers.list
          }

          // filter by cruise channel
          registers = registers.filter((row) => {
            return row.channel_id == channel.value
          })

          configTable = arrives.update.getTableConfig(registers)

          var simulateBtn = document.querySelector('.load-allotments')
          const cancelButton = document.querySelector('.form-actions .cancel')

          if (simulateBtn === null) {
            simulateBtn = utils.createElement('button', 'btn btn-info load-allotments ml-1', '', 'Simulate')

            cancelButton.after(simulateBtn)

            simulateBtn.addEventListener(clickEvent, (e) => {
              e.preventDefault()

              const info = arrives.update.loadObject()
              if (info.frm !== null) {
                pendingChanges = true

                url = `${apiHost}arrives/simulator/`
                utils.api(JSON.stringify(info), url, 'POST', arrives.update.deploy)
              }
            })
          }

          $(nodeTable).DataTable(configTable).draw()

          arrives.update.setActions()
        }
      } catch (e) {
        console.log(e)
        utils.displayModal(alertModal, '')
      }
    },
    setActions: () => {
      flatpickr('.hours', {
        enableTime: true,
        noCalendar: true,
        dateFormat: 'H:i',
        time_24hr: true,
        disableMobile: true
      })
      // Add event listener to change status
      const statusElements = document.querySelectorAll('.status-option')
      for (let i = 0, l = statusElements.length; i < l; i++) {
        statusElements[i].addEventListener(clickEvent, function (e) {
          e.preventDefault()

          var element = e.target
          if (e.target.getAttribute('data-status')) {
            element = e.target.parentElement
          }

          const inputHidden = element.parentElement.querySelector('.data-allotment')

          let label = ''
          if (inputHidden !== null) {
            if (inputHidden.value == 0) {
              inputHidden.value = 1
              inputHidden.dataset.status = 1
              label = utils.addStatusFormat(1, inputHidden.dataset.allotmentId)
            } else {
              inputHidden.value = 0
              inputHidden.dataset.status = 0
              label = utils.addStatusFormat(0, inputHidden.dataset.allotmentId)
            }

            element.innerHTML = label
          }
        })
      }
    },
    loadObject: () => {
      var valid = true
      const fields = document.querySelectorAll('[data-validator]')

      const rqstObject = {
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

        const eHours = table.querySelectorAll('.hrEnd')
        const sHours = table.querySelectorAll('.hrStart')
        const maxAvailable = table.querySelectorAll('.capmax')
        const minAvailable = table.querySelectorAll('.capmin')
        const maxCapacityBase = table.querySelectorAll('.max-base')
        const minCapacityBase = table.querySelectorAll('.min-base')
        const schedulesBase = table.querySelectorAll('.schedule-start-base')
        const schedulesEndBase = table.querySelectorAll('.schedule-end-base')

        const startHours = Array.from(sHours).filter(element => {
          return element.id !== ''
        })

        const endHours= Array.from(eHours).filter(element => {
          return element.id !== ''
        })

        for (let i = 0, l = startHours.length; i < l; i++) {
          const allotment = {}

          allotment.schedule_start = schedulesBase[i].innerText
          allotment.schedule_end = schedulesEndBase[i].innerText

          allotment.channel_id = dataAllotment[i].dataset.channel_id
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
            arrives.errorMsg('missing', 'minimum capacity', minAvailable[i], allotment.service_name)
            break
          } else if (allotment.capacity_min < 0) {
            valid = false
            arrives.errorMsg('lessThanZero', 'minimum capacity', minAvailable[i], allotment.service_name)
            break
          } else if (!Number.isInteger(allotment.capacity_max)) {
            valid = false
            arrives.errorMsg('missing', 'maximum capacity', maxAvailable[i], allotment.service_name)
            break
          } else if (allotment.capacity_max < 0) {
            valid = false
            arrives.errorMsg('lessThanZero', 'maximum capacity', maxAvailable[i], allotment.service_name)
            break
          } else if (allotment.capacity_min > allotment.capacity_max) {
            valid = false
            arrives.errorMsg('exceded', 'minimum capacity', minAvailable[i], allotment.service_name)
            break
          }

          if (endHours[i].value !== '') {
            allotment.schedule_end = endHours[i].value
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
      const config = {
        info:false,
        paging: false,
        searching: false,
        fixedHeader: true,
      }

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
            const startTime = utils.createElement(
              'input', 'form-control-plaintext hrStart hours', `hrStart${row.allotment_id}`, ''
            )

            startTime.setAttribute('value', data)

            if (status === 0) {
              startTime.setAttribute('disabled', 'disabled')
            }

            return startTime.outerHTML
          }
        },
        {
          data: 'schedule_end',
          title: 'Schedule end',
          render: (data, type, row, meta) => {
            const startTime = utils.createElement(
              'input', 'form-control-plaintext hrEnd hours', `hrEnd${row.allotment_id}`, ''
            )

            startTime.setAttribute('value', data)

            if (status === 0) {
              startTime.setAttribute('disabled', 'disabled')
            }

            return startTime.outerHTML
          }
        },
        {
          data: 'capacity_min',
          title: 'Min.Capacity',
          render: (data, type, row, meta) => {
            const startTime = utils.createElement(
              'input', 'form-control-plaintext capmin',`capmin${row.allotment_id}`, ''
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
          data: 'capacity_max',
          title: 'Max.Capacity',
          render: (data, type, row, meta) => {
            const startTime = utils.createElement(
              'input', 'form-control-plaintext capmax', `capmax${row.allotment_id}`, ''
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

            const anchor = utils.createElement(
              'a', 'status-option', '', ''
            )

            anchor.setAttribute('href', '#')

            anchor.innerHTML = labelStatus

            var dataAllotment = utils.createElement(
              'input', 'data-allotment', '', ''
            )

            dataAllotment.setAttribute('type', 'hidden')
            dataAllotment.setAttribute('value', row.active_status)

            dataAllotment.dataset.status = row.active_status
            dataAllotment.dataset.serviceId = row.service_id
            dataAllotment.dataset.allotmentId = row.allotment_id
            dataAllotment.dataset.serviceName = row.service_name
            dataAllotment.dataset.statusBase = row.active_status_base
            dataAllotment.dataset.channel_id = row.channel_id

            return `${anchor.outerHTML} ${dataAllotment.outerHTML}`
          }
        },
        {
          data: 'allotment_id',
          title: 'Messages',
          render: (data, type, row, meta) => {
            const span = utils.createElement(
              'span', 'msg-error', '', row.message
            )

            return span.outerHTML
          }
        }
      ]

      config.data = registers
      config.columns = columns

      return config
    },
  },
  confirm: () => {
    var msg = ''
    const confirmModal = document.querySelector('#confirm-modal-content')

    msg = utils.createElement('p', '', '', 'Are you sure to save this configuration?')

    confirmModal.innerHTML = ''
    confirmModal.appendChild(msg)

    MicroModal.show('confirm-modal')
  },
  errorMsg: function (error, type, element, service) {
    var msg = ''
    switch (error) {
      case 'lessThanZero':
        msg = `The  ${type} field doesn't accept negative numbers`
        break
      case 'missing':
        msg = `The ${type} is required for <b>${service}</b> service`
        break
      case 'exceded':
        msg = `Invalid ${type} for <b>${service}</b> service`
        break
    }

    element.setAttribute('style', 'border-color: #dc3545; box-shadow: 0 0 0 .2rem rgba(220,53,69,.25);')
    element.focus()
    element.addEventListener('keydown', () => {
      element.removeAttribute('style')
    })

    utils.displayModal(alertModal, msg)
  },
  setConfigFront: (response) => {
    utils.setPermissions(response)

    //Add export actions
    const btnExport = document.querySelector('[name="export"]')
    if (btnExport !== null) {
      btnExport.addEventListener(clickEvent, (e) => {
        e.preventDefault()
        url = `${base}/arrives/export/${dataArrive.id}`
        window.open(url)
      })
    }

    // Evaluate if exists table element
    form = document.querySelector('#form-arrives-search')
    if (form !== null) {
      let channel = document.querySelector('#channel-filter').closest('div')
      if (channel != null) {
        channel.innerHTML = ''
      }

      arrives.list.init()
    }

    // Evaluate if exists add form
    form = document.querySelector('#add-arrives')
    if (form !== null) {
      MicroModal.close('wait-modal')

      let channel = document.querySelector('#channel-filter').closest('div')
      if (channel != null) {
        channel.innerHTML = ''
      }

      arrives.add.init()
    }

    // Evaluate if exists update form
    form = document.querySelector('#update-arrives')
    if (form !== null) {
      dataArrive = window.arrives

      // rename confirm button
      const confirmButton = document.querySelector('.confirm-delete')
      confirmButton.classList.remove('confirm-delete')
      confirmButton.classList.add('confirm-save')

      arrives.update.loadData()
    }
  }
}

// Set permissions
arrives.initPermissions()

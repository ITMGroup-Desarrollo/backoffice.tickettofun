'use strict'
var user = window.user
var arriveData = window.arrive_data
var configTable = utils.getDataTableConfig()

const schedules = {
  init: () => {
    const overlap = document.querySelector('[name="overlap"]')
    const service = document.querySelector('[name="service"]')
    const generate = document.querySelector('.generate-schedule')
    const assingment = document.querySelector('.previous-assignment')

    if (assingment != null) {
      configTable.iDisplayLength = 5
      configTable.order = [[0, 'desc']]
      configTable.aLengthMenu = [[5, 10, 25, -1], [5, 10, 25, 'All']]

      $(assingment).DataTable(configTable)
    }

    let channel = document.querySelector('[name="channel"]')
    if (channel != null) {
      for (let i = 0, l = channel.length; i < l - 1; i++) {
        if (channel.options[i].value == 2) {
          channel.remove(i);
        }
      }

      channel.value = 1
    }

    if (service != null) {
      service.append(new Option('-- Choose option --', ''))

      utils.api(JSON.stringify({}), `${apiHost}equivalences/ship/${arriveData.ship_id}`, 'GET', schedules.serviceList, service)
    }

    if (overlap != null) {
      flatpickr(overlap, {
        altInput: false,
        enableTime: true,
        noCalendar: true,
        dateFormat: 'H:i',
        defaultHour: 0,
        defaultMinute: 30,
        maxTime: '05:00',
        minuteIncrement: 30,
        time_24hr: true
      })
    }

    if (generate != null) {
      generate.addEventListener('click', (e) => {
        e.preventDefault()

        schedules.loadData()
      })
    }
  },
  serviceList: (response, element) => {
    try {
      MicroModal.close('wait-modal')
      response = JSON.parse(response)

      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        configTable = schedules.getTableConfig([])

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

        utils.buildOptions(data, response.message, 1)
      }
    } catch (e) {
      utils.displayModal(alertModal, '')
    }
  },
  loadData: () => {
    var valid = true
    const fields = document.querySelectorAll('[data-validator]')

    valid = utils.dataValidator(fields)

    if (valid) {
      const service = document.querySelector('[name="service"]')
      const overlap = document.querySelector('[name="overlap"]')

      const info = {
        arrive: arriveData,
        overlap: overlap.value,
        service: service.value,
        ship: arriveData.ship_id,
        start_date: arriveData.arrival_date,
      }

      utils.api(JSON.stringify(info), `${apiHost}allotments/shipservice`, 'POST', schedules.deploy)
    }
  },
  deploy: (response) => {
    try {
      MicroModal.close('wait-modal')
      response = JSON.parse(response)

      utils.dropTable(document.querySelector('#schedules-registers'))

      configTable = schedules.getTableConfig([])
      const content = document.querySelector('.table-schedules')
      const nodeTable = utils.createElement('table', '', 'schedules-registers', '')

      content.appendChild(nodeTable)

      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {

        if (response.code === 404) {
          utils.displayModal(alertModal, 'Not allotment configuration found!')
        } else {
          utils.displayModal(alertModal, response.message)
        }

        $(nodeTable).DataTable(configTable).draw()
      } else {
        var registers = response.message

        if (utils.isJson(registers)) {
          var  dRegisters = JSON.parse(registers)
          registers = dRegisters.list
        }

        configTable = schedules.getTableConfig(registers)

        $(nodeTable).DataTable(configTable).draw()

        // Initialize calendars
        flatpickr('.time-format', {
          enableTime: true,
          noCalendar: true,
          dateFormat: 'H:i',
          time_24hr: true
        })

        // Add save event listener for icons
        const saveBtns = nodeTable.querySelectorAll('.save')
        for(let i = 0, l = saveBtns.length; i < l; i++) {
          saveBtns[i].addEventListener('click', (e) => {
            e.preventDefault()

            var id = saveBtns[i].id
            var privateService = 0
            var sharedSchedule = 0

            if (nodeTable.querySelector(`[name="shared${id}"]`).checked) {
              sharedSchedule = 1
            }

            if (nodeTable.querySelector(`[name="private${id}"]`).checked) {
              sharedSchedule = 1
            }

            let channel = document.querySelector('[name="channel"]')

            const info = {
              arrive_id: arriveData.id,
              shared_schedule: sharedSchedule,
              private_service: privateService,
              channel_id: channel.value,
              end_date: arriveData.arrival_date,
              start_date: arriveData.arrival_date,
              reseller_id: arriveData.reseller_id,
              service_id: saveBtns[i].dataset.service,
              overlap: document.querySelector('[name="overlap"]').value,
              schedule_start: nodeTable.querySelector(`[name="schedule_start${id}"]`).value,
              schedule_end: nodeTable.querySelector(`[name="schedule_end${id}"]`).value,
              min_available: nodeTable.querySelector(`[name="min_available${id}"]`).value,
              max_available: nodeTable.querySelector(`[name="max_available${id}"]`).value,
            }

            const url = `${apiHost}allotments/add`

            info.row = id
            info.user_id = user
            info.type_movement = 'I'
            info.container = nodeTable

            utils.api(JSON.stringify(info), url, 'POST', schedules.add, info)
          })
        }

        // Add delete event listener for icons
        var deleteBtns = nodeTable.querySelectorAll('.delete')
        for(let i = 0, l = deleteBtns.length; i < l; i++) {
          deleteBtns[i].addEventListener('click', (e) => {
            e.preventDefault()

            e.target.closest('tr').remove()
          })
        }
      }
    } catch (e) {
      utils.displayModal(alertModal, '')
    }
  },
  add: (response, data) => {
    MicroModal.close('wait-modal')
    response = JSON.parse(response)

    var message = ''
    var alertModal = document.getElementById('alert-modal-content')

    if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
      let decode = response

      if (utils.isJson(response.message)) {
        decode = JSON.parse(response.message)
      }

      message = utils.createElement('p', '', '', decode.message)

      alertModal.innerHTML = ''
      alertModal.appendChild(message)

      const maxInput = data.container.querySelector(`[name="max_available${data.row}"]`)
      const minInput = data.container.querySelector(`[name="min_available${data.row}"]`)

      maxInput.value = 0

      if (Object.prototype.hasOwnProperty.call(decode, 'available')) {
        maxInput.value = decode.available

        if (decode.available < minInput.value) {
          minInput.value = decode.available
        }
      }

      MicroModal.show('alert-modal')
    } else if (response.code === 201) {
      // Update previous assigments
      const info = {
        start_date: arriveData.arrival_date
      }

      const url = `${apiHost}allotments`

      utils.api(JSON.stringify(info), url, 'POST', schedules.regenerate)
    }
  },
  regenerate: (response) => {
    try {
      MicroModal.close('wait-modal')
      response = JSON.parse(response)

      var message = ''
      var alertModal = document.getElementById('alert-modal-content')

      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {

        if (response.code === 404) {
          utils.displayModal(alertModal, 'Not allotment configuration found!')
        } else {
          utils.displayModal(alertModal, response.message)
        }
      } else {
        var registers = response.message

        if (utils.isJson(registers)) {
          var  dRegisters = JSON.parse(registers)
          registers = dRegisters.list
        }

        utils.dropTable(document.querySelector('#previous-assignment'))

        const content = document.querySelector('.table-previous-assignment')
        const nodeTable = utils.createElement('table', '', 'previous-assignment', '')

        content.appendChild(nodeTable)

        configTable = schedules.getAllotmentTableConfig(registers)

        $(nodeTable).DataTable(configTable).draw()

        message = utils.createElement('p', '', '', 'Success! Schedule added correctly')

        alertModal.innerHTML = ''
        alertModal.appendChild(message)

        MicroModal.show('alert-modal')
      }
    } catch (e) {
      utils.displayModal(alertModal, '')
    }
  },
  getAllotmentTableConfig: (registers) => {
    var config = utils.getDataTableConfig()

    config.iDisplayLength = 5
    config.order = [[0, 'desc']]
    config.aLengthMenu = [[5, 10, 25, -1], [5, 10, 25, 'All']]

    const columns = [
      {
        data: 'allotment_id',
        title: 'ID',
        render: (data, type, row, meta) => {
          return data
        }
      },
      {
        data: 'channel_name',
        title: 'Channel',
        render: (data, type, row, meta) => {
          return data
        }
      },
      {
        data: 'reseller_name',
        title: 'Vendor',
        render: (data, type, row, meta) => {
          return data
        }
      },
      {
        data: 'ship_name',
        title: 'Ship',
        render: (data, type, row, meta) => {
          return data
        }
      },
      {
        data: 'service_name',
        title: 'Service',
        render: (data, type, row, meta) => {
          return data
        }
      },
      {
        title: 'Capacity',
        render: (data, type, row, meta) => {
          return `${row.min_available} - ${row.max_available}`
        }
      },
      {
        title: 'Schedule',
        render: (data, type, row, meta) => {
          return `${row.schedule_start} - ${row.schedule_end}`
        }
      },
      {
        data: 'shared_schedule',
        title: 'Shared',
        render: (data, type, row, meta) => {
          let shared = 'No'
          if (data === 1) {
            shared = 'Yes'
          }
          return shared
        }
      },
      {
        data: 'private_service',
        title: 'Private',
        render: (data, type, row, meta) => {
          let privateService = 'No'
          if (data === 1) {
            privateService = 'Yes'
          }
          return privateService
        }
      }
    ]

    config.data = registers
    config.columns = columns
    config.order = [[0, 'desc']]

    return config
  },
  getTableConfig: (registers) => {
    const config = {
      info:false,
      paging: false,
      responsive: true,
      searching: false,
      fixedHeader: true,
    }

    const columns = [
      {
        data: 'schedule_start',
        title: 'Schedule Start',
        render: (data, type, row, meta) => {
          const scheduleStart = utils.createElement('input', 'form-control time-format')

          scheduleStart.setAttribute('value', data)
          scheduleStart.setAttribute('type', 'text')
          scheduleStart.setAttribute('readonly', true)
          scheduleStart.setAttribute('name', `schedule_start${meta.row}`)

          return scheduleStart.outerHTML
        }
      },
      {
        data: 'schedule_end',
        title: 'Schedule End',
        render: (data, type, row, meta) => {
          var scheduleEnd = utils.createElement('input', 'form-control time-format')

          scheduleEnd.setAttribute('value', data)
          scheduleEnd.setAttribute('type', 'text')
          scheduleEnd.setAttribute('name', `schedule_end${meta.row}`)

          return scheduleEnd.outerHTML
        }
      },
      {
        data: 'min_available',
        title: 'Minimum',
        render: (data, type, row, meta) => {
          const minimum = utils.createElement('input', 'form-control')

          minimum.setAttribute('value', data)
          minimum.setAttribute('type', 'text')
          minimum.setAttribute('name', `min_available${meta.row}`)

          return minimum.outerHTML
        }
      },
      {
        data: 'max_available',
        title: 'Maximum',
        render: (data, type, row, meta) => {
          const maximum = utils.createElement('input', 'form-control')

          maximum.setAttribute('value', data)
          maximum.setAttribute('type', 'text')
          maximum.setAttribute('name', `max_available${meta.row}`)

          return maximum.outerHTML
        }
      },
      {
        data: 'duration',
        title: 'Duration',
        render: (data, type, row, meta) => {
          return data
        }
      },
      {
        data: 'shared_schedule',
        className: 'text-center',
        title: 'Shared',
        render: (data, type, row, meta) => {
          const shared = utils.createElement('input')

          shared.setAttribute('id', meta.row)
          shared.setAttribute('checked', true)
          shared.setAttribute('type', 'checkbox')
          shared.setAttribute('name', `shared${meta.row}`)

          return shared.outerHTML
        }
      },
      {
        data: 'private_service',
        className: 'text-center',
        title: 'Private',
        render: (data, type, row, meta) => {
          const privateService = utils.createElement('input')

          privateService.setAttribute('id', meta.row)
          privateService.setAttribute('type', 'checkbox')
          privateService.setAttribute('name', `private${meta.row}`)

          return privateService.outerHTML
        }
      },
      {
        data: 'arrive_id',
        className: 'text-center',
        title: 'Actions',
        render: (data, type, row, meta) => {
          const saveIcon = utils.createElement('i', 'fas fa-save')
          saveIcon.setAttribute('aria-hidden', true)

          const saveData = utils.createElement('a', 'save', '', saveIcon.outerHTML)

          saveData.setAttribute('href', '#')
          saveData.setAttribute('id', meta.row)
          saveData.setAttribute('data-toggle', 'tooltip')
          saveData.setAttribute('data-placement', 'left')
          saveData.setAttribute('title', 'Save allotment')
          saveData.setAttribute('data-service', `${row.service_id}`)

          const deleteIcon = utils.createElement('i', 'fas fa-trash')
          deleteIcon.setAttribute('aria-hidden', true)

          const deleteData = utils.createElement('a', 'delete', '', deleteIcon.outerHTML)

          deleteData.setAttribute('href', '#')
          deleteData.setAttribute('id', meta.row)
          deleteData.setAttribute('data-toggle', 'tooltip')
          deleteData.setAttribute('data-placement', 'left')
          deleteData.setAttribute('title', 'Discard this allotment suggest')
          deleteData.setAttribute('data-service', `${row.service_id}`)

          return `${saveData.outerHTML} ${deleteData.outerHTML}`
        }
      }
    ]

    config.data = registers
    config.columns = columns

    return config
  }
}

schedules.init()

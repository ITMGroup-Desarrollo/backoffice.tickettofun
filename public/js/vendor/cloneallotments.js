'use strict'
var form
var editor
var dataTable
var dataTableFilter
var user = window.user
var dataFilter = window.dataArrive
var configTable = utils.getDataTableConfig()

let count = 1
let arriveData = null
const defaultOption = '-- Choose option --'

const clone = {
  init: () => {
    const generate = document.querySelector('.generate-schedule')
    const overlap = document.querySelector('[name="overlap"]')

    // search form events
    const channel = document.querySelector('[name="channel"]')
    if (channel != null) {
      channel.addEventListener('change', (e) => {
        e.preventDefault()
        clone.changeChannel(e.target.value, '')
      })
    }

    const ship = document.querySelector('[name="ship"]')
    if (ship != null) {
      ship.append(new Option(defaultOption))

      const shipContent = ship.closest('.form-group')
      shipContent.classList.add('d-none')
    }

    const reseller = document.querySelector('[name="reseller"]')
    if (reseller != null) {
      reseller.append(new Option(defaultOption))

      reseller.addEventListener('change', (e) => {
        e.preventDefault()

        if (channel.value == 1) {
          var url = `${apiHost}arrives/shipsarrive/${e.target.value}`

          const data = {
            id: null,
            key: 'ship_name',
            value: 'ship_id',
            element: ship
          }

          utils.api(JSON.stringify({}), url, 'GET', clone.deployOptions, data)
        }
      })
    }

    const arriveDate = document.querySelector('[name="date"]')
    if (arriveDate != null) {
      flatpickr(arriveDate, {
        dateFormat: 'Y-m-d',
        minDate: 'today'
      })
    }

    const btnSearch = document.querySelector('[name="search"]')
    if (btnSearch != null) {
      btnSearch.addEventListener('click', (e) => {
        e.preventDefault()
        var valid = 'true'
        var slug = 'reseller'

        var form = btnSearch.closest('form')
        var fields = form.querySelectorAll('[data-validator]')

        valid = utils.dataValidator(fields)

        if (valid) {
          info = {
            start_date: form.querySelector('[name="date"]').value,
          }

          let id = reseller.value
          if (channel.value == 1) {
            slug = 'ship'
            id = ship.value
          }

          var url = `${apiHost}allotments/${slug}/${id}`
          utils.api(JSON.stringify(info), url, 'POST', clone.deploy)
        }
      })
    }

    // clone form events
    const arriveClone = document.querySelector('[name="date-clone"]')
    if (arriveClone != null) {
      flatpickr(arriveClone, {
        dateFormat: 'Y-m-d',
        minDate: 'today'
      })
    }

    const channelClone = document.querySelector('[name="channel-clone"]')
    if (channelClone != null) {
      channelClone.addEventListener('change', (e) => {
        e.preventDefault()
        clone.changeChannel(e.target.value, 'clone')
      })
    }

    const shipClone = document.querySelector('[name="ship-clone"]')
    if (shipClone != null) {
      shipClone.append(new Option(defaultOption))

      const shipContent = shipClone.closest('.form-group')
      shipContent.classList.add('d-none')
    }

    const resellerClone = document.querySelector('[name="reseller-clone"]')
    if (resellerClone != null) {
      resellerClone.append(new Option(defaultOption))

      resellerClone.addEventListener('change', (e) => {
        e.preventDefault()
        var url = `${apiHost}arrives/shipsarrive/${e.target.value}`

        if (channelClone.value !== 2) {
          let id = null
          const ship = document.querySelector('[name="ship"]')

          if (ship !== null) {
            id = parseInt(ship.value, 10)
          }

          const data = {
            id: id,
            key: 'ship_name',
            value: 'ship_id',
            element: document.querySelector('[name="ship-clone"]')
          }

          arriveClone.value = dataFilter[0].start_date

          utils.api(JSON.stringify({}), url, 'GET', clone.deployOptions, data)
        }
      })
    }

    const btnClone = document.querySelector('.save')
    if (btnClone !== null) {
      const btnsContent = btnClone.closest('.error-simulator')

      btnsContent.classList.add('d-flex', 'justify-content-end')
      btnsContent.classList.remove('offset-sm-2', 'col-sm-10')

      btnClone.innerText = 'Clone configuration'
      btnClone.classList.add('ml-2')

      btnClone.addEventListener('click', (e) => {
        e.preventDefault()
        var valid = 'true'

        var form = btnClone.closest('form')
        var fields = form.querySelectorAll('[data-validator]')

        valid = utils.dataValidator(fields)

        if (valid) {
          clone.confirm()
        }
      })
    }

    const cancel = document.querySelector('.cancel')
    if (cancel != null) {
      cancel.addEventListener('click', (e) => {
        e.preventDefault()

        const form = document.querySelector('#clone-form')
        form.reset()
      })
    }

    // Schedule generates
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

        clone.loadData()
      })
    }
  },
  confirm: () => {
    const confirmModal = document.querySelector('#confirm-modal-content')
    const message = utils.createElement('p', '', '', 'Are you sure you want to clone allotments?')

    confirmModal.innerHTML = ''
    confirmModal.append(message)

    const btnConfirm = document.querySelector('.confirm-delete')

    btnConfirm.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopImmediatePropagation()

      MicroModal.close()

      clone.initClone()
    })

    MicroModal.show('confirm-modal')
  },
  initClone: () => {
    const allotment = {}

    const form = document.querySelector('#clone-form')

    allotment.user = user
    allotment.type_sim = 'N'
    allotment.date = form.querySelector('[name="date-clone"]').value
    allotment.cruise = parseInt(form.querySelector('[name="ship-clone"]').value ,10)
    allotment.channel = parseInt(form.querySelector('[name="channel-clone"]').value ,10)
    allotment.vendor = parseInt(form.querySelector('[name="reseller-clone"]').value ,10)

    let list = []
    const rows = document.querySelectorAll('.row-allotments')
    // Build array of allotmeent data
    for (let i = 0, l = rows.length; i < l; i++) {
      const id = rows[i].id

      const item = {}

      item.shared_schedule = 0
      if (document.querySelector(`#shared${id}`).checked) {
        item.shared_schedule = 1
      }

      item.private_service = 0
      if (document.querySelector(`#private${id}`).checked) {
        item.private_service = 1
      }

      item.clone = 0
      if (document.querySelector(`#clone${id}`).checked) {
        item.clone = 1
      }

      item.message = ''
      item.available = ''
      item.service_name = rows[i].innerText
      item.overlap = document.querySelector(`#overlap${id}`).value
      item.schedule_end = document.querySelector(`#hrEnd${id}`).value
      item.service_id = parseInt(rows[i].getAttribute('service_id'), 10)
      item.schedule_start = document.querySelector(`#hrStart${id}`).value
      item.arrive_id = parseInt(document.querySelector(`#arriveId${id}`).value, 10)
      item.min_available = parseInt(document.querySelector(`#min${id}`).value, 10)
      item.max_available = parseInt(document.querySelector(`#max${id}`).value, 10)
      item.active_status = parseInt(document.querySelector(`#status${id}`).dataset.status, 10)
      item.available_status = parseInt(document.querySelector(`#status${id}`).dataset.status, 10)

      if (id.split('-').length > 0) {
        item.allotment_id = null
      } else {
        parseInt(id, 10);
      }

      list.push(item)
    }

    const info = {}

    info.list = list
    info.newAllotment = allotment

    utils.api(JSON.stringify(info), `${apiHost}allotments/clonealloments`, 'POST', clone.deploy)
  },
  deploy: (response) => {
    try {
      MicroModal.close('wait-modal')
      response = JSON.parse(response)

      const table = document.querySelector('#allotments-clone')
      const content = document.querySelector('.table-clone')
      const cloneContent = document.querySelector('.clone-details')

      utils.dropTable(table)

      const nodeTable = utils.createElement('table', '', 'allotments-clone', '')

      content.appendChild(nodeTable)

      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        configTable = clone.getTableConfig([])

        let registers = response.message
        if (utils.isJson(registers)) {
          registers = JSON.parse(registers)
          registers = registers.list
        }

        configTable = clone.getTableConfig(registers)

        if (response.code === 404) {
          utils.displayModal(alertModal, 'Not found allotment with the data selected')
        } else {
          utils.displayModal(alertModal, 'Something wrong! More information in the respective row')
        }

        cloneContent.classList.add('d-none')

        $(nodeTable).DataTable(configTable).draw()
      } else {
        let registers = response.message
        if (utils.isJson(registers)) {
          registers = JSON.parse(registers)
          registers = registers.list
        }

        let arriveId= null
        for (let i = 0; i < registers.length; i++) {
          arriveId = registers[i].arrive_id
          registers[i].addPlusIcon = true
        }

        // Get arrive information
        utils.api(JSON.stringify(''), `${apiHost}arrives/${arriveId}`, 'GET', clone.arriveDeploy)

        dataFilter = registers

        configTable = clone.getTableConfig(registers)

        $(nodeTable).DataTable(configTable).draw()

        flatpickr('.time-format', {
          enableTime: true,
          noCalendar: true,
          dateFormat: 'H:i',
          time_24hr: true
        })

        flatpickr('.overlap', {
          enableTime: true,
          noCalendar: true,
          dateFormat: 'H:i',
          time_24hr: true
        })

        const addElements = document.querySelectorAll('.add')
        for (let i = 0; i < addElements.length; i++) {
          addElements[i].addEventListener('click', (e) => {
            e.preventDefault()

            let element = e.target
            if (!e.target.getAttribute('data-column')) {
              element = e.target.parentElement
            }

            clone.addNewRow(element)
          })
        }

        cloneContent.classList.remove('d-none')

        const cloneChk = document.querySelector('.cloneAll')

        if (cloneChk != null) {
          cloneChk.addEventListener('click', (e) => {
            const cloneBtns = document.querySelectorAll('.clone')

            for(let i = 0, l = cloneBtns.length; i < l; i++) {
              cloneBtns[i].checked ^= 1
            }
          })
        }
      }
    } catch (e) {
      utils.displayModal(alertModal, '')
    }
  },
  arriveDeploy: (response) => {
    try {
      MicroModal.close('wait-modal')
      response = JSON.parse(response)

      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        if (response.code === 404) {
          utils.displayModal(alertModal, 'Not found arrive data')
        } else {
          utils.displayModal(alertModal, response.message)
        }
      } else {
        const item = response.message

        arriveData = {
          id: item.arrive_id,
          ship_name: item.ship_name,
          channel_id: item.channel_id,
          reseller_id: item.reseller_id,
          channel_name: item.channel_name,
          reseller_name: item.reseller_name,
          active: item.active_status,
          ship_id: item.ship_id,
          markup_end: item.markup_end,
          arrival_date: item.arrival_date,
          markup_start: item.markup_start,
          arrival_time: item.arrival_time,
          departure_time: item.departure_time,
          arrival_time_markup: item.arrival_time_markup,
          departure_time_markup: item.departure_time_markup
        }
      }
    } catch (e) {
      utils.displayModal(alertModal, '')
    }
  },
  changeChannel: (channelOption, target) => {
    let url = `${apiHost}resellers/channel/${channelOption}`
    if (channelOption !== 2) {
      url = `${apiHost}arrives/vendorarrive/list`
    }

    let id = null
    let element = document.querySelector('[name="reseller"]')
    let shipContent = document.querySelector('[name="ship"]').closest('.form-group')

    if (target === 'clone') {
      id = parseInt(element.value, 10)
      element = document.querySelector('[name="reseller-clone"]')
      shipContent = document.querySelector('[name="ship-clone"]').closest('.form-group')
    }

    if (channelOption != 2) {
      shipContent.classList.remove('d-none')
    } else {
      shipContent.classList.add('d-none')
    }

    const data = {
      id: id,
      key: 'reseller_name',
      value: 'reseller_id',
      element: element
    }

    utils.api(JSON.stringify({}), url, 'GET', clone.deployOptions, data)
  },
  deployOptions: (response, data) => {
    response = JSON.parse(response)

    utils.removeOptions(data.element, 0)

    utils.buildOptions(data, response.message, 1)

    if (data.id !== null) {
      data.element.dispatchEvent(new Event('change'))
    }

    if (data.element.id == 'ship-clone') {
      clone.getServicesEquivalences(data.id)
    }

    MicroModal.close('wait-modal')
  },
  getServicesEquivalences: (id) => {
    const service = document.querySelector('[name="service"]')

    if (service != null) {
      service.append(new Option('-- Choose option --', ''))

      utils.api(JSON.stringify({}), `${apiHost}equivalences/ship/${id}`, 'GET', clone.serviceList, service)
    }
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

        const wrapper = element.closest('.schedules')
        if (wrapper != null) {
          wrapper.classList.remove('d-none')
        }

        utils.buildOptions(data, response.message, 1)
      }
    } catch (e) {
      utils.displayModal(alertModal, '')
    }
  },
  addNewRow: (element) => {
    const registers = []
    const data = JSON.parse(element.dataset.column)

    data.addPlusIcon = false
    data.allotment_id = `${data.allotment_id}-${count}`

    registers.push(data)

    count++
    const table = $('#allotments-clone').DataTable()

    table.rows.add(registers).draw()

    flatpickr(`#hrStart${data.allotment_id}`, {
      enableTime: true,
      noCalendar: true,
      dateFormat: 'H:i',
      time_24hr: true
    })

    flatpickr(`#hrEnd${data.allotment_id}`, {
      enableTime: true,
      noCalendar: true,
      dateFormat: 'H:i',
      time_24hr: true
    })

    flatpickr(`#overlap${data.allotment_id}`, {
      enableTime: true,
      noCalendar: true,
      dateFormat: 'H:i',
      time_24hr: true
    })
  },
  loadData: () => {
    var valid = true
    const fields = document.querySelectorAll('[data-validator]')

    valid = utils.dataValidator(fields)

    if (valid) {
      const service = document.querySelector('[name="service"]')
      const overlap = document.querySelector('[name="overlap"]')
      const ship = document.querySelector('[name="ship-clone"]')
      const arriveDate = document.querySelector('[name="date-clone"]')

      const info = {
        arrive: arriveData,
        overlap: overlap.value,
        service: service.value,
        ship: parseInt(ship.value, 10),
        start_date: arriveDate.value,
        channel_id: arriveData.channel_id
      }

      utils.api(JSON.stringify(info), `${apiHost}allotments/shipservice`, 'POST', clone.addTour)
    }
  },
  addTour:(response) => {
    try {
      MicroModal.close('wait-modal')
      response = JSON.parse(response)

      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        if (response.code === 404) {
          utils.displayModal(alertModal, 'Not found schedules')
        } else {
          utils.displayModal(alertModal, response.message)
        }
      } else {
        const row = {}
        const data = response.message
        const service = document.querySelector('[name="service"]')

        const element = utils.createElement('span', 'fake-element', '', '')

        for (let i = 0; i < data.length; i++) {
          row.allotment_id = data[i].arrive_id
          row.channel_id = arriveData.channel_id
          row.reseller_id = arriveData.reseller_id
          row.arrive_id =  arriveData.id
          row.ship_id = arriveData.ship_id
          row.service_id = data[i].service_id
          row.service_name = service.options[service.selectedIndex].text
          row.service_equivalence_name = service
          row.start_date = arriveData.arrival_date
          row.end_date = arriveData.arrival_date
          row.schedule_start = data[i].schedule_start
          row.schedule_end = data[i].schedule_end
          row.overlap = data[i].overlap
          row.shared_schedule = data[i].shared_schedule
          row.private_service = 0
          row.min_available = data[i].min_available,
          row.max_available = data[i].max_available
          row.active_status =  1
          row.addPlusIcon = true
          row.clone = 1

          element.setAttribute('data-column', JSON.stringify(row))
          clone.addNewRow(element)
        }
      }
    } catch (e) {
      console.log(e)
      utils.displayModal(alertModal, '')
    }
  },
  getTableConfig: (registers) => {
    const config = {
        info:false,
        paging: false,
        responsive: true,
        searching: false,
        fixedHeader: true,
        initComplete: function() {
          const table = this.api();

          const wrapper = utils.createElement('div', 'form-check', '')

          const label = utils.createElement('label', 'form-check-label', '')
          label.setAttribute('for', 'cloneAll')
          label.innerText = 'Clone'

          const checkClones = utils.createElement('input', 'cloneAll form-check-input', 'cloneAll')
          checkClones.setAttribute('type', 'checkbox')
          checkClones.setAttribute('name', 'cloneAll')
          checkClones.setAttribute('checked', true)

          wrapper.append(checkClones)
          wrapper.append(label)

          table.column(8).header().innerHTML = wrapper.outerHTML
        }
    }

    const columns = [
      {
        title: 'Service',
        data: 'allotment_id',
        render: (data, type, row, meta) => {
          const service = utils.createElement('span', 'row-allotments', data, row.service_name)
          service.setAttribute('service_id', row.service_id)

          const arrive = utils.createElement('input', 'form-control', `arriveId${row.allotment_id}`)
          arrive.setAttribute('type', 'hidden')
          arrive.setAttribute('value', row.arrive_id)

          return `${service.outerHTML} ${arrive.outerHTML}`
        }
      },
      {
        title: 'Schedule start',
        data: 'schedule_start',
        render: (data, type, row, meta) => {
          const scheduleStart = utils.createElement('input', 'form-control hrStart time-format', `hrStart${row.allotment_id}`)

          scheduleStart.setAttribute('value', data)
          scheduleStart.setAttribute('type', 'text')

          return scheduleStart.outerHTML
        }
      },
      {
        title: 'Schedule End',
        data: 'schedule_end',
        render: (data, type, row, meta) => {
          const scheduleEnd = utils.createElement('input', 'form-control hrEnd time-format', `hrEnd${row.allotment_id}`)

          scheduleEnd.setAttribute('value', data)
          scheduleEnd.setAttribute('type', 'text')

          return scheduleEnd.outerHTML
        }
      },
      {
        title: 'Minimum',
        data: 'min_available',
        render: (data, type, row, meta) => {
          const minAvailable = utils.createElement('input', 'form-control min', `min${row.allotment_id}`)

          minAvailable.setAttribute('value', data)
          minAvailable.setAttribute('type', 'number')

          return minAvailable.outerHTML
        }
      },
      {
        title: 'Maximum',
        data: 'max_available',
        render: (data, type, row, meta) => {
          const maxAvailable = utils.createElement('input', 'form-control max', `max${row.allotment_id}`)

          maxAvailable.setAttribute('value', data)
          maxAvailable.setAttribute('type', 'number')

          return maxAvailable.outerHTML
        }
      },
      {
        title: 'Shared',
        data: 'shared_schedule',
        render: (data, type, row, meta) => {
          const shared = utils.createElement('input', 'shared', `shared${row.allotment_id}`)

          shared.setAttribute('type', 'checkbox')

          if (data === 1) {
            shared.setAttribute('checked', true)
          }

          return shared.outerHTML
        }
      },
      {
        title: 'Private',
        data: 'private_service',
        render: (data, type, row, meta) => {
          const privateService = utils.createElement('input', 'private', `private${row.allotment_id}`)

          privateService.setAttribute('type', 'checkbox')

          if (data === 1) {
            privateService.setAttribute('checked', true)
          }

          return privateService.outerHTML
        }
      },
      {
        title: 'Overlap',
        data: 'overlap',
        render: (data, type, row, meta) => {
          const overlap = utils.createElement('input', 'form-control overlap', `overlap${row.allotment_id}`)

          overlap.setAttribute('type', 'text')
          overlap.setAttribute('value', data)

          return overlap.outerHTML
        }
      },
      {
        title: 'Clone',
        data: 'clone',
        orderable: false,
        render: (data, type, row, meta) => {
          const checkClone = utils.createElement('input', 'clone', `clone${row.allotment_id}`)

          checkClone.setAttribute('type', 'checkbox')
          if (data === undefined || data === 1) {
            checkClone.setAttribute('checked', true)
          }

          return checkClone.outerHTML
        }
      },
      {
        title: 'Status',
        data: 'active_status',
        render: (data, type, row, meta) => {
          const status = utils.createElement('span', 'badge badge-danger', `status${row.allotment_id}`, 'Inactive')

          if (row.available_status !== undefined) {
            data = row.available_status
          }

          if (data === 1) {
            status.innerHTML = 'Active'
            status.classList.add('badge-success')
            status.classList.remove('badge-danger')
          }

          status.setAttribute('data-status', data)

          return status.outerHTML
        }
      },
      {
        title: 'Actions',
        data: 'addPlusIcon',
        orderable: false,
        render: (data, type, row, meta) => {
          if (data) {
            const addNew = utils.createElement('a', 'add', '', '')

            addNew.setAttribute('href', '#')
            addNew.setAttribute('data-column', JSON.stringify(row))

            const plus = utils.createElement('i', 'fas fa-plus', '', '')

            addNew.append(plus)

            return addNew.outerHTML
          }

          return ''
        }
      },
      {
        title: 'Message',
        data: 'message',
        orderable: false,
        render: (data, type, row, meta) => {
          const message = utils.createElement('span', 'message', '', data)

          return message.outerHTML
        }
      },
    ]

    config.data = registers
    config.columns = columns

    return config
  }
}

clone.init()

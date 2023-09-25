'use strict'
var url
var info
var form
var userCreateId = window.user_create_id
var configTable = utils.getDataTableConfig()

const sale_report = {
  initPermissions: () => {
    utils.post(
      JSON.stringify({ table: 'bookings' }),
      `${base}/users/permissions`,
      utils.setPermissions
    )
  },
  init: () => {
    const searchBtn = document.querySelector('.search')
    if (searchBtn !== null) {
      searchBtn.addEventListener(clickEvent, (e) => {
        e.preventDefault()
        sale_report.load()
      })
    }

    const exportBtn = document.querySelector('.export')
    if (exportBtn !== null) {
      exportBtn.addEventListener(clickEvent, (e) => {
        e.preventDefault()

        const dates = document.querySelector('[name="dates"]').value
        let start_date =''
        let end_date = ''

        if (dates.trim() !== '') {
          const aDates = dates.split(' to ')

          start_date = aDates[0]
          end_date = aDates[0]
          if (aDates.length === 2) {
            end_date = aDates[1]
          }
        } else {
          start_date = utils.getDate()
          end_date = utils.getDate(1)
        }

        url = `${base}/sale-reports/export/${start_date}/${end_date}`

        window.open(url)
      })
    }

    const exportGlobalBtn = document.querySelector('.global-export')
    if (exportGlobalBtn !== null) {
      exportGlobalBtn.addEventListener(clickEvent, (e) => {
        e.preventDefault()

        const dates = document.querySelector('[name="dates"]').value
        let start_date =''
        let end_date = ''

        if (dates.trim() !== '') {
          const aDates = dates.split(' to ')

          start_date = aDates[0]
          end_date = aDates[0]
          if (aDates.length === 2) {
            end_date = aDates[1]
          }
        } else {
          start_date = utils.getDate()
          end_date = utils.getDate(1)
        }

        url = `${base}/sale-reports/export-global/${start_date}/${end_date}`

        window.open(url)
      })
    }

    let datepicker = document.querySelector('[name="dates"]')
    if (datepicker !== null) {
      datepicker.parentElement.parentElement.classList.add('disable')
      datepicker.flatpickr({
        altFormat: 'F j, Y',
        dateFormat: 'Y-m-d',
        defaultDate: 'today',
        altInput: true,
        mode: 'range'
      })
    }

    let servicesTable = document.querySelector('#table-sales')
    if (servicesTable !== null) {
      $(function () {
        $('#table-sales').dataTable(utils.getDataTableConfig())
        let tbl = $('#table-sales').DataTable()
        let dataRows = tbl.rows().data()

        if(dataRows[0][0]==='') {
          document.querySelector('.export').classList.add('d-none')
          document.querySelector('.global-export').classList.add('d-none')
        }
        else {
          document.querySelector('.export').classList.remove('d-none')
          document.querySelector('.global-export').classList.remove('d-none')
        }

      })
    }
  },
  load: function() {
    const info = {}
    url = `${apiHost}bookings_detail/bookings`
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

    utils.api(JSON.stringify(info), url, 'POST', sale_report.deploy)

  },
  deploy: function (response) {
    try {
      MicroModal.close('wait-modal')
      response = JSON.parse(response)

      const table = document.querySelector('#table-sales')

      utils.dropTable(table)

      const content = document.querySelector('.table-sales')
      const nodeTable = utils.createElement('table', '', 'table-sales', '')

      content.appendChild(nodeTable)

      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        configTable = sale_report.getTableConfig([])

        if (response.code === 404) {
          utils.displayModal(alertModal, 'Not found sales with the selected data')
        } else {
          utils.displayModal(alertModal, response.message)
        }

        $(nodeTable).DataTable(configTable).draw()
      } else {
        const registers = response.message

        configTable = sale_report.getTableConfig(registers)

        $(nodeTable).DataTable(configTable).draw()
      }
    } catch (e) {
      console.log(e)
      utils.displayModal(alertModal, '')
    }

    let tbl = $('#table-sales').DataTable()
    let tblSettings = tbl.rows().data()

    if(tblSettings.length === 0) {
      document.querySelector('.export').classList.add('d-none')
      document.querySelector('.global-export').classList.add('d-none')
    }
    else {
      document.querySelector('.export').classList.remove('d-none')
      document.querySelector('.global-export').classList.remove('d-none')
    }
  },
  getTableConfig: (registers) => {
    const config = utils.getDataTableConfig()

    const columns = [
      { data: 'booking_reference', title: 'Booking' },
      { data: 'service_name', title: 'Service' },
      { data: 'schedule_start', title: 'Schedule' },
      { data: 'pax_name', title: 'Pax' },
      { data: 'quantity', title: 'Quantity' },
      {
        data: 'status_name',
        title: 'Status',
        render: (data, type, row, meta) => {
          let  labelStatus = 'success'

          if (data !== 'Confirmed') {
            labelStatus = 'danger'
          }

          const status_name = utils.createElement('span', `badge badge-${labelStatus}`, row.booking_id,data)
          return status_name.outerHTML

        }
      }
    ]

    config.order = [2, 'asc']
    config.data = registers
    config.columns = columns

    return config
  }
}

sale_report.init();

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
      })
    }
  },
  load:function(){
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
          utils.displayModal(alertModal, 'Not found calls with the selected data')
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
  },
}

sale_report.init();





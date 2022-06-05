'use strict'
var configTable = utils.getDataTableConfig()
const formUpdate = document.querySelector('.update-form')

configTable.searching = false
configTable.order = [2, 'ASC']
configTable.paging = false

var lmps = {
  initPermissions: () => {
    utils.post(
      JSON.stringify({table:'diary'}),
      `${base}/users/permissions`,
      lmps.calendarInit
    )
  },
  refresh: function (response) {
    try {
      MicroModal.close('wait-modal')

      response = JSON.parse(response)

      var actionButtons = document.querySelector('#form-diary')
      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        utils.displayModal(alertModal, response.message)

      } else if (response.code === 200) {
        var data = JSON.parse(response.message)

        var total = document.querySelector('.price')
        var specs = document.querySelector('.specs')
        var container = document.getElementById('list')
        var chart = document.querySelector('.featured')

        if (document.querySelector('.msg-title') !== null) {
          document.querySelector('.msg-title').remove()
        }

        specs.innerHTML = data.tours
        total.innerText = data.total_tours
        container.innerHTML = data.details

        chart.classList.remove('d-none')

        lmps.tableInit()
      }
    } catch (e) {
      console.log(e)
      utils.displayModal(alertModal, '')
    }
  },
  tableInit: function () {
    MicroModal.close('wait-modal')

    var tourDetails = document.querySelector('.details-registers')
    if (tourDetails !== null) {
      $(function () {
        $('.details-registers').dataTable(configTable)
      })
    }
  },
  calendarInit: function (response) {
    MicroModal.close('wait-modal')

    try {
      response = JSON.parse(response)
      if (!Object.prototype.hasOwnProperty.call(codes, response.code)) {
        const data = response.message

        const element = document.querySelector('.flatpickr')
        if (element != null) {
          let configFlat = {
            altInput: true,
            dateFormat: 'Y-m-d',
            altFormat: 'l J F Y',
            defaultDate: new Date(),
            disableMobile: true,
            onChange: function (selectedDates, dateStr, instance) {
              var data = {
                date: dateStr,
                channel: 'lmps'
              }

              const url = `${base}/diary/get_diary`
              utils.post(JSON.stringify(data), url, lmps.refresh)
            }
          }

          if (data.s === 0) {
            configFlat.maxDate = new Date().fp_incr(1)
          }

          flatpickr(element, configFlat)
        }
      }
    } catch (e) {
      console.log(e)
      utils.displayModal(alertModal, '')
    }
  }
}

var printButton = document.querySelector('[name="print"]')
if (printButton !== null) {
  var icon = utils.createElement('i', 'fa fa-print', '', '')
  printButton.appendChild(icon)

  printButton.addEventListener('click', function (e) {
    e.preventDefault()

    var date = document.querySelector('[name="inputDate"]').value
    var endpoint = `${base}/diary/print/${date}`

    window.open(endpoint, '_blank')
  })
}

lmps.initPermissions()
lmps.tableInit()

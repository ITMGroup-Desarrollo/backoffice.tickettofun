'use strict'
var configTable = utils.getDataTableConfig()
const formUpdate = document.querySelector('.update-form')

configTable.searching = false
configTable.order = [2, 'ASC']
configTable.paging = false

var diary = {
  initPermissions: () => {
    utils.post(
      JSON.stringify({table:'diary'}),
      `${base}/users/permissions`,
      diary.calendarInit
    )
  },
  refresh: function (response) {
    try {
      MicroModal.close('wait-modal')

      response = JSON.parse(response)

      var total = document.querySelector('.price')
      var specs = document.querySelector('.specs')
      var container = document.getElementById('list')
      var chart = document.querySelector('.featured')
      var msgTitle = document.querySelector('.msg-title')
      var sendBtn = document.querySelector('[name="send"]')
      var printBtn = document.querySelector('[name="print"]')

      var actionButtons = document.querySelector('#form-diary')
      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        utils.displayModal(alertModal, response.message)

        specs.innerHTML = ''
        total.innerText = '0'
        container.innerHTML = ''
        msgTitle.innerText = 'Not found calls for this date'

        actionButtons.classList.add('d-none')
        chart.classList.add('d-none')

        if (sendBtn !== null) {
          sendBtn.classList.add('d-none')
        }

        if (sendBtn !== null) {
          printBtn.classList.add('d-none')
        }
      } else if (response.code === 200) {
        var data = JSON.parse(response.message)

        specs.innerHTML = data.tours
        total.innerText = data.total_tours
        msgTitle.innerText = ''
        container.innerHTML = data.details

        actionButtons.classList.remove('d-none')
        chart.classList.remove('d-none')

        if (sendBtn !== null) {
          sendBtn.classList.remove('d-none')
        }

        if (sendBtn !== null) {
          printBtn.classList.remove('d-none')
        }

        diary.setActions()
        diary.tableInit()
      }
    } catch (e) {
      utils.displayModal(alertModal, '')
    }
  },
  setActions: function () {
    const btnsUpdate = document.querySelectorAll('[name="btn_modal_update"]')
    for (let i = 0, l = btnsUpdate.length; i < l; i++) {
      btnsUpdate[i].addEventListener('click', function (e) {
        e.preventDefault()

        var idCall = e.target.getAttribute('data-id-arrive')

        diary.loadForm(idCall)
      })
    }

    const businessUnit = document.querySelector('[name="business_unit"]')
    if (businessUnit !== null) {
      businessUnit.addEventListener('change', (e) => {
        e.preventDefault()

        var data = {
          date: document.querySelector('[name="inputDate"]').value,
          business_unit_id: parseInt(e.target.value, 10)
        }

        const url = `${base}/diary/get_diary`
        utils.post(JSON.stringify(data), url, diary.refresh)
      });
    }
  },
  tableInit: function () {
    var tourDetails = document.querySelector('.details-registers')
    if (tourDetails !== null) {
      $(function () {

        configTable.autoWidth = false
        configTable.order = [[2, 'asc']]

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
          const date = new Date(Date.now())

          const month = date.getMonth()
          const year = date.getFullYear()
          const maxDate = utils.dateFormat('Y-m-d', new Date(year, month + 1, 7))

          let configFlat = {
            altInput: true,
            dateFormat: 'Y-m-d',
            altFormat: 'l J F Y',
            defaultDate: new Date().fp_incr(1),
            disableMobile: true,
            onChange: function (selectedDates, dateStr, instance) {
              const businessUnit = document.querySelector('[name="business_unit"]') ?? 1
              var data = {
                date: dateStr,
                business_unit_id: parseInt(businessUnit.value, 10)
              }

              const url = `${base}/diary/get_diary`
              utils.post(JSON.stringify(data), url, diary.refresh)
            }
          }

          if (data.s === 0) {
            configFlat.maxDate = maxDate
          }

          flatpickr(element, configFlat)
        }
      }
    } catch (e) {
      utils.displayModal(alertModal, '')
    }
  },
  loadForm: function (idCall) {
    let inputElement

    // Clean previous datas
    diary.resetForm()

    // Fill list
    const items = document.querySelectorAll(`[data-id-odd="${idCall}"] > [data-name], [data-id-pair="${idCall}"] > [data-name]`)

    for (let i = 0, l = items.length; i < l; i++) {
      const id = items[i].getAttribute('data-name')
      let text = items[i].innerText.split(':')[1].trim()

      inputElement = document.querySelector(`[name="${id}"`)
      if (inputElement != null) {
        inputElement.value = text

        if (id === 'port_destiny' && text === '') {
          inputElement.value = 'Costa Maya'
        }

        if (id === 'all_aboard') {
          if (text !== '') {
            text = items[i].innerText.split(': ')[1];
            inputElement.value = `${text.trim()}`
          }

          inputElement.flatpickr({
            enableTime: true,
            noCalendar: true,
            dateFormat: 'H:i',
            defaultDate: text,
            time_24hr: true
          })
        }
      }
    }

    const btnUpdate = document.querySelector('.confirm-delete')
    if (btnUpdate !== null) {
      btnUpdate.innerText = 'Update'

      btnUpdate.setAttribute('data-id-arrive', idCall)
    }

    MicroModal.show('confirm-modal')
  },
  resetForm: function () {
    if (formUpdate !== null) {
      formUpdate.reset()
    }
  },
  sendmail: function (response) {
    try {
      MicroModal.close('wait-modal')

      response = JSON.parse(response)

      utils.displayModal(alertModal, response.message)
    } catch (e) {
      utils.displayModal(alertModal, '')
    }
  },
  saveInformation: function (idCall) {
    var data = {
      all_aboard_time: formUpdate.querySelector('[name="all_aboard"]').value,
      shorex_name: formUpdate.querySelector('[name="shorex_manager"]').value,
      assistant_name: formUpdate.querySelector('[name="assistant_name"]').value,
      home_port_name: formUpdate.querySelector('[name="home_port"]').value,
      origin_port_name: formUpdate.querySelector('[name="origin_port"]').value,
      destiny_port_name: formUpdate.querySelector('[name="port_destiny"]').value,
      next_port_name: formUpdate.querySelector('[name="next_port"]').value,
      ship_time: formUpdate.querySelector('[name="ship_time"]').value
    }

    const url = `${apiHost}arrives/edit/extra_data/${idCall}`
    utils.api(JSON.stringify(data), url, 'PUT', diary.setInformation, idCall)
  },
  setInformation: function (response, idCall) {
    try {
      MicroModal.close('wait-modal')

      response = JSON.parse(response)

      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        utils.displayModal(alertModal, response.message)

        diary.resetForm()
      } else if (response.code === 200) {
        utils.displayModal(alertModal, response.message)

        const inputElements = formUpdate.querySelectorAll('[name]')
        for (let i = 0, l = inputElements.length; i < l; i++) {
          const id = inputElements[i].getAttribute('name')

          let itemList = document.querySelector(`[data-id-odd="${idCall}"] > [data-name=${id}]`)
          if (itemList == null) {
            itemList = document.querySelector(`[data-id-pair="${idCall}"] > [data-name=${id}]`)
          }

          if (itemList !== null) {
            const text = itemList.innerText.split(':')[0]
            itemList.innerText = `${text}: ${inputElements[i].value}`
          }
        }

        diary.resetForm()
      }
    } catch (e) {
      utils.displayModal(alertModal, '')
    }
  }
}

var send = document.querySelector('[name="send"]')
if (send !== null) {
  send.addEventListener('click', function (e) {
    e.preventDefault()
    var data = {
      date: document.querySelector('[name="inputDate"]').value
    }

    utils.api(JSON.stringify(data), `${apiHost}general/sendmail`, 'POST', diary.sendmail)
  })
}

var modal = document.getElementById('confirm-modal-footer')
if (modal !== null) {
  var updateBtn = modal.querySelector('.confirm-delete')
  if (updateBtn != null) {
    updateBtn.addEventListener('click', function (e) {
      e.preventDefault()

      const idCall = parseInt(e.target.getAttribute('data-id-arrive'), 10)
      diary.saveInformation(idCall)
    })
  }
}

const confirmContent = document.querySelector('#confirm-modal-content')
if (confirmContent !== null) {
  if (formUpdate != null) {
    confirmContent.appendChild(formUpdate)
  }
}

var printButton = document.querySelector('[name="print"]')
if (printButton !== null) {
  var icon = utils.createElement('i', 'fa fa-print', '', '')
  printButton.appendChild(icon)

  printButton.addEventListener('click', function (e) {
    e.preventDefault()

    const businessUnit = document.querySelector('[name="business_unit"]').value ?? 1

    var date = document.querySelector('[name="inputDate"]').value
    var endpoint = `${base}/diary/print/${date}/${businessUnit}`

    window.open(endpoint, '_blank')
  })
}

diary.initPermissions()
diary.setActions()
diary.tableInit()

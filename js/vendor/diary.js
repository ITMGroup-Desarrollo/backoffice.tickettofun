'use strict'
var configTable = utils.getDataTableConfig()

configTable.searching = false
configTable.order = [2, 'ASC']
configTable.paging = false

var diary = {
  refresh: function (response) {
    try {
      MicroModal.close('wait-modal')

      response = JSON.parse(response)

      var actiionButtons = document.querySelector('#form-diary')
      if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
        utils.displayModal(alertModal, response.message)

        actiionButtons.classList.add('d-none')
      } else if (response.code === 200) {
        var data = JSON.parse(response.message)

        var total = document.querySelector('.price')
        var specs = document.querySelector('.specs')
        var container = document.getElementById('list')

        specs.innerHTML = data.tours
        total.innerText = data.total_tours
        container.innerHTML = data.details

        actiionButtons.classList.remove('d-none')

        $(function () {
          $('.details-registers').dataTable(configTable)
        })

        buildModal()
      }
    } catch (e) {
      utils.displayModal(alertModal, '')
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
  updateExtradata: function (response, idarrive) {
    MicroModal.close('wait-modal')
    response = JSON.parse(response)

    var _alertModal = ''
    var _message = ''
    if (response.code !== 200) {
      _alertModal = document.getElementById('alert-modal-content')
      _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    } else if (response.code === 200) {
      _alertModal = document.getElementById('alert-modal-content')
      _message = utils.createElement('p', '', '', 'Success! information updated correctly')
      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      var valueallaboard = document.querySelector('.allaboard').value
      var valueshorex = document.querySelector('.shorex').value
      var valueassistant = document.querySelector('.assistant').value
      var valueshiptime = document.querySelector('.shiptime').value
      var valueorigin = document.querySelector('.origin').value
      var valuedestiny = document.querySelector('.destiny').value
      var valuenextport = document.querySelector('.nextport').value

      var list1 = document.querySelector(`[data-list1="${idarrive}"]`)
      var list2 = document.querySelector(`[data-list2="${idarrive}"]`)

      var text1 = 'All aboard: ' + valueallaboard
      var text2 = 'Shorex mgr: ' + valueshorex
      var text3 = 'Assist: ' + valueassistant
      var text4 = 'Ship time:  ' + valueshiptime
      var text5 = 'Origin: ' + valueorigin
      var text6 = 'Destiny: ' + valuedestiny
      var text7 = 'Next Port: ' + valuenextport

      text1 = utils.createElement('li', '', '', text1)
      text2 = utils.createElement('li', '', '', text2)
      text3 = utils.createElement('li', '', '', text3)
      text4 = utils.createElement('li', '', '', text4)
      text5 = utils.createElement('li', '', '', text5)
      text6 = utils.createElement('li', '', '', text6)
      text7 = utils.createElement('li', '', '', text7)

      list1.innerHTML = ''
      list1.appendChild(text1)
      list1.appendChild(text2)
      list1.appendChild(text3)
      list1.appendChild(text4)
      list2.innerHTML = ''
      list2.appendChild(text5)
      list2.appendChild(text6)
      list2.appendChild(text7)

      var btnmModalUupdate = document.querySelector(`[data-idarrive="${idarrive}"]`)
      btnmModalUupdate.setAttribute('data-allaboard', valueallaboard)
      btnmModalUupdate.setAttribute('data-shorex', valueshorex)
      btnmModalUupdate.setAttribute('data-assistant', valueassistant)
      btnmModalUupdate.setAttribute('data-ship', valueshiptime)
      btnmModalUupdate.setAttribute('data-origin', valueorigin)
      btnmModalUupdate.setAttribute('data-destiny', valuedestiny)
      btnmModalUupdate.setAttribute('data-next', valuenextport)
      MicroModal.show('alert-modal')
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

var element = document.querySelector('.flatpickr')
if (element != null) {
  var container = document.querySelector('.date-container')

  container.append(element)

  var date = new Date(Date.now())
  var month = date.getMonth()
  var year = date.getFullYear()

  var maxDate = utils.dateFormat('Y-m-d', new Date(year, month + 1, 7))

  flatpickr(element, {
    altInput: true,
    maxDate: maxDate,
    dateFormat: 'Y-m-d',
    altFormat: 'l J F Y',
    defaultDate: new Date().fp_incr(1),
    disableMobile: true,
    onChange: function (selectedDates, dateStr, instance) {
      var data = {
        date: dateStr
      }

      var url = `${base}diary/get_diary`
      utils.post(JSON.stringify(data), url, diary.refresh)
    }
  })
}

const buildModal = function () {
  var updateDataArrive = document.querySelectorAll('[name="btn_modal_update"]')
  if (updateDataArrive != null) {
    for (var i = 0; i < updateDataArrive.length; i++) {
      updateDataArrive[i].addEventListener('click', function (e) {
        e.preventDefault()

        var _alertModal = document.getElementById('confirm-modal-content')
        _alertModal.setAttribute('style', 'min-width:320px;')

        var valueallaboard = e.target.getAttribute('data-allaboard')
        var valueshorex = e.target.getAttribute('data-shorex')
        var valueassistant = e.target.getAttribute('data-assistant')
        var valueshiptime = e.target.getAttribute('data-ship')
        var valueorigin = e.target.getAttribute('data-origin')
        var valuenextport = e.target.getAttribute('data-next')
        var valueidarrive = e.target.getAttribute('data-idarrive')

        var _labelAllaboard = utils.createElement('span', 'control-label', '', 'All aboard:')
        var _inputAllaboard = utils.createElement('input', 'form-control allaboard', 'allaboard', '')
        _inputAllaboard.setAttribute('name', 'allaboard')
        _inputAllaboard.setAttribute('style', 'margin-bottom:15px;')
        _inputAllaboard.setAttribute('placeholder', 'HH:mm;')
        _inputAllaboard.setAttribute('readonly', 'readonly')
        _inputAllaboard.flatpickr({
          enableTime: true,
          noCalendar: true,
          dateFormat: 'H:i',
          defaultDate: valueallaboard,
          time_24hr: true
        })
        _inputAllaboard.setAttribute('maxlength', '5')
        _inputAllaboard.setAttribute('readonly', 'readonly')
        var _labelShorex = utils.createElement('span', 'control-label', '', 'Shorex mgr:')
        var _inputShorex = utils.createElement('input', 'form-control shorex', '', '')
        _inputShorex.setAttribute('name', 'shorex')
        _inputShorex.setAttribute('style', 'margin-bottom:15px;')
        _inputShorex.setAttribute('maxlength', '45')
        _inputShorex.setAttribute('value', valueshorex)
        var _labelAssist = utils.createElement('span', 'control-label', '', 'Assist:')
        var _inputAssist = utils.createElement('input', 'form-control assistant', '', '')
        _inputAssist.setAttribute('name', 'assistant')
        _inputAssist.setAttribute('style', 'margin-bottom:15px;')
        _inputAssist.setAttribute('maxlength', '45')
        _inputAssist.setAttribute('value', valueassistant)
        var _labelShiptime = utils.createElement('span', 'control-label', '', 'Ship time:')
        var _inputShiptime = utils.createElement('input', 'form-control shiptime', '', '')
        _inputShiptime.setAttribute('name', 'shiptime')
        _inputShiptime.setAttribute('style', 'margin-bottom:15px;')
        _inputShiptime.setAttribute('maxlength', '45')
        _inputShiptime.setAttribute('value', valueshiptime)
        var _labelOrigin = utils.createElement('span', 'control-label', '', 'Origin:')
        var _inputOrigin = utils.createElement('input', 'form-control origin', '', '')
        _inputOrigin.setAttribute('name', 'origin')
        _inputOrigin.setAttribute('style', 'margin-bottom:15px;')
        _inputOrigin.setAttribute('maxlength', '45')
        _inputOrigin.setAttribute('value', valueorigin)
        var _labelDestiny = utils.createElement('span', 'control-label', '', 'Destiny:')
        var _inputDestiny = utils.createElement('input', 'form-control destiny', 'destiny', '')
        _inputDestiny.setAttribute('name', 'destiny')
        _inputDestiny.setAttribute('style', 'margin-bottom:15px;')
        _inputDestiny.setAttribute('readonly', 'readonly')
        _inputDestiny.setAttribute('value', 'Costa Maya')
        var _labelNextPort = utils.createElement('span', 'control-label', '', 'Next Port:')
        var _inputNextPort = utils.createElement('input', 'form-control nextport', '', '')
        _inputNextPort.setAttribute('name', 'nextport')
        _inputNextPort.setAttribute('style', 'margin-bottom:15px;')
        _inputNextPort.setAttribute('maxlength', '45')
        _inputNextPort.setAttribute('value', valuenextport)

        _alertModal.innerHTML = ''
        _alertModal.appendChild(_labelAllaboard)
        _alertModal.appendChild(_inputAllaboard)
        _alertModal.appendChild(_labelShorex)
        _alertModal.appendChild(_inputShorex)
        _alertModal.appendChild(_labelAssist)
        _alertModal.appendChild(_inputAssist)
        _alertModal.appendChild(_labelShiptime)
        _alertModal.appendChild(_inputShiptime)
        _alertModal.appendChild(_labelOrigin)
        _alertModal.appendChild(_inputOrigin)
        _alertModal.appendChild(_labelDestiny)
        _alertModal.appendChild(_inputDestiny)
        _alertModal.appendChild(_labelNextPort)
        _alertModal.appendChild(_inputNextPort)

        var modal = document.getElementById('confirm-modal-footer')
        var saveExtradata = modal.querySelector('.confirm-delete')
        saveExtradata.setAttribute('data-arriveid', valueidarrive)

        MicroModal.show('confirm-modal')
      })
    }
  }
}

buildModal()

var modal = document.getElementById('confirm-modal-footer')
if (modal !== null) {
  var saveExtradata = modal.querySelector('.confirm-delete')
  if (saveExtradata != null) {
    saveExtradata.addEventListener('click', function () {
      saveExtradatafcn()
    })
  }
}

const saveExtradatafcn = function () {
  var idarrive = parseInt(saveExtradata.getAttribute('data-arriveid'))
  var valueallaboard = document.querySelector('.allaboard').value
  var valueshorex = document.querySelector('.shorex').value
  var valueassistant = document.querySelector('.assistant').value
  var valueshiptime = document.querySelector('.shiptime').value
  var valueorigin = document.querySelector('.origin').value
  var valuedestiny = document.querySelector('.destiny').value
  var valuenextport = document.querySelector('.nextport').value

  var valid = 'true'
  var fields = document.querySelectorAll('[data-validator]')

  valid = utils.dataValidator(fields)

  if (valid) {
    var data = {
      all_aboard_time: valueallaboard,
      shorex_name: valueshorex,
      assistant_name: valueassistant,
      origin_port_name: valueorigin,
      destiny_port_name: valuedestiny,
      next_port_name: valuenextport,
      ship_time: valueshiptime
    }

    var url = `${apiHost}arrives/edit/extra_data/${idarrive}`
    utils.api(JSON.stringify(data), url, 'PUT', diary.updateExtradata, idarrive)
  }
}

var printButton = document.querySelector('[name="print"]')
if (printButton !== null) {
  var icon = utils.createElement('i', 'fa fa-print', '', '')
  printButton.appendChild(icon)

  printButton.addEventListener('click', function (e) {
    e.preventDefault()

    var date = document.querySelector('[name="inputDate"]').value
    var endpoint = `${base}diary/print/${date}`

    window.open(endpoint, '_blank')
  })
}

var tourDetails = document.querySelector('.details-registers')
if (tourDetails !== null) {
  $(function () {
    $('.details-registers').dataTable(configTable)
  })
}

var lists = document.querySelectorAll('.list-group')
if (lists !== null) {
  for (var i = 0, l = lists.length; i < l; i++) {
    var items = lists[i].querySelectorAll('li')
    for (var j = 0, k = items.length; j < k; j++) {
      items[j].classList.add('list-group-item')
    }
  }
}

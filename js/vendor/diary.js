'use strict'

var diary = {
  setAction: function () {
    var modal = document.getElementById('confirm-modal-footer')
    if (modal !== null) {
      var saveExtradata = modal.querySelector('.confirm-delete')

      if (saveExtradata != null) {
        saveExtradata.addEventListener('click', function (e) {
          var idarrive = parseInt(e.target.getAttribute('data-idarrive'))
          saveExtradatafcn(idarrive)
        })
      }
    } else {
      diary.setAction()
    }
  },
  refresh: function (response) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)

    if (response.code !== 200) {
      var _alertModal = document.getElementById('alert-modal-content')
      var _message = utils.createElement('p', '', '', 'Can\'t load information')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    } else if (response.code === 200) {
      var data = JSON.parse(response.message)

      var total = document.querySelector('.price')
      var specs = document.querySelector('.specs')
      var container = document.getElementById('list')

      specs.innerHTML = data.tours
      total.innerText = data.total_tours
      container.innerHTML = data.details

      $(function () {
        $('.details-registers').dataTable({
          paging: false,
          searching: false,
          order: ([2, 'asc'])
        })
      })

      buildModal()
    }
  },
  sendmail: function (response) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)

    var _alertModal = document.getElementById('alert-modal-content')

    var _message = utils.createElement('p', '', '', response.message)
    _alertModal.innerHTML = ''
    _alertModal.appendChild(_message)

    MicroModal.show('alert-modal')
  },
  updateExtradata: function (response, idarrive) {
    MicroModal.close('wait-modal')
    response = JSON.parse(response)

    if (response.code !== 200) {
      var _alertModal = document.getElementById('alert-modal-content')
      var _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    } else if (response.code === 200) {
      var _alertModal = document.getElementById('alert-modal-content')
      var _message = utils.createElement('p', '', '', 'Success! information updated correctly')
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

var rol = window.user
var containerForm = document.querySelector('.content-form')

containerForm.style.cssFloat = 'right'
containerForm.style.margin = '-10px'

var tourDetails = document.querySelector('.details-registers')
if (tourDetails !== null) {
  $(function () {
    $('.details-registers').dataTable({
      paging: false,
      searching: false,
      order: ([2, 'asc'])
    })
  })
}

var send = document.querySelector('[name="send"]')
send.addEventListener('click', function (e) {
  e.preventDefault()
  var data = {
    date: document.querySelector('[name="inputDate"]').value
  }

  utils.api(JSON.stringify(data), `${apiHost}general/sendmail`, 'POST', diary.sendmail)
})

var element = document.querySelector('.flatpickr')
if (element != null) {
  var container = document.querySelector('.date-container')

  container.append(element)

  var date = new Date(Date.now())
  var month = date.getMonth()
  var year = date.getFullYear()

  var maxDate = utils.dateFormat('Y-m-d', new Date(year, month + 1, 0))

  flatpickr(element, {
    altInput: true,
    maxDate: maxDate,
    dateFormat: 'Y-m-d',
    altFormat: 'l J F Y',
    defaultDate: new Date().fp_incr(1),
    onChange: function (selectedDates, dateStr, instance) {
      var data = {
        date: dateStr
      }

      var url = 'diary/get_diary'
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
        var valuedestiny = e.target.getAttribute('data-destiny')
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
        _inputAllaboard.setAttribute('data-validator', 'empty')
        _inputAllaboard.setAttribute('data-validator-msg', 'The Allaboard is required!')
        _inputAllaboard.setAttribute('readonly', 'readonly')
        var _labelShorex = utils.createElement('span', 'control-label', '', 'Shorex mgr:')
        var _inputShorex = utils.createElement('input', 'form-control shorex', '', '')
        _inputShorex.setAttribute('name', 'shorex')
        _inputShorex.setAttribute('style', 'margin-bottom:15px;')
        _inputShorex.setAttribute('data-validator', 'empty')
        _inputShorex.setAttribute('data-validator-msg', 'The Shorex is required!')
        _inputShorex.setAttribute('value', valueshorex)
        var _labelAssist = utils.createElement('span', 'control-label', '', 'Assist:')
        var _inputAssist = utils.createElement('input', 'form-control assistant', '', '')
        _inputAssist.setAttribute('name', 'assistant')
        _inputAssist.setAttribute('style', 'margin-bottom:15px;')
        _inputAssist.setAttribute('data-validator', 'empty')
        _inputAssist.setAttribute('data-validator-msg', 'The Assistant is required!')
        _inputAssist.setAttribute('value', valueassistant)
        var _labelShiptime = utils.createElement('span', 'control-label', '', 'Ship time:')
        var _inputShiptime = utils.createElement('input', 'form-control shiptime', '', '')
        _inputShiptime.setAttribute('name', 'shiptime')
        _inputShiptime.setAttribute('style', 'margin-bottom:15px;')
        _inputShiptime.setAttribute('data-validator', 'empty')
        _inputShiptime.setAttribute('data-validator-msg', 'The Ship time is required!')
        _inputShiptime.setAttribute('value', valueshiptime)
        var _labelOrigin = utils.createElement('span', 'control-label', '', 'Origin:')
        var _inputOrigin = utils.createElement('input', 'form-control origin', '', '')
        _inputOrigin.setAttribute('name', 'origin')
        _inputOrigin.setAttribute('style', 'margin-bottom:15px;')
        _inputOrigin.setAttribute('data-validator', 'empty')
        _inputOrigin.setAttribute('data-validator-msg', 'The Origin is required!')
        _inputOrigin.setAttribute('value', valueorigin)
        var _labelDestiny = utils.createElement('span', 'control-label', '', 'Destiny:')
        var _inputDestiny = utils.createElement('input', 'form-control destiny', 'destiny', '')
        _inputDestiny.setAttribute('name', 'destiny')
        _inputDestiny.setAttribute('style', 'margin-bottom:15px;')
        _inputDestiny.setAttribute('data-validator', 'empty')
        _inputDestiny.setAttribute('data-validator-msg', 'The Destiny is required!')
        _inputDestiny.setAttribute('value', valuedestiny)
        var _labelNextPort = utils.createElement('span', 'control-label', '', 'Next Port:')
        var _inputNextPort = utils.createElement('input', 'form-control nextport', '', '')
        _inputNextPort.setAttribute('name', 'nextport')
        _inputNextPort.setAttribute('style', 'margin-bottom:15px;')
        _inputNextPort.setAttribute('data-validator', 'empty')
        _inputNextPort.setAttribute('data-validator-msg', 'The Next port is required!')
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
      origin_port_name: valueshiptime,
      destiny_port_name: valueorigin,
      next_port_name: valuedestiny,
      ship_time: valuenextport
    }

    var url = `${apiHost}arrives/edit/extra_data/${idarrive}`
    utils.api(JSON.stringify(data), url, 'PUT', diary.updateExtradata, idarrive)
  }
}

var _print = document.querySelector('[name="print"]')
if (_print !== null) {
  var _iconprint = utils.createElement('i', 'fa fa-print', '', '')
  _print.appendChild(_iconprint)

  _print.addEventListener('click', function (e) {
    var date = document.querySelector('[name="inputDate"]').value
    var url = '/itm-backoffice/diary/buil_pdf?date=' + date
    window.open(url, '_blank')
  })
}

if (rol !== 1 && rol !== 3) {
  containerForm.parentElement.removeChild(containerForm)
}

// diary.setAction()

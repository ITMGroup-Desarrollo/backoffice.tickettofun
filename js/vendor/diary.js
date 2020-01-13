'use strict'

var diary = {
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
          order: ([1, 'asc'])
        })
      })
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
      order: ([1, 'asc'])
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

if (rol !== 1 && rol !== 3) {
  containerForm.parentElement.removeChild(containerForm)
}

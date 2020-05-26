'use strict'
var info
var form
var boothData = window.booth
var repData = window.reps
var userCreateId = window.user_create_id
var listResellers = []

var booth = {
  add: function (response) {
    MicroModal.close('wait-modal')
    response = JSON.parse(response)
    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
      _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    } else if (response.code === 201) {
      _message = utils.createElement('p', '', '', 'Success! Booth added correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')

      form = document.querySelector('#add-booth')
      form.reset()
    }
  },
  update: function (response) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)
    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
      _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    } else if (response.code === 204) {
      _message = utils.createElement('p', '', '', 'Success! Booth updated correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  },
  delete: function (response, element) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)
    var id = element.getAttribute('data-id')
    element.style.display = 'none'

    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
      _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    } else if (response.code === 200) {
      var _status = document.querySelector(`[data-status="${id}"]`)
      _status.innerHTML = ''

      var label = utils.createElement('span', 'label label-danger', '', 'inactive')
      _status.appendChild(label)

      _message = utils.createElement('p', '', '', 'Success! Booth inactivate correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  },
  setData: function () {
    document.querySelector('[name="status"]').value = boothData.active
    document.querySelector('[name="booth_name"]').value = boothData.booth_name
    document.querySelector('[name="location"]').value = boothData.location_id
    for (var _count = 0; _count < repData.length; _count++) {
      if (repData[_count].booth_id === null) {
        document.getElementById('reps_select').innerHTML += '<option value="' + repData[_count].rep_id + '">' + repData[_count].fullname + '</option>'
      }
    }

    for (var _countBooth = 0; _countBooth < boothData.reps.length; _countBooth++) {
      if (boothData.reps[_countBooth].rep_id != null) {
        document.getElementById('reps_select').innerHTML += '<option selected value="' + boothData.reps[_countBooth].rep_id + '">' + boothData.reps[_countBooth].fullname + '</option>'
        var asignedRep = new Object
        asignedRep.rep_id = String(boothData.reps[_countBooth].rep_id)
        asignedRep.text = boothData.reps[_countBooth].fullname
        asignedRep.start_date = boothData.reps[_countBooth].start_date
        asignedRep.end_date = boothData.reps[_countBooth].end_date
        listResellers.push(asignedRep)
      }
    }

    printList(ulNew, listResellers)
  },
  getReps: function () {
    for (var _count = 0; _count < repData.length; _count++) {
      if (repData[_count].booth_id === null) {
        document.getElementById('reps_select').innerHTML += '<option value="' + repData[_count].rep_id + '">' + repData[_count].fullname + '</option>'
      }
    }
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function (e) {
    e.preventDefault()

    form = document.querySelector('#add-booth')
    if (form != null) {
      form.reset()
    }

    form = document.querySelector('#update-booth')
    if (form != null) {
      booth.setData()
    }
  })
}

var save = document.querySelector('.save')
if (save != null) {
  save.addEventListener('click', function (e) {
    e.preventDefault()

    var valid = 'true'
    var fields = document.querySelectorAll('[data-validator]')

    valid = utils.dataValidator(fields)

    if (valid) {
      info = {
        booth_name: document.querySelector('[name="booth_name"]').value,
        location_id: document.querySelector('[name="location"]').value,
        reps: listResellers
      }

      form = document.querySelector('#add-booth')

      if (form != null) {
        info.userCreateId = userCreateId
        var url = `${apiHost}booths/add`
        utils.api(JSON.stringify(info), url, 'POST', booth.add)
      }

      form = document.querySelector('#update-booth')

      if (form != null) {
        info = {
          booth_name: document.querySelector('[name="booth_name"]').value,
          location_id: document.querySelector('[name="location"]').value,
          active_status: document.querySelector('[name="status"]').value,
          userCreateId: userCreateId,
          reps: listResellers
        }
        url = `${apiHost}booths/edit/${boothData.booth_id}`
        utils.api(JSON.stringify(info), url, 'PUT', booth.update)
      }
    }
  })
}

form = document.querySelector('form')
if (form) {
  var listArea = utils.createElement('div', 'form-group')
  var labeltext = utils.createElement('label', 'col-sm-2 col-md-2 control-label', '', 'List new reps')
  listArea.appendChild(labeltext)
  var ulArea = utils.createElement('div', 'col-sm-10 col-md-8')
  var ulNew = utils.createElement('ul', 'list-group list-group-flush', 'listrep')
  ulArea.appendChild(ulNew)
  listArea.appendChild(ulArea)
  form.insertBefore(listArea, form.lastChild.previousSibling)
}

var options = document.querySelectorAll('.delete')

for (var i = 0, l = options.length; i < l; i++) {
  options[i].addEventListener('click', function (e) {
    e.preventDefault()

    var element = e.target
    if (!e.target.getAttribute('data-id')) {
      element = e.target.parentElement
    }

    var id = element.getAttribute('data-id')

    var url = `${apiHost}booths/del/${id}`
    utils.api(JSON.stringify({}), url, 'DELETE', booth.delete, element)
  })
}

var buttonAdd = document.querySelector('#add-booth')
if (buttonAdd != null) {
  booth.getReps()
}

var buttonUpdate = document.querySelector('#update-booth')
if (buttonUpdate != null) {
  booth.setData()
}

var repsTable = document.querySelector('#table-booths')
if (repsTable !== null) {
  $(function () {
    $('#table-booths').dataTable({
      sPaginationType: 'full_numbers',
      iDisplayLength: 20,
      aLengthMenu: [[20, 50, 100, -1], [20, 50, 100, 'All']]
    })
  })
}

var confirmDate = document.querySelector('.confirm-delete')

confirmDate.addEventListener('click', function (e) {
  e.preventDefault()
  if (document.querySelector('[name="rangeDate"]').value.split(' to ')) {
    listResellers[listResellers.length - 1].start_date = document.querySelector('[name="rangeDate"]').value.split(' to ')[0]
    listResellers[listResellers.length - 1].end_date = document.querySelector('[name="rangeDate"]').value.split(' to ')[1]
  } else if (document.querySelector('[name="rangeDate"]').value) {
    listResellers[listResellers.length - 1].start_date = document.querySelector('[name="rangeDate"]').value
    listResellers[listResellers.length - 1].end_date = null
  } else {
    listResellers[listResellers.length - 1].start_date = null
    listResellers[listResellers.length - 1].end_date = null
  }

  printList(ulNew, listResellers)
})

function printList (element, list) {
  element.innerHTML = ''
  var li = []
  for (var _i = 0; _i < list.length; _i++) {
    li[_i] = utils.createElement('li', 'list-group-item', '', '<label> Rep: </label>' + list[_i].text + ' <label> Duration in booth: </label> ' + list[_i].start_date + ' to ' + list[_i].end_date)
    element.appendChild(li[_i])
  }
}

$('#reps_select').multiSelect({
  selectableHeader: "<input type='text' class='form-control' autocomplete='off' placeholder='Search the rep name'>",
  selectionHeader: "<input type='text' class='form-control' autocomplete='off' placeholder='Search the rep name'>",
  afterInit: function (ms) {
    var that = this
    var $selectableSearch = that.$selectableUl.prev()
    var $selectionSearch = that.$selectionUl.prev()
    var selectableSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selectable:not(.ms-selected)'
    var selectionSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selection.ms-selected'

    that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
      .on('keyup', function (e) {
        if (e.which === 40) {
          that.$selectableUl.focus()
          return false
        }
      })

    that.qs2 = $selectionSearch.quicksearch(selectionSearchString)
      .on('keyup', function (e) {
        if (e.which === 40) {
          that.$selectionUl.focus()
          return false
        }
      })
  },
  afterSelect: function (values) {
    var _message = ''
    var _alertModal = document.getElementById('confirm-modal-content')
    var intputDate = document.createElement('input')

    _message = utils.createElement('div', '', '', 'Choose the days where your rep going to host in the booth')
    intputDate.setAttribute('type', 'text')
    intputDate.setAttribute('name', 'rangeDate')
    intputDate.setAttribute('class', 'form-control')
    intputDate.setAttribute('id', 'rangeDate')
    intputDate.setAttribute('style', 'min-width:320px;')

    _message.appendChild(intputDate)

    _alertModal.innerHTML = ''
    _alertModal.appendChild(_message)

    MicroModal.show('confirm-modal')

    var datepicker = (document.querySelector('[name="rangeDate"]') ? document.querySelector('[name="rangeDate"]') : '')

    datepicker.flatpickr({
      altFormat: 'F j, Y',
      dateFormat: 'Y-m-d h:i:S',
      defaultDate: 'today',
      altInput: true,
      mode: 'range',
      minDate: 'today'
    })

    this.qs1.cache()
    this.qs2.cache()
    var selectValue = new Object
    selectValue.rep_id = values.id
    selectValue.text = values.text
    listResellers.push(selectValue)
  },
  afterDeselect: function (values) {
    this.qs1.cache()
    this.qs2.cache()
    for (var _ic = 0; _ic < listResellers.length; _ic++) {
      if (listResellers[_ic].rep_id === values.id) {
        listResellers.splice(_ic, 1)
      }
    }
    printList(ulNew, listResellers)
  }
})

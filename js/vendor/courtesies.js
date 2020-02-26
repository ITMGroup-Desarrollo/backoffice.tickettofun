'use strict'
var info
var form
var base = window.baseUrl
var token = window.token
var courtesiesData = window.courtesies
var user_create_id = window.user_create_id

var courtesies= {
  add: function(response) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)
    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (codes.hasOwnProperty(response.code)) {
      _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
    else if (response.code == 201) {
      _message = utils.createElement('p', '', '', 'Success! Courtesy added correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')

      form = document.querySelector('#add-courtesy')
      form.reset();
    }
  },
  update: function(response) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)
    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (codes.hasOwnProperty(response.code)) {
      _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
    else if (response.code == 204) {
      _message = utils.createElement('p', '', '', 'Success! Courtesy updated correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  },
  delete: function(response, element) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)
    var id = element.getAttribute('data-id')
    element.style.display = 'none'

    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (codes.hasOwnProperty(response.code)) {
      _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
    else if (response.code == 200) {
      var _status = document.querySelector(`[data-status="${id}"]`)
      _status.innerHTML = ''

      var label = utils.createElement('span', 'label label-danger', '', 'inactive');
      _status.appendChild(label)

      _message = utils.createElement('p', '', '', 'Success! Courtesy inactivate correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  },
  setData(){
    document.querySelector('[name="reseller"]').value =  courtesiesData.reseller_id
    document.querySelector('[name="quantity"]').value =  courtesiesData.quantity_courtesy
    document.querySelector('[name="active"]').value =  courtesiesData.active_status
    document.querySelector('[name="min"]').value =  courtesiesData.min
    document.querySelector('[name="max"]').value =  courtesiesData.max
    document.querySelector('[name="type"]').value =  courtesiesData.courtesy_type_id
    document.querySelector('[name="pax"]').value =  courtesiesData.pax_id
    document.querySelector('[name="service"]').value =  courtesiesData.service_id
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function(e) {
    e.preventDefault()

    form = document.querySelector('#add-courtesy')
    if(form != null){

    }

    form.reset();
  });
}

var save = document.querySelector('.save')
if (save != null) {
  save.addEventListener('click', function(e) {
    e.preventDefault()

    var valid = 'true'
    var fields = document.querySelectorAll('[data-validator]')

    valid = utils.dataValidator(fields)

    if(valid) {
      info = {

        quantity_courtesy: document.querySelector('[name="quantity"]').value,
        reseller_id: document.querySelector('[name="reseller"]').value,
        min: document.querySelector('[name="min"]').value,
        max: document.querySelector('[name="max"]').value,
        courtesy_type_id:  document.querySelector('[name="type"]').value,
      }

      info.pax_id = (document.querySelector('[name="pax"]').value ? document.querySelector('[name="pax"]').value : null )
      info.service_id =( document.querySelector('[name="service"]').value ? document.querySelector('[name="service"]').value : null )

      form = document.querySelector('#add-courtesy')

      if (form != null) {
        info.user_created_id = user_create_id
        var url = apiHost+'courtesies/add'
        utils.api(JSON.stringify(info), url, 'POST', courtesies.add)
      }

      form = document.querySelector('#update-courtesy')

      if (form != null) {
        info.user_created_id = user_create_id
        info.active_status = document.querySelector('[name="active"]').value

        var url = apiHost+`courtesies/edit/${courtesiesData.courtesy_id}`
        utils.api(JSON.stringify(info), url, 'PUT', courtesies.update)
      }
    }
  })
}

var options = document.querySelectorAll('.delete')

for (var i = 0, l = options.length; i < l; i++) {
  options[i].addEventListener('click', function(e) {
    e.preventDefault()

    var element = e.target
    if (! e.target.getAttribute('data-id'))
      element = e.target.parentElement

    var id = element.getAttribute('data-id')
    var url = apiHost+`courtesies/del/${id}`

      utils.api(JSON.stringify({}), url, 'DELETE', courtesies.delete, element)
  })
}

form = document.querySelector('#add-courtesy')
if (form != null) {
  var status_combo = form.querySelector('[name="active"]')
  status_combo.parentElement.parentElement.remove()
}

form = document.querySelector('#update-courtesy')
if (form != null)
courtesies.setData()

var servicesTable = document.querySelector('#table-courtesies')
if (servicesTable !== null) {
  $(function() {
    $('#table-courtesies').dataTable({
        "sPaginationType": "full_numbers",
        "iDisplayLength": 20,
        "aLengthMenu": [[20, 50, 100, -1], [20, 50, 100, "All"]]
    });
  });
}

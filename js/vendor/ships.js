'use strict'
var info
var form
var base = window.baseUrl
var token = window.token
var shipsData = window.ships

var ships= {
  add: function(response) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)
    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (response.code == 400) {
      _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
    else if (response.code == 200) {
      _message = utils.createElement('p', '', '', 'Success!, ship added correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')

      form = document.querySelector('#add-ship')
      form.reset();
    }
  },
  update: function(response) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)
    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (response.code == 400) {
      _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
    else if (response.code == 200) {
      _message = utils.createElement('p', '', '', 'Success!, ship updated correctly')

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

    if (response.code == 400) {
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

      _message = utils.createElement('p', '', '', 'Success!, ship inactivate correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  },
  setData: function(){
    document.querySelector('[name="name"]').value = shipsData.name
    document.querySelector('[name="reseller"]').value = shipsData.reseller
    document.querySelector('[name="capacity"]').value = shipsData.capacity
    document.querySelector('[name="status"]').value = shipsData.active
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function(e) {
    e.preventDefault()

    form = document.querySelector('#add-ship')
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
        reseller_id: document.querySelector('[name="reseller"]').value,
        ship_name: document.querySelector('[name="name"]').value,
        ship_capacity: document.querySelector('[name="capacity"]').value
      }

      form = document.querySelector('#add-ship')

      if (form != null) {
        var url = `${apiHost}ships/add`
        utils.api(JSON.stringify(info), url, 'POST', ships.add)
      }

      form = document.querySelector('#update-ship')

      if (form != null) {
        info.active_status = document.querySelector('[name="status"]').value

        var url = `${apiHost}ships/edit/${shipsData.id}`
        utils.api(JSON.stringify(info), url, 'PUT', ships.update)
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
    var url = `${apiHost}ships/del/${id}`

    utils.api(JSON.stringify({}), url, 'DELETE', ships.delete, element)
  })
}

form = document.querySelector('#add-ship')
if (form != null) {
  var status_combo = form.querySelector('[name="status"]')
  status_combo.parentElement.parentElement.remove()
}

form = document.querySelector('#update-ship')

if (form != null)
  ships.setData();

var servicesTable = document.querySelector('#ships-registers')
if (servicesTable !== null) {
  $(function() {
    $('#ships-registers').dataTable({
        "sPaginationType": "full_numbers",
        "iDisplayLength": 20,
        "aLengthMenu": [[20, 50, 100, -1], [20, 50, 100, "All"]]
    });
  });
}

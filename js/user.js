'use strict'
var info
var form
var base = window.baseUrl
var token = window.token

var user= {
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
      _message = utils.createElement('p', '', '', 'Success!, service added correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
      
      form = document.querySelector('#form-product > form')
      form.reset();
    }
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function(e) {
    e.preventDefault()

    form = document.querySelector('#form-product > form')
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
        code: document.querySelector('[name="code"]').value,
        location: document.querySelector('[name="location"]').value,
        name: document.querySelector('[name="service_name"]').value,
        min_available: document.querySelector('[name="min_available"]').value,
        max_available: document.querySelector('[name="max_available"]').value
      }

      var url = 'http://localhost:8181/api/v1/products/add'
      utils.api(JSON.stringify(info), url, 'POST', user.add)
    }
  })
}

var servicesTable = document.querySelector('#services-registers')
if (servicesTable !== null) {
  $(function() {
    $('#services-registers').dataTable({
        "sPaginationType": "full_numbers",
        "iDisplayLength": 20,
        "aLengthMenu": [[20, 50, 100, -1], [20, 50, 100, "All"]]
    });
  });
}

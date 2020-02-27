'use strict'
var info
var form
var purchase
var season
var base = window.baseUrl
var token = window.token
var pricesData = window.prices
var user_create_id = window.user_create_id

var prices= {
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
      _message = utils.createElement('p', '', '', 'Success! price added correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')

      form = document.querySelector('#add-price')
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
      _message = utils.createElement('p', '', '', 'Success! Price updated correctly')

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

      _message = utils.createElement('p', '', '', 'Success! Price inactivate correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  },
  setData(){
    document.querySelector('[name="service"]').value =  pricesData.service_id
    document.querySelector('[name="reseller"]').value =  pricesData.reseller_id
    document.querySelector('[name="pax"]').value =  pricesData.pax_id
    document.querySelector('[name="price"]').value =  pricesData.price
    document.querySelector('[name="currency"]').value =  pricesData.currency_id
    document.querySelector('[name="active"]').value =  pricesData.active_status
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function(e) {
    e.preventDefault()

    form = document.querySelector('#add-price')
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

    var purchaseDate = document.querySelector('[name="purchase"]').value.split(' to ')
    var seasonDate = document.querySelector('[name="season"]').value.split(' to ')

    if(valid) {
      info = {
        service_id: document.querySelector('[name="service"]').value,
        reseller_id: document.querySelector('[name="reseller"]').value,
        pax_id: document.querySelector('[name="pax"]').value,
        currency_id: document.querySelector('[name="currency"]').value,
      }

      info.price = document.querySelector('[name="price"]').value
      info.start_date_purchase = (purchaseDate[0] ? purchaseDate[0] : null)
      info.end_date_purchase = (purchaseDate[1] ? purchaseDate[1] :purchaseDate[0])
      info.seasson_start = (seasonDate[0] ? seasonDate[0] : null)
      info.seasson_end = (seasonDate[1] ? seasonDate[1] : seasonDate[0])
      info.user_id = user_create_id
      form = document.querySelector('#add-price')

      if (form != null) {
        var url = apiHost+'prices/add'
        utils.api(JSON.stringify(info), url, 'POST', prices.add)
      }

      form = document.querySelector('#update-price')

      if (form != null) {
        info.active_status = document.querySelector('[name="active"]').value
        var url = apiHost+`prices/edit/${pricesData.price_id}`
        utils.api(JSON.stringify(info), url, 'PUT', prices.update)
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
    var url = apiHost+`prices/del/${id}`

      utils.api(JSON.stringify({}), url, 'DELETE', prices.delete, element)
  })
}

form = document.querySelector('#add-price')
if (form != null) {
  var status_combo = form.querySelector('[name="active"]')
  status_combo.parentElement.parentElement.remove()
}

form = document.querySelector('#update-price')
if (form != null)
prices.setData()

if (document.querySelector('[name="season"]')){
  season = document.querySelector('[name="season"]')
  season.flatpickr({
    altFormat: 'F j, Y',
    dateFormat: 'Y-m-d',
    altInput: true,
    mode : "range",
    defaultDate : (typeof pricesData !== "undefined" ? [pricesData.start_date_purchase, pricesData.end_date_purchase] : false),
    minDate : "today"
  })
}

if (document.querySelector('[name="purchase"]')){
  purchase = document.querySelector('[name="purchase"]')
  purchase.flatpickr({
    altFormat: 'F j, Y',
    dateFormat: 'Y-m-d',
    altInput: true,
    mode : "range",
    defaultDate : (typeof pricesData !== "undefined"? [pricesData.seasson_start, pricesData.seasson_end] : false),
    minDate : "today"
  })
}

var servicesTable = document.querySelector('#table-prices')
if (servicesTable !== null) {
  $(function() {
    $('#table-prices').dataTable({
        "sPaginationType": "full_numbers",
        "iDisplayLength": 20,
        "aLengthMenu": [[20, 50, 100, -1], [20, 50, 100, "All"]]
    });
  });
}

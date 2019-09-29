'use strict'
var info
var form
var base = window.baseUrl
var token = window.token
var arrivesData = window.arrives
var user = window.user

var arrives = {
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
      _message = utils.createElement('p', '', '', 'Success! Cruise arrive added correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')

      form = document.querySelector('#add-arrives')
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
      _message = utils.createElement('p', '', '', 'Success! Cruise arrive updated correctly')

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
      
      _status.className = "label label-danger";
      _status.innerHTML = 'inactive';

      _message = utils.createElement('p', '', '', 'Success! Cruise arrival date inactivate correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  },
  searchArrive: function(response, element){
    response = JSON.parse(response)
    var id = element.getAttribute('data-id');
    var url = `http://localhost:8181/api/v1/arrives/del/${id}`

    if (response.code == 200) {
      var confirmArrive = confirm('The cruise have already configurations in use,  do you want to remove?');

      if(confirmArrive)
        utils.api(JSON.stringify({}), url, 'DELETE', arrives.delete, element)  
      else
        MicroModal.close('wait-modal');

    }else{
      utils.api(JSON.stringify({}), url, 'DELETE', arrives.delete, element)  
    }
  },
  setData: function(){
    document.querySelector('[name="ships"]').value = arrivesData.ships
    document.querySelector('[name="arrival_date"]').value = arrivesData.arrival_date
    document.querySelector('[name="arrival_time"]').value = arrivesData.arrival_time
    document.querySelector('[name="departure_time"]').value = arrivesData.departure_time
    document.querySelector('[name="markup_start"]').value = arrivesData.markup_start
    document.querySelector('[name="markup_end"]').value = arrivesData.markup_end
    document.querySelector('[name="status"]').value = arrivesData.active
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function(e) {
    e.preventDefault()

    form = document.querySelector('#add-arrives')
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
        ship_id: document.querySelector('[name="ships"]').value,
        arrival_date: document.querySelector('[name="arrival_date"]').value,
        arrival_time: document.querySelector('[name="arrival_time"]').value,
        departure_time: document.querySelector('[name="departure_time"]').value,
        markup_start: document.querySelector('[name="markup_start"]').value,
        markup_end: document.querySelector('[name="markup_end"]').value
      }

      form = document.querySelector('#add-arrives')

      if (form != null) {
        var url = `${apiHost}arrives/add`
        info.user_id = user
        utils.api(JSON.stringify(info), url, 'POST', arrives.add)
      }

      form = document.querySelector('#update-arrives')

      if (form != null) {
        info.active_status = document.querySelector('[name="status"]').value

        var url = `${apiHost}arrives/edit/${arrivesData.id}`
        utils.api(JSON.stringify(info), url, 'PUT', arrives.update)
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
    var url = `${apiHost}arrives/arrival/${id}`

    utils.api(JSON.stringify({}), url, 'GET', arrives.searchArrive, element)
  })
}

form = document.querySelector('#add-arrives')
if (form != null) {
  var status_combo = form.querySelector('[name="status"]')
  status_combo.parentElement.parentElement.remove()
}

form = document.querySelector('#update-arrives')

if (form != null)
  arrives.setData();

var servicesTable = document.querySelector('#arrives-registers')
if (servicesTable !== null) {
  $(function() {
    var dtable = $('#arrives-registers').dataTable({
        "sPaginationType": "full_numbers",
        "iDisplayLength": 20,
        "aLengthMenu": [[20, 50, 100, -1], [20, 50, 100, "All"]]
    });

    var search = document.querySelector('.search');

    search.addEventListener('click', function(e) {
      e.preventDefault()
      var dataForm = {"reseller":document.querySelector('[name="reseller"]').value,
                      "ship":document.querySelector('[name="ship"]').value,
                      "dates": document.querySelector('[name="dates"]').value}
                  
      $.ajax({
        data: dataForm,
        type: "POST",
        dataType: "json",
        url: `listjson`,
        success: function(data){
          if (parseInt(data.length) > 0){
            loadData(data);
          } else {
            dtable.dataTable().fnClearTable()
          }
        }
      });
      
    })

    function loadData(data){
      dtable.dataTable().fnClearTable()
      
      for (i in data){
        dtable.dataTable().fnAddData([
          data[i].reseller,
          data[i].ship,
          data[i].arrival_date,
          data[i].arrival_time,
          data[i].departure_time,
          data[i].markup_start,
          data[i].markup_end,
          data[i].status,
          data[i].action
        ])
      }
      
      var options = document.querySelectorAll('.delete')
      for (var i = 0, l = options.length; i < l; i++) {
        options[i].addEventListener('click', function(e) {
          e.preventDefault()
      
          var element = e.target
          if (! e.target.getAttribute('data-id'))
            element = e.target.parentElement
          
          var id = element.getAttribute('data-id')
          var url = `${apiHost}arrives/arrival/${id}`
      
          utils.api(JSON.stringify({}), url, 'GET', arrives.confirmArriveConfig, element)
        })
      }
      //      
    }
  });


}

$(function(){

  $(".date-format").flatpickr({
    dateFormat: "Y-m-d"
  });

  $(".date-range").flatpickr({
    dateFormat: "Y-m-d",
    mode: "range"
  });

  $(".time-format").flatpickr({
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true
  });

  $(".markup").flatpickr({
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    defaultDate: "00:30",
    time_24hr: true
  });

  var ship = document.querySelector('[name="ship"]')
  ship.options.length = 0
  ship.append(new Option('-- Choose option --', ''))

  var vendor = document.querySelector('[name="reseller"]')
  
  vendor.addEventListener('change', function(e){
    var id = $(this).val()
    
    for (var i = ship.options.length-1;i>0;i--){
      ship.remove(i)
    }
    
    $.ajax({
      data: {'id': id},
      type: 'POST',
      datatype: 'json',
      url: 'shiplist',
      success: function(data){
        data = JSON.parse(data)
    
        for(i in data){
          ship.append(new Option(data[i].ship, data[i].id, "selected"))
        }
        
      }
    })
  });
  
  
  
});
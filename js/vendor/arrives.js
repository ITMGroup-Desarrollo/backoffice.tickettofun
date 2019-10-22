'use strict'
var info
var form
var base = window.baseUrl
var token = window.token
var arrivesData = window.arrives
var user = window.user
var editor;

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
  confirmArriveAllotment: function(response, element){
    response = JSON.parse(response)

    var id = element.getAttribute('data-id');
    var url = `http://localhost:8181/api/v1/arrives/del/${id}`


    if (response.code == 200) {
      MicroModal.close('wait-modal')

      var btnCanccel = document.querySelector('.confirm-delete')
      btnCanccel.setAttribute('data-id', id)
      btnCanccel.removeAttribute('style', 'display')

      var _message = ''
      var _alertModal = document.getElementById('confirm-modal-content')

      _message = utils.createElement('p', '', '', 'The ship have already configurations in use,  do you want to remove?')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('confirm-modal')

    }else{
      utils.api(JSON.stringify({}), url, 'DELETE', arrives.delete, element)
    }
  },
  loadData: function(response){
    const data = JSON.parse(response);
    let dataTable = [];

    if (Array.isArray(data.message)){
      dataTable = data.message.map(data=>{
        const dataArray = [
          data.reseller_name,
          data.ship_name,
          data.arrival_date,
          data.arrival_time,
          data.departure_time,
          data.markup_start,
          data.markup_end,
          data.active_status,
          data.arrive_id
        ]

        return dataArray;
      })
    }

    if ($.fn.DataTable.isDataTable( editor ))
      editor.destroy()

    editor = $('#arrives-registers')
      .on( 'order.dt',  function () { } )
      .on( 'page.dt',   function () { } )
      .DataTable({
      retrieve: true,
      data: dataTable,
      columnDefs: [{
        targets: 7,
        className: "center",
        data: "arrive_id",
        "render": function ( data, type, row, meta ) {
          if(row[7] === 0)
            return '<span class="label label-danger" data-status="'+row[8]+'">Inactive</span>';
          else
            return '<span class="label label-success" data-status="'+row[8]+'">Active</span>';
        }
      },{
        targets: 8,
        data: "allotment_id",
        className: "center",
        render: function ( data, type, row, meta ) {
          if(row[7] === 0)
            return '<a class="edit" href="'+row[8]+'"><i class="fas fa-edit"></i></a>';
          else
            return '<a class="edit" href="'+row[8]+'"><i class="fas fa-edit"></i></a>' +
              '<a class="delete" data-id="'+row[8]+'"><i class="fas fa-trash"></i></a>';
        }
      }],
      processing: true,
      stateSave: true,
      sPaginationType: "full_numbers",
      iDisplayLength: 20,
      aLengthMenu: [
          [20, 50, 100, -1], [20, 50, 100, "All"]
      ]
    });
    editor.draw();
    editor.columns.adjust().draw();

    var options = document.querySelectorAll('.delete')
    if(options) {
      for (var i = 0, l = options.length; i < l; i++) {
        options[i].addEventListener('click', function(e) {
          e.preventDefault()

          var element = e.target
          if (! e.target.getAttribute('data-id'))
            element = e.target.parentElement

          var id = element.getAttribute('data-id')
          var url = `${apiHost}arrives/arriveintoallotment/${id}`

          utils.api(JSON.stringify({}), url, 'GET', arrives.confirmArriveAllotment, element)
        })
      }
    }

    MicroModal.close('wait-modal')

  },
  buildOptions: function(response){
    const data = JSON.parse(response);

    if(Array.isArray(data.message)){
      for(i in data.message){
        ship.append(new Option(data.message[i].ship_name, data.message[i].ship_id, "selected"))
      }

    }

    MicroModal.close('wait-modal')
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

var confirmDelete = document.querySelector('.confirm-delete');

if (confirmDelete != null) {
  confirmDelete.addEventListener('click', function(e){
      var element = e.target

      if (! e.target.getAttribute('data-id'))
        element = e.target.parentElement

      var id = element.getAttribute('data-id')
      var url = `${apiHost}arrives/del/${id}`

      utils.api(JSON.stringify({}), url, 'DELETE', arrives.delete, element)

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

var configTable = document.querySelector('#arrives-registers')

if (configTable !== null) {

  var vendor = document.querySelector('[name="reseller"]')

  vendor.addEventListener('change', function(e) {
    var id = $(this).val()

    for (var i = ship.options.length-1;i>0;i--) {
      ship.remove(i)
    }

    utils.api(JSON.stringify({}), `${apiHost}arrives/shipsarrive/${id}`, 'GET', arrives.buildOptions);

  });

  var search = document.querySelector('.search');

  search.addEventListener('click', function(e) {
    e.preventDefault();
    utilAjaxExecute();

  });

  var configTable = document.querySelector('#arrives-registers');

  const utilAjaxExecute = function(){
    if (configTable !== undefined && configTable !== null && configTable !== undefined && configTable != undefined) {

      var url = `${apiHost}arrives`;
      let reseller = document.querySelector('[name="reseller"]').value;
      let ship = document.querySelector('[name="ship"]').value;
      var dates = document.querySelector('[name="dates"]').value;
      var info = new Object();

      info.start_date = null
      info.end_date = null

      if (dates.trim() !== ""){
        var arrayDates = dates.split(' to ');

        if (arrayDates.length === 2){
          info.start_date = arrayDates[0]
          info.end_date = arrayDates[1]
        }else{
          info.start_date = arrayDates[0]
          info.end_date = arrayDates[0]
        }
      }

      if (reseller !== '' && ship === ''){
        url = url + `/reseller/${reseller}`;
      } else if (reseller !== '' && ship !== ''){
        url = url + `/ship/${ship}`;
      }

      utils.api(JSON.stringify(info), url, 'POST', arrives.loadData)
    }
  }

  $(function() {
    utilAjaxExecute();
  });

}

$(function(){

  document.getElementsByClassName("date-format").flatpickr({
    dateFormat: "Y-m-d"
  });

  $(".date-range").flatpickr({
    dateFormat: "Y-m-d",
    mode: "range"
  });

  document.getElementsByClassName("time-format").flatpickr({
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true
  });

  document.getElementsByClassName("markup").flatpickr({
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    defaultDate: "00:30",
    time_24hr: true
  });

  var ship = document.querySelector('[name="ship"]')
  if (ship != null) {
    ship.options.length = 0
    ship.append(new Option('-- Choose option --', ''))
  }

});

'use strict'
var id
var info
var form
var base = window.baseUrl
var token = window.token
var allotmentData = window.allotments
var user = window.user;
var editor;


var allotment= {
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
      _message = utils.createElement('p', '', '', 'Success! Allotment updated correctly')

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
      _message = utils.createElement('p', '', '', 'Success! allotment canceled correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      utilAjaxExecute();

    }
  },
  loadData: function(response){
    const data = JSON.parse(response);

    let dataTable = [];

    if (Array.isArray(data.message)){
      dataTable = data.message.map(data=>{
        const dataArray = [
          data.channel_name,
          data.reseller_name,
          data.ship_name,
          data.service_name,
          data.shared_schedule,
          data.schedule_start,
          data.schedule_end,
          data.min_available,
          data.max_available,
          data.available,
          data.pax,
          data.process_status_id,
          data.reservation_id
        ]

        return dataArray;
      })
    }

    if ($.fn.DataTable.isDataTable( editor ))
      editor.destroy()

    editor = $('#allotment-reservations-registers')
      .on( 'order.dt',  function () { } )
      .on( 'page.dt',   function () { } )
      .DataTable({
      retrieve: true,
      data: dataTable,
      columnDefs: [
        {
          targets: 4,
          className: "center",
          data: "reservation_id",
          "render": function ( data, type, row, meta ) {
           if(row[4] === 1)
              return 'yes';
            else
              return 'No';
          }
        },{
          targets: 5,
          className: "center",
          data: "reservation_id",
          "render": function ( data, type, row, meta ) {
              return row[5]+'-'+row[6];
          }
        },{
          targets: 6,
          className: "center",
          data: "reservation_id",
          "render": function ( data, type, row, meta ) {
              return row[7]+'-'+row[8];
          }
        },{
          targets: 7,
          className: "center",
          "render": function ( data, type, row, meta ) {
            return row[9];
          }
        },{
          targets: 8,
          className: "center",
          "render": function ( data, type, row, meta ) {
            return row[10];
          }
        },{
            targets: 9,
            className: "center",
            data: "reservation_id",
            "render": function ( data, type, row, meta ) {
              let tag='';

              switch (row[11]) {
                case 3:
                   tag= utils.createElement('p', 'label label-danger','','Canceled')
                   tag.setAttribute('data-status', row[12]);
                   return tag.outerHTML;
                    break;
                case 5:
                    tag= utils.createElement('p', 'label label-warning','','Pending')
                    tag.setAttribute('data-status', row[12]);
                    return tag.outerHTML;
                    break;
                case 6:
                    tag= utils.createElement('p', 'label label-success','','Confirmed')
                    tag.setAttribute('data-status', row[12]);
                    return tag.outerHTML;
                    break;
              }

            }
        },{
              targets: 10,
              data: "reservation_id",
              className: "center",
              render: function ( data, type, row, meta ) {
              if(row[0] ==  "Cruise"){

                let _tagAction='';
                  if(row[11] === 3){
                  let _tagAction = utils.createElement('a', 'edit')
                  _tagAction.setAttribute('href', row[12])
                  _tagAction.appendChild(utils.createElement('i', 'fas fa-plus'))

                  return _tagAction.outerHTML;
                  }
                  else{
                      let _tagAction = utils.createElement('a', 'edit')
                      _tagAction.setAttribute('href', row[12])
                      _tagAction.appendChild(utils.createElement('i', 'fas fa-edit'))

                      let _tagTrash = utils.createElement('a', 'delete')
                      _tagTrash.setAttribute('href', '#')
                      _tagTrash.setAttribute('data-id',row[12])
                      _tagTrash.appendChild(utils.createElement('i', 'fas fa-trash'))

                      return _tagAction.outerHTML + _tagTrash.outerHTML;
                    }
                }else{
                  return '';
                }
            }
        }

      ],

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
    for (var i = 0, l = options.length; i < l; i++) {
    options[i].addEventListener('click', function(e) {
    e.preventDefault()

    var element = e.target
    if (! e.target.getAttribute('data-id'))
      element = e.target.parentElement

      var id = element.getAttribute('data-id')
      var info = {user_id: user};
      var url = apiHost +  `allotment_reservations/del/${id}`
      utils.api(JSON.stringify(info), url, 'DELETE', allotment.delete, element)
    })
    }

    MicroModal.close('wait-modal')

  },
  buildOptions: function(response){
    const data = JSON.parse(response)

    if(Array.isArray(data.message)){
      for(i in data.message){
        ship.append(new Option(data.message[i].ship_name, data.message[i].ship_id, "selected"))
      }

    }

    MicroModal.close('wait-modal')
  },
  setData: function() {

    document.querySelector('[name="reserve_date"]').value= allotmentData.start_date;
    document.querySelector('[name="reserve_date"]').setAttribute('readonly', 'readonly');

    let pax = allotmentData.pax;
    let process = allotmentData.process_status_id;

    if(pax == 0 && process == 3){

      document.querySelector('[name="pax"]').value=1;
      document.querySelector('[name="process_status"]').value = 6;

    } else {

      document.querySelector('[name="pax"]').value = allotmentData.pax
      document.querySelector('[name="process_status"]').value = allotmentData.process_status_id;

    }


  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function(e) {
    e.preventDefault()
    form = document.querySelector('#update-allotment')
    window.location.href = "/itm-backoffice/allotments/list";
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

        type_channel: 1,
        pax: document.querySelector('[name="pax"]').value,
        user_id: user,
        act_time: null,
        active_status: document.querySelector('[name="process_status"]').value

      }

        var url = apiHost + `allotment_reservations/edit/${allotmentData.id}`
        utils.api(JSON.stringify(info), url, 'PUT', allotment.update)

    }
  })
}

form = document.querySelector('#update-allotment')
if (form != null)
allotment.setData();

var ship = document.querySelector('[name="ship"]')
if (ship != null) {
  ship.options.length = 0
  ship.append(new Option('-- Choose option --', ''))
}

$(function(){
  document.querySelectorAll(".date-format").flatpickr({
   altFormat: "F j, Y",
   dateFormat: "Y-m-d",
   defaultDate: "today",
   altInput: true,
  });

});

var vendor = document.querySelector('[name="reseller"]')
if (vendor != null){
  vendor.addEventListener('change', function(e) {
    var id = $(this).val()
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd;
    }
    if(mm<10){
        mm='0'+mm;
    }
    var today = yyyy+'-'+mm+'-'+dd;

    info = {
      start_date : today,
      type : 'reseller_search'
    }

    for (var i = ship.options.length-1;i>0;i--) {
      ship.remove(i)
    }

    utils.api(JSON.stringify(info), `${apiHost}allotment_reservations/reseller/${id}`, 'POST', allotment.buildOptions)

  });
}

var search = document.querySelector('.search');
if (vendor != null){
  search.addEventListener('click', function(e) {
    e.preventDefault()
    utilAjaxExecute()
  });
}

var configTable = document.querySelector('#allotment-reservations-registers');
const utilAjaxExecute = function(){
  if (configTable !== undefined && configTable !== null && configTable !== undefined && configTable != undefined) {

    var url = `${apiHost}allotment_reservations`
    let reseller = document.querySelector('[name="reseller"]').value;
    let ship = document.querySelector('[name="ship"]').value;
    var date = document.querySelector('[name="date"]').value;

    var info = new Object();
    info.start_date = date;

    if (reseller !== '' && ship === ''){
      url = url + `/reseller/${reseller}`;
    } else if (reseller !== '' && ship !== ''){
      url = url + `/ship/${ship}`;
    }



    utils.api(JSON.stringify(info), url, 'POST', allotment.loadData)

  }
}

$(function() {
  utilAjaxExecute()
});

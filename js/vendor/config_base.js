'use strict'
var info
var form
var base = window.baseUrl
var token = window.token
var configData = window.config
var user = window.user

var editor;
var config = {
  buildOptions: function(response, extradata) {
    const data = JSON.parse(response)
    // console.log(data.message)
    for (var i = eval(extradata[0]).options.length-1;i>0;i--) {
      eval(extradata[0]).remove(i)
    }

    if(Array.isArray(data.message)) {
      for(i in data.message){
        eval(extradata[0]).append(
          new Option(data.message[i][`${ extradata[1] }_name`], data.message[i][`${ extradata[1] }_id`], "selected")
        )
      }
    }

    MicroModal.close('wait-modal')
  },
  loadData: function(response) {
    const data = JSON.parse(response)
    // console.log(data);
    let datatable = [];
    if(Array.isArray(data.message)){
      // console.log(data.message)
      datatable = data.message.map(data => {

        const dataArray = [
          data.channel_name,
          data.reseller_name,
          data.service_name,
          data.schedule_start,
          data.schedule_end,
          data.min_available,
          data.max_available,
          data.available,
          data.active_status,
          data.allotment_id
        ];

        return dataArray;
      })
    }

    if ($.fn.DataTable.isDataTable( editor ))
      editor.destroy()

    editor = $('#config-base-registers')
      .on( 'order.dt',  function () { /* utilAjaxExecute(); */ } )
      // .on( 'search.dt', function () { console.log( 'Search' ); } )
      .on( 'page.dt',   function () { /* utilAjaxExecute(); */ } )
      .DataTable({
      retrieve: true,
      data: datatable,
      columnDefs: [{
        "targets": 8,
        "data": "allotment_id",
        "render": function ( data, type, row, meta ) {
          if(row[8] === 0)
            return '<span class="label label-danger" data-status="'+row[8]+'">Inactive</span>';
          else
            return '<span class="label label-success" data-status="'+row[8]+'">Active</span>';
        }
      },{
        targets: 9,
        data: "allotment_id",
        render: function ( data, type, row, meta ) {
          if(row[9] === 0)
            return '<a class="edit" href="configuration/'+row[9]+'"><i class="fas fa-add"></i></a>';
          else
            return '<a class="edit" href="configuration/'+row[9]+'"><i class="fas fa-edit"></i></a>' +
              '<a class="delete" data-id="'+row[9]+'"><i class="fas fa-trash"></i></a>';
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
    // console.log(editor.draw());
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

          var url = `${apiHost}allotments/del/${id}`
          utils.api(JSON.stringify({}), url, 'DELETE', config.delete, element)

        })
      }
    }

    MicroModal.close('wait-modal')
  },
  add: function(response) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)
    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    console.log(response)
    if (codes.hasOwnProperty(response.code)) {
      let decode = response
      try {
        // a = JSON.parse(response);
        decode = JSON.parse( response.message )
      } catch(e) {
          // alert(e); // error in the above string (in this case, yes)!
      }
      _message = utils.createElement('p', '', '', decode.message)
      console.log(decode.available)
      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      const maxInput = document.querySelector('[name="max_available"]')
      const minInput = document.querySelector('[name="min_available"]')
      if(maxInput != null)
        maxInput.value = decode.available ? decode.available : 0
      if(minInput != null)
        minInput.value = decode.available > minInput.value ? minInput.value : decode.available


      MicroModal.show('alert-modal')
    }
    else if (response.code == 201) {
      _message = utils.createElement('p', '', '', 'Success! Schedule added correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')

      form = document.querySelector('#add-config')
      form.reset();
    }
  },
  update: function(response) {
    MicroModal.close('wait-modal')

    response = JSON.parse(response)
    var _message = ''
    var _alertModal = document.getElementById('alert-modal-content')

    if (codes.hasOwnProperty(response.code)) {
      let decode = response
      try {
        // a = JSON.parse(response);
        decode = JSON.parse( response.message )
      } catch(e) {
          // alert(e); // error in the above string (in this case, yes)!
      }
      _message = utils.createElement('p', '', '', decode.message)
      // _message = utils.createElement('p', '', '', response.message)

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      const maxInput = document.querySelector('[name="max_available"]')
      // console.log(maxInput.val);
      // if(maxInput != null)
        // maxInput.value = decode.available ? decode.available : 0

      MicroModal.show('alert-modal')
    }
    else if (response.code == 204) {
      _message = utils.createElement('p', '', '', 'Success! Schedule updated correctly')

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

      _message = utils.createElement('p', '', '', 'Success! Schedule inactivate correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')
    }
  },
  setData: function() {
    document.querySelector('[name="status"]').value = configData.active
    document.querySelector('[name="channel"]').value = configData.channel
    document.querySelector('[name="reseller"]').value = configData.reseller
    document.querySelector('[name="service"]').value = configData.service
    document.querySelector('[name="start_date"]').value = configData.start_date
    document.querySelector('[name="end_date"]').value = configData.end_date
    document.querySelector('[name="schedule_start"]').value = configData.schedule_start
    document.querySelector('[name="schedule_end"]').value = configData.schedule_end
    document.querySelector('[name="overlap"]').value = configData.overlap
    document.querySelector('[name="min_available"]').value = configData.min_available
    document.querySelector('[name="max_available"]').value = configData.max_available
    document.querySelector('[name="shared"]').value = configData.shared
  }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
  cancel.addEventListener('click', function(e) {
    e.preventDefault()

    form = document.querySelector('#add-config')
    if (form != null)
      form.reset()

    form = document.querySelector('#update-config')
    if (form != null)
      config.setData()
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
        channel_id: document.querySelector('[name="channel"]').value,
        reseller_id: document.querySelector('[name="reseller"]').value,
        service_id: document.querySelector('[name="service"]').value,
        start_date: document.querySelector('[name="start_date"]').value,
        end_date: document.querySelector('[name="end_date"]').value,
        schedule_start: document.querySelector('[name="schedule_start"]').value,
        schedule_end: document.querySelector('[name="schedule_end"]').value,
        overlap: document.querySelector('[name="overlap"]').value,
        min_available: document.querySelector('[name="min_available"]').value,
        max_available: document.querySelector('[name="max_available"]').value,
        shared_schedule: document.querySelector('[name="shared"]').checked ? 1:0,
        user_id: user
      }

      form = document.querySelector('#add-config')

      if (form != null) {
        var url = `${apiHost}allotments/add`
        info.user_id = user
        info.type_movement = 'I'
        utils.api(JSON.stringify(info), url, 'POST', config.add)
      }

      form = document.querySelector('#update-config')

      if (form != null) {
        info.active_status = document.querySelector('[name="status"]').value
        info.arrive_id = configData.arrive_id;

        var url = `${apiHost}allotments/edit/${configData.id}`
        utils.api(JSON.stringify(info), url, 'PUT', config.update)
      }
    }
  })
}

if ($.fn.DataTable.isDataTable( editor )){
  const dtEvents = document.querySelector('#config-base-registers')
    .addEventListener( 'order.dt',  function () { console.log( 'Order' ); } )
    // .addEventListener( 'search.dt', function () { console.log( 'Search' ); } )
    .addEventListener( 'page.dt',   function () { console.log( 'Page' ); } )
    .DataTable();
}


const search = document.querySelector('.search')
if (search != null) {

  search.addEventListener('click', function(e) {
    e.preventDefault()
    // console.log(document.querySelector('.date-range').value);
    /* utils.api(JSON.stringify({
      "start_date": document.querySelector('.date-range').value
    }), `${apiHost}allotments`, 'POST', config.loadData); */
    utilAjaxExecute();

  })
}

var channel = document.querySelector('[name="channel"]')

if(channel != null) {
  channel.addEventListener('change', function(e) {
    e.preventDefault()
    var id = $(this).val()

    for (var i = reseller.options.length-1;i>0;i--) {
      reseller.remove(i)
    }

    utils.api(JSON.stringify({
      /* "start_date": document.querySelector(".date-range").value */
    }), `${apiHost}resellers/channel/${id}`, 'GET', config.buildOptions, ['reseller','reseller']);
  });
}

var reseller = document.querySelector('[name="reseller"]')
if (reseller != null) {
  reseller.options.length = 0
  reseller.append(new Option('-- Choose option --', ''))
}

if(reseller != null) {
  reseller.addEventListener('change', function(e) {
    e.preventDefault()
    var id = $(this).val()

    for (var i = equivalence.options.length-1;i>0;i--) {
      equivalence.remove(i)
    }

    utils.api(JSON.stringify({}), `${apiHost}equivalences/reseller/${id}`, 'GET', config.buildOptions, ['equivalence','service']);
  });
}

var equivalence = document.querySelector('[name="service"]')
if (equivalence != null) {
  equivalence.options.length = 0
  equivalence.append(new Option('-- Choose option --', ''))
}

form = document.querySelector('#add-config')
if (form != null) {
  var status_combo = form.querySelector('[name="status"]')
   status_combo.parentElement.parentElement.remove()
}

form = document.querySelector('#update-config')

if (form != null)
  config.setData()

var configTable = document.querySelector('#config-base-registers');

const utilAjaxExecute = function(){
  if (configTable !== undefined && configTable !== null && configTable !== undefined && configTable != undefined) {
    utils.api(JSON.stringify({
        "start_date": document.querySelector(".date-range").value
    }), `${apiHost}allotments`, 'POST', config.loadData);
  }
}

$( document ).ready(function() {

  utilAjaxExecute();

  document.querySelectorAll(".date-format").flatpickr({
    dateFormat: "Y-m-d"
  });

  document.querySelectorAll(".date-range").flatpickr({
    // mode: "range",
    altFormat: "F j, Y",
    dateFormat: "Y-m-d",
    // minDate: Date.now(),
    defaultDate: "today",
    altInput: true,
    /* plugins: [
      require('shortcut-buttons-flatpickr')({
          theme: 'dark',
          button: [
              { label: 'Сегодня' },
              { label: 'Завтра' },
              { label: 'Послезавтра' }
          ],
          onClick(index, fp) {
              let date = index ? new Date(Date.now() + 24 * index * 60 * 60 * 1000) : new Date;

              fp.setDate(date);
              fp.close();
          }
      })
    ] */
    // onReady: checkIfTodaySelected,
    // onValueUpdate: checkIfTodaySelected
  });

  document.querySelectorAll(".time-format").flatpickr({
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true
  });

});

'use strict'
var info
var form
var base = window.baseUrl
var token = window.token
var user = window.user
const arrive_data = window.arrive_data
let cont = 1;
let service;
let scheduleTableinitialized = $('#schedule0 #schedules-registers');//$('#schedule0 #schedules-registers')

const schedule = {
  dataTableInitializer(parentElementParam, data = [], originalData = []){
    const parentElementJS = document.querySelector(`${parentElementParam}`)
    const search = parentElementJS.querySelector('.search')

    if (search != null) {
        if (search.getAttribute('data-event') !== 'true' || search.getAttribute('data-event') == null) {
          search.setAttribute('data-event', 'true')

          search.addEventListener('click', function(e) {
            e.preventDefault()

            utilAjaxExecute(e.target.closest('.content-wrapper').id);
          })
        }

    }

    service = parentElementJS.querySelector('[name="service"]')

    const preservServiceId = service.value

    if (service != null) {
      service.innerHTML = ""
      for (var i = service.options.length-1;i>0;i--) {
        service.remove(i)
      }

      service.options.length = 0
      service.append( new Option('-- Choose option --', '') )

      service.value = preservServiceId
      const equivalencesByShip = utils.api( JSON.stringify({}), `${apiHost}equivalences/ship/${arrive_data.ships}`, 'GET', schedule.buildOptions, {
        'element': 'service',
        'name': 'service',
        'id': originalData[0] ? originalData[0].service_id:0
      });
      service.value = originalData[0] ? originalData[0].service_id:0
    }

    scheduleTableinitialized = parentElementParam == '#schedule0' ? $(`#schedule0 #schedules-registers`):$(`${parentElementParam} #schedules-registers`)

    if (scheduleTableinitialized != null) {
      if (scheduleTableinitialized.attr('data-isdatatable') == 'true'/*  || scheduleTableinitialized.attr('data-isdatatable') == null */) {
        scheduleTableinitialized.attr('data-isdatatable', 'true')
        // scheduleTableinitialized.destroy();
        $(scheduleTableinitialized).DataTable().destroy()
      }
    }

    scheduleTableinitialized.attr('data-isdatatable', 'true')
    // scheduleTableinitialized =
    $(scheduleTableinitialized).DataTable({
      // responsive: true,
      // rowCallback: function (row, data) {
      //   // console.log('row',row);
      //   $(row).addClass('active success')
      //   // $(row).attr('id',countableRow++)
      // },
      retrieve: true,
      data: data,
      columnDefs: [
        {
          targets: 0,
          render: function(data, type, row, meta){

            return `<input name="schedule_start${meta.row}" class="form-control text-center time-format" value="${data}">`
          }
        },
        {
          targets: 1,
          render: function(data, type, row, meta){

            return `<input name="schedule_end${meta.row}" class="form-control text-center time-format" value="${data}">`
          }
        },
        {
          targets: 2,
          render: function(data, type, row, meta){
            return `<input name="min_available${meta.row}" class="form-control text-center" value="${data}">`
          }
        },
        {
          targets: 3,
          render: function(data, type, row, meta){
            return `<input name="max_available${meta.row}" class="form-control text-center" value="${data}">`
          }
        },
        {
          targets: 4,
          data: "shared_schedule",
          className: 'text-center',
          render: function ( data, type, row, meta ) {
            const checkbox_container = utils.createElement('div', 'checkbox'/* , `schedule${cont++}` */)
            const checkbox_input = utils.createElement('input', ''/* , `schedule${cont++}` */)
            const checkbox_label = utils.createElement('label', ''/* , `schedule${cont++}` */)
            checkbox_input.setAttribute('type', 'checkbox')
            checkbox_input.setAttribute('name', `shared${meta.row}`)
            checkbox_input.setAttribute('id', meta.row)
            checkbox_input.setAttribute('readonly', true)
            checkbox_input.setAttribute('disabled', true)

            if(row[4] === 0){
              checkbox_input.setAttribute('checked', false)
              checkbox_label.appendChild(checkbox_input)
              checkbox_container.appendChild(checkbox_label)
              return `<div>${checkbox_container.innerHTML}</div>`;
            } else {
              checkbox_input.setAttribute('checked', true)
              checkbox_label.appendChild(checkbox_input)
              checkbox_container.appendChild(checkbox_label)
              return `<div>${checkbox_container.innerHTML}</div>`;
            }
            //   return '<a class="edit" href="configuration/'+row[5]+'"><i class="fas fa-edit"></i></a>' +
            //     '<a class="delete" data-id="'+row[5]+'"><i class="fas fa-trash"></i></a>';
          }
        },{
          targets: 5,
          data: "arrive_id",
          render: function ( data, type, row, meta ) {
            // if(row[5] === 0)
              return `<a class="btn-link save" data-toggle="tooltip" data-placement="left" title="Save allotment" id="${meta.row}" dataservice="${originalData[0].service_id}"><i class="fas fa-save" aria-hidden="true"></i></a> <a class="btn-link delete" data-toggle="tooltip" data-placement="left" title="Remove this schedule" id="${meta.row}" dataservice="${originalData[0].service_id}"><i class="fas fa-trash" aria-hidden="true"></i></a>`;
            // else
            //   return '<a class="edit" href="configuration/'+row[5]+'"><i class="fas fa-edit"></i></a>' +
            //     '<a class="delete" data-id="'+row[5]+'"><i class="fas fa-trash"></i></a>';
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
    })

    document.querySelector(parentElementParam).querySelectorAll(".time-format").flatpickr({
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      time_24hr: true
    })

    document.querySelector(parentElementParam).querySelectorAll(".overlap-format").flatpickr({
      altInput: false,
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      defaultDate: originalData.length > 0 ? originalData[0].overlap:'00:30',
      defaultHour: 0,
      defaultMinute: 30,
      maxTime: "05:00",
      minuteIncrement: 30,
      time_24hr: true
    })

    var save = document.querySelector(parentElementParam).querySelectorAll('.save')
    if (save != null) {
      let contadordeeventossave = 0
      save.forEach(saveBtn => {

        saveBtn.addEventListener('click', function(e) {
          e.preventDefault()

          var valid = 'true'
          var id = saveBtn.id
          var dataservice = saveBtn.dataservice

          // valid = utils.dataValidator(fields)
          const container = document.querySelector(parentElementParam)
          // if(valid) {
            info = {
              channel_id: arrive_data.channel_id,
              reseller_id: arrive_data.reseller_id,
              arrive_id: arrive_data.id,
              service_id: preservServiceId,
              start_date: arrive_data.arrival_date,
              end_date: arrive_data.arrival_date,
              schedule_start: container.querySelector(`[name="schedule_start${id}"]`).value,
              schedule_end: container.querySelector(`[name="schedule_end${id}"]`).value,
              overlap: container.querySelector(`[name="overlap"]`).value,
              min_available: container.querySelector(`[name="min_available${id}"]`).value,
              max_available: container.querySelector(`[name="max_available${id}"]`).value,
              shared_schedule: container.querySelector(`[name="shared${id}"]`).checked ? 1:0,
              user_id: user
            }

          //   if (form != null) {
              var url = `${apiHost}allotments/add`
              info.user_id = user
              info.type_movement = 'I'

              info.row = id
              info.container = container
              utils.api(JSON.stringify(info), url, 'POST', schedule.add, info)

        })
      })
    }

    var remove = document.querySelector(parentElementParam).querySelectorAll('.delete')
    if(remove) {
      remove.forEach(removeBtn => {

        removeBtn.addEventListener('click', function(e) {
          e.preventDefault()

          removeBtn.closest('tr').remove()
        })
      })
    }

    // MicroModal.close('wait-modal')
  },
  loadData: function(response, element) {
    const data = JSON.parse(response)

    let datatable = [];
    if(Array.isArray(data.message)){

      datatable = data.message.map(data => {

        const dataArray = [
          data.schedule_start,
          data.schedule_end,
          data.min_available,
          data.max_available,
          data.shared_schedule,
          data.arrive_id
        ]

        return dataArray
      })
    }

    const tableId = element != undefined ? element:`schedule0`

    schedule.dataTableInitializer(`#${tableId}`, datatable, data.message) // last param for recovery serviceId

    MicroModal.close('wait-modal')
  },
  dynamicDataTable(response, extradata){
    const html = JSON.parse(response)
    const contentWrapper = document.querySelector('#content')
    const content = utils.createElement('div', 'row content-wrapper', `schedule${cont++}`)

    const filters = document.createRange().createContextualFragment(`${html.filters_form}<hr>`)
    const table = document.createRange().createContextualFragment(html.table)

    content.appendChild(filters)
    content.appendChild(table)

    contentWrapper.appendChild(content)

    schedule.dataTableInitializer(`#schedule${cont-1}`) //parentELementParam ID

    // MicroModal.close('wait-modal')
  },
  buildOptions: function(response, extradata) {
    const data = JSON.parse(response)

    if(Array.isArray(data.message)) {
      for(i in data.message) {
        eval(extradata.element).append(
          new Option(data.message[i][`${ extradata.name }_name`], data.message[i][`${ extradata.name }_id`], "selected")
        )
      }
    }

    eval(extradata.element).value = extradata.id != undefined && extradata.id != 0 ? extradata.id:''
    MicroModal.close('wait-modal')

  },
  add: function(response, data, element) {
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

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      const maxInput = (data.container).querySelector(`[name="max_available${data.row}"]`)
      const minInput = (data.container).querySelector(`[name="min_available${data.row}"]`)
      if(maxInput != null)
        maxInput.value = decode.available ? decode.available : 0
      if(minInput != null)
        minInput.value = decode.available > minInput.value ? minInput.value : decode.available

      MicroModal.show('alert-modal')
    }
    else if (response.code == 201)
    {
      _message = utils.createElement('p', '', '', 'Success! Schedule added correctly')

      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)

      MicroModal.show('alert-modal')

      form = (data.container).querySelector('#add-config')
      // form.reset();
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
    document.querySelector('[name="status"]').value = scheduleData.active
    document.querySelector('[name="channel"]').value = scheduleData.channel
    document.querySelector('[name="reseller"]').value = scheduleData.reseller
    document.querySelector('[name="service"]').value = scheduleData.service
    document.querySelector('[name="start_date"]').value = scheduleData.start_date
    document.querySelector('[name="end_date"]').value = scheduleData.end_date
    document.querySelector('[name="schedule_start"]').value = scheduleData.schedule_start
    document.querySelector('[name="schedule_end"]').value = scheduleData.schedule_end
    document.querySelector('[name="overlap"]').value = scheduleData.overlap
    document.querySelector('[name="min_available"]').value = scheduleData.min_available
    document.querySelector('[name="max_available"]').value = scheduleData.max_available
    document.querySelector('[name="shared"]').value = scheduleData.shared
  }
}

//Initializer event listener for elements
const readElements = function(){

  const new_tour = document.querySelector('.new-tour')
  if (new_tour != null) {

    new_tour.addEventListener('click', function(e) {
      e.preventDefault()

      utils.post(JSON.stringify({
        // "start_date": document.querySelector('.date-range').value
      }), `${base}allotments/dynamic_html/${arrive_data.ships}`, schedule.dynamicDataTable, new_tour);

    })
  }

}

const utilAjaxExecute = function(element) {
  if (scheduleTableinitialized !== undefined && scheduleTableinitialized !== null) {
    const container = element != undefined ? document.querySelector(`#${element}`):document.querySelector(`#schedule0`)
    const elem = element != undefined ? container.querySelector('[name="service"]'):document.querySelector('[name="service"]')
    const overlap = element != undefined ? container.querySelector('[name="overlap"]'):document.querySelector('[name="overlap"]')

    // if(elem.value != '')
      utils.api(JSON.stringify({
        "arrive": arrive_data,
        "start_date": arrive_data.arrival_date,
        "service": elem.value,
        'ship': arrive_data.ships,
        'overlap': overlap == null ? '':overlap.value
      }), `${apiHost}allotments/shipservice`, 'POST', schedule.loadData, element);
  }
}



$( document ).ready(function() {

  const content = document.querySelector('.menubar')
  const masterContent = utils.createElement('div', 'row general-content')
  const rowChild = utils.createElement('div', 'col-md-12')
  const new_tour_btn = utils.createElement(
    'button',
    'btn btn-primary new-tour',
    'new-tour',
    'New tour'
  )

  rowChild.appendChild(new_tour_btn)
  masterContent.appendChild(rowChild)
  content.after(masterContent);

  readElements();
  // document.body.appendChild(masterContent)
  utilAjaxExecute();

});

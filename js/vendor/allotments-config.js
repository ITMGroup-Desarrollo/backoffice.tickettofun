'use strict'
var info
var form
var editor
var user = window.user
var dataFilter = window.dataArrive//search data
var dataTable
var dataTableFilter
var objData = new Object()

const config = {
    loadData: function(response, band = false) {

        const data = JSON.parse(response)
        let dataTable = []

        if (Array.isArray(data.message) && band == false) {
            var filter = data.message
            dataTableFilter = filter

            dataTable = filter.map(data => {
                const dataArray = [
                data.allotment_id,
                data.service_name,
                data.schedule_start,
                data.schedule_end,
                data.min_available,
                data.max_available,//5
                data.shared_schedule,
                data.private_service,
                data.overlap,
                data.active_status,
                data.service_id,//10
                data.stand_by,
                data.reseller_name,
                data.ship_name,
                data.arrive_id,
                data.ship_reseller//15
                ]
                return dataArray
            })
        }

        if ($.fn.DataTable.isDataTable(editor)) {
            editor.destroy()
        }

        if (dataTable.length === 0) {
            config.setData(true)
        } else {
            config.setData(false)
        }

        editor = $('#allotment-registers')
        .DataTable({
            data: dataTable,
            columnDefs: [
                {
                    targets: 0, //Vendor
                    data: 'vendor',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        var shipReseller = (parseInt(dataFilter.channel) === 3)? row[15] : row[12]
                        _tag = utils.createElement('label', '', '', shipReseller)

                        return _tag.outerHTML
                    }
                },
                {
                    targets: 1, //Cruise
                    data: 'cruise',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('label', '', '', row[13])
                        return _tag.outerHTML
                    }
                },
                {
                    targets: 2, //Service name
                    data: 'arrive_id',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        var _tag2 = ''

                        _tag = utils.createElement('label', 'reg-allotments', '', row[1])
                        _tag2 = utils.createElement('label', 'hidden', '', '')
                        _tag2.setAttribute('arrive_id', row[14])
                        _tag2.setAttribute('allotment_id', row[0])
                        _tag2.setAttribute('service_id', row[10])
                        return _tag2.outerHTML + _tag.outerHTML
                    }
                }, {
                    targets: 3, //schedule start
                    data: 'schedule_start',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'form-control hrStart time-format', 'hrStart' + row[0], '')
                        _tag.setAttribute('value', row[2])

                        if (parseInt(dataFilter.channel) === 2) {
                            _tag.setAttribute('disabled', 'disabled')
                        }

                        return _tag.outerHTML
                    }
                }, {
                    targets: 4, //schedule end
                    data: 'schedule_end',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'form-control hrEnd', 'hrEnd' + row[0], '')
                        _tag.setAttribute('value', row[3])
                        _tag.setAttribute('disabled', 'disabled')

                        return _tag.outerHTML
                    }
                }, {
                    targets: 5, //min
                    data: 'min',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'form-control min', 'min' + row[0], '')
                        _tag.setAttribute('value', row[4])

                        return _tag.outerHTML
                    }
                }, {
                    targets: 6, //max
                    data: 'max',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'form-control max', 'max' + row[0], '')
                        _tag.setAttribute('value', row[5])

                        return _tag.outerHTML
                    }
                }, {
                    targets: 7, //shared
                    className: 'center',
                    data: 'shared',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'shared', 'shared' + row[0], '')
                        _tag.setAttribute('type', 'checkbox')

                        if (row[6] == 1) {
                            _tag.setAttribute('checked','checked')
                        }

                        return _tag.outerHTML
                    }
                }, {
                    targets: 8, //private
                    className: 'center',
                    data: 'private',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'private', 'private' + row[0], '')
                        _tag.setAttribute('type', 'checkbox')

                        if (row[7] == 1) {
                            _tag.setAttribute('checked','checked')
                        }

                        return _tag.outerHTML
                    }
                }, {
                    targets: 9, //overlap
                    className: 'center',
                    data: 'overlap',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'form-control overlap', 'overlap' + row[0], '')
                        _tag.setAttribute('value', row[8])

                        return _tag.outerHTML
                    }
                }, {
                    targets: 10, //standby
                    className: 'center',
                    data: 'config',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'standby', 'standby' + row[0], '')
                        _tag.setAttribute('type', 'checkbox')

                        if (row[11] == 1) {
                            _tag.setAttribute('checked','checked')
                        }

                        return _tag.outerHTML
                    }
                }, {
                    targets: 11, //status
                    className: 'center',
                    data: 'config',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'standby', 'status' + row[0], '')
                        _tag.setAttribute('type', 'checkbox')

                        if (row[9] == 1) {
                            _tag.setAttribute('checked','checked')
                        }

                        return _tag.outerHTML

                    }
                }, {
                    targets: 12, //message
                    className: 'center',
                    data: 'message',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        var _tag2 = ''

                        _tag = utils.createElement('a', 'btn-link save', '', '')
                        _tag.setAttribute('data-toggle', 'tooltip')
                        _tag.setAttribute('data-placement', 'left')
                        _tag.setAttribute('title', 'Save allotment')
                        _tag.setAttribute('onClick', 'config.save(this)')
                        _tag.setAttribute('data-id', row[0])

                        _tag2 = utils.createElement('i', 'fas fa-save fa-2x')
                        _tag.appendChild(_tag2)

                        return _tag.outerHTML

                    }
                }
            ],
            processing: true,
            stateSave: true,
            paging: false,
            sPaginationType: 'full_numbers'
        })

        if (dataFilter.channel == 2 || dataFilter.channel == 1) {
            editor.column(0).visible(false);
            editor.column(1).visible(false);
        } else {
            editor.column(0).visible(true);
            editor.column(1).visible(true);
        }

        editor.draw()
        editor.columns.adjust().draw()

        MicroModal.close('wait-modal')

        document.getElementsByClassName('time-format').flatpickr({
            enableTime: true,
            noCalendar: true,
            dateFormat: 'H:i',
            time_24hr: true
        })

        let scheduleSt = document.querySelectorAll('.hrStart')
        if (scheduleSt) {
            for (var i = 0; i < scheduleSt.length; i++) {
                scheduleSt[i].addEventListener('change', function(e){
                    e.preventDefault()
                    config.changeSchedule(this)
                })
            }
        }
    },
    save: function (data) {
        let id = data.getAttribute('data-id')
        let i = (parseInt(dataFilter.channel) === 3)? 2 : 0

        let nodes = data.parentNode.parentNode.childNodes[i].childNodes[0]
        let arriveId = parseInt(nodes.getAttribute('arrive_id'))
        arriveId = (arriveId === 0)?null:arriveId

        info = {
            arrive_id: arriveId,
            channel_id: parseInt(dataFilter.channel),
            reseller_id: parseInt(dataFilter.vendor),
            service_id: parseInt(nodes.getAttribute('service_id')),
            start_date: dataFilter.date,
            end_date: dataFilter.date,
            schedule_start: document.getElementById('hrStart'+id).value,
            schedule_end: document.getElementById('hrEnd'+id).value,
            overlap: document.getElementById('overlap'+id).value,
            min_available: parseInt(document.getElementById('min'+id).value),
            max_available: parseInt(document.getElementById('max'+id).value),
            shared_schedule: document.getElementById('shared'+id).checked ? 1 : 0,
            private_service: document.getElementById('private'+id).checked ? 1 : 0,
            stand_by: document.getElementById('standby'+id).checked ? 1 : 0,
            user_id: user,
            active_status: document.getElementById('status'+id).checked ? 1 : 0,
          }

        if (parseInt(info.active_status) === 1) {
            var url = `${apiHost}allotments/edit/${id}`
            utils.api(JSON.stringify(info), url, 'PUT', config.update, id)
        } else {
            objData = info
            config.confirm(id)
        }

    },
    confirm: function (id, option = null) {
        var _message = ''
        var _confirmModal = document.getElementById('confirm-modal-content')
        _message = utils.createElement('p', '', '', '¿Are you sure delete allotment?')

        _confirmModal.innerHTML = ''
        _confirmModal.appendChild(_message)

        const btnConfirmDelete = document.querySelector('.confirm-delete')

        btnConfirmDelete.addEventListener('click', function (e) {
            e.preventDefault()

            utils.api(JSON.stringify(objData), `${apiHost}allotments/edit/${id}`, 'PUT', config.update)
        })

        MicroModal.show('confirm-modal')

    },
    delete: function (response, element) {

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
        else if (response.code == 200)
        {
            var status = document.getElementById('status'+id)

            status.setAttribute('checked', '')
            _message = utils.createElement('p', '', '', 'Success! Schedule inactivate correctly')

            _alertModal.innerHTML = ''
            _alertModal.appendChild(_message)

            MicroModal.show('alert-modal')
        }
    },
    changeSchedule: function(data) {
        let url = `${apiHost}products/`
        var schedule = data.value;
        let i = (parseInt(dataFilter.channel) === 3)? 2 : 0
        let nodes = data.parentNode.parentNode.childNodes[i].childNodes[0]

        var service = nodes.getAttribute('service_id')
        var id = nodes.getAttribute('allotment_id')
        url = url + service


        if (schedule && service){
            utils.api(JSON.stringify({"schedule_start": schedule}), `${apiHost}allotments/servicescheduleend/${service}`, 'POST', config.loadScheduleEnd, id)

        }else{
            document.getElementById('hrEnd'+id).value = ''
        }

    },
    loadScheduleEnd: function(response, id) {
        var data = JSON.parse(response)
        var scheduleEnd = ""

        if (parseInt(data.code) === 200) {
            scheduleEnd = data.message.message

        }

        document.getElementById('hrEnd'+id).value = scheduleEnd

        MicroModal.close();
    },
    update: function (response, id) {
        MicroModal.close('wait-modal')

        response = JSON.parse(response)
        var _message = ''
        var _alertModal = document.getElementById('alert-modal-content')

        if (codes.hasOwnProperty(response.code)) {
            var message = ''

            if (utils.isJson(response.message)) {
                const maxInput = document.getElementById('max'+id)

                let decode = JSON.parse(response.message)
                message = decode.message

                if (maxInput != null) {
                maxInput.value = (decode.available) ? decode.available : 0
                }

            } else {
                message = response.message
            }

            _message = utils.createElement('p', '', '', message)

            _alertModal.innerHTML = ''
            _alertModal.appendChild(_message)

            MicroModal.show('alert-modal')

        } else if (response.code === 204) {
            _message = utils.createElement('p', '', '', 'Success! Schedule updated correctly')

            _alertModal.innerHTML = ''
            _alertModal.appendChild(_message)

            MicroModal.show('alert-modal')
        }
    },
    loadOptions: function (response, extradata) {
        const data = JSON.parse(response)

        if (data.code === 200) {
          utils.buildOptions(extradata, data.message)
        }

        MicroModal.close('wait-modal')
    },
    removeOptions: function (element, type = null) {

        let init = (type === 'all') ? -1 : 0;

        for (var i = element.options.length -1 ; i > init; i--) {
          element.remove(i);
        }
    },
    changeChannel: function (band = false){
        var url = apiHost
        var channel = document.querySelector('[name="channel"]')
        var divCruise = document.querySelector('.div-cruise')
        var divVendorCruise = document.querySelector('.div-vendor-cruise')
        var date = document.querySelector('[name="date"]')
        var cruise = document.querySelector('[name="cruise"]')

        switch (parseInt(channel.value)) {
            case 1:
                if (divCruise.classList.contains('hidden') === true) {
                    divCruise.classList.remove('hidden')
                }

                if (divVendorCruise.classList.contains('hidden') === false) {
                    divVendorCruise.classList.add('hidden')
                }
                config.removeOptions(cruise)

                date.value = ""

                url = url + "arrives/vendorarrive/list"

                if (band === true)
                    config.changeVendor(true)

                break;
            case 2:
                if (divCruise.classList.contains('hidden') === false) {
                    divCruise.classList.add('hidden')
                }

                if (divVendorCruise.classList.contains('hidden') === false) {
                    divVendorCruise.classList.add('hidden')
                }

                date.value = ""
                url = url + "resellers/channel/2"

                if (band === true)
                    config.changeVendor(true)

                break;
            case 3:

                if (divVendorCruise.classList.contains('hidden') === true) {
                    divVendorCruise.classList.remove('hidden')
                }

                if (divCruise.classList.contains('hidden') === true) {
                    divCruise.classList.remove('hidden')
                }

                date.value = dataFilter.date
                let vendorCruise = document.querySelector('[name="vendor_cruise"]')
                let id = (band === true && dataFilter.vendor_cruise != '')? dataFilter.vendor_cruise: null

                let dataElement = {
                    id: id,
                    key: 'reseller_name',
                    value: 'reseller_id',
                    element: vendorCruise
                }

                config.removeOptions(vendorCruise)
                utils.api(JSON.stringify({}), url + "resellers/channel/1", 'GET', config.loadOptions, dataElement)

                url = url + "resellers/channel/3"
                if (band === true) {
                    config.changeVendorCruise()
                } else {
                    config.removeOptions(cruise)
                }

                break;
        }

        let vendor = document.querySelector('[name="vendor"]')
        let id = (band === true)? dataFilter.vendor: null
        let dataElement = {
            id: id,
            key: 'reseller_name',
            value: 'reseller_id',
            element: vendor
        }

        config.removeOptions(vendor)
        utils.api(JSON.stringify({}), url, 'GET', config.loadOptions, dataElement)
    },
    changeVendor: function (band = false) {
        var id = null;
        var vendor = null

        if (band === true) {
            id = dataFilter.cruise
            vendor = dataFilter.vendor
        } else {
            vendor = document.querySelector('[name="vendor"]').value
        }

        let channel = document.querySelector('[name="channel"]').value

        if (parseInt(channel) === 1) {
            let cruise = document.querySelector('[name="cruise"]')

            let dataElement = {
                id: id,
                key: 'ship_name',
                value: 'ship_id',
                element: cruise
            }

            config.removeOptions(cruise)
            utils.api(JSON.stringify({}), `${apiHost}arrives/shipsarrive/${vendor}`, 'GET', config.loadOptions, dataElement)
        }
    },
    changeVendorCruise: function () {
        let channel = dataFilter.channel
        var cruise = document.querySelector('[name="cruise"]')
        let option = cruise.getElementsByTagName('option');
        option[0].value = ""

        if ((parseInt(channel) === 1 || parseInt(channel) === 3) && dataFilter.vendor_cruise != '') {

            let id = (dataFilter.cruise != '')?dataFilter.cruise: null;
            let vendor = dataFilter.vendor_cruise

            let dataElement = {
                id: id,
                key: 'ship_name',
                value: 'ship_id',
                element: cruise
            }

            config.removeOptions(cruise)
            utils.api(JSON.stringify({}), `${apiHost}arrives/shipsarrive/${vendor}`, 'GET', config.loadOptions, dataElement)
        }
    },
    setData: function(band) {
        let obj = new Object()

        document.querySelector('[name="channel"]').value = dataFilter.channel
        config.changeChannel(true)
        document.querySelector('[name="date"]').value = dataFilter.date
    }
}

var selectChannel = document.querySelector('[name="channel"]')

if (selectChannel != null) {

    selectChannel.addEventListener('change', function(e){
        e.preventDefault()
        config.changeChannel()

    })
}

var selectVendor = document.querySelector('[name="vendor"]')

if (selectVendor != null) {
    selectVendor.append(new Option('-- Choose option --'))

    selectVendor.addEventListener('change', function(e) {
        e.preventDefault
        config.changeVendor()
    })
}

var selectVendorCruise = document.querySelector('[name="vendor_cruise"]')

if (selectVendorCruise != null) {
    selectVendorCruise.append(new Option('-- Choose option --'))

    selectVendorCruise.addEventListener('change', function(e) {
        e.preventDefault()

        var cruise = document.querySelector('[name="cruise"]')
        config.removeOptions(cruise)

        if (this.value != '') {
            let channel = document.querySelector('[name="channel"]').value

            let dataElement = {
                id: null,
                key: 'ship_name',
                value: 'ship_id',
                element: cruise
            }

            utils.api(JSON.stringify({}), `${apiHost}arrives/shipsarrive/${this.value}`, 'GET', config.loadOptions, dataElement)
        }
    })
}

var selectCruise = document.querySelector('[name="cruise"]')

if (selectCruise != null) {
    selectCruise.append(new Option('-- Choose option --'))
}

var search = document.getElementById('btn-search')
const btnSearch = utils.createElement('button', 'btn btn-primary', 'clone', "Clone")
search.appendChild(btnSearch)

var clone = document.getElementById('clone')
clone.addEventListener('click', function(e){
    e.preventDefault()

    window.location.href = "/allotments/clone/";
})

var form = document.getElementById('clone-form')
form.setAttribute('method', 'POST')
form.setAttribute('action', '/allotments/config/')

var formbtn = document.querySelector('.form-actions')
formbtn.classList.add('col-md-5')

formbtn.childNodes[1].childNodes[1].remove()//Remove button cancel
formbtn.childNodes[1].childNodes[2].remove()//Remove button save
var _btnRecovery = utils.createElement('button', 'btn btn-primary search', '', 'search')
_btnRecovery.setAttribute('id', 'recovery')
formbtn.childNodes[1].appendChild(_btnRecovery)

var configTable = document.getElementById('allotment-registers')

const utilAjaxExecute = function () {
    var url = ""
    var method = "POST"
    var dataObj = new Object()


    if (dataFilter.channel != null) {
        switch (parseInt(dataFilter.channel)) {
            case 1:
                url = "/ship/"+dataFilter.cruise
                dataObj.start_date = dataFilter.date
                break;
            case 2:
                url = "/reseller/"+dataFilter.vendor
                dataObj.start_date = dataFilter.date
                break;
            case 3:
                if (dataFilter.cruise !== '') {
                    url = "/ship/"+dataFilter.cruise
                    dataObj.channel_id = dataFilter.channel
                } else {
                    url = "/reseller/"+dataFilter.vendor
                }
                dataObj.start_date = dataFilter.date

                break;
        }
    }

    if (configTable !== undefined && configTable !== null && configTable !== undefined && configTable !== undefined) {
        var band = (url == "" || dataObj.start_date == "")?true:false

        utils.api(JSON.stringify(dataObj), `${apiHost}allotments${url}`, method, config.loadData, band)
    }

}

utilAjaxExecute()

$(function () {
    document.getElementsByClassName('date-format').flatpickr({
        dateFormat: 'Y-m-d',
        minDate: 'today'
    });
})

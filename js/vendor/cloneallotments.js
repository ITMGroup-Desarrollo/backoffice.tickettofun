'use strict'
var info
var form
var editor
var base = window.baseUrl
var token = window.token
var user = window.user
var arrive = window.arrive
var dataArrive = window.dataArrive
var dataTable
var dataTableFilter
var objData = new Object()

const clone = {
    loadData: function(response, band = false) {

        const data = JSON.parse(response)
        let dataTable = []

        if (Array.isArray(data.message) && band == false) {

            var filter = data.message.filter(allotment => allotment.active_status == 1)
            dataTableFilter = filter

            dataTable = filter.map(data => {
                const dataArray = [
                data.allotment_id,
                data.service_name,
                data.schedule_start,
                data.schedule_end,
                data.min_available,
                data.max_available,
                data.shared_schedule,
                data.private_service,
                data.overlap,
                data.active_status,
                data.service_id
                ]
                return dataArray
            })
        }

        if ($.fn.DataTable.isDataTable(editor)) {
            editor.destroy()
        }

        if (dataTable.length === 0) {
            clone.setData(true)
        } else {
            clone.setData(false)
        }

        editor = $('#allotments-clone')
        .DataTable({
            data: dataTable,
            columnDefs: [
                {
                    targets: 0, //Service name
                    data: 'arrive_id',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('label', 'reg-allotments', row[0], row[1])
                        _tag.setAttribute('service_id', row[10])
                        return _tag.outerHTML
                    }
                }, {
                    targets: 1, //schedule start
                    data: 'schedule_start',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'form-control hrStart', 'hrStart' + row[0], '')
                        _tag.setAttribute('value', row[2])
                        _tag.setAttribute('disabled', 'disabled')

                        return _tag.outerHTML
                    }
                }, {
                    targets: 2, //schedule end
                    data: 'schedule_end',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'form-control hrEnd', 'hrEnd' + row[0], '')
                        _tag.setAttribute('value', row[3])
                        _tag.setAttribute('disabled', 'disabled')

                        return _tag.outerHTML
                    }
                }, {
                    targets: 3, //min
                    data: 'min',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'form-control min', 'min' + row[0], '')
                        _tag.setAttribute('value', row[4])

                        return _tag.outerHTML
                    }
                }, {
                    targets: 4, //max
                    data: 'max',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'form-control max', 'max' + row[0], '')
                        _tag.setAttribute('value', row[5])

                        return _tag.outerHTML
                    }
                }, {
                    targets: 5, //shared
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
                    targets: 6, //private
                    className: 'center',
                    data: 'private',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'shared', 'private' + row[0], '')
                        _tag.setAttribute('type', 'checkbox')

                        if (row[7] == 1) {
                            _tag.setAttribute('checked','checked')
                        }

                        return _tag.outerHTML
                    }
                }, {
                    targets: 7, //overlap
                    className: 'center',
                    data: 'overlap',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'form-control shared', 'overlap' + row[0], '')
                        _tag.setAttribute('value', row[8])

                        return _tag.outerHTML
                    }
                }, {
                    targets: 8, //clone
                    className: 'center',
                    data: 'clone',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'shared', 'clone' + row[0], '')
                        _tag.setAttribute('type', 'checkbox')

                        _tag.setAttribute('checked','checked')

                        return _tag.outerHTML
                    }
                }, {
                    targets: 9, //status
                    className: 'center',
                    data: 'clone',
                    render: function (data, type, row, meta) {

                        if (row[9] === 0) {
                            return `<span class="label label-danger" id="status${row[0]}" data-status="${row[9]}">Inactive</span>`
                        } else {
                            return `<span class="label label-success" id="status${row[0]}" data-status="${row[9]}">Active</span>`
                        }

                    }
                }, {
                    targets: 10, //message
                    className: 'center',
                    data: 'message',
                    render: function (data, type, row, meta) {

                        return ''

                    }
                }
            ],
            processing: true,
            stateSave: true,
            paging: false,
            sPaginationType: 'full_numbers'
        })

        editor.draw()
        editor.columns.adjust().draw()

        MicroModal.close('wait-modal')


    },
    buildJson: function(response) {
        var newAllotment = new Object()
        newAllotment.channel = parseInt(document.querySelector('[name="channel"]').value)
        newAllotment.user = user
        newAllotment.arrive = null
        newAllotment.vendor = parseInt(document.querySelector('[name="vendor"]').value)
        newAllotment.cruise = parseInt(document.querySelector('[name="cruise"]').value)
        newAllotment.date = document.querySelector('[name="date"]').value
        newAllotment.arrival_time = null
        newAllotment.departure_time = null
        newAllotment.markup_start = null
        newAllotment.markup_end = null
        newAllotment.type_sim = 'N'

        var datatable2 = document.querySelectorAll('.reg-allotments')
        var arrList = []

        for (var i = 0; i <= datatable2.length - 1; i++) {
            var  id = datatable2[i].getAttribute('id')
            let data = dataTableFilter.find(allotment => allotment.allotment_id == id);

            var list = new Object()
            let shared = (document.getElementById('shared'+id).checked)? 1 : 0
            let alloPrivate = (document.getElementById('private'+id).checked)? 1 : 0
            let clone = (document.getElementById('clone'+id).checked)? 1 : 0

            list.allotment_id = id
            list.arrive_id = data.arrive_id
            list.service_id = parseInt(datatable2[i].getAttribute('service_id'))
            list.service_name = datatable2[i].innerHTML
            list.schedule_start = document.getElementById('hrStart'+id).value
            list.schedule_end = document.getElementById('hrEnd'+id).value
            list.min_available = parseInt(document.getElementById('min'+id).value)
            list.max_available = parseInt(document.getElementById('max'+id).value)
            list.available = ""
            list.shared_schedule = shared
            list.private_service = alloPrivate
            list.overlap = document.getElementById('overlap'+id).value
            list.active_status = data.active_status
            list.clone = clone
            list.available_status = parseInt(document.getElementById('status'+id).getAttribute('data-status'))

            list.message =  ""

            arrList.push(list)
        }

        var general = new Object()

        general.newAllotment = newAllotment
        general.list = arrList

        utils.api(JSON.stringify(general), `${apiHost}allotments/clonealloments/`, 'POST', clone.buildRegistersAllotments)
    },
    buildRegistersAllotments: function (response) {
        const data = JSON.parse(response)
        var _alertModal = document.getElementById('alert-modal-content')
        var _message = ""
        var data_list
        let dataTable = []

        if (codes.hasOwnProperty(data.code)) {
            MicroModal.close('wait-modal')
            _message = utils.createElement('p', '', '', data.message)

            _alertModal.innerHTML = ''
            _alertModal.appendChild(_message)

            MicroModal.show('alert-modal')

            return
        }

        if (utils.isJson(data.message)) {
            let dataList = JSON.parse(data.message)
            let list = dataList.list

            dataTable = list.map(data => {
                const dataArray = [
                data.allotment_id,
                data.service_name,
                data.schedule_start,
                data.schedule_end,
                data.min_available,
                data.max_available,
                data.shared_schedule,
                data.private_service,
                data.overlap,
                data.active_status,
                data.service_id,
                data.available_status,
                data.clone,
                data.message
                ]
                return dataArray
            })
        }

        if ($.fn.DataTable.isDataTable(editor)) {
            editor.destroy()
        }

        if (dataTable.length === 0) {
            clone.setData(true)
        } else {
            clone.setData(false)
        }

        editor = $('#allotments-clone')
        .DataTable({
            retrieve: true,
            data: dataTable,
            columnDefs: [
                {
                    targets: 0, //Service name
                    data: 'arrive_id',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('label', 'reg-allotments', row[0], row[1])
                        _tag.setAttribute('service_id', row[10])
                        return _tag.outerHTML
                    }
                }, {
                    targets: 1, //schedule start
                    data: 'schedule_start',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'form-control hrStart', 'hrStart' + row[0], '')
                        _tag.setAttribute('value', row[2])
                        _tag.setAttribute('disabled', 'disabled')

                        return _tag.outerHTML
                    }
                }, {
                    targets: 2, //schedule end
                    data: 'schedule_end',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'form-control hrEnd', 'hrEnd' + row[0], '')
                        _tag.setAttribute('value', row[3])
                        _tag.setAttribute('disabled', 'disabled')

                        return _tag.outerHTML
                    }
                }, {
                    targets: 3, //min
                    data: 'min',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'form-control min', 'min' + row[0], '')
                        _tag.setAttribute('value', row[4])

                        return _tag.outerHTML
                    }
                }, {
                    targets: 4, //max
                    data: 'max',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'form-control max', 'max' + row[0], '')
                        _tag.setAttribute('value', row[5])

                        return _tag.outerHTML
                    }
                }, {
                    targets: 5, //shared
                    className: 'center',
                    data: 'shared',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        var channel = document.querySelector('[name="channel"]')
                        _tag = utils.createElement('input', 'shared', 'shared' + row[0], '')
                        _tag.setAttribute('type', 'checkbox')

                        if (row[6] == 1) {
                            _tag.setAttribute('checked','checked')
                        }

                        return _tag.outerHTML
                    }
                }, {
                    targets: 6, //private
                    className: 'center',
                    data: 'private',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'shared', 'private' + row[0], '')
                        _tag.setAttribute('type', 'checkbox')

                        if (row[7] == 1) {
                            _tag.setAttribute('checked','checked')
                        }

                        return _tag.outerHTML
                    }
                }, {
                    targets: 7, //overlap
                    className: 'center',
                    data: 'overlap',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'form-control shared', 'overlap' + row[0], '')
                        _tag.setAttribute('value', row[8])

                        return _tag.outerHTML
                    }
                }, {
                    targets: 8, //clone
                    className: 'center',
                    data: 'clone',
                    render: function (data, type, row, meta) {
                        var _tag = ''
                        _tag = utils.createElement('input', 'shared', 'clone' + row[0], '')
                        _tag.setAttribute('type', 'checkbox')

                        if (row[12] == 1) {
                            _tag.setAttribute('checked', 'checked')
                        }

                        return _tag.outerHTML
                    }
                }, {
                    targets: 9, //status
                    className: 'center',
                    data: 'status',
                    render: function (data, type, row, meta) {

                        if (row[11] === 0) {
                            return `<span class="label label-danger" id="status${row[0]}" data-status="${row[11]}">Inactive</span>`
                        } else {
                            return `<span class="label label-success" id="status${row[0]}" data-status="${row[11]}">Active</span>`
                        }

                    }
                }, {
                    targets: 10, //message
                    className: 'center',
                    data: 'message',
                    render: function (data, type, row, meta) {
                        var _tag = ''

                        if (row[11] === 1 && row[12] == 1) {
                            _tag = '<i class="fas fa-check text-success" style="font-size: 20px;"></i>'
                        }

                        if (row[13] != '') {
                            _tag += `<i class="fas fa-comment-alt" style="font-size: 20px;" title="${row[13]}"></i>`
                        }

                        return _tag;

                    }
                }
            ],
            processing: true,
            stateSave: true,
            paging: false,
            sPaginationType: 'full_numbers'
        })

        editor.draw()
        editor.columns.adjust().draw()

        MicroModal.close('wait-modal')

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
    setTitle: function () {
            var detCruise = document.getElementById('det-cruise')
            var detTime = document.getElementById('det-time')

            switch (parseInt(dataArrive.channelId)) {
                case 1:
                    detCruise.style.display = "block"
                    detTime.style.display = "none"
                    break;
                case 2:
                    detCruise.style.display = "none"
                    detTime.style.display = "none"
                    break;
                case 3:
                    detCruise.style.display = "none"
                    detTime.style.display = "none"
                    break;
            }
    },
    setData: function(band) {
        if (band === true) {
            document.querySelector('[name="channel"]').setAttribute('disabled', 'disabled')
            document.querySelector('[name="vendor"]').setAttribute('disabled', 'disabled')
            document.querySelector('[name="cruise"]').setAttribute('disabled', 'disabled')
            document.querySelector('[name="date"]').setAttribute('disabled', 'disabled')
            document.querySelector('.save').setAttribute('disabled', 'disabled')
            document.querySelector('.recovery').setAttribute('disabled', 'disabled')
        } else {
            let channel = document.querySelector('[name="channel"]').removeAttribute('disabled')
            let vendor = document.querySelector('[name="vendor"]').removeAttribute('disabled')
            let cruise = document.querySelector('[name="cruise"]').removeAttribute('disabled')
            let date = document.querySelector('[name="date"]').removeAttribute('disabled')
        }
    }
}

var selectChannel = document.querySelector('[name="channel"]')

if (selectChannel != null) {

    selectChannel.addEventListener('change', function(e){
        e.preventDefault()
        var url = apiHost;

        var divCruise = document.querySelector('.div-cruise')
        var divVendorCruise = document.querySelector('.div-vendor-cruise')
        var date = document.querySelector('[name="date"]')
        var cruise = document.querySelector('[name="cruise"]')

        switch (parseInt(this.value)) {
            case 1:
                divCruise.style.display = 'block'
                if (divVendorCruise.classList.contains('hidden') === false) {
                    divVendorCruise.classList.add('hidden')
                }
                clone.removeOptions(cruise, 'all')
                cruise.removeAttribute('disabled')
                cruise.appendChild(new Option('--Choose option--'))

                date.removeAttribute('disabled')
                date.value = ""

                url = url + "arrives/vendorarrive/list"
                break;
            case 2:
                divCruise.style.display = 'none'
                if (divVendorCruise.classList.contains('hidden') === false) {
                    divVendorCruise.classList.add('hidden')
                }

                date.removeAttribute('disabled')
                date.value = ""

                url = url + "resellers/channel/2"
                break;
            case 3:

                url = url + "resellers/channel/3"
                if (divVendorCruise.classList.contains('hidden') === true) {
                    divVendorCruise.classList.remove('hidden')
                }

                clone.removeOptions(cruise, 'all')
                cruise.append(new Option(dataArrive.cruise, dataArrive.cruiseId))
                cruise.setAttribute('disabled', 'disabled')

                let vendorCruise = document.querySelector('[name="vendor_cruise"]')
                clone.removeOptions(vendorCruise, 'all')
                vendorCruise.append(new Option(dataArrive.vendor, dataArrive.vendorId))
                vendorCruise.setAttribute('disabled', 'disabled')

                date.setAttribute('disabled', 'disabled')
                date.value = dataArrive.date
                break;
        }

        let vendor = document.querySelector('[name="vendor"]')
        let dataElement = {
            id: null,
            key: 'reseller_name',
            value: 'reseller_id',
            element: vendor
        }

        clone.removeOptions(vendor)
        utils.api(JSON.stringify({}), url, 'GET', clone.loadOptions, dataElement)
    })
}

var selectVendor = document.querySelector('[name="vendor"]')

if (selectVendor != null) {
    selectVendor.append(new Option('-- Choose option --'))

    selectVendor.addEventListener('change', function(e) {
        e.preventDefault
        let channel = document.querySelector('[name="channel"]').value

        if (parseInt(channel) === 1) {
            let cruise = document.querySelector('[name="cruise"]')
            let dataElement = {
                id: null,
                key: 'ship_name',
                value: 'ship_id',
                element: cruise
            }
            clone.removeOptions(cruise)
            utils.api(JSON.stringify({}), `${apiHost}arrives/shipsarrive/${this.value}`, 'GET', clone.loadOptions, dataElement)
        }
    })
}

var selectVendorCruise = document.querySelector('[name="vendor_cruise"]')

if (selectVendorCruise != null) {
    selectVendorCruise.append(new Option('-- Choose option --'))

    selectVendorCruise.addEventListener('change', function(e) {
        e.preventDefault()

        let channel = document.querySelector('[name="channel"]').value
        let cruise = document.querySelector('[name="cruise"]')
        let dataElement = {
            id: null,
            key: 'ship_name',
            value: 'ship_id',
            element: cruise
        }

        clone.removeOptions(cruise)
        utils.api(JSON.stringify({}), `${apiHost}arrives/shipsarrive/${this.value}`, 'GET', clone.loadOptions, dataElement)
    })
}

var selectCruise = document.querySelector('[name="cruise"]')

if (selectCruise != null) {
    selectCruise.append(new Option('-- Choose option --'))
}

var search = document.getElementById('btn-search')
const btnSearch = utils.createElement('button', 'btn btn-primary', 'Search', "Search")
btnSearch.setAttribute('name', 'btn_modal_search')

search.appendChild(btnSearch)

var formbtn = document.querySelector('.form-actions')
formbtn.classList.add('col-md-5')

formbtn.childNodes[1].childNodes[1].remove()//Remove button cancel

var _btnRecovery = utils.createElement('button', 'btn btn-primary recovery', '', 'Recovery')
_btnRecovery.setAttribute('id', 'recovery')

formbtn.childNodes[1].appendChild(_btnRecovery)

var _btnSimulates = document.querySelector('.save')
_btnSimulates.addEventListener('click', function (e) {
    e.preventDefault()

    clone.buildJson()
})

//Create modal for search allotments
var newDataAllotment = document.querySelector('[name="btn_modal_search"]')
newDataAllotment.addEventListener('click', function (e) {
    e.preventDefault()

    var _alertModal = document.getElementById('confirm-modal-content')
    _alertModal.innerHTML = ''
    _alertModal.setAttribute('style', 'min-width:320px;')

    var _form = document.createElement('form', '', '', '');
    _form.setAttribute('id', 'frmSearch')
    _form.setAttribute('method', 'POST')
    _form.setAttribute('action', '/itm-backoffice/allotments/clone/')

    var _labelChannel = utils.createElement('span', 'control-label', '', 'Channel:')
    var _inputChannel = document.querySelector('[name="channelaux"]').cloneNode(true)
    _inputChannel.setAttribute('name', 'modalchannel')
    _inputChannel.setAttribute('id', 'modalchannel')
    var _inputChannelText = utils.createElement('input', 'hidden', '', '')
    _inputChannelText.setAttribute('name', 'modalchanneltext')
    _inputChannelText.setAttribute('id', 'modalchanneltext')

    var _labelReseller = utils.createElement('span', 'control-label', '', 'Vendor:')
    var _inputReseller = utils.createElement('select', 'form-control reseller', '', '')
    _inputReseller.setAttribute('name', 'modalvendor')
    _inputReseller.setAttribute('id', 'modalvendor')
    var _inputResellerText = utils.createElement('input', 'hidden', '', '')
    _inputResellerText.setAttribute('name', 'modalvendortext')
    _inputResellerText.setAttribute('id', 'modalvendortext')
    _inputReseller.append(new Option('-- Chosse option --'), '')

    var _labelDate = utils.createElement('span', 'control-label', '', 'Date:')
    var _inputDate = utils.createElement('input', 'form-control date', '', '')
    _inputDate.setAttribute('id', 'date')
    _inputDate.setAttribute('name', 'modaldate')


    _inputDate.setAttribute('maxlength', '45')
    _inputDate.setAttribute('placeholder', 'Y-m-d')
    _inputDate.flatpickr({
        dateFormat: 'Y-m-d'
    })

    _form.appendChild(_labelChannel)
    _form.appendChild(_inputChannel)
    _form.appendChild(_inputChannelText)
    _form.appendChild(_labelReseller)
    _form.appendChild(_inputReseller)
    _form.appendChild(_inputResellerText)
    _form.appendChild(_labelDate)
    _form.appendChild(_inputDate)

    _alertModal.appendChild(_form)
    var modal = document.getElementById('confirm-modal-footer')

    MicroModal.show('confirm-modal')

    var inpModalChannel = document.querySelector('[name="modalchannel"]')
    inpModalChannel.addEventListener('change', function(e){
        e.preventDefault
        var vendor = document.querySelector('[name="modalvendor"]')
        var cruise = document.querySelector('[name="modalcruise"]')

        if (parseInt(this.value) === 1) {
            if (cruise == null) {
                var _labelCruise = utils.createElement('span', 'control-label', '', 'Cruise:')
                _labelCruise.setAttribute('id', 'lblCruise')
                var _inputCruise = utils.createElement('select', 'form-control date', '', '')

                _inputCruise.setAttribute('id', 'inpCruise')
                _inputCruise.setAttribute('name', 'modalcruise')
                _inputCruise.append(new Option('-- chosse option --'), '')

                var _inputCruiseText = utils.createElement('input', 'hidden', '', '')
                _inputCruiseText.setAttribute('name', 'modalcruisetext')

                document.querySelector('[name="modalvendor"]').after(_inputCruise)
                document.querySelector('[name="modalvendor"]').after(_labelCruise)
                document.querySelector('[name="modalvendor"]').after(_inputCruiseText)

                vendor.addEventListener('change', function(e) {
                    e.preventDefault
                    e.stopImmediatePropagation()

                    var ship_opt = document.querySelector('[name="modalcruise"]')
                    if (ship_opt != null) {
                        let dataElement = {
                            id: null,
                            key: 'ship_name',
                            value: 'ship_id',
                            element: ship_opt
                        }

                        let id = this.value
                        clone.removeOptions(ship_opt)
                        utils.api(JSON.stringify({}), `${apiHost}ships/reseller/${id}`, 'GET', clone.loadOptions, dataElement)
                    }
                })
            }
        } else {
            if (cruise != null) {
                document.getElementById('lblCruise').remove()
                document.getElementById('inpCruise').remove()
            }
        }

        let dataElement = {
            id: null,
            key: 'reseller_name',
            value: 'reseller_id',
            element: vendor
        }

        let id = this.value
        clone.removeOptions(vendor)

        utils.api(JSON.stringify({}), `${apiHost}resellers/channel/${id}`, 'GET', clone.loadOptions, dataElement)
    })

    var btnSearch = document.querySelector(".confirm-delete")
    btnSearch.addEventListener('click', function(e){
        e.preventDefault

        var inpChannel = document.querySelector("[name='modalchannel']")
        var inpVendor = document.querySelector("[name='modalvendor']")
        var inpCruise = document.querySelector("[name='modalcruise']")

        var optionChannel = inpChannel.getElementsByTagName("option")
        var optionVendor = inpVendor.getElementsByTagName("option")
        if (inpCruise != null) {
            var optionCruise = inpCruise.getElementsByTagName("option")
            document.querySelector('[name="modalcruisetext"]').value =  optionCruise[inpCruise.selectedIndex].innerHTML
        }

        document.querySelector('[name="modalchanneltext"]').value =  optionChannel[inpChannel.selectedIndex].innerHTML
        document.querySelector('[name="modalvendortext"]').value =  optionVendor[inpVendor.selectedIndex].innerHTML

        document.getElementById('frmSearch').submit()
    })
})


var configTable = document.getElementById('allotments-clone')

const utilAjaxExecute = function () {
    var url = ""
    var method = "POST"
    var dataObj = new Object()

    dataArrive.channelId

    if (dataArrive.arriveId == null) {

        switch (parseInt(dataArrive.channelId)) {
            case 1:
                url = "/ship/"+dataArrive.cruiseId
                dataObj.start_date = dataArrive.date
                break;
            case 2:
                url = "/reseller/"+dataArrive.vendorId
                dataObj.start_date = dataArrive.date
                break;
            case 3:
                url = "/reseller/"+dataArrive.vendorId
                dataObj.start_date = dataArrive.date
                break;
        }

    } else {
        if (dataArrive.arriveId !== null) {
            url = "/arrive/" + dataArrive.arriveId
            method = "GET"
        }
    }

    if (configTable !== undefined && configTable !== null && configTable !== undefined && configTable !== undefined) {
        var band = false
        if (url == "") {
            band = true
        }

        utils.api(JSON.stringify(dataObj), `${apiHost}allotments${url}`, method, clone.loadData, band)
    }
}

clone.setTitle()

utilAjaxExecute()

$(function () {
    document.getElementsByClassName('date-format').flatpickr({
        dateFormat: 'Y-m-d',
        minDate: 'today'
    })
})

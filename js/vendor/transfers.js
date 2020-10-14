'use strict'
var dynamicTableId = 'dynamic-table'

var transfer = {
    init: function() {
        const datepicker = document.querySelector('[name="operation-date"]')
        const channels = document.querySelectorAll('.cmb-channel')
        const vendors = document.querySelectorAll('.cmb-vendor')
        const cruises = document.querySelectorAll('.cmb-cruise')
        const btnCancel = document.querySelector('.cancel')
        const btnSearch = document.querySelector('.save')

        btnCancel.addEventListener('click', function(e) {
            e.preventDefault()
            transfer.resetData()
        })

        btnSearch.textContent = 'Search'
        btnSearch.addEventListener('click', function(e) {
            e.preventDefault()

            let url = `${apiHost}allotments/mergeconfiguration`
            let fields = document.querySelectorAll('[data-validator]')
            let shipOrigin = document.querySelector('[name = "origin-cruise"]')
            let shipDestiny = document.querySelector('[name = "destiny-cruise"]')

            if (!utils.dataValidator(fields))
                return
            if (!transfer.isValidCruise(shipOrigin))
                return
            if (!transfer.isValidCruise(shipDestiny))
                return;

            let operation_date = document.querySelector('[name = "operation-date"]').value
            let info = {
                origin: {
                    "channel_id": document.querySelector('[name = "origin-channel"]').value,
                    "reseller_id": document.querySelector('[name = "origin-vendor"]').value,
                    "start_date": operation_date
                },
                destination: {
                    "channel_id": document.querySelector('[name = "destiny-channel"]').value,
                    "reseller_id": document.querySelector('[name = "destiny-vendor"]').value,
                    "start_date": operation_date
                }
            }

            if (!shipOrigin.closest('.row').classList.contains('d-none'))
                info.origin.ship_id = shipOrigin.value

            if (!shipDestiny.closest('.row').classList.contains('d-none'))
                info.destination.ship_id = shipDestiny.value

            utils.api(JSON.stringify(info), url, 'POST', transfer.deployData)


        })

        datepicker.flatpickr({
            altFormat: 'F j, Y',
            dateFormat: 'Y-m-d',
            defaultDate: 'today',
            altInput: true,
            minDate: 'today',
            onChange: function(selectedDates, dateStr, instance) {
                transfer.resetData()
            }
        })

        channels.forEach(element => {
            element.addEventListener('change', function(e) {
                e.preventDefault()

                let elementName = e.target.getAttribute('name').split('-')[0] + '-'
                let vendor = document.querySelector('[name = "' + elementName + 'vendor"]')
                let cruise = document.querySelector('[name = "' + elementName + 'cruise"]')
                let divCruise = cruise.closest('.row')

                utils.removeOptions(vendor, 0)
                utils.removeOptions(cruise, 0)
                transfer.dropTable()

                if (e.target.selectedIndex == 0)
                    return

                let url = `${apiHost}resellers/operationdate`
                let date = document.querySelector('[name = "operation-date"]')
                let selectedValue = e.target.options[e.target.selectedIndex].value
                let channel_name = e.target.options[e.target.selectedIndex].textContent

                if (channel_name === 'Web') {
                    divCruise.classList.add('d-none')
                } else
                    divCruise.classList.remove('d-none')

                let info = {
                    channel_id: selectedValue,
                    operation_date: date.value
                }

                utils.api(JSON.stringify(info), url, 'POST', transfer.loadVendors, vendor)

            })
        })

        vendors.forEach(element => {
            element.addEventListener('change', function(e) {
                e.preventDefault()

                let elementName = e.target.getAttribute('name').split('-')[0] + '-' + 'cruise'
                let ship = document.querySelector('[name = "' + elementName + '"]')

                utils.removeOptions(ship, 0)
                transfer.dropTable()

                if (e.target.selectedIndex == 0)
                    return

                let url = `${apiHost}ships/operationdate`
                let date = document.querySelector('[name = "operation-date"]')
                let selectedValue = e.target.options[e.target.selectedIndex].value

                let info = {
                    reseller_id: selectedValue,
                    operation_date: date.value
                }

                utils.api(JSON.stringify(info), url, 'POST', transfer.loadCruises, ship)

            })
        })

        cruises.forEach(element => {
            element.addEventListener('change', function(e) {
                e.preventDefault()
                transfer.dropTable()
            })
        })

    },
    deployData: function(response) {

        try {
            MicroModal.close("wait-modal");

            response = JSON.parse(response);
            if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
                utils.displayModal(alertModal, response.message);
            } else if (response.code === 200) {

                transfer.dropTable();
                let content = document.querySelector(".content-wrapper");

                let node = document.createElement("table");
                node.id = dynamicTableId;

                content.appendChild(node);

                $("#" + dynamicTableId).DataTable(
                    transfer.getDataTableConfig(response.message)
                ).draw()


                let listInputPax = document.querySelectorAll('.btn-save')
                if (null != listInputPax) {
                    listInputPax.forEach(element => transfer.setEvent(element))
                }
            }
        } catch (e) {
            utils.displayModal(alertModal, '');
        }

    },
    dropTable: function() {
        let dynamicTable = document.querySelector("#" + dynamicTableId);

        if (dynamicTable != null && $.fn.dataTable.isDataTable("#" + dynamicTableId)) {
            $("#" + dynamicTableId)
                .DataTable()
                .destroy();

            dynamicTable.parentNode.removeChild(dynamicTable);
        }
    },
    getDataTableConfig: function(dataSource) {
        let dataTableConfig = {};
        let columnNames = Object.keys(dataSource[0]);
        let columns = [{
                data: "service_name",
                title: "service",
                mData: "service_name",
                sTitle: "service"
            },
            { data: "schedule_start", className: 'center', title: "schedule_start", mData: "schedule_start", sTitle: "schedule_start" },
            { data: "min_available", className: 'center', title: "o_minimum", mData: "min_available", sTitle: "o_minimum" },
            { data: "max_available", className: 'center', title: "o_maximum", mData: "max_available", sTitle: "o_maximum" },
            {
                data: "available",
                className: 'center',
                title: "o_available",
                mData: "available",
                sTitle: "o_available",
                render: function(data, type, row, meta) {
                    let tag = utils.createElement('p', 'badge badge-primary text-justify', 'o-available-' + row.allotment_id, data)

                    return tag.outerHTML
                }
            },
            {
                data: "active_status",
                className: 'center',
                title: "status",
                mData: "active_status",
                sTitle: "status",
                render: function(data, type, row, meta) {
                    let tag = ''
                    if (row.active_status === 1) {
                        tag = utils.createElement('p', 'badge badge-success', '', 'Active')
                    } else {
                        tag = utils.createElement('p', 'badge badge-danger', '', 'Inactive')
                    }

                    return tag.outerHTML
                }
            },
            {
                data: "max_available_destination",
                className: 'center',
                title: "d_maximum",
                mData: "max_available_destination",
                sTitle: "d_maximum",
                render: function(data, type, row, meta) {
                    let tag = ''
                    if (row.allotment_id_destination == 0) {
                        tag = utils.createElement('p', 'badge badge-danger', '', 'No match')
                        return tag.outerHTML
                    }

                    return data

                }
            },
            {
                data: "available_destination",
                className: 'center',
                title: "d_available",
                mData: "available_destination",
                sTitle: "d_available",
                render: function(data, type, row, meta) {
                    let tag = ''
                    if (row.allotment_id_destination == 0) {
                        tag = utils.createElement('p', 'badge badge-danger', '', 'No match')
                        return tag.outerHTML
                    }

                    return data

                }
            },
            {
                data: "",
                className: 'center',
                title: "pax",
                mData: "",
                sTitle: "pax",
                render: function(data, type, row, meta) {
                    let tag = ''
                    if (row.allotment_id_destination === 0) {
                        tag = utils.createElement('p', 'badge badge-danger', '', 'No match')
                    } else {
                        tag = utils.createElement('input', 'form-control input-pax', 'input-' + row.allotment_id, '')
                        tag.setAttribute('name', 'input-' + row.allotment_id)
                        tag.setAttribute('value', row.available)
                        tag.setAttribute('type', 'number')
                        tag.setAttribute('min', 1)
                        tag.setAttribute('max', row.available)
                        tag.setAttribute('data-validator', 'number')
                        tag.setAttribute('data-validator-msg', 'The pax is invalid!')

                    }
                    return tag.outerHTML

                }
            },
            {
                data: "",
                className: 'center',
                title: "action",
                mData: "",
                sTitle: "action",
                render: function(data, type, row, meta) {
                    let tag = ''
                    if (row.allotment_id_destination === 0) {
                        tag = utils.createElement('p', 'badge badge-danger', '', 'No match')
                    } else {
                        tag = utils.createElement('button', 'form-control btn btn-success btn-save', 'btn-' + row.allotment_id, 'Transfer')
                        tag.setAttribute('allotment_id', row.allotment_id)
                        tag.setAttribute('allotment_id_destination', row.allotment_id_destination)
                        tag.setAttribute('row', meta.row)
                    }
                    return tag.outerHTML
                }
            }

        ];

        dataTableConfig = utils.getDataTableConfig();
        dataTableConfig.data = dataSource;
        dataTableConfig.columns = columns;
        dataTableConfig.retrieve = true;

        return dataTableConfig;
    },
    isValidCruise: function(tag) {

        if (!tag.closest('.row').classList.contains('d-none')) {
            if (tag.value === '') {
                validator.setFocus(tag.getAttribute('name'))
                utils.displayModal(alertModal, 'The cruise is required')
                return false;
            }
        }

        return true
    },
    loadVendors: function(response, vendor) {

        try {
            MicroModal.close('wait-modal')

            response = JSON.parse(response)

            if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
                utils.displayModal(alertModal, response.message)

            } else if (response.code === 200) {
                let data = {
                    key: 'reseller_name',
                    value: 'reseller_id',
                    element: vendor
                }

                utils.buildOptions(data, response.message, 1)
            }
        } catch (e) {
            utils.displayModal(alertModal, '')
        }
    },
    loadCruises: function(response, ship) {
        try {

            MicroModal.close('wait-modal')

            response = JSON.parse(response)

            if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
                utils.displayModal(alertModal, response.message)

            } else if (response.code === 200) {
                let data = {
                    key: 'ship_name',
                    value: 'ship_id',
                    element: ship
                }

                utils.buildOptions(data, response.message, 1)
            }
        } catch (e) {
            utils.displayModal(alertModal, '')
        }
    },
    resetData: function() {
        let listTagSelect = document.querySelectorAll('select:not(.flatpickr-monthDropdown-months)')

        listTagSelect.forEach(element => {
            if (!element.classList.contains('cmb-channel'))
                utils.removeOptions(element, 0)
            else
                element.options.selectedIndex = 0
        })

        transfer.dropTable();
    },
    save: function(response, element) {
        try {

            MicroModal.close('wait-modal')
            response = JSON.parse(response)

            if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
                utils.displayModal(alertModal, response.message)

            } else if (response.code === 200) {

                let result = response.message[0]
                utils.displayModal(alertModal, result.message)
                let rowIndex = element.getAttribute('row')
                let table = $("#" + dynamicTableId).DataTable().rows()
                let data = table.row(rowIndex).data()

                data.available = result.o_available
                data.max_available = result.o_maximum
                data.available_destination = result.d_available
                data.max_available_destination = result.d_maximum

                table.row(rowIndex).data(data).draw()
                element = document.querySelector('#btn-' + data.allotment_id)
                transfer.setEvent(element)

            }
        } catch (e) {
            utils.displayModal(alertModal, '')
        }
    },
    setEvent: function(tag) {
        tag.addEventListener('click', function(e) {
            e.preventDefault()
            let btn = e.target
            let origin_allotment_id = btn.getAttribute('allotment_id')
            let destination_allotment_id = btn.getAttribute('allotment_id_destination')
            let pax = document.querySelectorAll(`#input-${origin_allotment_id}`)
            let maximum = pax[0].getAttribute('max')
            let valid = true
            let url = `${apiHost}allotments/transferallotment`

            valid = utils.dataValidator(pax)

            if (pax[0].value == 0 || pax[0].value > maximum) {
                valid = false
                validator.setFocus(`input-${origin_allotment_id}`)
                utils.displayModal(alertModal, pax[0].getAttribute('data-validator-msg'))

            }

            if (valid) {
                let info = {
                    "data": [{
                        "user_id": user_create_id,
                        "origin_allotment_id": origin_allotment_id,
                        "destination_allotment_id": destination_allotment_id,
                        "total_pax": pax[0].value
                    }]
                }

                utils.api(JSON.stringify(info), url, 'POST', transfer.save, btn)
            }
        })
    }
}

transfer.init()

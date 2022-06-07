'use strict'
var info
var form
var pricesData = window.prices
var equivalenceData = window.equivalences
var userCreateId = window.user_create_id

var prices = {
    add: function(response) {
        MicroModal.close('wait-modal')

        response = JSON.parse(response)
        var _message = ''
        var _alertModal = document.getElementById('alert-modal-content')

        if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
            _message = utils.createElement('p', '', '', response.message)

            _alertModal.innerHTML = ''
            _alertModal.appendChild(_message)

            MicroModal.show('alert-modal')
        } else if (response.code === 201) {
            _message = utils.createElement('p', '', '', 'Success! price added correctly')

            _alertModal.innerHTML = ''
            _alertModal.appendChild(_message)

            MicroModal.show('alert-modal')

            form = document.querySelector('#add-price')
            form.reset()
        }
    },
    update: function(response) {
        MicroModal.close('wait-modal')

        response = JSON.parse(response)
        var _message = ''
        var _alertModal = document.getElementById('alert-modal-content')

        if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
            _message = utils.createElement('p', '', '', response.message)

            _alertModal.innerHTML = ''
            _alertModal.appendChild(_message)

            MicroModal.show('alert-modal')
        } else if (response.code === 204) {
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

        if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
            _message = utils.createElement('p', '', '', response.message)

            _alertModal.innerHTML = ''
            _alertModal.appendChild(_message)

            MicroModal.show('alert-modal')
        } else if (response.code === 200) {
            var _status = document.querySelector(`[data-status="${id}"]`)
            _status.innerHTML = ''

            var label = utils.createElement('span', 'badge badge-danger', '', 'inactive')
            _status.appendChild(label)

            _message = utils.createElement('p', '', '', 'Success! Price inactivate correctly')

            _alertModal.innerHTML = ''
            _alertModal.appendChild(_message)

            MicroModal.show('alert-modal')
        }
    },
    setData: function() {

        if (pricesData.ship_id > 0) {
            document.querySelector('.select-ship').classList.remove('d-none')
            let element = document.querySelector('[name="ship"]')
            element.innerHTML = '<option value="' + pricesData.ship_id + '">' + pricesData.ship_name + '</option>'
            element.disabled = true
        }

        let channelElement = document.querySelector('[name="channel"]')
        let resellerElement = document.querySelector('[name="reseller"]')
        let serviceElement = document.querySelector('[name="service"]')
        let paxElement = document.querySelector('[name="pax"]')
        let currencyElement = document.querySelector('[name="currency"]')
        let priceElement = document.querySelector('[name="price"]')
        let purchaseDateElement = document.querySelector('[name="start-purchase"]')
        let seassonDateElement = document.querySelector('[name="end-purchase"]')

        channelElement.value = pricesData.channel_id
        channelElement.disabled = true
        resellerElement.value = pricesData.reseller_id
        resellerElement.disabled = true
        serviceElement.value = pricesData.service_id
        serviceElement.disabled = true
        paxElement.value = pricesData.pax_id
        paxElement.disabled = true
        currencyElement.value = pricesData.currency_id
        currencyElement.disabled = true
        priceElement.value = pricesData.price
        priceElement.disabled = false

        flatpickr(purchaseDateElement, {
            altFormat: 'F j, Y',
            dateFormat: 'Y-m-d',
            altInput: true,
            defaultDate: pricesData.start_date_purchase,
            minDate: pricesData.start_date_purchase,
            maxDate: pricesData.start_date_purchase
        })

        flatpickr(seassonDateElement, {
            altFormat: 'F j, Y',
            dateFormat: 'Y-m-d',
            altInput: true,
            defaultDate: pricesData.end_date_purchase,
            minDate: pricesData.start_date_purchase
        })

        document.querySelector('[name="active"]').value = pricesData.active_status
    },
    setListShips: function(response, element) {

        response = JSON.parse(response)

        if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
            document.querySelector('.select-ship').classList.add('d-none')

        } else if (response.code === 200) {
            document.querySelector('.select-ship').classList.remove('d-none')

            response.message.forEach(ship => {
                element.innerHTML += '<option value="' + ship.ship_id + '"><span style="color:red;">' + ship.ship_name + '<span></option>'
            });

        }
        MicroModal.close('wait-modal')
    },
    setListEquivalences: function(response, element) {
        MicroModal.close('wait-modal')

        response = JSON.parse(response)
        var _message = ''
        var _alertModal = document.getElementById('alert-modal-content')

        if (Object.prototype.hasOwnProperty.call(codes, response.code)) {

            element.innerHTML = '<option value="0">This Reseller has no assigned any equivalence</option>'
            element.disabled = true
            document.querySelector('.save').disabled = true
            document.querySelector('[name="currency"]').disabled = true
            document.querySelector('[name="pax"]').disabled = true
            document.querySelector('[name="price"]').disabled = true
            document.querySelector('[name="pAdult"]').disabled = true
            document.querySelector('[name="pChildren"]').disabled = true
            document.querySelector('[name="pInfant"]').disabled = true
            document.querySelector('[name="pCourtesy"]').disabled = true

            _message = utils.createElement('p', '', '', response.message)
            _alertModal.innerHTML = ''
            _alertModal.appendChild(_message)

            MicroModal.show('alert-modal')
        } else if (response.code === 200) {

            element.disabled = false
            document.querySelector('.save').disabled = false
            document.querySelector('[name="currency"]').disabled = false
            document.querySelector('[name="pax"]').disabled = false
            document.querySelector('[name="price"]').disabled = false
            document.querySelector('[name="pAdult"]').disabled = false
            document.querySelector('[name="pChildren"]').disabled = false
            document.querySelector('[name="pInfant"]').disabled = false
            document.querySelector('[name="pCourtesy"]').disabled = false

            response.message.forEach(service => {
                element.innerHTML += '<option value="' + service.service_id + '">' + service.service_reseller + ' / <span style="color:red;">' + service.service_name + '<span></option>'
            });

            MicroModal.close('wait-modal')
        }

    },
    isValidPurchaseDate: function(startDate, endDate) {

        startDate = new Date(startDate)
        endDate = new Date(endDate)
        var _message = ''
        var _alertModal = document.getElementById('alert-modal-content')

        if (startDate.getTime() > endDate.getTime()) {
            _message = utils.createElement('p', '', '', 'The start date to purchase must be less than the end date to purchase')

            _alertModal.innerHTML = ''
            _alertModal.appendChild(_message)

            MicroModal.show('alert-modal')

            return false
        }

        return true

    }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
    cancel.addEventListener('click', function(e) {
        e.preventDefault()

        form = document.querySelector('#add-price')
        if (form != null) {
            form.reset()
        }
    })
}

var reseller = document.querySelector('[name="reseller"]')
if (reseller != null) {
    reseller.addEventListener('change', function(e) {
        e.preventDefault()

        let shipElement = document.querySelector('[name="ship"]')
        let serviceElement = document.querySelector('[name="service"]')

        resetSelectElement(shipElement)
        resetSelectElement(serviceElement)

        if (!isNaN(reseller.value)) {
            getListServicesByReseller(reseller.value)
            getListShipByReseller(reseller.value)
        }
    })
}

var channel = document.querySelector('[name="channel"]')
if (channel != null) {
    let reseller = document.querySelector('[name="reseller"]')
    let service = document.querySelector('[name="service"]')

    channel.addEventListener('change', function(e) {
        e.preventDefault()
        document.querySelector('.select-ship').classList.add('d-none')
        reseller.options[0].selected = true
        resetSelectElement(service)
        for (var x = 1; x < reseller.options.length; x++) {
            if (reseller.options[x].getAttribute('data-value') !== channel.value) {
                reseller.options[x].hidden = true
            } else {
                reseller.options[x].removeAttribute('hidden')
            }
        }
    })
}

function resetSelectElement(element) {
    element.innerHTML = ''
    element.innerHTML = '<option>-- Choose option --</option>'
}

function getListShipByReseller(resellerId) {
    let element = document.querySelector('[name="ship"]')
    let url = apiHost + `ships/reseller/${resellerId}`
    utils.api({}, url, 'GET', prices.setListShips, element)

}

function getListServicesByReseller(resellerId) {
    let element = document.querySelector('[name="service"]')
    let url = apiHost + `equivalences/reseller/${resellerId}`
    utils.api({}, url, 'GET', prices.setListEquivalences, element)
}

var save = document.querySelector('.save')
if (save != null) {
    save.addEventListener('click', function(e) {
        e.preventDefault()

        let valid = true
        let fields = document.querySelectorAll('[data-validator]')
        let elementStartPurchaseDate = document.querySelector('[name="start-purchase"]').value
        let elementEndPurchaseDate = document.querySelector('[name="end-purchase"]').value
        let elementService = document.querySelector('[name="service"]').value
        let elementReseller = document.querySelector('[name="reseller"]').value
        let elementPax = document.querySelector('[name="pax"]').value
        let elementCurrency = document.querySelector('[name="currency"]').value
        let elementPrice = document.querySelector('[name="price"]').value
        let elementShip = document.querySelector('[name="ship"]').value

        // paxes
        let adultPrice = document.querySelector('[name="pAdult"]').value
        let childrenPrice = document.querySelector('[name="pChildren"]').value
        let infantPrice = document.querySelector('[name="pInfant"]').value
        let courtesyPrice = document.querySelector('[name="pCourtesy"]').value

        if (isNaN(elementShip))
            elementShip = 0

        valid = utils.dataValidator(fields)

        if (valid && prices.isValidPurchaseDate(elementStartPurchaseDate, elementEndPurchaseDate)) {
            info = {
                prices: [],
                service_id: elementService,
                reseller_id: elementReseller,
                pax_id: elementPax,
                currency_id: elementCurrency
            }

            info.price = elementPrice
            info.start_date_purchase = elementStartPurchaseDate
            info.end_date_purchase = elementEndPurchaseDate
            info.seasson_start = elementStartPurchaseDate
            info.seasson_end = elementEndPurchaseDate
            info.ship_id = elementShip
            info.user_id = userCreateId

            form = document.querySelector('#add-price')


            let url = ''
            if (form != null) {

                if (adultPrice != '') {
                    info.prices.push({
                        pax_id: 1,
                        price: adultPrice
                    })
                }

                if (childrenPrice != '') {
                    info.prices.push({
                        pax_id: 2,
                        price: childrenPrice
                    })
                }

                if (infantPrice != '') {
                    info.prices.push({
                        pax_id: 3,
                        price: infantPrice
                    })
                }

                if (courtesyPrice != '') {
                    info.prices.push({
                        pax_id: 4,
                        price: courtesyPrice
                    })
                }

                url = apiHost + 'prices/add'
                utils.api(JSON.stringify(info), url, 'POST', prices.add)
            }

            form = document.querySelector('#update-price')

            if (form != null) {
                info.active_status = document.querySelector('[name="active"]').value
                url = apiHost + `prices/edit/${pricesData.price_id}`
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
        if (!e.target.getAttribute('data-id')) {
            element = e.target.parentElement
        }

        var id = element.getAttribute('data-id')
        var url = apiHost + `prices/del/${id}`

        utils.api(JSON.stringify({}), url, 'DELETE', prices.delete, element)
    })
}

form = document.querySelector('#add-price')
if (form != null) {
    let statusCombo = form.querySelector('.select-status')
    statusCombo.remove()

    const paxContent = document.querySelector('[name="pax"]').closest('.form-group')
    const priceContent = document.querySelector('[name="price"]').closest('.form-group')

    paxContent.classList.add('d-none')
    priceContent.classList.add('d-none')

    if (document.querySelector('.date-range')) {
        flatpickr('.date-range', {
            altFormat: 'F j, Y',
            dateFormat: 'Y-m-d',
            altInput: true,
            minDate: '2020-01-01'
        })
    }
}

form = document.querySelector('#update-price')
if (form != null) {
    const adult = document.querySelector('[name="pAdult"]').closest('.form-group')
    const children = document.querySelector('[name="pChildren"]').closest('.form-group')
    const infant = document.querySelector('[name="pInfant"]').closest('.form-group')
    const courtesy = document.querySelector('[name="pCourtesy"]').closest('.form-group')

    adult.classList.add('d-none')
    children.classList.add('d-none')
    infant.classList.add('d-none')
    courtesy.classList.add('d-none')

    prices.setData()
}

var servicesTable = document.querySelector('#table-prices')
if (servicesTable !== null) {
    $(function() {
        $('#table-prices').dataTable({
            sPaginationType: 'full_numbers',
            iDisplayLength: 20,
            aLengthMenu: [
                [20, 50, 100, -1],
                [20, 50, 100, 'All']
            ]
        })
    })
}

var dropdownBtn = document.querySelectorAll('[data-toggle="dropdown"]')

for (i = 0, l = options.length; i < l; i++) {
    dropdownBtn[i].addEventListener('click', function(e) {
        e.preventDefault()

        var element = e.target
        if (!e.target.getAttribute('id')) {
            element = e.target.parentElement
        }

        var id = element.getAttribute('id')

        if (!document.querySelector('[aria-labelledby="' + id + '"]').getAttribute('style')) {
            document.querySelector('[aria-labelledby="' + id + '"]').setAttribute('style', 'display:block')
        } else {
            document.querySelector('[aria-labelledby="' + id + '"]').removeAttribute('style')
        }
    })
}

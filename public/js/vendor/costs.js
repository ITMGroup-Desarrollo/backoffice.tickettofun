'use strict'
var info
var form
var costsData = window.costs
var equivalenceData = window.equivalences
var userCreateId = window.user_create_id

var costs = {
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
            _message = utils.createElement('p', '', '', 'Success! cost added correctly')

            _alertModal.innerHTML = ''
            _alertModal.appendChild(_message)

            MicroModal.show('alert-modal')

            form = document.querySelector('#add-cost')
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
            _message = utils.createElement('p', '', '', 'Success! Cost updated correctly')

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

            _message = utils.createElement('p', '', '', 'Success! Cost inactivate correctly')

            _alertModal.innerHTML = ''
            _alertModal.appendChild(_message)

            MicroModal.show('alert-modal')
        }
    },
    setData: function() {

       
        let resellerElement = document.querySelector('[name="reseller"]')
        let serviceElement = document.querySelector('[name="service"]')
        let paxElement = document.querySelector('[name="pax"]')
        let currencyElement = document.querySelector('[name="currency"]')
        let costElement = document.querySelector('[name="cost"]')
        
        
        resellerElement.value = costsData.reseller_id
        resellerElement.disabled = true
        serviceElement.value = costsData.service_id
        serviceElement.disabled = true
        paxElement.value = costsData.pax_id
        paxElement.disabled = true
        currencyElement.value = costsData.currency_id
        currencyElement.disabled = true
        costElement.value = costsData.cost
        costElement.disabled = false  

        document.querySelector('[name="active"]').value = costsData.active_status
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
            document.querySelector('[name="cost"]').disabled = true

            _message = utils.createElement('p', '', '', response.message)
            _alertModal.innerHTML = ''
            _alertModal.appendChild(_message)

            MicroModal.show('alert-modal')
        } else if (response.code === 200) {

            element.disabled = false
            document.querySelector('.save').disabled = false
            document.querySelector('[name="currency"]').disabled = false
            document.querySelector('[name="pax"]').disabled = false
            document.querySelector('[name="cost"]').disabled = false

            response.message.forEach(service => {
                element.innerHTML += '<option value="' + service.service_id + '">' + service.service_reseller + ' / <span style="color:red;">' + service.service_name + '<span></option>'
            });

            MicroModal.close('wait-modal')
        }

    }
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
    cancel.addEventListener('click', function(e) {
        e.preventDefault()

        form = document.querySelector('#add-cost')
        if (form != null) {
            form.reset()
        }
    })
}

var reseller = document.querySelector('[name="reseller"]')
if (reseller != null) {
    reseller.addEventListener('change', function(e) {
        e.preventDefault()
        
        let serviceElement = document.querySelector('[name="service"]')

        resetSelectElement(serviceElement)

        if (!isNaN(reseller.value)) {
            getListServicesByReseller(reseller.value)
        }
    })
}

function resetSelectElement(element) {
    element.innerHTML = ''
    element.innerHTML = '<option>-- Choose option --</option>'
}

function getListServicesByReseller(resellerId) {
    let element = document.querySelector('[name="service"]')
    let url = apiHost + `equivalences/reseller/${resellerId}`
    utils.api({}, url, 'GET', costs.setListEquivalences, element)

}

var save = document.querySelector('.save')
if (save != null) {
    save.addEventListener('click', function(e) {
        e.preventDefault()

        let valid = true
        let fields = document.querySelectorAll('[data-validator]')
        
        let elementService = document.querySelector('[name="service"]').value
        let elementReseller = document.querySelector('[name="reseller"]').value
        let elementPax = document.querySelector('[name="pax"]').value
        let elementCurrency = document.querySelector('[name="currency"]').value
        let elementCost = document.querySelector('[name="cost"]').value      

        valid = utils.dataValidator(fields)

        if (valid) {
            info = {
                service_id: elementService,
                reseller_id: elementReseller,
                pax_id: elementPax,
                currency_id: elementCurrency
            }

            info.cost = elementCost           
            info.user_id = userCreateId

            form = document.querySelector('#add-cost')

            let url = ''
            if (form != null) {
                url = apiHost + 'costs/add'
                utils.api(JSON.stringify(info), url, 'POST', costs.add)
            }

            form = document.querySelector('#update-cost')

            if (form != null) {
                info.active_status = document.querySelector('[name="active"]').value
                url = apiHost + `costs/edit/${costsData.cost_id}`
                utils.api(JSON.stringify(info), url, 'PUT', costs.update)
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
        var url = apiHost + `costs/del/${id}`

        utils.api(JSON.stringify({}), url, 'DELETE', costs.delete, element)
    })
}

form = document.querySelector('#add-costs')
if (form != null) {
    let statusCombo = form.querySelector('.select-status')
    statusCombo.remove()

    if (document.querySelector('.date-range')) {
        flatpickr('.date-range', {
            altFormat: 'F j, Y',
            dateFormat: 'Y-m-d',
            altInput: true,
            minDate: '2020-01-01'
        })
    }
}

form = document.querySelector('#update-cost')
if (form != null) {
    costs.setData()
}

var servicesTable = document.querySelector('#table-costs')
if (servicesTable !== null) {
    $(function() {
        $('#table-costs').dataTable({
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

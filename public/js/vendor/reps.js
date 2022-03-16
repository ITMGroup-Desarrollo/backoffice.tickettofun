'use strict'
var info
var form
var repData = window.repData
var userCreateId = window.user_create_id
var userId = 0

var rep = {
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
            _message = utils.createElement('p', '', '', 'Success! Rep added correctly')

            _alertModal.innerHTML = ''
            _alertModal.appendChild(_message)

            MicroModal.show('alert-modal')

            form = document.querySelector('#add-rep')
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
            _message = utils.createElement('p', '', '', 'Success! Rep updated correctly')

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

            _message = utils.createElement('p', '', '', 'Success! Rep inactivate correctly')

            _alertModal.innerHTML = ''
            _alertModal.appendChild(_message)

            MicroModal.show('alert-modal')
        }
    },
    setData: function() {
        var elements = ['first-name', 'last-name', 'status-rep', 'code-rep']
        userId = repData.user_id

        rep.showElements(elements, false)

        rep.showElements(['email-rep'], true)

        document.querySelector('[name="email"]').value = repData.email_addr

        document.querySelector('[name="status"]').value = repData.active

        document.querySelector('[name="first_name"]').value = repData.first_name

        document.querySelector('[name="last_name"]').value = repData.last_name

        document.querySelector('[name="code"]').value = repData['code_rep'];
        
    },
    setUserData: function(response) {
        MicroModal.close('wait-modal')

        var elements = []
        var _message = ''
        var _alertModal = document.getElementById('alert-modal-content')
        var repname = document.querySelector('[name="first_name"]')
        var replastname = document.querySelector('[name="last_name"]')
        var repcode = document.querySelector('[name="code"]')
        var booths = document.querySelector('[name="booths"]')
        var reppass = document.querySelector('[name="user_password"]')
        var conpass = document.querySelector('[name="confirm_password"]')
        var datepicker = document.querySelector('[name="dates"]')

        response = JSON.parse(response)

        if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
            _message = utils.createElement('p', '', '', response.message)

            _alertModal.innerHTML = ''
            _alertModal.appendChild(_message)

            MicroModal.show('alert-modal')
            elements = ['first-name', 'last-name', 'code-rep', 'booth-rep', 'new-password', 'confirm-password', 'booth-dates']
            rep.showElements(elements, false)

            repname.value = ''
            replastname.value = ''
            repcode.value = ''
            booths.value = ''
            reppass.value = ''
            conpass.value = ''

        } else if (response.code === 200) {
            var user = new Object()

            user = response.message[0]
            userId = user.user_id

            elements = ['first-name', 'last-name', 'code-rep', 'booth-rep', 'booth-dates']
            rep.showElements(elements, false)

            repname.value = user.first_name
            replastname.value = user.last_name

            elements = ['new-password', 'confirm-password']
            rep.showElements(elements, true)

        }
    },
    showElements: function(elements, hidden) {

        if (elements.length > 0) {
            if (!hidden) {
                elements.forEach(element => {
                    document.querySelector('.' + element).classList.remove('d-none')
                });
            } else {
                elements.forEach(element => {
                    document.querySelector('.' + element).classList.add('d-none')
                });
            }
        }
    }

}

form = document.querySelector('form')
if (form) {
    var searchEmail = utils.createElement('div', 'form-group email-rep row')
    var labeltext = utils.createElement('label', 'col-sm-2 col-md-2 control-label', '', 'Email')
    searchEmail.appendChild(labeltext)
    var divgroup = utils.createElement('div', 'input-group')
    var inputEmail = document.createElement('input')
    inputEmail.setAttribute('type', 'text')
    inputEmail.setAttribute('name', 'email')
    inputEmail.setAttribute('class', 'form-control')
    inputEmail.setAttribute('data-validator', 'empty')
    inputEmail.setAttribute('data-validator-msg', 'The email is required!')
    inputEmail.setAttribute('maxlength', '45')
    var span = utils.createElement('span', 'input-group-btn')
    var searchbtn = document.createElement('button')
    searchbtn.setAttribute('class', 'btn btn-default')
    searchbtn.setAttribute('type', 'button')
    searchbtn.setAttribute('name', 'searchbtn')
    searchbtn.innerHTML = 'Check'
    span.appendChild(searchbtn)
    divgroup.appendChild(inputEmail)
    divgroup.appendChild(span)
    var inputArea = utils.createElement('div', 'col-sm-10 col-md-8')
    inputArea.appendChild(divgroup)
    searchEmail.appendChild(inputArea)
    form.insertBefore(searchEmail, form.firstChild)
}

var cancel = document.querySelector('.cancel')
if (cancel != null) {
    cancel.addEventListener('click', function(e) {
        e.preventDefault()

        form = document.querySelector('#add-rep')
        if (form != null) {
            form.reset()
        }

        form = document.querySelector('#update-rep')
        if (form != null) {
            rep.setData()
        }
    })
}

var save = document.querySelector('.save')
if (save != null) {
    save.addEventListener('click', function(e) {
        e.preventDefault()

        var valid = 'true'
        var fields = document.querySelectorAll('[data-validator]')

        valid = utils.dataValidator(fields)

        if (valid) {
            info = {
                code: document.querySelector('[name="code"]').value,
                user_create_id: userCreateId,                
                user: {
                    first_name: document.querySelector('[name="first_name"]').value,
                    last_name: document.querySelector('[name="last_name"]').value,
                    email_addr: document.querySelector('[name="email"]').value,
                    user_password: document.querySelector('[name="user_password"]').value,
                    confirm_password: document.querySelector('[name="confirm_password"]').value,
                    user_id: userId,
                    user_create_id: userCreateId,
                },
                booth_id: (document.querySelector('[name="booths"]').value !== '' ? document.querySelector('[name="booths"]').value : 0)
            }

            if (document.querySelector('[name="dates"]').value.split(' to ')) {
                info.user.start_date = document.querySelector('[name="dates"]').value.split(' to ')[0]
                info.user.end_date = document.querySelector('[name="dates"]').value.split(' to ')[1]
            } else if (document.querySelector('[name="dates"]').value) {
                info.user.start_date = document.querySelector('[name="dates"]').value
                info.user.end_date = null
            } else {
                info.user.start_date = null
                info.user.end_date = null
            }

            var _message = ''
            var _alertModal = document.getElementById('alert-modal-content')

            if (userId == 0 && info.user.user_password.length < 5) {
                _message = utils.createElement('p', '', '', 'You have a wrong password, you need to create a password with more than 5 characters')
                _alertModal.innerHTML = ''
                _alertModal.appendChild(_message)
                MicroModal.show('alert-modal')
                return false
            }

            if (userId == 0 && info.user.user_password !== info.user.confirm_password) {
                _message = utils.createElement('p', '', '', 'You have a wrong password, the password and password confirm not are same')
                _alertModal.innerHTML = ''
                _alertModal.appendChild(_message)
                MicroModal.show('alert-modal')
                return false
            }

            form = document.querySelector('#add-rep')
            var url = ''
            if (form != null) {
                url = `${apiHost}sales/add`
                utils.api(JSON.stringify(info), url, 'POST', rep.add)
            }

            form = document.querySelector('#update-rep')

            if (form != null) {
                info.active_status = document.querySelector('[name="status"]').value

                url = `${apiHost}sales/edit/${repData.id}`
                utils.api(JSON.stringify(info), url, 'PUT', rep.update)
            }
        }
    })
}

var datepicker = (document.querySelector('[name="dates"]') ? document.querySelector('[name="dates"]') : '')
if (datepicker !== '') {
    datepicker.parentElement.parentElement.classList.add('disable')
    datepicker.flatpickr({
        altFormat: 'F j, Y',
        dateFormat: 'Y-m-d',
        defaultDate: 'today',
        altInput: true,
        mode: 'range',
        minDate: 'today'
    })
}

var booths = document.querySelector('[name="booths"]') ? document.querySelector('[name="booths"]') : ''
if (booths !== '') {
    booths.addEventListener('change', function(e) {
        if (this.value !== '') {
            datepicker.disabled = true
        } else {
            datepicker.disabled = false
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

        var url = `${apiHost}sales/del/${id}`
        utils.api(JSON.stringify({}), url, 'DELETE', rep.delete, element)
    })
}

var btnemail = (document.querySelector('[name="searchbtn"]') ? document.querySelector('[name="searchbtn"]') : '')

if (btnemail !== '') {
    btnemail.addEventListener('click', function(e) {
        var valid = true
        var emailField = document.querySelectorAll('[name="email"]')

        valid = utils.dataValidator(emailField)
        if (valid) {
            emailField = document.querySelector('[name="email"]')
            utils.api(JSON.stringify({}), `${apiHost}users/email/${emailField.value}`, 'GET', rep.setUserData)
        }
    })
}

form = document.querySelector('#add-rep')
if (form != null) {
    document.querySelector('.status-rep').remove()
}

form = document.querySelector('#update-rep')
if (form != null) {
    rep.setData()
}

var repsTable = document.querySelector('#sales-rep')
if (repsTable !== null) {
    $(function() {
        $('#sales-rep').dataTable({
            sPaginationType: 'full_numbers',
            iDisplayLength: 20,
            aLengthMenu: [
                [20, 50, 100, -1],
                [20, 50, 100, 'All']
            ]
        })
    })
}

var tableSales = document.querySelector('#table-sales')
if (tableSales !== null) {
    $(function() {
        $('#table-sales').dataTable({
            sPaginationType: 'full_numbers',
            iDisplayLength: 20,
            aLengthMenu: [
                [20, 50, 100, -1],
                [20, 50, 100, 'All']
            ]
        })
    })
}


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
            const data = JSON.parse(response.message)
            const table = $('#price-registers').DataTable()

            const rows = table.rows().data()

            for (let i = 0, l = rows.length; i < l; i++) {
              const service = data.prices.filter((row) => {
                return row.service_id == rows[i].service_id
              })

              let message = ''
              service.forEach(element => {
                message += element.message
              });

              let msgElement = document.querySelector(`#msg${rows[i].service_id}`)
              msgElement.innerText = message
            }

            _message = utils.createElement('p', '', '', 'Something wen wrong! please check the data')

            _alertModal.innerHTML = ''
            _alertModal.appendChild(_message)

            MicroModal.show('alert-modal')
        } else if (response.code === 201) {
            const data = JSON.parse(response.message)
            const table = $('#price-registers').DataTable()

            const rows = table.rows().data()

            for (let i = 0, l = rows.length; i < l; i++) {
              const service = data.prices.filter((row) => {
                return row.service_id == rows[i].service_id
              })

              let message = ''
              service.forEach(element => {
                if (element.message == null) {
                    element.message = ''
                }

                message += element.message
              });

              let msgElement = document.querySelector(`#msg${rows[i].service_id}`)
              msgElement.innerText = message
            }

            _message = utils.createElement('p', '', '', 'Success! price added correctly')

            _alertModal.innerHTML = ''
            _alertModal.appendChild(_message)

            MicroModal.show('alert-modal')
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
      try {
        MicroModal.close('wait-modal')

        response = JSON.parse(response)
        var _message = ''
        var _alertModal = document.getElementById('alert-modal-content')

        let configTable = {}
        const table = document.querySelector('#price-registers')

        utils.dropTable(table)

        const content = document.querySelector('.table-prices')
        const nodeTable = utils.createElement('table', '', 'price-registers', '')

        content.appendChild(nodeTable)

        if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
            document.querySelector('.save').disabled = true
            document.querySelector('[name="currency"]').disabled = true
            document.querySelector('[name="pax"]').disabled = true
            document.querySelector('[name="price"]').disabled = true

            _message = utils.createElement('p', '', '', response.message)
            _alertModal.innerHTML = ''
            _alertModal.appendChild(_message)

            MicroModal.show('alert-modal')
        } else if (response.code === 200) {
            document.querySelector('.save').disabled = false
            document.querySelector('[name="currency"]').disabled = false
            document.querySelector('[name="pax"]').disabled = false
            document.querySelector('[name="price"]').disabled = false

            form = document.querySelector('#add-price')

            if (form != null) {
              configTable = prices.getTableConfig(response.message)
              $(nodeTable).DataTable(configTable).draw()

              const serviceChk = document.querySelector('.serviceAll')
              if (serviceChk != null) {
                serviceChk.addEventListener('click', (e) => {
                  const cloneBtns = document.querySelectorAll('.services')

                  for(let i = 0, l = cloneBtns.length; i < l; i++) {
                    cloneBtns[i].checked ^= 1
                  }
                })
              }

              const courtesyChk = document.querySelector('.courtesyAll')
              if (courtesyChk != null) {
                courtesyChk.addEventListener('click', (e) => {
                  const cloneBtns = document.querySelectorAll('.courtesy')

                  for(let i = 0, l = cloneBtns.length; i < l; i++) {
                    cloneBtns[i].checked ^= 1
                  }
                })
              }

              const infantChk = document.querySelector('.infantAll')
              if (infantChk != null) {
                infantChk.addEventListener('click', (e) => {
                  const cloneBtns = document.querySelectorAll('.infant')

                  for(let i = 0, l = cloneBtns.length; i < l; i++) {
                    cloneBtns[i].checked ^= 1
                  }
                })
              }
            }

            form = document.querySelector('#update-price')

            if (form != null) {
              element.disabled = false

              response.message.forEach(service => {
               element.innerHTML += '<option value="' + service.service_id + '">' + service.service_reseller + ' / <span style="color:red;">' + service.service_name + '<span></option>'
              });
            }

            MicroModal.close('wait-modal')
        }
      } catch(e) {
        console.log(e)
        utils.displayModal(alertModal, '')
      }
    },
    getTableConfig: (registers) => {
      const config = {
        info:false,
        paging: false,
        responsive: true,
        searching: false,
        fixedHeader: true,
        initComplete: function() {
          const table = this.api();

          const wrapper = utils.createElement('div', 'form-check', '')

          const label = utils.createElement('label', 'form-check-label', '')
          label.setAttribute('for', 'courtesyAll')
          label.innerText = 'Courtesy'

          const checkClones = utils.createElement('input', 'courtesyAll form-check-input', 'courtesyAll')
          checkClones.setAttribute('type', 'checkbox')
          checkClones.setAttribute('name', 'courtesyAll')
          checkClones.setAttribute('checked', true)

          wrapper.append(checkClones)
          wrapper.append(label)

          table.column(4).header().innerHTML = wrapper.outerHTML

          wrapper.innerHTML = ''

          label.setAttribute('for', 'serviceAll')
          label.innerText = 'Service'

          const checkServices = utils.createElement('input', 'serviceAll form-check-input', 'serviceAll')
          checkServices.setAttribute('type', 'checkbox')
          checkServices.setAttribute('name', 'serviceAll')
          checkServices.setAttribute('checked', true)

          wrapper.append(checkServices)
          wrapper.append(label)

          table.column(0).header().innerHTML = wrapper.outerHTML

          wrapper.innerHTML = ''

          label.setAttribute('for', 'infantAll')
          label.innerText = 'Infant'

          const checkInfants = utils.createElement('input', 'infantAll form-check-input', 'infantAll')
          checkInfants.setAttribute('type', 'checkbox')
          checkInfants.setAttribute('name', 'infantAll')
          checkInfants.setAttribute('checked', true)

          wrapper.append(checkInfants)
          wrapper.append(label)

          table.column(3).header().innerHTML = wrapper.outerHTML
        }
      }

      // filter by status
      registers = registers.filter((row) => {
        return row.active_status == 1
      })

      const columns = [
        {
          data: 'service',
          title: 'Service',
          render: (data, type, row, meta) => {
            const service = utils.createElement('input', 'services', row.service_id, '')

            service.setAttribute('type', 'checkbox')
            if (data === undefined || data === 1) {
              service.setAttribute('checked', true)
            }

            return `${service.outerHTML} ${row.service_reseller} / ${row.service_name}`
          }
        },
        {
          data: 'service_id',
          title: 'Adult',
          orderable: false,
          render: (data, type, row, meta) => {
            const adult = utils.createElement('input', 'form-control-plaintext', `adult${data}`, '')

            adult.setAttribute('type', 'number')
            adult.setAttribute('step', 'any')
            adult.setAttribute('placeholder', '$ 100.00')

            return adult.outerHTML
          }
        },
        {
          data: 'service_id',
          title: 'Child',
          orderable: false,
          render: (data, type, row, meta) => {
            const child = utils.createElement('input', 'form-control-plaintext', `child${data}`, '')

            child.setAttribute('type', 'number')
            child.setAttribute('step', 'any')
            child.setAttribute('placeholder', '$ 90.00')

            return child.outerHTML
          }
        },
        {
          data: 'service_id',
          title: 'Infant',
          orderable: false,
          render: (data, type, row, meta) => {
            const infant = utils.createElement('input', 'infant', `infant${data}`, '')

            infant.setAttribute('type', 'checkbox')
            infant.setAttribute('checked', true)

            return infant.outerHTML
          }
        },
        {
          data: 'service_id',
          title: 'Courtesy',
          orderable: false,
          render: (data, type, row, meta) => {
            const courtesy = utils.createElement('input', 'courtesy', `courtesy${data}`, '')

            courtesy.setAttribute('type', 'checkbox')
            courtesy.setAttribute('checked', true)

            return courtesy.outerHTML
          }
        },
        {
          data: 'Message',
          title: 'Message',
          orderable: false,
          render: (data, type, row, meta) => {
            const message = utils.createElement('span', 'message', `msg${row.service_id}`, data)

            return message.outerHTML
          }
        }
      ]

      config.data = registers
      config.columns = columns

      return config
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

        resetSelectElement(shipElement)

        if (!isNaN(reseller.value)) {
            getListServicesByReseller(reseller.value)
            getListShipByReseller(reseller.value)
        }
    })
}

var channel = document.querySelector('[name="channel"]')
if (channel != null) {
    let reseller = document.querySelector('[name="reseller"]')

    channel.addEventListener('change', function(e) {
        e.preventDefault()
        document.querySelector('.select-ship').classList.add('d-none')
        reseller.options[0].selected = true

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
    let url = apiHost + `equivalences/reseller/${resellerId}`
    utils.api({}, url, 'GET', prices.setListEquivalences)
}

var save = document.querySelector('.save')
if (save != null) {
    save.addEventListener('click', function(e) {
        e.preventDefault()

        let valid = true
        let fields = document.querySelectorAll('[data-validator]')

        let elementPax = document.querySelector('[name="pax"]').value
        let elementShip = document.querySelector('[name="ship"]').value
        let elementPrice = document.querySelector('[name="price"]').value
        let elementService = document.querySelector('[name="service"]').value
        let elementCurrency = document.querySelector('[name="currency"]').value
        let elementReseller = document.querySelector('[name="reseller"]').value
        let elementEndPurchaseDate = document.querySelector('[name="end-purchase"]').value
        let elementStartPurchaseDate = document.querySelector('[name="start-purchase"]').value


        if (isNaN(elementShip))
            elementShip = 0

        valid = utils.dataValidator(fields)

        if (valid && prices.isValidPurchaseDate(elementStartPurchaseDate, elementEndPurchaseDate)) {
            form = document.querySelector('#add-price')

            if (form != null) {
                let list = []
                let registers = document.querySelectorAll('.services')

                for (let i = 0, l = registers.length; i < l; i++) {
                  let isAdded = 0
                  let price = {}

                  if (registers[i].checked) {
                    isAdded = 1
                  }

                  price.message = ''
                  price.isAdded = isAdded
                  price.ship_id = elementShip
                  price.user_id = userCreateId
                  price.service_id = registers[i].id
                  price.reseller_id = elementReseller
                  price.currency_id = elementCurrency
                  price.seasson_end = elementEndPurchaseDate
                  price.seasson_start = elementStartPurchaseDate
                  price.end_date_purchase = elementEndPurchaseDate
                  price.start_date_purchase = elementStartPurchaseDate

                  let adult = document.querySelector(`#adult${price.service_id}`)
                  let child = document.querySelector(`#child${price.service_id}`)
                  let infant = document.querySelector(`#infant${price.service_id}`)
                  let courtesy = document.querySelector(`#courtesy${price.service_id}`)

                  if (adult.value != '') {
                      list.push(Object.assign({}, price, {
                        pax_id: 1,
                        price: adult.value
                      }))
                  }

                  if (child.value != '') {
                      list.push(Object.assign({}, price, {
                        pax_id: 2,
                        price: child.value
                      }))
                  }

                  if (infant.checked) {
                      list.push(Object.assign({}, price, {
                        pax_id: 3,
                        price: 0
                      }))
                  }

                  if (courtesy.checked) {
                      list.push(Object.assign({}, price, {
                        pax_id: 4,
                        price: 0
                      }))
                  }
                }

                info = {
                  prices: list
                }

                let url = apiHost + 'prices/add'
                utils.api(JSON.stringify(info), url, 'POST', prices.add)
            }

            form = document.querySelector('#update-price')

            if (form != null) {
                info = {
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

                info.active_status = document.querySelector('[name="active"]').value

                let url = apiHost + `prices/edit/${pricesData.price_id}`
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
    const serviceContent = document.querySelector('[name="service"]').closest('.form-group')

    paxContent.classList.add('d-none')
    priceContent.classList.add('d-none')
    serviceContent.classList.add('d-none')

    if (document.querySelector('.date-range')) {
        flatpickr('.date-range', {
            altFormat: 'F j, Y',
            dateFormat: 'Y-m-d',
            altInput: true,
            minDate: '2020-01-01'
        })
    }

    $(function() {
    $('#price-registers').dataTable({
        info:false,
        paging: false,
        responsive: true,
        searching: false,
        fixedHeader: true,
      })
    })
}

form = document.querySelector('#update-price')
if (form != null) {
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

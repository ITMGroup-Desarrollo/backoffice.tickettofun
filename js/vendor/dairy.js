var diary= {
  sendmail: function(response){
     MicroModal.close('wait-modal')

    response = JSON.parse(response)

    var _alertModal = document.getElementById('alert-modal-content')

      _message = utils.createElement('p', '', '', response.message)
      _alertModal.innerHTML = ''
      _alertModal.appendChild(_message)


      MicroModal.show('alert-modal')
  }
}

var tourDetails = document.querySelector('.details-registers')
if (tourDetails !== null) {
  $(function () {
    $('.details-registers').dataTable({
      paging: false,
      searching: false,
      order: ( [ 1, 'asc' ] )
    })
  })
}

var btnsdefault = document.querySelector('.form-actions')
if (btnsdefault != null) {
  btnsdefault.className = "form-group form-actions hidden";
}

var send = document.querySelector('[name="send"]')
send.addEventListener('click', function(e) {
  e.preventDefault()

  utils.api(JSON.stringify({}), `${apiHost}general/sendmail`, 'GET', diary.sendmail)

});

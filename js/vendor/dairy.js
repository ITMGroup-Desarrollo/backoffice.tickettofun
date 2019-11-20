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

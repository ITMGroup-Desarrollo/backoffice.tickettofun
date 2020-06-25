var servicesTable = document.querySelector('#layout-registers')
if (servicesTable !== null) {
    $(function() {
        $('#layout-registers').dataTable(utils.getDataTableConfig())
    })
}

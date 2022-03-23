"use strict";
var url;
var info;
var layoutData = window.layoutData;
var userCreateId = window.user_create_id;

var layout = {
    loadLayout: function(response) {
        try {
            MicroModal.close("wait-modal");

            response = JSON.parse(response);
            if (Object.prototype.hasOwnProperty.call(codes, response.code)) {
                utils.displayModal(alertModal, response.message);
            } else if (response.code === 200) {
                let dynamicTableId = "dynamic-table";
                let dynamicTableErrorId = "dynamic-table-error";
                let layoutElement = document.querySelector('[name = "layout-element"]');

                layout.dropTable(dynamicTableId);
                layout.dropTable(dynamicTableErrorId);

                let content = document.querySelector(".content-wrapper");

                let node = document.createElement("table");
                let caption = node.createCaption();
                caption.innerHTML =
                    "<b> Layout: " +
                    layoutElement.options[layoutElement.selectedIndex].text +
                    "<b>";
                node.id = dynamicTableId;

                content.appendChild(node);

                $(function() {
                    $("#" + dynamicTableId).DataTable(
                        layout.getDataTableConfig(response.data)
                    );
                });

                if (response.data_errors.length > 0) {
                    let node = document.createElement("table");
                    node.id = dynamicTableErrorId;
                    content.appendChild(node);
                    $("#" + dynamicTableErrorId).DataTable(
                        layout.getDataTableConfig(response.data_errors)
                    );
                }

                document.querySelector("#upload-layout").reset();
            }
        } catch (e) {
            utils.displayModal(alertModal, "");
        }
    },
    getDataTableConfig: function(dataSource) {
        let dataTableConfig = {};
        let columnNames = Object.keys(dataSource[0]);
        let columns = [];

        for (var i in columnNames) {
            columns.push({ data: columnNames[i], title: columnNames[i] });
        }

        dataTableConfig = utils.getDataTableConfig();
        dataTableConfig.data = dataSource;
        dataTableConfig.columns = columns;
        dataTableConfig.retrieve = true;

        return dataTableConfig;
    },
    dropTable: function(tableId) {
        let dynamicTable = document.querySelector("#" + tableId);

        if (dynamicTable != null && $.fn.dataTable.isDataTable("#" + tableId)) {
            $("#" + tableId)
                .DataTable()
                .destroy();

            dynamicTable.parentNode.removeChild(dynamicTable);
        }
    },
};

var selectLayout = document.querySelector('[name = "layout-element"]');
if (selectLayout != null) {
    selectLayout.innerHTML = "<option>-- Choose option --</option>";
    layoutData.forEach((item) => {
        selectLayout.innerHTML +=
            '<option value="' + item.code + '">' + item.file_name + "</option>";
    });
}

var save = document.querySelector(".save");
if (save !== null) {
    save.textContent = "Upload";
    save.addEventListener("click", function(e) {
        e.preventDefault();

        url = `${base}/layouts/upload_file`;

        let valid = true;
        let fields = document.querySelectorAll("[data-validator]");

        valid = utils.dataValidator(fields);

        if (valid) {
            let form = new FormData();
            let codeLayout = document.querySelector('[name = "layout-element"]')
                .value;
            let inputFile = document.querySelector('[name="file-element"]');

            form.append("layout-element", codeLayout);
            form.append("newfile", inputFile.files[0]);

            utils.api(form, url, "POST", layout.loadLayout, null, 1);
        }
    });
}

var cancel = document.querySelector(".cancel");
if (cancel != null) {
    cancel.addEventListener("click", function(e) {
        e.preventDefault();

        let form = document.querySelector("#upload-layout");
        if (form != null) {
            form.reset();
        }
    });
}

var servicesTable = document.querySelector("#layout-registers");
if (servicesTable !== null) {
    $(function() {
        $("#layout-registers").DataTable(utils.getDataTableConfig());
    });
}

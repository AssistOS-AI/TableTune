import pluginUtils from "../../../../../../wallet/core/plugins/pluginUtils.js";
const spaceModule = require("assistos").loadModule("space", {});
const documentModule = require("assistos").loadModule("document", {});

export class TableTune {
    constructor(element, invalidate) {
        this.element = element;
        this.invalidate = invalidate;
        this.contextMenu = null;
        this.targetCell = null;

        const documentPage = document.querySelector("document-view-page");
        if (!documentPage) return;

        const documentPresenter = documentPage.webSkelPresenter;
        const context = pluginUtils.getContext(this.element);
        this.paragraphId = context.paragraphId;
        this.paragraphPresenter = documentPresenter.element
            .querySelector(`paragraph-item[data-paragraph-id="${this.paragraphId}"]`)
            .webSkelPresenter;
        this.commandsEditor = this.paragraphPresenter.commandsEditor;
        this.element.classList.add("maintain-focus");
        this.invalidate();
    }

    beforeRender() {}

    async afterRender() {
        const imageElement = this.element.querySelector(".paragraph-image");
        if (this.paragraphPresenter.paragraph.commands.image) {
            imageElement.classList.remove("hidden");
            imageElement.src = await spaceModule.getImageURL(
                this.paragraphPresenter.paragraph.commands.image.id
            );
        }

        const table = document.getElementById("dynamicTable");
        this.contextMenu = this.element.querySelector("#contextMenu");
        this.setupTableControls(table);
        this.setupContextMenu(table);
    }

    setupTableControls(table) {
        document.getElementById("addRow").addEventListener("click", () => this.addRow(table));
        document.getElementById("addCol").addEventListener("click", () => this.addColumn(table));
        document.getElementById("deleteRow").addEventListener("click", () => this.deleteLastRow(table));
        document.getElementById("deleteCol").addEventListener("click", () => this.deleteLastColumn(table));

        document.getElementById("bgColorSelect").addEventListener("change", (e) => {
            table.style.backgroundColor = e.target.value;
        });
        document.getElementById("downloadJson").addEventListener("click", () => this.downloadTableJson());

    }

    downloadTableJson() {
        const table = document.getElementById("dynamicTable");
        const tableData = {
            tableData: []
        };

        // Collect data from all rows
        Array.from(table.rows).forEach(row => {
            const rowData = [];
            Array.from(row.cells).forEach(cell => {
                rowData.push(cell.textContent.trim());
            });
            tableData.tableData.push(rowData);
        });

        // Create JSON blob
        const jsonString = JSON.stringify(tableData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });

        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `table-data-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    setupContextMenu(table) {
        table.addEventListener("contextmenu", (e) => {
            if (e.target.tagName === 'TD') {
                e.preventDefault();
                // console.log("Hello World");
                this.targetCell = e.target;
                this.showContextMenu(e.clientX, e.clientY);
            }
        });

        document.addEventListener("click", (e) => {
            if (!e.target.closest("#contextMenu")) {
                this.hideContextMenu();
            }
        });

        this.contextMenu.querySelectorAll(".menu-item").forEach(item => {
            item.addEventListener("click", (e) => {
                this.handleContextAction(e.target.dataset.action);
            });
        });
    }

    showContextMenu(x, y) {
        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;
        this.contextMenu.classList.remove("hidden");
    }

    hideContextMenu() {
        this.contextMenu.classList.add("hidden");
    }

    handleContextAction(action) {
        const rowIndex = this.targetCell.parentElement.rowIndex;
        const colIndex = this.targetCell.cellIndex;
        const table = document.getElementById("dynamicTable");

        switch(action) {
            case 'insertRowAbove': this.insertRow(table, rowIndex); break;
            case 'insertRowBelow': this.insertRow(table, rowIndex + 1); break;
            case 'deleteRow': this.deleteRow(table, rowIndex); break;
            case 'insertColLeft': this.insertColumn(table, colIndex); break;
            case 'insertColRight': this.insertColumn(table, colIndex + 1); break;
            case 'deleteCol': this.deleteColumn(table, colIndex); break;
        }
        this.hideContextMenu();
    }

    addRow(table) {
        const newRow = table.insertRow();
        Array.from(table.rows[0].cells).forEach(() => {
            const cell = newRow.insertCell();
            cell.contentEditable = true;
        });
    }

    addColumn(table) {
        Array.from(table.rows).forEach(row => {
            const cell = row.insertCell();
            cell.contentEditable = true;
        });
    }

    insertRow(table, index) {
        const newRow = table.insertRow(index);
        Array.from(table.rows[0].cells).forEach(() => {
            const cell = newRow.insertCell();
            cell.contentEditable = true;
        });
    }

    insertColumn(table, index) {
        Array.from(table.rows).forEach(row => {
            const cell = row.insertCell(index);
            cell.contentEditable = true;
        });
    }

    deleteLastRow(table) {
        if (table.rows.length > 1) table.deleteRow(-1);
    }

    deleteLastColumn(table) {
        if (table.rows[0].cells.length > 1) {
            Array.from(table.rows).forEach(row => row.deleteCell(-1));
        }
    }

    deleteRow(table, index) {
        if (table.rows.length > 1) table.deleteRow(index);
    }

    deleteColumn(table, index) {
        if (table.rows[0].cells.length > 1) {
            Array.from(table.rows).forEach(row => row.deleteCell(index));
        }
    }

    // applyCellDimensions(table) {
    //     const width = document.getElementById("cellWidthInput").value;
    //     const height = document.getElementById("cellHeightInput").value;
    //
    //     Array.from(table.rows).forEach(row => {
    //         Array.from(row.cells).forEach(cell => {
    //             if (width) cell.style.width = `${width}px`;
    //             if (height) cell.style.height = `${height}px`;
    //         });
    //     });
    // }

    async insertImage() {
        await this.commandsEditor.insertAttachmentCommand("image");
        this.invalidate();
    }

    async deleteImage() {
        await this.commandsEditor.deleteCommand("image");
        this.invalidate();
    }
}
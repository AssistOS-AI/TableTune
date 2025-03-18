import pluginUtils from "../../../../../../wallet/core/plugins/pluginUtils.js";
const spaceModule = require("assistos").loadModule("space", {});
const llmModule = require("assistos").loadModule("llm", {});
const documentModule = require("assistos").loadModule("document", {});

export class TableTune {
    constructor(element, invalidate) {
        this.element = element;
        this.invalidate = invalidate;

        let documentPage = document.querySelector("document-view-page");
        if(!documentPage){
            return showApplicationError("Application page not done yet","Use this as a plugin in paragraph");
        }
        let documentPresenter = documentPage.webSkelPresenter;
        let context = pluginUtils.getContext(this.element);
        this.paragraphId = context.paragraphId;
        this.paragraphPresenter = documentPresenter.element
            .querySelector(`paragraph-item[data-paragraph-id="${this.paragraphId}"]`)
            .webSkelPresenter;
        this.commandsEditor = this.paragraphPresenter.commandsEditor;
        this.element.classList.add("maintain-focus");
        this.invalidate();
    }

    beforeRender(){}

    async afterRender(){
        // Dacă ai un element imagine de paragraf, îl poți gestiona aici
        let imageElement = this.element.querySelector(".paragraph-image");
        if(this.paragraphPresenter.paragraph.commands.image){
            imageElement.classList.remove("hidden");
            imageElement.src = await spaceModule.getImageURL(
                this.paragraphPresenter.paragraph.commands.image.id
            );
        }

        const table = document.getElementById("dynamicTable");

        document.getElementById("addRow").addEventListener("click", () => {
            const newRow = table.insertRow();
            const cellCount = table.rows[0].cells.length;
            for(let i = 0; i < cellCount; i++){
                const newCell = newRow.insertCell();
                newCell.contentEditable = "true";
            }
        });

        document.getElementById("addCol").addEventListener("click", () => {
            for(let i = 0; i < table.rows.length; i++){
                const newCell = table.rows[i].insertCell();
                newCell.contentEditable = "true";
            }
        });

        document.getElementById("deleteRow").addEventListener("click", () => {
            if(table.rows.length > 1){
                table.deleteRow(-1);
            }
        });

        document.getElementById("deleteCol").addEventListener("click", () => {
            const cellCount = table.rows[0].cells.length;
            if(cellCount > 1){
                for(let i = 0; i < table.rows.length; i++){
                    table.rows[i].deleteCell(-1);
                }
            }
        });

        const bgColorSelect = document.getElementById("bgColorSelect");
        bgColorSelect.addEventListener("change", () => {
            const selectedColor = bgColorSelect.value;
            table.style.backgroundColor = selectedColor;
        });

        document.getElementById("applyDimensions").addEventListener("click", () => {
            const width = document.getElementById("cellWidthInput").value;
            const height = document.getElementById("cellHeightInput").value;
            for (let i = 0; i < table.rows.length; i++) {
                for (let j = 0; j < table.rows[i].cells.length; j++) {
                    if(width) {
                        table.rows[i].cells[j].style.width = width + "px";
                    }
                    if(height) {
                        table.rows[i].cells[j].style.height = height + "px";
                    }
                }
            }
        });
        document.addEventListener("DOMContentLoaded", () => {
            const table = document.getElementById("dynamicTable");
            const contextMenu = document.getElementById("contextMenu");

            table.addEventListener("contextmenu", (event) => {
                event.preventDefault();

                const cell = event.target.closest("td, th");
                if (!cell) return;

                const rowIndex = cell.parentNode.rowIndex;
                const colIndex = cell.cellIndex;

                contextMenu.dataset.rowIndex = rowIndex;
                contextMenu.dataset.colIndex = colIndex;

                contextMenu.style.display = "block";
                contextMenu.style.left = event.pageX + "px";
                contextMenu.style.top = event.pageY + "px";
            });

            document.getElementById("insertRowAbove").addEventListener("click", () => {
                const rowIndex = parseInt(contextMenu.dataset.rowIndex, 10);
                insertRowAt(rowIndex);
                hideContextMenu();
            });

            document.getElementById("insertRowBelow").addEventListener("click", () => {
                const rowIndex = parseInt(contextMenu.dataset.rowIndex, 10);
                insertRowAt(rowIndex + 1);
                hideContextMenu();
            });

            document.getElementById("deleteRow").addEventListener("click", () => {
                const rowIndex = parseInt(contextMenu.dataset.rowIndex, 10);
                deleteRow(rowIndex);
                hideContextMenu();
            });

            document.addEventListener("click", (event) => {
                if (!contextMenu.contains(event.target)) {
                    hideContextMenu();
                }
            });

            function hideContextMenu() {
                contextMenu.style.display = "none";
            }

            function insertRowAt(index) {
                const newRow = table.insertRow(index);
                const cellCount = table.rows[0].cells.length;
                for (let i = 0; i < cellCount; i++) {
                    const newCell = newRow.insertCell();
                    newCell.contentEditable = "true";
                    newCell.textContent = "New Cell";
                }
            }

            function deleteRow(index) {
                if (table.rows.length > 1) {
                    table.deleteRow(index);
                }
            }
        });

    }

    // attachResizers() { ... }

    async insertImage(){
        await this.commandsEditor.insertAttachmentCommand("image");
        this.invalidate();
    }

    async deleteImage(){
        await this.commandsEditor.deleteCommand("image");
        this.invalidate();
    }
}


const spaceModule = require("assistos").loadModule("space", {});
const llmModule = require('assistos').loadModule('llm',{})
const documentModule = require('assistos').loadModule('document',{})
import pluginUtils from "../../../../../../wallet/core/plugins/pluginUtils.js";

export class TableTune {
    constructor(element, invalidate) {
        this.element = element;
        this.invalidate = invalidate;
        let documentPage = document.querySelector("document-view-page");
        if(!documentPage){
            return showApplicationError("Application page not done yet", "Use this as a plugin in paragraph");
        }
        let documentPresenter = documentPage.webSkelPresenter;
        let context = pluginUtils.getContext(this.element);
        this.paragraphId = context.paragraphId;
        this.paragraphPresenter = documentPresenter.element.querySelector(`paragraph-item[data-paragraph-id="${this.paragraphId}"]`).webSkelPresenter;
        this.commandsEditor = this.paragraphPresenter.commandsEditor;
        this.element.classList.add("maintain-focus");
        this.invalidate();
    }
    beforeRender(){

    }
    async afterRender(){
        let imageElement = this.element.querySelector(".paragraph-image");

        if(this.paragraphPresenter.paragraph.commands.image){
            imageElement.classList.remove("hidden");
            imageElement.src = await spaceModule.getImageURL(this.paragraphPresenter.paragraph.commands.image.id);
        }
        const table = document.getElementById("dynamicTable");

        document.getElementById("addRow").addEventListener("click", () => {
            const newRow = table.insertRow();
            const cellCount = table.rows[0].cells.length;
            for (let i = 0; i < cellCount; i++) {
                const newCell = newRow.insertCell();
                newCell.contentEditable = "true";
            }
        });

        document.getElementById("addCol").addEventListener("click", () => {
            for (let i = 0; i < table.rows.length; i++) {
                const newCell = table.rows[i].insertCell();
                newCell.contentEditable = "true";
            }
        });

        document.getElementById("deleteRow").addEventListener("click", () => {
            if (table.rows.length > 1) {
                table.deleteRow(-1);
            }
        });

        document.getElementById("deleteCol").addEventListener("click", () => {
            const cellCount = table.rows[0].cells.length;
            if (cellCount > 1) {
                for (let i = 0; i < table.rows.length; i++) {
                    table.rows[i].deleteCell(-1);
                }
            }
        });

    }
    async insertImage(){
        await this.commandsEditor.insertAttachmentCommand("image");
        this.invalidate();
    }
    async deleteImage() {
        await this.commandsEditor.deleteCommand("image");
        this.invalidate();
    }

}

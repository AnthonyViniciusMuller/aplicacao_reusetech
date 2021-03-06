let loadJson = (method, url) => {
    return new Promise((resolve, reject) =>{
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.open(method, url);
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = () => reject(null);
        xhr.send();
    })
}
let getTableName = () => {
    const queryString = window.location.search;
    const urlSearch = new URLSearchParams(queryString);
    return urlSearch.get('table');
}
let ifExistsRemoveTagElement = (querySelector) => {
    if(document.querySelector(querySelector)) {
        document.querySelector(querySelector).remove();
    }
}

class DomElements {
    createH1WithInnerText = (innerText) => {
        let h = document.createElement('h1');
        h.innerText = this.removeUnderlinesFrom(innerText);

        return h;
    }
    createLabelWithColumnNameAndMySQLType = (columnName, columnType) => {
        let label = document.createElement('label');
        label.innerText = 'Coluna: ' + this.removeUnderlinesFrom(columnName) + ' || tipo: ' + this.removeUnderlinesFrom(columnType);

        return label;
    }
    createInputWithNameAndType = (inputName, inputType) => {
        let input = document.createElement('input');
        input.setAttribute('placeholder', this.removeUnderlinesFrom(inputName));
        input.setAttribute('name', inputName);
        input.setAttribute('type', inputType);

        return input;
    }
    createInputSubmit = () => {
        let input_submit = document.createElement('input');
        input_submit.setAttribute('type', 'submit');
        input_submit.setAttribute('value', 'Enviar');
        input_submit.setAttribute('name', 'Enviar');

        return input_submit;
    }
    createInputHiddenWithTableName = (tableName) => {
        let inputHidden = document.createElement('input');
        inputHidden.setAttribute('value', tableName);
        inputHidden.setAttribute('name', 'table');
        inputHidden.setAttribute('type', 'hidden');

        return inputHidden;
    }
    createButtonWithCallback = (callBack) => {
        let button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.addEventListener("click", callBack);
        button.innerText = 'Adicionar barramento';
        return button;
    }

    createDivWithSelectId = (selectId) => {
        let busDiv = document.createElement('div');
        busDiv.setAttribute('id', selectId);

        return busDiv;
    }

    createSelectAboutRows = (tableRows) => {
        let select = document.createElement('select');
        select.setAttribute('name', 'busesIds[]');
        select.setAttribute('id', document.getElementsByTagName('select').length);
        select.appendChild(document.createElement('option'));

        //TODO melhorar isso aqui
        for(let i = 0; i < tableRows.length; i++){
            let optionName = Object.keys(tableRows[1])[1];
            optionName = tableRows[i][optionName];
            let busId = tableRows[i]['id'];

            select.appendChild(
                this.createOptionWithInnerTextAndValue(optionName, busId)
            );
        }

        select.getCorrectBusToSelectValue = () => {
            for(let i = 0; i < tableRows.length; i++) {
                if(tableRows[i]['id'] == select.value){
                    return tableRows[i];
                }
            }
        }
        
        return select;
    }

    createOptionWithInnerTextAndValue = (innerText, value) => {
        let option = document.createElement('option');
        option.setAttribute('value', value);
        option.innerText = innerText;

        return option;
    }

    removeUnderlinesFrom = (innerText) => {
        let newText = innerText.replace(/_/g, " ");

        return newText;
    }
}

class TableForm {
    constructor() {
        this.dom = new DomElements();
    }

    generateFormAbout = (tableColumns) => { 
        this.getForm().appendChild(this.dom.createInputHiddenWithTableName(getTableName())); //necessário para mandar informações para o back-end

        for(let columnName in tableColumns){
            if(columnName !== "id__pc" && columnName !== 'id') {
                this.getForm().appendChild(
                    this.dom.createLabelWithColumnNameAndMySQLType(columnName, tableColumns[columnName])
                );
                this.getForm().appendChild(
                    this.dom.createInputWithNameAndType(columnName, this.getInputTypeFrom(tableColumns[columnName]))
                );
            }
        }
        this.autoRecreateInputSubmit();
    }
    createUnchangableFormAbout = (tableColumns, select) => {
        let busDiv = this.dom.createDivWithSelectId(select.id);

        let h1Bus = busDiv.appendChild(document.createElement('h1'));  
        h1Bus.innerText = "Barramento " + getTableName();

        for(let columnName in tableColumns){
            busDiv.appendChild(
                this.dom.createLabelWithColumnNameAndMySQLType(columnName, tableColumns[columnName])
            );
            let input = busDiv.appendChild( 
                this.dom.createInputWithNameAndType(columnName, this.getInputTypeFrom(tableColumns[columnName]))
            );
            input.value = select.getCorrectBusToSelectValue()[columnName];
            input.readOnly = true;
        }

        return busDiv;
        
    }

    createTitleWith = (innerText) => {
        let body = document.querySelector('form');
        let h1 = this.dom.createH1WithInnerText(innerText);
        h1.setAttribute('id', 'title');
        body.insertBefore(h1, body.childNodes[2]);
    }

    getInputTypeFrom = (file_tipo) => {
        let inputType = null;
        if (file_tipo.includes("int") || file_tipo == "int" || file_tipo == "float" || file_tipo == "decimal" || file_tipo == "real"){
            inputType = "number";
        }
        else if(file_tipo.includes("char") || file_tipo == "char" || file_tipo == "binary" || file_tipo == "text" || file_tipo == "blob" || file_tipo == "enum" || file_tipo == "set"){
            inputType = "text";
        }
        else if(file_tipo.includes("time") || file_tipo == "date"){
            inputType = "date";
        }
        return inputType;
    }

    autoRecreateInputSubmit = () => {
        if(document.querySelector("input[name='Enviar']")){
            document.querySelector("input[name='Enviar']").remove();
        }
        this.getForm().appendChild(this.dom.createInputSubmit());
    }
    
    getForm() {
        return document.querySelector('form');
    }
}

let tableForm = new TableForm();
let domElementsBus = new DomElements();
let tableFormBus = new TableForm();

loadJson('POST', '../api/cache/tabelas/' + getTableName() + '.json').then((namesAndTypesOfColumns) => {
    tableForm.createTitleWith(getTableName());
    tableForm.generateFormAbout(namesAndTypesOfColumns);
})
.then(
    loadJson('POST', '../api/cache/tabelas/' + "barramento_" + getTableName() + '.json')
    .then((namesAndTypesOfColumns) => {
        loadJson('POST', '../api/select_table_rows.php?table=barramento_' + getTableName())
        .then((busesRows) => {
            console.log(busesRows);
            if(namesAndTypesOfColumns !== null) {
                let form = tableForm.getForm();

                form.appendChild(domElementsBus.createButtonWithCallback(() => {

                        let select = form.appendChild(
                            domElementsBus.createSelectAboutRows(busesRows)
                        );
                        let removeSelectButton = form.appendChild(domElementsBus.createButtonWithCallback(() => {
                            ifExistsRemoveTagElement(`div[id='${select.id}']`);
                            select.remove();
                            removeSelectButton.remove();
                        })
                        );
                        removeSelectButton.innerText = "Remover Select";

                        select.onchange = () => {
                            ifExistsRemoveTagElement(`div[id='${select.id}']`);

                            let selectDiv = tableFormBus.createUnchangableFormAbout(namesAndTypesOfColumns, select);
                            form.insertBefore(selectDiv, removeSelectButton.nextSibling)
                        }
                        tableFormBus.autoRecreateInputSubmit();
                    })
                );
                        
                tableFormBus.autoRecreateInputSubmit();
            }
        })
    })
)

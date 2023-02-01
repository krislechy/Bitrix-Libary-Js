/**
 * Ylv libary last update on 27.01.2023
 */
/**
 * BX.UI.Dialogs.MessageBox.alert
 * BX.CrmEntityType.dynamicTypeNamePrefix
 */
BX.namespace('Ylv');
if (typeof Ylv === "undefined") {
    Ylv = function () { }
    Ylv._getFrames = function* () {
        // let frames = window.parent.BX.GetContext();
        let frames = window.parent.parent.document.getElementsByTagName('iframe');
        for (var i = 0; i < frames.length; i++) {
            yield frames[i].contentWindow;
        }
    }
    Ylv._frameValues = function* () {
        let iterator = Ylv._getFrames();
        while (true) {
            var frame = iterator.next();
            if (frame.done) break;
            yield frame.value;
        }
    }
    Ylv._addressParams = function () {
        return window.location.pathname.split('/').filter(x => x !== '');
    }
    Ylv.getInfoCurrentEntity = function () {
        let params = Ylv._addressParams();
        if (params[1] === 'type')
            return {
                entityTypeId: params[2],
                entityId: params[4],
            }
        else {
            return {
                entityTypeId: params[1]?.toUpperCase(),
                entityId: params[3],
            }
        }
    }
    Ylv._getPageInfo = function () {
        let params = Ylv._addressParams();
        let entityTypeId = parseInt(params[2]);
        let entityId = parseInt(params[4]);
        return {
            moduleId: params[0],
            entityTypeName: params[1],
            entityTypeId: (isNaN(entityTypeId) || entityTypeId == null) ? -1 : entityTypeId,
            entityId: (isNaN(entityId) || entityId == null) ? -1 : entityId,
        }
    }
    Ylv.getCurrentUserId = function () {
        return BX.CallEngine.userId;
    }
    Ylv.capitalizeFieldName = function (fieldName) {
        if (fieldName.indexOf("_") === -1)
            return fieldName;
        var splitted = fieldName.split('_');
        var text = "";
        splitted.forEach((character, index) => {
            if (index === 0) {
                text += character.toLowerCase();
            } else {
                var lower = character.toLowerCase();
                text += lower.charAt(0).toUpperCase() + lower.slice(1);
            }
        });
        return text;
    }
    Ylv.unCapitalizeFieldName = function (fieldName) {
        if (fieldName.indexOf("_") !== -1)
            return fieldName;
        var splitted = fieldName.split('');
        var text = "";
        splitted.forEach((character, index) => {
            if (character == character.toUpperCase()) {
                text += "_" + character.toUpperCase();
            } else {
                var upper = character.toUpperCase();
                text += upper;
            }
        });
        return text;
    }
}
BX.namespace('Ylv.EntityManager');
if (typeof Ylv.EntityManager === "undefined") {
    Ylv.EntityManager = function () { }
    Ylv.EntityManager.prototype = {
        getInstances: function () {
            var instances = [];
            if (BX != undefined
                && BX.Crm != undefined
                && BX.Crm.EntityEditor != undefined
                && BX.Crm.EntityEditor.defaultInstance != undefined
            ) {
                instances.push({
                    entityId: BX.Crm.EntityEditor.defaultInstance._entityId,
                    entityTypeId: BX.Crm.EntityEditor.defaultInstance._entityTypeId,
                    entityTypeName: BX.Crm.EntityEditor.defaultInstance._entityTypeName,
                    moduleId: BX.Crm.EntityEditor.defaultInstance.moduleId,
                    contextId: BX.Crm.EntityEditor.defaultInstance._contextId,
                    instance: BX.Crm.EntityEditor.defaultInstance,
                });
            };
            Array.from(Ylv._frameValues()).forEach(content => {
                if (content.BX != undefined
                    && content.BX.Crm != undefined
                    && content.BX.Crm.EntityEditor != undefined
                    && content.BX.Crm.EntityEditor.defaultInstance != undefined
                    && content.BX.Crm.EntityEditor.items != undefined
                ) {
                    var instanceItems = content.BX.Crm.EntityEditor.items;
                    var keys = Object.keys(instanceItems);
                    for (var i = 0; i < keys.length; i++) {
                        var instance = instanceItems[keys[i]];
                        if (instances.findIndex(x => x === instance) === -1)
                            instances.push({
                                entityId: instance.getEntityId(),
                                entityTypeId: instance.getEntityTypeId(),
                                entityTypeName: instance.getEntityTypeName(),
                                moduleId: instance.moduleId,
                                contextId: instance.getContextId(),
                                instance: instance,
                            });
                    }
                }
            });
            return instances;
        },
        /**
        * 
        * @param {string} entityTypeName - example 'DYNAMIC_142' or 'LEAD_7'
        */
        getInstanceByEntityTypeName: function (entityTypeName) {
            if (entityTypeName == null || entityTypeName === '') throw new Error('entityTypeName is not defined or null');
            return this.getInstances().filter(x => x.instance.getEntityTypeName() === entityTypeName
                || x.instance.getContextId() === entityTypeName)[0]?.instance ?? null;
        },
        getInstanceByEntityTypeNameAsync: async function (entityTypeName, ms = 50) {
            const sleep = ms => new Promise(r => setTimeout(r, ms));
            var instance = this.getInstanceByEntityTypeName(entityTypeName);
            while (instance == null) {
                await sleep(ms);
                instance = this.getInstanceByEntityTypeName(entityTypeName);
            }
            return instance;
        }
    }
    Ylv.EntityManager = Ylv._getPageInfo().moduleId === "crm" ? new Ylv.EntityManager() : undefined;
}
/**
 * BX Events:
 * BX.onCustomEvent = function(obj, handler){
   console.log(obj);
   console.log(handler);
    }
 * Grid::ready
 * Grid::updated
 * BX.UI.ActionPanel:created
 * BX.Crm.EntityEditor:onControlChange (editor,obj)
 * BX.Crm.EntityEditor:onControlModeChange
 * BX.Crm.EntityEditor:onConfigScopeChange
 * BX.Crm.EntityEditor:onRefreshLayout
 * BX.Crm.EntityEditor:onRefreshViewModeLayout
 * BX.Crm.EntityEditor:onSwitchToViewMode
 * BX.Crm.EntityEditor:onSave
 * BX.UI.EntityEditorField:onLayout
 * BX.UI.EntityConfigurationManager:onInitialize
 * Bitrix24.Slider:onClose || BX.Bitrix24.PageSlider:onClose
 * BX.UI.Selector:onSelectItem
 * BX.UI.Selector:onChange
 * BX.UI.EntitySelector.TagSelector:onAfterTagAdd ??
 * 
 * BX.UI.EntityEditorMode.edit
 * 
 * BX.onCustomEvent(window, "test:123", [ this, {testObj:1} ]);
 * BX.addCustomEvent("test:123", (e,t)=>{console.log(e,t)});
 */
BX.namespace('Ylv.FieldManager');
if (typeof Ylv.FieldManager === "undefined") {
    /**
     * 
     * @param {BX.Crm.EntityEditor} instance 
     * @param {boolean} options:showAlert - show alert if a control is not on the form
     *
     */
    Ylv.FieldManager = function (instance, options = {
        showAlert: false//show alert if the control is not on the form
    }) {
        this.instance = instance;
        this.options = options;
        if (instance == null) throw new Error('instance is null or undefined');
        if (instance.eventsNamespace !== 'BX.Crm.EntityEditor') throw new Error('Wrong instance type');
    }
    Ylv.FieldManager.prototype = {
        GetControlById: function (controlId, isIgnoreError = false) {
            var control = this.instance.getControlById(controlId);
            if (control != null)
                return control;
            else {
                if (!isIgnoreError) {
                    if (this.options.showAlert)
                        BX.UI.Dialogs.MessageBox.alert(`${controlId} элемент не находится на форме`);
                    console.error(`${controlId} is not defined or not on the form, use method 'SetVisibility' before`);
                }
            }
            return null;
        },
        GetValue: function (controlId) {
            var control = this.GetControlById(controlId);
            if (control != null) {
                return control.getValue().VALUE;
            }
            return undefined;
        },
        /**
         * 
         * @param {string} controlId
         * @param {function} handler
         *
         */
        _controlValueHandler: function (controlId, handler) {
            var control = this.GetControlById(controlId);
            if (control != null) {
                if (!control.isInSingleEditMode())//BX.UI.EntityEditorMode.edit
                    control.switchToSingleEditMode();
                var interval = setInterval(async () => {
                    if (control.isActive()) {
                        clearInterval(interval);
                        await handler(control);
                        control.markAsChanged();
                    }
                    else {
                        console.warn(`${control._id} - control not ready yet`);
                    }
                }, 50);
            }
        },
        SetInputValue: function (controlId, value) {
            this._controlValueHandler(controlId, async function (control) {
                var content = control.getContentWrapper();
                var element = content.querySelector(`[name="${control.getId()}"]`);
                if (element == null) {
                    const sleep = ms => new Promise(r => setTimeout(r, ms));
                    while (element == null) {
                        await sleep(50);
                        element = content.querySelector(`[name="${control.getId()}"]`);
                    }
                }
                element.value = value;
            });
        },
        SetMoneyValue: function (controlId, value, currency = "RUB") {
            this._controlValueHandler(controlId, async function (control) {
                var content = control.getContentWrapper();
                var elements = content.querySelectorAll('input');
                if (elements == null || elements.length === 0) {
                    const sleep = ms => new Promise(r => setTimeout(r, ms));
                    while (elements == null || elements.length === 0) {
                        await sleep(50);
                        elements = content.querySelectorAll('input');
                    }
                }
                elements[0].value = value + "|" + currency;
                elements[1].value = value;
            });
        },
        SetSingleComboBoxValue: function (controlId, value) {
            this._controlValueHandler(controlId, async function (control) {
                var content = control.getContentWrapper();
                var element = content.querySelector('select');
                if (element == null) {
                    const sleep = ms => new Promise(r => setTimeout(r, ms));
                    while (element == null) {
                        await sleep(50);
                        element = content.querySelectorAll('select');
                    }
                }
                element.options = value;
                for (var i = 0; i < element.options.length; i++) {
                    if (element.options[i].value === value) {
                        element.options[i].selected = true;
                        break;
                    }
                }
            });
        },
        SetSimpleAddressValue: function (controlId, value) {
            this._controlValueHandler(controlId, async function (control) {
                var content = control.getWrapper();
                var element = content.querySelector(`[name="${control.getId()}"]`);
                if (element == null) {
                    const sleep = ms => new Promise(r => setTimeout(r, ms));
                    while (element == null) {
                        await sleep(50);
                        element = content.querySelector(`[name="${control.getId()}"]`);
                    }
                }
                element.value = value;
                content.querySelector('input').value = value;
            });
        },
        /**
         * 
         * @param {string} controlId 
         * @param {boolean} state 
         */
        SetRequiredState: function (controlId, state) {
            var control = this.GetControlById(controlId);
            if (control != null && control.isRequired() !== state) {
                if (control._id.startsWith('UF_')) {
                    control._schemeElement._isRequired = state;
                    control.markSchemeAsChanged();
                    control.saveScheme();
                    this._initCustomValidator(controlId, state);
                }
                else {
                    control._schemeElement._isRequired = state;
                    control.markSchemeAsChanged();
                    control.saveScheme();
                }
                if (!control.isInSingleEditMode() && !control.hasValue())
                    control.switchToSingleEditMode();
                control.refreshTitleLayout();
                control.clearError();
            }
        },
        _validator: function (context) {
            var isPassed = true;
            var isAlreadyFocused = false;
            var errors = { "CHECK_ERRORS": {}, "ERROR": "" };
            for (var i = 0; i < context._listFieldsValidator.length; i++) {
                var control = context.GetControlById(context._listFieldsValidator[i]);
                if (control != null) {
                    var childs = control.getContentWrapper().getElementsByClassName("field-item");
                    for (var j = 0; j < childs.length; j++) {
                        var child = childs[j]?.firstElementChild;
                        if (child != null) {
                            var value = child.value;
                            if (value === "" || value == null) {
                                control.showRequiredFieldError();
                                if (!isAlreadyFocused) {
                                    isAlreadyFocused = true;
                                    control.focus();
                                }
                                isPassed = false;
                            }
                        }
                    }
                }
            }
            if (!isPassed) {
                errors['CHECK_ERRORS']["requiredFieldIsEmpty"] = "Заполните все обязательные поля";
                errors['ERROR'] = "Заполните все обязательные поля";
                context.instance.onSaveSuccess(errors, undefined);
            }
            return isPassed;
        },
        _isInitValidator: false,
        _listFieldsValidator: [],
        _initCustomValidator: function (controlId, state) {
            var index = this._listFieldsValidator.indexOf(controlId);
            if (index === -1) {
                if (state)
                    this._listFieldsValidator.push(controlId);
            } else
                if (!state)
                    this._listFieldsValidator.splice(index, 1);
            if (!this._isInitValidator) {
                this._isInitValidator = true;
                var performSaveAction = this.instance.performSaveAction;
                var self = this;
                this.instance.performSaveAction = function (action) {
                    var result = self._validator.call(this, self);
                    if (result)
                        performSaveAction.call(this, action);
                };
            }
        },
        /**
         * 
         * @param {string} controlId instance.getAvailableSchemeElements()
         * @param {boolean} state true|false
         * @param {string} typeField instance.getControlById([controlId]).getSchemeElement().getType()
         * @param {string} sectionId instance._config._items._sections
         * 
         */
        SetVisibility: function (controlId, state, typeField = "userField", sectionId = 'main') {
            var control = this.GetControlById(controlId, true);
            if (control != null) {
                if (control.isVisible() !== state) {
                    control.setVisible(state);
                    var scheme = control.getSchemeElement();
                    if (!scheme._isShownAlways) {
                        scheme._isShownAlways = state;
                        control.saveScheme();
                    }
                    control.refreshLayout();
                }
            }
            else {
                var scheme = this.instance.getAvailableSchemeElementByName(controlId);
                if (scheme == null) throw new Error(`Control with name '${controlId}' not exist on current entity`);
                var section = this.instance.getControlById(sectionId);
                if (section == null) throw new Error(`Section with name '${sectionId}' not exist on current entity`);
                var newControl = this.instance.createControl(typeField, controlId, {
                    mode: this.instance.getMode(),
                    model: this.instance.getModel(),
                    parent: section,
                    schemeElement: scheme,
                });
                section.addChild(newControl, { layout: { forceDisplay: true } });
            }
        },
        WaitActiveControlAsync: async function (controlId, ms = 50) {
            var control = this.GetControlById(controlId, true);
            if (control != null) {
                const sleep = ms => new Promise(r => setTimeout(r, ms));
                while (!control.isActive())
                    await sleep(ms);
            }
        },
        WaitLoadControlAsync: async function (controlId, ms = 10) {
            var control = this.GetControlById(controlId, true);
            if (control != null) {
                if (control._isLoaded == null) return;
                const sleep = ms => new Promise(r => setTimeout(r, ms));
                if (!control._isLoaded) {
                    while (!control._isLoaded)
                        await sleep(ms);
                }
            }
        },
        /**
         * Блокирование поля
         * @param {string} controlId 
         * @param {boolean} state состояние
         */
        SetBlockState: function (controlId, state) {
            var control = this.GetControlById(controlId, true);
            if (control != null) {
                control._innerWrapper.style.pointerEvents = state ? "none" : "auto";
                control.getSchemeElement()._isEditable = !state;
                if (state) {
                    if (!control._titleWrapper.classList.contains('ylv-block-title')) {
                        var blockImg = document.createElement('div');
                        blockImg.className = "ylv-block-control";
                        control._titleWrapper.appendChild(blockImg);
                        control._titleWrapper.classList.add('ylv-block-title');
                    }
                }
                else {
                    control.refreshTitleLayout();
                }
                control.saveScheme();
            }
        },
    }
}
/**
 * BX.Grid.SettingsWindow:init
 * Grid::columnMoved
 * Grid::ready
 * Grid::updated
 */
BX.namespace('Ylv.GridManager');
if (typeof Ylv.GridManager === "undefined") {
    Ylv.GridManager = function (instance) {
        if (instance == null) throw new Error('instance is null or undefined');
        // if (!instance instanceof BX.Main.grid) throw new Error('Wrong instance type');
        if (instance.getTable()?.id == null) throw new Error('Wrong instance type');
        this.instance = instance;
    }
    Ylv.GridManager.getAvailableInstances = function () {
        var instances = [];
        if (BX != undefined
            && BX.Main != undefined
            && BX.Main.gridManager != undefined
            && BX.Main.gridManager.data != undefined
        ) {
            instances.push({
                id: BX.Main.gridManager.data[0].id,
                instance: BX.Main.gridManager.data[0].instance,
            });
        };
        Array.from(Ylv._frameValues()).forEach(content => {
            if (content.BX != undefined
                && content.BX.Main != undefined
                && content.BX.Main.gridManager != undefined
                && content.BX.Main.gridManager.data != undefined
            ) {
                var _instances = content.BX.Main.gridManager.data;
                _instances.forEach(x => {
                    if (instances.findIndex((e) => e.instance == x.instance) == -1)
                        instances.push({
                            id: x.id,
                            instance: x.instance,
                        });
                });
            }
        });
        return instances;
    }
    // window.dispatchEvent(this.onLoaded);
    // onLoaded: new Event("hello", { bubbles: true }),

    Ylv.GridManager.prototype = {
        isStickedColumn: false,
        StickyColumnById: function (fieldId) {
            if (this.isStickedColumn) throw new Error('Sticking is available once to one column in one table');
            var loader = this.instance.getLoader();
            loader.show();
            var columnId = this._getColumnIndexById(fieldId);
            if (columnId === -1) throw new Error('Not found column with id \"' + fieldId + "\"");
            var columns = this.instance.getColumnByIndex(columnId);
            columns.forEach((column) => {
                if (column.classList.contains('main-grid-cell-head'))
                    column.style.background = "#dfdef1";
                column.classList.add('sticky-column-custom');
            });
            var self = this;
            BX.addCustomEvent('Grid::columnMoved', function (grid) {
                self._setPresetStyleColumn(self, grid, fieldId);
            });
            self._setPresetStyleColumn(this, this.instance, fieldId);
            var table = this.instance.getTable();
            table.style.overflow = "auto";
            loader.hide();
            this.isStickedColumn = true;
        },
        _setPresetStyleColumn: function (self, grid, fieldId) {
            var _columnId = self._getColumnIndexById(fieldId);
            function setStyle(styles) {
                var columns = grid.getColumnByIndex(_columnId);
                columns.forEach((column) => {
                    styles.forEach(x =>
                        column.style[x.name] = x.value
                    );
                });
            }
            if (_columnId === 2) {
                setStyle([
                    { name: "paddingLeft", value: "14px" },
                ]);
            } else {
                setStyle([
                    { name: "paddingLeft", value: "0px" },
                ]);
            }
        },
        _getColumnIndexById: function (fieldId) {
            var th = this.instance.getHeaders()[0].querySelectorAll('th');
            for (var i = 0; i < th.length; i++) {
                if (th[i].getAttribute('data-name') === fieldId) {
                    return i;
                }
            }
            return -1;
        }
    }
}
/**
 * BX.data(document.querySelector('th[data-name="DEAL_SUMMARY"]'),'edit')
 * BX.data(document.querySelector('th[data-name="DEAL_SUMMARY"]'),'edit',{'gfgf':"6756"})
 */
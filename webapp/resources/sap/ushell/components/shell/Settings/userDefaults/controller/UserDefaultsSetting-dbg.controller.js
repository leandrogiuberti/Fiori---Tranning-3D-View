// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/base/i18n/Localization",
    "sap/base/util/deepExtend",
    "sap/base/util/deepEqual",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/library",
    "sap/ui/core/mvc/Controller",
    "sap/ui/comp/smartfield/SmartField",
    "sap/ui/comp/smartfield/SmartLabel",
    "sap/ui/comp/smartform/Group",
    "sap/ui/comp/smartform/GroupElement",
    "sap/ui/comp/smartvariants/PersonalizableInfo",
    "sap/ui/core/Title",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ushell/resources",
    "sap/m/MessageBox",
    "./ExtendedValueDialog.controller",
    "sap/ushell/Container"
], (
    Log,
    Localization,
    fnDeepExtend,
    fnDeepEqual,
    Button,
    Input,
    mobileLibrary,
    Controller,
    SmartField,
    SmartLabel,
    Group,
    GroupElement,
    PersonalizableInfo,
    Title,
    JSONModel,
    ODataModel,
    ushellResources,
    MessageBox,
    ExtendedValueDialog,
    Container
) => {
    "use strict";

    // shortcut for sap.m.ButtonType
    const ButtonType = mobileLibrary.ButtonType;

    // compare parameters by groupId
    function compareByGroupId (oDefault1, oDefault2) {
        // handle default without metadata
        if (!(oDefault2.editorMetadata && oDefault2.editorMetadata.groupId)) {
            return -1; // keep order
        }
        if (!(oDefault1.editorMetadata && oDefault1.editorMetadata.groupId)) {
            return 1; // move oDefault1 to the end
        }

        if (oDefault1.editorMetadata.groupId < oDefault2.editorMetadata.groupId) {
            return -1;
        }
        if (oDefault1.editorMetadata.groupId > oDefault2.editorMetadata.groupId) {
            return 1;
        }

        return 0;
    }

    // compare parameters by parameterIndex
    function compareByParameterIndex (oDefault1, oDefault2) {
        // handle default without metadata
        if (!(oDefault2.editorMetadata && oDefault2.editorMetadata.parameterIndex)) {
            return -1; // keep order
        }
        if (!(oDefault1.editorMetadata && oDefault1.editorMetadata.parameterIndex)) {
            return 1; // move oDefault1 to the end
        }
        return oDefault1.editorMetadata.parameterIndex - oDefault2.editorMetadata.parameterIndex;
    }

    // compare parameters by groupId and then by parameterIndex
    function compareParameters (oDefault1, oDefault2) {
        // first by groupId
        const iComparisonResult = compareByGroupId(oDefault1, oDefault2);
        if (iComparisonResult === 0) {
            // then by parameterIdx
            return compareByParameterIndex(oDefault1, oDefault2);
        }
        return iComparisonResult;
    }

    return Controller.extend("sap.ushell.components.shell.Settings.userDefaults.controller.UserDefaultsSetting", {
        onInit: function () {
            this.oModelRecords = {}; // a map of oData models
            this.aChangedParamsNames = []; // An array of all parameters changed by the control
            this.oBlockedParameters = {}; // parameters of odata models which are not yet filled with "our" value
            this.aDisplayedUserDefaults = []; // array of displayed parameters, in order
            this.oDirtyStateModel = new JSONModel({
                isDirty: false,
                selectedVariant: null
            });
            this.getView().setModel(this.oDirtyStateModel, "DirtyState");

            this.oOriginalParameters = {}; // the original parameters which was loaded from service

            const oView = this.getView();
            oView.setBusy(true);
            oView.setModel(ushellResources.i18nModel, "i18n");

            this.getSystemContextsModel().then((oSystemContextModel) => {
                oView.setModel(oSystemContextModel, "systemContexts");
                return this._fillGroups();
            })
                .then(this._saveIsSupportedPlatform.bind(this))
                .then(this._initializeSmartVariantManagement.bind(this))
                .then(() => {
                    oView.setBusy(false);
                })
                .catch((oError) => {
                    Log.error(
                        "Error during UserDefaultsSetting controller initialization",
                        oError,
                        "sap.ushell.components.shell.Settings.userDefaults.UserDefaultsSetting"
                    );
                    oView.setBusy(false);
                });
        },

        /**
         * Initializes the systemContexts model
         * The systemContexts and the selectedKey will be written into the model
         *
         * @returns {Promise<sap.ui.model.json.JSONModel>} A Promise which resolves systemContexts model
         *
         * @private
         */
        getSystemContextsModel: function () {
            const oSystemContextModel = new JSONModel({ systemContexts: [], selectedKey: "" });

            const oGetContentProviderIdsPromise = this._getContentProviderIds();
            const oClientSideTargetResolutionPromise = Container.getServiceAsync("ClientSideTargetResolution");
            const oUserDefaultParametersServicePromise = Container.getServiceAsync("UserDefaultParameters");

            return Promise.all([
                oGetContentProviderIdsPromise,
                oClientSideTargetResolutionPromise,
                oUserDefaultParametersServicePromise
            ])
                .then((aResults) => {
                    const aContentProviderIds = aResults[0];
                    const oCSTRService = aResults[1];
                    const oUserDefaultParametersService = aResults[2];

                    // If there are no content providers we use the local systemContext
                    if (aContentProviderIds.length === 0) {
                        aContentProviderIds.push("");
                    }

                    return Promise.all(aContentProviderIds.map((sContentProvider) => {
                        return oCSTRService.getSystemContext(sContentProvider).then((oSystemContext) => {
                            const aSystemContexts = oSystemContextModel.getProperty("/systemContexts");
                            return oUserDefaultParametersService.hasRelevantMaintainableParameters(oSystemContext).then((bRelevant) => {
                                if (bRelevant) {
                                    aSystemContexts.push(oSystemContext);
                                }
                            });
                        });
                    })).then(() => {
                        const aSystemContexts = oSystemContextModel.getProperty("/systemContexts");
                        if (aSystemContexts.length > 0) {
                            oSystemContextModel.setProperty("/selectedKey", aSystemContexts[0].id);
                        }
                        return oSystemContextModel;
                    });
                });
        },

        /**
         * Gets all contentProvider ids.
         * If spaces mode is active the content Providers will be received from the CDM service,
         * else only the default contentProvider id will be returned
         *
         * @returns {Promise<string[]>} A promise which resolves to a list of content provider ids
         *
         * @private
         *
         * @since 1.80.0
         */
        _getContentProviderIds: function () {
            return Container.getServiceAsync("CommonDataModel")
                .then((oCdmService) => {
                    return oCdmService.getContentProviderIds();
                })
                .catch(() => {
                    return [""];
                });
        },

        /**
         * Checks if the view is dirty and creates a messageBox to ask the user if they want to discard the changes.
         * Calls _fillGroups if the user wants to discard the changes or the view is not dirty
         *
         * @private
         *
         * @since 1.81.0
         */
        handleSystemContextChanged: function () {
            if (this.oDirtyStateModel.getProperty("/isDirty")) {
                const sUserDefaultSaveText = ushellResources.i18n.getText("userDefaultsSave");
                const sUserDefaultDiscardText = ushellResources.i18n.getText("userDefaultsDiscard");
                MessageBox.show(ushellResources.i18n.getText("userDefaultsUnsavedChangesMessage"), {
                    title: ushellResources.i18n.getText("userDefaultsUnsavedChangesTitle"),
                    actions: [sUserDefaultSaveText, sUserDefaultDiscardText, MessageBox.Action.CANCEL],
                    emphasizedAction: sUserDefaultSaveText,
                    icon: MessageBox.Icon.QUESTION,
                    onClose: function (sAction) {
                        if (sAction === sUserDefaultDiscardText) {
                            this._fillGroups();
                            this._setDirtyState(false);
                        } else if (sAction === sUserDefaultSaveText) {
                            this.onSave();
                            this._fillGroups();
                            this._setDirtyState(false);
                        } else {
                            this.getView().getModel("systemContexts").setProperty("/selectedKey", this.sLastSelectedKey);
                        }
                    }.bind(this)
                });
            } else {
                this._fillGroups();
            }
        },

        /**
         * Creates the groups containing the user defaults of the selected system,
         * and adds them to the form
         *
         * @returns {Promise<object>} A promise which resolves to the current view
         *
         * @private
         *
         * @since 1.80.0
         */
        _fillGroups: async function () {
            const oUserDefaultsForm = this.getView().byId("userDefaultsForm");
            oUserDefaultsForm.removeAllGroups();

            const sKey = this.getView().getModel("systemContexts").getProperty("/selectedKey");
            const oSystemContext = this.getView().getModel("systemContexts").getProperty("/systemContexts").find((oContext) => {
                return oContext.id === sKey;
            });

            const UserDefaultParameters = await Container.getServiceAsync("UserDefaultParameters");
            const oParameters = await UserDefaultParameters.editorGetParameters(oSystemContext);

            // take a deep copy of the original parameters
            this.oOriginalParameters = fnDeepExtend({}, oParameters);

            // Used to save extendedValues and value of the plain inputs
            this.oModel = new JSONModel(oParameters);
            this.oModel.setDefaultBindingMode("TwoWay");
            this.getView().setModel(this.oModel, "MdlParameter");
            const aModelInfoObjects = await this._getFormattedParameters(this.oModel);

            const aGroups = this._createContent(aModelInfoObjects);
            aGroups.forEach((oGroup) => {
                oUserDefaultsForm.addGroup(oGroup);
            });
        },

        /**
         * @typedef {object} ParameterValue A value object of the parameter.
         * @property {string|undefined} value the value of the parameter which is shown in the input field
         * @property {object} extendedValue the extended values of the parameter which is shown in the extended dialog
         * @property {object[]} extendedValue.Range array of the SelectOption
         */

        /**
         * @typedef {object} ParameterModelBind Model binding data which used to bind the control.
         * @property {boolean} isOdata Odata model binding or binding to the JSON model
         * @property {string} sPropertyName the property binding statement , e.g. {xxxx} to attach to the control
         * @property {string} sFullPropertyPath path into the model to the property value which is used in the input
         * @property {sap.ui.model.json.JSONModel|sap.ui.model.odata.ODataModel} model the model which used to bind the input
         * @property {sap.ui.model.json.JSONModel} extendedModel the model which used to bind to the extended dialog
         */

        /**
         * @typedef {object} ParameterMetadata Metadata of the parameter
         * @property {string} groupId The id of the group which parameter is located
         * @property {string} groupTitle The group title
         * @property {string} displayText The display text. Used for the label when Odata can not be loaded
         * @property {string} description The description text. Used for the label tooltip when Odata can not be loaded
         * @property {boolean} extendedUsage if extended dialog should be used
         * @property {object} editorInfo Odata information
         * @property {string} editorInfo.odataURL Odata URL
         * @property {string} editorInfo.propertyName name of the parameter
         * @property {string} editorInfo.bindingPath Odata binding path
         *
         */

        /**
         * @typedef {object} FormattedParameter A prepared parameter.
         * @property {string} parameterName The name of the parameter
         * @property {ParameterValue} valueObject A value object of the parameter
         * @property {ParameterModelBind} modelBind A model binding of the parameter
         * @property {ParameterMetadata} editorMetadata A metadata of the parameter
         */

        /**
         * Format original parameters to have the same structure. Also create modelBind.
         *
         * @param {sap.ui.model.json.JSONModel} oJsonModel json model for extended dialog and not Odata fields
         *
         * @returns {Promise<FormattedParameter[]>} The list of sorted formatted parameters.
         */
        _getFormattedParameters: function (oJsonModel) {
            const oParameters = oJsonModel.getData("/");
            const aParametersPromises = Object.keys(oParameters).map((sParameter) => {
                const oParameter = fnDeepExtend({}, oParameters[sParameter]);

                oParameter.parameterName = sParameter;
                oParameter.editorMetadata = oParameter.editorMetadata || {};

                if (oParameter.editorMetadata.editorInfo && oParameter.editorMetadata.editorInfo.propertyName) {
                    return this._createOdataModelBinding(oParameter, oJsonModel)
                        .then((oModelBind) => {
                            oParameter.modelBind = oModelBind;
                            const oODataMetadataModel = oModelBind.model ? oModelBind.model.getMetaModel() : undefined;

                            if (oODataMetadataModel) {
                                return oODataMetadataModel.loaded().then(() => {
                                    const sNS = oODataMetadataModel.getObject("/dataServices/schema/0/namespace");
                                    const oType = oODataMetadataModel.getODataEntityType(`${sNS}.${oParameter.editorMetadata.editorInfo.entityName}`);
                                    const oODataProp = oType.property.find((obj) => { if (obj.name === oParameter.editorMetadata.editorInfo.propertyName) { return true; } });
                                    switch (oODataProp.type) {
                                        case "Edm.DateTime":
                                            // We assume that a SmartField -> Date is used to handle this Parameter, therefore we adapt the data accordingly
                                            oParameter.valueObject.value = oParameter.valueObject.value ? new Date(oParameter.valueObject.value) : null;
                                            break;
                                        default:
                                            oParameter.valueObject.value = oParameter.valueObject.value ? oParameter.valueObject.value : "";
                                            break;
                                    }
                                    return oParameter;
                                });
                            }

                            oParameter.valueObject = fnDeepExtend({ value: "" }, oParameter.valueObject);
                            return oParameter;
                        })
                        .catch(() => {
                            Log.error(`Metadata loading for parameter ${oParameter.parameterName} failed${JSON.stringify(oParameter.editorMetadata)}`);

                            // normalize the value, in the editor, undefined is represented as ""
                            oParameter.valueObject = fnDeepExtend({ value: "" }, oParameter.valueObject);

                            // When odata loading fails, switch to the normal (not smart) control.
                            oParameter.modelBind = this._createPlainModelBinding(oParameter, oJsonModel);
                            this.oBlockedParameters[oParameter.parameterName] = false;
                            return Promise.resolve(oParameter);
                        });
                }

                // normalize the value, in the editor, undefined is represented as ""
                oParameter.valueObject = fnDeepExtend({ value: "" }, oParameter.valueObject);
                oParameter.modelBind = this._createPlainModelBinding(oParameter, oJsonModel);
                return Promise.resolve(oParameter);
            });

            return Promise.all(aParametersPromises).then((aParameters) => {
                aParameters.sort(compareParameters);
                this.aDisplayedUserDefaults = aParameters;
                aParameters.forEach((oParameter) => {
                    oParameter.modelBind.model.setProperty(oParameter.modelBind.sFullPropertyPath, oParameter.valueObject.value);
                    oParameter.modelBind.model.bindTree(oParameter.modelBind.sFullPropertyPath).attachChange(this.storeChangedData.bind(this));
                });
                return aParameters;
            });
        },

        /**
         * Create model binding for the plain control
         * @param {object} oParameter default parameter
         * @param {sap.ui.model.json.JSONModel} oJsonModel json model for extendedModel and model
         *
         * @returns {ParameterModelBind} The modal binding for the parameter
         */
        _createPlainModelBinding: function (oParameter, oJsonModel) {
            const sModelPath = `/${oParameter.parameterName}/valueObject/value`;
            // create object if not exist
            if (!oJsonModel.getProperty(`/${oParameter.parameterName}/valueObject`)) {
                oJsonModel.setProperty(`/${oParameter.parameterName}/valueObject`, {});
            }
            const oBindingInfo = {
                isOdata: false,
                model: oJsonModel,
                extendedModel: oJsonModel, // same model!
                sFullPropertyPath: sModelPath,
                sPropertyName: `{${sModelPath}}`
            };
            return oBindingInfo;
        },

        /**
         * Create model binding for the smart control
         * @param {object} oParameter Parameter
         * @param {sap.ui.model.json.JSONModel} oJsonModel json model for extendedModel
         *
         * @returns {Promise<BindingInfo>} A modal binding info object for the parameter
         */
        _createOdataModelBinding: function (oParameter, oJsonModel) {
            const oEditorInfo = oParameter.editorMetadata.editorInfo;
            const oODataServiceData = this._getODataServiceData(oEditorInfo.odataURL, oParameter);

            return oODataServiceData.metadataLoaded.then(() => {
                const oBindingInfo = {
                    isOdata: true,
                    model: oODataServiceData.model,
                    extendedModel: oJsonModel,
                    sPropertyName: `{${oEditorInfo.propertyName}}`,
                    sFullPropertyPath: `${oEditorInfo.bindingPath}/${oEditorInfo.propertyName}`
                };
                return oBindingInfo;
            });
        },

        /**
         * @typedef {object} ModelRecord A model record.
         * @property {object} model The model used for the OData request.
         * @property {Promise<undefined>} metadata A promise which resolves if the model is loaded or rejects if the loading failed.
         */

        /**
         * Returns a model record for the OData service.
         *
         * @param {string} sUrl The url for which the model should be created.
         * @param {FormattedParameter} oFormattedParameter default parameter
         * @returns {ModelRecord} The model record for the OData Service.
         */
        _getODataServiceData: function (sUrl, oFormattedParameter) {
            if (!this.oModelRecords[sUrl]) {
                // In order to reduce the volume of the metadata response
                // We pass only relevant parameters to oDataModel constructor
                const oModel = new ODataModel(sUrl, {
                    metadataUrlParams: {
                        "sap-documentation": "heading,quickinfo",
                        "sap-value-list": "none",
                        "sap-lang-cachebuster": Localization.getLanguageTag().toString()
                    },
                    json: true
                });
                oModel.setDefaultCountMode("None");
                oModel.setDefaultBindingMode("TwoWay");

                this.oModelRecords[sUrl] = {
                    attachedListeners: [],
                    model: oModel,
                    metadataLoaded: new Promise((resolve, reject) => {
                        oModel.attachMetadataLoaded(resolve);
                        oModel.attachMetadataFailed(reject);
                    })
                };
            }

            if (this.oModelRecords[sUrl].attachedListeners.indexOf(oFormattedParameter.parameterName) === -1) {
                this.oModelRecords[sUrl].attachedListeners.push(oFormattedParameter.parameterName);
                this.oModelRecords[sUrl].model.attachRequestCompleted(this._overrideOdataModelValue.bind(this, oFormattedParameter));
                // because Odata model is used, block input before request is completed
                this.oBlockedParameters[oFormattedParameter.parameterName] = true;
            }
            return this.oModelRecords[sUrl];
        },

        _overrideOdataModelValue: function (oParameter, oEvent) {
            const oModel = oEvent.getSource();
            const sUrlSegment = `/${oEvent.getParameter("url").replace(/\?.*/, "")}`;

            if (oParameter.editorMetadata.editorInfo.bindingPath === sUrlSegment) {
                // if the property value in the model is not the same as the one we got from the service,
                // change the property value accordingly
                const sFullPath = `${oParameter.editorMetadata.editorInfo.bindingPath}/${oParameter.editorMetadata.editorInfo.propertyName}`;
                if (oModel.getProperty(sFullPath) !== oParameter.valueObject.value) {
                    oModel.setProperty(sFullPath, oParameter.valueObject.value);
                }
                this.oBlockedParameters[oParameter.parameterName] = false;
            }
        },

        /**
         * Create smart form content
         * @param {FormattedParameter[]} aFormattedParameters list of the formatted parameters
         * @returns {sap.ui.comp.smartform.Group[]} the list of the groups
         */
        _createContent: function (aFormattedParameters) {
            let sLastGroupId = "nevermore";
            let oGroup; // the current group;
            const oBindingContexts = {};
            const aGroups = [];

            for (let i = 0; i < aFormattedParameters.length; ++i) {
                const oProperty = aFormattedParameters[i];
                const oModelBinding = oProperty.modelBind;

                if (sLastGroupId !== oProperty.editorMetadata.groupId) {
                    // generate a group on group change
                    oGroup = new Group({
                        title: new Title({
                            text: oProperty.editorMetadata.groupTitle || undefined
                        })
                    });
                    sLastGroupId = oProperty.editorMetadata.groupId;
                    aGroups.push(oGroup);
                }

                const oGroupElement = this._createGroupElement(oProperty);
                oGroupElement.setModel(oModelBinding.model);
                if (oModelBinding.isOdata) {
                    const sUrl = oProperty.editorMetadata.editorInfo.odataURL;
                    // in order to avoid OData requests to the same URL
                    // we try to reuse the BindingContext that was previously created for the same URL
                    // the call to bindElement creates a new BindingContext, and triggers an OData request
                    if (!oBindingContexts[sUrl]) {
                        const sBindingPath = oProperty.editorMetadata.editorInfo.bindingPath;
                        oGroupElement.bindElement(sBindingPath);
                        oBindingContexts[sUrl] = oProperty.modelBind.model.getContext(sBindingPath);
                    } else {
                        oGroupElement.setBindingContext(oBindingContexts[sUrl]);
                    }
                }
                oGroup.addGroupElement(oGroupElement);
            }
            return aGroups;
        },

        /**
         * Create GroupElement
         *
         * @param {FormattedParameter} oFormattedParameters default parameter
         * @returns {sap.ui.comp.smartform.GroupElement} GroupElement with a Label and elements
         *
         * @since 1.129.0
         * @private
         */
        _createGroupElement: function (oFormattedParameters) {
            let oField;
            const oLabel = new SmartLabel({});
            // If oRecord supports extended values (ranges), we want to add an additional button to it
            // The style of the button depends on whether there are any ranges in the extendedValues object
            const oExtendedParametersButton = new Button({
                text: "{i18n>userDefaultsExtendedParametersTitle}",
                tooltip: "{i18n>userDefaultsExtendedParametersTooltip}",
                visible: !!oFormattedParameters.editorMetadata.extendedUsage,
                type: {
                    parts: [`MdlParameter>/${oFormattedParameters.parameterName}/valueObject/extendedValue/Ranges`],
                    formatter: (aRanges) => {
                        return aRanges && aRanges.length ? ButtonType.Emphasized : ButtonType.Transparent;
                    }
                },
                press: (oEvent) => {
                    ExtendedValueDialog.openDialog(oFormattedParameters, this.saveExtendedValue.bind(this));
                }
            });

            if (oFormattedParameters.modelBind.isOdata && oFormattedParameters.editorMetadata.editorInfo) {
                oField = new SmartField({
                    value: oFormattedParameters.modelBind.sPropertyName,
                    name: oFormattedParameters.parameterName,
                    fieldGroupIds: ["UserDefaults"]
                });
                oLabel.setLabelFor(oField);
            } else {
                oField = new Input({
                    name: oFormattedParameters.parameterName,
                    value: oFormattedParameters.modelBind.sPropertyName,
                    fieldGroupIds: ["UserDefaults"],
                    type: "Text"
                });
                oField.addAriaLabelledBy(oLabel);
                oLabel.setText(oFormattedParameters.editorMetadata.displayText || oFormattedParameters.parameterName);
                oLabel.setTooltip(oFormattedParameters.editorMetadata.description || oFormattedParameters.parameterName);
            }

            oField.attachChange(this.storeChangedData.bind(this));
            oField.attachChange(this._setDirtyState.bind(this, true), this);

            const oGroupElement = new GroupElement({
                elements: [oField, oExtendedParametersButton],
                label: oLabel
            });
            return oGroupElement;
        },

        saveExtendedValue: function (oControlEvent) {
            const sParameterName = oControlEvent.getSource().getModel().getProperty("/parameterName");
            // JSONModel is used for the extend values
            const oExtendedModel = this.oModel;
            const aTokens = oControlEvent.getParameters().tokens || [];
            const sPathToTokens = `/${sParameterName}/valueObject/extendedValue/Ranges`;

            // convert the Ranges that are coming from the dialog to the format that should be persisted in the service and that applications can read
            const aFormattedTokensData = aTokens.map((oToken) => {
                const oTokenData = oToken.data("range");
                return {
                    Sign: oTokenData.exclude ? "E" : "I",
                    Option: oTokenData.operation !== "Contains" ? oTokenData.operation : "CP",
                    Low: oTokenData.value1,
                    High: oTokenData.value2 || null
                };
            });

            if (!oExtendedModel.getProperty(`/${sParameterName}/valueObject/extendedValue`)) {
                oExtendedModel.setProperty(`/${sParameterName}/valueObject/extendedValue`, {});
            }
            oExtendedModel.setProperty(sPathToTokens, aFormattedTokensData);
            this.aChangedParamsNames.push(sParameterName);
            if (oControlEvent.getParameter("_tokensHaveChanged")) {
                this._setDirtyState(true);
            }
        },

        /**
         * Sets the dirty state and saves the current selectedKey.
         * This is needed for resetting the selectedKey if the user doesn't want to discard their changes.
         *
         * @param {boolean} isDirty True if the state should be changed to dirty.
         *
         * @private
         *
         * @since 1.81.0
         */
        _setDirtyState: function (isDirty) {
            this.oDirtyStateModel.setProperty("/isDirty", isDirty);
            this._setSmartVariantModified(isDirty);

            if (isDirty) {
                this.sLastSelectedKey = this.getView().getModel("systemContexts").getProperty("/selectedKey");
            }
        },

        /**
         * Sets the key of the selected variant.
         * @param {string} sSelectionKey The key of the selected variant.
         * @private
         */
        _setSelectedVariant: function (sSelectionKey) {
            this.oDirtyStateModel.setProperty("/selectedVariant", sSelectionKey);
            this.storeChangedData();
        },

        /**
         * This function is invoked on any model data change in the plain JSON fallback model.
         * As this does not work an odata model, it is called during save
         * and it is called during resetting the smart variant, too.
         * We always run over all parameters and record the ones with a delta.
         * We change *relevant* deltas compared to the data when calling up the dialogue.
         * Note:
         *  the valueObject may contain other relevant metadata,
         *  which is *not* altered by the Editor Control!
         *  Thus it is important not to overwrite or recreate the valueObject, but only set the value property.
         */
        storeChangedData: function () {
            const aDisplayedUserDefaults = this.aDisplayedUserDefaults || [];

            // check for all changed parameters...
            for (let i = 0; i < aDisplayedUserDefaults.length; ++i) {
                const sParameterName = aDisplayedUserDefaults[i].parameterName;
                const oValueObject = this.oModel.getProperty(`/${sParameterName}/valueObject/`);
                const oModelBinding = aDisplayedUserDefaults[i].modelBind;

                if (!this.oBlockedParameters[sParameterName]) {
                    const oldValues = {
                        value: oValueObject && oValueObject.value,
                        extendedValue: oValueObject && oValueObject.extendedValue
                    };
                    if (oModelBinding && oModelBinding.model) {
                        const oModel = oModelBinding.model;
                        const oModelExtended = oModelBinding.extendedModel;
                        const sPropValuePath = oModelBinding.sFullPropertyPath;

                        const oCurrentValues = {
                            value: oModel.getProperty(sPropValuePath) !== "" ? oModel.getProperty(sPropValuePath) : undefined,
                            extendedValue: oModelExtended.getProperty(`/${sParameterName}/valueObject/extendedValue`) || undefined
                        };
                        if (!fnDeepEqual(oCurrentValues, oldValues)) {
                            oValueObject.value = oCurrentValues.value;
                            if (oCurrentValues.extendedValue) {
                                oValueObject.extendedValue = {};
                                fnDeepExtend(oValueObject.extendedValue, oCurrentValues.extendedValue);
                            }
                            // Update also JSON Model's value
                            this.oModel.setProperty(`/${sParameterName}/valueObject`, oValueObject);

                            this.aChangedParamsNames.push(sParameterName);
                        }
                    }
                }
            }
        },

        onCancel: function () {
            this._setDirtyState(false);

            const aDisplayedParameters = this.aDisplayedUserDefaults;

            if (this.aChangedParamsNames.length > 0) {
                for (let i = 0; i < aDisplayedParameters.length && this.aChangedParamsNames.length > 0; i++) {
                    const sParameterName = aDisplayedParameters[i].parameterName;
                    if (this.aChangedParamsNames.indexOf(sParameterName) > -1) {
                        const oOriginalParameter = this.oOriginalParameters[sParameterName];
                        const oParameter = aDisplayedParameters[i];
                        const oBoundModel = oParameter.modelBind;
                        const oODataMetadataModel = oBoundModel.model ? oBoundModel.model.getMetaModel() : undefined;

                        if (oODataMetadataModel) {
                            const sNS = oODataMetadataModel.getObject("/dataServices/schema/0/namespace");
                            const oType = oODataMetadataModel.getODataEntityType(`${sNS}.${oParameter.editorMetadata.editorInfo.entityName}`);
                            const oODataProp = oType.property.find((obj) => { if (obj.name === oParameter.editorMetadata.editorInfo.propertyName) { return true; } });
                            switch (oODataProp.type) {
                                case "Edm.DateTime":
                                    oBoundModel.model.setProperty(oBoundModel.sFullPropertyPath, new Date(oOriginalParameter.valueObject.value) || null);
                                    break;
                                default:
                                    oBoundModel.model.setProperty(oBoundModel.sFullPropertyPath, oOriginalParameter.valueObject.value || "");
                                    break;
                            }
                        } else {
                            oBoundModel.model.setProperty(oBoundModel.sFullPropertyPath, oOriginalParameter.valueObject.value || "");
                        }

                        if (oOriginalParameter.editorMetadata && oOriginalParameter.editorMetadata.extendedUsage) {
                            oBoundModel.extendedModel.setProperty(`/${sParameterName}/valueObject/extendedValue`,
                                oOriginalParameter.valueObject.extendedValue || {});
                        }
                    }
                }
                this.aChangedParamsNames = [];
            }
            this._setDefaultVariant();
        },

        onSave: function () {
            this.storeChangedData();
            this._setDirtyState(false);

            let pSave;

            if (this.aChangedParamsNames.length === 0) {
                pSave = Promise.resolve();
            } else {
                pSave = Container.getServiceAsync("ClientSideTargetResolution")
                    .then((oClientSideTargetResolution) => {
                        return oClientSideTargetResolution.getSystemContext(this.sLastSelectedKey);
                    })
                    .then((oSystemContext) => {
                        const aChangedParameterNames = this.aChangedParamsNames.sort();
                        this.aChangedParamsNames = [];
                        return this._saveParameterValues(aChangedParameterNames, oSystemContext);
                    });
            }

            return pSave.then(this._resetSmartVariantManagement.bind(this))
                .then(this._setDefaultVariant.bind(this));
        },

        _saveParameterValues: function (aChangedParameterNames, oSystemContext) {
            const aPromises = [];

            // we change the effectively changed parameters, once, in alphabetic order
            for (let i = 0; i < aChangedParameterNames.length; i++) {
                const sParameterName = aChangedParameterNames[i];
                const oValueObject = this.oModel.getProperty(`/${sParameterName}/valueObject/`);
                const oOriginalValueObject = this.oOriginalParameters[sParameterName].valueObject;

                if (!fnDeepEqual(oOriginalValueObject, oValueObject)) {
                    // as the editor does not distinguish empty string from deletion, and has no "reset" button
                    // we drop functionality to allow to set a value to an empty string (!in the editor!)
                    // and map an empty string to an effective deletion!
                    // eslint-disable-next-line no-warning-comments
                    // TODO: make sure all controls allow to enter an empty string as a "valid" value
                    if (oValueObject && oValueObject.value === null || oValueObject && oValueObject.value === "") {
                        oValueObject.value = undefined;
                    }

                    // we rectify the extended value, as the editor produces empty object
                    if (oValueObject && oValueObject.extendedValue && Array.isArray(oValueObject.extendedValue.Ranges) && oValueObject.extendedValue.Ranges.length === 0) {
                        oValueObject.extendedValue = undefined;
                    }

                    const oSetValuePromise = this._saveParameterValue(sParameterName, oValueObject, oOriginalValueObject, oSystemContext);
                    aPromises.push(oSetValuePromise);
                }
            }
            return Promise.all(aPromises);
        },

        _saveParameterValue: async function (sName, oValueObject, oOriginalValueObject, oSystemContext) {
            const UserDefaultParameters = await Container.getServiceAsync("UserDefaultParameters");

            await UserDefaultParameters.editorSetValue(sName, oValueObject, oSystemContext);
            oOriginalValueObject.value = oValueObject.value;
        },

        /**
         * Sets the current variant to modified or not. The control will be displayed with an asterisk.
         * @param {boolean} isModified True if the variant has been modified.
         * @private
         */
        _setSmartVariantModified: function (isModified) {
            if (!this._bIsSupportedPlatform) { return; }
            this.getView().byId("defaultSettingsVariantManagement").currentVariantSetModified(isModified);
        },

        /**
         * Sets the selected view to the default view in the SmartVariant control.
         * @private
         */
        _setDefaultVariant: function () {
            if (!this._bIsSupportedPlatform) { return; }
            const oSmartVariantManagement = this.getView().byId("defaultSettingsVariantManagement");
            oSmartVariantManagement.setCurrentVariantId(oSmartVariantManagement.getDefaultVariantKey());
            this._setSelectedVariant(oSmartVariantManagement.getDefaultVariantKey());
        },

        /**
         * Removes all personalizable controls from the SmartVariantManagement control
         * and re-initializes them.
         * This is required to update the "Standard" control after the UserDefaults have been saved.
         * @returns {Promise<undefined>} Resolves when the component has been initialized.
         * @private
         */
        _resetSmartVariantManagement: function () {
            if (!this._bIsSupportedPlatform) { return Promise.resolve(); }
            this.getView().byId("defaultSettingsVariantManagement").removeAllPersonalizableControls();
            return this._initializeSmartVariantManagement();
        },

        /**
         * Initializes the PersonalizableInfo instance to introduce the SmartVariantManagement
         * to the UserDefaultsForm control.
         * @returns {Promise<undefined>} Resolves when the component has been initialized.
         * @private
         */
        _initializeSmartVariantManagement: function () {
            if (!this._bIsSupportedPlatform) { return Promise.resolve(); }
            const oSmartVariantManagement = this.getView().byId("defaultSettingsVariantManagement");
            const fnSetVariant = function () {
                this._setSelectedVariant(oSmartVariantManagement.getSelectionKey());
            }.bind(this);

            return new Promise((resolve) => {
                const oUserDefaultsForm = this.getView().byId("userDefaultsForm");
                const oPersInfo = new PersonalizableInfo({
                    type: "wrapper",
                    keyName: "persistencyKey",
                    dataSource: "none",
                    control: oUserDefaultsForm
                });

                oSmartVariantManagement.detachSelect(fnSetVariant)
                    .detachAfterSave(fnSetVariant)
                    .addPersonalizableControl(oPersInfo)
                    .attachSelect(fnSetVariant)
                    .attachAfterSave(fnSetVariant)
                    .initialise(() => {
                        oSmartVariantManagement.setVisible(true);
                        resolve();
                    }, oUserDefaultsForm);
            }).then(fnSetVariant);
        },

        /**
         * Checks and saves a flag to disable smartvariant management on not supported platforms.
         * Currently not supported: CDM
         * @returns {Promise<boolean>} A promise resolving when the flag has been set.
         * @private
         */
        _saveIsSupportedPlatform: function () {
            const sPlatform = Container.getLogonSystem().getPlatform();
            this._bIsSupportedPlatform = (sPlatform !== "cdm");
            return Promise.resolve(this._bIsSupportedPlatform);
        },

        /**
         * Returns true if a diff between the standard variant and the currently chosen variant exists.
         * @returns {boolean} The result.
         */
        displayDiffText: function () {
            if (!this._bIsSupportedPlatform) { return false; }
            const oSmartVariantManagement = this.getView().byId("defaultSettingsVariantManagement");
            const oUserDefaultsForm = this.getView().byId("userDefaultsForm");
            const sStandardKey = oSmartVariantManagement.getStandardVariantKey();
            const sSelectionKey = oSmartVariantManagement.getSelectionKey();

            if (sSelectionKey === sStandardKey) { return false; }

            const oStandardContent = oSmartVariantManagement.getVariantContent(oUserDefaultsForm, sStandardKey);
            const oVariantContent = oSmartVariantManagement.getVariantContent(oUserDefaultsForm, sSelectionKey);

            // workaround to get a deepEqual === true
            delete oVariantContent.executeOnSelection;

            return !fnDeepEqual(oStandardContent, oVariantContent);
        }
    });
});

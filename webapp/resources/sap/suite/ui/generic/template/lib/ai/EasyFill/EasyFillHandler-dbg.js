sap.ui.define([
    "sap/ui/base/Object",
    "sap/base/util/extend",
    "sap/ui/comp/smartform/Group",
    "sap/ui/comp/smartform/GroupElement",
    "sap/ui/comp/smartfield/SmartField",
    "sap/ui/comp/smartfield/SmartLabel",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/AnnotationHelper"
], function(BaseObject, extend, Group, GroupElement, SmartField, SmartLabel,MessageToast,JSONModel,AnnotationHelperModel) {
    'use strict';
    /*
     * This is a handler class for EasyFill.
     * It gets initialized when the Fiori AI EasyFill  is enabled
     * Below things are handled in this class:
     * 1. Prepare Field metadata
     * 2. Prepare EasyFill Dialog 
     * 
     */
    function getMethods(oState, oController, oTemplateUtils, oObjectPage) {
        let oTransientContextForEasyFill;
        let oObjectPageContext;
        let oObjectPageModel;
        let mUpdatableLookupMap;
        let oRb;
        let oAIPopover;

        async function openEasyFillDialog(oEvent,oContext) {
            let oEasyFillDialog;
            oRb = oController.getView().getModel("i18n").getResourceBundle();
            const bIsModelCreated = !!oController.getView().getModel("easyFillDialogModel");
            if (!bIsModelCreated) {
                oObjectPageModel = oObjectPage.getModel();
                const aDeferredGroups = oObjectPageModel.getDeferredGroups();
                //Adding a defferred group will make sure that no batch call would get triggered to backend until submitChanges() is invoked
                aDeferredGroups.push("EasyFillFETransientChanges");
                oObjectPageModel.setDeferredGroups(aDeferredGroups);

                //Creating a JSON model for the dialog

                const oData = {
                    isBusy: false,
                    isUpdatableVisible: false,
                    isNonUpdatableVisible: false,
                    isIllustrationVisible: true,
                    isSaveEnabled: false,
                    stateType: "Initial",
                    feedbackEnabled: true,
                    isEasyFillButtonEnabled: false
                  };

                  let oModel = new JSONModel(oData);
                  oController.getView().setModel(oModel, "easyFillDialogModel");
            }

            oObjectPageContext = (oContext) ? oContext : oObjectPage.getBindingContext();

            // cannot use OP path to create a list binding as it is a individual entry
            var sFragmentname = "sap.suite.ui.generic.template.lib.ai.EasyFill.fragments.EasyFillDialog";
			oTemplateUtils.oCommonUtils.getDialogFragmentAsync(sFragmentname, {
                onFeedbackPress: function() {
                    const easyFillDialogModel = oController.getView().getModel("easyFillDialogModel");
                    easyFillDialogModel.setProperty("/feedbackEnabled",false);
                    MessageToast.show(oRb.getText("EASYFILL_RESULT_FEEDBACK"));
                },
                formatIllustrationType: function (sState) {
                    switch (sState) {
                        case "Initial":
                            return "sapIllus-NoSearchResults";
                        case "NoEntries":
                            return "sapIllus-NoEntries";
                        case "Error":
                            return "sapIllus-UnableToLoad";
                        default:
                            return "sapIllus-NoSearchResults";
                    }
                },
                formatIllustrationTitle: function (sState) {
                    switch (sState) {
                        case "Initial":
                            return oRb.getText("EASY_FILL_ILLUSTRATION_TITLE_INITIAL");
                        case "NoEntries":
                            return oRb.getText("EASY_FILL_ILLUSTRATION_TITLE_NO_ENTRIES");
                        case "Error":
                            return oRb.getText("EASY_FILL_ILLUSTRATION_TITLE_ERROR");
                        default:
                            return oRb.getText("EASY_FILL_ILLUSTRATION_TITLE_INITIAL");
                    }
                },
                formatIllustrationDescription: function (sState) {
                    switch (sState) {
                        case "Initial":
                            return oRb.getText("EASY_FILL_ILLUSTRATION_DESCRIPTION_INITIAL");
                        case "NoEntries":
                            return oRb.getText("EASY_FILL_ILLUSTRATION_DESCRIPTION_NO_ENTRIES");
                        case "Error":
                            return oRb.getText("EASY_FILL_ILLUSTRATION_DESCRIPTION_ERROR");
                        default:
                            return oRb.getText("EASY_FILL_ILLUSTRATION_DESCRIPTION_INITIAL");
                    }
                },
                onSaveFromEasyFillDialog : async function (oEvent) {
                    var oTransientObject = oTransientContextForEasyFill.getObject();
                    for (const oProp in oTransientObject) {
                        if (oProp !== "__metadata" && mUpdatableLookupMap[oProp]) {
                            oObjectPageContext.setProperty(oProp, oTransientObject[oProp]);
                        }
                    }
                    resetEasyFill(true);
                    oEasyFillDialog.close();
                },
                onLiveChange: function(oEvent) {
                    const easyFillDialogModel = oController.getView().getModel("easyFillDialogModel");
                    easyFillDialogModel.setProperty("/isEasyFillButtonEnabled",!!oEvent.getSource().getValue());
                },
                onCancelEasyFillDialog : function () {
                    resetEasyFill(true);
                    oEasyFillDialog.close();
                },
                onEasyFillSubmitInputToAI : async function (oEvent) {  
                    resetEasyFill();
                    const easyFillDialogModel = oController.getView().getModel("easyFillDialogModel");
                    easyFillDialogModel.setProperty("/isBusy",true);
                    let mFieldMapping = getEntitySetMapForLLM();
                    let aiCallResult = await  oTemplateUtils.oServices.oFioriAIHandler.fioriaiLib.EasyFill.extractFieldValuesFromText(oController.byId("EasyFillInputTextArea").getValue(), mFieldMapping);
                    easyFillDialogModel.setProperty("/isBusy",false);
                    formatDateValues(aiCallResult,mFieldMapping);       
                    if (aiCallResult.success) {
                        const {updatableFields,nonUpdatableFields} = getUpdatableAndNonUpdatableFields(aiCallResult.data);
                        mUpdatableLookupMap = updatableFields;
                        if (Object.keys(updatableFields).length + Object.keys(nonUpdatableFields).length === 0) {
                            easyFillDialogModel.setProperty("/stateType","NoEntries");
                            return;
                        }
                        easyFillDialogModel.setProperty("/isIllustrationVisible",false);
                        //Fillable Fields
                        makeTransientContext();
                        easyFillDialogModel.setProperty("/isUpdatableVisible",Object.keys(updatableFields).length > 0);
                        if (Object.keys(updatableFields).length > 0) {
                            const oAIResponseReviewRegionSmartFormForUpdatableFields = oController.byId("EasyFillUpdatebleForm");

                            const oOldGroup = getGroupForSmartForm(updatableFields,false,oObjectPage.getBindingContext(),false);
                            const oNewGroup = getGroupForSmartForm(updatableFields,true,oTransientContextForEasyFill,true);
                            oAIResponseReviewRegionSmartFormForUpdatableFields.addGroup(oOldGroup);
                            oAIResponseReviewRegionSmartFormForUpdatableFields.addGroup(oNewGroup);
                            validateSmartForm();
                        }
                        //Non-Fillable Fields
                        easyFillDialogModel.setProperty("/isNonUpdatableVisible",Object.keys(nonUpdatableFields).length > 0);
                        if (Object.keys(nonUpdatableFields).length > 0) {
                            const oAIResponseReviewRegionSmartFormForNonUpdatableFields = oController.byId("EasyFillNonUpdatebleForm");
                            const oOldGroup = getGroupForSmartForm(nonUpdatableFields,false,oObjectPage.getBindingContext(),false);
                            const oNewGroup = getGroupForSmartForm(nonUpdatableFields,false,oTransientContextForEasyFill,true);
                            oAIResponseReviewRegionSmartFormForNonUpdatableFields.addGroup(oOldGroup);
                            oAIResponseReviewRegionSmartFormForNonUpdatableFields.addGroup(oNewGroup);
                        }
                    } else {
                        easyFillDialogModel.setProperty("/stateType","Error");
                    }
                },
                onEasyFillClearAll: function() {
                    resetEasyFill(true);
                },
                onLinkPress: async function(oEvent) {
                    if (!oAIPopover) {
                        oAIPopover = await getAIPopover();
                    }
                    oAIPopover.openBy(oEvent.getSource());
                }
			}, "easyFillPopup",undefined,true,true).then(function (oPopup) {
                oEasyFillDialog = oPopup;
                oPopup.open();
			});
        }

        function getAIPopover() {
            return new Promise(async(resolve,reject) => {
                const sFragmentname = "sap.suite.ui.generic.template.fragments.AINotice";
                const oPopover = await oTemplateUtils.oCommonUtils.getDialogFragmentAsync(sFragmentname,{
                    onCloseAiPopover: function() {
                        oAIPopover.close();
                    }
                },"aiPopover",undefined,true);
                resolve(oPopover);
            });
        }

        function getEntitySetMapForLLM() {
            const mPropertyMap = {};
            const oEntityType = oTemplateUtils.oCommonUtils.getMetaModelEntityType(oController.getOwnerComponent().getEntitySet());
            oEntityType.property.forEach((oProperty)=>{
                mPropertyMap[oProperty.name] = {
                    description: getLabel(oProperty),
                    dataType: oProperty.type
                };   
            });
            return mPropertyMap;
        }

        function getLabel(oProperty) {
            return oProperty["com.sap.vocabularies.Common.v1.Label"] ? AnnotationHelperModel.format(oObjectPageContext,oProperty["com.sap.vocabularies.Common.v1.Label"]) : oProperty["sap:label"];
        }

        function formatDateValues(aiCallResult,mFieldMapping) {
            if (aiCallResult.success) {
                for (const key of Object.keys(aiCallResult.data)) {
                    const sDataType = mFieldMapping[key].dataType;
                    if (sDataType === "Edm.DateTimeOffset" || sDataType === "Edm.DateTime") {
                        aiCallResult.data[key] = new Date(aiCallResult.data[key]);
                    }
                }
            }
        }

        function validateSmartForm() {
            setTimeout(async() => {
                const easyFillDialogModel = oController.getView().getModel("easyFillDialogModel");
                try {
                    const oAIResponseReviewRegionSmartFormForUpdatableFields = oController.byId("EasyFillUpdatebleForm");
                    const aIds = await oAIResponseReviewRegionSmartFormForUpdatableFields.check();
                    easyFillDialogModel.setProperty("/isSaveEnabled",aIds.length === 0);
                } catch (error) {
                    easyFillDialogModel.setProperty("/isSaveEnabled",false);
                }
            }, 0);
        }

        function resetEasyFill(bRemoveTextAreaValue) {
            const easyFillDialogModel =  oController.getView().getModel("easyFillDialogModel");
            const oAIResponseReviewRegionSmartFormForNonUpdatableFields = oController.byId("EasyFillNonUpdatebleForm");
            const oAIResponseReviewRegionSmartFormForUpdatableFields = oController.byId("EasyFillUpdatebleForm");
            oAIResponseReviewRegionSmartFormForUpdatableFields.destroyGroups();
            oAIResponseReviewRegionSmartFormForNonUpdatableFields.destroyGroups();
            resetTransientContext();
            easyFillDialogModel.setProperty("/isUpdatableVisible",false);
            easyFillDialogModel.setProperty("/isNonUpdatableVisible",false);
            easyFillDialogModel.setProperty("/isIllustrationVisible",true);
            easyFillDialogModel.setProperty("/isSaveEnabled",false);
            easyFillDialogModel.setProperty("/stateType","Initial");
            easyFillDialogModel.setProperty("/feedbackEnabled",true);
            if (bRemoveTextAreaValue) {
                oController.byId("EasyFillInputTextArea").setValue("");
                easyFillDialogModel.setProperty("/isEasyFillButtonEnabled",false);
            }
        }

        function getUpdatableAndNonUpdatableFields(oAiCallResult) {
            const oEntityType = oTemplateUtils.oCommonUtils.getMetaModelEntityType(oController.getOwnerComponent().getEntitySet());
            const updatableFields = {};
            const nonUpdatableFields = {};

            Object.keys(oAiCallResult).forEach((sKey)=>{
                const oProperty = oEntityType.property.find((oProperty)=>oProperty.name === sKey);
                const {bIsVisible,bIsEditable} = isEditable(oProperty);
                if (bIsVisible) {
                    if (bIsEditable) {
                        updatableFields[sKey] = oAiCallResult[sKey];
                    } else {
                        nonUpdatableFields[sKey] = oAiCallResult[sKey];
                    }
                }
            });
            return {updatableFields,nonUpdatableFields};
        }

        //Checks if the field is editable or not

        // It can be set in 2 ways using field-control, it would be present when sap:updatable attribute is not present
        // 1. By attaching to an existing metadata property, sap:field-control-> path for the property
        //Below are the values by which the editable state would be defined

        /**
         * Value	Meaning
         -----------------------------------------------
            0	    Hidden (field not shown at all)
            1	    Read-only (display only)
            3	    Editable
            7	    Mandatory (Still Editable)
            */

        // 2. By Adding to an annotation "com.sap.vocabularies.Common.v1.FieldControl"
        
        //Since "com.sap.vocabularies.Common.v1.FieldControl" is an V4 annotation, it would be given the first priority

        function isEditable(oProperty) {

            const oRes = {
                bIsVisible: true,
                bIsEditable: true
            };

            //Check for sap:updatable
            const sUpdatable = oProperty["sap:updatable"];
            if (sUpdatable) {
                oRes.bIsEditable = (sUpdatable === "false") ? false : true;
                return oRes;
            }

            //Check for "com.sap.vocabularies.Common.v1.FieldControl"
            const oAnnotation = oProperty["com.sap.vocabularies.Common.v1.FieldControl"];

            if (oAnnotation && oAnnotation["EnumMember"]) {
                const enumNumberType = oAnnotation["EnumMember"];
                oRes.bIsVisible = (enumNumberType === 'com.sap.vocabularies.Common.v1.FieldControlType/Hidden') ? false : true;
                oRes.bIsEditable = (enumNumberType === 'com.sap.vocabularies.Common.v1.FieldControlType/ReadOnly') ? false : true;
                return oRes;
            }

            //Check for Hidden annotation i.e com.sap.vocabularies.UI.v1.Hidden
            const oHiddenAnnotation = oProperty["com.sap.vocabularies.UI.v1.Hidden"];
            if (oHiddenAnnotation) {
                oRes.bIsVisible = false;    // <Annotation Term="UI.Hidden"/>
                if (oHiddenAnnotation["Bool"]) {
                    oRes.bIsVisible = (oHiddenAnnotation["Bool"] === "true") ? false : true;
                } else if (oHiddenAnnotation["Path"]) {
                    oRes.bIsVisible = !oObjectPageContext.getObject()[oHiddenAnnotation["Path"]];
                }
                return oRes;
            }
            
            //Check for "sap:field-control"
            const sFieldControl = oProperty["sap:field-control"];

            if (sFieldControl) {
                const iFieldControlValue = oObjectPageContext.getObject()[sFieldControl];
                oRes.bIsVisible = (iFieldControlValue === 0) ? false : true;
                oRes.bIsEditable = (iFieldControlValue === 1) ? false : true;
                return oRes;
            }

            //If no restriction is present then by default all fields are editable
            return oRes;
        }

        function resetTransientContext() {
            if (oTransientContextForEasyFill) {
                oObjectPageModel.resetChanges([oTransientContextForEasyFill.getPath()],false,true);
                oTransientContextForEasyFill = null;
            }
        }

        function makeTransientContext() {
            if (oTransientContextForEasyFill) {
                resetTransientContext();
            }
            oTransientContextForEasyFill = oObjectPageModel.createEntry("/" + oController.getOwnerComponent().getEntitySet(), {
                "groupId" : "EasyFillFETransientChanges",
                "changeSetId":"EasyFillFETransientChanges"
            });
        }

         function onSmartFieldChange() {
            validateSmartForm();
        }

        function getGroupForSmartForm(oDataFromLLM, isEditable,oContext,isTransient) {
            var oGroup = new Group({
                title: (isTransient) ? oRb.getText("EASY_FILL_PROPOSED_VALUES") : oRb.getText("EASY_FILL_PREVIOUS_VALUES")
            });
            
            for (const key of Object.keys(oDataFromLLM)) {
                const oGroupElement = new GroupElement();
                const oSmartField = new SmartField({
                    value: "{" + key + "}",
                    editable: isEditable,
                    enabled: isEditable,
                    contextEditable: isEditable,
                    change: onSmartFieldChange.bind(this)
                });
                const oSmartLabel = new SmartLabel();
                oSmartLabel.setLabelFor(oSmartField);
                oGroupElement.addElement(oSmartField);
                //Update the field only if its transient
                if (isTransient) {
                    oContext.setProperty(key,oDataFromLLM[key]);
                }
                oGroup.addGroupElement(oGroupElement);
            }
            oGroup.setBindingContext(oContext);
            return oGroup;
        }

        return {
            onEasyFillButtonClick: function(oEvent) {
                // Once you click on the easyFill button the OP should be going to editable state, if its already in editState then directly open the dialog
                //If its in non-editable state we should wait until the context switch, We need that context to finally save the data from the AI into the newly came editable context of the OP
                const isEditable = oController.getView().getModel("ui").getProperty("/editable");
                if (isEditable) {
                    openEasyFillDialog(oEvent);
                } else {
                    oController._templateEventHandlers.onEditByEasyFill().then((oContext)=>{
                        oObjectPageContext = oContext;
                        openEasyFillDialog(oEvent,oContext);
                    }).catch(Function.prototype);
                }
            }
        };
    }

    return BaseObject.extend("sap.suite.ui.generic.template.lib.ai.EasyFill.EasyFillHandler", {
        constructor: function (oState, oController, oTemplateUtils, oObjectPage) {
            extend(this, getMethods(oState, oController, oTemplateUtils, oObjectPage));
        }
    });
    
});
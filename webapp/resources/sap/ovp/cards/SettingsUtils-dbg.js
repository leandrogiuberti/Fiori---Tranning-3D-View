/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define([
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/ovp/cards/PayLoadUtils",
    "sap/ovp/cards/OVPCardAsAPIUtils",
    "sap/ovp/cards/rta/SettingsDialogConstants",
    "sap/ovp/cards/CommonUtils",
    "sap/ovp/cards/generic/base/analytical/Utils",
    "sap/ui/Device",
    "sap/m/MessagePopover",
    "sap/m/MessageItem",
    "sap/m/Link",
    "sap/m/MessageBox",
    "sap/ovp/cards/AnnotationHelper",
    "sap/ui/core/mvc/ViewType",
    "sap/ui/model/json/JSONModel",
    "sap/ovp/app/resources",
    "sap/base/util/merge",
    "sap/ovp/app/OVPLogger",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/odata/CountMode",
    "sap/ui/core/mvc/View",
    "sap/ui/core/Element"
], function (
    Dialog,
    Button,
    PayLoadUtils,
    OVPCardAsAPIUtils,
    SettingsConstants,
    CommonUtils,
    Utils,
    Device,
    MessagePopover,
    MessageItem,
    Link,
    MessageBox,
    AnnotationHelper,
    ViewType,
    JSONModel,
    OvpResources,
    merge,
    OVPLogger,
    ODataModel,
    CountMode,
    View,
    CoreElement
) {
    "use strict";
    
    var oResourceBundle = OvpResources;
    var oLogger = new OVPLogger("OVP.cards.SettingsUtils");

    function addCardToView(oComponentContainer, oView, bNewCardFlag) {
        var oComponent = oComponentContainer.getComponentInstance(),
            oComponentData = oComponent.getComponentData(),
            oAppComponent = oComponentData.appComponent,
            oMainComponent = oComponentData.mainComponent,
            sCardId = bNewCardFlag ? "" : oComponentData.cardId,
            sManifestCardId = sCardId + "Dialog",
            sModelName = bNewCardFlag ? "" : oComponentData.modelName,
            oModel = !sModelName ? undefined : oAppComponent.getModel(sModelName),
            oCardProperties = oView.getModel().getData(),
            oManifest = {
                cards: {}
            };
        oManifest.cards[sManifestCardId] = {
            template: oCardProperties.template,
            settings: oCardProperties
        };
        if (oSettingsUtils.bNewKPICardFlag) {
            var oSelectedKPI = oCardProperties.selectedKPI;
            oModel = new ODataModel(oSelectedKPI.ODataURI, {
                annotationURI: oSelectedKPI.ModelURI,
                defaultCountMode: CountMode.None
            });
            sModelName =
                CommonUtils._getLayerNamespace() +
                ".kpi_card_model_" +
                getTrimmedDataURIName(oSelectedKPI.ODataURI);
        }
        // TODO: In case of error's show no preview card instead
        if (oModel && !!sModelName) {
            oManifest.cards[sManifestCardId].model = sModelName;
            oView.setModel(oModel, sModelName);
        }
        // For Smart Charts if Donut or time series then change template to analytical
        oManifest.cards[sManifestCardId] = oMainComponent._getTemplateForChart(oManifest.cards[sManifestCardId]);

        oView.getController()._oManifest = oManifest;
        if (oSettingsUtils.bNewKPICardFlag) {
            oModel
                .getMetaModel()
                .loaded()
                .then(
                    function () {
                        var oPromise = OVPCardAsAPIUtils.createCardComponent(oView, oManifest, "dialogCard");
                        oPromise
                            .then(function () {
                                oView.setBusy(false);
                            })
                            .catch(function () {
                                setErrorMessage(
                                    oManifest.cards[sManifestCardId].settings,
                                    "OVP_KEYUSER_ANNOTATION_FAILURE"
                                );
                                createErrorCard(oView, oManifest, sManifestCardId);
                            });
                    },
                    function (oError) {
                        oLogger.error(oError);
                    }
                );
            oModel.attachMetadataFailed(function () {
                setErrorMessage(oManifest.cards[sManifestCardId].settings, "OVP_KEYUSER_METADATA_FAILURE");
                createErrorCard(oView, oManifest, sManifestCardId);
            });
        } else {
            OVPCardAsAPIUtils.createCardComponent(oView, oManifest, "dialogCard");
        }
    }

    function setDataSources(sAnnoKey, sURI) {
        if (!this.oNewDataSources[sAnnoKey]) {
            this.oNewDataSources[sAnnoKey] = {
                uri: sURI
            };
        }
    }

    function removeDataSources(sAnnoKey) {
        if (this.oNewDataSources[sAnnoKey]) {
            delete this.oNewDataSources[sAnnoKey];
        }
    }

    function getDataSources(sAnnoKey) {
        var oAppComponent = this.oAppComponent,
            oDataSources = oAppComponent.getManifestEntry("sap.app").dataSources;

        if (this.oNewDataSources[sAnnoKey]) {
            return this.oNewDataSources;
        }

        return oDataSources;
    }

    function getTrimmedDataURIName(sDataURI) {
        var aSplitName = sDataURI.split("/");
        return aSplitName[aSplitName.length - 1]
            ? aSplitName[aSplitName.length - 1]
            : aSplitName[aSplitName.length - 2];
    }

    function createErrorCard(oSettingDialog, oManifest, sCardId) {
        var oModel = oSettingDialog.getModel();
        var bODataV4 = CommonUtils.isODataV4(oModel);
        var sTemplateName = bODataV4 ? 'sap.ovp.cards.v4.error' : 'sap.ovp.cards.error';
        oManifest.cards[sCardId].template = sTemplateName;
        oManifest.cards[sCardId].model = undefined;
        var oPromise = OVPCardAsAPIUtils.createCardComponent(oSettingDialog, oManifest, "dialogCard");
        var oController = oSettingDialog.getController();
        oPromise
            .then(function () {
                oSettingDialog.setBusy(false);
                oController.setBusy(false);
            })
            .catch(function () {
                oSettingDialog.setBusy(false);
                oController.setBusy(false);
            });
    }

    function setErrorMessage(oCardProperties, sMessage) {
        if (oCardProperties) {
            oCardProperties.errorStatusText = OvpResources.getText(sMessage);
        }
    }

    function getQualifier(sAnnotationPath) {
        if (sAnnotationPath.indexOf("#") !== -1) {
            return sAnnotationPath.split("#")[1];
        } else {
            return "Default";
        }
    }

    function checkForEmptyString(sValue, sLabel) {
        if (sValue) {
            var aTemp, sPropertyName, sResourceModelName;
            if (sValue.indexOf("{") === 0 && sValue.indexOf("}") === sValue.length - 1) {
                sValue = sValue.slice(1, -1);
                if (sValue.indexOf(">") != -1) {
                    aTemp = sValue.split(">");
                    sResourceModelName = aTemp[0];
                    sPropertyName = aTemp[1];
                } else if (sValue.indexOf("&gt;") != -1) {
                    aTemp = sValue.split("&gt;");
                    sResourceModelName = aTemp[0];
                    sPropertyName = aTemp[1];
                }
                if (!!sPropertyName && sResourceModelName === "@i18n" && oSettingsUtils.oi18nModel) {
                    return oSettingsUtils.oi18nModel.getProperty(sPropertyName);
                } else {
                    return sValue;
                }
            } else {
                return sValue;
            }
        } else {
            return sLabel;
        }
    }

    function getLabelWithPropertyName(sKey, oEntityType, sPropertyName, sLabel) {
        if (oEntityType[sKey] && oEntityType[sKey][sPropertyName]) {
            var sPropertyValue =
                typeof oEntityType[sKey][sPropertyName] === "string"
                    ? oEntityType[sKey][sPropertyName]
                    : oEntityType[sKey][sPropertyName].String; // OData V4 property value is string
            return checkForEmptyString(sPropertyValue, sLabel);
        } else {
            return sLabel;
        }
    }

    function getAnnotationLabel(oEntityType, sKey) {
        var sAnnotationQualifier = getQualifier(sKey),
            sLabel = OvpResources.getText("OVP_KEYUSER_LABEL_DEFAULT_LABEL_WITH_QUALIFIER", [sAnnotationQualifier]);
        sLabel = sLabel ? sLabel : sAnnotationQualifier;
        if (sKey.indexOf(",") !== -1) {
            sKey = sKey.split(",")[0];
        }
        if (sKey.indexOf(".Identification") !== -1) {
            if (oEntityType[sKey]) {
                var aRecords = AnnotationHelper.sortCollectionByImportance(oEntityType[sKey]);
                for (var index = 0; index < aRecords.length; index++) {
                    var oItem = aRecords[index];
                    if (oItem.RecordType === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
                        if (oItem && oItem["Label"]) {
                            return checkForEmptyString(oItem["Label"].String, sLabel);
                        } else {
                            return oItem["SemanticObject"].String + "-" + oItem["Action"].String;
                        }
                    }
                    if (oItem.RecordType === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") {
                        if (oItem && oItem["Label"]) {
                            return checkForEmptyString(oItem["Label"].String, sLabel);
                        } else {
                            return oItem["Url"].String;
                        }
                    }
                }
            }
            return OvpResources.getText("OVP_KEYUSER_LABEL_NO_NAVIGATION");
        } else if (sKey.indexOf(".LineItem") !== -1) {
            var aAnnotations = AnnotationHelper.sortCollectionByImportance(oEntityType[sKey]);
            aAnnotations.forEach(function (oAnnotation, index) {
                if (
                    oAnnotation["RecordType"] &&
                    oAnnotation["RecordType"].indexOf(".DataField") !== -1 &&
                    oAnnotation["Label"]
                ) {
                    aAnnotations[index]["Label"] = {
                        String: checkForEmptyString(oAnnotation["Label"].String, sLabel)
                    };
                }
            });
            return aAnnotations;
        } else if (sKey.indexOf(".HeaderInfo") !== -1) {
            if (oEntityType[sKey] && oEntityType[sKey]["Description"] && oEntityType[sKey]["Description"].Label) {
                return checkForEmptyString(oEntityType[sKey]["Description"].Label.String, sLabel);
            } else {
                return sLabel;
            }
        } else if (
            sKey.indexOf(".PresentationVariant") !== -1 ||
            sKey.indexOf(".SelectionVariant") !== -1 ||
            sKey.indexOf(".SelectionPresentationVariant") !== -1
        ) {
            return getLabelWithPropertyName(sKey, oEntityType, "Text", sLabel);
        } else if (sKey.indexOf(".DataPoint") !== -1) {
            return getLabelWithPropertyName(sKey, oEntityType, "Title", sLabel);
        } else if (sKey.indexOf(".Chart") !== -1) {
            return getLabelWithPropertyName(sKey, oEntityType, "Description", sLabel);
        } else if (sKey.indexOf(".FieldGroup") !== -1) {
            return getLabelWithPropertyName(sKey, oEntityType, "Label", sLabel);
        } else {
            var sLabelQualifier = "";
            if (sAnnotationQualifier !== "Default") {
                sLabelQualifier = "#" + sAnnotationQualifier;
            }
            var sLabelName = "com.sap.vocabularies.Common.v1.Label" + sLabelQualifier;
            if (oEntityType[sKey] && oEntityType[sKey][sLabelName]) {
                return checkForEmptyString(oEntityType[sKey][sLabelName].String, sLabel);
            } else {
                return sLabel;
            }
        }
    }

    function getAnnotationLabelV4(oEntityType, sKey) {
        var sAnnotationQualifier = getQualifier(sKey),
            sLabel = OvpResources.getText("OVP_KEYUSER_LABEL_DEFAULT_LABEL_WITH_QUALIFIER", [sAnnotationQualifier]);

        sLabel = sLabel ? sLabel : sAnnotationQualifier;
        if (sKey.indexOf(",") !== -1) {
            sKey = sKey.split(",")[0];
        }
        if (sKey.indexOf(".Identification") !== -1) {
            if (oEntityType[sKey]) {
                var aRecords = AnnotationHelper.sortCollectionByImportance(oEntityType[sKey]);
                for (var i = 0; i < aRecords.length; i++) {
                    var oItem = aRecords[i];
                    if (oItem.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
                        if (oItem && oItem["Label"]) {
                            return checkForEmptyString(oItem["Label"], sLabel);
                        } else {
                            return oItem["SemanticObject"] + "-" + oItem["Action"];
                        }
                    }
                    if (oItem.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") {
                        if (oItem && oItem["Label"]) {
                            return checkForEmptyString(oItem["Label"], sLabel);
                        } else {
                            return oItem["Url"];
                        }
                    }
                }
            }
            return OvpResources.getText("OVP_KEYUSER_LABEL_NO_NAVIGATION");
        } else if (sKey.indexOf(".LineItem") !== -1) {
            var aRecords = AnnotationHelper.sortCollectionByImportance(oEntityType[sKey]);
            aRecords.forEach(function (oRecord, i) {
                if (oRecord["$Type"] && oRecord["$Type"].indexOf(".DataField") !== -1 && oRecord["Label"]) {
                    aRecords[i]["Label"] = checkForEmptyString(oRecord["Label"], sLabel);
                }
            });
            return aRecords;
        } else if (sKey.indexOf(".HeaderInfo") !== -1) {
            if (oEntityType[sKey] && oEntityType[sKey]["Description"] && oEntityType[sKey]["Description"].Label) {
                return checkForEmptyString(oEntityType[sKey]["Description"].Label, sLabel);
            } else {
                return sLabel;
            }
        } else if (
            sKey.indexOf(".PresentationVariant") !== -1 ||
            sKey.indexOf(".SelectionVariant") !== -1 ||
            sKey.indexOf(".SelectionPresentationVariant") !== -1
        ) {
            return getLabelWithPropertyName(sKey, oEntityType, "Text", sLabel);
        } else if (sKey.indexOf(".DataPoint") !== -1) {
            return getLabelWithPropertyName(sKey, oEntityType, "Title", sLabel);
        } else if (sKey.indexOf(".Chart") !== -1) {
            return getLabelWithPropertyName(sKey, oEntityType, "Description", sLabel);
        } else if (sKey.indexOf(".FieldGroup") !== -1) {
            return getLabelWithPropertyName(sKey, oEntityType, "Label", sLabel);
        } else {
            var sLabelQualifier = "";
            if (sAnnotationQualifier !== "Default") {
                sLabelQualifier = "#" + sAnnotationQualifier;
            }
            var sLabelName = "com.sap.vocabularies.Common.v1.Label" + sLabelQualifier;
            if (oEntityType[sKey] && oEntityType[sKey][sLabelName]) {
                return checkForEmptyString(oEntityType[sKey][sLabelName], sLabel);
            } else {
                return sLabel;
            }
        }
    }

    function checkIfCardTemplateHasProperty(sTemplate, sType, cardType) {
        switch (sType) {
            case "cardPreview":
                return OVPCardAsAPIUtils.getSupportedCardTypes().indexOf(sTemplate) !== -1;
            case "noOfRows":
            case "noOfColumns":
            case "stopResizing":
                var aCardTypeWithNoResize = ["sap.ovp.cards.stack"];
                return aCardTypeWithNoResize.indexOf(sTemplate) === -1;
            case "listType":
            case "listFlavor":
                var aCardTypeForListType = ["sap.ovp.cards.list", "sap.ovp.cards.v4.list"];
                return aCardTypeForListType.indexOf(sTemplate) !== -1;
            case "listFlavorForLinkList":
                var aCardTypeForListFlavorForLinkList = ["sap.ovp.cards.linklist", "sap.ovp.cards.v4.linklist"];
                return aCardTypeForListFlavorForLinkList.indexOf(sTemplate) !== -1;
            case "isViewSwitchSupportedCard":
            case "showViewSwitch":
            case "kpiHeader":
                var aCardTypeForKPI = [
                    "sap.ovp.cards.list",
                    "sap.ovp.cards.table",
                    "sap.ovp.cards.v4.list",
                    "sap.ovp.cards.v4.table",
                    "sap.ovp.cards.charts.analytical",
                    "sap.ovp.cards.charts.smart.chart",
                    "sap.ovp.cards.charts.bubble",
                    "sap.ovp.cards.charts.donut",
                    "sap.ovp.cards.charts.line"
                ];
                return aCardTypeForKPI.indexOf(sTemplate) !== -1;
            case "chartSPVorKPI":
            case "chart":
                var aCardTypeForChart = [
                    "sap.ovp.cards.charts.analytical",
                    "sap.ovp.cards.charts.smart.chart",
                    "sap.ovp.cards.charts.bubble",
                    "sap.ovp.cards.charts.donut",
                    "sap.ovp.cards.charts.line"
                ];
                return aCardTypeForChart.indexOf(sTemplate) !== -1;
            case "sortOrder":
            case "sortBy":
            case "lineItem":
                if (!cardType) {
                    var aCardTypeForLineItem = [
                        "sap.ovp.cards.list",
                        "sap.ovp.cards.table",
                        "sap.ovp.cards.v4.list",
                        "sap.ovp.cards.v4.table"
                    ];
                    return aCardTypeForLineItem.indexOf(sTemplate) !== -1;
                } else {
                    var aCardTypeForLineItem = [
                        "sap.ovp.cards.list",
                        "sap.ovp.cards.table",
                        "sap.ovp.cards.v4.list",
                        "sap.ovp.cards.v4.table",
                        "sap.ovp.cards.charts.analytical",
                        "sap.ovp.cards.linklist",
                        "sap.ovp.cards.v4.linklist",
                        "sap.ovp.cards.stack"
                    ];
                    return aCardTypeForLineItem.indexOf(sTemplate) !== -1;
                }
                break;
            case "identification":
                // Temporarily removing identification setting for stack cards
                var aCardTypeForIdentification = ["sap.ovp.cards.stack"];
                return aCardTypeForIdentification.indexOf(sTemplate) !== -1;
            case "addViewSwitch":
                var aCardTypeForViewSwitch = [
                    "sap.ovp.cards.list",
                    "sap.ovp.cards.table",
                    "sap.ovp.cards.v4.list",
                    "sap.ovp.cards.v4.table"
                ];
                return aCardTypeForViewSwitch.indexOf(sTemplate) !== -1;
            case "addKPIHeader":
                var aCardTypeForViewSwitch = [
                    "sap.ovp.cards.list",
                    "sap.ovp.cards.table",
                    "sap.ovp.cards.v4.list",
                    "sap.ovp.cards.v4.table",
                    "sap.ovp.cards.charts.analytical"
                ];
                return aCardTypeForViewSwitch.indexOf(sTemplate) !== -1;
            case "selecionOrPresentation":
                var aCardTypeForSV = [
                    "sap.ovp.cards.list",
                    "sap.ovp.cards.table",
                    "sap.ovp.cards.v4.list",
                    "sap.ovp.cards.v4.table",
                    "sap.ovp.cards.linklist",
                    "sap.ovp.cards.v4.linklist"
                ];
                return aCardTypeForSV.indexOf(sTemplate) !== -1;
            case "addODataSelect":
                var aCardTypeForODataSelect = [
                    "sap.ovp.cards.list",
                    "sap.ovp.cards.table",
                    "sap.ovp.cards.v4.list",
                    "sap.ovp.cards.v4.table",
                    "sap.ovp.cards.stack"
                ];
                return aCardTypeForODataSelect.indexOf(sTemplate) !== -1;
            case "addCustomActions":
                var aCardTypeForODataSelect = ["sap.ovp.cards.stack"];
                return aCardTypeForODataSelect.indexOf(sTemplate) !== -1;
            case "setCardProperties":
                if (cardType) {
                    var aCardTypeForLineItem = [
                        "sap.ovp.cards.list",
                        "sap.ovp.cards.table",
                        "sap.ovp.cards.v4.list",
                        "sap.ovp.cards.v4.table",
                        "sap.ovp.cards.linklist",
                        "sap.ovp.cards.v4.linklist",
                        "sap.ovp.cards.stack"
                    ];
                    return aCardTypeForLineItem.indexOf(sTemplate) !== -1;
                }
                break;
            default:
                break;
        }
    }

    function checkIfKPIAnnotation(oCardProperties) {
        return !!oCardProperties.kpiAnnotationPath;
    }

    function checkIfSPVAnnotation(oCardProperties) {
        return !!oCardProperties.selectionPresentationAnnotationPath;
    }

    function checkIfSPVOrKPIAnnotation(oCardProperties) {
        return checkIfSPVAnnotation(oCardProperties) || checkIfKPIAnnotation(oCardProperties);
    }

    function checkClonedCard(cardId) {
        return cardId.substring(cardId.lastIndexOf("_") + 1, cardId.length).indexOf("C") !== -1;
    }

    function checkIfNewKPICard(oCardProperties) {
        // To check the KPI Card both in add and edit scenario since card Id is generated only when card is saved.
        if (oCardProperties.NewKPICard) {
            return oCardProperties.NewKPICard;
        } else if (oCardProperties.selectedKPICardID) {
            return oCardProperties.selectedKPICardID.indexOf("newKPICard") !== -1;
        } else {
            return false;
        }
    }

    function getVisibilityOfElement(oCardProperties, sElement, isViewSwitchEnabled, iIndex) {
        var showMainFields = true;
        var showSubFields = true;
        var bEntitySelected = false;
        var bModelSelected = false;
        var bCardSelected = false;

        if (isViewSwitchEnabled) {
            if (oCardProperties.mainViewSelected) {
                showSubFields = false;
            } else {
                showMainFields = false;
            }
        }

        if (oCardProperties.addNewCard && oCardProperties.model) {
            var bModelSelected = true;
            if (oCardProperties.template) {
                bCardSelected = true;
                if (oCardProperties.entitySet) {
                    bEntitySelected = true;
                }
            }
        }

        var sDataPointAnnotationPath = getDataPointAnnotationPath(oCardProperties);
        var sDataPointAnnotationPathKey = sDataPointAnnotationPath && sDataPointAnnotationPath.substring(1);
        var oDataPoint = oCardProperties.entityType && oCardProperties.entityType[sDataPointAnnotationPathKey];
        var sImproveDirection = oDataPoint && oDataPoint.CriticalityCalculation && oDataPoint.CriticalityCalculation.ImprovementDirection && oDataPoint.CriticalityCalculation.ImprovementDirection.EnumMember;
        var aTabs = oCardProperties.tabs || [];
        var iSelectedKey = parseInt(oCardProperties["selectedKey"], 10);
        var oCardPropsOfTabSelected;
        if (iSelectedKey) {
            oCardPropsOfTabSelected = aTabs[iSelectedKey - 1];
        }
        
        var bVisibilityValue;
        switch (sElement) {
            case "cardPreview":
                bVisibilityValue = checkIfCardTemplateHasProperty(oCardProperties.template, "cardPreview");
                break;
            case "noOfRows":
            case "noOfColumns":
            case "stopResizing":
                bVisibilityValue = showMainFields && checkIfCardTemplateHasProperty(oCardProperties.template, sElement);
                break;
            case "title":
                bVisibilityValue = showMainFields;
                break;
            case "dynamicSwitchSubTitle":
                bVisibilityValue = showMainFields && !!oCardProperties.dynamicSubTitle;
                break;
            case "enableAddToInsights":
                bVisibilityValue = showMainFields && !!oCardProperties.enableAddToInsights;
                    break;
            case "dynamicSwitchStateSubTitle":
                bVisibilityValue = !!oCardProperties.dynamicSubtitleAnnotationPath;
                break;
            case "toleranceRangeHighValue":
                bVisibilityValue = getThresholdVisibility("toleranceRangeHighValue", oCardPropsOfTabSelected, oCardProperties, sImproveDirection);
                break;
            case "toleranceRangeLowValue":
                bVisibilityValue = getThresholdVisibility("toleranceRangeLowValue", oCardPropsOfTabSelected, oCardProperties, sImproveDirection);
                break;
            case "deviationRangeHighValue":
                bVisibilityValue = getThresholdVisibility("deviationRangeHighValue", oCardPropsOfTabSelected, oCardProperties, sImproveDirection);
                break;
            case "deviationRangeLowValue":
                bVisibilityValue = getThresholdVisibility("deviationRangeLowValue", oCardPropsOfTabSelected, oCardProperties, sImproveDirection);
                break;
            case "subTitle":
                if (!oCardProperties.addNewCard) {
                    if (!oCardProperties.subTitle) {
                        oCardProperties.subTitle = " ";
                        bVisibilityValue = true;
                    } else {
                        bVisibilityValue = showMainFields && !oCardProperties.dynamicSubtitleAnnotationPath;
                    }
                } else {
                    bVisibilityValue = showMainFields;
                }
                break;
            case "dynamicSubTitle":
                bVisibilityValue = showMainFields && !!oCardProperties.dynamicSubtitleAnnotationPath;
                break;
            case "valueSelectionInfo":
                if (!oCardProperties.addNewCard) {
                    if (!oCardProperties.valueSelectionInfo) {
                        oCardProperties.valueSelectionInfo = " ";
                    }
                    bVisibilityValue =
                        showMainFields &&
                        checkIfCardTemplateHasProperty(oCardProperties.template, "kpiHeader") &&
                        !!oCardProperties.dataPointAnnotationPath &&
                        !checkIfNewKPICard(oCardProperties);
                } else {
                    bVisibilityValue =
                        showMainFields &&
                        bModelSelected &&
                        bCardSelected &&
                        bEntitySelected &&
                        oCardProperties.addKPIHeaderCheckBox &&
                        checkIfCardTemplateHasProperty(oCardProperties.template, "addKPIHeader");
                }
                break;
            case "dataPoint":
                if (!oCardProperties.addNewCard) {
                    bVisibilityValue =
                        showSubFields &&
                        !checkIfKPIAnnotation(oCardProperties) &&
                        checkIfCardTemplateHasProperty(oCardProperties.template, "kpiHeader") &&
                        !!oCardProperties.dataPointAnnotationPath;
                } else {
                    bVisibilityValue =
                        showSubFields &&
                        bModelSelected &&
                        bCardSelected &&
                        bEntitySelected &&
                        oCardProperties.addKPIHeaderCheckBox &&
                        checkIfCardTemplateHasProperty(oCardProperties.template, "addKPIHeader");
                }
                break;
            case "listType":
            case "listFlavor":
            case "listFlavorForLinkList":
                if (!oCardProperties.addNewCard) {
                    bVisibilityValue =
                        showMainFields && checkIfCardTemplateHasProperty(oCardProperties.template, sElement);
                } else {
                    bVisibilityValue =
                        showMainFields &&
                        bModelSelected &&
                        bCardSelected &&
                        bEntitySelected &&
                        checkIfCardTemplateHasProperty(oCardProperties.template, sElement);
                }
                break;
            case "identification":
                if (!oCardProperties.addNewCard) {
                    bVisibilityValue =
                        showSubFields &&
                        !oCardProperties.staticContent &&
                        !checkIfCardTemplateHasProperty(oCardProperties.template, sElement);
                } else {
                    bVisibilityValue =
                        showSubFields &&
                        bModelSelected &&
                        bCardSelected &&
                        bEntitySelected &&
                        !checkIfCardTemplateHasProperty(oCardProperties.template, sElement);
                }
                break;
            case "selectionPresentationVariant":
                if (!oCardProperties.addNewCard) {
                    bVisibilityValue =
                        showSubFields &&
                        checkIfSPVAnnotation(oCardProperties) &&
                        !checkIfKPIAnnotation(oCardProperties) &&
                        checkIfCardTemplateHasProperty(oCardProperties.template, "kpiHeader");
                } else {
                    bVisibilityValue =
                        showSubFields &&
                        bModelSelected &&
                        bCardSelected &&
                        bEntitySelected &&
                        checkIfCardTemplateHasProperty(oCardProperties.template, "selecionOrPresentation") &&
                        !!(
                            Array.isArray(oCardProperties.selectionPresentationVariant) &&
                            oCardProperties.selectionPresentationVariant.length
                        );
                }
                break;
            case "KPI":
            case "dataPointSelectionMode":
                if (!oCardProperties.addNewCard) {
                    bVisibilityValue =
                        showSubFields &&
                        checkIfKPIAnnotation(oCardProperties) &&
                        !checkIfSPVAnnotation(oCardProperties) &&
                        checkIfCardTemplateHasProperty(oCardProperties.template, "chart") &&
                        !checkIfNewKPICard(oCardProperties);
                } else {
                    bVisibilityValue =
                        showSubFields &&
                        bModelSelected &&
                        bCardSelected &&
                        bEntitySelected &&
                        checkIfCardTemplateHasProperty(oCardProperties.template, "chart");
                }
                break;
            case "presentationVariant":
            case "selectionVariant":
                if (!oCardProperties.addNewCard) {
                    bVisibilityValue =
                        showSubFields &&
                        !checkIfSPVOrKPIAnnotation(oCardProperties) &&
                        !oCardProperties.staticContent &&
                        checkIfCardTemplateHasProperty(oCardProperties.template, "kpiHeader");
                } else {
                    bVisibilityValue =
                        showSubFields &&
                        bModelSelected &&
                        bCardSelected &&
                        bEntitySelected &&
                        !(
                            Array.isArray(oCardProperties.selectionPresentationVariant) &&
                            oCardProperties.selectionPresentationVariant.length
                        ) &&
                        checkIfCardTemplateHasProperty(oCardProperties.template, "selecionOrPresentation");
                }
                break;
            case "kpiHeader":
                bVisibilityValue =
                    showMainFields &&
                    !checkIfKPIAnnotation(oCardProperties) &&
                    checkIfCardTemplateHasProperty(oCardProperties.template, sElement);
                break;
            case "lineItem":
            case "chart":
                if (!oCardProperties.addNewCard) {
                    bVisibilityValue =
                        showSubFields &&
                        !checkIfSPVOrKPIAnnotation(oCardProperties) &&
                        checkIfCardTemplateHasProperty(oCardProperties.template, sElement);
                } else {
                    bVisibilityValue =
                        showSubFields &&
                        bModelSelected &&
                        bCardSelected &&
                        bEntitySelected &&
                        checkIfCardTemplateHasProperty(
                            oCardProperties.template,
                            sElement,
                            oCardProperties.addNewCard
                        );
                }
                break;
            case "chartSPVorKPI":
                bVisibilityValue =
                    showSubFields &&
                    checkIfSPVOrKPIAnnotation(oCardProperties) &&
                    !checkIfNewKPICard(oCardProperties) &&
                    checkIfCardTemplateHasProperty(oCardProperties.template, sElement);
                break;
            case "presentationVariantSPVorKPI":
            case "selectionVariantSPVorKPI":
                bVisibilityValue =
                    showSubFields &&
                    checkIfSPVOrKPIAnnotation(oCardProperties) &&
                    !checkIfNewKPICard(oCardProperties) &&
                    !oCardProperties.staticContent &&
                    checkIfCardTemplateHasProperty(oCardProperties.template, "kpiHeader");
                break;
            case "showViewName":
                bVisibilityValue = isViewSwitchEnabled && showSubFields;
                break;
            case "showDefaultView":
                if (isViewSwitchEnabled && showSubFields) {
                    if (oCardProperties.defaultViewSelected != oCardProperties.selectedKey) {
                        bVisibilityValue = true;
                    }
                } else {
                    bVisibilityValue = false;
                }
                break;
            case "showEntitySet":
                if (isViewSwitchEnabled && showSubFields) {
                    if (
                        oCardProperties.selectedKey > 0 &&
                        oCardProperties.tabs[oCardProperties.selectedKey - 1].entitySet
                    ) {
                        bVisibilityValue = true;
                    } else {
                        bVisibilityValue = false;
                    }
                } else {
                    bVisibilityValue = false;
                }
                break;
            case "showMore":
            case "removeVisual":
            case "lineItemSubTitle":
            case "lineItemTitle":
            case "staticLink":
            case "links":
                var bFlag = (oCardProperties.template === "sap.ovp.cards.linklist" ||
                                oCardProperties.template === "sap.ovp.cards.v4.linklist") &&
                            !!oCardProperties.staticContent;
                if (sElement === "staticLink") {
                    bVisibilityValue = bFlag && !!oCardProperties.staticContent[iIndex].targetUri;
                } else if (sElement === "links") {
                    bVisibilityValue = bFlag && !!oCardProperties.staticContent[iIndex].semanticObject;
                } else if (sElement === "removeVisual") {
                    bVisibilityValue = bFlag &&
                            (!!oCardProperties.staticContent[iIndex].targetUri ||
                                !!oCardProperties.staticContent[iIndex].semanticObject);
                } else {
                    bVisibilityValue = bFlag;
                }
                break;
            case "selectCardType":
                bVisibilityValue = showMainFields && bModelSelected;
                break;
            case "addKPIHeader":
                bVisibilityValue =
                    showMainFields &&
                    bModelSelected &&
                    bCardSelected &&
                    checkIfCardTemplateHasProperty(oCardProperties.template, sElement);
                break;
            case "setEntitySet":
                bVisibilityValue = showSubFields && bModelSelected && bCardSelected;
                break;
            case "setCardProperties":
                bVisibilityValue =
                    showMainFields &&
                    bModelSelected &&
                    bCardSelected &&
                    bEntitySelected &&
                    checkIfCardTemplateHasProperty(oCardProperties.template, sElement, oCardProperties.addNewCard);
                break;
            case "setGeneralCardProperties":
                bVisibilityValue = showMainFields && bModelSelected && bCardSelected && bEntitySelected;
                break;
            case "setAnnotationCardProperties":
                bVisibilityValue = showSubFields && bModelSelected && bCardSelected && bEntitySelected;
                break;
            case "subTitleRequired":
                bVisibilityValue =
                    bModelSelected && bCardSelected && bEntitySelected && oCardProperties.addKPIHeaderCheckBox;
                break;
            case "addODataSelect":
                if (!oCardProperties.addNewCard) {
                    bVisibilityValue =
                        showSubFields && checkIfCardTemplateHasProperty(oCardProperties.template, sElement);
                } else {
                    bVisibilityValue =
                        showSubFields &&
                        bModelSelected &&
                        bCardSelected &&
                        bEntitySelected &&
                        checkIfCardTemplateHasProperty(oCardProperties.template, sElement);
                }
                break;
            case "isViewSwitchSupportedCard":
            case "showViewSwitch":
                bVisibilityValue =
                    bModelSelected &&
                    bCardSelected &&
                    (bEntitySelected || !!oCardProperties.showViewSwitchButton) &&
                    checkIfCardTemplateHasProperty(oCardProperties.template, sElement);
                break;
            case "dataSource":
                bVisibilityValue = showMainFields;
                break;
            case "dataSourceExisting":
                bVisibilityValue = !oCardProperties.newDataSource;
                break;
            case "dataSourceNew":
                bVisibilityValue = oCardProperties.newDataSource;
                break;
            case "addCustomActions":
                bVisibilityValue =
                    showMainFields && checkIfCardTemplateHasProperty(oCardProperties.template, sElement);
                break;
            default:
                break;
        }
        return bVisibilityValue;
    }

    /**
     * Determines the visibility of a threshold property based on the provided parameters.
     *
     * @param {string} propName - The name of the property to check for visibility.
     * @param {Object} oCardPropsOfTabSelected - The card properties of the selected tab, if applicable.
     * @param {Object} oCardProperties - The general card properties.
     * @param {string} sImproveDirection - The improvement direction indicator.
     * @returns {boolean} - Returns `true` if the threshold property is visible, otherwise `false`.
     */
    function getThresholdVisibility(propName, oCardPropsOfTabSelected, oCardProperties, sImproveDirection) {
        if (oCardPropsOfTabSelected) {
            return !!sImproveDirection && !!oCardPropsOfTabSelected[propName];
        } else {
            return !!sImproveDirection && !!oCardProperties[propName];
        }
    }

    function setVisibilityForFormElements(oCardProperties) {
        // setting Visibility for Form Elements in settingDialog
        var isViewSwitchEnabled = false;
        this.oVisibility.viewSwitchEnabled = false;
        this.oVisibility.showViewSwitch = false;
        if (!this.bAddNewCardFlag) {
            if (
                checkIfCardTemplateHasProperty(oCardProperties.template, "isViewSwitchSupportedCard") &&
                !checkIfNewKPICard(oCardProperties)
            ) {
                if (oCardProperties.tabs && oCardProperties.tabs.length) {
                    isViewSwitchEnabled = true;
                    this.oVisibility.showViewSwitch = true;
                }
                this.oVisibility.viewSwitchEnabled = true;
            }
        } else {
            if (oCardProperties.tabs && oCardProperties.tabs.length) {
                isViewSwitchEnabled = true;
                this.oVisibility.showViewSwitch = getVisibilityOfElement(oCardProperties, "showViewSwitch");
            }
            this.oVisibility.viewSwitchEnabled = getVisibilityOfElement(
                oCardProperties,
                "isViewSwitchSupportedCard"
            );
        }

        this.oVisibility.cardPreview = getVisibilityOfElement(oCardProperties, "cardPreview");
        this.oVisibility.stopResizing = getVisibilityOfElement(
            oCardProperties,
            "stopResizing",
            isViewSwitchEnabled
        );
        this.oVisibility.toleranceRangeHighValue = getVisibilityOfElement(oCardProperties, "toleranceRangeHighValue", isViewSwitchEnabled);
        this.oVisibility.toleranceRangeLowValue = getVisibilityOfElement(oCardProperties, "toleranceRangeLowValue", isViewSwitchEnabled);
        this.oVisibility.deviationRangeHighValue = getVisibilityOfElement(oCardProperties, "deviationRangeHighValue", isViewSwitchEnabled);
        this.oVisibility.deviationRangeLowValue = getVisibilityOfElement(oCardProperties, "deviationRangeLowValue", isViewSwitchEnabled);

        this.oVisibility.noOfRows = getVisibilityOfElement(oCardProperties, "noOfRows", isViewSwitchEnabled);
        this.oVisibility.noOfColumns = getVisibilityOfElement(oCardProperties, "noOfColumns", isViewSwitchEnabled);
        this.oVisibility.title = getVisibilityOfElement(oCardProperties, "title", isViewSwitchEnabled);
        this.oVisibility.subTitle = getVisibilityOfElement(oCardProperties, "subTitle", isViewSwitchEnabled);
        this.oVisibility.valueSelectionInfo = getVisibilityOfElement(
            oCardProperties,
            "valueSelectionInfo",
            isViewSwitchEnabled
        );
        this.oVisibility.listType = getVisibilityOfElement(oCardProperties, "listType", isViewSwitchEnabled);
        this.oVisibility.listFlavor = getVisibilityOfElement(oCardProperties, "listFlavor", isViewSwitchEnabled);
        this.oVisibility.listFlavorForLinkList = getVisibilityOfElement(
            oCardProperties,
            "listFlavorForLinkList",
            isViewSwitchEnabled
        );
        if (
            (oCardProperties.template === "sap.ovp.cards.linklist" ||
                oCardProperties.template === "sap.ovp.cards.v4.linklist") &&
            !!oCardProperties.staticContent
        ) {
            var aStaticContent = oCardProperties.staticContent,
                oVisibleStaticLink = {},
                oVisibleLinks = {},
                oVisibleRemoveVisual = {},
                oVisibleShowMore = {};
            for (var index = 0; index < aStaticContent.length; index++) {
                var sId = aStaticContent[index].index;
                oVisibleStaticLink[sId] = getVisibilityOfElement(oCardProperties, "staticLink", null, index);
                oVisibleLinks[sId] = getVisibilityOfElement(oCardProperties, "links", null, index);
                oVisibleRemoveVisual[sId] = getVisibilityOfElement(oCardProperties, "removeVisual", null, index);
                oVisibleShowMore[sId] = getVisibilityOfElement(oCardProperties, "showMore", null, index);
            }
            this.oVisibility.staticLink = oVisibleStaticLink;
            this.oVisibility.links = oVisibleLinks;
            this.oVisibility.removeVisual = oVisibleRemoveVisual;
            this.oVisibility.showMore = oVisibleShowMore;
        }
        this.oVisibility.lineItemTitle = getVisibilityOfElement(oCardProperties, "lineItemTitle");
        this.oVisibility.lineItemSubTitle = getVisibilityOfElement(oCardProperties, "lineItemSubTitle");
        this.oVisibility.showViewName = getVisibilityOfElement(
            oCardProperties,
            "showViewName",
            isViewSwitchEnabled
        );
        this.oVisibility.showDefaultView = getVisibilityOfElement(
            oCardProperties,
            "showDefaultView",
            isViewSwitchEnabled
        );
        this.oVisibility.showEntitySet = getVisibilityOfElement(
            oCardProperties,
            "showEntitySet",
            isViewSwitchEnabled
        );
        this.aVariantNames.forEach(
            function (oVariantName) {
                this.oVisibility[oVariantName.sPath] =
                    getVisibilityOfElement(oCardProperties, oVariantName.sPath, isViewSwitchEnabled) &&
                    !!oCardProperties[oVariantName.sPath] &&
                    !!oCardProperties[oVariantName.sPath].length;
            }.bind(this)
        );
        this.oVisibility.kpiHeader =
            getVisibilityOfElement(oCardProperties, "kpiHeader", isViewSwitchEnabled) &&
            !!oCardProperties["dataPoint"] &&
            !!oCardProperties["dataPoint"].length;
        this.oVisibility.dynamicSwitchSubTitle = getVisibilityOfElement(
            oCardProperties,
            "dynamicSwitchSubTitle",
            isViewSwitchEnabled
        );
        this.oVisibility.dynamicSwitchStateSubTitle = getVisibilityOfElement(
            oCardProperties,
            "dynamicSwitchStateSubTitle",
            isViewSwitchEnabled
        );
        this.oVisibility.dataSource = getVisibilityOfElement(oCardProperties, "dataSource", isViewSwitchEnabled);
        this.oVisibility.dataSourceExisting = getVisibilityOfElement(
            oCardProperties,
            "dataSourceExisting",
            isViewSwitchEnabled
        );
        this.oVisibility.dataSourceNew = getVisibilityOfElement(
            oCardProperties,
            "dataSourceNew",
            isViewSwitchEnabled
        );
        this.oVisibility.selectCardType = getVisibilityOfElement(
            oCardProperties,
            "selectCardType",
            isViewSwitchEnabled
        );
        this.oVisibility.addKPIHeader = getVisibilityOfElement(
            oCardProperties,
            "addKPIHeader",
            isViewSwitchEnabled
        );
        this.oVisibility.setEntitySet = getVisibilityOfElement(
            oCardProperties,
            "setEntitySet",
            isViewSwitchEnabled
        );
        this.oVisibility.setCardProperties = getVisibilityOfElement(
            oCardProperties,
            "setCardProperties",
            isViewSwitchEnabled
        );
        this.oVisibility.setGeneralCardProperties = getVisibilityOfElement(
            oCardProperties,
            "setGeneralCardProperties",
            isViewSwitchEnabled
        );
        this.oVisibility.subTitleRequired = getVisibilityOfElement(
            oCardProperties,
            "subTitleRequired",
            isViewSwitchEnabled
        );
        this.oVisibility.dataPointSelectionMode = getVisibilityOfElement(
            oCardProperties,
            "dataPointSelectionMode",
            isViewSwitchEnabled
        );
        var bSetAnnotationCardProperties;
        for (var index = 0; index < this.aVisiblePropertiesForAnnotation.length; index++) {
            if (this.oVisibility[this.aVisiblePropertiesForAnnotation[index].sProperty]) {
                bSetAnnotationCardProperties = true;
                break;
            }
        }
        this.oVisibility.setAnnotationCardProperties = bSetAnnotationCardProperties
            ? getVisibilityOfElement(oCardProperties, "setAnnotationCardProperties", isViewSwitchEnabled)
            : false;
        this.oVisibility.addODataSelect = getVisibilityOfElement(
            oCardProperties,
            "addODataSelect",
            isViewSwitchEnabled
        );
        this.oVisibility.addCustomActions = getVisibilityOfElement(
            oCardProperties,
            "addCustomActions",
            isViewSwitchEnabled
        );
        this.oVisibility.moveToTheTop = false;
        this.oVisibility.moveUp = false;
        this.oVisibility.moveDown = false;
        this.oVisibility.moveToTheBottom = false;
        this.oVisibility.delete = false;
    }

    function setIndicesToStaticLinkList(oCardPropertiesModel) {
        var aStaticContent = oCardPropertiesModel.getProperty("/staticContent");
        for (var index = 0; index < aStaticContent.length; index++) {
            aStaticContent[index].index = "Index--" + (index + 1);
        }
        oCardPropertiesModel.setProperty("/staticContent", aStaticContent);
    }

    function getViewCounter(aViewNameParts) {
        var iIndex = 0;
        for (var i = aViewNameParts.length - 1; i >= 0; i--) {
            if (/^\d+$/.test(aViewNameParts[i])) {
                iIndex = parseInt(aViewNameParts[i], 10);
                break;
            }
        }
        return iIndex;
    }

    function addManifestSettings(oData) {
        var oModel = oData && oData.metaModel && oData.metaModel.oModel;
        var bIsOdataV4 = CommonUtils.isODataV4(oModel);
        var iSelectedKey = parseInt(oData.selectedKey, 10);

        if (oData.lineItem) {
            oData.lineItem.forEach(function (item) {
                if (
                    (bIsOdataV4 && item.value === "@" + oData.annotationPath) ||
                    item.value === oData.annotationPath
                ) {
                    oData.lineItemQualifier = item.name;
                }
            });
        }

        if (oData.tabs && oData.tabs.length && iSelectedKey) {
            oData.viewName = oData.tabs[iSelectedKey - 1].value;
            oData.isDefaultView = false;
            if (iSelectedKey === oData.defaultViewSelected) {
                oData.isDefaultView = true;
            }
        }

        var sortOrder = oData.sortOrder;
        oData.sortOrder = "descending";
        if (sortOrder && sortOrder.toLowerCase() !== "descending") {
            oData.sortOrder = "ascending";
        }

        oData.isExtendedList = false;
        if (oData.listType === "extended") {
            oData.isExtendedList = true;
        }

        oData.bInsightsEnable = false;
        if (oData.enableAddToInsights) {
            oData.bInsightsEnable = true;
        }

        var bHasSemanticColoring = hasSemanticColoring(oData);
        var sDataPointAnnotationPath = getDataPointAnnotationPath(oData);

        if (
            bHasSemanticColoring &&
            sDataPointAnnotationPath
        ) {
            var sDataPointAnnotationPathKey = sDataPointAnnotationPath.substring(1);
            var oDataPoint = oData.entityType && oData.entityType[sDataPointAnnotationPathKey];
            var oDataSelected = oData;
            if (oData.tabs && oData.tabs.length) {
                if (iSelectedKey === 0) {
                    oDataSelected = oData.tabs[oData.defaultViewSelected - 1];
                } else {
                    oDataSelected = oData.tabs[iSelectedKey - 1];
                }
            }

            updateODataWithThresholdValues(oDataSelected, oDataPoint);
            
            var sThresholdKeys = ["deviationRangeLowValue", "deviationRangeHighValue", "toleranceRangeLowValue", "toleranceRangeHighValue"];
            if (oData.tabs && oData.tabs.length && iSelectedKey) {
                sThresholdKeys.forEach(function(key) {
                    oData.tabs[iSelectedKey - 1][key] = oDataSelected[key] ? oDataSelected[key].toString() : oDataSelected[key];
                });
            }
            
            sThresholdKeys.forEach(function(key) {
                oData[key] = oDataSelected[key] ? oDataSelected[key].toString() : oDataSelected[key];
            });
        }

        oData.isBarList = false;
        if (oData.listFlavor === "bar") {
            oData.isBarList = true;
        }

        oData.hasKPIHeader = false;
        if (oData.dataPointAnnotationPath) {
            oData.hasKPIHeader = true;
        }
        return oData;
    }

    /**
     * Updates the provided oDataSelected object with threshold values based on the criticality calculation
     * and improvement direction specified in the oDataPoint object.
     *
     * @param {Object} oDataSelected - The object to be updated with threshold values
     * @param {Object} oDataPoint - The object containing criticality calculation and improvement direction.
     */
    function updateODataWithThresholdValues(oDataSelected, oDataPoint) {
        var sImproveDirection = oDataPoint.CriticalityCalculation.ImprovementDirection.EnumMember || "";
        var iDeviationLow = oDataSelected.deviationRangeLowValue || Utils.getNumberValue(oDataPoint.CriticalityCalculation.DeviationRangeLowValue);
        var iDeviationHigh = oDataSelected.deviationRangeHighValue || Utils.getNumberValue(oDataPoint.CriticalityCalculation.DeviationRangeHighValue);
        var iToleranceLow = oDataSelected.toleranceRangeLowValue || Utils.getNumberValue(oDataPoint.CriticalityCalculation.ToleranceRangeLowValue);
        var iToleranceHigh = oDataSelected.toleranceRangeHighValue || Utils.getNumberValue(oDataPoint.CriticalityCalculation.ToleranceRangeHighValue);

        if (sImproveDirection.endsWith("Minimize") || sImproveDirection.endsWith("Minimizing") && (iToleranceHigh && iDeviationHigh)) {
            oDataSelected.toleranceRangeHighValue = iToleranceHigh;
            oDataSelected.deviationRangeHighValue = iDeviationHigh;
        } else if (sImproveDirection.endsWith("Maximize") || sImproveDirection.endsWith("Maximizing") && (iToleranceLow && iDeviationLow)) {
            oDataSelected.deviationRangeLowValue = iDeviationLow;
            oDataSelected.toleranceRangeLowValue = iToleranceLow;
        } else if (sImproveDirection.endsWith("Target") && (iToleranceLow && iDeviationLow && iToleranceHigh && iDeviationHigh)) {
            oDataSelected.toleranceRangeLowValue = iToleranceLow;
            oDataSelected.toleranceRangeHighValue = iToleranceHigh;
            oDataSelected.deviationRangeLowValue = iDeviationLow;
            oDataSelected.deviationRangeHighValue = iDeviationHigh;
        }
    }

    /**
     * Determines if semantic coloring is enabled for a given data configuration.
     *
     * @param {Object} oData - The data object containing entity type and chart annotation path.
     * @returns {boolean} `true` if semantic coloring is enabled, otherwise `false`.
     */
    function hasSemanticColoring(oData) {
        var oAllConfig = Utils.getConfig();
        var oChartAnnotation = oData.entityType && oData.entityType[oData.chartAnnotationPath];
        var sChartTypeEnum = oChartAnnotation && oChartAnnotation.ChartType && oChartAnnotation.ChartType.EnumMember;
        var sChartType = sChartTypeEnum && sChartTypeEnum.split("/")[1];
        var sChartTypeLower = sChartType && sChartType.toLowerCase();
    
        var oConfig = Object.values(oAllConfig).find(function (oEntry) {
            return (
                (oEntry.default && oEntry.default.type && oEntry.default.type.toLowerCase() === sChartTypeLower) ||
                (oEntry.time && oEntry.time.type && oEntry.time.type.toLowerCase() === sChartTypeLower)
            );
        });
    
        return (oConfig && oConfig.default && oConfig.default.properties && oConfig.default.properties.semanticColor) || false;
    }
    
    /**
     * Retrieves the DataPoint annotation path from the provided data object.
     *
     * @param {Object} oData - The data object containing entityType and chartAnnotationPath.
     * @returns {string|undefined} - The DataPoint annotation path, or undefined if not found.
     */
    function getDataPointAnnotationPath(oData) {
        var oChartAnnotation = oData.entityType && oData.entityType[oData.chartAnnotationPath];
        var aMeasureAttributes = oChartAnnotation && oChartAnnotation.MeasureAttributes;
        var oMeasureAttribute = aMeasureAttributes && aMeasureAttributes[0];
        var sDataPointAnnotationPath = oMeasureAttribute && oMeasureAttribute.DataPoint && oMeasureAttribute.DataPoint.AnnotationPath;
    
        return sDataPointAnnotationPath;
    }
    
    function addKPINavApplicationName(oData) {
        var oModel = oData && oData.metaModel && oData.metaModel.oModel;
        var bIsOdataV4 = CommonUtils.isODataV4(oModel);
        var sKpiAnnotationPath = oData.kpiAnnotationPath;
        var sCardType = oData.template;
        var oEntityType = bIsOdataV4 ? oData.entityType.$Type : oData.entityType;
        var sApplicationName = "";

        if (sKpiAnnotationPath && oEntityType && sCardType === "sap.ovp.cards.charts.analytical") {
            var oRecord = oEntityType[sKpiAnnotationPath];
            var oDetail = oRecord && oRecord.Detail;
            if (
                oDetail &&
                oDetail.RecordType === "com.sap.vocabularies.UI.v1.KPIDetailType" &&
                oDetail.SemanticObject &&
                oDetail.Action
            ) {
                sApplicationName = "#" + oDetail.SemanticObject.String + "-" + oDetail.Action.String;
            }
        }
        oData["KPINav"] = sApplicationName;
    }

    function addAllEntitySet(oData) {
        var aEntitySet = [],
            oMetaModel = oData.metaModel,
            aAllEntitySet = !!oMetaModel ? oMetaModel.getODataEntityContainer().entitySet : [],
            sNameSpace = oMetaModel && oMetaModel.getODataEntityContainer().namespace + ".";

        aAllEntitySet.forEach(function (entitySet) {
            if (!oData.addNewCard) {
                var sLabel = OvpResources.getText("OVP_KEYUSER_LABEL_DEFAULT_LABEL_WITH_QUALIFIER", [
                    entitySet.name
                ]),
                    sValue = oMetaModel.getODataEntityType(entitySet.entityType)["sap:label"];
                aEntitySet.push({ name: checkForEmptyString(sValue, sLabel), value: entitySet.name });
            } else {
                var sLabel = OvpResources.getText("OVP_KEYUSER_LABEL_DEFAULT_LABEL_WITH_QUALIFIER", [
                    entitySet.name
                ]),
                    sValue = oMetaModel.getODataEntityType(entitySet.entityType)["sap:label"],
                    entityType = entitySet.entityType.split(sNameSpace)[1];
                aEntitySet.push({
                    name: checkForEmptyString(sValue, sLabel),
                    value: entitySet.name,
                    entityType: entityType
                });
            }
        });
        if (aEntitySet.length > 0) {
            oData["allEntitySet"] = aEntitySet;
        }
    }

    function addAllEntitySetV4(oData) {
        var oMetaModel = oData.metaModel,
            oMetaData = oMetaModel.getObject("/"),
            aMetaDataKeys = Object.keys(oMetaData),
            aEntitySets = [],
            aAllEntitySets = [];

        for (var i = 0; i < aMetaDataKeys.length; i++) {
            if (aMetaDataKeys[i].startsWith("$")) {
                continue;
            }
            aEntitySets.push({
                name: aMetaDataKeys[i],
                entityType: oMetaData[aMetaDataKeys[i]].$Type
            });
        }

        var oMetaDataSnapshot = oMetaModel.getData();
        var sEntityContainer = oMetaDataSnapshot.$EntityContainer;
        var aNameSpace = sEntityContainer ? sEntityContainer.split(".") : "";
        aNameSpace.pop();
        var sNameSpace = aNameSpace.join(".") + ".";

        aEntitySets.forEach(function (entitySet) {
            var sLabel = OvpResources.getText("OVP_KEYUSER_LABEL_DEFAULT_LABEL_WITH_QUALIFIER", [entitySet.name]);
            var sValue =
                oMetaDataSnapshot &&
                oMetaDataSnapshot[entitySet.entityType] &&
                oMetaDataSnapshot[entitySet.entityType]["sap:label"];

            if (!oData.addNewCard) {
                aAllEntitySets.push({
                    name: checkForEmptyString(sValue, sLabel),
                    value: entitySet.name
                });
            } else {
                var entityType = entitySet.entityType.split(sNameSpace)[1];
                aAllEntitySets.push({
                    name: checkForEmptyString(sValue, sLabel),
                    value: entitySet.name,
                    entityType: entityType
                });
            }
        });

        if (aAllEntitySets.length > 0) {
            oData["allEntitySet"] = aAllEntitySets;
        }
    }
    /** Remove entity set from the entity set list when there is no annotation exist  */
    function removeEntitySet(oData) {
        var aEntityType =
            oData.metaModel &&
            oData.metaModel.getObject("/dataServices/schema") &&
            oData.metaModel.getObject("/dataServices/schema")[0].entityType;
        if (aEntityType) {
            aEntityType.forEach(
                function (oEntityType) {
                    var iEntityFlag = 0;
                    this.aVariantNames.forEach(function (oVariantName) {
                        for (var key in oEntityType) {
                            if (key.indexOf(oVariantName.sVariant) !== -1) {
                                iEntityFlag++;
                            }
                        }
                    });
                    if (!iEntityFlag) {
                        oData.allEntitySet = oData.allEntitySet.filter(function (oEntitySet) {
                            return oEntitySet.entityType !== oEntityType.name;
                        });
                    }
                }.bind(this)
            );
        }
    }

    function addSupportingObjects(oData) {
        /* Adding Supporting Objects for /lineItem, /dataPoint, /identification
     /presentationVariant, /selectionVariant, /chartAnnotation /dynamicSubtitleAnnotation /allEntitySet*/
        var oModel = oData && oData.metaModel && oData.metaModel.oModel;
        var bIsOdataV4 = CommonUtils.isODataV4(oModel);
        var oEntityType;
        if (bIsOdataV4) {
            oEntityType = oData.metaModel.getData()["$Annotations"][oData.entityType.$Type];
        } else {
            oEntityType = oData.entityType;
        }
        if (!oData["allEntitySet"]) {
            if (bIsOdataV4) {
                addAllEntitySetV4(oData);
            } else {
                addAllEntitySet(oData);
            }
        }
        addKPINavApplicationName(oData);
        /**Remove entity set which doesn't have annotation */
        if (oData.addNewCard) {
            removeEntitySet.call(this, oData);
        }
        this.aVariantNames.forEach(function (oVariantName) {
            var aVariants = [],
                iOptionCounter = 1;

            for (var key in oEntityType) {
                if (oEntityType.hasOwnProperty(key) && key.indexOf(oVariantName.sVariant) !== -1) {
                    if (oVariantName.sVariant === ".LineItem") {
                        var variant = {
                            name: oResourceBundle.getText("OVP_KEYUSER_LABEL_LINEITEM_OPTIONS", [iOptionCounter]),
                            value: bIsOdataV4 ? key.substring(1) : key,
                            fields: bIsOdataV4
                                ? getAnnotationLabelV4(oEntityType, key)
                                : getAnnotationLabel(oEntityType, key)
                        };
                        aVariants.push(variant);
                        iOptionCounter++;
                    } else {
                        aVariants.push({
                            name: bIsOdataV4
                                ? getAnnotationLabelV4(oEntityType, key)
                                : getAnnotationLabel(oEntityType, key),
                            value: bIsOdataV4 ? key.substring(1) : key
                        });
                    }
                }
            }

            if (aVariants.length !== 0) {
                ///*If Not a Mandatory Field than add Select Value Option*/
                //if (!oVariantName.isMandatoryField) {
                //    aVariants.unshift({
                //        name: "Select Value",
                //        value: ""
                //    });
                //}
                oData[oVariantName.sPath] = aVariants;
            }
        });
        /*Adding Supporting Objects for /sortBy Property*/
        if (bIsOdataV4) {
            var entityTypeProperties = getEntityTypeProperties(oData);
            oData["modelProperties"] = entityTypeProperties.map(function (property) {
                return {
                    name: property,
                    value: property
                };
            });
        } else if (oData.entityType && oData.entityType.property) {
            oData["modelProperties"] = oData.entityType.property.map(function (property) {
                return {
                    name: property.name,
                    value: property.name
                };
            });
        }

        /* Adding View Switch properties */
        if (!!oData.tabs && oData.tabs.length) {
            var hasDataPointAnnotation = false,
                sLastViewName = oData.tabs[oData.tabs.length - 1].value,
                aViewNameParts = sLastViewName.split(" ");
            oData.newViewCounter = getViewCounter(aViewNameParts);
            oData.defaultViewSelected = oData.selectedKey;
            oData.isViewResetEnabled = false;
            oData.aViews = [
                {
                    text: oResourceBundle && oResourceBundle.getText("OVP_KEYUSER_LABEL_MAIN_VIEW"),
                    key: 0,
                    isLaterAddedView: false,
                    isViewResetEnabled: false
                }
            ];

            hasDataPointAnnotation = oData.tabs.some(function (tab) {
                return tab.dataPointAnnotationPath;
            });
            oData.tabs.forEach(function (tab, index) {
                var newText = tab.value;
                if (
                    hasDataPointAnnotation &&
                    !tab.dataPointAnnotationPath &&
                    tab.dataPoint &&
                    tab.dataPoint.length
                ) {
                    tab.dataPointAnnotationPath = tab.dataPoint[0].value;
                }
                if (index + 1 === oData.selectedKey) {
                    newText = tab.value;
                    if (oResourceBundle) {
                        newText += " (" + oResourceBundle.getText("OVP_KEYUSER_LABEL_DEFAULT_VIEW") + ")";
                    } else {
                        newText += " (Default view)";
                    }
                }
                oData.aViews.push({
                    text: newText,
                    key: index + 1,
                    initialSelectedKey: index + 1,
                    isLaterAddedView: false,
                    isViewResetEnabled: false
                });
            });
        } else if (checkIfCardTemplateHasProperty(oData.template, "isViewSwitchSupportedCard")) {
            oData.newViewCounter = 0;
            oData.aViews = [
                {
                    text: oResourceBundle.getText("OVP_KEYUSER_SHOWS_DIFFERENT_VIEWS"),
                    key: 0,
                    initialSelectedKey: 0,
                    isLaterAddedView: false,
                    isViewResetEnabled: false
                }
            ];
        }
        return oData;
    }

    function getCrossAppNavigationLinks(oModel) {
        var oData = oModel.getData();
        var oContainer = CommonUtils.getUshellContainer();
        var aLinkToTextMapping = [];

        if (oContainer) {
            oContainer.getServiceAsync("Navigation").then(function (oNavigationService) {
                oNavigationService.getLinks().then(function (aLinks) {
                    var aLinks = aLinks && aLinks[0];
                    var aCardsIntent = [];
                    for (var i = 0; i < aLinks.length; i++) {
                        aCardsIntent.push({ 
                            "target": { 
                                "shellHash": aLinks[i].intent
                            } 
                        });

                        aLinkToTextMapping.push({
                            name: aLinks[i].text,
                            value: aLinks[i].intent
                        });
                    }
                    // Checks for the supported Intents for the user
                   oNavigationService.isNavigationSupported(aCardsIntent).then(function (aResponses) {
                       // Setting the model of Dialog Form with Semantic Objects and Actions
                       var aSupportedLinks = [];

                       for (var i = 0; i < aResponses.length; i++) {
                            if (
                                aResponses[i].supported === true &&
                                aLinkToTextMapping[i]
                            ) {
                                aSupportedLinks.push({ name: aLinkToTextMapping[i].name, value: aLinkToTextMapping[i].value });
                            }
                        }

                       if (aSupportedLinks.length > 0) {
                            oData["links"] = aSupportedLinks;
                       }
                       oModel.refresh();
                   }).catch(function (oError) {
                       oLogger.error(oError);
                   });
               }).catch(function (oError) {
                   oLogger.error(oError);
               });
            });
        }
    }

    function enableResetButton(bEnabled) {
        this.oResetButton.setEnabled(bEnabled);
    }

    function enableSaveButton(bEnabled) {
        this.oSaveButton.setEnabled(bEnabled);
        var oMessagesModel = this.oMessagePopOver.getModel(),
            iCounterError = oMessagesModel.getProperty("/Counter/Error");
        this.bError = iCounterError > 0;
    }

    function validURL(str) {
        var pattern = new RegExp(
            "http(s)?://(www.)?[a-z0-9]+([-.]{1}[a-z0-9]+)*.[a-z]{2,5}(:[0-9]{1,5})?(/.*)?",
            "i"
        );
        return pattern.test(str);
    }

    function catchInputFieldError(sValue, sFieldName) {
        if (sFieldName === "targetUri") {
            return !validURL(sValue) && (!!sValue || sValue === "");
        } else {
            return !sValue.trim().length;
        }
    }

    function validateInputField(oEvent) {
        var sFieldName = oEvent.getParameter("path"),
            sTitle = "",
            aSplit,
            i,
            oMessagesModel,
            aMessages,
            iCounterAll,
            iCounterError;
        if (
            sFieldName === "/title" ||
            sFieldName === "title" ||
            sFieldName === "/viewName" ||
            sFieldName === "targetUri" ||
            sFieldName === "value"
        ) {
            var sNewValue = oEvent.getParameter("value"),
                bErrorFlag = catchInputFieldError(sNewValue, sFieldName),
                iSelectedKey,
                oContext = oEvent.getParameter("context");

            // Error Message for View Name
            if (sFieldName === "/viewName") {
                iSelectedKey = oEvent.getSource().getProperty("/selectedKey");
                sTitle = OvpResources.getText("OVP_KEYUSER_INPUT_ERROR_VIEW_NAME");
                sFieldName = "/tabs/" + (iSelectedKey - 1) + "/value";
            }
            // Error Message for View Name
            if (sFieldName === "value") {
                sTitle = OvpResources.getText("OVP_KEYUSER_INPUT_ERROR_VIEW_NAME");
                sFieldName = oContext.getPath() + "/" + sFieldName;
            }

            // Error Message for Card Title
            if (sFieldName.indexOf("/title") !== -1) {
                sTitle = OvpResources.getText("OVP_KEYUSER_INPUT_ERROR");
            }

            // Error Message for Static LinkList Line item title and Static Link
            if (oContext && oContext.getPath().indexOf("staticContent") !== -1) {
                aSplit = oContext.getPath().split("/");
                if (sFieldName === "title") {
                    sTitle =
                        OvpResources.getText("OVP_KEYUSER_INPUT_ERROR_RECORD_TITLE") +
                        (parseInt(aSplit[aSplit.length - 1], 10) + 1);
                } else if (sFieldName === "targetUri") {
                    sTitle =
                        OvpResources.getText("OVP_KEYUSER_INPUT_ERROR_RECORD_URL") +
                        " " +
                        (parseInt(aSplit[aSplit.length - 1], 10) + 1);
                }
                sFieldName = oContext.getPath() + "/" + sFieldName;
            }
            oMessagesModel = this.oMessagePopOver.getModel();
            aMessages = oMessagesModel.getProperty("/Messages");
            iCounterAll = oMessagesModel.getProperty("/Counter/All");
            iCounterError = oMessagesModel.getProperty("/Counter/Error");
            if (bErrorFlag) {
                enableSaveButton.bind(this)(true);

                for (i = 0; i < aMessages.length; i++) {
                    if (aMessages[i].fieldName === sFieldName) {
                        aMessages.splice(i, 1);
                        iCounterAll--;
                        iCounterError--;
                        i--;
                    }
                }

                aMessages.push({
                    type: "Error",
                    title: sTitle,
                    fieldName: sFieldName,
                    counter: iCounterError + 1
                });
                iCounterAll++;
                iCounterError++;
            } else {
                enableSaveButton.bind(this)(true);

                for (i = 0; i < aMessages.length; i++) {
                    if (aMessages[i].fieldName === sFieldName) {
                        aMessages.splice(i, 1);
                        iCounterAll--;
                        iCounterError--;
                        i--;
                    }
                }
            }
            oMessagesModel.setProperty("/Messages", aMessages);
            oMessagesModel.setProperty("/Counter/All", iCounterAll);
            oMessagesModel.setProperty("/Counter/Error", iCounterError);
            oMessagesModel.refresh(true);
        } else if (
            sFieldName === "/staticContent,title" ||
            sFieldName === "/staticContent,targetUri" ||
            sFieldName === "/tabs,value"
        ) {
            aSplit = sFieldName.split(",");
            oMessagesModel = this.oMessagePopOver.getModel();
            aMessages = oMessagesModel.getProperty("/Messages");
            iCounterAll = oMessagesModel.getProperty("/Counter/All");
            iCounterError = oMessagesModel.getProperty("/Counter/Error");

            enableSaveButton.bind(this)(true);

            for (i = 0; i < aMessages.length; i++) {
                if (
                    aMessages[i].fieldName.indexOf(aSplit[0]) !== -1 &&
                    aMessages[i].fieldName.indexOf(aSplit[1]) !== -1
                ) {
                    aMessages.splice(i, 1);
                    iCounterAll--;
                    iCounterError--;
                    i--;
                }
            }

            oMessagesModel.setProperty("/Messages", aMessages);
            oMessagesModel.setProperty("/Counter/All", iCounterAll);
            oMessagesModel.setProperty("/Counter/Error", iCounterError);
            oMessagesModel.refresh(true);
        }
    }

    function resetErrorHandling() {
        var oMessagesModel = this.oMessagePopOver.getModel();
        oMessagesModel.setProperty("/Messages", []);
        oMessagesModel.setProperty("/Counter/All", 0);
        oMessagesModel.setProperty("/Counter/Error", 0);
        oMessagesModel.setProperty("/Counter/Success", 0);
        oMessagesModel.setProperty("/Counter/Warning", 0);
        oMessagesModel.setProperty("/Counter/Information", 0);
        oMessagesModel.refresh(true);
    }

    function initializeErrorHandling() {
        // Messages Model
        var oLink = new Link({
            text: "Show more information",
            href: "",
            target: "_blank"
        });

        var oMessageTemplate = new MessageItem({
            type: "{type}",
            title: "{title}",
            description: "{description}",
            subtitle: "{subtitle}",
            counter: "{counter}",
            groupName: "{fieldName}",
            link: oLink
        });

        this.oMessagePopOver = new MessagePopover({
            items: {
                path: "/Messages",
                template: oMessageTemplate
            }
        });

        var oMessages = {
            Counter: {
                All: 0,
                Error: 0,
                Success: 0,
                Warning: 0,
                Information: 0
            },
            Messages: []
        };

        var oMessagesModel = new JSONModel(oMessages);
        this.oMessagePopOver.setModel(oMessagesModel);
        this.oMessagePopOverButton.setModel(oMessagesModel);
    }

    function settingFormWidth(oView, sWidth) {
        var sapOvpSettingsForm = oView.byId("sapOvpSettingsForm");
        if (sapOvpSettingsForm) {
            var oSettingsFormDomRef = sapOvpSettingsForm.getDomRef();
            if (oSettingsFormDomRef) {
                oSettingsFormDomRef.style.width = sWidth;
            }
        }
    }

    function sizeChanged(mParams) {
        var oView = this.dialogBox.getContent()[0],
            oCardPropertiesModel = oView.getModel(),
            oDeviceMediaPropertiesModel = oView.getModel("deviceMediaProperties");
        switch (mParams.name) {
            case "S":
            case "M":
                oDeviceMediaPropertiesModel.setProperty("/deviceMedia", "Column");
                settingFormWidth(oView, "100%");
                break;
            case "L":
            case "XL":
            default:
                oDeviceMediaPropertiesModel.setProperty("/deviceMedia", "Row");
                settingFormWidth(
                    oView,
                    "calc(100% - " + (oCardPropertiesModel.getProperty("/dialogBoxWidth") + 1) + "rem)"
                );
                break;
        }
        oDeviceMediaPropertiesModel.refresh(true);
    }

    function detachWindowResizeHandler() {
        // De-register an event handler to changes of the screen size
        Device.media.detachHandler(sizeChanged.bind(this), null, "SettingsViewRangeSet");
        // Remove the Range set
        Device.media.removeRangeSet("SettingsViewRangeSet");
    }

    function attachWindowResizeHandler() {
        // Initialize the Range set
        Device.media.initRangeSet("SettingsViewRangeSet", [520, 760, 960], "px", ["S", "M", "L", "XL"]);
        // Register an event handler to changes of the screen size
        Device.media.attachHandler(sizeChanged.bind(this), null, "SettingsViewRangeSet");
        // Do some initialization work based on the current size
        sizeChanged.bind(this)(Device.media.getCurrentRange("SettingsViewRangeSet"));
    }

    function getEntityTypeProperties(oData) {
        var sEntitySet = oData.entitySet,
            oMetaModel = oData.metaModel,
            oEntitySet = oMetaModel.getObject("/" + sEntitySet),
            sEntityType = oEntitySet.$Type,
            oMetaData = oMetaModel.getObject("/" + sEntityType),
            oMetaDataKeys = Object.keys(oMetaData);

        var aProperties = oMetaDataKeys.filter(function (name) {
            return !name.startsWith("$");
        });
        return aProperties;
    }

    var oSettingsUtils = {
        dialogBox: undefined,
        oSaveButton: undefined,
        oResetButton: undefined,
        oMessagePopOverButton: undefined,
        oMessagePopOver: undefined,
        oAppDescriptor: undefined,
        oOriginalAppDescriptor: undefined,
        oMainComponent: undefined,
        oAppComponent: undefined,
        oNewDataSources: {},
        sApplicationId: "",
        oi18nModel: undefined,
        iContentHeightForDialog: 38,
        iContentHeightForDialogWithViewSwitch: 33,
        aVariantNames: SettingsConstants.aVariantNames,
        aVisiblePropertiesForAnnotation: SettingsConstants.aVisiblePropertiesForAnnotation,
        getDataSources: getDataSources,
        removeDataSources: removeDataSources,
        setDataSources: setDataSources,
        attachWindowResizeHandler: attachWindowResizeHandler,
        detachWindowResizeHandler: detachWindowResizeHandler,
        settingFormWidth: settingFormWidth,
        addKPINavApplicationName: addKPINavApplicationName,
        addManifestSettings: addManifestSettings,
        setVisibilityForFormElements: setVisibilityForFormElements,
        getVisibilityOfElement: getVisibilityOfElement,
        checkForEmptyString: checkForEmptyString,
        enableResetButton: enableResetButton,
        enableSaveButton: enableSaveButton,
        checkClonedCard: checkClonedCard,
        resetErrorHandling: resetErrorHandling,
        createErrorCard: createErrorCard,
        setErrorMessage: setErrorMessage,
        getQualifier: getQualifier,
        getTrimmedDataURIName: getTrimmedDataURIName,
        addSupportingObjects: addSupportingObjects,
        oVisibility: SettingsConstants.oVisibility,
        bError: false,
        bNewStaticLinkListCardFlag: false,
        bNewKPICardFlag: false,
        bAddNewCardFlag: false,
        aListType: SettingsConstants.aListType,
        aListFlavour: SettingsConstants.aListFlavour,
        aDataPointSelectionMode: SettingsConstants.aDataPointSelectionMode,
        aSortOrder: SettingsConstants.aSortOrder,
        aCardType: SettingsConstants.aCardType,
        aLinkListFlavour: SettingsConstants.aLinkListFlavour,
        verifyCardsMaxLimitExceeded: verifyCardsMaxLimitExceeded,
        getDialogBox: function (oComponentContainer) {
            return new Promise(
                function (resolve, reject) {
                    if (!this.dialogBox) {
                        // settings dialog save button
                        // Attached this button to "this" scope to get it in setting controller and attach save
                        // function to it.
                        this.oSaveButton = new Button("settingsSaveBtn", {
                            text: OvpResources.getText("save"),
                            type: "Emphasized"
                        });
                        // settings dialog close button
                        var oCancelButton = new Button("settingsCancelBtn", {
                            text: OvpResources.getText("cancelBtn")
                        });
                        this.oResetButton = new Button("settingsResetBtn", {
                            text: OvpResources.getText("resetCardBtn")
                        });
                        // Message PopOver Button
                        this.oMessagePopOverButton = new Button("settingsMessagePopOverBtn", {
                            text: "{/Counter/All}",
                            type: "Emphasized",
                            icon: "sap-icon://message-popup",
                            visible: "{= ${/Counter/All} === 0 ? false : true}"
                        }).addStyleClass("sapOvpSettingsMessagePopOverBtn");
                        // settings dialog
                        this.dialogBox = new Dialog("settingsDialog", {
                            title: OvpResources.getText("settingsDialogTitle"),
                            buttons: [
                                this.oMessagePopOverButton,
                                this.oSaveButton,
                                oCancelButton,
                                this.oResetButton
                            ],
                            // destroy the view on close of dialog (?)
                            // TODO: confirm if we can just destroy the card component, rest of the things can be updated via model data binding
                            afterClose: function (oEvent) {
                                var oSettingsView = this.dialogBox.getContent()[0],
                                    oSettingsLineItemTitle = oSettingsView.byId("sapOvpSettingsLineItemTitle"),
                                    oSettingsLineItemSubTitle = oSettingsView.byId(
                                        "sapOvpSettingsLineItemSubTitle"
                                    );
                                if (oSettingsLineItemTitle) {
                                    oSettingsLineItemTitle.destroy();
                                }
                                if (oSettingsLineItemSubTitle) {
                                    oSettingsLineItemSubTitle.destroy();
                                }
                                this.bNewStaticLinkListCardFlag = false;
                                this.bNewKPICardFlag = false;
                                this.bAddNewCardFlag = false;
                                this.newDataSource = false;
                                this.dialogBox.destroyContent();
                                this.detachWindowResizeHandler();
                            }.bind(this)
                        });
                        this.dialogBox.setBusyIndicatorDelay(0);
                        oCancelButton.attachPress(
                            function (oEvent) {
                                this.dialogBox.close();
                            }.bind(this)
                        );
                    }

                    this.oResetButton.setVisible(!this.bNewKPICardFlag);

                    // Initializing Error Handling for the Settings Dialog Form
                    initializeErrorHandling.bind(this)();

                    var bNewCardFlag =
                        this.bNewStaticLinkListCardFlag || this.bNewKPICardFlag || this.bAddNewCardFlag;

                    // card properties and model
                    var oComponentInstance = oComponentContainer.getComponentInstance(),
                        oSelectedCardPropertiesModel = oComponentInstance
                            .getRootControl()
                            .getModel("ovpCardProperties"),
                        oOriginalCardProperties;

                    this.oi18nModel = oComponentInstance.getComponentData().i18n;
                    if (this.bNewStaticLinkListCardFlag) {
                        oOriginalCardProperties = {
                            title: "New Title",
                            subTitle: "New Subtitle",
                            staticContent: [],
                            listFlavor: "standard",
                            template: "sap.ovp.cards.linklist",
                            layoutDetail: oSelectedCardPropertiesModel.getProperty("/layoutDetail")
                        };
                    } else if (this.bNewKPICardFlag) {
                        var aSelectedKPI = oComponentInstance
                            .getComponentData()
                            .mainComponent.getView()
                            .getModel("JSONModelForSSB")
                            .getProperty("/d/results"),
                            oSelectedKPI = aSelectedKPI[0];
                        oOriginalCardProperties = {
                            entitySet: oSelectedKPI.ODataEntityset,
                            kpiAnnotationPath: "com.sap.vocabularies.UI.v1.KPI#" + oSelectedKPI.KPIQualifier,
                            title: oSelectedKPI.GroupTitle,
                            subTitle: oSelectedKPI.KPITitle,
                            template: "sap.ovp.cards.charts.analytical",
                            layoutDetail: oSelectedCardPropertiesModel.getProperty("/layoutDetail"),
                            selectedKPI: oSelectedKPI,
                            errorStatusText: undefined,
                            KPIData: aSelectedKPI
                        };
                    } else if (this.bAddNewCardFlag) {
                        oOriginalCardProperties = {
                            addNewCard: true,
                            newDataSource: false,
                            title: "",
                            subTitle: "",
                            cardType: this.aCardType,
                            aListType: this.aListType,
                            aListFlavour: this.aListFlavour,
                            valueSelectionInfo: "",
                            navigation: this.aDataPointSelectionMode,
                            aLinkListFlavour: this.aLinkListFlavour,
                            authorization: ""
                        };
                    } else {
                        oOriginalCardProperties = oSelectedCardPropertiesModel.getData();
                    }
                    var oCardProperties = merge({}, oOriginalCardProperties);
                    oCardProperties = addSupportingObjects.call(this, oCardProperties);
                    oCardProperties = this.addManifestSettings(oCardProperties);
                    var oCardPropertiesModel = new JSONModel(oCardProperties),
                        componentContainerHeight = oComponentContainer.getDomRef().offsetHeight,
                        oDeviceSystemPropertiesModel = new JSONModel(Device.system),
                        oDeviceMediaPropertiesModel = new JSONModel({
                            deviceMedia: "Row"
                        }),
                        oComponentData = oComponentInstance.getComponentData(),
                        oMainComponent = oComponentData.mainComponent,
                        oAppComponent = oComponentData.appComponent,
                        sCardId = bNewCardFlag ? "" : oComponentData.cardId;
                    this.oAppComponent = oAppComponent;
                    this.oAppDescriptor = oMainComponent._getCardFromManifest(sCardId);
                    this.sApplicationId = oMainComponent._getApplicationId();
                    this.oMainComponent = oMainComponent;
                    this.oOriginalAppDescriptor = oAppComponent._getOvpCardOriginalConfig(sCardId);
                    oDeviceSystemPropertiesModel.setDefaultBindingMode("OneWay");
                    oCardProperties.dialogBoxHeight = componentContainerHeight;
                    oCardProperties.dialogBoxWidth = 20;

                    var aAllStaticParameters = [];
                    //select add custom parameter checkbox based on the manifest value availability
                    if (oCardProperties.customParams || oCardProperties.staticParameters) {
                        oCardPropertiesModel.setProperty("/addCustomParameters", true);
                        if (
                            oCardProperties.staticParameters &&
                            Object.keys(oCardProperties.staticParameters).length
                        ) {
                            for (var key in oCardProperties.staticParameters) {
                                aAllStaticParameters.push({
                                    key: key,
                                    value: oCardProperties.staticParameters[key]
                                });
                            }
                            oCardPropertiesModel.setProperty("/aAllStaticParameters", aAllStaticParameters);
                        }
                    } else {
                        oCardPropertiesModel.setProperty("/addCustomParameters", false);
                    }
                    //setting layer value
                    var layer = CommonUtils._getLayer();
                    var bFioriToolsRTAMode = CommonUtils.getQueryParameterValue("fiori-tools-rta-mode");
                    if (bFioriToolsRTAMode) {
                        oCardPropertiesModel.setProperty("/layer", layer);
                        oCardPropertiesModel.setProperty("/bFioriToolsRTAMode", bFioriToolsRTAMode);
                        //select add custom actions checkbox based on the manifest value availability
                        if (
                            oCardProperties.objectStreamCardsSettings &&
                            oCardProperties.objectStreamCardsSettings.customActions
                        ) {
                            oCardPropertiesModel.setProperty("/addCustomActions", true);
                        } else {
                            oCardPropertiesModel.setProperty("/addCustomActions", false);
                        }
                        //read adaptation project i18n properties
                        var sAppComponentId = oComponentInstance.getComponentData().appComponent.sId;
                        var oi18nModel = CoreElement
                            .getElementById(sAppComponentId + "---mainView")
                            .getModel("i18n");
                        var aCustomBundles = oi18nModel.oData.bundle && oi18nModel.oData.bundle.oi18nModel;
                        if (
                            Array.isArray(aCustomBundles) &&
                            aCustomBundles[0] &&
                            aCustomBundles[0].aPropertyFiles[0] &&
                            aCustomBundles[0].aPropertyFiles[0].mProperties
                        ) {
                            var oi18nProperties = aCustomBundles[0].aPropertyFiles[0].mProperties;
                            var ai18nProperties = [];
                            var ai18nPropertiesAndTitle = [];
                            var ai18nPropertiesAndSubTitle = [];
                            var ai18nPropertiesAndValSelInfo = [];
                            // When card is in edit or clone mode
                            if (!oCardProperties.addNewCard) {
                                var oI18nKeyValueProperty = SettingsConstants.oI18nKeyValueProperty;
                                for (var key in oI18nKeyValueProperty) {
                                    if (key === "title") {
                                        ai18nPropertiesAndTitle.push({
                                            key: "",
                                            value: oCardProperties[key]
                                        });
                                    }
                                    if (key === "subTitle") {
                                        ai18nPropertiesAndSubTitle.push({
                                            key: "",
                                            value: oCardProperties[key]
                                        });
                                    }
                                    if (key === "valueSelectionInfo") {
                                        ai18nPropertiesAndValSelInfo.push({
                                            key: "",
                                            value: oCardProperties[key]
                                        });
                                    }
                                }
                                for (var key in oi18nProperties) {
                                    if (oi18nProperties.hasOwnProperty(key)) {
                                        ai18nPropertiesAndTitle.push({
                                            key: key,
                                            value: oi18nProperties[key]
                                        });
                                    }
                                }
                                for (var key in oi18nProperties) {
                                    if (oi18nProperties.hasOwnProperty(key)) {
                                        ai18nPropertiesAndSubTitle.push({
                                            key: key,
                                            value: oi18nProperties[key]
                                        });
                                    }
                                }
                                for (var key in oi18nProperties) {
                                    if (oi18nProperties.hasOwnProperty(key)) {
                                        ai18nPropertiesAndValSelInfo.push({
                                            key: key,
                                            value: oi18nProperties[key]
                                        });
                                    }
                                }
                                oCardPropertiesModel.setProperty("/ai18nPropertiesAndTitle", ai18nPropertiesAndTitle);
                                oCardPropertiesModel.setProperty("/ai18nPropertiesAndSubTitle", ai18nPropertiesAndSubTitle);
                                oCardPropertiesModel.setProperty("/ai18nPropertiesAndValSelInfo", ai18nPropertiesAndValSelInfo);
                            }
                            for (var key in oi18nProperties) {
                                if (oi18nProperties.hasOwnProperty(key)) {
                                    ai18nProperties.push({
                                        key: key,
                                        value: oi18nProperties[key]
                                    });
                                }
                            }
                            oCardPropertiesModel.setProperty("/ai18nProperties", ai18nProperties);
                        }
                    }
                    if (
                        oCardProperties.template === "sap.ovp.cards.linklist" ||
                        oCardProperties.template === "sap.ovp.cards.v4.linklist"
                    ) {
                        oCardPropertiesModel.setProperty("/listFlavorName", OvpResources.getText("OVP_KEYUSER_CAROUSEL"));
                    } else {
                        oCardPropertiesModel.setProperty("/listFlavorName", OvpResources.getText("OVP_KEYUSER_BARLIST"));
                    }
                    if (oCardProperties.layoutDetail === "resizable") {
                        var supportedCards = [
                            "sap.ovp.cards.list",
                            "sap.ovp.cards.table",
                            "sap.ovp.cards.v4.list",
                            "sap.ovp.cards.v4.table"
                        ];
                        if (!oCardProperties.defaultSpan) {
                            oCardProperties.defaultSpan = {};
                            oCardPropertiesModel.setProperty("/defaultSpan/cols", oCardPropertiesModel.getProperty("/cardLayout/colSpan"));
                            oCardPropertiesModel.setProperty(
                                "/defaultSpan/rows",
                                supportedCards.indexOf(oCardProperties.template) > -1
                                    ? oCardPropertiesModel.getProperty("/cardLayout/noOfItems")
                                    : oCardPropertiesModel.getProperty("/cardLayout/rowSpan")
                            );
                        } else {
                            if (!oCardProperties.defaultSpan.rows) {
                                oCardPropertiesModel.setProperty(
                                    "/defaultSpan/rows",
                                    supportedCards.indexOf(oCardProperties.template) > -1
                                        ? oCardPropertiesModel.getProperty("/cardLayout/noOfItems")
                                        : oCardPropertiesModel.getProperty("/cardLayout/rowSpan")
                                );
                            }
                            if (!oCardProperties.defaultSpan.cols) {
                                oCardPropertiesModel.setProperty(
                                    "/defaultSpan/cols",
                                    oCardPropertiesModel.getProperty("/cardLayout/colSpan")
                                );
                            }
                        }

                        // Setting drop down values for Number of Columns field
                        oCardProperties.NoOfColumns = [];
                        var iLowValue = 1,
                            iHighValue = 6;
                        for (var q = iLowValue; q <= iHighValue; q++) {
                            oCardProperties.NoOfColumns.push({ value: q });
                        }

                        if (
                            checkIfCardTemplateHasProperty(oCardProperties.template, "chart") ||
                            oCardProperties.template === "sap.ovp.cards.linklist" ||
                            oCardProperties.template === "sap.ovp.cards.v4.linklist"
                        ) {
                            var oMainController = oComponentContainer
                                .getComponentInstance()
                                .getComponentData().mainComponent,
                                oMainLayout = oMainController.getLayout(),
                                oLayoutUtil = oMainLayout.getDashboardLayoutUtil(),
                                sSelectedCardId = oMainComponent._getCardId(oComponentContainer.getId()),
                                oCardDashProps = oLayoutUtil.calculateCardProperties(sSelectedCardId),
                                iBubbleTextHeight = oLayoutUtil
                                    ._getCardController(sSelectedCardId)
                                    .getView()
                                    .byId("bubbleText")
                                    ? 43
                                    : 0,
                                iHeightWithoutContent =
                                    oCardDashProps.headerHeight +
                                    oCardDashProps.dropDownHeight +
                                    iBubbleTextHeight +
                                    50, //20px is the text height + 14px is the top padding + 16px is the chart top margin
                                iSmallNumberOfRows =
                                    Math.ceil(oCardDashProps.minCardHeight / oLayoutUtil.getRowHeightPx()) + 1;
                            // Setting drop down values for Number of Rows field
                            oCardProperties.NoOfRows = [];
                            oCardProperties.NoOfRows.push({
                                name: "None",
                                value: 0
                            });
                            oCardProperties.NoOfRows.push({
                                name: "Small",
                                value: iSmallNumberOfRows
                            });
                            oCardProperties.NoOfRows.push({
                                name: "Standard",
                                value: Math.ceil((iHeightWithoutContent + 480) / oLayoutUtil.getRowHeightPx()) + 1 // 480 is chart area height for standard
                            });

                            /**
                             *  Setting default value for number of columns to 1
                             *  and number of rows to miniContent height for new
                             *  static link list & KPI cards
                             */
                            if (this.bNewStaticLinkListCardFlag || this.bNewKPICardFlag) {
                                oCardPropertiesModel.setProperty("/defaultSpan/cols", 1);
                                oCardPropertiesModel.setProperty("/defaultSpan/rows", iSmallNumberOfRows);
                            }
                        }
                    }

                    if (oCardProperties.addNewCard) {
                        oCardPropertiesModel.setProperty("/addViewSwitchCheckBox", false);
                        oCardPropertiesModel.setProperty("/addKPIHeaderCheckBox", false);
                        //read list of data source from manifest
                        var aValues = [];
                        var oDataSources = oMainComponent.oCardsModels;
                        if (oDataSources) {
                            for (var key in oDataSources) {
                                if (key.indexOf("kpi_card_model_") < 0) {
                                    aValues.push(
                                        Object.assign(
                                            {},
                                            {
                                                Title: key
                                            },
                                            oDataSources[key]
                                        )
                                    );
                                }
                            }
                            oCardPropertiesModel.setProperty("/datasources", aValues);
                            oCardPropertiesModel.setProperty("/datasourcesFromManifest", aValues);
                        }
                    }
                    var oExtraStaticCardProperties = {};
                    var oExtraStaticCardPropertiesModel = new JSONModel(oExtraStaticCardProperties);
                    getCrossAppNavigationLinks(oExtraStaticCardPropertiesModel);
                    if (
                        (oCardProperties.template === "sap.ovp.cards.linklist" ||
                            oCardProperties.template === "sap.ovp.cards.v4.linklist") &&
                        oCardProperties.staticContent
                    ) {
                        setIndicesToStaticLinkList(oCardPropertiesModel);
                        oCardPropertiesModel.setProperty("/lineItemId", "linkListItem--1");
                        oCardPropertiesModel.setProperty(
                            "/lineItemIdCounter",
                            oCardProperties.staticContent.length
                        );
                    }
                    // this flag remains true only for newly created card and false while in the edit scenario of the same card.
                    //Hence setting this property for the model to access it in the KPI Table
                    if (oCardProperties.template === "sap.ovp.cards.charts.analytical") {
                        var SelectedKPICardId = oMainComponent._getCardId(oComponentContainer.getId());
                        oCardPropertiesModel.setProperty("/NewKPICard", this.bNewKPICardFlag);
                        oCardPropertiesModel.setProperty("/selectedKPICardID", SelectedKPICardId);
                    }

                    this.setVisibilityForFormElements(oCardProperties);
                    var oVisibilityModel = new JSONModel(this.oVisibility);
                    if (!this.bAddNewCardFlag) {
                        oCardPropertiesModel.attachPropertyChange(validateInputField.bind(this));
                    }

                    // settings view
                    var oViewSettings = {
                        id: "settingsView",
                        viewName: "sap.ovp.cards.rta.SettingsDialog",
                        type: ViewType.XML,
                        preprocessors: {
                            xml: {
                                bindingContexts: {
                                    ovpCardProperties: oCardPropertiesModel.createBindingContext("/")
                                },
                                models: {
                                    ovpCardProperties: oCardPropertiesModel,
                                    deviceSystemProperties: oDeviceSystemPropertiesModel
                                }
                            }
                        }
                    };

                    View.create(oViewSettings).then(function(oSettingsView) {
                        oSettingsView.setModel(oExtraStaticCardPropertiesModel, "staticCardProperties");
                        var oOvpResourceModel = OvpResources.oResourceModel;
                        oSettingsView.setModel(oCardPropertiesModel);
                        oSettingsView.setModel(oOvpResourceModel, "ovpResourceModel");
                        oSettingsView.setModel(oDeviceMediaPropertiesModel, "deviceMediaProperties");
                        oSettingsView.setModel(oVisibilityModel, "visibility");
                        if (this.oi18nModel) {
                            oSettingsView.setModel(this.oi18nModel, "@i18n");
                        }
                        this.dialogBox.addContent(oSettingsView);
                        this.attachWindowResizeHandler();

                        //When add new card is not selected
                        if (!this.bAddNewCardFlag) {
                            // set the width of the component container for settings card
                            var dialogCard = oSettingsView.byId("dialogCard");
                            if (!dialogCard.getVisible()) {
                                dialogCard = oSettingsView.byId("dialogCardNoPreview");
                                var aSplitString = oSettingsView.getModel().getProperty("/template").split("."),
                                    sCardType = aSplitString[aSplitString.length - 1],
                                    sMessageText = OvpResources.getText("OVP_KEYUSER_NO_CARD_PREVIEW_MSG", [
                                        sCardType
                                    ]);
                                dialogCard.setTitle(sMessageText);
                            } else {
                                dialogCard.setWidth(oCardProperties.dialogBoxWidth + "rem");
                            }
                        }
                        addCardToView(oComponentContainer, oSettingsView, bNewCardFlag);
                        this.dialogBox.open();
                        // set the resolve for this promise to the controller which will resolve it when handling save
                        oSettingsView.getController().settingsResolve = resolve;
                        //resolve(this.dialogBox);
                    }.bind(this));
                }.bind(this)
            );
        }
    };

    oSettingsUtils.fnEditCardHandler = function (oSelectedElement, fGetUnsavedChanges) {
        var oMainComponent = oSelectedElement.getComponentInstance().getComponentData().mainComponent,
            oMainLayout = oMainComponent.getLayout(),
            oUIModel = oMainComponent.getUIModel();

        return oSettingsUtils.getDialogBox(oSelectedElement).then(function (mChangeContent) {
            var aChangeSpecificData = [
                {
                    // appDescriptorChange does not need a selector control
                    appComponent: oSelectedElement.getComponentInstance().getComponentData().appComponent,
                    changeSpecificData: {
                        appDescriptorChangeType: "appdescr_ovp_changeCard",
                        content: mChangeContent.appDescriptorChange
                    }
                },
                {
                    selectorControl: CommonUtils.getApp().getLayout(),
                    changeSpecificData: {
                        runtimeOnly: true, //UI change would be used only at runtime to modify the app; it will not be persisted
                        changeType: "editCardSettings",
                        content: mChangeContent.flexibilityChange //toUIChange(mChangeContent) // Allows for different parameters in runtime or descriptor change
                    }
                }
            ];

            if (mChangeContent.viewSwitchChange) {
                aChangeSpecificData.push({
                    selectorControl: CommonUtils.getApp().getLayout(),
                    changeSpecificData: {
                        changeType: "viewSwitch",
                        content: mChangeContent.viewSwitchChange
                    }
                });
            }

            if (oUIModel.getProperty("/containerLayout") === "resizable") {
                var oLayoutModel = oMainLayout.getDashboardLayoutModel(),
                    oLayoutUtil = oMainLayout.getDashboardLayoutUtil(),
                    sSelectedCardId = oMainComponent._getCardId(oSelectedElement.getId()),
                    oSelectedCardObj = oLayoutModel.getCardById(sSelectedCardId),
                    oCardProps = oLayoutUtil.calculateCardProperties(sSelectedCardId),
                    iColumnCount = oLayoutModel.getColCount(),
                    sLayoutKey = "C" + iColumnCount,
                    iNewCardSpan = mChangeContent.flexibilityChange.newAppDescriptor.settings.defaultSpan,
                    iNewCardRowSpan,
                    affectedCards = [];

                //If the card is in resizable layout and the person is doing resize operation then
                if (iNewCardSpan && iNewCardSpan.cols) {
                    //Previous appDescriptor data to be modified to do the revert change properly
                    aChangeSpecificData.forEach(function (item) {
                        //Updating the previous change specific data appended for original card
                        if (item.changeSpecificData.changeType === "editCardSettings") {
                            var oOldAppData = item.changeSpecificData.content.oldAppDescriptor;
                            //Set the rowSpan, ColSpan, showOnlyHeader property for revert operation in UI.
                            //Not modifying existing rows,cols because it is bound to the settings dialog in two-way binding
                            oOldAppData.settings.defaultSpan = {
                                rowSpan: oSelectedCardObj.dashboardLayout.rowSpan,
                                colSpan: oSelectedCardObj.dashboardLayout.colSpan,
                                showOnlyHeader: oSelectedCardObj.dashboardLayout.showOnlyHeader
                            };
                        }
                    });
                    //If the card has new row value is 0(show only header card) then card to be resized till header height
                    // and autoSpan will be false else set autoSpan to true
                    if (iNewCardSpan.rows === 0) {
                        oSelectedCardObj.dashboardLayout.autoSpan = false;
                        iNewCardRowSpan = Math.ceil(
                            (oCardProps.headerHeight + 2 * oLayoutUtil.CARD_BORDER_PX) /
                            oLayoutUtil.getRowHeightPx()
                        ); //new row value should be of header height / 16
                    } else {
                        oSelectedCardObj.dashboardLayout.autoSpan = true;
                        var supportedTemplates = [
                            "sap.ovp.cards.list",
                            "sap.ovp.cards.table",
                            "sap.ovp.cards.v4.list",
                            "sap.ovp.cards.v4.table"
                        ];
                        if (supportedTemplates.indexOf(oSelectedCardObj.template > -1)) {
                            oSelectedCardObj.dashboardLayout.noOfItems = iNewCardSpan.rows;
                        } else {
                            iNewCardRowSpan = iNewCardSpan.rows;
                        }
                    }
                    oLayoutModel._arrangeCards(
                        oSelectedCardObj,
                        {
                            row: iNewCardRowSpan,
                            column: iNewCardSpan.cols
                        },
                        "resize",
                        affectedCards
                    );
                    oLayoutModel._removeSpaceBeforeCard(affectedCards);
                    //Create change specific data('dragOrResize') for all the affected cards
                    affectedCards.forEach(function (item) {
                        var obj = {};
                        obj.dashboardLayout = {};
                        obj.cardId = item.content.cardId;
                        obj.dashboardLayout[sLayoutKey] = item.content.dashboardLayout;
                        aChangeSpecificData.push({
                            selectorControl: CommonUtils.getApp().getLayout(),
                            changeSpecificData: {
                                changeType: "dragOrResize",
                                content: obj
                            }
                        });
                    });
                }
            }

            return aChangeSpecificData;
        });
    };
    oSettingsUtils.fnCloneCardHandler = function (oSelectedElement, fGetUnsavedChanges) {
        var oMainComponent = oSelectedElement.getComponentInstance().getComponentData().mainComponent;
        if (verifyCardsMaxLimitExceeded(oMainComponent)) {
            return Promise.resolve([]);
        }
        return PayLoadUtils.getPayLoadForCloneCard(oSelectedElement).then(function (mChangeContent) {
            return [
                {
                    // appDescriptorChange does not need a selector control
                    appComponent: oSelectedElement.getComponentInstance().getComponentData().appComponent,
                    changeSpecificData: {
                        appDescriptorChangeType: "appdescr_ovp_addNewCard",
                        content: mChangeContent.appDescriptorChange
                    }
                },
                {
                    selectorControl: CommonUtils.getApp().getLayout(),
                    changeSpecificData: {
                        runtimeOnly: true, //UI change would be used only at runtime to modify the app; it will not be persisted
                        changeType: "newCardSettings",
                        content: mChangeContent.flexibilityChange //toUIChange(mChangeContent) // Allows for different parameters in runtime or descriptor change
                    }
                }
            ];
        });
    };
    oSettingsUtils.fnAddStaticLinkListCardHandler = function (oSelectedElement, fGetUnsavedChanges) {
        var oMainComponent = oSelectedElement.getComponentInstance().getComponentData().mainComponent;
        if (verifyCardsMaxLimitExceeded(oMainComponent)) {
            return Promise.resolve([]);
        }
        
        oSettingsUtils.bNewStaticLinkListCardFlag = true;
        return oSettingsUtils.getDialogBox(oSelectedElement).then(function (mChangeContent) {
            return [
                {
                    // appDescriptorChange does not need a selector control
                    appComponent: oSelectedElement.getComponentInstance().getComponentData().appComponent,
                    changeSpecificData: {
                        appDescriptorChangeType: "appdescr_ovp_addNewCard",
                        content: mChangeContent.appDescriptorChange
                    }
                },
                {
                    selectorControl: CommonUtils.getApp().getLayout(),
                    changeSpecificData: {
                        runtimeOnly: true, //UI change would be used only at runtime to modify the app; it will not be persisted
                        changeType: "newCardSettings",
                        content: mChangeContent.flexibilityChange //toUIChange(mChangeContent) // Allows for different parameters in runtime or descriptor change
                    }
                }
            ];
        });
    };

    oSettingsUtils.fnAddKPICardHandler = function (oSelectedElement, fGetUnsavedChanges) {
        var oMainComponent = oSelectedElement.getComponentInstance().getComponentData().mainComponent;
        if (verifyCardsMaxLimitExceeded(oMainComponent)) {
            return Promise.resolve([]);
        }

        oSettingsUtils.bNewKPICardFlag = true;
        return oSettingsUtils.getDialogBox(oSelectedElement).then(function (mChangeContent) {
            var aChanges = [
                {
                    // appDescriptorChange does not need a selector control
                    appComponent: oSelectedElement.getComponentInstance().getComponentData().appComponent,
                    changeSpecificData: {
                        appDescriptorChangeType: "appdescr_ovp_addNewCard",
                        content: mChangeContent.appDescriptorChange
                    }
                },
                {
                    selectorControl: CommonUtils.getApp().getLayout(),
                    changeSpecificData: {
                        runtimeOnly: true, //UI change would be used only at runtime to modify the app; it will not be persisted
                        changeType: "newCardSettings",
                        content: mChangeContent.flexibilityChange //toUIChange(mChangeContent) // Allows for different parameters in runtime or descriptor change
                    }
                }
            ];
    
            if (mChangeContent.addODataAnnotation) {
                aChanges.push({
                    // appDescriptorChange does not need a selector control
                    appComponent: oSelectedElement.getComponentInstance().getComponentData().appComponent,
                    changeSpecificData: {
                        appDescriptorChangeType: "appdescr_app_addAnnotationsToOData",
                        content: mChangeContent.addODataAnnotation
                    }
                });
            }
    
            return aChanges;
        });
    };
    oSettingsUtils.fnAddNewCardHandler = function (oSelectedElement, fGetUnsavedChanges) {
        var oMainComponent = oSelectedElement.getComponentInstance().getComponentData().mainComponent;
        if (verifyCardsMaxLimitExceeded(oMainComponent)) {
            return Promise.resolve([]);
        }

        oSettingsUtils.bAddNewCardFlag = true;
        return oSettingsUtils.getDialogBox(oSelectedElement).then(function (mChangeContent) {
            var aChanges = [
                {
                    // appDescriptorChange does not need a selector control
                    appComponent: oSelectedElement.getComponentInstance().getComponentData().appComponent,
                    changeSpecificData: {
                        appDescriptorChangeType: "appdescr_ovp_addNewCard",
                        content: mChangeContent.appDescriptorChange
                    }
                },
                {
                    selectorControl: CommonUtils.getApp().getLayout(),
                    changeSpecificData: {
                        runtimeOnly: true, //UI change would be used only at runtime to modify the app; it will not be persisted
                        changeType: "newCardSettings",
                        content: mChangeContent.flexibilityChange //toUIChange(mChangeContent) // Allows for different parameters in runtime or descriptor change
                    }
                }
            ];
    
            if (mChangeContent.addODataAnnotation) {
                aChanges.push({
                    // appDescriptorChange does not need a selector control
                    appComponent: oSelectedElement.getComponentInstance().getComponentData().appComponent,
                    changeSpecificData: {
                        appDescriptorChangeType: "appdescr_app_addAnnotationsToOData",
                        content: mChangeContent.addODataAnnotation
                    }
                });
            }
    
            return aChanges;
        });
    };

    oSettingsUtils.fnRemoveCardHandler = function (oSelectedElement, fGetUnsavedChanges) {
        return new Promise(function (resolve, reject) {
            MessageBox.confirm(OvpResources.getText("OVP_KEYUSER_MESSAGE_BOX_WARNING_MESSAGE_DELETE"), {
                actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
                icon: MessageBox.Icon.WARNING,
                title: OvpResources.getText("OVP_KEYUSER_MESSAGE_BOX_TITLE_DELETE"),
                initialFocus: MessageBox.Action.CANCEL,
                onClose: function (sAction) {
                    if (sAction === "DELETE") {
                        resolve(PayLoadUtils.getPayLoadForRemoveCard(oSelectedElement));
                    } else {
                        reject(null);
                    }
                }
            });
        }).then(
            function (mChangeContent) {
                var aChanges = [
                    {
                        // appDescriptorChange does not need a selector control
                        appComponent: oSelectedElement.getComponentInstance().getComponentData().appComponent,
                        changeSpecificData: {
                            appDescriptorChangeType: "appdescr_ovp_removeCard",
                            content: mChangeContent.appDescriptorChange
                        }
                    },
                    {
                        selectorControl: CommonUtils.getApp().getLayout(),
                        changeSpecificData: {
                            runtimeOnly: true, //UI change would be used only at runtime to modify the app; it will not be persisted
                            changeType: "removeCardContainer",
                            content: mChangeContent.flexibilityChange //toUIChange(mChangeContent) // Allows for different parameters in runtime or descriptor change
                        }
                    }
                ];

                if (mChangeContent.removeDataSourceChange) {
                    mChangeContent.removeDataSourceChange.forEach(function (oRemoveDataSourceChange) {
                        aChanges.push({
                            // appDescriptorChange does not need a selector control
                            appComponent: oSelectedElement.getComponentInstance().getComponentData().appComponent,
                            changeSpecificData: {
                                appDescriptorChangeType: "appdescr_app_removeDataSource",
                                content: oRemoveDataSourceChange
                            }
                        });
                    });
                }

                return aChanges;
            },
            function (mChangeContent) {
                return [];
            }
        );
    };

    /**
    * Checks if the maximum limit for the number of visible cards is exceeded
    * 
    * @param {object} oMainComponent - main component 
    * @returns {boolean} - returns true if the maximum limit is exceeded, otherwise returns false
    */

    function verifyCardsMaxLimitExceeded(oMainComponent) {
        var oAllowedCardsConfiguration = oMainComponent && oMainComponent.getAllowedNumberOfCards();
        var iLimit = oAllowedCardsConfiguration && oAllowedCardsConfiguration.numberOfCards;
        var sWarningMsg = oAllowedCardsConfiguration && oAllowedCardsConfiguration.errorMessage;
        var aOrderedCards = oMainComponent && oMainComponent.getUIModel().getProperty("/aOrderedCards");
        var aVisibleCards = aOrderedCards && aOrderedCards.filter(function(card) { return card.visibility === true; });

        if (aVisibleCards && aVisibleCards.length >= iLimit) {    
            MessageBox.warning(sWarningMsg, {
                actions: MessageBox.Action.OK,                 
                emphasizedAction: MessageBox.Action.OK
            });
            return true;
        }
        return false;
    }

    return oSettingsUtils;
}, /* bExport= */ true);

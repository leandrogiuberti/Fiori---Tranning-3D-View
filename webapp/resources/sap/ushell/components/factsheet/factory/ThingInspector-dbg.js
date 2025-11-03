// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview This file contains an annotation parser for fact sheets.
 * @deprecated
 */
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/suite/ui/commons/UnifiedThingInspector",
    "sap/ui/core/format/NumberFormat",
    "sap/ui/core/Configuration",
    "sap/ui/core/Core",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/ui/core/Locale",
    "sap/ui/model/type/DateTime",
    "sap/ui/model/type/Time",
    "sap/ui/model/type/Date",
    "sap/ui/model/type/Float",
    "sap/ui/model/type/Integer",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Control",
    "sap/m/Image",
    "sap/m/Link",
    "sap/m/Text",
    "sap/ui/core/library",
    "sap/ui/layout/VerticalLayout",
    "sap/m/Label",
    "sap/ui/layout/form/SimpleForm",
    "sap/suite/ui/commons/UnifiedThingGroup",
    "sap/ui/ux3/ThingGroup",
    "sap/ui/core/HTML",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/m/library",
    "sap/m/Table",
    "sap/m/Page",
    "sap/m/VBox",
    "sap/m/Input",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/ui/model/FilterOperator",
    "sap/m/DateTimeInput",
    "sap/ui/model/Filter",
    "sap/m/ViewSettingsItem",
    "sap/m/ViewSettingsCustomItem",
    "sap/ui/core/CustomData",
    "sap/m/ViewSettingsDialog",
    "sap/ui/model/Sorter",
    "sap/m/Toolbar",
    "sap/m/ToolbarSpacer",
    "sap/m/Button",
    "sap/viz/ui5/Area",
    "sap/viz/ui5/Bar",
    "sap/viz/ui5/Bubble",
    "sap/viz/ui5/Column",
    "sap/viz/ui5/StackedColumn",
    "sap/viz/ui5/StackedColumn100",
    "sap/viz/ui5/Donut",
    "sap/viz/ui5/Heatmap",
    "sap/viz/ui5/HorizontalArea",
    "sap/viz/ui5/Line",
    "sap/viz/ui5/Pie",
    "sap/viz/ui5/Scatter",
    "sap/viz/ui5/Treemap",
    "sap/viz/ui5/types/Title",
    "sap/suite/ui/commons/KpiTile",
    "sap/ui/model/odata/ODataModel",
    "sap/suite/ui/commons/FacetOverview",
    "sap/suite/ui/commons/library",
    "sap/ui/layout/Grid",
    "sap/ui/vbm/VBI",
    "sap/ui/layout/HorizontalLayout",
    "sap/ui/core/Icon",
    "sap/m/Carousel",
    "sap/ui/core/IconPool",
    "sap/ushell/resources",
    "sap/ushell/ui/footerbar/AddBookmarkButton",
    "sap/suite/ui/commons/LinkActionSheet",
    "sap/ushell/services/AppConfiguration",
    "sap/m/ActionSheet",
    "sap/ushell/ui/footerbar/JamDiscussButton",
    "sap/ushell/ui/footerbar/JamShareButton"
], (
    jQuery,
    UnifiedThingInspector,
    NumberFormat,
    Configuration,
    Core,
    FlattenedDataset,
    Locale,
    DateTime,
    Time,
    Date,
    Float,
    Integer,
    JSONModel,
    Control,
    Image,
    Link,
    Text,
    coreLibrary,
    VerticalLayout,
    Label,
    SimpleForm,
    UnifiedThingGroup,
    ThingGroup,
    HTML,
    Column,
    ColumnListItem,
    mobileLibrary,
    Table,
    Page,
    VBox,
    Input,
    List,
    StandardListItem,
    FilterOperator,
    DateTimeInput,
    Filter,
    ViewSettingsItem,
    ViewSettingsCustomItem,
    CustomData,
    ViewSettingsDialog,
    Sorter,
    Toolbar,
    ToolbarSpacer,
    Button,
    Area,
    Bar,
    Bubble,
    ui5Column,
    StackedColumn,
    StackedColumn100,
    Donut,
    Heatmap,
    HorizontalArea,
    Line,
    Pie,
    Scatter,
    Treemap,
    Title,
    KpiTile,
    ODataModel,
    FacetOverview,
    commonsLibrary,
    Grid,
    VBI,
    HorizontalLayout,
    Icon,
    Carousel,
    IconPool,
    resources,
    AddBookmarkButton,
    LinkActionSheet,
    AppConfiguration,
    ActionSheet,
    JamDiscussButton,
    JamShareButton
) => {
    "use strict";

    // shortcut for sap.m.URLHelper
    const URLHelper = mobileLibrary.URLHelper;

    // shortcut for sap.m.PlacementType
    const PlacementType = mobileLibrary.PlacementType;

    // shortcut for sap.suite.ui.commons.FacetOverviewHeight
    const FacetOverviewHeight = commonsLibrary.FacetOverviewHeight;

    // shortcut for sap.m.DateTimeInputType
    const DateTimeInputType = mobileLibrary.DateTimeInputType;

    // shortcut for sap.m.ListMode
    const ListMode = mobileLibrary.ListMode;

    // shortcut for sap.m.ListSeparators
    const ListSeparators = mobileLibrary.ListSeparators;

    // shortcut for sap.m.BackgroundDesign
    const BackgroundDesign = mobileLibrary.BackgroundDesign;

    // shortcut for sap.m.ListType
    const ListType = mobileLibrary.ListType;

    // shortcut for sap.ui.core.TextAlign
    const TextAlign = coreLibrary.TextAlign;

    let oMapping = {};
    let aAllFacets = [];
    const oLinkAuthorised = {};
    const newJSONModels = {};
    const FACTSHEET = "displayFactSheet";
    let oLocale;
    let oTI;

    oLocale = Configuration.getFormatSettings().getFormatLocale();
    if (Configuration.getLanguage() === "ZH") {
        oLocale = new Locale("zh_CN");
    }

    function isNegativeValue (value) {
        return value < 0;
    }

    function toPositiveNumberWithoutDecimals (value) {
        let result = Number(value).toFixed(0);
        if (isNegativeValue(value)) {
            result = Number(result) * -1;
        }
        return result;
    }

    function kpiValueFormatter (value, fractionDigits) {
        let oNumberFormatter;
        if (!value) {
            return "";
        }
        const oRegExp = new RegExp(NumberFormat.oDefaultFloatFormat.groupingSeparator, "g");
        if (fractionDigits >= 0) {
            fractionDigits = parseInt(fractionDigits, 10);
            oNumberFormatter = NumberFormat.getFloatInstance({ minFractionDigits: fractionDigits, maxFractionDigits: fractionDigits }, oLocale);
        } else {
            oNumberFormatter = NumberFormat.getFloatInstance({ minFractionDigits: 0, maxFractionDigits: 99 }, oLocale);
        }
        const result = oNumberFormatter.format(value);
        const sDigits = result.replace(/[\D]/g, "");
        if (sDigits && sDigits.length > 6) {
            value = value.replace(oRegExp, "");
            if (toPositiveNumberWithoutDecimals(value) < 1000) {
                // show integer part only without a fraction part
                return NumberFormat.getIntegerInstance().format(value);
            }
            oNumberFormatter = NumberFormat.getFloatInstance({ minFractionDigits: 1, maxFractionDigits: 1, style: "short" }, oLocale);
            return oNumberFormatter.format(value);
        }
        return result;
    }

    function searchObj (obj, property) {
        let key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (key === "__metadata") {
                    continue;
                } else if (key === property) {
                    return obj[key];
                } else if (typeof obj[key] === "object") {
                    return searchObj(obj[key], property);
                }
            }
        }
    }

    function newModelValue (sUrl) {
        let newJSONModel = {};
        let returnValue;
        const iLastSlash = sUrl.lastIndexOf("/");
        const newUrl = sUrl.slice(0, iLastSlash);
        const newProp = sUrl.slice(iLastSlash + 1);
        if (!newJSONModels[sUrl]) {
            newJSONModel = new JSONModel();
            newJSONModel.loadData(newUrl, null, false);
            newJSONModels[sUrl] = newJSONModel.getData();
        } else {
            newJSONModel = newJSONModels[sUrl];
        }
        if (newJSONModels[sUrl] && newJSONModels[sUrl].d) {
            if (!newJSONModels[sUrl].d[newProp]) {
                returnValue = searchObj(newJSONModels[sUrl].d, newProp);
            } else {
                returnValue = newJSONModels[sUrl].d[newProp];
            }
        }
        return returnValue;
    }

    // End workaround
    // HANA Live
    function fnChange () {
        let oUrl = "";
        let sProperty;
        let sPropertyValue;
        let sNewValue;
        let sPropertyName;
        let sValueFormat;
        const sPath = this.getElementBinding().sPath.split("/")[1];
        const oModel = this.getModel();
        const aUrl = this.mBindingInfos.value.parameters;
        const aParameters = this.mBindingInfos.value.parts;
        for (let i = 0; i < aUrl.length; ++i) {
            oUrl = oUrl + aUrl[i].string;
        }
        for (let j = 0; j < aParameters.length; ++j) {
            sProperty = aParameters[j].path;
            sPropertyName = `{${sProperty}}`;
            sPropertyValue = oModel.oData[sPath][sProperty];
            oUrl = oUrl.replace(sPropertyName, sPropertyValue);
        }
        sNewValue = newModelValue(oUrl);
        if (typeof sNewValue === "number" && !isNaN(sNewValue)) {
            sValueFormat = this.mBindingInfos.value.parts.filter((obj) => {
                return (obj.path === sProperty);
            });
            sNewValue = kpiValueFormatter(sNewValue, sValueFormat[0].type.oFormatOptions.maxFractionDigits);
            this.setDoubleFontSize(true);
        }
        this.setValue(sNewValue);
        this.getElementBinding().detachChange(fnChange);
    }

    function getTIDescription () {
        let sTIDescription = "";
        if (oTI.getName() && oTI.getDescription()) {
            sTIDescription = `${oTI.getName()}, ${oTI.getDescription()}`;
        } else if (oTI.getName() && !oTI.getDescription()) {
            sTIDescription = oTI.getName();
        } else if (!oTI.getName() && oTI.getDescription()) {
            sTIDescription = oTI.getDescription();
        }
        return sTIDescription;
    }

    function getServiceFromUri (sUri) {
        const aUriParts = sUri.slice(1).split("/");
        let sService = "/";
        for (let i = 0; i < aUriParts.length; ++i) {
            if ((aUriParts[i].indexOf("(") > 0) && (aUriParts[i].indexOf("sid(") < 0)) {
                break;
            } else {
                sService += `${aUriParts[i]}/`;
            }
        }
        return sService;
    }

    function getEntitySetFromUri (sUri, oModel) {
        let sEntitySet;
        const sEntityUri = sUri.slice(oModel.sServiceUrl.length + 1);
        if (sEntityUri.indexOf("/") >= 0) {
            const aServiceParts = sEntityUri.split("/");
            const sNavProperty = aServiceParts[aServiceParts.length];
            sEntitySet = aServiceParts[aServiceParts.length - 1];
            if (sEntitySet.indexOf("(") >= 0) {
                sEntitySet = sEntitySet.slice(sEntitySet.indexOf("("));
            }
            sEntitySet = this.getNavEntitySet(sEntitySet, sNavProperty, oModel.getMetadata());
        } else if (sEntityUri.indexOf("(") >= 0) {
            sEntitySet = sEntityUri.slice(0, sEntityUri.indexOf("("));
        } else if (sEntityUri.indexOf("?") >= 0) {
            sEntitySet = sEntityUri.slice(0, sEntityUri.indexOf("?"));
        } else {
            sEntitySet = sEntityUri;
        }
        return sEntitySet;
    }

    function getKeyProperty (sEntityType, oMetadata) {
        let metadataSchema;
        for (let i = oMetadata.dataServices.schema.length - 1; i >= 0; --i) {
            metadataSchema = oMetadata.dataServices.schema[i];
            if (metadataSchema.namespace === sEntityType.slice(0, sEntityType.lastIndexOf("."))) {
                for (let j = 0; j < metadataSchema.entityType.length; ++j) {
                    if (metadataSchema.entityType[j].name === sEntityType.slice(sEntityType.lastIndexOf(".") + 1)) {
                        return metadataSchema.entityType[j].key.propertyRef[0].name;
                    }
                }
            }
        }
    }

    function getEntityType (sEntitySet, oMetadata, bWithoutNamespace) {
        let metadataSchema;
        let aEntitySets;
        let sReturn;
        for (let i = oMetadata.dataServices.schema.length - 1; i >= 0; --i) {
            metadataSchema = oMetadata.dataServices.schema[i];
            if (metadataSchema.entityContainer) {
                aEntitySets = metadataSchema.entityContainer[0].entitySet;
                for (let j = aEntitySets.length - 1; j >= 0; --j) {
                    if (aEntitySets[j].name === sEntitySet) {
                        if (bWithoutNamespace) {
                            sReturn = aEntitySets[j].entityType.slice(metadataSchema.namespace.length + 1);
                        } else {
                            sReturn = aEntitySets[j].entityType;
                        }
                        return sReturn;
                    }
                }
            }
        }
    }

    function getEntityKeyFromUri (sUri, oModel) {
        let sKey = "";
        const sEntityUri = sUri.slice(oModel.sServiceUrl.length + 1);
        if (sEntityUri.indexOf("(") >= 0) {
            sKey = sEntityUri.slice(sEntityUri.indexOf("(") + 1, sEntityUri.indexOf(")"));
            if (sKey.indexOf("=") <= 0) {
                // There is just one key property and the shortened notation was used, get name of the key property
                const oMetadata = oModel.getServiceMetadata();
                const sEntityType = getEntityType(getEntitySetFromUri(sUri, oModel), oMetadata);
                sKey = `${getKeyProperty(sEntityType, oMetadata)}=${sKey}`;
            }
        }
        return sKey;
    }

    function getEntitySetFromType (sEntityType, oMetadata) {
        let metadataSchema;
        let aEntitySets;
        for (let i = oMetadata.dataServices.schema.length - 1; i >= 0; --i) {
            metadataSchema = oMetadata.dataServices.schema[i];
            if (metadataSchema.entityContainer) {
                aEntitySets = metadataSchema.entityContainer[0].entitySet;
                for (let j = aEntitySets.length - 1; j >= 0; --j) {
                    if (aEntitySets[j].entityType === sEntityType) {
                        return aEntitySets[j].name;
                    }
                }
            }
        }
    }

    function getAssociation (sEntityType, sNavProperty, oMetadata) {
        let metadataSchema;
        let sNameSpace;
        let oNavProperty;
        const aNsEntityType = sEntityType.split(".");
        for (let i = oMetadata.dataServices.schema.length - 1; i >= 0; --i) {
            metadataSchema = oMetadata.dataServices.schema[i];
            sNameSpace = aNsEntityType[0];
            if (aNsEntityType.length > 2) {
                for (let k = 1; k < aNsEntityType.length - 1; ++k) {
                    sNameSpace += `.${aNsEntityType[k]}`;
                }
            }
            if (metadataSchema.namespace === sNameSpace) {
                for (let j = 0; j < metadataSchema.entityType.length; ++j) {
                    if (metadataSchema.entityType[j].name === aNsEntityType[aNsEntityType.length - 1]) {
                        if (metadataSchema.entityType[j].navigationProperty) {
                            for (let k = 0; k < metadataSchema.entityType[j].navigationProperty.length; ++k) {
                                if (metadataSchema.entityType[j].navigationProperty[k].name === sNavProperty) {
                                    oNavProperty = metadataSchema.entityType[j].navigationProperty[k];
                                    return { name: oNavProperty.relationship, toRole: oNavProperty.toRole };
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    function getNavEntitySet (sEntitySet, sNavProperty, oMetadata) {
        let metadataSchema;
        let sAssociationSet;
        const sEntityType = getEntityType(sEntitySet, oMetadata);
        if (sNavProperty.charAt(0) === "@") {
            if (oMapping.termDefinitions && oMapping.termDefinitions[sNavProperty]) {
                let termTargetType = oMapping.termDefinitions[sNavProperty];
                if (termTargetType.indexOf("Collection") >= 0) {
                    termTargetType = termTargetType.slice(termTargetType.indexOf("(") + 1, termTargetType.indexOf(")"));
                }
                return getEntitySetFromType(termTargetType, oMetadata);
            }
        } else {
            const oAssociation = getAssociation(sEntityType, sNavProperty, oMetadata);
            if (oAssociation) {
                for (let i = oMetadata.dataServices.schema.length - 1; i >= 0; --i) {
                    metadataSchema = oMetadata.dataServices.schema[i];
                    if (metadataSchema.entityContainer && metadataSchema.entityContainer[0].associationSet) {
                        for (let j = metadataSchema.entityContainer[0].associationSet.length - 1; j >= 0; --j) {
                            sAssociationSet = metadataSchema.entityContainer[0].associationSet[j];
                            if (sAssociationSet.association === oAssociation.name) {
                                for (let k = 0; k < sAssociationSet.end.length; ++k) {
                                    if (sAssociationSet.end[k].role === oAssociation.toRole) {
                                        return sAssociationSet.end[k].entitySet;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    function getAssociationMultiplicity (sEntitySet, sNavProperty, oMetadata) {
        let metadataSchema;
        let sAssociation;
        let sToRoleName;
        const sEntityType = getEntityType(sEntitySet, oMetadata);
        const sEntityTypeName = sEntityType.split(".")[sEntityType.split(".").length - 1];
        const oAssociation = getAssociation(sEntityType, sNavProperty, oMetadata);
        if (oAssociation) {
            for (let i = oMetadata.dataServices.schema.length - 1; i >= 0; --i) {
                metadataSchema = oMetadata.dataServices.schema[i];
                for (let j = 0; j < metadataSchema.entityType.length && !sToRoleName; ++j) {
                    if (metadataSchema.entityType[j].name === sEntityTypeName) {
                        for (let k = 0; k < metadataSchema.entityType[j].navigationProperty.length; ++k) {
                            if (metadataSchema.entityType[j].navigationProperty[k].name === sNavProperty) {
                                sToRoleName = metadataSchema.entityType[j].navigationProperty[k].toRole;
                                break;
                            }
                        }
                    }
                }
                for (let j = metadataSchema.association.length - 1; j >= 0; --j) {
                    sAssociation = metadataSchema.association[j];
                    if (`${metadataSchema.namespace}.${sAssociation.name}` === oAssociation.name) {
                        for (let k = 0; k < sAssociation.end.length; ++k) {
                            if (sAssociation.end[k].role === sToRoleName) {
                                return sAssociation.end[k].multiplicity;
                            }
                        }
                    }
                }
            }
        } else {
            jQuery.sap.log.error(`"${sNavProperty}" wasn't found in the metadata document. Check whether the corresponding search connector is active.`);
            return 0;
        }
    }

    function getExpand (sEntitySet, oMetadata) {
        let elem;
        const oExpand = {};
        if (oMapping.expand) {
            if (oMapping.expand[getEntityType(sEntitySet, oMetadata)]) {
                const oExpandEntities = oMapping.expand[getEntityType(sEntitySet, oMetadata)];
                const aExpand = [];
                for (elem in oExpandEntities) {
                    if (oExpandEntities.hasOwnProperty(elem)) {
                        aExpand.push(oExpandEntities[elem]);
                    }
                }
                oExpand.expand = aExpand.join(", ");
            }
        }
        return oExpand;
    }

    function getNavTypeForNavPath (sNavPath, sEntityType, oMetadata) {
        let metadataSchema;
        for (let m = oMetadata.dataServices.schema.length - 1; m >= 0; --m) {
            metadataSchema = oMetadata.dataServices.schema[m];
            for (let j = 0; j < metadataSchema.entityType.length; ++j) {
                if (metadataSchema.entityType[j].name === sEntityType.split(".")[sEntityType.split(".").length - 1]) {
                    for (let k = 0; k < metadataSchema.entityType[j].navigationProperty.length; ++k) {
                        if (metadataSchema.entityType[j].navigationProperty[k].name === sNavPath) {
                            for (let l = 0; l < metadataSchema.association.length; ++l) {
                                for (let n = metadataSchema.association[l].end.length - 1; n >= 0; --n) {
                                    if (metadataSchema.association[l].end[n].role === metadataSchema.entityType[j].navigationProperty[k].toRole) {
                                        return (metadataSchema.association[l].end[n].type);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /* UI Renderer */

    function propertyPartsWithStrings (aParts, oFormatter) {
        const oBinding = {};
        oBinding.parts = [];
        oBinding.parameters = [];
        for (let j = aParts.length - 1; j >= 0; --j) {
            if (aParts[j].Type === "Path") {
                if (aParts[j].EdmType) {
                    switch (aParts[j].EdmType) {
                        case "Edm.DateTimeOffset":
                        case "Edm.DateTime":
                            oBinding.parts.push({ path: aParts[j].Value, type: new DateTime({ UTC: true }) });
                            break;
                        case "Edm.Time":
                            oBinding.parts.push({
                                path: `${aParts[j].Value}/ms`,
                                type: new Time({
                                    source: { pattern: "timestamp" },
                                    UTC: true
                                })
                            });
                            break;
                        case "Edm.Date":
                            oBinding.parts.push({ path: aParts[j].Value, type: new Date({ UTC: true }) });
                            break;
                        case "Edm.Decimal":
                        case "Edm.Double":
                        case "Edm.Single":
                            oBinding.parts.push({ path: aParts[j].Value, type: new Float() });
                            break;
                        case "Edm.Int16":
                        case "Edm.Int32":
                        case "Edm.Int64":
                            oBinding.parts.push({ path: aParts[j].Value, type: new Integer() });
                            break;
                        default:
                            oBinding.parts.push({ path: aParts[j].Value });
                            break;
                    }
                } else {
                    oBinding.parts.push({ path: aParts[j].Value });
                }
            } else if (aParts[j].Type === "String") {
                // HANA Live: set strings as parameter
                oBinding.parameters.unshift({ string: aParts[j].Value });
            }
        }
        oBinding.formatter = function () {
            let sValue = "";
            let sLastSeparator = "";
            let bEncodeUriComponent = false;
            let aHasValueCount = 0;
            let aBracketSeparatorCount = 0;
            if (arguments && arguments.length >= 1) {
                let sPathIndex = arguments.length - 1;
                let sLastValue = "";
                let aValueLastLen = 0;
                if (aParts && aParts[0] && (aParts[0].Type === "String") && (aParts[0].Value.substr(0, 1) === "#")) {
                    bEncodeUriComponent = true;
                }
                for (let k = 0; k < aParts.length; ++k) {
                    if (aParts[k].Type === "Path") {
                        sLastValue = arguments[sPathIndex];
                        if (!sLastValue || (sLastValue.length === 0)) {
                            if (sValue.length > aValueLastLen) {
                                // Remove last separator if argument is empty
                                if (sValue.indexOf("(") > aValueLastLen) {
                                    sValue = sValue.substr(0, aValueLastLen);
                                } else {
                                    sValue = sValue.substr(0, aValueLastLen);
                                    sLastValue = sValue;
                                }
                            }
                        } else {
                            if (bEncodeUriComponent) {
                                sLastValue = encodeURIComponent(sLastValue);
                            }
                            sValue += sLastValue;
                            aHasValueCount += 1;
                        }
                        sPathIndex -= 1;
                        aValueLastLen = sValue.length;
                    } else {
                        aValueLastLen = sValue.length;
                        sLastSeparator = aParts[k].Value;
                        if (sLastSeparator.indexOf("(") !== -1) {
                            aBracketSeparatorCount += 1;
                        }
                        if ((sLastValue && sLastValue.length > 0) || (sLastSeparator.indexOf("(") !== -1) ||
                            (sLastSeparator && (sLastSeparator.substr(0, 1) === "#"))) {
                            // only add separator if last argument was not empty
                            sValue += aParts[k].Value;
                        } else {
                            sLastSeparator = "";
                        }
                    }
                }
                if (oFormatter) {
                    sValue = oFormatter(sValue);
                }
                sValue = sValue.trim();
                if ((aHasValueCount === 1) && (aBracketSeparatorCount > 0) && (sValue.substr(0, 1) === "(") && (sValue.substr(-1) === ")")) {
                    // Remove brackets if it's the only non-empty value in brackets
                    sValue = sValue.substr(1, sValue.length - 2);
                }
                return sValue.trim();
            }
        };
        return oBinding;
    }

    function navigationBinding (oUrl) {
        const aUrlParts = [];
        let aParams;
        let aTemplateParts;
        let aTemplateValueParts;
        let oUrlParts = {};
        let oParaValue;
        let oResolution;
        let sSystem;
        if (oUrl && oUrl.Apply) {
            aParams = oUrl.Apply.Parameters;
            switch (oUrl.Apply.Name) {
                case "odata.fillUriTemplate":
                    aParams[0].Value = aParams[0].Value.trim();
                    aTemplateParts = aParams[0].Value.split("{");
                    for (let j = 0; j < aTemplateParts.length; ++j) {
                        if (aTemplateParts[j].indexOf("}") < 0) {
                            aUrlParts.push({ Value: aTemplateParts[j], Type: "String" });
                        } else {
                            aTemplateValueParts = aTemplateParts[j].split("}");
                            oUrlParts = {};
                            oUrlParts.Value = aTemplateValueParts[0];
                            oUrlParts.Type = "Path";
                            for (j = 1; j < aParams.length; ++j) {
                                if (aParams[j].Name === oUrlParts.Value) {
                                    oParaValue = aParams[j].Value;
                                    if (oParaValue.Path) {
                                        oUrlParts.Value = oParaValue.Path;
                                    } else if (oParaValue.Apply && oParaValue.Apply.Name && oParaValue.Apply.Name.toLowerCase() === "odata.uriencode") {
                                        oUrlParts.Value = oParaValue.Apply.Parameters[0].Value;
                                    }
                                    break;
                                }
                            }
                            aUrlParts.push(oUrlParts);
                            aUrlParts.push({ Value: aTemplateValueParts[1], Type: "String" });
                        }
                    }
                    oResolution = sap.ushell.Container.getService("NavTargetResolutionInternal").getCurrentResolution();
                    if (oResolution && oResolution.url) {
                        sSystem = jQuery.sap.getUriParameters(oResolution.url).get("sap-system");
                        if (sSystem) {
                            aUrlParts.push({ Type: "String", Value: `&sap-system=${sSystem}` });
                        }
                    }
                    break;
                default:
                    break;
            }
        }
        return propertyPartsWithStrings(aUrlParts);
    }

    function fieldBinding (oFieldValue, sEdmType, sEntityType) {
        const oBinding = {};
        const aPartsWithPropAnnotations = [];
        let aParameters = [];
        const aTextParts = [];
        let oPropAnnotations;
        let aParts;
        let oUrl;
        let sUrlProperties;
        let aParams;
        let aTemplProperties;
        let aUrlPathProperties;
        let oParaValue;
        let oParam;
        let fnType;
        function getPropAnnotations (sEntityType, attribute1, attribute2) {
            const result = {};
            const oPropAnnotations = oMapping.propertyAnnotations[sEntityType];
            if (oPropAnnotations && oPropAnnotations[attribute1] && oPropAnnotations[attribute1][attribute2]) {
                if (oPropAnnotations[attribute1][attribute2].Path) {
                    result.Type = "Path";
                    result.Value = oPropAnnotations[attribute1][attribute2].Path;
                } else {
                    result.Type = "String";
                    result.Value = oPropAnnotations[attribute1][attribute2].String;
                }
            }
            return result;
        }
        if (!oFieldValue) {
            return false;
        }
        if (oFieldValue.Apply) { // apply function
            if (oFieldValue.Apply.Name === "odata.concat") {
                if (sEntityType && oMapping.propertyAnnotations && oMapping.propertyAnnotations[sEntityType]) {
                    aParts = oFieldValue.Apply.Parameters;
                    for (let j = 0; j < aParts.length; ++j) {
                        aPartsWithPropAnnotations.push(aParts[j]);
                        if (aParts[j].Type === "Path") {
                            oPropAnnotations = getPropAnnotations(sEntityType, aParts[j].Value, "Org.OData.Measures.V1.ISOCurrency");
                            if (!jQuery.isEmptyObject(oPropAnnotations)) {
                                aPartsWithPropAnnotations.push({ Type: "String", Value: " " });
                                aPartsWithPropAnnotations.push({ Type: oPropAnnotations.Type, Value: oPropAnnotations.Value });
                            }
                            oPropAnnotations = getPropAnnotations(sEntityType, aParts[j].Value, "Org.OData.Measures.V1.Unit");
                            if (!jQuery.isEmptyObject(oPropAnnotations)) {
                                aPartsWithPropAnnotations.push({ Type: "String", Value: " " });
                                aPartsWithPropAnnotations.push({ Type: oPropAnnotations.Type, Value: oPropAnnotations.Value });
                            }
                        }
                    }
                    oBinding.BindingInfo = propertyPartsWithStrings(aPartsWithPropAnnotations);
                } else {
                    oBinding.BindingInfo = propertyPartsWithStrings(oFieldValue.Apply.Parameters);
                }
            }
        } else if (oFieldValue.Path) {
            // property path
            if (oFieldValue.Path.charAt(0) === "@") { // property path with navigation defined in annotation
                oUrl = oMapping[sEntityType][oFieldValue.Path.slice(1, oFieldValue.Path.indexOf("/"))].UrlRef;
                sUrlProperties = oFieldValue.Path.slice(oFieldValue.Path.indexOf("/") + 1);
                if (oUrl && oUrl.Apply) {
                    aParams = oUrl.Apply.Parameters;
                    switch (oUrl.Apply.Name) {
                        case "odata.concat":
                            aParameters = aParams;
                            aParameters.push({ Type: "String", Value: `/${sUrlProperties}` });
                            break;
                        case "odata.fillUriTemplate":
                            aTemplProperties = aParams[0].Value.split("{");
                            for (const i in aTemplProperties) {
                                if (aTemplProperties.hasOwnProperty(i)) {
                                    if (aTemplProperties[i].indexOf("}") < 0) {
                                        aParameters.push({ Type: "String", Value: aTemplProperties[i] });
                                    } else {
                                        aUrlPathProperties = aTemplProperties[i].split("}");
                                        for (let j = 1; j < aParams.length; ++j) {
                                            if (aParams[j].Name === aUrlPathProperties[0]) {
                                                oParaValue = aParams[j].Value;
                                                if (oParaValue.Path) {
                                                    aParameters.push({ Type: "Path", Value: oParaValue.Path });
                                                } else if (oParaValue.Apply && oParaValue.Apply.Name && (oParaValue.Apply.Name.toLowerCase() === "odata.uriencode")) {
                                                    oParam = oParaValue.Apply.Parameters[0];
                                                    aParameters.push({ Type: oParam.Type, Value: encodeURIComponent(oParam.Value) });
                                                    // HANA Live - put property as string to parameters (later needed for constructing URL)
                                                    aParameters.push({ Type: "String", Value: `{${encodeURIComponent(oParam.Value)}}` });
                                                }
                                            }
                                        }
                                        aParameters.push({ Type: "String", Value: aUrlPathProperties[1] });
                                    }
                                }
                            }
                            aParameters.push({ Type: "String", Value: `/${sUrlProperties}` });
                            // HANA Live
                            oBinding.fnChange = fnChange;
                            break;
                        default:
                            break;
                    }
                    oBinding.BindingInfo = propertyPartsWithStrings(aParameters, newModelValue);
                } else if (oUrl && oUrl.Path) {
                    aParameters.push({ Type: "Path", Value: oUrl.Path }, { Type: "String", Value: `/${sUrlProperties}` });
                    oBinding.BindingInfo = propertyPartsWithStrings(aParameters, newModelValue);
                } else if (oUrl && oUrl.String) {
                    oBinding.String = newModelValue(`${oUrl.String}/${sUrlProperties}`);
                }
            } else { // property path defined in the model
                oBinding.BindingInfo = {};
                switch (sEdmType) {
                    case "Edm.DateTimeOffset":
                    case "Edm.DateTime":
                        oBinding.BindingInfo = { path: oFieldValue.Path, type: new DateTime({ UTC: true }) };
                        break;
                    case "Edm.Time":
                        oBinding.BindingInfo = {
                            path: `${oFieldValue.Path}/ms`,
                            type: new Time({
                                source: { pattern: "timestamp" },
                                UTC: true
                            })
                        };
                        break;
                    case "Edm.Date":
                        oBinding.BindingInfo = { path: oFieldValue.Path, type: new Date({ UTC: true }) };
                        break;
                    case "Edm.Decimal":
                    case "Edm.Double":
                    case "Edm.Single":
                    case "Edm.Int16":
                    case "Edm.Int32":
                    case "Edm.Int64":
                        if ((sEdmType === "Edm.Decimal") || (sEdmType === "Edm.Double") || (sEdmType === "Edm.Single")) {
                            fnType = new Float();
                        } else if ((sEdmType === "Edm.Int16") || (sEdmType === "Edm.Int32") || (sEdmType === "Edm.Int64")) {
                            fnType = new Integer();
                        }
                        if (oMapping.propertyAnnotations) {
                            aTextParts.push({ Type: "Path", Value: oFieldValue.Path, EdmType: sEdmType }, { Type: "String", Value: " " });
                            oPropAnnotations = getPropAnnotations(sEntityType, oFieldValue.Path, "Org.OData.Measures.V1.ISOCurrency");
                            if (!jQuery.isEmptyObject(oPropAnnotations)) {
                                aTextParts.push({ Type: oPropAnnotations.Type, Value: oPropAnnotations.Value });
                            }
                            oPropAnnotations = getPropAnnotations(sEntityType, oFieldValue.Path, "Org.OData.Measures.V1.Unit");
                            if (!jQuery.isEmptyObject(oPropAnnotations)) {
                                aTextParts.push({ Type: oPropAnnotations.Type, Value: oPropAnnotations.Value });
                            }
                            oBinding.BindingInfo = propertyPartsWithStrings(aTextParts);
                        } else {
                            oBinding.BindingInfo = { path: oFieldValue.Path, type: fnType };
                        }
                        break;
                    default:
                        oBinding.BindingInfo = { path: oFieldValue.Path };
                        break;
                }
            }
        } else if (oFieldValue.String) {
            // hard coded string in annotation
            oBinding.String = oFieldValue.String;
        }
        return oBinding;
    }

    function dataField (oField, sEntityType, oMetadata, oFacet) {
        let oControl;
        let sNavProperty;
        let oUrl;
        let oText;
        let oVL;
        let SemanticObject;
        let sIntend;
        oControl = new Control();
        const oBinding = fieldBinding(oField.Value, oField.EdmType, sEntityType);
        if (oField.Value && oField.Value["com.sap.vocabularies.UI.v1.IsImageURL"]) {
            oControl = new Image({ height: "50px" });
            if (oBinding.BindingInfo) {
                oControl.bindProperty("src", oBinding.BindingInfo);
            } else {
                oControl.setProperty("src", oBinding.String);
            }
        } else {
            if (oField.UrlRef || oField.Url || (oField.Target && oField.Target.Path)) {
                oControl = new Link({ wrapping: true });
            } else {
                oControl = new Text();
                if (oField.EdmType === "Edm.Decimal" || oField.EdmType === "Edm.Double" || oField.EdmType === "Edm.Single" ||
                    oField.EdmType === "Edm.Int16" || oField.EdmType === "Edm.Int32" || oField.EdmType === "Edm.Int64") {
                    oControl.setTextAlign(TextAlign.End);
                }
            }
            oControl.addStyleClass("sapFactsheetUtiDataField");
            if (oBinding.BindingInfo) {
                oControl.bindProperty("text", oBinding.BindingInfo);
            } else {
                oControl.setProperty("text", oBinding.String);
            }
        }
        if ((oField.RecordType === "com.sap.vocabularies.UI.v1.DataFieldWithNavigation") && oMetadata) {
            sNavProperty = oField.Target.Path;
            if (oMapping[sEntityType][sNavProperty.slice(1)]) {
                if (sNavProperty.charAt(0) === "@") {
                    if (sNavProperty.indexOf("/") < 0) {
                        oUrl = oMapping[sEntityType][sNavProperty.slice(1)].UrlRef;
                    } else {
                        oUrl = oMapping[sEntityType][sNavProperty.slice(1, sNavProperty.indexOf("/"))].UrlRef;
                    }
                    oControl.bindProperty("href", navigationBinding(oUrl));
                }
            }
            oControl.attachPress((oEvent) => {
                return false;
            });
        }
        if (oField.RecordType === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") {
            if (oField.Url.String) {
                oControl.setHref(oField.Url.String);
            } else {
                oControl.bindProperty("href", navigationBinding(oField.Url));
                // Workaround: no Link if no authority
                oText = new Text({
                    wrapping: true
                });
                if (oBinding.BindingInfo) {
                    oText.bindProperty("text", jQuery.extend({}, oBinding.BindingInfo));
                } else {
                    oText.setProperty("text", oBinding.String);
                }
                oControl.setVisible(false);
                oVL = new VerticalLayout();
                oVL.addContent(oControl);
                oVL.addContent(oText);
                if (!aAllFacets[aAllFacets.indexOf(oFacet)].Links) {
                    aAllFacets[aAllFacets.indexOf(oFacet)].Links = [];
                }
                if (oField.Url.Apply) {
                    SemanticObject = oField.Url.Apply.Parameters[0].Value.slice(oField.Url.Apply.Parameters[0].Value.indexOf("#") + 1, oField.Url.Apply.Parameters[0].Value.indexOf("-"));
                    sIntend = oField.Url.Apply.Parameters[0].Value.slice(oField.Url.Apply.Parameters[0].Value.indexOf("#") + 1, oField.Url.Apply.Parameters[0].Value.indexOf("?"));
                }
                aAllFacets[aAllFacets.indexOf(oFacet)].Links.push({
                    sSemanticObject: SemanticObject,
                    sIntend: sIntend,
                    oVL: oVL
                });
                // Workaround: no Link if no authority
            }
        }
        // Workaround: no Link if no authority
        if (oVL) {
            return oVL;
        }
        return oControl;

        // Workaround: no Link if no authority
    }

    function labelBinding (oField, oLabelProperties, aPropExtensions, bWithColon) {
        let sColon = "";
        let sLabel = "";
        let oPropertyExt;
        let oParameter;
        const oLabel = new Label(oLabelProperties);
        oLabel.addStyleClass("sapFactsheetUtiLabel");
        if (bWithColon) {
            sColon = ":";
        }
        if (oField.Label) {
            if (oField.Label.String) {
                oLabel.setText(oField.Label.String.trim() + sColon);
                oLabel.setTooltip(oField.Label.String.trim());
            } else if (oField.Label.Path) {
                oLabel.bindProperty("text", oField.Label.Path);
                oLabel.bindProperty("tooltip", oField.Label.Path);
            }
        } else if (oField.Value) {
            if (oField.Value.Path && aPropExtensions) {
                oPropertyExt = aPropExtensions[oField.Value.Path];
                for (const j in oPropertyExt) {
                    if (oPropertyExt.hasOwnProperty(j)) {
                        if (j === "http://www.sap.com/Protocols/SAPData") {
                            if (oPropertyExt[j].label) {
                                sLabel = oPropertyExt[j].label;
                                break;
                            }
                        }
                    }
                }
            } else if (oField.Value.Apply && (oField.Value.Apply.Name === "odata.concat")) {
                for (const k in oField.Value.Apply.Parameters) {
                    if (oField.Value.Apply.Parameters.hasOwnProperty(k)) {
                        oParameter = oField.Value.Apply.Parameters[k];
                        if (oParameter.Type === "Path") {
                            oPropertyExt = aPropExtensions[oParameter.Value];
                            for (const j in oPropertyExt) {
                                if (oPropertyExt.hasOwnProperty(j)) {
                                    if (j === "http://www.sap.com/Protocols/SAPData") {
                                        if (oPropertyExt[j].label) {
                                            sLabel = oPropertyExt[j].label;
                                            break;
                                        }
                                    }
                                }
                            }
                            break;
                        }
                    }
                }
            }
            oLabel.setText(sLabel + sColon);
            oLabel.setTooltip(sLabel);
        }
        return oLabel;
    }

    function columnHAlign (oField) {
        let hAlign = TextAlign.Begin;
        if (oField.EdmType === "Edm.Decimal" || oField.EdmType === "Edm.Double" || oField.EdmType === "Edm.Single" ||
            oField.EdmType === "Edm.Int16" || oField.EdmType === "Edm.Int32" || oField.EdmType === "Edm.Int64") {
            hAlign = TextAlign.End;
        }
        return hAlign;
    }

    /**
     * Returns the importance (High, Medium, Low) of a given record.
     * Necessary as the annotation for importance changed in OData V4 and we'd like to support both V2 and V4.
     * @param {object} oRecord as object.
     * @returns {string} Importance of the record (High, Medium, Low).
     */
    function getImportanceOfRecord (oRecord) {
        let sEnumMember = "";
        if (oRecord.Importance) {
            sEnumMember = oRecord.Importance.EnumMember;
        } else if (oRecord["com.sap.vocabularies.UI.v1.Importance"]) {
            sEnumMember = oRecord["com.sap.vocabularies.UI.v1.Importance"].EnumMember;
        }
        return sEnumMember.substr(sEnumMember.indexOf("/") + 1);
    }

    function formLayoutFactory (oModel, sEntitySet, aFormData, oMaxItems, oMetadata, oFacet) {
        let j = 0;
        let iSumPrioHigh = 0;
        let iSumPrioMedium = 0;
        let iSumPrioLow = 0;
        let oImportance;
        let oControl;
        let oLabel;
        if (!oMetadata) {
            oMetadata = oModel.getServiceMetadata();
        }
        if (!aFormData) {
            aFormData = [];
        }
        const sEntityType = getEntityType(sEntitySet, oMetadata);
        const oSimpleForm = new SimpleForm({
            labelMinWidth: 150,
            maxContainerCols: 2
        });
        const aPropertyExtensions = (oMapping.propertyExtensions) ? oMapping.propertyExtensions[sEntityType] : [];
        if (oMaxItems && oMaxItems.High) {
            iSumPrioHigh = oMaxItems.High;
        }
        if (oMaxItems && oMaxItems.Medium) {
            iSumPrioMedium = oMaxItems.Medium;
        }
        if (oMaxItems && oMaxItems.Low) {
            iSumPrioLow = oMaxItems.Low;
        }
        for (let i = 0; i < aFormData.length; ++i) {
            oImportance = getImportanceOfRecord(aFormData[i]);
            if (oMaxItems && (oImportance === "High")) {
                if (iSumPrioHigh) {
                    iSumPrioHigh -= 1;
                } else {
                    continue;
                }
            } else if (oMaxItems && (oImportance === "Medium")) {
                if (iSumPrioMedium) {
                    --iSumPrioMedium;
                } else {
                    continue;
                }
            } else if (oMaxItems && (oImportance === "Low")) {
                if (iSumPrioLow) {
                    iSumPrioLow -= 1;
                } else {
                    continue;
                }
            }
            if (oMaxItems && oMaxItems.Total && (j >= oMaxItems.Total)) {
                break;
            }
            ++j;
            oControl = new Control().setModel(oModel);
            oLabel = labelBinding(aFormData[i], { textAlign: TextAlign.End }, aPropertyExtensions, false);
            oLabel.addStyleClass("sapFactsheetUtiFormPadding");
            oControl = dataField(aFormData[i], sEntityType, oMetadata, oFacet);
            oControl.addStyleClass("sapFactsheetUtiFormPadding");
            if (oControl.setTextAlign) {
                oControl.setTextAlign(TextAlign.Begin);
            }
            oSimpleForm.addContent(oLabel);
            oSimpleForm.addContent(oControl);
        }
        oSimpleForm.addStyleClass("sapFactsheetUtiFormLayout");
        return oSimpleForm;
    }

    function checkLinks (index) {
        let aItems;
        let aCells;
        let aLinks;
        if (oLinkAuthorised.InteropCompleted === true) {
            for (let i = 0; i < aAllFacets.length; ++i) {
                if (aAllFacets[i].bLoaded && !aAllFacets[i].bProcessed && aAllFacets[i].Links) {
                    aLinks = aAllFacets[i].Links;
                    for (let j = 0; j < aLinks.length; ++j) {
                        if (oLinkAuthorised.hasOwnProperty(aLinks[j].sIntend) === true) {
                            if (aAllFacets[i].bIsTable === true) {
                                if (aAllFacets[i].oTableItems) {
                                    aItems = aAllFacets[i].oTableItems;
                                    for (let k = 0; k < aItems.length; ++k) {
                                        aCells = aItems[k].getCells();
                                        for (let n = 0; n < aCells.length; ++n) {
                                            if (aCells[n] instanceof VerticalLayout &&
                                                aCells[n].getContent()[0].getBindingInfo("href").parts === aLinks[j].oVL.getContent()[0].getBindingInfo("href").parts &&
                                                aCells[n].getContent()[1].getBindingInfo("text").parts === aLinks[j].oVL.getContent()[1].getBindingInfo("text").parts) {
                                                aCells[n].getContent()[0].setVisible(true);
                                                aCells[n].getContent()[1].setVisible(false);
                                            }
                                        }
                                    }
                                }
                            } else {
                                aLinks[j].oVL.getContent()[0].setVisible(true);
                                aLinks[j].oVL.getContent()[1].setVisible(false);
                            }
                        } else if (aAllFacets[i].bIsTable === false) {
                            aLinks[j].oVL.getContent()[1].setText(aLinks[j].oVL.getContent()[0].getText());
                        }
                        aAllFacets[i].bProcessed = true;
                    }
                }
            }
        }
        if (index >= 0) {
            if (aAllFacets[index].bLoaded && !aAllFacets[index].bProcessed && aAllFacets[index].Links) {
                aLinks = aAllFacets[index].Links;
                for (let j = 0; j < aLinks.length; ++j) {
                    if (aAllFacets[index].bIsTable === false) {
                        aLinks[j].oVL.getContent()[1].setText(aLinks[j].oVL.getContent()[0].getText());
                    }
                }
            }
        }
    }

    function itemListFactory (oModel, aColumns, sEntityType, oMetadata, sBindingPath, oSelectedFacet, oPropertyExtensions, oFacet) {
        const aLabels = [];
        const aControls = [];
        const cells = [];
        const columns = [];
        const aSortItems = [];
        const aFilterItems = [];
        let bEnableSortFilterDialog = false;
        let iMaxColumns;
        let iPrioHighColumnCount;
        let iPrioMediumColumnCount;
        let oImportance;
        let oLabel;
        let bVisible;
        let oControl;
        let sTitle;
        let oSortItem;
        let sColumnName;
        let oFilterItem;
        let oCustomFilterControl;
        let bSortable;
        let sConcatColumnName;
        const oSuiteUiCommonsResourceBundle = Core.getLibraryResourceBundle("sap.suite.ui.commons");
        if (!oMetadata) {
            oMetadata = oModel.getServiceMetadata();
        }
        const aPropertyExtensions = (oMapping.propertyExtensions) ? oMapping.propertyExtensions[sEntityType] : [];
        iMaxColumns = 6; // Default value for desktop
        if (jQuery.device.is.tablet && jQuery.device.is.landscape) {
            iMaxColumns = 5;
        } else if (jQuery.device.is.tablet && jQuery.device.is.portrait) {
            iMaxColumns = 4;
        } else if (jQuery.device.is.phone && jQuery.device.is.landscape) {
            iMaxColumns = 3;
        } else if (jQuery.device.is.phone && jQuery.device.is.portrait) {
            iMaxColumns = 2;
        }
        iPrioHighColumnCount = 0;
        iPrioMediumColumnCount = 0;
        for (let i = 0; i < aColumns.length; ++i) {
            oImportance = getImportanceOfRecord(aColumns[i]);
            if (oImportance === "High") {
                iPrioHighColumnCount += 1;
            }
        }
        if (iMaxColumns > iPrioHighColumnCount) {
            iPrioMediumColumnCount = iMaxColumns - iPrioHighColumnCount;
        } else if (iMaxColumns < iPrioHighColumnCount) {
            iPrioHighColumnCount = iMaxColumns;
        }
        columns.push(new Column({ visible: false }));
        cells.push(new Text().bindText("__metadata/uri"));
        for (let i = 0; i < aColumns.length; ++i) {
            sConcatColumnName = "";
            oControl = new Control();
            oImportance = getImportanceOfRecord(aColumns[i]);
            oControl = dataField(aColumns[i], sEntityType, oMetadata, oFacet);
            oLabel = labelBinding(aColumns[i], null, aPropertyExtensions);
            // Enable sorting for non-concatenated fields
            if (aColumns[i].Value.Path) {
                // "ColumnName" is required for oData call for list sorting
                sColumnName = aColumns[i].Value.Path;
                // Check if column is sortable (if nothing is specified, column is sortable).
                if (oPropertyExtensions && oPropertyExtensions[sColumnName] && oPropertyExtensions[sColumnName]["http://www.sap.com/Protocols/SAPData"]
                    && oPropertyExtensions[sColumnName]["http://www.sap.com/Protocols/SAPData"].sortable) {
                    oLabel.data("IsSortable", oPropertyExtensions[sColumnName]["http://www.sap.com/Protocols/SAPData"].sortable);
                    if (oPropertyExtensions[sColumnName]["http://www.sap.com/Protocols/SAPData"].sortable === "true") {
                        bEnableSortFilterDialog = true;
                    }
                } else {
                    oLabel.data("IsSortable", "true");
                    bEnableSortFilterDialog = true;
                }
                // Check if column is filterable (if nothing is specified, column is filterable).
                if (oPropertyExtensions && oPropertyExtensions[sColumnName] && oPropertyExtensions[sColumnName]["http://www.sap.com/Protocols/SAPData"]
                    && oPropertyExtensions[sColumnName]["http://www.sap.com/Protocols/SAPData"].filterable) {
                    oLabel.data("IsFilterable", oPropertyExtensions[sColumnName]["http://www.sap.com/Protocols/SAPData"].filterable);
                    if (oPropertyExtensions[sColumnName]["http://www.sap.com/Protocols/SAPData"].filterable === "true") {
                        bEnableSortFilterDialog = true;
                    }
                } else {
                    oLabel.data("IsFilterable", "true");
                    bEnableSortFilterDialog = true;
                }
            } else {
                // A column consists of concatenated fields. Only if all fields are sortable, then allow a column sorting.
                bSortable = true;
                for (let k = 0; k < aColumns[i].Value.Apply.Parameters.length; ++k) {
                    if (aColumns[i].Value.Apply.Parameters[k].Type === "Path") {
                        sColumnName = aColumns[i].Value.Apply.Parameters[k].Value;
                        // Check if column is sortable (if nothing is specified, column is sortable).
                        if (oPropertyExtensions[sColumnName] && oPropertyExtensions[sColumnName]["http://www.sap.com/Protocols/SAPData"]
                            && oPropertyExtensions[sColumnName]["http://www.sap.com/Protocols/SAPData"].sortable) {
                            if (oPropertyExtensions[sColumnName]["http://www.sap.com/Protocols/SAPData"].sortable === "false") {
                                // One of a concatenated fields isn't sortable, then the whole column will be not sortable
                                bSortable = false;
                                sConcatColumnName = "";
                                break;
                            }
                        }
                        if (sConcatColumnName) {
                            sConcatColumnName += ";";
                        }
                        sConcatColumnName += sColumnName;
                    }
                }
                sColumnName = sConcatColumnName;
                if (bSortable === false) {
                    oLabel.data("IsSortable", "false");
                } else {
                    oLabel.data("IsSortable", "true");
                    bEnableSortFilterDialog = true;
                }
                // For concatenated fields no filtering is allowed
                oLabel.data("IsFilterable", "false");
            }
            if (aColumns[i].EdmType) {
                oLabel.data("EdmType", aColumns[i].EdmType);
            }
            oLabel.data("ColumnName", sColumnName);
            aLabels.push(oLabel);
            aControls.push(oControl);
            if (oImportance === "High") {
                if (iPrioHighColumnCount > 0) {
                    bVisible = true;
                    iPrioHighColumnCount -= 1;
                } else {
                    bVisible = false;
                }
            } else if (oImportance === "Medium") {
                if (iPrioMediumColumnCount > 0) {
                    bVisible = true;
                    iPrioMediumColumnCount -= 1;
                } else {
                    bVisible = false;
                }
            } else {
                bVisible = false;
            }
            columns.push(new Column({ header: oLabel, hAlign: columnHAlign(aColumns[i]), visible: bVisible }));
            cells.push(oControl);
        }
        const oTemplateData = new ColumnListItem({
            type: ListType.Navigation,
            unread: false,
            cells: cells
        });
        if (oSelectedFacet) {
            sTitle = oSelectedFacet.Label.String;
        }
        oTemplateData.attachPress({ aColumns: aColumns, aLabels: aLabels, aControls: aControls, sTitle: sTitle }, (oEvent) => {
            let oLabel;
            let oValue;
            const sItem = oEvent.getSource().getCells()[0].getText().substr(oEvent.getSource().getCells()[0].getText().lastIndexOf("/"));
            const oContent = new Table({
                backgroundDesign: BackgroundDesign.Transparent,
                showSeparators: ListSeparators.None,
                columns: [
                    new Column({ hAlign: TextAlign.End }),
                    new Column()
                ]
            });
            oContent.addStyleClass("sapFactsheetUtiPanel");
            oContent.addStyleClass("sapFactsheetUtiTilePadding");
            oContent.addStyleClass("sapFactsheetUtiTableNoTopBorder");
            oContent.bindElement(sItem);
            for (let i = 0; i < aColumns.length; ++i) {
                oLabel = aLabels[i].clone();
                oLabel.setText(`${oLabel.getText()}:`);
                oValue = aControls[i].clone();
                oLabel.setLabelFor(oValue);
                oContent.addItem(new ColumnListItem({ cells: [oLabel, oValue] }));
            }
            const oThingGroup = new UnifiedThingGroup({
                content: oContent,
                title: sTitle,
                description: getTIDescription()
            });
            const oPage = new Page({
                title: oTI.getTitle(),
                showNavButton: true,
                content: [oThingGroup]
            });
            oTI.navigateToPage(oPage, true);
            // Workaround: no Link if no authority
            oTI.attachAfterNavigate(oContent, (oEvent) => {
                if (oEvent.getParameters().getParameters().toId.indexOf("__page") >= 0) {
                    const aItems = oContent.getItems();
                    if (aItems.length > 0 && aAllFacets.indexOf(oFacet) >= 0) {
                        aAllFacets[aAllFacets.indexOf(oFacet)].bLoaded = true;
                        aAllFacets[aAllFacets.indexOf(oFacet)].bProcessed = false;
                        aAllFacets[aAllFacets.indexOf(oFacet)].bIsTable = true;
                        aAllFacets[aAllFacets.indexOf(oFacet)].oTableItems = aItems;
                        checkLinks(aAllFacets.indexOf(oFacet));
                    }
                }
            });
            // Workaround: no Link if no authority
        });
        const oTable = new Table({ growing: true, columns: columns });
        oTable.setModel(oModel);
        oTable.bindItems({
            path: sBindingPath,
            template: oTemplateData
        });
        const customFilterString = new VBox({
            items: [
                new Input({
                    placeholder: oSuiteUiCommonsResourceBundle.getText("USHELL_FACTSHEET_ENTER_YOUR_FILTER"),
                    change: function (oEvent) {
                        let customFilter;
                        const sParentParentId = oEvent.getSource().getParent().getParent().getId();
                        const vsd = Core.byId(sParentParentId.substr(0, sParentParentId.indexOf("-")));
                        const filters = vsd.getFilterItems();
                        for (let i = 0; i < filters.length; ++i) {
                            if (filters[i] instanceof ViewSettingsCustomItem && filters[i].getKey() === this.oParent.data("ColumnName")) {
                                customFilter = filters[i];
                                break;
                            }
                        }
                        if (customFilter) {
                            if ((oEvent.getParameter("newValue") === undefined) || (oEvent.getParameter("newValue") === "")) {
                                customFilter.setSelected(false);
                                customFilter.setFilterCount(0);
                            } else {
                                customFilter.setSelected(true);
                                customFilter.setFilterCount(1);
                            }
                        }
                    }
                }).addStyleClass("sapFactsheetUtiFilterInput")
            ]
        });
        const customFilterDecimal = new VBox({
            items: [
                new List({
                    mode: ListMode.SingleSelectLeft,
                    includeItemInSelection: true,
                    items: [
                        new StandardListItem({
                            title: oSuiteUiCommonsResourceBundle.getText("USHELL_FACTSHEET_GREATER_THEN")
                        }).data("FilterOperator", FilterOperator.GT),
                        new StandardListItem({
                            title: oSuiteUiCommonsResourceBundle.getText("USHELL_FACTSHEET_EQUALS")
                        }).data("FilterOperator", FilterOperator.EQ),
                        new StandardListItem({
                            title: oSuiteUiCommonsResourceBundle.getText("USHELL_FACTSHEET_LESS_THEN")
                        }).data("FilterOperator", FilterOperator.LT)
                    ]
                }),
                new Input({
                    placeholder: oSuiteUiCommonsResourceBundle.getText("USHELL_FACTSHEET_ENTER_YOUR_FILTER"),
                    change: function (oEvent) {
                        let customFilter;
                        const sParentParentId = oEvent.getSource().getParent().getParent().getId();
                        const vsd = Core.byId(sParentParentId.substr(0, sParentParentId.indexOf("-")));
                        const filters = vsd.getFilterItems();
                        for (let i = 0; i < filters.length; ++i) {
                            if ((filters[i] instanceof ViewSettingsCustomItem) && (filters[i].getKey() === this.oParent.data("ColumnName"))) {
                                customFilter = filters[i];
                                break;
                            }
                        }
                        if (customFilter) {
                            if ((oEvent.getParameter("newValue") === undefined) || (oEvent.getParameter("newValue") === "")) {
                                customFilter.setSelected(false);
                                customFilter.setFilterCount(0);
                            } else {
                                customFilter.setSelected(true);
                                customFilter.setFilterCount(1);
                            }
                        }
                    }
                }).addStyleClass("sapFactsheetUtiFilterInput")
            ]
        });

        // NOTE: assignment commented out (see todo comment down)
        // var oCustomFilterDate = new sap.m.Vbox({ ...
        new VBox({
            items: [
                new List({
                    mode: ListMode.SingleSelectLeft,
                    includeItemInSelection: true,
                    items: [
                        new StandardListItem({
                            title: oSuiteUiCommonsResourceBundle.getText("USHELL_FACTSHEET_AFTER")
                        }).data("FilterOperator", FilterOperator.GT),
                        new StandardListItem({
                            title: oSuiteUiCommonsResourceBundle.getText("USHELL_FACTSHEET_AT")
                        }).data("FilterOperator", FilterOperator.EQ),
                        new StandardListItem({
                            title: oSuiteUiCommonsResourceBundle.getText("USHELL_FACTSHEET_BEFORE")
                        }).data("FilterOperator", FilterOperator.LT)
                    ]
                }),
                new DateTimeInput({
                    type: DateTimeInputType.Date,
                    valueFormat: new DateTime({ pattern: "yyyy/MM/dd HH:mm:ss UTC+00:00" }).getOutputPattern(),
                    placeholder: oSuiteUiCommonsResourceBundle.getText("USHELL_FACTSHEET_ENTER_YOUR_FILTER"),
                    change: function (oEvent) {
                        let customFilter;
                        const sParentParentId = oEvent.getSource().getParent().getParent().getId();
                        const vsd = Core.byId(sParentParentId.substr(0, sParentParentId.indexOf("-")));
                        const filters = vsd.getFilterItems();
                        for (let i = 0; i < filters.length; ++i) {
                            if ((filters[i] instanceof ViewSettingsCustomItem) && (filters[i].getKey() === this.oParent.data("ColumnName"))) {
                                customFilter = filters[i];
                                break;
                            }
                        }
                        if ((oEvent.getParameter("newValue") === undefined) || (oEvent.getParameter("newValue") === "")) {
                            customFilter.setSelected(false);
                            customFilter.setFilterCount(0);
                        } else {
                            customFilter.setSelected(true);
                            customFilter.setFilterCount(1);
                        }
                    }
                }).addStyleClass("sapFactsheetUtiFilterInput")
            ]
        });

        function customFilterCallback (oControl) {
            const aFilters = [];
            const aItems = oControl.getItems();
            let sFilterOperator;
            let sFilterValue;
            if (aItems[0].getParent().data("EdmType") === "Edm.String" && aItems[0].getValue()) {
                aFilters.push(new Filter(aItems[0].getParent().data("ColumnName"), FilterOperator.Contains, aItems[0].getValue()));
            } else if (aItems[0].getParent().data("EdmType") === "Edm.Decimal" && aItems[1].getValue()) {
                for (let i = 0; i < aItems[0].getItems().length; ++i) {
                    if (aItems[0].getItems()[i].getSelected() === true) {
                        sFilterOperator = aItems[0].getItems()[i].data("FilterOperator");
                        break;
                    }
                }
                sFilterValue = aItems[1].getValue();
                for (let i = sFilterValue.length - 1; i > 0; --i) {
                    if (sFilterValue[i] === ",") {
                        sFilterValue = sFilterValue.replace(sFilterValue[i], ".");
                        break;
                    }
                }
                aFilters.push(new Filter(aItems[1].getParent().data("ColumnName"), sFilterOperator, sFilterValue));
            } else if (aItems[0].getParent().data("EdmType") === "Edm.Date" && aItems[1].getValue()) {
                for (let i = 0; i < aItems[0].getItems().length; ++i) {
                    if (aItems[0].getItems()[i].getSelected() === true) {
                        sFilterOperator = aItems[0].getItems()[i].data("FilterOperator");
                        break;
                    }
                }
                aFilters.push(new Filter(aItems[1].getParent().data("ColumnName"), sFilterOperator, aItems[1].getValue()));
            } else {
                aFilters.push(new Filter(aItems[0].getParent().data("ColumnName"), FilterOperator.EQ, aItems[0].getValue()));
            }
            return aFilters;
        }
        function customFilterReset (oEvent) {
            const source = oEvent.getSource();
            const filters = source.getFilterItems();
            let customControlItems;
            for (let i = 0; i < filters.length; ++i) {
                if (filters[i] && filters[i] instanceof ViewSettingsCustomItem) {
                    filters[i].setSelected(false);
                    filters[i].setFilterCount(0);
                    customControlItems = filters[i].getCustomControl().getItems();
                    for (let j = 0; j < customControlItems.length; ++j) {
                        // Clear of sap.m.Input and sap.m.DateTimeInput
                        if ((customControlItems[j] instanceof Input) || (customControlItems[j] instanceof DateTimeInput)) {
                            customControlItems[j].setValue("");
                        }
                        // Clear sap.m.List
                        if ((customControlItems[j] instanceof List) && (customControlItems[j].getSelectedItem() !== null)) {
                            customControlItems[j].removeSelections();
                        }
                    }
                }
            }
        }
        const customFilterCancel = customFilterReset;
        for (let i = 0; i < columns.length; ++i) {
            if (columns[i + 1]) {
                oLabel = aLabels[i].clone();
                if (oLabel.getText() && (oLabel.data("IsSortable") === "true") && columns[i + 1].getVisible()) {
                    oSortItem = new ViewSettingsItem({
                        text: oLabel.getText(),
                        key: oLabel.data("ColumnName")
                    });
                    if (i === 0) {
                        oSortItem.setSelected(true);
                    }
                    oSortItem.Sort = oLabel.Sort;
                    aSortItems.push(oSortItem);
                }
                if (oLabel.getText() && (oLabel.data("IsFilterable") === "true")) {
                    if (oLabel.data("EdmType") === "Edm.String") {
                        oCustomFilterControl = customFilterString.clone().data("ColumnName", oLabel.data("ColumnName")).data("EdmType", oLabel.data("EdmType"));
                        // TODO: Currently Edm.Date is disabled until correct timezone handling
                        // } else if (oLabel.data("EdmType") === "Edm.Date") {
                        // oCustomFilterControl = customFilterDate.clone().data("ColumnName", oLabel.data("ColumnName")).data("EdmType", oLabel.data("EdmType"));
                    } else if (oLabel.data("EdmType") === "Edm.Decimal") {
                        oCustomFilterControl = customFilterDecimal.clone().data("ColumnName", oLabel.data("ColumnName")).data("EdmType", oLabel.data("EdmType"));
                    }
                    if ((oLabel.data("EdmType") === "Edm.String") || (oLabel.data("EdmType") === "Edm.Decimal")) {
                        oFilterItem = new ViewSettingsCustomItem({
                            key: oLabel.data("ColumnName"),
                            text: oLabel.getText(),
                            customControl: oCustomFilterControl,
                            customData: new CustomData({
                                key: "callback",
                                value: customFilterCallback
                            })
                        });
                        aFilterItems.push(oFilterItem);
                    }
                }
            }
        }
        const oVSDialog = new ViewSettingsDialog({
            sortItems: aSortItems,
            filterItems: aFilterItems,
            cancel: customFilterCancel,
            resetFilters: customFilterReset,
            confirm: function (evt) {
                const aSorters = [];
                let aPath = [];
                let aFilters = [];
                let aTableFilters = [];
                let sPath;
                let bDescending;
                let oCallback;
                const mParams = evt.getParameters();
                const oBinding = oTable.getBinding("items");
                if (mParams.sortItem) {
                    sPath = mParams.sortItem.getKey();
                    bDescending = mParams.sortDescending;
                    if (sPath.indexOf(";") > 0) {
                        aPath = sPath.split(";");
                        for (let i = 0; i < aPath.length; ++i) {
                            aSorters.push(new Sorter(aPath[i], bDescending));
                        }
                    } else if (sPath) {
                        aSorters.push(new Sorter(sPath, bDescending));
                    }
                    oBinding.sort(aSorters);
                }
                const p = mParams;
                for (let i = 0; i < p.filterItems.length; ++i) {
                    if (p.filterItems[i] instanceof ViewSettingsCustomItem) { // custom control filter
                        oCallback = p.filterItems[i].getCustomData()[0].getValue();
                        aFilters = oCallback.apply(this, [p.filterItems[i].getCustomControl()]);
                        if (aFilters) {
                            // The filter could be an array of filters or a single filter so we transform it to an array
                            if (!Array.isArray(aFilters)) {
                                aFilters = [aFilters];
                            }
                            aTableFilters = aTableFilters.concat(aFilters);
                        }
                    } else if (p.filterItems[i] instanceof ViewSettingsItem) { // standard filter
                        aFilters = p.filterItems[i].getCustomData()[0].getValue();
                        if (aFilters) {
                            // The filter could be an array of filters or a single filter so we transform it to an array
                            if (!Array.isArray(aFilters)) {
                                aFilters = [aFilters];
                            }
                            aTableFilters = aTableFilters.concat(aFilters);
                        }
                    }
                }
                oBinding.filter(aTableFilters);
            }
        });
        if (bEnableSortFilterDialog === true && (aSortItems.length > 0 || aFilterItems.length > 0)) {
            // Add a button to the table header for opening the sorting dialog
            oTable.setHeaderToolbar(new Toolbar({
                content: [
                    new Label(),
                    new ToolbarSpacer(),
                    new Button({
                        icon: "sap-icon://drop-down-list",
                        press: function (/* evt */) {
                            oVSDialog.open();
                        },
                        tooltip: Core.getLibraryResourceBundle("sap.m").getText("P13NDIALOG_VIEW_SETTINGS")
                    })
                ]
            }));
        }
        // While data is loading display a loading text
        oTable.setNoDataText(Core.getLibraryResourceBundle("sap.m").getText("PULL2REFRESH_LOADING_LONG"));
        // When data gets updated check if there are no items and set a no data text in that case
        const updatedFinished = (function (oFacet) {
            return function (oEvent) {
                const aItems = this.getItems();
                if (aItems.length === 0) {
                    this.setNoDataText(oSuiteUiCommonsResourceBundle.getText("FACETOVERVIEW_NO_CONTENT_TEXT"));
                } else {
                    this.setNoDataText(Core.getLibraryResourceBundle("sap.m").getText("PULL2REFRESH_LOADING_LONG"));
                }
                // Workaround: no Link if no authority
                if (aItems.length > 0 && aAllFacets.indexOf(oFacet) >= 0) {
                    aAllFacets[aAllFacets.indexOf(oFacet)].bLoaded = true;
                    aAllFacets[aAllFacets.indexOf(oFacet)].bProcessed = false;
                    aAllFacets[aAllFacets.indexOf(oFacet)].bIsTable = true;
                    aAllFacets[aAllFacets.indexOf(oFacet)].oTableItems = aItems;
                }
                checkLinks(aAllFacets.indexOf(oFacet));
                // Workaround: no Link if no authority
            };
        }(oFacet));
        oTable.attachUpdateFinished(updatedFinished);
        return oTable;
    }

    function showHTML (oHTMLData) {
        let oImage;
        let oHTMLCtrl;
        let sIframe;
        switch (oHTMLData.UrlContentType.String) {
            case "image/png":
            case "image/jpeg":
            case "image/gif":
                oImage = new Image({ width: "100%" });
                if (oHTMLData.Url.String) {
                    oImage.setSrc(oHTMLData.Url.String);
                }
                return oImage;
            default:
                oHTMLCtrl = new HTML();
                if (oHTMLData.Url.String) {
                    oHTMLCtrl.setContent(`<iframe src = '${oHTMLData.Url.String}' width='100%' height='250px' frameborder='0'></iframe>`);
                } else if (oHTMLData.Url.Path) {
                    oHTMLCtrl.bindProperty("content", {
                        path: oHTMLData.Url.Path,
                        formatter: function (/* value */) {
                            sIframe = `<iframe src = '${oHTMLData.Url.Path}' width='100%' height='250px' frameborder='0'></iframe>`;
                            return sIframe;
                        }
                    });
                }
                return oHTMLCtrl;
        }
    }

    function facetFactory (oModel, sEntitySet, oSelectedFacet, sBindingPath, oFacet) {
        let sAssociationMultiplicity = "";
        const aTG = [];
        let oTG;
        let sNavPath;
        let sAnnoPath;
        let aAnnoPath;
        let sNavEntitySet;
        let oList;
        let aIdentification;
        let oVL;
        let aStatusInfo;
        let oFG;
        let sEntityType;
        let aColumns;
        let oPropertyExtensions;
        const oMetadata = oModel.getServiceMetadata();
        switch (oSelectedFacet.RecordType) {
            case "com.sap.vocabularies.UI.v1.ReferenceFacet":
                oTG = new UnifiedThingGroup();
                if (oSelectedFacet.Label && oSelectedFacet.Label.String) {
                    oTG.setTitle(oSelectedFacet.Label.String);
                }
                sNavPath = oSelectedFacet.Target.AnnotationPath;
                sAnnoPath = sNavPath.substring(sNavPath.lastIndexOf("@") + 1);
                sNavPath = sNavPath.substring(0, sNavPath.lastIndexOf("@") - 1);
                if (sNavPath) {
                    sAssociationMultiplicity = getAssociationMultiplicity(sEntitySet, sNavPath, oMetadata);
                }
                aAnnoPath = sAnnoPath.split("#");
                switch (aAnnoPath[0]) {
                    case "com.sap.vocabularies.UI.v1.LineItem":
                    case "com.sap.vocabularies.UI.v1.Chart":
                    case "com.sap.vocabularies.UI.v1.Badge":
                    case "com.sap.vocabularies.UI.v1.Identification":
                        if (sNavPath) {
                            sNavEntitySet = getNavEntitySet(sEntitySet, sNavPath, oMetadata);
                            sEntityType = getEntityType(sNavEntitySet, oMetadata);
                        } else {
                            sEntityType = getEntityType(sEntitySet, oMetadata);
                        }
                        // In case of a chart we need to have the definition of the line items
                        if (aAnnoPath[0] === "com.sap.vocabularies.UI.v1.Chart") {
                            sAnnoPath = "com.sap.vocabularies.UI.v1.LineItem";
                        }
                        aColumns = oMapping[sEntityType][sAnnoPath];
                        if (oMapping.propertyExtensions) {
                            oPropertyExtensions = oMapping.propertyExtensions[sEntityType];
                        }
                        if (sAssociationMultiplicity === "*" && aAnnoPath[0] !== "com.sap.vocabularies.UI.v1.Identification") {
                            oList = itemListFactory(oModel, aColumns, sEntityType, oMetadata, `${sBindingPath}/${sNavPath}`, oSelectedFacet, oPropertyExtensions, oFacet);
                            oTG.setContent(oList);
                        }
                        if (aAnnoPath[0] === "com.sap.vocabularies.UI.v1.Identification") {
                            aIdentification = oMapping[sEntityType]["com.sap.vocabularies.UI.v1.Identification"];
                            oVL = new VerticalLayout({ width: "100%" }).setModel(oModel);
                            if (sNavPath) {
                                oVL.addContent(formLayoutFactory(oModel, sNavEntitySet, aIdentification, null, null, oFacet)).addStyleClass("sapFactsheetUtiPanel");
                                oVL.bindElement(`${sBindingPath}/${sNavPath}`);
                            } else {
                                oVL.addContent(formLayoutFactory(oModel, sEntitySet, aIdentification, null, null, oFacet).addStyleClass("sapFactsheetUtiPanel"));
                            }
                            oTG.setContent(oVL);
                        }
                        break;
                    case "com.sap.vocabularies.UI.v1.StatusInfo":
                        if (sNavPath) {
                            sNavEntitySet = getNavEntitySet(sEntitySet, sNavPath, oMetadata);
                            aStatusInfo = oMapping[getEntityType(sNavEntitySet, oMetadata)]["com.sap.vocabularies.UI.v1.StatusInfo"];
                            oTG.setContent(formLayoutFactory(oModel, sNavEntitySet, aStatusInfo, null, null, oFacet).addStyleClass("sapFactsheetUtiPanel").bindElement(`${sBindingPath}/${sNavPath}`));
                        } else {
                            aStatusInfo = oMapping[getEntityType(sEntitySet, oMetadata)]["com.sap.vocabularies.UI.v1.StatusInfo"];
                            oTG.setContent(formLayoutFactory(oModel, sEntitySet, aStatusInfo, null, null, oFacet).addStyleClass("sapFactsheetUtiPanel"));
                        }
                        break;
                    case "com.sap.vocabularies.UI.v1.FieldGroup":
                        oFG = oMapping[getEntityType(sEntitySet, oMetadata)][sAnnoPath];
                        if (oFG) {
                            if (!oTG.getTitle() || (oTG.getTitle() === "")) {
                                if (oFG.Label) {
                                    if (oFG.Label.String) {
                                        oTG.setTitle(oFG.Label.String);
                                    } else if (oFG.Label.Path) {
                                        oTG.bindProperty("title", oFG.Label.Path);
                                    }
                                }
                            }
                            if (sNavPath) {
                                sNavEntitySet = getNavEntitySet(sEntitySet, sNavPath, oMetadata);
                                oTG.setContent(formLayoutFactory(oModel, sNavEntitySet, oFG.Data, null, null, oFacet).addStyleClass("sapFactsheetUtiPanel").bindElement(`${sBindingPath}/${sNavPath}`));
                            } else {
                                oTG.setContent(formLayoutFactory(oModel, sEntitySet, oFG.Data, null, null, oFacet).addStyleClass("sapFactsheetUtiPanel"));
                            }
                        }
                        break;
                    default:
                        break;
                }
                return oTG;
            case "com.sap.vocabularies.UI.v1.ReferenceURLFacet":
                oTG = new ThingGroup({ title: oSelectedFacet.Label.String });
                oTG.setContent(showHTML(oSelectedFacet));
                return oTG;
            case "com.sap.vocabularies.UI.v1.CollectionFacet":
                for (let i = 0; i < oSelectedFacet.Facets.length; ++i) {
                    aTG.push(facetFactory(oModel, sEntitySet, oSelectedFacet.Facets[i], sBindingPath, oFacet));
                }
                return aTG;
            default:
                break;
        }
    }

    function chartControlFactory (sChartType, oTitle, oDescription, oDataset) {
        let oChartControl;
        switch (sChartType) {
            case "com.sap.vocabularies.UI.v1.ChartType/Area":
                oChartControl = new Area({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/Bar":
                oChartControl = new Bar({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/Bubble":
                oChartControl = new Bubble({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/Column":
                oChartControl = new ui5Column({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/ColumnStacked":
                oChartControl = new StackedColumn({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/ColumnStacked100":
                oChartControl = new StackedColumn100({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/Donut":
                oChartControl = new Donut({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/HeatMap":
                oChartControl = new Heatmap({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/HorizontalArea":
                oChartControl = new HorizontalArea({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/Line":
                oChartControl = new Line({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/Pie":
                oChartControl = new Pie({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/Scatter":
                oChartControl = new Scatter({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/TreeMap":
                oChartControl = new Treemap({});
                break;
            case "com.sap.vocabularies.UI.v1.ChartType/AreaStacked":
            case "com.sap.vocabularies.UI.v1.ChartType/AreaStacked100":
            case "com.sap.vocabularies.UI.v1.ChartType/BarStacked":
            case "com.sap.vocabularies.UI.v1.ChartType/BarStacked100":
            case "com.sap.vocabularies.UI.v1.ChartType/HorizontalAreaStacked":
            case "com.sap.vocabularies.UI.v1.ChartType/HorizontalAreaStacked100":
            case "com.sap.vocabularies.UI.v1.ChartType/Radar":
            case "com.sap.vocabularies.UI.v1.ChartType/Waterfall":
                break;
        }
        if (oChartControl) {
            if (oTitle && oTitle.String) {
                oChartControl.setTitle(new Title({
                    visible: true,
                    text: oTitle.String
                }));
            }
            if (oDescription && oDescription.String) {
                oChartControl.setTooltip(oDescription.String);
            }
            oChartControl.setWidth("100%");
            oChartControl.setHeight("17rem");
            oChartControl.setDataset(oDataset);
        } else {
            oChartControl = new Text({});
        }
        return oChartControl;
    }

    /**
     * Returns tile height in rem, depending on device type and number of segments the tile consists of.
     * @param {int} [iSegments=1] Number of segments the tile will take vertically in the grid (optional).
     *   Currently expected values are 1, 2, 3, however any positive number is supported.
     *   Default value is 1.
     * @returns {string} Tile height in rem.
     */
    function getTeaserTileHeight (iSegments) {
        let iReturn;
        iSegments = iSegments || 1;
        if (jQuery.device.is.phone) {
            iReturn = `${7 * iSegments}rem`;
        } else {
            iReturn = `${11 * iSegments - 1}rem`;
        }
        return iReturn;
    }

    function getFieldSumsByPriority (aFields) {
        let iFieldsWithPrioHigh = 0;
        let iFieldsWithPrioMedium = 0;
        let iFieldsWithPrioLow = 0;
        let oImportance;
        for (let i = 0; i < aFields.length; ++i) {
            oImportance = getImportanceOfRecord(aFields[i]);
            if (oImportance) {
                switch (oImportance) {
                    case "High":
                        iFieldsWithPrioHigh += 1;
                        break;
                    case "Medium":
                        iFieldsWithPrioMedium += 1;
                        break;
                    case "Low":
                        iFieldsWithPrioLow += 1;
                        break;
                }
            }
        }
        return { High: iFieldsWithPrioHigh, Medium: iFieldsWithPrioMedium, Low: iFieldsWithPrioLow };
    }

    function kpiTileFactory (oModel, aDataPoint, sEntityType, sBindingPath) {
        let bIsNumeric = false;
        let fractionDigits;
        let oBinding;
        let oBindingInfo;
        const oTile = new KpiTile({
            doubleFontSize: false
        });
        // Set ValueFormat
        if (aDataPoint.ValueFormat) {
            fractionDigits = aDataPoint.ValueFormat.NumberOfFractionalDigits.Int;
        }
        if (aDataPoint.Title && aDataPoint.Title.String) {
            oTile.setDescription(aDataPoint.Title.String);
        } else if (aDataPoint.Title && aDataPoint.Title.Path) {
            oTile.bindProperty("description", { path: aDataPoint.Title.Path });
        }
        if (aDataPoint.Value && aDataPoint.Value.String) {
            oTile.setValue(aDataPoint.Value.String);
        } else if (aDataPoint.Value && aDataPoint.Value.Path) {
            oBinding = fieldBinding(aDataPoint.Value, aDataPoint.Value.EdmType, sEntityType);
            // HANA Live
            if (oBinding.fnChange) {
                oTile.setModel(oModel);
                oTile.bindElement(sBindingPath);
                oTile.getElementBinding().attachChange(oBinding.fnChange, oTile);
            }
            if (oBinding.String) {
                // Live KPIs detected
                if (typeof oBinding.String === "number" && !isNaN(oBinding.String)) {
                    bIsNumeric = true;
                    oTile.setValue(kpiValueFormatter(oBinding.String, fractionDigits));
                } else {
                    oTile.setValue(oBinding.String);
                }
            } else if (oBinding.BindingInfo) {
                // Check for currencies/unit of measures
                oBindingInfo = oBinding.BindingInfo;
                if (oBindingInfo.parts && oBindingInfo.parts.length === 2) {
                    oTile.bindProperty("valueUnit", oBindingInfo.parts[0]);
                    oBindingInfo.parts[1].type = undefined;
                    oBindingInfo.parts[1].formatter = (function () {
                        return function (value) {
                            return kpiValueFormatter(value, fractionDigits);
                        };
                    }(fractionDigits));
                    oTile.bindProperty("value", oBindingInfo.parts[1]);
                } else if (oBindingInfo.parts && oBindingInfo.parts.length === 1) {
                    oBindingInfo.parts[0].type = undefined;
                    oBindingInfo.parts[0].formatter = (function () {
                        return function (value) {
                            return kpiValueFormatter(value, fractionDigits);
                        };
                    }(fractionDigits));
                    oTile.bindProperty("value", oBindingInfo);
                } else {
                    oTile.bindProperty("value", oBindingInfo);
                }
            }
        }
        // Set font size
        if (aDataPoint.Value.EdmType === "Edm.Decimal" || aDataPoint.Value.EdmType === "Edm.Double" || aDataPoint.Value.EdmType === "Edm.Single" ||
            aDataPoint.Value.EdmType === "Edm.Int16" || aDataPoint.Value.EdmType === "Edm.Int32" || aDataPoint.Value.EdmType === "Edm.Int64" ||
            bIsNumeric === true) {
            oTile.setDoubleFontSize(true);
        }
        return oTile;
    }

    // Workaround: no Link if no authority
    function getSemObjectsFromAnnotation (oMetadata) {
        const aRelatedObjects = [];
        const aRelObjToProcess = [];
        let sSemanticObject;
        let key;

        function collectSemanticObject (oObject) {
            if (oObject.RecordType && oObject.RecordType === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") {
                if (oObject.Url && oObject.Url.Apply) {
                    sSemanticObject = oObject.Url.Apply.Parameters[0].Value.slice(oObject.Url.Apply.Parameters[0].Value.indexOf("#") + 1, oObject.Url.Apply.Parameters[0].Value.indexOf("-"));
                    if (aRelatedObjects.indexOf(sSemanticObject) < 0) {
                        aRelatedObjects.push(sSemanticObject);
                    }
                    return true;
                }
            } else {
                return false;
            }
        }

        function getSemanticObjects (oObject) {
            if (collectSemanticObject(oObject) === false) {
                if (Array.isArray(oObject)) {
                    for (let i = 0; i < oObject.length; ++i) {
                        collectSemanticObject(oObject[i]);
                    }
                } else if (typeof oObject === "object") {
                    for (key in oObject) {
                        if (oObject.hasOwnProperty(key)) {
                            if (oObject[key].constructor !== String) {
                                getSemanticObjects(oObject[key]);
                            }
                        }
                    }
                }
            }
        }

        for (key in oMapping) {
            if (oMapping.hasOwnProperty(key)) {
                if (key.indexOf(oMetadata.dataServices.schema[0].namespace) >= 0) {
                    getSemanticObjects(oMapping[key]);
                }
            }
        }
        for (let i = 0; i < aRelatedObjects.length; ++i) {
            if (!oLinkAuthorised.hasOwnProperty(aRelatedObjects[i])) {
                aRelObjToProcess.push(aRelatedObjects[i]);
            }
        }
        return aRelObjToProcess;
    }

    function callInteropService (aRelObjToProcess) {
        let oJSONModel;
        let sLink;
        let sFilter;
        if (aRelObjToProcess.length > 0) {
            oJSONModel = new JSONModel();
            sLink = "/sap/opu/odata/UI2/INTEROP/SemanticObjects?$expand=Links&$format=json";
            sFilter = "&$filter=id%20eq%20%27";
            for (let i = 0; i < aRelObjToProcess.length; ++i) {
                if (sFilter.length > 22) {
                    sFilter += `%20or%20id%20eq%20%27${aRelObjToProcess[i]}%27`;
                } else {
                    sFilter += `${aRelObjToProcess[i]}%27`;
                }
            }
            sLink += sLink + sFilter;
            oJSONModel.loadData(sLink);
            oJSONModel.attachRequestCompleted(function () {
                let aLinks = [];
                let types;
                if (this.getData().d && this.getData().d.results) {
                    types = this.getData().d.results;
                    for (let i = 0; i < types.length; ++i) {
                        oLinkAuthorised[types[i].id] = "";
                        aLinks = types[i].Links.results;
                        for (let j = 0; j < aLinks.length; ++j) {
                            oLinkAuthorised[aLinks[j].id.slice(0, aLinks[j].id.indexOf("~"))] = "";
                        }
                    }
                }
                oLinkAuthorised.InteropCompleted = true;
                checkLinks();
            });
        } else {
            oLinkAuthorised.InteropCompleted = true;
        }
    }
    // Workaround: no Link if no authority

    function thingInspectorFactory (sUri, sAnnotationUri, oTI) {
        let oContent = {};
        const aOperations = [];
        let iFieldsWithPrioHigh = 0;
        let iFieldsWithPrioMedium = 0;
        let numKpiTiles = 0;
        let i;
        let sNavPath;
        let functionParameters;
        let sBusinessParams;
        let oGeneralFacet;
        let oLinks;
        let oTransactionSheet;
        let oActionSheet;
        let iMaxItemsInGeneral;
        let sUseTerm;
        let sNavEntitySet;
        let sEntitySetForFacet;
        let sNavEntityType;
        let sEntityTypeForFacet;
        let aFacetContent;
        let oImportance;
        let sBatchPath;
        let iFreeSpaceBuffer;
        let aContent;
        let oFieldSumsByPriority;
        let iFieldsOnOverview;
        let oFormLayout;
        let sGeneralTileHeight;
        let iRowSpan;
        let oFacet;
        let oGeoContent;
        let sNavType;
        let sCardinality;
        let parameters;
        let oEmailBtn;
        let key;
        let aDataPoint;
        let sTerm;
        let sHeight;
        const sService = getServiceFromUri(sUri);
        // Because of a bug in icm the bsp application name and file name must be in lower case
        const sAnnotationUriPath = sAnnotationUri.substring(0, sAnnotationUri.substring(0, sAnnotationUri.lastIndexOf("/")).lastIndexOf("/"));
        let sAnnotationUriAppAndFilename = sAnnotationUri.substring(sAnnotationUri.substring(0, sAnnotationUri.lastIndexOf("/")).lastIndexOf("/"));
        // Transformation to lowercase can be prohibited by adding the encoded url parameter "cbn_keep_anno_case" with value "true".
        if (window.location.search.indexOf("cbn_keep_anno_case%3Dtrue") === -1) {
            sAnnotationUriAppAndFilename = sAnnotationUriAppAndFilename.toLowerCase();
        }
        const oModel = new ODataModel(
            sService,
            { annotationURI: sAnnotationUriPath + sAnnotationUriAppAndFilename, loadAnnotationsJoined: true, loadMetadataAsync: false, json: true }
        );
        oModel.setCountSupported(false);
        oTI.setModel(oModel);
        const sEntitySet = getEntitySetFromUri(sUri, oModel);
        const sBindingPath = `/${sUri.slice(sService.length)}`;
        const oMetadata = oModel.getServiceMetadata();
        oMapping = oModel.getServiceAnnotations();
        const sEntityType = getEntityType(sEntitySet, oMetadata);
        const oHeaderInfo = oMapping[sEntityType]["com.sap.vocabularies.UI.v1.HeaderInfo"];
        const aFacets = oMapping[sEntityType]["com.sap.vocabularies.UI.v1.Facets"];
        oTI.bindElement(sBindingPath, getExpand(sEntitySet, oMetadata));
        const oSapSuiteRb = Core.getLibraryResourceBundle("sap.suite.ui.commons");

        // Workaround: no Link if no authority
        oLinkAuthorised.InteropCompleted = false;
        callInteropService(getSemObjectsFromAnnotation(oMetadata));
        // Workaround: no Link if no authority

        // Begin of rendering

        // Add a business object specific style class for branding
        oTI.addStyleClass(`sapFactsheetUtiThingType${sEntitySet.replace(/\s/g, "")}`);

        // Factsheet title e. g. "Article", "Sales Order", etc.
        if (oHeaderInfo.TypeName.String) {
            oTI.setTitle(oHeaderInfo.TypeName.String);
        } else if (oHeaderInfo.TypeName.Path) {
            oTI.bindProperty("title", { path: oHeaderInfo.TypeName.Path });
        }

        // Optional image/icon to the left of the title
        if (oHeaderInfo.ImageUrl && oHeaderInfo.ImageUrl.String) {
            oTI.setIcon(oHeaderInfo.ImageUrl.String);
        } else if (oHeaderInfo.ImageUrl && oHeaderInfo.ImageUrl.Path) {
            oTI.bindProperty("icon", { path: oHeaderInfo.ImageUrl.Path });
        } else if (oHeaderInfo.TypeImageUrl && oHeaderInfo.TypeImageUrl.String) {
            oTI.setIcon(oHeaderInfo.TypeImageUrl.String);
        } else if (oHeaderInfo.TypeImageUrl && oHeaderInfo.TypeImageUrl.Path) {
            oTI.bindProperty("icon", { path: oHeaderInfo.TypeImageUrl.Path });
        }

        // Name and description of the factsheet
        if (oHeaderInfo.Title.Value.String) {
            oTI.setName(oHeaderInfo.Title.Value.String);
        } else {
            oTI.bindProperty("name", fieldBinding(oHeaderInfo.Title.Value, oHeaderInfo.Title.EdmType, sEntityType).BindingInfo);
        }
        if (oHeaderInfo.Description && oHeaderInfo.Description.Value) {
            if (oHeaderInfo.Description.Value.String) {
                oTI.setDescription(oHeaderInfo.Description.Value.String);
            } else {
                oTI.bindProperty("description", fieldBinding(oHeaderInfo.Description.Value, oHeaderInfo.Description.EdmType, sEntityType).BindingInfo);
            }
        }

        // KPI tiles
        for (key in oMapping[sEntityType]) {
            if (oMapping[sEntityType].hasOwnProperty(key)) {
                if (key.search("com.sap.vocabularies.UI.v1.DataPoint") !== -1) {
                    aDataPoint = oMapping[sEntityType][key];
                    if (aDataPoint) {
                        oTI.addKpi(kpiTileFactory(oModel, aDataPoint, sEntityType, sBindingPath));
                        numKpiTiles += 1;
                    }
                }
                // max. 3 KPIs supported
                if (numKpiTiles >= 3) {
                    break;
                }
            }
        }

        // General facet
        for (let i = 0; i < aFacets.length; ++i) {
            if (aFacets[i]["com.sap.vocabularies.UI.v1.IsSummary"]) {
                oGeneralFacet = aFacets[i];
                break;
            }
        }
        if (oGeneralFacet) {
            iMaxItemsInGeneral = 15;
            for (let j = 0; j < oGeneralFacet.Facets.length; ++j) {
                sUseTerm = oGeneralFacet.Facets[j].Target.AnnotationPath.substring(oGeneralFacet.Facets[j].Target.AnnotationPath.lastIndexOf("@") + 1);
                sNavPath = oGeneralFacet.Facets[j].Target.AnnotationPath;
                sNavPath = sNavPath.substring(0, sNavPath.lastIndexOf("@") - 1);
                oGeneralFacet.Facets[j].NavPath = sNavPath;
                sNavEntitySet = getNavEntitySet(sEntitySet, sNavPath, oMetadata);
                oGeneralFacet.Facets[j].NavEntitySet = sNavEntitySet;
                if (sNavEntitySet) {
                    sEntitySetForFacet = sNavEntitySet;
                } else {
                    sEntitySetForFacet = sEntitySet;
                }
                oGeneralFacet.Facets[j].EntitySet = sEntitySetForFacet;
                sNavEntityType = getEntityType(sNavEntitySet, oMetadata);
                if (sNavEntityType) {
                    sEntityTypeForFacet = sNavEntityType;
                } else {
                    sEntityTypeForFacet = sEntityType;
                }
                oGeneralFacet.Facets[j].EntityType = sEntityTypeForFacet;
                aFacetContent = [];
                if (oMapping[sEntityTypeForFacet][sUseTerm].length) {
                    aFacetContent = oMapping[sEntityTypeForFacet][sUseTerm];
                } else if (oMapping[sEntityTypeForFacet][sUseTerm].Data.length) {
                    aFacetContent = oMapping[sEntityTypeForFacet][sUseTerm].Data;
                }
                oGeneralFacet.Facets[j].Content = aFacetContent;
                for (let i = 0; i < aFacetContent.length; ++i) {
                    oImportance = getImportanceOfRecord(aFacetContent[i]);
                    if (oImportance === "High") {
                        iFieldsWithPrioHigh += 1;
                    } else if (oImportance === "Medium") {
                        iFieldsWithPrioMedium += 1;
                    }
                }
            }
            if (iFieldsWithPrioHigh >= iMaxItemsInGeneral) {
                iFieldsWithPrioHigh = iMaxItemsInGeneral;
                iFieldsWithPrioMedium = 0;
            } else if ((iFieldsWithPrioHigh + iFieldsWithPrioMedium) > iMaxItemsInGeneral) {
                iFieldsWithPrioMedium = iMaxItemsInGeneral - iFieldsWithPrioHigh;
                if (iFieldsWithPrioMedium < 0) {
                    iFieldsWithPrioMedium = 0;
                }
            }
            // On mobile phones only fields with priority high should be displayed
            if (jQuery.device.is.phone) {
                iFieldsWithPrioMedium = 0;
            }
            iFreeSpaceBuffer = iMaxItemsInGeneral - iFieldsWithPrioHigh - iFieldsWithPrioMedium;
            oFacet = new FacetOverview({
                title: oSapSuiteRb.getText("UNIFIEDTHINGINSPECTOR_GENERAL_INFORMATION_HEADER_TEXT")
            });
            aAllFacets = [];
            aAllFacets.push(oFacet);
            aAllFacets[0].bLoaded = false;
            aAllFacets[0].bProcessed = false;
            aAllFacets[0].bIsTable = false;
            aContent = [];
            iFieldsOnOverview = iFieldsWithPrioMedium + iFieldsWithPrioHigh;
            for (let j = 0; j < oGeneralFacet.Facets.length; ++j) {
                oFormLayout = formLayoutFactory(oModel, oGeneralFacet.Facets[j].EntitySet, oGeneralFacet.Facets[j].Content, {
                    High: iFieldsWithPrioHigh,
                    Medium: iFieldsWithPrioMedium,
                    Low: 0
                }, null, oFacet).addStyleClass("sapFactsheetUtiTilePadding");
                if (j > 0) {
                    oFormLayout.addStyleClass("sapFactsheetUtiPaddingTop");
                }
                if (oGeneralFacet.Facets[j].NavPath) {
                    oFormLayout.bindElement(`${sBindingPath}/${oGeneralFacet.Facets[j].NavPath}`);
                }
                oFieldSumsByPriority = getFieldSumsByPriority(oGeneralFacet.Facets[j].Content);
                iFieldsWithPrioHigh -= oFieldSumsByPriority.High;
                iFieldsWithPrioMedium -= oFieldSumsByPriority.Medium;
                if (((oFieldSumsByPriority.High > 0) && ((iFieldsWithPrioHigh + oFieldSumsByPriority.High) > 0)) ||
                    ((oFieldSumsByPriority.Medium > 0) && ((iFieldsWithPrioMedium + oFieldSumsByPriority.Medium) > 0))) {
                    aContent.push(oFormLayout);
                    /*
                    If there is more than one facet there will be some space between the facets.
                    Because of this the number of fields to be displayed must be reduced.
                    */
                    if (j > 0) {
                        if (iFreeSpaceBuffer > 0) {
                            --iFreeSpaceBuffer;
                        } else if (iFieldsWithPrioMedium > 0) {
                            --iFieldsWithPrioMedium;
                        } else if (iFieldsWithPrioHigh > 0) {
                            --iFieldsWithPrioHigh;
                        }
                    }
                }
                if ((iFieldsWithPrioHigh < 1) && (iFieldsWithPrioMedium < 1)) {
                    break;
                }
            }
            if (iFieldsWithPrioHigh < 0) {
                iFieldsWithPrioHigh = 0;
            }
            if (iFieldsWithPrioMedium < 0) {
                iFieldsWithPrioMedium = 0;
            }
            oContent = new VerticalLayout({ content: aContent, width: "100%" });
            sGeneralTileHeight = getTeaserTileHeight();
            iRowSpan = 1;
            if ((iFieldsOnOverview > 3) && (iFieldsOnOverview <= 9)) {
                sGeneralTileHeight = getTeaserTileHeight(2);
                iRowSpan = 2;
            } else if (iFieldsOnOverview > 9) {
                sGeneralTileHeight = getTeaserTileHeight(3);
                iRowSpan = 3;
            }
            oFacet.setContent(oContent);
            oFacet.setRowSpan(iRowSpan);
            if (jQuery.device.is.phone) {
                oFacet.setHeightType(FacetOverviewHeight.Auto);
            } else {
                oFacet.setHeight(sGeneralTileHeight);
            }
            oFacet.addStyleClass("sapFactsheetUtiGeneralInformationOverviewFacet");
            oFacet.attachPress({ facets: oGeneralFacet }, function (oEvent, oData) {
                let sDefaultSpan;
                let oGrid;
                let oContent;
                oTI.removeAllFacetContent();
                const oTG = new UnifiedThingGroup();
                oTG.setDescription(getTIDescription());
                oTG.setTitle(oSapSuiteRb.getText("UNIFIEDTHINGINSPECTOR_GENERAL_INFORMATION_HEADER_TEXT"));
                oTG.addStyleClass("sapFactsheetUtiGeneralInformationUtg");
                if (oData.facets.Facets.length > 1) {
                    sDefaultSpan = "L6 M12 S12";
                } else {
                    sDefaultSpan = "L12 M12 S12";
                }
                aAllFacets[0].Links = [];
                const oVL = new VerticalLayout({ width: "100%" });
                for (let i = 0; i < oData.facets.Facets.length; ++i) {
                    if (i % 2 === 0) {
                        oGrid = new Grid({
                            hSpacing: 1,
                            vSpacing: 1,
                            defaultSpan: sDefaultSpan
                        });
                    }
                    oContent = facetFactory(oModel, sEntitySet, oData.facets.Facets[i], sBindingPath, this);
                    oContent.addStyleClass("sapFactsheetUtiGeneralInformationUtgContent");
                    if ((i === 0) && (oData.facets.Facets.length > 1) && (oContent.getTitle().trim() === "")) {
                        oContent.setTitle(oSapSuiteRb.getText("UNIFIEDTHINGINSPECTOR_GENERAL_INFORMATION_HEADER_TEXT"));
                    }
                    oGrid.addContent(oContent);
                    if (i % 2 !== 0) {
                        oVL.addContent(oGrid);
                    }
                }
                // Workaround: no Link if no authority
                aAllFacets[0].bLoaded = true;
                aAllFacets[0].bProcessed = false;
                aAllFacets[0].bIsTable = false;
                checkLinks(0);
                // Workaround: no Link if no authority
                if (i % 2 !== 0) {
                    oVL.addContent(oGrid);
                }
                oTG.setContent(oVL);
                oTI.addFacetContent(oTG);
                oTI.navigateToDetail();
            });
            oTI.addFacet(oFacet);
        }

        // Callback method of the oData reads for the geofacet
        function oDataReadCallbackGeo (functionParameters) {
            return function (data) {
                let oGeoModel;
                let oGeoLocation;
                let sPos;
                let oNewFlags;
                let oJsonModel;
                let sBindingPath;
                let oContentAddress;
                let oHeaderInfoGeo;
                let oIdentificationGeo;
                let oContentTitle;
                let oContentDescription;
                let oContentDetail;
                let sCaption;
                let iCount;

                function submitListener (oEvent) {
                    let sSpot;
                    let oPopupJSON;
                    let popUpHeight;
                    let popUpWidth;
                    // Get the Spot on which was clicked
                    const oEventJSON = JSON.parse(oEvent.getParameters().data);
                    if (oEventJSON.Action.name === "DETAIL_REQUEST" && oEventJSON.Action.instance) {
                        sSpot = oEventJSON.Action.instance;
                        // Parse index of clicked Spot
                        if (oJsonModel.oData.results) {
                            sBindingPath = `/results/${sSpot.split(".")[1]}`;
                        }
                        sCaption = oHeaderInfoGeo.TypeName.String.substring(0, 17); // caption must not be to long!
                        // Create JSON for Pop-Up
                        popUpHeight = parseFloat(getTeaserTileHeight(0.7)) * 16; // popup does not support rem -> do crude conversion
                        popUpWidth = parseFloat(getTeaserTileHeight(1.5)) * 16;
                        oPopupJSON = {
                            SAPVB: {
                                version: "2.0",
                                "xmlns:VB": "VB",
                                Windows: {
                                    Remove: { name: "Detail1" },
                                    Set: {
                                        name: "Detail1",
                                        Window: {
                                            id: "Detail1",
                                            type: "callout",
                                            refParent: "Main",
                                            refScene: "",
                                            offsetX: "16",
                                            offsetY: "-27",
                                            modal: "false",
                                            width: popUpWidth,
                                            height: popUpHeight,
                                            caption: sCaption,
                                            "pos.bind": `${sSpot}.GeoPosition`
                                        }
                                    }
                                },
                                Scenes: {
                                    Set: {
                                        name: "Details",
                                        Scene: {
                                            id: "Details",
                                            navControlVisible: "false"
                                        }
                                    }
                                }
                            }
                        };
                        this.load(oPopupJSON);
                    }
                }
                function openWindowListener (oEvent) {
                    let key;
                    let sNavEntitySet;
                    let iMaxFields;
                    if (!oContentTitle) {
                        // Content of Pop-Up doesn't exist yet.
                        // Get title and description of Pop-Up from HeaderInfo Term
                        oContentTitle = dataField(oHeaderInfoGeo.Title, functionParameters.navigationType, oMetadata, functionParameters.facet);
                        oContentTitle.setModel(oJsonModel);
                        oContentTitle.bindElement(sBindingPath);
                        oContentDescription = dataField(oHeaderInfoGeo.Description, functionParameters.navigationType, oMetadata, functionParameters.facet);
                        oContentDescription.setModel(oJsonModel);
                        oContentDescription.bindElement(sBindingPath);
                        // Get formatted address from property "label"
                        for (key in oGeoLocation.Address) {
                            if (key === "label") {
                                oContentAddress = dataField({ Value: oGeoLocation.Address[key] }, functionParameters.navigationType, oMetadata, functionParameters.facet);
                                oContentAddress.setModel(oJsonModel);
                                oContentAddress.bindElement(sBindingPath);
                                break;
                            }
                        }
                        // Calculate maximal number of displayed high fields depending on device
                        iMaxFields = 7; // Default value for desktop
                        if (jQuery.device.is.tablet && jQuery.device.is.landscape) {
                            iMaxFields = 4;
                        } else if (jQuery.device.is.tablet && jQuery.device.is.portrait) {
                            iMaxFields = 5;
                        } else if (jQuery.device.is.phone && jQuery.device.is.landscape) {
                            iMaxFields = 2;
                        } else if (jQuery.device.is.phone && jQuery.device.is.portrait) {
                            iMaxFields = 3;
                        }
                        // Create a content for the additional fields with maximally 7 prio high field from Identification Term
                        oContentDetail = new VerticalLayout({ width: "100%" }).setModel(oModel);
                        if (functionParameters.navigationPath) {
                            // GeoData is on subnode
                            sNavEntitySet = getNavEntitySet(functionParameters.entitySet, functionParameters.navigationPath, oMetadata);
                            oContentDetail.addContent(formLayoutFactory(oModel, sNavEntitySet, oIdentificationGeo, { High: iMaxFields }, null, functionParameters.facet));
                            oContentDetail.setModel(oJsonModel).bindElement(sBindingPath);
                        } else {
                            // GeoData is on root node
                            oContentDetail.addContent(formLayoutFactory(oModel, functionParameters.entitySet, oIdentificationGeo,
                                { High: iMaxFields }, null, functionParameters.facet)).setModel(oJsonModel).bindElement(sBindingPath);
                        }
                    } else {
                        // Content of Pop-Up exists, rebind elements
                        oContentTitle.bindElement(sBindingPath);
                        if (oContentDescription) {
                            oContentDescription.bindElement(sBindingPath);
                        }
                        if (oContentAddress) {
                            oContentAddress.bindElement(sBindingPath);
                        }
                        if (oContentDetail) {
                            oContentDetail.bindElement(sBindingPath);
                        }
                    }
                    const sPopUpWidth = `${parseFloat(getTeaserTileHeight(1.5)) * 16 * 0.95}px`; // Popup does not support rem -> do crude conversion
                    if (oContentTitle) {
                        oContentTitle.placeAt(oEvent.getParameter("contentarea").id);
                        oContentTitle.addStyleClass("sapFactsheetUtiGeoPopupHead");
                        if (jQuery.device.is.phone) {
                            oContentTitle.addStyleClass("sapFactsheetUtiGeoPopupHeadFontPhone");
                        }
                        oContentTitle.setWidth(sPopUpWidth);
                    }
                    if (oContentDescription) {
                        oContentDescription.placeAt(oEvent.getParameter("contentarea").id);
                        oContentDescription.addStyleClass("sapFactsheetUtiGeoPopupDescr");
                        if (jQuery.device.is.phone) {
                            oContentDescription.addStyleClass("sapFactsheetUtiGeoPopupDescrFontPhone");
                        }
                        oContentDescription.setWidth(sPopUpWidth);
                    }
                    if (oContentAddress) {
                        oContentAddress.placeAt(oEvent.getParameter("contentarea").id);
                        oContentAddress.addStyleClass("sapFactsheetUtiGeoPopupText");
                        oContentAddress.setWidth(sPopUpWidth);
                    }
                    // If no Content available then don't show the control with "No Data"
                    if (oContentDetail && oContentDetail.getContent()[0] && oContentDetail.getContent()[0].getContent
                        && oContentDetail.getContent()[0].getContent().length > 0) {
                        oContentDetail.placeAt(oEvent.getParameter("contentarea").id);
                        oContentDetail.addStyleClass("sapFactsheetUtiGeoPopupText");
                        oContentDetail.setWidth(sPopUpWidth);
                    }
                    // Workaround: no Link if no authority
                    if (aAllFacets.indexOf(functionParameters.facet) >= 0) {
                        aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bLoaded = true;
                        aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bProcessed = false;
                        aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bIsTable = false;
                    }
                    checkLinks(aAllFacets.indexOf(functionParameters.facet));
                    // Workaround: no Link if no authority
                }
                function closeWindowListener (oEvent) {
                    if (oContentTitle) {
                        oContentTitle.destroy();
                        oContentTitle = undefined;
                    }
                    if (oContentDescription) {
                        oContentDescription.destroy();
                        oContentDescription = undefined;
                    }
                    if (oContentAddress) {
                        oContentAddress.destroy();
                        oContentAddress = undefined;
                    }
                    if (oContentDetail) {
                        oContentDetail.destroy();
                        oContentDetail = undefined;
                    }
                    jQuery(oEvent.getParameter("contentarea").id).empty();
                }
                function processGeoApplication (functionParameters) {
                    return function (data) {
                        let oGeoContentDetail;
                        let oTG;
                        let sJSON;
                        sJSON = data.ProjectJSON;
                        sJSON = sJSON.indexOf("{") ? sJSON.substr(sJSON.indexOf("{")) : sJSON; // Workaround: to get rid of a BOM character at the first position
                        const oGeoJSON = JSON.parse(sJSON);
                        oGeoJSON.SAPVB.Scenes.Set.SceneGeo.initialStartPosition = sPos;
                        oGeoJSON.SAPVB.Scenes.Set.SceneGeo.initialZoom = 12;
                        // Register click/touch event on map
                        oGeoJSON.SAPVB.Actions.Set.Action.push({
                            id: "200",
                            name: "TAP_ON_MAP",
                            refEvent: "Click",
                            refScene: "MainScene",
                            refVO: "Map"
                        });
                        if (oNewFlags) {
                            oGeoJSON.SAPVB.Data = oNewFlags.Data;
                        }
                        // Workaround: for the Spots set the scale attribute to a vector (x,y,z)
                        for (let i = 0; i < oGeoJSON.SAPVB.Scenes.Set.SceneGeo.VO.length; ++i) {
                            if (oGeoJSON.SAPVB.Scenes.Set.SceneGeo.VO[i].datasource === "Spots") {
                                if (oGeoJSON.SAPVB.Scenes.Set.SceneGeo.VO[i].scale && oGeoJSON.SAPVB.Scenes.Set.SceneGeo.VO[i].scale.split(";").length !== 3) {
                                    oGeoJSON.SAPVB.Scenes.Set.SceneGeo.VO[i].scale = "1.0;1.0;1.0";
                                    break;
                                }
                            }
                        }
                        // listen to click/touch event on map on the overview tile
                        functionParameters.facet.getContent().attachSubmit((/* oEvent */) => {
                            // Workaround for mobile devices
                            // fire Press event if any action is done (touch/tap/zoom) on map on overview tile
                            if (jQuery.device.is.tablet || jQuery.device.is.phone) {
                                functionParameters.facet.firePress();
                            }
                        });
                        functionParameters.facet.getContent().load(oGeoJSON);
                        functionParameters.facet.attachPress("", (/* oEvent, oData */) => {
                            const aLong = [];
                            const aLat = [];
                            let newHeight;
                            // Create GeoMap content
                            if (!oGeoContentDetail) {
                                oGeoContentDetail = new VBI({
                                    width: "100%",
                                    height: "100%",
                                    plugin: false,
                                    config: null
                                });
                                oGeoContentDetail.addStyleClass("sapFactsheetUtiGeoPopup");
                            }
                            oGeoJSON.SAPVB.Scenes.Set.SceneGeo.NavigationDisablement.move = "false";
                            oGeoJSON.SAPVB.Scenes.Set.SceneGeo.NavigationDisablement.zoom = "false";
                            oGeoJSON.SAPVB.Scenes.Set.SceneGeo.NavigationDisablement.pitch = "false";
                            oGeoJSON.SAPVB.Scenes.Set.SceneGeo.NavigationDisablement.yaw = "false";
                            oGeoJSON.SAPVB.Scenes.Set.SceneGeo.SuppressedNavControlVisibility = "false";
                            oGeoContentDetail.load(oGeoJSON);
                            // Collect longitude and latitude data of all locations
                            if (functionParameters.cardinality === "*") {
                                for (let i = 0; i < oJsonModel.oData.results.length; ++i) {
                                    aLong.push(oJsonModel.oData.results[i][oGeoLocation.Longitude.Path]);
                                    aLat.push(oJsonModel.oData.results[i][oGeoLocation.Latitude.Path]);
                                }
                            }
                            oGeoContentDetail.attachSubmit(submitListener);
                            oGeoContentDetail.attachOpenWindow(openWindowListener);
                            oGeoContentDetail.attachCloseWindow(closeWindowListener);
                            oTG = new UnifiedThingGroup({
                                content: oGeoContentDetail,
                                title: functionParameters.facetContent.Label.String,
                                description: getTIDescription()
                            });
                            oTI.removeAllFacetContent();
                            oTI.addFacetContent(oTG);
                            oTI.navigateToDetail();
                            // Workaround: UnifiedThingGroup doesn't propagate the height property to the childs, therefore we calculate the height manually
                            oTI.attachAfterNavigate(aLong, (oEvent) => {
                                if (oEvent.getParameters().getParameters().toId.indexOf("-detail-page") !== -1) {
                                    // Resize map to full container size on desktop and tablet and to 300px on phone
                                    if (jQuery.device.is.phone) {
                                        newHeight = "300px";
                                    } else {
                                        newHeight = `${Math.floor(jQuery(`#${oEvent.getParameters().getParameters().toId}-cont`).height() - 128)}px`;
                                    }
                                    oGeoContentDetail.setHeight(newHeight);
                                    // Zoom to show all locations
                                    if (aLong.length > 1) {
                                        oGeoContentDetail.zoomToGeoPosition(aLong, aLat);
                                    }
                                }
                            });
                        });
                    };
                }
                function geoMapCallFailed (facet) {
                    return function (/* error */) {
                        // OData returns an error. Don't display the map facet.
                        oTI.removeFacet(facet);
                    };
                }

                if ((functionParameters.cardinality === "*" && data.results && data.results.length && data.results.length !== 0) ||
                    (functionParameters.cardinality === "1" && data)) {
                    oJsonModel = new JSONModel();
                    if (functionParameters.cardinality === "*") {
                        if (data.results && data.results.length) {
                            oJsonModel.setData(data);
                        }
                    } else {
                        oJsonModel.setData({ result: data });
                        sBindingPath = "/result";
                    }
                    oGeoModel = new ODataModel("/sap/opu/odata/sap/VBI_APPL_DEF_SRV", false);
                    oGeoLocation = oMapping[functionParameters.navigationType]["com.sap.vocabularies.UI.v1.GeoLocation"];
                    oHeaderInfoGeo = oMapping[functionParameters.navigationType]["com.sap.vocabularies.UI.v1.HeaderInfo"];
                    oIdentificationGeo = oMapping[functionParameters.navigationType]["com.sap.vocabularies.UI.v1.Identification"];
                    if (oGeoLocation.Longitude && oGeoLocation.Latitude) {
                        oNewFlags = {
                            Data: {
                                Set: {
                                    N: [{
                                        name: "Spots",
                                        E: []
                                    }]
                                }
                            }
                        };
                        if (functionParameters.cardinality === "1") {
                            if (oGeoLocation.Longitude.Path && oGeoLocation.Latitude.Path) {
                                sPos = `${data[oGeoLocation.Longitude.Path]};${data[oGeoLocation.Latitude.Path]};0`;
                            }
                            oNewFlags.Data.Set.N[0].E.push({ A: sPos, I: "pin_blue.png" });
                        } else {
                            for (let i = 0; i < data.results.length; ++i) {
                                if (oGeoLocation.Longitude.Path && oGeoLocation.Latitude.Path) {
                                    sPos = `${data.results[i][oGeoLocation.Longitude.Path]};${data.results[i][oGeoLocation.Latitude.Path]};0`;
                                }
                                oNewFlags.Data.Set.N[0].E.push({ A: sPos, I: "pin_blue.png" });
                            }
                            // Set to first position
                            if (data.results.length !== 0) {
                                sPos = `${data.results[0][oGeoLocation.Longitude.Path]};${data.results[0][oGeoLocation.Latitude.Path]};0`;
                            }
                        }
                    }
                    iCount = parseInt(data.__count, 10);
                    if (Number(iCount)) {
                        functionParameters.facet.setQuantity(iCount);
                    }
                    oGeoModel.read("VBIApplicationSet('ZFACTSHEETS')", "", "", false, processGeoApplication(functionParameters), geoMapCallFailed(functionParameters.facet));
                } else {
                    functionParameters.facet.setQuantity(undefined);
                    functionParameters.facet.addStyleClass("sapFactsheetUtiEmptyTile");
                    functionParameters.facet.setHeightType(jQuery.device.is.phone ? FacetOverviewHeight.Auto : FacetOverviewHeight.S);
                    functionParameters.facet.setContent(undefined);
                    functionParameters.facet.setTitle(undefined);
                }
            };
        }

        // Callback method of the oData reads for the further facets
        function oDataReadCallback (functionParameters) {
            return function (data) {
                let sSeparator = "";
                let oJsonModel;
                let oBadge;
                let oTitle;
                let oMainInfo;
                let oHLayout;
                let sSetTitle;
                let oContent;
                let iCount;
                let oVLayoutForLabelValuePairs;
                let aPropertyExtensions;
                let oHLayoutForTitle;
                let oTitleLabel;
                let oHLayoutForMainInfo;
                let oMainInfoLabel;
                let oHLayoutForSecondaryInfo;
                let oSecondaryInfoLabel;
                let oSecondaryInfo;
                let oImageUrl;
                let oHLayoutForIconAndText;
                let iSize;
                let oImage;
                let sAttribute;
                let bResultNotEmpty;
                let oAnnotationPath;
                let oChart;
                let oLabel;
                let aDimensions;
                let aMeasures;
                let oDataset;
                oJsonModel = new JSONModel();
                if (functionParameters.facetContent.Target && functionParameters.facetContent.Target.AnnotationPath
                    && functionParameters.facetContent.Target.AnnotationPath.split("#")[1]
                    && oMapping[functionParameters.navigationType][`com.sap.vocabularies.UI.v1.Badge#${functionParameters.facetContent.Target.AnnotationPath.split("#")[1]}`]) {
                    oBadge = oMapping[functionParameters.navigationType][`com.sap.vocabularies.UI.v1.Badge#${functionParameters.facetContent.Target.AnnotationPath.split("#")[1]}`];
                } else {
                    oBadge = oMapping[functionParameters.navigationType]["com.sap.vocabularies.UI.v1.Badge"];
                }
                if (functionParameters.cardinality === "*") {
                    if (data.results && data.results.length) {
                        oAnnotationPath = functionParameters.facetContent.Target.AnnotationPath;
                        sTerm = oAnnotationPath.substring(oAnnotationPath.lastIndexOf("@") + 1);
                        if (sTerm === "com.sap.vocabularies.UI.v1.Chart") {
                            oChart = oMapping[functionParameters.navigationType]["com.sap.vocabularies.UI.v1.Chart"];
                            oLabel = oMapping.propertyExtensions[functionParameters.navigationType];
                            // Collect dimensions
                            aDimensions = [];
                            for (let i = 0; i < oChart.Dimensions.length; ++i) {
                                aDimensions.push({
                                    axis: 1,
                                    name: oLabel[oChart.Dimensions[i].PropertyPath]["http://www.sap.com/Protocols/SAPData"].label,
                                    value: `{${oChart.Dimensions[i].PropertyPath}}`
                                });
                            }
                            // Collect measures
                            aMeasures = [];
                            for (let i = 0; i < oChart.Measures.length; ++i) {
                                aMeasures.push({
                                    name: oLabel[oChart.Measures[i].PropertyPath]["http://www.sap.com/Protocols/SAPData"].label,
                                    value: `{${oChart.Measures[i].PropertyPath}}`
                                });
                            }
                            oDataset = new FlattenedDataset({
                                dimensions: aDimensions,
                                measures: aMeasures,
                                data: { path: "/results" }
                            });
                            oContent = chartControlFactory(oChart.ChartType.EnumMember, oChart.Title, oChart.Description, oDataset);
                            // Attach the model to the chart and display it
                            oContent.setModel(oJsonModel);
                            functionParameters.facet.setHeightType(jQuery.device.is.phone ? FacetOverviewHeight.Auto : FacetOverviewHeight.XL);
                        } else {
                            oContent = new VerticalLayout({ width: "100%" }).addStyleClass("sapFactsheetUtiVLayoutPadding");
                            for (let i = 0; i < data.results.length; ++i) {
                                oHLayout = new HorizontalLayout().addStyleClass("sapFactsheetUtiHLayoutPadding");
                                oTitle = dataField(oBadge.Title, functionParameters.navigationType, oMetadata, functionParameters.facet);
                                if (oTitle.setWrapping) {
                                    oTitle.setWrapping(false);
                                }
                                Core.byId(`${oTI.getId()}-master-page`).addDelegate({
                                    onAfterShow: (function (oHLayout) {
                                        return function () {
                                            let iHorizontalLayoutWidthLeft;
                                            const iHorizontalLayoutWidth = oHLayout.getParent().getDomRef().clientWidth;
                                            iHorizontalLayoutWidthLeft = iHorizontalLayoutWidth;
                                            if (oHLayout.getContent()[0]) {
                                                iHorizontalLayoutWidthLeft -= oHLayout.getContent()[0].getDomRef().clientWidth;
                                                if (iHorizontalLayoutWidth < oHLayout.getContent()[0].getDomRef().clientWidth) {
                                                    oHLayout.getContent()[0].getDomRef().setAttribute("style", `width:${iHorizontalLayoutWidth}px`);
                                                    return;
                                                }
                                            }
                                            if (oHLayout.getContent()[1]) {
                                                iHorizontalLayoutWidthLeft -= oHLayout.getContent()[1].getDomRef().clientWidth;
                                            }
                                            if (iHorizontalLayoutWidthLeft < 10) {
                                                iHorizontalLayoutWidthLeft = 0;
                                            }
                                            if (oHLayout.getContent()[2]) {
                                                oHLayout.getContent()[2].getDomRef().setAttribute("style", `width:${iHorizontalLayoutWidthLeft}px`);
                                            }
                                        };
                                    }(oHLayout))
                                });
                                oJsonModel = new JSONModel();
                                oJsonModel.setData({ result: data.results[i] });
                                oTitle.setModel(oJsonModel);
                                oTitle.bindElement("/result");
                                sSetTitle = false;
                                if (data.results[i][oBadge.Title.Value.Path]) {
                                    sSetTitle = true;
                                }
                                if (oBadge.Title.Value.Apply) {
                                    for (let j = 0; j < oBadge.Title.Value.Apply.Parameters.length; ++j) {
                                        if (oBadge.Title.Value.Apply.Parameters[j].Type === "Path") {
                                            if (data.results[i][oBadge.Title.Value.Apply.Parameters[j].Value]) {
                                                sSetTitle = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                                sSeparator = "";
                                if (sSetTitle) {
                                    oHLayout.addContent(oTitle);
                                    // Define the separator for the Tile values e.g. VALUE - VALUE or VALUE, VALUE
                                    if (oBadge.MainInfo && ((oBadge.MainInfo.EdmType && oBadge.MainInfo.EdmType === "Edm.Decimal") ||
                                        (oBadge.MainInfo.Value && oBadge.MainInfo.Value.Apply && oBadge.MainInfo.Value.Apply.Parameters[0]
                                            && oBadge.MainInfo.Value.Apply.Parameters[0].EdmType && oBadge.MainInfo.Value.Apply.Parameters[0].EdmType === "Edm.Decimal"))) {
                                        // Decimals
                                        sSeparator = "comma";
                                    } else if (oBadge.MainInfo && oBadge.MainInfo.Value.Path && data.results[i][oBadge.MainInfo.Value.Path]) {
                                        // Non decimal
                                        sSeparator = "dash";
                                    } else if (oBadge.MainInfo && oBadge.MainInfo.Value.Apply) {
                                        // Non decimal concatenated fields
                                        for (let j = 0; j < oBadge.MainInfo.Value.Apply.Parameters.length; ++j) {
                                            if (oBadge.MainInfo.Value.Apply.Parameters[j].Type === "Path") {
                                                if (data.results[i][oBadge.MainInfo.Value.Apply.Parameters[j].Value]) {
                                                    sSeparator = "dash";
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    if (sSeparator === "dash") {
                                        oHLayout.addContent(new HTML({ content: "<span class=\"sapFactsheetUtiSeparatorPadding sapMText\"> &ndash; </span>" }));
                                    }
                                    if (sSeparator === "comma") {
                                        oHLayout.addContent(new Text({ text: ", " }).addStyleClass("sapFactsheetUtiSeparatorPaddingForDecimal"));
                                    }
                                }

                                if (oBadge.MainInfo) {
                                    oMainInfo = dataField(oBadge.MainInfo, functionParameters.navigationType, oMetadata, functionParameters.facet);
                                    if (oMainInfo.setWrapping) {
                                        oMainInfo.setWrapping(false);
                                    }
                                    oMainInfo.setModel(oJsonModel);
                                    oMainInfo.bindElement("/result");
                                    oHLayout.addContent(oMainInfo);
                                }
                                oContent.addContent(oHLayout);
                            }
                        }
                        iCount = parseInt(data.__count, 10);
                        if (Number(iCount)) {
                            functionParameters.facet.setQuantity(iCount);
                        }
                        functionParameters.facet.setContent(oContent);

                        functionParameters.facet.attachPress({ facet: functionParameters.facetContent }, function (oEvent, oData) {
                            oTI.removeAllFacetContent();
                            aAllFacets[aAllFacets.indexOf(functionParameters.facet)].Links = [];
                            const oContent = facetFactory(oModel, functionParameters.entitySet, oData.facet, functionParameters.bindingPath, this);
                            oContent.setDescription(getTIDescription());
                            oTI.addFacetContent(oContent);
                            // Workaround: no Link if no authority
                            if (aAllFacets.indexOf(functionParameters.facet) >= 0) {
                                aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bLoaded = false;
                                aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bProcessed = false;
                                aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bIsTable = true;
                            }
                            checkLinks(aAllFacets.indexOf(functionParameters.facet));
                            // Workaround: no Link if no authority
                            oTI.navigateToDetail();
                        });
                    } else {
                        functionParameters.facet.setQuantity(0);
                        functionParameters.facet.addStyleClass("sapFactsheetUtiEmptyTile");
                        functionParameters.facet.setHeightType(jQuery.device.is.phone ? FacetOverviewHeight.Auto : FacetOverviewHeight.S);
                    }
                    // Workaround: no Link if no authority
                    if (aAllFacets.indexOf(functionParameters.facet) >= 0) {
                        aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bLoaded = true;
                        aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bProcessed = false;
                        aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bIsTable = false;
                    }
                    checkLinks(aAllFacets.indexOf(functionParameters.facet));
                    // Workaround: no Link if no authority
                } else {
                    oJsonModel.setData({ result: data });
                    // Check if response returned data as Gateway is currently not able to send the right HTTP status code for an empty document.
                    for (sAttribute in data) {
                        if (data.hasOwnProperty(sAttribute)) {
                            if (sAttribute !== "__metadata") {
                                // A string which is not empty
                                if (typeof data[sAttribute] === "string" && data[sAttribute]) {
                                    // Could be a number like f.e. "0.000" or "000000", that returns 0 when calling parseInt.
                                    // When the string contains chars parseInt returns NaN.
                                    if (parseInt(data[sAttribute], 10) !== 0) {
                                        bResultNotEmpty = true;
                                        break;
                                    }
                                } else if (typeof data[sAttribute] === "number" && parseInt(data[sAttribute], 10) !== 0) {
                                    bResultNotEmpty = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (bResultNotEmpty) {
                        oVLayoutForLabelValuePairs = new VerticalLayout();
                        aPropertyExtensions = (oMapping.propertyExtensions) ? oMapping.propertyExtensions[functionParameters.navigationType] : [];
                        oHLayoutForTitle = new HorizontalLayout().addStyleClass("sapFactsheetUtiHLayoutLabelValue");
                        oTitleLabel = labelBinding(oBadge.Title, {}, aPropertyExtensions, true).addStyleClass("sapFactsheetUtiLabelMargin");
                        oTitle = dataField(oBadge.Title, functionParameters.navigationType, oMetadata, functionParameters.facet);
                        oTitle.setModel(oJsonModel);
                        oTitle.bindElement("/result");
                        oHLayoutForTitle.addContent(oTitleLabel);
                        oHLayoutForTitle.addContent(oTitle);
                        oVLayoutForLabelValuePairs.addContent(oHLayoutForTitle);
                        if (oBadge.MainInfo) {
                            oHLayoutForMainInfo = new HorizontalLayout().addStyleClass("sapFactsheetUtiHLayoutLabelValue");
                            oMainInfoLabel = labelBinding(oBadge.MainInfo, {}, aPropertyExtensions, true).addStyleClass("sapFactsheetUtiLabelMargin");
                            oMainInfo = dataField(oBadge.MainInfo, functionParameters.navigationType, oMetadata, functionParameters.facet);
                            oMainInfo.setModel(oJsonModel);
                            oMainInfo.bindElement("/result");
                            oHLayoutForMainInfo.addContent(oMainInfoLabel);
                            oHLayoutForMainInfo.addContent(oMainInfo);
                            oVLayoutForLabelValuePairs.addContent(oHLayoutForMainInfo);
                        }
                        if (oBadge.SecondaryInfo) {
                            oHLayoutForSecondaryInfo = new HorizontalLayout().addStyleClass("sapFactsheetUtiHLayoutLabelValue");
                            oSecondaryInfoLabel = labelBinding(oBadge.SecondaryInfo, {}, aPropertyExtensions, true).addStyleClass("sapFactsheetUtiLabelMargin");
                            oSecondaryInfo = dataField(oBadge.SecondaryInfo, functionParameters.navigationType, oMetadata, functionParameters.facet);
                            oSecondaryInfo.setModel(oJsonModel);
                            oSecondaryInfo.bindElement("/result");
                            oHLayoutForSecondaryInfo.addContent(oSecondaryInfoLabel);
                            oHLayoutForSecondaryInfo.addContent(oSecondaryInfo);
                            oVLayoutForLabelValuePairs.addContent(oHLayoutForSecondaryInfo);
                        }
                        if (oBadge.TypeImageUrl || oBadge.ImageUrl) {
                            if (oBadge.ImageUrl) {
                                oImageUrl = oBadge.ImageUrl;
                            } else {
                                oImageUrl = oBadge.TypeImageUrl;
                            }
                            oHLayoutForIconAndText = new HorizontalLayout();
                            iSize = "64px";
                            if (jQuery.device.is.phone) {
                                iSize = "48px";
                            }
                            if (oImageUrl.String && (oImageUrl.String.substr(0, 11) === "sap-icon://")) {
                                oImage = new Icon({ size: iSize, width: iSize });
                            } else {
                                oImage = new Image({ width: iSize });
                            }
                            oImage.addStyleClass("sapFactsheetUtiRelIcon");
                            if (oImageUrl && oImageUrl.String) {
                                oImage.setSrc(oImageUrl.String);
                            } else if (oImageUrl && oImageUrl.Path) {
                                oImage.bindProperty("src", oImageUrl.Path);
                            }
                            oHLayoutForIconAndText.addContent(oImage);
                            oHLayoutForIconAndText.addContent(oVLayoutForLabelValuePairs);
                            functionParameters.facet.setContent(oHLayoutForIconAndText);
                        } else {
                            functionParameters.facet.setContent(oVLayoutForLabelValuePairs);
                        }

                        functionParameters.facet.attachPress({ facet: functionParameters.facetContent }, function (oEvent, oData) {
                            oTI.removeAllFacetContent();
                            aAllFacets[aAllFacets.indexOf(functionParameters.facet)].Links = [];
                            const oContent = facetFactory(oModel, functionParameters.entitySet, oData.facet, functionParameters.bindingPath, this);
                            oContent.setDescription(getTIDescription());
                            oTI.addFacetContent(oContent);
                            // Workaround: no Link if no authority
                            if (aAllFacets.indexOf(functionParameters.facet) >= 0) {
                                aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bLoaded = true;
                                aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bProcessed = false;
                                aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bIsTable = false;
                            }
                            checkLinks(aAllFacets.indexOf(functionParameters.facet));
                            // Workaround: no Link if no authority
                            oTI.navigateToDetail();
                        });
                    } else {
                        functionParameters.facet.addStyleClass("sapFactsheetUtiEmptyTile");
                        functionParameters.facet.setHeightType(jQuery.device.is.phone ? FacetOverviewHeight.Auto : FacetOverviewHeight.S);
                    }
                    // Workaround: no Link if no authority
                    if (aAllFacets.indexOf(functionParameters.facet) >= 0) {
                        aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bLoaded = true;
                        aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bProcessed = false;
                        aAllFacets[aAllFacets.indexOf(functionParameters.facet)].bIsTable = false;
                    }
                    checkLinks(aAllFacets.indexOf(functionParameters.facet));
                    // Workaround: no Link if no authority
                }
            };
        }
        function oDataReadCallbackError (functionParameters) {
            return function (/* error */) {
                // OData returns an error. Don't display the facet.
                oTI.removeFacet(functionParameters.facet);
            };
        }
        function oDataReadCallbackMedia (functionParameters) {
            return function (data) {
                let oHLayout;
                let iCount;
                let oTG;
                const oMediaResource = oMapping[functionParameters.navigationType]["com.sap.vocabularies.UI.v1.MediaResource"];
                if (functionParameters.cardinality === "*") {
                    if (data.results && data.results.length) {
                        oHLayout = new HorizontalLayout().addStyleClass("sapFactsheetUtiPictureViewerOverview");
                        for (let i = 0; i < data.results.length; ++i) {
                            oHLayout.addContent(new Image({
                                src: data.results[i][oMediaResource.Thumbnail.Url.Path],
                                height: "85px"
                            }));
                            if (i === 3) {
                                break;
                            }
                        }
                        iCount = parseInt(data.__count, 10);
                        if (Number(iCount)) {
                            functionParameters.facet.setQuantity(iCount);
                        }
                        functionParameters.facet.setContent(oHLayout);
                        functionParameters.facet.attachPress({ facet: functionParameters.facetContent, data: data }, (oEvent, oData) => {
                            let sHeight;
                            let oImage;
                            oTI.removeAllFacetContent();
                            oTG = new UnifiedThingGroup();
                            if (oData.facet.Label && oData.facet.Label.String) {
                                oTG.setTitle(oData.facet.Label.String);
                            }
                            oTG.setDescription(getTIDescription());
                            if (jQuery.device.is.phone) {
                                sHeight = "350px";
                            } else {
                                sHeight = "550px";
                            }
                            const oPictureViewer = new Carousel({ height: sHeight });
                            for (let i = 0; i < oData.data.results.length; ++i) {
                                oImage = new Image({ src: oData.data.results[i][oMediaResource.Url.Path] });
                                if (jQuery.device.is.phone) {
                                    oImage.addStyleClass("sapFactsheetUtiCarouselMaxImageHeightPhone");
                                } else {
                                    oImage.addStyleClass("sapFactsheetUtiCarouselMaxImageHeight");
                                }
                                oPictureViewer.addPage(oImage);
                            }
                            oTG.setContent(oPictureViewer);
                            oTI.addFacetContent(oTG);
                            oTI.navigateToDetail();
                        });
                    } else {
                        functionParameters.facet.setQuantity(0);
                        functionParameters.facet.addStyleClass("sapFactsheetUtiEmptyTile");
                        functionParameters.facet.setHeightType(jQuery.device.is.phone ? FacetOverviewHeight.Auto : FacetOverviewHeight.S);
                    }
                }
            };
        }

        function extractContactsFromBatchRequest (oData, sOrder) {
            let aContactResults = [];
            const oContacts = {};
            let oContactMetadata;
            let sPhone;
            let sMobile;
            let sFax;
            let sTelephone;
            let sPhoto;
            let sMetadataEmail;
            function fFieldValue (oMetadata, oContactResult) {
                let sValue = "";
                if (oMetadata) {
                    if (oMetadata.Path) {
                        return oContactResult[oMetadata.Path];
                    } else if (oMetadata.String) {
                        return oMetadata.String;
                    } else if (oMetadata.Apply.Name === "odata.concat") {
                        for (let i = 0; i < oMetadata.Apply.Parameters.length; ++i) {
                            if (oMetadata.Apply.Parameters[i].Type === "Path") {
                                sValue = sValue + oContactResult[oMetadata.Apply.Parameters[i].Value];
                            } else if (oMetadata.Apply.Parameters[i].Type === "String") {
                                sValue = sValue + oMetadata.Apply.Parameters[i].Value;
                            }
                        }
                        return sValue;
                    }
                }
            }
            oContacts.iCount = 0;
            oContacts.aContacts = [];
            for (let i = 0; i < oData.__batchResponses.length; ++i) {
                if (!oData.__batchResponses[i].data) {
                    continue;
                }
                aContactResults = oData.__batchResponses[i].data.results;
                if (!aContactResults) {
                    aContactResults = [];
                    aContactResults.push(oData.__batchResponses[i].data);
                }
                if (aContactResults.length > 0) {
                    oContactMetadata = oMapping[aContactResults[0].__metadata.type]["com.sap.vocabularies.Communication.v1.Contact"];
                    if (oContactMetadata) {
                        for (let j = 0; j < aContactResults.length; ++j) {
                            sPhone = sMobile = sFax = "";
                            if (oContactMetadata.tel) {
                                for (let k = 0; k < oContactMetadata.tel.length; ++k) {
                                    if (oContactMetadata.tel[k].type && oContactMetadata.tel[k].type.EnumMember) {
                                        sTelephone = fFieldValue(oContactMetadata.tel[k].uri, aContactResults[j]);
                                        switch (oContactMetadata.tel[k].type.EnumMember) {
                                            case "com.sap.vocabularies.Communication.v1.PhoneType/voice":
                                                sPhone = sTelephone ? sTelephone.replace("tel:", "") : "";
                                                sPhone = sPhone ? sPhone.replace(";ext=", "") : "";
                                                break;
                                            case "com.sap.vocabularies.Communication.v1.PhoneType/cell":
                                                sMobile = sTelephone ? sTelephone.replace("tel:", "") : "";
                                                sMobile = sMobile ? sMobile.replace(";ext=", "") : "";
                                                break;
                                            case "com.sap.vocabularies.Communication.v1.PhoneType/fax":
                                                sFax = sTelephone ? sTelephone.replace("tel:", "") : "";
                                                sFax = sFax ? sFax.replace(";ext=", "") : "";
                                                break;
                                        }
                                    }
                                }
                            }
                            sMetadataEmail = oContactMetadata.email && oContactMetadata.email.address ? oContactMetadata.email.address : "";
                            sPhoto = fFieldValue(oContactMetadata.photo, aContactResults[j]);
                            oContacts.iCount += 1;
                            oContacts.aContacts.push({
                                fn: fFieldValue(oContactMetadata.fn, aContactResults[j]),
                                title: fFieldValue(oContactMetadata.title, aContactResults[j]),
                                org: fFieldValue(oContactMetadata.org, aContactResults[j]),
                                phone: sPhone,
                                mobile: sMobile,
                                fax: sFax,
                                photo: sPhoto,
                                email: fFieldValue(sMetadataEmail, aContactResults[j]),
                                sEntity: aContactResults[0].__metadata.type,
                                bExistsPhoto: !!sPhoto,
                                bUseIcon: !sPhoto,
                                sOrder: oContacts.iCount // Order inside an entity
                            });
                        }
                    }
                }
            }
            if (sOrder) {
                oContacts.aContacts.sort((a, b) => {
                    return a[sOrder] > b[sOrder] ? 1 : -1;
                });
            }
            return oContacts;
        }
        function oDataReadCallbackContacts (/* functionParameters */) {
            return function (oData) {
                let i;
                let oHLayout;
                let oVLayout;
                let oImgLayout;
                let oImage;
                let sTileSize;
                const oContacts = extractContactsFromBatchRequest(oData, "sOrder");
                const oGrid = new Grid({
                    defaultSpan: "L6 M6 S12",
                    hSpacing: 0,
                    vSpacing: 0
                }).addStyleClass("sapFactsheetUtiContactsGrid");
                for (let i = 0; i < oContacts.aContacts.length && i < 4; ++i) {
                    oImgLayout = new VerticalLayout();
                    if (oContacts.aContacts[i].photo) {
                        oImage = new Image({
                            height: "55px",
                            src: oContacts.aContacts[i].photo
                        });
                    } else {
                        oImage = new Icon({
                            size: "50px",
                            src: IconPool.getIconURI("person-placeholder")
                        }).addStyleClass("sapFactsheetUtiRelIcon");
                    }
                    oImgLayout.addContent(oImage);
                    oImgLayout.addStyleClass("sapFactsheetUtiContactsImage");
                    oVLayout = new VerticalLayout({
                        content: [new Text({
                            text: oContacts.aContacts[i].fn
                        }).addStyleClass("sapFactsheetUtiTextName"),
                        new Text({
                            text: oContacts.aContacts[i].title
                        }).addStyleClass("sapFactsheetUtiTextValue")]
                    });
                    oHLayout = new HorizontalLayout({
                        content: [oImgLayout, oVLayout]
                    }).addStyleClass("sapFactsheetUtiContactsBox");
                    oGrid.addContent(oHLayout);
                }
                oFacet = Core.byId(oTI.data("contactFacetId"));
                oFacet.setQuantity(oContacts.iCount);
                if (i > 0) {
                    oFacet.setContent(oGrid);
                    if (i <= 2) {
                        sTileSize = FacetOverviewHeight.M;
                    } else {
                        sTileSize = FacetOverviewHeight.L;
                    }
                    oFacet.attachPress(() => {
                        const aOperations = [];
                        let sBatchPath;
                        oModel.clearBatch();
                        for (let i = 0; i < oMapping[sEntityType]["com.sap.vocabularies.UI.v1.Contacts"].length; ++i) {
                            sNavPath = oMapping[sEntityType]["com.sap.vocabularies.UI.v1.Contacts"][i].AnnotationPath;
                            sNavPath = sNavPath.substring(0, sNavPath.lastIndexOf("@") - 1);
                            if (sNavPath !== "") {
                                sBatchPath = `${sBindingPath}/${sNavPath}`;
                            } else {
                                sBatchPath = sBindingPath;
                            }
                            aOperations.push(oModel.createBatchOperation(sBatchPath, "GET"));
                        }
                        oModel.addBatchReadOperations(aOperations);
                        oModel.submitBatch((oData) => {
                            const oResourceBundle = jQuery.sap.resources({
                                url: `${jQuery.sap.getModulePath("sap.ushell.components.container.")}/resources/resources.properties`,
                                language: Configuration.getLanguage()
                            });
                            const oContacts = extractContactsFromBatchRequest(oData, "sEntity");
                            const oJSONModel = new JSONModel();
                            oJSONModel.setData(oContacts);
                            const oTemplate = new ColumnListItem({
                                type: mobileLibrary.Inactive,
                                unread: false,
                                cells: [
                                    new VerticalLayout({
                                        content: [
                                            new Image({
                                                src: "{photo}",
                                                width: "74px",
                                                visible: "{bExistsPhoto}"
                                            }),
                                            new Icon({
                                                size: "76px",
                                                src: IconPool.getIconURI("person-placeholder"),
                                                visible: "{bUseIcon}"
                                            }).addStyleClass("sapFactsheetUtiRelIcon")
                                        ]
                                    }),
                                    new VerticalLayout({
                                        content: [
                                            new Text({ text: "{fn}" }).addStyleClass("sapFactsheetUtiContactsName"),
                                            new Label({ text: "{title}" }),
                                            new Label({ text: "{org}" })
                                        ]
                                    }),
                                    new Link({ text: "{phone}", href: "tel:{phone}" }),
                                    new Link({ text: "{mobile}", href: "tel:{mobile}" }),
                                    new Link({ text: "{fax}", href: "tel:{fax}" }),
                                    new Link({ text: "{email}", href: "mailto:{email}" })
                                ]
                            });
                            const oTable = new Table({
                                threshold: 2,
                                inset: false,
                                showUnread: true,
                                scrollToLoad: true,
                                columns: [
                                    new Column({
                                        hAlign: TextAlign.Center,
                                        width: "12%",
                                        header: new Text({ text: "" })
                                    }),
                                    new Column({
                                        hAlign: TextAlign.Begin,
                                        header: new Text({ text: oResourceBundle.getText("USHELL_FACTSHEET_NAME") })
                                    }),
                                    new Column({
                                        hAlign: TextAlign.Begin,
                                        width: "12%",
                                        header: new Text({ text: oResourceBundle.getText("USHELL_FACTSHEET_PHONE") }),
                                        minScreenWidth: "Tablet",
                                        demandPopin: true
                                    }),
                                    new Column({
                                        hAlign: TextAlign.Begin,
                                        width: "12%",
                                        header: new Text({ text: resources.i18n.getText("mobile") }),
                                        minScreenWidth: "Tablet",
                                        demandPopin: true
                                    }),
                                    new Column({
                                        hAlign: TextAlign.Begin,
                                        width: "12%",
                                        header: new Text({ text: resources.i18n.getText("fax") }),
                                        minScreenWidth: "Tablet",
                                        demandPopin: true
                                    }),
                                    new Column({
                                        hAlign: TextAlign.Begin,
                                        width: "26%",
                                        header: new Text({ text: oResourceBundle.getText("USHELL_FACTSHEET_EMAIL") }),
                                        minScreenWidth: "Tablet",
                                        demandPopin: true
                                    })
                                ],
                                items: {
                                    path: "/aContacts",
                                    template: oTemplate
                                }
                            });
                            const oVSDialog = new ViewSettingsDialog({
                                sortItems: [new ViewSettingsItem({ key: "fn", text: oResourceBundle.getText("USHELL_FACTSHEET_NAME") }),
                                    new ViewSettingsItem({ key: "phone", text: oResourceBundle.getText("USHELL_FACTSHEET_PHONE") }),
                                    new ViewSettingsItem({ key: "mobile", text: resources.i18n.getText("mobile") }),
                                    new ViewSettingsItem({ key: "fax", text: resources.i18n.getText("fax") }),
                                    new ViewSettingsItem({ key: "email", text: oResourceBundle.getText("USHELL_FACTSHEET_EMAIL") })],
                                confirm: function (evt) {
                                    const aSorters = [];
                                    const mParams = evt.getParameters();
                                    const oBinding = oTable.getBinding("items");
                                    if (mParams.sortItem) {
                                        aSorters.push(new Sorter(mParams.sortItem.getKey(), mParams.sortDescending));
                                        oBinding.sort(aSorters);
                                    }
                                }
                            });
                            oTable.setHeaderToolbar(new Toolbar({
                                content: [
                                    new Label(),
                                    new ToolbarSpacer(),
                                    new Button({
                                        icon: "sap-icon://drop-down-list",
                                        press: function (/* evt */) {
                                            oVSDialog.open();
                                        }
                                    })
                                ]
                            }));
                            oTable.setModel(oJSONModel);
                            const oTG = new UnifiedThingGroup({
                                title: oFacet.getTitle(),
                                description: getTIDescription(),
                                content: oTable
                            });
                            oTI.removeAllFacetContent();
                            oTI.addFacetContent(oTG);
                            oTI.navigateToDetail();
                        });
                    });
                } else {
                    sTileSize = FacetOverviewHeight.S;
                    oFacet.addStyleClass("sapFactsheetUtiEmptyTile");
                    oFacet.setQuantity(0);
                }
                oFacet.setHeightType(jQuery.device.is.phone ? FacetOverviewHeight.Auto : sTileSize);
            };
        }

        // Loop at the further facets and make oData reads to the corresponding services
        for (let i = 0; i < aFacets.length; ++i) {
            if (aFacets[i]["com.sap.vocabularies.UI.v1.Map"]) {
                sNavPath = aFacets[i].Target.AnnotationPath;
                sNavPath = sNavPath.substring(0, sNavPath.lastIndexOf("@") - 1);
                sCardinality = "1";
                sNavType = sEntityType;
                if (sNavPath) {
                    sNavType = getNavTypeForNavPath(sNavPath, sEntityType, oMetadata);
                    sCardinality = getAssociationMultiplicity(sEntitySet, sNavPath, oMetadata);
                }
                sHeight = "100%";
                if (jQuery.device.is.phone) {
                    sHeight = "150px";
                }
                oGeoContent = new VBI({
                    width: "100%",
                    height: sHeight,
                    plugin: false,
                    config: null
                });
                oFacet = new FacetOverview({
                    title: aFacets[i].Label.String.trim(),
                    heightType: jQuery.device.is.phone ? FacetOverviewHeight.Auto : FacetOverviewHeight.L,
                    content: oGeoContent
                });
                // Workaround: no Link if no authority
                aAllFacets.push(oFacet);
                aAllFacets[aAllFacets.length - 1].bLoaded = false;
                aAllFacets[aAllFacets.length - 1].bProcessed = false;
                aAllFacets[aAllFacets.length - 1].bIsTable = false;
                // Workaround: no Link if no authority
                functionParameters = {
                    cardinality: sCardinality,
                    navigationPath: sNavPath,
                    facet: oFacet,
                    facetContent: aFacets[i],
                    navigationType: sNavType,
                    metadata: oMetadata,
                    bindingPath: sBindingPath,
                    entitySet: sEntitySet
                };
                if (sCardinality === "*") {
                    parameters = ["$inlinecount=allpages", "$top=1000"];
                } else {
                    parameters = [];
                }
                oModel.read(`${sBindingPath}/${sNavPath}`, "", parameters, true, oDataReadCallbackGeo(functionParameters));
                oTI.addFacet(oFacet);
            } else if (aFacets[i].Target) {
                sNavPath = aFacets[i].Target.AnnotationPath;
                sNavPath = sNavPath.substring(0, sNavPath.lastIndexOf("@") - 1);
                sTerm = aFacets[i].Target.AnnotationPath.substring(aFacets[i].Target.AnnotationPath.lastIndexOf("@") + 1);
                if (sNavPath) {
                    sNavType = getNavTypeForNavPath(sNavPath, sEntityType, oMetadata);
                    oFacet = new FacetOverview({
                        title: aFacets[i].Label.String.trim(),
                        heightType: jQuery.device.is.phone ? FacetOverviewHeight.Auto : FacetOverviewHeight.M
                    });
                    sCardinality = getAssociationMultiplicity(sEntitySet, sNavPath, oMetadata);
                    if (sCardinality !== 0) {
                        functionParameters = {
                            cardinality: sCardinality,
                            navigationPath: sNavPath,
                            facet: oFacet,
                            facetContent: aFacets[i],
                            navigationType: sNavType,
                            metadata: oMetadata,
                            bindingPath: sBindingPath,
                            entitySet: sEntitySet
                        };
                        if (aFacets[i]["com.sap.vocabularies.UI.v1.Gallery"]) {
                            if (sCardinality === "*") {
                                parameters = ["$inlinecount=allpages"];
                            } else {
                                parameters = [];
                            }
                            oModel.read(`${sBindingPath}/${sNavPath}`, "", parameters, true, oDataReadCallbackMedia(functionParameters));
                        } else {
                            // Workaround: no Link if no authority
                            aAllFacets.push(oFacet);
                            aAllFacets[aAllFacets.length - 1].bLoaded = false;
                            aAllFacets[aAllFacets.length - 1].bProcessed = false;
                            aAllFacets[aAllFacets.length - 1].bIsTable = false;
                            // Workaround: no Link if no authority
                            if (sCardinality === "*") {
                                parameters = ["$inlinecount=allpages", "$top=3"];
                            } else {
                                parameters = [];
                            }
                            oModel.read(`${sBindingPath}/${sNavPath}`, "", parameters, true, oDataReadCallback(functionParameters), oDataReadCallbackError(functionParameters));
                        }
                        oTI.addFacet(oFacet);
                    }
                } else if (sTerm === "com.sap.vocabularies.UI.v1.Contacts") {
                    oFacet = new FacetOverview({
                        title: aFacets[i].Label.String.trim(),
                        heightType: jQuery.device.is.phone ? FacetOverviewHeight.Auto : FacetOverviewHeight.M
                    });
                    oTI.data("contactFacetId", oFacet.sId);
                    functionParameters = { facet: oFacet };
                    oModel.clearBatch();
                    for (let j = 0; j < oMapping[sEntityType][sTerm].length; ++j) {
                        sNavPath = oMapping[sEntityType][sTerm][j].AnnotationPath;
                        sNavPath = sNavPath.substring(0, sNavPath.lastIndexOf("@") - 1);
                        if (sNavPath !== "") {
                            sCardinality = getAssociationMultiplicity(sEntitySet, sNavPath, oMetadata);
                            if (sCardinality === "*") {
                                sBatchPath = `${sBindingPath}/${sNavPath}?$top=4&$inlinecount=allpages`;
                            } else {
                                sBatchPath = `${sBindingPath}/${sNavPath}`;
                            }
                        } else {
                            sBatchPath = sBindingPath;
                        }
                        aOperations.push(oModel.createBatchOperation(sBatchPath, "GET"));
                    }
                    oModel.addBatchReadOperations(aOperations);
                    oModel.submitBatch(oDataReadCallbackContacts(functionParameters));
                    oTI.addFacet(oFacet);
                }
            }
        }

        // Footer area
        const oAddBookmarkButton = new AddBookmarkButton();
        function thingInspectorBindingChanged () {
            const oBusinessParameters = {};
            let key;
            let val;
            let sTerm;
            let aTerm;
            let oParaValue;
            let sJamDiscussId;
            let sKey;
            oAddBookmarkButton.setAppData({ title: oTI.getTitle(), subtitle: `${oTI.getName()} - ${oTI.getDescription()}` });
            oAddBookmarkButton.setEnabled(true);
            const oURLParsing = sap.ushell.Container.getService("URLParsing");
            const sShellHash = oURLParsing.getShellHash(window.location.href);
            const oShellHash = oURLParsing.parseShellHash(sShellHash);
            const sSemanticObject = oShellHash.semanticObject;
            oTransactionSheet = new LinkActionSheet({
                showCancelButton: true,
                placement: PlacementType.Top
            });
            sBusinessParams = getEntityKeyFromUri(sUri, oModel);
            const aBusinessParams = sBusinessParams.split(",");
            for (let i = 0; i < aBusinessParams.length; ++i) {
                aBusinessParams[i] = aBusinessParams[i].replace("='", "=", "g");
                if (aBusinessParams[i].lastIndexOf("'") === aBusinessParams[i].length - 1) {
                    aBusinessParams[i] = aBusinessParams[i].slice(0, -1);
                }
            }
            for (sTerm in oMapping[sEntityType]) {
                if (oMapping[sEntityType].hasOwnProperty(sTerm)) {
                    if (sTerm.indexOf("com.sap.vocabularies.Common.v1.SecondaryKey") === 0) {
                        aTerm = oMapping[sEntityType][sTerm];
                        for (let i = 0; i < aTerm.length; ++i) {
                            oParaValue = this.getBoundContext().getProperty(aTerm[i].PropertyPath);
                            if (oParaValue) {
                                aBusinessParams.push(`${aTerm[i].PropertyPath}=${oParaValue}`);
                            }
                        }
                    }
                }
            }
            for (let i = 0; i < aBusinessParams.length; ++i) {
                key = aBusinessParams[i].substr(0, aBusinessParams[i].indexOf("="));
                val = aBusinessParams[i].substr(aBusinessParams[i].indexOf("=") + 1, aBusinessParams[i].length);
                oBusinessParameters[decodeURIComponent(key)] = decodeURIComponent(val);
            }
            oLinks = sap.ushell.Container.getService("CrossApplicationNavigation").getSemanticObjectLinks(sSemanticObject, oBusinessParameters);
            oLinks.done((aLinks) => {
                let sIntent;
                let sLink;
                for (let i = 0; i < aLinks.length; ++i) {
                    sLink = aLinks[i].intent;
                    if (sLink.indexOf(FACTSHEET) < 0 &&
                        sLink.indexOf("-analyzeKPIDetails~") < 0 &&
                        sLink.indexOf("-analyzeSBKPIDetails~") < 0 &&
                        sLink.indexOf("-NavigateToMaintainCusProj~") < 0 &&
                        sLink.indexOf("CostCenter-manageCostCenter~") < 0 &&
                        sLink.indexOf("AccountingDocument-analyzeDocumentJournal~") < 0 &&
                        sLink.indexOf("AccountingDocument-analyzeGLLineItem~") < 0 &&
                        sLink.indexOf("ControllingDocument-analyzeCostCenters~") < 0 &&
                        sLink.indexOf("ControllingDocument-analyzeInternalOrders~") < 0 &&
                        sLink.indexOf("ControllingDocument-analyzeMarketSegment~") < 0 &&
                        sLink.indexOf("ControllingDocument-analyzeProfitCentersActuals~") < 0 &&
                        sLink.indexOf("ControllingDocument-analyzeProfitLoss~") < 0 &&
                        sLink.indexOf("ControllingDocument-analyzeProjectsActuals~") < 0 &&
                        sLink.indexOf("PurchaseOrder-create~") < 0) {
                        sIntent = sap.ushell.Container.getService("CrossApplicationNavigation").hrefForExternal({ target: { shellHash: sLink } });
                        oTransactionSheet.addItem(new Link({ text: aLinks[i].text, href: sIntent }));
                        oTI.setTransactionsVisible(true);
                    }
                }
            });
            oTI.attachTransactionsButtonPress((oEvent) => {
                oTransactionSheet.openBy(oEvent.getParameter("caller"));
            });
            this.detachChange(thingInspectorBindingChanged);
            // Set the browser Tab Name as Object Type: Object Name (Object Description) e.g. "Article: Nutella (AAUFEA000100001)"
            AppConfiguration.setWindowTitle(`${oTI.getTitle().trim()}: ${oTI.getName().trim()} (${oTI.getDescription().trim()})`);

            oTI.setActionsVisible(true);
            oEmailBtn = new Button({
                text: oSapSuiteRb.getText("UNIFIEDTHINGINSPECTOR_FOOTER_BUTTON_EMAIL_LINK"),
                icon: "sap-icon://email",
                press: function (/* oE */) {
                    URLHelper.triggerEmail("", oTI.getName(), window.location.href);
                }
            });
            oActionSheet = new ActionSheet({ placement: PlacementType.Top });
            sJamDiscussId = sUri.substr(0, sUri.lastIndexOf("/") + 1);
            for (const o in oModel.oData) {
                if (oModel.oData.hasOwnProperty(o)) {
                    sJamDiscussId = sJamDiscussId + o;
                    sKey = o.substring(o.indexOf("(") + 1, o.indexOf(")"));
                    break;
                }
            }
            oActionSheet.addButton(new JamDiscussButton({
                jamData: {
                    businessObject: {
                        appContext: "CB",
                        odataServicePath: sUri.substr(0, sUri.lastIndexOf("/") + 1),
                        collection: sEntitySet,
                        key: sKey,
                        name: oTI.getTitle(),
                        ui_url: window.location.href
                    }
                }
            }));
            oActionSheet.addButton(new JamShareButton({
                jamData: {
                    object: {
                        id: window.location.href,
                        display: new Text({ text: oTI.getTitle() }),
                        share: ""
                    },
                    externalObject: {
                        appContext: "CB",
                        odataServicePath: sUri.substr(0, sUri.lastIndexOf("/") + 1),
                        collection: sEntitySet,
                        key: sKey,
                        name: oTI.getTitle()
                    }
                }
            }));
            oActionSheet.addButton(oAddBookmarkButton);
            oActionSheet.addButton(oEmailBtn);
            oTI.attachActionsButtonPress((oEvent) => {
                oActionSheet.openBy(oEvent.getParameter("caller"));
            });
            // Workaround: no Link if no authority
            aAllFacets[0].bLoaded = true;
            aAllFacets[0].bProcessed = false;
            checkLinks(0);
            // Workaround: no Link if no authority
        }

        oTI.getElementBinding().attachChange(thingInspectorBindingChanged);

        oTI.attachBackAction((/* oEvent */) => {
            history.back();
        });
        oTI.addDelegate({
            onAfterRendering: function () {
                oTI._adjustFacetLayout();
            }
        });
        return oTI;
    }

    return function (sUri, sAnnotationUri) {
        try {
            oTI = thingInspectorFactory(sUri, sAnnotationUri, new UnifiedThingInspector({ configurationVisible: false }));
        } catch (oError) {
            throw oError;
        }
        return oTI;
    };
}, true /* bExport */);

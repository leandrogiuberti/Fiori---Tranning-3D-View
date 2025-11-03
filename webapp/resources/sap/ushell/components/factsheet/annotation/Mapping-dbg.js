// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview This file contains an annotation parser for factsheets.
 * @deprecated
 */
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ui/Device"
], (
    jQuery,
    Device
) => {
    "use strict";

    /* global ActiveXObject */

    const Mapping = {};
    Mapping.initialized = [];

    Mapping.parse = function (oMetadata, sAnnotationUri) {
        let xPath = {};
        const oAlias = {};
        const oSchema = {};
        const oAnnotations = {};
        const mappingList = {};
        let sAnnoNameSpace = "";
        let i;
        let j;
        let xmlDoc;
        let sAlias;
        let schemaNode;
        let refNode;
        let aliasNode;
        let aliasNodes;
        let annoNode;
        let termNode;
        let oTerms;
        let nodeIndex;
        let sTermType;
        let annotationNode;
        let annotationTarget;
        let annotationNamespace;
        let annotation;
        let propertyAnnotation;
        let propertyAnnotationNodes;
        let nodeIndexValue;
        let propertyAnnotationNode;
        let sTermValue;
        let targetAnnotation;
        let nodeIndexAnnotation;
        let annotationQualifier;
        let annotationTerm;
        let valueAnnotation;
        let expandNode;
        let expandNodes;
        let pathValues;
        let path;
        let expandNodesApplFunc;

        if (Device.browser.internet_explorer) {
            xPath = {
                setNameSpace: function (outNode) {
                    outNode.setProperty("SelectionNamespaces", "xmlns:edmx=\"http://docs.oasis-open.org/odata/ns/edmx\" xmlns:d=\"http://docs.oasis-open.org/odata/ns/edm\"");
                    outNode.setProperty("SelectionLanguage", "XPath");
                    return outNode;
                },
                selectNodes: function (outNode, xPath, inNode) {
                    return inNode.selectNodes(xPath);
                },
                nextNode: function (node) {
                    return node.nextNode();
                },
                getNodeText: function (node) {
                    return node.text;
                }
            };
        } else { // Chrome, Firefox, Opera, etc.
            xPath = {
                setNameSpace: function (outNode) { return outNode; },
                nsResolver: function (prefix) {
                    const ns = { edmx: "http://docs.oasis-open.org/odata/ns/edmx", d: "http://docs.oasis-open.org/odata/ns/edm" };
                    return ns[prefix] || null;
                },
                selectNodes: function (outNode, sPath, inNode) {
                    const xmlNodes = outNode.evaluate(sPath, inNode, this.nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                    xmlNodes.length = xmlNodes.snapshotLength;
                    return xmlNodes;
                },
                nextNode: function (node, item) { return node.snapshotItem(item); },
                getNodeText: function (node) { return node.textContent; }
            };
        }

        function getHttpResponseXML (uri) {
            let oXHRResponse;
            if (Device.browser.internet_explorer) {
                oXHRResponse = new ActiveXObject("Microsoft.XMLHTTP");
                oXHRResponse.open("GET", uri, false);
                oXHRResponse.send(null);
                return oXHRResponse.responseXML;
            }
            oXHRResponse = jQuery.sap.sjax({ url: uri, dataType: "xml" });
            if (oXHRResponse.success) {
                return oXHRResponse.data;
            }
        }

        function getAllPropertiesMetadata (oMetadata) {
            let oMetadataSchema = {}; const oPropertyTypes = {}; const oPropertyExtensions = {}; let bPropertyExtensions = false;
            let i; let sNamespace; let aEntityTypes; let aComplexTypes; let oEntityType = {}; let j; let oProperties = {}; let oExtensions = {};
            let bExtensions = false; let oProperty; let l; let k; let oComplexTypeProp; let sPropertyName; let sType; let oPropExtension; let p;
            let oReturn;
            for (i = oMetadata.dataServices.schema.length - 1; i >= 0; i -= 1) {
                oMetadataSchema = oMetadata.dataServices.schema[i];
                if (oMetadataSchema.entityType) {
                    sNamespace = oMetadataSchema.namespace;
                    aEntityTypes = oMetadataSchema.entityType;
                    aComplexTypes = oMetadataSchema.complexType;
                    for (j in aEntityTypes) {
                        if (aEntityTypes.hasOwnProperty(j)) {
                            oEntityType = aEntityTypes[j];
                            oExtensions = {};
                            if (oEntityType.hasStream && oEntityType.hasStream === "true") {
                                continue;
                            }
                            oProperties = {};
                            for (k in oEntityType.property) {
                                oProperty = oEntityType.property[k];
                                if (oProperty.type.substring(0, sNamespace.length) === sNamespace) {
                                    for (l in aComplexTypes) {
                                        if (aComplexTypes[l].name === oProperty.type.substring(sNamespace.length + 1)) {
                                            for (k in aComplexTypes[l].property) {
                                                oComplexTypeProp = aComplexTypes[l].property[k];
                                                oProperties[`${aComplexTypes[l].name}/${oComplexTypeProp.name}`] = oComplexTypeProp.type;
                                            }
                                        }
                                    }
                                } else {
                                    sPropertyName = oProperty.name;
                                    sType = oProperty.type;
                                    for (p in oProperty.extensions) {
                                        oPropExtension = oProperty.extensions[p];
                                        if ((oPropExtension.name === "display-format") && (oPropExtension.value === "Date")) {
                                            sType = "Edm.Date";
                                        } else {
                                            bExtensions = true;
                                            if (!oExtensions[sPropertyName]) {
                                                oExtensions[sPropertyName] = {};
                                            }
                                            if (oPropExtension.namespace && !oExtensions[sPropertyName][oPropExtension.namespace]) {
                                                oExtensions[sPropertyName][oPropExtension.namespace] = {};
                                            }
                                            oExtensions[sPropertyName][oPropExtension.namespace][oPropExtension.name] = oPropExtension.value;
                                        }
                                    }
                                    oProperties[sPropertyName] = sType;
                                }
                            }
                            if (!oPropertyTypes[`${sNamespace}.${oEntityType.name}`]) {
                                oPropertyTypes[`${sNamespace}.${oEntityType.name}`] = {};
                            }
                            oPropertyTypes[`${sNamespace}.${oEntityType.name}`] = oProperties;
                            if (bExtensions) {
                                if (!oPropertyExtensions[`${sNamespace}.${oEntityType.name}`]) {
                                    bPropertyExtensions = true;
                                }
                                oPropertyExtensions[`${sNamespace}.${oEntityType.name}`] = {};
                                oPropertyExtensions[`${sNamespace}.${oEntityType.name}`] = oExtensions;
                            }
                        }
                    }
                }
            }
            if (bPropertyExtensions) {
                oReturn = { types: oPropertyTypes, extensions: oPropertyExtensions };
            } else {
                oReturn = { types: oPropertyTypes };
            }
            return oReturn;
        }

        function getEdmType (sPath, oProperties, sTarget, oSchema) {
            let pIndex;
            if ((sPath.charAt(0) === "@") && (sPath.indexOf(oSchema.Alias) === 1)) {
                sPath = sPath.slice(oSchema.Alias.length + 2);
            }
            if (sPath.indexOf("/") >= 0) {
                if (oProperties[sPath.slice(0, sPath.indexOf("/"))]) {
                    sTarget = sPath.slice(0, sPath.indexOf("/"));
                    sPath = sPath.slice(sPath.indexOf("/") + 1);
                }
            }
            for (pIndex in oProperties[sTarget]) {
                if (oProperties[sTarget].hasOwnProperty(pIndex)) {
                    if (sPath === pIndex) {
                        return oProperties[sTarget][pIndex];
                    }
                }
            }
        }

        function setEdmTypes (aPropertyValues, oProperties, sTarget, oSchema) {
            let pValueIndex; let oPropertyValue; let sEdmType = "";
            for (pValueIndex in aPropertyValues) {
                if (aPropertyValues.hasOwnProperty(pValueIndex)) {
                    if (aPropertyValues[pValueIndex]) {
                        oPropertyValue = aPropertyValues[pValueIndex];
                        if (oPropertyValue.Value && oPropertyValue.Value.Path) {
                            sEdmType = getEdmType(oPropertyValue.Value.Path, oProperties, sTarget, oSchema);
                            if (sEdmType) {
                                aPropertyValues[pValueIndex].EdmType = sEdmType;
                            }
                            continue;
                        }
                        if (oPropertyValue.Path) {
                            sEdmType = getEdmType(oPropertyValue.Path, oProperties, sTarget, oSchema);
                            if (sEdmType) {
                                aPropertyValues[pValueIndex].EdmType = sEdmType;
                            }
                            continue;
                        }
                        if (oPropertyValue.Facets) {
                            aPropertyValues[pValueIndex].Facets = setEdmTypes(oPropertyValue.Facets, oProperties, sTarget, oSchema);
                            continue;
                        }
                        if (oPropertyValue.Data) {
                            aPropertyValues[pValueIndex].Data = setEdmTypes(oPropertyValue.Data, oProperties, sTarget, oSchema);
                            continue;
                        }
                        if (pValueIndex === "Data") {
                            aPropertyValues.Data = setEdmTypes(oPropertyValue, oProperties, sTarget, oSchema);
                            continue;
                        }
                        if (oPropertyValue.Value && oPropertyValue.Value.Apply) {
                            aPropertyValues[pValueIndex].Value.Apply.Parameters = setEdmTypes(oPropertyValue.Value.Apply.Parameters, oProperties, sTarget, oSchema);
                            continue;
                        }
                        if (oPropertyValue.Value && oPropertyValue.Type && (oPropertyValue.Type === "Path")) {
                            sEdmType = getEdmType(oPropertyValue.Value, oProperties, sTarget, oSchema);
                            if (sEdmType) {
                                aPropertyValues[pValueIndex].EdmType = sEdmType;
                            }
                        }
                    }
                }
            }
            return aPropertyValues;
        }

        function replaceWithAlias (sValue) {
            for (sAlias in oAlias) {
                if (oAlias.hasOwnProperty(sAlias)) {
                    if (sValue.indexOf(`${sAlias}.`) >= 0) {
                        sValue = sValue.replace(`${sAlias}.`, `${oAlias[sAlias]}.`);
                        return sValue;
                    }
                }
            }
            return sValue;
        }

        function getPropertyValueAttributes (documentNode) {
            let attrName = ""; let attrValue = ""; let i; const propertyValueAttributes = {};
            for (i = 0; i < documentNode.attributes.length; i += 1) {
                if ((documentNode.attributes[i].name !== "Property") && (documentNode.attributes[i].name !== "Term")) {
                    attrName = documentNode.attributes[i].name;
                    attrValue = documentNode.attributes[i].value;
                }
            }
            if (attrName.length > 0) {
                propertyValueAttributes[attrName] = replaceWithAlias(attrValue);
            }
            return propertyValueAttributes;
        }

        function getApplyFunctions (xmlDoc, applyNode) {
            const apply = {};
            let paraNode = null;
            const parameters = [];
            let i;
            const parameterNodes = xPath.selectNodes(xmlDoc, "./d:*", applyNode);
            for (i = 0; i < parameterNodes.length; i += 1) {
                paraNode = xPath.nextNode(parameterNodes, i);
                switch (paraNode.nodeName) {
                    case "Apply":
                        parameters.push({ Type: "Apply", Value: getApplyFunctions(xmlDoc, paraNode) });
                        break;
                    case "LabeledElement":
                        // eslint-disable-next-line no-use-before-define
                        parameters.push({ Name: paraNode.getAttribute("Name"), Value: getSimpleNodeValue(xmlDoc, paraNode) });
                        break;
                    default:
                        parameters.push({ Type: paraNode.nodeName, Value: xPath.getNodeText(paraNode) });
                        break;
                }
            }
            apply.Name = applyNode.getAttribute("Function");
            apply.Parameters = parameters;
            return apply;
        }

        function getSimpleNodeValue (xmlDoc, documentNode) {
            const oValue = {}; let stringValueNodes; let stringValueNode; let pathValueNodes; let pathValueNode; let applyValueNodes; let applyValueNode;
            if (documentNode.hasChildNodes()) {
                stringValueNodes = xPath.selectNodes(xmlDoc, "./d:String", documentNode);
                if (stringValueNodes.length > 0) {
                    stringValueNode = xPath.nextNode(stringValueNodes, 0);
                    oValue.String = xPath.getNodeText(stringValueNode);
                } else {
                    pathValueNodes = xPath.selectNodes(xmlDoc, "./d:Path", documentNode);
                    if (pathValueNodes.length > 0) {
                        pathValueNode = xPath.nextNode(pathValueNodes, 0);
                        oValue.Path = xPath.getNodeText(pathValueNode);
                    } else {
                        applyValueNodes = xPath.selectNodes(xmlDoc, "./d:Apply", documentNode);
                        if (applyValueNodes.length > 0) {
                            applyValueNode = xPath.nextNode(applyValueNodes, 0);
                            oValue.Apply = getApplyFunctions(xmlDoc, applyValueNode);
                        }
                    }
                }
            }
            return oValue;
        }

        function getPropertyValue (xmlDoc, documentNode, target) {
            let propertyValue = {}; let recordNodes; let recordNodeCnt; let nodeIndex; let recordNode; let propertyValues; let urlValueNodes; let urlValueNode;
            let pathNode; let oPath = {}; let annotationNodes; let annotationNode; let nodeIndexValue; let termValue; let collectionNodes;
            if (documentNode.hasChildNodes()) {
                recordNodes = xPath.selectNodes(xmlDoc, "./d:Record | ./d:Collection/d:Record | ./d:Collection/d:If/d:Record", documentNode);
                if (recordNodes.length) {
                    recordNodeCnt = 0;
                    for (nodeIndex = 0; nodeIndex < recordNodes.length; nodeIndex += 1) {
                        recordNode = xPath.nextNode(recordNodes, nodeIndex);
                        // eslint-disable-next-line no-use-before-define
                        propertyValues = getPropertyValues(xmlDoc, recordNode, target);
                        if (recordNode.getAttribute("Type")) {
                            propertyValues.RecordType = replaceWithAlias(recordNode.getAttribute("Type"));
                        }
                        if (recordNodeCnt === 0) {
                            if (recordNode.nextElementSibling || (recordNode.parentNode.nodeName === "Collection") || (recordNode.parentNode.nodeName === "If")) {
                                propertyValue = [];
                                propertyValue.push(propertyValues);
                            } else {
                                propertyValue = propertyValues;
                            }
                        } else {
                            propertyValue.push(propertyValues);
                        }
                        recordNodeCnt += 1;
                    }
                } else {
                    urlValueNodes = xPath.selectNodes(xmlDoc, "./d:UrlRef", documentNode);
                    if (urlValueNodes.length > 0) {
                        for (nodeIndex = 0; nodeIndex < urlValueNodes.length; nodeIndex += 1) {
                            urlValueNode = xPath.nextNode(urlValueNodes, nodeIndex);
                            propertyValue.UrlRef = getSimpleNodeValue(xmlDoc, urlValueNode);
                        }
                    } else {
                        urlValueNodes = xPath.selectNodes(xmlDoc, "./d:Url", documentNode);
                        if (urlValueNodes.length > 0) {
                            for (nodeIndex = 0; nodeIndex < urlValueNodes.length; nodeIndex += 1) {
                                urlValueNode = xPath.nextNode(urlValueNodes, nodeIndex);
                                propertyValue.Url = getSimpleNodeValue(xmlDoc, urlValueNode);
                            }
                        } else {
                            collectionNodes = xPath.selectNodes(xmlDoc, "./d:Collection/d:AnnotationPath | ./d:Collection/d:PropertyPath", documentNode);
                            if (collectionNodes.length > 0) {
                                propertyValue = [];
                                for (nodeIndex = 0; nodeIndex < collectionNodes.length; nodeIndex += 1) {
                                    pathNode = xPath.nextNode(collectionNodes, nodeIndex);
                                    oPath = {};
                                    oPath[pathNode.nodeName] = xPath.getNodeText(pathNode);
                                    propertyValue.push(oPath);
                                }
                            } else {
                                propertyValue = getPropertyValueAttributes(documentNode);
                                annotationNodes = xPath.selectNodes(xmlDoc, "./d:Annotation", documentNode);
                                annotationNode = {};
                                for (nodeIndexValue = 0; nodeIndexValue < annotationNodes.length; nodeIndexValue += 1) {
                                    annotationNode = xPath.nextNode(annotationNodes, nodeIndexValue);
                                    if (annotationNode.hasChildNodes() === false) {
                                        termValue = replaceWithAlias(annotationNode.getAttribute("Term"));
                                        propertyValue[termValue] = getPropertyValueAttributes(annotationNode);
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                propertyValue = getPropertyValueAttributes(documentNode);
            }
            return propertyValue;
        }

        function getPropertyValues (xmlDoc, documentNode, target) {
            let properties = {};
            let annotationNode = {};
            let nodeIndexValue;
            let termValue;
            let nodeIndex;
            let propertyValueNode;
            let propertyName;
            let applyNodes;
            let applyNode;
            let applyNodeIndex;
            const annotationNodes = xPath.selectNodes(xmlDoc, "./d:Annotation", documentNode);
            for (nodeIndexValue = 0; nodeIndexValue < annotationNodes.length; nodeIndexValue += 1) {
                annotationNode = xPath.nextNode(annotationNodes, nodeIndexValue);
                if (annotationNode.hasChildNodes() === false) {
                    termValue = replaceWithAlias(annotationNode.getAttribute("Term"));
                    properties[termValue] = getPropertyValueAttributes(annotationNode);
                }
            }
            const propertyValueNodes = xPath.selectNodes(xmlDoc, "./d:PropertyValue", documentNode);
            if (propertyValueNodes.length > 0) {
                for (nodeIndex = 0; nodeIndex < propertyValueNodes.length; nodeIndex += 1) {
                    propertyValueNode = xPath.nextNode(propertyValueNodes, nodeIndex);
                    propertyName = propertyValueNode.getAttribute("Property");
                    properties[propertyName] = getPropertyValue(xmlDoc, propertyValueNode, target);
                    applyNodes = xPath.selectNodes(xmlDoc, "./d:Apply", propertyValueNode);
                    applyNode = null;
                    for (applyNodeIndex = 0; applyNodeIndex < applyNodes.length; applyNodeIndex += 1) {
                        applyNode = xPath.nextNode(applyNodes, applyNodeIndex);
                        if (applyNode) {
                            properties[propertyName] = {};
                            properties[propertyName].Apply = getApplyFunctions(xmlDoc, applyNode);
                        }
                    }
                }
            } else {
                properties = getPropertyValue(xmlDoc, documentNode, target);
            }
            return properties;
        }

        function isNavProperty (sEntityType, sPathValue/* , metadata */) {
            let oMetadataSchema; let i; let namespace; let aEntityTypes; let j; let k;
            for (i = oMetadata.dataServices.schema.length - 1; i >= 0; i -= 1) {
                oMetadataSchema = oMetadata.dataServices.schema[i];
                if (oMetadataSchema.entityType) {
                    namespace = `${oMetadataSchema.namespace}.`;
                    aEntityTypes = oMetadataSchema.entityType;
                    for (k = aEntityTypes.length - 1; k >= 0; k -= 1) {
                        if (namespace + aEntityTypes[k].name === sEntityType && aEntityTypes[k].navigationProperty) {
                            for (j = 0; j < aEntityTypes[k].navigationProperty.length; j += 1) {
                                if (aEntityTypes[k].navigationProperty[j].name === sPathValue) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
            return false;
        }

        if (this.initialized[sAnnotationUri]) {
            return this.initialized[sAnnotationUri];
        }
        // Read Annotation File
        xmlDoc = getHttpResponseXML(sAnnotationUri);
        // Set XPath namespace
        xmlDoc = xPath.setNameSpace(xmlDoc);
        // Schema Alias
        const schemaNodes = xPath.selectNodes(xmlDoc, "//d:Schema", xmlDoc);
        for (i = 0; i < schemaNodes.length; i += 1) {
            schemaNode = xPath.nextNode(schemaNodes, i);
            oSchema.Alias = schemaNode.getAttribute("Alias");
            oSchema.Namespace = schemaNode.getAttribute("Namespace");
        }
        // Alias nodes
        const refNodes = xPath.selectNodes(xmlDoc, "//edmx:Reference", xmlDoc);
        for (i = 0; i < refNodes.length; i += 1) {
            refNode = xPath.nextNode(refNodes, i);
            aliasNodes = xPath.selectNodes(xmlDoc, "./edmx:Include", refNode);
            if (aliasNodes && aliasNodes.length > 0) {
                aliasNode = xPath.nextNode(aliasNodes, 0);
                if (aliasNode.getAttribute("Alias")) {
                    oAlias[aliasNode.getAttribute("Alias")] = aliasNode.getAttribute("Namespace");
                } else {
                    oAlias[aliasNode.getAttribute("Namespace")] = aliasNode.getAttribute("Namespace");
                }
            }
            const annoNodes = xPath.selectNodes(xmlDoc, "./edmx:IncludeAnnotations", refNode);
            if (annoNodes.length > 0) {
                for (j = 0; j < annoNodes.length; j += 1) {
                    annoNode = xPath.nextNode(annoNodes, j);
                    if (annoNode.getAttribute("TargetNamespace")) {
                        sAnnoNameSpace = annoNode.getAttribute("TargetNamespace");
                        if (!oAnnotations[sAnnoNameSpace]) {
                            oAnnotations[sAnnoNameSpace] = {};
                        }
                        oAnnotations[sAnnoNameSpace][annoNode.getAttribute("TermNamespace")] = refNode.getAttribute("Uri");
                    } else {
                        oAnnotations[annoNode.getAttribute("TermNamespace")] = refNode.getAttribute("Uri");
                    }
                }
            }
        }
        if (oAnnotations) {
            mappingList.annotationReferences = oAnnotations;
        }
        mappingList.aliasDefinitions = oAlias;
        // Term nodes
        const termNodes = xPath.selectNodes(xmlDoc, "//d:Term", xmlDoc);
        if (termNodes.length > 0) {
            oTerms = {};
            for (nodeIndex = 0; nodeIndex < termNodes.length; nodeIndex += 1) {
                termNode = xPath.nextNode(termNodes, nodeIndex);
                sTermType = replaceWithAlias(termNode.getAttribute("Type"));
                oTerms[`@${oSchema.Alias}.${termNode.getAttribute("Name")}`] = sTermType;
            }
            mappingList.termDefinitions = oTerms;
        }
        // Metadata information of all properties
        const oMetadataProperties = getAllPropertiesMetadata(oMetadata);
        if (oMetadataProperties.extensions) {
            mappingList.propertyExtensions = oMetadataProperties.extensions;
        }
        // Annotations
        const annotationNodes = xPath.selectNodes(xmlDoc, "//d:Annotations ", xmlDoc);
        for (nodeIndex = 0; nodeIndex < annotationNodes.length; nodeIndex += 1) {
            annotationNode = xPath.nextNode(annotationNodes, nodeIndex);
            if (annotationNode.hasChildNodes() === false) {
                continue;
            }
            annotationTarget = annotationNode.getAttribute("Target");
            annotationNamespace = annotationTarget.split(".")[0];
            if (annotationNamespace && oAlias[annotationNamespace]) {
                annotationTarget = annotationTarget.replace(new RegExp(annotationNamespace, ""), oAlias[annotationNamespace]);
            }
            annotation = annotationTarget;
            propertyAnnotation = null;
            if (annotationTarget.indexOf("/") > 0) {
                annotation = annotationTarget.split("/")[0];
                propertyAnnotation = annotationTarget.replace(`${annotation}/`, "");
            }
            if (!mappingList[annotation]) {
                mappingList[annotation] = {};
            }
            // --- Value annotation of complex types. ---
            if (propertyAnnotation) {
                if (!mappingList.propertyAnnotations) {
                    mappingList.propertyAnnotations = {};
                }
                if (!mappingList.propertyAnnotations[annotation]) {
                    mappingList.propertyAnnotations[annotation] = {};
                }
                mappingList.propertyAnnotations[annotation][propertyAnnotation] = {};
                propertyAnnotationNodes = xPath.selectNodes(xmlDoc, "./d:Annotation", annotationNode);
                for (nodeIndexValue = 0; nodeIndexValue < propertyAnnotationNodes.length; nodeIndexValue += 1) {
                    propertyAnnotationNode = xPath.nextNode(propertyAnnotationNodes, nodeIndexValue);
                    if (propertyAnnotationNode.hasChildNodes() === false) {
                        sTermValue = replaceWithAlias(propertyAnnotationNode.getAttribute("Term"));
                        mappingList.propertyAnnotations[annotation][propertyAnnotation][sTermValue] = getPropertyValueAttributes(propertyAnnotationNode);
                    }
                }
                // --- Annotations ---
            } else {
                targetAnnotation = annotation.replace(oAlias[annotationNamespace], annotationNamespace);
                propertyAnnotationNodes = xPath.selectNodes(xmlDoc, "./d:Annotation", annotationNode);
                for (nodeIndexAnnotation = 0; nodeIndexAnnotation < propertyAnnotationNodes.length; nodeIndexAnnotation += 1) {
                    propertyAnnotationNode = xPath.nextNode(propertyAnnotationNodes, nodeIndexAnnotation);
                    annotationQualifier = propertyAnnotationNode.getAttribute("Qualifier");
                    annotationTerm = replaceWithAlias(propertyAnnotationNode.getAttribute("Term"));
                    if (annotationQualifier) {
                        annotationTerm += `#${annotationQualifier}`;
                    }
                    valueAnnotation = getPropertyValue(xmlDoc, propertyAnnotationNode, targetAnnotation);
                    valueAnnotation = setEdmTypes(valueAnnotation, oMetadataProperties.types, annotation, oSchema);
                    mappingList[annotation][annotationTerm] = valueAnnotation;
                }
                // --- Setup of Expand nodes. ---
                expandNodes = xPath.selectNodes(xmlDoc, `//d:Annotations[contains(@Target, '${targetAnnotation}')]//d:PropertyValue[contains(@Path, '/')]//@Path`, xmlDoc);
                for (i = 0; i < expandNodes.length; i += 1) {
                    expandNode = xPath.nextNode(expandNodes, i);
                    path = expandNode.value;
                    if (mappingList.propertyAnnotations) {
                        if (mappingList.propertyAnnotations[annotation]) {
                            if (mappingList.propertyAnnotations[annotation][path]) {
                                continue;
                            }
                        }
                    }
                    pathValues = path.split("/");
                    if (isNavProperty(annotation, pathValues[0], oMetadata)) {
                        if (!mappingList.expand) {
                            mappingList.expand = {};
                        }
                        if (!mappingList.expand[annotation]) {
                            mappingList.expand[annotation] = {};
                        }
                        mappingList.expand[annotation][pathValues[0]] = pathValues[0];
                    }
                }
                expandNodesApplFunc = xPath.selectNodes(xmlDoc, `//d:Annotations[contains(@Target, '${targetAnnotation}')]//d:Path[contains(., '/')]`, xmlDoc);
                for (i = 0; i < expandNodesApplFunc.length; i += 1) {
                    expandNode = xPath.nextNode(expandNodesApplFunc, i);
                    path = xPath.getNodeText(expandNode);
                    if (mappingList.propertyAnnotations[annotation]) {
                        if (mappingList.propertyAnnotations[annotation][path]) {
                            continue;
                        }
                    }
                    if (!mappingList.expand) {
                        mappingList.expand = {};
                    }
                    if (!mappingList.expand[annotation]) {
                        mappingList.expand[annotation] = {};
                    }
                    pathValues = path.split("/");
                    if (isNavProperty(annotation, pathValues[0], oMetadata)) {
                        if (!mappingList.expand) {
                            mappingList.expand = {};
                        }
                        if (!mappingList.expand[annotation]) {
                            mappingList.expand[annotation] = {};
                        }
                        mappingList.expand[annotation][pathValues[0]] = pathValues[0];
                    }
                }
            }
            this.initialized[sAnnotationUri] = mappingList;
        }
        return mappingList;
    };

    return Mapping;
}, /* bExport= */ true);

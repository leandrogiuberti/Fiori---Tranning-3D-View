/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { AjaxClient as Client } from "../../core/AjaxClient";
import { ServerError, ServerErrorCode } from "../../core/errors";
import { DataSourceType } from "../../sina/DataSourceType";
import { ServerMetadataMap, MetadataParser } from "./MetadataParser";

export class MetadataParserJson extends MetadataParser {
    constructor(provider) {
        super(provider);
    }

    async fireRequest(client: Client, url: string) {
        try {
            const response = await client.getJson(url);
            return response;
        } catch (error) {
            if (error instanceof ServerError && error.code === ServerErrorCode.E101) {
                this.provider.sina?.addError(error);
                return (error as ServerError).response.dataJSON;
            }
            throw error;
        }
    }

    async parseResponse(metaJson): Promise<ServerMetadataMap> {
        // all in one metadata map
        const allInOneMap: ServerMetadataMap = {
            businessObjectMap: new Map(), // entity map with attributes and entityset name as key
            businessObjectList: [], // list of all entities for convenience
            dataSourceMap: new Map(), // datasource map with entityset name as key
            dataSourcesList: [], // list of all datasources for convenience
        };
        const metaData = (metaJson.data && metaJson.data.metadata) || metaJson.data || metaJson;
        const entityContainer = metaData["$EntityContainer"];
        if (typeof entityContainer !== "string" || entityContainer.length < 1) {
            throw "Meta data contains invalid EntityContainer!";
        }
        const aEntityContainer = entityContainer.split(".");
        const schemaNameSpace = aEntityContainer[0];
        const entityContainerName = aEntityContainer[1];

        const schemaObject = metaData[schemaNameSpace];
        const entityContainerObject = schemaObject[entityContainerName];

        const helperMap = this._parseEntityType(
            schemaNameSpace,
            schemaObject,
            entityContainerName,
            entityContainerObject
        );
        this._parseEntityContainer(entityContainerObject, helperMap, allInOneMap);
        return allInOneMap;
    }

    // parse entityset and its attributes from EntityType
    _parseEntityType(schemaNameSpace: string, schemaObject, entityContainerName, entityContainerObject) {
        const helperMap = {};

        for (let entityTypeName in schemaObject) {
            // skip entityContainerObject
            if (entityTypeName === entityContainerName) {
                continue;
            }
            const entityTypeOrigin = schemaObject[entityTypeName];
            if (entityTypeOrigin["@EnterpriseSearch.enabled"] !== true) {
                continue;
            }
            entityTypeName = entityTypeName.substring(0, entityTypeName.length - 4);
            const entityType = {
                schema: schemaNameSpace,
                keys: [],
                attributeMap: {},
                label: entityContainerObject[entityTypeName]["@SAP.Common.Label"] || "",
                labelPlural: entityContainerObject[entityTypeName]["@SAP.Common.Label"] || "",
                annotations: {},
            };
            helperMap[entityTypeName] = entityType;

            let index = 0;
            for (const annoOrAttrName in entityTypeOrigin) {
                const annoOrAttr = entityTypeOrigin[annoOrAttrName];
                if (annoOrAttrName === "$Key") {
                    entityType.keys = annoOrAttr;
                    continue;
                }
                if (annoOrAttrName.startsWith("@")) {
                    this._parseEntityTypeAnnotations(annoOrAttrName, annoOrAttr, entityType);
                    continue;
                }
                this._parseAttribute(annoOrAttrName, annoOrAttr, entityType, index);
                index++;
            }
        }

        return helperMap;
    }

    private _parseEntityTypeAnnotations(annoName, annoValue, entityType) {
        annoName = annoName.substring(1).toUpperCase();
        switch (annoName) {
            case "UI.HEADERINFO.TYPENAME":
                entityType.label = annoValue;
                break;
            case "UI.HEADERINFO.TYPENAMEPLURAL":
                entityType.label = annoValue;
                break;
            case "UI.HEADERINFO.TITLE.TYPE":
                this._setAnnotationValue(entityType.annotations, annoName, annoValue);
                break;
            case "UI.HEADERINFO.TITLE.VALUEQUALIFIER":
                this._setAnnotationValue(entityType.annotations, annoName, annoValue);
                break;
            case "UI.HEADERINFO.TYPEIMAGEURL":
                entityType.icon = annoValue;
                break;
            default:
                this._setAnnotationValue(entityType.annotations, annoName, annoValue);
        }
    }

    private _parseAttribute(attributeName, attributeValue, entityType, index) {
        if (typeof attributeValue !== "object") {
            return;
        }
        // schema of supported annotations is required in order to eliminate this any
        const attribute = {
            labelRaw: attributeName,
            label: null,
            type: "",
            presentationUsage: [],
            isFacet: false,
            isSortable: false,
            supportsTextSearch: false,
            displayOrder: index,
            annotationsAttr: {},
            unknownAnnotation: [],
        } as any;

        entityType.attributeMap[attributeName] = attribute;

        for (const annoOrProp in attributeValue) {
            const annoOrPropValue = attributeValue[annoOrProp];
            if (annoOrProp === "$Type" || annoOrProp === "Type") {
                attribute["type"] = annoOrPropValue;
                continue;
            }
            if (annoOrProp.startsWith("@")) {
                this._parseAttributeAnnotations(annoOrProp, annoOrPropValue, attribute);
            }
        }
    }

    private _parseAttributeAnnotations(annotationName, annotationValue, attribute) {
        annotationName = annotationName.substring(1).toUpperCase();

        if (annotationValue !== undefined) {
            this._normalizeAnnotationValueOfArrayOrObject(annotationValue);
            switch (annotationName) {
                case "SAP.COMMON.LABEL":
                    if (!attribute.label) {
                        attribute.label = annotationValue;
                    }
                    break;
                case "ENTERPRISESEARCH.KEY":
                    attribute.isKey = annotationValue;
                    break;
                case "ENTERPRISESEARCH.PRESENTATIONMODE":
                    attribute.presentationUsage = annotationValue;
                    break;
                case "ENTERPRISESEARCHHANA.ISSORTABLE":
                    attribute.isSortable = annotationValue;
                    break;
                case "ENTERPRISESEARCHHANA.SUPPORTSTEXTSEARCH":
                    attribute.supportsTextSearch = annotationValue;
                    break;
                case "ENTERPRISESEARCH.FILTERINGFACET.DEFAULT":
                    attribute.isFacet = annotationValue;
                    break;
                case "ENTERPRISESEARCH.FILTERINGFACET.DISPLAYPOSITION":
                    attribute.facetPosition = annotationValue;
                    break;
                case "ENTERPRISESEARCH.FILTERINGFACET.ICONURL":
                    attribute.facetIconUrlAttributeName = annotationValue;
                    break;
                case "ENTERPRISESEARCH.FILTERINGATTRIBUTE.DEFAULT":
                    attribute.isFilteringAttribute = annotationValue;
                    break;
                case "ENTERPRISESEARCH.FILTERINGATTRIBUTE.DISPLAYPOSITION":
                    attribute.facetPosition = annotationValue;
                    break;
                case "ENTERPRISESEARCH.FILTERINGATTRIBUTE.ICONURL":
                    attribute.facetIconUrlAttributeName = annotationValue;
                    break;
                case "ENTERPRISESEARCH.DISPLAYORDER":
                    attribute.displayOrder = annotationValue;
                    break;
                default:
                    if (
                        annotationName.startsWith("UI") ||
                        annotationName.startsWith("OBJECTMODEL") ||
                        annotationName.startsWith("SEMANTICS")
                    ) {
                        this._setAnnotationValue(attribute.annotationsAttr, annotationName, annotationValue);
                    } else {
                        attribute.unknownAnnotation.push(annotationName);
                    }
            }
        }
    }

    private _normalizeAnnotationValueOfArrayOrObject(annotationValue) {
        if (Array.isArray(annotationValue)) {
            for (let i = 0; i < annotationValue.length; i++) {
                this._normalizeAnnotationValueOfObject(annotationValue[i]);
            }
        } else this._normalizeAnnotationValueOfObject(annotationValue);
        // system
        return annotationValue;
    }

    private _normalizeAnnotationValueOfObject(annotationValue) {
        if (typeof annotationValue === "object") {
            for (const keyName in annotationValue) {
                const keyNameUpperCase = keyName.toUpperCase();
                annotationValue[keyNameUpperCase] = annotationValue[keyName];
                delete annotationValue[keyName];
            }
        }
        return annotationValue;
    }

    private _getValueFromArrayWithSingleEntry(aArray) {
        if (Array.isArray(aArray) && aArray.length === 1) {
            return aArray[0];
        }
        return aArray;
    }

    // parse datasources from EntityContainer
    _parseEntityContainer(entityContainerObject, helperMap, allInOneMap) {
        for (const entityObject in entityContainerObject) {
            const entitySet = helperMap[entityObject];
            if (entityObject === "$Kind") {
                continue;
            }
            if (entitySet === undefined) {
                throw "EntityType " + entityObject + " has no corresponding meta data!";
            }

            const newDatasource = this.sina.createDataSource({
                id: entityObject,
                label: entitySet.label || entityObject,
                labelPlural: entitySet.labelPlural || entitySet.label || entityObject,
                icon: entitySet.icon || "",
                type: DataSourceType.BusinessObject,
                attributesMetadata: [
                    {
                        id: "dummy",
                    },
                ] as any, // fill with dummy attribute
            });
            newDatasource.annotations = entitySet.annotations;
            allInOneMap.dataSourceMap[newDatasource.id] = newDatasource;
            allInOneMap.dataSourcesList.push(newDatasource);

            entitySet.name = entityObject;
            entitySet.dataSource = newDatasource;
            allInOneMap.businessObjectMap[entityObject] = entitySet;
            allInOneMap.businessObjectList.push(entitySet);
        }
    }
}

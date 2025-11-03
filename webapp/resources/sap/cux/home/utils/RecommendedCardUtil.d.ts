declare module "sap/cux/home/utils/RecommendedCardUtil" {
    import BaseObject from "sap/ui/base/Object";
    import ODataMetaModel, { NavigationProperty, Property } from "sap/ui/model/odata/ODataMetaModel";
    import { IAppInfoData, IAppManifest, ICardManifest, IColumnData, IEntitySet, ILineItem, ILineItemContextValue, ILineItemDetails, IManifestCardData, IPageType, IPresentationVariant, IUIVisualizations, IVariantSetting, IVersionInfo } from "../interface/CardsInterface";
    const COLUMN_LENGTH = 3;
    const ValueState: any;
    interface VariantInfo {
        lineItem?: ILineItem[] | string;
        presentationVariant?: IPresentationVariant;
        qualifierPath?: string;
        PresentationVariant?: IPresentationVariant;
        Visualizations?: IUIVisualizations[];
    }
    interface NonChartDetail {
        firstAvailableKey: string | null;
        sEntitySet: string;
        oVariant: IVariantSetting;
    }
    interface SelectExpand {
        select: string[];
        expand: string[];
    }
    type SelectExpandDetail = {
        select?: string;
        expand?: string;
    };
    type RequestAtleastFieldType = {
        String?: string | undefined;
        PropertyPath?: string | undefined;
    };
    interface ParameterisedEntity {
        entitySetName?: string | null;
        parameters: Array<object | string>;
        navPropertyName: string | null;
    }
    interface ColumnObjectData extends Partial<IColumnData> {
        leadingProperty?: string;
        additionalProperty?: string;
        navigationProperty?: string;
        columnKey?: string;
        [key: string]: unknown;
    }
    interface NavigationPropertiesMap {
        [entitySetName: string]: {
            [navigationPropertyName: string]: NavigationProperty;
        };
    }
    interface ExtendedLineItemContextValue extends ILineItemContextValue {
        Path: string;
        Apply: {
            Name: string;
            Parameters: {
                [key: string]: string;
            }[];
        };
    }
    enum FieldAnnotationsType {
        DataField = "com.sap.vocabularies.UI.v1.DataField",
        Importance = "com.sap.vocabularies.UI.v1.Importance",
        DataFieldWithNavigationPath = "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath",
        DataFieldWithIntentBasedNavigation = "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation",
        DataFieldForIntentBasedNavigation = "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation",
        Chart = "@com.sap.vocabularies.UI.v1.Chart",
        FieldGroup = "@com.sap.vocabularies.UI.v1.FieldGroup",
        DataPoint = "@com.sap.vocabularies.UI.v1.DataPoint",
        Contact = "@com.sap.vocabularies.Communication.v1.Contact",
        DataFieldForAction = "com.sap.vocabularies.UI.v1.DataFieldForAction",
        DataFieldForAnnotation = "com.sap.vocabularies.UI.v1.DataFieldForAnnotation",
        DataFieldWithUrl = "com.sap.vocabularies.UI.v1.DataFieldWithUrl",
        CriticalityRepresentationTypeWithoutIcon = "com.sap.vocabularies.UI.v1.CriticalityRepresentationType/WithoutIcon",
        FieldControlHiddenType = "com.sap.vocabularies.Common.v1.FieldControlType/Hidden"
    }
    enum FieldTypes {
        DataFieldWithNavigationPath = "DataFieldWithNavigationPath",
        DataFieldWithIntentBasedNavigation = "DataFieldWithIntentBasedNavigation",
        DataFieldForIntentBasedNavigation = "DataFieldForIntentBasedNavigation",
        DataFieldForAction = "DataFieldForAction",
        DataFieldForAnnotation = "DataFieldForAnnotation"
    }
    type Attribute = {
        value: string;
        path: string;
        type: string;
    };
    type SelectionProperties = Array<string | {
        PropertyPath?: string;
        String?: string;
    }>;
    export default class RecommendedCardUtil extends BaseObject {
        static Instance: RecommendedCardUtil;
        static getInstance(): RecommendedCardUtil;
        /**
         * @param {object} metaModel - metamodel object
         * @param {object} originalManifest - manifest of original app
         * @param {string} leadingEntitySet - main entitySet of the application as in manifest
         * @returns {object} - returns the lineItem details for the application based on manifest, annotations and metadata
         * @private
         */
        getLineItemDetails(metaModel: ODataMetaModel, originalManifest: IAppManifest, leadingEntitySet: string): ILineItemDetails | undefined;
        /**
         * Finds the first non-smart chart variant from the provided variants.
         *
         * This method iterates through the given variants to identify the first variant that is not a smart chart.
         * It also determines the associated entity set and updates the variant's metadata to indicate whether it is a smart chart.
         *
         * @param {ODataMetaModel} metaModel - The OData meta model containing metadata about entities and annotations.
         * @param {Record<string, IVariantSetting>} oVariants - A record of variants, where each key represents a variant and its associated metadata.
         * @param {string} leadingEntitySet - The name of the leading entity set for the application.
         * @returns {NonChartDetail}
    }
         * An object containing:
         * - `firstAvailableKey`: The key of the first non-smart chart variant, or `null` if none is found.
         * - `sEntitySet`: The entity set associated with the first non-smart chart variant.
         * - `oVariant`: The metadata of the first non-smart chart variant.
         * @private
         */
        private findFirstNonSmartChartVariant;
        /**
         * Validates the responsive table type for a given variant and updates the List Report (LR) settings.
         *
         * @param {ILrSettings} lrSettings - The settings object for the List Report, including table settings and configurations.
         * @param {IVariantSetting} oVariant - The variant object containing table settings and metadata.
         * @param {string | null} firstAvailableKey - The key of the first available variant, used for logging errors.
         * @returns {void}
         * @private
         */
        private validateResponsiveTable;
        /**
         *
         * This method generates the default configuration for line item details, including table settings,
         * responsive table type, and request-at-least fields based on the provided metadata, variant information,
         * and settings.
         *
         * @param {ODataMetaModel} metaModel - The OData meta model containing metadata about entities and annotations.
         * @param {VariantInfo} variantInfo - The variant information containing presentation variant and line item details.
         * @param {ILrSettings} lrSettings - The settings object for the List Report, including table settings and other configurations.
         * @param {string} leadingEntitySet - The name of the leading entity set for the application.
         * @param {ILineItem[] | string | undefined} lineItemDefault - The default line item details, which can be an array of line items, a string, or undefined.
         * @returns {ILineItemDetails} The default line item details object, including quick variant, settings, line item, entity set, and header info.
         * @private
         */
        private createDefaultLineItemDetails;
        /**
         * @param {object} oMetaModel - metamodel object
         * @param {string} entityType - entity type of the application
         * @param {string} qualifier - qualifier of the variant
         * @returns {object} - returns the lineItem, presentationVariant, qualifierPath from the variant for the application based on manifest, annotations and metadata
         * @private
         */
        private getLineItemFromVariant;
        private getAnnotation;
        /**
         * This method determines the presentation variant based on the provided selection presentation variant.
         * If the presentation variant is defined via a `Path`, it resolves the path to retrieve the corresponding object
         * from the OData meta model. If the presentation variant is defined inline (i.e., without a `Path`), it directly
         * returns the inline object.
         *
         * @param {ODataMetaModel} metaModel - The OData meta model containing metadata about entities and annotations.
         * @param {string} entityTypeData - The entity type for which the presentation variant is to be retrieved.
         * @param {IPresentationVariant} selectionPresentationVariant -
         * The selection presentation variant object, which may contain a `Path` or an inline `PresentationVariant`.
         * @returns {IPresentationVariant} The resolved presentation variant object.
         * @private
         */
        private getPresentationVariant;
        /**
         * Retrieves the line item annotation details for a given entity type and presentation variant.
         *
         * This method searches for the `com.sap.vocabularies.UI.v1.LineItem` annotation within the visualizations
         * of the provided presentation variant. If found, it returns the line item details, including the annotation path
         * and qualifier.
         *
         * @param {ODataMetaModel} metaModel - The OData meta model containing metadata about the entity type.
         * @param {string} entityTypeData - The entity type for which the line item annotation is to be retrieved.
         * @param {IPresentationVariant} presentationVariantData - The presentation variant containing visualizations.
         * @returns { IUIVisualizations | IUIVisualizations[] | null}
         * - An object containing the line item details, annotation path, and qualifier if the annotation is found.
         * - An array of UI annotations if applicable.
         * - `null` if no valid line item annotation is found.
         * @private
         */
        private getLineItem;
        /**
         * Extracts relevant column paths for `$select` and `$expand` OData query options.
         *
         * This method processes the provided column definitions to extract paths for the `$select` and `$expand` query options.
         * It ensures that paths are unique and properly formatted for OData requests.
         *
         * @param {Array<Record<string,unknown>>} columns - An array of column definitions.
         * Each column definition may include properties like `leadingProperty`, `additionalProperty`, and `navigationProperty`.
         * @returns {SelectExpand} An object containing two arrays:
         * - `select`: An array of unique paths for the `$select` query option.
         * - `expand`: An array of unique paths for the `$expand` query option.
         * @private
         */
        private _getRelevantColumnPaths;
        /**
         * Extracts and inserts unique paths into the provided array.
         *
         * This method splits the given path string by commas, iterates through the resulting paths,
         * and adds each unique path to the provided array. Duplicate paths are ignored.
         *
         * @param {string} sPath - A comma-separated string of paths to be processed.
         * @param {Set<string>}  - The array to which unique paths will be added.
         * @private
         */
        private extractPathAndInsertToSet;
        /**
         * Expands navigation properties for the given entity set and selected properties.
         *
         * This method processes the provided `selects` array to identify navigation properties
         * that need to be expanded. If a navigation property is found, it is added to the `expands` array.
         *
         * @param {string} entitySetName - The name of the entity set being processed.
         * @param {string[]} selects - An array of selected property paths to be checked for navigation properties.
         * @param {string[]} expands - An array to which navigation properties requiring expansion will be added.
         * @param {ODataMetaModel} metaModel - The OData meta model containing metadata about entities and properties.
         * @private
         */
        private extractAndExpandNavigationProperty;
        private getNavigationProperty;
        private _addNecessaryFields;
        /**
         * Collects the paths for field controls based on the selected properties.
         * This function iterates over the given selection of properties, aSelects, retrieves the corresponding
         * property metadata from the OData model, and if a field control annotation exists for a property,
         * it adds the path of this field control to the provided array of properties.
         * @param {string[]} selects - An array of property names to be checked for field control paths.
         * @param {object} metaModel - The OData meta model instance used to retrieve property metadata.
         * @param {object} entityType - The entity type from the OData model that contains the properties.
         * @param {string[]} aProperties - An array to which the field control paths will be added.
         * @private
         */
        private getFieldControlsPath;
        /**
         * Handling for DataFieldWithNavigationPath and DataFieldWithIntentBasedNavigation
         * @param {object} lineItem - LineItem object
         * @param {object} metaModel - OData metamodel
         * @param {object} entityType - EntityType object
         * @returns {Array} - Array of properties to be selected in case field type is DataFieldWithNavigationPath or DataFieldWithIntentBasedNavigation
         * @private
         */
        private getDataFieldsWithNavigation;
        private getParameters;
        /**
         *
         * @param {Array} aSelects , select parameters
         * @param {SelectionProperties} alwaysSelectField, all the fields that are marked as requestAtLeastFields
         * @returns {Array} aSelects, updated select parameters
         * @private
         */
        private _ensureSelectionProperties;
        /**
         * Handles the mandatory selection fields for the given entity set and properties.
         *
         * @param {object} entitySet - The entity set object.
         * @param {array} aSelects - The array of properties.
         * @returns {boolean} True if the entity set or properties have mandatory fields, false otherwise.
         * @private
         */
        private _handleMandatorySelectionFields;
        private ensureSelectionProperty;
        /**
         * Creates a card manifest for a recommended card.
         *
         * This method generates a new card manifest based on the provided input data, version information, and app manifest.
         * It also processes the columns to set attributes or titles for the card content and handles row navigation suppression if required.
         *
         * @param {IManifestCardData} oInput - The input data for the card, including card title, subtitle, columns, and entity set.
         * @param {IVersionInfo} oVersionInfo - The version information, including the version and build timestamp.
         * @param {IAppManifest} manifest - The original app manifest.
         * @param {boolean} [bSuppressRowNavigation] - Optional flag to suppress row navigation actions in the card content.
         * @returns {ICardManifest} The generated card manifest object.
         * @private
         */
        _createCardManifest(oInput: IManifestCardData, oVersionInfo: IVersionInfo, manifest: IAppManifest, bSuppressRowNavigation?: boolean): ICardManifest;
        /**
         * Get Attribute Value
         *
         * @param {object} attributeData - column object
         * @returns {string} returns attribute value
         * @private
         */
        private _getAttributeValue;
        private createManifestSapApp;
        /**
         * Creates the manifest's SAP card object, sap.card based on the input card details.
         *
         * @param {oIAppManifestbject} manifest - The original manifest object of the application.
         * @param {IManifestCardData} oInput - The input object containing card details.
         * @returns {ISapCard} The SAP card configuration object.
         */
        private createManifestSapCard;
        /**
         * Sets the card actions for the given SAP card.
         *
         * @param {object} sapCard - The SAP card object to set the actions on.
         * @param {string} semObj - The semantic object for the navigation target.
         * @param {string} semanticAction - The semantic action for the navigation target.
         */
        private addCardActions;
        /**
         * Creates the manifest sap card configuration object.
         *
         * @param {string} sServiceUrl - The service URL to be used in the request.
         * @param {string} entitySetName - The name of the entity set.
         * @returns {object} The SAP card configuration object.
         */
        private createManifestSapCardConfig;
        private createSapui5;
        /**
         * Creates the manifest data for an SAP card.
         *
         * @param {string} sServiceUrl - The service URL to be used in the request.
         * @param {string} urlExpand - The URL to expand in the batch request.
         * @returns {IRequestData} The SAP card data object containing the request configuration.
         */
        private createManifestSapCardData;
        /**
         * This function returns card details required for the recommended card manifest
         * based on app manifest and annotations
         * @param {object} manifest - The original app manifest
         * @param {object} oInfo - The object containing details of lineitem, entityset, settings etc
         * @param {object} oParentApp - The parent app object
         * @param {object} oMetaModel - The OData metamodel
         * @returns {object} The card data object with title, subtitle, url, semanticObject, action, id and column details
         * @private
         */
        _getManifestCardData(manifest: IAppManifest, oInfo: ILineItemDetails, oParentApp: IAppInfoData, oMetaModel: ODataMetaModel): IManifestCardData;
        /**
         * This function returns the column detail object for the given column's context
         * @param {string} entitySet - - The entity set name
         * @param {object} oMetaModel -  OData metamodel
         * @param {object} lineItemContext - The line item column context object
         * @returns {object} The column detail containing value, path, importance and type
         * @private
         */
        private _getColumnDetail;
        /**
         * Retrieves the column object details based on the provided property and entity type.
         *
         * @param {object} columnDataObject - The column information object to be populated.
         * @param {object} propertyDetails - The property object containing metadata about the column.
         * @param {object} entityType - The entity type object containing metadata about the entity.
         * @param {object} dataField - The data field object containing the lineitem column context object
         * @returns {object} The populated column information object.
         * @private
         */
        private getColumnObjectDetails;
        /**
         * Build expression for the criticality annotation, kept same as the one used in LROP
         * @param {object} criticalityAnnotation - The criticality annotation object
         * @returns {string} The expression for the criticality color
         * @private
         */
        private buildExpressionForCriticalityColor;
        /**
         * Sets display text format of column
         *
         * @private
         * @param {{EnumMember: string} | undefined} sTextArragement - sTextArragement object
         * @param { ColumnObjectData} columnDataObject - Object containing column details
         * @param {string} sColumnKeyDescription - Description field to include in text value
         * @param {string} sColumnValue - The value to include in Text value
         */
        private _setColumnTextValue;
        private _getRequestAtLeastFields;
        /**
         * Creates a query string with custom parameters for OData requests.
         *
         * This method generates a query string containing `$expand` and `$select` parameters
         * based on the provided input object. The values are URL-encoded to ensure proper formatting.
         *
         * @param {object} mParameters - An object containing the parameters for the query string.
         * @param {string | undefined} mParameters.expand - The value for the `$expand` parameter, if any.
         * @param {string | undefined} mParameters.select - The value for the `$select` parameter, if any.
         * @returns {string} A query string containing the `$expand` and `$select` parameters, joined by `&`.
         * @private
         */
        private createCustomParams;
        /**
         * Retrieves an object from the OData meta model based on the given entity type and path.
         *
         * This method resolves the provided path to an absolute path if it is relative, using the entity type as the base.
         * It then retrieves the corresponding object from the meta model. Any "@" characters in the path are removed
         * to match the meta model's structure.
         *
         * @param {ODataMetaModel} metaModel - The OData meta model containing metadata about entities and annotations.
         * @param {string} entityTypeName - The entity type used as the base for resolving relative paths.
         * @param {string} path - The path to the object in the meta model. Can be relative or absolute.
         * @returns {IPresentationVariant | ILineItem[]} The object retrieved from the meta model, which can be a presentation variant or an array of nested objects.
         * @private
         */
        private getObject;
        /**
         * Check If Page is List Report
         *
         * @param {object} page - page object
         * @returns {boolean} returns boolean
         * @private
         */
        _isListReport(page?: IPageType): boolean;
        /**
         * @param {IPageType[] | PageRecord} pages - pages object from manifest
         * @returns {ILrSettings} - returns the settings object for the ListReport
         */
        private getSettingsForPage;
        /**
         * Determines whether card row navigation should be suppressed for the card
         *
         * @param {IPageType} page - The ListReport page object from the manifest.
         * @returns {boolean} True if card row navigation should be suppressed
         */
        private shouldSuppressCardRowNavigation;
        /**
         * @param {object} metaModel - metamodel object
         * @param {ILrSettings} ILrSettings - settings object from the manifest
         * @param {string} entitySetName - entity set of the application
         * @returns {object} - returns the normalized table settings
         * @private
         */
        private getNormalizedTableSettings;
        /**
         * @param {object} metaModel - metamodel object
         * @param {string} entitySetName - entity set of the application
         * @param {object} tabItem - details of the variant tab
         * @returns {boolean} - returns true if the variant is a smart chart
         */
        private checkIfSmartChart;
        /**
         * function returns true if the passed entityset / properties have mandatory properties
         *
         * @param {EntitySet} entitySetData - Entity set
         * @param {Array} propertiesSet - Additional Properties
         * @returns {boolean} returns boolean
         * @private
         */
        hasMandatoryProperties(entitySetData?: IEntitySet, propertiesSet?: Property[]): boolean;
        /**
         * Check if sEntitySet has association with parameterised entityset and if it has give parametersised entityset parameters
         * @param {object} metaModel OData MetaModel
         * @param {string} entitySetName of the EntitySet which has Parameter Entityset in association.
         * @param {boolean} infoParamsRequired If the full info of parameters is needed or only the name of params is needed.
         * @return {ParameterisedEntity} Contains name of Parameter EntitySet, keys of Parameter EntitySet and Name of Navigation property.
         * @private
         */
        _getParametersisedEntitySetParams(metaModel: ODataMetaModel, entitySetName: string, infoParamsRequired: boolean): ParameterisedEntity;
        /**
         * This function check if a lineitem annotation column is visible or not
         * @param {object} lineItemAnnotations - The column details object
         * @returns {Boolean} The column visibility status {true/false}
         * @private
         */
        private isPropertyHidden;
        /**
         * Creates a P13N  string for a given entity set, property, and line item column.
         *
         * @param {Object} contextSet - The entity set object.
         * @param {Object} contextProp - The property details from metadata.
         * @param {Object} columnDataField - The line item column data field.
         * @param {Object} metaModel - The metadata model object.
         * @returns {string} The P13N string for the specified entity set and property.
         * @private
         */
        private createP13N;
        private processDataFieldWithUrl;
        /**
         * Creates a personalized column key based on the provided data field.
         * @param {Object} oDataField - The data field object containing metadata for generating the column key.
         * @returns {string} The generated column key based on the data field.
         */
        private createP13NColumnKey;
        /**
         * Retrieves the navigation prefix path for a given entity type and value path.
         *
         * @param {object} oMetaModel - The meta model object.
         * @param {object} oContextSet - The context set object containing the entity type.
         * @param {string} sPath - The value path for which the navigation prefix is needed.
         * @returns {string} The navigation prefix path.
         */
        private getNavigationPrefixPath;
        /**
         * Retrieves the navigation prefix for a given property within an entity type.
         * @param {Object} metaModel - The metadata model object.
         * @param {Object} entityTypeData - The entity type object.
         * @param {string} propertyName - The property path for which the navigation prefix is to be determined.
         * @returns {string} The navigation prefix for the specified property.
         */
        private _getNavigationPrefix;
        /**
         * Processes additional properties for a given context property and data field.
         *
         * This method analyzes the provided context property and data field to extract additional properties
         * such as criticality, text annotations, unit annotations, and field control paths. It also determines
         * the type of the property (e.g., date, string) and appends this information to the P13N string.
         *
         * @param {UIAnnotationValue} oContextProp - The context property object containing metadata about the property.
         * @param {ILineItemContext} oDataField - The data field object containing line item metadata.
         * @param {string} sNavigationPath - The navigation path to be prefixed to certain properties.
         * @param {string[]} aAdditionalProperties - An array to which additional property paths will be added.
         * @returns {string} A P13N string containing additional property details such as type and unit.
         * @private
         */
        private processAdditionalProperties;
        /**
         * Determines whether a column is supported for card creation.
         *
         * This method checks conditions to determine if a column is eligible for inclusion in a card,
         * conditions are kept similar to RT cards restrictions in V2 LR.
         *
         * @param {Record<string, string>} columnDataObject - The column data object containing metadata about the column.
         * @param {ILineItemContext} dataFieldDetails - The data field object containing line item metadata.
         * @param {ODataMetaModel} metaModel - The OData meta model containing metadata about entities and properties.
         * @param {IEntitySet} entitySetData - The entity set to which the column belongs.
         * @returns {boolean} `true` if the column is supported for card creation, otherwise `false`.
         * @private
         */
        private isSupportedColumn;
        /**
         * Checks the multiplicity of a data field's association in the OData model.
         *
         * This method verifies whether the association for a given data field has a multiplicity of `*` (many).
         * It traverses the navigation path of the data field to determine the multiplicity of the associated entity.
         *
         * @param {ODataMetaModel} metaModel - The OData meta model containing entity and association metadata.
         * @param {IEntitySet} entitySetData - The entity set to which the data field belongs.
         * @param {ILineItemContext} dataFieldValue - The data field whose association multiplicity is to be checked.
         * @returns {boolean} `true` if the association has a multiplicity of `*`, otherwise `false`.
         * @private
         */
        private checkMultiplicityForDataFieldAssociation;
    }
}
//# sourceMappingURL=RecommendedCardUtil.d.ts.map
/// <reference types="openui5" />
declare module "sap/cards/ap/generator/odata/v2/MetadataAnalyzer" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import type ResourceBundle from "sap/base/i18n/ResourceBundle";
    import type ODataMetaModel from "sap/ui/model/odata/ODataMetaModel";
    import type { EntityType } from "sap/ui/model/odata/ODataMetaModel";
    import type ODataModel from "sap/ui/model/odata/v2/ODataModel";
    import type { RequestQueryParametersV2 } from "sap/cards/ap/generator/helpers/Batch";
    import type { NavigationParameter, Property } from "sap/cards/ap/generator/types/PropertyTypes";
    import { PropertyInfo, PropertyInfoMap } from "sap/cards/ap/generator/odata/ODataTypes";
    const Annotatations: {
        label: string;
        isPotentiallySensitive: string;
        isoCurrency: string;
        unit: string;
    };
    type EntityTypeLabelAnnotation = {
        String?: string;
    };
    interface EntityTypeWithAnnotations extends EntityType {
        "com.sap.vocabularies.Common.v1.Label"?: EntityTypeLabelAnnotation;
    }
    function getNavigationPropertyInfoFromEntity(oModel: ODataModel, entitySet: string): NavigationParameter[];
    function getPropertyInfoFromEntity(model: ODataModel, entitySet: string, withNavigation: boolean, resourceModel?: ResourceBundle): PropertyInfoMap;
    function getEntityTypeFromEntitySet(oMetaModel: ODataMetaModel, entitySet: string): EntityType | undefined;
    function mapProperties(properties?: Property[]): Property[] | undefined;
    function isPropertySensitive(oMetaModel: ODataMetaModel, oEntityType: EntityType, oProperty: any): boolean;
    function mapPropertyInfo(oProperty: any, withNavigation: boolean): PropertyInfo;
    function getLabelForEntitySet(oModel: ODataModel, entitySet: string): string;
    function getPropertyReference(oModel: ODataModel, entitySetName: string): PropertyInfo[];
    function getMetaModelObjectForEntitySet(metaModel: ODataMetaModel, entitySetName: string): RequestQueryParametersV2;
    const getEntityNames: (model: ODataModel) => string[];
}
//# sourceMappingURL=MetadataAnalyzer.d.ts.map
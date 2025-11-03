/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
"use strict";

sap.ui.define(["../../utils/CommonUtils"], function (____utils_CommonUtils) {
  "use strict";

  const checkForDateType = ____utils_CommonUtils["checkForDateType"];
  const Annotatations = {
    label: "com.sap.vocabularies.Common.v1.Label",
    isPotentiallySensitive: "com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive",
    isoCurrency: "Org.OData.Measures.V1.ISOCurrency",
    unit: "Org.OData.Measures.V1.Unit"
  };
  function getNavigationPropertyInfoFromEntity(oModel, entitySet) {
    const oMetaModel = oModel.getMetaModel();
    const oResult = {
      parameters: []
    };
    const oEntityType = getEntityTypeFromEntitySet(oMetaModel, entitySet);
    const aNavigationProperties = oEntityType?.navigationProperty || [];
    aNavigationProperties.forEach(oNavProperty => {
      const navigationEntitySet = oMetaModel.getODataAssociationEnd(oEntityType, oNavProperty.name);
      const navigationEntityType = navigationEntitySet?.type ? oMetaModel.getODataEntityType(navigationEntitySet?.type) : null;
      if (navigationEntityType?.key) {
        const entityProperties = navigationEntityType?.property?.filter(property => property.type !== "Edm.Time");
        if ((entityProperties ?? []).length > 0) {
          const properties = mapProperties(entityProperties);
          const navigationParameter = {
            name: oNavProperty.name,
            properties: properties
          };
          oResult.parameters.push(navigationParameter);
        }
      }
    });
    return oResult.parameters;
  }
  function getPropertyInfoFromEntity(model, entitySet, withNavigation, resourceModel) {
    const metaModel = model.getMetaModel();
    const entityType = getEntityTypeFromEntitySet(metaModel, entitySet);
    let properties = [];
    if (withNavigation) {
      const propertiesWithoutNav = (entityType?.property || []).filter(property => property.type !== "Edm.Time").map(obj => ({
        ...obj,
        category: resourceModel?.getText("CRITICALITY_CONTROL_SELECT_PROP"),
        kind: "Property"
      }));
      const propertiesWithNav = (entityType?.navigationProperty || []).map(obj => ({
        ...obj,
        category: resourceModel?.getText("GENERATOR_CARD_SELECT_NAV_PROP"),
        kind: "NavigationProperty"
      }));
      properties = [...propertiesWithoutNav, ...propertiesWithNav];
    } else {
      properties = entityType?.property || [];
      properties = properties.filter(property => property.type !== "Edm.Time");
      properties.forEach(property => property.kind = "Property");
    }
    return properties.filter(property => !isPropertySensitive(metaModel, entityType, property)).map(property => mapPropertyInfo(property, withNavigation));
  }
  function getEntityTypeFromEntitySet(oMetaModel, entitySet) {
    const entitySetInfo = oMetaModel.getODataEntitySet(entitySet);
    return oMetaModel.getODataEntityType(entitySetInfo?.entityType);
  }
  function mapProperties(properties) {
    return properties?.map(property => ({
      label: property?.["sap:label"] || property?.name,
      type: property.type,
      name: property?.name
    }));
  }
  function isPropertySensitive(oMetaModel, oEntityType, oProperty) {
    const navigationEntitySet = oMetaModel.getODataAssociationEnd(oEntityType, oProperty.name);
    return oProperty[Annotatations.isPotentiallySensitive]?.Bool || navigationEntitySet?.multiplicity === "*";
  }
  function mapPropertyInfo(oProperty, withNavigation) {
    const isDate = checkForDateType(oProperty.type);
    const ISOCurrency = oProperty && oProperty[Annotatations.isoCurrency];
    const unitOfMeasure = oProperty && oProperty[Annotatations.unit];
    let UOM = "";
    if (ISOCurrency) {
      UOM = ISOCurrency?.Path ? ISOCurrency?.Path : ISOCurrency?.String;
    } else if (unitOfMeasure) {
      UOM = unitOfMeasure?.Path ? unitOfMeasure?.Path : unitOfMeasure?.String;
    } else if (oProperty && oProperty["sap:unit"]) {
      UOM = oProperty && oProperty["sap:unit"];
    }
    return {
      label: oProperty["sap:label"] || oProperty?.name,
      type: oProperty.type,
      name: oProperty.name,
      ...(withNavigation && {
        category: oProperty.category
      }),
      UOM,
      isDate,
      kind: oProperty.kind
    };
  }
  function getLabelForEntitySet(oModel, entitySet) {
    const oMetaModel = oModel.getMetaModel();
    const entitySetInfo = oMetaModel.getODataEntitySet(entitySet);
    const entityType = oMetaModel.getODataEntityType(entitySetInfo?.entityType);
    const label = entityType[Annotatations.label]?.String;
    return label || entitySet;
  }
  function getPropertyReference(oModel, entitySetName) {
    const metaModel = oModel.getMetaModel();
    const entitySet = metaModel.getODataEntitySet(entitySetName);
    const entityDefinition = metaModel.getODataEntityType(entitySet.entityType);
    const propertyRef = entityDefinition.key.propertyRef.map(property => property.name);
    const properties = getPropertyInfoFromEntity(oModel, entitySetName, false);
    return properties.filter(property => propertyRef.includes(property?.name));
  }
  function getMetaModelObjectForEntitySet(metaModel, entitySetName) {
    const entitySet = metaModel.getODataEntitySet(entitySetName);
    const entityType = metaModel.getODataEntityType(entitySet.entityType);
    const properties = entityType.property || [];
    const navigationProperties = [];
    entityType.navigationProperty?.forEach(navigationProperty => {
      const propertyName = navigationProperty.name;
      const navigationEntitySet = metaModel.getODataAssociationEnd(entityType, propertyName);
      if (navigationEntitySet !== null) {
        const navigationEntityType = metaModel.getODataEntityType(navigationEntitySet.type);
        const navigationProperty = navigationEntityType.property || [];
        navigationProperties.push({
          name: propertyName,
          properties: navigationProperty
        });
      }
    });
    return {
      properties,
      navigationProperties,
      complexProperties: []
    };
  }
  const getEntityNames = function (model) {
    const metaModel = model.getMetaModel();
    const entityContainer = metaModel.getODataEntityContainer();
    const entitySet = entityContainer?.entitySet || [];
    return entitySet.map(entity => entity.name);
  };
  var __exports = {
    __esModule: true
  };
  __exports.getNavigationPropertyInfoFromEntity = getNavigationPropertyInfoFromEntity;
  __exports.getPropertyInfoFromEntity = getPropertyInfoFromEntity;
  __exports.getLabelForEntitySet = getLabelForEntitySet;
  __exports.getPropertyReference = getPropertyReference;
  __exports.getMetaModelObjectForEntitySet = getMetaModelObjectForEntitySet;
  __exports.getEntityNames = getEntityNames;
  return __exports;
});
//# sourceMappingURL=MetadataAnalyzer-dbg-dbg.js.map

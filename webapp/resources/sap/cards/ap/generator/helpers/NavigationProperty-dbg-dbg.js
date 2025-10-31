/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
"use strict";

sap.ui.define(["../odata/ODataUtils", "../pages/Application", "./Batch", "./Formatter", "./PropertyExpression"], function (___odata_ODataUtils, ___pages_Application, ___Batch, ___Formatter, ___PropertyExpression) {
  "use strict";

  /**
   * Fetches the navigation properties with label for a single Navigation property
   * @param rootComponent
   * @param navigationProperty - Name of the navigation property
   * @param path
   */
  const getNavigationPropertiesWithLabel = function (rootComponent, navigationProperty, path) {
    try {
      const model = rootComponent.getModel();
      const {
        entitySet,
        serviceUrl,
        odataModel
      } = Application.getInstance().fetchDetails();
      const bODataV4 = odataModel === ODataModelVersion.V4;
      const navigationPropertyInfo = getNavigationPropertyInfoFromEntity(model, entitySet);
      const selectedNavigationProperty = navigationPropertyInfo.find(property => property.name === navigationProperty);
      if (!selectedNavigationProperty) {
        return Promise.resolve({
          propertiesWithLabel: [],
          navigationPropertyData: {}
        });
      }
      const properties = selectedNavigationProperty.properties || [];
      const queryParams = {
        properties: [],
        navigationProperties: [{
          name: selectedNavigationProperty.name,
          properties: []
        }]
      };
      return Promise.resolve(fetchDataAsync(serviceUrl, path, bODataV4, createUrlParameters(queryParams))).then(function (data) {
        if (data[selectedNavigationProperty.name] !== undefined && data[selectedNavigationProperty.name] !== null) {
          properties.forEach(property => {
            const name = data[selectedNavigationProperty.name];
            if (name[property.name] !== undefined && name[property.name] !== null) {
              const propertyValue = name[property.name];
              property.labelWithValue = formatPropertyDropdownValues(property, propertyValue);
            } else {
              property.labelWithValue = `${property.label} (<empty>)`;
            }
          });
        }
        return {
          propertiesWithLabel: properties,
          navigationPropertyData: data
        };
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Updates the navigation properties with the provided labels.
   *
   * @param {NavigationParameter[]} navigationProperties - The array of navigation parameters to be updated.
   * @param {string} navigationEntityName - The name of the navigation entity to be updated.
   * @param {Property[]} propertiesWithLabel - The array of properties with labels to update the navigation entity with.
   */
  const fetchDataAsync = ___odata_ODataUtils["fetchDataAsync"];
  const getNavigationPropertyInfoFromEntity = ___odata_ODataUtils["getNavigationPropertyInfoFromEntity"];
  const Application = ___pages_Application["Application"];
  const ODataModelVersion = ___pages_Application["ODataModelVersion"];
  const createUrlParameters = ___Batch["createUrlParameters"];
  const formatPropertyDropdownValues = ___Formatter["formatPropertyDropdownValues"];
  const resolvePropertyPathFromExpression = ___PropertyExpression["resolvePropertyPathFromExpression"];
  function updateNavigationPropertiesWithLabel(navigationProperties, navigationEntityName, propertiesWithLabel) {
    const navigationProperty = navigationProperties.find(property => property.name === navigationEntityName);
    if (!navigationProperty) {
      return;
    }
    navigationProperty.properties = [...propertiesWithLabel];
  }
  const getNavigationPropertyInfo = function (textArrangement, navigationProperty, path) {
    try {
      function _temp3() {
        const _temp = function () {
          if (textArrangement.isNavigationForId) {
            const navigationEntitySet = textArrangement.propertyKeyForId;
            return Promise.resolve(getNavigationPropertiesWithLabel(rootComponent, navigationEntitySet, path)).then(function ({
              propertiesWithLabel,
              navigationPropertyData
            }) {
              textArrangement.navigationalPropertiesForId = propertiesWithLabel;
              updateNavigationPropertiesWithLabel(navigationProperty, navigationEntitySet, textArrangement.navigationalPropertiesForId);
              const navigationPropertyInfoForId = {
                navigationEntitySet,
                navigationPropertyData
              };
              navigationPropertyInfo.push(navigationPropertyInfoForId);
            });
          }
        }();
        return _temp && _temp.then ? _temp.then(function () {
          return navigationPropertyInfo;
        }) : navigationPropertyInfo;
      }
      const {
        rootComponent
      } = Application.getInstance().fetchDetails();
      const navigationPropertyInfo = [];
      const _temp2 = function () {
        if (textArrangement.isNavigationForDescription) {
          const navigationEntitySet = textArrangement.propertyKeyForDescription;
          return Promise.resolve(getNavigationPropertiesWithLabel(rootComponent, navigationEntitySet, path)).then(function ({
            propertiesWithLabel,
            navigationPropertyData
          }) {
            textArrangement.navigationalPropertiesForDescription = propertiesWithLabel;
            updateNavigationPropertiesWithLabel(navigationProperty, navigationEntitySet, textArrangement.navigationalPropertiesForDescription);
            const navigationPropertyInfoForDesc = {
              navigationEntitySet,
              navigationPropertyData
            };
            navigationPropertyInfo.push(navigationPropertyInfoForDesc);
          });
        }
      }();
      return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(_temp3) : _temp3(_temp2));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  const getNavigationPropertyInfoGroups = function (item, navigationProperty, path, cardManifest) {
    try {
      const {
        rootComponent
      } = Application.getInstance().fetchDetails();
      const propertyPath = resolvePropertyPathFromExpression(item.value, cardManifest);
      return Promise.resolve(function () {
        if (propertyPath?.includes("/")) {
          const [navigationEntitySet, property] = propertyPath.replace(/[{}]/g, "").split("/");
          return Promise.resolve(getNavigationPropertiesWithLabel(rootComponent, navigationEntitySet, path)).then(function ({
            propertiesWithLabel,
            navigationPropertyData
          }) {
            item.navigationalProperties = propertiesWithLabel;
            item.isNavigationEnabled = true;
            item.isEnabled = true;
            item.navigationProperty = property;
            if (item.navigationalProperties) {
              updateNavigationPropertiesWithLabel(navigationProperty, navigationEntitySet, item.navigationalProperties);
            }
            return {
              navigationEntitySet,
              navigationPropertyData
            };
          });
        }
      }());
    } catch (e) {
      return Promise.reject(e);
    }
  };
  var __exports = {
    __esModule: true
  };
  __exports.getNavigationPropertiesWithLabel = getNavigationPropertiesWithLabel;
  __exports.updateNavigationPropertiesWithLabel = updateNavigationPropertiesWithLabel;
  __exports.getNavigationPropertyInfo = getNavigationPropertyInfo;
  __exports.getNavigationPropertyInfoGroups = getNavigationPropertyInfoGroups;
  return __exports;
});
//# sourceMappingURL=NavigationProperty-dbg-dbg.js.map

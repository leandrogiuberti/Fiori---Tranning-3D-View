/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
"use strict";

sap.ui.define(["sap/base/security/encodeURLParameters", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/odata/ODataUtils", "sap/ui/model/odata/v2/ODataModel", "sap/ui/model/odata/v4/ODataUtils", "./v2/MetadataAnalyzer", "./v4/MetadataAnalyzer"], function (encodeURLParameters, Filter, FilterOperator, V2OdataUtils, V2ODataModel, V4ODataUtils, ___v2_MetadataAnalyzer, ___v4_MetadataAnalyzer) {
  "use strict";

  function _catch(body, recover) {
    try {
      var result = body();
    } catch (e) {
      return recover(e);
    }
    if (result && result.then) {
      return result.then(void 0, recover);
    }
    return result;
  }
  /**
   * Helper function to fetch data from the given URL. This function is used to fetch data from the OData V4 service.
   *
   * @param url - The URL to fetch data from.
   * @param path - The path to fetch data for.
   * @param urlParameters - The URL parameters.
   * @returns A promise that resolves to the fetched data.
   */
  const fetchDataAsync = function (url, path, urlParameters = {}, bODataV4) {
    try {
      const queryParams = {};
      Object.keys(urlParameters).forEach(key => {
        if (urlParameters[key].length) {
          queryParams[key] = urlParameters[key];
        }
      });
      if (bODataV4) {
        return fetchDataAsyncV4(url, path, queryParams);
      } else {
        return fetchDataAsyncV2(url, path, queryParams);
      }
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Checks if the given OData model is an OData V4 model.
   *
   * @param {ODataModel} oModel - The OData model to check.
   * @returns {boolean} `true` if the model is an OData V4 model, otherwise `false`.
   */
  /**
   * Retrieves a specific context from an OData model based on semantic keys, a context path, and reference keys.
   *
   * @param {string[]} semanticKeys - An array of semantic keys used to filter the context.
   * @param {string} contextPath - The context path to retrieve the context from.
   * @param {string[]} referenceKeys - An array of reference keys to include in the `$select` query.
   * @param {ODataModel} model - The OData model (V2 or V4) used to retrieve the context.
   * @returns {Promise<Context | null>} A promise that resolves to the retrieved context, or `null` if no context is found.
   */
  const getContextFromKeys = function (semanticKeys, contextPath, referenceKeys, model) {
    try {
      const metaModel = model.getMetaModel();
      if (!semanticKeys || semanticKeys.length === 0) {
        return Promise.resolve(null);
      }
      const filter = createFilterFromPath(contextPath, semanticKeys);
      if (filter === null) {
        return Promise.resolve(null);
      }
      const absolutePath = contextPath.startsWith("/") ? contextPath : `/${contextPath}`;
      const metaContext = metaModel.getMetaContext(absolutePath);
      const listBinding = model.bindList(metaContext?.getPath() ?? "", undefined, undefined, filter, {
        $select: referenceKeys.join(",")
      });
      return Promise.resolve(listBinding.requestContexts(0, 2)).then(function (contexts) {
        return contexts.length > 0 ? contexts[0] : null;
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Retrieves context properties for OData V4.
   *
   * @param model - The application model.
   * @param contextPath - The context path.
   * @returns A promise that resolves to an array of context properties.
   */
  const getPropertyReference = ___v2_MetadataAnalyzer["getPropertyReference"];
  const getPropertyReferenceKey = ___v4_MetadataAnalyzer["getPropertyReferenceKey"];
  const getSemanticKeys = ___v4_MetadataAnalyzer["getSemanticKeys"];
  /**
   * Validates if context key follows this pattern /entitySet('12345')
   *
   * @param keys
   * @returns {boolean}
   */
  const isSingleKeyWithoutAssignment = keys => keys.length === 1 && !keys[0].includes("=");

  /**
   * Handles a single property in the context of OData.
   *
   * If there is only one property in the object context and it is not a semantic key,
   * then it is assumed to be a GUID. The function updates the context properties accordingly.
   *
   * @param propertyReferenceKey - An array of properties to reference.
   * @param contextProperties - An array of context properties to be updated.
   */
  const handleSingleProperty = function (propertyReferenceKey, contextProperties) {
    // If there is only one property in the object context, and it is not semantic key, then it is a guid
    const guidKey = propertyReferenceKey.find(property => {
      return property.type === "Edm.Guid";
    })?.name;
    const guidValue = contextProperties[0];
    contextProperties[0] = guidKey ? `${guidKey}=${V4ODataUtils.formatLiteral(guidValue, "Edm.Guid")}` : propertyReferenceKey.map(ref => `${ref.name}=${guidValue}`).join(",");
    return contextProperties;
  };

  /**
   * Adds the "IsActiveEntity=true" property to the context properties if it is not already present.
   *
   * @param contextProperties - An array of context property strings.
   * @param propertyReferenceKey - An array of objects containing property name and type.
   * @returns The updated array of context property strings.
   */
  const addIsActiveEntityProperty = function (contextProperties, propertyReferenceKey) {
    const currentProperty = contextProperties.map(property => property.split("=")[0]);
    propertyReferenceKey.forEach(element => {
      if (!currentProperty.includes(element.name) && element.name === "IsActiveEntity") {
        contextProperties.push("IsActiveEntity=true");
      }
    });
    return contextProperties;
  };

  /**
   * Removes single quotes from the beginning and end of a string and decodes any URI-encoded characters.
   *
   * This function is typically used to process OData key values or other strings that are enclosed in single quotes
   * and may contain URI-encoded characters.
   *
   * @param {string} value - The string to be unquoted and decoded.
   * @returns {string} The unquoted and decoded string.
   *
   */
  function unquoteAndDecode(value) {
    if (value.startsWith("'") && value.endsWith("'")) {
      value = decodeURIComponent(value.substring(1, value.length - 1));
    }
    return value;
  }

  /**
   * Creates an SAPUI5 `Filter` object from a given context path and semantic keys.
   *
   * This function parses the `contextPath` to extract key-value pairs, matches them with the provided `semanticKeys`,
   * and constructs a filter object. It supports both single-key and multi-key scenarios.
   *
   * @param {string} contextPath - The semantic or technical path containing key-value pairs.
   * @param {string[]} semanticKeys - An array of semantic keys to match with the key-value pairs in the context path.
   * @returns {Filter | null} An SAPUI5 `Filter` object if the keys match, or `null` if no valid filter can be created.
   *
   */
  function createFilterFromPath(contextPath, semanticKeys) {
    const keyValues = contextPath.substring(contextPath.indexOf("(") + 1, contextPath.length - 1).split(",");
    if (semanticKeys.length != keyValues.length) {
      return null;
    }
    const keyValuesMap = new Map();
    let keyIndex = 0;
    keyValues.forEach(function (keyValue) {
      if (keyValue.indexOf("=") > -1) {
        const [key, value] = keyValue.split("=");
        keyValuesMap.set(key, unquoteAndDecode(value));
      } else {
        keyValuesMap.set(semanticKeys[keyIndex], unquoteAndDecode(keyValue));
      }
      keyIndex++;
    });
    const filters = [];
    semanticKeys.forEach(semanticKey => {
      const semanticKeyValue = keyValuesMap.get(semanticKey);
      if (semanticKeyValue !== undefined) {
        filters.push(new Filter({
          path: semanticKey,
          operator: FilterOperator.EQ,
          value1: semanticKeyValue
        }));
      }
    });
    return filters.length ? new Filter(filters, true) : null;
  }
  const getContextPropertiesForODataV4 = function (model, contextPath) {
    try {
      let _exit = false;
      function _temp2(_result) {
        return _exit ? _result : contextProperties.length === 1 && contextProperties[0].indexOf("=") === -1 ? handleSingleProperty(propertyReferenceKey, contextProperties) : addIsActiveEntityProperty(contextProperties, propertyReferenceKey);
      }
      const index = contextPath.indexOf("(");
      const entitySetName = contextPath.substring(0, index);
      const lastIndex = contextPath.indexOf(")");
      const propertyPath = contextPath.substring(index + 1, lastIndex);
      const propertyReferenceKey = getPropertyReferenceKey(model, entitySetName);
      const contextProperties = propertyPath.split(",");
      const semanticKeys = getSemanticKeys(model.getMetaModel(), entitySetName).map(key => key.$PropertyPath);
      const referenceKeys = propertyReferenceKey.map(ref => ref.name);
      const _temp = function () {
        if (semanticKeys.length) {
          return Promise.resolve(getContextFromKeys(semanticKeys, contextPath, referenceKeys, model)).then(function (dataContext) {
            const dataContextPath = dataContext?.getPath();
            if (dataContextPath) {
              const _propertyReferenceKey = propertyReferenceKey.map(key => {
                const value = dataContext?.getProperty(key.name);
                return `${key.name}=${V4ODataUtils.formatLiteral(value, key.type)}`;
              });
              _exit = true;
              return _propertyReferenceKey;
            }
          });
        }
      }();
      return Promise.resolve(_temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  /**
   * Creates context parameters based on the given path, app model, and OData version.
   *
   * @param contextPath - The path to create context parameters for.
   * @param model - The application model.
   * @param oDataV4 - A boolean indicating if OData V4 is used.
   * @returns A promise that resolves to a string of context parameters.
   */
  const createContextParameter = function (contextPath, model, oDataV4) {
    try {
      let _exit2 = false;
      function _temp4(_result2) {
        if (_exit2) return _result2;
        const index = contextPath.indexOf("(");
        const lastIndex = contextPath.indexOf(")");
        const propertyPath = contextPath.substring(index + 1, lastIndex);
        const contextProperties = propertyPath.split(",");
        if (isSingleKeyWithoutAssignment(contextProperties)) {
          const entitySetName = contextPath.substring(0, index);
          const propertyReferenceKey = getPropertyReference(model, entitySetName);
          return handleSingleProperty(propertyReferenceKey, contextProperties).join(",");
        }
        return propertyPath;
      }
      const _temp3 = function () {
        if (oDataV4) {
          return Promise.resolve(getContextPropertiesForODataV4(model, contextPath)).then(function (contextParameters) {
            const _contextParameters$jo = contextParameters.join(",");
            _exit2 = true;
            return _contextParameters$jo;
          });
        }
      }();
      return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(_temp4) : _temp4(_temp3));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  const fetchDataAsyncV4 = function (url, path, queryParams) {
    try {
      const formattedUrl = url.endsWith("/") ? url : `${url}/`;
      queryParams.format = "json";
      const parameters = encodeURLParameters(queryParams);
      const sFormattedUrl = `${formattedUrl}${path}?${parameters}`;
      return Promise.resolve(fetchFileContent(sFormattedUrl, "json").then(data => data).catch(err => {
        throw new Error(err);
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  const fetchDataAsyncV2 = function (url, path, queryParams) {
    try {
      const oModel = new V2ODataModel(url);
      return Promise.resolve(new Promise(function (resolve, reject) {
        const fnSuccess = function (oData) {
          resolve(oData);
        };
        const fnFailure = function (oError) {
          reject(oError);
        };
        oModel.read("/" + path, {
          success: fnSuccess,
          error: fnFailure,
          urlParameters: queryParams
        });
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  function isODataV4Model(oModel) {
    return oModel && oModel.isA("sap.ui.model.odata.v4.ODataModel") || false;
  }

  /**
   * Creates an array of context URLs using the given data, entity context path, entity set, and application model.
   *
   * @param {Record<string, any>[]} data The data for entity set.
   * @param {string} entityContextPath The entity context path.
   * @param {string} entitySet The entitySet
   * @param {ODataModel} appModel The application model.
   * @returns {string[]} Array of context URLs.
   */
  function createEntitySetWithContextUris(data, entityContextPath, entitySet, appModel) {
    const bODataV4 = isODataV4Model(appModel);
    const entityKeyProperties = bODataV4 ? getPropertyReferenceKey(appModel, entitySet).map(property => property.name) : getPropertyReference(appModel, entitySet).map(property => property.name);
    const updatedDataValues = data.filter(item => {
      return entityKeyProperties.every(property => {
        return item[property] !== undefined && item[property] !== "";
      });
    });
    return updatedDataValues.map(parameters => {
      let contextUri = entityContextPath;
      Object.entries(parameters).forEach(([key, value]) => {
        const parameterPlaceholder = `{{parameters.${key}}}`;
        if (contextUri.includes(parameterPlaceholder)) {
          contextUri = contextUri.replace(parameterPlaceholder, value);
        }
      });
      return entitySet && contextUri ? `${entitySet}(${contextUri})` : "";
    });
  }

  /**
   * fetches data from the OData service (V2 or V4) using the provided service URL and entity set to format the key properties of
   * the entity set as context parameters and constructs the context path.
   *
   * @param {string} serviceUrl - The base URL of the OData service.
   * @param {string} entitySet - The name of the entity set to fetch data for.
   * @param {ODataModel} appModel - The OData model (V2 or V4) used to interact with the service.
   * @returns {Promise<string>} A promise that resolves to the first entity set with its context URL as a string,
   *                            or an empty string if no data is available or an error occurs.
   */
  const getEntitySetWithContextURLs = function (serviceUrl, entitySet, appModel) {
    try {
      const bODataV4 = isODataV4Model(appModel);
      const entityKeyProperties = bODataV4 ? getPropertyReferenceKey(appModel, entitySet).map(property => property.name) : getPropertyReference(appModel, entitySet).map(property => property.name);
      const urlParameters = {
        $select: entityKeyProperties.join(",")
      };
      return Promise.resolve(_catch(function () {
        return Promise.resolve(fetchDataAsync(serviceUrl, entitySet, urlParameters, bODataV4)).then(function (data) {
          const results = bODataV4 ? data.value : data.results;
          if (results.length > 0) {
            const entityContextPath = getContextPath(appModel, entitySet);
            const entitySetWithObjectContextUris = createEntitySetWithContextUris(results, entityContextPath, entitySet, appModel);
            return entitySetWithObjectContextUris.map(uri => ({
              name: uri,
              labelWithValue: uri
            }));
          }
          return [];
        });
      }, function () {
        return [];
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  /**
   * Fetches the application manifest and retrieves the default entity set for the ObjectPage embed configuration in design mode.
   *
   * @returns {Promise<string>} A promise that resolves to the default entity set for the ObjectPage embed configuration,
   *                            or an empty string if not found.
   */
  const getEntitySetForDesignMode = function () {
    return Promise.resolve(_catch(function () {
      return Promise.resolve(fetchFileContent("/manifest.json", "json")).then(function (appManifest) {
        return appManifest["sap.cards.ap"]?.embeds?.ObjectPage?.default || "";
      });
    }, function () {
      return "";
    }));
  };

  /**
   * Retrieves the entity set with object context.
   *
   * @param {Component} rootComponent - The root component of the application.
   * @param {FreeStyleFetchOptions} fetchOptions - The FreeStyleFetchOptions including isDesignMode, entitySet and keyParameters.
   * @returns {Promise<string | undefined>} If Design mode then the url is formed using service, model and entitySet.
   * 										  In case of Run time entitySet and keyParameters will be used.
   */
  const getEntitySetWithObjectContext = function (rootComponent, fetchOptions) {
    try {
      function _temp6(entitySet) {
        let _exit3 = false;
        const bODataV4 = isODataV4Model(appModel);
        const serviceUrl = bODataV4 ? appModel.getServiceUrl() : appModel.sServiceUrl;
        if (entitySet && fetchOptions.keyParameters && !isDesignMode) {
          let entityContextPath = getContextPath(appModel, entitySet);
          const keyParameters = fetchOptions.keyParameters;
          Object.entries(keyParameters).forEach(([key, value]) => {
            const parameterPlaceholder = `{{parameters.${key}}}`;
            if (entityContextPath.includes(parameterPlaceholder)) {
              entityContextPath = entityContextPath.replace(parameterPlaceholder, value);
            }
          });
          return entityContextPath ? `${entitySet}(${entityContextPath})` : "";
        }
        const _temp5 = function () {
          if (serviceUrl && entitySet && appModel && isDesignMode) {
            return Promise.resolve(getEntitySetWithContextURLs(serviceUrl, entitySet, appModel)).then(function (entitySetWithObjectContextList) {
              const entitySetWithObjectContext = entitySetWithObjectContextList?.length ? entitySetWithObjectContextList[0].name : "";
              _exit3 = true;
              return entitySetWithObjectContext;
            });
          }
        }();
        return _temp5 && _temp5.then ? _temp5.then(function (_result3) {
          return _exit3 ? _result3 : entitySet;
        }) : _exit3 ? _temp5 : entitySet;
      }
      const appModel = rootComponent.getModel();
      const isDesignMode = fetchOptions.isDesignMode || false;
      return Promise.resolve(isDesignMode ? Promise.resolve(getEntitySetForDesignMode()).then(_temp6) : _temp6(fetchOptions.entitySet));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  /**
   * Constructs a context path string by formatting the key properties of the given entity set
   * based on the OData model version (V2 or V4).
   *
   * @param {ODataModel} appModel - The OData model (V2 or V4) used to retrieve key properties.
   * @param {string} entitySet - The name of the entity set for which the context path is constructed.
   * @returns {string} A string representing the context path with formatted key properties.
   */
  function getContextPath(appModel, entitySet) {
    const contextParameters = [];
    const bODataV4 = appModel && appModel.isA("sap.ui.model.odata.v4.ODataModel");
    if (bODataV4) {
      const keyProperties = getPropertyReferenceKey(appModel, entitySet);
      keyProperties.forEach(property => {
        const parameter = V4ODataUtils.formatLiteral(`{{parameters.${property.name}}}`, property.type);
        contextParameters.push(`${property.name}=${parameter}`);
      });
    } else {
      const keyProperties = getPropertyReference(appModel, entitySet);
      keyProperties.forEach(property => {
        const parameter = V2OdataUtils.formatValue(`{{parameters.${property.name}}}`, property.type, true);
        contextParameters.push(`${property.name}=${parameter}`);
      });
    }
    return contextParameters.join(",");
  }

  /**
   * Fetches the content of a file from the specified URL.
   *
   * @param {string} url - The URL of the file to fetch.
   * @param {string} [format] - Optional format specifier; if "json", parses the response as JSON, otherwise returns text.
   * @returns {Promise<any>} - A promise that resolves to the file content as a string or parsed JSON object.
   * @throws {Error} If the fetch fails or the response is not OK.
   */
  const fetchFileContent = function (url, format) {
    try {
      return Promise.resolve(_catch(function () {
        return Promise.resolve(fetch(url)).then(function (response) {
          if (!response.ok) {
            throw new Error(`Failed to fetch file from ${url}: ${response.status} ${response.statusText}`);
          }
          return Promise.resolve(format === "json" ? response.json() : response.text());
        });
      }, function (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        throw new Error(`Error fetching file from ${url}: ${errorMessage}`);
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  var __exports = {
    __esModule: true
  };
  __exports.isSingleKeyWithoutAssignment = isSingleKeyWithoutAssignment;
  __exports.handleSingleProperty = handleSingleProperty;
  __exports.unquoteAndDecode = unquoteAndDecode;
  __exports.createContextParameter = createContextParameter;
  __exports.fetchDataAsync = fetchDataAsync;
  __exports.isODataV4Model = isODataV4Model;
  __exports.getEntitySetWithContextURLs = getEntitySetWithContextURLs;
  __exports.getEntitySetWithObjectContext = getEntitySetWithObjectContext;
  __exports.fetchFileContent = fetchFileContent;
  return __exports;
});
//# sourceMappingURL=ODataUtils-dbg-dbg.js.map

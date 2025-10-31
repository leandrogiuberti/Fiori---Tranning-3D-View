/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/i18n/Localization", "sap/fe/base/BindingToolkit", "sap/fe/base/ClassSupport", "sap/fe/controls/easyFilter/EasyFilterBarContainer", "sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/macros/ai/EasyFilterDataFetcher", "sap/fe/macros/filter/FilterUtils", "sap/fe/macros/filterBar/DraftEditState", "sap/fe/macros/internal/valuehelp/ValueListHelper", "sap/ui/core/Element", "sap/ui/model/FilterOperator", "sap/ui/model/json/JSONModel", "sap/ui/model/odata/type/Date", "sap/ui/model/odata/type/DateTimeOffset", "sap/ui/model/odata/type/TimeOfDay", "sap/fe/base/jsx-runtime/jsx"], function (Log, Localization, BindingToolkit, ClassSupport, EasyFilterBarContainer, BuildingBlock, BusyLocker, ModelHelper, TypeGuards, DataModelPathHelper, PropertyHelper, EasyFilterDataFetcher, FilterUtils, DraftEditState, ValueListHelper, UI5Element, FilterOperator, JSONModel, Date1, DateTimeOffset, TimeOfDay, _jsx) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6;
  var _exports = {};
  var unresolvedResult = EasyFilterDataFetcher.unresolvedResult;
  var resolveTokenValue = EasyFilterDataFetcher.resolveTokenValue;
  var mapValueListToCodeList = EasyFilterDataFetcher.mapValueListToCodeList;
  var generateSelectParameter = EasyFilterDataFetcher.generateSelectParameter;
  var hasValueHelpWithFixedValues = PropertyHelper.hasValueHelpWithFixedValues;
  var isPathFilterable = DataModelPathHelper.isPathFilterable;
  var isProperty = TypeGuards.isProperty;
  var isPathAnnotationExpression = TypeGuards.isPathAnnotationExpression;
  var isNavigationProperty = TypeGuards.isNavigationProperty;
  var isEntityType = TypeGuards.isEntityType;
  var isComplexType = TypeGuards.isComplexType;
  var property = ClassSupport.property;
  var implementInterface = ClassSupport.implementInterface;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var association = ClassSupport.association;
  var aggregation = ClassSupport.aggregation;
  var isConstant = BindingToolkit.isConstant;
  function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
  function _inheritsLoose(t, o) { t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o); }
  function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
  function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
  function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
  /**
   * Delivery for beta release for the easy filter feature.
   */
  let EasyFilterBar = (_dec = defineUI5Class("sap.fe.macros.EasyFilterBar"), _dec2 = implementInterface("sap.fe.core.controllerextensions.viewState.IViewStateContributor"), _dec3 = association({
    type: "sap.fe.macros.filterBar.FilterBarAPI"
  }), _dec4 = association({
    type: "sap.fe.macros.contentSwitcher.ContentSwitcher"
  }), _dec5 = property({
    type: "string"
  }), _dec6 = property({
    type: "string"
  }), _dec7 = aggregation({
    type: "sap.fe.controls.easyFilter.EasyFilterBarContainer"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlock) {
    function EasyFilterBar(properties, others) {
      var _this;
      _this = _BuildingBlock.call(this, properties, others) || this;
      _initializerDefineProperty(_this, "__implements__sap_fe_core_controllerextensions_viewState_IViewStateContributor", _descriptor, _this);
      _initializerDefineProperty(_this, "filterBar", _descriptor2, _this);
      _initializerDefineProperty(_this, "contentSwitcher", _descriptor3, _this);
      _initializerDefineProperty(_this, "contentSwitcherKey", _descriptor4, _this);
      _initializerDefineProperty(_this, "contextPath", _descriptor5, _this);
      _initializerDefineProperty(_this, "content", _descriptor6, _this);
      _this.getAppComponent()?.getEnvironmentCapabilities().prepareFeature("MagicFiltering").then(() => {
        _this.easyFilterPath = "ux/eng/fioriai/reuse/easyfilter/EasyFilter";
        _this.content?.setEasyFilterLib(_this.easyFilterPath);
        return;
      }).catch(error => {
        Log.debug("Error while loading EasyFilter", error);
        return undefined;
      });
      return _this;
    }
    _exports = EasyFilterBar;
    _inheritsLoose(EasyFilterBar, _BuildingBlock);
    var _proto = EasyFilterBar.prototype;
    _proto.applyLegacyState = async function applyLegacyState(getContrilState, oNavParameters, _shouldApplyDiffState, _skipMerge) {
      if (oNavParameters?.selectionVariant) {
        const selectOptionsNames = oNavParameters.selectionVariant.getSelectOptionsPropertyNames();
        this.filterBarMetadata.forEach(field => {
          if (selectOptionsNames.includes(field.name)) {
            field.defaultValue = oNavParameters.selectionVariant.getSelectOption(field.name)?.reduce((acc, option) => {
              if (option.Sign === "I") {
                if (option.Option === FilterOperator.BT || option.Option === FilterOperator.NB) {
                  if (option.High !== null && option.High !== undefined) {
                    acc.push({
                      operator: option.Option,
                      selectedValues: [option.Low, option.High]
                    });
                  }
                } else {
                  acc.push({
                    operator: option.Option,
                    selectedValues: [option.Low]
                  });
                }
              } else {
                acc.push({
                  operator: FilterOperator.NE,
                  selectedValues: [option.Low]
                });
              }
              return acc;
            }, []);
          }
        });
        this.content?.resetState(false);
      }
      return Promise.resolve(undefined);
    };
    _proto.applyState = function applyState(_state, _oNavParameters) {
      return undefined;
    };
    _proto.retrieveState = function retrieveState() {
      return {};
    };
    _proto.getApplicationId = function getApplicationId() {
      return this.getAppComponent()?.getManifestEntry("sap.app").id ?? "<unknownID>";
    };
    _proto.onMetadataAvailable = function onMetadataAvailable() {
      this.filterBarMetadata = this.prepareFilterBarMetadata();
      this.recommendedQueries = this.getAppComponent()?.getManifestEntry("sap.fe")?.macros?.easyFilter?.recommendedQueries ?? [];
      this.content = this.createContent();
      this.content.filterBarMetadata = this.filterBarMetadata;
    };
    _proto.getUnitForProperty = function getUnitForProperty(prop, basePath) {
      const unitAnnotation = prop.annotations.Measures?.ISOCurrency ?? prop.annotations.Measures?.Unit;
      return isPathAnnotationExpression(unitAnnotation) ? `${basePath}/${unitAnnotation.path}` : undefined;
    };
    _proto.getDefaultValueForFilterField = function getDefaultValueForFilterField(field, startupParameters) {
      let defaultValue;
      if (startupParameters.hasOwnProperty(field.name)) {
        defaultValue = [{
          operator: FilterOperator.EQ,
          selectedValues: startupParameters[field.name]
        }];
      } else if (field.isParameter && startupParameters.hasOwnProperty(field.name.substring(2))) {
        defaultValue = [{
          operator: FilterOperator.EQ,
          selectedValues: startupParameters[field.name.substring(2)]
        }];
      }
      return defaultValue;
    };
    _proto.getEditStateFilterMetadata = function getEditStateFilterMetadata(metaModel) {
      // Assemble the code list for the editing status filter values:
      const props = new JSONModel({
        isDraftCollaborative: ModelHelper.isCollaborationDraftSupported(metaModel)
      }).createBindingContext("/");
      const editingStatusCodeList = DraftEditState.getEditStatesContext(props).getObject("/").map(state => ({
        value: state.id,
        description: state.display
      }));
      return {
        name: "$editState",
        label: this.getTranslatedText("FILTERBAR_EDITING_STATUS"),
        dataType: "Edm.String",
        filterable: true,
        codeList: editingStatusCodeList,
        type: "MenuWithSingleSelect"
      };
    };
    _proto.getTokenType = function getTokenType(prop, filterRestriction) {
      if (hasValueHelpWithFixedValues(prop)) {
        return filterRestriction === "SingleValue" ? "MenuWithSingleSelect" : "MenuWithCheckBox";
      }
      switch (prop.type) {
        case "Edm.Date":
          return "Calendar";
        case "Edm.TimeOfDay":
          return "Time";
        default:
          return "ValueHelp";
      }
    };
    _proto.getLabel = function getLabel(element) {
      const label = element.annotations.Common?.Label?.toString();
      const headerInfoTypeName = isEntityType(element) ? element.annotations.UI?.HeaderInfo?.TypeName?.valueOf() : undefined;
      const result = headerInfoTypeName || label;
      if (this.isComplexProperty(element) || isNavigationProperty(element)) {
        return result || this.getLabel(element.targetType);
      }
      return result;
    };
    _proto.isScalarProperty = function isScalarProperty(element) {
      return isProperty(element) && !isComplexType(element.targetType);
    };
    _proto.isComplexProperty = function isComplexProperty(element) {
      return isProperty(element) && isComplexType(element.targetType);
    };
    _proto.prepareFilterBarMetadata = function prepareFilterBarMetadata() {
      /*
       * 1. INITIALIZATION:
       *    - Queue all root entity properties and navigation properties for traversal
       *    - Initialize result array and elimination set for Common.Text targets
       *
       * 2. BREADTH-FIRST TRAVERSAL:
       *    For each path in queue:
       *    - Skip UI.Hidden properties
       *    - Scalar properties: Generate metadata, track Common.Text targets for elimination
       *    - Complex properties: Add child properties to queue
       *    - Navigation properties: Add target EntityType properties to queue
       *      (Collections only if explicit filter fields exist, respect depth limits)
       *
       * 3. POST-PROCESSING:
       *    - Add $editState filter for draft-enabled entities
       *    - Remove properties marked for elimination (except explicit filter fields)
       */
      const owner = this._getOwner();
      const definitionForPage = owner.preprocessorContext?.getDefinitionForPage();
      if (!definitionForPage) {
        return [];
      }
      const filterBarDef = definitionForPage.getFilterBarDefinition({});
      const metaPath = definitionForPage.getMetaPath();
      const entitySet = metaPath.getClosestEntitySet();
      let filterExpressionRestrictions = entitySet.annotations.Capabilities?.FilterRestrictions?.FilterExpressionRestrictions ?? [];

      // TODO: Maybe we can simplify this by using restrictions on the main entity set only
      for (const navigationProperty in entitySet.navigationPropertyBinding) {
        if (entitySet.navigationPropertyBinding[navigationProperty]?._type === "EntitySet") {
          // FIXME: optional chaining should not be needed here -> root cause fix pending
          const navigationPropertyEntitySet = entitySet.navigationPropertyBinding[navigationProperty];
          const navPropertyFilterExpressionRestrictions = navigationPropertyEntitySet.annotations.Capabilities?.FilterRestrictions?.FilterExpressionRestrictions ?? [];
          const currentFilterRestrictions = [...filterExpressionRestrictions];
          filterExpressionRestrictions = [...filterExpressionRestrictions, ...navPropertyFilterExpressionRestrictions.filter(restriction => !currentFilterRestrictions.includes(restriction))];
        }
      }
      const metaModel = owner.preprocessorContext?.models.metaModel;
      const getCodeList = (lastPathSegment, propertyPath) => hasValueHelpWithFixedValues(lastPathSegment) ? async () => this.getCodeListForProperty(propertyPath) : undefined;
      const filterFields = filterBarDef.getFilterFields().filter(field => !field.getTarget()?.annotations?.UI?.HiddenFilter?.valueOf());
      const startupParameters = owner.getAppComponent().getComponentData()?.startupParameters ?? {};
      const maxDepth = 1; // Maximum depth for navigation properties

      // Initialize traversal queue with all entity properties and navigation properties.
      // Each path to traverse is a list of segments (e.g. [navProp1, complexProp1, complexProp2, scalarProp])
      const pathsToExplore = [...entitySet.entityType.entityProperties, ...entitySet.entityType.navigationProperties].map(element => [element]);

      // Resulting metadata array
      const result = [];

      // Set of property paths to be eliminated from the filter bar metadata
      const pathsToEliminate = new Set();
      const getPathLabel = path => {
        const pathLabels = path.map(e => this.getLabel(e) || `[${e.name}]`);
        return Localization.getRTL() ? pathLabels.slice().reverse().join(" - ") : pathLabels.join(" - ");
      };
      while (pathsToExplore.length > 0) {
        const currentPath = pathsToExplore.shift();
        const navigationDepth = currentPath.filter(isNavigationProperty).length;
        const lastPathSegment = currentPath[currentPath.length - 1];
        if (lastPathSegment.annotations.UI?.Hidden?.valueOf() === true) {
          continue;
        }
        const pathString = [`/${entitySet.name}`, ...currentPath.slice(0, -1).map(e => e.name)].reduce((acc, curr) => `${acc}/${curr}`);
        const propertyPath = `${pathString}/${lastPathSegment.name}`;
        if (this.isScalarProperty(lastPathSegment)) {
          // Check for Common.Text annotation and record the annotation target path for elimination
          const textAnnotation = lastPathSegment.annotations.Common?.Text;
          if (isPathAnnotationExpression(textAnnotation)) {
            // Construct the full path to the target property
            pathsToEliminate.add(`${pathString}/${textAnnotation.path}`);
          }

          // Scalar property: create metadata for the property
          const filterField = filterFields.find(field => field.getTarget() === lastPathSegment);
          const filterRestriction = filterExpressionRestrictions.find(expression => expression.Property?.$target === lastPathSegment);
          const filterable = isPathFilterable(this.getDataModelObjectPath(propertyPath));
          const filterableExpression = isConstant(filterable) ? filterable.value : true;
          const filterRestrictionExpression = filterRestriction?.AllowedExpressions;
          const codeList = getCodeList(lastPathSegment, propertyPath);
          const metadata = {
            name: propertyPath,
            label: getPathLabel(currentPath),
            dataType: lastPathSegment.type,
            required: filterField?.required,
            defaultValue: filterField ? this.getDefaultValueForFilterField(filterField, startupParameters) : undefined,
            filterable: filterField ? filterableExpression : undefined,
            hiddenFilter: !filterField,
            filterRestriction: filterField ? filterRestrictionExpression : undefined,
            codeList,
            type: this.getTokenType(lastPathSegment, filterRestriction?.AllowedExpressions?.toString() || "MultiRangeOrSearchExpression"),
            unit: this.getUnitForProperty(lastPathSegment, pathString)
          };
          result.push(metadata);
        } else if (this.isComplexProperty(lastPathSegment)) {
          // Complex property: add all properties and navigation properties of the complex type
          lastPathSegment.targetType.properties.forEach(child => {
            pathsToExplore.push([...currentPath, child]);
          });

          // only traverse navigation properties if we are not at the maximum depth
          if (navigationDepth < maxDepth) {
            lastPathSegment.targetType.navigationProperties.forEach(child => {
              pathsToExplore.push([...currentPath, child]);
            });
          }
        } else if (isNavigationProperty(lastPathSegment)) {
          // add 1:n navigation properties only if there are filter fields for at least one of the target properties
          if (lastPathSegment.isCollection && !filterFields.some(field => field.annotationPath?.startsWith(propertyPath))) {
            continue;
          }
          lastPathSegment.targetType.entityProperties.forEach(child => {
            pathsToExplore.push([...currentPath, child]);
          });

          // only traverse navigation properties if we are not at the maximum depth
          if (navigationDepth < maxDepth) {
            lastPathSegment.targetType.navigationProperties.forEach(child => {
              pathsToExplore.push([...currentPath, child]);
            });
          }
        }
      }

      // [Editing Status]
      if (ModelHelper.isMetaPathDraftSupported(definitionForPage.getMetaPath())) {
        result.push(this.getEditStateFilterMetadata(metaModel));
      }

      // Remove properties marked for elimination (unless they are filter fields)
      return result.filter(metadata => {
        return !metadata.hiddenFilter ||
        // Keep if explicit filter field
        !pathsToEliminate.has(metadata.name) // Keep if path not marked for elimination
        ;
      });
    };
    _proto.getCodeListForProperty = async function getCodeListForProperty(propertyPath) {
      const defaultValueList = await this.getValueList(propertyPath);
      if (!defaultValueList) {
        return [];
      }
      const valueListInfo = defaultValueList.valueListInfo;
      const listBinding = valueListInfo.$model.bindList(`/${valueListInfo.CollectionPath}`, undefined, undefined, undefined, {
        $select: generateSelectParameter(defaultValueList)
      });
      const data = await listBinding.requestContexts();
      const filterGroupValues = data.map(mapValueListToCodeList(defaultValueList));
      const codeListProperty = this.filterBarMetadata.find(field => field.name === propertyPath);
      if (codeListProperty) {
        codeListProperty.codeList = filterGroupValues;
      }
      return filterGroupValues;
    };
    _proto.resolveTokenValuesForField = async function resolveTokenValuesForField(fieldName, values) {
      const field = this.filterBarMetadata.find(_ref => {
        let {
          name
        } = _ref;
        return name === fieldName;
      });
      let result;
      if (!field) {
        // return original values converted to the expected format if no field is defined
        return unresolvedResult(values);
      }
      const valueList = await this.getValueList(field.name);
      if (valueList && ValueListHelper.isValueListSearchable(field.name, valueList)) {
        const resolvedTokenValues = await Promise.all(values.map(async value => resolveTokenValue(valueList, value)));
        result = resolvedTokenValues.flat();
      } else {
        result = unresolvedResult(values);
      }

      // Apply maxLength filtering if defined
      if (field.maxLength !== undefined) {
        const filteredTokens = result.map(token => {
          if (token.operator === FilterOperator.BT || token.operator === FilterOperator.NB) {
            // Handle between operators - selectedValues is ValueHelpBetweenSelectedValues
            const [a, b] = token.selectedValues;

            // Check if both values exceed maxLength
            if (String(a.value).length <= field.maxLength && String(b.value).length <= field.maxLength) {
              return token; // Keep the token if both values are within limit
            } else {
              return null; // Remove the token if either value exceeds limit
            }
          } else {
            // Handle other operators - selectedValues is CodeListType[]
            const filtered = token.selectedValues.filter(selectedValue => String(selectedValue.value).length <= field.maxLength);

            // Only return the token if there are remaining values after filtering
            if (filtered.length > 0) {
              return {
                ...token,
                selectedValues: filtered
              };
            } else {
              return null; // Remove the token if no values remain
            }
          }
        }).filter(token => token !== null);
        return filteredTokens;
      }

      // if no maxLength is defined, return unfiltered result
      return result;
    };
    _proto.getValueList = async function getValueList(fieldName) {
      const metaModel = this.getMetaModel();
      const valueLists = await ValueListHelper.getValueListInfo(undefined, fieldName, undefined, metaModel);
      return valueLists[0];
    };
    _proto.onTokensChanged = async function onTokensChanged(e) {
      const filterBar = UI5Element.getElementById(this.filterBar);
      const filterBarAPI = filterBar.getParent();
      const tokens = e.getParameter("tokens");
      const clearEditFilter = tokens.some(tokenDefinition => tokenDefinition.key === "$editState");
      await filterBarAPI._clearFilterValuesWithOptions(filterBar, {
        clearEditFilter
      });
      this.formateDataTypes(tokens);
      for (const token of tokens) {
        if (token.key === "$editState") {
          // convert the $editState filter condition
          for (const tokenKeySpecification of token.keySpecificSelectedValues) {
            await FilterUtils.addFilterValues(filterBarAPI.content, token.key, "DRAFT_EDIT_STATE", tokenKeySpecification.selectedValues);
          }
        } else {
          const field = this.filterBarMetadata.find(f => f.name === token.key);
          for (const tokenKeySpecification of token.keySpecificSelectedValues) {
            const {
              operator,
              selectedValues
            } = tokenKeySpecification;
            await FilterUtils.addFilterValues(filterBarAPI.content, field.name, operator, selectedValues);
          }
        }
      }
      await filterBarAPI.triggerSearch();
    }

    //We need the below function so that the date objects and dateTimeOffsets would be converted to string type as the date object is not a valid type in V4 world
    ;
    _proto.formateDataTypes = function formateDataTypes(tokens) {
      const dateType = new Date1(),
        dateTimeOffsetType = new DateTimeOffset(undefined, {
          V4: true
        }),
        timeOfDayType = new TimeOfDay();
      tokens.forEach(token => {
        const edmType = this.filterBarMetadata.find(data => data.name === token.key)?.dataType;
        token.keySpecificSelectedValues.forEach(keySpecificSelectedValue => {
          let requiredConverter;
          switch (edmType) {
            case "Edm.Date":
              requiredConverter = dateType;
              break;
            case "Edm.TimeOfDay":
              requiredConverter = timeOfDayType;
              break;
            case "Edm.DateTimeOffset":
              requiredConverter = dateTimeOffsetType;
              break;
            default:
              return;
          }
          keySpecificSelectedValue.selectedValues.forEach((value, idx) => {
            keySpecificSelectedValue.selectedValues[idx] = requiredConverter.parseValue(value, "object");
          });
        });
      });
    };
    _proto.showValueHelpForKey = async function showValueHelpForKey(key) {
      const field = this.filterBarMetadata.find(f => f.name === key);
      const filterBar = UI5Element.getElementById(this.filterBar);
      const filterBarAPI = filterBar.getParent();
      await filterBarAPI.showFilterField(field.name);
      return filterBarAPI.openValueHelpForFilterField(field.name);
    };
    _proto.onBeforeQueryProcessing = function onBeforeQueryProcessing() {
      const uiModel = this.getModel("ui");
      BusyLocker.lock(uiModel);
    };
    _proto.onAfterQueryProcessing = function onAfterQueryProcessing() {
      const uiModel = this.getModel("ui");
      BusyLocker.unlock(uiModel);
    };
    _proto.onClearFilters = async function onClearFilters() {
      // Empty input: clear the filters and refresh the list
      const filterBar = UI5Element.getElementById(this.filterBar);
      const filterBarAPI = filterBar.getParent();
      await filterBarAPI._clearFilterValuesWithOptions(filterBar);
      await filterBarAPI.triggerSearch();
    };
    _proto.onQueryChanged = function onQueryChanged() {
      const filterBar = UI5Element.getElementById(this.filterBar);
      filterBar.fireFiltersChanged({
        conditionsBased: true
      });
    };
    _proto.handleShowValueHelp = async function handleShowValueHelp(event) {
      const key = event.getParameter("key");
      const resolve = event.getParameter("resolve");
      const reject = event.getParameter("reject");
      try {
        const conditions = await this.showValueHelpForKey(key);
        const selectedValues = conditions.map(async condition => {
          const operator = condition.operator;
          if (condition.validated === "NotValidated") {
            // not validated: the condition only has values without description - try to get the description using the data fetcher mechanism.
            // `condition.values` is a single value `[value]` (or `[lower bound, upper bound]` for BT/NB operators).
            const conditionToResolve = operator === FilterOperator.BT || operator === FilterOperator.NB ? {
              operator,
              selectedValues: [condition.values[0], condition.values[1]]
            } : {
              operator,
              selectedValues: [condition.values[0]]
            };
            return this.resolveTokenValuesForField(key, [conditionToResolve]);
          } else if (operator !== FilterOperator.BT && operator !== FilterOperator.NB) {
            // validated: both value and description are available - directly map them to the result
            // `condition.values` is a tuple of `[value, description?]`
            const [value, description] = condition.values;
            return Promise.resolve([{
              operator,
              selectedValues: [{
                value,
                description: description ?? value
              }]
            }]);
          } else {
            // should not occur: BT/NB are expected to be "NotValidated" conditions
            Log.warning(`Unexpected condition for field ${key}: operator ${operator} with values ${condition.values}.`);
            return Promise.resolve([]);
          }
        });
        const resolvedValues = await Promise.all(selectedValues);
        resolve(resolvedValues.flat());
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    };
    _proto.createContent = function createContent() {
      return _jsx(EasyFilterBarContainer, {
        contextPath: this.getOwnerContextPath(),
        appId: this.getApplicationId(),
        filterBarMetadata: this.filterBarMetadata,
        easyFilterLib: this.easyFilterPath,
        showValueHelp: this.handleShowValueHelp.bind(this),
        dataFetcher: this.resolveTokenValuesForField.bind(this),
        recommendedValues: this.recommendedQueries,
        queryChanged: this.onQueryChanged.bind(this),
        tokensChanged: this.onTokensChanged.bind(this),
        beforeQueryProcessing: this.onBeforeQueryProcessing.bind(this),
        afterQueryProcessing: this.onAfterQueryProcessing.bind(this),
        clearFilters: this.onClearFilters.bind(this)
      });
    };
    return EasyFilterBar;
  }(BuildingBlock), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "__implements__sap_fe_core_controllerextensions_viewState_IViewStateContributor", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "filterBar", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "contentSwitcher", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "contentSwitcherKey", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "content", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class2)) || _class);
  _exports = EasyFilterBar;
  return _exports;
}, false);
//# sourceMappingURL=EasyFilterBar-dbg.js.map

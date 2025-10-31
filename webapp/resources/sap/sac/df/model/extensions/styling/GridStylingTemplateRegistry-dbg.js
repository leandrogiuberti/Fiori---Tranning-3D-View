/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define("sap/sac/df/model/extensions/styling/GridStylingTemplateRegistry",
  [
    "sap/ui/base/Object",
    "sap/sac/df/types/DimensionType",
    "sap/sac/df/types/configuration/TableTemplate",
    "sap/sac/df/firefly/library",
    "sap/sac/df/thirdparty/lodash"
  ],
  function (BaseObject, DimensionType, TableTemplate, FF, _) {
    "use strict";
    const vizVariableMapping = {
      "Actual": FF.OlapVisualizationConstants.SAC_VERSION_ACTUALS_VARIABLE,
      "Previous": FF.OlapVisualizationConstants.SAC_VERSION_PREVIOUS_VARIABLE,
      "Budget": FF.OlapVisualizationConstants.SAC_VERSION_BUDGET_PLAN_VARIABLE,
      "Forecast": FF.OlapVisualizationConstants.SAC_VERSION_FORECAST_VARIABLE,
      "AbsoluteVariance": FF.OlapVisualizationConstants.SAC_VERSION_ABSOLUTE_VARIANCE_VARIABLE,
      "PercentageVariance": FF.OlapVisualizationConstants.SAC_VERSION_PERCENTAGE_VARIANCE_VARIABLE
    };
    /* eslint-disable-next-line no-unused-vars */
    /**
         * Styling template registry for grid
         *
         * @author SAP SE
         * @version 1.141.0
         * @private
         * @ui5-experimental-since 1.132
         * @deprecated As of version 1.135, the concept has been discarded.
         * @alias sap.sac.df.model.extensions.styling.GridStylingTemplateRegistry
         */
    var GridStylingTemplateRegistry = BaseObject.extend("sap.sac.df.model.extensions.styling.GridStylingTemplateRegistry", {

      constructor: function (oModel) {
        this._Model = oModel;

        this._getVisualizationTemplateManager = function () {
          return this._Model.getApplication().getOlapEnvironment().getVisualizationTemplateManager();
        };
        this._getTableTemplateList = function () {
          return this._getVisualizationTemplateManager().getOrCreateTableTemplateList(FF.OlapVisualizationConstants.TABLE_TEMPLATE_LINK);
        };

        this._getVisualizationVariableContainer = function () {
          return this._getVisualizationTemplateManager().getVisualizationVariableHolder();
        };

        this.setVizVariables = function (dataProvider) {
          if (this.memberMapping) {
            _.forEach(vizVariableMapping, (sVizVariable) => {
              var variable = this._getVisualizationVariableContainer().getVariable(sVizVariable);
              variable.clear();
              variable.addString("-----PLACEHOLDER-FOR-NO-MATCH-----");
            });

            if (this.memberMapping[DimensionType.MeasureStructure]) {
              _.each(this.memberMapping[DimensionType.MeasureStructure], (value, key) => {
                const sMemberKey = dataProvider.getMeasureStructureDimension().getStructureMember(key).Key;
                const sVariableName = vizVariableMapping[value];
                if (sMemberKey && sVariableName) {
                  this._getVisualizationVariableContainer().getVariable(sVariableName).addString(sMemberKey);
                }
              });
              this._getVisualizationVariableContainer().getVariable("VersionDimensionTypeVariable").setString(DimensionType.MeasureStructure);
            }
            if (this.memberMapping[DimensionType.StructureDimension]) {
              _.each(this.memberMapping[DimensionType.StructureDimension], (value, key) => {
                const oStructureMember = dataProvider.getStructureDimension().getStructureMember(key);
                if (oStructureMember) {
                  const sMemberKey = dataProvider.getStructureDimension().getStructureMember(key).Key;
                  const sVariableName = vizVariableMapping[value];
                  if (sMemberKey && sVariableName) {
                    this._getVisualizationVariableContainer().getVariable(sVariableName).addString(sMemberKey);
                  }
                }
              });
              this._getVisualizationVariableContainer().getVariable("VersionDimensionTypeVariable").setString("SecondaryStructure");
            }
          }
        };
      }
    });

    /**
         * Activate template
         * @param {sap.sac.df.types.TableTemplate} sName template name
         * @return {Object} active template
         * @deprecated As of version 1.135, the concept has been discarded.
         */
    GridStylingTemplateRegistry.prototype.activateTemplate = function (sName) {
      return sName;
      //this._getTableTemplateList().setActiveTemplateName(sName);
      //return this._Model.fireStylingTemplateActivated({stylingTemplateName: sName});
    };

    /**
         * Get activate template
         * @return {sap.sac.df.types.TableTemplate} active template
         * @deprecated As of version 1.135, the concept has been discarded.
         */
    GridStylingTemplateRegistry.prototype.getActiveTemplate = function () {
      return this._getTableTemplateList().getActiveTemplateName();
    };

    /**
         * Get styling template
         * @param sName name
         * @return {Object} styling template
         * @deprecated As of version 1.135, the concept has been discarded.
         */
    GridStylingTemplateRegistry.prototype.getTemplate = function (sName) {
      return sName;
      //return this._getTableTemplateList().getTemplate(sName);
    };

    /**
         * Set styling styles
         * JSON in form
         * {
         *   "MeasureStructure"{
         *     "MeasureMember1":[
         *       "style1", "style2"
         *     ]
         *   },
         *   "NonMeasureStructure":{
         *     "StructureMember":["style1","style2"]
         *   }
         * }
         * @param oDimensionMemberMapping dimension mapping of the following structure
         * @deprecated As of version 1.135, the concept has been discarded.
         * @public
         */
    GridStylingTemplateRegistry.prototype.setSemanticStyles = function (oDimensionMemberMapping) {
      return oDimensionMemberMapping;
      //this.memberMapping = oDimensionMemberMapping;
    };

    return GridStylingTemplateRegistry;
  });

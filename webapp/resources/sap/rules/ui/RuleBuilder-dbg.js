/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */

// Provides control sap.rules.ui.
sap.ui.define([
    "./library",
    "sap/ui/core/Control",
    "sap/m/Select",
    "sap/ui/core/Item",
    "sap/rules/ui/DecisionTable",
    "sap/rules/ui/DecisionTableConfiguration",
    "sap/rules/ui/TextRuleConfiguration",
    "sap/rules/ui/TextRule",
    "sap/ui/core/Lib",
    "sap/ui/model/json/JSONModel",
    "sap/m/ComboBox",
    "sap/ui/model/Context",
    "./RuleBuilderRenderer"
], function(library, Control, Select, Item, DecisionTable, DecisionTableConfiguration, TextRuleConfiguration, TextRule, coreLib, JSONModel, ComboBox, Context, RuleBuilderRenderer) {
    "use strict";

    /**
     * Constructor for a new RuleBuilder control.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given.
     * @param {object} [mSettings] Initial settings for the new control.
     *
     * @class
     * The <code>sap.rules.ui.RuleBuilder</code> control allows business users to create rules using a business language.
     * @extends sap.ui.core.Control
     *
     * @author SAP SE
     * @version 1.141.0
     *
     * @constructor
     * @public
     * @alias sap.rules.ui.RuleBuilder
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     *
     */
    var oRuleBuilder = Control.extend("sap.rules.ui.RuleBuilder", {
        metadata: {
            library: "sap.rules.ui",
            properties: {
                /**
                 * Available types that can be created using the <code>sap.rules.ui.RuleBuilder</code> control.
                 * If empty, all rule types will be available for selection.
                 * If only one type exists, the Rule Builder will open it automatically.
                 */
                types: {
                    type: "sap.rules.ui.RuleType[]",
                    defaultValue: [library.RuleType.DecisionTable, library.RuleType.TextRule]
                },
                /**
                 * Name of the rule's ODataModel (optional).
                 * The ODataModel object belongs to the application and should be set by the application.
                 * Example:
                 * <pre class="javascript">
                 *     var oModel = new sap.ui.model.v2.oDataModel();
                 *     var ruleBuilder = new RuleBuilder({
                 *          modelName: "rulesModel"
                 *     });
                 *     ruleBuilder.setModel(oModel, "rulesModel")
                 * </pre>
                 */
                // modelName: {
                //  type: "string",
                //  group: "Misc",
                // },
                /**
                 * Path to a Rule object in the model data, which is used for the definition of relative context bindings inside the RuleBuilder control (mandatory).
                 * Example: "/Rules(Id='0050569181751ED683EFEEC6AA2B73C5',Version='000001')"
                 */
                bindingContextPath: {
                    type: "string",
                    group: "Misc"
                },
                /**
                 * Indicates whether or not the controls of the RuleBuilder are editable.
                 */
                editable: {
                    type: "boolean",
                    defaultValue: true
                }
            },
            aggregations: {
                /**
                 * Provides a combo box from which the user selects the rule type for the new rule. Only relevant if <b>types</b> contains more than one value.
                 * @private
                 */
                _ruleTypeSelector: {
                    type: "sap.m.ComboBox",
                    multiple: false,
                    singularName: "_ruleTypeSelector",
                    visibility: "hidden"
                },
                /**
                 * Rule created by the Rule Builder.
                 * @private
                 */
                _rule: {
                    type: "sap.rules.ui.RuleBase",
                    multiple: false,
                    singularName: "_rule",
                    visibility: "hidden"
                },
                /**
                 * Configuration for rule of type 'decision table'.
                 */
                decisionTableConfiguration: {
                    type: "sap.rules.ui.DecisionTableConfiguration",
                    multiple: false,
                    singularName: "decisionTableConfiguration"
                },
                /**
                 * Configuration for rule of type 'Text Rule'.
                 */
                textRuleConfiguration: {
                    type: "sap.rules.ui.TextRuleConfiguration",
                    multiple: false,
                    singularName: "textRuleConfiguration"
                }

            },
            /**
             * Association to the expression language element.
             */
            associations: {
               /**
                * Expression language to model English like expressions. Should not be used when sap.rules.ui.services.AstExpressionLanguage is used.
		* @deprecated Since 1.120.2, use the attribute astExpressionLanguage instead.	
                */
                "expressionLanguage": {
                    type: "sap.rules.ui.services.ExpressionLanguage",
                    multiple: false,
                    singularName: "expressionLanguage"
                },
                /**
                 Expression language to use DMN SFEEL for modelling expressions. Should not be used when sap.rules.ui.services.ExpressionLanguage is used.
                */
                "astExpressionLanguage": {
                    type: "sap.rules.ui.services.AstExpressionLanguage",
                    multiple: false,
                    singularName: "astExpressionLanguage"
                }
            },

            events: {
                // "controlReady": {},
                // "ruleBodyChange": {},
                // "ruleBodyLiveChange": {},
                // "displayModeSelected": {}
            }
        },

        init: function() {
            this.oBundle = coreLib.getResourceBundleFor("sap.rules.ui.i18n");
            this.needCreateDisplayedControl = true;

            this.needRebind = true;

            this._internalModel = this._initInternalModel();
            this.setModel(this._internalModel, "ruleBuilderInternalModel");
        },

        validate: function() {
            var oRule = this.getAggregation("_rule");
            if (oRule) {
                oRule.validate();
            }
        },

        _initInternalModel: function() {
            var data = {
                types: this.getTypes(),
                //modelName: this.getModelName(),
                bindingContextPath: this.getBindingContextPath(),
                editable: this.getEditable(),
                decisionTableConfiguration: {},
                textRuleConfiguration: {}
            };
            var oModel = new JSONModel();
            oModel.setData(data);
            return oModel;
        },

        _getModel: function() {
            // var modelName = this.getModelName();
            // if (modelName) {
            //     return this.getModel(modelName);
            // }
            return this.getModel();
        },

        _setBindingContext: function() {
            var bindingContextPath = this.getBindingContextPath();
            var model = this._getModel();

            var oContext = new Context(model, bindingContextPath);
            this.setBindingContext(oContext);
        },

        _createRuleset: function() {
            return null;
        },

        _createTextRule: function() {
            // get DT configuration object, or create it if it doesn't exists
            var oTextRuleConfiguration = this.getTextRuleConfiguration();
            if (!oTextRuleConfiguration) {
                oTextRuleConfiguration = new TextRuleConfiguration();
                this.setTextRuleConfiguration(oTextRuleConfiguration);
            };

            var oTextRule = new TextRule({
                bindingContextPath: {
                    path: "ruleBuilderInternalModel>/bindingContextPath"
                },
                modelName: {
                    path: "ruleBuilderInternalModel>/modelName"
                },
                editable: {
                    path: "ruleBuilderInternalModel>/editable"
                },
                enableSettings: {
                    path: "ruleBuilderInternalModel>/textRuleConfiguration/enableSettings"
                },
                enableSettingResult: {
                    path: "ruleBuilderInternalModel>/textRuleConfiguration/enableSettingResult"
                },
                enableElse: {
                    path: "ruleBuilderInternalModel>/textRuleConfiguration/enableElse"
                },
                enableElseIf: {
                    path: "ruleBuilderInternalModel>/textRuleConfiguration/enableElseIf"
                },
                expressionLanguage: this.getExpressionLanguage(),
                astExpressionLanguage: this.getAstExpressionLanguage()
            });
            return oTextRule;
        },

        _createDecisionTable: function() {
            // get DT configuration object, or create it if it doesn't exists
            var oDecisionTableConfiguration = this.getDecisionTableConfiguration();
            if (!oDecisionTableConfiguration) {
                oDecisionTableConfiguration = new DecisionTableConfiguration();
                this.setDecisionTableConfiguration(oDecisionTableConfiguration);
            };

            DecisionTable.prototype.VISIBLEROWCOUNT = this.getDecisionTableConfiguration().getVisibleRowCount();
			DecisionTable.prototype.THRESHOLD = this.getDecisionTableConfiguration().getThreshold();
            // create DT
            var oDT = new DecisionTable({
                bindingContextPath: {
                    path: "ruleBuilderInternalModel>/bindingContextPath"
                },
                modelName: {
                    path: "ruleBuilderInternalModel>/modelName"
                },
                editable: {
                    path: "ruleBuilderInternalModel>/editable"
                },
                /**
                    * @deprecated Since 1.52.8, use the attribute RuleFormat instead.
                */
                cellFormat: {
                    path: "ruleBuilderInternalModel>/decisionTableConfiguration/cellFormat"
                },
                enableSettings: {
                    path: "ruleBuilderInternalModel>/decisionTableConfiguration/enableSettings"
                },
                enableSettingResult: {
                    path: "ruleBuilderInternalModel>/decisionTableConfiguration/enableSettingResult"
                },
                hitPolicies: {
                    path: "ruleBuilderInternalModel>/decisionTableConfiguration/hitPolicies"
                },
                decisionTableFormat: {
                    path: "ruleBuilderInternalModel>/decisionTableConfiguration/decisionTableFormat"
                },
                expressionLanguage: this.getExpressionLanguage(),
                astExpressionLanguage: this.getAstExpressionLanguage()

            });
            return oDT;
        },

        _createDisplayedControl: function(sDisplayedControlType) {
            var oDisplayedControl;
            switch (sDisplayedControlType) {
                case library.RuleType.DecisionTable:
                    oDisplayedControl = this._createDecisionTable();
                    break;
                case "library.RuleType.Ruleset":
                    oDisplayedControl = this._createRuleset();
                    break;
                case library.RuleType.TextRule:
                    oDisplayedControl = this._createTextRule();
                    break;
                default:
                    break;
            };
            this.setAggregation("_rule", oDisplayedControl, true);
        },

        _createRuleTypeSelector: function() {
            /*eslint consistent-this: ["error", "me"]*/
            var me = this;

            this.oBundle.getText('decisionTable');

            var oRuleTypesModel = new JSONModel({
                items: [{
                    key: library.RuleType.DecisionTable,
                    text: this.oBundle.getText('decisionTable')
                }]
            });

            var oRuleTypeSelector = new ComboBox({
                width: "25%",
                items: {
                    path: 'ruleTypes>/items',
                    template: new Item({
                        text: "{ruleTypes>text}",
                        key: "{ruleTypes>key}"
                    })
                },
                change: function(oEvent) {
                    var sRuleType = oEvent.getSource().getSelectedKey();
                    me._createDisplayedControl.call(me, sRuleType);
                }
            }).setModel(oRuleTypesModel, "ruleTypes");

            this.setAggregation("_ruleTypeSelector", oRuleTypeSelector, true);
        },

        setEditable: function(value) {
            this._internalModel.setProperty("/editable", value);
            return this.setProperty("editable", value, true);
        },
        setBindingContextPath: function(value, reload) {
            var oldValue = this.getBindingContextPath();
            if (reload || (value && (oldValue !== value))) {
                this.needRebind = true;
                this._internalModel.setProperty("/bindingContextPath", value);
                this._needReBind();
                return this.setProperty("bindingContextPath", value);
            }
        },
        setModelName: function(value) {
            this.needRebind = true;
            this._internalModel.setProperty("/modelName", value);
            return this.setProperty("modelName", value);
        },

        _setTextRuleConfigurationProperty: function(propertyName, value) {
            var sPath = "/textRuleConfiguration/" + propertyName;
            this._internalModel.setProperty(sPath, value);
        },

        setTextRuleConfiguration: function(oTextRuleConfiguration) {
            oTextRuleConfiguration.attachChange(function(oEvent) {
                this.getParent()._setTextRuleConfigurationProperty.call(this.getParent(), oEvent.getParameter("name"), oEvent.getParameter(
                    "value"))
            });

            this._setTextRuleConfigurationProperty("enableSettings", oTextRuleConfiguration.getEnableSettings());
            this._setTextRuleConfigurationProperty("enableSettingResult", oTextRuleConfiguration.getEnableSettingResult());
            this._setTextRuleConfigurationProperty("enableElse", oTextRuleConfiguration.getEnableElse());
            this._setTextRuleConfigurationProperty("enableElseIf", oTextRuleConfiguration.getEnableElseIf());

            return this.setAggregation("textRuleConfiguration", oTextRuleConfiguration, true)
        },

        _setDecisionTableConfigurationProperty: function(propertyName, value) {
            var sPath = "/decisionTableConfiguration/" + propertyName;
            this._internalModel.setProperty(sPath, value);
        },

        setDecisionTableConfiguration: function(oDecisionTableConfiguration) {
            oDecisionTableConfiguration.attachChange(function(oEvent) {
                this.getParent()._setDecisionTableConfigurationProperty.call(this.getParent(), oEvent.getParameter("name"), oEvent.getParameter(
                    "value"))
            });

            this._setDecisionTableConfigurationProperty("enableSettings", oDecisionTableConfiguration.getEnableSettings());
            this._setDecisionTableConfigurationProperty("enableSettingResult", oDecisionTableConfiguration.getEnableSettingResult());
            this._setDecisionTableConfigurationProperty("hitPolicies", oDecisionTableConfiguration.getHitPolicies());
            /**
                * @deprecated Since 1.52.8, use the attribute RuleFormat instead.
            */
            this._setDecisionTableConfigurationProperty("cellFormat", oDecisionTableConfiguration.getCellFormat());
            this._setDecisionTableConfigurationProperty("decisionTableFormat", oDecisionTableConfiguration.getDecisionTableFormat());
            this._setDecisionTableConfigurationProperty("visibleRowCount", oDecisionTableConfiguration.getVisibleRowCount());
			this._setDecisionTableConfigurationProperty("threshold", oDecisionTableConfiguration.getThreshold());

            return this.setAggregation("decisionTableConfiguration", oDecisionTableConfiguration, true)
        },

        setExpressionLanguage: function(oExpressionLanguage) {
            var oRule = this.getAggregation("_rule");
            if (oRule) {
                oRule.setExpressionLanguage(oExpressionLanguage);
            }
            return this.setAssociation("expressionLanguage", oExpressionLanguage, true);
        },
        
        setAstExpressionLanguage: function(oAstExpressionLanguage) {
            var oRule = this.getAggregation("_rule");
            if (oRule) {
                oRule.setAstExpressionLanguage(oAstExpressionLanguage);
            }
            return this.setAssociation("astExpressionLanguage", oAstExpressionLanguage, true);
        },

        resetControl: function () {     // Destroy the content
                
            var  oRuleAggregation  = this.getAggregation("_rule");
            if (oRuleAggregation) { 
                oRuleAggregation.destroy();
            }
        },

        _needReBind: function() {
            if (this.needRebind) {
                this.resetControl();
                var oRuleTypes = this.getTypes();
                if (oRuleTypes && oRuleTypes.length === 1) {
                    this._createDisplayedControl(oRuleTypes[0]);
                    this.needCreateDisplayedControl = false;
                }
                this.needRebind = false;
            }
        },

        onBeforeRendering: function() {
            this._needReBind();
        },
        
        renderer: RuleBuilderRenderer

    });

    return oRuleBuilder;

}, /* bExport= */ true);

/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */

// Provides control sap.rules.ui.DecisionTableConfiguration
sap.ui.define([
	"./library", 
	"sap/ui/core/Element"
], function(library, Element) {
	"use strict";

	/**
	 * Constructor for a new DecisionTableConfiguration.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The <code>sap.rules.ui.DecisionTableConfiguration</code>  element provides the ability to define specific properties that will be applied when rendering the <code>sap.rules.ui.RuleBuilder</code> in decision table mode.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version 1.141.0
	 *
	 * @constructor
	 * @public
	 * @since 1.4
	 * @alias sap.rules.ui.DecisionTableConfiguration
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DecisionTableConfiguration = Element.extend("sap.rules.ui.DecisionTableConfiguration", { 
	
		metadata : {
			library : "sap.rules.ui",
			properties : {
				/**
				 * The value determines the user input mode for the corresponding rule cells when creating or editing a rule.
				 * @deprecated Since 1.52.8, use the decisionTableFormat property.
				 */
				cellFormat: {
					type: "sap.rules.ui.DecisionTableCellFormat",
					defaultValue: library.DecisionTableCellFormat.Both,
					deprecated: true
				},
			    /**
				 * The value determines how the results of the decision table are evaluated when more than one rule is matched for a given set of inputs.
				 * @deprecated Since 1.120.2, to configure the settings, use the Manage Rules Project app or the Rule Authoring APIs.
				 */
				hitPolicies: {
					type: "sap.rules.ui.RuleHitPolicy[]",
					defaultValue: [library.RuleHitPolicy.FirstMatch, library.RuleHitPolicy.AllMatch]
				},
				//Specifies if the 'Settings' button is available in the toolbar of the decision table; the Settings button launches the Settings popup which allows the user creating the rule to configure the layout and columns of the decision table. 
				/**
				 * The value determines whether the Settings button is displayed in a decision table when the control is used with S/4 HANA 17.05 (Cloud) or 17.09 (On Premise) and higher (On Premise).
				 * @deprecated Since 1.120.2, to configure the settings, use the Manage Rules Project app or the Rule Authoring APIs.
				 */
				enableSettings: {
					type: "boolean",
					defaultValue: false 
				},
				/**
				 * @deprecated Since 1.120.2, to configure the settings, use the Manage Rules Project app or the Rule Authoring APIs.
				 */
				enableSettingResult: {
					type: "boolean",
					defaultValue: true 
				},
				
				/**
                 * The value determines whether the user can set the rendering of the decision Table to be based on cellFormat or rule Format
                 */
                 decisionTableFormat: {
                     type: "sap.rules.ui.DecisionTableFormat",
                     defaultValue: library.DecisionTableFormat.RuleFormat
                 },
				 /**
				  * The threshold defines how many additional (not yet visible records) shall be pre-fetched to enable smooth scrolling.
				  * The threshold is always added to the visibleRowCount. If the visibleRowCount is 10 and the threshold is 100, 
				  * there will be 110 records fetched with the initial load.
				  */
				 threshold: {
					 type: "int",
					 defaultValue: 30
				 },
 
				 /**
				  * Number of visible rows of the table.
				  */
				 visibleRowCount: {
					 type: "int",
					 defaultValue: 30
				 }
                 
			},
			events:{
				change:{
					parameters :{
						name:{},
						value:{}
					}
				}
			}
		},
		
		_handlePropertySetter: function(sPropertyName, value){
			var result = this.setProperty(sPropertyName, value, true);
			this.fireChange({name: sPropertyName, value: value});
			return result;
		},
		
		setCellFormat: function (sValue){
			return this._handlePropertySetter("cellFormat", sValue);	
		},
		
		setHitPolicies: function (aValue){
			return this._handlePropertySetter("hitPolicies", aValue);	
		},
		
		setEnableSettings: function(bValue){
			return this._handlePropertySetter("enableSettings", bValue);
		},
		setDecisionTableFormat: function(bValue){
            return this._handlePropertySetter("decisionTableFormat", bValue);
        },
        setEnableSettingResult: function(bValue){
			return this._handlePropertySetter("enableSettingResult", bValue);
		},
		setThreshold: function (iValue) {
			return this._handlePropertySetter("threshold", iValue);
		},
		setVisibleRowCount: function (iValue) {
			return this._handlePropertySetter("visibleRowCount", iValue);
		}
	});

	return DecisionTableConfiguration;

}, /* bExport= */ true);

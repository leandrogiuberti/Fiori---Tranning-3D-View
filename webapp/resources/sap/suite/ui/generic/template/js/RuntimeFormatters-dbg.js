sap.ui.define([
	"sap/base/i18n/Formatting", 
	"sap/ui/core/Locale",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/format/NumberFormat", 
	"sap/ui/core/message/MessageType", 
	"sap/m/RatingIndicator",
	"sap/suite/ui/generic/template/genericUtilities/FeLogger", 
	"sap/suite/ui/generic/template/genericUtilities/testableHelper", 
	"sap/suite/ui/generic/template/genericUtilities/utils",
        "sap/base/security/encodeXML"
], function (
	Formatting,
	Locale,
	DateFormat,
	NumberFormat,
	MessageType,
	RatingIndicator,
	FeLogger,
	testableHelper,
	utils,
        encodeXML
) {
	"use strict";

	var oLogger = new FeLogger("js.RuntimeFormatters").getLogger();

	/* Very specific case of formatters: Only put formatters here, that
	 * - are intended to run at runtime
	 * - need to know the control they are bound to (provided as this) or
	 * - may be used in more then one floorplan
	 * 
	 * In general, formatters should be located
	 * - in (general or better use case specific) AnnotationHelper, if they are intended to be used at templating time (i.e. they depend only on information available at that time,
	 * 		like device, metaModel (incl. annotations), manifest (or more general, anything part of the parameter model) 
	 * - in controllerImplementation (formatters in return structure of getMethods), if they are intended to run at runtime (i.e. they depend on information only available and possibly
	 * 		changeable at runtime, like OData model, ui model, _templPriv model) and are only used within a single floorplan.
	*/
	
	
	function getSmartTableControl(oElement){
		while (!oElement.getEntitySet){
			oElement = oElement.getParent();
		}
		return oElement;
	}

	function getLineItemQualifier(oControl) {
		var aControlCustomData = oControl.getCustomData();
		var oCustomData = aControlCustomData.find(function(oCandidate){
			return oCandidate.getKey() === "lineItemQualifier";
		});
		return oCustomData && oCustomData.getValue();
	}

	function getCriticality(oRow, oRowContext){
		var oModel = oRowContext.getModel();
		var oMetaModel = oModel.getMetaModel();
		var oControl = getSmartTableControl(oRow.getParent());
		var oEntitySet = oMetaModel.getODataEntitySet(oControl.getEntitySet());
		var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
			//getting the lineItem annotations for the current table
		var oLineItemAnnotation = oEntityType["com.sap.vocabularies.UI.v1.LineItem"];
			//getting the Criticality object.
		var oCriticalityAnnotation = oEntityType["com.sap.vocabularies.UI.v1.LineItem@com.sap.vocabularies.UI.v1.Criticality"];
			//checking if the given table's lineItem has a qualifier defined.
		var sLineItemQualifier = getLineItemQualifier(oControl);
		if (sLineItemQualifier) {
			oCriticalityAnnotation = oEntityType["com.sap.vocabularies.UI.v1.LineItem#" + sLineItemQualifier + "@com.sap.vocabularies.UI.v1.Criticality"];
		}
		if (oLineItemAnnotation && oCriticalityAnnotation){
			// Highlights the rows of tables with green/red/yellow if lineItem criticality is defined
			//check for setting dynamic highlight using Path
			if (oCriticalityAnnotation.Path){
				var sCriticalityPath = oCriticalityAnnotation.Path;
				var sRowCriticalityValue = oRowContext.getObject(sCriticalityPath);
				if (sRowCriticalityValue){
					switch (sRowCriticalityValue.toString()){
						case "0":
							return "None";
						case "1":
							return "Error";
						case "2":
							return "Warning";
						case "3":
							return "Success";
						default:
							break;
					}
				}
			} else if (oCriticalityAnnotation.EnumMember){
				//check for setting static highlight using EnumMember
				var sCriticalityEnum = oCriticalityAnnotation.EnumMember;
				if (sCriticalityEnum) {
					switch (sCriticalityEnum) {
						case "com.sap.vocabularies.UI.v1.CriticalityType/Neutral":
							return "None";
						case "com.sap.vocabularies.UI.v1.CriticalityType/Negative":
							return "Error";
						case "com.sap.vocabularies.UI.v1.CriticalityType/Critical":
							return "Warning";
						case "com.sap.vocabularies.UI.v1.CriticalityType/Positive":
							return "Success";
						default:
							break;
					}
				}
			}
		}
		return "None";
	}

	/** Utility methods */
	var oLocale;
	var oCurrencyFormatter;
	var oDateTimeFormatter;

	function getFormatLocale() {
		if (!oLocale) {
			oLocale = new Locale(Formatting.getLanguageTag());
		}
		return oLocale;
	}

	
	function getCurrencyFormatter() {
		if (!oCurrencyFormatter) {
			oCurrencyFormatter = NumberFormat.getCurrencyInstance();
		}
		return oCurrencyFormatter;
	}

	
	function getDateTimeFormatter() {
		if (!oDateTimeFormatter) {
			oDateTimeFormatter = DateFormat.getDateTimeInstance();
		}
		return oDateTimeFormatter;
	}

	// Expose selected private static functions to unit tests
	/* eslint-disable */
	var getLineItemQualifier = testableHelper.testableStatic(getLineItemQualifier, "RuntimeFormatters_getLineItemQualifier");
	var getSmartTableControl = testableHelper.testableStatic(getSmartTableControl, "RuntimeFormatters_getSmartTableControl");
	/* eslint-enable */	
	
	var oRuntimeFormatters = {

		setInfoHighlight: function (isActiveEntity, hasActiveEntity, bEditable) {
			var oRowContext = this.getBindingContext();
			if (!oRowContext){
				return "None";
			}
			
			var sMessage = "None";
			if (bEditable){
				var aMessage = oRowContext.getMessages();
				for (var i = 0; i < aMessage.length; i++){
					var oMessage = aMessage[i];
					var sType = oMessage.getType();
					if (sType === MessageType.Error){
						return "Error";
					}
					if (sType === MessageType.Warning){
						sMessage = "Warning";
					} else if (sType === MessageType.Information && sMessage !== MessageType.Warning){
						sMessage = "Information";
					}
				}

				if (oRowContext.isTransient() && !oRowContext.isInactive()) {
					return "Information";
				}
			}
			// Highlights the rows of tables with blue if it is a newly created draft item
			if (isActiveEntity === false && hasActiveEntity === false) {
				return sMessage === "None" ? "Information" : sMessage;
			}
			// merge message state (not error) and criticality
			var sCriticality = getCriticality(this, oRowContext);
			return (sCriticality === "Error" || sCriticality === "Warning" || sMessage === "None") ? sCriticality : sMessage;
		},		

		/**
		* Return the value for the navigated property of the row. Works for both FCL and non-FCL apps.
		* @param {string} sBindingPath of the row that is used to navigate to OP or Sub-OP
		* @return {boolean} true/false to set/unset the property
		*/
		setRowNavigated: function(sBindingPath) {
            // In case of UI tables, get the parent 'row' aggregation before fetching the binding context
			var oContext = this.getBindingContext() || this.getParent().getBindingContext();
			var sPath = oContext && oContext.getPath();
			return !!sPath && (sPath === sBindingPath);
		},

		formatImageUrl: function (sImageUrl, sAppComponentName, bSuppressIcons) {
			return utils.adjustImageUrlPath(sImageUrl, sAppComponentName, bSuppressIcons);
		},

		// returns the text for the Rating Indicator Subtitle (e.g. '7 reviews')
		formatRatingIndicatorSubTitle: function (iSampleSizeValue) {
			if (iSampleSizeValue) {
				var oResBundle = this.getModel("i18n").getResourceBundle();
				if (this.getCustomData().length > 0) {
					return oResBundle.getText("RATING_INDICATOR_SUBTITLE", [iSampleSizeValue, this.data("Subtitle")]);
				} else {
					var sSubTitleLabel = iSampleSizeValue > 1 ? oResBundle.getText("RATING_INDICATOR_SUBTITLE_LABEL_PLURAL") : oResBundle.getText("RATING_INDICATOR_SUBTITLE_LABEL");
					return oResBundle.getText("RATING_INDICATOR_SUBTITLE", [iSampleSizeValue, sSubTitleLabel]);
				}
			}
		},

		// returns the text for the Rating Indicator footer (e.g. '2 out of 5')
		// note: the second placeholder (e.g. "5") for the text "RATING_INDICATOR_FOOTER" can come one from the following:
		// i. if the Property TargetValue for the term UI.DataPoint is a Path then the value is resolved by the method buildRatingIndicatorFooterExpression and passed to this method as 'targetValue'
		// ii. if the Property TargetValue is not a Path (i.e. 'Decimal') then we get the value from the control's Custom Data
		// iii. if neither i. or ii. apply then we use the default max value for the sap.m.RatingIndicator control
		formatRatingIndicatorFooterText: function (value, targetValue) {
			if (!value) {
				return "";
			}	
			var oResBundle = this.getModel("i18n").getResourceBundle();
			targetValue = targetValue 
				|| this.data("Footer") 
				|| RatingIndicator.getMetadata().getPropertyDefaults().maxValue;

			return oResBundle.getText("RATING_INDICATOR_FOOTER", [value, targetValue]);
		},
		
		// returns the text for the Rating Indicator aggregated count (e.g. (243))
		formatRatingIndicatorAggregateCount: function (vValue) {
			var oResBundle = this.getModel("i18n").getResourceBundle();
			var sText = "";
			// If the input value is not provided, try to get value from "AggregateCount" custom data
			vValue = vValue || this.data("AggregateCount");
			if (vValue) {
				sText = oResBundle.getText("RATING_INDICATOR_AGGREGATE_COUNT", [vValue]);
			}

			return sText;
		},
		
		/**
		 * @param {string} sValue A string containing the value
		 * @param {string} sTarget A string containing the target value
		 * @param {string} sUoM A string containing the unit of measure
		 * @returns {string} A string containing the text that will be used in the display value of the Progress Indicator
		 */
		formatDisplayValueForProgressIndicator: function (sValue, sTarget, sUoM) {
			var sDisplayValue = "";
			if (sValue !== null && sValue !== undefined) {
				sValue = sValue.toString();
			}
			if (sTarget !== null && sTarget !== undefined) {
				sTarget = sTarget.toString();
			}
			if (sValue) {
				var oControl = this;
				var oResourceBundle = oControl.getModel("i18n").getResourceBundle();
				var aCustomData = oControl.getCustomData();
				var oLocale = getFormatLocale();
				sValue = NumberFormat.getInstance(oLocale).format(sValue);
				sTarget = sTarget || aCustomData.filter(function (oObject) {
					if (oObject.getKey() === "Target") {
						return oObject;
					}
				});
				sTarget = typeof (sTarget) === "object" ? (sTarget[0] && sTarget[0].getValue()) : sTarget;

				sUoM = sUoM || aCustomData.filter(function (oObject) {
					if (oObject.getKey() === "UoM") {
						return oObject;
					}
				});
				sUoM = typeof (sUoM) === "object" ? (sUoM[0] && sUoM[0].getValue()) : sUoM;
				if (sUoM) {
					if (sUoM === '%') { // uom.String && uom.String === '%'
						sDisplayValue = oResourceBundle.getText("PROGRESS_INDICATOR_DISPLAY_VALUE_UOM_IS_PERCENT", [sValue]);
					} else {// (uom.String and not '%') or uom.Path
						if (sTarget) {
							sTarget = NumberFormat.getInstance(oLocale).format(sTarget);
							sDisplayValue = oResourceBundle.getText("PROGRESS_INDICATOR_DISPLAY_VALUE_UOM_IS_NOT_PERCENT", [sValue, sTarget, sUoM]);
						} else {
							sDisplayValue = oResourceBundle.getText("PROGRESS_INDICATOR_DISPLAY_VALUE_UOM_IS_NOT_PERCENT_NO_TARGET_VALUE", [sValue, sUoM]);
						}
					}
				} else {
					if (sTarget) {
						sTarget = NumberFormat.getInstance(oLocale).format(sTarget);
						sDisplayValue = oResourceBundle.getText("PROGRESS_INDICATOR_DISPLAY_VALUE_NO_UOM", [sValue, sTarget]);
					} else {
						sDisplayValue = sValue;
					}
				}
			} else { // Cannot do anything
				oLogger.warning("Value property is mandatory, the default (empty string) will be returned");
			}

			return sDisplayValue;
		},
		formatDate: function (oDate) {
			return getDateTimeFormatter().format(oDate);
		},
		/**
		 * Formats the given amount and currency
		 * 
		 * @param {number|string} vAmount 
		 * @param {string} sCurrency 
		 * @returns {string}
		 */
		formatCurrency: function (vAmount, sCurrency) {
			return getCurrencyFormatter().format(vAmount, sCurrency);
		},

		/**
		 * Determines what text to be displayed for draft objects without title 
		 * 
		 * @param {boolean} hasActiveEntity
		 * @param {boolean} isActiveEntity 
		 * @param {boolean} newObject , i18n text for newly created draft object
		 * @param {boolean} unnamedObject , i18n text for active object
		 * @returns {string}
		 */

		getDraftObjectDisplayText: function (hasActiveEntity, isActiveEntity, newObject, unnamedObject) {
			var oComponent = sap.ui.core.Component.getOwnerComponentFor(this);
			// When both HasActiveEntity and IsActiveEntity are false, it indicates a new object.
			// In this case, display the text 'New Object' or the app-specific override text for the key 'NEW_OBJECT' if available.
			// Otherwise, if it's an active entity, display 'Unnamed Object' or the override text for the key 'UNNAMED_OBJECT' if provided by the app.		
			var text = (!hasActiveEntity && !isActiveEntity) ? newObject : unnamedObject;

			// As a fallback to maintain backward compatibility, if the app already defines the 'NEW_OBJECT' key (from previous behavior),
			// use the app-specific overridden text for both newly created objects and active objects.
			if (oComponent) {
				var oModelApplicationListReport = oComponent.getAppComponent().getModel("i18n|" + oComponent.getMetadata().getComponentName() + "|" + oComponent.getEntitySet());
				var oModelApplication = oComponent.getAppComponent().getModel("i18n");
				var bHasAppNewObjectText = ((oModelApplication ? oModelApplication.getResourceBundle().hasText("NEW_OBJECT") : false) || (oModelApplicationListReport ? oModelApplicationListReport.getResourceBundle().hasText("NEW_OBJECT") : false));
				var bHasAppUnnamedObjectText = ((oModelApplication ? oModelApplication.getResourceBundle().hasText("UNNAMED_OBJECT") : false) || (oModelApplicationListReport ? oModelApplicationListReport.getResourceBundle().hasText("UNNAMED_OBJECT") : false));
				if (bHasAppNewObjectText && !bHasAppUnnamedObjectText) {
					var text = newObject;
				}

			}
			// Encode the text to ensure HTML special characters are escaped
			// This prevents XSS and rendering issues in HTML context
			return encodeXML(text);
		}
 
	};

	return oRuntimeFormatters;
}, /* bExport= */ true);

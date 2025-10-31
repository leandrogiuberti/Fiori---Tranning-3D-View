sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"../../library",
	"sap/ui/core/Control",
	"sap/m/List",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/DatePicker",
	"sap/m/DateTimePicker",
	"sap/m/TimePicker",
	"sap/ui/model/json/JSONModel",
	"sap/m/library",
	"sap/ui/core/CustomData",
	"sap/ui/model/Sorter",
	"sap/ui/core/LocaleData",
	"sap/rules/ui/Constants",
	"sap/rules/ui/AstExpressionBasic",
	"sap/rules/ui/services/AstExpressionLanguage",
	"sap/base/i18n/Formatting",
	"sap/base/i18n/date/CalendarType",
	"sap/ui/core/format/DateFormat",
	"sap/m/Link",
	"sap/m/Panel",
	"sap/m/ToolbarSpacer",
	"sap/ui/core/Lib",
	"sap/ui/core/Element",
	"./AutoSuggestionDateAndTimePanelRenderer"

], function (jQuery, library, Control, List, Dialog, Button, DatePicker, DateTimePicker, TimePicker, JSONModel, mobileLibrary, CustomData,
	Sorter,
	LocaleData, Constants, AstExpressionBasic, AstExpressionLanguage, Formatting, CalendarType, DateFormat, Link, Panel, ToolbarSpacer, coreLib, Element, AutoSuggestionDateAndTimePanelRenderer) {
	"use strict";

	var ListMode = mobileLibrary.ListMode;
	var autoSuggestionDateAndTimePanel = Control.extend("sap.rules.ui.ast.autoCompleteContent.AutoSuggestionDateAndTimePanel", {
		metadata: {
			library: "sap.rules.ui",
			properties: {
				reference: {
					type: "object",
					defaultValue: null,
				},
				data: {
					type: "object",
					defaultValue: null
				},
				dialogOpenedCallbackReference: {
					type: "object",
					defaultValue: null,
				},
				vocabularyInfo: {
					type: "object",
					defaultValue: null
				}
			},
			aggregations: {
				PanelLayout: {
					type: "sap.m.Panel",
					multiple: false
				}
			},
			associations: {

				astExpressionLanguage: {
					type: "sap.rules.ui.services.AstExpressionLanguage",
					multiple: false,
					singularName: "astExpressionLanguage"
				}

			},
			events: {}
		},

		init: function () {
			this.needCreateLayout = true;
			this.oBundle = coreLib.getResourceBundleFor("sap.rules.ui.i18n");
			this.vocabularyInfo = this.getVocabularyInfo();
			this.autoSuggestionData = this.getData();

			// Date instance which is used to convert the selected date from calendar control to short format
			var oLocale = Formatting.getLanguageTag();
			var oLocaleData = LocaleData.getInstance(oLocale);

			this.oFormatDate = DateFormat.getInstance({
					pattern: oLocaleData.getDatePattern('short'),
					calendarType: CalendarType.Gregorian
				},
				oLocale
			);
		},
		onBeforeRendering: function () {
			this._reference = this.getReference();
			this._dialogOpenedCallbackReference = this.getDialogOpenedCallbackReference();
			if (this.needCreateLayout) {
				var layout = this._createLayout();
				this.setAggregation("PanelLayout", layout, true);
				this.needCreateLayout = false;
			}
		},

		//creates calender control
		_createDateTimeDialog: function () {
			var that = this;
			var oLocale = Formatting.getLanguageTag();
			var oLocaleData = LocaleData.getInstance(oLocale);
			var dateFormatted = oLocaleData.getDatePattern('medium');
			var timeFormat = oLocaleData.getTimePattern('medium');
			var sValueFormat = dateFormatted + " " + timeFormat;
			
			if(this.dateContext){
				this._dateBusinessDataType = this.dateContext;
			}
			if (this._dateBusinessDataType === "D") {
				this.control = new DatePicker({
					width: "auto",
					type: "Date",
					valueFormat: dateFormatted
				});
			}

			if (this._dateBusinessDataType === "U") {
				var that = this;
				this.control = new DateTimePicker({
					width: "auto",
					valueFormat: sValueFormat
				});

			}

			this._oSelectNewDateDialog = new Dialog({
				title: this.oBundle.getText("calendarTitle"),
				content: [
					this.control
				],
				beginButton: new Button({
					text: this.oBundle.getText("okBtn"),
					enabled: true,
					press: function (oEvt) {
						var date = this._updateText(this.control);
						oEvt.oSource.mProperties.value = "'" + date + "'";
						that._reference(oEvt);
						that._setModal(false);
						that._oSelectNewDateDialog.close();
					}.bind(this)
				}),
				endButton: new Button({
					text: this.oBundle.getText("clsBtn"),
					press: function () {
						that._setModal(false);
						that._oSelectNewDateDialog.close();
					}.bind(this)
				})
			});
			this._dialogOpenedCallbackReference(true);
			this._setModal(true);
			this._oSelectNewDateDialog.open();

		},

		// Utility function to format date and timestamp
		_updateText: function (oCalendar) {
			var aSelectedDates = oCalendar._getInputValue();
			var formattedDate = this._getValidValue(aSelectedDates);
			return formattedDate; //aSelectedDates;//formattedDate;
		},

		_getValidValue: function (sValue) {
			var date, formatter;
			if(this.dateContext){
				this._dateBusinessDataType = this.dateContext;
			}
			if (this._dateBusinessDataType === "D") {
				date = new Date(sValue);
				formatter = DateFormat.getDateInstance({
					pattern: "yyyy-MM-dd"
				});
				return formatter.format(date);
			} else if (this._dateBusinessDataType === "U") {
				date = new Date(sValue);
				formatter = DateFormat.getDateTimeInstance({
					pattern: "yyyy-MM-dd'T'HH:mm:ss.sss'Z'"
				});
				return formatter.format(date);
			}
			return sValue;
		},

		_setModal: function (value) {
			var pop = Element.getElementById("popover");
			if (pop) {
				pop.setModal(value);
			}
		},

		_getDataBusinessDataType: function () {
			this._dateBusinessDataType = "";
			this.businessDataTypeList = this.getData().businessDataTypeList;
			for (var entry in this.businessDataTypeList) {
				if (this.businessDataTypeList[entry] === "D") {
					this._dateBusinessDataType = "D";
					this.showDate = true;
				}
				if (this.businessDataTypeList[entry] === "U") {
					this._dateBusinessDataType = "U";
					this.showTimeStamp = true;
				}
			}
			if(this.showDate && this.showTimeStamp){
				this.showDateAndTimeStamp = true;
			}
		},

		_createLayout: function () {
			var that = this;
			this._getDataBusinessDataType();
			if(this._dateBusinessDataType != "" && !this.showDateAndTimeStamp){
				return this._createEitherDateOrTimeBasedOnType();
			} else{
				return this._createBothDateAndTime();
			}
			
		},
		
		_createEitherDateOrTimeBasedOnType: function() {
			var that = this;
			if (this._dateBusinessDataType === "D") {
				this.textContent = this.oBundle.getText("select_date");
			} else if (this._dateBusinessDataType === "U") {
				this.textContent = this.oBundle.getText("select_date_time");
			} 
			this.content = new Link({
				wrapping: true,
				text: this.textContent,
				press: function (oEvent) {
					that._createDateTimeDialog();
				}
			});
			
			var dateAndTimePanel = new Panel({
				expandable: false,
				expanded: true,
				content: [this.content],
				width: "auto"
			})
			return dateAndTimePanel;
		},
		
		_createBothDateAndTime: function() {
			var that = this;
			this.dateContent = new Link({
				wrapping: true,
				text: this.oBundle.getText("select_date"),
				press: function (oEvent) {
					that.dateContext = "D";
					that._createDateTimeDialog();
				}
			});
			
			this.toolBarSpacer =	new ToolbarSpacer({width: "1em"});
			
			this.timeContent = new Link({
				wrapping: true,
				text: this.oBundle.getText("select_date_time"),
				press: function (oEvent) {
					that.dateContext = "U";
					that._createDateTimeDialog();
				}
			});
			
			var dateAndTimePanel = new Panel({
				headerText: this.oBundle.getText("dateTimePanelTitle"),
				expandable: true,
				expanded: false,
				width: "auto"
			})
			
			dateAndTimePanel.addContent(this.dateContent);
			dateAndTimePanel.addContent(this.toolBarSpacer);
			dateAndTimePanel.addContent(this.timeContent);
			return dateAndTimePanel;
		},
		renderer: AutoSuggestionDateAndTimePanelRenderer

	});

	return autoSuggestionDateAndTimePanel;
}, /* bExport= */ true);

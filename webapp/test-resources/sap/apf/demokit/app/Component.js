sap.ui.define([
	"sap/apf/base/Component",
	'sap/apf/demokit/app/helper/contextMediator',
	'sap/apf/demokit/app/helper/formatter',
	'sap/apf/demokit/app/model/initializeMockServer',
	"sap/ui/core/mvc/View",
	// the following imports aren't used directly but referred to in configuration
	'sap/apf/demokit/app/helper/preselectionFunction',
	'sap/apf/demokit/app/representation/stackedBarChart'
], function(
	ApfComponent,
	ContextMediator,
	formatter,
	initializeMockServer,
	View
) {
	"use strict";

	return ApfComponent.extend("sap.apf.demokit.app.Component", {
		metadata : {
			"manifest": "json",
			"config" : {
				"fullWidth" : true
			}
		},
		oApi : null,
		/**
		 * Initialize the application.
		 */
		init() {
			this.oComponentData = {};
			this.oComponentData.startupParameters = {
				"evaluationId" : [ "com.sap.apf.receivables.america" ]
			};
			const oMockServerHelper = initializeMockServer.getInstance();
			oMockServerHelper.startApplicationMockServer();
			oMockServerHelper.startPersistencyMockServer();
			oMockServerHelper.startSmartBusinessMockServer();
			oMockServerHelper.startApplicationAnnotationMockServer();
			oMockServerHelper.startPersistencyAnnotationMockServer();
			ApfComponent.prototype.init.apply(this, arguments);
		},
		/**
		 * Creates the application layout and returns the outer layout of APF.
		 *
		 * @returns {sap.ui.core.Control} The UI content (root control)
		 */
		createContent() {
			this.oApi = this.getApi();

			// Register callback to crate and add custom content once apf has been started
			this.getApi().setCallbackAfterApfStartup(() => this._createAndAddCustomContent());

			// Calling parent Component's createContent method.
			return ApfComponent.prototype.createContent.apply(this, arguments);
		},
		_createAndAddCustomContent() {
			Promise.all([
				View.create({
					viewName : "module:sap/apf/demokit/app/controls/view/exchangeRate.view",
					viewData : {
						oApi : this.oApi
					},
					width : "70%"
				}),
				View.create({
					viewName : "module:sap/apf/demokit/app/controls/view/reportingCurrency.view",
					viewData : {
						oApi : this.oApi
					}
				})
			]).then(([exchangeRateContent, currencyContent]) => {
				this.oApi.addMasterFooterContent(currencyContent);
				this.oApi.addMasterFooterContent(exchangeRateContent);
				formatter.getInstance(this.oApi);
			}).catch(function() {
				 // continue regardless of error
			});
		},
		exit() {
			ContextMediator.destroyInstance();
			formatter.destroyInstance();
			initializeMockServer.destroyInstance();
			ApfComponent.prototype.exit.apply(this, arguments);
		}
	});
});

sap.ui.define([
	"sap/ui/core/mvc/OverrideExecution"
], function (OverrideExecution) {
	"use strict";

	/**
	 * This class contains all extension functions that can be implemented by Application 
	 * developers in their extension code. Application developers should not override any methods
	 * outside this documentation.
	 * @namespace sap.suite.ui.generic.template.ObjectPage.controllerFrameworkExtensions
	 * @public
	 */

	return /** @lends sap.suite.ui.generic.template.ObjectPage.controllerFrameworkExtensions */ {
		metadata: {
			methods: {
				adaptNavigationParameterExtension: { "public": true, "final": false, overrideExecution: OverrideExecution.After },
				onBeforeRebindTableExtension: { "public": true, "final": false, overrideExecution: OverrideExecution.After },
				onListNavigationExtension: { "public": true, "final": false, overrideExecution: OverrideExecution.After },
				provideCustomStateExtension: { "public": true, "final": false, overrideExecution: OverrideExecution.After },
				applyCustomStateExtension: { "public": true, "final": false, overrideExecution: OverrideExecution.After },
				adaptTransientMessageExtension: { "public": true, "final": false, overrideExecution: OverrideExecution.After },
				onSaveAsTileExtension: { "public": true, "final": false, overrideExecution: OverrideExecution.After },
				beforeDeleteExtension: { "public": true, "final": false, overrideExecution: OverrideExecution.After },
				beforeSaveExtension: { "public": true, "final": false, overrideExecution: OverrideExecution.After },
				beforeLineItemDeleteExtension: { "public": true, "final": false, overrideExecution: OverrideExecution.After },
				onLeaveAppExtension: { "public": true, "final": false, overrideExecution: OverrideExecution.After },
				onChildOpenedExtension: { "public": true, "final": false, overrideExecution: OverrideExecution.After },
				onSubSectionEnteredExtension: { "public": true, "final": false, overrideExecution: OverrideExecution.After },
				beforeSmartLinkPopoverOpensExtension: { "public": true, "final": false, overrideExecution: OverrideExecution.After },
				onBeforeExportTableExtension: { "public": true, "final": false, overrideExecution: OverrideExecution.After },
				focusOnEditExtension: { "public": true, "final": false, overrideExecution: OverrideExecution.After },
                                modifyRelatedAppsSettings: { "public": true, "final": false, overrideExecution: OverrideExecution.After }
			}
		},

		/**
		 * This method is called by SAP Fiori elements on the initialization of View. Application developers  
		 * can override this method & perform internal setup in this hook. 
		 *  
		 * @protected
		 */
		onInit: function () { },

		/**
		* This method is called by SAP Fiori elements before triggering an external navigation. Application developers 
		* can override this method and programmatically adapt the parameters which are passed to the target application.
		* Application developers can use the oObjectInfo parameter to identify the navigation context and
		* modify the oSelectionVariant which contains the navigation parameters.
		* 
		* @param {sap.fe.navigation.SelectionVariant} oSelectionVariant - Selection variant object 
		* containing the information which needs to be passed to the target application
		* @param {object} oObjectInfo - Context object based on which the intent based navigation is triggered
		* @param {string} oObjectInfo.semanticObject - Semantic object used for the intend based navigation
		* @param {string} oObjectInfo.action - Action on the context for which the navigation is triggered
		* @protected
		*/
		adaptNavigationParameterExtension: function (oSelectionVariant, oObjectInfo) { },

		/**
		 * This method is called by SAP Fiori elements before binding a table. Application developers can
		 * override this method and programmatically modify parameters or filters before the table triggers  
		 * a query to retrieve data. Source property of the oEvent shall be used to determine table
		 * triggering the event
		 * 
		 * <b>Note: </b>This method is called only when a table is rebound, and not when it is refreshed.
		 *
		 * @param {sap.ui.base.Event} oEvent - The 
		 * {@link sap.ui.comp.smarttable.SmartTable.prototype.event:beforeRebindTable beforeRebindTable} event
		 * @protected
		 */
		onBeforeRebindTableExtension: function (oEvent) { },

		/**
		 * This method is called by SAP Fiori elements when a chevron navigation is triggered from a table. Application 
		 * developers can override this method and perform conditional (internal or external) navigation from different 
		 * rows of a table. Such custom navigation should be triggered via corresponding methods of 
		 * {@link sap.suite.ui.generic.template.extensionAPI.NavigationController NavigationController}.
		 * 
		 * @param {sap.ui.base.Event} oEvent - The press event fired when navigating from a row in the SmartTable. It 
		 * is recommended to ignore this parameter and use <code>oBindingContext</code> instead
		 * @param {sap.ui.model.Context} oBindingContext - The context of the corresponding table row
		 * @param {boolean} bReplaceInHistory - This parameter should be considered if the method triggers an internal 
		 * navigation. Pass this parameter to <code>oNavigationData.replaceInHistory</code> in this case
		 * 
		 * @returns {boolean} Method should return <code>true</code> if framework navigation should be suppressed 
		 * (that means: extension code has taken over navigation)
		 * @protected
		 */
		onListNavigationExtension: function (oEvent, oBindingContext, bReplaceInHistory) { },

		/**
		 * This method will be called by SAP Fiori elements before persisting the AppState. Application developers can
		 * override this method for persisting the state of custom controls. State of the custom controls
		 * should be stored in the oState object passed as a parameter to this method. To make a complete functionality,  
		 * this method should be overridden with <code>applyCustomStateExtension</code>.
		 * 
		 * @param {object} oState - Object which needs to enriched with the custom control state
		 * @protected
		 * @see {@link topic:89fa878945294931b15a581a99043005 Custom State Handling for Extended Apps}
		 */
		provideCustomStateExtension: function (oState) { },

		/**
		 * This method will be called by SAP Fiori elements while applying the AppState. The custom state object retrieved 
		 * from the AppState will be passed as a parameter to this method. Application developers can use this custom 
		 * state for restoring the state of the custom control.  To make a complete functionality, this method should be 
		 * overridden with <code>provideCustomStateExtension</code>. 
		 *
		 * @param {object} oState - Custom data containing the information
		 * @param {boolean} bIsSameAsLast - Set to True if the method is called for the same instance
		 * <b>Note: </b> In draft scenarios, this parameter will be set to true if the instance that is currently 
		 * displayed and the instance that was visited previously are semantically same but differ in their draft status 
		 * @protected
		 * @see {@link topic:89fa878945294931b15a581a99043005 Custom State Handling for Extended Apps}
		 */
		applyCustomStateExtension: function (oState, bIsSameAsLast) { },

		/**
		 * This method is called by SAP Fiori elements whenever the busy state is switched off. Application developers can
		 * override this method, access the message model and adapt the transient messages related to the component.
		 * 
		 * @protected
		 */
		adaptTransientMessageExtension: function () { },

		/**
		 * This method is called by SAP Fiori elements when the Share functionality is triggered. Application  
		 * developers can adapt the service URL passed as a parameter to this method. Adapted service URL will 
		 * be used in the 'Send Email' or 'Save as Tile' options.
		 * 
		 * @param {object} oShareInfo - Object containing the serviceURL
		 * @param {string} oShareInfo.serviceUrl - Service URL which is derived by SAP Fiori elements
		 * @protected
		 */
		onSaveAsTileExtension: function (oShareInfo) { },

		/**
		 * This method is called by SAP Fiori element when Delete button on the Object Page is clicked. Application 
		 * developers can override this method & perform additional checks before executing the delete operation. 
		 * Method is expected to return a Promise. To veto the delete operation, promise needs to be rejected 
		 * else resolved.
		 * 
		 * @returns {Promise} Promise object created by the extension, used for delete operation chaining
		 * @protected
		 */
		beforeDeleteExtension: function () { },

		/**
		 * This method is called by SAP Fiori elements when Save button is selected. Application developers can override 
		 * this method and perform a custom operation before executing the Save operation. The method is expected to return a 
		 * Promise. The save operation will be continued only once the promise is resolved. If the extension code would 
		 * like to veto the save operation, promise must be rejected. 
		 * Note that this function should <b>not</b> be used to implement any checks on the object to be saved, since all checks should
		 * be implemented by the backend logic. However, the implementation may display user interaction (dialog) requesting the
		 * user to enter additional data or confirmation. The returned Promise would be resolved if the user confirms the dialog
		 * and rejected if it is canceled.
		 * 
		 * @returns {Promise} Promise object created by the extension, used for Save operation chaining 
		 * @protected
		 */
		beforeSaveExtension: function () { },

		/**
		 * This method is called when the Delete operation is triggered on a table in the Object Page. Application 
		 * developers can override this method & perform additional checks before executing the delete operation. 
		 * Method is expected to return a Promise. Delete operation is executed only once the returned promise is 
		 * resolved. In case the extension code wants to veto the Delete operation, promise needs to be rejected. 
		 * Application developers can use <code>sUiElementId</code> property of the object passed as param to  
		 * identify the smart table where the Delete operation is being triggered.
		 * 
		 * @param {object} oBeforeLineItemDeleteProperties - Object containing the selected context for delete
		 * @param {string} oBeforeLineItemDeleteProperties.sUiElementId - Id of the smart table relevant for 
		 * Delete operation
		 * @param {Array} oBeforeLineItemDeleteProperties.aContexts - Array of the selected contexts
		 * @returns {Promise} Promise object created by the extension, used for Delete operation chaining
		 * @protected
		 */
		beforeLineItemDeleteExtension: function (oBeforeLineItemDeleteProperties) { },

		/**
		 * This method is called when the user leaves the app and this page has been displayed within the same app 
		 * session (this is the time since last opening the app) at least once.
		 * Moreover, it is called for all pages that have been displayed within some app session when the app is finally destroyed.
		 * @param {boolean} bIsDestroyed - If this parameter is true this app instance is destroyed. Otherwise it might
		 * be rewoken if the user navigates again to this app within the same FLP session
		 * @return {function} - Only relevant in case that <code>bIsDestroyed</code> is false. In this case Application
		 * developers can provide a function to be called when the same page is opened again (after the user has navigated back to the app).
		 * @protected
		 */
		onLeaveAppExtension: function (bIsDestroyed) { },

		/**
		 * This method should be implemented whenever application uses onListNavigationExtension for internal navigation. In this case the implementation of
		 * this method should provide an 'inverse' mapping to the transformation implemented within onListNavigationExtension.
		 * More precisely, the identification of a child page instance is passed to this function. The implementation of this function should provide information
		 * about the list item which has triggered the opening of the child page.
		 * @param {object} oSelectionInfo - Information about the child page instance opened last
		 * @param {string} [oSelectionInfo.pageEntitySet] The entity set identifying the child page which was opened last.
		 * Note: In case the child page has been defined without reference to OData this will be the routeName taken from the routingSpec.
		 * @param {string} [oSelectionInfo.path] The context path that was used for the last opened child page
		 * @param {string[]} [oSelectionInfo.keys] The array of keys (one on each hierarchy level) used for the last opened child page
		 * @param {function} fnSetPath - pass the binding path of the corresponding list item to this function if it is not identical to <code>oSelectionInfo.path</code>
		 * @protected
		 */
		onChildOpenedExtension: function (oSelectionInfo, fnSetPath) { },

		/**
		 * This method is called when the SubSection enters the Viewport first time for an ObjectPage.
		 * Method would be called again for the same SubSection only in case ObjectPage binding context is changed.
		 * Application developers could use this method to perform specific actions on the current SubSection children. 
		 * This enables the application to perform actions relevant to a specific section when it really comes to view 
		 * port. Control specific handling should be done in this method in case View LazyLoading is enabled.
		 * 
		 * @param {sap.uxap.ObjectPageSubSection} oSubSection - Reference to the ObjectPageSubSection cause for this method call
		 * @returns {void}
		 * @protected
		 */
		onSubSectionEnteredExtension: function (oSubSection) { },

		/**
		 * This method is called by SAP Fiori elements when a smart link in a table or form is clicked. Application developers
		 * can override this method and invoke the oParams.getSourceInfo method to find out the information about the 
		 * clicked smart link.
		 * 
		 * If the application expect the framework should not handle the <code>beforePopoverOpens</code> event,
		 * then this method should return true. Otherwise, framework will proceed with its handling.
		 * 
		 * @param {object} oParams Object containing the "getSourceInfo" method and the selection variant
		 * @param {sap.fe.navigation.SelectionVariant} oParams.oSelectionVariant - Selection variant object 
		 * containing the information which needs to be passed to the target application
		 * @param {function} [oParams.getSourceInfo] Returns an object contains information about the smart link
		 * @param {sap.ui.comp.navpopover.SmartLink} [oParams.getSourceInfo().smartLink] The smart link cliked by the user
		 * @param {sap.m.Column | sap.ui.table.Column} [oParams.getSourceInfo().column] The table column contains the smart link
		 * @param {sap.ui.comp.smarttable.SmartTable} [oParams.getSourceInfo().column] The smart table contains the smart link
		 * @returns {boolean} Method should return <code>true</code> if framework should not handle <code>beforePopoverOpens</code> event
		 * (that means: extension code will handle the event)
		 * @protected
		 */
		beforeSmartLinkPopoverOpensExtension: function (oParams) { },

		/**
		 * This method is called by SAP Fiori elements when the table data is getting exported.
		 * Application developers can override this method to add/remove the filters in the exported file.
		 * 
		 * To add new filter entries to the exported file, create an instance of {@link sap.ui.export.util.Filter}
		 * and add it to "oExportParams.filterSettings"
		 * 
		 * @param {object} oExportParams Object containing the table export info
		 * @param {sap.ui.export.util.Filter[]} oExportParams.filterSettings The filters in the exported file
		 * Note: Please make changes on "oExportParams.filterSettings" array only when "Include filter settings" is selected. 
		 * Otherwise, the changes will be ignored.
		 * @param {boolean} oExportParams.includeFilterSettings The value of "Include filter settings" checkbox
		 * @protected
		 */
		onBeforeExportTableExtension: function (oExportParams) { },

		/**
		 * SAP Fiori elements offers a generic implementation for function getContext() called by Joule.
		 * Additionally, the app context contains a custom object that an application developer can leverage to provide additional information relevant to the capability.
		 *
		 * @param {object} oContext - context object generated by Fiori elements
		 * @returns enhanced context object with custom properties
		 */
		getContext: function (oContext) {
			return oContext;
		},

		/**
		* Extension point for the application to specify the control to focus on in the object page upon edit.
		*
		* @param {String} sSelectedSection - The ID of the selected section.
		* @returns {sap.ui.core.Control} - The control that needs to be focused.
		*
		* The returned control must meet the following criteria:
		* - Be focusable and have a "focus" property.
		* - Be visible within the viewport.
		*
		* If the returned control does not satisfy these conditions, the standard focus handling logic is executed.
		* @protected
		*/
		focusOnEditExtension: function (sSelectedSection) {
			return {};
		},

		/**
		 * An extension point in the application that allows modification of the related app settings.
		 * 
		 * This allows the application team to adjust the relevant application settings in accordance with the current semantics.
         *
         * @param {Object} oRelatedAppSetting - related app setting
         * @param {String} sCurrentSemanticObject - current semantic object for the app
		 * @returns {Object} modified related app setting
		 * @see {@link topic:8dcfe2e4555f49db8859cb6eb838692e Enabling the Related Apps Button}
		 */
        modifyRelatedAppsSettings: function(oRelatedAppSetting, sCurrentSemanticObject) {
            return oRelatedAppSetting;
        }
	};
});
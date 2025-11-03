sap.ui.define(
	["sap/ui/base/Object", 
	"sap/base/util/extend", 
	"sap/suite/ui/generic/template/genericUtilities/FeLogger", 
	"sap/suite/ui/generic/template/genericUtilities/controlHelper",
	"sap/suite/ui/generic/template/lib/SideEffectUtil",
	"sap/ui/comp/util/SharedUtil"],
	function(BaseObject, extend, FeLogger, controlHelper, SideEffectUtil, SharedUtil) {
		"use strict";
		/**
		 * API to be used in extensions of ObjectPage. Breakout coding can access an instance of this class via
		 * <code>this.extensionAPI</code>. Do not instantiate yourself.
		 * @class
		 * @name sap.suite.ui.generic.template.ObjectPage.extensionAPI.ExtensionAPI
		 * @public
		 */

		function getMethods(oTemplateUtils, oController, oBase, oState) {
			return /** @lends sap.suite.ui.generic.template.ObjectPage.extensionAPI.ExtensionAPI.prototype */ {
				/**
				 * Generally, this method returns the currently selected contexts in one ui element (table, chart, or list).
				 * In case the context menu is opened, it returns the contexts applicable to the context menu.
				 *
				 * @param {string} sUiElementId the id identifying the ui element the selected context is requested for
				 * @return {sap.ui.model.Context[]} contains one entry per entry selected
				 * @public
				 */
				getSelectedContexts: function(sUiElementId) {
					var oControl = oController.byId(sUiElementId);
					var oPresentationControl = oTemplateUtils.oCommonUtils.getOwnerPresentationControl(oControl);
					// This focus info is added to state by sap.suite.ui.generic.template.lib.ContextMenuHandler when the context menu is opened
					// If the state contains focus info, return the contexts applicable for context menu
					if (oState.oFocusInfo && oState.oFocusInfo.smartControlId === oPresentationControl.getId()) {
						return oState.oFocusInfo.applicableContexts;
					}
					return oTemplateUtils.oServices.oPresentationControlHandlerFactory.getPresentationControlHandler(oPresentationControl).getSelectedContexts();
				},
				
				/**
				 * Defines a control to be the <b>title owner</b> for its subsection.
				 * As the title owners of standard subsections are determined automatically it is recommended to use this function for
				 * custom subsections and embedded components only.
				 * The title owner should be a control possessing properties <i>header</i> and <i>headerLevel</i> and <i>headerStyle</i> (like {@link sap.ui.comp.smarttable.SmartTable} and {@link sap.ui.comp.smartchart.SmartChart}) or <i>text</i> and <i>level</i> and <i>titleStyle</i> (like {@link sap.m.Title}).
				 * The framework will adapt the values of these properties to be aligned with the title which is shown in the anchor bar (or icon tab bar) for the subsection.
				 * Moreover, the title of the subsection (and if applicable also of the section) will be hidden in order to prevent redundant titles if the subsection possesses a title owner.<br>
				 * Note that this method should only be used in case that there exists one single suitable control which represents the complete content of the subsection or embedded component.
				 * @param {sap.ui.core.Control} the title owner of the subsection containing this control. The control must possess properties <i>header</i> and <i>headerLevel</i> and <i>headerStyle</i> or <i>text</i> and <i>level</i> and <i>titleStyle</i>. As a special case you can also
				 * pass a subsection itself which would remove a potential title owner from this subsection.
				 * @public
				 */
				setAsTitleOwner: function(oControl){
					oState.oSectionTitleHandler.setAsTitleOwner(oControl);
				},

				/**
				 * Rebinds the given SmartTable
				 *
				 * @param {string} sUiElementId the id identifying the control to refresh the binding
				 * @public
				 */
				rebind: function(sUiElementId){
					var oControl = oController.byId(sUiElementId);
					if (controlHelper.isSmartTable(oControl)) {
						oControl.rebindTable();
					}
				},
				/**
				 * Refreshes the specified control from the backend (currently only supported for tables) or the whole page.
				 * Note that this function must not be called on  non-draft pages while they are in edit mode.
				 *
				 * @param {string} sUiElementId the id identifying the control that should be refreshed. If the parameter is faulty the whole page is refreshed.
				 * @public
				 */
				refresh: function(sUiElementId) {
					var oView = oController.getView();
					if (!oTemplateUtils.oComponentUtils.isDraftEnabled()){
						var oUiModel = oView.getModel("ui");
						if (oUiModel.getProperty("/editable")){
							throw new Error("Refresh of non-draft page not possible while in edit mode");
						}
					}
					if (!sUiElementId || sUiElementId === oView.getId()){
						oTemplateUtils.oComponentUtils.refreshBinding(true);
						return;
					}
					var oControl = oController.byId(sUiElementId);
					if (oControl) {
						oTemplateUtils.oServices.oPresentationControlHandlerFactory.getPresentationControlHandler(oTemplateUtils.oCommonUtils.getOwnerPresentationControl(oControl)).refresh();
					}
				},

				/**
				 *  Returns the currently selected variant key on the table in the given object page section.
				 *
				 * @param {string} sSectionKey The object page section id in which the table is present.
				 * @returns {string} The currently selected variant key on the table.
				 * @public
				 */
				getQuickVariantSelectionKey: function(sSectionKey) {
					return oState.oMultipleViewsHandler.getSelectedKey(sSectionKey);
				},

				/**
				 *  Switches the table's view to the given variant key.
				 *
				 * @param {string} sSectionKey The object page section id in which the table is present.
				 * @param {string} sVariantKey The table variant key to be selected.
				 * @public
				 */
				setQuickVariantSelectionKey: function(sSectionKey, sVariantKey) {
					oState.oMultipleViewsHandler.setSelectedKey(sSectionKey, sVariantKey);
				},

				/**
				 * Get the transaction controller for editing actions on the page.
				 * Note that the methods provided by this transaction controller depend on whether the object supports drafts or not.
				 * @return {sap.suite.ui.generic.template.ObjectPage.extensionAPI.DraftTransactionController|sap.suite.ui.generic.template.ObjectPage.extensionAPI.NonDraftTransactionController}
				 * the transaction controller
				 * @function
				 * @public
				 */
				getTransactionController: oBase.extensionAPI.getTransactionControllerFunction(),
				/**
				 * Attaches a control to the current View. Should be called whenever a new control is created and used in the
				 * context of this view. This applies especially for dialogs, action sheets, popovers, ... This method cares
				 * for defining dependency and handling device specific style classes
				 *
				 * @param {sap.ui.core.Control} oControl the control to be attached to the view
				 * @public
				 */
				attachToView: function(oControl) {
					oTemplateUtils.oCommonUtils.attachControlToView(oControl);
				},
				/**
				 * Invokes multiple time the action with the given name and submits changes to the back-end.
				 *
				 * @param {string} sFunctionName The name of the function or action as expected by {@link sap.ui.model.odata.v2.ODataModel#callFunction}
				 * @param {Array.<sap.ui.model.Context>|sap.ui.model.Context} [vContext] The binding context(s) the function will be called for. To be omitted if the action is static.
				 * @param {map} [mUrlParameters] The URL parameters (name-value pairs) for the function or action. Only needed in special cases.
				 * @param {object} [oSettings] Additional settings
				 * @param {boolean} [oSettings.bInvocationGroupingChangeSet=false] Determines whether the common or unique changeset gets sent in batch
 		 	 	 * @param {string} [oSettings.sLabel=""] Optional label for the Function Import.
				 * * This label is only used when action is invoked in strict mode and HTTP 412 (Precondition Failed) handling is required.
 			 	 * * If not provided, the Function Import name is used as the default label.
 		 	 	 * @param {boolean} [oSettings.bStrict=false] Optional flag to indicate whether the action should be invoked in strict mode. Defaults to <code>false</code>.
				 * @returns {Promise} A <code>Promise</code> for asynchronous execution of the action, resolving to the same result as the <code>Promise</code>
				 * @throws {Error} Throws an error if the OData function import does not exist or the action input parameters are invalid
				 * @public
				 */
				invokeActions: function(sFunctionName, vContext, mUrlParameters, oSettings) {
					oSettings = Object.assign((oSettings || {}), {bSetBusy: true});
					return oTemplateUtils.oCommonUtils.invokeActionsForExtensionAPI(sFunctionName, vContext, mUrlParameters, oSettings, oState);
				},
				/**
				 * Attach a handler to the PageDataLoaded event.
				 * This event is fired each time the object page is navigated to or the object to be displayed is changed
				 * Note, that the event will not be fired before:
				 * <ul compact>
				 * <li>the navigation to the page has been completed
				 * <li>the header data of the object are available
				 * </ul>
				 * @param {function} fnFunction the handler function. Note that the event passed to this function possesses an attribute <code>context</code>
				 * which contains the current header context
				 * @public
				 */
				attachPageDataLoaded: function(fnFunction) {
					oTemplateUtils.oComponentUtils.attach(oController, "PageDataLoaded", fnFunction);
				},
				/**
				 * Detach a handler from the PageDataLoaded event
				 *
				 * @param {function} fnFunction the handler function
				 * @public
				 */
				detachPageDataLoaded: function(fnFunction) {
					oTemplateUtils.oComponentUtils.detach(oController, "PageDataLoaded", fnFunction);
				},
				/**
				 * Registers a filter provider for the the message popover
				 *
				 * @param {function} fnProviderCallback function which will be called each time a new context
				 * is set for the object page. The function should return an instance of sap.ui.model.Filter,
				 * an array of sap.ui.model.Filter or a Promise which resolves to one of these.
				 * @public
				 */
				registerMessageFilterProvider: function(fnProvider) {
					oBase.state.messageButtonHelper.registerMessageFilterProvider(fnProvider);
				},
				/**
				 * Get the navigation controller for navigation actions
				 *
				 * @return {sap.suite.ui.generic.template.extensionAPI.NavigationController} the navigation controller
				 * @public
				 * @function
				 */
				getNavigationController: oBase.extensionAPI.getNavigationControllerFunction(),

				/**
				 * Get the id of the view this extension api belongs to
				 *
				 * @return {string} the view id
				 * @public
				 * @function
				 */
				getViewId: function(){
					return oController.getView().getId();
				},

				/**
				 * Returns the global communication object for storing and accessing custom state information within the current app.
				 * This object can be used across components to share state information.
				 *
				 * @returns {object} The communication object.
				 * @public
				 */
				getCommunicationObject: function () {
					return oTemplateUtils.oComponentUtils.getCommunicationObject();
				},

				/**
				 * Secured execution of the given function. Ensures that the function is only executed when certain conditions
				 * are fulfilled.
				 *
				 * @param {function} fnFunction The function to be executed. Should return a promise that is settled after completion
				 * of the execution. If nothing is returned, immediate completion is assumed.
				 * @param {object} [mParameters] Parameters to define the preconditions to be checked before execution
				 * @param {object} [mParameters.busy] Parameters regarding busy indication
				 * @param {boolean} [mParameters.busy.set=true] Triggers a busy indication during function execution. Can be set to
				 * false in case of immediate completion.
				 * @param {boolean} [mParameters.busy.check=true] Checks whether the application is currently busy. Function is only
				 * executed if not. Has to be set to false, if function is not triggered by direct user interaction, but as result of
				 * another function, that set the application busy.
				 * @param {object} [mParameters.dataloss] Parameters regarding dataloss prevention
				 * @param {boolean} [mParameters.dataloss.popup=true] Provides a dataloss popup before execution of the function if
				 * needed (i.e. in non-draft case when model or registered methods contain pending changes).
				 * @param {boolean} [mParameters.dataloss.navigation=false] Indicates that execution of the function leads to a navigation,
				 * i.e. leaves the current page, which induces a slightly different text for the dataloss popup.
				 * @param {map} [mParameters.mConsiderObjectsAsDeleted] Tells the framework that objects will be deleted by <code>fnFunction</code>.
				 * Use the BindingContextPath as a key for the map. Fill the map with a <code>Promise</code> for each object which is to be deleted.
				 * The <code>Promise</code> must resolve after the deletion of the corresponding object or reject if the deletion is not successful.
				 * @param {string} [mParameters.sActionLabel] In case of custom actions, the title of the message popup is set to sActionLabel.
				 * @returns {Promise} A <code>Promise</code> that is rejected, if execution is prohibited, and settled equivalent to the one returned by fnFunction.
				 * @public
				 * @see {@link topic:6a39150ad3e548a8b5304d32d560790a Using the SecuredExecutionMethod}
				 */
				securedExecution: function(fnFunction, mParameters) {
					return oTemplateUtils.oCommonUtils.securedExecution(fnFunction, mParameters, oBase.state);
				},


				/**
				* Allow parent components to be refreshed on next activation
				* @param {int} iLevel - Number of parent components to be refreshed
								* 1 - Refresh the immediate parent component
								* Undefined or faulty - Refresh all parent components
				* @public
				*/
				refreshAncestors: function(iLevel) {
					var oComponent = oController.getOwnerComponent();
					if (iLevel < 0) {
						iLevel = null;
					}
					oTemplateUtils.oServices.oViewDependencyHelper.setParentToDirty(oComponent, undefined, iLevel);
				},

				/**
				 * Call this method to indicate that the state of custom controls has changed. This is only necessary when methods <code>provideCustomStateExtension</code>
				 * and <code>applyCustomStateExtension</code> have been overridden, such that the corresponding state can be stored and restored.
				 * @returns {Promise} A <code>Promise</code> that is resolved when the changed state is transferred to the URL and the corresponding busy session is ended.
				 * @public
				 * @see {@link topic:89fa878945294931b15a581a99043005 Custom State Handling for Extended Apps}
				 */
				onCustomStateChange: function(){
					return oTemplateUtils.oComponentUtils.stateChanged();
				},
				
				/**
				 * Provide an option for showing an own message in the message bar above an OP table or page header.
				 * 
				 * If you want to display message on page header then you should pass <code>oMessage</code> only keeping all other parameter as empty
				 * Note - Message bar on Page header will be shown only in display mode for dynamic header
				 * @param {object} [oMessage] custom message along with type to set on table. If this parameter is faulty an existing message will be removed.
				 * @param {string} oMessage.message message string to display
				 * @param {string} oMessage.type indicates type of message (sap/ui/core/message/MessageType)
				 *  whether it's MessageType.Success, MessageType.Warning, MessageType.Error or MessageType.Information.
				 * @param {string} [sSmartTableId] Id of the table for which message should be set.			 
				 * @param {array |string} [vTabKey]  If switching between different table views is enabled, this parameter can be used to identify the views which
				 * are affected by this call. Faulty values indicate that all views should be affected. Otherwise the value should either be one string or an array of strings
				 * identifying the affected variant items.
				 * @param {function} [onClose] A function that is called when the user closes the message bar. Note that the messages for all tabs specified via <code>vTabKey</code>
				 * will be considered to be obsolete when the user closes the message bar while one of them is active. 
				 * @public
				 */
				setCustomMessage: function (oMessage, sSmartTableId, vTabKey, onClose) {
					oState.oMessageStripHelper.setCustomMessage(oMessage, sSmartTableId, vTabKey, onClose);
				},
				

				/**
 				* Provides an option to Configures a side effect for custom field, the extension controller should be Implemented/Called from "onAfterRendering" method of table.
 				* Note: Navigation property is not supported.
				*
 				* @param {Object} oControl - The control object for the custom field.
 				* @param {String} sProperty - The name of the property associated with the custom field.
 				* @param {String} sEntitySet - The entity set to which the custom field belongs.
				* @returns {function} returns a call back function, And qualifier of the side effect should be passed.
				* Call back function need to be called from controls event-handler.
				* @experimental
				*/
				registerCustomFieldForSideEffect: function (oControl, sProperty, sEntitySet) {
					SideEffectUtil.registerCustomFieldForSideEffect(oControl, sProperty, sEntitySet, oController);
					return function (sFieldName) {
						SideEffectUtil.fieldGroupChangeRegister(oController.getOwnerComponent(), oTemplateUtils, sFieldName, sEntitySet);
					};
				},

				/**
 				* Provides an option to Configures a side effect for custom column, the extension API method should be Implemented/Called from "onAfterRendering" method.
 				* Note: Extension API only supported for Responsive/Grid table.
				*
 				* @param {Object} oTable - The control object for the custom column.
 				* @param {String} sProperty - The name of the property associated with the custom column.
 				* @param {String} sEntitySet - The entity set to which the custom column belongs.
				* @returns {function} returns a call back function, And qualifier of the side effect should be passed.
				* Call back function need to be called from controls(Custom control which inside the custom column) event-handler.
				* @experimental
				*/
				registerCustomColumnForSideEffect: function (oTable, sProperty, sEntitySet) {
					SideEffectUtil.registerCustomColumnForSideEffect(oTable, sProperty, sEntitySet, oController);
					return function (sFieldName) {
						SideEffectUtil.fieldGroupChangeRegister(oController.getOwnerComponent(), oTemplateUtils, sFieldName, sEntitySet);
					};
				}
			};
		}

		return BaseObject.extend("sap.suite.ui.generic.template.ObjectPage.extensionAPI.ExtensionAPI", {
			constructor: function(oTemplateUtils, oController, oBase, oState) {
				extend(this, getMethods(oTemplateUtils, oController, oBase, oState));
			}
		});
	});

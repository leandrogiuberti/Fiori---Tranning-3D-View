sap.ui.define(["sap/ui/base/Object", "sap/base/util/extend", "sap/suite/ui/generic/template/genericUtilities/controlHelper", "sap/suite/ui/generic/template/genericUtilities/FeLogger"
	], function(BaseObject, extend, controlHelper, FeLogger) {
		"use strict";
		var oLogger = new FeLogger("detailTemplates.DiscardEditHandler").getLogger();

		function getMethods(oController, oTemplateUtils, oViewProxy, oState) {
			// immutable variables initialized on creation or on demand
			var bIsDraft = oTemplateUtils.oComponentUtils.isDraftEnabled();
			var oCRUDActionHandler = oTemplateUtils.oComponentUtils.getCRUDActionHandler();
			var oBusyHelper = oTemplateUtils.oServices.oApplication.getBusyHelper();
			var oView = oController.getView();
			var oUiModel = oView.getModel("ui");
			var oTemplatePrivateModel = oTemplateUtils.oComponentUtils.getTemplatePrivateModel();
			var setCancelButtonEnabled = oTemplatePrivateModel.setProperty.bind(oTemplatePrivateModel, "/objectPage/cancelEnabled");
			var oConfirmationPopover;
			var oConfirmationPopoverPromise;

			// state variables

			var bIsConfirmationPopoverActive = false;
			var bIsCancelling = false;
			var fnCancellationConfirmed; // function that should be called, when the user has confirmed the cancellation
			var fnCancellationResult; // a function that either rejects or resolves the current process of cancellation. If this is truthy a cancelling process has been started

			if (bIsDraft && oTemplateUtils.oComponentUtils.getViewLevel() !== 1){ // in draft cases cancellation can only be done on root level.
				fnCancellationResult = Function.prototype;                               // This pretends that a cancellation request is already running, so all cancellation requests will be rejected
			}

			function fnFinshed(){
				fnCancellationResult();
				fnCancellationConfirmed = null;
				fnCancellationResult = null;
			}

			// this function cleans up the internal state if cancellation has ended successfully or unsuccessfully
			function fnCleanUpAfterCancellation(){
				bIsCancelling = false;
				if (bIsConfirmationPopoverActive){
					oConfirmationPopover.close(); // triggers fnFinshed to be called in the beforeClose event
				} else {
					fnFinshed();
				}
			}

			function fnOpenConfirmationPopover(oCancelButton, bIsCreate){
				if (!oConfirmationPopoverPromise) {
					oConfirmationPopoverPromise =  oTemplateUtils.oCommonUtils.getDialogFragmentAsync("sap.suite.ui.generic.template.fragments.DiscardEditPopover", {
						onDiscardConfirm: function() {
							if (!bIsConfirmationPopoverActive || bIsCancelling){
								return;
							}
							fnCancellationConfirmed();
							setCancelButtonEnabled(true);
						},
						beforeClose: function(){
							bIsConfirmationPopoverActive = false;
							if (!bIsCancelling){ // If cancelling is still going on fnFinished will be called by fnCleanUpAfterCancellation later
								fnFinshed();
							}
						},
						afterClose: function(){
							setCancelButtonEnabled(true);
							setTimeout(function(){ // give UI5 time to adapt
								// If the action has not been confirmed the focus should go back to the cancel button, unless the user has actively set the focus somewhere else.
								// Note that the Cancel button will have disappeared (and thus not be focussable) when the user has confirmed the cancellation 
								var oCurrentFocus = controlHelper.getControlWithFocus();
								if (oCurrentFocus && oCurrentFocus.isFocusable()){
									oLogger.debug("Discard draft is not confirmed. Focus will stay on " + oCurrentFocus.getId());
								} else if (oCancelButton.isFocusable()){
									oLogger.debug("Setting back focus on the Cancel button");
									controlHelper.focusUI5Control(oCancelButton);
								} else {
									oLogger.debug("Focus not set here. Should be handled elsewhere.");	
								}
							}, 0);
						}
					}, "discard", function(oFragment, oConfirmationModel){
						oConfirmationModel.setProperty("/placement", sap.m.PlacementType.Top); // initialization
					});
				}
				oConfirmationPopoverPromise.then(function (oDialog)	 {
					bIsConfirmationPopoverActive = true;
					oConfirmationPopover = oDialog;
					var oConfirmationModel = oConfirmationPopover.getModel("discard");
					var oCommonUtils = oTemplateUtils.oCommonUtils;
					if (bIsDraft && bIsCreate) {
						oConfirmationModel.setProperty("/text", oCommonUtils.getText("CANCEL_AND_DISCARD"));
					} else if (!bIsDraft && bIsCreate) {
						oConfirmationModel.setProperty("/text", oCommonUtils.getText("CANCEL_AND_DISCARD_ND"));
					} else {
						oConfirmationModel.setProperty("/text",oCommonUtils.getText("DISCARD_EDIT"));
					}
					setCancelButtonEnabled(false);
					oConfirmationPopover.openBy(oCancelButton);
				});

			}

			// returns a Promise that resolves to a function that performs the actions that should be done after a successfull cancel
			function getExecuteAfterCancelPromise() {
				if (bIsDraft){
					var oContext = oView.getBindingContext();
					return oTemplateUtils.oServices.oApplication.getNavigateAfterDraftCancelPromise(oContext).then(function(fnNavigate){
						return function(){ // this is the function that will be executed after successfull cancel
							oTemplateUtils.oServices.oViewDependencyHelper.setRootPageToDirty();
							oTemplateUtils.oServices.oViewDependencyHelper.unbindChildren(oController.getOwnerComponent());
							// Draft discard is a kind of cross navigation -> invalidate paginator info
							oTemplateUtils.oServices.oApplication.invalidatePaginatorInfo();
							fnNavigate();
						};
					});
				}
				// non draft case
				return Promise.resolve(function(){
					if (oUiModel.getProperty("/createMode")) {
						var oTempPrivGlobalModel = oController.getOwnerComponent().getModel("_templPrivGlobal");
						var oFCL = oTempPrivGlobalModel.getProperty("/generic/FCL");
						return (oFCL && oFCL.highestViewLevel === 1) ? oTemplateUtils.oServices.oNavigationController.navigateToRoot() : oTemplateUtils.oServices.oNavigationController.navigateBack();
					}
				});
			}

			function fnNeedsConfirmation(){
				return new Promise(function (fnResolve) {
					if (bIsDraft){
						var oContext = oView.getBindingContext();
						var sPath = oContext.getPath();
						oCRUDActionHandler.hasValidationMessageOnDetailsViews().then(function (bHasValidationMessageOnDetailsViews) {
							var bIsDraftModified = oTemplateUtils.oServices.oApplication.getIsDraftModified(sPath) || bHasValidationMessageOnDetailsViews;
							fnResolve(bIsDraftModified);
						});
					} else {
						// non draft case
						fnResolve(oTemplateUtils.oComponentUtils.isComponentDirty());
					}
				});
			}

			function isCreate(){
				if (bIsDraft){
					var oContext = oView.getBindingContext();
					var oEntity = oContext.getObject();
					var bIsCreateDraft = oEntity.hasOwnProperty("HasActiveEntity") && !oContext.getProperty("IsActiveEntity") && !oContext.getProperty(
						"HasActiveEntity");
					return bIsCreateDraft;
				}
				return oUiModel.getProperty("/createMode"); // non draft case
			}

			// this function is executed, when the editing of an entity is ended
			// This can either be via the cancel button or programmatically (in the second case parameter oCancelButton is faulty)
			// fnSetFocus can be a function that sets the focus after a successfull cancellation
			function fnDiscardEdit(oCancelButton, fnSetFocus){
				if (fnCancellationResult){ // do not discard while another discard is executed
					return Promise.reject();
				}
				if (!(oTemplateUtils.oComponentUtils.isComponentActive() && oUiModel.getProperty("/editable"))){
					return Promise.reject(); // Cancellation only possible in edit mode
				}
				var oRet = new Promise(function(fnResolve, fnReject){
					fnCancellationResult = fnReject; // until we have an explicit success every end of the cancellation process will be considered as a reject
					var oExecuteAfterCancelPromise = getExecuteAfterCancelPromise(); // determine what should be done after a successfull cancel. Since this possibly requires a backend request it is already started here
					var fnPerformCancellation = function(){
						if (oCancelButton && oBusyHelper.isBusy()){ // dialog case -> check for busy
							fnFinshed();
							return;
						}
						var fnExecuteCancellation = function(){ // This function is called, when we know that we really want to cancel (if confirmation is needed it has been given)
							bIsCancelling = true;
							var oCancellationPromise = oExecuteAfterCancelPromise.then(function(fnAfterCancellation){ // when we know, what we would do after a cancellation we start the cancellation
								var fnSuccess = function(){ // what to do if cancellation was successfull
									fnCancellationResult = fnResolve; // now the end of the process is considered as a resolve
									fnAfterCancellation(); // perform the after cancel navigation
									fnDisplayDiscardMessage();//display a discard draft message
									fnCleanUpAfterCancellation(); // clean up the state of this class
									if (fnSetFocus){
										oTemplateUtils.oServices.oApplication.setNextFocus(fnSetFocus);
									}
								};
								var oDiscardPromise; // will only be truthy in the draft case
								if (bIsDraft){
									oDiscardPromise = oTemplateUtils.oServices.oCRUDManager.discardDraft(oView.getBindingContext()).then(fnSuccess);
									oDiscardPromise.catch(fnCleanUpAfterCancellation);
								} else {
									fnSuccess(); // in non-draft case the cancel cannot fail
								}
								oTemplateUtils.oComponentUtils.cancelEdit(oDiscardPromise);
								return oDiscardPromise; // oCancellationPromise is only resolved when this Promise is resolved, provided it is truthy (draft case)
							});
							oBusyHelper.setBusy(oCancellationPromise);
						};
						//This function is responsible for showing the "Draft Discarded" or "Changes Discarded" confirmation text
						function fnDisplayDiscardMessage() {
							fnNeedsConfirmation().then(function (bNeedsConfirmation) { //checks if changes are made in the draft
								if (bNeedsConfirmation) { // Ensure this is a boolean check
									if (oUiModel.getProperty("/createMode")) { //if it is a "Create Draft"
										oTemplateUtils.oServices.oApplication.showMessageToast(oTemplateUtils.oCommonUtils.getText("ST_GENERIC_DRAFT_WITHOUT_ACTIVE_DOCUMENT_DELETED"));
									} else {
										oTemplateUtils.oServices.oApplication.showMessageToast(oTemplateUtils.oCommonUtils.getText("ST_GENERIC_DRAFT_WITH_ACTIVE_DOCUMENT_DELETED"));//if it is an "Edit Draft"
									}
								}
							});
						}
						fnNeedsConfirmation().then(function (bNeedsConfirmation) {
							if (oCancelButton && bNeedsConfirmation){
								fnCancellationConfirmed = fnExecuteCancellation;
								fnOpenConfirmationPopover(oCancelButton, isCreate());
							} else {
								fnExecuteCancellation();
							}
						});
					};
					oTemplateUtils.oServices.oApplication.performAfterSideEffectExecution(fnPerformCancellation);
				});
				oRet.catch(Function.prototype); // to prevent misleading error logs
				return oRet;
			}

			// public instance methods
			return {
				discardEdit: fnDiscardEdit
			};
		}

		return BaseObject.extend("sap.suite.ui.generic.template.detailTemplates.DiscardEditHandler", {
			constructor: function(oController, oTemplateUtils, oViewProxy, oState) {
				extend(this, getMethods(oController, oTemplateUtils, oViewProxy, oState));
			}
		});
	});

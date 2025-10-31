sap.ui.define(["sap/base/util/ObjectPath", "sap/ushell/ui/footerbar/AddBookmarkButton",
	"sap/suite/ui/commons/collaboration/ServiceContainer", "sap/ui/core/CustomData", 'sap/ui/performance/trace/FESRHelper', "sap/ui/core/Component",
	"sap/suite/ui/generic/template/lib/AdaptiveCardHelper", "sap/m/MenuItem", "sap/ui/core/Lib"
], function (ObjectPath, AddBookmarkButton, ServiceContainer, CustomData, FESRHelper, Component, AdaptiveCardHelper, MenuItem, Library) {
	"use strict";

	var ShareUtils = {};
	var oBookmarkButton;
	var oStoredController;

	// function that returns a Promise that resolves to the current url
	function getCurrentUrl(){
		// Here we have introduced probing as for test scenarios as sap.ushell is not present all the iframe cases
		var UShellContainer = sap.ui.require("sap/ushell/Container");
		return UShellContainer ? new Promise(function(fnResolve){
			UShellContainer.getFLPUrlAsync(true).done(function (sFLPUrl){
				fnResolve(sFLPUrl);
			});
		}) : Promise.resolve(document.URL);
	}

	ShareUtils.getCurrentUrl = getCurrentUrl;

	/**
	 * Pre-populates the given shareModel with localized texts so that they can be used in the ShareSheet fragment.
	 *
	 * @param {sap.ui.core.Control} fragment The fragment instance whose model is to be updated
	 * @param {sap.ui.model.json.JSONModel} shareModel The model instance to be updated
	 * @protected
	 * @static
	 */
	ShareUtils.setStaticShareData = function(fragment, shareModel) {
		var oResource = Library.getResourceBundleFor("sap.m");

		shareModel.setProperty("/emailButtonText", oResource.getText("SEMANTIC_CONTROL_SEND_EMAIL"));
		shareModel.setProperty("/jamButtonText", oResource.getText("SEMANTIC_CONTROL_SHARE_ON_WORK_ZONE"));

		var fnGetUser = ObjectPath.get("sap.ushell.Container.getUser");
		shareModel.setProperty("/jamVisible", !!fnGetUser && fnGetUser().isJamActive());

	};

	/**
	 * Opens a Sharing Dialog.
	 *
	 * @param {string} text The text of the sharing dialog
	 * @protected
	 * @static
	 */
	ShareUtils.openJamShareDialog = function(text) {
		getCurrentUrl().then(function(sCurrentUrl){
			Component.create({
				name: "sap.collaboration.components.fiori.sharing.dialog",
				settings: {
					object: {
						id: sCurrentUrl,
						share: text
					}
				}
			}).then(function(oShareDialog) {
				oShareDialog.open();
			});
		});
	};

	/**
	 * Instantiates and opens the ShareSheet fragment and merges its model data with the SaveAsTile data
	 * returned by the function getModelData of the fragment controller.
	 * It takes collaboration option from CollaborationHelper which gives list of options needed to show in menu.
	 *
	 * @param {sap.suite.ui.template.lib.CommonUtils} oCommonUtils The common utils instance providing common functionality
	 * @param {sap.ui.core.Control} oControlToOpenBy The control by which the popup is to be opened
	 * @param {object} oFragmentController A plain object serving as the share popup's controller
	 * @protected
	 * @static
	 */
	ShareUtils.openSharePopup = function(oCommonUtils, oControlToOpenBy, oFragmentController, oController) {
		var oShareActionSheet;
		oFragmentController.onCancelPressed = function() {
			oShareActionSheet.close();
		};
		if (oController) {
			oStoredController = oController;
		}

		oCommonUtils.getDialogFragmentAsync("sap.suite.ui.generic.template.fragments.ShareSheet", oFragmentController, "share", ShareUtils.setStaticShareData, true).then(function (oFragment) {
			oShareActionSheet = oFragment;
			var oShareModel = oShareActionSheet.getModel("share");
			oFragmentController.getModelData().then(function (oFragmentModelData) {
				oShareModel.setData(oFragmentModelData, true);
				ServiceContainer.getCollaborationServices().then(function (mResults) {
					this.addMenuItem(oShareModel, mResults.oTeamsHelperService, oShareActionSheet, oControlToOpenBy, mResults.oCMHelperService);
					}.bind(this));
			}.bind(this));
		}.bind(this));
	};

	ShareUtils.addMenuItem = function (oShareModel, oTeamsHelper, oShareActionSheet, oControlToOpenBy, oCollaborationManager) {
		var iIndexForCollaborationOptions = 2;
			if (!oShareModel.getProperty("/jamVisible")) {
				iIndexForCollaborationOptions = 1;
			}
		var oParams = {
			isShareAsCardEnabled: oShareModel.getProperty("/bEnableCollaborationShareAsCard")
		};
		var aItems = oTeamsHelper.getOptions(oParams);
		if (aItems.length > 0) {
			aItems.forEach(function (oMainMenuItem) {
				if (oMainMenuItem.subOptions && oMainMenuItem.subOptions.length > 1) {
					var aMenus = [];
					oMainMenuItem.subOptions.forEach(function (menuItem) {
						var oItem = new MenuItem({
							text: menuItem.text,
							icon: menuItem.icon,
							press: this.menuItemPress
						});
						oItem.addCustomData(new CustomData({
							key: "data",
							value: menuItem
						}));
						FESRHelper.setSemanticStepname(oItem, "press", menuItem.fesrStepName);
						aMenus.push(oItem);
					}.bind(this));
					oShareActionSheet.insertItem(new MenuItem({
						text: oMainMenuItem.text,
						icon: oMainMenuItem.icon,
						items: aMenus
					}), iIndexForCollaborationOptions);
				} else {
					var oItem = new MenuItem({
						text: oMainMenuItem.text,
						icon: oMainMenuItem.icon,
						press: this.menuItemPress
					});
					oItem.addCustomData(new CustomData({
						key: "data",
						value: oMainMenuItem
					}));
					FESRHelper.setSemanticStepname(oItem, "press", oMainMenuItem.fesrStepName);
					oShareActionSheet.insertItem(oItem, iIndexForCollaborationOptions);
				}
				iIndexForCollaborationOptions++;
			}.bind(this));
		}
		var oCMOptions = oCollaborationManager.getOptions();
		if (oCMOptions) {
			var oItem = new MenuItem({
				text: oCMOptions.text,
				icon: oCMOptions.icon,
				press: this.CollaborationButtonPress.bind(this, oCMOptions.press, oShareModel)
			});
			FESRHelper.setSemanticStepname(oItem, "press", oCMOptions.fesrStepName);
			oShareActionSheet.insertItem(oItem, iIndexForCollaborationOptions);
			iIndexForCollaborationOptions++;
		}
		oBookmarkButton = new AddBookmarkButton();
		oBookmarkButton.setCustomUrl(oShareModel.getProperty("/customUrl"));
		oBookmarkButton.setServiceUrl(oShareModel.getProperty("/serviceUrl"));
		oBookmarkButton.setTitle(oShareModel.getProperty("/shellTitle"));
		oBookmarkButton.setSubtitle(oShareModel.getProperty("/pageTitle"));
		oBookmarkButton.setTileIcon(oShareModel.getProperty("/icon"));
		oBookmarkButton.setDataSource({
			type: "OData",
			settings: {
				odataVersion: "2.0"
			}
		});
		//'Save as Tile' button is disabled when unified shell container not initialized
		oShareModel.setProperty("/tileVisible", oBookmarkButton.getEnabled());
		oShareModel.setProperty("/tileIcon", oBookmarkButton.getIcon());
		oShareModel.setProperty("/tileText", oBookmarkButton.getText());
		oShareActionSheet.openBy(oControlToOpenBy);
	};

	ShareUtils.CollaborationButtonPress = function (fnCallBackHandler, oShareModel) {
		var sCurrentURLPromise = getCurrentUrl();
		sCurrentURLPromise.then(function (sCurrentURL) {
			var sAppTitle = oShareModel && oShareModel.getProperty("/shellTitle");
			fnCallBackHandler(sAppTitle, sCurrentURL);
		});
	};

	/**
	 * Press handler for the Collaboration Helper Option.
	 * This method create Payload that need to pass for invoking Collaboration
	 * Option.
	 */
	ShareUtils.menuItemPress = function () {
		var oServicePromise = ServiceContainer.getServiceAsync();
		var UShellContainer = sap.ui.require("sap/ushell/Container");
		var oUrlParserPromise = UShellContainer && UShellContainer.getServiceAsync("URLParsing");
		var sCurrentURLPromise = getCurrentUrl();

		Promise.all([oServicePromise, oUrlParserPromise, sCurrentURLPromise]).then(function (aResults) {
			var oTeamsHelper = aResults[0];
			var oURLParser = aResults[1];
			var sCurrentURL = aResults[2];

			var oShareModel = this.getModel("share");
			var sAppTitle = "", sSubtitle = "";
			if (oShareModel.getProperty("/pageSubtitle") !== undefined) {
				sAppTitle = oShareModel.getProperty("/appTitle");
				sSubtitle = oShareModel.getProperty("/pageTitle") + (oShareModel.getProperty("/pageSubtitle").length > 0 ? ' - ' + oShareModel.getProperty("/pageSubtitle") : '');
			} else {
				sAppTitle = oShareModel.getProperty("/shellTitle");
			}
			var data = {
				url: sCurrentURL,
				appTitle: sAppTitle,
				subTitle: sSubtitle,
				minifyUrlForChat: true,
				appId: oShareModel.getProperty("/appId"),
				cardId: '',
				cardManifest: {}
			};
			if (this.getCustomData()[0].getValue().key === "COLLABORATION_MSTEAMS_CARD") {
				if (oTeamsHelper.isFeatureFlagEnabled()) {
					var oDtCardManifest = oShareModel.getProperty("/oDtCardManifest");
					if (oDtCardManifest) {
						data.cardManifest = oDtCardManifest;
					} else {
						var oComponent = oStoredController.getOwnerComponent();
						var oAdaptiveCardJson = AdaptiveCardHelper.createAdaptiveCard("HeaderInfo", {
							appTitle: oShareModel.getProperty("/shellTitle"),
							objectTitle: oShareModel.getProperty("/pageTitle"),
							objectSubtitle: oShareModel.getProperty("/pageSubtitle"),
							url: oShareModel.getProperty("/currentUrl"),
							controller: oStoredController,
							component: oComponent
						});
						data.cardManifest = oAdaptiveCardJson;
					}
					if (oURLParser) {
						var oURL = oURLParser.parseShellHash(data.url.substring(data.url.indexOf('#')));
						data.cardId = oURL.semanticObject + "_" + oURL.action;
					}
				}
			}
			oTeamsHelper.share(this.getCustomData()[0].getValue(), data);
		}.bind(this));
	};

	/**
	 * Opnes Save as Tile Dialog
	 */
	ShareUtils.fireBookMarkPress = function() {
        oBookmarkButton.firePress();
    };

	/**
	 * Get custom URL for creating a new tile.
	 *
	 * @returns {string} The custom URL
	 * @protected
	 * @static
	 */
	ShareUtils.getCustomUrl = function() {
		if (!window.hasher) {
			sap.ui.require("sap/ui/thirdparty/hasher");
		}

		var sHash = window.hasher.getHash();
		return sHash ? ("#" + sHash) : window.location.href;
	};

	return ShareUtils;
});

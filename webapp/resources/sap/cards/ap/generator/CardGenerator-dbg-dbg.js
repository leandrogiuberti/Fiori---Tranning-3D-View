/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
"use strict";

sap.ui.define(["sap/base/Log", "sap/cards/ap/common/helpers/ApplicationInfo", "sap/cards/ap/common/services/RetrieveCard", "sap/m/MessageBox", "sap/ui/core/Fragment", "sap/ui/core/Lib", "sap/ui/model/json/JSONModel", "sap/ui/model/resource/ResourceModel", "./app/CardGeneratorDialogController", "./config/PreviewOptions", "./helpers/CardGeneratorModel", "./helpers/IntegrationCardHelper", "./pages/Application", "./pages/FreeStyle", "./pages/ObjectPage"], function (Log, sap_cards_ap_common_helpers_ApplicationInfo, sap_cards_ap_common_services_RetrieveCard, MessageBox, Fragment, CoreLib, JSONModel, ResourceModel, ___app_CardGeneratorDialogController, ___config_PreviewOptions, ___helpers_CardGeneratorModel, ___helpers_IntegrationCardHelper, ___pages_Application, ___pages_FreeStyle, ___pages_ObjectPage) {
  "use strict";

  function _catch(body, recover) {
    try {
      var result = body();
    } catch (e) {
      return recover(e);
    }
    if (result && result.then) {
      return result.then(void 0, recover);
    }
    return result;
  }
  const AppType = sap_cards_ap_common_helpers_ApplicationInfo["AppType"];
  const getApplicationFloorplan = sap_cards_ap_common_helpers_ApplicationInfo["getApplicationFloorplan"];
  const getObjectPageCardManifestForPreview = sap_cards_ap_common_services_RetrieveCard["getObjectPageCardManifestForPreview"];
  const CardGeneratorDialogController = ___app_CardGeneratorDialogController["CardGeneratorDialogController"];
  const setValueStateForAdvancedPanel = ___app_CardGeneratorDialogController["setValueStateForAdvancedPanel"];
  const PREVIEW_OPTIONS = ___config_PreviewOptions["PREVIEW_OPTIONS"];
  const getCardGeneratorDialogModel = ___helpers_CardGeneratorModel["getCardGeneratorDialogModel"];
  const createCardManifest = ___helpers_IntegrationCardHelper["createCardManifest"];
  const renderCardPreview = ___helpers_IntegrationCardHelper["renderCardPreview"];
  const updateCardGroups = ___helpers_IntegrationCardHelper["updateCardGroups"];
  const Application = ___pages_Application["Application"];
  const FreeStyle = ___pages_FreeStyle["FreeStyle"];
  const ObjectPage = ___pages_ObjectPage["ObjectPage"];
  var CardTypes = /*#__PURE__*/function (CardTypes) {
    CardTypes["INTEGRATION"] = "integration";
    CardTypes["ADAPTIVE"] = "adaptive";
    return CardTypes;
  }(CardTypes || {});
  let cardGeneratorDialog;

  /**
   * Initializes the card generator asynchronously.
   * Determines the application floorplan and validates card generation.
   * If card generation is not valid, displays a warning message.
   * Otherwise, initializes the card generator dialog.
   *
   * @param {Component} appComponent - The root component of the application.
   * @returns {Promise<void>} - A promise that resolves when the initialization is complete.
   */
  const initializeAsync = function (appComponent) {
    try {
      function _temp2() {
        const isValidConfiguration = applicationInstance.validateCardGeneration();
        if (!isValidConfiguration) {
          const resourceModel = getResourceModelForDialog();
          const warningMsg = resourceModel.getObject("GENERATE_CARD_NOT_SUPPORTED");
          MessageBox.warning(warningMsg, {
            actions: MessageBox.Action.OK,
            emphasizedAction: MessageBox.Action.OK
          });
          return;
        }
        return Promise.resolve(initializeCardGeneratorDialog(appComponent));
      }
      const applicationFloorplan = getApplicationFloorplan(appComponent);
      let applicationInstance;
      const _temp = function () {
        if (applicationFloorplan === AppType.ObjectPage) {
          applicationInstance = ObjectPage.createInstance(appComponent);
        } else {
          applicationInstance = FreeStyle.createInstance(appComponent);
          return Promise.resolve(applicationInstance.updateObjectContextFreeStyleModel()).then(function () {});
        }
      }();
      return Promise.resolve(_temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  /**
   * Applies models to the card generator dialog.
   *
   * This function sets up various models for the dialog, including the i18n model, preview options model,
   * and the freeStyle model. It also fetches and sets the card generator dialog model.
   *
   * @param {Dialog} dialog - The dialog to which the models will be applied.
   * @param {Component} appComponent - The root component of the application.
   * @param {CardManifest} [cardManifest] - The card manifest to be used for creating the card.
   * @returns {Promise<void>} - A promise that resolves when the models have been applied to the dialog.
   */
  const applyModelsToDialog = function (dialog, appComponent, cardManifest) {
    try {
      const applicationInstance = Application.getInstance();
      const entityRelatedInfo = applicationInstance.getEntityRelatedInfo();
      if (!dialog.getModel("i18n")) {
        const resourceModel = getResourceModelForDialog();
        dialog.setModel(resourceModel, "i18n");
      }
      if (!dialog.getModel("previewOptions")) {
        const previewOptionsModel = new JSONModel(PREVIEW_OPTIONS);
        dialog.setModel(previewOptionsModel, "previewOptions");
      }
      const freeStyleModel = applicationInstance instanceof FreeStyle ? applicationInstance.getFreeStyleModelForDialog() : new JSONModel({
        isServiceDetailsView: false,
        isApplyServiceDetailsEnabled: false
      });
      dialog.setModel(freeStyleModel, "freeStyle");
      const _temp3 = function () {
        if (entityRelatedInfo.entitySetWithObjectContext) {
          return Promise.resolve(getCardGeneratorDialogModel(appComponent, cardManifest)).then(function (dialogModel) {
            dialog.setModel(dialogModel);
            return Promise.resolve(createCardManifest(appComponent, cardManifest, dialogModel)).then(function (integrationCardManifest) {
              renderCardPreview(integrationCardManifest);
              updateCardGroups(dialogModel);
              setValueStateForAdvancedPanel();
              freeStyleModel.setProperty("/isServiceDetailsView", false);
            });
          });
        }
      }();
      return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(function () {}) : void 0);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  /**
   * Initializes the card generator dialog asynchronously.
   * Loads the card generator dialog fragment, fetches the card manifest, and set the dialog model.
   * Opens the dialog and renders the card preview.
   *
   * @param {Component} appComponent - The root component of the application.
   * @returns {Promise<void>} - A promise that resolves when the dialog is initialized and opened.
   */
  const initializeCardGeneratorDialog = function (appComponent) {
    try {
      function _temp5() {
        cardGeneratorDialog.then(function (oDialog) {
          try {
            applyModelsToDialog(oDialog, appComponent, cardManifest);
            CardGeneratorDialogController.initialize();
            oDialog.open();
            const element = document.getElementById("cardGeneratorDialog--contentSplitter");
            if (element) {
              element.style.backgroundColor = "#f8f8f8";
            }
            return Promise.resolve(oDialog);
          } catch (e) {
            return Promise.reject(e);
          }
        }).catch(function (oError) {
          Log.error("Error while loading or initializing the dialog:", oError);
        });
      }
      if (!cardGeneratorDialog) {
        cardGeneratorDialog = Fragment.load({
          id: "cardGeneratorDialog",
          name: "sap.cards.ap.generator.app.CardGeneratorDialog",
          controller: CardGeneratorDialogController
        });
      }
      let cardManifest;
      const _temp4 = _catch(function () {
        return Promise.resolve(getObjectPageCardManifestForPreview(appComponent, {
          cardType: CardTypes.INTEGRATION,
          includeActions: false,
          hideActions: false,
          isDesignMode: true
        })).then(function (_getObjectPageCardMan) {
          cardManifest = _getObjectPageCardMan;
        });
      }, function () {
        Log.error("Error while fetching the card manifest.");
      });
      return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp5) : _temp5(_temp4));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  /**
   * Retrieves the resource model for the card generator dialog.
   * Loads the i18n resource bundle and creates a new ResourceModel.
   *
   * @returns {ResourceModel} - The resource model for the card generator dialog.
   */
  function getResourceModelForDialog() {
    const oResourceBundle = CoreLib.getResourceBundleFor("sap.cards.ap.generator.i18n");
    return new ResourceModel({
      bundleUrl: oResourceBundle.oUrlInfo.url,
      bundle: oResourceBundle //Reuse created bundle to stop extra network calls
    });
  }
  var __exports = {
    __esModule: true
  };
  __exports.initializeAsync = initializeAsync;
  __exports.initializeCardGeneratorDialog = initializeCardGeneratorDialog;
  __exports.getResourceModelForDialog = getResourceModelForDialog;
  return __exports;
});
//# sourceMappingURL=CardGenerator-dbg-dbg.js.map

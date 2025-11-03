/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
"use strict";

sap.ui.define(["sap/cards/ap/common/odata/ODataUtils", "../../helpers/CardGeneratorModel", "../../helpers/IntegrationCardHelper", "../../pages/Application", "../../utils/CommonUtils"], function (sap_cards_ap_common_odata_ODataUtils, ____helpers_CardGeneratorModel, ____helpers_IntegrationCardHelper, ____pages_Application, ____utils_CommonUtils) {
  "use strict";

  /**
   * Applies the service details.
   */
  const applyServiceDetails = function () {
    try {
      const appComponent = Application.getInstance().getRootComponent();
      const freeStyleDialogModel = getDialogModel("freeStyle");
      freeStyleDialogModel.setProperty("/isServiceDetailsView", false);
      const currentCardManifest = getCurrentCardManifest();
      const isEntityPathChanged = currentCardManifest ? freeStyleDialogModel.getProperty("/entitySet") !== currentCardManifest?.["sap.card"]?.configuration?.parameters?._entitySet?.value : freeStyleDialogModel.getProperty("/isEntityPathChanged");
      const isContextPathChanged = freeStyleDialogModel.getProperty("/isContextPathChanged");
      const cardManifest = Object.keys(currentCardManifest).length > 0 && !isEntityPathChanged ? currentCardManifest : undefined;
      const dialog = getCardGeneratorDialog();
      return Promise.resolve(getCardGeneratorDialogModel(appComponent, cardManifest)).then(function (dialogModel) {
        if (isEntityPathChanged || isContextPathChanged) {
          dialog?.setModel(dialogModel);
          freeStyleDialogModel.setProperty("/isEntityPathChanged", false);
          freeStyleDialogModel.setProperty("/isContextPathChanged", false);
        }
        return Promise.resolve(createCardManifest(appComponent, cardManifest, dialog?.getModel())).then(function (integrationCardManifest) {
          renderCardPreview(integrationCardManifest);
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Handles the context path change event.
   *
   * @param event
   */
  const onContextPathChange = function (event) {
    try {
      const freeStyleDialogModel = getDialogModel("freeStyle");
      freeStyleDialogModel.setProperty("/isApplyServiceDetailsEnabled", false);
      const applicationInstance = Application.getInstance();
      const control = event.getSource();
      const selectedContextPath = control.getValue();
      const _temp = function () {
        if (selectedContextPath) {
          return Promise.resolve(applicationInstance.fetchDataForObjectContext(selectedContextPath)).then(function () {
            freeStyleDialogModel.setProperty("/entitySetWithObjectContext", selectedContextPath);
            freeStyleDialogModel.setProperty("/isApplyServiceDetailsEnabled", true);
            freeStyleDialogModel.setProperty("/isContextPathChanged", true);
          });
        }
      }();
      return Promise.resolve(_temp && _temp.then ? _temp.then(function () {}) : void 0);
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Handles the entity set path change event.
   *
   * @param event
   */
  const onEntitySetPathChange = function (event) {
    try {
      const applicationInstance = Application.getInstance();
      const {
        rootComponent
      } = applicationInstance.fetchDetails();
      const control = event.getSource();
      const selectedEntitySet = control.getValue();
      const freeStyleDialogModel = getDialogModel("freeStyle");
      const serviceUrl = freeStyleDialogModel.getProperty("/currentService");
      freeStyleDialogModel.setProperty("/entitySet", selectedEntitySet);
      freeStyleDialogModel.setProperty("/entitySetWithObjectContext", "");
      freeStyleDialogModel.setProperty("/entitySetWithObjectContextList", []);
      freeStyleDialogModel.setProperty("/isApplyServiceDetailsEnabled", false);
      freeStyleDialogModel.setProperty("/isEntityPathChanged", true);
      return Promise.resolve(getEntitySetWithContextURLs(serviceUrl, selectedEntitySet, rootComponent.getModel())).then(function (entitySetWithContextList) {
        if (entitySetWithContextList?.length) {
          freeStyleDialogModel.setProperty("/entitySetWithObjectContextList", entitySetWithContextList);
        }
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
  const getEntitySetWithContextURLs = sap_cards_ap_common_odata_ODataUtils["getEntitySetWithContextURLs"];
  const getCardGeneratorDialogModel = ____helpers_CardGeneratorModel["getCardGeneratorDialogModel"];
  const createCardManifest = ____helpers_IntegrationCardHelper["createCardManifest"];
  const getCurrentCardManifest = ____helpers_IntegrationCardHelper["getCurrentCardManifest"];
  const renderCardPreview = ____helpers_IntegrationCardHelper["renderCardPreview"];
  const Application = ____pages_Application["Application"];
  const getCardGeneratorDialog = ____utils_CommonUtils["getCardGeneratorDialog"];
  const getDialogModel = ____utils_CommonUtils["getDialogModel"];
  /**
   * Handles the service change event.
   *
   * @param {Event} event - The event object triggered by the service change.
   */
  function onServiceChange(event) {
    const control = event.getSource();
    const selectedService = control.getValue();
    const freeStyleDialogModel = getDialogModel("freeStyle");
    freeStyleDialogModel.setProperty("/entitySet", "");
    freeStyleDialogModel.setProperty("/entitySetWithObjectContext", "");
    freeStyleDialogModel.setProperty("/currentService", selectedService);
    freeStyleDialogModel.setProperty("/isApplyServiceDetailsEnabled", false);
  }
  function onBackButtonPress() {
    const freeStyleDialogModel = getDialogModel("freeStyle");
    freeStyleDialogModel.setProperty("/isServiceDetailsView", true);
  }
  var __exports = {
    __esModule: true
  };
  __exports.applyServiceDetails = applyServiceDetails;
  __exports.onBackButtonPress = onBackButtonPress;
  __exports.onContextPathChange = onContextPathChange;
  __exports.onEntitySetPathChange = onEntitySetPathChange;
  __exports.onServiceChange = onServiceChange;
  return __exports;
});
//# sourceMappingURL=FreeStyle-dbg-dbg.js.map

/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/fl/changeHandler/condenser/Classification"], function (CondenserClassification) {
  "use strict";

  function getContainer(control) {
    return control.getItems().find(item => item.getMetadata().getName() === "sap.cux.home.NewsAndPagesContainer");
  }
  let debounceTimeout = null;
  const SetNewsFeedUrl = {
    applyChange: (change, control) => {
      const container = getContainer(control);

      // Debounce the newsPersonalization call
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      debounceTimeout = setTimeout(() => {
        container?.newsPersonalization(change.getContent());
      }, 0);
      return true;
    },
    revertChange: (change, control) => {
      const container = getContainer(control);
      let revertChanges = change.getContent();
      revertChanges.newsFeedURL = revertChanges.oldNewsFeedUrl;
      revertChanges.showCustomNewsFeed = revertChanges.oldShowCustomNewsFeed;
      revertChanges.customNewsFeedKey = revertChanges.oldCustomNewsFeedKey;
      revertChanges.showDefaultNewsFeed = revertChanges.oldshowDefaultNewsFeed;
      revertChanges.showRssNewsFeed = revertChanges.oldShowRssNewsFeed;
      container?.newsPersonalization(revertChanges);
    },
    completeChangeContent: () => {
      return;
    },
    getCondenserInfo: change => {
      return {
        affectedControl: change.getSelector(),
        classification: CondenserClassification.LastOneWins,
        uniqueKey: "newsFeedUrl"
      };
    }
  };
  return SetNewsFeedUrl;
});
//# sourceMappingURL=SetNewsFeedUrl-dbg.js.map

/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../i18n", "./SearchResultListItem", "./SearchText", "sap/ui/core/IconPool"], function (__i18n, __SearchResultListItem, __SearchText, IconPool) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const i18n = _interopRequireDefault(__i18n);
  const SearchResultListItem = _interopRequireDefault(__SearchResultListItem);
  const SearchText = _interopRequireDefault(__SearchText);
  /**
   * @namespace sap.esh.search.ui.controls
   */
  const SearchResultListItemNote = SearchResultListItem.extend("sap.esh.search.ui.controls.SearchResultListItemNote", {
    renderer: {
      apiVersion: 2
    },
    _renderContentContainer: function _renderContentContainer(oRm) {
      oRm.openStart("div", this.getId() + "-content");
      oRm.class("sapUshellSearchResultListItem-Content");
      oRm.openEnd();
      this._renderTitleContainer(oRm);
      this._renderAttributesContainer(oRm);
      oRm.close("div");
    },
    _renderTitleContainer: function _renderTitleContainer(oRm) {
      const oModel = this.getModel();
      if (!oModel.config.optimizeForValueHelp) {
        oRm.openStart("div", this.getId() + "-title-and-image-container");
        oRm.class("sapUshellSearchResultListItem-TitleAndImageContainer");
        oRm.openEnd();
      }
      oRm.openStart("div", this.getId() + "-title-container");
      oRm.class("sapUshellSearchResultListItem-TitleContainer");
      if (oModel.config.optimizeForValueHelp) {
        oRm.class("sapUshellSearchResultListItem-TitleContainerValueHelp");
      }
      oRm.openEnd();
      this._renderCheckbox(oRm);

      /// /// Title
      const titleURL = this.getProperty("titleUrl");
      const titleLink = this.getAggregation("_titleLink");
      titleLink.setHref(titleURL);
      titleLink.setText(this.getProperty("title"));
      if (titleURL.length === 0) {
        titleLink.setEnabled(false);
      }
      oRm.renderControl(titleLink);

      /// /// Object Type
      const typeText = this.getAggregation("_typeText");
      typeText.setText(this.getProperty("Type"));
      oRm.renderControl(typeText);
      oRm.close("div");
      if (!oModel.config.optimizeForValueHelp) {
        this._renderImageForPhone(oRm);
      }
      oRm.close("div");
    },
    _renderAttributesContainer: function _renderAttributesContainer(oRm) {
      oRm.openStart("div", this.getId() + "-attributes-expand-container");
      oRm.class("sapUshellSearchResultListItemDoc-AttributesExpandContainer");
      const expanded = this.getProperty("expanded");
      if (expanded) {
        oRm.class("sapUshellSearchResultListItem-AttributesExpanded");
      }
      oRm.openEnd();
      oRm.openStart("div", this.getId() + "-attributes-and-actions");
      oRm.class("sapUshellSearchResultListItem-AttributesAndActions");
      oRm.openEnd();
      oRm.openStart("ul", this.getId() + "-attributes");
      oRm.class("sapUshellSearchResultListItem-Attributes");
      oRm.openEnd();
      this._renderThumbnailSnippetContainer(oRm);
      this._renderDocAttributesContainer(oRm);

      // This is just a dummie attribute to store additional space information for the expand and collapse JavaScript function
      oRm.openStart("div", this.getId() + "-expand-spacer-attribute");
      oRm.class("sapUshellSearchResultListItem-ExpandSpacerAttribute");
      oRm.attr("aria-hidden", "true");
      oRm.openEnd();
      oRm.close("div");
      oRm.close("ul");
      this._renderRelatedObjectsToolbar(oRm);
      oRm.close("div");
      oRm.close("div");
    },
    _renderImageForPhone: function _renderImageForPhone(oRm) {
      if (this.getProperty("imageUrl") && this.getProperty("containsThumbnail") === true) {
        oRm.openStart("div", this.getId() + "-title-image");
        oRm.class("sapUshellSearchResultListItem-TitleImage");
        oRm.openEnd();
        oRm.openStart("div", this.getId() + "-image-container-alignment-helper");
        oRm.class("sapUshellSearchResultListItem-ImageContainerAlignmentHelper");
        oRm.openEnd();
        oRm.close("div");
        oRm.openStart("img", this.getId() + "-image");
        oRm.class("sapUshellSearchResultListItem-Image");
        oRm.attr("src", this.getProperty("imageUrl"));
        oRm.openEnd();
        oRm.close("img");
        oRm.close("div");
      }
    },
    _renderDocAttributesContainer: function _renderDocAttributesContainer(oRm) {
      oRm.openStart("div", this.getId() + "-attributes-container");
      oRm.class("sapUshellSearchResultListItemNote-AttributesContainer");
      oRm.openEnd();
      const itemAttributes = this.getProperty("attributes");
      this._renderAllAttributes(oRm, itemAttributes);
      oRm.close("div");
    },
    _renderThumbnailSnippetContainer: function _renderThumbnailSnippetContainer(oRm) {
      oRm.openStart("div", this.getId() + "-thumbnail-snippet-container");
      oRm.class("sapUshellSearchResultListItemNote-ThumbnailSnippetContainer");
      oRm.openEnd();
      this._renderSnippetContainer(oRm);
      oRm.close("div");
    },
    _renderSnippetContainer: function _renderSnippetContainer(oRm) {
      const itemAttributes = this.getProperty("attributes");
      for (let i = 0; i < itemAttributes.length; i++) {
        const itemAttribute = itemAttributes[i];
        if (itemAttribute.longtext) {
          const value = new SearchText(`${this.getId()}_snippet-${i}-longtext`);
          value.setText(itemAttribute.value);
          value.addStyleClass("sapUshellSearchResultListItemDoc-Snippet");
          oRm.renderControl(value);
        }
      }
    },
    // render Attributes
    // ===================================================================
    _renderAllAttributes: function _renderAllAttributes(oRm, itemAttributes) {
      let itemAttribute;
      let labelText;
      let valueText;
      let value;

      // skip first attribute which is the title attribute for the table
      let numberOfMainAttributes = 4;
      if (this.getProperty("imageUrl")) {
        numberOfMainAttributes--;
      }
      this.destroyAggregation("_attributeValues");
      for (let i = 0, j = 0; j < numberOfMainAttributes && i < itemAttributes.length; i++) {
        itemAttribute = itemAttributes[i];
        if (itemAttribute.isTitle || itemAttribute.longtext) {
          continue;
        }
        if (!itemAttribute.value) {
          continue;
        }
        labelText = itemAttribute.name;
        valueText = itemAttribute.value;
        if (labelText === undefined || valueText === undefined) {
          continue;
        }
        if (!valueText || valueText === "") {
          valueText = SearchResultListItem.noValue;
        }
        value = new SearchText(`${this.getId()}_${i}_${j}_noteText`, {
          text: valueText
        });
        value.addStyleClass("sapUshellSearchResultListItemNote-AttributeValue");
        value.addStyleClass("sapUshellSearchResultListItem-MightOverflow");
        oRm.renderControl(value);
        this.addAggregation("_attributeValues", value, true /* do not invalidate this object */);
        j++;
      }
    },
    _getExpandAreaObjectInfo: function _getExpandAreaObjectInfo() {
      const resultListItem = this.getDomRef();
      const attributesExpandContainer = resultListItem.querySelector(".sapUshellSearchResultListItemDoc-AttributesExpandContainer");
      const relatedObjectsToolbar = resultListItem.querySelector(".sapUshellSearchResultListItem-RelatedObjectsToolbar");
      let relatedObjectsToolbarHidden = false;
      if (relatedObjectsToolbar && window.getComputedStyle(relatedObjectsToolbar).display === "none") {
        relatedObjectsToolbar.style.display = "block";
        relatedObjectsToolbarHidden = true;
      }
      const currentHeight = attributesExpandContainer ? attributesExpandContainer.offsetHeight : 0;
      const expandedHeight = (() => {
        const elem = resultListItem.querySelector(".sapUshellSearchResultListItem-AttributesAndActions");
        return elem ? elem.offsetHeight : 0;
      })();
      if (relatedObjectsToolbarHidden && relatedObjectsToolbar) {
        relatedObjectsToolbar.style.display = "";
      }
      const elementsToFadeInOrOut = [];
      resultListItem.querySelectorAll(".sapUshellSearchResultListItem-GenericAttribute").forEach(el => {
        const element = el;
        const order = Number(window.getComputedStyle(element).order);
        if (order > 2) {
          elementsToFadeInOrOut.push(element);
        }
      });
      const expandAnimationDuration = 200;
      const fadeInOrOutAnimationDuration = expandAnimationDuration / 10;
      const expandAreaObjectInfo = {
        resultListItem: resultListItem,
        attributesExpandContainer: attributesExpandContainer,
        currentHeight: currentHeight,
        expandedHeight: expandedHeight,
        elementsToFadeInOrOut: elementsToFadeInOrOut,
        expandAnimationDuration: expandAnimationDuration,
        fadeInOrOutAnimationDuration: fadeInOrOutAnimationDuration,
        relatedObjectsToolbar: relatedObjectsToolbar
      };
      return expandAreaObjectInfo;
    },
    hideDetails: function _hideDetails() {
      const resultListItem = this.getDomRef();
      if (!this.isShowingDetails()) {
        return;
      }
      const expandAreaObjectInfo = this._getExpandAreaObjectInfo();

      // get the height of the first element with class 'sapUshellSearchResultListItem-Attributes'
      const attributesElem = resultListItem.querySelector(".sapUshellSearchResultListItem-Attributes");
      // include margin if needed (like jQuery.outerHeight(true))
      let attributeHeight = 0;
      if (attributesElem) {
        const style = window.getComputedStyle(attributesElem);
        attributeHeight = attributesElem.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
      }
      const attributesExpandContainer = expandAreaObjectInfo.attributesExpandContainer;
      const elementsToFadeInOrOut = expandAreaObjectInfo.elementsToFadeInOrOut;
      const expandAnimationDuration = expandAreaObjectInfo.expandAnimationDuration;
      const fadeInOrOutAnimationDuration = expandAreaObjectInfo.fadeInOrOutAnimationDuration;

      // animate height
      const heightAnimation = attributesExpandContainer.animate([{
        height: attributesExpandContainer.offsetHeight + "px"
      }, {
        height: attributeHeight + "px"
      }], {
        duration: expandAnimationDuration,
        fill: "forwards",
        easing: "ease"
      });

      // animate opacity for elements to fade out
      const fadePromises = [];
      for (const el of elementsToFadeInOrOut) {
        const fadeAnim = el.animate([{
          opacity: getComputedStyle(el).opacity
        }, {
          opacity: "0"
        }], {
          duration: fadeInOrOutAnimationDuration,
          fill: "forwards",
          easing: "ease"
        });
        fadePromises.push(fadeAnim.finished.then(() => fadeAnim));
      }

      // when both animations are done
      Promise.all([heightAnimation.finished, ...fadePromises]).then(() => {
        this.setProperty("expanded", false, true);
        attributesExpandContainer.classList.remove("sapUshellSearchResultListItem-AttributesExpanded");
        elementsToFadeInOrOut.forEach(el => {
          el.style.opacity = "";
        });
        const iconArrowDown = IconPool.getIconURI("slim-arrow-down");
        const expandButton = this.getAggregation("_expandButton");
        if (expandButton) {
          expandButton.setTooltip(i18n.getText("showDetailBtn_tooltip"));
          expandButton.setIcon(iconArrowDown);
        }
      });
    }
  });
  return SearchResultListItemNote;
});
//# sourceMappingURL=SearchResultListItemNote-dbg.js.map

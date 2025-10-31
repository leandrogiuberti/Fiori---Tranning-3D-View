/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../i18n", "./SearchText", "./SearchRelatedObjectsToolbar", "sap/m/Button", "sap/m/library", "sap/m/Label", "sap/m/Text", "sap/m/CheckBox", "sap/ui/core/Icon", "sap/ui/core/IconPool", "sap/ui/core/InvisibleText", "sap/ui/core/Control", "sap/ui/base/ManagedObject", "../../eventlogging/UserEvents", "../../UIUtil", "../SearchLink", "../../sinaNexTS/sina/NavigationTarget", "../../uiConstants", "../../sinaNexTS/sina/AttributeFormatType"], function (__i18n, __SearchText, __SearchRelatedObjectsToolbar, Button, sap_m_library, Label, Text, CheckBox, Icon, IconPool, InvisibleText, Control, ManagedObject, ____eventlogging_UserEvents, ____UIUtil, __SearchLink, ____sinaNexTS_sina_NavigationTarget, ____uiConstants, ____sinaNexTS_sina_AttributeFormatType) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const i18n = _interopRequireDefault(__i18n);
  const SearchText = _interopRequireDefault(__SearchText);
  const SearchRelatedObjectsToolbar = _interopRequireDefault(__SearchRelatedObjectsToolbar);
  const ButtonType = sap_m_library["ButtonType"]; // import { ListType } from "sap/m/library";
  const UserEventType = ____eventlogging_UserEvents["UserEventType"];
  const registerHandler = ____UIUtil["registerHandler"];
  const SearchLink = _interopRequireDefault(__SearchLink);
  const NavigationTarget = ____sinaNexTS_sina_NavigationTarget["NavigationTarget"];
  const initialValueUnicode = ____uiConstants["initialValueUnicode"];
  const AttributeFormatType = ____sinaNexTS_sina_AttributeFormatType["AttributeFormatType"];
  /**
   * @namespace sap.esh.search.ui.controls
   */
  const SearchResultListItem = Control.extend("sap.esh.search.ui.controls.SearchResultListItem", {
    renderer: {
      apiVersion: 2,
      render(oRm, oControl) {
        // static function, so use the given "oControl" instance instead of "this" in the renderer function
        oControl._renderer(oRm, oControl);
      }
    },
    // the control API:
    metadata: {
      properties: {
        dataSource: "object",
        // sina data source
        itemId: "string",
        title: "string",
        isTitleHighlighted: "boolean",
        titleDescription: "string",
        isTitleDescriptionHighlighted: "boolean",
        titleNavigation: "object",
        titleIconUrl: "string",
        titleInfoIconUrl: "string",
        titleInfoIconTooltip: "string",
        geoJson: "object",
        type: "string",
        imageUrl: "string",
        imageFormat: "string",
        imageNavigation: "object",
        attributes: {
          type: "object",
          multiple: true
        },
        navigationObjects: {
          type: "object",
          multiple: true
        },
        selected: "boolean",
        selectionEnabled: "boolean",
        customItemStyleClass: "string",
        expanded: "boolean",
        parentListItem: "object",
        additionalParameters: "object",
        positionInList: "int",
        resultSetId: "string",
        layoutCache: "object",
        countBreadcrumbsHiddenElement: "object"
      },
      aggregations: {
        _titleLink: {
          type: "sap.esh.search.ui.controls.SearchLink",
          multiple: false,
          visibility: "hidden"
        },
        _titleText: {
          type: "sap.esh.search.ui.controls.SearchText",
          multiple: false,
          visibility: "hidden"
        },
        _titleLinkDescription: {
          type: "sap.esh.search.ui.controls.SearchText",
          multiple: false,
          visibility: "hidden"
        },
        _titleInfoIcon: {
          type: "sap.ui.core.Icon",
          multiple: false,
          visibility: "hidden"
        },
        _titleDelimiter: {
          type: "sap.m.Text",
          multiple: false,
          visibility: "hidden"
        },
        _typeText: {
          type: "sap.esh.search.ui.controls.SearchText",
          multiple: false,
          visibility: "hidden"
        },
        _typeLink: {
          type: "sap.esh.search.ui.controls.SearchLink",
          multiple: false,
          visibility: "hidden"
        },
        _typeLinkAriaDescription: {
          type: "sap.ui.core.InvisibleText",
          multiple: false,
          visibility: "hidden"
        },
        _multiLineDescriptionText: {
          type: "sap.esh.search.ui.controls.SearchText",
          multiple: false,
          visibility: "hidden"
        },
        _selectionCheckBox: {
          type: "sap.m.CheckBox",
          multiple: false,
          visibility: "hidden"
        },
        _expandButton: {
          type: "sap.m.Button",
          multiple: false,
          visibility: "hidden"
        },
        _attributeLabels: {
          type: "sap.m.Label",
          multiple: true,
          visibility: "hidden"
        },
        _attributeValues: {
          type: "sap.ui.core.Control",
          multiple: true,
          visibility: "hidden"
        },
        _attributeValuesWithoutWhyfoundHiddenTexts: {
          type: "sap.ui.core.InvisibleText",
          multiple: true,
          visibility: "hidden"
        },
        _relatedObjectActionsToolbar: {
          type: "sap.esh.search.ui.controls.SearchRelatedObjectsToolbar",
          multiple: false,
          visibility: "hidden"
        },
        _titleLabeledByText: {
          type: "sap.ui.core.InvisibleText",
          multiple: false,
          visibility: "hidden"
        },
        _attributesLabeledByText: {
          type: "sap.ui.core.InvisibleText",
          multiple: false,
          visibility: "hidden"
        },
        _expandStateLabeledByText: {
          type: "sap.ui.core.InvisibleText",
          multiple: false,
          visibility: "hidden"
        }
      }
    },
    constructor: function _constructor(sId, settings) {
      Control.prototype.constructor.call(this, sId, settings);
      // dash
      this._visibleAttributes = undefined;
      this._detailsArea = undefined;
      this._showExpandButton = false;
      this.setAggregation("_titleLink", new SearchLink(`${this.getId()}--titleLink`).addStyleClass("sapUshellSearchResultListItem-HeaderEntry").addStyleClass("sapUshellSearchResultListItem-Title").addStyleClass("sapUshellSearchResultListItem-MightOverflow"));
      this.setAggregation("_titleText", new SearchText(`${this.getId()}--titleText`, {
        wrapping: false
      }).addStyleClass("sapUshellSearchResultListItem-HeaderEntry").addStyleClass("sapUshellSearchResultListItem-Title").addStyleClass("sapUshellSearchResultListItem-MightOverflow"));
      this.setAggregation("_titleLinkDescription", new SearchText(`${this.getId()}--titleLinkDescription`, {
        wrapping: false
      }).addStyleClass("sapUshellSearchResultListItem-HeaderEntry").addStyleClass("sapUshellSearchResultListItem-TitleDescription").addStyleClass("sapUshellSearchResultListItem-MightOverflow"));
      const iconSetting = {
        src: {
          path: "titleInfoIconUrl"
        },
        tooltip: "{= ${titleInfoIconTooltip} ? ${titleInfoIconTooltip} : ${i18n>collectionShared} }"
      };
      const titleInfoIcon = new Icon(`${this.getId()}--titleInfoIcon`, iconSetting);
      titleInfoIcon.addStyleClass("sapUiSmallMarginEnd");
      this.setAggregation("_titleInfoIcon", titleInfoIcon);
      titleInfoIcon.addStyleClass("sapUshellSearchResultListItem-TitleInfoIcon");
      const titleDelimiter = new Text(`${this.getId()}--titleDelimiter`, {
        text: "|"
      });
      titleDelimiter.addEventDelegate({
        onAfterRendering: () => {
          const domRef = titleDelimiter.getDomRef();
          domRef?.setAttribute("aria-hidden", "true");
        }
      });
      this.setAggregation("_titleDelimiter", titleDelimiter.addStyleClass("sapUshellSearchResultListItem-HeaderEntry").addStyleClass("sapUshellSearchResultListItem-TitleDelimiter").addStyleClass("sapUshellSearchResultListItem-MightOverflow"));
      this.setAggregation("_typeText", new SearchText(`${this.getId()}--typeText`).addStyleClass("sapUshellSearchResultListItem-HeaderEntry").addStyleClass("sapUshellSearchResultListItem-TitleCategory").addStyleClass("sapUshellSearchResultListItem-MightOverflow"));
      this.setAggregation("_typeLinkAriaDescription", new InvisibleText({
        text: i18n.getText("result_list_item_type_link_description")
      }));
      this.setAggregation("_typeLink", new SearchLink(`${this.getId()}--typeLink`).addStyleClass("sapUshellSearchResultListItem-HeaderEntry").addStyleClass("sapUshellSearchResultListItem-TitleCategoryLink").addStyleClass("sapUshellSearchResultListItem-MightOverflow").addAriaDescribedBy(this.getAggregation("_typeLinkAriaDescription")));
      this.setAggregation("_multiLineDescriptionText", new SearchText(`${this.getId()}--multilineDescription`, {
        maxLines: 5
      }).addStyleClass("sapUshellSearchResultListItem-MultiLineDescription").addStyleClass("sapUshellSearchResultListItem-MightOverflow").data("islongtext", "true", true));
      this.setAggregation("_selectionCheckBox", new CheckBox(`${this.getId()}--selectionCheckbox`, {
        selected: {
          path: "selected"
        },
        select: oEvent => {
          // console.log("SELECTION: list checkbox, select event");
          this.setProperty("selected", oEvent.getParameter("selected"), true // no re-rendering needed, change originates in HTML
          );
          const oModel = this.getModel();
          oModel.updateMultiSelectionSelected();
        },
        enabled: {
          path: "/selectionEnabled"
        },
        visible: {
          path: "/resultviewSelectionVisibility"
        }
      }));
      this.setAggregation("_expandButton", new Button(`${this.getId()}--expandButton`, {
        type: ButtonType.Transparent,
        press: () => {
          this.toggleDetails();
        },
        visible: {
          parts: [{
            path: "/config/resultviewMasterDetailMode"
          }],
          formatter: resultviewMasterDetailMode => !resultviewMasterDetailMode
        }
      }));
      this.setAggregation("_relatedObjectActionsToolbar", new SearchRelatedObjectsToolbar(`${this.getId()}--relatedObjectActionsToolbar`));
      this.setAggregation("_titleLabeledByText", new InvisibleText());
      this.setAggregation("_attributesLabeledByText", new InvisibleText());
      this.setAggregation("_expandStateLabeledByText", new InvisibleText());
    },
    /**
     * override setProperty to sync selection CSS class when selected property changes
     */
    setProperty: function _setProperty(name, value, suppressInvalidate) {
      const res = Control.prototype.setProperty.call(this, name, value, suppressInvalidate);
      if (name === "selected") this._syncSelectionCssClass();
      return res;
    },
    // the part creating the HTML
    _renderer: function _renderer(oRm, oControl) {
      const resultListItem = this.getDomRef();
      const relatedObjectsToolbar = resultListItem ? resultListItem.querySelector(".sapUshellSearchResultListItem-RelatedObjectsToolbar") : null;
      if (relatedObjectsToolbar && window.getComputedStyle(relatedObjectsToolbar).display === "none") {
        const oModel = this.getModel();
        if (oModel.config.optimizeForValueHelp) {
          relatedObjectsToolbar.style.display = "block";
        }
      }
      this._registerItemPressHandler();
      this._resetPrecalculatedValues();
      this._renderContainer(oRm, oControl);
      this._renderAccessibilityInformation(oRm);
    },
    _renderContainer: function _renderContainer(oRm, oControl) {
      const oModel = this.getModel();
      oRm.openStart("div", this);
      if (this.getProperty("customItemStyleClass")) {
        oRm.class(this.getProperty("customItemStyleClass"));
      }
      oRm.class("sapUshellSearchResultListItem-Container");
      if (this.getProperty("imageUrl")) {
        oRm.class("sapUshellSearchResultListItem-WithImage");
      }
      if (this.getProperty("imageFormat")?.toLowerCase() === "documentthumbnail") {
        oRm.class("sapUshellSearchResultListItem-Document");
      }
      oRm.openEnd();
      this._renderContentContainer(oRm, oControl);
      if (!oModel.config.optimizeForValueHelp) {
        this._renderExpandButtonContainer(oRm);
      }
      oRm.close("div");
    },
    _renderContentContainer: function _renderContentContainer(oRm, oControl) {
      oRm.openStart("div", oControl.getId() + "-content");
      oRm.class("sapUshellSearchResultListItem-Content");
      oRm.openEnd();
      this._renderTitleContainer(oRm, oControl);
      this._renderAttributesContainer(oRm);
      oRm.close("div");
    },
    _renderExpandButtonContainer: function _renderExpandButtonContainer(oRm) {
      oRm.openStart("div", this.getId() + "-expand-button-container");
      oRm.class("sapUshellSearchResultListItem-ExpandButtonContainer");
      oRm.openEnd();
      oRm.openStart("div", this.getId() + "-expand-button");
      oRm.class("sapUshellSearchResultListItem-ExpandButton");
      oRm.openEnd();
      let icon, tooltip;
      const expanded = this.getProperty("expanded");
      if (expanded) {
        icon = IconPool.getIconURI("slim-arrow-up");
        tooltip = i18n.getText("hideDetailBtn_tooltip");
      } else {
        icon = IconPool.getIconURI("slim-arrow-down");
        tooltip = i18n.getText("showDetailBtn_tooltip");
      }
      const expandButton = this.getAggregation("_expandButton");
      expandButton.setIcon(icon);
      expandButton.setTooltip(tooltip);
      expandButton.addEventDelegate({
        onAfterRendering: () => {
          this.setAriaExpandedState();
        }
      });
      oRm.renderControl(expandButton);
      oRm.close("div");
      oRm.close("div");
    },
    _renderTitleContainer: function _renderTitleContainer(oRm, oControl) {
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

      /// Title
      const handleTitleIconSearchText = (titleControl, oModel) => {
        const titleLinkIcon = titleControl.getAggregation("icon");
        if (titleLinkIcon instanceof Icon) {
          titleLinkIcon.addStyleClass("sapUshellSearchResultListItem-Clickable");
        } else if (this.getProperty("titleIconUrl")) {
          const oIcon = new Icon(`${this.getId()}--titleIcon`, {
            src: ManagedObject.escapeSettingsValue(this.getProperty("titleIconUrl"))
          });
          oIcon?.addStyleClass("sapUshellSearchResultListItem-Clickable");
          titleControl.setIcon(oIcon);
          setTimeout(() => {
            if (!this.isHierarchyItem() && this.supportsDragAndDrop(titleControl, oModel)) {
              const domElement = oIcon?.getDomRef();
              if (domElement) {
                domElement["draggable"] = false;
              }
            }
          }, 100);
        }
      };
      const titleNavigation = this.getProperty("titleNavigation");
      let titleText = this.getProperty("title");
      let titleControl;
      if (!titleText || titleText.trim().length === 0) {
        titleText = SearchResultListItem.noValue;
        titleControl = this.getAggregation("_titleText");
        handleTitleIconSearchText(titleControl, oModel);
      } else if (!titleNavigation && !this.isHierarchyItem()) {
        titleControl = this.getAggregation("_titleText");
        this.adjustCssDragAndDrop(titleControl, oModel);
        handleTitleIconSearchText(titleControl, oModel);
      } else {
        titleControl = this.getAggregation("_titleLink");
        titleControl.setNavigationTarget(titleNavigation);
        titleControl.setIcon(this.getProperty("titleIconUrl"));
        if (this.isHierarchyItem()) {
          setTimeout(() => {
            if (this.supportsDragAndDrop(titleControl, oModel)) {
              // no drag&drop of title link (<a>-tag, first child of span)
              if (titleControl.getDomRef()?.children.length > 0 && titleControl.getDomRef()?.children[0]["tagName"] === "A") {
                titleControl.getDomRef().children[0]["draggable"] = false;
              } else {
                titleControl.getDomRef()["draggable"] = false;
              }
              this.addStyleClass("sapUshellSearchResultListItem-NotDraggableNotClickable");
            }
          }, 100);
        } else {
          setTimeout(() => {
            if (this.supportsDragAndDrop(titleControl, oModel)) {
              // no drag&drop of title link (<a>-tag)
              titleControl.getDomRef()["draggable"] = false;
            }
          }, 100);
        }
      }
      titleControl.setText(titleText);
      if (this.getProperty("isTitleHighlighted")) {
        titleControl.addStyleClass("sapUshellSearchResultItem-AttributeValueHighlighted");
      }
      oRm.renderControl(titleControl);
      if (oControl.getProperty("titleInfoIconUrl")) {
        const titleInfoIcon = oControl.getAggregation("_titleInfoIcon");
        if (titleInfoIcon) {
          if (oModel.config.optimizeForValueHelp) {
            titleInfoIcon.addStyleClass("sapUshellSearchResultListItem-TitleInfoIconValueHelp");
          }
          this.adjustCssDragAndDrop(titleInfoIcon, oModel);
          oRm.renderControl(titleInfoIcon);
        }
      }

      /// sub-title aka Title Description
      if (!oModel.config.optimizeForValueHelp) {
        const titleDescription = this.getProperty("titleDescription");
        if (titleDescription && titleDescription.trim().length > 0) {
          const titleLinkDescription = this.getAggregation("_titleLinkDescription");
          titleLinkDescription.setText(titleDescription);
          if (this.getProperty("isTitleDescriptionHighlighted")) {
            titleLinkDescription.addStyleClass("sapUshellSearchResultItem-AttributeValueHighlighted");
          }
          oRm.renderControl(titleLinkDescription);
        }
      }
      if (oModel.config.optimizeForValueHelp) {
        this._renderRelatedObjectsToolbar(oRm);
      } else if (!oModel.config.exclusiveDataSource) {
        // delimiter between title and sub-title or object type
        const titleDelimiter = this.getAggregation("_titleDelimiter");
        oRm.renderControl(titleDelimiter);

        // object type
        if (oModel.getDataSource() === this.getProperty("dataSource")) {
          const typeText = this.getAggregation("_typeText");
          typeText.setText(this.getProperty("type"));
          oRm.renderControl(typeText);
        } else {
          const uiFilterClone = this.getModel().getProperty("/uiFilter").clone();
          uiFilterClone.setDataSource(this.getProperty("dataSource"));
          const navigationTarget = oModel.createSearchNavigationTarget(uiFilterClone, this.getProperty("type"));
          const typeLink = this.getAggregation("_typeLink");
          typeLink.setNavigationTarget(navigationTarget);
          typeLink.setText(this.getProperty("type"));
          typeLink.setTooltip(i18n.getText("searchInDataSourceTooltip", [this.getProperty("dataSource").labelPlural]));
          oRm.renderControl(this.getAggregation("_typeLinkAriaDescription"));
          oRm.renderControl(typeLink);
        }
      }
      oRm.close("div");
      if (!oModel.config.optimizeForValueHelp) {
        this._renderImageForPhone(oRm);
        oRm.close("div");
      }
    },
    _renderCheckbox: function _renderCheckbox(oRm) {
      oRm.openStart("div", this.getId() + "-checkbox-expand-container");
      oRm.class("sapUshellSearchResultListItem-CheckboxExpandContainer");
      oRm.openEnd();
      oRm.openStart("div", this.getId() + "-checkbox-container");
      oRm.class("sapUshellSearchResultListItem-CheckboxContainer");
      oRm.openEnd();
      oRm.openStart("div", this.getId() + "-checkbox-alignment-container");
      oRm.class("sapUshellSearchResultListItem-CheckboxAlignmentContainer");
      oRm.openEnd();
      const checkbox = this.getAggregation("_selectionCheckBox");
      /* const selected = this.getProperty("selected");
      const selectionEnabled = this.getProperty("selectionEnabled");
      checkbox.setSelected(selected);
      checkbox.setEnabled(selectionEnabled); */
      oRm.renderControl(checkbox);
      oRm.close("div");
      oRm.close("div");
      oRm.close("div");
    },
    _renderImageForPhone: function _renderImageForPhone(oRm) {
      if (this.getProperty("imageUrl")) {
        oRm.openStart("div", this.getId() + "-title-image");
        oRm.class("sapUshellSearchResultListItem-TitleImage");
        if (this.getProperty("imageFormat") === AttributeFormatType.Round) {
          oRm.class("sapUshellSearchResultListItem-ImageContainerRound");
        }
        oRm.openEnd();
        oRm.openStart("div", this.getId() + "-image-container-aligmnent-helper");
        oRm.class("sapUshellSearchResultListItem-ImageContainerAlignmentHelper");
        oRm.openEnd();
        oRm.close("div");
        oRm.openStart("img", this.getId() + "-image-1");
        oRm.class("sapUshellSearchResultListItem-Image");
        oRm.attr("src", this.getProperty("imageUrl"));
        oRm.openEnd();
        oRm.close("div");
        oRm.close("div");
      }
    },
    _renderImageForDocument: function _renderImageForDocument(oRm) {
      if (this.getProperty("imageFormat") && this.getProperty("imageFormat").toLowerCase() === "documentthumbnail") {
        const imageNavigation = this.getProperty("imageNavigation");
        const imageNavigationUrl = imageNavigation ? imageNavigation.targetUrl : "";
        if (typeof this._zoomIcon !== "undefined") {
          this._zoomIcon.destroy();
        }
        this._zoomIcon = new Icon("", {
          // ToDo: Stable ID, see below
          // this._zoomIcon = new Icon(`${this.getId()}--zoomIcon`, {
          // -> duplicate ID ?!?
          src: IconPool.getIconURI("search"),
          useIconTooltip: false
        });
        this._zoomIcon.addStyleClass(`${this.getId()}--zoomIcon`); // ToDo -> remove as soon as stable ID works
        this._zoomIcon.addStyleClass("sapUshellSearchResultListItem-DocumentThumbnailZoomIcon");
        const imageUrl = this.getProperty("imageUrl");
        oRm.openStart("div", this.getId() + "-document-thumbnail-container");
        oRm.class("sapUshellSearchResultListItem-DocumentThumbnailContainer");
        oRm.openEnd();
        if (imageNavigationUrl && imageNavigationUrl.length > 0) {
          oRm.openStart("a", this.getId() + "-document-thumbnail-border-1");
          oRm.attr("href", imageNavigationUrl);
          oRm.class("sapUshellSearchResultListItem-DocumentThumbnailBorder");
          oRm.openEnd();
          oRm.openStart("div", this.getId() + "-document-thumbnail-dogear-1");
          oRm.class("sapUshellSearchResultListItem-DocumentThumbnail-DogEar");
          oRm.openEnd();
          oRm.close("div");
          oRm.renderControl(this._zoomIcon);
          if (imageUrl && imageUrl.length > 0) {
            oRm.openStart("img", this.getId() + "-document-thumbnail-1");
            oRm.class("sapUshellSearchResultListItem-DocumentThumbnail");
            oRm.attr("src", this.getProperty("imageUrl"));
            oRm.openEnd();
            oRm.close("img");
          } // else: is there a placeholder image that could be shown instead?

          oRm.close("a");
        } else {
          oRm.openStart("div", this.getId() + "-document-thumbnail-border-2");
          oRm.class("sapUshellSearchResultListItem-DocumentThumbnailBorder");
          oRm.openEnd();
          oRm.openStart("div", this.getId() + "-document-thumbnail-dogear-2");
          oRm.class("sapUshellSearchResultListItem-DocumentThumbnail-DogEar");
          oRm.openEnd();
          oRm.close("div");
          oRm.renderControl(this._zoomIcon);
          if (imageUrl && imageUrl.length > 0) {
            oRm.openStart("img", this.getId() + "-document-thumbnail-2");
            oRm.class("sapUshellSearchResultListItem-DocumentThumbnail");
            oRm.attr("src", this.getProperty("imageUrl"));
            oRm.openEnd();
            oRm.close("img");
          } // else: is there a placeholder image that could be shown instead?

          oRm.close("div");
        }
        oRm.close("div");
      }
    },
    _cutDescrAttributeOutOfAttributeList: function _cutDescrAttributeOutOfAttributeList() {
      const attributes = this.getProperty("attributes");
      for (let i = 0; i < attributes.length; i++) {
        const attribute = attributes[i];
        if (attribute.longtext) {
          attributes.splice(i, 1);
          this.setProperty("attributes", attributes);
          return attribute;
        }
      }
      return undefined;
    },
    _renderMultiLineDescription: function _renderMultiLineDescription(oRm) {
      const oModel = this.getModel();
      if (this.getProperty("imageFormat")?.toLowerCase() === "documentthumbnail") {
        // for the time being, only render multiline attribute, if this is a document result item
        const description = this._cutDescrAttributeOutOfAttributeList();
        if (description?.value?.length > 0) {
          const descriptionText = this.getAggregation("_multiLineDescriptionText");
          descriptionText.setText(description.value);
          if (description.whyfound) {
            descriptionText.data("ishighlighted", "true", true);
          } else {
            descriptionText.data("ishighlighted", "false", true);
          }
          if (description.valueWithoutWhyfound) {
            // for attribute values with why-found information, use the raw value information (without why-found-tags) for tooltip and ARIA description
            const hiddenValueText = new InvisibleText({});
            hiddenValueText.setText(description.valueWithoutWhyfound);
            descriptionText.data("tooltippedBy", hiddenValueText.getId(), true);
            descriptionText.addEventDelegate({
              onAfterRendering: () => {
                const descriptionTextDom = descriptionText.getDomRef();
                if (descriptionTextDom) {
                  descriptionTextDom.setAttribute("aria-describedby", descriptionTextDom.getAttribute("data-tooltippedby") || "");
                }
              }
            });
            this.addAggregation("_attributeValuesWithoutWhyfoundHiddenTexts", hiddenValueText, true /* do not invalidate this object */);
            oRm.renderControl(hiddenValueText);
          }
          this.adjustCssDragAndDrop(descriptionText, oModel);
          oRm.renderControl(descriptionText);
        } else {
          oRm.openStart("div", this.getId() + "-multiline-description");
          oRm.class("sapUshellSearchResultListItem-MultiLineDescription");
          oRm.openEnd();
          oRm.close("div");
        }
      }
    },
    _renderAttributesContainer: function _renderAttributesContainer(oRm) {
      const oModel = this.getModel();
      oRm.openStart("div", this.getId() + "-attribute-expand-container");
      oRm.class("sapUshellSearchResultListItem-AttributesExpandContainer");
      if (oModel.config.optimizeForValueHelp) {
        oRm.class("sapUshellSearchResultListItem-AttributesExpandContainerValueHelp");
      }
      const expanded = this.getProperty("expanded");
      if (expanded) {
        oRm.class("sapUshellSearchResultListItem-AttributesExpanded");
      }
      oRm.openEnd();
      oRm.openStart("div", this.getId() + "-attributes-and-actions");
      oRm.class("sapUshellSearchResultListItem-AttributesAndActions");
      oRm.openEnd();
      if (!oModel.config.optimizeForValueHelp) {
        this._renderImageForDocument(oRm);
        this._renderMultiLineDescription(oRm);
      }
      oRm.openStart("ul", this.getId() + "-attributes");
      oRm.class("sapUshellSearchResultListItem-Attributes");
      oRm.openEnd();
      const itemAttributes = this.getProperty("attributes");
      if (!oModel.config.optimizeForValueHelp) {
        this._renderImageAttribute(oRm, /* imageIsOnlyAttribute= */itemAttributes.length === 0);
      }
      this._renderAllAttributes(oRm, itemAttributes);

      // this is just a dummy attribute to store additional spacer information for the expand and collapse JavaScript function
      if (!oModel.config.optimizeForValueHelp) {
        oRm.openStart("li", this.getId() + "-expand-spacer-attribute");
        oRm.class("sapUshellSearchResultListItem-ExpandSpacerAttribute");
        oRm.attr("aria-hidden", "true");
        oRm.openEnd();
        oRm.close("li");
      }
      oRm.close("ul");
      if (!oModel.config.optimizeForValueHelp) {
        // related objects toolbar will be rendered in line with title attribute
        this._renderRelatedObjectsToolbar(oRm);
      }
      oRm.close("div");
      oRm.close("div");
    },
    // render Attributes
    // ===================================================================
    _renderAllAttributes: function _renderAllAttributes(oRm, itemAttributes) {
      const oModel = this.getModel();
      if (itemAttributes.length === 0) {
        oRm.openStart("li", this.getId() + "-generic-attribute-1");
        oRm.class("sapUshellSearchResultListItem-GenericAttribute");
        if (oModel.config.optimizeForValueHelp) {
          oRm.class("sapUshellSearchResultListItem-GenericAttributeValueHelp");
        }
        oRm.class("sapUshellSearchResultListItem-MainAttribute");
        oRm.class("sapUshellSearchResultListItem-EmptyAttributePlaceholder");
        oRm.attr("aria-hidden", "true");
        oRm.openEnd();
        oRm.close("li");
        return;
      }
      let itemAttribute;
      let labelText;
      let valueText;
      let valueWithoutWhyfound;
      let label, value, isLongText;
      let hiddenValueText;
      let oIcon;
      const layoutCache = this.getProperty("layoutCache") || {};
      this.setProperty("layoutCache", layoutCache, /* suppress rerender */true);
      if (!layoutCache.attributes) {
        layoutCache.attributes = {};
      }
      let i = 0,
        numberOfRenderedAttributes = 0;
      let numberOfColumnsDesktop = 4;
      let numberOfColumnsTablet = 3;
      let distributionOfAttributesDesktop = [0, 0, 0]; // three rows for desktop resolution
      let distributionOfAttributesTablet = [0, 0, 0, 0]; // four rows for tablet resolution
      let additionalWhyFoundAttributesDesktop = 2;
      let additionalWhyFoundAttributesTablet = 2;
      let longTextColumnNumber;
      const isDocumentItem = this.getProperty("imageFormat") && this.getProperty("imageFormat").toLowerCase() === "documentthumbnail";
      const includeImageAttribute = this.getProperty("imageUrl") && !isDocumentItem && !oModel.config.optimizeForValueHelp;
      if (isDocumentItem && !oModel.config.optimizeForValueHelp) {
        numberOfColumnsDesktop = numberOfColumnsTablet = 2;
        distributionOfAttributesDesktop = distributionOfAttributesTablet = [0, 0];
        additionalWhyFoundAttributesDesktop = additionalWhyFoundAttributesTablet = 4;
      }
      let remainingSlotsForAttributesDesktop = numberOfColumnsDesktop * distributionOfAttributesDesktop.length;
      let remainingSlotsForAttributesTablet = numberOfColumnsTablet * distributionOfAttributesTablet.length;
      if (includeImageAttribute) {
        remainingSlotsForAttributesDesktop--;
        remainingSlotsForAttributesTablet--;
        distributionOfAttributesDesktop[0]++;
        distributionOfAttributesTablet[0]++;
      }
      this.destroyAggregation("_attributeLabels");
      this.destroyAggregation("_attributeValues");
      this.destroyAggregation("_attributeValuesWithoutWhyfoundHiddenTexts");

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const createAfterRenderingFunctionForAddingAriaDescribedBy = control => {
        return () => {
          const dom = this.getDomRef();
          if (dom) {
            const describedBy = dom.getAttribute("data-tooltippedby");
            if (describedBy) {
              dom.setAttribute("aria-describedby", describedBy);
            } else {
              dom.removeAttribute("aria-describedby");
            }
          }
        };
      };
      for (i = 0; !(additionalWhyFoundAttributesDesktop <= 0 && additionalWhyFoundAttributesTablet <= 0) && i < itemAttributes.length; i++) {
        itemAttribute = itemAttributes[i];
        const oModel = this.getModel();
        if (oModel.config.optimizeForValueHelp && !itemAttribute.whyfound) {
          continue; // for value help mode, only render title and why found
        }
        if (isDocumentItem && numberOfRenderedAttributes >= 4) {
          break;
        }
        if (itemAttribute.isTitle) {
          continue;
        }
        if (remainingSlotsForAttributesDesktop <= 0 && remainingSlotsForAttributesTablet <= 0 && !itemAttribute.whyfound) {
          continue;
        }
        labelText = itemAttribute.name;
        valueText = itemAttribute.value;
        if (labelText === undefined || valueText === undefined) {
          continue;
        }
        if (!valueText || valueText.trim().length === 0) {
          valueText = SearchResultListItem.noValue;
        }
        if (itemAttribute.longtext === undefined || itemAttribute.longtext === null || itemAttribute.longtext === "") {
          isLongText = false;
        } else {
          isLongText = true;
        }
        valueWithoutWhyfound = itemAttribute.valueWithoutWhyfound;
        let _rowCountTablet = -1,
          _rowCountDesktop = -1,
          _attributeWeight = {
            desktop: 1,
            tablet: 1
          };
        const attributeLayout = layoutCache.attributes[itemAttribute.key] || {};
        layoutCache.attributes[itemAttribute.key] = attributeLayout;
        oRm.openStart("li", this.getId() + "-generic-attribute-2-" + i);
        oRm.class("sapUshellSearchResultListItem-GenericAttribute");
        if (oModel.config.optimizeForValueHelp) {
          oRm.class("sapUshellSearchResultListItem-GenericAttributeValueHelp");
        }
        oRm.class("sapUshellSearchResultListItem-MainAttribute");
        if (isLongText) {
          longTextColumnNumber = attributeLayout.longTextColumnNumber || this._howManyColumnsToUseForLongTextAttribute(valueWithoutWhyfound);
          attributeLayout.longTextColumnNumber = longTextColumnNumber;
          _attributeWeight = longTextColumnNumber;
          oRm.class("sapUshellSearchResultListItem-LongtextAttribute");
        }
        if (remainingSlotsForAttributesDesktop <= 0) {
          if (itemAttribute.whyfound && additionalWhyFoundAttributesDesktop > 0) {
            oRm.class("sapUshellSearchResultListItem-WhyFoundAttribute-Desktop");
            additionalWhyFoundAttributesDesktop--;
          } else {
            oRm.class("sapUshellSearchResultListItem-DisplayNoneAttribute-Desktop");
          }
        }
        if (remainingSlotsForAttributesTablet <= 0) {
          if (itemAttribute.whyfound && additionalWhyFoundAttributesTablet > 0) {
            oRm.class("sapUshellSearchResultListItem-WhyFoundAttribute-Tablet");
            additionalWhyFoundAttributesTablet--;
          } else {
            oRm.class("sapUshellSearchResultListItem-DisplayNoneAttribute-Tablet");
          }
        }
        if (isLongText && includeImageAttribute && distributionOfAttributesDesktop[0] === 1) {
          _rowCountDesktop = 0;
          longTextColumnNumber = attributeLayout.longTextColumnNumber.desktop < numberOfColumnsDesktop ? attributeLayout.longTextColumnNumber.desktop : numberOfColumnsDesktop - 1;
          distributionOfAttributesDesktop[0] += longTextColumnNumber;
          remainingSlotsForAttributesDesktop -= longTextColumnNumber;
        } else {
          for (let k = 0; k < distributionOfAttributesDesktop.length; k++) {
            if (distributionOfAttributesDesktop[k] + _attributeWeight.desktop <= numberOfColumnsDesktop) {
              distributionOfAttributesDesktop[k] += _attributeWeight.desktop;
              remainingSlotsForAttributesDesktop -= _attributeWeight.desktop;
              _rowCountDesktop = k;
              break;
            }
          }
        }
        if (_rowCountDesktop < 0) {
          _rowCountDesktop = distributionOfAttributesDesktop.length;
        }
        if (isLongText && includeImageAttribute && distributionOfAttributesTablet[0] === 1) {
          _rowCountTablet = 0;
          longTextColumnNumber = attributeLayout.longTextColumnNumber.tablet < numberOfColumnsTablet ? attributeLayout.longTextColumnNumber.tablet : numberOfColumnsTablet - 1;
          distributionOfAttributesTablet[0] += longTextColumnNumber;
          remainingSlotsForAttributesTablet -= longTextColumnNumber;
        } else {
          for (let k = 0; k < distributionOfAttributesTablet.length; k++) {
            if (distributionOfAttributesTablet[k] + _attributeWeight.tablet <= numberOfColumnsTablet) {
              distributionOfAttributesTablet[k] += _attributeWeight.tablet;
              remainingSlotsForAttributesTablet -= _attributeWeight.tablet;
              _rowCountTablet = k;
              break;
            }
          }
        }
        if (_rowCountTablet < 0) {
          _rowCountTablet = distributionOfAttributesTablet.length;
        }
        oRm.class("sapUshellSearchResultListItem-OrderTablet-" + _rowCountTablet);
        oRm.class("sapUshellSearchResultListItem-OrderDesktop-" + _rowCountDesktop);
        if (isLongText) {
          oRm.attr("data-sap-searchresultitem-attributeweight-desktop", _attributeWeight.desktop);
          oRm.attr("data-sap-searchresultitem-attributeweight-tablet", _attributeWeight.tablet);
        }
        oRm.openEnd();
        label = new Label(`${this.getId()}--attr${i}_labelText`, {
          displayOnly: true,
          showColon: true
        });
        label.setText(labelText);
        label.addStyleClass("sapUshellSearchResultListItem-AttributeKey");
        label.addStyleClass("sapUshellSearchResultListItem-MightOverflow");
        this.adjustCssDragAndDrop(label, oModel);
        oRm.renderControl(label);
        oRm.openStart("span", this.getId() + "-attribute-value-container-" + i);
        oRm.class("sapUshellSearchResultListItem-AttributeValueContainer");
        if (oModel.config.optimizeForValueHelp) {
          oRm.class("sapUshellSearchResultListItem-AttributeValueContainerValueHelp");
        }
        oRm.openEnd();
        if (itemAttribute.defaultNavigationTarget instanceof NavigationTarget) {
          const navigationTarget = itemAttribute.defaultNavigationTarget;
          value = new SearchLink(`${this.getId()}--attr${i}_defNavTarget_Link`, {
            navigationTarget: null,
            wrapping: false,
            tooltip: ManagedObject.escapeSettingsValue(itemAttribute.tooltip || "")
          });
          // Lazy loading because of potential {} in the href will be understood as binding path by UI5
          value.setNavigationTarget(navigationTarget);
          value.setText(valueText);
          value.addStyleClass("sapUshellSearchResultListItem-AttributeLink");
          value.setIcon(itemAttribute.iconUrl);
        } else {
          value = new SearchText(`${this.getId()}--attr${i}_noDefNavTarget_Text`);
          value.setText(valueText);
          oIcon = undefined;
          if (itemAttribute.iconUrl) {
            oIcon = new Icon(`${this.getId()}--attr${i}_itemAttributeIcon`, {
              src: ManagedObject.escapeSettingsValue(itemAttribute.iconUrl)
            });
            oIcon.addStyleClass("sapUshellSearchResultListItem-AttributeIcon");
          }
          if (oIcon) {
            value.setIcon(oIcon);
          }
        }
        value.addStyleClass("sapUshellSearchResultListItem-AttributeValue");
        value.addStyleClass("sapUshellSearchResultListItem-MightOverflow");
        if (itemAttribute.whyfound) {
          value.data("ishighlighted", "true", true);
          value.addStyleClass("sapUshellSearchResultItem-AttributeValueHighlighted");
        }
        if (isLongText) {
          value.data("islongtext", "true", true);
        }
        if (valueWithoutWhyfound && !(value instanceof SearchLink && value.getTooltip())) {
          // for attribute values with why-found information, use the raw value information (without why-found-tags) for tooltip and ARIA description
          hiddenValueText = new InvisibleText({});
          hiddenValueText.addStyleClass("sapUshellSearchResultListItem-AttributeValueContainer-HiddenText");
          hiddenValueText.setText(valueWithoutWhyfound);
          value.data("tooltippedBy", hiddenValueText.getId(), true);
          value.addEventDelegate({
            onAfterRendering: createAfterRenderingFunctionForAddingAriaDescribedBy(value)
          });
          this.addAggregation("_attributeValuesWithoutWhyfoundHiddenTexts", hiddenValueText, true /* do not invalidate this object */);
          oRm.renderControl(hiddenValueText);
        }
        this.adjustCssDragAndDrop(value, oModel);
        oRm.renderControl(value);
        oRm.close("span");
        oRm.close("li");
        this.addAggregation("_attributeLabels", label, true /* do not invalidate this object */);
        this.addAggregation("_attributeValues", value, true /* do not invalidate this object */);
        numberOfRenderedAttributes++;
      }
      if (includeImageAttribute) {
        const availableSpaceOnFirstLineDesktop = numberOfColumnsDesktop - distributionOfAttributesDesktop[0];
        const availableSpaceOnFirstLineTablet = numberOfColumnsTablet - distributionOfAttributesTablet[0];
        if (availableSpaceOnFirstLineDesktop > 0 || availableSpaceOnFirstLineTablet > 0) {
          oRm.openStart("li", this.getId() + "-generic-attribute-3");
          oRm.class("sapUshellSearchResultListItem-GenericAttribute");
          if (oModel.config.optimizeForValueHelp) {
            oRm.class("sapUshellSearchResultListItem-GenericAttributeValueHelp");
          }
          oRm.class("sapUshellSearchResultListItem-MainAttribute");
          oRm.class("sapUshellSearchResultListItem-OrderTablet-0");
          oRm.class("sapUshellSearchResultListItem-OrderDesktop-0");
          oRm.attr("data-sap-searchresultitem-attributeweight-desktop", availableSpaceOnFirstLineDesktop);
          oRm.attr("data-sap-searchresultitem-attributeweight-tablet", availableSpaceOnFirstLineTablet);
          oRm.openEnd();
          oRm.close("li");
        }
      }
    },
    _howManyColumnsToUseForLongTextAttribute: function _howManyColumnsToUseForLongTextAttribute(attributeValue) {
      if (attributeValue.length < 50) {
        return {
          tablet: 1,
          desktop: 1
        };
      }
      if (attributeValue.length < 85) {
        return {
          tablet: 2,
          desktop: 2
        };
      }
      if (attributeValue.length < 135) {
        return {
          tablet: 3,
          desktop: 3
        };
      }
      return {
        tablet: 3,
        desktop: 4
      };
    },
    _renderImageAttribute: function _renderImageAttribute(oRm, imageIsOnlyAttribute) {
      const oModel = this.getModel();
      if (!this.getProperty("imageUrl") || this.getProperty("imageFormat") && this.getProperty("imageFormat").toLowerCase() === "documentthumbnail") {
        return;
      }
      oRm.openStart("li", this.getId() + "-generic-attribute-4");
      oRm.class("sapUshellSearchResultListItem-GenericAttribute");
      if (oModel.config.optimizeForValueHelp) {
        oRm.class("sapUshellSearchResultListItem-GenericAttributeValueHelp");
      }
      oRm.class("sapUshellSearchResultListItem-ImageAttribute");
      if (imageIsOnlyAttribute) {
        oRm.class("sapUshellSearchResultListItem-LonelyImageAttribute");
      }
      oRm.openEnd();
      oRm.openStart("div", this.getId() + "-image-container");
      oRm.class("sapUshellSearchResultListItem-ImageContainer");
      if (this.getProperty("imageFormat") === AttributeFormatType.Round) {
        oRm.class("sapUshellSearchResultListItem-ImageContainerRound");
      }
      oRm.openEnd();
      if (this.getProperty("imageUrl")) {
        oRm.openStart("img", this.getId() + "-image-2");
        oRm.class("sapUshellSearchResultListItem-Image");
        if (this.getProperty("imageFormat") === AttributeFormatType.Round) {
          //
        }
        oRm.attr("src", this.getProperty("imageUrl"));
        oRm.openEnd();
        oRm.close("img");
      }
      if (this.getProperty("imageFormat") !== "round") {
        oRm.openStart("div", this.getId() + "-image-container-aligment-helper");
        oRm.class("sapUshellSearchResultListItem-ImageContainerAlignmentHelper");
        oRm.openEnd();
        oRm.close("div");
      }
      oRm.close("div");
      oRm.close("li");
    },
    // render Related Objects Toolbar
    // ===================================================================
    _renderRelatedObjectsToolbar: function _renderRelatedObjectsToolbar(oRm) {
      const navigationObjects = this.getProperty("navigationObjects");
      if (!navigationObjects || navigationObjects.length === 0) {
        return;
      }
      this._showExpandButton = true;
      const relatedObjectActionsToolbar = this.getAggregation("_relatedObjectActionsToolbar");
      relatedObjectActionsToolbar.setProperty("navigationObjects", navigationObjects);
      relatedObjectActionsToolbar.setProperty("positionInList", this.getProperty("positionInList"));
      oRm.renderControl(relatedObjectActionsToolbar);
    },
    _renderAccessibilityInformation: function _renderAccessibilityInformation(oRm) {
      const parentListItem = this.getProperty("parentListItem");
      if (parentListItem) {
        this._renderAriaDescriptionElementForTitle(oRm, /* withPrefix = */true, /* doRender= */true);
        this._renderAriaDescriptionElementForAttributes(oRm, /* withPrefix = */ /* doRender= */true);
        this._renderAriaDescriptionElementForCollapsedOrExpandedState(oRm, /* withPrefix = */ /* doRender= */true);
        parentListItem.addEventDelegate({
          onAfterRendering: () => {
            this._addAriaDescriptionToParentListElement(parentListItem, /* includeTotalCountElement = */true);
            registerHandler("acc-listitem-focusin", [parentListItem.getDomRef()], "focusin", event => {
              const relatedTarget = event.relatedTarget;
              if (relatedTarget?.classList.contains("sapUshellSearchResultListItem") || relatedTarget?.closest(".sapUshellSearchResultListItemApps") && !relatedTarget.classList.contains("sapUshellResultListMoreFooter")) {
                this._renderAriaDescriptionElementForTitle(oRm, /* withPrefix = */false, /* doRender= */false);
                this._renderAriaDescriptionElementForAttributes(oRm, /* withPrefix = */ /* doRender= */false);
                this._renderAriaDescriptionElementForCollapsedOrExpandedState(oRm, /* withPrefix = */ /* doRender= */false);
                this._addAriaDescriptionToParentListElement(parentListItem, /* includeTotalCountElement = */false);
              } else {
                this._renderAriaDescriptionElementForTitle(oRm, /* withPrefix = */true, /* doRender= */false);
                this._renderAriaDescriptionElementForAttributes(oRm, /* withPrefix = */ /* doRender= */false);
                this._renderAriaDescriptionElementForCollapsedOrExpandedState(oRm, /* withPrefix = */ /* doRender= */false);
                this._addAriaDescriptionToParentListElement(parentListItem, /* includeTotalCountElement = */true);
              }
            });
          },
          onsapspace: oEvent => {
            if (oEvent["target"] === oEvent["currentTarget"]) {
              this.toggleDetails();
            }
          },
          onsapenter: oEvent => {
            if (oEvent["target"] === oEvent["currentTarget"]) {
              const titleNavigation = this.getProperty("titleNavigation");
              if (titleNavigation instanceof NavigationTarget) {
                titleNavigation.performNavigation();
              }
            }
          }
        });
      }
    },
    getAccessibilityInfo: function _getAccessibilityInfo(...args) {
      let accInfo = {};
      if (Control.prototype.getAccessibilityInfo) {
        accInfo = Control.prototype.getAccessibilityInfo.apply(this, args) || accInfo;
      }
      accInfo["description"] = ""; // description will be provided dynamically in _renderAccessibilityInformation
      return accInfo;
    },
    _renderAriaDescriptionElementForTitle: function _renderAriaDescriptionElementForTitle(oRm, withPrefix, doRender) {
      this._searchResultListPrefix = this._searchResultListPrefix || i18n.getText("result_list_announcement_screenreaders");
      let labelText = this.getProperty("title") + ", " + this.getProperty("type") + ".";
      if (withPrefix) {
        labelText = this._searchResultListPrefix + " " + labelText;
      }
      const titleLabeledByText = this.getAggregation("_titleLabeledByText");
      if (titleLabeledByText) {
        titleLabeledByText.setText(labelText);
      }
      if (doRender && oRm) {
        oRm.renderControl(titleLabeledByText);
      }
    },
    _renderAriaDescriptionElementForAttributes: function _renderAriaDescriptionElementForAttributes(oRm, doRender) {
      const attributesLabeledByText = this.getAggregation("_attributesLabeledByText");
      const domRef = this.getDomRef();
      if (!domRef) {
        return; // ToDo: function _renderAriaDescriptionElementForAttributes should not be called for invalidated items (i.e. click on list when table is active)
      }
      const attributes = domRef.querySelectorAll(".sapUshellSearchResultListItem-Attributes .sapUshellSearchResultListItem-MainAttribute");
      let labelledByText;
      if (attributes.length === 0) {
        labelledByText = i18n.getText("result_list_item_aria_no_attributes");
      } else {
        labelledByText = i18n.getText("result_list_item_aria_has_attributes");
        attributes.forEach(attrElem => {
          const isVisible = attrElem.offsetParent !== null && attrElem.getAttribute("aria-hidden") !== "true";
          if (isVisible) {
            const attributeKeyElem = attrElem.querySelector(".sapUshellSearchResultListItem-AttributeKey");
            const attributeKey = attributeKeyElem ? attributeKeyElem.textContent : "";
            const attributeValueContainer = attrElem.querySelector(".sapUshellSearchResultListItem-AttributeValueContainer");
            let attributeValueElem = attributeValueContainer && attributeValueContainer.querySelector(".sapUshellSearchResultListItem-AttributeValueContainer-HiddenText");
            if (!attributeValueElem) {
              attributeValueElem = attributeValueContainer;
            }
            const attributeValue = attributeValueElem ? attributeValueElem.textContent : "";
            labelledByText += i18n.getText("result_list_item_aria_attribute_and_value", [attributeKey, attributeValue]);
          }
        });
      }
      if (attributesLabeledByText) {
        attributesLabeledByText.setText(labelledByText);
      }
      if (doRender && oRm) {
        oRm.renderControl(attributesLabeledByText);
      }
    },
    _renderAriaDescriptionElementForCollapsedOrExpandedState: function _renderAriaDescriptionElementForCollapsedOrExpandedState(oRm, doRender) {
      const expandStateLabeledByText = this.getAggregation("_expandStateLabeledByText");
      let labelledByText;
      const expandButton = this.getAggregation("_expandButton");
      if (!expandButton) {
        return;
      }
      const expandButtonDom = expandButton.getDomRef();
      if (expandButtonDom && window.getComputedStyle(expandButtonDom).visibility !== "hidden") {
        if (this.isShowingDetails()) {
          labelledByText = i18n.getText("result_list_item_aria_expanded");
          const navigationObjects = this.getProperty("navigationObjects");
          if (Array.isArray(navigationObjects) && navigationObjects.length > 0) {
            labelledByText = i18n.getText("result_list_item_aria_has_links") + labelledByText;
          }
        } else {
          labelledByText = i18n.getText("result_list_item_aria_collapsed");
        }
      }
      expandStateLabeledByText.setText(labelledByText);
      if (doRender && oRm) {
        oRm.renderControl(expandStateLabeledByText);
      }
    },
    _addAriaDescriptionToParentListElement: function _addAriaDescriptionToParentListElement(parentListItem, includeTotalCountElement) {
      const titleLabeledByText = this.getAggregation("_titleLabeledByText");
      if (!titleLabeledByText) {
        return;
      }
      let itemAriaLabeledBy = titleLabeledByText.getId();
      if (includeTotalCountElement) {
        const countBreadcrumbsHiddenElement = this.getProperty("countBreadcrumbsHiddenElement");
        if (countBreadcrumbsHiddenElement) {
          itemAriaLabeledBy += " " + countBreadcrumbsHiddenElement.getId();
        }
      }
      const attributesLabeledByText = this.getAggregation("_attributesLabeledByText");
      itemAriaLabeledBy += " " + attributesLabeledByText.getId();
      const expandStateLabeledByText = this.getAggregation("_expandStateLabeledByText");
      itemAriaLabeledBy += " " + expandStateLabeledByText.getId();
      const parentDomRef = parentListItem.getDomRef();
      if (parentDomRef) {
        parentDomRef.setAttribute("aria-labelledby", itemAriaLabeledBy);
      }
    },
    _getExpandAreaObjectInfo: function _getExpandAreaObjectInfo() {
      const oModel = this.getModel();

      // get the root DOM element
      const resultListItemDomRef = this.getDomRef();
      if (!resultListItemDomRef) {
        throw new Error("DOM reference not found");
      }
      // add class for expansion preparation
      const domRef = this.getDomRef();
      domRef?.classList.add("sapUshellSearchResultListItem-AttributesPrepareExpansion");

      // find the attributes expand container and related objects toolbar
      const attributesExpandContainer = resultListItemDomRef.querySelector(".sapUshellSearchResultListItem-AttributesExpandContainer");
      const relatedObjectsToolbar = resultListItemDomRef.querySelector(".sapUshellSearchResultListItem-RelatedObjectsToolbar");
      let relatedObjectsToolbarHidden = false;
      if (relatedObjectsToolbar && window.getComputedStyle(relatedObjectsToolbar).display === "none" && !oModel.config.optimizeForValueHelp) {
        relatedObjectsToolbar.style.display = "block";
        relatedObjectsToolbarHidden = true;
      }
      const currentHeight = attributesExpandContainer ? attributesExpandContainer.offsetHeight : 0;
      const expandedHeight = resultListItemDomRef.querySelector(".sapUshellSearchResultListItem-AttributesAndActions")?.offsetHeight || 0;
      resultListItemDomRef.classList.remove("sapUshellSearchResultListItem-AttributesPrepareExpansion");
      if (relatedObjectsToolbar && relatedObjectsToolbarHidden) {
        relatedObjectsToolbar.style.display = "";
      }
      const elementsToFadeInOrOut = this._getElementsInExpandArea();
      const expandAnimationDuration = 200;
      const fadeInOrOutAnimationDuration = expandAnimationDuration / 10;
      const expandAreaObjectInfo = {
        resultListItem: this.getDomRef(),
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
    _getElementsInExpandArea: function _getElementsInExpandArea() {
      const domRef = this.getDomRef();
      const elementsToFadeInOrOut = [];
      if (!domRef) {
        return elementsToFadeInOrOut;
      }
      domRef.classList.add("sapUshellSearchResultListItem-AttributesPrepareExpansion");
      const attributeElements = Array.from(domRef.querySelectorAll(".sapUshellSearchResultListItem-GenericAttribute:not(.sapUshellSearchResultListItem-ImageAttribute)"));
      if (attributeElements.length > 0) {
        const firstLineY = attributeElements[0].getBoundingClientRect().top;
        attributeElements.forEach(el => {
          if (el.getBoundingClientRect().top > firstLineY) {
            elementsToFadeInOrOut.push(el);
          }
        });
      }
      domRef.classList.remove("sapUshellSearchResultListItem-AttributesPrepareExpansion");
      return elementsToFadeInOrOut;
    },
    // Sync the CSS class for selection state
    _syncSelectionCssClass: function _syncSelectionCssClass() {
      const selected = this.getProperty("selected");
      if (selected) {
        this.addStyleClass("sapUshellSearchResultListItem-Selected");
      } else {
        this.removeStyleClass("sapUshellSearchResultListItem-Selected");
      }
    },
    isShowingDetails: function _isShowingDetails() {
      const expandAreaObjectInfo = this._getExpandAreaObjectInfo();

      /////////////////////////////
      // Expand Result List Item
      if (expandAreaObjectInfo.currentHeight < expandAreaObjectInfo.expandedHeight) {
        return false;
      }
      return true;
    },
    showDetails: function _showDetails() {
      if (this.isShowingDetails()) {
        return;
      }
      const expandAreaObjectInfo = this._getExpandAreaObjectInfo();
      let attributesExpandContainer;
      if (expandAreaObjectInfo?.attributesExpandContainer) {
        attributesExpandContainer = expandAreaObjectInfo.attributesExpandContainer;
      }

      // set relatedObjectsToolbar opacity and display using native DOM
      if (expandAreaObjectInfo.relatedObjectsToolbar) {
        const relatedToolbar = expandAreaObjectInfo?.relatedObjectsToolbar;
        if (relatedToolbar) {
          relatedToolbar.style.opacity = "0";
          relatedToolbar.style.display = "block";
        }
      }
      const relatedObjectActionsToolbar = this.getAggregation("_relatedObjectActionsToolbar");
      if (relatedObjectActionsToolbar) {
        relatedObjectActionsToolbar.layoutToolbarElements();
      }
      const domRef = this.getDomRef();
      if (domRef) {
        domRef.classList.add("sapUshellSearchResultListItem-AttributesPrepareExpansion");
      }
      let relatedObjectsToolbar;
      if (expandAreaObjectInfo?.relatedObjectsToolbar) {
        relatedObjectsToolbar = expandAreaObjectInfo.relatedObjectsToolbar;
      }
      const elementsToFadeInOrOut = expandAreaObjectInfo.elementsToFadeInOrOut;
      const expandedHeight = expandAreaObjectInfo.expandedHeight;
      const expandAnimationDuration = expandAreaObjectInfo.expandAnimationDuration;
      const fadeInOrOutAnimationDuration = expandAreaObjectInfo.fadeInOrOutAnimationDuration;

      // animate height of attributesExpandContainer
      if (attributesExpandContainer) {
        attributesExpandContainer.style.transition = `height ${expandAnimationDuration}ms`;
        attributesExpandContainer.style.height = `${expandedHeight}px`;
      }

      // fade in elements in expand area
      elementsToFadeInOrOut.forEach(el => {
        el.style.transition = `opacity ${fadeInOrOutAnimationDuration}ms`;
        el.style.opacity = "1";
      });

      // fade in relatedObjectsToolbar
      if (relatedObjectsToolbar) {
        relatedObjectsToolbar.style.transition = `opacity ${expandAnimationDuration}ms`;
        setTimeout(() => {
          relatedObjectsToolbar.style.opacity = "1";
        }, expandAnimationDuration / 2);
      }

      // after animation, update state and clean up
      setTimeout(() => {
        this.setProperty("expanded", true, true);
        if (attributesExpandContainer) {
          attributesExpandContainer.classList.add("sapUshellSearchResultListItem-AttributesExpanded");
        }
        elementsToFadeInOrOut.forEach(el => {
          el.style.opacity = "";
          el.style.transition = "";
        });
        const domRef = this.getDomRef();
        if (domRef) {
          domRef.classList.remove("sapUshellSearchResultListItem-AttributesPrepareExpansion");
        }
        if (relatedObjectsToolbar) {
          relatedObjectsToolbar.style.display = "";
          relatedObjectsToolbar.style.opacity = "";
          relatedObjectsToolbar.style.transition = "";
        }
        // update expand button icon and tooltip
        const expandButton = this.getAggregation("_expandButton");
        if (expandButton) {
          expandButton.setTooltip(i18n.getText("hideDetailBtn_tooltip"));
          expandButton.setIcon(IconPool.getIconURI("slim-arrow-up"));
        }
        this._renderAriaDescriptionElementForAttributes(undefined, /* withPrefix = */ /* doRender= */false);
        this._renderAriaDescriptionElementForCollapsedOrExpandedState(undefined, /* withPrefix = */ /* doRender= */false);
      }, expandAnimationDuration);
    },
    hideDetails: function _hideDetails() {
      if (!this.isShowingDetails()) {
        return;
      }
      const expandAreaObjectInfo = this._getExpandAreaObjectInfo();
      const elementsToFadeInOrOut = expandAreaObjectInfo.elementsToFadeInOrOut;
      const expandAnimationDuration = expandAreaObjectInfo.expandAnimationDuration;
      const fadeInOrOutAnimationDuration = expandAreaObjectInfo.fadeInOrOutAnimationDuration;
      let fadeOutStarted = false;
      let attributesExpandContainer;
      if (expandAreaObjectInfo?.attributesExpandContainer) {
        attributesExpandContainer = expandAreaObjectInfo.attributesExpandContainer;
      }
      let relatedObjectsToolbar;
      if (expandAreaObjectInfo?.relatedObjectsToolbar) {
        relatedObjectsToolbar = expandAreaObjectInfo.relatedObjectsToolbar;
      }

      // fade out relatedObjectsToolbar
      if (relatedObjectsToolbar) {
        relatedObjectsToolbar.style.transition = `opacity ${expandAnimationDuration / 2}ms`;
        relatedObjectsToolbar.style.opacity = "0";
      }

      // calculate collapsed height (height of first attribute + spacer)
      const domRef = this.getDomRef();
      let attributeHeight = 0;
      if (domRef) {
        const mainAttr = domRef.querySelector(".sapUshellSearchResultListItem-MainAttribute");
        const spacerAttr = domRef.querySelector(".sapUshellSearchResultListItem-ExpandSpacerAttribute");
        if (mainAttr) {
          attributeHeight += mainAttr.offsetHeight;
        }
        if (spacerAttr) {
          attributeHeight += spacerAttr.offsetHeight;
        }
      }

      // after animation, update state and clean up
      const onTransitionEnd = event => {
        if (event.propertyName === "height") {
          if (attributesExpandContainer) {
            attributesExpandContainer.removeEventListener("transitionend", onTransitionEnd);
          }
          clearTimeout(fadeOutTimeout);
          // ensure fade out is done
          if (!fadeOutStarted) {
            elementsToFadeInOrOut.forEach(el => {
              el.style.opacity = "0";
            });
          }
          // clean up styles
          if (attributesExpandContainer) {
            attributesExpandContainer.classList.remove("sapUshellSearchResultListItem-AttributesExpanded");
            attributesExpandContainer.style.height = "";
            attributesExpandContainer.style.transition = "";
          }
          elementsToFadeInOrOut.forEach(el => {
            el.style.opacity = "";
            el.style.transition = "";
          });
          if (relatedObjectsToolbar) {
            relatedObjectsToolbar.style.opacity = "";
            relatedObjectsToolbar.style.transition = "";
          }
          this.setProperty("expanded", false, true);
          // update expand button icon and tooltip
          const expandButton = this.getAggregation("_expandButton");
          if (expandButton) {
            expandButton.setTooltip(i18n.getText("showDetailBtn_tooltip"));
            expandButton.setIcon(IconPool.getIconURI("slim-arrow-down"));
          }
          this._renderAriaDescriptionElementForAttributes(undefined, /* withPrefix = */ /* doRender= */false);
          this._renderAriaDescriptionElementForCollapsedOrExpandedState(undefined, /* withPrefix = */ /* doRender= */false);
        }
      };

      // animate height of attributesExpandContainer
      if (attributesExpandContainer) {
        attributesExpandContainer.addEventListener("transitionend", onTransitionEnd);
        attributesExpandContainer.style.transition = `height ${expandAnimationDuration}ms`;
        attributesExpandContainer.style.height = `${attributeHeight}px`;
      }

      // fade out elements in expand area (after most of the collapse animation)
      const fadeOutTimeout = setTimeout(() => {
        fadeOutStarted = true;
        elementsToFadeInOrOut.forEach(el => {
          el.style.transition = `opacity ${fadeInOrOutAnimationDuration}ms`;
          el.style.opacity = "0";
        });
      }, expandAnimationDuration - fadeInOrOutAnimationDuration);
    },
    toggleDetails: function _toggleDetails() {
      let eventType;
      const oModel = this.getModel();
      if (this.isShowingDetails()) {
        eventType = UserEventType.ITEM_HIDE_DETAILS;
        this.hideDetails();
      } else {
        eventType = UserEventType.ITEM_SHOW_DETAILS;
        this.showDetails();
      }
      oModel.eventLogger.logEvent({
        type: eventType,
        itemPosition: this.getProperty("positionInList"),
        executionId: this.getProperty("resultSetId"),
        dataSourceKey: oModel.getDataSource().id
      });
    },
    // after rendering
    // ===================================================================
    onAfterRendering: function _onAfterRendering() {
      this._showOrHideExpandButton();
      // this._setListItemStatusBasedOnWindowSize();

      this._renderAriaDescriptionElementForTitle(undefined, /* withPrefix = */false, /* doRender= */false);
      this._renderAriaDescriptionElementForAttributes(undefined, /* withPrefix = */ /* doRender= */false);
      this._renderAriaDescriptionElementForCollapsedOrExpandedState(undefined, /* withPrefix = */ /* doRender= */false);
      this._syncSelectionCssClass();
      // use boldtagunescape like in highlighting for suggestions // TODO
    },
    resizeEventHappened: function _resizeEventHappened() {
      this._showOrHideExpandButton();
      // this._setListItemStatusBasedOnWindowSize();

      const titleLink = this.getAggregation("_titleLink");
      const titleText = this.getAggregation("_titleText");
      const titleControl = titleLink.getDomRef() ? titleLink : titleText;
      const oModel = this.getModel();
      if (this.supportsDragAndDrop(titleLink, oModel)) {
        if (oModel.config.optimizeForValueHelp) {
          const titleControlDom = titleControl.getDomRef();
          titleControlDom.draggable = false;
        }
      }
    },
    // ===================================================================
    //  some Helper Functions
    // ===================================================================
    isHierarchyItem: function _isHierarchyItem() {
      return this.getProperty("titleIconUrl") === "sap-icon://folder-blank"; // ToDo: Remove workaround
    },
    supportsDragAndDrop: function _supportsDragAndDrop(oControl, oModel) {
      return typeof oModel.getSearchCompositeControlInstanceByChildControl(oControl) !== "undefined" && oModel.getSearchCompositeControlInstanceByChildControl(oControl).getDragDropConfig().length > 0;
    },
    _getPhoneSize: function _getPhoneSize() {
      return 767;
    },
    _resetPrecalculatedValues: function _resetPrecalculatedValues() {
      this._visibleAttributes = undefined;
      this._detailsArea = undefined;
      this._showExpandButton = false;
    },
    /* private _setListItemStatusBasedOnWindowSize() {
        const windowWidth = window.innerWidth;
        const parentListItem = this.getProperty("parentListItem");
        if (this.getProperty("titleNavigation") && windowWidth <= this._getPhoneSize()) {
            parentListItem.setType(ListType.Active);
        } else {
            parentListItem.setType(ListType.Inactive);
        }
    } */
    _showOrHideExpandButton: function _showOrHideExpandButton() {
      const domRef = this.getDomRef();
      if (!domRef) {
        return;
      }
      const expandButtonContainer = domRef.querySelector(".sapUshellSearchResultListItem-ExpandButtonContainer");
      if (!expandButtonContainer) {
        return;
      }
      const isVisible = window.getComputedStyle(expandButtonContainer).visibility !== "hidden";
      let shouldBeVisible = false;
      const isDocumentItem = this.getProperty("imageFormat")?.toLowerCase() === "documentthumbnail";
      if (!isDocumentItem) {
        const actionBar = domRef.querySelectorAll(".sapUshellSearchResultListItem-RelatedObjectsToolbar");
        shouldBeVisible = actionBar.length > 0;
      }
      if (!isDocumentItem && !shouldBeVisible) {
        const elementsInExpandArea = this._getElementsInExpandArea();
        if (elementsInExpandArea.length > 0) {
          shouldBeVisible = true;
        }
      }
      if (isVisible && !shouldBeVisible) {
        expandButtonContainer.style.visibility = "hidden";
        expandButtonContainer.setAttribute("aria-hidden", "true");
        this.setAriaExpandedState();
      } else if (!isVisible && shouldBeVisible) {
        expandButtonContainer.style.visibility = "";
        expandButtonContainer.removeAttribute("aria-hidden");
        this.setAriaExpandedState();
      }
    },
    setAriaExpandedState: function _setAriaExpandedState() {
      const expandButton = this.getAggregation("_expandButton");
      if (!expandButton) {
        return;
      }
      const expandButtonDom = expandButton.getDomRef();
      const thisDom = this.getDomRef();
      let parentListItemDom = null;
      const parentListItem = this.getProperty("parentListItem");
      if (parentListItem) {
        parentListItemDom = parentListItem.getDomRef();
      } else if (thisDom) {
        parentListItemDom = thisDom.closest("li");
      }
      const expandButtonContainer = thisDom?.querySelector(".sapUshellSearchResultListItem-ExpandButtonContainer");
      if (expandButtonContainer && window.getComputedStyle(expandButtonContainer).visibility === "hidden") {
        if (expandButtonDom) {
          expandButtonDom.removeAttribute("aria-expanded");
        }
        if (parentListItemDom) {
          parentListItemDom.removeAttribute("aria-expanded");
        }
      } else {
        const expanded = this.getProperty("expanded");
        if (expandButtonDom) {
          expandButtonDom.setAttribute("aria-expanded", expanded ? "true" : "false");
        }
        if (parentListItemDom) {
          parentListItemDom.setAttribute("aria-expanded", expanded ? "true" : "false");
        }
      }
    },
    _registerItemPressHandler: function _registerItemPressHandler() {
      const parentListItem = this.getProperty("parentListItem");
      if (parentListItem) {
        parentListItem.attachPress(oEvent => {
          this._performTitleNavigation({
            event: oEvent
          });
        });
        this._registerItemPressHandler = () => {
          //
        };
      }
    },
    _performTitleNavigation: function _performTitleNavigation(params) {
      const titleNavigation = this.getProperty("titleNavigation");
      if (titleNavigation instanceof NavigationTarget) {
        titleNavigation.performNavigation({
          event: params?.event
        });
      }
    },
    adjustCssDragAndDrop: function _adjustCssDragAndDrop(value, oModel) {
      // Drag&Drop - cursor 'grab'
      setTimeout(() => {
        if (typeof oModel.getSearchCompositeControlInstanceByChildControl(value) !== "undefined" && oModel.getSearchCompositeControlInstanceByChildControl(value).getDragDropConfig().length > 0) {
          value.addStyleClass("sapUshellSearchResultListItem-SupportsDragAndDrop");
        }
      });
    }
  });
  SearchResultListItem.noValue = initialValueUnicode;
  return SearchResultListItem;
});
//# sourceMappingURL=SearchResultListItem-dbg.js.map

/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/m/Button",
    "sap/m/Dialog",
    "./utils/InsightsUtils",
    "sap/ui/integration/widgets/Card",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/m/ScrollContainer",
    "./utils/AppConstants",
    "./utils/CardSkeletonManifest",
    "sap/m/MessageToast",
    "sap/base/Log",
    "sap/m/IllustratedMessage",
    "sap/ui/performance/trace/FESRHelper",
    "sap/m/Title",
    "sap/m/Label",
    "sap/m/FlexBox",
    "sap/m/Toolbar",
    "sap/m/TextArea",
    "sap/m/Text",
    "sap/m/MessageStrip",
    "sap/ui/core/Icon",
    "sap/m/MessageBox",
    "sap/m/Token",
    "sap/m/Tokenizer",
    "sap/m/IllustratedMessageSize",
    "sap/m/IllustratedMessageType",
    "sap/m/FormattedText",
    "sap/m/ToggleButton",
    "sap/m/library",
    "sap/ui/core/library"
], function (
    Control,
    Button,
    Dialog,
    InsightsUtils,
    Card,
    VBox,
    HBox,
    ScrollContainer,
    AppConstants,
    CardSkeletonManifest,
    MessageToast,
    Log,
    IllustratedMessage,
    FESRHelper,
    Title,
    Label,
    FlexBox,
    Toolbar,
    TextArea,
    Text,
    MessageStrip,
    Icon,
    MessageBox,
    Token,
    Tokenizer,
    IllustratedMessageSize,
    IllustratedMessageType,
    FormattedText,
    ToggleButton,
    library,
    coreLibrary
) {
    "use strict";

    var FlexWrap = library.FlexWrap;
    var ValueState = coreLibrary.ValueState;
    var oCardManifest = JSON.parse(JSON.stringify(CardSkeletonManifest));
    var oPlaceHolderManifest = JSON.parse(JSON.stringify(CardSkeletonManifest));

    /**
     * Constructor for  ManageAddCardWithSearch control.
     *
     * @class
     * This control is wrapper for and opens a dialog for search cards to insight
     * @extends sap.ui.core.Control
     * @private
     *
     * @since since 1.130.0
     *
     * @alias sap.insights.ManageAddCardWithSearch
     */

    var ManageAddCardWithSearch = Control.extend("sap.insights.ManageAddCardWithSearch", {
        renderer: null, // This control is wrapper and has no renderer
        metadata: {
            events: {
                /**
                 * onAddButtonPress event triggerd when the confirm button is pressed
                 * if not passed the default add card to my home happens
                 */
                onAddButtonPress: {
                    parameters: {
                        /**
                         * Manifest to be passed as a string
                         */
                        manifest: { type: "string" }
                    }
                },
                onCardGenerated: {
                    parameters: {
                        /**
                         * Manifest to be passed as a string
                         */
                        manifest: { type: "string" }
                    }
                }
            },
            aggregations: {
                /**
                 * Hidden aggregation of dialog control which opens when openDialog() is called for this control
                 */
                _queryDialog: {
                    type: "sap.m.Dialog",
                    multiple: false,
                    visibility: "hidden"
                }
            }
        }
    });

    /**
     * Initializes the control.
     * @returns {void}
     */
    ManageAddCardWithSearch.prototype.init = function () {
        this.i18Bundle = InsightsUtils.getResourceBundle();
        this._createStaticControls();
        this._getQueryDialog();
    };

    /**
     * Creates the dialog control and set it as _queryDialog aggregation.
     * @returns {sap.m.Dialog} The _queryDialog control
     * @private
     * @experimental since 1.130.0
     *
     */
    ManageAddCardWithSearch.prototype._getQueryDialog = function () {
        if (!this.getAggregation("_queryDialog")) {
            var _oManageDialog = new Dialog({
                title: this.i18Bundle.getText("addToInsights"),
                content: [this._getOuterVbox()],
                showHeader: true,
                contentHeight: "41.1rem",
                contentWidth: "59.3rem",
                verticalScrolling: false,
                horizontalScrolling: false,
                afterClose: this.resetDialog.bind(this, true),
                escapeHandler: this.closeDialog.bind(this),
                afterOpen: this.afterOpenDialog.bind(this),
                beginButton: this._getAddButton(),
                endButton: this._getCancelButton()
            });
            this.setAggregation("_queryDialog", _oManageDialog, true);
        }
        return this.getAggregation("_queryDialog");
    };

    /**
     * Creates static controls while initializing the control
     * @returns {void}
     * @private
     * @experimental since 1.130.0
     */
     ManageAddCardWithSearch.prototype._createStaticControls = function () {
        var oInnerControl = {};


        oInnerControl.searchedCard = new Card(this.getId() + "--searchedCard",{
            manifest: oCardManifest,
            manifestApplied: this._setAriaTextOnManifest.bind(this),
            width: "20.18rem",
            height: "29rem",
            previewMode: "Abstract",
            visible: true
        });

        oInnerControl.placeholder = new Card(this.getId() + "--placeholderCard",{
            manifest: oPlaceHolderManifest,
            manifestReady: this._onManifestReady.bind(this),
            width: "20.18rem",
            height: "27.5rem",
            previewMode: "Off",
            visible: false
        }).addStyleClass("sapUiTinyMarginTopBottom");

        oInnerControl.oAddButton = new Button(this.getId() + "--addButton", {
            text: this.i18Bundle.getText("INT_DIALOG_Ok"),
            press: this.addCard.bind(this),
            type: "Emphasized",
            enabled: false
        });
        FESRHelper.setSemanticStepname(oInnerControl.oAddButton, "press", AppConstants.FESR_AIGENERATE_ADD_CARD);

        oInnerControl.oCancelButton = new Button(this.getId() + "--cancelButton", {
            text: this.i18Bundle.getText("cancelButton"),
            press: this.closeDialog.bind(this)
        });
        FESRHelper.setSemanticStepname(oInnerControl.oCancelButton, "press", AppConstants.FESR_AIGENERATE_CANCEL);
        oInnerControl.oThumbsUpButton = new ToggleButton(this.getId() + "--thumbsUp", {
            icon: "sap-icon://thumb-up",
            type: "Transparent",
            tooltip: this.i18Bundle.getText('thumbsUpButton'),
            pressed: false,
            press: this._sendFeedback.bind(this, "thumbsUp")
        });
        FESRHelper.setSemanticStepname(oInnerControl.oThumbsUpButton, "press", AppConstants.FESR_AIGENERATE_THUMBSUP);
        oInnerControl.oThumbsDownButton = new ToggleButton(this.getId() + "--thumbsDown", {
            icon: "sap-icon://thumb-down",
            type: "Transparent",
            tooltip: this.i18Bundle.getText('thumbsDownButton'),
            pressed: false,
            press: this._sendFeedback.bind(this, "thumbsDown")
        }).addStyleClass("sapUiTinyMarginBegin");
        FESRHelper.setSemanticStepname(oInnerControl.oThumbsDownButton, "press", AppConstants.FESR_AIGENERATE_THUMBSDOWN);

        oInnerControl.messageStripHbox = this._createMessageStripHBox();
        oInnerControl.messageStripHbox.addItem(oInnerControl.oThumbsUpButton);
        oInnerControl.messageStripHbox.addItem(oInnerControl.oThumbsDownButton);

        oInnerControl.oNoCardMessage = new IllustratedMessage(this.getId() + "--editInsightNoInsightsCardsMsg", {
            illustrationSize: IllustratedMessageSize.Medium,
            illustrationType: IllustratedMessageType.NoEntries,
            description: " "
        }).addStyleClass("sapFIllustratedMessageAlign sapFFrequentIllustratedMessageAlign");
        oInnerControl.noCardBox = new VBox(this.getId() + "--illusCardVbox", {
            alignItems: "Center",
            height: "100%",
            renderType: "Bare",
            justifyContent: "Center",
            items: [
                oInnerControl.oNoCardMessage
            ],
            visible: false
        }).addStyleClass("aiErrorPadding");

        var oTypedText = new Text(this.getId() + "--label",{
            text: this.i18Bundle.getText('typed_text_label'),
            wrapping: true
        }).addStyleClass("sapUiSmallMarginBeginEnd sapUiSmallMarginTop");
        const MAX_CHAR_LIMIT = 500;
        oInnerControl.oTextBox = new TextArea(this.getId() + "--textBox", {
            width: "calc(100% - 2rem)",
            height: "7rem",
            placeholder: this.i18Bundle.getText("SAMPLE_QUERY_MSG") + " " + this.i18Bundle.getText("SAMPLE_QUERY_TEXT"),
            maxLength: MAX_CHAR_LIMIT,
            showExceededText: true,
            liveChange: this.onChange.bind(this)
        }).addStyleClass("sapUiNoMarginBottom sapUiSmallMarginBeginEnd sapUiTinyMarginTop");
        //on enter of TextBox trigger search
        oInnerControl.oTextBox.attachBrowserEvent("keydown", function(oEvent) {
            if (oEvent.keyCode === 13 && oInnerControl.oRegenerateButton.getEnabled()) {
                this._onSearch();
            }
        }.bind(this));

        oInnerControl.oRegenerateButton = new Button(this.getId() + "--searchButton", {
            type: "Default",
            icon: "sap-icon://ai",
            text: this.i18Bundle.getText('GO'),
            press: this._onSearch.bind(this),
            enabled: false
        }).addStyleClass("sapUiSmallMarginBegin");
        FESRHelper.setSemanticStepname( oInnerControl.oRegenerateButton, "press", AppConstants.FESR_AIGENERATE_CARD);

        oInnerControl.oClearButton = new Button(this.getId() + "--clearButton", {
            type: "Transparent",
            text: this.i18Bundle.getText('Clear'),
            enabled: false,
            press: this._onClear.bind(this)
        }).addStyleClass("sapUiTinyMarginBegin sapUiSmallMarginEnd");
        FESRHelper.setSemanticStepname( oInnerControl.oClearButton, "press", AppConstants.FESR_AIGENERATE_CLEARALL);

        var oButtonHBox = new HBox(this.getId() + "--buttonHBox",{
            width: "100%",
            alignItems: "End",
            renderType: "Bare",
            justifyContent: "End",
            items:[oInnerControl.oRegenerateButton,  oInnerControl.oClearButton]
        }).addStyleClass("sapUiTinyMarginTop");

        var oHelpIcon = new Icon(this.getId() + "--helpIcon", {
            src: "sap-icon://sys-help",
            size: "0.875rem",
            height: "0.875rem",
            color: "Neutral"
        });
        var oSampleQueryLabel = new Label(this.getId() + "--sampleQueryLabel",{
            text: this.i18Bundle.getText('SAMPLE_QUERY')
        }).addStyleClass("sapUiTinyMarginBegin");

        var oQueryHbox = new HBox(this.getId() + "--queryHbox",{
            width: "calc(100% - 1rem)",
            justifyContent: "Start",
            backgroundDesign: "Transparent",
            renderType: "Bare",
            alignItems: "Center",
            items: [
                oHelpIcon, oSampleQueryLabel
            ]
        }).addStyleClass("sapUiSmallMarginBegin sapUiMediumMarginTop");
        oInnerControl.oFilterHBox = new VBox(this.getId() + "--filterHBox", {
            width: "calc(100% - 1rem)",
            alignItems: "Start",
            justifyContent: "Start",
            renderType: "Bare",
            items: [
                new Label({
                    text: this.i18Bundle.getText("INT_TOKEN_INFO"),
                    showColon: true,
                    wrapping: true
                }).addStyleClass("sapUiSmallMarginBegin"),
                new Tokenizer({
                    editable: false,
                    renderMode: "Narrow",
                    width: "calc(100%)",
                    visible: true
                }).addStyleClass("sapUiTinyMarginTop sapUi-Std-PaddingS sapUiSmallMarginBegin customPaddingToken")
            ],
            visible: false
        }).addStyleClass("sapUiTinyMarginTop");

        var oTokenizer = oInnerControl.oFilterHBox.getItems()?.[1];
        if (oTokenizer) {
            var sLastInteractionType = "mouse";
            document.addEventListener("keydown", function () {
                sLastInteractionType = "keyboard";
            });
            oTokenizer.attachRenderModeChange(function () {
                var bIsFocused = oTokenizer.getDomRef()?.contains(document.activeElement);
                var sMode = sLastInteractionType === "keyboard" && bIsFocused ? "Loose" : "Narrow";
                oTokenizer.setRenderMode(sMode);
            });
        }

        var oDefaultQueryVBox = new FlexBox(this.getId() + "--defaultPreviewFormFlex",{
            height: "100%",
            width: "50%",
            direction: "Column",
            renderType: "Bare",
            items: [
                oTypedText, oInnerControl.oTextBox, oButtonHBox, oInnerControl.oFilterHBox, oQueryHbox, this._createSampleQueryListBox()
            ]
        });
        var oDefaultPreviewCardText = new Title(this.getId() + "--defaultPreviewCardText",{
            text: this.i18Bundle.getText("INT_DIALOG_TITLE_CardPreview"),
            textAlign: "Left",
            titleStyle: "H3"
        }).addStyleClass("sapUiSmallMarginTop customCardsPreviewTitle");

        var oDefaultPreviewHBox = new HBox(this.getId() + "--defaultPreviewHBox",{
            width: "100%",
            height: "100%",
            justifyContent: "Start",
            backgroundDesign: "Transparent",
            renderType: "Bare",
            items: [
                oDefaultPreviewCardText
            ]
        }).addStyleClass("sapUiTinyMarginBegin");
        var oDefaultPreviewToolBar = new Toolbar(this.getId() + "--defaultPreviewToolBar",{
            width: "100%",
            height: "2rem",
            style: "Clear",
            design: "Auto",
            content: [
                oDefaultPreviewHBox
            ]
        }).addStyleClass("sapThemeBaseBG");
        var oInsightsCardOverflowInnerHBox = new HBox(this.getId() + "--insightsCardOverflowInnerHBox",{
            width: "20.18rem",
            height: "2rem"
        }).addStyleClass("insightsCardOverflowLayer insightsCardOverflowTop");

        oInnerControl.oInsightsCardOverflowLayer = new HBox(this.getId() + "--insightsCardOverflowLayer",{
            height: "0",
            visible: false,
            items: [
                oInsightsCardOverflowInnerHBox
            ]
        }).addStyleClass("sapMFlexBoxJustifyCenter");
        var oDefaultPreviewVBox = new VBox(this.getId() + "--defaultPreviewVBox",{
            height: "100%",
            alignItems: "Center",
            backgroundDesign: "Transparent",
            justifyContent: "SpaceAround",
            items: [
                oInnerControl.searchedCard ,
                oInnerControl.placeholder,
                oInnerControl.oInsightsCardOverflowLayer,
                oInnerControl.messageStripHbox
            ]
        });
        var oDefaultPreviewInnerVBox = new VBox(this.getId() + "--defaultPreviewInnerVBox",{
            height: "100%",
            backgroundDesign: "Transparent",
            justifyContent: "Center",
            items: [
                oDefaultPreviewVBox
            ]
        }).addStyleClass("sapUiTinyMarginTop sapUiSmallMarginBeginEnd");
        oInnerControl.oDefaultPreviewPanelFlex = new FlexBox(this.getId() + "--defaultPreviewPanelFlex",{
            height: "100%",
            backgroundDesign: "Transparent",
            renderType: "Bare",
            justifyContent: "Center",
            items: [
                oDefaultPreviewInnerVBox
            ]
        }).addStyleClass("sapUiSmallMarginTop");
        var noHeaderNavigationStrip = new MessageStrip(this.getId() + "--noHeaderNavigationStrip",{
            text: this.i18Bundle.getText("NO_HEADER_NAVIGATION_MSG"),
            showIcon: true,
            showCloseButton: false
        });
        oInnerControl.noHeaderNavigationBox = new HBox(this.getId() + "--noHeaderNavigationBox",{
            alignItems: "Center",
            renderType: "Bare",
            width: "calc(100% - 2rem)",
            height: "3rem",
            visible: false,
            justifyContent: "Start",
            backgroundDesign: "Transparent",
            items: [
                noHeaderNavigationStrip
            ]
        }).addStyleClass("sapUiSmallMarginBeginEnd sapUiTinyMarginTopBottom");
        var busyMessageStrip = new MessageStrip(this.getId() + "--busyMessageStrip",{
            text: this.i18Bundle.getText("CARD_GENERATE_MSG"),
            showIcon: true,
            showCloseButton: false
        });
        oInnerControl.busyMessageBox = new HBox(this.getId() + "--busyMessageBox",{
            alignItems: "Center",
            renderType: "Bare",
            width: "calc(100% - 2rem)",
            height: "3rem",
            visible: false,
            justifyContent: "Start",
            backgroundDesign: "Transparent",
            items: [
                busyMessageStrip
            ]
        }).addStyleClass("sapUiSmallMarginBeginEnd sapUiSmallMarginTop");
        var oDefaultPreviewScroll = new ScrollContainer(this.getId() + "--defaultPreviewScroll",{
            vertical: true,
            horizontal: false,
            height: "100%",
            content: [
                oDefaultPreviewToolBar,
                oInnerControl.noHeaderNavigationBox,
                oInnerControl.busyMessageBox,
                oInnerControl.oDefaultPreviewPanelFlex,
                oInnerControl.noCardBox
            ]
        });
        var oPreviewFlexBox = new FlexBox(this.getId() + "--defaultPreviewFlex",{
            height: "100%",
            width: "50%",
            direction: "Column",
            renderType: "Bare",
            items: [
                oDefaultPreviewScroll
            ]
        }).addStyleClass("sapMPageBgStandard");
        oInnerControl.oDefaultVBox = new VBox(this.getId() + "--defaultVBox",{
            height: "100%",
            width: "100%",
            direction: "Row",
            justifyContent: "SpaceBetween",
            items: [
                oDefaultQueryVBox,
                oPreviewFlexBox
            ]
        });
        this._setAccessMethods(oInnerControl);
    };
    /**
	 * Generates the AI policy text with a link for display below the generated card.
	 *
	 * @private
	 * @returns {string} The formatted AI policy text.
	 */

    ManageAddCardWithSearch.prototype._generateAIPolicyText = function() {
        const linkText = this.i18Bundle.getText("createdWithAI");
		return this.i18Bundle.getText("aiPolicyText", [linkText]);
    };

    /**
     * Handles the feedback button press by toggling the pressed state of
     * the thumbs up and thumbs down buttons.
     * Also shows a confirmation message to the user.
     *
     * @param {"thumbsUp" | "thumbsDown"} feedbackType - The type of feedback provided by the user.
     *        Should be either "thumbsUp" or "thumbsDown".
     *
     * @private
     */
	ManageAddCardWithSearch.prototype._sendFeedback = function(feedbackType) {
          const buttons = {
              thumbsUp: this._getThumbsUpButton(),
              thumbsDown: this._getThumbsDownButton()
          };

          // Reset all buttons first
          Object.values(buttons).forEach(function (button) {
            button.setPressed(false);
          });

          // Set the selected button if it's a valid type
          if (buttons[feedbackType]) {
              buttons[feedbackType].setPressed(true);
          }
          MessageToast.show(this.i18Bundle.getText("feedBackSent"));
	};

    /**
     * Creates and returns an HBox containing AI text and verification text.
     * @private
     * @returns {sap.m.HBox} The HBox containing the AI text and verification text.
     */
    ManageAddCardWithSearch.prototype._createMessageStripHBox = function() {
        var aiPolicyText = this._generateAIPolicyText();
        var oLabel = new Label(this.getId() + "--createdwithAI", {
            text: aiPolicyText
        }).addStyleClass("sapUiTinyMarginEnd");

        var oMessageStripHBox = new HBox(this.getId() + "--messageHBox", {
            alignItems: "Baseline",
            renderType: "Bare",
            width: "auto",
            visible: false,
            height: "auto",
            justifyContent: "Start",
            backgroundDesign: "Transparent",
            wrap: FlexWrap.Wrap,
            items: [
                oLabel
            ]
        }).addStyleClass('sapUiTinyMarginTop sapUiSmallMarginBegin');

        return oMessageStripHBox;
    };

    /**
     * Create and return a query item label HBox.
     * @private
     * @param {number} idx The index of the query item.
     * @param {string} sKey The i18n key for the query item message.
     * @returns {sap.m.HBox} The HBox containing the query item label.
     */
    ManageAddCardWithSearch.prototype._setQueryItem =  function(idx, sKey) {

        var setLabelNo = function(idx) {
            return idx + ". ";
        };
        var oLabel =  new Label(this.getId() + "--queryItem" + idx,{
            text: setLabelNo(idx),
            wrapping: true
        }).addStyleClass("aiDialogText sapUiTinyMarginEnd");

        var oQueryLabelMsg = new Label(this.getId() + "--queryListItem" + idx,{
            showColon: false,
            text: this.i18Bundle.getText(sKey),
            wrapping: true
        }).addStyleClass("aiDialogText");
        var oQueryBox = new HBox(this.getId() + "--queryListBox" + idx,{
            items:[oLabel, oQueryLabelMsg]}).addStyleClass("sapUiTinyMarginTop");
        return oQueryBox;
    };

    /**
     * Creates and returns a VBox containing query labels.
     * @private
     * @returns {sap.m.VBox} The VBox containing the query labels.
     */
    ManageAddCardWithSearch.prototype._createSampleQueryListBox = function() {

        var oSampleQueryListBox = new VBox(this.getId() + "--sampleQueryListBox", {
            alignItems: "Start",
            justifyContent: "Start",
            backgroundDesign: "Transparent",
            renderType: "Bare",
            items: [
                this._setQueryItem(1, 'QUERY_LIST_ITEM1'),
                this._setQueryItem(2, 'QUERY_LIST_ITEM2'),
                this._setQueryItem(3, 'QUERY_LIST_ITEM3')
            ]
        }).addStyleClass("sapUiSmallMarginBeginEnd");

        return oSampleQueryListBox;
    };

    ManageAddCardWithSearch.prototype.getDialogInnerContent = function() {
        return this._getOuterVbox();
    };
    /**
     * Sets various access methods for managing and interacting with the internal controls.
     * These methods are designed to encapsulate the private controls and prevent direct
     * access to them from outside the class.
     *
     * @param {Object} oInnerControls - The object containing inner private controls.
     * @private
     * @experimental since 1.130.0
     */
    ManageAddCardWithSearch.prototype._setAccessMethods = function(oInnerControls) {

        /**
         * Method to access the searchedCard control.
         */
        this._getSearchedCard = function() {
            return oInnerControls && oInnerControls.searchedCard;
        };

        /**
         * Method to access the thumbsUp button control.
         */
        this._getThumbsUpButton = function() {
            return oInnerControls && oInnerControls.oThumbsUpButton;
        };

        /**
         * Method to access the thumbsDown button control.
         */
        this._getThumbsDownButton = function() {
            return oInnerControls && oInnerControls.oThumbsDownButton;
        };

        /**
         * Method to access the placeholder card control.
         */
        this._getPlaceholder = function() {
            return oInnerControls && oInnerControls.placeholder;
        };
        /**
         * Method to access the add button.
         */
        this._getAddButton = function() {
            return oInnerControls && oInnerControls.oAddButton;
        };

        /**
         * Method to access the cancel button.
         */
        this._getCancelButton = function() {
            return oInnerControls && oInnerControls.oCancelButton;
        };

        /**
         * Method to interact with the add button.
         * Enables or disables the add button and sets focus if enabled.
         */
        this._enableFocusAddButton = function(enable) {
            if (oInnerControls && oInnerControls.oAddButton) {
                oInnerControls.oAddButton.setEnabled(enable);
                //if enable set focus on add button
                if (enable) {
                    setTimeout(function(){
                        oInnerControls.oAddButton.focus();
                    },0);
                }
            }
        };

        /**
         * Method to access the text box
         */
        this._getTextBox = function() {
            return oInnerControls && oInnerControls.oTextBox;
        };

        /**
         * Method to set the visibility of the message strip and overflow layer
         */
        this._setMessageStripOverflowVisibility = function(bVisible) {
            if (oInnerControls && oInnerControls.messageStripHbox && oInnerControls.oInsightsCardOverflowLayer) {
                oInnerControls.messageStripHbox.setVisible(bVisible);
                oInnerControls.oInsightsCardOverflowLayer.setVisible(bVisible);
            }
        };

        /**
         * Method to access the no card message.
         */
        this._getNoCardMessage = function() {
            return oInnerControls && oInnerControls.oNoCardMessage;
        };

        /**
         * Method to access the default preview panel flex.
         */
        this._getDefaultPreviewPanelFlex = function() {
            return oInnerControls && oInnerControls.oDefaultPreviewPanelFlex;
        };

        /**
         * Toggles the visibility of the noHeaderNavigationBox message strip.
         *
         * @param {boolean} bVisible - `true` to show the message strip, `false` to hide it.
         */
        this.noHeaderNavigationBox = function(bVisible) {
            oInnerControls.noHeaderNavigationBox.setVisible(bVisible);
        };

        /**
         * Method to toggle the visibility of the card box.
         */
        this._toggleCardBox = function(bVisible) {
            oInnerControls.oDefaultPreviewPanelFlex.setVisible(bVisible);
            oInnerControls.noCardBox.setVisible(!bVisible);
        };

        /**
         * Toggles the enabled state of the text box, busy message box, and regenerate button.
         */
        this._toggleButtonAndText = function(bEnable) {
            oInnerControls.oTextBox.setEnabled(bEnable);
            this._toggleStyleClass(bEnable);
            oInnerControls.busyMessageBox.setVisible(!bEnable);
            oInnerControls.oRegenerateButton.setEnabled(bEnable);
            oInnerControls.oThumbsUpButton.setPressed(!bEnable);
            oInnerControls.oThumbsDownButton.setPressed(!bEnable);
            this._enableClearButton(bEnable);
        };

        this._toggleStyleClass = function(bEnable) {
            if (bEnable) {
                if (!oInnerControls.oDefaultPreviewPanelFlex.hasStyleClass('sapUiSmallMarginTop')) {
                    oInnerControls.oDefaultPreviewPanelFlex.addStyleClass("sapUiSmallMarginTop");
                }
            } else {
                oInnerControls.oDefaultPreviewPanelFlex.removeStyleClass("sapUiSmallMarginTop");
            }
        };

        /**
         * Enables or disables the clear button.
         */
        this._enableClearButton = function(bEnable) {
            oInnerControls.oClearButton.setEnabled(bEnable);
        };

        /**
         * Enables or disables the Regenerate button.
         */
         this._enableRegenerateButton = function(bEnable) {
            oInnerControls.oRegenerateButton.setEnabled(bEnable);
        };

        /**
         * Method to access the outer VBox.
         */
        this._getOuterVbox = function () {
            return oInnerControls && oInnerControls.oDefaultVBox;
        };

        /**
         * Method to access the outer filter tokens HBox.
         */
        this._getFilterHBox = function() {
            return oInnerControls && oInnerControls.oFilterHBox;
        };

    };

    /**
     * Reset the textbox and card preview on clear all
     * @returns {void}
     */
    ManageAddCardWithSearch.prototype._onClear = function() {
        this.resetDialog(true);
        MessageToast.show(this.i18Bundle.getText("Query_Deleted"));
        this.fireOnCardGenerated({});
        this._getTextBox().focus();
    };

    /**
     * Add card to insights section
     * @returns {void}
     * @private
     */
    ManageAddCardWithSearch.prototype.addCard = function(){
        var oManifest = this._getSearchedCard() && this._getSearchedCard().getManifest();
        this.getAggregation("_queryDialog").setBusy(true);
        sap.ui.require(["sap/insights/CardHelper"], function (CardHelper) {
            CardHelper.getServiceAsync().then(function (oService) {
                oService._createCard(oManifest).then(function (oReponse) {
                    this.getAggregation("_queryDialog").setBusy(false);
                    MessageToast.show(this.i18Bundle.getText("Card_Created"));
                    this.closeDialog();
                    if (!oReponse['sap.insights'].visible) {
                        MessageBox.information(this.i18Bundle.getText("INT_CARD_LIMIT_MESSAGEBOX"), {
                            styleClass: "msgBoxAlign"
                        });
                    }
                    if (this.hasListeners("onAddButtonPress")) {
                        this.fireOnAddButtonPress();
                    }
                }.bind(this));
            }.bind(this))
            .catch(function(oErr){
                this.getAggregation("_queryDialog").setBusy(false);
                Log.error(oErr.message);
                MessageToast.show(oErr.message);
            }.bind(this));
        }.bind(this));
    };

    /**
     * Closes the dialog.
     * @returns {void}
     */
    ManageAddCardWithSearch.prototype.closeDialog = function () {
        this.noHeaderNavigationBox(false);
        this._getQueryDialog().close();
    };

    /**
     * Opens the dialog.
     * @returns {void}
     */
    ManageAddCardWithSearch.prototype.openDialog = function () {
        this._getQueryDialog().open();
    };

     /**
     * AfterOpen set focus on the textbox field of the dialog.
     * @returns {void}
     */
    ManageAddCardWithSearch.prototype.afterOpenDialog = function () {
        this._getTextBox().focus();
    };

    /**
     * Function to set the AriaText for Card Manifest
     * @param {Object} oEvent oEvent
     * @private
     */
    ManageAddCardWithSearch.prototype._setAriaTextOnManifest = function(oEvent) {
        var ariaText = oEvent.getSource()._ariaText.getText();
        var sTitle = this.i18Bundle.getText('INT_DIALOG_TITLE_CardPreview');
        oEvent.getSource()._ariaText.setText(sTitle + ariaText);
        var oSapAppManifest = oEvent.getSource().getManifest()["sap.app"];
        if (oSapAppManifest && !(oSapAppManifest.title === oCardManifest["sap.app"].title)) {
            oEvent.getSource().setPreviewMode("Off");
        }
    };

    /**
     * Function to set the placeholder card
     * @param {Object} oEvent oEvent
     * @private
     */
    ManageAddCardWithSearch.prototype._onManifestReady = function(oEvent) {
        var oCard = oEvent.getSource();
        oCard.showLoadingPlaceholders();
    };

    /**
     * Sets the value state and value state text for the input text box.
     *
     * @param {sap.ui.core.ValueState} state - The value state to set (e.g., "None", "Information", "Warning", "Error").
     * @param {string} [textKey=""] - Optional i18n key for the value state text. If not provided, no text is set.
     */
    ManageAddCardWithSearch.prototype._setTextBoxValueState = function(state, textKey = "") {
        const oTextBox = this._getTextBox();
        oTextBox.setValueState(state);
        oTextBox.setValueStateText(textKey ? this.i18Bundle.getText(textKey) : "");
    };

    /**
     * Determines the appropriate value state based on the length of the input text.
     *
     * @param {number} iTextLength - The length of the trimmed user input.
     * @returns {{ valueState: sap.ui.core.ValueState, messageKey: (string|undefined) }}
     *
     * @private
     */

    ManageAddCardWithSearch.prototype._getValueState = function (iTextLength) {
        const MIN_CHAR_LIMIT = 2;
        const MAX_CHAR_LIMIT = 500;

        const oValueState = {
            valueState: ValueState.None,
            messageKey: undefined
        };

        if (iTextLength < MIN_CHAR_LIMIT) {
            oValueState.valueState  = ValueState.Information;
            oValueState.messageKey = "minLengthRequired";
        } else if (iTextLength > MAX_CHAR_LIMIT) {
            oValueState.valueState  = ValueState.Warning;
            oValueState.messageKey = "maxLengthExceeded";
        }

        return oValueState;
    };


    /**
     * onLiveChange of the text box
     * @private
     */
     ManageAddCardWithSearch.prototype.onChange = function () {
        const sTrimmedQuery = this._getTextBox().getValue()?.trim() || "";
        const iTextLength = sTrimmedQuery.length;

        const bValidInputLength = iTextLength >= 2 && iTextLength <= 500;

        this._enableClearButton(true);
        this._enableRegenerateButton(bValidInputLength);

        if (iTextLength === 0) {
            this.resetDialog();
            return;
        }

        const oValueState = this._getValueState(iTextLength);
        this._setTextBoxValueState(oValueState.valueState, oValueState.messageKey);
    };

    /*
     * Function to handle search event
     * @private
     * @returns {void}
     *
     */
    ManageAddCardWithSearch.prototype._onSearch = function () {
        var sQuery = this._getTextBox().getValue();
        var oCard = this._getSearchedCard();

        if (sQuery && sQuery.trim().length) {
            this._startGenerate = true;
            this.resetDialog();

            // Set the placeholder manifest (dummy loading card)
            oCard.setVisible(false);
            this._getPlaceholder().setVisible(true);
            this._getCancelButton().focus();
            this._toggleButtonAndText(false);

            // Prepare the payload for the fetch call
            var oPayload = {
                "UserInput": sQuery
            };

            // Create the fetch call to get query based response
            fetch(AppConstants.AI_INSIGHTCARD_BASEURL, {
                method: "HEAD",
                headers: {
                    "X-CSRF-Token": "Fetch"
                }
            })
            .then(function(oToken) {
                var token = oToken.headers.get("X-CSRF-Token");
                return fetch(AppConstants.ADD_AI_INSIGHTCARD_COMPLETEURL, {
                    method: AppConstants.POST,
                    headers: {
                        "X-CSRF-Token": token,
                        "content-type": "application/json;odata.metadata=minimal;charset=utf-8"
                    },
                    body: JSON.stringify(oPayload)
                });
            })
            .then(function(response) {
                if (!response.ok) {
                    return response.json().then(function(errorData) {
                        return Promise.reject({ message: errorData.message || errorData.error.message });
                    });
                }
                return response.json();
            })
            .then(function(data) {
                this._handleSearchSuccess(oCard, data);
            }.bind(this))
            .catch(function(oErr) {
                // Handle fetch error
                this._handleSearchError(oCard, oErr);
            }.bind(this));
        } else {
            // If no query entered, just focus the text box
            this._getTextBox().focus();
        }
    };

    // Handle success scenario after receiving data
    ManageAddCardWithSearch.prototype._handleSearchSuccess = function(oCard, data) {
        if (this._startGenerate) {
            this._toggleButtonAndText(true);
            var response = "";
            if (data && data.CardManifest) {
                response = JSON.parse(data.CardManifest);
                var sapInsights = response["sap.insights"];
                var appInfo = data.ApplicationInformation;
                if (sapInsights && appInfo && appInfo.SemanticObject && appInfo.SemanticAction) {
                    var sParentAppUrl = "#" + appInfo.SemanticObject + "-" + appInfo.SemanticAction;
                    sapInsights["parentAppUrl"] = sParentAppUrl;
                }
                // Show warning message strip if the card manifest lacks required 'sap.app' or its 'dataSources',
                // indicating that header navigation is not properly configured.
                if (!response["sap.app"] || !response["sap.app"].dataSources) {
                    this.noHeaderNavigationBox(true);
                }
            }
            if (response) {
                // Show the actual card content after fetch completes
                this._getPlaceholder().setVisible(false);
                oCard.setVisible(true);
                oCard.setManifest(response);
                //Fire the event which will alert the add content dialog in CUX that card manifest has been created
                this.fireOnCardGenerated(response);
                this._enableFocusAddButton(true);
                this._setMessageStripOverflowVisibility(true);
                this._toggleCardBox(true);
                // Process any additional tokens or filters if present
                var oFilterHBox = this._getFilterHBox();
                if (data.FilterTokens) {
                    var aTokenset = this._processFilterTokens(data.FilterTokens);
                    aTokenset.forEach(function(sToken, idx) {
                        if (sToken) {
                            var oToken = new Token({ text: sToken, key: idx, editable: false }).addStyleClass("customTokenLineHeight");
                            oFilterHBox.getItems()?.[1]?.addToken(oToken);
                        }
                    });
                    this._addTokenArias();
                }
            }
            this._startGenerate = false;
        }
    };

    // Process filter tokens into a usable format
    ManageAddCardWithSearch.prototype._processFilterTokens = function (oFilterTokens) {
        var aTokenset = [];
        if (oFilterTokens) {
            var aFilters = oFilterTokens.filters || [];
            var aOrders = oFilterTokens.orders || [];
            const appLabel = oFilterTokens.appwithlabel?.applabel ?? this.i18Bundle.getText("APP_LABEL");
            const appValue = oFilterTokens.appwithlabel?.name ?? oFilterTokens.app?.name;
            if (appValue) {
                aTokenset.push(`${appLabel}: ${appValue}`);
            }
            const topLabel = oFilterTokens.topwithlabel?.toplabel ?? this.i18Bundle.getText("TOP_LABEL");
            const topValue = oFilterTokens.topwithlabel?.value ?? oFilterTokens.top;
            if (topValue) {
                aTokenset.push(`${topLabel}: ${topValue}`);
            }
            aFilters.forEach(function (filter) {
                const propertylabel = filter.propertylabel || filter.name;
                const formattedToken = this._formatFilterToken(filter.operator, propertylabel, filter.values);
                if (formattedToken && !aTokenset.includes(formattedToken)) {
                    aTokenset.push(formattedToken);
                }
            }.bind(this));

            aOrders.forEach(function (order) {
                aTokenset.push(order.propertylabel + ": " + (order.operatorlabel || order.operator));
            });
        }
        return aTokenset;
    };

    /**
     * Formats filter tokens based on the operator.
     */
    ManageAddCardWithSearch.prototype._formatFilterToken = function (operator, propertylabel, values) {
        var value1 = values[0].value.replace(/^'|'$/g, '');
        var value2 = values[1]?.value?.replace(/^'|'$/g, '');
        const simpleOperatorsMap = {
            "eq": "",
            "ne": "!=",
            "gt": ">",
            "ge": ">=",
            "lt": "<",
            "le": "<="
        };
        if (simpleOperatorsMap[operator] !== undefined) {
            return `${propertylabel}: ${simpleOperatorsMap[operator]} ${value1}`;
        }
        const complexOperatorsMap = {
            "startswith": `${propertylabel}: ${value1}*`,
            "notstartswith": `${propertylabel}: !(${value1}*)`,
            "endswith": `${propertylabel}: *${value1}`,
            "notendswith": `${propertylabel}: !(*${value1})`,
            "contains": `${propertylabel}: *${value1}*`,
            "notcontains": `${propertylabel}: !(*${value1}*)`,
            "bt": `${propertylabel}: (${value1}...${value2})`,
            "nb": `${propertylabel}: !(${value1}...${value2})`
        };
        return complexOperatorsMap[operator] || `${propertylabel}: ${value1}`;
    };

    // Handle error scenario
    ManageAddCardWithSearch.prototype._handleSearchError = function(oCard, oErr) {
        if (this._startGenerate) {
            this._toggleButtonAndText(true);
            Log.error(oErr.message);
            // hide placeholder and show error
            this._getPlaceholder().setVisible(false);

            // match the error code and error message, it captures first two digit from the
            // error code i.e from code like (3001 , 2001) we extract the first two digits (30,20)
            // and excludes the remaining digits.
            var regexCode = /\((\d{2})\d*\)\s*(.*)/;
            var match = oErr.message.match(regexCode);
            var prefixCode = "", errMessage = "";
            if (match) {
                prefixCode = match[1];
            }
            errMessage = oErr.message;
            var oErrObject = this.setErrorMessage(prefixCode, errMessage);
            var oNoCardMessage = this._getNoCardMessage();
            oNoCardMessage.setTitle(oErrObject.title);
            oNoCardMessage.setDescription(oErrObject.description);
            oNoCardMessage.setIllustrationType(oErrObject.type);
            this._toggleCardBox(false);

            setTimeout(() => {
                var oNoCardMessageDom = oNoCardMessage.getDomRef();
				oNoCardMessageDom.tabIndex = 0;
				oNoCardMessageDom.focus();
            }, 0);

            this._startGenerate = false;
        } else {
            this._getTextBox().focus();
        }
    };

    // Add token arias to tokenizer, so that on accessing tokenizer ,
    // screen reader will also read the token information
    ManageAddCardWithSearch.prototype._addTokenArias = function() {
        var oFilterHBox = this._getFilterHBox();
        var oTokenizer = oFilterHBox.getItems()?.[1];
        var aTokens = oTokenizer && oTokenizer.getTokens();
        if (aTokens && aTokens.length) {
            oFilterHBox.setVisible(true);
            aTokens.forEach(function(oToken) {
                oTokenizer.addAriaDescribedBy(oToken.getId());
            });
        }
    };
    /**
     * Function to set the error message type, title and description based on the error code
     * @param {string} prefixCode first two digits extracted from the error message
     * @param {string} errMessage remaining message after the error code
     * @returns {Object} oErr
     * @private
     */
    ManageAddCardWithSearch.prototype.setErrorMessage = function(prefixCode, errMessage) {
        var oIllusType = {
            type1: "sapIllus-UnableToLoad",
            type2: "sapIllus-NoSearchResults",
            type3: "sapIllus-NoData",
            type4: "sapIllus-UnableToUpload"
        };
        var oErr = {
            type: "",
            title: "",
            description: errMessage
        };
        switch (prefixCode) {
            case "10":
                oErr.type = oIllusType.type1;
                oErr.title = this.i18Bundle.getText("ERRORCODE_TITLE1");
                break;
            case "20":
                oErr.type = oIllusType.type2;
                oErr.title = this.i18Bundle.getText("ERRORCODE_TITLE2");
                break;
            case "30":
                oErr.type = oIllusType.type3;
                oErr.title = this.i18Bundle.getText("ERRORCODE_TITLE3");
                break;
            case "40":
                oErr.type = oIllusType.type4;
                oErr.title = this.i18Bundle.getText("ERRORCODE_TITLE4");
                break;
            default:
                oErr.type = oIllusType.type4;
                oErr.title = this.i18Bundle.getText("ERRORCODE_TITLE");
                break;
        }

        return oErr;
    };

    /**
     * Resets the dialog by clearing the input field and card header title if specified,
     * setting the card manifest and preview mode, toggling the card and message strip visibility,
     * and disabling the add button.
     *
     * @param {boolean} bClose - A boolean value indicating whether to clear the input field and card header title.
     * @returns {void}
     * @public
     * @experimental since 1.130.0
     */
    ManageAddCardWithSearch.prototype.resetDialog = function(bClose) {
        if (bClose) {
            this._getTextBox().setValue("");
            this._getNoCardMessage().setDescription(" ");
            this._toggleButtonAndText(true);
            this._startGenerate = false;
        }
        this.noHeaderNavigationBox(false);
        this._getPlaceholder().setVisible(false);
        this._getSearchedCard().setVisible(true);
        var oFilterHBox = this._getFilterHBox();
        oFilterHBox.getItems()?.[1]?.removeAllAriaDescribedBy();
        oFilterHBox.getItems()?.[1]?.removeAllTokens();
        oFilterHBox.setVisible(false);
        this._setMessageStripOverflowVisibility(false);
        const manifestChanges = {"/sap.card/header/dataTimestamp": ""};
        var oCard = this._getSearchedCard();
        oCard.setManifestChanges([manifestChanges]);
        oCard.setManifest(oCardManifest);
        oCard.setPreviewMode("Abstract");
        this._toggleCardBox(true);
        this._enableFocusAddButton(false);
        this._enableClearButton(false);
        this._enableRegenerateButton(false);
        this._setTextBoxValueState(ValueState.None, "");
    };

    return ManageAddCardWithSearch;
});

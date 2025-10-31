// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/m/FlexBox",
    "sap/f/cards/Header",
    "sap/ushell/components/cepsearchresult/app/util/resources"
], (
    UIComponent,
    FlexBox,
    CardsHeader,
    utilResources
) => {
    "use strict";

    /**
     * Component of the Search Result Widget (Component Card - UI Integration Card)
     * The Card should be registered as a visualization of the Search Result Application
     * It is reusable on any WorkPage for the standard and advanced editions of Work Zone.
     *
     * @param {string} sId Component id
     * @param {object} oParams Component parameter
     *
     * @class
     * @extends sap.ui.core.UIComponent
     *
     * @private
     *
     * @since 1.110.0
     * @alias sap.ushell.components.cepsearchresult.cards.searchresultwidget.Component
     */ // eslint-disable-next-line max-len
    const Component = UIComponent.extend("sap.ushell.components.cepsearchresult.cards.searchresultwidget.Component", /** @lends sap.ushell.components.cepsearchresult.cards.searchresultwidget.Component.prototype */{
        metadata: {
            manifest: "json",
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },

        createContent: async function () {
            this._oResourceBundle = await this.getModel("i18n").getResourceBundle();
            await utilResources.awaitResourceBundle();

            return this.runAsOwner(() => {
                if (this.getAggregation("rootControl")) {
                    return this.getAggregation("rootControl");
                }
                const oFlexBox = new FlexBox({
                    width: "100%",
                    direction: "Column"
                });
                this._bContent = true;
                if (this._oCard) {
                    this.addContent();
                }
                return oFlexBox;
            });
        },

        getResourceBundle: function () {
            return this._oResourceBundle;
        },

        onCardReady: function (oCard) {
            // Holds the card for use inside the controller
            this._oCard = oCard;
            // add a style class to identify the card root in css
            this._oCard.addStyleClass("sapCEPSearchResultCard");
            // allow access to the card parameter via model
            this._mCardParameters = oCard.getCombinedParameters();
            if (this._bContent) {
                this.addContent();
            }
        },

        editionLoaded: function () {
            return new Promise((resolve) => {
                sap.ui.require(["sap/ushell/components/cepsearchresult/app/util/Edition"], (Edition) => {
                    this._oEdition = new Edition(Edition.getEditionName());
                    resolve(this._oEdition.loaded());
                });
            });
        },

        search: function (sTerm) {
            this._oCategory.search(sTerm);
        },

        addContent: function () {
            this.editionLoaded().then(() => {
                this._oCategory = this.createCategory();
                this.addCategory(this.getRootControl());
                this.updateCardHeader();
                this._oCard.getModel("parameters").setProperty("/init/value", true);
            });
        },

        addCategory: function (oFlexBox) {
            oFlexBox.addItem(this._oCategory);
            this.search(this._mCardParameters.searchTerm);
        },

        createCategory: function () {
            const mParams = this._mCardParameters;
            const oCategory = this._oEdition.createCategoryInstance(mParams.category,
                {
                    pageSize: mParams.pageSize,
                    showFooter: mParams.footer !== "none",
                    showHeader: false,
                    initialPlaceholder: true,
                    allowViewSwitch: mParams.allowViewSwitch,
                    highlightResult: mParams.highlightResult,
                    currentView: mParams.view || "categoryDefault",
                    useIllustrations: true,
                    beforeSearch: function (oEvent) {
                        this.updateCardHeader(oEvent.getParameters());
                        this._oCard.fireEvent("beforeSearch", oEvent.getParameters());
                    }.bind(this),
                    afterSearch: function (oEvent) {
                        this.updateCardHeader(oEvent.getParameters());
                        this._oCard.fireEvent("afterSearch", oEvent.getParameters());
                    }.bind(this),
                    afterRendering: function (oEvent) {
                        this._oCard.fireEvent("afterRendering", oEvent.getParameters());
                        if (this._mCardParameters.header !== "none") {
                            oCategory.getDomRef().style.borderTop = "1px solid var(--sapUiListBorderColor)";
                        }
                    }.bind(this)
                }
            );

            oCategory.setFooter(mParams.footer);
            return oCategory;
        },

        updateCardHeader: function (oParameters) {
            const oHeader = this._oCard.getCardHeader();
            const oCategory = this._oCategory;
            let sTitle;
            let sSubtitle;
            if (this._mCardParameters.header === "default") {
                oHeader
                    .setIconVisible(!!oCategory.getDefaultIcon())
                    .setIconDisplayShape(oCategory._oCategoryConfig.icon.shape)
                    .setIconBackgroundColor(oCategory._oCategoryConfig.icon.backgroundColor)
                    .setIconSrc(oCategory.getDefaultIcon());

                sTitle = oCategory.translate("Card.Title");
                sSubtitle = this.getResourceBundle().getText(
                    "CARD.List.Title.SearchResults",
                    [`'${this._mCardParameters.searchTerm}'`]
                );
            } else {
                oHeader
                    .setIconVisible(!!this._oCard.getManifestEntry("/sap.card/header/icon/src"))
                    .setIconDisplayShape(this._oCard.getManifestEntry("/sap.card/header/icon/shape"))
                    .setIconBackgroundColor(this._oCard.getManifestEntry("/sap.card/header/icon/backgroundColor"))
                    .setIconSrc(this._oCard.getManifestEntry("/sap.card/header/icon/src"));
                sTitle = this._oCard.getManifestEntry("/sap.card/header/title");
                sSubtitle = this._oCard.getManifestEntry("/sap.card/header/subtitle");
                sTitle = sTitle.replace("($searchText)", this._mCardParameters.searchTerm);
                sSubtitle = sSubtitle.replace("($searchText)", this._mCardParameters.searchTerm);
            }

            if (!oParameters || !Number.isInteger(oParameters.count)) {
                if (this._mCardParameters.header === "custom") {
                    sTitle = sTitle.replace("($count)", "--");
                    sSubtitle = sSubtitle.replace("($count)", "--");
                }
                oHeader.setStatusText("");
            } else if (Number.isInteger(oParameters.count)) {
                const sStatusText = this.getResourceBundle().getText(
                    "CARD.List.RowStatus",
                    [
                        Math.min(oParameters.skip + 1, oParameters.count),
                        Math.min(oParameters.skip + oParameters.top, oParameters.count),
                        oParameters.count
                    ]);
                oHeader.setStatusText(oParameters.count > 0 ? sStatusText : "");
                if (this._mCardParameters.header === "default") {
                    sTitle = `${sTitle} (($count))`;
                }
                sTitle = sTitle.replace("($count)", oParameters.count);
                sSubtitle = sSubtitle.replace("($count)", oParameters.count);
            }
            oHeader.setTitle(sTitle);
            oHeader.setSubtitle(sSubtitle);
        }
    });
    return Component;
});

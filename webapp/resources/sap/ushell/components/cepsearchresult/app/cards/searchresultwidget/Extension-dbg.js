// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/integration/Extension"
], (
    Extension
) => {
    "use strict";

    const DTExtension = Extension.extend("sap.ushell.components.cepsearchresult.cards.searchresultwidget.Extension");

    DTExtension.prototype.onCardReady = function () {
        this._oCard = this.getCard();
    };

    DTExtension.prototype.editionLoaded = function () {
        this.oCard = this.getCard();
        return new Promise((resolve) => {
            sap.ui.require(["sap/ushell/components/cepsearchresult/app/util/Edition"], (Edition) => {
                this._oEdition = new Edition(Edition.getEditionName());
                this._oEdition.loaded().then(() => {
                    resolve();
                });
            });
        });
    };

    DTExtension.prototype.getCategoryListItems = function () {
        return this.editionLoaded().then(() => {
            return this._oEdition.getCategoryListItems();
        });
    };

    DTExtension.prototype.getCategoryViews = function (sCategoryKey) {
        return this.editionLoaded().then(() => {
            return this._oEdition.getCategoryViews(sCategoryKey);
        });
    };

    return DTExtension;
});

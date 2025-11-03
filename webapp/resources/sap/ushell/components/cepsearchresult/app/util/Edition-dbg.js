// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/IconTabFilter",
    "sap/ushell/components/cepsearchresult/app/util/controls/Category",
    "sap/ushell/components/cepsearchresult/app/util/resources"
], (
    IconTabFilter,
    Category,
    utilResources
) => {
    "use strict";

    const mEditions = {
        standard: null,
        advanced: null
    };

    function Edition (sEdition) {
        this._sEdition = sEdition;
        this._mCategories = {};
        if (!mEditions[sEdition]) {
            mEditions[sEdition] = new Promise((resolve, reject) => {
                const sEditionToUpper = sEdition.charAt(0).toUpperCase() + sEdition.slice(1);
                sap.ui.require(
                    [
                        `sap/ushell/components/cepsearchresult/app/util/Edition${sEditionToUpper}`
                    ], (
                        EditionClass
                    ) => {
                        resolve(EditionClass);
                    },
                    () => {
                        reject(new Error(`Failed to load Edition: 'Edition${sEditionToUpper}'`));
                    }
                );
            });
        }
        this._loaded = mEditions[sEdition].then((EditionClass) => {
            this._oConfig = EditionClass;
            // faster access to categories
            this._oConfig.categories.map((oCategory) => {
                this._mCategories[oCategory.name] = Object.assign({}, oCategory);
            });
        });
    }

    Edition.prototype.loaded = function () {
        return this._loaded;
    };

    Edition.prototype.getConfiguration = function () {
        return this._oConfig;
    };

    Edition.prototype.getCategoryList = function () {
        return this._oConfig.categories;
    };

    Edition.prototype.createCategoryInstance = function (sCategory, mSettings) {
        const oCategory = this._mCategories[sCategory];
        if (!oCategory.class) {
            oCategory.class = Category;
        }
        // eslint-disable-next-line new-cap
        return new oCategory.class(oCategory, this, mSettings);
    };

    Edition.prototype.getCategoryInstance = function (sCategory) {
        const oCategory = this._mCategories[sCategory];
        if (!oCategory) {
            return null;
        }
        if (oCategory.instance && !oCategory.instance.isDestroyed()) {
            return oCategory.instance;
        }
        oCategory.instance = this.createCategoryInstance(sCategory);
        oCategory.instance.setUseIllustrations(true);
        return oCategory.instance;
    };

    Edition.prototype.getDefaultCategory = function () {
        const sKey = this._oConfig.defaultCategory || "all";
        return this.getCategoryInstance(sKey);
    };

    Edition.prototype.getAppMenuItems = function () {
        // the all menu item
        const aItems = [];
        // menu items that are in the all sub-categories
        if (this._mCategories.all) {
        // the all category is the leading one for apps menu
            const oItem = this.createMenuItem(this._mCategories.all);
            if (oItem) {
                aItems.push(oItem);
            }
            const aMainItems = this.getSubMenuItems(this._mCategories.all);
            if (aMainItems.length === 1) {
                return aMainItems;
            }
            return aItems.concat(this.getSubMenuItems(this._mCategories.all));
        }
        return [];
    };

    Edition.prototype.getSubMenuItems = function (oCategoryItem) {
        // menu items that are in the sub-categories of the given category
        const aItems = [];
        if (oCategoryItem && oCategoryItem.subCategories) {
            oCategoryItem.subCategories.map((oSubCategoryItem) => {
                this.addMenuItem(this._mCategories[oSubCategoryItem.name], aItems);
            });
        }
        return aItems;
    };

    Edition.prototype.addMenuItem = function (oCategoryItem, aItems) {
        const oItem = this.createMenuItem(oCategoryItem);
        if (oItem) {
            aItems.push(oItem);
        }
    };

    Edition.prototype.createMenuItem = function (oCategoryItem) {
        if (oCategoryItem) {
            let aSubItems = [];
            if (oCategoryItem.name !== "all") {
                aSubItems = this.getSubMenuItems(oCategoryItem);
            }
            const oTab = new IconTabFilter({
                key: oCategoryItem.name,
                text: oCategoryItem.shortTitle,
                icon: oCategoryItem.icon.src,
                count: `{counts>/${oCategoryItem.name}}`,
                tooltip: oCategoryItem.title,
                items: aSubItems
            });
            oTab._getCategoryInstance = function () {
                return this.getCategoryInstance(oCategoryItem.name);
            }.bind(this);
            return oTab;
        }
        return null;
    };

    Edition.getEditionName = function () {
        if (window["sap-ushell-config"] &&
        window["sap-ushell-config"].ushell &&
        window["sap-ushell-config"].ushell.cepSearchConfig) {
            return window["sap-ushell-config"].ushell.cepSearchConfig || "standard";
        }
        return "standard";
    };

    Edition.prototype.translate = function (sTranslationKey) {
        try {
            return utilResources.bundle.getText(sTranslationKey);
        } catch (oError) {
            return sTranslationKey;
        }
    };

    Edition.prototype.getCategoryListItems = function () {
        const aEditionCategories = this.getCategoryList();
        const aCategories = [];
        aEditionCategories.forEach((o) => {
            if (o.name === "all") {
                return;
            }
            aCategories.push({
                key: o.name,
                icon: o.icon.src,
                text: this.translate(o.title.substring(6, o.title.length - 1))
            });
        });
        return aCategories;
    };

    Edition.prototype.getCategoryViews = function (vCategory) {
        const oCategory = typeof vCategory === "string" ? this.createCategoryInstance(vCategory) : vCategory;
        const oViews = oCategory.getViewSettings();
        oViews.views
            .sort((o1, o2) => {
                if (o1.key === oViews.default) {
                    return -1;
                }
                return o1.key > o2;
            }).forEach((oView) => {
                const sKey = oView.key.charAt(0).toUpperCase() + oView.key.slice(1);
                oView.text = this.translate(`CATEGORY.Views.${sKey}ButtonText`);
            });
        return oViews;
    };

    return Edition;
});

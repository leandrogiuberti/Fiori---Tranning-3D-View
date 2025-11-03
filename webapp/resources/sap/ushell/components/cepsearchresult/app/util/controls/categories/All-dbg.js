// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/components/cepsearchresult/app/util/controls/Category"
], (
    Category
) => {
    "use strict";

    // eslint-disable-next-line max-len
    const All = Category.extend("sap.ushell.components.cepsearchresult.app.util.controls.categories.All", /** @lends sap.ushell.components.cepsearchresult.app.util.controls.categories.All.prototype */ {
        metadata: {
            aggregations: {
                _content: {
                    type: "sap.ui.core.Control",
                    multiple: true
                }
            }
        },
        renderer: function (rm, oControl) {
            rm.openStart("div", oControl);
            rm.class("sapUiCEPSearchCatGroup");
            rm.openEnd();
            const aContent = oControl.getAggregation("_content");
            aContent.forEach((oContent) => {
                rm.renderControl(oContent);
            });
            rm.close("div");
        },
        constructor: function (mCategoryConfig, oEdition, mSettings) {
            // safe it before the super call as the constructor calls this class which requires the edition
            this._oEdition = oEdition;

            Category.apply(this, [mCategoryConfig, oEdition, mSettings]);
        }
    });

    All.prototype.addContent = function () {
        const aSubCategories = this._oCategoryConfig.subCategories;
        aSubCategories.forEach((oSubCategory) => {
            oSubCategory.instance = this._oEdition.createCategoryInstance(oSubCategory.name);
            oSubCategory.instance.setFooter("viewAll");
            oSubCategory.instance.setPageSize(oSubCategory.pageSize);
            oSubCategory.instance.attachBeforeSearch((oEvent) => {
                this.fireBeforeSearch(oEvent.getParameters());
            });
            oSubCategory.instance.attachAfterSearch((oEvent) => {
                this.fireAfterSearch(oEvent.getParameters());
            });
            oSubCategory.instance.attachItemNavigate((oEvent) => {
                this.fireItemNavigateSearch(oEvent.getParameters());
            });
            oSubCategory.instance.attachViewAll((oEvent) => {
                this.fireViewAll(oEvent.getParameters());
            });
            this.addAggregation("_content", oSubCategory.instance);
        });
    };

    All.prototype.resetData = function () {
        this.getAggregation("_content").forEach((oCategory) => {
            oCategory.resetData();
        });
    };

    All.prototype.search = function (sSearchTerm, iSkip, iTop) {
        this.getAggregation("_content").forEach((oCategory) => {
            oCategory.setVisible(this.getVisible());
            oCategory.search(sSearchTerm, iSkip, iTop);
        });
    };

    return All;
});

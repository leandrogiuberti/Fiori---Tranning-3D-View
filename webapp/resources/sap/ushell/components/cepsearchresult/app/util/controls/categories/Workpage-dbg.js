// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/components/cepsearchresult/app/util/controls/Category"
], (Category) => {
    "use strict";

    // eslint-disable-next-line max-len
    const Workpage = Category.extend("sap.ushell.components.cepsearchresult.app.util.controls.categories.Workpage", /** @lends sap.ushell.components.cepsearchresult.app.util.controls.categories.Workpage.prototype */ {
        renderer: Category.getMetadata().getRenderer()
    });

    Workpage.prototype.getViewSettings = function () {
        return {
            views: [
                {
                    key: "list",
                    icon: "sap-icon://text-align-justified"
                }
            ],
            default: "list"
        };
    };

    Workpage.prototype.getItemAvatarSettings = function () {
        return Category.prototype.getItemAvatarSettings.apply(this, ["{data>icon}"]);
    };

    return Workpage;
});

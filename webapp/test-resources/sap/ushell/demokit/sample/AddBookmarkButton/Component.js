// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/core/mvc/XMLView",
    "sap/base/util/ObjectPath",
    "sap/ushell/Container"
], (
    UIComponent,
    XMLView,
    ObjectPath,
    Container // required for bootstrap
) => {
    "use strict";

    return UIComponent.extend("sap.ushell.sample.AddBookmarkButton.Component", {
        metadata: {
            library: "sap.ushell",
            dependencies: {
                libs: [
                    "sap.ushell",
                    "sap.ui.core",
                    "sap.ui.layout"
                ]
            },
            includes: [],
            config: {
                sample: {
                    stretch: true,
                    files: [
                        "AddBookmarkSample.view.xml",
                        "AddBookmarkSample.controller.js"
                    ]
                }
            },
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },
        createContent: function () {
            ObjectPath.set("sap-ushell-config.services.LaunchPage.adapter.config.groups", [
                {
                    id: "group_0",
                    title: "Home Group",
                    isPreset: true,
                    isVisible: true,
                    isGroupLocked: false,
                    tiles: []
                },
                {
                    id: "group_1",
                    title: "Sample Group",
                    isPreset: true,
                    isVisible: true,
                    isGroupLocked: false,
                    tiles: []
                }
            ]);

            return Promise.resolve()
                .then(() => {
                    return Container.init("local");
                })
                .then(() => {
                    return XMLView.create({
                        viewName: "sap.ushell.sample.AddBookmarkButton.AddBookmarkSample"
                    });
                });
        }
    });
});

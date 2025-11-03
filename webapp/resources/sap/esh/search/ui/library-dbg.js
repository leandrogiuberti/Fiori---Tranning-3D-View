/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
/**
 * Initialization Code and shared classes of library sap.esh.search.ui.
 */
sap.ui.define(
    [
        "sap/ui/core/Lib",
        "sap/ui/core/library",
        "sap/m/library",
        "sap/f/library",
        "sap/ui/layout/library",
        "sap/ui/export/library",
        "sap/ui/vbm/library",
        "sap/ui/vk/library",
        "sap/suite/ui/microchart/library",
        "sap/ui/codeeditor/library",
    ],
    function (Library) {
        "use strict";

        /**
         * UI5 library: sap.esh.search.ui.
         *
         * @namespace
         * @name sap.esh.search.ui
         * @public
         */

        // delegate further initialization of this library to the Core
        Library.init({
            name: "sap.esh.search.ui",
            dependencies: [
                "sap.ui.core",
                "sap.m",
                "sap.f",
                "sap.ui.layout",
                "sap.ui.export",
                "sap.ui.vbm",
                "sap.ui.vk",
                "sap.suite.ui.microchart",
                "sap.ui.codeeditor",
            ],
            types: [
                //"sap.esh.search.ui.ExampleType"
            ],
            interfaces: [],
            controls: [
                //"sap.esh.search.ui.Example"
            ],
            elements: [],
            noLibraryCSS: false,
            version: "1.141.1",
        });
    }
);

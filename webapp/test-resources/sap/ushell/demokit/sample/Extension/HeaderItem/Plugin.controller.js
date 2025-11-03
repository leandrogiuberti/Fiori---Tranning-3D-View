// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/MessageToast",
    "sap/ushell/Container"
], (
    MessageToast,
    Container
) => {
    "use strict";

    return {
        runCode: async function () {
            const Extension = await Container.getServiceAsync("Extension");

            const HeaderItemStart = await Extension.createHeaderItem({
                ariaLabel: "ariaLabel",
                ariaHaspopup: "dialog",
                icon: "sap-icon://action-settings",
                tooltip: "tooltip-start",
                text: "myStartButton",
                press: () => {
                    MessageToast.show("Press HeaderItem Start Button");
                }
            }, {
                position: "begin",
                helpId: "myHeaderItemHelpId"
            });
            HeaderItemStart.showOnHome();

            const HeaderItemEnd = await Extension.createHeaderItem({
                ariaLabel: "ariaLabel",
                ariaHaspopup: "dialog",
                icon: "sap-icon://documents",
                tooltip: "tooltip-end",
                text: "myEndButton",
                press: () => {
                    MessageToast.show("Press HeaderItem End Button");
                }
            }, {
                position: "end",
                helpId: "myHeaderItemHelpId"
            });
            HeaderItemEnd.showOnHome();
        }
    };
});

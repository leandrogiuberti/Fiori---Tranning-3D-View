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
            const FrameBoundExtension = await Container.getServiceAsync("FrameBoundExtension");

            const UserAction = await FrameBoundExtension.createUserAction({
                id: "exampleButton",
                text: "Example Button",
                icon: "sap-icon://refresh",
                press: () => {
                    MessageToast.show("Example Button was pressed!");
                }
            }, {
                controlType: "sap.m.Button"
            });
            UserAction.showOnHome();
        }
    };
});

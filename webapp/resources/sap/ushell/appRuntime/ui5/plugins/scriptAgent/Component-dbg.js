// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/core/Component",
    "sap/ui/thirdparty/URI",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log"
],
(
    Component, URI, jQuery, Log
) => {
    "use strict";

    return Component.extend("sap.ushell.appRuntime.ui5.plugins.scriptAgent.Component", {
        metadata: {
            version: "1.0.0",
            dependencies: {
                libs: [ "sap.m" ],
                components: []
            }
        },

        init: function () {
            const mConfig = this.getComponentData();
            const oPageUriParams = new URI().search(true);
            let scriptURL;

            if (!mConfig.hasOwnProperty("config")) {
                return;
            }

            if (mConfig.config.hasOwnProperty("scube")) {
                if (oPageUriParams.hasOwnProperty("sap-wa-debug") && oPageUriParams["sap-wa-debug"] === "dev") {
                    scriptURL = "https://education3.hana.ondemand.com/education3/web_assistant/framework/FioriAgent.js";
                } else if (oPageUriParams.hasOwnProperty("sap-wa-debug") && oPageUriParams["sap-wa-debug"] === "prev") {
                    scriptURL = "https://webassistant-outlook.enable-now.cloud.sap/web_assistant/framework/FioriAgent.js";
                } else { // production script
                    scriptURL = "https://webassistant.enable-now.cloud.sap/web_assistant/framework/FioriAgent.js";
                }
            } else {
                scriptURL = mConfig.config.url;
            }

            try {
                jQuery.getScript(scriptURL);
            } catch (ex) {
                Log.error(ex);
            }
        }
    });
});

// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/* eslint-disable no-inner-declarations */
/* eslint-disable no-constant-condition */

/**
 * @fileOverview The Unified Shell's bootstrap code for development sandbox scenarios.
 * This is the version that creates spaces/pages runtime environment.
 *
 * @version 1.141.1
 */

(function () {
    "use strict";

    /**
     * For 1.x the xx-bootTask is used to bootstrap the sandbox.
     * @deprecated since 1.120
     */
    if (true) {
        function init () {
            return new Promise((resolve) => {
                sap.ui.require([
                    "sap/ushell/bootstrap/sandbox2/sandbox"
                ], (
                    sandbox
                ) => {
                    sandbox.bootstrap().then(resolve);
                });
            });
        }

        window["sap-ui-config"] = {
            "xx-bootTask": function (fnCallback) {
                init().then(() => {
                    fnCallback();
                });
            }
        };

        return;
    }

    /**
     * In UI5 2.0 the custom boot tasks are used to bootstrap the sandbox.
     */
    if (!window["sap-ui-config"]) {
        window["sap-ui-config"] = {};
    }
    globalThis["sap-ui-config"].bootManifest = "sap/ushell/bootstrap/sandbox2/sandboxBoot.json";
}());

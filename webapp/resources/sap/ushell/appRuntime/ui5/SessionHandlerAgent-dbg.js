// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/appRuntime/ui5/services/Container",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/ui/thirdparty/URI",
    "sap/base/Log"
], (
    Container,
    AppCommunicationMgr,
    URI,
    Log
) => {
    "use strict";

    function SessionHandlerAgent () {
        this.init = function () {
            // register for logout event from the shell
            const oRequestHandlers = {
                "sap.ushell.sessionHandler.beforeApplicationHide": {
                    async handler (oMessageBody, oMessageEvent) {
                        // no action needed
                    }
                },
                "sap.ushell.sessionHandler.afterApplicationShow": {
                    async handler (oMessageBody, oMessageEvent) {
                        // no action needed
                    }
                },
                "sap.ushell.sessionHandler.logout": {
                    async handler (oMessageBody, oMessageEvent) {
                        return this.handleLogoutEvent();
                    }
                },
                "sap.ushell.sessionHandler.extendSessionEvent": {
                    async handler (oMessageBody, oMessageEvent) {
                        return this.handleExtendSessionEvent();
                    }
                }
            };

            Object.keys(oRequestHandlers).forEach((sServiceRequest) => {
                AppCommunicationMgr.setRequestHandler(sServiceRequest, oRequestHandlers[sServiceRequest].handler);
            });

            this.attachUserEvents();
            this.userActivityHandler();
        };

        this.handleLogoutEvent = function () {
            return new Promise((fnResolve, fnReject) => {
                this.detachUserEvents();
                Container.getFLPUrlAsync(true).then((sFlpURL) => {
                    if (this.isSameDomain(sFlpURL, document.URL) === false) {
                        Container.logout().then(fnResolve).catch(fnReject);
                    } else {
                        fnResolve();
                    }
                });
            });
        };

        this.isSameDomain = function (sURL1, sURL2) {
            let oUri1;
            let oUri2;
            let bSame = false;

            if (sURL1 === undefined || sURL2 === undefined) {
                return false;
            }

            try {
                oUri1 = new URI(sURL1);
                oUri2 = new URI(sURL2);
                if (oUri1.origin() === oUri2.origin()) {
                    bSame = true;
                }
            } catch (oError) {
                Log.error(
                    `Check for same domain of iframe and FLP failed: ${sURL1} ${sURL2}`,
                    oError,
                    "sap.ushell.appRuntime.ui5.SessionHandlerAgent"
                );
            }

            return bSame;
        };

        this.handleExtendSessionEvent = function () {
            // send extend session  to the app
            Container.sessionKeepAlive();
            return Promise.resolve();
        };

        this.attachUserEvents = function () {
            document.addEventListener("mousedown", this.userActivityHandler);
            document.addEventListener("mousemove", this.userActivityHandler);
            document.addEventListener("keyup", this.userActivityHandler);
            document.addEventListener("touchstart", this.userActivityHandler);
        };

        this.detachUserEvents = function () {
            document.removeEventListener("mousedown", this.userActivityHandler);
            document.removeEventListener("mousemove", this.userActivityHandler);
            document.removeEventListener("keyup", this.userActivityHandler);
            document.removeEventListener("touchstart", this.userActivityHandler);
        };

        this.userActivityHandler = function (oEventData) {
            if (this.oUserActivityTimer !== undefined) {
                return;
            }

            this.oUserActivityTimer = setTimeout(() => {
                // send notify extend session to the Shell
                AppCommunicationMgr.postMessageToFLP("sap.ushell.sessionHandler.notifyUserActive", {});
                this.oUserActivityTimer = undefined;
            }, 10000);
        };
    }

    return new SessionHandlerAgent();
});

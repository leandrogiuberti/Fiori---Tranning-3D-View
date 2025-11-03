// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/Log"
], (
    Log
) => {
    "use strict";

    class ApplicationContainerCache {
        #aActiveContainers = [];
        #aReusableContainers = {};

        constructor () {
            this.init();
        }

        init () {
            // any active application containers
            this.#aActiveContainers = [];
            // containers that are ready for reuse
            // ... also contains appruntime
            this.#aReusableContainers = [];
        }

        setContainerActive (oApplicationContainer) {
            if (!oApplicationContainer) {
                return;
            }

            if (this.#aActiveContainers.includes(oApplicationContainer)) {
                Log.warning("The container is already active");
                return;
            }

            this.removeByContainer(oApplicationContainer);

            this.#aActiveContainers.push(oApplicationContainer);
        }

        setContainerReadyForReuse (oApplicationContainer, sUrl) {
            if (!oApplicationContainer) {
                return;
            }

            if (!this.#aActiveContainers.includes(oApplicationContainer) && this.getById(oApplicationContainer.getId())) {
                Log.warning("The container is already in pool");
                return;
            }

            this.removeByContainer(oApplicationContainer);

            this.#aReusableContainers.push({
                url: sUrl,
                key: this.#getKeyFromUrl(sUrl),
                container: oApplicationContainer
            });
        }

        findFreeContainerByUrl (sUrl) {
            const sKey = this.#getKeyFromUrl(sUrl);

            // use latest free container
            const oFreeContainer = this.#aReusableContainers.reverse().find((oContainer) => {
                return oContainer.key === sKey;
            });

            if (oFreeContainer) {
                return oFreeContainer.container;
            }
        }

        canBeReused (oApplicationContainer, sUrl) {
            if (!oApplicationContainer) {
                return false;
            }

            if (this.#aActiveContainers.includes(oApplicationContainer)) {
                return false;
            }

            const sKey = this.#getKeyFromUrl(sUrl);
            const oEntry = this.#aReusableContainers.find((oContainer) => {
                return oContainer.container === oApplicationContainer;
            });

            return !!oEntry && oEntry.key === sKey;
        }

        getLength () {
            return this.#aActiveContainers.length;
        }

        getPoolLength () {
            return this.#aReusableContainers.length;
        }

        removeByContainer (oApplicationContainer) {
            if (!oApplicationContainer) {
                return;
            }

            this.#aActiveContainers = this.#aActiveContainers.filter((oContainer) => {
                return oContainer !== oApplicationContainer;
            });

            this.#aReusableContainers = this.#aReusableContainers.filter((oContainer) => {
                return oContainer.container !== oApplicationContainer;
            });
        }

        getById (sId) {
            let oApplicationContainerFound;
            this.forEach((oApplicationContainer) => {
                if (oApplicationContainer.getId() === sId) {
                    oApplicationContainerFound = oApplicationContainer;
                }
            });

            return oApplicationContainerFound;
        }

        getAll () {
            return [
                ...this.#aActiveContainers,
                ...this.#aReusableContainers.map((oEntry) => oEntry.container)
            ];
        }

        forEach (fnCallback) {
            const aPromises = [];
            for (const oApplicationContainer of this.#aActiveContainers) {
                aPromises.push(fnCallback(oApplicationContainer));
            }

            for (const oEntry of this.#aReusableContainers) {
                aPromises.push(fnCallback(oEntry.container));
            }

            return Promise.allSettled(aPromises);
        }

        /**
         * Builds a key of a reusable iframe that is not destroyed and can be reused.
         * When a new application is opened, and it is hosted in an iframe, in order to
         * check if an iframe for this app already exists, we will build the iframe key based
         * on hard coded keys (The keys are always taken from the URL parameters).
         *
         * The structure of the string key:
         * [url-origin]@hint:[sap-iframe-hint]@uiver:[sap-ui-version]@
         *
         * Example of an iframe key:
         * http://www.test.com@hint:ABC@uiver:1.84.0@async:false@ka:[sap-keep-alive]@async:sap-async-loading@fesr:[sap-calm]@testid:[sap-testcflp-iframeid]
         *
         * NOTE: reusable iframes are kept in in "oCacheStorage" declared above.
         *
         * @param {string} sUrl application url
         * @returns {string} iframe key.
         * @private
         */
        #getKeyFromUrl (sUrl) {
            let sOrigin;
            let sIframeHint = "";
            let sUI5Version = "";
            let sUI5Async = "";
            let sFESR = "";
            let sTestUniqueId = "";

            const oURL = new URL(sUrl, this._getWindowLocationHref());

            sOrigin = oURL.origin;
            if (oURL.port === "") {
                if (oURL.protocol === "https:") {
                    sOrigin = `${sOrigin}:443`;
                } else if (oURL.protocol === "http:") {
                    sOrigin = `${sOrigin}:80`;
                }
            }

            const oSearchParams = oURL.searchParams;
            if (oSearchParams.has("sap-iframe-hint")) {
                sIframeHint = `@hint:${oSearchParams.get("sap-iframe-hint")}`;
            }
            if (oSearchParams.has("sap-ui-version")) {
                sUI5Version = `@uiver:${oSearchParams.get("sap-ui-version")}`;
            }
            if (oSearchParams.has("sap-async-loading") && oSearchParams.get("sap-async-loading") !== "true") {
                sUI5Async = `@async:${oSearchParams.get("sap-async-loading")}`;
            }
            if (oSearchParams.has("sap-enable-fesr") && oSearchParams.get("sap-enable-fesr") !== "false") {
                sFESR = `@fesr:${oSearchParams.get("sap-enable-fesr")}`;
            }
            if (oSearchParams.has("sap-testcflp-iframeid")) {
                sTestUniqueId = `@testid:${oSearchParams.get("sap-testcflp-iframeid")}`;
            }

            return sOrigin.toLowerCase() + sIframeHint + sUI5Version + sUI5Async + sFESR + sTestUniqueId;
        }

        _getWindowLocationHref () {
            return window.location.href;
        }

        _getStorageForDebug () {
            return {
                activeContainers: this.#aActiveContainers,
                reusableContainers: this.#aReusableContainers
            };
        }

        /**
         * For testing purposes only.
         * Destroys all the application containers.
         *
         * @since 1.130.0
         * @private
         */
        destroyAllContainers () {
            this.forEach((oApplicationContainer) => {
                this.removeByContainer(oApplicationContainer);
                oApplicationContainer.destroy();
            });
        }
    }

    return new ApplicationContainerCache();
});

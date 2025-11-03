// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Provides an iframe to mock the application behavior. Only for testing purposes.
 */
sap.ui.define([
    "sap/base/util/Deferred"
], (
    Deferred
) =>{
    "use strict";

    const sIframeUrl = sap.ui.require.toUrl("sap/ushell/test/utils/MockIframe/MockIframe.html");

    /**
     * @alias sap.ushell.test.utils.MockIframe
     * @class
     * @classdesc This class provides a iframe for testing purposes.
     *
     * @since 1.139.0
     * @private
     */
    class MockIframe {
        #oLoadDeferred = new Deferred();
        #oNode = null;
        #bLoaded = false;

        constructor (sIframeId = "application-iframe") {
            this.#oNode = document.createElement("iframe");

            this.#oNode.setAttribute("id", sIframeId);
            this.#oNode.setAttribute("src", sIframeUrl);
            this.#oNode.addEventListener("load", () => {
                this.#bLoaded = true;
                this.#oLoadDeferred.resolve();
            });

            document.body.appendChild(this.#oNode);
        }

        /**
         * Returns the iframe node.
         * Must be called after the iframe is loaded.
         * @returns {HTMLElement} The iframe node.
         *
         * @since 1.139.0
         * @private
         */
        getNode () {
            if (!this.#bLoaded) {
                throw new Error("Iframe is not loaded yet");
            }
            return this.#oNode;
        }

        /**
         * Returns the content window of the iframe.
         * Must be called after the iframe is loaded.
         * @returns {Window} The content window of the iframe.
         *
         * @since 1.139.0
         * @private
         */
        getWindow () {
            if (!this.#bLoaded) {
                throw new Error("Iframe is not loaded yet");
            }
            return this.#oNode.contentWindow;
        }

        /**
         * Loads the iframe.
         * @returns {Promise<this>} A promise that resolves when the iframe is loaded.
         *
         * @since 1.139.0
         * @private
         */
        async load () {
            await this.#oLoadDeferred.promise;
            return this;
        }

        /**
         * Trigger a postMessage from within the iframe to the parent window.
         * Must be called after the iframe is loaded.
         * @param {any} vMessage The message to send. The iframe can be stringified JSON or any other type.
         *
         * @since 1.139.0
         * @private
         */
        postMessageFromIframe (vMessage) {
            const oWindow = this.getWindow();

            oWindow.sendPostMessageToParent(vMessage);
        }

        /**
         * Sets a formatter function for the next response from the iframe.
         * Must be called after the iframe is loaded.
         * You can use this to change the response value and format.
         * Once the formatter is set the next response will not be automatically stringified.
         *
         * After the formatter is used, it will be reset to default.
         * @param {function} fnFormatter The formatter function that receives the response object and returns a formatted response.
         *
         * @since 1.139.0
         * @private
         */
        formatNextResponse (fnFormatter) {
            const oWindow = this.getWindow();

            oWindow.formatNextResponse(fnFormatter);
        }

        /**
         * Returns the post messages that are currently in the iframe.
         * @returns {object[]} Returns the post messages that are currently in the iframe.
         *
         * @since 1.140.0
         * @private
         */
        getPostMessages () {
            const oWindow = this.getWindow();

            return oWindow.getPostMessages();
        }

        /**
         * Clears the post messages that are currently in the iframe.
         * This will remove all post messages from the iframe.
         *
         * @since 1.140.0
         * @private
         */
        clearPostMessages () {
            const oWindow = this.getWindow();

            oWindow.clearPostMessages();
        }

        /**
         * Destroys the iframe and removes it from the DOM.
         *
         * @since 1.139.0
         * @private
         */
        destroy () {
            this.#oNode.remove();
        }
    }

    return MockIframe;
});

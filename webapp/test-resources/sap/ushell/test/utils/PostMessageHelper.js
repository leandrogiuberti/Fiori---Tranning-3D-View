// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Helper class to manage postMessage events in tests.
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ushell/test/utils",
    "sap/ushell/test/utils/MockIframe"
], (
    Log,
    testUtils,
    MockIframe
) =>{
    "use strict";

    class PostMessageHelper {
        #sandbox;
        #oIframe = new MockIframe();

        setSandbox (sandbox) {
            this.#sandbox = sandbox;
        }

        /**
         * Formats the next response body for postMessage events.
         * @param {function} fnFormatter The formatter function to apply to the response body.
         * @returns {Promise} A promise that resolves when the response formatter is set.
         *
         * @since 1.139.0
         * @private
         */
        async formatNextResponse (fnFormatter) {
            await this.#oIframe.load();

            this.#oIframe.getWindow().formatNextResponse(fnFormatter);
        }

        /**
         * Sets the id for the iframe element.
         * This is used for POST scenarios where the iframe id is required to be in sync with the form.
         * @param {string} sId the id to set for the iframe element.
         *
         * @since 1.139.0
         * @private
         */
        setIframeId (sId) {
            this.#oIframe.getNode().setAttribute("id", sId);
        }

        /**
         * Retrieves the URL of the iframe.
         * This is useful for POST scenarios where the iframe URL is required to be in sync with the form action.
         * @returns {string} The URL of the iframe.
         *
         * @since 1.139.0
         * @private
         */
        getIframeUrl () {
            return this.#oIframe.getNode().getAttribute("src");
        }

        /**
         * Stubs the getDomRef method of the application container to return the iframe node.
         * This is useful for tests that require the exact identification of the iframe with application.
         * Usually there is a fallback to the current application.
         *
         * Note: the restore should be called BEFORE destroying the application container to keep the iframe for the next test.
         * @param {sap.ushell.appIntegration.IframeApplicationContainer} oApplicationContainer The application container whose getDomRef method should be stubbed.
         * @returns {Promise<function>} A function that restores the original getDomRef method of the application container.
         *
         * @since 1.139.0
         * @private
         */
        async stubApplicationContainerIframe (oApplicationContainer) {
            await this.#oIframe.load();

            if (oApplicationContainer.getDomRef.restore) {
                // do not stub if already stubbed
                return;
            }

            this.#sandbox.stub(oApplicationContainer, "getDomRef").returns(this.#oIframe.getNode());

            return () => {
                oApplicationContainer.getDomRef.restore();
            };
        }

        /**
         * Stringifies the given message and sends it as a postMessage event to the current window.
         * Timeout is set to 2000ms to wait for the response.
         *
         * @param {object} oMessage The message to be sent.
         * @param {sap.ushell.appIntegration.IframeApplicationContainer} [oApplicationContainer] The application container to send the message to.
         * @param {int} [iTimeoutMs=2000] The timeout in milliseconds to wait for the response. Defaults to 2000ms.
         * @returns {Promise<object>} A promise that resolves with the parsed response message.
         *
         * @since 1.139.0
         * @private
         */
        async sendPostMessageFromApplication (oMessage, oApplicationContainer, iTimeoutMs = 2000) {
            const pResponse = this.waitForNextMessageEventInApplication();
            let fnRestore;

            await this.#oIframe.load();
            if (oApplicationContainer) {
                fnRestore = await this.stubApplicationContainerIframe(oApplicationContainer);
                if (!fnRestore) {
                    Log.error("Could not sub getDomRef. Instead consider not providing the ApplicationContainer");
                }
            }

            this.#oIframe.getWindow().sendPostMessageToParent(JSON.stringify(oMessage));

            return testUtils.awaitPromiseOrTimeout(pResponse, iTimeoutMs).then((vResult) => {
                if (fnRestore) {
                    fnRestore(); // Restore the original getDomRef method
                }
                return vResult;
            });
        }

        /**
         * Waits for the next postMessage event and returns the parsed message.
         * Timeout is set to 2000ms to wait for a event.

         * @param {function ():boolean} [fnFilter] Optional filter function to apply to the message event. If provided, only messages that pass the filter will be returned.
         * @returns {Promise<object>} A promise that resolves with the parsed message from the next postMessage event.
         *
         * @since 1.139.0
         * @private
         */
        async waitForNextMessageEventInWindow (fnFilter) {
            const { promise, resolve } = Promise.withResolvers();

            function handleMessageEvent (oEvent) {
                if (fnFilter) {
                    let oMessage = oEvent.data;
                    if (typeof oMessage === "string") {
                        oMessage = JSON.parse(oEvent.data);
                    }

                    if (!fnFilter(oMessage)) {
                        // Ignore messages that do not pass the filter
                        return;
                    }
                }

                resolve(oEvent);
            }

            addEventListener("message", handleMessageEvent);

            const oMessageEvent = await testUtils.awaitPromiseOrTimeout(promise, 2000);

            removeEventListener("message", handleMessageEvent);

            return JSON.parse(oMessageEvent.data);
        }

        /**
         * Waits for the next postMessage event and returns the parsed message.
         * Timeout is set to 2000ms to wait for a event.
         * @param {int} [iTimeoutMs=2000] The timeout in milliseconds to wait for the response. Defaults to 2000ms.
         * @param {sap.ushell.test.utils.MockIframe} [oIframe] The iframe element to listen for postMessage events. Defaults to the internal iframe.
         * @param {function ():boolean} [fnFilter] Optional filter function to apply to the message event. If provided, only messages that pass the filter will be returned.
         * @returns {Promise<object>} A promise that resolves with the parsed message from the next postMessage event.
         *
         * @since 1.139.0
         * @private
         */
        async waitForNextMessageEventInApplication (iTimeoutMs = 2000, oIframe, fnFilter) {
            const oTargetIframe = oIframe || this.#oIframe;
            const { promise, resolve } = Promise.withResolvers();

            await oTargetIframe.load();

            function handleMessageEvent (oEvent) {
                if (fnFilter) {
                    const oMessage = JSON.parse(oEvent.data);
                    if (!fnFilter(oMessage)) {
                        // Ignore messages that do not pass the filter
                        return;
                    }
                }

                resolve(oEvent);
            }

            oTargetIframe.getWindow().addEventListener("message", handleMessageEvent);

            const oMessageEvent = await testUtils.awaitPromiseOrTimeout(promise, iTimeoutMs);

            oTargetIframe.getWindow().removeEventListener("message", handleMessageEvent);

            return JSON.parse(oMessageEvent.data);
        }
    }

    return new PostMessageHelper();
});

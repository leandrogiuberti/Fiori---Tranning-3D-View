// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Shell Navigation Service.
 */
sap.ui.define([
    "sap/ui/core/EventBus",
    "sap/ushell/services/ShellNavigationHashChanger",
    "sap/ui/core/routing/HashChanger"
], (
    EventBus,
    ShellNavigationHashChanger,
    HashChanger
) => {
    "use strict";

    /* global hasher */

    /**
     * @alias sap.ushell.services.ShellNavigationInternal
     * @class
     * @classdesc The Unified Shell's internal navigation service (platform independent).
     *
     * <b>Note:</b> To retrieve a valid instance of this service, it is necessary to call {@link sap.ushell.Container#getServiceAsync}.
     * <pre>
     *   sap.ui.require(["sap/ushell/Container"], async function (Container) {
     *     const ShellNavigationInternal = await Container.getServiceAsync("ShellNavigationInternal");
     *     // do something with the ShellNavigationInternal service
     *   });
     * </pre>
     *
     * This interface is for consumption by shell renderers/containers only
     *
     * It is not for direct usage by applications, see
     *   inner app navigation : UI5 interfaces (hashChanger, Router)
     *   cross app navigation : @see sap.ushell.services.CrossApplicationNavigation
     *
     * Usage:
     *
     * Example: see renders/fiorisandbox/Shell.controller.js
     *
     *   <pre>
     *   sap.ui.define([
     *      "sap/ushell/services/ShellNavigationInternal"
     *   ], function (ShellNavigationInternal) {
     *       Shell.onHashChange(shellHash,appHash) {  / *resolve url, load app and exchange root view* / }
     *       Shell.init() {
     *         this.privShellNavigator = new ShellNavigationInternal();
     *         this.privShellNavigator.init(this.doHashChange.bind(this));
     *       }
     *   });
     *   </pre>
     *
     * Note: further app specific integration via the reference app reuse code (setting of app specific handler)
     *
     * Note: the ShellNavigationInternal service replaces the UI5 core HashChanger which abstracts from the browser url modification.
     *
     * It performs the following services:
     *   - encoding of the actual browser url hash ( via hasher.js).
     *   - expansion of "shortened" urls ( AppParameterParts) via invocation.
     *   - splitting of shellHash and AppSpecific hash and abstraction w.r.t. Eventing
     *
     * Thus it is crucial to use appropriate interfaces and not directly invoke window.location.hash.
     *
     * - internal construction methods for a "current" App specific and non-app specific hash
     *   (invoked by CrossApplicationNavigation), not to be invoked directly!
     *
     * @param {object} oContainerInterface interface
     * @param {string} sParameters parameters
     * @param {object} oServiceConfiguration configuration
     *
     * @hideconstructor
     *
     * @since 1.121.0
     * @private
     * @ui5-restricted sap.ui.fl
     */
    function ShellNavigationInternal (oContainerInterface, sParameters, oServiceConfiguration) {
        function requestReload () {
            sap.ui.require(["sap/m/MessageBox"], (MessageBox) => {
                MessageBox.show("Due to a configuration change on the server,\nclient and server are out of sync.\n We strongly recommend to reload the page soon.\nReload page now?", {
                    icon: MessageBox.Icon.ERROR,
                    title: "Client out of sync with server.",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            window.setTimeout(() => {
                                window.location.reload();
                            }, 0);
                        }
                    }
                });
            });
        }

        const oServiceConfig = oServiceConfiguration && oServiceConfiguration.config;

        // instantiate and exchange the HashChanger from UI5
        this.hashChanger = new ShellNavigationHashChanger(oServiceConfig);

        this._navigationFilterForForwardingToRegisteredRouters = function (AppLifeCycle, sHash) {
            const bMatchedFLPRouters = this._aRouters.some((oRouter) => {
                return oRouter.match(sHash);
            });

            if (bMatchedFLPRouters) {
                const oCurrentApplication = AppLifeCycle.getCurrentApplication();
                const bIsApp = oCurrentApplication && oCurrentApplication.componentInstance && !oCurrentApplication.homePage;

                if (bIsApp) {
                    const oAppRouter = oCurrentApplication.componentInstance.getRouter();

                    if (oAppRouter) {
                        // Avoid unexpected route matched in the application
                        oAppRouter.stop();
                    }
                }
                return this.NavigationFilterStatus.Keep;
            }
            return this.NavigationFilterStatus.Continue;
        };

        // ///////////////////////////// api for external usage

        /**
         * Returns the current navigation context.
         *
         * @returns {object}
         *   An object like:
         *   <pre>
         *   {
         *      "isCrossAppNavigation": true,
         *      "innerAppRoute": "employee/overview"
         *   }
         *   </pre>
         *
         *   This object can be used inside dirty flag providers to take
         *   corresponding actions.
         *
         * @private
         */
        this.getNavigationContext = function () {
            const oNavigationState = this.hashChanger.getCurrentNavigationState();
            const bIsExternalNavigation = !this.hashChanger.isInnerAppNavigation(oNavigationState.oldHash, oNavigationState.newHash);

            return {
                isCrossAppNavigation: bIsExternalNavigation,
                innerAppRoute: this.hashChanger.getHash()
            };
        };

        /**
         * Returns a Boolean value indicating whether only the initial navigation occurred or if already any additional
         * navigation step was tracked.
         *
         * Note: There is a difference between the initial navigation and the first position in the navigation history: The function
         * returns <code>false</code> after having returned to the first "FLP entry" via back navigation although this might be
         * the same history position as the initial navigation. <code>true</code> is only returned as long as
         * no further navigation happened, independent of the current history position.
         *
         * @returns {boolean} Whether the first navigation occurred (true) or a successive navigation occurred (false).
         * @see {@link sap.ushell.services.ShellNavigationHashChanger#isInitialNavigation}
         * @private
         */
        this.isInitialNavigation = function () {
            return this._bIsInitialNavigation;
        };

        /**
         * Set the value of the property this._bIsInitialNavigation.
         *
         * @param {boolean} isInitialNavigation whether the initial navigation flag should be true.
         *
         * @private
         */
        this.setIsInitialNavigation = function (isInitialNavigation) {
            this._bIsInitialNavigation = isInitialNavigation;
        };

        /**
         * Returns a string which can be put into the DOM (e.g. in a link tag), asynchronously.
         * Please use CrossApplicationNavigation service and do not invoke this method directly if you are an application.
         *
         * @param {object} oArgs object encoding a semantic object and action, e.g.:
         *   <pre>
         *   {
         *     target: {
         *       semanticObject: "AnObject",
         *       action: "Action"
         *     },
         *     params: { A: "B" }
         *   }
         *   </pre>
         *   or
         *   <pre>{ target: { shellHash: "SO-36&jumper=postman" } } </pre>
         * @param {boolean} [bVerbose] whether the response should be returned in verbose format.
         *   If this flag is set to true, this function returns an object instead of a string.
         * @param {object} [oComponent] an optional instance of sap.ui.core.UIComponent
         * @returns {Promise<object>} <p>a string that can be put into a href attribute of an HTML anchor.
         *   The returned string will always start with a hash character.</p>
         *   <p>
         *   In case the <b>bVerbose</b> parameter is set to true, an object that wraps the result string will be returned instead:
         *   <pre>
         *   {
         *     hash : {string},
         *     params : {object}
         *     skippedParams : {object}
         *   }
         *   </pre>
         *   </p>
         *   where:
         *   <ul>
         *     <li><code>params</code> is an object containing non-truncated parameters</li>
         *     <li><code>skippedParams</code> is an object containing truncated parameters if truncation occurred or undefined if not</li>
         *   </ul>
         *
         * @since 1.15.0
         * @private
         */
        this.hrefForExternal = function (oArgs, bVerbose, oComponent) {
            return this.hashChanger.hrefForExternal(oArgs, bVerbose, oComponent);
        };

        /**
         * Returns a string which can be put into the DOM (e.g. in a link tag), synchronously.
         * Please use CrossApplicationNavigation service and do not invoke this method directly if you are an application.
         *
         * @param {object} oArgs object encoding a semantic object and action, e.g.:
         *   <pre>
         *   {
         *     target: {
         *       semanticObject: "AnObject",
         *       action: "Action"
         *     },
         *     params: { A: "B" }
         *   }
         *   </pre>
         *   or
         *   <pre>{ target: { shellHash: "SO-36&jumper=postman" } } </pre>
         * @param {boolean} [bVerbose] whether the response should be returned in verbose format.
         *   If this flag is set to true, this function returns an object instead of a string.
         * @param {object} [oComponent] an optional instance of sap.ui.core.UIComponent
         * @returns {object} <p>a string that can be put into an href attribute of an HTML anchor.
         *   The returned string will always start with a hash character.</p>
         *   <p>
         *   In case the <b>bVerbose</b> parameter is set to true, an object that wraps the result string will be returned instead:
         *   <pre>
         *   {
         *     hash : {string},
         *     params : {object}
         *     skippedParams : {object}
         *   }
         *   </pre>
         *   </p>
         *   where:
         *   <ul>
         *     <li><code>params</code> is an object containing non-truncated parameters</li>
         *     <li><code>skippedParams</code> is an object containing truncated parameters if truncation occurred or undefined if not</li>
         *   </ul>
         *
         * @since 1.119.0
         * @private
         * @deprecated since 1.119. Please use {@link sap.ushell.services.ShellNavigationInternal#hrefForExternal} instead.
         */
        this.hrefForExternalSync = function (oArgs, bVerbose, oComponent) {
            return this.hashChanger.hrefForExternalSync(oArgs, bVerbose, oComponent);
        };

        /**
         * returns a string which can be put into the DOM (e.g. in a link tag) given an app specific hash suffix,
         * (it may shorten the app specific parts of the url to fit browser restrictions)
         *
         * @param {string} sAppHash Application hash
         * @returns {string} a string which can be put into the link tag,
         *   containing the current shell hash as prefix and the specified application hash as suffix
         *   example: hrefForAppSpecificHash("View1/details/0/") returns "#MyApp-Display&/View1/details/0/"
         *
         * @since 1.15.0
         * @private
         */
        this.hrefForAppSpecificHash = function (sAppHash) {
            return this.hashChanger.hrefForAppSpecificHash(sAppHash);
        };

        /**
         * compact the parameter object, if required a number of parameters will be removed, instead a corresponding
         * "sap-intent-param" containing a key of an appstate representing the removed parameters will be inserted
         *
         * @param {object} oParams A parameter object
         * @param {Array<*>} [aRetainedParameters] An array of string value of parameters which shall not be compacted
         *   The array may contains a *-terminated string, which will match and strings with the same prefix
         *   ( e.g. "sap-*" will match "sap-ushell", "sap-wd", "sap-" etc. )
         * @param {object} [oComponent] optional, a SAP UI5 Component
         * @param {boolean} [bTransient] whether an transient appstate is sufficient
         * @returns {Promise} a promise, whose first argument of resolve is
         * @private
         */
        this.compactParams = function (oParams, aRetainedParameters, oComponent, bTransient) {
            return this.hashChanger.compactParams(oParams, aRetainedParameters, oComponent, bTransient);
        };

        /**
         * Navigate to an external target
         *
         * @param {object} oArgs configuration object describing the target, e.g.:
         *   {
         *     target : { semanticObject : "AnObject", action: "Action" },
         *     params : { A : "B" }
         *   }
         *   constructs sth like http://....ushell#AnObject-Action?A=B ....
         *   and navigates to it.
         * @param {object} oComponent optional, a SAP UI5 Component
         * @param {boolean} bWriteHistory writeHistory whether to create a history record (true, undefined) or replace the hash (false)
         * @returns {Promise} A Promise which resolves once the navigation was triggered
         *
         * @private
         */
        this.toExternal = function (oArgs, oComponent, bWriteHistory) {
            return this.hashChanger.toExternal(oArgs, oComponent, bWriteHistory);
        };

        /**
         * Constructs the full shell hash and sets it, thus triggering a navigation to it
         *
         * @param {string} sAppHash specific hash
         * @param {boolean} bWriteHistory if true it adds a history entry in the browser if not it replaces the hash
         * @private
         */
        this.toAppHash = function (sAppHash, bWriteHistory) {
            this.hashChanger.toAppHash(sAppHash, bWriteHistory);
        };

        // Lifecycle methods

        /**
         * Initializes ShellNavigationInternal
         *
         * This function should be used by a custom renderer in order to implement custom navigation.
         * Do not use this function for developing Fiori applications.
         *
         * This method should be invoked by the Shell in order to:
         *   - Register the event listener
         *   - Register the container callback for the (currently single) ShellHash changes.
         *
         * Signature of the callback function
         *   sShellHashPart,  // The hash part on the URL that is resolved and used for application loading
         *   sAppSpecificPart // Typically ignored
         *   sOldShellHashPart, // The old shell hash part, if exist
         *   sOldAppSpecificPart, // The old app hash part, if exist
         *
         * @param {function} fnShellCallback The callback method for hash changes
         * @returns {object} this
         *
         * @private
         */
        this.init = function (fnShellCallback) {
            this._bIsInitialNavigation = true;
            hasher.prependHash = "";
            HashChanger.replaceHashChanger(this.hashChanger);
            const oBus = EventBus.getInstance();
            oBus.subscribe("sap.ui.core.UnrecoverableClientStateCorruption", "RequestReload", requestReload);
            this.hashChanger.initShellNavigation(fnShellCallback);

            this._enableHistoryEntryReplacedDetection();

            return this;
        };

        /**
         * Allows to detect how was the last hash changed at low levels, before events are emitted by the HashChanger.
         * This is useful to handle data loss cancellation. After the confirmation dialog is cancelled,
         * we need to restore the hash correctly based on the direction and on whether setHash (adds a new history entry)
         * or replaceHash (no history entry) was last used.
         *
         * For example, when the user went backwards via browser back button.
         *
         * NOTE: relies on "hasher" available as a global variable.
         * Records the last hash change mode in the "_lastHashChangeMode" member, which can have values:
         *   <ul>
         *     <li>"setHash" when hasher.setHash is called</li>
         *     <li>"replaceHash" when hasher.replaceHash is called</li>
         *   </ul>
         *
         * @private
         */
        this._enableHistoryEntryReplacedDetection = function () {
            this._lastHashChangeMode = null;

            this._fnOriginalSetHash = hasher.setHash;
            this._fnOriginalReplaceHash = hasher.replaceHash;

            hasher.setHash = function () {
                this._hashChangedByApp = true;
                this._lastHashChangeMode = "setHash";
                return this._fnOriginalSetHash.apply(hasher, arguments);
            }.bind(this);

            hasher.replaceHash = function () {
                this._hashChangedByApp = true;
                this._lastHashChangeMode = "replaceHash";
                return this._fnOriginalReplaceHash.apply(hasher, arguments);
            }.bind(this);
        };

        /**
         * Returns true if the history entry was replaced immediately after the last navigation.
         * To be useful, this method should be called immediately after the hash enters the URL
         * but before the target application is finally navigated to.
         *
         * This method should not be used externally.
         * It's reserved uniquely for internal shell consumption and its signature or result might change at any time.
         *
         * @returns {boolean} Whether <code>hasher#replaceHash</code> was called after the last navigation.
         * @private
         */
        this.wasHistoryEntryReplaced = function () {
            return this._lastHashChangeMode === "replaceHash";
        };

        /**
         * Resets the internal flag used to track whether the last navigation is made via hasher#setHash or hasher#replaceHash.
         * This method should be called after a navigation is successfully made to a target application to avoid returning
         * an inconsistent answer when calling <code>#wasHistoryEntryReplaced</code>.
         * An inconsistent answer might occur when a navigation is made via forward/back button without
         * passing via <code>hasher#replaceHash</code> or <code>hasher#setHash</code>.
         *
         * This method should not be used externally.
         * It's reserved uniquely for internal shell consumption and its signature or result might change at any time.
         *
         * @private
         */
        this.resetHistoryEntryReplaced = function () {
            this._lastHashChangeMode = null;
        };

        /**
         * Rewrite the hash fragment identifier without triggering any navigation at
         *
         * @param {string} sNewHash new hash fragment
         *
         * @private
         */
        this.replaceHashWithoutNavigation = function (sNewHash) {
            hasher.changed.active = false; // disable changed signal
            this._fnOriginalSetHash(sNewHash); // set hash without dispatching changed signal
            hasher.changed.active = true; // re-enable signal
        };

        /**
         * The navigation filter statuses that should be returned by a navigation filter
         *
         * Continue - continue with the navigation flow
         * Abandon - stop the navigation flow, and revert to the previous hash state
         * Custom - stop the navigation flow, but leave the hash state as is. The filter should use this status
         *   to provide alternative navigation handling
         *
         * @see sap.ushell.services.ShellNavigationInternal#registerNavigationFilter
         * @private
         * @ui5-restricted sap.ui.fl
         */
        this.NavigationFilterStatus = this.hashChanger.NavigationFilterStatus;

        /**
         * Register the navigation filter callback function.
         * A navigation filter provides plugins with the ability to intervene in the navigation flow,
         * and optionally to stop the navigation.
         *
         * The callback has to return {@link sap.ushell.services.ShellNavigationInternal.NavigationFilterStatus}
         *
         * Use <code>Function.prototype.bind()</code> to determine the callback's <code>this</code> or some of its arguments.
         *
         * @param {object} fnFilter navigation filter function
         *
         * @see sap.ushell.services.ShellNavigationInternal#registerNavigationFilter
         * @private
         * @ui5-restricted sap.ui.fl
         */
        this.registerNavigationFilter = function (fnFilter) {
            this.hashChanger.registerNavigationFilter(fnFilter);
        };

        this._aRouters = [];
        this.registerExtraRouter = function (oRouter) {
            this._aRouters.push(oRouter);
        };

        /**
         * Unregister a previously registered navigation filter
         *
         * The callback has to return {@link sap.ushell.services.ShellNavigationInternal.NavigationFilterStatus}
         *
         * Note the same filter function that was registered should be passed as a parameter to this method.
         *
         * @param {object} fnFilter navigation filter function
         *
         * @see sap.ushell.services.ShellNavigationInternal#registerNavigationFilter
         * @private
         * @ui5-restricted sap.ui.fl
         */
        this.unregisterNavigationFilter = function (fnFilter) {
            this.hashChanger.unregisterNavigationFilter(fnFilter);
        };

        // this navigation filter must always be the first filter
        this.registerNavigationFilter(() => {
            /**
             * Checks whether the current hashChange event is triggered by the application by calling either
             * setHash or replaceHash method on the HashChanger.
             *
             * If the current hashChange event is triggered by the browser, either call window.history.go (back)
             * or press the browser forward/backward button, the flag this._hashChangedByApp has a falsy value.
             *
             * If the current hashChange isn't triggered by the app, the flag this._lastHashChangeMode is reset
             */
            if (!this._hashChangedByApp) {
                this.resetHistoryEntryReplaced();
            }

            // reset the hashChangedByApp flag
            this._hashChangedByApp = undefined;

            // continue with hashChange event processing
            return this.NavigationFilterStatus.Continue;
        });

        /**
         * This helper allows to register ShellNavigationInternal filters which depend on additional services, which might not be
         * available at constructor time
         * @param {object} AppLifeCycle The AppLifeCycle service
         *
         * @private
         * @since 1.95
         */
        this.registerPrivateFilters = function (AppLifeCycle) {
            // ensure registered Routers get the full hash
            this.registerNavigationFilter(this._navigationFilterForForwardingToRegisteredRouters.bind(this, AppLifeCycle));
        };
    }

    ShellNavigationInternal.hasNoAdapter = true;
    return ShellNavigationInternal;
}, true /* bExport */);

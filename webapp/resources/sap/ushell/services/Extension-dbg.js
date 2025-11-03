// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Extension.
 * This files exposes an API to extend the launchpad with new elements.
 * It is exposed publicly and meant to be used by apps and plugins.
 *
 * @version 1.141.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Element",
    "sap/ushell/services/Extension/Item",
    "sap/ushell/Container",
    "sap/ushell/utils"
], (
    Log,
    Element,
    ExtensionItem,
    Container,
    ushellUtils
) => {
    "use strict";

    /**
     * @alias sap.ushell.services.Extension
     * @class
     * @classdesc The Unified Shell's Extension service.
     * Allows adding extensions on the user's home page.
     *
     * <b>Note:</b> To retrieve a valid instance of this service, it is necessary to call {@link sap.ushell.Container#getServiceAsync}.
     * <pre>
     *   sap.ui.require(["sap/ushell/Container"], async function (Container) {
     *     const Extension = await Container.getServiceAsync("Extension");
     *     // do something with the Extension service
     *   });
     * </pre>
     *
     * This service is available in any FLP context (native, iframe, ...).
     *
     * <br>
     * All extension items and extension areas are instantiated as invisible.
     * You have to call .show<...> to make them visible.
     *
     * @augments sap.ushell.services.Service
     * @hideconstructor
     *
     * @since 1.120.0
     * @public
     */
    function Extension () { }

    // ========================================== Helper ====================================================================

    /**
     * Creates a function which scopes a specific control to a single visibility handler.
     * The new function combines a show and hide function.
     * @param {string} controlId The id of the control.
     * @param {function} show The show function.
     * @param {function} hide The hide function.
     * @returns {function} The scoped visibility handler.
     *
     * @since 1.120.0
     * @private
     */
    Extension.prototype._createItemVisibilityHandler = function (controlId, show, hide) {
        return async function visibilityHandler (visible, currentState, state) {
            const states = state ? [state] : undefined;
            if (visible) {
                await ushellUtils.promisify(show(controlId, currentState, states));
                return;
            }
            await ushellUtils.promisify(hide(controlId, currentState, states));
        };
    };

    /**
     * Utility function to await a function call.
     * @param {function} create The create function.
     * @param {Array<*>} createArgs The list of arguments.
     * @returns {Promise<sap.ui.core.Control>} The created control.
     *
     * @since 1.120.0
     * @private
     */
    Extension.prototype._createControl = async function (create, createArgs) {
        return ushellUtils.promisify(create(...createArgs));
    };

    // ========================================== Header - Items ====================================================================

    /**
     * Creates a header item in the shell header.
     * <b>Restrictions:</b>
     * <ul>
     * <li>The control properties are only allowed to contain primitive properties and event handlers.
     * Bindings, aggregations, controls and objects with prototypes are not allowed!</li>
     * <li>The created controls cannot have stable ids! Instead you can provide a help id.</li>
     * <li>The event handlers are not bound to the actual control and do not receive the event arguments.</li>
     * </ul>
     *
     * @example
     *
     *   Extension.createHeaderItem({
     *       ariaLabel: "headerItem-ariaLabel",
     *       ariaHaspopup: "dialog",
     *       icon: "sap-icon://action-settings",
     *       tooltip: "headerItem-tooltip",
     *       text: "headerItem-text",
     *       press: () => {
     *           MessageToast.show("Press header item");
     *       }
     *   }, {
     *       position: "begin"
     *       helpId: "myHeaderItemHelpId"
     *   })
     *
     * @param {sap.ushell.ui.shell.ShellHeadItem.Properties} controlProperties The properties that will be passed to the created control.
     * @param {object} [parameters] Additional parameters.
     * @param {string} [parameters.position=end] Possible values are <code>begin</code> and <code>end</code>.
     * @param {string} [parameters.helpId] The help id of the user action. This allows to assign help content to the user action.
     * @returns {Promise<sap.ushell.services.Extension.Item>} The newly created header item.
     *
     * @since 1.120.0
     * @public
     */
    Extension.prototype.createHeaderItem = async function (controlProperties, parameters = {}) {
        if (controlProperties.id) {
            if (Element.getElementById(controlProperties.id)) {
                throw new Error("The control id is not allowed for header items! The id will be generated automatically and must not be set by the application.");
            }

            Log.error("The control id is not allowed for header items! The id will be generated automatically. - For plugins use sap.ushell.services.FrameBoundExtension instead.");
            delete controlProperties.id; // remove the id to prevent issues
        }

        const { position, helpId } = parameters;
        const aValidPositions = ["begin", "end", undefined];
        if (!aValidPositions.includes(position)) {
            throw new Error(`Unexpected Input: '${position}' is not a valid position!`);
        }

        if (position === "begin") {
            return this._createHeaderStartItem(controlProperties, helpId);
        }
        // "end" or undefined
        return this._createHeaderEndItem(controlProperties, helpId);
    };

    /**
     * Creates a header item in the shell header next to the company logo.
     * @param {object} controlProperties The properties that will be passed to the created control.
     * @param {string} [helpId] The help id of the header item. This allows to assign help content to the header item.
     * @returns {Promise<sap.ushell.services.Extension.Item>} The newly created header item.
     *
     * @since 1.120.0
     * @private
     */
    Extension.prototype._createHeaderStartItem = async function (controlProperties, helpId) {
        const oRenderer = Container.getRendererInternal();
        const aCreateArgs = [
            controlProperties,
            false, // visible
            undefined, // currentState
            undefined // states
        ];
        const fnCreate = oRenderer.addHeaderItem.bind(oRenderer);
        const fnShow = oRenderer.showHeaderItem.bind(oRenderer);
        const fnHide = oRenderer.hideHeaderItem.bind(oRenderer);

        const oControl = await this._createControl(fnCreate, aCreateArgs);
        const fnVisibilityHandler = this._createItemVisibilityHandler(oControl.getId(), fnShow, fnHide);

        if (helpId) {
            oControl.data("help-id", helpId, true);
        }

        return new ExtensionItem(oControl, fnVisibilityHandler);
    };

    /**
     * Creates a header item in the shell header next to the user action menu.
     * @param {object} controlProperties The properties that will be passed to the created control.
     * @param {string} [helpId] The help id of the user action. This allows to assign help content to the user action.
     * @returns {Promise<sap.ushell.services.Extension.Item>} The newly created header item.
     *
     * @since 1.120.0
     * @private
     */
    Extension.prototype._createHeaderEndItem = async function (controlProperties, helpId) {
        const oRenderer = Container.getRendererInternal();

        const aCreateArgs = [
            controlProperties,
            false, // visible
            undefined, // currentState
            undefined // states
        ];
        const fnCreate = oRenderer.addHeaderEndItem.bind(oRenderer);
        const fnShow = oRenderer.showHeaderEndItem.bind(oRenderer);
        const fnHide = oRenderer.hideHeaderEndItem.bind(oRenderer);

        const oControl = await this._createControl(fnCreate, aCreateArgs);
        const fnVisibilityHandler = this._createItemVisibilityHandler(oControl.getId(), fnShow, fnHide);

        if (helpId) {
            oControl.data("help-id", helpId, true);
        }

        return new ExtensionItem(oControl, fnVisibilityHandler);
    };

    // ========================================== UserAction ====================================================================

    /**
     * Creates a user action in the user action menu.<br>
     * The <code>controlType</code> can be any control and is by default a {@link sap.ushell.ui.launchpad.ActionItem}.
     * The <code>controlProperties</code> are passed to the constructor of the control.
     * <br>
     * <b>Restrictions:</b>
     * <ul>
     * <li>The control properties are only allowed to contain primitive properties and event handlers.
     * Bindings, aggregations, controls and objects with prototypes are not allowed!</li>
     * <li>The created controls cannot have stable ids! Instead you can provide a help id.</li>
     * <li>The event handlers are not bound to the actual control and do not receive the event arguments.</li>
     * </ul>
     *
     * @example
     *
     *   Extension.createUserAction({
     *       text: "New UserAction",
     *       icon: "sap-icon://refresh",
     *       press: () => {
     *           MessageToast.show("Press UserAction");
     *       }
     *   }, {
     *       controlType: "sap.ushell.ui.launchpad.ActionItem",
     *       helpId: "myUserActionHelpId"
     *   })
     *
     * @param {object} controlProperties The properties that will be passed to the created control.
     * @param {object} [parameters] Additional parameters.
     * @param {string} [parameters.controlType=sap.ushell.ui.launchpad.ActionItem] Defines the <code>controlType</code> of the item.
     * @param {string} [parameters.helpId] The help id of the user action. This allows to assign help content to the user action.
     * @returns {Promise<sap.ushell.services.Extension.Item>} The newly created user action.
     *
     * @since 1.120.0
     * @public
     */
    Extension.prototype.createUserAction = async function (controlProperties, parameters = {}) {
        if (controlProperties.id) {
            if (Element.getElementById(controlProperties.id)) {
                throw new Error("The control id is not allowed for header items! The id will be generated automatically and must not be set by the application.");
            }

            Log.error("The control id is not allowed for header items! The id will be generated automatically. - For plugins use sap.ushell.services.FrameBoundExtension instead.");
            delete controlProperties.id; // remove the id to prevent issues
        }

        const oRenderer = Container.getRendererInternal();

        const aCreateArgs = [{
            controlType: parameters.controlType || "sap.m.Button",
            oControlProperties: controlProperties,
            bIsVisible: false,
            bCurrentState: undefined,
            aStates: undefined
        }];
        const fnCreate = oRenderer.addUserAction.bind(oRenderer);
        const fnShow = oRenderer.showActionButton.bind(oRenderer);
        const fnHide = oRenderer.hideActionButton.bind(oRenderer);

        const oControl = await this._createControl(fnCreate, aCreateArgs);
        const fnVisibilityHandler = this._createItemVisibilityHandler(oControl.getId(), fnShow, fnHide);

        if (parameters.helpId) {
            oControl.data("help-id", parameters.helpId, true);
        }

        return new ExtensionItem(oControl, fnVisibilityHandler);
    };

    // ========================================== second Title ====================================================================

    /**
     * Sets the second title in the shell header next to the application title.
     * It is displayed indefinitely until a different second title was set.
     * @param {string} sTitle The title.
     * @returns {Promise} A promise that resolves when the title was set.
     *
     * @since 1.125.0
     * @private
     * @experimental since 1.125.0
     */
    Extension.prototype.setSecondTitle = async function (sTitle) {
        const oRenderer = Container.getRendererInternal();
        oRenderer.setHeaderTitle(sTitle);
    };

    Extension.hasNoAdapter = true;
    return Extension;
});

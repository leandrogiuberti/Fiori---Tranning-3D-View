// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The app runtime wrapper for {@link sap.ushell.services.Extension}.
 *
 * @version 1.141.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/isPlainObject",
    "sap/ui/core/Element",
    "sap/ushell/appRuntime/ui5/services/Extension/Item",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr"
], (
    Log,
    isPlainObject,
    Element,
    ExtensionItem,
    AppCommunicationMgr
) => {
    "use strict";

    /**
     * @alias sap.ushell.appRuntime.ui5.services.Extension
     * @class
     * @classdesc The app runtime wrapper for {@link sap.ushell.services.Extension}.
     *
     * @hideconstructor
     *
     * @since 1.124.0
     * @private
     */
    function ExtensionProxy () {
        this._oItemMap = {};

        const oRequestHandlers = {
            "sap.ushell.services.Extension.handleControlEvent": {
                handler: async (oMessageBody, oMessageEvent) => {
                    const { itemId, eventName } = oMessageBody;
                    const oItem = this._oItemMap[itemId];
                    if (oItem) {
                        oItem.handleEvent(eventName);
                    }
                }
            }
        };

        Object.keys(oRequestHandlers).forEach((sServiceRequest) => {
            AppCommunicationMgr.setRequestHandler(sServiceRequest, oRequestHandlers[sServiceRequest].handler);
        });
    }

    /**
     * Separates the properties of a control into primitive, complex and event properties.
     * @param {object} oControlProperties The properties of the control.
     * @returns {{ primitive: Object<string, int|string|boolean|object>, complex: object, events: Object<string, function> }} The separated properties.
     *
     * @since 1.124.0
     * @private
     */
    ExtensionProxy.prototype._extractControlProperties = function (oControlProperties) {
        const oProperties = {
            primitive: {},
            complex: {},
            events: {}
        };
        Object.keys(oControlProperties).forEach((sKey) => {
            const vValue = oControlProperties[sKey];

            if (typeof vValue === "function") {
                oProperties.events[sKey] = vValue;
            } else if (typeof vValue === "object") {
                if (isPlainObject(vValue)) {
                    oProperties.primitive[sKey] = vValue;
                } else {
                    oProperties.complex[sKey] = vValue;
                }
            } else {
                oProperties.primitive[sKey] = vValue;
            }
        });
        return oProperties;
    };

    /**
     * Creates a header item in the shell header.
     * @param {sap.ushell.ui.shell.ShellHeadItem.Properties} controlProperties The properties that will be passed to the created control.
     * @param {object} [parameters] Additional parameters.
     * @param {string} [parameters.position=end] Possible values are <code>begin</code> and <code>end</code>.
     * @param {string} [parameters.helpId] The help id of the user action. This allows to assign help content to the user action.
     * @returns {Promise<sap.ushell.appRuntime.ui5.services.Extension.Item>} A wrapper for the newly created header item.
     *
     * @see sap.ushell.services.Extension#createHeaderItem
     *
     * @since 1.124.0
     * @private
     */
    ExtensionProxy.prototype.createHeaderItem = async function (controlProperties, parameters = {}) {
        if (controlProperties.id) {
            if (Element.getElementById(controlProperties.id)) {
                throw new Error("The control id is not allowed for header items! The id will be generated automatically and must not be set by the application.");
            }

            Log.error("The control id is not allowed for header items! The id will be generated automatically.");
            delete controlProperties.id; // remove the id to prevent issues
        }

        const oProperties = this._extractControlProperties(controlProperties);

        if (Object.keys(oProperties.complex).length > 0) {
            throw new Error("Complex properties (aggregations, controls, non plain objects) are not allowed for header items!");
        }

        const { itemId } = await AppCommunicationMgr.postMessageToFLP("sap.ushell.services.Extension.createHeaderItem", {
            controlProperties: oProperties.primitive,
            events: Object.keys(oProperties.events),
            parameters
        });

        const oItem = new ExtensionItem(itemId, oProperties.events);
        this._oItemMap[itemId] = oItem;

        return oItem;
    };

    /**
     * Creates a user action in the user action menu.
     * @param {object} controlProperties The properties that will be passed to the created control.
     * <p><b>Restriction:</b> The control properties are only allowed to contain primitive properties and event handlers.
     * Aggregations, controls and types with prototypes are not allowed!</p>
     * @param {object} [parameters] Additional parameters.
     * @param {string} [parameters.controlType=sap.ushell.ui.launchpad.ActionItem] Defines the <code>controlType</code>.
     * @param {string} [parameters.helpId] The help id of the user action. This allows to assign help content to the user action.
     * @returns {Promise<sap.ushell.appRuntime.ui5.services.Extension.Item>} A wrapper for the newly created user action.
     *
     * @see sap.ushell.services.Extension#createUserAction
     *
     * @since 1.124.0
     * @private
     */
    ExtensionProxy.prototype.createUserAction = async function (controlProperties, parameters = {}) {
        if (controlProperties.id) {
            if (Element.getElementById(controlProperties.id)) {
                throw new Error("The control id is not allowed for header items! The id will be generated automatically and must not be set by the application.");
            }

            Log.error("The control id is not allowed for header items! The id will be generated automatically.");
            delete controlProperties.id; // remove the id to prevent issues
        }

        const oProperties = this._extractControlProperties(controlProperties);

        if (Object.keys(oProperties.complex).length > 0) {
            throw new Error("Complex properties (aggregations, controls, non plain objects) are not allowed for user actions!");
        }

        const { itemId } = await AppCommunicationMgr.postMessageToFLP("sap.ushell.services.Extension.createUserAction", {
            controlProperties: oProperties.primitive,
            events: Object.keys(oProperties.events),
            parameters
        });

        const oItem = new ExtensionItem(itemId, oProperties.events);
        this._oItemMap[itemId] = oItem;

        return oItem;
    };

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
    ExtensionProxy.prototype.setSecondTitle = function (sTitle) {
        return AppCommunicationMgr.postMessageToFLP("sap.ushell.services.Extension.setSecondTitle", {
            title: sTitle
        });
    };

    ExtensionProxy.hasNoAdapter = true;

    return ExtensionProxy;
});

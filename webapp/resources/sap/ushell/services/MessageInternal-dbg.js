// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's message service.
 * This is a private service replacing the depercated Message service, as the functionality is used thoughout the ushell.
 *
 * @version 1.141.1
 */
sap.ui.define([
    "sap/base/Log",
    "sap/m/MessageBox",
    "sap/ushell/Config",
    "sap/ushell/resources",
    "sap/m/Dialog",
    "sap/m/Text",
    "sap/m/Link",
    "sap/m/Button",
    "sap/m/VBox",
    "sap/m/FormattedText",
    "sap/m/library",
    "sap/ui/core/library"
], (
    Log,
    MessageBox,
    Config,
    resources,
    Dialog,
    Text,
    Link,
    Button,
    VBox,
    FormattedText,
    mobileLibrary,
    coreLibrary
) => {
    "use strict";

    // shortcut for sap.m.ButtonType
    const ButtonType = mobileLibrary.ButtonType;

    // shortcut for sap.m.DialogType
    const DialogType = mobileLibrary.DialogType;

    // shortcut for sap.ui.core.ValueState
    const ValueState = coreLibrary.ValueState;

    // shortcut for sap.m.FlexRendertype
    const FlexRendertype = mobileLibrary.FlexRendertype;

    /**
     * @alias sap.ushell.services.MessageInternal
     * @class
     * @classdesc MessageInternal service.
     *
     * <b>Note:</b> To retrieve a valid instance of this service, it is necessary to call {@link sap.ushell.Container#getServiceAsync}.
     * <pre>
     *   sap.ui.require(["sap/ushell/Container"], async function (Container) {
     *     const MessageInternal = await Container.getServiceAsync("MessageInternal");
     *     // do something with the MessageInternal service
     *   });
     * </pre>
     *
     * @augments sap.ushell.services.Service
     * @hideconstructor
     *
     * @since 1.124.0
     * @private
     */
    function MessageInternal () {
        let fnShellCallBackFunction;

        /**
         * Initialization:
         * This method is to be invoked by the Shell to register the message callback function.
         * The signature of the callback is defined via the show function.
         *
         * @param {function} fnShellCallback callback for the shell to execute showing the message
         * @returns {this} <code>this</code> for method chaining
         *
         * @private
         */
        this.init = function (fnShellCallback) {
            fnShellCallBackFunction = fnShellCallback;

            return this;
        };

        /**
         * Shows a message on the screen.
         *
         * @param {sap.ushell.services.MessageInternal.Type} iType message type
         * @param {string} sMessage the localized message as plain text
         * @param {object} oParameters Some parameters
         *
         * @private
         */
        this.show = function (iType, sMessage, oParameters) {
            if (!sMessage) {
                Log.error("Message must not be empty.");
                return;
            }

            if (fnShellCallBackFunction && typeof fnShellCallBackFunction === "function") {
                fnShellCallBackFunction(iType, sMessage, oParameters || {});
            } else {
                this.buildMessage(iType, sMessage, oParameters || {});
            }
        };

        /**
         * Decides wether a MessageBox or a SupportMessage needs to be send and accordingly builds a configuration for it.
         *
         * @param {int} iType message type
         * @param {string} sMessage message text
         * @param {object} oParameters message parameters
         *
         * @private
         */
        this.buildMessage = function (iType, sMessage, oParameters) {
            let oMessageBoxConfig = {
                title: oParameters.title,
                actions: oParameters.actions,
                details: oParameters.details,
                onClose: oParameters.callback,
                emphasizedAction: oParameters.emphasizedAction
            };
            let sMessageBoxType;

            switch (iType) {
                case MessageInternal.Type.ERROR:
                    this._createAndOpenErrorDialog(sMessage, oMessageBoxConfig);
                    return;
                case MessageInternal.Type.CONFIRM:
                    if (!oParameters.actions) {
                        sMessageBoxType = "confirm";
                    } else if (oParameters.actions.indexOf("DELETE") > -1) {
                        sMessageBoxType = "warning";
                        oMessageBoxConfig.emphasizedAction = MessageBox.Action.DELETE;
                    } else {
                        oMessageBoxConfig.icon = MessageBox.Icon.QUESTION;
                        sMessageBoxType = "show";
                    }
                    break;
                case MessageInternal.Type.INFO:
                    sMessageBoxType = "info";
                    this.buildAndSendMessageToast(sMessage, oParameters.duration || 3000);
                    // Show only Toast. Don't need to show the MessageBox.
                    return;
                default:
                    oMessageBoxConfig = { duration: oParameters.duration || 3000 };
                    sMessageBoxType = "show";
                    break;
            }

            this.sendMessageBox(sMessage, sMessageBoxType, oMessageBoxConfig); // Give me some parameters please!
        };

        /**
         * Copies the content of the dialog to the clipboard.
         *
         * @param {string} message The message displayed by the dialog.
         * @param {object} config The configuration of the dialog.
         * @param {string} dialogTitle The title of the dialog.
         *
         * @private
         */
        this._copyToClipboard = function (message, config, dialogTitle) {
            let sFormattedDetails = config.details;

            if (typeof config.details === "object") {
                // Using stringify() with "tab" as space argument and escaping the JSON to prevent binding
                sFormattedDetails = JSON.stringify(config.details, null, "\t");
            }

            const aCopiedText = [
                `Title: ${dialogTitle || "-"}`,
                `Message: ${message || "-"}`,
                `Details: ${sFormattedDetails || "-"}`
            ];

            const oElementWithPrevFocus = document.activeElement;
            const oTemporaryDomElement = document.createElement("textarea");
            let sMessageToastText;

            try {
                oTemporaryDomElement.contentEditable = true;
                oTemporaryDomElement.readonly = false;
                oTemporaryDomElement.innerText = aCopiedText.join("\n");
                document.documentElement.appendChild(oTemporaryDomElement);

                if (navigator.userAgent.match(/ipad|iphone/i)) {
                    const oRange = document.createRange();
                    oRange.selectNodeContents(oTemporaryDomElement);
                    window.getSelection().removeAllRanges();
                    window.getSelection().addRange(oRange);
                    oTemporaryDomElement.setSelectionRange(0, 999999);
                } else {
                    oTemporaryDomElement.select();
                }

                const bSuccessful = document.execCommand("copy");
                sMessageToastText = bSuccessful ? "CopyWasSuccessful" : "CopyWasNotSuccessful";
            } catch (oError) {
                sMessageToastText = "CopyWasNotSuccessful";
            } finally {
                this.buildAndSendMessageToast(resources.i18n.getText(sMessageToastText));
                document.documentElement.removeChild(oTemporaryDomElement);
                window.getSelection().removeAllRanges();
                oElementWithPrevFocus.focus();
            }
        };

        /**
         * Creates a Dialog from a given error message.
         *
         * @param {string} message message text
         * @param {object} messageConfig message configuration (title, details, actions, onClose callback)
         *
         * @private
         */
        this._createAndOpenErrorDialog = function (message, messageConfig) {
            const vDetails = messageConfig.details;
            let oDetailControl;
            if (vDetails) {
                oDetailControl = new FormattedText({
                    htmlText: typeof vDetails === "object" ? vDetails.info : vDetails
                });
            }

            const oErrorDialog = this.errorWithDetails(message, oDetailControl, messageConfig);

            // Check that SupportTicket is enabled and verify that we are not in a flow in which Support ticket creation is failing,
            // if this is the case we don't want to show the user the contact support button again
            if (Config.last("/core/extension/SupportTicket") && message !== resources.i18n.getText("supportTicketCreationFailed")) {
                oErrorDialog.addButton(new Button({
                    text: resources.i18n.getText("contactSupportBtn"),
                    press: () => {
                        sap.ui.require(["sap/ushell/ui/footerbar/ContactSupportButton"], (ContactSupportButton) => {
                            const oContactSupport = new ContactSupportButton();
                            if (oContactSupport) {
                                oContactSupport.showContactSupportDialog();
                                // oContactSupport is redundant after creation of the Contact Support Dialog.
                                oContactSupport.destroy();
                            }
                        });

                        oErrorDialog.close();
                    }
                }));
            }

            if (document.queryCommandSupported("copy")) {
                oErrorDialog.addButton(new Button({
                    text: resources.i18n.getText("CopyToClipboardBtn"),
                    press: this._copyToClipboard.bind(this, message, messageConfig, oErrorDialog.getTitle())
                }));
            }

            oErrorDialog.addButton(new Button({
                text: resources.i18n.getText("closeBtn"),
                type: ButtonType.Emphasized,
                press: oErrorDialog.close.bind(oErrorDialog)
            }));
        };

        /**
         * Sends a MessageToast with provided Message and Duration
         *
         * @param {string} sMessage The message
         * @param {int} iDuration The duration of the MessageToast in ms
         *
         * @private
         */
        this.buildAndSendMessageToast = function (sMessage, iDuration) {
            sap.ui.require(["sap/m/MessageToast"], (MessageToast) => {
                MessageToast.show(sMessage, { duration: iDuration });
            });
        };

        /**
         * Sends a MessageBox based on the provided configuration
         *
         * @param {string} sMessage The actual error message
         * @param {string} sType The type of the MessageBox. e.g.: show, confirm
         * @param {object} oConfig The configuration of the MessageBox
         *
         * @private
         */
        this.sendMessageBox = function (sMessage, sType, oConfig) {
            if (typeof MessageBox[sType] === "function") {
                MessageBox[sType](sMessage, oConfig);
            } else {
                Log.error(`Unknown Message type: ${sType}`, null, "MessageInternal Service");
            }
        };

        /**
         * Shows a MessageToast on the screen.
         *
         * @param {string} sMessage the localized message as plain text
         * @param {int} [iDuration=3000] display duration in ms
         *
         * @private
         */
        this.info = function (sMessage, iDuration) {
            this.show(MessageInternal.Type.INFO, sMessage, { duration: iDuration || 3000 });
        };

        /**
         * Shows an error message on the screen.
         *
         * @param {string} sMessage the localized message as plain text
         * @param {string} [sTitle] the localized title as plain text
         *
         * @private
         */
        this.error = function (sMessage, sTitle) {
            Log.error(sMessage);

            this.show(MessageInternal.Type.ERROR, sMessage, { title: sTitle });
        };

        /**
         * Shows an confirmation dialog on the screen.
         *
         * The callback is called with the following signature:
         * <code>function(Action)</code> where Action is the action type that the user has tapped.
         * For example, when the user has pressed the close button, a sap.m.MessageBox.Action.Close is returned.
         *
         * If no actions are provided, "OK" and "Cancel" will be shown. In this case Action is set by one of the following three values:
         *   1. sap.m.MessageBox.Action.OK: "OK" (confirmed) button is tapped.
         *   2. sap.m.MessageBox.Action.Cancel: "Cancel" (unconfirmed) button is tapped.
         *   3. null: Confirm dialog is closed by calling sap.m.InstanceManager.closeAllDialogs()
         *
         * @param {string} sMessage the localized message as plain text
         * @param {function(): string} fnCallback callback function
         * @param {string} [sTitle] the localized title as plain text
         * @param {sap.m.MessageBox.Action|sap.m.MessageBox.Action[]|string|string[]} [vActions]
         *   Either a single action, or an array of two actions.
         *   If no action(s) are given, the single action MessageBox.Action.OK is taken as a default for the parameter.
         *   If more than two actions are given, only the first two actions are taken.
         *   Custom action string(s) can be provided, and then the translation of custom action string(s)
         *   needs to be done by the application.
         *
         * @private
         */
        this.confirm = function (sMessage, fnCallback, sTitle, vActions) {
            this.show(MessageInternal.Type.CONFIRM, sMessage, { title: sTitle, callback: fnCallback, actions: vActions });
        };

        /**
         * Shows an error message with details on the screen.
         * If more than one control should be shown, an {sap.m.VBox} can be used.
         * The default title is "error".
         * If no custom buttons are given, an emphasized "close" button is shown.
         *
         * @param {string} message The localized message as plain text
         * @param {sap.ui.core.Control} [detailControl] The control that should be displayed,
         * once a user presses the "View Details" link
         * @param {string|object} messageConfig The localized title as string or the message configuration object (title, details, actions, onClose callback)
         * @param {sap.m.Button[]} [buttons] The custom buttons that should be shown on the dialog
         *
         * @returns {sap.m.Dialog} The error dialog, so it can be destroyed by a custom button
         *
         * @private
         */
        this.errorWithDetails = function (message, detailControl, messageConfig, buttons) {
            if (Array.isArray(detailControl)) {
                buttons = detailControl;
                detailControl = null;
            }

            let sTitle = typeof messageConfig === "string" ? messageConfig : messageConfig?.title;

            if (typeof detailControl === "string") {
                buttons = sTitle;
                sTitle = detailControl;
                detailControl = null;
            }

            const oText = new Text({
                text: message,
                visible: !!message
            });

            if (detailControl) {
                oText.addStyleClass("sapUiSmallMarginBottom");
            }
            const oErrorDialog = new Dialog({
                state: ValueState.Error,
                type: DialogType.Message,
                contentWidth: "30rem",
                title: sTitle || resources.i18n.getText("error"),
                content: [
                    new VBox({
                        renderType: FlexRendertype.Bare,
                        items: [
                            oText,
                            new Link({
                                text: resources.i18n.getText("ViewDetails"),
                                visible: !!detailControl,
                                press: function () {
                                    oErrorDialog.getContent()[0].addItem(detailControl);
                                    this.destroy();
                                }
                            })
                        ]
                    })
                ],
                buttons: buttons,
                endButton: new Button({
                    text: resources.i18n.getText("closeBtn"),
                    type: ButtonType.Emphasized,
                    press: function () {
                        oErrorDialog.close();
                    }
                }),
                afterClose: function () {
                    this.destroy();
                }
            }).addStyleClass("sapContrastPlus");
            if (typeof messageConfig?.onClose === "function") {
                oErrorDialog.attachAfterClose(messageConfig.onClose);
            }
            oErrorDialog.open();

            return oErrorDialog;
        };

        // Expose Type Enum also via MessageInternal Service Instance, so that a user does not have to require the ushell lib.
        this.Type = MessageInternal.Type;
    }

    /**
     * @alias sap.ushell.services.MessageInternal.Type
     * @private
     */
    MessageInternal.Type = {
        INFO: 0,
        ERROR: 1,
        CONFIRM: 2
    };

    MessageInternal.hasNoAdapter = true;
    return MessageInternal;
});

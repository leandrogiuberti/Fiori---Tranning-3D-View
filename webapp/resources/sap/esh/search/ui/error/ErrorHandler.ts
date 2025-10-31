/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import Log from "sap/base/Log";
import SearchModel from "sap/esh/search/ui/SearchModel";
import MessageBox from "sap/m/MessageBox";
import { TextDirection } from "sap/ui/core/library";
import MessageType from "sap/ui/core/message/MessageType";
import i18n from "../i18n";
import { ESHUIError } from "./errors";
import {
    DataSourceAttributeMetadataNotFoundError,
    ServerError,
    ServerErrorCode,
    SinaError,
} from "../sinaNexTS/core/errors";

export interface IUIMessage {
    type: MessageType;
    title: string;
    description: string;
    shownToUser?: boolean;
}

export interface ErrorHandlingOptions {
    showMinorErrorsAsWarnings: boolean;
}

/**
 * This ErrorHandler is used to handle thrown instances of ESHUIError.
 * The default implementation will log the error stack to the console
 * and will also show the error message to the user in a popup window.
 */
export default class ErrorHandler {
    private label?: string; // label of this instance, used as logging prefix
    private searchModel?: SearchModel;
    private static instance: ErrorHandler;
    private externalOnErrorHandler?: (error: ESHUIError, options?: ErrorHandlingOptions) => void;
    private readonly _oLogger = Log.getLogger("sap.esh.search.ui.error.ErrorHandler");

    public static getInstance(properties?: {
        label?: string;
        model?: SearchModel;
        onErrorHandler?: (error: ESHUIError, options?: ErrorHandlingOptions) => void;
    }): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler(properties);
        }
        return ErrorHandler.instance;
    }

    private constructor(properties: {
        label?: string;
        model?: SearchModel;
        onErrorHandler?: (error: ESHUIError, options?: ErrorHandlingOptions) => void;
    }) {
        this.label = properties?.label;
        this.searchModel = properties?.model;
        this.externalOnErrorHandler = properties?.onErrorHandler;
    }

    /**
     * Will call the default error handler. The default implementation will
     * print error details to the console and shows an error message to the user.
     * @param error instance of error which happened
     * @returns void
     */
    public onError(error: ESHUIError, options?: ErrorHandlingOptions): void {
        if (typeof this.externalOnErrorHandler === "function") {
            try {
                this.externalOnErrorHandler(error, options);
            } catch (e) {
                this.handleError(e, options);
            }
        } else {
            this.handleError(error, options);
        }
    }

    /**
     * Will call the default error handler and then returns a resolved promise which
     * allows to continue with a registered .then() method.
     * The default implementation will
     * print error details to the console and shows an error message to the user.
     * @param error instance of error which happened
     * @returns Promise<true>
     */
    public onErrorAsync(error: ESHUIError, options?: ErrorHandlingOptions): Promise<true> {
        this.onError(error, options);
        return Promise.resolve(true);
    }

    private handleError(error: Error, options?: ErrorHandlingOptions): void {
        // log error in console
        this.logError(error);
        // show error in UI (message popup)
        this.showError(error, options);
    }

    public setSearchModel(model: SearchModel) {
        this.searchModel = model;
    }

    public setExternalOnErrorHandler(
        onErrorHandler: (error: ESHUIError, options?: ErrorHandlingOptions) => void
    ) {
        this.externalOnErrorHandler = onErrorHandler;
    }

    private getErrorTextGeneric(error): string {
        // name
        let logMessage = error.name;
        // toString
        logMessage += " " + error;
        // stack
        if (typeof error.stack !== "undefined") {
            logMessage = "\n" + error.stack;
        }
        // previous
        if (error.previous instanceof Error) {
            logMessage += `\n--> Previous error was: ${this.getErrorText(error.previous)}`;
        }
        return logMessage;
    }

    private getErrorTextEsh(error: ESHUIError | SinaError): string {
        // name
        let logMessage = error.name;
        // code
        if (error instanceof ServerError) {
            logMessage += " code:" + error.code;
        }
        // message
        logMessage += " " + error.message;
        // details
        if (error?.details) {
            logMessage += "\n" + error.details;
        }
        // solution
        if (error?.solution) {
            logMessage += "\n" + error.solution;
        }
        // stack
        if (typeof error.stack !== "undefined") {
            logMessage += "\n" + error.stack;
        }
        // previous
        if (error.previous instanceof Error) {
            logMessage += `\n--> Previous error was: ${this.getErrorText(error.previous)}`;
        }
        return logMessage;
    }

    private getErrorText(error: Error): string {
        if (error instanceof SinaError || error instanceof ESHUIError) {
            return this.getErrorTextEsh(error);
        } else {
            return this.getErrorTextGeneric(error);
        }
    }

    private logError(error: Error): void {
        // error to string
        let logMessage = this.label ? this.label + ": " : "";
        logMessage += this.getErrorText(error) + "\n";
        // add debug info
        if (this.searchModel && this.searchModel.sinaNext) {
            logMessage += this.searchModel.sinaNext.getDebugInfo() + "\n";
        }
        // write into log
        this._oLogger.error(logMessage, "ErrorHandler");
    }

    private convertErrorToMessage(error: Error, options?: ErrorHandlingOptions): IUIMessage {
        if (error instanceof ESHUIError || error instanceof SinaError) {
            return this.convertErrorToMessageEsh(error, options);
        } else {
            return this.convertErrorToMessageGeneric(error);
        }
    }

    private convertErrorToMessageGeneric(error: Error): IUIMessage {
        let title, description;
        switch (error.name) {
            case "TypeError":
                title = i18n.getText("error.TypeError.message");
                description = i18n.getText("error.TypeError.solution");
                break;
            case "URIError":
                title = i18n.getText("searchError");
                description = i18n.getText("error.URIError.solution");
                break;
            default:
                title = "" + error;
                description = "";
        }
        return { title, description, type: MessageType.Error };
    }

    private convertErrorToMessageEsh(
        error: ESHUIError | SinaError,
        options?: ErrorHandlingOptions
    ): IUIMessage {
        // handle reload errors
        if (
            (error instanceof ServerError && error.code === ServerErrorCode.E300) ||
            error instanceof DataSourceAttributeMetadataNotFoundError
        ) {
            this.showReloadPopup();
            return null;
        }

        // type
        let type = MessageType.Error;
        if (options?.showMinorErrorsAsWarnings) {
            switch (error.name) {
                case "ServerError":
                    switch ((error as ServerError).code) {
                        case ServerErrorCode.E100: // The search result is incomplete because some search connectors are temporary not available.
                            type = MessageType.Warning;
                            break;
                        case ServerErrorCode.E400: //	Duplicate search result list items
                            type = MessageType.Warning;
                            break;
                        case ServerErrorCode.E500: //	AI/nlq service not available
                            type = MessageType.Warning;
                            break;
                    }
            }
        }

        // title
        const title = error.message || i18n.getText("searchError");

        // description
        const description = [];
        if (error.details) {
            description.push(error.details);
        }
        if (error.solution) {
            description.push(error.solution);
        }
        let code = "";
        if (error.name === "ServerError") {
            code = " " + (error as ServerError).code;
        }
        description.push("(" + error.name + code + ")");

        return { title: title, description: description.join("\n"), type: type };
    }

    private showReloadPopup() {
        MessageBox.confirm(i18n.getText("searchModelChanged"), {
            onClose: (event) => {
                if (event === "OK") {
                    if (this.searchModel) {
                        this.searchModel.resetDataSource(false);
                        this.searchModel.resetAllFilterConditions(false);
                        const reloadNavigationTarget =
                            this.searchModel.createSearchNavigationTargetCurrentState();
                        window.location.href = reloadNavigationTarget.targetUrl;
                    }
                    window.location.reload();
                }
            },
            styleClass: "sapUshellSearchMessageBox", // selector for closePopovers
        });
    }

    private showMessageBox(message: IUIMessage) {
        const text = message.title + "\n" + message.description;
        const props = {
            onClose: null,
            initialFocus: null,
            textDirection: TextDirection.Inherit,
            styleClass: "sapUshellSearchMessageBox", // selector for closePopovers
        };
        switch (message.type) {
            case MessageType.Information:
                MessageBox.information(text, props);
                break;
            case MessageType.Warning:
                MessageBox.warning(text, props);
                break;
            case MessageType.Error:
                MessageBox.error(text, props);
                break;
            default:
                MessageBox.error(text, props);
                break;
        }
    }

    private showError(error: Error, options?: ErrorHandlingOptions): void {
        const message = this.convertErrorToMessage(error, options);
        if (!message) {
            return;
        }
        if (this.searchModel) {
            // display in message popover
            this.searchModel.pushUIMessage(message);
        } else {
            // display in raw message box
            this.showMessageBox(message);
        }
    }
}

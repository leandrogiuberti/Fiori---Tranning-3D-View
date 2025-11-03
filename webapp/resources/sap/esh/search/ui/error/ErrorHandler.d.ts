declare module "sap/esh/search/ui/error/ErrorHandler" {
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import MessageType from "sap/ui/core/message/MessageType";
    import { ESHUIError } from "sap/esh/search/ui/error/errors";
    interface IUIMessage {
        type: MessageType;
        title: string;
        description: string;
        shownToUser?: boolean;
    }
    interface ErrorHandlingOptions {
        showMinorErrorsAsWarnings: boolean;
    }
    /**
     * This ErrorHandler is used to handle thrown instances of ESHUIError.
     * The default implementation will log the error stack to the console
     * and will also show the error message to the user in a popup window.
     */
    export default class ErrorHandler {
        private label?;
        private searchModel?;
        private static instance;
        private externalOnErrorHandler?;
        private readonly _oLogger;
        static getInstance(properties?: {
            label?: string;
            model?: SearchModel;
            onErrorHandler?: (error: ESHUIError, options?: ErrorHandlingOptions) => void;
        }): ErrorHandler;
        private constructor();
        /**
         * Will call the default error handler. The default implementation will
         * print error details to the console and shows an error message to the user.
         * @param error instance of error which happened
         * @returns void
         */
        onError(error: ESHUIError, options?: ErrorHandlingOptions): void;
        /**
         * Will call the default error handler and then returns a resolved promise which
         * allows to continue with a registered .then() method.
         * The default implementation will
         * print error details to the console and shows an error message to the user.
         * @param error instance of error which happened
         * @returns Promise<true>
         */
        onErrorAsync(error: ESHUIError, options?: ErrorHandlingOptions): Promise<true>;
        private handleError;
        setSearchModel(model: SearchModel): void;
        setExternalOnErrorHandler(onErrorHandler: (error: ESHUIError, options?: ErrorHandlingOptions) => void): void;
        private getErrorTextGeneric;
        private getErrorTextEsh;
        private getErrorText;
        private logError;
        private convertErrorToMessage;
        private convertErrorToMessageGeneric;
        private convertErrorToMessageEsh;
        private showReloadPopup;
        private showMessageBox;
        private showError;
    }
}
//# sourceMappingURL=ErrorHandler.d.ts.map
declare module "sap/esh/search/ui/sinaNexTS/core/Log" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    enum Severity {
        ERROR = 1,
        WARN = 2,
        INFO = 3,
        DEBUG = 4
    }
    /**
     * This is equivalent to:
     * type LogLevelStrings = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
     */
    type LogLevelStrings = keyof typeof Severity;
    class Log {
        private readonly name;
        static level: Severity;
        static persistency: {
            error(messageOrError: string | Error): void;
            warn(message: string): void;
            info(message: string): void;
            debug(message: string): void;
        };
        constructor(name?: string);
        debug(messageOrError: string | Error): void;
        info(messageOrError: string | Error): void;
        warn(messageOrError: string | Error): void;
        error(messageOrError: string | Error): void;
        private printMessageOrError;
        private printMessage;
    }
}
//# sourceMappingURL=Log.d.ts.map
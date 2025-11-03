/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
export enum Severity {
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4,
}

/**
 * This is equivalent to:
 * type LogLevelStrings = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
 */
type LogLevelStrings = keyof typeof Severity;

export class Log {
    public static level: Severity = Severity.ERROR;
    public static persistency: {
        error(messageOrError: string | Error): void;
        warn(message: string): void;
        info(message: string): void;
        debug(message: string): void;
    } = console;

    constructor(private readonly name = "default-log") {}

    debug(messageOrError: string | Error): void {
        this.printMessageOrError("DEBUG", messageOrError);
    }

    info(messageOrError: string | Error): void {
        this.printMessageOrError("INFO", messageOrError);
    }

    warn(messageOrError: string | Error): void {
        this.printMessageOrError("WARN", messageOrError);
    }

    error(messageOrError: string | Error): void {
        this.printMessageOrError("ERROR", messageOrError);
    }

    private printMessageOrError(severity: LogLevelStrings, messageOrError: string | Error): void {
        if (messageOrError instanceof Error) {
            if (messageOrError.stack) {
                this.printMessage(severity, messageOrError.stack);
            } else {
                this.printMessage(severity, messageOrError + "");
            }
        } else {
            this.printMessage(severity, messageOrError);
        }
    }

    private printMessage(severity: LogLevelStrings, text: string): void {
        const num = Severity[severity];

        const msg = "[" + this.name + "]: " + text;
        if (num <= Log.level) {
            switch (num) {
                case Severity.DEBUG:
                    {
                        if (typeof Log.persistency.debug === "function") {
                            Log.persistency.debug(msg);
                            return;
                        }
                    }
                    break;
                case Severity.INFO:
                    {
                        if (typeof Log.persistency.info === "function") {
                            Log.persistency.info(msg);
                            return;
                        }
                    }
                    break;
                case Severity.WARN:
                    {
                        if (typeof Log.persistency.warn === "function") {
                            Log.persistency.warn(msg);
                            return;
                        }
                    }
                    break;
                case Severity.ERROR: {
                    if (typeof Log.persistency.error === "function") {
                        Log.persistency.error(msg);
                        return;
                    }
                }
            }
            console.log(msg);
        }
    }
}

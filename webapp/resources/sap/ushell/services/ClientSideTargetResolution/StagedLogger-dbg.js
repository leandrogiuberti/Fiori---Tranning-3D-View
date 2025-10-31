// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file
 *
 * Exposes a singleton that provides logging functionality for complex operations, carried out in a multi-staged fashion.
 *
 * As a general design principle, the amount of code used to set-up and perform logging is regarded as potentially expensive,
 * and it's a bad idea to run this coded when not needed (e.g. when debugging is not enabled).
 *
 * Because of this, functions that are only called when debugging is enabled are used
 * to obtain input parameters for any public method exported by the module.
 *
 * Usage:
 * oLogger.begin(function () {
 *   return {
 *     logId: "some unique id",
 *     title: "Grow a tree",
 *     moduleName: "sap.ushell.services.ClientSideTargetResolution",
 *     stages: [
 *       "STAGE1: Buy seeds",
 *       "STAGE2: Plant seeds",
 *       "STAGE3: Water",
 *       "STAGE4: Wait"
 *     ]
 *   };
 * });
 *
 * oLogger.log(function () {
 *   return {
 *     logId: "some unique id",
 *     stage: 1,
 *     prefix: "-",
 *     lines: ["going to the shop", "buying seeds"]
 *   };
 * });
 *
 * oLogger.end(); // logs on the console
 *
 * This is a dependency of ClientSideTargetResolution. Interfaces exposed by this module may change at any time without notice.
 *
 * @version 1.141.1
 */
sap.ui.define([
    "sap/base/Log"
], (
    Log
) => {
    "use strict";

    const _oLogs = {};

    /**
     * Resets the logger.
     *
     * @param {object} fnGetArgs A function that must return an object with the logging setup arguments.
     *   Example:
     *   <pre>
     *   function () {
     *     return {
     *       logId: "uniqueId", // multiple log operations may be performed at the same time (potentially asynchronously);
     *                          // this id must be specified with every log operation.
     *       title: "Grow a tree",
     *       moduleName: "sap.ushell.services.ClientSideTargetResolution",
     *       stages: [
     *         "STAGE1: Buy seeds",
     *         "STAGE2: Plant seeds",
     *         "STAGE3: Water",
     *         "STAGE4: Wait"
     *       ]
     *     };
     *   }
     *   </pre>
     * @returns {string} A unique ID for the log operation.
     * @private
     */
    function begin (fnGetArgs) {
        const oSetupArgs = fnGetArgs();

        if (!oSetupArgs.hasOwnProperty("logId")) {
            throw new Error("'logId' argument was not provided in #begin method of StagedLogger.");
        }
        const sLogId = oSetupArgs.logId;

        if (_oLogs[sLogId]) {
            throw new Error(`'cannot call #begin twice with same log id: '${sLogId}'`);
        } else {
            _oLogs[sLogId] = {};
        }

        const oLog = _oLogs[sLogId];

        oLog.title = oSetupArgs.title || null;
        oLog.moduleName = oSetupArgs.moduleName || null;
        // TODO: Array.prototype.fill is not available in ie11, so use repeatChar instead, that puts n Chars of a Char into a string
        function repeatChar (sChar, nNumber) {
            if (nNumber === 1) {
                return sChar;
            }
            return repeatChar(sChar, nNumber - 1) + sChar;
        }

        oLog.stages = oSetupArgs.stages.map((sStageName) => {
            return [
                sStageName, // first line of the output is the stage name
                repeatChar("-", sStageName.length)
            ];
        });

        return sLogId;
    }

    /**
     * Stores one or more lines of log in memory (no console output).
     *
     * @param {object} fnGetArgs A function that must return an object with the logging arguments.
     *   Example:
     *   <pre>
     *   function () {
     *     return {
     *       logId: "uniqueId", // the same provided during #begin call
     *       stage: 1,
     *       prefix: "-",
     *       number: true, // produces 1-... 2-...
     *       lines: ["going to the shop", "buying seeds"]
     *     };
     *   }
     *   </pre>
     * @private
     */
    function log (fnGetArgs) {
        let sLine;
        let sPrefix;

        const oArgs = fnGetArgs();

        if (!oArgs.hasOwnProperty("logId")) {
            throw new Error("'logId' argument was not provided in #log method of StagedLogger.");
        }
        const sLogId = oArgs.logId;

        const iStage = oArgs.stage;
        sPrefix = oArgs.prefix;
        const aLines = oArgs.lines;
        sLine = oArgs.line;
        const bNumber = oArgs.number;

        // prefix must be added to the single line only if there are no multiple lines
        if (!aLines && sLine && sPrefix) {
            sLine = `${sPrefix} ${sLine}`;
        }

        const aLogStage = _oLogs[sLogId].stages[iStage - 1];

        if (sLine) {
            aLogStage.push(sLine);
        }

        if (aLines) {
            if (sPrefix) {
                // indent lines if a single line (the heading) was given
                sPrefix = (sLine ? " " : "") + sPrefix;
            }

            const aLinesWithPrefix = aLines.map((sLine, iIdx) => {
                return (bNumber ? (iIdx + 1) : "") + (sPrefix ? `${sPrefix} ` : "") + sLine;
            });
            aLogStage.push.apply(aLogStage, aLinesWithPrefix);
        }
    }

    /**
     * Calls sap.base.Log.debug and logs output to the console.
     *
     * @param {object} fnGetArgs A function that must return an object representing the arguments for this method.
     *   Currently the unique id is the only argument required.
     *   Example:
     *   <pre>
     *   function () {
     *     return { logId: "uniqueId" }; // the same id provided during #begin call
     *   }
     *   </pre>
     * @private
     */
    function end (fnGetArgs) {
        const oArgs = fnGetArgs();

        if (!oArgs.hasOwnProperty("logId")) {
            throw new Error("'logId' argument was not provided in #log method of StagedLogger.");
        }
        const sLogId = oArgs.logId;

        const oLog = _oLogs[sLogId];

        if (typeof oLog !== "object") {
            throw new Error("Logger .end was called on an already ended logger");
        }

        const sLogString = oLog.stages.map((aStage) => {
            return aStage.join("\n");
        }).join("\n\n");

        Log.debug(
            `[REPORT #${sLogId}] ${oLog.title}`, // avoid timestamp on the same line
            `\n${sLogString // avoid overlap between title and first log line
            }\n`, // avoid overlap between last line and module name
            oLog.moduleName
        );

        delete _oLogs[sLogId];
    }

    /**
     * For testing purposes only.
     *
     * @returns {object[]} Current active log operations.
     * @private
     */
    function _getLogs () {
        return _oLogs;
    }

    return {
        begin: function () {
            if (Log.getLevel() >= Log.Level.DEBUG) {
                begin.apply(null, arguments);
            }
        },

        log: function () {
            if (Log.getLevel() >= Log.Level.DEBUG) {
                log.apply(null, arguments);
            }
        },

        end: function () {
            if (Log.getLevel() >= Log.Level.DEBUG) {
                end.apply(null, arguments);
            }
        },

        _getLogs: _getLogs // for testing
    };
});

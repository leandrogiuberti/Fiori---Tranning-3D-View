// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file PrelaunchOperations are executed just before launching the application (post parameter mapping and app state merging) if the
 * <code>sap-prelaunch-operations</code> parameter is specified as a technical parameter.
 *
 * @version 1.141.1
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/fe/navigation/SelectionVariant",
    "sap/ushell/utils",
    "sap/ushell/Container"
], (
    Log,
    deepExtend,
    SelectionVariant,
    ushellUtils,
    Container
) => {
    "use strict";

    const S_MODULE_NAME = "sap.ushell.services.ClientSideTargetResolution.PrelaunchOperations";

    /**
     * Returns the app state of the given app state key.
     *
     * @param {string} sAppStateKey The app state key.
     * @returns {Promise<object>} Resolves to an app state object.
     * @since 1.69.0
     * @private
     */
    async function _getAppState (sAppStateKey) {
        if (!sAppStateKey) {
            return null;
        }

        return Container.getServiceAsync("AppState")
            .then((AppStateService) => {
                return new Promise((fnResolve, fnReject) => {
                    AppStateService.getAppState(sAppStateKey)
                        .done((oAppState) => {
                            fnResolve(oAppState);
                        })
                        .fail((oError) => {
                            fnReject(oError);
                        });
                });
            });
    }

    /**
     * Update the matching target.
     *
     * @param {object} oPrelaunchOperationsResult The prelaunch operation result.
     * @param {object} oMatchingTarget The matching target.
     * @param {object} oSelectionVariant The selection variant.
     * @param {object} oStartupParameters The startup parameters.
     * @param {string[]} aDefaultedParameterNames The defaulted parameter names.
     * @returns {Promise<object>} Resolves to the matching object.
     * @since 1.69.0
     * @private
     */
    async function _updateMatchingTarget (oPrelaunchOperationsResult, oMatchingTarget, oSelectionVariant, oStartupParameters, aDefaultedParameterNames) {
        if (oPrelaunchOperationsResult.startupParametersModified) {
            oMatchingTarget.mappedIntentParamsPlusSimpleDefaults = oStartupParameters;
        }

        if (oPrelaunchOperationsResult.defaultedParameterNamesModified) {
            oMatchingTarget.mappedDefaultedParamNames = aDefaultedParameterNames;
        }

        if (oPrelaunchOperationsResult.selectionVariantModified) {
            const AppState = await Container.getServiceAsync("AppState");

            const oNewAppState = AppState.createEmptyAppState(undefined, true);
            oNewAppState.setData({
                selectionVariant: oSelectionVariant.toJSONObject()
            });
            await ushellUtils.promisify(oNewAppState.save());

            oMatchingTarget.mappedIntentParamsPlusSimpleDefaults["sap-xapp-state"] = [oNewAppState.getKey()];
        }

        return Promise.resolve(oMatchingTarget);
    }

    /**
     * Returns the operation detail.
     *
     * @param {object} oOperation The prelaunch operation.
     * @returns {string} The operation information.
     * @since 1.69.0
     * @private
     */
    function _formatPrelaunchOperation (oOperation) {
        const sOperationType = oOperation.type;
        switch (sOperationType) {
            case "merge":
            case "split":
                return `${sOperationType} - source: ${oOperation.source} & target: ${oOperation.target}`;
            case "delete":
                return `${sOperationType} - target: ${oOperation.target}`;
            default:
                return "";
        }
    }

    /**
     * Gets the low value of the given parameter from the given selection variant and returns the value.
     *
     * @param {string} sParameter The parameter.
     * @param {object} oSelectionVariant The selection variant.
     * @returns {string} The low value of the given parameter.
     * @since 1.69.0
     * @private
     */
    function _getLowValueFromSelectionVariant (sParameter, oSelectionVariant) {
        if (oSelectionVariant.getSelectOption(sParameter)) {
            return oSelectionVariant.getSelectOption(sParameter)[0].Low;
        }
        return undefined;
    }

    /**
     * Gets the high value of the given parameter from the given selection variant and returns the value.
     *
     * @param {string} sParameter The parameter.
     * @param {object} oSelectionVariant The selection variant.
     * @returns {string} The high value of the given parameter.
     * @since 1.69.0
     * @private
     */
    function _getHighValueFromSelectionVariant (sParameter, oSelectionVariant) {
        if (oSelectionVariant.getSelectOption(sParameter)) {
            return oSelectionVariant.getSelectOption(sParameter)[0].High;
        }
        return undefined;
    }

    /**
     * Gets the value of the given parameter from the given startup parameters and returns the value.
     *
     * @param {string} sParameter The parameter.
     * @param {object} oStartupParameters The startup parameters.
     * @returns {string} The value of the given parameter.
     * @since 1.69.0
     * @private
     */
    function _getValueFromStartupParameters (sParameter, oStartupParameters) {
        if (oStartupParameters[sParameter]) {
            return oStartupParameters[sParameter][0];
        }
        return undefined;
    }

    /**
     * Executes the merge operation. The parameters need to be merged can come from the selection variant or the startup parameters.
     * If the merge operation is executed successfully, an object which indicates the modification of the startup parameters,
     * the selection variant and the defaulted parameter names is returned.
     * For the merge operation, the startup parameters and the defaulted parameter names are not modified.
     *
     * @param {object} oOperation The merge operation.
     * @param {object} oSelectionVariant The selection variant.
     * @param {object} oStartupParameters The startup parameters.
     * @returns {object} The execution result of the merge operation.
     * @since 1.69.0
     * @private
     */
    function _executeMerge (oOperation, oSelectionVariant, oStartupParameters) {
        const sSourceLowParam = oOperation.source[0];
        const sSourceHighParam = oOperation.source[1];
        const sSourceLowValueFromVariant = _getLowValueFromSelectionVariant(sSourceLowParam, oSelectionVariant);
        const sSourceHighValueFromVariant = _getLowValueFromSelectionVariant(sSourceHighParam, oSelectionVariant);
        const sSourceLowValueFromStartup = _getValueFromStartupParameters(sSourceLowParam, oStartupParameters);
        const sSourceHighValueFromStartup = _getValueFromStartupParameters(sSourceHighParam, oStartupParameters);
        let sSourceLowValue;
        let sSourceHighValue;
        const sTarget = oOperation.target;

        // If intent parameters are present in the URL these must have the same value defined in the selection variant in the sap-xapp-state.
        // When no such match occurs, the merge operation should be aborted.
        function _getSourceValue (sValue, sValueToCompare) {
            if (sValueToCompare === undefined || sValue === sValueToCompare) {
                return sValue;
            }
            return undefined;
        }

        // Do not merge when one single parameter is in the intent and the other is in the sap-xapp-state
        if (sSourceLowValueFromVariant && sSourceHighValueFromVariant) {
            sSourceLowValue = _getSourceValue(sSourceLowValueFromVariant, sSourceLowValueFromStartup);
            sSourceHighValue = _getSourceValue(sSourceHighValueFromVariant, sSourceHighValueFromStartup);
        } else if (sSourceLowValueFromStartup && sSourceHighValueFromStartup) {
            sSourceLowValue = _getSourceValue(sSourceLowValueFromStartup, sSourceLowValueFromVariant);
            sSourceHighValue = _getSourceValue(sSourceHighValueFromStartup, sSourceHighValueFromVariant);
        }

        if (sSourceLowValue && sSourceHighValue && !oSelectionVariant.getSelectOption(sTarget)
            && !oStartupParameters.hasOwnProperty(sTarget)) {
            oSelectionVariant.addSelectOption(sTarget, "I", "BT", sSourceLowValue, sSourceHighValue);
            return {
                selectionVariantModified: true,
                startupParametersModified: false,
                defaultedParameterNamesModified: false
            };
        }
        return {};
    }

    /**
     * Returns true if the split operation is valid and false if it is not valid.
     * In the following situations, the split operation is not valid:
     * 1. The source in the operation does not exist in the selection variant.
     * 2. One or more targets in the operation already exist in the selection variant.
     * 3. One or more targets in the operation already exist in the startup parameters.
     *
     * @param {object} oOperation The prelaunch operation.
     * @param {object} oSelectionVariant The selection variant.
     * @param {object} oStartupParameters The startup parameters.
     * @returns {boolean} The split operation is valid or not.
     * @since 1.69.0
     * @private
     */
    function _validateSplit (oOperation, oSelectionVariant, oStartupParameters) {
        const aTarget = oOperation.target;
        const sSource = oOperation.source;

        if (!oSelectionVariant.getSelectOption(sSource)) {
            Log.error(`Invalid split operation: ${sSource} does not exist in selection variant`);
            return false;
        }
        if (oSelectionVariant.getSelectOption(aTarget[0])) {
            Log.error(`Invalid split operation: ${aTarget[0]} already exists in selection variant`);
            return false;
        }
        if (oSelectionVariant.getSelectOption(aTarget[1])) {
            Log.error(`Invalid split operation: ${aTarget[1]} already exists in selection variant`);
            return false;
        }
        if (oStartupParameters[aTarget[0]]) {
            Log.error(`Invalid split operation: ${aTarget[0]} already exists in startup parameters`);
            return false;
        }
        if (oStartupParameters[aTarget[1]]) {
            Log.error(`Invalid split operation: ${aTarget[1]} already exists in startup parameters`);
            return false;
        }
        return true;
    }

    /**
     * Executes the split operation and updates parameters in the startup parameters and the selection variant.
     * The split operation and the select variant are validated. If they are not valid, an empty object is returned.
     * If they are valid, the split operation is executed and an object which indicates the modification of the startup parameters,
     * the selection variant and the defaulted parameter names is returned.
     * The split operation does not modify the defaulted parameter names.
     *
     * @param {object} oOperation The split operation.
     * @param {object} oSelectionVariant The selection variant.
     * @param {object} oStartupParameters The startup parameters.
     * @returns {object} The execution result of the split operation.
     * @since 1.69.0
     * @private
     */
    function _executeSplit (oOperation, oSelectionVariant, oStartupParameters) {
        const aTarget = oOperation.target;
        const sSource = oOperation.source;
        const bCanBeSplit = _validateSplit(oOperation, oSelectionVariant, oStartupParameters);

        if (bCanBeSplit) {
            const sSourceLowValueFromVariant = _getLowValueFromSelectionVariant(sSource, oSelectionVariant);
            const sSourceHighValueFromVariant = _getHighValueFromSelectionVariant(sSource, oSelectionVariant);

            oSelectionVariant.addSelectOption(aTarget[0], "I", "EQ", sSourceLowValueFromVariant, null);
            oStartupParameters[aTarget[0]] = [sSourceLowValueFromVariant];

            oSelectionVariant.addSelectOption(aTarget[1], "I", "EQ", sSourceHighValueFromVariant || sSourceLowValueFromVariant, null);
            oStartupParameters[aTarget[1]] = [sSourceHighValueFromVariant || sSourceLowValueFromVariant];

            return {
                selectionVariantModified: true,
                startupParametersModified: true,
                defaultedParameterNamesModified: false
            };
        }

        return {};
    }

    /**
     * Executes the delete operation and updates parameters in the startup parameters,
     * the selection variant and the defaulted parameter names.
     *
     * Returns an object which indicates the modification of the startup parameters,
     * the selection variant and the defaulted parameter names.
     *
     * @param {object} oOperation The prelaunch operation.
     * @param {object} oSelectionVariant The selection variant.
     * @param {object} oStartupParameters The startup parameters.
     * @param {string[]} aDefaultedParameterNames The default parameter names.
     * @returns {object} The execution result of the delete operation.
     * @since 1.69 .0
     * @private
     */
    function _executeDelete (oOperation, oSelectionVariant, oStartupParameters, aDefaultedParameterNames) {
        const aTarget = oOperation.target;
        const oDeletionResult = {
            selectionVariantModified: false,
            startupParametersModified: false,
            defaultedParameterNamesModified: false
        };

        for (let i = 0; i < aTarget.length; i++) {
            const sTarget = aTarget[i];

            if (sTarget === "sap-xapp-state") {
                Log.warning("Cannot execute delete: 'sap-xapp-state' is not allowed to be deleted");
                continue;
            }
            if (oSelectionVariant.getParameter(sTarget)) {
                oSelectionVariant.removeParameter(sTarget);
                oDeletionResult.selectionVariantModified = true;
            }

            if (oSelectionVariant.getSelectOption(sTarget)) {
                oSelectionVariant.removeSelectOption(sTarget);
                oDeletionResult.selectionVariantModified = true;
            }

            if (oStartupParameters[sTarget]) {
                delete oStartupParameters[sTarget];
                oDeletionResult.startupParametersModified = true;
            }

            const iTargetIndex = aDefaultedParameterNames.indexOf(sTarget);
            if (iTargetIndex > -1) {
                aDefaultedParameterNames.splice(iTargetIndex, 1);
                oDeletionResult.defaultedParameterNamesModified = true;
            }
        }

        return oDeletionResult;
    }

    /**
     * Parses the prelaunch operations into an array in json format.
     * Returns the array or an empty array if the prelaunch operations is an empty string or cannot be parsed.
     *
     * @param {string} sPrelaunchOperations The sap-prelaunch-operations.
     * @returns {object[]} Prelaunch operations.
     * @since 1.69.0
     * @private
     */
    function _parsePrelaunchOperations (sPrelaunchOperations) {
        let aPrelaunchOperations;

        if (sPrelaunchOperations === "") {
            return [];
        }

        // replace invalid quotation marks BCP: 002075129500000704142023
        sPrelaunchOperations = sPrelaunchOperations.replaceAll("“", "\"");
        sPrelaunchOperations = sPrelaunchOperations.replaceAll("”", "\"");

        try {
            aPrelaunchOperations = JSON.parse(sPrelaunchOperations);
        } catch (oError) {
            Log.error("Cannot parse operation array: sap-prelaunch-operations should be in json format.", oError);
            return [];
        }

        if (!Array.isArray(aPrelaunchOperations)) {
            Log.error("Invalid operation array: sap-prelaunch-operations should be an array.");
            return [];
        }

        return aPrelaunchOperations;
    }

    /**
     * Validates prelaunch operations. Returns the array of the operations or null if there are invalid operations.
     *
     * @param {object[]} aPrelaunchOperations The prelaunch operations.
     * @returns {object[]} Prelaunch operations.
     * @since 1.69.0
     * @private
     */
    function _validatePrelaunchOperations (aPrelaunchOperations) {
        if (aPrelaunchOperations.length === 0) {
            return null;
        }

        const oValidOperations = {
            split: true,
            merge: true,
            delete: true
        };

        const aInvalidOperation = aPrelaunchOperations.filter((oOperation) => {
            return !oValidOperations[oOperation.type];
        });

        if (aInvalidOperation.length > 0) {
            Log.error(`Invalid operation: the following sap-prelaunch-operations are invalid: ${aInvalidOperation.join(", ")}`);
            return null;
        }

        const bSameTargetValueInSplit = aPrelaunchOperations.some((oOperation) => {
            return oOperation.type === "split" && oOperation.target[0] === oOperation.target[1];
        });

        if (bSameTargetValueInSplit) {
            Log.error("Invalid operation: split operation contains the same target value. Use two different target values instead.");
            return null;
        }

        const bIncorrectParameterFormat = aPrelaunchOperations.some((oOperation) => {
            if (oOperation.type === "split") {
                return !oOperation.hasOwnProperty("source")
                    || !oOperation.hasOwnProperty("target")
                    || typeof oOperation.source !== "string"
                    || !Array.isArray(oOperation.target)
                    || Object.keys(oOperation).length !== 3
                    || Object.keys(oOperation.target).length !== 2;
            }

            if (oOperation.type === "merge") {
                return !oOperation.hasOwnProperty("source") ||
                    !oOperation.hasOwnProperty("target") ||
                    typeof oOperation.target !== "string" ||
                    !Array.isArray(oOperation.source) ||
                    Object.keys(oOperation).length !== 3 ||
                    Object.keys(oOperation.source).length !== 2;
            }

            if (oOperation.type === "delete") {
                return !oOperation.hasOwnProperty("target")
                    || !Array.isArray(oOperation.target)
                    || Object.keys(oOperation).length !== 2;
            }
        });

        if (bIncorrectParameterFormat) {
            Log.error("Invalid operation: one or more operations are specified in an incorrect format.");
            return null;
        }

        return aPrelaunchOperations;
    }

    /**
     * Returns valid prelaunch operations.
     *
     * @param {string} sPrelaunchOperations The sap-prelaunch-operations.
     * @returns {object[]} Valid prelaunch operations.
     * @since 1.69.0
     * @private
     */
    function parseAndValidatePrelaunchOperations (sPrelaunchOperations) {
        const aPrelaunchOperations = _parsePrelaunchOperations(sPrelaunchOperations);

        return _validatePrelaunchOperations(aPrelaunchOperations);
    }

    /**
     * Executes the prelaunch operations which are split, merge and delete.
     * Returns an object which indicates the modification of the selection variant and the start up parameters.
     * When the debug mode is enabled, output the log messages in the console.
     *
     * @param {object} oSelectionVariant The select variant.
     * @param {object[]} aPrelaunchOperations The prelaunch operations.
     * @param {object} oStartupParameters The startup parameters.
     * @param {string[]} aDefaultedParameterNames The default parameter names.
     * @returns {object} Prelaunch operation execution result.
     * @since 1.69.0
     */
    function _executePrelaunchOperations (oSelectionVariant, aPrelaunchOperations, oStartupParameters, aDefaultedParameterNames) {
        const aDebugLog = (Log.getLevel() >= Log.Level.DEBUG) ? [] : null;
        const oPrelaunchOperationResult = {
            selectionVariantModified: false,
            startupParametersModified: false
        };

        aPrelaunchOperations.forEach((oOperation) => {
            let oExecutionResults = {};

            switch (oOperation.type) {
                case "split":
                    oExecutionResults = _executeSplit(oOperation, oSelectionVariant, oStartupParameters);
                    break;
                case "merge":
                    oExecutionResults = _executeMerge(oOperation, oSelectionVariant, oStartupParameters);
                    break;
                case "delete":
                    oExecutionResults = _executeDelete(oOperation, oSelectionVariant, oStartupParameters, aDefaultedParameterNames);
                    break;
                default:
                    Log.error(`Invalid operation: ${oOperation.type} prelaunch operation type is not supported`);
            }

            // log execution of all operations when debug mode is enabled
            if (aDebugLog) {
                const sIcon = Object.keys(oExecutionResults).length !== 0 ? "\u2705" : "\u274c";
                aDebugLog.push(`${sIcon} ${_formatPrelaunchOperation(oOperation)}`);
            }

            if (Object.keys(oExecutionResults).length === 0) {
                Log.warning(`Cannot execute ${_formatPrelaunchOperation(oOperation)}`);
            }

            oPrelaunchOperationResult.selectionVariantModified = oPrelaunchOperationResult.selectionVariantModified || oExecutionResults.selectionVariantModified;
            oPrelaunchOperationResult.startupParametersModified = oPrelaunchOperationResult.startupParametersModified || oExecutionResults.startupParametersModified;
            oPrelaunchOperationResult.defaultedParameterNamesModified = oPrelaunchOperationResult.defaultedParameterNamesModified || oExecutionResults.defaultedParameterNamesModified;
        });

        if (aDebugLog) {
            Log.debug(`${S_MODULE_NAME}\n${
                aDebugLog.join("\n")}`
            );
        }

        return oPrelaunchOperationResult;
    }

    /**
     * Executes the sap-prelaunch-operations on the matching target.
     * The sap-prelaunch-operations is passed as a string and needs to be parsed and validated before being executed.
     * When the prelaunch operations are valid, they are executed and the matching target is updated according to the execution results.
     * When the prelaunch operations are not valid or the matching target is not changed, the original matching target is returned.
     *
     * @param {object} oMatchingTarget The matching target.
     * @param {string} sPrelaunchOperations The sap-prelaunch-operations.
     * @returns {Promise<object>} Resolves to an object of the matching target.
     * @since 1.69.0
     * @private
     */
    function executePrelaunchOperations (oMatchingTarget, sPrelaunchOperations) {
        if (!sPrelaunchOperations) {
            return Promise.resolve(oMatchingTarget);
        }

        const oStartupParameters = oMatchingTarget.mappedIntentParamsPlusSimpleDefaults;
        const aDefaultedParameterNames = oMatchingTarget.mappedDefaultedParamNames;
        const sSapXappState = oStartupParameters["sap-xapp-state"] && oStartupParameters["sap-xapp-state"][0];
        const aPrelaunchOperations = parseAndValidatePrelaunchOperations(sPrelaunchOperations);

        if (!aPrelaunchOperations || aPrelaunchOperations.length === 0) {
            return Promise.resolve(oMatchingTarget);
        }

        return _getAppState(sSapXappState).then((oAppState) => {
            const oAppStateData = oAppState ? oAppState.getData() : {};
            const oClonedStartupParameters = deepExtend({}, oStartupParameters);
            const aClonedDefaultedParameterNames = deepExtend([], aDefaultedParameterNames);
            let oSelectionVariant;

            if (oAppStateData.selectionVariant) {
                oSelectionVariant = new SelectionVariant(JSON.stringify(oAppStateData.selectionVariant));
            } else {
                oSelectionVariant = new SelectionVariant();
            }

            const oPrelaunchOperationsResult = _executePrelaunchOperations(
                oSelectionVariant, aPrelaunchOperations, oClonedStartupParameters, aClonedDefaultedParameterNames
            );

            return _updateMatchingTarget(
                oPrelaunchOperationsResult, oMatchingTarget, oSelectionVariant, oClonedStartupParameters, aClonedDefaultedParameterNames
            );
        });
    }

    return {
        executePrelaunchOperations: executePrelaunchOperations,
        parseAndValidateOperations: parseAndValidatePrelaunchOperations // used by FLPD
    };
});

// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/test/matchers/Matcher",
    "sap/ui/thirdparty/hasher",
    "sap/base/Log",
    "sap/base/util/deepEqual",
    "sap/ushell/utils/UrlParsing"
], (Matcher, hasher, Log, fnDeepEqual, URLParsing) => {
    "use strict";

    const oLogger = Log.getLogger("sap.ushell.opa.matchers.Hash");

    /**
     * Checks if the current hash matches with the provided hash.
     *
     * @param {object} oProperties The object with the hash to be checked. Example:
     * <pre>
     * new Hash({
     *     // The hash text is equal to the current hash.
     *     hash: "#Shell-home",
     * })
     * </pre>
     *
     * @private
     * @since 1.76.0
     */
    return Matcher.extend("sap.ushell.opa.matchers.hash", {
        metadata: {
            publicMethods: ["isMatching"],

            properties: {
                /**
                 * The hash to compare with the current hash.
                 */
                hash: {
                    type: "string"
                }
            }

        },

        /**
          * Checks if the current hasher.getHash() equals the hash provided in the properties.
          * Uses the URLParsing.parseShellHash() function to create hash objects out of the provided strings to prevent errors.
          *
          * @returns {boolean} true if the two hashes are matching. False if not,
          *
          * @since 1.76.0
          */
        isMatching: function () {
            const sExpextedHash = this.getHash();
            const aHashParts = URLParsing.parseShellHash(hasher.getHash());
            const aExpectedHashparts = URLParsing.parseShellHash(sExpextedHash);
            if (fnDeepEqual(aHashParts, aExpectedHashparts)) {
                return aHashParts;
            }
            oLogger.debug(`The hash ${sExpextedHash} is not matching`);
            return false;
        }
    });
});

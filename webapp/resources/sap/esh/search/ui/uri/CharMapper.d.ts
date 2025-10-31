declare module "sap/esh/search/ui/uri/CharMapper" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    export default class CharMapper {
        private charsToReplace;
        private charsToReplaceRegExp;
        private replaceWithChars;
        private replaceWithCharsRegExp;
        /**
         *
         * @param {string[]} charsToReplace - List of characters which will be encoded and decoded.
         * The same list of characters will make sure that the decoded string was mapped to the same
         * characters as the to be encoded string. This is needed for ui components which would interpret
         * encoded # or % characters as part of the url instead of an encoded search term.
         */
        constructor(charsToReplace: Array<string>);
        /**
         * @param {string} str - the string component which shall be scanned for chars to replace
         * @returns {string} - the same string without the replaced chars but with placeholders
         */
        map(str: string): string;
        /**
         * @param {string} str - the string which contains placeholders
         * @returns {string} - the the same string without placeholders but with the original characters
         */
        unmap(str: string): string;
    }
}
//# sourceMappingURL=CharMapper.d.ts.map
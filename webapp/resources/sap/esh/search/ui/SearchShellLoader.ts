/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import type ShellBarSearch from "@ui5/webcomponents-fiori/dist/ShellBarSearch";
import SearchShellHelper from "./SearchShellHelper";

export default class SearchShellLoader {
    constructor(opts: { getSearchField: () => Promise<ShellBarSearch> }) {
        this.initAsync(opts);
    }
    async initAsync(opts: { getSearchField: () => Promise<ShellBarSearch> }) {
        const searchField = await opts.getSearchField();
        SearchShellHelper.init(searchField);
    }
}

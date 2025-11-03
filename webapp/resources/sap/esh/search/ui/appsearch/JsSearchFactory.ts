/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import JsSearch, { JsSearchOptions } from "sap/esh/search/ui/appsearch/JsSearch";

const jsSearchFactory = {
    createJsSearch: function (options: JsSearchOptions): JsSearch {
        return new JsSearch(options);
    },
};

export default jsSearchFactory;

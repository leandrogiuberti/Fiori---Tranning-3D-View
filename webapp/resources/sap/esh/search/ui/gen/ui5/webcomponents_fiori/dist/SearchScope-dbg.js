/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/esh/search/ui/gen/ui5/webcomponents_fiori",
    "sap/esh/search/ui/thirdparty/SearchScope",
  ],
  function (WebComponentBaseClass) {
    "use strict"

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.esh.search.ui.gen.ui5.webcomponents_fiori.dist.SearchScope",
      {
        metadata: {
          namespace: "sap/esh/search/ui/gen/ui5/webcomponents_fiori",
          qualifiedNamespace: "sap.esh.search.ui.gen.ui5.webcomponents_fiori",
          tag: "ui5-search-scope-7c6aa654",
          interfaces: ["sap.esh.search.ui.gen.ui5.webcomponents_fiori.ISearchScope"],
          properties: {
            text: {
              type: "string",
              mapping: "property",
              defaultValue: "",
            },
            selected: {
              type: "boolean",
              mapping: "property",
              defaultValue: false,
            },
            width: {
              type: "sap.ui.core.CSSSize",
              mapping: "style",
            },
            height: {
              type: "sap.ui.core.CSSSize",
              mapping: "style",
            },
          },
          aggregations: {},
          associations: {},
          events: {},
          getters: [],
          methods: [],
          designtime:
            "sap/esh/search/ui/gen/ui5/webcomponents_fiori/designtime/SearchScope.designtime",
        },
      },
    )

    return WrapperClass
  },
)

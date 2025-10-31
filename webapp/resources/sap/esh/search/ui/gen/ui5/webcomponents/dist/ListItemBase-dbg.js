/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/esh/search/ui/gen/ui5/webcomponents",
    "sap/esh/search/ui/thirdparty/SearchItemShowMore",
  ],
  function (WebComponentBaseClass) {
    "use strict"

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.esh.search.ui.gen.ui5.webcomponents.dist.ListItemBase",
      {
        metadata: {
          namespace: "sap/esh/search/ui/gen/ui5/webcomponents",
          qualifiedNamespace: "sap.esh.search.ui.gen.ui5.webcomponents",
          interfaces: [],
          properties: {
            text: {
              type: "string",
              mapping: "textContent",
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
          designtime: "sap/esh/search/ui/gen/ui5/webcomponents/designtime/ListItemBase.designtime",
        },
      },
    )

    return WrapperClass
  },
)

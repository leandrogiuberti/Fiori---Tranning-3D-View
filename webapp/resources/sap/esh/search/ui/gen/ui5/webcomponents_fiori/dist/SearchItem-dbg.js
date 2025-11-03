/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/esh/search/ui/gen/ui5/webcomponents/dist/ListItemBase",
    "sap/esh/search/ui/gen/ui5/webcomponents_fiori",
    "sap/esh/search/ui/thirdparty/SearchItem",
  ],
  function (WebComponentBaseClass) {
    "use strict"

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.esh.search.ui.gen.ui5.webcomponents_fiori.dist.SearchItem",
      {
        metadata: {
          namespace: "sap/esh/search/ui/gen/ui5/webcomponents_fiori",
          qualifiedNamespace: "sap.esh.search.ui.gen.ui5.webcomponents_fiori",
          tag: "ui5-search-item-7c6aa654",
          interfaces: [],
          properties: {
            text: {
              type: "string",
              mapping: "property",
            },
            description: {
              type: "string",
              mapping: "property",
            },
            icon: {
              type: "string",
              mapping: "property",
            },
            selected: {
              type: "boolean",
              mapping: "property",
              defaultValue: false,
            },
            deletable: {
              type: "boolean",
              mapping: "property",
              defaultValue: false,
            },
            scopeName: {
              type: "string",
              mapping: "property",
            },
          },
          aggregations: {
            image: {
              type: "sap.ui.core.Control",
              multiple: true,
              slot: "image",
            },
          },
          associations: {},
          events: {
            delete: {
              allowPreventDefault: false,
              enableEventBubbling: false,
              parameters: {},
            },
          },
          getters: [],
          methods: [],
          designtime:
            "sap/esh/search/ui/gen/ui5/webcomponents_fiori/designtime/SearchItem.designtime",
        },
      },
    )

    return WrapperClass
  },
)

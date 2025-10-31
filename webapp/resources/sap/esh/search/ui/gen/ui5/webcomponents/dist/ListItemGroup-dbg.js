/*!
 * ${copyright}
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/esh/search/ui/gen/ui5/webcomponents",
    "sap/esh/search/ui/thirdparty/SearchItemGroup",
  ],
  function (WebComponentBaseClass) {
    "use strict"

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.esh.search.ui.gen.ui5.webcomponents.dist.ListItemGroup",
      {
        metadata: {
          namespace: "sap/esh/search/ui/gen/ui5/webcomponents",
          qualifiedNamespace: "sap.esh.search.ui.gen.ui5.webcomponents",
          tag: "ui5-li-group-7c6aa654",
          interfaces: [],
          properties: {
            headerText: {
              type: "string",
              mapping: "property",
            },
            headerAccessibleName: {
              type: "string",
              mapping: "property",
            },
            wrappingType: {
              type: "sap.esh.search.ui.gen.ui5.webcomponents.WrappingType",
              mapping: "property",
              defaultValue: "None",
            },
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
          aggregations: {
            items: {
              type: "sap.esh.search.ui.gen.ui5.webcomponents.dist.ListItemBase",
              multiple: true,
            },
            header: {
              type: "sap.esh.search.ui.gen.ui5.webcomponents.dist.ListItemBase",
              multiple: true,
              slot: "header",
            },
          },
          associations: {},
          events: {
            moveOver: {
              allowPreventDefault: true,
              enableEventBubbling: true,
              parameters: {
                source: {
                  type: "object",
                  types: [
                    {
                      dtsType: "object",
                      ui5Type: "object",
                    },
                  ],
                  dtsParamDescription:
                    "Contains information about the moved element under `element` property.",
                },
                destination: {
                  type: "object",
                  types: [
                    {
                      dtsType: "object",
                      ui5Type: "object",
                    },
                  ],
                  dtsParamDescription:
                    "Contains information about the destination of the moved element. Has `element` and `placement` properties.",
                },
              },
            },
            move: {
              allowPreventDefault: false,
              enableEventBubbling: true,
              parameters: {
                source: {
                  type: "object",
                  types: [
                    {
                      dtsType: "object",
                      ui5Type: "object",
                    },
                  ],
                  dtsParamDescription:
                    "Contains information about the moved element under `element` property.",
                },
                destination: {
                  type: "object",
                  types: [
                    {
                      dtsType: "object",
                      ui5Type: "object",
                    },
                  ],
                  dtsParamDescription:
                    "Contains information about the destination of the moved element. Has `element` and `placement` properties.",
                },
              },
            },
          },
          getters: [],
          methods: [],
          defaultAggregation: "items",
          designtime: "sap/esh/search/ui/gen/ui5/webcomponents/designtime/ListItemGroup.designtime",
        },
      },
    )

    return WrapperClass
  },
)

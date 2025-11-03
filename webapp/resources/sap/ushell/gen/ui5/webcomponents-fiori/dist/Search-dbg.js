/*!
 * Copyright (c) 2009-2025 SAP SE, All Rights Reserved
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/ushell/gen/ui5/webcomponents-fiori",
    "sap/ushell/thirdparty/ShellBarSearch",
  ],
  function (WebComponentBaseClass) {
    "use strict"

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.ushell.gen.ui5.webcomponents-fiori.dist.Search",
      {
        metadata: {
          namespace: "sap/ushell/gen/ui5/webcomponents-fiori",
          qualifiedNamespace: "sap.ushell.gen.ui5.webcomponents-fiori",
          tag: "ui5-search-16d3c820",
          interfaces: [],
          properties: {
            loading: {
              type: "boolean",
              mapping: "property",
              defaultValue: false,
            },
            noTypeahead: {
              type: "boolean",
              mapping: "property",
              defaultValue: false,
            },
            open: {
              type: "boolean",
              mapping: "property",
              defaultValue: false,
            },
            showClearIcon: {
              type: "boolean",
              mapping: "property",
              defaultValue: false,
            },
            value: {
              type: "string",
              mapping: "property",
              defaultValue: "",
            },
            placeholder: {
              type: "string",
              mapping: "property",
            },
            accessibleName: {
              type: "string",
              mapping: "property",
            },
            accessibleDescription: {
              type: "string",
              mapping: "property",
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
              type: "sap.ui.core.webc.WebComponent",
              multiple: true,
            },
            action: {
              type: "sap.ushell.gen.ui5.webcomponents.dist.Button",
              multiple: true,
              slot: "action",
            },
            illustration: {
              type: "sap.ushell.gen.ui5.webcomponents-fiori.dist.IllustratedMessage",
              multiple: true,
              slot: "illustration",
            },
            messageArea: {
              type: "sap.ushell.gen.ui5.webcomponents-fiori.dist.SearchMessageArea",
              multiple: true,
              slot: "messageArea",
            },
            scopes: {
              type: "sap.ushell.gen.ui5.webcomponents-fiori.ISearchScope",
              multiple: true,
              slot: "scopes",
            },
            filterButton: {
              type: "sap.ushell.gen.ui5.webcomponents.dist.Button",
              multiple: true,
              slot: "filterButton",
            },
          },
          associations: {},
          events: {
            onOpen: {
              allowPreventDefault: false,
              enableEventBubbling: false,
              parameters: {},
              mapping: "open",
            },
            close: {
              allowPreventDefault: false,
              enableEventBubbling: false,
              parameters: {},
            },
            input: {
              allowPreventDefault: false,
              enableEventBubbling: true,
              parameters: {},
            },
            scopeChange: {
              allowPreventDefault: false,
              enableEventBubbling: true,
              parameters: {
                scope: {
                  type: "sap.ui.core.Control",
                  types: [
                    {
                      origType: "HTMLElement",
                      multiple: false,
                      dedicatedTypes: [
                        {
                          dtsType: "Control",
                          packageName: "sap/ui/core/Control",
                          moduleType: "module:sap/ui/core/Control",
                          ui5Type: "sap.ui.core.Control",
                          isClass: true,
                        },
                      ],
                    },
                  ],
                  dtsParamDescription: "The newly selected scope",
                },
              },
            },
            search: {
              allowPreventDefault: true,
              enableEventBubbling: true,
              parameters: {},
            },
          },
          getters: [],
          methods: [],
          defaultAggregation: "items",
          designtime: "sap/ushell/gen/ui5/webcomponents-fiori/designtime/Search.designtime",
        },
      },
    )

    return WrapperClass
  },
)

/*!
 * Copyright (c) 2009-2025 SAP SE, All Rights Reserved
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/ushell/gen/ui5/webcomponents",
    "sap/ushell/thirdparty/Menu",
  ],
  function (WebComponentBaseClass) {
    "use strict"

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.ushell.gen.ui5.webcomponents.dist.Menu",
      {
        metadata: {
          namespace: "sap/ushell/gen/ui5/webcomponents",
          qualifiedNamespace: "sap.ushell.gen.ui5.webcomponents",
          tag: "ui5-menu-16d3c820",
          interfaces: [],
          properties: {
            headerText: {
              type: "string",
              mapping: "property",
            },
            open: {
              type: "boolean",
              mapping: "property",
              defaultValue: false,
            },
            horizontalAlign: {
              type: "sap.ushell.gen.ui5.webcomponents.PopoverHorizontalAlign",
              mapping: "property",
              defaultValue: "Start",
            },
            loading: {
              type: "boolean",
              mapping: "property",
              defaultValue: false,
            },
            loadingDelay: {
              type: "float",
              mapping: "property",
              defaultValue: 1000,
            },
            opener: {
              type: "sap.ui.core.Control",
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
              type: "sap.ushell.gen.ui5.webcomponents.IMenuItem",
              multiple: true,
            },
          },
          associations: {},
          events: {
            itemClick: {
              allowPreventDefault: true,
              enableEventBubbling: false,
              parameters: {
                item: {
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
                  dtsParamDescription: "The currently clicked menu item.",
                },
                text: {
                  type: "string",
                  types: [
                    {
                      origType: "string",
                      multiple: false,
                      dedicatedTypes: [
                        {
                          dtsType: "string",
                          ui5Type: "string",
                        },
                      ],
                    },
                  ],
                  dtsParamDescription:
                    "The text of the currently clicked menu item.",
                },
              },
            },
            beforeOpen: {
              allowPreventDefault: true,
              enableEventBubbling: true,
              parameters: {
                item: {
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
                  dtsParamDescription:
                    "The `ui5-menu-item` that triggers opening of the sub-menu or undefined when fired upon root menu opening.",
                },
              },
            },
            onOpen: {
              allowPreventDefault: false,
              enableEventBubbling: true,
              parameters: {},
              mapping: "open",
            },
            beforeClose: {
              allowPreventDefault: true,
              enableEventBubbling: true,
              parameters: {
                escPressed: {
                  type: "boolean",
                  types: [
                    {
                      origType: "boolean",
                      multiple: false,
                      dedicatedTypes: [
                        {
                          dtsType: "boolean",
                          ui5Type: "boolean",
                        },
                      ],
                    },
                  ],
                  dtsParamDescription:
                    "Indicates that `ESC` key has triggered the event.",
                },
              },
            },
            close: {
              allowPreventDefault: false,
              enableEventBubbling: false,
              parameters: {},
            },
          },
          getters: [],
          methods: [],
          defaultAggregation: "items",
          designtime: "sap/ushell/gen/ui5/webcomponents/designtime/Menu.designtime",
        },
      },
    )

    return WrapperClass
  },
)

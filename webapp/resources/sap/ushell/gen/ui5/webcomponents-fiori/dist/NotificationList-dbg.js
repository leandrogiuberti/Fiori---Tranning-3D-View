/*!
 * Copyright (c) 2009-2025 SAP SE, All Rights Reserved
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/ushell/gen/ui5/webcomponents-fiori",
    "sap/ushell/thirdparty/NotificationList",
  ],
  function (WebComponentBaseClass) {
    "use strict"

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.ushell.gen.ui5.webcomponents-fiori.dist.NotificationList",
      {
        metadata: {
          namespace: "sap/ushell/gen/ui5/webcomponents-fiori",
          qualifiedNamespace: "sap.ushell.gen.ui5.webcomponents-fiori",
          tag: "ui5-notification-list-16d3c820",
          interfaces: [],
          properties: {
            noDataText: {
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
              type: "sap.ushell.gen.ui5.webcomponents-fiori.dist.NotificationListItemBase",
              multiple: true,
            },
          },
          associations: {},
          events: {
            itemClick: {
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
                  dtsParamDescription: "The clicked item.",
                },
              },
            },
            itemClose: {
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
                  dtsParamDescription: "the item about to be closed.",
                },
              },
            },
            itemToggle: {
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
                  dtsParamDescription: "the toggled item.",
                },
              },
            },
          },
          getters: [],
          methods: [],
          defaultAggregation: "items",
          designtime:
            "sap/ushell/gen/ui5/webcomponents-fiori/designtime/NotificationList.designtime",
        },
      },
    )

    return WrapperClass
  },
)

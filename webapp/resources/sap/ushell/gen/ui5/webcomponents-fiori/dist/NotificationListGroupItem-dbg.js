/*!
 * Copyright (c) 2009-2025 SAP SE, All Rights Reserved
 */
sap.ui.define(
  [
    "sap/ushell/gen/ui5/webcomponents-fiori/dist/NotificationListItemBase",
    "sap/ushell/gen/ui5/webcomponents-fiori",
    "sap/ushell/thirdparty/NotificationListGroupItem",
  ],
  function (WebComponentBaseClass) {
    "use strict"

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.ushell.gen.ui5.webcomponents-fiori.dist.NotificationListGroupItem",
      {
        metadata: {
          namespace: "sap/ushell/gen/ui5/webcomponents-fiori",
          qualifiedNamespace: "sap.ushell.gen.ui5.webcomponents-fiori",
          tag: "ui5-li-notification-group-16d3c820",
          interfaces: [],
          properties: {
            collapsed: {
              type: "boolean",
              mapping: "property",
              defaultValue: false,
            },
            growing: {
              type: "sap.ushell.gen.ui5.webcomponents.NotificationListGrowingMode",
              mapping: "property",
              defaultValue: "None",
            },
            titleText: {
              type: "string",
              mapping: "property",
            },
            read: {
              type: "boolean",
              mapping: "property",
              defaultValue: false,
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
          },
          aggregations: {
            items: {
              type: "sap.ushell.gen.ui5.webcomponents-fiori.dist.NotificationListItem",
              multiple: true,
            },
          },
          associations: {},
          events: {
            toggle: {
              allowPreventDefault: false,
              enableEventBubbling: true,
              parameters: {},
            },
            loadMore: {
              allowPreventDefault: false,
              enableEventBubbling: true,
              parameters: {},
            },
          },
          getters: [],
          methods: [],
          defaultAggregation: "items",
          designtime:
            "sap/ushell/gen/ui5/webcomponents-fiori/designtime/NotificationListGroupItem.designtime",
        },
      },
    )

    return WrapperClass
  },
)

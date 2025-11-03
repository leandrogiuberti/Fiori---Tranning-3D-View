/*!
 * Copyright (c) 2009-2025 SAP SE, All Rights Reserved
 */
sap.ui.define(
  [
    "sap/ushell/gen/ui5/webcomponents/dist/ListItemBase",
    "sap/ushell/gen/ui5/webcomponents-fiori",
    "sap/ushell/thirdparty/NotificationListItem",
  ],
  function (WebComponentBaseClass) {
    "use strict"

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.ushell.gen.ui5.webcomponents-fiori.dist.NotificationListItemBase",
      {
        metadata: {
          namespace: "sap/ushell/gen/ui5/webcomponents-fiori",
          qualifiedNamespace: "sap.ushell.gen.ui5.webcomponents-fiori",
          interfaces: [],
          properties: {
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
          aggregations: {},
          associations: {},
          events: {},
          getters: [],
          methods: [],
          designtime:
            "sap/ushell/gen/ui5/webcomponents-fiori/designtime/NotificationListItemBase.designtime",
        },
      },
    )

    return WrapperClass
  },
)

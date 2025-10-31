/*!
 * Copyright (c) 2009-2025 SAP SE, All Rights Reserved
 */
sap.ui.define(
  [
    "sap/ushell/gen/ui5/webcomponents/dist/MenuItem",
    "sap/ushell/gen/ui5/webcomponents-fiori",
    "sap/ushell/thirdparty/UserMenuItem",
  ],
  function (WebComponentBaseClass) {
    "use strict"

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.ushell.gen.ui5.webcomponents-fiori.dist.UserMenuItem",
      {
        metadata: {
          namespace: "sap/ushell/gen/ui5/webcomponents-fiori",
          qualifiedNamespace: "sap.ushell.gen.ui5.webcomponents-fiori",
          tag: "ui5-user-menu-item-16d3c820",
          interfaces: [],
          properties: {},
          aggregations: {
            items: {
              type: "sap.ushell.gen.ui5.webcomponents-fiori.dist.UserMenuItem",
              multiple: true,
            },
          },
          associations: {},
          events: {},
          getters: [],
          methods: [],
          defaultAggregation: "items",
          designtime:
            "sap/ushell/gen/ui5/webcomponents-fiori/designtime/UserMenuItem.designtime",
        },
      },
    )

    return WrapperClass
  },
)

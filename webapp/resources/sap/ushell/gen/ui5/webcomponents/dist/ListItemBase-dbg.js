/*!
 * Copyright (c) 2009-2025 SAP SE, All Rights Reserved
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/ushell/gen/ui5/webcomponents",
    "sap/ushell/thirdparty/SearchItem",
  ],
  function (WebComponentBaseClass) {
    "use strict"

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.ushell.gen.ui5.webcomponents.dist.ListItemBase",
      {
        metadata: {
          namespace: "sap/ushell/gen/ui5/webcomponents",
          qualifiedNamespace: "sap.ushell.gen.ui5.webcomponents",
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
          designtime: "sap/ushell/gen/ui5/webcomponents/designtime/ListItemBase.designtime",
        },
      },
    )

    return WrapperClass
  },
)

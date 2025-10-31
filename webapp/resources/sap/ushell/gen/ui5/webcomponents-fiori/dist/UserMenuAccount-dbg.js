/*!
 * Copyright (c) 2009-2025 SAP SE, All Rights Reserved
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/ushell/gen/ui5/webcomponents-fiori",
    "sap/ushell/thirdparty/UserMenuAccount",
  ],
  function (WebComponentBaseClass) {
    "use strict"

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.ushell.gen.ui5.webcomponents-fiori.dist.UserMenuAccount",
      {
        metadata: {
          namespace: "sap/ushell/gen/ui5/webcomponents-fiori",
          qualifiedNamespace: "sap.ushell.gen.ui5.webcomponents-fiori",
          tag: "ui5-user-menu-account-16d3c820",
          interfaces: [],
          properties: {
            avatarSrc: {
              type: "string",
              mapping: "property",
              defaultValue: "",
            },
            avatarInitials: {
              type: "string",
              mapping: "property",
            },
            titleText: {
              type: "string",
              mapping: "property",
              defaultValue: "",
            },
            subtitleText: {
              type: "string",
              mapping: "property",
              defaultValue: "",
            },
            description: {
              type: "string",
              mapping: "property",
              defaultValue: "",
            },
            selected: {
              type: "boolean",
              mapping: "property",
              defaultValue: false,
            },
            loading: {
              type: "boolean",
              mapping: "property",
              defaultValue: false,
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
          aggregations: {},
          associations: {},
          events: {},
          getters: [],
          methods: [],
          designtime:
            "sap/ushell/gen/ui5/webcomponents-fiori/designtime/UserMenuAccount.designtime",
        },
      },
    )

    return WrapperClass
  },
)

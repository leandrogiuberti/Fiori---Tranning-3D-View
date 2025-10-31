/*!
 * Copyright (c) 2009-2025 SAP SE, All Rights Reserved
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/ushell/gen/ui5/webcomponents-fiori",
    "sap/ushell/thirdparty/ShellBarBranding",
  ],
  function (WebComponentBaseClass) {
    "use strict"

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.ushell.gen.ui5.webcomponents-fiori.dist.ShellBarBranding",
      {
        metadata: {
          namespace: "sap/ushell/gen/ui5/webcomponents-fiori",
          qualifiedNamespace: "sap.ushell.gen.ui5.webcomponents-fiori",
          tag: "ui5-shellbar-branding-16d3c820",
          interfaces: ["sap.m.IBar", "sap.tnt.IToolHeader"],
          properties: {
            href: {
              type: "string",
              mapping: "property",
            },
            target: {
              type: "string",
              mapping: "property",
            },
            accessibleName: {
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
            content: {
              type: "sap.ui.core.Control",
              multiple: true,
            },
            logo: {
              type: "sap.ui.core.Control",
              multiple: true,
              slot: "logo",
            },
          },
          associations: {},
          events: {
            click: {
              allowPreventDefault: false,
              enableEventBubbling: true,
              parameters: {},
            },
          },
          getters: [],
          methods: [],
          defaultAggregation: "content",
          designtime:
            "sap/ushell/gen/ui5/webcomponents-fiori/designtime/ShellBarBranding.designtime",
        },
      },
    )

    return WrapperClass
  },
)

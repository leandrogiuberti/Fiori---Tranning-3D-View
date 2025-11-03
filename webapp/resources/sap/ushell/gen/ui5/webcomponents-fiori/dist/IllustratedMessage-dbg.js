/*!
 * Copyright (c) 2009-2025 SAP SE, All Rights Reserved
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/ushell/gen/ui5/webcomponents-fiori",
    "sap/ushell/thirdparty/IllustratedMessage",
  ],
  function (WebComponentBaseClass) {
    "use strict"

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.ushell.gen.ui5.webcomponents-fiori.dist.IllustratedMessage",
      {
        metadata: {
          namespace: "sap/ushell/gen/ui5/webcomponents-fiori",
          qualifiedNamespace: "sap.ushell.gen.ui5.webcomponents-fiori",
          tag: "ui5-illustrated-message-16d3c820",
          interfaces: [],
          properties: {
            name: {
              type: "string",
              mapping: "property",
              defaultValue: "BeforeSearch",
            },
            design: {
              type: "sap.ushell.gen.ui5.webcomponents-fiori.IllustrationMessageDesign",
              mapping: "property",
              defaultValue: "Auto",
            },
            subtitleText: {
              type: "string",
              mapping: "property",
            },
            titleText: {
              type: "string",
              mapping: "property",
            },
            decorative: {
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
          aggregations: {
            title: {
              type: "sap.ui.core.Control",
              multiple: true,
              slot: "title",
            },
            subtitle: {
              type: "sap.ui.core.Control",
              multiple: true,
              slot: "subtitle",
            },
            actions: {
              type: "sap.ushell.gen.ui5.webcomponents.IButton",
              multiple: true,
            },
          },
          associations: {
            ariaLabelledBy: {
              type: "sap.ui.core.Control",
              multiple: true,
              mapping: {
                type: "property",
                to: "accessibleNameRef",
                formatter: "_getAriaLabelledByForRendering",
              },
            },
          },
          events: {},
          getters: [],
          methods: [],
          defaultAggregation: "actions",
          designtime:
            "sap/ushell/gen/ui5/webcomponents-fiori/designtime/IllustratedMessage.designtime",
        },
      },
    )

    return WrapperClass
  },
)

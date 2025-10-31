/*!
 * Copyright (c) 2009-2025 SAP SE, All Rights Reserved
 */
sap.ui.define(
  [
    "sap/ui/core/webc/WebComponent",
    "sap/ushell/gen/ui5/webcomponents-fiori",
    "sap/ushell/thirdparty/UserMenu",
  ],
  function (WebComponentBaseClass) {
    "use strict"

    const WrapperClass = WebComponentBaseClass.extend(
      "sap.ushell.gen.ui5.webcomponents-fiori.dist.UserMenu",
      {
        metadata: {
          namespace: "sap/ushell/gen/ui5/webcomponents-fiori",
          qualifiedNamespace: "sap.ushell.gen.ui5.webcomponents-fiori",
          tag: "ui5-user-menu-16d3c820",
          interfaces: [],
          properties: {
            open: {
              type: "boolean",
              mapping: "property",
              defaultValue: false,
            },
            opener: {
              type: "sap.ui.core.Control",
              mapping: "property",
            },
            showManageAccount: {
              type: "boolean",
              mapping: "property",
              defaultValue: false,
            },
            showOtherAccounts: {
              type: "boolean",
              mapping: "property",
              defaultValue: false,
            },
            showEditAccounts: {
              type: "boolean",
              mapping: "property",
              defaultValue: false,
            },
            showEditButton: {
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
            menuItems: {
              type: "sap.ushell.gen.ui5.webcomponents-fiori.dist.UserMenuItem",
              multiple: true,
            },
            accounts: {
              type: "sap.ushell.gen.ui5.webcomponents-fiori.dist.UserMenuAccount",
              multiple: true,
              slot: "accounts",
            },
          },
          associations: {},
          events: {
            avatarClick: {
              allowPreventDefault: false,
              enableEventBubbling: false,
              parameters: {},
            },
            manageAccountClick: {
              allowPreventDefault: false,
              enableEventBubbling: false,
              parameters: {},
            },
            editAccountsClick: {
              allowPreventDefault: false,
              enableEventBubbling: false,
              parameters: {},
            },
            changeAccount: {
              allowPreventDefault: true,
              enableEventBubbling: false,
              parameters: {
                prevSelectedAccount: {
                  type: "sap.ushell.gen.ui5.webcomponents-fiori.dist.UserMenuAccount",
                  types: [
                    {
                      origType: "UserMenuAccount",
                      multiple: false,
                      dedicatedTypes: [
                        {
                          dtsType: "UserMenuAccount",
                          ui5Type:
                            "sap.ushell.gen.ui5.webcomponents-fiori.dist.UserMenuAccount",
                          moduleType:
                            "module:@ui5/webcomponents-fiori/dist/UserMenuAccount",
                          packageName:
                            "sap/ushell/gen/ui5/webcomponents-fiori/dist/UserMenuAccount",
                          isClass: true,
                        },
                      ],
                    },
                  ],
                  dtsParamDescription: "The previously selected account.",
                },
                selectedAccount: {
                  type: "sap.ushell.gen.ui5.webcomponents-fiori.dist.UserMenuAccount",
                  types: [
                    {
                      origType: "UserMenuAccount",
                      multiple: false,
                      dedicatedTypes: [
                        {
                          dtsType: "UserMenuAccount",
                          ui5Type:
                            "sap.ushell.gen.ui5.webcomponents-fiori.dist.UserMenuAccount",
                          moduleType:
                            "module:@ui5/webcomponents-fiori/dist/UserMenuAccount",
                          packageName:
                            "sap/ushell/gen/ui5/webcomponents-fiori/dist/UserMenuAccount",
                          isClass: true,
                        },
                      ],
                    },
                  ],
                  dtsParamDescription: "The selected account.",
                },
              },
            },
            itemClick: {
              allowPreventDefault: true,
              enableEventBubbling: false,
              parameters: {
                item: {
                  type: "sap.ushell.gen.ui5.webcomponents-fiori.dist.UserMenuItem",
                  types: [
                    {
                      origType: "UserMenuItem",
                      multiple: false,
                      dedicatedTypes: [
                        {
                          dtsType: "UserMenuItem",
                          ui5Type: "sap.ushell.gen.ui5.webcomponents-fiori.dist.UserMenuItem",
                          moduleType:
                            "module:@ui5/webcomponents-fiori/dist/UserMenuItem",
                          packageName:
                            "sap/ushell/gen/ui5/webcomponents-fiori/dist/UserMenuItem",
                          isClass: true,
                        },
                      ],
                    },
                  ],
                  dtsParamDescription: "The selected `user menu item`.",
                },
              },
            },
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
            signOutClick: {
              allowPreventDefault: true,
              enableEventBubbling: false,
              parameters: {},
            },
          },
          getters: [],
          methods: [],
          defaultAggregation: "menuItems",
          designtime: "sap/ushell/gen/ui5/webcomponents-fiori/designtime/UserMenu.designtime",
        },
      },
    )

    return WrapperClass
  },
)

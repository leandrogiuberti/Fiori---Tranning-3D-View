// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/m/Button",
    "./ShellFloatingActionRenderer",
    "sap/ushell/library" // css style dependency
], (
    jQuery,
    Button,
    ShellFloatingActionRenderer
) => {
    "use strict";

    /**
     * @alias sap.ushell.ui.shell.ShellFloatingAction
     * @class
     *
     * @extends sap.m.Button
     *
     * @private
     */
    const ShellFloatingAction = Button.extend("sap.ushell.ui.shell.ShellFloatingAction", /** @lends sap.ushell.ui.shell.ShellFloatingAction.prototype */ {
        metadata: {
            library: "sap.ushell"
        },
        renderer: ShellFloatingActionRenderer
    });

    ShellFloatingAction.prototype.init = function () {
        this.addStyleClass("sapUshellShellFloatingAction");
        // call the parent sap.m.Button init method
        if (Button.prototype.init) {
            Button.prototype.init.apply(this, arguments);
        }
    };

    ShellFloatingAction.prototype.exit = function () {
        Button.prototype.exit.apply(this, arguments);
    };

    ShellFloatingAction.prototype.onAfterRendering = function () {
        if (this.data("transformY")) {
            this.removeStyleClass("sapUshellShellFloatingActionTransition");
            jQuery(this.getDomRef()).css("transform", `translateY(${this.data("transformY")})`);
        } else {
            this.addStyleClass("sapUshellShellFloatingActionTransition");
        }
    };

    return ShellFloatingAction;
});

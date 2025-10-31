// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * Initialization Code and shared classes of library sap.ushell.ui.shell.ContentRenderer
 */
sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/core/RenderManager"
], (BaseObject, RenderManager) => {
    "use strict";

    const ContentRenderer = BaseObject.extend("sap.ushell.ui.shell.ContentRenderer", {
        constructor: function (oControl, sContentContainerId, oContent, fAfterRenderCallback) {
            BaseObject.apply(this);
            this._id = sContentContainerId;
            this._cntnt = oContent;
            this._ctrl = oControl;
            this._rm = new RenderManager().getInterface();
            this._cb = fAfterRenderCallback || function () { };
        },

        destroy: function () {
            this._rm.destroy();
            delete this._rm;
            delete this._id;
            delete this._cntnt;
            delete this._cb;
            delete this._ctrl;
            if (this._rerenderTimer) {
                clearTimeout(this._rerenderTimer);
                delete this._rerenderTimer;
            }
            BaseObject.prototype.destroy.apply(this, arguments);
        },

        render: function () {
            if (!this._rm) {
                return;
            }

            if (this._rerenderTimer) {
                clearTimeout(this._rerenderTimer);
            }

            this._rerenderTimer = setTimeout(() => {
                const $content = document.getElementById(this._id);
                const doRender = $content !== null;

                if (doRender) {
                    if (typeof (this._cntnt) === "string") {
                        const aContent = this._ctrl.getAggregation(this._cntnt, []);
                        for (let i = 0; i < aContent.length; i++) {
                            this._rm.renderControl(aContent[i]);
                        }
                    } else {
                        this._cntnt(this._rm);
                    }
                    this._rm.flush($content);
                }

                this._cb(doRender);
            }, 0);
        }
    });

    return ContentRenderer;
});

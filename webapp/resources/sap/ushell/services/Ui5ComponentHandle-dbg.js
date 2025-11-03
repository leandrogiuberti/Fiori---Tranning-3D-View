// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define(() => {
    "use strict";

    // application context
    function Ui5ComponentHandle (oComponent) {
        this._oComponent = oComponent;
    }

    Ui5ComponentHandle.onBeforeApplicationInstanceCreated = function (/* oComponentConfig */) {
        sap.ui.require([
            "sap/ushell/Fiori20AdapterTest"
        ], () => { });
    };

    Ui5ComponentHandle.prototype.getInstance = function () {
        return this._oComponent;
    };

    Ui5ComponentHandle.prototype.getMetadata = function () {
        return this._oComponent.getMetadata();
    };

    Ui5ComponentHandle.prototype.getComponentName = function () {
        return this._oComponent.getMetadata().getComponentName();
    };

    Ui5ComponentHandle.prototype.destroy = function () {
        if (this._oComponent && !this._oComponent.isDestroyed()) {
            return this._oComponent.destroy();
        }
    };

    return Ui5ComponentHandle;
});

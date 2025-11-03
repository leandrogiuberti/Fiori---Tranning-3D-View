sap.ui.define([
    "sap/ovp/app/Component",
    "sap/ui/fl/FakeLrepConnectorLocalStorage",
    "sap/ovp/app/OVPUtils"
], function (
    OvpAppComponent,
    FakeLrepConnectorLocalStorage,
    OVPUtils
) {
    "use strict";

    return OvpAppComponent.extend("saphanaoverview.Component", {
        metadata: {
            manifest: OVPUtils.getManifest("saphanaoverview")
        },

        /**
         * FakeLrep - local storage
         */
        _initCompositeSupport: function () {
            FakeLrepConnectorLocalStorage.enableFakeConnector();
            OvpAppComponent.prototype._initCompositeSupport.apply(this, arguments);
        }
    });
});

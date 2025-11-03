sap.ui.define([
    "sap/ovp/app/Component",
    "sap/ovp/app/OVPUtils"
], function (
    OvpAppComponent,
    OVPUtils
) {
    "use strict";

    return OvpAppComponent.extend("procurement.Component", {
        metadata: {
            manifest: OVPUtils.getManifest("procurement")
        },

        /**
         * FakeLrep - local storage
         */
        _initCompositeSupport: function () {
            OvpAppComponent.prototype._initCompositeSupport.apply(this, arguments);
        }
    });
});
sap.ui.define([
    "sap/ovp/app/Component",
    "sap/ovp/app/OVPUtils"
], function (
    OvpAppComponent,
    OVPUtils
) {
    "use strict";
    return OvpAppComponent.extend("sales.Component", {
        metadata: {
            manifest: OVPUtils.getManifest("sales")
        },

        /**
         * FakeLrep - local storage
         */
         _initCompositeSupport: function () {
            OvpAppComponent.prototype._initCompositeSupport.apply(this, arguments);
        }
    });
}, true);

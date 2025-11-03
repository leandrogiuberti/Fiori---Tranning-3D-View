sap.ui.define(["sap/ovp/app/Component","sap/ovp/app/OVPUtils"], (appComponent,OVPUtils) =>
    appComponent.extend("bookshop.Component", {
        metadata: {
            manifest: OVPUtils.getManifest("bookshop")
        }
    })
);
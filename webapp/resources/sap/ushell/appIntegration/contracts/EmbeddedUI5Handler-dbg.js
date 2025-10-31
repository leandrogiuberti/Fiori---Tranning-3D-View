// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview handle all the resources for the different applications.
 * @version 1.141.1
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/Deferred",
    "sap/ui/core/EventBus",
    "sap/ushell/Container",
    "sap/ushell/UI5ComponentType",
    "sap/ushell/utils",
    "sap/ushell/utils/UrlParsing"
], (
    Log,
    Deferred,
    EventBus,
    Container,
    UI5ComponentType,
    ushellUtils,
    UrlParsing
) => {
    "use strict";

    class EmbeddedUI5Handler {
        async createApp (oApplicationContainer, oResolvedHashFragment, oParsedShellHash) {
            const sTargetUi5ComponentName = oResolvedHashFragment?.ui5ComponentName;
            // todo: [FLPCOREANDUX-10024] check comment below
            /**
             * Instead the AppLifeCycle should call this module with all UI5 applications
             * to stop the router
             *
             * With this we could get rid of this logic in the container
             */
            /*
             * normal application:
             * fire the _prior.newUI5ComponentInstantion event before creating the new component instance, so that
             * the ApplicationContainer can stop the router of the current app (avoid inner-app hash change notifications)
             * NOTE: this dependency to the ApplicationContainer is not nice, but we need a fast fix now; we should refactor
             * the ApplicationContainer code, because most of the logic has to be done by the shell controller;
             * maybe rather introduce a utility module
             */
            EventBus.getInstance().publish("ApplicationContainer", "_prior.newUI5ComponentInstantion",
                { name: sTargetUi5ComponentName }
            );

            // load ui5 component via service; core-ext-light will be loaded as part of the asyncHints
            const Ui5ComponentLoader = await Container.getServiceAsync("Ui5ComponentLoader");

            const sBasicHash = UrlParsing.getBasicHash(oResolvedHashFragment.sFixedShellHash);
            oResolvedHashFragment.ui5ComponentId = `application-${sBasicHash}-component`;
            oApplicationContainer.setUi5ComponentId(oResolvedHashFragment.ui5ComponentId);

            await Ui5ComponentLoader.createComponent(
                oResolvedHashFragment,
                oParsedShellHash, // todo: [FLPCOREANDUX-10024] remove this and similar usages
                [],
                UI5ComponentType.Application
            );
        }

        async getNavigationRedirectHash (oApplicationContainer) {
            const oComponentHandle = oApplicationContainer.getComponentHandle();
            if (!oComponentHandle) {
                return;
            }

            const oComponent = oComponentHandle.getInstance({});
            if (!oComponent) {
                return;
            }

            if (typeof oComponent.navigationRedirect !== "function") {
                return;
            }

            // oComponent refers to a trampoline application
            const oNavRedirectThenable = oComponent.navigationRedirect();
            if (!oNavRedirectThenable || typeof oNavRedirectThenable.then !== "function") {
                return;
            }

            try {
                const sHash = await ushellUtils.promisify(oNavRedirectThenable);
                return sHash;
            } catch {
                // fail silently
            }
        }

        async storeApp (oApplicationContainer) {
            const oResolvedHashFragment = oApplicationContainer.getCurrentAppTargetResolution();
            EventBus.getInstance().publish("sap.ushell", "appKeepAliveDeactivate", oResolvedHashFragment);

            const oComponentHandle = oApplicationContainer.getComponentHandle();
            const oComponent = oComponentHandle.getInstance();

            // check first whether this app requires activate/deactivate
            if (oComponent.isKeepAliveSupported?.()) {
                oComponent.deactivate();
                return;
            }

            // fallback to suspend/restore
            if (typeof oComponent.suspend === "function") {
                oComponent.suspend();
            }

            const oRouter = oComponent.getRouter?.();
            if (oRouter && typeof oRouter.stop === "function") {
                oRouter.stop();
            }
        }

        async restoreAppAfterNavigate (oApplicationContainer, oStorageEntry) {
            const oResolvedHashFragment = oApplicationContainer.getCurrentAppTargetResolution();
            EventBus.getInstance().publish("sap.ushell", "appKeepAliveActivate", oResolvedHashFragment);

            const oComponentHandle = oApplicationContainer.getComponentHandle();
            const oComponent = oComponentHandle.getInstance();

            // check first whether this app requires activate/deactivate (more modern way)
            if (oComponent.isKeepAliveSupported?.()) {
                oComponent.activate();
                return;
            }

            // fallback to suspend/restore (old way)
            if (typeof oComponent.restore === "function") {
                oComponent.restore();
            }

            const oRouter = oComponent.getRouter?.();
            if (oRouter && typeof oRouter.initialize === "function") {
                // default is false, which just continues the router assuming the current hash did not change
                // can be overridden by FEv2 see AppLifeCycle.getCurrentApplication().disableKeepAliveAppRouterRetrigger()
                // this fully restarts the router and re-triggers the matching for the current hash
                const bIgnoreInitialHash = !oStorageEntry.useLegacyRestoreFlow;
                oRouter.initialize(bIgnoreInitialHash);
            }
        }
    }

    return new EmbeddedUI5Handler();
});

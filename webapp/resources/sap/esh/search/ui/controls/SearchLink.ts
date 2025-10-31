/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import * as SearchHelper from "sap/esh/search/ui/SearchHelper";
import Icon from "sap/ui/core/Icon";
import { URI as sapURI } from "sap/ui/core/library";
import Link from "sap/m/Link";
import { NavigationTarget } from "../sinaNexTS/sina/NavigationTarget";
import { MetadataOptions, PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $ControlSettings } from "sap/ui/core/Control";
import { initialValueUnicode } from "../uiConstants";
import { NavigationTarget as NavigationTargetApi } from "../ResultSetApi"; // reduced sina-NavigationTarget ()
import type SearchModel from "../SearchModel";

export interface $SearchLinkSettings extends $ControlSettings {
    navigationTarget: NavigationTarget | PropertyBindingInfo | NavigationTargetApi;
    icon?: Icon;
    href?: string;
    enabled?: boolean;
    target?: string;
    text?: string | PropertyBindingInfo;
    wrapping?: boolean;
}

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchLink extends Link {
    static readonly metadata: MetadataOptions = {
        properties: {
            navigationTarget: {
                type: "object",
                group: "Data",
            },
        },
    };

    private _pressHandlerAttached = false;

    constructor(sId?: string, settings?) {
        super(sId, settings);
        this.addStyleClass("sapUshellSearchLink");
    }

    pressHandlerSearchLink(oEvent): void {
        const navTarget = this.getNavigationTarget();
        const model = this.getModel() as SearchModel;
        if (model && model.config?.clearObjectSelectionOnSearchLinkClick) {
            (this.getModel() as SearchModel).resetKeyStore();
        }

        if (navTarget.targetUrl) {
            // 1) navigation target has target url
            // - navigation itself is performed by clicking on <a> tag
            // - performNavigation is just called for tracking
            navTarget.performNavigation({
                trackingOnly: true,
                event: oEvent,
            });
        } else {
            // 2) no target url instead there is a js target function
            // performNavigation does tracking + navigation (window.open...)
            oEvent.preventDefault(); // really necessary?
            navTarget.performNavigation({
                event: oEvent,
            });
        }
        // oEvent.preventDefault does work for
        // -desktop
        // -mobile in case targetUrl=empty
        // oEvent.preventDefault does not work for mobile in case targetUrl is filled
        // reason: for mobile there is a UI5 async event simulation so preventDefault does not work
        // for sap.m.Link this a special logic which makes preventDefault working for mobile in case
        // targetUrl=empty (href='#')
    }

    setNavigationTarget(navigationTarget: NavigationTarget): this {
        this.setProperty("navigationTarget", navigationTarget);

        // calculate enabled
        const text = this.getText();
        if (
            ((typeof navigationTarget?.targetUrl !== "string" || navigationTarget?.targetUrl?.length === 0) &&
                typeof navigationTarget?.targetFunction !== "function") ||
            !(typeof text === "string" && text !== initialValueUnicode) // dash
        ) {
            this.setProperty("enabled", false);
        } else {
            this.setProperty("enabled", true);
        }

        // set href
        const navigationTargetHref = navigationTarget?.targetUrl;
        if (typeof navigationTargetHref === "string" && navigationTargetHref?.length > 0) {
            this.setProperty("href", navigationTargetHref);
        } else {
            this.setProperty("href", "");
        }

        // set target
        const navigationTargetTarget = navigationTarget?.target;
        if (typeof navigationTargetTarget === "string" && navigationTargetTarget?.length > 0) {
            this.setProperty("target", navigationTargetTarget);
        } else {
            this.setProperty("target", "_self");
        }

        // set icon
        const navigationTargetIcon = navigationTarget?.icon;
        if (!this.getIcon() && typeof navigationTargetIcon === "string" && navigationTargetIcon?.length > 0) {
            this.setIcon(navigationTargetIcon);
        }

        // set tooltip
        const navigationTargetTooltip = navigationTarget?.tooltip;
        if (
            !this.getTooltip() &&
            typeof navigationTargetTooltip === "string" &&
            navigationTargetTooltip?.length > 0
        ) {
            this.setTooltip(navigationTargetTooltip);
        }

        return this;
    }

    setText(sText?: string): this {
        this.setProperty("text", sText);
        const navigationTarget = this.getNavigationTarget();
        if (!(navigationTarget instanceof NavigationTarget)) {
            return this;
        }
        if (
            ((typeof navigationTarget?.targetUrl !== "string" || navigationTarget?.targetUrl?.length === 0) &&
                typeof navigationTarget?.targetFunction !== "function") ||
            !(typeof sText === "string" && sText !== initialValueUnicode) // dash
        ) {
            this.setProperty("enabled", false);
        }
        return this;
    }

    getNavigationTarget(): NavigationTarget {
        return this.getProperty("navigationTarget");
    }

    setEnabled(bEnabled?: boolean): this {
        if (bEnabled === true) {
            const navigationTarget = this.getNavigationTarget();
            const text = this.getText();
            if (
                (navigationTarget instanceof NavigationTarget &&
                    (typeof navigationTarget.targetUrl !== "string" ||
                        navigationTarget.targetUrl?.length === 0) &&
                    typeof navigationTarget.targetFunction !== "function") ||
                !(typeof text === "string" && text !== initialValueUnicode) // dash
            ) {
                this.setProperty("enabled", false);
                return this;
            }
        }
        this.setProperty("enabled", bEnabled);
        return this;
    }

    setIcon(sIcon?: sapURI): this {
        if (!this.getIcon() && typeof sIcon === "string" && sIcon.startsWith("sap-icon://")) {
            super.setIcon(sIcon);
        }
        return this;
    }

    onAfterRendering(oEvent): void {
        super.onAfterRendering(oEvent);
        if (this.isDestroyed()) {
            return;
        }
        if (!this._pressHandlerAttached) {
            this.attachPress(this.pressHandlerSearchLink, this);
            this._pressHandlerAttached = true;
        }

        const linkDomRef = this.getDomRef() as HTMLElement;
        // recover bold tag with the help of text() in a safe way
        SearchHelper.boldTagUnescaper(linkDomRef);
        SearchHelper.calculateTooltipForwordEllipsis(linkDomRef);
    }

    _handlePress(oEvent) {
        // in case of highlighting the target property of the event is a <b> element inside the Link.
        // therefore setting it manually to Links DomRef / parentElement of the target.
        if (oEvent.target.localName === "b") {
            const oTarget = this.getDomRef() ? this.getDomRef() : oEvent.target.parentElement;
            oEvent.target = oTarget;
        }
        // eslint-disable-next-line prefer-rest-params
        Link.prototype["_handlePress"].apply(this, arguments);
    }

    // overwrite necessary because in sap.m.Link: Link.prototype.onsapenter = Link.prototype._handlePress;
    onsapenter(oEvent) {
        this._handlePress(oEvent);
    }

    // overwrite necessary because in sap.m.Link: Link.prototype.onsapenter = Link.prototype._handlePress;
    onclick(oEvent) {
        this._handlePress(oEvent);
    }

    static renderer = {
        apiVersion: 2,
    };
}

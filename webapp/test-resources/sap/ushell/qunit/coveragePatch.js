// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview This patch allows to correctly instrument ui5 resources for coverage in local test execution when iframes are used.
 * This patch observes the current DOM for iframes. Once it finds a iframe it applies the changes which are done in qunit-coverage-istanbul also within the iframe.
 * Additionally, the iframes DOM is also observed for further iframes. This happens recursively.
 *
 * Common use case: Test frame > FLP Frame > Appruntime Frame
 *
 * For instrumentation settings the test frame is used.
 *
 * Restriction:
 * This only works for same-origin iframes.
 */

(() => {
    "use strict";

    /* global QUnit */

    // wait for iframe to be loaded
    async function waitForIframe (oIframe) {
        return new Promise((resolve) => {
            const iInterval = setInterval(() => {
                try {
                    if (oIframe.contentWindow?.location.href !== "about:blank") {
                        resolve();
                        clearInterval(iInterval);
                    }
                } catch {
                    // might fail for sandboxed or cross-origin iframes
                    resolve();
                    clearInterval(iInterval);
                }
            });
        });
    }

    /*
     * ================
     * The following parts are copied from sap/ui/qunit/qunit-coverage-istanbul.js
     * It was modified to use the window object from the respective frame
     * Date of copy: 22.08.2025
     * SHA: af22453c75791da22ce2c727e1b0ba9c39d9c855
     * ChangeId: Iec687b94266378596e6240fb70f41c5cb2de15c8
     */

    function normalizeBackslashes (str) {
        return str.replace(/\\/g, "/");
    }

    function matchPatternAttribute (filename, pattern, oWindow) {
        if (typeof pattern === "string") {
            if (pattern.indexOf("[") === 0) {
                // treat as array
                const pattenArr = pattern.slice(1, pattern.length - 1).split(",");
                return pattenArr.some((elem) =>{
                    return matchPatternAttribute(filename, normalizeBackslashes(elem.slice(1, -1)), oWindow);
                });
            } else if (pattern.indexOf("//") === 0) {
                const ex = pattern.slice(2, pattern.lastIndexOf("/"));
                const mods = pattern.slice(pattern.lastIndexOf("/") + 1);
                const regex = new RegExp(ex, mods);
                return regex.test(filename);
            } else if (pattern.indexOf("#") === 0) {
                return oWindow[pattern.slice(1)](filename);
            }

            return filename.indexOf(normalizeBackslashes(pattern)) > -1;
        } else if (pattern instanceof Array) {
            return pattern.some((elem) =>{
                return matchPatternAttribute(filename, elem, oWindow);
            });
        } else if (pattern instanceof RegExp) {
            return pattern.test(filename);
        } else if (typeof pattern === "function") {
            return pattern.call(oWindow, filename);
        }
    }

    const oScript = document.querySelector("script[data-sap-ui-module='sap/ui/qunit/qunit-coverage-istanbul.js']");
    let filters;
    function getFilters () {
        let sFilterAttr; let sAntiFilterAttr;

        // Cache and only read once
        if (filters) {
            return filters;
        }

        if (oScript) {
            // Set custom client-side instrument filter (from script attributes)
            if (oScript.hasAttribute("data-sap-ui-cover-only")) {
                sFilterAttr = oScript.getAttribute("data-sap-ui-cover-only");
            }
            if (oScript.hasAttribute("data-sap-ui-cover-never")) {
                sAntiFilterAttr = oScript.getAttribute("data-sap-ui-cover-never");
            }
        }

        filters = { filter: sFilterAttr, antiFilter: sAntiFilterAttr };
        return filters;
    }

    function shouldBeInstrumented (sModuleName, oWindow) {
        const appliedFilters = getFilters();
        const sFilterAttr = appliedFilters.filter;
        const sAntiFilterAttr = appliedFilters.antiFilter;

        if (typeof sAntiFilterAttr !== "undefined" && matchPatternAttribute(sModuleName, sAntiFilterAttr, oWindow)) {
            // NEVER INSTRUMENT (excluded)
            return false;
        } else if (typeof sFilterAttr === "undefined" || matchPatternAttribute(sModuleName, sFilterAttr, oWindow)) {
            // INSTRUMENT (included)
            return true;
        }
        // DONT INSTRUMENT (not explicitly excluded / included)
        return false;
    }

    function appendUrlParameter (sUrl, oWindow) {
        const oUrl = new URL(sUrl, oWindow.document.baseURI);
        oUrl.searchParams.set("instrument", "true");
        return oUrl.toString();
    }

    function _patch (oWindow) {
        if (!oWindow) {
            return;
        }
        const fnSetAttributeOrig = oWindow.HTMLScriptElement.prototype.setAttribute;
        oWindow.HTMLScriptElement.prototype.setAttribute = function (sName, sValue) {
            if (sName === "data-sap-ui-module" && shouldBeInstrumented(sValue || "", oWindow)) {
                this.src = appendUrlParameter(this.src, oWindow);
            }
            fnSetAttributeOrig.apply(this, arguments);
        };

        const fnXhrOpenOrig = oWindow.XMLHttpRequest.prototype.open;
        oWindow.XMLHttpRequest.prototype.open = function (sMethod, sUrl) {
            if (
                oWindow.sap?.ui?.loader &&
                sUrl && sUrl.endsWith(".js") && shouldBeInstrumented(oWindow.sap.ui.loader._.guessResourceName(sUrl) || "", oWindow)
            ) {
                arguments[1] = appendUrlParameter(sUrl, oWindow);
            }
            fnXhrOpenOrig.apply(this, arguments);
        };
    }

    /*
     * Copy End
     * ================
     */

    function patch (oWindow) {
        if (!oWindow) {
            return;
        }
        const observer = new MutationObserver((mutations) => {
            // if iframe gets created observe it as well
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach(async (node) => {
                    if (node.tagName === "IFRAME") {
                        await waitForIframe(node);
                        // wait until we have the "real" iframe available

                        patch(node.contentWindow);
                    }
                });
            });
        });

        try {
            observer.observe(oWindow.document, {
                childList: true,
                subtree: true
            });
            _patch(oWindow);
        } catch (oError) {
            // might fail for sandboxed or cross-origin iframes
        }
    }

    if (QUnit.urlParams.coverage) {
        patch(window);
    }
})();

// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

// This module runs before bootstrap. Therefore we cannot require any dependencies.
sap.ui.define([
    // require after, runTest configuration is done
    "test-resources/sap/ushell/qunit/coveragePatch"
], () => {
    "use strict";

    function createTestDomRef (sDomRefId, sParentDomRef) {
        sDomRefId = sDomRefId || "qunit-canvas";
        sParentDomRef = sParentDomRef || "qunit-fixture";
        if (!document.getElementById(sDomRefId)) {
            const oRendererDomRef = document.createElement("div");
            oRendererDomRef.setAttribute("id", sDomRefId);
            const oRendererParentDomRef = document.getElementById(sParentDomRef);
            oRendererParentDomRef.appendChild(oRendererDomRef);
        }
    }
    function deleteTestDomRef (sParentDomRef) {
        sParentDomRef = sParentDomRef || "qunit-fixture";

        const oRendereDomRef = document.getElementById(sParentDomRef);

        if (oRendereDomRef) {
            if (oRendereDomRef.hasChildNodes()) {
                while (oRendereDomRef.firstChild) {
                    oRendereDomRef.removeChild(oRendereDomRef.firstChild);
                }
            }
        }
    }

    Object.assign(window.QUnit, {
        sap: {
            ushell: {
                createTestDomRef: createTestDomRef,
                deleteTestDomRef: deleteTestDomRef
            }
        }
    });
});

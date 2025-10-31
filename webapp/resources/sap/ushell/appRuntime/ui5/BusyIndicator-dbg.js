// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/* eslint-disable */
var apprtBIdiv;
document.addEventListener("DOMContentLoaded", function () {
    const oBootstrapScript = document.getElementById("sap-ui-bootstrap");
    if (!oBootstrapScript) { return; }

    const sBootstrapSrc = oBootstrapScript.src;
    if (!sBootstrapSrc) { return; }

    const sBootstrapRoot = sBootstrapSrc.split("/resources/")[0];

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `${sBootstrapRoot}/resources/sap/ushell/appRuntime/ui5/BusyIndicator.css`;
    document.head.appendChild(link);

    apprtBIdiv = document.createElement("div");
    apprtBIdiv.classList.add("apprtBIcenter");
    apprtBIdiv.appendChild(document.createElement("div"));
    apprtBIdiv.appendChild(document.createElement("div"));
    apprtBIdiv.appendChild(document.createElement("div"));
    document.body.appendChild(apprtBIdiv);
});

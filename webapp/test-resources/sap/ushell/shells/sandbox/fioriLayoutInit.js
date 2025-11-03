// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/renderer/ShellLayout"
], (
    ShellLayout
) => {
    "use strict";

    ShellLayout.applyLayout("canvas");

    // ABAP SystemInfo
    const sSystemInfoHtml = "<div id='systemInfo-shellArea'></div>";
    const oShellHeaderShellArea = document.getElementById(ShellLayout.ShellArea.ShellHeader);
    oShellHeaderShellArea.insertAdjacentHTML("beforebegin", sSystemInfoHtml);

    // HelpContent WebAssistant/ SAP Companion
    const sHelpContentHtml = "<div id='helpContent'></div>";
    const oHelpContentShellArea = document.getElementById(ShellLayout.ShellArea.HelpContent);
    oHelpContentShellArea.insertAdjacentHTML("afterbegin", sHelpContentHtml);
});

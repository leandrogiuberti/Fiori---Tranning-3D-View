/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  function openPopup() {
    const myWin = window.open("", "_blank", "popup,toolbar=no,width=800,height=800");
    if (myWin) {
      const ui5Url = sap.ui.require.toUrl("sap-ui-core.js");
      myWin.document.write(`<html>
			<head>
				<meta charset="utf-8">
				<title>FE Diagnostics</title>
				<script id="sap-ui-bootstrap"
					src="${ui5Url}"
					data-sap-ui-async="true"
					data-sap-ui-oninit="onInit"
					data-sap-ui-compatVersion="edge"
					data-sap-ui-libs="sap.ui.core"
					data-sap-ui-theme="sap_horizon">
				</script>

				<style>
					.sapUiSupportBody {
						margin: 0;
						font-family: var(--sapFontFamily);
					}
					.sapUiSupportBody .sapMITBContent {
						padding: 0;
					}
					.feRequestList {
						max-width: 500px;
						height: 100%;
						overflow: scroll;
					}
					.feRequestHBox {
						height: 100%;
					}
				</style>
				</head>
				<body class="sapUiSupportBody">
					<div id="sapUiSupportBody">

					</div>
				</body>
			</html>`);
      myWin.document.close();
      // @ts-ignore
      myWin.window.onInit = function () {
        // @ts-ignore
        const codeData = window.sap.ui.loader._.getModuleContent("sap/fe/tools/XMLSerializer.js");
        if (Array.isArray(codeData)) {
          // @ts-ignore
          myWin.sap.ui.define(codeData[0], codeData[1], codeData[2]);
        }
        // @ts-ignore
        const codeData2 = window.sap.ui.loader._.getModuleContent("sap/fe/tools/InfoSupportTool.js");
        if (Array.isArray(codeData2)) {
          // @ts-ignore
          myWin.sap.ui.define(codeData2[0], codeData2[1], codeData2[2]);
        }
        // @ts-ignore
        myWin.sap.ui.require(["sap/fe/tools/InfoSupportTool"], function (_InfoSupportTool) {});
      };
      window.onunload = function () {
        myWin.close();
      };
    }
  }
  _exports.openPopup = openPopup;
  return _exports;
}, false);
//# sourceMappingURL=SupportPopup-dbg.js.map

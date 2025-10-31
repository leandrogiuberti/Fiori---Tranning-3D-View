sap.ui.define(['exports', 'sap/ushell/thirdparty/Icons', 'sap/ushell/thirdparty/parameters-bundle.css2', 'sap/ushell/thirdparty/parameters-bundle.css'], (function (exports, Icons, parametersBundle_css, parametersBundle_css$1) { 'use strict';

	Icons.p("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => parametersBundle_css.defaultThemeBase);
	Icons.p("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => parametersBundle_css$1.defaultTheme);
	var listItemAdditionalTextCss = `.ui5-li-additional-text{margin:0 .25rem;color:var(--sapNeutralTextColor);font-size:var(--sapFontSize);min-width:3.75rem;text-align:end;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
`;

	exports.listItemAdditionalTextCss = listItemAdditionalTextCss;

}));

declare module "sap/esh/search/ui/controls/SearchTileHighlighter" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { Tester } from "sap/esh/search/ui/SearchHelper";
    import Control from "sap/ui/core/Control";
    /**
     * @namespace sap.esh.search.ui.controls
     */
    class Highlighter {
        private _softHyphenRegExp;
        tester: Tester;
        constructor();
        setHighlightTerms(highlightTerms: string): void;
        highlight(tileView: Control): void;
        doHighlight(node: Element | ChildNode): HTMLElement;
        removeSoftHyphens(text: string): string;
        highlightTextNode(node: Element | ChildNode): HTMLElement;
    }
}
//# sourceMappingURL=SearchTileHighlighter.d.ts.map
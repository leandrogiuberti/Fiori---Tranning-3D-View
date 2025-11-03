/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { Tester } from "sap/esh/search/ui/SearchHelper";
import * as SearchHelper from "sap/esh/search/ui/SearchHelper";
import Control from "sap/ui/core/Control";
import encodeXml from "sap/base/security/encodeXML";
import Hyphenation from "sap/ui/core/hyphenation/Hyphenation";

/**
 * @namespace sap.esh.search.ui.controls
 */
export class Highlighter {
    private _softHyphenRegExp: RegExp;
    tester: Tester;

    constructor() {
        this._softHyphenRegExp = new RegExp("[\u00ad]", "g");
    }

    setHighlightTerms(highlightTerms: string): void {
        this.tester = new Tester(highlightTerms, "sapUshellSearchHighlight", true, "or");
    }

    highlight(tileView: Control): void {
        const node = tileView.getDomRef();
        if (!node) {
            return;
        }
        const oHyphenation = Hyphenation.getInstance();
        if (!oHyphenation.isLanguageInitialized()) {
            oHyphenation.initialize().then(
                function () {
                    this.doHighlight(node);
                }.bind(this),
                function () {
                    this.doHighlight(node);
                }.bind(this)
            );
        } else {
            this.doHighlight(node);
        }
    }

    doHighlight(node: Element | ChildNode): HTMLElement {
        if (node.nodeType === window.Node.TEXT_NODE) {
            this.highlightTextNode(node);
            return;
        }
        for (let i = 0; i < node.childNodes.length; ++i) {
            const child = node.childNodes[i];
            this.doHighlight(child);
        }
    }

    removeSoftHyphens(text: string): string {
        return text.replace(this._softHyphenRegExp, "");
    }

    highlightTextNode(node: Element | ChildNode): HTMLElement {
        // check for match
        const testResult = this.tester.test(this.removeSoftHyphens(node.textContent));
        if (!testResult.bMatch) {
            return;
        }
        // match -> replace dom node
        const spanNode = document.createElement("span");
        spanNode.innerHTML = encodeXml(testResult.sHighlightedText);
        SearchHelper.boldTagUnescaper(spanNode, "sapUshellSearchHighlight");
        node.parentNode.insertBefore(spanNode, node);
        node.parentNode.removeChild(node);
    }
}

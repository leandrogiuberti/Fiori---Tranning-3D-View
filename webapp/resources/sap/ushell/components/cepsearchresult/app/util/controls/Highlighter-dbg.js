// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
], (
) => {
    "use strict";

    const HighlighterUtil = {};

    /**
     * Caution
     * When debugging the Mutation Observer the browser might disconnect from mutation event
     * from a tab. Highlighting might not work anymore in this tab even if debugger is disconnected.
     * Please open a new tab and try again.
     */

    /**
     * STATIC MEMBERS for HighlighterUtil object
     */

    HighlighterUtil.CURRENTLY_HIGHLIGHTED_DOM_REFS = []; // DOM Reference
    HighlighterUtil.MUTATION_OBSERVER = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver; // Available MutationObserver

    function Highlighter (oDomRef, oConfig) {
        this._bIsCaseSensitive = !!oConfig.isCaseSensitive; // default is false
        this._aPreviouslyHighlightedNodes = [];
        this._aPreviouslyOriginalNodes = [];
        this._aOldTerms = [];
        this._aRegExTerms = [];
        this._bUseExternalStyles = !!oConfig.useExternalStyles; // default is false
        this._oObserver = null;
        this._sQuerySelector = oConfig.querySelector;
        if (Array.isArray(oDomRef)) {
            this._oDomRef = oDomRef;
        } else {
            this._oDomRef = [oDomRef];
        }

        if (oConfig.shouldBeObserved) {
            this._addMutationObserver();
        }
    }

    Highlighter.prototype.highlight = function (sTerms) {
        if (!sTerms) {
            this._aRegExTerms = [];
            this._aOldTerms = [];
            return;
        }

        const aTerms = this._formatTerms(sTerms);
        if (!aTerms || !aTerms.length || this._isNewTermsSameAsOld(aTerms)) {
            return;
        }

        this._aOldTerms = aTerms;
        this._cacheRegExTerms();

        this._toggleMutationObserver(false);
        this._oDomRef.forEach(function (oDomRef) {
            this._highlightSubTree(oDomRef);
        }, this);
        this._toggleMutationObserver(true);
    };

    Highlighter.prototype._cacheRegExTerms = function () {
        let oRegEx;
        this._aRegExTerms = [];

        this._aOldTerms.forEach(function (sTerm) {
        // We escape any special RegExp character with '\' in front of it.
            sTerm = this._escapeRegExp(sTerm);

            oRegEx = this._bIsCaseSensitive ? new RegExp(sTerm, "g") : new RegExp(sTerm, "gi");
            this._aRegExTerms.push(oRegEx);
        }, this);
    };

    Highlighter.prototype._escapeRegExp = function (sText) {
        return sText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    Highlighter.prototype._isNewTermsSameAsOld = function (aTerms) {
        const iOldQueryLength = this._aOldTerms.length; let i;

        if (iOldQueryLength !== aTerms.length) {
            return false;
        }

        for (i = 0; i < iOldQueryLength; i++) {
            if (this._aOldTerms[i] !== aTerms[i]) {
                return false;
            }
        }

        return true;
    };

    Highlighter.prototype._highlightSubTree = function (oRootNode) {
        let oNode;
        let i;
        let childNodes;
        if (oRootNode === this._oDomRef[0] && this._sQuerySelector) {
            childNodes = this._oDomRef[0].querySelectorAll(this._sQuerySelector);
        } else {
            childNodes = oRootNode.childNodes;
        }
        for (i = 0; i < childNodes.length; i++) {
            oNode = childNodes[i];
            this._processNode(oNode);
        }
    };

    Highlighter.prototype._processNode = function (oNode) {
        let sText; let oRegEx; let i; let j; let oMatches; let sCurrentMatch;
        let oCurrentMatch; let aBlockedIndices; let iCurrMatchIndex;
        let oHighlightedNode;

        if (oNode.nodeType === document.ELEMENT_NODE) {
            this._highlightSubTree(oNode);
        } else if (oNode.nodeType === document.TEXT_NODE) {
            sText = oNode.data;
            oMatches = Object.create(null); // Object containing matched queries and their indices.
            aBlockedIndices = []; // Array which serves for preservation of the already matched indices.

            for (i = 0; i < this._aRegExTerms.length; i++) {
                oRegEx = this._aRegExTerms[i];

                while ((oCurrentMatch = oRegEx.exec(sText)) !== null) {
                    iCurrMatchIndex = oCurrentMatch.index;

                    // We check if the iCurrMatchIndex isn't part of the blocked indices.
                    // If it isn't, we process the matched query and its indices. If it is, we don't.
                    if (aBlockedIndices.indexOf(iCurrMatchIndex) === -1) {
                        sCurrentMatch = oCurrentMatch["0"];
                        oMatches[iCurrMatchIndex] = sCurrentMatch;

                        // We populate the aBlockedIndices array with the iCurrMatchIndex and
                        // the following indices which belong to the characters of the matched query (sCurrentMatch).
                        for (j = iCurrMatchIndex; j < iCurrMatchIndex + sCurrentMatch.length; j++) {
                            aBlockedIndices.push(j);
                        }
                    }
                }
            }

            if (Object.keys(oMatches).length !== 0) {
                oHighlightedNode = this._createHighlightedNode(oMatches, sText);
                this._replaceNode(oNode, oHighlightedNode);
            }
        }
    };

    Highlighter.prototype._formatTerms = function (sTerms) {
        // we remove white spaces in the beginning and the end and the extra whitespace
        // in between if so, then we split the initial terms string by white
        // space symbol into aTerms array
        const aTerms = sTerms && sTerms.replace(/\s+/g, " ").trim().split(" ");

        // we push the unique strings of aTerms in the aUniqueTerms array
        const aUniqueTerms = aTerms.reduce((accumulator, currentValue) => {
            if (accumulator.indexOf(currentValue) === -1) {
                accumulator.push(currentValue);
            }
            return accumulator;
        }, []);

        // we return only the unique terms sorted in descending order by their length
        return aUniqueTerms.sort((a, b) => {
            return b.length - a.length;
        });
    };

    Highlighter.prototype._replaceNode = function (oNode, oHighlightedNode) {
        if (oNode.parentNode && oNode.parentNode.closest && oNode.parentNode.closest(this._sQuerySelector)) {
            oNode.parentNode.replaceChild(oHighlightedNode, oNode);

            // we cache which nodes are replaced with such as highlighted spans
            this._aPreviouslyHighlightedNodes.push(oHighlightedNode); // Highlighted Node with span
            this._aPreviouslyOriginalNodes.push(oNode); // Original Node
        }
    };

    Highlighter.prototype._restorePreviouslyHighlightedNodes = function () {
        let oModifiedDomNode;
        let oOriginalDomNode;

        this._toggleMutationObserver(false);

        for (let i = 0; i < this._aPreviouslyHighlightedNodes.length; i++) {
            oModifiedDomNode = this._aPreviouslyHighlightedNodes[i];
            oOriginalDomNode = this._aPreviouslyOriginalNodes[i];

            if (oModifiedDomNode.parentNode) {
                oModifiedDomNode.parentNode.replaceChild(oOriginalDomNode, oModifiedDomNode);
            }
        }

        this._aPreviouslyHighlightedNodes = [];
        this._aPreviouslyOriginalNodes = [];
        this._toggleMutationObserver(true);
    };

    Highlighter.prototype._createHighlightedNode = function (oTokensToHighlight, sText) {
        const oRootNode = document.createElement("span");
        const aAllTokens = [];
        function fnSort (a, b) { return a > b; }
        const aIndices = Object.keys(oTokensToHighlight).sort(fnSort);
        let iIndex;
        let iStartIndex = 0;

        // split the <code>sText</code> into tokens,
        // including both the tokens to highlight
        // and the remaining parts of the <code>sText</code> string
        for (let i = 0; i < aIndices.length; i++) {
            const iTokenIndex = Number(aIndices[i]);
            const sToken = oTokensToHighlight[iTokenIndex];
            const iTokenLength = sToken.length;
            const sBeforeToken = sText.substring(iStartIndex, iTokenIndex);

            if (sBeforeToken.length) {
                aAllTokens.push(sBeforeToken);
            }
            aAllTokens.push(sToken);

            // shift the <code>iStartIndex</code> to the
            // remaining part of the <code>sText</code> string
            iStartIndex = iTokenIndex + iTokenLength;
        }

        if (iStartIndex < sText.length) {
            aAllTokens.push(sText.substring(iStartIndex));
        }

        // wrap each token in a span
        // and append to the root span
        for (iIndex in aAllTokens) {
            const oNextNode = document.createElement("span");
            oNextNode.innerText = aAllTokens[iIndex];
            if (Object.values(oTokensToHighlight).indexOf(aAllTokens[iIndex]) > -1) {
                oNextNode.classList.add("defaultHighlightedText");
            }

            oRootNode.appendChild(oNextNode);
        }

        return oRootNode;
    };

    Highlighter.prototype._addMutationObserver = function () {
        this._instantiateMutationObserver();
        this._toggleMutationObserver(true);
    };

    Highlighter.prototype._removeMutationObserver = function () {
        this._toggleMutationObserver(false);
        this._oObserver = null;
        this._oDomRef = [];
    };

    Highlighter.prototype._toggleMutationObserver = function (bConnect) {
        if (bConnect) {
            this._oDomRef.forEach(function (oDomRef) {
                this._oObserver.observe(oDomRef, this.oObserverConfig);
            }, this);
        } else if (this._oObserver) {
            this._oObserver.disconnect();
        }
    };

    Highlighter.prototype._bIsDomNodeDescendant = function (oParent, oChild) {
        return oParent.contains(oChild);
    };

    Highlighter.prototype._instantiateMutationObserver = function () {
        this.oObserverConfig = {
            attributes: false,
            childList: true,
            characterData: true,
            subtree: true
        };

        // instance
        this._oObserver = new HighlighterUtil.MUTATION_OBSERVER(
            this._onMutationDetectionCallback.bind(this));
    };

    Highlighter.prototype._onMutationDetectionCallback = function (aMutations) {
        let addedNodes;
        let oNode;

        this._toggleMutationObserver(false);

        aMutations.forEach(function (oMutation) {
            if (oMutation.type === "childList") {
                addedNodes = oMutation.addedNodes;
                for (let i = 0; i < addedNodes.length; i++) {
                    oNode = addedNodes[i];
                    this._processNode(oNode);
                }
            } else if (oMutation.type === "characterData") {
                this._processNode(oMutation.target);
            }
        }, this);

        this._toggleMutationObserver(true);
    };

    Highlighter.prototype.destroy = function () {
        this._removeMutationObserver();
    };

    return Highlighter;
});

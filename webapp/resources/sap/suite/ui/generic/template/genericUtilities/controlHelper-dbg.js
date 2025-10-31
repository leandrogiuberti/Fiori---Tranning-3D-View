sap.ui.define([
	"sap/ui/dom/getFirstEditableInput", 
	"sap/suite/ui/generic/template/genericUtilities/FeLogger",
	"sap/ui/core/Element",
	"sap/ui/table/plugins/MultiSelectionPlugin"
], function(getFirstEditableInput, FeLogger, Element, MultiSelectionPlugin) {
		"use strict";
		
	var oFeLogger = new FeLogger("genericUtilities.controlHelper");
	var oLogger = oFeLogger.getLogger();
	
	var byId = Element.getElementById;
	
	function isControlOfType(sPathToType, oControl){
		var FNClass = sap.ui.require(sPathToType);
        return typeof FNClass === "function" && (oControl instanceof FNClass);
	}
	
	function getUI5ControlForDomElement(oDom){
	    for (; oDom; oDom = oDom.parentNode) {
	        if (oDom.hasAttribute && oDom.hasAttribute("data-sap-ui")) {
				return byId(oDom.id);
	        }
	    }		
	}
	
	function focusUI5Control(oControl, oFocusInfo){
		if (oControl && oControl.focus) {
			oLogger.debug("Set focus on control with id " + oControl.getId());
			var oCurrentFocus = getControlWithFocus();
			if (oControl === oCurrentFocus){
				oLogger.debug("Focus already set -> ignore");
				return;
			}
			if (oControl.isFocusable && !oControl.isFocusable()){
				oLogger.warning("Control is currently not focussable try to focus parent");
				focusUI5Control(getParentOfVisibleElement(oControl), oFocusInfo);
				return;
			}
			if (oControl.getEnabled && !oControl.getEnabled()){
				oLogger.warning("Control is currently not enabled");
			}
			oControl.focus(oFocusInfo);
			oCurrentFocus = getControlWithFocus();
			var oTest = oCurrentFocus;
			var bIsTargetSmartField = oControlHelper.isSmartField(oControl);
			if (bIsTargetSmartField) {
				while (oTest && oTest !== oControl && !oControlHelper.isSmartField(oTest)) {
					oTest = oTest.getParent();
				}
			}
			if (oTest !== oControl){
				oLogger.warning(oCurrentFocus ? ("Focus is now on control with id " + oCurrentFocus.getId()) : "There is no focus now");
			}
		}		
	}
	
	function focusDom(oDom, oFocusInfo){
		var oUi5Control = getUI5ControlForDomElement(oDom);
		focusUI5Control(oUi5Control, oFocusInfo);
	}

	function focusControl(sControlId, oFocusInfo) {
		var oTarget = sControlId && byId(sControlId);
		focusUI5Control(oTarget, oFocusInfo);
	}

	// returns a Promise that resolves to the boolean information whether the SmartField is a possible focus target for input.
	function getSmartFieldIsFocussableForInputPromise(oSmartField) {
		return oSmartField._getComputedMetadata().then(function () {
			return (oSmartField.getMode() === "edit") && (oSmartField._getICRenderedPromise() || Promise.resolve());
		}).then(function () {
			var oFirstFocusableInput = !oSmartField._bEdmBoolDetected && getFirstEditableInput(oSmartField.getDomRef());
			return !(!oFirstFocusableInput || oFirstFocusableInput.type === "checkbox");
		}).catch(function () {
			return false;
		});
	}

	// returns the UI5 control which currently has the focus, if there is one. Otherwise returns a faulty value.
	// Implementation as recommended by UI5 until the provide an own abstraction.
	function getControlWithFocus(){
		return getUI5ControlForDomElement(document.activeElement);
	}
	
	// Returns the parent of a given sap.ui.core.Element, but considers that for Components the parent is to be found via the oContainer property.
	function getParent(oElement){
		return oElement.getParent() || oElement.oContainer;
	}
	
	// If oChild is identified to be invisible, null is returned. Otherwise its parent is returned.
	// If the parent does not exist a faulty value is returned.
	// This is a heuristic method.
	function getParentOfVisibleElement(oChild){
		return (!oChild.getVisible || oChild.getVisible()) ? getParent(oChild) : null;
	}

	// This method checks whether sElementId identifies an element which is visible and placed on a given view.
	// If oView is truthy and the view is not visible the method will return false.
	// Otherwise it will run up the element tree from sElementId until it finishes because of one of the following conditions:
	// - oView is faulty and onElementVisited returns a truthy value for the element (return the truthy value in this case)
	// - the element in question is invisible (return false in this case)
	// - the element does not have a parent (return false in this case)
	// - the element is equal to oView (return true in this case)
	// onElementVisited is an optional function that will be called for each element visited starting at the element identified by sElementId up to (and including) an element is found that fulfills the condition above.
	// In case oView is faulty the return value of onElementVisited also determines the result of this function (as described above).
	function isElementVisibleOnView(sElementId, oView, onElementVisited){
		onElementVisited = onElementVisited || Function.prototype;
		var vRet = false;
		for (var oElement = (!oView || oView.getVisible()) && byId(sElementId); oElement && !vRet; oElement = getParentOfVisibleElement(oElement)) {
			var vTemp = onElementVisited(oElement);
			vRet = oView ? (oElement === oView) : vTemp;
		}
		return vRet;
	}
	
// Return a list of all children of the given control (in the 'correct' order). Only implemented for certain control types.
	// For the other control types it returns null or an empty array depending on bAlwaysReturnAList.
	function getChildren(oControl, bAlwaysReturnAList){
		if (oControl.getSections){
			return oControl.getSections();
		}
		if (oControlHelper.isObjectPageSection(oControl)){
			return oControl.getSubSections();
		}
		if (oControlHelper.isObjectPageSubSection(oControl)){
			return oControl.getBlocks().concat(oControl.getMoreBlocks());
		}
		if (isControlOfType("sap/ui/comp/smartform/Group", oControl)){
			return oControl.getFormElements();	
		}
		if (isControlOfType("sap/ui/table/Column", oControl)){
			var aRet = oControl.getMultiLabels();
			var oLabel = oControl.getLabel();
			if (oLabel){
				aRet.push(oLabel);
			}
			return aRet;	
		}				
		return bAlwaysReturnAList ? [] : null;
	}
	
	// Sorter that compares the position of two child controls which have a common parent.
	// Returns a positive integer when oChild1 is larger, a negative number if oChild2 is larger, and 0 if they are identical.
	// Depends on getChildren() being implemented for commonParent. If this is not the case, at least a reproducable order is guaranteed.
	function fnSortChildControls(oCommonParent, oChild1, oChild2){
		if (oChild1 === oChild2){
			return 0;
		}
		var aChildren = getChildren(oCommonParent, true);
		var iPos1 = aChildren.indexOf(oChild1);
		var iPos2 = aChildren.indexOf(oChild2);
		if (iPos1 < 0 && iPos2 < 0){ // if both children are not in the list of children we try to locate the controls in the DOM
			var oDomRef1 = typeof oChild1.getDomRef === "function" && oChild1.getDomRef();
			var oDomRef2 = typeof oChild2.getDomRef === "function" && oChild2.getDomRef();
			if (oDomRef1 && oDomRef2){
				var iPositionCompare = oDomRef1.compareDocumentPosition(oDomRef2);
				if (iPositionCompare & Node.DOCUMENT_POSITION_PRECEDING){
					return 1;
				}
				if (iPositionCompare & Node.DOCUMENT_POSITION_FOLLOWING){
					return -1;
				}				
			}
			return 1 - 2 * (!oDomRef1 === !oDomRef2 ? oChild1.getId() < oChild2.getId() : !oDomRef2); // if we cannot determine a reasonable order we still want to have a reproducable order. Note that elements with DomRef must clearly be separated from those without.
		}
		return (iPos1 >= 0 && iPos2 >= 0) ? (iPos1 - iPos2) : (iPos2 - iPos1); // if only one child has been identified in the list of children it takes precedence.
	}
	
	// This function defines which instances of sap.ui.core.Element are relevant for investigation (Currently used in fnSearchInTree).
	// They must posess a property 'visible' (which is guaranteed for all instances of sap.ui.core.Control) which is true.
	// If they have a property 'enabled' this must be true as well.
	// Note: Instances of some classes need a special treatment (currently this applies to sap.ui.table.Row).
	function checkForRelevance(oElement){
		return isControlOfType("sap/ui/table/Row", oElement) ? oElement.getCells().some(function(oCell){
			return checkForRelevance(oCell);
		})	: (typeof oElement.getVisible === "function" && oElement.getVisible() && (typeof oElement.getEnabled !== "function" || oElement.getEnabled()));
	}
	
	// This function allows a depth-first search in an element tree starting with root oElement
	// Thereby, the following logic is applied
	// - Children of an element are determined by function getChildren in this class. If this provides an empty array method findElements of the element is used
	// - Children will be sorted by fnSortChildControls
	// - Elements which do not fulfill checkForRelevance (see above) are ignored
	// mAlreadyAnalyzed is an optional map. The keys are the ids of elements that have already been processed
	// - value 1 means that the element has already been processed, but subtree still needs to be processed
	// - value 2 means that the element and its children have already been fully processed
	// Note that mAlreadyAnalyzed will be updated by this function
	// fnHandleElement(oElement) is a function that will be called on all relevant elements of the tree.
	// This function can work asynchronously (i.e. return a Promise) or synchronously (i.e. return something which is not a Promise) on a case-by-case basis.
	// In the second case the return value will be considered as the result of the function. In the first case the value the Promise resolves to will be considered as the result. 
	// If the result is a truthy value for one element this value is considered as the result of fnSearchInTree and the processing is stopped.
	// fnSearchInTree returns this result synchronously if all calls of fnHandleElement which have been performed until then have worked synchronously.
	// If the result of fnHandleElement is faulty the depth-first search of the tree proceeds. Thereby the processing of the subtree of oElement is
	// skipped if the result was exactly false. For other faulty values the subtree will be processed next.
	// Note that this process will never work on two elements in parallel. If the processing of one element is asynchronous the process is interrupted until
	// the result of this step is available. Only then  the next element will be analyzed.
	// If fnHandleElement never results in a truthy value then fnSearchInTree results in null. 
	function fnSearchInTree(mAlreadyAnalyzed, oElement, fnHandleElement){
		mAlreadyAnalyzed = mAlreadyAnalyzed || Object.create(null);
		var sId = oElement.getId();
		var iAlreadyAnalyzed = mAlreadyAnalyzed[sId]; // Information about the processing status of oElement
		if (iAlreadyAnalyzed === 2 || !checkForRelevance(oElement)){ // Note: If oElement is considered not relevant we do not store it in mAlreadyAnalyzed.
			return null;                                             // Due to asynchronous processing of a sibling the element may be visited once more.
		}                                                            // If checkForRelevance gives a different result now (maybe due to visibility change) the element will still be processed.
		var vResult; // will be the return value for the last node which has been processed (so either the result or a Promise that resolves to the result)
		if (iAlreadyAnalyzed !== 1){ // oElement was not processed yet
			vResult = fnHandleElement(oElement);
			mAlreadyAnalyzed[sId] = 1 + (vResult === false); // mark the element as being processed. If false was returned also mark the subtree as being processed
		}
		if (!vResult && vResult !== false){ // oElement was processed without result and the children may still be processed.
			var aChildren = getChildren(oElement);
			if (!aChildren){ // if getChildren does not care for the control type of oElement
				aChildren = oElement.findElements(false);
				aChildren.sort(fnSortChildControls.bind(null, oElement));
			}		
			aChildren.some(function(oChild){
				vResult = fnSearchInTree(mAlreadyAnalyzed, oChild, fnHandleElement);
				return vResult; // If vResult is truthy it is either a Promise (which makes the processing asynchronous) or the result of fnSearchInTree. In both cases we should stop now.
			});
		}
		// Now vResult is the return value of fnHandleElement(oElement) if that has been computed and is either truthy or false. Otherwise it is the first truthy return value
		// of fnSearchInTree for a relevant child. If all relevant children have returned a faulty value vResult is still undefined.
		if (vResult instanceof Promise){ // fnSearchInTree becomes asynchronous for this element. Processing is stopped until we know the result
			return vResult.then(function(vNextResult){ // vNextResult is the result of fnHandleElement(oElement) or of fnSearchInTree for a child
				if (vNextResult === false){ // Note that this can only happen if vResult is the return value of fnHandleElement(oElement), since results of fnSearchInTree are either truthy or null
					mAlreadyAnalyzed[sId] = 2; // so mark oElement as being fully processed
					return null;          // and indicate that fnSearchInTree for oElement results in null
				}
				// If vResult is truthy we can return it as the result for oElement. Otherwise proceed with processing of oElement once more. Note that we have added information to mAlreadyAnalyzed so that less nodes need to be processed now.
				return vNextResult || fnSearchInTree(mAlreadyAnalyzed, oElement, fnHandleElement);
			});
		}
		// When coming here we have synchronously either found a node with a truthy result or have processed the whole tree without finding any truthy result
		mAlreadyAnalyzed[sId] = 2;
		return vResult || null;		
	}

	/**
	 * Returns the selection plugin for the given UI table
	 * @param {sap.ui.table.Table} oUiTable 
	 * @returns {sap.ui.table.plugins.MultiSelectionPlugin|undefined}
	 */
	function fnGetSelectionPluginForUITable (oUiTable) {
		return MultiSelectionPlugin.findOn(oUiTable);
	}

	var oControlHelper =  {
		byId: byId,
		getParent: getParent,
		isView:						isControlOfType.bind(null, "sap/ui/core/mvc/View"),
		isSmartFilterBar:			isControlOfType.bind(null, "sap/ui/comp/smartfilterbar/SmartFilterBar"),
		isSmartForm:				isControlOfType.bind(null, "sap/ui/comp/smartform/SmartForm"),
		isSmartTable:      			isControlOfType.bind(null, "sap/ui/comp/smarttable/SmartTable"),
		isSmartList:	   			isControlOfType.bind(null, "sap/ui/comp/smartlist/SmartList"),
		isSmartField:				isControlOfType.bind(null, "sap/ui/comp/smartfield/SmartField"),
		isSmartChart:      			isControlOfType.bind(null, "sap/ui/comp/smartchart/SmartChart"),
		isSemanticObjectController: isControlOfType.bind(null, "sap/ui/comp/navpopover/SemanticObjectController"),
		isSmartVariantManagement:	isControlOfType.bind(null, "sap/ui/comp/smartvariants/SmartVariantManagement"),
		isGrid:      				isControlOfType.bind(null, "sap/ui/layout/Grid"),
		isUiTable:         			isControlOfType.bind(null, "sap/ui/table/Table"),
		isAnalyticalTable: 			isControlOfType.bind(null, "sap/ui/table/AnalyticalTable"),
		isTreeTable:       			isControlOfType.bind(null, "sap/ui/table/TreeTable"),
		isMTable:          			isControlOfType.bind(null, "sap/m/Table"),
		isRow:                      isControlOfType.bind(null, "sap/ui/table/Row"),
		isColumnListItem:           isControlOfType.bind(null, "sap/m/ColumnListItem"),
		isSearchField:				isControlOfType.bind(null, "sap/m/SearchField"),
		isButton:					isControlOfType.bind(null, "sap/m/Button"),
		isOverflowToolbar:			isControlOfType.bind(null, "sap/m/OverflowToolbar"),
		isMultiInputField:			isControlOfType.bind(null, "sap/m/MultiInput"),
		isLink:						isControlOfType.bind(null, "sap/m/Link"),
		isDynamicPage:	   			isControlOfType.bind(null, "sap/f/DynamicPage"),
		isObjectPageSection:		isControlOfType.bind(null, "sap/uxap/ObjectPageSection"),
		isObjectPageSubSection:		isControlOfType.bind(null, "sap/uxap/ObjectPageSubSection"),
		isObjectObjectPageLayout:	isControlOfType.bind(null, "sap/uxap/ObjectPageLayout"),
		isMenuButton:				isControlOfType.bind(null, "sap/m/MenuButton"),
		isMenu:						isControlOfType.bind(null, "sap/m/Menu"),
		getUI5ControlForDomElement: getUI5ControlForDomElement,
		focusControl: focusControl,
		focusUI5Control: focusUI5Control,
		focusDom: focusDom,
		getControlWithFocus: getControlWithFocus,
		getSmartFieldIsFocussableForInputPromise: getSmartFieldIsFocussableForInputPromise,
		isElementVisibleOnView: isElementVisibleOnView,
		sortChildControls: fnSortChildControls,
		searchInTree: fnSearchInTree.bind(null, null),
		getSelectionPluginForUITable: fnGetSelectionPluginForUITable
	};
	
	oControlHelper.isTable = function(oControl){
		return oControlHelper.isSmartTable(oControl) || oControlHelper.isUiTable(oControl) || oControlHelper.isMTable(oControl);
	};
	
	return oControlHelper;
});

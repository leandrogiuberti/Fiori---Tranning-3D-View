sap.ui.define([
	"sap/ui/model/FilterOperator"
], function (FilterOperator) {
	"use strict";



	// deals with state of SFB itself, without SVM (see SmartVariantManagementWrapper) and go-button (does not contain a state from SFB point of view - however, we remember whether it was pressed once
	// to restore data - this information is not considered being part of SFB)

	var dataPropertyNameCustom = "sap.suite.ui.generic.template.customData",
	dataPropertyNameExtension = "sap.suite.ui.generic.template.extensionData",
	dataPropertyNameGeneric = "sap.suite.ui.generic.template.genericData";

	/**
	 * Constructor for SmartFilterBarWrapper
	 * @param {sap.ui.comp.smartfilterbar.SmartFilterBar} vTarget - The SmartFilterBar control
	 * or the Id of control for which this wrapper is created
	 * @param {object} oFactory - the controlStateWrapperFactory
	 * @param {object} mParams
	 * @param {Object} mParams.oCustomFiltersWrapper - wrapper for custom filters (from SFB point of view)
	 *   (currently containing: generic (currently only editState), app extension, and adaptation extension - but this is knowledge of LR, i.e. of iAppStateHandler, not of SFB)
	 * @returns {object}
	 * @alias sap.suite.ui.generic.template.genericUtilities.controlStateWrapperFactory.SmartFilterBarWrapper
	 */
	function SmartFilterBarWrapper(vTarget, oFactory, mParams) {
		var bIsApplying = false;
		var aBasicFilters = [];
		var aMissingNavFilters = [];
		var oSmartFilterBar, oControlAssignedResolve, oPreliminaryState;
		var oControlAssignedPromise = new Promise(function (resolve) {
			oControlAssignedResolve = resolve;
		});

		function fnInitialize() {
			if (typeof vTarget !== "string") {
				fnSetControl(vTarget);
			}

			// Filters visible initially (after initialization). Stored here to be
			// able to compare with currently visible ones to identify added and
			// removed ones	without need to instantiate all possible filter items
			// (which would harm performance). Can only be retrieved in initialized event.
			oControlAssignedPromise.then(function () {
				oSmartFilterBar.getInitializedPromise().then(function () {
					aBasicFilters = oSmartFilterBar.getAllFilterItems(true);
				});
			});
		}

		// Attach to variantFetch and variantLoad events to be able to store and restore also custom filters and state of other controls (in case of page VM) with variant.
		// Events for storing/restoring are provided by SFB, data to be stored/restored can come from 3 sources:
		// - standard filters: handled directly by SFB
		// - extension filters: provided from mParams.oCustomFiltersWrapper
		// - other controls being part of VM: provided by oSVMWrapperCallbacks (controls with direct connection to VM are skipped in SVM wrapper)
		function setSVMWrapperCallbacks(oSVMWrapperCallbacks){
			// Before saving the current state as a new variant, we need to provide all state data of controls controlled by VM, but not known to it with setCustomFilterData. From a
			// logical point of view, the event (beforeVariantFetch) as well as the method to store the extension data (setCustomFilterData) belong to SVM, but both are implemented
			// in SFB. Additionally, beforeVariantSave would actually be the name more logical to the consumer, however that name had been used earlier and was deprecated and
			// replaced by the given one. Fetch actually does not mean to fetch variant content from the place variants are stored, but to get the current state from the controls!
			oSmartFilterBar.attachBeforeVariantFetch(function(){
				var oCustomData = Object.create(null);
				oCustomData[dataPropertyNameGeneric] = oSVMWrapperCallbacks.getManagedControlStates();
				oCustomData[dataPropertyNameGeneric].customFilters = mParams.oCustomFiltersWrapper.getState();
				oSmartFilterBar.setCustomFilterData(oCustomData);
			});

			// When a variant is loaded, correspondingly we have to get the customData and apply the states to the controls not known to SVM. Again, event and method are implemented
			// in SFB instead of SVM where it would make more sense.
			// Here the event is afterVariantLoad, as the variant content known to SVM/SFB has first to be applied to the SFB, which will also pass the custom data accordingly. Only
			// after this has happened, we can get the custom data from SFB.
			oSmartFilterBar.attachAfterVariantLoad(function(oEvent){
				var oCustomData = oSmartFilterBar.getCustomFilterData();
				// variant stored with 1.103 or later: all customFilter data stored in property customFilters
				// legacy variant stored with 1.102 or earlier: customFilters (from storing point of view) separated according to their origin
				var oCustomFiltersState = oCustomData[dataPropertyNameGeneric].customFilters || {
						editState: oCustomData[dataPropertyNameGeneric].editStateFilter,
						appExtension: oCustomData[dataPropertyNameCustom],
						adaptationExtensions: oCustomData[dataPropertyNameExtension]
					};

				mParams.oCustomFiltersWrapper.setState(oCustomFiltersState);
				oSVMWrapperCallbacks.setManagedControlStates(oCustomData[dataPropertyNameGeneric]);
				/* SFB header state of a variant (standard or custom) gets determined by the Apply Automatically checkbox's value of the corresponding
				   variant i.e. if the checkbox is checked, then the header should be collapsed and vice versa. */
				oSVMWrapperCallbacks.setHeaderState(!oEvent.getParameter("executeOnSelect"));
				aMissingNavFilters = fnGetNavigationProperties();
			});

		}

		function fnGetNavigationProperties() {
			//Fetch the navigation properties
			const oMetaModel = oSmartFilterBar.getModel().getMetaModel(),
				sEntitySet = oSmartFilterBar.getEntitySet(),
				oDataEntitySet = oMetaModel.getODataEntitySet(sEntitySet),
				oDataEntityType = oMetaModel.getODataEntityType(oDataEntitySet.entityType),
				aNavigationProperties = oDataEntityType['navigationProperty'];
			//Fetch the added filters in the current variant
			const sCurrentVariantID = oSmartFilterBar.getVariantManagement().getCurrentVariantId(),
				oCurrentVariant = oSmartFilterBar.getVariantManagement().getAllVariants().find(function(variant) {
					return variant.getId() === sCurrentVariantID;
				});
			if (!oCurrentVariant
				|| !oCurrentVariant.getContent()
				|| !oCurrentVariant.getContent().searchListReportVariant
				|| !oCurrentVariant.getContent().searchListReportVariant.filterBarVariant
				|| !aNavigationProperties
				|| !aNavigationProperties.length
			) {
				return [];
			}
			const oManifestNavigationProperties = oSmartFilterBar.getNavigationProperties() ?
				oSmartFilterBar.getNavigationProperties().split(",").reduce(function(accumulator, currentValue){
					accumulator[currentValue] = true;
					return accumulator;
				}, {}) : {},
				oNavigationProperties = aNavigationProperties.reduce(function(accumulator, currentValue){
					accumulator[currentValue.name] = true;
					return accumulator;
				}, {}),
				oSmartFilterBarVariant = JSON.parse(oCurrentVariant.getContent().searchListReportVariant.filterBarVariant),
				aMissing = [];
			delete oSmartFilterBarVariant["_CUSTOM"];

			// Compare the filter source and navigation properties
			// Take into account if parameter is already specified in page setting in manifest.json - settings->filterSettings->navigationProperties
			// If parameter exist in navigationProperties -> SFB will handle specific parameter and code ignore it
			for (const sFilterKey in oSmartFilterBarVariant) {
				const sParamName = sFilterKey.split(".")[0]; // take first part from navigation parameter. Example: to_Currency.Currency_Code -> to_Currency
				if (!oNavigationProperties[sParamName] || oManifestNavigationProperties[sParamName]
				) {
					// Parameter is
					// 1) not navigation property -> we don't process it
					// 2) is defined in manifest.json - settings->filterSettings->navigationProperties -> value will be handled by SFB
					continue;
				}
				if (oSmartFilterBarVariant[sFilterKey].items && oSmartFilterBarVariant[sFilterKey].items.length) {
					aMissing.push(oSmartFilterBarVariant[sFilterKey].items.map(function(entry) {
						return {
							exclude: false,
							field: sFilterKey,
							operation: FilterOperator.EQ,
							value1: entry.key
						};
					}));
					continue;
				}
				if (oSmartFilterBarVariant[sFilterKey].ranges && oSmartFilterBarVariant[sFilterKey].ranges.length) {
					aMissing.push(oSmartFilterBarVariant[sFilterKey].ranges.map(function(entry) {
						return {
							exclude: entry.exclude,
							field: entry.keyField,
							operation: entry.operation,
							value1: entry.value1,
							value2: entry.value2
						};
					}));
				}
			}
			return aMissing;
		}

		function fnGetState() {
			if (!oSmartFilterBar) {
				return oPreliminaryState;
			}

			var oUiState = oSmartFilterBar.getUiState();
			// UiState is not Serializable, but a managed object, containing information only partly relevant
			// relevant information are
			// selectOptions: The values or ranges set by the user in SFB
			// (probably) parameters: Values of parameters (for parametrized entitySets) set by user in SFB
			// semanticDates: semantic dates (like "this year") are translated to absolute date ranges (like from January 1st to December 31st). SelectOptions only contains the absolute range, thus
			// 	semantic has to be stored separately
			// added/removedFilterItems: selectOptions only contains values/ranges, not the information, whether the filter should be shown directly ("visibleInFilterBar"). SFB just assumes any items to
			//		be shown that contain values (plus those shown per default), which is wrong in two directions: items made visible but without a value are missed, items with a value, but not shown are
			//		added additionally
			//		Remark:
			//			- When saving as variant, the information seems to be passed to VM directly - but for appState, it would still be missing
			//			- Storing added (not in BASIC group but made visible by user) and removed (the other way round) separately to not disconnect the user (using e.g. a saved tile) from future changes
			//				in the application (e.g. adding a new property to selection fields)
			//		(Remark: old logic (see iAppStateHandler.getByDefaultNonVisibleCustomFilterNames) seems to provide this data only for custom fields. Assumption: Even in VM it was only available for
			//		standard fields some time back - now, this seems to be solved from SFB/SVM, but still it's missing for appState)
			var oSelectOptions = oUiState.getSelectionVariant().SelectOptions; // again, data contained in SelectionVaraint is only partly relevant
			// In beforeVariantFetch we need to provide the custom (from SVMs point of view) control's state data to the SFB. However, SFB also tries to interpret this data as
			// name-value pairs (implicitly stringifying them and assuming name to be a name of a filter), thus whenever the beforeVariantFetch has occured before getting the state
			// here, the selectionVariant contains a superfluous select option for the property sap.suite.ui.generic.template.genericData (filtering for the value [object Object]).
			// Note: beforeVariantFetch is even called on initial startup, i.e. without explicetly removing it, the superfluous select option would always be there.
			oSelectOptions = oSelectOptions && oSelectOptions.filter(function(oSelectOption){
				return oSelectOption.PropertyName !== dataPropertyNameGeneric;
			});
			return {
					selectOptions:	oSelectOptions,
					parameters: oUiState.getSelectionVariant().Parameters,
					semanticDates: oUiState.getSemanticDates(),
					addedFilterItems: oSmartFilterBar.getAllFilterItems(true).filter(function(oFilterItem){
						// Remark: getAllFilterItems(true) returns also items not visible, but with value set (in adapt filters dialog) => need to check visibility ourselves
						return oFilterItem.getGroupName() !== sap.ui.comp.filterbar.FilterBar.INTERNAL_GROUP && oFilterItem.getVisibleInFilterBar();
					}).map(function(oFilterItem){
						return oFilterItem.getName();
					}),
					removedFilterItems: aBasicFilters.filter(function(oFilterItem){
						return  !oFilterItem.getVisibleInFilterBar();
					}).map(function(oFilterItem){
						return oFilterItem.getName();
					}),
					customFilters: mParams.oCustomFiltersWrapper.getState()
			};
		}

		function fnSetState(oState) {
			// Don't cause side effects (filter change event), if setting state is no real change.
			// If this comparison fails for state that actually are identically, maybe it needs to be enhanced (e.g. ignoring order in some arrays might be needed)
			if (JSON.stringify(oState) === JSON.stringify(fnGetState())){
				return;
			}

			bIsApplying = true;
			oPreliminaryState = oState;

			oControlAssignedPromise.then(function() {
				// SFB expects a UIState object - not serializable, but a managed object, actually containing also information not belonging to SFBs state
				// => get current UIState object from SFB, replace only relevant information, and set it again
				var oUiState = oSmartFilterBar.getUiState(),
					oSmartVariant = oSmartFilterBar.getSmartVariant(),
					bIsCurrentVariantModifiedBeforeSetState = oSmartVariant.currentVariantGetModified();

				oUiState.getSelectionVariant().SelectOptions = oPreliminaryState && oPreliminaryState.selectOptions;
				oUiState.getSelectionVariant().Parameters = oPreliminaryState && oPreliminaryState.parameters;
				oUiState.setSemanticDates(oPreliminaryState && oPreliminaryState.semanticDates);
				// setState is meant to set the state absolutely, no merge needed => replace and strictMode can be set to true.
				// (replace=false can be used to set additional selectOptions but keeping the existing ones. strictMode=false is used to map filters to parameters. Both might make sense in navigation
				// scenarios (navigation parameter to be merged with defaults, property used in source app as filter but in target as parameter), but not when just restoring to a state (provided from the
				// same control))
				oSmartFilterBar.setUiState(oUiState, {replace: true, strictMode: true});

				mParams.oCustomFiltersWrapper.setState(oPreliminaryState && oPreliminaryState.customFilters);

				// set visibility
				// TODO:
				// - How to deal with old states (not containing all information about visibility) -> legacy state handler?
				// - restoring from old state when annotation has changed (new selection fields)?
				oSmartFilterBar.getAllFilterItems().forEach(function(oFilterItem){
					if (oPreliminaryState && oPreliminaryState.addedFilterItems && oPreliminaryState.addedFilterItems.includes(oFilterItem.getName())){
						oFilterItem.setVisibleInFilterBar();
					}
					if (oPreliminaryState && oPreliminaryState.removedFilterItems && oPreliminaryState.removedFilterItems.includes(oFilterItem.getName())){
						oFilterItem.setVisibleInFilterBar(false);
					}
				});

				// Retaining the old value of "modified" flag in the smart variant
				oSmartVariant.currentVariantSetModified(bIsCurrentVariantModifiedBeforeSetState);
			});

			// Apparently, SFB does not always correctly adapt the adapt filters count automatically. The following method has been provided espacially to trigger the same.
			// TODO: Verify, whether this is really needed (or was rather an artifact of old structure) - if yes, this API should be made public, if no, we should remove the call.
			oSmartFilterBar.refreshFiltersCount();

			bIsApplying = false;
		}

		function fnAttachStateChanged(fnHandler) {
			function handleStateChanged() {
				if (!bIsApplying) {
					fnHandler();
				}
			}

			oControlAssignedPromise.then(function () {
				oSmartFilterBar.attachFilterChange(function () {
					// Don't forward filter change event while dialog is open - changes should only be registered when dialog is closed
					if (!oSmartFilterBar.isDialogOpen()) {
						handleStateChanged();
					}
				});
				// unclear, whether this is needed, or filterChange event is anyway raised again (after dialog is closed)
				oSmartFilterBar.attachFiltersDialogClosed(handleStateChanged);

				// do we need to provide and handle change events from custom filters?
				// contra:
				// - SFB raises filteChange event also for custom filters
				// - maybe also needed to be suppressed while dialog is open
				// pro:
				// - cleaner from architectural perspective
				// - SFB cannot deal correctly with unknown custom controls
				// - existing method in extensionAPI (onCustomAppStateChange)
				mParams.oCustomFiltersWrapper.attachStateChanged(handleStateChanged);
			});
			// unclear, whether this is needed, or filterChange event is anyway raised again (after dialog is closed)
			oSmartFilterBar.attachFiltersDialogClosed(handleStateChanged);

			// do we need to provide and handle change events from custom filters?
			// contra:
			// - SFB raises filteChange event also for custom filters
			// - maybe also needed to be suppressed while dialog is open
			// pro:
			// - cleaner from architectural perspective
			// - SFB cannot deal correctly with unknown custom controls
			// - existing method in extensionAPI (onCustomAppStateChange)
			mParams.oCustomFiltersWrapper.attachStateChanged(function(){
				handleStateChanged();
				// When a custom filter value is changed by the user, not only the appState changes, but also the variant needs to be marked as dirty. For some known controls, this is
				// handled from the SFB (which informs the SVM directly). This logic is broken from architectural point of view, as it does not allow to use arbitrary own controls for
				// extension filters (which is the general idea of an extension).
				// However, when user selects a variant, custom filters also have to be restored, but that must not mark the selected variant as dirty. Ideally, this should be handled
				// by oCustomFiltersWrapper - handled here for the time being.
				// Remark: Don't confuse with handling in SmartVariantManagementWrapper - there variant gets marked dirty for changes to controls belonging to variant, but not to SFB
				// (in case of page variant management)
				if (!bIsApplying){
					oSmartFilterBar.getSmartVariant() && oSmartFilterBar.getSmartVariant().currentVariantSetModified(true);
				}
			});
		}

		function fnSetControl(oControl) {
			oSmartFilterBar = oControl;
			oControlAssignedResolve(oSmartFilterBar);
		}

		function fnGetMissingNavProperties() {
			return aMissingNavFilters;
		}

		// check waiting for initialization (like in SmartTableWrapper/SmartChartWrapper)
		// currently, whole appState restoring is waiting for initialized event from sfb - but probably it would be enough to wait for it here
		fnInitialize();

		return {
			// generic properties (provided by all state wrappers)
			getState: fnGetState,
			setState: fnSetState,
			setControl: fnSetControl,
			attachStateChanged: fnAttachStateChanged,
			// specific properties (needed to workaround direct connection between SFB and SVM)
			setSVMWrapperCallbacks: setSVMWrapperCallbacks,
			bVMConnection: oSmartFilterBar.getSmartVariant(),
			suppressSelection: oSmartFilterBar.setSuppressSelection.bind(oSmartFilterBar), // if multiple reasons for suppressing overlap, a counter (to avoid to early resume) could be implemented here
			getMissingNavProperties: fnGetMissingNavProperties
		};
	}

	return SmartFilterBarWrapper;
});
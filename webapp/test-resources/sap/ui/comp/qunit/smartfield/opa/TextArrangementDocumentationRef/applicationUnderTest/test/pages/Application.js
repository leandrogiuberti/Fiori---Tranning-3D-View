sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"test-resources/sap/ui/comp/testutils/opa/smartfield/Actions",
	"test-resources/sap/ui/comp/testutils/opa/smartfield/Assertions",
	"test-resources/sap/ui/comp/testutils/opa/valuehelpdialog/Actions"
], function (
	Opa5,
	EnterText,
	Press,
	SmartFieldActions,
	SmartFieldAssertions,
	ValueHelpDialogActions
) {
	"use strict";

	var sIdEvents = "idView--events";

	Opa5.createPageObjects({
		onTheApplicationPage: {
			actions: {
				iChangeTheValueTo: function (sId, sValue) {
					return SmartFieldActions.iEnterTextInSmartField.call(this, sId, sValue, false);
				},
				iClearTheLog: function () {
					return this.waitFor({
						id: sIdEvents,
						success: function (oList) {
							oList.removeAllItems();
						}
					});
				},
				iSelectAnItemFromValueHelp: function (sID, iIndex) {
					ValueHelpDialogActions.iOpenValueHelpDialogForInput.call(this, sID);
					return ValueHelpDialogActions.iSelectItemByIndex.call(this, iIndex);
				}
			},
			assertions: {
				iShouldSeeNumberOfRequests: function (nCount) {
					return this.waitFor({
						id: sIdEvents,
						success: function (oList) {
							var аОneTypeOfParameterRequest = oList.getItems().filter((oRequestItem, iIndex, aItems) =>
									iIndex === aItems.findIndex((oItem) => oItem.getTitle() === oRequestItem.getTitle())
								);
							Opa5.assert.strictEqual(
								аОneTypeOfParameterRequest.length,
								nCount,
								"Expected requests: " + nCount
							);
						}
					});
				},
				iShouldSeeSimpleLogEntry: function (sExpectedText, iExpectedIndex, iExpectedResults) {
					// Explicit check for null/undefined
					if (iExpectedResults === null || iExpectedResults === undefined) {
						iExpectedResults = 1; // Default positive
					}
					return this.waitFor({
						id: sIdEvents,
						success: function (oList) {
							var aItems = oList.getItems().filter(function (oItem, iIndex) {
									if (oItem.isA("sap.m.StandardListItem") && oItem.getTitle() === sExpectedText) {
										return true;
									}
									return false;
								}),
								аОneTypeOfParameterRequest = aItems.filter((oRequestItem, iIndex, aItems) =>
									iIndex === aItems.findIndex((oItem) => oItem.getTitle() === oRequestItem.getTitle())
								);
							Opa5.assert.strictEqual(аОneTypeOfParameterRequest.length, iExpectedResults, "One such request exist in log");

							// Explicit check for null/undefined
							if (iExpectedIndex !== null && iExpectedIndex !== undefined) {
								Opa5.assert.strictEqual(аОneTypeOfParameterRequest.length, iExpectedIndex,
									"Log entry found at expected index");
							}
						}
					});
				}
			}
		}
	});
});

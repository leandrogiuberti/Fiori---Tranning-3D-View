/**
 * tests for the sap.suite.ui.generic.template.lib.CommonUtils.setEnabledToolbarButtons
 */

sap.ui.define(
	[
		"testUtils/sinonEnhanced",
		"sap/suite/ui/generic/template/lib/RestoreFocusHelper",
    "sap/suite/ui/generic/template/genericUtilities/controlHelper"
	],
	function (sinon, RestoreFocusHelper, controlHelper) {
		"use strict";

		let sandbox, helper;

		QUnit.module("lib.RestoreFocusHelper", {
			beforeEach: function () {
				sandbox = sinon.sandbox.create();
        helper = new RestoreFocusHelper();
        sinon.stub(controlHelper, "focusControl", function() {});
			},
			afterEach: function () {
        controlHelper.focusControl.restore();
				sandbox.restore();
			},
		});

		QUnit.test("restoreFocus, init value is empty", function(assert) {
      helper.restoreFocus();
      assert.ok(controlHelper.focusControl.notCalled, "controlHelper.focusControl() not called");
    });

    [
      undefined,
      null,
      "",
    ].forEach(function(oControl) {
      QUnit.test(`rememberFocus, oControl = ${JSON.stringify(oControl)}`, function(assert) {
        helper.rememberFocus(oControl);
        helper.restoreFocus();
        assert.ok(controlHelper.focusControl.notCalled, "controlHelper.focusControl() not called");
      });
    })

    QUnit.test("rememberFocus and restoreFocus, works correctly", function(assert) {
      const focusId = "focusId01";
      helper.rememberFocus(focusId);
      helper.restoreFocus();
      assert.ok(controlHelper.focusControl.calledOnce, "controlHelper.focusControl() was called");
      assert.ok(controlHelper.focusControl.calledWithExactly(focusId), "controlHelper.focusControl() was called with correct parameters");
    });
	}
);

/* QUnit tests for getDeleteActionButtonVisibility */

sap.ui.define([
    "sap/suite/ui/generic/template/ObjectPage/annotationHelpers/AnnotationHelperActionButtons"
], function(AnnotationHelperActionButtons) {
    "use strict";

    QUnit.module("getDeleteActionButtonVisibility");

    QUnit.test("should return true when delete action is visible", function(assert) {
        var oContext = {/* mock context for visible case */};
        var result = AnnotationHelperActionButtons.getDeleteActionButtonVisibility(oContext);
        assert.strictEqual(result, true, "Delete button should be visible");
    });

    QUnit.test("should return false when delete action is not visible", function(assert) {
        var oContext = {/* mock context for not visible case */};
        var result = AnnotationHelperActionButtons.getDeleteActionButtonVisibility(oContext);
        assert.strictEqual(result, false, "Delete button should not be visible");
    });

    QUnit.test("should handle edge cases gracefully", function(assert) {
        var oContext = null;
        var result = AnnotationHelperActionButtons.getDeleteActionButtonVisibility(oContext);
        assert.strictEqual(result, false, "Delete button should not be visible for null context");
    });
});

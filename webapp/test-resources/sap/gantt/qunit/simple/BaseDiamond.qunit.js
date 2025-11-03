/*global QUnit */
sap.ui.define([
  "sap/gantt/simple/BaseDiamond",
  "sap/gantt/utils/GanttChartConfigurationUtils"
], function (BaseDiamond, GanttChartConfigurationUtils) {
  "use strict";

  QUnit.module("Property", {
    beforeEach: function () {
      this.oDiamond = new BaseDiamond();
    },
    afterEach: function () {
      this.oDiamond = null;
    }
  });

  QUnit.module("Function", {
    beforeEach: function () {
      this.oDiamond = new BaseDiamond({
        x: 0,
        y: 0,
        width: 30,
        height: 20,
        rowYCenter: 10
      });
      this.oDiamond._iBaseRowHeight = 48.79999923706055;
    },
    afterEach: function () {
      this.oDiamond = null;
    }
  });

  QUnit.test("getD", function (assert) {
    var sPath;
    GanttChartConfigurationUtils.setRTL(true);
    sPath = "M 0 0 l 15 10 l -15 10 l -15 -10 Z";
    assert.strictEqual(this.oDiamond.getD(), sPath, "In RTL mode, the return value is '" + sPath + "'");

    GanttChartConfigurationUtils.setRTL(false);
    sPath = "M 0 0 l 15 10 l -15 10 l -15 -10 Z";
    assert.strictEqual(this.oDiamond.getD(), sPath, "In non RTL mode, the return value is '" + sPath + "'");
  });

  QUnit.test("getD for alignshape", function (assert) {
    var sPath;

    GanttChartConfigurationUtils.setRTL(true);
    this.oDiamond.setAlignShape("Top");
    sPath = "M 0 -13 l 15 10 l -15 10 l -15 -10 Z";
    assert.strictEqual(this.oDiamond.getD(), sPath, "In RTL mode, for alignShape = top the return value is '" + sPath + "'");

    this.oDiamond.setAlignShape("Middle");
    sPath = "M 0 0 l 15 10 l -15 10 l -15 -10 Z";
    assert.strictEqual(this.oDiamond.getD(), sPath, "In RTL mode, for alignShape = middle the return value is '" + sPath + "'");

    this.oDiamond.setAlignShape("Bottom");
    sPath = "M 0 13 l 15 10 l -15 10 l -15 -10 Z";
    assert.strictEqual(this.oDiamond.getD(), sPath, "In RTL mode, for alignShape = bottom the return value is '" + sPath + "'");

    GanttChartConfigurationUtils.setRTL(false);
    this.oDiamond.setAlignShape("Top");
    sPath = "M 0 -13 l 15 10 l -15 10 l -15 -10 Z";
    assert.strictEqual(this.oDiamond.getD(), sPath, "In non RTL mode, for alignShape = top the return value is '" + sPath + "'");

    this.oDiamond.setAlignShape("Middle");
    sPath = "M 0 0 l 15 10 l -15 10 l -15 -10 Z";
    assert.strictEqual(this.oDiamond.getD(), sPath, "In non RTL mode, for alignShape = middle the return value is '" + sPath + "'");

    this.oDiamond.setAlignShape("Bottom");
    sPath = "M 0 13 l 15 10 l -15 10 l -15 -10 Z";
    assert.strictEqual(this.oDiamond.getD(), sPath, "In non RTL mode, for alignShape = bottom the return value is '" + sPath + "'");
  });


  QUnit.module("getShapeAnchors", {
    beforeEach: function () {
      this.oDiamond = new BaseDiamond({
        width: 100,
        height: 80,
		x: 50,
		y: 20,
		leftAnchorPosition : 25,
		rightAnchorPosition : 75
      });
    },
    afterEach: function () {
      this.oDiamond = null;
    }
  });

  QUnit.test("getShapeAnchors returns correct anchor positions (center-based, not left edge)", function (assert) {
    var anchors = this.oDiamond.getShapeAnchors();
    assert.deepEqual(anchors.head, {
      x: 0,
      y: 40,
      dx: 50,
      dy: 20
    }, "Head anchor uses center-based calculation, not left edge");
    assert.deepEqual(anchors.tail, {
      x: 100,
      y: 80,
      dx: 50,
      dy: 60
    }, "Tail anchor uses center-based calculation, not left edge");
  });
});

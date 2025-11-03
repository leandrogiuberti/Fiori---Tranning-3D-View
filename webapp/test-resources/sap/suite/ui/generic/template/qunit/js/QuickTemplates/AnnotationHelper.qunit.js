sap.ui.define([
    "sap/suite/ui/generic/template/js/QuickTemplates/AnnotationHelper",
    "sap/ui/model/Context",
    "sap/ui/model/json/JSONModel"
], function(AnnotationHelper, Context, JSONModel) {
    "use strict";

    QUnit.module("AnnotationHelper");

    function createContext(data) {
        var model = new JSONModel(data);
        return new Context(model, "/");
    }

    QUnit.test("_getAnnotationItem returns correct value", function(assert) {
        var context = createContext({
            "TestVocab": {
                "FieldA": {
                    "SubField": "Value1"
                }
            }
        });
        var result = AnnotationHelper._getAnnotationItem(context, "TestVocab", "FieldA", "SubField");
        assert.strictEqual(result, "Value1", "Returns correct nested value");
    });

    QUnit.test("getAnnotationItemForVocabulary parses and delegates", function(assert) {
        var context = createContext({
            "TestVocab": {
                "FieldA": {
                    "SubField": "Value2"
                }
            }
        });
        var result = AnnotationHelper.getAnnotationItemForVocabulary(context, "TestVocab/FieldA/SubField");
        assert.strictEqual(result, "Value2", "Returns correct value for full path");
    });

    QUnit.test("getAnnotationFirstItemFromVocabularies returns first non-skipped item", function(assert) {
        var context = createContext({
            "Vocab1": { "Field": { "Sub": "A" } },
            "Vocab2": { "Field": { "Sub": "B" } }
        });
        var skipObj = { String: "A" };
        var stub = AnnotationHelper._isEqualValues;
        AnnotationHelper._isEqualValues = function(a, b) { return b === "A"; };
        var result = AnnotationHelper.getAnnotationFirstItemFromVocabularies(context, ["Vocab1/Field/Sub", "Vocab2/Field/Sub"], skipObj);
        assert.strictEqual(result, "B", "Skips first and returns second");
        AnnotationHelper._isEqualValues = stub;
    });

    QUnit.test("_resolveBadgeImgUrl returns image url", function(assert) {
        var context = createContext({
            "com.sap.vocabularies.UI.v1.Badge": {
                "ImageUrl": { "Value": "img.png" }
            }
        });
        var result = AnnotationHelper._resolveBadgeImgUrl(context);
        assert.deepEqual(result, "img.png", "Returns image url object");
    });

    QUnit.test("_resolveBadgeIconUrl returns icon url or default", function(assert) {
        var context = createContext({});
        var result = AnnotationHelper._resolveBadgeIconUrl(context);
        assert.strictEqual(result, "sap-icon://form", "Returns default icon url if not found");
    });

    QUnit.test("_getAnnotationObject handles various formats", function(assert) {
        var obj1 = { Label: { Path: "labelPath" } };
        var obj2 = { Value: { Path: "valuePath" } };
        var obj3 = { String: "str" };
        var obj4 = { Path: "directPath" };
        var obj5 = "plainString";
        assert.deepEqual(AnnotationHelper._getAnnotationObject(obj1), { Path: "labelPath" }, "Label format");
        assert.deepEqual(AnnotationHelper._getAnnotationObject(obj2), { Path: "valuePath" }, "Value format");
        assert.deepEqual(AnnotationHelper._getAnnotationObject(obj3), { String: "str" }, "String format");
        assert.deepEqual(AnnotationHelper._getAnnotationObject(obj4), { Path: "directPath" }, "Path format");
        assert.deepEqual(AnnotationHelper._getAnnotationObject(obj5), { String: "plainString" }, "Plain string format");
    });

    QUnit.test("_isEqualValues compares objects", function(assert) {
        var obj1 = { String: "A" }, obj2 = { String: "A" }, obj3 = { String: "B" };
        assert.ok(AnnotationHelper._isEqualValues(obj1, obj2), "Equal strings");
        assert.notOk(AnnotationHelper._isEqualValues(obj1, obj3), "Different strings");
    });

    QUnit.test("_createBadgeContext returns context with correct data", function(assert) {
        var context = AnnotationHelper._createBadgeContext(
            { String: "img.png" },
            { String: "icon.png" },
            { String: "title" },
            { String: "type" },
            { String: "subtitle" }
        );
        var data = context.getObject();
        assert.strictEqual(data.ImageUrl.String, "img.png", "ImageUrl set");
        assert.strictEqual(data.Title.String, "title", "Title set");
        assert.strictEqual(data.TypeName.String, "type", "TypeName set");
        assert.strictEqual(data.SubTitle.String, "subtitle", "SubTitle set");
    });

    QUnit.test("getTooltip returns string value", function(assert) {
        var value = { String: "Tooltip text" };
        var result = AnnotationHelper.getTooltip(value);
        assert.strictEqual(result, "Tooltip text", "Returns tooltip string");
    });

    // ...additional tests for other functions can be added similarly...
});

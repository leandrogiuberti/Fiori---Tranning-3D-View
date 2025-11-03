// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for ushell-lib utils.js
 */
sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/base/util/ObjectPath",
    "sap/ui/core/theming/Parameters",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/utils",
    "sap/ushell/test/utils",
    "sap/ushell/ApplicationType",
    "sap/ui/Device",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/ushell/services/PersonalizationV2",
    "sap/ui/VersionInfo",
    "sap/ushell/resources" // required for "sap.ushell.resources.i18n"
], (
    Localization,
    ObjectPath,
    ThemingParameters,
    Config,
    Container,
    utils,
    testUtils,
    ApplicationType,
    Device,
    jQuery,
    Log,
    PersonalizationV2,
    VersionInfo,
    ushellResources
) => {
    "use strict";

    const { KeyCategory, WriteFrequency } = PersonalizationV2.prototype;

    /* global sinon, QUnit */
    const sandbox = sinon.createSandbox({});

    const O_KNOWN_APPLICATION_TYPES = ApplicationType.enum;

    // set the language as formatDate tests check for English texts
    Localization.setLanguage("en-US");

    QUnit.module("sap/ushell/utils.js", {
        afterEach: function () {
            sandbox.restore();
            testUtils.restoreSpies(
                Storage.prototype.setItem,
                utils.getPrivateEpcm,
                utils.hasNativeNavigationCapability,
                utils.hasNativeLogoutCapability,
                utils.hasNavigationModeCapability,
                utils.hasFLPReadyNotificationCapability,
                Log.error,
                utils.getParameterValueBoolean
            );
        }
    });

    QUnit.test("utils.isApplicationTypeEmbeddedInIframe", function (assert) {
        const oExpectedResult = {
            URL: false,
            WDA: true,
            NWBC: true,
            TR: true,
            WCF: true,
            SAPUI5: false
        };

        const aExpectedItemsInFixture = Object.keys(O_KNOWN_APPLICATION_TYPES)
            .map((sKey) => {
                return O_KNOWN_APPLICATION_TYPES[sKey];
            })
            .sort();

        assert.deepEqual(
            Object.keys(oExpectedResult).sort(),
            aExpectedItemsInFixture,
            "Test prerequisite is fulfilled: all application types are tested for #isApplicationTypeEmbeddedInIframe"
        );

        Object.keys(oExpectedResult).forEach((sApplicationType) => {
            const bExpected = oExpectedResult[sApplicationType];
            assert.strictEqual(
                utils.isApplicationTypeEmbeddedInIframe(sApplicationType, (sApplicationType === "WDA")),
                bExpected,
                `returns ${bExpected} for ${sApplicationType}`
            );
        });
    });

    QUnit.test("utils.isDefined returns as expected", function (assert) {
        const testObject = {
            definedAndFalse: false,
            definedAndTrue: true,
            definedAndString: "ok"
        };
        const isDefinedFalse = utils.isDefined(testObject.definedAndFalse);
        const isDefinedTrue = utils.isDefined(testObject.definedAndTrue);
        const isDefinedString = utils.isDefined(testObject.definedAndString);
        const notDefined = utils.isDefined(testObject.notDefined);

        assert.ok(isDefinedFalse, "expected that the property is defined if value is false");
        assert.ok(isDefinedTrue, "expected that the property is defined if value true");
        assert.ok(isDefinedString, "expected that the property is defined if value is a string");
        assert.ok(!notDefined, "expected that the property was not defined if value is undefined");
    });

    QUnit.test("utils.Error; create and expect tracing", function (assert) {
        const oLogMock = testUtils.createLogMock()
            .error("UShell error created", null, "component");
        utils.Error("UShell error created", "component");
        oLogMock.verify();
    });

    QUnit.test("utils.Error; check types", function (assert) {
        const oError = new utils.Error("UShell error created", "component");
        assert.ok(oError instanceof Error, "expected instance of Error");
        assert.ok(oError instanceof utils.Error, "expected instance of utils.Error");
    });

    QUnit.test("utils.Error: toString", function (assert) {
        const oError = new utils.Error("UShell error created", "component");
        assert.strictEqual(oError.toString(), "sap.ushell.utils.Error: UShell error created", "toString");
    });

    QUnit.test("utils.Error: throw and catch", function (assert) {
        const oErrorMock = new utils.Error("UShell error created", "component");
        try {
            throw oErrorMock;
        } catch (oError) {
            assert.strictEqual(oError, oErrorMock);
            assert.strictEqual(oError.message, "UShell error created");
        }
    });

    QUnit.test("utils.calcOrigin", function (assert) {
        let origin = window.location.origin;
        if (!window.location.origin) {
            origin = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ""}`;
        }
        const sCalcorigin = utils.calculateOrigin(window.location);
        assert.ok(sCalcorigin.length > 0, "not trivial");
        assert.equal(sCalcorigin, origin, "correct url");
    });

    QUnit.test("utils.calcOrigin no origin", function (assert) {
        const sCalcorigin = utils.calculateOrigin({ hostname: "x.y.z", protocol: "http:", port: "8080" });
        assert.equal(sCalcorigin, "http://x.y.z:8080");
    });

    QUnit.test("utils.calcOrigin url construction, no port", function (assert) {
        const sCalcorigin = utils.calculateOrigin({ hostname: "x.y.z", protocol: "http:" });
        assert.equal(sCalcorigin, "http://x.y.z", "url ok ");
    });

    QUnit.test("utils.calcOrigin origin used if present", function (assert) {
        const sCalcorigin = utils.calculateOrigin({ origin: "httpX://sonicht:8080", hostname: "x.y.z", protocol: "http:", port: "8080" });
        assert.equal(sCalcorigin, "httpX://sonicht:8080", "origin used if present");
    });

    QUnit.test("utils.calcOrigin href used if origin/protocol/hostename not present", function (assert) {
        const sCalcorigin = utils.calculateOrigin({ hostname: "x.y.z", href: "https://this.is.it:3600" });
        assert.equal(sCalcorigin, "https://this.is.it:3600", "href used if present");
    });

    QUnit.test("utils.hasNativeNavigationCapability detect NWBC v6.0+", function (assert) {
        assert.strictEqual(utils.hasNativeNavigationCapability(), false, "returns false (not in NWBC)");
    });

    QUnit.test("utils.hasNativeLogoutCapability detect NWBC v6.0+", function (assert) {
        assert.strictEqual(utils.hasNativeLogoutCapability(), false, "returns false (not in NWBC)");
    });

    QUnit.test("utils.hasNavigationModeCapability detect NWBC v6.0+", function (assert) {
        assert.strictEqual(utils.hasNavigationModeCapability(), false, "returns false (not in NWBC)");
    });

    QUnit.test("utils.hasFLPReadyNotificationCapability detect NWBC v6.0+", function (assert) {
        assert.strictEqual(utils.hasFLPReadyNotificationCapability(), false, "returns false (not in NWBC)");
    });

    QUnit.test("utils.has*Capability: ", function (assert) {
        [{
            sMockedGetNwbcFeatureBits: "0",
            expectedHasNativeNavigationCapability: false, // first (least significant) bit
            expectedHasNativeLogoutCapability: false, // second (least significant) bit
            expectedHasNavigationModeCapability: false,
            expectedHasFLPReadyNotificationCapability: false
        }, {
            sMockedGetNwbcFeatureBits: "1",
            expectedHasNativeNavigationCapability: true,
            expectedHasNativeLogoutCapability: false,
            expectedHasNavigationModeCapability: false,
            expectedHasFLPReadyNotificationCapability: false
        }, {
            sMockedGetNwbcFeatureBits: "2",
            expectedHasNativeNavigationCapability: false,
            expectedHasNativeLogoutCapability: true,
            expectedHasNavigationModeCapability: false,
            expectedHasFLPReadyNotificationCapability: false
        }, {
            sMockedGetNwbcFeatureBits: "3",
            expectedHasNativeNavigationCapability: true,
            expectedHasNativeLogoutCapability: true,
            expectedHasNavigationModeCapability: false,
            expectedHasFLPReadyNotificationCapability: false
        }, {
            sMockedGetNwbcFeatureBits: "4",
            expectedHasNativeNavigationCapability: false,
            expectedHasNativeLogoutCapability: false,
            expectedHasNavigationModeCapability: true,
            expectedHasFLPReadyNotificationCapability: false
        }, {
            sMockedGetNwbcFeatureBits: "5",
            expectedHasNativeNavigationCapability: true,
            expectedHasNativeLogoutCapability: false,
            expectedHasNavigationModeCapability: true,
            expectedHasFLPReadyNotificationCapability: false
        }, {
            sMockedGetNwbcFeatureBits: "6",
            expectedHasNativeNavigationCapability: false,
            expectedHasNativeLogoutCapability: true,
            expectedHasNavigationModeCapability: true,
            expectedHasFLPReadyNotificationCapability: false
        }, {
            sMockedGetNwbcFeatureBits: "7",
            expectedHasNativeNavigationCapability: true,
            expectedHasNativeLogoutCapability: true,
            expectedHasNavigationModeCapability: true,
            expectedHasFLPReadyNotificationCapability: false
        }, {
            sMockedGetNwbcFeatureBits: "8",
            expectedHasNativeNavigationCapability: false,
            expectedHasNativeLogoutCapability: false,
            expectedHasNavigationModeCapability: false,
            expectedHasFLPReadyNotificationCapability: true
        }, {
            sMockedGetNwbcFeatureBits: "9",
            expectedHasNativeNavigationCapability: true,
            expectedHasNativeLogoutCapability: false,
            expectedHasNavigationModeCapability: false,
            expectedHasFLPReadyNotificationCapability: true
        }, {
            sMockedGetNwbcFeatureBits: "A",
            expectedHasNativeNavigationCapability: false,
            expectedHasNativeLogoutCapability: true,
            expectedHasNavigationModeCapability: false,
            expectedHasFLPReadyNotificationCapability: true
        }, {
            sMockedGetNwbcFeatureBits: "B",
            expectedHasNativeNavigationCapability: true,
            expectedHasNativeLogoutCapability: true,
            expectedHasNavigationModeCapability: false,
            expectedHasFLPReadyNotificationCapability: true
        }, {
            sMockedGetNwbcFeatureBits: "C",
            expectedHasNativeNavigationCapability: false,
            expectedHasNativeLogoutCapability: false,
            expectedHasNavigationModeCapability: true,
            expectedHasFLPReadyNotificationCapability: true
        }, {
            sMockedGetNwbcFeatureBits: "D",
            expectedHasNativeNavigationCapability: true,
            expectedHasNativeLogoutCapability: false,
            expectedHasNavigationModeCapability: true,
            expectedHasFLPReadyNotificationCapability: true
        }, {
            sMockedGetNwbcFeatureBits: "E",
            expectedHasNativeNavigationCapability: false,
            expectedHasNativeLogoutCapability: true,
            expectedHasNavigationModeCapability: true,
            expectedHasFLPReadyNotificationCapability: true
        }, {
            sMockedGetNwbcFeatureBits: "F",
            expectedHasNativeNavigationCapability: true,
            expectedHasNativeLogoutCapability: true,
            expectedHasNavigationModeCapability: true,
            expectedHasFLPReadyNotificationCapability: true
        }, {
            sMockedGetNwbcFeatureBits: "31",
            expectedHasNativeNavigationCapability: true,
            expectedHasNativeLogoutCapability: false,
            expectedHasNavigationModeCapability: false,
            expectedHasFLPReadyNotificationCapability: false
        }].forEach((oFixture) => {
            // Arrange
            sinon.stub(utils, "getPrivateEpcm").returns({
                getNwbcFeatureBits: sinon.stub().returns(oFixture.sMockedGetNwbcFeatureBits)
            });

            // Act & Assert
            assert.strictEqual(utils.hasNativeNavigationCapability(),
                oFixture.expectedHasNativeNavigationCapability,
                `utils.hasNativeNavigationCapability returned expected result when getNwbcFeatureBits returns ${oFixture.sMockedGetNwbcFeatureBits}`);

            assert.strictEqual(utils.hasNativeLogoutCapability(),
                oFixture.expectedHasNativeLogoutCapability,
                `utils.hasNativeLogoutCapability returned expected result when getNwbcFeatureBits returns ${oFixture.sMockedGetNwbcFeatureBits}`);

            assert.strictEqual(utils.hasNavigationModeCapability(),
                oFixture.expectedHasNavigationModeCapability,
                `utils.hasNavigationModeCapability returned expected result when getNwbcFeatureBits returns ${oFixture.sMockedGetNwbcFeatureBits}`);

            assert.strictEqual(utils.hasFLPReadyNotificationCapability(),
                oFixture.expectedHasFLPReadyNotificationCapability,
                `utils.hasFLPReadyNotificationCapability returned expected result when getNwbcFeatureBits returns ${oFixture.sMockedGetNwbcFeatureBits}`);

            utils.getPrivateEpcm.restore();
        });
    });

    [{
        testDescription: "getPrivateEpcm returns undefined",
        returns: undefined,
        expectedHasNativeNavigationCapability: false
    }, {
        testDescription: "getNwbcFeatureBits throws",
        returns: { getNwbcFeatureBits: sinon.stub().throws(new Error("Some error")) },
        expectedHasNativeNavigationCapability: false
    }].forEach((oFixture) => {
        QUnit.test(`utils.hasNativeNavigationCapability returns expected result when ${oFixture.testDescription}`, function (assert) {
            sinon.stub(utils, "getPrivateEpcm").returns(oFixture.returns);

            assert.strictEqual(utils.hasNativeNavigationCapability(),
                oFixture.expectedHasNativeNavigationCapability, "returned expected result");
            utils.getPrivateEpcm.restore();
        });
    });

    [
        "hasNativeNavigationCapability",
        "hasNativeLogoutCapability",
        "hasNavigationModeCapability",
        "hasFLPReadyNotificationCapability"
    ].forEach((sMethod) => {
        QUnit.test(`utils.${sMethod} logs an error when window.epcm.getNwbcFeatureBits throws`, function (assert) {
            sinon.stub(Log, "error");
            sinon.stub(utils, "getPrivateEpcm").returns({
                getNwbcFeatureBits: sinon.stub().throws(new Error("Some error"))
            });

            utils[sMethod]();

            assert.ok(Log.error.calledOnce === true, "Log.error was called once");

            utils.getPrivateEpcm.restore();
        });
    });

    QUnit.test("utils.isNativeWebGuiNavigation returns true if TR in resolved navigation target and FDC detected", function (assert) {
        sinon.stub(utils, "getPrivateEpcm").returns({
            getNwbcFeatureBits: sinon.stub().returns("3")
        });

        const bResult = utils.isNativeWebGuiNavigation({
            applicationType: "TR",
            url: "https://someserver.corp.com:1234/sap/bc/ui2/nwbc/~canvas;window=app/transaction/APB_LPD_CALL_TRANS" +
                "?P_APPL=FS2_TEST&P_OBJECT=&P_PNP=&P_ROLE=FS2SAMAP&P_SELSCR=X&P_TCODE=SU01&DYNP_OKCODE=onli&sap-client=120&sap-language=EN"
        });
        assert.strictEqual(bResult, true, "returns true");
        utils.getPrivateEpcm.restore();
    });

    QUnit.test("utils.Map: basics", function (assert) {
        const oMap = new utils.Map();
        oMap.put("key", "value");
        assert.strictEqual(oMap.containsKey("key"), true);
        assert.strictEqual(oMap.containsKey("something"), false);
        assert.strictEqual(oMap.get("key"), "value");
        assert.strictEqual(oMap.get("something"), undefined);
        oMap.put("get", "oh");
        assert.strictEqual(oMap.get("get"), "oh");
        oMap.put("hasOwnProperty", "oh");
        assert.strictEqual(oMap.get("hasOwnProperty"), "oh");
        try {
            Object.prototype.foo = "bar"; // eslint-disable-line no-extend-native
            assert.ok(!oMap.containsKey("foo"));
        } finally {
            delete Object.prototype.foo;
        }
    });

    QUnit.test("utils.Map remove", function (assert) {
        const oMap = new utils.Map();
        oMap.put("key", "value");
        assert.strictEqual(oMap.containsKey("key"), true);

        oMap.remove("key");
        assert.strictEqual(oMap.containsKey("key"), false);
        assert.strictEqual(oMap.get("key"), undefined);

        // removing something unknown should not throw an exception
        oMap.remove("something");
    });

    QUnit.test("utils.Map: keys", function (assert) {
        const oMap = new utils.Map();
        const fnKeys = sinon.spy(Object, "keys");
        oMap.put("key", "value");
        const aKeys = oMap.keys();
        assert.deepEqual(aKeys, ["key"]);
        assert.ok(fnKeys.calledOnce);
        assert.ok(fnKeys.returned(aKeys));
    });

    QUnit.test("utils.Map: toString", function (assert) {
        const oMap = new utils.Map();
        assert.strictEqual("sap.ushell.utils.Map({})", oMap.toString());

        oMap.put("key", "value");
        assert.strictEqual("sap.ushell.utils.Map({\"key\":\"value\"})", oMap.toString());
    });

    QUnit.test("utils.Map: error handling", function (assert) {
        const oMap = new utils.Map();

        assert.throws(
            () => { oMap.put({}, "foo"); },
            /Not a string key: \[object Object\]/
        );
        assert.throws(
            () => { oMap.containsKey({}); },
            /Not a string key: \[object Object\]/
        );
        assert.throws(
            () => { oMap.get({}); },
            /Not a string key: \[object Object\]/
        );
    });

    QUnit.test("utils.Map: put twice", function (assert) {
        const oMap = new utils.Map();
        let oPrevious;

        oPrevious = oMap.put("foo", window);
        assert.strictEqual(oPrevious, undefined);

        oPrevious = oMap.put("foo", sinon);
        assert.strictEqual(oPrevious, window);
    });

    QUnit.test("localStorageSetItem in Safari private browsing mode", function (assert) {
        const sErrorMessage = "QUOTA_EXCEEDED_ERR";
        const oLogMock = testUtils.createLogMock()
            .filterComponent("utils")
            .warning(`Error calling localStorage.setItem(): ${sErrorMessage}`, null,
                "sap.ushell.utils");
        sinon.stub(Storage.prototype, "setItem");
        utils.localStorageSetItem("foo", "bar");
        assert.ok(Storage.prototype.setItem.calledWithExactly("foo", "bar"),
            "localStorage.setItem called for test");

        Storage.prototype.setItem.throws(new Error(sErrorMessage));
        utils.localStorageSetItem("foo", "bar");
        oLogMock.verify();
    });

    QUnit.test("localStorageSetItem eventing to same window", function (assert) {
        const fnStorageListener = sinon.spy((oStorageEvent) => {
            assert.strictEqual(oStorageEvent.key, "foo", "Key same window");
            assert.strictEqual(oStorageEvent.newValue, "bar", "Value same window");
        });

        sinon.stub(Storage.prototype, "setItem");

        window.addEventListener("storage", fnStorageListener);
        utils.localStorageSetItem("foo", "bar", true);

        assert.ok(fnStorageListener.calledOnce, "Listener called (once)");
        window.removeEventListener("storage", fnStorageListener);
    });

    QUnit.test("getParameterValueBoolean : ", function (assert) {
        sandbox.stub(URLSearchParams.prototype, "get").callsFake(() => { return undefined; });
        sandbox.stub(URLSearchParams.prototype, "getAll").callsFake(() => { return undefined; });
        const val = utils.getParameterValueBoolean("sap-accessibility");
        assert.equal(val, undefined, " value is undefined");
    });

    ["X", "x", "tRue", "TRUE", "true"].forEach((sVal) => {
        QUnit.test(`getParameterValueBoolean : trueish${sVal}`, function (assert) {
            sandbox.stub(URLSearchParams.prototype, "get").callsFake(() => { return undefined; });
            sandbox.stub(URLSearchParams.prototype, "getAll").callsFake((sParam) => {
                if (sParam === "sap-accessibility") {
                    return [sVal, "false"];
                }
                return false;
            });
            const val = utils.getParameterValueBoolean("sap-accessibility");
            assert.equal(val, true, " value is true");
        });
    });

    ["", "false", "FALSE", "False"].forEach((sVal) => {
        QUnit.test(`getParameterValueBoolean : falsish${sVal}`, function (assert) {
            sandbox.stub(URLSearchParams.prototype, "get").callsFake(() => { return undefined; });
            sandbox.stub(URLSearchParams.prototype, "getAll").callsFake((sParam) => {
                if (sParam === "sap-accessibility") {
                    return [sVal];
                }
                return false;
            });
            const val = utils.getParameterValueBoolean("sap-accessibility");
            assert.equal(val, false, " value is false");
        });
    });

    ["fatruelse", "WAHR", "falsch"].forEach((sVal) => {
        QUnit.test(`getParameterValueBoolean : undefined${sVal}`, function (assert) {
            sandbox.stub(URLSearchParams.prototype, "get").callsFake(() => { return undefined; });
            sandbox.stub(URLSearchParams.prototype, "getAll").callsFake((sParam) => {
                if (sParam === "sap-accessibility") {
                    return [sVal];
                }
                return false;
            });
            const val = utils.getParameterValueBoolean("sap-accessibility");
            assert.equal(val, undefined, " value is undefined");
        });
    });

    QUnit.test("getFormFactor", function (assert) {
        const oOriginalSystem = Device.system;

        function testFormFactor (oSystem, sExpected) {
            oSystem.SYSTEMTYPE = oOriginalSystem.SYSTEMTYPE;
            Device.system = oSystem;
            assert.strictEqual(utils.getFormFactor(), sExpected);
        }

        testFormFactor({ desktop: true }, "desktop");
        testFormFactor({ tablet: true }, "tablet");
        testFormFactor({ phone: true }, "phone");
        testFormFactor({ tablet: true, phone: true }, "tablet"); // Phablet?
        testFormFactor({ desktop: true, tablet: true }, "desktop"); // MS Surface Pro?
        testFormFactor({ desktop: true, tablet: true, phone: true }, "desktop"); // ?
        testFormFactor({}, undefined);

        Device.system = oOriginalSystem;
    });

    QUnit.test("call: sync call", function (assert) {
        let bCalled = false;
        utils.call(
            () => {
                // this shall be called synchronously
                bCalled = true;
                assert.ok(true);
            },
            (oError) => {
                // this MUST NOT be called
                assert.strictEqual(oError.message, "");
                assert.ok(false);
            },
            false
        );
        assert.ok(bCalled);
    });

    QUnit.test("call: async call", function (assert) {
        const done = assert.async();
        let bCalled = false;
        utils.call(
            () => {
                // this shall be called asynchronously
                bCalled = true;
                assert.ok(true);
            },
            (oError) => {
                // this MUST NOT be called
                assert.strictEqual(oError.message, "");
                assert.ok(false);
            },
            true
        );
        assert.ok(!bCalled); // not yet called

        setTimeout(() => {
            assert.ok(bCalled); // now!
            done();
        }, 100);
    });

    QUnit.test("call: try/catch", function (assert) {
        const done = assert.async();
        const sText = "intentionally failed";
        utils.call(
            () => { throw new Error(sText); },
            (oError) => {
                // this shall be called
                assert.strictEqual(oError.message, sText);
                assert.ok(true);
            },
            false
        );

        utils.call(
            () => { throw new Error(sText); },
            (oError) => {
                // this shall be called
                assert.strictEqual(oError.message, sText);
                assert.ok(true);
                done();
            },
            true
        );
    });

    QUnit.test("call: error with failure handler", function (assert) {
        const oError = new Error("intentionally failed");
        utils.call(
            () => { throw oError; },
            null,
            false
        );
        assert.ok(true, "call caught exception");
    });

    QUnit.test("call: error with failure handler", function (assert) {
        const oError = new Error("intentionally failed");
        utils.call(
            () => { throw oError; },
            (oError) => { assert.strictEqual(oError.message, "intentionally failed", "As expected"); },
            false
        );
    });

    QUnit.test("invokeUnfoldingArrayArguments empty array", function (assert) {
        const fnx = sinon.stub().resolves("A");
        const pResult = utils.invokeUnfoldingArrayArguments(fnx, [[]]).then((res) => {
            assert.deepEqual(res, [], "result ok");
        });
        assert.equal(fnx.called, false, "not called");
        return pResult;
    });

    QUnit.test("invokeUnfoldingArrayArguments simple invoke", async function (assert) {
        const fnx = sinon.stub().resolves("A");
        const res = await utils.invokeUnfoldingArrayArguments(fnx, ["a", "b", "c"]);

        assert.ok(res, "A", "original promise returned");
        assert.deepEqual(fnx.args[0], ["a", "b", "c"], " arguments ok");
    });

    QUnit.test("invokeUnfoldingArrayArguments array invoke, error, wrong arg", async function (assert) {
        const fnx = sinon.stub().resolves("A");
        try {
            await utils.invokeUnfoldingArrayArguments(fnx, [["c1", "c2", "c3"]]);
            assert.ok(false, "should not get here");
        } catch (oError) {
            assert.ok(true, "got exception");
        }
    });

    QUnit.test("invokeUnfoldingArrayArguments array invoke, trivial case", async function (assert) {
        const fnx = sinon.stub();
        fnx.onCall(0).resolves("A1");
        fnx.onCall(1).resolves("A2");
        fnx.onCall(2).resolves("A3");
        fnx.onCall(3).resolves("A4");

        const res = await utils.invokeUnfoldingArrayArguments(fnx, [[["c1"], ["c2"], ["c3"]]]);

        assert.deepEqual(res, [["A1"], ["A2"], ["A3"]], "original promise returned");
        assert.deepEqual(fnx.args[0], ["c1"], " arguments ok");
        assert.deepEqual(fnx.args[1], ["c2"], " arguments ok");
        assert.deepEqual(fnx.args[2], ["c3"], " arguments ok");
    });

    QUnit.test("invokeUnfoldingArrayArguments array invoke, multiple return arguments, multiple input arguments", async function (assert) {
        const fnx = sinon.stub().resolves("C");
        const res = await utils.invokeUnfoldingArrayArguments(fnx, [[["c1", "p2"], ["c2", "p22"], ["c3", "p33"]]]);

        assert.deepEqual(res, [["C"], ["C"], ["C"]], "original promise returned");
        assert.deepEqual(fnx.args[0], ["c1", "p2"], " arguments  1 ok");
        assert.deepEqual(fnx.args[1], ["c2", "p22"], " arguments 2 ok");
        assert.deepEqual(fnx.args[2], ["c3", "p33"], " arguments 3 ok");
    });

    QUnit.test("invokeUnfoldingArrayArguments this vs that", async function (assert) {
        const oThat = {};
        async function fnFunction () {
            // assert
            assert.strictEqual(this, oThat, "function was called with correct this");
            return "C";
        }

        // code under test
        await utils.invokeUnfoldingArrayArguments
            .call(oThat, fnFunction, [[["a"], ["b"]]]);
    });

    QUnit.test("invokeUnfoldingArrayArguments array invoke, reject", async function (assert) {
        const fnx = sinon.stub();
        fnx.onCall(0).resolves("A1");
        fnx.onCall(1).rejects(new Error("not me"));
        fnx.onCall(2).resolves("A3");
        fnx.onCall(3).resolves("A4");
        try {
            await utils.invokeUnfoldingArrayArguments(fnx, [[["c1"], ["c2"], ["c3"]]]);
            assert.ok(false, "should not get here");
        } catch {
            assert.ok(true, "got here");
        }

        assert.deepEqual(fnx.args[0], ["c1"], " arguments ok");
        assert.deepEqual(fnx.args[1], ["c2"], " arguments ok");
        assert.deepEqual(fnx.args[2], ["c3"], " arguments ok");
    });

    QUnit.test("verify format Date", function (assert) {
        const stub = sinon.stub(utils, "_getCurrentDate").returns(new Date("Thu Dec 30 2015 17:49:41 GMT+0200 (Jerusalem Standard Time)"));
        assert.equal(utils.formatDate(new Date("Thu Dec 30 2015 17:49:41 GMT+0200 (Jerusalem Standard Time)")), "Just now");
        assert.equal(utils.formatDate(new Date("Thu Dec 30 2015 11:49:41 GMT+0200 (Jerusalem Standard Time)")), "6 hours ago");
        assert.equal(utils.formatDate(new Date("Thu Dec 29 2015 11:49:41 GMT+0200 (Jerusalem Standard Time)")), "1 day ago");
        assert.equal(utils.formatDate(new Date("Thu Dec 24 2015 11:49:41 GMT+0200 (Jerusalem Standard Time)")), "6 days ago");
        assert.equal(utils.formatDate(new Date("Thu Dec 30 2015 17:39:41 GMT+0200 (Jerusalem Standard Time)")), "10 minutes ago");
        assert.equal(utils.formatDate(new Date("Thu Dec 30 2015 18:39:41 GMT+0300 (Jerusalem Daylight Time)")), "10 minutes ago");
        stub.restore();
    });

    QUnit.test("test - check if group has tiles and links", function (assert) {
        let aTiles = [{ id: "tile1", isTileIntentSupported: true }, { id: "tile1", isTileIntentSupported: true }];
        let aLinks = [{ id: "link1", isTileIntentSupported: true }];
        let bHasContent = false;

        bHasContent = utils.groupHasVisibleTiles(aTiles, aLinks);
        assert.ok(bHasContent === true, "group has tiles and links");

        aLinks = [];
        bHasContent = utils.groupHasVisibleTiles(aTiles, aLinks);
        assert.ok(bHasContent === true, "group has tiles");

        aTiles = [];
        bHasContent = utils.groupHasVisibleTiles(aTiles, aLinks);
        assert.ok(bHasContent === false, "group has no tiles or links");

        aLinks = [{ id: "link1", isTileIntentSupported: true }];
        bHasContent = utils.groupHasVisibleTiles(aTiles, aLinks);
        assert.ok(bHasContent === true, "group has links");
    });

    [{
        testDescription: "Call moveElementInsideOfArray with correct parameters - Element2 to index 4",
        aInputArray: [0, 1, 2, 3, 4, 5],
        nIndexOfElement: 2,
        nNewIdx: 4,
        oExpectedOutput: [0, 1, 3, 4, 2, 5]
    }, {
        testDescription: "Call moveElementInsideOfArray with correct parameters - Element4 to index 1",
        aInputArray: [0, 1, 2, 3, 4, 5],
        nIndexOfElement: 4,
        nNewIdx: 1,
        oExpectedOutput: [0, 4, 1, 2, 3, 5]
    }, {
        testDescription: "Call moveElementInsideOfArray with correct parameters - Element2 to index 5",
        aInputArray: [0, 1, 2, 3, 4, 5],
        nIndexOfElement: 2,
        nNewIdx: 5,
        oExpectedOutput: [0, 1, 3, 4, 5, 2]
    }, {
        testDescription: "Call moveElementInsideOfArray with correct parameters - but with same index",
        aInputArray: [0, 1, 2, 3, 4, 5],
        nIndexOfElement: 2,
        nNewIdx: 2,
        oExpectedOutput: [0, 1, 2, 3, 4, 5]
    }, {
        testDescription: "Call moveElementInsideOfArray with incorrect parameters - No operation necessary (source and target are equal)",
        aInputArray: [0],
        nIndexOfElement: 0,
        nNewIdx: 0,
        oExpectedOutput: [0]
    }].forEach((oFixture) => {
        QUnit.test(`moveElementInsideOfArray: ${oFixture.testDescription}`, function (assert) {
            // Act & Assert
            assert.deepEqual(utils.moveElementInsideOfArray(oFixture.aInputArray, oFixture.nIndexOfElement, oFixture.nNewIdx), oFixture.oExpectedOutput, "Expected output");
        });
    });

    [{
        testDescription: "negative source index",
        input: [[0, 1, 2, 3, 4, 5, 6], -1, 5],
        expectedExceptionMsg: "Incorrect input parameters passed"
    }, {
        testDescription: "no input array is given",
        input: [{}, 2, 5],
        expectedExceptionMsg: "Incorrect input parameters passed"
    }, {
        testDescription: "empty input array",
        input: [[], 2, 5],
        expectedExceptionMsg: "Incorrect input parameters passed"
    }, {
        testDescription: "empty input array, invalid index",
        input: [[], 0, 0],
        expectedExceptionMsg: "Incorrect input parameters passed"
    }, {
        testDescription: "source index is undefined",
        input: [[0, 1, 2, 3, 4, 5, 6], undefined, 3],
        expectedExceptionMsg: "Incorrect input parameters passed"
    }, {
        testDescription: "target index is undefined",
        input: [[0, 1, 2, 3, 4, 5, 6], 3, undefined],
        expectedExceptionMsg: "Incorrect input parameters passed"
    }, {
        testDescription: "source index too high",
        input: [[0, 1, 2, 3, 4, 5, 6], 7, 0],
        expectedExceptionMsg: "Index out of bounds"
    }, {
        testDescription: "target index too high",
        input: [[0, 1, 2, 3, 4, 5, 6], 0, 7],
        expectedExceptionMsg: "Index out of bounds"
    }].forEach((oFixture) => {
        QUnit.test(`moveElementInsideOfArray throws as ${oFixture.testDescription}`, function (assert) {
            assert.throws(
                () => {
                    utils.moveElementInsideOfArray.apply(null, oFixture.input);
                },
                oFixture.expectedExceptionMsg
            );
        });
    });

    [{
        testDescription: "first Generated ID is unique (empty array)",
        aExistingIds: [],
        expectedGeneratedId: "000-000-000"
    }, {
        testDescription: "first Generated ID is unique (all IDs differ)",
        aExistingIds: ["AAA-000-000", "BBB-000-000", "CCC-000-000", "DDD-000-000", "EEE-000-000"],
        expectedGeneratedId: "000-000-000"
    }, {
        testDescription: "Second ID is Unique",
        aExistingIds: ["000-000-000"],
        expectedGeneratedId: "100-000-000"
    }, {
        testDescription: "5th ID is Unique",
        aExistingIds: ["000-000-000", "100-000-000", "200-000-000", "300-000-000"],
        expectedGeneratedId: "400-000-000"
    }].forEach((oFixture) => {
        QUnit.test(`generateUniqueId: ${oFixture.testDescription}`, function (assert) {
            let sResult;
            let iUidCount = -1;

            // arrange
            function isUniqueIdCallback (sProposedGeneratedId) {
                // prevent endless loops in the test
                if (iUidCount > 1000) {
                    assert.ok(false, "endless loop");
                    return true;
                }

                return oFixture.aExistingIds.indexOf(sProposedGeneratedId) === -1;
            }

            const oGetUidStub = sinon.stub(utils, "_getUid").callsFake(() => {
                iUidCount += 1;
                return `${iUidCount}00-000-000`;
            });

            // callback parameter
            // act
            sResult = utils.generateUniqueId(isUniqueIdCallback);
            // assert
            assert.strictEqual(sResult, oFixture.expectedGeneratedId,
                `returned unique ID (callback parameter), call count: ${iUidCount}`);

            // array parameter
            // arrange (reset)
            iUidCount = -1;
            // act
            sResult = utils.generateUniqueId(oFixture.aExistingIds);
            // assert
            assert.strictEqual(sResult, oFixture.expectedGeneratedId,
                `returned unique ID (callback parameter), call count: ${iUidCount}`);
            oGetUidStub.restore();
        });
    });

    QUnit.test("generateUniqueId: callback returns falsy values", function (assert) {
        const aUniqueIdCallbackResults = ["", false, 0, NaN, null, undefined]; // falsy values
        let aUniqueIdCallbackCalls = -1;
        let iUidCount = -1;
        const sExpectedUniqueId = `${aUniqueIdCallbackResults.length}00-000-000`; // -1 can be skipped as true is add later

        // arrange
        aUniqueIdCallbackResults.push(true); // make the test successful in the end
        function isUniqueIdCallback (/* sProposedGeneratedId */) {
            // prevent endless loops in the test
            if (iUidCount > 1000) {
                assert.ok(false, "endless loop");
                return true;
            }

            aUniqueIdCallbackCalls += 1;
            return aUniqueIdCallbackResults[aUniqueIdCallbackCalls];
        }

        const oGetUidStub = sinon.stub(utils, "_getUid").callsFake(() => {
            iUidCount += 1;
            return `${iUidCount}00-000-000`;
        });

        // callback parameter
        // act
        const sResult = utils.generateUniqueId(isUniqueIdCallback);
        // assert
        assert.strictEqual(sResult, sExpectedUniqueId,
            `returned unique ID, call count: ${iUidCount}`);
        oGetUidStub.restore();
    });

    QUnit.test("shallowMergeObject: target object is modified after a merge", function (assert) {
        const oTarget = { key1: "V1", key2: "V2" };
        const oSource = { key3: "V3" };

        utils.shallowMergeObject(oTarget, oSource);

        assert.deepEqual(oTarget, { key1: "V1", key2: "V2", key3: "V3" },
            "object was merged as expected"
        );
    });

    QUnit.test("shallowMergeObject: only one argument is passed", function (assert) {
        const oTarget = { key1: "V1", key2: "V2" };

        utils.shallowMergeObject(oTarget);

        assert.strictEqual(oTarget, oTarget, "object was left intact");
    });

    QUnit.test("shallowMergeObject: merges as expected when two objects are given", function (assert) {
        const oTarget = { key1: "V1", key2: "V2" };
        const oSource = { key3: "V3" };

        assert.deepEqual(
            utils.shallowMergeObject(oTarget, oSource),
            { key1: "V1", key2: "V2", key3: "V3" },
            "object was merged as expected"
        );
    });

    QUnit.test("shallowMergeObject: merges as expected when multiple objects are given", function (assert) {
        const oTarget = { key1: "V1", key2: "V2" };
        const oSource1 = { key3: "V3" };
        const oSource2 = { key4: "V4" };
        const oSource3 = { key5: "V5" };

        assert.deepEqual(
            utils.shallowMergeObject(oTarget, oSource1, oSource2, oSource3),
            { key1: "V1", key2: "V2", key3: "V3", key4: "V4", key5: "V5" },
            "object was merged as expected"
        );
    });

    QUnit.test("shallowMergeObject: merge is shallow", function (assert) {
        const oTarget = { key1: { key2: { key3: "Value " } } };
        const oSource = { key1: "WINS" };

        assert.deepEqual(
            utils.shallowMergeObject(oTarget, oSource),
            { key1: "WINS" },
            "object was merged as expected"
        );
    });

    QUnit.test("shallowMergeObject: multiple objects are merged in order", function (assert) {
        const oTarget = { key: "Initial" };
        const oSource1 = { key: "First" };
        const oSource2 = { key: "Second" };
        const oSource3 = { key: "Last" };

        assert.deepEqual(
            utils.shallowMergeObject(oTarget, oSource1, oSource2, oSource3),
            { key: "Last" },
            "object was merged as expected"
        );
    });

    [{
        testDescription: "one id given",
        sPrefix: "prefix",
        aIds: ["id1"],
        expectedKey: "prefix$id1"
    }, {
        testDescription: "two ids given",
        sPrefix: "prefix",
        aIds: ["id1", "id2"],
        expectedKey: "prefix#id1:id2"
    }, {
        testDescription: "more than two ids given",
        sPrefix: "prefix",
        aIds: ["id1", "id2", "id3"],
        expectedKey: "prefix@3@id1:id2:id3"
    }, {
        testDescription: "two ids with separator in the key are given",
        sPrefix: "prefix",
        aIds: ["id1", "id2:id3"],
        expectedKey: "prefix#id1:id2:id3"
    }].forEach((oFixture) => {
        QUnit.test(`generateLocalStorageKey: ${oFixture.testDescription}`, function (assert) {
            assert.strictEqual(
                utils.generateLocalStorageKey(oFixture.sPrefix, oFixture.aIds),
                oFixture.expectedKey,
                "obtained the expected result"
            );
        });
    });

    QUnit.test("generateLocalStorageKey throws when no ids are given", function (assert) {
        assert.throws(utils.generateLocalStorageKey.bind(utils, "prefix", []));
    });

    QUnit.test("setPerformanceMark sets a performance mark", function (assert) {
        const sMarkName = "myMark";

        // check if another test did set a performance mark
        if (performance.getEntries().length > 0) {
            performance.clearMarks();
        }

        // function to test
        utils.setPerformanceMark(sMarkName);

        assert.ok(performance.getEntriesByName(sMarkName).length > 0, "A performance mark was set");

        // Clear all performance marks
        performance.clearMarks();
    });

    QUnit.test("setPerformanceMark sets several performance marks", function (assert) {
        // Several mark names. Two share the same name.
        const aMarkName = ["myMark1", "myMark1", "myMark2", "myMark3"];
        const fnDone = assert.async();
        const aPromises = [];
        let oConfigMarks;
        let iIndex = 4;

        // check if another test did set a performance mark
        if (performance.getEntries().length > 0) {
            performance.clearMarks();
        }

        // set the marks. This happens asynchronously as two marks with same time will not be recorded

        aMarkName.forEach((sValue, iInnerIndex) => {
            aPromises.push(new Promise((resolve) => {
                setTimeout((sValue) => {
                    utils.setPerformanceMark(sValue);
                    resolve();
                }, iInnerIndex);
            }));
        });

        Promise.all(aPromises).then(() => {
            assert.ok(performance.getEntriesByType("mark").length === iIndex, "Several performance marks were set");
            iIndex += 1;
            // All the following tests might need to be async, the ok function seems to be slow
            // enough to avoid this.

            // repeat with oConfigMarks undefined
            utils.setPerformanceMark(aMarkName[0], undefined);
            assert.ok(performance.getEntriesByType("mark").length === iIndex, "oConfigMarks == undefined");
            iIndex += 1;

            // repeat with oConfigMarks.bUseUniqueMark empty
            utils.setPerformanceMark(aMarkName[0], {});
            assert.ok(performance.getEntriesByType("mark").length === iIndex, "oConfigMarks == {}");
            iIndex += 1;

            // repeat with oConfigMarks.bUseUniqueMark undefined
            oConfigMarks = { bUseUniqueMark: undefined };
            utils.setPerformanceMark(aMarkName[0], undefined);
            assert.ok(performance.getEntriesByType("mark").length === iIndex, "oConfigMarks.bUseUniqueMark == undefined");
            iIndex += 1;

            // repeat with oConfigMarks.bUseUniqueMark set to false
            oConfigMarks = { bUseUniqueMark: false };
            utils.setPerformanceMark(aMarkName[0], false);
            assert.ok(performance.getEntriesByType("mark").length === iIndex, "oConfigMarks.bUseUniqueMark == false");
            iIndex += 1;

            // repeat with the bUseUniqueMark false and bUseLastMark true
            oConfigMarks = { bUseUniqueMark: false, bUseLastMark: true };
            utils.setPerformanceMark(aMarkName[0], oConfigMarks);
            assert.ok(performance.getEntriesByType("mark").length === iIndex, "oConfigMarks.bUseUniqueMark == false, oConfigMarks.bUseLastMark==true");
            iIndex += 1;

            // Clear all performance marks
            performance.clearMarks();

            fnDone();
        });
    });

    QUnit.test("setPerformanceMark keeps only the first measurement of a series", function (assert) {
        const aMarkName = ["myMark1", "myMark1", "myMark1", "myMark1"];
        const aPromises = [];
        const aPromises2 = [];
        const fnDone = assert.async();

        // set the first mark
        utils.setPerformanceMark("myMark1");

        // save the time stamp
        const fStartTime = performance.getEntriesByName("myMark1")[0].startTime;

        // try to take more measurements - (oConfigMarks.bUseLastMark undefined)
        const oConfigMarks = { bUseUniqueMark: true };
        aMarkName.forEach((sValue, iIndex) => {
            aPromises.push(new Promise((resolve) => {
                setTimeout((sValue) => {
                    utils.setPerformanceMark(sValue, oConfigMarks);
                    resolve();
                }, iIndex, sValue);
            }));
        });

        // Tests
        Promise.all(aPromises).then(() => {
            assert.ok(performance.getEntriesByName("myMark1").length === 1, "Only one measurement was recorded");
            assert.ok(performance.getEntriesByName("myMark1")[0].startTime === fStartTime, "The first measurement was recorded");

            // try to take more measurements - oConfigMarks.bUseLastMark set to false
            oConfigMarks.bUseLastMark = false;
            aMarkName.forEach((sValue) => {
                utils.setPerformanceMark(sValue, oConfigMarks);
            });

            // Tests
            assert.ok(performance.getEntriesByName("myMark1").length === 1, "Only one measurement was recorded");
            assert.ok(performance.getEntriesByName("myMark1")[0].startTime === fStartTime, "The first measurement was recorded");
        }).then(() => {
            // second batch of tests
            aMarkName.forEach((sValue, iIndex) => {
                aPromises2.push(new Promise((resolve) => {
                    setTimeout((sValue) => {
                        // try to take more measurements - oConfigMarks.bUseLastMark set to false
                        utils.setPerformanceMark(sValue, oConfigMarks);
                        resolve();
                    }, iIndex, sValue);
                }));
            });

            Promise.all(aPromises2).then(() => {
                // Tests
                assert.ok(performance.getEntriesByName("myMark1").length === 1, "Only one measurement was recorded");
                assert.ok(performance.getEntriesByName("myMark1")[0].startTime === fStartTime, "The first measurement was recorded");

                // Clear all performance marks
                performance.clearMarks();

                fnDone();
            });
        });
    });

    QUnit.test("setPerformanceMark keeps only the last measurement of series", function (assert) {
        const aMarkName = ["myMark1", "myMark1", "myMark1", "myMark1"];
        const aAllMeasurements = [];
        let fLastStartTime;
        let iNumMarks;
        const aPromises = [];
        const fnDone = assert.async();
        let fMax;

        // try to take several measurements - oConfigMarks.bUseUniqueMark and oConfigMarks.bUseLastMark set to true
        const oConfigMarks = { bUseUniqueMark: true, bUseLastMark: true };
        utils.setPerformanceMark("myMark1", oConfigMarks);
        // store the first measurement
        aAllMeasurements.push(performance.getEntriesByName("myMark1")[0].startTime);

        aMarkName.forEach((sValue, iIndex) => {
            aPromises.push(new Promise((resolve) => {
                setTimeout((sValue) => {
                    utils.setPerformanceMark(sValue, oConfigMarks);
                    iNumMarks = performance.getEntriesByName(sValue).length;
                    aAllMeasurements.push(performance.getEntriesByName(sValue)[iNumMarks - 1].startTime);
                    resolve();
                }, iIndex, sValue);
            }));
        });

        // Tests
        Promise.all(aPromises).then(() => {
            assert.ok(performance.getEntriesByName("myMark1").length === 1, "Only one measurement was recorded");
            // to be sure the last measurement was recorded check if the maximal time was recorded
            fLastStartTime = performance.getEntriesByName("myMark1")[0].startTime;
            // ECMA6 would be nice here: Math.max(...aAllMeasurements)
            fMax = aAllMeasurements.reduce((a, b) => { return Math.max(a, b); });
            assert.ok(fLastStartTime === fMax, "The last measurement was recorded");

            // Clear all performance marks
            performance.clearMarks();

            fnDone();
        });
    });

    QUnit.test("utils.removeDuplicatedActions: returns the same object if not array", function (assert) {
        // arrange
        const oActions = {
            0: "test",
            1: "test"
        };
        // act
        const oUniqueActions = utils.removeDuplicatedActions(oActions);

        // assert
        assert.deepEqual(oActions, oUniqueActions);
    });

    QUnit.test("utils.removeDuplicatedActions: if array is empty return an empty array", function (assert) {
        // arrange
        const aActions = [];

        // act
        const aUniqueActions = utils.removeDuplicatedActions(aActions);

        // assert
        assert.deepEqual(aActions, aUniqueActions);
    });

    QUnit.test("utils.removeDuplicatedActions: returns the same array in case of no duplicates", function (assert) {
        // arrange
        const aActions = ["item1", "item2"];

        // act
        const aUniqueActions = utils.removeDuplicatedActions(aActions);

        // assert
        assert.deepEqual(aActions, aUniqueActions);
    });

    QUnit.test("utils.removeDuplicatedActions: in case all array items are the same returns an array with one item", function (assert) {
        // arrange
        const aActions = ["item1", "item1", "item1"];
        const aExpectedUniqueActions = ["item1"];

        // act
        const aUniqueActions = utils.removeDuplicatedActions(aActions);

        // assert
        assert.deepEqual(aExpectedUniqueActions, aUniqueActions);
    });

    QUnit.test("utils.removeDuplicatedActions: in case of duplicates array with unique items is returned", function (assert) {
        // arrange
        const aActions = ["item1", "item2", "item1", "item3", "item1", "item2", "item1"];
        const aExpectedUniqueActions = ["item1", "item2", "item3"];

        // act
        const aUniqueActions = utils.removeDuplicatedActions(aActions);

        // assert
        assert.deepEqual(aExpectedUniqueActions, aUniqueActions);
    });

    QUnit.test("utils.calcVisibilityModes: empty groups on phone devices are not displayed on the homepage when not in edit mode", function (assert) {
        // Arrange
        const oGroupHasVisibleTilesStub = sinon.stub(utils, "groupHasVisibleTiles").returns(false);
        const oOriginalSystem = Device.system;
        Device.system.desktop = false;
        Device.system.tablet = false;
        Device.system.phone = true;

        // Act
        const aResult = utils.calcVisibilityModes({}, true);

        // Assert
        assert.deepEqual(aResult, [false, true], "Group is hidden as expected");

        // Cleanup
        Device.system = oOriginalSystem;
        oGroupHasVisibleTilesStub.restore();
    });

    QUnit.test("utils.calcVisibilityModes: empty groups on tablet devices are not displayed on the homepage when not in edit mode", function (assert) {
        // Arrange
        const oGroupHasVisibleTilesStub = sinon.stub(utils, "groupHasVisibleTiles").returns(false);
        const oOriginalSystem = Device.system;
        Device.system.desktop = false;
        Device.system.tablet = true;
        Device.system.phone = false;

        // Act
        const aResult = utils.calcVisibilityModes({}, true);

        // Assert
        assert.deepEqual(aResult, [false, true], "Group is hidden as expected");

        // Cleanup
        Device.system = oOriginalSystem;
        oGroupHasVisibleTilesStub.restore();
    });

    QUnit.test("utils.calcVisibilityModes: empty groups are displayed when tablet and desktop mode is enabled and the homepage is not in edit mode", function (assert) {
        // Arrange
        const oGroupHasVisibleTilesStub = sinon.stub(utils, "groupHasVisibleTiles").returns(false);
        const oOriginalSystem = Device.system;
        Device.system.desktop = true;
        Device.system.tablet = true;
        Device.system.phone = false;

        // Act
        const aResult = utils.calcVisibilityModes({}, true);

        // Assert
        assert.deepEqual(aResult, [true, true], "Group is shown as expected");

        // Cleanup
        Device.system = oOriginalSystem;
        oGroupHasVisibleTilesStub.restore();
    });

    QUnit.module("isNativeWebGuiNavigation", {
        beforeEach: function () {
            this.oObjectPathStub = sinon.stub(ObjectPath, "get").callsFake((path, obj) => {
                if (path === "applicationType") {
                    return obj.applicationType;
                }
                return obj.appCapabilities.nativeNWBCNavigation;
            });

            this.oHasNativeNavigationCapabilityStub = sinon.stub(utils, "hasNativeNavigationCapability");
        },
        afterEach: function () {
            this.oHasNativeNavigationCapabilityStub.restore();
            this.oObjectPathStub.restore();
        }
    });

    QUnit.test("returns correct logic: applicationType: 'TR', nativeNWBCNavigation: true, hasNativeNavigationCapability: true", function (assert) {
        // Arrange
        const oResolvedNavigationTarget = {
            appCapabilities: {
                nativeNWBCNavigation: true
            },
            applicationType: "TR"
        };
        this.oHasNativeNavigationCapabilityStub.returns(true);

        // Act
        const bResult = utils.isNativeWebGuiNavigation(oResolvedNavigationTarget);

        // Assert
        assert.strictEqual(bResult, true, "value matches expected result");
    });

    QUnit.test("returns correct logic: applicationType: 'AnyApplicationType', nativeNWBCNavigation: true, hasNativeNavigationCapability: true", function (assert) {
        // Arrange
        const oResolvedNavigationTarget = {
            appCapabilities: {
                nativeNWBCNavigation: true
            },
            applicationType: "AnyApplicationType"
        };
        this.oHasNativeNavigationCapabilityStub.returns(true);

        // Act
        const bResult = utils.isNativeWebGuiNavigation(oResolvedNavigationTarget);

        // Assert
        assert.strictEqual(bResult, true, "value matches expected result");
    });

    QUnit.test("returns correct logic: applicationType: 'TR', nativeNWBCNavigation: false, hasNativeNavigationCapability: true", function (assert) {
        // Arrange
        const oResolvedNavigationTarget = {
            appCapabilities: {
                nativeNWBCNavigation: false
            },
            applicationType: "TR"
        };
        this.oHasNativeNavigationCapabilityStub.returns(true);

        // Act
        const bResult = utils.isNativeWebGuiNavigation(oResolvedNavigationTarget);

        // Assert
        assert.strictEqual(bResult, true, "value matches expected result");
    });

    QUnit.test("returns correct logic: applicationType: 'AnyApplicationType', nativeNWBCNavigation: false, hasNativeNavigationCapability: true", function (assert) {
        // Arrange
        const oResolvedNavigationTarget = {
            appCapabilities: {
                nativeNWBCNavigation: false
            },
            applicationType: "AnyApplicationType"
        };
        this.oHasNativeNavigationCapabilityStub.returns(true);

        // Act
        const bResult = utils.isNativeWebGuiNavigation(oResolvedNavigationTarget);

        // Assert
        assert.strictEqual(bResult, false, "value matches expected result");
    });

    QUnit.test("returns correct logic: applicationType: 'TR', nativeNWBCNavigation: true, hasNativeNavigationCapability: true", function (assert) {
        // Arrange
        const oResolvedNavigationTarget = {
            appCapabilities: {
                nativeNWBCNavigation: true
            },
            applicationType: "TR"
        };
        this.oHasNativeNavigationCapabilityStub.returns(false);

        // Act
        const bResult = utils.isNativeWebGuiNavigation(oResolvedNavigationTarget);

        // Assert
        assert.strictEqual(bResult, false, "value matches expected result");
    });

    QUnit.test("returns correct logic: applicationType: 'AnyApplicationType', nativeNWBCNavigation: true, hasNativeNavigationCapability: false", function (assert) {
        // Arrange
        const oResolvedNavigationTarget = {
            appCapabilities: {
                nativeNWBCNavigation: true
            },
            applicationType: "AnyApplicationType"
        };
        this.oHasNativeNavigationCapabilityStub.returns(false);

        // Act
        const bResult = utils.isNativeWebGuiNavigation(oResolvedNavigationTarget);

        // Assert
        assert.strictEqual(bResult, false, "value matches expected result");
    });

    QUnit.test("returns correct logic: applicationType: 'TR', nativeNWBCNavigation: false, hasNativeNavigationCapability: false", function (assert) {
        // Arrange
        const oResolvedNavigationTarget = {
            appCapabilities: {
                nativeNWBCNavigation: false
            },
            applicationType: "TR"
        };
        this.oHasNativeNavigationCapabilityStub.returns(false);

        // Act
        const bResult = utils.isNativeWebGuiNavigation(oResolvedNavigationTarget);

        // Assert
        assert.strictEqual(bResult, false, "value matches expected result");
    });

    QUnit.test("returns correct logic: applicationType: 'AnyApplicationType', nativeNWBCNavigation: false, hasNativeNavigationCapability: false", function (assert) {
        // Arrange
        const oResolvedNavigationTarget = {
            appCapabilities: {
                nativeNWBCNavigation: false
            },
            applicationType: "AnyApplicationType"
        };
        this.oHasNativeNavigationCapabilityStub.returns(false);

        // Act
        const bResult = utils.isNativeWebGuiNavigation(oResolvedNavigationTarget);

        // Assert
        assert.strictEqual(bResult, false, "value matches expected result");
    });

    QUnit.module("isRootIntent", {
        beforeEach: function () {
            this.rootIntentConfigPath = "renderers.fiori2.componentData.config.rootIntent";
            this.setRootIntent = function (sIntent) {
                this.originalRootIntent = ObjectPath.get(this.rootIntentConfigPath, window["sap-ushell-config"]);
                ObjectPath.set(this.rootIntentConfigPath, sIntent, window["sap-ushell-config"]);
            };
            this.setRootIntent("#Custom-rootIntent");
        },
        afterEach: function () {
            ObjectPath.set(this.rootIntentConfigPath, this.originalRootIntent, window["sap-ushell-config"]);
        }
    });

    QUnit.test("String Intent is the root intent", function (assert) {
        assert.strictEqual(utils.isRootIntent("#Custom-rootIntent"), true);
    });
    QUnit.test("String Intent with parameters", function (assert) {
        assert.strictEqual(utils.isRootIntent("#Custom-rootIntent?some=param1&param2=v2"), false);
    });
    QUnit.test("String Intent without '#' is the root intent", function (assert) {
        assert.strictEqual(utils.isRootIntent("Custom-rootIntent"), true);
    });
    QUnit.test("String Intent is not the root intent", function (assert) {
        assert.strictEqual(utils.isRootIntent("#Another-intent"), false);
    });
    QUnit.test("String Intent without '#' is not the root intent", function (assert) {
        assert.strictEqual(utils.isRootIntent("Another-intent"), false);
    });
    QUnit.test("Shell-home is not the root intent when not configured", function (assert) {
        assert.strictEqual(utils.isRootIntent("#Shell-home"), false);
    });
    QUnit.test("'#' intent is the root intent", function (assert) {
        assert.strictEqual(utils.isRootIntent("#"), true);
    });
    QUnit.test("empty intent is the root intent", function (assert) {
        assert.strictEqual(utils.isRootIntent(""), true);
    });
    QUnit.test("Invalid string root intent compared", function (assert) {
        assert.strictEqual(utils.isRootIntent("#1aunch-_me"), false);
    });
    QUnit.test("Array as input intent", function (assert) {
        assert.throws(utils.isRootIntent.bind(utils, ["#", "Some", "intent"]), Error("The given intent must be a string"));
    });
    QUnit.test("Undefined as input intent", function (assert) {
        assert.throws(utils.isRootIntent.bind(utils, undefined), Error("The given intent must be a string"));
    });
    QUnit.test("Number as input intent", function (assert) {
        assert.throws(utils.isRootIntent.bind(utils, 1234), Error("The given intent must be a string"));
    });
    QUnit.test("No arguments given", function (assert) {
        assert.throws(utils.isRootIntent.bind(utils), Error("The given intent must be a string"));
    });

    QUnit.module("isFlpHomeIntent");

    QUnit.test("Array as input intent", function (assert) {
        assert.throws(utils.isFlpHomeIntent.bind(utils, ["#", "Some", "intent"]), Error("The given intent must be a string"));
    });
    QUnit.test("Number as input intent", function (assert) {
        assert.throws(utils.isFlpHomeIntent.bind(utils, 1234), Error("The given intent must be a string"));
    });
    QUnit.test("#Shell-home is the flp home intent", function (assert) {
        assert.strictEqual(utils.isFlpHomeIntent("#Shell-home"), true);
    });
    QUnit.test("#Shell-home?sap-app-origin-hint= is the flp home intent", function (assert) {
        assert.strictEqual(utils.isFlpHomeIntent("#Shell-home?sap-app-origin-hint="), true);
    });
    QUnit.test("#Launchpad-openFLPPage is the flp home intent", function (assert) {
        assert.strictEqual(utils.isFlpHomeIntent("#Launchpad-openFLPPage"), true);
    });
    QUnit.test("#Launchpad-openFLPPage with parameters is the flp home intent", function (assert) {
        assert.strictEqual(utils.isFlpHomeIntent("#Launchpad-openFLPPage?pageId=page&spaceId=space"), true);
    });
    QUnit.test("#Launchpad-openFLPPage with parameters is the flp home intent", function (assert) {
        assert.strictEqual(utils.isFlpHomeIntent("#Launchpad-openFLPPage?spaceId=page&pageId=space"), true);
    });
    QUnit.test("The flp home intent without hash", function (assert) {
        assert.strictEqual(utils.isFlpHomeIntent("Shell-home"), true);
    });
    QUnit.test("String Intent is not the flp home intent", function (assert) {
        assert.strictEqual(utils.isFlpHomeIntent("#Another-intent"), false);
    });
    QUnit.test("Undefined as input intent", function (assert) {
        assert.strictEqual(utils.isFlpHomeIntent(), true);
    });

    QUnit.module("_getUserSettingPersContainer", {
        before: function () {
            return Container.init("local");
        },
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
            this.oPersonalizer = { id: "Personalizer" };
            this.oPersonalizationService = {
                getPersonalizer: sandbox.stub().resolves(this.oPersonalizer),
                KeyCategory,
                WriteFrequency
            };
            this.oGetServiceAsyncStub.withArgs("PersonalizationV2").resolves(this.oPersonalizationService);
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Resolves the Personalizer", function (assert) {
        // Arrange
        const oExpectedPersId = {
            container: "sap.ushell.usersettings.personalization",
            item: "data"
        };
        const oExpectedScope = {
            validity: "Infinity",
            keyCategory: "GENERATED_KEY",
            writeFrequency: "HIGH",
            clientStorageAllowed: false
        };
        // Act
        return utils._getUserSettingPersContainer().then((oResult) => {
            // Assert
            assert.strictEqual(oResult, this.oPersonalizer, "Resolved the correct Personalizer");
            assert.deepEqual(this.oPersonalizationService.getPersonalizer.getCall(0).args, [oExpectedPersId, oExpectedScope], "Called getPersonalizer with correct args");
        });
    });

    QUnit.module("getHideEmptySpacesEnabled", {
        beforeEach: function () {
            this.oConfigLastStub = sandbox.stub(Config, "last");
            this.oConfigEmitStub = sandbox.stub(Config, "emit");

            this.oPersDataMock = {
                hideEmptySpaces: false
            };
            this.oGetPersDataStub = sandbox.stub();
            this.oPersContainer = {
                getPersData: this.oGetPersDataStub
            };
            this.oGetUserSettingPersContainerStub = sandbox.stub(utils, "_getUserSettingPersContainer").resolves(this.oPersContainer);
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Resolves the value and updates the config", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/spaces/hideEmptySpaces/enabled").returns(true);
        this.oConfigLastStub.withArgs("/core/spaces/hideEmptySpaces/userEnabled").returns(true);
        this.oGetPersDataStub.returns(new jQuery.Deferred().resolve(this.oPersDataMock).promise());
        const aExpectedEmitArgs = [
            "/core/spaces/hideEmptySpaces/userEnabled",
            false
        ];
        // Act
        return utils.getHideEmptySpacesEnabled().then((bResult) => {
            // Assert
            assert.strictEqual(bResult, false, "Resolved correct result");

            assert.strictEqual(this.oGetUserSettingPersContainerStub.callCount, 1, "PersContainer was fetched");
            assert.deepEqual(this.oConfigEmitStub.getCall(0).args, aExpectedEmitArgs, "Saved new value to Config");
        });
    });

    QUnit.test("Default value for undefined is true", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/spaces/hideEmptySpaces/enabled").returns(true);
        this.oConfigLastStub.withArgs("/core/spaces/hideEmptySpaces/userEnabled").returns(true);
        this.oGetPersDataStub.returns(new jQuery.Deferred().resolve(undefined).promise());
        // Act
        return utils.getHideEmptySpacesEnabled().then((bResult) => {
            // Assert
            assert.strictEqual(bResult, true, "Resolved correct result");

            assert.strictEqual(this.oGetUserSettingPersContainerStub.callCount, 1, "PersContainer was fetched");
            assert.strictEqual(this.oConfigEmitStub.callCount, 0, "Config was not updated");
        });
    });

    QUnit.test("Resolves instantly when hideEmptySpaces is disabled", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/spaces/hideEmptySpaces/enabled").returns(false);
        // Act
        return utils.getHideEmptySpacesEnabled().then((bResult) => {
            // Assert
            assert.strictEqual(bResult, false, "Resolved correct result");

            assert.strictEqual(this.oGetUserSettingPersContainerStub.callCount, 0, "PersContainer was not fetched");
            assert.strictEqual(this.oConfigEmitStub.callCount, 0, "Config was not updated");
        });
    });

    QUnit.test("Rejects when PersContainer.getPersData fails", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/spaces/hideEmptySpaces/enabled").returns(true);
        this.oGetPersDataStub.returns(new jQuery.Deferred().reject(new Error("getPersData failed")).promise());
        // Act
        return utils.getHideEmptySpacesEnabled().catch((oError) => {
            // Assert
            assert.strictEqual(oError.message, "getPersData failed", "Rejected with correct message");

            assert.strictEqual(this.oGetUserSettingPersContainerStub.callCount, 1, "PersContainer was fetched");
            assert.strictEqual(this.oConfigEmitStub.callCount, 0, "Config was not updated");
        });
    });

    QUnit.module("setHideEmptySpacesEnabled", {
        beforeEach: function () {
            this.oConfigLastStub = sandbox.stub(Config, "last");
            this.oConfigEmitStub = sandbox.stub(Config, "emit");

            this.oPersDataMock = {
                hideEmptySpaces: false
            };
            this.oGetPersDataStub = sandbox.stub();
            this.oSetPersDataStub = sandbox.stub();
            this.oPersContainer = {
                getPersData: this.oGetPersDataStub,
                setPersData: this.oSetPersDataStub
            };
            this.oGetUserSettingPersContainerStub = sandbox.stub(utils, "_getUserSettingPersContainer").resolves(this.oPersContainer);
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Saves the new value \"false\" in case it was previously \"undefined\"", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/spaces/hideEmptySpaces/enabled").returns(true);
        this.oGetPersDataStub.returns(new jQuery.Deferred().resolve(undefined).promise());
        this.oSetPersDataStub.returns(new jQuery.Deferred().resolve().promise());

        const oExpectedPersData = {
            hideEmptySpaces: false
        };
        const aExpectedEmitArgs = [
            "/core/spaces/hideEmptySpaces/userEnabled",
            false
        ];

        // Act
        return utils.setHideEmptySpacesEnabled(false).then(() => {
            // Assert
            assert.strictEqual(this.oGetUserSettingPersContainerStub.callCount, 1, "PersContainer was fetched");
            assert.strictEqual(this.oGetPersDataStub.callCount, 1, "getPersData was called");

            assert.strictEqual(this.oSetPersDataStub.callCount, 1, "setPersData was called");
            assert.deepEqual(this.oSetPersDataStub.getCall(0).args, [oExpectedPersData], "correct PersData was saved");

            assert.deepEqual(this.oConfigEmitStub.getCall(0).args, aExpectedEmitArgs, "Config.emit was called with correct args");
        });
    });

    QUnit.test("Does not save the new value \"true\" in case it was previously \"undefined\"", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/spaces/hideEmptySpaces/enabled").returns(true);
        this.oGetPersDataStub.returns(new jQuery.Deferred().resolve(undefined).promise());

        // Act
        return utils.setHideEmptySpacesEnabled(true).then(() => {
            // Assert
            assert.strictEqual(this.oGetUserSettingPersContainerStub.callCount, 1, "PersContainer was fetched");
            assert.strictEqual(this.oGetPersDataStub.callCount, 1, "getPersData was called");

            assert.strictEqual(this.oSetPersDataStub.callCount, 0, "setPersData was not called");
            assert.strictEqual(this.oConfigEmitStub.callCount, 0, "Config.emit was not called");
        });
    });

    QUnit.test("Does not save the new value \"false\" in case it was previously \"false\"", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/spaces/hideEmptySpaces/enabled").returns(true);
        this.oGetPersDataStub.returns(new jQuery.Deferred().resolve(this.oPersDataMock).promise());

        // Act
        return utils.setHideEmptySpacesEnabled(false).then(() => {
            // Assert
            assert.strictEqual(this.oGetUserSettingPersContainerStub.callCount, 1, "PersContainer was fetched");
            assert.strictEqual(this.oGetPersDataStub.callCount, 1, "getPersData was called");

            assert.strictEqual(this.oSetPersDataStub.callCount, 0, "SetPersData was notCalled");
            assert.strictEqual(this.oConfigEmitStub.callCount, 0, "Config.emit was not called");
        });
    });

    QUnit.test("Saves the new value \"true\" w/o overwriting other values", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/spaces/hideEmptySpaces/enabled").returns(true);
        this.oPersDataMock.otherValue = "foo";
        this.oGetPersDataStub.returns(new jQuery.Deferred().resolve(this.oPersDataMock).promise());
        this.oSetPersDataStub.returns(new jQuery.Deferred().resolve().promise());

        const oExpectedPersData = {
            hideEmptySpaces: true,
            otherValue: "foo"
        };
        const aExpectedEmitArgs = [
            "/core/spaces/hideEmptySpaces/userEnabled",
            true
        ];

        // Act
        return utils.setHideEmptySpacesEnabled(true).then(() => {
            // Assert
            assert.strictEqual(this.oGetUserSettingPersContainerStub.callCount, 1, "PersContainer was fetched");
            assert.strictEqual(this.oGetPersDataStub.callCount, 1, "getPersData was called");

            assert.strictEqual(this.oSetPersDataStub.callCount, 1, "setPersData was called");
            assert.deepEqual(this.oSetPersDataStub.getCall(0).args, [oExpectedPersData], "correct PersData was saved");

            assert.deepEqual(this.oConfigEmitStub.getCall(0).args, aExpectedEmitArgs, "Config.emit was called with correct args");
        });
    });

    QUnit.test("Resolves instantly when hideEmptySpaces is disabled", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/spaces/hideEmptySpaces/enabled").returns(false);
        // Act
        return utils.setHideEmptySpacesEnabled(true).then(() => {
            // Assert
            assert.strictEqual(this.oGetUserSettingPersContainerStub.callCount, 0, "PersContainer was not fetched");
            assert.strictEqual(this.oGetPersDataStub.callCount, 0, "getPersData was not called");
            assert.strictEqual(this.oSetPersDataStub.callCount, 0, "setPersData was not called");
            assert.deepEqual(this.oConfigEmitStub.callCount, 0, "Config.emit was not called");
        });
    });

    QUnit.test("Rejects when PersContainer fetch fails", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/spaces/hideEmptySpaces/enabled").returns(true);
        this.oGetUserSettingPersContainerStub.returns(Promise.reject(new Error("PersContainer fetch failed")));
        // Act
        return utils.setHideEmptySpacesEnabled(true).catch((oError) => {
            // Assert
            assert.strictEqual(oError.message, "PersContainer fetch failed", "Rejected wit correct error");

            assert.strictEqual(this.oGetUserSettingPersContainerStub.callCount, 1, "PersContainer was fetched");
            assert.strictEqual(this.oGetPersDataStub.callCount, 0, "getPersData was not called");
            assert.strictEqual(this.oSetPersDataStub.callCount, 0, "setPersData was not called");
            assert.deepEqual(this.oConfigEmitStub.callCount, 0, "Config.emit was not called");
        });
    });

    QUnit.test("Rejects when getPersData fails", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/spaces/hideEmptySpaces/enabled").returns(true);
        this.oGetPersDataStub.returns(new jQuery.Deferred().reject(new Error("getPersData failed")).promise());
        // Act
        return utils.setHideEmptySpacesEnabled(true).catch((oError) => {
            // Assert
            assert.strictEqual(oError.message, "getPersData failed", "Rejected wit correct error");

            assert.strictEqual(this.oGetUserSettingPersContainerStub.callCount, 1, "PersContainer was fetched");
            assert.strictEqual(this.oGetPersDataStub.callCount, 1, "getPersData was called");
            assert.strictEqual(this.oSetPersDataStub.callCount, 0, "setPersData was not called");
            assert.deepEqual(this.oConfigEmitStub.callCount, 0, "Config.emit was not called");
        });
    });

    QUnit.test("Rejects when setPersData fails", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/spaces/hideEmptySpaces/enabled").returns(true);
        this.oGetPersDataStub.returns(new jQuery.Deferred().resolve(undefined).promise());
        this.oSetPersDataStub.returns(new jQuery.Deferred().reject(new Error("setPersData failed")).promise());
        // Act
        return utils.setHideEmptySpacesEnabled(false).catch((oError) => {
            // Assert
            assert.strictEqual(oError.message, "setPersData failed", "Rejected wit correct error");

            assert.strictEqual(this.oGetUserSettingPersContainerStub.callCount, 1, "PersContainer was fetched");
            assert.strictEqual(this.oGetPersDataStub.callCount, 1, "getPersData was called");
            assert.strictEqual(this.oSetPersDataStub.callCount, 1, "setPersData was called");
            assert.deepEqual(this.oConfigEmitStub.callCount, 0, "Config.emit was not called");
        });
    });

    [
        { val: true, res: "NWBC" },
        { val: false, res: "FLP" }
    ].forEach((oFixture) => {
        QUnit.test(`hasNativeNavigationCapability detect Fiori Desktop Client (NWBC for Fiori UX), force via URL parameter with value '${oFixture.val}'`, function (assert) {
            const stub = sandbox.stub(utils, "isFeatureBitEnabled").callsFake(() => {
                return oFixture.val;
            });

            const sShellType = utils.getShellType();
            assert.strictEqual(sShellType, oFixture.res, " value matches expected result");
            stub.restore();
        });
    });

    QUnit.module("toExternalWithParameters", {
        beforeEach: function () {
            return Container.init("local")
                .then(() => {
                    return Container.getServiceAsync("Navigation").then((oNavigationService) => {
                        this.navigateStub = sandbox.stub(oNavigationService, "navigate").resolves();
                    });
                });
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Hash gets build correctly for semanticObject and action.", function (assert) {
        // Arrange
        const sSemanticObject = "SemanticObject";
        const sAction = "action";
        const aParameters = [];
        const aExpectedArguments = [
            {
                target: {
                    shellHash: "SemanticObject-action"
                }
            }
        ];

        // Act
        return utils.toExternalWithParameters(sSemanticObject, sAction, aParameters).then(() => {
            // Assert
            assert.strictEqual(this.navigateStub.callCount, 1, "navigate was called exactly once.");
            assert.deepEqual(this.navigateStub.args[0], aExpectedArguments, "navigate was called with the correct arguments.");
        });
    });

    QUnit.test("Hash gets build correctly for semanticObject, action, and parameters.", function (assert) {
        // Arrange
        const sSemanticObject = "SemanticObject";
        const sAction = "action";
        const aParameters = [
            { Key: "a", Value: "someValue" },
            { Key: "b", Value: "someOtherValue" }
        ];
        const aExpectedArguments = [
            {
                target: {
                    shellHash: "SemanticObject-action?a=someValue&b=someOtherValue"
                }
            }
        ];

        // Act
        return utils.toExternalWithParameters(sSemanticObject, sAction, aParameters).then(() => {
            // Assert
            assert.strictEqual(this.navigateStub.callCount, 1, "navigate was called exactly once.");
            assert.deepEqual(this.navigateStub.args[0], aExpectedArguments, "navigate was called with the correct arguments.");
        });
    });

    QUnit.test("Hash gets build correctly for semanticObject, action and parameters with action containing an innerAppRoute.", function (assert) {
        // Arrange
        const sSemanticObject = "SemanticObject";
        const sAction = "action&/someInnerAppRoute";
        const aParameters = [
            { Key: "a", Value: "someValue" },
            { Key: "b", Value: "someOtherValue" }
        ];
        const aExpectedArguments = [
            {
                target: {
                    shellHash: "SemanticObject-action?a=someValue&b=someOtherValue&/someInnerAppRoute"
                }
            }
        ];

        // Act
        return utils.toExternalWithParameters(sSemanticObject, sAction, aParameters).then(() => {
            // Assert
            assert.strictEqual(this.navigateStub.callCount, 1, "navigate was called exactly once.");
            assert.deepEqual(this.navigateStub.args[0], aExpectedArguments, "navigate was called with the correct arguments.");
        });
    });

    QUnit.module("sanitizeTimeoutDelay");

    QUnit.test("Does not alter values below the maximum", function (assert) {
        // Act
        const iResult = utils.sanitizeTimeoutDelay(123);
        // Assert
        assert.strictEqual(iResult, 123, "Returned the correct result");
    });

    QUnit.test("Returns the maximum when the value exceeds it", function (assert) {
        // Act
        const iResult = utils.sanitizeTimeoutDelay(123123123123);
        // Assert
        assert.strictEqual(iResult, 2147483647, "Returned the correct result");
    });

    QUnit.test("Throws an error when entering the wrong type", function (assert) {
        // Act & Assert
        assert.throws(utils.sanitizeTimeoutDelay.bind("123"), "Threw an error");
    });

    QUnit.module("getParamKeys");

    QUnit.test("No app state parameters in given in the URL", function (assert) {
        // Arrange
        const oExpectedResult = {
            aAppStateNamesArray: [],
            aAppStateKeysArray: []
        };

        // Act
        const oResult = utils.getParamKeys("some-url?param1=123");

        // Assert
        assert.deepEqual(oResult, oExpectedResult, "No app state parameters found.");
    });

    QUnit.test("sap-intent-param parameter in given in the URL", function (assert) {
        // Arrange
        const oExpectedResult = {
            aAppStateNamesArray: ["sap-intent-param-data"],
            aAppStateKeysArray: ["someValue"]
        };

        // Act
        const oResult = utils.getParamKeys("some-url?sap-intent-param=someValue");

        // Assert
        assert.deepEqual(oResult, oExpectedResult, "App state parameters returned as expected.");
    });

    QUnit.test("sap-xapp-state & sap-iapp-state parameter in given in the URL", function (assert) {
        // Arrange
        const oExpectedResult = {
            aAppStateNamesArray: ["sap-xapp-state-data", "sap-iapp-state-data"],
            aAppStateKeysArray: ["someValue", "otherValue"]
        };

        // Act
        const oResult = utils.getParamKeys("some-url?sap-xapp-state=someValue&sap-iapp-state=otherValue");

        // Assert
        assert.deepEqual(oResult, oExpectedResult, "App state parameters returned as expected.");
    });

    [{
        sTitle: "All params need to be excluded",
        sUrlInput: [
            "http://www.dummy.com/?",
            "sap-ach=123",
            "&sap-fiori-id=123",
            "&sap-hide-intent-link=123",
            "&sap-priority=123",
            "&sap-tag=123",
            "&sap-ui-app-id-hint=123",
            "&sap-ui-debug=123",
            "&sap-ui-fl-control-variant-id=123",
            "&sap-ui-fl-max-layer=123",
            "&sap-ui-tech-hint=123",
            "&sap-ui2-tcode=123",
            "&sap-ui2-wd-app-id=123",
            "&sap-ui2-wd-conf-id=123",
            "&sap-ushell-cdm-site-url=123",
            "&sap-ushell-navmode=123",
            "&sap-ushell-next-navmode=123",
            "&sap-ushell-url=123",
            "&sap-app-origin-hint=123"
        ].join(""),
        sExpectedUrlOutput: "http://www.dummy.com/"
    }, {
        sTitle: "No param need to be excluded. URL remains the same",
        sUrlInput: "http://www.dummy.com/?sap-client=120&sap-language=EN&sap-theme=sap_horizon&P1=PV1&sap-intent-param=AS2QWPKYKPDRKXII9SR0UGPOHLTDV3REG314Q5Z7&" +
            "sap-xapp-state=ASJ8M9FNA9S459UXSXED9MJNBM5I9XOR3YRZOUTJ&sap-ie=edge&sap-keepclientsession=true&sap-touch=0&sap-shell=FLP1.69.0-NWBC",
        sExpectedUrlOutput: "http://www.dummy.com/?sap-client=120&sap-language=EN&sap-theme=sap_horizon&P1=PV1&sap-intent-param=AS2QWPKYKPDRKXII9SR0UGPOHLTDV3REG314Q5Z7&" +
            "sap-xapp-state=ASJ8M9FNA9S459UXSXED9MJNBM5I9XOR3YRZOUTJ&sap-ie=edge&sap-keepclientsession=true&sap-touch=0&sap-shell=FLP1.69.0-NWBC"
    }, {
        sTitle: "One param in the middle need to be excluded",
        sUrlInput: "http://www.dummy.com/?sap-client=120&sap-language=EN&sap-theme=sap_horizon&P1=PV1&sap-ui-debug=true&sap-intent-param=AS2QWPKYKPDRKXII9SR0UGPOHLTDV3REG314Q5Z7&" +
            "sap-xapp-state=ASJ8M9FNA9S459UXSXED9MJNBM5I9XOR3YRZOUTJ&sap-ie=edge&sap-touch=0&sap-shell=FLP1.69.0-NWBC",
        sExpectedUrlOutput: "http://www.dummy.com/?sap-client=120&sap-language=EN&sap-theme=sap_horizon&P1=PV1&sap-intent-param=AS2QWPKYKPDRKXII9SR0UGPOHLTDV3REG314Q5Z7&" +
            "sap-xapp-state=ASJ8M9FNA9S459UXSXED9MJNBM5I9XOR3YRZOUTJ&sap-ie=edge&sap-touch=0&sap-shell=FLP1.69.0-NWBC"
    }, {
        sTitle: "One param at the begining and one at the end",
        sUrlInput: "http://www.dummy.com/sap/bc/nwbc/~canvas;window=app/wda/WDR_TEST_PORTAL_NAV_TARGET/?sap-ui-debug=true&sap-client=120&sap-language=EN&" +
            "sap-theme=sap_horizon&P1=PV1&sap-intent-param=AS2QWPKYKPDRKXII9SR0UGPOHLTDV3REG314Q5Z7&sap-xapp-state=ASJ8M9FNA9S459UXSXED9MJNBM5I9XOR3YRZOUTJ&sap-ie=edge&" +
            "sap-theme=sap_fiori_3&sap-accessibility=false&sap-touch=0&sap-shell=FLP1.69.0-NWBC&sap-ui-tech-hint=false",
        sExpectedUrlOutput: "http://www.dummy.com/sap/bc/nwbc/~canvas;window=app/wda/WDR_TEST_PORTAL_NAV_TARGET/?sap-client=120&sap-language=EN&" +
            "sap-theme=sap_horizon&sap-theme=sap_fiori_3&P1=PV1&sap-intent-param=AS2QWPKYKPDRKXII9SR0UGPOHLTDV3REG314Q5Z7&" +
            "sap-xapp-state=ASJ8M9FNA9S459UXSXED9MJNBM5I9XOR3YRZOUTJ&sap-ie=edge&sap-accessibility=false&sap-touch=0&sap-shell=FLP1.69.0-NWBC"
    }].forEach((oFixture) => {
        QUnit.test(`filterURLParams: ${oFixture.sTitle}`, function (assert) {
            let urlAfterFiler = "";
            urlAfterFiler = utils.filterOutParamsFromLegacyAppURL(oFixture.sUrlInput);
            assert.strictEqual(urlAfterFiler, oFixture.sExpectedUrlOutput);
        });
    });

    QUnit.module("getThemingParameters", {
        beforeEach: function () {
            this.oThemingParametersStub = sandbox.stub(ThemingParameters, "get");
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Handles flow async in case parameters are sync available and only one parameter is requested", async function (assert) {
        // Arrange
        this.oThemingParametersStub.returns("value1");
        const aExpectedResult = [
            "value1"
        ];
        // Act
        const aResult = await utils.getThemingParameters(["param1"]);
        // Assert
        assert.deepEqual(aResult, aExpectedResult, "Resolved the correct result");
    });

    QUnit.test("Handles flow async in case parameters are async available", async function (assert) {
        // Arrange
        this.oThemingParametersStub.callsFake(({ callback }) => {
            callback({
                param1: "value1",
                param2: "value2"
            });
        });
        const aExpectedResult = [
            "value1",
            "value2"
        ];
        // Act
        const aResult = await utils.getThemingParameters(["param1", "param2"]);
        // Assert
        assert.deepEqual(aResult, aExpectedResult, "Resolved the correct result");
    });

    QUnit.test("Handles flow async in case parameters are async available, but undefined is returned", async function (assert) {
        // Arrange
        this.oThemingParametersStub.callsFake(({ callback }) => {
            callback(undefined);
        });
        const aExpectedResult = [
            undefined
        ];
        // Act
        const aResult = await utils.getThemingParameters(["param1"]);
        // Assert
        assert.deepEqual(aResult, aExpectedResult, "Resolved the correct result");
    });

    QUnit.test("Handles flow async in case parameters are sync available", async function (assert) {
        // Arrange
        this.oThemingParametersStub.returns({
            param1: "value1",
            param2: "value2"
        });
        const aExpectedResult = [
            "value1",
            "value2"
        ];
        // Act
        const aResult = await utils.getThemingParameters(["param1", "param2"]);
        // Assert
        assert.deepEqual(aResult, aExpectedResult, "Resolved the correct result");
    });

    QUnit.module("requireAsync", {
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Rejects for non existent dependencies", async function (assert) {
        try {
            // Act
            await utils.requireAsync(["does/not/exist"]);
            assert.ok(false, "promise was rejected");
        } catch {
            // Assert
            assert.ok(true, "promise was rejected");
        }
    });

    QUnit.test("Resolves dependencies", async function (assert) {
        // Act
        const aResult = await utils.requireAsync(["sap/ushell/utils", "sap/ushell/Container"]);
        assert.strictEqual(aResult[0], utils, "Resolved utils");
        assert.strictEqual(aResult[1], Container, "Resolved container");
    });

    [
        { sUi5Version: "1.37.0-SNAPSHOT", expectedVersion: "1.37.0" },
        { sUi5Version: "2.0.0-SNAPSHOT", expectedVersion: "2.0.0" },
        { sUi5Version: "1.124.0-SNAPSHOT+001", expectedVersion: "1.124.0" },
        { sUi5Version: "1", expectedVersion: "1" },
        { sUi5Version: "2", expectedVersion: "2" },
        { sUi5Version: "1.37", expectedVersion: "1.37" },
        { sUi5Version: "0.0.1", expectedVersion: "0.0.1" },
        { sUi5Version: "1.0.0-alpha", expectedVersion: "1.0.0" },
        { sUi5Version: "0.1.0-alpha", expectedVersion: "0.1.0" },
        { sUi5Version: "1.36.3", expectedVersion: "1.36.3" },
        { sUi5Version: "8.0.0-SNAPSHOT", expectedVersion: "8.0.0" },
        { sUi5Version: "1.2.3.4.5", expectedVersion: "1.2.3" },
        // Weird edge cases, VersionInfo.load() should not return strings in this form
        // but I think they still should be documented here
        { sUi5Version: "1..0.1", expectedVersion: "1" },
        { sUi5Version: "1.0.a", expectedVersion: "1.0" },
        { sUi5Version: "-1.2.3", expectedVersion: "1.2.3" }
    ].forEach((oFixture) => {
        QUnit.test(`getUi5Version: returns expected number when UI5 version is ${oFixture.sUi5Version}`, async function (assert) {
            const oGetVersionStub = sandbox.stub(VersionInfo, "load").resolves({ version: oFixture.sUi5Version });

            const sVersion = await utils.getUi5Version();

            assert.strictEqual(sVersion, oFixture.expectedVersion, "returned expected version");

            oGetVersionStub.restore();
        });
    });

    QUnit.module("deepFreeze", {
        afterEach: async function () {
            sandbox.restore();
        }
    });

    QUnit.test("Freezes an object", async function (assert) {
        // Arrange
        const oInputObject = {
            a: 1,
            b: {
                c: 2
            }
        };

        // Act
        const oReturnValue = utils.deepFreeze(oInputObject);
        // Assert
        assert.strictEqual(oReturnValue, oInputObject, "Returned the same object");

        assert.throws(() => {
            oInputObject.a = 2;
        }, "Throws an error when trying to change a property");

        assert.throws(() => {
            oInputObject.b.d = 2;
        }, "Throws an error when trying to add a nested property");
    });

    QUnit.test("Freezes an array", async function (assert) {
        // Arrange
        const oInputObject = [{
            a: 1
        }];

        // Act
        const oReturnValue = utils.deepFreeze(oInputObject);
        // Assert
        assert.strictEqual(oReturnValue, oInputObject, "Returned the same object");

        assert.throws(() => {
            oInputObject[1] = 2;
        }, "Throws an error when trying to add an item");

        assert.throws(() => {
            oInputObject[0] = 2;
        }, "Throws an error when trying to change an item");
    });

    QUnit.module("awaitTimeout", {
        beforeEach: async function () {
            sandbox.useFakeTimers();
        },
        afterEach: async function () {
            sandbox.restore();
        }
    });

    QUnit.test("Awaits the timeout with the provided value", async function (assert) {
        // Arrange
        const done = assert.async();
        const iTimeBefore = Date.now();
        // Act
        utils.awaitTimeout(5000).then(() => {
            // Assert
            assert.strictEqual(Date.now() - iTimeBefore, 5000, "Resolved after 5 seconds");
            done();
        });
        sandbox.clock.runAll();
    });

    QUnit.test("Awaits the timeout with the default value", async function (assert) {
        // Arrange
        const done = assert.async();
        const iTimeBefore = Date.now();
        // Act
        utils.awaitTimeout().then(() => {
            // Assert
            assert.strictEqual(Date.now() - iTimeBefore, 0, "Resolved after 5 seconds");
            done();
        });
        sandbox.clock.runAll();
    });

    QUnit.module("handleSideContent", {
        beforeEach: function () {
            this.oApplySideContentStub = sandbox.stub(utils, "applySideContent");
            this.oParams = {
                hasAdjacentContentBefore: true
            };
            this.oEvent = {
                getParameters: () => this.oParams
            };
        },
        afterEach: async function () {
            sandbox.restore();
        }
    });

    QUnit.test("gets current value for hasAdjacentContentBefore and calls applySideContent with correct params", function (assert) {
        // Act
        utils.handleSideContent.call(this, this.oEvent);
        // Assert
        assert.ok(this.oApplySideContentStub.calledOnce, "applySideContent was called once");
        assert.ok(this.oApplySideContentStub.calledWith(this.oParams.hasAdjacentContentBefore), "applySideContent was called with hasAdjacentContentBefore param");
        assert.strictEqual(this.oApplySideContentStub.thisValues[0], this, "applySideContent was called with correct this");
    });

    QUnit.module("applySideContent", {
        beforeEach: function () {
            this.bHasAdjacentContentBefore = true;
            this.oView = {
                toggleStyleClass: () => {}
            };
            this.oThis = this;
            this.oThis.rootControlLoaded = () => {};
            this.oToggleStyleClassStub = sandbox.stub(this.oView, "toggleStyleClass");
            this.oRootControlLoadedStub = sandbox.stub(this.oThis, "rootControlLoaded").resolves(this.oView);
        },
        afterEach: async function () {
            sandbox.restore();
        }
    });

    QUnit.test("gets the current view and applies the correct style based on bHasAdjacentContentBefore", async function (assert) {
        // Act
        await utils.applySideContent.call(this.oThis, this.bHasAdjacentContentBefore);
        // Assert
        const oToggleStyleClassStubArgs = this.oToggleStyleClassStub.getCall(0).args;
        assert.ok(this.oRootControlLoadedStub.calledOnce, "rootControlLoaded was called once");
        assert.ok(this.oToggleStyleClassStub.calledOnce, "toggleStyleClass was called once");
        assert.strictEqual(oToggleStyleClassStubArgs[0], "sapUshellFixedPadding", "toggleStyleClass was called with correct css class");
        assert.strictEqual(oToggleStyleClassStubArgs[1], this.bHasAdjacentContentBefore, "toggleStyleClass was called with correct second param");
    });
});

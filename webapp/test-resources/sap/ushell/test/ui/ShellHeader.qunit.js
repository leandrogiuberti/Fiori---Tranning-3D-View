// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.ui.ShellHeader
 */
sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/ui/thirdparty/hasher",
    "sap/ui/thirdparty/jquery",
    "sap/ui/core/IconPool",
    "sap/base/util/ObjectPath",
    "sap/m/Button",
    "sap/m/Input",
    "sap/ushell/api/NewExperience",
    "sap/ushell/ui/ShellHeader",
    "sap/ushell/ui/shell/ShellAppTitle",
    "sap/ushell/ui/shell/ShellHeadItem",
    "sap/base/Log",
    "sap/ui/qunit/utils/nextUIUpdate",
    "sap/ushell/resources",
    "sap/ushell/utils",
    "sap/ushell/state/StateManager",
    "sap/ui/events/KeyCodes"
], (
    Localization,
    hasher,
    jQuery,
    IconPool,
    ObjectPath,
    Button,
    Input,
    NewExperience,
    ShellHeader,
    ShellAppTitle,
    ShellHeadItem,
    Log,
    nextUIUpdate,
    resources,
    utils,
    StateManager,
    KeyCodes
) => {
    "use strict";

    // shortcut for sap.ushell.state.StateManager.ShellMode
    const ShellMode = StateManager.ShellMode;

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({
        useFakeTimers: false
    });

    const sSapLogo = sap.ui.require.toUrl("sap/ushell/themes/base/img/SAPLogo.svg");

    QUnit.module("basic tests", {
        beforeEach: function (assert) {
            const done = assert.async();
            // this setTimeout fixes an issue with the not completely deleted objects
            setTimeout(async () => {
                this.oShellHeader = new ShellHeader("shell-header", {
                    logo: sap.ui.require.toUrl("sap/ushell/themes/base/img/SAPLogo.svg"),
                    visible: true,
                    headItems: [
                        new ShellHeadItem("backBtn", { icon: IconPool.getIconURI("nav-back"), ariaLabel: "Back" })
                    ],
                    headEndItems: [
                        new ShellHeadItem("sf", { icon: IconPool.getIconURI("search"), ariaLabel: "Search" })
                    ],
                    title: "Subtitle with a long text",
                    appTitle: new ShellAppTitle("shellAppTitle", { text: "AppTitle with a long text" }),
                    search: new Input()
                });
                this.oShellHeader.placeAt("qunit-fixture");
                await nextUIUpdate();

                done();
            }, 0);
        },
        afterEach: function () {
            this.oShellHeader.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("Logo linked if not on homepage, navigate home", async function (assert) {
        // Arrange
        this.oShellHeader.destroy();
        sandbox.stub(hasher, "getHash").returns("aaa-bbb-ccc");

        this.oShellHeader = new ShellHeader("shell-header", {
            logo: sap.ui.require.toUrl("sap/ushell/themes/base/img/SAPLogo.svg"),
            homeUri: "#Shell-home"
        });

        const oSetHrefStub = sandbox.stub(this.oShellHeader, "_setLocationHref");

        // Act
        this.oShellHeader.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        assert.equal(jQuery(".sapUshellShellIco").attr("href"), "#Shell-home", "Logo is linked");

        // Navigate home
        const oLogo = this.oShellHeader.$("logo")[0];
        this.oShellHeader.onsapspace({
            target: oLogo
        });
        assert.strictEqual(oSetHrefStub.callCount, 1, "_setLocationHref called once");
        assert.strictEqual(oLogo.href, oSetHrefStub.getCall(0).args[0], "Navigate home by space on the logo");
    });

    QUnit.test("Logo is linked on homepage", async function (assert) {
        // Arrange
        this.oShellHeader.destroy();

        sandbox.stub(hasher, "getHash").returns("Shell-home");
        this.oShellHeader = new ShellHeader("shell-header", {
            logo: sap.ui.require.toUrl("sap/ushell/themes/base/img/SAPLogo.svg"),
            visible: true,
            homeUri: "#Shell-home"
        });

        // Act
        this.oShellHeader.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        assert.notOk(jQuery(".sapUshellShellIco").attr("tabindex"), "tabindex is not set");
        assert.ok(jQuery(".sapUshellShellIco").attr("title"), "title is set");
    });

    QUnit.test("Rendering", function (assert) {
        // Arrange
        // Act
        // Assert
        assert.ok(this.oShellHeader.getId() === "shell-header", "Shell Header is rendered");
        assert.ok(jQuery("#shellAppTitle-button").text() === this.oShellHeader.getAppTitle().getText(), "Apptitle is rendered");
        assert.ok(jQuery(".sapUshellShellIco").length === 1, "Logo is rendered");
        assert.ok(jQuery(".sapUshellShellIco").attr("id") === "shell-header-logo", "Logo has an ID");
        assert.ok(jQuery("#sf").length === 1, "Search button is rendered");
    });

    QUnit.test("Test that accessibility property is set correctly", function (assert) {
        // Arrange
        // Act
        // Assert
        const aHeadItems = this.oShellHeader.getHeadItems();
        const aHeadEndItems = this.oShellHeader.getHeadEndItems();

        function assertShellHeaderItem (oItem) {
            if (!oItem.getDomRef()) {
                return;
            }
            const jQueryItem = jQuery(oItem.getDomRef());
            const sId = oItem.getId();
            assert.equal(jQueryItem.attr("tabindex"), 0, `tabindex is set correctly for ShellHeaderItem: ${sId}`);
            assert.equal(jQueryItem.attr("role"), "button", `role is set correctly for ShellHeaderItem: ${sId}`);
            assert.ok(!!jQueryItem.attr("aria-label"), `aria-label is not empty for ShellHeaderItem: ${sId}`);
        }

        aHeadItems.forEach(assertShellHeaderItem);
        aHeadEndItems.forEach(assertShellHeaderItem);
    });

    QUnit.test("setFocusOnShellHeader:", function (assert) {
        [{
            sTestDescription: "navigation direction forward, no HeadItems",
            bForwardNavigation: true,
            bExpectedFocusOnShellHeadItem: false,
            bExpectedFocusOnAppTitle: true,
            bExpectedFocusOnShellHeadEndItem: false
        }, {
            sTestDescription: "navigation direction forward, with HeadItems",
            bForwardNavigation: true,
            bShellHeadItems: true,
            bExpectedFocusOnShellHeadItem: true,
            bExpectedFocusOnAppTitle: false,
            bExpectedFocusOnShellHeadEndItem: false
        }, {
            sTestDescription: "navigation direction backwards, no HeadEndItems",
            bForwardNavigation: false,
            bExpectedFocusOnShellHeadItem: false,
            bExpectedFocusOnAppTitle: true,
            bExpectedFocusOnShellHeadEndItem: false
        }, {
            sTestDescription: "navigation direction backwards, with HeadEndItems",
            bForwardNavigation: false,
            bShellHeadEndItems: true,
            bExpectedFocusOnShellHeadItem: false,
            bExpectedFocusOnAppTitle: false,
            bExpectedFocusOnShellHeadEndItem: true
        }].forEach((oFixture) => {
            // Arrange
            const oFocusResult = {
                bShellHeadItem: false,
                bAppTitle: false,
                bShellHeadEndItem: false
            };

            const fnGetHeadItemsStub = sandbox.stub(this.oShellHeader, "getHeadItems").callsFake(
                () => {
                    return oFixture.bShellHeadItems ? [{
                        focus: function () {
                            oFocusResult.bShellHeadItem = true;
                        }
                    }] : [];
                }
            );
            const fnGetAppTitleStub = sandbox.stub(this.oShellHeader, "getAppTitle").returns({
                focus: function () {
                    oFocusResult.bAppTitle = true;
                }
            });
            const fnGetHeadEndItemsStub = sandbox.stub(this.oShellHeader, "getHeadEndItems").callsFake(
                () => {
                    return oFixture.bShellHeadEndItems ? [{
                        focus: function () {
                            oFocusResult.bShellHeadEndItem = true;
                        }
                    }] : [];
                }
            );
            // Act
            this.oShellHeader.setFocusOnShellHeader(!oFixture.bForwardNavigation);

            // Assert
            assert.strictEqual(
                oFocusResult.bShellHeadItem,
                oFixture.bExpectedFocusOnShellHeadItem,
                `Focus was (not) set on the first shellHeadItem when ${oFixture.sTestDescription}`);
            assert.strictEqual(
                oFocusResult.bAppTitle,
                oFixture.bExpectedFocusOnAppTitle,
                `Focus was (not) set on the appTitle when ${oFixture.sTestDescription}`);
            assert.strictEqual(
                oFocusResult.bShellHeadEndItem,
                oFixture.bExpectedFocusOnShellHeadEndItem,
                `Focus was (not) set on the last shellHeadEndItem when ${oFixture.sTestDescription}`);

            fnGetHeadItemsStub.restore();
            fnGetAppTitleStub.restore();
            fnGetHeadEndItemsStub.restore();
        });
    });

    QUnit.test("Search State", async function (assert) {
        // open search
        this.oShellHeader.setSearchState("EXP", 10, true);
        await nextUIUpdate();

        let searchContainer = jQuery("#shell-header-hdr-search");
        let maxWidth = searchContainer[0].style.maxWidth;
        assert.strictEqual(maxWidth, "10rem", "Search field width is correctly set");
        assert.strictEqual(searchContainer.width() > 0, true, "Search Field container is visible");
        assert.strictEqual(searchContainer.attr("data-help-id"), "shellHeader-search");

        // close search
        this.oShellHeader.setSearchState("COL", 10, true);
        await nextUIUpdate();

        searchContainer = jQuery("#shell-header-hdr-search");
        maxWidth = searchContainer[0].style.maxWidth;
        assert.strictEqual(maxWidth, "0rem", "Search field width is correctly set");
        assert.strictEqual(searchContainer.width(), 0, "Search Field container is invisible");
    });

    QUnit.module("Focus test - searchfield", {
        beforeEach: function (assert) {
            const done = assert.async();
            // this setTimeout fixes an issue with the not completely deleted objects
            setTimeout(async () => {
                this.oShellHeader = new ShellHeader("shell-header", {
                    logo: sap.ui.require.toUrl("sap/ushell/themes/base/img/SAPLogo.svg"),
                    visible: true,
                    headEndItems: [
                        new ShellHeadItem("searchFieldInShell-input", { icon: IconPool.getIconURI("alert"), ariaLabel: "Search" }),
                        new ShellHeadItem("sf", { icon: IconPool.getIconURI("search"), ariaLabel: "Search" })
                    ],
                    title: "Subtitle with a long text",
                    appTitle: new ShellAppTitle("shellAppTitle", { text: "AppTitle with a long text" }),
                    search: new Input()
                });
                this.oShellHeader.placeAt("qunit-fixture");
                await nextUIUpdate();

                done();
            }, 0);
        },
        afterEach: function () {
            this.oShellHeader.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("Focus set on search item after searchfield is collapsed", async function (assert) {
        this.oShellHeader.setSearchState("EXP", 10, true);
        await nextUIUpdate();

        // close search
        this.oShellHeader.setSearchState("COL", 10, true);
        await nextUIUpdate();

        this.oShellHeader.setFocusOnSearchAfterRender();

        assert.strictEqual(document.activeElement, this.oShellHeader.getHeadEndItems()[1].getDomRef(), "search item is focused");
    });

    QUnit.test("_getLeanMode", function (assert) {
        sandbox.stub(StateManager, "getShellMode");

        StateManager.getShellMode.returns(ShellMode.Headerless);
        assert.ok(this.oShellHeader._getLeanMode() === false, "lean mode correctly returned: false");
        StateManager.getShellMode.returns(ShellMode.Lean);
        assert.ok(this.oShellHeader._getLeanMode() === true, "lean mode correctly returned: true");
        StateManager.getShellMode.returns(ShellMode.Default);
        assert.ok(this.oShellHeader._getLeanMode() === false, "lean mode correctly returned: false");
    });

    QUnit.module("test accessibility roles", {
        beforeEach: function () {
            this.oShellHeader = new ShellHeader("shell-header", {
                visible: true,
                logo: sap.ui.require.toUrl("sap/ushell/themes/base/img/SAPLogo.svg"),
                headItems: [
                    new ShellHeadItem("backBtn", {
                        icon: IconPool.getIconURI("nav-back"),
                        target: "#Shell-home",
                        ariaLabel: "Back"
                    })
                ],
                headEndItems: [
                    new ShellHeadItem("userMenu", {
                        icon: IconPool.getIconURI("action-settings"),
                        ariaLabel: "User Settings",
                        ariaHaspopup: "dialog"
                    })
                ],
                title: "Subtitle with a long text",
                appTitle: new ShellAppTitle("shellAppTitle", { text: "AppTitle with a long text" })
            });
            this.oShellHeader.placeAt("qunit-fixture");

            return nextUIUpdate();
        },
        afterEach: function () {
            sandbox.restore();
            this.oShellHeader.destroy();
        }
    });

    QUnit.test("Accessibility role set correctly for head items", function (assert) {
        const oButton1 = this.oShellHeader.getHeadItems()[0];
        const oButton2 = this.oShellHeader.getHeadEndItems()[0];
        assert.strictEqual(oButton1.$().attr("role"), "link", "navigation items should have aria role 'link'.");
        assert.strictEqual(oButton1.$().attr("aria-haspopup"), undefined, "aria-haspopup is not set specified.");
        assert.strictEqual(oButton2.$().attr("role"), "button", "normal items should have aria role 'button'.");
        assert.strictEqual(oButton2.$().attr("aria-haspopup"), "dialog", "aria-haspopup is correctly specified.");
    });

    QUnit.test("Accessibility role set correctly for the home button", function (assert) {
        assert.strictEqual(document.getElementById("shell-header-logo").getAttribute("role"), "button", "the home button has role 'button'");
    });

    QUnit.module("isHomepage", {
        beforeEach: function () {
            this.originalRootIntent = ObjectPath.get("renderers.fiori2.componentData.config.rootIntent", window["sap-ushell-config"]);
            this.oShellHeader = new ShellHeader();
            this.oHashStub = sandbox.stub(hasher, "getHash");

            this.setHomeUri = function (sIntent) {
                this.oShellHeader.setHomeUri(sIntent);
                ObjectPath.set("renderers.fiori2.componentData.config.rootIntent", sIntent, window["sap-ushell-config"]);
            };
        },
        afterEach: function () {
            ObjectPath.set("renderers.fiori2.componentData.config.rootIntent", this.originalRootIntent, window["sap-ushell-config"]);
            this.oShellHeader.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("no special root intent - hash is #Shell-home", function (assert) {
        // Arrange
        this.oHashStub.returns("Shell-home");

        // Act
        const bIsHomepage = this.oShellHeader.isHomepage();
        // Assert
        assert.strictEqual(bIsHomepage, true, "Should return true.");
    });

    QUnit.test("no special root intent - hash is #Shell-home?", function (assert) {
        // Arrange
        this.oHashStub.returns("Shell-home?");

        // Act
        const bIsHomepage = this.oShellHeader.isHomepage();
        // Assert
        assert.strictEqual(bIsHomepage, true, "Should return true.");
    });

    QUnit.test("no special root intent - hash is #Launchpad-openFLPPage", function (assert) {
        // Arrange
        this.oHashStub.returns("Launchpad-openFLPPage");

        // Act
        const bIsHomepage = this.oShellHeader.isHomepage();
        // Assert
        assert.strictEqual(bIsHomepage, true, "Should return true.");
    });

    QUnit.test("no special root intent - hash is #Launchpad-openFLPPage?pageId=somePageId&spaceId=someSpaceId", function (assert) {
        // Arrange
        this.oHashStub.returns("Launchpad-openFLPPage?pageId=somePageId&spaceId=someSpaceId");

        // Act
        const bIsHomepage = this.oShellHeader.isHomepage();
        // Assert
        assert.strictEqual(bIsHomepage, true, "Should return true.");
    });

    QUnit.test("no special root intent - hash is #Sales-manage", function (assert) {
        // Arrange
        this.oHashStub.returns("Sales-manage");

        // Act
        const bIsHomepage = this.oShellHeader.isHomepage();
        // Assert
        assert.strictEqual(bIsHomepage, false, "Should return false.");
    });

    QUnit.test("no special root intent - hash is #some-hash?withParam=value", function (assert) {
        // Arrange
        this.oHashStub.returns("some-hash?withParam=value");

        // Act
        const bIsHomepage = this.oShellHeader.isHomepage();
        // Assert
        assert.strictEqual(bIsHomepage, false, "Should return false.");
    });

    QUnit.test("root intent is #Sales-manage - hash is #Shell-home", function (assert) {
        // Arrange
        this.setHomeUri("#Sales-manage");
        this.oHashStub.returns("Shell-home");

        // Act
        const bIsHomepage = this.oShellHeader.isHomepage();
        // Assert
        assert.strictEqual(bIsHomepage, false, "Should return false.");
    });

    QUnit.test("root intent is #Sales-manage - hash is #Shell-home?", function (assert) {
        // Arrange
        this.setHomeUri("#Sales-manage");
        this.oHashStub.returns("Shell-home?");

        // Act
        const bIsHomepage = this.oShellHeader.isHomepage();
        // Assert
        assert.strictEqual(bIsHomepage, false, "Should return false.");
    });

    QUnit.test("root intent is #Sales-manage - hash is #Launchpad-openFLPPage", function (assert) {
        // Arrange
        this.setHomeUri("#Sales-manage");
        this.oHashStub.returns("Launchpad-openFLPPage");

        // Act
        const bIsHomepage = this.oShellHeader.isHomepage();
        // Assert
        assert.strictEqual(bIsHomepage, true, "Should return true.");
    });

    QUnit.test("root intent is #Sales-manage - hash is #Launchpad-openFLPPage?pageId=somePageId&spaceId=someSpaceId", function (assert) {
        // Arrange
        this.setHomeUri("#Sales-manage");
        this.oHashStub.returns("Launchpad-openFLPPage?pageId=somePageId&spaceId=someSpaceId");

        // Act
        const bIsHomepage = this.oShellHeader.isHomepage();
        // Assert
        assert.strictEqual(bIsHomepage, true, "Should return true.");
    });

    QUnit.test("root intent is #Sales-manage - hash is #Sales-manage", function (assert) {
        // Arrange
        this.setHomeUri("#Sales-manage");
        this.oHashStub.returns("Sales-manage");

        // Act
        const bIsHomepage = this.oShellHeader.isHomepage();
        // Assert
        assert.strictEqual(bIsHomepage, true, "Should return true.");
    });

    QUnit.test("no special root intent - hash is #some-hash?withParam=value", function (assert) {
        // Arrange
        this.setHomeUri("#Sales-manage");
        this.oHashStub.returns("some-hash?withParam=value");

        // Act
        const bIsHomepage = this.oShellHeader.isHomepage();
        // Assert
        assert.strictEqual(bIsHomepage, false, "Should return false.");
    });

    QUnit.test("root intent is #Sales-manage and hash is Sales-manage?", function (assert) {
        // Arrange
        this.setHomeUri("#Sales-manage");
        this.oHashStub.returns("SalesManage?");

        // Act
        const bIsHomepage = this.oShellHeader.isHomepage();
        // Assert
        assert.strictEqual(bIsHomepage, false, "Should return false.");
    });

    QUnit.test("root intent is #Sales-manage and hash is Sales-manage", function (assert) {
        // Arrange
        this.setHomeUri("#Sales-manage");
        this.oHashStub.returns("SalesManag");

        // Act
        const bIsHomepage = this.oShellHeader.isHomepage();
        // Assert
        assert.strictEqual(bIsHomepage, false, "Should return false.");
    });

    QUnit.test("root intent is #Sales-manage and hash is Sales-manage?param1=1", function (assert) {
        // Arrange
        this.setHomeUri("#Sales-manage");
        this.oHashStub.returns("SalesManage?param1=1");

        // Act
        const bIsHomepage = this.oShellHeader.isHomepage();
        // Assert
        assert.strictEqual(bIsHomepage, false, "Should return true.");
    });

    QUnit.test("root intent is #Sales-manage and hash is Sales-manage&/home", function (assert) {
        // Arrange
        this.setHomeUri("#Sales-manage");
        this.oHashStub.returns("Sales-manage&/home");

        // Act
        const bIsHomepage = this.oShellHeader.isHomepage();
        // Assert
        assert.strictEqual(bIsHomepage, false, "Should return false.");
    });

    QUnit.test("root intent is #Sales-manage and hash is Sales-manage?param1=1&/home", function (assert) {
        // Arrange
        this.setHomeUri("#Sales-manage");
        this.oHashStub.returns("Sales-manage?param1=1&/home");

        // Act
        const bIsHomepage = this.oShellHeader.isHomepage();
        // Assert
        assert.strictEqual(bIsHomepage, false, "Should return false.");
    });

    QUnit.module("Event delegates", {
        beforeEach: function () {
            this.oPreventDefaultStub = sandbox.stub();
            this.oAddDelegateStub = sandbox.stub(ShellHeader.prototype, "addDelegate");
            this.oShellHeader = new ShellHeader();
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.module("setHomeUri", {
        beforeEach: function () {
            this.oShellHeader = new ShellHeader();
        },
        afterEach: function () {
            sandbox.restore();
            this.oShellHeader.destroy();
        }
    });

    QUnit.test("Sets the homeUri property to the value and returns an instance of ShellHeader", function (assert) {
        // Arrange
        const sUri = "#foo-bar";
        // Act
        const oResult = this.oShellHeader.setHomeUri(sUri);
        // Assert
        assert.strictEqual(this.oShellHeader.mProperties.homeUri, sUri, "The property was updated");
        assert.strictEqual(oResult.isA("sap.ushell.ui.ShellHeader"), true, "An instance of ShellHeader was returned");
    });

    QUnit.test("Does not set the homeUri property if the new value contains an invalid protocol", function (assert) {
        // Arrange
        // eslint-disable-next-line no-script-url
        const sUri = "javascript:alert('Hey there!')";
        const oLogStub = sandbox.stub(Log, "fatal");
        // Act
        this.oShellHeader.setHomeUri(sUri);
        // Assert
        assert.strictEqual(this.oShellHeader.mProperties.homeUri, "", "The value was replaced by an empty string");
        assert.strictEqual(oLogStub.callCount, 1, "One error was logged");
    });

    QUnit.module("_setLocationHref", {
        beforeEach: function () {
            this.oShellHeader = new ShellHeader();
        },
        afterEach: function () {
            sandbox.restore();
            this.oShellHeader.destroy();
        }
    });

    QUnit.test("does not navigate and logs an error instead when the target contains an invalid protocol", function (assert) {
        // Arrange
        // eslint-disable-next-line no-script-url
        const sUrl = "javascript:alert('Hey there!')";
        const oLogStub = sandbox.stub(Log, "fatal");
        // Act
        this.oShellHeader._setLocationHref(sUrl);
        // Assert
        assert.strictEqual(oLogStub.callCount, 1, "One error was logged");
    });

    QUnit.module("Logo tooltip", {
        afterEach: function () {
            if (this.oShellHeader) {
                this.oShellHeader.destroy();
                delete this.oShellHeader;
            }
            sandbox.restore();
        }
    });

    QUnit.test("current home intent is root", async function (assert) {
        this.oShellHeader = new ShellHeader("shell-header", {
            logo: sap.ui.require.toUrl("sap/ushell/themes/base/img/SAPLogo.svg"),
            homeUri: "#Shell-home"
        });

        this.oShellHeader.placeAt("qunit-fixture");
        await nextUIUpdate();

        assert.strictEqual(jQuery(".sapUshellShellIco").attr("title"), resources.i18n.getText("homeBtn_tooltip_text"), "Navigate to home");
    });

    QUnit.test("current home intent ids not root", async function (assert) {
        sandbox.stub(utils, "isRootIntent").returns(false); // The current intent is not root intent
        this.oShellHeader = new ShellHeader("shell-header", {
            logo: sap.ui.require.toUrl("sap/ushell/themes/base/img/SAPLogo.svg"),
            homeUri: "#Shell-home"
        });

        this.oShellHeader.placeAt("qunit-fixture");
        await nextUIUpdate();

        assert.strictEqual(jQuery(".sapUshellShellIco").attr("title"), resources.i18n.getText("lastPage_tooltip"), "Navigate to last opened page");
    });

    QUnit.module("getNewExperienceSwitchControl", {
        beforeEach: async function () {
            this.oShellHeader = new ShellHeader();
        },
        afterEach: async function () {
            sandbox.restore();
            this.oShellHeader.destroy();
        }
    });

    QUnit.test("Returns undefined when NewExperience is disabled", async function (assert) {
        // Arrange
        sandbox.stub(NewExperience, "isActive").returns(true);
        // Act
        const oControl = this.oShellHeader.getNewExperienceSwitchControl();
        // Assert
        assert.notOk(oControl, "The control is undefined");
    });

    QUnit.test("Returns undefined when NewExperience is enabled and switch is hidden", async function (assert) {
        // Arrange
        sandbox.stub(NewExperience, "isActive").returns(true);
        // Act
        const oControl = this.oShellHeader.getNewExperienceSwitchControl();
        // Assert
        assert.notOk(oControl, "The control is undefined");
    });

    QUnit.test("Returns control when NewExperience is enabled and switch is visible", async function (assert) {
        // Arrange
        const oButton = new Button();
        this.oShellHeader.setShowNewExperienceSwitch(true);
        sandbox.stub(NewExperience, "isActive").returns(true);
        sandbox.stub(NewExperience, "getShellHeaderControl").returns(oButton);
        // Act
        const oControl = this.oShellHeader.getNewExperienceSwitchControl();
        // Assert
        assert.strictEqual(oControl, oButton, "The correct control was returned");
    });

    QUnit.module("_handleOnKeyDown - Header with Back Button", {
        beforeEach: async function (assert) {
            this.oItem = new ShellHeadItem("customButton", { icon: IconPool.getIconURI("alert"), ariaLabel: "Alert" });
            this.oSearchButton = new ShellHeadItem("sf", { icon: IconPool.getIconURI("search"), ariaLabel: "Search" });
            this.oSearchInput = new Input("searchInput");

            // this shell header should be rendered in the following order: 0 backBtn, 1 logo, 2 customButton, 3 appTitle, 4 sf
            this.oShellHeader = new ShellHeader("shell-header", {
                logo: sap.ui.require.toUrl("sap/ushell/themes/base/img/SAPLogo.svg"),
                visible: true,
                headItems: [
                    new ShellHeadItem("backBtn", { icon: IconPool.getIconURI("nav-back"), ariaLabel: "Back" }),
                    this.oItem
                ],
                headEndItems: [
                    this.oSearchButton
                ],
                title: "Subtitle with a long text",
                appTitle: new ShellAppTitle("shellAppTitle", { text: "AppTitle with a long text" }),
                search: this.oSearchInput
            });
            this.oShellHeader.placeAt("qunit-fixture");
            await nextUIUpdate();
        },
        afterEach: function () {
            this.oShellHeader.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("Focus set on search item (sf) when focus is on app title and user presses RIGHT arrow key", function (assert) {
        // Arrange
        const oAppTitle = this.oShellHeader.getAppTitle();

        oAppTitle.focus();
        const oEvent = {
            keyCode: KeyCodes.ARROW_RIGHT,
            key: "ArrowRight",
            preventDefault: sandbox.stub()
        };

        // Act
        this.oShellHeader._handleOnKeyDown(oEvent);
        // Assert
        assert.strictEqual(document.activeElement, this.oSearchButton.getDomRef(), "The focus is set on the search function");
    });

    QUnit.test("Focus is set on custom item when focus is on the logo and the user presses the RIGHT arrow key", function (assert) {
        // Arrange
        const oLogo = document.getElementById("shell-header-logo");

        oLogo.focus();
        const oEvent = {
            keyCode: KeyCodes.ARROW_RIGHT,
            key: "ArrowRight",
            preventDefault: sandbox.stub()
        };

        // Act
        this.oShellHeader._handleOnKeyDown(oEvent);
        // Assert
        assert.strictEqual(document.activeElement, this.oItem.getDomRef(), "The focus is set on the custom head item");
    });

    QUnit.test("Focus stays on search item (sf) if RIGHT arrow key is pressed", function (assert) {
        // Arrange
        this.oSearchButton.focus();

        const oEvent = {
            keyCode: KeyCodes.ARROW_RIGHT,
            key: "ArrowRight",
            preventDefault: sandbox.stub()
        };

        // Act
        this.oShellHeader._handleOnKeyDown(oEvent);
        // Assert
        assert.strictEqual(document.activeElement, this.oSearchButton.getDomRef(), "The focus stays on the search item (sf))");
    });

    QUnit.test("Focus stays on back button if LEFT arrow key is pressed", function (assert) {
        // Arrange
        const oBackBtn = this.oShellHeader.getHeadItems()[0];
        oBackBtn.focus();

        const oEvent = {
            keyCode: KeyCodes.ARROW_LEFT,
            key: "ArrowLeft",
            preventDefault: sandbox.stub()
        };

        // Act
        this.oShellHeader._handleOnKeyDown(oEvent);
        // Assert
        assert.strictEqual(document.activeElement, this.oShellHeader.getHeadItems()[0].getDomRef(), "The focus stays on the back button");
    });

    QUnit.test("Focus is set on back button when focus in on logo and user presses LEFT arrow key", function (assert) {
        // Arrange
        const oLogo = document.getElementById("shell-header-logo");

        oLogo.focus();
        const oEvent = {
            keyCode: KeyCodes.ARROW_LEFT,
            key: "ArrowLeft",
            preventDefault: sandbox.stub()
        };

        // Act
        this.oShellHeader._handleOnKeyDown(oEvent);
        // Assert
        assert.strictEqual(document.activeElement, this.oShellHeader.getHeadItems()[0].getDomRef(), "The focus is set on the back button");
    });

    QUnit.test("Focus is set on app title when focus is on search item and user presses LEFT arrow key", function (assert) {
        // Arrange
        const oAppTitleButton = this.oShellHeader.getAppTitle().getDomRef().children[1];
        this.oSearchButton.focus();

        const oEvent = {
            keyCode: KeyCodes.ARROW_LEFT,
            key: "ArrowLeft",
            preventDefault: sandbox.stub()
        };

        // Act
        this.oShellHeader._handleOnKeyDown(oEvent);
        // Assert
        assert.strictEqual(document.activeElement, oAppTitleButton, "The focus is set on the app title");
    });

    QUnit.test("Focus is not set on logo when focus is on search input and user presses LEFT arrow key", async function (assert) {
        // Arrange
        this.oShellHeader.setSearchState("EXP");
        await nextUIUpdate();
        this.oSearchInput.focus();
        this.oShellHeader.setSearchState("COL");
        await nextUIUpdate();

        const oEvent = {
            keyCode: KeyCodes.ARROW_LEFT,
            key: "ArrowLeft",
            preventDefault: sandbox.stub()
        };

        // Act
        this.oShellHeader._handleOnKeyDown(oEvent);

        // Assert
        assert.strictEqual(document.activeElement, this.oSearchInput.getFocusDomRef(), "The focus is still on the search input");
    });

    QUnit.test("Focus is not set on back button when focus is on search input and user presses LEFT arrow key W/O rendered logo", async function (assert) {
        // Arrange
        this.oShellHeader.setSearchState("EXP");
        this.oShellHeader.setLogo(undefined);
        await nextUIUpdate();
        this.oSearchInput.focus();
        this.oShellHeader.setSearchState("COL");
        await nextUIUpdate();

        const oEvent = {
            keyCode: KeyCodes.ARROW_LEFT,
            key: "ArrowLeft",
            preventDefault: sandbox.stub()
        };

        // Act
        this.oShellHeader._handleOnKeyDown(oEvent);

        // Assert
        assert.strictEqual(document.activeElement, this.oSearchInput.getFocusDomRef(), "The focus is still on the search input.");
    });

    QUnit.test("Focuses the search item after END key is pressed", function (assert) {
        // Arrange
        const oBackBtn = this.oShellHeader.getHeadItems()[0];
        oBackBtn.focus();

        const oEvent = {
            keyCode: KeyCodes.END,
            key: "End",
            preventDefault: sandbox.stub()
        };

        // Act
        this.oShellHeader._handleOnKeyDown(oEvent);
        // Assert
        assert.strictEqual(document.activeElement, this.oSearchButton.getDomRef(), "The search item is focused");
    });

    QUnit.test("Focuses the back button after HOME key is pressed", function (assert) {
        // Arrange
        this.oSearchButton.focus();

        const oEvent = {
            keyCode: KeyCodes.HOME,
            key: "Home",
            preventDefault: sandbox.stub()
        };

        // Act
        this.oShellHeader._handleOnKeyDown(oEvent);
        // Assert
        assert.strictEqual(document.activeElement, this.oShellHeader.getHeadItems()[0].getDomRef(), "The back button is focused");
    });

    QUnit.module("_handleOnKeyDown - Header w/o Back Button", {
        beforeEach: async function (assert) {
            this.oSearchButton = new ShellHeadItem("sf", { icon: IconPool.getIconURI("search"), ariaLabel: "Search" });
            this.oSearchInput = new Input("searchInput");

            // this shell header should be rendered in the following order: 0 logo, 1 appTitle, 2 sf
            this.oShellHeader = new ShellHeader("shell-header", {
                logo: sap.ui.require.toUrl("sap/ushell/themes/base/img/SAPLogo.svg"),
                visible: true,
                headItems: [
                ],
                headEndItems: [
                    this.oSearchButton
                ],
                appTitle: new ShellAppTitle("shellAppTitle", { text: "AppTitle with a long text" }),
                search: this.oSearchInput
            });
            this.oShellHeader.placeAt("qunit-fixture");
            await nextUIUpdate();
        },
        afterEach: function () {
            this.oShellHeader.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("Focus set on logo when focus is on app title and user presses LEFT arrow key", function (assert) {
        // Arrange
        const oAppTitle = this.oShellHeader.getAppTitle();

        oAppTitle.focus();
        const oEvent = {
            keyCode: KeyCodes.ARROW_LEFT,
            key: "ArrowLeft",
            preventDefault: sandbox.stub()
        };

        // Act
        this.oShellHeader._handleOnKeyDown(oEvent);
        // Assert
        assert.strictEqual(document.activeElement, document.getElementById("shell-header-logo"), "The focus is set on the logo");
    });

    QUnit.test("Focus is set on search item (sf) when focus is on appTitle and the user presses the RIGHT arrow key", function (assert) {
        // Arrange
        const oAppTitle = this.oShellHeader.getAppTitle();

        oAppTitle.focus();
        const oEvent = {
            keyCode: KeyCodes.ARROW_RIGHT,
            key: "ArrowRight",
            preventDefault: sandbox.stub()
        };

        // Act
        this.oShellHeader._handleOnKeyDown(oEvent);
        // Assert
        assert.strictEqual(document.activeElement, this.oSearchButton.getDomRef(), "The focus is set on the search function");
    });

    QUnit.test("Focus is set on app title when focus is on app logo and user presses the LEFT arrow key WITH RTL", function (assert) {
        // Arrange
        const oLogo = document.getElementById("shell-header-logo");
        const oAppTitle = this.oShellHeader.getAppTitle();
        oLogo.focus();

        const oEvent = {
            keyCode: KeyCodes.ARROW_LEFT,
            key: "ArrowLeft",
            preventDefault: sandbox.stub()
        };

        sandbox.stub(Localization, "getRTL").returns(true);

        // Act
        this.oShellHeader._handleOnKeyDown(oEvent);
        // Assert
        assert.strictEqual(document.activeElement, oAppTitle.getDomRef().children[1], "The focus is set on the app title");
    });

    QUnit.module("_handleOnBeforeFastNavigationFocus", {
        beforeEach: async function (assert) {
            this.oCustomButton = new ShellHeadItem("customButton");
            this.oSearchButton = new ShellHeadItem("searchfld", { icon: IconPool.getIconURI("search"), ariaLabel: "Search" });
            this.oSearchInput = new Input("searchInput");

            // this shell header should be rendered in the following order: 0 logo, 1 appTitle, 2 searchfield
            this.oShellHeader = new ShellHeader("shell-header", {
                logo: sap.ui.require.toUrl("sap/ushell/themes/base/img/SAPLogo.svg"),
                visible: true,
                headItems: [
                    this.oCustomButton
                ],
                headEndItems: [
                    this.oSearchButton
                ],
                appTitle: new ShellAppTitle("shellAppTitle", { text: "AppTitle with a long text" }),
                search: this.oSearchInput
            });
            this.oShellHeader.placeAt("qunit-fixture");
            await nextUIUpdate();
        },
        afterEach: function () {
            this.oShellHeader.destroy();
            this.oSearchButton.destroy();
            this.oSearchInput.destroy();
            this.oCustomButton.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("Focus on the last visited header item which has been set", function (assert) {
        // Arrange
        this.oShellHeader.getAppTitle().getDomRef().children[1].focus();

        this.oShellHeader._handleArrowNavigation({
            keyCode: KeyCodes.ARROW_RIGHT
        });
        const oSetFocusSpy = sandbox.spy(this.oShellHeader, "setFocusOnShellHeader");

        // Act
        this.oShellHeader._handleOnBeforeFastNavigationFocus({
            preventDefault: sandbox.stub()
        });

        // Assert
        assert.strictEqual(oSetFocusSpy.callCount, 0, "The focus method was not called once.");
        assert.strictEqual(document.activeElement, this.oSearchButton.getFocusDomRef(), "The focus is set on the search button");
    });

    QUnit.test("Focus on the last visited header item which has been set into search input", async function (assert) {
        // Arrange
        this.oShellHeader.setSearchState("EXP");
        await nextUIUpdate();
        this.oShellHeader.getAppTitle().getDomRef().children[1].focus();

        this.oShellHeader._handleArrowNavigation({
            keyCode: KeyCodes.ARROW_RIGHT
        });
        const oSetFocusSpy = sandbox.spy(this.oShellHeader, "setFocusOnShellHeader");

        // Act
        this.oShellHeader._handleOnBeforeFastNavigationFocus({
            preventDefault: sandbox.stub()
        });

        // Assert
        assert.strictEqual(oSetFocusSpy.callCount, 0, "The focus method was not called once.");
        assert.strictEqual(document.activeElement, this.oSearchInput.getFocusDomRef(), "The focus is set on the search input");
    });

    QUnit.test("Focus on the app logo when no last visited header item has been set", function (assert) {
        // Arrange
        document.getElementById("shell-header-logo").focus();
        const oSetFocusSpy = sandbox.spy(this.oShellHeader, "setFocusOnShellHeader");

        // Act
        this.oShellHeader._handleOnBeforeFastNavigationFocus({
            preventDefault: sandbox.stub()
        });

        // Assert
        assert.strictEqual(oSetFocusSpy.callCount, 0, "The focus method was not called.");
        assert.strictEqual(document.activeElement, document.getElementById("shell-header-logo"), "The focus is set on the logo");
    });

    QUnit.test("Focus is set on logo when focus is on search input and user presses LEFT arrow key", async function (assert) {
        // Arrange
        this.oShellHeader.setSearchState("EXP");
        await nextUIUpdate();
        this.oSearchInput.focus();
        this.oShellHeader.setSearchState("COL");
        await nextUIUpdate();

        // Act
        this.oShellHeader._handleOnBeforeFastNavigationFocus({
            preventDefault: sandbox.stub()
        });
        // Assert
        assert.strictEqual(document.activeElement, document.getElementById("shell-header-logo"), "The focus is set on the logo");
    });

    QUnit.test("Focus is set on back button when focus is on search input and user presses LEFT arrow key W/O rendered logo", async function (assert) {
        // Arrange
        this.oShellHeader.setSearchState("EXP");
        this.oShellHeader.setLogo(undefined);
        await nextUIUpdate();
        this.oSearchInput.focus();
        this.oShellHeader.setSearchState("COL");
        await nextUIUpdate();

        // Act
        this.oShellHeader._handleOnBeforeFastNavigationFocus({
            preventDefault: sandbox.stub()
        });
        // Assert
        assert.strictEqual(document.activeElement, this.oCustomButton.getFocusDomRef(), "The focus is set on the logo");
    });

    QUnit.module("RTA integration", {
        afterEach: async function () {
            sandbox.restore();
        }
    });

    QUnit.test("Forwards the current logo of the ShellHeader", async function (assert) {
        // Arrange
        const oShellHeader = new ShellHeader({
            logo: sSapLogo
        });

        // Act
        const sLogo = oShellHeader.getLogo();
        const bShowLogo = oShellHeader.getShowLogo();

        // Assert
        assert.strictEqual(sLogo, sSapLogo, "The logo is set correctly");
        assert.strictEqual(bShowLogo, true, "The logo is shown");

        // Cleanup
        oShellHeader.destroy();
    });

    QUnit.test("Forwards the no logo if undefined", async function (assert) {
        // Arrange
        const oShellHeader = new ShellHeader({
        });

        // Act
        const sLogo = oShellHeader.getLogo();
        const bShowLogo = oShellHeader.getShowLogo();

        // Assert
        assert.strictEqual(sLogo, "", "The logo is set correctly");
        assert.strictEqual(bShowLogo, false, "The logo is not shown");

        // Cleanup
        oShellHeader.destroy();
    });
});

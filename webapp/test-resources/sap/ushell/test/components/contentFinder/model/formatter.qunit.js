// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.contentFinder.model.formatter
 */
sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/ui/core/message/MessageType",
    "sap/ushell/components/contentFinder/model/formatter",
    "sap/m/library"
], (
    Localization,
    MessageType,
    formatter,
    mLibrary
) => {
    "use strict";
    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox();
    const IllustratedMessageType = mLibrary.IllustratedMessageType;
    const ListMode = mLibrary.ListMode;

    QUnit.module("FormatVisualizationsListMode formatter");

    QUnit.test("Personalization is enabled and visualization filter is tiles", function (assert) {
        // Act
        const sListModeResult = formatter.formatVisualizationsListMode(true, "tiles");

        // Assert
        assert.strictEqual(sListModeResult, ListMode.MultiSelect, "The list mode was set to MultiSelect.");
    });

    QUnit.test("Personalization is enabled and visualization filter is not tiles", function (assert) {
        // Act
        const sListModeResult = formatter.formatVisualizationsListMode(true, "cardsOrOtherWidgets");

        // Assert
        assert.strictEqual(sListModeResult, ListMode.SingleSelectMaster, "The list mode was set to SingleSelectMaster.");
    });

    QUnit.test("Personalization is false and visualization filter is set", function (assert) {
        // Act
        const sListModeResult = formatter.formatVisualizationsListMode(false, "tiles");

        // Assert
        assert.strictEqual(sListModeResult, ListMode.None, "The list mode was set to none.");
    });

    QUnit.module("FormatIsVisualizationAdded formatter", {
        beforeEach: function () {
            this.oMapHasStub = sandbox.stub();
            formatter.getOwnerComponent = sandbox.stub().returns({
                oRestrictedVisualizationsMap: {
                    has: this.oMapHasStub
                }
            });
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Visualization with ID is already added", function (assert) {
        // Arrange
        const sId = "test-id-0";
        this.oMapHasStub.withArgs(sId).returns(true);

        // Act
        const sResult = formatter.formatIsVisualizationAdded(sId, [{ id: sId }]);

        // Assert
        assert.deepEqual(this.oMapHasStub.firstCall.args, [sId], "The map has was called with the correct ID.");
        assert.strictEqual(sResult, MessageType.Information, "The message type was set to Information.");
    });

    QUnit.test("visualization with ID is not added", function (assert) {
        // Arrange
        const sId = "test-id-1";
        this.oMapHasStub.withArgs(sId).returns(false);

        // Act
        const sResult = formatter.formatIsVisualizationAdded(sId, [{ id: sId }]);

        // Assert
        assert.deepEqual(this.oMapHasStub.firstCall.args, [sId], "The map has was called with the correct ID.");
        assert.strictEqual(sResult, MessageType.None, "The message type was set to Information.");
    });

    QUnit.test("Visualization with ID is already added but visualizations array is not provided", function (assert) {
        // Arrange
        const sId = "test-id-0";
        this.oMapHasStub.withArgs(sId).returns(true);

        // Act
        const sResult = formatter.formatIsVisualizationAdded(sId, undefined);

        // Assert
        assert.strictEqual(this.oMapHasStub.callCount, 0, "The map has was not called.");
        assert.strictEqual(sResult, MessageType.None, "The message type was set to None.");
    });

    QUnit.module("formatVisualizationSelected formatter");

    QUnit.test("Check if the AppBox is selected or not", function (assert) {
        // Act
        const bResult1 = formatter.formatVisualizationSelected("test-tile-id-0", [{
            id: "test-tile-id-1"
        }, {
            id: "test-tile-id-2"
        }, {
            id: "test-tile-id-3"
        }]);

        const bResult2 = formatter.formatVisualizationSelected("test-tile-id-2", [{
            id: "test-tile-id-1"
        }, {
            id: "test-tile-id-2"
        }, {
            id: "test-tile-id-3"
        }]);

        assert.strictEqual(bResult1, false, "The result was false.");
        assert.strictEqual(bResult2, true, "The result was true.");
    });

    QUnit.module("formatAppSearchTitle formatter", {
        beforeEach: function () {
            this.oResourceBundle = {
                getText: sandbox.stub()
            };
            const oComponent = {
                getResourceBundle: sandbox.stub().returns(this.oResourceBundle)
            };
            formatter.getOwnerComponent = sandbox.stub().returns(oComponent);
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Only the selected visualizations are shown", function (assert) {
        // Arrange
        const sVisualizationsFiltersSelected = "tiles";
        const aVisualizationsFiltersAvailable = [{ key: "tiles", title: "tilesTitle" }, { key: "cards", title: "cardsTitle" }];
        const bFilterIsTitle = true;
        const sSearchTerm = "sampleTile";
        const sCategoryTitle = "catalog4";
        const bShowSelectedVisualizationsPressed = true;
        const iSelectedAppCount = 3;
        const aVisualizations = [{ id: "tile_0", title: "sampleTile" }];
        const iTotalCount = 2;
        const sExpectedTitle = "myTitleAppSearch";
        const sTitleKey = "ContentFinder.AppSearch.Title.SelectedApp";
        this.oResourceBundle.getText.withArgs(sTitleKey).returns(sExpectedTitle);

        // Act
        const sResult = formatter.formatAppSearchTitle(
            sVisualizationsFiltersSelected,
            aVisualizationsFiltersAvailable,
            bFilterIsTitle,
            sSearchTerm,
            sCategoryTitle,
            bShowSelectedVisualizationsPressed,
            iSelectedAppCount,
            aVisualizations,
            iTotalCount
        );

        // Assert
        assert.strictEqual(this.oResourceBundle.getText.callCount, 1, "The ResourceBundle was called once.");
        assert.deepEqual(this.oResourceBundle.getText.firstCall.args, [sTitleKey, [iSelectedAppCount]], "The ResourceBundle was called with the correct parameters.");
        assert.strictEqual(sResult, sExpectedTitle, "The correct title was formatted.");
    });

    QUnit.test("The search result is shown", function (assert) {
        // Arrange
        const sVisualizationsFiltersSelected = "tiles";
        const aVisualizationsFiltersAvailable = [{ key: "tiles", title: "tilesTitle" }, { key: "cards", title: "cardsTitle" }];
        const bFilterIsTitle = true;
        const sSearchTerm = "sampleTile";
        const sCategoryTitle = "catalog4";
        const bShowSelectedVisualizationsPressed = false;
        const iSelectedAppCount = 3;
        const aVisualizations = [{ id: "tile_0", title: "sampleTile" }];
        const iTotalCount = 2;
        const sExpectedTitle = "myTitleAppSearch";
        const sTitleKey = "ContentFinder.AppSearch.Title.SearchResult";
        this.oResourceBundle.getText.withArgs(sTitleKey).returns(sExpectedTitle);

        // Act
        const sResult = formatter.formatAppSearchTitle(sVisualizationsFiltersSelected, aVisualizationsFiltersAvailable, bFilterIsTitle,
            sSearchTerm, sCategoryTitle, bShowSelectedVisualizationsPressed, iSelectedAppCount, aVisualizations, iTotalCount
        );

        // Assert
        assert.strictEqual(this.oResourceBundle.getText.callCount, 1, "The ResourceBundle was called once.");
        assert.deepEqual(this.oResourceBundle.getText.firstCall.args, [sTitleKey, [sSearchTerm, iTotalCount]], "The ResourceBundle was called with the correct parameters.");
        assert.strictEqual(sResult, sExpectedTitle, "The correct title was formatted.");
    });

    QUnit.test("The category title is shown", function (assert) {
        // Arrange
        const sVisualizationsFiltersSelected = "tiles";
        const aVisualizationsFiltersAvailable = [{ key: "tiles", title: "tilesTitle" }, { key: "cards", title: "cardsTitle" }];
        const bFilterIsTitle = false;
        const sSearchTerm = "";
        const sCategoryTitle = "catalog4";
        const bShowSelectedVisualizationsPressed = true;
        const iSelectedAppCount = 0;
        const aVisualizations = [{ id: "tile_0", title: "sampleTile" }];
        const iTotalCount = 2;
        const sExpectedTitle = "myTitleAppSearch";
        const sTitleKey = "ContentFinder.AppSearch.Title.AllFromCategory";
        this.oResourceBundle.getText.withArgs(sTitleKey).returns(sExpectedTitle);

        // Act
        const sResult = formatter.formatAppSearchTitle(sVisualizationsFiltersSelected, aVisualizationsFiltersAvailable, bFilterIsTitle,
            sSearchTerm, sCategoryTitle, bShowSelectedVisualizationsPressed, iSelectedAppCount, aVisualizations, iTotalCount
        );

        // Assert
        assert.strictEqual(this.oResourceBundle.getText.callCount, 1, "The ResourceBundle was called once.");
        assert.deepEqual(this.oResourceBundle.getText.firstCall.args, [sTitleKey, [sCategoryTitle, iTotalCount]], "The ResourceBundle was called with the correct parameters.");
        assert.strictEqual(sResult, sExpectedTitle, "The correct title was formatted.");
    });

    QUnit.test("The category title is shown but filter should be title name", function (assert) {
        // Arrange
        const sVisualizationsFiltersSelected = "tiles";
        const aVisualizationsFiltersAvailable = [{ key: "tiles", title: "tilesTitle" }, { key: "cards", title: "cardsTitle" }];
        const bFilterIsTitle = true;
        const sSearchTerm = "";
        const sCategoryTitle = "someCategory";
        const bShowSelectedVisualizationsPressed = true;
        const iSelectedAppCount = 0;
        const aVisualizations = [{ id: "tile_0", title: "sampleTile" }];
        const iTotalCount = 2;
        const sExpectedTitle = "myTitleAppSearch";
        const sTitleKey = "ContentFinder.AppSearch.Title.AllFromCategory";
        this.oResourceBundle.getText.withArgs(sTitleKey).returns(sExpectedTitle);

        // Act
        const sResult = formatter.formatAppSearchTitle(sVisualizationsFiltersSelected, aVisualizationsFiltersAvailable, bFilterIsTitle,
            sSearchTerm, sCategoryTitle, bShowSelectedVisualizationsPressed, iSelectedAppCount, aVisualizations, iTotalCount
        );

        // Assert
        assert.strictEqual(this.oResourceBundle.getText.callCount, 1, "The ResourceBundle was called once.");
        assert.deepEqual(this.oResourceBundle.getText.firstCall.args, [sTitleKey, ["tilesTitle", iTotalCount]], "The ResourceBundle was called with the correct parameters.");
        assert.strictEqual(sResult, sExpectedTitle, "The correct title was formatted.");
    });

    QUnit.test("All apps are shown without any filters", function (assert) {
        // Arrange
        const sVisualizationsFiltersSelected = "";
        const aVisualizationsFiltersAvailable = [];
        const bFilterIsTitle = true;
        const sSearchTerm = "";
        const sCategoryTitle = "";
        const bShowSelectedVisualizationsPressed = false;
        const iSelectedAppCount = 0;
        const aVisualizations = [{ id: "tile_0", title: "sampleTile" }];
        const iTotalCount = 2;
        const sExpectedTitle = "myTitleAppSearch";
        const sTitleKey = "ContentFinder.AppSearch.Title.AllApps";
        this.oResourceBundle.getText.withArgs(sTitleKey).returns(sExpectedTitle);

        // Act
        const sResult = formatter.formatAppSearchTitle(sVisualizationsFiltersSelected, aVisualizationsFiltersAvailable, bFilterIsTitle,
            sSearchTerm, sCategoryTitle, bShowSelectedVisualizationsPressed, iSelectedAppCount, aVisualizations, iTotalCount
        );

        // Assert
        assert.strictEqual(this.oResourceBundle.getText.callCount, 1, "The ResourceBundle was called once.");
        assert.deepEqual(this.oResourceBundle.getText.firstCall.args, [sTitleKey, [iTotalCount]], "The ResourceBundle was called with the correct parameters.");
        assert.strictEqual(sResult, sExpectedTitle, "The correct title was formatted.");
    });

    QUnit.test("There are no visualizations and filter should be title name", function (assert) {
        // Arrange
        const sVisualizationsFiltersSelected = "tiles";
        const aVisualizationsFiltersAvailable = [{ key: "tiles", title: "tilesTitle" }, { key: "cards", title: "cardsTitle" }];
        const bFilterIsTitle = true;
        const sSearchTerm = "sampleTile";
        const sCategoryTitle = "catalog4";
        const bShowSelectedVisualizationsPressed = true;
        const iSelectedAppCount = 0;
        const aVisualizations = [];
        const iTotalCount = 0;
        const sExpectedTitle = "myTitleAppSearch";
        const sTitleKey = "ContentFinder.AppSearch.Title.NoVisualization";
        this.oResourceBundle.getText.withArgs(sTitleKey).returns(sExpectedTitle);

        // Act
        const sResult = formatter.formatAppSearchTitle(sVisualizationsFiltersSelected, aVisualizationsFiltersAvailable, bFilterIsTitle,
            sSearchTerm, sCategoryTitle, bShowSelectedVisualizationsPressed, iSelectedAppCount, aVisualizations, iTotalCount
        );

        // Assert
        assert.strictEqual(this.oResourceBundle.getText.callCount, 1, "The ResourceBundle was called once.");
        assert.deepEqual(this.oResourceBundle.getText.firstCall.args, [sTitleKey, ["tilesTitle"]], "The ResourceBundle was called with the correct parameters.");
        assert.strictEqual(sResult, sExpectedTitle, "The correct title was formatted.");
    });

    QUnit.test("There are no visualizations and filter is not the title name", function (assert) {
        // Arrange
        const sVisualizationsFiltersSelected = "tiles";
        const aVisualizationsFiltersAvailable = [{ key: "tiles", title: "tilesTitle" }, { key: "cards", title: "cardsTitle" }];
        const bFilterIsTitle = false;
        const sSearchTerm = "";
        const sCategoryTitle = "someCategory";
        const bShowSelectedVisualizationsPressed = true;
        const iSelectedAppCount = 0;
        const aVisualizations = [];
        const iTotalCount = 0;
        const sExpectedTitle = "myTitleAppSearch";
        const sTitleKey = "ContentFinder.AppSearch.Title.AllFromCategory";
        this.oResourceBundle.getText.withArgs(sTitleKey).returns(sExpectedTitle);

        // Act
        const sResult = formatter.formatAppSearchTitle(sVisualizationsFiltersSelected, aVisualizationsFiltersAvailable, bFilterIsTitle,
            sSearchTerm, sCategoryTitle, bShowSelectedVisualizationsPressed, iSelectedAppCount, aVisualizations, iTotalCount
        );

        // Assert
        assert.strictEqual(this.oResourceBundle.getText.callCount, 1, "The ResourceBundle was called once.");
        assert.deepEqual(this.oResourceBundle.getText.firstCall.args, [sTitleKey, ["someCategory", iTotalCount]], "The ResourceBundle was called with the correct parameters.");
        assert.strictEqual(sResult, sExpectedTitle, "The correct title was formatted.");
    });

    QUnit.test("There are no visualizations and no other titles", function (assert) {
        // Arrange
        const sVisualizationsFiltersSelected = "";
        const aVisualizationsFiltersAvailable = [];
        const bFilterIsTitle = false;
        const sSearchTerm = "";
        const sCategoryTitle = "";
        const bShowSelectedVisualizationsPressed = false;
        const iSelectedAppCount = 0;
        const aVisualizations = [];
        const iTotalCount = 0;
        const sExpectedTitle = "myTitleAppSearch";
        const sTitleKey = "ContentFinder.AppSearch.Title.NoApps";
        this.oResourceBundle.getText.withArgs(sTitleKey).returns(sExpectedTitle);

        // Act
        const sResult = formatter.formatAppSearchTitle(sVisualizationsFiltersSelected, aVisualizationsFiltersAvailable, bFilterIsTitle,
            sSearchTerm, sCategoryTitle, bShowSelectedVisualizationsPressed, iSelectedAppCount, aVisualizations, iTotalCount
        );

        // Assert
        assert.strictEqual(this.oResourceBundle.getText.callCount, 1, "The ResourceBundle was called once.");
        assert.deepEqual(this.oResourceBundle.getText.firstCall.args, [sTitleKey], "The ResourceBundle was called with the correct parameters.");
        assert.strictEqual(sResult, sExpectedTitle, "The correct title was formatted.");
    });

    QUnit.module("formatCategoryDescription formatter", {
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("formatCategoryDescription is formatted", function (assert) {
        const result = formatter.formatCategoryDescription("id", "label");
        assert.equal(result, "id • label", "Expected id and label to be formatted");
    });

    QUnit.test("formatCategoryDescription id is returned", function (assert) {
        const result = formatter.formatCategoryDescription("id");
        assert.equal(result, "id", "Expected id to be returned");
    });

    QUnit.test("formatCategoryDescription is formatted in RTL", function (assert) {
        sandbox.stub(Localization, "getRTL").returns(true);

        const result = formatter.formatCategoryDescription("id", "label");
        assert.equal(result, "label • id", "Expected id and label to be formatted in RTL");
    });

    QUnit.test("formatCategoryDescription id is returned in RTL", function (assert) {
        sandbox.stub(Localization, "getRTL").returns(true);

        const result = formatter.formatCategoryDescription("id");
        assert.equal(result, "id", "Expected id to be returned");
    });

    QUnit.test("formatCategoryDescription is empty", function (assert) {
        const result = formatter.formatCategoryDescription("");
        assert.equal(result, "", "Expected description to be empty");
    });

    QUnit.test("formatCategoryDescription label is formatted", function (assert) {
        // This case should never occur
        const result = formatter.formatCategoryDescription("", "label");
        assert.equal(result, " • label", "Expected label to be formatted");
    });

    QUnit.module("IllustratedMessage formatter", {
        beforeEach: function () {
            this.sNoItemsInCatalogTitle = "NoItemsInCatalogTitle";

            this.oResourceBundle = {
                getText: sandbox.stub().returns("Launch Application Test Title")
            };
            const oComponent = {
                getResourceBundle: sandbox.stub().returns(this.oResourceBundle)
            };
            formatter.getOwnerComponent = sandbox.stub().returns(oComponent);
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("treeItemPressed is true, empty searchTerm", function (assert) {
        // Act
        const sResult = formatter.formatVisualizationsNoDataIllustratedMessageTitle(true, "", this.sNoItemsInCatalogTitle);

        // Assert
        assert.strictEqual(sResult, this.sNoItemsInCatalogTitle, "The correct title was formatted.");
    });

    QUnit.test("treeItemPressed is false, empty searchTerm it should return a No tiles message", function (assert) {
        // Arrange
        this.oResourceBundle.getText.returns("Missing tiles");

        // Act
        const sResult = formatter.formatVisualizationsNoDataIllustratedMessageTitle(false, "", this.sNoItemsInCatalogTitle);

        // Assert
        assert.ok(this.oResourceBundle.getText.firstCall.calledWithExactly("ContentFinder.AppSearch.IllustratedMessage.Tiles.NoData.Title"));
        assert.strictEqual(sResult, "Missing tiles", "The correct title was formatted.");
    });

    QUnit.test("treeItemPressed is true, with searchTerm", function (assert) {
        // Act
        const sResult = formatter.formatVisualizationsNoDataIllustratedMessageTitle(true, "abcde", this.sNoItemsInCatalogTitle);

        // Assert
        assert.strictEqual(sResult, undefined, "The correct title was formatted.");
    });

    QUnit.test("treeItemPressed is false, with searchTerm", function (assert) {
        // Act
        const sResult = formatter.formatVisualizationsNoDataIllustratedMessageTitle(true, "abcde", this.sNoItemsInCatalogTitle);

        // Assert
        assert.strictEqual(sResult, undefined, "The correct title was formatted.");
    });

    QUnit.test("treeItemPressed is false, empty searchTerm, empty title", function (assert) {
        // Arrange
        this.oResourceBundle.getText.returns("Missing tiles");

        // Act
        const sResult = formatter.formatVisualizationsNoDataIllustratedMessageTitle(false, "", "");

        // Assert
        assert.ok(this.oResourceBundle.getText.firstCall.calledWithExactly("ContentFinder.AppSearch.IllustratedMessage.Tiles.NoData.Title"));
        assert.strictEqual(sResult, "Missing tiles", "The correct title was formatted.");
    });

    QUnit.test("treeItemPressed is true, empty searchTerm, empty title", function (assert) {
        // Arrange
        this.oResourceBundle.getText.returns("Missing tiles");
        // Act
        const sResult = formatter.formatVisualizationsNoDataIllustratedMessageTitle(true, "", "");

        // Assert
        assert.ok(this.oResourceBundle.getText.firstCall.calledWithExactly("ContentFinder.AppSearch.IllustratedMessage.Tiles.NoData.Title"));
        assert.strictEqual(sResult, "Missing tiles", "The correct title was formatted.");
    });

    QUnit.test("when an error override title passed it should return the override title irrespective of search or catalog title", function (assert) {
        // Arrange
        this.oResourceBundle.getText.returns("Missing tiles");
        // Act
        // Assert
        assert.strictEqual(formatter.formatVisualizationsNoDataIllustratedMessageTitle(true, "", "", "override the title"), "override the title", "The override title was returned.");
        assert.strictEqual(formatter.formatVisualizationsNoDataIllustratedMessageTitle(false, "", "", "override the title"), "override the title", "The override title was returned.");
        assert.strictEqual(formatter.formatVisualizationsNoDataIllustratedMessageTitle(false, undefined, "search", "override the title"), "override the title", "The override title was returned.");
    });

    QUnit.module("formatVisualizationsNoDataIllustratedMessageDescription formatter", {
        beforeEach: function () {
            this.sNoItemsInCatalogDescription = "NoItemsInCatalogDescription";
            this.oResourceBundle = {
                getText: sandbox.stub().returns("message description tests")
            };
            const oComponent = {
                getResourceBundle: sandbox.stub().returns(this.oResourceBundle)
            };
            formatter.getOwnerComponent = sandbox.stub().returns(oComponent);
            this.oMapHasStub = sandbox.stub();
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("treeItemPressed is true, empty searchTerm", function (assert) {
        // Act
        const sResult = formatter.formatVisualizationsNoDataIllustratedMessageDescription(true, "", this.sNoItemsInCatalogDescription);

        // Assert
        assert.strictEqual(sResult, this.sNoItemsInCatalogDescription, "The correct title was formatted.");
    });

    QUnit.test("treeItemPressed is false, empty searchTerm title is NoData.Details", function (assert) {
        // Act
        const sResult = formatter.formatVisualizationsNoDataIllustratedMessageDescription(false, "", this.sNoItemsInCatalogDescription);

        // Assert
        assert.ok(this.oResourceBundle.getText.firstCall.calledWithExactly("ContentFinder.AppSearch.IllustratedMessage.Tiles.NoData.Details"));
        assert.strictEqual(sResult, "message description tests", "The correct title was formatted.");
    });

    QUnit.test("treeItemPressed is true, with searchTerm", function (assert) {
        // Act
        const sResult = formatter.formatVisualizationsNoDataIllustratedMessageDescription(true, "abcde", this.sNoItemsInCatalogDescription);

        // Assert
        assert.strictEqual(sResult, undefined, "The correct title was formatted.");
    });

    QUnit.test("treeItemPressed is false, with searchTerm", function (assert) {
        // Act
        const sResult = formatter.formatVisualizationsNoDataIllustratedMessageDescription(true, "abcde", this.sNoItemsInCatalogDescription);

        // Assert
        assert.strictEqual(sResult, undefined, "The correct title was formatted.");
    });

    QUnit.test("treeItemPressed is false, empty searchTerm, title is NoData.Details", function (assert) {
        // Act
        const sResult = formatter.formatVisualizationsNoDataIllustratedMessageDescription(false, "", "");

        // Assert
        assert.ok(this.oResourceBundle.getText.firstCall.calledWithExactly("ContentFinder.AppSearch.IllustratedMessage.Tiles.NoData.Details"));
        assert.strictEqual(sResult, "message description tests", "The correct title was formatted.");
    });

    QUnit.test("treeItemPressed is true, empty searchTerm, message was NoData.Details", function (assert) {
        // Act
        const sResult = formatter.formatVisualizationsNoDataIllustratedMessageDescription(true, "", "");

        // Assert
        assert.ok(this.oResourceBundle.getText.firstCall.calledWithExactly("ContentFinder.AppSearch.IllustratedMessage.NoItems.InCatalog.Description"));
        assert.strictEqual(sResult, "message description tests", "The correct title was formatted.");
    });

    QUnit.test("when override description passed in return it irrespective of treeItemPressed is true/false, empty/present searchTerm", function (assert) {
        // Act
        const formatDescription = formatter.formatVisualizationsNoDataIllustratedMessageDescription.bind(formatter);

        // Assert
        assert.strictEqual(formatDescription(true, "search", "noItemsInCatalog", "override description"), "override description", "The override description returned.");
        assert.strictEqual(formatDescription(false, "search", "noItemsInCatalog", "override description"), "override description", "The override description returned.");
        assert.strictEqual(formatDescription(true, null, "noItemsInCatalog", "override description"), "override description", "The override description returned.");
    });

    QUnit.module("formatVisualizationsNoDataIllustratedMessageType formatter");

    QUnit.test("empty searchTerm", function (assert) {
        // Act
        const sResult = formatter.formatVisualizationsNoDataIllustratedMessageType("");

        // Assert
        assert.strictEqual(sResult, IllustratedMessageType.NoData, "The correct message type was formatted.");
    });

    QUnit.test("with searchTerm", function (assert) {
        // Act
        const sResult = formatter.formatVisualizationsNoDataIllustratedMessageType("abde");

        // Assert
        assert.strictEqual(sResult, IllustratedMessageType.NoSearchResults, "The correct message type was formatted.");
    });

    QUnit.test("when an error on request happens we show the unable to load type message", function (assert) {
        // Act
        const sResult = formatter.formatVisualizationsNoDataIllustratedMessageType("abde", IllustratedMessageType.UnableToLoad);

        // Assert
        assert.strictEqual(sResult, IllustratedMessageType.UnableToLoad, "The correct message type was formatted.");
    });

    QUnit.module("formatAppBoxAccDescription formatter", {
        beforeEach: function () {
            this.oMapHasStub = sandbox.stub();
            this.oResourceBundle = {
                getText: sandbox.stub().returns("Launch Application Test Title")
            };
            const oComponent = {
                getResourceBundle: sandbox.stub().returns(this.oResourceBundle),
                oRestrictedVisualizationsMap: {
                    has: this.oMapHasStub
                },
                getModel: this.oGetModelStub
            };
            formatter.getOwnerComponent = sandbox.stub().returns(oComponent);
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("All data is available, visualization added", function (assert) {
        // Arrange
        this.oMapHasStub.returns(true);

        // Act
        const sResult =
            formatter.formatAppBoxAccDescription(
                "Test Title",
                "Test Subtitle",
                "vizId1",
                "Test AppIdLabel",
                "Test AppId",
                "CX100-system-label",
                "CX100",
                "Test InformationLabel",
                "Test Info",
                "Local",
                true,
                "Not Maintained",
                "Already Used",
                true
            );

        // Assert
        assert.strictEqual(
            sResult,
            "Test Title . Test Subtitle . Already Used . Test AppIdLabel . Test AppId . CX100-system-label . CX100 . Test InformationLabel . Test Info . Launch Application Test Title",
            "The description was correct."
        );
    });

    QUnit.test("All labels values are empty, visualization is not added", function (assert) {
        // Arrange
        this.oMapHasStub.returns(false);

        const sResult =
            formatter.formatAppBoxAccDescription(
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                false,
                "",
                "",
                false
            );

        // Assert
        assert.strictEqual(sResult, "", "The description was empty.");
    });

    QUnit.test("Values for properties are empty, but placeholders are shown", function (assert) {
        // Arrange
        this.oMapHasStub.returns(false);

        // Act
        const sResult =
            formatter.formatAppBoxAccDescription(
                "Test Title",
                "Test Subtitle",
                "vizId1",
                "Test AppIdLabel",
                "",
                "CX100-system-label",
                "CX100",
                "Test InformationLabel",
                "",
                "Local",
                true,
                "Not Maintained",
                "Already Used",
                false
            );

        // Assert
        assert.strictEqual(
            sResult,
            "Test Title . Test Subtitle . Test AppIdLabel . Not Maintained . CX100-system-label . CX100 . Test InformationLabel . Not Maintained",
            "The description was correct."
        );
    });

    QUnit.test("Values for properties and their placeholders are empty, they are not shown", function (assert) {
        // Arrange
        this.oMapHasStub.returns(false);

        // Act
        const sResult =
            formatter.formatAppBoxAccDescription(
                "Test Title",
                "Test Subtitle",
                "vizId1",
                "Test AppIdLabel",
                "",
                "CX100-system-label",
                "CX100",
                "Test InformationLabel",
                "",
                "Local",
                false,
                "Not Maintained",
                "Already Used",
                false
            );

        // Assert
        assert.strictEqual(
            sResult,
            "Test Title . Test Subtitle . CX100-system-label . CX100",
            "The description was correct."
        );
    });

    QUnit.test("Show provided string for LocalContentProvider if systemId is not available", function (assert) {
        // Arrange
        this.oMapHasStub.returns(false);

        // Act
        const sResult =
            formatter.formatAppBoxAccDescription(
                "Test Title",
                "Test Subtitle",
                "vizId1",
                "Test AppIdLabel",
                "Test AppId",
                "CX100-system-label",
                "",
                "Test InformationLabel",
                "Test Info",
                "Local",
                true,
                "Not Maintained",
                "Already Used",
                false
            );

        // Assert
        assert.strictEqual(
            sResult,
            "Test Title . Test Subtitle . Test AppIdLabel . Test AppId . CX100-system-label . Local . Test InformationLabel . Test Info",
            "The description was correct."
        );
    });
});

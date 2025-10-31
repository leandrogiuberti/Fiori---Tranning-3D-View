/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
/**
 * @namespace sap.esh.search.ui.controls
 */

import SearchLink from "sap/esh/search/ui/controls/SearchLink";
import SearchText from "sap/esh/search/ui/controls/resultview/SearchText";
import GenericTile from "sap/m/GenericTile";
import TileContent from "sap/m/TileContent";
import VBox from "sap/m/VBox";
import CheckBox from "sap/m/CheckBox";
import Image from "sap/m/Image";
import Controller from "sap/ui/core/mvc/Controller";
import Toolbar from "sap/m/Toolbar";

const SearchResultGridTileCatalog = {
    createContent: (oController: Controller): GenericTile => {
        // header (toolbar)
        // CHECKBOX (selection)
        const oCheckBox = new CheckBox("tileCheckBox", {
            id: "tileCheckBox",
            selected: { path: "publicSearchModel>selected" },
            select: (data) => (oController as any)?.onTileSelect(data),
            enabled: { path: "publicSearchModel>selectionEnabled" },
            visible: { path: "publicSearchModel>resultviewSelectionVisibility" },
        });
        const oHeaderToolbar = new Toolbar("searchResultGridTileCatalogHeader", {
            design: "Solid",
            content: [oCheckBox],
        });
        oHeaderToolbar.addStyleClass("sapUiNoMarginBegin");
        oHeaderToolbar.addStyleClass("sapUiNoMarginEnd");
        oHeaderToolbar.addStyleClass("searchResultGridTileCatalogHeaderToolbar");
        oCheckBox.addStyleClass("searchResultGridTileCatalogCheckBox");
        // content
        // TITLE (link)
        const oSearchLink = new SearchLink("searchLink", {
            wrapping: false,
            class: "SearchResultGridTileCatalogHeaderText",
            text: { path: "publicSearchModel>title" },
            navigationTarget: { path: "publicSearchModel>data/defaultNavigationTarget" },
            visible: {
                parts: [{ path: "publicSearchModel>data" }],
                formatter: (data) => (oController as any)?.titleSearchLinkVisibleFormatter(data),
            },
            enabled: {
                parts: [{ path: "publicSearchModel>data/attributesMap" }],
                formatter: (attributesMap) =>
                    (oController as any)?.titleSearchLinkEnabledFormatter(attributesMap),
            },
        });
        // CATEGORY
        const oSearchTextCategory = new SearchText("searchTextCategory", {
            text: { path: "publicSearchModel>data/attributesMap/CATEGORY/valueHighlighted" },
            visible: {
                parts: [{ path: "publicSearchModel>data" }],
                formatter: (data) => (oController as any)?.titleSearchTextVisibleFormatter(data),
            },
        });
        // PRODUCT_DESC
        const oSearchTextProductDescription = new SearchText("searchTextProductDescription", {
            text: { path: "publicSearchModel>data/attributesMap/PRODUCT_DESC/valueHighlighted" },
            visible: {
                parts: [{ path: "publicSearchModel>data" }],
                formatter: (data) => (oController as any)?.titleSearchTextVisibleFormatter(data),
            },
        });
        oSearchTextProductDescription.addStyleClass("searchResultGridTileCatalogItem");
        // 'PRODUCT_PIC_URL',
        const oImageProductPicUrl = new Image("imageProductPicUrlId", {
            height: "7rem",
            src: { path: "publicSearchModel>data/attributesMap/PRODUCT_PIC_URL/valueHighlighted" },
        });
        oImageProductPicUrl.addStyleClass("searchResultGridTileCatalogImage");
        oImageProductPicUrl.addStyleClass("searchResultGridTileCatalogItem");
        const tileContentContent = new VBox({
            items: [
                oHeaderToolbar,
                oSearchLink,
                oSearchTextProductDescription,
                oSearchTextCategory,
                oImageProductPicUrl,
            ],
        });
        const tile = new GenericTile({
            tileContent: new TileContent({
                content: tileContentContent,
            }),
        });
        tile.addStyleClass("searchResultGridTileCatalog");
        return tile;
    },
};

export default SearchResultGridTileCatalog;

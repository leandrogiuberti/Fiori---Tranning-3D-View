/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import i18n from "../../i18n";
import Select, { $SelectSettings } from "sap/m/Select";
import { SelectType } from "sap/m/library";
import Item from "sap/ui/core/Item";
import BindingMode from "sap/ui/model/BindingMode";
import SearchModel from "sap/esh/search/ui/SearchModel";
import { DataSource } from "../../sinaNexTS/sina/DataSource";
import { UserEventType } from "../../eventlogging/UserEvents";

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchSelect extends Select {
    constructor(sId?: string, settings?: $SelectSettings) {
        super(sId, settings);

        this.bindProperty("visible", { path: "/businessObjSearchEnabled" });
        this.setAutoAdjustWidth(true);
        this.bindItems({
            path: "/dataSources",
            template: new Item("", {
                key: "{id}",
                text: "{labelPlural}",
            }),
        });
        this.bindProperty("selectedKey", {
            path: "/uiFilter/dataSource/id",
            mode: BindingMode.OneWay,
        });
        this.bindProperty("tooltip", {
            parts: [
                {
                    path: "/uiFilter/dataSource/labelPlural",
                },
            ],
            formatter: (labelPlural) => {
                return i18n.getText("searchInPlaceholder", [labelPlural]);
            },
        });
        this.attachChange(() => {
            const item = this.getSelectedItem();
            const context = item.getBindingContext();
            const dataSource = context.getObject() as DataSource;
            const oModel = this.getModel() as SearchModel;
            const dataSourceKeyOld = oModel.getDataSource().id;
            oModel.eventLogger.logEvent({
                type: UserEventType.DROPDOWN_SELECT_DS,
                dataSourceKey: dataSource.id,
                dataSourceKeyOld,
            });
            oModel.setDataSource(dataSource, false);
            oModel.abortSuggestions();
        });
        this.bindProperty("enabled", {
            parts: [
                {
                    path: "/initializingObjSearch",
                },
            ],
            formatter: (initializingObjSearch) => !initializingObjSearch,
        });
        this.addStyleClass("searchSelect");
    }

    setDisplayMode(mode: "icon" | "default"): void {
        switch (mode) {
            case "icon":
                this.setType(SelectType.IconOnly);
                this.setIcon("sap-icon://slim-arrow-down");
                break;
            case "default":
                this.setType(SelectType.Default);
                break;
            default:
                break;
        }
    }
    static renderer = {
        apiVersion: 2,
    };
}

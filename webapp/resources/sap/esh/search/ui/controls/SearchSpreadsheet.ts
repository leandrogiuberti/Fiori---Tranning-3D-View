/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import i18n from "../i18n";
import Spreadsheet from "sap/ui/export/Spreadsheet";
import SearchModel from "sap/esh/search/ui/SearchModel";
import ErrorHandler from "../error/ErrorHandler";
import Controller from "sap/ui/core/mvc/Controller";
import Button from "sap/m/Button";
import { SearchResultSet } from "../sinaNexTS/sina/SearchResultSet";
import SearchResultFormatter, {
    FormattedResultItem,
    FormattedResultItemAttribute,
} from "sap/esh/search/ui/SearchResultFormatter";
import { Column } from "sap/esh/search/ui/SearchResultTableFormatter";
import Element from "sap/ui/core/Element";
import { TableColumnType } from "../SearchResultTableColumnType";
import { SearchResultSetItemAttributeGroup } from "../sinaNexTS/sina/SearchResultSetItemAttributeGroup";
import { SearchResultSetItemAttribute } from "../sinaNexTS/sina/SearchResultSetItemAttribute";
import { AttributeType } from "../sinaNexTS/sina/AttributeType";
import { SearchResultSetItemAttributeBase } from "../sinaNexTS/sina/SearchResultSetItemAttributeBase";
import { EdmType } from "sap/ui/export/library";
import MessageBox from "sap/m/MessageBox";
// import Dialog from "sap/m/Dialog";
// import Text from "sap/m/Text";
// import VerticalLayout from "sap/ui/layout/VerticalLayout";
// import RadioButtonGroup from "sap/m/RadioButtonGroup";
// import RadioButton from "sap/m/RadioButton";
// import MessageStrip from "sap/m/MessageStrip";

interface ExportColumn {
    label?: string; // UI5 defined property, column label
    property?: string; // UI5 defined property, unified id (p13NColumnName or attributeId)
    type?: string; // UI5 defined property, excel data type
    columnType?: TableColumnType; // column type
}
interface ExportRow {
    [property: string]: number | string;
}

interface ExportData {
    exportColumns: Array<ExportColumn>;
    exportRows: Array<ExportRow>;
}

/**
 * @namespace sap.esh.search.ui.controls
 */
export default class SearchSpreadsheet extends Controller {
    private model: SearchModel;
    private exportDataType: "formatted" | "technical";
    private visibleColumns: Array<Column>;
    private limit: number = 1000;

    async onExport(model: SearchModel): Promise<void> {
        this.model = model;

        if (this.model.getProperty("/boCount") > this.limit) {
            MessageBox.information(i18n.getText("exportDataInfo"), {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: async (oAction: string) => {
                    let isExport;
                    if (oAction == MessageBox.Action.OK) {
                        isExport = true;
                    }
                    if (oAction == MessageBox.Action.CANCEL) {
                        isExport = false;
                    }
                    await this.controlExport(isExport);
                },
                styleClass: "sapUshellSearchResultExportDialog",
            });
        } else {
            await this.controlExport(true);
        }
    }

    private async controlExport(isExport: boolean): Promise<void> {
        try {
            this.lockUI();
            if (!isExport) {
                return;
            }
            const exportData = await this.formatExportData();
            await this.doUI5Export(exportData);
        } catch (error) {
            const errorHandler = ErrorHandler.getInstance();
            errorHandler.onError(error);
        } finally {
            this.unlockUI();
        }
    }

    private async formatExportData(): Promise<ExportData> {
        // search query
        const exportQuery = this.model.query.clone();
        exportQuery.setCalculateFacets(false);
        exportQuery.setTop(this.limit);

        // search result format
        const searchResultSet = (await exportQuery.getResultSetAsync()) as SearchResultSet;
        const formatter = new SearchResultFormatter(this.model);
        const formattedResults = formatter.format(searchResultSet, exportQuery.filter.searchTerm, {
            suppressHighlightedValues: true,
        });

        // export data type
        this.exportDataType = "technical"; // default value type

        // UI visible columns
        this.visibleColumns = this.getVisibleColumns();

        // export columns
        const exportColumns = this.formatExportColumns(formattedResults);

        // export rows
        const exportRows = this.formatExportRows(formattedResults);

        return { exportColumns: exportColumns, exportRows: exportRows };
    }

    private getVisibleColumns(): Array<Column> {
        const visibleColumns = [];

        if (this.model.getResultViewType() !== "searchResultTable") {
            // export columns: initial state columns, original ordering, first 6/7 visible
            this.model.getTableInitialColumns().forEach((column) => {
                if (column.visible === true) {
                    visibleColumns.push(column);
                }
            });
        } else {
            // export columns: real-time table visible columns
            this.model.getTableColumns(false).forEach((column) => {
                if (column.visible === true) {
                    visibleColumns.push(column);
                }
            });
        }

        return visibleColumns;
    }

    private formatExportColumns(formattedResults: Array<FormattedResultItem>): Array<ExportColumn> {
        const formattedAttributes = formattedResults[0].itemattributes;
        let exportColumns = [];

        for (const visibleColumn of this.visibleColumns) {
            switch (visibleColumn.type) {
                case TableColumnType.TITLE:
                case TableColumnType.TITLE_DESCRIPTION:
                    exportColumns.push({
                        label: visibleColumn.name,
                        property: visibleColumn.p13NColumnName,
                        type: EdmType.String,
                        columnType: visibleColumn.type,
                    });
                    break;

                case TableColumnType.DETAIL:
                    if (this.exportDataType === "formatted") {
                        // export single attribute as one column
                        // export group attribute as one merged column
                        exportColumns = exportColumns.concat([this.formatMergedColumn(visibleColumn)]);
                    } else {
                        // export single attribute as one column
                        // export group attribute as multiple separate columns
                        exportColumns = exportColumns.concat(
                            this.formatSeparateColumns(visibleColumn, formattedAttributes)
                        );
                    }
                    break;

                default:
                    // case TableColumnType.RELATED_APPS:
                    // case TableColumnType.EXTEND:
                    // don't export
                    break;
            }
        }

        return exportColumns;
    }

    private formatMergedColumn(visibleColumn: Column): ExportColumn {
        return {
            label: visibleColumn.name,
            property: visibleColumn.attributeId,
            type: EdmType.String,
            columnType: TableColumnType.DETAIL,
        };
    }

    private formatSeparateColumns(
        visibleColumn: Column,
        formattedAttributes: Array<FormattedResultItemAttribute>
    ): Array<ExportColumn> {
        const matchedAttribute = formattedAttributes.find(
            (formattedAttribute) =>
                (formattedAttribute?.sinaAttribute as SearchResultSetItemAttribute)?.id ===
                visibleColumn.attributeId
        );
        const sinaAttribute = matchedAttribute?.sinaAttribute as SearchResultSetItemAttribute;
        if (sinaAttribute) {
            if (sinaAttribute instanceof SearchResultSetItemAttributeGroup) {
                return this.formatColumnsForGroupAttribute(sinaAttribute);
            } else {
                return [this.formatColumnForSingleAttribute(sinaAttribute)];
            }
        }
        return [];
    }

    private formatColumnsForGroupAttribute(
        attribute: SearchResultSetItemAttributeGroup
    ): Array<ExportColumn> {
        const columns = [];
        const attributesInGroup = attribute?.attributes || [];
        for (const attributeInGroup of attributesInGroup) {
            if (attributeInGroup?.attribute instanceof SearchResultSetItemAttributeGroup) {
                const childColumns = this.formatColumnsForGroupAttribute(attributeInGroup?.attribute);
                columns.push(...childColumns);
            } else {
                columns.push(this.formatColumnForSingleAttribute(attributeInGroup.attribute));
            }
        }
        return columns;
    }

    private formatColumnForSingleAttribute(attribute: SearchResultSetItemAttributeBase): ExportColumn {
        // return array of single column
        if (attribute) {
            return {
                label: attribute?.label,
                property: attribute?.id,
                type: this.isNumberType(attribute) ? EdmType.Number : EdmType.String,
                columnType: TableColumnType.DETAIL,
            };
        }
        return {};
    }

    private formatExportRows(formattedResults: Array<FormattedResultItem>): Array<ExportRow> {
        const exportRows = [];
        for (const formattedResult of formattedResults) {
            exportRows.push(this.formatExportRow(formattedResult));
        }
        return exportRows;
    }

    private formatExportRow(formattedResult: FormattedResultItem): ExportRow {
        let exportRow = {};
        for (const visibleColumn of this.visibleColumns) {
            switch (visibleColumn.type) {
                case TableColumnType.TITLE:
                    exportRow[visibleColumn.p13NColumnName] = formattedResult.title;
                    break;

                case TableColumnType.TITLE_DESCRIPTION:
                    exportRow[visibleColumn.p13NColumnName] = formattedResult.titleDescription;
                    break;

                case TableColumnType.DETAIL:
                    if (this.exportDataType === "formatted") {
                        // export single attribute formatted value as one cell
                        // export group attribute formatted values as one merged cell
                        exportRow = {
                            ...exportRow,
                            ...this.formatMergedCell(visibleColumn, formattedResult.itemattributes),
                        };
                    } else {
                        // export single attribute technical value as one cell
                        // export group attribute technical values as multiple separate cells
                        exportRow = {
                            ...exportRow,
                            ...this.formatSeparateCells(visibleColumn, formattedResult.itemattributes),
                        };
                    }
                    break;

                default:
                    // TableColumnType.DETAIL
                    // TableColumnType.RELATED_APPS
                    // TableColumnType.EXTEND
                    // don't export
                    break;
            }
        }
        return exportRow;
    }

    private formatMergedCell(
        visibleColumn: Column,
        formattedAttributes: Array<FormattedResultItemAttribute>
    ): ExportRow {
        const matchedAttribute = formattedAttributes.find(
            (formattedAttribute) => formattedAttribute?.sinaAttribute?.id === visibleColumn.attributeId
        );
        if (matchedAttribute) {
            const key = visibleColumn?.attributeId;
            const value = matchedAttribute?.value || ""; // formatted value
            return {
                [key]: value,
            };
        }
        return {};
    }

    private formatSeparateCells(
        visibleColumn: Column,
        formattedAttributes: Array<FormattedResultItemAttribute>
    ): ExportRow {
        const matchedAttribute = formattedAttributes.find(
            (formattedAttribute) => formattedAttribute?.sinaAttribute?.id === visibleColumn.attributeId
        );
        if (matchedAttribute) {
            const sinaAttribute = matchedAttribute?.sinaAttribute as SearchResultSetItemAttribute;
            if (sinaAttribute instanceof SearchResultSetItemAttributeGroup) {
                return this.formatCellsForGroupAttribute(sinaAttribute);
            } else {
                return this.formatCellsForSingleAttribute(sinaAttribute);
            }
        }
        return {};
    }

    private formatCellsForGroupAttribute(attribute: SearchResultSetItemAttributeGroup): ExportRow {
        let cells = {};
        const attributesInGroup = attribute?.attributes || [];
        for (const attributeInGroup of attributesInGroup) {
            // if (attributeInGroup?.attribute?.metadata?.type === AttributeType.Group) {
            if (attributeInGroup?.attribute instanceof SearchResultSetItemAttributeGroup) {
                const childCells = this.formatCellsForGroupAttribute(attributeInGroup?.attribute);
                cells = { ...cells, ...childCells };
            } else {
                cells = {
                    ...cells,
                    ...this.formatCellsForSingleAttribute(
                        attributeInGroup.attribute as SearchResultSetItemAttribute
                    ),
                };
            }
        }
        return cells;
    }

    private formatCellsForSingleAttribute(attribute: SearchResultSetItemAttribute): ExportRow {
        if (attribute) {
            const key = attribute?.id;
            let value;
            // compatible to old version
            if (this.isNumberType(attribute)) {
                value = attribute?.value || ""; // technical value
            } else {
                value = attribute?.valueFormatted || "";
            }
            return {
                [key]: value,
            };
        }
        return {};
    }

    private isNumberType(attribute: SearchResultSetItemAttributeBase): boolean {
        if (
            attribute?.metadata?.type === AttributeType.Double ||
            attribute?.metadata?.type === AttributeType.Integer
        ) {
            return true;
        } else {
            return false;
        }
    }

    private async doUI5Export(exportData: ExportData): Promise<void> {
        const oSettings = {
            workbook: {
                columns: exportData.exportColumns,
            },
            fileName: i18n.getText("exportFileName"),
            dataSource: exportData.exportRows,
        };

        new Spreadsheet(oSettings).build().then(
            () => {
                // do nothing
            },
            (error) => {
                const errorHandler = ErrorHandler.getInstance();
                errorHandler.onError(error);
            }
        );
    }

    private lockUI(): void {
        const exportButtonId = document?.querySelectorAll('[id$="ushell-search-result-dataExportButton"]')[0]
            ?.id;
        const exportButton = Element.getElementById(exportButtonId) as unknown as Button;
        exportButton?.setEnabled(false);
        this.model?.busyIndicator?.setBusy(true);
    }

    private unlockUI(): void {
        const exportButtonId = document?.querySelectorAll('[id$="ushell-search-result-dataExportButton"]')[0]
            ?.id;
        const exportButton = Element.getElementById(exportButtonId) as unknown as Button;
        exportButton?.setEnabled(true);
        this.model?.busyIndicator?.setBusy(false);
    }
}

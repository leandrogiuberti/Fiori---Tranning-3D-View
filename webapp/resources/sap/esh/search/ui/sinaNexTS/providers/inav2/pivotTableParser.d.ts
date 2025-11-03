declare module "sap/esh/search/ui/sinaNexTS/providers/inav2/pivotTableParser" {
    type AxisServerData = object;
    interface GridServerData {
        Axes: Array<AxisServerData>;
        Cells: Array<unknown>;
    }
    interface PivotTableServerData {
        Grids: Array<GridServerData>;
    }
    class ResultSetParser {
        resultSet: PivotTableServerData;
        constructor(options: any);
        parseNamedValue(namedValue: any): {
            name: any;
            value: any;
        };
        formatItem(item: any): any;
        formatItems(items: any): {};
        parse(): {
            axes: any[];
            cells: any[];
        };
        parseWithCells(grid: any): {
            axes: any[];
            cells: any[];
        };
        parseWithoutCells(grid: any): {
            axes: any[];
            cells: any[];
        };
        resolve(axis: any, index: any): any[];
        enhance(resultSet: any): void;
    }
    function parse(resultSet: any): {
        axes: any[];
        cells: any[];
    };
}
//# sourceMappingURL=pivotTableParser.d.ts.map
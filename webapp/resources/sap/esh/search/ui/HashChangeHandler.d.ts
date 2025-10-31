declare module "sap/esh/search/ui/HashChangeHandler" {
    const HashChangeHandler: {
        handle: (hashChangeInfo: {
            newShellHash: string;
            oldShellHash?: string;
            oldAppSpecificRoute?: string;
        }) => Promise<void>;
        _createSearchModel: () => Promise<void>;
        _getSID: () => {
            systemId: string;
            client: string;
        };
    };
    export default HashChangeHandler;
}
//# sourceMappingURL=HashChangeHandler.d.ts.map
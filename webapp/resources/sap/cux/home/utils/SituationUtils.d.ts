declare module "sap/cux/home/utils/SituationUtils" {
    import Component from "sap/ui/core/Component";
    import DateFormat from "sap/ui/core/format/DateFormat";
    import NumberFormat from "sap/ui/core/format/NumberFormat";
    import ODataModel from "sap/ui/model/odata/v4/ODataModel";
    interface InstanceAttribute {
        SitnInstceKey: string;
        SitnInstceAttribName: string;
        SitnInstceAttribSource: string;
        SitnInstceAttribEntityType: string;
        _InstanceAttributeValue: InstanceAttributeValue[];
    }
    interface InstanceAttributeValue {
        SitnInstceKey: string;
        SitnInstceAttribName: string;
        SitnInstceAttribSource: string;
        SitnInstceAttribValue: string;
    }
    interface NavigationData {
        SitnInstanceID: string;
        SitnSemanticObject: string;
        SitnSemanticObjectAction: string;
        _NavigationParam: NavigationParam[];
    }
    interface NavigationParam {
        SituationNotifParamName: string;
        SituationNotifParameterVal: string;
    }
    let dateFormatter: DateFormat;
    let decimalFormatter: NumberFormat;
    let situationsModel: ODataModel;
    /**
     * Gets the date formatter instance using the medium date pattern.
     *
     * @returns {DateFormat} The date formatter instance.
     */
    const _getDateFormatter: () => DateFormat;
    /**
     * Gets the number formatter instance using the settings retrieved from Configuration.
     *
     * @returns {NumberFormat} The number formatter instance.
     */
    const _getNumberFormatter: () => NumberFormat;
    /**
     * Compose the situation message by replacing placeholders with formatted parameter values.
     *
     * @private
     * @param {string} rawText - The raw text containing placeholders.
     * @param {InstanceAttribute[]} params - An array of parameters to replace in the text.
     * @returns {string} The composed text with replaced placeholders.
     */
    const getSituationMessage: (rawText: string, params?: InstanceAttribute[]) => string;
    /**
     * Executes navigation based on provided data.
     *
     * @private
     * @param {NavigationData} oData - Data object containing navigation parameters.
     * @param {Component} ownerComponent - The owner component initiating the navigation.
     * @returns {Promise<void>} A promise that resolves or rejects based on the navigation result.
     */
    function executeNavigation(oData: NavigationData, ownerComponent: Component): Promise<void>;
    /**
     * Fetches navigation target data based on the provided instance ID.
     *
     * @private
     * @async
     * @param {string} instanceId - The instance ID for which to fetch navigation data.
     * @param {string} situationEngineType - Situation Engine Type
     * @returns {Promise<NavigationData>} A promise that resolves with an object containing navigation data.
     */
    function fetchNavigationTargetData(instanceId: string, situationEngineType: string): Promise<NavigationData> | undefined;
    /**
     * Retrieves the Situations model. If the model does not exist, it creates a new one.
     *
     * @private
     * @returns {ODataModel} The Situations model instance.
     */
    function _getSituationsModel(): ODataModel;
}
//# sourceMappingURL=SituationUtils.d.ts.map
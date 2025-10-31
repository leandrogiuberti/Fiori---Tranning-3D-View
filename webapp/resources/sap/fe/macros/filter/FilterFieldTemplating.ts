import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { hasValueHelp } from "sap/fe/core/templating/PropertyHelper";
import { getDisplayMode } from "sap/fe/core/templating/UIFormatters";

import type { Property } from "@sap-ux/vocabularies-types";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import type { ComputedAnnotationInterface } from "sap/fe/core/templating/UIFormatters";
import type Context from "sap/ui/model/odata/v4/Context";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type { ValueListInfo } from "sap/ui/model/odata/v4/ODataMetaModel";

export const getDisplayProperty = function (propertyObjectPath: DataModelObjectPath<Property>, propertyConverted: Property): string {
	return hasValueHelp(propertyConverted) ? getDisplayMode(propertyObjectPath) : "Value";
};

export const getFilterFieldDisplayFormat = async function (
	propertyObjectPath: DataModelObjectPath<Property>,
	propertyConverted: Property,
	propertyInterface: ComputedAnnotationInterface
): Promise<string> {
	const oTextAnnotation = propertyConverted?.annotations?.Common?.Text;
	if (oTextAnnotation) {
		// The text annotation should be on the property defined
		return getDisplayProperty(propertyObjectPath, propertyConverted);
	}
	const bHasValueHelp = hasValueHelp(propertyConverted);
	if (bHasValueHelp) {
		// Exceptional case for missing text annotation on the property (retrieve text from value list)
		// Consider TextArrangement at EntityType otherwise set default display format 'DescriptionValue'
		const entityTextArrangement = propertyObjectPath?.targetEntityType?.annotations?.UI?.TextArrangement;
		return entityTextArrangement
			? getDisplayMode(propertyObjectPath)
			: _getDisplayModeFromValueHelp(propertyInterface, propertyObjectPath);
	}
	return "Value";
};

/**
 * Method to determine the display mode from the value help.
 * @param Interface The current templating context
 * @param propertyObjectPath The global path to reach the entitySet
 * @returns A promise with the string 'DescriptionValue' or 'Value', depending on whether a text annotation exists for the property in the value help
 * Hint: A text arrangement is consciously ignored. If the text is retrieved from the value help, the text arrangement of the value help property isn´t considered. Instead, the default text arrangement #TextFirst
 * is used.
 */
export async function _getDisplayModeFromValueHelp(
	Interface: ComputedAnnotationInterface,
	propertyObjectPath: DataModelObjectPath<Property>
): Promise<string> {
	const context = Interface.context as unknown as Context;
	const metaModel = Interface.context.getModel() as ODataMetaModel;

	return metaModel.requestValueListInfo(context.getPath(), true, context).then(function (valueListInfo) {
		const firstKey = Object.keys(valueListInfo)[0];
		const firstValueListInfo = valueListInfo[firstKey] as ValueListInfo;
		const valueListParameter = firstValueListInfo.Parameters?.find((element) => {
			return element.LocalDataProperty?.$PropertyPath === propertyObjectPath?.targetObject?.name;
		});
		const valueListProperty = valueListParameter?.ValueListProperty;
		const propertyConverted = MetaModelConverter.getInvolvedDataModelObjects<Property>(
			metaModel.createBindingContext("/" + firstValueListInfo.CollectionPath + "/" + valueListProperty)!
		);
		return getDisplayMode(propertyConverted);
	});
}

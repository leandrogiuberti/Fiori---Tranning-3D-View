/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
import { ValueState } from "sap/ui/core/library";

export type Property = {
	label?: string;
	type: string;
	name: string;
	labelWithValue?: string;
	"sap:label"?: string;
	propertyKeyForId?: string;
};
export type NavigationParameter = {
	name: string;
	value?: string[];
	properties?: Property[];
};
export type NavigationalData = {
	name: string;
	value: Property[];
};
export type NavigationParameters = {
	parameters: NavigationParameter[];
};
export type ObjectCardGroups = {
	title: string;
	items: Array<GroupItem>;
};
export type GroupItem = {
	label: string;
	value: string;
	isEnabled: boolean;
	name: string;
	navigationProperty?: string;
	isNavigationEnabled?: boolean;
	navigationalProperties?: Property[];
};
export type UnitOfMeasures = {
	propertyKeyForDescription: string;
	name: string;
	propertyKeyForId: string;
	value: string;
	valueState: ValueState;
	valueStateText: string;
	isNavigationForId?: boolean;
	navigationKeyForId?: string;
	isNavigationForDescription?: boolean;
	navigationKeyForDescription?: string;
	navigationalPropertiesForId?: Property[];
	navigationValueState?: ValueState;
	navigationalValueStateText?: string;
};
export type NavigationProperty = {
	name: string;
	value: Property[];
};

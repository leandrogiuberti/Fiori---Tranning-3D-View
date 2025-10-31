/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
export type FreeStyleFetchOptions = ObjectPageFetchOptions & {
	entitySet: string;
	keyParameters: Record<string, unknown>;
};

export type ObjectPageFetchOptions = {
	isDesignMode?: boolean;
};

/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
export const AnalyticalCardSkeleton = {
	_version: "1.14.0",
	"sap.app": {
		id: "card.explorer.data.list.card",
		type: "card",
		title: "",
		subTitle: "",
		applicationVersion: {
			version: "1.0.0"
		},
		shortTitle: "A short title for this Card",
		info: "Additional information about this Card",
		description: "A long description for this Card",
		tags: {
			keywords: ["Data", "Card", "Sample"]
		}
	},
	"sap.card": {
		type: "Analytical",
		header: {
			title: "",
			subTitle: ""
		},
		content: {
			data: {
				request: {
					url: "",
					method: "GET",
					parameters: {
						$format: "json"
					}
				},
				path: "/d/results"
			},
			item: {
				title: "{ProductName}",
				description: "{UnitsInStock} units in stock",
				attributesOrientationType: "OneColumn",
				attributes: [
					{
						value: "{Processor}"
					}
				]
			},
			maxItems: 5
		}
	}
};

/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
	
 */
const aCustomer = [
	{
		CustomerID: "001",
		CustomerName: "DragonTech Dynamics",
		CityName: "Nivella",
		TotalSpend: 2500000,
		CurrencyCode: "USD"
	},
	{
		CustomerID: "002",
		CustomerName: "Mystic Brewers Guild",
		CityName: "Elaria",
		TotalSpend: 1800000,
		CurrencyCode: "USD"
	},
	{
		CustomerID: "003",
		CustomerName: "Phoenix Aerospace Corp",
		CityName: "Valoria",
		TotalSpend: 3200000,
		CurrencyCode: "USD"
	},
	{
		CustomerID: "004",
		CustomerName: "Enchanted Apparel Ltd",
		CityName: "Faerhaven",
		TotalSpend: 900000,
		CurrencyCode: "USD"
	},
	{
		CustomerID: "005",
		CustomerName: "Arcane Engineering Inc",
		CityName: "Luminas",
		TotalSpend: 4200000,
		CurrencyCode: "USD"
	},
	{
		CustomerID: "006",
		CustomerName: "Celestial Financial Group",
		CityName: "Astria",
		TotalSpend: 5000000,
		CurrencyCode: "USD"
	},
	{
		CustomerID: "007",
		CustomerName: "Starlit Construction Co",
		CityName: "Galdor",
		TotalSpend: 1500000,
		CurrencyCode: "USD"
	},
	{
		CustomerID: "008",
		CustomerName: "Vortex Energy Solutions",
		CityName: "Nivella",
		TotalSpend: 2700000,
		CurrencyCode: "USD"
	},
	{
		CustomerID: "009",
		CustomerName: "Crystal View Media",
		CityName: "Elaria",
		TotalSpend: 2000000,
		CurrencyCode: "USD"
	},
	{
		CustomerID: "010",
		CustomerName: "Elemental Transport Services",
		CityName: "Valoria",
		TotalSpend: 7400000,
		CurrencyCode: "USD"
	}
];

const aConversionRate = [
	{
		CurrencyCode: "AED",
		toUSD: 0.27224
	},
	{
		CurrencyCode: "AUD",
		toUSD: 0.60312
	},
	{
		CurrencyCode: "BHD",
		toUSD: 2.64312
	},
	{
		CurrencyCode: "CAD",
		toUSD: 0.70238
	},
	{
		CurrencyCode: "CHF",
		toUSD: 1.16252
	},
	{
		CurrencyCode: "EUR",
		toUSD: 1.09622
	},
	{
		CurrencyCode: "GBP",
		toUSD: 1.28916
	},
	{
		CurrencyCode: "JPY",
		toUSD: 0.00681
	},
	{
		CurrencyCode: "USD",
		toUSD: 1
	}
];

const getCustomerTypeData = function (keys) {
	var data;
	if (keys) {
		data = aCustomer.find(function (oCustomer) {
			return Object.keys(keys).every(function (key) {
				return !oCustomer[key] || oCustomer[key] === keys[key];
			});
		});
	} else if (keys === undefined) {
		data = aCustomer;
	}
	return data;
};

module.exports = {
	fetchEntries: async function (keyValues) {
		const oTargetCurrencyCode = keyValues["PreferredCurrency"];
		const oTargetConversionRate = aConversionRate.find((oConversionRate) => oConversionRate.CurrencyCode === oTargetCurrencyCode);
		return [
			{
				Set: getCustomerTypeData().map(function (oCustomer) {
					const oSourceConversionRate = aConversionRate.find(
						(oConversionRate) => oConversionRate.CurrencyCode === oCustomer.CurrencyCode
					);
					oCustomer.CurrencyCode = oTargetCurrencyCode;
					oCustomer.TotalSpend = (oCustomer.TotalSpend * oSourceConversionRate.toUSD) / oTargetConversionRate.toUSD;
					return oCustomer;
				})
			}
		];
	}
};

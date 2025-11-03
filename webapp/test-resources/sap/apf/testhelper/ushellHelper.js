/*!
 * SAP APF Analysis Path Framework
 *
 * Copyright (C) 2009-2019 SAP AG or an SAP affiliate company. All rights reserved
 */
/*global sap */

sap.ui.define([
],
function(){
	'use strict';
	var sapApfCumulativeFilter;
	var selectionVariant;
	var externalNavigationConfiguration;
	var externalComponent;

	var ushellHelper = {};
	ushellHelper.spys = {};
	ushellHelper.setup = function(config) {
		sapApfCumulativeFilter = 'UI5 filter expression';
		const ContainerStub = {
			getService : function(serviceName) {
				if (serviceName === "CrossApplicationNavigation" || serviceName === "Navigation") {
					return {
						hrefForExternal : function(configuration){
							ushellHelper.hrefConfiguration = configuration;
							return '#FioriApplication-executeAPFConfigurationS4HANA';
						},
						toExternal : function(configuration, component) {
							externalNavigationConfiguration = configuration;
							externalComponent = component;
						},
						createEmptyAppState : function(component) {
							return {
								setData : function(data) {
									ushellHelper.spys.setData = data;
								},
								save : function() {
									ushellHelper.spys.isSaved = true;
								},
								getKey : function() {
									return "AppStateKey1972";
								}
							};
						},
						getAppState : function(component, key) {
							if (config && config.functions && config.functions.getAppState) {
								return config.functions.getAppState();
							}
							ushellHelper.spys.getAppState = {
								component : component,
								key : key
							};
							var deferred = jQuery.Deferred();
							deferred.resolve({
								getData : function() {
									return {
										'sapApfState' : ushellHelper.sapApfState,
										'sapApfCumulativeFilter' : sapApfCumulativeFilter,
										'selectionVariant': selectionVariant
									};
								}
							});
							return deferred.promise();
						},
						getLinks : function(configObject) {
							ushellHelper.numberOfCallsForGetSemanticObjectLinks++;
							var deferred = jQuery.Deferred();
							if(configObject && typeof configObject.semanticObject === "string"){
								var intents;
								if (config && config.functions && config.functions.getSemanticObjectLinkIntents) {
									intents = config.functions.getSemanticObjectLinkIntents(configObject.semanticObject, configObject.action, configObject.params);
								} else {
									intents = [ {
										intent : "#aSemanticObject-action1",
										text : "action1"
									}, {
										intent : "#aSemanticObject-actionWithParam?a=b",
										text : "actionWithParam"
									} ];
								}
								deferred.resolve(intents);
								return deferred.promise();
							}
							return deferred.reject();
						}
					};
				} else if (serviceName === "PageBuilding"){
					return {
						getFactory : function(){
							return {
								getPageBuildingService : function() {
									return {
										readCatalog : function(catalogID) {
											return {
												Chips : {
													Catalog : {},
													CatalogPageChipInstance : {},
													ChipBags: {
														chipId: "X-SAP-UI2-PAGE:X-SAP-UI2-CATALOGPAGE:SAP_TEST_PERF:ET090PW4NWFHUR2DHWKU6DGAS",
															id: "tileProperties"
													}
												},
											    baseUrl: "",
												chipCount: "0016",
												domainId: "SAP_SD_BC_SALES_PROC_PERF",
												id: "X-SAP-UI2-CATALOGPAGE:SAP_TEST_PERF",
												isReadOnly: "",
												originalLanguage: "en",
												outdated: "",
												remoteId: "",
												remoteType: "",
												scope: "CONFIGURATION",
												systemAlias: "",
												title: "Test",
												type: "CATALOG_PAGE"
											}
										}
									}
								}
							};
						}
					}
				}
				return undefined;
			},
			getServiceAsync(serviceName) {
				return Promise.resolve(this.getService(serviceName));
			}
		};
		ushellHelper.numberOfCallsForGetSemanticObjectLinks = 0;
		ushellHelper.sapApfState = {
			path : 'Alpha',
			filterIdHandler : {
				filterId1 : 'Beta'
			}
		};
		const origRequire = sap.ui.require;
		sinon.stub(sap.ui, "require", function(dependencies, ...args) {
			if ( dependencies === "sap/ushell/Container" ) {
				return ContainerStub;
			}
			return origRequire.call(this, dependencies, ...args);
		});
	};
	ushellHelper.setApfCumulativeFilter = function (newFilter){
		sapApfCumulativeFilter = newFilter;
	};
	ushellHelper.setSelectionVariant = function (newVariant){
		selectionVariant = newVariant;
	};
	ushellHelper.getExternalNavigationConfiguration = function(){
		return externalNavigationConfiguration;
	};
	ushellHelper.getExternalComponent = function(){
		return externalComponent;
	};
	ushellHelper.teardown = function() {
		sap.ui.require.restore();
		ushellHelper.spys = {};
	};
	return ushellHelper;
}, true /*Global_Export*/);

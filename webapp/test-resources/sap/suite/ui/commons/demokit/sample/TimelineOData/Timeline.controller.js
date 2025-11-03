sap.ui.define([ "sap/ui/core/mvc/Controller", 'sap/m/MessageBox', 'sap/ui/model/Filter', 'sap/suite/ui/commons/library',
				"sap/ui/model/odata/v2/ODataModel", "sap/ui/model/FilterOperator", "sap/ui/core/util/MockServer", "sap/m/MessageToast"],
	function(Controller, MessageBox, Filter, suiteLibrary, ODataModel, FilterOperator, MockServer, MessageToast) {
	"use strict";

	var TimelineFilterType = suiteLibrary.TimelineFilterType;
	var oPageController = Controller.extend("sap.suite.ui.commons.sample.TimelineOData.Timeline", {
		onInit: function() {
			this._initMockServer();
			var oModel = new ODataModel("TimelineOData.Timeline/", true);
			this.getView().setModel(oModel);
			this._timeline = this.byId("idTimeline");
			this._initBindingEventHandler();
		},
		onPressItems : function(evt) {
			MessageToast.show("The TimelineItem is pressed.");
		},
		onUserNameClick : function(oEvent) {
			MessageToast.show(oEvent.getSource().getUserName() + " is pressed.");
		},
		_initBindingEventHandler: function() {
			var oBinding = this._timeline.getBinding("content");
			this._timeline.setNoDataText("Loading");

			oBinding.attachDataReceived(function() {
				this._timeline.setNoDataText("No data text");
			}, this);
			
            // Attach custom filter handler to Timeline
			this._timeline.attachFilterSelectionChange(function(oEvent) {
				var sType = oEvent.getParameter("type"),
					bClear = oEvent.getParameter("clear");

                // If clear is triggered (e.g., Clear All), reset external UI elements
				if (bClear) {
					this.byId("idCountrySelector").setSelectedKey("All");
					this.byId("chkCustomFilter").setSelected(false);
					return;
				}

				// Prevent the default filtering behavior of the control
           		 oEvent.preventDefault();
				
	            // Dispatch filter types to respective handlers
				if (sType === TimelineFilterType.Search) {
					this._search(oEvent);
				}
				if (sType === TimelineFilterType.Data) {
					this._dataFilter(oEvent);
				}
				if (sType === TimelineFilterType.Time) {
					this._timeFilter(oEvent);
				}
			}, this);
		},

		_dataFilter: function(oEvent) {
		    // Extract selected data filters from event (e.g., FirstName: Nancy)
			var aItems = oEvent.getParameter("selectedItems"),
				ctrlCustomFilter = this.byId("chkCustomFilter"),
				bNancyOnly = aItems && aItems.length === 1 && aItems[0].key === "Nancy";

            // Update checkbox based on selected value to reflect UI state
			ctrlCustomFilter.setSelected(bNancyOnly);
		},

		_timeFilter: function(oEvent) {
			// Apply custom time range filter using setModelFilter()
			// Only proceed if both from and to values are provided
			if (oEvent.getParameters().timeKeys.from != null && oEvent.getParameters().timeKeys.to != null) {
				  const FilterEventParams = oEvent.getParameters() ;
		          const oDateFilter = new sap.ui.model.Filter({
                    path: "HireDate", // The model property to filter on
                    operator: FilterOperator.BT,
                    value1: FilterEventParams.timeKeys.from.toISOString(), // Convert to ISO format (required for OData V4 RAP backend)
                    value2: FilterEventParams.timeKeys.to.toISOString()
                });
            
                this._timeline.setModelFilter({
                    type: TimelineFilterType.Time,
                    filter: oDateFilter,
                    refresh: false //Using refresh: true in setModelFilter() caused duplicate filters in V4. Setting refresh: false fixed the issue
                });
                this._timeline.setModelFilterMessage(TimelineFilterType.Time, "Custom time filter message");
			}
		},

		_search: function(oEvent) {
			var aColumns = ["Title", "FirstName", "LastName", "Country"],
				oFilter = null,
				sSearchTerm = oEvent.getParameter("searchTerm");
			if (sSearchTerm) {
				oFilter = new Filter(aColumns.map(function(sColName) {
					return new Filter(sColName, FilterOperator.Contains, sSearchTerm);
				}));
			}
			
			this._timeline.setModelFilter({
				type: "Search",
				filter: oFilter,
				refresh: true 
			});
		},

		countryChanged: function(oEvent) {
			var sSelectedItem = oEvent.getParameter("selectedItem").getKey();
			if (sSelectedItem === "All") {
				// clear country filter
				this._timeline.setCustomFilterMessage("");
				this._timeline.setCustomModelFilter("countryFilter", null);
			} else {
				this._timeline.setCustomFilterMessage("Country (" + sSelectedItem + ")");
				this._timeline.setCustomModelFilter("countryFilter", new Filter({
					path: "Country",
					value1: sSelectedItem,
					operator: FilterOperator.EQ
				}));
			}
		},

		customFilterChecked: function(oEvent) {
			var sSelectedItem = oEvent.getParameter("selected"),
				filter = null,
				aSelectedDataItems = [];
			if (sSelectedItem) {
				filter = new Filter({
					path: "FirstName",
					value1: "Nancy",
					operator: FilterOperator.EQ
				});

				aSelectedDataItems = ["Nancy"];
			}

			this._timeline.setModelFilter({
				type: TimelineFilterType.Data,
				filter: filter
			});
			this._timeline.setCurrentFilter(aSelectedDataItems);
		},

		onExit: function() {
			this._oMockServer.stop();
			this._oMockServer.destroy();
		},

		_initMockServer: function() {
			this._oMockServer = new MockServer({
				rootUri: "TimelineOData.Timeline/"
			});
			this._oMockServer.simulate("test-resources/sap/suite/ui/commons/demokit/sample/TimelineOData/mockserver/metadata.xml", {
				sMockdataBaseUrl: "test-resources/sap/suite/ui/commons/demokit/sample/TimelineOData/mockserver/"
			});

			this._oMockServer.start();
		}
	});
	return oPageController;
});
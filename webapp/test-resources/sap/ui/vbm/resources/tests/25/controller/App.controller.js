sap.ui.define([
    "sap/ui/core/mvc/Controller", "sap/m/MessageToast"
], function(Controller, MessageToast) {
	"use strict";
	return Controller.extend("vbm-regression.tests.25.controller.App", {

		onInit: function() {

			var vbi1 = this.byId("vbi1"),
				vbi2 = this.byId("vbi2"),
				vbi3 = this.byId("vbi3");

			// load the json and set the default text area text
			$.getJSON("media/vbdetail/main.json", function(data) {
				var userStoredData = GLOBAL_MAP_CONFIG;
				data.SAPVB.MapLayerStacks.Set.MapLayerStack = userStoredData.MapLayerStacks;
				data.SAPVB.MapProviders.Set.MapProvider = userStoredData.MapProvider;

				var scene = userStoredData.MapLayerStacks;
				if (scene instanceof Array) {
					data.SAPVB.Scenes.Set.SceneGeo.refMapLayerStack = userStoredData.MapLayerStacks[0].name;
				} else {
					data.SAPVB.Scenes.Set.SceneGeo.refMapLayerStack = userStoredData.MapLayerStacks.name;
				}
				vbi1.load(data);
				vbi2.load(data);
				vbi3.load(data);

				$.getJSON("media/vbdetail/opendetail1.json", function(dat) {
					vbi1.load(dat);
					vbi1.zoomToGeoPosition(30, 45, 4);
				});

				$.getJSON("media/vbdetail/opendetail2.json", function(dat) {
					vbi2.load(dat);
					vbi2.zoomToGeoPosition(30, 20, 1);
				});

				$.getJSON("media/vbdetail/opendetail3.json", function(dat) {
					vbi3.load(dat);
					vbi3.zoomToGeoPosition(30, 20, 1);
				});
			});

		},

		onOpenWindow: function(event) {
			var oPanel = new sap.m.Panel({
				width: "350px",
				headerText: "Location Data", //Set the title of the panel
				backgroundDesign: sap.m.BackgroundDesign.Transparent
			 });
			 var oVBox = new sap.m.VBox();

			 //Create a simple form within the layout
			 function createFormRow(labelText, inputValue) {
				return new sap.m.HBox({
				   items: [
					  new sap.m.Label({
						 text: labelText,
						 width: "100px" // Fixed width for labels
					  }),
					  new sap.m.Input({
						 value: inputValue,
						 width: "200px" // Adjust width for inputs
					  })
				   ],
				   justifyContent: "Start",
				   alignItems: "Center"
				});
			 }

			 // Add form rows to VBox
			 oVBox.addItem(createFormRow("Name", "Mustermann"));
			 oVBox.addItem(createFormRow("First Name", "Max"));

			 // Wrap VBox inside SimpleForm
			 var oSimpleForm = new sap.ui.layout.form.SimpleForm({
				layout: "ResponsiveLayout",
				editable: true,
				content: [oVBox]
			});

			// Add the SimpleForm to the panel's content area
			oPanel.addContent(oSimpleForm);

		   // Create Save and Cancel buttons
		   var oSaveButton = new sap.m.Button({
			   text: "Save",
			   layoutData: new sap.m.FlexItemData({ styleClass: "sapUiMediumMarginEnd" })
		   });

		   var oCancelButton = new sap.m.Button({
			   text: "Cancel"
		   });


		   var oButtonRow = new sap.m.HBox({
			   items: [oSaveButton, new sap.m.ToolbarSpacer(), oCancelButton],

			   alignItems: "Center",
			   width: "100%", // Ensure full width for proper alignment
			   marginTop: "10px" // Add spacing from form
		   });

		   // Add button row to panel
		   oPanel.addContent(oButtonRow);

			//Attach the panel to the page
			oPanel.placeAt(event.getParameter("contentarea").id);

		}

	});
});

sap.ui.define(
	[
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/library",
		"./BaseController",
		"sap/ui/Device",
		"sap/ui/core/Fragment",
		"../model/ExploreSettingsModel",
		"../model/AppSettingsModel",
		"sap/base/i18n/Localization",
		"sap/ui/core/Theming",
		"../model/navigationModel"
	],
	function (
		JSONModel,
		Filter,
		FilterOperator,
		mLibrary,
		BaseController,
		Device,
		Fragment,
		ExploreSettingsModel,
		AppSettingsModel,
		Localization,
		Theming,
		NavigationModel
	) {
		"use strict";

		const LEGAL_LINKS = {
			legal: "https://www.sap.com/corporate/en/legal/impressum.html",
			privacy: "https://www.sap.com/corporate/en/legal/privacy.html",
			terms_of_use: "https://www.sap.com/corporate/en/legal/terms-of-use.html"
		};

		return BaseController.extend("sap.fe.core.fpmExplorer.App", {
			/**
			 * Called when the app is started.
			 */
			onInit: async function () {
				const component = this.getOwnerComponent();
				component.getEventBus().subscribe("navEntryChanged", this.onPageChange, this);

				this.getView().addStyleClass(component.getContentDensityClass());

				this.getRouter().attachBypassed(function () {
					this.navToRoute("overview/introduction");
				}, this);
				var uriParams = new URLSearchParams(window.location.search);
				const jsonModel = new JSONModel({ showInternal: false });

				if (uriParams.has("showInternalFPM")) {
					// TODO: we don't consider this one right now
					jsonModel.setProperty("/showInternal", true);
				}

				// for now we always hide the code editor, we might add an URL at a later point of time
				window.sapfe_codeEditorVisible = false;

				this.getView().setModel(jsonModel, "ui");
				this.getView().setModel(ExploreSettingsModel, "settings");
				this.getView().setModel(AppSettingsModel, "appSettings");
				const navigationModel = await NavigationModel.init();
				this.getView().setModel(navigationModel);
				this.searchField = this.getView().byId("searchField");

				function _fnFlattenModel(member, model, parent) {
					if (!member.items) {
						const newMember = { ...member };
						newMember.title = parent ? parent.title + " - " + newMember.title : newMember.title;
						newMember.tags = newMember.title + ", " + (newMember.tags ?? "");
						newMember.key = member.chapter + "/" + member.key;
						return [newMember];
					}
					return member.items.flatMap((itemMember) => _fnFlattenModel(itemMember, model, member));
				}
				//create "flattened" search model
				const searchModel = navigationModel.oData.navigation.flatMap((member) => _fnFlattenModel(member, navigationModel));
				this.getView().setModel(new JSONModel(searchModel), "sampleSearch");

				Device.media.attachHandler(this.onDeviceSizeChange, this);
				this.onDeviceSizeChange();
			},

			onExit: function () {
				Device.media.detachHandler(this.onDeviceSizeChange, this);
			},

			onSearch: function (event) {
				var item = event.getParameter("suggestionItem");
				if (item) {
					this.navToRoute(item.getKey());
					this.searchField.getBinding("suggestionItems").filter();
					this.searchField.clear();
				} else {
					this.searchField.suggest(true);
				}
			},

			createFilters: function (sPropertyPath, sValue) {
				return Object.assign(
					[],
					//separate filter on each search sub string
					sValue
						.trim()
						.split(" ")
						.map(function (substr) {
							return new Filter({
								path: sPropertyPath,
								operator: FilterOperator.Contains,
								value1: substr
							});
						})
				);
			},

			onSuggest: function (event) {
				var suggestValue = event.getParameter("suggestValue");
				var filters = [];
				if (suggestValue) {
					//Combined filter on nav model title and tags
					//search on each sub string combined with logical AND
					var filterTitle = new Filter({
						filters: this.createFilters("title", suggestValue),
						and: true
					});
					var oFilterTags = new Filter({
						filters: this.createFilters("tags", suggestValue),
						and: true
					});
					//substring search filter arrays combined with logical or (search results in sample title or tags)
					filters = new Filter({
						filters: [filterTitle, oFilterTags],
						and: false
					});
				}
				//filter search field suggestion items
				this.searchField.getBinding("suggestionItems").filter(filters);
				//add tag hits for each filtered item to the suggestion description
				this.searchField.getSuggestionItems().map((item) => {
					//get tag array for each sample from search model
					const sample = this.getModel("sampleSearch")
						.getData()
						.filter((obj) => {
							return obj.key === item.getProperty("key") ? obj : undefined;
						})[0];
					var tagHits = [];
					if (suggestValue.length > 0 && sample && sample.tags) {
						//process each tag separately
						tagHits = sample.tags
							.split(",")
							.map((tag) => {
								//check whether any search substring matches tag
								var match = false;
								suggestValue
									.trim()
									.split(" ")
									.map((substr) => {
										//exlude sample title from tags to avoid duplicate display in suggestion list
										if (
											tag.toLowerCase().includes(substr.toLowerCase()) &&
											!sample.title.toLowerCase().includes(tag.toLowerCase())
										) {
											match = true;
										}
									});
								return match ? tag : undefined;
								//filter out undefined elements returned by .map()
							})
							.filter(function (element) {
								return element !== undefined;
							});
					}
					//set hit tag to search model sample
					sample.tagHit = tagHits.length > 0 ? tagHits.toString() : "";
				});
				this.getModel("sampleSearch").refresh();
				this.searchField.suggest(true);
			},

			/**
			 * Finds the target by the route's hash and navigates to it.
			 * @param {string} sRouteHash For example: 'explore/list/numeric'.
			 */
			navToRoute: function (sRouteHash) {
				var aParts = sRouteHash.split("/");
				if (aParts) {
					switch (aParts[0]) {
						case "overview":
							this.getRouter().navTo("topic", {
								sample: aParts[1],
								subSample: aParts[2]
							});
							break;
						case "floorplans":
							this.getRouter().navTo("topic", {
								sample: aParts[1],
								subSample: aParts[2]
							});
							break;
						case "customElements":
							this.getRouter().navTo("customElements", {
								sample: aParts[1],
								subSample: aParts[2]
							});
							break;
						case "controllerExtensions":
							this.getRouter().navTo("controllerExtensions", {
								sample: aParts[1],
								subSample: aParts[2]
							});
							break;
						case "buildingBlocks":
							this.getRouter().navTo("buildingBlocks", {
								sample: aParts[1],
								subSample: aParts[2]
							});
							break;
						case "advancedFeatures":
							this.getRouter().navTo("advancedFeatures", {
								sample: aParts[1],
								subSample: aParts[2]
							});
							break;

						case "internalExperiments":
							this.getRouter().navTo("internalExperiments", {
								sample: aParts[1],
								subSample: aParts[2]
							});
							break;
						default:
							this.getRouter().navTo(aParts[0]);
					}
				}
			},

			onNavigationItemPress: function (oEvent) {
				const item = oEvent.getSource();

				var oItemConfig = item.getBindingContext().getObject(),
					hash = oItemConfig.chapter + "/" + oItemConfig.key;

				// shall we keep the previous setting or always hide code? to be discussed...
				window.sapfe_codeEditorVisible = false;

				this.navToRoute(hash);
			},

			onDeviceSizeChange: function () {
				var toolPage = this.byId("toolPage"),
					sRangeName = Device.media.getCurrentRange("StdExt").name;

				switch (sRangeName) {
					case "Phone":
					case "Tablet":
						toolPage.setSideExpanded(false);
						break;
					case "Desktop":
						toolPage.setSideExpanded(true);
						break;
				}
			},

			_appSettingsDialog: null,

			handleAppSettings: function (sAction) {
				switch (sAction) {
					case "open": {
						if (!this._appSettingsDialog) {
							Fragment.load({
								name: "sap.fe.core.fpmExplorer.view.AppSettingsDialog",
								controller: this
							}).then(
								function (oDialog) {
									// connect dialog to the root view of this component (models, lifecycle)
									this.getView().addDependent(oDialog);
									this._appSettingsDialog = oDialog;
									this._appSettingsDialog.open();
								}.bind(this)
							);
						} else {
							this._appSettingsDialog.open();
						}
						break;
					}
					case "reset": {
						AppSettingsModel.resetValues();
						break;
					}
					case "close": {
						this._appSettingsDialog.close();
						break;
					}
					case "apply": {
						AppSettingsModel.saveValues();
						AppSettingsModel.applyValues();
						Theming.setTheme(AppSettingsModel.getTheme());
						Localization.setRTL(AppSettingsModel.getRTL());
						this._appSettingsDialog.close();
						break;
					}
					default:
						break;
				}
			},

			_currentKey: null,

			onPageChange: function (event, name, page) {
				function findPathWithKey(navigation, key) {
					function traverse(items, key) {
						for (const item of items) {
							// If the key is found in the current object
							if (item.key === key) {
								return [item];
							}

							// If the current object has children, search recursively
							if (item.items) {
								const childPath = traverse(item.items, key);
								if (childPath) {
									return [item, ...childPath];
								}
							}
						}
						return null; // Key not found in this branch
					}

					// Start the traversal from the root navigation array
					return traverse(navigation, key) || [];
				}

				let expandTree = !!(page && page.navigationItemKey);

				const key = (this._currentKey = (page && page.navigationItemKey) || this._currentKey);

				const navigation = this.getModel().getData().navigation;
				const path = findPathWithKey(navigation, key);
				const tree = this.getView().byId("navigationTree");
				const treeItems = tree.getItems();
				// Remove highlighting
				for (let i = 0; i < treeItems.length; i++) {
					const treeItem = treeItems[i];
					treeItem.setHighlight(null);
				}

				if (path) {
					for (let i = 0; i < path.length; i++) {
						const item = path[i];
						const treeItems = tree.getItems();
						for (let j = 0; j < treeItems.length; j++) {
							const treeItem = treeItems[j];
							const itemConfig = treeItem.getBindingContext().getObject();
							if (itemConfig.key === item.key) {
								if (itemConfig.items) {
									if (expandTree) {
										tree.expand(j);
									}
								} else if (itemConfig.key === key) {
									// I didn't find a better way to highlight the item
									// we might add a CSS class later and provide a better highlighting
									treeItem.setHighlight("Information");
								}
							}
						}
					}
				}
			},

			onLegalPress: function (target) {
				var linkTarget = LEGAL_LINKS[target];
				mLibrary.URLHelper.redirect(linkTarget, true);
			},

			/**
			 * Toggles the visibility of the side navigation panel.
			 * Called when the side navigation toggle button is pressed.
			 */
			onSideNavButtonPress: function () {
				const splitContainer = this.byId("toolPage");
				const toggleButton = this.byId("sideNavigationToggleButton");
				const isMasterShown = splitContainer.isMasterShown();
				if (isMasterShown) {
					splitContainer.hideMaster();
					toggleButton.setTooltip("Show Navigation");
				} else {
					splitContainer.showMaster();
					toggleButton.setTooltip("Hide Navigation");
				}
			}
		});
	}
);

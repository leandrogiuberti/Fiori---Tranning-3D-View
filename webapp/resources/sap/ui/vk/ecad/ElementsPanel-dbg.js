/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.ecad.ElementsPanel
sap.ui.define([
	"sap/m/VBox",
	"sap/m/Button",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/Table",
	"sap/m/table/ColumnWidthController",
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/QuickGroup",
	"sap/m/table/columnmenu/QuickGroupItem",
	"sap/m/table/columnmenu/QuickSort",
	"sap/m/table/columnmenu/QuickSortItem",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/plugins/ColumnResizer",
	"sap/m/MultiComboBox",
	"sap/m/IllustratedMessage",
	"sap/m/IllustratedMessageType",
	"sap/m/p13n/Engine",
	"sap/m/p13n/SelectionController",
	"sap/m/p13n/GroupController",
	"sap/m/p13n/SortController",
	"sap/m/p13n/MetadataHelper",
	"sap/ui/core/Control",
	"sap/ui/core/CustomData",
	"sap/ui/core/Element",
	"sap/ui/core/Icon",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"../Core",
	"./VisibilityType",
	"../getResourceBundle",
	"sap/m/library"
], function(
	VBox,
	Button,
	OverflowToolbar,
	ToolbarSpacer,
	Label,
	Input,
	Table,
	ColumnWidthController,
	Menu,
	QuickGroup,
	QuickGroupItem,
	QuickSort,
	QuickSortItem,
	Column,
	ColumnListItem,
	ColumnResizer,
	MultiComboBox,
	IllustratedMessage,
	IllustratedMessageType,
	Engine,
	SelectionController,
	GroupController,
	SortController,
	MetadataHelper,
	Control,
	CustomData,
	Element,
	Icon,
	Lib,
	CoreLibrary,
	JSONModel,
	Filter,
	FilterOperator,
	Sorter,
	vkCore,
	VisibilityType,
	getResourceBundle,
	SapMLibrary
) {
	"use strict";

	const SortOrder = CoreLibrary.SortOrder;

	const IconType = {
		Hidden: "sap-icon://hide",
		Partial: "sap-icon://vk-icons/partially-visible-element",
		Visible: "sap-icon://show"
	};

	const ColumnName = {
		RefDes: "refdes",
		Type: "type",
		Device: "deviceref",
		Visibility: "visibility"
	};

	const ElementType = {
		Component: "2",
		Net: "4"
	};

	const ModelName = {
		FilterSummary: "FilterSummary",
		ElementType: "ElementType"
	};

	function getKeyForItem(element) {
		return element.data("key");
	}

	function findItemByKey(items, key) {
		return items.find(element => getKeyForItem(element) === key);
	}

	function isAncestorOf(ancestor, descendant) {
		for (let current = descendant.getParent(); current != null; current = current.getParent()) {
			if (current === ancestor) {
				return true;
			}
		}
		return false;
	}

	function getVisibility(element) {
		if (element.hiddenParts.size === 0) {
			return VisibilityType.Visible;
		} else if (element.hiddenParts.size < element.parts.size) {
			return VisibilityType.Partial;
		}
		return VisibilityType.Hidden;
	}

	function extractMetadata(nodeRef) {
		const metadata = nodeRef?.userData?.metadata ?? {};
		if (metadata.length != undefined) {
			const map = new Map();
			metadata.forEach(entry => {
				if (entry.category === "ecad") {
					map.set(entry.tag, entry.value);
				}
			});
			return map;
		}
		return null;
	}

	function formatElementType(element) {
		switch (element.type) {
			case ElementType.Component:
				return getResourceBundle().getText("ELEMENTS_PANEL_TYPE_COMPONENT");
			case ElementType.Net:
				return getResourceBundle().getText("ELEMENTS_PANEL_TYPE_NET");
			default:
				return getResourceBundle().getText("ELEMENTS_PANEL_TYPE_UNKNOWN");
		}
	}

	/**
	 * Constructor for a new ElementsPanel.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class Provides a list of all ECAD elements in a given scene in table format.
	 *
	 * <b>NOTE:</b> To use this control the application developer should add dependencies to the
	 * following libraries on application level to ensure that the libraries are loaded before the
	 * module dependencies will be required:
	 * <ul>
	 *   <li>sap.f</li>
	 *   <li>sap.ui.comp</li>
	 * </ul>
	 *
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @version 1.141.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.vk.ecad.ElementsPanel
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 * @since 1.136.0
	 */
	var ElementsPanel = Control.extend("sap.ui.vk.ecad.ElementsPanel", /** @lends sap.ui.vk.ecad.ElementsPanel.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "auto"
				},
				height: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "100%"
				}
			},
			aggregations: {
				content: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				}
			},
			associations: {
				/**
				 * An association to the <code>ContentConnector</code> instance that manages content resources.
				 */
				contentConnector: {
					type: "sap.ui.vk.ContentConnector",
					multiple: false
				},

				/**
				 * An association to the <code>ViewStateManager</code> instance.
				 */
				viewStateManager: {
					type: "sap.ui.vk.ViewStateManagerBase",
					multiple: false
				}
			},
			events: {
				/**
				 * This event will be fired when content is replaced.
				 */
				contentChanged: {
					enableEventBubbling: true
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.class("sapUiSizeCompact");
				const width = oControl.getWidth();
				if (width != null) {
					oRm.style("width", width);
				}
				const height = oControl.getHeight();
				if (height != null) {
					oRm.style("height", height);
				}
				oRm.openEnd();
				oRm.renderControl(oControl.getAggregation("content"));
				oRm.close("div");
			}
		},
		constructor: function(sId, mSettings) {
			Control.apply(this, arguments);
			vkCore.observeAssociations(this);
		}
	});

	ElementsPanel.prototype.onSetViewStateManager = function(manager) {
		this._manager = manager;
		manager.attachSelectionChanged(this._onViewportSelectionChanged, this);
		manager.attachVisibilityChanged(this._onVisibilityChanged, this);
		this._refresh();
	};

	ElementsPanel.prototype.onUnsetViewStateManager = function(manager) {
		this._manager = null;
		manager.detachSelectionChanged(this._onViewportSelectionChanged, this);
		manager.detachVisibilityChanged(this._onVisibilityChanged, this);
		this._refresh();
	};

	ElementsPanel.prototype.onSetContentConnector = function(connector) {
		connector.attachContentReplaced(this._onContentReplaced, this);
		this._setContent(connector.getContent());
	};

	ElementsPanel.prototype.onUnsetContentConnector = function(connector) {
		this._setContent(null);
		connector.detachContentReplaced(this._onContentReplaced, this);
	};

	ElementsPanel.prototype.init = function() {
		Control.prototype.init?.apply(this);

		const filterSummaryData = {
			expandedFilterSummary: "",
			snappedFilterSummary: ""
		};

		const elementTypeData = [ElementType.Component, ElementType.Net];

		this._scene = null;
		this._model = new JSONModel();
		this._skipEvent = false;
		this._filterSummaryModel = new JSONModel(filterSummaryData);
		this._elementTypeModel = new JSONModel(elementTypeData);

		this.setModel(this._filterSummaryModel, ModelName.FilterSummary);
		this.setModel(this._elementTypeModel, ModelName.ElementType);

		// show no data message before libraries loaded
		this.setAggregation("content", new IllustratedMessage({
			illustrationType: IllustratedMessageType.NoData,
			enableVerticalResponsiveness: true
		}));

		this._promise = Promise.all([
			Lib.load("sap.f"),
			Lib.load("sap.ui.comp")
		]).then(() => new Promise(resolve => {
			sap.ui.require([
				"sap/f/DynamicPage",
				"sap/f/DynamicPageTitle",
				"sap/f/DynamicPageHeader",
				"sap/ui/comp/filterbar/FilterBar",
				"sap/ui/comp/filterbar/FilterGroupItem"
			], (
				DynamicPage,
				DynamicPageTitle,
				DynamicPageHeader,
				FilterBar,
				FilterGroupItem
			) => {
				this._showButton = new Button({
					enabled: false,
					icon: IconType.Visible,
					text: getResourceBundle().getText("ELEMENTS_PANEL_SHOW_BUTTON"),
					tooltip: getResourceBundle().getText("ELEMENTS_PANEL_SHOW_BUTTON_TOOLTIP"),
					press: this._onShowElements.bind(this)
				});

				this._hideButton = new Button({
					enabled: false,
					icon: IconType.Hidden,
					text: getResourceBundle().getText("ELEMENTS_PANEL_HIDE_BUTTON"),
					tooltip: getResourceBundle().getText("ELEMENTS_PANEL_HIDE_BUTTON_TOOLTIP"),
					press: this._onHideElements.bind(this)
				});

				this._settingsButton = new Button({
					icon: "sap-icon://action-settings",
					tooltip: getResourceBundle().getText("ELEMENTS_PANEL_SETTINGS_BUTTON_TOOLTIP"),
					press: this._onSettings.bind(this)
				});

				// Menu with sorting
				const sortMenu = new Menu({
					showTableSettingsButton: true,
					beforeOpen: this._onBeforeOpenColumnMenu.bind(this),
					tableSettingsPressed: this._onSettings.bind(this),
					quickActions: [
						new QuickSort({
							change: this._onSort.bind(this), items: [new QuickSortItem()]
						})
					]
				});

				// Menu with sorting and grouping
				const sortGroupMenu = new Menu({
					showTableSettingsButton: true,
					beforeOpen: this._onBeforeOpenColumnMenu.bind(this),
					tableSettingsPressed: this._onSettings.bind(this),
					quickActions: [
						new QuickSort({
							change: this._onSort.bind(this),
							items: [new QuickSortItem()]
						}),
						new QuickGroup({
							change: this._onGroup.bind(this),
							items: [new QuickGroupItem()]
						})
					]
				});

				this._rowTemplate = new ColumnListItem({
					vAlign: "Middle",
					cells: [
						new Label({
							text: "{refdes}",
							customData: new CustomData({ key: "key", value: ColumnName.RefDes })
						}),
						new Label({
							text: {
								path: "",
								formatter: formatElementType,
								customData: new CustomData({ key: "key", value: ColumnName.Type })
							}
						}),
						new Label({
							text: "{deviceref}",
							customData: new CustomData({ key: "key", value: ColumnName.Device })
						}),
						new Icon({
							src: {
								path: "",
								formatter: function(element) {
									switch (getVisibility(element)) {
										case VisibilityType.Hidden:
											return IconType.Hidden;
										case VisibilityType.Partial:
											return IconType.Partial;
										default:
											return IconType.Visible;
									}
								}
							},
							tooltip: {
								path: "",
								formatter: function(element) {
									switch (getVisibility(element)) {
										case VisibilityType.Hidden:
											return getResourceBundle().getText("ELEMENTS_PANEL_VISIBLE_COLUMN_HIDDEN_TOOLTIP");
										case VisibilityType.Partial:
											return getResourceBundle().getText("ELEMENTS_PANEL_VISIBLE_COLUMN_PARTIAL_TOOLTIP");
										default:
											return getResourceBundle().getText("ELEMENTS_PANEL_VISIBLE_COLUMN_VISIBLE_TOOLTIP");
									}
								}
							},
							customData: new CustomData({ key: "key", value: ColumnName.Visibility })
						})
					]
				});

				this._table = new Table({
					id: "elements-table",
					mode: "MultiSelect",
					fixedLayout: "Strict",
					autoPopinMode: true,
					popinLayout: "GridSmall",
					includeItemInSelection: true,
					sticky: [SapMLibrary.Sticky.HeaderToolbar, SapMLibrary.Sticky.ColumnHeaders],
					selectionChange: this._onTableSelectionChanged.bind(this),
					headerToolbar: new OverflowToolbar({
						content: [
							new ToolbarSpacer(),
							this._showButton,
							this._hideButton,
							this._settingsButton
						]
					}),
					dependents: [
						new ColumnResizer({
							columnResize: this._onColumnResize.bind(this)
						})
					],
					columns: [
						new Column({
							headerMenu: sortMenu,
							hAlign: CoreLibrary.TextAlign.Begin,
							customData: new CustomData({ key: "key", value: ColumnName.RefDes }),
							header: new Label({ text: getResourceBundle().getText("ELEMENTS_PANEL_NAME_COLUMN") })

						}),
						new Column({
							headerMenu: sortGroupMenu,
							hAlign: CoreLibrary.TextAlign.Begin,
							customData: new CustomData({ key: "key", value: ColumnName.Type }),
							header: new Label({ text: getResourceBundle().getText("ELEMENTS_PANEL_TYPE_COLUMN") })
						}),
						new Column({
							headerMenu: sortGroupMenu,
							hAlign: CoreLibrary.TextAlign.Begin,
							customData: new CustomData({ key: "key", value: ColumnName.Device }),
							header: new Label({ text: getResourceBundle().getText("ELEMENTS_PANEL_DEVICE_REFERENCE_COLUMN") })
						}),
						new Column({
							hAlign: CoreLibrary.TextAlign.Center,
							customData: new CustomData({ key: "key", value: ColumnName.Visibility }),
							header: new Label({ text: getResourceBundle().getText("ELEMENTS_PANEL_VISIBLE_COLUMN") })
						})
					],
					items: {
						path: "/",
						template: this._rowTemplate
					}
				});

				this._table.setModel(this._model);

				this._filterBar = new FilterBar({
					useToolbar: false,
					persistencyKey: "Filters",
					search: this._onSearch.bind(this),
					filterChange: this._onFilterChange.bind(this),
					assignedFiltersChanged: this._onAssignedFiltersChanged.bind(this),
					filterGroupItems: [
						new FilterGroupItem({
							name: ColumnName.RefDes,
							label: getResourceBundle().getText("REFDES_FILTER_LABEL"),
							groupName: "basic",
							visible: true,
							visibleInFilterBar: true,
							control: new Input({
								change: this._onFilterChange.bind(this)
							})
						}),
						new FilterGroupItem({
							name: ColumnName.Type,
							label: getResourceBundle().getText("TYPE_FILTER_LABEL"),
							groupName: "basic",
							visible: true,
							visibleInFilterBar: true,
							control: new MultiComboBox({
								selectionChange: this._onFilterChange.bind(this),
								items: {
									path: ModelName.ElementType + ">/",
									templateShareable: false,
									template: new sap.ui.core.Item({
										key: "{" + ModelName.ElementType + ">}",
										text: {
											path: ModelName.ElementType + ">",
											formatter: function(type) {
												switch (type) {
													case ElementType.Component:
														return getResourceBundle().getText("ELEMENTS_PANEL_TYPE_COMPONENT");
													case ElementType.Net:
														return getResourceBundle().getText("ELEMENTS_PANEL_TYPE_NET");
													default:
														return getResourceBundle().getText("ELEMENTS_TYPE_FILTER_ALL");
												}
											}
										}
									})
								}
							})
						}),
						new FilterGroupItem({
							name: ColumnName.Device,
							label: getResourceBundle().getText("DEVICE_REF_FILTER_LABEL"),
							groupName: "basic",
							visible: true,
							visibleInFilterBar: true,
							control: new Input({
								change: this._onFilterChange.bind(this)
							})
						})
					]
				});

				this._page = new DynamicPage({
					visible: false,
					fitContent: true,
					showFooter: false,
					headerExpanded: false,
					title: new DynamicPageTitle({
						heading: this._filterTitle,
						expandedContent: new Label({
							text: "{" + ModelName.FilterSummary + ">/expandedFilterSummary}"
						}),
						snappedContent: new Label({
							text: "{" + ModelName.FilterSummary + ">/snappedFilterSummary}"
						})
					}),
					header: new DynamicPageHeader({
						content: this._filterBar
					}),
					content: this._table
				});

				this._message = new IllustratedMessage({
					illustrationType: IllustratedMessageType.NoData,
					enableVerticalResponsiveness: true
				});

				const content = new VBox({
					height: "100%",
					renderType: SapMLibrary.FlexRendertype.Bare,
					items: [
						this._page,
						this._message
					]
				});

				this.destroyAggregation("content");
				this.setAggregation("content", content);

				this._p13nEngine = Engine.getInstance();

				// Register the elements table for personalization
				this._registerForP13n();

				// Set up filter bar data handlers
				this._filterBar.addEventDelegate({
					// When the user hits the `Enter` key in any of the filter bar controls, we trigger the
					// search. This handler covers all the filter group items. The basic search field is handled separately.
					onsapenter: event => {
						const control = event.srcControl;
						// If `control` itself or its ancestor is a part of the `filterGroupItems` aggregation of
						// the `FilterBar` control, then we can trigger the search.
						if (this._filterBar.getFilterGroupItems().some(item => {
							const itemControl = item.getControl();
							return itemControl === control || isAncestorOf(itemControl, control);
						})) {
							this._onAssignedFiltersChanged();
							this._updateFilterBarToolbarText();
							this._onSearch();
						}
					}
				});

				this._filterBar.registerGetFiltersWithValues(this._getFiltersWithValues.bind(this));

				this._onAssignedFiltersChanged();
				this._updateFilterBarToolbarText();

				resolve();
			});
		}));
	};

	ElementsPanel.prototype.exit = function() {
		this._promise = this._promise.then(() => {
			this._p13nEngine.detachStateChange(this._onTableStateChange);
			this._p13nEngine.deregister(this._table);
			this._p13nEngine = null;

			this._metadataHelper.destroy();
			this._metadataHelper = null;

			this._model.destroy();
			this._model = null;

			this._elementTypeModel.destroy();
			this._elementTypeModel = null;

			this._filterSummaryModel.destroy();
			this._filterSummaryModel = null;

			Control.prototype.exit?.apply(this);
		});
	};

	ElementsPanel.prototype._updateMessage = function(filtering) {
		const hasData = this._table.getItems().length > 0;
		const control = filtering === true ? this._table : this._page;

		control.setVisible(hasData);

		this._message.setVisible(!hasData);
		this._message.setIllustrationType(filtering === true ? IllustratedMessageType.NoFilterResults : sap.m.IllustratedMessageType.NoData);
	};

	ElementsPanel.prototype._refresh = async function() {
		await this._promise;

		if (!this._scene || !this._manager) {
			// This method may be called indirectly from the exit method after _model is destroyed
			this._model?.setData([]);
			this._updateMessage(false);
			return;
		}
		// scan the tree and collect elements info
		const elements = new Map();
		this._scanTree(elements, this._scene.getRootElement());
		const data = elements.values().toArray();
		this._model.setSizeLimit(data.length);
		this._model.setData(data);
		this._table.setModel(this._model);

		this._updateMessage(false);
		this.fireContentChanged();
	};

	ElementsPanel.prototype._registerForP13n = function() {
		this._metadataHelper = new MetadataHelper([
			{
				groupable: false,
				key: ColumnName.RefDes,
				path: ColumnName.RefDes,
				label: getResourceBundle().getText("ELEMENTS_PANEL_NAME_COLUMN")
			},
			{
				key: ColumnName.Type,
				path: ColumnName.Type,
				label: getResourceBundle().getText("ELEMENTS_PANEL_TYPE_COLUMN")
			},
			{
				key: ColumnName.Device,
				path: ColumnName.Device,
				label: getResourceBundle().getText("ELEMENTS_PANEL_DEVICE_REFERENCE_COLUMN")
			},
			{
				sortable: false,
				groupable: false,
				key: ColumnName.Visibility,
				path: ColumnName.Visibility,
				label: getResourceBundle().getText("ELEMENTS_PANEL_VISIBLE_COLUMN")
			}
		]);

		this._p13nEngine.register(this._table, {
			helper: this._metadataHelper,
			controller: {
				columnStates: new SelectionController({
					control: this._table,
					targetAggregation: "columns",
					getKeyForItem
				}),
				columnWidthStates: new ColumnWidthController({
					control: this._table
				}),
				sortStates: new SortController({
					control: this._table
				}),
				groupStates: new GroupController({
					control: this._table
				})
			}
		});

		this._p13nEngine.attachStateChange(this._onTableStateChange.bind(this));

		// Set up default column visibility and sorting for the table.
		const state = {
			columnStates: this._metadataHelper.getProperties().map(({ key }) => ({ key })),
			sortStates: [{ key: ColumnName.RefDes, descending: false }]
		};

		this._p13nEngine.applyState(this._table, state);
	};

	ElementsPanel.prototype._onSettings = function() {
		this._p13nEngine.show(this._table, ["columnStates", "sortStates", "groupStates"], { source: this._table });
	};

	ElementsPanel.prototype._setScene = function(scene) {
		this._scene = scene?.isECADScene() ? scene : null;
		this._refresh();
	};

	ElementsPanel.prototype._addElement = function(elements, nodeRef, metadata) {
		const type = metadata.get("type");
		const refdes = metadata.get("refdes");
		const deviceref = metadata.get("deviceref");

		var element = elements.get(refdes);
		if (!element) {
			element = {
				refdes: refdes,
				type: type,
				deviceref: deviceref,
				parts: new Map(),
				hiddenParts: new Set()
			};
			elements.set(refdes, element);
		}

		switch (type) {
			case ElementType.Component:
				element.parts.set(nodeRef.uid, nodeRef);
				if (this._manager.getVisibilityState(nodeRef) === false) {
					element.hiddenParts.add(nodeRef.uid);
				}
				break;
			case ElementType.Net:
				nodeRef.children.forEach(child => {
					element.parts.set(child.uid, child);
					if (this._manager.getVisibilityState(child) === false) {
						element.hiddenParts.add(child.uid);
					}
				});
				break;
			default:
				break;
		}
	};

	ElementsPanel.prototype._scanTree = function(elements, nodeRef) {
		const metadata = extractMetadata(nodeRef);
		if (metadata) {
			const name = metadata.get("refdes");
			if (name) {
				this._addElement(elements, nodeRef, metadata);
				return; // don't go further down the hierarchy
			}
		}
		nodeRef.children.forEach(child => this._scanTree(elements, child));
	};

	ElementsPanel.prototype._onTableSelectionChanged = function(event) {
		const items = event.getParameter("listItems");
		const selected = event.getParameter("selected");
		const output = [];

		items.forEach(item => {
			const element = item.getBindingContext().getObject();
			switch (element.type) {
				case ElementType.Component:
					output.push(element.parts.values().toArray()[0]);
					break;
				case ElementType.Net:
					output.push(element.parts.values().toArray()[0].parent);
					break;
				default:
					break;
			}
		});

		this._manager.setSelectionState(output, selected, true, true);
		this._updateButtons();
	};

	ElementsPanel.prototype._onViewportSelectionChanged = function(event) {
		const items = this._table.getItems();
		const selected = event.getParameter("selected");
		const unselected = event.getParameter("unselected");

		const process = (list, item, select) => {
			const element = item.getBindingContext().getObject();

			list.forEach(nodeRef => {
				const metadata = extractMetadata(nodeRef);
				const refdes = metadata?.get("refdes");

				if (refdes === element.refdes) {
					this._table.setSelectedItem(item, select, false);
				}
			});
		};

		items.forEach(item => {
			process(selected, item, true);
			process(unselected, item, false);
		});

		this._updateButtons();
	};

	ElementsPanel.prototype._setContent = function(content) {
		// If there is no explicitly assigned view state manager then use the content connector's default one.
		if (content && !this.getViewStateManager()) {
			const connector = Element.getElementById(this.getContentConnector());
			if (connector) {
				const defaultManager = connector.getDefaultViewStateManager();
				if (defaultManager) {
					this.setViewStateManager(defaultManager);
				}
			}
		}
		this._setScene(content);
		return this;
	};

	ElementsPanel.prototype._onContentReplaced = function(event) {
		this._setContent(event.getParameter("newContent"));
	};

	ElementsPanel.prototype._updateButtons = function() {
		let canHide = false;
		let canShow = false;
		const selected = this._table.getSelectedItems();

		selected.forEach(item => {
			const element = item.getBindingContext().getObject();
			const visibility = getVisibility(element);

			if (visibility === VisibilityType.Visible) {
				canHide = true;
			} else if (visibility === VisibilityType.Hidden) {
				canShow = true;
			} else {
				canHide = canShow = true;
			}

		});

		this._showButton.setEnabled(canShow);
		this._hideButton.setEnabled(canHide);
	};

	ElementsPanel.prototype._onShowElements = function() {
		const toShow = [];
		const selected = this._table.getSelectedItems();

		selected.forEach(item => {
			const element = item.getBindingContext().getObject();

			if (element.hiddenParts.size > 0) {
				const ref = element.parts.values().toArray()[0];
				element.hiddenParts.clear();

				if (element.type === ElementType.Component) {
					toShow.push(ref);
				} else if (element.type === ElementType.Net) {
					toShow.push(ref.parent);
				}
			}
		});

		this._skipEvent = true;
		this._manager.setVisibilityState(toShow, true, true, true);
		this._model.updateBindings(true);
		this._updateButtons();
	};

	ElementsPanel.prototype._onHideElements = function() {
		const toHide = [];
		const selected = this._table.getSelectedItems();

		selected.forEach(item => {
			const element = item.getBindingContext().getObject();

			if (element.hiddenParts.size < element.parts.size) {
				const ref = element.parts.values().toArray()[0];
				element.parts.forEach(part => element.hiddenParts.add(part.uid));

				if (element.type === ElementType.Component) {
					toHide.push(ref);
				} else if (element.type === ElementType.Net) {
					toHide.push(ref.parent);
				}
			}
		});

		this._skipEvent = true;
		this._manager.setVisibilityState(toHide, false, true, true);
		this._model.updateBindings(true);
		this._updateButtons();
	};

	ElementsPanel.prototype._onVisibilityChanged = async function(event) {
		if (this._skipEvent) {
			this._skipEvent = false;
			return;
		}
		const hidden = event.getParameter("hidden");
		const visible = event.getParameter("visible");

		await this._promise;

		const process = (list, element, show) => {
			list.forEach(ref => {
				const metadata = extractMetadata(ref);
				const refdes = metadata?.get("refdes");

				if (refdes === element.refdes) {
					switch (metadata.get("type")) {
						case ElementType.Component:
							if (show) {
								element.hiddenParts.delete(ref.uid);
							} else {
								element.hiddenParts.add(ref.uid);
							}
							break;
						case ElementType.Net:
							if (show) {
								ref.children.forEach(child => element.hiddenParts.delete(child.uid));
							} else {
								ref.children.forEach(child => element.hiddenParts.add(child.uid));
							}
							break;
						default:
							break;
					}
				} else {
					const layer = metadata?.get("layer");
					if (layer) {
						if (element.parts.has(ref.uid)) {
							if (show) {
								element.hiddenParts.delete(ref.uid);
							} else {
								element.hiddenParts.add(ref.uid);
							}
						}
					}
				}
			});
		};

		this._model.getData().forEach(element => {
			process(hidden, element, false);
			process(visible, element, true);
		});

		this._model.updateBindings(true);
		this._updateButtons();
	};

	// Go button on the filter bar
	ElementsPanel.prototype._onSearch = function() {
		this._table.setShowOverlay(true);

		const filters = this._getFiltersWithValues().reduce((result, filterGroupItem) => {
			var control = filterGroupItem.getControl();
			const filterName = filterGroupItem.getName();
			var filters = [];

			switch (filterName) {
				case ColumnName.RefDes:
				case ColumnName.Device:
					const value = control.getValue();
					filters.push(new Filter({
						path: filterGroupItem.getName(),
						operator: FilterOperator.Contains,
						value1: value
					}));
					break;
				case ColumnName.Type:
					const selected = control.getSelectedKeys();
					selected.forEach(key => filters.push(new Filter({
						path: filterGroupItem.getName(),
						operator: FilterOperator.Contains,
						value1: key
					})));
					break;
				default:
					break;
			}

			if (filters.length > 0) {
				result.push(new Filter({
					filters: filters,
					and: false
				}));
			}
			return result;
		}, []);

		this._table.getBinding("items").filter(filters);
		this._table.setShowOverlay(false);

		this._updateMessage(true);
	};

	ElementsPanel.prototype._onFilterChange = function() {
		this._table.setShowOverlay(true);
	};

	ElementsPanel.prototype._onAssignedFiltersChanged = function() {
		this._filterSummaryModel.setProperty("/snappedFilterSummary", this._filterBar.retrieveFiltersWithValuesAsText());
		this._filterSummaryModel.setProperty("/expandedFilterSummary", this._filterBar.retrieveFiltersWithValuesAsTextExpanded());
	};

	// Returns the filter items with non-empty values from the filter bar.
	ElementsPanel.prototype._getFiltersWithValues = function() {
		return this._filterBar
			.getFilterGroupItems()
			.filter(filterGroupItem => {
				const control = filterGroupItem.getControl();

				if (control instanceof MultiComboBox) {
					return control.getSelectedItems().length > 0;
				} else if (control instanceof Input) {
					return control.getValue().length > 0;
				} else {
					return false;
				}
			});
	};

	// Currently there is no way to programmatically update
	// text next to Go button, it's a FilterBar bug,
	// so check for private function and call it
	ElementsPanel.prototype._updateFilterBarToolbarText = function() {
		this._filterBar._updateToolbarText?.();
	};

	ElementsPanel.prototype._onBeforeOpenColumnMenu = function(event) {
		const menu = event.getSource();
		const column = event.getParameter("openBy");
		const quickActions = menu.getQuickActions();

		// Handle sorting
		const sortQuickAction = quickActions.find(quickAction => quickAction instanceof QuickSort);
		if (sortQuickAction != null) {
			const sortItem = sortQuickAction.getItems()[0];
			sortItem.setKey(getKeyForItem(column));
			sortItem.setLabel(column.getHeader().getText(false));
			sortItem.setSortOrder(column.getSortIndicator());
		}

		// Handle grouping, if available - not all columns are groupable
		const groupQuickAction = quickActions.find(quickAction => quickAction instanceof QuickGroup);
		if (groupQuickAction != null) {
			const groupItem = groupQuickAction.getItems()[0];
			groupItem.setKey(getKeyForItem(column));
			groupItem.setLabel(column.getHeader().getText(false));
			groupItem.setGrouped(column.data("grouped"));
		}
	};

	ElementsPanel.prototype._onColumnResize = function(event) {
	};

	ElementsPanel.prototype._onSort = function(event) {
		this._p13nEngine.retrieveState(this._table).then(state => {
			const sortStates = state.sortStates;

			for (const state of sortStates) {
				state.sorted = false;
			}

			const item = event.getParameter("item");
			const key = item.getKey();
			const sortOrder = item.getSortOrder();

			if (sortOrder !== SortOrder.None) {
				sortStates.push({ key, descending: sortOrder === SortOrder.Descending });
			}

			this._p13nEngine.applyState(this._table, state);
		});
	};

	ElementsPanel.prototype._onGroup = function(event) {
		this._p13nEngine.retrieveState(this._table).then(state => {
			const groupStates = state.groupStates;

			for (const state of groupStates) {
				state.grouped = false;
			}

			const groupItem = event.getParameter("item");
			const key = groupItem.getKey();

			if (groupItem.getGrouped()) {
				groupStates.push({ key });
			}

			this._p13nEngine.applyState(this._table, state);
		});
	};

	ElementsPanel.prototype._onTableStateChange = function(event) {
		if (event.getParameter("control") !== this._table) {
			return;
		}
		const state = event.getParameter("state");
		// NOTE: There is a bug in UI5 1.120 - this event should not be fired with `null` state.
		// TODO(fix): Remove this check once the bug is fixed in later versions of UI5.
		if (state == null) {
			return;
		}

		const info = this._table.getBindingInfo("items");
		const bindingInfo = {
			path: info.path,
			model: info.model,
			factory: info.factory
		};

		const columns = this._table.getColumns();

		// Reset all columns to be invisible, unsorted and ungrouped
		for (const column of columns) {
			column.setVisible(false);
			column.setSortIndicator(SortOrder.None);
			column.data("grouped", false);

			const width = state.columnWidthStates[getKeyForItem(column)];

			if (width !== undefined) {
				column.setWidth();
			}
		}

		const cellTemplates = this._rowTemplate.getCells();

		// Make column visible and in right order
		state.columnStates.forEach((columnState, index) => {
			const column = findItemByKey(this._table.getColumns(), columnState.key);
			column.setVisible(true);

			this._table.removeColumn(column);
			this._table.insertColumn(column, index);

			const template = findItemByKey(cellTemplates, columnState.key);

			this._rowTemplate.removeCell(template);
			this._rowTemplate.insertCell(template, index);
		});

		// Create sorters
		//
		// If there is a column used for grouping, we need to create a sorter for it as well and that
		// sorter must be the first in the list of sorters. The column used for grouping can also be one
		// of the columns used for sorting but it is not mandatory. Only one column can be used for grouping
		bindingInfo.sorter = [];

		if (state.groupStates.length === 1) {
			const key = state.groupStates[0].key;
			const path = this._metadataHelper.getProperty(key).path;

			// If this column is also used for sorting, we need to take its sorting order from the corresponding item in state.sortStates
			const sortState = state.sortStates.find(sortState => sortState.key === key);
			const descending = sortState?.descending ?? false;

			const getGroupHeader = context => {
				switch (path) {
					case ColumnName.Type:
						return formatElementType(context.getObject());
					default:
						return context.getProperty(path);
				}
			};

			bindingInfo.sorter.push(new Sorter(path, descending, getGroupHeader));

			const column = findItemByKey(columns, key);
			column.data("grouped", true);
		}

		for (let sortState of state.sortStates) {
			const column = findItemByKey(columns, sortState.key);
			column.setSortIndicator(sortState.descending ? SortOrder.Descending : SortOrder.Ascending);

			if (state.groupStates[0]?.key === sortState.key) {
				continue;
			}

			const path = this._metadataHelper.getProperty(sortState.key).path;
			bindingInfo.sorter.push(new Sorter(path, sortState.descending));
		}

		// Apply new binding info to the table
		this._table.bindItems(bindingInfo);
	};

	return ElementsPanel;
});

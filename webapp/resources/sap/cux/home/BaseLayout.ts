/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import { Event } from "jquery";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Log from "sap/base/Log";
import deepEqual from "sap/base/util/deepEqual";
import Bar from "sap/m/Bar";
import Button from "sap/m/Button";
import FlexBox from "sap/m/FlexBox";
import { PageBackgroundDesign } from "sap/m/library";
import Page from "sap/m/Page";
import UI5Event from "sap/ui/base/Event";
import Control from "sap/ui/core/Control";
import UI5Element, { MetadataOptions } from "sap/ui/core/Element";
import Lib from "sap/ui/core/Lib";
import HashChanger from "sap/ui/core/routing/HashChanger";
import S4MyHome from "sap/ushell/api/S4MyHome";
import BaseContainer from "./BaseContainer";
import { $BaseLayoutSettings } from "./BaseLayout";
import BaseLayoutRenderer from "./BaseLayoutRenderer";
import BasePanel from "./BasePanel";
import BaseSettingsDialog from "./BaseSettingsDialog";
import BaseSettingsPanel from "./BaseSettingsPanel";
import ContentAdditionDialog from "./ContentAdditionDialog";
import { OrientationType } from "./library";
import MenuItem from "./MenuItem";
import { DeviceType, calculateDeviceType } from "./utils/Device";

interface FullScreenElementConfig {
	key?: string;
	index: number;
	fullScreenName?: string;
	sourceElements: Set<BaseContainer | BasePanel>;
	targetContainer: BaseContainer;
}

/**
 *
 * Abstract base class for My Home layout.
 *
 * @extends Page
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.121
 *
 * @abstract
 * @private
 * @ui5-restricted ux.eng.s4producthomes1
 *
 * @alias sap.cux.home.BaseLayout
 */
export default abstract class BaseLayout extends Page {
	protected _i18nBundle!: ResourceBundle;
	private _settingsPanels!: BaseSettingsPanel[];
	private _domSnapshot!: Node;
	private _sourceElementClone!: Node | Element;
	private _scrollPosition!: number;
	private _fullScreenContainer!: Page;
	private _slideDurationInSeconds!: number;
	private _layoutLoaded!: boolean;
	private _hashChanger!: HashChanger;
	private _currentExpandedElement!: FullScreenElementConfig | undefined;
	private _previousExpandedElement!: FullScreenElementConfig | undefined;
	private _elementConfigs!: Map<string, FullScreenElementConfig>;
	private _attachRouteMatched!: boolean;

	constructor(id?: string | $BaseLayoutSettings);
	constructor(id?: string, settings?: $BaseLayoutSettings);
	/**
	 * Constructor for a new Base Layout.
	 *
	 * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new control
	 */
	public constructor(id?: string, settings?: $BaseLayoutSettings) {
		super(id, settings);
	}

	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		properties: {
			/**
			 * Indicates whether home settings are enabled for this control.
			 */
			enableSettings: { type: "boolean", group: "Misc", visibility: "hidden" },
			/**
			 * Indicates whether full screen is enabled for this control.
			 */
			enableFullScreen: { type: "boolean", group: "Misc", visibility: "hidden" },
			/**
			 * Indicates whether the layout is expanded.
			 */
			expanded: { type: "boolean", group: "Misc", defaultValue: false, visibility: "hidden" },
			/**
			 * Indicates whether the settings dialog state is persisted for this control.
			 */
			settingsDialogPersisted: { type: "boolean", group: "Misc", defaultValue: false, visibility: "hidden" },
			/**
			 * Indicates whether the content addition dialog state is persisted for this control.
			 */
			contentAdditionDialogPersisted: { type: "boolean", group: "Misc", defaultValue: false, visibility: "hidden" },
			/**
			 * Whether the layout shall have a header.
			 */
			showHeader: { type: "boolean", group: "Appearance", defaultValue: true, visibility: "hidden" },
			/**
			 * Whether this layout shall have a footer.
			 */
			showFooter: { type: "boolean", group: "Appearance", defaultValue: false, visibility: "hidden" },
			/**
			 * Whether the layout is currently in busy state.
			 */
			busy: { type: "boolean", defaultValue: false, visibility: "hidden" },
			/**
			 * This property is used to set the background color of a page.
			 */
			backgroundDesign: {
				type: "sap.m.PageBackgroundDesign",
				group: "Appearance",
				defaultValue: PageBackgroundDesign.Transparent,
				visibility: "hidden"
			},
			/**
			 * Container ID for Ushell Personalisation.
			 * This property holds the ID of the personalization container.
			 * It is used to store and retrieve personalized settings for the control.
			 *
			 * @type {string}
			 * @public
			 */
			persContainerId: { type: "string", defaultValue: "", visibility: "public" }
		},
		defaultAggregation: "items",
		aggregations: {
			/**
			 * The items aggregation which should be of type BaseContainer
			 */
			items: { type: "sap.cux.home.BaseContainer", singularName: "item", multiple: true },
			/**
			 * The settings dialog aggregation which controls settings for my home controls.
			 * It should be of type BaseSettingsDialog.
			 * If Not provided, a default settings dialog will be created from sap.cux.home.SettingsDialog.
			 * In case of only custom settings panels, the settings dialog should be created and set manually from sap.cux.home.SettingsDialog.
			 */
			settingsDialog: {
				type: "sap.cux.home.BaseSettingsDialog",
				singularName: "settingsDialog",
				multiple: false
			},
			/**
			 * The Key User Settings dialog aggregation which controls key user settings for my home.
			 * It should be of type BaseSettingsDialog.
			 * If Not provided, a default settings dialog will be created from sap.cux.home.KeyUserSettingsDialog.
			 * In case of only custom settings panels, the settings dialog should be created and set manually from sap.cux.home.KeyUserSettingsDialog.
			 */
			keyUserSettingsDialog: {
				type: "sap.cux.home.BaseSettingsDialog",
				singularName: "keyUserSettingsDialog",
				multiple: false
			},
			/**
			 * The content addition dialog aggregation which controls content addition for MyHome.
			 */
			contentAdditionDialog: {
				type: "sap.cux.home.BaseSettingsDialog",
				singularName: "contentAdditionDialog",
				multiple: false,
				visibility: "hidden"
			},
			/**
			 * The full screen container to display registered full-screen elements
			 */
			fullScreenContainer: { type: "sap.m.Page", singularName: "fullScreenContainer", multiple: false, visibility: "hidden" }
		},
		events: {
			/**
			 * Event is fired after the layout is collapsed.
			 */
			onCollapse: {}
		}
	};

	static renderer: typeof BaseLayoutRenderer = BaseLayoutRenderer;

	/**
	 * Init lifecycle method
	 *
	 * @private
	 * @override
	 */
	public init(): void {
		super.init();
		this._settingsPanels = [];
		this._elementConfigs = new Map();
		this._i18nBundle = Lib.getResourceBundleFor("sap.cux.home.i18n") as ResourceBundle;

		//setup full-screen container
		this._slideDurationInSeconds = 1;
		this._fullScreenContainer = new Page(`${this.getId()}-fullScreen-container`, {
			backgroundDesign: "Transparent",
			showHeader: false
		});
		this.setAggregation("fullScreenContainer", this._fullScreenContainer);
	}

	/**
	 * onBeforeRendering lifecycle method
	 *
	 * @private
	 * @override
	 */
	public onBeforeRendering(event: Event): void {
		super.onBeforeRendering(event);

		this._toggleHeaderVisibility();

		//open persisted dialogs, if any
		if (!this._attachRouteMatched) {
			S4MyHome.attachRouteMatched({}, this.openPersistedDialogs.bind(this));
			this._attachRouteMatched = true;
		}

		//update full-screen slide animation duration, if enabled
		if (this.getProperty("enableFullScreen")) {
			document.body.style.setProperty("--sapUiSlideDuration", `${this._slideDurationInSeconds}s`);
		}
	}

	/**
	 * Opens persisted dialogs (settings or content addition) if their persisted properties are set.
	 *
	 * @private
	 * @param {UI5Event<{ isMyHomeRoute: boolean }>} event - The route matched event containing route info.
	 */
	private openPersistedDialogs(event: UI5Event<{ isMyHomeRoute: boolean }>) {
		if (event.getParameter("isMyHomeRoute")) {
			//open settings dialog if persisted
			if (this.getProperty("settingsDialogPersisted")) {
				const selectedKey = (this.getAggregation("settingsDialog") as BaseSettingsDialog)?.getProperty("selectedKey") as string;
				this.openSettingsDialog(selectedKey);

				//reset property
				this.setProperty("settingsDialogPersisted", false, true);
			}

			//open content addition dialog if persisted
			if (this.getProperty("contentAdditionDialogPersisted")) {
				const selectedKey = (this.getAggregation("contentAdditionDialog") as BaseSettingsDialog)?.getProperty(
					"selectedKey"
				) as string;
				this.openContentAdditionDialog(selectedKey);

				//reset property
				this.setProperty("contentAdditionDialogPersisted", false, true);
			}
		}
	}

	/**
	 * Toggles the visibility of the header based on the presence of a custom header or header content.
	 * @private
	 */
	private _toggleHeaderVisibility(): void {
		const customHeader = this.getCustomHeader() as Bar;
		const showHeader = customHeader?.getVisible() || this.getHeaderContent().length > 0;
		this.setProperty("showHeader", showHeader, true);
	}

	/**
	 * onAfterRendering lifecycle method.
	 *
	 * @private
	 */
	public onAfterRendering(): void {
		//expand element on load if expanded through URL param
		if (this.getProperty("enableFullScreen")) {
			if (!this._layoutLoaded) {
				this._layoutLoaded = true;
				setTimeout(() => {
					this._hashChanger = new HashChanger();
					this._loadFullScreenFromHash(this._hashChanger.getHash() || "");
					const [appIntent] = this._hashChanger.getHash().split("?");

					//attach hash change event for toggling full screen
					window.addEventListener?.("hashchange", () => {
						const currentHash = window.location.hash.substring(1);
						//toggle full screen only if hash is changed from within the app
						if (currentHash.includes?.(appIntent)) {
							this._loadFullScreenFromHash(currentHash, true);
						}
					});
				});
			}
		}
	}

	/**
	 * Retrieves the content of the BaseLayout.
	 * Overridden to return the items aggregation during inner page rendering.
	 *
	 * @private
	 * @override
	 * @returns An array of Control objects representing the content.
	 */
	public getContent(): Control[] {
		return this.getItems();
	}

	/**
	 * Extracts URL search parameters from a given hash string.
	 *
	 * @private
	 * @param {string} hash - The hash string containing the URL parameters.
	 * @returns {URLSearchParams} An instance of URLSearchParams containing the parsed parameters.
	 */
	private _getURLParams(hash: string): URLSearchParams {
		const queryString = hash?.includes("?") ? hash.substring(hash.indexOf("?") + 1) : "";
		return new URLSearchParams(queryString);
	}

	/**
	 * Loads full screen mode from URL hash if enabled.
	 *
	 * @private
	 * @param {string} hash - The URL hash string.
	 * @param {boolean} [hashChanged=false] - Indicates if the hash has changed.
	 */
	private _loadFullScreenFromHash(hash: string, hashChanged: boolean = false): void {
		const enableFullScreen = this.getProperty("enableFullScreen") as boolean;
		const URLParams = this._getURLParams(hash);
		const expandedElementName = URLParams.get("expanded") || "";
		const expandedElement = this._elementConfigs.get(expandedElementName);
		const isTargetContainerVisible = expandedElement?.targetContainer.getVisible() || false;
		const isPhone = calculateDeviceType() === DeviceType.Mobile;

		if (enableFullScreen && expandedElement && !isPhone && isTargetContainerVisible) {
			if (this._currentExpandedElement && this._currentExpandedElement.fullScreenName !== expandedElementName) {
				//expand element and prevent slide if hash element is found and another element is currently expanded
				this._toggleFullScreenForElement(expandedElement, hashChanged);
			} else if (!this._currentExpandedElement) {
				//expand element if hash element is found and no element is currently expanded
				this._toggleFullScreenForElement(expandedElement);
			} else if (URLParams.has("expanded")) {
				//retain the slide transition in case of hash switch
				document.getElementById(`${this.getId()}-layout-container`)?.classList.add("slide");
			}
		} else {
			if (this._currentExpandedElement) {
				//collapse expanded element if hash element not found
				this._toggleFullScreenForElement(this._currentExpandedElement);
			} else {
				//reset hash if no expanded element found
				if (URLParams.has("expanded")) {
					const updatedHash = this._removeURLParam(hash, "expanded");
					this._hashChanger?.replaceHash(updatedHash, "Backwards");
				}
			}
		}
	}

	/**
	 * Toggles full screen mode for the specified element.
	 *
	 * @private
	 * @param {FullScreenElementConfig} expandedElement - The configuration of the element to be expanded.
	 * @param {boolean} [hashChanged=false] - Indicates if the hash has changed, affecting the toggle behavior.
	 */
	private _toggleFullScreenForElement(expandedElement: FullScreenElementConfig, hashChanged: boolean = false): void {
		setTimeout(() => this.toggleFullScreen(expandedElement.sourceElements.values().next().value!, hashChanged));
	}

	/**
	 * Opens the settings dialog and navigate to the panel
	 * specified by the selected key.
	 *
	 * @private
	 * @param {string} selectedKey The key of the panel to navigate to
	 */
	public openSettingsDialog(selectedKey: string = "", context: object = {}): void {
		const settingsDialog = this.getAggregation("settingsDialog") as BaseSettingsDialog;
		settingsDialog?.setProperty("selectedKey", selectedKey);
		settingsDialog?.setProperty("context", context);
		settingsDialog?.open();
	}

	/**
	 * Opens the content addition dialog and opens the selected panel.
	 *
	 * @param {string} [selectedKey=""] - The key to be set for the content addition dialog. Defaults to an empty string.
	 */
	public openContentAdditionDialog(selectedKey: string = ""): void {
		const contentAdditionDialog = this.getAggregation("contentAdditionDialog") as ContentAdditionDialog;
		contentAdditionDialog?.setProperty("selectedKey", selectedKey);
		contentAdditionDialog?.open();
	}

	/**
	 * Sets SettingsDialog aggregation.
	 * Overridden to update cached settings panels.
	 *
	 * @public
	 * @override
	 * @returns {BaseSettingsDialog} the dialog for chaining
	 */
	public setSettingsDialog(settingsDialog: BaseSettingsDialog): this {
		const enableSettings = this.getProperty("enableSettings") as boolean;
		if (enableSettings) {
			const settingsPanels = settingsDialog?.getPanels();
			settingsPanels?.forEach((settingsPanel: BaseSettingsPanel) => {
				this._addSettingsPanel(settingsPanel);
			});
		}
		this.setAggregation("settingsDialog", settingsDialog);
		return this;
	}

	/**
	 * Adds a settings panel to the list of settings panels associated
	 * with the layout's settings dialog.
	 *
	 * @param {BaseSettingsPanel} settingsPanel - The settings panel to be added.
	 * @private
	 */
	public _addSettingsPanel(settingsPanel: BaseSettingsPanel | BaseSettingsPanel[] | undefined, override?: boolean): void {
		if (settingsPanel) {
			if (override) {
				this._settingsPanels = settingsPanel as BaseSettingsPanel[];
			} else {
				this._settingsPanels.push(settingsPanel as BaseSettingsPanel);
			}
		}
	}

	/**
	 * Adds a settings panel to the list of settings panels associated
	 * with the layout's settings dialog.
	 *
	 * @param {BaseSettingsPanel} settingsPanel - The settings panel to be added.
	 * @private
	 */
	public _getSettingsPanels(): BaseSettingsPanel[] {
		return this._settingsPanels;
	}

	/**
	 * Extracts the configuration necessary for handling full-screen functionality of an element.
	 *
	 * @private
	 * @param {BaseContainer | BasePanel} element - The element for which to extract the full-screen configuration.
	 * @returns {FullScreenElementConfig} Full screen element configuration.
	 */
	private _extractElementConfig(element: BaseContainer | BasePanel): FullScreenElementConfig {
		const sourceElement = element;
		const isPanelElement = sourceElement instanceof BasePanel;
		const targetContainer = isPanelElement ? (sourceElement.getParent() as BaseContainer) : sourceElement;
		const isPanelInSideBySideLayout = isPanelElement && targetContainer.getProperty("orientation") === OrientationType.SideBySide;
		const fullScreenName = (isPanelInSideBySideLayout ? targetContainer : sourceElement).getProperty("fullScreenName") as string;
		const sourceElements = new Set<BaseContainer | BasePanel>().add(sourceElement);

		return {
			fullScreenName,
			sourceElements,
			targetContainer,
			index: this.indexOfItem(targetContainer),
			key: isPanelElement ? sourceElement.getKey() : ""
		};
	}

	/**
	 * Configures an element for full-screen functionality by extracting and storing its configuration.
	 * Only stores the configuration if a full-screen name is provided and layout is not currently expanded.
	 *
	 * @private
	 * @param {BaseContainer | BasePanel} element - The element to configure for full-screen.
	 */
	public registerFullScreenElement(element: BaseContainer | BasePanel): void {
		const elementConfig = this._extractElementConfig(element);
		const { fullScreenName } = elementConfig;

		if (fullScreenName && !this.getProperty("expanded")) {
			if (this._elementConfigs.get(fullScreenName)) {
				const sourceElements = (
					this._elementConfigs.get(fullScreenName)?.sourceElements || new Set<BaseContainer | BasePanel>()
				).add(element);
				this._elementConfigs.set(fullScreenName, { ...elementConfig, sourceElements } as FullScreenElementConfig);
			} else {
				this._elementConfigs.set(fullScreenName, elementConfig);
			}
		}
	}

	/**
	 * Removes an element's full-screen configuration based on its full-screen name.
	 * Only removes the configuration if a full-screen name is provided and layout is not currently expanded.
	 *
	 * @private
	 * @param {BaseContainer | BasePanel} element - The element to remove from full-screen configuration.
	 */
	public deregisterFullScreenElement(element: BaseContainer | BasePanel): void {
		const { fullScreenName } = this._extractElementConfig(element);
		if (fullScreenName && !this.getProperty("expanded")) {
			this._elementConfigs.delete(fullScreenName);
		}
	}

	/**
	 * Updates the full screen configuration for the specified element.
	 *
	 * @private
	 * @param {BaseContainer | BasePanel} element - The element for which the full screen configuration is to be updated.
	 * @param {Partial<FullScreenElementConfig>} [updatedConfig] - An optional partial configuration to update the element's full screen configuration.
	 *
	 * @returns {void}
	 */
	public updateFullScreenElement(element: BaseContainer | BasePanel, updatedConfig?: Partial<FullScreenElementConfig>): void {
		const elementConfig = this._extractElementConfig(element);
		const { fullScreenName } = elementConfig;

		if (fullScreenName && !this.getProperty("expanded")) {
			const newConfiguration = { ...this._elementConfigs.get(fullScreenName), ...updatedConfig } as FullScreenElementConfig;
			this._elementConfigs.set(fullScreenName, newConfiguration);
		}
	}

	/**
	 * Adds or updates a URL parameter in the given hash string.
	 *
	 * @private
	 * @param {string} hash - The original hash string.
	 * @param {string} key - The parameter key to add or update.
	 * @param {string} value - The value for the parameter.
	 * @returns {string} The updated hash string with the new or updated parameter.
	 */
	private _addURLParam(hash: string, key: string, value: string): string {
		const URLParams = this._getURLParams(hash);
		URLParams.set(key, value);
		return `${hash.split("?")[0]}?${URLParams.toString()}`;
	}

	/**
	 * Removes a specified parameter from the URL hash string.
	 *
	 * @private
	 * @param {string} hash - The original hash string.
	 * @param {string} key - The parameter key to remove.
	 * @returns {string} The updated hash string without the specified parameter.
	 */
	private _removeURLParam(hash: string, key: string): string {
		const URLParams = this._getURLParams(hash);
		URLParams.delete(key);
		return URLParams.toString() ? `${hash.split("?")[0]}?${URLParams.toString()}` : hash.split("?")[0];
	}

	/**
	 * Toggles the full-screen state of a given element, handling layout adjustments, visibility, and scroll position.
	 *
	 * @private
	 * @param {BaseContainer | BasePanel} element - The element to toggle full-screen state for.
	 * @param {boolean} [hashChanged=false] - Indicates if the hash has changed.
	 */
	public toggleFullScreen(element: BaseContainer | BasePanel, hashChanged: boolean = false): void {
		const isPanelInSideBySideLayout =
			element instanceof BasePanel && element.getParent()?.getProperty("orientation") === OrientationType.SideBySide;
		const fullScreenName = (isPanelInSideBySideLayout ? element.getParent() : element)?.getProperty("fullScreenName") as string;
		const elementConfig = this._elementConfigs.get(fullScreenName);
		const allowToggle = hashChanged || this._checkToggleRequirements(elementConfig as FullScreenElementConfig);

		if (elementConfig && allowToggle) {
			const { targetContainer } = elementConfig;
			const currentHash = this._hashChanger?.getHash() || "";
			const panelIndex = targetContainer.indexOfAggregation("content", element);
			const isContainerInSideBySideLayout = targetContainer.getProperty("orientation") === OrientationType.SideBySide;
			let expanded = this.getProperty("expanded") as boolean;
			// detach resize handler
			targetContainer._detachResizeHandler();
			if (!hashChanged) {
				//update expanded state
				this.setProperty("expanded", !this.getProperty("expanded"), true);
				expanded = this.getProperty("expanded") as boolean;

				//place cloned element in full screen container
				this._placeClonedElement(targetContainer, expanded, panelIndex);

				//perform slide transition
				document.getElementById(`${this.getId()}-layout-container`)?.classList.toggle("slide", expanded);
			}

			//toggle full-screen button text for the element
			this._toggleFullScreenButtonText(element, expanded);

			// store the current and previous expanded element
			if (expanded) {
				this._previousExpandedElement = this._currentExpandedElement;
				this._currentExpandedElement = elementConfig;
			} else {
				delete this._currentExpandedElement;
			}

			//add or remove actual element at the end of slide transition
			setTimeout(
				() => {
					if (expanded) {
						// in case of horizontal or vertical layout, set expanded element's key as selected key
						if (!isContainerInSideBySideLayout) {
							targetContainer.setProperty("selectedKey", element.getProperty("key"));
						}

						//adjust currently expanded element if present
						const isTargetContainerDifferent = !deepEqual(this._previousExpandedElement?.targetContainer, targetContainer);
						this._adjustPreviousExpandedElementIfRequired(isTargetContainerDifferent);

						this._modifyContainer(targetContainer, panelIndex);

						//adjust hash
						this._currentExpandedElement = elementConfig;
						const updatedHash = this._addURLParam(currentHash, "expanded", fullScreenName);
						this._hashChanger?.setHash(updatedHash);

						this._focusFullScreenButton(element);

						//fire onExpand event
						element.fireEvent("onExpand");
					} else {
						//delete stored dom snapshot
						(this._domSnapshot as Element)?.remove();

						this.insertItem(targetContainer, elementConfig.index);

						//show all other panels in the container, if not in side-by-side layout
						if (!isContainerInSideBySideLayout) {
							this._toggleInnerPanelVisibility(targetContainer, true);
						}

						//adjust hash
						delete this._currentExpandedElement;
						const updatedHash = this._removeURLParam(currentHash, "expanded");
						this._hashChanger?.setHash(updatedHash);

						//reset scroll position on collapse
						this._resetScrollPosition(element);

						//fire onCollapse event
						this.fireEvent("onCollapse");
					}
					// attach resize handler
					targetContainer._attachResizeHandler();
				},
				hashChanged ? 0 : this._slideDurationInSeconds * 1000
			);
		} else {
			Log.warning(`Element with ID: ${element?.getId()} not registered for full screen`);
		}
	}

	/**
	 * Place actual element in the full screen container and hide all other panels in the container, if not in side-by-side layout
	 *
	 * @private
	 * @param {BaseContainer} targetContainer - Container that is to be displayed in full-screen mode
	 * @param {number} panelIndex - Index of the panel to remain visible if not in side-by-side layout.
	 */
	private _modifyContainer(targetContainer: BaseContainer, panelIndex: number) {
		//adjust currently expanded element if present
		const isContainerInSideBySideLayout = targetContainer.getProperty("orientation") === OrientationType.SideBySide;
		const isTargetContainerDifferent = !deepEqual(this._previousExpandedElement?.targetContainer, targetContainer);
		if (!this._previousExpandedElement || isTargetContainerDifferent) {
			this._getFullScreenContainer().removeAllContent();
			(this._sourceElementClone as Element)?.remove();
			this._getFullScreenContainer().addContent(targetContainer as Control);
		}

		//hide all other panels in the container, if not in side-by-side layout
		if (!isContainerInSideBySideLayout) {
			this._toggleInnerPanelVisibility(targetContainer, false, panelIndex);
		}
	}

	/**
	 * Checks if the toggle requirements are met for the given element configuration.
	 *
	 * @private
	 * @param {FullScreenElementConfig} elementConfig - The configuration of the element to check.
	 * @returns {boolean} `true` if toggling is allowed, otherwise `false`.
	 */
	private _checkToggleRequirements(elementConfig: FullScreenElementConfig): boolean {
		const expanded = this.getProperty("expanded") as boolean;
		let allowToggle = true;

		if (expanded) {
			// if expanded, allow toggling only if the provided element and expanded element are the same
			const currentFullScreenName = elementConfig?.fullScreenName;
			allowToggle = this._currentExpandedElement?.fullScreenName === currentFullScreenName;
		}

		return allowToggle;
	}

	/**
	 * Adjusts the current expanded element if required based on the new target container.
	 *
	 * @private
	 * @param {boolean} isTargetContainerDifferent - Indicates whether the target container is different from the current expanded element's container.
	 */
	private _adjustPreviousExpandedElementIfRequired(isTargetContainerDifferent: boolean) {
		if (this._previousExpandedElement) {
			const firstSourceElement = this._previousExpandedElement.sourceElements.values().next().value!;

			//update full-screen button text for the current expanded element to collapsed state
			this._toggleFullScreenButtonText(firstSourceElement, false);

			if (isTargetContainerDifferent) {
				//if expanded through hash change, place the current expanded element back in the layout
				this.insertItem(this._previousExpandedElement.targetContainer, this._previousExpandedElement.index);

				//reset scroll position on expansion throuh hash change
				this._scrollPosition = 0;

				//show all other panels in the container, if not in side-by-side layout
				if (this._previousExpandedElement.targetContainer.getProperty("orientation") !== OrientationType.SideBySide) {
					this._toggleInnerPanelVisibility(this._previousExpandedElement.targetContainer, true);
				}
			}
		}
	}

	/**
	 * Resets the scroll position to that of the collapsed element in the original container.
	 *
	 * @private
	 * @param {BaseContainer | BasePanel} element - The element for which to reset the scroll position.
	 */
	private _resetScrollPosition(element: BaseContainer | BasePanel) {
		//reset scroll position
		setTimeout(() => {
			UI5Element.getElementById(`${element.getAssociation("fullScreenButton", null) as string}-btn`)?.focus();
			const sectionRef = this._getSectionRef(this);
			if (sectionRef !== undefined) {
				sectionRef.scrollTop = this._scrollPosition;
			}
		});
	}

	/**
	 * Toggles visibility of inner panels, except one specified by index.
	 * Applicable only for panels not in SideSide layout.
	 *
	 * @private
	 * @param {BaseContainer} element - Container with inner panels.
	 * @param {boolean} visibility - Desired visibility state for panels.
	 * @param {number} [indexOfVisiblePanel] - Index of panel to exclude from toggle.
	 */
	private _toggleInnerPanelVisibility(element: BaseContainer, visibility: boolean, indexOfVisiblePanel?: number): void {
		element.getContent()?.forEach((panel, index) => {
			panel.setVisible(index === indexOfVisiblePanel ? !visibility : visibility);
		});
	}

	/**
	 * Updates the full-screen button text for a control (or all controls in a side-by-side layout) based on expanded state.
	 *
	 * @private
	 * @param {BaseContainer | BasePanel} control - The control to update or the parent of controls to update.
	 * @param {boolean} expanded - Indicates if the text should reflect an expanded or collapsed state.
	 */
	private _toggleFullScreenButtonText(control: BaseContainer | BasePanel, expanded: boolean): void {
		const isPanel = control instanceof BasePanel;
		const parentContainer = (isPanel ? control.getParent() : control) as BaseContainer;
		const isPanelInSideBySideLayout = isPanel && parentContainer.getProperty("orientation") === OrientationType.SideBySide;

		//update full-screen button text
		const updateText = (control: BaseContainer | BasePanel) => {
			const fullScreenButton = this._getFullScreenButton(control);
			fullScreenButton.setProperty("text", this._i18nBundle.getText(expanded ? "collapse" : "expand"), true);
			const fullScreenMenuItem = this._getFullScreenMenuItem(control);
			fullScreenMenuItem.setProperty("title", this._i18nBundle.getText(expanded ? "collapse" : "expand"), true);
		};

		if (isPanelInSideBySideLayout) {
			parentContainer.getContent()?.forEach(updateText);
		} else {
			updateText(control);
		}

		//update container header elements
		parentContainer._updateContainerHeader(isPanelInSideBySideLayout ? parentContainer : control);
	}

	/**
	 * Sets focus on the full-screen button associated with an element.
	 *
	 * @private
	 * @param {BaseContainer | BasePanel} element - The element whose full-screen button should be focused.
	 */
	private _focusFullScreenButton(element: BaseContainer | BasePanel): void {
		setTimeout(() => {
			UI5Element.getElementById(`${element.getAssociation("fullScreenButton", null) as string}-btn`)?.focus();
		});
	}

	/**
	 * Retrieves the full-screen button associated with a control.
	 *
	 * @private
	 * @param {BaseContainer | BasePanel} control - The control to find the full-screen button for.
	 * @returns {Button} The full-screen button associated with the control.
	 */
	private _getFullScreenButton(control: BaseContainer | BasePanel): Button {
		return UI5Element.getElementById(control.getAssociation("fullScreenButton", null) as string) as Button;
	}

	/**
	 * Retrieves the Full screen menu item associated with a control.
	 *
	 * @private
	 * @param {BaseContainer | BasePanel} control - The control to find the full-screen button for.
	 * @returns {MenuItem} The "Show More" menu item associated with the control.
	 */
	private _getFullScreenMenuItem(control: BaseContainer | BasePanel): MenuItem {
		return UI5Element.getElementById(control.getAssociation("fullScreenMenuItem", null) as string) as MenuItem;
	}

	/**
	 * Retrieves the full-screen container from the current aggregation.
	 *
	 * @private
	 * @returns {Page} The Page instance used as the full-screen container.
	 */
	public _getFullScreenContainer(): Page {
		return this.getAggregation("fullScreenContainer") as Page;
	}

	/**
	 * Gets the first child node of a control's DOM reference.
	 *
	 * @private
	 * @param {Control} element - The control to get the child node for.
	 * @returns {Node | Element} The first child node of the control's DOM reference.
	 */
	private _getSectionRef<T extends Node | Element = Element>(element: Control): T | undefined {
		const sectionIndex = this.getProperty("showHeader") && element !== this._getFullScreenContainer() ? 1 : 0;
		return element.getDomRef()?.childNodes[sectionIndex] as T;
	}

	/**
	 * Clones and places an element into a target container for full-screen transitions.
	 *
	 * @private
	 * @param {BaseContainer} targetElement - Element to clone or containing the element to clone.
	 * @param {boolean} expanded - True to expand (clone and place), false to collapse (restore from snapshot).
	 * @param {number} panelIndex - Index of the panel to clone if not in side-by-side layout.
	 */
	private _placeClonedElement(targetElement: BaseContainer, expanded: boolean, panelIndex: number) {
		//store scroll position and DOM snapshot
		this._scrollPosition = (expanded ? this._getSectionRef(this)?.scrollTop : this._scrollPosition) as number;

		//create a snapshot of the homepage in collapsed mode for use in transition back from full screen.
		//the dom ref had to be cloned twice following rendering issues in the Insights Tiles section.
		this._domSnapshot = (expanded ? this.getDomRef()?.cloneNode(true).cloneNode(true) : this._domSnapshot) as Node;

		const isSideBySideLayout = targetElement.getProperty("orientation") === OrientationType.SideBySide;
		const sourceElement = isSideBySideLayout
			? targetElement
			: (targetElement._getInnerControl() as FlexBox)?.getItems()[panelIndex] || targetElement;
		const sourceElementDomRef = sourceElement.getDomRef() || targetElement.getDomRef();
		this._sourceElementClone = expanded ? (sourceElementDomRef?.cloneNode(true) as Node) : this._sourceElementClone;
		const targetDomRef = expanded ? this._getSectionRef(this._getFullScreenContainer()) : this.getDomRef();
		if (targetDomRef) {
			setTimeout(() => {
				targetDomRef.innerHTML = "";
				targetDomRef.append(expanded ? this._sourceElementClone : this._domSnapshot);
			});
		}
	}

	/**
	 * Retrieves the name of the currently expanded element, if any.
	 *
	 * @private
	 * @returns {string | undefined} - The full screen name of the currently expanded element, if any.
	 */
	public _getCurrentExpandedElementName(): string | undefined {
		return this._getCurrentExpandedElement()?.fullScreenName;
	}

	/**
	 * Retrieves the currently expanded element config, if any
	 *
	 * @private
	 * @returns {FullScreenElementConfig | undefined} - The full screen name of the currently expanded element, if any.
	 */
	public _getCurrentExpandedElement(): FullScreenElementConfig | undefined {
		const isExpandInHash = this._getURLParams(this._hashChanger?.getHash() || "").has("expanded");
		if (isExpandInHash) {
			return this._currentExpandedElement;
		}
	}
}

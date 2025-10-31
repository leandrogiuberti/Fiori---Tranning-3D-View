/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff3610.horizon.ui","sap/sac/df/firefly/ff3350.cell.engine.ui","sap/sac/df/firefly/ff3450.contextmenu.engine.ui"
],
function(oFF)
{
"use strict";

oFF.MenuEnginePluginDebugExampleActionRegistrationHelper = function() {};
oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.prototype = new oFF.XObject();
oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.prototype._ff_c = "MenuEnginePluginDebugExampleActionRegistrationHelper";

oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_PRESENTATION = "Panel.Presentation";
oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_PRESENTATION_DESCRIPTION = "Panel.Presentation.Description";
oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_PRESENTATION_DESCRIPTION_AND_ID = "Panel.Presentation.DescriptionAndId";
oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_PRESENTATION_ID = "Panel.Presentation.Id";
oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_PRESENTATION_ID_AND_DESCRIPTION = "Panel.Presentation.IdAndDescription";
oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_PRESENTATION_TOGGLE_DESCRIPTION = "Panel.Presentation.Toggle.Description";
oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_PRESENTATION_TOGGLE_ID = "Panel.Presentation.Toggle.Id";
oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_SELECTION = "Panel.Selection";
oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_SELECTION_A = "Panel.Selection.A";
oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_SELECTION_B = "Panel.Selection.B";
oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_SELECTION_C = "Panel.Selection.C";
oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_VISIBILITY_TOGGLE = "Panel.Visibility.Toggle";
oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.create = function()
{
	let instance = new oFF.MenuEnginePluginDebugExampleActionRegistrationHelper();
	instance.m_multiActionWrapper = oFF.CMEMultiActionWrapper.create();
	return instance;
};
oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.prototype.m_multiActionWrapper = null;
oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.prototype.m_selectedOption = null;
oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.prototype.getWrapper = function()
{
	return this.m_multiActionWrapper;
};
oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.prototype.releaseObject = function()
{
	this.m_multiActionWrapper = oFF.XObjectExt.release(this.m_multiActionWrapper);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.prototype.resolveMyCustomCarrierObject = function(contextAccess)
{
	let subContext = contextAccess.getSingleSubContext("MenuEngineDebug.Example.*");
	return oFF.isNull(subContext) ? null : subContext.getCustomObject();
};
oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.prototype.setupActions = function(updateProcedure)
{
	let panelPresentationDescription = oFF.CMEFactory.createSelectionOption();
	panelPresentationDescription.setNameProvider((descriptionName) => {
		return oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_PRESENTATION_DESCRIPTION;
	});
	panelPresentationDescription.setTextProvider((descriptionText) => {
		return "Description";
	});
	this.m_multiActionWrapper.registerAction(oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_PRESENTATION_DESCRIPTION, panelPresentationDescription);
	let panelPresentationId = oFF.CMEFactory.createSelectionOption();
	panelPresentationId.setNameProvider((idName) => {
		return oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_PRESENTATION_ID;
	});
	panelPresentationId.setTextProvider((idText) => {
		return "Id";
	});
	this.m_multiActionWrapper.registerAction(oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_PRESENTATION_ID, panelPresentationId);
	let panelPresentationIdAndDescription = oFF.CMEFactory.createSelectionOption();
	panelPresentationIdAndDescription.setNameProvider((idAndDescriptionName) => {
		return oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_PRESENTATION_ID_AND_DESCRIPTION;
	});
	panelPresentationIdAndDescription.setTextProvider((idAndDescriptionText) => {
		return "Id and Description";
	});
	this.m_multiActionWrapper.registerAction(oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_PRESENTATION_ID_AND_DESCRIPTION, panelPresentationIdAndDescription);
	let panelPresentationDescriptionAndId = oFF.CMEFactory.createSelectionOption();
	panelPresentationDescriptionAndId.setNameProvider((descriptionAndIdName) => {
		return oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_PRESENTATION_DESCRIPTION_AND_ID;
	});
	panelPresentationDescriptionAndId.setTextProvider((descriptionAndIdText) => {
		return "Description and Id";
	});
	this.m_multiActionWrapper.registerAction(oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_PRESENTATION_DESCRIPTION_AND_ID, panelPresentationDescriptionAndId);
	let action = oFF.CMEFactory.createSingleSelectAction();
	action.setNameProvider((nameContext) => {
		return oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_PRESENTATION;
	});
	action.setTextProvider((textContext) => {
		return "Presentation Options";
	});
	action.setEnabledProvider((enabledContext) => {
		return true;
	});
	action.setOptionsRetriever((optionsContext) => {
		let options = oFF.XList.create();
		options.add(panelPresentationDescription);
		options.add(panelPresentationId);
		options.add(panelPresentationIdAndDescription);
		options.add(panelPresentationDescriptionAndId);
		return options;
	});
	action.setSelectionRetriever((selectionContext) => {
		return this.m_selectedOption;
	});
	action.setSelectionConsumer((consumerContext, selectionOption) => {
		this.m_selectedOption = selectionOption;
		updateProcedure();
	});
	this.m_multiActionWrapper.registerAction(oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_PRESENTATION, action);
	let toggleAction = oFF.CMEFactory.createToggleAction();
	toggleAction.setNameProvider((toggleIdName) => {
		return oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_PRESENTATION_TOGGLE_ID;
	});
	toggleAction.setTextProvider((toggleIdText) => {
		return "Id";
	});
	toggleAction.setProvider((toggleIdProviderContext) => {
		return this.m_selectedOption === panelPresentationId || this.m_selectedOption === panelPresentationIdAndDescription || this.m_selectedOption === panelPresentationDescriptionAndId;
	});
	toggleAction.setConsumer((toggleIdConsumerContext, toggleIdConsumerValue) => {
		if (toggleIdConsumerValue.getBoolean())
		{
			if (oFF.isNull(this.m_selectedOption) || this.m_selectedOption === panelPresentationId)
			{
				this.m_selectedOption = panelPresentationId;
			}
			else
			{
				this.m_selectedOption = panelPresentationIdAndDescription;
			}
		}
		else if (this.m_selectedOption === panelPresentationId || oFF.isNull(this.m_selectedOption))
		{
			this.m_selectedOption = null;
		}
		else
		{
			this.m_selectedOption = panelPresentationDescription;
		}
		updateProcedure();
	});
	this.m_multiActionWrapper.registerAction(oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_PRESENTATION_TOGGLE_ID, toggleAction);
	toggleAction = oFF.CMEFactory.createToggleAction();
	toggleAction.setNameProvider((toggleDescName) => {
		return oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_PRESENTATION_TOGGLE_DESCRIPTION;
	});
	toggleAction.setTextProvider((toggleDescText) => {
		return "Description";
	});
	toggleAction.setProvider((toggleDescProviderContext) => {
		return this.m_selectedOption === panelPresentationDescription || this.m_selectedOption === panelPresentationIdAndDescription || this.m_selectedOption === panelPresentationDescriptionAndId;
	});
	toggleAction.setConsumer((toggleDescConsumerContext, toggleDescConsumerValue) => {
		if (toggleDescConsumerValue.getBoolean())
		{
			if (oFF.isNull(this.m_selectedOption) || this.m_selectedOption === panelPresentationDescription)
			{
				this.m_selectedOption = panelPresentationDescription;
			}
			else
			{
				this.m_selectedOption = panelPresentationIdAndDescription;
			}
		}
		else if (this.m_selectedOption === panelPresentationDescription || oFF.isNull(this.m_selectedOption))
		{
			this.m_selectedOption = null;
		}
		else
		{
			this.m_selectedOption = panelPresentationId;
		}
		updateProcedure();
	});
	this.m_multiActionWrapper.registerAction(oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_PRESENTATION_TOGGLE_DESCRIPTION, toggleAction);
	toggleAction = oFF.CMEFactory.createToggleAction();
	toggleAction.setNameProvider((toggleVisibleName) => {
		return oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_VISIBILITY_TOGGLE;
	});
	toggleAction.setTextProvider((toggleVisibleText) => {
		return "Visible";
	});
	toggleAction.setAvailableProvider((toggleVisibleAvailableProviderContext) => {
		let avProviderCarrier = this.resolveMyCustomCarrierObject(toggleVisibleAvailableProviderContext);
		return oFF.notNull(avProviderCarrier);
	});
	toggleAction.setProvider((toggleVisibleProviderContext) => {
		let providerCarrier = this.resolveMyCustomCarrierObject(toggleVisibleProviderContext);
		return oFF.notNull(providerCarrier) && providerCarrier.isVisible();
	});
	toggleAction.setConsumer((toggleVisibleConsumerContext, toggleVisibleConsumerValue) => {
		let consumerCarrier = this.resolveMyCustomCarrierObject(toggleVisibleConsumerContext);
		if (oFF.notNull(consumerCarrier))
		{
			consumerCarrier.setVisible(toggleVisibleConsumerValue.getBoolean());
		}
		updateProcedure();
	});
	this.m_multiActionWrapper.registerAction(oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_VISIBILITY_TOGGLE, toggleAction);
	let selectOptionA = oFF.CMEFactory.createSelectionOption();
	selectOptionA.setNameProvider((selectAName) => {
		return oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_SELECTION_A;
	});
	selectOptionA.setTextProvider((selectAText) => {
		return "A";
	});
	selectOptionA.setCustomObject(oFF.XStringValue.create("A"));
	this.m_multiActionWrapper.registerAction(oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_SELECTION_A, selectOptionA);
	let selectOptionB = oFF.CMEFactory.createSelectionOption();
	selectOptionB.setNameProvider((selectBName) => {
		return oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_SELECTION_B;
	});
	selectOptionB.setTextProvider((selectBText) => {
		return "B";
	});
	selectOptionB.setCustomObject(oFF.XStringValue.create("B"));
	this.m_multiActionWrapper.registerAction(oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_SELECTION_B, selectOptionB);
	let selectOptionC = oFF.CMEFactory.createSelectionOption();
	selectOptionC.setNameProvider((selectCName) => {
		return oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_SELECTION_C;
	});
	selectOptionC.setTextProvider((selectCText) => {
		return "C";
	});
	selectOptionC.setCustomObject(oFF.XStringValue.create("C"));
	this.m_multiActionWrapper.registerAction(oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_SELECTION_C, selectOptionC);
	let selectOptions = oFF.XList.create();
	selectOptions.add(selectOptionA);
	selectOptions.add(selectOptionB);
	selectOptions.add(selectOptionC);
	action = oFF.CMEFactory.createSingleSelectAction();
	action.setNameProvider((selectName) => {
		return oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_SELECTION;
	});
	action.setTextProvider((selectText) => {
		return "Select Options";
	});
	action.setAvailableProvider((availableName) => {
		let avSelectProviderCarrier = this.resolveMyCustomCarrierObject(availableName);
		return oFF.notNull(avSelectProviderCarrier);
	});
	action.setOptionsRetriever((selectOptionsContext) => {
		return selectOptions;
	});
	let optionSelector = (str) => {
		return oFF.XStream.of(selectOptions).find((selOption) => {
			return oFF.XString.isEqual(str, selOption.getCustomObject().toString());
		}).orElse(null);
	};
	action.setSelectionRetriever((retrieverContext) => {
		let retrieverCarrier = this.resolveMyCustomCarrierObject(retrieverContext);
		return optionSelector(retrieverCarrier.getSelection());
	});
	action.setSelectionConsumer((selectionConsumerContext, selectionConsumerOption) => {
		let selectConsumerCarrier = this.resolveMyCustomCarrierObject(selectionConsumerContext);
		if (oFF.notNull(selectConsumerCarrier))
		{
			selectConsumerCarrier.setSelection(selectionConsumerOption.getCustomObject().toString());
		}
		updateProcedure();
	});
	this.m_multiActionWrapper.registerAction(oFF.MenuEnginePluginDebugExampleActionRegistrationHelper.PANEL_SELECTION, action);
};

oFF.MenuEnginePluginDebugExampleObject = function() {};
oFF.MenuEnginePluginDebugExampleObject.prototype = new oFF.XObject();
oFF.MenuEnginePluginDebugExampleObject.prototype._ff_c = "MenuEnginePluginDebugExampleObject";

oFF.MenuEnginePluginDebugExampleObject.create = function(name, text)
{
	let instance = new oFF.MenuEnginePluginDebugExampleObject();
	instance.m_name = name;
	instance.m_text = text;
	return instance;
};
oFF.MenuEnginePluginDebugExampleObject.prototype.m_name = null;
oFF.MenuEnginePluginDebugExampleObject.prototype.m_selection = null;
oFF.MenuEnginePluginDebugExampleObject.prototype.m_text = null;
oFF.MenuEnginePluginDebugExampleObject.prototype.m_visible = false;
oFF.MenuEnginePluginDebugExampleObject.prototype.getName = function()
{
	return this.m_name;
};
oFF.MenuEnginePluginDebugExampleObject.prototype.getSelection = function()
{
	return this.m_selection;
};
oFF.MenuEnginePluginDebugExampleObject.prototype.getText = function()
{
	return this.m_text;
};
oFF.MenuEnginePluginDebugExampleObject.prototype.isVisible = function()
{
	return this.m_visible;
};
oFF.MenuEnginePluginDebugExampleObject.prototype.setSelection = function(selection)
{
	this.m_selection = selection;
};
oFF.MenuEnginePluginDebugExampleObject.prototype.setVisible = function(visible)
{
	this.m_visible = visible;
};

oFF.HpLocalizationResolver = function() {};
oFF.HpLocalizationResolver.prototype = new oFF.XObject();
oFF.HpLocalizationResolver.prototype._ff_c = "HpLocalizationResolver";

oFF.HpLocalizationResolver.KEY_PREFIX = "i18n[";
oFF.HpLocalizationResolver.KEY_SUFFIX = "]";
oFF.HpLocalizationResolver.s_singletonInstance = null;
oFF.HpLocalizationResolver.getInstance = function()
{
	if (oFF.isNull(oFF.HpLocalizationResolver.s_singletonInstance))
	{
		let resolver = new oFF.HpLocalizationResolver();
		resolver.setup();
		oFF.HpLocalizationResolver.s_singletonInstance = resolver;
	}
	return oFF.HpLocalizationResolver.s_singletonInstance;
};
oFF.HpLocalizationResolver.prototype.resolve = function(key)
{
	if (oFF.XString.startsWith(key, oFF.HpLocalizationResolver.KEY_PREFIX) && oFF.XString.endsWith(key, oFF.HpLocalizationResolver.KEY_SUFFIX))
	{
		let startIndex = oFF.XString.size(oFF.HpLocalizationResolver.KEY_PREFIX);
		let endIndex = oFF.XString.size(key) - oFF.XString.size(oFF.HpLocalizationResolver.KEY_SUFFIX);
		let i18nKey = oFF.XString.substring(key, startIndex, endIndex);
		return oFF.XLocalizationCenter.getCenter().getText(i18nKey);
	}
	return key;
};

oFF.HpSideNavigationI18n = function() {};
oFF.HpSideNavigationI18n.prototype = new oFF.DfXLocalizationProvider();
oFF.HpSideNavigationI18n.prototype._ff_c = "HpSideNavigationI18n";

oFF.HpSideNavigationI18n.I18N_SN_COLLAPSE = "I18N_SN_COLLAPSE";
oFF.HpSideNavigationI18n.I18N_SN_EXPAND = "I18N_SN_EXPAND";
oFF.HpSideNavigationI18n.LOCAL_NAME = "SideNavigationI18n";
oFF.HpSideNavigationI18n.getLocalization = function()
{
	return oFF.XLocalizationCenter.getCenter().getLocalizationProviderByName(oFF.HpSideNavigationI18n.LOCAL_NAME);
};
oFF.HpSideNavigationI18n.staticSetup = function()
{
	let provider = new oFF.HpSideNavigationI18n();
	provider.setupProvider(oFF.HpSideNavigationI18n.LOCAL_NAME, true);
	provider.addText(oFF.HpSideNavigationI18n.I18N_SN_EXPAND, "Expand");
	provider.addComment(oFF.HpSideNavigationI18n.I18N_SN_EXPAND, "#XTOL: Expands the side navigation");
	provider.addText(oFF.HpSideNavigationI18n.I18N_SN_COLLAPSE, "Collapse");
	provider.addComment(oFF.HpSideNavigationI18n.I18N_SN_COLLAPSE, "#XTOL: Collapses the side navigation");
	return provider;
};

oFF.HpTextEditorPlugin = function() {};
oFF.HpTextEditorPlugin.prototype = new oFF.XObject();
oFF.HpTextEditorPlugin.prototype._ff_c = "HpTextEditorPlugin";

oFF.HpTextEditorPlugin.DATA_STORAGE_VALUE_KEY = "codeEditorValue";
oFF.HpTextEditorPlugin.PLUGIN_NAME = "HorizonTextEditor";
oFF.HpTextEditorPlugin.prototype.m_codeEditor = null;
oFF.HpTextEditorPlugin.prototype.m_codeType = null;
oFF.HpTextEditorPlugin.prototype.m_colorTheme = null;
oFF.HpTextEditorPlugin.prototype.m_controller = null;
oFF.HpTextEditorPlugin.prototype.m_initialText = null;
oFF.HpTextEditorPlugin.prototype.m_persistEditorContent = false;
oFF.HpTextEditorPlugin.prototype._getController = function()
{
	return this.m_controller;
};
oFF.HpTextEditorPlugin.prototype._handleLiveChange = function(controlEvent)
{
	if (this.m_persistEditorContent)
	{
		let newValue = controlEvent.getParameters().getStringByKeyExt(oFF.UiEventParams.PARAM_VALUE, this.m_codeEditor.getValue());
		if (!oFF.XString.isEqual(this.m_initialText, newValue))
		{
			this._getController().getDataStorage().putString(oFF.HpTextEditorPlugin.DATA_STORAGE_VALUE_KEY, newValue);
		}
	}
};
oFF.HpTextEditorPlugin.prototype.buildPluginUi = function(genesis)
{
	this.m_codeEditor = genesis.newRoot(oFF.UiType.CODE_EDITOR);
	this.m_codeEditor.useMaxSpace();
	this.m_codeEditor.setValue(this.m_initialText);
	this.m_codeEditor.setCodeType(this.m_codeType);
	this.m_codeEditor.setColorTheme(this.m_colorTheme);
	this.m_codeEditor.registerOnFileDrop(oFF.UiLambdaFileDropListener.create((fileEvent) => {
		let fileContent = fileEvent.getFileContentString();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(fileContent))
		{
			this.m_codeEditor.setValue(fileContent);
		}
	}));
	this.m_codeEditor.registerOnLiveChange(oFF.UiLambdaLiveChangeListener.create(this._handleLiveChange.bind(this)));
	this.m_codeEditor.focus();
};
oFF.HpTextEditorPlugin.prototype.destroyPlugin = function()
{
	this.m_codeEditor = oFF.XObjectExt.release(this.m_codeEditor);
	this.m_controller = null;
};
oFF.HpTextEditorPlugin.prototype.didBecameHidden = function() {};
oFF.HpTextEditorPlugin.prototype.didBecameVisible = function() {};
oFF.HpTextEditorPlugin.prototype.getName = function()
{
	return oFF.HpTextEditorPlugin.PLUGIN_NAME;
};
oFF.HpTextEditorPlugin.prototype.getPluginCategory = function()
{
	return oFF.HuPluginCategory.SYSTEM;
};
oFF.HpTextEditorPlugin.prototype.getPluginType = function()
{
	return oFF.HuPluginType.COMPONENT;
};
oFF.HpTextEditorPlugin.prototype.onConfigurationChanged = function(configuration) {};
oFF.HpTextEditorPlugin.prototype.onResize = function(offsetWidth, offsetHeight) {};
oFF.HpTextEditorPlugin.prototype.processConfiguration = function(configuration)
{
	this.m_initialText = configuration.getStringByKey("text");
	this.m_codeType = configuration.getStringByKeyExt("codeType", "text");
	this.m_colorTheme = configuration.getStringByKey("colorTheme");
	this.m_persistEditorContent = configuration.getBooleanByKeyExt("persistEditorContent", false);
};
oFF.HpTextEditorPlugin.prototype.setupPlugin = function(controller)
{
	this.m_controller = controller;
	if (this.m_persistEditorContent)
	{
		this.m_initialText = controller.getDataStorage().getStringByKeyExt(oFF.HpTextEditorPlugin.DATA_STORAGE_VALUE_KEY, this.m_initialText);
	}
	return null;
};

oFF.HpExpandableListDocumentPlugin = function() {};
oFF.HpExpandableListDocumentPlugin.prototype = new oFF.HuDfDocumentPlugin();
oFF.HpExpandableListDocumentPlugin.prototype._ff_c = "HpExpandableListDocumentPlugin";

oFF.HpExpandableListDocumentPlugin.CONFIG = "config";
oFF.HpExpandableListDocumentPlugin.ENABLED = "enabled";
oFF.HpExpandableListDocumentPlugin.ICON = "icon";
oFF.HpExpandableListDocumentPlugin.ITEMS_AGGREGATION = "items";
oFF.HpExpandableListDocumentPlugin.ON_PRESS_NOTIFICATION_NAME = "pressNotificationName";
oFF.HpExpandableListDocumentPlugin.PLUGIN_NAME = "ExpandableListDocument";
oFF.HpExpandableListDocumentPlugin.POPOVER_TEXT = "popoverText";
oFF.HpExpandableListDocumentPlugin.PROP_CSS_CLASS = "cssClass";
oFF.HpExpandableListDocumentPlugin.PROP_DESCRIPTION = "description";
oFF.HpExpandableListDocumentPlugin.PROP_EXPANDED = "expanded";
oFF.HpExpandableListDocumentPlugin.PROP_PLUGIN = "plugin";
oFF.HpExpandableListDocumentPlugin.SET_ENABLED_NOTIFICATION_NAME = "enabledNotificationName";
oFF.HpExpandableListDocumentPlugin.SET_PANEL_VISIBILITY_NOTIFICATION_NAME = "com.sap.ff.ExpandableListDocument.Notification.setPanelVisibility";
oFF.HpExpandableListDocumentPlugin.SET_POPOVER_TEXT_NOTIFICATION_NAME = "setPopoverTextNotificationName";
oFF.HpExpandableListDocumentPlugin.SET_VISIBILITY_NOTIFICATION_NAME = "visibilityNotificationName";
oFF.HpExpandableListDocumentPlugin.TOOLBAR_BUTTONS = "toolbarButtons";
oFF.HpExpandableListDocumentPlugin.TOOLTIP = "tooltip";
oFF.HpExpandableListDocumentPlugin.VISIBILITY_NOTIFICATION_DATA_PLUGIN_NAME = "com.sap.ff.ExpandableListDocument.NotificationData.pluginName";
oFF.HpExpandableListDocumentPlugin.VISIBILITY_NOTIFICATION_DATA_VISIBLE = "com.sap.ff.ExpandableListDocument.NotificationData.visible";
oFF.HpExpandableListDocumentPlugin.VISIBLE = "visible";
oFF.HpExpandableListDocumentPlugin.notifyVisibilityStateChange = function(controller, pluginName, isVisible)
{
	let data = oFF.XNotificationData.create();
	data.putString(oFF.HpExpandableListDocumentPlugin.VISIBILITY_NOTIFICATION_DATA_PLUGIN_NAME, pluginName);
	data.putBoolean(oFF.HpExpandableListDocumentPlugin.VISIBILITY_NOTIFICATION_DATA_VISIBLE, isVisible);
	controller.getLocalNotificationCenter().postNotificationWithName(oFF.HpExpandableListDocumentPlugin.SET_PANEL_VISIBILITY_NOTIFICATION_NAME, data);
};
oFF.HpExpandableListDocumentPlugin.prototype.m_layout = null;
oFF.HpExpandableListDocumentPlugin.prototype.m_observerIds = null;
oFF.HpExpandableListDocumentPlugin.prototype.m_pluginPanels = null;
oFF.HpExpandableListDocumentPlugin.prototype.m_scroll = null;
oFF.HpExpandableListDocumentPlugin.prototype._addToolbarButton = function(headerToolbar, buttonElement)
{
	let buttonStructure = buttonElement.asStructure();
	if (oFF.notNull(buttonStructure))
	{
		let icon = buttonStructure.getStringByKey(oFF.HpExpandableListDocumentPlugin.ICON);
		let tooltip = buttonStructure.getStringByKey(oFF.HpExpandableListDocumentPlugin.TOOLTIP);
		let setVisibilityNotificationName = buttonStructure.getStringByKey(oFF.HpExpandableListDocumentPlugin.SET_VISIBILITY_NOTIFICATION_NAME);
		let setEnabledNotificationName = buttonStructure.getStringByKey(oFF.HpExpandableListDocumentPlugin.SET_ENABLED_NOTIFICATION_NAME);
		let onPressNotificationName = buttonStructure.getStringByKey(oFF.HpExpandableListDocumentPlugin.ON_PRESS_NOTIFICATION_NAME);
		let setPopoverTextNotificationName = buttonStructure.getStringByKey(oFF.HpExpandableListDocumentPlugin.SET_POPOVER_TEXT_NOTIFICATION_NAME);
		let buttonWidget = oFF.UtInfoButtonWidget.create(this.getController().getGenesis(), icon, tooltip);
		headerToolbar.addItem(buttonWidget.getView());
		let notificationCenter = this.getController().getLocalNotificationCenter();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(onPressNotificationName))
		{
			buttonWidget.registerOnPress(oFF.UiLambdaPressListener.create((evt) => {
				notificationCenter.postNotificationWithName(onPressNotificationName, null);
			}));
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(setVisibilityNotificationName))
		{
			let visibilityObserver = notificationCenter.addObserverForName(setVisibilityNotificationName, (notification) => {
				buttonWidget.setVisible(notification.getBooleanByKey(oFF.HpExpandableListDocumentPlugin.VISIBLE));
			});
			this.m_observerIds.add(visibilityObserver);
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(setEnabledNotificationName))
		{
			let enabledObserver = notificationCenter.addObserverForName(setEnabledNotificationName, (notification) => {
				buttonWidget.setEnabled(notification.getBooleanByKey(oFF.HpExpandableListDocumentPlugin.ENABLED));
			});
			this.m_observerIds.add(enabledObserver);
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(setPopoverTextNotificationName))
		{
			let setPopoverTextObserver = notificationCenter.addObserverForName(setPopoverTextNotificationName, (notification) => {
				let popoverText = notification.getStringByKey(oFF.HpExpandableListDocumentPlugin.POPOVER_TEXT);
				buttonWidget.setPopoverText(popoverText);
				buttonWidget.setEnabled(oFF.XStringUtils.isNullOrEmpty(popoverText));
			});
			this.m_observerIds.add(setPopoverTextObserver);
		}
	}
};
oFF.HpExpandableListDocumentPlugin.prototype._createPluginPanel = function(pluginName, description, toolbarButtons, expanded, cssClass)
{
	let panel = this.m_layout.addNewItemOfType(oFF.UiType.PANEL);
	panel.addCssClass("ffExpandableListPanel");
	panel.addCssClass(oFF.XStringUtils.concatenate3("ffExpandableListPanel", "-", pluginName));
	panel.addCssClass(cssClass);
	panel.setExpandable(true);
	panel.setExpanded(expanded);
	let headerToolbar = panel.setNewHeaderToolbar();
	headerToolbar.removeAttribute(oFF.UtUi5AttributeConstants.FAST_NAV_GROUP);
	headerToolbar.setMinHeight(oFF.UiCssLength.create("2.5rem"));
	let headerTitle = headerToolbar.addNewItemOfType(oFF.UiType.TITLE);
	headerTitle.setTitleStyle(oFF.UiTitleLevel.H_6);
	headerTitle.setTitleLevel(oFF.UiTitleLevel.H_6);
	headerTitle.setText(description);
	headerToolbar.addNewItemOfType(oFF.UiType.SPACER);
	oFF.XCollectionUtils.forEach(toolbarButtons, (buttonElement) => {
		this._addToolbarButton(headerToolbar, buttonElement);
	});
	return panel;
};
oFF.HpExpandableListDocumentPlugin.prototype.addPanelPlugins = function()
{
	let configuration = this.getConfiguration();
	let items = configuration.getListByKey(oFF.HpExpandableListDocumentPlugin.ITEMS_AGGREGATION);
	for (let i = 0; i < items.size(); i++)
	{
		let itemStructure = items.getStructureAt(i);
		let pluginName = itemStructure.getStringByKey(oFF.HpExpandableListDocumentPlugin.PROP_PLUGIN);
		let description = itemStructure.getStringByKey(oFF.HpExpandableListDocumentPlugin.PROP_DESCRIPTION);
		let effectiveDescription = oFF.HpLocalizationResolver.getInstance().resolve(description);
		let toolbarButtons = itemStructure.getListByKey(oFF.HpExpandableListDocumentPlugin.TOOLBAR_BUTTONS);
		let expanded = itemStructure.getBooleanByKey(oFF.HpExpandableListDocumentPlugin.PROP_EXPANDED);
		let pluginConfig = itemStructure.getStructureByKey(oFF.HpExpandableListDocumentPlugin.CONFIG);
		let cssClass = itemStructure.getStringByKey(oFF.HpExpandableListDocumentPlugin.PROP_CSS_CLASS);
		let pluginPanel = this._createPluginPanel(pluginName, effectiveDescription, toolbarButtons, expanded, cssClass);
		this.m_pluginPanels.put(pluginName, pluginPanel);
		this.getController().addNewComponentPlugin(pluginName, pluginConfig, null).onThen((pluginInstanceId) => {
			let pluginView = this.getController().getPluginView(pluginInstanceId);
			pluginPanel.setContent(pluginView);
		});
	}
	let visibilityObserver = this.getController().getLocalNotificationCenter().addObserverForName(oFF.HpExpandableListDocumentPlugin.SET_PANEL_VISIBILITY_NOTIFICATION_NAME, (notification) => {
		let panelName = notification.getStringByKey(oFF.HpExpandableListDocumentPlugin.VISIBILITY_NOTIFICATION_DATA_PLUGIN_NAME);
		let pluginPanel = this.m_pluginPanels.getByKey(panelName);
		if (oFF.notNull(pluginPanel))
		{
			let visible = notification.getBooleanByKeyExt(oFF.HpExpandableListDocumentPlugin.VISIBILITY_NOTIFICATION_DATA_VISIBLE, true);
			pluginPanel.setVisible(visible);
		}
	});
	this.m_observerIds.add(visibilityObserver);
};
oFF.HpExpandableListDocumentPlugin.prototype.destroyPlugin = function()
{
	let notificationCenter = this.getController().getLocalNotificationCenter();
	oFF.XCollectionUtils.forEach(this.m_observerIds, notificationCenter.removeObserverByUuid.bind(notificationCenter));
	this.m_observerIds = oFF.XObjectExt.release(this.m_observerIds);
	this.m_layout = oFF.XObjectExt.release(this.m_layout);
	this.m_scroll = oFF.XObjectExt.release(this.m_scroll);
	oFF.XCollectionUtils.releaseEntriesFromCollection(this.m_pluginPanels);
	this.m_pluginPanels = oFF.XObjectExt.release(this.m_pluginPanels);
	oFF.HuDfDocumentPlugin.prototype.destroyPlugin.call( this );
};
oFF.HpExpandableListDocumentPlugin.prototype.getAutoLayoutConfiguration = function()
{
	let autoLayoutConfig = oFF.PrFactory.createStructure();
	autoLayoutConfig.putString("type", oFF.HuLayoutType.SINGLE_PLUGIN.getName());
	return autoLayoutConfig;
};
oFF.HpExpandableListDocumentPlugin.prototype.getPluginCategory = function()
{
	return oFF.HuPluginCategory.SYSTEM;
};
oFF.HpExpandableListDocumentPlugin.prototype.getPluginName = function()
{
	return oFF.HpExpandableListDocumentPlugin.PLUGIN_NAME;
};
oFF.HpExpandableListDocumentPlugin.prototype.layoutDocument = function(documentController)
{
	let genesis = documentController.getGenesis();
	this.m_scroll = genesis.newControl(oFF.UiType.SCROLL_CONTAINER);
	this.m_scroll.useMaxSpace();
	this.m_layout = this.m_scroll.setNewContent(oFF.UiType.FLEX_LAYOUT);
	this.m_layout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.getController().setRoot(this.m_scroll);
	this.addPanelPlugins();
};
oFF.HpExpandableListDocumentPlugin.prototype.setupPlugin = function(controller)
{
	oFF.HuDfDocumentPlugin.prototype.setupPlugin.call( this , controller);
	this.m_observerIds = oFF.XList.create();
	this.m_pluginPanels = oFF.XHashMapByString.create();
	return null;
};

oFF.HpSideNavigationDocumentPlugin = function() {};
oFF.HpSideNavigationDocumentPlugin.prototype = new oFF.HuDfDocumentPlugin();
oFF.HpSideNavigationDocumentPlugin.prototype._ff_c = "HpSideNavigationDocumentPlugin";

oFF.HpSideNavigationDocumentPlugin.ADD_HEADER = "addHeader";
oFF.HpSideNavigationDocumentPlugin.CLOSE_CMD_FIELD = "close-command-field";
oFF.HpSideNavigationDocumentPlugin.CONFIG = "config";
oFF.HpSideNavigationDocumentPlugin.CONFIG_POSITION = "position";
oFF.HpSideNavigationDocumentPlugin.CONFIG_POSITION_LEFT = "left";
oFF.HpSideNavigationDocumentPlugin.CONFIG_POSITION_RIGHT = "right";
oFF.HpSideNavigationDocumentPlugin.DEFAULT_ICON = "hello-world";
oFF.HpSideNavigationDocumentPlugin.DESCRIPTION = "description";
oFF.HpSideNavigationDocumentPlugin.ICON = "icon";
oFF.HpSideNavigationDocumentPlugin.ITEMS_AGGREGATION = "items";
oFF.HpSideNavigationDocumentPlugin.NOTIFICATION_CHANGE_PANEL_VISIBILITY = "com.sap.ff.SideNavigationDocument.Notification.changePanelVisibility";
oFF.HpSideNavigationDocumentPlugin.NOTIFICATION_DATA_CONSUMER = "com.sap.ff.SideNavigationDocument.NotificationData.consumer";
oFF.HpSideNavigationDocumentPlugin.NOTIFICATION_DATA_PANEL_KEY = "com.sap.ff.SideNavigationDocument.NotificationData.panelKey";
oFF.HpSideNavigationDocumentPlugin.NOTIFICATION_DATA_PANEL_VISIBILITY = "com.sap.ff.SideNavigationDocument.NotificationData.panelVisibility";
oFF.HpSideNavigationDocumentPlugin.NOTIFICATION_PANELS_READY = "com.sap.ff.SideNavigationDocument.Notification.panelsReady";
oFF.HpSideNavigationDocumentPlugin.NOTIFICATION_SET_PANEL_STATE_CHANGE_CONSUMER = "com.sap.ff.SideNavigationDocument.Notification.setPanelStateChangeConsumer";
oFF.HpSideNavigationDocumentPlugin.OPEN_CMD_FIELD = "open-command-field";
oFF.HpSideNavigationDocumentPlugin.PANEL_STATE_OPEN_PANELS_KEY = "OpenPanels";
oFF.HpSideNavigationDocumentPlugin.PLUGIN = "plugin";
oFF.HpSideNavigationDocumentPlugin.PLUGIN_NAME = "SideNavigationDocument";
oFF.HpSideNavigationDocumentPlugin.SIDE_NAV_DEFAULT_WIDTH = "58px";
oFF.HpSideNavigationDocumentPlugin.prototype.m_changePanelVisibilityObserverId = null;
oFF.HpSideNavigationDocumentPlugin.prototype.m_genesis = null;
oFF.HpSideNavigationDocumentPlugin.prototype.m_lastOpenedPanelKey = null;
oFF.HpSideNavigationDocumentPlugin.prototype.m_layout = null;
oFF.HpSideNavigationDocumentPlugin.prototype.m_navList = null;
oFF.HpSideNavigationDocumentPlugin.prototype.m_navListItemsMap = null;
oFF.HpSideNavigationDocumentPlugin.prototype.m_panelContainer = null;
oFF.HpSideNavigationDocumentPlugin.prototype.m_panelStateChangeConsumers = null;
oFF.HpSideNavigationDocumentPlugin.prototype.m_panelStateChangeObserverId = null;
oFF.HpSideNavigationDocumentPlugin.prototype.m_panels = null;
oFF.HpSideNavigationDocumentPlugin.prototype.m_sideNavigation = null;
oFF.HpSideNavigationDocumentPlugin.prototype._addPanelPlugins = function()
{
	let configuration = this.getConfiguration();
	let items = configuration.getListByKey(oFF.HpSideNavigationDocumentPlugin.ITEMS_AGGREGATION);
	let createNavItemPromises = oFF.XPromiseList.create();
	for (let index = 0; index < items.size(); index++)
	{
		let itemIndex = index;
		let itemStructure = items.getStructureAt(index);
		let iconInConfig = itemStructure.getStringByKey(oFF.HpSideNavigationDocumentPlugin.ICON);
		let icon = oFF.XStringUtils.isNotNullAndNotEmpty(iconInConfig) ? iconInConfig : oFF.HpSideNavigationDocumentPlugin.DEFAULT_ICON;
		let description = itemStructure.getStringByKey(oFF.HpSideNavigationDocumentPlugin.DESCRIPTION);
		let effectiveDescription = oFF.HpLocalizationResolver.getInstance().resolve(description);
		let pluginName = itemStructure.getStringByKey(oFF.HpSideNavigationDocumentPlugin.PLUGIN);
		let shouldAddHeader = itemStructure.getBooleanByKey(oFF.HpSideNavigationDocumentPlugin.ADD_HEADER);
		let pluginConfig = itemStructure.getStructureByKey(oFF.HpSideNavigationDocumentPlugin.CONFIG);
		let createPluginPromise = this.getController().addNewComponentPlugin(pluginName, pluginConfig, null);
		let createNavItemPromise = createPluginPromise.onThenPromise((pluginInstanceId) => {
			let pluginView = this.getController().getPluginView(pluginInstanceId);
			return this._createNavListItem(pluginView, pluginName, shouldAddHeader, icon, effectiveDescription, itemIndex);
		}).onCatchExt((error) => {
			this.getController().addErrorMessage("Error", "Side navigation error", error.getText());
			return null;
		});
		createNavItemPromises.add(createNavItemPromise);
	}
	let allNavItemsCreatedPromise = oFF.XPromise.allSettled(createNavItemPromises);
	allNavItemsCreatedPromise.onThen((result) => {
		for (let index = 0; index < this.m_navListItemsMap.size(); index++)
		{
			let navItem = this.m_navListItemsMap.getByKey(oFF.XInteger.convertToString(index));
			if (oFF.notNull(navItem))
			{
				this.m_navList.addItem(navItem);
			}
		}
		this.getLocalNotificationCenter().postNotificationWithName(oFF.HpSideNavigationDocumentPlugin.NOTIFICATION_PANELS_READY, null);
	});
};
oFF.HpSideNavigationDocumentPlugin.prototype._buildNavigationList = function()
{
	this.m_navList = this.m_sideNavigation.setNewNavList();
	this.m_navList.addCssClass("ffGdsPanelSideNavigation");
	let overviewItem = this.m_navList.addNewItem();
	this._updateOverviewIcon();
	overviewItem.setTarget(null);
	overviewItem.setKey("OverviewPanel");
	overviewItem.registerOnSelect(oFF.UiLambdaSelectListener.create((event1) => {
		let lastOpenedPanelKey = this._getLastOpenedPanel();
		this._togglePanel(lastOpenedPanelKey);
	}));
};
oFF.HpSideNavigationDocumentPlugin.prototype._buildPanelContainer = function()
{
	this.m_panelContainer = this.m_layout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_panelContainer.setDirection(oFF.UiFlexDirection.ROW);
	this.m_panelContainer.useMaxHeight();
	this.m_panelContainer.setFlex("auto");
	this.m_panelContainer.setOverflow(oFF.UiOverflow.HIDDEN);
	this.m_panelContainer.setBorderStyle(oFF.UiBorderStyle.SOLID);
	if (this.m_layout.getDirection() === oFF.UiFlexDirection.ROW_REVERSE)
	{
		this.m_panelContainer.setBorderWidth(oFF.UiCssBoxEdges.create("0px 1px 0px 0px"));
	}
	else
	{
		this.m_panelContainer.setBorderWidth(oFF.UiCssBoxEdges.create("0px 0px 0px 1px"));
	}
	this.m_panelContainer.setBorderColor(oFF.UtStyles.LIGHT_GRAY_COLOR);
};
oFF.HpSideNavigationDocumentPlugin.prototype._buildSideNavigation = function()
{
	this.m_sideNavigation = this.m_layout.addNewItemOfType(oFF.UiType.SIDE_NAVIGATION);
	this.m_sideNavigation.useMaxHeight();
	this.m_sideNavigation.addCssClass("ffGdsPanelSideNavigationRoot");
	this.m_sideNavigation.setFlex("0 0 auto");
	this.m_sideNavigation.setExpanded(false);
	this.m_sideNavigation.registerOnItemSelect(oFF.UiLambdaItemSelectListener.create((event) => {
		let selectedItem = event.getAffectedItem();
		let panelKey = selectedItem.getTag();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(panelKey))
		{
			this._togglePanel(panelKey);
		}
	}));
	this._buildNavigationList();
};
oFF.HpSideNavigationDocumentPlugin.prototype._createNavListItem = function(control, key, shouldAddHeader, icon, description, index)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(key))
	{
		let navItem = this.m_navList.newItem();
		navItem.setTag(key);
		navItem.setTarget(null);
		navItem.setKey(key);
		if (shouldAddHeader)
		{
			let panelWidget = oFF.UtPanelWidget.create(this.m_genesis, icon, description, null);
			let panel = panelWidget.getView();
			panel.setContent(control);
			this.m_panels.put(key, panel);
		}
		else
		{
			let panelWrapper = this.m_genesis.newControl(oFF.UiType.SCROLL_CONTAINER).setContent(control).useMaxSpace();
			this.m_panels.put(key, panelWrapper);
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(icon))
		{
			navItem.setIcon(icon);
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(description))
		{
			navItem.setTooltip(description);
		}
		this.m_navListItemsMap.put(oFF.XInteger.convertToString(index), navItem);
		return oFF.XPromise.resolve(navItem);
	}
	else
	{
		return oFF.XPromise.reject(oFF.XError.create("Side navigation item cannot be created without a key."));
	}
};
oFF.HpSideNavigationDocumentPlugin.prototype._getLastOpenedPanel = function()
{
	let items = this.m_navList.getItems();
	let lastOpenedPanelKey = null;
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_lastOpenedPanelKey))
	{
		lastOpenedPanelKey = this.m_lastOpenedPanelKey;
	}
	else if (items.size() > 1)
	{
		lastOpenedPanelKey = items.get(1).getTag();
	}
	return lastOpenedPanelKey;
};
oFF.HpSideNavigationDocumentPlugin.prototype._getParentSplitterItem = function()
{
	let control = this.m_layout.getParent();
	while (oFF.notNull(control) && control.getUiType() !== oFF.UiType.INTERACTIVE_SPLITTER_ITEM)
	{
		control = control.getParent();
	}
	return control;
};
oFF.HpSideNavigationDocumentPlugin.prototype._hidePanel = function(key)
{
	let panel = this.m_panels.getByKey(key);
	if (oFF.notNull(panel))
	{
		if (panel.getParent() === this.m_panelContainer)
		{
			this.m_panelContainer.removeItem(panel);
			let splitterItem = this._getParentSplitterItem();
			this._resetParentContainerWidths(splitterItem);
			this._updateOverviewIcon();
			this.notifyPanelStateChange(key, false);
		}
	}
	else
	{
		oFF.XLogger.println(oFF.XStringUtils.concatenate2("Cannot determine panel with key : ", key));
	}
};
oFF.HpSideNavigationDocumentPlugin.prototype._observeNotifications = function()
{
	let notificationCenter = this.getController().getLocalNotificationCenter();
	this.m_panelStateChangeObserverId = notificationCenter.addObserverForName(oFF.HpSideNavigationDocumentPlugin.NOTIFICATION_SET_PANEL_STATE_CHANGE_CONSUMER, (data) => {
		let consumerHolderObj = data.getXObjectByKey(oFF.HpSideNavigationDocumentPlugin.NOTIFICATION_DATA_CONSUMER);
		try
		{
			let consumerHolder = oFF.XObject.castToAny(consumerHolderObj);
			if (oFF.notNull(consumerHolder))
			{
				this.m_panelStateChangeConsumers.add(consumerHolder.getConsumer());
			}
		}
		catch (t)
		{
			oFF.XLogger.println("Unable to cast notification data to XConsumerHolder");
		}
	});
	this.m_changePanelVisibilityObserverId = notificationCenter.addObserverForName(oFF.HpSideNavigationDocumentPlugin.NOTIFICATION_CHANGE_PANEL_VISIBILITY, (data) => {
		let panelKey = data.getStringByKey(oFF.HpSideNavigationDocumentPlugin.NOTIFICATION_DATA_PANEL_KEY);
		let shouldBeVisible = data.getBooleanByKey(oFF.HpSideNavigationDocumentPlugin.NOTIFICATION_DATA_PANEL_VISIBILITY);
		if (oFF.XStringUtils.isNullOrEmpty(panelKey))
		{
			panelKey = this._getLastOpenedPanel();
		}
		if (shouldBeVisible)
		{
			this._showPanel(panelKey);
		}
		else
		{
			this._hidePanel(panelKey);
		}
	});
};
oFF.HpSideNavigationDocumentPlugin.prototype._resetParentContainerWidths = function(splitterItem)
{
	if (oFF.notNull(splitterItem))
	{
		this._setParentContainerWidth(splitterItem, oFF.HpSideNavigationDocumentPlugin.SIDE_NAV_DEFAULT_WIDTH);
		let splitter = splitterItem.getParent();
		if (oFF.notNull(splitter))
		{
			let itemIndex = splitter.getIndexOfItem(splitterItem);
			let totalNumberOfItems = splitter.getItems().size();
			let adjacentItemIndex = totalNumberOfItems === itemIndex + 1 ? itemIndex - 1 : itemIndex + 1;
			if (adjacentItemIndex >= 0 && adjacentItemIndex < totalNumberOfItems)
			{
				let adjacentItem = splitter.getItem(adjacentItemIndex);
				adjacentItem.setWidth(null);
			}
		}
	}
};
oFF.HpSideNavigationDocumentPlugin.prototype._setLayoutDirection = function()
{
	let configuration = this.getConfiguration();
	let position = configuration.getStringByKeyExt(oFF.HpSideNavigationDocumentPlugin.CONFIG_POSITION, oFF.HpSideNavigationDocumentPlugin.CONFIG_POSITION_RIGHT);
	let direction = oFF.XString.isEqual(position, oFF.HpSideNavigationDocumentPlugin.CONFIG_POSITION_LEFT) ? oFF.UiFlexDirection.ROW : oFF.UiFlexDirection.ROW_REVERSE;
	this.m_layout.setDirection(direction);
};
oFF.HpSideNavigationDocumentPlugin.prototype._setParentContainerWidth = function(splitterItem, width)
{
	if (oFF.notNull(splitterItem))
	{
		splitterItem.setWidth(oFF.UiCssLength.create(width));
		splitterItem.setMinWidth(oFF.UiCssLength.create(oFF.HpSideNavigationDocumentPlugin.SIDE_NAV_DEFAULT_WIDTH));
	}
};
oFF.HpSideNavigationDocumentPlugin.prototype._showPanel = function(key)
{
	let panel = this.m_panels.getByKey(key);
	if (oFF.notNull(panel))
	{
		if (panel.getParent() !== this.m_panelContainer)
		{
			let wasContainerEmpty = !this.m_panelContainer.hasItems();
			this.m_panelContainer.clearItems();
			this.m_panelContainer.addItem(panel);
			this.m_lastOpenedPanelKey = key;
			if (wasContainerEmpty)
			{
				let splitterItem = this._getParentSplitterItem();
				this._setParentContainerWidth(splitterItem, null);
			}
			let selectedItem = oFF.XCollectionUtils.findFirst(this.m_navList.getItems(), (item) => {
				return oFF.XString.isEqual(item.getTag(), key);
			});
			oFF.XTimeout.timeout(0, () => {
				this.m_navList.setSelectedItem(selectedItem);
			});
			this._updateOverviewIcon();
			this.notifyPanelStateChange(key, true);
		}
	}
	else
	{
		oFF.XLogger.println(oFF.XStringUtils.concatenate2("Cannot determine panel with key : ", key));
	}
};
oFF.HpSideNavigationDocumentPlugin.prototype._togglePanel = function(key)
{
	let panel = this.m_panels.getByKey(key);
	if (oFF.notNull(panel))
	{
		let isPanelOpen = panel.getParent() === this.m_panelContainer;
		if (isPanelOpen)
		{
			this._hidePanel(key);
		}
		else
		{
			this._showPanel(key);
		}
	}
	else
	{
		oFF.XLogger.println(oFF.XStringUtils.concatenate2("Cannot determine panel with key : ", key));
	}
};
oFF.HpSideNavigationDocumentPlugin.prototype._unobserveNotifications = function()
{
	let notificationCenter = this.getController().getLocalNotificationCenter();
	notificationCenter.removeObserverByUuid(this.m_panelStateChangeObserverId);
	this.m_panelStateChangeObserverId = null;
	notificationCenter.removeObserverByUuid(this.m_changePanelVisibilityObserverId);
	this.m_changePanelVisibilityObserverId = null;
};
oFF.HpSideNavigationDocumentPlugin.prototype._updateOverviewIcon = function()
{
	let localization = oFF.HpSideNavigationI18n.getLocalization();
	let overviewItem = this.m_navList.getItem(0);
	let iconKey;
	let tooltipKey;
	if (oFF.isNull(this.m_panelContainer) || !this.m_panelContainer.hasItems())
	{
		iconKey = this.m_layout.getDirection() === oFF.UiFlexDirection.ROW_REVERSE ? oFF.HpSideNavigationDocumentPlugin.CLOSE_CMD_FIELD : oFF.HpSideNavigationDocumentPlugin.OPEN_CMD_FIELD;
		tooltipKey = oFF.HpSideNavigationI18n.I18N_SN_EXPAND;
	}
	else
	{
		iconKey = this.m_layout.getDirection() === oFF.UiFlexDirection.ROW_REVERSE ? oFF.HpSideNavigationDocumentPlugin.OPEN_CMD_FIELD : oFF.HpSideNavigationDocumentPlugin.CLOSE_CMD_FIELD;
		tooltipKey = oFF.HpSideNavigationI18n.I18N_SN_COLLAPSE;
	}
	overviewItem.setIcon(iconKey);
	overviewItem.setTooltip(localization.getText(tooltipKey));
};
oFF.HpSideNavigationDocumentPlugin.prototype.destroyPlugin = function()
{
	this._unobserveNotifications();
	this.m_panelStateChangeConsumers = oFF.XCollectionUtils.clearAndReleaseCollection(this.m_panelStateChangeConsumers);
	this.m_layout = oFF.XObjectExt.release(this.m_layout);
	this.m_panelContainer = oFF.XObjectExt.release(this.m_panelContainer);
	this.m_sideNavigation = oFF.XObjectExt.release(this.m_sideNavigation);
	this.m_navList = oFF.XObjectExt.release(this.m_navList);
	oFF.XCollectionUtils.releaseEntriesFromCollection(this.m_panels);
	this.m_navListItemsMap = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_navListItemsMap);
	this.m_genesis = null;
	oFF.HuDfDocumentPlugin.prototype.destroyPlugin.call( this );
};
oFF.HpSideNavigationDocumentPlugin.prototype.getAutoLayoutConfiguration = function()
{
	let autoLayoutConfig = oFF.PrFactory.createStructure();
	autoLayoutConfig.putString("type", oFF.HuLayoutType.SINGLE_PLUGIN.getName());
	return autoLayoutConfig;
};
oFF.HpSideNavigationDocumentPlugin.prototype.getPluginCategory = function()
{
	return oFF.HuPluginCategory.SYSTEM;
};
oFF.HpSideNavigationDocumentPlugin.prototype.getPluginName = function()
{
	return oFF.HpSideNavigationDocumentPlugin.PLUGIN_NAME;
};
oFF.HpSideNavigationDocumentPlugin.prototype.layoutDocument = function(documentController)
{
	this.m_panels = oFF.XHashMapByString.create();
	this.m_genesis = documentController.getGenesis();
	this.m_layout = this.m_genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	this.m_layout.useMaxSpace();
	this.getController().setRoot(this.m_layout);
	let splitterItem = this._getParentSplitterItem();
	this._setParentContainerWidth(splitterItem, oFF.HpSideNavigationDocumentPlugin.SIDE_NAV_DEFAULT_WIDTH);
	this._setLayoutDirection();
	this._buildSideNavigation();
	this._buildPanelContainer();
	this._addPanelPlugins();
};
oFF.HpSideNavigationDocumentPlugin.prototype.notifyPanelStateChange = function(key, isPanelOpened)
{
	if (oFF.XCollectionUtils.hasElements(this.m_panelStateChangeConsumers))
	{
		let uiState = oFF.PrStructure.create();
		let openPanelInfo = uiState.putNewStructure(oFF.HpSideNavigationDocumentPlugin.PANEL_STATE_OPEN_PANELS_KEY);
		openPanelInfo.putBoolean(key, isPanelOpened);
		oFF.XCollectionUtils.forEach(this.m_panelStateChangeConsumers, (consumer) => {
			consumer(uiState);
		});
	}
};
oFF.HpSideNavigationDocumentPlugin.prototype.setupPlugin = function(controller)
{
	oFF.HuDfDocumentPlugin.prototype.setupPlugin.call( this , controller);
	this.m_navListItemsMap = oFF.XHashMapByString.create();
	this.m_panelStateChangeConsumers = oFF.XList.create();
	this._observeNotifications();
	return null;
};

oFF.HorizonUiPluginsModule = function() {};
oFF.HorizonUiPluginsModule.prototype = new oFF.DfModule();
oFF.HorizonUiPluginsModule.prototype._ff_c = "HorizonUiPluginsModule";

oFF.HorizonUiPluginsModule.s_module = null;
oFF.HorizonUiPluginsModule.getInstance = function()
{
	if (oFF.isNull(oFF.HorizonUiPluginsModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.CellEngineModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.ContextMenuEngineModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.HorizonUiModule.getInstance());
		oFF.HorizonUiPluginsModule.s_module = oFF.DfModule.startExt(new oFF.HorizonUiPluginsModule());
		oFF.HuPluginRegistry.registerPluginByClass(oFF.XClass.create(oFF.HpTextEditorPlugin));
		oFF.HuPluginRegistry.registerPluginByClass(oFF.XClass.create(oFF.HpSideNavigationDocumentPlugin));
		oFF.HuPluginRegistry.registerPluginByClass(oFF.XClass.create(oFF.HpExpandableListDocumentPlugin));
		oFF.HpSideNavigationI18n.staticSetup();
		oFF.DfModule.stopExt(oFF.HorizonUiPluginsModule.s_module);
	}
	return oFF.HorizonUiPluginsModule.s_module;
};
oFF.HorizonUiPluginsModule.prototype.getName = function()
{
	return "ff3620.horizon.ui.plugins";
};

oFF.HorizonUiPluginsModule.getInstance();

return oFF;
} );
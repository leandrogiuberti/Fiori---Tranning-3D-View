/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff2165.space"
],
function(oFF)
{
"use strict";

oFF.DAppDataProviderEventRedirect = function() {};
oFF.DAppDataProviderEventRedirect.prototype = new oFF.XObject();
oFF.DAppDataProviderEventRedirect.prototype._ff_c = "DAppDataProviderEventRedirect";

oFF.DAppDataProviderEventRedirect.createRedirect = function(dataProvider, notificationCenter)
{
	let obj = new oFF.DAppDataProviderEventRedirect();
	obj.setupRedirect(dataProvider, notificationCenter);
	return obj;
};
oFF.DAppDataProviderEventRedirect.prototype.m_dataProvider = null;
oFF.DAppDataProviderEventRedirect.prototype.m_listenerId = null;
oFF.DAppDataProviderEventRedirect.prototype.m_notificationCenter = null;
oFF.DAppDataProviderEventRedirect.prototype.observeEvents = function()
{
	if (oFF.notNull(this.m_dataProvider))
	{
		let eventing = this.m_dataProvider.getBasicEventing();
		this.m_listenerId = eventing.getListenerForAll().addConsumer(this.onAnyDpEvent.bind(this));
	}
};
oFF.DAppDataProviderEventRedirect.prototype.onAnyDpEvent = function(evt)
{
	let subEvents = evt.getSubEvents();
	oFF.XCollectionUtils.forEach(subEvents, (subEvent) => {
		let notifyData = oFF.XNotificationData.create();
		notifyData.putString(oFF.DataApplicationNotifications.PARAM_DATA_PROVIDER_NAME, this.m_dataProvider.getName());
		notifyData.putString(oFF.DataApplicationNotifications.PARAM_DATA_PROVIDER_EVENT_TYPE, subEvent.getEventType().getName());
		notifyData.putXObject(oFF.DataApplicationNotifications.PARAM_DATA_PROVIDER_EVENT_OBJECT, subEvent);
		this.m_notificationCenter.postNotificationWithName(oFF.DataApplicationNotifications.NOTIFY_DATA_PROVIDER_EVENT_FIRED, notifyData);
	});
};
oFF.DAppDataProviderEventRedirect.prototype.releaseObject = function()
{
	this.unobserveEvents();
	this.m_dataProvider = null;
	this.m_notificationCenter = null;
	this.m_listenerId = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.DAppDataProviderEventRedirect.prototype.setupRedirect = function(dataProvider, notificationCenter)
{
	this.m_dataProvider = dataProvider;
	this.m_notificationCenter = notificationCenter;
	this.observeEvents();
};
oFF.DAppDataProviderEventRedirect.prototype.unobserveEvents = function()
{
	if (oFF.notNull(this.m_dataProvider))
	{
		let eventing = this.m_dataProvider.getBasicEventing();
		eventing.getListenerForAll().removeConsumerByUuid(this.m_listenerId);
		this.m_listenerId = null;
	}
};

oFF.AsDataProviderManager = function() {};
oFF.AsDataProviderManager.prototype = new oFF.XObject();
oFF.AsDataProviderManager.prototype._ff_c = "AsDataProviderManager";

oFF.AsDataProviderManager.createDpManager = function()
{
	let obj = new oFF.AsDataProviderManager();
	obj.setupDpManager();
	return obj;
};
oFF.AsDataProviderManager.prototype.m_dataProviderCreatedListener = null;
oFF.AsDataProviderManager.prototype.m_dataProviderCreationPromises = null;
oFF.AsDataProviderManager.prototype.m_dataProviderReleasedListener = null;
oFF.AsDataProviderManager.prototype.m_dataProviders = null;
oFF.AsDataProviderManager.prototype.m_releasePromise = null;
oFF.AsDataProviderManager.prototype._addDataProvider = function(dataProvider)
{
	if (!this.m_dataProviders.containsKey(dataProvider.getName()))
	{
		this.m_dataProviders.put(dataProvider.getName(), dataProvider);
		this.m_dataProviderCreatedListener.accept(dataProvider);
	}
};
oFF.AsDataProviderManager.prototype.addDataProvider = function(dataProvider)
{
	this._addDataProvider(dataProvider);
};
oFF.AsDataProviderManager.prototype.createDataProvider = function(config)
{
	if (oFF.notNull(this.m_releasePromise) && this.m_releasePromise.getState() === oFF.XPromiseState.PENDING)
	{
		return oFF.XPromise.reject(oFF.XError.create("data provider manager is currently shutting down"));
	}
	let dpName = config.getDataProviderName();
	if (oFF.XStringUtils.isNullOrEmpty(dpName))
	{
		return oFF.XPromise.reject(oFF.XError.create("data provider name cannot be empty"));
	}
	let existingDp = this.m_dataProviders.getByKey(dpName);
	if (oFF.notNull(existingDp))
	{
		return oFF.XPromise.resolve(existingDp);
	}
	let existingPromise = this.m_dataProviderCreationPromises.getByKey(dpName);
	if (oFF.notNull(existingPromise) && existingPromise.getState() === oFF.XPromiseState.PENDING)
	{
		return existingPromise;
	}
	let dpFactory = oFF.DataProviderFactory.getInstance();
	let dpPromise = dpFactory.createDataProviderWithConfig(config);
	this.m_dataProviderCreationPromises.put(dpName, dpPromise);
	dpPromise.onThen((dp) => {
		this.m_dataProviderCreationPromises.remove(dpName);
		this._addDataProvider(dp);
	});
	return dpPromise;
};
oFF.AsDataProviderManager.prototype.createDataProviderConfig = function(process, dataProviderName)
{
	return oFF.DataProviderFactory.getInstance().createDataProviderConfiguration(process, dataProviderName);
};
oFF.AsDataProviderManager.prototype.getDataProvider = function(name)
{
	return this.m_dataProviders.getByKey(name);
};
oFF.AsDataProviderManager.prototype.getDataProviderCreatedListener = function()
{
	return this.m_dataProviderCreatedListener;
};
oFF.AsDataProviderManager.prototype.getDataProviderNames = function()
{
	return this.m_dataProviders.getKeysAsReadOnlyList();
};
oFF.AsDataProviderManager.prototype.getDataProviderReleasingListener = function()
{
	return this.m_dataProviderReleasedListener;
};
oFF.AsDataProviderManager.prototype.hasDataProvider = function(name)
{
	return this.m_dataProviders.containsKey(name);
};
oFF.AsDataProviderManager.prototype.releaseDataProvider = function(name)
{
	if (oFF.notNull(this.m_releasePromise) && this.m_releasePromise.getState() === oFF.XPromiseState.PENDING)
	{
		return oFF.XPromise.resolve(null);
	}
	let dp = this.m_dataProviders.getByKey(name);
	if (oFF.isNull(dp))
	{
		return oFF.XPromise.resolve(null);
	}
	this.m_dataProviderReleasedListener.accept(dp);
	this.m_dataProviders.remove(name);
	return dp.getBasicActions().getBasicLifecycleActions().releaseDataProvider(true);
};
oFF.AsDataProviderManager.prototype.releaseObject = function()
{
	if (oFF.notNull(this.m_releasePromise) && this.m_releasePromise.getState() === oFF.XPromiseState.PENDING)
	{
		return;
	}
	let releasePromises = oFF.XPromiseList.create();
	let it = this.m_dataProviders.getKeysAsIterator();
	while (it.hasNext())
	{
		let dataProviderName = it.next();
		releasePromises.add(this.releaseDataProvider(dataProviderName));
	}
	this.m_releasePromise = oFF.XPromise.all(releasePromises);
	this.m_releasePromise.onFinally(() => {
		this.m_releasePromise = null;
		this.m_dataProviders = oFF.XObjectExt.release(this.m_dataProviders);
		this.m_dataProviderCreatedListener = oFF.XObjectExt.release(this.m_dataProviderCreatedListener);
		this.m_dataProviderReleasedListener = oFF.XObjectExt.release(this.m_dataProviderReleasedListener);
		this.m_dataProviderCreationPromises = oFF.XObjectExt.release(this.m_dataProviderCreationPromises);
		oFF.XObject.prototype.releaseObject.call( this );
	});
};
oFF.AsDataProviderManager.prototype.setupDpManager = function()
{
	this.m_dataProviders = oFF.XHashMapByString.create();
	this.m_dataProviderCreatedListener = oFF.XConsumerCollection.create();
	this.m_dataProviderReleasedListener = oFF.XConsumerCollection.create();
	this.m_dataProviderCreationPromises = oFF.XHashMapByString.create();
};

oFF.AsMenuManager = function() {};
oFF.AsMenuManager.prototype = new oFF.XObject();
oFF.AsMenuManager.prototype._ff_c = "AsMenuManager";

oFF.AsMenuManager.ACTION = "Action";
oFF.AsMenuManager.EXTENSION = "Extension";
oFF.AsMenuManager.ITEMS = "Items";
oFF.AsMenuManager.MENU_ACTIONS = "MenuActions";
oFF.AsMenuManager.MENU_EXTENSIONS = "MenuExtensions";
oFF.AsMenuManager.NAME = "Name";
oFF.AsMenuManager.OPERATION = "Operation";
oFF.AsMenuManager.OPERATION_APPEND_INTO = "AppendInto";
oFF.AsMenuManager.REFERENCE = "Reference";
oFF.AsMenuManager.REFERENCE_ROOT = "$Root";
oFF.AsMenuManager.create = function()
{
	let instance = new oFF.AsMenuManager();
	instance.setup();
	return instance;
};
oFF.AsMenuManager.prototype.m_menuMapper = null;
oFF.AsMenuManager.prototype.m_menuTreeGenerator = null;
oFF.AsMenuManager.prototype.addDataProviderMenuAction = function(itemWrapper)
{
	let menuTreeGenerator = this.getMenuTreeGenerator();
	if (oFF.notNull(menuTreeGenerator))
	{
		let actionStructure = oFF.PrFactory.createStructure();
		actionStructure.putNewList(oFF.AsMenuManager.MENU_ACTIONS).add(itemWrapper);
		menuTreeGenerator.loadPluginConfiguration(itemWrapper.getStringByKey(oFF.AsMenuManager.NAME), actionStructure);
	}
};
oFF.AsMenuManager.prototype.addGlobalMenuItemByActionName = function(actionName)
{
	let menuTreeGenerator = this.getMenuTreeGenerator();
	if (oFF.notNull(menuTreeGenerator))
	{
		let config = oFF.PrFactory.createStructure();
		let extensionStructure = config.putNewList(oFF.AsMenuManager.MENU_EXTENSIONS).addNewStructure().putNewList(oFF.AsMenuManager.EXTENSION).addNewStructure();
		extensionStructure.putString(oFF.AsMenuManager.OPERATION, oFF.AsMenuManager.OPERATION_APPEND_INTO);
		extensionStructure.putString(oFF.AsMenuManager.REFERENCE, oFF.AsMenuManager.REFERENCE_ROOT);
		extensionStructure.putNewList(oFF.AsMenuManager.ITEMS).addNewStructure().putString(oFF.AsMenuManager.ACTION, actionName);
		menuTreeGenerator.loadPluginConfiguration(actionName, config);
	}
};
oFF.AsMenuManager.prototype.addGlobalMenuItemByStructure = function(itemWrapper)
{
	let menuTreeGenerator = this.getMenuTreeGenerator();
	if (oFF.notNull(menuTreeGenerator))
	{
		let menuStructure = oFF.PrFactory.createStructure();
		let extensionStructure = menuStructure.putNewList(oFF.AsMenuManager.MENU_EXTENSIONS).addNewStructure().putNewList(oFF.AsMenuManager.EXTENSION).addNewStructure();
		extensionStructure.putString(oFF.AsMenuManager.OPERATION, oFF.AsMenuManager.OPERATION_APPEND_INTO);
		extensionStructure.putString(oFF.AsMenuManager.REFERENCE, oFF.AsMenuManager.REFERENCE_ROOT);
		extensionStructure.putNewList(oFF.AsMenuManager.ITEMS).add(itemWrapper);
		let actionName = itemWrapper.getStringByKeyExt(oFF.AsMenuManager.NAME, itemWrapper.getStringByKey(oFF.AsMenuManager.ACTION));
		menuTreeGenerator.loadPluginConfiguration(actionName, menuStructure);
	}
};
oFF.AsMenuManager.prototype.attachKeyboardShortcutEvents = function(contextFiller, uiContext)
{
	let menuMapper = this.getMenuMapper();
	if (oFF.notNull(menuMapper))
	{
		menuMapper.registerShortcuts(contextFiller, uiContext);
	}
};
oFF.AsMenuManager.prototype.checkHasMenu = function(contextAccess, resolve)
{
	let menuTreeGenerator = this.getMenuTreeGenerator();
	if (oFF.notNull(menuTreeGenerator))
	{
		menuTreeGenerator.checkMenu(contextAccess.getLocalContext(), contextAccess.getUiContext(), (md) => {
			resolve(oFF.XBooleanValue.create(oFF.notNull(md) && md.hasEffectiveSubItems()));
		});
	}
};
oFF.AsMenuManager.prototype.clearDynamicMenuActionsProviders = function()
{
	let menuTreeGenerator = this.getMenuTreeGenerator();
	if (oFF.notNull(menuTreeGenerator))
	{
		menuTreeGenerator.clearDynamicActionsProviders();
	}
};
oFF.AsMenuManager.prototype.clearWidgetFromCache = function(widget)
{
	let menuMapper = this.getMenuMapper();
	if (oFF.notNull(menuMapper))
	{
		menuMapper.getUiCache().releaseUiItem(widget);
	}
};
oFF.AsMenuManager.prototype.getBaseConfiguration = function()
{
	let menuTreeGenerator = this.getMenuTreeGenerator();
	return oFF.isNull(menuTreeGenerator) ? null : menuTreeGenerator.getConfiguration();
};
oFF.AsMenuManager.prototype.getMenuMapper = function()
{
	if (oFF.isNull(this.m_menuMapper))
	{
		this.m_menuMapper = oFF.AsMenuMapperFactory.createGenericMenuMapper(this.getMenuTreeGenerator());
	}
	return this.m_menuMapper;
};
oFF.AsMenuManager.prototype.getMenuTreeGenerator = function()
{
	if (oFF.isNull(this.m_menuTreeGenerator))
	{
		this.m_menuTreeGenerator = oFF.AsMenuMapperFactory.createMenuTreeGenerator();
	}
	return this.m_menuTreeGenerator;
};
oFF.AsMenuManager.prototype.registerActions = function(wrapper)
{
	let menuTreeGenerator = this.getMenuTreeGenerator();
	if (oFF.notNull(menuTreeGenerator))
	{
		menuTreeGenerator.registerActions(wrapper);
	}
};
oFF.AsMenuManager.prototype.registerDynamicMenuActionsProvider = function(name, actionsProvider)
{
	let menuTreeGenerator = this.getMenuTreeGenerator();
	if (oFF.notNull(menuTreeGenerator))
	{
		menuTreeGenerator.registerDynamicActionsProvider(name, actionsProvider);
	}
};
oFF.AsMenuManager.prototype.registerMenuAction = function(actionKey, action)
{
	let menuTreeGenerator = this.getMenuTreeGenerator();
	if (oFF.notNull(menuTreeGenerator))
	{
		menuTreeGenerator.registerAction(actionKey, action);
	}
};
oFF.AsMenuManager.prototype.releaseObject = function()
{
	this.m_menuMapper = oFF.XObjectExt.release(this.m_menuMapper);
	this.m_menuTreeGenerator = oFF.XObjectExt.release(this.m_menuTreeGenerator);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.AsMenuManager.prototype.retrieveAvailableActions = function()
{
	let menuTreeGenerator = this.getMenuTreeGenerator();
	return oFF.isNull(menuTreeGenerator) ? null : menuTreeGenerator.getRegisteredActions();
};
oFF.AsMenuManager.prototype.setBaseConfiguration = function(configuration)
{
	let menuTreeGenerator = this.getMenuTreeGenerator();
	if (oFF.notNull(menuTreeGenerator))
	{
		menuTreeGenerator.setConfiguration(configuration);
	}
};
oFF.AsMenuManager.prototype.setConfigurationExtension = function(name, extension)
{
	let menuTreeGenerator = this.getMenuTreeGenerator();
	if (oFF.notNull(menuTreeGenerator))
	{
		menuTreeGenerator.loadPluginConfiguration(name, extension);
	}
};
oFF.AsMenuManager.prototype.setup = function()
{
	oFF.XObject.prototype.setup.call( this );
};
oFF.AsMenuManager.prototype.unRegisterDynamicMenuActionsProvider = function(name)
{
	let menuTreeGenerator = this.getMenuTreeGenerator();
	if (oFF.notNull(menuTreeGenerator))
	{
		menuTreeGenerator.unRegisterDynamicActionsProvider(name);
	}
};
oFF.AsMenuManager.prototype.updateMenu = function(genesis, contextAccess, referenceControl, xCoordinate, yCoordinate, actionBeforeOpen, actionAfterClose, resolve)
{
	let menuMapper = this.getMenuMapper();
	if (oFF.notNull(menuMapper))
	{
		let biconsumer = (md, menu) => {
			let success = oFF.notNull(md) && md.hasEffectiveSubItems() && oFF.notNull(menu);
			if (success)
			{
				if (oFF.notNull(actionBeforeOpen))
				{
					actionBeforeOpen(menu);
				}
				menuMapper.registerMenuClose(menu, actionAfterClose);
				menuMapper.openMenu(menu, referenceControl, xCoordinate, yCoordinate);
			}
			if (oFF.notNull(resolve))
			{
				resolve(oFF.XBooleanValue.create(success));
			}
		};
		menuMapper.createContextMenu(genesis, contextAccess.getLocalContext(), contextAccess.getUiContext(), biconsumer);
	}
};
oFF.AsMenuManager.prototype.updateToolbar = function(contextAccess, toolbarMenu)
{
	let menuMapper = this.getMenuMapper();
	if (oFF.notNull(menuMapper))
	{
		menuMapper.populateToolbar(toolbarMenu, contextAccess.getLocalContext(), contextAccess.getUiContext());
	}
};

oFF.AsContent = function() {};
oFF.AsContent.prototype = new oFF.XObject();
oFF.AsContent.prototype._ff_c = "AsContent";

oFF.AsContent.createEmptySpaceContent = function()
{
	let root = oFF.PrFactory.createStructure();
	let content = oFF.XContent.createJsonObjectContent(oFF.AsContentType.AGGREGATION, root);
	return oFF.AsContent.createSpaceContent(content);
};
oFF.AsContent.createSpaceContent = function(content)
{
	if (!content.getContentType().isTypeOf(oFF.ContentType.JSON))
	{
		let message = oFF.XStringUtils.concatenate2("unexpected content type: ", content.getContentType().getName());
		throw oFF.XException.createIllegalArgumentException(message);
	}
	let obj = new oFF.AsContent();
	obj.setupContent(content);
	return obj;
};
oFF.AsContent.prototype.m_content = null;
oFF.AsContent.prototype.getContent = function()
{
	return this.m_content;
};
oFF.AsContent.prototype.getSubSection = function(name)
{
	let jsonContent = this.m_content.getJsonContent();
	return jsonContent.asStructure().getByKey(name);
};
oFF.AsContent.prototype.releaseObject = function()
{
	this.m_content = oFF.XObjectExt.release(this.m_content);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.AsContent.prototype.setSubSection = function(name, element)
{
	let jsonContent = this.m_content.getJsonContent();
	jsonContent.asStructure().put(name, element);
};
oFF.AsContent.prototype.setupContent = function(content)
{
	this.m_content = content;
};

oFF.DataApplication = function() {};
oFF.DataApplication.prototype = new oFF.XObject();
oFF.DataApplication.prototype._ff_c = "DataApplication";

oFF.DataApplication.prototype.m_configManager = null;
oFF.DataApplication.prototype.m_dataProviderManager = null;
oFF.DataApplication.prototype.m_legacyApplication = null;
oFF.DataApplication.prototype.m_menuManager = null;
oFF.DataApplication.prototype.m_notificationCenter = null;
oFF.DataApplication.prototype.m_process = null;
oFF.DataApplication.prototype._generateSinglePluginStartupConfig = function(pluginName, pluginConfigStruct, commandPluginList)
{
	let startupConfigStruct = oFF.PrFactory.createStructure();
	startupConfigStruct.putNewStructure("configuration");
	startupConfigStruct.putNewList("toolbar");
	if (oFF.XCollectionUtils.hasElements(commandPluginList))
	{
		startupConfigStruct.put("commands", commandPluginList);
	}
	else
	{
		startupConfigStruct.putNewList("commands");
	}
	let layoutStruct = startupConfigStruct.putNewStructure("layout");
	layoutStruct.putString("type", "SinglePlugin");
	let pluginsList = startupConfigStruct.putNewList("plugins");
	let pluginToStartStruct = pluginsList.addNewStructure();
	pluginToStartStruct.putString("plugin", pluginName);
	if (oFF.XCollectionUtils.hasElements(pluginConfigStruct))
	{
		pluginToStartStruct.put("config", pluginConfigStruct);
	}
	else
	{
		pluginToStartStruct.putNewStructure("config");
	}
	return startupConfigStruct;
};
oFF.DataApplication.prototype.addDataProvider = function(dataProvider)
{
	this.m_dataProviderManager.addDataProvider(dataProvider);
};
oFF.DataApplication.prototype.clearClientInfo = function()
{
	this.getLegacyApplication().clearClientInfo();
};
oFF.DataApplication.prototype.createNextInstanceId = function()
{
	return this.getLegacyApplication().createNextInstanceId();
};
oFF.DataApplication.prototype.getApplicationId = function()
{
	return this.getLegacyApplication().getApplicationId();
};
oFF.DataApplication.prototype.getApplicationName = function()
{
	return this.getLegacyApplication().getApplicationName();
};
oFF.DataApplication.prototype.getBindingManager = function()
{
	return this.getLegacyApplication().getBindingManager();
};
oFF.DataApplication.prototype.getClientComponent = function()
{
	return this.getLegacyApplication().getClientComponent();
};
oFF.DataApplication.prototype.getClientIdentifier = function()
{
	return this.getLegacyApplication().getClientIdentifier();
};
oFF.DataApplication.prototype.getClientInfo = function()
{
	return this.getLegacyApplication().getClientInfo();
};
oFF.DataApplication.prototype.getClientVersion = function()
{
	return this.getLegacyApplication().getClientVersion();
};
oFF.DataApplication.prototype.getConfigManager = function()
{
	return this.m_configManager;
};
oFF.DataApplication.prototype.getConnection = function(systemName)
{
	return this.getLegacyApplication().getConnection(systemName);
};
oFF.DataApplication.prototype.getConnectionPool = function()
{
	return this.getLegacyApplication().getConnectionPool();
};
oFF.DataApplication.prototype.getDataProviderManager = function()
{
	return this.m_dataProviderManager;
};
oFF.DataApplication.prototype.getDataProviders = function()
{
	return this.getLegacyApplication().getDataProviders();
};
oFF.DataApplication.prototype.getDefaultSyncType = function()
{
	return this.getLegacyApplication().getDefaultSyncType();
};
oFF.DataApplication.prototype.getDocument = function(name, type)
{
	return this.getLegacyApplication().getDocument(name, type);
};
oFF.DataApplication.prototype.getErrorManager = function()
{
	return this.getLegacyApplication().getErrorManager();
};
oFF.DataApplication.prototype.getHttpExchangeEnhancer = function()
{
	return this.getLegacyApplication().getHttpExchangeEnhancer();
};
oFF.DataApplication.prototype.getLanguageLocale = function()
{
	return this.getLegacyApplication().getLanguageLocale();
};
oFF.DataApplication.prototype.getLegacyApplication = function()
{
	if (oFF.isNull(this.m_legacyApplication))
	{
		let application = this.m_process.getApplication();
		if (oFF.notNull(application))
		{
			this.m_legacyApplication = application;
		}
		else
		{
			this.m_legacyApplication = oFF.ApplicationFactory.createApplication(this.m_process);
		}
	}
	return this.m_legacyApplication;
};
oFF.DataApplication.prototype.getMenuManager = function()
{
	return this.m_menuManager;
};
oFF.DataApplication.prototype.getNotificationCenter = function()
{
	return this.m_notificationCenter;
};
oFF.DataApplication.prototype.getOlapEnvironment = function()
{
	return this.getLegacyApplication().getOlapEnvironment();
};
oFF.DataApplication.prototype.getProcess = function()
{
	return this.m_process;
};
oFF.DataApplication.prototype.getProcessEntityType = function()
{
	return oFF.ProcessEntity.DATA_APPLICATION;
};
oFF.DataApplication.prototype.getRepositoryManager = function()
{
	return this.getLegacyApplication().getRepositoryManager();
};
oFF.DataApplication.prototype.getServices = function(serviceType)
{
	return this.getLegacyApplication().getServices(serviceType);
};
oFF.DataApplication.prototype.getSession = function()
{
	return this.m_process;
};
oFF.DataApplication.prototype.getStoryId = function()
{
	return this.getLegacyApplication().getStoryId();
};
oFF.DataApplication.prototype.getStoryName = function()
{
	return this.getLegacyApplication().getStoryName();
};
oFF.DataApplication.prototype.getSyncManager = function()
{
	return this.getLegacyApplication().getSyncManager();
};
oFF.DataApplication.prototype.getSystemConnect = function(systemName)
{
	return this.getLegacyApplication().getSystemConnect(systemName);
};
oFF.DataApplication.prototype.getSystemLandscape = function()
{
	return this.getLegacyApplication().getSystemLandscape();
};
oFF.DataApplication.prototype.getUiManager = function()
{
	return this.getLegacyApplication().getUiManager();
};
oFF.DataApplication.prototype.getUiManagerExt = function(createIfNotExist)
{
	return this.getLegacyApplication().getUiManagerExt(createIfNotExist);
};
oFF.DataApplication.prototype.getUndoManager = function()
{
	return this.getLegacyApplication().getUndoManager();
};
oFF.DataApplication.prototype.getUserManager = function()
{
	return this.getLegacyApplication().getUserManager();
};
oFF.DataApplication.prototype.getWidgetId = function()
{
	return this.getLegacyApplication().getWidgetId();
};
oFF.DataApplication.prototype.getXVersion = function()
{
	return this.getLegacyApplication().getXVersion();
};
oFF.DataApplication.prototype.isSapStatisticsEnabled = function()
{
	return this.getLegacyApplication().isSapStatisticsEnabled();
};
oFF.DataApplication.prototype.newSubApplication = function(process)
{
	return this.newSubApplicationWithId(process, null);
};
oFF.DataApplication.prototype.newSubApplicationWithId = function(process, subApplicationId)
{
	return this.getLegacyApplication().newSubApplicationWithId(process, subApplicationId);
};
oFF.DataApplication.prototype.onDataProviderCreated = function(dataProvider)
{
	oFF.DAppDataProviderEventRedirect.createRedirect(dataProvider, this.m_notificationCenter);
	let notificationData = oFF.XNotificationData.create();
	notificationData.putString(oFF.DataApplicationNotifications.PARAM_DATA_PROVIDER_NAME, dataProvider.getName());
	this.m_notificationCenter.postNotificationWithName(oFF.DataApplicationNotifications.NOTIFY_DATA_PROVIDER_CREATED, notificationData);
};
oFF.DataApplication.prototype.onDataProviderReleased = function(dataProvider)
{
	let notificationData = oFF.XNotificationData.create();
	notificationData.putString(oFF.DataApplicationNotifications.PARAM_DATA_PROVIDER_NAME, dataProvider.getName());
	this.m_notificationCenter.postNotificationWithName(oFF.DataApplicationNotifications.NOTIFY_DATA_PROVIDER_RELEASED, notificationData);
};
oFF.DataApplication.prototype.processBooting = function(syncType, listener, customIdentifier)
{
	return this.getLegacyApplication().processBooting(syncType, listener, customIdentifier);
};
oFF.DataApplication.prototype.registerDataProvider = function(dataProvider)
{
	this.getLegacyApplication().registerDataProvider(dataProvider);
};
oFF.DataApplication.prototype.registerService = function(service)
{
	this.getLegacyApplication().registerService(service);
};
oFF.DataApplication.prototype.releaseObject = function()
{
	this.m_dataProviderManager = oFF.XObjectExt.release(this.m_dataProviderManager);
	this.m_legacyApplication = oFF.XObjectExt.release(this.m_legacyApplication);
	this.m_notificationCenter = oFF.XObjectExt.release(this.m_notificationCenter);
	this.m_configManager = oFF.XObjectExt.release(this.m_configManager);
	if (oFF.notNull(this.m_process))
	{
		let processBase = this.getProcess();
		processBase.removeProcessEntity(oFF.ProcessEntity.APPLICATION);
		processBase.removeProcessEntity(oFF.ProcessEntity.DATA_APPLICATION);
	}
	this.m_process = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.DataApplication.prototype.runChartPlugin = function(config, anchor)
{
	return this.runPlugin(oFF.PluginConstants.VISUALIZATION_RENDERER_DOCUMENT_PLUGIN_NAME, config, anchor);
};
oFF.DataApplication.prototype.runPlugin = function(name, config, anchor)
{
	let jsonParser = oFF.JsonParserFactory.newInstance();
	let output = jsonParser.convertFromNative(config);
	let pluginConfigStruct = oFF.notNull(output) ? output.asStructure() : null;
	let commandPluginList = oFF.PrFactory.createList();
	commandPluginList.addString(oFF.PluginConstants.DATA_PROVIDER_COMMAND_PLUGIN_NAME);
	let startupConfigStruct = this._generateSinglePluginStartupConfig(name, pluginConfigStruct, commandPluginList);
	let runner = oFF.ProgramRunner.createRunner(this.getProcess(), oFF.ProgramConstants.HORIZON_PROGRAM_NAME);
	runner.setContainerType(oFF.ProgramContainerType.STANDALONE);
	runner.setConfigStructure(startupConfigStruct);
	runner.setStringArgument(oFF.PluginConstants.PARAM_CONFIG, oFF.PrUtils.serialize(startupConfigStruct, false, false, 0));
	runner.setNativeAnchorObject(anchor);
	runner.setBooleanArgument("showSplashScreen", false);
	return runner.runProgram().onThenExt((prg) => {
		return null;
	});
};
oFF.DataApplication.prototype.runProgram = function(name, programArgumentJson)
{
	let jsonParser = oFF.JsonParserFactory.newInstance();
	let output = jsonParser.convertFromNative(programArgumentJson);
	let programArgs = oFF.notNull(output) ? output.asStructure() : null;
	let runner = oFF.ProgramRunner.createRunner(this.getProcess(), name);
	runner.setAllArguments(programArgs);
	return runner.runProgram().onThenExt((prg) => {
		return null;
	});
};
oFF.DataApplication.prototype.setApplicationName = function(name)
{
	this.getLegacyApplication().setApplicationName(name);
};
oFF.DataApplication.prototype.setClientInfo = function(version, identifier, component)
{
	this.getLegacyApplication().setClientInfo(version, identifier, component);
};
oFF.DataApplication.prototype.setDefaultSyncType = function(syncType)
{
	this.getLegacyApplication().setDefaultSyncType(syncType);
};
oFF.DataApplication.prototype.setErrorManager = function(errorManager)
{
	this.getLegacyApplication().setErrorManager(errorManager);
};
oFF.DataApplication.prototype.setLanguageLocale = function(languageLocale)
{
	this.getLegacyApplication().setLanguageLocale(languageLocale);
};
oFF.DataApplication.prototype.setSapStatisticsEnabled = function(enabled)
{
	this.getLegacyApplication().setSapStatisticsEnabled(enabled);
};
oFF.DataApplication.prototype.setStoryId = function(storyId)
{
	this.getLegacyApplication().setStoryId(storyId);
};
oFF.DataApplication.prototype.setStoryName = function(storyName)
{
	this.getLegacyApplication().setStoryName(storyName);
};
oFF.DataApplication.prototype.setSystemLandscape = function(systemLandscape)
{
	this.getLegacyApplication().setSystemLandscape(systemLandscape);
};
oFF.DataApplication.prototype.setUiManager = function(uiManager)
{
	this.getLegacyApplication().setUiManager(uiManager);
};
oFF.DataApplication.prototype.setWidgetId = function(widgetId)
{
	this.getLegacyApplication().setWidgetId(widgetId);
};
oFF.DataApplication.prototype.setupDataApplication = function(process)
{
	this.m_process = process;
	this.m_notificationCenter = oFF.XNotificationCenter.create();
	this.m_dataProviderManager = oFF.AsDataProviderManager.createDpManager();
	this.m_configManager = oFF.AsConfigManager.create(process);
	this.m_menuManager = oFF.AsMenuManager.create();
	this.m_dataProviderManager.getDataProviderCreatedListener().addConsumer(this.onDataProviderCreated.bind(this));
	this.m_dataProviderManager.getDataProviderReleasingListener().addConsumer(this.onDataProviderReleased.bind(this));
	return this.m_configManager.preloadConfigurations(this).onThenExt((result) => {
		process.setEntity(oFF.ProcessEntity.DATA_APPLICATION, this);
		return null;
	});
};
oFF.DataApplication.prototype.setupEntity = function(process)
{
	return this.setupDataApplication(process);
};
oFF.DataApplication.prototype.unregisterDataProvider = function(dataProvider)
{
	this.getLegacyApplication().unregisterDataProvider(dataProvider);
};
oFF.DataApplication.prototype.unregisterService = function(service)
{
	this.getLegacyApplication().unregisterService(service);
};
oFF.DataApplication.prototype.unregisterSubApplication = function(subApplication)
{
	this.getLegacyApplication().unregisterSubApplication(subApplication);
};

oFF.AsConfigManager = function() {};
oFF.AsConfigManager.prototype = new oFF.DfProcessContext();
oFF.AsConfigManager.prototype._ff_c = "AsConfigManager";

oFF.AsConfigManager.create = function(process)
{
	let newInstance = new oFF.AsConfigManager();
	newInstance._setupWithProcess(process);
	return newInstance;
};
oFF.AsConfigManager.createFallback = function()
{
	let newInstance = new oFF.AsConfigManager();
	newInstance.setupFallback();
	return newInstance;
};
oFF.AsConfigManager.prototype.m_configurationManager = null;
oFF.AsConfigManager.prototype.m_loadedConfigurations = null;
oFF.AsConfigManager.prototype._setupWithProcess = function(process)
{
	this.setupProcessContext(process);
	this.m_loadedConfigurations = oFF.XHashMapByString.create();
	this.m_configurationManager = oFF.CoConfigurationManager.create(process);
	if (this.getProcess() === null)
	{
		throw oFF.XException.createException("[ConfigurationManager] Missing process! A process is required when creating a configuration manager!");
	}
};
oFF.AsConfigManager.prototype.applySessionConfig = function(application)
{
	let featureConfig = this.getFeatureConfig();
	if (oFF.notNull(featureConfig))
	{
		let xVersion = featureConfig.getIntegerByKey(oFF.CoGlobalConfigurationUtils.X_VERSION);
		let session = application.getSession();
		if (xVersion > -1)
		{
			session.setXVersion(xVersion);
		}
		oFF.XCollectionUtils.forEach(featureConfig.getListByKey(oFF.CoGlobalConfigurationUtils.FEATURE_TOGGLES_ENABLE), (fta) => {
			session.activateFeatureToggleByName(oFF.XValueUtil.getString(fta));
		});
		oFF.XCollectionUtils.forEach(featureConfig.getListByKey(oFF.CoGlobalConfigurationUtils.FEATURE_TOGGLES_DISABLE), (ftd) => {
			session.deactivateFeatureToggleByName(oFF.XValueUtil.getString(ftd));
		});
	}
};
oFF.AsConfigManager.prototype.getChartConfig = function()
{
	return this.getLoadedConfigurationForName(oFF.CoChartDefaultConfigurationUtils.CONFIGURATION_NAME).orElse(null);
};
oFF.AsConfigManager.prototype.getConfigurationPromise = function(configurationName, mappingEntity)
{
	return this.m_configurationManager.getResolvedConfigurationForName(configurationName).onThenExt((config) => {
		let augmentedConfig = oFF.CoConfigurationUtils.mapConfigurationPropertiesFromParentProcesses(config, this.getProcess());
		this.m_loadedConfigurations.put(configurationName, augmentedConfig);
		if (oFF.notNull(mappingEntity))
		{
			mappingEntity.putConfigurationMapping(configurationName, augmentedConfig);
		}
		return oFF.XBooleanValue.create(true);
	});
};
oFF.AsConfigManager.prototype.getFeatureConfig = function()
{
	return this.getLoadedConfigurationForName(oFF.CoGlobalConfigurationUtils.CONFIGURATION_NAME).orElse(null);
};
oFF.AsConfigManager.prototype.getLoadedConfiguration = function()
{
	return this.getLoadedConfigurationForName(oFF.CoConfigurationConstants.DEFAULT_CONFIG_FILE_NAME);
};
oFF.AsConfigManager.prototype.getLoadedConfigurationForName = function(configurationName)
{
	let result;
	if (this.m_loadedConfigurations.containsKey(configurationName))
	{
		result = oFF.XOptional.of(this.m_loadedConfigurations.getByKey(configurationName));
	}
	else
	{
		result = oFF.XOptional.empty();
	}
	return result;
};
oFF.AsConfigManager.prototype.loadConfiguration = function()
{
	return this.loadConfigurationForName(oFF.CoConfigurationConstants.DEFAULT_CONFIG_FILE_NAME);
};
oFF.AsConfigManager.prototype.loadConfigurationForName = function(configurationName)
{
	let result;
	if (this.m_loadedConfigurations.containsKey(configurationName))
	{
		result = oFF.XPromise.resolve(oFF.XBooleanValue.create(true));
	}
	else
	{
		result = this.m_configurationManager.getResolvedConfigurationForName(configurationName).onThenExt((config) => {
			this.m_loadedConfigurations.put(configurationName, config);
			return oFF.XBooleanValue.create(true);
		});
	}
	return result;
};
oFF.AsConfigManager.prototype.loadFallBackConfiguration = function(configurationName)
{
	this.m_loadedConfigurations.put(configurationName, oFF.CoConfigurationUtils.getFallbackConfigurationForName(configurationName));
};
oFF.AsConfigManager.prototype.preloadConfigurations = function(application)
{
	if (oFF.isNull(application))
	{
		return oFF.XPromise.resolve(oFF.XBooleanValue.create(true));
	}
	else
	{
		let mappingEntity = this.getProcess().getEntity(oFF.ProcessEntity.CONFIGURATION_MAPPING);
		let promise = this.preloadConfigurationsInternal(application, mappingEntity);
		if (oFF.notNull(mappingEntity))
		{
			let listToCheck = oFF.XList.create();
			this.getLoadedConfigurationForName(oFF.CoGlobalConfigurationUtils.CONFIGURATION_NAME).ifPresent((g) => {
				listToCheck.add(g);
			});
			this.getLoadedConfigurationForName(oFF.CoChartDefaultConfigurationUtils.CONFIGURATION_NAME).ifPresent((c) => {
				listToCheck.add(c);
			});
			this.getLoadedConfigurationForName(oFF.CoFormulaEditorConfigurationUtils.CONFIGURATION_NAME).ifPresent((f) => {
				listToCheck.add(f);
			});
			mappingEntity.setFinalizeConfigHook(listToCheck, () => {
				return this.preloadConfigurationsInternal(application, mappingEntity);
			});
		}
		return promise;
	}
};
oFF.AsConfigManager.prototype.preloadConfigurationsInternal = function(application, mappingEntity)
{
	let configurationPreloadPromises = oFF.XPromiseList.create();
	configurationPreloadPromises.add(this.getConfigurationPromise(oFF.CoGlobalConfigurationUtils.CONFIGURATION_NAME, mappingEntity));
	configurationPreloadPromises.add(this.getConfigurationPromise(oFF.CoChartDefaultConfigurationUtils.CONFIGURATION_NAME, mappingEntity));
	configurationPreloadPromises.add(this.getConfigurationPromise(oFF.CoFormulaEditorConfigurationUtils.CONFIGURATION_NAME, mappingEntity));
	let allConfigurationPreloadPromise = oFF.XPromise.allSettled(configurationPreloadPromises);
	return allConfigurationPreloadPromise.onThenExt((res) => {
		this.applySessionConfig(application);
		return oFF.XBooleanValue.create(true);
	});
};
oFF.AsConfigManager.prototype.putConfiguration = function(configStructure)
{
	this.putConfigurationForName(oFF.CoConfigurationConstants.DEFAULT_CONFIG_FILE_NAME, configStructure);
};
oFF.AsConfigManager.prototype.putConfigurationForName = function(configurationName, configStructure)
{
	let configurationMetadata = oFF.CoConfigurationRegistry.getConfigurationMetadata(configurationName);
	let configuration = oFF.CoConfiguration.create(configurationMetadata, configStructure, this.getProcess());
	this.m_loadedConfigurations.put(configurationName, configuration);
};
oFF.AsConfigManager.prototype.releaseObject = function()
{
	this.m_loadedConfigurations = oFF.XObjectExt.release(this.m_loadedConfigurations);
	this.m_configurationManager = oFF.XObjectExt.release(this.m_configurationManager);
	oFF.DfProcessContext.prototype.releaseObject.call( this );
};
oFF.AsConfigManager.prototype.setupFallback = function()
{
	this.m_loadedConfigurations = oFF.XHashMapByString.create();
	this.loadFallBackConfiguration(oFF.CoGlobalConfigurationUtils.CONFIGURATION_NAME);
	this.loadFallBackConfiguration(oFF.CoChartDefaultConfigurationUtils.CONFIGURATION_NAME);
	this.loadFallBackConfiguration(oFF.CoFormulaEditorConfigurationUtils.CONFIGURATION_NAME);
};

oFF.AsContentManager = function() {};
oFF.AsContentManager.prototype = new oFF.DfProcessContext();
oFF.AsContentManager.prototype._ff_c = "AsContentManager";

oFF.AsContentManager.createContentManager = function(process)
{
	let obj = new oFF.AsContentManager();
	obj.setupMgr(process);
	return obj;
};
oFF.AsContentManager.prototype.m_loadedContent = null;
oFF.AsContentManager.prototype.m_loadingPromises = null;
oFF.AsContentManager.prototype.m_savingPromises = null;
oFF.AsContentManager.prototype.createEmptyContent = function()
{
	return oFF.AsContent.createEmptySpaceContent();
};
oFF.AsContentManager.prototype.loadContent = function(uri)
{
	let url = uri.getUrl();
	let savingPromise = this.m_savingPromises.getByKey(url);
	if (oFF.notNull(savingPromise) && savingPromise.getState() === oFF.XPromiseState.PENDING)
	{
		return savingPromise.onThenExt((empty) => {
			return this.m_loadedContent.getByKey(url);
		});
	}
	let oldLoadingPromise = this.m_loadingPromises.getByKey(url);
	if (oFF.notNull(oldLoadingPromise) && oldLoadingPromise.getState() === oFF.XPromiseState.PENDING)
	{
		return oldLoadingPromise;
	}
	let loadedContent = this.m_loadedContent.getByKey(url);
	if (oFF.notNull(loadedContent))
	{
		return oFF.XPromise.resolve(loadedContent);
	}
	let file = oFF.XFile.createByUri(this.getProcess(), uri);
	let newLoadingPromise = oFF.XFilePromise.loadContent(file).onThenExt((content) => {
		let spaceContent = oFF.AsContent.createSpaceContent(content);
		this.m_loadedContent.put(url, spaceContent);
		this.m_loadingPromises.remove(url);
		return spaceContent;
	});
	this.m_loadingPromises.put(url, newLoadingPromise);
	return newLoadingPromise;
};
oFF.AsContentManager.prototype.releaseObject = function()
{
	this.m_loadedContent = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_loadedContent);
	this.m_loadingPromises = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_loadingPromises);
	this.m_savingPromises = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_savingPromises);
	oFF.DfProcessContext.prototype.releaseObject.call( this );
};
oFF.AsContentManager.prototype.saveContent = function(uri, content)
{
	let url = uri.getUrl();
	let loadingPromise = this.m_loadingPromises.getByKey(url);
	if (oFF.notNull(loadingPromise) && loadingPromise.getState() === oFF.XPromiseState.PENDING)
	{
		let message = oFF.XStringUtils.concatenate2("cannot save content while it's loading: ", url);
		return oFF.XPromise.reject(oFF.XError.create(message));
	}
	let oldSavingPromise = this.m_savingPromises.getByKey(url);
	if (oFF.notNull(oldSavingPromise) && oldSavingPromise.getState() === oFF.XPromiseState.PENDING)
	{
		let message = oFF.XStringUtils.concatenate2("cannot save content while it's saving: ", url);
		return oFF.XPromise.reject(oFF.XError.create(message));
	}
	let file = oFF.XFile.createByUri(this.getProcess(), uri);
	let fileContent = content.getContent();
	let savePromise = oFF.XFilePromise.saveContent(file, fileContent).onThenExt((result) => {
		this.m_loadedContent.put(url, content);
		this.m_savingPromises.remove(url);
		return null;
	});
	this.m_savingPromises.put(url, savePromise);
	return savePromise;
};
oFF.AsContentManager.prototype.setupMgr = function(process)
{
	this.setupProcessContext(process);
	this.m_loadedContent = oFF.XHashMapByString.create();
	this.m_loadingPromises = oFF.XHashMapByString.create();
	this.m_savingPromises = oFF.XHashMapByString.create();
};

oFF.SpaceImplModule = function() {};
oFF.SpaceImplModule.prototype = new oFF.DfModule();
oFF.SpaceImplModule.prototype._ff_c = "SpaceImplModule";

oFF.SpaceImplModule.s_module = null;
oFF.SpaceImplModule.getInstance = function()
{
	if (oFF.isNull(oFF.SpaceImplModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.SpaceModule.getInstance());
		oFF.SpaceImplModule.s_module = oFF.DfModule.startExt(new oFF.SpaceImplModule());
		oFF.ProcessEntityRegistry.registerEntityFactory(oFF.XClass.create(oFF.DataApplication));
		oFF.DfModule.stopExt(oFF.SpaceImplModule.s_module);
	}
	return oFF.SpaceImplModule.s_module;
};
oFF.SpaceImplModule.prototype.getName = function()
{
	return "ff2166.space.impl";
};

oFF.SpaceImplModule.getInstance();

return oFF;
} );
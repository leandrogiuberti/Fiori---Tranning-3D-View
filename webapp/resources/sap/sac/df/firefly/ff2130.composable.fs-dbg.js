/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff2100.runtime"
],
function(oFF)
{
"use strict";

oFF.ComposableConstants = {

	CHILD_RESOURCES_KEY:"childResources",
	CONTENT_KEY:"content",
	CONTENT_TYPE_KEY:"contentType",
	DEFAULT_VFS_URI:"fscomposable://EHS_CS_/composable-service/api/v1/vfs",
	DESCENDANTS_KEY:"descendants",
	FILE:"File",
	FIREFLY_COMPOSABLE_VFS_SERVICE_URL:"ff_composable_vfs_service_url",
	FOLDER:"Folder",
	IS_DIRECTORY_KEY:"isDirectory",
	LIST_DESCENDANTS_KEY:"listDescendants",
	METADATA_KEY:"metadata",
	RESOURCE_KEY:"resource",
	RESOURCE_NAME_KEY:"resourceName"
};

oFF.ComposableFileRequestListener = function() {};
oFF.ComposableFileRequestListener.prototype = new oFF.XObject();
oFF.ComposableFileRequestListener.prototype._ff_c = "ComposableFileRequestListener";

oFF.ComposableFileRequestListener.create = function(callback)
{
	let listener = new oFF.ComposableFileRequestListener();
	listener.m_callback = callback;
	return listener;
};
oFF.ComposableFileRequestListener.prototype.m_callback = null;
oFF.ComposableFileRequestListener.prototype.onHttpFileProcessed = function(extResult, data, customIdentifier)
{
	this.m_callback(extResult);
};

oFF.ComposableFileUtil = {

	addCommonMetaData:function(objectMetadata)
	{
			objectMetadata.putBoolean(oFF.XFileAttribute.IS_HIDDEN, false);
		objectMetadata.putBoolean(oFF.XFileAttribute.IS_EXECUTABLE, false);
		objectMetadata.putBoolean(oFF.XFileAttribute.SUPPORTS_CARTESIAN_FILTER, false);
		objectMetadata.putBoolean(oFF.XFileAttribute.SUPPORTS_SEARCH, true);
		objectMetadata.putBoolean(oFF.XFileAttribute.SUPPORTS_OFFSET, true);
		objectMetadata.putBoolean(oFF.XFileAttribute.SUPPORTS_MAX_ITEMS, true);
		objectMetadata.putBoolean(oFF.XFileAttribute.SUPPORTS_SINGLE_SORT, true);
	},
	addComposableAttributes:function(fileAttributes, response)
	{
			fileAttributes.putString(oFF.XFileAttribute.FOLDER_ID, response.getStringByKey("resourceId"));
		fileAttributes.putLong(oFF.XFileAttribute.CREATED_AT, response.getLongByKeyExt("createdAt", 0));
		fileAttributes.putString(oFF.XFileAttribute.CREATED_BY, response.getStringByKey("createdBy"));
		fileAttributes.putLong(oFF.XFileAttribute.CHANGED_AT, response.getLongByKeyExt("modifiedAt", 0));
		fileAttributes.putString(oFF.XFileAttribute.CHANGED_BY, response.getStringByKey("modifiedBy"));
	}
};

oFF.ComposableFile = function() {};
oFF.ComposableFile.prototype = new oFF.DfXFileProvider();
oFF.ComposableFile.prototype._ff_c = "ComposableFile";

oFF.ComposableFile.create = function(process, fileSystem, uri)
{
	let file = new oFF.ComposableFile();
	file.setupFile(process, fileSystem, uri);
	let isRootDirectory = oFF.XString.isEqual(fileSystem.getRootDirectoryUri().getPath(), uri.getPath());
	if (isRootDirectory)
	{
		file.getProviderAttributes().putString(oFF.XFileAttribute.NODE_TYPE, "Folder");
	}
	file.setProviderIsExisting(true);
	fileSystem.getFileCache().put(file.getUri().getPathContainer().getPath(), file);
	return file;
};
oFF.ComposableFile.prototype.getComposableFileSystem = function()
{
	return this.m_fs;
};
oFF.ComposableFile.prototype.getProviderMetadataAndAttributes = function()
{
	let providerMetadata = this.getProviderMetadata();
	let combined = oFF.PrFactory.createStructure();
	combined.putAll(providerMetadata);
	combined.putAll(this.getProviderAttributes());
	return combined;
};
oFF.ComposableFile.prototype.processProviderDelete = function(syncType, listener, customIdentifier)
{
	return this.getComposableFileSystem().processDelete(syncType, this, listener, customIdentifier);
};
oFF.ComposableFile.prototype.processProviderDeleteRecursive = function(syncType, listener, customIdentifier, includeStartDir)
{
	return this.getComposableFileSystem().processDelete(syncType, this, listener, customIdentifier);
};
oFF.ComposableFile.prototype.processProviderFetchChildren = function(syncType, listener, customIdentifier, config)
{
	return this.getComposableFileSystem().processFetchChildren(syncType, this, listener, customIdentifier, config);
};
oFF.ComposableFile.prototype.processProviderFetchMetadata = function(syncType, listener, customIdentifier, cachingType)
{
	return this.getComposableFileSystem().processFetchMetadata(syncType, this, listener, customIdentifier);
};
oFF.ComposableFile.prototype.processProviderIsExisting = function(syncType, listener, customIdentifier)
{
	return this.getComposableFileSystem().processIsExisting(syncType, this, listener, customIdentifier);
};
oFF.ComposableFile.prototype.processProviderLoad = function(syncType, listener, customIdentifier, compression)
{
	return this.getComposableFileSystem().processLoad(syncType, this, listener, customIdentifier, compression);
};
oFF.ComposableFile.prototype.processProviderMkdir = function(syncType, listener, customIdentifier, includeParentDirs, attributes)
{
	return this.getComposableFileSystem().processMkdir(syncType, this, listener, customIdentifier, includeParentDirs, attributes);
};
oFF.ComposableFile.prototype.processProviderRename = function(syncType, listener, customIdentifier, targetName)
{
	return this.getComposableFileSystem().processRename(syncType, this, listener, customIdentifier, targetName);
};
oFF.ComposableFile.prototype.processProviderSave = function(syncType, listener, customIdentifier, content, compression, attributes, saveMode)
{
	return this.getComposableFileSystem().processSave(syncType, this, listener, customIdentifier, content, compression, attributes, saveMode);
};
oFF.ComposableFile.prototype.setInternalMetadataAndAttributes = function(resource)
{
	let isDir = resource.getBooleanByKey(oFF.ComposableConstants.IS_DIRECTORY_KEY);
	let fileMetadata = oFF.PrFactory.createStructure();
	oFF.ComposableFileUtil.addCommonMetaData(fileMetadata);
	fileMetadata.putString(oFF.XFileAttribute.DISPLAY_NAME, resource.getStringByKey(oFF.ComposableConstants.RESOURCE_NAME_KEY));
	fileMetadata.putBoolean(oFF.XFileAttribute.IS_DIRECTORY, isDir);
	fileMetadata.putBoolean(oFF.XFileAttribute.IS_FILE, !isDir);
	fileMetadata.putString(oFF.XFileAttribute.FILE_TYPE, isDir ? oFF.XFileType.DIR.getName() : oFF.XFileType.FILE.getName());
	fileMetadata.putBoolean(oFF.XFileAttribute.SUPPORTS_RECURSIVE_LIST, isDir);
	let fileAttributes = oFF.PrFactory.createStructure();
	oFF.ComposableFileUtil.addComposableAttributes(fileAttributes, resource);
	fileAttributes.putString(oFF.XFileAttribute.NODE_TYPE, isDir ? oFF.ComposableConstants.FOLDER : oFF.ComposableConstants.FILE);
	this.setProviderMetadata(fileMetadata);
	this.setProviderAttributes(fileAttributes);
};
oFF.ComposableFile.prototype.supportsProviderDelete = function()
{
	return true;
};
oFF.ComposableFile.prototype.supportsProviderDeleteRecursive = function()
{
	return true;
};
oFF.ComposableFile.prototype.supportsProviderFetchChildren = function()
{
	return true;
};
oFF.ComposableFile.prototype.supportsProviderIsExisting = function()
{
	return true;
};
oFF.ComposableFile.prototype.supportsProviderLoad = function()
{
	return true;
};
oFF.ComposableFile.prototype.supportsProviderMkdir = function()
{
	return true;
};
oFF.ComposableFile.prototype.supportsProviderRenameTo = function()
{
	return true;
};
oFF.ComposableFile.prototype.supportsProviderSave = function()
{
	return true;
};
oFF.ComposableFile.prototype.supportsProviderSize = function()
{
	return true;
};

oFF.SubSysFsComposablePrg = function() {};
oFF.SubSysFsComposablePrg.prototype = new oFF.DfSubSysFilesystem();
oFF.SubSysFsComposablePrg.prototype._ff_c = "SubSysFsComposablePrg";

oFF.SubSysFsComposablePrg.DEFAULT_PROGRAM_NAME = "@SubSys.FileSystem.fscomposable";
oFF.SubSysFsComposablePrg.prototype.m_composableFileSystems = null;
oFF.SubSysFsComposablePrg.prototype.m_fs = null;
oFF.SubSysFsComposablePrg.prototype.getAllInitializedFileSystems = function()
{
	return this.m_composableFileSystems;
};
oFF.SubSysFsComposablePrg.prototype.getFileSystem = function(protocolType)
{
	return this.m_fs;
};
oFF.SubSysFsComposablePrg.prototype.getFileSystemByUri = function(uri)
{
	if (oFF.isNull(this.m_composableFileSystems))
	{
		this.m_composableFileSystems = oFF.XHashMapByString.create();
	}
	let serviceUri;
	if (oFF.XStringUtils.isNullOrEmpty(uri.getHost()))
	{
		let serviceUrl = this.getProcess().getEnvironment().getStringByKey(oFF.ComposableConstants.FIREFLY_COMPOSABLE_VFS_SERVICE_URL);
		if (oFF.XStringUtils.isNullOrEmpty(serviceUrl))
		{
			serviceUri = oFF.XUri.createFromUrl(oFF.ComposableConstants.DEFAULT_VFS_URI);
		}
		else
		{
			serviceUri = oFF.XUri.createFromUrl(serviceUrl);
		}
	}
	else
	{
		serviceUri = oFF.XUri.createFromOther(uri);
	}
	let host = serviceUri.getHost();
	let composableFs;
	let cachedFs = this.m_composableFileSystems.getByKey(host);
	if (oFF.notNull(cachedFs))
	{
		composableFs = cachedFs;
	}
	else
	{
		serviceUri.removeTrailingSlash();
		composableFs = oFF.ComposableFileSystem.createByHost(this.getProcess(), serviceUri.getUrl());
		this.m_composableFileSystems.put(host, composableFs);
	}
	this.m_fs = composableFs;
	return this.m_fs;
};
oFF.SubSysFsComposablePrg.prototype.getProgramName = function()
{
	return oFF.SubSysFsComposablePrg.DEFAULT_PROGRAM_NAME;
};
oFF.SubSysFsComposablePrg.prototype.getProtocolType = function()
{
	return oFF.ProtocolType.FS_COMPOSABLE;
};
oFF.SubSysFsComposablePrg.prototype.newProgram = function()
{
	let prg = new oFF.SubSysFsComposablePrg();
	prg.setup();
	return prg;
};
oFF.SubSysFsComposablePrg.prototype.processFetchFileSystem = function(syncType, listener, customIdentifier, uri)
{
	if (this.getProcess().getConnectionPool() === null)
	{
		this.getProcess().setEntity(oFF.ProcessEntity.CONNECTION_POOL, oFF.ConnectionPool.create(this.getProcess()));
	}
	return oFF.ComposableFsActionFetch.createAndRun(syncType, listener, customIdentifier, this, uri);
};
oFF.SubSysFsComposablePrg.prototype.runProcess = function()
{
	this.m_composableFileSystems = oFF.XHashMapByString.create();
	let process = this.getProcess();
	if (this.getProcess().getConnectionPool() === null)
	{
		this.getProcess().setEntity(oFF.ProcessEntity.CONNECTION_POOL, oFF.ConnectionPool.create(this.getProcess()));
	}
	this.m_fs = oFF.ComposableFileSystem.create(process);
	this.activateSubSystem(null, oFF.SubSystemStatus.ACTIVE);
	return true;
};

oFF.ComposableFileBaseAction = function() {};
oFF.ComposableFileBaseAction.prototype = new oFF.SyncActionExt();
oFF.ComposableFileBaseAction.prototype._ff_c = "ComposableFileBaseAction";

oFF.ComposableFileBaseAction.prototype.m_file = null;
oFF.ComposableFileBaseAction.prototype.m_fileSystem = null;
oFF.ComposableFileBaseAction.prototype.addResponseError = function(response)
{
	let message;
	if (oFF.isNull(response))
	{
		message = "Response is null";
	}
	else
	{
		message = oFF.XStringUtils.concatenate2("Response format is not correct: ", response.getRootElementAsString());
	}
	this.addErrorExt(oFF.OriginLayer.IOLAYER, oFF.ErrorCodes.SYSTEM_IO_HTTP, message, null);
	this.log(message);
};
oFF.ComposableFileBaseAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onHttpFileProcessed(extResult, data, customIdentifier);
};
oFF.ComposableFileBaseAction.prototype.getConnection = function(systemName)
{
	return this.getProcess().getConnectionPool().getConnection(systemName);
};
oFF.ComposableFileBaseAction.prototype.getServiceUri = function(file)
{
	let serviceUri;
	if (oFF.XStringUtils.isNullOrEmpty(file.getUri().getHost()))
	{
		serviceUri = oFF.XUri.createFromUrl(oFF.XStringUtils.concatenate2(this.m_fileSystem.getServiceUrl(), file.getUri().getPath()));
	}
	else
	{
		serviceUri = oFF.XUri.createFromOther(file.getUri());
	}
	if (serviceUri.getProtocolType() === this.m_fileSystem.getProtocolType())
	{
		serviceUri.setProtocolType(oFF.ProtocolType.HTTPS);
	}
	return serviceUri;
};
oFF.ComposableFileBaseAction.prototype.releaseObjectInternal = function() {};
oFF.ComposableFileBaseAction.prototype.sendRequest = function(syncType, serviceUri, method, contentType, payload)
{
	let connection = this.getConnection(serviceUri.getHost());
	let composableFunction = connection.newRpcFunctionByUri(serviceUri);
	composableFunction.setServiceName(oFF.SystemServices.COMPOSABLE_SERVICE);
	let serviceRequest = composableFunction.getRpcRequest();
	serviceRequest.setMethod(method);
	if (method === oFF.HttpRequestMethod.HTTP_POST || method === oFF.HttpRequestMethod.HTTP_PUT)
	{
		if (oFF.notNull(contentType))
		{
			if (contentType === oFF.ContentType.TEXT)
			{
				serviceRequest.setRequestContentType(oFF.ContentType.APPLICATION_JSON);
			}
			else
			{
				serviceRequest.setRequestContentType(contentType);
			}
		}
		if (oFF.notNull(payload))
		{
			if (!oFF.XStringUtils.isNullOrEmpty(payload.getStringRepresentation()))
			{
				if (contentType === oFF.ContentType.APPLICATION_JSON)
				{
					serviceRequest.setRequestStructure(payload);
				}
				else
				{
					let parser = oFF.JsonParserFactory.newInstance();
					let requestStructure = parser.parse(payload.getStringRepresentation());
					serviceRequest.setRequestStructure(requestStructure.asStructure());
				}
			}
		}
	}
	composableFunction.processFunctionExecution(syncType, this, null);
};

oFF.ComposableFsActionFetch = function() {};
oFF.ComposableFsActionFetch.prototype = new oFF.SyncActionExt();
oFF.ComposableFsActionFetch.prototype._ff_c = "ComposableFsActionFetch";

oFF.ComposableFsActionFetch.createAndRun = function(syncType, listener, customIdentifier, fsmr, uri)
{
	let object = new oFF.ComposableFsActionFetch();
	object.m_uri = uri;
	object.setupActionAndRun(syncType, listener, customIdentifier, fsmr);
	return object;
};
oFF.ComposableFsActionFetch.prototype.m_uri = null;
oFF.ComposableFsActionFetch.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onFileSystemFetched(extResult, data, customIdentifier);
};
oFF.ComposableFsActionFetch.prototype.processSynchronization = function(syncType)
{
	let fileSystem = this.getActionContext().getFileSystemByUri(this.m_uri);
	this.setData(fileSystem);
	return false;
};

oFF.ComposableContentType = function() {};
oFF.ComposableContentType.prototype = new oFF.ContentType();
oFF.ComposableContentType.prototype._ff_c = "ComposableContentType";

oFF.ComposableContentType.COMPOSABLE_DIRECTORY = null;
oFF.ComposableContentType.COMPOSABLE_REQUEST = null;
oFF.ComposableContentType.staticSetupComposableTypes = function()
{
	oFF.ComposableContentType.COMPOSABLE_DIRECTORY = oFF.ContentType.createMime("application/vnd.sap.sac.dir", oFF.ContentType.APPLICATION_JSON);
	oFF.ComposableContentType.COMPOSABLE_REQUEST = oFF.ContentType.createMime("application/vnd.sap.sac.composablerequest+json", oFF.ContentType.APPLICATION_JSON);
};

oFF.ComposableFileSystem = function() {};
oFF.ComposableFileSystem.prototype = new oFF.DfXFileSystem();
oFF.ComposableFileSystem.prototype._ff_c = "ComposableFileSystem";

oFF.ComposableFileSystem.create = function(process)
{
	let composableFileSystem = new oFF.ComposableFileSystem();
	composableFileSystem.m_fileCache = oFF.XHashMapByString.create();
	composableFileSystem.setupProcessContext(process);
	return composableFileSystem;
};
oFF.ComposableFileSystem.createByHost = function(process, serviceUrl)
{
	let composableFileSystem = new oFF.ComposableFileSystem();
	composableFileSystem.m_serviceUrl = serviceUrl;
	composableFileSystem.m_fileCache = oFF.XHashMapByString.create();
	composableFileSystem.setupProcessContext(process);
	return composableFileSystem;
};
oFF.ComposableFileSystem.prototype.m_fileCache = null;
oFF.ComposableFileSystem.prototype.m_rootFile = null;
oFF.ComposableFileSystem.prototype.m_serviceUrl = null;
oFF.ComposableFileSystem.prototype.getFileCache = function()
{
	return this.m_fileCache;
};
oFF.ComposableFileSystem.prototype.getProtocolType = function()
{
	return oFF.ProtocolType.FS_COMPOSABLE;
};
oFF.ComposableFileSystem.prototype.getServiceUrl = function()
{
	return this.m_serviceUrl;
};
oFF.ComposableFileSystem.prototype.newFile = function(process, uri)
{
	let fileId = uri.getPathContainer().getPath();
	let file = this.getFileCache().getByKey(fileId);
	if (oFF.isNull(file))
	{
		file = oFF.ComposableFile.create(process, this, uri);
	}
	if (oFF.notNull(this.m_rootFile) && oFF.XString.isEqual(uri.getPath(), oFF.XUri.PATH_SEPARATOR))
	{
		let host = uri.getHost();
		if (!oFF.XString.isEqual(host, this.m_rootFile.getUri().getHost()))
		{
			this.m_rootFile = file;
		}
		return this.m_rootFile;
	}
	else if (oFF.XString.isEqual(uri.getPath(), oFF.XUri.PATH_SEPARATOR))
	{
		this.m_rootFile = file;
	}
	return file;
};
oFF.ComposableFileSystem.prototype.processDelete = function(syncType, composableFile, listener, customIdentifier)
{
	return oFF.ComposableFileDeleteAction.createAndRun(syncType, composableFile, this, oFF.ComposableFileRequestListener.create((requestAction) => {
		let data = requestAction.getData();
		if (oFF.notNull(listener))
		{
			listener.onFileProviderDeleted(requestAction, data, customIdentifier);
		}
	}), customIdentifier);
};
oFF.ComposableFileSystem.prototype.processFetchChildren = function(syncType, file, listener, customIdentifier, config)
{
	return oFF.ComposableFileFetchChildrenAction.createAndRun(syncType, file, this, oFF.ComposableFileRequestListener.create((requestAction) => {
		let data = requestAction.getData();
		if (oFF.notNull(listener))
		{
			listener.onFileProviderChildrenFetched(requestAction, data, data.getProviderChildFiles(), data.getProviderChildrenResultset(), customIdentifier);
		}
	}), customIdentifier, config);
};
oFF.ComposableFileSystem.prototype.processFetchMetadata = function(syncType, file, listener, customIdentifier)
{
	return oFF.ComposableFileFetchMetadataAction.createAndRun(syncType, file, this, oFF.ComposableFileRequestListener.create((requestAction) => {
		let data = requestAction.getData();
		if (oFF.notNull(listener))
		{
			listener.onFileProviderFetchMetadata(requestAction, data, data.getProviderMetadataAndAttributes(), customIdentifier);
		}
	}), customIdentifier);
};
oFF.ComposableFileSystem.prototype.processIsExisting = function(syncType, composableFile, listener, customIdentifier)
{
	return oFF.ComposableFileExistsAction.createAndRun(syncType, composableFile, this, oFF.ComposableFileRequestListener.create((requestAction) => {
		let data = requestAction.getData();
		if (oFF.notNull(listener))
		{
			listener.onFileProviderExistsCheck(requestAction, data, data.getProviderIsExisting(), customIdentifier);
		}
	}), customIdentifier);
};
oFF.ComposableFileSystem.prototype.processLoad = function(syncType, composableFile, listener, customIdentifier, compression)
{
	return oFF.ComposableFileLoadAction.createAndRun(syncType, composableFile, this, oFF.ComposableFileRequestListener.create((requestAction) => {
		let data = requestAction.getData();
		if (oFF.notNull(listener))
		{
			listener.onFileProviderLoaded(requestAction, data, data.getProviderContent(), customIdentifier);
		}
	}), customIdentifier, compression);
};
oFF.ComposableFileSystem.prototype.processMkdir = function(syncType, composableFile, listener, customIdentifier, includeParentDirs, attributes)
{
	return oFF.ComposableFileMkdirAction.createAndRun(syncType, composableFile, this, oFF.ComposableFileRequestListener.create((requestAction) => {
		let data = requestAction.getData();
		if (oFF.notNull(listener))
		{
			listener.onFileProviderDirectoryCreated(requestAction, data, customIdentifier);
		}
	}), customIdentifier, includeParentDirs, attributes);
};
oFF.ComposableFileSystem.prototype.processRename = function(syncType, composableFile, listener, customIdentifier, targetName)
{
	return oFF.ComposableFileRenameAction.createAndRun(syncType, composableFile, this, oFF.ComposableFileRequestListener.create((requestAction) => {
		let data = requestAction.getData();
		if (oFF.notNull(listener))
		{
			listener.onFileProviderRenamed(requestAction, data, customIdentifier);
		}
	}), customIdentifier, targetName);
};
oFF.ComposableFileSystem.prototype.processSave = function(syncType, composableFile, listener, customIdentifier, content, compression, attributes, saveMode)
{
	return oFF.ComposableFileSaveAction.createAndRun(syncType, composableFile, this, oFF.ComposableFileRequestListener.create((requestAction) => {
		let data = requestAction.getData();
		if (oFF.notNull(listener))
		{
			listener.onFileProviderSaved(requestAction, data, content, customIdentifier);
		}
	}), customIdentifier, content, compression, attributes, saveMode);
};

oFF.ComposableFileDeleteAction = function() {};
oFF.ComposableFileDeleteAction.prototype = new oFF.ComposableFileBaseAction();
oFF.ComposableFileDeleteAction.prototype._ff_c = "ComposableFileDeleteAction";

oFF.ComposableFileDeleteAction.create = function(syncType, file, fileSystem, listener, customIdentifier)
{
	let action = new oFF.ComposableFileDeleteAction();
	action.m_file = file;
	action.m_fileSystem = fileSystem;
	action.setData(file);
	action.setupAction(syncType, listener, customIdentifier, fileSystem);
	return action;
};
oFF.ComposableFileDeleteAction.createAndRun = function(syncType, file, fileSystem, listener, customIdentifier)
{
	let action = new oFF.ComposableFileDeleteAction();
	action.m_file = file;
	action.m_fileSystem = fileSystem;
	action.setData(file);
	action.setupActionAndRun(syncType, listener, customIdentifier, fileSystem);
	return action;
};
oFF.ComposableFileDeleteAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid())
	{
		this.m_file.setProviderIsExisting(false);
		this.setData(this.m_file);
	}
	else
	{
		this.m_file.addAllMessages(extResult);
	}
	this.endSync();
};
oFF.ComposableFileDeleteAction.prototype.processSynchronization = function(syncType)
{
	let uri = this.getServiceUri(this.m_file);
	this.sendRequest(syncType, uri, oFF.HttpRequestMethod.HTTP_DELETE, null, null);
	return true;
};

oFF.ComposableFileExistsAction = function() {};
oFF.ComposableFileExistsAction.prototype = new oFF.ComposableFileBaseAction();
oFF.ComposableFileExistsAction.prototype._ff_c = "ComposableFileExistsAction";

oFF.ComposableFileExistsAction.create = function(syncType, composableFile, composableFileSystem, composableFileRequestListener, customIdentifier)
{
	let composableFileExistingAction = new oFF.ComposableFileExistsAction();
	composableFileExistingAction.m_file = composableFile;
	composableFileExistingAction.m_fileSystem = composableFileSystem;
	composableFileExistingAction.setData(composableFile);
	composableFileExistingAction.setupAction(syncType, composableFileRequestListener, customIdentifier, composableFileSystem);
	return composableFileExistingAction;
};
oFF.ComposableFileExistsAction.createAndRun = function(syncType, composableFile, composableFileSystem, composableFileRequestListener, customIdentifier)
{
	let composableFileExistingAction = new oFF.ComposableFileExistsAction();
	composableFileExistingAction.m_file = composableFile;
	composableFileExistingAction.m_fileSystem = composableFileSystem;
	composableFileExistingAction.setData(composableFile);
	composableFileExistingAction.setupActionAndRun(syncType, composableFileRequestListener, customIdentifier, composableFileSystem);
	return composableFileExistingAction;
};
oFF.ComposableFileExistsAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.m_file.setProviderIsExisting(extResult.isValid());
	this.setData(this.m_file);
	this.endSync();
};
oFF.ComposableFileExistsAction.prototype.processSynchronization = function(syncType)
{
	let uri = this.getServiceUri(this.m_file);
	this.sendRequest(syncType, uri, oFF.HttpRequestMethod.HTTP_HEAD, null, null);
	return true;
};

oFF.ComposableFileFetchChildrenAction = function() {};
oFF.ComposableFileFetchChildrenAction.prototype = new oFF.ComposableFileBaseAction();
oFF.ComposableFileFetchChildrenAction.prototype._ff_c = "ComposableFileFetchChildrenAction";

oFF.ComposableFileFetchChildrenAction.create = function(syncType, file, fileSystem, listener, customIdentifier, config)
{
	let action = new oFF.ComposableFileFetchChildrenAction();
	action.m_file = file;
	action.m_fileSystem = fileSystem;
	action.m_fileQuery = config;
	action.setData(file);
	action.setupAction(syncType, listener, customIdentifier, fileSystem);
	return action;
};
oFF.ComposableFileFetchChildrenAction.createAndRun = function(syncType, file, fileSystem, listener, customIdentifier, config)
{
	let action = new oFF.ComposableFileFetchChildrenAction();
	action.m_file = file;
	action.m_fileSystem = fileSystem;
	action.m_fileQuery = config;
	action.setData(file);
	action.setupActionAndRun(syncType, listener, customIdentifier, fileSystem);
	return action;
};
oFF.ComposableFileFetchChildrenAction.prototype.m_fileQuery = null;
oFF.ComposableFileFetchChildrenAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid())
	{
		let responseJson = response.getRootElement();
		if (oFF.notNull(responseJson) && responseJson.isStructure() && !responseJson.asStructure().isEmpty())
		{
			let childrenKey = oFF.notNull(this.m_fileQuery) && this.m_fileQuery.isRecursiveListEnabled() ? oFF.ComposableConstants.DESCENDANTS_KEY : oFF.ComposableConstants.CHILD_RESOURCES_KEY;
			let childResources = responseJson.asStructure().getListByKey(childrenKey);
			if (!childResources.isEmpty())
			{
				let children = oFF.XList.create();
				oFF.XCollectionUtils.forEach(childResources, (child) => {
					let childStructure = child.asStructure();
					let resourceName = childStructure.getStringByKey(oFF.ComposableConstants.RESOURCE_NAME_KEY);
					let isDir = childStructure.getBooleanByKey(oFF.ComposableConstants.IS_DIRECTORY_KEY);
					let childUri;
					if (isDir)
					{
						childUri = oFF.XUri.createChildDir(this.m_file.getUri(), resourceName);
					}
					else
					{
						childUri = oFF.XUri.createChildFile(this.m_file.getUri(), resourceName);
					}
					let childFile = oFF.ComposableFile.create(this.getProcess(), this.m_fileSystem, childUri);
					childFile.setInternalMetadataAndAttributes(childStructure);
					children.add(childFile);
				});
				this.m_file.setProviderChildFiles(children, children.size());
			}
			else
			{
				this.m_file.setProviderChildFiles(oFF.XList.create(), 0);
			}
		}
		else
		{
			this.addResponseError(response);
		}
	}
	else
	{
		this.m_file.addAllMessages(extResult);
	}
	this.endSync();
};
oFF.ComposableFileFetchChildrenAction.prototype.processSynchronization = function(syncType)
{
	let uri = this.getServiceUri(this.m_file);
	if (oFF.notNull(this.m_fileQuery) && this.m_fileQuery.isRecursiveListEnabled())
	{
		let queryParams = oFF.XList.create();
		queryParams.add(oFF.XNameValuePair.create(oFF.ComposableConstants.LIST_DESCENDANTS_KEY, "true"));
		queryParams.add(oFF.XNameValuePair.create(oFF.ComposableConstants.IS_DIRECTORY_KEY, "false"));
		uri.addQueryElements(queryParams);
	}
	this.sendRequest(syncType, uri, oFF.HttpRequestMethod.HTTP_GET, null, null);
	return true;
};

oFF.ComposableFileFetchMetadataAction = function() {};
oFF.ComposableFileFetchMetadataAction.prototype = new oFF.ComposableFileBaseAction();
oFF.ComposableFileFetchMetadataAction.prototype._ff_c = "ComposableFileFetchMetadataAction";

oFF.ComposableFileFetchMetadataAction.create = function(syncType, file, fileSystem, listener, customIdentifier)
{
	let action = new oFF.ComposableFileFetchMetadataAction();
	action.m_file = file;
	action.m_fileSystem = fileSystem;
	action.setData(file);
	action.setupAction(syncType, listener, customIdentifier, fileSystem);
	return action;
};
oFF.ComposableFileFetchMetadataAction.createAndRun = function(syncType, file, fileSystem, listener, customIdentifier)
{
	let action = new oFF.ComposableFileFetchMetadataAction();
	action.m_file = file;
	action.m_fileSystem = fileSystem;
	action.setData(file);
	action.setupActionAndRun(syncType, listener, customIdentifier, fileSystem);
	return action;
};
oFF.ComposableFileFetchMetadataAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.endSync();
};
oFF.ComposableFileFetchMetadataAction.prototype.processSynchronization = function(syncType)
{
	return false;
};

oFF.ComposableFileLoadAction = function() {};
oFF.ComposableFileLoadAction.prototype = new oFF.ComposableFileBaseAction();
oFF.ComposableFileLoadAction.prototype._ff_c = "ComposableFileLoadAction";

oFF.ComposableFileLoadAction.create = function(syncType, file, fileSystem, listener, customIdentifier, compression)
{
	let action = new oFF.ComposableFileLoadAction();
	action.m_file = file;
	action.m_fileSystem = fileSystem;
	action.setData(file);
	action.setupAction(syncType, listener, customIdentifier, fileSystem);
	return action;
};
oFF.ComposableFileLoadAction.createAndRun = function(syncType, file, fileSystem, listener, customIdentifier, compression)
{
	let action = new oFF.ComposableFileLoadAction();
	action.m_file = file;
	action.m_fileSystem = fileSystem;
	action.setData(file);
	action.setupActionAndRun(syncType, listener, customIdentifier, fileSystem);
	return action;
};
oFF.ComposableFileLoadAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid())
	{
		let responseJson = response.getRootElement();
		if (oFF.notNull(responseJson) && responseJson.isStructure() && !responseJson.asStructure().isEmpty())
		{
			let resource = responseJson.asStructure().getStructureByKey(oFF.ComposableConstants.RESOURCE_KEY);
			if (oFF.notNull(resource))
			{
				let contentTypeString = resource.getStringByKey(oFF.ComposableConstants.CONTENT_TYPE_KEY);
				let contentType = oFF.ContentType.lookup(contentTypeString);
				let content = oFF.XContent.createStringContent(contentType, resource.getStringByKey(oFF.ComposableConstants.CONTENT_KEY));
				this.m_file.setProviderFileContent(content);
				this.m_file.setInternalMetadataAndAttributes(resource);
				this.m_file.setProviderIsExisting(true);
			}
			else
			{
				this.addResponseError(response);
			}
		}
		else
		{
			this.addResponseError(response);
		}
	}
	else
	{
		this.m_file.addAllMessages(extResult);
	}
	this.endSync();
};
oFF.ComposableFileLoadAction.prototype.processSynchronization = function(syncType)
{
	let uri = this.getServiceUri(this.m_file);
	this.sendRequest(syncType, uri, oFF.HttpRequestMethod.HTTP_GET, null, null);
	return true;
};

oFF.ComposableFileMkdirAction = function() {};
oFF.ComposableFileMkdirAction.prototype = new oFF.ComposableFileBaseAction();
oFF.ComposableFileMkdirAction.prototype._ff_c = "ComposableFileMkdirAction";

oFF.ComposableFileMkdirAction.create = function(syncType, composableFile, composableFileSystem, composableFileRequestListener, customIdentifier, includeParentDirs, attributes)
{
	let composableFileMkdirAction = new oFF.ComposableFileMkdirAction();
	composableFileMkdirAction.m_file = composableFile;
	composableFileMkdirAction.m_fileSystem = composableFileSystem;
	composableFileMkdirAction.setData(composableFile);
	composableFileMkdirAction.setupAction(syncType, composableFileRequestListener, customIdentifier, composableFileSystem);
	return composableFileMkdirAction;
};
oFF.ComposableFileMkdirAction.createAndRun = function(syncType, composableFile, composableFileSystem, composableFileRequestListener, customIdentifier, includeParentDirs, attributes)
{
	let composableFileMkdirAction = new oFF.ComposableFileMkdirAction();
	composableFileMkdirAction.m_file = composableFile;
	composableFileMkdirAction.m_fileSystem = composableFileSystem;
	composableFileMkdirAction.setData(composableFile);
	composableFileMkdirAction.setupActionAndRun(syncType, composableFileRequestListener, customIdentifier, composableFileSystem);
	return composableFileMkdirAction;
};
oFF.ComposableFileMkdirAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid())
	{
		let responseJson = response.getRootElement();
		if (oFF.notNull(responseJson) && responseJson.isStructure() && !responseJson.asStructure().isEmpty())
		{
			let resource = responseJson.asStructure().getStructureByKey(oFF.ComposableConstants.RESOURCE_KEY);
			if (oFF.notNull(resource))
			{
				let fileUri = this.m_file.getUri();
				this.m_fileSystem.getFileCache().remove(fileUri.getPathContainer().getPath());
				let parentUri = oFF.XUri.createParent(fileUri);
				let dirUri = oFF.XUri.createChildDir(parentUri, resource.getStringByKey(oFF.ComposableConstants.RESOURCE_NAME_KEY));
				this.m_file = oFF.ComposableFile.create(this.getProcess(), this.m_fileSystem, dirUri);
				this.m_file.setInternalMetadataAndAttributes(resource);
				this.setData(this.m_file);
			}
			else
			{
				this.addResponseError(response);
			}
		}
		else
		{
			this.addResponseError(response);
		}
	}
	else
	{
		this.m_file.addAllMessages(extResult);
	}
	this.endSync();
};
oFF.ComposableFileMkdirAction.prototype.processSynchronization = function(syncType)
{
	let uri = this.getServiceUri(this.m_file);
	this.sendRequest(syncType, uri, oFF.HttpRequestMethod.HTTP_POST, oFF.ComposableContentType.COMPOSABLE_DIRECTORY, null);
	return true;
};

oFF.ComposableFileRenameAction = function() {};
oFF.ComposableFileRenameAction.prototype = new oFF.ComposableFileBaseAction();
oFF.ComposableFileRenameAction.prototype._ff_c = "ComposableFileRenameAction";

oFF.ComposableFileRenameAction.create = function(syncType, composableFile, composableFileSystem, composableFileRequestListener, customIdentifier, targetName)
{
	let composableFileRenameAction = new oFF.ComposableFileRenameAction();
	composableFileRenameAction.m_file = composableFile;
	composableFileRenameAction.m_fileSystem = composableFileSystem;
	composableFileRenameAction.m_targetName = targetName;
	composableFileRenameAction.setData(composableFile);
	composableFileRenameAction.setupAction(syncType, composableFileRequestListener, customIdentifier, composableFileSystem);
	return composableFileRenameAction;
};
oFF.ComposableFileRenameAction.createAndRun = function(syncType, composableFile, composableFileSystem, composableFileRequestListener, customIdentifier, targetName)
{
	let composableFileRenameAction = new oFF.ComposableFileRenameAction();
	composableFileRenameAction.m_file = composableFile;
	composableFileRenameAction.m_fileSystem = composableFileSystem;
	composableFileRenameAction.m_targetName = targetName;
	composableFileRenameAction.setData(composableFile);
	composableFileRenameAction.setupActionAndRun(syncType, composableFileRequestListener, customIdentifier, composableFileSystem);
	return composableFileRenameAction;
};
oFF.ComposableFileRenameAction.prototype.m_targetName = null;
oFF.ComposableFileRenameAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid())
	{
		let responseJson = response.getRootElement();
		if (oFF.notNull(responseJson) && responseJson.isStructure() && !responseJson.asStructure().isEmpty())
		{
			let resource = responseJson.asStructure().getStructureByKey(oFF.ComposableConstants.RESOURCE_KEY);
			if (oFF.notNull(resource))
			{
				this.m_file.setInternalMetadataAndAttributes(resource);
				this.setData(this.m_file);
			}
			else
			{
				this.addResponseError(response);
			}
		}
		else
		{
			this.addResponseError(response);
		}
	}
	else
	{
		this.m_file.addAllMessages(extResult);
	}
	this.endSync();
};
oFF.ComposableFileRenameAction.prototype.processSynchronization = function(syncType)
{
	let uri = this.getServiceUri(this.m_file);
	let queryParams = oFF.XList.create();
	queryParams.add(oFF.XNameValuePair.create("newName", this.m_targetName));
	uri.addQueryElements(queryParams);
	this.sendRequest(syncType, uri, oFF.HttpRequestMethod.HTTP_PATCH, oFF.ComposableContentType.COMPOSABLE_DIRECTORY, null);
	return true;
};

oFF.ComposableFileSaveAction = function() {};
oFF.ComposableFileSaveAction.prototype = new oFF.ComposableFileBaseAction();
oFF.ComposableFileSaveAction.prototype._ff_c = "ComposableFileSaveAction";

oFF.ComposableFileSaveAction.create = function(syncType, composableFile, composableFileSystem, composableFileRequestListener, customIdentifier, content, compression, attributes, saveMode)
{
	let composableFileSaveAction = new oFF.ComposableFileSaveAction();
	composableFileSaveAction.m_file = composableFile;
	composableFileSaveAction.m_fileSystem = composableFileSystem;
	composableFileSaveAction.m_content = content;
	composableFileSaveAction.m_metadata = attributes;
	composableFileSaveAction.setData(composableFile);
	composableFileSaveAction.setupAction(syncType, composableFileRequestListener, customIdentifier, composableFileSystem);
	return composableFileSaveAction;
};
oFF.ComposableFileSaveAction.createAndRun = function(syncType, composableFile, composableFileSystem, composableFileRequestListener, customIdentifier, content, compression, attributes, saveMode)
{
	let composableFileSaveAction = new oFF.ComposableFileSaveAction();
	composableFileSaveAction.m_file = composableFile;
	composableFileSaveAction.m_fileSystem = composableFileSystem;
	composableFileSaveAction.m_content = content;
	composableFileSaveAction.m_metadata = attributes;
	composableFileSaveAction.setData(composableFile);
	composableFileSaveAction.setupActionAndRun(syncType, composableFileRequestListener, customIdentifier, composableFileSystem);
	return composableFileSaveAction;
};
oFF.ComposableFileSaveAction.prototype.m_content = null;
oFF.ComposableFileSaveAction.prototype.m_metadata = null;
oFF.ComposableFileSaveAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid())
	{
		let responseJson = response.getRootElement();
		if (oFF.notNull(responseJson) && responseJson.isStructure() && !responseJson.asStructure().isEmpty())
		{
			let resource = responseJson.asStructure().getStructureByKey(oFF.ComposableConstants.RESOURCE_KEY);
			if (oFF.notNull(resource))
			{
				let fileUri = this.m_file.getUri();
				this.m_fileSystem.getFileCache().remove(fileUri.getPathContainer().getPath());
				let parentUri = oFF.XUri.createParent(fileUri);
				let childFile = oFF.XUri.createChildFile(parentUri, resource.getStringByKey(oFF.ComposableConstants.RESOURCE_NAME_KEY));
				this.m_file = oFF.ComposableFile.create(this.getProcess(), this.m_fileSystem, childFile);
				this.m_file.setInternalMetadataAndAttributes(resource);
				this.setData(this.m_file);
			}
			else
			{
				this.addResponseError(response);
			}
		}
		else
		{
			this.addResponseError(response);
		}
	}
	else
	{
		this.m_file.addAllMessages(extResult);
	}
	this.endSync();
};
oFF.ComposableFileSaveAction.prototype.processSynchronization = function(syncType)
{
	let uri = this.getServiceUri(this.m_file);
	let payload = oFF.PrFactory.createStructure();
	payload.put(oFF.ComposableConstants.METADATA_KEY, oFF.PrFactory.createFromValue(this.m_metadata));
	payload.put(oFF.ComposableConstants.CONTENT_KEY, oFF.PrFactory.createString(this.m_content.getString()));
	payload.put(oFF.ComposableConstants.CONTENT_TYPE_KEY, oFF.PrFactory.createString(this.m_content.getContentType().toString()));
	this.sendRequest(syncType, uri, oFF.HttpRequestMethod.HTTP_POST, oFF.ComposableContentType.COMPOSABLE_REQUEST, payload);
	return true;
};

oFF.ComposableFsModule = function() {};
oFF.ComposableFsModule.prototype = new oFF.DfModule();
oFF.ComposableFsModule.prototype._ff_c = "ComposableFsModule";

oFF.ComposableFsModule.COMPOSABLE_MODULE = "ff2130.composable.fs";
oFF.ComposableFsModule.s_module = null;
oFF.ComposableFsModule.getInstance = function()
{
	if (oFF.isNull(oFF.ComposableFsModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.RuntimeModule.getInstance());
		oFF.ComposableFsModule.s_module = oFF.DfModule.startExt(new oFF.ComposableFsModule());
		oFF.ProgramRegistry.setProgramFactory(new oFF.SubSysFsComposablePrg());
		oFF.ComposableContentType.staticSetupComposableTypes();
		oFF.DfModule.stopExt(oFF.ComposableFsModule.s_module);
	}
	return oFF.ComposableFsModule.s_module;
};
oFF.ComposableFsModule.prototype.getName = function()
{
	return oFF.ComposableFsModule.COMPOSABLE_MODULE;
};

oFF.ComposableFsModule.getInstance();

return oFF;
} );
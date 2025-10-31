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
oFF.FF2120_ORCA_USERS_FS_RESOURCES = function() {};
oFF.FF2120_ORCA_USERS_FS_RESOURCES.prototype = {};
oFF.FF2120_ORCA_USERS_FS_RESOURCES.prototype._ff_c = "FF2120_ORCA_USERS_FS_RESOURCES";

oFF.FF2120_ORCA_USERS_FS_RESOURCES.PATH_manifests_programs_SubSysFileSystemfssacusers_json = "manifests/programs/SubSysFileSystemfssacusers.json";
oFF.FF2120_ORCA_USERS_FS_RESOURCES.manifests_programs_SubSysFileSystemfssacusers_json = "ewogICJOYW1lIjogIkBTdWJTeXMuRmlsZVN5c3RlbS5mc3NhY3VzZXJzIiwKICAiVHlwZSI6ICJTdWJTeXN0ZW0iLAogICJDYXRlZ29yeSI6ICJTdWJTeXN0ZW0iLAogICJQcm9maWxlcyI6IFsKICAgICIqIgogIF0sCiAgIkRpc3BsYXlOYW1lIjogIlNBQyBVc2VycyBGaWxlc3lzdGVtIiwKICAiRGVzY3JpcHRpb24iOiAiU0FDIFVzZXJzIEZpbGVzeXN0ZW0iLAogICJBdXRob3IiOiAiTWljaGFlbCBEb25vaG9lIiwKICAiQ29udGFpbmVyIjogIk5vbmUiLAogICJDbGFzcyI6ICJjb20uc2FwLmZpcmVmbHkub3JjYS51c2Vycy5mcy5TdWJTeXNGc1NhY1VzZXJQcmciLAogICJTdWJTeXN0ZW1zIjogWwogICAgIlN5c3RlbUxhbmRzY2FwZSIsCiAgICAiVXNlclByb2ZpbGUiCiAgXSwKICAiTW9kdWxlcyI6IFsKICAgICJmZjEwNDAua2VybmVsLm5hdGl2ZSIsCiAgICAiZmYyMTIwLm9yY2EudXNlcnMuZnMiCiAgXQp9";

oFF.XResources.registerResourceClass("ff2120.orca.users.fs", oFF.FF2120_ORCA_USERS_FS_RESOURCES);

oFF.SacUserFSConstants = {

	ACTION:"action",
	ASCENDING:"asc",
	AUTH_OVERRIDE:"authOverride",
	DATA:"data",
	DESCENDING:"DESC",
	DISPLAYNAME:"displayName",
	DISPLAY_NAME:"display_name",
	DISPLAY_NAME_UPPER:"DISPLAY_NAME",
	EXCLUDE_USER_IDS:"excludeUserIds",
	ID:"id",
	LIMIT:"limit",
	MEMBERS:"members",
	OFFSET:"offset",
	OPTIONS:"options",
	ORDER:"order",
	P1:"p1",
	QUERY:"query",
	READ_OBJECT:"readObject",
	RESOURCE_TYPE_FOLDER:"FOLDER",
	RESULTS:"results",
	SORT_DEFINITION:"sortDefinition",
	TEAM:"team",
	TEAMS_PATH:"/Teams/",
	TEAMS_VIRTUAL_FOLDER:"Teams",
	TEAM_UPPER:"TEAM",
	TOTAL_COUNT:"totalCount",
	TYPE:"type",
	TYPES:"types",
	USER:"user",
	USERS_VIRTUAL_FOLDER:"Users",
	WORKSPACES:"workspaces"
};

oFF.SacUserFileRequestListener = function() {};
oFF.SacUserFileRequestListener.prototype = new oFF.XObject();
oFF.SacUserFileRequestListener.prototype._ff_c = "SacUserFileRequestListener";

oFF.SacUserFileRequestListener.create = function(callback)
{
	let listener = new oFF.SacUserFileRequestListener();
	listener.callback = callback;
	return listener;
};
oFF.SacUserFileRequestListener.prototype.callback = null;
oFF.SacUserFileRequestListener.prototype.onHttpFileProcessed = function(extResult, data, customIdentifier)
{
	this.callback(extResult);
};

oFF.SacUserFile = function() {};
oFF.SacUserFile.prototype = new oFF.DfXFileProvider();
oFF.SacUserFile.prototype._ff_c = "SacUserFile";

oFF.SacUserFile._create = function(process, fs, uri, isVirtual)
{
	let file = new oFF.SacUserFile();
	file.setupSacUserFile(process, fs, uri);
	let fileName = uri.getPathContainer().getFileName();
	let metadata = oFF.PrFactory.createStructure();
	let isRootDirectory = oFF.XString.isEqual(fs.getRootDirectoryUri().getPath(), uri.getPath());
	if (isRootDirectory || isVirtual)
	{
		file.setProviderIsExisting(true);
		metadata.putString(oFF.XFileAttribute.NODE_TYPE, oFF.SacUserFSConstants.RESOURCE_TYPE_FOLDER);
		file.setIsDirectory(true);
		metadata.putBoolean(oFF.XFileAttribute.IS_WRITEABLE, false);
		metadata.putBoolean(oFF.XFileAttribute.IS_READABLE, true);
		metadata.putBoolean(oFF.XFileAttribute.IS_FILE, false);
		metadata.putBoolean(oFF.XFileAttribute.IS_DIRECTORY, true);
		metadata.putBoolean(oFF.XFileAttribute.IS_EXECUTABLE, false);
		if (isVirtual)
		{
			metadata.putString(oFF.XFileAttribute.UNIQUE_ID, fileName);
			metadata.putString(oFF.XFileAttribute.DISPLAY_NAME, fileName);
		}
	}
	file.setProviderMetadata(metadata);
	file.setSupportedQueryOptions(metadata);
	return file;
};
oFF.SacUserFile.create = function(parameterElement, process, fs, uri, isTeamFolder)
{
	let file = new oFF.SacUserFile();
	let fileUri = oFF.XUri.createChildFile(uri, parameterElement.getStringByKey(oFF.SacUserFSConstants.ID));
	file.setupSacUserFile(process, fs, fileUri);
	file.setProviderIsExisting(true);
	let metadata = oFF.PrFactory.createStructure();
	metadata.putAll(file.getProviderAttributes());
	metadata.putString(oFF.XFileAttribute.SYSTEM_NAME, file.getFsBase().getOrcaConnection().getSystemName());
	metadata.putString(oFF.XFileAttribute.NAME, parameterElement.getStringByKey(oFF.SacUserFSConstants.ID));
	if (parameterElement.containsKey(oFF.SacUserFSConstants.DISPLAYNAME))
	{
		metadata.putString(oFF.XFileAttribute.DISPLAY_NAME, parameterElement.getStringByKey(oFF.SacUserFSConstants.DISPLAYNAME));
		metadata.putString(oFF.XFileAttribute.SEMANTIC_TYPE, parameterElement.getStringByKey(oFF.SacUserFSConstants.TYPE));
	}
	else
	{
		metadata.putString(oFF.XFileAttribute.DISPLAY_NAME, parameterElement.getStringByKey(oFF.SacUserFSConstants.DISPLAY_NAME_UPPER));
		metadata.putString(oFF.XFileAttribute.SEMANTIC_TYPE, oFF.SacUserFSConstants.TEAM_UPPER);
	}
	if (isTeamFolder)
	{
		metadata.putString(oFF.XFileAttribute.NODE_TYPE, oFF.SacUserFSConstants.RESOURCE_TYPE_FOLDER);
	}
	metadata.putBoolean(oFF.XFileAttribute.IS_WRITEABLE, false);
	metadata.putString(oFF.XFileAttribute.FILE_TYPE, metadata.getStringByKey(oFF.XFileAttribute.NODE_TYPE));
	metadata.putLong(oFF.XFileAttribute.SIZE, -1);
	metadata.putBoolean(oFF.XFileAttribute.IS_READABLE, true);
	metadata.putBoolean(oFF.XFileAttribute.IS_EXECUTABLE, false);
	let resourceType = metadata.getStringByKey(oFF.XFileAttribute.NODE_TYPE);
	let isFile = !oFF.XString.isEqual(oFF.SacUserFSConstants.RESOURCE_TYPE_FOLDER, resourceType);
	metadata.putBoolean(oFF.XFileAttribute.IS_FILE, isFile);
	metadata.putBoolean(oFF.XFileAttribute.IS_DIRECTORY, !isFile);
	if (!metadata.getBooleanByKey(oFF.XFileAttribute.IS_DIRECTORY))
	{
		metadata.putString(oFF.XFileAttribute.ICON, "fpa/person");
	}
	else
	{
		metadata.putString(oFF.XFileAttribute.ICON, "fpa/users");
	}
	file.setProviderMetadata(metadata);
	return file;
};
oFF.SacUserFile.createRoot = function(process, filesystem, uri)
{
	let file = new oFF.SacUserFile();
	file.setupFile(process, filesystem, uri);
	file.m_isDir = true;
	return file;
};
oFF.SacUserFile.prototype.m_isDir = false;
oFF.SacUserFile.prototype.getFileType = function()
{
	if (this.isDirectory())
	{
		return oFF.XFileType.DIR;
	}
	return oFF.XFileType.FILE;
};
oFF.SacUserFile.prototype.getFsBase = function()
{
	return this.m_fs;
};
oFF.SacUserFile.prototype.getProviderAttributes = function()
{
	return this.getProviderMetadata();
};
oFF.SacUserFile.prototype.getProviderParent = function()
{
	let parentUri = oFF.XUri.createParent(this.getUri());
	return this.getFsBase().newFile(this.getProcess(), parentUri);
};
oFF.SacUserFile.prototype.isDirectory = function()
{
	return this.m_isDir;
};
oFF.SacUserFile.prototype.isVirtual = function()
{
	let virtualIds = oFF.XList.create();
	virtualIds.add(oFF.SacUserFSConstants.USERS_VIRTUAL_FOLDER);
	virtualIds.add(oFF.SacUserFSConstants.TEAMS_VIRTUAL_FOLDER);
	return virtualIds.contains(this.getProviderAttributes().getStringByKey(oFF.XFileAttribute.UNIQUE_ID));
};
oFF.SacUserFile.prototype.processProviderFetchChildren = function(syncType, listener, customIdentifier, config)
{
	return this.getFsBase().processFetchChildren(this, syncType, listener, customIdentifier, config);
};
oFF.SacUserFile.prototype.processProviderFetchMetadata = function(syncType, listener, customIdentifier, cachingType)
{
	return this.getFsBase().processProviderFetchMetadata(syncType, listener, customIdentifier, this);
};
oFF.SacUserFile.prototype.setIsDirectory = function(isDirectory)
{
	this.m_isDir = isDirectory;
};
oFF.SacUserFile.prototype.setSupportedFilterAttributes = function(metadata)
{
	let supportedFilters = metadata.putNewStructure(oFF.XFileAttribute.SUPPORTED_FILTERS);
	let nodeTypeFilter = supportedFilters.putNewStructure(oFF.XFileAttribute.NODE_TYPE);
	let nodeFilterTypes = nodeTypeFilter.putNewList(oFF.XFileAttribute.SUPPORTED_FILTER_TYPES);
	nodeFilterTypes.addString(oFF.XFileFilterType.EXACT.getName());
	let createdByFilter = supportedFilters.putNewStructure(oFF.XFileAttribute.CREATED_BY);
	let createdByFilterTypes = createdByFilter.putNewList(oFF.XFileAttribute.SUPPORTED_FILTER_TYPES);
	createdByFilterTypes.addString(oFF.XFileFilterType.EXACT.getName());
	createdByFilterTypes.addString(oFF.XFileFilterType.NOT.getName());
};
oFF.SacUserFile.prototype.setSupportedQueryOptions = function(metadata)
{
	let featuresSupported = this.isDirectory();
	metadata.putBoolean(oFF.XFileAttribute.SUPPORTS_OFFSET, featuresSupported);
	metadata.putBoolean(oFF.XFileAttribute.SUPPORTS_MAX_ITEMS, featuresSupported);
	metadata.putBoolean(oFF.XFileAttribute.SUPPORTS_SINGLE_SORT, featuresSupported);
	metadata.putBoolean(oFF.XFileAttribute.SUPPORTS_CARTESIAN_FILTER, featuresSupported);
	metadata.putBoolean(oFF.XFileAttribute.SUPPORTS_SEARCH, featuresSupported);
	if (featuresSupported)
	{
		this.setSupportedFilterAttributes(metadata);
	}
};
oFF.SacUserFile.prototype.setupSacUserFile = function(process, fileSystem, uri)
{
	this.setupFile(process, fileSystem, uri);
};
oFF.SacUserFile.prototype.supportsProviderFetchChildren = function()
{
	return true;
};
oFF.SacUserFile.prototype.supportsProviderLoad = function()
{
	return true;
};

oFF.SubSysFsSacUserPrg = function() {};
oFF.SubSysFsSacUserPrg.prototype = new oFF.DfSubSysFilesystem();
oFF.SubSysFsSacUserPrg.prototype._ff_c = "SubSysFsSacUserPrg";

oFF.SubSysFsSacUserPrg.DEFAULT_PROGRAM_NAME = "@SubSys.FileSystem.fssacusers";
oFF.SubSysFsSacUserPrg.FS_PREFIX = "fssacusers:";
oFF.SubSysFsSacUserPrg.prototype.m_fs = null;
oFF.SubSysFsSacUserPrg.prototype.m_orcaFileSystems = null;
oFF.SubSysFsSacUserPrg.prototype.getAllInitializedFileSystems = function()
{
	if (oFF.isNull(this.m_orcaFileSystems))
	{
		this.m_orcaFileSystems = oFF.XHashMapByString.create();
	}
	return this.m_orcaFileSystems;
};
oFF.SubSysFsSacUserPrg.prototype.getFileSystem = function(protocolType)
{
	return this.m_fs;
};
oFF.SubSysFsSacUserPrg.prototype.getFileSystemByUri = function(uri)
{
	if (oFF.isNull(this.m_orcaFileSystems))
	{
		this.m_orcaFileSystems = oFF.XHashMapByString.create();
	}
	let host = uri.getHost();
	let fs;
	let key = oFF.XStringUtils.concatenate2(oFF.SubSysFsSacUserPrg.FS_PREFIX, host);
	if (this.m_orcaFileSystems.containsKey(key))
	{
		fs = this.m_orcaFileSystems.getByKey(key);
	}
	else
	{
		fs = oFF.SacUserFileSystem.createWithSystem(this.getProcess(), host, uri);
		this.m_orcaFileSystems.put(key, fs);
	}
	this.m_fs = fs;
	return this.m_fs;
};
oFF.SubSysFsSacUserPrg.prototype.getProgramName = function()
{
	return oFF.SubSysFsSacUserPrg.DEFAULT_PROGRAM_NAME;
};
oFF.SubSysFsSacUserPrg.prototype.getProtocolType = function()
{
	return oFF.ProtocolType.FS_SACUSERS;
};
oFF.SubSysFsSacUserPrg.prototype.newProgram = function()
{
	let prg = new oFF.SubSysFsSacUserPrg();
	prg.setup();
	return prg;
};
oFF.SubSysFsSacUserPrg.prototype.processFetchFileSystem = function(syncType, listener, customIdentifier, uri)
{
	if (this.getProcess().getConnectionPool() === null)
	{
		this.getProcess().setEntity(oFF.ProcessEntity.CONNECTION_POOL, oFF.ConnectionPool.create(this.getProcess()));
	}
	return oFF.SacUserFsActionFetch.createAndRun(syncType, listener, customIdentifier, this, uri);
};
oFF.SubSysFsSacUserPrg.prototype.runProcess = function()
{
	this.activateSubSystem(null, oFF.SubSystemStatus.ACTIVE);
	if (this.getProcess().getConnectionPool() === null)
	{
		this.getProcess().setEntity(oFF.ProcessEntity.CONNECTION_POOL, oFF.ConnectionPool.create(this.getProcess()));
	}
	this.m_orcaFileSystems = oFF.XHashMapByString.create();
	return true;
};

oFF.SacUserFileBaseAction = function() {};
oFF.SacUserFileBaseAction.prototype = new oFF.SyncActionExt();
oFF.SacUserFileBaseAction.prototype._ff_c = "SacUserFileBaseAction";

oFF.SacUserFileBaseAction.prototype.addResponseError = function(response)
{
	let message = "";
	if (oFF.isNull(response))
	{
		message = "Response is null";
	}
	else
	{
		message = oFF.XStringUtils.concatenate2("Response is not correct format: ", response.getRootElementAsString());
	}
	this.addErrorExt(oFF.OriginLayer.IOLAYER, oFF.ErrorCodes.SYSTEM_IO_HTTP, message, null);
};
oFF.SacUserFileBaseAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onHttpFileProcessed(extResult, data, customIdentifier);
};

oFF.SacUserFsActionFetch = function() {};
oFF.SacUserFsActionFetch.prototype = new oFF.SyncActionExt();
oFF.SacUserFsActionFetch.prototype._ff_c = "SacUserFsActionFetch";

oFF.SacUserFsActionFetch.createAndRun = function(syncType, listener, customIdentifier, fsmr, uri)
{
	let object = new oFF.SacUserFsActionFetch();
	object.m_uri = uri;
	object.setupActionAndRun(syncType, listener, customIdentifier, fsmr);
	return object;
};
oFF.SacUserFsActionFetch.prototype.m_uri = null;
oFF.SacUserFsActionFetch.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onFileSystemFetched(extResult, data, customIdentifier);
};
oFF.SacUserFsActionFetch.prototype.onServerMetadataLoaded = function(extResult, serverMetadata, customIdentifier)
{
	if (extResult.hasErrors())
	{
		this.addAllMessages(extResult);
	}
	this.endSync();
};
oFF.SacUserFsActionFetch.prototype.processSynchronization = function(syncType)
{
	let fileSystem = this.getActionContext().getFileSystemByUri(this.m_uri);
	this.setData(fileSystem);
	fileSystem.loadConnection(this);
	return true;
};

oFF.SacUserFileSystem = function() {};
oFF.SacUserFileSystem.prototype = new oFF.DfXFileSystem();
oFF.SacUserFileSystem.prototype._ff_c = "SacUserFileSystem";

oFF.SacUserFileSystem.create = function(process)
{
	let newObj = new oFF.SacUserFileSystem();
	newObj.m_systemName = "local";
	newObj.setupProcessContext(process);
	let uri = oFF.XUri.createFromFilePath(process, "/", oFF.PathFormat.AUTO_DETECT, oFF.VarResolveMode.NONE, oFF.ProtocolType.FS_SACUSERS);
	newObj.m_rootFile = oFF.SacUserFile.createRoot(process, newObj, uri);
	return newObj;
};
oFF.SacUserFileSystem.createWithSystem = function(process, systemName, uri)
{
	let newObj = new oFF.SacUserFileSystem();
	newObj.m_systemName = systemName;
	newObj.setupProcessContext(process);
	newObj.m_rootFile = oFF.SacUserFile.createRoot(process, newObj, uri);
	return newObj;
};
oFF.SacUserFileSystem.prototype.m_connection = null;
oFF.SacUserFileSystem.prototype.m_rootFile = null;
oFF.SacUserFileSystem.prototype.m_systemName = null;
oFF.SacUserFileSystem.prototype.getChildrenOfRoot = function()
{
	let targetPath = this.getRootFile().getUri().getPath();
	if (oFF.XString.isEqual(targetPath, this.getRootDirectoryUri().getPath()))
	{
		let virtualFolders = oFF.XList.create();
		let parentUri = this.getRootDirectoryUri();
		let root = oFF.XUri.createChildDir(parentUri, null);
		let usersUri = oFF.XUri.createChildDir(root, oFF.SacUserFSConstants.USERS_VIRTUAL_FOLDER);
		let usersFolder = oFF.SacUserFile._create(this.getProcess(), this, usersUri, true);
		let teamsUri = oFF.XUri.createChildDir(root, oFF.SacUserFSConstants.TEAMS_VIRTUAL_FOLDER);
		let teamsFolder = oFF.SacUserFile._create(this.getProcess(), this, teamsUri, true);
		virtualFolders.add(usersFolder);
		virtualFolders.add(teamsFolder);
		return virtualFolders;
	}
	return null;
};
oFF.SacUserFileSystem.prototype.getOrcaConnection = function()
{
	if (oFF.isNull(this.m_connection))
	{
		this.m_connection = this.getProcess().getConnectionPool().getConnection(this.m_systemName);
	}
	return this.m_connection;
};
oFF.SacUserFileSystem.prototype.getProtocolType = function()
{
	return oFF.ProtocolType.FS_SACUSERS;
};
oFF.SacUserFileSystem.prototype.getRootFile = function()
{
	if (oFF.isNull(this.m_rootFile))
	{
		this.m_rootFile = oFF.SacUserFile.createRoot(this.getProcess(), this, this.getRootDirectoryUri());
	}
	return this.m_rootFile;
};
oFF.SacUserFileSystem.prototype.getUserName = function()
{
	return this.getOrcaConnection().getServerMetadata().getOrcaUserName();
};
oFF.SacUserFileSystem.prototype.loadConnection = function(listener)
{
	this.m_connection = this.getProcess().getConnectionPool().getConnection(this.m_systemName);
	this.m_connection.getSystemConnect().getServerMetadataExt(oFF.SyncType.NON_BLOCKING, listener, null);
};
oFF.SacUserFileSystem.prototype.newFile = function(process, uri)
{
	let isRootDirectory = oFF.XString.isEqual(this.getRootDirectoryUri().getPath(), uri.getPath());
	let file = null;
	if (isRootDirectory)
	{
		file = this.getRootFile();
	}
	else
	{
		file = oFF.SacUserFile._create(process, this, uri, false);
	}
	return file;
};
oFF.SacUserFileSystem.prototype.processFetchChildren = function(file, syncType, listener, customIdentifier, config)
{
	return oFF.SacUserFileFetchChildrenAction.createAndRun(syncType, file, this, oFF.SacUserFileRequestListener.create((fileRequestAction) => {
		let data = fileRequestAction.getData();
		if (oFF.notNull(listener))
		{
			listener.onFileProviderChildrenFetched(fileRequestAction, data, data.getProviderChildFiles(), data.getProviderChildrenResultset(), customIdentifier);
		}
	}), config);
};
oFF.SacUserFileSystem.prototype.processProviderFetchMetadata = function(syncType, listener, customIdentifier, sacUserFile)
{
	return oFF.SacUserFileFetchMetadataAction.createAndRun(syncType, sacUserFile, this, oFF.SacUserFileRequestListener.create((fileRequestAction) => {
		let data = fileRequestAction.getData();
		if (oFF.notNull(listener))
		{
			listener.onFileProviderFetchMetadata(fileRequestAction, data, data.getProviderMetadataAndAttributes(), customIdentifier);
		}
	}), customIdentifier);
};

oFF.SacUserFileFetchChildrenAction = function() {};
oFF.SacUserFileFetchChildrenAction.prototype = new oFF.SacUserFileBaseAction();
oFF.SacUserFileFetchChildrenAction.prototype._ff_c = "SacUserFileFetchChildrenAction";

oFF.SacUserFileFetchChildrenAction.create = function(syncType, sacUserFile, fileSystem, sacUserPrefFileRequestListener, config)
{
	let object = new oFF.SacUserFileFetchChildrenAction();
	object.m_file = sacUserFile;
	object.m_paginationConfig = config;
	object.setData(object.m_file);
	object.setupAction(syncType, sacUserPrefFileRequestListener, null, fileSystem);
	return object;
};
oFF.SacUserFileFetchChildrenAction.createAndRun = function(syncType, sacUserFile, fileSystem, sacUserPrefFileRequestListener, config)
{
	let object = oFF.SacUserFileFetchChildrenAction.create(syncType, sacUserFile, fileSystem, sacUserPrefFileRequestListener, config);
	object.process();
	return object;
};
oFF.SacUserFileFetchChildrenAction.prototype.m_file = null;
oFF.SacUserFileFetchChildrenAction.prototype.m_paginationConfig = null;
oFF.SacUserFileFetchChildrenAction.prototype.getFiles = function(response, isTeamFolder)
{
	let uri = oFF.XUri.createChildDir(this.m_file.getUri(), null);
	let process = this.getProcess();
	let fs = this.m_file.getFsBase();
	let files = oFF.XList.create();
	if (response.getRootElement().asStructure().containsKey(oFF.SacUserFSConstants.RESULTS))
	{
		let users = response.getRootElement().asStructure().getListByKey(oFF.SacUserFSConstants.RESULTS);
		for (let i = 0; i < users.size(); i++)
		{
			let parameterElement = users.asList().get(i);
			if (parameterElement.isStructure())
			{
				files.add(oFF.SacUserFile.create(parameterElement, process, fs, uri, isTeamFolder));
			}
		}
	}
	else if (response.getRootElement().asStructure().containsKey(oFF.SacUserFSConstants.DATA))
	{
		let users = response.getRootElement().asStructure().getStructureByKey(oFF.SacUserFSConstants.DATA).getStructureByKey(oFF.SacUserFSConstants.MEMBERS);
		let userIter = users.getKeysAsIterator();
		while (userIter.hasNext())
		{
			let parameterElement = users.getStructureByKey(userIter.next());
			if (parameterElement.isStructure())
			{
				files.add(oFF.SacUserFile.create(parameterElement, process, fs, uri, false));
			}
		}
	}
	else
	{
		this.addResponseError(response);
	}
	let targets = oFF.XList.create();
	for (let i = 0; i < files.size(); i++)
	{
		targets.add(files.get(i));
	}
	return targets;
};
oFF.SacUserFileFetchChildrenAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid())
	{
		if (oFF.notNull(response) && response.getRootElement() !== null && response.getRootElement().getType() === oFF.PrElementType.STRUCTURE)
		{
			let isTeamFolder = oFF.XString.isEqual(this.m_file.getUri().getPath(), oFF.SacUserFSConstants.TEAMS_PATH);
			let targets = this.getFiles(response, isTeamFolder);
			this.m_file.setProviderChildFiles(targets, response.getRootElement().asStructure().getIntegerByKey(oFF.SacUserFSConstants.TOTAL_COUNT));
		}
	}
	else
	{
		this.m_file.addAllMessages(extResult);
	}
	this.endSync();
};
oFF.SacUserFileFetchChildrenAction.prototype.processSynchronization = function(syncType)
{
	let uri;
	let payload = oFF.PrFactory.createStructure();
	let rootUri = this.m_file.getFsBase().getRootDirectoryUri().getPath();
	if (oFF.XString.isEqual(this.m_file.getUri().getPath(), rootUri))
	{
		let rootFolders = this.m_file.getFsBase().getChildrenOfRoot();
		let targets = oFF.XList.create();
		if (oFF.notNull(rootFolders))
		{
			for (let i = 0; i < rootFolders.size(); i++)
			{
				targets.add(rootFolders.get(i));
			}
		}
		this.m_file.setProviderChildFiles(targets, rootFolders.size());
		this.addAllMessages(this.m_file);
		return false;
	}
	else if (!(oFF.XString.isEqual(this.m_file.getName(), oFF.SacUserFSConstants.TEAMS_VIRTUAL_FOLDER)) && !(oFF.XString.isEqual(this.m_file.getName(), oFF.SacUserFSConstants.USERS_VIRTUAL_FOLDER)))
	{
		uri = oFF.XUri.createFromUrl("/sap/fpa/services/rest/epm/objectmgr");
		payload.putString(oFF.SacUserFSConstants.ACTION, oFF.SacUserFSConstants.READ_OBJECT);
		let data = payload.putNewStructure(oFF.SacUserFSConstants.DATA);
		data.putString(oFF.SacUserFSConstants.P1, this.m_file.getName());
	}
	else
	{
		payload.putInteger(oFF.SacUserFSConstants.OFFSET, 0);
		payload.putInteger(oFF.SacUserFSConstants.LIMIT, 50);
		payload.putString(oFF.SacUserFSConstants.QUERY, "");
		if (oFF.notNull(this.m_paginationConfig))
		{
			payload.putInteger(oFF.SacUserFSConstants.OFFSET, this.m_paginationConfig.getOffset());
			payload.putInteger(oFF.SacUserFSConstants.LIMIT, this.m_paginationConfig.getMaxItems());
			if (this.m_paginationConfig.getSearchValue() !== null)
			{
				payload.putString(oFF.SacUserFSConstants.QUERY, this.m_paginationConfig.getSearchValue());
			}
		}
		let stTypes = payload.putNewStructure(oFF.SacUserFSConstants.TYPES);
		if (oFF.XString.isEqual(this.m_file.getUri().getPath(), oFF.XStringUtils.concatenate3(rootUri, oFF.SacUserFSConstants.USERS_VIRTUAL_FOLDER, this.m_file.getFsBase().getRootDirectoryUri().getPath())))
		{
			let userList = stTypes.putNewList(oFF.SacUserFSConstants.USER);
			userList.addString(oFF.SacUserFSConstants.USER);
		}
		else
		{
			let userList = stTypes.putNewList(oFF.SacUserFSConstants.TEAM);
			userList.addString(oFF.SacUserFSConstants.TEAM);
		}
		let stSort = payload.putNewStructure(oFF.SacUserFSConstants.SORT_DEFINITION);
		let displayName = stSort.putNewStructure(oFF.SacUserFSConstants.DISPLAY_NAME);
		displayName.putString(oFF.SacUserFSConstants.ORDER, oFF.SacUserFSConstants.ASCENDING);
		payload.putBoolean(oFF.SacUserFSConstants.AUTH_OVERRIDE, true);
		let options = payload.putNewStructure(oFF.SacUserFSConstants.OPTIONS);
		let excludeList = options.putNewList(oFF.SacUserFSConstants.EXCLUDE_USER_IDS);
		excludeList.addString(this.m_file.getFsBase().getUserName());
		let workspaces = payload.putNewList(oFF.SacUserFSConstants.WORKSPACES);
		if (oFF.notNull(this.m_paginationConfig))
		{
			let filters = this.m_paginationConfig.getCartesianFilter();
			if (!filters.isEmpty())
			{
				workspaces.addString(filters.get(0).getValue());
				payload.putBoolean(oFF.SacUserFSConstants.AUTH_OVERRIDE, false);
			}
		}
		uri = oFF.XUri.createFromUrl("/sap/fpa/services/rest/epm/security/list/principals");
	}
	let connection = this.getActionContext().getOrcaConnection();
	let ocpFunction = connection.newRpcFunctionByUri(uri);
	ocpFunction.setServiceName(oFF.SystemServices.SAC_SERVICE);
	ocpFunction.getRpcRequest().setMethod(oFF.HttpRequestMethod.HTTP_POST);
	ocpFunction.getRpcRequest().setRequestStructure(payload);
	ocpFunction.processFunctionExecution(syncType, this, null);
	return true;
};

oFF.SacUserFileFetchMetadataAction = function() {};
oFF.SacUserFileFetchMetadataAction.prototype = new oFF.SacUserFileBaseAction();
oFF.SacUserFileFetchMetadataAction.prototype._ff_c = "SacUserFileFetchMetadataAction";

oFF.SacUserFileFetchMetadataAction.createAndRun = function(syncType, sacUserFile, fileSystem, listener, customIdentifier)
{
	let object = new oFF.SacUserFileFetchMetadataAction();
	object.m_file = sacUserFile;
	object.setData(object.m_file);
	object.setupActionAndRun(syncType, listener, customIdentifier, fileSystem);
	return object;
};
oFF.SacUserFileFetchMetadataAction.prototype.m_file = null;
oFF.SacUserFileFetchMetadataAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.endSync();
};
oFF.SacUserFileFetchMetadataAction.prototype.processSynchronization = function(syncType)
{
	return false;
};

oFF.SacUserModule = function() {};
oFF.SacUserModule.prototype = new oFF.DfModule();
oFF.SacUserModule.prototype._ff_c = "SacUserModule";

oFF.SacUserModule.s_module = null;
oFF.SacUserModule.getInstance = function()
{
	if (oFF.isNull(oFF.SacUserModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.RuntimeModule.getInstance());
		oFF.SacUserModule.s_module = oFF.DfModule.startExt(new oFF.SacUserModule());
		oFF.ProgramRegistry.setProgramFactory(new oFF.SubSysFsSacUserPrg());
		oFF.DfModule.stopExt(oFF.SacUserModule.s_module);
	}
	return oFF.SacUserModule.s_module;
};
oFF.SacUserModule.prototype.getName = function()
{
	return "ff2120.orca.users.fs";
};

oFF.SacUserModule.getInstance();

return oFF;
} );
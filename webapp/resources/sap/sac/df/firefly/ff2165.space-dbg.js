/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff1500.dataprovider.api","sap/sac/df/firefly/ff1600.menuengine.api","sap/sac/df/firefly/ff2130.composable.fs"
],
function(oFF)
{
"use strict";

oFF.DataApplicationNotifications = {

	NOTIFY_DATA_PROVIDER_CREATED:"DataApplication.DataProviderCreated",
	NOTIFY_DATA_PROVIDER_EVENT_FIRED:"DataApplication.DataProviderEventFired",
	NOTIFY_DATA_PROVIDER_RELEASED:"DataApplication.DataProviderReleased",
	PARAM_DATA_PROVIDER_EVENT_OBJECT:"DataApplication.DataProviderEventObject",
	PARAM_DATA_PROVIDER_EVENT_TYPE:"DataApplication.DataProviderEventType",
	PARAM_DATA_PROVIDER_NAME:"DataApplication.DataProviderName"
};

oFF.AsConfigManagerSafeAccess = {

	s_fallbackConfigManager:null,
	s_fallbackConfigManagerProvider:null,
	from:function(dataApplication)
	{
			let result = null;
		if (oFF.XObjectExt.isValidObject(dataApplication))
		{
			result = dataApplication.getConfigManager();
		}
		else if (oFF.notNull(oFF.AsConfigManagerSafeAccess.s_fallbackConfigManager))
		{
			result = oFF.AsConfigManagerSafeAccess.s_fallbackConfigManager;
		}
		else if (oFF.notNull(oFF.AsConfigManagerSafeAccess.s_fallbackConfigManagerProvider))
		{
			oFF.AsConfigManagerSafeAccess.s_fallbackConfigManager = oFF.AsConfigManagerSafeAccess.s_fallbackConfigManagerProvider();
			result = oFF.AsConfigManagerSafeAccess.s_fallbackConfigManager;
		}
		return result;
	},
	getChartConfigFromProcess:function(process)
	{
			let configManager = oFF.AsConfigManagerSafeAccess.from(process.findEntity(oFF.ProcessEntity.DATA_APPLICATION));
		let configuration = null;
		if (oFF.notNull(configManager))
		{
			configuration = configManager.getChartConfig();
		}
		return configuration;
	},
	getFeatureConfigFromProcess:function(process)
	{
			let configManager = oFF.AsConfigManagerSafeAccess.from(process.findEntity(oFF.ProcessEntity.DATA_APPLICATION));
		let configuration = null;
		if (oFF.notNull(configManager))
		{
			configuration = configManager.getFeatureConfig();
		}
		return configuration;
	},
	setSupplier:function(supplier)
	{
			oFF.AsConfigManagerSafeAccess.s_fallbackConfigManagerProvider = supplier;
	}
};

oFF.PluginConstants = {

	DATA_PROVIDER_COMMAND_PLUGIN_NAME:"DataProviderCommand",
	PARAM_CONFIG:"config",
	PARAM_CONFIG_FILE:"configFile",
	PARAM_DATA_PROVIDER_NAME:"dataProviderName",
	PARAM_PLUGIN_NAME:"pluginName",
	PARAM_WORKSPACE_DIR:"workspaceDir",
	VISUALIZATION_RENDERER_DOCUMENT_PLUGIN_NAME:"VisualizationRendererDocument"
};

oFF.ProgramConstants = {

	DATA_PROVIDER_PROGRAM_NAME:"DataProvider",
	HORIZON_PROGRAM_NAME:"Horizon"
};

oFF.AsContentSections = {

	CONNECTION:"Connection",
	DATA_PROVIDER_START_CONNECTION:"DataProviderStartConnection"
};

oFF.AsMenuMapperFactory = {

	s_menuMapperSupplier:null,
	s_menuTreeGeneratorSupplier:null,
	createGenericMenuMapper:function(menuTreeGenerator)
	{
			return (oFF.isNull(oFF.AsMenuMapperFactory.s_menuMapperSupplier) || oFF.isNull(menuTreeGenerator)) ? null : oFF.AsMenuMapperFactory.s_menuMapperSupplier(menuTreeGenerator);
	},
	createMenuTreeGenerator:function()
	{
			return oFF.isNull(oFF.AsMenuMapperFactory.s_menuTreeGeneratorSupplier) ? null : oFF.AsMenuMapperFactory.s_menuTreeGeneratorSupplier();
	},
	setMenuMapperSupplier:function(menuMapperSupplier)
	{
			oFF.AsMenuMapperFactory.s_menuMapperSupplier = menuMapperSupplier;
	},
	setMenuTreeGeneratorSupplier:function(menuTreeGeneratorSupplier)
	{
			oFF.AsMenuMapperFactory.s_menuTreeGeneratorSupplier = menuTreeGeneratorSupplier;
	}
};

oFF.DataProviderManagerProgram = function() {};
oFF.DataProviderManagerProgram.prototype = new oFF.DfProgram();
oFF.DataProviderManagerProgram.prototype._ff_c = "DataProviderManagerProgram";

oFF.DataProviderManagerProgram.ARGUMENTS_MARKUP_TABLE_HEADER = "||Name||Type||Description||";
oFF.DataProviderManagerProgram.COMMAND_CREATE = "create";
oFF.DataProviderManagerProgram.COMMAND_DESTROY = "destroy";
oFF.DataProviderManagerProgram.COMMAND_EXECUTE = "execute";
oFF.DataProviderManagerProgram.COMMAND_LIST = "list";
oFF.DataProviderManagerProgram.COMMAND_MARKUP = "markup";
oFF.DataProviderManagerProgram.PARAM_ACTION_ARGUMENTS = "args";
oFF.DataProviderManagerProgram.PARAM_ACTION_NAME = "action";
oFF.DataProviderManagerProgram.PARAM_COMMAND = "command";
oFF.DataProviderManagerProgram.PARAM_DATASOURCE = "datasource";
oFF.DataProviderManagerProgram.PARAM_DP_CONFIG = "dpConfig";
oFF.DataProviderManagerProgram.PARAM_PATH = "path";
oFF.DataProviderManagerProgram.PARAM_SYSTEM = "system";
oFF.DataProviderManagerProgram.PROGRAM_NAME = "dp";
oFF.DataProviderManagerProgram.prototype.m_actionName = null;
oFF.DataProviderManagerProgram.prototype.m_command = null;
oFF.DataProviderManagerProgram.prototype.m_datasource = null;
oFF.DataProviderManagerProgram.prototype.m_path = null;
oFF.DataProviderManagerProgram.prototype.m_remainingParameters = null;
oFF.DataProviderManagerProgram.prototype.m_serializedDpConfig = null;
oFF.DataProviderManagerProgram.prototype.m_systemName = null;
oFF.DataProviderManagerProgram.prototype._getDpConfig = function()
{
	let tmpConfig = null;
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_serializedDpConfig))
	{
		let tmpElement = oFF.PrUtils.deserialize(this.m_serializedDpConfig);
		if (oFF.notNull(tmpElement) && tmpElement.isStructure())
		{
			tmpConfig = tmpElement.asStructure();
		}
	}
	if (oFF.isNull(tmpConfig))
	{
		tmpConfig = oFF.PrFactory.createStructure();
		tmpConfig.putBoolean("startAsConnected", true);
	}
	tmpConfig.putBoolean("isDataProviderManager", true);
	return tmpConfig;
};
oFF.DataProviderManagerProgram.prototype.getDataProviderManager = function()
{
	let dataApplication = this.getProcess().findEntity(oFF.ProcessEntity.DATA_APPLICATION);
	return dataApplication.getDataProviderManager();
};
oFF.DataProviderManagerProgram.prototype.getProgramName = function()
{
	return oFF.DataProviderManagerProgram.PROGRAM_NAME;
};
oFF.DataProviderManagerProgram.prototype.getProgramType = function()
{
	return oFF.ProgramType.BACKGROUND;
};
oFF.DataProviderManagerProgram.prototype.newProgram = function()
{
	let newPrg = new oFF.DataProviderManagerProgram();
	newPrg.setup();
	return newPrg;
};
oFF.DataProviderManagerProgram.prototype.prepareProgramMetadata = function(metadata)
{
	metadata.addParameter(oFF.DataProviderManagerProgram.PARAM_COMMAND, "The cli command to be run");
	metadata.addParameter(oFF.DataProviderManagerProgram.PARAM_PATH, "The file path where the Data Provider should be saved");
	metadata.addOption(oFF.DataProviderManagerProgram.PARAM_SYSTEM, "The system to be used by the Data Provider", null, oFF.XValueType.STRING);
	metadata.addOption(oFF.DataProviderManagerProgram.PARAM_DATASOURCE, "The full-qualified name of the datasource", null, oFF.XValueType.STRING);
	metadata.addOption(oFF.DataProviderManagerProgram.PARAM_DP_CONFIG, "The optional config to be passed to the Data Provider during creation. Serialized json", null, oFF.XValueType.STRING);
	metadata.addOption(oFF.DataProviderManagerProgram.PARAM_ACTION_NAME, "The action to be run on the Data Provider", null, oFF.XValueType.STRING);
};
oFF.DataProviderManagerProgram.prototype.printActionsAsMarkup = function(dataProvider)
{
	let stdout = this.getStdout();
	let publishedActions = 0;
	let categories = dataProvider.getBasicActions().getActionCategories();
	let actionManifests = dataProvider.getBasicActions().getActionManifests().createListCopy();
	let actionComparator = oFF.XComparatorName.create();
	actionManifests.sortByComparator(actionComparator);
	let finalBuffer = oFF.XStringBuffer.create();
	let intermediaryBuffer = oFF.XStringBuffer.create();
	for (let category = 0; category < categories.size(); category++)
	{
		let categoryName = categories.get(category);
		let categoryBuffer = oFF.XStringBuffer.create();
		categoryBuffer.append(oFF.XStringUtils.concatenate3("h1. *", categoryName, "*")).appendNewLine();
		for (let action = 0; action < actionManifests.size(); action++)
		{
			if (oFF.XString.isEqual(actionManifests.get(action).getCategory(), categoryName))
			{
				if (oFF.XString.isEqual(categoryName, categoryBuffer.toString()))
				{
					categoryBuffer.appendNewLine();
				}
				categoryBuffer.append("h2. ");
				categoryBuffer.append(this.printDPActionAsMarkup(actionManifests.get(action)));
				publishedActions++;
			}
		}
		if (oFF.XString.isEqual(oFF.XStringUtils.concatenate4("h1. *", categoryName, "*", "\n"), categoryBuffer.toString()))
		{
			categoryBuffer.append("No commands currently exist in this category.").appendNewLine();
		}
		intermediaryBuffer.append(categoryBuffer.toString());
	}
	finalBuffer.append("*Total Data Provider Commands:* ").appendInt(publishedActions).appendNewLine();
	finalBuffer.append("{toc:printable=false|style=disc|maxLevel=1|indent=5px|minLevel=1|outline=true|include=.*}").appendNewLine();
	finalBuffer.append(intermediaryBuffer.toString());
	stdout.println(finalBuffer.toString());
};
oFF.DataProviderManagerProgram.prototype.printAllCommands = function()
{
	let stdout = this.getStdout();
	stdout.println("Available commands:");
	stdout.println(oFF.XStringUtils.concatenate2(oFF.DataProviderManagerProgram.COMMAND_LIST, " - Show available Data Providers"));
	stdout.println(oFF.XStringUtils.concatenate2(oFF.DataProviderManagerProgram.COMMAND_CREATE, " - Create a Data Provider. Params: path, system and dataSource"));
	stdout.println(oFF.XStringUtils.concatenate2(oFF.DataProviderManagerProgram.COMMAND_DESTROY, " - Destroy a Data Provider. Params: path"));
	stdout.println(oFF.XStringUtils.concatenate2(oFF.DataProviderManagerProgram.COMMAND_EXECUTE, " - Execute an action on a Data Provider. Params: path, actionName, actionParameters"));
	stdout.println(oFF.XStringUtils.concatenate2(oFF.DataProviderManagerProgram.COMMAND_MARKUP, " - See all commands in Wiki Markup. Params: path"));
};
oFF.DataProviderManagerProgram.prototype.printAvailableDPs = function()
{
	let stdout = this.getStdout();
	let dataProviderNames = this.getDataProviderManager().getDataProviderNames();
	if (dataProviderNames.isEmpty())
	{
		stdout.print("There are currently no available Data Providers.");
	}
	else
	{
		stdout.println("Available Data Providers:");
		oFF.XCollectionUtils.forEach(dataProviderNames, (dpName) => {
			stdout.println(dpName);
		});
	}
};
oFF.DataProviderManagerProgram.prototype.printCreateHelp = function()
{
	let stdout = this.getStdout();
	stdout.println("Please provide valid parameters:");
	stdout.println(oFF.XStringUtils.concatenate2(oFF.DataProviderManagerProgram.PARAM_PATH, " - The file path to save the Data Provider"));
	stdout.println(oFF.XStringUtils.concatenate2(oFF.DataProviderManagerProgram.PARAM_SYSTEM, " - The system to operate on, e.g. KIW"));
	stdout.println(oFF.XStringUtils.concatenate2(oFF.DataProviderManagerProgram.PARAM_DATASOURCE, " - The full-qualified datasource, e.g. query:[0BICS_C03_BICSTEST_Q0000]"));
};
oFF.DataProviderManagerProgram.prototype.printDPAction = function(actionManifest)
{
	let buffer = oFF.XStringBuffer.create();
	buffer.append(actionManifest.getName());
	let parameterDefinitions = actionManifest.getParameterList();
	buffer.append("(");
	if (oFF.XCollectionUtils.hasElements(parameterDefinitions))
	{
		for (let j = 0; j < parameterDefinitions.size(); j++)
		{
			let parameterDefinition = parameterDefinitions.get(j);
			buffer.append(parameterDefinition.getType().getName());
			buffer.append(" ");
			buffer.append(parameterDefinition.getName());
			if (j + 1 < parameterDefinitions.size())
			{
				buffer.append(", ");
			}
		}
	}
	buffer.append(")").appendNewLine();
	return buffer.toString();
};
oFF.DataProviderManagerProgram.prototype.printDPActionAsMarkup = function(actionManifest)
{
	let buffer = oFF.XStringBuffer.create();
	let parameterDefinitions = actionManifest.getParameterList();
	let tableHeader = oFF.XStringBuffer.create().append(oFF.DataProviderManagerProgram.ARGUMENTS_MARKUP_TABLE_HEADER);
	let tableBody = oFF.XStringBuffer.create();
	buffer.append(actionManifest.getName()).append(" - ").append(actionManifest.getStage()).appendNewLine();
	buffer.append(actionManifest.getDescription()).appendNewLine();
	if (!parameterDefinitions.isEmpty())
	{
		buffer.append("Arguments:").appendNewLine();
		if (oFF.XCollectionUtils.hasElements(parameterDefinitions))
		{
			for (let j = 0; j < parameterDefinitions.size(); j++)
			{
				let parameterDefinition = parameterDefinitions.get(j);
				tableBody.append("|");
				tableBody.append(oFF.XStringUtils.concatenate2(parameterDefinition.getName(), "|"));
				tableBody.append(oFF.XStringUtils.concatenate2(parameterDefinition.getType().getName(), "|"));
				tableBody.append(oFF.XStringUtils.concatenate2(parameterDefinition.getDescription(), "|"));
				if ((parameterDefinition.getDefaultValue() !== null) && oFF.XString.isEqual(tableHeader.toString(), oFF.DataProviderManagerProgram.ARGUMENTS_MARKUP_TABLE_HEADER))
				{
					tableHeader.append("Default Value||");
					tableBody.append(oFF.XStringUtils.concatenate2(parameterDefinition.getDefaultValue().asString().toString(), "|"));
				}
				else if (!oFF.XString.isEqual(tableHeader.toString(), oFF.DataProviderManagerProgram.ARGUMENTS_MARKUP_TABLE_HEADER))
				{
					tableBody.append("|");
				}
				tableBody.appendNewLine();
			}
		}
		buffer.append(tableHeader.toString()).appendNewLine();
		buffer.append(tableBody.toString()).appendNewLine();
	}
	else
	{
		buffer.append("This command has no arguments.").appendNewLine();
	}
	buffer.append("*Review Date:* ").append(actionManifest.getReviewDate()).appendNewLine().appendNewLine();
	return buffer.toString();
};
oFF.DataProviderManagerProgram.prototype.printDPActions = function(dataProvider)
{
	let stdout = this.getStdout();
	stdout.println("Available actions:");
	let categories = dataProvider.getBasicActions().getActionCategories();
	let actionManifests = dataProvider.getBasicActions().getActionManifests().createListCopy();
	let actionComparator = oFF.XComparatorName.create();
	actionManifests.sortByComparator(actionComparator);
	let buffer = oFF.XStringBuffer.create();
	for (let category = 0; category < categories.size(); category++)
	{
		let categoryName = categories.get(category);
		let categoryBuffer = oFF.XStringBuffer.create();
		categoryBuffer.append(categoryName);
		for (let action = 0; action < actionManifests.size(); action++)
		{
			if (oFF.XString.isEqual(actionManifests.get(action).getCategory(), categoryName))
			{
				if (oFF.XString.isEqual(categoryName, categoryBuffer.toString()))
				{
					categoryBuffer.append(":").appendNewLine();
				}
				categoryBuffer.append("    ");
				categoryBuffer.append(this.printDPAction(actionManifests.get(action)));
			}
		}
		if (oFF.XString.isEqual(categoryName, categoryBuffer.toString()))
		{
			categoryBuffer.flush();
		}
		else
		{
			categoryBuffer.appendNewLine();
			buffer.append(categoryBuffer.toString());
		}
	}
	stdout.println(buffer.toString());
};
oFF.DataProviderManagerProgram.prototype.printDestroyHelp = function()
{
	let stdout = this.getStdout();
	stdout.println("Please provide valid parameters:");
	stdout.println(oFF.XStringUtils.concatenate2(oFF.DataProviderManagerProgram.PARAM_PATH, " - The file path to save the Data Provider"));
};
oFF.DataProviderManagerProgram.prototype.printExecuteHelp = function()
{
	let stdout = this.getStdout();
	stdout.println("Please provide valid parameters:");
	stdout.println(oFF.XStringUtils.concatenate2(oFF.DataProviderManagerProgram.PARAM_PATH, " - The path to he Data Provider you wish to execute this command on"));
	stdout.println(oFF.XStringUtils.concatenate2(oFF.DataProviderManagerProgram.PARAM_ACTION_NAME, " - The action you wish to execute"));
	stdout.println(oFF.XStringUtils.concatenate2(oFF.DataProviderManagerProgram.PARAM_ACTION_ARGUMENTS, " - The arguments for the action"));
};
oFF.DataProviderManagerProgram.prototype.processArguments = function(args)
{
	this.m_command = args.getStringByKey(oFF.DataProviderManagerProgram.PARAM_COMMAND);
	this.m_path = args.getStringByKey(oFF.DataProviderManagerProgram.PARAM_PATH);
	let argumentList = args.getArgumentList();
	if (oFF.XString.isEqual(this.m_command, oFF.DataProviderManagerProgram.COMMAND_CREATE))
	{
		if (argumentList.size() >= 4)
		{
			this.m_systemName = argumentList.get(2);
			this.m_datasource = argumentList.get(3);
			if (argumentList.size() >= 5)
			{
				this.m_serializedDpConfig = argumentList.get(4);
			}
		}
		else
		{
			this.m_systemName = args.getStringByKey(oFF.DataProviderManagerProgram.PARAM_SYSTEM);
			this.m_datasource = args.getStringByKey(oFF.DataProviderManagerProgram.PARAM_DATASOURCE);
			this.m_serializedDpConfig = args.getStringByKey(oFF.DataProviderManagerProgram.PARAM_DP_CONFIG);
		}
	}
	if (oFF.XString.isEqual(this.m_command, oFF.DataProviderManagerProgram.COMMAND_EXECUTE) && argumentList.size() >= 3)
	{
		this.m_actionName = argumentList.get(2);
		this.m_remainingParameters = oFF.XList.create();
		for (let i = 3; i < argumentList.size(); i++)
		{
			this.m_remainingParameters.add(argumentList.get(i));
		}
	}
};
oFF.DataProviderManagerProgram.prototype.processConfiguration = function(configuration) {};
oFF.DataProviderManagerProgram.prototype.runAction = function()
{
	let stdout = this.getStdout();
	if (oFF.XStringUtils.isNullOrEmpty(this.m_path))
	{
		this.printExecuteHelp();
		this.exitNow(0);
		return false;
	}
	let dataProvider = this.getDataProviderManager().getDataProvider(this.m_path);
	if (oFF.XStringUtils.isNullOrEmpty(this.m_path) || oFF.isNull(dataProvider))
	{
		if (oFF.isNull(dataProvider))
		{
			stdout.println(oFF.XStringUtils.concatenate2("Data Provider not found: ", this.m_path));
		}
		this.printAvailableDPs();
		this.exitNow(-1);
		return false;
	}
	if (oFF.XStringUtils.isNullOrEmpty(this.m_actionName))
	{
		this.printDPActions(dataProvider);
		this.exitNow(0);
		return false;
	}
	let parameters = oFF.XList.create();
	for (let i = 0; i < this.m_remainingParameters.size(); i++)
	{
		parameters.add(this.m_remainingParameters.get(i));
	}
	if (this.validateAction(dataProvider, this.m_actionName, parameters))
	{
		dataProvider.getStringActions().executeActionByName(this.m_actionName, parameters).then((result) => {
			if (oFF.notNull(result))
			{
				if (!oFF.XString.isEqual(result.toString(), ""))
				{
					stdout.println(result.toString());
				}
			}
			return result;
		}, (err) => {
			stdout.println(err.getText());
			return err;
		}).onThen((fulfilled) => {
			this.exitNow(0);
		}).onCatch((err) => {
			this.exitNow(-1);
		});
	}
	else
	{
		stdout.println(oFF.XStringUtils.concatenate2("Invalid arguments for action: ", this.m_actionName));
		let manifest = dataProvider.getBasicActions().getActionManifest(this.m_actionName);
		if (oFF.isNull(manifest))
		{
			stdout.println("Action does not exist.");
		}
		else
		{
			stdout.println(oFF.XStringUtils.concatenate2("Correct format: ", this.printDPAction(manifest)));
		}
		this.exitNow(-1);
	}
	return true;
};
oFF.DataProviderManagerProgram.prototype.runCreate = function()
{
	let stdout = this.getStdout();
	if (oFF.XStringUtils.isNullOrEmpty(this.m_path) || oFF.XStringUtils.isNullOrEmpty(this.m_systemName) || oFF.XStringUtils.isNullOrEmpty(this.m_datasource))
	{
		this.printCreateHelp();
		this.exitNow(0);
		return false;
	}
	if (this.getDataProviderManager().getDataProvider(this.m_path) !== null)
	{
		stdout.println(oFF.XStringUtils.concatenate2("Path already exists: ", this.m_path));
		this.exitNow(-1);
		return false;
	}
	let dpUri = oFF.XUri.createFromUrl(this.m_path);
	let dpName = dpUri.getPathContainer().getFileName();
	let dpConfig = this.getDataProviderManager().createDataProviderConfig(this.getProcess().getParentProcess(), dpName);
	dpConfig.deserializeJson(this._getDpConfig());
	dpConfig.getStartConnection().setSystemName(this.m_systemName);
	dpConfig.getStartConnection().setDataSourceName(this.m_datasource);
	this.getDataProviderManager().createDataProvider(dpConfig).onThen((dp) => {
		stdout.println("creation successful");
		this.printAvailableDPs();
		this.exitNow(0);
	}).onCatch((err) => {
		stdout.println(oFF.XStringUtils.concatenate2("Data Provider creation failed: ", err.getText()));
		this.getDataProviderManager().releaseDataProvider(this.m_path);
		this.exitNow(-1);
	});
	return true;
};
oFF.DataProviderManagerProgram.prototype.runDestroy = function()
{
	let stdout = this.getStdout();
	if (oFF.XStringUtils.isNullOrEmpty(this.m_path))
	{
		this.printDestroyHelp();
		this.exitNow(0);
		return false;
	}
	let foundDataProvider = this.getDataProviderManager().getDataProvider(this.m_path);
	if (oFF.isNull(foundDataProvider))
	{
		stdout.println(oFF.XStringUtils.concatenate2("Could not find Data Provider for the specified path: ", this.m_path));
		this.exitNow(0);
		return false;
	}
	stdout.println("Shutting down...");
	foundDataProvider.getBasicActions().getBasicLifecycleActions().disconnectDataProvider().onThen((result) => {
		oFF.XObjectExt.release(foundDataProvider);
		stdout.println("Data Provider successfully destroyed");
	}).onCatch((err) => {
		stdout.println("destruction failed");
		stdout.println(err.getText());
	}).onThen((fulfilled) => {
		this.exitNow(0);
	}).onCatch((err) => {
		this.exitNow(-1);
	});
	return true;
};
oFF.DataProviderManagerProgram.prototype.runMarkup = function()
{
	let stdout = this.getStdout();
	if (oFF.isNull(this.m_path))
	{
		stdout.println("No path provided.\nCorrect usage: dp markup path");
		this.exitNow(-1);
		return false;
	}
	let dataProvider = this.getDataProviderManager().getDataProvider(this.m_path);
	if (oFF.XStringUtils.isNullOrEmpty(this.m_path) || oFF.isNull(dataProvider))
	{
		if (oFF.isNull(dataProvider))
		{
			stdout.println(oFF.XStringUtils.concatenate2("Data Provider not found: ", this.m_path));
		}
		this.printAvailableDPs();
		this.exitNow(-1);
		return false;
	}
	this.printActionsAsMarkup(dataProvider);
	this.exitNow(0);
	return true;
};
oFF.DataProviderManagerProgram.prototype.runProcess = function()
{
	let stdout = this.getStdout();
	if (oFF.XStringUtils.isNullOrEmpty(this.m_command))
	{
		this.printAllCommands();
		this.exitNow(0);
		return false;
	}
	if (oFF.XString.isEqual(this.m_command, oFF.DataProviderManagerProgram.COMMAND_LIST))
	{
		this.printAvailableDPs();
		this.exitNow(0);
		return false;
	}
	if (oFF.XString.isEqual(this.m_command, oFF.DataProviderManagerProgram.COMMAND_CREATE))
	{
		return this.runCreate();
	}
	if (oFF.XString.isEqual(this.m_command, oFF.DataProviderManagerProgram.COMMAND_DESTROY))
	{
		return this.runDestroy();
	}
	if (oFF.XString.isEqual(this.m_command, oFF.DataProviderManagerProgram.COMMAND_EXECUTE))
	{
		return this.runAction();
	}
	if (oFF.XString.isEqual(this.m_command, oFF.DataProviderManagerProgram.COMMAND_MARKUP))
	{
		return this.runMarkup();
	}
	stdout.println(oFF.XStringUtils.concatenate2("Unknown command: ", this.m_command));
	this.exitNow(-1);
	return false;
};
oFF.DataProviderManagerProgram.prototype.setupProcess = function()
{
	return null;
};
oFF.DataProviderManagerProgram.prototype.validateAction = function(dataProvider, actionName, parameters)
{
	let actionManifest = dataProvider.getBasicActions().getActionManifest(actionName);
	if (oFF.isNull(actionManifest))
	{
		return false;
	}
	let manifestParameters = actionManifest.getParameterList();
	if (manifestParameters.size() >= parameters.size())
	{
		for (let i = 0; i < manifestParameters.size(); i++)
		{
			if (manifestParameters.get(i).getDefaultValue() === null && parameters.get(i) === null)
			{
				return false;
			}
		}
	}
	else if (parameters.size() > manifestParameters.size())
	{
		return false;
	}
	return true;
};

oFF.SpaceComponentType = function() {};
oFF.SpaceComponentType.prototype = new oFF.XComponentType();
oFF.SpaceComponentType.prototype._ff_c = "SpaceComponentType";

oFF.SpaceComponentType.DATA_APPLICATION = null;
oFF.SpaceComponentType.createSpaceComponentType = function(name, parent)
{
	let newConstant = new oFF.SpaceComponentType();
	newConstant.setupExt(name, parent);
	return newConstant;
};
oFF.SpaceComponentType.staticSetupSpaceComponents = function()
{
	oFF.SpaceComponentType.DATA_APPLICATION = oFF.SpaceComponentType.createSpaceComponentType("DataApplication", oFF.XComponentType._ROOT);
};

oFF.AsContentType = function() {};
oFF.AsContentType.prototype = new oFF.ContentType();
oFF.AsContentType.prototype._ff_c = "AsContentType";

oFF.AsContentType.AGGREGATION = null;
oFF.AsContentType.s_lookup = null;
oFF.AsContentType._createExt = function(name, parent, fileExt, fileExt2, fileExt3)
{
	let newContentType = new oFF.AsContentType();
	newContentType.setupContentType(name, null, parent, fileExt, fileExt2, fileExt3);
	oFF.AsContentType.s_lookup.put(name, newContentType);
	return newContentType;
};
oFF.AsContentType.staticSetupSpaceContentType = function()
{
	oFF.AsContentType.s_lookup = oFF.XHashMapByString.create();
	oFF.AsContentType.AGGREGATION = oFF.AsContentType._createExt("ComposableSpaceContentAggregation", oFF.ContentType.JSON, "csa", null, null);
};

oFF.SpaceModule = function() {};
oFF.SpaceModule.prototype = new oFF.DfModule();
oFF.SpaceModule.prototype._ff_c = "SpaceModule";

oFF.SpaceModule.s_module = null;
oFF.SpaceModule.getInstance = function()
{
	if (oFF.isNull(oFF.SpaceModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.ComposableFsModule.getInstance());
		oFF.SpaceModule.s_module = oFF.DfModule.startExt(new oFF.SpaceModule());
		oFF.CoGlobalConfigurationUtils.setSupplier((gpr) => {
			return oFF.AsConfigManagerSafeAccess.getFeatureConfigFromProcess(gpr);
		});
		oFF.CoChartDefaultConfigurationUtils.setSupplier((cpr) => {
			return oFF.AsConfigManagerSafeAccess.getChartConfigFromProcess(cpr);
		});
		oFF.SpaceComponentType.staticSetupSpaceComponents();
		oFF.AsContentType.staticSetupSpaceContentType();
		oFF.ProgramRegistry.setProgramFactory(new oFF.DataProviderManagerProgram());
		oFF.DfModule.stopExt(oFF.SpaceModule.s_module);
	}
	return oFF.SpaceModule.s_module;
};
oFF.SpaceModule.prototype.getName = function()
{
	return "ff2165.space";
};

oFF.SpaceModule.getInstance();

return oFF;
} );
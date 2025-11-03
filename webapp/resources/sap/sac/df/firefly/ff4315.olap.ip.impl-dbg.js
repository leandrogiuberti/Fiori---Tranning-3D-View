/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff4310.olap.impl"
],
function(oFF)
{
"use strict";

oFF.XCommandCallback = function() {};
oFF.XCommandCallback.prototype = new oFF.XObject();
oFF.XCommandCallback.prototype._ff_c = "XCommandCallback";

oFF.XCommandCallback.create = function(callbackListener)
{
	let callback = new oFF.XCommandCallback();
	callback.m_callbackListener = callbackListener;
	return callback;
};
oFF.XCommandCallback.prototype.m_callbackListener = null;
oFF.XCommandCallback.prototype.onCommandProcessed = function(extResult, commandResult, customIdentifier)
{
	this.m_callbackListener.onXCommandCallbackProcessed(extResult, commandResult, customIdentifier);
};

oFF.XPlanningCommandCallback = function() {};
oFF.XPlanningCommandCallback.prototype = new oFF.XObject();
oFF.XPlanningCommandCallback.prototype._ff_c = "XPlanningCommandCallback";

oFF.XPlanningCommandCallback.create = function(commandListener)
{
	let callback = new oFF.XPlanningCommandCallback();
	callback.m_commandListener = commandListener;
	return callback;
};
oFF.XPlanningCommandCallback.prototype.m_commandListener = null;
oFF.XPlanningCommandCallback.prototype.onCommandProcessed = function(extPlanningCommandResult)
{
	this.m_commandListener.onXPlanningCommandProcessed(extPlanningCommandResult);
};

oFF.PlanningState = {

	isApplicable:function(application, systemName, response)
	{
			if (oFF.isNull(application))
		{
			return false;
		}
		if (oFF.XStringUtils.isNullOrEmpty(systemName))
		{
			return false;
		}
		return oFF.notNull(response);
	},
	update:function(application, systemName, response, messageCollector)
	{
			if (oFF.PlanningState.isApplicable(application, systemName, response))
		{
			oFF.DataAreaState.updateState(application, systemName, response);
			oFF.PlanningModel.updateState(application, systemName, response, messageCollector);
		}
	},
	updateFromResponse:function(application, systemName, request, response, messageCollector)
	{
			if (oFF.PlanningState.isApplicable(application, systemName, response) && oFF.notNull(request))
		{
			oFF.PlanningModel.updateStateFromResponse(application, systemName, request, response, messageCollector);
		}
	}
};

oFF.DataAreaState = function() {};
oFF.DataAreaState.prototype = new oFF.XObject();
oFF.DataAreaState.prototype._ff_c = "DataAreaState";

oFF.DataAreaState.SINGLETON_KEY = "com.oFF.ip.da.DataAreaState.Map";
oFF.DataAreaState.createDataAreaState = function(application, systemName, dataArea, environment, model, cellLocking)
{
	let dataAreaStates = oFF.DataAreaState.getDataAreaStates(application, systemName);
	if (oFF.isNull(dataAreaStates))
	{
		return null;
	}
	let dataAreaName = dataArea;
	if (oFF.XStringUtils.isNullOrEmpty(dataAreaName))
	{
		dataAreaName = "DEFAULT";
	}
	let cellLockingType = cellLocking;
	if (oFF.isNull(cellLockingType))
	{
		cellLockingType = oFF.CellLockingType.DEFAULT_SETTING_BACKEND;
	}
	let dataAreaState = dataAreaStates.getByKey(dataAreaName);
	if (oFF.notNull(dataAreaState))
	{
		throw oFF.XException.createIllegalStateException("data area already existing");
	}
	if (oFF.XString.isEqual(dataAreaName, "DEFAULT"))
	{
		if (oFF.XStringUtils.isNotNullAndNotEmpty(environment))
		{
			throw oFF.XException.createIllegalStateException("DEFAULT data area - environment not supported");
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(model))
		{
			throw oFF.XException.createIllegalStateException("DEFAULT data area - model not supported");
		}
	}
	dataAreaState = new oFF.DataAreaState();
	dataAreaState.m_systemName = systemName;
	dataAreaState.m_dataArea = dataAreaName;
	dataAreaState.setModel(model);
	dataAreaState.setEnvrionment(environment);
	dataAreaState.setCellLocking(cellLockingType);
	dataAreaState.setChangeCounter(-1);
	dataAreaState.setChangedData(false);
	dataAreaState.setWorkStatusActive(false);
	dataAreaStates.put(dataAreaState.m_dataArea, dataAreaState);
	return dataAreaState;
};
oFF.DataAreaState.getDataAreaState = function(dataArea)
{
	if (oFF.isNull(dataArea))
	{
		return null;
	}
	let planningService = dataArea.getPlanningService();
	return oFF.DataAreaState.getDataAreaStateByPlanningService(planningService);
};
oFF.DataAreaState.getDataAreaStateByName = function(application, systemName, dataArea)
{
	let dataAreaStates = oFF.DataAreaState.getDataAreaStates(application, systemName);
	if (oFF.isNull(dataAreaStates))
	{
		return null;
	}
	let dataAreaName = dataArea;
	if (oFF.XStringUtils.isNullOrEmpty(dataAreaName))
	{
		dataAreaName = "DEFAULT";
	}
	return dataAreaStates.getByKey(dataAreaName);
};
oFF.DataAreaState.getDataAreaStateByPlanningService = function(planningService)
{
	if (oFF.isNull(planningService))
	{
		return null;
	}
	let serviceConfig = planningService.getPlanningServiceConfig();
	if (oFF.isNull(serviceConfig))
	{
		return null;
	}
	let systemType = serviceConfig.getSystemType();
	if (!systemType.isTypeOf(oFF.SystemType.BW))
	{
		return null;
	}
	let properties = serviceConfig.getProperties();
	if (oFF.isNull(properties))
	{
		return null;
	}
	let planningServiceDataArea = properties.getStringByKeyExt(oFF.PlanningConstants.DATA_AREA, "DEFAULT");
	return oFF.DataAreaState.getDataAreaStateByName(planningService.getApplication(), serviceConfig.getSystemName(), planningServiceDataArea);
};
oFF.DataAreaState.getDataAreaStateByQueryConsumerService = function(queryManager)
{
	if (oFF.isNull(queryManager))
	{
		return null;
	}
	let systemType = queryManager.getSystemType();
	if (!systemType.isTypeOf(oFF.SystemType.BW))
	{
		return null;
	}
	let datasource = queryManager.getDataSource();
	if (oFF.isNull(datasource))
	{
		return null;
	}
	let queryDataArea = datasource.getDataArea();
	if (oFF.XStringUtils.isNullOrEmpty(queryDataArea))
	{
		queryDataArea = "DEFAULT";
	}
	return oFF.DataAreaState.getDataAreaStateByName(queryManager.getApplication(), queryManager.getSystemName(), queryDataArea);
};
oFF.DataAreaState.getDataAreaStates = function(application, systemName)
{
	if (oFF.isNull(application))
	{
		return null;
	}
	if (oFF.XStringUtils.isNullOrEmpty(systemName))
	{
		return null;
	}
	let singletons = application.getSession().getSessionSingletons();
	if (oFF.isNull(singletons))
	{
		return null;
	}
	let system2DataAreaStates = singletons.getByKey(oFF.DataAreaState.SINGLETON_KEY);
	if (oFF.isNull(system2DataAreaStates))
	{
		system2DataAreaStates = oFF.XHashMapByString.create();
		singletons.put(oFF.DataAreaState.SINGLETON_KEY, system2DataAreaStates);
	}
	let dataAreaStates = system2DataAreaStates.getByKey(systemName);
	if (oFF.isNull(dataAreaStates))
	{
		dataAreaStates = oFF.XHashMapByString.create();
		system2DataAreaStates.put(systemName, dataAreaStates);
	}
	return dataAreaStates;
};
oFF.DataAreaState.getQueryConsumerServices = function(dataArea)
{
	return oFF.DataAreaUtil.getQueryConsumerServices(dataArea);
};
oFF.DataAreaState.getQueryConsumerServicesByName = function(application, systemName, dataArea)
{
	return oFF.DataAreaUtil.getQueryConsumerServicesByName(application, systemName, dataArea);
};
oFF.DataAreaState.removeDataAreaState = function(dataArea)
{
	if (oFF.isNull(dataArea))
	{
		return;
	}
	let planningService = dataArea.getPlanningService();
	oFF.DataAreaState.removeDataAreaStateByPlanningService(planningService);
};
oFF.DataAreaState.removeDataAreaStateByName = function(application, systemName, dataArea)
{
	let dataAreaStates = oFF.DataAreaState.getDataAreaStates(application, systemName);
	if (oFF.isNull(dataAreaStates))
	{
		return;
	}
	let dataAreaName = dataArea;
	if (oFF.XStringUtils.isNullOrEmpty(dataAreaName))
	{
		dataAreaName = "DEFAULT";
	}
	dataAreaStates.remove(dataAreaName);
};
oFF.DataAreaState.removeDataAreaStateByPlanningService = function(planningService)
{
	if (oFF.isNull(planningService))
	{
		return;
	}
	let serviceConfig = planningService.getPlanningServiceConfig();
	if (oFF.isNull(serviceConfig))
	{
		return;
	}
	let systemType = serviceConfig.getSystemType();
	if (!systemType.isTypeOf(oFF.SystemType.BW))
	{
		return;
	}
	let properties = serviceConfig.getProperties();
	if (oFF.isNull(properties))
	{
		return;
	}
	let planningServiceDataArea = properties.getStringByKeyExt(oFF.PlanningConstants.DATA_AREA, "DEFAULT");
	oFF.DataAreaState.removeDataAreaStateByName(planningService.getApplication(), serviceConfig.getSystemName(), planningServiceDataArea);
};
oFF.DataAreaState.updateState = function(application, systemName, response)
{
	let systemLandscape = application.getSystemLandscape();
	if (oFF.isNull(systemLandscape))
	{
		return;
	}
	let systemDescription = systemLandscape.getSystemDescription(systemName);
	if (oFF.isNull(systemDescription))
	{
		return;
	}
	let systemType = systemDescription.getSystemType();
	if (!systemType.isTypeOf(oFF.SystemType.BW))
	{
		return;
	}
	let dataAreasList = oFF.PrUtils.getListProperty(response, "DataAreas");
	if (oFF.isNull(dataAreasList))
	{
		return;
	}
	for (let i = 0; i < dataAreasList.size(); i++)
	{
		let dataAreaStructure = oFF.PrUtils.getStructureElement(dataAreasList, i);
		if (oFF.isNull(dataAreaStructure))
		{
			continue;
		}
		let nameString = oFF.PrUtils.getStringProperty(dataAreaStructure, "Name");
		if (oFF.isNull(nameString))
		{
			continue;
		}
		let dataAreaState = oFF.DataAreaState.getDataAreaStateByName(application, systemName, nameString.getString());
		if (oFF.isNull(dataAreaState))
		{
			continue;
		}
		dataAreaState.setSubmitted();
		let modelString = oFF.PrUtils.getStringProperty(dataAreaStructure, "Model");
		if (oFF.notNull(modelString))
		{
			dataAreaState.setModel(modelString.getString());
		}
		let environmentString = oFF.PrUtils.getStringProperty(dataAreaStructure, "Environment");
		if (oFF.notNull(environmentString))
		{
			dataAreaState.setEnvrionment(environmentString.getString());
		}
		let cellLockingString = oFF.PrUtils.getStringProperty(dataAreaStructure, "CellLocking");
		if (oFF.notNull(cellLockingString))
		{
			dataAreaState.setCellLocking(oFF.CellLockingType.lookupByBWName(cellLockingString.getString()));
		}
		let changeCounterNumber = oFF.PrUtils.getNumberProperty(dataAreaStructure, "ChangeCounter");
		if (oFF.notNull(changeCounterNumber))
		{
			dataAreaState.setChangeCounter(changeCounterNumber.getInteger());
		}
		let changedDataBoolean = oFF.PrUtils.getBooleanProperty(dataAreaStructure, "HasChangedData");
		if (oFF.notNull(changedDataBoolean))
		{
			dataAreaState.setChangedData(changedDataBoolean.getBoolean());
		}
		let workStatusActiveBoolean = oFF.PrUtils.getBooleanProperty(dataAreaStructure, "IsWorkStatusActive");
		if (oFF.notNull(workStatusActiveBoolean))
		{
			dataAreaState.setWorkStatusActive(workStatusActiveBoolean.getBoolean());
		}
	}
};
oFF.DataAreaState.prototype.m_cellLocking = null;
oFF.DataAreaState.prototype.m_changeCounter = 0;
oFF.DataAreaState.prototype.m_changedData = false;
oFF.DataAreaState.prototype.m_dataArea = null;
oFF.DataAreaState.prototype.m_environment = null;
oFF.DataAreaState.prototype.m_model = null;
oFF.DataAreaState.prototype.m_submitted = false;
oFF.DataAreaState.prototype.m_systemName = null;
oFF.DataAreaState.prototype.m_workStatusActive = false;
oFF.DataAreaState.prototype.getCellLocking = function()
{
	return this.m_cellLocking;
};
oFF.DataAreaState.prototype.getChangeCounter = function()
{
	return this.m_changeCounter;
};
oFF.DataAreaState.prototype.getDataArea = function()
{
	return this.m_dataArea;
};
oFF.DataAreaState.prototype.getEnvironment = function()
{
	return this.m_environment;
};
oFF.DataAreaState.prototype.getModel = function()
{
	return this.m_model;
};
oFF.DataAreaState.prototype.getSystemName = function()
{
	return this.m_systemName;
};
oFF.DataAreaState.prototype.hasChangedData = function()
{
	return this.m_changedData;
};
oFF.DataAreaState.prototype.isEqualSettings = function(environment, model, cellLocking)
{
	if (!oFF.XString.isEqual(this.m_environment, environment))
	{
		return false;
	}
	if (!oFF.XString.isEqual(this.m_model, model))
	{
		return false;
	}
	return this.m_cellLocking === cellLocking;
};
oFF.DataAreaState.prototype.isSubmitted = function()
{
	return this.m_submitted;
};
oFF.DataAreaState.prototype.isWorkStatusActive = function()
{
	return this.m_workStatusActive;
};
oFF.DataAreaState.prototype.releaseObject = function()
{
	this.m_systemName = null;
	this.m_dataArea = null;
	this.m_environment = null;
	this.m_model = null;
	this.m_cellLocking = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.DataAreaState.prototype.serializeToJson = function()
{
	let structure = oFF.PrFactory.createStructure();
	structure.putStringNotNull("Name", this.m_dataArea);
	structure.putStringNotNull("Environment", this.m_environment);
	structure.putStringNotNull("Model", this.m_model);
	structure.putString("BackendCellLocking", this.m_cellLocking.toBwName());
	return structure;
};
oFF.DataAreaState.prototype.setCellLocking = function(cellLocking)
{
	if (oFF.isNull(cellLocking))
	{
		this.m_cellLocking = oFF.CellLockingType.DEFAULT_SETTING_BACKEND;
	}
	else
	{
		this.m_cellLocking = cellLocking;
	}
};
oFF.DataAreaState.prototype.setChangeCounter = function(changeCounter)
{
	this.m_changeCounter = changeCounter;
};
oFF.DataAreaState.prototype.setChangedData = function(changedData)
{
	this.m_changedData = changedData;
};
oFF.DataAreaState.prototype.setEnvrionment = function(environment)
{
	if (oFF.XStringUtils.isNullOrEmpty(environment))
	{
		this.m_environment = null;
	}
	else
	{
		this.m_environment = environment;
	}
};
oFF.DataAreaState.prototype.setModel = function(model)
{
	if (oFF.XStringUtils.isNullOrEmpty(model))
	{
		this.m_model = null;
	}
	else
	{
		this.m_model = model;
	}
};
oFF.DataAreaState.prototype.setSubmitted = function()
{
	this.m_submitted = true;
};
oFF.DataAreaState.prototype.setWorkStatusActive = function(workStatusActive)
{
	this.m_workStatusActive = workStatusActive;
};

oFF.PlanningOperationMetadata = function() {};
oFF.PlanningOperationMetadata.prototype = new oFF.XObject();
oFF.PlanningOperationMetadata.prototype._ff_c = "PlanningOperationMetadata";

oFF.PlanningOperationMetadata.prototype.m_dataArea = null;
oFF.PlanningOperationMetadata.prototype.m_dimensions = null;
oFF.PlanningOperationMetadata.prototype.m_instanceId = null;
oFF.PlanningOperationMetadata.prototype.m_planningOperationIdentifier = null;
oFF.PlanningOperationMetadata.prototype.m_variables = null;
oFF.PlanningOperationMetadata.prototype.getDataArea = function()
{
	return this.m_dataArea;
};
oFF.PlanningOperationMetadata.prototype.getDimensions = function()
{
	return this.m_dimensions;
};
oFF.PlanningOperationMetadata.prototype.getInstanceId = function()
{
	return this.m_instanceId;
};
oFF.PlanningOperationMetadata.prototype.getPlanningOperationIdentifier = function()
{
	return this.m_planningOperationIdentifier;
};
oFF.PlanningOperationMetadata.prototype.getVariables = function()
{
	return this.m_variables;
};
oFF.PlanningOperationMetadata.prototype.setDataArea = function(dataArea)
{
	this.m_dataArea = dataArea;
};
oFF.PlanningOperationMetadata.prototype.setDimenstions = function(dimensions)
{
	this.m_dimensions = dimensions;
};
oFF.PlanningOperationMetadata.prototype.setInstanceId = function(instanceId)
{
	this.m_instanceId = instanceId;
};
oFF.PlanningOperationMetadata.prototype.setPlanningOperationIdentifier = function(planningOperationIdentifier)
{
	this.m_planningOperationIdentifier = planningOperationIdentifier;
};
oFF.PlanningOperationMetadata.prototype.setVariables = function(variables)
{
	this.m_variables = variables;
};

oFF.PlanningSequenceStepMetadata = function() {};
oFF.PlanningSequenceStepMetadata.prototype = new oFF.XObject();
oFF.PlanningSequenceStepMetadata.prototype._ff_c = "PlanningSequenceStepMetadata";

oFF.PlanningSequenceStepMetadata.prototype.m_baseDatasource = null;
oFF.PlanningSequenceStepMetadata.prototype.m_commandType = null;
oFF.PlanningSequenceStepMetadata.prototype.m_filterName = null;
oFF.PlanningSequenceStepMetadata.prototype.m_number = 0;
oFF.PlanningSequenceStepMetadata.prototype.m_planningFunctionDescription = null;
oFF.PlanningSequenceStepMetadata.prototype.m_planningFunctionName = null;
oFF.PlanningSequenceStepMetadata.prototype.m_queryName = null;
oFF.PlanningSequenceStepMetadata.prototype.m_type = null;
oFF.PlanningSequenceStepMetadata.prototype.getBaseDataSource = function()
{
	return this.m_baseDatasource;
};
oFF.PlanningSequenceStepMetadata.prototype.getCommendType = function()
{
	return this.m_commandType;
};
oFF.PlanningSequenceStepMetadata.prototype.getFilterName = function()
{
	return this.m_filterName;
};
oFF.PlanningSequenceStepMetadata.prototype.getNumber = function()
{
	return this.m_number;
};
oFF.PlanningSequenceStepMetadata.prototype.getPlanningFunctionDescription = function()
{
	return this.m_planningFunctionDescription;
};
oFF.PlanningSequenceStepMetadata.prototype.getPlanningFunctionName = function()
{
	return this.m_planningFunctionName;
};
oFF.PlanningSequenceStepMetadata.prototype.getQueryName = function()
{
	return this.m_queryName;
};
oFF.PlanningSequenceStepMetadata.prototype.getType = function()
{
	return this.m_type;
};
oFF.PlanningSequenceStepMetadata.prototype.setBaseDataSource = function(baseDatasource)
{
	this.m_baseDatasource = baseDatasource;
};
oFF.PlanningSequenceStepMetadata.prototype.setCommendType = function(type)
{
	this.m_commandType = type;
};
oFF.PlanningSequenceStepMetadata.prototype.setFilterName = function(filterName)
{
	this.m_filterName = filterName;
};
oFF.PlanningSequenceStepMetadata.prototype.setNumber = function(number)
{
	this.m_number = number;
};
oFF.PlanningSequenceStepMetadata.prototype.setPlanningFunctionDescription = function(description)
{
	this.m_planningFunctionDescription = description;
};
oFF.PlanningSequenceStepMetadata.prototype.setPlanningFunctionName = function(name)
{
	this.m_planningFunctionName = name;
};
oFF.PlanningSequenceStepMetadata.prototype.setQueryName = function(name)
{
	this.m_queryName = name;
};
oFF.PlanningSequenceStepMetadata.prototype.setType = function(type)
{
	this.m_type = type;
};

oFF.PlanningBatchRequestDecorator = function() {};
oFF.PlanningBatchRequestDecorator.prototype = new oFF.XObject();
oFF.PlanningBatchRequestDecorator.prototype._ff_c = "PlanningBatchRequestDecorator";

oFF.PlanningBatchRequestDecorator.getBatchRequestDecorator = function(requestStructure)
{
	if (oFF.isNull(requestStructure))
	{
		return null;
	}
	let planningStructure = oFF.PrUtils.getStructureProperty(requestStructure, "Planning");
	if (oFF.isNull(planningStructure))
	{
		return null;
	}
	let commandsList = oFF.PrUtils.getListProperty(planningStructure, "commands");
	if (oFF.isNull(commandsList))
	{
		return null;
	}
	let requestItems = oFF.XList.create();
	for (let i = 0; i < commandsList.size(); i++)
	{
		let requestStructureElement = oFF.PrUtils.getStructureElement(commandsList, i);
		oFF.XObjectExt.assertNotNullExt(requestStructureElement, "illegal planning batch commands syntax");
		let planningRequestItems = oFF.PrFactory.createStructure();
		planningRequestItems.put("Planning", requestStructureElement);
		requestItems.add(planningRequestItems);
	}
	let decorator = new oFF.PlanningBatchRequestDecorator();
	decorator.m_requestItems = requestItems;
	return decorator;
};
oFF.PlanningBatchRequestDecorator.prototype.m_requestItems = null;
oFF.PlanningBatchRequestDecorator.prototype.buildResponse = function(responseItems)
{
	if (responseItems.size() !== this.getItemsSize())
	{
		throw oFF.XException.createIllegalStateException("illegal planning batch response structure");
	}
	let result = oFF.PrFactory.createStructure();
	let planningList = result.putNewList("Planning");
	for (let i = 0; i < responseItems.size(); i++)
	{
		let responseStructure = responseItems.get(i);
		let planningStructure = oFF.PrUtils.getStructureProperty(responseStructure, "Planning");
		oFF.XObjectExt.assertNotNullExt(planningStructure, "illegal planning batch response structure");
		planningList.add(planningStructure);
	}
	return result;
};
oFF.PlanningBatchRequestDecorator.prototype.getItemsSize = function()
{
	return this.m_requestItems.size();
};
oFF.PlanningBatchRequestDecorator.prototype.getRequestItems = function()
{
	return this.m_requestItems;
};

oFF.PlanningBatchRequestDecoratorProvider = function() {};
oFF.PlanningBatchRequestDecoratorProvider.prototype = new oFF.XObject();
oFF.PlanningBatchRequestDecoratorProvider.prototype._ff_c = "PlanningBatchRequestDecoratorProvider";

oFF.PlanningBatchRequestDecoratorProvider.CLAZZ = null;
oFF.PlanningBatchRequestDecoratorProvider.staticSetup = function()
{
	oFF.PlanningBatchRequestDecoratorProvider.CLAZZ = oFF.XClass.create(oFF.PlanningBatchRequestDecoratorProvider);
};
oFF.PlanningBatchRequestDecoratorProvider.prototype.getBatchRequestDecorator = function(requestStructure)
{
	return oFF.PlanningBatchRequestDecorator.getBatchRequestDecorator(requestStructure);
};

oFF.PlanningRsRequestDecorator = function() {};
oFF.PlanningRsRequestDecorator.prototype = new oFF.XObject();
oFF.PlanningRsRequestDecorator.prototype._ff_c = "PlanningRsRequestDecorator";

oFF.PlanningRsRequestDecorator.getResultsetRequestDecorator = function(application, systemDescription, requestStructure)
{
	if (oFF.isNull(application))
	{
		return null;
	}
	if (oFF.isNull(systemDescription))
	{
		return null;
	}
	let systemType = systemDescription.getSystemType();
	if (oFF.isNull(systemType))
	{
		return null;
	}
	if (!systemType.isTypeOf(oFF.SystemType.HANA))
	{
		return null;
	}
	if (oFF.isNull(requestStructure))
	{
		return null;
	}
	let analyticsStructure = oFF.PrUtils.getStructureProperty(requestStructure, "Analytics");
	if (oFF.isNull(analyticsStructure))
	{
		return null;
	}
	let definitionStructure = oFF.PrUtils.getStructureProperty(analyticsStructure, "Definition");
	if (oFF.isNull(definitionStructure))
	{
		return null;
	}
	let newValuesList = oFF.PrUtils.getListProperty(definitionStructure, "NewValues");
	if (oFF.PrUtils.isListEmpty(newValuesList))
	{
		return null;
	}
	let dataSourceStructure = oFF.PrUtils.getStructureProperty(analyticsStructure, "DataSource");
	if (oFF.isNull(dataSourceStructure))
	{
		return null;
	}
	let typeString = oFF.PrUtils.getStringProperty(dataSourceStructure, "Type");
	if (oFF.isNull(typeString))
	{
		return null;
	}
	let type = oFF.MetaObjectType.lookup(typeString.getString());
	if (oFF.isNull(type))
	{
		return null;
	}
	if (type !== oFF.MetaObjectType.PLANNING)
	{
		return null;
	}
	let dataSource = oFF.QFactory.createDataSourceWithType(type, oFF.PrUtils.getStringValueProperty(dataSourceStructure, "ObjectName", null));
	dataSource.setSchemaName(oFF.PrUtils.getStringValueProperty(dataSourceStructure, "SchemaName", null));
	let systemName = systemDescription.getSystemName();
	let planningService = oFF.PlanningModelUtil.getPlanningServiceFromQueryDataSource(application, systemName, dataSource);
	if (oFF.isNull(planningService))
	{
		return null;
	}
	let planningModel = planningService.getPlanningContext();
	if (oFF.isNull(planningModel))
	{
		return null;
	}
	let refreshCommand = planningModel.createCommandRefresh();
	if (oFF.isNull(refreshCommand))
	{
		return null;
	}
	let planningRefreshStructure = refreshCommand.serializeToElement(oFF.QModelFormat.INA_DATA).asStructure();
	if (oFF.isNull(planningRefreshStructure))
	{
		return null;
	}
	let planningBatchDecorator = oFF.PlanningBatchRequestDecorator.getBatchRequestDecorator(planningRefreshStructure);
	let decoratedRequest = oFF.PrFactory.createStructure();
	let batchList = decoratedRequest.putNewList(oFF.ConnectionConstants.INA_BATCH);
	batchList.add(requestStructure);
	if (oFF.isNull(planningBatchDecorator))
	{
		batchList.add(planningRefreshStructure);
	}
	else
	{
		let planningRequests = planningBatchDecorator.getRequestItems();
		if (oFF.notNull(planningRequests))
		{
			for (let i = 0; i < planningRequests.size(); i++)
			{
				batchList.add(planningRequests.get(i));
			}
		}
	}
	let decorator = new oFF.PlanningRsRequestDecorator();
	decorator.m_decoratedRequest = decoratedRequest;
	decorator.m_planningRequest = planningRefreshStructure;
	decorator.m_planningBatchDecorator = planningBatchDecorator;
	return decorator;
};
oFF.PlanningRsRequestDecorator.prototype.m_decoratedRequest = null;
oFF.PlanningRsRequestDecorator.prototype.m_planningBatchDecorator = null;
oFF.PlanningRsRequestDecorator.prototype.m_planningRequest = null;
oFF.PlanningRsRequestDecorator.prototype.m_planningResponse = null;
oFF.PlanningRsRequestDecorator.prototype.buildResponse = function(decoratedResponse)
{
	this.m_planningResponse = null;
	if (oFF.isNull(decoratedResponse))
	{
		return null;
	}
	let batchList = oFF.PrUtils.getListProperty(decoratedResponse, oFF.ConnectionConstants.INA_BATCH);
	if (oFF.isNull(batchList))
	{
		return null;
	}
	let expectedBatchSize;
	if (oFF.isNull(this.m_planningBatchDecorator))
	{
		expectedBatchSize = 2;
	}
	else
	{
		expectedBatchSize = 1 + this.m_planningBatchDecorator.getItemsSize();
	}
	if (batchList.size() !== expectedBatchSize)
	{
		return null;
	}
	let rsResponseStructure = oFF.PrUtils.getStructureElement(batchList, 0);
	if (oFF.isNull(rsResponseStructure))
	{
		return null;
	}
	oFF.PrUtils.removeProperty(rsResponseStructure, "Planning");
	let planningResponseStructure;
	if (oFF.isNull(this.m_planningBatchDecorator))
	{
		planningResponseStructure = oFF.PrUtils.getStructureElement(batchList, 1);
	}
	else
	{
		let responseItems = oFF.XList.create();
		for (let planningBatchIndex = 1; planningBatchIndex < expectedBatchSize; planningBatchIndex++)
		{
			responseItems.add(oFF.PrUtils.getStructureElement(batchList, planningBatchIndex));
		}
		planningResponseStructure = this.m_planningBatchDecorator.buildResponse(responseItems);
	}
	if (oFF.isNull(planningResponseStructure))
	{
		return null;
	}
	this.m_planningResponse = planningResponseStructure;
	return rsResponseStructure;
};
oFF.PlanningRsRequestDecorator.prototype.getDecoratedRequest = function()
{
	return this.m_decoratedRequest;
};
oFF.PlanningRsRequestDecorator.prototype.getPlanningRequest = function()
{
	return this.m_planningRequest;
};
oFF.PlanningRsRequestDecorator.prototype.getPlanningResponse = function()
{
	return this.m_planningResponse;
};

oFF.PlanningRsRequestDecoratorProvider = function() {};
oFF.PlanningRsRequestDecoratorProvider.prototype = new oFF.XObject();
oFF.PlanningRsRequestDecoratorProvider.prototype._ff_c = "PlanningRsRequestDecoratorProvider";

oFF.PlanningRsRequestDecoratorProvider.CLAZZ = null;
oFF.PlanningRsRequestDecoratorProvider.staticSetup = function()
{
	oFF.PlanningRsRequestDecoratorProvider.CLAZZ = oFF.XClass.create(oFF.PlanningRsRequestDecoratorProvider);
};
oFF.PlanningRsRequestDecoratorProvider.prototype.getResultsetRequestDecorator = function(application, systemDescription, requestStructure)
{
	return oFF.PlanningRsRequestDecorator.getResultsetRequestDecorator(application, systemDescription, requestStructure);
};

oFF.InputEnablementRule = function() {};
oFF.InputEnablementRule.prototype = new oFF.XObject();
oFF.InputEnablementRule.prototype._ff_c = "InputEnablementRule";

oFF.InputEnablementRule.createRule = function(mode, reason)
{
	let obj = new oFF.InputEnablementRule();
	obj.m_mode = mode;
	obj.m_reason = reason;
	return obj;
};
oFF.InputEnablementRule.prototype.m_mode = null;
oFF.InputEnablementRule.prototype.m_reason = null;
oFF.InputEnablementRule.prototype.cloneExt = function(flags)
{
	return oFF.InputEnablementRule.createRule(this.m_mode, this.m_reason);
};
oFF.InputEnablementRule.prototype.getMode = function()
{
	return this.m_mode;
};
oFF.InputEnablementRule.prototype.getReason = function()
{
	return this.m_reason;
};
oFF.InputEnablementRule.prototype.releaseObject = function()
{
	this.m_mode = null;
	this.m_reason = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.PlanningManager = function() {};
oFF.PlanningManager.prototype = new oFF.XObject();
oFF.PlanningManager.prototype._ff_c = "PlanningManager";

oFF.PlanningManager.create = function(queryManager)
{
	let planningManager = new oFF.PlanningManager();
	planningManager.m_queryManager = oFF.XWeakReferenceUtil.getWeakRef(queryManager);
	planningManager.m_allPlanningVersionSettings = oFF.XList.create();
	planningManager.m_planningActionSequenceSettingsMode = oFF.PlanningVersionSettingsMode.SERVER_DEFAULT;
	planningManager.m_versionAliases = oFF.XHashMapByString.create();
	planningManager.m_inputReadinessRules = oFF.XList.create();
	return planningManager;
};
oFF.PlanningManager.prototype.m_allPlanningVersionSettings = null;
oFF.PlanningManager.prototype.m_inputReadinessCacheMode = null;
oFF.PlanningManager.prototype.m_inputReadinessMainQuery = null;
oFF.PlanningManager.prototype.m_inputReadinessRules = null;
oFF.PlanningManager.prototype.m_isPublicVersionEditPossible = false;
oFF.PlanningManager.prototype.m_planningActionSequenceSettingsMode = null;
oFF.PlanningManager.prototype.m_queryManager = null;
oFF.PlanningManager.prototype.m_versionAliases = null;
oFF.PlanningManager.prototype.m_versionRestrictionType = null;
oFF.PlanningManager.prototype.addInputReadinessFilterState = function(flag, parameter)
{
	let queryModel = this.getQueryModel();
	if (oFF.notNull(queryModel))
	{
		queryModel.addInputReadinessFilterState(flag, parameter);
	}
};
oFF.PlanningManager.prototype.addNewInputEnablementRule = function(mode, reason)
{
	let newRule = oFF.InputEnablementRule.createRule(mode, reason);
	this.m_inputReadinessRules.add(newRule);
	return newRule;
};
oFF.PlanningManager.prototype.addPlanningVersionSettings = function(sequenceSettings)
{
	if (oFF.isNull(sequenceSettings))
	{
		return null;
	}
	let existingSettings = this.findPlanningActionSequenceSettingsInternal(sequenceSettings);
	if (this.isPlanningVersionSettingsEqual(existingSettings, sequenceSettings))
	{
		return existingSettings;
	}
	this.m_allPlanningVersionSettings.removeElement(existingSettings);
	this.m_allPlanningVersionSettings.add(sequenceSettings);
	this.getQueryManager().invalidateState();
	return sequenceSettings;
};
oFF.PlanningManager.prototype.clearInputEnablementRules = function()
{
	this.m_inputReadinessRules.clear();
};
oFF.PlanningManager.prototype.clearInputReadinessFilter = function()
{
	let queryModel = this.getQueryModel();
	if (oFF.notNull(queryModel))
	{
		queryModel.clearInputReadinessFilter();
	}
};
oFF.PlanningManager.prototype.clearVersionAliases = function()
{
	this.m_versionAliases.clear();
	let queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.invalidateState();
	}
};
oFF.PlanningManager.prototype.copyFrom = function(other, flags)
{
	oFF.XObject.prototype.copyFrom.call( this , other, flags);
	let otherPlanningManager = other;
	this.m_inputReadinessRules = oFF.XCollectionUtils.createListOfClones(otherPlanningManager.getInputEnablementRules());
	this.m_inputReadinessMainQuery = otherPlanningManager.getInputReadinessMainQuery();
};
oFF.PlanningManager.prototype.createDataAreaCommand = function(commandType)
{
	let dataArea = this.getDataArea();
	return oFF.isNull(dataArea) ? null : dataArea.createPlanningContextCommand(commandType);
};
oFF.PlanningManager.prototype.createDataAreaCommandDocReset = function()
{
	return this.createDataAreaCommand(oFF.PlanningContextCommandType.DOC_RESET);
};
oFF.PlanningManager.prototype.createDataAreaCommandDocSave = function()
{
	return this.createDataAreaCommand(oFF.PlanningContextCommandType.DOC_SAVE);
};
oFF.PlanningManager.prototype.createDataAreaCommandRefresh = function()
{
	return this.createDataAreaCommand(oFF.PlanningContextCommandType.REFRESH);
};
oFF.PlanningManager.prototype.deletePlanningVersionSettings = function(versionIdentifier)
{
	let settings = this.findPlanningActionSequenceSettingsInternal(versionIdentifier);
	return this.m_allPlanningVersionSettings.removeElement(settings);
};
oFF.PlanningManager.prototype.findPlanningActionSequenceSettingsInternal = function(versionIdentifier)
{
	if (oFF.isNull(versionIdentifier))
	{
		return null;
	}
	let versionUniqueName = versionIdentifier.getVersionUniqueName();
	let allPlanningVersionSettingsSize = this.m_allPlanningVersionSettings.size();
	for (let i = 0; i < allPlanningVersionSettingsSize; i++)
	{
		let settings = this.m_allPlanningVersionSettings.get(i);
		if (oFF.XString.isEqual(settings.getVersionUniqueName(), versionUniqueName))
		{
			return settings;
		}
	}
	return null;
};
oFF.PlanningManager.prototype.getAllPlanningVersionSettings = function()
{
	return this.m_allPlanningVersionSettings;
};
oFF.PlanningManager.prototype.getDataArea = function()
{
	let dataAreaName = this.getDataAreaName();
	if (oFF.XStringUtils.isNullOrEmpty(dataAreaName))
	{
		return null;
	}
	let queryManager = this.getQueryManager();
	let application = queryManager.getApplication();
	if (oFF.isNull(application))
	{
		return null;
	}
	let planningService = oFF.DataAreaUtil.getPlanningService(application, queryManager.getSystemName(), dataAreaName);
	if (oFF.isNull(planningService))
	{
		return null;
	}
	let planningContext = planningService.getPlanningContext();
	if (oFF.isNull(planningContext))
	{
		return null;
	}
	return planningContext;
};
oFF.PlanningManager.prototype.getDataAreaName = function()
{
	let queryModel = this.getQueryModel();
	if (oFF.isNull(queryModel))
	{
		return null;
	}
	return queryModel.getDataArea();
};
oFF.PlanningManager.prototype.getInputEnablementRules = function()
{
	return this.m_inputReadinessRules;
};
oFF.PlanningManager.prototype.getInputReadinessCacheMode = function()
{
	return this.m_inputReadinessCacheMode;
};
oFF.PlanningManager.prototype.getInputReadinessFilter = function()
{
	let queryModel = this.getQueryModel();
	if (oFF.notNull(queryModel))
	{
		return queryModel.getInputReadinessFilter();
	}
	return null;
};
oFF.PlanningManager.prototype.getInputReadinessMainQuery = function()
{
	return this.m_inputReadinessMainQuery;
};
oFF.PlanningManager.prototype.getPlanningMode = function()
{
	return this.getQueryModel().getPlanningMode();
};
oFF.PlanningManager.prototype.getPlanningModel = function()
{
	let queryManager = this.getQueryManager();
	if (this.getQueryManager().isReleased())
	{
		return null;
	}
	let application = queryManager.getApplication();
	if (oFF.isNull(application))
	{
		return null;
	}
	let dataSource = queryManager.getDataSource();
	if (oFF.isNull(dataSource))
	{
		return null;
	}
	let planningService = oFF.PlanningModelUtil.getPlanningServiceFromQueryDataSource(application, queryManager.getSystemName(), dataSource);
	if (oFF.isNull(planningService))
	{
		return null;
	}
	let planningContext = planningService.getPlanningContext();
	if (oFF.isNull(planningContext))
	{
		return null;
	}
	return planningContext;
};
oFF.PlanningManager.prototype.getPlanningRestriction = function()
{
	return this.m_versionRestrictionType;
};
oFF.PlanningManager.prototype.getPlanningVersionIdentifier = function(versionId, sharedVersion, versionOwner)
{
	return oFF.PlanningVersionIdentifier.create(versionId, sharedVersion, versionOwner);
};
oFF.PlanningManager.prototype.getPlanningVersionSettings = function(versionIdentifier, sequenceId, useExternalView)
{
	return oFF.PlanningVersionSettings.create(versionIdentifier, sequenceId, useExternalView);
};
oFF.PlanningManager.prototype.getPlanningVersionSettingsMode = function()
{
	if (oFF.isNull(this.m_planningActionSequenceSettingsMode))
	{
		return oFF.PlanningVersionSettingsMode.SERVER_DEFAULT;
	}
	return this.m_planningActionSequenceSettingsMode;
};
oFF.PlanningManager.prototype.getPlanningVersionSettingsSimple = function(versionId, sequenceId, useExternalView)
{
	return oFF.PlanningVersionSettingsSimple.create(versionId, sequenceId, useExternalView);
};
oFF.PlanningManager.prototype.getQueryManager = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_queryManager);
};
oFF.PlanningManager.prototype.getQueryModel = function()
{
	return this.getQueryManager().getQueryModelBase();
};
oFF.PlanningManager.prototype.getResultSetContainer = function()
{
	return this.getQueryManager().getActiveResultSetContainer();
};
oFF.PlanningManager.prototype.getVersionAliases = function()
{
	return this.m_versionAliases;
};
oFF.PlanningManager.prototype.hasChangedCells = function()
{
	let resultSetContainer = this.getResultSetContainer();
	if (!resultSetContainer.hasDataEntryCollection())
	{
		return false;
	}
	let dataEntryCollection = resultSetContainer.getDataEntryCollection();
	return dataEntryCollection.hasChangedDataEntries();
};
oFF.PlanningManager.prototype.hasChangedValueLocks = function()
{
	let resultSetContainer = this.getResultSetContainer();
	if (!resultSetContainer.hasDataEntryCollection())
	{
		return false;
	}
	let dataEntryCollection = resultSetContainer.getDataEntryCollection();
	return dataEntryCollection.hasChangedValueLocks();
};
oFF.PlanningManager.prototype.hasChangedValues = function()
{
	let resultSetContainer = this.getResultSetContainer();
	if (!resultSetContainer.hasDataEntryCollection())
	{
		return false;
	}
	let dataEntryCollection = resultSetContainer.getDataEntryCollection();
	return dataEntryCollection.hasChangedValues();
};
oFF.PlanningManager.prototype.hasNewValues = function()
{
	let resultSetContainer = this.getResultSetContainer();
	if (resultSetContainer.hasDataEntryCollection())
	{
		let dataEntryCollection = resultSetContainer.getDataEntryCollection();
		if (dataEntryCollection.hasChangedDataEntries())
		{
			return true;
		}
	}
	if (resultSetContainer.hasNewLineCollection())
	{
		let newLineCollection = resultSetContainer.getNewLineCollection();
		return newLineCollection.hasValidNewLines();
	}
	return false;
};
oFF.PlanningManager.prototype.initializeDataAreaState = function()
{
	let msgMgr = oFF.MessageManagerSimple.createMessageManager();
	if (this.isDataEntryEnabled())
	{
		let queryManager = this.getQueryManager();
		let systemType = queryManager.getSystemType();
		if (systemType.isTypeOf(oFF.SystemType.BW))
		{
			let systemName = queryManager.getSystemName();
			let application = queryManager.getApplication();
			let dataArea = this.getDataAreaName();
			let dataAreaState = oFF.DataAreaState.getDataAreaStateByName(application, systemName, dataArea);
			if (oFF.isNull(dataAreaState))
			{
				dataAreaState = oFF.DataAreaState.createDataAreaState(application, systemName, dataArea, null, null, null);
				if (oFF.isNull(dataAreaState))
				{
					msgMgr.addError(oFF.ErrorCodes.INVALID_STATE, "illegal data area");
				}
			}
			else
			{
				if (!dataAreaState.isSubmitted())
				{
					msgMgr.addErrorExt(oFF.OriginLayer.DRIVER, 0, "illegal data area", dataAreaState);
				}
			}
		}
	}
	return msgMgr;
};
oFF.PlanningManager.prototype.isDataEntryEnabled = function()
{
	return this.getQueryModel().isDataEntryEnabled();
};
oFF.PlanningManager.prototype.isDataEntryReadOnly = function()
{
	return this.getQueryModel().isDataEntryReadOnly();
};
oFF.PlanningManager.prototype.isPlanningVersionSettingsEqual = function(s1, s2)
{
	if (s1 === s2)
	{
		return true;
	}
	if (oFF.isNull(s1) || oFF.isNull(s2))
	{
		return false;
	}
	if (!oFF.XString.isEqual(s1.getVersionUniqueName(), s2.getVersionUniqueName()))
	{
		return false;
	}
	if (!oFF.XString.isEqual(s1.getActionSequenceId(), s2.getActionSequenceId()))
	{
		return false;
	}
	if (s1.getUseExternalView() !== s2.getUseExternalView())
	{
		return false;
	}
	return s1.getIsRestrictionEnabled() === s2.getIsRestrictionEnabled();
};
oFF.PlanningManager.prototype.isPublicVersionEditPossible = function()
{
	return this.m_isPublicVersionEditPossible && this.getPlanningMode() === oFF.PlanningMode.FORCE_PLANNING;
};
oFF.PlanningManager.prototype.releaseObject = function()
{
	this.m_queryManager = oFF.XObjectExt.release(this.m_queryManager);
	this.m_allPlanningVersionSettings = oFF.XObjectExt.release(this.m_allPlanningVersionSettings);
	this.m_versionRestrictionType = null;
	this.m_planningActionSequenceSettingsMode = null;
	this.m_versionAliases = oFF.XObjectExt.release(this.m_versionAliases);
	this.m_inputReadinessRules = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_inputReadinessRules);
	this.m_inputReadinessMainQuery = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.PlanningManager.prototype.removeVersionAlias = function(aliasName)
{
	this.m_versionAliases.remove(aliasName);
	let queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.invalidateState();
	}
};
oFF.PlanningManager.prototype.resetNewValues = function()
{
	let activeResultSetContainer = this.getResultSetContainer();
	activeResultSetContainer.resetDataEntryCollection();
	activeResultSetContainer.resetNewLineCollection();
};
oFF.PlanningManager.prototype.setDataEntryEnabled = function(dataEntryEnabled)
{
	this.getQueryModel().setDataEntryEnabled(dataEntryEnabled);
};
oFF.PlanningManager.prototype.setDataEntryReadOnly = function(dataEntryReadOnly)
{
	this.getQueryModel().setDataEntryReadOnly(dataEntryReadOnly);
};
oFF.PlanningManager.prototype.setInputReadinessCacheMode = function(cacheMode)
{
	this.m_inputReadinessCacheMode = cacheMode;
};
oFF.PlanningManager.prototype.setInputReadinessFilter = function(mode)
{
	let queryModel = this.getQueryModel();
	if (oFF.notNull(queryModel))
	{
		queryModel.setInputReadinessFilter(mode);
	}
};
oFF.PlanningManager.prototype.setInputReadinessMainQuery = function(mainQuery)
{
	this.m_inputReadinessMainQuery = mainQuery;
};
oFF.PlanningManager.prototype.setPlanningMode = function(planningMode)
{
	this.getQueryModel().setPlanningMode(planningMode);
};
oFF.PlanningManager.prototype.setPlanningRestriction = function(restrictionType)
{
	this.m_versionRestrictionType = restrictionType;
};
oFF.PlanningManager.prototype.setPlanningVersionSettingsMode = function(settingsMode)
{
	if (oFF.isNull(settingsMode))
	{
		this.m_planningActionSequenceSettingsMode = oFF.PlanningVersionSettingsMode.SERVER_DEFAULT;
	}
	else
	{
		this.m_planningActionSequenceSettingsMode = settingsMode;
	}
};
oFF.PlanningManager.prototype.setPublicVersionEditPossible = function(publicVersionEdit)
{
	this.m_isPublicVersionEditPossible = publicVersionEdit;
};
oFF.PlanningManager.prototype.setVersionAliasById = function(aliasName, versionId)
{
	this.m_versionAliases.put(aliasName, versionId);
	let queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.invalidateState();
	}
};
oFF.PlanningManager.prototype.supportsDataEntryReadOnly = function()
{
	return this.getQueryModel().supportsDataEntryReadOnly();
};
oFF.PlanningManager.prototype.transferNewValues = function()
{
	let resultSetContainer = this.getResultSetContainer();
	let resultSetId = resultSetContainer.getId();
	let dataEntryCollection = resultSetContainer.getDataEntryCollection();
	resultSetContainer.setDataEntryCollection(null);
	let newLineCollection = resultSetContainer.getNewLineCollection();
	resultSetContainer.setNewLineCollection(null);
	let documentIdCollection = resultSetContainer.getDocumentIdCollection();
	resultSetContainer.setDocumentIdCollection(null);
	this.getQueryManager().invalidateState();
	resultSetContainer = this.getResultSetContainer();
	resultSetContainer.setId(resultSetId);
	resultSetContainer.setDataEntryCollection(dataEntryCollection);
	resultSetContainer.setNewLineCollection(newLineCollection);
	resultSetContainer.setDocumentIdCollection(documentIdCollection);
};

oFF.PlanningManagerFactoryImpl = function() {};
oFF.PlanningManagerFactoryImpl.prototype = new oFF.XObject();
oFF.PlanningManagerFactoryImpl.prototype._ff_c = "PlanningManagerFactoryImpl";

oFF.PlanningManagerFactoryImpl.create = function()
{
	return new oFF.PlanningManagerFactoryImpl();
};
oFF.PlanningManagerFactoryImpl.prototype.createPlanningManager = function(queryManager)
{
	return oFF.PlanningManager.create(queryManager);
};

oFF.PlanningModelQueryDataSource = function() {};
oFF.PlanningModelQueryDataSource.prototype = new oFF.XObject();
oFF.PlanningModelQueryDataSource.prototype._ff_c = "PlanningModelQueryDataSource";

oFF.PlanningModelQueryDataSource.prototype.m_datasource = null;
oFF.PlanningModelQueryDataSource.prototype.m_description = null;
oFF.PlanningModelQueryDataSource.prototype.m_primary = false;
oFF.PlanningModelQueryDataSource.prototype.getDataSource = function()
{
	return this.m_datasource;
};
oFF.PlanningModelQueryDataSource.prototype.getDescription = function()
{
	return this.m_description;
};
oFF.PlanningModelQueryDataSource.prototype.isPrimary = function()
{
	return this.m_primary;
};
oFF.PlanningModelQueryDataSource.prototype.releaseObject = function()
{
	this.m_description = null;
	this.m_datasource = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.PlanningModelQueryDataSource.prototype.setDataSource = function(datasource)
{
	this.m_datasource = datasource;
};
oFF.PlanningModelQueryDataSource.prototype.setDescription = function(description)
{
	this.m_description = description;
};
oFF.PlanningModelQueryDataSource.prototype.setPrimary = function(primary)
{
	this.m_primary = primary;
};

oFF.PlanningStep = function() {};
oFF.PlanningStep.prototype = new oFF.XObject();
oFF.PlanningStep.prototype._ff_c = "PlanningStep";

oFF.PlanningStep.create = function(actionStep, description, userName, userDisplayName)
{
	let planningStep = new oFF.PlanningStep();
	planningStep.m_actionStep = actionStep;
	planningStep.m_description = description;
	planningStep.m_userName = userName;
	planningStep.m_userDisplayName = userDisplayName;
	return planningStep;
};
oFF.PlanningStep.prototype.m_actionStep = null;
oFF.PlanningStep.prototype.m_description = null;
oFF.PlanningStep.prototype.m_userDisplayName = null;
oFF.PlanningStep.prototype.m_userName = null;
oFF.PlanningStep.prototype.getActionStep = function()
{
	return this.m_actionStep;
};
oFF.PlanningStep.prototype.getDescription = function()
{
	return this.m_description;
};
oFF.PlanningStep.prototype.getUserDisplayName = function()
{
	return this.m_userDisplayName;
};
oFF.PlanningStep.prototype.getUserName = function()
{
	return this.m_userName;
};

oFF.PlanningVersionActionSequence = function() {};
oFF.PlanningVersionActionSequence.prototype = new oFF.XObject();
oFF.PlanningVersionActionSequence.prototype._ff_c = "PlanningVersionActionSequence";

oFF.PlanningVersionActionSequence.create = function(versionId, description, startTime, activeSequence, runningAction)
{
	let actionSequence = new oFF.PlanningVersionActionSequence();
	actionSequence.m_versionId = versionId;
	actionSequence.m_description = description;
	actionSequence.m_startTime = startTime;
	actionSequence.m_activeSequence = activeSequence;
	actionSequence.m_runningAction = runningAction;
	return actionSequence;
};
oFF.PlanningVersionActionSequence.prototype.m_activeSequence = null;
oFF.PlanningVersionActionSequence.prototype.m_description = null;
oFF.PlanningVersionActionSequence.prototype.m_runningAction = null;
oFF.PlanningVersionActionSequence.prototype.m_startTime = null;
oFF.PlanningVersionActionSequence.prototype.m_versionId = null;
oFF.PlanningVersionActionSequence.prototype.getActiveSequence = function()
{
	return this.m_activeSequence;
};
oFF.PlanningVersionActionSequence.prototype.getDescription = function()
{
	return this.m_description;
};
oFF.PlanningVersionActionSequence.prototype.getRunningAction = function()
{
	return this.m_runningAction;
};
oFF.PlanningVersionActionSequence.prototype.getStartTime = function()
{
	return this.m_startTime;
};
oFF.PlanningVersionActionSequence.prototype.getVersionId = function()
{
	return this.m_versionId;
};

oFF.PlanningVersionIdentifier = function() {};
oFF.PlanningVersionIdentifier.prototype = new oFF.XObject();
oFF.PlanningVersionIdentifier.prototype._ff_c = "PlanningVersionIdentifier";

oFF.PlanningVersionIdentifier.create = function(versionId, sharedVersion, versionOwner)
{
	let identifier = new oFF.PlanningVersionIdentifier();
	identifier.m_versionId = versionId;
	identifier.m_sharedVersion = sharedVersion;
	identifier.m_versionOwner = versionOwner;
	return identifier;
};
oFF.PlanningVersionIdentifier.create2 = function(versionKey, sharedVersion, versionOwner)
{
	let identifier = new oFF.PlanningVersionIdentifier();
	identifier.m_versionKey = versionKey;
	identifier.m_sharedVersion = sharedVersion;
	identifier.m_versionOwner = versionOwner;
	return identifier;
};
oFF.PlanningVersionIdentifier.prototype.m_sharedVersion = false;
oFF.PlanningVersionIdentifier.prototype.m_versionId = 0;
oFF.PlanningVersionIdentifier.prototype.m_versionKey = null;
oFF.PlanningVersionIdentifier.prototype.m_versionOwner = null;
oFF.PlanningVersionIdentifier.prototype.getVersionId = function()
{
	return this.m_versionId;
};
oFF.PlanningVersionIdentifier.prototype.getVersionKey = function()
{
	return this.m_versionKey;
};
oFF.PlanningVersionIdentifier.prototype.getVersionOwner = function()
{
	return this.m_versionOwner;
};
oFF.PlanningVersionIdentifier.prototype.getVersionUniqueName = function()
{
	let sb = oFF.XStringBuffer.create();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_versionKey))
	{
		sb.append(this.m_versionKey);
	}
	else
	{
		sb.append(oFF.XInteger.convertToString(this.m_versionId));
	}
	if (this.m_sharedVersion)
	{
		sb.append(":");
		if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_versionOwner))
		{
			sb.append(this.m_versionOwner);
		}
	}
	return sb.toString();
};
oFF.PlanningVersionIdentifier.prototype.isSharedVersion = function()
{
	return this.m_sharedVersion;
};
oFF.PlanningVersionIdentifier.prototype.releaseObject = function()
{
	this.m_versionOwner = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.PlanningVersionIdentifier.prototype.toString = function()
{
	return this.getVersionUniqueName();
};

oFF.PlanningVersionParameterMetadata = function() {};
oFF.PlanningVersionParameterMetadata.prototype = new oFF.XObject();
oFF.PlanningVersionParameterMetadata.prototype._ff_c = "PlanningVersionParameterMetadata";

oFF.PlanningVersionParameterMetadata.prototype.m_description = null;
oFF.PlanningVersionParameterMetadata.prototype.m_hasValue = false;
oFF.PlanningVersionParameterMetadata.prototype.m_name = null;
oFF.PlanningVersionParameterMetadata.prototype.m_type = null;
oFF.PlanningVersionParameterMetadata.prototype.m_valueAllowed = false;
oFF.PlanningVersionParameterMetadata.prototype.m_valueElement = null;
oFF.PlanningVersionParameterMetadata.prototype.getDescription = function()
{
	return this.m_description;
};
oFF.PlanningVersionParameterMetadata.prototype.getName = function()
{
	return this.m_name;
};
oFF.PlanningVersionParameterMetadata.prototype.getType = function()
{
	return this.m_type;
};
oFF.PlanningVersionParameterMetadata.prototype.getValue = function()
{
	return this.m_valueElement;
};
oFF.PlanningVersionParameterMetadata.prototype.hasValue = function()
{
	return this.m_hasValue;
};
oFF.PlanningVersionParameterMetadata.prototype.isValueAllowed = function()
{
	return this.m_valueAllowed;
};
oFF.PlanningVersionParameterMetadata.prototype.releaseObject = function()
{
	this.m_name = null;
	this.m_description = null;
	this.m_type = null;
	this.m_valueElement = oFF.XObjectExt.release(this.m_valueElement);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.PlanningVersionParameterMetadata.prototype.setDescription = function(description)
{
	this.m_description = description;
};
oFF.PlanningVersionParameterMetadata.prototype.setHasValue = function(hasValue)
{
	this.m_hasValue = hasValue;
};
oFF.PlanningVersionParameterMetadata.prototype.setName = function(name)
{
	this.m_name = name;
};
oFF.PlanningVersionParameterMetadata.prototype.setType = function(type)
{
	this.m_type = type;
};
oFF.PlanningVersionParameterMetadata.prototype.setValue = function(valueElement)
{
	if (oFF.isNull(valueElement))
	{
		this.m_valueElement = null;
	}
	else
	{
		this.m_valueElement = oFF.PrUtils.deepCopyElement(valueElement);
	}
};
oFF.PlanningVersionParameterMetadata.prototype.setValueAllowed = function(valueAllowed)
{
	this.m_valueAllowed = valueAllowed;
};

oFF.PlanningVersionStateDescription = function() {};
oFF.PlanningVersionStateDescription.prototype = new oFF.XObject();
oFF.PlanningVersionStateDescription.prototype._ff_c = "PlanningVersionStateDescription";

oFF.PlanningVersionStateDescription.create = function(stateId, description, userName, startTime, endTime, changeCount)
{
	let stateDescription = new oFF.PlanningVersionStateDescription();
	stateDescription.m_id = stateId;
	stateDescription.m_description = description;
	stateDescription.m_userName = userName;
	stateDescription.m_startTime = startTime;
	stateDescription.m_endTime = endTime;
	stateDescription.m_changeCount = changeCount;
	stateDescription.m_navigatable = true;
	return stateDescription;
};
oFF.PlanningVersionStateDescription.prototype.m_actionStep = null;
oFF.PlanningVersionStateDescription.prototype.m_changeCount = 0;
oFF.PlanningVersionStateDescription.prototype.m_current = false;
oFF.PlanningVersionStateDescription.prototype.m_description = null;
oFF.PlanningVersionStateDescription.prototype.m_endTime = null;
oFF.PlanningVersionStateDescription.prototype.m_id = null;
oFF.PlanningVersionStateDescription.prototype.m_navigatable = false;
oFF.PlanningVersionStateDescription.prototype.m_startTime = null;
oFF.PlanningVersionStateDescription.prototype.m_userDisplayName = null;
oFF.PlanningVersionStateDescription.prototype.m_userName = null;
oFF.PlanningVersionStateDescription.prototype.getActionStep = function()
{
	return this.m_actionStep;
};
oFF.PlanningVersionStateDescription.prototype.getChangeCount = function()
{
	return this.m_changeCount;
};
oFF.PlanningVersionStateDescription.prototype.getDescription = function()
{
	return this.m_description;
};
oFF.PlanningVersionStateDescription.prototype.getEndTime = function()
{
	return this.m_endTime;
};
oFF.PlanningVersionStateDescription.prototype.getId = function()
{
	return this.m_id;
};
oFF.PlanningVersionStateDescription.prototype.getStartTime = function()
{
	return this.m_startTime;
};
oFF.PlanningVersionStateDescription.prototype.getUserDisplayName = function()
{
	return this.m_userDisplayName;
};
oFF.PlanningVersionStateDescription.prototype.getUserName = function()
{
	return this.m_userName;
};
oFF.PlanningVersionStateDescription.prototype.isCurrent = function()
{
	return this.m_current;
};
oFF.PlanningVersionStateDescription.prototype.isNavigatable = function()
{
	return this.m_navigatable;
};
oFF.PlanningVersionStateDescription.prototype.setActionStep = function(actionStep)
{
	this.m_actionStep = actionStep;
};
oFF.PlanningVersionStateDescription.prototype.setCurrent = function(current)
{
	this.m_current = current;
};
oFF.PlanningVersionStateDescription.prototype.setNavigatable = function(navigatable)
{
	this.m_navigatable = navigatable;
};
oFF.PlanningVersionStateDescription.prototype.setUserDisplayName = function(userDisplayName)
{
	this.m_userDisplayName = userDisplayName;
};
oFF.PlanningVersionStateDescription.prototype.toString = function()
{
	let buffer = oFF.XStringBuffer.create();
	buffer.append("(");
	buffer.append("id: ").append(this.m_id);
	buffer.append(", ");
	buffer.append("description: ").append("\"").append(this.m_description).append("\"");
	buffer.append(")");
	return buffer.toString();
};

oFF.PlanningModelCommandHelper = {

	s_helper:null,
	SetHelper:function(helper)
	{
			oFF.PlanningModelCommandHelper.s_helper = helper;
	},
	convertRequestToBatch:function(request)
	{
			return oFF.PlanningModelCommandHelper.s_helper.convertRequestToBatch(request);
	},
	convertResponseFromBatch:function(response)
	{
			return oFF.PlanningModelCommandHelper.s_helper.convertResponseFromBatch(response);
	},
	getCommandResponse:function(commands, responses, commandName)
	{
			return oFF.PlanningModelCommandHelper.s_helper.getCommandResponse(commands, responses, commandName);
	},
	getResponsesReturnCodeStrict:function(responseStructure, messageManager)
	{
			return oFF.PlanningModelCommandHelper.s_helper.getResponsesReturnCodeStrict(responseStructure, messageManager);
	},
	processResponseGetVersions:function(commands, responses, model)
	{
			return oFF.PlanningModelCommandHelper.s_helper.processResponseGetVersions(commands, responses, model);
	},
	resetVersionParameters:function(commandResponse, version)
	{
			oFF.PlanningModelCommandHelper.s_helper.resetVersionParameters(commandResponse, version);
	}
};

oFF.PlanningActionParameterMetadata = function() {};
oFF.PlanningActionParameterMetadata.prototype = new oFF.XObject();
oFF.PlanningActionParameterMetadata.prototype._ff_c = "PlanningActionParameterMetadata";

oFF.PlanningActionParameterMetadata.prototype.m_actionMetadata = null;
oFF.PlanningActionParameterMetadata.prototype.m_parameters = null;
oFF.PlanningActionParameterMetadata.prototype.getActionMetadata = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_actionMetadata);
};
oFF.PlanningActionParameterMetadata.prototype.getParameters = function()
{
	return this.m_parameters;
};
oFF.PlanningActionParameterMetadata.prototype.hasParameters = function()
{
	return oFF.PrUtils.isListEmpty(this.m_parameters);
};
oFF.PlanningActionParameterMetadata.prototype.setActionMetadata = function(actionMetadata)
{
	this.m_actionMetadata = oFF.XWeakReferenceUtil.getWeakRef(actionMetadata);
};
oFF.PlanningActionParameterMetadata.prototype.setParameters = function(parameters)
{
	this.m_parameters = parameters;
};
oFF.PlanningActionParameterMetadata.prototype.toString = function()
{
	if (oFF.isNull(this.m_parameters))
	{
		return "no parameters";
	}
	return oFF.PrUtils.serialize(this.m_parameters, true, true, 4);
};

oFF.EpmPlanningActionExecution = function() {};
oFF.EpmPlanningActionExecution.prototype = new oFF.XObject();
oFF.EpmPlanningActionExecution.prototype._ff_c = "EpmPlanningActionExecution";

oFF.EpmPlanningActionExecution.create = function(planningAction)
{
	let instance = new oFF.EpmPlanningActionExecution();
	instance.setupWithAction(planningAction);
	return instance;
};
oFF.EpmPlanningActionExecution.prototype.m_executionConfigurationMessages = null;
oFF.EpmPlanningActionExecution.prototype.m_executionId = null;
oFF.EpmPlanningActionExecution.prototype.m_executionStatus = null;
oFF.EpmPlanningActionExecution.prototype.m_maxSeverity = null;
oFF.EpmPlanningActionExecution.prototype.m_overAllMessages = null;
oFF.EpmPlanningActionExecution.prototype.m_parameterMessages = null;
oFF.EpmPlanningActionExecution.prototype.m_planningAction = null;
oFF.EpmPlanningActionExecution.prototype.m_startId = null;
oFF.EpmPlanningActionExecution.prototype.m_taskMessages = null;
oFF.EpmPlanningActionExecution.prototype.adaptMaxSeverity = function(maxSeverity)
{
	if (oFF.notNull(maxSeverity) && (oFF.isNull(this.m_maxSeverity) || this.m_maxSeverity.getLevel() < maxSeverity.getLevel()))
	{
		this.m_maxSeverity = maxSeverity;
	}
};
oFF.EpmPlanningActionExecution.prototype.addExecutionConfigurationMessage = function(message)
{
	this.m_executionConfigurationMessages.add(message);
};
oFF.EpmPlanningActionExecution.prototype.addOverallMessage = function(message)
{
	this.m_overAllMessages.add(message);
};
oFF.EpmPlanningActionExecution.prototype.addParameterMessage = function(message)
{
	this.m_parameterMessages.add(message);
};
oFF.EpmPlanningActionExecution.prototype.addTaskMessage = function(message)
{
	this.m_taskMessages.add(message);
};
oFF.EpmPlanningActionExecution.prototype.getExecutionConfigurationMessages = function()
{
	return this.m_executionConfigurationMessages;
};
oFF.EpmPlanningActionExecution.prototype.getExecutionId = function()
{
	return this.m_executionId;
};
oFF.EpmPlanningActionExecution.prototype.getExecutionStatus = function()
{
	return this.m_executionStatus;
};
oFF.EpmPlanningActionExecution.prototype.getMaxSeverity = function()
{
	return this.m_maxSeverity;
};
oFF.EpmPlanningActionExecution.prototype.getOverallMessages = function()
{
	return this.m_overAllMessages;
};
oFF.EpmPlanningActionExecution.prototype.getParameterMessages = function()
{
	return this.m_parameterMessages;
};
oFF.EpmPlanningActionExecution.prototype.getPlanningAction = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_planningAction);
};
oFF.EpmPlanningActionExecution.prototype.getStartId = function()
{
	return this.m_startId;
};
oFF.EpmPlanningActionExecution.prototype.getTaskMessages = function()
{
	return this.m_taskMessages;
};
oFF.EpmPlanningActionExecution.prototype.setExecutionId = function(executionId)
{
	this.m_executionId = executionId;
};
oFF.EpmPlanningActionExecution.prototype.setExecutionStatus = function(executionStatus)
{
	this.m_executionStatus = executionStatus;
};
oFF.EpmPlanningActionExecution.prototype.setStartId = function(startId)
{
	this.m_startId = startId;
};
oFF.EpmPlanningActionExecution.prototype.setupWithAction = function(planningAction)
{
	this.m_planningAction = oFF.XWeakReferenceUtil.getWeakRef(planningAction);
	this.m_overAllMessages = oFF.XList.create();
	this.m_taskMessages = oFF.XList.create();
	this.m_parameterMessages = oFF.XList.create();
	this.m_executionConfigurationMessages = oFF.XList.create();
	this.m_maxSeverity = oFF.Severity.INFO;
};
oFF.EpmPlanningActionExecution.prototype.updateExecutionStatus = function(syncType, listener, identifier)
{
	return this.getPlanningAction().updateExecutionStatus(this, syncType, listener, identifier);
};

oFF.EpmVersionActionParameters = function() {};
oFF.EpmVersionActionParameters.prototype = new oFF.XObject();
oFF.EpmVersionActionParameters.prototype._ff_c = "EpmVersionActionParameters";

oFF.EpmVersionActionParameters.create = function()
{
	return new oFF.EpmVersionActionParameters();
};
oFF.EpmVersionActionParameters.prototype.conflictResolutionType = null;
oFF.EpmVersionActionParameters.prototype.jobExecutionType = null;
oFF.EpmVersionActionParameters.prototype.m_addDefaultPlanningArea = null;
oFF.EpmVersionActionParameters.prototype.m_category = null;
oFF.EpmVersionActionParameters.prototype.m_description = null;
oFF.EpmVersionActionParameters.prototype.m_enforceLimit = null;
oFF.EpmVersionActionParameters.prototype.m_filterOutManyUnchangedFacts = null;
oFF.EpmVersionActionParameters.prototype.m_filterOutReadOnlyFacts = null;
oFF.EpmVersionActionParameters.prototype.m_filterOutUnchangedFacts = null;
oFF.EpmVersionActionParameters.prototype.m_isPublic = false;
oFF.EpmVersionActionParameters.prototype.m_sourceVersionId = null;
oFF.EpmVersionActionParameters.prototype.m_targetVersionId = null;
oFF.EpmVersionActionParameters.prototype.m_versionId = null;
oFF.EpmVersionActionParameters.prototype.getAddDefaultPlanningArea = function()
{
	return this.m_addDefaultPlanningArea;
};
oFF.EpmVersionActionParameters.prototype.getCategory = function()
{
	return this.m_category;
};
oFF.EpmVersionActionParameters.prototype.getConflictResolutionType = function()
{
	return this.conflictResolutionType;
};
oFF.EpmVersionActionParameters.prototype.getDescription = function()
{
	return this.m_description;
};
oFF.EpmVersionActionParameters.prototype.getEnforceLimit = function()
{
	return this.m_enforceLimit;
};
oFF.EpmVersionActionParameters.prototype.getFilterOutManyUnchangedFacts = function()
{
	return this.m_filterOutManyUnchangedFacts;
};
oFF.EpmVersionActionParameters.prototype.getFilterOutReadOnlyFacts = function()
{
	return this.m_filterOutReadOnlyFacts;
};
oFF.EpmVersionActionParameters.prototype.getFilterOutUnchangedFacts = function()
{
	return this.m_filterOutUnchangedFacts;
};
oFF.EpmVersionActionParameters.prototype.getJobExecutionType = function()
{
	return this.jobExecutionType;
};
oFF.EpmVersionActionParameters.prototype.getSourceVersionId = function()
{
	return this.m_sourceVersionId;
};
oFF.EpmVersionActionParameters.prototype.getTargetVersionId = function()
{
	return this.m_targetVersionId;
};
oFF.EpmVersionActionParameters.prototype.getVersionId = function()
{
	return this.m_versionId;
};
oFF.EpmVersionActionParameters.prototype.isAddDefaultPlanningArea = function()
{
	return oFF.TriStateBool.getBooleanWithFallback(this.m_addDefaultPlanningArea, false);
};
oFF.EpmVersionActionParameters.prototype.isEnforceLimit = function()
{
	return oFF.TriStateBool.getBooleanWithFallback(this.m_enforceLimit, false);
};
oFF.EpmVersionActionParameters.prototype.isExplicitAddDefaultPlanningArea = function()
{
	return oFF.TriStateBool.isExplicitBooleanValue(this.m_addDefaultPlanningArea);
};
oFF.EpmVersionActionParameters.prototype.isExplicitEnforceLimit = function()
{
	return oFF.TriStateBool.isExplicitBooleanValue(this.m_enforceLimit);
};
oFF.EpmVersionActionParameters.prototype.isExplicitFilterOutManyUnchangedFacts = function()
{
	return oFF.TriStateBool.isExplicitBooleanValue(this.m_filterOutManyUnchangedFacts);
};
oFF.EpmVersionActionParameters.prototype.isExplicitFilterOutReadOnlyFacts = function()
{
	return oFF.TriStateBool.isExplicitBooleanValue(this.m_filterOutReadOnlyFacts);
};
oFF.EpmVersionActionParameters.prototype.isExplicitFilterOutUnchangedFacts = function()
{
	return oFF.TriStateBool.isExplicitBooleanValue(this.m_filterOutUnchangedFacts);
};
oFF.EpmVersionActionParameters.prototype.isFilterOutManyUnchangedFacts = function()
{
	return oFF.TriStateBool.getBooleanWithFallback(this.m_filterOutManyUnchangedFacts, false);
};
oFF.EpmVersionActionParameters.prototype.isFilterOutReadOnlyFacts = function()
{
	return oFF.TriStateBool.getBooleanWithFallback(this.m_filterOutReadOnlyFacts, false);
};
oFF.EpmVersionActionParameters.prototype.isFilterOutUnchangedFacts = function()
{
	return oFF.TriStateBool.getBooleanWithFallback(this.m_filterOutUnchangedFacts, false);
};
oFF.EpmVersionActionParameters.prototype.isPublic = function()
{
	return this.m_isPublic;
};
oFF.EpmVersionActionParameters.prototype.setAddDefaultPlanningArea = function(addDefaultPlanningArea)
{
	this.m_addDefaultPlanningArea = addDefaultPlanningArea;
};
oFF.EpmVersionActionParameters.prototype.setCategory = function(category)
{
	this.m_category = category;
};
oFF.EpmVersionActionParameters.prototype.setConflictResolutionType = function(conflictResolutionType)
{
	this.conflictResolutionType = conflictResolutionType;
};
oFF.EpmVersionActionParameters.prototype.setDescription = function(description)
{
	this.m_description = description;
};
oFF.EpmVersionActionParameters.prototype.setEnforceLimit = function(enforceLimit)
{
	this.m_enforceLimit = enforceLimit;
};
oFF.EpmVersionActionParameters.prototype.setFilterOutManyUnchangedFacts = function(filterOutManyUnchangedFacts)
{
	this.m_filterOutManyUnchangedFacts = filterOutManyUnchangedFacts;
};
oFF.EpmVersionActionParameters.prototype.setFilterOutReadOnlyFacts = function(m_filterOutReadOnlyFacts)
{
	this.m_filterOutReadOnlyFacts = m_filterOutReadOnlyFacts;
};
oFF.EpmVersionActionParameters.prototype.setFilterOutUnchangedFacts = function(m_filterOutUnchangedFacts)
{
	this.m_filterOutUnchangedFacts = m_filterOutUnchangedFacts;
};
oFF.EpmVersionActionParameters.prototype.setIsPublic = function(isPublic)
{
	this.m_isPublic = isPublic;
};
oFF.EpmVersionActionParameters.prototype.setJobExecutionType = function(jobExecutionType)
{
	this.jobExecutionType = jobExecutionType;
};
oFF.EpmVersionActionParameters.prototype.setSourceVersionId = function(sourceVersionId)
{
	this.m_sourceVersionId = sourceVersionId;
};
oFF.EpmVersionActionParameters.prototype.setTargetVersionId = function(targetVersionId)
{
	this.m_targetVersionId = targetVersionId;
};
oFF.EpmVersionActionParameters.prototype.setVersionId = function(versionId)
{
	this.m_versionId = versionId;
};

oFF.PlanningVersionAccess = function() {};
oFF.PlanningVersionAccess.prototype = new oFF.XObject();
oFF.PlanningVersionAccess.prototype._ff_c = "PlanningVersionAccess";

oFF.PlanningVersionAccess.create = function()
{
	return new oFF.PlanningVersionAccess();
};
oFF.PlanningVersionAccess.prototype.m_PublishingFrom = false;
oFF.PlanningVersionAccess.prototype.m_PublishingTo = false;
oFF.PlanningVersionAccess.prototype.m_copying = false;
oFF.PlanningVersionAccess.prototype.m_deleting = false;
oFF.PlanningVersionAccess.prototype.m_planning = false;
oFF.PlanningVersionAccess.prototype.m_reading = false;
oFF.PlanningVersionAccess.prototype.m_savingPublicEdit = false;
oFF.PlanningVersionAccess.prototype.m_sharing = false;
oFF.PlanningVersionAccess.prototype.m_startingPublicEdit = false;
oFF.PlanningVersionAccess.prototype.m_undoingRedoing = false;
oFF.PlanningVersionAccess.prototype.setSupportsCopying = function(copying)
{
	this.m_copying = copying;
};
oFF.PlanningVersionAccess.prototype.setSupportsDeleting = function(deleting)
{
	this.m_deleting = deleting;
};
oFF.PlanningVersionAccess.prototype.setSupportsPlanning = function(planning)
{
	this.m_planning = planning;
};
oFF.PlanningVersionAccess.prototype.setSupportsPublishingFrom = function(PublishingFrom)
{
	this.m_PublishingFrom = PublishingFrom;
};
oFF.PlanningVersionAccess.prototype.setSupportsPublishingTo = function(PublishingTo)
{
	this.m_PublishingTo = PublishingTo;
};
oFF.PlanningVersionAccess.prototype.setSupportsReading = function(reading)
{
	this.m_reading = reading;
};
oFF.PlanningVersionAccess.prototype.setSupportsSavingPublicEdit = function(savingPublicEdit)
{
	this.m_savingPublicEdit = savingPublicEdit;
};
oFF.PlanningVersionAccess.prototype.setSupportsSharing = function(sharing)
{
	this.m_sharing = sharing;
};
oFF.PlanningVersionAccess.prototype.setSupportsStartingPublicEdit = function(startingPublicEdit)
{
	this.m_startingPublicEdit = startingPublicEdit;
};
oFF.PlanningVersionAccess.prototype.setSupportsUndoingRedoing = function(undoingRedoing)
{
	this.m_undoingRedoing = undoingRedoing;
};
oFF.PlanningVersionAccess.prototype.supportsCopying = function()
{
	return this.m_copying;
};
oFF.PlanningVersionAccess.prototype.supportsDeleting = function()
{
	return this.m_deleting;
};
oFF.PlanningVersionAccess.prototype.supportsPlanning = function()
{
	return this.m_planning;
};
oFF.PlanningVersionAccess.prototype.supportsPublishingFrom = function()
{
	return this.m_PublishingFrom;
};
oFF.PlanningVersionAccess.prototype.supportsPublishingTo = function()
{
	return this.m_PublishingTo;
};
oFF.PlanningVersionAccess.prototype.supportsReading = function()
{
	return this.m_reading;
};
oFF.PlanningVersionAccess.prototype.supportsSavingPublicEdit = function()
{
	return this.m_savingPublicEdit;
};
oFF.PlanningVersionAccess.prototype.supportsSharing = function()
{
	return this.m_sharing;
};
oFF.PlanningVersionAccess.prototype.supportsStartingPublicEdit = function()
{
	return this.m_startingPublicEdit;
};
oFF.PlanningVersionAccess.prototype.supportsUndoingRedoing = function()
{
	return this.m_undoingRedoing;
};

oFF.EpmPlanningActionJsonConstants = {

	K_ACCESS:"access",
	K_ACCESS_MODE:"accessMode",
	K_ACTION:"action",
	K_ADD_COUNT:"addCount",
	K_ADD_DETAILS:"addDetails",
	K_ADD_LAST_UPDATED:"addLastUpdated",
	K_ADD_METADATA:"addMetadata",
	K_ALLOW_ALL_MEMBER:"allowAllMember",
	K_ALLOW_AUTH_OVERRIDE:"allowAuthOverride",
	K_ANCESTOR_PATH:"ancestorPath",
	K_APPLY_PLANNING_AREA:"applyPlanningArea",
	K_AUTO_PUBLISH:"autoPublish",
	K_BATCH_MODE:"batchMode",
	K_B_INCLUDE_ADDITIONAL_DATA:"bIncludeAdditionalData",
	K_B_INC_DEPENDENCY:"bIncDependency",
	K_B_USE_TEMP_SERVICE:"bUseTempService",
	K_CARDINALITY:"cardinality",
	K_CDATA:"cdata",
	K_CHECKS:"checks",
	K_CODE:"code",
	K_CREATED_BY:"createdBy",
	K_CREATED_BY_DISPLAY_NAME:"createdByDisplayName",
	K_CREATED_TIME:"createdTime",
	K_CUBE_ID:"cubeId",
	K_CUBE_IDS:"cubeIds",
	K_CUBE_METADATA_BY_ID:"cubeMetadataById",
	K_CUBE_TYPE:"cubeType",
	K_CURRENCY_CONVERSION_SETTINGS:"currencyConversionSettings",
	K_DATA:"data",
	K_DATA_ACTION:"dataAction",
	K_DEFAULT_VALUE:"defaultValue",
	K_DESCRIPTION:"description",
	K_DETAIL:"detail",
	K_DETAILS:"details",
	K_DIMENSIONS:"dimensions",
	K_DIMENSION_ID:"dimensionId",
	K_DISPLAY_KEY:"displayKey",
	K_DISPLAY_NAME:"displayName",
	K_ENABLED:"enabled",
	K_EPM_NAME:"epmName",
	K_EPM_PACKAGE:"epmPackage",
	K_ERROR_CODE:"errorCode",
	K_ERROR_MESSAGE:"errorMessage",
	K_EXECUTION_CONFIGURATION_MESSAGES:"executionConfigurationMessages",
	K_EXECUTION_ID:"executionId",
	K_EXECUTION_RESULT:"executionResult",
	K_FAV_RES_ID:"favResId",
	K_FIELD_NAME:"fieldName",
	K_FILTER_OUT_READ_ONLY_FACTS:"filterOutReadOnlyFacts",
	K_HIERARCHY_FIELDS:"hierarchyFields",
	K_HIERARCHY_ID:"hierarchyId",
	K_HIERARCHY_LEVEL:"hierarchyLevel",
	K_HIERARCHY_NAME:"hierarchyName",
	K_HIERARCHY_NAMES:"hierarchyNames",
	K_ID:"id",
	K_INCLUDE_TOTAL_RESOURCE_COUNT:"includeTotalResourceCount",
	K_INCL_SUB_OBJECT_TYPES:"inclSubObjectTypes",
	K_INPUT_TYPE:"inputType",
	K_INSTANCE_ID:"instanceId",
	K_IS_TARGET_VERSION_PARAMETER:"isTargetVersionParameter",
	K_KEY:"key",
	K_LEVEL:"level",
	K_LIST_FORMULA:"listFormula",
	K_LIST_VERSION:"listVersion",
	K_MAX_SEVERITY:"maxSeverity",
	K_MEMBER_ID:"memberId",
	K_MEMBER_IDS:"memberIds",
	K_MESSAGE:"message",
	K_MESSAGES:"messages",
	K_MESSAGE_TYPE:"messageType",
	K_METADATA:"metadata",
	K_METADATA_DEFINITION:"metadataDefinition",
	K_MODEL_ID:"modelId",
	K_MODIFIED_BY:"modifiedBy",
	K_MODIFIED_BY_DISPLAY_NAME:"modifiedByDisplayName",
	K_MODIFIED_TIME:"modifiedTime",
	K_MULTI_ACTION:"multiAction",
	K_NAME:"name",
	K_NEED_DIMENSION_VALIDATION_RULES:"needDimensionValidationRules",
	K_ORIGIN:"origin",
	K_OVER_ALL_MESSAGES:"overAllMessages",
	K_O_OPT:"oOpt",
	K_PACKAGE:"package",
	K_PARAMETERS:"parameters",
	K_PARAMETER_1:"p1",
	K_PARAMETER_2:"p2",
	K_PARAMETER_3:"p3",
	K_PARAMETER_ID:"parameterId",
	K_PARAMETER_INDEX:"parameterIndex",
	K_PARAMETER_MESSAGES:"parameterMessages",
	K_PARAMETER_VALUES:"parameterValues",
	K_PARENT_RES_ID:"parentResId",
	K_PLANNING:"planning",
	K_PLANNING_AREA:"planningArea",
	K_PLANNING_FEATURES:"planningFeatures",
	K_PUBLIC_EDIT_CREATION:"publicEditCreation",
	K_RATE:"rate",
	K_RECENTLY_ACCESSED:"recentlyAccessed",
	K_REQUEST_ID:"requestid",
	K_RESOURCE:"resource",
	K_RESOURCE_ID:"resourceId",
	K_RESOURCE_OPTIONS:"resourceOptions",
	K_RESOURCE_TYPE:"resourceType",
	K_RESOURCE_TYPES:"resourceTypes",
	K_RUNTIME_INPUT_TYPE:"runtimeInputType",
	K_RUNTIME_PARAMETER_VALUE:"runtimeParameterValue",
	K_SEARCH_CRITERIA:"searchCriteria",
	K_SEQUENCE:"sequence",
	K_SEVERITY:"severity",
	K_SOURCE:"source",
	K_SOURCE_RES_ID:"sourceResId",
	K_SPACE_ID:"spaceId",
	K_STATUS:"status",
	K_SUBTYPE:"subtype",
	K_SUB_TYPE:"subType",
	K_TASK_MESSAGES:"taskMessages",
	K_TRANSLATE_CUSTOMIZED_DESCRIPTION:"translateCustomizedDescription",
	K_TYPE:"type",
	K_USE_DESIGNER_VALUE:"useDesignerValue",
	K_USE_PREDEFINED_VALUES:"usePredefinedValues",
	K_VALIDATION_RESULT:"validationResult",
	K_VALUE:"value",
	K_VALUES:"values",
	K_VALUE_FROM_PROMPT:"valueFromPrompt",
	K_VARIABLES:"variables",
	K_VISUALIZATION:"visualization",
	P_INFIX:":",
	P_TENTANT_PREFIX:"t.",
	QY_HREF:"href",
	QY_LINKS:"links",
	QY_MESSAGES:"messages",
	QY_REL:"rel",
	QY_STATUS:"status",
	QY_UTC_START_DATE:"utcStartDate",
	VA_STATUS_FAILED:"failed",
	VA_STATUS_RUNNING:"running",
	VA_STATUS_SUCCESS:"successful",
	VA_STATUS_WARNING:"warning",
	V_APPLICATION_TRIGGER:"APPLICATION_TRIGGER",
	V_CALL_FUNCTION:"callFunction",
	V_CARDINALITY_MULTI:"MULTI",
	V_CARDINALITY_MULTIPLE:"MULTIPLE",
	V_CARDINALITY_SINGLE:"SINGLE",
	V_DEFAULT:"Default",
	V_DEFAULT_CURRENCY:"DefaultCurrency",
	V_EMPTY:"Empty",
	V_EXECUTE:"execute",
	V_GET_CONTENT:"getContent",
	V_GET_DEPENDENCIES:"getDependencies",
	V_INPUT_TYPE_FIXED:"FIXED",
	V_INPUT_TYPE_PROMPT:"PROMPT",
	V_LEVEL_ANY:"ANY",
	V_LEVEL_LEAF:"LEAF",
	V_LOCAL_CURRENCY:"LocalCurrency",
	V_MULTIACTIONS:"MULTIACTIONS",
	V_NONE:"None",
	V_PLANNINGSEQUENCE:"PLANNINGSEQUENCE",
	V_READ_OBJECT:"readObject",
	V_RESOURCE_TYPE_CUBE:"CUBE",
	V_SEARCH_ALL_RESOURCES:"searchAllResources",
	V_SEVERITY_DEBUG:"DEBUG",
	V_SEVERITY_ERROR:"ERROR",
	V_SEVERITY_INFO:"INFO",
	V_SEVERITY_WARN:"WARN",
	V_STATUS_FAILED:"failed",
	V_STATUS_RUNNING:"running",
	V_STATUS_SUCCESSFUL:"successful",
	V_STATUS_WARNING:"warning",
	V_SUBTYPE_STORY:"STORY",
	V_SUB_TYPE_DATE:"Date",
	V_SUB_TYPE_TIME:"Time",
	V_TRANSLATION_ENABLED:"translationEnabled",
	V_TYPE_DATETIME:"DATETIME",
	V_TYPE_DOUBLE:"DOUBLE",
	V_TYPE_INTEGER:"INTEGER",
	V_TYPE_MEMBER:"MEMBER",
	V_TYPE_NUMBER:"NUMBER",
	V_TYPE_STRING:"STRING"
};

oFF.EpmPlanningActionRestConstants = {

	GET_AUTHENTICATION_TOKEN:"/api/v1/csrf",
	GET_DATA_ACTION_DETAILS:"/sap/fpa/services/rest/v1/internal/dataActions/{ACTION_ID}",
	GET_DATA_ACTION_EXECUTION_STATUS:"/sap/fpa/services/rest/v1/internal/dataActions/executions/{EXECUTION_ID}",
	GET_MULTI_ACTION_DETAILS:"/sap/fpa/services/rest/v1/multiActions/{ACTION_ID}",
	GET_MULTI_ACTION_EXECUTION_STATUS:"/sap/fpa/services/rest/v1/multiActions/{ACTION_ID}/executions/{EXECUTION_ID}",
	PARAMETER_ACTION_ID:"{ACTION_ID}",
	PARAMETER_EXECUTION_ID:"{EXECUTION_ID}",
	PARAMETER_MODEL_ID:"{MODEL_ID}",
	POST_CONTENTLIB:"/sap/fpa/services/rest/epm/contentlib",
	POST_DATA_ACTION_EXECUTION:"/sap/fpa/services/rest/v1/internal/dataActions/{ACTION_ID}/executions",
	POST_DATA_ACTION_VALIDATION:"/sap/fpa/services/rest/v1/internal/dataActions/{ACTION_ID}/validations",
	POST_MULTI_ACTION_EXECUTION:"/sap/fpa/services/rest/v1/multiActions/{ACTION_ID}/executions",
	POST_MULTI_ACTION_VALIDATION:"/sap/fpa/services/rest/v1//multiActions/{ACTION_ID}/validations",
	POST_OBJECT_MANAGER:"/sap/fpa/services/rest/epm/objectmgr",
	POST_OBTAIN_RELATED_OBJECTS:"/sap/fpa/services/rest/fpa/model"
};

oFF.EpmPlanningVersionJsonConstants = {

	K_ACTION:"action",
	K_ACTION_SEQUENCES:"actionSequences",
	K_ACTION_SEQUENCE_ID:"actionSequenceId",
	K_ADD_DEFAULT_PLANNING_AREA:"addDefaultPlanningArea",
	K_CATEGORY:"category",
	K_CONFLICT_RESOLUTION:"conflictResolution",
	K_CREATION_TIME:"creationTime",
	K_DELETED:"deleted",
	K_DESCRIPTION:"description",
	K_END_TIME:"endTime",
	K_ENFORCE_LIMIT:"enforceLimit",
	K_FILTER_OUT_MANY_UNCHANGED_FACTS:"filterOutUnchangedFacts",
	K_FILTER_OUT_READ_ONLY_FACTS:"filterOutReadOnlyFacts",
	K_FILTER_OUT_UNCHANGED_FACTS:"filterOutUnchangedFacts",
	K_HAS_EXTERNAL_STORAGE:"hasExternalStorage",
	K_HAS_PLANNING_AREA:"hasPlanningArea",
	K_ID:"id",
	K_INSERTED:"inserted",
	K_IS_CURRENT:"isCurrent",
	K_IS_DAC_WRITE_ENABLED:"isDACWriteEnabled",
	K_IS_IN_PUBLIC_EDIT_MODE:"isInPublicEditMode",
	K_IS_PUBLIC:"isPublic",
	K_IS_SHARED:"isShared",
	K_IS_SUPPORTED:"isSupported",
	K_IS_SUSPENDED_FOR_INPUT_SCHEDULE:"isSuspendedForInputSchedule",
	K_IS_WRITEBACK_ENABLED:"isWritebackEnabled",
	K_MEMBER_CONTEXT:"memberContext",
	K_NAVIGATABLE:"navigatable",
	K_OPERATIONS:"operations",
	K_OPERATIONS_COPYING:"copying",
	K_OPERATIONS_DELETING:"deleting",
	K_OPERATIONS_PLANNING:"planning",
	K_OPERATIONS_PUBLISHING_FROM:"publishingFrom",
	K_OPERATIONS_PUBLISHING_TO:"publishingTo",
	K_OPERATIONS_READING:"reading",
	K_OPERATIONS_SAVING_PUBLIC_EDIT:"savingPublicEdit",
	K_OPERATIONS_SHARING:"sharing",
	K_OPERATIONS_STARTING_PUBLIC_EDIT:"startingPublicEdit",
	K_OPERATIONS_UNDOING_REDOING:"undoingRedoing",
	K_OWNER:"owner",
	K_OWNER_DISPLAY_NAME:"ownerDisplayName",
	K_PLANNING_AREA_EXTENSION:"planningAreaExtension",
	K_PLANNING_AREA_EXTENSION_COUNT:"planningAreaExtensionCount",
	K_REPORTED:"reported",
	K_ROW_COUNT:"rowCount",
	K_RUNNING_ACTION:"runningAction",
	K_RUNNING_SEQUENCE:"runningSequence",
	K_RUN_IN_JOB:"runInJob",
	K_SOURCE_VERSION_ID:"sourceVersionId",
	K_START_REQUESTS:"startRequests",
	K_START_TIME:"startTime",
	K_STATE_ID:"stateId",
	K_STEPS:"steps",
	K_TARGET_VERSION_ID:"targetVersionId",
	K_TECHNICAL:"technical",
	K_UNDO_STATES:"undoStates",
	K_USER:"user",
	K_USER_DISPLAY_NAME:"userDisplayName",
	K_VERSIONS:"versions",
	K_VERSION_ID:"versionId",
	K_VERSION_IDS:"versionIds",
	K_WORKFLOW_STATE:"workflowState",
	V_CONFLICT_RESOLUTION_ABORT:"ABORT",
	V_CONFLICT_RESOLUTION_PRIVATE_WINS:"PRIVATE_WINS",
	V_CONFLICT_RESOLUTION_PUBLIC_WINS:"PUBLIC_WINS",
	V_JOB_EXECUTION_ALWAYS:"ALWAYS",
	V_JOB_EXECUTION_AUTO:"AUTO",
	V_JOB_EXECUTION_NEVER:"NEVER",
	V_PLANNING_STEP_ADVANCED_SPREADING:"ADVANCED_SPREADING",
	V_PLANNING_STEP_ALLOCATION:"ALLOCATION",
	V_PLANNING_STEP_COPYPASTE:"COPYPASTE",
	V_PLANNING_STEP_COPY_TO_PRIVATE_EMPTY_VERSION:"COPY_TO_PRIVATE_EMPTY_VERSION",
	V_PLANNING_STEP_COPY_TO_PRIVATE_VERSION:"COPY_TO_PRIVATE_VERSION",
	V_PLANNING_STEP_DATA_ACTION_DEBUGGING:"DATA_ACTION_DEBUGGING",
	V_PLANNING_STEP_DATA_ENTRY:"DATA_ENTRY",
	V_PLANNING_STEP_DEFAULT:"DEFAULT",
	V_PLANNING_STEP_DELETE_FACT:"DELETE_FACT",
	V_PLANNING_STEP_DISTRIBUTION:"DISTRIBUTION",
	V_PLANNING_STEP_MASS_DATA_ENTRY:"MASS_DATA_ENTRY",
	V_PLANNING_STEP_PLANNINGSEQUENCE_EXECUTION:"PLANNINGSEQUENCE_EXECUTION",
	V_PLANNING_STEP_SPREADING:"SPREADING",
	V_PLANNING_STEP_START_PUBLIC_EDIT:"START_PUBLIC_EDIT",
	V_PLANNING_STEP_VDT_SIMULATION:"VDT_SIMULATION"
};

oFF.EpmPlanningVersionRestConstants = {

	DELETE_VERSION:"/sap/fpa/services/rest/v1/internal/models/{MODEL_ID}/versions/{VERSION_ID}",
	GET_ACTION_SEQUENCES:"/sap/fpa/services/rest/v1/internal/models/{MODEL_ID}/action-sequences",
	GET_ACTION_SEQUENCES_FOR_VERSION:"/sap/fpa/services/rest/v1/internal/models/{MODEL_ID}/versions/{VERSION_ID}/action-sequences",
	GET_LIST_VERSIONS:"/sap/fpa/services/rest/v1/internal/models/{MODEL_ID}/versions",
	GET_VERSION_DETAILS:"/sap/fpa/services/rest/v1/internal/models/{MODEL_ID}/versions/{VERSION_ID}",
	GET_VERSION_UNDO_REDO_STATES:"/sap/fpa/services/rest/v1/internal/models/{MODEL_ID}/versions/{VERSION_ID}/undo-states",
	PARAMETER_MODEL_ID:"{MODEL_ID}",
	PARAMETER_VERSION_ID:"{VERSION_ID}",
	POST_CANCEL_ACTIONS:"/sap/fpa/services/rest/v1/internal/models/{MODEL_ID}/version-actions/cancel",
	POST_COMMIT_ACTION_SEQUENCES:"/sap/fpa/services/rest/v1/internal/models/{MODEL_ID}/version-actions/commit-action-sequences",
	POST_COPY_TO_PRIVATE:"/sap/fpa/services/rest/v1/internal/models/{MODEL_ID}/version-actions/copy-to-private",
	POST_CREATE_EMPTY_VERSION:"/sap/fpa/services/rest/v1/internal/models/{MODEL_ID}/versions",
	POST_DISCARD_ACTION_SEQUENCES:"/sap/fpa/services/rest/v1/internal/models/{MODEL_ID}/version-actions/discard-action-sequences",
	POST_DISCARD_PUBLIC_VERSION_EDIT:"/sap/fpa/services/rest/v1/internal/models/{MODEL_ID}/version-actions/discard-public-edit",
	POST_PUBLISH_TO_EXISTING:"/sap/fpa/services/rest/v1/internal/models/{MODEL_ID}/version-actions/publish-to-existing",
	POST_PUBLISH_TO_NEW_VERSION:"/sap/fpa/services/rest/v1/internal/models/{MODEL_ID}/version-actions/publish-to-new",
	POST_RESTORE_FROM_SUSPENSION:"/sap/fpa/services/rest/v1/internal/models/{MODEL_ID}/version-actions/restore-from-suspension",
	POST_SAVE_PUBLIC_VERSION_EDIT:"/sap/fpa/services/rest/v1/internal/models/{MODEL_ID}/version-actions/save-public-edit",
	POST_START_ACTION_SEQUENCES:"/sap/fpa/services/rest/v1/internal/models/{MODEL_ID}/version-actions/start-action-sequences",
	POST_START_PUBLIC_VERSION_EDIT:"/sap/fpa/services/rest/v1/internal/models/{MODEL_ID}/version-actions/start-public-edit",
	POST_VERSION_GOTO_STATE:"/sap/fpa/services/rest/v1/internal/models/{MODEL_ID}/version-actions/go-to-undo-state",
	POST_VERSION_NAVIGATE_STATE:"/sap/fpa/services/rest/v1/internal/models/{MODEL_ID}/version-actions/navigate-undo-state"
};

oFF.EpmPlanningActionRestAccessor = {

	addMemberParameterValue:function(memberParameter, valueElement)
	{
			if (oFF.notNull(valueElement))
		{
			memberParameter.pushNewDefaultMemberValue();
			memberParameter.pushNewMemberValue();
			if (valueElement.isList())
			{
				let valueList = valueElement.asList();
				oFF.XCollectionUtils.forEach(valueList, (valueItemElement) => {
					let elementString = oFF.XValueUtil.getString(valueItemElement.copyAsPrimitiveXValue());
					memberParameter.addNewMemberValueItem(elementString);
					memberParameter.addNewDefaultMemberValueItem(elementString);
				});
			}
			else
			{
				let itemString = oFF.XValueUtil.getString(valueElement.copyAsPrimitiveXValue());
				memberParameter.addNewMemberValueItem(itemString);
				memberParameter.addNewDefaultMemberValueItem(itemString);
			}
		}
	},
	addParameterValue:function(valueType, evp, element)
	{
			let newValue = oFF.XValueUtil.convertValueExt(element.copyAsPrimitiveXValue(), valueType, false);
		evp.addValue(newValue);
		evp.addDefaultValue(newValue);
	},
	applyActionParameter:function(action, structure, cubeStructure, dimId2cubeId)
	{
			let id = structure.getStringByKeyExt(oFF.EpmPlanningActionJsonConstants.K_ID, structure.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_DISPLAY_KEY));
		let name = structure.getStringByKeyExt(oFF.EpmPlanningActionJsonConstants.K_NAME, structure.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_DISPLAY_NAME));
		let description = structure.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_DESCRIPTION);
		let inputEnabled = !oFF.XString.isEqual(structure.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_INPUT_TYPE), oFF.EpmPlanningActionJsonConstants.V_INPUT_TYPE_FIXED);
		let cubeId = structure.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_CUBE_ID);
		if (oFF.XStringUtils.isNullOrEmpty(cubeId))
		{
			cubeId = structure.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_MODEL_ID);
		}
		let dimensionId = structure.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_DIMENSION_ID);
		let hierarchyName = structure.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_HIERARCHY_NAME);
		if (oFF.XStringUtils.isNullOrEmpty(hierarchyName))
		{
			hierarchyName = structure.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_HIERARCHY_ID);
		}
		let allowMultipleValues = oFF.XString.startsWith(structure.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_CARDINALITY), oFF.EpmPlanningActionJsonConstants.V_CARDINALITY_MULTI);
		let valueType = oFF.EpmPlanningActionRestAccessor.getValueType(structure.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_TYPE), structure.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_SUB_TYPE));
		let value = structure.getByKey(oFF.EpmPlanningActionJsonConstants.K_VALUE);
		if (oFF.isNull(value))
		{
			value = structure.getByKey(oFF.EpmPlanningActionJsonConstants.K_DEFAULT_VALUE);
		}
		if (valueType === oFF.XValueType.DIMENSION_MEMBER && oFF.XStringUtils.isNotNullAndNotEmpty(dimensionId))
		{
			if (oFF.XStringUtils.isNullOrEmpty(cubeId) && oFF.notNull(dimId2cubeId))
			{
				cubeId = dimId2cubeId.getByKey(dimensionId);
			}
			let mvp = action.addMemberParameter(oFF.XStringUtils.isNullOrEmpty(id) ? name : id, description, cubeId, dimensionId, allowMultipleValues, inputEnabled, true);
			mvp.setHierarchyName(hierarchyName);
			mvp.setHierarchyNameFixed(oFF.XStringUtils.isNotNullAndNotEmpty(hierarchyName));
			if (oFF.notNull(value) && value.isStructure())
			{
				let valueStructure = value.asStructure();
				let defaultHierarchyName = null;
				if (valueStructure.containsKey(oFF.EpmPlanningActionJsonConstants.K_HIERARCHY_NAME))
				{
					defaultHierarchyName = valueStructure.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_HIERARCHY_NAME);
				}
				if (valueStructure.containsKey(oFF.EpmPlanningActionJsonConstants.K_HIERARCHY_ID))
				{
					defaultHierarchyName = valueStructure.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_HIERARCHY_ID);
				}
				if (oFF.XStringUtils.isNotNullAndNotEmpty(defaultHierarchyName))
				{
					mvp.setDefaultHierarchyName(defaultHierarchyName);
					mvp.setHierarchyName(defaultHierarchyName);
				}
				let hierarchyLevelFields = valueStructure.getListByKey(oFF.EpmPlanningActionJsonConstants.K_HIERARCHY_FIELDS);
				if (oFF.XCollectionUtils.hasElements(hierarchyLevelFields))
				{
					oFF.XCollectionUtils.forEach(hierarchyLevelFields, (hlf) => {
						mvp.addLevelFieldName(hlf.asString().getString());
					});
				}
				if (valueStructure.containsKey(oFF.EpmPlanningActionJsonConstants.K_MEMBER_ID))
				{
					oFF.EpmPlanningActionRestAccessor.addMemberParameterValue(mvp, valueStructure.getByKey(oFF.EpmPlanningActionJsonConstants.K_MEMBER_ID));
				}
				else if (valueStructure.containsKey(oFF.EpmPlanningActionJsonConstants.K_MEMBER_IDS))
				{
					oFF.XCollectionUtils.forEach(valueStructure.getListByKey(oFF.EpmPlanningActionJsonConstants.K_MEMBER_IDS), (mid) => {
						oFF.EpmPlanningActionRestAccessor.addMemberParameterValue(mvp, mid);
					});
				}
			}
		}
		else
		{
			let evp = action.addValueParameter(valueType, oFF.XStringUtils.isNullOrEmpty(id) ? name : id, description, allowMultipleValues, inputEnabled, true);
			if (value.isList())
			{
				oFF.XCollectionUtils.forEach(value.asList(), (sv) => {
					oFF.EpmPlanningActionRestAccessor.addParameterValue(valueType, evp, sv);
				});
			}
			else if (value.isStructure())
			{
				let valueStructure = value.asStructure();
				if (valueStructure.containsKey(oFF.EpmPlanningActionJsonConstants.K_MEMBER_ID))
				{
					oFF.EpmPlanningActionRestAccessor.addParameterValue(valueType, evp, valueStructure.getByKey(oFF.EpmPlanningActionJsonConstants.K_MEMBER_ID));
				}
				else if (valueStructure.containsKey(oFF.EpmPlanningActionJsonConstants.K_MEMBER_IDS))
				{
					oFF.XCollectionUtils.forEach(valueStructure.getListByKey(oFF.EpmPlanningActionJsonConstants.K_MEMBER_IDS), (isv) => {
						oFF.EpmPlanningActionRestAccessor.addParameterValue(valueType, evp, isv);
					});
				}
			}
			else
			{
				oFF.EpmPlanningActionRestAccessor.addParameterValue(valueType, evp, value);
			}
		}
	},
	applyAutoPublishProperties:function(action, parameterStructure)
	{
			let autoPublish = parameterStructure.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_AUTO_PUBLISH);
		autoPublish.putBoolean(oFF.EpmPlanningActionJsonConstants.K_ENABLED, action.isAutoPublishEnabled());
		autoPublish.putBoolean(oFF.EpmPlanningActionJsonConstants.K_FILTER_OUT_READ_ONLY_FACTS, action.isFilterOutReadOnlyFacts());
	},
	applyDataActionParameters:function(action, dataSection)
	{
			let cubeStructure = dataSection.getStructureByKey(oFF.EpmPlanningActionJsonConstants.K_CUBE_METADATA_BY_ID);
		let reverseMap = oFF.XHashMapByString.create();
		if (oFF.XCollectionUtils.hasElements(cubeStructure))
		{
			oFF.XCollectionUtils.forEach(cubeStructure.getKeysAsReadOnlyList(), (cubeId) => {
				let cube = cubeStructure.getStructureByKey(cubeId);
				let metadata = cube.getStructureByKey(oFF.EpmPlanningActionJsonConstants.K_METADATA);
				let dimensions = metadata.getListByKey(oFF.EpmPlanningActionJsonConstants.K_DIMENSIONS);
				oFF.XCollectionUtils.forEach(dimensions, (dim) => {
					let dimensionId = dim.asStructure().getStringByKey(oFF.EpmPlanningActionJsonConstants.K_DIMENSION_ID);
					reverseMap.put(dimensionId, cubeId);
				});
			});
		}
		let sequenceStructure = dataSection.getStructureByKey(oFF.EpmPlanningActionJsonConstants.K_SEQUENCE);
		let parameterList = sequenceStructure.getListByKey(oFF.EpmPlanningActionJsonConstants.K_PARAMETERS);
		oFF.XCollectionUtils.forEach(parameterList, (param) => {
			oFF.EpmPlanningActionRestAccessor.applyActionParameter(action, param.asStructure(), cubeStructure, reverseMap);
		});
	},
	applyMetadata:function(action, rootElementGeneric)
	{
			let metadataStructure = null;
		if (rootElementGeneric.isStructure())
		{
			metadataStructure = rootElementGeneric.asStructure();
		}
		else if (rootElementGeneric.isList())
		{
			metadataStructure = rootElementGeneric.asList().getStructureAt(0);
		}
		if (oFF.notNull(metadataStructure))
		{
			oFF.EpmPlanningActionRestAccessor.applyMetadataStructure(action, metadataStructure);
		}
	},
	applyMetadataStructure:function(action, metadataStructure)
	{
			let componentType = action.getOlapComponentType();
		let metadataSection = metadataStructure.getStructureByKey(oFF.EpmPlanningActionJsonConstants.K_METADATA);
		if (oFF.notNull(metadataSection))
		{
			let idStructure = metadataSection.getStructureByKey(oFF.EpmPlanningActionJsonConstants.K_ID);
			let name = idStructure.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_NAME);
			let packageName = idStructure.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_PACKAGE);
			let description = metadataSection.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_DESCRIPTION);
			let dataSection = metadataStructure.getStructureByKey(oFF.EpmPlanningActionJsonConstants.K_DATA);
			action.setName(name);
			action.setText(description);
			action.setPackageName(packageName);
			if (componentType === oFF.EpmActionType.MULTI_ACTION)
			{
				oFF.EpmPlanningActionRestAccessor.applyMultiActionParameters(action, dataSection);
			}
			else
			{
				oFF.EpmPlanningActionRestAccessor.applyDataActionParameters(action, dataSection);
			}
		}
		let dataActionSection = metadataStructure.getStructureByKey(oFF.EpmPlanningActionJsonConstants.K_DATA_ACTION);
		if (componentType === oFF.EpmActionType.DATA_ACTION && oFF.notNull(dataActionSection))
		{
			let idString = dataActionSection.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_ID);
			let idSplit = oFF.XStringTokenizer.splitString(idString, ":");
			let packageName = idSplit.get(0);
			let name = idSplit.get(1);
			let description = dataActionSection.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_DESCRIPTION);
			action.setName(name);
			action.setText(description);
			action.setPackageName(packageName);
			let parameterList = dataActionSection.getListByKey(oFF.EpmPlanningActionJsonConstants.K_PARAMETERS);
			oFF.XCollectionUtils.forEach(parameterList, (param) => {
				oFF.EpmPlanningActionRestAccessor.applyActionParameter(action, param.asStructure(), null, null);
			});
		}
		let multiActionSection = metadataStructure.getStructureByKey(oFF.EpmPlanningActionJsonConstants.K_MULTI_ACTION);
		if (componentType === oFF.EpmActionType.MULTI_ACTION && oFF.notNull(multiActionSection))
		{
			let idString = multiActionSection.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_ID);
			let idSplit = oFF.XStringTokenizer.splitString(idString, ":");
			let packageName = idSplit.get(0);
			let name = idSplit.get(1);
			let description = multiActionSection.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_DESCRIPTION);
			action.setName(name);
			action.setText(description);
			action.setPackageName(packageName);
			let parameterList = multiActionSection.getListByKey(oFF.EpmPlanningActionJsonConstants.K_PARAMETERS);
			oFF.XCollectionUtils.forEach(parameterList, (param) => {
				oFF.EpmPlanningActionRestAccessor.applyActionParameter(action, param.asStructure(), null, null);
			});
		}
	},
	applyMultiActionParameters:function(action, dataSection)
	{
			oFF.XCollectionUtils.forEach(dataSection.getListByKey(oFF.EpmPlanningActionJsonConstants.K_PARAMETERS), (param) => {
			oFF.EpmPlanningActionRestAccessor.applyActionParameter(action, param.asStructure(), null, null);
		});
	},
	applyPublicEditCreationProperties:function(action, parameterStructure)
	{
			let publicEditCreation = parameterStructure.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_PUBLIC_EDIT_CREATION);
		let currencyConversionSettings = publicEditCreation.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_CURRENCY_CONVERSION_SETTINGS);
		let currencyConversionType = oFF.EpmPlanningActionJsonConstants.V_DEFAULT_CURRENCY;
		if (action.getCurrencyConversionType() === oFF.EpmCurrencyConversionSettingsType.LOCAL_CURRENCY)
		{
			currencyConversionType = oFF.EpmPlanningActionJsonConstants.V_LOCAL_CURRENCY;
		}
		currencyConversionSettings.putString(oFF.EpmPlanningActionJsonConstants.K_TYPE, currencyConversionType);
		publicEditCreation.putBoolean(oFF.EpmPlanningActionJsonConstants.K_APPLY_PLANNING_AREA, action.isApplyPlanningArea());
		let planningArea = oFF.EpmPlanningActionJsonConstants.V_DEFAULT;
		if (action.getPlanningAreaType() === oFF.EpmPlanningAreaType.NONE)
		{
			planningArea = oFF.EpmPlanningActionJsonConstants.V_NONE;
		}
		else if (action.getPlanningAreaType() === oFF.EpmPlanningAreaType.EMPTY)
		{
			planningArea = oFF.EpmPlanningActionJsonConstants.V_EMPTY;
		}
		publicEditCreation.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_PLANNING_AREA).putString(oFF.EpmPlanningActionJsonConstants.K_TYPE, planningArea);
	},
	complementExecutionResult:function(actionExecution, rootElement)
	{
			let executionResult = rootElement.getStructureByKey(oFF.EpmPlanningActionJsonConstants.K_EXECUTION_RESULT);
		if (oFF.isNull(executionResult) && rootElement.containsKey(oFF.EpmPlanningActionJsonConstants.K_VALIDATION_RESULT))
		{
			executionResult = rootElement.getStructureByKey(oFF.EpmPlanningActionJsonConstants.K_VALIDATION_RESULT);
		}
		if (oFF.notNull(executionResult))
		{
			let messages = null;
			if (executionResult.containsKey(oFF.EpmPlanningActionJsonConstants.K_OVER_ALL_MESSAGES))
			{
				messages = oFF.EpmPlanningActionRestAccessor.createMessages(executionResult.getListByKey(oFF.EpmPlanningActionJsonConstants.K_OVER_ALL_MESSAGES));
			}
			else if (executionResult.containsKey(oFF.EpmPlanningActionJsonConstants.K_MESSAGES))
			{
				messages = oFF.EpmPlanningActionRestAccessor.createMessages(executionResult.getListByKey(oFF.EpmPlanningActionJsonConstants.K_MESSAGES));
			}
			if (executionResult.containsKey(oFF.EpmPlanningActionJsonConstants.K_MAX_SEVERITY))
			{
				actionExecution.adaptMaxSeverity(oFF.EpmPlanningActionRestAccessor.getSeverity(executionResult.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_MAX_SEVERITY)));
			}
			else
			{
				oFF.XCollectionUtils.forEach(messages, (msg) => {
					actionExecution.adaptMaxSeverity(msg.getSeverity());
				});
			}
			oFF.XCollectionUtils.forEach(messages, (om) => {
				actionExecution.addOverallMessage(om);
			});
			messages = oFF.EpmPlanningActionRestAccessor.createMessages(executionResult.getListByKey(oFF.EpmPlanningActionJsonConstants.K_PARAMETER_MESSAGES));
			oFF.XCollectionUtils.forEach(messages, (pm) => {
				actionExecution.addParameterMessage(pm);
			});
			messages = oFF.EpmPlanningActionRestAccessor.createMessages(executionResult.getListByKey(oFF.EpmPlanningActionJsonConstants.K_EXECUTION_CONFIGURATION_MESSAGES));
			oFF.XCollectionUtils.forEach(messages, (ecm) => {
				actionExecution.addExecutionConfigurationMessage(ecm);
			});
			oFF.XCollectionUtils.forEach(executionResult.getListByKey(oFF.EpmPlanningActionJsonConstants.K_TASK_MESSAGES), (tms) => {
				let taskMessages = oFF.EpmPlanningActionRestAccessor.createMessages(tms.asStructure().getListByKey(oFF.EpmPlanningActionJsonConstants.K_MESSAGES));
				oFF.XCollectionUtils.forEach(taskMessages, (tm) => {
					actionExecution.addTaskMessage(tm);
				});
			});
		}
	},
	createExecutionStatus:function(action, rootElement, uuid)
	{
			let actionExecution = oFF.EpmPlanningActionExecution.create(action);
		let executionId = rootElement.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_EXECUTION_ID);
		if (oFF.XStringUtils.isNullOrEmpty(executionId))
		{
			executionId = rootElement.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_INSTANCE_ID);
		}
		actionExecution.setExecutionId(executionId);
		if (oFF.XStringUtils.isNotNullAndNotEmpty(uuid))
		{
			actionExecution.setStartId(uuid);
		}
		oFF.EpmPlanningActionRestAccessor.complementExecutionResult(actionExecution, rootElement);
		return actionExecution;
	},
	createMessage:function(messageStructure)
	{
			let severity = oFF.EpmPlanningActionRestAccessor.getSeverity(messageStructure.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_SEVERITY));
		if (oFF.isNull(severity))
		{
			severity = oFF.EpmPlanningActionRestAccessor.getSeverity(messageStructure.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_MESSAGE_TYPE));
		}
		let code = messageStructure.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_CODE);
		if (oFF.XStringUtils.isNullOrEmpty(code))
		{
			code = messageStructure.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_ERROR_CODE);
		}
		let messageString = messageStructure.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_ERROR_MESSAGE);
		if (oFF.XStringUtils.isNullOrEmpty(messageString))
		{
			messageString = messageStructure.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_MESSAGE);
		}
		let detail = messageStructure.getByKey(oFF.EpmPlanningActionJsonConstants.K_DETAIL);
		if (oFF.isNull(detail))
		{
			detail = messageStructure.getByKey(oFF.EpmPlanningActionJsonConstants.K_DETAILS);
		}
		let messageCode = 0;
		try
		{
			messageCode = oFF.XInteger.convertFromString(code);
		}
		catch (t)
		{
			messageCode = -1;
		}
		let message = oFF.XMessage.createMessage(null, severity, messageCode, messageString, null, false, detail);
		message.setMessageClass(code);
		return message;
	},
	createMessages:function(messageList)
	{
			let list = oFF.XList.create();
		let size = oFF.XCollectionUtils.size(messageList);
		for (let i = 0; i < size; i++)
		{
			oFF.XCollectionUtils.addIfNotNull(list, oFF.EpmPlanningActionRestAccessor.createMessage(messageList.getStructureAt(i)));
		}
		return list;
	},
	createPlanningActionForType:function(context, connectionContainer, systemType, actionType, rootElementGeneric)
	{
			let action = null;
		if (actionType === oFF.EpmActionType.MULTI_ACTION)
		{
			action = oFF.EpmMultiAction.create(context, systemType, connectionContainer);
		}
		else if (actionType === oFF.EpmActionType.DATA_ACTION)
		{
			action = oFF.EpmDataAction.create(context, systemType, connectionContainer);
		}
		oFF.EpmPlanningActionRestAccessor.applyMetadata(action, rootElementGeneric);
		return action;
	},
	executeAction:function(connection, syncType, requestMethod, requestPath, parameterStructure, listener)
	{
			let rpcFunction = connection.newRpcFunction(requestPath);
		let request = rpcFunction.getRpcRequest();
		request.setRequestStructure(parameterStructure);
		request.setMethod(requestMethod);
		return rpcFunction.processFunctionExecution(syncType, listener, null);
	},
	executePlanningAction:function(action, syncType, executionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			if (a.isValid())
			{
				let execution = oFF.EpmPlanningActionRestAccessor.createExecutionStatus(action, b.getRootElement(), null);
				executionConsumer(execution, a);
			}
			else
			{
				executionConsumer(null, a);
			}
		});
		if (action.getOlapComponentType() === oFF.EpmActionType.DATA_ACTION)
		{
			let resolvedPath = oFF.XString.replace(oFF.EpmPlanningActionRestConstants.POST_DATA_ACTION_EXECUTION, oFF.EpmPlanningActionRestConstants.PARAMETER_ACTION_ID, action.getFullyQualifiedName());
			let parameterStructure = oFF.EpmPlanningActionRestAccessor.getExecutePlanningActionMetadataPostBodySimpleForTenantAndActionId(action);
			oFF.EpmPlanningActionRestAccessor.applyPublicEditCreationProperties(action, parameterStructure);
			oFF.EpmPlanningActionRestAccessor.applyAutoPublishProperties(action, parameterStructure);
			oFF.EpmPlanningActionRestAccessor.executeAction(action.getConnection(), syncType, oFF.HttpRequestMethod.HTTP_POST, resolvedPath, parameterStructure, listener);
		}
		else if (action.getOlapComponentType() === oFF.EpmActionType.MULTI_ACTION)
		{
			let resolvedPath = oFF.XString.replace(oFF.EpmPlanningActionRestConstants.POST_MULTI_ACTION_EXECUTION, oFF.EpmPlanningActionRestConstants.PARAMETER_ACTION_ID, action.getFullyQualifiedName());
			let parameterStructure = oFF.EpmPlanningActionRestAccessor.getExecutePlanningActionMetadataPostBodySimpleForTenantAndActionId(action);
			oFF.EpmPlanningActionRestAccessor.executeAction(action.getConnection(), syncType, oFF.HttpRequestMethod.HTTP_POST, resolvedPath, parameterStructure, listener);
		}
		else
		{
			let resolvedPath = oFF.EpmPlanningActionRestConstants.POST_OBJECT_MANAGER;
			let parameterStructure = oFF.EpmPlanningActionRestAccessor.getExecutePlanningActionMetadataPostBodyForTenantAndActionId(action, null, null);
			oFF.EpmPlanningActionRestAccessor.executeAction(action.getConnection(), syncType, oFF.HttpRequestMethod.HTTP_POST, resolvedPath, parameterStructure, listener);
		}
	},
	fillNewStyleVariableParams:function(action, parameterVariableList)
	{
			let parameters = action.getParameters();
		let actionType = action.getOlapComponentType();
		let size = oFF.XCollectionUtils.size(parameters);
		for (let i = 0; i < size; i++)
		{
			let parameter = parameters.get(i);
			let varStructure = parameterVariableList.addNewStructure();
			if (actionType === oFF.EpmActionType.DATA_ACTION)
			{
				varStructure.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_PARAMETER_ID).putString(oFF.EpmPlanningActionJsonConstants.K_KEY, parameter.getName());
			}
			else
			{
				varStructure.putString(oFF.EpmPlanningActionJsonConstants.K_PARAMETER_ID, parameter.getName());
			}
			if (parameter.isMemberParameter())
			{
				let valStructure = varStructure.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_VALUE);
				let memberIdsList = valStructure.putNewList(oFF.EpmPlanningActionJsonConstants.K_MEMBER_IDS);
				let memberParameter = parameter;
				valStructure.putString(oFF.EpmPlanningActionJsonConstants.K_HIERARCHY_ID, memberParameter.getHierarchyName());
				let levelNames = memberParameter.getLevelFieldNames();
				if (oFF.XCollectionUtils.hasElements(levelNames))
				{
					let hierarchyFields = valStructure.putNewList(oFF.EpmPlanningActionJsonConstants.K_HIERARCHY_FIELDS);
					oFF.XCollectionUtils.forEach(levelNames, (level) => {
						hierarchyFields.addString(level);
					});
					oFF.XCollectionUtils.forEach(memberParameter.getMemberValues(), (leveledValues) => {
						let valueList = memberIdsList.addNewList();
						let valueIterator = leveledValues.getIterator();
						while (valueIterator.hasNext())
						{
							let valueToAdd = valueIterator.next();
							if (oFF.isNull(valueToAdd))
							{
								break;
							}
							valueList.addString(valueToAdd);
						}
					});
				}
				else
				{
					oFF.XCollectionUtils.forEach(memberParameter.getMemberValues(), (flatValue) => {
						oFF.XCollectionUtils.getOptionalAtIndex(flatValue, 0).ifPresent((fv) => {
							memberIdsList.addString(fv);
						});
					});
				}
			}
			else
			{
				let values = parameter.getValues();
				let vList = oFF.PrFactory.createList();
				oFF.XCollectionUtils.forEach(values, (value) => {
					let vt = oFF.isNull(value) ? null : value.getValueType();
					if (vt === oFF.XValueType.DATE || vt === oFF.XValueType.STRING || vt === oFF.XValueType.DATE_TIME || vt === oFF.XValueType.TIME || vt === oFF.XValueType.DECIMAL_FLOAT && !values.mayLoosePrecision())
					{
						vList.addString(oFF.XValueUtil.getString(value));
					}
					else if (vt === oFF.XValueType.INTEGER)
					{
						vList.addInteger(oFF.XValueUtil.getInteger(value, false, true));
					}
					else if (vt === oFF.XValueType.LONG)
					{
						vList.addLong(oFF.XValueUtil.getLong(value, false, true));
					}
					else if (oFF.XConstantWithParent.isObjectTypeOf(vt, oFF.XValueType.NUMBER))
					{
						vList.addDouble(oFF.XValueUtil.getDouble(value, false, true));
					}
					else if (vt === oFF.XValueType.BOOLEAN)
					{
						vList.addBoolean(oFF.XValueUtil.getBoolean(value, false, true));
					}
				});
				if (oFF.XCollectionUtils.size(values) > 1)
				{
					varStructure.put(oFF.EpmPlanningActionJsonConstants.K_VALUES, vList);
				}
				else if (oFF.XCollectionUtils.hasElements(vList))
				{
					varStructure.put(oFF.EpmPlanningActionJsonConstants.K_VALUE, vList.get(0));
				}
			}
		}
	},
	fillParameterStructureForDataAction:function(planningAction, parameterList, uuid, resource)
	{
			parameterList.addNewStructure().putString(oFF.EpmPlanningActionJsonConstants.K_REQUEST_ID, uuid);
		let originStructure = parameterList.addNewStructure();
		originStructure.putString(oFF.EpmPlanningActionJsonConstants.K_TYPE, oFF.EpmPlanningActionJsonConstants.V_SUBTYPE_STORY);
		originStructure.putString(oFF.EpmPlanningActionJsonConstants.K_RESOURCE_ID, resource);
		originStructure.putString(oFF.EpmPlanningActionJsonConstants.K_NAME, resource);
		let parameterVariableList = parameterList.addNewList();
		oFF.EpmPlanningActionRestAccessor.fillVariableParameters(planningAction, parameterVariableList);
		let sourceList = parameterList.addNewList();
		oFF.XCollectionUtils.forEach(planningAction.getCubeIds(), (cubeId) => {
			sourceList.addString(cubeId);
		});
	},
	fillParameterStructureForMultiAction:function(planningAction, parameterStructure, uuid, resource)
	{
			parameterStructure.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_VARIABLES);
		parameterStructure.putString(oFF.EpmPlanningActionJsonConstants.K_REQUEST_ID, uuid);
		let runtimeParameters = parameterStructure.putNewList(oFF.EpmPlanningActionJsonConstants.K_RUNTIME_PARAMETER_VALUE);
		let parameters = planningAction.getParameters();
		let size = oFF.XCollectionUtils.size(parameters);
		for (let i = 0; i < size; i++)
		{
			let parameter = parameters.get(i);
			let varStructure = runtimeParameters.addNewStructure();
			varStructure.putString(oFF.EpmPlanningActionJsonConstants.K_FIELD_NAME, parameter.getName());
			let typePair = oFF.EpmPlanningActionRestAccessor.getType(parameter);
			varStructure.putStringNotNullAndNotEmpty(oFF.EpmPlanningActionJsonConstants.K_TYPE, typePair.getFirstString());
			varStructure.putStringNotNullAndNotEmpty(oFF.EpmPlanningActionJsonConstants.K_SUB_TYPE, typePair.getSecondString());
			varStructure.putInteger(oFF.EpmPlanningActionJsonConstants.K_PARAMETER_INDEX, i);
			varStructure.putString(oFF.EpmPlanningActionJsonConstants.K_SOURCE, parameter.isInputEnabled() ? oFF.EpmPlanningActionJsonConstants.V_INPUT_TYPE_PROMPT : oFF.EpmPlanningActionJsonConstants.V_INPUT_TYPE_FIXED);
			let valStructure = varStructure.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_VALUE);
			let memberIdsList = valStructure.putNewList(oFF.EpmPlanningActionJsonConstants.K_MEMBER_IDS);
			if (parameter.isMemberParameter())
			{
				let memberParameter = parameter;
				varStructure.putString(oFF.EpmPlanningActionJsonConstants.K_CUBE_ID, memberParameter.getCubeName());
				varStructure.putString(oFF.EpmPlanningActionJsonConstants.K_DIMENSION_ID, memberParameter.getDimensionName());
				valStructure.putString(oFF.EpmPlanningActionJsonConstants.K_HIERARCHY_NAME, memberParameter.getHierarchyName());
				let levelNames = memberParameter.getLevelFieldNames();
				if (oFF.XCollectionUtils.hasElements(levelNames))
				{
					let hierarchyFields = valStructure.putNewList(oFF.EpmPlanningActionJsonConstants.K_HIERARCHY_FIELDS);
					oFF.XCollectionUtils.forEach(levelNames, (level) => {
						hierarchyFields.addString(level);
					});
					oFF.XCollectionUtils.forEach(memberParameter.getMemberValues(), (leveledValue) => {
						let valueList = memberIdsList.addNewList();
						oFF.XCollectionUtils.forEach(leveledValue, (levelValue) => {
							valueList.addString(levelValue);
						});
					});
				}
				else
				{
					oFF.XCollectionUtils.forEach(memberParameter.getMemberValues(), (flatValue) => {
						oFF.XCollectionUtils.getOptionalAtIndex(flatValue, 0).ifPresent((fv) => {
							memberIdsList.addString(fv);
						});
					});
				}
			}
			else
			{
				let values = parameter.getValues();
				oFF.XCollectionUtils.forEach(values, (value) => {
					let vt = value.getValueType();
					if (vt === oFF.XValueType.DATE || vt === oFF.XValueType.STRING || vt === oFF.XValueType.DATE_TIME || vt === oFF.XValueType.TIME || vt === oFF.XValueType.DECIMAL_FLOAT && !values.mayLoosePrecision())
					{
						memberIdsList.addString(oFF.XValueUtil.getString(value));
					}
					else if (vt === oFF.XValueType.INTEGER)
					{
						memberIdsList.addInteger(oFF.XValueUtil.getInteger(value, false, true));
					}
					else if (vt === oFF.XValueType.LONG)
					{
						memberIdsList.addLong(oFF.XValueUtil.getLong(value, false, true));
					}
					else if (vt.isTypeOf(oFF.XValueType.NUMBER))
					{
						memberIdsList.addDouble(oFF.XValueUtil.getDouble(value, false, true));
					}
					else if (vt === oFF.XValueType.BOOLEAN)
					{
						memberIdsList.addBoolean(oFF.XValueUtil.getBoolean(value, false, true));
					}
				});
			}
		}
		let originStructure = parameterStructure.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_ORIGIN);
		originStructure.putString(oFF.EpmPlanningActionJsonConstants.K_TYPE, oFF.EpmPlanningActionJsonConstants.V_APPLICATION_TRIGGER);
		originStructure.putString(oFF.EpmPlanningActionJsonConstants.K_SUBTYPE, oFF.EpmPlanningActionJsonConstants.V_SUBTYPE_STORY);
		originStructure.putString(oFF.EpmPlanningActionJsonConstants.K_RESOURCE, resource);
		originStructure.putString(oFF.EpmPlanningActionJsonConstants.K_NAME, resource);
	},
	fillVariableParameters:function(planningAction, parameterVariableList)
	{
			let parameters = planningAction.getParameters();
		let size = oFF.XCollectionUtils.size(parameters);
		for (let i = 0; i < size; i++)
		{
			let parameter = parameters.get(i);
			let varStructure = parameterVariableList.addNewStructure();
			varStructure.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_ID).putString(oFF.EpmPlanningActionJsonConstants.K_DISPLAY_KEY, parameter.getName());
			let typePair = oFF.EpmPlanningActionRestAccessor.getType(parameter);
			varStructure.putStringNotNullAndNotEmpty(oFF.EpmPlanningActionJsonConstants.K_TYPE, typePair.getFirstString());
			varStructure.putStringNotNullAndNotEmpty(oFF.EpmPlanningActionJsonConstants.K_SUB_TYPE, typePair.getSecondString());
			varStructure.putInteger(oFF.EpmPlanningActionJsonConstants.K_PARAMETER_INDEX, i);
			varStructure.putString(oFF.EpmPlanningActionJsonConstants.K_SOURCE, parameter.isInputEnabled() ? oFF.EpmPlanningActionJsonConstants.V_INPUT_TYPE_PROMPT : oFF.EpmPlanningActionJsonConstants.V_INPUT_TYPE_FIXED);
			if (parameter.isMemberParameter())
			{
				let valStructure = varStructure.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_VALUE);
				let memberIdsList = valStructure.putNewList(oFF.EpmPlanningActionJsonConstants.K_MEMBER_IDS);
				let memberParameter = parameter;
				valStructure.putString(oFF.EpmPlanningActionJsonConstants.K_CUBE_ID, memberParameter.getCubeName());
				valStructure.putString(oFF.EpmPlanningActionJsonConstants.K_DIMENSION_ID, memberParameter.getDimensionName());
				valStructure.putString(oFF.EpmPlanningActionJsonConstants.K_HIERARCHY_NAME, memberParameter.getHierarchyName());
				let levelNames = memberParameter.getLevelFieldNames();
				if (oFF.XCollectionUtils.hasElements(levelNames))
				{
					let hierarchyFields = varStructure.putNewList(oFF.EpmPlanningActionJsonConstants.K_HIERARCHY_FIELDS);
					oFF.XCollectionUtils.forEach(levelNames, (level) => {
						hierarchyFields.addString(level);
					});
					oFF.XCollectionUtils.forEach(memberParameter.getMemberValues(), (leveledValues) => {
						let valueList = memberIdsList.addNewList();
						oFF.XCollectionUtils.forEach(leveledValues, (levelValue) => {
							valueList.addString(levelValue);
						});
					});
				}
				else
				{
					oFF.XCollectionUtils.forEach(memberParameter.getMemberValues(), (flatValue) => {
						oFF.XCollectionUtils.getOptionalAtIndex(flatValue, 0).ifPresent((fv) => {
							memberIdsList.addString(fv);
						});
					});
				}
			}
			else
			{
				let values = parameter.getValues();
				let vList = oFF.PrFactory.createList();
				oFF.XCollectionUtils.forEach(values, (value) => {
					let vt = oFF.isNull(value) ? null : value.getValueType();
					if (vt === oFF.XValueType.DATE || vt === oFF.XValueType.STRING || vt === oFF.XValueType.DATE_TIME || vt === oFF.XValueType.TIME || vt === oFF.XValueType.DECIMAL_FLOAT && !values.mayLoosePrecision())
					{
						vList.addString(oFF.XValueUtil.getString(value));
					}
					else if (vt === oFF.XValueType.INTEGER)
					{
						vList.addInteger(oFF.XValueUtil.getInteger(value, false, true));
					}
					else if (vt === oFF.XValueType.LONG)
					{
						vList.addLong(oFF.XValueUtil.getLong(value, false, true));
					}
					else if (oFF.XConstantWithParent.isObjectTypeOf(vt, oFF.XValueType.NUMBER))
					{
						vList.addDouble(oFF.XValueUtil.getDouble(value, false, true));
					}
					else if (vt === oFF.XValueType.BOOLEAN)
					{
						vList.addBoolean(oFF.XValueUtil.getBoolean(value, false, true));
					}
				});
				if (oFF.XCollectionUtils.size(values) > 1)
				{
					varStructure.put(oFF.EpmPlanningActionJsonConstants.K_VALUES, vList);
				}
				else if (oFF.XCollectionUtils.hasElements(vList))
				{
					varStructure.put(oFF.EpmPlanningActionJsonConstants.K_VALUE, vList.get(0));
				}
			}
		}
	},
	getActionMetadataPostBody:function(actionType, packageName, actionId)
	{
			let prStructure = oFF.PrFactory.createStructure();
		prStructure.putString(oFF.EpmPlanningActionJsonConstants.K_ACTION, oFF.EpmPlanningActionJsonConstants.V_READ_OBJECT);
		let dataStructure = prStructure.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_DATA);
		let parameter1Structure = dataStructure.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_PARAMETER_1);
		parameter1Structure.putString(oFF.EpmPlanningActionJsonConstants.K_NAME, actionId);
		parameter1Structure.putString(oFF.EpmPlanningActionJsonConstants.K_PACKAGE, packageName);
		parameter1Structure.putString(oFF.EpmPlanningActionJsonConstants.K_TYPE, actionType === oFF.EpmActionType.MULTI_ACTION ? oFF.EpmPlanningActionJsonConstants.V_MULTIACTIONS : oFF.EpmPlanningActionJsonConstants.V_PLANNINGSEQUENCE);
		dataStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_PARAMETER_2, false);
		let parameter3Structure = dataStructure.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_PARAMETER_3);
		let resourceOptionsStructure;
		let metadataStructure;
		let ancestorPathStructure;
		if (actionType === oFF.EpmActionType.MULTI_ACTION)
		{
			parameter3Structure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_B_USE_TEMP_SERVICE, true);
			resourceOptionsStructure = parameter3Structure.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_RESOURCE_OPTIONS);
			metadataStructure = resourceOptionsStructure.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_METADATA);
			metadataStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_NAME, true);
			metadataStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_DESCRIPTION, true);
			metadataStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_PARENT_RES_ID, true);
			metadataStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_SOURCE_RES_ID, true);
			metadataStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_ACCESS, true);
			metadataStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_FAV_RES_ID, true);
			ancestorPathStructure = metadataStructure.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_ANCESTOR_PATH);
			ancestorPathStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_NAME, true);
			ancestorPathStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_DESCRIPTION, true);
			ancestorPathStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_PARENT_RES_ID, true);
			ancestorPathStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_SPACE_ID, true);
			ancestorPathStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_ACCESS, true);
			resourceOptionsStructure.putInteger(oFF.EpmPlanningActionJsonConstants.K_ACCESS_MODE, 1);
		}
		else
		{
			parameter3Structure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_B_INCLUDE_ADDITIONAL_DATA, true);
			resourceOptionsStructure = parameter3Structure.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_RESOURCE_OPTIONS);
			metadataStructure = resourceOptionsStructure.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_METADATA);
			metadataStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_ACCESS, true);
			metadataStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_FAV_RES_ID, true);
			ancestorPathStructure = metadataStructure.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_ANCESTOR_PATH);
			ancestorPathStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_NAME, true);
			ancestorPathStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_DESCRIPTION, true);
			ancestorPathStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_PARENT_RES_ID, true);
			ancestorPathStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_SPACE_ID, true);
			ancestorPathStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_ACCESS, true);
		}
		return prStructure;
	},
	getContentLibRequestForCubeId:function(cubeId)
	{
			let structure = oFF.PrFactory.createStructure();
		structure.putString(oFF.EpmPlanningActionJsonConstants.K_ACTION, oFF.EpmPlanningActionJsonConstants.V_GET_CONTENT);
		let dataStructure = structure.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_DATA);
		dataStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_B_INC_DEPENDENCY, true);
		dataStructure.putString(oFF.EpmPlanningActionJsonConstants.K_RESOURCE_ID, cubeId);
		dataStructure.putString(oFF.EpmPlanningActionJsonConstants.K_RESOURCE_TYPE, oFF.EpmPlanningActionJsonConstants.V_RESOURCE_TYPE_CUBE);
		let optStructure = dataStructure.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_O_OPT);
		optStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_ADD_LAST_UPDATED, true);
		optStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_ADD_METADATA, false);
		optStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_DETAIL, true);
		optStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_INCL_SUB_OBJECT_TYPES, true);
		optStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_INCLUDE_TOTAL_RESOURCE_COUNT, true);
		optStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_LIST_FORMULA, true);
		optStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_LIST_VERSION, true);
		optStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_NEED_DIMENSION_VALIDATION_RULES, true);
		optStructure.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_PLANNING).putBoolean(oFF.EpmPlanningActionJsonConstants.K_CHECKS, true);
		optStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_PLANNING_FEATURES, true);
		optStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_RATE, true);
		optStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_TRANSLATE_CUSTOMIZED_DESCRIPTION, true);
		optStructure.putBoolean(oFF.EpmPlanningActionJsonConstants.K_VISUALIZATION, true);
		return structure;
	},
	getExecutePlanningActionMetadataPostBodyForTenantAndActionId:function(planningAction, uuid, resource)
	{
			let prStructure = oFF.PrFactory.createStructure();
		let actionType = planningAction.getComponentType();
		prStructure.putString(oFF.EpmPlanningActionJsonConstants.K_ACTION, oFF.EpmPlanningActionJsonConstants.V_CALL_FUNCTION);
		let dataStructure = prStructure.putNewStructure(oFF.EpmPlanningActionJsonConstants.K_DATA);
		dataStructure.putString(oFF.EpmPlanningActionJsonConstants.K_PARAMETER_1, oFF.XStringUtils.concatenate5(actionType === oFF.EpmActionType.MULTI_ACTION ? oFF.EpmPlanningActionJsonConstants.V_MULTIACTIONS : oFF.EpmPlanningActionJsonConstants.V_PLANNINGSEQUENCE, oFF.EpmPlanningActionJsonConstants.P_INFIX, planningAction.getPackageName(), oFF.EpmPlanningActionJsonConstants.P_INFIX, planningAction.getName()));
		dataStructure.putString(oFF.EpmPlanningActionJsonConstants.K_PARAMETER_2, oFF.EpmPlanningActionJsonConstants.V_EXECUTE);
		let parameterList = dataStructure.putNewList(oFF.EpmPlanningActionJsonConstants.K_PARAMETER_3);
		if (actionType === oFF.EpmActionType.MULTI_ACTION)
		{
			oFF.EpmPlanningActionRestAccessor.fillParameterStructureForMultiAction(planningAction, parameterList.addNewStructure(), uuid, resource);
		}
		else
		{
			oFF.EpmPlanningActionRestAccessor.fillParameterStructureForDataAction(planningAction, parameterList, uuid, resource);
		}
		return prStructure;
	},
	getExecutePlanningActionMetadataPostBodySimpleForTenantAndActionId:function(action)
	{
			let prStructure = oFF.PrFactory.createStructure();
		oFF.EpmPlanningActionRestAccessor.fillNewStyleVariableParams(action, prStructure.putNewList(oFF.EpmPlanningActionJsonConstants.K_PARAMETER_VALUES));
		return prStructure;
	},
	getSeverity:function(severityString)
	{
			let severity = null;
		if (oFF.XString.containsString(oFF.XString.toUpperCase(severityString), oFF.EpmPlanningActionJsonConstants.V_SEVERITY_ERROR))
		{
			severity = oFF.Severity.ERROR;
		}
		else if (oFF.XString.containsString(oFF.XString.toUpperCase(severityString), oFF.EpmPlanningActionJsonConstants.V_SEVERITY_WARN))
		{
			severity = oFF.Severity.WARNING;
		}
		else if (oFF.XString.containsString(oFF.XString.toUpperCase(severityString), oFF.EpmPlanningActionJsonConstants.V_SEVERITY_INFO))
		{
			severity = oFF.Severity.INFO;
		}
		else if (oFF.XString.containsString(oFF.XString.toUpperCase(severityString), oFF.EpmPlanningActionJsonConstants.V_SEVERITY_DEBUG))
		{
			severity = oFF.Severity.DEBUG;
		}
		return severity;
	},
	getType:function(parameter)
	{
			let typePair = null;
		let valueType = parameter.getValueType();
		if (valueType === oFF.XValueType.DIMENSION_MEMBER)
		{
			typePair = oFF.XPairOfString.create(oFF.EpmPlanningActionJsonConstants.V_TYPE_MEMBER, null);
		}
		else if (valueType === oFF.XValueType.STRING)
		{
			typePair = oFF.XPairOfString.create(oFF.EpmPlanningActionJsonConstants.V_TYPE_STRING, null);
		}
		else if (valueType === oFF.XValueType.DOUBLE)
		{
			typePair = oFF.XPairOfString.create(oFF.EpmPlanningActionJsonConstants.V_TYPE_DOUBLE, null);
		}
		else if (valueType === oFF.XValueType.INTEGER)
		{
			typePair = oFF.XPairOfString.create(oFF.EpmPlanningActionJsonConstants.V_TYPE_INTEGER, null);
		}
		else if (valueType.isTypeOf(oFF.XValueType.NUMBER))
		{
			typePair = oFF.XPairOfString.create(oFF.EpmPlanningActionJsonConstants.V_TYPE_NUMBER, null);
		}
		else if (valueType === oFF.XValueType.DATE)
		{
			typePair = oFF.XPairOfString.create(oFF.EpmPlanningActionJsonConstants.V_TYPE_DATETIME, oFF.EpmPlanningActionJsonConstants.V_SUB_TYPE_DATE);
		}
		else if (valueType === oFF.XValueType.TIME)
		{
			typePair = oFF.XPairOfString.create(oFF.EpmPlanningActionJsonConstants.V_TYPE_DATETIME, oFF.EpmPlanningActionJsonConstants.V_SUB_TYPE_TIME);
		}
		else if (valueType === oFF.XValueType.DATE_TIME)
		{
			typePair = oFF.XPairOfString.create(oFF.EpmPlanningActionJsonConstants.V_TYPE_DATETIME, null);
		}
		return typePair;
	},
	getValueType:function(typeString, subType)
	{
			let typeStringUpper = oFF.XString.toUpperCase(typeString);
		let valueType = null;
		if (oFF.XString.isEqual(typeStringUpper, oFF.EpmPlanningActionJsonConstants.V_TYPE_MEMBER))
		{
			valueType = oFF.XValueType.DIMENSION_MEMBER;
		}
		else if (oFF.XString.isEqual(typeStringUpper, oFF.EpmPlanningActionJsonConstants.V_TYPE_STRING))
		{
			valueType = oFF.XValueType.STRING;
		}
		else if (oFF.XString.isEqual(typeStringUpper, oFF.EpmPlanningActionJsonConstants.V_TYPE_NUMBER))
		{
			valueType = oFF.XValueType.NUMBER;
		}
		else if (oFF.XString.isEqual(typeStringUpper, oFF.EpmPlanningActionJsonConstants.V_TYPE_DOUBLE))
		{
			valueType = oFF.XValueType.DOUBLE;
		}
		else if (oFF.XString.isEqual(typeStringUpper, oFF.EpmPlanningActionJsonConstants.V_TYPE_INTEGER))
		{
			valueType = oFF.XValueType.INTEGER;
		}
		else if (oFF.XString.isEqual(typeStringUpper, oFF.EpmPlanningActionJsonConstants.V_TYPE_DATETIME))
		{
			if (oFF.XString.isEqual(subType, oFF.EpmPlanningActionJsonConstants.V_SUB_TYPE_DATE))
			{
				valueType = oFF.XValueType.DATE;
			}
			else if (oFF.XString.isEqual(typeStringUpper, oFF.EpmPlanningActionJsonConstants.V_SUB_TYPE_TIME))
			{
				valueType = oFF.XValueType.TIME;
			}
			else
			{
				valueType = oFF.XValueType.DATE_TIME;
			}
		}
		return valueType;
	},
	retrieveActionMetadata:function(context, connectionContainer, systemType, actionType, packageName, actionName, syncType, actionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			if (a.isValid())
			{
				actionConsumer(oFF.EpmPlanningActionRestAccessor.createPlanningActionForType(context, connectionContainer, systemType, actionType, b.getRootElementGeneric()), a);
			}
			else
			{
				actionConsumer(null, a);
			}
		});
		let result;
		if (actionType === oFF.EpmActionType.DATA_ACTION)
		{
			let resolvedPath = oFF.XString.replace(oFF.EpmPlanningActionRestConstants.GET_DATA_ACTION_DETAILS, oFF.EpmPlanningActionRestConstants.PARAMETER_ACTION_ID, oFF.XStringUtils.concatenate3(packageName, ":", actionName));
			result = oFF.EpmPlanningActionRestAccessor.executeAction(connectionContainer, syncType, oFF.HttpRequestMethod.HTTP_GET, resolvedPath, null, listener);
		}
		else if (actionType === oFF.EpmActionType.MULTI_ACTION)
		{
			let resolvedPath = oFF.XString.replace(oFF.EpmPlanningActionRestConstants.GET_MULTI_ACTION_DETAILS, oFF.EpmPlanningActionRestConstants.PARAMETER_ACTION_ID, oFF.XStringUtils.concatenate3(packageName, ":", actionName));
			result = oFF.EpmPlanningActionRestAccessor.executeAction(connectionContainer, syncType, oFF.HttpRequestMethod.HTTP_GET, resolvedPath, null, listener);
		}
		else
		{
			let resolvedPath = oFF.EpmPlanningActionRestConstants.POST_OBJECT_MANAGER;
			let parameterStructure = oFF.EpmPlanningActionRestAccessor.getActionMetadataPostBody(actionType, packageName, actionName);
			result = oFF.EpmPlanningActionRestAccessor.executeAction(connectionContainer, syncType, oFF.HttpRequestMethod.HTTP_POST, resolvedPath, parameterStructure, listener);
		}
		return result;
	},
	retrieveExecutionStatus:function(actionExecution, syncType, executionConsumer)
	{
			let planningAction = actionExecution.getPlanningAction();
		let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			if (a.isValid())
			{
				let data = a.getData();
				let root = oFF.isNull(data) ? null : data.getRootElement();
				actionExecution.setExecutionStatus(oFF.EpmJobExecutionStatus.lookup(oFF.isNull(root) ? null : root.getStringByKey(oFF.EpmPlanningActionJsonConstants.K_STATUS)));
				oFF.EpmPlanningActionRestAccessor.complementExecutionResult(actionExecution, root);
				executionConsumer(actionExecution, a);
			}
			else
			{
				executionConsumer(actionExecution, a);
			}
		});
		let componentType = planningAction.getOlapComponentType();
		let planningActionFullyQualifiedName = planningAction.getFullyQualifiedName();
		let resolvedPath;
		if (componentType === oFF.EpmActionType.MULTI_ACTION)
		{
			resolvedPath = oFF.EpmPlanningActionRestConstants.GET_MULTI_ACTION_EXECUTION_STATUS;
		}
		else
		{
			resolvedPath = oFF.EpmPlanningActionRestConstants.GET_DATA_ACTION_EXECUTION_STATUS;
		}
		resolvedPath = oFF.XString.replace(resolvedPath, oFF.EpmPlanningActionRestConstants.PARAMETER_ACTION_ID, planningActionFullyQualifiedName);
		resolvedPath = oFF.XString.replace(resolvedPath, oFF.EpmPlanningActionRestConstants.PARAMETER_EXECUTION_ID, actionExecution.getExecutionId());
		oFF.EpmPlanningActionRestAccessor.executeAction(planningAction.getConnection(), syncType, oFF.HttpRequestMethod.HTTP_GET, resolvedPath, null, listener);
	},
	retrieveSubQuery:function(planningAction, application, systemName, cubeId, syncType, actionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			let serviceConfig = null;
			let repoContent;
			if (a.isValid())
			{
				let sfxStructure = b.getRootElement();
				if (oFF.XCollectionUtils.hasElements(sfxStructure))
				{
					let sfxContent = oFF.XContent.createJsonObjectContent(oFF.QModelFormat.SFX, sfxStructure);
					let docConverter = oFF.DocConverterFactory.createDocConverter(oFF.QModelFormat.SFX, oFF.QModelFormat.INA_REPOSITORY);
					if (oFF.notNull(docConverter))
					{
						let extResult = docConverter.convert(application, sfxContent, oFF.QModelFormat.INA_REPOSITORY);
						let repoData = extResult.getData();
						if (oFF.notNull(repoData))
						{
							repoContent = repoData.getJsonContent().asStructure();
							let dataSource = oFF.QFactory.createDataSource();
							dataSource.setSystemName(systemName);
							dataSource.deserializeFromElementExt(oFF.QModelFormat.INA_REPOSITORY, repoContent);
							serviceConfig = oFF.QueryServiceConfig.createWithDataSource(application, systemName, dataSource);
						}
						else
						{
							repoContent = null;
						}
					}
					else
					{
						repoContent = null;
					}
				}
				else
				{
					repoContent = null;
				}
			}
			else
			{
				repoContent = null;
			}
			if (oFF.notNull(serviceConfig))
			{
				serviceConfig.processQueryManagerCreation(syncType, oFF.EpmQueryManagerCreationListenerLambda.createSingleUse((qmc) => {
					if (qmc.isValid())
					{
						let queryManager = qmc.getData();
						if (oFF.notNull(queryManager))
						{
							let queryModel = queryManager.getQueryModel();
							if (oFF.notNull(repoContent))
							{
								queryModel.deserializeFromElementExt(oFF.QModelFormat.INA_REPOSITORY, repoContent);
							}
							actionConsumer(queryModel, qmc);
						}
						else
						{
							actionConsumer(null, qmc);
						}
					}
					else
					{
						actionConsumer(null, qmc);
					}
				}), null);
			}
			else
			{
				actionConsumer(null, a);
			}
		});
		let resolvedPath = oFF.EpmPlanningActionRestConstants.POST_CONTENTLIB;
		let parameterStructure = oFF.EpmPlanningActionRestAccessor.getContentLibRequestForCubeId(cubeId);
		oFF.EpmPlanningActionRestAccessor.executeAction(planningAction.getConnection(), syncType, oFF.HttpRequestMethod.HTTP_POST, resolvedPath, parameterStructure, listener);
	},
	validatePlanningAction:function(action, syncType, executionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			if (a.isValid())
			{
				let execution = oFF.EpmPlanningActionRestAccessor.createExecutionStatus(action, b.getRootElement(), null);
				executionConsumer(execution, a);
			}
			else
			{
				executionConsumer(null, a);
			}
		});
		if (action.getOlapComponentType() === oFF.EpmActionType.DATA_ACTION)
		{
			let resolvedPath = oFF.XString.replace(oFF.EpmPlanningActionRestConstants.POST_DATA_ACTION_VALIDATION, oFF.EpmPlanningActionRestConstants.PARAMETER_ACTION_ID, action.getFullyQualifiedName());
			let parameterStructure = oFF.EpmPlanningActionRestAccessor.getExecutePlanningActionMetadataPostBodySimpleForTenantAndActionId(action);
			oFF.EpmPlanningActionRestAccessor.applyPublicEditCreationProperties(action, parameterStructure);
			oFF.EpmPlanningActionRestAccessor.applyAutoPublishProperties(action, parameterStructure);
			oFF.EpmPlanningActionRestAccessor.executeAction(action.getConnection(), syncType, oFF.HttpRequestMethod.HTTP_POST, resolvedPath, parameterStructure, listener);
		}
		else if (action.getOlapComponentType() === oFF.EpmActionType.MULTI_ACTION)
		{
			let resolvedPath = oFF.XString.replace(oFF.EpmPlanningActionRestConstants.POST_MULTI_ACTION_VALIDATION, oFF.EpmPlanningActionRestConstants.PARAMETER_ACTION_ID, action.getFullyQualifiedName());
			let parameterStructure = oFF.EpmPlanningActionRestAccessor.getExecutePlanningActionMetadataPostBodySimpleForTenantAndActionId(action);
			oFF.EpmPlanningActionRestAccessor.executeAction(action.getConnection(), syncType, oFF.HttpRequestMethod.HTTP_POST, resolvedPath, parameterStructure, listener);
		}
		else
		{
			let resolvedPath = oFF.EpmPlanningActionRestConstants.POST_OBJECT_MANAGER;
			let parameterStructure = oFF.EpmPlanningActionRestAccessor.getExecutePlanningActionMetadataPostBodyForTenantAndActionId(action, null, null);
			oFF.EpmPlanningActionRestAccessor.executeAction(action.getConnection(), syncType, oFF.HttpRequestMethod.HTTP_POST, resolvedPath, parameterStructure, listener);
		}
	}
};

oFF.EpmPlanningVersionRestAccessor = {

	cancelVersionActions:function(planningModel, versionKey, syncType, actionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			actionConsumer(a);
		});
		let resolvedPath = oFF.XString.replace(oFF.EpmPlanningVersionRestConstants.POST_CANCEL_ACTIONS, oFF.EpmPlanningVersionRestConstants.PARAMETER_MODEL_ID, oFF.EpmPlanningVersionRestAccessor.getModelSelector(planningModel));
		let parameters = oFF.PrFactory.createStructure();
		parameters.putString(oFF.EpmPlanningVersionJsonConstants.K_VERSION_ID, versionKey);
		oFF.EpmPlanningVersionRestAccessor.executeAction(planningModel, syncType, oFF.HttpRequestMethod.HTTP_POST, resolvedPath, parameters, listener);
	},
	checkOperationSupported:function(structureByKey)
	{
			return oFF.notNull(structureByKey) && structureByKey.getBooleanByKey(oFF.EpmPlanningVersionJsonConstants.K_IS_SUPPORTED);
	},
	commitActionSequences:function(planningModel, versions, actionSequenceId, syncType, actionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			if (a.isValid())
			{
				oFF.XCollectionUtils.forEach(versions, (v) => {
					v.setActionSequenceId(null);
				});
			}
			actionConsumer(a);
		});
		let resolvedPath = oFF.XString.replace(oFF.EpmPlanningVersionRestConstants.POST_COMMIT_ACTION_SEQUENCES, oFF.EpmPlanningVersionRestConstants.PARAMETER_MODEL_ID, oFF.EpmPlanningVersionRestAccessor.getModelSelector(planningModel));
		let parameters = oFF.PrFactory.createStructure();
		let versionIds = parameters.putNewList(oFF.EpmPlanningVersionJsonConstants.K_VERSION_IDS);
		oFF.XCollectionUtils.forEach(versions, (version) => {
			versionIds.addString(version.getVersionKey());
		});
		parameters.putString(oFF.EpmPlanningVersionJsonConstants.K_ACTION_SEQUENCE_ID, actionSequenceId);
		oFF.EpmPlanningVersionRestAccessor.executeAction(planningModel, syncType, oFF.HttpRequestMethod.HTTP_POST, resolvedPath, parameters, listener);
	},
	convertEpmConflictResolutionType:function(conflictResolutionType)
	{
			let resultString = null;
		if (conflictResolutionType === oFF.EpmConflictResolutionType.ABORT)
		{
			resultString = oFF.EpmPlanningVersionJsonConstants.V_CONFLICT_RESOLUTION_ABORT;
		}
		else if (conflictResolutionType === oFF.EpmConflictResolutionType.PRIVATE_WINS)
		{
			resultString = oFF.EpmPlanningVersionJsonConstants.V_CONFLICT_RESOLUTION_PRIVATE_WINS;
		}
		else if (conflictResolutionType === oFF.EpmConflictResolutionType.PUBLIC_WINS)
		{
			resultString = oFF.EpmPlanningVersionJsonConstants.V_CONFLICT_RESOLUTION_PUBLIC_WINS;
		}
		return resultString;
	},
	convertEpmJobType:function(jobExecutionType)
	{
			let resultString = null;
		if (jobExecutionType === oFF.EpmJobExecutionType.ALWAYS)
		{
			resultString = oFF.EpmPlanningVersionJsonConstants.V_JOB_EXECUTION_ALWAYS;
		}
		else if (jobExecutionType === oFF.EpmJobExecutionType.AUTO)
		{
			resultString = oFF.EpmPlanningVersionJsonConstants.V_JOB_EXECUTION_AUTO;
		}
		else if (jobExecutionType === oFF.EpmJobExecutionType.NEVER)
		{
			resultString = oFF.EpmPlanningVersionJsonConstants.V_JOB_EXECUTION_NEVER;
		}
		return resultString;
	},
	copyToPrivate:function(planningModel, evap, syncType, actionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			if (a.isValid())
			{
				actionConsumer(oFF.EpmPlanningVersionRestAccessor.getVersionFromPrElement(planningModel, b.getRootElementGeneric()), a);
			}
			else
			{
				actionConsumer(null, a);
			}
		});
		let resolvedPath = oFF.XString.replace(oFF.EpmPlanningVersionRestConstants.POST_COPY_TO_PRIVATE, oFF.EpmPlanningVersionRestConstants.PARAMETER_MODEL_ID, oFF.EpmPlanningVersionRestAccessor.getModelSelector(planningModel));
		let structure = oFF.PrFactory.createStructure();
		structure.putString(oFF.EpmPlanningVersionJsonConstants.K_SOURCE_VERSION_ID, evap.getSourceVersionId());
		structure.putString(oFF.EpmPlanningVersionJsonConstants.K_DESCRIPTION, evap.getDescription());
		structure.putString(oFF.EpmPlanningVersionJsonConstants.K_CATEGORY, evap.getCategory());
		if (evap.isExplicitEnforceLimit())
		{
			structure.putBoolean(oFF.EpmPlanningVersionJsonConstants.K_ENFORCE_LIMIT, evap.isEnforceLimit());
		}
		if (evap.isExplicitAddDefaultPlanningArea())
		{
			structure.putBoolean(oFF.EpmPlanningVersionJsonConstants.K_ADD_DEFAULT_PLANNING_AREA, evap.isAddDefaultPlanningArea());
		}
		oFF.EpmPlanningVersionRestAccessor.executeAction(planningModel, syncType, oFF.HttpRequestMethod.HTTP_POST, resolvedPath, structure, listener);
	},
	createEmptyVersion:function(planningModel, evap, syncType, actionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			if (a.isValid())
			{
				actionConsumer(oFF.EpmPlanningVersionRestAccessor.getVersionFromPrElement(planningModel, b.getRootElementGeneric()), a);
			}
			else
			{
				actionConsumer(null, a);
			}
		});
		let resolvedPath = oFF.XString.replace(oFF.EpmPlanningVersionRestConstants.POST_CREATE_EMPTY_VERSION, oFF.EpmPlanningVersionRestConstants.PARAMETER_MODEL_ID, oFF.EpmPlanningVersionRestAccessor.getModelSelector(planningModel));
		let structure = oFF.PrFactory.createStructure();
		structure.putBoolean(oFF.EpmPlanningVersionJsonConstants.K_IS_PUBLIC, evap.isPublic());
		structure.putString(oFF.EpmPlanningVersionJsonConstants.K_DESCRIPTION, evap.getDescription());
		structure.putString(oFF.EpmPlanningVersionJsonConstants.K_CATEGORY, evap.getCategory());
		oFF.EpmPlanningVersionRestAccessor.executeAction(planningModel, syncType, oFF.HttpRequestMethod.HTTP_POST, resolvedPath, structure, listener);
	},
	deleteVersion:function(planningModel, versionId, syncType, actionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			actionConsumer(a);
		});
		let resolvedPath = oFF.XString.replace(oFF.EpmPlanningVersionRestConstants.DELETE_VERSION, oFF.EpmPlanningVersionRestConstants.PARAMETER_MODEL_ID, oFF.EpmPlanningVersionRestAccessor.getModelSelector(planningModel));
		resolvedPath = oFF.XString.replace(resolvedPath, oFF.EpmPlanningVersionRestConstants.PARAMETER_VERSION_ID, versionId);
		oFF.EpmPlanningVersionRestAccessor.executeAction(planningModel, syncType, oFF.HttpRequestMethod.HTTP_DELETE, resolvedPath, null, listener);
	},
	discardActionSequences:function(planningModel, versions, syncType, actionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			if (a.isValid())
			{
				oFF.XCollectionUtils.forEach(versions, (v) => {
					v.setActionSequenceId(null);
				});
			}
			actionConsumer(a);
		});
		let resolvedPath = oFF.XString.replace(oFF.EpmPlanningVersionRestConstants.POST_DISCARD_ACTION_SEQUENCES, oFF.EpmPlanningVersionRestConstants.PARAMETER_MODEL_ID, oFF.EpmPlanningVersionRestAccessor.getModelSelector(planningModel));
		let parameters = oFF.PrFactory.createStructure();
		let versionIds = parameters.putNewList(oFF.EpmPlanningVersionJsonConstants.K_VERSION_IDS);
		oFF.XCollectionUtils.forEach(versions, (version) => {
			versionIds.addString(version.getVersionKey());
		});
		oFF.EpmPlanningVersionRestAccessor.executeAction(planningModel, syncType, oFF.HttpRequestMethod.HTTP_POST, resolvedPath, parameters, listener);
	},
	discardPublicVersionEdit:function(planningModel, evap, syncType, actionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			if (a.isValid())
			{
				actionConsumer(oFF.EpmPlanningVersionRestAccessor.getVersionFromPrElement(planningModel, b.getRootElementGeneric()), a);
			}
			else
			{
				actionConsumer(null, a);
			}
		});
		let resolvedPath = oFF.XString.replace(oFF.EpmPlanningVersionRestConstants.POST_DISCARD_PUBLIC_VERSION_EDIT, oFF.EpmPlanningVersionRestConstants.PARAMETER_MODEL_ID, oFF.EpmPlanningVersionRestAccessor.getModelSelector(planningModel));
		let structure = oFF.PrFactory.createStructure();
		structure.putString(oFF.EpmPlanningVersionJsonConstants.K_VERSION_ID, evap.getVersionId());
		oFF.EpmPlanningVersionRestAccessor.executeAction(planningModel, syncType, oFF.HttpRequestMethod.HTTP_POST, resolvedPath, structure, listener);
	},
	executeAction:function(planningModel, syncType, requestMethod, requestPath, parameterStructure, listener)
	{
			let connection = oFF.EpmPlanningVersionRestAccessor.getConnection(planningModel);
		let rpcFunction = connection.newRpcFunction(requestPath);
		let request = rpcFunction.getRpcRequest();
		request.setRequestStructure(parameterStructure);
		request.setMethod(requestMethod);
		rpcFunction.processFunctionExecution(syncType, listener, null);
	},
	getActionSequenceListFromPrElement:function(rootElementGeneric)
	{
			let prList = null;
		if (rootElementGeneric.isStructure())
		{
			prList = rootElementGeneric.asStructure().getListByKey(oFF.EpmPlanningVersionJsonConstants.K_ACTION_SEQUENCES);
		}
		else if (rootElementGeneric.isList())
		{
			prList = rootElementGeneric.asList();
		}
		return oFF.XStream.of(prList).map((prElement) => {
			return oFF.EpmPlanningVersionRestAccessor.getPlanningVersionActionSequence(prElement.asStructure());
		}).collect(oFF.XStreamCollector.toList());
	},
	getActionSequencesForPlanningModel:function(planningModel, syncType, actionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			let result = null;
			if (a.isValid())
			{
				result = oFF.EpmPlanningVersionRestAccessor.getActionSequenceListFromPrElement(b.getRootElement());
			}
			actionConsumer(result, a);
		});
		let resolvedPath = oFF.XString.replace(oFF.EpmPlanningVersionRestConstants.GET_ACTION_SEQUENCES, oFF.EpmPlanningVersionRestConstants.PARAMETER_MODEL_ID, oFF.EpmPlanningVersionRestAccessor.getModelSelector(planningModel));
		oFF.EpmPlanningVersionRestAccessor.executeAction(planningModel, syncType, oFF.HttpRequestMethod.HTTP_GET, resolvedPath, null, listener);
	},
	getActionSequencesForPlanningVersion:function(planningModel, versionKey, syncType, actionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			let result = null;
			if (a.isValid())
			{
				result = oFF.EpmPlanningVersionRestAccessor.getActionSequenceListFromPrElement(b.getRootElement());
			}
			actionConsumer(result, a);
		});
		let resolvedPath = oFF.XString.replace(oFF.EpmPlanningVersionRestConstants.GET_ACTION_SEQUENCES_FOR_VERSION, oFF.EpmPlanningVersionRestConstants.PARAMETER_MODEL_ID, oFF.EpmPlanningVersionRestAccessor.getModelSelector(planningModel));
		resolvedPath = oFF.XString.replace(resolvedPath, oFF.EpmPlanningVersionRestConstants.PARAMETER_VERSION_ID, versionKey);
		oFF.EpmPlanningVersionRestAccessor.executeAction(planningModel, syncType, oFF.HttpRequestMethod.HTTP_GET, resolvedPath, null, listener);
	},
	getConnection:function(planningModel)
	{
			let queryManager = planningModel.getQueryManager();
		let connectionPool = queryManager.getApplication().getConnectionPool();
		return connectionPool.getConnection(queryManager.getSystemName());
	},
	getModelSelector:function(planningModel)
	{
			let epmObject = planningModel.getQueryManager().getQueryModel().getDatasetEpmObject();
		return oFF.XHttpUtils.encodeURIComponent(oFF.XStringUtils.concatenate3(epmObject.getPackageName(), ":", epmObject.getName()));
	},
	getPlanningStep:function(structureElement)
	{
			let stepType = oFF.EpmPlanningVersionRestAccessor.lookupActionStep(structureElement.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_ACTION));
		let description = structureElement.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_DESCRIPTION);
		let user = structureElement.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_USER);
		let userDisplayName = structureElement.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_USER_DISPLAY_NAME);
		return oFF.PlanningStep.create(stepType, description, user, userDisplayName);
	},
	getPlanningVersionActionSequence:function(structureElement)
	{
			let id = structureElement.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_VERSION_ID);
		let description = structureElement.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_DESCRIPTION);
		let startTime = oFF.XDateTime.createDateTimeSafe(structureElement.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_START_TIME));
		let runningSequence = oFF.EpmPlanningVersionRestAccessor.getPlanningStep(structureElement.getStructureByKey(oFF.EpmPlanningVersionJsonConstants.K_RUNNING_SEQUENCE));
		let runningAction = oFF.EpmPlanningVersionRestAccessor.getPlanningStep(structureElement.getStructureByKey(oFF.EpmPlanningVersionJsonConstants.K_RUNNING_ACTION));
		return oFF.PlanningVersionActionSequence.create(id, description, startTime, runningSequence, runningAction);
	},
	getUndoRedoStates:function(planningModel, versionKey, syncType, actionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			if (a.isValid())
			{
				actionConsumer(oFF.EpmPlanningVersionRestAccessor.getVersionStateListFromPrElement(b.getRootElementGeneric()), a);
			}
			else
			{
				actionConsumer(null, a);
			}
		});
		let resolvedPath = oFF.XString.replace(oFF.EpmPlanningVersionRestConstants.GET_VERSION_UNDO_REDO_STATES, oFF.EpmPlanningVersionRestConstants.PARAMETER_MODEL_ID, oFF.EpmPlanningVersionRestAccessor.getModelSelector(planningModel));
		resolvedPath = oFF.XString.replace(resolvedPath, oFF.EpmPlanningVersionRestConstants.PARAMETER_VERSION_ID, versionKey);
		oFF.EpmPlanningVersionRestAccessor.executeAction(planningModel, syncType, oFF.HttpRequestMethod.HTTP_GET, resolvedPath, null, listener);
	},
	getVersionDetails:function(planningModel, versionId, syncType, actionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			if (a.isValid())
			{
				actionConsumer(oFF.EpmPlanningVersionRestAccessor.getVersionFromPrElement(planningModel, b.getRootElementGeneric()), a);
			}
			else
			{
				actionConsumer(null, a);
			}
		});
		let resolvedPath = oFF.XString.replace(oFF.EpmPlanningVersionRestConstants.GET_VERSION_DETAILS, oFF.EpmPlanningVersionRestConstants.PARAMETER_MODEL_ID, oFF.EpmPlanningVersionRestAccessor.getModelSelector(planningModel));
		resolvedPath = oFF.XString.replace(resolvedPath, oFF.EpmPlanningVersionRestConstants.PARAMETER_VERSION_ID, versionId);
		oFF.EpmPlanningVersionRestAccessor.executeAction(planningModel, syncType, oFF.HttpRequestMethod.HTTP_GET, resolvedPath, null, listener);
	},
	getVersionFromPrElement:function(planningModel, prElement)
	{
			let prStructure = null;
		if (prElement.isStructure())
		{
			prStructure = prElement.asStructure();
		}
		else if (prElement.isList())
		{
			prStructure = prElement.asList().getStructureAt(0);
		}
		let planningVersion = null;
		if (oFF.notNull(prStructure))
		{
			let versionKey = prStructure.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_ID);
			let isShared = prStructure.getBooleanByKey(oFF.EpmPlanningVersionJsonConstants.K_IS_SHARED);
			let owner = prStructure.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_OWNER);
			let planningVersionIdentifier = planningModel.getVersionIdentifier2(versionKey, isShared, owner);
			let description = prStructure.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_DESCRIPTION);
			planningVersion = planningModel.getVersionById(planningVersionIdentifier, description);
			planningVersion.setShowingAsPublicVersion(prStructure.getBooleanByKey(oFF.EpmPlanningVersionJsonConstants.K_IS_PUBLIC));
			planningVersion.setInPublicEditMode(prStructure.getBooleanByKey(oFF.EpmPlanningVersionJsonConstants.K_IS_IN_PUBLIC_EDIT_MODE));
			planningVersion.setWorkflowState(oFF.EpmWorkflowState.lookup(prStructure.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_WORKFLOW_STATE)));
			planningVersion.setWriteBackEnabled(prStructure.getBooleanByKey(oFF.EpmPlanningVersionJsonConstants.K_IS_WRITEBACK_ENABLED));
			planningVersion.setDacWriteEnabled(prStructure.getBooleanByKey(oFF.EpmPlanningVersionJsonConstants.K_IS_DAC_WRITE_ENABLED));
			planningVersion.setHasExternalStorage(prStructure.getBooleanByKey(oFF.EpmPlanningVersionJsonConstants.K_HAS_EXTERNAL_STORAGE));
			planningVersion.setOwnerDisplayName(prStructure.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_OWNER_DISPLAY_NAME));
			planningVersion.setCategory(prStructure.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_CATEGORY));
			planningVersion.setSourceVersionName(prStructure.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_SOURCE_VERSION_ID));
			planningVersion.setCreationTime(oFF.XDateTime.createDateTimeSafe(prStructure.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_CREATION_TIME)));
			let operations = prStructure.getStructureByKey(oFF.EpmPlanningVersionJsonConstants.K_OPERATIONS);
			let planningVersionAccess = oFF.PlanningVersionAccess.create();
			planningVersionAccess.setSupportsPlanning(oFF.EpmPlanningVersionRestAccessor.checkOperationSupported(operations.getStructureByKey(oFF.EpmPlanningVersionJsonConstants.K_OPERATIONS_COPYING)));
			planningVersionAccess.setSupportsPlanning(oFF.EpmPlanningVersionRestAccessor.checkOperationSupported(operations.getStructureByKey(oFF.EpmPlanningVersionJsonConstants.K_OPERATIONS_PLANNING)));
			planningVersionAccess.setSupportsUndoingRedoing(oFF.EpmPlanningVersionRestAccessor.checkOperationSupported(operations.getStructureByKey(oFF.EpmPlanningVersionJsonConstants.K_OPERATIONS_UNDOING_REDOING)));
			planningVersionAccess.setSupportsPublishingFrom(oFF.EpmPlanningVersionRestAccessor.checkOperationSupported(operations.getStructureByKey(oFF.EpmPlanningVersionJsonConstants.K_OPERATIONS_PUBLISHING_FROM)));
			planningVersionAccess.setSupportsPublishingTo(oFF.EpmPlanningVersionRestAccessor.checkOperationSupported(operations.getStructureByKey(oFF.EpmPlanningVersionJsonConstants.K_OPERATIONS_PUBLISHING_TO)));
			planningVersionAccess.setSupportsSharing(oFF.EpmPlanningVersionRestAccessor.checkOperationSupported(operations.getStructureByKey(oFF.EpmPlanningVersionJsonConstants.K_OPERATIONS_SHARING)));
			planningVersionAccess.setSupportsDeleting(oFF.EpmPlanningVersionRestAccessor.checkOperationSupported(operations.getStructureByKey(oFF.EpmPlanningVersionJsonConstants.K_OPERATIONS_DELETING)));
			planningVersionAccess.setSupportsReading(oFF.EpmPlanningVersionRestAccessor.checkOperationSupported(operations.getStructureByKey(oFF.EpmPlanningVersionJsonConstants.K_OPERATIONS_READING)));
			planningVersionAccess.setSupportsStartingPublicEdit(oFF.EpmPlanningVersionRestAccessor.checkOperationSupported(operations.getStructureByKey(oFF.EpmPlanningVersionJsonConstants.K_OPERATIONS_STARTING_PUBLIC_EDIT)));
			planningVersionAccess.setSupportsSavingPublicEdit(oFF.EpmPlanningVersionRestAccessor.checkOperationSupported(operations.getStructureByKey(oFF.EpmPlanningVersionJsonConstants.K_OPERATIONS_SAVING_PUBLIC_EDIT)));
			planningVersion.setHasPlanningArea(prStructure.getBooleanByKey(oFF.EpmPlanningVersionJsonConstants.K_HAS_PLANNING_AREA));
		}
		return planningVersion;
	},
	getVersionListFromPrElement:function(planningModel, rootElementGeneric)
	{
			let prList = null;
		if (rootElementGeneric.isStructure())
		{
			prList = rootElementGeneric.asStructure().getListByKey(oFF.EpmPlanningVersionJsonConstants.K_VERSIONS);
		}
		else if (rootElementGeneric.isList())
		{
			prList = rootElementGeneric.asList();
		}
		return oFF.XStream.of(prList).map((prElement) => {
			return oFF.EpmPlanningVersionRestAccessor.getVersionFromPrElement(planningModel, prElement);
		}).collect(oFF.XStreamCollector.toList());
	},
	getVersionStateFromPrElement:function(prElement)
	{
			let prStructure = null;
		if (prElement.isStructure())
		{
			prStructure = prElement.asStructure();
		}
		else if (prElement.isList())
		{
			prStructure = prElement.asList().getStructureAt(0);
		}
		let pvsd = null;
		if (oFF.notNull(prStructure))
		{
			let stateKey = prStructure.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_ID);
			let user = prStructure.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_USER);
			let startTime = oFF.XDateTime.createDateTimeSafe(prStructure.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_START_TIME));
			let endTime = oFF.XDateTime.createDateTimeSafe(prStructure.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_END_TIME));
			let description = prStructure.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_DESCRIPTION);
			pvsd = oFF.PlanningVersionStateDescription.create(stateKey, description, user, startTime, endTime, -1);
			pvsd.setUserDisplayName(prStructure.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_USER_DISPLAY_NAME));
			pvsd.setCurrent(prStructure.getBooleanByKey(oFF.EpmPlanningVersionJsonConstants.K_IS_CURRENT));
			pvsd.setNavigatable(prStructure.getBooleanByKey(oFF.EpmPlanningVersionJsonConstants.K_NAVIGATABLE));
			pvsd.setActionStep(oFF.EpmPlanningVersionRestAccessor.lookupActionStep(prStructure.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_ACTION)));
		}
		return pvsd;
	},
	getVersionStateListFromPrElement:function(rootElementGeneric)
	{
			let prList = null;
		if (rootElementGeneric.isStructure())
		{
			prList = rootElementGeneric.asStructure().getListByKey(oFF.EpmPlanningVersionJsonConstants.K_UNDO_STATES);
		}
		else if (rootElementGeneric.isList())
		{
			prList = rootElementGeneric.asList();
		}
		return oFF.XStream.of(prList).map((prElement) => {
			return oFF.EpmPlanningVersionRestAccessor.getVersionStateFromPrElement(prElement);
		}).collect(oFF.XStreamCollector.toList());
	},
	getVersions:function(planningModel, syncType, actionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			if (a.isValid())
			{
				actionConsumer(oFF.EpmPlanningVersionRestAccessor.getVersionListFromPrElement(planningModel, b.getRootElementGeneric()), a);
			}
			else
			{
				actionConsumer(null, a);
			}
		});
		let resolvedPath = oFF.XString.replace(oFF.EpmPlanningVersionRestConstants.GET_LIST_VERSIONS, oFF.EpmPlanningVersionRestConstants.PARAMETER_MODEL_ID, oFF.EpmPlanningVersionRestAccessor.getModelSelector(planningModel));
		oFF.EpmPlanningVersionRestAccessor.executeAction(planningModel, syncType, oFF.HttpRequestMethod.HTTP_GET, resolvedPath, null, listener);
	},
	gotoUndoRedoState:function(planningModel, versionKey, stateKey, syncType, actionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			actionConsumer(a);
		});
		let resolvedPath = oFF.XString.replace(oFF.EpmPlanningVersionRestConstants.POST_VERSION_GOTO_STATE, oFF.EpmPlanningVersionRestConstants.PARAMETER_MODEL_ID, oFF.EpmPlanningVersionRestAccessor.getModelSelector(planningModel));
		let parameters = oFF.PrFactory.createStructure();
		parameters.putString(oFF.EpmPlanningVersionJsonConstants.K_VERSION_ID, versionKey);
		parameters.putString(oFF.EpmPlanningVersionJsonConstants.K_STATE_ID, stateKey);
		oFF.EpmPlanningVersionRestAccessor.executeAction(planningModel, syncType, oFF.HttpRequestMethod.HTTP_POST, resolvedPath, parameters, listener);
	},
	lookupActionStep:function(key)
	{
			let result = oFF.PlanningStepType.DEFAULT;
		if (oFF.XString.isEqual(key, oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_ADVANCED_SPREADING))
		{
			result = oFF.PlanningStepType.ADVANCED_SPREADING;
		}
		else if (oFF.XString.isEqual(key, oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_ALLOCATION))
		{
			result = oFF.PlanningStepType.ALLOCATION;
		}
		else if (oFF.XString.isEqual(key, oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_COPY_TO_PRIVATE_EMPTY_VERSION))
		{
			result = oFF.PlanningStepType.COPY_TO_PRIVATE_EMPTY_VERSION;
		}
		else if (oFF.XString.isEqual(key, oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_COPY_TO_PRIVATE_VERSION))
		{
			result = oFF.PlanningStepType.COPY_TO_PRIVATE_VERSION;
		}
		else if (oFF.XString.isEqual(key, oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_COPYPASTE))
		{
			result = oFF.PlanningStepType.COPYPASTE;
		}
		else if (oFF.XString.isEqual(key, oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_DATA_ENTRY))
		{
			result = oFF.PlanningStepType.DATA_ENTRY;
		}
		else if (oFF.XString.isEqual(key, oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_DEFAULT))
		{
			result = oFF.PlanningStepType.DEFAULT;
		}
		else if (oFF.XString.isEqual(key, oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_DELETE_FACT))
		{
			result = oFF.PlanningStepType.DELETE_FACT;
		}
		else if (oFF.XString.isEqual(key, oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_DISTRIBUTION))
		{
			result = oFF.PlanningStepType.DISTRIBUTION;
		}
		else if (oFF.XString.isEqual(key, oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_MASS_DATA_ENTRY))
		{
			result = oFF.PlanningStepType.MASS_DATA_ENTRY;
		}
		else if (oFF.XString.isEqual(key, oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_PLANNINGSEQUENCE_EXECUTION))
		{
			result = oFF.PlanningStepType.PLANNINGSEQUENCE_EXECUTION;
		}
		else if (oFF.XString.isEqual(key, oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_SPREADING))
		{
			result = oFF.PlanningStepType.SPREADING;
		}
		else if (oFF.XString.isEqual(key, oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_START_PUBLIC_EDIT))
		{
			result = oFF.PlanningStepType.START_PUBLIC_EDIT;
		}
		else if (oFF.XString.isEqual(key, oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_VDT_SIMULATION))
		{
			result = oFF.PlanningStepType.VDT_SIMULATION;
		}
		else if (oFF.XString.isEqual(key, oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_DATA_ACTION_DEBUGGING))
		{
			result = oFF.PlanningStepType.DATA_ACTION_DEBUGGING;
		}
		return result;
	},
	lookupActionStepString:function(stepType)
	{
			let result = oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_DEFAULT;
		if (stepType === oFF.PlanningStepType.ADVANCED_SPREADING)
		{
			result = oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_DEFAULT;
		}
		else if (stepType === oFF.PlanningStepType.ALLOCATION)
		{
			result = oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_ALLOCATION;
		}
		else if (stepType === oFF.PlanningStepType.COPY_TO_PRIVATE_EMPTY_VERSION)
		{
			result = oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_COPY_TO_PRIVATE_EMPTY_VERSION;
		}
		else if (stepType === oFF.PlanningStepType.COPY_TO_PRIVATE_VERSION)
		{
			result = oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_COPY_TO_PRIVATE_VERSION;
		}
		else if (stepType === oFF.PlanningStepType.COPYPASTE)
		{
			result = oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_COPYPASTE;
		}
		else if (stepType === oFF.PlanningStepType.DATA_ENTRY)
		{
			result = oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_DATA_ENTRY;
		}
		else if (stepType === oFF.PlanningStepType.DEFAULT)
		{
			result = oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_DEFAULT;
		}
		else if (stepType === oFF.PlanningStepType.DELETE_FACT)
		{
			result = oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_DELETE_FACT;
		}
		else if (stepType === oFF.PlanningStepType.DISTRIBUTION)
		{
			result = oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_DISTRIBUTION;
		}
		else if (stepType === oFF.PlanningStepType.MASS_DATA_ENTRY)
		{
			result = oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_MASS_DATA_ENTRY;
		}
		else if (stepType === oFF.PlanningStepType.PLANNINGSEQUENCE_EXECUTION)
		{
			result = oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_PLANNINGSEQUENCE_EXECUTION;
		}
		else if (stepType === oFF.PlanningStepType.SPREADING)
		{
			result = oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_SPREADING;
		}
		else if (stepType === oFF.PlanningStepType.START_PUBLIC_EDIT)
		{
			result = oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_START_PUBLIC_EDIT;
		}
		else if (stepType === oFF.PlanningStepType.VDT_SIMULATION)
		{
			result = oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_VDT_SIMULATION;
		}
		else if (stepType === oFF.PlanningStepType.DATA_ACTION_DEBUGGING)
		{
			result = oFF.EpmPlanningVersionJsonConstants.V_PLANNING_STEP_DATA_ACTION_DEBUGGING;
		}
		return result;
	},
	navigateUndoRedoState:function(planningModel, versionKey, offset, syncType, actionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			actionConsumer(a);
		});
		let resolvedPath = oFF.XString.replace(oFF.EpmPlanningVersionRestConstants.POST_VERSION_NAVIGATE_STATE, oFF.EpmPlanningVersionRestConstants.PARAMETER_MODEL_ID, oFF.EpmPlanningVersionRestAccessor.getModelSelector(planningModel));
		let parameters = oFF.PrFactory.createStructure();
		parameters.putString(oFF.EpmPlanningVersionJsonConstants.K_VERSION_ID, versionKey);
		parameters.putInteger(oFF.EpmPlanningVersionJsonConstants.K_STEPS, offset);
		oFF.EpmPlanningVersionRestAccessor.executeAction(planningModel, syncType, oFF.HttpRequestMethod.HTTP_POST, resolvedPath, parameters, listener);
	},
	publishToExistingVersion:function(planningModel, evap, syncType, actionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			actionConsumer(a);
		});
		let resolvedPath = oFF.XString.replace(oFF.EpmPlanningVersionRestConstants.POST_PUBLISH_TO_EXISTING, oFF.EpmPlanningVersionRestConstants.PARAMETER_MODEL_ID, oFF.EpmPlanningVersionRestAccessor.getModelSelector(planningModel));
		let structure = oFF.PrFactory.createStructure();
		structure.putString(oFF.EpmPlanningVersionJsonConstants.K_SOURCE_VERSION_ID, evap.getSourceVersionId());
		structure.putString(oFF.EpmPlanningVersionJsonConstants.K_TARGET_VERSION_ID, evap.getTargetVersionId());
		if (evap.isExplicitFilterOutReadOnlyFacts())
		{
			structure.putBoolean(oFF.EpmPlanningVersionJsonConstants.K_FILTER_OUT_READ_ONLY_FACTS, evap.isFilterOutReadOnlyFacts());
		}
		if (evap.isExplicitFilterOutUnchangedFacts())
		{
			structure.putBoolean(oFF.EpmPlanningVersionJsonConstants.K_FILTER_OUT_UNCHANGED_FACTS, evap.isFilterOutUnchangedFacts());
		}
		if (evap.isExplicitFilterOutManyUnchangedFacts())
		{
			structure.putBoolean(oFF.EpmPlanningVersionJsonConstants.K_FILTER_OUT_MANY_UNCHANGED_FACTS, evap.isFilterOutManyUnchangedFacts());
		}
		structure.putStringNotNullAndNotEmpty(oFF.EpmPlanningVersionJsonConstants.K_CONFLICT_RESOLUTION, oFF.EpmPlanningVersionRestAccessor.convertEpmConflictResolutionType(evap.getConflictResolutionType()));
		structure.putStringNotNullAndNotEmpty(oFF.EpmPlanningVersionJsonConstants.K_RUN_IN_JOB, oFF.EpmPlanningVersionRestAccessor.convertEpmJobType(evap.getJobExecutionType()));
		oFF.EpmPlanningVersionRestAccessor.executeAction(planningModel, syncType, oFF.HttpRequestMethod.HTTP_POST, resolvedPath, structure, listener);
	},
	publishToNewVersion:function(planningModel, evap, syncType, actionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			if (a.isValid())
			{
				actionConsumer(oFF.EpmPlanningVersionRestAccessor.getVersionFromPrElement(planningModel, b.getRootElementGeneric()), a);
			}
			else
			{
				actionConsumer(null, a);
			}
		});
		let resolvedPath = oFF.XString.replace(oFF.EpmPlanningVersionRestConstants.POST_PUBLISH_TO_NEW_VERSION, oFF.EpmPlanningVersionRestConstants.PARAMETER_MODEL_ID, oFF.EpmPlanningVersionRestAccessor.getModelSelector(planningModel));
		let structure = oFF.PrFactory.createStructure();
		structure.putString(oFF.EpmPlanningVersionJsonConstants.K_SOURCE_VERSION_ID, evap.getSourceVersionId());
		structure.putString(oFF.EpmPlanningVersionJsonConstants.K_DESCRIPTION, evap.getDescription());
		structure.putString(oFF.EpmPlanningVersionJsonConstants.K_CATEGORY, evap.getCategory());
		if (evap.isExplicitFilterOutReadOnlyFacts())
		{
			structure.putBoolean(oFF.EpmPlanningVersionJsonConstants.K_FILTER_OUT_READ_ONLY_FACTS, evap.isFilterOutReadOnlyFacts());
		}
		structure.putStringNotNullAndNotEmpty(oFF.EpmPlanningVersionJsonConstants.K_RUN_IN_JOB, oFF.EpmPlanningVersionRestAccessor.convertEpmJobType(evap.getJobExecutionType()));
		oFF.EpmPlanningVersionRestAccessor.executeAction(planningModel, syncType, oFF.HttpRequestMethod.HTTP_POST, resolvedPath, structure, listener);
	},
	restoreFromSuspension:function(planningModel, versionKey, syncType, actionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			actionConsumer(a);
		});
		let resolvedPath = oFF.XString.replace(oFF.EpmPlanningVersionRestConstants.POST_RESTORE_FROM_SUSPENSION, oFF.EpmPlanningVersionRestConstants.PARAMETER_MODEL_ID, oFF.EpmPlanningVersionRestAccessor.getModelSelector(planningModel));
		let parameters = oFF.PrFactory.createStructure();
		parameters.putString(oFF.EpmPlanningVersionJsonConstants.K_VERSION_ID, versionKey);
		oFF.EpmPlanningVersionRestAccessor.executeAction(planningModel, syncType, oFF.HttpRequestMethod.HTTP_POST, resolvedPath, parameters, listener);
	},
	savePublicVersionEdit:function(planningModel, evap, syncType, actionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			if (a.isValid())
			{
				actionConsumer(oFF.EpmPlanningVersionRestAccessor.getVersionFromPrElement(planningModel, b.getRootElementGeneric()), a);
			}
			else
			{
				actionConsumer(null, a);
			}
		});
		let resolvedPath = oFF.XString.replace(oFF.EpmPlanningVersionRestConstants.POST_SAVE_PUBLIC_VERSION_EDIT, oFF.EpmPlanningVersionRestConstants.PARAMETER_MODEL_ID, oFF.EpmPlanningVersionRestAccessor.getModelSelector(planningModel));
		let structure = oFF.PrFactory.createStructure();
		structure.putString(oFF.EpmPlanningVersionJsonConstants.K_VERSION_ID, evap.getVersionId());
		if (evap.isExplicitFilterOutReadOnlyFacts())
		{
			structure.putBoolean(oFF.EpmPlanningVersionJsonConstants.K_FILTER_OUT_READ_ONLY_FACTS, evap.isFilterOutReadOnlyFacts());
		}
		if (evap.isExplicitFilterOutManyUnchangedFacts())
		{
			structure.putBoolean(oFF.EpmPlanningVersionJsonConstants.K_FILTER_OUT_MANY_UNCHANGED_FACTS, evap.isFilterOutManyUnchangedFacts());
		}
		structure.putStringNotNullAndNotEmpty(oFF.EpmPlanningVersionJsonConstants.K_CONFLICT_RESOLUTION, oFF.EpmPlanningVersionRestAccessor.convertEpmConflictResolutionType(evap.getConflictResolutionType()));
		structure.putStringNotNullAndNotEmpty(oFF.EpmPlanningVersionJsonConstants.K_RUN_IN_JOB, oFF.EpmPlanningVersionRestAccessor.convertEpmJobType(evap.getJobExecutionType()));
		oFF.EpmPlanningVersionRestAccessor.executeAction(planningModel, syncType, oFF.HttpRequestMethod.HTTP_POST, resolvedPath, structure, listener);
	},
	startActionSequence:function(planningModel, versionSteps, syncType, actionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			if (a.isValid())
			{
				let rootElement = b.getRootElement();
				let actionSequenceId = rootElement.getStringByKey(oFF.EpmPlanningVersionJsonConstants.K_ACTION_SEQUENCE_ID);
				if (oFF.XStringUtils.isNotNullAndNotEmpty(actionSequenceId))
				{
					oFF.XCollectionUtils.forEach(versionSteps, (vs) => {
						vs.getFirstObject().setActionSequenceId(actionSequenceId);
					});
				}
			}
			actionConsumer(a);
		});
		let resolvedPath = oFF.XString.replace(oFF.EpmPlanningVersionRestConstants.POST_START_ACTION_SEQUENCES, oFF.EpmPlanningVersionRestConstants.PARAMETER_MODEL_ID, oFF.EpmPlanningVersionRestAccessor.getModelSelector(planningModel));
		let parameters = oFF.PrFactory.createStructure();
		let parameterList = parameters.putNewList(oFF.EpmPlanningVersionJsonConstants.K_START_REQUESTS);
		oFF.XCollectionUtils.forEach(versionSteps, (versionStep) => {
			let subStructure = parameterList.addNewStructure();
			subStructure.putString(oFF.EpmPlanningVersionJsonConstants.K_VERSION_ID, versionStep.getFirstObject().getVersionKey());
			subStructure.putString(oFF.EpmPlanningVersionJsonConstants.K_ACTION, oFF.EpmPlanningVersionRestAccessor.lookupActionStepString(versionStep.getSecondObject()));
		});
		oFF.EpmPlanningVersionRestAccessor.executeAction(planningModel, syncType, oFF.HttpRequestMethod.HTTP_POST, resolvedPath, parameters, listener);
	},
	startPublicVersionEdit:function(planningModel, evap, syncType, actionConsumer)
	{
			let listener = oFF.LambdaRpcFunctionExecutionListener.create((a, b, c) => {
			if (a.isValid())
			{
				actionConsumer(oFF.EpmPlanningVersionRestAccessor.getVersionFromPrElement(planningModel, b.getRootElementGeneric()), a);
			}
			else
			{
				actionConsumer(null, a);
			}
		});
		let resolvedPath = oFF.XString.replace(oFF.EpmPlanningVersionRestConstants.POST_START_PUBLIC_VERSION_EDIT, oFF.EpmPlanningVersionRestConstants.PARAMETER_MODEL_ID, oFF.EpmPlanningVersionRestAccessor.getModelSelector(planningModel));
		let structure = oFF.PrFactory.createStructure();
		structure.putString(oFF.EpmPlanningVersionJsonConstants.K_VERSION_ID, evap.getVersionId());
		if (evap.isExplicitEnforceLimit())
		{
			structure.putBoolean(oFF.EpmPlanningVersionJsonConstants.K_ENFORCE_LIMIT, evap.isEnforceLimit());
		}
		if (evap.isExplicitAddDefaultPlanningArea())
		{
			structure.putBoolean(oFF.EpmPlanningVersionJsonConstants.K_ADD_DEFAULT_PLANNING_AREA, evap.isAddDefaultPlanningArea());
		}
		oFF.EpmPlanningVersionRestAccessor.executeAction(planningModel, syncType, oFF.HttpRequestMethod.HTTP_POST, resolvedPath, structure, listener);
	}
};

oFF.PlanningFunctionMetadata = function() {};
oFF.PlanningFunctionMetadata.prototype = new oFF.PlanningOperationMetadata();
oFF.PlanningFunctionMetadata.prototype._ff_c = "PlanningFunctionMetadata";

oFF.PlanningFunctionMetadata.prototype.m_baseDatasource = null;
oFF.PlanningFunctionMetadata.prototype.getBaseDataSource = function()
{
	return this.m_baseDatasource;
};
oFF.PlanningFunctionMetadata.prototype.getPlanningFunctionIdentifier = function()
{
	return this.getPlanningOperationIdentifier();
};
oFF.PlanningFunctionMetadata.prototype.setBaseDataSource = function(baseDataSource)
{
	this.m_baseDatasource = baseDataSource;
};

oFF.PlanningSequenceMetadata = function() {};
oFF.PlanningSequenceMetadata.prototype = new oFF.PlanningOperationMetadata();
oFF.PlanningSequenceMetadata.prototype._ff_c = "PlanningSequenceMetadata";

oFF.PlanningSequenceMetadata.prototype.m_stepMetadataList = null;
oFF.PlanningSequenceMetadata.prototype.getPlanningSequenceIdentifier = function()
{
	return this.getPlanningOperationIdentifier();
};
oFF.PlanningSequenceMetadata.prototype.getStepMetadataList = function()
{
	return this.m_stepMetadataList;
};
oFF.PlanningSequenceMetadata.prototype.setStepMetadataList = function(stepMetadataList)
{
	this.m_stepMetadataList = stepMetadataList;
};

oFF.PlanningVersionPrivilege = function() {};
oFF.PlanningVersionPrivilege.prototype = new oFF.XObject();
oFF.PlanningVersionPrivilege.prototype._ff_c = "PlanningVersionPrivilege";

oFF.PlanningVersionPrivilege.create = function(planningModel, queryDataSource, versionIdentifier, privilege, grantee)
{
	let result = new oFF.PlanningVersionPrivilege();
	result.setupExt(planningModel, queryDataSource, versionIdentifier, privilege, grantee);
	return result;
};
oFF.PlanningVersionPrivilege.createQualifiedName = function(planningModel, queryDataSource, versionIdentifier, privilege, grantee)
{
	oFF.XObjectExt.assertNotNullExt(planningModel, "planning model null");
	let sb = oFF.XStringBuffer.create();
	sb.append("model:[").append(planningModel.getPlanningModelSchema()).append("]");
	sb.append("[").append(planningModel.getPlanningModelName()).append("]");
	oFF.XObjectExt.assertNotNullExt(queryDataSource, "query data source null");
	if (queryDataSource.getType() !== oFF.MetaObjectType.PLANNING)
	{
		throw oFF.XException.createIllegalArgumentException("illegal query data source object type");
	}
	sb.append("datasource:[").append(queryDataSource.getSchemaName()).append("]");
	sb.append("[").append(queryDataSource.getPackageName()).append("]");
	sb.append("[").append(queryDataSource.getObjectName()).append("]");
	sb.append("version:[").append(versionIdentifier.getVersionUniqueName()).append("]");
	oFF.XObjectExt.assertNotNullExt(privilege, "planning privilege null");
	sb.append("privilege:[").append(privilege.getName()).append("]");
	oFF.XStringUtils.checkStringNotEmpty(grantee, "Grantee null");
	sb.append("grantee:[").append(grantee).append("]");
	return sb.toString();
};
oFF.PlanningVersionPrivilege.prototype.m_clientState = null;
oFF.PlanningVersionPrivilege.prototype.m_grantee = null;
oFF.PlanningVersionPrivilege.prototype.m_planningModel = null;
oFF.PlanningVersionPrivilege.prototype.m_privilege = null;
oFF.PlanningVersionPrivilege.prototype.m_qualifiedName = null;
oFF.PlanningVersionPrivilege.prototype.m_queryDataSource = null;
oFF.PlanningVersionPrivilege.prototype.m_serverState = null;
oFF.PlanningVersionPrivilege.prototype.m_versionIdentifier = null;
oFF.PlanningVersionPrivilege.prototype.doGrant = function()
{
	if (this.m_serverState === oFF.PlanningPrivilegeState.GRANTED)
	{
		this.m_clientState = oFF.PlanningPrivilegeState.GRANTED;
	}
	else
	{
		this.m_clientState = oFF.PlanningPrivilegeState.TO_BE_GRANTED;
	}
};
oFF.PlanningVersionPrivilege.prototype.doRevoke = function()
{
	if (this.m_serverState === oFF.PlanningPrivilegeState.NEW)
	{
		this.m_clientState = oFF.PlanningPrivilegeState.NEW;
	}
	else
	{
		this.m_clientState = oFF.PlanningPrivilegeState.TO_BE_REVOKED;
	}
};
oFF.PlanningVersionPrivilege.prototype.getGrantee = function()
{
	return this.m_grantee;
};
oFF.PlanningVersionPrivilege.prototype.getPlanningModel = function()
{
	return this.m_planningModel;
};
oFF.PlanningVersionPrivilege.prototype.getPrivilege = function()
{
	return this.m_privilege;
};
oFF.PlanningVersionPrivilege.prototype.getPrivilegeState = function()
{
	return this.m_clientState;
};
oFF.PlanningVersionPrivilege.prototype.getPrivilegeStateServer = function()
{
	return this.m_serverState;
};
oFF.PlanningVersionPrivilege.prototype.getQualifiedName = function()
{
	return this.m_qualifiedName;
};
oFF.PlanningVersionPrivilege.prototype.getQueryDataSource = function()
{
	return this.m_queryDataSource;
};
oFF.PlanningVersionPrivilege.prototype.getVersionId = function()
{
	return this.m_versionIdentifier.getVersionId();
};
oFF.PlanningVersionPrivilege.prototype.getVersionKey = function()
{
	return this.m_versionIdentifier.getVersionKey();
};
oFF.PlanningVersionPrivilege.prototype.getVersionOwner = function()
{
	return this.m_versionIdentifier.getVersionOwner();
};
oFF.PlanningVersionPrivilege.prototype.getVersionUniqueName = function()
{
	return this.m_versionIdentifier.getVersionUniqueName();
};
oFF.PlanningVersionPrivilege.prototype.isSharedVersion = function()
{
	return this.m_versionIdentifier.isSharedVersion();
};
oFF.PlanningVersionPrivilege.prototype.releaseObject = function()
{
	this.m_qualifiedName = null;
	this.m_clientState = null;
	this.m_serverState = null;
	this.m_grantee = null;
	this.m_privilege = null;
	this.m_versionIdentifier = oFF.XObjectExt.release(this.m_versionIdentifier);
	this.m_queryDataSource = null;
	this.m_planningModel = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.PlanningVersionPrivilege.prototype.setPrivilegeState = function(privilegeState)
{
	this.m_clientState = privilegeState;
};
oFF.PlanningVersionPrivilege.prototype.setPrivilegeStateServer = function(privilegeState)
{
	this.m_serverState = privilegeState;
};
oFF.PlanningVersionPrivilege.prototype.setupExt = function(planningModel, queryDataSource, versionIdentifier, privilege, grantee)
{
	oFF.XObjectExt.assertNotNullExt(planningModel, "Planning model null");
	this.m_planningModel = planningModel;
	oFF.XObjectExt.assertNotNullExt(queryDataSource, "Query data source null");
	this.m_queryDataSource = queryDataSource;
	if (this.m_queryDataSource.getType() !== oFF.MetaObjectType.PLANNING)
	{
		throw oFF.XException.createIllegalArgumentException("illegal query data source object type");
	}
	this.m_versionIdentifier = this.getPlanningModel().copyVersionIdentifier(versionIdentifier);
	oFF.XObjectExt.assertNotNullExt(privilege, "Planning privilege null");
	this.m_privilege = privilege;
	oFF.XStringUtils.checkStringNotEmpty(grantee, "grantee null");
	this.m_grantee = grantee;
	this.m_serverState = oFF.PlanningPrivilegeState.NEW;
	this.m_clientState = oFF.PlanningPrivilegeState.NEW;
	this.m_qualifiedName = oFF.PlanningVersionPrivilege.createQualifiedName(this.m_planningModel, this.m_queryDataSource, this.m_versionIdentifier, this.m_privilege, this.m_grantee);
};
oFF.PlanningVersionPrivilege.prototype.toString = function()
{
	let sb = oFF.XStringBuffer.create();
	sb.append(this.getQualifiedName());
	let clientState = this.getPrivilegeState();
	if (oFF.notNull(clientState))
	{
		sb.append(" - ");
		sb.append(clientState.getName());
	}
	return sb.toString();
};

oFF.PlanningVersionSettings = function() {};
oFF.PlanningVersionSettings.prototype = new oFF.XObject();
oFF.PlanningVersionSettings.prototype._ff_c = "PlanningVersionSettings";

oFF.PlanningVersionSettings.create = function(versionIdentifier, sequenceId, useExternalView)
{
	let settings = new oFF.PlanningVersionSettings();
	settings.m_versionIdentifier = oFF.PlanningVersionIdentifier.create(versionIdentifier.getVersionId(), versionIdentifier.isSharedVersion(), versionIdentifier.getVersionOwner());
	settings.m_sequenceId = sequenceId;
	settings.m_useExternalView = useExternalView;
	return settings;
};
oFF.PlanningVersionSettings.prototype.m_sequenceId = null;
oFF.PlanningVersionSettings.prototype.m_useExternalView = false;
oFF.PlanningVersionSettings.prototype.m_versionIdentifier = null;
oFF.PlanningVersionSettings.prototype.createVersionSettings = function()
{
	return oFF.PlanningVersionSettings.create(this, this.getActionSequenceId(), this.getUseExternalView());
};
oFF.PlanningVersionSettings.prototype.getActionSequenceId = function()
{
	return this.m_sequenceId;
};
oFF.PlanningVersionSettings.prototype.getIsRestrictionEnabled = function()
{
	return true;
};
oFF.PlanningVersionSettings.prototype.getUseExternalView = function()
{
	return this.m_useExternalView;
};
oFF.PlanningVersionSettings.prototype.getVersionId = function()
{
	return this.m_versionIdentifier.getVersionId();
};
oFF.PlanningVersionSettings.prototype.getVersionKey = function()
{
	return this.m_versionIdentifier.getVersionKey();
};
oFF.PlanningVersionSettings.prototype.getVersionOwner = function()
{
	return this.m_versionIdentifier.getVersionOwner();
};
oFF.PlanningVersionSettings.prototype.getVersionUniqueName = function()
{
	return this.m_versionIdentifier.getVersionUniqueName();
};
oFF.PlanningVersionSettings.prototype.isSharedVersion = function()
{
	return this.m_versionIdentifier.isSharedVersion();
};
oFF.PlanningVersionSettings.prototype.releaseObject = function()
{
	this.m_versionIdentifier = null;
	this.m_sequenceId = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.PlanningVersionSettings.prototype.toString = function()
{
	return this.getVersionUniqueName();
};

oFF.PlanningVersionSettingsSimple = function() {};
oFF.PlanningVersionSettingsSimple.prototype = new oFF.XObject();
oFF.PlanningVersionSettingsSimple.prototype._ff_c = "PlanningVersionSettingsSimple";

oFF.PlanningVersionSettingsSimple.create = function(versionId, sequenceId, useExternalView)
{
	let settings = new oFF.PlanningVersionSettingsSimple();
	settings.m_versionId = versionId;
	settings.m_sequenceId = sequenceId;
	settings.m_useExternalView = useExternalView;
	return settings;
};
oFF.PlanningVersionSettingsSimple.prototype.m_sequenceId = null;
oFF.PlanningVersionSettingsSimple.prototype.m_useExternalView = false;
oFF.PlanningVersionSettingsSimple.prototype.m_versionId = null;
oFF.PlanningVersionSettingsSimple.prototype.createVersionSettings = function()
{
	return oFF.PlanningVersionSettingsSimple.create(this.m_versionId, this.m_sequenceId, this.m_useExternalView);
};
oFF.PlanningVersionSettingsSimple.prototype.getActionSequenceId = function()
{
	return this.m_sequenceId;
};
oFF.PlanningVersionSettingsSimple.prototype.getIsRestrictionEnabled = function()
{
	return true;
};
oFF.PlanningVersionSettingsSimple.prototype.getUseExternalView = function()
{
	return this.m_useExternalView;
};
oFF.PlanningVersionSettingsSimple.prototype.getVersionId = function()
{
	return -1;
};
oFF.PlanningVersionSettingsSimple.prototype.getVersionKey = function()
{
	return "";
};
oFF.PlanningVersionSettingsSimple.prototype.getVersionOwner = function()
{
	return null;
};
oFF.PlanningVersionSettingsSimple.prototype.getVersionUniqueName = function()
{
	return this.m_versionId;
};
oFF.PlanningVersionSettingsSimple.prototype.isSharedVersion = function()
{
	return false;
};
oFF.PlanningVersionSettingsSimple.prototype.releaseObject = function()
{
	this.m_versionId = null;
	this.m_sequenceId = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.PlanningVersionSettingsSimple.prototype.toString = function()
{
	return this.getVersionUniqueName();
};

oFF.PlanningActionMetadata = function() {};
oFF.PlanningActionMetadata.prototype = new oFF.XObject();
oFF.PlanningActionMetadata.prototype._ff_c = "PlanningActionMetadata";

oFF.PlanningActionMetadata.prototype.m_actionDescription = null;
oFF.PlanningActionMetadata.prototype.m_actionId = null;
oFF.PlanningActionMetadata.prototype.m_actionName = null;
oFF.PlanningActionMetadata.prototype.m_actionParameterMetadata = null;
oFF.PlanningActionMetadata.prototype.m_actionParameterNames = null;
oFF.PlanningActionMetadata.prototype.m_actionType = null;
oFF.PlanningActionMetadata.prototype.m_defaultAction = false;
oFF.PlanningActionMetadata.prototype.getActionDescription = function()
{
	return this.m_actionDescription;
};
oFF.PlanningActionMetadata.prototype.getActionId = function()
{
	return this.m_actionId;
};
oFF.PlanningActionMetadata.prototype.getActionName = function()
{
	return this.m_actionName;
};
oFF.PlanningActionMetadata.prototype.getActionParameterMetadata = function()
{
	return this.m_actionParameterMetadata;
};
oFF.PlanningActionMetadata.prototype.getActionParameterNames = function()
{
	oFF.XObjectExt.assertNotNullExt(this.m_actionParameterNames, "not set");
	return this.m_actionParameterNames;
};
oFF.PlanningActionMetadata.prototype.getActionType = function()
{
	if (oFF.isNull(this.m_actionType))
	{
		return oFF.PlanningActionType.UNKNOWN;
	}
	return this.m_actionType;
};
oFF.PlanningActionMetadata.prototype.isDefault = function()
{
	return this.m_defaultAction;
};
oFF.PlanningActionMetadata.prototype.setActionDescription = function(actionDescription)
{
	this.m_actionDescription = actionDescription;
};
oFF.PlanningActionMetadata.prototype.setActionId = function(actionId)
{
	this.m_actionId = actionId;
};
oFF.PlanningActionMetadata.prototype.setActionName = function(actionName)
{
	this.m_actionName = actionName;
};
oFF.PlanningActionMetadata.prototype.setActionParameterMetadata = function(actionParameterMetadata)
{
	this.m_actionParameterMetadata = actionParameterMetadata;
};
oFF.PlanningActionMetadata.prototype.setActionParameterNames = function(parameterNames)
{
	if (oFF.notNull(this.m_actionParameterNames))
	{
		throw oFF.XException.createIllegalStateException("already set");
	}
	this.m_actionParameterNames = oFF.XList.create();
	if (oFF.notNull(parameterNames))
	{
		this.m_actionParameterNames.addAll(parameterNames);
	}
};
oFF.PlanningActionMetadata.prototype.setActionType = function(actionType)
{
	this.m_actionType = actionType;
};
oFF.PlanningActionMetadata.prototype.setDefault = function(defaultAction)
{
	this.m_defaultAction = defaultAction;
};
oFF.PlanningActionMetadata.prototype.toString = function()
{
	let sb = oFF.XStringBuffer.create();
	sb.append("action: ");
	sb.append("id: ");
	if (oFF.notNull(this.m_actionId))
	{
		sb.append(this.m_actionId);
	}
	sb.appendNewLine();
	sb.append("name: ");
	if (oFF.notNull(this.m_actionName))
	{
		sb.append(this.m_actionName);
	}
	sb.appendNewLine();
	sb.append("description: ");
	if (oFF.notNull(this.m_actionDescription))
	{
		sb.append(this.m_actionDescription);
	}
	sb.appendNewLine();
	sb.append("type: ");
	if (oFF.notNull(this.m_actionType))
	{
		sb.append(this.m_actionType.toString());
		sb.append(" ");
	}
	if (this.m_defaultAction)
	{
		sb.append("default=true");
	}
	sb.appendNewLine();
	let actionParameterMetadata = this.getActionParameterMetadata();
	if (oFF.isNull(actionParameterMetadata))
	{
		sb.append("action does not have parameters");
	}
	else
	{
		sb.appendLine("parameters:");
		sb.append(actionParameterMetadata.toString());
	}
	sb.appendNewLine();
	return sb.toString();
};

oFF.EpmQueryManagerCreationListenerLambda = function() {};
oFF.EpmQueryManagerCreationListenerLambda.prototype = new oFF.XObject();
oFF.EpmQueryManagerCreationListenerLambda.prototype._ff_c = "EpmQueryManagerCreationListenerLambda";

oFF.EpmQueryManagerCreationListenerLambda.createSingleUse = function(callback)
{
	let obj = new oFF.EpmQueryManagerCreationListenerLambda();
	obj.setupExt(callback);
	return obj;
};
oFF.EpmQueryManagerCreationListenerLambda.prototype.m_callback = null;
oFF.EpmQueryManagerCreationListenerLambda.prototype.onQueryManagerCreated = function(extResult, queryManager, customIdentifier)
{
	this.m_callback(extResult);
	this.releaseObject();
};
oFF.EpmQueryManagerCreationListenerLambda.prototype.releaseObject = function()
{
	this.m_callback = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.EpmQueryManagerCreationListenerLambda.prototype.setupExt = function(callback)
{
	this.m_callback = callback;
};

oFF.LambdaRpcFunctionExecutionListener = function() {};
oFF.LambdaRpcFunctionExecutionListener.prototype = new oFF.XObject();
oFF.LambdaRpcFunctionExecutionListener.prototype._ff_c = "LambdaRpcFunctionExecutionListener";

oFF.LambdaRpcFunctionExecutionListener.create = function(action)
{
	let instance = new oFF.LambdaRpcFunctionExecutionListener();
	instance.m_action = action;
	return instance;
};
oFF.LambdaRpcFunctionExecutionListener.prototype.m_action = null;
oFF.LambdaRpcFunctionExecutionListener.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.m_action(extResult, response, customIdentifier);
	this.m_action = null;
	this.releaseObject();
};

oFF.EpmHierarchyValueHelpListener = function() {};
oFF.EpmHierarchyValueHelpListener.prototype = new oFF.XObject();
oFF.EpmHierarchyValueHelpListener.prototype._ff_c = "EpmHierarchyValueHelpListener";

oFF.EpmHierarchyValueHelpListener.create = function(dimension, valueHelpExecutedListener)
{
	let instance = new oFF.EpmHierarchyValueHelpListener();
	instance.setupWithListener(dimension, valueHelpExecutedListener);
	return instance;
};
oFF.EpmHierarchyValueHelpListener.remap = function(dimension, originalResult)
{
	let nodes = null;
	let data = originalResult.getData();
	if (oFF.notNull(data))
	{
		nodes = oFF.XList.create();
		let objectsIterator = data.getObjectsIterator();
		while (objectsIterator.hasNext())
		{
			let item = objectsIterator.next();
			oFF.EpmHierarchyHelpNode.createHierarchyHelpNode(dimension, item);
		}
	}
	return oFF.ExtResult.create(nodes, originalResult);
};
oFF.EpmHierarchyValueHelpListener.prototype.m_dimension = null;
oFF.EpmHierarchyValueHelpListener.prototype.m_valueHelpExecutedListener = null;
oFF.EpmHierarchyValueHelpListener.prototype.onHierarchyCatalogResult = function(extResult, result, customIdentifier)
{
	let newResult = oFF.EpmHierarchyValueHelpListener.remap(this.m_dimension, extResult);
	this.m_valueHelpExecutedListener.onValuehelpExecuted(newResult, null, customIdentifier);
	this.m_valueHelpExecutedListener = null;
	this.m_dimension = null;
};
oFF.EpmHierarchyValueHelpListener.prototype.setupWithListener = function(dimension, valueHelpExecutedListener)
{
	this.m_dimension = dimension;
	this.m_valueHelpExecutedListener = valueHelpExecutedListener;
};

oFF.EpmMemberValueFetcher = function() {};
oFF.EpmMemberValueFetcher.prototype = new oFF.XObject();
oFF.EpmMemberValueFetcher.prototype._ff_c = "EpmMemberValueFetcher";

oFF.EpmMemberValueFetcher.create = function()
{
	return new oFF.EpmMemberValueFetcher();
};
oFF.EpmMemberValueFetcher.prototype.m_dimension = null;
oFF.EpmMemberValueFetcher.prototype.m_hierId = null;
oFF.EpmMemberValueFetcher.prototype.m_identifier = null;
oFF.EpmMemberValueFetcher.prototype.m_levelId = null;
oFF.EpmMemberValueFetcher.prototype.m_listener = null;
oFF.EpmMemberValueFetcher.prototype.m_result = null;
oFF.EpmMemberValueFetcher.prototype.m_syncType = null;
oFF.EpmMemberValueFetcher.prototype.fetchMemberValues = function(syncType, listener, customIdentifier, dimension)
{
	this.m_dimension = dimension;
	this.m_dimension.setReadModeGraceful(oFF.QContextType.SELECTOR, oFF.QMemberReadMode.MASTER);
	this.m_hierId = oFF.XStringValue.create("HIER_ID");
	this.m_levelId = oFF.XStringValue.create("LEVEL_ID");
	if (oFF.XStringUtils.isNullOrEmpty(dimension.getHierarchyName()))
	{
		this.m_result = dimension.processValueHelp(syncType, listener, customIdentifier);
	}
	else
	{
		this.m_identifier = customIdentifier;
		this.m_syncType = syncType;
		this.m_listener = listener;
		dimension.fetchHierarchyCatalog(syncType, this, this.m_hierId);
	}
	let result = this.m_result;
	this.m_result = null;
	return result;
};
oFF.EpmMemberValueFetcher.prototype.onHierarchyCatalogResult = function(extResult, result, customIdentifier)
{
	if (customIdentifier === this.m_hierId)
	{
		this.m_dimension.fetchHierarchyLevels(this.m_syncType, this, this.m_levelId, this.m_dimension.getHierarchyUniqueName(this.m_dimension.getHierarchyName()));
	}
	else if (customIdentifier === this.m_levelId)
	{
		if (extResult.isValid() && extResult.getData().getObjects().size() === 1 && extResult.getData().getObjects().get(0).getHierarchyType().isLeveledHierarchy())
		{
			let queryModel = this.m_dimension.getQueryModel();
			let rsFields = this.m_dimension.getSelectorFields();
			rsFields.clear();
			oFF.XCollectionUtils.addIfNotPresent(rsFields, this.m_dimension.getKeyField());
			oFF.XCollectionUtils.addIfNotPresent(rsFields, this.m_dimension.getDisplayKeyField());
			oFF.XCollectionUtils.addIfNotPresent(rsFields, this.m_dimension.getFlatKeyField());
			oFF.XCollectionUtils.addIfNotPresent(rsFields, this.m_dimension.getFlatDisplayKeyField());
			let hierarchy = extResult.getData().getObjects().get(0);
			oFF.XCollectionUtils.forEach(hierarchy.getHierarchyLevels(), (level) => {
				oFF.XCollectionUtils.addIfNotPresent(rsFields, queryModel.getFieldByName(level.getLevelName()));
				oFF.XCollectionUtils.addIfNotPresent(rsFields, queryModel.getFieldByName(level.getLevelDimensionName()));
			});
		}
		this.m_result = this.m_dimension.processValueHelp(this.m_syncType, this.m_listener, this.m_identifier);
	}
};
oFF.EpmMemberValueFetcher.prototype.releaseObject = function()
{
	this.m_dimension = null;
	this.m_hierId = oFF.XObjectExt.release(this.m_hierId);
	this.m_levelId = oFF.XObjectExt.release(this.m_levelId);
	this.m_syncType = null;
	this.m_listener = null;
	this.m_identifier = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.XCmdCreatePlanningOperation = function() {};
oFF.XCmdCreatePlanningOperation.prototype = new oFF.XCommand();
oFF.XCmdCreatePlanningOperation.prototype._ff_c = "XCmdCreatePlanningOperation";

oFF.XCmdCreatePlanningOperation.CLAZZ = null;
oFF.XCmdCreatePlanningOperation.CMD_NAME = "CREATE_PLANNING_OPERATION";
oFF.XCmdCreatePlanningOperation.PARAM_E_PLANNING_OPERATION = "PLANNING_OPERATION";
oFF.XCmdCreatePlanningOperation.PARAM_I_DATA_AREA = "DATA_AREA";
oFF.XCmdCreatePlanningOperation.PARAM_I_PLANNING_OPERATION_IDENTIFIER = "PLANNING_OPERATION_IDENTIFIER";
oFF.XCmdCreatePlanningOperation.staticSetup = function()
{
	oFF.XCmdCreatePlanningOperation.CLAZZ = oFF.XClass.create(oFF.XCmdCreatePlanningOperation);
};
oFF.XCmdCreatePlanningOperation.prototype.getCommandResultClass = function()
{
	return oFF.XCmdCreatePlanningOperationResult.CLAZZ;
};

oFF.XCmdCreatePlanningOperationResult = function() {};
oFF.XCmdCreatePlanningOperationResult.prototype = new oFF.XCommandResult();
oFF.XCmdCreatePlanningOperationResult.prototype._ff_c = "XCmdCreatePlanningOperationResult";

oFF.XCmdCreatePlanningOperationResult.CLAZZ = null;
oFF.XCmdCreatePlanningOperationResult.staticSetup = function()
{
	oFF.XCmdCreatePlanningOperationResult.CLAZZ = oFF.XClass.create(oFF.XCmdCreatePlanningOperationResult);
};
oFF.XCmdCreatePlanningOperationResult.prototype.onXPlanningCommandProcessed = function(extPlanningCommandResult)
{
	this.getMessageManager().addAllMessages(extPlanningCommandResult);
	if (extPlanningCommandResult.isValid())
	{
		let dataArea = this.getParameter(oFF.XCmdCreatePlanningOperation.PARAM_I_DATA_AREA);
		let planningOperationIdentifier = this.getParameter(oFF.XCmdCreatePlanningOperation.PARAM_I_PLANNING_OPERATION_IDENTIFIER);
		let planningOperationType = planningOperationIdentifier.getPlanningOperationType();
		let planningOperation = null;
		if (planningOperationType === oFF.PlanningOperationType.PLANNING_FUNCTION)
		{
			let planningFunction = new oFF.PlanningFunction();
			planningFunction.setCommandType(oFF.PlanningCommandType.PLANNING_FUNCTION);
			planningFunction.setPlanningService(dataArea.getPlanningService());
			planningFunction.setPlanningContext(dataArea);
			planningFunction.setCommandIdentifier(planningOperationIdentifier);
			planningFunction.setPlanningOperationMetadata(extPlanningCommandResult.getData().getPlanningFunctionMetadata());
			planningFunction.initializePlanningOperation();
			planningOperation = planningFunction;
		}
		else if (planningOperationType === oFF.PlanningOperationType.PLANNING_SEQUENCE)
		{
			let planningSequence = new oFF.PlanningSequence();
			planningSequence.setCommandType(oFF.PlanningCommandType.PLANNING_SEQUENCE);
			planningSequence.setPlanningService(dataArea.getPlanningService());
			planningSequence.setPlanningContext(dataArea);
			planningSequence.setCommandIdentifier(planningOperationIdentifier);
			planningSequence.setPlanningOperationMetadata(extPlanningCommandResult.getData().getPlanningSequenceMetadata());
			planningSequence.initializePlanningOperation();
			planningOperation = planningSequence;
		}
		if (oFF.isNull(planningOperation))
		{
			this.getMessageManager().addError(0, "illegal planning operation type");
			this.onProcessFinished();
			return;
		}
		this.addResultParameter(oFF.XCmdCreatePlanningOperation.PARAM_E_PLANNING_OPERATION, planningOperation);
	}
	this.onProcessFinished();
};
oFF.XCmdCreatePlanningOperationResult.prototype.process = function()
{
	let dataArea = this.getParameter(oFF.XCmdCreatePlanningOperation.PARAM_I_DATA_AREA);
	let planningOperationIdentifier = this.getParameter(oFF.XCmdCreatePlanningOperation.PARAM_I_PLANNING_OPERATION_IDENTIFIER);
	let planningOperationType = planningOperationIdentifier.getPlanningOperationType();
	if (planningOperationType !== oFF.PlanningOperationType.PLANNING_FUNCTION && planningOperationType !== oFF.PlanningOperationType.PLANNING_SEQUENCE)
	{
		this.getMessageManager().addError(0, "illegal planning operation type");
		this.onProcessFinished();
		return;
	}
	let requestGetPlanningOperationMetadata = dataArea.createRequestGetPlanningOperationMetadata(planningOperationIdentifier);
	requestGetPlanningOperationMetadata.processCommand(this.getSyncType(), oFF.XPlanningCommandCallback.create(this), null);
};

oFF.XCmdInitPlanningStep = function() {};
oFF.XCmdInitPlanningStep.prototype = new oFF.XCommand();
oFF.XCmdInitPlanningStep.prototype._ff_c = "XCmdInitPlanningStep";

oFF.XCmdInitPlanningStep.CLAZZ = null;
oFF.XCmdInitPlanningStep.CMD_NAME = "INIT_PLANNING_STEP";
oFF.XCmdInitPlanningStep.PARAM_I_PLANNING_MODEL = "PLANNING_MODEL";
oFF.XCmdInitPlanningStep.PARAM_I_STEP = "STEP";
oFF.XCmdInitPlanningStep.STEP_1_REFRESH_VERSIONS = null;
oFF.XCmdInitPlanningStep.STEP_2_INIT_VERSIONS = null;
oFF.XCmdInitPlanningStep.staticSetup = function()
{
	oFF.XCmdInitPlanningStep.CLAZZ = oFF.XClass.create(oFF.XCmdInitPlanningStep);
	oFF.XCmdInitPlanningStep.STEP_1_REFRESH_VERSIONS = oFF.XStringValue.create("STEP_1_REFRESH_VERSIONS");
	oFF.XCmdInitPlanningStep.STEP_2_INIT_VERSIONS = oFF.XStringValue.create("STEP_2_INIT_VERSIONS");
};
oFF.XCmdInitPlanningStep.prototype.getCommandResultClass = function()
{
	return oFF.XCmdInitPlanningStepResult.CLAZZ;
};

oFF.XCmdInitPlanningStepResult = function() {};
oFF.XCmdInitPlanningStepResult.prototype = new oFF.XCommandResult();
oFF.XCmdInitPlanningStepResult.prototype._ff_c = "XCmdInitPlanningStepResult";

oFF.XCmdInitPlanningStepResult.CLAZZ = null;
oFF.XCmdInitPlanningStepResult.staticSetup = function()
{
	oFF.XCmdInitPlanningStepResult.CLAZZ = oFF.XClass.create(oFF.XCmdInitPlanningStepResult);
};
oFF.XCmdInitPlanningStepResult.prototype.checkBlocking = function(planningModelBehaviour)
{
	if (this.getSyncType() !== oFF.SyncType.BLOCKING)
	{
		this.getMessageManager().addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.INVALID_STATE, oFF.XStringBuffer.create().append("Planning model behaviour ").append(planningModelBehaviour.getName()).append(" is only supported in blocking mode").toString(), null);
		return false;
	}
	return true;
};
oFF.XCmdInitPlanningStepResult.prototype.onXPlanningCommandProcessed = function(extPlanningCommandResult)
{
	this.getMessageManager().addAllMessages(extPlanningCommandResult);
	this.onProcessFinished();
};
oFF.XCmdInitPlanningStepResult.prototype.process = function()
{
	let planningModel = this.getParameter(oFF.XCmdInitPlanningStep.PARAM_I_PLANNING_MODEL);
	if (oFF.isNull(planningModel))
	{
		this.onProcessFinished();
	}
	let step = this.getParameter(oFF.XCmdInitPlanningStep.PARAM_I_STEP);
	if (step === oFF.XCmdInitPlanningStep.STEP_1_REFRESH_VERSIONS)
	{
		this.processStep1RefreshVersions(planningModel);
	}
	else if (step === oFF.XCmdInitPlanningStep.STEP_2_INIT_VERSIONS)
	{
		this.processStep2InitVersions(planningModel);
	}
	else
	{
		this.onProcessFinished();
	}
};
oFF.XCmdInitPlanningStepResult.prototype.processStep1RefreshVersions = function(planningModel)
{
	if (planningModel.isWithSharedVersions())
	{
		let userName = planningModel.getBackendUserName();
		if (oFF.XStringUtils.isNullOrEmpty(userName))
		{
			this.getMessageManager().addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.INVALID_STATE, "undo/redo stack with shared versions requires backend user", null);
		}
	}
	let planningModelBehaviour = planningModel.getPlanningModelBehaviour();
	if (oFF.isNull(planningModelBehaviour))
	{
		this.getMessageManager().addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.INVALID_STATE, "planning model behavior is null", null);
	}
	let commandType = oFF.PlanningContextCommandType.REFRESH;
	if (planningModelBehaviour === oFF.PlanningModelBehaviour.ENFORCE_NO_VERSION_HARD_DELETE)
	{
		commandType = oFF.PlanningContextCommandType.HARD_DELETE;
	}
	let command = planningModel.createPlanningContextCommand(commandType);
	command.processCommand(this.getSyncType(), oFF.XPlanningCommandCallback.create(this), oFF.XCmdInitPlanningStep.STEP_1_REFRESH_VERSIONS);
};
oFF.XCmdInitPlanningStepResult.prototype.processStep2InitVersions = function(planningModel)
{
	let planningModelBehaviour = planningModel.getPlanningModelBehaviour();
	if (planningModelBehaviour === oFF.PlanningModelBehaviour.CREATE_DEFAULT_VERSION)
	{
		if (this.checkBlocking(planningModelBehaviour))
		{
			oFF.PlanningModelUtil.initCreateDefaultVersion(planningModel);
		}
	}
	else if (planningModelBehaviour === oFF.PlanningModelBehaviour.ENFORCE_NO_VERSION || planningModelBehaviour === oFF.PlanningModelBehaviour.ENFORCE_NO_VERSION_HARD_DELETE)
	{
		if (this.checkBlocking(planningModelBehaviour))
		{
			oFF.PlanningModelUtil.initEnforceNoVersion(planningModel);
		}
	}
	else if (planningModelBehaviour === oFF.PlanningModelBehaviour.ENFORCE_SINGLE_VERSION)
	{
		if (this.checkBlocking(planningModelBehaviour))
		{
			oFF.PlanningModelUtil.initEnforceSingleVersion(planningModel);
		}
	}
	this.onProcessFinished();
};

oFF.PlanningVersion = function() {};
oFF.PlanningVersion.prototype = new oFF.XObject();
oFF.PlanningVersion.prototype._ff_c = "PlanningVersion";

oFF.PlanningVersion.create = function()
{
	let version = new oFF.PlanningVersion();
	version.m_useExternalView = true;
	version.m_isRestrictionEnabled = true;
	return version;
};
oFF.PlanningVersion.parametersStringMap2ParametersStructure = function(parameters)
{
	if (oFF.isNull(parameters))
	{
		return null;
	}
	let parametersStructure = oFF.PrFactory.createStructure();
	let keys = parameters.getKeysAsIterator();
	while (keys.hasNext())
	{
		let key = keys.next();
		let value = parameters.getByKey(key);
		parametersStructure.putString(key, value);
	}
	return parametersStructure;
};
oFF.PlanningVersion.parametersStructure2ParametersStringMap = function(parametersStructure)
{
	if (oFF.isNull(parametersStructure))
	{
		return null;
	}
	let parameters = oFF.XHashMapByString.create();
	let names = oFF.PrUtils.getKeysAsReadOnlyList(parametersStructure, null);
	if (oFF.notNull(names))
	{
		for (let i = 0; i < names.size(); i++)
		{
			let name = names.get(i);
			let valueElement = oFF.PrUtils.getProperty(parametersStructure, name);
			if (oFF.isNull(valueElement))
			{
				continue;
			}
			if (valueElement.getType() !== oFF.PrElementType.STRING)
			{
				continue;
			}
			let stringElement = valueElement;
			parameters.put(name, stringElement.getString());
		}
	}
	return parameters;
};
oFF.PlanningVersion.prototype.m_actionActive = false;
oFF.PlanningVersion.prototype.m_actionEndTime = null;
oFF.PlanningVersion.prototype.m_actionSequenceId = null;
oFF.PlanningVersion.prototype.m_actionStartTime = null;
oFF.PlanningVersion.prototype.m_backupTime = null;
oFF.PlanningVersion.prototype.m_category = null;
oFF.PlanningVersion.prototype.m_creationTime = null;
oFF.PlanningVersion.prototype.m_dacWriteEnabled = false;
oFF.PlanningVersion.prototype.m_hasExternalStorage = false;
oFF.PlanningVersion.prototype.m_hasPlanningArea = false;
oFF.PlanningVersion.prototype.m_inPublicEditMode = false;
oFF.PlanningVersion.prototype.m_isRestrictionEnabled = false;
oFF.PlanningVersion.prototype.m_isShowingAsPublicVersion = false;
oFF.PlanningVersion.prototype.m_ownerDisplayName = null;
oFF.PlanningVersion.prototype.m_parametersStructure = null;
oFF.PlanningVersion.prototype.m_planningModel = null;
oFF.PlanningVersion.prototype.m_privilege = null;
oFF.PlanningVersion.prototype.m_sequenceActive = false;
oFF.PlanningVersion.prototype.m_sequenceCreateTime = null;
oFF.PlanningVersion.prototype.m_sequenceDescription = null;
oFF.PlanningVersion.prototype.m_sourceVersionName = null;
oFF.PlanningVersion.prototype.m_totalChangesSize = 0;
oFF.PlanningVersion.prototype.m_undoChangesSize = 0;
oFF.PlanningVersion.prototype.m_useExternalView = false;
oFF.PlanningVersion.prototype.m_userName = null;
oFF.PlanningVersion.prototype.m_versionDescription = null;
oFF.PlanningVersion.prototype.m_versionIdentifier = null;
oFF.PlanningVersion.prototype.m_versionState = null;
oFF.PlanningVersion.prototype.m_workflowState = null;
oFF.PlanningVersion.prototype.m_writeBackEnabled = false;
oFF.PlanningVersion.prototype.assertVersionDescriptionUniqueAndNotNullOrEmpty = function(versionDescription)
{
	oFF.XStringUtils.checkStringNotEmpty(versionDescription, "version description is null or empty.");
	if (oFF.XString.isEqual(this.m_versionDescription, versionDescription))
	{
		return;
	}
	if (!this.getPlanningModel().isVersionDescriptionUnique(versionDescription))
	{
		throw oFF.XException.createIllegalArgumentException("version description is not unique.");
	}
};
oFF.PlanningVersion.prototype.backup = function()
{
	this.checkModelInitialized();
	return this.processVersionRequest(oFF.PlanningModelRequestType.BACKUP_VERSION);
};
oFF.PlanningVersion.prototype.beginActionSequence = function(planningStepType, syncType, emptyListener, identifier)
{
	let pair = oFF.XPair.create(this, planningStepType);
	let versionPairs = oFF.XCollectionUtils.singletonList(pair);
	return this.getPlanningModel().beginActionSequence(versionPairs, syncType, emptyListener, identifier);
};
oFF.PlanningVersion.prototype.checkModelInitialized = function()
{
	this.getPlanningModel().checkModelInitialized();
};
oFF.PlanningVersion.prototype.close = function()
{
	this.checkModelInitialized();
	let command = this.createRequestVersion(oFF.PlanningModelRequestType.CLOSE_VERSION);
	let commandResult = command.processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(commandResult.getData(), commandResult);
};
oFF.PlanningVersion.prototype.commitActionSequence = function(syncType, emptyListener, identifier)
{
	let versions = oFF.XCollectionUtils.singletonList(this);
	return this.getPlanningModel().commitActionSequences(versions, this.getActionSequenceId(), syncType, emptyListener, identifier);
};
oFF.PlanningVersion.prototype.createRequestBackupVersion = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.BACKUP_VERSION);
};
oFF.PlanningVersion.prototype.createRequestCloseVersion = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.CLOSE_VERSION);
};
oFF.PlanningVersion.prototype.createRequestDropVersion = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.DROP_VERSION);
};
oFF.PlanningVersion.prototype.createRequestEndActionSequence = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.END_ACTION_SEQUENCE);
};
oFF.PlanningVersion.prototype.createRequestInitVersion = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.INIT_VERSION);
};
oFF.PlanningVersion.prototype.createRequestKillActionSequence = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.KILL_ACTION_SEQUENCE);
};
oFF.PlanningVersion.prototype.createRequestRedoVersion = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.REDO_VERSION);
};
oFF.PlanningVersion.prototype.createRequestResetVersion = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.RESET_VERSION);
};
oFF.PlanningVersion.prototype.createRequestSetParameters = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.SET_PARAMETERS);
};
oFF.PlanningVersion.prototype.createRequestSetTimeout = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.SET_TIMEOUT);
};
oFF.PlanningVersion.prototype.createRequestStartActionSequence = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.START_ACTION_SEQUENCE);
};
oFF.PlanningVersion.prototype.createRequestStateDescriptions = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.GET_VERSION_STATE_DESCRIPTIONS);
};
oFF.PlanningVersion.prototype.createRequestUndoVersion = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.UNDO_VERSION);
};
oFF.PlanningVersion.prototype.createRequestUpdateParameters = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.UPDATE_PARAMETERS);
};
oFF.PlanningVersion.prototype.createRequestVersion = function(requestType)
{
	this.checkModelInitialized();
	if (!requestType.isTypeOf(oFF.PlanningModelRequestType.VERSION_REQUEST))
	{
		throw oFF.XException.createIllegalStateException("illegal request type");
	}
	let request;
	if (requestType === oFF.PlanningModelRequestType.INIT_VERSION)
	{
		request = new oFF.PlanningModelRequestVersionInit();
	}
	else if (requestType === oFF.PlanningModelRequestType.SET_PARAMETERS)
	{
		request = new oFF.PlanningModelRequestVersionSetParameters();
	}
	else if (requestType === oFF.PlanningModelRequestType.SET_TIMEOUT)
	{
		request = new oFF.PlanningModelRequestVersionSetTimeout();
	}
	else if (requestType === oFF.PlanningModelRequestType.CLOSE_VERSION)
	{
		request = new oFF.PlanningModelRequestVersionClose();
		request.setCloseMode(oFF.CloseModeType.DISCARD);
	}
	else if (requestType === oFF.PlanningModelRequestType.START_ACTION_SEQUENCE)
	{
		request = new oFF.PlanningModelRequestVersionStartActionSequence();
	}
	else if (requestType === oFF.PlanningModelRequestType.END_ACTION_SEQUENCE)
	{
		request = new oFF.PlanningModelRequestVersionEndActionSequence();
	}
	else if (requestType === oFF.PlanningModelRequestType.UNDO_VERSION || requestType === oFF.PlanningModelRequestType.REDO_VERSION)
	{
		request = new oFF.PlanningModelRequestVersionUndoRedo();
	}
	else if (requestType === oFF.PlanningModelRequestType.GET_VERSION_STATE_DESCRIPTIONS)
	{
		request = new oFF.PlanningModelRequestVersionStateDescriptions();
	}
	else
	{
		request = new oFF.PlanningModelRequestVersion();
	}
	request.setPlanningService(this.getPlanningModel().getPlanningService());
	request.setCommandType(oFF.PlanningCommandType.PLANNING_MODEL_REQUEST);
	request.setRequestType(requestType);
	request.setPlanningContext(this.getPlanningModel());
	request.setPlanningVersion(this);
	request.setInvalidatingResultSet(requestType.isInvalidatingResultSet());
	return request;
};
oFF.PlanningVersion.prototype.createVersionSettings = function()
{
	return oFF.PlanningVersionSettings.create(this, this.getActionSequenceId(), this.getUseExternalView());
};
oFF.PlanningVersion.prototype.discardActionSequence = function(syncType, emptyListener, identifier)
{
	let versions = oFF.XCollectionUtils.singletonList(this);
	return this.getPlanningModel().discardActionSequences(versions, syncType, emptyListener, identifier);
};
oFF.PlanningVersion.prototype.drop = function()
{
	this.checkModelInitialized();
	let command = this.createRequestVersion(oFF.PlanningModelRequestType.DROP_VERSION);
	let commandResult = command.processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(commandResult.getData(), commandResult);
};
oFF.PlanningVersion.prototype.endActionSequence = function()
{
	this.checkModelInitialized();
	let command = this.createRequestVersion(oFF.PlanningModelRequestType.END_ACTION_SEQUENCE);
	let commandResult = command.processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(commandResult.getData(), commandResult);
};
oFF.PlanningVersion.prototype.getAction = function(actionIdentifier)
{
	return this.getPlanningModel().getAction(actionIdentifier);
};
oFF.PlanningVersion.prototype.getActionEndTime = function()
{
	return this.m_actionEndTime;
};
oFF.PlanningVersion.prototype.getActionIdentifier = function(actionId)
{
	this.checkModelInitialized();
	return this.getPlanningModel().getActionIdentifierById(actionId, this);
};
oFF.PlanningVersion.prototype.getActionIdentifiers = function()
{
	this.checkModelInitialized();
	let result = oFF.XList.create();
	let actionMetadataList = this.getPlanningModel().getActionMetadataList();
	for (let i = 0; i < actionMetadataList.size(); i++)
	{
		let actionMetadata = actionMetadataList.get(i);
		let actionIdentifier = this.getActionIdentifier(actionMetadata.getActionId());
		if (oFF.isNull(actionIdentifier))
		{
			continue;
		}
		result.add(actionIdentifier);
	}
	return result;
};
oFF.PlanningVersion.prototype.getActionSequenceCreateTime = function()
{
	return this.m_sequenceCreateTime;
};
oFF.PlanningVersion.prototype.getActionSequenceDescription = function()
{
	return this.m_sequenceDescription;
};
oFF.PlanningVersion.prototype.getActionSequenceId = function()
{
	return this.m_actionSequenceId;
};
oFF.PlanningVersion.prototype.getActionSequences = function(syncType, actionSequenceListListener, identifier)
{
	let messageManager = oFF.MessageManagerSimple.createMessageManager();
	let resultCollector = oFF.XList.create();
	let biConsumer = (a, b) => {
		messageManager.addAllMessages(b);
		let subResult;
		if (b.isValid())
		{
			subResult = oFF.ExtResult.create(a, messageManager);
		}
		else
		{
			messageManager.addError(-4, "An fatal error occured");
			subResult = oFF.ExtResult.create(null, messageManager);
		}
		resultCollector.add(subResult);
		if (oFF.notNull(actionSequenceListListener))
		{
			actionSequenceListListener.onPlanningActionSequencesFetched(subResult, a, identifier);
		}
	};
	oFF.EpmPlanningVersionRestAccessor.getActionSequencesForPlanningVersion(this.getPlanningModel(), this.getVersionKey(), syncType, biConsumer);
	return oFF.XCollectionUtils.size(resultCollector) === 1 ? resultCollector.get(0) : null;
};
oFF.PlanningVersion.prototype.getActionStartTime = function()
{
	return this.m_actionStartTime;
};
oFF.PlanningVersion.prototype.getBackupTime = function()
{
	return this.m_backupTime;
};
oFF.PlanningVersion.prototype.getCategory = function()
{
	return this.m_category;
};
oFF.PlanningVersion.prototype.getCreationTime = function()
{
	return this.m_creationTime;
};
oFF.PlanningVersion.prototype.getIsRestrictionEnabled = function()
{
	return this.m_isRestrictionEnabled;
};
oFF.PlanningVersion.prototype.getOwnerDisplayName = function()
{
	return this.m_ownerDisplayName;
};
oFF.PlanningVersion.prototype.getParameters = function()
{
	if (oFF.isNull(this.m_parametersStructure))
	{
		return oFF.XHashMapByString.create();
	}
	return oFF.PlanningVersion.parametersStructure2ParametersStringMap(this.m_parametersStructure);
};
oFF.PlanningVersion.prototype.getParametersStructure = function()
{
	if (oFF.isNull(this.m_parametersStructure))
	{
		return oFF.PrFactory.createStructure();
	}
	return oFF.PrFactory.createStructureDeepCopy(this.m_parametersStructure);
};
oFF.PlanningVersion.prototype.getPlanningModel = function()
{
	return this.m_planningModel;
};
oFF.PlanningVersion.prototype.getPrivilege = function()
{
	return this.m_privilege;
};
oFF.PlanningVersion.prototype.getSourceVersionName = function()
{
	return this.m_sourceVersionName;
};
oFF.PlanningVersion.prototype.getTotalChangesSize = function()
{
	return this.m_totalChangesSize;
};
oFF.PlanningVersion.prototype.getUndoChangesSize = function()
{
	return this.m_undoChangesSize;
};
oFF.PlanningVersion.prototype.getUndoRedoStates = function(syncType, versionStateListListener, identifier)
{
	let messageManager = oFF.MessageManagerSimple.createMessageManager();
	let resultCollector = oFF.XList.create();
	let biConsumer = (a, b) => {
		messageManager.addAllMessages(b);
		let subResult;
		if (b.isValid())
		{
			subResult = oFF.ExtResult.create(a, messageManager);
		}
		else
		{
			messageManager.addError(-4, "An fatal error occured");
			subResult = oFF.ExtResult.create(null, messageManager);
		}
		resultCollector.add(subResult);
		if (oFF.notNull(versionStateListListener))
		{
			versionStateListListener.onPlanningVersionStateListFetched(subResult, a, identifier);
		}
	};
	oFF.EpmPlanningVersionRestAccessor.getUndoRedoStates(this.getPlanningModel(), this.getVersionKey(), syncType, biConsumer);
	return oFF.XCollectionUtils.size(resultCollector) === 1 ? resultCollector.get(0) : null;
};
oFF.PlanningVersion.prototype.getUseExternalView = function()
{
	return this.m_useExternalView;
};
oFF.PlanningVersion.prototype.getUserName = function()
{
	return this.m_userName;
};
oFF.PlanningVersion.prototype.getVersionDescription = function()
{
	return this.m_versionDescription;
};
oFF.PlanningVersion.prototype.getVersionId = function()
{
	return this.m_versionIdentifier.getVersionId();
};
oFF.PlanningVersion.prototype.getVersionKey = function()
{
	return this.m_versionIdentifier.getVersionKey();
};
oFF.PlanningVersion.prototype.getVersionOwner = function()
{
	return this.m_versionIdentifier.getVersionOwner();
};
oFF.PlanningVersion.prototype.getVersionState = function()
{
	return this.m_versionState;
};
oFF.PlanningVersion.prototype.getVersionUniqueName = function()
{
	return this.m_versionIdentifier.getVersionUniqueName();
};
oFF.PlanningVersion.prototype.getWorkflowState = function()
{
	return this.m_workflowState;
};
oFF.PlanningVersion.prototype.goToUndoRedoState = function(stateId, syncType, emptyListener, identifier)
{
	let messageManager = oFF.MessageManagerSimple.createMessageManager();
	let resultCollector = oFF.XList.create();
	let consumer = (a) => {
		messageManager.addAllMessages(a);
		let subResult;
		if (a.isValid())
		{
			subResult = oFF.ExtResult.create(oFF.XBooleanValue.create(true), messageManager);
		}
		else
		{
			messageManager.addError(-4, "An fatal error occurred");
			subResult = oFF.ExtResult.create(oFF.XBooleanValue.create(false), messageManager);
		}
		resultCollector.add(subResult);
		if (oFF.notNull(emptyListener))
		{
			emptyListener.onPlanningVersionActionExecuted(subResult, subResult.getData().getBoolean(), identifier);
		}
	};
	oFF.EpmPlanningVersionRestAccessor.gotoUndoRedoState(this.getPlanningModel(), this.getVersionKey(), stateId, syncType, consumer);
	return oFF.XCollectionUtils.size(resultCollector) === 1 ? resultCollector.get(0) : null;
};
oFF.PlanningVersion.prototype.hasPlanningArea = function()
{
	return this.m_hasPlanningArea;
};
oFF.PlanningVersion.prototype.initializeVersion = function(restoreBackupType)
{
	this.checkModelInitialized();
	return this.initializeVersionWithParameters(restoreBackupType, null);
};
oFF.PlanningVersion.prototype.initializeVersionWithParameters = function(restoreBackupType, parameters)
{
	let parametersStructure = oFF.PlanningVersion.parametersStringMap2ParametersStructure(parameters);
	if (oFF.notNull(parameters))
	{
		parametersStructure = oFF.PrFactory.createStructure();
		let keys = parameters.getKeysAsIterator();
		while (keys.hasNext())
		{
			let key = keys.next();
			let value = parameters.getByKey(key);
			parametersStructure.putString(key, value);
		}
	}
	return this.initializeVersionWithParametersJson(restoreBackupType, parametersStructure);
};
oFF.PlanningVersion.prototype.initializeVersionWithParametersJson = function(restoreBackupType, parametersJson)
{
	this.checkModelInitialized();
	let command = this.createRequestVersion(oFF.PlanningModelRequestType.INIT_VERSION);
	command.setRestoreBackupType(restoreBackupType);
	if (this.getPlanningModel().supportsVersionParameters())
	{
		command.setVersionParametersAsJson(parametersJson);
	}
	let commandResult = command.processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(commandResult.getData(), commandResult);
};
oFF.PlanningVersion.prototype.invalidateVersion = function()
{
	this.m_creationTime = null;
	this.m_backupTime = null;
	this.m_parametersStructure = oFF.XObjectExt.release(this.m_parametersStructure);
	this.m_privilege = null;
	this.m_versionDescription = null;
	this.m_category = null;
	this.m_ownerDisplayName = null;
	this.m_versionState = null;
};
oFF.PlanningVersion.prototype.isActionActive = function()
{
	return this.m_actionActive;
};
oFF.PlanningVersion.prototype.isActionSequenceActive = function()
{
	return this.m_sequenceActive;
};
oFF.PlanningVersion.prototype.isActive = function()
{
	let planningVersionState = this.getVersionState();
	if (oFF.isNull(planningVersionState))
	{
		return false;
	}
	return planningVersionState.isActive();
};
oFF.PlanningVersion.prototype.isDacWriteEnabled = function()
{
	return this.m_dacWriteEnabled;
};
oFF.PlanningVersion.prototype.isEqualTo = function(other)
{
	if (oFF.isNull(other))
	{
		return false;
	}
	let otherVersion = other;
	if (otherVersion.getPlanningModel() !== this.getPlanningModel())
	{
		return false;
	}
	if (!oFF.XString.isEqual(otherVersion.getVersionUniqueName(), this.getVersionUniqueName()))
	{
		return false;
	}
	if (otherVersion.getVersionState() !== this.getVersionState())
	{
		return false;
	}
	if (otherVersion.isActive() !== this.isActive())
	{
		return false;
	}
	return true;
};
oFF.PlanningVersion.prototype.isHasExternalStorage = function()
{
	return this.m_hasExternalStorage;
};
oFF.PlanningVersion.prototype.isInPublicEditMode = function()
{
	return this.m_inPublicEditMode;
};
oFF.PlanningVersion.prototype.isSharedVersion = function()
{
	return this.m_versionIdentifier.isSharedVersion();
};
oFF.PlanningVersion.prototype.isShowingAsPublicVersion = function()
{
	return this.m_isShowingAsPublicVersion;
};
oFF.PlanningVersion.prototype.isWriteBackEnabled = function()
{
	return this.m_writeBackEnabled;
};
oFF.PlanningVersion.prototype.killActionSequence = function()
{
	this.checkModelInitialized();
	return this.processVersionRequest(oFF.PlanningModelRequestType.KILL_ACTION_SEQUENCE);
};
oFF.PlanningVersion.prototype.navigateUndoRedoState = function(navigationOffset, syncType, emptyListener, identifier)
{
	let messageManager = oFF.MessageManagerSimple.createMessageManager();
	let resultCollector = oFF.XList.create();
	let consumer = (a) => {
		messageManager.addAllMessages(a);
		let subResult;
		if (a.isValid())
		{
			subResult = oFF.ExtResult.create(oFF.XBooleanValue.create(true), messageManager);
		}
		else
		{
			messageManager.addError(-4, "An fatal error occurred");
			subResult = oFF.ExtResult.create(oFF.XBooleanValue.create(false), messageManager);
		}
		resultCollector.add(subResult);
		if (oFF.notNull(emptyListener))
		{
			emptyListener.onPlanningVersionActionExecuted(subResult, subResult.getData().getBoolean(), identifier);
		}
	};
	oFF.EpmPlanningVersionRestAccessor.navigateUndoRedoState(this.getPlanningModel(), this.getVersionKey(), navigationOffset, syncType, consumer);
	return oFF.XCollectionUtils.size(resultCollector) === 1 ? resultCollector.get(0) : null;
};
oFF.PlanningVersion.prototype.processVersionRequest = function(planningModelRequestType)
{
	this.checkModelInitialized();
	let command = this.createRequestVersion(planningModelRequestType);
	let commandResult = command.processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(commandResult.getData(), commandResult);
};
oFF.PlanningVersion.prototype.redo = function()
{
	this.checkModelInitialized();
	return this.processVersionRequest(oFF.PlanningModelRequestType.REDO_VERSION);
};
oFF.PlanningVersion.prototype.releaseObject = function()
{
	this.m_planningModel = null;
	this.m_versionIdentifier = oFF.XObjectExt.release(this.m_versionIdentifier);
	this.m_versionDescription = null;
	this.m_category = null;
	this.m_ownerDisplayName = null;
	this.m_versionState = null;
	this.m_privilege = null;
	this.m_parametersStructure = oFF.XObjectExt.release(this.m_parametersStructure);
	this.m_creationTime = oFF.XObjectExt.release(this.m_creationTime);
	this.m_backupTime = oFF.XObjectExt.release(this.m_backupTime);
	this.m_sequenceCreateTime = oFF.XObjectExt.release(this.m_sequenceCreateTime);
	this.m_actionStartTime = oFF.XObjectExt.release(this.m_actionStartTime);
	this.m_actionEndTime = oFF.XObjectExt.release(this.m_actionEndTime);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.PlanningVersion.prototype.reset = function()
{
	this.checkModelInitialized();
	return this.processVersionRequest(oFF.PlanningModelRequestType.RESET_VERSION);
};
oFF.PlanningVersion.prototype.resetVersionState = function()
{
	this.m_versionState = null;
};
oFF.PlanningVersion.prototype.restoreFromSuspension = function(syncType, emptyListener, identifier)
{
	let messageManager = oFF.MessageManagerSimple.createMessageManager();
	let resultCollector = oFF.XList.create();
	let consumer = (a) => {
		messageManager.addAllMessages(a);
		let subResult;
		if (a.isValid())
		{
			subResult = oFF.ExtResult.create(oFF.XBooleanValue.create(true), messageManager);
		}
		else
		{
			messageManager.addError(-4, "An fatal error occurred");
			subResult = oFF.ExtResult.create(oFF.XBooleanValue.create(false), messageManager);
		}
		resultCollector.add(subResult);
		if (oFF.notNull(emptyListener))
		{
			emptyListener.onPlanningVersionActionExecuted(subResult, subResult.getData().getBoolean(), identifier);
		}
	};
	oFF.EpmPlanningVersionRestAccessor.restoreFromSuspension(this.getPlanningModel(), this.getVersionKey(), syncType, consumer);
	return oFF.XCollectionUtils.size(resultCollector) === 1 ? resultCollector.get(0) : null;
};
oFF.PlanningVersion.prototype.setActionActive = function(actionActive)
{
	this.m_actionActive = actionActive;
};
oFF.PlanningVersion.prototype.setActionEndTime = function(actionEndTime)
{
	this.m_actionEndTime = actionEndTime;
};
oFF.PlanningVersion.prototype.setActionSequenceActive = function(sequenceActive)
{
	this.m_sequenceActive = sequenceActive;
	if (!this.m_sequenceActive)
	{
		this.m_sequenceCreateTime = null;
		this.m_sequenceDescription = null;
		this.m_actionSequenceId = null;
	}
};
oFF.PlanningVersion.prototype.setActionSequenceCreateTime = function(sequenceCreateTime)
{
	this.m_sequenceCreateTime = sequenceCreateTime;
};
oFF.PlanningVersion.prototype.setActionSequenceDescription = function(sequenceDescription)
{
	this.m_sequenceDescription = sequenceDescription;
};
oFF.PlanningVersion.prototype.setActionSequenceId = function(sequenceId)
{
	this.m_actionSequenceId = sequenceId;
};
oFF.PlanningVersion.prototype.setActionStartTime = function(actionStartTime)
{
	this.m_actionStartTime = actionStartTime;
};
oFF.PlanningVersion.prototype.setBackupTime = function(backupTime)
{
	this.m_backupTime = backupTime;
};
oFF.PlanningVersion.prototype.setCategory = function(category)
{
	this.m_category = category;
};
oFF.PlanningVersion.prototype.setCreationTime = function(creationTime)
{
	this.m_creationTime = creationTime;
};
oFF.PlanningVersion.prototype.setDacWriteEnabled = function(dacWriteEnabled)
{
	this.m_dacWriteEnabled = dacWriteEnabled;
};
oFF.PlanningVersion.prototype.setHasExternalStorage = function(hasExternalStorage)
{
	this.m_hasExternalStorage = hasExternalStorage;
};
oFF.PlanningVersion.prototype.setHasPlanningArea = function(hasDataArea)
{
	this.m_hasPlanningArea = hasDataArea;
};
oFF.PlanningVersion.prototype.setInPublicEditMode = function(inPublicEditMode)
{
	this.m_inPublicEditMode = inPublicEditMode;
};
oFF.PlanningVersion.prototype.setIsRestrictionEnabled = function(restrictionEnabled)
{
	this.m_isRestrictionEnabled = restrictionEnabled;
};
oFF.PlanningVersion.prototype.setOwnerDisplayName = function(ownerDisplayName)
{
	this.m_ownerDisplayName = ownerDisplayName;
};
oFF.PlanningVersion.prototype.setParametersStructureInternal = function(parametersStructure)
{
	if (oFF.isNull(parametersStructure))
	{
		this.m_parametersStructure = null;
	}
	else
	{
		this.m_parametersStructure = oFF.PrFactory.createStructureDeepCopy(parametersStructure);
	}
};
oFF.PlanningVersion.prototype.setPlanningModel = function(planningModel)
{
	this.m_planningModel = planningModel;
};
oFF.PlanningVersion.prototype.setPrivilege = function(privilege)
{
	oFF.XObjectExt.assertNotNullExt(privilege, "illegal privilege");
	this.m_privilege = privilege;
};
oFF.PlanningVersion.prototype.setShowingAsPublicVersion = function(isShowingAsPublicVersion)
{
	this.m_isShowingAsPublicVersion = isShowingAsPublicVersion;
};
oFF.PlanningVersion.prototype.setSourceVersionName = function(sourceVersionName)
{
	this.m_sourceVersionName = sourceVersionName;
};
oFF.PlanningVersion.prototype.setTimeout = function(seconds)
{
	this.checkModelInitialized();
	let command = this.createRequestVersion(oFF.PlanningModelRequestType.SET_TIMEOUT);
	command.setTimeout(seconds);
	let commandResult = command.processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(commandResult.getData(), commandResult);
};
oFF.PlanningVersion.prototype.setTotalChangesSize = function(undoSize)
{
	this.m_totalChangesSize = undoSize;
};
oFF.PlanningVersion.prototype.setUndoChangesSize = function(redoSize)
{
	this.m_undoChangesSize = redoSize;
};
oFF.PlanningVersion.prototype.setUseExternalView = function(useExternalView)
{
	if (this.m_useExternalView === useExternalView)
	{
		return;
	}
	this.m_useExternalView = useExternalView;
	this.getPlanningModel().invalidate();
};
oFF.PlanningVersion.prototype.setUserName = function(userName)
{
	this.m_userName = userName;
};
oFF.PlanningVersion.prototype.setVersionDescription = function(versionDescription)
{
	if (this.getPlanningModel().isWithUniqueVersionDescriptions())
	{
		this.assertVersionDescriptionUniqueAndNotNullOrEmpty(versionDescription);
	}
	this.m_versionDescription = versionDescription;
};
oFF.PlanningVersion.prototype.setVersionIdentifier = function(versionIdentifier)
{
	this.m_versionIdentifier = this.getPlanningModel().copyVersionIdentifier(versionIdentifier);
};
oFF.PlanningVersion.prototype.setVersionState = function(versionState)
{
	oFF.XObjectExt.assertNotNullExt(versionState, "illegal version state");
	this.m_versionState = versionState;
	if (oFF.isNull(this.m_privilege))
	{
		if (this.isSharedVersion())
		{
			throw oFF.XException.createIllegalStateException("illegal privilege");
		}
		this.m_privilege = oFF.PlanningPrivilege.OWNER;
	}
};
oFF.PlanningVersion.prototype.setWorkflowState = function(workflowState)
{
	this.m_workflowState = workflowState;
};
oFF.PlanningVersion.prototype.setWriteBackEnabled = function(writeBackEnabled)
{
	this.m_writeBackEnabled = writeBackEnabled;
};
oFF.PlanningVersion.prototype.startActionSequence = function()
{
	this.checkModelInitialized();
	let command = this.createRequestVersion(oFF.PlanningModelRequestType.START_ACTION_SEQUENCE);
	let commandResult = command.processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(commandResult.getData(), commandResult);
};
oFF.PlanningVersion.prototype.toString = function()
{
	let sb = oFF.XStringBuffer.create();
	sb.append("Id  : ");
	sb.append(this.m_versionIdentifier.getVersionUniqueName());
	sb.append(", Active : ");
	sb.append(oFF.XBoolean.convertToString(this.isActive()));
	sb.append(", State : ");
	if (oFF.isNull(this.m_versionState))
	{
		sb.append("null");
	}
	else
	{
		sb.append(this.m_versionState.getName());
	}
	return sb.toString();
};
oFF.PlanningVersion.prototype.undo = function()
{
	this.checkModelInitialized();
	return this.processVersionRequest(oFF.PlanningModelRequestType.UNDO_VERSION);
};
oFF.PlanningVersion.prototype.updateInvalidPrivileges = function()
{
	if (oFF.notNull(this.m_versionState))
	{
		return;
	}
	let planningModel = this.getPlanningModel();
	if (oFF.notNull(planningModel) && planningModel.isVersionPrivilegesInitialized())
	{
		let privileges = planningModel.getVersionPrivileges();
		if (oFF.notNull(privileges))
		{
			for (let i = 0; i < privileges.size(); i++)
			{
				let privilege = privileges.get(i);
				if (oFF.XString.isEqual(privilege.getVersionUniqueName(), this.getVersionUniqueName()))
				{
					privilege.setPrivilegeState(oFF.PlanningPrivilegeState.NEW);
					privilege.setPrivilegeStateServer(oFF.PlanningPrivilegeState.NEW);
				}
			}
		}
	}
};
oFF.PlanningVersion.prototype.updateParameters = function()
{
	this.checkModelInitialized();
	let command = this.createRequestVersion(oFF.PlanningModelRequestType.UPDATE_PARAMETERS);
	let commandResult = command.processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(commandResult.getData(), commandResult);
};

oFF.EpmActionParameter = function() {};
oFF.EpmActionParameter.prototype = new oFF.DfNameTextObject();
oFF.EpmActionParameter.prototype._ff_c = "EpmActionParameter";

oFF.EpmActionParameter.prototype.m_inputEnabled = false;
oFF.EpmActionParameter.prototype.m_mandatory = false;
oFF.EpmActionParameter.prototype.m_multiValue = false;
oFF.EpmActionParameter.prototype.isInputEnabled = function()
{
	return this.m_inputEnabled;
};
oFF.EpmActionParameter.prototype.isMandatory = function()
{
	return this.m_mandatory;
};
oFF.EpmActionParameter.prototype.isMemberParameter = function()
{
	return false;
};
oFF.EpmActionParameter.prototype.isMultiValue = function()
{
	return this.m_multiValue;
};
oFF.EpmActionParameter.prototype.isValueParameter = function()
{
	return false;
};
oFF.EpmActionParameter.prototype.setInputEnabled = function(inputEnabled)
{
	this.m_inputEnabled = inputEnabled;
};
oFF.EpmActionParameter.prototype.setMandatory = function(mandatory)
{
	this.m_mandatory = mandatory;
};
oFF.EpmActionParameter.prototype.setMultiValue = function(multiValue)
{
	this.m_multiValue = multiValue;
};

oFF.EpmActionMemberParameter = function() {};
oFF.EpmActionMemberParameter.prototype = new oFF.EpmActionParameter();
oFF.EpmActionMemberParameter.prototype._ff_c = "EpmActionMemberParameter";

oFF.EpmActionMemberParameter.create = function(name, text, cubeName, dimensionName, multiValue, inputEnabled, mandatory)
{
	let instance = new oFF.EpmActionMemberParameter();
	instance.setupWithNameText(name, text);
	instance.setupWithDimensionMetadata(cubeName, dimensionName);
	instance.setMultiValue(multiValue);
	instance.setInputEnabled(inputEnabled);
	instance.setMandatory(mandatory);
	return instance;
};
oFF.EpmActionMemberParameter.prototype.m_allowAllMembers = false;
oFF.EpmActionMemberParameter.prototype.m_cubeName = null;
oFF.EpmActionMemberParameter.prototype.m_defaultHierarchyName = null;
oFF.EpmActionMemberParameter.prototype.m_defaultLevelFieldNames = null;
oFF.EpmActionMemberParameter.prototype.m_defaultMemberValues = null;
oFF.EpmActionMemberParameter.prototype.m_dimensionName = null;
oFF.EpmActionMemberParameter.prototype.m_hierarchyName = null;
oFF.EpmActionMemberParameter.prototype.m_hierarchyNameFixed = false;
oFF.EpmActionMemberParameter.prototype.m_levelFieldNames = null;
oFF.EpmActionMemberParameter.prototype.m_memberValues = null;
oFF.EpmActionMemberParameter.prototype.m_restrictToLeafMembers = false;
oFF.EpmActionMemberParameter.prototype.addDefaultLevelFieldName = function(fieldName)
{
	this.m_defaultLevelFieldNames.add(fieldName);
};
oFF.EpmActionMemberParameter.prototype.addLevelFieldName = function(fieldName)
{
	this.m_levelFieldNames.add(fieldName);
};
oFF.EpmActionMemberParameter.prototype.addNewDefaultMemberValueItem = function(valueItem)
{
	if (this.m_defaultMemberValues.size() === 0)
	{
		this.pushNewDefaultMemberValue();
	}
	let lastValue = this.m_defaultMemberValues.get(this.m_defaultMemberValues.size() - 1);
	lastValue.add(valueItem);
};
oFF.EpmActionMemberParameter.prototype.addNewMemberValueItem = function(valueItem)
{
	if (this.m_memberValues.size() === 0)
	{
		this.pushNewMemberValue();
	}
	let lastValue = this.m_memberValues.get(this.m_memberValues.size() - 1);
	lastValue.add(valueItem);
};
oFF.EpmActionMemberParameter.prototype.clearDefaultLevelFieldNames = function()
{
	this.m_defaultLevelFieldNames.clear();
};
oFF.EpmActionMemberParameter.prototype.clearDefaultMemberValues = function()
{
	this.m_defaultMemberValues.clear();
};
oFF.EpmActionMemberParameter.prototype.clearLevelFieldNames = function()
{
	this.m_levelFieldNames.clear();
};
oFF.EpmActionMemberParameter.prototype.clearMemberValues = function()
{
	this.m_memberValues.clear();
};
oFF.EpmActionMemberParameter.prototype.getCubeName = function()
{
	return this.m_cubeName;
};
oFF.EpmActionMemberParameter.prototype.getDefaultHierarchyName = function()
{
	return this.m_defaultHierarchyName;
};
oFF.EpmActionMemberParameter.prototype.getDefaultLevelFieldNames = function()
{
	return this.m_defaultLevelFieldNames;
};
oFF.EpmActionMemberParameter.prototype.getDefaultMemberValues = function()
{
	return this.m_defaultMemberValues;
};
oFF.EpmActionMemberParameter.prototype.getDimensionName = function()
{
	return this.m_dimensionName;
};
oFF.EpmActionMemberParameter.prototype.getHierarchyName = function()
{
	return this.m_hierarchyName;
};
oFF.EpmActionMemberParameter.prototype.getLevelFieldNames = function()
{
	return this.m_levelFieldNames;
};
oFF.EpmActionMemberParameter.prototype.getMemberValues = function()
{
	return this.m_memberValues;
};
oFF.EpmActionMemberParameter.prototype.getValueType = function()
{
	return oFF.XValueType.DIMENSION_MEMBER;
};
oFF.EpmActionMemberParameter.prototype.isAllowAllMembers = function()
{
	return this.m_allowAllMembers;
};
oFF.EpmActionMemberParameter.prototype.isHierarchyNameFixed = function()
{
	return this.m_hierarchyNameFixed;
};
oFF.EpmActionMemberParameter.prototype.isMemberParameter = function()
{
	return true;
};
oFF.EpmActionMemberParameter.prototype.isRestrictToLeafMembers = function()
{
	return this.m_restrictToLeafMembers;
};
oFF.EpmActionMemberParameter.prototype.pushNewDefaultMemberValue = function()
{
	this.m_defaultMemberValues.add(oFF.XList.create());
};
oFF.EpmActionMemberParameter.prototype.pushNewMemberValue = function()
{
	this.m_memberValues.add(oFF.XList.create());
};
oFF.EpmActionMemberParameter.prototype.setAllowAllMembers = function(allowAllMembers)
{
	this.m_allowAllMembers = allowAllMembers;
};
oFF.EpmActionMemberParameter.prototype.setCubeName = function(cubeName)
{
	this.m_cubeName = cubeName;
};
oFF.EpmActionMemberParameter.prototype.setDefaultHierarchyName = function(defaultHierarchyName)
{
	this.m_defaultHierarchyName = defaultHierarchyName;
};
oFF.EpmActionMemberParameter.prototype.setDimensionName = function(dimensionName)
{
	this.m_dimensionName = dimensionName;
};
oFF.EpmActionMemberParameter.prototype.setHierarchyName = function(hierarchyName)
{
	this.m_hierarchyName = hierarchyName;
};
oFF.EpmActionMemberParameter.prototype.setHierarchyNameFixed = function(hierarchyNameFixed)
{
	this.m_hierarchyNameFixed = hierarchyNameFixed;
};
oFF.EpmActionMemberParameter.prototype.setRestrictToLeafMembers = function(restrictToLeafMembers)
{
	this.m_restrictToLeafMembers = restrictToLeafMembers;
};
oFF.EpmActionMemberParameter.prototype.setupWithDimensionMetadata = function(cubeName, dimensionName)
{
	this.setCubeName(cubeName);
	this.setDimensionName(dimensionName);
	this.m_defaultLevelFieldNames = oFF.XList.create();
	this.m_defaultMemberValues = oFF.XList.create();
	this.m_levelFieldNames = oFF.XList.create();
	this.m_memberValues = oFF.XList.create();
};

oFF.EpmActionValueParameter = function() {};
oFF.EpmActionValueParameter.prototype = new oFF.EpmActionParameter();
oFF.EpmActionValueParameter.prototype._ff_c = "EpmActionValueParameter";

oFF.EpmActionValueParameter.create = function(valueType, name, text, multiValue, inputEnabled, mandatory)
{
	let instance = new oFF.EpmActionValueParameter();
	instance.setupWithNameText(name, text);
	instance.setupWithValueType(valueType);
	instance.setMultiValue(multiValue);
	instance.setInputEnabled(inputEnabled);
	instance.setMandatory(mandatory);
	return instance;
};
oFF.EpmActionValueParameter.prototype.m_defaultValues = null;
oFF.EpmActionValueParameter.prototype.m_valueType = null;
oFF.EpmActionValueParameter.prototype.m_values = null;
oFF.EpmActionValueParameter.prototype.addDefaultValue = function(value)
{
	this.m_defaultValues.add(value);
};
oFF.EpmActionValueParameter.prototype.addValue = function(value)
{
	this.m_values.add(value);
};
oFF.EpmActionValueParameter.prototype.clearDefaultValues = function()
{
	this.m_defaultValues.clear();
};
oFF.EpmActionValueParameter.prototype.clearValues = function()
{
	this.m_values.clear();
};
oFF.EpmActionValueParameter.prototype.getDefaultValues = function()
{
	return this.m_defaultValues;
};
oFF.EpmActionValueParameter.prototype.getValueType = function()
{
	return this.m_valueType;
};
oFF.EpmActionValueParameter.prototype.getValues = function()
{
	return this.m_values;
};
oFF.EpmActionValueParameter.prototype.isValueParameter = function()
{
	return true;
};
oFF.EpmActionValueParameter.prototype.setupWithValueType = function(valueType)
{
	this.m_valueType = valueType;
	this.m_values = oFF.XList.create();
	this.m_defaultValues = oFF.XList.create();
};

oFF.PlanningService = function() {};
oFF.PlanningService.prototype = new oFF.DfService();
oFF.PlanningService.prototype._ff_c = "PlanningService";

oFF.PlanningService.CLAZZ = null;
oFF.PlanningService.s_capabilitiesProviderFactory = null;
oFF.PlanningService.staticSetup = function()
{
	oFF.PlanningService.CLAZZ = oFF.XClass.create(oFF.PlanningService);
};
oFF.PlanningService.prototype.m_capabilitiesProvider = null;
oFF.PlanningService.prototype.m_initialized = false;
oFF.PlanningService.prototype.m_planningContext = null;
oFF.PlanningService.prototype._setInitialized = function(planningContext)
{
	if (this.m_initialized)
	{
		throw oFF.XException.createInitializationException();
	}
	this.m_initialized = true;
	this.m_planningContext = planningContext;
	this.setData(this);
	this.endSync();
};
oFF.PlanningService.prototype.getActiveCapabilities = function()
{
	return this.m_capabilitiesProvider.getActiveCapabilities();
};
oFF.PlanningService.prototype.getInaCapabilities = function()
{
	return this.m_capabilitiesProvider;
};
oFF.PlanningService.prototype.getOlapEnv = function()
{
	return this.getApplication().getOlapEnvironment();
};
oFF.PlanningService.prototype.getPlanningContext = function()
{
	this.initializeContext(oFF.SyncType.BLOCKING);
	return this.m_planningContext;
};
oFF.PlanningService.prototype.getPlanningServiceConfig = function()
{
	return this.getServiceConfig();
};
oFF.PlanningService.prototype.initializeContext = function(syncType)
{
	if (this.m_initialized)
	{
		return;
	}
	this.getConnection().getSystemConnect().getServerMetadataExt(syncType, this, syncType);
};
oFF.PlanningService.prototype.isInitialized = function()
{
	return this.m_initialized;
};
oFF.PlanningService.prototype.isServiceConfigMatching = function(serviceConfig, connection, messages)
{
	let serviceConfigPlanning = serviceConfig;
	let systemType = serviceConfigPlanning.getSystemType();
	if (oFF.isNull(systemType))
	{
		messages.addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.INVALID_SYSTEM, "illegal system type", null);
		return false;
	}
	if (systemType.isTypeOf(oFF.SystemType.BW))
	{
		let properties = serviceConfigPlanning.getProperties();
		let dataArea = properties.getStringByKeyExt(oFF.PlanningConstants.DATA_AREA, "DEFAULT");
		let environment = properties.getStringByKey(oFF.PlanningConstants.ENVIRONMENT);
		let model = properties.getStringByKey(oFF.PlanningConstants.MODEL);
		let cellLocking = oFF.CellLockingType.lookupWithDefault(properties.getStringByKey(oFF.PlanningConstants.CELL_LOCKING), oFF.CellLockingType.DEFAULT_SETTING_BACKEND);
		let dataAreaState = oFF.DataAreaState.getDataAreaStateByPlanningService(this);
		if (oFF.isNull(dataAreaState))
		{
			let application = serviceConfigPlanning.getApplication();
			let systemName = serviceConfigPlanning.getSystemName();
			dataAreaState = oFF.DataAreaState.createDataAreaState(application, systemName, dataArea, environment, model, cellLocking);
			if (oFF.isNull(dataAreaState))
			{
				messages.addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.INVALID_STATE, "illegal data area", properties);
				return false;
			}
		}
		else if (!dataAreaState.isEqualSettings(environment, model, cellLocking))
		{
			messages.addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.INVALID_STATE, "data area with different settings already existing", properties);
			return false;
		}
	}
	return true;
};
oFF.PlanningService.prototype.onServerMetadataLoaded = function(extResult, serverMetadata, customIdentifier)
{
	this.m_capabilitiesProvider = oFF.PlanningService.s_capabilitiesProviderFactory.create(this.getSession(), serverMetadata, oFF.ProviderType.PLANNING_COMMAND);
	let serviceConfig = this.getPlanningServiceConfig();
	let properties = serviceConfig.getProperties();
	let systemType = serviceConfig.getSystemType();
	if (systemType.isTypeOf(oFF.SystemType.BW))
	{
		let dataArea = oFF.DataArea.create();
		dataArea.setPlanningService(this);
		dataArea.setDataArea(properties.getStringByKeyExt(oFF.PlanningConstants.DATA_AREA, "DEFAULT"));
		dataArea.setEnvironment(properties.getStringByKey(oFF.PlanningConstants.ENVIRONMENT));
		dataArea.setModel(properties.getStringByKey(oFF.PlanningConstants.MODEL));
		dataArea.setCellLockingType(oFF.CellLockingType.lookupWithDefault(properties.getStringByKey(oFF.PlanningConstants.CELL_LOCKING), oFF.CellLockingType.DEFAULT_SETTING_BACKEND));
		this._setInitialized(dataArea);
	}
	if (systemType.isTypeOf(oFF.SystemType.HANA))
	{
		let planningModel = oFF.PlanningModel.create();
		planningModel.setPlanningService(this);
		planningModel.setPlanningModelSchema(properties.getStringByKey(oFF.PlanningConstants.PLANNING_SCHEMA));
		planningModel.setPlanningModelName(properties.getStringByKey(oFF.PlanningConstants.PLANNING_MODEL));
		planningModel.setPlanningModelBehaviour(oFF.PlanningModelBehaviour.lookupWithDefault(properties.getStringByKey(oFF.PlanningConstants.PLANNING_MODEL_BEHAVIOUR), oFF.PlanningModelBehaviour.STANDARD));
		planningModel.setBackendUserName(properties.getStringByKeyExt(oFF.PlanningConstants.BACKEND_USER_NAME, serviceConfig.getSystemDescription().getUser()));
		planningModel.setWithSharedVersions(properties.getBooleanByKeyExt(oFF.PlanningConstants.WITH_SHARED_VERSIONS, false));
		planningModel.setPersistenceType(oFF.PlanningPersistenceType.lookupWithDefault(properties.getStringByKeyExt(oFF.PlanningConstants.PERSISTENCE_TYPE, null), oFF.PlanningPersistenceType.DEFAULT));
		planningModel.initializePlanningModel(customIdentifier);
	}
};
oFF.PlanningService.prototype.processCommand = function(synchronizationType, planningCommand, callback, customIdentifier)
{
	return planningCommand.processCommand(synchronizationType, callback, customIdentifier);
};
oFF.PlanningService.prototype.processSynchronization = function(syncType)
{
	if (this.m_initialized)
	{
		return false;
	}
	this.initializeContext(syncType);
	return true;
};
oFF.PlanningService.prototype.releaseObjectInternal = function()
{
	this.releasePlanningContext();
	this.m_capabilitiesProvider = null;
	oFF.DfService.prototype.releaseObjectInternal.call( this );
};
oFF.PlanningService.prototype.releasePlanningContext = function()
{
	this.m_initialized = false;
	this.m_planningContext = oFF.XObjectExt.release(this.m_planningContext);
};
oFF.PlanningService.prototype.supportsPlanningValueHelp = function()
{
	let activeCapabilities = this.getActiveCapabilities();
	return activeCapabilities.containsKey(oFF.InACapabilities.C054_EXTENDED_SORT) && activeCapabilities.containsKey(oFF.InACapabilities.C100_EXPAND_BOTTOM_UP);
};
oFF.PlanningService.prototype.toString = function()
{
	let sb = oFF.XStringBuffer.create();
	let planningServiceConfig = this.getPlanningServiceConfig();
	if (oFF.notNull(planningServiceConfig))
	{
		sb.append(planningServiceConfig.toString());
	}
	return sb.toString();
};

oFF.PlanningContext = function() {};
oFF.PlanningContext.prototype = new oFF.QModelComponent();
oFF.PlanningContext.prototype._ff_c = "PlanningContext";

oFF.PlanningContext.prototype.m_planningService = null;
oFF.PlanningContext.prototype.backup = function()
{
	return this.executeCommandBlocking(oFF.PlanningContextCommandType.BACKUP);
};
oFF.PlanningContext.prototype.close = function()
{
	return this.executeCommandBlocking(oFF.PlanningContextCommandType.CLOSE);
};
oFF.PlanningContext.prototype.createCommandDocReset = function()
{
	return this.createPlanningContextCommand(oFF.PlanningContextCommandType.DOC_RESET);
};
oFF.PlanningContext.prototype.createCommandDocSave = function()
{
	return this.createPlanningContextCommand(oFF.PlanningContextCommandType.DOC_SAVE);
};
oFF.PlanningContext.prototype.createCommandHardDelete = function()
{
	return this.createPlanningContextCommand(oFF.PlanningContextCommandType.HARD_DELETE);
};
oFF.PlanningContext.prototype.createCommandRefresh = function()
{
	return this.createPlanningContextCommand(oFF.PlanningContextCommandType.REFRESH);
};
oFF.PlanningContext.prototype.createCommandReset = function()
{
	return this.createPlanningContextCommand(oFF.PlanningContextCommandType.RESET);
};
oFF.PlanningContext.prototype.createPlanningCommand = function(commandIdentifier)
{
	let extResult = this.createRequestCreateCommandWithId(commandIdentifier).processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(extResult.getData(), extResult);
};
oFF.PlanningContext.prototype.executeCommandBlocking = function(commandType)
{
	let command = this.createPlanningContextCommand(commandType);
	let commandResult = command.processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(commandResult.getData(), commandResult);
};
oFF.PlanningContext.prototype.getPlanningService = function()
{
	return this.m_planningService;
};
oFF.PlanningContext.prototype.hardDelete = function()
{
	return this.executeCommandBlocking(oFF.PlanningContextCommandType.HARD_DELETE);
};
oFF.PlanningContext.prototype.invalidate = function()
{
	let queryConsumerServices = this.getQueryConsumerServices();
	if (oFF.notNull(queryConsumerServices))
	{
		for (let i = 0; i < queryConsumerServices.size(); i++)
		{
			let queryManager = queryConsumerServices.get(i);
			queryManager.invalidateState();
		}
	}
};
oFF.PlanningContext.prototype.publish = function()
{
	return this.executeCommandBlocking(oFF.PlanningContextCommandType.PUBLISH);
};
oFF.PlanningContext.prototype.refresh = function()
{
	return this.executeCommandBlocking(oFF.PlanningContextCommandType.REFRESH);
};
oFF.PlanningContext.prototype.releaseObject = function()
{
	this.m_planningService = null;
	oFF.QModelComponent.prototype.releaseObject.call( this );
};
oFF.PlanningContext.prototype.reset = function()
{
	return this.executeCommandBlocking(oFF.PlanningContextCommandType.RESET);
};
oFF.PlanningContext.prototype.setPlanningService = function(planningService)
{
	this.m_planningService = planningService;
};
oFF.PlanningContext.prototype.toString = function()
{
	let sb = oFF.XStringBuffer.create();
	sb.appendLine(this.getPlanningContextType().toString());
	if (oFF.notNull(this.m_planningService))
	{
		sb.appendLine(this.m_planningService.toString());
	}
	sb.appendLine("Related query consumer services:");
	let queryConsumerServices = this.getQueryConsumerServices();
	if (oFF.notNull(queryConsumerServices))
	{
		for (let i = 0; i < queryConsumerServices.size(); i++)
		{
			let queryConsumerService = queryConsumerServices.get(i);
			sb.appendLine(queryConsumerService.toString());
		}
	}
	return sb.toString();
};

oFF.PlanningPropertiesObject = function() {};
oFF.PlanningPropertiesObject.prototype = new oFF.QModelComponent();
oFF.PlanningPropertiesObject.prototype._ff_c = "PlanningPropertiesObject";

oFF.PlanningPropertiesObject.prototype.m_properties = null;
oFF.PlanningPropertiesObject.prototype.getProperties = function()
{
	if (oFF.isNull(this.m_properties))
	{
		this.m_properties = oFF.XHashMapByString.create();
	}
	return this.m_properties;
};
oFF.PlanningPropertiesObject.prototype.getPropertiesCopy = function()
{
	let copy = null;
	if (oFF.notNull(this.m_properties))
	{
		copy = this.m_properties.createMapByStringCopy();
	}
	return copy;
};
oFF.PlanningPropertiesObject.prototype.getPropertyBoolean = function(propertyName)
{
	let objectValue = this.getPropertyObject(propertyName);
	if (oFF.isNull(objectValue))
	{
		return false;
	}
	return objectValue.getBoolean();
};
oFF.PlanningPropertiesObject.prototype.getPropertyInteger = function(propertyName)
{
	let objectValue = this.getPropertyObject(propertyName);
	if (oFF.isNull(objectValue))
	{
		return 0;
	}
	return objectValue.getInteger();
};
oFF.PlanningPropertiesObject.prototype.getPropertyObject = function(propertyName)
{
	return this.getProperties().getByKey(propertyName);
};
oFF.PlanningPropertiesObject.prototype.getPropertyString = function(propertyName)
{
	let objectValue = this.getPropertyObject(propertyName);
	if (oFF.isNull(objectValue))
	{
		return null;
	}
	return objectValue.getString();
};
oFF.PlanningPropertiesObject.prototype.releaseObject = function()
{
	this.m_properties = oFF.XObjectExt.release(this.m_properties);
	oFF.QModelComponent.prototype.releaseObject.call( this );
};
oFF.PlanningPropertiesObject.prototype.setProperties = function(properties)
{
	this.m_properties = properties;
};
oFF.PlanningPropertiesObject.prototype.setPropertyBoolean = function(propertyName, propertyValue)
{
	let objectValue = this.getPropertyObject(propertyName);
	if (oFF.isNull(objectValue))
	{
		objectValue = oFF.XBooleanValue.create(propertyValue);
		this.getProperties().put(propertyName, objectValue);
	}
	else
	{
		objectValue.setBoolean(propertyValue);
	}
};
oFF.PlanningPropertiesObject.prototype.setPropertyInteger = function(propertyName, propertyValue)
{
	let objectValue = this.getPropertyObject(propertyName);
	if (oFF.isNull(objectValue))
	{
		objectValue = oFF.XIntegerValue.create(propertyValue);
		this.getProperties().put(propertyName, objectValue);
	}
	else
	{
		objectValue.setInteger(propertyValue);
	}
};
oFF.PlanningPropertiesObject.prototype.setPropertyObject = function(propertyName, propertyValue)
{
	if (oFF.isNull(propertyValue))
	{
		this.getProperties().remove(propertyName);
	}
	else
	{
		this.getProperties().put(propertyName, propertyValue);
	}
};
oFF.PlanningPropertiesObject.prototype.setPropertyString = function(propertyName, propertyValue)
{
	let objectValue = this.getPropertyObject(propertyName);
	if (oFF.isNull(objectValue))
	{
		objectValue = oFF.XStringValue.create(propertyValue);
		this.getProperties().put(propertyName, objectValue);
	}
	else
	{
		objectValue.setString(propertyValue);
	}
};

oFF.PlanningServiceConfig = function() {};
oFF.PlanningServiceConfig.prototype = new oFF.DfServiceConfigClassic();
oFF.PlanningServiceConfig.prototype._ff_c = "PlanningServiceConfig";

oFF.PlanningServiceConfig.CLAZZ = null;
oFF.PlanningServiceConfig.staticSetup = function()
{
	oFF.PlanningServiceConfig.CLAZZ = oFF.XClass.create(oFF.PlanningServiceConfig);
};
oFF.PlanningServiceConfig.prototype.m_properties = null;
oFF.PlanningServiceConfig.prototype.getDataSource = function()
{
	let dataSource = oFF.QFactory.createDataSource();
	let properties = this.getProperties();
	if (properties.containsKey(oFF.PlanningConstants.PLANNING_MODEL))
	{
		dataSource.setType(oFF.MetaObjectType.PLANNING_MODEL);
		dataSource.setObjectName(properties.getStringByKey(oFF.PlanningConstants.PLANNING_MODEL));
		if (properties.contains(oFF.PlanningConstants.PLANNING_SCHEMA))
		{
			dataSource.setSchemaName(properties.getByKey(oFF.PlanningConstants.PLANNING_SCHEMA));
		}
	}
	else
	{
		if (properties.contains(oFF.PlanningConstants.MODEL))
		{
			dataSource.setModelName(oFF.PlanningConstants.MODEL);
		}
		if (properties.contains(oFF.PlanningConstants.ENVIRONMENT))
		{
			dataSource.setEnvironmentName(oFF.PlanningConstants.ENVIRONMENT);
		}
		let dataArea = null;
		if (properties.contains(oFF.PlanningConstants.DATA_AREA))
		{
			dataArea = properties.getByKey(oFF.PlanningConstants.DATA_AREA);
		}
		if (oFF.XStringUtils.isNullOrEmpty(dataArea))
		{
			dataArea = oFF.PlanningConstants.DATA_AREA_DEFAULT;
		}
		dataSource.setDataArea(dataArea);
	}
	return dataSource;
};
oFF.PlanningServiceConfig.prototype.getMatchingServiceForServiceName = function(serviceReferenceName)
{
	let properties = this.getProperties();
	let existingServices = oFF.XList.create();
	if (this.getSystemType().isTypeOf(oFF.SystemType.BW))
	{
		let dataArea = properties.getStringByKeyExt(oFF.PlanningConstants.DATA_AREA, "DEFAULT");
		existingServices = oFF.DataAreaUtil.getPlanningServices(this.getApplication(), this.getSystemName(), dataArea);
	}
	else if (this.getSystemType().isTypeOf(oFF.SystemType.HANA))
	{
		let planningSchema = properties.getStringByKey(oFF.PlanningConstants.PLANNING_SCHEMA);
		let planningModel = properties.getStringByKey(oFF.PlanningConstants.PLANNING_MODEL);
		existingServices = oFF.PlanningModelUtil.getPlanningServices(this.getApplication(), this.getSystemName(), planningSchema, planningModel);
	}
	let connectionContainer = this.getConnectionContainer();
	let tmpMessageMgr = oFF.MessageManager.createMessageManagerExt(this.getSession());
	for (let i = 0; i < existingServices.size(); i++)
	{
		let planningService = existingServices.get(i);
		if (planningService.isServiceConfigMatching(this, connectionContainer, tmpMessageMgr))
		{
			return planningService;
		}
	}
	return oFF.DfServiceConfigClassic.prototype.getMatchingServiceForServiceName.call( this , serviceReferenceName);
};
oFF.PlanningServiceConfig.prototype.getProperties = function()
{
	return this.m_properties;
};
oFF.PlanningServiceConfig.prototype.releaseObjectInternal = function()
{
	this.m_properties = oFF.XObjectExt.release(this.m_properties);
	oFF.DfServiceConfigClassic.prototype.releaseObjectInternal.call( this );
};
oFF.PlanningServiceConfig.prototype.setDataSource = function(dataSource)
{
	let properties = this.getProperties();
	properties.remove(oFF.PlanningConstants.PLANNING_MODEL);
	properties.remove(oFF.PlanningConstants.PLANNING_SCHEMA);
	properties.remove(oFF.PlanningConstants.MODEL);
	properties.remove(oFF.PlanningConstants.ENVIRONMENT);
	properties.remove(oFF.PlanningConstants.DATA_AREA);
	if (oFF.isNull(dataSource))
	{
		return;
	}
	let type = dataSource.getType();
	if (type === oFF.MetaObjectType.PLANNING_MODEL)
	{
		this.setStringNotEmpty(properties, oFF.PlanningConstants.PLANNING_SCHEMA, dataSource.getSchemaName());
		this.setStringNotEmpty(properties, oFF.PlanningConstants.PLANNING_MODEL, dataSource.getObjectName());
	}
	else if (oFF.isNull(type))
	{
		this.setStringNotEmpty(properties, oFF.PlanningConstants.MODEL, dataSource.getModelName());
		this.setStringNotEmpty(properties, oFF.PlanningConstants.ENVIRONMENT, dataSource.getEnvironmentName());
		let dataArea = dataSource.getDataArea();
		if (oFF.XStringUtils.isNullOrEmpty(dataArea))
		{
			dataArea = oFF.PlanningConstants.DATA_AREA_DEFAULT;
		}
		properties.putString(oFF.PlanningConstants.DATA_AREA, dataArea);
	}
};
oFF.PlanningServiceConfig.prototype.setDataSourceName = function(dataSourceName)
{
	this.setDataSource(oFF.QFactory.createDataSourceWithFqn(dataSourceName));
};
oFF.PlanningServiceConfig.prototype.setStringNotEmpty = function(properties, name, value)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(value))
	{
		properties.putString(name, value);
	}
};
oFF.PlanningServiceConfig.prototype.setupConfig = function(application)
{
	oFF.DfServiceConfigClassic.prototype.setupConfig.call( this , application);
	this.m_properties = oFF.XProperties.create();
};
oFF.PlanningServiceConfig.prototype.toString = function()
{
	if (this.hasErrors())
	{
		return this.getSummary();
	}
	let sb = oFF.XStringBuffer.create();
	if (oFF.notNull(this.m_properties))
	{
		let configKeys = this.m_properties.getKeysAsReadOnlyList();
		for (let i = 0; i < configKeys.size(); i++)
		{
			let configKey = configKeys.get(i);
			let configValue = this.m_properties.getByKey(configKey);
			sb.append(configKey).append("=").appendLine(configValue);
		}
	}
	return sb.toString();
};

oFF.PlanningCommandModelComponent = function() {};
oFF.PlanningCommandModelComponent.prototype = new oFF.QModelComponent();
oFF.PlanningCommandModelComponent.prototype._ff_c = "PlanningCommandModelComponent";

oFF.PlanningCommandModelComponent.create = function(context, planningCommand)
{
	let component = new oFF.PlanningCommandModelComponent();
	component.setupModelComponent(context, null);
	component.m_planningCommand = oFF.XWeakReferenceUtil.getWeakRef(planningCommand);
	return component;
};
oFF.PlanningCommandModelComponent.prototype.m_planningCommand = null;
oFF.PlanningCommandModelComponent.prototype.getContext = function()
{
	return this;
};
oFF.PlanningCommandModelComponent.prototype.getFieldAccessorSingle = function()
{
	return this.getPlanningCommand();
};
oFF.PlanningCommandModelComponent.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_X_COMMAND;
};
oFF.PlanningCommandModelComponent.prototype.getPlanningCommand = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_planningCommand);
};

oFF.EpmPlanningActionContext = function() {};
oFF.EpmPlanningActionContext.prototype = new oFF.QModelComponent();
oFF.EpmPlanningActionContext.prototype._ff_c = "EpmPlanningActionContext";

oFF.EpmPlanningActionContext.prototype.m_connectionContainer = null;
oFF.EpmPlanningActionContext.prototype.m_systemType = null;
oFF.EpmPlanningActionContext.prototype.getConnection = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_connectionContainer);
};
oFF.EpmPlanningActionContext.prototype.getSystemDescription = function()
{
	let application = this.getApplication();
	let systemLandscape = application.getSystemLandscape();
	if (oFF.isNull(systemLandscape))
	{
		return null;
	}
	let systemName = this.getSystemName();
	if (oFF.isNull(systemName))
	{
		return systemLandscape.getMasterSystem();
	}
	return systemLandscape.getSystemDescription(systemName);
};
oFF.EpmPlanningActionContext.prototype.getSystemType = function()
{
	return this.m_systemType;
};
oFF.EpmPlanningActionContext.prototype.setupPlanningActionContext = function(context, systemType, connectionContainer)
{
	this.setContext(context);
	this.m_systemType = systemType;
	this.m_connectionContainer = oFF.XWeakReferenceUtil.getWeakRef(connectionContainer);
};

oFF.EpmPlanningAndAnalyticModelContext = function() {};
oFF.EpmPlanningAndAnalyticModelContext.prototype = new oFF.QModelComponent();
oFF.EpmPlanningAndAnalyticModelContext.prototype._ff_c = "EpmPlanningAndAnalyticModelContext";

oFF.EpmPlanningAndAnalyticModelContext.prototype.m_planningModel = null;
oFF.EpmPlanningAndAnalyticModelContext.prototype.getDatasetEpmObject = function()
{
	return this.getQueryModel().getDatasetEpmObject();
};
oFF.EpmPlanningAndAnalyticModelContext.prototype.getPlanningModel = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_planningModel);
};
oFF.EpmPlanningAndAnalyticModelContext.prototype.releaseObject = function()
{
	this.m_planningModel = oFF.XObjectExt.release(this.m_planningModel);
	oFF.QModelComponent.prototype.releaseObject.call( this );
};
oFF.EpmPlanningAndAnalyticModelContext.prototype.setupWithPlanningModel = function(queryModel, planningModel)
{
	this.m_planningModel = oFF.XWeakReferenceUtil.getWeakRef(planningModel);
	this.setupModelComponent(queryModel, planningModel);
};

oFF.PlanningCommand = function() {};
oFF.PlanningCommand.prototype = new oFF.PlanningPropertiesObject();
oFF.PlanningCommand.prototype._ff_c = "PlanningCommand";

oFF.PlanningCommand.COMMAND_TYPE = "COMMAND_TYPE";
oFF.PlanningCommand.INVALIDATE_RESULT_SET = "INVALIDATE_RESULT_SET";
oFF.PlanningCommand.PLANNING_COMMAND_JSON = "PLANNING_COMMAND_JSON";
oFF.PlanningCommand.PLANNING_SERVICE = "PLANNING_SERVICE";
oFF.PlanningCommand.RESULT = "RESULT";
oFF.PlanningCommand.prototype.m_analyticsCapabilities = null;
oFF.PlanningCommand.prototype.m_connection = null;
oFF.PlanningCommand.prototype.m_extPlanningCommandResult = null;
oFF.PlanningCommand.prototype.m_synchronizationType = null;
oFF.PlanningCommand.prototype.createCommandResult = function(callback, customIdentifier)
{
	let commandResult = this.createCommandResultInstance();
	commandResult.setCustomIdentifier(customIdentifier);
	commandResult.setPlanningCommand(this);
	commandResult.setPlanningCommandCallback(callback);
	return commandResult;
};
oFF.PlanningCommand.prototype.createCommandResultInstance = function()
{
	let result = this.getResult();
	if (oFF.notNull(result))
	{
		oFF.XObjectExt.release(result);
	}
	result = this.createCommandResultInstanceInternal();
	this.setResult(result);
	return result;
};
oFF.PlanningCommand.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningModelCommandResult();
};
oFF.PlanningCommand.prototype.createCommandStructure = oFF.noSupport;
oFF.PlanningCommand.prototype.doProcessCommand = function(synchronizationType, planningCommandResult)
{
	let connection = this.getConnection();
	let servicePath = this.getServicePath();
	let ocpFunction = connection.newRpcFunction(servicePath);
	ocpFunction.setServiceName(oFF.SystemServices.INA_SERVICE);
	let request = ocpFunction.getRpcRequest();
	let requestStructure;
	if (this.getOlapComponentType() !== oFF.OlapComponentType.OLAP)
	{
		requestStructure = this.serializeToElement(oFF.QModelFormat.INA_DATA);
	}
	else
	{
		requestStructure = this.serializeToJson();
	}
	if (connection.getSystemDescription().getSystemType().isTypeOf(oFF.SystemType.HANA) && this.getSession().hasFeature(oFF.FeatureToggleOlap.PLANNING_BATCH))
	{
		requestStructure = oFF.PlanningModelCommandHelper.convertRequestToBatch(requestStructure);
	}
	request.setRequestStructure(requestStructure);
	ocpFunction.processFunctionExecution(synchronizationType, this, planningCommandResult);
};
oFF.PlanningCommand.prototype.getCapabilities = function()
{
	if (oFF.isNull(this.m_analyticsCapabilities))
	{
		let connection = this.getConnection();
		let serverMetadata = connection.getSystemConnect().getServerMetadata();
		this.m_analyticsCapabilities = serverMetadata.getMetadataForService(oFF.ServerService.ANALYTIC);
	}
	return this.m_analyticsCapabilities;
};
oFF.PlanningCommand.prototype.getCommandType = function()
{
	return this.getPropertyObject(oFF.PlanningCommand.COMMAND_TYPE);
};
oFF.PlanningCommand.prototype.getConnection = function()
{
	if (oFF.notNull(this.m_connection))
	{
		return this.m_connection;
	}
	let planningService = this.getPlanningService();
	let connection = planningService.getPlanningServiceConfig().getConnectionContainer();
	if (oFF.isNull(connection))
	{
		let systemName = planningService.getServiceConfig().getSystemName();
		connection = planningService.getApplication().getConnectionPool().getConnection(systemName);
	}
	return connection;
};
oFF.PlanningCommand.prototype.getPlanningService = function()
{
	return this.getPropertyObject(oFF.PlanningCommand.PLANNING_SERVICE);
};
oFF.PlanningCommand.prototype.getResult = function()
{
	return this.getPropertyObject(oFF.PlanningCommand.RESULT);
};
oFF.PlanningCommand.prototype.getServicePath = function()
{
	let connection = this.getConnection();
	let systemDescription = connection.getSystemDescription();
	let fastPathCap = this.getCapabilities().getByKey(oFF.InACapabilities.C032_FAST_PATH);
	if (oFF.notNull(fastPathCap) && fastPathCap.getValue() !== null)
	{
		return fastPathCap.getValue();
	}
	return systemDescription.getSystemType().getInAPath();
};
oFF.PlanningCommand.prototype.isInvalidatingResultSet = function()
{
	let objectValue = this.getPropertyObject(oFF.PlanningCommand.INVALIDATE_RESULT_SET);
	if (oFF.isNull(objectValue))
	{
		return true;
	}
	return objectValue.getBoolean();
};
oFF.PlanningCommand.prototype.onCommandExecuted = function(extPlanningCommandResult)
{
	if (this.m_synchronizationType === oFF.SyncType.BLOCKING)
	{
		this.m_extPlanningCommandResult = extPlanningCommandResult;
	}
	let commandCallback = extPlanningCommandResult.getData().getPlanningCommandCallback();
	if (oFF.notNull(commandCallback))
	{
		commandCallback.onCommandProcessed(extPlanningCommandResult);
	}
};
oFF.PlanningCommand.prototype.onCommandProcessed = function(extPlanningCommandResult)
{
	let commandCallback = extPlanningCommandResult.getData().getPlanningCommandCallback();
	if (oFF.notNull(commandCallback))
	{
		commandCallback.onCommandProcessed(extPlanningCommandResult);
	}
};
oFF.PlanningCommand.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	let planningCommandResult = customIdentifier;
	let extPlanningCommandResult;
	if (extResult.hasErrors())
	{
		extPlanningCommandResult = oFF.ExtResult.create(planningCommandResult, extResult);
	}
	else
	{
		this.onSuccessfulCommand();
		let responseStructure = oFF.PrFactory.createStructureDeepCopy(response.getRootElement());
		if (this.getConnection().getSystemDescription().getSystemType().isTypeOf(oFF.SystemType.HANA) && this.getSession().hasFeature(oFF.FeatureToggleOlap.PLANNING_BATCH))
		{
			responseStructure = oFF.PlanningModelCommandHelper.convertResponseFromBatch(responseStructure);
		}
		let messageManager = oFF.MessageManager.createMessageManagerExt(this.getSession());
		this.updatePlanningContext(responseStructure, messageManager);
		if (this.getOlapComponentType() !== oFF.OlapComponentType.OLAP)
		{
			messageManager.addAllMessages(this.deserializeFromElementExt(oFF.QModelFormat.INA_DATA, responseStructure));
		}
		else
		{
			planningCommandResult.processResponseStructrue(responseStructure, messageManager);
		}
		extPlanningCommandResult = oFF.ExtResult.create(planningCommandResult, messageManager);
	}
	this.onCommandExecuted(extPlanningCommandResult);
};
oFF.PlanningCommand.prototype.onSuccessfulCommand = function()
{
	this.resetCommand();
};
oFF.PlanningCommand.prototype.processCommand = function(synchronizationType, callback, customIdentifier)
{
	let planningCommandResult = this.createCommandResult(callback, customIdentifier);
	this.m_synchronizationType = synchronizationType;
	this.doProcessCommand(synchronizationType, planningCommandResult);
	let result = null;
	if (synchronizationType === oFF.SyncType.BLOCKING)
	{
		result = this.m_extPlanningCommandResult;
		this.m_extPlanningCommandResult = null;
	}
	return result;
};
oFF.PlanningCommand.prototype.resetCommand = function()
{
	this.setPropertyObject(oFF.PlanningCommand.PLANNING_COMMAND_JSON, null);
};
oFF.PlanningCommand.prototype.serializeToJson = function()
{
	let planningCommandJson = this.getPropertyObject(oFF.PlanningCommand.PLANNING_COMMAND_JSON);
	if (oFF.isNull(planningCommandJson))
	{
		planningCommandJson = this.createCommandStructure();
		this.setPropertyObject(oFF.PlanningCommand.PLANNING_COMMAND_JSON, planningCommandJson);
	}
	return planningCommandJson;
};
oFF.PlanningCommand.prototype.setCommandType = function(commandType)
{
	this.setPropertyObject(oFF.PlanningCommand.COMMAND_TYPE, commandType);
};
oFF.PlanningCommand.prototype.setConnection = function(connection)
{
	this.m_connection = connection;
};
oFF.PlanningCommand.prototype.setInvalidatingResultSet = function(invalidating)
{
	this.setPropertyBoolean(oFF.PlanningCommand.INVALIDATE_RESULT_SET, invalidating);
	return this;
};
oFF.PlanningCommand.prototype.setPlanningService = function(planningService)
{
	this.setPropertyObject(oFF.PlanningCommand.PLANNING_SERVICE, planningService);
	this.setupContext(planningService.getOlapEnv().getContext());
};
oFF.PlanningCommand.prototype.setResult = function(result)
{
	this.setPropertyObject(oFF.PlanningCommand.RESULT, result);
};
oFF.PlanningCommand.prototype.updatePlanningContext = function(responseStructure, messageManager)
{
	if (oFF.isNull(responseStructure))
	{
		return;
	}
	let planningService = this.getPlanningService();
	if (oFF.isNull(planningService))
	{
		return;
	}
	let application = planningService.getApplication();
	if (oFF.isNull(application))
	{
		return;
	}
	let serviceConfig = planningService.getServiceConfig();
	if (oFF.isNull(serviceConfig))
	{
		return;
	}
	let systemName = serviceConfig.getSystemName();
	oFF.PlanningState.update(application, systemName, responseStructure, messageManager);
};

oFF.PlanningCommandResult = function() {};
oFF.PlanningCommandResult.prototype = new oFF.PlanningPropertiesObject();
oFF.PlanningCommandResult.prototype._ff_c = "PlanningCommandResult";

oFF.PlanningCommandResult.CUSTOM_IDENTIFIER = "CUSTOM_IDENTIFIER";
oFF.PlanningCommandResult.PLANNING_COMMAND = "PLANNING_COMMAND";
oFF.PlanningCommandResult.PLANNING_COMMAND_CALLBACK = "PLANNING_COMMAND_CALLBACK";
oFF.PlanningCommandResult.prototype.checkErrorState = function() {};
oFF.PlanningCommandResult.prototype.cloneOlapComponent = function(context, parent)
{
	let command = this.getPlanningCommand();
	let copy = command.createCommandResultInstance();
	copy.setProperties(this.getPropertiesCopy());
	return copy;
};
oFF.PlanningCommandResult.prototype.getCustomIdentifier = function()
{
	return this.getPropertyObject(oFF.PlanningCommandResult.CUSTOM_IDENTIFIER);
};
oFF.PlanningCommandResult.prototype.getPlanningCommand = function()
{
	return this.getPropertyObject(oFF.PlanningCommandResult.PLANNING_COMMAND);
};
oFF.PlanningCommandResult.prototype.getPlanningCommandCallback = function()
{
	return this.getPropertyObject(oFF.PlanningCommandResult.PLANNING_COMMAND_CALLBACK);
};
oFF.PlanningCommandResult.prototype.initResponseStructureCommand = function(responseStructure, messageManager) {};
oFF.PlanningCommandResult.prototype.isValidResponseStructure = function(responseStructure, messageManager)
{
	if (oFF.isNull(responseStructure))
	{
		return false;
	}
	if (oFF.isNull(messageManager))
	{
		return false;
	}
	oFF.InAHelper.importMessages(responseStructure, messageManager);
	return true;
};
oFF.PlanningCommandResult.prototype.onCommandProcessed = oFF.noSupport;
oFF.PlanningCommandResult.prototype.processResponseStructrue = function(responseStructure, messageManager)
{
	this.initResponseStructureCommand(responseStructure, messageManager);
	if (this.isValidResponseStructure(responseStructure, messageManager))
	{
		this.processResponseStructureCommand(responseStructure, messageManager, messageManager.hasErrors());
	}
	this.getPlanningCommand().resetCommand();
	this.checkErrorState();
};
oFF.PlanningCommandResult.prototype.processResponseStructureCommand = function(responseStructure, messageManager, hasErrors) {};
oFF.PlanningCommandResult.prototype.setCustomIdentifier = function(customIdentifier)
{
	this.setPropertyObject(oFF.PlanningCommandResult.CUSTOM_IDENTIFIER, customIdentifier);
};
oFF.PlanningCommandResult.prototype.setPlanningCommand = function(planningCommand)
{
	this.setPropertyObject(oFF.PlanningCommandResult.PLANNING_COMMAND, planningCommand);
};
oFF.PlanningCommandResult.prototype.setPlanningCommandCallback = function(planningCommandCallback)
{
	this.setPropertyObject(oFF.PlanningCommandResult.PLANNING_COMMAND_CALLBACK, planningCommandCallback);
};

oFF.PlanningCommandIdentifier = function() {};
oFF.PlanningCommandIdentifier.prototype = new oFF.PlanningPropertiesObject();
oFF.PlanningCommandIdentifier.prototype._ff_c = "PlanningCommandIdentifier";

oFF.PlanningCommandIdentifier.COMMAND_ID = "COMMAND_ID";
oFF.PlanningCommandIdentifier.PLANNING_COMMAND_TYPE = "PLANNING_COMMAND_TYPE";
oFF.PlanningCommandIdentifier.prototype.getCommandId = function()
{
	return this.getPropertyString(oFF.PlanningCommandIdentifier.COMMAND_ID);
};
oFF.PlanningCommandIdentifier.prototype.getPlanningCommandType = function()
{
	return this.getPropertyObject(oFF.PlanningCommandIdentifier.PLANNING_COMMAND_TYPE);
};
oFF.PlanningCommandIdentifier.prototype.setCommandId = function(commandId)
{
	this.setPropertyString(oFF.PlanningCommandIdentifier.COMMAND_ID, commandId);
};
oFF.PlanningCommandIdentifier.prototype.setPlanningCommandType = function(planningCommandType)
{
	this.setPropertyObject(oFF.PlanningCommandIdentifier.PLANNING_COMMAND_TYPE, planningCommandType);
};

oFF.DataArea = function() {};
oFF.DataArea.prototype = new oFF.PlanningContext();
oFF.DataArea.prototype._ff_c = "DataArea";

oFF.DataArea.create = function()
{
	return new oFF.DataArea();
};
oFF.DataArea.prototype.m_cellLockingType = null;
oFF.DataArea.prototype.m_dataArea = null;
oFF.DataArea.prototype.m_environment = null;
oFF.DataArea.prototype.m_model = null;
oFF.DataArea.prototype.m_supportsChangedData = false;
oFF.DataArea.prototype.m_supportsChangedDataChecked = false;
oFF.DataArea.prototype.m_supportsClose = false;
oFF.DataArea.prototype.m_supportsCloseChecked = false;
oFF.DataArea.prototype._getServiceConfig = function()
{
	let planningService = this.getPlanningService();
	return oFF.isNull(planningService) ? null : planningService.getServiceConfig();
};
oFF.DataArea.prototype._supportsCapability = function(capabilityName)
{
	let serviceConfig = this._getServiceConfig();
	if (oFF.isNull(serviceConfig))
	{
		return false;
	}
	let application = serviceConfig.getApplication();
	if (oFF.isNull(application))
	{
		return false;
	}
	let connectionContainer = application.getConnectionPool().getConnection(serviceConfig.getSystemName());
	return connectionContainer.supportsAnalyticCapability(capabilityName);
};
oFF.DataArea.prototype._supportsChangedData = function()
{
	return this._supportsCapability("ChangeCounter");
};
oFF.DataArea.prototype._supportsClose = function()
{
	return this._supportsCapability("ActionClose");
};
oFF.DataArea.prototype.createCommandClose = function()
{
	return this.createPlanningContextCommand(oFF.PlanningContextCommandType.CLOSE);
};
oFF.DataArea.prototype.createCommandPublish = function()
{
	return this.createPlanningContextCommand(oFF.PlanningContextCommandType.PUBLISH);
};
oFF.DataArea.prototype.createPlanningContextCommand = function(planningContextCommandType)
{
	if (!this.supportsPlanningContextCommandType(planningContextCommandType))
	{
		return null;
	}
	let dataAreaCommand;
	if (planningContextCommandType === oFF.PlanningContextCommandType.CLOSE)
	{
		dataAreaCommand = new oFF.DataAreaCommandClose();
	}
	else
	{
		dataAreaCommand = new oFF.DataAreaCommand();
	}
	dataAreaCommand.setPlanningService(this.getPlanningService());
	dataAreaCommand.setCommandType(oFF.PlanningCommandType.DATA_AREA_COMMAND);
	dataAreaCommand.setPlanningContext(this);
	dataAreaCommand.setPlanningContextCommandType(planningContextCommandType);
	dataAreaCommand.setInvalidatingResultSet(planningContextCommandType.isInvalidatingResultSet());
	return dataAreaCommand;
};
oFF.DataArea.prototype.createPlanningFunctionIdentifier = function(planningFunctionName)
{
	let identifier = new oFF.PlanningFunctionIdentifier();
	identifier.setPlanningCommandType(oFF.PlanningCommandType.PLANNING_FUNCTION);
	identifier.setPlanningOperationType(oFF.PlanningOperationType.PLANNING_FUNCTION);
	identifier.setCommandId(planningFunctionName);
	return identifier;
};
oFF.DataArea.prototype.createPlanningOperationIdentifier = function(planningOperationName, planningOperationType)
{
	if (planningOperationType === oFF.PlanningOperationType.PLANNING_FUNCTION)
	{
		return this.createPlanningFunctionIdentifier(planningOperationName);
	}
	if (planningOperationType === oFF.PlanningOperationType.PLANNING_SEQUENCE)
	{
		return this.createPlanningSequenceIdentifier(planningOperationName);
	}
	oFF.noSupport();
};
oFF.DataArea.prototype.createPlanningOperationIdentifierByDataSource = function(dataSource)
{
	if (oFF.isNull(dataSource))
	{
		return null;
	}
	let planningOperationName = dataSource.getObjectName();
	let type = dataSource.getType();
	if (type === oFF.MetaObjectType.PLANNING_FUNCTION)
	{
		return this.createPlanningFunctionIdentifier(planningOperationName);
	}
	else if (type === oFF.MetaObjectType.PLANNING_SEQUENCE)
	{
		return this.createPlanningSequenceIdentifier(planningOperationName);
	}
	return null;
};
oFF.DataArea.prototype.createPlanningSequenceIdentifier = function(planningSequenceName)
{
	let identifier = new oFF.PlanningSequenceIdentifier();
	identifier.setPlanningCommandType(oFF.PlanningCommandType.PLANNING_SEQUENCE);
	identifier.setPlanningOperationType(oFF.PlanningOperationType.PLANNING_SEQUENCE);
	identifier.setCommandId(planningSequenceName);
	return identifier;
};
oFF.DataArea.prototype.createRequestCreateCommandWithId = function(commandIdentifier)
{
	return this.createRequestCreatePlanningOperation(commandIdentifier);
};
oFF.DataArea.prototype.createRequestCreatePlanningFunction = function(planningFunctionIdentifier)
{
	let planningService = this.getPlanningService();
	let request = oFF.DataAreaRequestCreatePlanningFunction.create(planningService);
	request.setCommandType(oFF.PlanningCommandType.PLANNING_MODEL_REQUEST);
	request.setRequestType(oFF.DataAreaRequestType.CREATE_PLANNING_FUNCTION);
	request.setCommandIdentifier(planningFunctionIdentifier);
	request.setPlanningContext(this);
	return request;
};
oFF.DataArea.prototype.createRequestCreatePlanningOperation = function(planningOperationIdentifier)
{
	let operationType = planningOperationIdentifier.getPlanningOperationType();
	if (operationType === oFF.PlanningOperationType.PLANNING_FUNCTION)
	{
		return this.createRequestCreatePlanningFunction(planningOperationIdentifier);
	}
	else if (operationType === oFF.PlanningOperationType.PLANNING_SEQUENCE)
	{
		return this.createRequestCreatePlanningSequence(planningOperationIdentifier);
	}
	throw oFF.XException.createRuntimeException("illegal operation identifier");
};
oFF.DataArea.prototype.createRequestCreatePlanningSequence = function(planningSequenceIdentifier)
{
	let request = oFF.DataAreaRequestCreatePlanningSequence.create(this.getPlanningService());
	request.setCommandType(oFF.PlanningCommandType.PLANNING_MODEL_REQUEST);
	request.setRequestType(oFF.DataAreaRequestType.CREATE_PLANNING_SEQUENCE);
	request.setCommandIdentifier(planningSequenceIdentifier);
	request.setPlanningContext(this);
	return request;
};
oFF.DataArea.prototype.createRequestGetPlanningFunctionMetadata = function(planningFunctionIdentifier)
{
	let request = new oFF.DataAreaRequestGetPlanningFunctionMetadata();
	request.setPlanningService(this.getPlanningService());
	request.setCommandType(oFF.PlanningCommandType.PLANNING_MODEL_REQUEST);
	request.setRequestType(oFF.DataAreaRequestType.GET_PLANNING_FUNCTION_METADATA);
	request.setPlanningOperationIdentifier(planningFunctionIdentifier);
	request.setPlanningContext(this);
	return request;
};
oFF.DataArea.prototype.createRequestGetPlanningOperationMetadata = function(planningOperationIdentifier)
{
	let planningOperationType = planningOperationIdentifier.getPlanningOperationType();
	if (planningOperationType === oFF.PlanningOperationType.PLANNING_FUNCTION)
	{
		return this.createRequestGetPlanningFunctionMetadata(planningOperationIdentifier);
	}
	if (planningOperationType === oFF.PlanningOperationType.PLANNING_SEQUENCE)
	{
		return this.createRequestGetPlanningSequenceMetadata(planningOperationIdentifier);
	}
	oFF.noSupport();
};
oFF.DataArea.prototype.createRequestGetPlanningSequenceMetadata = function(planningSequenceIdentifier)
{
	let request = new oFF.DataAreaRequestGetPlanningSequenceMetadata();
	request.setPlanningService(this.getPlanningService());
	request.setCommandType(oFF.PlanningCommandType.PLANNING_MODEL_REQUEST);
	request.setRequestType(oFF.DataAreaRequestType.GET_PLANNING_SEQUENCE_METADATA);
	request.setPlanningOperationIdentifier(planningSequenceIdentifier);
	request.setPlanningContext(this);
	return request;
};
oFF.DataArea.prototype.getCellLockingType = function()
{
	let dataAreaState = oFF.DataAreaState.getDataAreaState(this);
	if (oFF.notNull(dataAreaState))
	{
		return dataAreaState.getCellLocking();
	}
	return this.m_cellLockingType;
};
oFF.DataArea.prototype.getDataArea = function()
{
	return this.m_dataArea;
};
oFF.DataArea.prototype.getEnvironment = function()
{
	let dataAreaState = oFF.DataAreaState.getDataAreaState(this);
	if (oFF.notNull(dataAreaState))
	{
		return dataAreaState.getEnvironment();
	}
	return this.m_environment;
};
oFF.DataArea.prototype.getModel = function()
{
	let dataAreaState = oFF.DataAreaState.getDataAreaState(this);
	if (oFF.notNull(dataAreaState))
	{
		return dataAreaState.getModel();
	}
	return this.m_model;
};
oFF.DataArea.prototype.getPlanningContextType = function()
{
	return oFF.PlanningContextType.DATA_AREA;
};
oFF.DataArea.prototype.getQueryConsumerServices = function()
{
	return oFF.DataAreaUtil.getQueryConsumerServices(this);
};
oFF.DataArea.prototype.hasChangedData = function()
{
	let dataAreaState = oFF.DataAreaState.getDataAreaState(this);
	if (oFF.isNull(dataAreaState))
	{
		return false;
	}
	return dataAreaState.hasChangedData();
};
oFF.DataArea.prototype.isInitializedAtServer = function()
{
	let dataAreaState = oFF.DataAreaState.getDataAreaState(this);
	if (oFF.isNull(dataAreaState))
	{
		return false;
	}
	return dataAreaState.isSubmitted();
};
oFF.DataArea.prototype.isWorkStatusActive = function()
{
	let dataAreaState = oFF.DataAreaState.getDataAreaState(this);
	if (oFF.isNull(dataAreaState))
	{
		return false;
	}
	return dataAreaState.isWorkStatusActive();
};
oFF.DataArea.prototype.releaseObject = function()
{
	this.m_dataArea = null;
	this.m_environment = null;
	this.m_model = null;
	this.m_cellLockingType = null;
	oFF.PlanningContext.prototype.releaseObject.call( this );
};
oFF.DataArea.prototype.setCellLockingType = function(cellLockingType)
{
	this.m_cellLockingType = cellLockingType;
};
oFF.DataArea.prototype.setDataArea = function(dataArea)
{
	this.m_dataArea = dataArea;
};
oFF.DataArea.prototype.setEnvironment = function(environment)
{
	this.m_environment = environment;
};
oFF.DataArea.prototype.setModel = function(model)
{
	this.m_model = model;
};
oFF.DataArea.prototype.supportsChangedData = function()
{
	if (!this.m_supportsChangedDataChecked)
	{
		this.m_supportsChangedData = this._supportsChangedData();
		this.m_supportsChangedDataChecked = true;
	}
	return this.m_supportsChangedData;
};
oFF.DataArea.prototype.supportsClose = function()
{
	if (!this.m_supportsCloseChecked)
	{
		this.m_supportsClose = this._supportsClose();
		this.m_supportsCloseChecked = true;
	}
	return this.m_supportsClose;
};
oFF.DataArea.prototype.supportsPlanningContextCommandType = function(planningContextCommandType)
{
	if (oFF.isNull(planningContextCommandType))
	{
		return false;
	}
	if (planningContextCommandType === oFF.PlanningContextCommandType.PUBLISH)
	{
		return true;
	}
	if (planningContextCommandType === oFF.PlanningContextCommandType.REFRESH)
	{
		return true;
	}
	if (planningContextCommandType === oFF.PlanningContextCommandType.RESET)
	{
		return true;
	}
	if (planningContextCommandType === oFF.PlanningContextCommandType.DOC_RESET || planningContextCommandType === oFF.PlanningContextCommandType.DOC_SAVE)
	{
		return true;
	}
	if (planningContextCommandType === oFF.PlanningContextCommandType.CLOSE)
	{
		return this.supportsClose();
	}
	return false;
};
oFF.DataArea.prototype.supportsWorkStatus = function()
{
	return this.supportsChangedData();
};

oFF.PlanningModel = function() {};
oFF.PlanningModel.prototype = new oFF.PlanningContext();
oFF.PlanningModel.prototype._ff_c = "PlanningModel";

oFF.PlanningModel.create = function()
{
	let model = new oFF.PlanningModel();
	model.m_versionParametersMetadata = oFF.XHashMapByString.create();
	model.m_planningModelBehaviour = oFF.PlanningModelBehaviour.STANDARD;
	model.m_persistenceType = oFF.PlanningPersistenceType.DEFAULT;
	return model;
};
oFF.PlanningModel.updateState = function(application, systemName, responseStructure, messageCollector)
{
	let systemLandscape = application.getSystemLandscape();
	if (oFF.isNull(systemLandscape))
	{
		return;
	}
	let systemDescription = systemLandscape.getSystemDescription(systemName);
	if (oFF.isNull(systemDescription))
	{
		return;
	}
	let systemType = systemDescription.getSystemType();
	if (oFF.isNull(systemType))
	{
		return;
	}
	if (!systemType.isTypeOf(oFF.SystemType.HANA))
	{
		return;
	}
	let planningStructure = oFF.PrUtils.getStructureProperty(responseStructure, "Planning");
	if (oFF.isNull(planningStructure))
	{
		return;
	}
	let returnCode = oFF.PrUtils.getIntegerValueProperty(planningStructure, "return_code", -1);
	if (returnCode !== 0)
	{
		messageCollector.addErrorExt(oFF.OriginLayer.SERVER, 0, oFF.XStringBuffer.create().append("Planning return code: ").appendInt(returnCode).toString(), null);
		return;
	}
	if (!oFF.PlanningModel.updateVersionsState(application, systemName, planningStructure))
	{
		messageCollector.addErrorExt(oFF.OriginLayer.PROTOCOL, 0, oFF.XStringBuffer.create().append("Planning response structure invalid").toString(), null);
	}
};
oFF.PlanningModel.updateStateFromResponse = function(application, systemName, request, response, messageCollector)
{
	let systemLandscape = application.getSystemLandscape();
	if (oFF.isNull(systemLandscape) || !systemLandscape.existsSystemName(systemName))
	{
		return;
	}
	let systemType = systemLandscape.getSystemDescription(systemName).getSystemType();
	if (oFF.isNull(systemType) || !systemType.isTypeOf(oFF.SystemType.HANA))
	{
		return;
	}
	let hasErrors = oFF.InAHelper.importMessages(response, messageCollector);
	if (hasErrors)
	{
		return;
	}
	let commands = request.getStructureByKey("Planning").getListByKey("commands");
	let command = oFF.PrUtils.getStructureWithKeyValuePair(commands, "command", "get_versions");
	let planningService = oFF.PlanningModelUtil.getPlanningService(application, systemName, command.getStringByKey("schema"), command.getStringByKey("model"));
	if (oFF.isNull(planningService))
	{
		return;
	}
	if (oFF.PlanningModelCommandHelper.getResponsesReturnCodeStrict(response, messageCollector) !== 0)
	{
		return;
	}
	let planningModel = planningService.getPlanningContext();
	let responses = response.getListByKey("Planning");
	if (!oFF.PlanningModelCommandHelper.processResponseGetVersions(commands, responses, planningModel))
	{
		messageCollector.addErrorExt(oFF.OriginLayer.PROTOCOL, 0, "Planning response structure invalid", null);
	}
};
oFF.PlanningModel.updateVersionState = function(application, systemName, versionStructure)
{
	if (oFF.isNull(versionStructure))
	{
		return false;
	}
	let planningSchema = oFF.PrUtils.getStringValueProperty(versionStructure, "schema", null);
	if (oFF.isNull(planningSchema))
	{
		return false;
	}
	let planningModel = oFF.PrUtils.getStringValueProperty(versionStructure, "model", null);
	if (oFF.isNull(planningModel))
	{
		return false;
	}
	let planningService = oFF.PlanningModelUtil.getPlanningService(application, systemName, planningSchema, planningModel);
	if (oFF.isNull(planningService))
	{
		return false;
	}
	let model = planningService.getPlanningContext();
	return oFF.isNull(model) ? false : model.updateVersionStateInternalIgnoreUndesired(versionStructure);
};
oFF.PlanningModel.updateVersionsState = function(application, systemName, planningStructure)
{
	let isOk = true;
	let versionsList = oFF.PrUtils.getListProperty(planningStructure, "versions");
	let len = oFF.PrUtils.getListSize(versionsList, 0);
	for (let i = 0; i < len; i++)
	{
		let versionStructure = oFF.PrUtils.getStructureElement(versionsList, i);
		if (!oFF.PlanningModel.updateVersionState(application, systemName, versionStructure))
		{
			isOk = false;
		}
	}
	return isOk;
};
oFF.PlanningModel.prototype.m_actionMetadataList = null;
oFF.PlanningModel.prototype.m_actionMetadataMap = null;
oFF.PlanningModel.prototype.m_backendUserName = null;
oFF.PlanningModel.prototype.m_dataSources = null;
oFF.PlanningModel.prototype.m_epmPlanningActions = null;
oFF.PlanningModel.prototype.m_isPublicVersionEditInProgress = false;
oFF.PlanningModel.prototype.m_modelInitialized = false;
oFF.PlanningModel.prototype.m_persistenceType = null;
oFF.PlanningModel.prototype.m_planningModelBehaviour = null;
oFF.PlanningModel.prototype.m_planningModelName = null;
oFF.PlanningModel.prototype.m_planningModelSchema = null;
oFF.PlanningModel.prototype.m_privileges = null;
oFF.PlanningModel.prototype.m_privilegesMap = null;
oFF.PlanningModel.prototype.m_versionParametersMetadata = null;
oFF.PlanningModel.prototype.m_versionPrivilegesInitialized = false;
oFF.PlanningModel.prototype.m_versionsList = null;
oFF.PlanningModel.prototype.m_versionsMap = null;
oFF.PlanningModel.prototype.m_withPublicVersionEdit = false;
oFF.PlanningModel.prototype.m_withSharedVersions = false;
oFF.PlanningModel.prototype.m_withUniqueVersionDescriptions = false;
oFF.PlanningModel.prototype._getVersions = function(withOwnVersions, withSharedVersions, withInactiveVersions)
{
	this.checkModelInitialized();
	let result = oFF.XList.create();
	for (let i = 0; i < this.m_versionsList.size(); i++)
	{
		let version = this.m_versionsList.get(i);
		if (version.getVersionState() === null)
		{
			continue;
		}
		if (!withOwnVersions)
		{
			if (!version.isSharedVersion())
			{
				continue;
			}
		}
		if (!withSharedVersions)
		{
			if (version.isSharedVersion())
			{
				continue;
			}
		}
		if (!withInactiveVersions)
		{
			if (!version.isActive())
			{
				continue;
			}
		}
		result.add(version);
	}
	return result;
};
oFF.PlanningModel.prototype.addInputEnabledPublicVersion = function(sourceVersionName)
{
	this.checkModelInitialized();
	let planningVersion = this.m_versionsMap.getByKey(sourceVersionName);
	if (oFF.isNull(planningVersion))
	{
		planningVersion = oFF.PlanningVersion.create();
		planningVersion.setPlanningModel(this);
		planningVersion.setVersionIdentifier(oFF.PlanningVersionIdentifier.create(-1, false, null));
	}
	planningVersion.setSourceVersionName(sourceVersionName);
	planningVersion.setShowingAsPublicVersion(true);
	planningVersion.updateInvalidPrivileges();
	planningVersion.setVersionState(oFF.PlanningVersionState.CLEAN);
	this.m_versionsMap.put(sourceVersionName, planningVersion);
	this.m_versionsList.add(planningVersion);
	this.setWithPublicVersionEdit(true);
	this.setPublicVersionEditInProgress(true);
	return true;
};
oFF.PlanningModel.prototype.beginActionSequence = function(versionPairs, syncType, emptyListener, identifier)
{
	let messageManager = oFF.MessageManagerSimple.createMessageManager();
	let resultCollector = oFF.XList.create();
	let consumer = (a) => {
		messageManager.addAllMessages(a);
		let subResult;
		if (a.isValid())
		{
			subResult = oFF.ExtResult.create(oFF.XBooleanValue.create(true), messageManager);
		}
		else
		{
			messageManager.addError(-4, "An fatal error occurred");
			subResult = oFF.ExtResult.create(oFF.XBooleanValue.create(false), messageManager);
		}
		resultCollector.add(subResult);
		if (oFF.notNull(emptyListener))
		{
			emptyListener.onPlanningVersionActionExecuted(subResult, subResult.getData().getBoolean(), identifier);
		}
	};
	oFF.EpmPlanningVersionRestAccessor.startActionSequence(this, versionPairs, syncType, consumer);
	return oFF.XCollectionUtils.size(resultCollector) === 1 ? resultCollector.get(0) : null;
};
oFF.PlanningModel.prototype.checkModelInitialized = function()
{
	if (!this.isModelInitialized())
	{
		throw oFF.XException.createIllegalStateException("planning model is not initialized");
	}
};
oFF.PlanningModel.prototype.commitActionSequences = function(versions, actionSequenceId, syncType, emptyListener, identifier)
{
	let messageManager = oFF.MessageManagerSimple.createMessageManager();
	let resultCollector = oFF.XList.create();
	let consumer = (a) => {
		messageManager.addAllMessages(a);
		let subResult;
		if (a.isValid())
		{
			subResult = oFF.ExtResult.create(oFF.XBooleanValue.create(true), messageManager);
		}
		else
		{
			messageManager.addError(-4, "An fatal error occurred");
			subResult = oFF.ExtResult.create(oFF.XBooleanValue.create(false), messageManager);
		}
		resultCollector.add(subResult);
		if (oFF.notNull(emptyListener))
		{
			emptyListener.onPlanningVersionActionExecuted(subResult, subResult.getData().getBoolean(), identifier);
		}
	};
	oFF.EpmPlanningVersionRestAccessor.commitActionSequences(this, versions, actionSequenceId, syncType, consumer);
	return oFF.XCollectionUtils.size(resultCollector) === 1 ? resultCollector.get(0) : null;
};
oFF.PlanningModel.prototype.copyVersionIdentifier = function(versionIdentifier)
{
	let identifier;
	if (oFF.XStringUtils.isNotNullAndNotEmpty(versionIdentifier.getVersionKey()))
	{
		identifier = oFF.PlanningVersionIdentifier.create2(versionIdentifier.getVersionKey(), versionIdentifier.isSharedVersion(), versionIdentifier.getVersionOwner());
	}
	else
	{
		identifier = oFF.PlanningVersionIdentifier.create(versionIdentifier.getVersionId(), versionIdentifier.isSharedVersion(), versionIdentifier.getVersionOwner());
	}
	return identifier;
};
oFF.PlanningModel.prototype.copyVersionToPrivate = function(parameters, syncType, versionFetchListener, identifier)
{
	let messageManager = oFF.MessageManagerSimple.createMessageManager();
	let resultCollector = oFF.XList.create();
	let biConsumer = (a, b) => {
		messageManager.addAllMessages(b);
		let subResult;
		if (b.isValid())
		{
			subResult = oFF.ExtResult.create(a, messageManager);
		}
		else
		{
			messageManager.addError(-4, "An fatal error occurred");
			subResult = oFF.ExtResult.create(null, messageManager);
		}
		resultCollector.add(subResult);
		if (oFF.notNull(versionFetchListener))
		{
			versionFetchListener.onPlanningVersionFetched(subResult, a, identifier);
		}
	};
	oFF.EpmPlanningVersionRestAccessor.copyToPrivate(this, parameters, syncType, biConsumer);
	return oFF.XCollectionUtils.size(resultCollector) === 1 ? resultCollector.get(0) : null;
};
oFF.PlanningModel.prototype.createCommandBackup = function()
{
	return this.createPlanningContextCommand(oFF.PlanningContextCommandType.BACKUP);
};
oFF.PlanningModel.prototype.createCommandClose = function()
{
	return this.createPlanningContextCommand(oFF.PlanningContextCommandType.CLOSE);
};
oFF.PlanningModel.prototype.createCommandSave = function()
{
	return this.createPlanningContextCommand(oFF.PlanningContextCommandType.SAVE);
};
oFF.PlanningModel.prototype.createEmptyVersion = function(parameters, syncType, versionFetchListener, identifier)
{
	let messageManager = oFF.MessageManagerSimple.createMessageManager();
	let resultCollector = oFF.XList.create();
	let biConsumer = (a, b) => {
		messageManager.addAllMessages(b);
		let subResult;
		if (b.isValid())
		{
			subResult = oFF.ExtResult.create(a, messageManager);
		}
		else
		{
			messageManager.addError(-4, "An fatal error occurred");
			subResult = oFF.ExtResult.create(null, messageManager);
		}
		resultCollector.add(subResult);
		if (oFF.notNull(versionFetchListener))
		{
			versionFetchListener.onPlanningVersionFetched(subResult, a, identifier);
		}
	};
	oFF.EpmPlanningVersionRestAccessor.createEmptyVersion(this, parameters, syncType, biConsumer);
	return oFF.XCollectionUtils.size(resultCollector) === 1 ? resultCollector.get(0) : null;
};
oFF.PlanningModel.prototype.createPlanningContextCommand = function(planningContextCommandType)
{
	if (!this.supportsPlanningContextCommandType(planningContextCommandType))
	{
		return null;
	}
	let planningModelCommand;
	if (planningContextCommandType === oFF.PlanningContextCommandType.CLOSE)
	{
		planningModelCommand = new oFF.PlanningModelCloseCommand();
	}
	else
	{
		planningModelCommand = new oFF.PlanningModelCommand();
	}
	planningModelCommand.setPlanningService(this.getPlanningService());
	planningModelCommand.setCommandType(oFF.PlanningCommandType.PLANNING_MODEL_COMMAND);
	planningModelCommand.setPlanningContext(this);
	planningModelCommand.setPlanningContextCommandType(planningContextCommandType);
	planningModelCommand.setInvalidatingResultSet(planningContextCommandType.isInvalidatingResultSet());
	return planningModelCommand;
};
oFF.PlanningModel.prototype.createRequestCleanup = function()
{
	this.checkModelInitialized();
	let request = new oFF.PlanningModelRequestCleanup();
	this.initializePlanningModelRequest(request, oFF.PlanningModelRequestType.CLEANUP);
	return request;
};
oFF.PlanningModel.prototype.createRequestCreateCommandWithId = function(commandIdentifier)
{
	this.checkModelInitialized();
	let actionIdentifier = commandIdentifier;
	oFF.XObjectExt.assertNotNullExt(actionIdentifier, "Action  is not yet known by client");
	let request = new oFF.PlanningModelRequestCreateAction();
	this.initializePlanningModelRequest(request, oFF.PlanningModelRequestType.CREATE_PLANNING_ACTION);
	request.setCommandIdentifier(actionIdentifier);
	let metadata = this.getActionMetadata(actionIdentifier.getActionId()).getActionParameterMetadata();
	request.setActionParameters(metadata);
	return request;
};
oFF.PlanningModel.prototype.createRequestRefreshActions = function()
{
	this.checkModelInitialized();
	let request = new oFF.PlanningModelRequestRefreshActions();
	this.initializePlanningModelRequest(request, oFF.PlanningModelRequestType.REFRESH_ACTIONS);
	return request;
};
oFF.PlanningModel.prototype.createRequestRefreshVersions = function()
{
	this.checkModelInitialized();
	let request = new oFF.PlanningModelRequestRefreshVersions();
	this.initializePlanningModelRequest(request, oFF.PlanningModelRequestType.REFRESH_VERSIONS);
	return request;
};
oFF.PlanningModel.prototype.createRequestUpdateVersionPrivileges = function()
{
	this.checkModelInitialized();
	let request = new oFF.PlanningModelRequestUpdateVersionPrivileges();
	this.initializePlanningModelRequest(request, oFF.PlanningModelRequestType.UPDATE_PRIVILEGES);
	return request;
};
oFF.PlanningModel.prototype.deleteVersion = function(versionKey, syncType, versionFetchListener, identifier)
{
	let messageManager = oFF.MessageManagerSimple.createMessageManager();
	let resultCollector = oFF.XList.create();
	let consumer = (a) => {
		messageManager.addAllMessages(a);
		let subResult;
		if (a.isValid())
		{
			subResult = oFF.ExtResult.create(oFF.XBooleanValue.create(true), messageManager);
		}
		else
		{
			messageManager.addError(-4, "An fatal error occurred");
			subResult = oFF.ExtResult.create(oFF.XBooleanValue.create(false), messageManager);
		}
		resultCollector.add(subResult);
		if (oFF.notNull(versionFetchListener))
		{
			versionFetchListener.onPlanningVersionActionExecuted(subResult, subResult.getData().getBoolean(), identifier);
		}
	};
	oFF.EpmPlanningVersionRestAccessor.deleteVersion(this, versionKey, syncType, consumer);
	return oFF.XCollectionUtils.size(resultCollector) === 1 ? resultCollector.get(0) : null;
};
oFF.PlanningModel.prototype.discardActionSequences = function(versions, syncType, emptyListener, identifier)
{
	let messageManager = oFF.MessageManagerSimple.createMessageManager();
	let resultCollector = oFF.XList.create();
	let consumer = (a) => {
		messageManager.addAllMessages(a);
		let subResult;
		if (a.isValid())
		{
			subResult = oFF.ExtResult.create(oFF.XBooleanValue.create(true), messageManager);
		}
		else
		{
			messageManager.addError(-4, "An fatal error occurred");
			subResult = oFF.ExtResult.create(oFF.XBooleanValue.create(false), messageManager);
		}
		resultCollector.add(subResult);
		if (oFF.notNull(emptyListener))
		{
			emptyListener.onPlanningVersionActionExecuted(subResult, subResult.getData().getBoolean(), identifier);
		}
	};
	oFF.EpmPlanningVersionRestAccessor.discardActionSequences(this, versions, syncType, consumer);
	return oFF.XCollectionUtils.size(resultCollector) === 1 ? resultCollector.get(0) : null;
};
oFF.PlanningModel.prototype.discardPublicVersionEdit = function(parameters, syncType, versionFetchListener, identifier)
{
	let messageManager = oFF.MessageManagerSimple.createMessageManager();
	let resultCollector = oFF.XList.create();
	let biConsumer = (a, b) => {
		messageManager.addAllMessages(b);
		let subResult;
		if (b.isValid())
		{
			subResult = oFF.ExtResult.create(a, messageManager);
		}
		else
		{
			messageManager.addError(-4, "An fatal error occurred");
			subResult = oFF.ExtResult.create(null, messageManager);
		}
		resultCollector.add(subResult);
		if (oFF.notNull(versionFetchListener))
		{
			versionFetchListener.onPlanningVersionFetched(subResult, a, identifier);
		}
	};
	oFF.EpmPlanningVersionRestAccessor.discardPublicVersionEdit(this, parameters, syncType, biConsumer);
	return oFF.XCollectionUtils.size(resultCollector) === 1 ? resultCollector.get(0) : null;
};
oFF.PlanningModel.prototype.fetchEpmPlanningAction = function(actionType, packageName, actionLocalName, syncType, listener, identifier)
{
	return this.fetchEpmPlanningActionByFqn(oFF.EpmPlanningAction.getFullyQualifiedNameWithType(actionType, packageName, actionLocalName), syncType, listener, identifier);
};
oFF.PlanningModel.prototype.fetchEpmPlanningActionByFqn = function(fullyQualifiedName, syncType, listener, identifier)
{
	let result;
	let messageManager = oFF.MessageManagerSimple.createMessageManager();
	let cachedAction = this.m_epmPlanningActions.getByKey(fullyQualifiedName);
	if (oFF.notNull(cachedAction))
	{
		result = oFF.ExtResult.create(cachedAction, messageManager);
		if (oFF.notNull(listener))
		{
			listener.onPlanningActionCreated(result, cachedAction, identifier);
		}
	}
	else
	{
		let queryManager = this.getQueryManagerBase();
		let triple = oFF.EpmPlanningAction.getActionIdTriple(fullyQualifiedName);
		if (!oFF.XObjectExt.isValidObject(queryManager))
		{
			messageManager.addError(-1, "Query Manager not valid");
		}
		let actionType = null;
		let packageName = null;
		let actionLocalName = null;
		if (oFF.XCollectionUtils.size(triple) !== 3)
		{
			messageManager.addError(-2, oFF.XStringUtils.concatenate3("Fully qualified name of action ", fullyQualifiedName, " is not valid. Valid format is {ActionType}:{PackageName}:{ActionLocalName}"));
		}
		else
		{
			actionType = oFF.EpmActionType.lookup(triple.get(0));
			packageName = triple.get(1);
			actionLocalName = triple.get(2);
			if (oFF.isNull(actionType))
			{
				messageManager.addError(-3, oFF.XStringUtils.concatenate3("Action type ", triple.get(2), " does not match the allowed action types."));
			}
		}
		if (messageManager.hasErrors())
		{
			result = oFF.ExtResult.create(null, messageManager);
			if (oFF.notNull(listener))
			{
				listener.onPlanningActionCreated(result, null, identifier);
			}
		}
		else
		{
			let resultCollector = oFF.XList.create();
			let biConsumer = (a, b) => {
				messageManager.addAllMessages(b);
				let subResult;
				if (b.isValid())
				{
					subResult = oFF.ExtResult.create(a, messageManager);
					this.m_epmPlanningActions.put(fullyQualifiedName, a);
				}
				else
				{
					messageManager.addError(-4, "An fatal error occurred");
					subResult = oFF.ExtResult.create(null, messageManager);
				}
				resultCollector.add(subResult);
				if (oFF.notNull(listener))
				{
					listener.onPlanningActionCreated(subResult, a, identifier);
				}
			};
			oFF.EpmPlanningActionRestAccessor.retrieveActionMetadata(this.getContext(), queryManager.getConnection(), queryManager.getSystemType(), actionType, packageName, actionLocalName, syncType, biConsumer);
			if (oFF.XCollectionUtils.size(resultCollector) === 1)
			{
				result = resultCollector.get(0);
			}
			else
			{
				result = oFF.ExtResult.create(null, messageManager);
			}
		}
	}
	return result;
};
oFF.PlanningModel.prototype.fetchVersionWithDetails = function(versionKey, syncType, versionFetchListener, identifier)
{
	let messageManager = oFF.MessageManagerSimple.createMessageManager();
	let resultCollector = oFF.XList.create();
	let biConsumer = (a, b) => {
		messageManager.addAllMessages(b);
		let subResult;
		if (b.isValid())
		{
			subResult = oFF.ExtResult.create(a, messageManager);
		}
		else
		{
			messageManager.addError(-4, "An fatal error occurred");
			subResult = oFF.ExtResult.create(null, messageManager);
		}
		resultCollector.add(subResult);
		if (oFF.notNull(versionFetchListener))
		{
			versionFetchListener.onPlanningVersionFetched(subResult, a, identifier);
		}
	};
	oFF.EpmPlanningVersionRestAccessor.getVersionDetails(this, versionKey, syncType, biConsumer);
	return oFF.XCollectionUtils.size(resultCollector) === 1 ? resultCollector.get(0) : null;
};
oFF.PlanningModel.prototype.fetchVersions = function(syncType, versionFetchListener, identifier)
{
	let messageManager = oFF.MessageManagerSimple.createMessageManager();
	let resultCollector = oFF.XList.create();
	let biConsumer = (a, b) => {
		messageManager.addAllMessages(b);
		let subResult;
		if (b.isValid())
		{
			subResult = oFF.ExtResult.create(a, messageManager);
		}
		else
		{
			messageManager.addError(-4, "An fatal error occurred");
			subResult = oFF.ExtResult.create(null, messageManager);
		}
		resultCollector.add(subResult);
		if (oFF.notNull(versionFetchListener))
		{
			versionFetchListener.onPlanningVersionsFetched(subResult, a, identifier);
		}
	};
	oFF.EpmPlanningVersionRestAccessor.getVersions(this, syncType, biConsumer);
	return oFF.XCollectionUtils.size(resultCollector) === 1 ? resultCollector.get(0) : null;
};
oFF.PlanningModel.prototype.getAction = function(actionIdentifier)
{
	let action = new oFF.PlanningAction();
	action.setCommandType(oFF.PlanningCommandType.PLANNING_ACTION);
	action.setPlanningService(this.getPlanningService());
	action.setPlanningContext(this);
	action.setCommandIdentifier(actionIdentifier);
	let metadata = this.getActionMetadata(actionIdentifier.getActionId()).getActionParameterMetadata();
	action.setActionParameterMetadata(metadata);
	return action;
};
oFF.PlanningModel.prototype.getActionForQuery = function(actionIdentifier)
{
	this.checkModelInitialized();
	if (oFF.isNull(actionIdentifier))
	{
		return null;
	}
	let action = new oFF.PlanningAction();
	action.setCommandType(oFF.PlanningCommandType.PLANNING_ACTION);
	action.setPlanningService(this.getPlanningService());
	action.setPlanningContext(this);
	action.setCommandIdentifier(actionIdentifier);
	let metadata = this.getActionMetadata(actionIdentifier.getActionId()).getActionParameterMetadata();
	action.setActionParameterMetadata(metadata);
	return action;
};
oFF.PlanningModel.prototype.getActionForQueryIdentifier = function(actionId)
{
	this.checkModelInitialized();
	let actionMetadata = this.getActionMetadata(actionId);
	if (oFF.isNull(actionMetadata))
	{
		return null;
	}
	let actionType = actionMetadata.getActionType();
	if (oFF.isNull(actionType))
	{
		return null;
	}
	if (!actionType.isTypeOf(oFF.PlanningActionType.QUERY_ACTION))
	{
		return null;
	}
	let actionIdentifier = new oFF.PlanningActionForQueryIdentifier();
	actionIdentifier.setActionMetadata(actionMetadata);
	actionIdentifier.setCommandId(actionMetadata.getActionId());
	actionIdentifier.setPlanningCommandType(oFF.PlanningCommandType.PLANNING_ACTION);
	return actionIdentifier;
};
oFF.PlanningModel.prototype.getActionForQueryIdentifiers = function()
{
	this.checkModelInitialized();
	let result = oFF.XList.create();
	let actionMetadataList = this.getActionMetadataList();
	for (let i = 0; i < actionMetadataList.size(); i++)
	{
		let actionMetadata = actionMetadataList.get(i);
		let actionIdentifier = this.getActionForQueryIdentifier(actionMetadata.getActionId());
		if (oFF.isNull(actionIdentifier))
		{
			continue;
		}
		result.add(actionIdentifier);
	}
	return result;
};
oFF.PlanningModel.prototype.getActionIdentifierById = function(actionId, planningVersionIdentifier)
{
	this.checkModelInitialized();
	let actionMetadata = this.getActionMetadata(actionId);
	if (oFF.isNull(actionMetadata))
	{
		return null;
	}
	let actionType = actionMetadata.getActionType();
	if (oFF.isNull(actionType))
	{
		return null;
	}
	if (!actionType.isTypeOf(oFF.PlanningActionType.VERSION_ACTION))
	{
		return null;
	}
	let actionIdentifier = new oFF.PlanningActionIdentifier();
	actionIdentifier.setActionMetadata(actionMetadata);
	actionIdentifier.setCommandId(actionMetadata.getActionId());
	actionIdentifier.setPlanningCommandType(oFF.PlanningCommandType.PLANNING_ACTION);
	actionIdentifier.setVersionIdentifier(planningVersionIdentifier);
	return actionIdentifier;
};
oFF.PlanningModel.prototype.getActionIdentifiers = function()
{
	this.checkModelInitialized();
	let versions = this.getAllVersions();
	let result = oFF.XList.create();
	for (let i = 0; i < this.m_actionMetadataList.size(); i++)
	{
		let actionMetadata = this.m_actionMetadataList.get(i);
		for (let j = 0; j < versions.size(); j++)
		{
			let version = versions.get(j);
			if (!version.isActive())
			{
				continue;
			}
			let actionIdentifier = this.getActionIdentifierById(actionMetadata.getActionId(), version);
			if (oFF.isNull(actionIdentifier))
			{
				continue;
			}
			result.add(actionIdentifier);
		}
	}
	return result;
};
oFF.PlanningModel.prototype.getActionMetadata = function(actionId)
{
	this.checkModelInitialized();
	let actionMetadataMap = this.getActionMetadataMap();
	return actionMetadataMap.getByKey(actionId);
};
oFF.PlanningModel.prototype.getActionMetadataList = function()
{
	this.checkModelInitialized();
	let result = oFF.XList.create();
	result.addAll(this.m_actionMetadataList);
	return result;
};
oFF.PlanningModel.prototype.getActionMetadataListInternal = function()
{
	this.m_actionMetadataMap = oFF.XObjectExt.release(this.m_actionMetadataMap);
	return this.m_actionMetadataList;
};
oFF.PlanningModel.prototype.getActionMetadataMap = function()
{
	this.checkModelInitialized();
	if (oFF.isNull(this.m_actionMetadataMap))
	{
		this.m_actionMetadataMap = oFF.XHashMapByString.create();
		for (let i = 0; i < this.m_actionMetadataList.size(); i++)
		{
			let actionMetadata = this.m_actionMetadataList.get(i);
			let actionId = actionMetadata.getActionId();
			this.m_actionMetadataMap.put(actionId, actionMetadata);
		}
	}
	return this.m_actionMetadataMap;
};
oFF.PlanningModel.prototype.getActionSequences = function(syncType, actionSequenceListListener, identifier)
{
	let messageManager = oFF.MessageManagerSimple.createMessageManager();
	let resultCollector = oFF.XList.create();
	let biConsumer = (a, b) => {
		messageManager.addAllMessages(b);
		let subResult;
		if (b.isValid())
		{
			subResult = oFF.ExtResult.create(a, messageManager);
		}
		else
		{
			messageManager.addError(-4, "An fatal error occured");
			subResult = oFF.ExtResult.create(null, messageManager);
		}
		resultCollector.add(subResult);
		if (oFF.notNull(actionSequenceListListener))
		{
			actionSequenceListListener.onPlanningActionSequencesFetched(subResult, a, identifier);
		}
	};
	oFF.EpmPlanningVersionRestAccessor.getActionSequencesForPlanningModel(this, syncType, biConsumer);
	return oFF.XCollectionUtils.size(resultCollector) === 1 ? resultCollector.get(0) : null;
};
oFF.PlanningModel.prototype.getActiveVersions = function()
{
	return this._getVersions(true, false, false);
};
oFF.PlanningModel.prototype.getAllVersions = function()
{
	return this._getVersions(true, true, true);
};
oFF.PlanningModel.prototype.getBackendUserName = function()
{
	return this.m_backendUserName;
};
oFF.PlanningModel.prototype.getDataSourcesInternal = function()
{
	return this.m_dataSources;
};
oFF.PlanningModel.prototype.getEpmPlanningAction = function(actionType, packageName, actionLocalName)
{
	return this.getEpmPlanningActionByFqn(oFF.EpmPlanningAction.getFullyQualifiedNameWithType(actionType, packageName, actionLocalName));
};
oFF.PlanningModel.prototype.getEpmPlanningActionByFqn = function(fullyQualifiedName)
{
	return this.m_epmPlanningActions.getByKey(fullyQualifiedName);
};
oFF.PlanningModel.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_MODEL;
};
oFF.PlanningModel.prototype.getPersistenceType = function()
{
	return this.m_persistenceType;
};
oFF.PlanningModel.prototype.getPlanningCapabilities = function()
{
	let olapEnvironment = this.getPlanningService().getApplication().getOlapEnvironment();
	let systemContainer = olapEnvironment.getSystemContainer(this.getPlanningService().getServiceConfig().getSystemName());
	return systemContainer.getServiceCapabilities(oFF.ServerService.PLANNING);
};
oFF.PlanningModel.prototype.getPlanningContextType = function()
{
	return oFF.PlanningContextType.PLANNING_MODEL;
};
oFF.PlanningModel.prototype.getPlanningModelBehaviour = function()
{
	return this.m_planningModelBehaviour;
};
oFF.PlanningModel.prototype.getPlanningModelName = function()
{
	return this.m_planningModelName;
};
oFF.PlanningModel.prototype.getPlanningModelSchema = function()
{
	return this.m_planningModelSchema;
};
oFF.PlanningModel.prototype.getQueryConsumerServices = function()
{
	this.checkModelInitialized();
	return oFF.PlanningModelUtil.getQueryConsumerServices(this);
};
oFF.PlanningModel.prototype.getQueryDataSources = function()
{
	this.checkModelInitialized();
	let result = oFF.XList.create();
	result.addAll(this.m_dataSources);
	return result;
};
oFF.PlanningModel.prototype.getSharedVersions = function()
{
	return this._getVersions(false, true, true);
};
oFF.PlanningModel.prototype.getVersionActionParameters = function()
{
	return oFF.EpmVersionActionParameters.create();
};
oFF.PlanningModel.prototype.getVersionById = function(versionIdentifier, versionDescription)
{
	this.checkModelInitialized();
	let planningVersion = this.getVersionByIdInternal(versionIdentifier);
	if (oFF.isNull(planningVersion))
	{
		planningVersion = oFF.PlanningVersion.create();
		planningVersion.setPlanningModel(this);
		planningVersion.setVersionIdentifier(versionIdentifier);
		planningVersion.setVersionDescription(versionDescription);
		planningVersion.updateInvalidPrivileges();
		this.m_versionsMap.put(versionIdentifier.getVersionUniqueName(), planningVersion);
		this.m_versionsList.add(planningVersion);
	}
	else if (planningVersion.getVersionState() === null)
	{
		planningVersion.setVersionDescription(versionDescription);
	}
	return planningVersion;
};
oFF.PlanningModel.prototype.getVersionByIdInternal = function(versionIdentifier)
{
	return this.m_versionsMap.getByKey(versionIdentifier.getVersionUniqueName());
};
oFF.PlanningModel.prototype.getVersionIdentifier = function(versionId, sharedVersion, versionOwner)
{
	return oFF.PlanningVersionIdentifier.create(versionId, sharedVersion, versionOwner);
};
oFF.PlanningModel.prototype.getVersionIdentifier2 = function(versionKey, sharedVersion, versionOwner)
{
	return oFF.PlanningVersionIdentifier.create2(versionKey, sharedVersion, versionOwner);
};
oFF.PlanningModel.prototype.getVersionParametersMetadata = function()
{
	return this.m_versionParametersMetadata;
};
oFF.PlanningModel.prototype.getVersionParametersMetadataInternal = function()
{
	return this.m_versionParametersMetadata;
};
oFF.PlanningModel.prototype.getVersionPrivilege = function(queryDataSource, planningVersionId, planningPrivilege, grantee)
{
	return this.getVersionPrivilegeById(queryDataSource, this.getVersionIdentifier(planningVersionId, false, null), planningPrivilege, grantee);
};
oFF.PlanningModel.prototype.getVersionPrivilegeById = function(queryDataSource, planningVersionIdentifier, planningPrivilege, grantee)
{
	if (!this.isVersionPrivilegesInitialized())
	{
		throw oFF.XException.createIllegalStateException("version privileges are not yet initialized");
	}
	if (planningVersionIdentifier.isSharedVersion())
	{
		oFF.noSupport();
	}
	let qualifiedName = oFF.PlanningVersionPrivilege.createQualifiedName(this, queryDataSource, planningVersionIdentifier, planningPrivilege, grantee);
	let result = this.m_privilegesMap.getByKey(qualifiedName);
	if (oFF.isNull(result))
	{
		let newPlanningVersionPrivilege = oFF.PlanningVersionPrivilege.create(this, queryDataSource, planningVersionIdentifier, planningPrivilege, grantee);
		if (!oFF.XString.isEqual(newPlanningVersionPrivilege.getQualifiedName(), qualifiedName))
		{
			throw oFF.XException.createIllegalStateException("illegal qualified name");
		}
		this.m_privileges.add(newPlanningVersionPrivilege);
		this.m_privilegesMap.put(qualifiedName, newPlanningVersionPrivilege);
		result = newPlanningVersionPrivilege;
	}
	return result;
};
oFF.PlanningModel.prototype.getVersionPrivileges = function()
{
	if (!this.isVersionPrivilegesInitialized())
	{
		throw oFF.XException.createIllegalStateException("version privileges are not yet initialized");
	}
	return this.m_privileges;
};
oFF.PlanningModel.prototype.getVersions = function()
{
	return this._getVersions(true, false, true);
};
oFF.PlanningModel.prototype.hasActiveActionSequences = function()
{
	if (!this.isModelInitialized())
	{
		return false;
	}
	let versions = this.getAllVersions();
	if (oFF.isNull(versions))
	{
		return false;
	}
	for (let i = 0; i < versions.size(); i++)
	{
		let version = versions.get(i);
		if (oFF.isNull(version))
		{
			continue;
		}
		if (version.isActionSequenceActive())
		{
			return true;
		}
	}
	return false;
};
oFF.PlanningModel.prototype.hasActiveActions = function()
{
	if (!this.isModelInitialized())
	{
		return false;
	}
	let versions = this.getAllVersions();
	if (oFF.isNull(versions))
	{
		return false;
	}
	for (let i = 0; i < versions.size(); i++)
	{
		let version = versions.get(i);
		if (oFF.isNull(version))
		{
			continue;
		}
		if (version.isActionActive())
		{
			return true;
		}
	}
	return false;
};
oFF.PlanningModel.prototype.hasChangedData = function()
{
	for (let i = 0; i < this.m_versionsList.size(); i++)
	{
		let version = this.m_versionsList.get(i);
		if (version.getVersionState() === oFF.PlanningVersionState.CHANGED)
		{
			return true;
		}
	}
	return false;
};
oFF.PlanningModel.prototype.hasChangedVersionPrivileges = function()
{
	if (!this.isVersionPrivilegesInitialized())
	{
		return false;
	}
	let versionPrivileges = this.getVersionPrivileges();
	if (oFF.isNull(versionPrivileges) || versionPrivileges.isEmpty())
	{
		return false;
	}
	for (let i = 0; i < versionPrivileges.size(); i++)
	{
		let versionPrivilege = versionPrivileges.get(i);
		let privilegeState = versionPrivilege.getPrivilegeState();
		if (privilegeState === oFF.PlanningPrivilegeState.TO_BE_GRANTED || privilegeState === oFF.PlanningPrivilegeState.TO_BE_REVOKED)
		{
			return true;
		}
	}
	return false;
};
oFF.PlanningModel.prototype.initializePlanningModel = function(syncType)
{
	this.m_dataSources = oFF.XList.create();
	this.m_versionsList = oFF.XList.create();
	this.m_versionsMap = oFF.XHashMapByString.create();
	this.m_epmPlanningActions = oFF.XHashMapByString.create();
	this.m_actionMetadataList = oFF.XList.create();
	this.m_privileges = oFF.XList.create();
	this.m_privilegesMap = oFF.XHashMapByString.create();
	let commandFactory = oFF.XCommandFactory.create(this.getPlanningService().getApplication());
	let cmdStep1 = commandFactory.createCommand(oFF.XCmdInitPlanningStep.CMD_NAME);
	cmdStep1.addParameter(oFF.XCmdInitPlanningStep.PARAM_I_PLANNING_MODEL, this);
	cmdStep1.addParameter(oFF.XCmdInitPlanningStep.PARAM_I_STEP, oFF.XCmdInitPlanningStep.STEP_1_REFRESH_VERSIONS);
	let cmdStep2 = commandFactory.createCommand(oFF.XCmdInitPlanningStep.CMD_NAME);
	cmdStep2.addParameter(oFF.XCmdInitPlanningStep.PARAM_I_PLANNING_MODEL, this);
	cmdStep2.addParameter(oFF.XCmdInitPlanningStep.PARAM_I_STEP, oFF.XCmdInitPlanningStep.STEP_2_INIT_VERSIONS);
	cmdStep1.setFollowUpCommand(oFF.XCommandFollowUpType.SUCCESS, cmdStep2);
	cmdStep1.processCommand(syncType, this, null);
};
oFF.PlanningModel.prototype.initializePlanningModelRequest = function(request, requestType)
{
	request.setCommandType(oFF.PlanningCommandType.PLANNING_MODEL_REQUEST);
	request.setRequestType(requestType);
	request.setPlanningContext(this);
	request.setPlanningService(this.getPlanningService());
	request.setInvalidatingResultSet(requestType.isInvalidatingResultSet());
};
oFF.PlanningModel.prototype.invalidate = function()
{
	if (!this.isModelInitialized())
	{
		return;
	}
	if (this.supportsPublicVersionEdit() && this.isPublicVersionEditInProgress())
	{
		this.setPublicVersionEditInProgress(false);
	}
	oFF.PlanningContext.prototype.invalidate.call( this );
};
oFF.PlanningModel.prototype.isModelInitialized = function()
{
	return this.m_modelInitialized;
};
oFF.PlanningModel.prototype.isPublicVersionEditInProgress = function()
{
	return this.m_isPublicVersionEditInProgress;
};
oFF.PlanningModel.prototype.isVersionDescriptionUnique = function(versionDescription)
{
	let versionIterator = this.getVersions().getIterator();
	let newDescription = oFF.XString.toLowerCase(versionDescription);
	while (versionIterator.hasNext())
	{
		let oldDescription = oFF.XString.toLowerCase(versionIterator.next().getVersionDescription());
		if (oFF.XString.isEqual(oldDescription, newDescription))
		{
			return false;
		}
	}
	return true;
};
oFF.PlanningModel.prototype.isVersionPrivilegesInitialized = function()
{
	return this.m_versionPrivilegesInitialized;
};
oFF.PlanningModel.prototype.isWithIgnoreUndesiredSharedVersions = function()
{
	return true;
};
oFF.PlanningModel.prototype.isWithSharedVersions = function()
{
	return this.m_withSharedVersions;
};
oFF.PlanningModel.prototype.isWithUniqueVersionDescriptions = function()
{
	return this.m_withUniqueVersionDescriptions;
};
oFF.PlanningModel.prototype.isWorkStatusActive = function()
{
	return false;
};
oFF.PlanningModel.prototype.onCommandProcessed = function(extResult, commandResult, customIdentifier)
{
	let planningService = this.getPlanningService();
	planningService.addAllMessages(extResult);
	this.getPlanningService()._setInitialized(this);
};
oFF.PlanningModel.prototype.publishToExistingVersion = function(parameters, syncType, versionFetchListener, identifier)
{
	let messageManager = oFF.MessageManagerSimple.createMessageManager();
	let resultCollector = oFF.XList.create();
	let consumer = (a) => {
		messageManager.addAllMessages(a);
		let subResult;
		if (a.isValid())
		{
			subResult = oFF.ExtResult.create(oFF.XBooleanValue.create(true), messageManager);
		}
		else
		{
			messageManager.addError(-4, "An fatal error occurred");
			subResult = oFF.ExtResult.create(oFF.XBooleanValue.create(false), messageManager);
		}
		resultCollector.add(subResult);
		if (oFF.notNull(versionFetchListener))
		{
			versionFetchListener.onPlanningVersionActionExecuted(subResult, subResult.getData().getBoolean(), identifier);
		}
	};
	oFF.EpmPlanningVersionRestAccessor.publishToExistingVersion(this, parameters, syncType, consumer);
	return oFF.XCollectionUtils.size(resultCollector) === 1 ? resultCollector.get(0) : null;
};
oFF.PlanningModel.prototype.publishToNewVersion = function(parameters, syncType, versionFetchListener, identifier)
{
	let messageManager = oFF.MessageManagerSimple.createMessageManager();
	let resultCollector = oFF.XList.create();
	let biConsumer = (a, b) => {
		messageManager.addAllMessages(b);
		let subResult;
		if (b.isValid())
		{
			subResult = oFF.ExtResult.create(a, messageManager);
		}
		else
		{
			messageManager.addError(-4, "An fatal error occurred");
			subResult = oFF.ExtResult.create(null, messageManager);
		}
		resultCollector.add(subResult);
		if (oFF.notNull(versionFetchListener))
		{
			versionFetchListener.onPlanningVersionFetched(subResult, a, identifier);
		}
	};
	oFF.EpmPlanningVersionRestAccessor.publishToNewVersion(this, parameters, syncType, biConsumer);
	return oFF.XCollectionUtils.size(resultCollector) === 1 ? resultCollector.get(0) : null;
};
oFF.PlanningModel.prototype.refreshVersions = function()
{
	this.checkModelInitialized();
	let command = this.createRequestRefreshVersions();
	let commandResult = command.processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(commandResult.getData(), commandResult);
};
oFF.PlanningModel.prototype.releaseObject = function()
{
	if (this.supportsPublicVersionEdit() && this.isPublicVersionEditInProgress())
	{
		this.setPublicVersionEditInProgress(false);
	}
	this.m_privileges = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_privileges);
	this.m_privilegesMap = oFF.XObjectExt.release(this.m_privilegesMap);
	this.m_planningModelSchema = null;
	this.m_backendUserName = null;
	this.m_persistenceType = null;
	this.m_planningModelBehaviour = null;
	this.m_planningModelName = null;
	this.m_versionParametersMetadata = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_versionParametersMetadata);
	this.m_versionsList = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_versionsList);
	this.m_versionsMap = oFF.XObjectExt.release(this.m_versionsMap);
	this.m_epmPlanningActions = oFF.XObjectExt.release(this.m_epmPlanningActions);
	this.m_dataSources = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_dataSources);
	this.m_actionMetadataList = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_actionMetadataList);
	this.m_actionMetadataMap = oFF.XObjectExt.release(this.m_actionMetadataMap);
	oFF.PlanningContext.prototype.releaseObject.call( this );
};
oFF.PlanningModel.prototype.resetAllVersionStates = function()
{
	if (oFF.isNull(this.m_versionsList))
	{
		return;
	}
	for (let i = 0; i < this.m_versionsList.size(); i++)
	{
		let version = this.m_versionsList.get(i);
		version.resetVersionState();
	}
};
oFF.PlanningModel.prototype.resetPlanningModel = function()
{
	if (this.supportsPublicVersionEdit() && this.isPublicVersionEditInProgress())
	{
		this.setPublicVersionEditInProgress(false);
	}
	this.m_modelInitialized = false;
	this.getActionMetadataListInternal().clear();
	this.resetAllVersionStates();
	this.updateAllInvalidPrivileges();
};
oFF.PlanningModel.prototype.savePublicVersionEdit = function(parameters, syncType, versionFetchListener, identifier)
{
	let messageManager = oFF.MessageManagerSimple.createMessageManager();
	let resultCollector = oFF.XList.create();
	let biConsumer = (a, b) => {
		messageManager.addAllMessages(b);
		let subResult;
		if (b.isValid())
		{
			subResult = oFF.ExtResult.create(a, messageManager);
		}
		else
		{
			messageManager.addError(-4, "An fatal error occurred");
			subResult = oFF.ExtResult.create(null, messageManager);
		}
		resultCollector.add(subResult);
		if (oFF.notNull(versionFetchListener))
		{
			versionFetchListener.onPlanningVersionFetched(subResult, a, identifier);
		}
	};
	oFF.EpmPlanningVersionRestAccessor.savePublicVersionEdit(this, parameters, syncType, biConsumer);
	return oFF.XCollectionUtils.size(resultCollector) === 1 ? resultCollector.get(0) : null;
};
oFF.PlanningModel.prototype.setBackendUserName = function(backendUserName)
{
	this.m_backendUserName = backendUserName;
};
oFF.PlanningModel.prototype.setModelInitialized = function()
{
	this.m_modelInitialized = true;
	this.invalidate();
};
oFF.PlanningModel.prototype.setPersistenceType = function(persistenceType)
{
	oFF.XObjectExt.assertNotNullExt(persistenceType, "persistence type must not be null");
	this.m_persistenceType = persistenceType;
};
oFF.PlanningModel.prototype.setPlanningModelBehaviour = function(planningModelBehaviour)
{
	this.m_planningModelBehaviour = planningModelBehaviour;
};
oFF.PlanningModel.prototype.setPlanningModelName = function(planningModelName)
{
	this.m_planningModelName = planningModelName;
};
oFF.PlanningModel.prototype.setPlanningModelSchema = function(planningModelSchema)
{
	this.m_planningModelSchema = planningModelSchema;
};
oFF.PlanningModel.prototype.setPublicVersionEditInProgress = function(inProgress)
{
	let services = this.getQueryConsumerServices();
	if (oFF.notNull(services))
	{
		let iterator = services.getIterator();
		while (iterator.hasNext())
		{
			let queryManager = iterator.next();
			queryManager.setPublicVersionEditPossible(inProgress);
		}
	}
	this.m_isPublicVersionEditInProgress = inProgress;
};
oFF.PlanningModel.prototype.setVersionPrivilegesInitialized = function()
{
	this.m_versionPrivilegesInitialized = true;
};
oFF.PlanningModel.prototype.setWithPublicVersionEdit = function(publicVersionEdit)
{
	this.m_withPublicVersionEdit = publicVersionEdit;
};
oFF.PlanningModel.prototype.setWithSharedVersions = function(withSharedVersions)
{
	this.m_withSharedVersions = withSharedVersions;
};
oFF.PlanningModel.prototype.setWithUniqueVersionDescriptions = function(uniqueVersionDescriptions)
{
	this.m_withUniqueVersionDescriptions = uniqueVersionDescriptions;
};
oFF.PlanningModel.prototype.startPublicVersionEdit = function(parameters, syncType, versionFetchListener, identifier)
{
	let messageManager = oFF.MessageManagerSimple.createMessageManager();
	let resultCollector = oFF.XList.create();
	let biConsumer = (a, b) => {
		messageManager.addAllMessages(b);
		let subResult;
		if (b.isValid())
		{
			subResult = oFF.ExtResult.create(a, messageManager);
		}
		else
		{
			messageManager.addError(-4, "An fatal error occurred");
			subResult = oFF.ExtResult.create(null, messageManager);
		}
		resultCollector.add(subResult);
		if (oFF.notNull(versionFetchListener))
		{
			versionFetchListener.onPlanningVersionFetched(subResult, a, identifier);
		}
	};
	oFF.EpmPlanningVersionRestAccessor.startPublicVersionEdit(this, parameters, syncType, biConsumer);
	return oFF.XCollectionUtils.size(resultCollector) === 1 ? resultCollector.get(0) : null;
};
oFF.PlanningModel.prototype.supportsChangedData = function()
{
	return true;
};
oFF.PlanningModel.prototype.supportsPlanningContextCommandType = function(planningContextCommandType)
{
	if (oFF.isNull(planningContextCommandType))
	{
		return false;
	}
	if (planningContextCommandType === oFF.PlanningContextCommandType.SAVE)
	{
		return true;
	}
	if (planningContextCommandType === oFF.PlanningContextCommandType.BACKUP)
	{
		return true;
	}
	if (planningContextCommandType === oFF.PlanningContextCommandType.REFRESH)
	{
		return true;
	}
	if (planningContextCommandType === oFF.PlanningContextCommandType.RESET)
	{
		return true;
	}
	if (planningContextCommandType === oFF.PlanningContextCommandType.CLOSE)
	{
		return true;
	}
	return planningContextCommandType === oFF.PlanningContextCommandType.HARD_DELETE;
};
oFF.PlanningModel.prototype.supportsPublicVersionEdit = function()
{
	return this.m_withPublicVersionEdit;
};
oFF.PlanningModel.prototype.supportsVersionParameters = function()
{
	return this.getPlanningCapabilities().supportsVersionParameters();
};
oFF.PlanningModel.prototype.supportsVersionPrivileges = function()
{
	return this.getPlanningCapabilities().supportsVersionPrivileges();
};
oFF.PlanningModel.prototype.supportsWorkStatus = function()
{
	return false;
};
oFF.PlanningModel.prototype.updateAllInvalidPrivileges = function()
{
	if (oFF.isNull(this.m_versionsList))
	{
		return;
	}
	for (let i = 0; i < this.m_versionsList.size(); i++)
	{
		let version = this.m_versionsList.get(i);
		version.updateInvalidPrivileges();
	}
};
oFF.PlanningModel.prototype.updateVersionPrivileges = function()
{
	this.checkModelInitialized();
	let command = this.createRequestUpdateVersionPrivileges();
	let commandResult = command.processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(commandResult.getData(), commandResult);
};
oFF.PlanningModel.prototype.updateVersionStateInternalIgnoreUndesired = function(versionStructure)
{
	let versionIdElement = oFF.PrUtils.getIntegerProperty(versionStructure, "version_id");
	if (oFF.isNull(versionIdElement))
	{
		return false;
	}
	let activeBoolean = oFF.PrUtils.getBooleanProperty(versionStructure, "active");
	if (oFF.isNull(activeBoolean))
	{
		return false;
	}
	let versionState = oFF.PlanningVersionState.lookup(versionStructure.getStringByKey("state"));
	if (oFF.isNull(versionState))
	{
		return false;
	}
	let isActive = activeBoolean.getBoolean();
	if (isActive !== versionState.isActive())
	{
		return false;
	}
	let totalChangesSize = versionStructure.getIntegerByKeyExt("changes", 0);
	let undoChangesSize = versionStructure.getIntegerByKeyExt("undo_changes", 0);
	let sharedVersion = false;
	let versionOwner = versionStructure.getStringByKey("owner");
	if (!oFF.XStringUtils.isNullOrEmpty(versionOwner) || oFF.XString.isEqual(versionOwner, this.m_backendUserName))
	{
		versionOwner = null;
	}
	let privilege = oFF.PlanningPrivilege.lookup(versionStructure.getStringByKey("privilege"));
	if (oFF.XStringUtils.isNullOrEmpty(versionOwner) && oFF.isNull(privilege))
	{
		privilege = oFF.PlanningPrivilege.OWNER;
	}
	if (privilege === oFF.PlanningPrivilege.OWNER)
	{
		versionOwner = null;
	}
	else
	{
		sharedVersion = true;
	}
	if (sharedVersion && !this.m_withSharedVersions && !oFF.XStringUtils.isNullOrEmpty(this.m_backendUserName))
	{
		return true;
	}
	if (!sharedVersion && privilege !== oFF.PlanningPrivilege.OWNER)
	{
		return false;
	}
	if (sharedVersion && privilege === oFF.PlanningPrivilege.OWNER)
	{
		return false;
	}
	let versionId = versionIdElement.getInteger();
	let versionDescription = versionStructure.getStringByKey("description");
	let planningVersionIdentifier = this.getVersionIdentifier(versionId, sharedVersion, versionOwner);
	let planningVersion = this.getVersionById(planningVersionIdentifier, versionDescription);
	if (planningVersion.getVersionState() === null)
	{
		return false;
	}
	planningVersion.setVersionState(versionState);
	planningVersion.setTotalChangesSize(totalChangesSize);
	planningVersion.setUndoChangesSize(undoChangesSize);
	return true;
};

oFF.EpmPlanningAction = function() {};
oFF.EpmPlanningAction.prototype = new oFF.EpmPlanningActionContext();
oFF.EpmPlanningAction.prototype._ff_c = "EpmPlanningAction";

oFF.EpmPlanningAction.getActionIdTriple = function(actionFqn)
{
	return oFF.XStringTokenizer.splitString(actionFqn, ":");
};
oFF.EpmPlanningAction.getFullyQualifiedNameWithType = function(actionType, packageName, actionName)
{
	return oFF.XStringUtils.concatenate5(oFF.DfNameObject.getSafeName(actionType), ":", packageName, ":", actionName);
};
oFF.EpmPlanningAction.prototype.m_packageName = null;
oFF.EpmPlanningAction.prototype.m_parameters = null;
oFF.EpmPlanningAction.prototype.m_variableContainer = null;
oFF.EpmPlanningAction.prototype.addMemberParameter = function(name, text, cubeName, dimensionName, supportsMultipleValues, isInputEnabled, isMandatory)
{
	let parameter = oFF.EpmActionMemberParameter.create(name, text, cubeName, dimensionName, supportsMultipleValues, isInputEnabled, isMandatory);
	this.m_parameters.add(parameter);
	return parameter;
};
oFF.EpmPlanningAction.prototype.addValueParameter = function(valueType, name, text, supportsMultipleValues, isInputEnabled, isMandatory)
{
	let parameter = oFF.EpmActionValueParameter.create(valueType, name, text, supportsMultipleValues, isInputEnabled, isMandatory);
	this.m_parameters.add(parameter);
	return parameter;
};
oFF.EpmPlanningAction.prototype.execute = function(syncType, listener, identifier)
{
	let resultCollector = oFF.XList.create();
	oFF.EpmPlanningActionRestAccessor.executePlanningAction(this, syncType, this.getActionExecutionProcessor(listener, identifier, resultCollector, null));
	return oFF.XCollectionUtils.getOptionalAtIndex(resultCollector, 0).orElse(null);
};
oFF.EpmPlanningAction.prototype.getActionExecutionProcessor = function(listener, identifier, resultCollector, chainedConsumer)
{
	return (c, d) => {
		let messageManager = oFF.MessageManagerSimple.createMessageManager();
		messageManager.addAllMessages(d);
		if (oFF.isNull(c))
		{
			messageManager.addError(-1, "Cannot create message execution");
		}
		else
		{
			oFF.XCollectionUtils.forEach(c.getOverallMessages(), (om) => {
				messageManager.addMessage(om);
			});
			oFF.XCollectionUtils.forEach(c.getParameterMessages(), (pm) => {
				messageManager.addMessage(pm);
			});
			oFF.XCollectionUtils.forEach(c.getTaskMessages(), (tm) => {
				messageManager.addMessage(tm);
			});
			oFF.XCollectionUtils.forEach(c.getExecutionConfigurationMessages(), (ecm) => {
				messageManager.addMessage(ecm);
			});
			if ((c.getExecutionStatus() === null || c.getExecutionStatus() === oFF.EpmJobExecutionStatus.RUNNING) && messageManager.hasErrors())
			{
				c.setExecutionStatus(oFF.EpmJobExecutionStatus.ERROR);
			}
		}
		let result = oFF.ExtResult.create(c, messageManager);
		resultCollector.add(result);
		if (oFF.notNull(listener))
		{
			listener.onPlanningExecutionUpdatedCreated(result, c, identifier);
		}
		if (oFF.notNull(chainedConsumer))
		{
			chainedConsumer(result);
		}
	};
};
oFF.EpmPlanningAction.prototype.getContinuationConsumer = function(resultCollector, listener, identifier, consumer)
{
	return (vr) => {
		if (vr.isValid())
		{
			resultCollector.clear();
			consumer(vr);
		}
		else if (oFF.notNull(listener))
		{
			listener.onPlanningExecutionUpdatedCreated(vr, vr.getData(), identifier);
		}
	};
};
oFF.EpmPlanningAction.prototype.getCubeIds = function()
{
	return this.m_variableContainer.getCubeIds();
};
oFF.EpmPlanningAction.prototype.getFullyQualifiedName = function()
{
	return oFF.XStringUtils.concatenate3(this.getPackageName(), ":", this.getName());
};
oFF.EpmPlanningAction.prototype.getPackageName = function()
{
	return this.m_packageName;
};
oFF.EpmPlanningAction.prototype.getParameters = function()
{
	return this.m_parameters;
};
oFF.EpmPlanningAction.prototype.getWaitingUpdater = function(syncType, listener, identifier, resultCollector)
{
	return (er) => {
		let ae = oFF.isNull(er) ? null : er.getData();
		if (er.isValid() && oFF.notNull(ae) && (ae.getExecutionStatus() === oFF.EpmJobExecutionStatus.RUNNING || ae.getExecutionStatus() === null))
		{
			oFF.XTimeout.timeout(500, () => {
				oFF.EpmPlanningActionRestAccessor.retrieveExecutionStatus(ae, syncType, this.getActionExecutionProcessor(null, null, resultCollector, this.getWaitingUpdater(syncType, listener, identifier, resultCollector)));
			});
		}
		else
		{
			if (oFF.notNull(listener))
			{
				listener.onPlanningExecutionUpdatedCreated(er, ae, identifier);
			}
			resultCollector.add(er);
		}
	};
};
oFF.EpmPlanningAction.prototype.isComplete = function()
{
	return this.m_variableContainer.isComplete();
};
oFF.EpmPlanningAction.prototype.readBackFromVariables = function(syncType, listener, identifier)
{
	return this.m_variableContainer.readBackFromVariables(syncType, listener, identifier);
};
oFF.EpmPlanningAction.prototype.releaseObject = function()
{
	this.m_parameters = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_parameters);
	this.m_packageName = null;
	this.m_variableContainer = oFF.XObjectExt.release(this.m_variableContainer);
	oFF.EpmPlanningActionContext.prototype.releaseObject.call( this );
};
oFF.EpmPlanningAction.prototype.retrieveDependentData = function(syncType, listener, identifier)
{
	return this.m_variableContainer.retrieveDependentData(syncType, listener, identifier);
};
oFF.EpmPlanningAction.prototype.setPackageName = function(packageName)
{
	this.m_packageName = packageName;
};
oFF.EpmPlanningAction.prototype.setupPlanningActionContext = function(context, systemType, connectionContainer)
{
	oFF.EpmPlanningActionContext.prototype.setupPlanningActionContext.call( this , context, systemType, connectionContainer);
	this.m_parameters = oFF.XListOfNameObject.create();
	this.m_variableContainer = oFF.EpmPlanningActionVariableContainer.create(this);
};
oFF.EpmPlanningAction.prototype.updateExecutionStatus = function(epmPlanningActionExecution, syncType, listener, identifier)
{
	let resultCollector = oFF.XList.create();
	oFF.EpmPlanningActionRestAccessor.retrieveExecutionStatus(epmPlanningActionExecution, syncType, this.getActionExecutionProcessor(listener, identifier, resultCollector, null));
	return oFF.XCollectionUtils.getOptionalAtIndex(resultCollector, 0).orElse(null);
};
oFF.EpmPlanningAction.prototype.validate = function(syncType, listener, identifier)
{
	let resultCollector = oFF.XList.create();
	oFF.EpmPlanningActionRestAccessor.validatePlanningAction(this, syncType, this.getActionExecutionProcessor(listener, identifier, resultCollector, null));
	return oFF.XCollectionUtils.getOptionalAtIndex(resultCollector, 0).orElse(null);
};
oFF.EpmPlanningAction.prototype.validateExecuteAndWait = function(syncType, listener, identifier)
{
	let resultCollector = oFF.XList.create();
	let isBlocking = syncType === oFF.SyncType.BLOCKING;
	let oldDispatcher = oFF.Dispatcher.getInstance();
	let newDispatcher = oldDispatcher;
	if (isBlocking)
	{
		newDispatcher = oFF.DispatcherSingleThread.create();
		oFF.Dispatcher.setInstance(newDispatcher);
	}
	oFF.EpmPlanningActionRestAccessor.validatePlanningAction(this, syncType, this.getActionExecutionProcessor(null, null, resultCollector, this.getContinuationConsumer(resultCollector, listener, identifier, (vr) => {
		oFF.EpmPlanningActionRestAccessor.executePlanningAction(this, syncType, this.getActionExecutionProcessor(null, null, resultCollector, this.getContinuationConsumer(resultCollector, listener, identifier, this.getWaitingUpdater(syncType, listener, identifier, resultCollector))));
	})));
	if (isBlocking)
	{
		newDispatcher.process();
		oFF.Dispatcher.setInstance(oldDispatcher);
		oFF.XObjectExt.release(newDispatcher);
	}
	return oFF.XCollectionUtils.getOptionalAtIndex(resultCollector, 0).orElse(null);
};

oFF.EpmPlanningActionVariableContainer = function() {};
oFF.EpmPlanningActionVariableContainer.prototype = new oFF.EpmPlanningActionContext();
oFF.EpmPlanningActionVariableContainer.prototype._ff_c = "EpmPlanningActionVariableContainer";

oFF.EpmPlanningActionVariableContainer.ALL_LEVEL_NAME = "All";
oFF.EpmPlanningActionVariableContainer.ALL_LEVEL_VALUE = "(all)";
oFF.EpmPlanningActionVariableContainer.create = function(planningAction)
{
	let instance = new oFF.EpmPlanningActionVariableContainer();
	instance.setupPlanningActionContext(planningAction.getContext(), planningAction.getSystemType(), planningAction.getConnection());
	instance.m_planningAction = oFF.XWeakReferenceUtil.getWeakRef(planningAction);
	return instance;
};
oFF.EpmPlanningActionVariableContainer.prototype.m_cubeIndex = null;
oFF.EpmPlanningActionVariableContainer.prototype.m_cubeQueryModels = null;
oFF.EpmPlanningActionVariableContainer.prototype.m_dimensions = null;
oFF.EpmPlanningActionVariableContainer.prototype.m_indexed = false;
oFF.EpmPlanningActionVariableContainer.prototype.m_planningAction = null;
oFF.EpmPlanningActionVariableContainer.prototype.m_variables = null;
oFF.EpmPlanningActionVariableContainer.prototype.activateVariableVariant = function(variableVariant, syncType, listener, customIdentifier)
{
	return null;
};
oFF.EpmPlanningActionVariableContainer.prototype.addDimensionMemberVariable = function(name, description)
{
	let variable = oFF.QDimensionMemberVariable.createDimensionMemberVariable(this.getContext(), this, name, description);
	this.m_variables.add(variable);
	return variable;
};
oFF.EpmPlanningActionVariableContainer.prototype.addSimpleTypeVariable = function(valueType, name, description, supportsMultipleValues)
{
	let variable = oFF.QSimpleTypeVariable.createSimpleTypeVariable(this.getContext(), this, valueType, name, description, supportsMultipleValues);
	this.m_variables.add(variable);
	return variable;
};
oFF.EpmPlanningActionVariableContainer.prototype.addVariable = function(variable)
{
	this.m_variables.add(variable);
};
oFF.EpmPlanningActionVariableContainer.prototype.addVariableValue = function(cartList, memberVal, hierarchyFields)
{
	let carTel = cartList.addNewCartesianElement();
	let sizeOverall = oFF.XCollectionUtils.size(hierarchyFields);
	let i;
	let memberSize = oFF.XCollectionUtils.size(memberVal);
	if (sizeOverall > 0)
	{
		let size = oFF.XMath.min(sizeOverall, memberSize);
		for (i = 0; i < size; i++)
		{
			let hierarchyFieldName = hierarchyFields.get(i);
			if (oFF.XString.isEqual(hierarchyFieldName, carTel.getFieldMetadata().getName()) || oFF.XString.isEqual(hierarchyFieldName, carTel.getFieldMetadata().getDimensionMetadata().getKeyFieldMetadata().getName()))
			{
				carTel.getLow().setString(memberVal.get(i));
			}
			else
			{
				carTel.getLow().addSupplementValue(hierarchyFieldName, memberVal.get(i));
			}
		}
	}
	else if (memberSize === 1)
	{
		carTel.getLow().setString(memberVal.get(0));
	}
};
oFF.EpmPlanningActionVariableContainer.prototype.addVariableValues = function(cartList, memberVals, hierarchyFields)
{
	oFF.XCollectionUtils.forEach(memberVals, (mv) => {
		this.addVariableValue(cartList, mv, hierarchyFields);
	});
};
oFF.EpmPlanningActionVariableContainer.prototype.cancelReInitVariables = function(syncType, listener, customIdentifier)
{
	return null;
};
oFF.EpmPlanningActionVariableContainer.prototype.checkVariables = function(syncType, listener, customIdentifier)
{
	return null;
};
oFF.EpmPlanningActionVariableContainer.prototype.clearExternalVariablesRepresentations = function()
{
	oFF.XCollectionUtils.forEach(this.m_variables, (variable) => {
		variable.setExternalRepresentation(null);
	});
};
oFF.EpmPlanningActionVariableContainer.prototype.clearVariables = function()
{
	this.m_variables.clear();
};
oFF.EpmPlanningActionVariableContainer.prototype.deleteVariableVariant = function(variableVariant, syncType, listener, customIdentifier)
{
	return null;
};
oFF.EpmPlanningActionVariableContainer.prototype.emptyVariableDefinition = function(syncType, listener, customIdentifier)
{
	return null;
};
oFF.EpmPlanningActionVariableContainer.prototype.finalizeParameterSetup = function()
{
	oFF.XCollectionUtils.forEach(this.getPlanningAction().getParameters(), (param) => {
		if (param.isMemberParameter())
		{
			let memberParameter = param;
			let dmv = this.addDimensionMemberVariable(param.getName(), param.getText());
			let queryModel = this.m_cubeQueryModels.getByKey(memberParameter.getCubeName());
			let dimension = oFF.isNull(queryModel) ? null : queryModel.getDimensionByName(memberParameter.getDimensionName());
			if (oFF.notNull(dimension))
			{
				dmv.setDimension(oFF.EpmDimensionWrapper.create(this, dimension));
				let defaultValues = memberParameter.getDefaultMemberValues();
				if (oFF.notNull(defaultValues))
				{
					dmv.setHierarchyName(memberParameter.getHierarchyName());
					if (dimension.supportsHierarchy())
					{
						let hierarchyName = dmv.getHierarchyName();
						let hierarchyActive = oFF.XStringUtils.isNotNullAndNotEmpty(hierarchyName);
						dimension.setHierarchyName(hierarchyName);
						dimension.setHierarchyActive(hierarchyActive);
						dimension.setSelectorHierarchy(hierarchyActive, hierarchyName, dimension.getInitialDrillLevel());
					}
					dmv.setDefaultMemberFilter(oFF.QFactory.createFilterCartesianListForDimensionMemberVariable(this.getContext(), dmv, dmv.getDimension().getKeyField().getMetadata(), null));
					this.addVariableValues(dmv.getMemberFilter(), memberParameter.getMemberValues(), memberParameter.getLevelFieldNames());
					this.addVariableValues(dmv.getDefaultMemberFilter(), memberParameter.getDefaultMemberValues(), memberParameter.getDefaultLevelFieldNames());
				}
			}
		}
		else
		{
			let stv = this.addSimpleTypeVariable(param.getValueType(), param.getName(), param.getText(), param.isMultiValue());
			stv.setInputEnabled(param.isInputEnabled());
			stv.setMandatory(param.isMandatory());
			let vParam = param;
			let values = oFF.XList.create();
			values.addAll(vParam.getValues());
			stv.setValues(values);
			let defaultValues = oFF.XList.create();
			defaultValues.addAll(vParam.getDefaultValues());
			stv.setDefaultValues(defaultValues);
		}
	});
};
oFF.EpmPlanningActionVariableContainer.prototype.getCubeIds = function()
{
	this.indexParameters();
	return this.m_cubeIndex;
};
oFF.EpmPlanningActionVariableContainer.prototype.getDimensionMemberVariables = function()
{
	return oFF.XStream.of(this.m_variables).filter((variable) => {
		return variable.getVariableType().isTypeOf(oFF.VariableType.DIMENSION_MEMBER_VARIABLE);
	}).map((_var) => {
		return _var;
	}).collect(oFF.XStreamCollector.toListOfNameObject());
};
oFF.EpmPlanningActionVariableContainer.prototype.getDimensions = function()
{
	return this.m_dimensions.getValuesAsReadOnlyList();
};
oFF.EpmPlanningActionVariableContainer.prototype.getHierarchyNameVariable = function(name)
{
	return oFF.XStream.of(this.m_variables).find((variable) => {
		return variable.getVariableType().isTypeOf(oFF.VariableType.HIERARCHY_NAME_VARIABLE);
	}).orElse(null);
};
oFF.EpmPlanningActionVariableContainer.prototype.getHierarchyNameVariables = function()
{
	return oFF.XStream.of(this.m_variables).filter((variable) => {
		return variable.getVariableType().isTypeOf(oFF.VariableType.HIERARCHY_NAME_VARIABLE);
	}).map((_var) => {
		return _var;
	}).collect(oFF.XStreamCollector.toListOfNameObject());
};
oFF.EpmPlanningActionVariableContainer.prototype.getHierarchyNodeVariable = function(name)
{
	return oFF.XStream.of(this.m_variables).find((variable) => {
		return variable.getVariableType().isTypeOf(oFF.VariableType.HIERARCHY_NODE_VARIABLE);
	}).orElse(null);
};
oFF.EpmPlanningActionVariableContainer.prototype.getInputEnabledAndNonTechnicalVariables = function()
{
	return oFF.XStream.of(this.m_variables).filter((variable) => {
		return variable.isInputEnabled() && !variable.isTechnicalVariable();
	}).collect(oFF.XStreamCollector.toListOfNameObject());
};
oFF.EpmPlanningActionVariableContainer.prototype.getInputEnabledVariable = function(name)
{
	return oFF.XStream.of(this.m_variables).find((variable) => {
		return variable.isInputEnabled();
	}).orElse(null);
};
oFF.EpmPlanningActionVariableContainer.prototype.getInputEnabledVariables = function()
{
	return oFF.XStream.of(this.m_variables).filter((variable) => {
		return variable.isInputEnabled();
	}).collect(oFF.XStreamCollector.toListOfNameObject());
};
oFF.EpmPlanningActionVariableContainer.prototype.getModelComponentBase = function()
{
	return this;
};
oFF.EpmPlanningActionVariableContainer.prototype.getPlanningAction = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_planningAction);
};
oFF.EpmPlanningActionVariableContainer.prototype.getSelectionTagging = function()
{
	return null;
};
oFF.EpmPlanningActionVariableContainer.prototype.getValue = function(dmv, low)
{
	let value = low.getSupplementValueString(oFF.DfNameObject.getSafeName(dmv.getDimension().getFlatKeyField()));
	if (oFF.XStringUtils.isNullOrEmpty(value))
	{
		value = low.getSupplementValueString(oFF.DfNameObject.getSafeName(dmv.getDimension().getDisplayKeyField()));
	}
	if (oFF.XStringUtils.isNullOrEmpty(value))
	{
		let dimMember = low.getDimensionMember();
		let fieldValue = oFF.isNull(dimMember) ? null : dimMember.getFieldValue(dmv.getDimension().getFlatDisplayKeyField());
		value = oFF.isNull(fieldValue) ? null : fieldValue.getString();
	}
	if (oFF.XStringUtils.isNullOrEmpty(value))
	{
		let dimMember = low.getDimensionMember();
		let fieldValue = oFF.isNull(dimMember) ? null : dimMember.getFieldValue(dmv.getDimension().getFlatKeyField());
		value = oFF.isNull(fieldValue) ? null : fieldValue.getString();
	}
	if (oFF.XStringUtils.isNullOrEmpty(value))
	{
		let dimMember = low.getDimensionMember();
		let fieldValue = oFF.isNull(dimMember) ? null : dimMember.getFieldValue(dmv.getDimension().getDisplayKeyField());
		value = oFF.isNull(fieldValue) ? null : fieldValue.getString();
	}
	if (oFF.XStringUtils.isNullOrEmpty(value))
	{
		let dimMember = low.getDimensionMember();
		let fieldValue = oFF.isNull(dimMember) ? null : dimMember.getFieldValue(dmv.getDimension().getKeyField());
		value = oFF.isNull(fieldValue) ? null : fieldValue.getString();
	}
	if (oFF.XStringUtils.isNullOrEmpty(value))
	{
		value = low.getString();
	}
	return value;
};
oFF.EpmPlanningActionVariableContainer.prototype.getVariable = function(name)
{
	return this.m_variables.getByKey(name);
};
oFF.EpmPlanningActionVariableContainer.prototype.getVariableBaseAt = function(index)
{
	return this.m_variables.get(index);
};
oFF.EpmPlanningActionVariableContainer.prototype.getVariableBaseByName = function(name)
{
	return this.m_variables.getByKey(name);
};
oFF.EpmPlanningActionVariableContainer.prototype.getVariableMode = function()
{
	return oFF.VariableMode.DIRECT_VALUE_TRANSFER;
};
oFF.EpmPlanningActionVariableContainer.prototype.getVariableProcessorState = function()
{
	return null;
};
oFF.EpmPlanningActionVariableContainer.prototype.getVariableVariants = function()
{
	return null;
};
oFF.EpmPlanningActionVariableContainer.prototype.getVariables = function()
{
	return this.m_variables;
};
oFF.EpmPlanningActionVariableContainer.prototype.hasInputEnabledAndNonTechnicalVariables = function()
{
	return oFF.XStream.of(this.m_variables).anyMatch((variable) => {
		return variable.isMandatory() && !variable.isTechnicalVariable();
	});
};
oFF.EpmPlanningActionVariableContainer.prototype.hasInputEnabledVariables = function()
{
	return oFF.XStream.of(this.m_variables).anyMatch((variable) => {
		return variable.isInputEnabled();
	});
};
oFF.EpmPlanningActionVariableContainer.prototype.hasMandatoryVariables = function()
{
	return oFF.XStream.of(this.m_variables).anyMatch((variable) => {
		return variable.isMandatory();
	});
};
oFF.EpmPlanningActionVariableContainer.prototype.hasVariables = function()
{
	return oFF.XCollectionUtils.hasElements(this.m_variables);
};
oFF.EpmPlanningActionVariableContainer.prototype.indexParameters = function()
{
	if (!this.m_indexed)
	{
		this.m_indexed = true;
		oFF.XStream.of(this.getPlanningAction().getParameters()).filter((pa) => {
			return pa.isMemberParameter();
		}).map((mp) => {
			return mp;
		}).forEach((param) => {
			this.m_cubeIndex.add(param.getCubeName());
		});
	}
};
oFF.EpmPlanningActionVariableContainer.prototype.isCancelNeeded = function()
{
	return false;
};
oFF.EpmPlanningActionVariableContainer.prototype.isComplete = function()
{
	this.indexParameters();
	return oFF.XStream.ofString(this.m_cubeIndex).allMatch((cubeId) => {
		return this.m_cubeQueryModels.containsKey(cubeId.getString());
	});
};
oFF.EpmPlanningActionVariableContainer.prototype.isDirectVariableTransferEnabled = function()
{
	return false;
};
oFF.EpmPlanningActionVariableContainer.prototype.isFailedSubmit = function()
{
	return false;
};
oFF.EpmPlanningActionVariableContainer.prototype.isProcessingAutoSubmit = function()
{
	return false;
};
oFF.EpmPlanningActionVariableContainer.prototype.isReinitNeeded = function()
{
	return false;
};
oFF.EpmPlanningActionVariableContainer.prototype.isSubmitNeeded = function()
{
	return false;
};
oFF.EpmPlanningActionVariableContainer.prototype.isSubmitted = function()
{
	return false;
};
oFF.EpmPlanningActionVariableContainer.prototype.isUsingSavedPromptsForExitVariables = function()
{
	return false;
};
oFF.EpmPlanningActionVariableContainer.prototype.onHierarchyCatalogResult = function(extResult, result, customIdentifier)
{
	let consumer = customIdentifier;
	consumer.accept(extResult, result);
};
oFF.EpmPlanningActionVariableContainer.prototype.processMemberFilters = function(dmv, mParam)
{
	oFF.XCollectionUtils.forEach(dmv.getMemberFilter(), (mf) => {
		let mfce = mf;
		let fieldName = mfce.getFieldMetadata().getName();
		let low = mfce.getLow();
		mParam.pushNewMemberValue();
		if (oFF.XCollectionUtils.hasElements(mParam.getLevelFieldNames()))
		{
			oFF.XCollectionUtils.forEach(mParam.getLevelFieldNames(), (lfn) => {
				if (oFF.XString.isEqual(lfn, fieldName))
				{
					mParam.addNewMemberValueItem(low.getString());
				}
				else
				{
					let dimMember = low.getDimensionMember();
					let fieldValue = oFF.isNull(dimMember) ? null : dimMember.getFieldValue(dmv.getDimension().getFieldByName(lfn));
					let val = oFF.isNull(fieldValue) ? null : fieldValue.getString();
					if (oFF.XStringUtils.isNullOrEmpty(val))
					{
						val = low.getSupplementValueString(lfn);
					}
					if (oFF.XStringUtils.isNullOrEmpty(val) && oFF.XString.isEqual(lfn, oFF.EpmPlanningActionVariableContainer.ALL_LEVEL_NAME))
					{
						val = oFF.EpmPlanningActionVariableContainer.ALL_LEVEL_VALUE;
					}
					mParam.addNewMemberValueItem(val);
				}
			});
		}
		else
		{
			let value = this.getValue(dmv, low);
			if (oFF.notNull(value))
			{
				mParam.addNewMemberValueItem(value);
			}
		}
	});
};
oFF.EpmPlanningActionVariableContainer.prototype.reInitVariablesAfterSubmit = function(syncType, listener, customIdentifier)
{
	return null;
};
oFF.EpmPlanningActionVariableContainer.prototype.readBackFromVariables = function(syncType, listener, identifier)
{
	let resultList = oFF.XList.create();
	let messageManager = oFF.MessageManagerSimple.createMessageManager();
	let parameters = this.getPlanningAction().getParameters();
	let size = oFF.XCollectionUtils.size(parameters);
	let parameterList = oFF.XList.create();
	oFF.XCollectionUtils.forEach(parameters, (parameter) => {
		if (parameter.isInputEnabled())
		{
			if (parameter.isValueParameter())
			{
				let stv = this.getVariable(parameter.getName());
				let vParam = parameter;
				vParam.clearValues();
				oFF.XCollectionUtils.forEach(stv.getValues(), (val) => {
					vParam.addValue(val);
				});
				parameterList.add(parameter);
			}
			else
			{
				let dmv = this.getVariable(parameter.getName());
				let mParam = parameter;
				mParam.clearMemberValues();
				mParam.clearLevelFieldNames();
				let hierarchyName = dmv.getHierarchyName();
				mParam.setHierarchyName(hierarchyName);
				let dim = dmv.getDimension();
				if (oFF.XStringUtils.isNotNullAndNotEmpty(hierarchyName))
				{
					let hun = dim.getHierarchyUniqueName(hierarchyName);
					let biconsumer = (er, hcr) => {
						parameterList.add(parameter);
						messageManager.addAllMessages(er);
						if (er.isValid() && hcr.getObjects().size() === 1 && hcr.getObjects().get(0).getHierarchyType().isLeveledHierarchy())
						{
							oFF.XCollectionUtils.forEach(hcr.getObjects().get(0).getHierarchyLevels(), (level) => {
								mParam.addLevelFieldName(level.getLevelName());
							});
						}
						this.processMemberFilters(dmv, mParam);
						if (oFF.XCollectionUtils.size(parameterList) === size)
						{
							let success = oFF.XBooleanValue.create(messageManager.isValid());
							let result = oFF.ExtResult.create(success, messageManager);
							resultList.add(result);
							if (oFF.notNull(listener))
							{
								listener.onPlanningVariableWriteback(result, success.getBoolean(), identifier);
							}
						}
					};
					dmv.getDimension().fetchHierarchyLevels(syncType, this, oFF.XBiConsumerHolder.create(biconsumer), hun);
				}
				else
				{
					this.processMemberFilters(dmv, mParam);
				}
			}
		}
		else
		{
			parameterList.add(parameter);
		}
	});
	return oFF.XCollectionUtils.getOptionalAtIndex(resultList, 0).orElse(null);
};
oFF.EpmPlanningActionVariableContainer.prototype.registerVariableProcessorStateChangedListener = function(listener, customIdentifier) {};
oFF.EpmPlanningActionVariableContainer.prototype.releaseObject = function()
{
	this.m_indexed = false;
	this.m_cubeIndex = oFF.XObjectExt.release(this.m_cubeIndex);
	oFF.EpmPlanningActionContext.prototype.releaseObject.call( this );
};
oFF.EpmPlanningActionVariableContainer.prototype.removeVariable = function(name)
{
	this.m_variables.removeElement(this.m_variables.getByKey(name));
};
oFF.EpmPlanningActionVariableContainer.prototype.resetExitOrUpdateDynamicVariable = function(syncType, listener, customIdentifier, overwriteDefaultForInputEnabledVar) {};
oFF.EpmPlanningActionVariableContainer.prototype.retrieveDependentData = function(syncType, listener, identifier)
{
	let application = this.getApplication();
	let systemName = this.getQueryManager().getSystemName();
	let resultList = oFF.XList.create();
	let messageManager = oFF.MessageManagerSimple.createMessageManager();
	oFF.XStream.ofString(this.m_cubeIndex).filter((ci) => {
		return !this.m_cubeQueryModels.containsKey(ci.getString());
	}).forEach((cubeId) => {
		oFF.EpmPlanningActionRestAccessor.retrieveSubQuery(this.getPlanningAction(), application, systemName, cubeId.getString(), syncType, (c, d) => {
			messageManager.addAllMessages(d);
			this.m_cubeQueryModels.put(cubeId.getString(), c);
			if (this.isComplete())
			{
				if (oFF.XStream.of(this.m_cubeQueryModels.getValuesAsReadOnlyList()).anyMatch((el) => {
					return oFF.isNull(el);
				}))
				{
					messageManager.addError(-1, "Model retrieval execution failed");
				}
				else
				{
					this.finalizeParameterSetup();
				}
				let result = oFF.ExtResult.create(this, messageManager);
				resultList.add(result);
				if (oFF.notNull(listener))
				{
					listener.onPlanningVariableContainerCreated(result, this, identifier);
				}
			}
		});
	});
	return oFF.XCollectionUtils.getOptionalAtIndex(resultList, 0).orElse(null);
};
oFF.EpmPlanningActionVariableContainer.prototype.saveVariableVariant = function(variableVariant, syncType, listener, customIdentifier)
{
	return null;
};
oFF.EpmPlanningActionVariableContainer.prototype.setDirectVariableTransferEnabled = function(directVariableTransfer) {};
oFF.EpmPlanningActionVariableContainer.prototype.setUseSavedPromptsForExitVariables = function(disableExitVariables) {};
oFF.EpmPlanningActionVariableContainer.prototype.setWinControlInAutoSubmitByType = function(variableType, isWinControlInAutoSubmit, isLimitToExitVariable) {};
oFF.EpmPlanningActionVariableContainer.prototype.setupPlanningActionContext = function(context, systemType, connectionContainer)
{
	oFF.EpmPlanningActionContext.prototype.setupPlanningActionContext.call( this , context, systemType, connectionContainer);
	this.m_variables = oFF.XListOfNameObject.create();
	this.m_dimensions = oFF.XHashMapByString.create();
	this.m_cubeQueryModels = oFF.XHashMapByString.create();
	this.m_cubeIndex = oFF.XHashSetOfString.create();
};
oFF.EpmPlanningActionVariableContainer.prototype.submitVariables = function(syncType, listener, customIdentifier)
{
	return null;
};
oFF.EpmPlanningActionVariableContainer.prototype.supportsCheckVariables = function()
{
	return false;
};
oFF.EpmPlanningActionVariableContainer.prototype.supportsDirectVariableTransfer = function()
{
	return true;
};
oFF.EpmPlanningActionVariableContainer.prototype.supportsMaintainsVariableVariants = function()
{
	return false;
};
oFF.EpmPlanningActionVariableContainer.prototype.supportsReInitVariables = function()
{
	return false;
};
oFF.EpmPlanningActionVariableContainer.prototype.supportsVariableMasking = function()
{
	return false;
};
oFF.EpmPlanningActionVariableContainer.prototype.transferVariables = function(syncType, listener, customIdentifier)
{
	return null;
};
oFF.EpmPlanningActionVariableContainer.prototype.transferVariablesByVariable = function(variable, syncType, listener, customIdentifier)
{
	return null;
};
oFF.EpmPlanningActionVariableContainer.prototype.unregisterVariableProcessorStateChangedListener = function(listener) {};
oFF.EpmPlanningActionVariableContainer.prototype.updateDynamicVariables = function(syncType, listener, customIdentifier) {};
oFF.EpmPlanningActionVariableContainer.prototype.updateVariableVariantValues = function(variableVariant, syncType, listener, customIdentifier)
{
	return null;
};

oFF.EpmDimensionWrapper = function() {};
oFF.EpmDimensionWrapper.prototype = new oFF.QModelComponent();
oFF.EpmDimensionWrapper.prototype._ff_c = "EpmDimensionWrapper";

oFF.EpmDimensionWrapper.create = function(planningVariableContainer, dimension)
{
	let wrapper = new oFF.EpmDimensionWrapper();
	wrapper.setupModelComponent(planningVariableContainer.getContext(), null);
	wrapper.setName(dimension.getName());
	wrapper.setText(dimension.getText());
	wrapper.m_variableContainer = oFF.XWeakReferenceUtil.getWeakRef(planningVariableContainer);
	wrapper.m_baseDimension = oFF.XWeakReferenceUtil.getWeakRef(dimension);
	return wrapper;
};
oFF.EpmDimensionWrapper.prototype.m_baseDimension = null;
oFF.EpmDimensionWrapper.prototype.m_variableContainer = null;
oFF.EpmDimensionWrapper.prototype._processVariableValueHelp = function(syncType, listener, customIdentifier, variable)
{
	let dimension = this.getBaseDimension();
	let result;
	if (variable.getVariableType().isTypeOf(oFF.VariableType.HIERARCHY_NAME_VARIABLE))
	{
		let remappingListener = oFF.isNull(listener) ? null : oFF.EpmHierarchyValueHelpListener.create(this, listener);
		let preSult = dimension.fetchHierarchyCatalog(syncType, remappingListener, customIdentifier);
		result = oFF.EpmHierarchyValueHelpListener.remap(this, preSult);
	}
	else
	{
		result = oFF.EpmMemberValueFetcher.create().fetchMemberValues(syncType, listener, customIdentifier, dimension);
	}
	return result;
};
oFF.EpmDimensionWrapper.prototype.activateHierarchy = function(name, version, dueDate)
{
	this.getBaseDimension().activateHierarchy(name, version, dueDate);
};
oFF.EpmDimensionWrapper.prototype.addMeasure = function(newMeasure)
{
	this.getBaseDimension().addMeasure(newMeasure);
};
oFF.EpmDimensionWrapper.prototype.addMeasureFromRepoImport = function(newMeasure)
{
	this.getBaseDimension().addMeasureFromRepoImport(newMeasure);
};
oFF.EpmDimensionWrapper.prototype.addModellerMember = function(member)
{
	this.getBaseDimension().addModellerMember(member);
};
oFF.EpmDimensionWrapper.prototype.addNameValuePair = function(nameValuePair)
{
	this.getBaseDimension().addNameValuePair(nameValuePair);
};
oFF.EpmDimensionWrapper.prototype.addNewBasicMeasure = function(name, text)
{
	return this.getBaseDimension().addNewBasicMeasure(name, text);
};
oFF.EpmDimensionWrapper.prototype.addNewCurrencyMeasure = function(name, text)
{
	return this.getBaseDimension().addNewCurrencyMeasure(name, text);
};
oFF.EpmDimensionWrapper.prototype.addNewExceptionAggregationMeasure = function(name, text)
{
	return this.getBaseDimension().addNewExceptionAggregationMeasure(name, text);
};
oFF.EpmDimensionWrapper.prototype.addNewFormulaMeasure = function(name, text)
{
	return this.getBaseDimension().addNewFormulaMeasure(name, text);
};
oFF.EpmDimensionWrapper.prototype.addNewParetoMeasure = function(name, text)
{
	return this.getBaseDimension().addNewParetoMeasure(name, text);
};
oFF.EpmDimensionWrapper.prototype.addNewRestrictedMeasure = function(name, text)
{
	return this.getBaseDimension().addNewRestrictedMeasure(name, text);
};
oFF.EpmDimensionWrapper.prototype.addNewRunningTotalMeasure = function(name, text)
{
	return this.getBaseDimension().addNewRunningTotalMeasure(name, text);
};
oFF.EpmDimensionWrapper.prototype.addNewUnitMeasure = function(name, text)
{
	return this.getBaseDimension().addNewUnitMeasure(name, text);
};
oFF.EpmDimensionWrapper.prototype.addNewVarianceMeasure = function(name, text)
{
	return this.getBaseDimension().addNewVarianceMeasure(name, text);
};
oFF.EpmDimensionWrapper.prototype.addPlaceholderId = function(placeholderId)
{
	this.getBaseDimension().addPlaceholderId(placeholderId);
};
oFF.EpmDimensionWrapper.prototype.addRsField = function(field)
{
	this.getBaseDimension().addRsField(field);
};
oFF.EpmDimensionWrapper.prototype.addRsField2 = function(fieldName, fieldText, presentationType, valueType, mimeType, isHierarchyNavigationField, longestAttribute)
{
	return this.getBaseDimension().addRsField2(fieldName, fieldText, presentationType, valueType, mimeType, isHierarchyNavigationField, longestAttribute);
};
oFF.EpmDimensionWrapper.prototype.addSearchForKey = function(searchValue)
{
	return this.getBaseDimension().addSearchForKey(searchValue);
};
oFF.EpmDimensionWrapper.prototype.addSearchForKeyUsingDynamicFilter = function(searchValue)
{
	return this.getBaseDimension().addSearchForKeyUsingDynamicFilter(searchValue);
};
oFF.EpmDimensionWrapper.prototype.addSearchForText = function(searchValue)
{
	return this.getBaseDimension().addSearchForText(searchValue);
};
oFF.EpmDimensionWrapper.prototype.addSearchForTextUsingDynamicFilter = function(searchValue)
{
	return this.getBaseDimension().addSearchForTextUsingDynamicFilter(searchValue);
};
oFF.EpmDimensionWrapper.prototype.addSelectorFilter = function(filterValue, field, comparisonOperator)
{
	return this.getBaseDimension().addSelectorFilter(filterValue, field, comparisonOperator);
};
oFF.EpmDimensionWrapper.prototype.addSelectorFilterForFields = function(filterValue, fields, comparisonOperator, requestParents, doWildcardSearch)
{
	return this.getBaseDimension().addSelectorFilterForFields(filterValue, fields, comparisonOperator, requestParents, doWildcardSearch);
};
oFF.EpmDimensionWrapper.prototype.addSelectorFilterForKey = function(filterValue, comparisonOperator)
{
	return this.getBaseDimension().addSelectorFilterForKey(filterValue, comparisonOperator);
};
oFF.EpmDimensionWrapper.prototype.addSelectorFilterForSpecificKeys = function(keys, displayKeys)
{
	return this.getBaseDimension().addSelectorFilterForSpecificKeys(keys, displayKeys);
};
oFF.EpmDimensionWrapper.prototype.addSelectorFilterForText = function(filterValue, comparisonOperator)
{
	return this.getBaseDimension().addSelectorFilterForText(filterValue, comparisonOperator);
};
oFF.EpmDimensionWrapper.prototype.addSelectorFilterInterval = function(lowValue, highValue, field, comparisonOperator)
{
	return this.getBaseDimension().addSelectorFilterInterval(lowValue, highValue, field, comparisonOperator);
};
oFF.EpmDimensionWrapper.prototype.addSelectorFilterIntervalForKey = function(lowValue, highValue, comparisonOperator)
{
	return this.getBaseDimension().addSelectorFilterIntervalForKey(lowValue, highValue, comparisonOperator);
};
oFF.EpmDimensionWrapper.prototype.addSelectorForValuesAndExternalFilter = function(externalFilterName, values, searchMode)
{
	this.getBaseDimension().addSelectorForValuesAndExternalFilter(externalFilterName, values, searchMode);
};
oFF.EpmDimensionWrapper.prototype.addStickyMember = function(memberName)
{
	this.getBaseDimension().addStickyMember(memberName);
};
oFF.EpmDimensionWrapper.prototype.areHierarchicalDimensionMemberNamesStoredAsFlat = function()
{
	return this.getBaseDimension().areHierarchicalDimensionMemberNamesStoredAsFlat();
};
oFF.EpmDimensionWrapper.prototype.assignFreePlaceholderToMember = function(member)
{
	this.getBaseDimension().assignFreePlaceholderToMember(member);
};
oFF.EpmDimensionWrapper.prototype.assignPlaceholderIdByAlias = function(placeholderId, aliasName)
{
	this.getBaseDimension().assignPlaceholderIdByAlias(placeholderId, aliasName);
};
oFF.EpmDimensionWrapper.prototype.baseValueTypeOnLowValueType = function(lowValueType, checkEitherHierarchy)
{
	return this.getBaseDimension().baseValueTypeOnLowValueType(lowValueType, checkEitherHierarchy);
};
oFF.EpmDimensionWrapper.prototype.baseValueTypeOnSearchCriteria = function(name, dimension, checkEitherHierarchy)
{
	return this.getBaseDimension().baseValueTypeOnSearchCriteria(name, dimension, checkEitherHierarchy);
};
oFF.EpmDimensionWrapper.prototype.canBeAggregated = function()
{
	return this.getBaseDimension().canBeAggregated();
};
oFF.EpmDimensionWrapper.prototype.clearAlternativeFieldValues = function()
{
	this.getBaseDimension().clearAlternativeFieldValues();
};
oFF.EpmDimensionWrapper.prototype.clearNonModelDefinedMemberAlternativeFieldValues = function()
{
	this.getBaseDimension().clearNonModelDefinedMemberAlternativeFieldValues();
};
oFF.EpmDimensionWrapper.prototype.clearOrphanKeyRefs = function()
{
	this.getBaseDimension().clearOrphanKeyRefs();
};
oFF.EpmDimensionWrapper.prototype.clearOthersFromConditionsVisibilitySettings = function()
{
	this.getBaseDimension().clearOthersFromConditionsVisibilitySettings();
};
oFF.EpmDimensionWrapper.prototype.clearPlaceholderIds = function()
{
	this.getBaseDimension().clearPlaceholderIds();
};
oFF.EpmDimensionWrapper.prototype.clearResultVisibilitySettings = function()
{
	this.getBaseDimension().clearResultVisibilitySettings();
};
oFF.EpmDimensionWrapper.prototype.clearSelectorFilter = function()
{
	this.getBaseDimension().clearSelectorFilter();
};
oFF.EpmDimensionWrapper.prototype.clearSelectorFilterByDimension = function(dimension)
{
	this.getBaseDimension().clearSelectorFilterByDimension(dimension);
};
oFF.EpmDimensionWrapper.prototype.clearSelectorHierarchyNode = function()
{
	this.getBaseDimension().clearSelectorHierarchyNode();
};
oFF.EpmDimensionWrapper.prototype.clearSelectorSettings = function()
{
	this.getBaseDimension().clearSelectorSettings();
};
oFF.EpmDimensionWrapper.prototype.clearStickyMembers = function()
{
	this.getBaseDimension().clearStickyMembers();
};
oFF.EpmDimensionWrapper.prototype.configureSelectorFilters = function(requestParents, keepUsingDynamicFilterForLBH)
{
	this.getBaseDimension().configureSelectorFilters(requestParents, keepUsingDynamicFilterForLBH);
};
oFF.EpmDimensionWrapper.prototype.containsStructureMember = function(name)
{
	return this.getBaseDimension().containsStructureMember(name);
};
oFF.EpmDimensionWrapper.prototype.convertToFieldLayoutType = function(type)
{
	this.getBaseDimension().convertToFieldLayoutType(type);
};
oFF.EpmDimensionWrapper.prototype.createFilterList = function()
{
	return this.getBaseDimension().createFilterList();
};
oFF.EpmDimensionWrapper.prototype.customHierarchiesIncluded = function()
{
	return this.getBaseDimension().customHierarchiesIncluded();
};
oFF.EpmDimensionWrapper.prototype.determineBestReadMode = function(context, mode)
{
	return this.getBaseDimension().determineBestReadMode(context, mode);
};
oFF.EpmDimensionWrapper.prototype.effectivelyUseHierarchyDueDateVariable = function()
{
	return this.getBaseDimension().effectivelyUseHierarchyDueDateVariable();
};
oFF.EpmDimensionWrapper.prototype.effectivelyUseHierarchyNameVariable = function()
{
	return this.getBaseDimension().effectivelyUseHierarchyNameVariable();
};
oFF.EpmDimensionWrapper.prototype.effectivelyUseHierarchyVersionVariable = function()
{
	return this.getBaseDimension().effectivelyUseHierarchyVersionVariable();
};
oFF.EpmDimensionWrapper.prototype.fetchHierarchyCatalog = function(syncType, listener, customIdentifier)
{
	return this.getBaseDimension().fetchHierarchyCatalog(syncType, listener, customIdentifier);
};
oFF.EpmDimensionWrapper.prototype.fetchHierarchyLevels = function(syncType, listener, customIdentifier, hierarchyUniqueName)
{
	return this.getBaseDimension().fetchHierarchyLevels(syncType, listener, customIdentifier, hierarchyUniqueName);
};
oFF.EpmDimensionWrapper.prototype.getAccountTypeAttributeName = function()
{
	return this.getBaseDimension().getAccountTypeAttributeName();
};
oFF.EpmDimensionWrapper.prototype.getAdditionalPeriods = function()
{
	return this.getBaseDimension().getAdditionalPeriods();
};
oFF.EpmDimensionWrapper.prototype.getAdvancedResultStructure = function()
{
	return this.getBaseDimension().getAdvancedResultStructure();
};
oFF.EpmDimensionWrapper.prototype.getAlignmentPriority = function()
{
	return this.getBaseDimension().getAlignmentPriority();
};
oFF.EpmDimensionWrapper.prototype.getAllDimensionMembers = function()
{
	return this.getBaseDimension().getAllDimensionMembers();
};
oFF.EpmDimensionWrapper.prototype.getAllFields = function()
{
	return this.getBaseDimension().getAllFields();
};
oFF.EpmDimensionWrapper.prototype.getAllStructureMembers = function()
{
	return this.getBaseDimension().getAllStructureMembers();
};
oFF.EpmDimensionWrapper.prototype.getAlternativeFieldValue = function(hierarchyKey, memberKey, fieldName, language)
{
	return this.getBaseDimension().getAlternativeFieldValue(hierarchyKey, memberKey, fieldName, language);
};
oFF.EpmDimensionWrapper.prototype.getAlternativeFieldValueFields = function(hierarchyKey, memberKey)
{
	return this.getBaseDimension().getAlternativeFieldValueFields(hierarchyKey, memberKey);
};
oFF.EpmDimensionWrapper.prototype.getAlternativeFieldValueLanguageOption = function(hierarchyKey, memberKey, fieldName)
{
	return this.getBaseDimension().getAlternativeFieldValueLanguageOption(hierarchyKey, memberKey, fieldName);
};
oFF.EpmDimensionWrapper.prototype.getAlternativeFieldValueLanguages = function(hierarchyKey, memberKey, fieldName)
{
	return this.getBaseDimension().getAlternativeFieldValueLanguages(hierarchyKey, memberKey, fieldName);
};
oFF.EpmDimensionWrapper.prototype.getAlternativeFieldValueMemberKeys = function(hierarchyKey)
{
	return this.getBaseDimension().getAlternativeFieldValueMemberKeys(hierarchyKey);
};
oFF.EpmDimensionWrapper.prototype.getAttributeByName = function(name)
{
	return this.getBaseDimension().getAttributeByName(name);
};
oFF.EpmDimensionWrapper.prototype.getAttributeContainer = function()
{
	return this.getBaseDimension().getAttributeContainer();
};
oFF.EpmDimensionWrapper.prototype.getAttributeContainerBase = function()
{
	return this.getBaseDimension().getAttributeContainerBase();
};
oFF.EpmDimensionWrapper.prototype.getAttributeViewName = function()
{
	return this.getBaseDimension().getAttributeViewName();
};
oFF.EpmDimensionWrapper.prototype.getAttributes = function()
{
	return this.getBaseDimension().getAttributes();
};
oFF.EpmDimensionWrapper.prototype.getAttributesExt = function(context)
{
	return this.getBaseDimension().getAttributesExt(context);
};
oFF.EpmDimensionWrapper.prototype.getAxis = function()
{
	return this.getBaseDimension().getAxis();
};
oFF.EpmDimensionWrapper.prototype.getAxisBase = function()
{
	return this.getBaseDimension().getAxisBase();
};
oFF.EpmDimensionWrapper.prototype.getAxisType = function()
{
	return this.getBaseDimension().getAxisType();
};
oFF.EpmDimensionWrapper.prototype.getBaseDimension = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_baseDimension);
};
oFF.EpmDimensionWrapper.prototype.getBasicStructureMembers = function()
{
	return this.getBaseDimension().getBasicStructureMembers();
};
oFF.EpmDimensionWrapper.prototype.getCacheKey = function()
{
	return this.getBaseDimension().getCacheKey();
};
oFF.EpmDimensionWrapper.prototype.getCachedMemberManager = function()
{
	return this.getBaseDimension().getCachedMemberManager();
};
oFF.EpmDimensionWrapper.prototype.getCatalogItemHierarchyUniqueName = function(hierarchyName)
{
	return this.getBaseDimension().getCatalogItemHierarchyUniqueName(hierarchyName);
};
oFF.EpmDimensionWrapper.prototype.getClientDefaultKeyField = function()
{
	return this.getBaseDimension().getClientDefaultKeyField();
};
oFF.EpmDimensionWrapper.prototype.getClientDefaultTextField = function()
{
	return this.getBaseDimension().getClientDefaultTextField();
};
oFF.EpmDimensionWrapper.prototype.getCubeBlendingPropertiesField = function()
{
	return this.getBaseDimension().getCubeBlendingPropertiesField();
};
oFF.EpmDimensionWrapper.prototype.getCustomHierarchies = function()
{
	return this.getBaseDimension().getCustomHierarchies();
};
oFF.EpmDimensionWrapper.prototype.getCustomHierarchyDefinition = function()
{
	return this.getBaseDimension().getCustomHierarchyDefinition();
};
oFF.EpmDimensionWrapper.prototype.getCustomStructureMembers = function()
{
	return this.getBaseDimension().getCustomStructureMembers();
};
oFF.EpmDimensionWrapper.prototype.getDefaultAxisType = function()
{
	return this.getBaseDimension().getDefaultAxisType();
};
oFF.EpmDimensionWrapper.prototype.getDefaultFieldLayoutType = function()
{
	return this.getBaseDimension().getDefaultFieldLayoutType();
};
oFF.EpmDimensionWrapper.prototype.getDefaultHierarchyName = function()
{
	return this.getBaseDimension().getDefaultHierarchyName();
};
oFF.EpmDimensionWrapper.prototype.getDefaultInitialDrillLevel = function()
{
	return this.getBaseDimension().getDefaultInitialDrillLevel();
};
oFF.EpmDimensionWrapper.prototype.getDefaultMemberValue = function()
{
	return this.getBaseDimension().getDefaultMemberValue();
};
oFF.EpmDimensionWrapper.prototype.getDefaultResultSetAttributes = function()
{
	return this.getBaseDimension().getDefaultResultSetAttributes();
};
oFF.EpmDimensionWrapper.prototype.getDefaultResultSetFields = function()
{
	return this.getBaseDimension().getDefaultResultSetFields();
};
oFF.EpmDimensionWrapper.prototype.getDefaultResultSetTextField = function()
{
	return this.getBaseDimension().getDefaultResultSetTextField();
};
oFF.EpmDimensionWrapper.prototype.getDesignDisplayGroupName = function()
{
	return this.getBaseDimension().getDesignDisplayGroupName();
};
oFF.EpmDimensionWrapper.prototype.getDesignDisplayGroupText = function()
{
	return this.getBaseDimension().getDesignDisplayGroupText();
};
oFF.EpmDimensionWrapper.prototype.getDimension = function()
{
	return this;
};
oFF.EpmDimensionWrapper.prototype.getDimensionMember = function(name)
{
	return this.getBaseDimension().getDimensionMember(name);
};
oFF.EpmDimensionWrapper.prototype.getDimensionMemberByDate = function(keyValue)
{
	return this.getBaseDimension().getDimensionMemberByDate(keyValue);
};
oFF.EpmDimensionWrapper.prototype.getDimensionMemberByDouble = function(keyValue)
{
	return this.getBaseDimension().getDimensionMemberByDouble(keyValue);
};
oFF.EpmDimensionWrapper.prototype.getDimensionMemberByInt = function(keyValue)
{
	return this.getBaseDimension().getDimensionMemberByInt(keyValue);
};
oFF.EpmDimensionWrapper.prototype.getDimensionMemberByLong = function(keyValue)
{
	return this.getBaseDimension().getDimensionMemberByLong(keyValue);
};
oFF.EpmDimensionWrapper.prototype.getDimensionMemberByNull = function()
{
	return this.getBaseDimension().getDimensionMemberByNull();
};
oFF.EpmDimensionWrapper.prototype.getDimensionMemberWithFormat = function(name, valueFormat)
{
	return this.getBaseDimension().getDimensionMemberWithFormat(name, valueFormat);
};
oFF.EpmDimensionWrapper.prototype.getDimensionMemberWithValue = function(name, field)
{
	return this.getBaseDimension().getDimensionMemberWithValue(name, field);
};
oFF.EpmDimensionWrapper.prototype.getDimensionType = function()
{
	return this.getBaseDimension().getDimensionType();
};
oFF.EpmDimensionWrapper.prototype.getDisplayKeyField = function()
{
	return this.getBaseDimension().getDisplayKeyField();
};
oFF.EpmDimensionWrapper.prototype.getEffectiveHierarchyDueDate = function()
{
	return this.getBaseDimension().getEffectiveHierarchyDueDate();
};
oFF.EpmDimensionWrapper.prototype.getEffectiveHierarchyVersion = function()
{
	return this.getBaseDimension().getEffectiveHierarchyVersion();
};
oFF.EpmDimensionWrapper.prototype.getEffectiveResultSetFields = function()
{
	return this.getBaseDimension().getEffectiveResultSetFields();
};
oFF.EpmDimensionWrapper.prototype.getExtendedStructureMembers = function()
{
	return this.getBaseDimension().getExtendedStructureMembers();
};
oFF.EpmDimensionWrapper.prototype.getExternalName = function()
{
	return this.getBaseDimension().getExternalName();
};
oFF.EpmDimensionWrapper.prototype.getFieldByName = function(name)
{
	return this.getBaseDimension().getFieldByName(name);
};
oFF.EpmDimensionWrapper.prototype.getFieldByNameOrAlias = function(name)
{
	return this.getBaseDimension().getFieldByNameOrAlias(name);
};
oFF.EpmDimensionWrapper.prototype.getFieldByPresentationType = function(presentationType)
{
	return this.getBaseDimension().getFieldByPresentationType(presentationType);
};
oFF.EpmDimensionWrapper.prototype.getFieldBySemanticType = function(semanticType)
{
	return this.getBaseDimension().getFieldBySemanticType(semanticType);
};
oFF.EpmDimensionWrapper.prototype.getFieldContainer = function()
{
	return this.getBaseDimension().getFieldContainer();
};
oFF.EpmDimensionWrapper.prototype.getFieldContainerBase = function()
{
	return this.getBaseDimension().getFieldContainerBase();
};
oFF.EpmDimensionWrapper.prototype.getFieldIterator = function()
{
	return this.getBaseDimension().getFieldIterator();
};
oFF.EpmDimensionWrapper.prototype.getFieldLayoutType = function()
{
	return this.getBaseDimension().getFieldLayoutType();
};
oFF.EpmDimensionWrapper.prototype.getFieldLayoutTypeExt = function(context)
{
	return this.getBaseDimension().getFieldLayoutTypeExt(context);
};
oFF.EpmDimensionWrapper.prototype.getFields = function()
{
	return this.getBaseDimension().getFields();
};
oFF.EpmDimensionWrapper.prototype.getFieldsExt = function(context)
{
	return this.getBaseDimension().getFieldsExt(context);
};
oFF.EpmDimensionWrapper.prototype.getFieldsListByActiveUsageType = function()
{
	return this.getBaseDimension().getFieldsListByActiveUsageType();
};
oFF.EpmDimensionWrapper.prototype.getFieldsListByActiveUsageTypeExt = function(context)
{
	return this.getBaseDimension().getFieldsListByActiveUsageTypeExt(context);
};
oFF.EpmDimensionWrapper.prototype.getFilter = function()
{
	return this.getBaseDimension().getFilter();
};
oFF.EpmDimensionWrapper.prototype.getFilterCapabilities = function()
{
	return this.getBaseDimension().getFilterCapabilities();
};
oFF.EpmDimensionWrapper.prototype.getFilterConsideringLinkedFilters = function()
{
	return this.getBaseDimension().getFilterConsideringLinkedFilters();
};
oFF.EpmDimensionWrapper.prototype.getFirstFieldByType = function(type)
{
	return this.getBaseDimension().getFirstFieldByType(type);
};
oFF.EpmDimensionWrapper.prototype.getFirstWeekDay = function()
{
	return this.getBaseDimension().getFirstWeekDay();
};
oFF.EpmDimensionWrapper.prototype.getFirstYearWeekIndicator = function()
{
	return this.getBaseDimension().getFirstYearWeekIndicator();
};
oFF.EpmDimensionWrapper.prototype.getFiscalDisplayPeriod = function()
{
	return this.getBaseDimension().getFiscalDisplayPeriod();
};
oFF.EpmDimensionWrapper.prototype.getFiscalEnabled = function()
{
	return this.getBaseDimension().getFiscalEnabled();
};
oFF.EpmDimensionWrapper.prototype.getFiscalPeriodPrefix = function()
{
	return this.getBaseDimension().getFiscalPeriodPrefix();
};
oFF.EpmDimensionWrapper.prototype.getFiscalShift = function()
{
	return this.getBaseDimension().getFiscalShift();
};
oFF.EpmDimensionWrapper.prototype.getFlatDisplayKeyField = function()
{
	return this.getBaseDimension().getFlatDisplayKeyField();
};
oFF.EpmDimensionWrapper.prototype.getFlatFieldsList = function()
{
	return this.getBaseDimension().getFlatFieldsList();
};
oFF.EpmDimensionWrapper.prototype.getFlatKeyField = function()
{
	return this.getBaseDimension().getFlatKeyField();
};
oFF.EpmDimensionWrapper.prototype.getFlatTextField = function()
{
	return this.getBaseDimension().getFlatTextField();
};
oFF.EpmDimensionWrapper.prototype.getFreePlaceholderIds = function()
{
	return this.getBaseDimension().getFreePlaceholderIds();
};
oFF.EpmDimensionWrapper.prototype.getGeoAreaNameField = function()
{
	return this.getBaseDimension().getGeoAreaNameField();
};
oFF.EpmDimensionWrapper.prototype.getGeoLevelField = function()
{
	return this.getBaseDimension().getGeoLevelField();
};
oFF.EpmDimensionWrapper.prototype.getGeoPointField = function()
{
	return this.getBaseDimension().getGeoPointField();
};
oFF.EpmDimensionWrapper.prototype.getGeoShapeField = function()
{
	return this.getBaseDimension().getGeoShapeField();
};
oFF.EpmDimensionWrapper.prototype.getGeoShapeHierarchies = function()
{
	return this.getBaseDimension().getGeoShapeHierarchies();
};
oFF.EpmDimensionWrapper.prototype.getGroupedDimensions = function()
{
	return this.getBaseDimension().getGroupedDimensions();
};
oFF.EpmDimensionWrapper.prototype.getGroupingDimensionNames = function()
{
	return this.getBaseDimension().getGroupingDimensionNames();
};
oFF.EpmDimensionWrapper.prototype.getGroupingDimensions = function()
{
	return this.getBaseDimension().getGroupingDimensions();
};
oFF.EpmDimensionWrapper.prototype.getHasCheckTable = function()
{
	return this.getBaseDimension().getHasCheckTable();
};
oFF.EpmDimensionWrapper.prototype.getHierarchies = function()
{
	return this.getBaseDimension().getHierarchies();
};
oFF.EpmDimensionWrapper.prototype.getHierarchy = function()
{
	return this.getBaseDimension().getHierarchy();
};
oFF.EpmDimensionWrapper.prototype.getHierarchyDisplayKeyField = function()
{
	return this.getBaseDimension().getHierarchyDisplayKeyField();
};
oFF.EpmDimensionWrapper.prototype.getHierarchyDueDate = function()
{
	return this.getBaseDimension().getHierarchyDueDate();
};
oFF.EpmDimensionWrapper.prototype.getHierarchyDueDateVariableName = function()
{
	return this.getBaseDimension().getHierarchyDueDateVariableName();
};
oFF.EpmDimensionWrapper.prototype.getHierarchyFieldsList = function()
{
	return this.getBaseDimension().getHierarchyFieldsList();
};
oFF.EpmDimensionWrapper.prototype.getHierarchyKeyField = function()
{
	return this.getBaseDimension().getHierarchyKeyField();
};
oFF.EpmDimensionWrapper.prototype.getHierarchyManager = function()
{
	return this.getBaseDimension().getHierarchyManager();
};
oFF.EpmDimensionWrapper.prototype.getHierarchyManagerBase = function()
{
	return this.getBaseDimension().getHierarchyManagerBase();
};
oFF.EpmDimensionWrapper.prototype.getHierarchyName = function()
{
	return this.getBaseDimension().getHierarchyName();
};
oFF.EpmDimensionWrapper.prototype.getHierarchyNameVariableName = function()
{
	return this.getBaseDimension().getHierarchyNameVariableName();
};
oFF.EpmDimensionWrapper.prototype.getHierarchyNavigationField = function()
{
	return this.getBaseDimension().getHierarchyNavigationField();
};
oFF.EpmDimensionWrapper.prototype.getHierarchyObjects = function()
{
	return this.getBaseDimension().getHierarchyObjects();
};
oFF.EpmDimensionWrapper.prototype.getHierarchyPathField = function()
{
	return this.getBaseDimension().getHierarchyPathField();
};
oFF.EpmDimensionWrapper.prototype.getHierarchyTextField = function()
{
	return this.getBaseDimension().getHierarchyTextField();
};
oFF.EpmDimensionWrapper.prototype.getHierarchyUniqueName = function(hierarchyName)
{
	return this.getBaseDimension().getHierarchyUniqueName(hierarchyName);
};
oFF.EpmDimensionWrapper.prototype.getHierarchyValueHelp = function(syncType)
{
	return this.getBaseDimension().getHierarchyValueHelp(syncType);
};
oFF.EpmDimensionWrapper.prototype.getHierarchyVersion = function()
{
	return this.getBaseDimension().getHierarchyVersion();
};
oFF.EpmDimensionWrapper.prototype.getHierarchyVersionVariableName = function()
{
	return this.getBaseDimension().getHierarchyVersionVariableName();
};
oFF.EpmDimensionWrapper.prototype.getId = function()
{
	return this.getBaseDimension().getId();
};
oFF.EpmDimensionWrapper.prototype.getIndexOnAxis = function()
{
	return this.getBaseDimension().getIndexOnAxis();
};
oFF.EpmDimensionWrapper.prototype.getInitialDrillLevel = function()
{
	return this.getBaseDimension().getInitialDrillLevel();
};
oFF.EpmDimensionWrapper.prototype.getInitialDrillOffset = function()
{
	return this.getBaseDimension().getInitialDrillOffset();
};
oFF.EpmDimensionWrapper.prototype.getInitialHierarchyDueDate = function()
{
	return this.getBaseDimension().getInitialHierarchyDueDate();
};
oFF.EpmDimensionWrapper.prototype.getInitialHierarchyName = function()
{
	return this.getBaseDimension().getInitialHierarchyName();
};
oFF.EpmDimensionWrapper.prototype.getInitialHierarchyVersion = function()
{
	return this.getBaseDimension().getInitialHierarchyVersion();
};
oFF.EpmDimensionWrapper.prototype.getKeyAttributesNames = function()
{
	return this.getBaseDimension().getKeyAttributesNames();
};
oFF.EpmDimensionWrapper.prototype.getKeyField = function()
{
	return this.getBaseDimension().getKeyField();
};
oFF.EpmDimensionWrapper.prototype.getKeyFieldExt = function(context)
{
	return this.getBaseDimension().getKeyFieldExt(context);
};
oFF.EpmDimensionWrapper.prototype.getLeveledHierarchies = function()
{
	return this.getBaseDimension().getLeveledHierarchies();
};
oFF.EpmDimensionWrapper.prototype.getLeveledHierarchy = function(name)
{
	return this.getBaseDimension().getLeveledHierarchy(name);
};
oFF.EpmDimensionWrapper.prototype.getLoadedStructureMember = function(memberName)
{
	return this.getBaseDimension().getLoadedStructureMember(memberName);
};
oFF.EpmDimensionWrapper.prototype.getLoadedStructureMembers = function()
{
	return this.getBaseDimension().getLoadedStructureMembers();
};
oFF.EpmDimensionWrapper.prototype.getLowerLevelNodeAlignment = function()
{
	return this.getBaseDimension().getLowerLevelNodeAlignment();
};
oFF.EpmDimensionWrapper.prototype.getMainAttribute = function()
{
	return this.getBaseDimension().getMainAttribute();
};
oFF.EpmDimensionWrapper.prototype.getMaxDrillLevel = function()
{
	return this.getBaseDimension().getMaxDrillLevel();
};
oFF.EpmDimensionWrapper.prototype.getMaxRuntimeLevel = function()
{
	return this.getBaseDimension().getMaxRuntimeLevel();
};
oFF.EpmDimensionWrapper.prototype.getMeasureHelpMetadataSelector = function()
{
	return this.getBaseDimension().getMeasureHelpMetadataSelector();
};
oFF.EpmDimensionWrapper.prototype.getMemberManager = function()
{
	return this.getBaseDimension().getMemberManager();
};
oFF.EpmDimensionWrapper.prototype.getMemberOfPostedNodeVisibility = function()
{
	return this.getBaseDimension().getMemberOfPostedNodeVisibility();
};
oFF.EpmDimensionWrapper.prototype.getMetadata = function()
{
	return this.getBaseDimension().getMetadata();
};
oFF.EpmDimensionWrapper.prototype.getMetadataBase = function()
{
	return this.getBaseDimension().getMetadataBase();
};
oFF.EpmDimensionWrapper.prototype.getMixedDisplayKeyField = function()
{
	return this.getBaseDimension().getMixedDisplayKeyField();
};
oFF.EpmDimensionWrapper.prototype.getMixedDisplayKeyFieldExt = function()
{
	return this.getBaseDimension().getMixedDisplayKeyFieldExt();
};
oFF.EpmDimensionWrapper.prototype.getModelLevel = function()
{
	return this.getBaseDimension().getModelLevel();
};
oFF.EpmDimensionWrapper.prototype.getModellerMemberKeyRef = function(storageObjectName)
{
	return this.getBaseDimension().getModellerMemberKeyRef(storageObjectName);
};
oFF.EpmDimensionWrapper.prototype.getNamePathField = function()
{
	return this.getBaseDimension().getNamePathField();
};
oFF.EpmDimensionWrapper.prototype.getNameValuePair = function(name)
{
	return this.getBaseDimension().getNameValuePair(name);
};
oFF.EpmDimensionWrapper.prototype.getNameValuePairs = function()
{
	return this.getBaseDimension().getNameValuePairs();
};
oFF.EpmDimensionWrapper.prototype.getNavigationNodes = function()
{
	return this.getBaseDimension().getNavigationNodes();
};
oFF.EpmDimensionWrapper.prototype.getNextFreePlaceholderId = function()
{
	return this.getBaseDimension().getNextFreePlaceholderId();
};
oFF.EpmDimensionWrapper.prototype.getNumberOfHierarchies = function()
{
	return this.getBaseDimension().getNumberOfHierarchies();
};
oFF.EpmDimensionWrapper.prototype.getOrderedStructureMemberNames = function()
{
	return this.getBaseDimension().getOrderedStructureMemberNames();
};
oFF.EpmDimensionWrapper.prototype.getOriginalText = function()
{
	return this.getBaseDimension().getOriginalText();
};
oFF.EpmDimensionWrapper.prototype.getOverdefinedMemberManager = function()
{
	return this.getBaseDimension().getOverdefinedMemberManager();
};
oFF.EpmDimensionWrapper.prototype.getOverrideText = function()
{
	return this.getBaseDimension().getOverrideText();
};
oFF.EpmDimensionWrapper.prototype.getParentResultStructureController = function()
{
	return this.getBaseDimension().getParentResultStructureController();
};
oFF.EpmDimensionWrapper.prototype.getPeriodPrefix = function()
{
	return this.getBaseDimension().getPeriodPrefix();
};
oFF.EpmDimensionWrapper.prototype.getPlaceholderIdByAlias = function(aliasName)
{
	return this.getBaseDimension().getPlaceholderIdByAlias(aliasName);
};
oFF.EpmDimensionWrapper.prototype.getPlaceholderIdMemberMap = function()
{
	return this.getBaseDimension().getPlaceholderIdMemberMap();
};
oFF.EpmDimensionWrapper.prototype.getPlaceholderIds = function()
{
	return this.getBaseDimension().getPlaceholderIds();
};
oFF.EpmDimensionWrapper.prototype.getReadMode = function(context)
{
	return this.getBaseDimension().getReadMode(context);
};
oFF.EpmDimensionWrapper.prototype.getReadModeDefault = function(context)
{
	return this.getBaseDimension().getReadModeDefault(context);
};
oFF.EpmDimensionWrapper.prototype.getReadModeManagerBase = function()
{
	return this.getBaseDimension().getReadModeManagerBase();
};
oFF.EpmDimensionWrapper.prototype.getRestNodeName = function()
{
	return this.getBaseDimension().getRestNodeName();
};
oFF.EpmDimensionWrapper.prototype.getResultAlignment = function()
{
	return this.getBaseDimension().getResultAlignment();
};
oFF.EpmDimensionWrapper.prototype.getResultMember = function(type)
{
	return this.getBaseDimension().getResultMember(type);
};
oFF.EpmDimensionWrapper.prototype.getResultSetAttributes = function()
{
	return this.getBaseDimension().getResultSetAttributes();
};
oFF.EpmDimensionWrapper.prototype.getResultSetFields = function()
{
	return this.getBaseDimension().getResultSetFields();
};
oFF.EpmDimensionWrapper.prototype.getResultSetSorting = function()
{
	return this.getBaseDimension().getResultSetSorting();
};
oFF.EpmDimensionWrapper.prototype.getResultStructureChildren = function()
{
	return this.getBaseDimension().getResultStructureChildren();
};
oFF.EpmDimensionWrapper.prototype.getResultStructureController = function()
{
	return this.getBaseDimension().getResultStructureController();
};
oFF.EpmDimensionWrapper.prototype.getResultStructureControllerBase = function()
{
	return this.getBaseDimension().getResultStructureControllerBase();
};
oFF.EpmDimensionWrapper.prototype.getResultVisibility = function()
{
	return this.getBaseDimension().getResultVisibility();
};
oFF.EpmDimensionWrapper.prototype.getResultVisibilityByElement = function(element)
{
	return this.getBaseDimension().getResultVisibilityByElement(element);
};
oFF.EpmDimensionWrapper.prototype.getResultVisibilityByElementAndAlignment = function(alignment, element)
{
	return this.getBaseDimension().getResultVisibilityByElementAndAlignment(alignment, element);
};
oFF.EpmDimensionWrapper.prototype.getResultVisibilitySettings = function()
{
	return this.getBaseDimension().getResultVisibilitySettings();
};
oFF.EpmDimensionWrapper.prototype.getRuntimeDisplayGroupName = function()
{
	return this.getBaseDimension().getRuntimeDisplayGroupName();
};
oFF.EpmDimensionWrapper.prototype.getRuntimeDisplayGroupText = function()
{
	return this.getBaseDimension().getRuntimeDisplayGroupText();
};
oFF.EpmDimensionWrapper.prototype.getRuntimePlaceholderIdByAlias = function(aliasName)
{
	return this.getBaseDimension().getRuntimePlaceholderIdByAlias(aliasName);
};
oFF.EpmDimensionWrapper.prototype.getRuntimePlaceholderIdMemberMap = function()
{
	return this.getBaseDimension().getRuntimePlaceholderIdMemberMap();
};
oFF.EpmDimensionWrapper.prototype.getSelector = function()
{
	return this.getBaseDimension().getSelector();
};
oFF.EpmDimensionWrapper.prototype.getSelectorAttributes = function()
{
	return this.getBaseDimension().getSelectorAttributes();
};
oFF.EpmDimensionWrapper.prototype.getSelectorContainer = function()
{
	return this.getBaseDimension().getSelectorContainer();
};
oFF.EpmDimensionWrapper.prototype.getSelectorDisplayKeyField = function()
{
	return this.getBaseDimension().getSelectorDisplayKeyField();
};
oFF.EpmDimensionWrapper.prototype.getSelectorFieldLayoutType = function()
{
	return this.getBaseDimension().getSelectorFieldLayoutType();
};
oFF.EpmDimensionWrapper.prototype.getSelectorFields = function()
{
	return this.getBaseDimension().getSelectorFields();
};
oFF.EpmDimensionWrapper.prototype.getSelectorFilterUsage = function()
{
	return this.getBaseDimension().getSelectorFilterUsage();
};
oFF.EpmDimensionWrapper.prototype.getSelectorHierarchyName = function()
{
	return this.getBaseDimension().getSelectorHierarchyName();
};
oFF.EpmDimensionWrapper.prototype.getSelectorHierarchyNode = function()
{
	return this.getBaseDimension().getSelectorHierarchyNode();
};
oFF.EpmDimensionWrapper.prototype.getSelectorHierarchyNodeName = function()
{
	return this.getBaseDimension().getSelectorHierarchyNodeName();
};
oFF.EpmDimensionWrapper.prototype.getSelectorHierarchyNodeSid = function()
{
	return this.getBaseDimension().getSelectorHierarchyNodeSid();
};
oFF.EpmDimensionWrapper.prototype.getSelectorKeyField = function()
{
	return this.getBaseDimension().getSelectorKeyField();
};
oFF.EpmDimensionWrapper.prototype.getSelectorLowerLevelNodeAlignment = function()
{
	return this.getBaseDimension().getSelectorLowerLevelNodeAlignment();
};
oFF.EpmDimensionWrapper.prototype.getSelectorMaxResultRecords = function()
{
	return this.getBaseDimension().getSelectorMaxResultRecords();
};
oFF.EpmDimensionWrapper.prototype.getSelectorOrder = function()
{
	return this.getBaseDimension().getSelectorOrder();
};
oFF.EpmDimensionWrapper.prototype.getSelectorPagingEnd = function()
{
	return this.getBaseDimension().getSelectorPagingEnd();
};
oFF.EpmDimensionWrapper.prototype.getSelectorPagingStart = function()
{
	return this.getBaseDimension().getSelectorPagingStart();
};
oFF.EpmDimensionWrapper.prototype.getSelectorRootLevel = function()
{
	return this.getBaseDimension().getSelectorRootLevel();
};
oFF.EpmDimensionWrapper.prototype.getSelectorSortType = function()
{
	return this.getBaseDimension().getSelectorSortType();
};
oFF.EpmDimensionWrapper.prototype.getSelectorTextField = function()
{
	return this.getBaseDimension().getSelectorTextField();
};
oFF.EpmDimensionWrapper.prototype.getSemanticObject = function()
{
	return this.getBaseDimension().getSemanticObject();
};
oFF.EpmDimensionWrapper.prototype.getSemanticType = function()
{
	return this.getBaseDimension().getSemanticType();
};
oFF.EpmDimensionWrapper.prototype.getShouldUseActualTextField = function()
{
	return this.getBaseDimension().getShouldUseActualTextField();
};
oFF.EpmDimensionWrapper.prototype.getSkipEntries = function()
{
	return this.getBaseDimension().getSkipEntries();
};
oFF.EpmDimensionWrapper.prototype.getSkipMetadataValidationOnRepoImport = function()
{
	return this.getBaseDimension().getSkipMetadataValidationOnRepoImport();
};
oFF.EpmDimensionWrapper.prototype.getStickyMembers = function()
{
	return this.getBaseDimension().getStickyMembers();
};
oFF.EpmDimensionWrapper.prototype.getStructureLayout = function()
{
	return this.getBaseDimension().getStructureLayout();
};
oFF.EpmDimensionWrapper.prototype.getStructureMember = function(name)
{
	return this.getStructureMember(name);
};
oFF.EpmDimensionWrapper.prototype.getStructureMemberByAlias = function(aliasName)
{
	return this.getBaseDimension().getStructureMemberByAlias(aliasName);
};
oFF.EpmDimensionWrapper.prototype.getStructureMemberByAliasOrMember = function(name)
{
	return this.getBaseDimension().getStructureMemberByAliasOrMember(name);
};
oFF.EpmDimensionWrapper.prototype.getStructureMemberLazyLoader = function()
{
	return this.getBaseDimension().getStructureMemberLazyLoader();
};
oFF.EpmDimensionWrapper.prototype.getSupportedAxesTypes = function()
{
	return this.getBaseDimension().getSupportedAxesTypes();
};
oFF.EpmDimensionWrapper.prototype.getSupportedReadModes = function(context)
{
	return this.getBaseDimension().getSupportedReadModes(context);
};
oFF.EpmDimensionWrapper.prototype.getTextField = function()
{
	return this.getBaseDimension().getTextField();
};
oFF.EpmDimensionWrapper.prototype.getTimeConfigPattern = function()
{
	return this.getBaseDimension().getTimeConfigPattern();
};
oFF.EpmDimensionWrapper.prototype.getTopEntries = function()
{
	return this.getBaseDimension().getTopEntries();
};
oFF.EpmDimensionWrapper.prototype.getTotalsStructure = function()
{
	return this.getBaseDimension().getTotalsStructure();
};
oFF.EpmDimensionWrapper.prototype.getUDHWithThisDimensionIncluded = function()
{
	return this.getBaseDimension().getUDHWithThisDimensionIncluded();
};
oFF.EpmDimensionWrapper.prototype.getUnassignedMember = function()
{
	return this.getBaseDimension().getUnassignedMember();
};
oFF.EpmDimensionWrapper.prototype.getUniversalDisplayHierarchy = function()
{
	return null;
};
oFF.EpmDimensionWrapper.prototype.getUseMonthLabel = function()
{
	return this.getBaseDimension().getUseMonthLabel();
};
oFF.EpmDimensionWrapper.prototype.getValueHelpDimensionMemberWithFormat = function(name, valueType)
{
	return this.getBaseDimension().getValueHelpDimensionMemberWithFormat(name, valueType);
};
oFF.EpmDimensionWrapper.prototype.getValueType = function()
{
	return this.getBaseDimension().getValueType();
};
oFF.EpmDimensionWrapper.prototype.getVariableContainer = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_variableContainer);
};
oFF.EpmDimensionWrapper.prototype.getVirtualRootNodeName = function()
{
	return this.getBaseDimension().getVirtualRootNodeName();
};
oFF.EpmDimensionWrapper.prototype.getVisibility = function()
{
	return this.getBaseDimension().getVisibility();
};
oFF.EpmDimensionWrapper.prototype.hasAlternativeFieldValuesDefined = function()
{
	return this.getBaseDimension().hasAlternativeFieldValuesDefined();
};
oFF.EpmDimensionWrapper.prototype.hasDayTimeYYYYMMDDFormat = function()
{
	return this.getBaseDimension().hasDayTimeYYYYMMDDFormat();
};
oFF.EpmDimensionWrapper.prototype.hasDefaultLowerLevelNodeAlignment = function()
{
	return this.getBaseDimension().hasDefaultLowerLevelNodeAlignment();
};
oFF.EpmDimensionWrapper.prototype.hasExternalHierarchies = function()
{
	return this.getBaseDimension().hasExternalHierarchies();
};
oFF.EpmDimensionWrapper.prototype.hasFixedResultSetFields = function()
{
	return this.getBaseDimension().hasFixedResultSetFields();
};
oFF.EpmDimensionWrapper.prototype.hasFunctionalVariables = function()
{
	return this.getBaseDimension().hasFunctionalVariables();
};
oFF.EpmDimensionWrapper.prototype.hasNodeCondensation = function()
{
	return this.getBaseDimension().hasNodeCondensation();
};
oFF.EpmDimensionWrapper.prototype.hasPlaceHolderForHierarchyInfo = function()
{
	return this.getBaseDimension().hasPlaceHolderForHierarchyInfo();
};
oFF.EpmDimensionWrapper.prototype.hasPreviousMasterReadModes = function(contextType)
{
	return this.getBaseDimension().hasPreviousMasterReadModes(contextType);
};
oFF.EpmDimensionWrapper.prototype.hasReadModeDefault = function(context)
{
	return this.getBaseDimension().hasReadModeDefault(context);
};
oFF.EpmDimensionWrapper.prototype.hasSorting = function()
{
	return this.getBaseDimension().hasSorting();
};
oFF.EpmDimensionWrapper.prototype.hasStickyMember = function(memberName)
{
	return this.getBaseDimension().hasStickyMember(memberName);
};
oFF.EpmDimensionWrapper.prototype.hasStickyMembers = function()
{
	return this.getBaseDimension().hasStickyMembers();
};
oFF.EpmDimensionWrapper.prototype.hasSubsequentBookedReadModes = function(contextType)
{
	return this.getBaseDimension().hasSubsequentBookedReadModes(contextType);
};
oFF.EpmDimensionWrapper.prototype.hasTimeDependentHierarchies = function()
{
	return this.getBaseDimension().hasTimeDependentHierarchies();
};
oFF.EpmDimensionWrapper.prototype.hasVersionDependentHierarchies = function()
{
	return this.getBaseDimension().hasVersionDependentHierarchies();
};
oFF.EpmDimensionWrapper.prototype.hasZoomDrill = function()
{
	return this.getBaseDimension().hasZoomDrill();
};
oFF.EpmDimensionWrapper.prototype.isClustered = function()
{
	return this.getBaseDimension().isClustered();
};
oFF.EpmDimensionWrapper.prototype.isCompound = function()
{
	return this.getBaseDimension().isCompound();
};
oFF.EpmDimensionWrapper.prototype.isCumulative = function()
{
	return this.getBaseDimension().isCumulative();
};
oFF.EpmDimensionWrapper.prototype.isDesignTimeMode = function()
{
	return this.getBaseDimension().isDesignTimeMode();
};
oFF.EpmDimensionWrapper.prototype.isDisplayHierarchyFixInFilter = function()
{
	return this.getBaseDimension().isDisplayHierarchyFixInFilter();
};
oFF.EpmDimensionWrapper.prototype.isDueDateDefaultByMetadata = function()
{
	return this.getBaseDimension().isDueDateDefaultByMetadata();
};
oFF.EpmDimensionWrapper.prototype.isEffectivelyUseAnyHierarchyInfoVariable = function()
{
	return this.getBaseDimension().isEffectivelyUseAnyHierarchyInfoVariable();
};
oFF.EpmDimensionWrapper.prototype.isEnforceHierarchyDueDateVariableOrDefault = function()
{
	return this.getBaseDimension().isEnforceHierarchyDueDateVariableOrDefault();
};
oFF.EpmDimensionWrapper.prototype.isEnforceHierarchyNameVariable = function()
{
	return this.getBaseDimension().isEnforceHierarchyNameVariable();
};
oFF.EpmDimensionWrapper.prototype.isEnforceHierarchyVersionVariableOrDefault = function()
{
	return this.getBaseDimension().isEnforceHierarchyVersionVariableOrDefault();
};
oFF.EpmDimensionWrapper.prototype.isEnforcedDynamicValue = function()
{
	return this.getBaseDimension().isEnforcedDynamicValue();
};
oFF.EpmDimensionWrapper.prototype.isExplicitDrillOnFilteredNodes = function()
{
	return this.getBaseDimension().isExplicitDrillOnFilteredNodes();
};
oFF.EpmDimensionWrapper.prototype.isGroupingDimension = function()
{
	return this.getBaseDimension().isGroupingDimension();
};
oFF.EpmDimensionWrapper.prototype.isHierarchyActive = function()
{
	return this.getBaseDimension().isHierarchyActive();
};
oFF.EpmDimensionWrapper.prototype.isHierarchyActiveByDefault = function()
{
	return this.getBaseDimension().isHierarchyActiveByDefault();
};
oFF.EpmDimensionWrapper.prototype.isHierarchyAssigned = function()
{
	return this.getBaseDimension().isHierarchyAssigned();
};
oFF.EpmDimensionWrapper.prototype.isHierarchyAssignedAndActive = function()
{
	return this.getBaseDimension().isHierarchyAssignedAndActive();
};
oFF.EpmDimensionWrapper.prototype.isHierarchyMandatory = function()
{
	return this.getBaseDimension().isHierarchyMandatory();
};
oFF.EpmDimensionWrapper.prototype.isHierarchyNavigationDeltaMode = function()
{
	return this.getBaseDimension().isHierarchyNavigationDeltaMode();
};
oFF.EpmDimensionWrapper.prototype.isIgnoredOnOptimizedExport = function()
{
	return this.getBaseDimension().isIgnoredOnOptimizedExport();
};
oFF.EpmDimensionWrapper.prototype.isInitialDrillLevelZeroBased = function()
{
	return this.getBaseDimension().isInitialDrillLevelZeroBased();
};
oFF.EpmDimensionWrapper.prototype.isMeasureStructure = function()
{
	return this.getBaseDimension().isMeasureStructure();
};
oFF.EpmDimensionWrapper.prototype.isOwnerDimension = function()
{
	return this.getBaseDimension().isOwnerDimension();
};
oFF.EpmDimensionWrapper.prototype.isPartOfActiveUDH = function()
{
	return false;
};
oFF.EpmDimensionWrapper.prototype.isPrivate = function()
{
	return this.getBaseDimension().isPrivate();
};
oFF.EpmDimensionWrapper.prototype.isSelectable = function()
{
	return this.getBaseDimension().isSelectable();
};
oFF.EpmDimensionWrapper.prototype.isSelectorFilteringOnDisplayKey = function()
{
	return this.getBaseDimension().isSelectorFilteringOnDisplayKey();
};
oFF.EpmDimensionWrapper.prototype.isSelectorGettingInterval = function()
{
	return this.getBaseDimension().isSelectorGettingInterval();
};
oFF.EpmDimensionWrapper.prototype.isSelectorHierarchyActive = function()
{
	return this.getBaseDimension().isSelectorHierarchyActive();
};
oFF.EpmDimensionWrapper.prototype.isSelectorUseQueryDrillOperations = function()
{
	return this.getBaseDimension().isSelectorUseQueryDrillOperations();
};
oFF.EpmDimensionWrapper.prototype.isStructure = function()
{
	return this.getBaseDimension().isStructure();
};
oFF.EpmDimensionWrapper.prototype.isStructureMemberLazyLoadSupported = function()
{
	return this.getBaseDimension().isStructureMemberLazyLoadSupported();
};
oFF.EpmDimensionWrapper.prototype.isTechnicalDimension = function()
{
	return this.getBaseDimension().isTechnicalDimension();
};
oFF.EpmDimensionWrapper.prototype.isTimeConfigEnablePattern = function()
{
	return this.getBaseDimension().isTimeConfigEnablePattern();
};
oFF.EpmDimensionWrapper.prototype.isTotalsAlignmentOnDefault = function()
{
	return this.getBaseDimension().isTotalsAlignmentOnDefault();
};
oFF.EpmDimensionWrapper.prototype.isTotalsModified = function()
{
	return this.getBaseDimension().isTotalsModified();
};
oFF.EpmDimensionWrapper.prototype.isTotalsStructureOnDefault = function()
{
	return this.getBaseDimension().isTotalsStructureOnDefault();
};
oFF.EpmDimensionWrapper.prototype.isTotalsVisibilityOnDefault = function()
{
	return this.getBaseDimension().isTotalsVisibilityOnDefault();
};
oFF.EpmDimensionWrapper.prototype.isUniversalDisplayHierarchyDimension = function()
{
	return false;
};
oFF.EpmDimensionWrapper.prototype.isUseServerDefaultKeyField = function()
{
	return this.getBaseDimension().isUseServerDefaultKeyField();
};
oFF.EpmDimensionWrapper.prototype.isUseServerDefaultTextField = function()
{
	return this.getBaseDimension().isUseServerDefaultTextField();
};
oFF.EpmDimensionWrapper.prototype.isUsedInFilter = function(filterExpression)
{
	return this.getBaseDimension().isUsedInFilter(filterExpression);
};
oFF.EpmDimensionWrapper.prototype.isUserManaged = function()
{
	return this.getBaseDimension().isUserManaged();
};
oFF.EpmDimensionWrapper.prototype.isVisibilityFilterForDrillDisabled = function()
{
	return this.getBaseDimension().isVisibilityFilterForDrillDisabled();
};
oFF.EpmDimensionWrapper.prototype.loadStructureMembers = function(memberNames)
{
	this.getBaseDimension().loadStructureMembers(memberNames);
};
oFF.EpmDimensionWrapper.prototype.newDimensionMemberEmpty = function()
{
	return this.getBaseDimension().newDimensionMemberEmpty();
};
oFF.EpmDimensionWrapper.prototype.newHierarchy = function(name)
{
	return this.getBaseDimension().newHierarchy(name);
};
oFF.EpmDimensionWrapper.prototype.newValueHelpMembers = function()
{
	return this.getBaseDimension().newValueHelpMembers();
};
oFF.EpmDimensionWrapper.prototype.processFunctionalVariableHelp = function(syncType, listener, customIdentifier)
{
	let extResult = oFF.ExtResult.createWithErrorMessage("Valuehelp is not supported in this context");
	if (oFF.notNull(listener))
	{
		listener.onFunctionalVariablesValueHelpExecuted(extResult, customIdentifier);
	}
	return extResult;
};
oFF.EpmDimensionWrapper.prototype.processIsNodeChildOfParent = function(nodeName, parentName, syncType, listener, customIdentifier)
{
	return this.getBaseDimension().processIsNodeChildOfParent(nodeName, parentName, syncType, listener, customIdentifier);
};
oFF.EpmDimensionWrapper.prototype.processMemberHelp = function(syncType, listener, customIdentifier)
{
	return this.getBaseDimension().processMemberHelp(syncType, listener, customIdentifier);
};
oFF.EpmDimensionWrapper.prototype.processValueHelp = function(syncType, listener, customIdentifier)
{
	return this.getBaseDimension().processValueHelp(syncType, listener, customIdentifier);
};
oFF.EpmDimensionWrapper.prototype.processValueHelpResultSet = function(syncType, listener, customIdentifier)
{
	return this.getBaseDimension().processValueHelpResultSet(syncType, listener, customIdentifier);
};
oFF.EpmDimensionWrapper.prototype.processVarHelp = function(variableName, syncType, listener, customIdentifier)
{
	let variable = this.getVariableContainer().getVariable(variableName);
	return this._processVariableValueHelp(syncType, listener, customIdentifier, variable);
};
oFF.EpmDimensionWrapper.prototype.processVarHelpWithVariable = function(variable, syncType, listener, customIdentifier)
{
	return this._processVariableValueHelp(syncType, listener, customIdentifier, variable);
};
oFF.EpmDimensionWrapper.prototype.processVariableHelp = function(variableName, syncType, listener, customIdentifier)
{
	let listenerDecorator = oFF.QFactory.createValueHelpListenerDecorator(listener);
	this.processVarHelp(variableName, syncType, listenerDecorator, customIdentifier);
	return listenerDecorator.getResult();
};
oFF.EpmDimensionWrapper.prototype.processVariableHelpWithVariable = function(variable, syncType, listener, customIdentifier)
{
	let listenerDecorator = oFF.QFactory.createValueHelpListenerDecorator(listener);
	this.processVarHelpWithVariable(variable, syncType, listenerDecorator, customIdentifier);
	return listenerDecorator.getResult();
};
oFF.EpmDimensionWrapper.prototype.reOrderStructureMembers = function(orderedStructureMemberNames)
{
	this.getBaseDimension().reOrderStructureMembers(orderedStructureMemberNames);
};
oFF.EpmDimensionWrapper.prototype.removeAssignedPlaceholderId = function(placeholderId)
{
	this.getBaseDimension().removeAssignedPlaceholderId(placeholderId);
};
oFF.EpmDimensionWrapper.prototype.removeCustomMembers = function()
{
	this.getBaseDimension().removeCustomMembers();
};
oFF.EpmDimensionWrapper.prototype.removeCustomMembersWithWhiteList = function(measuresToKeep)
{
	this.getBaseDimension().removeCustomMembersWithWhiteList(measuresToKeep);
};
oFF.EpmDimensionWrapper.prototype.removeMeasure = function(name)
{
	return this.getBaseDimension().removeMeasure(name);
};
oFF.EpmDimensionWrapper.prototype.removeMeasureWithNoValidation = function(name)
{
	return this.getBaseDimension().removeMeasureWithNoValidation(name);
};
oFF.EpmDimensionWrapper.prototype.removeModellerMember = function(storageObjectName)
{
	this.getBaseDimension().removeModellerMember(storageObjectName);
};
oFF.EpmDimensionWrapper.prototype.removeOverdefinedAccount = function(name)
{
	this.getBaseDimension().removeOverdefinedAccount(name);
};
oFF.EpmDimensionWrapper.prototype.removeStickyMember = function(memberName)
{
	this.getBaseDimension().removeStickyMember(memberName);
};
oFF.EpmDimensionWrapper.prototype.reorderPlaceholderIds = function(orderedPlaceholderIds)
{
	this.getBaseDimension().reorderPlaceholderIds(orderedPlaceholderIds);
};
oFF.EpmDimensionWrapper.prototype.resetFieldsToDefault = function()
{
	this.getBaseDimension().resetFieldsToDefault();
};
oFF.EpmDimensionWrapper.prototype.resetHierarchyCatalogFetched = function()
{
	this.getBaseDimension().resetHierarchyCatalogFetched();
};
oFF.EpmDimensionWrapper.prototype.resetToDefaultReadMode = function(context)
{
	return this.getBaseDimension().resetToDefaultReadMode(context);
};
oFF.EpmDimensionWrapper.prototype.restoreTotalsAlignment = function(restoreAction, recurseChildren)
{
	this.getBaseDimension().restoreTotalsAlignment(restoreAction, recurseChildren);
};
oFF.EpmDimensionWrapper.prototype.restoreTotalsVisibility = function(restoreAction, recurseChildren)
{
	this.getBaseDimension().restoreTotalsVisibility(restoreAction, recurseChildren);
};
oFF.EpmDimensionWrapper.prototype.serializeValueHelpForPersistedInA = function()
{
	return this.getBaseDimension().serializeValueHelpForPersistedInA();
};
oFF.EpmDimensionWrapper.prototype.setAlignmentPriority = function(alignmentPriority)
{
	this.getBaseDimension().getAlignmentPriority();
};
oFF.EpmDimensionWrapper.prototype.setAlternativeFieldValue = function(hierarchyKey, memberKey, fieldName, value, language)
{
	this.getBaseDimension().setAlternativeFieldValue(hierarchyKey, memberKey, fieldName, value, language);
};
oFF.EpmDimensionWrapper.prototype.setAxis = function(axis)
{
	this.getBaseDimension().setAxis(axis);
};
oFF.EpmDimensionWrapper.prototype.setClientDefaultKeyField = function(field)
{
	this.getBaseDimension().setClientDefaultKeyField(field);
};
oFF.EpmDimensionWrapper.prototype.setClientDefaultTextField = function(field)
{
	this.getBaseDimension().setClientDefaultTextField(field);
};
oFF.EpmDimensionWrapper.prototype.setCustomHierarchyDefinition = function(customHierarchyDefinition)
{
	this.getBaseDimension().setCustomHierarchyDefinition(customHierarchyDefinition);
};
oFF.EpmDimensionWrapper.prototype.setDefaultAxisType = function(axisType)
{
	this.getBaseDimension().setDefaultAxisType(axisType);
};
oFF.EpmDimensionWrapper.prototype.setDesignTimeMode = function(designTimeMode)
{
	this.getBaseDimension().setDesignTimeMode(designTimeMode);
};
oFF.EpmDimensionWrapper.prototype.setDimensionType = function(type)
{
	this.getBaseDimension().setDimensionType(type);
};
oFF.EpmDimensionWrapper.prototype.setEnforceHierarchyDueDateVariableOrDefault = function(enforce)
{
	this.getBaseDimension().setEnforceHierarchyVersionVariableOrDefault(enforce);
};
oFF.EpmDimensionWrapper.prototype.setEnforceHierarchyNameVariable = function(enforce)
{
	this.getBaseDimension().setEnforceHierarchyVersionVariableOrDefault(enforce);
};
oFF.EpmDimensionWrapper.prototype.setEnforceHierarchyVersionVariableOrDefault = function(enforce)
{
	this.getBaseDimension().setEnforceHierarchyVersionVariableOrDefault(enforce);
};
oFF.EpmDimensionWrapper.prototype.setExplicitDrillOnFilteredNodes = function(drillOnFilteredNodes)
{
	this.getBaseDimension().setExplicitDrillOnFilteredNodes(drillOnFilteredNodes);
};
oFF.EpmDimensionWrapper.prototype.setFieldLayoutType = function(type)
{
	this.getBaseDimension().setFieldLayoutType(type);
};
oFF.EpmDimensionWrapper.prototype.setHasNodeCondensation = function(condense)
{
	this.getBaseDimension().setHasNodeCondensation(condense);
};
oFF.EpmDimensionWrapper.prototype.setHierarchicalDimensionMemberNamesStoredAsFlat = function(storeAsFlat)
{
	this.getBaseDimension().setHierarchicalDimensionMemberNamesStoredAsFlat(storeAsFlat);
};
oFF.EpmDimensionWrapper.prototype.setHierarchy = function(hierarchy)
{
	this.getBaseDimension().setHierarchy(hierarchy);
};
oFF.EpmDimensionWrapper.prototype.setHierarchyActive = function(active)
{
	return this.getBaseDimension().setHierarchyActive(active);
};
oFF.EpmDimensionWrapper.prototype.setHierarchyCatalogKeyDate = function(keyDate)
{
	this.getBaseDimension().setHierarchyCatalogKeyDate(keyDate);
};
oFF.EpmDimensionWrapper.prototype.setHierarchyDueDate = function(dueDate)
{
	this.getBaseDimension().setHierarchyDueDate(dueDate);
};
oFF.EpmDimensionWrapper.prototype.setHierarchyDueDateVariableName = function(name)
{
	this.getBaseDimension().setHierarchyDueDateVariableName(name);
};
oFF.EpmDimensionWrapper.prototype.setHierarchyName = function(name)
{
	this.getBaseDimension().setHierarchyName(name);
};
oFF.EpmDimensionWrapper.prototype.setHierarchySelection = function(name, version)
{
	this.getBaseDimension().setHierarchySelection(name, version);
};
oFF.EpmDimensionWrapper.prototype.setHierarchyVersion = function(version)
{
	this.getBaseDimension().setHierarchyVersion(version);
};
oFF.EpmDimensionWrapper.prototype.setIgnoreOnOptimizedExport = function(isIgnored)
{
	this.getBaseDimension().setIgnoreOnOptimizedExport(isIgnored);
};
oFF.EpmDimensionWrapper.prototype.setIncludeCustomHierarchies = function(includeCustomHierarchies)
{
	this.getBaseDimension().setIncludeCustomHierarchies(includeCustomHierarchies);
};
oFF.EpmDimensionWrapper.prototype.setInitialDrillLevel = function(relativeLevelCount)
{
	this.getBaseDimension().setInitialDrillLevel(relativeLevelCount);
};
oFF.EpmDimensionWrapper.prototype.setInitialDrillOffset = function(relativeLevelOffset)
{
	this.getBaseDimension().setInitialDrillOffset(relativeLevelOffset);
};
oFF.EpmDimensionWrapper.prototype.setIsCumulative = function(isEnabled)
{
	this.getBaseDimension().setIsCumulative(isEnabled);
};
oFF.EpmDimensionWrapper.prototype.setIsVisibilityFilterForDrillDisabled = function(isVisibilityFilterForDrillDisabled)
{
	this.getBaseDimension().setIsVisibilityFilterForDrillDisabled(isVisibilityFilterForDrillDisabled);
};
oFF.EpmDimensionWrapper.prototype.setLowerLevelNodeAlignment = function(alignment)
{
	this.getBaseDimension().setLowerLevelNodeAlignment(alignment);
};
oFF.EpmDimensionWrapper.prototype.setMeasureHelpMetadataSelector = function(measureHelpMetadataSelector)
{
	this.getBaseDimension().setMeasureHelpMetadataSelector(measureHelpMetadataSelector);
};
oFF.EpmDimensionWrapper.prototype.setMemberOfPostedNodeVisibility = function(visibility)
{
	this.getBaseDimension().setMemberOfPostedNodeVisibility(visibility);
};
oFF.EpmDimensionWrapper.prototype.setMetadata = function(metadata)
{
	this.getBaseDimension().setMetadata(metadata);
};
oFF.EpmDimensionWrapper.prototype.setOverrideText = function(overrideText)
{
	this.getBaseDimension().setOverrideText(overrideText);
};
oFF.EpmDimensionWrapper.prototype.setPlaceholderIds = function(placeholderIds)
{
	this.getBaseDimension().setPlaceholderIds(placeholderIds);
};
oFF.EpmDimensionWrapper.prototype.setReadMode = function(context, mode)
{
	this.getBaseDimension().setReadMode(context, mode);
};
oFF.EpmDimensionWrapper.prototype.setReadModeGraceful = function(context, mode)
{
	return this.getBaseDimension().setReadModeGraceful(context, mode);
};
oFF.EpmDimensionWrapper.prototype.setReadModeGracefulInternal = function(context, mode)
{
	return this.getBaseDimension().setReadModeGracefulInternal(context, mode);
};
oFF.EpmDimensionWrapper.prototype.setResultAlignment = function(alignment)
{
	this.getBaseDimension().setResultAlignment(alignment);
};
oFF.EpmDimensionWrapper.prototype.setResultVisibility = function(visibility)
{
	this.getBaseDimension().setResultVisibility(visibility);
};
oFF.EpmDimensionWrapper.prototype.setResultVisibilityByElement = function(element, visibility)
{
	this.getBaseDimension().setResultVisibilityByElement(element, visibility);
};
oFF.EpmDimensionWrapper.prototype.setResultVisibilityByElementAndAlignment = function(alignment, element, visibility)
{
	this.getBaseDimension().setResultVisibilityByElementAndAlignment(alignment, element, visibility);
};
oFF.EpmDimensionWrapper.prototype.setRsDimensionType = function(dimensionType)
{
	this.getBaseDimension().setRsDimensionType(dimensionType);
};
oFF.EpmDimensionWrapper.prototype.setRuntimeDisplayGroupName = function(groupName)
{
	this.getBaseDimension().setRuntimeDisplayGroupName(groupName);
};
oFF.EpmDimensionWrapper.prototype.setRuntimeDisplayGroupText = function(groupText)
{
	this.getBaseDimension().setRuntimeDisplayGroupText(groupText);
};
oFF.EpmDimensionWrapper.prototype.setSelectorCascadingReadModeAndFilter = function()
{
	this.getBaseDimension().setSelectorCascadingReadModeAndFilter();
};
oFF.EpmDimensionWrapper.prototype.setSelectorComplexSelectionRoot = function(complexSelection)
{
	this.getBaseDimension().setSelectorComplexSelectionRoot(complexSelection);
};
oFF.EpmDimensionWrapper.prototype.setSelectorCustomTextField = function(textField)
{
	this.getBaseDimension().setSelectorCustomTextField(textField);
};
oFF.EpmDimensionWrapper.prototype.setSelectorFieldLayoutType = function(type)
{
	this.getBaseDimension().setSelectorFieldLayoutType(type);
};
oFF.EpmDimensionWrapper.prototype.setSelectorFields = function(fields, addMainKeyAndTextFields)
{
	this.getBaseDimension().setSelectorFields(fields, addMainKeyAndTextFields);
};
oFF.EpmDimensionWrapper.prototype.setSelectorFilterOnDisplayKey = function(isUsingDisplayKey)
{
	this.getBaseDimension().setSelectorFilterOnDisplayKey(isUsingDisplayKey);
};
oFF.EpmDimensionWrapper.prototype.setSelectorFilterUsage = function(queryFilterUsage)
{
	this.getBaseDimension().setSelectorFilterUsage(queryFilterUsage);
};
oFF.EpmDimensionWrapper.prototype.setSelectorGettingInterval = function(doGetInterval)
{
	return this.getBaseDimension().setSelectorGettingInterval(doGetInterval);
};
oFF.EpmDimensionWrapper.prototype.setSelectorHierarchy = function(hierarchyActive, hierarchyName, initialDrillLevel)
{
	this.getBaseDimension().setSelectorHierarchy(hierarchyActive, hierarchyName, initialDrillLevel);
};
oFF.EpmDimensionWrapper.prototype.setSelectorHierarchyActive = function(isActive)
{
	this.getBaseDimension().setSelectorHierarchyActive(isActive);
};
oFF.EpmDimensionWrapper.prototype.setSelectorHierarchyName = function(hierarchyName)
{
	this.getBaseDimension().setSelectorHierarchyName(hierarchyName);
};
oFF.EpmDimensionWrapper.prototype.setSelectorHierarchyNode = function(parent)
{
	this.getBaseDimension().setSelectorHierarchyNode(parent);
};
oFF.EpmDimensionWrapper.prototype.setSelectorHierarchyNodeByName = function(parent)
{
	this.getBaseDimension().setSelectorHierarchyNodeByName(parent);
};
oFF.EpmDimensionWrapper.prototype.setSelectorHierarchyWithNodeSid = function(nodeSid, nodeName)
{
	this.getBaseDimension().setSelectorHierarchyWithNodeSid(nodeSid, nodeName);
};
oFF.EpmDimensionWrapper.prototype.setSelectorInitialDrillLevel = function(relativeLevelCount)
{
	this.getBaseDimension().setSelectorInitialDrillLevel(relativeLevelCount);
};
oFF.EpmDimensionWrapper.prototype.setSelectorLowerLevelNodeAlignment = function(alignment)
{
	this.getBaseDimension().setSelectorLowerLevelNodeAlignment(alignment);
};
oFF.EpmDimensionWrapper.prototype.setSelectorMaxResultRecords = function(maxResultRecords)
{
	this.getBaseDimension().setSelectorMaxResultRecords(maxResultRecords);
};
oFF.EpmDimensionWrapper.prototype.setSelectorOrder = function(direction)
{
	this.getBaseDimension().setSelectorOrder(direction);
};
oFF.EpmDimensionWrapper.prototype.setSelectorPaging = function(start, end)
{
	this.getBaseDimension().setSelectorPaging(start, end);
};
oFF.EpmDimensionWrapper.prototype.setSelectorPagingDefault = function()
{
	this.getBaseDimension().setSelectorPagingDefault();
};
oFF.EpmDimensionWrapper.prototype.setSelectorPagingEnd = function(end)
{
	this.getBaseDimension().setSelectorPagingEnd(end);
};
oFF.EpmDimensionWrapper.prototype.setSelectorPagingStart = function(start)
{
	this.getBaseDimension().setSelectorPagingStart(start);
};
oFF.EpmDimensionWrapper.prototype.setSelectorSortType = function(sortType)
{
	this.getBaseDimension().setSelectorSortType(sortType);
};
oFF.EpmDimensionWrapper.prototype.setSelectorUseQueryDrillOperations = function(useQueryDrillOperations)
{
	this.getBaseDimension().setSelectorUseQueryDrillOperations(useQueryDrillOperations);
};
oFF.EpmDimensionWrapper.prototype.setSelectorUseVisibilityFilter = function(isUsingVisibilityFilter)
{
	this.getBaseDimension().setSelectorUseVisibilityFilter(isUsingVisibilityFilter);
};
oFF.EpmDimensionWrapper.prototype.setSkipEntries = function(amount)
{
	this.getBaseDimension().setSkipEntries(amount);
};
oFF.EpmDimensionWrapper.prototype.setSkipMetadataValidationOnRepoImport = function(skipMetadataValidationOnRepoImport)
{
	this.getBaseDimension().setSkipMetadataValidationOnRepoImport(skipMetadataValidationOnRepoImport);
};
oFF.EpmDimensionWrapper.prototype.setStructureMemberLazyLoader = function(structureMemberLazyLoader)
{
	this.getBaseDimension().setStructureMemberLazyLoader(structureMemberLazyLoader);
};
oFF.EpmDimensionWrapper.prototype.setStructuredLayout = function(customStructureLayout)
{
	this.getBaseDimension().setStructuredLayout(customStructureLayout);
};
oFF.EpmDimensionWrapper.prototype.setTopEntries = function(amount)
{
	this.getBaseDimension().setTopEntries(amount);
};
oFF.EpmDimensionWrapper.prototype.setTotalsModified = function(totalsModified)
{
	this.getBaseDimension().setTotalsModified(totalsModified);
};
oFF.EpmDimensionWrapper.prototype.setUseDefaultDrillLevelOnChange = function(useDefaultDrillLevelOnChange)
{
	this.getBaseDimension().setUseDefaultDrillLevelOnChange(useDefaultDrillLevelOnChange);
};
oFF.EpmDimensionWrapper.prototype.setUseHierarchyDueDateVariable = function(useVariable)
{
	this.getBaseDimension().setUseHierarchyDueDateVariable(useVariable);
};
oFF.EpmDimensionWrapper.prototype.supportsAdvancedResultStructure = function()
{
	return this.getBaseDimension().supportsAdvancedResultStructure();
};
oFF.EpmDimensionWrapper.prototype.supportsAxis = function(axisType)
{
	return this.getBaseDimension().supportsAxis(axisType);
};
oFF.EpmDimensionWrapper.prototype.supportsBasicStructureMembers = function()
{
	return this.getBaseDimension().supportsBasicStructureMembers();
};
oFF.EpmDimensionWrapper.prototype.supportsCalculatedBeforeAggregation = function()
{
	return this.getBaseDimension().supportsCalculatedBeforeAggregation();
};
oFF.EpmDimensionWrapper.prototype.supportsCumulative = function()
{
	return this.getBaseDimension().supportsCumulative();
};
oFF.EpmDimensionWrapper.prototype.supportsCurrencyTranslationMembers = function()
{
	return this.getBaseDimension().supportsCurrencyTranslationMembers();
};
oFF.EpmDimensionWrapper.prototype.supportsCustomMembers = function()
{
	return this.getBaseDimension().supportsCustomMembers();
};
oFF.EpmDimensionWrapper.prototype.supportsFieldLayoutType = function(type)
{
	return this.getBaseDimension().supportsFieldLayoutType(type);
};
oFF.EpmDimensionWrapper.prototype.supportsHierarchy = function()
{
	return this.getBaseDimension().supportsHierarchy();
};
oFF.EpmDimensionWrapper.prototype.supportsLowerCase = function()
{
	return this.getBaseDimension().supportsLowerCase();
};
oFF.EpmDimensionWrapper.prototype.supportsReadMode = function(context, readMode)
{
	return this.getBaseDimension().supportsReadMode(context, readMode);
};
oFF.EpmDimensionWrapper.prototype.supportsResultAlignment = function()
{
	return this.getBaseDimension().supportsResultAlignment();
};
oFF.EpmDimensionWrapper.prototype.supportsResultVisibility = function()
{
	return this.getBaseDimension().supportsResultVisibility();
};
oFF.EpmDimensionWrapper.prototype.supportsRunningTotalMeasures = function()
{
	return this.getBaseDimension().supportsRunningTotalMeasures();
};
oFF.EpmDimensionWrapper.prototype.supportsSorting = function(sortType)
{
	return this.getBaseDimension().supportsSorting(sortType);
};
oFF.EpmDimensionWrapper.prototype.supportsTotals = function()
{
	return this.getBaseDimension().supportsTotals();
};
oFF.EpmDimensionWrapper.prototype.supportsUnitTranslationMembers = function()
{
	return this.getBaseDimension().supportsUnitTranslationMembers();
};
oFF.EpmDimensionWrapper.prototype.synchronizeAxisReadModeSettings = function(context, mode)
{
	this.getBaseDimension().synchronizeAxisReadModeSettings(context, mode);
};
oFF.EpmDimensionWrapper.prototype.useDefaultDrillLevelOnChange = function()
{
	return this.getBaseDimension().useDefaultDrillLevelOnChange();
};
oFF.EpmDimensionWrapper.prototype.useHierarchyDueDateVariable = function()
{
	return this.getBaseDimension().useHierarchyDueDateVariable();
};
oFF.EpmDimensionWrapper.prototype.useHierarchyNameVariable = function()
{
	return this.getBaseDimension().useHierarchyNameVariable();
};
oFF.EpmDimensionWrapper.prototype.useHierarchyVersionVariable = function()
{
	return this.getBaseDimension().useHierarchyVersionVariable();
};

oFF.PlanningContextCommand = function() {};
oFF.PlanningContextCommand.prototype = new oFF.PlanningCommand();
oFF.PlanningContextCommand.prototype._ff_c = "PlanningContextCommand";

oFF.PlanningContextCommand.PLANNING_CONTEXT = "PLANNING_CONTEXT";
oFF.PlanningContextCommand.PLANNING_CONTEXT_COMMAND_TYPE = "PLANNING_CONTEXT_COMMAND_TYPE";
oFF.PlanningContextCommand.prototype.getPlanningContext = function()
{
	return this.getPropertyObject(oFF.PlanningContextCommand.PLANNING_CONTEXT);
};
oFF.PlanningContextCommand.prototype.getPlanningContextCommandType = function()
{
	return this.getPropertyObject(oFF.PlanningContextCommand.PLANNING_CONTEXT_COMMAND_TYPE);
};
oFF.PlanningContextCommand.prototype.onSuccessfulCommand = function()
{
	oFF.PlanningCommand.prototype.onSuccessfulCommand.call( this );
	if (this.isInvalidatingResultSet())
	{
		this.getPlanningContext().invalidate();
	}
};
oFF.PlanningContextCommand.prototype.setPlanningContext = function(planningContext)
{
	this.setPropertyObject(oFF.PlanningContextCommand.PLANNING_CONTEXT, planningContext);
};
oFF.PlanningContextCommand.prototype.setPlanningContextCommandType = function(planningContextCommandType)
{
	this.setPropertyObject(oFF.PlanningContextCommand.PLANNING_CONTEXT_COMMAND_TYPE, planningContextCommandType);
};

oFF.PlanningContextCommandResult = function() {};
oFF.PlanningContextCommandResult.prototype = new oFF.PlanningCommandResult();
oFF.PlanningContextCommandResult.prototype._ff_c = "PlanningContextCommandResult";

oFF.PlanningContextCommandResult.prototype.getPlanningContextCommand = function()
{
	return this.getPlanningCommand();
};
oFF.PlanningContextCommandResult.prototype.initResponseStructureCommand = function(responseStructure, messageManager)
{
	let command = this.getPlanningContextCommand();
	if (command.isInvalidatingResultSet())
	{
		command.getPlanningContext().invalidate();
	}
};

oFF.PlanningCommandWithId = function() {};
oFF.PlanningCommandWithId.prototype = new oFF.PlanningCommand();
oFF.PlanningCommandWithId.prototype._ff_c = "PlanningCommandWithId";

oFF.PlanningCommandWithId.COMMAND_IDENTIFIER = "COMMAND_IDENTIFIER";
oFF.PlanningCommandWithId.PLANNING_CONTEXT = "PLANNING_CONTEXT";
oFF.PlanningCommandWithId.SELECTOR = "SELECTOR";
oFF.PlanningCommandWithId.VARIABLES = "VARIABLES";
oFF.PlanningCommandWithId.VARIABLE_HELP_PROVIDER = "VARIABLE_HELP_PROVIDER";
oFF.PlanningCommandWithId.VARIABLE_PROCESSOR = "VARIABLE_PROCESSOR";
oFF.PlanningCommandWithId.VARIABLE_PROCESSOR_PROVIDER = "VARIABLE_PROCESSOR_PROVIDER";
oFF.PlanningCommandWithId.s_variableHelpProviderFactory = null;
oFF.PlanningCommandWithId.prototype.addVariable = function(variable)
{
	let variables = this.getVariables();
	if (!variables.containsKey(variable.getName()))
	{
		variables.add(variable);
	}
};
oFF.PlanningCommandWithId.prototype.clearExternalVariablesRepresentations = function()
{
	this.queueEventing();
	oFF.QVariableUtils.clearExternalVariablesRepresentations(this.getListOfVariables());
	this.resumeEventing();
};
oFF.PlanningCommandWithId.prototype.clearVariables = function()
{
	let variables = this.getVariables();
	variables.clear();
};
oFF.PlanningCommandWithId.prototype.fillVariableRequestorDataRequestContext = oFF.noSupport;
oFF.PlanningCommandWithId.prototype.getCommandForExport = function()
{
	return this.createCommandStructure();
};
oFF.PlanningCommandWithId.prototype.getCommandIdentifier = function()
{
	return this.getPropertyObject(oFF.PlanningCommandWithId.COMMAND_IDENTIFIER);
};
oFF.PlanningCommandWithId.prototype.getDimensionAccessor = function()
{
	let selector = this.getSelector();
	if (oFF.isNull(selector))
	{
		return null;
	}
	return selector.getSelectableDimensions();
};
oFF.PlanningCommandWithId.prototype.getDimensionMemberVariables = function()
{
	return oFF.QVariableUtils.getDimensionMemberVariables(this.getListOfVariables());
};
oFF.PlanningCommandWithId.prototype.getFieldByName = function(name)
{
	let dimensions = this.getDimensionAccessor();
	for (let i = 0; i < dimensions.size(); i++)
	{
		let field = dimensions.get(i).getFieldByName(name);
		if (oFF.notNull(field))
		{
			return field;
		}
	}
	return null;
};
oFF.PlanningCommandWithId.prototype.getFieldByNameOrAlias = function(name)
{
	let dimensions = this.getDimensionAccessor();
	for (let i = 0; i < dimensions.size(); i++)
	{
		let field = dimensions.get(i).getFieldByNameOrAlias(name);
		if (oFF.notNull(field))
		{
			return field;
		}
	}
	return null;
};
oFF.PlanningCommandWithId.prototype.getHierarchyNameVariable = function(name)
{
	return oFF.QVariableUtils.getVariableByType(this.getListOfVariables(), name, oFF.VariableType.HIERARCHY_NAME_VARIABLE);
};
oFF.PlanningCommandWithId.prototype.getHierarchyNameVariables = function()
{
	return oFF.QVariableUtils.getHierarchyNameVariables(this.getListOfVariables());
};
oFF.PlanningCommandWithId.prototype.getHierarchyNodeVariable = function(name)
{
	return oFF.QVariableUtils.getVariableByType(this.getListOfVariables(), name, oFF.VariableType.HIERARCHY_NODE_VARIABLE);
};
oFF.PlanningCommandWithId.prototype.getInputEnabledAndNonTechnicalVariables = function()
{
	return oFF.QVariableUtils.getInputEnabledAndNonTechnicalVariables(this.getListOfVariables());
};
oFF.PlanningCommandWithId.prototype.getInputEnabledVariable = function(name)
{
	return oFF.QVariableUtils.getInputEnabledVariable(this.getListOfVariables(), name);
};
oFF.PlanningCommandWithId.prototype.getInputEnabledVariables = function()
{
	return oFF.QVariableUtils.getInputEnabledVariables(this.getListOfVariables());
};
oFF.PlanningCommandWithId.prototype.getListOfVariables = function()
{
	return this.getPropertyObject(oFF.PlanningCommandWithId.VARIABLES);
};
oFF.PlanningCommandWithId.prototype.getModelComponentBase = function()
{
	return null;
};
oFF.PlanningCommandWithId.prototype.getPlanningContext = function()
{
	return this.getPropertyObject(oFF.PlanningCommandWithId.PLANNING_CONTEXT);
};
oFF.PlanningCommandWithId.prototype.getSelector = function()
{
	return this.getPropertyObject(oFF.PlanningCommandWithId.SELECTOR);
};
oFF.PlanningCommandWithId.prototype.getSystemDescription = function()
{
	return this.getPlanningService().getServiceConfig().getSystemDescription();
};
oFF.PlanningCommandWithId.prototype.getSystemName = function()
{
	return this.getSystemDescription().getSystemName();
};
oFF.PlanningCommandWithId.prototype.getSystemType = function()
{
	return this.getSystemDescription().getSystemType();
};
oFF.PlanningCommandWithId.prototype.getVariableBaseAt = function(index)
{
	let variables = this.getVariables();
	return variables.get(index);
};
oFF.PlanningCommandWithId.prototype.getVariableBaseByName = function(name)
{
	let variables = this.getVariables();
	return variables.getByKey(name);
};
oFF.PlanningCommandWithId.prototype.getVariableHelpProvider = function()
{
	return this.getPropertyObject(oFF.PlanningCommandWithId.VARIABLE_HELP_PROVIDER);
};
oFF.PlanningCommandWithId.prototype.getVariableMode = function()
{
	return null;
};
oFF.PlanningCommandWithId.prototype.getVariableProcessor = function()
{
	return this.getPropertyObject(oFF.PlanningCommandWithId.VARIABLE_PROCESSOR);
};
oFF.PlanningCommandWithId.prototype.getVariableProcessorProvider = function()
{
	return this.getPropertyObject(oFF.PlanningCommandWithId.VARIABLE_PROCESSOR_PROVIDER);
};
oFF.PlanningCommandWithId.prototype.getVariables = function()
{
	let variables = this.getListOfVariables();
	if (oFF.isNull(variables))
	{
		variables = oFF.XListOfNameObject.create();
		this.setListOfVariables(variables);
	}
	return variables;
};
oFF.PlanningCommandWithId.prototype.hasInputEnabledAndNonTechnicalVariables = function()
{
	return oFF.XCollectionUtils.hasElements(this.getInputEnabledAndNonTechnicalVariables());
};
oFF.PlanningCommandWithId.prototype.hasInputEnabledVariables = function()
{
	return oFF.QVariableUtils.hasInputEnabledVariables(this.getListOfVariables());
};
oFF.PlanningCommandWithId.prototype.hasMandatoryVariables = function()
{
	return oFF.QVariableUtils.hasMandatoryVariables(this.getListOfVariables());
};
oFF.PlanningCommandWithId.prototype.hasVariables = function()
{
	return oFF.XCollectionUtils.hasElements(this.getListOfVariables());
};
oFF.PlanningCommandWithId.prototype.onSuccessfulCommand = function()
{
	oFF.PlanningCommand.prototype.onSuccessfulCommand.call( this );
	if (this.isInvalidatingResultSet())
	{
		this.getPlanningContext().invalidate();
	}
};
oFF.PlanningCommandWithId.prototype.releaseObject = function()
{
	let variableProcessorProvider = this.getVariableProcessorProvider();
	if (oFF.notNull(variableProcessorProvider))
	{
		oFF.XObjectExt.release(variableProcessorProvider);
	}
	oFF.PlanningCommand.prototype.releaseObject.call( this );
};
oFF.PlanningCommandWithId.prototype.removeVariable = function(name)
{
	let variables = this.getVariables();
	let variable = variables.getByKey(name);
	variables.removeElement(variable);
};
oFF.PlanningCommandWithId.prototype.setCommandIdentifier = function(commandIdentifier)
{
	this.setPropertyObject(oFF.PlanningCommandWithId.COMMAND_IDENTIFIER, commandIdentifier);
};
oFF.PlanningCommandWithId.prototype.setListOfVariables = function(variables)
{
	this.setPropertyObject(oFF.PlanningCommandWithId.VARIABLES, variables);
};
oFF.PlanningCommandWithId.prototype.setPlanningContext = function(planningContext)
{
	this.setPropertyObject(oFF.PlanningCommandWithId.PLANNING_CONTEXT, planningContext);
};
oFF.PlanningCommandWithId.prototype.setSelector = function(selector)
{
	this.setPropertyObject(oFF.PlanningCommandWithId.SELECTOR, selector);
};
oFF.PlanningCommandWithId.prototype.setVariableHelpProvider = function(provider)
{
	this.setPropertyObject(oFF.PlanningCommandWithId.VARIABLE_HELP_PROVIDER, provider);
};
oFF.PlanningCommandWithId.prototype.setVariableProcessorBase = function(processor)
{
	this.setPropertyObject(oFF.PlanningCommandWithId.VARIABLE_PROCESSOR, processor);
};
oFF.PlanningCommandWithId.prototype.setVariableProcessorProvider = function(provider)
{
	this.setPropertyObject(oFF.PlanningCommandWithId.VARIABLE_PROCESSOR_PROVIDER, provider);
};

oFF.PlanningCommandWithIdResult = function() {};
oFF.PlanningCommandWithIdResult.prototype = new oFF.PlanningCommandResult();
oFF.PlanningCommandWithIdResult.prototype._ff_c = "PlanningCommandWithIdResult";

oFF.PlanningCommandWithIdResult.prototype.getPlanningCommandWithId = function()
{
	return this.getPlanningCommand();
};
oFF.PlanningCommandWithIdResult.prototype.initResponseStructureCommand = function(responseStructure, messageManager)
{
	let command = this.getPlanningCommandWithId();
	if (command.isInvalidatingResultSet())
	{
		command.getPlanningContext().invalidate();
	}
};

oFF.PlanningRequest = function() {};
oFF.PlanningRequest.prototype = new oFF.PlanningCommand();
oFF.PlanningRequest.prototype._ff_c = "PlanningRequest";

oFF.PlanningRequest.PLANNING_CONTEXT = "PLANNING_CONTEXT";
oFF.PlanningRequest.prototype.getPlanningContext = function()
{
	return this.getPropertyObject(oFF.PlanningRequest.PLANNING_CONTEXT);
};
oFF.PlanningRequest.prototype.setPlanningContext = function(planningContext)
{
	this.setPropertyObject(oFF.PlanningRequest.PLANNING_CONTEXT, planningContext);
};

oFF.PlanningResponse = function() {};
oFF.PlanningResponse.prototype = new oFF.PlanningCommandResult();
oFF.PlanningResponse.prototype._ff_c = "PlanningResponse";

oFF.PlanningResponse.prototype.getPlanningRequest = function()
{
	return this.getPlanningCommand();
};

oFF.PlanningOperationIdentifier = function() {};
oFF.PlanningOperationIdentifier.prototype = new oFF.PlanningCommandIdentifier();
oFF.PlanningOperationIdentifier.prototype._ff_c = "PlanningOperationIdentifier";

oFF.PlanningOperationIdentifier.PLANNING_OPERATION_TYPE = "PLANNING_OPERATION_TYPE";
oFF.PlanningOperationIdentifier.prototype.getDataSource = function()
{
	let planningOperationType = this.getPlanningOperationType();
	if (planningOperationType === oFF.PlanningOperationType.PLANNING_FUNCTION)
	{
		return oFF.QFactory.createDataSourceWithType(oFF.MetaObjectType.PLANNING_FUNCTION, this.getPlanningOperationName());
	}
	else if (planningOperationType === oFF.PlanningOperationType.PLANNING_SEQUENCE)
	{
		return oFF.QFactory.createDataSourceWithType(oFF.MetaObjectType.PLANNING_SEQUENCE, this.getPlanningOperationName());
	}
	else
	{
		return null;
	}
};
oFF.PlanningOperationIdentifier.prototype.getPlanningOperationName = function()
{
	return this.getCommandId();
};
oFF.PlanningOperationIdentifier.prototype.getPlanningOperationType = function()
{
	return this.getPropertyObject(oFF.PlanningOperationIdentifier.PLANNING_OPERATION_TYPE);
};
oFF.PlanningOperationIdentifier.prototype.setPlanningOperationType = function(planningOperationType)
{
	this.setPropertyObject(oFF.PlanningOperationIdentifier.PLANNING_OPERATION_TYPE, planningOperationType);
};

oFF.PlanningActionIdentifierBase = function() {};
oFF.PlanningActionIdentifierBase.prototype = new oFF.PlanningCommandIdentifier();
oFF.PlanningActionIdentifierBase.prototype._ff_c = "PlanningActionIdentifierBase";

oFF.PlanningActionIdentifierBase.ACTION_METADATA = "ACTION_METADATA";
oFF.PlanningActionIdentifierBase.prototype.getActionDescription = function()
{
	return this.getActionMetadata().getActionDescription();
};
oFF.PlanningActionIdentifierBase.prototype.getActionId = function()
{
	return this.getActionMetadata().getActionId();
};
oFF.PlanningActionIdentifierBase.prototype.getActionMetadata = function()
{
	return this.getPropertyObject(oFF.PlanningActionIdentifierBase.ACTION_METADATA);
};
oFF.PlanningActionIdentifierBase.prototype.getActionName = function()
{
	return this.getActionMetadata().getActionName();
};
oFF.PlanningActionIdentifierBase.prototype.getActionParameterMetadata = function()
{
	return this.getActionMetadata().getActionParameterMetadata();
};
oFF.PlanningActionIdentifierBase.prototype.getActionParameterNames = function()
{
	return this.getActionMetadata().getActionParameterNames();
};
oFF.PlanningActionIdentifierBase.prototype.getActionType = function()
{
	return this.getActionMetadata().getActionType();
};
oFF.PlanningActionIdentifierBase.prototype.isDefault = function()
{
	return this.getActionMetadata().isDefault();
};
oFF.PlanningActionIdentifierBase.prototype.setActionMetadata = function(actionMetadata)
{
	this.setPropertyObject(oFF.PlanningActionIdentifierBase.ACTION_METADATA, actionMetadata);
};
oFF.PlanningActionIdentifierBase.prototype.setActionParameterMetadata = function(actionParameterMetadata)
{
	this.getActionMetadata().setActionParameterMetadata(actionParameterMetadata);
};
oFF.PlanningActionIdentifierBase.prototype.setActionParameterNames = function(parameterNames)
{
	this.getActionMetadata().setActionParameterNames(parameterNames);
};

oFF.EpmDataAction = function() {};
oFF.EpmDataAction.prototype = new oFF.EpmPlanningAction();
oFF.EpmDataAction.prototype._ff_c = "EpmDataAction";

oFF.EpmDataAction.create = function(context, systemType, connectionContainer)
{
	let instance = new oFF.EpmDataAction();
	instance.setupPlanningActionContext(context, systemType, connectionContainer);
	return instance;
};
oFF.EpmDataAction.prototype.m_applyPlanningArea = false;
oFF.EpmDataAction.prototype.m_autoPublishEnabled = false;
oFF.EpmDataAction.prototype.m_currencyConversionType = null;
oFF.EpmDataAction.prototype.m_filterOutReadOnlyFacts = false;
oFF.EpmDataAction.prototype.m_planningAreaType = null;
oFF.EpmDataAction.prototype.getCurrencyConversionType = function()
{
	return this.m_currencyConversionType;
};
oFF.EpmDataAction.prototype.getOlapComponentType = function()
{
	return oFF.EpmActionType.DATA_ACTION;
};
oFF.EpmDataAction.prototype.getPlanningAreaType = function()
{
	return this.m_planningAreaType;
};
oFF.EpmDataAction.prototype.isApplyPlanningArea = function()
{
	return this.m_applyPlanningArea;
};
oFF.EpmDataAction.prototype.isAutoPublishEnabled = function()
{
	return this.m_autoPublishEnabled;
};
oFF.EpmDataAction.prototype.isFilterOutReadOnlyFacts = function()
{
	return this.m_filterOutReadOnlyFacts;
};
oFF.EpmDataAction.prototype.setApplyPlanningArea = function(applyPlanningArea)
{
	this.m_applyPlanningArea = applyPlanningArea;
};
oFF.EpmDataAction.prototype.setAutoPublishEnabled = function(autoPublishEnabled)
{
	this.m_autoPublishEnabled = autoPublishEnabled;
};
oFF.EpmDataAction.prototype.setCurrencyConversionType = function(currencyConversionType)
{
	this.m_currencyConversionType = currencyConversionType;
};
oFF.EpmDataAction.prototype.setFilterOutReadOnlyFacts = function(filterOutReadOnlyFacts)
{
	this.m_filterOutReadOnlyFacts = filterOutReadOnlyFacts;
};
oFF.EpmDataAction.prototype.setPlanningAreaType = function(planningAreaType)
{
	this.m_planningAreaType = planningAreaType;
};
oFF.EpmDataAction.prototype.setupPlanningActionContext = function(context, systemType, connectionContainer)
{
	oFF.EpmPlanningAction.prototype.setupPlanningActionContext.call( this , context, systemType, connectionContainer);
	this.m_planningAreaType = oFF.EpmPlanningAreaType.DEFAULT;
	this.m_currencyConversionType = oFF.EpmCurrencyConversionSettingsType.DEFAULT_CURRENCY;
};

oFF.EpmMultiAction = function() {};
oFF.EpmMultiAction.prototype = new oFF.EpmPlanningAction();
oFF.EpmMultiAction.prototype._ff_c = "EpmMultiAction";

oFF.EpmMultiAction.create = function(context, systemType, connectionContainer)
{
	let instance = new oFF.EpmMultiAction();
	instance.setupPlanningActionContext(context, systemType, connectionContainer);
	return instance;
};
oFF.EpmMultiAction.prototype.getOlapComponentType = function()
{
	return oFF.EpmActionType.MULTI_ACTION;
};

oFF.EpmHierarchyHelpNode = function() {};
oFF.EpmHierarchyHelpNode.prototype = new oFF.QValueHelpNode2();
oFF.EpmHierarchyHelpNode.prototype._ff_c = "EpmHierarchyHelpNode";

oFF.EpmHierarchyHelpNode.createHierarchyHelpNode = function(dimension, hierarchyCatalogItem)
{
	let node = new oFF.EpmHierarchyHelpNode();
	let member = oFF.QDimensionMember.createDimensionMember(dimension, dimension);
	let name = hierarchyCatalogItem.getHierarchyName();
	member.setName(name);
	member.setText(hierarchyCatalogItem.getHierarchyDescription());
	node.setupValueHelpNode(name, member, oFF.DrillState.LEAF, 0, -1, -1, true);
	return node;
};

oFF.DataAreaCommand = function() {};
oFF.DataAreaCommand.prototype = new oFF.PlanningContextCommand();
oFF.DataAreaCommand.prototype._ff_c = "DataAreaCommand";

oFF.DataAreaCommand.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.DataAreaCommandResult();
};
oFF.DataAreaCommand.prototype.getDataArea = function()
{
	return this.getPlanningContext();
};
oFF.DataAreaCommand.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.DATA_AREA_COMMAND;
};

oFF.DataAreaCommandResult = function() {};
oFF.DataAreaCommandResult.prototype = new oFF.PlanningContextCommandResult();
oFF.DataAreaCommandResult.prototype._ff_c = "DataAreaCommandResult";

oFF.DataAreaCommandResult.EXECUTED = "EXECUTED";
oFF.DataAreaCommandResult.prototype.getDataAreaCommand = function()
{
	return this.getPlanningCommand();
};
oFF.DataAreaCommandResult.prototype.isExecuted = function()
{
	return this.getPropertyBoolean(oFF.DataAreaCommandResult.EXECUTED);
};
oFF.DataAreaCommandResult.prototype.setExecuted = function(executed)
{
	this.setPropertyBoolean(oFF.DataAreaCommandResult.EXECUTED, executed);
};

oFF.PlanningFunctionIdentifier = function() {};
oFF.PlanningFunctionIdentifier.prototype = new oFF.PlanningOperationIdentifier();
oFF.PlanningFunctionIdentifier.prototype._ff_c = "PlanningFunctionIdentifier";

oFF.PlanningFunctionIdentifier.prototype.getPlanningFunctionName = function()
{
	return this.getPlanningOperationName();
};

oFF.PlanningOperation = function() {};
oFF.PlanningOperation.prototype = new oFF.PlanningCommandWithId();
oFF.PlanningOperation.prototype._ff_c = "PlanningOperation";

oFF.PlanningOperation.DIMENSIONS = "DIMENSIONS";
oFF.PlanningOperation.PLANNING_OPERATION_METADATA = "PLANNING_OPERATION_METADATA";
oFF.PlanningOperation.prototype.m_planningCommandModelComponent = null;
oFF.PlanningOperation.prototype.createCommandStructure = function()
{
	let request = oFF.PrFactory.createStructure();
	this.fillRequest(request, false);
	return request;
};
oFF.PlanningOperation.prototype.fillRequest = function(request, withVariables)
{
	let dataAreaState = oFF.DataAreaState.getDataAreaState(this.getDataArea());
	if (!dataAreaState.isSubmitted())
	{
		let dataAreaStructure = dataAreaState.serializeToJson();
		if (oFF.notNull(dataAreaStructure))
		{
			request.putNewList("DataAreas").add(dataAreaStructure);
		}
	}
	let dataArea = this.getDataArea();
	let planning = request.putNewStructure("Planning");
	this.getPlanningService().getInaCapabilities().exportActiveCapabilities(planning);
	let command = planning.putNewStructure("Command");
	let dataSource = command.putNewStructure("DataSource");
	let dataAreaName = dataArea.getDataArea();
	if (oFF.isNull(dataAreaName))
	{
		dataAreaName = "DEFAULT";
	}
	dataSource.putString("DataArea", dataAreaName);
	let metadata = this.getPlanningOperationMetadata();
	let identifier = metadata.getPlanningOperationIdentifier();
	dataSource.putString("ObjectName", identifier.getPlanningOperationName());
	dataSource.putString("Type", this.getPlanningType());
	dataSource.putString("InstanceId", metadata.getInstanceId());
	let selection = this.getSelectionJson();
	if (oFF.notNull(selection))
	{
		command.put("Filter", selection);
	}
	if (withVariables)
	{
		let provider = this.getVariableProcessorProvider();
		provider.exportVariables(this, command);
	}
};
oFF.PlanningOperation.prototype.fillVariableRequestorDataRequestContext = function(structure, withVariables, processingDirective)
{
	this.fillRequest(structure, withVariables);
	let inaContext = structure.getStructureByKey("Planning");
	if (oFF.notNull(processingDirective))
	{
		let inaProcessingDirective = inaContext.putNewStructure("ProcessingDirectives");
		inaProcessingDirective.putString("ProcessingStep", processingDirective);
	}
	return inaContext.getStructureByKey("Command");
};
oFF.PlanningOperation.prototype.getContext = function()
{
	return this;
};
oFF.PlanningOperation.prototype.getDataArea = function()
{
	return this.getPlanningContext();
};
oFF.PlanningOperation.prototype.getDataSource = function()
{
	let planningOperationIdentifier = this.getPlanningOperationMetadata().getPlanningOperationIdentifier();
	let dataSource = oFF.QFactory.createDataSource();
	dataSource.setObjectName(planningOperationIdentifier.getPlanningOperationName());
	dataSource.setSystemName(this.getPlanningService().getConnection().getSystemDescription().getSystemName());
	if (planningOperationIdentifier.getPlanningOperationType() === oFF.PlanningOperationType.PLANNING_SEQUENCE)
	{
		dataSource.setType(oFF.MetaObjectType.PLANNING_SEQUENCE);
	}
	else if (planningOperationIdentifier.getPlanningOperationType() === oFF.PlanningOperationType.PLANNING_FUNCTION)
	{
		dataSource.setType(oFF.MetaObjectType.PLANNING_FUNCTION);
	}
	return dataSource;
};
oFF.PlanningOperation.prototype.getDimensionAccessor = function()
{
	return this.getPropertyObject(oFF.PlanningOperation.DIMENSIONS);
};
oFF.PlanningOperation.prototype.getFieldAccessorSingle = function()
{
	return this;
};
oFF.PlanningOperation.prototype.getPlanningCommandModelComponent = function()
{
	if (oFF.isNull(this.m_planningCommandModelComponent))
	{
		this.m_planningCommandModelComponent = oFF.PlanningCommandModelComponent.create(this.getContext(), this);
	}
	return this.m_planningCommandModelComponent;
};
oFF.PlanningOperation.prototype.getPlanningOperationIdentifier = function()
{
	return this.getCommandIdentifier();
};
oFF.PlanningOperation.prototype.getPlanningOperationMetadata = function()
{
	return this.getPropertyObject(oFF.PlanningOperation.PLANNING_OPERATION_METADATA);
};
oFF.PlanningOperation.prototype.getPlanningType = oFF.noSupport;
oFF.PlanningOperation.prototype.getSelectionJson = function()
{
	return null;
};
oFF.PlanningOperation.prototype.getVariable = function(name)
{
	return this.getVariableBaseByName(name);
};
oFF.PlanningOperation.prototype.getVariableContainer = function()
{
	return this;
};
oFF.PlanningOperation.prototype.getVariableContainerBase = function()
{
	return this;
};
oFF.PlanningOperation.prototype.initializePlanningOperation = function()
{
	let metadata = this.getPlanningOperationMetadata();
	this.initializeSelector(metadata.getDimensions());
	this.initializeVariables(metadata.getVariables());
};
oFF.PlanningOperation.prototype.initializeSelector = function(dimensions)
{
	if (oFF.isNull(dimensions))
	{
		return;
	}
	let dimensionList = oFF.QDimensionList.createDimensionList(this, null, null);
	this.setPropertyObject(oFF.PlanningOperation.DIMENSIONS, dimensionList);
	let capabilities = this.getOlapEnv().getSystemContainer(this.getSystemName()).getServiceCapabilitiesExt(oFF.ProviderType.PLANNING_VALUE_HELP);
	let importMetadata = oFF.QInAImportFactory.createForMetadata(this.getApplication(), capabilities);
	for (let i = 0; i < dimensions.size(); i++)
	{
		let dimensionStructure = oFF.PrUtils.getStructureElement(dimensions, i);
		let dimension = importMetadata.importDimension(dimensionStructure, this);
		dimensionList.add(dimension);
	}
	let modelComponent = this.getPlanningCommandModelComponent();
	let selector = oFF.QFilter.createWithModelComponent(this, modelComponent);
	this.setSelector(selector);
};
oFF.PlanningOperation.prototype.initializeVariables = function(inaVariableList)
{
	this.clearVariables();
	this.setVariableProcessorProvider(null);
	this.setVariableHelpProvider(null);
	if (!oFF.PrUtils.isListEmpty(inaVariableList))
	{
		let vhProvider = oFF.PlanningCommandWithId.s_variableHelpProviderFactory.createVariableHelpProvider(this);
		let provider = oFF.PlanningCommandWithId.s_variableHelpProviderFactory.createProcessorProvider(this.getDataSource(), this, this);
		provider.importVariables(inaVariableList, this);
		this.setVariableHelpProvider(vhProvider);
		this.setVariableProcessorProvider(provider);
	}
};
oFF.PlanningOperation.prototype.setPlanningOperationMetadata = function(planningOperationMetadata)
{
	this.setPropertyObject(oFF.PlanningOperation.PLANNING_OPERATION_METADATA, planningOperationMetadata);
};
oFF.PlanningOperation.prototype.setWinControlInAutoSubmitByType = function(variableType, isWinControlInAutoSubmit, isLimitToExitVariable)
{
	return;
};

oFF.PlanningOperationResult = function() {};
oFF.PlanningOperationResult.prototype = new oFF.PlanningCommandWithIdResult();
oFF.PlanningOperationResult.prototype._ff_c = "PlanningOperationResult";

oFF.PlanningOperationResult.prototype.getPlanningOperation = function()
{
	return this.getPlanningCommand();
};

oFF.PlanningSequenceIdentifier = function() {};
oFF.PlanningSequenceIdentifier.prototype = new oFF.PlanningOperationIdentifier();
oFF.PlanningSequenceIdentifier.prototype._ff_c = "PlanningSequenceIdentifier";

oFF.PlanningSequenceIdentifier.prototype.getPlanningSequenceName = function()
{
	return this.getPlanningOperationName();
};

oFF.DataAreaRequest = function() {};
oFF.DataAreaRequest.prototype = new oFF.PlanningRequest();
oFF.DataAreaRequest.prototype._ff_c = "DataAreaRequest";

oFF.DataAreaRequest.REQUEST_TYPE = "REQUEST_TYPE";
oFF.DataAreaRequest.prototype.getDataArea = function()
{
	return this.getPlanningContext();
};
oFF.DataAreaRequest.prototype.getRequestType = function()
{
	return this.getPropertyObject(oFF.DataAreaRequest.REQUEST_TYPE);
};
oFF.DataAreaRequest.prototype.setRequestType = function(requestType)
{
	this.setPropertyObject(oFF.DataAreaRequest.REQUEST_TYPE, requestType);
};

oFF.DataAreaResponse = function() {};
oFF.DataAreaResponse.prototype = new oFF.PlanningResponse();
oFF.DataAreaResponse.prototype._ff_c = "DataAreaResponse";

oFF.DataAreaResponse.prototype.getDataAreaRequest = function()
{
	return this.getPlanningRequest();
};
oFF.DataAreaResponse.prototype.processResponseStructureCommand = function(responseStructure, messageManager, hasErrors)
{
	if (hasErrors)
	{
		return;
	}
	if (!this.processResponseStructureInternal(responseStructure, messageManager))
	{
		messageManager.addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.PARSER_ERROR, "error in processing response structure", responseStructure);
	}
};
oFF.DataAreaResponse.prototype.processResponseStructureInternal = oFF.noSupport;

oFF.PlanningModelCommand = function() {};
oFF.PlanningModelCommand.prototype = new oFF.PlanningContextCommand();
oFF.PlanningModelCommand.prototype._ff_c = "PlanningModelCommand";

oFF.PlanningModelCommand.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningModelCommandResult();
};
oFF.PlanningModelCommand.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_MODEL_COMMAND;
};
oFF.PlanningModelCommand.prototype.getPlanningModel = function()
{
	return this.getPlanningContext();
};

oFF.PlanningModelCommandResult = function() {};
oFF.PlanningModelCommandResult.prototype = new oFF.PlanningContextCommandResult();
oFF.PlanningModelCommandResult.prototype._ff_c = "PlanningModelCommandResult";

oFF.PlanningModelCommandResult.RETURN_CODE = "RETURN_CODE";
oFF.PlanningModelCommandResult.prototype.getPlanningModelCommand = function()
{
	return this.getPlanningCommand();
};
oFF.PlanningModelCommandResult.prototype.getReturnCode = function()
{
	return this.getPropertyInteger(oFF.PlanningModelCommandResult.RETURN_CODE);
};
oFF.PlanningModelCommandResult.prototype.setReturnCode = function(returnCode)
{
	this.setPropertyInteger(oFF.PlanningModelCommandResult.RETURN_CODE, returnCode);
};

oFF.PlanningAction = function() {};
oFF.PlanningAction.prototype = new oFF.PlanningCommandWithId();
oFF.PlanningAction.prototype._ff_c = "PlanningAction";

oFF.PlanningAction.ACTION_GROUP = "ACTION_GROUP";
oFF.PlanningAction.ACTION_PARAMETERS = "ACTION_PARAMETERS";
oFF.PlanningAction.DESCRIPTION = "DESCRIPTION";
oFF.PlanningAction.PARAMETER_METADATA = "PARAMETER_METADATA";
oFF.PlanningAction.SEQUENCE_ID = "SEQUENCE_ID";
oFF.PlanningAction.TARGET_CELL_COLUMN = "TARGET_CELL_COLUMN";
oFF.PlanningAction.TARGET_CELL_ROW = "TARGET_CELL_ROW";
oFF.PlanningAction.TARGET_CELL_RS = "TARGET_CELL_RS";
oFF.PlanningAction.TARGET_VERSION_ID = "TARGET_VERSION_ID";
oFF.PlanningAction.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningActionResult();
};
oFF.PlanningAction.prototype.getActionForQueryIdentifier = function()
{
	return this.getCommandIdentifier();
};
oFF.PlanningAction.prototype.getActionGroup = function()
{
	return this.getPropertyString(oFF.PlanningAction.ACTION_GROUP);
};
oFF.PlanningAction.prototype.getActionIdentifier = function()
{
	return this.getCommandIdentifier();
};
oFF.PlanningAction.prototype.getActionParameterMetadata = function()
{
	return this.getPropertyObject(oFF.PlanningAction.PARAMETER_METADATA);
};
oFF.PlanningAction.prototype.getActionParameters = function()
{
	return this.getPropertyObject(oFF.PlanningAction.ACTION_PARAMETERS);
};
oFF.PlanningAction.prototype.getDescription = function()
{
	return this.getPropertyString(oFF.PlanningAction.DESCRIPTION);
};
oFF.PlanningAction.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_ACTION;
};
oFF.PlanningAction.prototype.getPlanningModel = function()
{
	return this.getPlanningContext();
};
oFF.PlanningAction.prototype.getSequenceId = function()
{
	return this.getPropertyString(oFF.PlanningAction.SEQUENCE_ID);
};
oFF.PlanningAction.prototype.getSequenceIdEffective = function()
{
	let sequenceId = this.getPropertyString(oFF.PlanningAction.SEQUENCE_ID);
	if (oFF.XStringUtils.isNullOrEmpty(sequenceId))
	{
		sequenceId = this.getVersion().getActionSequenceId();
	}
	return sequenceId;
};
oFF.PlanningAction.prototype.getTargetColumn = function()
{
	return this.getPropertyInteger(oFF.PlanningAction.TARGET_CELL_COLUMN);
};
oFF.PlanningAction.prototype.getTargetRow = function()
{
	return this.getPropertyInteger(oFF.PlanningAction.TARGET_CELL_ROW);
};
oFF.PlanningAction.prototype.getTargetVersionId = function()
{
	return this.getPropertyString(oFF.PlanningAction.TARGET_VERSION_ID);
};
oFF.PlanningAction.prototype.getVariable = function(name)
{
	return this.getVariableBaseByName(name);
};
oFF.PlanningAction.prototype.getVariableContainer = function()
{
	return this;
};
oFF.PlanningAction.prototype.getVariableContainerBase = function()
{
	return this;
};
oFF.PlanningAction.prototype.getVersion = function()
{
	let planningModel = this.getPlanningModel();
	return planningModel.getVersionByIdInternal(this.getActionIdentifier());
};
oFF.PlanningAction.prototype.hasTargetCell = function()
{
	return this.getProperties().getByKey(oFF.PlanningAction.TARGET_CELL_COLUMN) !== null && this.getProperties().getByKey(oFF.PlanningAction.TARGET_CELL_ROW) !== null;
};
oFF.PlanningAction.prototype.initializeVariables = function(variables)
{
	let inaVariablesList = oFF.PrFactory.createList();
	for (let i = 0; i < variables.size(); i++)
	{
		let inaParameter = oFF.PrUtils.getStructureElement(variables, i);
		if (oFF.isNull(inaParameter))
		{
			continue;
		}
		let parameterOptionOccurence = inaParameter.getStringByKeyExt("optionOccurrence", null);
		if (oFF.notNull(parameterOptionOccurence))
		{
			let inaVariable = inaVariablesList.addNewStructure();
			inaVariable.putString("Name", inaParameter.getStringByKey("name"));
			inaVariable.putString("Description", inaParameter.getStringByKey("description"));
			inaVariable.putString("VariableType", "OptionListVariable");
			inaVariable.putString("Type", "String");
			inaVariable.putString("InputType", "Optional");
			inaVariable.putNewList("DependentOfVariable");
			if (oFF.XString.isEqual(parameterOptionOccurence, "exactly-one"))
			{
				inaVariable.putBoolean("MultipleValues", false);
			}
			else
			{
				inaVariable.putBoolean("MultipleValues", true);
			}
			inaVariable.putBoolean("InputEnabled", true);
			let parameterOptions = inaParameter.getListByKey("options");
			let inaOptionList = inaVariable.putNewList("Options");
			if (!oFF.PrUtils.isListEmpty(parameterOptions))
			{
				for (let j = 0; j < parameterOptions.size(); j++)
				{
					let parameterOption = parameterOptions.getStructureAt(j);
					let optionNameId = parameterOption.getIntegerByKeyExt("id", -1);
					if (optionNameId !== -1)
					{
						let optionDescription = parameterOption.getStringByKey("description");
						let inaVariableOption = inaOptionList.addNewStructure();
						inaVariableOption.putString("Name", oFF.XInteger.convertToString(optionNameId));
						inaVariableOption.putString("Description", optionDescription);
					}
				}
				let parameterDefaultOptions = inaParameter.getListByKey("defaultOptions");
				let inaVariableOptionValue = inaVariable.putNewList("OptionValues");
				if (oFF.notNull(parameterDefaultOptions))
				{
					for (let k = 0; k < parameterDefaultOptions.size(); k++)
					{
						let parameterOptionValue = parameterDefaultOptions.getIntegerAt(k);
						inaVariableOptionValue.addString(oFF.XInteger.convertToString(parameterOptionValue));
					}
				}
			}
		}
		else
		{
			inaVariablesList.add(inaParameter.clone());
		}
	}
	this.clearVariables();
	this.setVariableProcessorProvider(null);
	this.setVariableHelpProvider(null);
	if (!oFF.PrUtils.isListEmpty(inaVariablesList))
	{
		let vhProvider = oFF.PlanningCommandWithId.s_variableHelpProviderFactory.createVariableHelpProvider(this);
		let provider = oFF.PlanningCommandWithId.s_variableHelpProviderFactory.createProcessorProvider(this.getDataSource(), this, this);
		provider.setIsVariableSubmitNeeded(false);
		provider.importVariables(inaVariablesList, this);
		this.setVariableHelpProvider(vhProvider);
		this.setVariableProcessorProvider(provider);
	}
};
oFF.PlanningAction.prototype.setActionGroup = function(actionGroup)
{
	this.setPropertyString(oFF.PlanningAction.ACTION_GROUP, actionGroup);
};
oFF.PlanningAction.prototype.setActionParameterMetadata = function(parameterMetadata)
{
	this.setPropertyObject(oFF.PlanningAction.PARAMETER_METADATA, parameterMetadata);
	if (oFF.notNull(parameterMetadata) && !oFF.PrUtils.isListEmpty(parameterMetadata.getParameters()))
	{
		this.initializeVariables(parameterMetadata.getParameters());
	}
};
oFF.PlanningAction.prototype.setActionParameters = function(actionParameters)
{
	this.setPropertyObject(oFF.PlanningAction.ACTION_PARAMETERS, actionParameters);
	this.tryPublicVersionEdit(actionParameters);
};
oFF.PlanningAction.prototype.setDescription = function(description)
{
	this.setPropertyString(oFF.PlanningAction.DESCRIPTION, description);
	return this;
};
oFF.PlanningAction.prototype.setSequenceId = function(sequenceId)
{
	this.setPropertyString(oFF.PlanningAction.SEQUENCE_ID, sequenceId);
	return this;
};
oFF.PlanningAction.prototype.setTargetCell = function(targetCell)
{
	if (oFF.isNull(targetCell))
	{
		this.getProperties().remove(oFF.PlanningAction.TARGET_CELL_ROW);
		this.getProperties().remove(oFF.PlanningAction.TARGET_CELL_RS);
	}
	else
	{
		this.setPropertyInteger(oFF.PlanningAction.TARGET_CELL_COLUMN, targetCell.getColumn());
		this.setPropertyInteger(oFF.PlanningAction.TARGET_CELL_ROW, targetCell.getRow());
	}
	return this;
};
oFF.PlanningAction.prototype.setTargetColumn = function(column)
{
	this.setPropertyInteger(oFF.PlanningAction.TARGET_CELL_COLUMN, column);
	return this;
};
oFF.PlanningAction.prototype.setTargetRow = function(row)
{
	this.setPropertyInteger(oFF.PlanningAction.TARGET_CELL_ROW, row);
	return this;
};
oFF.PlanningAction.prototype.setTargetVersionId = function(targetVersionId)
{
	this.setPropertyString(oFF.PlanningAction.TARGET_VERSION_ID, targetVersionId);
	return this;
};
oFF.PlanningAction.prototype.setWinControlInAutoSubmitByType = function(variableType, isWinControlInAutoSubmit, isLimitToExitVariable)
{
	return;
};
oFF.PlanningAction.prototype.tryPublicVersionEdit = function(actionParameters)
{
	if (this.getSystemType() !== oFF.SystemType.HANA)
	{
		return;
	}
	let planningModel = this.getPlanningModel();
	if (oFF.isNull(planningModel) || !planningModel.supportsPublicVersionEdit())
	{
		return;
	}
	let actionMetadata = planningModel.getActionMetadata(this.getActionIdentifier().getActionId());
	if (oFF.isNull(actionMetadata))
	{
		return;
	}
	let actionType = actionMetadata.getActionType();
	if (oFF.isNull(actionType))
	{
		return;
	}
	if (!actionType.isTypeOf(oFF.PlanningActionType.VERSION_ACTION))
	{
		return;
	}
	let actionId = this.getActionIdentifier().getActionId();
	if (!oFF.XString.isEqual(actionId, "populate_single_version"))
	{
		return;
	}
	let version = this.getVersion();
	if (oFF.isNull(version) || !version.isShowingAsPublicVersion())
	{
		return;
	}
	if (oFF.XStringUtils.isNullOrEmpty(version.getSourceVersionName()))
	{
		return;
	}
	if (oFF.isNull(actionParameters))
	{
		return;
	}
	let paramStructure = actionParameters.getStructureByKey("epmPopulate.fromVersion");
	if (oFF.isNull(paramStructure))
	{
		return;
	}
	let fromVersion = paramStructure.getStringByKey("value");
	if (oFF.XStringUtils.isNullOrEmpty(fromVersion))
	{
		return;
	}
	planningModel.setPublicVersionEditInProgress(true);
	let publicVersionEdit = oFF.XString.endsWith(fromVersion, version.getSourceVersionName());
	this.setInvalidatingResultSet(!publicVersionEdit);
};

oFF.PlanningActionForQueryIdentifier = function() {};
oFF.PlanningActionForQueryIdentifier.prototype = new oFF.PlanningActionIdentifierBase();
oFF.PlanningActionForQueryIdentifier.prototype._ff_c = "PlanningActionForQueryIdentifier";

oFF.PlanningActionForQueryIdentifier.prototype.cloneOlapComponent = function(context, parent)
{
	let copy = new oFF.PlanningActionForQueryIdentifier();
	copy.setProperties(this.getPropertiesCopy());
	return copy;
};
oFF.PlanningActionForQueryIdentifier.prototype.toString = function()
{
	let sb = oFF.XStringBuffer.create();
	sb.appendLine("Planning action for query identifier");
	sb.append(this.getActionMetadata().toString());
	return sb.toString();
};

oFF.PlanningActionIdentifier = function() {};
oFF.PlanningActionIdentifier.prototype = new oFF.PlanningActionIdentifierBase();
oFF.PlanningActionIdentifier.prototype._ff_c = "PlanningActionIdentifier";

oFF.PlanningActionIdentifier.VERSION_IDENTIFIER = "VERSION_IDENDTIFIER";
oFF.PlanningActionIdentifier.prototype.cloneOlapComponent = function(context, parent)
{
	let copy = new oFF.PlanningActionIdentifier();
	copy.setProperties(this.getPropertiesCopy());
	return copy;
};
oFF.PlanningActionIdentifier.prototype.getVersionId = function()
{
	return this.getVersionIdentifier().getVersionId();
};
oFF.PlanningActionIdentifier.prototype.getVersionIdentifier = function()
{
	return this.getPropertyObject(oFF.PlanningActionIdentifier.VERSION_IDENTIFIER);
};
oFF.PlanningActionIdentifier.prototype.getVersionKey = function()
{
	return this.getVersionIdentifier().getVersionKey();
};
oFF.PlanningActionIdentifier.prototype.getVersionOwner = function()
{
	return this.getVersionIdentifier().getVersionOwner();
};
oFF.PlanningActionIdentifier.prototype.getVersionUniqueName = function()
{
	return this.getVersionIdentifier().getVersionUniqueName();
};
oFF.PlanningActionIdentifier.prototype.isSharedVersion = function()
{
	return this.getVersionIdentifier().isSharedVersion();
};
oFF.PlanningActionIdentifier.prototype.setVersionIdentifier = function(versionIdentifier)
{
	this.setPropertyObject(oFF.PlanningActionIdentifier.VERSION_IDENTIFIER, versionIdentifier);
};
oFF.PlanningActionIdentifier.prototype.toString = function()
{
	let sb = oFF.XStringBuffer.create();
	sb.append("Planning action identifier for version \"");
	sb.append(this.getVersionIdentifier().getVersionUniqueName());
	sb.appendLine("\"");
	sb.append(this.getActionMetadata().toString());
	return sb.toString();
};

oFF.PlanningActionResult = function() {};
oFF.PlanningActionResult.prototype = new oFF.PlanningCommandWithIdResult();
oFF.PlanningActionResult.prototype._ff_c = "PlanningActionResult";

oFF.PlanningActionResult.RETURN_CODE = "RETURN_CODE";
oFF.PlanningActionResult.prototype.checkErrorState = function()
{
	let returnCode = this.getReturnCode();
	if (returnCode === 3042)
	{
		let planningModel = this.getPlanningAction().getPlanningModel();
		planningModel.resetPlanningModel();
	}
};
oFF.PlanningActionResult.prototype.getPlanningAction = function()
{
	return this.getPlanningCommand();
};
oFF.PlanningActionResult.prototype.getReturnCode = function()
{
	return this.getPropertyInteger(oFF.PlanningActionResult.RETURN_CODE);
};
oFF.PlanningActionResult.prototype.setReturnCode = function(returnCode)
{
	this.setPropertyInteger(oFF.PlanningActionResult.RETURN_CODE, returnCode);
};

oFF.PlanningModelRequest = function() {};
oFF.PlanningModelRequest.prototype = new oFF.PlanningRequest();
oFF.PlanningModelRequest.prototype._ff_c = "PlanningModelRequest";

oFF.PlanningModelRequest.REQUEST_TYPE = "REQUEST_TYPE";
oFF.PlanningModelRequest.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningModelResponse();
};
oFF.PlanningModelRequest.prototype.getPlanningModel = function()
{
	return this.getPlanningContext();
};
oFF.PlanningModelRequest.prototype.getRequestType = function()
{
	return this.getPropertyObject(oFF.PlanningModelRequest.REQUEST_TYPE);
};
oFF.PlanningModelRequest.prototype.setRequestType = function(requestType)
{
	this.setPropertyObject(oFF.PlanningModelRequest.REQUEST_TYPE, requestType);
};

oFF.PlanningModelResponse = function() {};
oFF.PlanningModelResponse.prototype = new oFF.PlanningResponse();
oFF.PlanningModelResponse.prototype._ff_c = "PlanningModelResponse";

oFF.PlanningModelResponse.RETURN_CODE = "RETURN_CODE";
oFF.PlanningModelResponse.prototype.getPlanningModelRequest = function()
{
	return this.getPlanningCommand();
};
oFF.PlanningModelResponse.prototype.getReturnCode = function()
{
	return this.getPropertyInteger(oFF.PlanningModelResponse.RETURN_CODE);
};
oFF.PlanningModelResponse.prototype.processResponseStructureCommand = function(responseStructure, messageManager, hasErrors)
{
	let returnCode = oFF.PlanningModelCommandHelper.getResponsesReturnCodeStrict(responseStructure, messageManager);
	this.setReturnCode(returnCode);
	if (returnCode !== 0)
	{
		return;
	}
	if (hasErrors)
	{
		return;
	}
	if (!this.processResponseStructureInternal(responseStructure, messageManager))
	{
		messageManager.addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.PARSER_ERROR, "error in processing response structure", responseStructure);
	}
};
oFF.PlanningModelResponse.prototype.processResponseStructureInternal = oFF.noSupport;
oFF.PlanningModelResponse.prototype.setReturnCode = function(returnCode)
{
	this.setPropertyInteger(oFF.PlanningModelResponse.RETURN_CODE, returnCode);
};

oFF.DataAreaCommandClose = function() {};
oFF.DataAreaCommandClose.prototype = new oFF.DataAreaCommand();
oFF.DataAreaCommandClose.prototype._ff_c = "DataAreaCommandClose";

oFF.DataAreaCommandClose.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.DATA_AREA_COMMAND_CLOSE;
};

oFF.PlanningFunction = function() {};
oFF.PlanningFunction.prototype = new oFF.PlanningOperation();
oFF.PlanningFunction.prototype._ff_c = "PlanningFunction";

oFF.PlanningFunction.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningFunctionResult();
};
oFF.PlanningFunction.prototype.getPlanningFunctionIdentifier = function()
{
	return this.getPlanningOperationIdentifier();
};
oFF.PlanningFunction.prototype.getPlanningFunctionMetadata = function()
{
	return this.getPlanningOperationMetadata();
};
oFF.PlanningFunction.prototype.getPlanningType = function()
{
	return "PlanningFunction";
};
oFF.PlanningFunction.prototype.getSelectionJson = function()
{
	let selector = this.getSelector();
	if (oFF.notNull(selector))
	{
		let selectionContainer = selector.getDynamicFilter();
		if (oFF.notNull(selectionContainer))
		{
			return selectionContainer.serializeToElement(oFF.QModelFormat.INA_DATA);
		}
	}
	return null;
};

oFF.PlanningFunctionResult = function() {};
oFF.PlanningFunctionResult.prototype = new oFF.PlanningOperationResult();
oFF.PlanningFunctionResult.prototype._ff_c = "PlanningFunctionResult";

oFF.PlanningFunctionResult.prototype.getPlanningFunction = function()
{
	return this.getPlanningOperation();
};

oFF.PlanningSequence = function() {};
oFF.PlanningSequence.prototype = new oFF.PlanningOperation();
oFF.PlanningSequence.prototype._ff_c = "PlanningSequence";

oFF.PlanningSequence.QUERY_MANAGER = "QUERY_MANAGER";
oFF.PlanningSequence.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningSequenceResult();
};
oFF.PlanningSequence.prototype.getPlanningSequenceIdentifier = function()
{
	return this.getCommandIdentifier();
};
oFF.PlanningSequence.prototype.getPlanningSequenceMetadata = function()
{
	return this.getPlanningOperationMetadata();
};
oFF.PlanningSequence.prototype.getPlanningType = function()
{
	return "PlanningSequence";
};
oFF.PlanningSequence.prototype.getQueryManagerForDimension = function(sourceDimension)
{
	let systemName = this.getDataSource().getSystemName();
	let dimensionQueryManager = this.getPropertyObject(oFF.XStringUtils.concatenate2(oFF.PlanningSequence.QUERY_MANAGER, sourceDimension.getName()));
	let targetDimension;
	if (oFF.isNull(dimensionQueryManager))
	{
		let dimensionDataSource = oFF.QFactory.createDataSourceWithType(oFF.MetaObjectType.DIMENSION, sourceDimension.getName());
		let queryServiceConfig = oFF.QueryServiceConfig.createWithDataSource(sourceDimension.getApplication(), systemName, dimensionDataSource);
		let result = queryServiceConfig.processQueryManagerCreation(oFF.SyncType.BLOCKING, null, null);
		oFF.MessageUtil.checkNoError(result);
		dimensionQueryManager = result.getData();
		targetDimension = dimensionQueryManager.getQueryModel().getDimensionByName(sourceDimension.getName());
		targetDimension.getFieldContainer().copyFrom(sourceDimension.getFieldContainer(), null);
		this.setPropertyObject(oFF.XStringUtils.concatenate2(oFF.PlanningSequence.QUERY_MANAGER, sourceDimension.getName()), dimensionQueryManager);
	}
	else
	{
		targetDimension = dimensionQueryManager.getQueryModel().getDimensionByName(sourceDimension.getName());
	}
	let selectorFields = sourceDimension.getSelectorFields();
	let targetSelectorFields = targetDimension.getSelectorFields();
	for (let i = 0; i < selectorFields.size(); i++)
	{
		targetSelectorFields.add(targetDimension.getFieldByName(selectorFields.get(i).getName()));
	}
	let displayKeyField = targetDimension.getFieldByPresentationType(oFF.PresentationType.DISPLAY_KEY);
	if (oFF.notNull(displayKeyField))
	{
		targetDimension.getSelectorFields().add(displayKeyField);
	}
	let descriptionField = targetDimension.getFieldByPresentationType(oFF.PresentationType.TEXT);
	if (oFF.notNull(descriptionField))
	{
		targetDimension.getSelectorFields().add(descriptionField);
	}
	let originQFilterExpression = this.getSelector().getValuehelpFilter();
	let targetQFilterExpression = dimensionQueryManager.getQueryModel().getFilter().getValuehelpFilter();
	targetQFilterExpression.copyFrom(originQFilterExpression, null);
	let selectorHierarchyNode = sourceDimension.getSelectorHierarchyNode();
	if (oFF.notNull(selectorHierarchyNode))
	{
		targetDimension.setSelectorHierarchyNode(selectorHierarchyNode);
	}
	return dimensionQueryManager;
};
oFF.PlanningSequence.prototype.submitVariables = function(syncType, listener, customIdentifier)
{
	return this.getVariableProcessor().submitVariables(syncType, listener, customIdentifier);
};

oFF.PlanningSequenceResult = function() {};
oFF.PlanningSequenceResult.prototype = new oFF.PlanningOperationResult();
oFF.PlanningSequenceResult.prototype._ff_c = "PlanningSequenceResult";

oFF.PlanningSequenceResult.prototype.getPlanningSequence = function()
{
	return this.getPlanningCommand();
};

oFF.DataAreaRequestCreatePlanningOperation = function() {};
oFF.DataAreaRequestCreatePlanningOperation.prototype = new oFF.DataAreaRequest();
oFF.DataAreaRequestCreatePlanningOperation.prototype._ff_c = "DataAreaRequestCreatePlanningOperation";

oFF.DataAreaRequestCreatePlanningOperation.COMMAND_IDENTIFIER = "COMMAND_IDENTIFIER";
oFF.DataAreaRequestCreatePlanningOperation.prototype.doProcessCommand = function(synchronizationType, planningCommandResult)
{
	let commandFactory = oFF.XCommandFactory.create(this.getApplication());
	let cmdCreatePlanningOperation = commandFactory.createCommand(oFF.XCmdCreatePlanningOperation.CMD_NAME);
	cmdCreatePlanningOperation.addParameter(oFF.XCmdCreatePlanningOperation.PARAM_I_DATA_AREA, this.getDataArea());
	cmdCreatePlanningOperation.addParameter(oFF.XCmdCreatePlanningOperation.PARAM_I_PLANNING_OPERATION_IDENTIFIER, this.getPlanningOperationIdentifier());
	cmdCreatePlanningOperation.processCommand(synchronizationType, oFF.XCommandCallback.create(this), planningCommandResult);
};
oFF.DataAreaRequestCreatePlanningOperation.prototype.getCommandIdentifier = function()
{
	return this.getPropertyObject(oFF.DataAreaRequestCreatePlanningOperation.COMMAND_IDENTIFIER);
};
oFF.DataAreaRequestCreatePlanningOperation.prototype.getPlanningOperationIdentifier = function()
{
	return this.getCommandIdentifier();
};
oFF.DataAreaRequestCreatePlanningOperation.prototype.onXCommandCallbackProcessed = function(extResult, commandResult, customIdentifier)
{
	let extPlanningCommandResult = oFF.ExtResult.create(customIdentifier, extResult);
	if (extResult.isValid())
	{
		let response = customIdentifier;
		response.setCreatedPlanningOperation(commandResult.getResultParameter(oFF.XCmdCreatePlanningOperation.PARAM_E_PLANNING_OPERATION));
	}
	this.onCommandExecuted(extPlanningCommandResult);
};
oFF.DataAreaRequestCreatePlanningOperation.prototype.setCommandIdentifier = function(commandIdentifier)
{
	this.setPropertyObject(oFF.DataAreaRequestCreatePlanningOperation.COMMAND_IDENTIFIER, commandIdentifier);
};

oFF.DataAreaRequestGetPlanningOperationMetadata = function() {};
oFF.DataAreaRequestGetPlanningOperationMetadata.prototype = new oFF.DataAreaRequest();
oFF.DataAreaRequestGetPlanningOperationMetadata.prototype._ff_c = "DataAreaRequestGetPlanningOperationMetadata";

oFF.DataAreaRequestGetPlanningOperationMetadata.INSTANCE_ID = "INSTANCE_ID";
oFF.DataAreaRequestGetPlanningOperationMetadata.PLANNING_OPERATION_IDENTIFIER = "PLANNING_OPERATION_IDENTIFIER";
oFF.DataAreaRequestGetPlanningOperationMetadata.prototype.getInstanceId = function()
{
	let instanceId = this.getPropertyString(oFF.DataAreaRequestGetPlanningOperationMetadata.INSTANCE_ID);
	if (oFF.isNull(instanceId))
	{
		instanceId = this.getPlanningService().getApplication().createNextInstanceId();
		this.setPropertyString(oFF.DataAreaRequestGetPlanningOperationMetadata.INSTANCE_ID, instanceId);
	}
	return instanceId;
};
oFF.DataAreaRequestGetPlanningOperationMetadata.prototype.getPlanningOperationIdentifier = function()
{
	return this.getPropertyObject(oFF.DataAreaRequestGetPlanningOperationMetadata.PLANNING_OPERATION_IDENTIFIER);
};
oFF.DataAreaRequestGetPlanningOperationMetadata.prototype.setPlanningOperationIdentifier = function(planningOperationIdentifier)
{
	this.setPropertyObject(oFF.DataAreaRequestGetPlanningOperationMetadata.PLANNING_OPERATION_IDENTIFIER, planningOperationIdentifier);
};

oFF.DataAreaResponseCreatePlanningOperation = function() {};
oFF.DataAreaResponseCreatePlanningOperation.prototype = new oFF.DataAreaResponse();
oFF.DataAreaResponseCreatePlanningOperation.prototype._ff_c = "DataAreaResponseCreatePlanningOperation";

oFF.DataAreaResponseCreatePlanningOperation.CREATED_PLANNING_OPERATION = "CREATED_PLANNING_OPERATION";
oFF.DataAreaResponseCreatePlanningOperation.prototype.getCreatedPlanningCommandWithId = function()
{
	return this.getCreatedPlanningOperation();
};
oFF.DataAreaResponseCreatePlanningOperation.prototype.getCreatedPlanningOperation = function()
{
	return this.getPropertyObject(oFF.DataAreaResponseCreatePlanningOperation.CREATED_PLANNING_OPERATION);
};
oFF.DataAreaResponseCreatePlanningOperation.prototype.getDataAreaRequestCreatePlanningOperation = function()
{
	return this.getPlanningRequestCreateCommandWithId();
};
oFF.DataAreaResponseCreatePlanningOperation.prototype.getPlanningRequestCreateCommandWithId = function()
{
	return this.getPlanningCommand();
};
oFF.DataAreaResponseCreatePlanningOperation.prototype.setCreatedPlanningOperation = function(planningOperation)
{
	this.setPropertyObject(oFF.DataAreaResponseCreatePlanningOperation.CREATED_PLANNING_OPERATION, planningOperation);
};

oFF.DataAreaResponseGetPlanningOperationMetadata = function() {};
oFF.DataAreaResponseGetPlanningOperationMetadata.prototype = new oFF.DataAreaResponse();
oFF.DataAreaResponseGetPlanningOperationMetadata.prototype._ff_c = "DataAreaResponseGetPlanningOperationMetadata";

oFF.DataAreaResponseGetPlanningOperationMetadata.PLANNING_OPERATION_METADATA = "PLANNING_OPERATION_METADATA";
oFF.DataAreaResponseGetPlanningOperationMetadata.prototype.getDataAreaRequestGetPlanningOperationMetadata = function()
{
	return this.getPlanningRequest();
};
oFF.DataAreaResponseGetPlanningOperationMetadata.prototype.getPlanningOperationMetadata = function()
{
	return this.getPropertyObject(oFF.DataAreaResponseGetPlanningOperationMetadata.PLANNING_OPERATION_METADATA);
};
oFF.DataAreaResponseGetPlanningOperationMetadata.prototype.setPlanningOperationMetadata = function(planningOperationMetadata)
{
	this.setPropertyObject(oFF.DataAreaResponseGetPlanningOperationMetadata.PLANNING_OPERATION_METADATA, planningOperationMetadata);
};

oFF.PlanningModelCloseCommand = function() {};
oFF.PlanningModelCloseCommand.prototype = new oFF.PlanningModelCommand();
oFF.PlanningModelCloseCommand.prototype._ff_c = "PlanningModelCloseCommand";

oFF.PlanningModelCloseCommand.CLOSE_MODE = "CLOSE_MODE";
oFF.PlanningModelCloseCommand.prototype.getCloseMode = function()
{
	return this.getPropertyObject(oFF.PlanningModelCloseCommand.CLOSE_MODE);
};
oFF.PlanningModelCloseCommand.prototype.setCloseMode = function(closeMode)
{
	this.setPropertyObject(oFF.PlanningModelCloseCommand.CLOSE_MODE, closeMode);
	return this;
};

oFF.PlanningModelRequestCleanup = function() {};
oFF.PlanningModelRequestCleanup.prototype = new oFF.PlanningModelRequest();
oFF.PlanningModelRequestCleanup.prototype._ff_c = "PlanningModelRequestCleanup";

oFF.PlanningModelRequestCleanup.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningModelResponseCleanup();
};
oFF.PlanningModelRequestCleanup.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_MODEL_CLEANUP_COMMAND;
};

oFF.PlanningModelRequestCreateAction = function() {};
oFF.PlanningModelRequestCreateAction.prototype = new oFF.PlanningModelRequest();
oFF.PlanningModelRequestCreateAction.prototype._ff_c = "PlanningModelRequestCreateAction";

oFF.PlanningModelRequestCreateAction.ACTION_PARAMETERS = "ACTION_PARAMETERS";
oFF.PlanningModelRequestCreateAction.COMMAND_IDENTIFIER = "COMMAND_IDENTIFIER";
oFF.PlanningModelRequestCreateAction.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningModelResponseCreateAction();
};
oFF.PlanningModelRequestCreateAction.prototype.doProcessCommand = function(synchronizationType, planningCommandResult)
{
	let extResultActionParameters = this.getActionParameters();
	let extResult;
	let messages = oFF.MessageManager.createMessageManagerExt(this.getSession());
	if (oFF.isNull(extResultActionParameters))
	{
		messages.addError(0, "illegal state - not action parameters");
		extResult = oFF.ExtResult.create(planningCommandResult, messages);
	}
	else
	{
		let action = new oFF.PlanningAction();
		action.setCommandType(oFF.PlanningCommandType.PLANNING_ACTION);
		action.setPlanningService(this.getPlanningService());
		action.setPlanningContext(this.getPlanningModel());
		action.setCommandIdentifier(this.getActionIdentifier());
		action.setActionParameterMetadata(extResultActionParameters);
		planningCommandResult.setCreatedPlanningAction(action);
		extResult = oFF.ExtResult.create(planningCommandResult, messages);
	}
	this.onCommandExecuted(oFF.ExtResult.create(extResult.getData(), extResult));
};
oFF.PlanningModelRequestCreateAction.prototype.getActionIdentifier = function()
{
	return this.getCommandIdentifier();
};
oFF.PlanningModelRequestCreateAction.prototype.getActionParameters = function()
{
	return this.getPropertyObject(oFF.PlanningModelRequestCreateAction.ACTION_PARAMETERS);
};
oFF.PlanningModelRequestCreateAction.prototype.getCommandIdentifier = function()
{
	return this.getPropertyObject(oFF.PlanningModelRequestCreateAction.COMMAND_IDENTIFIER);
};
oFF.PlanningModelRequestCreateAction.prototype.setActionParameters = function(actionParameters)
{
	this.setPropertyObject(oFF.PlanningModelRequestCreateAction.ACTION_PARAMETERS, actionParameters);
};
oFF.PlanningModelRequestCreateAction.prototype.setCommandIdentifier = function(commandIdentifier)
{
	this.setPropertyObject(oFF.PlanningModelRequestCreateAction.COMMAND_IDENTIFIER, commandIdentifier);
};

oFF.PlanningModelRequestRefreshActions = function() {};
oFF.PlanningModelRequestRefreshActions.prototype = new oFF.PlanningModelRequest();
oFF.PlanningModelRequestRefreshActions.prototype._ff_c = "PlanningModelRequestRefreshActions";

oFF.PlanningModelRequestRefreshActions.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningModelResponseRefreshActions();
};
oFF.PlanningModelRequestRefreshActions.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_MODEL_REFRESH_ACTIONS_COMMAND;
};

oFF.PlanningModelRequestRefreshVersions = function() {};
oFF.PlanningModelRequestRefreshVersions.prototype = new oFF.PlanningModelRequest();
oFF.PlanningModelRequestRefreshVersions.prototype._ff_c = "PlanningModelRequestRefreshVersions";

oFF.PlanningModelRequestRefreshVersions.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningModelResponseRefreshVersions();
};
oFF.PlanningModelRequestRefreshVersions.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_MODEL_REFRESH_VERSIONS_COMMAND;
};

oFF.PlanningModelRequestUpdateVersionPrivileges = function() {};
oFF.PlanningModelRequestUpdateVersionPrivileges.prototype = new oFF.PlanningModelRequest();
oFF.PlanningModelRequestUpdateVersionPrivileges.prototype._ff_c = "PlanningModelRequestUpdateVersionPrivileges";

oFF.PlanningModelRequestUpdateVersionPrivileges.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningModelResponseUpdateVersionPrivileges();
};
oFF.PlanningModelRequestUpdateVersionPrivileges.prototype.doProcessCommand = function(synchronizationType, planningCommandResult)
{
	if (this.isServerRoundtripRequired())
	{
		oFF.PlanningModelRequest.prototype.doProcessCommand.call( this , synchronizationType, planningCommandResult);
	}
	else
	{
		let messageManager = oFF.MessageManager.createMessageManagerExt(this.getSession());
		let extPlanningCommandResult = oFF.ExtResult.create(planningCommandResult, messageManager);
		this.onCommandExecuted(extPlanningCommandResult);
	}
};
oFF.PlanningModelRequestUpdateVersionPrivileges.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_MODEL_UPDATE_VERSION_PRIVILEGES_COMMAND;
};
oFF.PlanningModelRequestUpdateVersionPrivileges.prototype.isServerRoundtripRequired = function()
{
	let planningModel = this.getPlanningModel();
	if (!planningModel.hasChangedVersionPrivileges())
	{
		return false;
	}
	let versions = planningModel.getVersions();
	return !versions.isEmpty();
};

oFF.PlanningModelRequestVersion = function() {};
oFF.PlanningModelRequestVersion.prototype = new oFF.PlanningModelRequest();
oFF.PlanningModelRequestVersion.prototype._ff_c = "PlanningModelRequestVersion";

oFF.PlanningModelRequestVersion.PLANNING_VERSION = "PLANNING_VERSION";
oFF.PlanningModelRequestVersion.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningModelResponseVersion();
};
oFF.PlanningModelRequestVersion.prototype.createCommandStructure = oFF.noSupport;
oFF.PlanningModelRequestVersion.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_COMMAND;
};
oFF.PlanningModelRequestVersion.prototype.getPlanningVersion = function()
{
	return this.getPropertyObject(oFF.PlanningModelRequestVersion.PLANNING_VERSION);
};
oFF.PlanningModelRequestVersion.prototype.onCommandExecuted = function(extPlanningCommandResult)
{
	let result = extPlanningCommandResult.getData();
	if (result.getReturnCode() === 3042)
	{
		this.getPlanningModel().resetPlanningModel();
	}
	this.resetCommand();
	oFF.PlanningModelRequest.prototype.onCommandExecuted.call( this , extPlanningCommandResult);
};
oFF.PlanningModelRequestVersion.prototype.setPlanningVersion = function(planningVersion)
{
	this.setPropertyObject(oFF.PlanningModelRequestVersion.PLANNING_VERSION, planningVersion);
};
oFF.PlanningModelRequestVersion.prototype.setTryOption = function(useTryOption)
{
	return this;
};
oFF.PlanningModelRequestVersion.prototype.supportsTryOption = function()
{
	return false;
};
oFF.PlanningModelRequestVersion.prototype.useStateUpdate = function()
{
	let requestType = this.getRequestType();
	if (oFF.isNull(requestType))
	{
		return false;
	}
	return requestType.isTypeOf(oFF.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE);
};
oFF.PlanningModelRequestVersion.prototype.useTryOption = function()
{
	return false;
};

oFF.PlanningModelResponseCleanup = function() {};
oFF.PlanningModelResponseCleanup.prototype = new oFF.PlanningModelResponse();
oFF.PlanningModelResponseCleanup.prototype._ff_c = "PlanningModelResponseCleanup";

oFF.PlanningModelResponseCleanup.prototype.getPlanningModelRequestCleanup = function()
{
	return this.getPlanningCommand();
};

oFF.PlanningModelResponseCreateAction = function() {};
oFF.PlanningModelResponseCreateAction.prototype = new oFF.PlanningModelResponse();
oFF.PlanningModelResponseCreateAction.prototype._ff_c = "PlanningModelResponseCreateAction";

oFF.PlanningModelResponseCreateAction.CREATED_PLANNING_ACTION = "CREATED_PLANNING_ACTION";
oFF.PlanningModelResponseCreateAction.prototype.getCreatedPlanningAction = function()
{
	return this.getPropertyObject(oFF.PlanningModelResponseCreateAction.CREATED_PLANNING_ACTION);
};
oFF.PlanningModelResponseCreateAction.prototype.getCreatedPlanningCommandWithId = function()
{
	return this.getCreatedPlanningAction();
};
oFF.PlanningModelResponseCreateAction.prototype.getPlanningModelRequestCreateAction = function()
{
	return this.getPlanningCommand();
};
oFF.PlanningModelResponseCreateAction.prototype.getPlanningRequestCreateCommandWithId = function()
{
	return this.getPlanningCommand();
};
oFF.PlanningModelResponseCreateAction.prototype.setCreatedPlanningAction = function(planningAction)
{
	this.setPropertyObject(oFF.PlanningModelResponseCreateAction.CREATED_PLANNING_ACTION, planningAction);
};

oFF.PlanningModelResponseRefreshActions = function() {};
oFF.PlanningModelResponseRefreshActions.prototype = new oFF.PlanningModelResponse();
oFF.PlanningModelResponseRefreshActions.prototype._ff_c = "PlanningModelResponseRefreshActions";

oFF.PlanningModelResponseRefreshActions.prototype.getPlanningModelRequestRefreshVersions = function()
{
	return this.getPlanningCommand();
};

oFF.PlanningModelResponseRefreshVersions = function() {};
oFF.PlanningModelResponseRefreshVersions.prototype = new oFF.PlanningModelResponse();
oFF.PlanningModelResponseRefreshVersions.prototype._ff_c = "PlanningModelResponseRefreshVersions";

oFF.PlanningModelResponseRefreshVersions.prototype.getPlanningModelRequestRefreshVersions = function()
{
	return this.getPlanningCommand();
};

oFF.PlanningModelResponseUpdateVersionPrivileges = function() {};
oFF.PlanningModelResponseUpdateVersionPrivileges.prototype = new oFF.PlanningModelResponse();
oFF.PlanningModelResponseUpdateVersionPrivileges.prototype._ff_c = "PlanningModelResponseUpdateVersionPrivileges";

oFF.PlanningModelResponseUpdateVersionPrivileges.getVersionDataSource = function(querySourceStructure)
{
	let dataSource = oFF.QFactory.createDataSourceWithType(oFF.MetaObjectType.PLANNING, oFF.PrUtils.getStringValueProperty(querySourceStructure, "query_source", null));
	dataSource.setSchemaName(oFF.PrUtils.getStringValueProperty(querySourceStructure, "query_source_schema", null));
	return dataSource;
};
oFF.PlanningModelResponseUpdateVersionPrivileges.resetVersionPrivilegesClientState = function(planningModel)
{
	let versionPrivileges = planningModel.getVersionPrivileges();
	for (let i = 0; i < versionPrivileges.size(); i++)
	{
		let versionPrivilege = versionPrivileges.get(i);
		let serverState = versionPrivilege.getPrivilegeStateServer();
		let clientState;
		if (serverState === oFF.PlanningPrivilegeState.GRANTED)
		{
			clientState = oFF.PlanningPrivilegeState.GRANTED;
		}
		else if (serverState === oFF.PlanningPrivilegeState.NEW)
		{
			clientState = oFF.PlanningPrivilegeState.NEW;
		}
		else
		{
			throw oFF.XException.createIllegalStateException("illegal state");
		}
		versionPrivilege.setPrivilegeState(clientState);
	}
};
oFF.PlanningModelResponseUpdateVersionPrivileges.resetVersionPrivilegesServerState = function(planningModel)
{
	let versionPrivileges = planningModel.getVersionPrivileges();
	for (let i = 0; i < versionPrivileges.size(); i++)
	{
		let versionPrivilege = versionPrivileges.get(i);
		versionPrivilege.setPrivilegeStateServer(oFF.PlanningPrivilegeState.NEW);
	}
};
oFF.PlanningModelResponseUpdateVersionPrivileges.updateVersionPrivileges = function(planningModel, dataSource, planningVersionIdentifier, versionPrivilegeList)
{
	let len = oFF.PrUtils.getListSize(versionPrivilegeList, 0);
	for (let i = 0; i < len; i++)
	{
		let versionPrivilegeStructure = oFF.PrUtils.getStructureElement(versionPrivilegeList, i);
		let planningPrivilege = oFF.PlanningPrivilege.lookupWithDefault(oFF.PrUtils.getStringValueProperty(versionPrivilegeStructure, "privilege", null), null);
		let grantee = oFF.PrUtils.getStringValueProperty(versionPrivilegeStructure, "grantee", null);
		let versionPrivilege = planningModel.getVersionPrivilegeById(dataSource, planningVersionIdentifier, planningPrivilege, grantee);
		versionPrivilege.setPrivilegeStateServer(oFF.PlanningPrivilegeState.GRANTED);
	}
};
oFF.PlanningModelResponseUpdateVersionPrivileges.prototype.getPlanningModelRequestUpdateVersionPrivileges = function()
{
	return this.getPlanningCommand();
};

oFF.PlanningModelResponseVersion = function() {};
oFF.PlanningModelResponseVersion.prototype = new oFF.PlanningModelResponse();
oFF.PlanningModelResponseVersion.prototype._ff_c = "PlanningModelResponseVersion";

oFF.PlanningModelResponseVersion.prototype.getPlanningModelRequestVersion = function()
{
	return this.getPlanningCommand();
};

oFF.DataAreaRequestCreatePlanningFunction = function() {};
oFF.DataAreaRequestCreatePlanningFunction.prototype = new oFF.DataAreaRequestCreatePlanningOperation();
oFF.DataAreaRequestCreatePlanningFunction.prototype._ff_c = "DataAreaRequestCreatePlanningFunction";

oFF.DataAreaRequestCreatePlanningFunction.create = function(planningService)
{
	let newObj = new oFF.DataAreaRequestCreatePlanningFunction();
	let olapApplication = planningService.getApplication().getOlapEnvironment();
	let context = olapApplication.getContext();
	newObj.setupModelComponent(context, null);
	newObj.setPlanningService(planningService);
	return newObj;
};
oFF.DataAreaRequestCreatePlanningFunction.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.DataAreaResponseCreatePlanningFunction();
};
oFF.DataAreaRequestCreatePlanningFunction.prototype.getPlanningFunctionIdentifier = function()
{
	return this.getPlanningOperationIdentifier();
};

oFF.DataAreaRequestCreatePlanningSequence = function() {};
oFF.DataAreaRequestCreatePlanningSequence.prototype = new oFF.DataAreaRequestCreatePlanningOperation();
oFF.DataAreaRequestCreatePlanningSequence.prototype._ff_c = "DataAreaRequestCreatePlanningSequence";

oFF.DataAreaRequestCreatePlanningSequence.create = function(planningService)
{
	let newObj = new oFF.DataAreaRequestCreatePlanningSequence();
	let olapApplication = planningService.getApplication().getOlapEnvironment();
	let context = olapApplication.getContext();
	newObj.setupModelComponent(context, null);
	newObj.setPlanningService(planningService);
	return newObj;
};
oFF.DataAreaRequestCreatePlanningSequence.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.DataAreaResponseCreatePlanningSequence();
};
oFF.DataAreaRequestCreatePlanningSequence.prototype.getPlanningSequenceIdentifier = function()
{
	return this.getPlanningOperationIdentifier();
};

oFF.DataAreaRequestGetPlanningFunctionMetadata = function() {};
oFF.DataAreaRequestGetPlanningFunctionMetadata.prototype = new oFF.DataAreaRequestGetPlanningOperationMetadata();
oFF.DataAreaRequestGetPlanningFunctionMetadata.prototype._ff_c = "DataAreaRequestGetPlanningFunctionMetadata";

oFF.DataAreaRequestGetPlanningFunctionMetadata.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.DataAreaResponseGetPlanningFunctionMetadata();
};
oFF.DataAreaRequestGetPlanningFunctionMetadata.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.DATA_AREA_GET_FUNCTION_METADATA;
};
oFF.DataAreaRequestGetPlanningFunctionMetadata.prototype.getPlanningFunctionIdentifier = function()
{
	return this.getPlanningOperationIdentifier();
};

oFF.DataAreaRequestGetPlanningSequenceMetadata = function() {};
oFF.DataAreaRequestGetPlanningSequenceMetadata.prototype = new oFF.DataAreaRequestGetPlanningOperationMetadata();
oFF.DataAreaRequestGetPlanningSequenceMetadata.prototype._ff_c = "DataAreaRequestGetPlanningSequenceMetadata";

oFF.DataAreaRequestGetPlanningSequenceMetadata.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.DataAreaResponseGetPlanningSequenceMetadata();
};
oFF.DataAreaRequestGetPlanningSequenceMetadata.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.DATA_AREA_GET_SEQUENCE_METADATA;
};
oFF.DataAreaRequestGetPlanningSequenceMetadata.prototype.getPlanningSequenceIdentifier = function()
{
	return this.getPlanningOperationIdentifier();
};

oFF.DataAreaResponseCreatePlanningFunction = function() {};
oFF.DataAreaResponseCreatePlanningFunction.prototype = new oFF.DataAreaResponseCreatePlanningOperation();
oFF.DataAreaResponseCreatePlanningFunction.prototype._ff_c = "DataAreaResponseCreatePlanningFunction";

oFF.DataAreaResponseCreatePlanningFunction.prototype.getCreatedPlanningFunction = function()
{
	return this.getCreatedPlanningOperation();
};
oFF.DataAreaResponseCreatePlanningFunction.prototype.getDataAreaRequestCreatePlanningFunction = function()
{
	return this.getDataAreaRequestCreatePlanningOperation();
};

oFF.DataAreaResponseCreatePlanningSequence = function() {};
oFF.DataAreaResponseCreatePlanningSequence.prototype = new oFF.DataAreaResponseCreatePlanningOperation();
oFF.DataAreaResponseCreatePlanningSequence.prototype._ff_c = "DataAreaResponseCreatePlanningSequence";

oFF.DataAreaResponseCreatePlanningSequence.prototype.getCreatedPlanningSequence = function()
{
	return this.getCreatedPlanningOperation();
};
oFF.DataAreaResponseCreatePlanningSequence.prototype.getDataAreaRequestCreatePlanningSequence = function()
{
	return this.getDataAreaRequestCreatePlanningOperation();
};

oFF.DataAreaResponseGetPlanningFunctionMetadata = function() {};
oFF.DataAreaResponseGetPlanningFunctionMetadata.prototype = new oFF.DataAreaResponseGetPlanningOperationMetadata();
oFF.DataAreaResponseGetPlanningFunctionMetadata.prototype._ff_c = "DataAreaResponseGetPlanningFunctionMetadata";

oFF.DataAreaResponseGetPlanningFunctionMetadata.prototype.getDataAreaRequestGetPlanningFunctionMetadata = function()
{
	return this.getDataAreaRequestGetPlanningOperationMetadata();
};
oFF.DataAreaResponseGetPlanningFunctionMetadata.prototype.getPlanningFunctionMetadata = function()
{
	return this.getPlanningOperationMetadata();
};

oFF.DataAreaResponseGetPlanningSequenceMetadata = function() {};
oFF.DataAreaResponseGetPlanningSequenceMetadata.prototype = new oFF.DataAreaResponseGetPlanningOperationMetadata();
oFF.DataAreaResponseGetPlanningSequenceMetadata.prototype._ff_c = "DataAreaResponseGetPlanningSequenceMetadata";

oFF.DataAreaResponseGetPlanningSequenceMetadata.prototype.getDataAreaRequestGetPlanningSequenceMetadata = function()
{
	return this.getDataAreaRequestGetPlanningOperationMetadata();
};
oFF.DataAreaResponseGetPlanningSequenceMetadata.prototype.getPlanningSequenceMetadata = function()
{
	return this.getPlanningOperationMetadata();
};

oFF.PlanningModelRequestVersionClose = function() {};
oFF.PlanningModelRequestVersionClose.prototype = new oFF.PlanningModelRequestVersion();
oFF.PlanningModelRequestVersionClose.prototype._ff_c = "PlanningModelRequestVersionClose";

oFF.PlanningModelRequestVersionClose.CLOSE_MODE = "CLOSE_MODE";
oFF.PlanningModelRequestVersionClose.prototype.getCloseMode = function()
{
	return this.getPropertyObject(oFF.PlanningModelRequestVersionClose.CLOSE_MODE);
};
oFF.PlanningModelRequestVersionClose.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_CLOSE_COMMAND;
};
oFF.PlanningModelRequestVersionClose.prototype.setCloseMode = function(closeMode)
{
	this.setPropertyObject(oFF.PlanningModelRequestVersionClose.CLOSE_MODE, closeMode);
	return this;
};

oFF.PlanningModelRequestVersionEndActionSequence = function() {};
oFF.PlanningModelRequestVersionEndActionSequence.prototype = new oFF.PlanningModelRequestVersion();
oFF.PlanningModelRequestVersionEndActionSequence.prototype._ff_c = "PlanningModelRequestVersionEndActionSequence";

oFF.PlanningModelRequestVersionEndActionSequence.DESCRIPTION = "DESCRIPTION";
oFF.PlanningModelRequestVersionEndActionSequence.SEQUENCE_ID = "SEQUENCE_ID";
oFF.PlanningModelRequestVersionEndActionSequence.prototype.getDescription = function()
{
	return this.getPropertyString(oFF.PlanningModelRequestVersionEndActionSequence.DESCRIPTION);
};
oFF.PlanningModelRequestVersionEndActionSequence.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_END_ACTION_SEQUENCE_COMMAND;
};
oFF.PlanningModelRequestVersionEndActionSequence.prototype.getSequenceId = function()
{
	return this.getPropertyString(oFF.PlanningModelRequestVersionEndActionSequence.SEQUENCE_ID);
};
oFF.PlanningModelRequestVersionEndActionSequence.prototype.setDescription = function(description)
{
	this.setPropertyString(oFF.PlanningModelRequestVersionEndActionSequence.DESCRIPTION, description);
	return this;
};
oFF.PlanningModelRequestVersionEndActionSequence.prototype.setSequenceId = function(sequenceId)
{
	this.setPropertyString(oFF.PlanningModelRequestVersionEndActionSequence.SEQUENCE_ID, sequenceId);
	return this;
};

oFF.PlanningModelRequestVersionSetParameters = function() {};
oFF.PlanningModelRequestVersionSetParameters.prototype = new oFF.PlanningModelRequestVersion();
oFF.PlanningModelRequestVersionSetParameters.prototype._ff_c = "PlanningModelRequestVersionSetParameters";

oFF.PlanningModelRequestVersionSetParameters.VERSION_PARAMETERS_STRUCTURE = "VERSION_PARAMETERS_STRUCTURE";
oFF.PlanningModelRequestVersionSetParameters.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_SET_PARAMETERS_COMMAND;
};
oFF.PlanningModelRequestVersionSetParameters.prototype.getVersionParametersStructure = function()
{
	return this.getPropertyObject(oFF.PlanningModelRequestVersionSetParameters.VERSION_PARAMETERS_STRUCTURE);
};
oFF.PlanningModelRequestVersionSetParameters.prototype.setVersionParametersAsJson = function(parametersJson)
{
	this.setPropertyObject(oFF.PlanningModelRequestVersionSetParameters.VERSION_PARAMETERS_STRUCTURE, parametersJson);
	if (oFF.notNull(parametersJson))
	{
		let version = this.getPlanningVersion();
		let showAsPublicVersion = parametersJson.getIntegerByKeyExt("showAsPublicVersion", -1);
		version.setShowingAsPublicVersion(showAsPublicVersion === 1);
		let sourceVersionName = parametersJson.getStringByKeyExt("source version", null);
		if (!oFF.XStringUtils.isNullOrEmpty(sourceVersionName))
		{
			sourceVersionName = oFF.XStringUtils.concatenate3("public", ".", sourceVersionName);
		}
		version.setSourceVersionName(sourceVersionName);
	}
	return this;
};

oFF.PlanningModelRequestVersionSetTimeout = function() {};
oFF.PlanningModelRequestVersionSetTimeout.prototype = new oFF.PlanningModelRequestVersion();
oFF.PlanningModelRequestVersionSetTimeout.prototype._ff_c = "PlanningModelRequestVersionSetTimeout";

oFF.PlanningModelRequestVersionSetTimeout.TIMEOUT = "TIMEOUT";
oFF.PlanningModelRequestVersionSetTimeout.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_SET_TIMEOUT_COMMAND;
};
oFF.PlanningModelRequestVersionSetTimeout.prototype.getTimeout = function()
{
	return this.getPropertyInteger(oFF.PlanningModelRequestVersionSetTimeout.TIMEOUT);
};
oFF.PlanningModelRequestVersionSetTimeout.prototype.setTimeout = function(seconds)
{
	this.setPropertyInteger(oFF.PlanningModelRequestVersionSetTimeout.TIMEOUT, seconds);
	return this;
};

oFF.PlanningModelRequestVersionStartActionSequence = function() {};
oFF.PlanningModelRequestVersionStartActionSequence.prototype = new oFF.PlanningModelRequestVersion();
oFF.PlanningModelRequestVersionStartActionSequence.prototype._ff_c = "PlanningModelRequestVersionStartActionSequence";

oFF.PlanningModelRequestVersionStartActionSequence.DESCRIPTION = "DESCRIPTION";
oFF.PlanningModelRequestVersionStartActionSequence.SEQUENCE_ID = "SEQUENCE_ID";
oFF.PlanningModelRequestVersionStartActionSequence.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningModelResponseVersionStartActionSequence();
};
oFF.PlanningModelRequestVersionStartActionSequence.prototype.getDescription = function()
{
	return this.getPropertyString(oFF.PlanningModelRequestVersionStartActionSequence.DESCRIPTION);
};
oFF.PlanningModelRequestVersionStartActionSequence.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_START_ACTION_SEQUENCE_COMMAND;
};
oFF.PlanningModelRequestVersionStartActionSequence.prototype.getSequenceId = function()
{
	return this.getPropertyString(oFF.PlanningModelRequestVersionStartActionSequence.SEQUENCE_ID);
};
oFF.PlanningModelRequestVersionStartActionSequence.prototype.setDescription = function(description)
{
	this.setPropertyString(oFF.PlanningModelRequestVersionStartActionSequence.DESCRIPTION, description);
	return this;
};
oFF.PlanningModelRequestVersionStartActionSequence.prototype.setSequenceId = function(sequenceId)
{
	this.setPropertyString(oFF.PlanningModelRequestVersionStartActionSequence.SEQUENCE_ID, sequenceId);
	return this;
};

oFF.PlanningModelRequestVersionStateDescriptions = function() {};
oFF.PlanningModelRequestVersionStateDescriptions.prototype = new oFF.PlanningModelRequestVersion();
oFF.PlanningModelRequestVersionStateDescriptions.prototype._ff_c = "PlanningModelRequestVersionStateDescriptions";

oFF.PlanningModelRequestVersionStateDescriptions.COUNT = "COUNT";
oFF.PlanningModelRequestVersionStateDescriptions.START_INDEX = "START_INDEX";
oFF.PlanningModelRequestVersionStateDescriptions.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningModelResponseVersionStateDescriptions();
};
oFF.PlanningModelRequestVersionStateDescriptions.prototype.getCount = function()
{
	return this.getPropertyInteger(oFF.PlanningModelRequestVersionStateDescriptions.COUNT);
};
oFF.PlanningModelRequestVersionStateDescriptions.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_STATE_DESCRIPTIONS_COMMAND;
};
oFF.PlanningModelRequestVersionStateDescriptions.prototype.getStartIndex = function()
{
	return this.getPropertyInteger(oFF.PlanningModelRequestVersionStateDescriptions.START_INDEX);
};
oFF.PlanningModelRequestVersionStateDescriptions.prototype.setCount = function(count)
{
	this.setPropertyInteger(oFF.PlanningModelRequestVersionStateDescriptions.COUNT, count);
	return this;
};
oFF.PlanningModelRequestVersionStateDescriptions.prototype.setStartIndex = function(startIndex)
{
	this.setPropertyInteger(oFF.PlanningModelRequestVersionStateDescriptions.START_INDEX, startIndex);
	return this;
};

oFF.PlanningModelRequestVersionUndoRedo = function() {};
oFF.PlanningModelRequestVersionUndoRedo.prototype = new oFF.PlanningModelRequestVersion();
oFF.PlanningModelRequestVersionUndoRedo.prototype._ff_c = "PlanningModelRequestVersionUndoRedo";

oFF.PlanningModelRequestVersionUndoRedo.NUM_UNDO_REDO_STEPS = "NUM_UNDO_REDO_STEPS";
oFF.PlanningModelRequestVersionUndoRedo.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_UNDO_REDO_COMMAND;
};
oFF.PlanningModelRequestVersionUndoRedo.prototype.getSteps = function()
{
	return this.getPropertyInteger(oFF.PlanningModelRequestVersionUndoRedo.NUM_UNDO_REDO_STEPS);
};
oFF.PlanningModelRequestVersionUndoRedo.prototype.setSteps = function(steps)
{
	this.setPropertyInteger(oFF.PlanningModelRequestVersionUndoRedo.NUM_UNDO_REDO_STEPS, steps);
	return this;
};

oFF.PlanningModelResponseVersionStartActionSequence = function() {};
oFF.PlanningModelResponseVersionStartActionSequence.prototype = new oFF.PlanningModelResponseVersion();
oFF.PlanningModelResponseVersionStartActionSequence.prototype._ff_c = "PlanningModelResponseVersionStartActionSequence";

oFF.PlanningModelResponseVersionStartActionSequence.SEQUENCE_ID = "SEQUENCE_ID";
oFF.PlanningModelResponseVersionStartActionSequence.prototype.getPlanningModelRequestVersion = function()
{
	return this.getPlanningCommand();
};
oFF.PlanningModelResponseVersionStartActionSequence.prototype.getSequenceId = function()
{
	return this.getPropertyString(oFF.PlanningModelResponseVersionStartActionSequence.SEQUENCE_ID);
};
oFF.PlanningModelResponseVersionStartActionSequence.prototype.setSequenceId = function(sequenceId)
{
	this.setPropertyString(oFF.PlanningModelResponseVersionStartActionSequence.SEQUENCE_ID, sequenceId);
};

oFF.PlanningModelResponseVersionStateDescriptions = function() {};
oFF.PlanningModelResponseVersionStateDescriptions.prototype = new oFF.PlanningModelResponseVersion();
oFF.PlanningModelResponseVersionStateDescriptions.prototype._ff_c = "PlanningModelResponseVersionStateDescriptions";

oFF.PlanningModelResponseVersionStateDescriptions.AVAILABLE_REDOS = "AVAILABLE_REDOS";
oFF.PlanningModelResponseVersionStateDescriptions.AVAILABLE_UNDOS = "AVAILABLE_UNDOS";
oFF.PlanningModelResponseVersionStateDescriptions.DESCRIPTIONS = "DESCRIPTIONS";
oFF.PlanningModelResponseVersionStateDescriptions.VERSION_DESCRIPTION = "VERSION_DESCRIPTION";
oFF.PlanningModelResponseVersionStateDescriptions.VERSION_IDENTIFIER = "VERSION_IDENTIFIER";
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getAvailableRedos = function()
{
	return this.getPropertyInteger(oFF.PlanningModelResponseVersionStateDescriptions.AVAILABLE_REDOS);
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getAvailableUndos = function()
{
	return this.getPropertyInteger(oFF.PlanningModelResponseVersionStateDescriptions.AVAILABLE_UNDOS);
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getPlanningModelRequestVersion = function()
{
	return this.getPlanningCommand();
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getVersionDescription = function()
{
	return this.getPropertyString(oFF.PlanningModelResponseVersionStateDescriptions.VERSION_DESCRIPTION);
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getVersionId = function()
{
	return this.getVersionIdentifier().getVersionId();
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getVersionIdentifier = function()
{
	return this.getPropertyObject(oFF.PlanningModelResponseVersionStateDescriptions.VERSION_IDENTIFIER);
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getVersionKey = function()
{
	return this.getVersionIdentifier().getVersionKey();
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getVersionOwner = function()
{
	return this.getVersionIdentifier().getVersionOwner();
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getVersionStateDescription = function(index)
{
	return this.getVersionStateDescriptionList().get(index);
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getVersionStateDescriptionIterator = function()
{
	return this.getVersionStateDescriptionList().getIterator();
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getVersionStateDescriptionList = function()
{
	return this.getPropertyObject(oFF.PlanningModelResponseVersionStateDescriptions.DESCRIPTIONS);
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getVersionStateDescriptionSize = function()
{
	return this.getVersionStateDescriptionList().size();
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getVersionUniqueName = function()
{
	return this.getVersionIdentifier().getVersionUniqueName();
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.isSharedVersion = function()
{
	return this.getVersionIdentifier().isSharedVersion();
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.setAvailableRedos = function(redos)
{
	this.setPropertyInteger(oFF.PlanningModelResponseVersionStateDescriptions.AVAILABLE_REDOS, redos);
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.setAvailableUndos = function(undos)
{
	this.setPropertyInteger(oFF.PlanningModelResponseVersionStateDescriptions.AVAILABLE_UNDOS, undos);
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.setVersionDescription = function(versionDescription)
{
	this.setPropertyString(oFF.PlanningModelResponseVersionStateDescriptions.VERSION_DESCRIPTION, versionDescription);
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.setVersionIdentifier = function(identifier)
{
	this.setPropertyObject(oFF.PlanningModelResponseVersionStateDescriptions.VERSION_IDENTIFIER, identifier);
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.setVersionStateDescriptions = function(descriptions)
{
	this.setPropertyObject(oFF.PlanningModelResponseVersionStateDescriptions.DESCRIPTIONS, descriptions);
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.toString = function()
{
	let buffer = oFF.XStringBuffer.create();
	buffer.append("version id: ").appendInt(this.getVersionId()).append("\n");
	buffer.append("version description: ").append(this.getVersionDescription()).append("\n");
	buffer.append("undos: ").appendInt(this.getAvailableUndos()).append("\n");
	buffer.append("redos: ").appendInt(this.getAvailableRedos()).append("\n");
	let descriptionIterator = this.getVersionStateDescriptionIterator();
	buffer.append("state descriptions: [");
	while (descriptionIterator.hasNext())
	{
		buffer.append(descriptionIterator.next().toString());
		if (descriptionIterator.hasNext())
		{
			buffer.append(", ");
		}
	}
	buffer.append("]");
	return buffer.toString();
};

oFF.PlanningModelRequestVersionInit = function() {};
oFF.PlanningModelRequestVersionInit.prototype = new oFF.PlanningModelRequestVersionSetParameters();
oFF.PlanningModelRequestVersionInit.prototype._ff_c = "PlanningModelRequestVersionInit";

oFF.PlanningModelRequestVersionInit.RESTORE_BACKUP_TYPE = "RESTORE_BACKUP_TYPE";
oFF.PlanningModelRequestVersionInit.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_INIT_COMMAND;
};
oFF.PlanningModelRequestVersionInit.prototype.getRestoreBackupType = function()
{
	let restoreBackupType = this.getPropertyObject(oFF.PlanningModelRequestVersionInit.RESTORE_BACKUP_TYPE);
	if (oFF.isNull(restoreBackupType))
	{
		restoreBackupType = oFF.RestoreBackupType.NONE;
	}
	return restoreBackupType;
};
oFF.PlanningModelRequestVersionInit.prototype.getVersionParameters = function()
{
	let parametersStructure = this.getVersionParametersStructure();
	return oFF.PlanningVersion.parametersStructure2ParametersStringMap(parametersStructure);
};
oFF.PlanningModelRequestVersionInit.prototype.setRestoreBackupType = function(restoreBackupType)
{
	this.setPropertyObject(oFF.PlanningModelRequestVersionInit.RESTORE_BACKUP_TYPE, restoreBackupType);
	return this;
};
oFF.PlanningModelRequestVersionInit.prototype.setVersionParameters = function(parameters)
{
	let parametersStructure = oFF.PlanningVersion.parametersStringMap2ParametersStructure(parameters);
	this.setVersionParametersAsJson(parametersStructure);
	return this;
};
oFF.PlanningModelRequestVersionInit.prototype.setVersionParametersAsJson = function(parametersJson)
{
	oFF.PlanningModelRequestVersionSetParameters.prototype.setVersionParametersAsJson.call( this , parametersJson);
	if (oFF.notNull(parametersJson))
	{
		this.tryPublicVersionEdit();
	}
	return this;
};
oFF.PlanningModelRequestVersionInit.prototype.tryPublicVersionEdit = function()
{
	let planningModel = this.getPlanningModel();
	if (oFF.isNull(planningModel) || !planningModel.supportsPublicVersionEdit())
	{
		return;
	}
	let version = this.getPlanningVersion();
	let publicVersionEdit = version.isShowingAsPublicVersion() && oFF.XStringUtils.isNotNullAndNotEmpty(version.getSourceVersionName());
	this.setInvalidatingResultSet(!publicVersionEdit);
};

oFF.IpImplModule = function() {};
oFF.IpImplModule.prototype = new oFF.DfModule();
oFF.IpImplModule.prototype._ff_c = "IpImplModule";

oFF.IpImplModule.s_module = null;
oFF.IpImplModule.getInstance = function()
{
	if (oFF.isNull(oFF.IpImplModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.OlapImplModule.getInstance());
		oFF.IpImplModule.s_module = oFF.DfModule.startExt(new oFF.IpImplModule());
		let registrationService = oFF.RegistrationService.getInstance();
		oFF.PlanningServiceConfig.staticSetup();
		registrationService.addServiceConfig(oFF.OlapApiModule.XS_PLANNING, oFF.PlanningServiceConfig.CLAZZ);
		oFF.PlanningService.staticSetup();
		registrationService.addService(oFF.OlapApiModule.XS_PLANNING, oFF.PlanningService.CLAZZ);
		oFF.XCmdInitPlanningStep.staticSetup();
		oFF.XCmdInitPlanningStepResult.staticSetup();
		registrationService.addCommand(oFF.XCmdInitPlanningStep.CMD_NAME, oFF.XCmdInitPlanningStep.CLAZZ);
		oFF.XCmdCreatePlanningOperation.staticSetup();
		oFF.XCmdCreatePlanningOperationResult.staticSetup();
		registrationService.addCommand(oFF.XCmdCreatePlanningOperation.CMD_NAME, oFF.XCmdCreatePlanningOperation.CLAZZ);
		oFF.PlanningBatchRequestDecoratorProvider.staticSetup();
		registrationService.addReference(oFF.BatchRequestDecoratorFactory.BATCH_REQUEST_DECORATOR_PROVIDER, oFF.PlanningBatchRequestDecoratorProvider.CLAZZ);
		oFF.PlanningRsRequestDecoratorProvider.staticSetup();
		registrationService.addReference(oFF.RsRequestDecoratorFactory.RESULTSET_REQUEST_DECORATOR_PROVIDER, oFF.PlanningRsRequestDecoratorProvider.CLAZZ);
		oFF.PlanningFactory.setInstance(new oFF.PlanningManagerFactoryImpl());
		oFF.DfModule.stopExt(oFF.IpImplModule.s_module);
	}
	return oFF.IpImplModule.s_module;
};
oFF.IpImplModule.prototype.getName = function()
{
	return "ff4315.olap.ip.impl";
};

oFF.IpImplModule.getInstance();

return oFF;
} );
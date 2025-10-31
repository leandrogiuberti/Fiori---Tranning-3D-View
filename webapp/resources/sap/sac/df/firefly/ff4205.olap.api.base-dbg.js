/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff4200.olap.api","sap/sac/df/firefly/ff2610.visualization.internal"
],
function(oFF)
{
"use strict";

oFF.QFilterUtilBase = {

	_addMemberNamesFromFilter:function(filterElement, dimName, memberNames)
	{
			if (oFF.isNull(filterElement))
		{
			return;
		}
		let componentType = filterElement.getComponentType();
		if (componentType === oFF.FilterComponentType.OPERATION)
		{
			let filterOp = filterElement;
			if (filterOp.getSetSign() !== oFF.SetSign.EXCLUDING && oFF.XString.isEqual(dimName, filterOp.getDimensionName()))
			{
				let memberName = filterOp.getLow().getString();
				if (oFF.notNull(memberName) && !memberNames.contains(memberName))
				{
					memberNames.add(memberName);
				}
			}
		}
		else if (componentType.isTypeOf(oFF.FilterComponentType.BOOLEAN_ALGEBRA) && !componentType.isTypeOf(oFF.FilterComponentType.NOT))
		{
			let filterAlgebra = filterElement;
			let size = filterAlgebra.size();
			for (let idx = 0; idx < size; idx++)
			{
				oFF.QFilterUtilBase._addMemberNamesFromFilter(filterAlgebra.get(idx), dimName, memberNames);
			}
		}
		else if (componentType.isTypeOf(oFF.OlapComponentType.FILTER_EXPRESSION))
		{
			oFF.QFilterUtilBase._addMemberNamesFromFilter(filterElement.getFilterRootElement(), dimName, memberNames);
		}
	},
	filterContainsExclusion:function(filterElement, dimName)
	{
			if (oFF.isNull(filterElement))
		{
			return false;
		}
		let componentType = filterElement.getComponentType();
		if (componentType === oFF.FilterComponentType.OPERATION)
		{
			let filterOp = filterElement;
			if (filterOp.getSetSign() === oFF.SetSign.EXCLUDING && oFF.XString.isEqual(dimName, filterOp.getDimensionName()))
			{
				return true;
			}
		}
		else if (componentType.isTypeOf(oFF.FilterComponentType.BOOLEAN_ALGEBRA) && !componentType.isTypeOf(oFF.FilterComponentType.NOT))
		{
			let filterAlgebra = filterElement;
			let size = filterAlgebra.size();
			for (let idx = 0; idx < size; idx++)
			{
				if (oFF.QFilterUtilBase.filterContainsExclusion(filterAlgebra.get(idx), dimName))
				{
					return true;
				}
			}
		}
		else if (componentType.isTypeOf(oFF.OlapComponentType.FILTER_EXPRESSION))
		{
			return oFF.QFilterUtilBase.filterContainsExclusion(filterElement.getFilterRootElement(), dimName);
		}
		return false;
	},
	getMemberNamesFromFilter:function(filterElement, dimName)
	{
			let memberNames = oFF.XList.create();
		oFF.QFilterUtilBase._addMemberNamesFromFilter(filterElement, dimName, memberNames);
		return memberNames.getValuesAsReadOnlyList();
	},
	getMembersInUseFromList:function(structureMembersList, filter, dimension)
	{
			let result = oFF.XList.create();
		if (oFF.notNull(structureMembersList))
		{
			let memberNames = oFF.XHashSetOfString.create();
			if (filter.isDynamicFilterInitialized())
			{
				let filterRootElement = filter.getDynamicFilter().getFilterRootElement();
				memberNames.addAll(oFF.QFilterUtilBase.getMemberNamesFromFilter(filterRootElement, dimension.getName()));
			}
			let linkedFilters = filter.getLinkedFilters().getValuesAsReadOnlyList();
			for (let i = 0; i < linkedFilters.size(); i++)
			{
				let filterElement = linkedFilters.get(i).getFilterRootElement();
				memberNames.addAll(oFF.QFilterUtilBase.getMemberNamesFromFilter(filterElement, dimension.getName()));
			}
			let isMemberUnfilteredButDimensionInUse = memberNames.size() === 0 && (dimension.getAxisType() === oFF.AxisType.ROWS || dimension.getAxisType() === oFF.AxisType.COLUMNS);
			if (isMemberUnfilteredButDimensionInUse)
			{
				result.addAll(structureMembersList);
			}
			else
			{
				result = oFF.XCollectionUtils.filter(structureMembersList, (structureMember) => {
					if (oFF.notNull(structureMember))
					{
						let aliasOrMemberName = structureMember.getAliasOrMemberName();
						let memberAliasNameFound = memberNames.contains(aliasOrMemberName);
						if (!memberAliasNameFound && structureMember.getAliasName() !== null)
						{
							memberAliasNameFound = memberNames.contains(dimension.getPlaceholderIdByAlias(aliasOrMemberName)) || memberNames.contains(dimension.getRuntimePlaceholderIdByAlias(aliasOrMemberName));
						}
						return memberAliasNameFound;
					}
					return false;
				});
			}
		}
		return result;
	}
};

oFF.QueryModelUtils = {

	getPreQueries:function(queryModel)
	{
			let result = oFF.XList.create();
		if (oFF.notNull(queryModel))
		{
			if (queryModel.isBlendingModel())
			{
				let dataSource = queryModel.getDataSource();
				let blendingDefinition = dataSource.getBlendingDefinition();
				if (oFF.notNull(blendingDefinition))
				{
					let sources = blendingDefinition.getSources();
					let sourcesIterator = sources.getIterator();
					while (sourcesIterator.hasNext())
					{
						let source = sourcesIterator.next();
						let sourceModel = source.getQueryModel();
						if (oFF.notNull(sourceModel) && !source.isRemoteSource())
						{
							result.addAll(oFF.QueryModelUtils.getPreQueries(sourceModel));
						}
					}
				}
			}
			else
			{
				let preQueries = queryModel.getPreQueries();
				if (oFF.XCollectionUtils.hasElements(preQueries))
				{
					result.addAll(preQueries);
				}
			}
		}
		return result;
	},
	isDWCModelWithCustomDimension2MemberMetadata:function(queryModel)
	{
			return queryModel.getModelCapabilities().supportsCustomDimension2MemberMetadata() && queryModel.getSystemDescription().isDWCConnection() && queryModel.getDataSource().getType() === oFF.MetaObjectType.INA_MODEL;
	}
};

oFF.QImExFlag = {

	DATASOURCE:1,
	DEFAULT_ALL:3,
	DRILL_CONTEXT:16,
	HIDE:8,
	RUN_AS_USER:4,
	VARIABLES:2
};

oFF.HierarchyCatalogCallbackLambda = function() {};
oFF.HierarchyCatalogCallbackLambda.prototype = new oFF.XObject();
oFF.HierarchyCatalogCallbackLambda.prototype._ff_c = "HierarchyCatalogCallbackLambda";

oFF.HierarchyCatalogCallbackLambda.createForCreation = function(callback)
{
	let obj = new oFF.HierarchyCatalogCallbackLambda();
	obj.m_creationCallback = callback;
	return obj;
};
oFF.HierarchyCatalogCallbackLambda.createForResult = function(callback)
{
	let obj = new oFF.HierarchyCatalogCallbackLambda();
	obj.m_resultCallback = callback;
	return obj;
};
oFF.HierarchyCatalogCallbackLambda.prototype.m_creationCallback = null;
oFF.HierarchyCatalogCallbackLambda.prototype.m_resultCallback = null;
oFF.HierarchyCatalogCallbackLambda.prototype.onHierarchyCatalogManagerCreated = function(extResult, hierarchyCatalogManager, customIdentifier)
{
	this.m_creationCallback(extResult);
	this.releaseObject();
};
oFF.HierarchyCatalogCallbackLambda.prototype.onHierarchyCatalogResult = function(extResult, result, customIdentifier)
{
	this.m_resultCallback(extResult);
	this.releaseObject();
};
oFF.HierarchyCatalogCallbackLambda.prototype.releaseObject = function()
{
	this.m_creationCallback = null;
	this.m_resultCallback = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.QueryManagerShutdownListenerLambda = function() {};
oFF.QueryManagerShutdownListenerLambda.prototype = new oFF.XObject();
oFF.QueryManagerShutdownListenerLambda.prototype._ff_c = "QueryManagerShutdownListenerLambda";

oFF.QueryManagerShutdownListenerLambda.createSingleUse = function(callback)
{
	let obj = new oFF.QueryManagerShutdownListenerLambda();
	obj.setupExt(callback);
	return obj;
};
oFF.QueryManagerShutdownListenerLambda.prototype.m_callback = null;
oFF.QueryManagerShutdownListenerLambda.prototype.onQueryManagerRelease = function(extResult, queryManager, customIdentifier)
{
	this.m_callback(extResult);
};
oFF.QueryManagerShutdownListenerLambda.prototype.releaseObject = function()
{
	this.m_callback = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.QueryManagerShutdownListenerLambda.prototype.setupExt = function(callback)
{
	this.m_callback = callback;
};

oFF.QueryExecutionListenerLambda = function() {};
oFF.QueryExecutionListenerLambda.prototype = new oFF.XObject();
oFF.QueryExecutionListenerLambda.prototype._ff_c = "QueryExecutionListenerLambda";

oFF.QueryExecutionListenerLambda.create = function(callback)
{
	let obj = new oFF.QueryExecutionListenerLambda();
	obj.setupExt(callback);
	return obj;
};
oFF.QueryExecutionListenerLambda.createAndAttach = function(queryManager, callback, isSingleUse)
{
	let obj = isSingleUse ? oFF.QueryExecutionListenerLambda.createSingleUse(callback) : oFF.QueryExecutionListenerLambda.create(callback);
	obj.m_queryManager = oFF.XObjectExt.assertNotNull(queryManager);
	queryManager.attachQueryExecutedListener(obj, null);
	return obj;
};
oFF.QueryExecutionListenerLambda.createSingleUse = function(callback)
{
	let obj = oFF.QueryExecutionListenerLambda.create(callback);
	obj.setSingleUse();
	return obj;
};
oFF.QueryExecutionListenerLambda.prototype.m_callback = null;
oFF.QueryExecutionListenerLambda.prototype.m_isSingleUse = false;
oFF.QueryExecutionListenerLambda.prototype.m_queryManager = null;
oFF.QueryExecutionListenerLambda.prototype.onQueryExecuted = function(extResult, resultSetContainer, customIdentifier)
{
	this.m_callback(extResult);
	if (this.m_isSingleUse)
	{
		this.releaseObject();
	}
};
oFF.QueryExecutionListenerLambda.prototype.releaseObject = function()
{
	if (oFF.notNull(this.m_queryManager))
	{
		this.m_queryManager.detachQueryExecutedListener(this);
	}
	this.m_queryManager = null;
	this.m_callback = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.QueryExecutionListenerLambda.prototype.setSingleUse = function()
{
	this.m_isSingleUse = true;
};
oFF.QueryExecutionListenerLambda.prototype.setupExt = function(callback)
{
	this.m_callback = callback;
	this.m_isSingleUse = false;
};

oFF.AbstractResultsetCollectorListenerLambda = function() {};
oFF.AbstractResultsetCollectorListenerLambda.prototype = new oFF.XObject();
oFF.AbstractResultsetCollectorListenerLambda.prototype._ff_c = "AbstractResultsetCollectorListenerLambda";

oFF.AbstractResultsetCollectorListenerLambda.createSingleUse = function(callback)
{
	let obj = new oFF.AbstractResultsetCollectorListenerLambda();
	obj.setupExt(callback);
	return obj;
};
oFF.AbstractResultsetCollectorListenerLambda.prototype.m_callback = null;
oFF.AbstractResultsetCollectorListenerLambda.prototype.onGridCollectorFilled = function(extResult, gridContainer, customIdentifier)
{
	this.m_callback(extResult);
	this.releaseObject();
};
oFF.AbstractResultsetCollectorListenerLambda.prototype.releaseObject = function()
{
	this.m_callback = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.AbstractResultsetCollectorListenerLambda.prototype.setupExt = function(callback)
{
	this.m_callback = callback;
};

oFF.AbstractVisualizationProvidedListenerLambda = function() {};
oFF.AbstractVisualizationProvidedListenerLambda.prototype = new oFF.XObject();
oFF.AbstractVisualizationProvidedListenerLambda.prototype._ff_c = "AbstractVisualizationProvidedListenerLambda";

oFF.AbstractVisualizationProvidedListenerLambda.createSingleUse = function(callback)
{
	let obj = new oFF.AbstractVisualizationProvidedListenerLambda();
	obj.setupExt(callback);
	return obj;
};
oFF.AbstractVisualizationProvidedListenerLambda.prototype.m_callback = null;
oFF.AbstractVisualizationProvidedListenerLambda.prototype.onVisualizationObjectFilled = function(extResult, visualisationContainer, customIdentifier)
{
	this.m_callback(extResult);
	this.releaseObject();
};
oFF.AbstractVisualizationProvidedListenerLambda.prototype.releaseObject = function()
{
	this.m_callback = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.AbstractVisualizationProvidedListenerLambda.prototype.setupExt = function(callback)
{
	this.m_callback = callback;
};

oFF.GenericVisualizationProvidedListenerLambda = function() {};
oFF.GenericVisualizationProvidedListenerLambda.prototype = new oFF.XObject();
oFF.GenericVisualizationProvidedListenerLambda.prototype._ff_c = "GenericVisualizationProvidedListenerLambda";

oFF.GenericVisualizationProvidedListenerLambda.createSingleUse = function(callback)
{
	let obj = new oFF.GenericVisualizationProvidedListenerLambda();
	obj.setupExt(callback);
	return obj;
};
oFF.GenericVisualizationProvidedListenerLambda.prototype.m_callback = null;
oFF.GenericVisualizationProvidedListenerLambda.prototype.onVisualizationObjectFilled = function(extResult, visualisationDefinition, customIdentifier)
{
	this.m_callback(extResult);
	this.releaseObject();
};
oFF.GenericVisualizationProvidedListenerLambda.prototype.releaseObject = function()
{
	this.m_callback = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.GenericVisualizationProvidedListenerLambda.prototype.setupExt = function(callback)
{
	this.m_callback = callback;
};

oFF.QueryManagerCreationListenerLambda = function() {};
oFF.QueryManagerCreationListenerLambda.prototype = new oFF.XObject();
oFF.QueryManagerCreationListenerLambda.prototype._ff_c = "QueryManagerCreationListenerLambda";

oFF.QueryManagerCreationListenerLambda.createSingleUse = function(callback)
{
	let obj = new oFF.QueryManagerCreationListenerLambda();
	obj.setupExt(callback);
	return obj;
};
oFF.QueryManagerCreationListenerLambda.prototype.m_callback = null;
oFF.QueryManagerCreationListenerLambda.prototype.onQueryManagerCreated = function(extResult, queryManager, customIdentifier)
{
	this.m_callback(extResult);
	this.releaseObject();
};
oFF.QueryManagerCreationListenerLambda.prototype.releaseObject = function()
{
	this.m_callback = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.QueryManagerCreationListenerLambda.prototype.setupExt = function(callback)
{
	this.m_callback = callback;
};

oFF.QValueHelpExecutedListenerLambda = function() {};
oFF.QValueHelpExecutedListenerLambda.prototype = new oFF.XObject();
oFF.QValueHelpExecutedListenerLambda.prototype._ff_c = "QValueHelpExecutedListenerLambda";

oFF.QValueHelpExecutedListenerLambda.createSingleUse = function(callback)
{
	let obj = new oFF.QValueHelpExecutedListenerLambda();
	obj.m_callback = callback;
	return obj;
};
oFF.QValueHelpExecutedListenerLambda.prototype.m_callback = null;
oFF.QValueHelpExecutedListenerLambda.prototype.onValuehelpExecuted = function(extResult, resultSetContainer, customIdentifier)
{
	this.m_callback(extResult);
	oFF.XObjectExt.release(this);
};
oFF.QValueHelpExecutedListenerLambda.prototype.releaseObject = function()
{
	this.m_callback = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.QDeltaBroadcastPhase = function() {};
oFF.QDeltaBroadcastPhase.prototype = new oFF.XConstant();
oFF.QDeltaBroadcastPhase.prototype._ff_c = "QDeltaBroadcastPhase";

oFF.QDeltaBroadcastPhase.AFTER_EVENTS_BROADCAST = null;
oFF.QDeltaBroadcastPhase.BEFORE_EVENTS_BROADCAST = null;
oFF.QDeltaBroadcastPhase.staticSetup = function()
{
	oFF.QDeltaBroadcastPhase.BEFORE_EVENTS_BROADCAST = oFF.XConstant.setupName(new oFF.QDeltaBroadcastPhase(), "BeforeEventsBroadcast");
	oFF.QDeltaBroadcastPhase.AFTER_EVENTS_BROADCAST = oFF.XConstant.setupName(new oFF.QDeltaBroadcastPhase(), "AfterEventsBroadcast");
};

oFF.QDeltaChangeState = function() {};
oFF.QDeltaChangeState.prototype = new oFF.XConstant();
oFF.QDeltaChangeState.prototype._ff_c = "QDeltaChangeState";

oFF.QDeltaChangeState.CHILDREN_CHANGED = null;
oFF.QDeltaChangeState.NODE_AND_CHILDREN_CHANGED = null;
oFF.QDeltaChangeState.NODE_CHANGED = null;
oFF.QDeltaChangeState.UNCHANGED = null;
oFF.QDeltaChangeState.staticSetup = function()
{
	oFF.QDeltaChangeState.UNCHANGED = oFF.XConstant.setupName(new oFF.QDeltaChangeState(), "Unchanged");
	oFF.QDeltaChangeState.NODE_CHANGED = oFF.XConstant.setupName(new oFF.QDeltaChangeState(), "NodeChanged");
	oFF.QDeltaChangeState.NODE_AND_CHILDREN_CHANGED = oFF.XConstant.setupName(new oFF.QDeltaChangeState(), "NodeAndChildrenChanged");
	oFF.QDeltaChangeState.CHILDREN_CHANGED = oFF.XConstant.setupName(new oFF.QDeltaChangeState(), "ChildrenChanged");
};

oFF.QDeltaOperationPhase = function() {};
oFF.QDeltaOperationPhase.prototype = new oFF.XConstant();
oFF.QDeltaOperationPhase.prototype._ff_c = "QDeltaOperationPhase";

oFF.QDeltaOperationPhase.NOTE_MODELER_CHANGES = null;
oFF.QDeltaOperationPhase.NOTIFY_DO_NOT_RAISEEVENTS = null;
oFF.QDeltaOperationPhase.NOTIFY_PAUSE_MODCOUNTER = null;
oFF.QDeltaOperationPhase.QUEUE = null;
oFF.QDeltaOperationPhase.RESUME = null;
oFF.QDeltaOperationPhase.STOP = null;
oFF.QDeltaOperationPhase.staticSetup = function()
{
	oFF.QDeltaOperationPhase.QUEUE = oFF.XConstant.setupName(new oFF.QDeltaOperationPhase(), "Queue");
	oFF.QDeltaOperationPhase.STOP = oFF.XConstant.setupName(new oFF.QDeltaOperationPhase(), "Stop");
	oFF.QDeltaOperationPhase.RESUME = oFF.XConstant.setupName(new oFF.QDeltaOperationPhase(), "Resume");
	oFF.QDeltaOperationPhase.NOTIFY_PAUSE_MODCOUNTER = oFF.XConstant.setupName(new oFF.QDeltaOperationPhase(), "MetadataUpdate");
	oFF.QDeltaOperationPhase.NOTIFY_DO_NOT_RAISEEVENTS = oFF.XConstant.setupName(new oFF.QDeltaOperationPhase(), "RunNotifyStackDoNotRaiseEvents");
	oFF.QDeltaOperationPhase.NOTE_MODELER_CHANGES = oFF.XConstant.setupName(new oFF.QDeltaOperationPhase(), "NoteModelerChange");
};

oFF.ProviderInitProcedure = function() {};
oFF.ProviderInitProcedure.prototype = new oFF.XConstant();
oFF.ProviderInitProcedure.prototype._ff_c = "ProviderInitProcedure";

oFF.ProviderInitProcedure.REQUEST_BY_MODEL = null;
oFF.ProviderInitProcedure.REQUEST_BY_STRUCTURE = null;
oFF.ProviderInitProcedure.SKIP = null;
oFF.ProviderInitProcedure.staticSetup = function()
{
	oFF.ProviderInitProcedure.REQUEST_BY_MODEL = oFF.XConstant.setupName(new oFF.ProviderInitProcedure(), "RequestByModel");
	oFF.ProviderInitProcedure.REQUEST_BY_STRUCTURE = oFF.XConstant.setupName(new oFF.ProviderInitProcedure(), "RequestByStructure");
	oFF.ProviderInitProcedure.SKIP = oFF.XConstant.setupName(new oFF.ProviderInitProcedure(), "Skip");
};

oFF.DfQContext = function() {};
oFF.DfQContext.prototype = new oFF.XObjectExt();
oFF.DfQContext.prototype._ff_c = "DfQContext";

oFF.DfQContext.prototype.m_context = null;
oFF.DfQContext.prototype.getApplication = function()
{
	if (this.getOlapEnv() === null)
	{
		return null;
	}
	return this.getOlapEnv().getApplication();
};
oFF.DfQContext.prototype.getCellContextManager = function()
{
	let context = this.getOriginContext();
	return oFF.isNull(context) ? null : context.getCellContextManager();
};
oFF.DfQContext.prototype.getContext = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_context);
};
oFF.DfQContext.prototype.getConvenienceCommands = function()
{
	let queryManager = this.getQueryManager();
	return oFF.isNull(queryManager) ? null : queryManager.getConvenienceCommands();
};
oFF.DfQContext.prototype.getDataSource = function()
{
	let context = this.getOriginContext();
	return oFF.isNull(context) ? null : context.getDataSource();
};
oFF.DfQContext.prototype.getDataSourceOrigin = function()
{
	return this.getDataSource();
};
oFF.DfQContext.prototype.getDataSourceTarget = function()
{
	return this.getDataSource();
};
oFF.DfQContext.prototype.getDimensionAccessor = function()
{
	let context = this.getOriginContext();
	return oFF.isNull(context) ? null : context.getDimensionAccessor();
};
oFF.DfQContext.prototype.getDrillManager = function()
{
	let context = this.getOriginContext();
	return oFF.isNull(context) ? null : context.getDrillManager();
};
oFF.DfQContext.prototype.getFieldAccessorSingle = function()
{
	let context = this.getOriginContext();
	return oFF.isNull(context) ? null : context.getFieldAccessorSingle();
};
oFF.DfQContext.prototype.getKeyRefStorage = function()
{
	let context = this.getOriginContext();
	return oFF.isNull(context) ? null : context.getKeyRefStorage();
};
oFF.DfQContext.prototype.getLogWriter = function()
{
	let session = this.getSession();
	return oFF.isNull(session) ? null : session.getLogWriter();
};
oFF.DfQContext.prototype.getModelCapabilities = function()
{
	let context = this.getOriginContext();
	return oFF.isNull(context) ? null : context.getModelCapabilities();
};
oFF.DfQContext.prototype.getOlapEnv = function()
{
	let context = this.getOriginContext();
	return oFF.isNull(context) || context === this ? null : context.getOlapEnv();
};
oFF.DfQContext.prototype.getOriginContext = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_context);
};
oFF.DfQContext.prototype.getProcess = function()
{
	return this.getApplication().getProcess();
};
oFF.DfQContext.prototype.getQueryManager = function()
{
	let context = this.getOriginContext();
	return oFF.isNull(context) ? null : context.getQueryManager();
};
oFF.DfQContext.prototype.getQueryManagerBase = function()
{
	return this.getQueryManager();
};
oFF.DfQContext.prototype.getQueryModel = function()
{
	let context = this.getOriginContext();
	return oFF.isNull(context) ? null : context.getQueryModel();
};
oFF.DfQContext.prototype.getQueryModelBase = function()
{
	return this.getQueryModel();
};
oFF.DfQContext.prototype.getSession = function()
{
	return this.getApplication().getSession();
};
oFF.DfQContext.prototype.getSystemName = function()
{
	let systemName = null;
	let queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		systemName = queryManager.getSystemName();
	}
	if (oFF.isNull(systemName))
	{
		let context = this.getContext();
		if (oFF.notNull(context))
		{
			systemName = context.getSystemName();
		}
	}
	return systemName;
};
oFF.DfQContext.prototype.getVariableContainer = function()
{
	let context = this.getOriginContext();
	return oFF.isNull(context) ? null : context.getVariableContainer();
};
oFF.DfQContext.prototype.releaseObject = function()
{
	this.m_context = oFF.XObjectExt.release(this.m_context);
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.DfQContext.prototype.setContext = function(context)
{
	if (oFF.notNull(context))
	{
		this.m_context = oFF.XWeakReferenceUtil.getWeakRef(context);
	}
};
oFF.DfQContext.prototype.setupContext = function(context)
{
	this.setContext(context);
};

oFF.OlapApiBaseModule = function() {};
oFF.OlapApiBaseModule.prototype = new oFF.DfModule();
oFF.OlapApiBaseModule.prototype._ff_c = "OlapApiBaseModule";

oFF.OlapApiBaseModule.s_module = null;
oFF.OlapApiBaseModule.getInstance = function()
{
	if (oFF.isNull(oFF.OlapApiBaseModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.OlapApiModule.getInstance());
		oFF.OlapApiBaseModule.s_module = oFF.DfModule.startExt(new oFF.OlapApiBaseModule());
		oFF.ProviderInitProcedure.staticSetup();
		oFF.DfModule.stopExt(oFF.OlapApiBaseModule.s_module);
	}
	return oFF.OlapApiBaseModule.s_module;
};
oFF.OlapApiBaseModule.prototype.getName = function()
{
	return "ff4205.olap.api.base";
};

oFF.OlapApiBaseModule.getInstance();

return oFF;
} );
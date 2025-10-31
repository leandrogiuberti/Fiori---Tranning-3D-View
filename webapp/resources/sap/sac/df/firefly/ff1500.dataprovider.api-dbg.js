/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff1000.kernel.api"
],
function(oFF)
{
"use strict";

oFF.DataProviderUtil = {

	getDataProvider:function(dataProvider)
	{
			try
		{
			return dataProvider;
		}
		catch (t)
		{
			return null;
		}
	}
};

oFF.DpMulticast = function() {};
oFF.DpMulticast.prototype = new oFF.XObject();
oFF.DpMulticast.prototype._ff_c = "DpMulticast";

oFF.DpMulticast.createMulticast = function(action)
{
	let obj = new oFF.DpMulticast();
	obj.setupMulticast(action);
	return obj;
};
oFF.DpMulticast.prototype.m_action = null;
oFF.DpMulticast.prototype.m_dataProviders = null;
oFF.DpMulticast.prototype.addTarget = function(dataProvider)
{
	this.m_dataProviders.add(dataProvider);
};
oFF.DpMulticast.prototype.process = function()
{
	let promiseList = oFF.XPromiseList.create();
	oFF.XCollectionUtils.forEach(this.m_dataProviders, (dp) => {
		let action = oFF.XClass.createByInstance(this.m_action).newInstance(null);
		action.setParameters(this.m_action.getParameters().createListCopy());
		let promise = dp.getBasicActions().performAction(action);
		promiseList.add(promise);
	});
	return oFF.XPromise.all(promiseList);
};
oFF.DpMulticast.prototype.releaseObject = function()
{
	this.m_action = null;
	this.m_dataProviders = oFF.XCollectionUtils.clearAndReleaseCollection(this.m_dataProviders);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.DpMulticast.prototype.setupMulticast = function(action)
{
	this.m_action = action;
	this.m_dataProviders = oFF.XList.create();
};

oFF.DataProviderFactory = function() {};
oFF.DataProviderFactory.prototype = new oFF.XObject();
oFF.DataProviderFactory.prototype._ff_c = "DataProviderFactory";

oFF.DataProviderFactory.s_instance = null;
oFF.DataProviderFactory.getInstance = function()
{
	if (oFF.isNull(oFF.DataProviderFactory.s_instance))
	{
		oFF.DataProviderFactory.s_instance = new oFF.DataProviderFactory();
	}
	return oFF.DataProviderFactory.s_instance;
};
oFF.DataProviderFactory.prototype.m_factory = null;
oFF.DataProviderFactory.prototype.createDataProviderConfiguration = function(process, dataProviderName)
{
	return this.m_factory.createDataProviderConfiguration(process, dataProviderName);
};
oFF.DataProviderFactory.prototype.createDataProviderFromProcess = function(process, dpName, systemName, fullQualifiedDataSourceName, dpConfig)
{
	if (oFF.isNull(this.m_factory))
	{
		throw oFF.XException.createIllegalStateException("no data provider factory available");
	}
	return this.m_factory.createDataProviderFromProcess(process, dpName, systemName, fullQualifiedDataSourceName, dpConfig);
};
oFF.DataProviderFactory.prototype.createDataProviderWithConfig = function(config)
{
	return this.m_factory.createDataProviderWithConfig(config);
};
oFF.DataProviderFactory.prototype.createDataProviderWithDataSource = function(process, dpName, dataSourceJson)
{
	if (oFF.isNull(this.m_factory))
	{
		throw oFF.XException.createIllegalStateException("no data provider factory available");
	}
	return this.m_factory.createDataProviderWithDataSource(process, dpName, dataSourceJson);
};
oFF.DataProviderFactory.prototype.registerFactory = function(factory)
{
	this.m_factory = factory;
};

oFF.DataProviderEventType = function() {};
oFF.DataProviderEventType.prototype = new oFF.XConstant();
oFF.DataProviderEventType.prototype._ff_c = "DataProviderEventType";

oFF.DataProviderEventType.ACTION_EXECUTION = null;
oFF.DataProviderEventType.ALL = null;
oFF.DataProviderEventType.ERROR = null;
oFF.DataProviderEventType.LIFECYCLE = null;
oFF.DataProviderEventType.PROPERTY_CHANGE = null;
oFF.DataProviderEventType.createEventType = function(name)
{
	let object = new oFF.DataProviderEventType();
	object.setupConstant(name);
	return object;
};
oFF.DataProviderEventType.staticSetupEventType = function()
{
	oFF.DataProviderEventType.ALL = oFF.DataProviderEventType.createEventType("All");
	oFF.DataProviderEventType.ERROR = oFF.DataProviderEventType.createEventType("Error");
	oFF.DataProviderEventType.LIFECYCLE = oFF.DataProviderEventType.createEventType("Lifecycle");
	oFF.DataProviderEventType.PROPERTY_CHANGE = oFF.DataProviderEventType.createEventType("PropertyChange");
	oFF.DataProviderEventType.ACTION_EXECUTION = oFF.DataProviderEventType.createEventType("ActionExecution");
};

oFF.DataProviderLifecycle = function() {};
oFF.DataProviderLifecycle.prototype = new oFF.XConstantWithParent();
oFF.DataProviderLifecycle.prototype._ff_c = "DataProviderLifecycle";

oFF.DataProviderLifecycle.CONNECTED = null;
oFF.DataProviderLifecycle.DISCONNECTED = null;
oFF.DataProviderLifecycle.RELEASED = null;
oFF.DataProviderLifecycle.s_instance = null;
oFF.DataProviderLifecycle.create = function(name, parent)
{
	let obj = new oFF.DataProviderLifecycle();
	obj.setupExt(name, parent);
	oFF.DataProviderLifecycle.s_instance.put(name, obj);
	return obj;
};
oFF.DataProviderLifecycle.staticSetup = function()
{
	oFF.DataProviderLifecycle.s_instance = oFF.XHashMapByString.create();
	oFF.DataProviderLifecycle.CONNECTED = oFF.DataProviderLifecycle.create("Connected", null);
	oFF.DataProviderLifecycle.DISCONNECTED = oFF.DataProviderLifecycle.create("Disconnected", null);
	oFF.DataProviderLifecycle.RELEASED = oFF.DataProviderLifecycle.create("Released", null);
};

oFF.DataProviderActionParameterType = function() {};
oFF.DataProviderActionParameterType.prototype = new oFF.CoDataType();
oFF.DataProviderActionParameterType.prototype._ff_c = "DataProviderActionParameterType";

oFF.DataProviderActionParameterType.AXIS_TYPE = null;
oFF.DataProviderActionParameterType.CHART_ORIENTATION = null;
oFF.DataProviderActionParameterType.CHART_TYPE = null;
oFF.DataProviderActionParameterType.COMPARISON_OPERATOR = null;
oFF.DataProviderActionParameterType.DATA_PROVIDER_PROPERTY = null;
oFF.DataProviderActionParameterType.DIMENSION = null;
oFF.DataProviderActionParameterType.DIMENSION_MEMBER = null;
oFF.DataProviderActionParameterType.FIELD = null;
oFF.DataProviderActionParameterType.FILTER_COMPONENT_TYPE = null;
oFF.DataProviderActionParameterType.MEASURE_MEMBER = null;
oFF.DataProviderActionParameterType.MEMBER_READ_MODE = null;
oFF.DataProviderActionParameterType.PROTOCOL_BINDING_TYPE = null;
oFF.DataProviderActionParameterType.SET_SIGN = null;
oFF.DataProviderActionParameterType.SORT_DIRECTION = null;
oFF.DataProviderActionParameterType.VISUALIZATION_TYPE = null;
oFF.DataProviderActionParameterType.VISUALIZATION_VALUE_TYPE = null;
oFF.DataProviderActionParameterType.ZERO_SUPPRESSION_TYPE = null;
oFF.DataProviderActionParameterType.createConstant = function(name)
{
	let constant = oFF.XConstant.setupName(new oFF.DataProviderActionParameterType(), name);
	constant.setupType(name, oFF.PrElementType.STRING);
	return constant;
};
oFF.DataProviderActionParameterType.staticSetupExt = function()
{
	oFF.DataProviderActionParameterType.DIMENSION = oFF.DataProviderActionParameterType.createConstant("Dimension");
	oFF.DataProviderActionParameterType.DIMENSION_MEMBER = oFF.DataProviderActionParameterType.createConstant("DimensionMember");
	oFF.DataProviderActionParameterType.FIELD = oFF.DataProviderActionParameterType.createConstant("Field");
	oFF.DataProviderActionParameterType.MEASURE_MEMBER = oFF.DataProviderActionParameterType.createConstant("MeasureMember");
	oFF.DataProviderActionParameterType.DATA_PROVIDER_PROPERTY = oFF.DataProviderActionParameterType.createConstant("DataProviderProperty");
	oFF.DataProviderActionParameterType.AXIS_TYPE = oFF.DataProviderActionParameterType.createConstant("AxisType");
	oFF.DataProviderActionParameterType.COMPARISON_OPERATOR = oFF.DataProviderActionParameterType.createConstant("ComparisonOperator");
	oFF.DataProviderActionParameterType.MEMBER_READ_MODE = oFF.DataProviderActionParameterType.createConstant("MemberReadMode");
	oFF.DataProviderActionParameterType.ZERO_SUPPRESSION_TYPE = oFF.DataProviderActionParameterType.createConstant("ZeroSuppressionType");
	oFF.DataProviderActionParameterType.VISUALIZATION_TYPE = oFF.DataProviderActionParameterType.createConstant("VisualizationType");
	oFF.DataProviderActionParameterType.VISUALIZATION_VALUE_TYPE = oFF.DataProviderActionParameterType.createConstant("VisualizationValueType");
	oFF.DataProviderActionParameterType.PROTOCOL_BINDING_TYPE = oFF.DataProviderActionParameterType.createConstant("ProtocolBindingType");
	oFF.DataProviderActionParameterType.CHART_TYPE = oFF.DataProviderActionParameterType.createConstant("ChartType");
	oFF.DataProviderActionParameterType.CHART_ORIENTATION = oFF.DataProviderActionParameterType.createConstant("ChartOrientation");
	oFF.DataProviderActionParameterType.SORT_DIRECTION = oFF.DataProviderActionParameterType.createConstant("SortDirection");
	oFF.DataProviderActionParameterType.FILTER_COMPONENT_TYPE = oFF.DataProviderActionParameterType.createConstant("FilterComponentType");
	oFF.DataProviderActionParameterType.SET_SIGN = oFF.DataProviderActionParameterType.createConstant("SetSign");
};

oFF.DataProviderErrorType = function() {};
oFF.DataProviderErrorType.prototype = new oFF.XErrorType();
oFF.DataProviderErrorType.prototype._ff_c = "DataProviderErrorType";

oFF.DataProviderErrorType.ACTION_MANIFEST_VALIDATION = null;
oFF.DataProviderErrorType.INVALID_MODEL_TYPE = null;
oFF.DataProviderErrorType.createDataProviderError = function(constant, parent, code)
{
	return oFF.XErrorType.createErrorWithCode(new oFF.DataProviderErrorType(), constant, parent, code);
};
oFF.DataProviderErrorType.staticSetupDataProvider = function()
{
	oFF.DataProviderErrorType.ACTION_MANIFEST_VALIDATION = oFF.DataProviderErrorType.createDataProviderError("ActionManifestValidation", null, oFF.ErrorCodes.DATA_PROVIDER_ACTION_MANIFEST_VALIDATION_ERROR);
	oFF.DataProviderErrorType.INVALID_MODEL_TYPE = oFF.DataProviderErrorType.createDataProviderError("InvalidModelType", null, oFF.ErrorCodes.DATA_PROVIDER_INVALID_MODEL_TYPE);
};

oFF.DataProviderApiModule = function() {};
oFF.DataProviderApiModule.prototype = new oFF.DfModule();
oFF.DataProviderApiModule.prototype._ff_c = "DataProviderApiModule";

oFF.DataProviderApiModule.s_module = null;
oFF.DataProviderApiModule.getInstance = function()
{
	if (oFF.isNull(oFF.DataProviderApiModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.KernelApiModule.getInstance());
		oFF.DataProviderApiModule.s_module = oFF.DfModule.startExt(new oFF.DataProviderApiModule());
		oFF.DataProviderLifecycle.staticSetup();
		oFF.DataProviderErrorType.staticSetupDataProvider();
		oFF.DataProviderEventType.staticSetupEventType();
		oFF.DataProviderActionParameterType.staticSetupExt();
		oFF.DfModule.stopExt(oFF.DataProviderApiModule.s_module);
	}
	return oFF.DataProviderApiModule.s_module;
};
oFF.DataProviderApiModule.prototype.getName = function()
{
	return "ff1500.dataprovider.api";
};

oFF.DataProviderApiModule.getInstance();

return oFF;
} );
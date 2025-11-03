/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff2710.export.native","sap/sac/df/firefly/ff4000.protocol.ina","sap/sac/df/firefly/ff4220.olap.catalog.api","sap/sac/df/firefly/ff5410.formula.editor.native","sap/sac/df/firefly/ff8005.olap.ui.api","sap/sac/df/firefly/ff2140.dwc"
],
function(oFF)
{
"use strict";
oFF.FF8010_OLAP_UI_RESOURCES = function() {};
oFF.FF8010_OLAP_UI_RESOURCES.prototype = {};
oFF.FF8010_OLAP_UI_RESOURCES.prototype._ff_c = "FF8010_OLAP_UI_RESOURCES";

oFF.FF8010_OLAP_UI_RESOURCES.PATH_manifests_horizon_plugins_DataSourceListPlugin_json = "manifests/horizon/plugins/DataSourceListPlugin.json";
oFF.FF8010_OLAP_UI_RESOURCES.PATH_manifests_programs_DataProviderActionList_json = "manifests/programs/DataProviderActionList.json";
oFF.FF8010_OLAP_UI_RESOURCES.PATH_manifests_programs_DataProviderLog_json = "manifests/programs/DataProviderLog.json";
oFF.FF8010_OLAP_UI_RESOURCES.manifests_horizon_plugins_DataSourceListPlugin_json = "ewogICAgIk5hbWUiOiAiRGF0YVNvdXJjZUxpc3RQbHVnaW4iLAogICAgIk1vZHVsZXMiOiBbImZmNDMzMC5vbGFwLmNhdGFsb2cuaW1wbCIsImZmNDQwMC5vbGFwLnByb3ZpZGVycyIsImZmNDQxMC5vbGFwLmlwLnByb3ZpZGVycyIsImZmODAxMC5vbGFwLnVpIl0sCiAgICAiRGlzcGxheU5hbWUiOiAiRGF0YSBTb3VyY2UgTGlzdCIsCiAgICAiRGVzY3JpcHRpb24iOiAiTGlzdHMgYWxsIHRoZSBkYXRhIHNvdXJjZXMgZnJvbSBhIHNwZWNpZmllZCBzeXN0ZW0iLAogICAgIkRlcGVuZGVuY2llcyI6IFtdLAogICAgIkF1dGhvciI6ICJNYXJjaW4gUGFza3VkYSIsCiAgICAiQ29uZmlndXJhdGlvbiI6IHsKICAgICAgICAiUHJvcGVydGllcyI6IHsKICAgICAgICAgICJzeXN0ZW1OYW1lIjogewogICAgICAgICAgICAiVHlwZSI6ICJzdHJpbmciLAogICAgICAgICAgICAiRGlzcGxheU5hbWUiOiAiU3lzdGVtIG5hbWUiLAogICAgICAgICAgICAiRGVzY3JpcHRpb24iOiAiVGhlIG5hbWUgb2YgdGhlIHN5c3RlbSB0byB1c2UuIiwKICAgICAgICAgICAgIlBhdHRlcm4iOiAiXlxcUyokIiwKICAgICAgICAgICAgIkhpZGRlbiI6IHRydWUKICAgICAgICAgIH0KICAgICAgICB9CiAgICAgIH0KfQo=";
oFF.FF8010_OLAP_UI_RESOURCES.manifests_programs_DataProviderActionList_json = "ewogICJOYW1lIjogIkRhdGFQcm92aWRlckFjdGlvbkxpc3QiLAogICJEaXNwbGF5TmFtZSI6ICJEYXRhIHByb3ZpZGVyIGFjdGlvbiBsaXN0IiwKICAiRGVzY3JpcHRpb24iOiAiTGlzdHMgYW5kIGV4ZWN1dGVzIGFueSBhY3Rpb25zIG9uIHRoZSBkYXRhIHByb3ZpZGVyIiwKICAiUHJvZmlsZXMiOiBbXSwKICAiQXV0aG9yIjogIkFsZXhhbmRlciBCZXJnIiwKICAiQ2F0ZWdvcnkiOiAiT2xhcCIsCiAgIkNvbnRhaW5lciI6ICJXaW5kb3ciLAogICJDbGFzcyI6ICJjb20uc2FwLmZpcmVmbHkucHJvZ3JhbXMuZGF0YXByb3ZpZGVyLmFjdGlvbnMuT3VEYXRhUHJvdmlkZXJBY3Rpb25MaXN0UHJvZ3JhbSIsCiAgIlN1YlN5c3RlbXMiOiBbCiAgICAiR3VpIgogIF0sCiAgIk1vZHVsZXMiOiBbCiAgICAiZmY4MDEwLm9sYXAudWkiCiAgXQp9Cg==";
oFF.FF8010_OLAP_UI_RESOURCES.manifests_programs_DataProviderLog_json = "ewogICJOYW1lIjogIkRhdGFQcm92aWRlckxvZyIsCiAgIkRpc3BsYXlOYW1lIjogIkRhdGEgcHJvdmlkZXIgbG9nIiwKICAiRGVzY3JpcHRpb24iOiAiUHJpbnRzIHRoZSBsb2dnZWQgc3RhdGVtZW50cyBvZiB0aGUgZGF0YSBwcm92aWRlciIsCiAgIlByb2ZpbGVzIjogW10sCiAgIkF1dGhvciI6ICJBbGV4YW5kZXIgQmVyZyIsCiAgIkNhdGVnb3J5IjogIk9sYXAiLAogICJDb250YWluZXIiOiAiV2luZG93IiwKICAiQ2xhc3MiOiAiY29tLnNhcC5maXJlZmx5LnByb2dyYW1zLmRhdGFwcm92aWRlci5sb2cuT3VEYXRhUHJvdmlkZXJMb2dQcm9ncmFtIiwKICAiU3ViU3lzdGVtcyI6IFsKICAgICJHdWkiCiAgXSwKICAiTW9kdWxlcyI6IFsKICAgICJmZjgwMTAub2xhcC51aSIKICBdCn0K";

oFF.XResources.registerResourceClass("ff8010.olap.ui", oFF.FF8010_OLAP_UI_RESOURCES);

oFF.OuCalcActivityTrackingState = function() {};
oFF.OuCalcActivityTrackingState.prototype = new oFF.XObject();
oFF.OuCalcActivityTrackingState.prototype._ff_c = "OuCalcActivityTrackingState";

oFF.OuCalcActivityTrackingState.create = function()
{
	return new oFF.OuCalcActivityTrackingState();
};
oFF.OuCalcActivityTrackingState.prototype.m_lastFormulaAddedToEditor = null;
oFF.OuCalcActivityTrackingState.prototype.m_originalFormulaItems = null;
oFF.OuCalcActivityTrackingState.prototype.cloneExt = function(flags)
{
	let clone = new oFF.OuCalcActivityTrackingState();
	clone.m_lastFormulaAddedToEditor = this.m_lastFormulaAddedToEditor;
	clone.m_originalFormulaItems = this.m_originalFormulaItems.getValuesAsReadOnlyList();
	return clone;
};
oFF.OuCalcActivityTrackingState.prototype.getLastFormulaAddedToEditor = function()
{
	return this.m_lastFormulaAddedToEditor;
};
oFF.OuCalcActivityTrackingState.prototype.getOriginalFunctionsUsedInFormula = function()
{
	return this.m_originalFormulaItems;
};
oFF.OuCalcActivityTrackingState.prototype.setLastFormulaAddedToEditor = function(lastFormulaAddedToEditor)
{
	this.m_lastFormulaAddedToEditor = lastFormulaAddedToEditor;
};
oFF.OuCalcActivityTrackingState.prototype.setOriginalFunctionsUsedInFormula = function(originalFormulaItems)
{
	this.m_originalFormulaItems = originalFormulaItems;
};

oFF.OuCalcCalculationsValidator = function() {};
oFF.OuCalcCalculationsValidator.prototype = new oFF.XObject();
oFF.OuCalcCalculationsValidator.prototype._ff_c = "OuCalcCalculationsValidator";

oFF.OuCalcCalculationsValidator.create = function(datasource, supportedFunctions, supportedOperators, preferences)
{
	oFF.XObjectExt.assertNotNull(datasource);
	let instance = new oFF.OuCalcCalculationsValidator();
	instance.m_parser = oFF.FeParserInternal.create(oFF.FeDatasourceMetadataProviderInternalImpl.create(datasource), supportedFunctions, supportedOperators, oFF.FeConfigurationFactory.create(datasource), preferences, null);
	return instance;
};
oFF.OuCalcCalculationsValidator.prototype.m_parser = null;
oFF.OuCalcCalculationsValidator.prototype.validate = function(text)
{
	return oFF.FeValidationMessageManager.createWithMessageCollection(this.m_parser.validate(oFF.FeFormula.create(text, oFF.FeFormulaPresentation.create(false))));
};

oFF.OuCalcInitialData = function() {};
oFF.OuCalcInitialData.prototype = new oFF.XObject();
oFF.OuCalcInitialData.prototype._ff_c = "OuCalcInitialData";

oFF.OuCalcInitialData.create = function(id, description, formula)
{
	let initData = new oFF.OuCalcInitialData();
	initData.m_name = oFF.XStringUtils.assertNotNullOrEmpty(id);
	initData.m_desc = description;
	initData.m_formula = formula;
	return initData;
};
oFF.OuCalcInitialData.createEdit = function(id, description, formula)
{
	let initData = oFF.OuCalcInitialData.create(id, description, formula);
	initData.m_isEdit = true;
	return initData;
};
oFF.OuCalcInitialData.prototype.m_desc = null;
oFF.OuCalcInitialData.prototype.m_formula = null;
oFF.OuCalcInitialData.prototype.m_isEdit = false;
oFF.OuCalcInitialData.prototype.m_name = null;
oFF.OuCalcInitialData.prototype.getDescription = function()
{
	return this.m_desc;
};
oFF.OuCalcInitialData.prototype.getFormula = function()
{
	return this.m_formula;
};
oFF.OuCalcInitialData.prototype.getName = function()
{
	return this.m_name;
};
oFF.OuCalcInitialData.prototype.isEdit = function()
{
	return this.m_isEdit;
};

oFF.OuCalcInitialDataBuilder = function() {};
oFF.OuCalcInitialDataBuilder.prototype = new oFF.XObject();
oFF.OuCalcInitialDataBuilder.prototype._ff_c = "OuCalcInitialDataBuilder";

oFF.OuCalcInitialDataBuilder.EMPTY_STRING = "";
oFF.OuCalcInitialDataBuilder.create = function(datasourceProvider, formulaPresentation)
{
	let builder = new oFF.OuCalcInitialDataBuilder();
	builder.m_datasourceProvider = oFF.XObjectExt.assertNotNull(datasourceProvider);
	builder.m_calcName = oFF.OuCalcInitialDataBuilder.EMPTY_STRING;
	builder.m_formulaTextHandler = oFF.FeFormulaTextHandler.create(oFF.FeDatasourceMetadataProviderInternalImpl.create(datasourceProvider).getAllUsableMeasures());
	builder.m_formulaPresentation = oFF.XObjectExt.assertNotNull(formulaPresentation);
	return builder;
};
oFF.OuCalcInitialDataBuilder.getLocalization = function()
{
	return oFF.XLocalizationCenter.getCenter().getLocalizationProviderByName(oFF.OuCalcDetailsAreaViewI18n.PROVIDER_NAME);
};
oFF.OuCalcInitialDataBuilder.prototype.m_calcName = null;
oFF.OuCalcInitialDataBuilder.prototype.m_datasourceProvider = null;
oFF.OuCalcInitialDataBuilder.prototype.m_formulaPresentation = null;
oFF.OuCalcInitialDataBuilder.prototype.m_formulaTextHandler = null;
oFF.OuCalcInitialDataBuilder.prototype.build = function()
{
	let existingCalculation = oFF.XStream.of(this.m_datasourceProvider.getAllEditableCalculations()).find((calc) => {
		return oFF.XString.isEqual(calc.getAlias(), this.m_calcName);
	});
	oFF.XObjectExt.assertTrue(!existingCalculation.isPresent() || existingCalculation.get().getFormulaText().isPresent());
	if (existingCalculation.isPresent())
	{
		return this.createInitialDataFromExistingCalculation(existingCalculation);
	}
	return this.createInitialDataForNewCalculation();
};
oFF.OuCalcInitialDataBuilder.prototype.createInitialDataForNewCalculation = function()
{
	let calcCount = 1;
	let measureIds = this.m_datasourceProvider.getAllMemberIds();
	let calcNameI18n = oFF.OuCalcDetailsAreaViewI18n.FE_ID_AREA_INPUT_VALUE;
	let calcDescI18n = oFF.OuCalcDetailsAreaViewI18n.FE_DESC_AREA_INPUT_VALUE;
	let calcName = oFF.OuCalcInitialDataBuilder.getLocalization().getTextWithPlaceholder(calcNameI18n, oFF.XInteger.convertToString(calcCount));
	while (this.hasExistingMeasureWithName(calcName, measureIds))
	{
		calcName = oFF.OuCalcInitialDataBuilder.getLocalization().getTextWithPlaceholder(calcNameI18n, oFF.XInteger.convertToString(++calcCount));
	}
	return oFF.OuCalcInitialData.create(calcName, oFF.OuCalcInitialDataBuilder.getLocalization().getTextWithPlaceholder(calcDescI18n, oFF.XInteger.convertToString(calcCount)), oFF.FeFormula.create(oFF.OuCalcInitialDataBuilder.EMPTY_STRING, this.m_formulaPresentation));
};
oFF.OuCalcInitialDataBuilder.prototype.createInitialDataFromExistingCalculation = function(calculation)
{
	let internalFormulaText = calculation.get().getFormulaText().get();
	let formulaText = this.m_formulaTextHandler.generateFormulaText(internalFormulaText);
	let formula = oFF.FeFormula.create(formulaText, this.m_formulaPresentation);
	return oFF.OuCalcInitialData.createEdit(calculation.get().getAlias(), calculation.get().getDescription(), formula);
};
oFF.OuCalcInitialDataBuilder.prototype.hasExistingMeasureWithName = function(calcName, measuresIds)
{
	for (let i = 0; i < measuresIds.size(); i++)
	{
		if (oFF.XString.isEqual(measuresIds.get(i), calcName))
		{
			return true;
		}
	}
	return false;
};
oFF.OuCalcInitialDataBuilder.prototype.setCalculationName = function(calculationName)
{
	this.m_calcName = calculationName;
	return this;
};

oFF.OuCalcPanelConfigBuilder = function() {};
oFF.OuCalcPanelConfigBuilder.prototype = new oFF.XObject();
oFF.OuCalcPanelConfigBuilder.prototype._ff_c = "OuCalcPanelConfigBuilder";

oFF.OuCalcPanelConfigBuilder.prototype.m_anchorTag = null;
oFF.OuCalcPanelConfigBuilder.prototype.m_domId = null;
oFF.OuCalcPanelConfigBuilder.prototype.m_width = null;
oFF.OuCalcPanelConfigBuilder.prototype.setAnchorTag = function(anchorTag)
{
	this.m_anchorTag = anchorTag;
	return this;
};
oFF.OuCalcPanelConfigBuilder.prototype.setDomId = function(domId)
{
	this.m_domId = domId;
	return this;
};
oFF.OuCalcPanelConfigBuilder.prototype.setWidth = function(width)
{
	this.m_width = width;
	return this;
};

oFF.OuCalcUIConfigurationBuilder = function() {};
oFF.OuCalcUIConfigurationBuilder.prototype = new oFF.XObject();
oFF.OuCalcUIConfigurationBuilder.prototype._ff_c = "OuCalcUIConfigurationBuilder";

oFF.OuCalcUIConfigurationBuilder.create = function()
{
	return new oFF.OuCalcUIConfigurationBuilder();
};
oFF.OuCalcUIConfigurationBuilder.prototype.m_assistancePanelConfig = null;
oFF.OuCalcUIConfigurationBuilder.prototype.m_codeEditorConfig = null;
oFF.OuCalcUIConfigurationBuilder.prototype.m_detailsPanelConfig = null;
oFF.OuCalcUIConfigurationBuilder.prototype.m_formulaElementsPanelConfig = null;
oFF.OuCalcUIConfigurationBuilder.prototype.m_singlePluginConfig = null;
oFF.OuCalcUIConfigurationBuilder.prototype.addAssistancePanelConfig = function(config)
{
	this.m_assistancePanelConfig = config;
	return this;
};
oFF.OuCalcUIConfigurationBuilder.prototype.addCodeEditorPanelConfig = function(config)
{
	this.m_codeEditorConfig = config;
	return this;
};
oFF.OuCalcUIConfigurationBuilder.prototype.addDetailsPanelConfig = function(config)
{
	this.m_detailsPanelConfig = config;
	return this;
};
oFF.OuCalcUIConfigurationBuilder.prototype.addFormulaElementListPanelConfig = function(config)
{
	this.m_formulaElementsPanelConfig = config;
	return this;
};
oFF.OuCalcUIConfigurationBuilder.prototype.addSinglePanelConfig = function(config)
{
	this.m_singlePluginConfig = config;
	return this;
};
oFF.OuCalcUIConfigurationBuilder.prototype.build = function()
{
	if (oFF.notNull(this.m_singlePluginConfig))
	{
		return oFF.OuCalcUiConfiguration.createSinglePluginConfig(this.m_singlePluginConfig);
	}
	return oFF.OuCalcUiConfiguration.create(oFF.notNull(this.m_codeEditorConfig) ? this.m_codeEditorConfig.getRenderConfig() : null, oFF.notNull(this.m_detailsPanelConfig) ? this.m_detailsPanelConfig.getRenderConfig() : null, oFF.notNull(this.m_assistancePanelConfig) ? this.m_assistancePanelConfig.getRenderConfig() : null, oFF.notNull(this.m_formulaElementsPanelConfig) ? this.m_formulaElementsPanelConfig.getRenderConfig() : null);
};

oFF.OuAbstractCalcEventManager = function() {};
oFF.OuAbstractCalcEventManager.prototype = new oFF.XObject();
oFF.OuAbstractCalcEventManager.prototype._ff_c = "OuAbstractCalcEventManager";

oFF.OuAbstractCalcEventManager.prototype.m_notificationCenter = null;
oFF.OuAbstractCalcEventManager.prototype.releaseObject = function()
{
	this.m_notificationCenter = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OuAbstractCalcEventManager.prototype.setupInternal = function(sharedNotificationCenter)
{
	this.m_notificationCenter = sharedNotificationCenter;
};

oFF.OuCalcFormulaFormatter = function() {};
oFF.OuCalcFormulaFormatter.prototype = new oFF.XObject();
oFF.OuCalcFormulaFormatter.prototype._ff_c = "OuCalcFormulaFormatter";

oFF.OuCalcFormulaFormatter.create = function()
{
	let feFormulaFormatter = new oFF.OuCalcFormulaFormatter();
	feFormulaFormatter.m_formulaPreProcessors = oFF.XHashMapByString.create();
	feFormulaFormatter.m_formulaPreProcessors.put(oFF.OuCalcFormulaFormatterConstants.REMOVE_CONTROL_CHARACTERS_PREPROCESSOR, oFF.OuCalcRemoveExistingControlCharactersPreProcessor.create());
	feFormulaFormatter.m_formulaPreProcessors.put(oFF.OuCalcFormulaFormatterConstants.SYMBOLIC_FIELDS_PREPROCESSOR, oFF.OuCalcSymbolicFieldsFormulaPreProcessor.create());
	feFormulaFormatter.m_formulaPreProcessors.put(oFF.OuCalcFormulaFormatterConstants.REMOVE_BLANKS_PREPROCESSOR, oFF.OuCalcRemoveBlanksFormulaPreProcessor.create());
	feFormulaFormatter.m_formulaTokenProcessors = oFF.XHashMapByString.create();
	feFormulaFormatter.m_formulaTokenProcessors.put(oFF.OuCalcFormulaFormatterConstants.SINGLE_WHITE_SPACE, oFF.OuCalcWhiteSpaceTokenProcessor.create());
	feFormulaFormatter.m_formulaTokenProcessors.put(oFF.OuCalcFormulaFormatterConstants.DOUBLE_QUOTE, oFF.OuCalcDoubleQuoteTokenProcessor.create());
	feFormulaFormatter.m_formulaTokenProcessors.put(oFF.OuCalcFormulaFormatterConstants.OPEN_SQAURE_BRACKETS, oFF.OuCalcOpenSquareBracketTokenProcessor.create());
	feFormulaFormatter.m_formulaTokenProcessors.put(oFF.OuCalcFormulaFormatterConstants.CLOSE_SQAURE_BRACKETS, oFF.OuCalcCloseSquareBracketTokenProcessor.create());
	feFormulaFormatter.m_formulaTokenProcessors.put(oFF.OuCalcFormulaFormatterConstants.SPECIAL_CHARACTER, oFF.OuCalcSpecialCharactersTokenProcessor.create());
	feFormulaFormatter.m_formulaTokenProcessors.put(oFF.OuCalcFormulaFormatterConstants.OPEN_PARENTHESIS, oFF.OuCalcOpenParenthesisTokenProcessor.create());
	feFormulaFormatter.m_formulaTokenProcessors.put(oFF.OuCalcFormulaFormatterConstants.CLOSE_PARENTHESIS, oFF.OuCalcCloseParenthesisTokenProcessor.create());
	feFormulaFormatter.m_formulaTokenProcessors.put(oFF.OuCalcFormulaFormatterConstants.COMMA, oFF.OuCalcCommaTokenProcessor.create());
	feFormulaFormatter.m_formulaPostProcessors = oFF.XHashMapByString.create();
	feFormulaFormatter.m_formulaPostProcessors.put(oFF.OuCalcFormulaFormatterConstants.RESET_TEMP_FORMATTING_STATE_POSTPROCESSOR, oFF.OuCalcResetTempFormattingStatePostProcessor.create());
	feFormulaFormatter.m_formulaPostProcessors.put(oFF.OuCalcFormulaFormatterConstants.RESTORE_SYMBOLIC_FIELDS_POSTPROCESSOR, oFF.OuCalcRestoreSymbolicFieldsFormulaPostProcessor.create());
	return feFormulaFormatter;
};
oFF.OuCalcFormulaFormatter.prototype.m_formulaPostProcessors = null;
oFF.OuCalcFormulaFormatter.prototype.m_formulaPreProcessors = null;
oFF.OuCalcFormulaFormatter.prototype.m_formulaTokenProcessors = null;
oFF.OuCalcFormulaFormatter.prototype.closeSquareBracketsDoesNotExists = function(temp)
{
	return oFF.XString.indexOf(temp, oFF.OuCalcFormulaFormatterConstants.CLOSE_SQAURE_BRACKETS) === -1;
};
oFF.OuCalcFormulaFormatter.prototype.formatFormula = function(formula)
{
	let formattedFormulaToReturn = formula;
	if (oFF.notNull(formula) && oFF.XString.size(formula) > 0)
	{
		let formattedFormula = oFF.OuCalcFormulaFormattingState.create();
		formattedFormula.setFormulaCopy(formula);
		this.preProcessFormula(formattedFormula);
		formattedFormula = this.processFormulaTokens(formattedFormula);
		this.postProcessFormula(formattedFormula);
		formattedFormula.setCountIf(0);
		formattedFormulaToReturn = formattedFormula.getFormattedString();
	}
	return formattedFormulaToReturn;
};
oFF.OuCalcFormulaFormatter.prototype.membersWithSpecialCharacters = function(temp)
{
	return oFF.XString.size(temp) !== 0 && this.openSquareBracketsExists(temp) && this.closeSquareBracketsDoesNotExists(temp);
};
oFF.OuCalcFormulaFormatter.prototype.openSquareBracketsExists = function(temp)
{
	return oFF.XString.indexOf(temp, oFF.OuCalcFormulaFormatterConstants.OPEN_SQAURE_BRACKETS) !== -1;
};
oFF.OuCalcFormulaFormatter.prototype.postProcessFormula = function(formattedFormula)
{
	this.m_formulaPostProcessors.getByKey(oFF.OuCalcFormulaFormatterConstants.RESET_TEMP_FORMATTING_STATE_POSTPROCESSOR).postProcess(formattedFormula);
	this.m_formulaPostProcessors.getByKey(oFF.OuCalcFormulaFormatterConstants.RESTORE_SYMBOLIC_FIELDS_POSTPROCESSOR).postProcess(formattedFormula);
};
oFF.OuCalcFormulaFormatter.prototype.preProcessFormula = function(formattedFormula)
{
	this.m_formulaPreProcessors.getByKey(oFF.OuCalcFormulaFormatterConstants.REMOVE_CONTROL_CHARACTERS_PREPROCESSOR).preProcess(formattedFormula);
	this.m_formulaPreProcessors.getByKey(oFF.OuCalcFormulaFormatterConstants.SYMBOLIC_FIELDS_PREPROCESSOR).preProcess(formattedFormula);
	this.m_formulaPreProcessors.getByKey(oFF.OuCalcFormulaFormatterConstants.REMOVE_BLANKS_PREPROCESSOR).preProcess(formattedFormula);
};
oFF.OuCalcFormulaFormatter.prototype.processFormulaTokens = function(formula)
{
	let formattedFormula = formula;
	for (let i = 0; i < oFF.XString.size(formattedFormula.getFormulaCopy()); i++)
	{
		let str = oFF.XStringBuffer.create();
		let formulaToken = str.appendChar(oFF.XString.getCharAt(formattedFormula.getFormulaCopy(), i)).toString();
		formattedFormula.setCurrentFormulaToken(formulaToken);
		formattedFormula.setCurrentCount(i);
		let tokenHandler = this.m_formulaTokenProcessors.getByKey(formulaToken);
		if (oFF.isNull(tokenHandler))
		{
			if (this.membersWithSpecialCharacters(formattedFormula.getTempFormattingState()))
			{
				tokenHandler = this.m_formulaTokenProcessors.getByKey(oFF.OuCalcFormulaFormatterConstants.SPECIAL_CHARACTER);
			}
		}
		if (oFF.notNull(tokenHandler))
		{
			formattedFormula = tokenHandler.handleToken(formattedFormula);
			if (formattedFormula.isM_exitCurrentIteration())
			{
				formattedFormula.setExitCurrentIteration(false);
				continue;
			}
			if (formattedFormula.getCurrentCount() > i)
			{
				i = formattedFormula.getCurrentCount();
			}
		}
		else
		{
			let formattedString = oFF.XStringUtils.concatenate2(formattedFormula.getFormattedString(), formulaToken);
			formattedFormula.setFormattedString(formattedString);
		}
	}
	return formattedFormula;
};

oFF.OuCalcFormulaFormatterConstants = {

	CLOSE_PARENTHESIS:")",
	CLOSE_SQAURE_BRACKETS:"]",
	COLON:":",
	COMMA:",",
	DETAILS:"Details",
	DOUBLE_QUOTE:"\"",
	ENTER:"\n",
	EQUAL:"=",
	FUNCTION_ARG_PATTERN_NAME:"functionArg",
	NEWLINE_OR_TAB_REGEX:"[\r\n\t]",
	OPEN_PARENTHESIS:"(",
	OPEN_SQAURE_BRACKETS:"[",
	REGEX_AND_OR_OR:"\\b(and|or)\\b",
	REGEX_BLANK_SPACE:"\\s+",
	REGEX_END_WITH_IF:".*if$",
	REGEX_FORMULA_VALIDATION_DETAILS_FORMULA:"^(Details\\s*\\(([\\s\\S]*)\\))$",
	REGEX_PROCEEDING_MEMBER_AND_PROPERTY:"\\[(?:[^,;'=\\[\\]]+)\\](\\.\\[(?:[^,;'=\\[\\]]+)\\])?",
	REGEX_QUOTED_WORDS:"('(\\'|[^'])*')|(\"(\\\"|[^\\\"])*\")",
	REGEX_SPLIT_COMMA_WITH_SPACE:"\\s*,\\s*",
	REGEX_SPLIT_EQUAL_WITH_SPACE:"\\s*=\\s*",
	REGEX_WHITE_SPACE:"^\\s$",
	REMOVE_BLANKS_PREPROCESSOR:"RemoveBlanksPreProcessor",
	REMOVE_CONTROL_CHARACTERS_PREPROCESSOR:"RemoveControlCharactersPreProcessor",
	RESET_TEMP_FORMATTING_STATE_POSTPROCESSOR:"ResetTempFormattingState",
	RESTORE_SYMBOLIC_FIELDS_POSTPROCESSOR:"RestoreSymbolicFieldsFormulaPostProcessor",
	SINGLE_WHITE_SPACE:" ",
	SPACE:"",
	SPECIAL_CHARACTER:"SpecialCharacter",
	SYMBOLIC_FIELDS_PREPROCESSOR:"SymbolicFieldsPreProcessor",
	TAB:"\t",
	UNDERSCORE:"_"
};

oFF.OuCalcResetTempFormattingStatePostProcessor = function() {};
oFF.OuCalcResetTempFormattingStatePostProcessor.prototype = new oFF.XObject();
oFF.OuCalcResetTempFormattingStatePostProcessor.prototype._ff_c = "OuCalcResetTempFormattingStatePostProcessor";

oFF.OuCalcResetTempFormattingStatePostProcessor.create = function()
{
	return new oFF.OuCalcResetTempFormattingStatePostProcessor();
};
oFF.OuCalcResetTempFormattingStatePostProcessor.prototype.addSpace = function(temp)
{
	let processedString;
	processedString = oFF.XStringUtils.concatenate2(temp, oFF.OuCalcFormulaFormatterConstants.SPACE);
	return processedString;
};
oFF.OuCalcResetTempFormattingStatePostProcessor.prototype.postProcess = function(formula)
{
	if (oFF.XString.size(formula.getTempFormattingState()) > 0)
	{
		formula.setFormattedString(this.addSpace(formula.getTempFormattingState()));
		formula.setTempFormattingState(oFF.OuCalcFormulaFormatterConstants.SPACE);
	}
	return formula;
};

oFF.OuCalcRestoreSymbolicFieldsFormulaPostProcessor = function() {};
oFF.OuCalcRestoreSymbolicFieldsFormulaPostProcessor.prototype = new oFF.XObject();
oFF.OuCalcRestoreSymbolicFieldsFormulaPostProcessor.prototype._ff_c = "OuCalcRestoreSymbolicFieldsFormulaPostProcessor";

oFF.OuCalcRestoreSymbolicFieldsFormulaPostProcessor.create = function()
{
	return new oFF.OuCalcRestoreSymbolicFieldsFormulaPostProcessor();
};
oFF.OuCalcRestoreSymbolicFieldsFormulaPostProcessor.prototype.postProcess = function(formula)
{
	let formattedFormula = this.restoreSymbolicFields(formula.getSymbolicFields(), formula.getFormattedString());
	formula.setFormattedString(formattedFormula);
	return formula;
};
oFF.OuCalcRestoreSymbolicFieldsFormulaPostProcessor.prototype.restoreSymbolicFields = function(symbolicFields, processedString)
{
	let result = processedString;
	let symbolicFieldsIterator = symbolicFields.getIterator();
	while (symbolicFieldsIterator.hasNext())
	{
		let symbolicField = symbolicFieldsIterator.next();
		let underscoreCount = oFF.XMath.max(0, oFF.XString.size(symbolicField) - 2);
		let underscoreString = oFF.XStringBuffer.create();
		for (let i = 0; i < underscoreCount; i++)
		{
			underscoreString.append(oFF.OuCalcFormulaFormatterConstants.UNDERSCORE);
		}
		let target = oFF.XStringUtils.concatenate3(oFF.OuCalcFormulaFormatterConstants.OPEN_SQAURE_BRACKETS, underscoreString.toString(), oFF.OuCalcFormulaFormatterConstants.CLOSE_SQAURE_BRACKETS);
		let index = oFF.XString.indexOf(result, target);
		if (index !== -1)
		{
			let prefix = oFF.XString.substring(result, 0, index);
			let postfix = oFF.XString.substring(result, index + oFF.XString.size(target), -1);
			result = oFF.XStringUtils.concatenate3(prefix, symbolicField, postfix);
		}
	}
	return result;
};

oFF.OuCalcRemoveBlanksFormulaPreProcessor = function() {};
oFF.OuCalcRemoveBlanksFormulaPreProcessor.prototype = new oFF.XObject();
oFF.OuCalcRemoveBlanksFormulaPreProcessor.prototype._ff_c = "OuCalcRemoveBlanksFormulaPreProcessor";

oFF.OuCalcRemoveBlanksFormulaPreProcessor.create = function()
{
	return new oFF.OuCalcRemoveBlanksFormulaPreProcessor();
};
oFF.OuCalcRemoveBlanksFormulaPreProcessor.prototype.findSquareBrackets = function(formula)
{
	let result = oFF.XList.create();
	let bracketStack = oFF.XList.create();
	for (let i = 0; i < oFF.XString.size(formula); i++)
	{
		let str3 = oFF.XStringBuffer.create();
		let formPart = str3.appendChar(oFF.XString.getCharAt(formula, i)).toString();
		if (this.isOpenSquareBracket(formPart))
		{
			bracketStack.add(oFF.OuCalcSquareBracketStackItem.create(i));
		}
		else if (this.isCloseSquareBracket(formPart) && !bracketStack.isEmpty())
		{
			let stackTop = bracketStack.removeAt(bracketStack.size() - 1);
			let povSubstring = oFF.XString.substring(formula, stackTop.getPos(), i + 1);
			let isPov = oFF.XString.containsString(povSubstring, oFF.OuCalcFormulaFormatterConstants.COLON);
			let bracketItem = oFF.OuCalcSquareBracket.create(stackTop.getPos(), i + 1, oFF.XString.substring(formula, stackTop.getPos(), i + 1), isPov);
			result.add(bracketItem);
		}
	}
	return result;
};
oFF.OuCalcRemoveBlanksFormulaPreProcessor.prototype.formatContent = function(content)
{
	let contentCopy = content;
	if (oFF.XString.containsString(contentCopy, oFF.OuCalcFormulaFormatterConstants.EQUAL))
	{
		contentCopy = this.removeMemberBrackets(contentCopy);
		let tmp = oFF.XStringTokenizer.splitString(contentCopy, oFF.OuCalcFormulaFormatterConstants.REGEX_SPLIT_EQUAL_WITH_SPACE);
		let dimension = oFF.XString.trim(tmp.get(0));
		dimension = oFF.XRegex.getInstance().replaceAll(dimension, oFF.OuCalcFormulaFormatterConstants.REGEX_BLANK_SPACE, oFF.OuCalcFormulaFormatterConstants.SPACE, false, false);
		let members = oFF.XString.trim(tmp.get(1));
		let splittedMembers = oFF.XStringTokenizer.splitString(members, oFF.OuCalcFormulaFormatterConstants.REGEX_SPLIT_COMMA_WITH_SPACE);
		let joinedMembers = this.join(",", splittedMembers);
		return oFF.XStringUtils.concatenate5(oFF.OuCalcFormulaFormatterConstants.OPEN_SQAURE_BRACKETS, dimension, oFF.OuCalcFormulaFormatterConstants.EQUAL, joinedMembers, oFF.OuCalcFormulaFormatterConstants.CLOSE_SQAURE_BRACKETS);
	}
	else
	{
		return oFF.XRegex.getInstance().replaceAll(contentCopy, oFF.OuCalcFormulaFormatterConstants.REGEX_BLANK_SPACE, "", false, false);
	}
};
oFF.OuCalcRemoveBlanksFormulaPreProcessor.prototype.isCloseSquareBracket = function(formulaPart)
{
	return oFF.XString.isEqual(formulaPart, oFF.OuCalcFormulaFormatterConstants.CLOSE_SQAURE_BRACKETS);
};
oFF.OuCalcRemoveBlanksFormulaPreProcessor.prototype.isOpenSquareBracket = function(formulaPart)
{
	return oFF.XString.isEqual(formulaPart, oFF.OuCalcFormulaFormatterConstants.OPEN_SQAURE_BRACKETS);
};
oFF.OuCalcRemoveBlanksFormulaPreProcessor.prototype.join = function(delimiter, elements)
{
	if (oFF.isNull(elements) || elements.size() === 0)
	{
		return "";
	}
	let result = oFF.XStringBuffer.create();
	result.append(elements.get(0));
	for (let i = 1; i < elements.size(); i++)
	{
		result.append(delimiter).append(elements.get(i));
	}
	return result.toString();
};
oFF.OuCalcRemoveBlanksFormulaPreProcessor.prototype.preProcess = function(formula)
{
	formula.setFormulaCopy(this.removeBlanks(formula.getFormulaCopy()));
	return formula;
};
oFF.OuCalcRemoveBlanksFormulaPreProcessor.prototype.removeBlanks = function(formula)
{
	let blanks = this.findSquareBrackets(formula);
	let result = oFF.XStringBuffer.create();
	let previousBracket;
	let currentBracket;
	if (blanks.size() === 0)
	{
		result.append(this.removeNonQuotedBlank(formula));
	}
	else
	{
		for (let i = 0; i < blanks.size(); i++)
		{
			currentBracket = blanks.get(i);
			if (i === 0)
			{
				result.append(this.removeNonQuotedBlank(oFF.XString.substring(formula, 0, currentBracket.getStart())));
				if (currentBracket.isPOV())
				{
					result.append(this.formatContent(currentBracket.getContent()));
				}
				else
				{
					result.append(currentBracket.getContent());
				}
			}
			else if (i !== blanks.size() - 1)
			{
				previousBracket = blanks.get(i - 1);
				result.append(this.removeNonQuotedBlank(oFF.XString.substring(formula, previousBracket.getEnd(), currentBracket.getStart())));
				if (currentBracket.isPOV())
				{
					result.append(this.formatContent(currentBracket.getContent()));
				}
				else
				{
					result.append(currentBracket.getContent());
				}
			}
			else
			{
				previousBracket = blanks.get(i - 1);
				result.append(this.removeNonQuotedBlank(oFF.XString.substring(formula, previousBracket.getEnd(), currentBracket.getStart())));
				if (currentBracket.isPOV())
				{
					result.append(this.formatContent(currentBracket.getContent()));
				}
				else
				{
					result.append(currentBracket.getContent());
				}
				result.append(this.removeNonQuotedBlank(oFF.XString.substring(formula, currentBracket.getEnd(), oFF.XString.size(formula))));
			}
		}
	}
	if (blanks.size() === 1)
	{
		result.append(this.removeNonQuotedBlank(oFF.XString.substring(formula, blanks.get(0).getEnd(), oFF.XString.size(formula))));
	}
	return result.toString();
};
oFF.OuCalcRemoveBlanksFormulaPreProcessor.prototype.removeBlanksExKeywords = function(content)
{
	let parts = oFF.XStringTokenizer.splitString(content, oFF.OuCalcFormulaFormatterConstants.REGEX_BLANK_SPACE);
	let contentWithoutBlanks = oFF.XStringBuffer.create();
	for (let i = 0; i < parts.size(); i++)
	{
		let current = parts.get(i);
		current = oFF.XRegex.getInstance().replaceAll(current, oFF.OuCalcFormulaFormatterConstants.REGEX_AND_OR_OR, null, true, true);
		contentWithoutBlanks.append(current);
		if (i < parts.size() - 1)
		{
			contentWithoutBlanks.append(" ");
		}
	}
	return contentWithoutBlanks.toString();
};
oFF.OuCalcRemoveBlanksFormulaPreProcessor.prototype.removeMemberBrackets = function(text)
{
	let textCopy = text;
	if (oFF.XString.containsString(textCopy, oFF.OuCalcFormulaFormatterConstants.OPEN_SQAURE_BRACKETS) && oFF.XString.containsString(textCopy, oFF.OuCalcFormulaFormatterConstants.CLOSE_SQAURE_BRACKETS))
	{
		textCopy = oFF.XString.trim(textCopy);
		if (oFF.XString.startsWith(textCopy, oFF.OuCalcFormulaFormatterConstants.OPEN_SQAURE_BRACKETS))
		{
			textCopy = oFF.XString.substring(textCopy, 1, -1);
		}
		if (oFF.XString.endsWith(textCopy, oFF.OuCalcFormulaFormatterConstants.CLOSE_SQAURE_BRACKETS))
		{
			textCopy = oFF.XString.substring(textCopy, 0, oFF.XString.size(textCopy) - 1);
		}
	}
	return textCopy;
};
oFF.OuCalcRemoveBlanksFormulaPreProcessor.prototype.removeNonQuotedBlank = function(formulaSubString)
{
	let formulaSubStringCopy = formulaSubString;
	let quotedWords = oFF.XRegex.getInstance().getAllGroupsOfMatch(formulaSubStringCopy, oFF.OuCalcFormulaFormatterConstants.REGEX_QUOTED_WORDS, true);
	if (oFF.notNull(quotedWords) && quotedWords.size() > 0)
	{
		let iterator = quotedWords.getIterator();
		while (iterator.hasNext())
		{
			let quotedWord = iterator.next();
			let underscoreReplacement = this.repeat(oFF.OuCalcFormulaFormatterConstants.UNDERSCORE, oFF.XString.size(quotedWord));
			formulaSubStringCopy = oFF.XString.replace(formulaSubStringCopy, quotedWord, underscoreReplacement);
			formulaSubStringCopy = this.removeBlanksExKeywords(formulaSubStringCopy);
		}
		let iterator2 = quotedWords.getIterator();
		while (iterator2.hasNext())
		{
			let quotedWord2 = iterator2.next();
			let matchingUnderscore = this.repeat(oFF.OuCalcFormulaFormatterConstants.UNDERSCORE, oFF.XString.size(quotedWord2));
			formulaSubStringCopy = oFF.XString.replace(formulaSubStringCopy, matchingUnderscore, quotedWord2);
		}
		return formulaSubString;
	}
	else
	{
		return this.removeBlanksExKeywords(formulaSubStringCopy);
	}
};
oFF.OuCalcRemoveBlanksFormulaPreProcessor.prototype.repeat = function(target, count)
{
	let repeatedString = oFF.XStringBuffer.create();
	for (let i = 0; i < count; i++)
	{
		repeatedString.append(target);
	}
	return repeatedString.toString();
};

oFF.OuCalcRemoveExistingControlCharactersPreProcessor = function() {};
oFF.OuCalcRemoveExistingControlCharactersPreProcessor.prototype = new oFF.XObject();
oFF.OuCalcRemoveExistingControlCharactersPreProcessor.prototype._ff_c = "OuCalcRemoveExistingControlCharactersPreProcessor";

oFF.OuCalcRemoveExistingControlCharactersPreProcessor.create = function()
{
	return new oFF.OuCalcRemoveExistingControlCharactersPreProcessor();
};
oFF.OuCalcRemoveExistingControlCharactersPreProcessor.prototype.preProcess = function(formula)
{
	let formulaCopy = oFF.XRegex.getInstance().replaceAll(formula.getFormulaCopy(), oFF.OuCalcFormulaFormatterConstants.NEWLINE_OR_TAB_REGEX, oFF.OuCalcFormulaFormatterConstants.SPACE, false, false);
	formula.setFormulaCopy(formulaCopy);
	return formula;
};

oFF.OuCalcSymbolicFieldsFormulaPreProcessor = function() {};
oFF.OuCalcSymbolicFieldsFormulaPreProcessor.prototype = new oFF.XObject();
oFF.OuCalcSymbolicFieldsFormulaPreProcessor.prototype._ff_c = "OuCalcSymbolicFieldsFormulaPreProcessor";

oFF.OuCalcSymbolicFieldsFormulaPreProcessor.create = function()
{
	return new oFF.OuCalcSymbolicFieldsFormulaPreProcessor();
};
oFF.OuCalcSymbolicFieldsFormulaPreProcessor.prototype.escapeSymbolicFields = function(formula)
{
	return oFF.XRegex.getInstance().replaceMatches(formula, oFF.OuCalcFormulaFormatterConstants.REGEX_PROCEEDING_MEMBER_AND_PROPERTY, oFF.OuCalcFormulaFormatterConstants.OPEN_SQAURE_BRACKETS, oFF.OuCalcFormulaFormatterConstants.CLOSE_SQAURE_BRACKETS, oFF.OuCalcFormulaFormatterConstants.UNDERSCORE, 2, false);
};
oFF.OuCalcSymbolicFieldsFormulaPreProcessor.prototype.getSymbolicFields = function(formula)
{
	let symbolicFields = oFF.XRegex.getInstance().getAllGroupsOfMatch(formula, oFF.OuCalcFormulaFormatterConstants.REGEX_PROCEEDING_MEMBER_AND_PROPERTY, true);
	return symbolicFields;
};
oFF.OuCalcSymbolicFieldsFormulaPreProcessor.prototype.preProcess = function(formula)
{
	let symbolicFields = this.getSymbolicFields(formula.getFormulaCopy());
	formula.setSymbolicFields(symbolicFields);
	let escapedFormulaString = this.escapeSymbolicFields(formula.getFormulaCopy());
	formula.setFormulaCopy(escapedFormulaString);
	return formula;
};

oFF.OuCalcBaseTokenProcessor = function() {};
oFF.OuCalcBaseTokenProcessor.prototype = new oFF.XObject();
oFF.OuCalcBaseTokenProcessor.prototype._ff_c = "OuCalcBaseTokenProcessor";

oFF.OuCalcBaseTokenProcessor.prototype.isComma = function(formulaToken)
{
	return oFF.XString.isEqual(formulaToken, oFF.OuCalcFormulaFormatterConstants.COMMA);
};
oFF.OuCalcBaseTokenProcessor.prototype.isOpenParenthesis = function(formulaPart)
{
	return oFF.XString.isEqual(formulaPart, oFF.OuCalcFormulaFormatterConstants.OPEN_PARENTHESIS);
};

oFF.OuCalcFormulaFormattingState = function() {};
oFF.OuCalcFormulaFormattingState.prototype = new oFF.XObject();
oFF.OuCalcFormulaFormattingState.prototype._ff_c = "OuCalcFormulaFormattingState";

oFF.OuCalcFormulaFormattingState.create = function()
{
	let formattedFormula = new oFF.OuCalcFormulaFormattingState();
	formattedFormula.setOperators(oFF.XList.create());
	return formattedFormula;
};
oFF.OuCalcFormulaFormattingState.prototype.m_countIf = 0;
oFF.OuCalcFormulaFormattingState.prototype.m_currentCount = 0;
oFF.OuCalcFormulaFormattingState.prototype.m_currentFormulaToken = null;
oFF.OuCalcFormulaFormattingState.prototype.m_exitCurrentIteration = false;
oFF.OuCalcFormulaFormattingState.prototype.m_formattedString = null;
oFF.OuCalcFormulaFormattingState.prototype.m_formulaCopy = null;
oFF.OuCalcFormulaFormattingState.prototype.m_operators = null;
oFF.OuCalcFormulaFormattingState.prototype.m_symbolicFields = null;
oFF.OuCalcFormulaFormattingState.prototype.m_tempFormattingState = "";
oFF.OuCalcFormulaFormattingState.prototype.getCountIf = function()
{
	return this.m_countIf;
};
oFF.OuCalcFormulaFormattingState.prototype.getCurrentCount = function()
{
	return this.m_currentCount;
};
oFF.OuCalcFormulaFormattingState.prototype.getCurrentFormulaToken = function()
{
	return this.m_currentFormulaToken;
};
oFF.OuCalcFormulaFormattingState.prototype.getFormattedString = function()
{
	return this.m_formattedString;
};
oFF.OuCalcFormulaFormattingState.prototype.getFormulaCopy = function()
{
	return this.m_formulaCopy;
};
oFF.OuCalcFormulaFormattingState.prototype.getOperators = function()
{
	return this.m_operators;
};
oFF.OuCalcFormulaFormattingState.prototype.getSymbolicFields = function()
{
	return this.m_symbolicFields;
};
oFF.OuCalcFormulaFormattingState.prototype.getTempFormattingState = function()
{
	return this.m_tempFormattingState;
};
oFF.OuCalcFormulaFormattingState.prototype.isM_exitCurrentIteration = function()
{
	return this.m_exitCurrentIteration;
};
oFF.OuCalcFormulaFormattingState.prototype.setCountIf = function(m_countIf)
{
	this.m_countIf = m_countIf;
};
oFF.OuCalcFormulaFormattingState.prototype.setCurrentCount = function(m_currentCount)
{
	this.m_currentCount = m_currentCount;
};
oFF.OuCalcFormulaFormattingState.prototype.setCurrentFormulaToken = function(m_currentFormulaToken)
{
	this.m_currentFormulaToken = m_currentFormulaToken;
};
oFF.OuCalcFormulaFormattingState.prototype.setExitCurrentIteration = function(m_exitCurrentIteration)
{
	this.m_exitCurrentIteration = m_exitCurrentIteration;
};
oFF.OuCalcFormulaFormattingState.prototype.setFormattedString = function(m_formattedString)
{
	this.m_formattedString = m_formattedString;
};
oFF.OuCalcFormulaFormattingState.prototype.setFormulaCopy = function(m_formulaCopy)
{
	this.m_formulaCopy = m_formulaCopy;
};
oFF.OuCalcFormulaFormattingState.prototype.setOperators = function(m_operators)
{
	this.m_operators = m_operators;
};
oFF.OuCalcFormulaFormattingState.prototype.setSymbolicFields = function(m_symbolicFields)
{
	this.m_symbolicFields = m_symbolicFields;
};
oFF.OuCalcFormulaFormattingState.prototype.setTempFormattingState = function(m_tempFormattingState)
{
	this.m_tempFormattingState = m_tempFormattingState;
};

oFF.OuCalcSquareBracket = function() {};
oFF.OuCalcSquareBracket.prototype = new oFF.XObject();
oFF.OuCalcSquareBracket.prototype._ff_c = "OuCalcSquareBracket";

oFF.OuCalcSquareBracket.create = function(start, end, content, isPOV)
{
	let squareBracket = new oFF.OuCalcSquareBracket();
	squareBracket.m_start = start;
	squareBracket.m_end = end;
	squareBracket.m_content = content;
	squareBracket.m_isPov = isPOV;
	return squareBracket;
};
oFF.OuCalcSquareBracket.prototype.m_content = null;
oFF.OuCalcSquareBracket.prototype.m_end = 0;
oFF.OuCalcSquareBracket.prototype.m_isPov = false;
oFF.OuCalcSquareBracket.prototype.m_start = 0;
oFF.OuCalcSquareBracket.prototype.getContent = function()
{
	return this.m_content;
};
oFF.OuCalcSquareBracket.prototype.getEnd = function()
{
	return this.m_end;
};
oFF.OuCalcSquareBracket.prototype.getStart = function()
{
	return this.m_start;
};
oFF.OuCalcSquareBracket.prototype.isPOV = function()
{
	return this.m_isPov;
};

oFF.OuCalcSquareBracketStackItem = function() {};
oFF.OuCalcSquareBracketStackItem.prototype = new oFF.XObject();
oFF.OuCalcSquareBracketStackItem.prototype._ff_c = "OuCalcSquareBracketStackItem";

oFF.OuCalcSquareBracketStackItem.create = function(pos)
{
	let item = new oFF.OuCalcSquareBracketStackItem();
	item.pos = pos;
	return item;
};
oFF.OuCalcSquareBracketStackItem.prototype.pos = 0;
oFF.OuCalcSquareBracketStackItem.prototype.getPos = function()
{
	return this.pos;
};

oFF.OuCalcCustomModeRulesFactory = function() {};
oFF.OuCalcCustomModeRulesFactory.prototype = new oFF.XObject();
oFF.OuCalcCustomModeRulesFactory.prototype._ff_c = "OuCalcCustomModeRulesFactory";

oFF.OuCalcCustomModeRulesFactory.ROOT_NODE = "start";
oFF.OuCalcCustomModeRulesFactory.create = function(enableModelPrefix)
{
	let instance = new oFF.OuCalcCustomModeRulesFactory();
	instance.m_enableModelPrefix = enableModelPrefix;
	return instance;
};
oFF.OuCalcCustomModeRulesFactory.prototype.m_enableModelPrefix = false;
oFF.OuCalcCustomModeRulesFactory.prototype.buildRules = function(formulaItems, feConfiguration)
{
	let customModeRules = oFF.PrFactory.createStructure();
	let rulesList = customModeRules.putNewList(oFF.OuCalcCustomModeRulesFactory.ROOT_NODE);
	this.createCommonRules(formulaItems, rulesList);
	if (feConfiguration.dimensionsSupported())
	{
		this.createDimensionRules(rulesList);
	}
	return customModeRules;
};
oFF.OuCalcCustomModeRulesFactory.prototype.createCommonRules = function(formulaItems, rulesList)
{
	oFF.OuCalcComparisonConditionHighlightRule.create().build(rulesList, formulaItems);
	oFF.OuCalcFunctionHighlightRule.create().build(rulesList, formulaItems);
	oFF.OuCalcLogicalConditionHighlightRule.create().build(rulesList, formulaItems);
	oFF.OuCalcOperatorHighlightRule.create().build(rulesList, formulaItems);
	oFF.OuCalcCommaHighlightRule.create().build(rulesList);
	oFF.OuCalcMeasureHighlightRule.create(this.m_enableModelPrefix).build(rulesList);
	oFF.OuCalcParenthesisHighlightRule.create().build(rulesList);
	oFF.OuCalcSemicolonHighlightRule.create().build(rulesList);
	oFF.OuCalcStringHighlightRule.create().build(rulesList);
	oFF.OuCalcLiteralHighlightRule.create().build(rulesList);
	oFF.OuCalcPercentageHighlightRule.create().build(rulesList, formulaItems);
	oFF.OuCalcDimensionHighlightRule.create().build(rulesList);
};
oFF.OuCalcCustomModeRulesFactory.prototype.createDimensionRules = function(rulesList)
{
	oFF.OuCalcDimensionHierarchyHighlightRule.create().build(rulesList);
	oFF.OuCalcDimensionPropertyHighlightRule.create().build(rulesList);
};

oFF.OuCalcCommaHighlightRule = function() {};
oFF.OuCalcCommaHighlightRule.prototype = new oFF.XObject();
oFF.OuCalcCommaHighlightRule.prototype._ff_c = "OuCalcCommaHighlightRule";

oFF.OuCalcCommaHighlightRule.FE_COMMA_CSS_NAME = "feComma";
oFF.OuCalcCommaHighlightRule.FE_COMMA_REGEX = ",";
oFF.OuCalcCommaHighlightRule.create = function()
{
	return new oFF.OuCalcCommaHighlightRule();
};
oFF.OuCalcCommaHighlightRule.prototype.build = function(rulesList)
{
	let rule = oFF.PrFactory.createStructure();
	rule.putString(oFF.OuCalcHighlightRulesConstant.TOKEN, oFF.OuCalcCommaHighlightRule.FE_COMMA_CSS_NAME);
	rule.putString(oFF.OuCalcHighlightRulesConstant.REGEX, oFF.OuCalcCommaHighlightRule.FE_COMMA_REGEX);
	rulesList.add(rule);
};

oFF.OuCalcComparisonConditionHighlightRule = function() {};
oFF.OuCalcComparisonConditionHighlightRule.prototype = new oFF.XObject();
oFF.OuCalcComparisonConditionHighlightRule.prototype._ff_c = "OuCalcComparisonConditionHighlightRule";

oFF.OuCalcComparisonConditionHighlightRule.FE_COMPARISON_CSS_NAME = "feComparisonConditions";
oFF.OuCalcComparisonConditionHighlightRule.FE_LOGICAL_CONDITIONS_REGEX = "\\b(?:AND|OR|NOT|XOR)\\b";
oFF.OuCalcComparisonConditionHighlightRule.create = function()
{
	return new oFF.OuCalcComparisonConditionHighlightRule();
};
oFF.OuCalcComparisonConditionHighlightRule.prototype.build = function(rulesList, formulaItems)
{
	let comparisonConditionRegex = "";
	let conditions = formulaItems.getConditions();
	let iterator = conditions.getIterator();
	if (iterator.hasNext())
	{
		while (iterator.hasNext())
		{
			let fi = iterator.next();
			let allGroupsOfMatch = oFF.XRegex.getInstance().getAllGroupsOfMatch(fi.getDisplayName(), oFF.OuCalcComparisonConditionHighlightRule.FE_LOGICAL_CONDITIONS_REGEX, true);
			if (allGroupsOfMatch.isEmpty())
			{
				comparisonConditionRegex = oFF.XStringUtils.concatenate3(comparisonConditionRegex, fi.getDisplayName(), oFF.OuCalcHighlightRulesConstant.REGEX_OR);
			}
		}
		comparisonConditionRegex = oFF.XString.substring(comparisonConditionRegex, 0, oFF.XString.size(comparisonConditionRegex) - 1);
		let rule = oFF.PrFactory.createStructure();
		rule.putString(oFF.OuCalcHighlightRulesConstant.TOKEN, oFF.OuCalcComparisonConditionHighlightRule.FE_COMPARISON_CSS_NAME);
		rule.putString(oFF.OuCalcHighlightRulesConstant.REGEX, comparisonConditionRegex);
		rulesList.add(rule);
	}
};

oFF.OuCalcDimensionHierarchyHighlightRule = function() {};
oFF.OuCalcDimensionHierarchyHighlightRule.prototype = new oFF.XObject();
oFF.OuCalcDimensionHierarchyHighlightRule.prototype._ff_c = "OuCalcDimensionHierarchyHighlightRule";

oFF.OuCalcDimensionHierarchyHighlightRule.FE_DIMENSION_HIERARCHY_CSS_NAME = "feDimensionHierarchy";
oFF.OuCalcDimensionHierarchyHighlightRule.FE_DIMENSION_HIERARCHY_REGEX = "\\[h\\s*\\/\\s*([^\\]]*)\\]";
oFF.OuCalcDimensionHierarchyHighlightRule.create = function()
{
	return new oFF.OuCalcDimensionHierarchyHighlightRule();
};
oFF.OuCalcDimensionHierarchyHighlightRule.prototype.build = function(rulesList)
{
	let rule = oFF.PrFactory.createStructure();
	rule.putString(oFF.OuCalcHighlightRulesConstant.TOKEN, oFF.OuCalcDimensionHierarchyHighlightRule.FE_DIMENSION_HIERARCHY_CSS_NAME);
	rule.putString(oFF.OuCalcHighlightRulesConstant.REGEX, oFF.OuCalcDimensionHierarchyHighlightRule.FE_DIMENSION_HIERARCHY_REGEX);
	rulesList.add(rule);
};

oFF.OuCalcDimensionHighlightRule = function() {};
oFF.OuCalcDimensionHighlightRule.prototype = new oFF.XObject();
oFF.OuCalcDimensionHighlightRule.prototype._ff_c = "OuCalcDimensionHighlightRule";

oFF.OuCalcDimensionHighlightRule.FE_DIMENSION_CSS_NAME = "feDimensions";
oFF.OuCalcDimensionHighlightRule.FE_DIMENSION_REGEX = "\\[d\\/([^\\]]*)\\]";
oFF.OuCalcDimensionHighlightRule.create = function()
{
	return new oFF.OuCalcDimensionHighlightRule();
};
oFF.OuCalcDimensionHighlightRule.prototype.build = function(rulesList)
{
	let rule = oFF.PrFactory.createStructure();
	rule.putString(oFF.OuCalcHighlightRulesConstant.TOKEN, oFF.OuCalcDimensionHighlightRule.FE_DIMENSION_CSS_NAME);
	rule.putString(oFF.OuCalcHighlightRulesConstant.REGEX, oFF.OuCalcDimensionHighlightRule.FE_DIMENSION_REGEX);
	rulesList.add(rule);
};

oFF.OuCalcDimensionPropertyHighlightRule = function() {};
oFF.OuCalcDimensionPropertyHighlightRule.prototype = new oFF.XObject();
oFF.OuCalcDimensionPropertyHighlightRule.prototype._ff_c = "OuCalcDimensionPropertyHighlightRule";

oFF.OuCalcDimensionPropertyHighlightRule.FE_DIMENSION_PROPERTY_CSS_NAME = "feDimensionProperty";
oFF.OuCalcDimensionPropertyHighlightRule.FE_DIMENSION_PROPERTY_REGEX = "\\[p\\s*\\/\\s*([^\\]]*)\\]";
oFF.OuCalcDimensionPropertyHighlightRule.create = function()
{
	return new oFF.OuCalcDimensionPropertyHighlightRule();
};
oFF.OuCalcDimensionPropertyHighlightRule.prototype.build = function(rulesList)
{
	let rule = oFF.PrFactory.createStructure();
	rule.putString(oFF.OuCalcHighlightRulesConstant.TOKEN, oFF.OuCalcDimensionPropertyHighlightRule.FE_DIMENSION_PROPERTY_CSS_NAME);
	rule.putString(oFF.OuCalcHighlightRulesConstant.REGEX, oFF.OuCalcDimensionPropertyHighlightRule.FE_DIMENSION_PROPERTY_REGEX);
	rulesList.add(rule);
};

oFF.OuCalcFunctionHighlightRule = function() {};
oFF.OuCalcFunctionHighlightRule.prototype = new oFF.XObject();
oFF.OuCalcFunctionHighlightRule.prototype._ff_c = "OuCalcFunctionHighlightRule";

oFF.OuCalcFunctionHighlightRule.FE_FUNCTION_CSS_NAME = "feFunctions";
oFF.OuCalcFunctionHighlightRule.create = function()
{
	return new oFF.OuCalcFunctionHighlightRule();
};
oFF.OuCalcFunctionHighlightRule.prototype.build = function(rulesList, formulaItems)
{
	let functionsRegex = "";
	let functions = formulaItems.getFunctions();
	let iterator = functions.getIterator();
	if (iterator.hasNext())
	{
		while (iterator.hasNext())
		{
			let func = iterator.next();
			functionsRegex = oFF.XStringUtils.concatenate3(functionsRegex, func.getDisplayName(), oFF.OuCalcHighlightRulesConstant.REGEX_OR);
		}
		functionsRegex = oFF.XString.substring(functionsRegex, 0, oFF.XString.size(functionsRegex) - 1);
		functionsRegex = oFF.XStringUtils.concatenate3(oFF.OuCalcHighlightRulesConstant.FE_FUNCTION_REGEX_PREFIX, functionsRegex, oFF.OuCalcHighlightRulesConstant.FE_FUNCTION_REGEX_POSTFIX);
		let rule = oFF.PrFactory.createStructure();
		rule.putString(oFF.OuCalcHighlightRulesConstant.TOKEN, oFF.OuCalcFunctionHighlightRule.FE_FUNCTION_CSS_NAME);
		rule.putString(oFF.OuCalcHighlightRulesConstant.REGEX, functionsRegex);
		rule.putBoolean(oFF.OuCalcHighlightRulesConstant.CASE_INSENSITIVE, true);
		rulesList.add(rule);
	}
};

oFF.OuCalcHighlightRulesConstant = {

	CASE_INSENSITIVE:"caseInsensitive",
	CLOSE_SQUARE_BRACKETS:"]",
	ESCAPE_CHAR:"\\",
	FE_FUNCTION_REGEX_POSTFIX:")\\b",
	FE_FUNCTION_REGEX_PREFIX:"\\b(?:",
	HIPEN:"-",
	OPEN_SQUARE_BRACKETS:"[",
	REGEX:"regex",
	REGEX_OR:"|",
	TOKEN:"token"
};

oFF.OuCalcLiteralHighlightRule = function() {};
oFF.OuCalcLiteralHighlightRule.prototype = new oFF.XObject();
oFF.OuCalcLiteralHighlightRule.prototype._ff_c = "OuCalcLiteralHighlightRule";

oFF.OuCalcLiteralHighlightRule.FE_LITERAL_CSS_NAME = "feLiteral";
oFF.OuCalcLiteralHighlightRule.FE_LITERAL_REGEX = "\\b(?:TRUE|FALSE|YES|NO|NULL)\\b";
oFF.OuCalcLiteralHighlightRule.create = function()
{
	return new oFF.OuCalcLiteralHighlightRule();
};
oFF.OuCalcLiteralHighlightRule.prototype.build = function(rulesList)
{
	let rule = oFF.PrFactory.createStructure();
	rule.putString(oFF.OuCalcHighlightRulesConstant.TOKEN, oFF.OuCalcLiteralHighlightRule.FE_LITERAL_CSS_NAME);
	rule.putString(oFF.OuCalcHighlightRulesConstant.REGEX, oFF.OuCalcLiteralHighlightRule.FE_LITERAL_REGEX);
	rule.putBoolean(oFF.OuCalcHighlightRulesConstant.CASE_INSENSITIVE, true);
	rulesList.add(rule);
};

oFF.OuCalcLogicalConditionHighlightRule = function() {};
oFF.OuCalcLogicalConditionHighlightRule.prototype = new oFF.XObject();
oFF.OuCalcLogicalConditionHighlightRule.prototype._ff_c = "OuCalcLogicalConditionHighlightRule";

oFF.OuCalcLogicalConditionHighlightRule.FE_LOGICAL_CONDITIONS_REGEX = "\\b(?:AND|OR|NOT|XOR)\\b";
oFF.OuCalcLogicalConditionHighlightRule.FE_LOGICAL_CONDITION_CSS_NAME = "feLogicalConditions";
oFF.OuCalcLogicalConditionHighlightRule.create = function()
{
	return new oFF.OuCalcLogicalConditionHighlightRule();
};
oFF.OuCalcLogicalConditionHighlightRule.prototype.build = function(rulesList, formulaItems)
{
	let logicalConditionRegex = "";
	let conditions = formulaItems.getConditions();
	let iterator = conditions.getIterator();
	if (iterator.hasNext())
	{
		while (iterator.hasNext())
		{
			let fi = iterator.next();
			let allGroupsOfMatch = oFF.XRegex.getInstance().getAllGroupsOfMatch(fi.getDisplayName(), oFF.OuCalcLogicalConditionHighlightRule.FE_LOGICAL_CONDITIONS_REGEX, true);
			if (allGroupsOfMatch.hasElements())
			{
				logicalConditionRegex = oFF.XStringUtils.concatenate3(logicalConditionRegex, fi.getDisplayName(), oFF.OuCalcHighlightRulesConstant.REGEX_OR);
			}
		}
		logicalConditionRegex = oFF.XString.substring(logicalConditionRegex, 0, oFF.XString.size(logicalConditionRegex) - 1);
		logicalConditionRegex = oFF.XStringUtils.concatenate3(oFF.OuCalcHighlightRulesConstant.FE_FUNCTION_REGEX_PREFIX, logicalConditionRegex, oFF.OuCalcHighlightRulesConstant.FE_FUNCTION_REGEX_POSTFIX);
		let rule = oFF.PrFactory.createStructure();
		rule.putString(oFF.OuCalcHighlightRulesConstant.TOKEN, oFF.OuCalcLogicalConditionHighlightRule.FE_LOGICAL_CONDITION_CSS_NAME);
		rule.putString(oFF.OuCalcHighlightRulesConstant.REGEX, logicalConditionRegex);
		rule.putBoolean(oFF.OuCalcHighlightRulesConstant.CASE_INSENSITIVE, true);
		rulesList.add(rule);
	}
};

oFF.OuCalcMeasureHighlightRule = function() {};
oFF.OuCalcMeasureHighlightRule.prototype = new oFF.XObject();
oFF.OuCalcMeasureHighlightRule.prototype._ff_c = "OuCalcMeasureHighlightRule";

oFF.OuCalcMeasureHighlightRule.FE_MEASURE_CSS_NAME = "feMeasures";
oFF.OuCalcMeasureHighlightRule.FE_MEASURE_REGEX = "\\[(?!d\\/|p\\/|h\\/)[^\\/\\]]*\\]";
oFF.OuCalcMeasureHighlightRule.FE_MEASURE_WITH_DATASOURCE_REGEX = "\\[(?!d\\/|p\\/|h\\/)(\"[^\"]*\":)?[^\\/\\]]*\\]";
oFF.OuCalcMeasureHighlightRule.create = function(enableModelPrefix)
{
	let instance = new oFF.OuCalcMeasureHighlightRule();
	instance.m_enableModelPrefix = enableModelPrefix;
	return instance;
};
oFF.OuCalcMeasureHighlightRule.prototype.m_enableModelPrefix = false;
oFF.OuCalcMeasureHighlightRule.prototype.build = function(rulesList)
{
	let rule = oFF.PrFactory.createStructure();
	rule.putString(oFF.OuCalcHighlightRulesConstant.TOKEN, oFF.OuCalcMeasureHighlightRule.FE_MEASURE_CSS_NAME);
	rule.putString(oFF.OuCalcHighlightRulesConstant.REGEX, this.m_enableModelPrefix ? oFF.OuCalcMeasureHighlightRule.FE_MEASURE_WITH_DATASOURCE_REGEX : oFF.OuCalcMeasureHighlightRule.FE_MEASURE_REGEX);
	rulesList.add(rule);
};

oFF.OuCalcOperatorHighlightRule = function() {};
oFF.OuCalcOperatorHighlightRule.prototype = new oFF.XObject();
oFF.OuCalcOperatorHighlightRule.prototype._ff_c = "OuCalcOperatorHighlightRule";

oFF.OuCalcOperatorHighlightRule.FE_OPERATOR_CSS_NAME = "feOperators";
oFF.OuCalcOperatorHighlightRule.QUANTIFIER = "{1,2}";
oFF.OuCalcOperatorHighlightRule.create = function()
{
	return new oFF.OuCalcOperatorHighlightRule();
};
oFF.OuCalcOperatorHighlightRule.prototype.build = function(rulesList, formulaItems)
{
	let operatorsRegex = "";
	let operators = formulaItems.getOperators();
	let iterator = operators.getIterator();
	if (iterator.hasNext())
	{
		while (iterator.hasNext())
		{
			let op = iterator.next();
			if (op.getCategory().isTypeOf(oFF.FeFormulaItemCategory.MATHEMATICAL))
			{
				if (oFF.XString.isEqual(op.getDisplayName(), oFF.OuCalcHighlightRulesConstant.HIPEN))
				{
					operatorsRegex = oFF.XStringUtils.concatenate3(operatorsRegex, oFF.OuCalcHighlightRulesConstant.ESCAPE_CHAR, op.getDisplayName());
				}
				else
				{
					operatorsRegex = oFF.XStringUtils.concatenate2(operatorsRegex, op.getDisplayName());
				}
			}
		}
		operatorsRegex = oFF.XStringUtils.concatenate4(oFF.OuCalcHighlightRulesConstant.OPEN_SQUARE_BRACKETS, operatorsRegex, oFF.OuCalcHighlightRulesConstant.CLOSE_SQUARE_BRACKETS, oFF.OuCalcOperatorHighlightRule.QUANTIFIER);
		let rule = oFF.PrFactory.createStructure();
		rule.putString(oFF.OuCalcHighlightRulesConstant.TOKEN, oFF.OuCalcOperatorHighlightRule.FE_OPERATOR_CSS_NAME);
		rule.putString(oFF.OuCalcHighlightRulesConstant.REGEX, operatorsRegex);
		rulesList.add(rule);
	}
};

oFF.OuCalcParenthesisHighlightRule = function() {};
oFF.OuCalcParenthesisHighlightRule.prototype = new oFF.XObject();
oFF.OuCalcParenthesisHighlightRule.prototype._ff_c = "OuCalcParenthesisHighlightRule";

oFF.OuCalcParenthesisHighlightRule.FE_PARENTHESIS_CSS_NAME = "feLeftAndRightParenthesis";
oFF.OuCalcParenthesisHighlightRule.FE_PARENTHESIS_REGEX = "[()]";
oFF.OuCalcParenthesisHighlightRule.create = function()
{
	return new oFF.OuCalcParenthesisHighlightRule();
};
oFF.OuCalcParenthesisHighlightRule.prototype.build = function(rulesList)
{
	let rule = oFF.PrFactory.createStructure();
	rule.putString(oFF.OuCalcHighlightRulesConstant.TOKEN, oFF.OuCalcParenthesisHighlightRule.FE_PARENTHESIS_CSS_NAME);
	rule.putString(oFF.OuCalcHighlightRulesConstant.REGEX, oFF.OuCalcParenthesisHighlightRule.FE_PARENTHESIS_REGEX);
	rulesList.add(rule);
};

oFF.OuCalcPercentageHighlightRule = function() {};
oFF.OuCalcPercentageHighlightRule.prototype = new oFF.XObject();
oFF.OuCalcPercentageHighlightRule.prototype._ff_c = "OuCalcPercentageHighlightRule";

oFF.OuCalcPercentageHighlightRule.FE_PERCENTAGE_CSS_NAME = "feFunctions";
oFF.OuCalcPercentageHighlightRule.FE_PERCENTAGE_GRANDTOTAL_REGEX = "%GRANDTOTAL";
oFF.OuCalcPercentageHighlightRule.FE_PERCENTAGE_SUBTOTAL_REGEX = "%SUBTOTAL";
oFF.OuCalcPercentageHighlightRule.create = function()
{
	return new oFF.OuCalcPercentageHighlightRule();
};
oFF.OuCalcPercentageHighlightRule.prototype.build = function(rulesList, formulaItems)
{
	let functions = formulaItems.getFunctions();
	let iterator = functions.getIterator();
	while (iterator.hasNext())
	{
		let func = iterator.next();
		if (oFF.XString.isEqual(func.getDisplayName(), oFF.OuCalcPercentageHighlightRule.FE_PERCENTAGE_GRANDTOTAL_REGEX))
		{
			let rule = oFF.PrFactory.createStructure();
			rule.putString(oFF.OuCalcHighlightRulesConstant.TOKEN, oFF.OuCalcPercentageHighlightRule.FE_PERCENTAGE_CSS_NAME);
			rule.putString(oFF.OuCalcHighlightRulesConstant.REGEX, oFF.OuCalcPercentageHighlightRule.FE_PERCENTAGE_GRANDTOTAL_REGEX);
			rulesList.add(rule);
		}
		else if (oFF.XString.isEqual(func.getDisplayName(), oFF.OuCalcPercentageHighlightRule.FE_PERCENTAGE_SUBTOTAL_REGEX))
		{
			let rule = oFF.PrFactory.createStructure();
			rule.putString(oFF.OuCalcHighlightRulesConstant.TOKEN, oFF.OuCalcPercentageHighlightRule.FE_PERCENTAGE_CSS_NAME);
			rule.putString(oFF.OuCalcHighlightRulesConstant.REGEX, oFF.OuCalcPercentageHighlightRule.FE_PERCENTAGE_SUBTOTAL_REGEX);
			rulesList.add(rule);
		}
	}
};

oFF.OuCalcSemicolonHighlightRule = function() {};
oFF.OuCalcSemicolonHighlightRule.prototype = new oFF.XObject();
oFF.OuCalcSemicolonHighlightRule.prototype._ff_c = "OuCalcSemicolonHighlightRule";

oFF.OuCalcSemicolonHighlightRule.FE_SEMICOLON_CSS_NAME = "feSemicolon";
oFF.OuCalcSemicolonHighlightRule.FE_SEMICOLON_REGEX = ";";
oFF.OuCalcSemicolonHighlightRule.create = function()
{
	return new oFF.OuCalcSemicolonHighlightRule();
};
oFF.OuCalcSemicolonHighlightRule.prototype.build = function(rulesList)
{
	let rule = oFF.PrFactory.createStructure();
	rule.putString(oFF.OuCalcHighlightRulesConstant.TOKEN, oFF.OuCalcSemicolonHighlightRule.FE_SEMICOLON_CSS_NAME);
	rule.putString(oFF.OuCalcHighlightRulesConstant.REGEX, oFF.OuCalcSemicolonHighlightRule.FE_SEMICOLON_REGEX);
	rulesList.add(rule);
};

oFF.OuCalcStringHighlightRule = function() {};
oFF.OuCalcStringHighlightRule.prototype = new oFF.XObject();
oFF.OuCalcStringHighlightRule.prototype._ff_c = "OuCalcStringHighlightRule";

oFF.OuCalcStringHighlightRule.FE_STRING_CSS_NAME = "feString";
oFF.OuCalcStringHighlightRule.FE_STRING_REGEX = "\"(?:[^\"\\\\]|\\\\.)*\"|'(?:[^'\\\\]|\\\\.)*'";
oFF.OuCalcStringHighlightRule.create = function()
{
	return new oFF.OuCalcStringHighlightRule();
};
oFF.OuCalcStringHighlightRule.prototype.build = function(rulesList)
{
	let rule = oFF.PrFactory.createStructure();
	rule.putString(oFF.OuCalcHighlightRulesConstant.TOKEN, oFF.OuCalcStringHighlightRule.FE_STRING_CSS_NAME);
	rule.putString(oFF.OuCalcHighlightRulesConstant.REGEX, oFF.OuCalcStringHighlightRule.FE_STRING_REGEX);
	rulesList.add(rule);
};

oFF.OuCalcHintBase = function() {};
oFF.OuCalcHintBase.prototype = new oFF.XObject();
oFF.OuCalcHintBase.prototype._ff_c = "OuCalcHintBase";

oFF.OuCalcHintBase.CAPTION_KEY = "caption";
oFF.OuCalcHintBase.CLASS_NAME_KEY = "className";
oFF.OuCalcHintBase.SCORE_KEY = "score";
oFF.OuCalcHintBase.prototype.m_caption = null;
oFF.OuCalcHintBase.prototype.m_cssClassName = null;
oFF.OuCalcHintBase.prototype.m_score = 0;
oFF.OuCalcHintBase.prototype.getCaption = function()
{
	return oFF.XOptional.ofNullable(this.m_caption);
};
oFF.OuCalcHintBase.prototype.getCssClassName = function()
{
	return this.m_cssClassName;
};
oFF.OuCalcHintBase.prototype.getJson = function()
{
	let root = oFF.PrStructure.create();
	root.putStringNotNull(oFF.OuCalcHintBase.CAPTION_KEY, this.m_caption);
	root.putInteger(oFF.OuCalcHintBase.SCORE_KEY, this.m_score);
	root.putString(oFF.OuCalcHintBase.CLASS_NAME_KEY, this.m_cssClassName);
	return root;
};
oFF.OuCalcHintBase.prototype.getScore = function()
{
	return this.m_score;
};
oFF.OuCalcHintBase.prototype.setupInternal = function(caption, score, cssClassName)
{
	this.m_caption = caption;
	this.m_score = score;
	this.m_cssClassName = cssClassName;
};
oFF.OuCalcHintBase.prototype.toString = function()
{
	return this.getJson().getStringRepresentation();
};

oFF.OuCalcHintGenerator = function() {};
oFF.OuCalcHintGenerator.prototype = new oFF.XObject();
oFF.OuCalcHintGenerator.prototype._ff_c = "OuCalcHintGenerator";

oFF.OuCalcHintGenerator.create = function(hintProviders)
{
	oFF.XObjectExt.assertNotNull(hintProviders);
	oFF.XObjectExt.assertTrue(hintProviders.size() > 0);
	let hintGenerator = new oFF.OuCalcHintGenerator();
	hintGenerator.m_hintProviders = hintProviders.getValuesAsReadOnlyList();
	return hintGenerator;
};
oFF.OuCalcHintGenerator.prototype.m_hintProviders = null;
oFF.OuCalcHintGenerator.prototype.generate = function(token)
{
	let hints = oFF.XList.create();
	for (let i = 0; i < this.m_hintProviders.size(); i++)
	{
		let hintProvider = this.m_hintProviders.get(i);
		if (hintProvider.accept(token))
		{
			hintProvider.prepare(token);
			hints.addAll(hintProvider.provide());
		}
	}
	return hints;
};

oFF.OuCalcAbstractHintProvider = function() {};
oFF.OuCalcAbstractHintProvider.prototype = new oFF.XObject();
oFF.OuCalcAbstractHintProvider.prototype._ff_c = "OuCalcAbstractHintProvider";

oFF.OuCalcAbstractHintProvider.prototype.m_cssClassName = null;
oFF.OuCalcAbstractHintProvider.prototype.getCssClassName = function()
{
	return this.m_cssClassName;
};
oFF.OuCalcAbstractHintProvider.prototype.isGenericToken = function(token)
{
	return !token.getDataTypes().contains(oFF.FeDataType.OPERATOR) && !token.getDataTypes().contains(oFF.FeDataType.HIERARCHY) && !token.getDataTypes().contains(oFF.FeDataType.GRANULARITY) && !token.getDataTypes().contains(oFF.FeDataType.PROPERTY);
};
oFF.OuCalcAbstractHintProvider.prototype.isTokenCompatible = function(token, dataType)
{
	return oFF.XStream.of(token.getDataTypes()).anyMatch((tokenDataType) => {
		return oFF.FeDataType.isStrictlyCompatible(tokenDataType, dataType) || tokenDataType.isEqualTo(oFF.FeDataType.BOOLEAN) || tokenDataType.isEqualTo(oFF.FeDataType.ANY);
	});
};
oFF.OuCalcAbstractHintProvider.prototype.isTokenTypeEqualTo = function(token, dataType)
{
	return oFF.XStream.of(token.getDataTypes()).anyMatch((tokenDataType) => {
		return dataType.isEqualTo(tokenDataType);
	});
};
oFF.OuCalcAbstractHintProvider.prototype.isTokenTypeOf = function(token, dataType)
{
	return oFF.XStream.of(token.getDataTypes()).anyMatch((tokenDataType) => {
		return dataType.isTypeOf(tokenDataType) || tokenDataType.isEqualTo(oFF.FeDataType.BOOLEAN) || tokenDataType.isEqualTo(oFF.FeDataType.ANY);
	});
};
oFF.OuCalcAbstractHintProvider.prototype.prepare = function(token) {};
oFF.OuCalcAbstractHintProvider.prototype.setupInternal = function(cssClassName)
{
	this.m_cssClassName = cssClassName;
};

oFF.OuCalcTranslationParser = function() {};
oFF.OuCalcTranslationParser.prototype = new oFF.XObject();
oFF.OuCalcTranslationParser.prototype._ff_c = "OuCalcTranslationParser";

oFF.OuCalcTranslationParser.ARGUMENT_SEPARATOR_TAG = "argsep";
oFF.OuCalcTranslationParser.CELL_SEPARATOR = "|";
oFF.OuCalcTranslationParser.CODE_PARSED = "span class='ffFeCode'";
oFF.OuCalcTranslationParser.CODE_TAG = "code";
oFF.OuCalcTranslationParser.DECIMAL_GROUPING_SEPARATOR_TAG = "decgroupsep";
oFF.OuCalcTranslationParser.DECIMAL_SEPARATOR_TAG = "decsep";
oFF.OuCalcTranslationParser.DEFAULT_CLOSE_TAG = "</span>";
oFF.OuCalcTranslationParser.DIMENSION_PARSED = "span class='ffFeDimension'";
oFF.OuCalcTranslationParser.DIMENSION_TAG = "dimension";
oFF.OuCalcTranslationParser.FUNCTION_PARSED = "span class='ffFeFunc'";
oFF.OuCalcTranslationParser.FUNCTION_TAG = "func";
oFF.OuCalcTranslationParser.MEASURE_PARSED = "span class='ffFeMeasure'";
oFF.OuCalcTranslationParser.MEASURE_TAG = "measure";
oFF.OuCalcTranslationParser.MEASURE_TYPE_TAG = "measuretype";
oFF.OuCalcTranslationParser.OPERATOR_PARSED = "span class='ffFeOperator'";
oFF.OuCalcTranslationParser.OPERATOR_TAG = "operator";
oFF.OuCalcTranslationParser.PARAMETER_PARSED = "span class='ffFeParameter'";
oFF.OuCalcTranslationParser.PARAMETER_TAG = "param";
oFF.OuCalcTranslationParser.PARAM_STRING_NUMBER_TAG = "paramStringNumber";
oFF.OuCalcTranslationParser.TAG_END = ">";
oFF.OuCalcTranslationParser.TAG_START = "<";
oFF.OuCalcTranslationParser.TAG_START_CLOSE = "</";
oFF.OuCalcTranslationParser.TAG_TABLE = "table";
oFF.OuCalcTranslationParser.TAG_TABLE_HEADER = "thead";
oFF.OuCalcTranslationParser.TAG_TD = "td";
oFF.OuCalcTranslationParser.TAG_TH = "th";
oFF.OuCalcTranslationParser.TAG_TR = "tr";
oFF.OuCalcTranslationParser.create = function(preferences, measureDataType, stringsSupported)
{
	let instance = new oFF.OuCalcTranslationParser();
	instance.m_decimalSeparator = preferences.getDecimalSeparator();
	instance.m_decimalGroupingSeparator = preferences.getDecimalGroupingSeparator();
	instance.m_argumentSeparator = preferences.getArgumentSeparator();
	instance.m_measureDataType = measureDataType;
	instance.m_stringNumberText = stringsSupported ? oFF.FeDataType.STRING_NUMBER.getName() : oFF.FeDataType.NUMBER.getName();
	instance.internalSetup();
	return instance;
};
oFF.OuCalcTranslationParser.prototype.m_argumentSeparator = null;
oFF.OuCalcTranslationParser.prototype.m_decimalGroupingSeparator = null;
oFF.OuCalcTranslationParser.prototype.m_decimalSeparator = null;
oFF.OuCalcTranslationParser.prototype.m_measureDataType = null;
oFF.OuCalcTranslationParser.prototype.m_parseMap = null;
oFF.OuCalcTranslationParser.prototype.m_stringNumberText = null;
oFF.OuCalcTranslationParser.prototype.addToMap = function(tag, parsed)
{
	this.m_parseMap.put(this.generateOpenTag(tag), this.generateOpenTag(parsed));
	this.m_parseMap.put(this.generateCloseTag(tag), oFF.OuCalcTranslationParser.DEFAULT_CLOSE_TAG);
};
oFF.OuCalcTranslationParser.prototype.generateCloseTag = function(txt)
{
	return oFF.XStringUtils.concatenate3(oFF.OuCalcTranslationParser.TAG_START_CLOSE, txt, oFF.OuCalcTranslationParser.TAG_END);
};
oFF.OuCalcTranslationParser.prototype.generateOpenTag = function(txt)
{
	return oFF.XStringUtils.concatenate3(oFF.OuCalcTranslationParser.TAG_START, txt, oFF.OuCalcTranslationParser.TAG_END);
};
oFF.OuCalcTranslationParser.prototype.internalSetup = function()
{
	if (oFF.isNull(this.m_parseMap))
	{
		this.m_parseMap = oFF.XHashMapByString.create();
		this.addToMap(oFF.OuCalcTranslationParser.CODE_TAG, oFF.OuCalcTranslationParser.CODE_PARSED);
		this.addToMap(oFF.OuCalcTranslationParser.FUNCTION_TAG, oFF.OuCalcTranslationParser.FUNCTION_PARSED);
		this.addToMap(oFF.OuCalcTranslationParser.OPERATOR_TAG, oFF.OuCalcTranslationParser.OPERATOR_PARSED);
		this.addToMap(oFF.OuCalcTranslationParser.PARAMETER_TAG, oFF.OuCalcTranslationParser.PARAMETER_PARSED);
		this.addToMap(oFF.OuCalcTranslationParser.MEASURE_TAG, oFF.OuCalcTranslationParser.MEASURE_PARSED);
		this.addToMap(oFF.OuCalcTranslationParser.DIMENSION_TAG, oFF.OuCalcTranslationParser.DIMENSION_PARSED);
		this.m_parseMap.put(this.generateOpenTag(oFF.OuCalcTranslationParser.ARGUMENT_SEPARATOR_TAG), this.m_argumentSeparator);
		this.m_parseMap.put(this.generateOpenTag(oFF.OuCalcTranslationParser.DECIMAL_SEPARATOR_TAG), this.m_decimalSeparator);
		this.m_parseMap.put(this.generateOpenTag(oFF.OuCalcTranslationParser.DECIMAL_GROUPING_SEPARATOR_TAG), this.m_decimalGroupingSeparator);
		this.m_parseMap.put(this.generateOpenTag(oFF.OuCalcTranslationParser.MEASURE_TYPE_TAG), oFF.XStringUtils.concatenate3(this.generateOpenTag(oFF.OuCalcTranslationParser.MEASURE_PARSED), this.m_measureDataType, oFF.OuCalcTranslationParser.DEFAULT_CLOSE_TAG));
		this.m_parseMap.put(this.generateOpenTag(oFF.OuCalcTranslationParser.PARAM_STRING_NUMBER_TAG), oFF.XStringUtils.concatenate3(this.generateOpenTag(oFF.OuCalcTranslationParser.PARAMETER_PARSED), this.m_stringNumberText, oFF.OuCalcTranslationParser.DEFAULT_CLOSE_TAG));
	}
};
oFF.OuCalcTranslationParser.prototype.parseCellsTokens = function(text, tag)
{
	let parsedText = oFF.XStringBuffer.create();
	let tokens = oFF.XStringTokenizer.splitString(oFF.XString.substring(text, 4, -1), oFF.OuCalcTranslationParser.CELL_SEPARATOR);
	for (let i = 0; i < tokens.size(); i++)
	{
		parsedText.append(this.generateOpenTag(tag));
		parsedText.append(tokens.get(i));
		parsedText.append(this.generateCloseTag(tag));
	}
	return parsedText.toString();
};
oFF.OuCalcTranslationParser.prototype.parseTable = function(text)
{
	let parsedText = oFF.XStringBuffer.create();
	parsedText.append(this.generateOpenTag(oFF.OuCalcTranslationParser.TAG_TABLE));
	let indexOfTH = oFF.XString.indexOf(text, this.generateOpenTag(oFF.OuCalcTranslationParser.TAG_TH));
	let indexOfTR = oFF.XString.indexOf(text, this.generateOpenTag(oFF.OuCalcTranslationParser.TAG_TR));
	if (indexOfTH !== -1)
	{
		let textTH = oFF.XString.substring(text, indexOfTH, indexOfTR);
		let parsedTH = this.parseTableHeader(textTH);
		parsedText.append(parsedTH);
	}
	let tagTR = this.generateOpenTag(oFF.OuCalcTranslationParser.TAG_TR);
	let tokensTR = oFF.XStringTokenizer.splitString(text, tagTR);
	for (let i = 1; i < tokensTR.size(); i++)
	{
		let textTR = oFF.XStringUtils.concatenate2(tagTR, tokensTR.get(i));
		let parsedTR = this.parseTableRow(textTR);
		parsedText.append(parsedTR);
	}
	parsedText.append(this.generateCloseTag(oFF.OuCalcTranslationParser.TAG_TABLE));
	return parsedText.toString();
};
oFF.OuCalcTranslationParser.prototype.parseTableHeader = function(text)
{
	let parsedText = oFF.XStringBuffer.create();
	parsedText.append(this.generateOpenTag(oFF.OuCalcTranslationParser.TAG_TABLE_HEADER));
	parsedText.append(this.generateOpenTag(oFF.OuCalcTranslationParser.TAG_TR));
	parsedText.append(this.parseCellsTokens(text, oFF.OuCalcTranslationParser.TAG_TH));
	parsedText.append(this.generateCloseTag(oFF.OuCalcTranslationParser.TAG_TR));
	parsedText.append(this.generateCloseTag(oFF.OuCalcTranslationParser.TAG_TABLE_HEADER));
	return parsedText.toString();
};
oFF.OuCalcTranslationParser.prototype.parseTableRow = function(text)
{
	let parsedText = oFF.XStringBuffer.create();
	parsedText.append(this.generateOpenTag(oFF.OuCalcTranslationParser.TAG_TR));
	parsedText.append(this.parseCellsTokens(text, oFF.OuCalcTranslationParser.TAG_TD));
	parsedText.append(this.generateCloseTag(oFF.OuCalcTranslationParser.TAG_TR));
	return parsedText.toString();
};
oFF.OuCalcTranslationParser.prototype.parseText = function(text)
{
	if (oFF.XStringUtils.isNullOrEmpty(text))
	{
		return text;
	}
	let parsedTxt = text;
	let iXIterator = this.m_parseMap.getKeysAsIterator();
	while (iXIterator.hasNext())
	{
		let tag = iXIterator.next();
		let tagParsed = this.m_parseMap.getByKey(tag);
		parsedTxt = oFF.XString.replace(parsedTxt, tag, tagParsed);
	}
	if (oFF.XString.startsWith(parsedTxt, this.generateOpenTag(oFF.OuCalcTranslationParser.TAG_TABLE)))
	{
		return this.parseTable(parsedTxt);
	}
	if (oFF.XString.startsWith(parsedTxt, this.generateOpenTag(oFF.OuCalcTranslationParser.TAG_TH)))
	{
		return this.parseTableHeader(parsedTxt);
	}
	if (oFF.XString.startsWith(parsedTxt, this.generateOpenTag(oFF.OuCalcTranslationParser.TAG_TR)))
	{
		return this.parseTableRow(parsedTxt);
	}
	return parsedTxt;
};

oFF.OuCalcHorizonConfigGenerator = {

	create:function()
	{
			return new oFF.OuCalcHorizonConfigGenerator();
	},
	generateHorizonConfig:function(pluginName)
	{
			oFF.XStringUtils.assertNotNullOrEmpty(pluginName);
		let start = "{\"layout\":{\"type\":\"SinglePlugin\"}, \"configuration\": {     \"toolbarVisible\": false,     \"menuVisible\": false,     \"statusBarVisible\": false   },   \"plugins\": [     {       \"plugin\": \"";
		let end = "\",       \"config\": {         \"foo\": \"bar\"       }     }   ],   \"commands\": [   {       \"plugin\": \"CodeEditorValueRetriever\",       \"config\": {         \"foo\": \"bar\"       }     }, {       \"plugin\": \"CalculationsDetailsAreaRetriever\",       \"config\": {         \"foo\": \"bar\"       }     }, {       \"plugin\": \"CalcAssistancePluginValueRetriever\",       \"config\": {         \"foo\": \"bar\"       }     }   ] }";
		return oFF.XStringUtils.concatenate3(start, pluginName, end);
	}
};

oFF.OuCalcCtrlSpaceHandler = function() {};
oFF.OuCalcCtrlSpaceHandler.prototype = new oFF.XObject();
oFF.OuCalcCtrlSpaceHandler.prototype._ff_c = "OuCalcCtrlSpaceHandler";

oFF.OuCalcCtrlSpaceHandler.EQUALS = "=";
oFF.OuCalcCtrlSpaceHandler.NOT_EQUALS = "!=";
oFF.OuCalcCtrlSpaceHandler.OPERATOR_PATTERN = "(!=|<=|>=|=|<|>)";
oFF.OuCalcCtrlSpaceHandler.create = function(datasource, memberSelectorHandler, preferences, feConfiguration, feFormulaPresentation)
{
	let instance = new oFF.OuCalcCtrlSpaceHandler();
	instance.m_datasource = datasource;
	instance.m_memberSelectorHandler = memberSelectorHandler;
	instance.m_preferences = oFF.XObjectExt.assertNotNull(preferences);
	instance.m_feConfiguration = oFF.XObjectExt.assertNotNull(feConfiguration);
	instance.m_feFormulaPresentation = feFormulaPresentation;
	return instance;
};
oFF.OuCalcCtrlSpaceHandler.fallbackToFlat = function(hierarchyName)
{
	return oFF.XStringUtils.isNullOrEmpty(hierarchyName) ? oFF.FeHierarchy.FLAT_HIERARCHY_FORMULA_REPRESENTATION : hierarchyName;
};
oFF.OuCalcCtrlSpaceHandler.prototype.m_datasource = null;
oFF.OuCalcCtrlSpaceHandler.prototype.m_feConfiguration = null;
oFF.OuCalcCtrlSpaceHandler.prototype.m_feFormulaPresentation = null;
oFF.OuCalcCtrlSpaceHandler.prototype.m_memberSelectorHandler = null;
oFF.OuCalcCtrlSpaceHandler.prototype.m_preferences = null;
oFF.OuCalcCtrlSpaceHandler.prototype.getDimensionField = function(formulaText, dimension, token, dimensionCustomData, memberSelectorOutput)
{
	let currentHierarchy = oFF.OuCalcCtrlSpaceHandler.fallbackToFlat(dimensionCustomData.getHierarchyName().orElse(dimension.getDefaultHierarchy()));
	let memberSelectorHierarchy = oFF.OuCalcCtrlSpaceHandler.fallbackToFlat(memberSelectorOutput.getHierarchy());
	let updatedHierarchy = oFF.OuCalcCtrlSpaceHandler.fallbackToFlat(!dimension.getHierarchyByName(memberSelectorHierarchy).isPresent() ? dimension.getDefaultHierarchy() : memberSelectorHierarchy);
	let hierarchyChanged = !dimension.getSelectedProperty().isPresent() && (oFF.XStringUtils.isNullOrEmpty(currentHierarchy) !== oFF.XStringUtils.isNullOrEmpty(updatedHierarchy) || !oFF.XString.isEqual(currentHierarchy, updatedHierarchy));
	let buffer = oFF.XStringBuffer.create();
	if (hierarchyChanged)
	{
		let newDimension = oFF.FeDimension.createWithSelectedHierarchy(dimension, memberSelectorHierarchy);
		buffer.append(newDimension.getField(this.m_preferences.isModelPrefixEnabled()));
	}
	else
	{
		let operatorPosition = this.getOperatorPosition(formulaText, token);
		buffer.append(oFF.XString.substring(formulaText, token.getStart(), operatorPosition));
	}
	buffer.append(this.getNewOperator(formulaText, token, memberSelectorOutput));
	return buffer.toString();
};
oFF.OuCalcCtrlSpaceHandler.prototype.getDimensionFromToken = function(token)
{
	return oFF.FeMemberRetriever.create(this.m_datasource).getDimension(token.getText(), this.m_preferences.isModelPrefixEnabled());
};
oFF.OuCalcCtrlSpaceHandler.prototype.getEqualsSign = function(exclude)
{
	return exclude ? oFF.OuCalcCtrlSpaceHandler.NOT_EQUALS : oFF.OuCalcCtrlSpaceHandler.EQUALS;
};
oFF.OuCalcCtrlSpaceHandler.prototype.getExistingOperator = function(formulaText, token)
{
	let formulaTextFromTokenStart = oFF.XString.substring(formulaText, token.getStart(), -1);
	let operator = oFF.XRegex.getInstance().getFirstGroupOfMatch(formulaTextFromTokenStart, oFF.OuCalcCtrlSpaceHandler.OPERATOR_PATTERN);
	return operator;
};
oFF.OuCalcCtrlSpaceHandler.prototype.getNewOperator = function(formulaText, token, memberSelectorOutput)
{
	let existingOperator = this.getExistingOperator(formulaText, token);
	if (oFF.XString.isEqual(existingOperator, oFF.OuCalcCtrlSpaceHandler.EQUALS) || oFF.XString.isEqual(existingOperator, oFF.OuCalcCtrlSpaceHandler.NOT_EQUALS))
	{
		return this.getEqualsSign(memberSelectorOutput.areMembersExcluded());
	}
	return existingOperator;
};
oFF.OuCalcCtrlSpaceHandler.prototype.getOperatorPosition = function(formulaText, token)
{
	let operator = this.getExistingOperator(formulaText, token);
	let index = oFF.XString.indexOfFrom(formulaText, operator, token.getStart());
	return index;
};
oFF.OuCalcCtrlSpaceHandler.prototype.getUpdatedCursorIndex = function(formulaText, token, updatedDimensionText)
{
	return oFF.XString.size(oFF.XString.substring(formulaText, 0, token.getStart())) + oFF.XString.size(updatedDimensionText);
};
oFF.OuCalcCtrlSpaceHandler.prototype.getUpdatedDimensionText = function(formulaText, token, memberSelectorOutput, dimension, preferences)
{
	let dimensionCustomData = oFF.FeDimensionCustomData.extractFromToken(token);
	if (!dimensionCustomData.isPresent())
	{
		return oFF.XString.substring(formulaText, token.getStart(), token.getEnd());
	}
	let buffer = oFF.XStringBuffer.create();
	buffer.append(this.getDimensionField(formulaText, dimension, token, dimensionCustomData.get(), memberSelectorOutput));
	buffer.append(oFF.FeDimensionMembersConverter.stringifyMembers(memberSelectorOutput.getNewMembers(), !preferences.isCommaDecimalSeparator()));
	return buffer.toString();
};
oFF.OuCalcCtrlSpaceHandler.prototype.getUpdatedFormulaText = function(formulaText, token, updatedDimensionText)
{
	let buffer = oFF.XStringBuffer.create();
	buffer.append(oFF.XString.substring(formulaText, 0, token.getStart()));
	buffer.append(updatedDimensionText);
	buffer.append(oFF.XString.substring(formulaText, token.getEnd(), -1));
	return buffer.toString();
};
oFF.OuCalcCtrlSpaceHandler.prototype.handle = function(formula, token, setFormula, setCursorPosition, setBusy, openHintsList)
{
	oFF.XObjectExt.assertNotNull(formula);
	let formulaText = formula.getText();
	if (this.isDimensionToken(token) && this.isDimensionValid(token) && this.isDimensionSupported(token))
	{
		let dimension = this.getDimensionFromToken(token).get();
		if (this.m_feConfiguration.isHierarchyLoadEnabled() && this.isDimensionTokenWithExpectedHierarchy(token))
		{
			setBusy(oFF.XBooleanValue.create(true));
			let updateHierarchies = this.m_datasource.updateHierarchies(oFF.XCollectionUtils.singletonList(dimension.getDimensionName()));
			updateHierarchies.onThen((empty) => {
				setBusy(oFF.XBooleanValue.create(false));
				openHintsList();
			});
		}
		else if (this.isDimensionTokenWithExpectedDimensionMember(token))
		{
			let dimCustomData = oFF.FeDimensionCustomData.extractFromToken(token);
			let emptyList = oFF.XList.create();
			let existingMembers = dimCustomData.isPresent() && dimCustomData.get().getMemberString().isPresent() ? oFF.FeDimensionMembersConverter.parseMembers(dimCustomData.get().getMemberString().get()) : emptyList;
			let excludeMembers = dimCustomData.isPresent() && dimCustomData.get().isExclude();
			let multiselect = dimCustomData.isPresent() && dimCustomData.get().isMultiselect();
			this.m_memberSelectorHandler.handle(dimension, excludeMembers, multiselect, existingMembers, (memberSelectorOutput) => {
				let updatedDimensionText = this.getUpdatedDimensionText(formulaText, token, memberSelectorOutput, dimension, this.m_preferences);
				let updatedFormulaText = this.getUpdatedFormulaText(formulaText, token, updatedDimensionText);
				let newCursorIndex = this.getUpdatedCursorIndex(formulaText, token, updatedDimensionText);
				setFormula(oFF.FeFormula.create(updatedFormulaText, this.m_feFormulaPresentation));
				setCursorPosition(oFF.FeCursorHelper.getCursorPosition(updatedFormulaText, newCursorIndex));
			});
		}
	}
};
oFF.OuCalcCtrlSpaceHandler.prototype.isDimensionSupported = function(token)
{
	if (this.m_feConfiguration.dimensionsSupported())
	{
		return true;
	}
	let parentToken = token.getParent();
	if (!parentToken.isPresent() || !parentToken.get().getTokenType().isEqualTo(oFF.FeTokenType.ARGUMENT))
	{
		return false;
	}
	return oFF.XCollectionUtils.contains(parentToken.get().getDataTypes(), (dataType) => {
		return dataType.supportsDimensionsInHintsOnly();
	});
};
oFF.OuCalcCtrlSpaceHandler.prototype.isDimensionToken = function(token)
{
	return oFF.notNull(token) && token.getTokenType().isEqualTo(oFF.FeTokenType.DIMENSION);
};
oFF.OuCalcCtrlSpaceHandler.prototype.isDimensionTokenWithExpectedDimensionMember = function(token)
{
	return this.isDimensionToken(token) && token.getDataTypes().contains(oFF.FeDataType.DIMENSION_MEMBER);
};
oFF.OuCalcCtrlSpaceHandler.prototype.isDimensionTokenWithExpectedHierarchy = function(token)
{
	return this.isDimensionToken(token) && token.getDataTypes().contains(oFF.FeDataType.HIERARCHY);
};
oFF.OuCalcCtrlSpaceHandler.prototype.isDimensionValid = function(token)
{
	let dimension = this.getDimensionFromToken(token);
	if (!dimension.isPresent())
	{
		return false;
	}
	let feDimension = dimension.get();
	let isPropertyValid = feDimension.getSelectedProperty().isPresent() === oFF.FeFieldConverter.getProperty(token.getText()).isPresent();
	let isHierarchyValid = feDimension.getSelectedHierarchy().isPresent() === oFF.FeFieldConverter.getHierarchy(token.getText()).isPresent();
	return isPropertyValid && isHierarchyValid;
};
oFF.OuCalcCtrlSpaceHandler.prototype.releaseObject = function()
{
	this.m_datasource = null;
	this.m_memberSelectorHandler = null;
	this.m_preferences = null;
	this.m_feConfiguration = null;
	this.m_feFormulaPresentation = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OuCalcMemberSelectorHandler = function() {};
oFF.OuCalcMemberSelectorHandler.prototype = new oFF.XObject();
oFF.OuCalcMemberSelectorHandler.prototype._ff_c = "OuCalcMemberSelectorHandler";

oFF.OuCalcMemberSelectorHandler.create = function(process, queryModel, datasourceProvider, preferences)
{
	let handler = new oFF.OuCalcMemberSelectorHandler();
	handler.m_process = oFF.XObjectExt.assertNotNull(process);
	handler.m_queryModel = oFF.XObjectExt.assertNotNull(queryModel);
	handler.m_datasourceProvider = oFF.XObjectExt.assertNotNull(datasourceProvider);
	handler.m_preferences = oFF.XObjectExt.assertNotNull(preferences);
	return handler;
};
oFF.OuCalcMemberSelectorHandler.createNull = function()
{
	return new oFF.OuCalcMemberSelectorHandler();
};
oFF.OuCalcMemberSelectorHandler.prototype.m_datasourceProvider = null;
oFF.OuCalcMemberSelectorHandler.prototype.m_preferences = null;
oFF.OuCalcMemberSelectorHandler.prototype.m_process = null;
oFF.OuCalcMemberSelectorHandler.prototype.m_queryModel = null;
oFF.OuCalcMemberSelectorHandler.prototype.cacheItem = function(fdValue)
{
	let dimensionMemberLookupProviderOpt = this.m_datasourceProvider.getDimensionMemberLookupProviderInternal();
	if (fdValue.getType() === oFF.FilterDialogValueType.VALUEHELP && dimensionMemberLookupProviderOpt.isPresent())
	{
		let valueHelpNode = fdValue.getValueHelpNode();
		dimensionMemberLookupProviderOpt.get().cacheItem(valueHelpNode, fdValue.getHierarchyName());
	}
};
oFF.OuCalcMemberSelectorHandler.prototype.convertKey = function(fdValue, dimension)
{
	let displayKey = fdValue.getDisplayKey();
	let convertedKey = this.convertMemberKeyToShortDate(dimension, fdValue.getKey(), fdValue.getHierarchyName());
	if (convertedKey.isPresent())
	{
		displayKey = convertedKey.get();
	}
	else if (fdValue.isNull())
	{
		displayKey = oFF.FeDimensionMembersConverter.NULL_VALUE;
	}
	else if (oFF.XStringUtils.isNullOrEmpty(fdValue.getDisplayKey()))
	{
		displayKey = oFF.FeDimensionMembersConverter.EMPTY_VALUE;
	}
	return displayKey;
};
oFF.OuCalcMemberSelectorHandler.prototype.convertKeyWithDateToggle = function(fdValue, dimension)
{
	let formulaValue = null;
	let dimensionName = dimension.getDimensionName();
	if (fdValue.isNull())
	{
		formulaValue = oFF.FeDimensionMembersConverter.NULL_VALUE;
	}
	else if (oFF.XStringUtils.isNullOrEmpty(fdValue.getDisplayKey()))
	{
		formulaValue = oFF.FeDimensionMembersConverter.EMPTY_VALUE;
	}
	else if (dimension.isDateDimension())
	{
		let qDimension = this.m_queryModel.getDimensionByName(dimensionName);
		let namePathField = qDimension.getNamePathField();
		formulaValue = fdValue.getValueByField(namePathField);
	}
	else
	{
		let convertedKey = this.convertMemberKeyToShortDate(dimension, fdValue.getKey(), fdValue.getHierarchyName());
		formulaValue = convertedKey.isPresent() ? convertedKey.get() : fdValue.getDisplayKey();
	}
	return formulaValue;
};
oFF.OuCalcMemberSelectorHandler.prototype.convertMemberKeyToShortDate = function(dimension, memberKey, hierarchyName)
{
	let converter = oFF.FeMemberKeyToShortDateConverter.create(dimension, hierarchyName);
	return converter.convert(memberKey);
};
oFF.OuCalcMemberSelectorHandler.prototype.convertShortDateToMemberKey = function(dimension, member)
{
	let converter = oFF.FeShortDateToMemberKeyConverter.create(dimension);
	return converter.convert(member);
};
oFF.OuCalcMemberSelectorHandler.prototype.getDefaultSelection = function(existingMembers, dimension, isExclude)
{
	if (oFF.isNull(existingMembers) || existingMembers.isEmpty())
	{
		return oFF.XOptional.empty();
	}
	let filterDialogValues = oFF.XList.create();
	let hierarchyName = this.getSelectedHierarchyName(dimension);
	for (let i = 0; i < existingMembers.size(); i++)
	{
		let member = existingMembers.get(i);
		let fdValue;
		if (oFF.XString.isEqual(member, oFF.FeDimensionMembersConverter.NULL_VALUE))
		{
			fdValue = oFF.FilterDialogValueFactory.createNullValue();
		}
		else
		{
			let convertedKey = this.convertShortDateToMemberKey(dimension, member);
			let existingDisplayKey = existingMembers.get(i);
			let fdValueKey = oFF.FeFeatureToggle.isActive(oFF.FeFeatureToggle.RESTRICT) ? convertedKey.orElse(null) : convertedKey.orElse(oFF.XStringUtils.isNullOrEmpty(hierarchyName) ? existingDisplayKey : null);
			let fdValueDisplayKey = oFF.isNull(fdValueKey) ? existingDisplayKey : null;
			fdValue = oFF.FilterDialogValueFactory.createValue(fdValueKey, fdValueDisplayKey, existingDisplayKey);
		}
		fdValue.setComparisonOperator(isExclude ? oFF.ComparisonOperator.NOT_EQUAL : oFF.ComparisonOperator.EQUAL);
		fdValue.setHierarchyName(hierarchyName);
		filterDialogValues.add(fdValue);
	}
	return oFF.XOptional.of(filterDialogValues);
};
oFF.OuCalcMemberSelectorHandler.prototype.getSelectedHierarchyName = function(dimension)
{
	return dimension.getSelectedHierarchyName();
};
oFF.OuCalcMemberSelectorHandler.prototype.handle = function(dimension, isExclude, isMultiselect, existingMembers, callback)
{
	if (oFF.isNull(this.m_process) || oFF.isNull(this.m_queryModel) || oFF.isNull(this.m_datasourceProvider) || oFF.isNull(this.m_preferences))
	{
		return;
	}
	oFF.XObjectExt.assertNotNull(dimension);
	oFF.XObjectExt.assertNotNull(existingMembers);
	let dimensionName = dimension.getDimensionName();
	let dimensionDescription = dimension.getDimensionDescription();
	let dialogTitle = oFF.XLocalizationCenter.getCenter().getTextWithPlaceholder(oFF.OuCalcFormulaEditorI18n.MEMBER_SELECTOR_TITLE, dimensionDescription);
	let filterDialogRunner = oFF.FilterDialogProgramRunnerFactory.createForDimension(this.m_process, this.m_queryModel.getQueryManager(), dimensionName, dialogTitle);
	let filterDialogConfig = oFF.PrFactory.createStructure();
	filterDialogConfig.putBoolean(oFF.FilterDialog.PARAM_OFFER_READMODE_EXTENDED_SETTINGS, true);
	filterDialogConfig.putString(oFF.FilterDialog.PARAM_SELECTION_MODE, isMultiselect ? oFF.UiSelectionMode.MULTI_SELECT.getName() : oFF.UiSelectionMode.SINGLE_SELECT.getName());
	filterDialogConfig.putBoolean(oFF.FilterDialog.PARAM_SELECTION_REQUIRED, true);
	filterDialogConfig.putBoolean(oFF.FilterDialog.PARAM_OFFER_HIERARCHY_CHANGE, !dimension.getSelectedProperty().isPresent() && (dimension.getHierarchies().size() > 1 || !dimension.hasOnlyUnusableHierarchies()));
	filterDialogConfig.putBoolean(oFF.FilterDialog.PARAM_OFFER_EXCLUDE, isMultiselect);
	filterDialogConfig.putBoolean(oFF.FilterDialog.PARAM_EXCLUDE_BY_DEFAULT, isExclude);
	filterDialogConfig.putString(oFF.FilterDialog.PARAM_HIERARCHY, this.getSelectedHierarchyName(dimension));
	let defaultSelectionOpt = this.getDefaultSelection(existingMembers, dimension, isExclude);
	if (defaultSelectionOpt.isPresent())
	{
		filterDialogRunner.getProgramStartData().putXObject(oFF.FilterDialog.PRG_DATA_DEFAULT_SELECTION, defaultSelectionOpt.get());
	}
	filterDialogRunner.getProgramStartData().putXObject(oFF.FilterDialog.PRG_DATA_LISTENER_CLOSE, oFF.FilterDialogLambdaCloseListener.create((selection) => {
		let newMembers = oFF.XCollectionUtils.map(selection, (fdValue) => {
			let formulaValue;
			if (oFF.FeFeatureToggle.isActive(oFF.FeFeatureToggle.DATE_DIMENSIONS))
			{
				formulaValue = this.convertKeyWithDateToggle(fdValue, dimension);
			}
			else
			{
				formulaValue = this.convertKey(fdValue, dimension);
			}
			this.cacheItem(fdValue);
			return formulaValue;
		});
		let hierarchyName = selection.get(0).getHierarchyName();
		let areMembersExcluded = selection.get(0).getComparisonOperator().isEqualTo(oFF.ComparisonOperator.NOT_EQUAL);
		let callbackInput = oFF.OuCalcMemberSelectorOutput.create(newMembers, hierarchyName, areMembersExcluded);
		callback(callbackInput);
	}, null));
	filterDialogRunner.setConfigStructure(filterDialogConfig);
	filterDialogRunner.runProgram();
};

oFF.OuCalcMemberSelectorOutput = function() {};
oFF.OuCalcMemberSelectorOutput.prototype = new oFF.XObject();
oFF.OuCalcMemberSelectorOutput.prototype._ff_c = "OuCalcMemberSelectorOutput";

oFF.OuCalcMemberSelectorOutput.create = function(newMembers, hierarchy, areMembersExcluded)
{
	oFF.XObjectExt.assertNotNull(newMembers);
	let callback = new oFF.OuCalcMemberSelectorOutput();
	callback.m_newMembers = newMembers;
	callback.m_hierarchy = hierarchy;
	callback.m_areMembersExcluded = areMembersExcluded;
	return callback;
};
oFF.OuCalcMemberSelectorOutput.prototype.m_areMembersExcluded = false;
oFF.OuCalcMemberSelectorOutput.prototype.m_hierarchy = null;
oFF.OuCalcMemberSelectorOutput.prototype.m_newMembers = null;
oFF.OuCalcMemberSelectorOutput.prototype.areMembersExcluded = function()
{
	return this.m_areMembersExcluded;
};
oFF.OuCalcMemberSelectorOutput.prototype.getHierarchy = function()
{
	return this.m_hierarchy;
};
oFF.OuCalcMemberSelectorOutput.prototype.getNewMembers = function()
{
	return this.m_newMembers;
};

oFF.OuCalcPanelConfig = function() {};
oFF.OuCalcPanelConfig.prototype = new oFF.XObject();
oFF.OuCalcPanelConfig.prototype._ff_c = "OuCalcPanelConfig";

oFF.OuCalcPanelConfig.prototype.m_renderConfig = null;
oFF.OuCalcPanelConfig.prototype.getRenderConfig = function()
{
	return this.m_renderConfig;
};
oFF.OuCalcPanelConfig.prototype.isSet = function()
{
	return this.m_renderConfig.isSet();
};
oFF.OuCalcPanelConfig.prototype.setupInternal = function(renderConfig)
{
	this.m_renderConfig = oFF.notNull(renderConfig) ? renderConfig : oFF.OuCalcPanelRenderConfig.createEmpty();
};

oFF.OuCalcPanelRenderConfig = function() {};
oFF.OuCalcPanelRenderConfig.prototype = new oFF.XObject();
oFF.OuCalcPanelRenderConfig.prototype._ff_c = "OuCalcPanelRenderConfig";

oFF.OuCalcPanelRenderConfig.create = function(anchorTag, domId, width)
{
	let instance = new oFF.OuCalcPanelRenderConfig();
	instance.m_anchorTag = anchorTag;
	instance.m_domId = domId;
	instance.m_width = width;
	return instance;
};
oFF.OuCalcPanelRenderConfig.createEmpty = function()
{
	return oFF.OuCalcPanelRenderConfig.create(null, null, null);
};
oFF.OuCalcPanelRenderConfig.prototype.m_anchorTag = null;
oFF.OuCalcPanelRenderConfig.prototype.m_domId = null;
oFF.OuCalcPanelRenderConfig.prototype.m_width = null;
oFF.OuCalcPanelRenderConfig.prototype.getAnchorTag = function()
{
	return this.m_anchorTag;
};
oFF.OuCalcPanelRenderConfig.prototype.getDomId = function()
{
	return this.m_domId;
};
oFF.OuCalcPanelRenderConfig.prototype.getWidth = function()
{
	return this.m_width;
};
oFF.OuCalcPanelRenderConfig.prototype.isAnchorTag = function()
{
	return oFF.notNull(this.m_anchorTag);
};
oFF.OuCalcPanelRenderConfig.prototype.isDomId = function()
{
	return !this.isAnchorTag() && oFF.XStringUtils.isNotNullAndNotEmpty(this.m_domId);
};
oFF.OuCalcPanelRenderConfig.prototype.isSet = function()
{
	return this.isAnchorTag() || this.isDomId();
};

oFF.OuCalcUiConfiguration = function() {};
oFF.OuCalcUiConfiguration.prototype = new oFF.XObject();
oFF.OuCalcUiConfiguration.prototype._ff_c = "OuCalcUiConfiguration";

oFF.OuCalcUiConfiguration.assertConfig = function(config)
{
	let singlePluginConfigSet = config.getSinglePluginConfig() !== null && oFF.OuCalcUiConfiguration.isPanelRenderConfigSet(config.getSinglePluginConfig().getRenderConfig());
	let multiplePluginConfigSet = oFF.OuCalcUiConfiguration.isPanelRenderConfigSet(config.getCodeEditorPanelRenderConfig()) || oFF.OuCalcUiConfiguration.isPanelRenderConfigSet(config.getAssistancePanelRenderConfig()) || oFF.OuCalcUiConfiguration.isPanelRenderConfigSet(config.getDetailsPanelRenderConfig()) || oFF.OuCalcUiConfiguration.isPanelRenderConfigSet(config.getFormulaItemsListPanelRenderConfig());
	oFF.XObjectExt.assertFalseExt(singlePluginConfigSet && multiplePluginConfigSet, "Cannot configure single and multiple plugins at the same time!");
	oFF.XObjectExt.assertTrueExt(singlePluginConfigSet || multiplePluginConfigSet, "Configure at least one plugin!");
};
oFF.OuCalcUiConfiguration.create = function(codeEditorPanelRenderConfig, detailsPanelRenderConfig, assistancePanelRenderConfig, formulaItemsListPanelRenderConfig)
{
	let instance = new oFF.OuCalcUiConfiguration();
	instance.setupInternal(null, codeEditorPanelRenderConfig, detailsPanelRenderConfig, assistancePanelRenderConfig, formulaItemsListPanelRenderConfig);
	return instance;
};
oFF.OuCalcUiConfiguration.createSinglePluginConfig = function(config)
{
	let instance = new oFF.OuCalcUiConfiguration();
	instance.setupInternal(config, null, null, null, null);
	return instance;
};
oFF.OuCalcUiConfiguration.getPanelRenderConfigOrEmpty = function(renderConfig)
{
	return oFF.notNull(renderConfig) ? renderConfig : oFF.OuCalcPanelRenderConfig.createEmpty();
};
oFF.OuCalcUiConfiguration.isPanelRenderConfigSet = function(renderConfig)
{
	return oFF.notNull(renderConfig) && renderConfig.isSet();
};
oFF.OuCalcUiConfiguration.prototype.m_assistancePanelRenderConfig = null;
oFF.OuCalcUiConfiguration.prototype.m_codeEditorPanelRenderConfig = null;
oFF.OuCalcUiConfiguration.prototype.m_detailsPanelRenderConfig = null;
oFF.OuCalcUiConfiguration.prototype.m_formulaItemsListPanelRenderConfig = null;
oFF.OuCalcUiConfiguration.prototype.m_singlePanelRenderConfig = null;
oFF.OuCalcUiConfiguration.prototype.displayUiComponent = function(component)
{
	if (component.isTypeOf(oFF.OuCalcUiComponent.CODE_EDITOR))
	{
		return this.m_codeEditorPanelRenderConfig.isSet();
	}
	else if (component.isTypeOf(oFF.OuCalcUiComponent.DETAILS_PANEL))
	{
		return this.m_detailsPanelRenderConfig.isSet();
	}
	else if (component.isTypeOf(oFF.OuCalcUiComponent.ASSISTANCE_PANEL))
	{
		return this.m_assistancePanelRenderConfig.isSet();
	}
	else if (component.isTypeOf(oFF.OuCalcUiComponent.FORMULA_ELEMENTS_PANEL))
	{
		return this.m_formulaItemsListPanelRenderConfig.isSet();
	}
	else
	{
		throw oFF.XException.createIllegalArgumentException(oFF.XStringUtils.concatenate2("Unknown CalUiComponent ", component.toString()));
	}
};
oFF.OuCalcUiConfiguration.prototype.getAssistancePanelRenderConfig = function()
{
	return this.m_assistancePanelRenderConfig;
};
oFF.OuCalcUiConfiguration.prototype.getCodeEditorPanelRenderConfig = function()
{
	return this.m_codeEditorPanelRenderConfig;
};
oFF.OuCalcUiConfiguration.prototype.getDetailsPanelRenderConfig = function()
{
	return this.m_detailsPanelRenderConfig;
};
oFF.OuCalcUiConfiguration.prototype.getFormulaItemsListPanelRenderConfig = function()
{
	return this.m_formulaItemsListPanelRenderConfig;
};
oFF.OuCalcUiConfiguration.prototype.getSinglePluginConfig = function()
{
	return this.m_singlePanelRenderConfig;
};
oFF.OuCalcUiConfiguration.prototype.setupInternal = function(singlePluginConfig, codeEditorPanelRenderConfig, detailsPanelRenderConfig, assistancePanelRenderConfig, formulaItemsListPanelRenderConfig)
{
	this.m_singlePanelRenderConfig = oFF.notNull(singlePluginConfig) ? singlePluginConfig : oFF.OuCalcSinglePluginConfig.createEmpty();
	this.m_codeEditorPanelRenderConfig = oFF.OuCalcUiConfiguration.getPanelRenderConfigOrEmpty(codeEditorPanelRenderConfig);
	this.m_detailsPanelRenderConfig = oFF.OuCalcUiConfiguration.getPanelRenderConfigOrEmpty(detailsPanelRenderConfig);
	this.m_assistancePanelRenderConfig = oFF.OuCalcUiConfiguration.getPanelRenderConfigOrEmpty(assistancePanelRenderConfig);
	this.m_formulaItemsListPanelRenderConfig = oFF.OuCalcUiConfiguration.getPanelRenderConfigOrEmpty(formulaItemsListPanelRenderConfig);
	oFF.OuCalcUiConfiguration.assertConfig(this);
};

oFF.OuCalcPluginRunner = function() {};
oFF.OuCalcPluginRunner.prototype = new oFF.XObject();
oFF.OuCalcPluginRunner.prototype._ff_c = "OuCalcPluginRunner";

oFF.OuCalcPluginRunner.create = function(process)
{
	let instance = new oFF.OuCalcPluginRunner();
	instance.m_process = oFF.XObjectExt.assertNotNull(process);
	return instance;
};
oFF.OuCalcPluginRunner.prototype.m_process = null;
oFF.OuCalcPluginRunner.prototype.runPlugin = function(panelRenderConfig, horizonConfig)
{
	if (!oFF.XStringUtils.isNotNullAndNotEmpty(horizonConfig))
	{
		throw oFF.XException.createIllegalArgumentException("Horizon config must not be null or empty!");
	}
	let horizonRunner = oFF.HuHorizonApi.createRunnerWithConfiguration(this.m_process, horizonConfig, false);
	if (panelRenderConfig.isSet())
	{
		if (panelRenderConfig.isAnchorTag())
		{
			horizonRunner.setContainerType(oFF.ProgramContainerType.CONTENT);
			horizonRunner.setAnchorContentControl(panelRenderConfig.getAnchorTag());
		}
		else
		{
			horizonRunner.setContainerType(oFF.ProgramContainerType.STANDALONE);
			horizonRunner.setNativeAnchorId(panelRenderConfig.getDomId());
		}
	}
	else
	{
		this.m_process.getLogger().logWarning3("Panel render config not set, plugin is running but not rendered.  Config='", horizonConfig, "'.");
	}
	let promise = horizonRunner.runProgram().onThenExt((program) => {
		return program;
	}).onCatch((err) => {
		let logMessage = oFF.XStringUtils.concatenate3("Error launching plugin. Config='", horizonConfig, "'.");
		logMessage = oFF.XStringUtils.concatenate4(logMessage, "Error='", err.getText(), "'.");
		this.m_process.getLogger().logError(logMessage);
	});
	return promise;
};

oFF.OuCalcSharedDataSpaceManager = function() {};
oFF.OuCalcSharedDataSpaceManager.prototype = new oFF.XObject();
oFF.OuCalcSharedDataSpaceManager.prototype._ff_c = "OuCalcSharedDataSpaceManager";

oFF.OuCalcSharedDataSpaceManager.SHARED_DATA_SPACE_ID = "Calculations-Shared-Dataspace";
oFF.OuCalcSharedDataSpaceManager.create = function(process)
{
	let instance = new oFF.OuCalcSharedDataSpaceManager();
	instance.m_process = oFF.XObjectExt.assertNotNull(process);
	return instance;
};
oFF.OuCalcSharedDataSpaceManager.prototype.m_process = null;
oFF.OuCalcSharedDataSpaceManager.prototype.destroy = function()
{
	this.m_process.destroySharedDataSpace(oFF.OuCalcSharedDataSpaceManager.SHARED_DATA_SPACE_ID);
};
oFF.OuCalcSharedDataSpaceManager.prototype.get = function()
{
	let space = this.m_process.getSharedDataSpace(oFF.OuCalcSharedDataSpaceManager.SHARED_DATA_SPACE_ID);
	if (oFF.isNull(space))
	{
		throw oFF.XException.createRuntimeException(oFF.XStringUtils.concatenate2("Unable to access space with ID=", oFF.OuCalcSharedDataSpaceManager.SHARED_DATA_SPACE_ID));
	}
	return space;
};
oFF.OuCalcSharedDataSpaceManager.prototype.initialize = function()
{
	let space = this.m_process.getSharedDataSpace(oFF.OuCalcSharedDataSpaceManager.SHARED_DATA_SPACE_ID);
	if (oFF.isNull(space))
	{
		let result = this.m_process.createSharedDataSpace(oFF.OuCalcSharedDataSpaceManager.SHARED_DATA_SPACE_ID);
		if (oFF.isNull(result))
		{
			throw oFF.XException.createRuntimeException(oFF.XStringUtils.concatenate2("Unable to create space with ID=", oFF.OuCalcSharedDataSpaceManager.SHARED_DATA_SPACE_ID));
		}
	}
};

oFF.OuCalcFormulaElementListConst = {

	ATTRIBUTE_NAME:"fe-tab-name",
	COLLAPSE_ICON:"close-command-field",
	COLLAPSE_NAME:"collapse",
	EXPAND_ICON:"open-command-field",
	EXPAND_NAME:"expand",
	FUNCTIONS_ICON:"fpa/formula",
	FUNCTIONS_NAME:"fx",
	OBJECTS_ICON:"fpa/models",
	OBJECTS_NAME:"objs",
	OPERATIONS_ICON:"simulate",
	OPERATORS_NAME:"operators",
	VARIABLES_ICON:"fpa/input-control",
	VARIABLES_NAME:"variables",
	getFunctionTooltip:function()
	{
			return oFF.OuCalcFormulaEditorI18n.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FE_TAB_ICON_FUNCTIONS);
	},
	getObjectsTooltip:function()
	{
			return oFF.OuCalcFormulaEditorI18n.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FE_TAB_ICON_OBJECTS);
	},
	getOperatorsTooltip:function()
	{
			return oFF.OuCalcFormulaEditorI18n.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FE_TAB_ICON_OPERATORS);
	},
	getVariablesTooltip:function()
	{
			return "Input Control";
	}
};

oFF.OuCalcPanelItem = function() {};
oFF.OuCalcPanelItem.prototype = new oFF.XObject();
oFF.OuCalcPanelItem.prototype._ff_c = "OuCalcPanelItem";

oFF.OuCalcPanelItem.create = function(technicalIdentifier, displayName)
{
	return oFF.OuCalcPanelItem.createExt(technicalIdentifier, technicalIdentifier, technicalIdentifier, displayName, true, null, null, null);
};
oFF.OuCalcPanelItem.createExt = function(uniqueKey, id, technicalIdentifier, displayName, enabled, category, tooltip, parentId)
{
	let instance = new oFF.OuCalcPanelItem();
	instance.setupInternal(uniqueKey, id, technicalIdentifier, displayName, enabled, category, tooltip, parentId);
	return instance;
};
oFF.OuCalcPanelItem.createWithCategory = function(technicalIdentifier, displayName, category)
{
	return oFF.OuCalcPanelItem.createExt(technicalIdentifier, technicalIdentifier, technicalIdentifier, displayName, true, category, null, null);
};
oFF.OuCalcPanelItem.prototype.m_category = null;
oFF.OuCalcPanelItem.prototype.m_displayName = null;
oFF.OuCalcPanelItem.prototype.m_enabled = false;
oFF.OuCalcPanelItem.prototype.m_id = null;
oFF.OuCalcPanelItem.prototype.m_parentId = null;
oFF.OuCalcPanelItem.prototype.m_technicalIdentifier = null;
oFF.OuCalcPanelItem.prototype.m_tooltip = null;
oFF.OuCalcPanelItem.prototype.m_uniqueKey = null;
oFF.OuCalcPanelItem.prototype.compareTo = function(objectToCompare)
{
	return oFF.XString.compare(this.m_displayName, objectToCompare.getDisplayName());
};
oFF.OuCalcPanelItem.prototype.getCategory = function()
{
	return this.m_category;
};
oFF.OuCalcPanelItem.prototype.getDisplayName = function()
{
	return this.m_displayName;
};
oFF.OuCalcPanelItem.prototype.getDisplayText = function(displayOption)
{
	return displayOption.composeDisplayStrings(this.getId(), this.getDisplayName());
};
oFF.OuCalcPanelItem.prototype.getId = function()
{
	return this.m_id;
};
oFF.OuCalcPanelItem.prototype.getParentId = function()
{
	return oFF.XOptional.ofNullable(this.m_parentId);
};
oFF.OuCalcPanelItem.prototype.getTechnicalIdentifier = function()
{
	return this.m_technicalIdentifier;
};
oFF.OuCalcPanelItem.prototype.getTooltip = function()
{
	return this.m_tooltip;
};
oFF.OuCalcPanelItem.prototype.getUniqueKey = function()
{
	return this.m_uniqueKey;
};
oFF.OuCalcPanelItem.prototype.isEnabled = function()
{
	return this.m_enabled;
};
oFF.OuCalcPanelItem.prototype.setupInternal = function(uniqueKey, id, technicalIdentifier, displayName, enabled, category, tooltip, parentId)
{
	if (oFF.XStringUtils.isNullOrEmpty(id))
	{
		throw oFF.XException.createIllegalArgumentException("id must not be null or empty!");
	}
	if (oFF.XStringUtils.isNullOrEmpty(technicalIdentifier))
	{
		throw oFF.XException.createIllegalArgumentException("Technical identifier must not be null or empty!");
	}
	this.m_uniqueKey = uniqueKey;
	this.m_id = id;
	this.m_technicalIdentifier = technicalIdentifier;
	this.m_displayName = displayName;
	this.m_parentId = parentId;
	this.m_enabled = enabled;
	this.m_category = category;
	this.m_tooltip = oFF.XOptional.ofNullable(tooltip);
};

oFF.OuDefaultQmSettings = function() {};
oFF.OuDefaultQmSettings.prototype = new oFF.XObject();
oFF.OuDefaultQmSettings.prototype._ff_c = "OuDefaultQmSettings";

oFF.OuDefaultQmSettings.COMMERCIAL_MINUS_ENABLED = "CommercialMinusEnabled";
oFF.OuDefaultQmSettings.CREATE_HANA_DEFAULT_MEASURE_FILTER = "CreateHanaDefaultMeasureFilter";
oFF.OuDefaultQmSettings.FREEZE_TABLE_HEADERS = "FreezeTableHeaders";
oFF.OuDefaultQmSettings.HANA_TOTAL_ALIGNMENT_TOP = "SetDefaultHanaTotalAlignmentTop";
oFF.OuDefaultQmSettings.LOAD_COMMENTING_DOCUMENTS = "LoadCommentingDocuments";
oFF.OuDefaultQmSettings.PREACTIVATE_HANA_DEFAULT_HIERARCHY = "PreActivateHanaDefaultHierarchy";
oFF.OuDefaultQmSettings.SETUP_BW_DEFAULT_KEY_TYPES = "SetupBWDefaultKeyTypes";
oFF.OuDefaultQmSettings.SETUP_HANA_DEFAULT_MEASURE_ATTRIBUTES = "SetupHanaDefaultMeasureAttributes";
oFF.OuDefaultQmSettings.SET_ACTIVE_NODE_ALIGNMENT_INHERIT = "SetAxisNodeAlignmentInherit";
oFF.OuDefaultQmSettings.SET_SYNCHRONIZED_AXIS_READMODES = "SetSynchronizedAxisReadModes";
oFF.OuDefaultQmSettings.SHOW_EXIT_WIDGET = "ShowExitWidget";
oFF.OuDefaultQmSettings.SHOW_QUERY_DETAILS = "ShowQueryDetails";
oFF.OuDefaultQmSettings.create = function(config)
{
	let instance = new oFF.OuDefaultQmSettings();
	instance.loadConfiguration(config);
	return instance;
};
oFF.OuDefaultQmSettings.prototype.m_axisNodeAlignmentInherit = false;
oFF.OuDefaultQmSettings.prototype.m_commercialMinusEnabled = false;
oFF.OuDefaultQmSettings.prototype.m_createHanaDefaultMeasureFilter = false;
oFF.OuDefaultQmSettings.prototype.m_defaultHanaTotalAlignmentTop = false;
oFF.OuDefaultQmSettings.prototype.m_freezeTableHeaders = false;
oFF.OuDefaultQmSettings.prototype.m_loadCommentingDocuments = false;
oFF.OuDefaultQmSettings.prototype.m_preActivateHanaDefaultHierarchy = false;
oFF.OuDefaultQmSettings.prototype.m_setupBwDefaultKeyTypes = false;
oFF.OuDefaultQmSettings.prototype.m_setupHanaDefaultMeasureAttributes = false;
oFF.OuDefaultQmSettings.prototype.m_showExitWidget = false;
oFF.OuDefaultQmSettings.prototype.m_showQueryDetails = false;
oFF.OuDefaultQmSettings.prototype.m_synchronizedAxisReadModes = false;
oFF.OuDefaultQmSettings.prototype.isCommercialMinusEnabled = function()
{
	return this.m_commercialMinusEnabled;
};
oFF.OuDefaultQmSettings.prototype.isCreateHanaDefaultMeasureFilter = function()
{
	return this.m_createHanaDefaultMeasureFilter;
};
oFF.OuDefaultQmSettings.prototype.isFreezeTableHeaders = function()
{
	return this.m_freezeTableHeaders;
};
oFF.OuDefaultQmSettings.prototype.isLoadCommentingDocuments = function()
{
	return this.m_loadCommentingDocuments;
};
oFF.OuDefaultQmSettings.prototype.isPreActivateHanaDefaultHierarchy = function()
{
	return this.m_preActivateHanaDefaultHierarchy;
};
oFF.OuDefaultQmSettings.prototype.isSetAxisNodeAlignmentInherit = function()
{
	return this.m_axisNodeAlignmentInherit;
};
oFF.OuDefaultQmSettings.prototype.isSetDefaultHanaTotalAlignmentTop = function()
{
	return this.m_defaultHanaTotalAlignmentTop;
};
oFF.OuDefaultQmSettings.prototype.isSetSynchronizedAxisReadModes = function()
{
	return this.m_synchronizedAxisReadModes;
};
oFF.OuDefaultQmSettings.prototype.isSetupBwDefaultKeyTypes = function()
{
	return this.m_setupBwDefaultKeyTypes;
};
oFF.OuDefaultQmSettings.prototype.isSetupHanaDefaultMeasureAttributes = function()
{
	return this.m_setupHanaDefaultMeasureAttributes;
};
oFF.OuDefaultQmSettings.prototype.isShowExitWidget = function()
{
	return this.m_showExitWidget;
};
oFF.OuDefaultQmSettings.prototype.isShowQueryDetails = function()
{
	return this.m_showQueryDetails;
};
oFF.OuDefaultQmSettings.prototype.loadConfiguration = function(config)
{
	if (oFF.notNull(config))
	{
		this.m_loadCommentingDocuments = config.getBooleanByKeyExt(oFF.OuDefaultQmSettings.LOAD_COMMENTING_DOCUMENTS, false);
		this.m_showQueryDetails = config.getBooleanByKeyExt(oFF.OuDefaultQmSettings.SHOW_QUERY_DETAILS, false);
		this.m_showExitWidget = config.getBooleanByKeyExt(oFF.OuDefaultQmSettings.SHOW_EXIT_WIDGET, false);
		this.m_commercialMinusEnabled = config.getBooleanByKeyExt(oFF.OuDefaultQmSettings.COMMERCIAL_MINUS_ENABLED, false);
		this.m_freezeTableHeaders = config.getBooleanByKeyExt(oFF.OuDefaultQmSettings.FREEZE_TABLE_HEADERS, true);
		this.m_createHanaDefaultMeasureFilter = config.getBooleanByKeyExt(oFF.OuDefaultQmSettings.CREATE_HANA_DEFAULT_MEASURE_FILTER, false);
		this.m_defaultHanaTotalAlignmentTop = config.getBooleanByKeyExt(oFF.OuDefaultQmSettings.HANA_TOTAL_ALIGNMENT_TOP, false);
		this.m_setupHanaDefaultMeasureAttributes = config.getBooleanByKeyExt(oFF.OuDefaultQmSettings.SETUP_HANA_DEFAULT_MEASURE_ATTRIBUTES, false);
		this.m_setupBwDefaultKeyTypes = config.getBooleanByKeyExt(oFF.OuDefaultQmSettings.SETUP_BW_DEFAULT_KEY_TYPES, false);
		this.m_preActivateHanaDefaultHierarchy = config.getBooleanByKeyExt(oFF.OuDefaultQmSettings.PREACTIVATE_HANA_DEFAULT_HIERARCHY, false);
		this.m_axisNodeAlignmentInherit = config.getBooleanByKeyExt(oFF.OuDefaultQmSettings.SET_ACTIVE_NODE_ALIGNMENT_INHERIT, false);
		this.m_synchronizedAxisReadModes = config.getBooleanByKeyExt(oFF.OuDefaultQmSettings.SET_SYNCHRONIZED_AXIS_READMODES, false);
	}
};

oFF.OrcaConstants = {

	DESC_1:"desc1",
	DESC_2:"desc2",
	DIMENSION_DISPLAY_INFO:"dimensionDisplayInfo",
	DIMENSION_ID:"dimensionId",
	DISPLAY_INFO_DESCRIPTION:"description",
	DISPLAY_INFO_ID:"id",
	DISPLAY_INFO_ID_AND_DESCRIPTION:"idAndDescription",
	DISPLAY_KEY:"displayKey",
	DISPLAY_NAME:"displayName",
	IS_INPUT_ENABLED:"isInputEnabled",
	IS_MANDATORY:"isMandatory",
	IS_USED_IN_DYNAMIC_FILTER:"isUsedInDynamicFilter",
	NAME:"name",
	OPERAND_1:"operand1",
	OPERAND_2:"operand2",
	OPERATOR:"operator",
	OPERATORS:"operators",
	SELECTED_DATA:"selectedData",
	SELECTION:"selection",
	SELECTION_MULTI:"multi",
	SELECTION_SINGLE:"single",
	SUPPORTS_MULTIPLE_VALUES:"supportsMultipleValues",
	URL_PARAM_AUTO_SUBMIT:"autoSubmit",
	URL_PARAM_AUTO_SUBMIT_WITH_VALUE:"autoSubmit=true",
	VALUE_DETAILS:"valueDetails",
	VALUE_TYPE:"valueType",
	VARIABLE_OBJ:"variableObj",
	VARIABLE_TYPE:"variableType",
	mapOrcaDisplayInfo:function(dimensionDisplayInfo, defaultDisplayInfo)
	{
			if (oFF.XStringUtils.isNotNullAndNotEmpty(dimensionDisplayInfo))
		{
			switch (dimensionDisplayInfo)
			{
				case oFF.OrcaConstants.DISPLAY_INFO_ID:
					return oFF.FilterDisplayInfo.ID;

				case oFF.OrcaConstants.DISPLAY_INFO_DESCRIPTION:
					return oFF.FilterDisplayInfo.DESCRIPTION;

				case oFF.OrcaConstants.DISPLAY_INFO_ID_AND_DESCRIPTION:
					return oFF.FilterDisplayInfo.ID_AND_DESCRIPTION;

				default:
					break;
			}
		}
		return defaultDisplayInfo;
	}
};

oFF.VdOrcaNativeParams = function() {};
oFF.VdOrcaNativeParams.prototype = new oFF.XObject();
oFF.VdOrcaNativeParams.prototype._ff_c = "VdOrcaNativeParams";

oFF.VdOrcaNativeParams.create = function()
{
	let params = new oFF.VdOrcaNativeParams();
	params.linkTooltips = oFF.XHashMapByString.create();
	params.linkage = oFF.XHashMapByString.create();
	params.linkSkipSubmit = oFF.XList.create();
	params.m_widgetLevelWarnings = oFF.XList.create();
	return params;
};
oFF.VdOrcaNativeParams.prototype.analyticApp = false;
oFF.VdOrcaNativeParams.prototype.analyticVarProcessor = null;
oFF.VdOrcaNativeParams.prototype.customStoryButtonText = null;
oFF.VdOrcaNativeParams.prototype.datasetVariables = null;
oFF.VdOrcaNativeParams.prototype.datasetVariablesButtonText = null;
oFF.VdOrcaNativeParams.prototype.datasetVariablesEditable = false;
oFF.VdOrcaNativeParams.prototype.dateDisplayFormat = null;
oFF.VdOrcaNativeParams.prototype.dimensionDisplayInfo = null;
oFF.VdOrcaNativeParams.prototype.disableExitVariables = false;
oFF.VdOrcaNativeParams.prototype.disableVariablePersistenceOptions = false;
oFF.VdOrcaNativeParams.prototype.displayFactory = null;
oFF.VdOrcaNativeParams.prototype.filterVariables = null;
oFF.VdOrcaNativeParams.prototype.forcePrompt = false;
oFF.VdOrcaNativeParams.prototype.forcePromptExec = false;
oFF.VdOrcaNativeParams.prototype.infoText = null;
oFF.VdOrcaNativeParams.prototype.isPlanningSequence = false;
oFF.VdOrcaNativeParams.prototype.isPublication = false;
oFF.VdOrcaNativeParams.prototype.isStoryUsingDynamicVariables = false;
oFF.VdOrcaNativeParams.prototype.isWidget = false;
oFF.VdOrcaNativeParams.prototype.isWidgetUsingDynamicVariables = false;
oFF.VdOrcaNativeParams.prototype.linkSkipSubmit = null;
oFF.VdOrcaNativeParams.prototype.linkTooltips = null;
oFF.VdOrcaNativeParams.prototype.linkVarHelper = null;
oFF.VdOrcaNativeParams.prototype.linkVarSubmitHandling = null;
oFF.VdOrcaNativeParams.prototype.linkage = null;
oFF.VdOrcaNativeParams.prototype.linkedModelsText = null;
oFF.VdOrcaNativeParams.prototype.linkedVariables = null;
oFF.VdOrcaNativeParams.prototype.m_widgetLevelWarnings = null;
oFF.VdOrcaNativeParams.prototype.preSetVariables = null;
oFF.VdOrcaNativeParams.prototype.preSetVariablesEditable = false;
oFF.VdOrcaNativeParams.prototype.presetVariablesButtonText = null;
oFF.VdOrcaNativeParams.prototype.presetVariablesSelected = false;
oFF.VdOrcaNativeParams.prototype.queryManager = null;
oFF.VdOrcaNativeParams.prototype.readOnly = false;
oFF.VdOrcaNativeParams.prototype.showChartVariables = false;
oFF.VdOrcaNativeParams.prototype.showVariantSection = false;
oFF.VdOrcaNativeParams.prototype.singleVariableKey = null;
oFF.VdOrcaNativeParams.prototype.storyEditable = false;
oFF.VdOrcaNativeParams.prototype.title = null;
oFF.VdOrcaNativeParams.prototype.useTableMessage = false;
oFF.VdOrcaNativeParams.prototype.varProcessor = null;
oFF.VdOrcaNativeParams.prototype.variablesToDisplay = null;
oFF.VdOrcaNativeParams.prototype.releaseObject = function()
{
	this.title = null;
	this.queryManager = null;
	this.varProcessor = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OuMeasureInputDataProvider = function() {};
oFF.OuMeasureInputDataProvider.prototype = new oFF.XObject();
oFF.OuMeasureInputDataProvider.prototype._ff_c = "OuMeasureInputDataProvider";

oFF.OuMeasureInputDataProvider.prototype.m_queryModel = null;
oFF.OuMeasureInputDataProvider.prototype.findMeasureByDisplayName = function(name)
{
	return oFF.XStream.of(this.getMeasures()).find((measure) => {
		let valueToTest = oFF.XString.replace(oFF.XString.replace(oFF.QueryPresentationUtils.DESCRIPTION.getDisplayValueByType(measure), "\r", ""), "\n", "");
		return oFF.XString.isEqual(name, valueToTest);
	});
};
oFF.OuMeasureInputDataProvider.prototype.findMeasureByName = function(name)
{
	return oFF.XStream.of(this.getMeasures()).find((measure) => {
		return oFF.XString.isEqual(name, measure.getName());
	});
};
oFF.OuMeasureInputDataProvider.prototype.getMeasures = function()
{
	let memberDimension = this.getMemberDimension();
	if (oFF.isNull(memberDimension))
	{
		return oFF.XList.create();
	}
	let dimensionMembers = memberDimension.getAllStructureMembers();
	return oFF.XStream.of(dimensionMembers).filter((member) => {
		return member.getResultVisibility() !== oFF.ResultVisibility.HIDDEN;
	}).collect(oFF.XStreamCollector.toList());
};
oFF.OuMeasureInputDataProvider.prototype.getOptionalDimension = function(dim)
{
	if (oFF.notNull(dim))
	{
		return oFF.XOptional.of(dim);
	}
	return oFF.XOptional.empty();
};
oFF.OuMeasureInputDataProvider.prototype.setupInternal = function(queryModel)
{
	oFF.XObjectExt.assertNotNullExt(queryModel, "Query model null");
	this.assertQueryModelType(queryModel);
	this.m_queryModel = queryModel;
};

oFF.OuMeasureInputDataProviderFactory = {

	create:function(queryModel)
	{
			if (queryModel.isUniversalAccountModel())
		{
			return oFF.OuMeasureInputDataProviderUAM.create(queryModel);
		}
		else if (queryModel.isAccountModel())
		{
			return oFF.OuMeasureInputDataProviderAccount.create(queryModel);
		}
		else
		{
			return oFF.OuMeasureInputDataProviderMeasureModel.create(queryModel);
		}
	},
	createWithStructure:function(queryModel, primaryStructure)
	{
			if (queryModel.isUniversalAccountModel())
		{
			return oFF.OuMeasureInputDataProviderUAM.createWithStructure(queryModel, primaryStructure);
		}
		else if (queryModel.isAccountModel())
		{
			return oFF.OuMeasureInputDataProviderAccount.create(queryModel);
		}
		else
		{
			return oFF.OuMeasureInputDataProviderMeasureModel.createWithStructure(queryModel, primaryStructure);
		}
	}
};

oFF.UiConvenienceCmdsMenuFactory = function() {};
oFF.UiConvenienceCmdsMenuFactory.prototype = new oFF.XObject();
oFF.UiConvenienceCmdsMenuFactory.prototype._ff_c = "UiConvenienceCmdsMenuFactory";

oFF.UiConvenienceCmdsMenuFactory.prototype.newInstance = function()
{
	return oFF.UiConvenienceCmdsMenu.create();
};

oFF.UiRedoButtonFactory = function() {};
oFF.UiRedoButtonFactory.prototype = new oFF.XObject();
oFF.UiRedoButtonFactory.prototype._ff_c = "UiRedoButtonFactory";

oFF.UiRedoButtonFactory.prototype.newInstance = function()
{
	return oFF.UiRedoButton.create();
};

oFF.UiUndoButtonFactory = function() {};
oFF.UiUndoButtonFactory.prototype = new oFF.XObject();
oFF.UiUndoButtonFactory.prototype._ff_c = "UiUndoButtonFactory";

oFF.UiUndoButtonFactory.prototype.newInstance = function()
{
	return oFF.UiUndoButton.create();
};

oFF.DialogGridParser = {

	DEFAULT_SEPARATOR_SYMBOLS:null,
	NEW_LINE_SYMBOL:"\n",
	TAB_SYMBOL:"\t",
	convertFromExcel:function(excelString)
	{
			let separatorStr = oFF.XStringUtils.concatenate2(oFF.DialogGridFormat.SEMICOLON.getSeparatorSymbol(), oFF.DialogGridFormat.SEMICOLON.getDecoratorSymbol());
		return oFF.XString.replace(excelString, oFF.DialogGridParser.TAB_SYMBOL, separatorStr);
	},
	convertToExcel:function(gridString)
	{
			let parsedString = oFF.XString.replace(oFF.DialogGridParser.removeSeparatorSpaces(gridString), oFF.DialogGridFormat.SEMICOLON.getSeparatorSymbol(), oFF.DialogGridParser.TAB_SYMBOL);
		parsedString = oFF.XString.replace(parsedString, oFF.DialogGridFormat.COMMA.getSeparatorSymbol(), oFF.DialogGridParser.TAB_SYMBOL);
		return parsedString;
	},
	deserialize:function(separatorSymbols, input)
	{
			let rows = oFF.XList.create();
		if (oFF.XStringUtils.isNullOrEmpty(input))
		{
			return rows;
		}
		let cursor = 0;
		let textEnd = oFF.XString.size(input);
		while (cursor < textEnd)
		{
			let lineEnd = textEnd;
			let breakLineIndex = oFF.XString.indexOfFrom(input, oFF.DialogGridParser.NEW_LINE_SYMBOL, cursor);
			if (breakLineIndex !== -1)
			{
				lineEnd = breakLineIndex;
			}
			let row = oFF.XList.create();
			while (cursor < lineEnd)
			{
				let wordEnd = lineEnd;
				for (let i = 0; i < separatorSymbols.size(); i++)
				{
					let index = oFF.XString.indexOfFrom(input, separatorSymbols.get(i), cursor);
					if (index !== -1)
					{
						wordEnd = oFF.XMath.min(wordEnd, index);
					}
				}
				let word = oFF.XString.trim(oFF.XString.substring(input, cursor, wordEnd));
				if (oFF.XStringUtils.isNotNullAndNotEmpty(word))
				{
					row.add(word);
				}
				cursor = wordEnd + 1;
			}
			rows.add(row);
			cursor = lineEnd + 1;
		}
		return rows;
	},
	deserializeWithDefault:function(input)
	{
			return oFF.DialogGridParser.deserialize(oFF.DialogGridParser.DEFAULT_SEPARATOR_SYMBOLS, input);
	},
	removeSeparatorSpaces:function(inputStr)
	{
			if (oFF.XStringUtils.isNullOrEmpty(inputStr))
		{
			return "";
		}
		let parsedStringBuf = oFF.XStringBuffer.create();
		parsedStringBuf.append(inputStr);
		let separatorSymbols = oFF.DialogGridParser.DEFAULT_SEPARATOR_SYMBOLS;
		for (let i = 0; i < separatorSymbols.size(); i++)
		{
			let separatorSymbol = separatorSymbols.get(i);
			let tmpInputString = parsedStringBuf.toString();
			let cursor = 0;
			let textEnd = oFF.XString.size(tmpInputString);
			parsedStringBuf.clear();
			while (cursor < textEnd)
			{
				let index = oFF.XString.indexOfFrom(tmpInputString, separatorSymbol, cursor);
				if (index !== -1)
				{
					let tmpString = oFF.XString.trim(oFF.XString.substring(tmpInputString, cursor, index));
					parsedStringBuf.append(tmpString);
					parsedStringBuf.append(separatorSymbol);
					cursor = index + 1;
				}
				else
				{
					parsedStringBuf.append(oFF.XString.trim(oFF.XString.substring(tmpInputString, cursor, textEnd)));
					cursor = textEnd;
				}
			}
		}
		return parsedStringBuf.toString();
	},
	serialize:function(separatorSymbol, decoratorSymbol, rows)
	{
			let buffer = oFF.XStringBuffer.create();
		let rowCount = rows.size();
		for (let r = 0; r < rowCount; r++)
		{
			let row = rows.get(r);
			let wordCount = row.size();
			for (let w = 0; w < wordCount; w++)
			{
				buffer.append(row.get(w));
				if (w + 1 < wordCount)
				{
					buffer.append(separatorSymbol).append(decoratorSymbol);
				}
			}
			if (r + 1 < rowCount)
			{
				buffer.append(oFF.DialogGridParser.NEW_LINE_SYMBOL);
			}
		}
		return buffer.toString();
	},
	serializeWithFormat:function(format, rows)
	{
			return oFF.DialogGridParser.serialize(format.getSeparatorSymbol(), format.getDecoratorSymbol(), rows);
	},
	staticSetup:function()
	{
			oFF.DialogGridParser.DEFAULT_SEPARATOR_SYMBOLS = oFF.XList.create();
		oFF.DialogGridParser.DEFAULT_SEPARATOR_SYMBOLS.add(oFF.DialogGridFormat.COMMA.getSeparatorSymbol());
		oFF.DialogGridParser.DEFAULT_SEPARATOR_SYMBOLS.add(oFF.DialogGridFormat.SEMICOLON.getSeparatorSymbol());
		oFF.DialogGridParser.DEFAULT_SEPARATOR_SYMBOLS.add(oFF.DialogGridFormat.EXCEL.getSeparatorSymbol());
	}
};

oFF.OlapUiDimensionUtil = {

	getMember:function(component)
	{
			if (!oFF.OlapUiDimensionUtil.isMember(component))
		{
			return null;
		}
		let node = oFF.OlapUiDimensionUtil.getMemberNode(component);
		if (oFF.notNull(node))
		{
			return node.getDimensionMember();
		}
		return component;
	},
	getMemberNode:function(component)
	{
			if (oFF.notNull(component) && component.getOlapComponentType().isTypeOf(oFF.MemberType.TUPLE_ELEMENT))
		{
			return component;
		}
		return null;
	},
	isAttribute:function(modelComponent)
	{
			return oFF.notNull(modelComponent) && !modelComponent.isReleased() && modelComponent.getOlapComponentType().isTypeOf(oFF.OlapComponentType.ATTRIBUTE);
	},
	isDimension:function(modelComponent)
	{
			return oFF.notNull(modelComponent) && !modelComponent.isReleased() && modelComponent.getOlapComponentType().isTypeOf(oFF.OlapComponentType.ABSTRACT_DIMENSION);
	},
	isMember:function(modelComponent)
	{
			return oFF.notNull(modelComponent) && !modelComponent.isReleased() && modelComponent.getOlapComponentType().isTypeOf(oFF.MemberType.ABSTRACT_MEMBER) && modelComponent.getDimension() !== null;
	},
	isMemberNode:function(modelComponent)
	{
			return oFF.notNull(modelComponent) && !modelComponent.isReleased() && modelComponent.getOlapComponentType().isTypeOf(oFF.MemberType.TUPLE_ELEMENT);
	}
};

oFF.OlapUiFeatureToggle = {

	DATA_ANALYZER_HIGHLIGHT_MEMBER_CELLS:"Sac.FF_DATA_ANALYZER_TABLE_MEMBER_HIGHLIGHTING",
	DATA_ANALYZER_READ_ONLY_MODE:"Sac.FF_DATA_ANALYZER_READ_MODE",
	DATA_ANALYZER_STORY_LINKAGE_V1:"Sac.FF_DATA_ANALYZER_STORY_LINKAGE_V1",
	DATA_ANALYZER_TABLE_MIXED_UNITS:"Sac.FF_DATA_ANALYZER_TABLE_MIXED_UNITS",
	MA_SUPPORT_BI_USER:"Sac.MULTI_ACTIONS_SUPPORT_BI_USER",
	MEMBERSELECTOR_STORY_FILTER_OPTIMIZATION_FOR_DESKTOP:"Sac.ABSTRACTION_API_MEMBERSELECTOR_STORY_FILTER_OPTIMIZATION_FOR_DESKTOP",
	VD_ALIGN_BW_HANA_DYNAMIC_VARIABLES:"Sac.FF_VARIABLE_DIALOG_ALIGN_BW_HANA_DYNAMIC_VARIABLES",
	VD_REDESIGN_MORE_SETTINGS:"Sac.FF_VARIABLE_DIALOG_REDESIGN_MORE_SETTINGS",
	VD_REDESIGN_PHASE2:"Sac.FF_VARIABLE_DIALOG_REDESIGN_PHASE2",
	VD_REDESIGN_PHASE2_EMBEDDED:"Sac.FF_VARIABLE_DIALOG_REDESIGN_PHASE2_EMBEDDED"
};

oFF.OlapUiMultiRequestHelper = function() {};
oFF.OlapUiMultiRequestHelper.prototype = new oFF.XObject();
oFF.OlapUiMultiRequestHelper.prototype._ff_c = "OlapUiMultiRequestHelper";

oFF.OlapUiMultiRequestHelper.createRequestHelper = function(originalListener, originalObject)
{
	let obj = new oFF.OlapUiMultiRequestHelper();
	obj.setupHelper(originalListener, originalObject);
	return obj;
};
oFF.OlapUiMultiRequestHelper.prototype.m_callbackCount = 0;
oFF.OlapUiMultiRequestHelper.prototype.m_errorResult = null;
oFF.OlapUiMultiRequestHelper.prototype.m_inStartup = false;
oFF.OlapUiMultiRequestHelper.prototype.m_originalListener = null;
oFF.OlapUiMultiRequestHelper.prototype.m_originalObject = null;
oFF.OlapUiMultiRequestHelper.prototype.m_requestCount = 0;
oFF.OlapUiMultiRequestHelper.prototype.finishProgress = function()
{
	this.m_inStartup = false;
};
oFF.OlapUiMultiRequestHelper.prototype.getErrorResult = function()
{
	return this.m_errorResult;
};
oFF.OlapUiMultiRequestHelper.prototype.getOriginalListener = function()
{
	return this.m_originalListener;
};
oFF.OlapUiMultiRequestHelper.prototype.getOriginalObject = function()
{
	return this.m_originalObject;
};
oFF.OlapUiMultiRequestHelper.prototype.getRequestCount = function()
{
	return this.m_requestCount;
};
oFF.OlapUiMultiRequestHelper.prototype.increaseCallbackCount = function()
{
	this.m_callbackCount = this.m_callbackCount + 1;
};
oFF.OlapUiMultiRequestHelper.prototype.increaseRequestCount = function()
{
	this.m_requestCount = this.m_requestCount + 1;
};
oFF.OlapUiMultiRequestHelper.prototype.isDone = function()
{
	return !this.isInStartup() && this.m_callbackCount >= this.m_requestCount;
};
oFF.OlapUiMultiRequestHelper.prototype.isInStartup = function()
{
	return this.m_inStartup;
};
oFF.OlapUiMultiRequestHelper.prototype.releaseObject = function()
{
	this.m_originalListener = null;
	this.m_originalObject = null;
	this.m_errorResult = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OlapUiMultiRequestHelper.prototype.setErrorResult = function(errorResult)
{
	this.m_errorResult = errorResult;
};
oFF.OlapUiMultiRequestHelper.prototype.setupHelper = function(listener, customIdentifier)
{
	this.m_originalListener = listener;
	this.m_originalObject = customIdentifier;
	this.m_inStartup = true;
};

oFF.OlapUiValueHelpNodeComparator = function() {};
oFF.OlapUiValueHelpNodeComparator.prototype = new oFF.XObject();
oFF.OlapUiValueHelpNodeComparator.prototype._ff_c = "OlapUiValueHelpNodeComparator";

oFF.OlapUiValueHelpNodeComparator.create = function(isHierarchy)
{
	let obj = new oFF.OlapUiValueHelpNodeComparator();
	obj.m_isHierarchy = isHierarchy;
	return obj;
};
oFF.OlapUiValueHelpNodeComparator.prototype.m_isHierarchy = false;
oFF.OlapUiValueHelpNodeComparator.prototype.compare = function(o1, o2)
{
	let fieldValue1 = this.getKeyFieldValue(o1).getValue();
	let fieldValue2 = this.getKeyFieldValue(o2).getValue();
	if (fieldValue1.getValueType().isNumber())
	{
		let comparison = oFF.XConverterUtils.getDouble(fieldValue1) - oFF.XConverterUtils.getDouble(fieldValue2);
		return comparison < 0 ? -1 : comparison > 0 ? 1 : 0;
	}
	return oFF.XString.compare(fieldValue1.getStringRepresentation(), fieldValue2.getStringRepresentation());
};
oFF.OlapUiValueHelpNodeComparator.prototype.getKeyFieldValue = function(node)
{
	let keyField = this.m_isHierarchy ? node.getDimension().getHierarchyKeyField() : node.getDimension().getFlatKeyField();
	return node.getDimensionMember().getFieldValue(keyField);
};

oFF.OlapUiMessageCenter = {

	getInaErrorCode:function(messages)
	{
			if (oFF.notNull(messages))
		{
			let firstError = messages.getFirstError();
			if (oFF.notNull(firstError))
			{
				return firstError.getCode();
			}
		}
		return 0;
	},
	getInaErrorMessage:function(messages, defaultMessage)
	{
			if (oFF.notNull(messages) && messages.getServerStatusCode() === oFF.HttpStatusCode.SC_OK)
		{
			let firstError = messages.getFirstError();
			if (oFF.notNull(firstError) && oFF.XStringUtils.isNotNullAndNotEmpty(firstError.getText()))
			{
				return firstError.getText();
			}
		}
		return defaultMessage;
	}
};

oFF.QueryDesignerUtils = {

	canBeAggregated:function(dimension)
	{
			let dimensionType = dimension.getDimensionType();
		if (dimensionType.isTypeOf(oFF.DimensionType.CALCULATED_DIMENSION))
		{
			return true;
		}
		if (dimension.getModelCapabilities().supportsCustomDimension2MemberMetadata() && dimension.isStructure() && !dimension.isMeasureStructure())
		{
			return true;
		}
		let isVersionDimension = dimension.getQueryModel().getVersionDimension() === dimension;
		let isSecondaryStructure = dimensionType.isTypeOf(oFF.DimensionType.SECONDARY_STRUCTURE);
		return dimension.canBeAggregated() && !isVersionDimension && !isSecondaryStructure;
	},
	canBeRemoved:function(dimension)
	{
			if (!oFF.QueryDesignerUtils.canBeAggregated(dimension))
		{
			let visibleByFilter = dimension.getConvenienceCommands().getMemberVisibilityByFilter(dimension);
			let includeList = visibleByFilter.getFirstObject();
			return includeList.size() === 1;
		}
		return true;
	},
	createFilterFromLists:function(dim, includeList, excludeList)
	{
			dim.getQueryManager().queueEventing();
		let dynamicFilter = dim.getQueryModel().getFilter().getDynamicFilter();
		let cartesianProduct = dynamicFilter.getCartesianProduct();
		if (oFF.isNull(cartesianProduct))
		{
			cartesianProduct = oFF.QFactory.createFilterCartesianProduct(dynamicFilter);
			dynamicFilter.setCartesianProduct(cartesianProduct);
		}
		cartesianProduct.removeByDimensionName(dim.getName());
		if (!oFF.XCollectionUtils.hasElements(includeList) && !oFF.XCollectionUtils.hasElements(excludeList))
		{
			dim.getQueryManager().resumeEventing();
			return;
		}
		let cartesianList = cartesianProduct.getCartesianListWithDefault(dim);
		cartesianList.setHierarchyInfo(dim.isHierarchyActive() ? dim.getHierarchyName() : null, dim.getHierarchyDueDate(), dim.getHierarchyVersion());
		for (let i = 0; i < includeList.size(); i++)
		{
			let includeElement = cartesianList.addNewCartesianElement();
			includeElement.setComparisonOperator(oFF.ComparisonOperator.EQUAL);
			includeElement.getLow().setDimensionMember(dim.getDimensionMember(includeList.get(i)));
		}
		for (let j = 0; j < excludeList.size(); j++)
		{
			let excludeElement = cartesianList.addNewCartesianElement();
			excludeElement.setComparisonOperator(oFF.ComparisonOperator.EQUAL);
			excludeElement.setSetSign(oFF.SetSign.EXCLUDING);
			excludeElement.getLow().setDimensionMember(dim.getDimensionMember(excludeList.get(j)));
		}
		dim.getQueryManager().resumeEventing();
	},
	getMembersOfDimensions:function(dimensions)
	{
			let result = oFF.XHashMapByString.create();
		let promises = oFF.XPromiseList.create();
		for (let i = 0; i < dimensions.size(); i++)
		{
			let dimension = dimensions.get(i);
			promises.add(dimension.getMemberManager().getMembers());
			result.put(dimension.getName(), oFF.XListOfNameObject.create());
		}
		return oFF.XPromise.allSettled(promises).then((list) => {
			for (let j = 0; j < list.size(); j++)
			{
				if (promises.get(j).getState() === oFF.XPromiseState.FULFILLED)
				{
					let promiseResult = list.get(j);
					let values = promiseResult.getValue();
					if (oFF.XCollectionUtils.hasElements(values))
					{
						result.put(values.get(0).getDimension().getName(), values);
					}
				}
			}
			return result;
		}, null);
	},
	getOppositeAxis:function(axisType)
	{
			return axisType === oFF.AxisType.ROWS ? oFF.AxisType.COLUMNS : oFF.AxisType.ROWS;
	},
	getStructureDimensions:function(queryModel)
	{
			let measureDimension = queryModel.getMeasureDimension();
		let secondStructure = queryModel.getDimensionByType(oFF.DimensionType.SECONDARY_STRUCTURE);
		let accountDimension = queryModel.getAccountDimension();
		let dimensions = oFF.XList.create();
		oFF.XCollectionUtils.addIfNotNull(dimensions, measureDimension);
		oFF.XCollectionUtils.addIfNotNull(dimensions, secondStructure);
		oFF.XCollectionUtils.addIfNotNull(dimensions, accountDimension);
		return dimensions;
	},
	openSingleMemberFilterDialog:function(application, title, dimension, listener)
	{
			let runner = oFF.FilterDialogProgramRunnerFactory.createForDimensionFilter(application.getProcess(), dimension.getQueryManager(), dimension.getName(), title);
		let config = oFF.PrFactory.createStructure();
		config.putBoolean(oFF.FilterDialog.PARAM_SELECTION_REQUIRED, true);
		runner.setConfigStructure(config);
		runner.getProgramStartData().putXObject(oFF.FilterDialog.PRG_DATA_LISTENER_CLOSE, listener);
		runner.runProgram();
	},
	removeDimension:function(dimension)
	{
			if (!dimension.supportsAxis(oFF.AxisType.FREE))
		{
			return;
		}
		if (oFF.QueryDesignerUtils.canBeRemoved(dimension))
		{
			oFF.QueryDesignerUtils.removeDimensionInternal(dimension);
		}
	},
	removeDimensionInternal:function(dimension)
	{
			let cmd = dimension.getConvenienceCommands();
		cmd.clearNonMainFieldsFromResultSet(null, dimension.getName());
		cmd.moveDimensionToFree(dimension.getName());
		cmd.removeInvalidSortOperations();
		cmd.removeInvalidClientConditions();
	},
	setFilterForDimension:function(dim, allMembers, selectedMembers)
	{
			let empty = oFF.XList.create();
		if (allMembers.size() === selectedMembers.size())
		{
			oFF.QueryDesignerUtils.createFilterFromLists(dim, empty, empty);
			return;
		}
		if (selectedMembers.size() === 0)
		{
			let allExclude = oFF.XStream.of(allMembers).collect(oFF.XStreamCollector.toListOfString((m) => {
				return m.getDimensionMember().getName();
			}));
			oFF.QueryDesignerUtils.createFilterFromLists(dim, empty, allExclude);
			return;
		}
		selectedMembers.sortByDirection(oFF.XSortDirection.ASCENDING);
		if (!dim.isHierarchyActive())
		{
			oFF.QueryDesignerUtils.setFilterForDimensionFlat(dim, allMembers, selectedMembers);
		}
		else
		{
			let include = oFF.XList.create();
			let exclude = oFF.XList.create();
			for (let i = 0; i < allMembers.size(); i++)
			{
				let node = allMembers.get(i);
				if (node.getParentNode() !== null)
				{
					continue;
				}
				let visible = false;
				if (selectedMembers.containsKey(node.getDimensionMember().getName()))
				{
					visible = true;
					include.add(node.getDimensionMember().getName());
				}
				oFF.QueryDesignerUtils.setFilterForDimensionHierarchical(node.getChildren(), selectedMembers, include, exclude, visible);
			}
			oFF.QueryDesignerUtils.createFilterFromLists(dim, include, exclude);
		}
	},
	setFilterForDimensionFlat:function(dim, allMembers, selectedMembers)
	{
			let includeList = oFF.XList.create();
		let excludeList = oFF.XList.create();
		let lessThanHalfIncluded = selectedMembers.size() <= allMembers.size() / 2;
		if (lessThanHalfIncluded)
		{
			oFF.XCollectionUtils.forEach(selectedMembers, (v) => {
				includeList.add(v.getName());
			});
		}
		else
		{
			for (let i = 0; i < allMembers.size(); i++)
			{
				let node = allMembers.get(i);
				if (!selectedMembers.containsKey(node.getDimensionMember().getName()))
				{
					excludeList.add(node.getDimensionMember().getName());
				}
			}
			let customMembers = dim.getCustomStructureMembers().getIterator();
			while (customMembers.hasNext())
			{
				let customMember = customMembers.next();
				if (customMember.getResultVisibility() !== null && customMember.getResultVisibility().isTypeOf(oFF.ResultVisibility.HIDDEN))
				{
					excludeList.add(customMember.getName());
				}
			}
		}
		oFF.QueryDesignerUtils.createFilterFromLists(dim, includeList, excludeList);
	},
	setFilterForDimensionHierarchical:function(nodes, selection, include, exclude, parentVisible)
	{
			if (!oFF.XCollectionUtils.hasElements(nodes))
		{
			return;
		}
		for (let i = 0; i < nodes.size(); i++)
		{
			let node = nodes.get(i);
			let selfVisible = selection.contains(node);
			if (!parentVisible && selfVisible)
			{
				include.add(node.getDimensionMember().getName());
			}
			else if (parentVisible && !selfVisible)
			{
				exclude.add(node.getDimensionMember().getName());
			}
			oFF.QueryDesignerUtils.setFilterForDimensionHierarchical(node.getChildren(), selection, include, exclude, selfVisible);
		}
	},
	setMemberOrder:function(dimension, structureLayout)
	{
			let order = oFF.XStream.of(structureLayout).collect(oFF.XStreamCollector.toListOfString((input) => {
			return input.getDimensionMember().getName();
		}));
		let sortingManager = dimension.getQueryModel().getSortingManager();
		sortingManager.removeDimensionSorting(dimension);
		sortingManager.removeFieldSorting(dimension.getKeyField());
		sortingManager.applyCustomSort(dimension, dimension.getKeyField(), order, oFF.XSortDirection.ASCENDING, oFF.CustomSortPosition.TOP, true);
	},
	supportsMemberSort:function(dimension)
	{
			let capabilities = dimension.getModelCapabilities();
		return capabilities.supportsCustomSort() || capabilities.supportsCustomMeasureSortOrder() && dimension.isMeasureStructure() || capabilities.supportsCustomMemberKeySortOrder() && !dimension.isMeasureStructure() || capabilities.supportsCustomSortingExtended() && dimension.isStructure();
	}
};

oFF.OlapUiDisplayFactory = function() {};
oFF.OlapUiDisplayFactory.prototype = new oFF.XObject();
oFF.OlapUiDisplayFactory.prototype._ff_c = "OlapUiDisplayFactory";

oFF.OlapUiDisplayFactory.createFactoryForDialog = function(uiManager)
{
	let obj = new oFF.OlapUiDisplayFactory();
	obj.setupFactory(oFF.DialogDisplayMode.DIALOG, uiManager, null, null);
	return obj;
};
oFF.OlapUiDisplayFactory.createFactoryForNavigation = function(uiManager, root)
{
	let obj = new oFF.OlapUiDisplayFactory();
	obj.setupFactory(oFF.DialogDisplayMode.NAVIGATION, uiManager, root, null);
	return obj;
};
oFF.OlapUiDisplayFactory.createFactoryForPage = function(page)
{
	let obj = new oFF.OlapUiDisplayFactory();
	obj.setupFactory(oFF.DialogDisplayMode.PAGE, null, null, page);
	return obj;
};
oFF.OlapUiDisplayFactory.prototype.m_container = null;
oFF.OlapUiDisplayFactory.prototype.m_mode = null;
oFF.OlapUiDisplayFactory.prototype.m_page = null;
oFF.OlapUiDisplayFactory.prototype.m_uiManager = null;
oFF.OlapUiDisplayFactory.prototype.getInstance = function()
{
	if (this.m_mode === oFF.DialogDisplayMode.NAVIGATION)
	{
		let page = this.m_container.pushNewPage();
		return oFF.OlapUiNavigationHandle.createNavigationHandle(this.m_container, page);
	}
	if (this.m_mode === oFF.DialogDisplayMode.PAGE)
	{
		return oFF.OlapUiPageHandle.createPageHandle(this.m_page);
	}
	return oFF.OlapUiDialogHandle.createDialogHandle(this.m_uiManager.newControl(oFF.UiType.DIALOG));
};
oFF.OlapUiDisplayFactory.prototype.releaseObject = function()
{
	this.m_mode = null;
	this.m_uiManager = null;
	this.m_container = oFF.XObjectExt.release(this.m_container);
	this.m_page = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OlapUiDisplayFactory.prototype.setupFactory = function(mode, uiManager, genesis, customPage)
{
	this.m_mode = mode;
	this.m_uiManager = uiManager;
	if (mode === oFF.DialogDisplayMode.NAVIGATION)
	{
		if (oFF.notNull(this.m_uiManager))
		{
			this.m_container = this.m_uiManager.newControl(oFF.UiType.NAVIGATION_CONTAINER);
			this.m_container.useMaxSpace();
			genesis.setRoot(this.m_container);
		}
	}
	if (mode === oFF.DialogDisplayMode.PAGE)
	{
		this.m_page = customPage;
	}
};

oFF.ComplexFilterApplicationUtil = {

	LAYER_COMPLEX_FILTER_MISC:"MiscComplexFilter",
	clearComplexContextFilter:function(queryModel)
	{
			let filter = oFF.isNull(queryModel) ? null : queryModel.getFilter();
		if (oFF.notNull(filter))
		{
			filter.linkFilter(oFF.ComplexFilterApplicationUtil.LAYER_COMPLEX_FILTER_MISC, null);
		}
	},
	getOrCreateUnbalancedTupleFilter:function(queryModel, setSign)
	{
			let filter = oFF.isNull(queryModel) ? null : queryModel.getFilter();
		let filterOr = null;
		if (oFF.notNull(filter))
		{
			let expression = filter.getLinkedFilter(oFF.ComplexFilterApplicationUtil.LAYER_COMPLEX_FILTER_MISC);
			if (oFF.isNull(expression))
			{
				expression = oFF.QFactory.createFilterExpression(queryModel.getContext(), filter);
				expression.setPreserveOnRepoSerialization(true);
				filter.linkFilter(oFF.ComplexFilterApplicationUtil.LAYER_COMPLEX_FILTER_MISC, expression);
			}
			let filterRootElement = expression.getFilterRootElement();
			if (setSign === oFF.SetSign.INCLUDING)
			{
				if (oFF.notNull(filterRootElement) && filterRootElement.getOlapComponentType() === oFF.FilterComponentType.OR)
				{
					filterOr = filterRootElement;
					filterOr.clear();
				}
				else
				{
					filterOr = oFF.QFactory.createFilterOr(queryModel);
					expression.setComplexRoot(filterOr);
				}
			}
			else
			{
				if (oFF.notNull(filterRootElement) && filterRootElement.getOlapComponentType() === oFF.FilterComponentType.NOT)
				{
					let subRoot = filterRootElement.getChild();
					if (oFF.notNull(subRoot) && subRoot.getOlapComponentType() === oFF.FilterComponentType.OR)
					{
						filterOr = subRoot;
						filterOr.clear();
					}
				}
				else
				{
					let notFilter = oFF.QFactory.createFilterNot(queryModel);
					filterOr = oFF.QFactory.createFilterOr(queryModel);
					notFilter.setChild(filterOr);
					expression.setComplexRoot(notFilter);
				}
			}
		}
		return filterOr;
	},
	setupComplexContextFilter:function(queryModel, triggerTupleElements, setSign)
	{
			let orFilter = oFF.ComplexFilterApplicationUtil.getOrCreateUnbalancedTupleFilter(queryModel, setSign);
		for (let i = 0; i < triggerTupleElements.size(); i++)
		{
			let tupleElement = triggerTupleElements.get(i);
			let firstTuple = tupleElement.getFirstTuple();
			let andFilter = oFF.QFactory.createFilterAnd(queryModel);
			for (let j = 0; j < firstTuple.size(); j++)
			{
				let subTupleElement = firstTuple.getTupleElementAt(j);
				let subTupleDimension = subTupleElement.getDimension();
				if (!subTupleDimension.isStructure())
				{
					let operation = oFF.QFactory.createFilterOperation(queryModel.getContext(), subTupleDimension.getKeyField());
					operation.setConvertToFlatFilter(true);
					if (subTupleDimension.isHierarchyActive())
					{
						operation.setHierarchyInfo(subTupleDimension.getHierarchyName(), subTupleDimension.getHierarchyDueDate(), subTupleDimension.getHierarchyVersion());
					}
					let member = subTupleElement.getDimensionMember();
					operation.getLow().setDimensionMember(member);
					let isNullValue = member.getDimensionMemberNameValueException() === oFF.ValueException.NULL_VALUE;
					operation.setComparisonOperator(isNullValue ? oFF.ComparisonOperator.IS_NULL : oFF.ComparisonOperator.EQUAL);
					andFilter.add(operation);
				}
				if (subTupleElement === tupleElement)
				{
					break;
				}
			}
			orFilter.add(andFilter);
		}
	}
};

oFF.MemberFilterApplicationUtil = {

	addDimensionMemberFilter:function(dynamicFilter, dimension, memberName, setSign, origDimension, origMember)
	{
			let success = false;
		let cartesianList = dynamicFilter.getCartesianProduct().getCartesianList(dimension);
		if (oFF.notNull(cartesianList))
		{
			cartesianList.setHierarchyInfo(dimension.isHierarchyActive() ? dimension.getHierarchyName() : null, dimension.getHierarchyDueDate(), dimension.getHierarchyVersion());
			if (setSign === oFF.SetSign.EXCLUDING && oFF.XCollectionUtils.hasElements(cartesianList))
			{
				let presentElement = oFF.XStream.of(cartesianList).find((fce) => {
					return fce.getSetSign() === oFF.SetSign.INCLUDING && oFF.XString.isEqual(fce.getLow().getString(), memberName);
				});
				if (presentElement.isPresent())
				{
					cartesianList.removeElement(presentElement.get());
				}
			}
			if (oFF.MemberFilterApplicationUtil.checkDimensionFilterCapabilityForSignAndOperator(dimension, setSign, oFF.ComparisonOperator.EQUAL))
			{
				let cartesianElement = cartesianList.addNewCartesianElement();
				let isNullValue = origMember.getDimensionMemberNameValueException() === oFF.ValueException.NULL_VALUE;
				cartesianElement.setComparisonOperator(isNullValue ? oFF.ComparisonOperator.IS_NULL : oFF.ComparisonOperator.EQUAL);
				let textFieldOrig = origDimension.getTextField();
				let displayKeyFieldOrig = origDimension.getDisplayKeyField();
				let textField = dimension.getTextField();
				let displayKeyField = dimension.getDisplayKeyField();
				cartesianElement.setSetSign(setSign);
				let fieldValue;
				if (oFF.notNull(textFieldOrig) && oFF.notNull(textField))
				{
					fieldValue = origMember.getFieldValue(textFieldOrig);
					if (oFF.notNull(fieldValue) && fieldValue.hasValue())
					{
						cartesianList.addSupplementField(textField);
						cartesianElement.getLow().addSupplementValue(textField.getName(), fieldValue.getValue().getStringRepresentation());
					}
				}
				if (oFF.notNull(displayKeyFieldOrig) && oFF.notNull(displayKeyField))
				{
					fieldValue = origMember.getFieldValue(displayKeyFieldOrig);
					if (oFF.notNull(fieldValue) && fieldValue.hasValue())
					{
						cartesianList.addSupplementField(displayKeyField);
						let supplementValue = displayKeyFieldOrig.getValueType().isDateTime() && fieldValue.getFormattedValue() !== null ? fieldValue.getFormattedValue() : fieldValue.getValue().getStringRepresentation();
						cartesianElement.getLow().addSupplementValue(displayKeyFieldOrig.getName(), supplementValue);
					}
				}
				if (dimension === origDimension)
				{
					cartesianElement.getLow().setDimensionMember(origMember);
				}
				else
				{
					cartesianElement.getLow().setValue(oFF.XStringValue.create(memberName));
				}
				success = true;
			}
		}
		return success;
	},
	checkDimensionFilterCapabilityForSignAndOperator:function(dimension, setSign, operator)
	{
			let capabilities = oFF.isNull(dimension) ? null : dimension.getFilterCapabilities();
		let fieldCapabilities = oFF.isNull(capabilities) ? null : capabilities.getFilterCapabilitiesByField(dimension.getKeyField());
		let supportedOperators = oFF.isNull(fieldCapabilities) ? null : fieldCapabilities.getSupportedComparisonOperators(setSign);
		return oFF.notNull(supportedOperators) && supportedOperators.contains(operator);
	},
	filterOnSelection:function(queryModel, dimensionMembers, setSign, drill, exchangeDimension)
	{
			let i;
		let cmd = queryModel.getConvenienceCommands();
		let dimension;
		let axisType = null;
		let udhKey;
		let dgDim;
		let dynamicFilter = queryModel.getFilter().getDynamicFilter();
		dynamicFilter.queueEventing();
		for (i = 0; i < dimensionMembers.size(); i++)
		{
			let checkMember = dimensionMembers.get(i);
			dimension = checkMember.getDimension();
			if (dimension.isUniversalDisplayHierarchyDimension())
			{
				udhKey = checkMember.getUdhKey();
				if (oFF.notNull(udhKey))
				{
					dgDim = queryModel.getDimensionByName(udhKey.getDrillGroupDimensionName());
					oFF.MemberFilterApplicationUtil.removeDimensionMemberFilter(dynamicFilter, dgDim, setSign);
				}
			}
			else
			{
				oFF.MemberFilterApplicationUtil.removeDimensionMemberFilter(dynamicFilter, dimension, setSign);
			}
		}
		let index = -1;
		let affectedDimensions = oFF.XList.create();
		for (i = 0; i < dimensionMembers.size(); i++)
		{
			let member = dimensionMembers.get(i);
			dimension = member.getDimension();
			if (dimension.isUniversalDisplayHierarchyDimension())
			{
				udhKey = member.getUdhKey();
				if (oFF.notNull(udhKey))
				{
					dgDim = queryModel.getDimensionByName(udhKey.getDrillGroupDimensionName());
					if (oFF.MemberFilterApplicationUtil.addDimensionMemberFilter(dynamicFilter, dgDim, udhKey.getHierarchyKey(), setSign, dimension, member))
					{
						oFF.XCollectionUtils.addIfNotPresent(affectedDimensions, dgDim);
					}
				}
			}
			else if (oFF.MemberFilterApplicationUtil.addDimensionMemberFilter(dynamicFilter, dimension, member.getName(), setSign, dimension, member))
			{
				oFF.XCollectionUtils.addIfNotPresent(affectedDimensions, dimension);
			}
		}
		if (drill && oFF.XCollectionUtils.hasElements(affectedDimensions))
		{
			for (i = 0; i < affectedDimensions.size(); i++)
			{
				dimension = affectedDimensions.get(i);
				if (index === -1)
				{
					index = dimension.getAxis().getIndex(dimension);
				}
				else
				{
					index = oFF.XMath.min(index, dimension.getAxis().getIndex(dimension));
				}
				axisType = dimension.getAxisType();
				if ((dimension.getAxisType() === oFF.AxisType.ROWS || dimension.getAxisType() === oFF.AxisType.COLUMNS) && dimension.supportsAxis(oFF.AxisType.FREE))
				{
					cmd.clearNonMainFieldsFromResultSet(null, dimension.getName());
					cmd.moveDimensionToAxis(dimension.getName(), oFF.AxisType.FREE);
					cmd.removeInvalidSortOperations();
				}
			}
			if (oFF.notNull(exchangeDimension) && oFF.notNull(axisType))
			{
				cmd.moveDimensionOnAxisTo(exchangeDimension.getName(), axisType, index);
			}
		}
		dynamicFilter.resumeEventing();
	},
	isMemberFilterable:function(queryModel, member, setSign)
	{
			let dimension = member.getDimension();
		let actualDimension = null;
		let actualMemberName;
		if (dimension.isUniversalDisplayHierarchyDimension())
		{
			let udhKey = member.getUdhKey();
			if (oFF.notNull(udhKey))
			{
				let actualDimensionName = udhKey.getDrillGroupDimensionName();
				actualMemberName = udhKey.getHierarchyKey();
				actualDimension = dimension.getQueryModel().getDimensionByName(actualDimensionName);
			}
			else
			{
				actualMemberName = null;
			}
		}
		else
		{
			actualDimension = dimension;
			actualMemberName = member.getName();
		}
		let cartesianList;
		if (oFF.notNull(actualDimension) && !actualDimension.isHierarchyActive() && setSign === oFF.SetSign.EXCLUDING)
		{
			let cartesianProduct = queryModel.getFilter().getDynamicFilter().getCartesianProduct();
			cartesianList = oFF.isNull(cartesianProduct) ? null : cartesianProduct.getCartesianList(actualDimension);
			if (oFF.XCollectionUtils.hasElements(cartesianList))
			{
				if (oFF.XStream.of(cartesianList).find((el) => {
					return el.getSetSign() === oFF.SetSign.INCLUDING && oFF.XString.isEqual(el.getLow().getString(), actualMemberName);
				}).isPresent())
				{
					return true;
				}
			}
		}
		let filterCapabilities = oFF.isNull(actualDimension) ? null : actualDimension.getFilterCapabilities();
		let filterCapabilityByField = oFF.isNull(filterCapabilities) ? null : filterCapabilities.getFilterCapabilitiesByField(actualDimension.getKeyField());
		let supportedCompOperators = oFF.isNull(filterCapabilityByField) ? null : filterCapabilityByField.getSupportedComparisonOperators(setSign);
		return oFF.notNull(supportedCompOperators) && supportedCompOperators.contains(oFF.ComparisonOperator.EQUAL);
	},
	removeDimensionMemberFilter:function(dynamicFilter, dimension, setSign)
	{
			if (oFF.MemberFilterApplicationUtil.checkDimensionFilterCapabilityForSignAndOperator(dimension, setSign, oFF.ComparisonOperator.EQUAL))
		{
			let filterLambda = (fe) => {
				return fe.getSetSign() === oFF.SetSign.INCLUDING;
			};
			let cartesianList = dynamicFilter.getCartesianProductWithDefault().getCartesianListWithDefault(dimension);
			if (setSign === oFF.SetSign.INCLUDING)
			{
				oFF.XCollectionUtils.removeIf(cartesianList, filterLambda);
			}
		}
	}
};

oFF.OuHorizonDataSpaceConventions = {

	CUSTOM_PROVIDER_KEY_TAG:"OuHorizonDataSpaceConventions.customProviderKey",
	SPACE_ALL_PROVIDER_IDS:"allProviderIds",
	addDataProvider:function(dataSpace, dataProvider)
	{
			let dataProviderKey = oFF.OuHorizonDataSpaceConventions.getDataProviderKey(dataProvider);
		dataSpace.putXObject(dataProviderKey, dataProvider);
		let allProviderIds = oFF.OuHorizonDataSpaceConventions.getAllDataProviderIdsInternal(dataSpace);
		allProviderIds.add(dataProviderKey);
		dataSpace.putXObject(oFF.OuHorizonDataSpaceConventions.SPACE_ALL_PROVIDER_IDS, allProviderIds);
	},
	addDataProviderWithKey:function(dataSpace, dataProvider, dataProviderKey)
	{
			dataProvider.getTagging().put(oFF.OuHorizonDataSpaceConventions.CUSTOM_PROVIDER_KEY_TAG, dataProviderKey);
		dataSpace.putXObject(dataProviderKey, dataProvider);
		let allProviderIds = oFF.OuHorizonDataSpaceConventions.getAllDataProviderIdsInternal(dataSpace);
		allProviderIds.add(dataProviderKey);
		dataSpace.putXObject(oFF.OuHorizonDataSpaceConventions.SPACE_ALL_PROVIDER_IDS, allProviderIds);
	},
	getAllDataProvider:function(dataSpace)
	{
			let allProviderIds = oFF.OuHorizonDataSpaceConventions.getAllDataProviderIds(dataSpace);
		return oFF.XStream.ofString(allProviderIds).map((providerId) => {
			return dataSpace.getXObjectByKey(providerId.getString());
		}).collect(oFF.XStreamCollector.toList());
	},
	getAllDataProviderIds:function(dataSpace)
	{
			return oFF.OuHorizonDataSpaceConventions.getAllDataProviderIdsInternal(dataSpace);
	},
	getAllDataProviderIdsInternal:function(dataSpace)
	{
			let allIds = dataSpace.getXObjectByKey(oFF.OuHorizonDataSpaceConventions.SPACE_ALL_PROVIDER_IDS);
		if (oFF.notNull(allIds))
		{
			return allIds;
		}
		return oFF.XHashSetOfString.create();
	},
	getDataProvider:function(dataSpace, providerId)
	{
			let allDataProviderIds = oFF.OuHorizonDataSpaceConventions.getAllDataProviderIds(dataSpace);
		if (allDataProviderIds.contains(providerId))
		{
			return dataSpace.getXObjectByKey(providerId);
		}
		return null;
	},
	getDataProviderKey:function(dataProvider)
	{
			let customKey = dataProvider.getTagging().getByKey(oFF.OuHorizonDataSpaceConventions.CUSTOM_PROVIDER_KEY_TAG);
		if (oFF.XStringUtils.isNotNullAndNotEmpty(customKey))
		{
			return customKey;
		}
		return dataProvider.getInstanceId();
	},
	isDataProviderExisting:function(dataSpace, providerId)
	{
			return oFF.OuHorizonDataSpaceConventions.getDataProvider(dataSpace, providerId) !== null;
	},
	removeDataProvider:function(dataSpace, dataProvider)
	{
			let dataProviderKey = oFF.OuHorizonDataSpaceConventions.getDataProviderKey(dataProvider);
		dataSpace.putXObject(dataProviderKey, null);
		let allProviderIds = oFF.OuHorizonDataSpaceConventions.getAllDataProviderIdsInternal(dataSpace);
		allProviderIds.removeElement(dataProviderKey);
		dataSpace.putXObject(oFF.OuHorizonDataSpaceConventions.SPACE_ALL_PROVIDER_IDS, allProviderIds);
	},
	setDataProviderKey:function(dataProvider, dataProviderKey)
	{
			dataProvider.getTagging().put(oFF.OuHorizonDataSpaceConventions.CUSTOM_PROVIDER_KEY_TAG, dataProviderKey);
	}
};

oFF.OlapUiValueHelpAbstract = function() {};
oFF.OlapUiValueHelpAbstract.prototype = new oFF.XObject();
oFF.OlapUiValueHelpAbstract.prototype._ff_c = "OlapUiValueHelpAbstract";

oFF.OlapUiValueHelpAbstract.s_syncType = null;
oFF.OlapUiValueHelpAbstract.prototype.m_defaultDrillEnabled = false;
oFF.OlapUiValueHelpAbstract.prototype.m_nullText = null;
oFF.OlapUiValueHelpAbstract.prototype.m_useResultSetTextField = false;
oFF.OlapUiValueHelpAbstract.prototype.m_valueRequestObject = null;
oFF.OlapUiValueHelpAbstract.prototype.addNullFilter = function(searchPattern, readMode)
{
	if (oFF.notNull(this.m_nullText) && oFF.XStringUtils.isNotNullAndNotEmpty(searchPattern) && oFF.notNull(readMode) && oFF.XString.containsString(this.m_nullText, oFF.XString.toLowerCase(searchPattern)))
	{
		let filterCapabilities = this.getDimension().getFilterCapabilities();
		let filterCapability = oFF.notNull(filterCapabilities) ? filterCapabilities.getFilterCapabilitiesByField(this.getDisplayKeyField()) : null;
		if (oFF.notNull(filterCapability) && oFF.XCollectionUtils.containsElement(filterCapability.getSupportedComparisonOperatorsForValueHelpAndReadMode(oFF.SetSign.INCLUDING, readMode), oFF.ComparisonOperator.IS_NULL))
		{
			let filter = this.getDimension().getSelectorContainer().getCartesianListByField(this.getDisplayKeyField());
			if (oFF.notNull(filter))
			{
				filter.addNewCartesianElement().setComparisonOperator(oFF.ComparisonOperator.IS_NULL);
				return true;
			}
		}
	}
	return false;
};
oFF.OlapUiValueHelpAbstract.prototype.configureFetchItems = function(dimension, readMode, items, fields)
{
	this.configureValueHelp(dimension, readMode, 0, -1, 0, fields, false);
	let keys = oFF.XStream.of(items).filter((item) => {
		return item.isNull() || item.getKey() !== null;
	}).collect(oFF.XStreamCollector.toListOfString((item) => {
		return item.isNull() ? null : item.getKey();
	}));
	let displayKeys = oFF.XStream.of(items).filter((item) => {
		return !item.isNull() && item.getKey() === null && item.getDisplayKey() !== null;
	}).collect(oFF.XStreamCollector.toListOfString((item) => {
		return item.getDisplayKey();
	}));
	return dimension.addSelectorFilterForSpecificKeys(keys, displayKeys);
};
oFF.OlapUiValueHelpAbstract.prototype.configureValueHelp = function(dimension, readMode, startPage, endPage, pageSize, fields, defaultDrill)
{
	dimension.clearSelectorSettings();
	dimension.setSelectorHierarchy(this.isHierarchicalValueHelp(), this.getHierarchyName(), this.m_defaultDrillEnabled && defaultDrill ? dimension.getDefaultInitialDrillLevel() : 0);
	dimension.setReadModeGraceful(this.getContextType(), readMode);
	let start = startPage * pageSize;
	let end = endPage === -1 ? endPage : start + (endPage - startPage + 1) * pageSize;
	dimension.setSelectorPaging(start, end);
	dimension.setSelectorCustomTextField(this.m_useResultSetTextField ? this.getTextField() : null);
	dimension.setSelectorFields(fields, this.requestDefaultKeyAndTextFields(dimension));
};
oFF.OlapUiValueHelpAbstract.prototype.getContextType = function()
{
	return oFF.QContextType.SELECTOR;
};
oFF.OlapUiValueHelpAbstract.prototype.getDisplayKeyField = function()
{
	let dimension = this.getDimension();
	return this.isHierarchicalValueHelp() ? dimension.getHierarchyDisplayKeyField() : dimension.getFlatDisplayKeyField();
};
oFF.OlapUiValueHelpAbstract.prototype.getKeyField = function()
{
	let dimension = this.getDimension();
	return this.isHierarchicalValueHelp() ? dimension.getHierarchyKeyField() : dimension.getFlatKeyField();
};
oFF.OlapUiValueHelpAbstract.prototype.getSystemType = function(dimension)
{
	let systemDescription = dimension.getApplication().getSystemLandscape().getSystemDescription(dimension.getDataSource().getSystemName());
	return oFF.notNull(systemDescription) ? systemDescription.getSystemType() : oFF.SystemType.GENERIC;
};
oFF.OlapUiValueHelpAbstract.prototype.getTextField = function()
{
	let dimension = this.getDimension();
	if (this.m_useResultSetTextField)
	{
		return oFF.QDimensionUtil.getTextFieldUsedInResultSet(dimension, this.isHierarchicalValueHelp());
	}
	return this.isHierarchicalValueHelp() ? dimension.getHierarchyTextField() : dimension.getFlatTextField();
};
oFF.OlapUiValueHelpAbstract.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_valueRequestObject = null;
};
oFF.OlapUiValueHelpAbstract.prototype.requestDefaultKeyAndTextFields = function(dimension)
{
	return true;
};
oFF.OlapUiValueHelpAbstract.prototype.setDefaultDrillLevelEnabled = function(defaultEnabled)
{
	this.m_defaultDrillEnabled = defaultEnabled;
};
oFF.OlapUiValueHelpAbstract.prototype.setNullText = function(nullText)
{
	this.m_nullText = oFF.XString.toLowerCase(nullText);
};
oFF.OlapUiValueHelpAbstract.prototype.setUseResultSetTextField = function(useResultSetTextField)
{
	this.m_useResultSetTextField = useResultSetTextField;
};
oFF.OlapUiValueHelpAbstract.prototype.setupExt = function(valueRequestObject)
{
	this.m_valueRequestObject = valueRequestObject;
	if (oFF.isNull(oFF.OlapUiValueHelpAbstract.s_syncType))
	{
		oFF.OlapUiValueHelpAbstract.s_syncType = oFF.SyncType.NON_BLOCKING;
	}
};
oFF.OlapUiValueHelpAbstract.prototype.supportsAdditionalPresentations = function()
{
	return true;
};

oFF.OlapUiValueHelpKeyObject = function() {};
oFF.OlapUiValueHelpKeyObject.prototype = new oFF.XObject();
oFF.OlapUiValueHelpKeyObject.prototype._ff_c = "OlapUiValueHelpKeyObject";

oFF.OlapUiValueHelpKeyObject.create = function(key, displayKey, isNull)
{
	let object = new oFF.OlapUiValueHelpKeyObject();
	object.m_key = key;
	object.m_displayKey = displayKey;
	object.m_isNull = isNull;
	return object;
};
oFF.OlapUiValueHelpKeyObject.prototype.m_displayKey = null;
oFF.OlapUiValueHelpKeyObject.prototype.m_isNull = false;
oFF.OlapUiValueHelpKeyObject.prototype.m_key = null;
oFF.OlapUiValueHelpKeyObject.prototype.getDisplayKey = function()
{
	return this.m_displayKey;
};
oFF.OlapUiValueHelpKeyObject.prototype.getKey = function()
{
	return this.m_key;
};
oFF.OlapUiValueHelpKeyObject.prototype.hasDisplayKey = function()
{
	return oFF.notNull(this.m_displayKey);
};
oFF.OlapUiValueHelpKeyObject.prototype.isNull = function()
{
	return this.m_isNull;
};
oFF.OlapUiValueHelpKeyObject.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_key = null;
	this.m_displayKey = null;
};

oFF.OuDesignerViewConfiguration = function() {};
oFF.OuDesignerViewConfiguration.prototype = new oFF.XObject();
oFF.OuDesignerViewConfiguration.prototype._ff_c = "OuDesignerViewConfiguration";

oFF.OuDesignerViewConfiguration.createConfig = function(application)
{
	let obj = new oFF.OuDesignerViewConfiguration();
	obj.setupConfig(application);
	return obj;
};
oFF.OuDesignerViewConfiguration.getFormulaItems = function()
{
	let formulaItems = oFF.XList.create();
	formulaItems.add(oFF.FeOperators.ADDITION);
	formulaItems.add(oFF.FeOperators.SUBTRACTION);
	formulaItems.add(oFF.FeOperators.MULTIPLICATION);
	formulaItems.add(oFF.FeOperators.DIVISION);
	formulaItems.add(oFF.FeOperators.POWER);
	formulaItems.add(oFF.FeFunctions.DECFLOAT);
	formulaItems.add(oFF.FeFunctions.INT);
	formulaItems.add(oFF.FeFunctions.ISNULL);
	formulaItems.add(oFF.FeFunctions.NOT);
	formulaItems.add(oFF.FeFunctions.IF);
	formulaItems.add(oFF.FeFunctions.ABS);
	formulaItems.add(oFF.FeFunctions.EXP);
	formulaItems.add(oFF.FeFunctions.SQRT);
	formulaItems.add(oFF.FeFunctions.GRAND_TOTAL);
	formulaItems.add(oFF.FeFunctions.PERCENTAGE_OF_GRAND_TOTAL);
	formulaItems.add(oFF.FeFunctions.MOD);
	formulaItems.add(oFF.FeFunctions.POWER);
	formulaItems.add(oFF.FeFunctions.LOG);
	formulaItems.add(oFF.FeFunctions.LOG10);
	formulaItems.add(oFF.FeFunctions.CEIL);
	formulaItems.add(oFF.FeFunctions.TRUNC);
	formulaItems.add(oFF.FeFunctions.DOUBLE);
	formulaItems.add(oFF.FeFunctions.ROUND);
	formulaItems.add(oFF.FeFunctions.FLOAT);
	formulaItems.add(oFF.FeFunctions.FLOOR);
	formulaItems.add(oFF.FeFunctions.DATEDIFF);
	formulaItems.add(oFF.FeFunctions.MIN);
	formulaItems.add(oFF.FeFunctions.MAX);
	formulaItems.add(oFF.FeFunctions.RESTRICT);
	formulaItems.add(oFF.FeFunctions.SUBSTRING);
	formulaItems.add(oFF.FeFunctions.LENGTH);
	formulaItems.add(oFF.FeFunctions.LIKE);
	formulaItems.add(oFF.FeFunctions.TONUMBER);
	formulaItems.add(oFF.FeFunctions.UPPERCASE);
	formulaItems.add(oFF.FeFunctions.LOWERCASE);
	formulaItems.add(oFF.FeFunctions.TOTEXT);
	formulaItems.add(oFF.FeFunctions.FINDINDEX);
	formulaItems.add(oFF.FeFunctions.ENDSWITH);
	formulaItems.add(oFF.FeFunctions.RUNNING_AGGREGATION);
	formulaItems.add(oFF.FeFunctions.ACCOUNT_LOOKUP);
	formulaItems.add(oFF.FeFunctions.MEASURE_LOOKUP);
	formulaItems.add(oFF.FeConditions.AND);
	formulaItems.add(oFF.FeConditions.OR);
	formulaItems.add(oFF.FeConditions.EQUAL);
	formulaItems.add(oFF.FeConditions.NOT_EQUAL);
	formulaItems.add(oFF.FeConditions.GREATER_THAN);
	formulaItems.add(oFF.FeConditions.GREATER_THAN_EQUAL);
	formulaItems.add(oFF.FeConditions.LESS_THAN);
	formulaItems.add(oFF.FeConditions.LESS_THAN_EQUAL);
	return formulaItems;
};
oFF.OuDesignerViewConfiguration.prototype.m_application = null;
oFF.OuDesignerViewConfiguration.prototype.m_calculationsEnabled = false;
oFF.OuDesignerViewConfiguration.prototype.m_calculationsGenAiEnabled = false;
oFF.OuDesignerViewConfiguration.prototype.m_calculationsOnSecondaryStructEnabled = false;
oFF.OuDesignerViewConfiguration.prototype.m_dragElementTag = null;
oFF.OuDesignerViewConfiguration.prototype.m_fireVizChangedEvent = false;
oFF.OuDesignerViewConfiguration.prototype.m_isChartingEnabled = false;
oFF.OuDesignerViewConfiguration.prototype.m_isChartingEnabledOnAccounts = false;
oFF.OuDesignerViewConfiguration.prototype.m_isChartingNewTypesEnabled = false;
oFF.OuDesignerViewConfiguration.prototype.m_isChartingPhase_3Enabled = false;
oFF.OuDesignerViewConfiguration.prototype.m_menuProvider = null;
oFF.OuDesignerViewConfiguration.prototype.m_messageCenter = null;
oFF.OuDesignerViewConfiguration.prototype.m_presentation = null;
oFF.OuDesignerViewConfiguration.prototype.m_rightClickContextMenuForAttributeEnabled = false;
oFF.OuDesignerViewConfiguration.prototype.m_rightClickContextMenuForDimensionEnabled = false;
oFF.OuDesignerViewConfiguration.prototype.m_rightClickContextMenuForMemberEnabled = false;
oFF.OuDesignerViewConfiguration.prototype.m_useExistingVisualizations = false;
oFF.OuDesignerViewConfiguration.prototype.getApplication = function()
{
	return this.m_application;
};
oFF.OuDesignerViewConfiguration.prototype.getDefaultPresentation = function()
{
	return this.m_presentation;
};
oFF.OuDesignerViewConfiguration.prototype.getDragElementTag = function()
{
	return this.m_dragElementTag;
};
oFF.OuDesignerViewConfiguration.prototype.getMenuProvider = function()
{
	return this.m_menuProvider;
};
oFF.OuDesignerViewConfiguration.prototype.getMessageCenter = function()
{
	return this.m_messageCenter;
};
oFF.OuDesignerViewConfiguration.prototype.getSupportedDisplayTypes = function()
{
	let allSupportedTypes = oFF.XList.create();
	allSupportedTypes.add(oFF.OuAxesViewDisplayType.GRID);
	allSupportedTypes.add(oFF.OuAxesViewDisplayType.BAR);
	allSupportedTypes.add(oFF.OuAxesViewDisplayType.COLUMN);
	allSupportedTypes.add(oFF.OuAxesViewDisplayType.STACKED_BAR);
	allSupportedTypes.add(oFF.OuAxesViewDisplayType.STACKED_COLUMN);
	allSupportedTypes.add(oFF.OuAxesViewDisplayType.LINE);
	if (this.isChartingNewTypesEnabled())
	{
		allSupportedTypes.add(oFF.OuAxesViewDisplayType.STACKED_AREA);
		allSupportedTypes.add(oFF.OuAxesViewDisplayType.COLUMN_LINE);
		allSupportedTypes.add(oFF.OuAxesViewDisplayType.STACKED_COLUMN_LINE);
	}
	allSupportedTypes.add(oFF.OuAxesViewDisplayType.PIE);
	allSupportedTypes.add(oFF.OuAxesViewDisplayType.DOUGHNUT);
	return allSupportedTypes;
};
oFF.OuDesignerViewConfiguration.prototype.isCalculationsEnabled = function()
{
	return this.m_calculationsEnabled;
};
oFF.OuDesignerViewConfiguration.prototype.isCalculationsGenAiEnabled = function()
{
	return this.m_calculationsGenAiEnabled;
};
oFF.OuDesignerViewConfiguration.prototype.isCalculationsOnSecondaryStructEnabled = function()
{
	return this.m_calculationsOnSecondaryStructEnabled;
};
oFF.OuDesignerViewConfiguration.prototype.isChartingEnabled = function()
{
	return this.m_isChartingEnabled;
};
oFF.OuDesignerViewConfiguration.prototype.isChartingNewTypesEnabled = function()
{
	return this.m_isChartingNewTypesEnabled;
};
oFF.OuDesignerViewConfiguration.prototype.isChartingPhase2Enabled = function()
{
	return this.m_isChartingEnabledOnAccounts;
};
oFF.OuDesignerViewConfiguration.prototype.isChartingPhase_3Enabled = function()
{
	return this.m_isChartingPhase_3Enabled;
};
oFF.OuDesignerViewConfiguration.prototype.isRightClickContextMenuForAttributeEnabled = function()
{
	return this.m_rightClickContextMenuForAttributeEnabled;
};
oFF.OuDesignerViewConfiguration.prototype.isRightClickContextMenuForDimensionEnabled = function()
{
	return this.m_rightClickContextMenuForDimensionEnabled;
};
oFF.OuDesignerViewConfiguration.prototype.isRightClickContextMenuForMemberEnabled = function()
{
	return this.m_rightClickContextMenuForMemberEnabled;
};
oFF.OuDesignerViewConfiguration.prototype.releaseObject = function()
{
	this.m_application = null;
	this.m_presentation = null;
	this.m_menuProvider = null;
	this.m_messageCenter = null;
	this.m_dragElementTag = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OuDesignerViewConfiguration.prototype.setCalculationsEnabled = function(calculationsEnabled)
{
	this.m_calculationsEnabled = calculationsEnabled;
};
oFF.OuDesignerViewConfiguration.prototype.setCalculationsGenAiEnabled = function(calculationsGenAiEnabled)
{
	this.m_calculationsGenAiEnabled = calculationsGenAiEnabled;
};
oFF.OuDesignerViewConfiguration.prototype.setCalculationsOnSecondaryStructEnabled = function(calculationsOnSecondaryStructEnabled)
{
	this.m_calculationsOnSecondaryStructEnabled = calculationsOnSecondaryStructEnabled;
};
oFF.OuDesignerViewConfiguration.prototype.setChartingEnabled = function(isChartingEnabled)
{
	this.m_isChartingEnabled = isChartingEnabled;
};
oFF.OuDesignerViewConfiguration.prototype.setChartingNewTypesEnabled = function(isChartingNewTypesEnabled)
{
	this.m_isChartingNewTypesEnabled = isChartingNewTypesEnabled;
};
oFF.OuDesignerViewConfiguration.prototype.setChartingPhase2Enabled = function(isChartingEnabledOnAccounts)
{
	this.m_isChartingEnabledOnAccounts = isChartingEnabledOnAccounts;
};
oFF.OuDesignerViewConfiguration.prototype.setChartingPhase_3Enabled = function(isChartingPhase_3Enabled)
{
	this.m_isChartingPhase_3Enabled = isChartingPhase_3Enabled;
};
oFF.OuDesignerViewConfiguration.prototype.setDefaultPresentation = function(presentation)
{
	this.m_presentation = presentation;
};
oFF.OuDesignerViewConfiguration.prototype.setDragElementTag = function(dragElementTag)
{
	this.m_dragElementTag = dragElementTag;
};
oFF.OuDesignerViewConfiguration.prototype.setFireVisualizationChangedEvent = function(fireVizChangedEvent)
{
	this.m_fireVizChangedEvent = fireVizChangedEvent;
};
oFF.OuDesignerViewConfiguration.prototype.setMenuProvider = function(menuProvider)
{
	this.m_menuProvider = menuProvider;
};
oFF.OuDesignerViewConfiguration.prototype.setMessageCenter = function(m_messageCenter)
{
	this.m_messageCenter = m_messageCenter;
};
oFF.OuDesignerViewConfiguration.prototype.setRightClickContextMenuForAttributeEnabled = function(rightClickContextMenuForAttributeEnabled)
{
	this.m_rightClickContextMenuForAttributeEnabled = rightClickContextMenuForAttributeEnabled;
};
oFF.OuDesignerViewConfiguration.prototype.setRightClickContextMenuForDimensionEnabled = function(rightClickContextMenuForDimensionEnabled)
{
	this.m_rightClickContextMenuForDimensionEnabled = rightClickContextMenuForDimensionEnabled;
};
oFF.OuDesignerViewConfiguration.prototype.setRightClickContextMenuForMemberEnabled = function(rightClickContextMenuForMemberEnabled)
{
	this.m_rightClickContextMenuForMemberEnabled = rightClickContextMenuForMemberEnabled;
};
oFF.OuDesignerViewConfiguration.prototype.setUseExistingVisualizations = function(useExistingVisualizations)
{
	this.m_useExistingVisualizations = useExistingVisualizations;
};
oFF.OuDesignerViewConfiguration.prototype.setupConfig = function(application)
{
	this.m_application = application;
	this.m_presentation = oFF.QueryPresentationUtils.DESCRIPTION;
};
oFF.OuDesignerViewConfiguration.prototype.shouldFireVisualizationChangedEvent = function()
{
	return this.m_fireVizChangedEvent;
};
oFF.OuDesignerViewConfiguration.prototype.shouldUseExistingVisualizations = function()
{
	return this.m_useExistingVisualizations;
};

oFF.OuGridAxesController = function() {};
oFF.OuGridAxesController.prototype = new oFF.XObject();
oFF.OuGridAxesController.prototype._ff_c = "OuGridAxesController";

oFF.OuGridAxesController.createController = function()
{
	return new oFF.OuGridAxesController();
};
oFF.OuGridAxesController.moveModel = function(model, insertIndex, currentOrder)
{
	if (insertIndex >= 0 && insertIndex < currentOrder.size())
	{
		let currentIndex = currentOrder.getIndex(model);
		if (currentIndex >= 0)
		{
			currentOrder.removeAt(currentIndex);
		}
		currentOrder.insert(insertIndex, model);
	}
	else
	{
		currentOrder.removeElement(model);
		currentOrder.add(model);
	}
};
oFF.OuGridAxesController.prototype.m_memberResults = null;
oFF.OuGridAxesController.prototype.m_queryManager = null;
oFF.OuGridAxesController.prototype.addMember = function(node)
{
	this.updateMemberFilter(node, true);
};
oFF.OuGridAxesController.prototype.addOrRemoveChildrenIfAny = function(node, includedMembers, include)
{
	if (node.hasChildren())
	{
		let children = node.getChildren();
		for (let i = 0; i < children.size(); i++)
		{
			let child = children.get(i);
			if (include)
			{
				includedMembers.add(child);
			}
			else
			{
				includedMembers.removeElement(child);
			}
			this.addOrRemoveChildrenIfAny(child, includedMembers, include);
		}
	}
};
oFF.OuGridAxesController.prototype.allowDropBetween = function(dim)
{
	let isStructureMember = dim.isStructure();
	let hierarchyActive = dim.isHierarchyActive();
	let supportsSort = oFF.QueryDesignerUtils.supportsMemberSort(dim);
	return supportsSort && isStructureMember && !hierarchyActive;
};
oFF.OuGridAxesController.prototype.fetchMembers = function()
{
	let queryModel = this.m_queryManager.getQueryModel();
	let structures = oFF.QueryDesignerUtils.getStructureDimensions(queryModel);
	let promiseList = oFF.XStream.of(structures).map((structure) => {
		return structure.getMemberManager().getMemberResult().onThen((result) => {
			this.m_memberResults.put(structure.getName(), result);
		});
	}).collect(oFF.XPromiseList.toPromiseList());
	let allPromise = oFF.XPromise.all(promiseList);
	allPromise.onCatch((err) => {
		oFF.XLogger.printError(err.getText());
		this.m_memberResults = oFF.XHashMapByString.create();
	});
	return allPromise;
};
oFF.OuGridAxesController.prototype.getMemberVisibility = function(dimension)
{
	let members = this.getMembersByDimension(dimension);
	let convenienceCommands = this.m_queryManager.getConvenienceCommands();
	let visibleMembers = convenienceCommands.getVisibleMembers(dimension, members);
	for (let i = 0; i < members.size(); i++)
	{
		let node = members.get(i);
		if (node.getDimensionMember().getResultVisibility() === oFF.ResultVisibility.HIDDEN)
		{
			visibleMembers.removeElement(node.getDimensionMember().getName());
		}
	}
	return visibleMembers;
};
oFF.OuGridAxesController.prototype.getMembersByDimension = function(dim)
{
	return this.m_memberResults.getByKey(dim.getName()).getAllNodes();
};
oFF.OuGridAxesController.prototype.getMembersInOrder = function(dimension)
{
	let members = this.getMembersByDimension(dimension);
	if (!oFF.XCollectionUtils.hasElements(members))
	{
		return oFF.XListOfNameObject.create();
	}
	if (dimension.getDimensionType() === oFF.DimensionType.ACCOUNT || dimension.isHierarchyActive())
	{
		return members;
	}
	let convenienceCommands = this.m_queryManager.getConvenienceCommands();
	let memberOrder = convenienceCommands.getMembersInResultSetOrder(dimension);
	return oFF.XStream.of(memberOrder).map((member) => {
		return members.getByKey(member.getString());
	}).collect(oFF.XStreamCollector.toListOfNameObject());
};
oFF.OuGridAxesController.prototype.getQueryManager = function()
{
	return this.m_queryManager;
};
oFF.OuGridAxesController.prototype.getVisibleMemberNodesInOrder = function(dim)
{
	let members = this.getMembersByDimension(dim);
	if (!oFF.XCollectionUtils.hasElements(members))
	{
		return null;
	}
	let convenienceCommands = this.m_queryManager.getConvenienceCommands();
	let visibleMembers = convenienceCommands.getVisibleMembers(dim, members);
	if (dim.getDimensionType() === oFF.DimensionType.ACCOUNT)
	{
		return oFF.XStream.of(members).filter((a2) => {
			return visibleMembers.contains(a2.getName()) && a2.getDimensionMember().getResultVisibility() !== oFF.ResultVisibility.HIDDEN;
		}).collect(oFF.XStreamCollector.toListOfNameObject());
	}
	else
	{
		let memberOrder = convenienceCommands.getMembersInResultSetOrder(dim);
		return oFF.XStream.of(memberOrder).filter((m) => {
			return visibleMembers.contains(m.getName()) && m.getResultVisibility() !== oFF.ResultVisibility.HIDDEN;
		}).map((m2) => {
			return members.getByKey(m2.getName());
		}).collect(oFF.XStreamCollector.toListOfNameObject());
	}
};
oFF.OuGridAxesController.prototype.handleAttributeDrop = function(event, attribute, axisType)
{
	let draggedControl = event.getDraggedControl();
	if (event.getDroppedControl() === draggedControl)
	{
		return;
	}
	let dimension = attribute.getDimension();
	let attributes = dimension.getResultSetAttributes();
	let dropIndex = oFF.OuDesignerDragDropUtilities.calcDropIndex(event);
	if (oFF.notNull(axisType))
	{
		this.moveDimensionToIndex(dimension, axisType, dropIndex);
		oFF.OuGridAxesController.moveModel(attribute, -1, attributes);
	}
	else
	{
		oFF.OuGridAxesController.moveModel(attribute, dropIndex + 1, attributes);
	}
};
oFF.OuGridAxesController.prototype.handleDimDrop = function(event, dim, targetAxis)
{
	let draggedControl = event.getDraggedControl();
	if (event.getDroppedControl() === draggedControl)
	{
		return;
	}
	this.moveDimensionToIndex(dim, targetAxis, oFF.OuDesignerDragDropUtilities.calcDropIndex(event));
};
oFF.OuGridAxesController.prototype.handleMemberDrop = function(event, node, axisType)
{
	let draggedControl = event.getDraggedControl();
	if (event.getDroppedControl() === draggedControl)
	{
		return;
	}
	let dimension = node.getDimension();
	let dropIndex = oFF.OuDesignerDragDropUtilities.calcDropIndexForStructureMemberDrop(event, dimension, axisType);
	if (oFF.notNull(axisType))
	{
		this.moveDimensionToIndex(dimension, axisType, dropIndex);
		this.moveMemberToIndex(node, -1);
	}
	else
	{
		this.moveMemberToIndex(node, dropIndex);
	}
};
oFF.OuGridAxesController.prototype.moveDimensionToIndex = function(dim, axisType, index)
{
	let axis = this.m_queryManager.getQueryModel().getAxis(axisType);
	let axisChanged = axisType !== dim.getAxisType();
	oFF.OuGridAxesController.moveModel(dim, index, axis);
	if (axisChanged)
	{
		dim.getConvenienceCommands().moveSortToPosition(oFF.SortType.ABSTRACT_DIMENSION_SORT, dim.getName(), 0);
	}
};
oFF.OuGridAxesController.prototype.moveMemberToIndex = function(node, index)
{
	this.updateMemberFilter(node, true);
	let dim = node.getDimension();
	if (this.allowDropBetween(dim))
	{
		let layout = this.getVisibleMemberNodesInOrder(dim);
		oFF.OuGridAxesController.moveModel(node, index, layout);
		oFF.QueryDesignerUtils.setMemberOrder(dim, layout);
	}
};
oFF.OuGridAxesController.prototype.releaseObject = function()
{
	this.m_queryManager = null;
	this.m_memberResults = oFF.XObjectExt.release(this.m_memberResults);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OuGridAxesController.prototype.removeAllMembers = function(dimension)
{
	let allMembers = this.getMembersByDimension(dimension);
	oFF.QueryDesignerUtils.setFilterForDimension(dimension, allMembers, oFF.XListOfNameObject.create());
};
oFF.OuGridAxesController.prototype.removeAttribute = function(attribute)
{
	let dimName = attribute.getDimension().getName();
	attribute.getConvenienceCommands().removeAttributeFromResultSet(dimName, attribute.getName());
};
oFF.OuGridAxesController.prototype.removeDimension = function(dim, onAfterRemove)
{
	if (oFF.QueryDesignerUtils.canBeRemoved(dim))
	{
		oFF.QueryDesignerUtils.removeDimension(dim);
		onAfterRemove();
	}
	else
	{
		let application = this.m_queryManager.getApplication();
		let title = oFF.XLocalizationCenter.getCenter().getTextWithPlaceholder(oFF.OuAxesViewI18n.BUILDER_FILTER_DIALOG_TITLE, dim.getText());
		oFF.QueryDesignerUtils.openSingleMemberFilterDialog(application, title, dim, oFF.FilterDialogLambdaCloseListener.create((selection) => {
			oFF.QueryDesignerUtils.removeDimension(dim);
			onAfterRemove();
		}, null));
	}
};
oFF.OuGridAxesController.prototype.removeMember = function(node)
{
	this.updateMemberFilter(node, false);
};
oFF.OuGridAxesController.prototype.setQueryManager = function(manager)
{
	this.m_queryManager = manager;
	this.m_memberResults = oFF.XHashMapByString.create();
};
oFF.OuGridAxesController.prototype.updateMemberFilter = function(node, include)
{
	let dim = node.getDimensionMember().getDimension();
	let allMembers = this.getMembersByDimension(dim);
	let includedMembers = this.getVisibleMemberNodesInOrder(dim);
	if (!include)
	{
		includedMembers.removeElement(node);
	}
	else if (!includedMembers.contains(node))
	{
		includedMembers.add(node);
	}
	this.addOrRemoveChildrenIfAny(node, includedMembers, include);
	oFF.QueryDesignerUtils.setFilterForDimension(dim, allMembers, includedMembers);
};
oFF.OuGridAxesController.prototype.updateMembers = function()
{
	if (!oFF.XObjectExt.isValidObject(this.m_queryManager) || !oFF.XObjectExt.isValidObject(this.m_queryManager.getQueryModel()))
	{
		return oFF.XPromise.resolve(oFF.XBooleanValue.create(true));
	}
	let queryModel = this.m_queryManager.getQueryModel();
	let structures = oFF.QueryDesignerUtils.getStructureDimensions(queryModel);
	let stillValid = oFF.XCollectionUtils.ensureAll(structures, (structure) => {
		let oldResult = this.m_memberResults.getByKey(structure.getName());
		return oFF.notNull(oldResult) && structure.getMemberManager().isResultInSync(oldResult);
	});
	if (stillValid)
	{
		return oFF.XPromise.resolve(oFF.XBooleanValue.create(false));
	}
	return this.fetchMembers().onThenExt((members) => {
		return oFF.XBooleanValue.create(true);
	});
};

oFF.OuDesignerDragDropUtilities = {

	calcDropIndex:function(event)
	{
			let dropPosition = event.getRelativeDropPosition();
		let list = event.getControl();
		if (list.getUiType() !== oFF.UiType.LIST)
		{
			return -1;
		}
		let dropIndex = list.getIndexOfItem(event.getDroppedControl());
		dropIndex = dropPosition === oFF.UiRelativeDropPosition.BEFORE ? dropIndex : dropIndex + 1;
		let draggedControl = event.getDraggedControl();
		let oldIndex = list.getIndexOfItem(draggedControl);
		if (oldIndex >= 0 && oldIndex < dropIndex)
		{
			dropIndex--;
		}
		return dropIndex;
	},
	calcDropIndexForStructureMemberDrop:function(event, dimension, axisType)
	{
			let dropIndex = oFF.OuDesignerDragDropUtilities.calcDropIndex(event);
		if (dropIndex > -1 && dimension.getAxis() !== null && dimension.getAxisType().isEqualTo(axisType) && dimension.getAxis().getIndex(dimension) < dropIndex)
		{
			dropIndex--;
		}
		return dropIndex;
	}
};

oFF.OuDesignerDimension = function() {};
oFF.OuDesignerDimension.prototype = new oFF.XObject();
oFF.OuDesignerDimension.prototype._ff_c = "OuDesignerDimension";

oFF.OuDesignerDimension.createEmpty = function()
{
	let obj = new oFF.OuDesignerDimension();
	obj.setupExt(null, null, null);
	return obj;
};
oFF.OuDesignerDimension.createForBuilderPanel = function(dimension, children, childrenList)
{
	let obj = new oFF.OuDesignerDimension();
	obj.setupExt(dimension, children, childrenList);
	return obj;
};
oFF.OuDesignerDimension.prototype.m_checkbox = null;
oFF.OuDesignerDimension.prototype.m_children = null;
oFF.OuDesignerDimension.prototype.m_childrenList = null;
oFF.OuDesignerDimension.prototype.m_colIco = null;
oFF.OuDesignerDimension.prototype.m_dimension = null;
oFF.OuDesignerDimension.prototype.m_dimensionList = null;
oFF.OuDesignerDimension.prototype.m_dimensionViews = null;
oFF.OuDesignerDimension.prototype.m_displayName = null;
oFF.OuDesignerDimension.prototype.m_displayText = null;
oFF.OuDesignerDimension.prototype.m_header = null;
oFF.OuDesignerDimension.prototype.m_label = null;
oFF.OuDesignerDimension.prototype.m_moreBtn = null;
oFF.OuDesignerDimension.prototype.m_name = null;
oFF.OuDesignerDimension.prototype.m_panel = null;
oFF.OuDesignerDimension.prototype.m_root = null;
oFF.OuDesignerDimension.prototype.m_rowIco = null;
oFF.OuDesignerDimension.prototype.getCheckbox = function()
{
	return this.m_checkbox;
};
oFF.OuDesignerDimension.prototype.getChildrenList = function()
{
	return this.m_childrenList;
};
oFF.OuDesignerDimension.prototype.getChildrenViews = function()
{
	return this.m_children;
};
oFF.OuDesignerDimension.prototype.getColumnIcon = function()
{
	return this.m_colIco;
};
oFF.OuDesignerDimension.prototype.getDimension = function()
{
	return this.m_dimension;
};
oFF.OuDesignerDimension.prototype.getDimensionList = function()
{
	return this.m_dimensionList;
};
oFF.OuDesignerDimension.prototype.getDimensionViews = function()
{
	return this.m_dimensionViews;
};
oFF.OuDesignerDimension.prototype.getDisplayName = function()
{
	return this.m_displayName;
};
oFF.OuDesignerDimension.prototype.getDisplayText = function()
{
	return this.m_displayText;
};
oFF.OuDesignerDimension.prototype.getHeader = function()
{
	return this.m_header;
};
oFF.OuDesignerDimension.prototype.getIconContainer = function()
{
	return this.m_header;
};
oFF.OuDesignerDimension.prototype.getLabel = function()
{
	return this.m_label;
};
oFF.OuDesignerDimension.prototype.getListItemRoot = function()
{
	return this.m_root;
};
oFF.OuDesignerDimension.prototype.getModelComponent = function()
{
	return this.m_dimension;
};
oFF.OuDesignerDimension.prototype.getMoreBtn = function()
{
	return this.m_moreBtn;
};
oFF.OuDesignerDimension.prototype.getName = function()
{
	if (oFF.isNull(this.m_dimension))
	{
		return this.m_name;
	}
	return this.m_dimension.getName();
};
oFF.OuDesignerDimension.prototype.getPanel = function()
{
	return this.m_panel;
};
oFF.OuDesignerDimension.prototype.getRowIcon = function()
{
	return this.m_rowIco;
};
oFF.OuDesignerDimension.prototype.isGroup = function()
{
	return oFF.XCollectionUtils.hasElements(this.m_dimensionViews);
};
oFF.OuDesignerDimension.prototype.releaseObject = function()
{
	this.m_name = null;
	this.m_dimension = null;
	this.m_children = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_children);
	this.m_dimensionViews = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_dimensionViews);
	this.m_label = oFF.XObjectExt.release(this.m_label);
	this.m_header = oFF.XObjectExt.release(this.m_header);
	this.m_panel = oFF.XObjectExt.release(this.m_panel);
	this.m_checkbox = oFF.XObjectExt.release(this.m_checkbox);
	this.m_rowIco = oFF.XObjectExt.release(this.m_rowIco);
	this.m_colIco = oFF.XObjectExt.release(this.m_colIco);
	this.m_moreBtn = oFF.XObjectExt.release(this.m_moreBtn);
	this.m_childrenList = oFF.XObjectExt.release(this.m_childrenList);
	oFF.XTimeout.timeout(0, () => {
		this.m_root = oFF.XObjectExt.release(this.m_root);
	});
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OuDesignerDimension.prototype.setCheckbox = function(checkbox)
{
	this.m_checkbox = checkbox;
};
oFF.OuDesignerDimension.prototype.setChildrenList = function(childrenList)
{
	this.m_childrenList = childrenList;
};
oFF.OuDesignerDimension.prototype.setChildrenViews = function(children)
{
	this.m_children = children;
};
oFF.OuDesignerDimension.prototype.setColIcon = function(colIcon)
{
	this.m_colIco = colIcon;
};
oFF.OuDesignerDimension.prototype.setDimension = function(dimension)
{
	this.m_dimension = dimension;
};
oFF.OuDesignerDimension.prototype.setDimensionList = function(dimensionList)
{
	this.m_dimensionList = dimensionList;
};
oFF.OuDesignerDimension.prototype.setDimensionViews = function(dimensionViews)
{
	this.m_dimensionViews = dimensionViews;
};
oFF.OuDesignerDimension.prototype.setDisplayName = function(displayName)
{
	this.m_displayName = displayName;
};
oFF.OuDesignerDimension.prototype.setDisplayText = function(displayText)
{
	this.m_displayText = displayText;
};
oFF.OuDesignerDimension.prototype.setHeader = function(header)
{
	this.m_header = header;
};
oFF.OuDesignerDimension.prototype.setLabel = function(label)
{
	this.m_label = label;
};
oFF.OuDesignerDimension.prototype.setListItemRoot = function(root)
{
	this.m_root = root;
};
oFF.OuDesignerDimension.prototype.setMoreBtn = function(moreBtn)
{
	this.m_moreBtn = moreBtn;
};
oFF.OuDesignerDimension.prototype.setName = function(name)
{
	this.m_name = name;
};
oFF.OuDesignerDimension.prototype.setPanel = function(panel)
{
	this.m_panel = panel;
};
oFF.OuDesignerDimension.prototype.setRowIcon = function(rowIcon)
{
	this.m_rowIco = rowIcon;
};
oFF.OuDesignerDimension.prototype.setText = function(text)
{
	if (oFF.notNull(this.m_label))
	{
		this.m_label.setText(text);
		this.m_label.setTooltip(text);
	}
};
oFF.OuDesignerDimension.prototype.setupExt = function(dimension, children, childrenList)
{
	this.m_dimension = dimension;
	this.m_children = children;
	this.m_childrenList = childrenList;
	this.m_rowIco = oFF.UiContextDummy.getSingleton();
	this.m_colIco = oFF.UiContextDummy.getSingleton();
	this.m_checkbox = oFF.UiContextDummy.getSingleton();
	this.m_moreBtn = oFF.UiContextDummy.getSingleton();
};
oFF.OuDesignerDimension.prototype.toString = function()
{
	if (oFF.isNull(this.m_dimension))
	{
		return this.m_name;
	}
	let presentation = oFF.QueryPresentationUtils.DESCRIPTION_AND_ID;
	return presentation.composeDisplayStrings(this.m_dimension.getName(), this.m_dimension.getText());
};

oFF.OuDesignerListItem = function() {};
oFF.OuDesignerListItem.prototype = new oFF.XObject();
oFF.OuDesignerListItem.prototype._ff_c = "OuDesignerListItem";

oFF.OuDesignerListItem.createForBuilderPanel = function(root, label)
{
	let obj = new oFF.OuDesignerListItem();
	obj.setupExt(root, label, oFF.UiContextDummy.getSingleton());
	return obj;
};
oFF.OuDesignerListItem.createForNavPanel = function(root, label, checkbox)
{
	let obj = new oFF.OuDesignerListItem();
	obj.setupExt(root, label, checkbox);
	return obj;
};
oFF.OuDesignerListItem.getAllChildrenRecursive = function(children)
{
	let all = oFF.XList.create();
	for (let i = 0; i < children.size(); i++)
	{
		let child = children.get(i);
		all.add(child);
		let grandChildren = oFF.OuDesignerListItem.getAllChildrenRecursive(child.getDirectChildren());
		all.addAll(grandChildren);
	}
	return all;
};
oFF.OuDesignerListItem.prototype.m_attribute = null;
oFF.OuDesignerListItem.prototype.m_checkbox = null;
oFF.OuDesignerListItem.prototype.m_children = null;
oFF.OuDesignerListItem.prototype.m_headerLayout = null;
oFF.OuDesignerListItem.prototype.m_label = null;
oFF.OuDesignerListItem.prototype.m_list = null;
oFF.OuDesignerListItem.prototype.m_moreButton = null;
oFF.OuDesignerListItem.prototype.m_node = null;
oFF.OuDesignerListItem.prototype.m_panel = null;
oFF.OuDesignerListItem.prototype.m_popoverIcon = null;
oFF.OuDesignerListItem.prototype.m_removeButton = null;
oFF.OuDesignerListItem.prototype.m_root = null;
oFF.OuDesignerListItem.prototype.addAllChildren = function(children)
{
	this.m_children.addAll(children);
	this.m_list.addAllItems(oFF.XCollectionUtils.map(children, (child) => {
		return child.getRoot();
	}));
};
oFF.OuDesignerListItem.prototype.addChild = function(child)
{
	this.m_children.add(child);
	this.m_list.addItem(child.getRoot());
};
oFF.OuDesignerListItem.prototype.getAllChildren = function()
{
	return oFF.OuDesignerListItem.getAllChildrenRecursive(this.m_children);
};
oFF.OuDesignerListItem.prototype.getAttribute = function()
{
	return this.m_attribute;
};
oFF.OuDesignerListItem.prototype.getCheckbox = function()
{
	return this.m_checkbox;
};
oFF.OuDesignerListItem.prototype.getChildrenList = function()
{
	return this.m_list;
};
oFF.OuDesignerListItem.prototype.getDirectChildren = function()
{
	return this.m_children;
};
oFF.OuDesignerListItem.prototype.getHeaderLayout = function()
{
	return this.m_headerLayout;
};
oFF.OuDesignerListItem.prototype.getLabel = function()
{
	return this.m_label;
};
oFF.OuDesignerListItem.prototype.getModelComponent = function()
{
	if (oFF.notNull(this.m_node))
	{
		return this.m_node;
	}
	return this.m_attribute;
};
oFF.OuDesignerListItem.prototype.getMoreButton = function()
{
	return this.m_moreButton;
};
oFF.OuDesignerListItem.prototype.getNode = function()
{
	return this.m_node;
};
oFF.OuDesignerListItem.prototype.getPanel = function()
{
	return this.m_panel;
};
oFF.OuDesignerListItem.prototype.getPopoverIcon = function()
{
	return this.m_popoverIcon;
};
oFF.OuDesignerListItem.prototype.getRemoveButton = function()
{
	return this.m_removeButton;
};
oFF.OuDesignerListItem.prototype.getRoot = function()
{
	return this.m_root;
};
oFF.OuDesignerListItem.prototype.releaseObject = function()
{
	this.m_node = null;
	this.m_popoverIcon = oFF.XObjectExt.release(this.m_popoverIcon);
	this.m_children = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_children);
	this.m_headerLayout = oFF.XObjectExt.release(this.m_headerLayout);
	this.m_checkbox = oFF.XObjectExt.release(this.m_checkbox);
	this.m_removeButton = oFF.XObjectExt.release(this.m_removeButton);
	this.m_moreButton = oFF.XObjectExt.release(this.m_moreButton);
	this.m_label = oFF.XObjectExt.release(this.m_label);
	this.m_list = oFF.XObjectExt.release(this.m_list);
	this.m_panel = oFF.XObjectExt.release(this.m_panel);
	this.m_root = oFF.XObjectExt.release(this.m_root);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OuDesignerListItem.prototype.setAttribute = function(attribute)
{
	this.m_attribute = attribute;
};
oFF.OuDesignerListItem.prototype.setChildrenList = function(list)
{
	this.m_list = list;
};
oFF.OuDesignerListItem.prototype.setHeaderLayout = function(headerLayout)
{
	this.m_headerLayout = headerLayout;
};
oFF.OuDesignerListItem.prototype.setMoreButton = function(moreButton)
{
	this.m_moreButton = moreButton;
};
oFF.OuDesignerListItem.prototype.setNode = function(node)
{
	this.m_node = node;
};
oFF.OuDesignerListItem.prototype.setPanel = function(panel)
{
	this.m_panel = panel;
};
oFF.OuDesignerListItem.prototype.setPopoverIcon = function(popoverIcon)
{
	this.m_popoverIcon = popoverIcon;
};
oFF.OuDesignerListItem.prototype.setRemoveButton = function(removeButton)
{
	this.m_removeButton = removeButton;
};
oFF.OuDesignerListItem.prototype.setupExt = function(root, label, checkbox)
{
	this.m_root = root;
	this.m_label = label;
	this.m_checkbox = checkbox;
	this.m_children = oFF.XList.create();
};
oFF.OuDesignerListItem.prototype.toString = function()
{
	let modelComponent = this.getModelComponent();
	if (oFF.isNull(modelComponent))
	{
		return null;
	}
	let presentation = oFF.QueryPresentationUtils.DESCRIPTION_AND_ID;
	return presentation.getDisplayValueByType(modelComponent);
};

oFF.OuDesignerFormulaPopoverIcon = function() {};
oFF.OuDesignerFormulaPopoverIcon.prototype = new oFF.XObject();
oFF.OuDesignerFormulaPopoverIcon.prototype._ff_c = "OuDesignerFormulaPopoverIcon";

oFF.OuDesignerFormulaPopoverIcon.create = function(genesis, member, messageManager)
{
	let obj = new oFF.OuDesignerFormulaPopoverIcon();
	obj.m_member = member;
	obj.m_messageManager = messageManager;
	obj.initializeComposite(genesis);
	return obj;
};
oFF.OuDesignerFormulaPopoverIcon.prototype.m_member = null;
oFF.OuDesignerFormulaPopoverIcon.prototype.m_messageManager = null;
oFF.OuDesignerFormulaPopoverIcon.prototype.m_popover = null;
oFF.OuDesignerFormulaPopoverIcon.prototype.m_textControl = null;
oFF.OuDesignerFormulaPopoverIcon.prototype.m_warningIcon = null;
oFF.OuDesignerFormulaPopoverIcon.prototype.getView = function()
{
	return this.m_warningIcon;
};
oFF.OuDesignerFormulaPopoverIcon.prototype.initializeComposite = function(genesis)
{
	this.m_popover = genesis.newControl(oFF.UiType.POPOVER);
	this.m_popover.addCssClass("ffGdsQbDesignerPanelFormulaWarningPopover");
	this.m_popover.setPadding(oFF.UiCssBoxEdges.create("0.75rem"));
	this.m_popover.setMinWidth(oFF.UiCssLength.create("12rem"));
	this.m_popover.setHorizontalScrolling(false);
	this.m_popover.setPlacement(oFF.UiPlacementType.VERTICAL);
	let infoText = oFF.OuDesignerFormulaHelper.extractDisplayableTextFromMessages(this.m_member, this.m_messageManager);
	this.m_textControl = this.m_popover.setNewContent(oFF.UiType.TEXT);
	this.m_textControl.useMaxSpace();
	this.m_textControl.setText(infoText);
	this.m_textControl.setWrapping(true);
	this.m_warningIcon = genesis.newControl(oFF.UiType.ICON);
	this.m_warningIcon.addCssClass("ffGdsQbDesignerPanelFormulaWarningIcon");
	this.m_warningIcon.setMinWidth(oFF.UiCssLength.create("2rem"));
	this.m_warningIcon.setIcon("fpa/warning");
	this.m_warningIcon.setColor(oFF.UiColor.ORANGE);
	this.m_warningIcon.registerOnHover(oFF.UiLambdaHoverListener.create((iconHoverEvent) => {
		this.m_popover.openAt(this.m_warningIcon);
	}));
	this.m_warningIcon.registerOnHoverEnd(oFF.UiLambdaHoverEndListener.create((iconHoverEndEvent) => {
		this.m_popover.close();
	}));
	this.m_warningIcon.registerOnPress(oFF.UiLambdaPressListener.create((iconPressEvent) => {
		if (this.m_popover.isOpen())
		{
			this.m_popover.close();
		}
		else
		{
			this.m_popover.openAt(this.m_warningIcon);
		}
	}));
};
oFF.OuDesignerFormulaPopoverIcon.prototype.releaseObject = function()
{
	this.m_member = null;
	this.m_messageManager = null;
	this.m_textControl = null;
	this.m_popover = oFF.XObjectExt.release(this.m_popover);
	this.m_warningIcon = oFF.XObjectExt.release(this.m_warningIcon);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OuDesignerFormulaPopoverIcon.prototype.setMessageManager = function(messageManager)
{
	this.m_messageManager = messageManager;
	if (oFF.isNull(this.m_messageManager))
	{
		this.m_textControl.setText(null);
		return;
	}
	let infoText = oFF.OuDesignerFormulaHelper.extractDisplayableTextFromMessages(this.m_member, this.m_messageManager);
	this.m_textControl.setText(infoText);
};

oFF.OuDimensionPanelListConfig = function() {};
oFF.OuDimensionPanelListConfig.prototype = new oFF.XObject();
oFF.OuDimensionPanelListConfig.prototype._ff_c = "OuDimensionPanelListConfig";

oFF.OuDimensionPanelListConfig.createConfig = function(application)
{
	let obj = new oFF.OuDimensionPanelListConfig();
	obj.setupConfig(application);
	return obj;
};
oFF.OuDimensionPanelListConfig.prototype.m_application = null;
oFF.OuDimensionPanelListConfig.prototype.m_calculationsEnabled = false;
oFF.OuDimensionPanelListConfig.prototype.m_dragElementTag = null;
oFF.OuDimensionPanelListConfig.prototype.m_focusContext = null;
oFF.OuDimensionPanelListConfig.prototype.m_i18nProviderName = null;
oFF.OuDimensionPanelListConfig.prototype.m_menuProvider = null;
oFF.OuDimensionPanelListConfig.prototype.m_onAttributeItemCreated = null;
oFF.OuDimensionPanelListConfig.prototype.m_onMemberItemCreated = null;
oFF.OuDimensionPanelListConfig.prototype.m_presentation = null;
oFF.OuDimensionPanelListConfig.prototype.m_rightClickContextMenuForAttributeEnabled = false;
oFF.OuDimensionPanelListConfig.prototype.m_rightClickContextMenuForDimensionEnabled = false;
oFF.OuDimensionPanelListConfig.prototype.m_rightClickContextMenuForMemberEnabled = false;
oFF.OuDimensionPanelListConfig.prototype.m_showAttributes = false;
oFF.OuDimensionPanelListConfig.prototype.m_showMeasureMoreMenuButton = false;
oFF.OuDimensionPanelListConfig.prototype.getApplication = function()
{
	return this.m_application;
};
oFF.OuDimensionPanelListConfig.prototype.getDefaultPresentation = function()
{
	return this.m_presentation;
};
oFF.OuDimensionPanelListConfig.prototype.getDragElementTag = function()
{
	return this.m_dragElementTag;
};
oFF.OuDimensionPanelListConfig.prototype.getFocusContext = function()
{
	return this.m_focusContext;
};
oFF.OuDimensionPanelListConfig.prototype.getLocalizationProviderName = function()
{
	return this.m_i18nProviderName;
};
oFF.OuDimensionPanelListConfig.prototype.getMenuProvider = function()
{
	return this.m_menuProvider;
};
oFF.OuDimensionPanelListConfig.prototype.getOnAttributeItemCreated = function()
{
	return this.m_onAttributeItemCreated;
};
oFF.OuDimensionPanelListConfig.prototype.getOnMemberItemCreated = function()
{
	return this.m_onMemberItemCreated;
};
oFF.OuDimensionPanelListConfig.prototype.isCalculationsEnabled = function()
{
	return this.m_calculationsEnabled;
};
oFF.OuDimensionPanelListConfig.prototype.isRightClickContextMenuForAttributeEnabled = function()
{
	return this.m_rightClickContextMenuForAttributeEnabled;
};
oFF.OuDimensionPanelListConfig.prototype.isRightClickContextMenuForDimensionEnabled = function()
{
	return this.m_rightClickContextMenuForDimensionEnabled;
};
oFF.OuDimensionPanelListConfig.prototype.isRightClickContextMenuForMemberEnabled = function()
{
	return this.m_rightClickContextMenuForMemberEnabled;
};
oFF.OuDimensionPanelListConfig.prototype.isShowAttributes = function()
{
	return this.m_showAttributes;
};
oFF.OuDimensionPanelListConfig.prototype.releaseObject = function()
{
	this.m_application = null;
	this.m_presentation = null;
	this.m_menuProvider = null;
	this.m_dragElementTag = null;
	this.m_i18nProviderName = null;
	this.m_onMemberItemCreated = null;
	this.m_onAttributeItemCreated = null;
	this.m_focusContext = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OuDimensionPanelListConfig.prototype.setCalculationsEnabled = function(calculationsEnabled)
{
	this.m_calculationsEnabled = calculationsEnabled;
};
oFF.OuDimensionPanelListConfig.prototype.setDefaultPresentation = function(presentation)
{
	this.m_presentation = presentation;
};
oFF.OuDimensionPanelListConfig.prototype.setDragElementTag = function(dragElementTag)
{
	this.m_dragElementTag = dragElementTag;
};
oFF.OuDimensionPanelListConfig.prototype.setFocusContext = function(focusContext)
{
	this.m_focusContext = focusContext;
};
oFF.OuDimensionPanelListConfig.prototype.setLocalizationProviderName = function(i18nProviderName)
{
	this.m_i18nProviderName = i18nProviderName;
};
oFF.OuDimensionPanelListConfig.prototype.setMenuProvider = function(menuProvider)
{
	this.m_menuProvider = menuProvider;
};
oFF.OuDimensionPanelListConfig.prototype.setOnAttributeItemCreated = function(onAttributeItemCreated)
{
	this.m_onAttributeItemCreated = onAttributeItemCreated;
};
oFF.OuDimensionPanelListConfig.prototype.setOnMemberItemCreated = function(onMemberItemCreated)
{
	this.m_onMemberItemCreated = onMemberItemCreated;
};
oFF.OuDimensionPanelListConfig.prototype.setRightClickContextMenuForAttributeEnabled = function(rightClickContextMenuForAttributeEnabled)
{
	this.m_rightClickContextMenuForAttributeEnabled = rightClickContextMenuForAttributeEnabled;
};
oFF.OuDimensionPanelListConfig.prototype.setRightClickContextMenuForDimensionEnabled = function(rightClickContextMenuForDimensionEnabled)
{
	this.m_rightClickContextMenuForDimensionEnabled = rightClickContextMenuForDimensionEnabled;
};
oFF.OuDimensionPanelListConfig.prototype.setRightClickContextMenuForMemberEnabled = function(rightClickContextMenuForMemberEnabled)
{
	this.m_rightClickContextMenuForMemberEnabled = rightClickContextMenuForMemberEnabled;
};
oFF.OuDimensionPanelListConfig.prototype.setShowAttributes = function(showAttributes)
{
	this.m_showAttributes = showAttributes;
};
oFF.OuDimensionPanelListConfig.prototype.setShowMeasureMoreMenuButton = function(showMeasureMoreMenuButton)
{
	this.m_showMeasureMoreMenuButton = showMeasureMoreMenuButton;
};
oFF.OuDimensionPanelListConfig.prototype.setupConfig = function(application)
{
	this.m_application = application;
	this.m_presentation = oFF.QueryPresentationUtils.DESCRIPTION;
};
oFF.OuDimensionPanelListConfig.prototype.showMeasureMoreMenuButton = function()
{
	return this.m_showMeasureMoreMenuButton;
};

oFF.OuMagicPanel = function() {};
oFF.OuMagicPanel.prototype = new oFF.XObject();
oFF.OuMagicPanel.prototype._ff_c = "OuMagicPanel";

oFF.OuMagicPanel.create = function(genesis)
{
	let obj = new oFF.OuMagicPanel();
	obj.initializeComposite(genesis);
	return obj;
};
oFF.OuMagicPanel.prototype.m_onCollapse = null;
oFF.OuMagicPanel.prototype.m_onExpand = null;
oFF.OuMagicPanel.prototype.m_panel = null;
oFF.OuMagicPanel.prototype.m_panelContent = null;
oFF.OuMagicPanel.prototype.m_placeholderContent = null;
oFF.OuMagicPanel.prototype.m_timeout = null;
oFF.OuMagicPanel.prototype.getPanelContent = function()
{
	return this.m_panelContent;
};
oFF.OuMagicPanel.prototype.getView = function()
{
	return this.m_panel;
};
oFF.OuMagicPanel.prototype.initializeComposite = function(genesis)
{
	this.m_panel = genesis.newControl(oFF.UiType.PANEL);
	this.m_panel.removeAttribute(oFF.UtUi5AttributeConstants.FAST_NAV_GROUP);
	this.m_panel.addCssClass("ffMagicPanel");
	this.m_panel.addCssClass("ffGdsQbFoldable");
	this.m_panel.setBackgroundDesign(oFF.UiBackgroundDesign.TRANSPARENT);
	this.m_panel.setMinHeight(oFF.UiCssLength.create("0"));
	this.m_placeholderContent = this.m_panel.setNewContent(oFF.UiType.CONTENT_WRAPPER);
	this.m_placeholderContent.useMaxWidth();
	this.m_panel.registerOnExpand(oFF.UiLambdaExpandListener.create((exp) => {
		oFF.XTimeout.clear(this.m_timeout);
		if (oFF.isNull(this.m_panel) || oFF.isNull(this.m_panelContent) || this.m_panel.isReleased() || this.m_panelContent.isReleased())
		{
			return;
		}
		this.m_panel.setContent(this.m_panelContent);
		if (oFF.notNull(this.m_onExpand))
		{
			this.m_onExpand();
		}
	}));
	this.m_panel.registerOnCollapse(oFF.UiLambdaCollapseListener.create((col) => {
		oFF.XTimeout.clear(this.m_timeout);
		if (oFF.isNull(this.m_panel) || oFF.isNull(this.m_panelContent) || this.m_panel.isReleased() || this.m_panelContent.isReleased())
		{
			return;
		}
		this.m_timeout = oFF.XTimeout.timeout(500, () => {
			this.m_panel.setContent(this.m_placeholderContent);
		});
		if (oFF.notNull(this.m_onCollapse))
		{
			this.m_onCollapse();
		}
	}));
};
oFF.OuMagicPanel.prototype.releaseObject = function()
{
	oFF.XTimeout.clear(this.m_timeout);
	this.m_timeout = null;
	this.m_onExpand = null;
	this.m_onCollapse = null;
	this.m_panel = oFF.XObjectExt.release(this.m_panel);
	this.m_placeholderContent = oFF.XObjectExt.release(this.m_placeholderContent);
	this.m_panelContent = oFF.XObjectExt.release(this.m_panelContent);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OuMagicPanel.prototype.setContentHeightInRem = function(contentHeightInRem)
{
	let cssSize = oFF.XStringUtils.concatenate2(oFF.XInteger.convertToString(contentHeightInRem), "rem");
	this.m_placeholderContent.setMinHeight(oFF.UiCssLength.create(cssSize));
};
oFF.OuMagicPanel.prototype.setExpandable = function(expandable)
{
	this.m_panel.setExpandable(expandable);
	this.updateContent();
};
oFF.OuMagicPanel.prototype.setExpanded = function(expanded)
{
	this.m_panel.setExpanded(expanded);
	this.updateContent();
};
oFF.OuMagicPanel.prototype.setOnCollapse = function(onCollapse)
{
	this.m_onCollapse = onCollapse;
};
oFF.OuMagicPanel.prototype.setOnExpand = function(onExpand)
{
	this.m_onExpand = onExpand;
};
oFF.OuMagicPanel.prototype.setPanelContent = function(panelContent)
{
	this.m_panelContent = panelContent;
};
oFF.OuMagicPanel.prototype.updateContent = function()
{
	if (!this.m_panel.isExpandable())
	{
		this.m_panel.setContent(null);
	}
	else
	{
		this.m_panel.setContent(this.m_panel.isExpanded() ? this.m_panelContent : this.m_placeholderContent);
	}
};

oFF.OuPanelList = function() {};
oFF.OuPanelList.prototype = new oFF.XObject();
oFF.OuPanelList.prototype._ff_c = "OuPanelList";

oFF.OuPanelList.create = function(genesis)
{
	let obj = new oFF.OuPanelList();
	obj.initializeComposite(genesis);
	return obj;
};
oFF.OuPanelList.prototype.m_dropZone = null;
oFF.OuPanelList.prototype.m_genesis = null;
oFF.OuPanelList.prototype.m_headerLayout = null;
oFF.OuPanelList.prototype.m_list = null;
oFF.OuPanelList.prototype.m_panel = null;
oFF.OuPanelList.prototype.m_panelContent = null;
oFF.OuPanelList.prototype.m_scroll = null;
oFF.OuPanelList.prototype.m_title = null;
oFF.OuPanelList.prototype.getDropZone = function()
{
	return this.m_dropZone;
};
oFF.OuPanelList.prototype.getHeaderLayout = function()
{
	return this.m_headerLayout;
};
oFF.OuPanelList.prototype.getList = function()
{
	return this.m_list;
};
oFF.OuPanelList.prototype.getPanel = function()
{
	return this.m_panel;
};
oFF.OuPanelList.prototype.getPanelContent = function()
{
	return this.m_panelContent;
};
oFF.OuPanelList.prototype.getScroll = function()
{
	return this.m_scroll;
};
oFF.OuPanelList.prototype.getTitle = function()
{
	return this.m_title;
};
oFF.OuPanelList.prototype.getView = function()
{
	return this.m_panel;
};
oFF.OuPanelList.prototype.initializeComposite = function(genesis)
{
	this.m_genesis = genesis;
	this.m_panel = genesis.newControl(oFF.UiType.PANEL);
	this.m_panel.removeAttribute(oFF.UtUi5AttributeConstants.FAST_NAV_GROUP);
	this.m_panel.addCssClass("ffGdsQbFoldable");
	this.m_panel.useMaxHeight();
	this.m_panel.setExpandable(true);
	this.m_panel.setBackgroundDesign(oFF.UiBackgroundDesign.TRANSPARENT);
	this.m_headerLayout = this.m_panel.setNewHeaderToolbar();
	this.m_headerLayout.removeAttribute(oFF.UtUi5AttributeConstants.FAST_NAV_GROUP);
	this.m_title = this.m_headerLayout.addNewItemOfType(oFF.UiType.TITLE);
	this.m_title.setTitleStyle(oFF.UiTitleLevel.H_5);
	this.m_title.setTitleLevel(oFF.UiTitleLevel.H_5);
	this.m_title.setMargin(oFF.UiCssBoxEdges.create("0"));
	this.m_panelContent = this.m_panel.setNewContent(oFF.UiType.FLEX_LAYOUT);
	this.m_panelContent.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_panelContent.useMaxHeight();
	this.m_scroll = this.m_panelContent.addNewItemOfType(oFF.UiType.SCROLL_CONTAINER);
	this.replaceList(oFF.XList.create());
	this.m_dropZone = this.m_panelContent.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_dropZone.setFlex("1 1 auto");
};
oFF.OuPanelList.prototype.isVisible = function()
{
	return this.getView().isVisible();
};
oFF.OuPanelList.prototype.releaseObject = function()
{
	this.m_title = oFF.XObjectExt.release(this.m_title);
	this.m_dropZone = oFF.XObjectExt.release(this.m_dropZone);
	this.m_list = oFF.XObjectExt.release(this.m_list);
	this.m_headerLayout = oFF.XObjectExt.release(this.m_headerLayout);
	this.m_panelContent = oFF.XObjectExt.release(this.m_panelContent);
	this.m_panel = oFF.XObjectExt.release(this.m_panel);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OuPanelList.prototype.replaceList = function(items)
{
	let list = this.m_genesis.newControl(oFF.UiType.LIST);
	list.removeAttribute(oFF.UtUi5AttributeConstants.FAST_NAV_GROUP);
	list.addAllItems(items);
	this.m_scroll.setContent(list);
	this.m_list = list;
};
oFF.OuPanelList.prototype.setVisible = function(visible)
{
	this.getView().setVisible(visible);
};

oFF.OuDesignerDragPayloadSimple = function() {};
oFF.OuDesignerDragPayloadSimple.prototype = new oFF.XObject();
oFF.OuDesignerDragPayloadSimple.prototype._ff_c = "OuDesignerDragPayloadSimple";

oFF.OuDesignerDragPayloadSimple.createWrapper = function(modelComponent)
{
	let obj = new oFF.OuDesignerDragPayloadSimple();
	obj.m_modelComponent = modelComponent;
	return obj;
};
oFF.OuDesignerDragPayloadSimple.prototype.m_modelComponent = null;
oFF.OuDesignerDragPayloadSimple.prototype.getModelComponent = function()
{
	return this.m_modelComponent;
};
oFF.OuDesignerDragPayloadSimple.prototype.releaseObject = function()
{
	this.m_modelComponent = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OuDesignerFormulaHelper = {

	extractDisplayableTextFromMessages:function(formula, messageManager)
	{
			if (messageManager.containsCode(oFF.Severity.WARNING, oFF.ErrorCodes.MEASURE_MISSING_DEPENDENT))
		{
			let buffer = oFF.XStringBuffer.create();
			buffer.appendLine(oFF.OuDesignerFormulaHelper.getLocalizationProvider().getTextWithPlaceholder(oFF.OuFormulaValidationI18n.NAV_CALCULATION_INVALID_DEPENDENCY_INFO, formula.getText()));
			let missingDependencyMeasureNames = oFF.OuDesignerFormulaHelper.getMissingDependencyMeasureNames(messageManager);
			oFF.XCollectionUtils.forEach(missingDependencyMeasureNames, (missingName) => {
				buffer.appendLine(missingName);
			});
			return buffer.toString();
		}
		if (messageManager.containsCode(oFF.Severity.WARNING, oFF.ErrorCodes.MEASURE_PREFERRED_HIERARCHY_MISMATCH))
		{
			let dimension = formula.getDimension();
			if (dimension.getDimensionType() === oFF.DimensionType.ACCOUNT)
			{
				return oFF.OuDesignerFormulaHelper.getLocalizationProvider().getText(oFF.OuFormulaValidationI18n.NAV_CALCULATION_PREFERRED_HIERARCHY_MISMATCH_ACCOUNT);
			}
			return oFF.OuDesignerFormulaHelper.getLocalizationProvider().getText(oFF.OuFormulaValidationI18n.NAV_CALCULATION_PREFERRED_HIERARCHY_MISMATCH_MEASURE);
		}
		if (messageManager.containsCode(oFF.Severity.ERROR, oFF.ErrorCodes.MEASURE_MISSING_REQUIRED_DIMENSION))
		{
			let message = messageManager.getMessage(oFF.Severity.ERROR, oFF.ErrorCodes.MEASURE_MISSING_REQUIRED_DIMENSION);
			let requiredDimensions = message.getExtendedInfo();
			if (oFF.XCollectionUtils.hasElements(requiredDimensions))
			{
				let unsatisfiedDimensions = formula.getUnsatisfiedRequiredDimensionNames(formula.getQueryModel(), messageManager, requiredDimensions);
				let buffer = oFF.XStringBuffer.create();
				buffer.appendLine(oFF.OuDesignerFormulaHelper.getLocalizationProvider().getTextWithPlaceholder(oFF.OuFormulaValidationI18n.NAV_CALCULATION_MISSING_DIMENSIONS_INFO, formula.getText()));
				oFF.XCollectionUtils.forEach(unsatisfiedDimensions.getValuesAsReadOnlyList(), (missingName) => {
					let missingDim = formula.getQueryModel().getDimensionByName(missingName);
					let dimText = missingDim.getText();
					if (!oFF.QDimensionUtil.shouldDimensionBeShownForRowsOrColumns(missingDim, true) && oFF.XCollectionUtils.hasElements(missingDim.getGroupingDimensions()))
					{
						let groupingDim = missingDim.getGroupingDimensions().get(0);
						dimText = groupingDim.getText();
					}
					buffer.appendLine(dimText);
				});
				return buffer.toString();
			}
		}
		if (messageManager.hasErrors() || messageManager.hasWarnings())
		{
			return oFF.OuDesignerFormulaHelper.getLocalizationProvider().getTextWithPlaceholder(oFF.OuFormulaValidationI18n.NAV_CALCULATION_INVALID_INFO, formula.getText());
		}
		return null;
	},
	getLocalizationProvider:function()
	{
			return oFF.XLocalizationCenter.getCenter().getLocalizationProviderByName(oFF.OuFormulaValidationI18n.PROVIDER_NAME);
	},
	getMissingDependencyMeasureNames:function(messageManager)
	{
			let result = oFF.XList.create();
		for (let i = 0; i < messageManager.getMessages().size(); i++)
		{
			let message = messageManager.getMessages().get(i);
			if (message.getCode() !== oFF.ErrorCodes.MEASURE_MISSING_DEPENDENT)
			{
				continue;
			}
			let jsonMessage = oFF.JsonParserFactory.createFromString(message.getText());
			if (oFF.isNull(jsonMessage) || !jsonMessage.isStructure())
			{
				continue;
			}
			let args = jsonMessage.asStructure().getListByKey("args");
			if (oFF.notNull(args) && !args.isEmpty())
			{
				result.add(args.getStringAt(0));
			}
		}
		return result;
	},
	validateFormula:function(formula)
	{
			let messageManager = formula.validateWithQueryModelScope(formula.getQueryModel());
		if (messageManager.hasErrors() || messageManager.hasWarnings())
		{
			return messageManager;
		}
		let messageManager2 = oFF.MessageManagerSimple.createMessageManager();
		formula.validate(formula.getDimension(), messageManager2, true, true);
		return messageManager2;
	},
	validateFormulaAndExtractDisplayableText:function(formula)
	{
			let messageManager = oFF.OuDesignerFormulaHelper.validateFormula(formula);
		return oFF.OuDesignerFormulaHelper.extractDisplayableTextFromMessages(formula, messageManager);
	}
};

oFF.OuInventoryCalculationLink = function() {};
oFF.OuInventoryCalculationLink.prototype = new oFF.XObject();
oFF.OuInventoryCalculationLink.prototype._ff_c = "OuInventoryCalculationLink";

oFF.OuInventoryCalculationLink.create = function(root)
{
	let obj = new oFF.OuInventoryCalculationLink();
	obj.setupExt(root);
	return obj;
};
oFF.OuInventoryCalculationLink.prototype.m_root = null;
oFF.OuInventoryCalculationLink.prototype.getRoot = function()
{
	return this.m_root;
};
oFF.OuInventoryCalculationLink.prototype.releaseObject = function()
{
	this.m_root = oFF.XObjectExt.release(this.m_root);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OuInventoryCalculationLink.prototype.setupExt = function(root)
{
	this.m_root = root;
};

oFF.OuInventoryStructure = function() {};
oFF.OuInventoryStructure.prototype = new oFF.XObject();
oFF.OuInventoryStructure.prototype._ff_c = "OuInventoryStructure";

oFF.OuInventoryStructure.createView = function(dimension)
{
	let obj = new oFF.OuInventoryStructure();
	obj.setupExt(dimension);
	return obj;
};
oFF.OuInventoryStructure.getAllChildrenRecursive = function(children)
{
	let all = oFF.XList.create();
	for (let i = 0; i < children.size(); i++)
	{
		let child = children.get(i);
		all.add(child);
		let grandChildren = oFF.OuInventoryStructure.getAllChildrenRecursive(child.getDirectChildren());
		all.addAll(grandChildren);
	}
	return all;
};
oFF.OuInventoryStructure.prototype.m_calculations = null;
oFF.OuInventoryStructure.prototype.m_calculationsLink = null;
oFF.OuInventoryStructure.prototype.m_childrenList = null;
oFF.OuInventoryStructure.prototype.m_colIco = null;
oFF.OuInventoryStructure.prototype.m_dimension = null;
oFF.OuInventoryStructure.prototype.m_dimensionList = null;
oFF.OuInventoryStructure.prototype.m_header = null;
oFF.OuInventoryStructure.prototype.m_memberHierarchy = false;
oFF.OuInventoryStructure.prototype.m_members = null;
oFF.OuInventoryStructure.prototype.m_panel = null;
oFF.OuInventoryStructure.prototype.m_rowIco = null;
oFF.OuInventoryStructure.prototype.m_selectAll = null;
oFF.OuInventoryStructure.prototype.addCalculation = function(calculation)
{
	this.m_calculations.add(calculation);
};
oFF.OuInventoryStructure.prototype.addChild = function(child)
{
	this.m_members.add(child);
	this.m_childrenList.addItem(child.getRoot());
};
oFF.OuInventoryStructure.prototype.getAllChildren = function()
{
	return oFF.OuInventoryStructure.getAllChildrenRecursive(this.m_members);
};
oFF.OuInventoryStructure.prototype.getCalculations = function()
{
	return this.m_calculations;
};
oFF.OuInventoryStructure.prototype.getCalculationsLink = function()
{
	return this.m_calculationsLink;
};
oFF.OuInventoryStructure.prototype.getChildrenList = function()
{
	return this.m_childrenList;
};
oFF.OuInventoryStructure.prototype.getColumnIcon = function()
{
	return this.m_colIco;
};
oFF.OuInventoryStructure.prototype.getDimension = function()
{
	return this.m_dimension;
};
oFF.OuInventoryStructure.prototype.getDimensionList = function()
{
	return this.m_dimensionList;
};
oFF.OuInventoryStructure.prototype.getDirectChildren = function()
{
	return this.m_members;
};
oFF.OuInventoryStructure.prototype.getHeader = function()
{
	return this.m_header;
};
oFF.OuInventoryStructure.prototype.getIconContainer = function()
{
	return this.m_header;
};
oFF.OuInventoryStructure.prototype.getModelComponent = function()
{
	return this.m_dimension;
};
oFF.OuInventoryStructure.prototype.getName = function()
{
	return this.m_dimension.getDisplayName();
};
oFF.OuInventoryStructure.prototype.getPanel = function()
{
	return this.m_panel;
};
oFF.OuInventoryStructure.prototype.getRowIcon = function()
{
	return this.m_rowIco;
};
oFF.OuInventoryStructure.prototype.getSelectAll = function()
{
	return this.m_selectAll;
};
oFF.OuInventoryStructure.prototype.hasMemberHierarchy = function()
{
	return this.m_memberHierarchy;
};
oFF.OuInventoryStructure.prototype.releaseObject = function()
{
	this.m_dimension = null;
	this.m_panel = oFF.XObjectExt.release(this.m_panel);
	this.m_dimensionList = oFF.XObjectExt.release(this.m_dimensionList);
	this.m_selectAll = oFF.XObjectExt.release(this.m_selectAll);
	this.m_rowIco = oFF.XObjectExt.release(this.m_rowIco);
	this.m_colIco = oFF.XObjectExt.release(this.m_colIco);
	this.m_header = oFF.XObjectExt.release(this.m_header);
	this.m_childrenList = oFF.XObjectExt.release(this.m_childrenList);
	this.m_calculationsLink = oFF.XObjectExt.release(this.m_calculationsLink);
	this.m_members = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_members);
	this.m_calculations = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_calculations);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OuInventoryStructure.prototype.setCalculationsLink = function(calculationsLink)
{
	this.m_calculationsLink = calculationsLink;
};
oFF.OuInventoryStructure.prototype.setChildrenList = function(childrenList)
{
	this.m_childrenList = childrenList;
};
oFF.OuInventoryStructure.prototype.setColIcon = function(colIcon)
{
	this.m_colIco = colIcon;
};
oFF.OuInventoryStructure.prototype.setDimension = function(dimension)
{
	this.m_dimension = dimension;
};
oFF.OuInventoryStructure.prototype.setDimensionList = function(dimensionList)
{
	this.m_dimensionList = dimensionList;
};
oFF.OuInventoryStructure.prototype.setHeader = function(header)
{
	this.m_header = header;
};
oFF.OuInventoryStructure.prototype.setMemberHierarchy = function(isHierarchical)
{
	this.m_memberHierarchy = isHierarchical;
};
oFF.OuInventoryStructure.prototype.setPanel = function(panel)
{
	this.m_panel = panel;
};
oFF.OuInventoryStructure.prototype.setRowIcon = function(rowIcon)
{
	this.m_rowIco = rowIcon;
};
oFF.OuInventoryStructure.prototype.setSelectAll = function(selectAll)
{
	this.m_selectAll = selectAll;
};
oFF.OuInventoryStructure.prototype.setupExt = function(dimension)
{
	this.m_dimension = dimension;
	this.m_members = oFF.XList.create();
	this.m_calculations = oFF.XList.create();
};
oFF.OuInventoryStructure.prototype.toString = function()
{
	if (oFF.isNull(this.m_dimension))
	{
		return null;
	}
	let presentation = oFF.QueryPresentationUtils.DESCRIPTION_AND_ID;
	return presentation.composeDisplayStrings(this.m_dimension.getDisplayName(), this.m_dimension.getDisplayDescription());
};

oFF.OuInventoryViewSortMenu = function() {};
oFF.OuInventoryViewSortMenu.prototype = new oFF.XObject();
oFF.OuInventoryViewSortMenu.prototype._ff_c = "OuInventoryViewSortMenu";

oFF.OuInventoryViewSortMenu.create = function(menu)
{
	let obj = new oFF.OuInventoryViewSortMenu();
	obj.m_menu = menu;
	obj.buildSortMenuForStructures();
	return obj;
};
oFF.OuInventoryViewSortMenu.prototype.m_ascendingItem = null;
oFF.OuInventoryViewSortMenu.prototype.m_defaultOrderItem = null;
oFF.OuInventoryViewSortMenu.prototype.m_descendingItem = null;
oFF.OuInventoryViewSortMenu.prototype.m_menu = null;
oFF.OuInventoryViewSortMenu.prototype.m_rootItem = null;
oFF.OuInventoryViewSortMenu.prototype.addCssClass = function(cssClass)
{
	this.m_rootItem.addCssClass(cssClass);
	this.m_defaultOrderItem.addCssClass(oFF.XStringUtils.concatenate2(cssClass, "Default"));
	this.m_ascendingItem.addCssClass(oFF.XStringUtils.concatenate2(cssClass, "Ascending"));
	this.m_descendingItem.addCssClass(oFF.XStringUtils.concatenate2(cssClass, "Descending"));
};
oFF.OuInventoryViewSortMenu.prototype.buildSortMenuForStructures = function()
{
	let i18n = this.getLocalizationProvider();
	this.m_rootItem = this.m_menu.addNewItem();
	this.m_rootItem.setText(i18n.getText(oFF.OuInventoryViewI18n.NAV_MENU_SORT));
	this.m_defaultOrderItem = this.m_rootItem.addNewItem();
	this.m_defaultOrderItem.setText(i18n.getText(oFF.OuInventoryViewI18n.NAV_MENU_SORT_DEFAULT));
	this.m_ascendingItem = this.m_rootItem.addNewItem();
	this.m_ascendingItem.setText(i18n.getText(oFF.OuInventoryViewI18n.NAV_MENU_SORT_ASCENDING));
	this.m_descendingItem = this.m_rootItem.addNewItem();
	this.m_descendingItem.setText(i18n.getText(oFF.OuInventoryViewI18n.NAV_MENU_SORT_DESCENDING));
};
oFF.OuInventoryViewSortMenu.prototype.getLocalizationProvider = function()
{
	return oFF.XLocalizationCenter.getCenter().getLocalizationProviderByName(oFF.OuInventoryViewI18n.PROVIDER_NAME);
};
oFF.OuInventoryViewSortMenu.prototype.releaseObject = function()
{
	this.m_menu = null;
	this.m_defaultOrderItem = oFF.XObjectExt.release(this.m_defaultOrderItem);
	this.m_ascendingItem = oFF.XObjectExt.release(this.m_ascendingItem);
	this.m_descendingItem = oFF.XObjectExt.release(this.m_descendingItem);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OuInventoryViewSortMenu.prototype.setConsumer = function(consumer)
{
	this.m_defaultOrderItem.registerOnPress(oFF.UiLambdaPressListener.create((sortEvt1) => {
		consumer(oFF.XSortDirection.NONE);
	}));
	this.m_ascendingItem.registerOnPress(oFF.UiLambdaPressListener.create((sortEvt2) => {
		consumer(oFF.XSortDirection.ASCENDING);
	}));
	this.m_descendingItem.registerOnPress(oFF.UiLambdaPressListener.create((sortEvt3) => {
		consumer(oFF.XSortDirection.DESCENDING);
	}));
};
oFF.OuInventoryViewSortMenu.prototype.update = function(sortDirection)
{
	this.m_defaultOrderItem.setIcon(sortDirection === oFF.XSortDirection.NONE ? "accept" : null);
	this.m_ascendingItem.setIcon(sortDirection === oFF.XSortDirection.ASCENDING ? "accept" : null);
	this.m_descendingItem.setIcon(sortDirection === oFF.XSortDirection.DESCENDING ? "accept" : null);
};

oFF.OuCalcAssistancePanelConfigBuilder = function() {};
oFF.OuCalcAssistancePanelConfigBuilder.prototype = new oFF.OuCalcPanelConfigBuilder();
oFF.OuCalcAssistancePanelConfigBuilder.prototype._ff_c = "OuCalcAssistancePanelConfigBuilder";

oFF.OuCalcAssistancePanelConfigBuilder.create = function()
{
	return new oFF.OuCalcAssistancePanelConfigBuilder();
};
oFF.OuCalcAssistancePanelConfigBuilder.prototype.build = function()
{
	return oFF.OuCalcAssistancePanelConfig.create(oFF.OuCalcPanelRenderConfig.create(this.m_anchorTag, this.m_domId, this.m_width));
};

oFF.OuCalcCodeEditorPanelConfigBuilder = function() {};
oFF.OuCalcCodeEditorPanelConfigBuilder.prototype = new oFF.OuCalcPanelConfigBuilder();
oFF.OuCalcCodeEditorPanelConfigBuilder.prototype._ff_c = "OuCalcCodeEditorPanelConfigBuilder";

oFF.OuCalcCodeEditorPanelConfigBuilder.create = function()
{
	return new oFF.OuCalcCodeEditorPanelConfigBuilder();
};
oFF.OuCalcCodeEditorPanelConfigBuilder.prototype.build = function()
{
	return oFF.OuCalcCodeEditorPanelConfig.create(oFF.OuCalcPanelRenderConfig.create(this.m_anchorTag, this.m_domId, this.m_width));
};

oFF.OuCalcDetailsPanelConfigBuilder = function() {};
oFF.OuCalcDetailsPanelConfigBuilder.prototype = new oFF.OuCalcPanelConfigBuilder();
oFF.OuCalcDetailsPanelConfigBuilder.prototype._ff_c = "OuCalcDetailsPanelConfigBuilder";

oFF.OuCalcDetailsPanelConfigBuilder.create = function()
{
	return new oFF.OuCalcDetailsPanelConfigBuilder();
};
oFF.OuCalcDetailsPanelConfigBuilder.prototype.build = function()
{
	return oFF.OuCalcDetailsPanelConfig.create(oFF.OuCalcPanelRenderConfig.create(this.m_anchorTag, this.m_domId, this.m_width));
};

oFF.OuCalcFormulaItemListPanelConfigBuilder = function() {};
oFF.OuCalcFormulaItemListPanelConfigBuilder.prototype = new oFF.OuCalcPanelConfigBuilder();
oFF.OuCalcFormulaItemListPanelConfigBuilder.prototype._ff_c = "OuCalcFormulaItemListPanelConfigBuilder";

oFF.OuCalcFormulaItemListPanelConfigBuilder.create = function()
{
	return new oFF.OuCalcFormulaItemListPanelConfigBuilder();
};
oFF.OuCalcFormulaItemListPanelConfigBuilder.prototype.build = function()
{
	return oFF.OuCalcFormulaItemListPanelConfig.create(oFF.OuCalcPanelRenderConfig.create(this.m_anchorTag, this.m_domId, this.m_width));
};

oFF.OuCalcSinglePluginConfigBuilder = function() {};
oFF.OuCalcSinglePluginConfigBuilder.prototype = new oFF.OuCalcPanelConfigBuilder();
oFF.OuCalcSinglePluginConfigBuilder.prototype._ff_c = "OuCalcSinglePluginConfigBuilder";

oFF.OuCalcSinglePluginConfigBuilder.create = function()
{
	return new oFF.OuCalcSinglePluginConfigBuilder();
};
oFF.OuCalcSinglePluginConfigBuilder.prototype.m_leftPanelWidth = null;
oFF.OuCalcSinglePluginConfigBuilder.prototype.m_rightPanelWidth = null;
oFF.OuCalcSinglePluginConfigBuilder.prototype.build = function()
{
	return oFF.OuCalcSinglePluginConfig.create(oFF.OuCalcPanelRenderConfig.create(this.m_anchorTag, this.m_domId, this.m_width), this.m_leftPanelWidth, this.m_rightPanelWidth);
};
oFF.OuCalcSinglePluginConfigBuilder.prototype.setLeftPanelWidth = function(leftPanelWidth)
{
	this.m_leftPanelWidth = leftPanelWidth;
	return this;
};
oFF.OuCalcSinglePluginConfigBuilder.prototype.setRightPanelWidth = function(rightPanelWidth)
{
	this.m_rightPanelWidth = rightPanelWidth;
	return this;
};

oFF.OuCalcCloseParenthesisTokenProcessor = function() {};
oFF.OuCalcCloseParenthesisTokenProcessor.prototype = new oFF.OuCalcBaseTokenProcessor();
oFF.OuCalcCloseParenthesisTokenProcessor.prototype._ff_c = "OuCalcCloseParenthesisTokenProcessor";

oFF.OuCalcCloseParenthesisTokenProcessor.create = function()
{
	return new oFF.OuCalcCloseParenthesisTokenProcessor();
};
oFF.OuCalcCloseParenthesisTokenProcessor.prototype.handleToken = function(formula)
{
	let operators = formula.getOperators();
	let countIf = formula.getCountIf();
	let j;
	if (this.isCloseParenthesis(formula.getCurrentFormulaToken()))
	{
		if (this.isOpenParenthesis(operators.get(operators.size() - 1)))
		{
			operators.removeAt(operators.size() - 1);
		}
		else if (this.isCommaAfterOpenParenthesis(operators, countIf))
		{
			for (j = 0; j < 3; j++)
			{
				operators.removeAt(operators.size() - 1);
			}
			countIf--;
			formula.setFormattedString(oFF.XStringUtils.concatenate2(formula.getFormattedString(), oFF.OuCalcFormulaFormatterConstants.ENTER));
			for (j = 0; j < countIf; j++)
			{
				formula.setFormattedString(oFF.XStringUtils.concatenate2(formula.getFormattedString(), oFF.OuCalcFormulaFormatterConstants.TAB));
			}
			formula.setCountIf(countIf);
		}
		formula.setFormattedString(oFF.XStringUtils.concatenate2(formula.getFormattedString(), formula.getCurrentFormulaToken()));
	}
	return formula;
};
oFF.OuCalcCloseParenthesisTokenProcessor.prototype.isCloseParenthesis = function(formulaToken)
{
	return oFF.XString.isEqual(formulaToken, oFF.OuCalcFormulaFormatterConstants.CLOSE_PARENTHESIS);
};
oFF.OuCalcCloseParenthesisTokenProcessor.prototype.isCommaAfterOpenParenthesis = function(operators, countIf)
{
	return countIf > 0 && operators.size() >= 3 && this.isComma(operators.get(operators.size() - 1)) && this.isComma(operators.get(operators.size() - 2)) && this.isOpenParenthesis(operators.get(operators.size() - 3));
};

oFF.OuCalcCloseSquareBracketTokenProcessor = function() {};
oFF.OuCalcCloseSquareBracketTokenProcessor.prototype = new oFF.OuCalcBaseTokenProcessor();
oFF.OuCalcCloseSquareBracketTokenProcessor.prototype._ff_c = "OuCalcCloseSquareBracketTokenProcessor";

oFF.OuCalcCloseSquareBracketTokenProcessor.create = function()
{
	return new oFF.OuCalcCloseSquareBracketTokenProcessor();
};
oFF.OuCalcCloseSquareBracketTokenProcessor.prototype.handleToken = function(formula)
{
	if (this.isCloseSquareBracket(formula.getCurrentFormulaToken()))
	{
		formula.setTempFormattingState(oFF.XStringUtils.concatenate2(formula.getTempFormattingState(), formula.getCurrentFormulaToken()));
		formula.setFormattedString(oFF.XStringUtils.concatenate2(formula.getFormattedString(), formula.getTempFormattingState()));
		formula.setTempFormattingState(oFF.OuCalcFormulaFormatterConstants.SPACE);
	}
	return formula;
};
oFF.OuCalcCloseSquareBracketTokenProcessor.prototype.isCloseSquareBracket = function(formulaToken)
{
	return oFF.XString.isEqual(formulaToken, oFF.OuCalcFormulaFormatterConstants.CLOSE_SQAURE_BRACKETS);
};

oFF.OuCalcCommaTokenProcessor = function() {};
oFF.OuCalcCommaTokenProcessor.prototype = new oFF.OuCalcBaseTokenProcessor();
oFF.OuCalcCommaTokenProcessor.prototype._ff_c = "OuCalcCommaTokenProcessor";

oFF.OuCalcCommaTokenProcessor.create = function()
{
	return new oFF.OuCalcCommaTokenProcessor();
};
oFF.OuCalcCommaTokenProcessor.prototype.handleComma = function(processedString, countIf, operators, formulaPart)
{
	let processedString2 = processedString;
	let j;
	operators.add(oFF.OuCalcFormulaFormatterConstants.COMMA);
	processedString2 = oFF.XStringUtils.concatenate2(processedString2, formulaPart);
	if (countIf > 0)
	{
		processedString2 = oFF.XStringUtils.concatenate2(processedString2, oFF.OuCalcFormulaFormatterConstants.ENTER);
		for (j = 0; j < countIf; j++)
		{
			processedString2 = oFF.XStringUtils.concatenate2(processedString2, oFF.OuCalcFormulaFormatterConstants.TAB);
		}
	}
	return processedString2;
};
oFF.OuCalcCommaTokenProcessor.prototype.handleToken = function(formula)
{
	if (this.isComma(formula.getCurrentFormulaToken()))
	{
		formula.setFormattedString(this.handleComma(formula.getFormattedString(), formula.getCountIf(), formula.getOperators(), formula.getCurrentFormulaToken()));
	}
	return formula;
};

oFF.OuCalcDoubleQuoteTokenProcessor = function() {};
oFF.OuCalcDoubleQuoteTokenProcessor.prototype = new oFF.OuCalcBaseTokenProcessor();
oFF.OuCalcDoubleQuoteTokenProcessor.prototype._ff_c = "OuCalcDoubleQuoteTokenProcessor";

oFF.OuCalcDoubleQuoteTokenProcessor.create = function()
{
	return new oFF.OuCalcDoubleQuoteTokenProcessor();
};
oFF.OuCalcDoubleQuoteTokenProcessor.prototype.formatTextBetweenDoubleQuotes = function(formula)
{
	formula.setFormattedString(oFF.XStringUtils.concatenate2(formula.getFormattedString(), formula.getCurrentFormulaToken()));
	formula.setCurrentCount(formula.getCurrentCount() + 1);
	formula.setCurrentFormulaToken(this.handleDoubleQuote(formula.getFormulaCopy(), formula.getCurrentCount()));
};
oFF.OuCalcDoubleQuoteTokenProcessor.prototype.handleDoubleQuote = function(formulaCopy, i)
{
	let formulaPart;
	if (i >= 0 && i < oFF.XString.size(formulaCopy))
	{
		let str2 = oFF.XStringBuffer.create();
		formulaPart = str2.appendChar(oFF.XString.getCharAt(formulaCopy, i)).toString();
	}
	else
	{
		formulaPart = "";
	}
	return formulaPart;
};
oFF.OuCalcDoubleQuoteTokenProcessor.prototype.handleToken = function(formula)
{
	if (this.isDoubleQuote(formula.getTempFormattingState(), formula.getCurrentFormulaToken()))
	{
		this.formatTextBetweenDoubleQuotes(formula);
		while (!oFF.XString.isEqual(formula.getCurrentFormulaToken(), oFF.OuCalcFormulaFormatterConstants.DOUBLE_QUOTE) && formula.getCurrentCount() < oFF.XString.size(formula.getFormulaCopy()) - 1)
		{
			this.formatTextBetweenDoubleQuotes(formula);
		}
		formula.setFormattedString(oFF.XStringUtils.concatenate2(formula.getFormattedString(), formula.getCurrentFormulaToken()));
	}
	return formula;
};
oFF.OuCalcDoubleQuoteTokenProcessor.prototype.isDoubleQuote = function(temp, formulaPart)
{
	return oFF.XString.size(temp) === 0 && oFF.XString.isEqual(formulaPart, oFF.OuCalcFormulaFormatterConstants.DOUBLE_QUOTE);
};

oFF.OuCalcOpenParenthesisTokenProcessor = function() {};
oFF.OuCalcOpenParenthesisTokenProcessor.prototype = new oFF.OuCalcBaseTokenProcessor();
oFF.OuCalcOpenParenthesisTokenProcessor.prototype._ff_c = "OuCalcOpenParenthesisTokenProcessor";

oFF.OuCalcOpenParenthesisTokenProcessor.create = function()
{
	return new oFF.OuCalcOpenParenthesisTokenProcessor();
};
oFF.OuCalcOpenParenthesisTokenProcessor.prototype.handleToken = function(formula)
{
	if (this.isOpenParenthesis(formula.getCurrentFormulaToken()))
	{
		formula.getOperators().add(oFF.OuCalcFormulaFormatterConstants.OPEN_PARENTHESIS);
		let allGroupsOfMatch = oFF.XRegex.getInstance().getAllGroupsOfMatch(formula.getFormattedString(), oFF.OuCalcFormulaFormatterConstants.REGEX_END_WITH_IF, true);
		if (allGroupsOfMatch.size() > 0)
		{
			formula.setCountIf(formula.getCountIf() + 1);
		}
		formula.setFormattedString(oFF.XStringUtils.concatenate2(formula.getFormattedString(), formula.getCurrentFormulaToken()));
	}
	return formula;
};

oFF.OuCalcOpenSquareBracketTokenProcessor = function() {};
oFF.OuCalcOpenSquareBracketTokenProcessor.prototype = new oFF.OuCalcBaseTokenProcessor();
oFF.OuCalcOpenSquareBracketTokenProcessor.prototype._ff_c = "OuCalcOpenSquareBracketTokenProcessor";

oFF.OuCalcOpenSquareBracketTokenProcessor.create = function()
{
	return new oFF.OuCalcOpenSquareBracketTokenProcessor();
};
oFF.OuCalcOpenSquareBracketTokenProcessor.prototype.handleToken = function(formula)
{
	if (this.isOpenSquareBracket(formula.getCurrentFormulaToken()))
	{
		formula.setTempFormattingState(oFF.XStringUtils.concatenate2(formula.getTempFormattingState(), formula.getCurrentFormulaToken()));
	}
	return formula;
};
oFF.OuCalcOpenSquareBracketTokenProcessor.prototype.isOpenSquareBracket = function(formulaToken)
{
	return oFF.XString.isEqual(formulaToken, oFF.OuCalcFormulaFormatterConstants.OPEN_SQAURE_BRACKETS);
};

oFF.OuCalcSpecialCharactersTokenProcessor = function() {};
oFF.OuCalcSpecialCharactersTokenProcessor.prototype = new oFF.OuCalcBaseTokenProcessor();
oFF.OuCalcSpecialCharactersTokenProcessor.prototype._ff_c = "OuCalcSpecialCharactersTokenProcessor";

oFF.OuCalcSpecialCharactersTokenProcessor.create = function()
{
	return new oFF.OuCalcSpecialCharactersTokenProcessor();
};
oFF.OuCalcSpecialCharactersTokenProcessor.prototype.closeSquareBracketsDoesNotExists = function(temp)
{
	return oFF.XString.indexOf(temp, oFF.OuCalcFormulaFormatterConstants.CLOSE_SQAURE_BRACKETS) === -1;
};
oFF.OuCalcSpecialCharactersTokenProcessor.prototype.handleToken = function(formula)
{
	if (this.membersWithSpecialCharacters(formula.getTempFormattingState()))
	{
		formula.setTempFormattingState(oFF.XStringUtils.concatenate2(formula.getTempFormattingState(), formula.getCurrentFormulaToken()));
	}
	return formula;
};
oFF.OuCalcSpecialCharactersTokenProcessor.prototype.membersWithSpecialCharacters = function(temp)
{
	return oFF.XString.size(temp) !== 0 && this.openSquareBracketsExists(temp) && this.closeSquareBracketsDoesNotExists(temp);
};
oFF.OuCalcSpecialCharactersTokenProcessor.prototype.openSquareBracketsExists = function(temp)
{
	return oFF.XString.indexOf(temp, oFF.OuCalcFormulaFormatterConstants.OPEN_SQAURE_BRACKETS) !== -1;
};

oFF.OuCalcWhiteSpaceTokenProcessor = function() {};
oFF.OuCalcWhiteSpaceTokenProcessor.prototype = new oFF.OuCalcBaseTokenProcessor();
oFF.OuCalcWhiteSpaceTokenProcessor.prototype._ff_c = "OuCalcWhiteSpaceTokenProcessor";

oFF.OuCalcWhiteSpaceTokenProcessor.create = function()
{
	return new oFF.OuCalcWhiteSpaceTokenProcessor();
};
oFF.OuCalcWhiteSpaceTokenProcessor.prototype.closeSquareBracketsDoesNotExists = function(temp)
{
	return oFF.XString.indexOf(temp, oFF.OuCalcFormulaFormatterConstants.CLOSE_SQAURE_BRACKETS) === -1;
};
oFF.OuCalcWhiteSpaceTokenProcessor.prototype.handleToken = function(formula)
{
	if (this.isWhiteSpace(formula.getCurrentFormulaToken()))
	{
		return this.handleWhiteSpaces(formula);
	}
	return formula;
};
oFF.OuCalcWhiteSpaceTokenProcessor.prototype.handleWhiteSpaces = function(formula)
{
	if (oFF.XString.match(formula.getCurrentFormulaToken(), oFF.OuCalcFormulaFormatterConstants.REGEX_BLANK_SPACE))
	{
		if (this.membersWithSpecialCharacters(formula.getTempFormattingState()))
		{
			formula.setTempFormattingState(oFF.XStringUtils.concatenate2(formula.getTempFormattingState(), formula.getCurrentFormulaToken()));
		}
		else
		{
			if (!oFF.XString.endsWith(formula.getFormattedString(), oFF.OuCalcFormulaFormatterConstants.TAB))
			{
				formula.setFormattedString(oFF.XStringUtils.concatenate2(formula.getFormattedString(), oFF.OuCalcFormulaFormatterConstants.SINGLE_WHITE_SPACE));
			}
		}
	}
	formula.setExitCurrentIteration(true);
	return formula;
};
oFF.OuCalcWhiteSpaceTokenProcessor.prototype.isWhiteSpace = function(formulaPart)
{
	return oFF.XString.match(formulaPart, oFF.OuCalcFormulaFormatterConstants.REGEX_WHITE_SPACE);
};
oFF.OuCalcWhiteSpaceTokenProcessor.prototype.membersWithSpecialCharacters = function(temp)
{
	return oFF.XString.size(temp) !== 0 && this.openSquareBracketsExists(temp) && this.closeSquareBracketsDoesNotExists(temp);
};
oFF.OuCalcWhiteSpaceTokenProcessor.prototype.openSquareBracketsExists = function(temp)
{
	return oFF.XString.indexOf(temp, oFF.OuCalcFormulaFormatterConstants.OPEN_SQAURE_BRACKETS) !== -1;
};

oFF.OuCalcHintSnippet = function() {};
oFF.OuCalcHintSnippet.prototype = new oFF.OuCalcHintBase();
oFF.OuCalcHintSnippet.prototype._ff_c = "OuCalcHintSnippet";

oFF.OuCalcHintSnippet.SNIPPET_KEY = "snippet";
oFF.OuCalcHintSnippet.create = function(value, caption, score, cssClassName)
{
	oFF.XObjectExt.assertStringNotNullAndNotEmpty(value);
	let hint = new oFF.OuCalcHintSnippet();
	hint.m_snippet = value;
	hint.setupInternal(caption, score, cssClassName);
	return hint;
};
oFF.OuCalcHintSnippet.prototype.m_snippet = null;
oFF.OuCalcHintSnippet.prototype.getJson = function()
{
	let baseStruct = oFF.OuCalcHintBase.prototype.getJson.call( this );
	baseStruct.putString(oFF.OuCalcHintSnippet.SNIPPET_KEY, this.m_snippet);
	return baseStruct;
};
oFF.OuCalcHintSnippet.prototype.getValue = function()
{
	return this.m_snippet;
};

oFF.OuCalcHintValue = function() {};
oFF.OuCalcHintValue.prototype = new oFF.OuCalcHintBase();
oFF.OuCalcHintValue.prototype._ff_c = "OuCalcHintValue";

oFF.OuCalcHintValue.VALUE_KEY = "value";
oFF.OuCalcHintValue.create = function(value, caption, score, cssClassName)
{
	oFF.XObjectExt.assertStringNotNullAndNotEmpty(value);
	let hint = new oFF.OuCalcHintValue();
	hint.m_value = value;
	hint.setupInternal(caption, score, cssClassName);
	return hint;
};
oFF.OuCalcHintValue.prototype.m_value = null;
oFF.OuCalcHintValue.prototype.getJson = function()
{
	let baseStruct = oFF.OuCalcHintBase.prototype.getJson.call( this );
	baseStruct.putString(oFF.OuCalcHintValue.VALUE_KEY, this.m_value);
	return baseStruct;
};
oFF.OuCalcHintValue.prototype.getValue = function()
{
	return this.m_value;
};

oFF.OuCalcAbstractMeasureHintProvider = function() {};
oFF.OuCalcAbstractMeasureHintProvider.prototype = new oFF.OuCalcAbstractHintProvider();
oFF.OuCalcAbstractMeasureHintProvider.prototype._ff_c = "OuCalcAbstractMeasureHintProvider";

oFF.OuCalcAbstractMeasureHintProvider.CSS_CLASS_NAME = "feMeasureHint";
oFF.OuCalcAbstractMeasureHintProvider.INITIAL_SCORE = -1;
oFF.OuCalcAbstractMeasureHintProvider.SPACE = " ";
oFF.OuCalcAbstractMeasureHintProvider.prototype.m_currentScore = 0;
oFF.OuCalcAbstractMeasureHintProvider.prototype.m_enableModelPrefix = false;
oFF.OuCalcAbstractMeasureHintProvider.prototype.m_measures = null;
oFF.OuCalcAbstractMeasureHintProvider.prototype.buildCaption = function(measure)
{
	let caption = oFF.XStringBuffer.create();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(measure.getDescription()))
	{
		caption.append(measure.getDescription());
		caption.append(oFF.OuCalcAbstractMeasureHintProvider.SPACE);
	}
	caption.append(measure.getField(this.m_enableModelPrefix));
	return caption.toString();
};
oFF.OuCalcAbstractMeasureHintProvider.prototype.provide = function()
{
	this.m_currentScore = oFF.OuCalcAbstractMeasureHintProvider.INITIAL_SCORE;
	return oFF.XStream.of(this.m_measures).map((measure) => {
		return oFF.OuCalcHintValue.create(measure.getField(this.m_enableModelPrefix), this.buildCaption(measure), this.m_currentScore--, this.getCssClassName());
	}).collect(oFF.XStreamCollector.toList());
};
oFF.OuCalcAbstractMeasureHintProvider.prototype.setupMeasureHints = function(measures, enableModelPrefix)
{
	oFF.XObjectExt.assertNotNull(measures);
	this.m_measures = measures;
	this.m_enableModelPrefix = enableModelPrefix;
	this.setupInternal(oFF.OuCalcAbstractMeasureHintProvider.CSS_CLASS_NAME);
};

oFF.OuCalcDateGranularityHintProvider = function() {};
oFF.OuCalcDateGranularityHintProvider.prototype = new oFF.OuCalcAbstractHintProvider();
oFF.OuCalcDateGranularityHintProvider.prototype._ff_c = "OuCalcDateGranularityHintProvider";

oFF.OuCalcDateGranularityHintProvider.CSS_CLASS_NAME = "feDateGranularityHint";
oFF.OuCalcDateGranularityHintProvider.INITIAL_SCORE = -1;
oFF.OuCalcDateGranularityHintProvider.create = function()
{
	let provider = new oFF.OuCalcDateGranularityHintProvider();
	let granularityOptions = oFF.XList.create();
	granularityOptions.add(oFF.XStringUtils.concatenate3("\"", oFF.FeDateGranularityConstants.YEAR.getName(), "\""));
	granularityOptions.add(oFF.XStringUtils.concatenate3("\"", oFF.FeDateGranularityConstants.MONTH.getName(), "\""));
	granularityOptions.add(oFF.XStringUtils.concatenate3("\"", oFF.FeDateGranularityConstants.DAY.getName(), "\""));
	provider.m_granularities = granularityOptions;
	return provider;
};
oFF.OuCalcDateGranularityHintProvider.prototype.m_currentScore = 0;
oFF.OuCalcDateGranularityHintProvider.prototype.m_granularities = null;
oFF.OuCalcDateGranularityHintProvider.prototype.accept = function(token)
{
	return token.getDataTypes().contains(oFF.FeDataType.GRANULARITY);
};
oFF.OuCalcDateGranularityHintProvider.prototype.provide = function()
{
	this.m_currentScore = oFF.OuCalcDateGranularityHintProvider.INITIAL_SCORE;
	return oFF.XStream.ofString(this.m_granularities).map((granularity) => {
		return oFF.OuCalcHintValue.create(granularity.getString(), granularity.getString(), this.m_currentScore--, oFF.OuCalcDateGranularityHintProvider.CSS_CLASS_NAME);
	}).collect(oFF.XStreamCollector.toList());
};

oFF.OuCalcDimensionHintProvider = function() {};
oFF.OuCalcDimensionHintProvider.prototype = new oFF.OuCalcAbstractHintProvider();
oFF.OuCalcDimensionHintProvider.prototype._ff_c = "OuCalcDimensionHintProvider";

oFF.OuCalcDimensionHintProvider.CSS_CLASS_NAME = "feDimensionHint";
oFF.OuCalcDimensionHintProvider.INITIAL_SCORE = -10000;
oFF.OuCalcDimensionHintProvider.SPACE = " ";
oFF.OuCalcDimensionHintProvider.create = function(dimensions, measures, feConfiguration, enableModelPrefix)
{
	oFF.XObjectExt.assertNotNull(dimensions);
	oFF.XObjectExt.assertNotNull(measures);
	let provider = new oFF.OuCalcDimensionHintProvider();
	provider.m_dimensions = dimensions;
	provider.m_measures = measures;
	provider.m_filteredDimensions = dimensions;
	provider.m_feConfiguration = feConfiguration;
	provider.m_enableModelPrefix = enableModelPrefix;
	provider.setupInternal(oFF.OuCalcDimensionHintProvider.CSS_CLASS_NAME);
	return provider;
};
oFF.OuCalcDimensionHintProvider.prototype.m_currentScore = 0;
oFF.OuCalcDimensionHintProvider.prototype.m_dimensions = null;
oFF.OuCalcDimensionHintProvider.prototype.m_enableModelPrefix = false;
oFF.OuCalcDimensionHintProvider.prototype.m_feConfiguration = null;
oFF.OuCalcDimensionHintProvider.prototype.m_filteredDimensions = null;
oFF.OuCalcDimensionHintProvider.prototype.m_measures = null;
oFF.OuCalcDimensionHintProvider.prototype.accept = function(token)
{
	let dataTypeSupportingHints = oFF.XStream.of(token.getDataTypes()).find((tokenDataType) => {
		return (oFF.FeDataType.isStrictlyCompatible(tokenDataType, oFF.FeDataType.DIMENSION) || tokenDataType.isEqualTo(oFF.FeDataType.BOOLEAN)) && tokenDataType.supportsDimensionsInHintsOnly();
	});
	if (dataTypeSupportingHints.isPresent())
	{
		return true;
	}
	if (!this.m_feConfiguration.dimensionsSupported())
	{
		return false;
	}
	return this.isTokenTypeOf(token, oFF.FeDataType.DIMENSION) || this.isTokenTypeOf(token, oFF.FeDataType.DIMENSION_PROPERTY) || this.isTokenTypeOf(token, oFF.FeDataType.DATE_DIMENSION) || this.isInDimensionFilterContext(token);
};
oFF.OuCalcDimensionHintProvider.prototype.buildCaption = function(dimension)
{
	if (oFF.XStringUtils.isNullOrEmpty(dimension.getDescription()))
	{
		return dimension.getField(this.m_enableModelPrefix);
	}
	return oFF.XStringUtils.concatenate3(dimension.getDescription(), oFF.OuCalcDimensionHintProvider.SPACE, dimension.getField(this.m_enableModelPrefix));
};
oFF.OuCalcDimensionHintProvider.prototype.filterCompoundDimensions = function(dimensions)
{
	return oFF.XStream.of(dimensions).filter((dimension) => {
		return !dimension.isCompound();
	}).collect(oFF.XStreamCollector.toList());
};
oFF.OuCalcDimensionHintProvider.prototype.filterIncompatibleDimensions = function(dimensions, measures)
{
	let incompatibleDimensions = oFF.XStream.of(measures).flatMap((measure) => {
		return oFF.XStream.ofString(measure.getIncompatibleDimensionNames());
	}).reduce(oFF.XHashSetOfString.create(), (acc, dim) => {
		oFF.XCollectionUtils.addIfNotPresent(acc, dim.getStringRepresentation());
		return acc;
	});
	if (incompatibleDimensions.hasElements())
	{
		return oFF.XCollectionUtils.filter(dimensions, (dimension) => {
			return !incompatibleDimensions.contains(dimension.getDimensionName());
		});
	}
	return dimensions;
};
oFF.OuCalcDimensionHintProvider.prototype.getMeasuresFromTokenNames = function(tokenNames)
{
	return oFF.XStream.ofString(tokenNames).map((measureTokenName) => {
		return oFF.XStream.of(this.m_measures).find((measure) => {
			return oFF.XString.isEqual(measure.getAlias(), measureTokenName.getStringRepresentation());
		}).orElse(null);
	}).filterNullValues().distinct().collect(oFF.XStreamCollector.toList());
};
oFF.OuCalcDimensionHintProvider.prototype.getTokenNamesInFunction = function(tokensInFunction)
{
	let tokenNamesInFunction = oFF.XHashSetOfString.create();
	oFF.XCollectionUtils.forEach(tokensInFunction, (token) => {
		let nameOpt = oFF.FeFieldConverter.getMemberExt(token.getText(), this.m_enableModelPrefix);
		if (nameOpt.isPresent())
		{
			tokenNamesInFunction.add(nameOpt.get());
		}
	});
	return tokenNamesInFunction;
};
oFF.OuCalcDimensionHintProvider.prototype.isInDimensionFilterContext = function(token)
{
	return token.getDataTypes().contains(oFF.FeDataType.DIMENSION_FILTER);
};
oFF.OuCalcDimensionHintProvider.prototype.isNumericDimension = function(dimension)
{
	if (dimension.getProperties().isEmpty() && dimension.isNumeric())
	{
		return true;
	}
	return oFF.XStream.of(dimension.getProperties()).allMatch((property) => {
		return property.getValueType().isNumber();
	});
};
oFF.OuCalcDimensionHintProvider.prototype.prepare = function(token)
{
	if (!token.getDataTypes().contains(oFF.FeDataType.DIMENSION) && token.getDataTypes().contains(oFF.FeDataType.DATE_DIMENSION))
	{
		this.m_filteredDimensions = oFF.XCollectionUtils.filter(this.m_dimensions, (dimension) => {
			return dimension.isDateDimension();
		});
	}
	else if (oFF.XStream.of(token.getDataTypes()).anyMatch((tokenDataType) => {
		return tokenDataType.isTypeOf(oFF.FeDataType.DIMENSION) && !tokenDataType.supportsNumericDimensions();
	}))
	{
		this.m_filteredDimensions = oFF.XCollectionUtils.filter(this.m_filteredDimensions, (dimension2) => {
			return !this.isNumericDimension(dimension2);
		});
	}
	else
	{
		this.m_filteredDimensions = this.m_dimensions;
	}
	let areDimensionPropertiesSupported = oFF.FeFeatureToggle.isActive(oFF.FeFeatureToggle.DIMENSION_PROPERTIES);
	if (areDimensionPropertiesSupported && !token.getDataTypes().contains(oFF.FeDataType.DIMENSION) && token.getDataTypes().contains(oFF.FeDataType.DIMENSION_PROPERTY))
	{
		this.m_filteredDimensions = oFF.XCollectionUtils.filter(this.m_filteredDimensions, (dimension) => {
			return !dimension.getProperties().isEmpty();
		});
	}
	let argumentCustomData = oFF.FeArgumentCustomData.extractFromToken(token);
	if (argumentCustomData.isPresent())
	{
		let parentFunction = argumentCustomData.get().getParentFunction();
		let formulaItem = oFF.FeFormulaItemProvider.getInstance().getFormulaItem(parentFunction.getName());
		if (formulaItem.isPresent() && formulaItem.get().getMetadata().showUniqueDimensionsOnly())
		{
			let dimensionTokensInFunction = parentFunction.getDimensionTokens();
			let dimensionNamesInFunction = this.getTokenNamesInFunction(dimensionTokensInFunction);
			this.m_filteredDimensions = oFF.XCollectionUtils.filter(this.m_filteredDimensions, (dimension) => {
				return !dimensionNamesInFunction.contains(dimension.getAlias());
			});
		}
		if (oFF.FeFeatureToggle.isActive(oFF.FeFeatureToggle.RESTRICT) && formulaItem.isPresent() && formulaItem.get().getMetadata().hasName(oFF.FeRestrict.NAME))
		{
			let measuresInFunction = this.getMeasuresFromTokenNames(this.getTokenNamesInFunction(parentFunction.getMeasureTokens()));
			this.m_filteredDimensions = this.filterIncompatibleDimensions(this.m_filteredDimensions, measuresInFunction);
			this.m_filteredDimensions = this.filterCompoundDimensions(this.m_filteredDimensions);
		}
	}
};
oFF.OuCalcDimensionHintProvider.prototype.provide = function()
{
	this.m_currentScore = oFF.OuCalcDimensionHintProvider.INITIAL_SCORE;
	return oFF.XStream.of(this.m_filteredDimensions).map((dimension) => {
		return oFF.OuCalcHintValue.create(dimension.getField(this.m_enableModelPrefix), this.buildCaption(dimension), this.m_currentScore--, this.getCssClassName());
	}).collect(oFF.XStreamCollector.toList());
};

oFF.OuCalcFunctionHintProvider = function() {};
oFF.OuCalcFunctionHintProvider.prototype = new oFF.OuCalcAbstractHintProvider();
oFF.OuCalcFunctionHintProvider.prototype._ff_c = "OuCalcFunctionHintProvider";

oFF.OuCalcFunctionHintProvider.CSS_CLASS_NAME = "feFunctionHint";
oFF.OuCalcFunctionHintProvider.SCORE = 10;
oFF.OuCalcFunctionHintProvider.create = function(functions, formulaPresentation)
{
	oFF.XObjectExt.assertNotNull(functions);
	let provider = new oFF.OuCalcFunctionHintProvider();
	provider.m_functions = provider.getSortedFunctions(functions.getValuesAsReadOnlyList());
	provider.m_filteredFunctions = provider.m_functions;
	provider.m_formulaPresentation = formulaPresentation;
	provider.setupInternal(oFF.OuCalcFunctionHintProvider.CSS_CLASS_NAME);
	return provider;
};
oFF.OuCalcFunctionHintProvider.prototype.m_filteredFunctions = null;
oFF.OuCalcFunctionHintProvider.prototype.m_formulaPresentation = null;
oFF.OuCalcFunctionHintProvider.prototype.m_functions = null;
oFF.OuCalcFunctionHintProvider.prototype.accept = function(token)
{
	return this.isTokenCompatible(token, oFF.FeDataType.BOOLEAN) || this.isTokenCompatible(token, oFF.FeDataType.NUMBER) || this.isTokenCompatible(token, oFF.FeDataType.STRING);
};
oFF.OuCalcFunctionHintProvider.prototype.getSortedFunctions = function(functions)
{
	let sortedFunctions = functions.createListCopy();
	sortedFunctions.sortByComparator(oFF.XComparatorLambda.create((first, second) => {
		return oFF.FeFunctionComparator.compareFunctionName(first.getDisplayName(), second.getDisplayName());
	}));
	return sortedFunctions;
};
oFF.OuCalcFunctionHintProvider.prototype.prepare = function(token)
{
	this.m_filteredFunctions = oFF.XStream.of(this.m_functions).filter((_function) => {
		return oFF.XStream.of(_function.getMetadata().getSupportedReturnTypes()).anyMatch((returnType) => {
			return this.isTokenTypeOf(token, returnType);
		});
	}).collect(oFF.XStreamCollector.toList());
};
oFF.OuCalcFunctionHintProvider.prototype.provide = function()
{
	return oFF.XStream.of(this.m_filteredFunctions).map((formulaItem) => {
		return oFF.OuCalcHintSnippet.create(this.m_formulaPresentation.getDisplayText(formulaItem.getSyntax()), formulaItem.getDisplayName(), oFF.OuCalcFunctionHintProvider.SCORE, this.getCssClassName());
	}).collect(oFF.XStreamCollector.toList());
};

oFF.OuCalcHierarchyHintProvider = function() {};
oFF.OuCalcHierarchyHintProvider.prototype = new oFF.OuCalcAbstractHintProvider();
oFF.OuCalcHierarchyHintProvider.prototype._ff_c = "OuCalcHierarchyHintProvider";

oFF.OuCalcHierarchyHintProvider.CSS_CLASS_NAME = "feHierarchyHint";
oFF.OuCalcHierarchyHintProvider.SCORE = 1;
oFF.OuCalcHierarchyHintProvider.SPACE = " ";
oFF.OuCalcHierarchyHintProvider.create = function(dimensions, feConfiguration, enableModelPrefix)
{
	oFF.XObjectExt.assertNotNull(dimensions);
	let provider = new oFF.OuCalcHierarchyHintProvider();
	provider.m_dimensions = dimensions;
	provider.m_feConfiguration = feConfiguration;
	provider.m_enableModelPrefix = enableModelPrefix;
	provider.setupInternal(oFF.OuCalcHierarchyHintProvider.CSS_CLASS_NAME);
	return provider;
};
oFF.OuCalcHierarchyHintProvider.prototype.m_dimensions = null;
oFF.OuCalcHierarchyHintProvider.prototype.m_enableModelPrefix = false;
oFF.OuCalcHierarchyHintProvider.prototype.m_feConfiguration = null;
oFF.OuCalcHierarchyHintProvider.prototype.m_hierarchies = null;
oFF.OuCalcHierarchyHintProvider.prototype.accept = function(token)
{
	return (this.m_feConfiguration.dimensionsSupported() || this.m_feConfiguration.isHierarchyLoadEnabled()) && token.getDataTypes().contains(oFF.FeDataType.HIERARCHY) && !this.isParentArgPropOnly(token);
};
oFF.OuCalcHierarchyHintProvider.prototype.buildCaption = function(hierarchy)
{
	if (oFF.XStringUtils.isNullOrEmpty(hierarchy.getDescription()))
	{
		return hierarchy.getField(this.m_enableModelPrefix);
	}
	return oFF.XStringUtils.concatenate3(hierarchy.getDescription(), oFF.OuCalcHierarchyHintProvider.SPACE, hierarchy.getField(this.m_enableModelPrefix));
};
oFF.OuCalcHierarchyHintProvider.prototype.getDimensionByField = function(text)
{
	return oFF.XStream.of(this.m_dimensions).find((mc) => {
		return oFF.XString.isEqual(mc.getField(this.m_enableModelPrefix), text);
	});
};
oFF.OuCalcHierarchyHintProvider.prototype.isParentArgPropOnly = function(token)
{
	return token.getParent().isPresent() && token.getParent().get().getTokenType().isEqualTo(oFF.FeTokenType.ARGUMENT) && token.getParent().get().getDataTypes().contains(oFF.FeDataType.DIMENSION_PROPERTY);
};
oFF.OuCalcHierarchyHintProvider.prototype.prepare = function(token)
{
	this.m_hierarchies = oFF.XList.create();
	let dimension = this.getDimensionByField(token.getText());
	if (dimension.isPresent() && !dimension.get().getHierarchies().isEmpty() && !(dimension.get().getHierarchies().size() === 1 && dimension.get().getHierarchies().get(0).getId() === null))
	{
		this.m_hierarchies.addAll(dimension.get().getHierarchies());
	}
};
oFF.OuCalcHierarchyHintProvider.prototype.provide = function()
{
	return oFF.XCollectionUtils.map(this.m_hierarchies, (hierarchy) => {
		return oFF.OuCalcHintValue.create(hierarchy.getField(this.m_enableModelPrefix), this.buildCaption(hierarchy), oFF.OuCalcHierarchyHintProvider.SCORE, this.getCssClassName());
	});
};

oFF.OuCalcOperatorHintProvider = function() {};
oFF.OuCalcOperatorHintProvider.prototype = new oFF.OuCalcAbstractHintProvider();
oFF.OuCalcOperatorHintProvider.prototype._ff_c = "OuCalcOperatorHintProvider";

oFF.OuCalcOperatorHintProvider.CSS_CLASS_NAME = "feOperatorHint";
oFF.OuCalcOperatorHintProvider.DIM_SEPARATOR = ".";
oFF.OuCalcOperatorHintProvider.create = function(operators)
{
	oFF.XObjectExt.assertNotNull(operators);
	let provider = new oFF.OuCalcOperatorHintProvider();
	provider.m_operators = operators;
	provider.setupInternal(oFF.OuCalcOperatorHintProvider.CSS_CLASS_NAME);
	return provider;
};
oFF.OuCalcOperatorHintProvider.prototype.m_hints = null;
oFF.OuCalcOperatorHintProvider.prototype.m_operators = null;
oFF.OuCalcOperatorHintProvider.prototype.accept = function(token)
{
	return token.getDataTypes().contains(oFF.FeDataType.OPERATOR);
};
oFF.OuCalcOperatorHintProvider.prototype.isBaseDimensionToken = function(token)
{
	return token.getTokenType().isEqualTo(oFF.FeTokenType.DIMENSION) && !oFF.FeFieldConverter.getHierarchy(token.getText()).isPresent() && !oFF.FeFieldConverter.getProperty(token.getText()).isPresent();
};
oFF.OuCalcOperatorHintProvider.prototype.prepare = function(token)
{
	let filteredOperators = this.m_operators;
	if (token.getParent().isPresent())
	{
		let dataTypesWithRestrictions = oFF.XStream.of(token.getParent().get().getDataTypes()).filter((dataType) => {
			return dataType.getSupportedOperators().isPresent();
		}).collect(oFF.XStreamCollector.toList());
		if (dataTypesWithRestrictions.hasElements())
		{
			let supportedOperators = oFF.XStream.of(dataTypesWithRestrictions).flatMap((dataType2) => {
				return oFF.XStream.ofString(dataType2.getSupportedOperators().get());
			}).distinct().collect(oFF.XStreamCollector.toListOfString((supportedOp) => {
				return supportedOp.getString();
			}));
			filteredOperators = oFF.XStream.of(filteredOperators).filter((op) => {
				return oFF.XStream.ofString(supportedOperators).anyMatch((op2) => {
					return op.getMetadata().hasName(op2.getString());
				});
			}).collect(oFF.XStreamCollector.toList());
		}
	}
	let supportedDataType = token.getTokenType().isEqualTo(oFF.FeTokenType.DIMENSION) ? oFF.FeDataType.STRING : oFF.FeDataType.NUMBER;
	this.m_hints = oFF.XList.create();
	this.m_hints.addAll(oFF.XStream.of(filteredOperators).filter((operator) => {
		let operatorFirstArgumentMetadataOpt = operator.getMetadata().getArgument(0);
		let supportedTypesForOperator = operatorFirstArgumentMetadataOpt.isPresent() ? operatorFirstArgumentMetadataOpt.get().getSupportedArgumentTypes() : null;
		return oFF.XStream.of(supportedTypesForOperator).anyMatch((dataType) => {
			return oFF.FeDataType.isCompatible(dataType, supportedDataType);
		});
	}).map((formulaItem2) => {
		return oFF.OuCalcHintValue.create(formulaItem2.getSyntax(), formulaItem2.getDisplayName(), formulaItem2.getHintScore(), this.getCssClassName());
	}).collect(oFF.XStreamCollector.toList()));
	if (this.isBaseDimensionToken(token))
	{
		let hintScore = this.m_hints.isEmpty() ? 0 : this.m_hints.get(this.m_hints.size() - 1).getScore() - 1;
		this.m_hints.add(oFF.OuCalcHintValue.create(oFF.OuCalcOperatorHintProvider.DIM_SEPARATOR, oFF.OuCalcOperatorHintProvider.DIM_SEPARATOR, hintScore, this.getCssClassName()));
	}
};
oFF.OuCalcOperatorHintProvider.prototype.provide = function()
{
	return this.m_hints;
};

oFF.OuCalcPropertyHintProvider = function() {};
oFF.OuCalcPropertyHintProvider.prototype = new oFF.OuCalcAbstractHintProvider();
oFF.OuCalcPropertyHintProvider.prototype._ff_c = "OuCalcPropertyHintProvider";

oFF.OuCalcPropertyHintProvider.CSS_CLASS_NAME = "fePropertyHint";
oFF.OuCalcPropertyHintProvider.SCORE = 0;
oFF.OuCalcPropertyHintProvider.SPACE = " ";
oFF.OuCalcPropertyHintProvider.create = function(dimensions, feConfiguration, enableModelPrefix)
{
	oFF.XObjectExt.assertNotNull(dimensions);
	let provider = new oFF.OuCalcPropertyHintProvider();
	provider.m_dimensions = dimensions;
	provider.m_feConfiguration = feConfiguration;
	provider.m_enableModelPrefix = enableModelPrefix;
	provider.setupInternal(oFF.OuCalcPropertyHintProvider.CSS_CLASS_NAME);
	return provider;
};
oFF.OuCalcPropertyHintProvider.prototype.m_dimensions = null;
oFF.OuCalcPropertyHintProvider.prototype.m_enableModelPrefix = false;
oFF.OuCalcPropertyHintProvider.prototype.m_feConfiguration = null;
oFF.OuCalcPropertyHintProvider.prototype.m_properties = null;
oFF.OuCalcPropertyHintProvider.prototype.accept = function(token)
{
	return this.m_feConfiguration.dimensionsSupported() && token.getDataTypes().contains(oFF.FeDataType.PROPERTY);
};
oFF.OuCalcPropertyHintProvider.prototype.buildCaption = function(property)
{
	if (oFF.XStringUtils.isNullOrEmpty(property.getDescription()))
	{
		return property.getField(this.m_enableModelPrefix);
	}
	return oFF.XStringUtils.concatenate3(property.getDescription(), oFF.OuCalcPropertyHintProvider.SPACE, property.getField(this.m_enableModelPrefix));
};
oFF.OuCalcPropertyHintProvider.prototype.getDimensionByField = function(text)
{
	return oFF.XStream.of(this.m_dimensions).find((mc) => {
		return oFF.XString.isEqual(mc.getField(this.m_enableModelPrefix), text);
	});
};
oFF.OuCalcPropertyHintProvider.prototype.prepare = function(token)
{
	this.m_properties = oFF.XList.create();
	let dimension = this.getDimensionByField(token.getText());
	if (dimension.isPresent() && !dimension.get().getProperties().isEmpty())
	{
		this.m_properties.addAll(dimension.get().getProperties());
	}
	if (token.getParent().isPresent())
	{
		if (oFF.XStream.of(token.getParent().get().getDataTypes()).anyMatch((tokenDataType) => {
			return tokenDataType.isTypeOf(oFF.FeDataType.DIMENSION) && !tokenDataType.supportsNumericDimensions();
		}))
		{
			this.m_properties = oFF.XCollectionUtils.filter(this.m_properties, (property) => {
				return !property.getValueType().isNumber();
			});
		}
	}
};
oFF.OuCalcPropertyHintProvider.prototype.provide = function()
{
	return oFF.XCollectionUtils.map(this.m_properties, (property) => {
		return oFF.OuCalcHintValue.create(property.getField(this.m_enableModelPrefix), this.buildCaption(property), oFF.OuCalcPropertyHintProvider.SCORE, this.getCssClassName());
	});
};

oFF.OuCalcVariablesHintProvider = function() {};
oFF.OuCalcVariablesHintProvider.prototype = new oFF.OuCalcAbstractHintProvider();
oFF.OuCalcVariablesHintProvider.prototype._ff_c = "OuCalcVariablesHintProvider";

oFF.OuCalcVariablesHintProvider.CSS_CLASS_NAME = "feVariableHint";
oFF.OuCalcVariablesHintProvider.INITIAL_SCORE = 10000;
oFF.OuCalcVariablesHintProvider.SPACE = " ";
oFF.OuCalcVariablesHintProvider.create = function(variables)
{
	let provider = new oFF.OuCalcVariablesHintProvider();
	provider.m_variables = variables;
	provider.setupInternal(oFF.OuCalcVariablesHintProvider.CSS_CLASS_NAME);
	return provider;
};
oFF.OuCalcVariablesHintProvider.prototype.m_currentScore = 0;
oFF.OuCalcVariablesHintProvider.prototype.m_filteredVariables = null;
oFF.OuCalcVariablesHintProvider.prototype.m_variables = null;
oFF.OuCalcVariablesHintProvider.prototype.accept = function(token)
{
	return true;
};
oFF.OuCalcVariablesHintProvider.prototype.buildCaption = function(variable)
{
	let caption = oFF.XStringBuffer.create();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(variable.getDescription()))
	{
		caption.append(variable.getDescription());
		caption.append(oFF.OuCalcVariablesHintProvider.SPACE);
	}
	caption.append(variable.getField(false));
	return caption.toString();
};
oFF.OuCalcVariablesHintProvider.prototype.prepare = function(token)
{
	this.m_filteredVariables = oFF.XCollectionUtils.filter(this.m_variables, (variable) => {
		return this.isTokenTypeOf(token, variable.getDataType());
	});
};
oFF.OuCalcVariablesHintProvider.prototype.provide = function()
{
	this.m_currentScore = oFF.OuCalcVariablesHintProvider.INITIAL_SCORE;
	return oFF.XStream.of(this.m_filteredVariables).map((variable) => {
		return oFF.OuCalcHintSnippet.create(variable.getField(false), this.buildCaption(variable), this.m_currentScore--, this.getCssClassName());
	}).collect(oFF.XStreamCollector.toList());
};

oFF.OuCalcAssistancePanelConfig = function() {};
oFF.OuCalcAssistancePanelConfig.prototype = new oFF.OuCalcPanelConfig();
oFF.OuCalcAssistancePanelConfig.prototype._ff_c = "OuCalcAssistancePanelConfig";

oFF.OuCalcAssistancePanelConfig.create = function(renderConfig)
{
	let instance = new oFF.OuCalcAssistancePanelConfig();
	instance.setupInternal(renderConfig);
	return instance;
};

oFF.OuCalcCodeEditorPanelConfig = function() {};
oFF.OuCalcCodeEditorPanelConfig.prototype = new oFF.OuCalcPanelConfig();
oFF.OuCalcCodeEditorPanelConfig.prototype._ff_c = "OuCalcCodeEditorPanelConfig";

oFF.OuCalcCodeEditorPanelConfig.create = function(renderConfig)
{
	let instance = new oFF.OuCalcCodeEditorPanelConfig();
	instance.setupInternal(renderConfig);
	return instance;
};

oFF.OuCalcDetailsPanelConfig = function() {};
oFF.OuCalcDetailsPanelConfig.prototype = new oFF.OuCalcPanelConfig();
oFF.OuCalcDetailsPanelConfig.prototype._ff_c = "OuCalcDetailsPanelConfig";

oFF.OuCalcDetailsPanelConfig.create = function(renderConfig)
{
	let instance = new oFF.OuCalcDetailsPanelConfig();
	instance.setupInternal(renderConfig);
	return instance;
};

oFF.OuCalcFormulaItemListPanelConfig = function() {};
oFF.OuCalcFormulaItemListPanelConfig.prototype = new oFF.OuCalcPanelConfig();
oFF.OuCalcFormulaItemListPanelConfig.prototype._ff_c = "OuCalcFormulaItemListPanelConfig";

oFF.OuCalcFormulaItemListPanelConfig.create = function(renderConfig)
{
	let instance = new oFF.OuCalcFormulaItemListPanelConfig();
	instance.setupInternal(renderConfig);
	return instance;
};

oFF.OuCalcSinglePluginConfig = function() {};
oFF.OuCalcSinglePluginConfig.prototype = new oFF.OuCalcPanelConfig();
oFF.OuCalcSinglePluginConfig.prototype._ff_c = "OuCalcSinglePluginConfig";

oFF.OuCalcSinglePluginConfig.create = function(renderConfig, leftPanelWidth, rightPanelWidth)
{
	let instance = new oFF.OuCalcSinglePluginConfig();
	instance.setupInternal(renderConfig);
	instance.m_leftPanelWidth = leftPanelWidth;
	instance.m_rightPanelWidth = rightPanelWidth;
	return instance;
};
oFF.OuCalcSinglePluginConfig.createEmpty = function()
{
	let instance = new oFF.OuCalcSinglePluginConfig();
	instance.setupInternal(null);
	return instance;
};
oFF.OuCalcSinglePluginConfig.prototype.m_leftPanelWidth = null;
oFF.OuCalcSinglePluginConfig.prototype.m_rightPanelWidth = null;
oFF.OuCalcSinglePluginConfig.prototype.getLeftPanelWidth = function()
{
	return this.m_leftPanelWidth;
};
oFF.OuCalcSinglePluginConfig.prototype.getRightPanelWidth = function()
{
	return this.m_rightPanelWidth;
};

oFF.OuCalcTreePanelItem = function() {};
oFF.OuCalcTreePanelItem.prototype = new oFF.OuCalcPanelItem();
oFF.OuCalcTreePanelItem.prototype._ff_c = "OuCalcTreePanelItem";

oFF.OuCalcTreePanelItem.ROOT_ID = "__ROOT_ID__";
oFF.OuCalcTreePanelItem.createRoot = function()
{
	let instance = new oFF.OuCalcTreePanelItem();
	instance.setupInternal(oFF.OuCalcTreePanelItem.ROOT_ID, oFF.OuCalcTreePanelItem.ROOT_ID, oFF.OuCalcTreePanelItem.ROOT_ID, oFF.OuCalcTreePanelItem.ROOT_ID, true, null, null, null);
	instance.m_children = oFF.XLinkedHashMapByString.create();
	return instance;
};
oFF.OuCalcTreePanelItem.createWithItem = function(item)
{
	let instance = new oFF.OuCalcTreePanelItem();
	instance.setupInternal(item.getUniqueKey(), item.getId(), item.getTechnicalIdentifier(), item.getDisplayName(), item.isEnabled(), item.getCategory(), item.getTooltip().orElse(null), item.getParentId().orElse(null));
	instance.m_children = oFF.XLinkedHashMapByString.create();
	return instance;
};
oFF.OuCalcTreePanelItem.prototype.m_children = null;
oFF.OuCalcTreePanelItem.prototype.m_parent = null;
oFF.OuCalcTreePanelItem.prototype.addChild = function(child)
{
	oFF.XObjectExt.assertFalseExt(this.m_children.containsKey(child.getUniqueKey()), oFF.XStringUtils.concatenate3("Item with the key '", child.getUniqueKey(), "', already exists!"));
	this.m_children.put(child.getUniqueKey(), child);
	child.m_parent = this;
};
oFF.OuCalcTreePanelItem.prototype.getChildren = function()
{
	return this.m_children.getValuesAsReadOnlyList();
};
oFF.OuCalcTreePanelItem.prototype.getParent = function()
{
	return oFF.XOptional.ofNullable(this.m_parent);
};
oFF.OuCalcTreePanelItem.prototype.isLeaf = function()
{
	return !this.m_children.hasElements();
};
oFF.OuCalcTreePanelItem.prototype.releaseObject = function()
{
	this.m_parent = null;
	oFF.XStream.of(this.m_children).forEach((child) => {
		oFF.XObjectExt.release(child);
	});
	this.m_children.clear();
	this.m_children = oFF.XObjectExt.release(this.m_children);
	oFF.OuCalcPanelItem.prototype.releaseObject.call( this );
};
oFF.OuCalcTreePanelItem.prototype.removeChild = function(child)
{
	this.m_children.remove(child.getUniqueKey());
};

oFF.OuLambdaSyncListener = function() {};
oFF.OuLambdaSyncListener.prototype = new oFF.XObject();
oFF.OuLambdaSyncListener.prototype._ff_c = "OuLambdaSyncListener";

oFF.OuLambdaSyncListener.create = function(procedure)
{
	let obj = new oFF.OuLambdaSyncListener();
	obj.m_action = procedure;
	return obj;
};
oFF.OuLambdaSyncListener.prototype.m_action = null;
oFF.OuLambdaSyncListener.prototype.onSynchronized = function(messages, data, customIdentifier)
{
	this.m_action(messages, data);
};
oFF.OuLambdaSyncListener.prototype.releaseObject = function()
{
	this.m_action = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OrcaLinkVarProxyData = function() {};
oFF.OrcaLinkVarProxyData.prototype = new oFF.OlapUiMultiRequestHelper();
oFF.OrcaLinkVarProxyData.prototype._ff_c = "OrcaLinkVarProxyData";

oFF.OrcaLinkVarProxyData.createData = function(proxyId, listener, customIdentifier)
{
	let obj = new oFF.OrcaLinkVarProxyData();
	obj.setupExt(proxyId, listener, customIdentifier);
	return obj;
};
oFF.OrcaLinkVarProxyData.prototype.m_proxyId = null;
oFF.OrcaLinkVarProxyData.prototype.getProxyId = function()
{
	return this.m_proxyId;
};
oFF.OrcaLinkVarProxyData.prototype.releaseObject = function()
{
	this.m_proxyId = null;
	oFF.OlapUiMultiRequestHelper.prototype.releaseObject.call( this );
};
oFF.OrcaLinkVarProxyData.prototype.setupExt = function(proxyId, listener, customIdentifier)
{
	this.setupHelper(listener, customIdentifier);
	this.m_proxyId = proxyId;
};
oFF.OrcaLinkVarProxyData.prototype.toString = function()
{
	return this.getProxyId();
};

oFF.OuMeasureInputDataProviderAccount = function() {};
oFF.OuMeasureInputDataProviderAccount.prototype = new oFF.OuMeasureInputDataProvider();
oFF.OuMeasureInputDataProviderAccount.prototype._ff_c = "OuMeasureInputDataProviderAccount";

oFF.OuMeasureInputDataProviderAccount.create = function(queryModel)
{
	let dataProvider = new oFF.OuMeasureInputDataProviderAccount();
	dataProvider.setupInternal(queryModel);
	return dataProvider;
};
oFF.OuMeasureInputDataProviderAccount.prototype.assertQueryModelType = function(queryModel)
{
	oFF.XObjectExt.assertTrueExt(queryModel.isAccountModel(), "Query model should be 'account model'");
};
oFF.OuMeasureInputDataProviderAccount.prototype.getMemberDimension = function()
{
	let measure = this.m_queryModel.getAccountDimension();
	if (measure.getAllStructureMembers().size() === 0)
	{
		measure = this.m_queryModel.getMeasureDimension();
	}
	return measure;
};

oFF.OuMeasureInputDataProviderMeasureModel = function() {};
oFF.OuMeasureInputDataProviderMeasureModel.prototype = new oFF.OuMeasureInputDataProvider();
oFF.OuMeasureInputDataProviderMeasureModel.prototype._ff_c = "OuMeasureInputDataProviderMeasureModel";

oFF.OuMeasureInputDataProviderMeasureModel.create = function(queryModel)
{
	return oFF.OuMeasureInputDataProviderMeasureModel.createInternal(queryModel, null);
};
oFF.OuMeasureInputDataProviderMeasureModel.createInternal = function(queryModel, structure)
{
	let dataProvider = new oFF.OuMeasureInputDataProviderMeasureModel();
	dataProvider.setupInternal(queryModel);
	dataProvider.m_structure = structure;
	return dataProvider;
};
oFF.OuMeasureInputDataProviderMeasureModel.createWithStructure = function(queryModel, structure)
{
	oFF.XObjectExt.assertNotNullExt(structure, "Structure is null");
	return oFF.OuMeasureInputDataProviderMeasureModel.createInternal(queryModel, structure);
};
oFF.OuMeasureInputDataProviderMeasureModel.prototype.m_structure = null;
oFF.OuMeasureInputDataProviderMeasureModel.prototype.assertQueryModelType = function(queryModel)
{
	oFF.XObjectExt.assertTrueExt(queryModel.getAccountDimension() === null, "Query model should be 'measure model'");
};
oFF.OuMeasureInputDataProviderMeasureModel.prototype.getMemberDimension = function()
{
	if (oFF.notNull(this.m_structure))
	{
		return this.m_structure;
	}
	return this.m_queryModel.getMeasureDimension();
};

oFF.OuMeasureInputDataProviderUAM = function() {};
oFF.OuMeasureInputDataProviderUAM.prototype = new oFF.OuMeasureInputDataProvider();
oFF.OuMeasureInputDataProviderUAM.prototype._ff_c = "OuMeasureInputDataProviderUAM";

oFF.OuMeasureInputDataProviderUAM.create = function(queryModel)
{
	return oFF.OuMeasureInputDataProviderUAM.createInternal(queryModel, null);
};
oFF.OuMeasureInputDataProviderUAM.createInternal = function(queryModel, structure)
{
	let dataProvider = new oFF.OuMeasureInputDataProviderUAM();
	dataProvider.setupInternal(queryModel);
	dataProvider.m_structure = structure;
	return dataProvider;
};
oFF.OuMeasureInputDataProviderUAM.createWithStructure = function(queryModel, structure)
{
	oFF.XObjectExt.assertNotNullExt(structure, "Structure is null");
	return oFF.OuMeasureInputDataProviderUAM.createInternal(queryModel, structure);
};
oFF.OuMeasureInputDataProviderUAM.prototype.m_structure = null;
oFF.OuMeasureInputDataProviderUAM.prototype.assertQueryModelType = function(queryModel)
{
	oFF.XObjectExt.assertTrueExt(queryModel.isUniversalAccountModel(), "Query model should be 'Universal Account Model'");
};
oFF.OuMeasureInputDataProviderUAM.prototype.getMemberDimension = function()
{
	if (oFF.notNull(this.m_structure))
	{
		return this.m_structure;
	}
	let measure = this.m_queryModel.getAccountDimension();
	if (measure.getAllStructureMembers().isEmpty())
	{
		measure = this.m_queryModel.getMeasureDimension();
	}
	return measure;
};

oFF.OlapUiDialogHandle = function() {};
oFF.OlapUiDialogHandle.prototype = new oFF.XObject();
oFF.OlapUiDialogHandle.prototype._ff_c = "OlapUiDialogHandle";

oFF.OlapUiDialogHandle.DIALOG_CSS_CLASS = "ffSacDialog";
oFF.OlapUiDialogHandle.createDialogHandle = function(dialog)
{
	let obj = new oFF.OlapUiDialogHandle();
	obj.setupDialogHandle(dialog);
	return obj;
};
oFF.OlapUiDialogHandle.prototype.m_dialog = null;
oFF.OlapUiDialogHandle.prototype.m_genesis = null;
oFF.OlapUiDialogHandle.prototype.addCssClass = function(cssClass)
{
	return this.m_dialog.addCssClass(cssClass);
};
oFF.OlapUiDialogHandle.prototype.addNewButton = function()
{
	return this.m_dialog.addNewDialogButton();
};
oFF.OlapUiDialogHandle.prototype.close = function()
{
	return this.m_dialog.close();
};
oFF.OlapUiDialogHandle.prototype.getCssClass = function()
{
	return this.m_dialog.getCssClass();
};
oFF.OlapUiDialogHandle.prototype.getGenesis = function()
{
	return this.m_genesis;
};
oFF.OlapUiDialogHandle.prototype.getListenerOnAfterClose = function()
{
	return this.m_dialog.getListenerOnAfterClose();
};
oFF.OlapUiDialogHandle.prototype.getListenerOnAfterOpen = function()
{
	return this.m_dialog.getListenerOnAfterOpen();
};
oFF.OlapUiDialogHandle.prototype.getListenerOnBeforeClose = function()
{
	return this.m_dialog.getListenerOnBeforeClose();
};
oFF.OlapUiDialogHandle.prototype.getListenerOnBeforeOpen = function()
{
	return this.m_dialog.getListenerOnBeforeOpen();
};
oFF.OlapUiDialogHandle.prototype.getListenerOnResize = function()
{
	return this.m_dialog.getListenerOnResize();
};
oFF.OlapUiDialogHandle.prototype.getOffsetWidth = function()
{
	return this.m_dialog.getOffsetWidth();
};
oFF.OlapUiDialogHandle.prototype.insertNewButton = function(index)
{
	let button = this.m_genesis.newControl(oFF.UiType.DIALOG_BUTTON);
	this.m_dialog.insertDialogButton(button, index);
	return button;
};
oFF.OlapUiDialogHandle.prototype.isBusy = function()
{
	return this.m_dialog.isBusy();
};
oFF.OlapUiDialogHandle.prototype.isOpen = function()
{
	return this.m_dialog.isOpen();
};
oFF.OlapUiDialogHandle.prototype.isResizable = function()
{
	return this.m_dialog.isResizable();
};
oFF.OlapUiDialogHandle.prototype.open = function()
{
	return this.m_dialog.open();
};
oFF.OlapUiDialogHandle.prototype.registerOnAfterClose = function(listener)
{
	return this.m_dialog.registerOnAfterClose(listener);
};
oFF.OlapUiDialogHandle.prototype.registerOnAfterOpen = function(listener)
{
	return this.m_dialog.registerOnAfterOpen(listener);
};
oFF.OlapUiDialogHandle.prototype.registerOnBeforeClose = function(listener)
{
	return this.m_dialog.registerOnBeforeClose(listener);
};
oFF.OlapUiDialogHandle.prototype.registerOnBeforeOpen = function(listener)
{
	return this.m_dialog.registerOnBeforeOpen(listener);
};
oFF.OlapUiDialogHandle.prototype.registerOnResize = function(listener)
{
	return this.m_dialog.registerOnResize(listener);
};
oFF.OlapUiDialogHandle.prototype.releaseObject = function()
{
	if (oFF.notNull(this.m_dialog) && this.m_dialog.isOpen())
	{
		this.m_dialog.close();
	}
	this.m_dialog = oFF.XObjectExt.release(this.m_dialog);
	this.m_genesis = oFF.XObjectExt.release(this.m_genesis);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OlapUiDialogHandle.prototype.removeCssClass = function(cssClass)
{
	return this.m_dialog.removeCssClass(cssClass);
};
oFF.OlapUiDialogHandle.prototype.setBusy = function(busy)
{
	return this.m_dialog.setBusy(busy);
};
oFF.OlapUiDialogHandle.prototype.setHeight = function(height)
{
	this.m_dialog.setHeight(height);
};
oFF.OlapUiDialogHandle.prototype.setName = function(name)
{
	this.m_dialog.setName(name);
};
oFF.OlapUiDialogHandle.prototype.setResizable = function(resizable)
{
	return this.m_dialog.setResizable(resizable);
};
oFF.OlapUiDialogHandle.prototype.setTitle = function(title)
{
	this.m_dialog.setTitle(title);
};
oFF.OlapUiDialogHandle.prototype.setWidth = function(width)
{
	this.m_dialog.setWidth(width);
};
oFF.OlapUiDialogHandle.prototype.setupDialogHandle = function(dialog)
{
	this.m_dialog = dialog;
	this.m_dialog.addCssClass(oFF.OlapUiDialogHandle.DIALOG_CSS_CLASS);
	this.m_dialog.setPadding(oFF.UiCssBoxEdges.create("1rem"));
	this.m_genesis = oFF.UiGenesis.create(this.m_dialog);
};
oFF.OlapUiDialogHandle.prototype.shake = function()
{
	this.m_dialog.shake();
};

oFF.OlapUiDummyHandle = function() {};
oFF.OlapUiDummyHandle.prototype = new oFF.XObject();
oFF.OlapUiDummyHandle.prototype._ff_c = "OlapUiDummyHandle";

oFF.OlapUiDummyHandle.createDummy = function()
{
	let obj = new oFF.OlapUiDummyHandle();
	obj.m_genesis = oFF.UiGenesis.create(oFF.UiContextDummy.getSingleton());
	return obj;
};
oFF.OlapUiDummyHandle.createFactory = function()
{
	return new oFF.OlapUiDummyHandle();
};
oFF.OlapUiDummyHandle.prototype.m_afterClose = null;
oFF.OlapUiDummyHandle.prototype.m_afterOpen = null;
oFF.OlapUiDummyHandle.prototype.m_beforeClose = null;
oFF.OlapUiDummyHandle.prototype.m_beforeOpen = null;
oFF.OlapUiDummyHandle.prototype.m_genesis = null;
oFF.OlapUiDummyHandle.prototype.addCssClass = function(cssClass)
{
	return oFF.UiContextDummy.getSingleton();
};
oFF.OlapUiDummyHandle.prototype.addNewButton = function()
{
	return oFF.UiContextDummy.getSingleton();
};
oFF.OlapUiDummyHandle.prototype.close = function()
{
	let event = oFF.UiControlEvent.create(oFF.UiContextDummy.getSingleton());
	if (oFF.notNull(this.m_beforeClose))
	{
		this.m_beforeClose.onBeforeClose(event);
	}
	if (oFF.notNull(this.m_afterClose))
	{
		this.m_afterClose.onAfterClose(event);
	}
	return oFF.UiContextDummy.getSingleton();
};
oFF.OlapUiDummyHandle.prototype.getCssClass = function()
{
	return null;
};
oFF.OlapUiDummyHandle.prototype.getGenesis = function()
{
	return this.m_genesis;
};
oFF.OlapUiDummyHandle.prototype.getInstance = function()
{
	return oFF.OlapUiDummyHandle.createDummy();
};
oFF.OlapUiDummyHandle.prototype.getListenerOnAfterClose = function()
{
	return this.m_afterClose;
};
oFF.OlapUiDummyHandle.prototype.getListenerOnAfterOpen = function()
{
	return this.m_afterOpen;
};
oFF.OlapUiDummyHandle.prototype.getListenerOnBeforeClose = function()
{
	return this.m_beforeClose;
};
oFF.OlapUiDummyHandle.prototype.getListenerOnBeforeOpen = function()
{
	return this.m_beforeOpen;
};
oFF.OlapUiDummyHandle.prototype.getListenerOnResize = function()
{
	return null;
};
oFF.OlapUiDummyHandle.prototype.getOffsetWidth = function()
{
	return 0;
};
oFF.OlapUiDummyHandle.prototype.insertNewButton = function(index)
{
	return oFF.UiContextDummy.getSingleton();
};
oFF.OlapUiDummyHandle.prototype.isBusy = function()
{
	return false;
};
oFF.OlapUiDummyHandle.prototype.isOpen = function()
{
	return false;
};
oFF.OlapUiDummyHandle.prototype.isResizable = function()
{
	return false;
};
oFF.OlapUiDummyHandle.prototype.open = function()
{
	if (oFF.notNull(this.m_afterOpen))
	{
		this.m_afterOpen.onAfterOpen(oFF.UiControlEvent.create(oFF.UiContextDummy.getSingleton()));
	}
	return oFF.UiContextDummy.getSingleton();
};
oFF.OlapUiDummyHandle.prototype.registerOnAfterClose = function(listener)
{
	this.m_afterClose = listener;
	return oFF.UiContextDummy.getSingleton();
};
oFF.OlapUiDummyHandle.prototype.registerOnAfterOpen = function(listener)
{
	this.m_afterOpen = listener;
	return oFF.UiContextDummy.getSingleton();
};
oFF.OlapUiDummyHandle.prototype.registerOnBeforeClose = function(listener)
{
	this.m_beforeClose = listener;
	return oFF.UiContextDummy.getSingleton();
};
oFF.OlapUiDummyHandle.prototype.registerOnBeforeOpen = function(listener)
{
	this.m_beforeOpen = listener;
	return oFF.UiContextDummy.getSingleton();
};
oFF.OlapUiDummyHandle.prototype.registerOnResize = function(listener)
{
	return null;
};
oFF.OlapUiDummyHandle.prototype.removeCssClass = function(cssClass)
{
	return oFF.UiContextDummy.getSingleton();
};
oFF.OlapUiDummyHandle.prototype.setBusy = function(busy)
{
	return oFF.UiContextDummy.getSingleton();
};
oFF.OlapUiDummyHandle.prototype.setHeight = function(height) {};
oFF.OlapUiDummyHandle.prototype.setName = function(name) {};
oFF.OlapUiDummyHandle.prototype.setResizable = function(resizable)
{
	return null;
};
oFF.OlapUiDummyHandle.prototype.setTitle = function(title) {};
oFF.OlapUiDummyHandle.prototype.setWidth = function(width) {};
oFF.OlapUiDummyHandle.prototype.shake = function() {};

oFF.OlapUiNavigationHandle = function() {};
oFF.OlapUiNavigationHandle.prototype = new oFF.XObject();
oFF.OlapUiNavigationHandle.prototype._ff_c = "OlapUiNavigationHandle";

oFF.OlapUiNavigationHandle.createNavigationHandle = function(container, page)
{
	let obj = new oFF.OlapUiNavigationHandle();
	obj.setupNavigationHandle(container, page);
	return obj;
};
oFF.OlapUiNavigationHandle.prototype.m_afterClose = null;
oFF.OlapUiNavigationHandle.prototype.m_afterOpen = null;
oFF.OlapUiNavigationHandle.prototype.m_beforeClose = null;
oFF.OlapUiNavigationHandle.prototype.m_beforeOpen = null;
oFF.OlapUiNavigationHandle.prototype.m_genesis = null;
oFF.OlapUiNavigationHandle.prototype.m_navigationContainer = null;
oFF.OlapUiNavigationHandle.prototype.m_page = null;
oFF.OlapUiNavigationHandle.prototype.addCssClass = function(cssClass)
{
	return this.m_navigationContainer.addCssClass(cssClass);
};
oFF.OlapUiNavigationHandle.prototype.addNewButton = function()
{
	let button = this.m_genesis.newControl(oFF.UiType.PAGE_BUTTON);
	this.m_page.addPageButton(button);
	return button;
};
oFF.OlapUiNavigationHandle.prototype.close = function()
{
	if (oFF.notNull(this.m_beforeClose))
	{
		this.m_beforeClose.onBeforeClose(oFF.UiControlEvent.create(this.m_page));
	}
	this.m_navigationContainer.popPage();
	if (oFF.notNull(this.m_afterClose))
	{
		this.m_afterClose.onAfterClose(oFF.UiControlEvent.create(this.m_page));
	}
	return this.m_page;
};
oFF.OlapUiNavigationHandle.prototype.getCssClass = function()
{
	return this.m_navigationContainer.getCssClass();
};
oFF.OlapUiNavigationHandle.prototype.getGenesis = function()
{
	return this.m_genesis;
};
oFF.OlapUiNavigationHandle.prototype.getListenerOnAfterClose = function()
{
	return this.m_afterClose;
};
oFF.OlapUiNavigationHandle.prototype.getListenerOnAfterOpen = function()
{
	return this.m_afterOpen;
};
oFF.OlapUiNavigationHandle.prototype.getListenerOnBeforeClose = function()
{
	return this.m_beforeClose;
};
oFF.OlapUiNavigationHandle.prototype.getListenerOnBeforeOpen = function()
{
	return this.m_beforeOpen;
};
oFF.OlapUiNavigationHandle.prototype.getListenerOnResize = function()
{
	return null;
};
oFF.OlapUiNavigationHandle.prototype.getOffsetWidth = function()
{
	return 0;
};
oFF.OlapUiNavigationHandle.prototype.insertNewButton = function(index)
{
	let button = this.m_genesis.newControl(oFF.UiType.PAGE_BUTTON);
	this.m_page.insertPageButton(button, index);
	return button;
};
oFF.OlapUiNavigationHandle.prototype.isBusy = function()
{
	return this.m_genesis.getRoot().isBusy();
};
oFF.OlapUiNavigationHandle.prototype.isOpen = function()
{
	return this.m_navigationContainer.getIndexOfPage(this.m_page) !== -1;
};
oFF.OlapUiNavigationHandle.prototype.isResizable = function()
{
	return false;
};
oFF.OlapUiNavigationHandle.prototype.open = function()
{
	this.m_navigationContainer.pushPage(this.m_page);
	if (oFF.notNull(this.m_afterOpen))
	{
		this.m_afterOpen.onAfterOpen(oFF.UiControlEvent.create(this.m_page));
	}
	return this.m_page;
};
oFF.OlapUiNavigationHandle.prototype.registerOnAfterClose = function(listener)
{
	this.m_afterClose = listener;
	return this.m_page;
};
oFF.OlapUiNavigationHandle.prototype.registerOnAfterOpen = function(listener)
{
	this.m_afterOpen = listener;
	return this.m_page;
};
oFF.OlapUiNavigationHandle.prototype.registerOnBeforeClose = function(listener)
{
	this.m_beforeClose = listener;
	return this.m_page;
};
oFF.OlapUiNavigationHandle.prototype.registerOnBeforeOpen = function(listener)
{
	this.m_beforeOpen = listener;
	return this.m_page;
};
oFF.OlapUiNavigationHandle.prototype.registerOnResize = function(listener)
{
	return null;
};
oFF.OlapUiNavigationHandle.prototype.releaseObject = function()
{
	this.m_navigationContainer.clearPages();
	this.m_navigationContainer = null;
	this.m_page = null;
	this.m_genesis = oFF.XObjectExt.release(this.m_genesis);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OlapUiNavigationHandle.prototype.removeCssClass = function(cssClass)
{
	return this.m_navigationContainer.removeCssClass(cssClass);
};
oFF.OlapUiNavigationHandle.prototype.setBusy = function(busy)
{
	this.m_genesis.getRoot().setBusy(busy);
	return this.m_page;
};
oFF.OlapUiNavigationHandle.prototype.setHeight = function(height) {};
oFF.OlapUiNavigationHandle.prototype.setName = function(name)
{
	this.m_page.setName(name);
};
oFF.OlapUiNavigationHandle.prototype.setResizable = function(resizable)
{
	return null;
};
oFF.OlapUiNavigationHandle.prototype.setTitle = function(title)
{
	this.m_page.setTitle(title);
};
oFF.OlapUiNavigationHandle.prototype.setWidth = function(width) {};
oFF.OlapUiNavigationHandle.prototype.setupNavigationHandle = function(container, page)
{
	this.m_navigationContainer = container;
	this.m_page = page;
	this.m_page.setShowNavButton(false);
	this.m_genesis = oFF.UiGenesis.create(this.m_page);
};
oFF.OlapUiNavigationHandle.prototype.shake = function() {};

oFF.OlapUiPageHandle = function() {};
oFF.OlapUiPageHandle.prototype = new oFF.XObject();
oFF.OlapUiPageHandle.prototype._ff_c = "OlapUiPageHandle";

oFF.OlapUiPageHandle.createPageHandle = function(page)
{
	let obj = new oFF.OlapUiPageHandle();
	obj.setupPageHandle(page);
	return obj;
};
oFF.OlapUiPageHandle.prototype.m_afterClose = null;
oFF.OlapUiPageHandle.prototype.m_afterOpen = null;
oFF.OlapUiPageHandle.prototype.m_beforeClose = null;
oFF.OlapUiPageHandle.prototype.m_beforeOpen = null;
oFF.OlapUiPageHandle.prototype.m_genesis = null;
oFF.OlapUiPageHandle.prototype.m_page = null;
oFF.OlapUiPageHandle.prototype.addCssClass = function(cssClass)
{
	return this.m_page.addCssClass(cssClass);
};
oFF.OlapUiPageHandle.prototype.addNewButton = function()
{
	let button = this.m_genesis.newControl(oFF.UiType.PAGE_BUTTON);
	this.m_page.addPageButton(button);
	return button;
};
oFF.OlapUiPageHandle.prototype.close = function()
{
	if (oFF.notNull(this.m_beforeClose))
	{
		this.m_beforeClose.onBeforeClose(oFF.UiControlEvent.create(this.m_page));
	}
	if (oFF.notNull(this.m_afterClose))
	{
		this.m_afterClose.onAfterClose(oFF.UiControlEvent.create(this.m_page));
	}
	return this.m_page;
};
oFF.OlapUiPageHandle.prototype.getCssClass = function()
{
	return this.m_page.getCssClass();
};
oFF.OlapUiPageHandle.prototype.getGenesis = function()
{
	return this.m_genesis;
};
oFF.OlapUiPageHandle.prototype.getListenerOnAfterClose = function()
{
	return this.m_afterClose;
};
oFF.OlapUiPageHandle.prototype.getListenerOnAfterOpen = function()
{
	return this.m_afterOpen;
};
oFF.OlapUiPageHandle.prototype.getListenerOnBeforeClose = function()
{
	return this.m_beforeClose;
};
oFF.OlapUiPageHandle.prototype.getListenerOnBeforeOpen = function()
{
	return this.m_beforeOpen;
};
oFF.OlapUiPageHandle.prototype.getListenerOnResize = function()
{
	return null;
};
oFF.OlapUiPageHandle.prototype.getOffsetWidth = function()
{
	return 0;
};
oFF.OlapUiPageHandle.prototype.insertNewButton = function(index)
{
	let button = this.m_genesis.newControl(oFF.UiType.PAGE_BUTTON);
	this.m_page.insertPageButton(button, index);
	return button;
};
oFF.OlapUiPageHandle.prototype.isBusy = function()
{
	return this.m_genesis.getRoot().isBusy();
};
oFF.OlapUiPageHandle.prototype.isOpen = function()
{
	return this.m_page.getParent() !== null;
};
oFF.OlapUiPageHandle.prototype.isResizable = function()
{
	return false;
};
oFF.OlapUiPageHandle.prototype.open = function()
{
	if (oFF.notNull(this.m_afterOpen))
	{
		this.m_afterOpen.onAfterOpen(oFF.UiControlEvent.create(this.m_page));
	}
	return this.m_page;
};
oFF.OlapUiPageHandle.prototype.registerOnAfterClose = function(listener)
{
	this.m_afterClose = listener;
	return this.m_page;
};
oFF.OlapUiPageHandle.prototype.registerOnAfterOpen = function(listener)
{
	this.m_afterOpen = listener;
	return this.m_page;
};
oFF.OlapUiPageHandle.prototype.registerOnBeforeClose = function(listener)
{
	this.m_beforeClose = listener;
	return this.m_page;
};
oFF.OlapUiPageHandle.prototype.registerOnBeforeOpen = function(listener)
{
	this.m_beforeOpen = listener;
	return this.m_page;
};
oFF.OlapUiPageHandle.prototype.registerOnResize = function(listener)
{
	return null;
};
oFF.OlapUiPageHandle.prototype.releaseObject = function()
{
	this.m_page = null;
	this.m_genesis = oFF.XObjectExt.release(this.m_genesis);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OlapUiPageHandle.prototype.removeCssClass = function(cssClass)
{
	return this.m_page.removeCssClass(cssClass);
};
oFF.OlapUiPageHandle.prototype.setBusy = function(busy)
{
	this.m_genesis.getRoot().setBusy(busy);
	return this.m_page;
};
oFF.OlapUiPageHandle.prototype.setHeight = function(height) {};
oFF.OlapUiPageHandle.prototype.setName = function(name)
{
	this.m_page.setName(name);
};
oFF.OlapUiPageHandle.prototype.setResizable = function(resizable)
{
	return null;
};
oFF.OlapUiPageHandle.prototype.setTitle = function(title)
{
	this.m_page.setTitle(title);
};
oFF.OlapUiPageHandle.prototype.setWidth = function(width) {};
oFF.OlapUiPageHandle.prototype.setupPageHandle = function(page)
{
	this.m_page = page;
	this.m_genesis = oFF.UiGenesis.create(this.m_page);
};
oFF.OlapUiPageHandle.prototype.shake = function() {};

oFF.OlapUiValueHelpDimension = function() {};
oFF.OlapUiValueHelpDimension.prototype = new oFF.OlapUiValueHelpAbstract();
oFF.OlapUiValueHelpDimension.prototype._ff_c = "OlapUiValueHelpDimension";

oFF.OlapUiValueHelpDimension.create = function(valueRequestObject)
{
	let obj = new oFF.OlapUiValueHelpDimension();
	obj.setupExt(valueRequestObject);
	return obj;
};
oFF.OlapUiValueHelpDimension.prototype.m_hierarchyChanged = false;
oFF.OlapUiValueHelpDimension.prototype.m_hierarchyName = null;
oFF.OlapUiValueHelpDimension.prototype.configureValueHelp = function(dimension, readMode, startPage, endPage, pageSize, fields, defaultDrill)
{
	oFF.OlapUiValueHelpAbstract.prototype.configureValueHelp.call( this , dimension, readMode, startPage, endPage, pageSize, fields, defaultDrill);
	if (readMode === oFF.QMemberReadMode.BOOKED_AND_SPACE_AND_STATE)
	{
		dimension.setSelectorCascadingReadModeAndFilter();
	}
};
oFF.OlapUiValueHelpDimension.prototype.getDimension = function()
{
	return this.m_valueRequestObject;
};
oFF.OlapUiValueHelpDimension.prototype.getHierarchyName = function()
{
	return this.m_hierarchyChanged ? this.m_hierarchyName : this.m_valueRequestObject.getHierarchyName();
};
oFF.OlapUiValueHelpDimension.prototype.getReadMode = function(readMode)
{
	if (readMode === oFF.OlapUiReadMode.QUERY_DEFAULT)
	{
		let dimension = this.getDimension();
		let dfReadMode = dimension.getReadModeDefault(this.getSystemType(dimension).isTypeOf(oFF.SystemType.HANA) ? oFF.QContextType.RESULT_SET : oFF.QContextType.SELECTOR);
		if (oFF.notNull(dfReadMode))
		{
			return dfReadMode;
		}
	}
	if (readMode === oFF.OlapUiReadMode.MASTER)
	{
		return oFF.QMemberReadMode.MASTER_AND_SPACE;
	}
	return readMode === oFF.OlapUiReadMode.BOOKED_CASCADING ? oFF.QMemberReadMode.BOOKED_AND_SPACE_AND_STATE : oFF.QMemberReadMode.BOOKED_AND_SPACE;
};
oFF.OlapUiValueHelpDimension.prototype.isHierarchicalValueHelp = function()
{
	return this.m_hierarchyChanged ? oFF.XStringUtils.isNotNullAndNotEmpty(this.m_hierarchyName) : this.m_valueRequestObject.isHierarchyActive();
};
oFF.OlapUiValueHelpDimension.prototype.processChildFetch = function(node, offset, amount, fields, readMode, listener, customIdentifier)
{
	let dimension = node.getDimension();
	let memberReadMode = this.getReadMode(readMode);
	this.configureValueHelp(dimension, memberReadMode, 0, 0, amount, fields, false);
	dimension.setSelectorPaging(offset, offset + amount);
	node.processValueHelpChildFetch(oFF.OlapUiValueHelpAbstract.s_syncType, listener, customIdentifier);
};
oFF.OlapUiValueHelpDimension.prototype.processDataRange = function(listener, customIdentifier)
{
	let dimension = this.m_valueRequestObject;
	let memberReadMode = this.getReadMode(oFF.OlapUiReadMode.BOOKED);
	let ignoreQueryDynamicFilterTmp = dimension.getQueryModel() !== null && dimension.getQueryModel().isValueHelpIgnoreQueryDynamicFilter();
	let hierarchyChangedTmp = this.m_hierarchyChanged;
	let hierarchyNameTmp = this.m_hierarchyName;
	this.m_hierarchyChanged = true;
	this.m_hierarchyName = null;
	this.configureValueHelp(dimension, memberReadMode, 0, -1, 0, null, true);
	dimension.setSelectorGettingInterval(true);
	dimension.setSelectorHierarchyActive(false);
	this.setIgnoreQueryDynamicFilter(true);
	if (dimension.getFlatKeyField().getValueType().isDateBased())
	{
		dimension.addSelectorFilterForKey("0001-01-01", oFF.ComparisonOperator.GREATER_THAN);
	}
	dimension.processValueHelp(oFF.OlapUiValueHelpAbstract.s_syncType, listener, customIdentifier);
	this.m_hierarchyChanged = hierarchyChangedTmp;
	this.m_hierarchyName = hierarchyNameTmp;
	this.setIgnoreQueryDynamicFilter(ignoreQueryDynamicFilterTmp);
};
oFF.OlapUiValueHelpDimension.prototype.processFetchItems = function(items, fields, listener, customIdentifier)
{
	let dimension = this.m_valueRequestObject;
	if (!this.configureFetchItems(dimension, this.getReadMode(oFF.OlapUiReadMode.MASTER), items, fields))
	{
		listener.onValuehelpExecuted(oFF.ExtResult.create(oFF.XList.create(), null), null, customIdentifier);
		return;
	}
	dimension.processValueHelp(oFF.OlapUiValueHelpAbstract.s_syncType, listener, customIdentifier);
};
oFF.OlapUiValueHelpDimension.prototype.processSearch = function(searchPattern, searchFields, fields, pageSize, loadParentNodes, readMode, listener, customIdentifier)
{
	let dimension = this.m_valueRequestObject;
	let memberReadMode = this.getReadMode(readMode);
	this.configureValueHelp(dimension, memberReadMode, 0, 0, pageSize, fields, false);
	let nullFilterAdded = this.addNullFilter(searchPattern, memberReadMode);
	let filterAdded = dimension.addSelectorFilterForFields(searchPattern, searchFields, oFF.ComparisonOperator.MATCH, loadParentNodes, true);
	if (!nullFilterAdded && !filterAdded)
	{
		listener.onValuehelpExecuted(oFF.ExtResult.create(oFF.XList.create(), null), null, customIdentifier);
		return;
	}
	dimension.processValueHelp(oFF.OlapUiValueHelpAbstract.s_syncType, listener, customIdentifier);
};
oFF.OlapUiValueHelpDimension.prototype.processValueHelp = function(startPage, endPage, pageSize, fields, readMode, listener, customIdentifier)
{
	let dimension = this.m_valueRequestObject;
	let memberReadMode = this.getReadMode(readMode);
	this.configureValueHelp(dimension, memberReadMode, startPage, endPage, pageSize, fields, true);
	dimension.processValueHelp(oFF.OlapUiValueHelpAbstract.s_syncType, listener, customIdentifier);
};
oFF.OlapUiValueHelpDimension.prototype.releaseObject = function()
{
	oFF.OlapUiValueHelpAbstract.prototype.releaseObject.call( this );
	this.m_hierarchyName = null;
};
oFF.OlapUiValueHelpDimension.prototype.setHierarchyName = function(hierarchyName)
{
	this.m_hierarchyName = hierarchyName;
	this.m_hierarchyChanged = true;
	this.m_valueRequestObject.setSelectorHierarchyActive(this.isHierarchicalValueHelp());
};
oFF.OlapUiValueHelpDimension.prototype.setIgnoreQueryDynamicFilter = function(ignoreQueryDynamicFilter)
{
	let dimension = this.getDimension();
	let systemType = this.getSystemType(dimension);
	if (oFF.notNull(systemType) && systemType.isTypeOf(oFF.SystemType.ABAP) && dimension.getQueryModel() !== null)
	{
		dimension.getQueryModel().setIgnoreQueryDynamicFilterInValueHelp(ignoreQueryDynamicFilter);
	}
};
oFF.OlapUiValueHelpDimension.prototype.setupExt = function(valueRequestObject)
{
	oFF.OlapUiValueHelpAbstract.prototype.setupExt.call( this , valueRequestObject);
	let dimension = valueRequestObject;
	dimension.clearSelectorSettings();
	dimension.setSelectorHierarchy(this.isHierarchicalValueHelp(), this.getHierarchyName(), 0);
};

oFF.OlapUiValueHelpVariable = function() {};
oFF.OlapUiValueHelpVariable.prototype = new oFF.OlapUiValueHelpAbstract();
oFF.OlapUiValueHelpVariable.prototype._ff_c = "OlapUiValueHelpVariable";

oFF.OlapUiValueHelpVariable.create = function(valueRequestObject)
{
	let obj = new oFF.OlapUiValueHelpVariable();
	obj.setupExt(valueRequestObject);
	return obj;
};
oFF.OlapUiValueHelpVariable.prototype.getContextType = function()
{
	let variable = this.m_valueRequestObject;
	return this.getSystemType(variable.getDimension()).isTypeOf(oFF.SystemType.ABAP) ? oFF.QContextType.VARIABLE : oFF.QContextType.SELECTOR;
};
oFF.OlapUiValueHelpVariable.prototype.getDimension = function()
{
	return this.m_valueRequestObject.getDimension();
};
oFF.OlapUiValueHelpVariable.prototype.getHierarchyName = function()
{
	let variable = this.m_valueRequestObject;
	let varType = variable.getVariableType();
	return oFF.notNull(varType) && varType.isTypeOf(oFF.VariableType.HIERARCHY_NODE_VARIABLE) ? variable.getHierarchyName() : null;
};
oFF.OlapUiValueHelpVariable.prototype.getReadMode = function(readMode)
{
	if (readMode === oFF.OlapUiReadMode.QUERY_DEFAULT)
	{
		let dfReadMode = this.getDimension().getReadModeDefault(this.getContextType());
		if (oFF.notNull(dfReadMode))
		{
			return dfReadMode;
		}
	}
	return readMode === oFF.OlapUiReadMode.MASTER ? oFF.QMemberReadMode.MASTER : oFF.QMemberReadMode.BOOKED;
};
oFF.OlapUiValueHelpVariable.prototype.isHierarchicalValueHelp = function()
{
	return oFF.XStringUtils.isNotNullAndNotEmpty(this.getHierarchyName());
};
oFF.OlapUiValueHelpVariable.prototype.processChildFetch = function(node, offset, amount, fields, readMode, listener, customIdentifier)
{
	let variable = this.m_valueRequestObject;
	this.processChildFetchForVariable(variable, node, offset, amount, fields, readMode, listener, customIdentifier);
};
oFF.OlapUiValueHelpVariable.prototype.processChildFetchForVariable = function(variable, node, offset, amount, fields, readMode, listener, customIdentifier)
{
	let dimension = node.getDimension();
	this.configureValueHelp(dimension, this.getReadMode(readMode), 0, 0, amount, fields, false);
	dimension.setSelectorPaging(offset, offset + amount);
	if (dimension.getDataSource().getType() === oFF.MetaObjectType.DIMENSION)
	{
		node.processVarHelpChildFetchWithVariable(variable, oFF.OlapUiValueHelpAbstract.s_syncType, listener, customIdentifier);
	}
	else
	{
		this.processVariableValueHelpWithReinit(variable, listener, customIdentifier, () => {
			node.processVarHelpChildFetch(variable.getName(), oFF.OlapUiValueHelpAbstract.s_syncType, listener, customIdentifier);
		});
	}
};
oFF.OlapUiValueHelpVariable.prototype.processDataRange = function(listener, customIdentifier)
{
	let variable = this.m_valueRequestObject;
	let dimension = variable.getDimension();
	this.configureValueHelp(dimension, this.getReadMode(oFF.OlapUiReadMode.BOOKED), 0, -1, 0, null, true);
	dimension.setSelectorGettingInterval(true);
	if (variable.getValueType().isDateBased())
	{
		dimension.addSelectorFilterForKey("0001-01-01", oFF.ComparisonOperator.GREATER_THAN);
	}
	this.processVariableValueHelp(variable, listener, customIdentifier);
};
oFF.OlapUiValueHelpVariable.prototype.processFetchItems = function(items, fields, listener, customIdentifier)
{
	let variable = this.m_valueRequestObject;
	let dimension = variable.getDimension();
	if (!this.configureFetchItems(dimension, this.getReadMode(oFF.OlapUiReadMode.MASTER), items, fields))
	{
		listener.onValuehelpExecuted(oFF.ExtResult.create(oFF.XList.create(), null), null, customIdentifier);
		return;
	}
	this.processVariableValueHelp(variable, listener, customIdentifier);
	dimension.clearSelectorFilter();
};
oFF.OlapUiValueHelpVariable.prototype.processSearch = function(searchPattern, searchFields, fields, pageSize, loadParentNodes, readMode, listener, customIdentifier)
{
	let variable = this.m_valueRequestObject;
	this.processSearchForVariable(variable, searchPattern, searchFields, fields, pageSize, loadParentNodes, readMode, listener, customIdentifier);
};
oFF.OlapUiValueHelpVariable.prototype.processSearchForVariable = function(variable, searchPattern, searchFields, fields, pageSize, loadParentNodes, readMode, listener, customIdentifier)
{
	let dimension = variable.getDimension();
	let memberReadMode = this.getReadMode(readMode);
	this.configureValueHelp(dimension, memberReadMode, 0, 0, pageSize, fields, false);
	let nullFilterAdded = this.addNullFilter(searchPattern, memberReadMode);
	let filterAdded = dimension.addSelectorFilterForFields(searchPattern, searchFields, oFF.ComparisonOperator.MATCH, loadParentNodes, true);
	if (!nullFilterAdded && !filterAdded)
	{
		listener.onValuehelpExecuted(oFF.ExtResult.create(oFF.XList.create(), null), null, customIdentifier);
		return;
	}
	this.processVariableValueHelp(variable, listener, customIdentifier);
	dimension.clearSelectorFilter();
};
oFF.OlapUiValueHelpVariable.prototype.processValueHelp = function(startPage, endPage, pageSize, fields, readMode, listener, customIdentifier)
{
	let variable = this.m_valueRequestObject;
	this.processValueHelpForVariable(variable, startPage, endPage, pageSize, fields, readMode, listener, customIdentifier);
};
oFF.OlapUiValueHelpVariable.prototype.processValueHelpForVariable = function(variable, startPage, endPage, pageSize, fields, readMode, listener, customIdentifier)
{
	let dimension = variable.getDimension();
	this.configureValueHelp(dimension, this.getReadMode(readMode), startPage, endPage, pageSize, fields, true);
	this.processVariableValueHelp(variable, listener, customIdentifier);
};
oFF.OlapUiValueHelpVariable.prototype.processVariableValueHelp = function(variable, listener, customIdentifier)
{
	let dimension = variable.getDimension();
	if (dimension.getDataSource().getType() === oFF.MetaObjectType.PLANNING_SEQUENCE)
	{
		dimension.processVarHelpWithVariable(variable, oFF.OlapUiValueHelpAbstract.s_syncType, listener, customIdentifier);
	}
	else
	{
		this.processVariableValueHelpWithReinit(variable, listener, customIdentifier, () => {
			dimension.processVarHelp(variable.getName(), oFF.OlapUiValueHelpAbstract.s_syncType, listener, customIdentifier);
		});
	}
};
oFF.OlapUiValueHelpVariable.prototype.processVariableValueHelpWithReinit = function(variable, listener, customIdentifier, valuehelpProcedure)
{
	if (variable.getQueryManager() !== null && variable.getQueryManager().isReinitNeeded())
	{
		variable.getQueryManager().reInitVariablesAfterSubmit(oFF.OlapUiValueHelpAbstract.s_syncType, oFF.VariableProcessorCallbackLambda.createSingleUse((result) => {
			if (result.hasErrors())
			{
				let valueHelpResult = oFF.ExtResult.create(null, result);
				listener.onValuehelpExecuted(valueHelpResult, null, customIdentifier);
				return;
			}
			valuehelpProcedure();
		}), null);
	}
	else
	{
		valuehelpProcedure();
	}
};
oFF.OlapUiValueHelpVariable.prototype.setHierarchyName = function(hierarchyName) {};
oFF.OlapUiValueHelpVariable.prototype.setIgnoreQueryDynamicFilter = function(ignoreQueryDynamicFilter) {};
oFF.OlapUiValueHelpVariable.prototype.setupExt = function(valueRequestObject)
{
	oFF.OlapUiValueHelpAbstract.prototype.setupExt.call( this , valueRequestObject);
	let dimension = valueRequestObject.getDimension();
	dimension.clearSelectorSettings();
	dimension.setSelectorHierarchy(this.isHierarchicalValueHelp(), this.getHierarchyName(), 0);
};

oFF.OuAxesViewConfiguration = function() {};
oFF.OuAxesViewConfiguration.prototype = new oFF.OuDesignerViewConfiguration();
oFF.OuAxesViewConfiguration.prototype._ff_c = "OuAxesViewConfiguration";

oFF.OuAxesViewConfiguration.createAxesViewConfig = function(application)
{
	let obj = new oFF.OuAxesViewConfiguration();
	obj.setupConfig(application);
	return obj;
};
oFF.OuAxesViewConfiguration.prototype.m_chartProtocolBindingType = null;
oFF.OuAxesViewConfiguration.prototype.m_useRowsAndColumnsSplitterExpandable = false;
oFF.OuAxesViewConfiguration.prototype.getDefaultChartProtocolBindingType = function()
{
	return this.m_chartProtocolBindingType;
};
oFF.OuAxesViewConfiguration.prototype.isUseRowsAndColumnsSplitterExpandable = function()
{
	return this.m_useRowsAndColumnsSplitterExpandable;
};
oFF.OuAxesViewConfiguration.prototype.setDefaultChartProtocolBindingType = function(chartProtocolBindingType)
{
	this.m_chartProtocolBindingType = chartProtocolBindingType;
};
oFF.OuAxesViewConfiguration.prototype.setUseRowsAndColumnsSplitterExpandable = function(useRowsAndColumnsSplitterExpandable)
{
	this.m_useRowsAndColumnsSplitterExpandable = useRowsAndColumnsSplitterExpandable;
};

oFF.OuChartAxesController = function() {};
oFF.OuChartAxesController.prototype = new oFF.OuGridAxesController();
oFF.OuChartAxesController.prototype._ff_c = "OuChartAxesController";

oFF.OuChartAxesController.createChartController = function()
{
	return new oFF.OuChartAxesController();
};

oFF.OuInventoryViewConfiguration = function() {};
oFF.OuInventoryViewConfiguration.prototype = new oFF.OuDesignerViewConfiguration();
oFF.OuInventoryViewConfiguration.prototype._ff_c = "OuInventoryViewConfiguration";

oFF.OuInventoryViewConfiguration.createInventoryViewConfig = function(application)
{
	let obj = new oFF.OuInventoryViewConfiguration();
	obj.setupConfig(application);
	return obj;
};
oFF.OuInventoryViewConfiguration.prototype.m_defaultGroupPresentation = null;
oFF.OuInventoryViewConfiguration.prototype.m_showCustomDimension2 = false;
oFF.OuInventoryViewConfiguration.prototype.m_showDimensionMoreButton = false;
oFF.OuInventoryViewConfiguration.prototype.m_showGroupExpandCollapseOptions = false;
oFF.OuInventoryViewConfiguration.prototype.m_showGroupPresentationMenu = false;
oFF.OuInventoryViewConfiguration.prototype.getDefaultGroupPresentation = function()
{
	return this.m_defaultGroupPresentation;
};
oFF.OuInventoryViewConfiguration.prototype.isShowCustomDimension2 = function()
{
	return this.m_showCustomDimension2;
};
oFF.OuInventoryViewConfiguration.prototype.isShowDimensionMoreButton = function()
{
	return this.m_showDimensionMoreButton;
};
oFF.OuInventoryViewConfiguration.prototype.isShowGroupExpandCollapseOptions = function()
{
	return this.m_showGroupExpandCollapseOptions;
};
oFF.OuInventoryViewConfiguration.prototype.isShowGroupPresentationMenu = function()
{
	return this.m_showGroupPresentationMenu;
};
oFF.OuInventoryViewConfiguration.prototype.releaseObject = function()
{
	this.m_defaultGroupPresentation = null;
	oFF.OuDesignerViewConfiguration.prototype.releaseObject.call( this );
};
oFF.OuInventoryViewConfiguration.prototype.setDefaultGroupPresentation = function(defaultGroupPresentation)
{
	this.m_defaultGroupPresentation = defaultGroupPresentation;
};
oFF.OuInventoryViewConfiguration.prototype.setShowCustomDimension2 = function(showCustomDimension2)
{
	this.m_showCustomDimension2 = showCustomDimension2;
};
oFF.OuInventoryViewConfiguration.prototype.setShowDimensionMoreButton = function(showDimensionMoreButton)
{
	this.m_showDimensionMoreButton = showDimensionMoreButton;
};
oFF.OuInventoryViewConfiguration.prototype.setShowGroupExpandCollapseOptions = function(showGroupPresentationMenu)
{
	this.m_showGroupExpandCollapseOptions = showGroupPresentationMenu;
};
oFF.OuInventoryViewConfiguration.prototype.setShowGroupPresentationMenu = function(showGroupPresentationMenu)
{
	this.m_showGroupPresentationMenu = showGroupPresentationMenu;
};

oFF.OuCalcAlternateMeasureHintProvider = function() {};
oFF.OuCalcAlternateMeasureHintProvider.prototype = new oFF.OuCalcAbstractMeasureHintProvider();
oFF.OuCalcAlternateMeasureHintProvider.prototype._ff_c = "OuCalcAlternateMeasureHintProvider";

oFF.OuCalcAlternateMeasureHintProvider.create = function(measures, enableModelPrefix)
{
	let provider = new oFF.OuCalcAlternateMeasureHintProvider();
	provider.setupMeasureHints(measures, enableModelPrefix);
	return provider;
};
oFF.OuCalcAlternateMeasureHintProvider.prototype.accept = function(token)
{
	if (oFF.FeFeatureToggle.isActive(oFF.FeFeatureToggle.LOOKUP_FUNCTIONS))
	{
		return this.isTokenTypeEqualTo(token, oFF.FeDataType.ALTERNATE_MEASURE);
	}
	return false;
};

oFF.OuCalcMeasureHintProvider = function() {};
oFF.OuCalcMeasureHintProvider.prototype = new oFF.OuCalcAbstractMeasureHintProvider();
oFF.OuCalcMeasureHintProvider.prototype._ff_c = "OuCalcMeasureHintProvider";

oFF.OuCalcMeasureHintProvider.create = function(measures, enableModelPrefix)
{
	let provider = new oFF.OuCalcMeasureHintProvider();
	provider.setupMeasureHints(measures, enableModelPrefix);
	return provider;
};
oFF.OuCalcMeasureHintProvider.prototype.accept = function(token)
{
	return this.isTokenCompatible(token, oFF.FeDataType.MEASURE);
};

oFF.OuCalcCustomTreeWidgetItem = function() {};
oFF.OuCalcCustomTreeWidgetItem.prototype = new oFF.XObjectExt();
oFF.OuCalcCustomTreeWidgetItem.prototype._ff_c = "OuCalcCustomTreeWidgetItem";

oFF.OuCalcCustomTreeWidgetItem.create = function(name, content, enabled, customObject)
{
	let instance = new oFF.OuCalcCustomTreeWidgetItem();
	instance.m_children = oFF.XLinkedHashMapByString.create();
	instance.m_name = name;
	instance.m_content = content;
	instance.m_filtered = false;
	instance.m_enabled = enabled;
	instance.m_customObject = customObject;
	return instance;
};
oFF.OuCalcCustomTreeWidgetItem.createEmpty = function(name)
{
	return oFF.OuCalcCustomTreeWidgetItem.create(name, null, true, null);
};
oFF.OuCalcCustomTreeWidgetItem.prototype.m_children = null;
oFF.OuCalcCustomTreeWidgetItem.prototype.m_content = null;
oFF.OuCalcCustomTreeWidgetItem.prototype.m_customObject = null;
oFF.OuCalcCustomTreeWidgetItem.prototype.m_enabled = false;
oFF.OuCalcCustomTreeWidgetItem.prototype.m_expanded = false;
oFF.OuCalcCustomTreeWidgetItem.prototype.m_filtered = false;
oFF.OuCalcCustomTreeWidgetItem.prototype.m_name = null;
oFF.OuCalcCustomTreeWidgetItem.prototype.m_parent = null;
oFF.OuCalcCustomTreeWidgetItem.prototype.m_uiTreeItem = null;
oFF.OuCalcCustomTreeWidgetItem.prototype.addItem = function(newItem)
{
	oFF.XObjectExt.assertFalseExt(this.m_children.containsKey(newItem.getName()), oFF.XStringUtils.concatenate3("Item with the name '", newItem.getName(), "', already exists!"));
	this.m_children.put(newItem.getName(), newItem);
	newItem.setParent(this);
	return newItem;
};
oFF.OuCalcCustomTreeWidgetItem.prototype.applyToItems = function(consumer)
{
	oFF.XStream.of(this.m_children).forEach((item) => {
		consumer(item);
		item.applyToItems(consumer);
	});
};
oFF.OuCalcCustomTreeWidgetItem.prototype.filterItems = function(visibilityPredicate)
{
	oFF.XStream.of(this.m_children).forEach((item) => {
		item.setFiltered(!visibilityPredicate(item));
		item.filterItems(visibilityPredicate);
	});
};
oFF.OuCalcCustomTreeWidgetItem.prototype.getChildren = function()
{
	return this.m_children.getValuesAsReadOnlyList();
};
oFF.OuCalcCustomTreeWidgetItem.prototype.getContent = function()
{
	return this.m_content;
};
oFF.OuCalcCustomTreeWidgetItem.prototype.getCustomObject = function()
{
	return this.m_customObject;
};
oFF.OuCalcCustomTreeWidgetItem.prototype.getItemByName = function(name)
{
	if (this.m_children.containsKey(name))
	{
		return oFF.XOptional.of(this.m_children.getByKey(name));
	}
	let result = oFF.XStream.of(this.m_children.getValuesAsReadOnlyList()).find((item) => {
		let itemResult = item.getItemByName(name);
		return itemResult.isPresent();
	});
	if (result.isPresent())
	{
		return result.get().getItemByName(name);
	}
	return oFF.XOptional.empty();
};
oFF.OuCalcCustomTreeWidgetItem.prototype.getName = function()
{
	return this.m_name;
};
oFF.OuCalcCustomTreeWidgetItem.prototype.getParent = function()
{
	return oFF.XOptional.ofNullable(this.m_parent);
};
oFF.OuCalcCustomTreeWidgetItem.prototype.getUiItem = function()
{
	return this.m_uiTreeItem;
};
oFF.OuCalcCustomTreeWidgetItem.prototype.getVisibleItems = function()
{
	let result = oFF.XList.create();
	if (!this.isFiltered())
	{
		result.add(this);
	}
	oFF.XStream.of(this.m_children).forEach((item) => {
		result.addAll(item.getVisibleItems());
	});
	return result.getValuesAsReadOnlyList();
};
oFF.OuCalcCustomTreeWidgetItem.prototype.isEnabled = function()
{
	return this.m_enabled;
};
oFF.OuCalcCustomTreeWidgetItem.prototype.isExpanded = function()
{
	return this.m_expanded;
};
oFF.OuCalcCustomTreeWidgetItem.prototype.isFiltered = function()
{
	return this.m_filtered;
};
oFF.OuCalcCustomTreeWidgetItem.prototype.isLeaf = function()
{
	return !this.m_children.hasElements();
};
oFF.OuCalcCustomTreeWidgetItem.prototype.isRoot = function()
{
	return oFF.isNull(this.m_parent);
};
oFF.OuCalcCustomTreeWidgetItem.prototype.releaseObject = function()
{
	this.m_parent = null;
	this.m_content.destroy();
	this.m_content = null;
	this.m_uiTreeItem = null;
	oFF.XStream.of(this.m_children).forEach((child) => {
		oFF.XObjectExt.release(child);
	});
	this.m_children.clear();
	this.m_children = oFF.XObjectExt.release(this.m_children);
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.OuCalcCustomTreeWidgetItem.prototype.setContent = function(content)
{
	this.m_content = content;
};
oFF.OuCalcCustomTreeWidgetItem.prototype.setExpanded = function(isExpanded)
{
	this.m_expanded = isExpanded;
	this.updateUi();
	if (isExpanded)
	{
		this.getParent().ifPresent((parent) => {
			parent.setExpanded(true);
		});
	}
};
oFF.OuCalcCustomTreeWidgetItem.prototype.setFiltered = function(isFiltered)
{
	this.m_filtered = isFiltered;
	if (oFF.notNull(this.m_parent) && !isFiltered)
	{
		this.m_parent.setFiltered(false);
	}
};
oFF.OuCalcCustomTreeWidgetItem.prototype.setParent = function(parent)
{
	this.m_parent = parent;
};
oFF.OuCalcCustomTreeWidgetItem.prototype.setUiItem = function(uiTreeItem)
{
	this.m_uiTreeItem = uiTreeItem;
	this.updateUi();
};
oFF.OuCalcCustomTreeWidgetItem.prototype.toggleExpanded = function()
{
	this.m_expanded = !this.m_expanded;
	return this.m_expanded;
};
oFF.OuCalcCustomTreeWidgetItem.prototype.updateUi = function()
{
	if (oFF.isNull(this.m_uiTreeItem))
	{
		return;
	}
	let isExpanded = this.isExpanded();
	let expandBtn = this.m_uiTreeItem.getContent().getItem(0);
	let cssClassToAdd = isExpanded ? "ffOuCustomTreeItemExpanded" : "ffOuCustomTreeItemCollapsed";
	let cssClassToRemove = !isExpanded ? "ffOuCustomTreeItemExpanded" : "ffOuCustomTreeItemCollapsed";
	this.m_uiTreeItem.addCssClass(cssClassToAdd);
	this.m_uiTreeItem.removeCssClass(cssClassToRemove);
	expandBtn.setIcon(isExpanded ? "slim-arrow-down" : "slim-arrow-right");
	expandBtn.setTooltip(oFF.XLocalizationCenter.getCenter().getText(isExpanded ? oFF.XCommonI18n.COLLAPSE : oFF.XCommonI18n.EXPAND));
};

oFF.OlapUiPropertyListHelper = function() {};
oFF.OlapUiPropertyListHelper.prototype = new oFF.XObject();
oFF.OlapUiPropertyListHelper.prototype._ff_c = "OlapUiPropertyListHelper";

oFF.OlapUiPropertyListHelper.create = function(createOperations)
{
	let obj = new oFF.OlapUiPropertyListHelper();
	obj.setupExt(createOperations);
	return obj;
};
oFF.OlapUiPropertyListHelper.prototype.m_checkboxes = null;
oFF.OlapUiPropertyListHelper.prototype.m_inputs = null;
oFF.OlapUiPropertyListHelper.prototype.m_layout = null;
oFF.OlapUiPropertyListHelper.prototype.m_values = null;
oFF.OlapUiPropertyListHelper.prototype.addBooleanProperty = function(name, text, value)
{
	this.m_values.put(name, oFF.XBooleanValue.create(value));
	let line = this.addNewLine(name, text);
	let checkbox = line.addNewItemOfType(oFF.UiType.CHECKBOX);
	checkbox.setName(name);
	checkbox.setChecked(value);
	checkbox.registerOnChange(this);
	this.m_checkboxes.put(name, checkbox);
	return checkbox;
};
oFF.OlapUiPropertyListHelper.prototype.addNewLine = function(name, text)
{
	let line = this.m_layout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	line.setName(oFF.XStringUtils.concatenate2(name, "Container"));
	line.setJustifyContent(oFF.UiFlexJustifyContent.SPACE_BETWEEN);
	let label = line.addNewItemOfType(oFF.UiType.LABEL);
	label.setText(text);
	label.setAlignSelf(oFF.UiFlexAlignSelf.CENTER);
	return line;
};
oFF.OlapUiPropertyListHelper.prototype.addStringProperty = function(name, text, value)
{
	this.m_values.put(name, oFF.XStringValue.create(value));
	let line = this.addNewLine(name, text);
	let input = line.addNewItemOfType(oFF.UiType.INPUT);
	input.setName(name);
	input.setValue(value);
	input.registerOnEditingEnd(this);
	this.m_inputs.put(name, input);
	return input;
};
oFF.OlapUiPropertyListHelper.prototype.buildOlapDialogUi = function(genesis)
{
	genesis.setRoot(this.m_layout);
};
oFF.OlapUiPropertyListHelper.prototype.getBooleanValue = function(name)
{
	return this.m_values.getByKey(name).getBoolean();
};
oFF.OlapUiPropertyListHelper.prototype.getInput = function(name)
{
	return this.m_inputs.getByKey(name);
};
oFF.OlapUiPropertyListHelper.prototype.getLayout = function()
{
	return this.m_layout;
};
oFF.OlapUiPropertyListHelper.prototype.getStringValue = function(name)
{
	return this.m_values.getByKey(name).getString();
};
oFF.OlapUiPropertyListHelper.prototype.onChange = function(event)
{
	let control = event.getControl();
	let value = this.m_values.getByKey(control.getName());
	if (oFF.isNull(value))
	{
		return;
	}
	value.setBoolean(control.isChecked());
};
oFF.OlapUiPropertyListHelper.prototype.onEditingEnd = function(event)
{
	let control = event.getControl();
	let value = this.m_values.getByKey(control.getName());
	if (oFF.isNull(value))
	{
		return;
	}
	value.setString(control.getValue());
};
oFF.OlapUiPropertyListHelper.prototype.setBooleanValue = function(name, value)
{
	this.m_values.getByKey(name).setBoolean(value);
	this.m_checkboxes.getByKey(name).setChecked(value);
};
oFF.OlapUiPropertyListHelper.prototype.setStringValue = function(name, value)
{
	this.m_values.getByKey(name).setString(value);
	return this.m_inputs.getByKey(name).setValue(value);
};
oFF.OlapUiPropertyListHelper.prototype.setupExt = function(createOperations)
{
	this.m_values = oFF.XHashMapByString.create();
	this.m_layout = createOperations.newControl(oFF.UiType.VERTICAL_LAYOUT);
	this.m_inputs = oFF.XHashMapByString.create();
	this.m_checkboxes = oFF.XHashMapByString.create();
};

oFF.OrcaLinkVarValueHelpAbstract = function() {};
oFF.OrcaLinkVarValueHelpAbstract.prototype = new oFF.OlapUiValueHelpVariable();
oFF.OrcaLinkVarValueHelpAbstract.prototype._ff_c = "OrcaLinkVarValueHelpAbstract";

oFF.OrcaLinkVarValueHelpAbstract.FETCHED_MEMBER_COUNT = 4000;
oFF.OrcaLinkVarValueHelpAbstract.ID_LINK = "link";
oFF.OrcaLinkVarValueHelpAbstract.ID_MAIN = "main";
oFF.OrcaLinkVarValueHelpAbstract.prototype.m_linkedVariables = null;
oFF.OrcaLinkVarValueHelpAbstract.prototype.m_nodeRepo = null;
oFF.OrcaLinkVarValueHelpAbstract.prototype.checkIfDone = function(data)
{
	if (data.isDone())
	{
		let result = this.joinNodes(data.getMain(), data.getLinked(), data.isSearch());
		let extResult = oFF.ExtResult.create(result, oFF.MessageManagerSimple.createMessageManager());
		data.getOriginalListener().onValuehelpExecuted(extResult, null, data.getOriginalObject());
		oFF.XObjectExt.release(data);
	}
};
oFF.OrcaLinkVarValueHelpAbstract.prototype.findNodeToVariable = function(linkedVariable, linkedNodes, mainNode)
{
	for (let j = 0; j < linkedNodes.size(); j++)
	{
		let linkedNode = linkedNodes.get(j);
		if (linkedVariable.getDimension() === linkedNode.getDimension() && oFF.XString.isEqual(this.getNodePath(mainNode), this.getNodePath(linkedNode)))
		{
			return linkedNode;
		}
	}
	return null;
};
oFF.OrcaLinkVarValueHelpAbstract.prototype.getMergeKeyValue = function(node)
{
	let mergeKeyField = node.getDimension().getDisplayKeyField();
	let fieldValue = node.getDimensionMember().getFieldValue(mergeKeyField);
	return oFF.isNull(fieldValue) ? null : fieldValue.getString();
};
oFF.OrcaLinkVarValueHelpAbstract.prototype.getNodePath = function(node)
{
	let result = oFF.XStringBuffer.create();
	let parentNode = node.getParentNode();
	while (oFF.notNull(parentNode))
	{
		result.append(this.getMergeKeyValue(parentNode)).append("/");
		parentNode = parentNode.getParentNode();
	}
	return result.toString();
};
oFF.OrcaLinkVarValueHelpAbstract.prototype.getRepoMapping = function(keyValue)
{
	let mapping = this.m_nodeRepo.getByKey(keyValue);
	if (oFF.isNull(mapping))
	{
		mapping = oFF.XList.create();
		this.m_nodeRepo.put(keyValue, mapping);
	}
	return mapping;
};
oFF.OrcaLinkVarValueHelpAbstract.prototype.onValuehelpExecuted = function(extResult, resultSetContainer, customIdentifier)
{
	let pair = customIdentifier;
	let data = pair.getObject();
	if (oFF.isNull(data) || data.isReleased())
	{
		return;
	}
	if (extResult.hasErrors())
	{
		data.getOriginalListener().onValuehelpExecuted(extResult, resultSetContainer, data.getOriginalObject());
		oFF.XObjectExt.release(data);
		return;
	}
	data.increaseCallbackCount();
	switch (pair.getName())
	{
		case oFF.OrcaLinkVarValueHelpAbstract.ID_MAIN:
			data.setMain(extResult.getData());
			break;

		case oFF.OrcaLinkVarValueHelpAbstract.ID_LINK:
			data.addLinked(extResult.getData());
			break;
	}
	oFF.XObjectExt.release(pair);
	this.checkIfDone(data);
};
oFF.OrcaLinkVarValueHelpAbstract.prototype.processChildFetch = function(node, offset, amount, fields, readMode, listener, customIdentifier)
{
	let data = oFF.OrcaLinkValueHelpProxyData.createForValueHelp(listener, customIdentifier);
	data.increaseRequestCount();
	let identifier = oFF.XNameGenericPair.create(oFF.OrcaLinkVarValueHelpAbstract.ID_MAIN, data);
	oFF.OlapUiValueHelpVariable.prototype.processChildFetch.call( this , node, offset, oFF.OrcaLinkVarValueHelpAbstract.FETCHED_MEMBER_COUNT, fields, readMode, this, identifier);
	let linkedNodes = this.m_nodeRepo.getByKey(this.getMergeKeyValue(node));
	if (oFF.notNull(linkedNodes))
	{
		for (let i = 0; i < this.m_linkedVariables.size(); i++)
		{
			let linkedVariable = this.m_linkedVariables.get(i);
			let linkedNode = this.findNodeToVariable(linkedVariable, linkedNodes, node);
			if (oFF.isNull(linkedNode))
			{
				continue;
			}
			data.increaseRequestCount();
			let linkFields = this.getRequestedFields(node.getDimension());
			this.processChildFetchForVariable(linkedVariable, linkedNode, offset, oFF.OrcaLinkVarValueHelpAbstract.FETCHED_MEMBER_COUNT, linkFields, readMode, this, oFF.XNameGenericPair.create(oFF.OrcaLinkVarValueHelpAbstract.ID_LINK, data));
		}
	}
	data.finishProgress();
	this.checkIfDone(data);
};
oFF.OrcaLinkVarValueHelpAbstract.prototype.processSearch = function(searchPattern, searchFields, fields, pageSize, loadParentNodes, readMode, listener, customIdentifier)
{
	let mainVariable = this.m_valueRequestObject;
	let mainVarDimension = mainVariable.getDimension();
	let readModeInternal = readMode === oFF.OlapUiReadMode.MASTER && (!this.getSystemType(mainVarDimension).isTypeOf(oFF.SystemType.ABAP) || mainVarDimension.getHasCheckTable()) ? oFF.OlapUiReadMode.MASTER : oFF.OlapUiReadMode.BOOKED;
	let data = oFF.OrcaLinkValueHelpProxyData.createForValueHelp(listener, customIdentifier);
	data.setSearch(true);
	data.increaseRequestCount();
	let identifier = oFF.XNameGenericPair.create(oFF.OrcaLinkVarValueHelpAbstract.ID_MAIN, data);
	oFF.OlapUiValueHelpVariable.prototype.processSearch.call( this , searchPattern, searchFields, fields, oFF.OrcaLinkVarValueHelpAbstract.FETCHED_MEMBER_COUNT, false, readModeInternal, this, identifier);
	let isSearchForKey = searchFields.contains(mainVarDimension.getSelectorKeyField());
	let isSearchForDisplayKey = searchFields.contains(mainVarDimension.getSelectorDisplayKeyField());
	let isSearchForText = searchFields.contains(mainVarDimension.getSelectorTextField());
	for (let i = 0; i < this.m_linkedVariables.size(); i++)
	{
		let variable = this.m_linkedVariables.get(i);
		let dimension = variable.getDimension();
		let searchLinkFields = oFF.XList.create();
		if (isSearchForKey && !searchLinkFields.contains(dimension.getSelectorKeyField()))
		{
			searchLinkFields.add(dimension.getSelectorKeyField());
		}
		if (isSearchForDisplayKey && !searchLinkFields.contains(dimension.getSelectorDisplayKeyField()))
		{
			searchLinkFields.add(dimension.getSelectorDisplayKeyField());
		}
		if (isSearchForText && !searchLinkFields.contains(dimension.getSelectorTextField()))
		{
			searchLinkFields.add(dimension.getSelectorTextField());
		}
		data.increaseRequestCount();
		let linkFields = this.getRequestedFields(variable.getDimension());
		this.processSearchForVariable(variable, searchPattern, searchLinkFields, linkFields, oFF.OrcaLinkVarValueHelpAbstract.FETCHED_MEMBER_COUNT, false, readModeInternal, this, oFF.XNameGenericPair.create(oFF.OrcaLinkVarValueHelpAbstract.ID_LINK, data));
	}
	data.finishProgress();
	this.checkIfDone(data);
};
oFF.OrcaLinkVarValueHelpAbstract.prototype.processValueHelp = function(startPage, endPage, pageSize, fields, readMode, listener, customIdentifier)
{
	let data = oFF.OrcaLinkValueHelpProxyData.createForValueHelp(listener, customIdentifier);
	let pageCount = oFF.OrcaLinkVarValueHelpAbstract.FETCHED_MEMBER_COUNT / pageSize;
	if (oFF.XMath.mod(oFF.OrcaLinkVarValueHelpAbstract.FETCHED_MEMBER_COUNT, pageSize) !== 0)
	{
		pageCount = pageCount + 1;
	}
	let newEndPage = startPage + pageCount - 1;
	data.increaseRequestCount();
	let identifier = oFF.XNameGenericPair.create(oFF.OrcaLinkVarValueHelpAbstract.ID_MAIN, data);
	oFF.OlapUiValueHelpVariable.prototype.processValueHelp.call( this , startPage, newEndPage, pageSize, fields, readMode, this, identifier);
	for (let i = 0; i < this.m_linkedVariables.size(); i++)
	{
		data.increaseRequestCount();
		let variable = this.m_linkedVariables.get(i);
		let linkFields = this.getRequestedFields(variable.getDimension());
		let ident = oFF.XNameGenericPair.create(oFF.OrcaLinkVarValueHelpAbstract.ID_LINK, data);
		this.processValueHelpForVariable(variable, startPage, newEndPage, pageSize, linkFields, readMode, this, ident);
	}
	data.finishProgress();
	this.checkIfDone(data);
};
oFF.OrcaLinkVarValueHelpAbstract.prototype.releaseObject = function()
{
	this.m_linkedVariables = oFF.XObjectExt.release(this.m_linkedVariables);
	this.m_nodeRepo = oFF.XObjectExt.release(this.m_nodeRepo);
	oFF.OlapUiValueHelpVariable.prototype.releaseObject.call( this );
};
oFF.OrcaLinkVarValueHelpAbstract.prototype.setupLink = function(mainVariable, linkedVariables)
{
	oFF.OlapUiValueHelpVariable.prototype.setupExt.call( this , mainVariable);
	this.m_linkedVariables = linkedVariables;
	this.m_nodeRepo = oFF.XHashMapByString.create();
};
oFF.OrcaLinkVarValueHelpAbstract.prototype.supportsAdditionalPresentations = function()
{
	return false;
};

oFF.OrcaLinkValueHelpProxyData = function() {};
oFF.OrcaLinkValueHelpProxyData.prototype = new oFF.OrcaLinkVarProxyData();
oFF.OrcaLinkValueHelpProxyData.prototype._ff_c = "OrcaLinkValueHelpProxyData";

oFF.OrcaLinkValueHelpProxyData.createForValueHelp = function(listener, customIdentifier)
{
	let obj = new oFF.OrcaLinkValueHelpProxyData();
	obj.setupExt(null, listener, customIdentifier);
	obj.m_linked = oFF.XList.create();
	return obj;
};
oFF.OrcaLinkValueHelpProxyData.prototype.m_isSearch = false;
oFF.OrcaLinkValueHelpProxyData.prototype.m_linked = null;
oFF.OrcaLinkValueHelpProxyData.prototype.m_main = null;
oFF.OrcaLinkValueHelpProxyData.prototype.addLinked = function(linked)
{
	this.m_linked.add(linked);
};
oFF.OrcaLinkValueHelpProxyData.prototype.getLinked = function()
{
	return this.m_linked;
};
oFF.OrcaLinkValueHelpProxyData.prototype.getMain = function()
{
	return this.m_main;
};
oFF.OrcaLinkValueHelpProxyData.prototype.isSearch = function()
{
	return this.m_isSearch;
};
oFF.OrcaLinkValueHelpProxyData.prototype.releaseObject = function()
{
	this.m_main = oFF.XObjectExt.release(this.m_main);
	this.m_linked = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_linked);
	oFF.OrcaLinkVarProxyData.prototype.releaseObject.call( this );
};
oFF.OrcaLinkValueHelpProxyData.prototype.setMain = function(main)
{
	this.m_main = main;
};
oFF.OrcaLinkValueHelpProxyData.prototype.setSearch = function(search)
{
	this.m_isSearch = search;
};

oFF.OlapUiDatePicker = function() {};
oFF.OlapUiDatePicker.prototype = new oFF.XObject();
oFF.OlapUiDatePicker.prototype._ff_c = "OlapUiDatePicker";

oFF.OlapUiDatePicker.create = function(uiManager)
{
	let obj = new oFF.OlapUiDatePicker();
	obj.setupExt(uiManager);
	return obj;
};
oFF.OlapUiDatePicker.prototype.m_calendar = null;
oFF.OlapUiDatePicker.prototype.m_calendarPop = null;
oFF.OlapUiDatePicker.prototype.m_input = null;
oFF.OlapUiDatePicker.prototype.m_listenerOnChange = null;
oFF.OlapUiDatePicker.prototype.getCalendar = function()
{
	return this.m_calendar;
};
oFF.OlapUiDatePicker.prototype.getInput = function()
{
	return this.m_input;
};
oFF.OlapUiDatePicker.prototype.getListenerOnChange = function()
{
	return this.m_listenerOnChange;
};
oFF.OlapUiDatePicker.prototype.onChange = function(event)
{
	let control = event.getControl();
	if (control === this.m_calendar)
	{
		this.m_input.setValue(this.m_calendar.getStartDate());
		this.m_calendarPop.close();
		if (oFF.notNull(this.m_listenerOnChange))
		{
			this.m_listenerOnChange.onChange(event);
		}
	}
};
oFF.OlapUiDatePicker.prototype.onValueHelpRequest = function(event)
{
	let control = event.getControl();
	this.m_calendarPop.openAt(control);
};
oFF.OlapUiDatePicker.prototype.registerOnChange = function(listener)
{
	this.m_listenerOnChange = listener;
	return this.m_input;
};
oFF.OlapUiDatePicker.prototype.releaseObject = function()
{
	this.m_input = oFF.XObjectExt.release(this.m_input);
	this.m_calendar = oFF.XObjectExt.release(this.m_calendar);
	this.m_calendarPop = oFF.XObjectExt.release(this.m_calendarPop);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OlapUiDatePicker.prototype.setupExt = function(uiManager)
{
	this.m_input = uiManager.newControl(oFF.UiType.INPUT);
	this.m_input.setShowValueHelp(true);
	this.m_input.setValueHelpIcon("appointment-2");
	this.m_input.registerOnValueHelpRequest(this);
	this.m_calendarPop = uiManager.newControl(oFF.UiType.POPOVER);
	this.m_calendarPop.setPlacement(oFF.UiPlacementType.BOTTOM);
	this.m_calendar = this.m_calendarPop.setNewContent(oFF.UiType.CALENDAR);
	this.m_calendar.registerOnChange(this);
};

oFF.OlapUiIconPopover = function() {};
oFF.OlapUiIconPopover.prototype = new oFF.XObject();
oFF.OlapUiIconPopover.prototype._ff_c = "OlapUiIconPopover";

oFF.OlapUiIconPopover.createPopoverWithContent = function(uiManager, name, anchor, content)
{
	let obj = new oFF.OlapUiIconPopover();
	obj.setupExt(uiManager, name, anchor, content);
	return obj;
};
oFF.OlapUiIconPopover.createPopoverWithText = function(uiManager, name, anchor, text)
{
	let obj = new oFF.OlapUiIconPopover();
	let label = uiManager.newControl(oFF.UiType.LABEL);
	label.setWrapping(true);
	label.setText(text);
	obj.setupExt(uiManager, name, anchor, label);
	return obj;
};
oFF.OlapUiIconPopover.prototype.m_anchor = null;
oFF.OlapUiIconPopover.prototype.m_keepOpen = false;
oFF.OlapUiIconPopover.prototype.m_popover = null;
oFF.OlapUiIconPopover.prototype.onAfterClose = function(event)
{
	this.m_keepOpen = false;
};
oFF.OlapUiIconPopover.prototype.onHover = function(event)
{
	this.m_popover.openAt(event.getControl());
};
oFF.OlapUiIconPopover.prototype.onHoverEnd = function(event)
{
	if (!this.m_keepOpen)
	{
		this.m_popover.close();
	}
};
oFF.OlapUiIconPopover.prototype.onPress = function(event)
{
	this.onHover(event);
	this.m_keepOpen = true;
};
oFF.OlapUiIconPopover.prototype.releaseObject = function()
{
	this.m_anchor = null;
	this.m_popover = oFF.XObjectExt.release(this.m_popover);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OlapUiIconPopover.prototype.setupExt = function(uiManager, name, anchor, content)
{
	this.m_anchor = anchor;
	this.m_anchor.registerOnPress(this);
	this.m_anchor.registerOnHover(this);
	this.m_anchor.registerOnHoverEnd(this);
	this.m_popover = uiManager.newControl(oFF.UiType.POPOVER);
	this.m_popover.setName(name);
	this.m_popover.registerOnAfterClose(this);
	let inner = this.m_popover.setNewContent(oFF.UiType.VERTICAL_LAYOUT);
	inner.setPadding(oFF.UiCssBoxEdges.create("15px"));
	inner.setWidth(oFF.UiCssLength.create("320px"));
	inner.addItem(content);
	if (uiManager.getDeviceInfo().isSmartphone())
	{
		this.m_popover.setPlacement(oFF.UiPlacementType.BOTTOM);
	}
	else
	{
		this.m_popover.setPlacement(oFF.UiPlacementType.HORIZONTAL_PREFERRED_RIGHT);
	}
};

oFF.OlapUiSideTab = function() {};
oFF.OlapUiSideTab.prototype = new oFF.XObject();
oFF.OlapUiSideTab.prototype._ff_c = "OlapUiSideTab";

oFF.OlapUiSideTab.create = function(createOperations)
{
	let obj = new oFF.OlapUiSideTab();
	obj.setupExt(createOperations);
	return obj;
};
oFF.OlapUiSideTab.prototype.m_contentPage = null;
oFF.OlapUiSideTab.prototype.m_listener = null;
oFF.OlapUiSideTab.prototype.m_selected = 0;
oFF.OlapUiSideTab.prototype.m_tabList = null;
oFF.OlapUiSideTab.prototype.addTab = function(key, text, listener)
{
	if (oFF.isNull(listener))
	{
		throw oFF.XException.createIllegalArgumentException("Listener cannot be null");
	}
	let newItem = this.m_tabList.addNewItem();
	newItem.setName(key).setText(text);
	newItem.setCustomObject(listener);
	this.m_listener.add(listener);
};
oFF.OlapUiSideTab.prototype.buildOlapDialogUi = function(genesis)
{
	let root = genesis.newRoot(oFF.UiType.FLEX_LAYOUT);
	root.setSize(oFF.UiSize.createByCss("100%", "100%"));
	root.addItem(this.m_tabList);
	root.addItem(this.m_contentPage);
	if (this.m_tabList.getNumberOfItems() > 0)
	{
		this.m_selected = 0;
		this.m_tabList.setSelectedItemByIndex(this.m_selected);
		this.m_listener.get(this.m_selected).onTabSelected(this.m_contentPage);
	}
};
oFF.OlapUiSideTab.prototype.getActiveTabName = function()
{
	return this.m_tabList.getSelectedItem().getName();
};
oFF.OlapUiSideTab.prototype.getListenerOnSelect = function()
{
	return this.m_tabList.getListenerOnSelect();
};
oFF.OlapUiSideTab.prototype.onSelect = function(event)
{
	this.m_listener.get(this.m_selected).onTabDeselected();
	this.m_selected = this.m_tabList.getIndexOfItem(this.m_tabList.getSelectedItem());
	this.m_listener.get(this.m_selected).onTabSelected(this.m_contentPage);
};
oFF.OlapUiSideTab.prototype.registerOnSelect = function(listener)
{
	return this.m_tabList.registerOnSelect(listener);
};
oFF.OlapUiSideTab.prototype.releaseObject = function()
{
	this.m_contentPage = oFF.XObjectExt.release(this.m_contentPage);
	this.m_tabList = oFF.XObjectExt.release(this.m_tabList);
	this.m_listener = oFF.XObjectExt.release(this.m_listener);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OlapUiSideTab.prototype.setupExt = function(createOperations)
{
	this.m_listener = oFF.XList.create();
	this.m_tabList = createOperations.newControl(oFF.UiType.LIST);
	this.m_tabList.setSelectionMode(oFF.UiSelectionMode.SINGLE_SELECT_MASTER);
	this.m_tabList.setSize(oFF.UiSize.createByCss("25%", "100%"));
	this.m_tabList.setFlex("1 1 150px");
	this.m_tabList.setBorderWidth(oFF.UiCssBoxEdges.create("0px"));
	this.m_tabList.registerOnSelect(this);
	this.m_contentPage = createOperations.newControl(oFF.UiType.PAGE);
	this.m_contentPage.setShowHeader(false);
	this.m_contentPage.setSize(oFF.UiSize.createByCss("75%", "100%"));
	this.m_contentPage.setFlex("1 1 auto");
};

oFF.OuVizInstanceAxesViewConfiguration = function() {};
oFF.OuVizInstanceAxesViewConfiguration.prototype = new oFF.OuAxesViewConfiguration();
oFF.OuVizInstanceAxesViewConfiguration.prototype._ff_c = "OuVizInstanceAxesViewConfiguration";

oFF.OuVizInstanceAxesViewConfiguration.createVizInstanceAxesViewConfig = function(application)
{
	let obj = new oFF.OuVizInstanceAxesViewConfiguration();
	obj.setupConfig(application);
	return obj;
};
oFF.OuVizInstanceAxesViewConfiguration.prototype.getSupportedDisplayTypes = function()
{
	let displayTypes = oFF.XList.create();
	displayTypes.add(oFF.OuAxesViewDisplayType.GRID);
	displayTypes.add(oFF.OuAxesViewDisplayType.BAR);
	displayTypes.add(oFF.OuAxesViewDisplayType.COLUMN);
	displayTypes.add(oFF.OuAxesViewDisplayType.STACKED_BAR);
	displayTypes.add(oFF.OuAxesViewDisplayType.STACKED_COLUMN);
	displayTypes.add(oFF.OuAxesViewDisplayType.LINE);
	displayTypes.add(oFF.OuAxesViewDisplayType.STACKED_AREA);
	displayTypes.add(oFF.OuAxesViewDisplayType.COLUMN_LINE);
	displayTypes.add(oFF.OuAxesViewDisplayType.STACKED_COLUMN_LINE);
	displayTypes.add(oFF.OuAxesViewDisplayType.PIE);
	displayTypes.add(oFF.OuAxesViewDisplayType.DOUGHNUT);
	displayTypes.add(oFF.OuAxesViewDisplayType.METRIC);
	if (this.getApplication().getSession().hasFeature(oFF.FeatureToggleSAC.FF_COMPOSABLE_CHARTS_WATERFALL))
	{
		displayTypes.add(oFF.OuAxesViewDisplayType.WATERFALL);
	}
	return displayTypes;
};

oFF.OuDimensionPanelList = function() {};
oFF.OuDimensionPanelList.prototype = new oFF.XObject();
oFF.OuDimensionPanelList.prototype._ff_c = "OuDimensionPanelList";

oFF.OuDimensionPanelList.LABEL_CSS_CLASS_NAME = "ffOuDesignerListItemLabel";
oFF.OuDimensionPanelList.createDimensionPanelList = function(process, genesis, controller, config)
{
	let obj = new oFF.OuDimensionPanelList();
	obj.setupExt(process, genesis, controller, config);
	return obj;
};
oFF.OuDimensionPanelList.findListItemParent = function(control)
{
	let parent = control.getParent();
	if (oFF.isNull(parent))
	{
		return null;
	}
	if (parent.getUiType() === oFF.UiType.CUSTOM_LIST_ITEM)
	{
		return parent;
	}
	return oFF.OuDimensionPanelList.findListItemParent(parent);
};
oFF.OuDimensionPanelList.getModelComponentNameFromControl = function(control)
{
	let customObject = control.getCustomObject();
	if (oFF.isNull(customObject))
	{
		return null;
	}
	return customObject.getModelComponent().getName();
};
oFF.OuDimensionPanelList.prototype.m_config = null;
oFF.OuDimensionPanelList.prototype.m_controller = null;
oFF.OuDimensionPanelList.prototype.m_customObject = null;
oFF.OuDimensionPanelList.prototype.m_debug = false;
oFF.OuDimensionPanelList.prototype.m_dimViews = null;
oFF.OuDimensionPanelList.prototype.m_dirty = false;
oFF.OuDimensionPanelList.prototype.m_dragEnd = null;
oFF.OuDimensionPanelList.prototype.m_dragStartModelComponent = null;
oFF.OuDimensionPanelList.prototype.m_dragging = false;
oFF.OuDimensionPanelList.prototype.m_genesis = null;
oFF.OuDimensionPanelList.prototype.m_labels = null;
oFF.OuDimensionPanelList.prototype.m_memberViews = null;
oFF.OuDimensionPanelList.prototype.m_menuButton = null;
oFF.OuDimensionPanelList.prototype.m_oldDimensions = null;
oFF.OuDimensionPanelList.prototype.m_oldMembers = null;
oFF.OuDimensionPanelList.prototype.m_onPanelCollapsed = null;
oFF.OuDimensionPanelList.prototype.m_onPanelExpanded = null;
oFF.OuDimensionPanelList.prototype.m_panelExpansion = null;
oFF.OuDimensionPanelList.prototype.m_panelExpansionNew = null;
oFF.OuDimensionPanelList.prototype.m_panelList = null;
oFF.OuDimensionPanelList.prototype.m_presentation = null;
oFF.OuDimensionPanelList.prototype.m_process = null;
oFF.OuDimensionPanelList.prototype.m_releaseTimeout = null;
oFF.OuDimensionPanelList.prototype.m_rootPanelExpanded = false;
oFF.OuDimensionPanelList.prototype.m_scrollTimeout = null;
oFF.OuDimensionPanelList.prototype.addLabel = function(label)
{
	this.setCssLabel(label);
	this.m_labels.add(label);
};
oFF.OuDimensionPanelList.prototype.addPlaceholderItem = function(container)
{
	let i18n = this.getLocalizationProvider();
	let placeholder = this.m_genesis.newControl(oFF.UiType.CUSTOM_LIST_ITEM);
	placeholder.addCssClass("ffGdsQbBuilderPanelChildItem");
	placeholder.addCssClass("ffGdsQbBuilderPanelEmptyPlaceholder");
	placeholder.setDraggable(false);
	let placeholderFlex = placeholder.setNewContent(oFF.UiType.FLEX_LAYOUT);
	placeholderFlex.useMaxWidth();
	placeholderFlex.setDirection(oFF.UiFlexDirection.ROW);
	placeholderFlex.setOverflow(oFF.UiOverflow.HIDDEN);
	placeholderFlex.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	placeholderFlex.setMinHeight(oFF.UiCssLength.create("2rem"));
	let infoIcon = placeholderFlex.addNewItemOfType(oFF.UiType.ICON);
	infoIcon.addCssClass("ffGdsQbBuilderPanelEmptyPlaceholderInfoIcon");
	infoIcon.setIcon("message-information");
	infoIcon.setMinHeight(oFF.UiCssLength.create("1rem"));
	infoIcon.setIconSize(oFF.UiCssLength.create("1rem"));
	let infoLabel = placeholderFlex.addNewItemOfType(oFF.UiType.LABEL);
	infoLabel.setText(i18n.getText(oFF.OuAxesViewI18n.BUILDER_ADD_MEASURE_INFO));
	infoLabel.setFontStyle(oFF.UiFontStyle.ITALIC);
	container.addItem(placeholder);
};
oFF.OuDimensionPanelList.prototype.applyIfNotReleased = function(object, value, consumer)
{
	if (oFF.notNull(object) && !object.isReleased())
	{
		consumer(object, value);
	}
};
oFF.OuDimensionPanelList.prototype.buildAttributeItem = function(attribute)
{
	let view = this.buildDragItem(attribute, null);
	view.setAttribute(attribute);
	let item = view.getRoot();
	item.addCssClass("ffGdsQbBuilderPanelAttribute");
	if (this.m_config.isRightClickContextMenuForAttributeEnabled() && this.getMenuProvider() !== null)
	{
		item.registerOnContextMenu(oFF.UiLambdaContextMenuListener.create((evt1) => {
			this.getMenuProvider().showAttributeMenu(oFF.OuAxesView.UI_CONTEXT, evt1, attribute);
		}));
	}
	let nameLbl = view.getLabel();
	nameLbl.addCssClass("ffGdsQbBuilderPanelAttributeLabel");
	nameLbl.setFontStyle(oFF.UiFontStyle.ITALIC);
	nameLbl.useMaxWidth();
	nameLbl.setCustomObject(attribute);
	this.addLabel(nameLbl);
	let removeButton = this.createRemoveButton((evt) => {
		this.onAttributeRemoveButtonPress(view);
	});
	view.getHeaderLayout().addItem(removeButton);
	this.configureFocus(attribute, item, null);
	if (this.m_config.getOnAttributeItemCreated() !== null)
	{
		this.m_config.getOnAttributeItemCreated()(view);
	}
	return view;
};
oFF.OuDimensionPanelList.prototype.buildAttributeList = function(dim, container)
{
	let resultSetAttributes = this.getRelevantAttributes(dim);
	let views = oFF.XList.create();
	for (let i = 0; i < resultSetAttributes.size(); i++)
	{
		let attribute = resultSetAttributes.get(i);
		let view = this.buildAttributeItem(attribute);
		container.addItem(view.getRoot());
		views.add(view);
	}
	return views;
};
oFF.OuDimensionPanelList.prototype.buildDimItem = function(dim)
{
	let i18n = this.getLocalizationProvider();
	let listItem = this.m_genesis.newControl(oFF.UiType.CUSTOM_LIST_ITEM);
	listItem.addCssClass("ffGdsQbBuilderPanelDimension");
	if (this.m_config.isRightClickContextMenuForDimensionEnabled() && this.getMenuProvider() !== null)
	{
		listItem.registerOnContextMenu(oFF.UiLambdaContextMenuListener.create((evt1) => {
			this.getMenuProvider().showDimMenu(oFF.OuAxesView.UI_CONTEXT, evt1, dim);
		}));
	}
	listItem.setDraggable(true);
	listItem.setTag(this.getDragElementTag());
	listItem.setCustomObject(oFF.OuDesignerDragPayloadSimple.createWrapper(dim));
	listItem.registerOnDragStart(this);
	listItem.registerOnDragEnd(this);
	let magicPanel = oFF.OuMagicPanel.create(this.m_genesis);
	let dimView = this.buildDimItemBody(magicPanel, dim);
	let panel = magicPanel.getView();
	panel.removeAttribute(oFF.UtUi5AttributeConstants.FAST_NAV_GROUP);
	panel.addCssClass("ffGdsQbFoldable");
	panel.addCssClass("ffGdsQbBuilderPanelDimensionPanel");
	panel.setMinHeight(oFF.UiCssLength.create("0"));
	panel.setBackgroundDesign(oFF.UiBackgroundDesign.TRANSPARENT);
	listItem.setContent(panel);
	magicPanel.setOnCollapse(() => {
		this.m_panelExpansion.putBoolean(dim.getName(), false);
	});
	magicPanel.setOnExpand(() => {
		this.m_panelExpansion.putBoolean(dim.getName(), true);
	});
	let header = panel.setNewHeaderToolbar();
	header.removeAttribute(oFF.UtUi5AttributeConstants.FAST_NAV_GROUP);
	header.addCssClass("ffGdsQbBuilderPanelDimensionHeaderToolbar");
	header.setBorderWidth(oFF.UiCssBoxEdges.create("0"));
	header.setToolbarDesign(oFF.UiToolbarDesign.TRANSPARENT);
	let nameLbl = header.addNewItemOfType(oFF.UiType.LABEL);
	this.configurePanelLabel(dim, listItem, nameLbl);
	header.addNewItemOfType(oFF.UiType.SPACER);
	let buttons = header.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	buttons.setDirection(oFF.UiFlexDirection.ROW);
	buttons.setFlex("0 0 auto");
	if (this.getMenuProvider() !== null)
	{
		let menuBtn = buttons.addNewItemOfType(oFF.UiType.BUTTON);
		menuBtn.setVisible(false);
		menuBtn.addCssClass("ffGdsQbBuilderPanelDimensionMoreBtn");
		menuBtn.setIcon("overflow");
		menuBtn.setButtonType(oFF.UiButtonType.TRANSPARENT);
		menuBtn.setTooltip(i18n.getText(oFF.OlapUiCommonI18n.COMMON_MORE));
		menuBtn.registerOnPress(oFF.UiLambdaPressListener.create((evt) => {
			this.onDimMenuButtonPress(evt, dim, menuBtn);
		}));
		this.getMenuProvider().hasDimMenu(oFF.OuAxesView.UI_CONTEXT, dim, (hdm) => {
			this.applyIfNotReleased(menuBtn, hdm, (e, f) => {
				e.setVisible(f.getBoolean());
			});
		});
		dimView.setMoreBtn(menuBtn);
	}
	let removeIcon = this.createRemoveButton((pressEvt) => {
		this.onDimRemoveButtonPress(dimView);
	});
	buttons.addItem(removeIcon);
	dimView.setListItemRoot(listItem);
	dimView.setHeader(header);
	this.configurePanelList(dim, dimView.getChildrenList());
	this.configureFocus(dim, dimView.getListItemRoot(), dimView.getMoreBtn());
	listItem.setName(dimView.getName());
	return dimView;
};
oFF.OuDimensionPanelList.prototype.buildDimItemBody = function(panel, dim)
{
	let childrenList = this.m_genesis.newControl(oFF.UiType.LIST);
	childrenList.addCssClass("ffDimPanDimensionChildrenList");
	childrenList.setWidth(oFF.UiCssLength.create("auto"));
	childrenList.removeAttribute(oFF.UtUi5AttributeConstants.FAST_NAV_GROUP);
	let children;
	if (oFF.QDimensionUtil.isStructureLike(dim))
	{
		children = this.buildMemberListForDimensionItem(dim, childrenList);
	}
	else if (this.m_config.isShowAttributes())
	{
		children = this.buildAttributeList(dim, childrenList);
	}
	else
	{
		children = oFF.XList.create();
	}
	if (childrenList.hasItems())
	{
		panel.setContentHeightInRem(childrenList.getNumberOfItems() * 2);
		panel.setPanelContent(childrenList);
		panel.setExpandable(true);
		let isMeasureOrAccount = oFF.QDimensionUtil.isStructureLike(dim);
		let expanded = this.m_panelExpansion.getBooleanByKeyExt(dim.getName(), isMeasureOrAccount);
		panel.setExpanded(expanded);
		this.m_panelExpansionNew.putBoolean(dim.getName(), expanded);
	}
	return oFF.OuDesignerDimension.createForBuilderPanel(dim, children, childrenList);
};
oFF.OuDimensionPanelList.prototype.buildDragItem = function(obj, children)
{
	let dragItem = this.m_genesis.newControl(oFF.UiType.CUSTOM_LIST_ITEM);
	dragItem.addCssClass("ffGdsQbBuilderPanelChildItem");
	dragItem.setDraggable(true);
	dragItem.setTag(this.getDragElementTag());
	dragItem.setCustomObject(oFF.OuDesignerDragPayloadSimple.createWrapper(obj));
	dragItem.registerOnDragStart(this);
	dragItem.registerOnDragEnd(this);
	let nameLbl = this.m_genesis.newControl(oFF.UiType.LABEL);
	nameLbl.useMaxWidth();
	let itemView = oFF.OuDesignerListItem.createForBuilderPanel(dragItem, nameLbl);
	if (!oFF.XCollectionUtils.hasElements(children))
	{
		dragItem.addCssClass("ffGdsQbBuilderPanelChildItemEmpty");
		let header = dragItem.setNewContent(oFF.UiType.FLEX_LAYOUT);
		header.addCssClass("ffGdsQbBuilderPanelChildItemHeader");
		header.useMaxWidth();
		header.setDirection(oFF.UiFlexDirection.ROW);
		header.setAlignItems(oFF.UiFlexAlignItems.CENTER);
		header.setJustifyContent(oFF.UiFlexJustifyContent.SPACE_BETWEEN);
		header.setOverflow(oFF.UiOverflow.HIDDEN);
		header.addItem(nameLbl);
		itemView.setHeaderLayout(header);
	}
	else
	{
		let magicPanel = oFF.OuMagicPanel.create(this.m_genesis);
		magicPanel.setContentHeightInRem(children.size() * 2);
		magicPanel.setExpandable(true);
		let panel = magicPanel.getView();
		panel.removeAttribute(oFF.UtUi5AttributeConstants.FAST_NAV_GROUP);
		panel.addCssClass("ffGdsQbBuilderPanelChildItemPanel");
		panel.addCssClass("ffGdsQbFoldable");
		panel.setMinHeight(oFF.UiCssLength.create("0"));
		panel.setBackgroundDesign(oFF.UiBackgroundDesign.TRANSPARENT);
		dragItem.setContent(panel);
		let toolbar = panel.setNewHeaderToolbar();
		toolbar.addCssClass("ffGdsQbBuilderPanelChildItemHeader");
		toolbar.addCssClass("ffGdsQbBuilderPanelChildItemHeaderToolbar");
		toolbar.addItem(nameLbl);
		let list = this.m_genesis.newControl(oFF.UiType.LIST);
		list.addCssClass("ffDimPanChildItemList");
		list.setShowNoData(false);
		magicPanel.setPanelContent(list);
		let expanded = this.m_panelExpansion.getBooleanByKeyExt(obj.getName(), false);
		magicPanel.setExpanded(expanded);
		this.m_panelExpansionNew.putBoolean(obj.getName(), expanded);
		magicPanel.setOnExpand(() => {
			this.m_panelExpansion.putBoolean(obj.getName(), true);
		});
		magicPanel.setOnCollapse(() => {
			this.m_panelExpansion.putBoolean(obj.getName(), false);
		});
		itemView.setHeaderLayout(toolbar);
		itemView.setPanel(panel);
		itemView.setChildrenList(list);
		itemView.addAllChildren(children);
	}
	return itemView;
};
oFF.OuDimensionPanelList.prototype.buildMemberItem = function(node, memberVisibility)
{
	let member = node.getDimensionMember();
	let childViews = oFF.XList.create();
	if (node.hasChildren())
	{
		let children = node.getChildren();
		for (let i = 0; i < children.size(); i++)
		{
			let child = children.get(i);
			if (memberVisibility.contains(child.getDimensionMember().getName()))
			{
				childViews.add(this.buildMemberItem(child, memberVisibility));
			}
		}
	}
	let view = this.buildDragItem(node, childViews);
	view.setNode(node);
	if (!member.getDimension().isHierarchyActive())
	{
		view.getRoot().registerOnKeyDown(oFF.UiLambdaKeyDownListener.create((evt) => {
			this.onMemberKeyDown(view, evt);
		}));
	}
	let item = view.getRoot();
	item.addCssClass("ffGdsQbBuilderPanelMember");
	let label = view.getLabel();
	label.setCustomObject(member);
	this.addLabel(label);
	let headerLayout = view.getHeaderLayout();
	let buttonLayout = this.m_genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	buttonLayout.addCssClass("ffGdsQbBuilderPanelButtons");
	buttonLayout.setDirection(oFF.UiFlexDirection.ROW);
	buttonLayout.setFlex("0 0 auto");
	buttonLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	headerLayout.addItem(buttonLayout);
	if (this.m_config.isCalculationsEnabled() && member.getMemberType().isTypeOf(oFF.MemberType.FORMULA) && this.isFormulaEditable(member))
	{
		let structureMember = member;
		let popoverIcon = oFF.OuDesignerFormulaPopoverIcon.create(this.m_genesis, structureMember, oFF.MessageManagerSimple.createMessageManager());
		popoverIcon.getView().setVisible(false);
		buttonLayout.addItem(popoverIcon.getView());
		view.setPopoverIcon(popoverIcon);
	}
	if (this.m_config.showMeasureMoreMenuButton() && this.getMenuProvider() !== null)
	{
		let menuButton = buttonLayout.addNewItemOfType(oFF.UiType.BUTTON);
		menuButton.setVisible(false);
		menuButton.addCssClass("ffGdsQbBuilderPanelMeasureMoreBtn");
		menuButton.setIcon("overflow");
		menuButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
		menuButton.registerOnPress(oFF.UiLambdaPressListener.create((evt) => {
			this.onMemberMenuButtonPress(evt, node, menuButton);
		}));
		this.getMenuProvider().hasMemberMenu(oFF.OuAxesView.UI_CONTEXT, member, (hdm) => {
			this.applyIfNotReleased(menuButton, hdm, (e, f) => {
				e.setVisible(f.getBoolean());
			});
		});
		view.setMoreButton(menuButton);
	}
	let removeButton = this.createRemoveButton((evt) => {
		this.onMemberRemoveButtonPress(view);
	});
	buttonLayout.addItem(removeButton);
	view.setRemoveButton(removeButton);
	if (this.m_config.isRightClickContextMenuForMemberEnabled() && this.getMenuProvider() !== null)
	{
		item.registerOnContextMenu(oFF.UiLambdaContextMenuListener.create((evt) => {
			this.getMenuProvider().showMemberMenu(oFF.OuAxesView.UI_CONTEXT, evt, member, node, null, null);
		}));
	}
	this.configureFocus(member, view.getRoot(), view.getMoreButton());
	if (this.m_config.getOnMemberItemCreated() !== null)
	{
		this.m_config.getOnMemberItemCreated()(view);
	}
	return view;
};
oFF.OuDimensionPanelList.prototype.buildMemberList = function(allMembers, visibleMembers)
{
	let views = oFF.XList.create();
	for (let i = 0; i < allMembers.size(); i++)
	{
		let node = allMembers.get(i);
		if (this.shouldMemberBeShownOnRootLevel(node, visibleMembers))
		{
			let view = this.buildMemberItem(node, visibleMembers);
			if (oFF.notNull(view))
			{
				view.getRoot().addCssClass("ffDimPanRootLevelMember");
				views.add(view);
			}
		}
	}
	return views;
};
oFF.OuDimensionPanelList.prototype.buildMemberListForDimensionItem = function(dim, container)
{
	let listOfMembers = this.m_controller.getDimensionMembers(dim);
	let memberVisibility = this.m_controller.getDimensionMemberVisibility(dim);
	let views = this.buildMemberList(listOfMembers, memberVisibility);
	if (dim.isMeasureStructure() && !oFF.XCollectionUtils.hasElements(views))
	{
		this.addPlaceholderItem(container);
	}
	else
	{
		container.addAllItems(oFF.XCollectionUtils.map(views, (view) => {
			return view.getRoot();
		}));
	}
	return views;
};
oFF.OuDimensionPanelList.prototype.checkDimensionsInSync = function(dimensions)
{
	if (this.m_dimViews.size() !== dimensions.size())
	{
		return false;
	}
	for (let i = 0; i < this.m_dimViews.size(); i++)
	{
		let dimView = this.m_dimViews.get(i);
		let oldDimension = dimView.getDimension();
		let newDimension = dimensions.get(i);
		if (!oFF.XString.isEqual(oldDimension.getName(), newDimension.getName()))
		{
			return false;
		}
		let childrenViews = dimView.getChildrenViews();
		if (oFF.QDimensionUtil.isStructureLike(newDimension))
		{
			let allNodes = this.m_controller.getDimensionMembers(newDimension);
			let memberVisibility = this.m_controller.getDimensionMemberVisibility(newDimension);
			let filteredNodes = oFF.XCollectionUtils.filter(allNodes, (node) => {
				return memberVisibility.contains(node.getDimensionMember().getName());
			});
			if (!this.checkRootLevelMembersInSync(childrenViews, filteredNodes, memberVisibility))
			{
				return false;
			}
		}
		else if (this.m_config.isShowAttributes())
		{
			let resultSetAttributes = this.getRelevantAttributes(newDimension);
			if (childrenViews.size() !== resultSetAttributes.size())
			{
				return false;
			}
			for (let j = 0; j < resultSetAttributes.size(); j++)
			{
				let oldAttribute = childrenViews.get(j).getAttribute();
				let newAttribute = resultSetAttributes.get(j);
				if (!oFF.XString.isEqual(oldAttribute.getName(), newAttribute.getName()))
				{
					return false;
				}
			}
		}
	}
	return true;
};
oFF.OuDimensionPanelList.prototype.checkMembersInSync = function(allMembers, visibleMembers)
{
	return this.checkRootLevelMembersInSync(this.m_memberViews, allMembers, visibleMembers);
};
oFF.OuDimensionPanelList.prototype.checkRootLevelMembersInSync = function(rootViews, allNewMembers, visibleMembers)
{
	let members = oFF.XCollectionUtils.filter(allNewMembers, (node) => {
		return this.shouldMemberBeShownOnRootLevel(node, visibleMembers);
	});
	return this.compareMemberNodeLists(rootViews, members, visibleMembers);
};
oFF.OuDimensionPanelList.prototype.clearDeprecatedUi = function()
{
	if (this.m_oldDimensions.hasElements() || this.m_oldMembers.hasElements())
	{
		this.debugLog("releasing old ui");
		oFF.XCollectionUtils.forEach(this.m_oldDimensions, (oldDims) => {
			oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(oldDims);
		});
		oFF.XCollectionUtils.forEach(this.m_oldMembers, (oldMems) => {
			oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(oldMems);
		});
		this.m_oldDimensions.clear();
		this.m_oldMembers.clear();
	}
};
oFF.OuDimensionPanelList.prototype.compareMemberNodeLists = function(memberViews, members, visibleMembers)
{
	if (!oFF.XCollectionUtils.hasElements(memberViews) && !oFF.XCollectionUtils.hasElements(members))
	{
		return true;
	}
	if (memberViews.size() !== members.size())
	{
		return false;
	}
	for (let i = 0; i < memberViews.size(); i++)
	{
		let memberView = memberViews.get(i);
		let oldMember = memberView.getNode();
		let newMember = members.get(i);
		let oldText = this.m_presentation.getDisplayValueByType(oldMember.getDimensionMember());
		let newText = this.m_presentation.getDisplayValueByType(newMember.getDimensionMember());
		if (!oFF.XString.isEqual(oldText, newText))
		{
			return false;
		}
		let childViews = memberView.getDirectChildren();
		let children = newMember.getChildren();
		children = oFF.XCollectionUtils.filter(children, (child) => {
			return visibleMembers.contains(child.getDimensionMember().getName());
		});
		if (!this.compareMemberNodeLists(childViews, children, visibleMembers))
		{
			return false;
		}
	}
	return true;
};
oFF.OuDimensionPanelList.prototype.configureFocus = function(component, listItem, menuButton)
{
	let focusContext = this.m_config.getFocusContext();
	if (oFF.isNull(focusContext) || !oFF.XString.isEqual(focusContext.getFocusedName(), component.getName()))
	{
		return;
	}
	if (focusContext.isFocusMoreButton() && oFF.notNull(menuButton) && menuButton !== oFF.UiContextDummy.getSingleton())
	{
		menuButton.addCssClass("ffGdsQbBuilderPanelDimensionMoreBtnForceVisible");
		menuButton.focus();
		oFF.XTimeout.timeout(30, () => {
			if (oFF.XObjectExt.isValidObject(menuButton))
			{
				menuButton.removeCssClass("ffGdsQbBuilderPanelDimensionMoreBtnForceVisible");
			}
		});
	}
	else
	{
		listItem.focus();
	}
	focusContext.resetFocus();
};
oFF.OuDimensionPanelList.prototype.configurePanelLabel = function(dim, item, label)
{
	let i18n = this.getLocalizationProvider();
	label.setMargin(oFF.UiCssBoxEdges.create("0"));
	this.setCssLabel(label);
	if (dim.isMeasureStructure())
	{
		item.addCssClass("ffGdsQbBuilderPanelMeasure");
		label.setText(i18n.getText(oFF.OlapUiCommonI18n.COMMON_MEASURES));
		label.setTooltip(i18n.getText(oFF.OlapUiCommonI18n.COMMON_MEASURES));
	}
	else if (dim.isStructure())
	{
		item.addCssClass("ffGdsQbBuilderPanelSecondStructure");
		if (this.m_process.hasFeature(oFF.FeatureToggleOlap.USE_ORIGINAL_STRUCTURE_TEXT_IN_UI) && oFF.XStringUtils.isNotNullAndNotEmpty(dim.getOriginalText()))
		{
			label.setText(dim.getOriginalText());
			label.setTooltip(dim.getOriginalText());
		}
		else
		{
			label.setText(i18n.getText(oFF.OlapUiCommonI18n.COMMON_STRUCTURE));
			label.setTooltip(i18n.getText(oFF.OlapUiCommonI18n.COMMON_STRUCTURE));
		}
	}
	else if (dim.getDimensionType() === oFF.DimensionType.ACCOUNT)
	{
		item.addCssClass("ffGdsQbBuilderPanelAccount");
		label.setText(i18n.getText(oFF.OlapUiCommonI18n.COMMON_ACCOUNT));
		label.setTooltip(i18n.getText(oFF.OlapUiCommonI18n.COMMON_ACCOUNT));
	}
	else
	{
		label.setCustomObject(dim);
		this.m_labels.add(label);
	}
};
oFF.OuDimensionPanelList.prototype.configurePanelList = function(dim, list)
{
	if (dim.isMeasureStructure())
	{
		list.addCssClass("ffGdsQbBuilderPanelMeasureList");
	}
	else if (dim.isStructure())
	{
		list.addCssClass("ffGdsQbBuilderPanelSecondStructureList");
	}
	else if (dim.getDimensionType() === oFF.DimensionType.ACCOUNT)
	{
		list.addCssClass("ffGdsQbBuilderPanelAccountList");
	}
};
oFF.OuDimensionPanelList.prototype.createRemoveButton = function(consumer)
{
	let removeButton = this.m_genesis.newControl(oFF.UiType.BUTTON);
	removeButton.setIcon("decline");
	removeButton.addCssClass("ffGdsQbBuilderPanelRemoveButton");
	removeButton.setTooltip(this.getLocalizationProvider().getText(oFF.OuAxesViewI18n.BUILDER_REMOVE));
	removeButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
	removeButton.registerOnPress(oFF.UiLambdaPressListener.create((pressEvt) => {
		consumer(pressEvt);
	}));
	return removeButton;
};
oFF.OuDimensionPanelList.prototype.debugLog = function(msg)
{
	if (this.m_debug)
	{
		oFF.XLogger.println(msg);
	}
};
oFF.OuDimensionPanelList.prototype.deprecateUi = function()
{
	this.m_oldDimensions.add(this.m_dimViews);
	this.m_oldMembers.add(this.m_memberViews);
	this.m_dimViews = oFF.XListOfNameObject.create();
	this.m_memberViews = oFF.XList.create();
	this.m_labels.clear();
	this.m_panelExpansionNew.clear();
	if (!this.m_dragging)
	{
		this.debugLog("starting release timeout");
		oFF.XTimeout.clear(this.m_releaseTimeout);
		this.m_releaseTimeout = oFF.XTimeout.timeout(500, () => {
			this.clearDeprecatedUi();
			this.m_releaseTimeout = null;
		});
	}
};
oFF.OuDimensionPanelList.prototype.expandDimension = function(name)
{
	this.m_panelExpansion.putBoolean(name, true);
};
oFF.OuDimensionPanelList.prototype.expandMemberNodeRecursive = function(node)
{
	let parent = node.getParentNode();
	if (oFF.notNull(parent))
	{
		let name = parent.getDimensionMember().getName();
		this.m_panelExpansion.putBoolean(name, true);
		this.expandMemberNodeRecursive(parent);
	}
};
oFF.OuDimensionPanelList.prototype.expandToMemberNode = function(node)
{
	this.expandMemberNodeRecursive(node);
};
oFF.OuDimensionPanelList.prototype.getCustomObject = function()
{
	return this.m_customObject;
};
oFF.OuDimensionPanelList.prototype.getDimensionViews = function()
{
	return this.m_dimViews;
};
oFF.OuDimensionPanelList.prototype.getDragElementTag = function()
{
	return this.m_config.getDragElementTag();
};
oFF.OuDimensionPanelList.prototype.getLocalizationProvider = function()
{
	return oFF.XLocalizationCenter.getCenter().getLocalizationProviderByName(this.m_config.getLocalizationProviderName());
};
oFF.OuDimensionPanelList.prototype.getMenuButton = function()
{
	return this.m_menuButton;
};
oFF.OuDimensionPanelList.prototype.getMenuProvider = function()
{
	return this.m_config.getMenuProvider();
};
oFF.OuDimensionPanelList.prototype.getPanelList = function()
{
	return this.m_panelList;
};
oFF.OuDimensionPanelList.prototype.getRelevantAttributes = function(dim)
{
	let resultSetAttributes = dim.getResultSetAttributes().createListCopy();
	resultSetAttributes.removeElement(dim.getMainAttribute());
	return resultSetAttributes;
};
oFF.OuDimensionPanelList.prototype.getView = function()
{
	return this.m_panelList.getView();
};
oFF.OuDimensionPanelList.prototype.hardResetUi = function()
{
	this.deprecateUi();
	this.m_panelExpansion.clear();
	this.clearDeprecatedUi();
};
oFF.OuDimensionPanelList.prototype.initializeComposite = function()
{
	this.m_panelList = oFF.OuPanelList.create(this.m_genesis);
	let panel = this.m_panelList.getPanel();
	panel.addCssClass("ffGdsQbBuilderPanelAxisPanel");
	panel.addCssClass("ffGdsQbFoldableBorderContent");
	panel.setFlex("1 1 50%");
	panel.registerOnCollapse(oFF.UiLambdaCollapseListener.create((evt1) => {
		this.m_rootPanelExpanded = false;
		if (oFF.notNull(this.m_onPanelCollapsed))
		{
			this.m_onPanelCollapsed();
		}
	}));
	panel.registerOnExpand(oFF.UiLambdaExpandListener.create((evt2) => {
		this.m_rootPanelExpanded = true;
		if (oFF.notNull(this.m_onPanelExpanded))
		{
			this.m_onPanelExpanded();
		}
	}));
	let headerLayout = this.m_panelList.getHeaderLayout();
	headerLayout.addCssClass("ffGdsQbBuilderPanelAxisPanelHeaderToolbar");
	this.m_panelList.getList().setShowNoData(false);
	this.m_panelList.getList().addCssClass("ffDimPanList");
	headerLayout.addNewItemOfType(oFF.UiType.SPACER);
	this.m_menuButton = headerLayout.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_menuButton.setIcon("overflow");
	this.m_menuButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
	this.m_menuButton.setTooltip(this.getLocalizationProvider().getText(oFF.OlapUiCommonI18n.COMMON_MORE));
};
oFF.OuDimensionPanelList.prototype.isFormulaEditable = function(formula)
{
	return formula.isEditable() && formula.getFormulaText().isPresent() && oFF.XStringUtils.isNotNullAndNotEmpty(formula.getFormulaText().get());
};
oFF.OuDimensionPanelList.prototype.isVisible = function()
{
	return this.getView().isVisible();
};
oFF.OuDimensionPanelList.prototype.markDirty = function()
{
	this.m_dirty = true;
};
oFF.OuDimensionPanelList.prototype.onAttributeRemoveButtonPress = function(view)
{
	this.setFocusToNext(view.getRoot());
	this.m_controller.handleAttributeRemovalFromList(this, view.getAttribute());
};
oFF.OuDimensionPanelList.prototype.onDimMenuButtonPress = function(evt, dim, button)
{
	if (this.m_config.getFocusContext() !== null)
	{
		this.m_config.getFocusContext().setFocusedName(dim.getName());
		this.m_config.getFocusContext().setFocusMoreButton(true);
	}
	this.getMenuProvider().showDimMenuWithAction(oFF.OuAxesView.UI_CONTEXT, evt, dim, (ny1) => {
		this.applyIfNotReleased(button, "ffGdsQbBuilderPanelDimensionMoreBtnForceVisible", (a, b) => {
			a.addCssClass(b);
		});
	}, (ny2) => {
		this.applyIfNotReleased(button, "ffGdsQbBuilderPanelDimensionMoreBtnForceVisible", (c, d) => {
			c.removeCssClass(d);
		});
	});
};
oFF.OuDimensionPanelList.prototype.onDimRemoveButtonPress = function(dimView)
{
	this.setFocusToNext(dimView.getListItemRoot());
	this.m_controller.handleDimensionRemovalFromList(this, dimView.getDimension());
};
oFF.OuDimensionPanelList.prototype.onDragEnd = function(event)
{
	this.debugLog("on drag end");
	this.m_dragging = false;
	this.clearDeprecatedUi();
	if (oFF.notNull(this.m_dragEnd))
	{
		this.m_dragEnd();
	}
};
oFF.OuDimensionPanelList.prototype.onDragStart = function(event)
{
	this.debugLog("on drag start");
	this.m_dragging = true;
	if (oFF.notNull(this.m_releaseTimeout))
	{
		this.debugLog("stopping release timeout");
		oFF.XTimeout.clear(this.m_releaseTimeout);
	}
	if (oFF.notNull(this.m_dragStartModelComponent))
	{
		let payload = event.getControl().getCustomObject();
		this.m_dragStartModelComponent(payload.getModelComponent());
	}
};
oFF.OuDimensionPanelList.prototype.onMemberKeyDown = function(view, evt)
{
	let node = view.getNode();
	let parentList = view.getRoot().getParent();
	if (oFF.notNull(parentList) && evt.isCtrlPressed())
	{
		let offset = 0;
		offset = oFF.XString.isEqual(evt.getKey(), "ArrowUp") ? -1 : offset;
		offset = oFF.XString.isEqual(evt.getKey(), "ArrowDown") ? 1 : offset;
		if (offset !== 0)
		{
			let currentIndex = parentList.getIndexOfItem(view.getRoot());
			this.m_controller.moveMemberToIndex(this, node, currentIndex + offset);
			this.m_config.getFocusContext().setFocusedName(node.getDimensionMember().getName());
		}
	}
};
oFF.OuDimensionPanelList.prototype.onMemberMenuButtonPress = function(evt, node, button)
{
	let member = node.getDimensionMember();
	if (this.m_config.getFocusContext() !== null)
	{
		this.m_config.getFocusContext().setFocusedName(member.getName());
		this.m_config.getFocusContext().setFocusMoreButton(true);
	}
	this.getMenuProvider().showMemberMenu(oFF.OuAxesView.UI_CONTEXT, evt, member, node, (ny1) => {
		this.applyIfNotReleased(button, "ffGdsQbBuilderPanelMeasureMoreBtnForceVisible", (a, b) => {
			a.addCssClass(b);
		});
	}, (ny2) => {
		this.applyIfNotReleased(button, "ffGdsQbBuilderPanelMeasureMoreBtnForceVisible", (c, d) => {
			c.removeCssClass(d);
		});
	});
};
oFF.OuDimensionPanelList.prototype.onMemberRemoveButtonPress = function(memberView)
{
	this.setFocusToNext(memberView.getRoot());
	this.m_controller.handleMemberRemovalFromList(this, memberView.getNode());
};
oFF.OuDimensionPanelList.prototype.releaseObject = function()
{
	oFF.XTimeout.clear(this.m_scrollTimeout);
	oFF.XTimeout.clear(this.m_releaseTimeout);
	this.clearDeprecatedUi();
	this.m_presentation = null;
	this.m_config = null;
	this.m_controller = null;
	this.m_process = null;
	this.m_genesis = null;
	this.m_panelExpansion = oFF.XObjectExt.release(this.m_panelExpansion);
	this.m_panelExpansionNew = oFF.XObjectExt.release(this.m_panelExpansionNew);
	this.m_dimViews = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_dimViews);
	this.m_labels = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_labels);
	this.m_panelList = oFF.XObjectExt.release(this.m_panelList);
	this.m_menuButton = oFF.XObjectExt.release(this.m_menuButton);
	this.m_dragStartModelComponent = null;
	this.m_dragEnd = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OuDimensionPanelList.prototype.scrollWithTimeout = function(scrollTop)
{
	oFF.XTimeout.clear(this.m_scrollTimeout);
	this.m_scrollTimeout = oFF.XTimeout.timeout(10, () => {
		this.getPanelList().getScroll().scrollTo(0, scrollTop, 0);
	});
};
oFF.OuDimensionPanelList.prototype.setCssLabel = function(label)
{
	label.addCssClass(oFF.OuDimensionPanelList.LABEL_CSS_CLASS_NAME);
};
oFF.OuDimensionPanelList.prototype.setCustomObject = function(customObject)
{
	this.m_customObject = customObject;
};
oFF.OuDimensionPanelList.prototype.setDebug = function(debug)
{
	this.m_debug = debug;
};
oFF.OuDimensionPanelList.prototype.setDragEnd = function(dragEnd)
{
	this.m_dragEnd = dragEnd;
};
oFF.OuDimensionPanelList.prototype.setDragStartModelComponent = function(dragStartModelComponent)
{
	this.m_dragStartModelComponent = dragStartModelComponent;
};
oFF.OuDimensionPanelList.prototype.setFocusToNext = function(item)
{
	let parentList = item.getParent();
	let indexOfItem = parentList.getIndexOfItem(item);
	if (indexOfItem + 1 < parentList.getNumberOfItems())
	{
		let nextView = parentList.getItem(indexOfItem + 1);
		let name = oFF.OuDimensionPanelList.getModelComponentNameFromControl(nextView);
		this.m_config.getFocusContext().setFocusedName(name);
	}
	else if (parentList.getNumberOfItems() > 1 && indexOfItem >= 1)
	{
		let previousView = parentList.getItem(indexOfItem - 1);
		let name = oFF.OuDimensionPanelList.getModelComponentNameFromControl(previousView);
		this.m_config.getFocusContext().setFocusedName(name);
	}
	else
	{
		let listItemParent = oFF.OuDimensionPanelList.findListItemParent(parentList);
		if (oFF.notNull(listItemParent))
		{
			let name = oFF.OuDimensionPanelList.getModelComponentNameFromControl(listItemParent);
			this.m_config.getFocusContext().setFocusedName(name);
		}
	}
};
oFF.OuDimensionPanelList.prototype.setOnPanelCollapsed = function(onPanelCollapsed)
{
	this.m_onPanelCollapsed = onPanelCollapsed;
};
oFF.OuDimensionPanelList.prototype.setOnPanelExpanded = function(onPanelExpanded)
{
	this.m_onPanelExpanded = onPanelExpanded;
};
oFF.OuDimensionPanelList.prototype.setPresentation = function(presentationType)
{
	this.m_presentation = presentationType;
	this.updateLabels();
};
oFF.OuDimensionPanelList.prototype.setVisible = function(visible)
{
	this.getView().setVisible(visible);
};
oFF.OuDimensionPanelList.prototype.setupExt = function(process, genesis, controller, config)
{
	this.setup();
	this.m_process = process;
	this.m_genesis = genesis;
	this.m_controller = controller;
	this.m_config = config;
	this.m_dimViews = oFF.XListOfNameObject.create();
	this.m_memberViews = oFF.XList.create();
	this.m_labels = oFF.XList.create();
	this.m_panelExpansion = oFF.XProperties.create();
	this.m_panelExpansionNew = oFF.XProperties.create();
	this.m_rootPanelExpanded = true;
	this.m_presentation = this.m_config.getDefaultPresentation();
	this.m_oldDimensions = oFF.XList.create();
	this.m_oldMembers = oFF.XList.create();
	this.initializeComposite();
};
oFF.OuDimensionPanelList.prototype.shouldMemberBeShownOnRootLevel = function(node, visibleMembers)
{
	if (!visibleMembers.contains(node.getDimensionMember().getName()))
	{
		return false;
	}
	return node.getParentNode() === null || !visibleMembers.contains(node.getParentNode().getDimensionMember().getName());
};
oFF.OuDimensionPanelList.prototype.updateCalculations = function(members)
{
	if (!this.m_config.isCalculationsEnabled())
	{
		return;
	}
	for (let i = 0; i < members.size(); i++)
	{
		let item = members.get(i);
		let member = item.getNode().getDimensionMember();
		if (member.getMemberType().isTypeOf(oFF.MemberType.FORMULA) && this.isFormulaEditable(member))
		{
			let structureMember = member;
			let messageManager = oFF.OuDesignerFormulaHelper.validateFormula(structureMember);
			let hasProblems = messageManager.hasErrors() || messageManager.hasWarnings();
			let popoverIcon = item.getPopoverIcon();
			popoverIcon.setMessageManager(messageManager);
			popoverIcon.getView().setVisible(hasProblems);
			if (hasProblems)
			{
				item.getLabel().setFontStyle(oFF.UiFontStyle.ITALIC);
				item.getLabel().setOpacity(0.65);
			}
			else
			{
				item.getLabel().setFontStyle(oFF.UiFontStyle.NORMAL);
				item.getLabel().setOpacity(1);
			}
		}
		this.updateCalculations(item.getDirectChildren());
	}
};
oFF.OuDimensionPanelList.prototype.updateControls = function()
{
	this.updateLabels();
	if (oFF.XCollectionUtils.hasElements(this.m_memberViews))
	{
		this.updateCalculations(this.m_memberViews);
	}
	else
	{
		oFF.XCollectionUtils.forEach(this.m_dimViews, (dimView) => {
			if (oFF.QDimensionUtil.isStructureLike(dimView.getDimension()))
			{
				this.updateCalculations(dimView.getChildrenViews());
			}
		});
	}
};
oFF.OuDimensionPanelList.prototype.updateLabels = function()
{
	for (let i = 0; i < this.m_labels.size(); i++)
	{
		let displayLabel = this.m_labels.get(i);
		let modelComponent = displayLabel.getCustomObject();
		let text = this.m_presentation.getDisplayValueByType(modelComponent);
		displayLabel.setText(text);
		displayLabel.setTooltip(text);
	}
};
oFF.OuDimensionPanelList.prototype.updateViewWithDimensions = function(dimensions)
{
	if (!this.m_dirty && this.checkDimensionsInSync(dimensions))
	{
		this.updateControls();
		return;
	}
	this.debugLog("updating view");
	let scrollTop = this.getPanelList().getScroll().getScrollTop();
	this.deprecateUi();
	for (let i = 0; i < dimensions.size(); i++)
	{
		let dim = dimensions.get(i);
		if (oFF.QDimensionUtil.shouldDimensionBeShown(dim, true))
		{
			let dimView = this.buildDimItem(dim);
			this.m_dimViews.add(dimView);
		}
	}
	this.m_panelList.replaceList(oFF.XCollectionUtils.map(this.m_dimViews, (view) => {
		return view.getListItemRoot();
	}));
	let list = this.m_panelList.getList();
	list.setVisible(list.hasItems());
	this.m_panelList.getPanel().setExpanded(this.m_rootPanelExpanded);
	this.updateControls();
	this.m_panelExpansion = this.m_panelExpansionNew.cloneExt(null);
	this.scrollWithTimeout(scrollTop);
	this.m_dirty = false;
};
oFF.OuDimensionPanelList.prototype.updateViewWithMembers = function(allMembers, visibleMembers)
{
	if (!this.m_dirty && this.checkMembersInSync(allMembers, visibleMembers))
	{
		this.updateControls();
		return;
	}
	this.getView().addCssClass("ffDimPanMembersOnly");
	let scrollTop = this.getPanelList().getScroll().getScrollTop();
	this.deprecateUi();
	this.m_memberViews = this.buildMemberList(allMembers, visibleMembers);
	this.m_panelList.replaceList(oFF.XCollectionUtils.map(this.m_memberViews, (view) => {
		return view.getRoot();
	}));
	let list = this.m_panelList.getList();
	list.setVisible(list.hasItems());
	this.m_panelList.getPanel().setExpanded(this.m_rootPanelExpanded);
	this.updateControls();
	this.m_panelExpansion = this.m_panelExpansionNew.cloneExt(null);
	this.scrollWithTimeout(scrollTop);
	this.m_dirty = false;
};

oFF.OuCalcDetailsAreaViewI18n = function() {};
oFF.OuCalcDetailsAreaViewI18n.prototype = new oFF.DfXLocalizationProvider();
oFF.OuCalcDetailsAreaViewI18n.prototype._ff_c = "OuCalcDetailsAreaViewI18n";

oFF.OuCalcDetailsAreaViewI18n.FE_DESC_AREA_INPUT_VALUE = "FF_FE_DESC_AREA_INPUT_VALUE";
oFF.OuCalcDetailsAreaViewI18n.FE_ID_AREA_INPUT_VALUE = "FF_FE_ID_AREA_INPUT_VALUE";
oFF.OuCalcDetailsAreaViewI18n.FE_ID_AREA_LABEL = "FF_FE_ID_AREA_LABEL";
oFF.OuCalcDetailsAreaViewI18n.ID_ERROR_EXISTING = "FF_FE_ID_ERROR_DUPLICATED";
oFF.OuCalcDetailsAreaViewI18n.ID_ERROR_INVALID_CHARS = "FF_FE_ID_ERROR_INVALID_CHARS";
oFF.OuCalcDetailsAreaViewI18n.ID_ERROR_MANDATORY = "FF_FE_ID_ERROR_MANDATORY";
oFF.OuCalcDetailsAreaViewI18n.ID_ERROR_MAX_LENGTH = "FF_FE_ID_ERROR_MAX_LENGTH";
oFF.OuCalcDetailsAreaViewI18n.NAME_AREA_LABEL = "FF_FE_NAME_AREA_LABEL";
oFF.OuCalcDetailsAreaViewI18n.NAME_ERROR_MAX_LENGTH = "FE_NAME_ERROR_MAX_LENGTH";
oFF.OuCalcDetailsAreaViewI18n.PROVIDER_NAME = "CalDetailsAreaView";
oFF.OuCalcDetailsAreaViewI18n.staticSetup = function()
{
	let provider = new oFF.OuCalcDetailsAreaViewI18n();
	provider.setupProvider(oFF.OuCalcDetailsAreaViewI18n.PROVIDER_NAME, true);
	provider.addTextWithComment(oFF.OuCalcDetailsAreaViewI18n.FE_ID_AREA_LABEL, "ID", "#XMIT: Label for input field where identifier of calculation is inputted");
	provider.addTextWithComment(oFF.OuCalcDetailsAreaViewI18n.FE_ID_AREA_INPUT_VALUE, "Calculation_{0}", "#XMIT: Initial value of input field for calculation. the placeholder is the index used in case of existing calculation with same name.");
	provider.addTextWithComment(oFF.OuCalcDetailsAreaViewI18n.FE_DESC_AREA_INPUT_VALUE, "Calculation {0}", "#XMIT: Initial value of input field for description of calculation. the placeholder is the index used in case of existing calculation with same name.");
	provider.addTextWithComment(oFF.OuCalcDetailsAreaViewI18n.NAME_AREA_LABEL, "Description", "#XMIT: Label for input field where name of calculation is inputted");
	provider.addTextWithComment(oFF.OuCalcDetailsAreaViewI18n.ID_ERROR_MANDATORY, "Enter the ID to create the calculation.", "#XMSG: Error value state message shown when an id is empty");
	provider.addTextWithComment(oFF.OuCalcDetailsAreaViewI18n.ID_ERROR_EXISTING, "This ID already exists. Enter a different one.", "#XMSG: Error value state message shown when an id already exists");
	provider.addTextWithComment(oFF.OuCalcDetailsAreaViewI18n.ID_ERROR_MAX_LENGTH, "ID length must not exceed 256 characters.", "#XMSG: Error value state message shown when a id exceed the max length of 256");
	provider.addTextWithComment(oFF.OuCalcDetailsAreaViewI18n.NAME_ERROR_MAX_LENGTH, "Description length must not exceed 256 characters.", "#XMSG: Error value state message shown when a description exceed the max length of 256");
	provider.addTextWithComment(oFF.OuCalcDetailsAreaViewI18n.ID_ERROR_INVALID_CHARS, "Enter a name (ID) that contains a combination of the characters \"A-Z\", \"a-z\", \"0-9\", or \"_\", and begins with a letter.", "#XMSG: Error value state message shown when a id has invalid characters");
	return provider;
};

oFF.OuCalcFormulaEditorI18n = function() {};
oFF.OuCalcFormulaEditorI18n.prototype = new oFF.DfXLocalizationProvider();
oFF.OuCalcFormulaEditorI18n.prototype._ff_c = "OuCalcFormulaEditorI18n";

oFF.OuCalcFormulaEditorI18n.ASSISTANCE_AI_EXPLANATION_GENERATION_ERROR = "FF_FE_ASSISTANCE_AI_EXPLANATION_GENERATION_ERROR";
oFF.OuCalcFormulaEditorI18n.ASSISTANCE_AI_FORMULA_GENERATION_ERROR = "FF_FE_ASSISTANCE_AI_FORMULA_GENERATION_ERROR";
oFF.OuCalcFormulaEditorI18n.ASSISTANCE_AI_GENERATION_DIMENSION_MEMBER_WARNING = "FF_FE_ASSISTANCE_AI_GENERATION_DIMENSION_MEMBER_WARNING";
oFF.OuCalcFormulaEditorI18n.ASSISTANCE_AI_PANEL_TITLE = "FF_FE_ASSISTANCE_AI_PANEL_TITLE";
oFF.OuCalcFormulaEditorI18n.ASSISTANCE_ERRORS_ANNOUNCE_UPDATE = "FF_FE_ASSISTANCE_ERRORS_ANNOUNCE_UPDATE";
oFF.OuCalcFormulaEditorI18n.ASSISTANCE_ERRORS_BUTTON = "FF_FE_ASSISTANCE_ERRORS_BUTTON";
oFF.OuCalcFormulaEditorI18n.ASSISTANCE_ERRORS_EMPTY_FORMULA = "FF_FE_ASSISTANCE_ERRORS_EMPTY_FORMULA";
oFF.OuCalcFormulaEditorI18n.ASSISTANCE_ERRORS_TITLE_MULTIPLE = "FF_FE_ASSISTANCE_ERRORS_TITLE_MULTIPLE";
oFF.OuCalcFormulaEditorI18n.ASSISTANCE_ERRORS_TITLE_SINGLE = "FF_FE_ASSISTANCE_ERRORS_TITLE_SINGLE";
oFF.OuCalcFormulaEditorI18n.ASSISTANCE_ERRORS_VALID_FORMULA = "FF_FE_ASSISTANCE_ERRORS_VALID_FORMULA";
oFF.OuCalcFormulaEditorI18n.ASSISTANCE_FUNC_HELP_PANEL_TITLE = "FF_FE_ASSISTANCE_FUNC_HELP_PANEL_TITLE";
oFF.OuCalcFormulaEditorI18n.ASSISTANCE_HELP_ANNOUNCE_UPDATE = "FF_FE_ASSISTANCE_HELP_ANNOUNCE_UPDATE";
oFF.OuCalcFormulaEditorI18n.ASSISTANCE_HELP_BUTTON = "FF_FE_ASSISTANCE_HELP_BUTTON";
oFF.OuCalcFormulaEditorI18n.ASSISTANCE_HELP_EMPTY = "FF_FE_ASSISTANCE_HELP_EMPTY";
oFF.OuCalcFormulaEditorI18n.ASSISTANCE_HELP_EMPTY_DESCRIPTION = "FF_FE_ASSISTANCE_HELP_EMPTY_DESCRIPTION";
oFF.OuCalcFormulaEditorI18n.ASSISTANCE_HELP_EMPTY_TITLE = "FF_FE_ASSISTANCE_HELP_EMPTY_TITLE";
oFF.OuCalcFormulaEditorI18n.DISPLAY_OPTIONS = "FF_FE_DISPLAY_OPTIONS";
oFF.OuCalcFormulaEditorI18n.DISPLAY_OPTIONS_DESCRIPTION = "FF_FE_DISPLAY_OPTIONS_DESCRIPTION";
oFF.OuCalcFormulaEditorI18n.DISPLAY_OPTIONS_DESCRIPTION_AND_ID = "FF_FE_DISPLAY_OPTIONS_DESCRIPTION_AND_ID";
oFF.OuCalcFormulaEditorI18n.DISPLAY_OPTIONS_ID = "FF_FE_DISPLAY_OPTIONS_ID";
oFF.OuCalcFormulaEditorI18n.DISPLAY_OPTIONS_ID_AND_DESCRIPTION = "FF_FE_DISPLAY_OPTIONS_ID_AND_DESCRIPTION";
oFF.OuCalcFormulaEditorI18n.EDITOR_AI_DESCRIPTION_ANNOUNCE_UPDATE = "FF_FE_EDITOR_AI_DESCRIPTION_ANNOUNCE_UPDATE";
oFF.OuCalcFormulaEditorI18n.EDITOR_AI_EXPLANATION_ANNOUNCE_UPDATE = "FF_FE_EDITOR_AI_EXPLANATION_ANNOUNCE_UPDATE";
oFF.OuCalcFormulaEditorI18n.EDITOR_ANNOUNCE_UPDATE = "FF_FE_EDITOR_ANNOUNCE_UPDATE";
oFF.OuCalcFormulaEditorI18n.EDITOR_CLEAR_BTN = "FF_FE_EDITOR_TOOLBAR_CLEAR";
oFF.OuCalcFormulaEditorI18n.EDITOR_ERRORS_ANNOUNCE_UPDATE = "FF_FE_EDITOR_ERRORS_ANNOUNCE_UPDATE";
oFF.OuCalcFormulaEditorI18n.EDITOR_ERROR_MESSAGE_MORE = "FF_FE_EDITOR_ERROR_MESSAGE_MORE";
oFF.OuCalcFormulaEditorI18n.EDITOR_FORMAT_BTN = "FF_FE_EDITOR_TOOLBAR_FORMAT";
oFF.OuCalcFormulaEditorI18n.EDITOR_HIDE_ERRORS_BTN = "FF_FE_EDITOR_HIDE_ERRORS_BTN";
oFF.OuCalcFormulaEditorI18n.EDITOR_HIDE_FUNC_HELP_BTN = "FF_FE_EDITOR_HIDE_FUNC_HELP_BTN";
oFF.OuCalcFormulaEditorI18n.EDITOR_LABEL = "FF_FE_EDITOR_TOOLBAR_TITLE";
oFF.OuCalcFormulaEditorI18n.EDITOR_NAMED_ANNOUNCE_UPDATE = "FF_FE_EDITOR_NAMED_ANNOUNCE_UPDATE";
oFF.OuCalcFormulaEditorI18n.EDITOR_NAME_EXPLAIN_FORMULA = "FF_FE_EDITOR_NAME_EXPLAIN_FORMULA";
oFF.OuCalcFormulaEditorI18n.EDITOR_NAME_FORMULA = "FF_FE_EDITOR_NAME_FORMULA";
oFF.OuCalcFormulaEditorI18n.EDITOR_NAME_GENERATED_FORMULA = "FF_FE_EDITOR_NAME_GENERATED_FORMULA";
oFF.OuCalcFormulaEditorI18n.EDITOR_NO_ERRORS_ANNOUNCE_UPDATE = "FF_FE_EDITOR_NO_ERRORS_ANNOUNCE_UPDATE";
oFF.OuCalcFormulaEditorI18n.EDITOR_SHOW_DESCRIPTIONS_BTN = "FF_FE_EDITOR_TOOLBAR_SHOW_DESCRIPTIONS";
oFF.OuCalcFormulaEditorI18n.EDITOR_SHOW_ERRORS_BTN = "FF_FE_EDITOR_SHOW_ERRORS_BTN";
oFF.OuCalcFormulaEditorI18n.EDITOR_SHOW_FUNC_HELP_BTN = "FF_FE_EDITOR_SHOW_FUNC_HELP_BTN";
oFF.OuCalcFormulaEditorI18n.EDITOR_SUGGESTIONS_TOOLTIP = "FF_FE_EDITOR_SUGGESTIONS_TOOLTIP";
oFF.OuCalcFormulaEditorI18n.ERRORS_TITLE_MULTIPLE = "FF_FE_ERRORS_TITLE_MULTIPLE";
oFF.OuCalcFormulaEditorI18n.ERRORS_TITLE_SINGLE = "FF_FE_ERRORS_TITLE_SINGLE";
oFF.OuCalcFormulaEditorI18n.FE_BTN_COLLAPSE = "FF_FE_BTN_COLLAPSE";
oFF.OuCalcFormulaEditorI18n.FE_BTN_EXPAND = "FF_FE_BTN_EXPAND";
oFF.OuCalcFormulaEditorI18n.FE_CONDITIONS = "FF_FE_CONDITIONS";
oFF.OuCalcFormulaEditorI18n.FE_DIMENSIONS = "FF_FE_DIMENSIONS";
oFF.OuCalcFormulaEditorI18n.FE_DIMENSION_DATE_DISABLE = "FE_DIMENSION_DATE_DISABLE";
oFF.OuCalcFormulaEditorI18n.FE_DIMENSION_VIRTUAL_DISABLE = "FF_FE_MEASURE_VIRTUAL_DISABLE";
oFF.OuCalcFormulaEditorI18n.FE_DOCUMENTATION = "FF_FE_DOCUMENTATION";
oFF.OuCalcFormulaEditorI18n.FE_EXAMPLE = "FF_FE_EXAMPLE";
oFF.OuCalcFormulaEditorI18n.FE_FUNCTIONS = "FF_FE_FUNCTIONS";
oFF.OuCalcFormulaEditorI18n.FE_FUNCTIONS_BUSINESS = "FF_FE_FUNCTIONS_BUSINESS";
oFF.OuCalcFormulaEditorI18n.FE_FUNCTIONS_CONVERSION = "FF_FE_FUNCTIONS_CONVERSION";
oFF.OuCalcFormulaEditorI18n.FE_FUNCTIONS_DATE_AND_TIME = "FF_FE_FUNCTIONS_DATE_AND_TIME";
oFF.OuCalcFormulaEditorI18n.FE_FUNCTIONS_DYNAMIC_TIME = "FF_FE_FUNCTIONS_DYNAMIC_TIME";
oFF.OuCalcFormulaEditorI18n.FE_FUNCTIONS_LOGICAL = "FF_FE_FUNCTIONS_LOGICAL";
oFF.OuCalcFormulaEditorI18n.FE_FUNCTIONS_LOOKUP_AND_REFERENCE = "FF_FE_FUNCTIONS_LOOKUP_AND_REFERENCE";
oFF.OuCalcFormulaEditorI18n.FE_FUNCTIONS_MATHEMATICAL_FN = "FF_FE_FUNCTIONS_MATHEMATICAL_FN";
oFF.OuCalcFormulaEditorI18n.FE_MEASURE_DATE_DISABLE = "FF_FE_MEASURE_DATE_DISABLE";
oFF.OuCalcFormulaEditorI18n.FE_OPERATORS = "FF_FE_OPERATORS";
oFF.OuCalcFormulaEditorI18n.FE_REMARK = "FF_FE_REMARK";
oFF.OuCalcFormulaEditorI18n.FE_SUMMARY = "FF_FE_SUMMARY";
oFF.OuCalcFormulaEditorI18n.FE_SYNTAX = "FF_FE_SYNTAX";
oFF.OuCalcFormulaEditorI18n.FE_TAB_ICON_FUNCTIONS = "FF_FE_TAB_ICON_FUNCTIONS";
oFF.OuCalcFormulaEditorI18n.FE_TAB_ICON_OBJECTS = "FF_FE_TAB_ICON_OBJECTS";
oFF.OuCalcFormulaEditorI18n.FE_TAB_ICON_OPERATORS = "FF_FE_TAB_ICON_OPERATORS";
oFF.OuCalcFormulaEditorI18n.FORMULA_EXPLAIN_DISCLAIMER_PART1 = "FF_FE_FORMULA_EXPLAIN_DISCLAIMER_PART1";
oFF.OuCalcFormulaEditorI18n.FORMULA_EXPLAIN_DISCLAIMER_PART2 = "FF_FE_FORMULA_EXPLAIN_DISCLAIMER_PART2";
oFF.OuCalcFormulaEditorI18n.FORMULA_EXPLAIN_PANEL_TITLE = "FF_FE_FORMULA_EXPLAIN_PANEL_TITLE";
oFF.OuCalcFormulaEditorI18n.FORMULA_EXPLAIN_TEXT = "FF_FE_FORMULA_EXPLAIN_TEXT";
oFF.OuCalcFormulaEditorI18n.FORMULA_GENERATE_COPY_BTN = "FF_FE_FORMULA_GENERATE_COPY_BTN";
oFF.OuCalcFormulaEditorI18n.FORMULA_GENERATE_PANEL_TITLE = "FF_FE_FORMULA_GENERATE_PANEL_TITLE";
oFF.OuCalcFormulaEditorI18n.FORMULA_GENERATE_SYNTAX_ERROR = "FF_FE_FORMULA_GENERATE_SYNTAX_ERROR";
oFF.OuCalcFormulaEditorI18n.FORMULA_GENERATE_TEXT = "FF_FE_FORMULA_GENERATE_TEXT";
oFF.OuCalcFormulaEditorI18n.FORMULA_GENERATE_TEXT_AREA_LABEL = "FF_FE_FORMULA_GENERATE_TEXT_AREA_LABEL";
oFF.OuCalcFormulaEditorI18n.FORMULA_GENERATE_TEXT_AREA_PLACEHOLDER = "FF_FE_FORMULA_GENERATE_TEXT_AREA_PLACEHOLDER";
oFF.OuCalcFormulaEditorI18n.FORMULA_NL_AREA_PLACEHOLDER = "FF_FE_FORMULA_NL_AREA_PLACEHOLDER";
oFF.OuCalcFormulaEditorI18n.LEFT_PANEL_NO_DATA_DESCRIPTION = "FF_FE_LEFT_PANEL_NO_DATA_DESCRIPTION";
oFF.OuCalcFormulaEditorI18n.LEFT_PANEL_NO_DATA_TITLE = "FF_FE_LEFT_PANEL_NO_DATA_TITLE";
oFF.OuCalcFormulaEditorI18n.MEMBER_SELECTOR_TITLE = "FF_FE_MEMBER_SELECTOR_TITLE";
oFF.OuCalcFormulaEditorI18n.PROVIDER_NAME = "FeFormulaEditor";
oFF.OuCalcFormulaEditorI18n.TAB_OBJECTS_ANNOUNCE_UPDATE = "FF_FE_TAB_OBJECTS_ANNOUNCE_UPDATE";
oFF.OuCalcFormulaEditorI18n.getLocalization = function()
{
	return oFF.XLocalizationCenter.getCenter().getLocalizationProviderByName(oFF.OuCalcFormulaEditorI18n.PROVIDER_NAME);
};
oFF.OuCalcFormulaEditorI18n.staticSetup = function()
{
	let provider = new oFF.OuCalcFormulaEditorI18n();
	provider.setupProvider(oFF.OuCalcFormulaEditorI18n.PROVIDER_NAME, true);
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_BTN_EXPAND, "Expand", "#XTOL: expand button tooltip");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_BTN_COLLAPSE, "Collapse", "#XTOL: collapse button tooltip");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_TAB_ICON_FUNCTIONS, "Functions", "#XTOL: Functions tab icon tooltip");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_TAB_ICON_OBJECTS, "Available Objects", "#XTOL: Objects tab icon tooltip");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_TAB_ICON_OPERATORS, "Conditions and Operators", "#XTOL: Conditions and Operators tab icon tooltip");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_FUNCTIONS, "Functions", "#XTIT: Functions panel name");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_FUNCTIONS_CONVERSION, "Conversion", "#XTIT: Conversion functions panel name");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_FUNCTIONS_LOGICAL, "Logical", "#XTIT: Logical functions panel name");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_FUNCTIONS_DATE_AND_TIME, "Date and Time", "#XTIT: Date and Time functions panel name");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_FUNCTIONS_MATHEMATICAL_FN, "Mathematical", "#XTIT: Mathematical functions panel name");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_FUNCTIONS_LOOKUP_AND_REFERENCE, "Lookup & Reference", "#XTIT: Lookup & Reference functions panel name");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_FUNCTIONS_BUSINESS, "Business", "#XTIT: Business functions panel name");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_FUNCTIONS_DYNAMIC_TIME, "Dynamic Time", "#XTIT: Dynamic Time functions panel name");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_DIMENSIONS, "Dimensions", "#XTIT: Dimensions panel name");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_OPERATORS, "Operators", "#XTIT: Operators panel name");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_CONDITIONS, "Conditions", "#XTIT: Conditions panel name");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_MEASURE_DATE_DISABLE, "This measure is disabled as measures of type date and time are not supported in formulas.", "#XTOL: Tooltip to inform the measure has been disabled because type date");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_DIMENSION_VIRTUAL_DISABLE, "This dimension is disabled as group dimensions are not supported in formulas.", "#XTOL: Tooltip to inform the dimensions has been disabled because type group");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_DIMENSION_DATE_DISABLE, "This dimension is disabled as dimensions of type date and time are not supported in formulas.", "#XTOL: Tooltip to inform the dimensions has been disabled because type date");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.DISPLAY_OPTIONS, "Display Options", "#XTOL: Tooltip for Display option menu button");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.DISPLAY_OPTIONS_DESCRIPTION, "Description", "#XTIT: Display option menu item for 'Description'");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.DISPLAY_OPTIONS_ID, "ID", "#XTIT: Display option menu item for 'ID'");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.DISPLAY_OPTIONS_ID_AND_DESCRIPTION, "ID and Description", "#XTIT: Display option menu item for 'ID and Description'");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.DISPLAY_OPTIONS_DESCRIPTION_AND_ID, "Description and ID", "#XTIT: Display option menu item for 'Description and ID'");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.LEFT_PANEL_NO_DATA_TITLE, "We couldn't find that", "#XMSG: Illustrated message title when no data as result of a search");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.LEFT_PANEL_NO_DATA_DESCRIPTION, "Try adjusting your search?", "#XMSG: Illustrated message description when no data as result of a search");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_DOCUMENTATION, "{0} Documentation", "#XTIT: Documentation label used as aria-label for the accessibility tool");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_SYNTAX, "Syntax", "#XTIT: Syntax label, also used as aria-label for the accessibility tool");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_SUMMARY, "Summary", "#XTIT: Summary label, also used as aria-label for the accessibility tool");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_EXAMPLE, "Example", "#XTIT: Example label, also used as aria-label for the accessibility tool");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FE_REMARK, "Remarks", "#XTIT: Remarks label, also used as aria-label for the accessibility tool");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.EDITOR_LABEL, "Formula", "#XTIT: Formula editor label");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.EDITOR_FORMAT_BTN, "Format", "#XBUT: Format formula button in editor toolbar");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.EDITOR_CLEAR_BTN, "Clear", "#XBUT: Clear formula button in editor toolbar");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.EDITOR_SHOW_DESCRIPTIONS_BTN, "Shows Descriptions", "#XBUT: Shows Descriptions formula button in editor toolbar");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.EDITOR_SHOW_ERRORS_BTN, "Show errors", "#XTOL: Show errors toggle button in editor toolbar");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.EDITOR_HIDE_ERRORS_BTN, "Hide errors", "#XTOL: Hide errors toggle button in editor toolbar");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.EDITOR_SHOW_FUNC_HELP_BTN, "Show Function Help", "#XTOL: Show Function Help Side panel toggle button in editor toolbar");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.EDITOR_HIDE_FUNC_HELP_BTN, "Hide Function Help", "#XTOL: Hide Function Help Side panel toggle button in editor toolbar");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.EDITOR_SUGGESTIONS_TOOLTIP, "Loading suggestions", "#XTOL: Loading icon tooltip which shows autocomplete suggestions are loading");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.EDITOR_ERROR_MESSAGE_MORE, "{0} more errors", "#XMSG: link shown in error message area in case of more than 1 errors");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.ERRORS_TITLE_MULTIPLE, "Errors ({0})", "#XTIT: Errors area title in case of multiple errors");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.ERRORS_TITLE_SINGLE, "Error (1)", "#XTIT: Errors area title in case 1 error");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FORMULA_GENERATE_PANEL_TITLE, "Formula Created With AI", "#XTIT: Title of the generated formula panel");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FORMULA_EXPLAIN_PANEL_TITLE, "AI Generated Formula Explanation", "#XTIT: Title of the generated formula panel");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FORMULA_GENERATE_COPY_BTN, "Copy to formula", "#XTOL: Tooltip for the button to copy the generated formula to the formula editor.");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FORMULA_EXPLAIN_TEXT, "Explain", "#XTIT: Explain formula in AI panel action selection");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FORMULA_GENERATE_TEXT, "Generate", "#XTIT: Generate formula in action AI panel selection");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FORMULA_GENERATE_TEXT_AREA_LABEL, "Formula Requirement", "#XTIT: Natural language text area label");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FORMULA_GENERATE_TEXT_AREA_PLACEHOLDER, "Enter your formula requirement here and let AI generate a formula for you", "#YINS: Natural language text area placeholder for generate formula");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FORMULA_GENERATE_SYNTAX_ERROR, "We could not generate a valid formula. The AI-Assisted Calculations does not support any unapproved functions or operations in the editor.", "#XMSG: Error message shown in case the formula generated by the LLM is syntactically incorrect.");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FORMULA_EXPLAIN_DISCLAIMER_PART1, "Created with AI.", "#XMSG:  AI disclaimer.");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FORMULA_EXPLAIN_DISCLAIMER_PART2, "Verify result before use.", "#XMSG:  AI disclaimer. Verify result before use");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.FORMULA_NL_AREA_PLACEHOLDER, "Specify a formula in natural language format\n for example: 10% of Revenue - 90% of Cost", "#YINS: Natural language text area placeholder");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_AI_PANEL_TITLE, "AI-Assisted Calculations", "#XTIT: Shows AI assistant panel title");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_FUNC_HELP_PANEL_TITLE, "Function Help", "#XTIT: Shows Documentation panel title");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_HELP_BUTTON, "Help", "#XBUT: Shows Documentation tab button in assistance area");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_HELP_EMPTY, "Select a function to get some help here.", "#XMSG: Message shown on Documentation area when no function is selected");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_HELP_EMPTY_TITLE, "No Function Selected", "#XMSG: Message shown as illustrated message title on Documentation area when no function is selected");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_HELP_EMPTY_DESCRIPTION, "Select a function to get information on how to use it.", "#XMSG: Message shown as illustrated message description on Documentation area when no function is selected");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_ERRORS_BUTTON, "Errors", "#XBUT: Shows Error tab button in assistance area");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_ERRORS_TITLE_MULTIPLE, "Found errors ({0})", "#XTIT: Errors area title in case of multiple errors");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_ERRORS_TITLE_SINGLE, "Found error (1)", "#XTIT: Errors area title in case 1 error");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_ERRORS_EMPTY_FORMULA, "There are no errors. The formula is empty", "#XTIT: Errors area placeholder in case of empty formula (part 2)");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_ERRORS_VALID_FORMULA, "There are no errors. Your formula is valid", "#XTIT: Errors area placeholder in case of valid formula (part 2)");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_AI_EXPLANATION_GENERATION_ERROR, "There was an error while generating description: {0}", "#XMSG: Error message shown in case of error during formula explanation. {0} is the message from the server.");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_AI_GENERATION_DIMENSION_MEMBER_WARNING, "The formula generated includes dimension members. These are a best guess based on your input, as the AI assistant doesn't have access to actual member IDs. Please review and replace them with the correct IDs.", "#XMSG: Warning message shown in case of generation warning: in case of dimensions in the formula, we invite the user to verify the members");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_AI_FORMULA_GENERATION_ERROR, "There was an error while generating formula: {0}", "#XMSG: Error message shown in case of error during formula generation. {0} is the message from the server.");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.TAB_OBJECTS_ANNOUNCE_UPDATE, "The Objects panel has been updated.", "#XMSG: Hidden message for screen reader to announce the Measure/Dimension/Accounts have been updated in the panel view.");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.EDITOR_ANNOUNCE_UPDATE, "The code in the editor has been updated.", "#XMSG: Hidden message for screen reader to announce the code in the editor has been updated.");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.EDITOR_NAME_FORMULA, "Formula Editor", "#XMSG: Editor name used as placeholder in EDITOR_NAMED_ANNOUNCE_UPDATE, to identify the formula editor.");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.EDITOR_NAME_GENERATED_FORMULA, "Generated Formula", "#XMSG: Editor name used as placeholder in EDITOR_NAMED_ANNOUNCE_UPDATE, to identify the generated formula readonly editor.");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.EDITOR_NAME_EXPLAIN_FORMULA, "Explain Formula Editor", "#XMSG: Editor name used as placeholder in EDITOR_NAMED_ANNOUNCE_UPDATE,  to identify the editor of the formula to be explained.");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.EDITOR_NAMED_ANNOUNCE_UPDATE, "The code in the editor '{0}' has been updated.", "#XMSG: Hidden message for screen reader to announce the code in the editor has been updated. {0} is the editor name, used when multiple editors are rendered.");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.EDITOR_ERRORS_ANNOUNCE_UPDATE, "The editor error message has been updated: {0}", "#XMSG: Hidden message for screen reader to announce the editor error area has been updated.");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.EDITOR_AI_DESCRIPTION_ANNOUNCE_UPDATE, "The editor AI area has been updated: {0}", "#XMSG: Hidden message for screen reader to announce the editor AI area has been updated.");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.EDITOR_NO_ERRORS_ANNOUNCE_UPDATE, "No Errors", "#XMSG: Hidden message used by FF_FE_ASSISTANCE_ERRORS_ANNOUNCE_UPDATE as parameter in case of no errors.");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_ERRORS_ANNOUNCE_UPDATE, "The list of errors has been updated.", "#XMSG: Hidden message for screen reader to announce the errors list has been updated.");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_HELP_ANNOUNCE_UPDATE, "The help section has been updated.", "#XMSG: Hidden message for screen reader to announce the documentation has been updated.");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.EDITOR_AI_EXPLANATION_ANNOUNCE_UPDATE, "The formula explanation has been updated.", "#XMSG: Hidden message for screen reader to announce the ai explanation has been updated.");
	provider.addTextWithComment(oFF.OuCalcFormulaEditorI18n.MEMBER_SELECTOR_TITLE, "Select Values for {0}", "#XTIT: Member selector dialog title. {0} is the dimension name.");
	return provider;
};

oFF.OuCalcAIExplainView = function() {};
oFF.OuCalcAIExplainView.prototype = new oFF.DfUiView();
oFF.OuCalcAIExplainView.prototype._ff_c = "OuCalcAIExplainView";

oFF.OuCalcAIExplainView.create = function(parser, formulaPresentation, genAiService, activityTracking)
{
	let instance = new oFF.OuCalcAIExplainView();
	instance.m_onExplainFormulaConsumers = oFF.XConsumerCollection.create();
	instance.m_genAiService = oFF.XObjectExt.assertNotNull(genAiService);
	instance.m_explanationView = oFF.OuCalcAIExplanationView.create();
	instance.m_explainFormulaCodeEditor = oFF.OuCalcCodeEditorWidget.create(oFF.XObjectExt.assertNotNull(formulaPresentation), instance.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.EDITOR_NAME_EXPLAIN_FORMULA));
	instance.m_parser = parser;
	instance.m_activityTracking = oFF.XObjectExt.assertNotNull(activityTracking);
	return instance;
};
oFF.OuCalcAIExplainView.prototype.m_activityTracking = null;
oFF.OuCalcAIExplainView.prototype.m_errorStrip = null;
oFF.OuCalcAIExplainView.prototype.m_explainBtn = null;
oFF.OuCalcAIExplainView.prototype.m_explainFormulaCodeEditor = null;
oFF.OuCalcAIExplainView.prototype.m_explanationView = null;
oFF.OuCalcAIExplainView.prototype.m_genAiService = null;
oFF.OuCalcAIExplainView.prototype.m_onExplainFormulaConsumers = null;
oFF.OuCalcAIExplainView.prototype.m_parser = null;
oFF.OuCalcAIExplainView.prototype._performExplainInternal = function()
{
	this.setBusy(true);
	let formulaText = this.m_explainFormulaCodeEditor.getView().getValue();
	this.m_genAiService.explainFormula(formulaText).onThen((explanation) => {
		this.m_explanationView.setExplanation(explanation, true);
		this.recordExplain();
	}).onCatch((error) => {
		this.setError(this.getLocalization().getTextWithPlaceholder(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_AI_EXPLANATION_GENERATION_ERROR, error.getText()));
		this.recordExplainWithError(error.getText());
	}).onFinally(() => {
		this.setBusy(false);
		this.m_explainFormulaCodeEditor.focus();
	});
};
oFF.OuCalcAIExplainView.prototype.addOnExplainFormulaConsumers = function(consumers)
{
	return this.m_onExplainFormulaConsumers.addConsumer(consumers);
};
oFF.OuCalcAIExplainView.prototype.clear = function()
{
	oFF.XTimeout.timeout(0, () => {
		this.setError(null);
		this.m_explainFormulaCodeEditor.clear();
		this.m_explanationView.resetExplanation();
	});
};
oFF.OuCalcAIExplainView.prototype.destroyView = function()
{
	this.m_genAiService = null;
	this.m_parser = null;
	this.m_explanationView = oFF.XObjectExt.release(this.m_explanationView);
	this.m_explainFormulaCodeEditor = oFF.XObjectExt.release(this.m_explainFormulaCodeEditor);
	this.m_errorStrip = null;
	this.m_explainBtn = null;
	this.m_activityTracking = null;
	this.m_onExplainFormulaConsumers.clear();
	this.m_onExplainFormulaConsumers = oFF.XObjectExt.release(this.m_onExplainFormulaConsumers);
};
oFF.OuCalcAIExplainView.prototype.getLocalization = function()
{
	return oFF.XLocalizationCenter.getCenter();
};
oFF.OuCalcAIExplainView.prototype.getSyntaxErrors = function()
{
	let feFormula = this.m_explainFormulaCodeEditor.getFormula();
	let validationMessages = this.m_parser.validate(feFormula);
	if (validationMessages.hasErrors())
	{
		let syntaxError = oFF.XStream.of(validationMessages.getMessages()).find((message) => {
			return message.getCode() === oFF.FeErrorCodes.INVALID_SYNTAX;
		});
		if (syntaxError.isPresent())
		{
			return oFF.XOptional.of(syntaxError.get().getText());
		}
	}
	return oFF.XOptional.empty();
};
oFF.OuCalcAIExplainView.prototype.getViewControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.FLEX_LAYOUT);
};
oFF.OuCalcAIExplainView.prototype.layoutView = function(viewControl)
{
	viewControl.setDirection(oFF.UiFlexDirection.COLUMN);
	viewControl.addCssClass("ffOuCalcAIPanelView");
	viewControl.addCssClass("ffOuCalcAIExplainView");
	let inputLayout = viewControl.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	inputLayout.addCssClass("ffOuCalcAIInputLayout");
	inputLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	let explainFormulaCodeEditorLabel = inputLayout.addNewItemOfType(oFF.UiType.LABEL);
	explainFormulaCodeEditorLabel.addCssClass("ffOuCalcAILabel");
	let label = this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.EDITOR_LABEL);
	explainFormulaCodeEditorLabel.setText(label);
	explainFormulaCodeEditorLabel.setTooltip(label);
	this.m_explainFormulaCodeEditor.renderView(this.getGenesis());
	explainFormulaCodeEditorLabel.setLabelFor(this.m_explainFormulaCodeEditor.getView());
	inputLayout.addItem(this.m_explainFormulaCodeEditor.getView());
	this.m_explainFormulaCodeEditor.addOnChangeConsumer((event) => {
		this.m_explainBtn.setEnabled(oFF.XStringUtils.isNotNullAndNotEmpty(event.getText()));
		this.setError(null);
	});
	this.m_explainBtn = inputLayout.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_explainBtn.addCssClass("ffOuCalcAIExplainBtn");
	this.m_explainBtn.addCssClass("ffOuCalcAIBtn");
	this.m_explainBtn.setEnabled(false);
	this.m_explainBtn.setButtonType(oFF.UiButtonType.PRIMARY);
	let explainBtnText = this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FORMULA_EXPLAIN_TEXT);
	this.m_explainBtn.setTooltip(explainBtnText);
	this.m_explainBtn.setText(explainBtnText);
	this.m_explainBtn.setIcon("ai");
	this.m_explainBtn.registerOnPress(oFF.UiLambdaPressListener.create((event) => {
		this.performExplainInternal();
	}));
	viewControl.addItem(this.m_explanationView.renderView(this.getGenesis()));
	this.m_errorStrip = viewControl.addNewItemOfType(oFF.UiType.MESSAGE_STRIP);
	this.m_errorStrip.setMessageType(oFF.UiMessageType.ERROR);
	this.m_errorStrip.setVisible(false);
};
oFF.OuCalcAIExplainView.prototype.performExplainInternal = function()
{
	oFF.XTimeout.timeout(0, () => {
		this.m_explanationView.resetExplanation();
		this.m_explanationView.setVisible(true);
		let syntaxError = this.getSyntaxErrors();
		if (syntaxError.isPresent())
		{
			this.setError(syntaxError.get());
			this.recordExplainWithError(syntaxError.get());
		}
		else
		{
			this.setError(null);
			this._performExplainInternal();
		}
	});
};
oFF.OuCalcAIExplainView.prototype.recordExplain = function()
{
	this.recordExplainWithError(null);
};
oFF.OuCalcAIExplainView.prototype.recordExplainWithError = function(error)
{
	this.m_activityTracking.recordAiExplainFormula(this.m_parser.getOriginalFormulaItems(), oFF.XOptional.ofNullable(error));
};
oFF.OuCalcAIExplainView.prototype.setBusy = function(busy)
{
	this.m_onExplainFormulaConsumers.accept(oFF.XBooleanValue.create(busy));
	this.m_explainBtn.setEnabled(false);
	this.m_explanationView.setBusy(busy);
};
oFF.OuCalcAIExplainView.prototype.setCustomMode = function(modeName)
{
	this.m_explainFormulaCodeEditor.setCustomMode(modeName);
};
oFF.OuCalcAIExplainView.prototype.setError = function(error)
{
	this.m_errorStrip.setText(error);
	let isErrorSet = oFF.XStringUtils.isNotNullAndNotEmpty(error);
	if (isErrorSet)
	{
		this.m_explanationView.setVisible(false);
	}
	this.m_errorStrip.setVisible(isErrorSet);
};
oFF.OuCalcAIExplainView.prototype.setFormulaText = function(formulaText, performExplain)
{
	this.m_explainFormulaCodeEditor.getView().setValue(formulaText);
	if (performExplain)
	{
		this.performExplainInternal();
	}
};
oFF.OuCalcAIExplainView.prototype.setupView = function() {};

oFF.OuCalcAIExplanationView = function() {};
oFF.OuCalcAIExplanationView.prototype = new oFF.DfUiView();
oFF.OuCalcAIExplanationView.prototype._ff_c = "OuCalcAIExplanationView";

oFF.OuCalcAIExplanationView.create = function()
{
	let instance = new oFF.OuCalcAIExplanationView();
	instance.m_disclaimer = oFF.OuCalcAIDisclaimerWidget.create();
	return instance;
};
oFF.OuCalcAIExplanationView.prototype.m_aiGenerated = false;
oFF.OuCalcAIExplanationView.prototype.m_disclaimer = null;
oFF.OuCalcAIExplanationView.prototype.m_explanationResult = null;
oFF.OuCalcAIExplanationView.prototype._updateUI = function()
{
	let explanationVisible = oFF.XStringUtils.isNotNullAndNotEmpty(this.m_explanationResult.getText());
	this.setVisible(explanationVisible);
	this.m_disclaimer.setVisible(explanationVisible && this.m_aiGenerated);
};
oFF.OuCalcAIExplanationView.prototype.announceUpdate = function()
{
	oFF.UiFramework.currentFramework().announce(this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.EDITOR_AI_EXPLANATION_ANNOUNCE_UPDATE), oFF.UiAriaLiveMode.ASSERTIVE);
};
oFF.OuCalcAIExplanationView.prototype.destroyView = function()
{
	this.m_explanationResult = null;
	this.m_disclaimer = oFF.XObjectExt.release(this.m_disclaimer);
};
oFF.OuCalcAIExplanationView.prototype.getLocalization = function()
{
	return oFF.XLocalizationCenter.getCenter();
};
oFF.OuCalcAIExplanationView.prototype.getViewControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.FLEX_LAYOUT);
};
oFF.OuCalcAIExplanationView.prototype.layoutView = function(viewControl)
{
	viewControl.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	viewControl.setDirection(oFF.UiFlexDirection.COLUMN);
	viewControl.addCssClass("ffOuCalcAIOutputLayout");
	let title = viewControl.addNewItemOfType(oFF.UiType.TITLE);
	title.setText(this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FORMULA_EXPLAIN_PANEL_TITLE));
	title.setTitleStyle(oFF.UiTitleLevel.H_5);
	title.setTitleLevel(oFF.UiTitleLevel.H_5);
	this.m_explanationResult = viewControl.addNewItemOfType(oFF.UiType.TEXT);
	this.m_explanationResult.addCssClass("ffOuCalcAIExplanationResult");
	this.m_disclaimer.renderView(this.getGenesis());
	viewControl.addItem(this.m_disclaimer.getView());
	this._updateUI();
};
oFF.OuCalcAIExplanationView.prototype.resetExplanation = function()
{
	this.setExplanation(null, false);
};
oFF.OuCalcAIExplanationView.prototype.setBusy = function(busy)
{
	if (busy)
	{
		this.getView().setVisible(true);
	}
	this.m_explanationResult.setBusy(busy);
};
oFF.OuCalcAIExplanationView.prototype.setExplanation = function(explanation, aiGenerated)
{
	this.m_aiGenerated = aiGenerated;
	this.m_explanationResult.setText(explanation);
	this.announceUpdate();
	this._updateUI();
};
oFF.OuCalcAIExplanationView.prototype.setVisible = function(visible)
{
	this.getView().setVisible(visible);
};
oFF.OuCalcAIExplanationView.prototype.setupView = function() {};

oFF.OuCalcAIGenerateView = function() {};
oFF.OuCalcAIGenerateView.prototype = new oFF.DfUiView();
oFF.OuCalcAIGenerateView.prototype._ff_c = "OuCalcAIGenerateView";

oFF.OuCalcAIGenerateView.EMPTY_TEXT = "";
oFF.OuCalcAIGenerateView.create = function(parser, formulaPresentation, genAiService, activityTracking)
{
	let instance = new oFF.OuCalcAIGenerateView();
	instance.m_formulaPresentation = oFF.XObjectExt.assertNotNull(formulaPresentation);
	instance.m_genAiService = oFF.XObjectExt.assertNotNull(genAiService);
	instance.m_explanationView = oFF.OuCalcAIExplanationView.create();
	instance.m_onAddFormulaConsumers = oFF.XConsumerCollection.create();
	instance.m_disclaimer = oFF.OuCalcAIDisclaimerWidget.create();
	instance.m_parser = parser;
	instance.m_errors = oFF.MessageManagerSimple.createMessageManager();
	instance.m_activityTracking = oFF.XObjectExt.assertNotNull(activityTracking);
	return instance;
};
oFF.OuCalcAIGenerateView.prototype.m_activityTracking = null;
oFF.OuCalcAIGenerateView.prototype.m_addGeneratedFormulaBtn = null;
oFF.OuCalcAIGenerateView.prototype.m_disclaimer = null;
oFF.OuCalcAIGenerateView.prototype.m_errorStrip = null;
oFF.OuCalcAIGenerateView.prototype.m_errors = null;
oFF.OuCalcAIGenerateView.prototype.m_explanationView = null;
oFF.OuCalcAIGenerateView.prototype.m_formulaPresentation = null;
oFF.OuCalcAIGenerateView.prototype.m_genAiService = null;
oFF.OuCalcAIGenerateView.prototype.m_generateBtn = null;
oFF.OuCalcAIGenerateView.prototype.m_generatedFormulaCodeEditor = null;
oFF.OuCalcAIGenerateView.prototype.m_generatedFormulaLayout = null;
oFF.OuCalcAIGenerateView.prototype.m_naturalLanguageTextArea = null;
oFF.OuCalcAIGenerateView.prototype.m_onAddFormulaConsumers = null;
oFF.OuCalcAIGenerateView.prototype.m_parser = null;
oFF.OuCalcAIGenerateView.prototype.m_warningStrip = null;
oFF.OuCalcAIGenerateView.prototype._dimensionsInFormula = function(formulaText)
{
	return !oFF.FeDimensionTokenExtractor.create().getTokens(formulaText).isEmpty();
};
oFF.OuCalcAIGenerateView.prototype._getLocalization = function()
{
	return oFF.XLocalizationCenter.getCenter();
};
oFF.OuCalcAIGenerateView.prototype._isGeneratedFormulaEmpty = function()
{
	return this.m_generatedFormulaCodeEditor.getFormula() === null || oFF.XStringUtils.isNullOrEmpty(this.m_generatedFormulaCodeEditor.getFormula().getText());
};
oFF.OuCalcAIGenerateView.prototype._performGenerate = function()
{
	this.m_addGeneratedFormulaBtn.setEnabled(false);
	this.m_generatedFormulaCodeEditor.clear();
	this._resetMessages();
	this._setBusy(true);
	this.m_genAiService.generateFormula(this.m_naturalLanguageTextArea.getValue()).onThen((formulaText) => {
		let feFormula = oFF.FeFormula.create(formulaText, this.m_formulaPresentation);
		this.m_errors = this.m_parser.validate(feFormula);
		this.m_generatedFormulaCodeEditor.setValue(feFormula.getDisplayText());
		if (!this.m_errors.hasErrors())
		{
			this._recordGenerate();
		}
		else
		{
			let errorText = this._getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FORMULA_GENERATE_SYNTAX_ERROR);
			this._recordGenerateWithError(errorText);
			this._setError(errorText);
		}
	}).onCatch((error) => {
		this._setError(this._getLocalization().getTextWithPlaceholder(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_AI_FORMULA_GENERATION_ERROR, error.getText()));
		this._recordGenerateWithError(error.getText());
	}).onFinally(() => {
		this._setBusy(false);
		this._updateUI(true);
	});
};
oFF.OuCalcAIGenerateView.prototype._recordGenerate = function()
{
	this._recordGenerateWithError(null);
};
oFF.OuCalcAIGenerateView.prototype._recordGenerateWithError = function(error)
{
	this.m_activityTracking.recordAiGenerateFormula(this.m_parser.getOriginalFormulaItems(), oFF.XOptional.ofNullable(error));
};
oFF.OuCalcAIGenerateView.prototype._resetErrors = function()
{
	this.m_errors = oFF.MessageManagerSimple.createMessageManager();
	this._setError(null);
};
oFF.OuCalcAIGenerateView.prototype._resetMessages = function()
{
	this._resetErrors();
	this.m_warningStrip.setText(oFF.OuCalcAIGenerateView.EMPTY_TEXT);
	this.m_warningStrip.setVisible(false);
};
oFF.OuCalcAIGenerateView.prototype._setBusy = function(busy)
{
	if (busy)
	{
		this.m_disclaimer.setVisible(false);
		this.m_generatedFormulaLayout.setVisible(true);
		this.m_generateBtn.setEnabled(false);
	}
	this.m_generatedFormulaCodeEditor.setBusy(busy);
};
oFF.OuCalcAIGenerateView.prototype._setError = function(error)
{
	this.m_errorStrip.setText(error);
	let isErrorSet = oFF.XStringUtils.isNotNullAndNotEmpty(error);
	this.m_errorStrip.setVisible(isErrorSet);
};
oFF.OuCalcAIGenerateView.prototype._updateGeneratedFormulaBtn = function()
{
	this.m_addGeneratedFormulaBtn.setEnabled(!this._isGeneratedFormulaEmpty());
};
oFF.OuCalcAIGenerateView.prototype._updateUI = function(withFocus)
{
	oFF.XTimeout.timeout(0, () => {
		let generatedFormulaVisible = oFF.XStringUtils.isNotNullAndNotEmpty(this.m_generatedFormulaCodeEditor.getView().getValue());
		this.m_generatedFormulaLayout.setVisible(generatedFormulaVisible);
		this.m_disclaimer.setVisible(generatedFormulaVisible);
		this._updateGeneratedFormulaBtn();
		let warningMsgVisible = generatedFormulaVisible && this._dimensionsInFormula(this.m_generatedFormulaCodeEditor.getView().getValue());
		this.m_warningStrip.setText(warningMsgVisible ? this._getLocalization().getText(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_AI_GENERATION_DIMENSION_MEMBER_WARNING) : oFF.OuCalcAIGenerateView.EMPTY_TEXT);
		this.m_warningStrip.setVisible(warningMsgVisible);
		if (withFocus)
		{
			this.focus();
		}
	});
};
oFF.OuCalcAIGenerateView.prototype.addOnAddFormulaConsumers = function(consumers)
{
	return this.m_onAddFormulaConsumers.addConsumer(consumers);
};
oFF.OuCalcAIGenerateView.prototype.clear = function()
{
	this.m_naturalLanguageTextArea.setValue(oFF.OuCalcAIGenerateView.EMPTY_TEXT);
	this.m_generatedFormulaCodeEditor.clear();
	this._resetMessages();
	this._updateUI(true);
};
oFF.OuCalcAIGenerateView.prototype.destroyView = function()
{
	this.m_formulaPresentation = null;
	this.m_genAiService = null;
	this.m_generatedFormulaLayout = null;
	this.m_explanationView = oFF.XObjectExt.release(this.m_explanationView);
	this.m_generatedFormulaCodeEditor = oFF.XObjectExt.release(this.m_generatedFormulaCodeEditor);
	this.m_naturalLanguageTextArea = null;
	this.m_onAddFormulaConsumers.clear();
	this.m_onAddFormulaConsumers = oFF.XObjectExt.release(this.m_onAddFormulaConsumers);
	this.m_generateBtn = null;
	this.m_errorStrip = null;
	this.m_disclaimer = null;
	this.m_warningStrip = null;
	this.m_errors = oFF.XObjectExt.release(this.m_errors);
	this.m_activityTracking = null;
};
oFF.OuCalcAIGenerateView.prototype.focus = function()
{
	if (this.m_generatedFormulaLayout.isVisible() && !this.m_errorStrip.isVisible())
	{
		this.m_addGeneratedFormulaBtn.focus();
	}
	else
	{
		this.m_naturalLanguageTextArea.focus();
	}
};
oFF.OuCalcAIGenerateView.prototype.getViewControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.FLEX_LAYOUT);
};
oFF.OuCalcAIGenerateView.prototype.layoutView = function(viewControl)
{
	viewControl.setDirection(oFF.UiFlexDirection.COLUMN);
	viewControl.addCssClass("ffOuCalcAIPanelView");
	viewControl.addCssClass("ffOuCalcAIGenerationView");
	let inputLayout = viewControl.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	inputLayout.addCssClass("ffOuCalcAIInputLayout");
	inputLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	let naturalLanguageTextAreaLabel = inputLayout.addNewItemOfType(oFF.UiType.LABEL);
	naturalLanguageTextAreaLabel.addCssClass("ffOuCalcAILabel");
	let label = this._getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FORMULA_GENERATE_TEXT_AREA_LABEL);
	naturalLanguageTextAreaLabel.setText(label);
	naturalLanguageTextAreaLabel.setTooltip(label);
	this.m_naturalLanguageTextArea = inputLayout.addNewItemOfType(oFF.UiType.TEXT_AREA);
	naturalLanguageTextAreaLabel.setLabelFor(this.m_naturalLanguageTextArea);
	this.m_naturalLanguageTextArea.registerOnLiveChange(oFF.UiLambdaLiveChangeListener.create((event) => {
		this.m_generateBtn.setEnabled(oFF.XStringUtils.isNotNullAndNotEmpty(this.m_naturalLanguageTextArea.getValue()));
	}));
	this.m_naturalLanguageTextArea.setPlaceholder(this._getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FORMULA_GENERATE_TEXT_AREA_PLACEHOLDER));
	this.m_generateBtn = inputLayout.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_generateBtn.addCssClass("ffOuCalcAIGenerateBtn");
	this.m_generateBtn.addCssClass("ffOuCalcAIBtn");
	this.m_generateBtn.setEnabled(false);
	this.m_generateBtn.setButtonType(oFF.UiButtonType.PRIMARY);
	let explainBtnText = this._getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FORMULA_GENERATE_TEXT);
	this.m_generateBtn.setTooltip(explainBtnText);
	this.m_generateBtn.setText(explainBtnText);
	this.m_generateBtn.setIcon("ai");
	this.m_generateBtn.registerOnPress(oFF.UiLambdaPressListener.create((event) => {
		this._performGenerate();
	}));
	this.m_generatedFormulaLayout = viewControl.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_generatedFormulaLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_generatedFormulaLayout.addCssClass("ffOuCalcAIOutputLayout");
	let toolbar = this.m_generatedFormulaLayout.addNewItemOfType(oFF.UiType.TOOLBAR);
	let title = toolbar.addNewItemOfType(oFF.UiType.TITLE);
	title.setText(this._getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FORMULA_GENERATE_PANEL_TITLE));
	title.setTitleStyle(oFF.UiTitleLevel.H_5);
	title.setTitleLevel(oFF.UiTitleLevel.H_5);
	toolbar.addNewItemOfType(oFF.UiType.SPACER);
	this.m_addGeneratedFormulaBtn = toolbar.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_addGeneratedFormulaBtn.addCssClass("ffOuCalcAIAddBtn");
	this.m_addGeneratedFormulaBtn.setTooltip(this._getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FORMULA_GENERATE_COPY_BTN));
	this.m_addGeneratedFormulaBtn.setIcon("copy");
	this.m_addGeneratedFormulaBtn.setButtonType(oFF.UiButtonType.TRANSPARENT);
	this.m_addGeneratedFormulaBtn.setEnabled(false);
	this.m_addGeneratedFormulaBtn.registerOnPress(oFF.UiLambdaPressListener.create((event) => {
		if (this._isGeneratedFormulaEmpty())
		{
			return;
		}
		let formula = this.m_generatedFormulaCodeEditor.getFormula();
		this.m_onAddFormulaConsumers.accept(formula.getText());
		this.m_activityTracking.recordAddAiGenerateFormulaToEditor(formula.getText(), this.m_parser.getOriginalFormulaItems());
	}));
	this.m_generatedFormulaCodeEditor = oFF.OuCalcCodeEditorWidget.create(this.m_formulaPresentation, this._getLocalization().getText(oFF.OuCalcFormulaEditorI18n.EDITOR_NAME_GENERATED_FORMULA));
	this.m_generatedFormulaCodeEditor.renderView(this.getGenesis());
	this.m_generatedFormulaCodeEditor.setEditable(false);
	this.m_generatedFormulaCodeEditor.addOnChangeConsumer((formula) => {
		oFF.XTimeout.timeout(0, () => {
			this._updateGeneratedFormulaBtn();
		});
	});
	this.m_generatedFormulaLayout.addItem(this.m_generatedFormulaCodeEditor.getView());
	this.m_errorStrip = viewControl.addNewItemOfType(oFF.UiType.MESSAGE_STRIP);
	this.m_errorStrip.setMessageType(oFF.UiMessageType.ERROR);
	this.m_errorStrip.setVisible(false);
	this.m_warningStrip = viewControl.addNewItemOfType(oFF.UiType.MESSAGE_STRIP);
	this.m_warningStrip.addCssClass("ffOuCalcAIWarningStrip");
	this.m_warningStrip.setMessageType(oFF.UiMessageType.WARNING);
	this.m_warningStrip.setVisible(false);
	viewControl.addItem(this.m_explanationView.renderView(this.getGenesis()));
	this.m_generatedFormulaLayout.setVisible(false);
	this.m_disclaimer.renderView(this.getGenesis());
	viewControl.addItem(this.m_disclaimer.getView());
	this.m_disclaimer.setVisible(false);
	this._updateUI(false);
};
oFF.OuCalcAIGenerateView.prototype.setCustomMode = function(modeName)
{
	this.m_generatedFormulaCodeEditor.setCustomMode(modeName);
};
oFF.OuCalcAIGenerateView.prototype.setupView = function() {};

oFF.OuCalcAIView = function() {};
oFF.OuCalcAIView.prototype = new oFF.DfUiView();
oFF.OuCalcAIView.prototype._ff_c = "OuCalcAIView";

oFF.OuCalcAIView.EXPLAIN_PANEL_NAME = "explain";
oFF.OuCalcAIView.GENERATE_PANEL_NAME = "generate";
oFF.OuCalcAIView.create = function(parser, formulaPresentation, genAiService, activityTracking)
{
	let instance = new oFF.OuCalcAIView();
	if (oFF.FeFeatureToggle.isActive(oFF.FeFeatureToggle.GEN_AI_PHASE1))
	{
		instance.m_explainView = oFF.OuCalcAIExplainView.create(parser, formulaPresentation, genAiService, activityTracking);
		instance.m_generateView = oFF.OuCalcAIGenerateView.create(parser, formulaPresentation, genAiService, activityTracking);
	}
	return instance;
};
oFF.OuCalcAIView.prototype.m_explainView = null;
oFF.OuCalcAIView.prototype.m_generateView = null;
oFF.OuCalcAIView.prototype.m_panelTypeSegmentedButton = null;
oFF.OuCalcAIView.prototype._updateUI = function()
{
	if (oFF.isNull(this.m_panelTypeSegmentedButton))
	{
		return;
	}
	let isGeneratePanelSelected = this.isGeneratePanelSelected();
	this.m_explainView.getView().setVisible(!isGeneratePanelSelected);
	this.m_generateView.getView().setVisible(isGeneratePanelSelected);
};
oFF.OuCalcAIView.prototype.addOnAddFormulaConsumers = function(consumers)
{
	if (oFF.FeFeatureToggle.isActive(oFF.FeFeatureToggle.GEN_AI_PHASE1))
	{
		return this.m_generateView.addOnAddFormulaConsumers(consumers);
	}
	return null;
};
oFF.OuCalcAIView.prototype.addOnExplainFormulaConsumers = function(consumers)
{
	if (oFF.FeFeatureToggle.isActive(oFF.FeFeatureToggle.GEN_AI_PHASE1))
	{
		return this.m_explainView.addOnExplainFormulaConsumers(consumers);
	}
	return null;
};
oFF.OuCalcAIView.prototype.destroyView = function()
{
	this.m_panelTypeSegmentedButton = null;
	this.m_explainView = oFF.XObjectExt.release(this.m_explainView);
	this.m_generateView = oFF.XObjectExt.release(this.m_generateView);
};
oFF.OuCalcAIView.prototype.getLocalization = function()
{
	return oFF.XLocalizationCenter.getCenter();
};
oFF.OuCalcAIView.prototype.getViewControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.FLEX_LAYOUT);
};
oFF.OuCalcAIView.prototype.isGeneratePanelSelected = function()
{
	return oFF.XString.isEqual(this.m_panelTypeSegmentedButton.getSelectedName(), oFF.OuCalcAIView.GENERATE_PANEL_NAME);
};
oFF.OuCalcAIView.prototype.layoutView = function(viewControl)
{
	viewControl.setDirection(oFF.UiFlexDirection.COLUMN);
	viewControl.addCssClass("ffOuCalcAIView");
	if (oFF.FeFeatureToggle.isActive(oFF.FeFeatureToggle.GEN_AI_PHASE1))
	{
		this.m_panelTypeSegmentedButton = viewControl.addNewItemOfType(oFF.UiType.SEGMENTED_BUTTON);
		this.m_panelTypeSegmentedButton.addCssClass("ffOuCalcAIPanelType");
		let generatePanel = this.m_panelTypeSegmentedButton.addNewItem();
		generatePanel.setName(oFF.OuCalcAIView.GENERATE_PANEL_NAME);
		generatePanel.setText(this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FORMULA_GENERATE_TEXT));
		let explainPanel = this.m_panelTypeSegmentedButton.addNewItem();
		explainPanel.setText(this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FORMULA_EXPLAIN_TEXT));
		explainPanel.setName(oFF.OuCalcAIView.EXPLAIN_PANEL_NAME);
		this.m_explainView.renderView(this.getGenesis());
		viewControl.addItem(this.m_explainView.getView());
		this.m_generateView.renderView(this.getGenesis());
		viewControl.addItem(this.m_generateView.getView());
		this._updateUI();
		this.m_panelTypeSegmentedButton.registerOnSelectionChange(oFF.UiLambdaSelectionChangeListener.create((event) => {
			this._updateUI();
		}));
	}
	else
	{
		let noServiceText = viewControl.addNewItemOfType(oFF.UiType.TEXT);
		noServiceText.addCssClass("ffOuCalcAINoServiceText");
		noServiceText.setText("No AI services available");
	}
};
oFF.OuCalcAIView.prototype.performExplain = function(formulaText)
{
	this.setSelectedPanelByName(oFF.OuCalcAIView.EXPLAIN_PANEL_NAME);
	this.m_explainView.setFormulaText(formulaText, true);
};
oFF.OuCalcAIView.prototype.setCustomMode = function(modeName)
{
	this.m_explainView.setCustomMode(modeName);
	this.m_generateView.setCustomMode(modeName);
};
oFF.OuCalcAIView.prototype.setExplainText = function(text)
{
	this.m_explainView.setFormulaText(text, false);
};
oFF.OuCalcAIView.prototype.setSelectedPanelByName = function(name)
{
	this.m_panelTypeSegmentedButton.setSelectedName(name);
	this._updateUI();
};
oFF.OuCalcAIView.prototype.setupView = function() {};

oFF.OuCalcErrorsViewV2 = function() {};
oFF.OuCalcErrorsViewV2.prototype = new oFF.DfUiView();
oFF.OuCalcErrorsViewV2.prototype._ff_c = "OuCalcErrorsViewV2";

oFF.OuCalcErrorsViewV2.EMPTY_STRING = "";
oFF.OuCalcErrorsViewV2.create = function()
{
	let instance = new oFF.OuCalcErrorsViewV2();
	instance.m_onCloseConsumers = oFF.XConsumerCollection.create();
	return instance;
};
oFF.OuCalcErrorsViewV2.prototype.m_errors = null;
oFF.OuCalcErrorsViewV2.prototype.m_messageView = null;
oFF.OuCalcErrorsViewV2.prototype.m_onCloseConsumers = null;
oFF.OuCalcErrorsViewV2.prototype.m_title = null;
oFF.OuCalcErrorsViewV2.prototype.addRegisterOnCloseConsumer = function(consumer)
{
	return this.m_onCloseConsumers.addConsumer(consumer);
};
oFF.OuCalcErrorsViewV2.prototype.announceUpdate = function()
{
	oFF.UiFramework.currentFramework().announce(this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_ERRORS_ANNOUNCE_UPDATE), oFF.UiAriaLiveMode.ASSERTIVE);
};
oFF.OuCalcErrorsViewV2.prototype.destroyView = function()
{
	this.m_messageView = null;
	this.m_onCloseConsumers.clear();
	this.m_onCloseConsumers = oFF.XObjectExt.release(this.m_onCloseConsumers);
};
oFF.OuCalcErrorsViewV2.prototype.generateErrorList = function(errors)
{
	this.m_messageView.setVisible(true);
	for (let i = 0; i < errors.getErrors().size(); i++)
	{
		let errorText = errors.getErrors().get(i).getText();
		let msgItem = this.m_messageView.addNewItem();
		msgItem.setTitle(errorText);
		msgItem.setMessageType(oFF.UiMessageType.ERROR);
	}
};
oFF.OuCalcErrorsViewV2.prototype.generateErrors = function(isChanged)
{
	this.m_messageView.clearItems();
	this.generateErrorList(this.m_errors);
	this.m_title.setText(this.getTitle());
	this.m_messageView.back();
	if (isChanged)
	{
		this.announceUpdate();
	}
};
oFF.OuCalcErrorsViewV2.prototype.getLocalization = function()
{
	return oFF.XLocalizationCenter.getCenter();
};
oFF.OuCalcErrorsViewV2.prototype.getTitle = function()
{
	let numOfErrors = this.m_messageView.getNumberOfItems();
	if (numOfErrors === 0)
	{
		return oFF.OuCalcErrorsViewV2.EMPTY_STRING;
	}
	else if (numOfErrors === 1)
	{
		return this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.ERRORS_TITLE_SINGLE);
	}
	else
	{
		return this.getLocalization().getTextWithPlaceholder(oFF.OuCalcFormulaEditorI18n.ERRORS_TITLE_MULTIPLE, oFF.XInteger.convertToString(numOfErrors));
	}
};
oFF.OuCalcErrorsViewV2.prototype.getViewControl = function(genesis)
{
	let mainLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	mainLayout.addCssClass("ffOuCalcErrorsView");
	mainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	return mainLayout;
};
oFF.OuCalcErrorsViewV2.prototype.hasChanged = function(errors)
{
	let hasNotLocalErrors = oFF.isNull(this.m_errors) || !this.m_errors.hasErrors();
	let hasNotErrors = oFF.isNull(errors) || !errors.hasErrors();
	return hasNotLocalErrors !== hasNotErrors;
};
oFF.OuCalcErrorsViewV2.prototype.layoutView = function(viewControl)
{
	let toolbar = viewControl.addNewItemOfType(oFF.UiType.TOOLBAR);
	toolbar.addCssClass("ffOuCalcErrorsViewToolbar");
	this.m_title = toolbar.addNewItemOfType(oFF.UiType.TITLE);
	this.m_title.setTitleLevel(oFF.UiTitleLevel.H_4);
	this.m_title.setTitleStyle(oFF.UiTitleLevel.H_4);
	this.m_title.addCssClass("ffOuCalcTitle");
	toolbar.addNewItemOfType(oFF.UiType.SPACER);
	let closeButton = toolbar.addNewItemOfType(oFF.UiType.BUTTON);
	closeButton.setIcon("decline");
	closeButton.setTooltip(this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.EDITOR_HIDE_ERRORS_BTN));
	closeButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
	closeButton.registerOnPress(oFF.UiLambdaPressListener.create((event) => {
		this.m_onCloseConsumers.accept(oFF.XBooleanValue.create(true));
	}));
	this.m_messageView = viewControl.addNewItemOfType(oFF.UiType.MESSAGE_VIEW);
	this.m_messageView.addCssClass("ffOuCalcAssistanceErrorList");
};
oFF.OuCalcErrorsViewV2.prototype.setErrors = function(errors)
{
	let hasChanged = this.hasChanged(errors);
	this.m_errors = errors;
	this.generateErrors(hasChanged);
};
oFF.OuCalcErrorsViewV2.prototype.setVisible = function(visible)
{
	this.getView().setVisible(visible);
};
oFF.OuCalcErrorsViewV2.prototype.setupView = function() {};

oFF.OrcaLinkVarValueHelpIntersect = function() {};
oFF.OrcaLinkVarValueHelpIntersect.prototype = new oFF.OrcaLinkVarValueHelpAbstract();
oFF.OrcaLinkVarValueHelpIntersect.prototype._ff_c = "OrcaLinkVarValueHelpIntersect";

oFF.OrcaLinkVarValueHelpIntersect.createLink = function(mainVariable, linkedVariables)
{
	let obj = new oFF.OrcaLinkVarValueHelpIntersect();
	obj.setupLink(mainVariable, linkedVariables);
	return obj;
};
oFF.OrcaLinkVarValueHelpIntersect.prototype.compare = function(o1, o2)
{
	return o1.size() - o2.size();
};
oFF.OrcaLinkVarValueHelpIntersect.prototype.createMap = function(nodes)
{
	let result = oFF.XHashMapByString.create();
	let size = nodes.size();
	for (let i = 0; i < size; i++)
	{
		let node = nodes.get(i);
		let key = this.getMergeKeyValue(node);
		result.put(key, node);
	}
	return result;
};
oFF.OrcaLinkVarValueHelpIntersect.prototype.getRequestedFields = function(dimension)
{
	return oFF.XCollectionUtils.singletonList(dimension.getDisplayKeyField());
};
oFF.OrcaLinkVarValueHelpIntersect.prototype.joinNodes = function(main, linked, isSearch)
{
	let result = oFF.XCollectionUtils.createListCopy(main);
	linked.sortByComparator(this);
	let linkedNodes = oFF.XList.create();
	for (let i = main.size() - 1; i >= 0; i--)
	{
		let mainNode = main.get(i);
		let mainKeyValue = this.getMergeKeyValue(mainNode);
		for (let j = 0; j < linked.size(); j++)
		{
			if (j >= linkedNodes.size())
			{
				linkedNodes.add(this.createMap(linked.get(j)));
			}
			let linkNode = linkedNodes.get(j).getByKey(mainKeyValue);
			if (oFF.isNull(linkNode))
			{
				result.removeAt(i);
				this.removeNodeFromTree(mainNode);
				if (!isSearch)
				{
					this.m_nodeRepo.remove(mainKeyValue);
				}
				break;
			}
			this.getRepoMapping(mainKeyValue).add(linkNode);
		}
	}
	return result;
};
oFF.OrcaLinkVarValueHelpIntersect.prototype.processFetchItems = function(items, fields, listener, customIdentifier)
{
	oFF.OrcaLinkVarValueHelpAbstract.prototype.processFetchItems.call( this , items, fields, listener, customIdentifier);
};
oFF.OrcaLinkVarValueHelpIntersect.prototype.removeNodeFromTree = function(mainNode)
{
	if (mainNode.hasChildren())
	{
		let children = mainNode.getChildren();
		for (let i = 0; i < children.size(); i++)
		{
			children.get(0).setParentNode(null);
		}
	}
	let parentNode = mainNode.getParentNode();
	if (oFF.notNull(parentNode))
	{
		parentNode.removeChildNode(mainNode);
	}
};
oFF.OrcaLinkVarValueHelpIntersect.prototype.requestDefaultKeyAndTextFields = function(dimension)
{
	return dimension === this.m_valueRequestObject.getDimension();
};

oFF.OrcaLinkVarValueHelpUnion = function() {};
oFF.OrcaLinkVarValueHelpUnion.prototype = new oFF.OrcaLinkVarValueHelpAbstract();
oFF.OrcaLinkVarValueHelpUnion.prototype._ff_c = "OrcaLinkVarValueHelpUnion";

oFF.OrcaLinkVarValueHelpUnion.createLink = function(mainVariable, linkedVariables)
{
	let obj = new oFF.OrcaLinkVarValueHelpUnion();
	obj.setupLink(mainVariable, linkedVariables);
	return obj;
};
oFF.OrcaLinkVarValueHelpUnion.prototype.getRequestedFields = function(dimension)
{
	return null;
};
oFF.OrcaLinkVarValueHelpUnion.prototype.joinNodes = function(main, linked, isSearch)
{
	if (isSearch)
	{
		return this.unionSearch(main, linked);
	}
	return this.union(main, linked);
};
oFF.OrcaLinkVarValueHelpUnion.prototype.union = function(main, linked)
{
	let unionMap = oFF.XLinkedHashMapByString.create();
	for (let i = 0; i < main.size(); i++)
	{
		let node1 = main.get(i);
		unionMap.put(this.getMergeKeyValue(node1), node1);
	}
	for (let i1 = 0; i1 < linked.size(); i1++)
	{
		let linkNodes = linked.get(i1);
		let size = linkNodes.size();
		for (let j = 0; j < size; j++)
		{
			let node = linkNodes.get(j);
			let keyValue = this.getMergeKeyValue(node);
			if (!unionMap.containsKey(keyValue))
			{
				unionMap.put(keyValue, node);
				this.getRepoMapping(keyValue).add(node);
			}
		}
	}
	let result = unionMap.getValuesAsReadOnlyList();
	result.sortByComparator(oFF.OlapUiValueHelpNodeComparator.create(this.isHierarchicalValueHelp()));
	return result;
};
oFF.OrcaLinkVarValueHelpUnion.prototype.unionSearch = function(main, linked)
{
	let unionMap = oFF.XLinkedHashMapByString.create();
	let maxSize = main.size();
	for (let i = 0; i < linked.size(); i++)
	{
		let size = linked.size();
		if (size > maxSize)
		{
			maxSize = size;
		}
	}
	for (let i1 = 0; i1 < maxSize; i1++)
	{
		if (i1 < main.size())
		{
			let mainNode = main.get(i1);
			unionMap.put(this.getMergeKeyValue(mainNode), mainNode);
			continue;
		}
		for (let j = 0; j < linked.size(); j++)
		{
			let linkNodes = linked.get(j);
			if (i1 < linkNodes.size())
			{
				let linkNode = linkNodes.get(i1);
				let linkedKeyValue = this.getMergeKeyValue(linkNode);
				unionMap.put(linkedKeyValue, linkNode);
				this.getRepoMapping(linkedKeyValue).add(linkNode);
			}
		}
	}
	return unionMap.getValuesAsReadOnlyList();
};

oFF.DataExportHelperI18n = function() {};
oFF.DataExportHelperI18n.prototype = new oFF.DfXLocalizationProvider();
oFF.DataExportHelperI18n.prototype._ff_c = "DataExportHelperI18n";

oFF.DataExportHelperI18n.APPENDIX_CREATED_BY_TITLE = "FF_DATA_EXPORT_APPENDIX_CREATED_BY_TITLE";
oFF.DataExportHelperI18n.APPENDIX_CREATED_ON_TITLE = "FF_DATA_EXPORT_APPENDIX_CREATED_ON_TITLE";
oFF.DataExportHelperI18n.APPENDIX_FILTERS_TITLE = "FF_DATA_EXPORT_APPENDIX_FILTERS_TITLE";
oFF.DataExportHelperI18n.APPENDIX_FILTER_OPERATOR_TITLE = "FF_DATA_EXPORT_APPENDIX_FILTER_OPERATOR_TITLE";
oFF.DataExportHelperI18n.APPENDIX_FILTER_VALUE_TITLE = "FF_DATA_EXPORT_APPENDIX_FILTER_VALUE_TITLE";
oFF.DataExportHelperI18n.APPENDIX_INFO_PROVIDER_TITLE = "FF_DATA_EXPORT_APPENDIX_INFO_PROVIDER_TITLE";
oFF.DataExportHelperI18n.APPENDIX_MEASURE_FILTERS_TITLE = "FF_DATA_EXPORT_APPENDIX_MEASURE_FILTERS_TITLE";
oFF.DataExportHelperI18n.APPENDIX_MODEL_TITLE = "FF_DATA_EXPORT_APPENDIX_MODEL_TITLE";
oFF.DataExportHelperI18n.APPENDIX_QUERY_TITLE = "FF_DATA_EXPORT_APPENDIX_QUERY_TITLE";
oFF.DataExportHelperI18n.APPENDIX_SHORTCUT_LINK_TITLE = "FF_DATA_EXPORT_APPENDIX_SHORTCUT_LINK_TITLE";
oFF.DataExportHelperI18n.APPENDIX_TECHNICAL_TITLE = "FF_DATA_EXPORT_APPENDIX_TECHNICAL_TITLE";
oFF.DataExportHelperI18n.APPENDIX_TENANT_TITLE = "FF_DATA_EXPORT_APPENDIX_TENANT_TITLE";
oFF.DataExportHelperI18n.APPENDIX_TITLE = "FF_DATA_EXPORT_APPENDIX_TITLE";
oFF.DataExportHelperI18n.APPENDIX_VARIABLES_TITLE = "FF_DATA_EXPORT_APPENDIX_VARIABLES_TITLE";
oFF.DataExportHelperI18n.DEFAULT_EXPORT_FILE_NAME = "FF_DATA_EXPORT_DEFAULT_FILE_NAME";
oFF.DataExportHelperI18n.GENERIC_EXPORT_FAILURE = "FF_DATA_EXPORT_GENERIC_FAILURE";
oFF.DataExportHelperI18n.ID_PREFIX = "FF_DATA_EXPORT_ID_PREFIX";
oFF.DataExportHelperI18n.MAX_RESULT_RECORDS_LIMIT_REACHED = "FF_DATA_EXPORT_MAX_RESULT_RECORDS_LIMIT_REACHED";
oFF.DataExportHelperI18n.PROVIDER_NAME = "DataExportHelper";
oFF.DataExportHelperI18n.UKNOWN_EXPORT_CONFIG = "FF_DATA_EXPORT_UKNOWN_EXPORT_CONFIG";
oFF.DataExportHelperI18n.staticSetup = function()
{
	let provider = new oFF.DataExportHelperI18n();
	provider.setupProvider(oFF.DataExportHelperI18n.PROVIDER_NAME, true);
	provider.addText(oFF.DataExportHelperI18n.DEFAULT_EXPORT_FILE_NAME, "Untitled");
	provider.addComment(oFF.DataExportHelperI18n.DEFAULT_EXPORT_FILE_NAME, "#XMSG: Untitled, The default file name of an export if the user has not specifed one.");
	provider.addText(oFF.DataExportHelperI18n.ID_PREFIX, "DATA_EXPORT_TASK");
	provider.addComment(oFF.DataExportHelperI18n.ID_PREFIX, "#XMSG: Name of the task for exporting data.");
	provider.addText(oFF.DataExportHelperI18n.APPENDIX_TITLE, "Information On Query");
	provider.addComment(oFF.DataExportHelperI18n.APPENDIX_TITLE, "#XTIT: Appendix title");
	provider.addText(oFF.DataExportHelperI18n.APPENDIX_TECHNICAL_TITLE, "Technical Information");
	provider.addComment(oFF.DataExportHelperI18n.APPENDIX_TECHNICAL_TITLE, "#XTIT: Technical Information title");
	provider.addText(oFF.DataExportHelperI18n.APPENDIX_TENANT_TITLE, "Tenant");
	provider.addComment(oFF.DataExportHelperI18n.APPENDIX_TENANT_TITLE, "#XTIT: Tenant url title");
	provider.addText(oFF.DataExportHelperI18n.APPENDIX_QUERY_TITLE, "Query Name");
	provider.addComment(oFF.DataExportHelperI18n.APPENDIX_QUERY_TITLE, "#XTIT: Query Name title");
	provider.addText(oFF.DataExportHelperI18n.APPENDIX_INFO_PROVIDER_TITLE, "Information Provider");
	provider.addComment(oFF.DataExportHelperI18n.APPENDIX_INFO_PROVIDER_TITLE, "#XTIT: Information Provider title");
	provider.addText(oFF.DataExportHelperI18n.APPENDIX_MODEL_TITLE, "Model");
	provider.addComment(oFF.DataExportHelperI18n.APPENDIX_MODEL_TITLE, "#XTIT: Model title");
	provider.addText(oFF.DataExportHelperI18n.APPENDIX_CREATED_BY_TITLE, "Created By");
	provider.addComment(oFF.DataExportHelperI18n.APPENDIX_CREATED_BY_TITLE, "#XTIT: Created by title");
	provider.addText(oFF.DataExportHelperI18n.APPENDIX_CREATED_ON_TITLE, "Created On");
	provider.addComment(oFF.DataExportHelperI18n.APPENDIX_CREATED_ON_TITLE, "#XTIT: Created on title");
	provider.addText(oFF.DataExportHelperI18n.APPENDIX_VARIABLES_TITLE, "Variables");
	provider.addComment(oFF.DataExportHelperI18n.APPENDIX_VARIABLES_TITLE, "#XTIT: Variables title");
	provider.addText(oFF.DataExportHelperI18n.APPENDIX_FILTERS_TITLE, "Filters");
	provider.addComment(oFF.DataExportHelperI18n.APPENDIX_FILTERS_TITLE, "#XTIT: Filters title");
	provider.addText(oFF.DataExportHelperI18n.APPENDIX_MEASURE_FILTERS_TITLE, "Measure Filters");
	provider.addComment(oFF.DataExportHelperI18n.APPENDIX_MEASURE_FILTERS_TITLE, "#XTIT: Measure filters title");
	provider.addText(oFF.DataExportHelperI18n.APPENDIX_FILTER_OPERATOR_TITLE, "Operator");
	provider.addComment(oFF.DataExportHelperI18n.APPENDIX_FILTER_OPERATOR_TITLE, "#XTIT: Filter operator title");
	provider.addText(oFF.DataExportHelperI18n.APPENDIX_FILTER_VALUE_TITLE, "Value");
	provider.addComment(oFF.DataExportHelperI18n.APPENDIX_FILTER_VALUE_TITLE, "#XTIT: Filter value title");
	provider.addText(oFF.DataExportHelperI18n.APPENDIX_SHORTCUT_LINK_TITLE, "Shortcut Link");
	provider.addComment(oFF.DataExportHelperI18n.APPENDIX_SHORTCUT_LINK_TITLE, "#XTIT: Shortcut Link title");
	provider.addText(oFF.DataExportHelperI18n.GENERIC_EXPORT_FAILURE, "The export failed for an unknown reason. Please contact an administrator.");
	provider.addComment(oFF.DataExportHelperI18n.GENERIC_EXPORT_FAILURE, "#XMSG: Message to handle empty failure reason from the export library.");
	provider.addText(oFF.DataExportHelperI18n.UKNOWN_EXPORT_CONFIG, "The export configuration was incorrect, leading to an export error. Please contact an administrator.");
	provider.addComment(oFF.DataExportHelperI18n.UKNOWN_EXPORT_CONFIG, "#XMSG: Message for a runtime error that corrupted the export configuration.");
	provider.addText(oFF.DataExportHelperI18n.MAX_RESULT_RECORDS_LIMIT_REACHED, "The export failed. The query process was stopped as it returned too many records. Please try filtering your data.");
	provider.addComment(oFF.DataExportHelperI18n.MAX_RESULT_RECORDS_LIMIT_REACHED, "#XMSG: Error message shown when export fails due to the max number of records limit being reached");
	provider.addText(oFF.ExportResult.FF_DATA_EXPORT_INSUFFICIENT_WIDTH_WARNING, "The exported content does not fit on the chosen page size and orientation. Please choose a wider page size.");
	provider.addComment(oFF.ExportResult.FF_DATA_EXPORT_INSUFFICIENT_WIDTH_WARNING, "#XMSG: Warning for insufficient width of page during export.");
	provider.addText(oFF.ExportResult.FF_DATA_EXPORT_INSUFFICIENT_HEIGHT_WARNING, "The exported content does not fit on the chosen page size and orientation. Please choose a longer page size.");
	provider.addComment(oFF.ExportResult.FF_DATA_EXPORT_INSUFFICIENT_HEIGHT_WARNING, "#XMSG: Warning for insufficient height of page during export.");
	provider.addText(oFF.ExportResult.FF_DATA_EXPORT_MAIN_TABLE_TEMPLATE, "Table export: {0}");
	provider.addComment(oFF.ExportResult.FF_DATA_EXPORT_MAIN_TABLE_TEMPLATE, "#XMSG: Template string for warnings/errors generated from the main data table.");
	provider.addText(oFF.ExportResult.FF_DATA_EXPORT_APPENDIX_TABLE_TEMPLATE, "Appendix export: {0}");
	provider.addComment(oFF.ExportResult.FF_DATA_EXPORT_APPENDIX_TABLE_TEMPLATE, "#XMSG: Template string for warnings/errors generated from the appendix table.");
	return provider;
};

oFF.OuDataSourceListView = function() {};
oFF.OuDataSourceListView.prototype = new oFF.DfUiView();
oFF.OuDataSourceListView.prototype._ff_c = "OuDataSourceListView";

oFF.OuDataSourceListView.PAGE_SIZE = 30;
oFF.OuDataSourceListView.create = function(process, systemName)
{
	let newView = new oFF.OuDataSourceListView();
	newView.m_process = process;
	newView.m_systemName = systemName;
	return newView;
};
oFF.OuDataSourceListView.prototype.m_currentCatalogManager = null;
oFF.OuDataSourceListView.prototype.m_currentData = null;
oFF.OuDataSourceListView.prototype.m_currentPage = 0;
oFF.OuDataSourceListView.prototype.m_dataSourceSelectedConsumer = null;
oFF.OuDataSourceListView.prototype.m_left = null;
oFF.OuDataSourceListView.prototype.m_liveDebounceListener = null;
oFF.OuDataSourceListView.prototype.m_process = null;
oFF.OuDataSourceListView.prototype.m_querySearch = null;
oFF.OuDataSourceListView.prototype.m_queryTbl = null;
oFF.OuDataSourceListView.prototype.m_right = null;
oFF.OuDataSourceListView.prototype.m_systemName = null;
oFF.OuDataSourceListView.prototype.m_systemNamesList = null;
oFF.OuDataSourceListView.prototype.m_systemsDropdown = null;
oFF.OuDataSourceListView.prototype._displayError = function(message)
{
	this.getView().clearItems();
	let illustratedMessage = this.getView().addNewItemOfType(oFF.UiType.ILLUSTRATED_MESSAGE);
	illustratedMessage.setIllustrationType(oFF.UiIllustratedMessageType.CONNECTION);
	illustratedMessage.setIllustrationSize(oFF.UiIllustratedMessageSize.AUTO);
	let msgStrip = this.getView().addNewItemOfType(oFF.UiType.MESSAGE_STRIP);
	msgStrip.setMessageType(oFF.UiMessageType.ERROR);
	msgStrip.setShowCloseButton(false);
	msgStrip.setShowIcon(true);
	msgStrip.setIcon("message-error");
	msgStrip.setText(oFF.XStringUtils.isNotNullAndNotEmpty(message) ? message : "Error");
};
oFF.OuDataSourceListView.prototype._getDataSources = function()
{
	let systemLandscape = this.m_process.getSystemLandscape();
	let systemDescription = systemLandscape.getSystemDescription(this.m_systemName);
	if (oFF.isNull(systemDescription))
	{
		this._displayError(oFF.XStringUtils.concatenate2("Could not find system; ", this.m_systemName));
		return;
	}
	let application = this.m_process.getApplication();
	let serviceConfig = oFF.OlapCatalogApiModule.SERVICE_TYPE_OLAP_CATALOG.createServiceConfig(application);
	serviceConfig.setSystemName(this.m_systemName);
	this.getView().setBusy(true);
	serviceConfig.processOlapCatalogManagerCreation(oFF.SyncType.NON_BLOCKING, oFF.OlapLambdaCatalogManagerCreatedListener.create((extResult, olapCatalogManager) => {
		this.getView().setBusy(false);
		if (extResult.hasErrors())
		{
			this._displayError(extResult.getSummary());
			return;
		}
		this.m_currentCatalogManager = extResult.getData();
		this.m_currentCatalogManager.setResultMaxSize(oFF.OuDataSourceListView.PAGE_SIZE + 1);
		if (systemDescription.getSystemType() === oFF.SystemType.HANA || systemDescription.getSystemType() === oFF.SystemType.DWC)
		{
			this.m_currentCatalogManager.addSelectedType(oFF.MetaObjectType.DBVIEW);
			this.m_currentCatalogManager.addSelectedType(oFF.MetaObjectType.PLANNING);
			this.m_currentCatalogManager.addSelectedType(oFF.MetaObjectType.INA_MODEL);
		}
		this._processFetch();
		this.m_querySearch.setEnabled(true);
	}), null);
};
oFF.OuDataSourceListView.prototype._handleDataSourcePicked = function(catalogItem)
{
	if (oFF.notNull(this.m_dataSourceSelectedConsumer) && oFF.notNull(catalogItem))
	{
		let dataSource = oFF.QFactory.createDataSource();
		dataSource.setSystemName(this.m_systemName);
		dataSource.setType(catalogItem.getType());
		dataSource.setEnvironmentName(catalogItem.getEnvironmentName());
		dataSource.setSchemaName(catalogItem.getSchemaName());
		dataSource.setPackageName(catalogItem.getPackageName());
		dataSource.setObjectName(catalogItem.getObjectName());
		this.m_dataSourceSelectedConsumer(dataSource);
	}
};
oFF.OuDataSourceListView.prototype._handleSearch = function(event)
{
	this.m_currentPage = 0;
	this._processFetch();
	if (oFF.notNull(this.m_liveDebounceListener))
	{
		this.m_liveDebounceListener.cancel();
	}
};
oFF.OuDataSourceListView.prototype._handleSystemSelection = function(selectEvent)
{
	let selectedSystem = selectEvent.getSelectedItem().getTag();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(selectedSystem))
	{
		this.m_systemName = selectedSystem;
		this._getDataSources();
	}
};
oFF.OuDataSourceListView.prototype._processFetch = function()
{
	this.getView().setBusy(true);
	this.m_currentCatalogManager.setSearchFilter(null);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_querySearch.getValue()))
	{
		let searchString = oFF.XStringUtils.concatenate3("*", this.m_querySearch.getValue(), "*");
		this.m_currentCatalogManager.setSearchFilter(searchString);
		this.m_currentCatalogManager.setSearchOnName(true);
	}
	this.m_currentCatalogManager.setResultOffset(this.m_currentPage * oFF.OuDataSourceListView.PAGE_SIZE);
	this.m_currentCatalogManager.processGetResult(oFF.SyncType.NON_BLOCKING, oFF.OlapLambdaCatalogResultListener.create((extResult, result) => {
		this.getView().setBusy(false);
		if (extResult.hasErrors())
		{
			this._displayError(extResult.getSummary());
			return;
		}
		this.m_currentData = extResult.getData().getObjectsList();
		this._updateTable();
	}), null);
};
oFF.OuDataSourceListView.prototype._updatePageButtons = function()
{
	this.m_left.setEnabled(this.m_currentPage > 0);
	this.m_right.setEnabled(this.m_currentData.size() > oFF.OuDataSourceListView.PAGE_SIZE);
};
oFF.OuDataSourceListView.prototype._updateTable = function()
{
	this.m_queryTbl.clearResponsiveTableRows();
	for (let i = 0; i < this.m_currentData.size(); i++)
	{
		if (i >= oFF.OuDataSourceListView.PAGE_SIZE)
		{
			break;
		}
		let catalogItem = this.m_currentData.get(i);
		let row = this.m_queryTbl.addNewResponsiveTableRow();
		row.addNewResponsiveTableCell().setText(catalogItem.getName());
		row.addNewResponsiveTableCell().setText(catalogItem.getText());
		row.setCustomObject(catalogItem);
	}
	this._updatePageButtons();
};
oFF.OuDataSourceListView.prototype.destroyView = function()
{
	this.m_dataSourceSelectedConsumer = null;
	if (oFF.notNull(this.m_liveDebounceListener))
	{
		this.m_liveDebounceListener.cancel();
		this.m_liveDebounceListener = null;
	}
	this.m_currentData = null;
	this.m_currentCatalogManager = oFF.XObjectExt.release(this.m_currentCatalogManager);
	this.m_left = oFF.XObjectExt.release(this.m_left);
	this.m_right = oFF.XObjectExt.release(this.m_right);
	this.m_queryTbl = oFF.XObjectExt.release(this.m_queryTbl);
	this.m_systemsDropdown = oFF.XObjectExt.release(this.m_systemsDropdown);
	this.m_querySearch = oFF.XObjectExt.release(this.m_querySearch);
	this.m_systemNamesList = null;
	this.m_process = null;
};
oFF.OuDataSourceListView.prototype.getViewControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.FLEX_LAYOUT);
};
oFF.OuDataSourceListView.prototype.layoutView = function(viewControl)
{
	viewControl.setDirection(oFF.UiFlexDirection.COLUMN);
	viewControl.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	viewControl.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	if (oFF.XStringUtils.isNullOrEmpty(this.m_systemName))
	{
		this._displayError("Missing system name! Please specify a system name.");
		return;
	}
	let tableScroller = viewControl.addNewItemOfType(oFF.UiType.SCROLL_CONTAINER);
	tableScroller.setFlex("auto");
	this.m_queryTbl = tableScroller.setNewContent(oFF.UiType.RESPONSIVE_TABLE);
	this.m_queryTbl.setSelectionMode(oFF.UiSelectionMode.SINGLE_SELECT_MASTER);
	this.m_queryTbl.addNewResponsiveTableColumn().setNewHeader(oFF.UiType.TITLE).setText("Name");
	this.m_queryTbl.addNewResponsiveTableColumn().setNewHeader(oFF.UiType.TITLE).setText("Description");
	this.m_queryTbl.registerOnSelect(oFF.UiLambdaSelectListener.create((selectEvent) => {
		let catalogItem = selectEvent.getSelectedItem().getCustomObject();
		this._handleDataSourcePicked(catalogItem);
	}));
	let tableHeaderToolbar = this.m_queryTbl.setNewHeaderToolbar();
	tableHeaderToolbar.useMaxWidth();
	this.m_querySearch = tableHeaderToolbar.addNewItemOfType(oFF.UiType.SEARCH_FIELD);
	this.m_querySearch.registerOnSearch(oFF.UiLambdaSearchListener.create(this._handleSearch.bind(this)));
	this.m_liveDebounceListener = oFF.UiLambdaLiveChangeWithDebounceListener.create(this._handleSearch.bind(this), 1000);
	this.m_querySearch.registerOnLiveChange(this.m_liveDebounceListener);
	if (oFF.XCollectionUtils.hasElements(this.m_systemNamesList) && this.m_systemNamesList.size() > 1)
	{
		tableHeaderToolbar.addNewItemOfType(oFF.UiType.SPACER);
		this.m_systemsDropdown = tableHeaderToolbar.addNewItemOfType(oFF.UiType.DROPDOWN);
		this.m_systemsDropdown.registerOnSelect(oFF.UiLambdaSelectListener.create(this._handleSystemSelection.bind(this)));
		oFF.XCollectionUtils.forEach(this.m_systemNamesList, (system) => {
			let tmpItem = this.m_systemsDropdown.addNewItem();
			tmpItem.setText(system);
			tmpItem.setName(system);
			tmpItem.setTag(system);
		});
		this.m_systemsDropdown.setSelectedName(this.m_systemName);
	}
	let footer = viewControl.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	footer.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	this.m_left = footer.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_left.setIcon("navigation-left-arrow");
	this.m_left.setPadding(oFF.UiCssBoxEdges.create("4px"));
	this.m_left.registerOnPress(oFF.UiLambdaPressListener.create((controlEvent) => {
		this.m_currentPage = this.m_currentPage - 1;
		this._processFetch();
	}));
	this.m_right = footer.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_right.setIcon("navigation-right-arrow");
	this.m_right.setPadding(oFF.UiCssBoxEdges.create("4px"));
	this.m_right.registerOnPress(oFF.UiLambdaPressListener.create((controlEvent) => {
		this.m_currentPage = this.m_currentPage + 1;
		this._processFetch();
	}));
	this._getDataSources();
};
oFF.OuDataSourceListView.prototype.setDataSourceSelectedConsumer = function(consumer)
{
	this.m_dataSourceSelectedConsumer = consumer;
};
oFF.OuDataSourceListView.prototype.setSystemNames = function(systemNames)
{
	this.m_systemNamesList = systemNames;
};
oFF.OuDataSourceListView.prototype.setupView = function()
{
	if (oFF.isNull(this.m_process))
	{
		throw oFF.XException.createRuntimeException("Missing process! A process is required for the data source list view!");
	}
};

oFF.OuAxesViewI18n = function() {};
oFF.OuAxesViewI18n.prototype = new oFF.DfXLocalizationProvider();
oFF.OuAxesViewI18n.prototype._ff_c = "OuAxesViewI18n";

oFF.OuAxesViewI18n.BUILDER_ADD_ACCOUNT_INFO = "FF_GDS_QB_BUILDER_ADD_ACCOUNT_INFO";
oFF.OuAxesViewI18n.BUILDER_ADD_ACCOUNT_OPTIONAL = "FF_GDS_QB_BUILDER_ADD_ACCOUNT_OPTIONAL";
oFF.OuAxesViewI18n.BUILDER_ADD_DIMENSION_OPTIONAL = "FF_GDS_QB_BUILDER_ADD_DIMENSION_OPTIONAL";
oFF.OuAxesViewI18n.BUILDER_ADD_MEASURE_INFO = "FF_GDS_QB_BUILDER_ADD_MEASURE_INFO";
oFF.OuAxesViewI18n.BUILDER_ADD_MEASURE_OPTIONAL = "FF_GDS_QB_BUILDER_ADD_MEASURE_OPTIONAL";
oFF.OuAxesViewI18n.BUILDER_BARCOLUMN_OPTION = "FF_GDS_QB_BUILDER_BARCOLUMN_OPTION";
oFF.OuAxesViewI18n.BUILDER_BAR_OPTION = "FF_GDS_QB_BUILDER_BAR_OPTION";
oFF.OuAxesViewI18n.BUILDER_CHART_AXIS_X = "FF_GDS_QB_BUILDER_CHART_AXIS_X";
oFF.OuAxesViewI18n.BUILDER_CHART_AXIS_Y = "FF_GDS_QB_BUILDER_CHART_AXIS_Y";
oFF.OuAxesViewI18n.BUILDER_CHART_COLOR = "FF_GDS_QB_BUILDER_CHART_COLOR";
oFF.OuAxesViewI18n.BUILDER_CHART_COLUMN = "FF_GDS_QB_BUILDER_CHART_COLUMN";
oFF.OuAxesViewI18n.BUILDER_CHART_DIMENSIONS = "FF_GDS_QB_BUILDER_CHART_DIMENSIONS";
oFF.OuAxesViewI18n.BUILDER_CHART_LINE = "FF_GDS_QB_BUILDER_CHART_LINE";
oFF.OuAxesViewI18n.BUILDER_CHART_LINE_YLEFT = "FF_GDS_QB_BUILDER_CHART_LINE_YLEFT";
oFF.OuAxesViewI18n.BUILDER_CHART_LINE_YRIGHT = "FF_GDS_QB_BUILDER_CHART_LINE_YRIGHT";
oFF.OuAxesViewI18n.BUILDER_CHART_ORIENTATION = "FF_GDS_QB_BUILDER_CHART_ORIENTATION";
oFF.OuAxesViewI18n.BUILDER_CHART_ORIENTATION_HORIZONTAL = "FF_GDS_QB_BUILDER_CHART_ORIENTATION_HORIZONTAL";
oFF.OuAxesViewI18n.BUILDER_CHART_ORIENTATION_VERTICAL = "FF_GDS_QB_BUILDER_CHART_ORIENTATION_VERTICAL";
oFF.OuAxesViewI18n.BUILDER_CHART_VALUE_SELECTION = "FF_GDS_QB_BUILDER_CHART_VALUE_SELECTION";
oFF.OuAxesViewI18n.BUILDER_COLUMN_LINE_OPTION = "FF_GDS_QB_BUILDER_COLUMN_LINE_OPTION";
oFF.OuAxesViewI18n.BUILDER_COLUMN_OPTION = "FF_GDS_QB_BUILDER_COLUMN_OPTION";
oFF.OuAxesViewI18n.BUILDER_DISPLAY_TYPE = "FF_GDS_QB_BUILDER_DISPLAY_TYPE";
oFF.OuAxesViewI18n.BUILDER_DONUT_OPTION = "FF_GDS_QB_BUILDER_DONUT_OPTION";
oFF.OuAxesViewI18n.BUILDER_FILTER_DIALOG_TITLE = "FF_GDS_QB_BUILDER_FILTER_DIALOG_TITLE";
oFF.OuAxesViewI18n.BUILDER_GRID_OPTION = "FF_GDS_QB_BUILDER_GRID_OPTION";
oFF.OuAxesViewI18n.BUILDER_LINE_OPTION = "FF_GDS_QB_BUILDER_LINE_OPTION";
oFF.OuAxesViewI18n.BUILDER_METRIC_OPTION = "FF_GDS_QB_BUILDER_METRIC_OPTION";
oFF.OuAxesViewI18n.BUILDER_OVERLAP_Y_AXIS = "FF_GDS_QB_BUILDER_OVERLAP_Y_AXIS";
oFF.OuAxesViewI18n.BUILDER_PIE_OPTION = "FF_GDS_QB_BUILDER_PIE_OPTION";
oFF.OuAxesViewI18n.BUILDER_REMOVE = "FF_GDS_QB_BUILDER_REMOVE";
oFF.OuAxesViewI18n.BUILDER_SHOW_AS_100_PERCENT = "FF_GDS_QB_BUILDER_SHOW_AS_100_PERCENT";
oFF.OuAxesViewI18n.BUILDER_STACKED_AREA_OPTION = "FF_GDS_QB_BUILDER_STACKED_AREA_OPTION";
oFF.OuAxesViewI18n.BUILDER_STACKED_BAR_OPTION = "FF_GDS_QB_BUILDER_STACKED_BAR_OPTION";
oFF.OuAxesViewI18n.BUILDER_STACKED_COLUMN_LINE_OPTION = "FF_GDS_QB_BUILDER_STACKED_COLUMN_LINE_OPTION";
oFF.OuAxesViewI18n.BUILDER_STACKED_COLUMN_OPTION = "FF_GDS_QB_BUILDER_STACKED_COLUMN_OPTION";
oFF.OuAxesViewI18n.BUILDER_TOAST_MEMBERS_REMOVED = "FF_GDS_QB_BUILDER_TOAST_MEMBERS_REMOVED";
oFF.OuAxesViewI18n.BUILDER_WATERFALL_OPTION = "FF_GDS_QB_BUILDER_WATERFALL_OPTION";
oFF.OuAxesViewI18n.PROVIDER_NAME = "AxesView";
oFF.OuAxesViewI18n.staticSetup = function()
{
	let qbProvider = new oFF.OuAxesViewI18n();
	qbProvider.setupProvider(oFF.OuAxesViewI18n.PROVIDER_NAME, true);
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_REMOVE, "Remove");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_REMOVE, "#XTOL: Tooltip on a button to remove an element from the list");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_ADD_MEASURE_INFO, "Add at least one measure.");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_ADD_MEASURE_INFO, "#XFLD: Text on a placeholder list item when currently no measure is selected");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_ADD_ACCOUNT_INFO, "Add at least one account.");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_ADD_ACCOUNT_INFO, "#XFLD: Text on a placeholder list item when currently no account is selected");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_FILTER_DIALOG_TITLE, "Set Filter for {0}");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_FILTER_DIALOG_TITLE, "#XTIT: the title of a dialog to create a filter on a dimension (placeholder is the dimension name)");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_CHART_LINE_YLEFT, "Y-Axis Left");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_CHART_LINE_YLEFT, "#XTIT: the title for the Line-Chart section where the measures on the Y-Left axis are shown.");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_CHART_LINE_YRIGHT, "Y-Axis Right");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_CHART_LINE_YRIGHT, "#XTIT: the title for the Line-Chart section where the measures on the Y-Right axis are shown.");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_CHART_COLUMN, "Column Axis");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_CHART_COLUMN, "#XTIT: the title for the columns and line chart section where the measures on the Column axis are shown.");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_CHART_LINE, "Line Axis");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_CHART_LINE, "#XTIT: the title for the columns and line chart section where the measures on the Line axis are shown.");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_CHART_DIMENSIONS, "Dimensions");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_CHART_DIMENSIONS, "#XTIT: the title for the Chart section where the Dimensions are shown.");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_CHART_COLOR, "Color");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_CHART_COLOR, "#XTIT: the title for the Chart section where the Dimensions chosen for Color are shown.");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_CHART_ORIENTATION, "Chart Orientation");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_CHART_ORIENTATION, "#XTIT: the title for the chart orientation.");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_CHART_ORIENTATION_HORIZONTAL, "Horizontal");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_CHART_ORIENTATION_HORIZONTAL, "#XSEL: the chart orientation option Horizontal.");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_CHART_ORIENTATION_VERTICAL, "Vertical");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_CHART_ORIENTATION_VERTICAL, "#XSEL: the chart orientation option Vertical.");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_CHART_AXIS_X, "X-Axis");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_CHART_AXIS_X, "#XTIT: Axis indicator for X-axis.");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_CHART_AXIS_Y, "Y-Axis");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_CHART_AXIS_Y, "#XTIT: Axis indicator for Y-axis.");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_GRID_OPTION, "Table");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_GRID_OPTION, "#XSEL: a dropdown entry to switch to a table visualization");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_BARCOLUMN_OPTION, "Bar/Column");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_BARCOLUMN_OPTION, "#XSEL: a dropdown entry to switch to a bar-column chart visualization");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_BAR_OPTION, "Bar");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_BAR_OPTION, "#XSEL: a dropdown entry to switch to a bar chart visualization");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_COLUMN_OPTION, "Column");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_COLUMN_OPTION, "#XSEL: a dropdown entry to switch to a column chart visualization");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_STACKED_BAR_OPTION, "Stacked Bar");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_STACKED_BAR_OPTION, "#XSEL: a dropdown entry to switch to a stacked bar chart visualization");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_STACKED_COLUMN_OPTION, "Stacked Column");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_STACKED_COLUMN_OPTION, "#XSEL: a dropdown entry to switch to a stacked column chart visualization");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_LINE_OPTION, "Line");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_LINE_OPTION, "#XSEL: a dropdown entry to switch to a line chart visualization");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_PIE_OPTION, "Pie");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_PIE_OPTION, "#XSEL: a dropdown entry to switch to a pie chart visualization");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_DONUT_OPTION, "Donut");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_DONUT_OPTION, "#XSEL: a dropdown entry to switch to a donut chart visualization");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_STACKED_AREA_OPTION, "Stacked Area");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_STACKED_AREA_OPTION, "#XSEL: a dropdown entry to switch to a stacked area chart visualization");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_COLUMN_LINE_OPTION, "Combination Column & Line");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_COLUMN_LINE_OPTION, "#XSEL: a dropdown entry to switch to a combination columns and line chart visualization");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_STACKED_COLUMN_LINE_OPTION, "Combination Stacked Column & Line");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_STACKED_COLUMN_LINE_OPTION, "#XSEL: a dropdown entry to switch to a stacked combination columns and line chart visualization");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_METRIC_OPTION, "Numeric Point");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_METRIC_OPTION, "#XSEL: a dropdown entry to switch to a numeric point chart visualization");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_WATERFALL_OPTION, "Waterfall");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_WATERFALL_OPTION, "#XSEL: a dropdown entry to switch to a waterfall chart visualization");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_DISPLAY_TYPE, "Display Type:");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_DISPLAY_TYPE, "#XTIT: a label for the Visualization switch dropdown in the Builder Panel.");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_SHOW_AS_100_PERCENT, "Show Chart as 100%");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_SHOW_AS_100_PERCENT, "#XCKL: Checkbox label for Stacked ChartTypes to show values as Percentages.");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_OVERLAP_Y_AXIS, "Y-Axes Overlap");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_OVERLAP_Y_AXIS, "#XCKL: Checkbox label for columns-line charts to overlap the Y-Axis.");
	qbProvider.addText(oFF.OuAxesViewI18n.BUILDER_TOAST_MEMBERS_REMOVED, "Too many selections for {0} chart: entities {1} were removed.");
	qbProvider.addComment(oFF.OuAxesViewI18n.BUILDER_TOAST_MEMBERS_REMOVED, "#XTIT: Message when a user has > 1 Measure selected and moves to Pie/Donut chart.");
	qbProvider.addTextWithComment(oFF.OuAxesViewI18n.BUILDER_CHART_VALUE_SELECTION, "Sector Size", "#XTIT: Value Selection label for Pie/Donut chart.");
	qbProvider.addTextWithComment(oFF.OuAxesViewI18n.BUILDER_ADD_DIMENSION_OPTIONAL, "Add a Dimension.", "#XFLD: Text on a placeholder list item when currently no dimension is selected");
	qbProvider.addTextWithComment(oFF.OuAxesViewI18n.BUILDER_ADD_MEASURE_OPTIONAL, "Add a Measure.", "#XFLD: Text on a placeholder list item when currently no measure is selected. This is just an info message where a Measure is not mandatory.");
	qbProvider.addTextWithComment(oFF.OuAxesViewI18n.BUILDER_ADD_ACCOUNT_OPTIONAL, "Add an Account.", "#XFLD: Text on a placeholder list item when currently no account is selected. This is just an info message where an Account is not mandatory.");
	return qbProvider;
};

oFF.OuFormulaValidationI18n = function() {};
oFF.OuFormulaValidationI18n.prototype = new oFF.DfXLocalizationProvider();
oFF.OuFormulaValidationI18n.prototype._ff_c = "OuFormulaValidationI18n";

oFF.OuFormulaValidationI18n.NAV_CALCULATION_INVALID_DEPENDENCY_INFO = "FF_GDS_QB_NAV_CALCULATION_INVALID_DEPENDENCY_INFO";
oFF.OuFormulaValidationI18n.NAV_CALCULATION_INVALID_INFO = "FF_GDS_QB_NAV_CALCULATION_INVALID_INFO";
oFF.OuFormulaValidationI18n.NAV_CALCULATION_MISSING_DIMENSIONS_INFO = "FF_GDS_QB_NAV_CALCULATION_MISSING_DIMENSIONS_INFO";
oFF.OuFormulaValidationI18n.NAV_CALCULATION_PREFERRED_HIERARCHY_MISMATCH_ACCOUNT = "FF_GDS_QB_NAV_CALCULATION_PREFERRED_HIERARCHY_MISMATCH_ACCOUNT";
oFF.OuFormulaValidationI18n.NAV_CALCULATION_PREFERRED_HIERARCHY_MISMATCH_MEASURE = "FF_GDS_QB_NAV_CALCULATION_PREFERRED_HIERARCHY_MISMATCH_MEASURE";
oFF.OuFormulaValidationI18n.PROVIDER_NAME = "FormulaValidation";
oFF.OuFormulaValidationI18n.staticSetup = function()
{
	let provider = new oFF.OuFormulaValidationI18n();
	provider.setupProvider(oFF.OuFormulaValidationI18n.PROVIDER_NAME, true);
	provider.addTextWithComment(oFF.OuFormulaValidationI18n.NAV_CALCULATION_INVALID_INFO, "Calculation \"{0}\" is not valid.", "#XTOL: a tooltip indicating that the calculation has some problems");
	provider.addTextWithComment(oFF.OuFormulaValidationI18n.NAV_CALCULATION_INVALID_DEPENDENCY_INFO, "Calculation \"{0}\" is not valid because it depends on missing calculations:", "#XTOL: a tooltip indicating that the calculation has problems because it depends on other calculations that were deleted, which names are listed after the colon");
	provider.addTextWithComment(oFF.OuFormulaValidationI18n.NAV_CALCULATION_MISSING_DIMENSIONS_INFO, "Calculation \"{0}\" requires the following dimensions to be selected in the table:", "#XTOL: A tooltip indicating that the calculation {0} needs certain dimensions on rows or columns to work, which names are listed after the colon");
	provider.addTextWithComment(oFF.OuFormulaValidationI18n.NAV_CALCULATION_PREFERRED_HIERARCHY_MISMATCH_ACCOUNT, "This calculation is invalid because the account that it depends on is not available in the selected account hierarchy.", "#XTOL: A tooltip indicating that the calculation depends on an account from a different hierarchy than the active one");
	provider.addTextWithComment(oFF.OuFormulaValidationI18n.NAV_CALCULATION_PREFERRED_HIERARCHY_MISMATCH_MEASURE, "This calculation is invalid because the measure that it depends on is not available in the selected measure hierarchy.", "#XTOL: A tooltip indicating that the calculation depends on a measure from a different hierarchy than the active one");
	return provider;
};

oFF.OuInventoryViewI18n = function() {};
oFF.OuInventoryViewI18n.prototype = new oFF.DfXLocalizationProvider();
oFF.OuInventoryViewI18n.prototype._ff_c = "OuInventoryViewI18n";

oFF.OuInventoryViewI18n.NAV_CALCULATION_DELETED_FILTER_DELETED_ACCOUNT = "FF_GDS_QB_NAV_CALCULATION_DELETED_FILTER_DELETED_ACCOUNT";
oFF.OuInventoryViewI18n.NAV_CALCULATION_DELETED_FILTER_DELETED_MEASURE = "FF_GDS_QB_NAV_CALCULATION_DELETED_FILTER_DELETED_MEASURE";
oFF.OuInventoryViewI18n.NAV_CALCULATION_DELETION_INFO = "FF_GDS_QB_NAV_CALCULATION_DELETION_INFO";
oFF.OuInventoryViewI18n.NAV_CALCULATION_INVALID_ANNOUNCE_UPDATE = "FF_GDS_QB_NAV_CALCULATION_INVALID_ANNOUNCE_UPDATE";
oFF.OuInventoryViewI18n.NAV_CREATE_CALCULATION = "FF_GDS_QB_NAV_CREATE_CALCULATION";
oFF.OuInventoryViewI18n.NAV_DELETE_CALCULATION = "FF_GDS_QB_NAV_DELETE_CALCULATION";
oFF.OuInventoryViewI18n.NAV_DIMENSIONS = "FF_GDS_QB_NAV_DIMENSIONS";
oFF.OuInventoryViewI18n.NAV_DIM_MENU_GROUPS_COLLAPSED = "FF_GDS_QB_NAV_DIM_MENU_GROUPS_COLLAPSED";
oFF.OuInventoryViewI18n.NAV_DIM_MENU_GROUPS_EXPANDED = "FF_GDS_QB_NAV_DIM_MENU_GROUPS_EXPANDED";
oFF.OuInventoryViewI18n.NAV_DIM_MENU_GROUPS_FLAT = "FF_GDS_QB_NAV_DIM_MENU_GROUPS_FLAT";
oFF.OuInventoryViewI18n.NAV_EDIT_CALCULATION = "FF_GDS_QB_NAV_EDIT_CALCULATION";
oFF.OuInventoryViewI18n.NAV_FILTER_DIALOG_TITLE = "FF_GDS_QB_NAV_FILTER_DIALOG_TITLE";
oFF.OuInventoryViewI18n.NAV_HIDE_PANEL = "FF_GDS_QB_NAV_HIDE_PANEL";
oFF.OuInventoryViewI18n.NAV_MENU_SORT = "FF_GDS_QB_NAV_MENU_SORT";
oFF.OuInventoryViewI18n.NAV_MENU_SORT_ASCENDING = "FF_GDS_QB_NAV_MENU_SORT_ASCENDING";
oFF.OuInventoryViewI18n.NAV_MENU_SORT_DEFAULT = "FF_GDS_QB_NAV_MENU_SORT_DEFAULT";
oFF.OuInventoryViewI18n.NAV_MENU_SORT_DESCENDING = "FF_GDS_QB_NAV_MENU_SORT_DESCENDING";
oFF.OuInventoryViewI18n.NAV_SELECT_ALL = "FF_GDS_QB_NAV_SELECT_ALL";
oFF.OuInventoryViewI18n.NAV_THRESHOLD_INVALID_INFO_INVALID_CALC = "FF_GDS_QB_NAV_THRESHOLD_INVALID_INFO_INVALID_CALC";
oFF.OuInventoryViewI18n.NAV_THRESHOLD_INVALID_INFO_MISSING_CALC = "FF_GDS_QB_NAV_THRESHOLD_INVALID_INFO_MISSING_CALC";
oFF.OuInventoryViewI18n.PROVIDER_NAME = "InventoryView";
oFF.OuInventoryViewI18n.staticSetup = function()
{
	let provider = new oFF.OuInventoryViewI18n();
	provider.setupProvider(oFF.OuInventoryViewI18n.PROVIDER_NAME, true);
	provider.addText(oFF.OuInventoryViewI18n.NAV_DIMENSIONS, "Dimensions");
	provider.addComment(oFF.OuInventoryViewI18n.NAV_DIMENSIONS, "#XTIT: The section that contains generic (no special) dimensions");
	provider.addText(oFF.OuInventoryViewI18n.NAV_SELECT_ALL, "Select All");
	provider.addComment(oFF.OuInventoryViewI18n.NAV_SELECT_ALL, "#XCKL: A checkbox to select all other checkboxes underneath");
	provider.addText(oFF.OuInventoryViewI18n.NAV_HIDE_PANEL, "Hide available objects");
	provider.addComment(oFF.OuInventoryViewI18n.NAV_HIDE_PANEL, "#XMIT: Hide available objects");
	provider.addText(oFF.OuInventoryViewI18n.NAV_FILTER_DIALOG_TITLE, "Set Filter for {0}");
	provider.addComment(oFF.OuInventoryViewI18n.NAV_FILTER_DIALOG_TITLE, "#XTIT: the title of a dialog to create a filter on a dimension (placeholder is the dimension name)");
	provider.addText(oFF.OuInventoryViewI18n.NAV_CREATE_CALCULATION, "Add Calculation");
	provider.addComment(oFF.OuInventoryViewI18n.NAV_CREATE_CALCULATION, "#XLNK: a link that will open a formula dialog to let the user create a calculation");
	provider.addTextWithComment(oFF.OuInventoryViewI18n.NAV_DIM_MENU_GROUPS_FLAT, "Show Groups", "#XMIT: a menu item that makes dimension groups be shown");
	provider.addTextWithComment(oFF.OuInventoryViewI18n.NAV_DIM_MENU_GROUPS_COLLAPSED, "Collapse All Groups", "#XMIT: a menu item that collapses all dimension groups");
	provider.addTextWithComment(oFF.OuInventoryViewI18n.NAV_DIM_MENU_GROUPS_EXPANDED, "Expand All Groups", "#XMIT: a menu item that expands all dimension groups");
	provider.addTextWithComment(oFF.OuInventoryViewI18n.NAV_EDIT_CALCULATION, "Edit Calculation", "#XTOL: a tooltip of an edit button for calculations");
	provider.addTextWithComment(oFF.OuInventoryViewI18n.NAV_DELETE_CALCULATION, "Delete Calculation", "#XTOL: a tooltip of an delete button for calculations");
	provider.addTextWithComment(oFF.OuInventoryViewI18n.NAV_CALCULATION_DELETION_INFO, "Calculated Measure \"{0}\" has been deleted.", "#XMSG: a toast message explaining that a calculation with the name {0} was deleted");
	provider.addTextWithComment(oFF.OuInventoryViewI18n.NAV_CALCULATION_INVALID_ANNOUNCE_UPDATE, "Calculation \"{0}\" is not valid", "#XMSG: Hidden message for screen reader to announce the calculation became invalid.");
	provider.addTextWithComment(oFF.OuInventoryViewI18n.NAV_THRESHOLD_INVALID_INFO_MISSING_CALC, "Threshold \"{0}\" is not valid because it depends on missing Calculation \"{1}\"", "#XMSG: a toast message explaining that the Threshold with the name {0} was using a now deleted Calculation with the name {1}");
	provider.addTextWithComment(oFF.OuInventoryViewI18n.NAV_THRESHOLD_INVALID_INFO_INVALID_CALC, "Threshold \"{0}\" is not valid because it depends on invalid Calculation \"{1}\"", "#XMSG: a toast message explaining that the Threshold with the name {0} was using a now invalid Calculation with the name {1}");
	provider.addTextWithComment(oFF.OuInventoryViewI18n.NAV_MENU_SORT, "Sort", "#XMIT: a menu entry with different options to change the sort order of ui elements");
	provider.addTextWithComment(oFF.OuInventoryViewI18n.NAV_MENU_SORT_ASCENDING, "Ascending", "#XMIT: a menu item to sort ui elements in ascending order");
	provider.addTextWithComment(oFF.OuInventoryViewI18n.NAV_MENU_SORT_DESCENDING, "Descending", "#XMIT: a menu item to sort ui elements in descending order");
	provider.addTextWithComment(oFF.OuInventoryViewI18n.NAV_MENU_SORT_DEFAULT, "Default Order", "#XMIT: a menu item to sort ui elements in default order");
	provider.addTextWithComment(oFF.OuInventoryViewI18n.NAV_CALCULATION_DELETED_FILTER_DELETED_MEASURE, "Filter on \"{0}\" has been deleted because the calculated measure \"{1}\" has been deleted.", "#XMSG: Filter deleted in response to a deleted calculated measure.");
	provider.addTextWithComment(oFF.OuInventoryViewI18n.NAV_CALCULATION_DELETED_FILTER_DELETED_ACCOUNT, "Filter on \"{0}\" has been deleted because the calculated account \"{1}\" has been deleted.", "#XMSG: Filter deleted in response to a deleted calculated account.");
	return provider;
};

oFF.OuDisplayFormattingI18n = function() {};
oFF.OuDisplayFormattingI18n.prototype = new oFF.DfXLocalizationProvider();
oFF.OuDisplayFormattingI18n.prototype._ff_c = "OuDisplayFormattingI18n";

oFF.OuDisplayFormattingI18n.PROVIDER_NAME = "DisplayFormatting";
oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT = "FF_GDS_ALIGNMENT";
oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_BOTTOM = "FF_GDS_STYLE_ALIGNMENT_BOTTOM";
oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_CENTER = "FF_GDS_STYLE_ALIGNMENT_CENTER";
oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_LEFT = "FF_GDS_STYLE_ALIGNMENT_LEFT";
oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_MIDDLE = "FF_GDS_STYLE_ALIGNMENT_MIDDLE";
oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_RIGHT = "FF_GDS_STYLE_ALIGNMENT_RIGHT";
oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_TOP = "FF_GDS_STYLE_ALIGNMENT_TOP";
oFF.OuDisplayFormattingI18n.STYLE_AVOID_OVERLAP = "FF_GDS_STYLE_AVOID_OVERLAP";
oFF.OuDisplayFormattingI18n.STYLE_AXIS_LABEL = "FF_GDS_STYLE_FORMAT_TEXT_X_AXIS_LABEL";
oFF.OuDisplayFormattingI18n.STYLE_AXIS_TITLE = "FF_GDS_STYLE_FORMAT_TEXT_X_AXIS_TITLE";
oFF.OuDisplayFormattingI18n.STYLE_BOLD = "FF_GDS_STYLE_FACE_BOLD";
oFF.OuDisplayFormattingI18n.STYLE_BOLD_ITALIC = "FF_GDS_STYLE_FACE_BOLD_ITALIC";
oFF.OuDisplayFormattingI18n.STYLE_DATA_LABEL = "FF_GDS_STYLE_FORMAT_TEXT_DATA_LABEL";
oFF.OuDisplayFormattingI18n.STYLE_DEFAULT = "FF_GDS_STYLE_DISPLAY_DEFAULT";
oFF.OuDisplayFormattingI18n.STYLE_DETAILS = "FF_GDS_STYLE_FORMAT_TEXT_DETAILS";
oFF.OuDisplayFormattingI18n.STYLE_DIRECTION_HORIZONTAL = "FF_GDS_STYLE_DIRECTION_HORIZONTAL";
oFF.OuDisplayFormattingI18n.STYLE_DIRECTION_VERTICAL = "FF_GDS_STYLE_DIRECTION_VERTICAL";
oFF.OuDisplayFormattingI18n.STYLE_DISPLAY_FORMATTING_RESET = "FF_GDS_STYLE_DISPLAY_FORMATTING_RESET";
oFF.OuDisplayFormattingI18n.STYLE_DISPLAY_FORMATTING_TITLE = "FF_GDS_STYLE_DISPLAY_FORMATTING_TITLE";
oFF.OuDisplayFormattingI18n.STYLE_DS_TITLE = "FF_GDS_STYLE_FORMAT_TEXT_DS_TITLE";
oFF.OuDisplayFormattingI18n.STYLE_FORMATTING_COLOR = "FF_GDS_STYLE_FORMATTING_COLOR";
oFF.OuDisplayFormattingI18n.STYLE_FORMATTING_FONT = "FF_GDS_STYLE_FORMATTING_FONT";
oFF.OuDisplayFormattingI18n.STYLE_FORMATTING_SIZE = "FF_GDS_STYLE_FORMATTING_SIZE";
oFF.OuDisplayFormattingI18n.STYLE_FORMATTING_STYLE = "FF_GDS_STYLE_FORMATTING_STYLE";
oFF.OuDisplayFormattingI18n.STYLE_FORMATTING_TEXT_SELECTION = "FF_GDS_STYLE_FORMATTING_TEXT_SELECTION";
oFF.OuDisplayFormattingI18n.STYLE_ITALIC = "FF_GDS_STYLE_FACE_ITALIC";
oFF.OuDisplayFormattingI18n.STYLE_LEGEND = "FF_GDS_STYLE_FORMAT_TEXT_LEGEND";
oFF.OuDisplayFormattingI18n.STYLE_PLACEMENT = "FF_GDS_STYLE_PLACEMENT";
oFF.OuDisplayFormattingI18n.STYLE_PLACEMENT_ABOVE_CHART = "FF_GDS_STYLE_PLACEMENT_ABOVE_CHART";
oFF.OuDisplayFormattingI18n.STYLE_PLACEMENT_BELOW_CHART = "FF_GDS_STYLE_PLACEMENT_BELOW_CHART";
oFF.OuDisplayFormattingI18n.STYLE_PLACEMENT_BESIDE_CHART_RIGHT = "FF_GDS_STYLE_PLACEMENT_BESIDE_CHART_RIGHT";
oFF.OuDisplayFormattingI18n.STYLE_REGULAR = "FF_GDS_STYLE_FACE_REGULAR";
oFF.OuDisplayFormattingI18n.STYLE_SHOW_AXIS_TITLE = "FF_GDS_STYLE_SHOW_AXIS_TITLE";
oFF.OuDisplayFormattingI18n.STYLE_SHOW_DATA_LABEL = "FF_GDS_STYLE_SHOW_DATA_LABEL";
oFF.OuDisplayFormattingI18n.STYLE_SHOW_LEGEND = "FF_GDS_STYLE_SHOW_LEGEND";
oFF.OuDisplayFormattingI18n.getLocalization = function()
{
	return oFF.XLocalizationCenter.getCenter().getLocalizationProviderByName(oFF.OuDisplayFormattingI18n.PROVIDER_NAME);
};
oFF.OuDisplayFormattingI18n.staticSetup = function()
{
	let qbProvider = new oFF.OuDisplayFormattingI18n();
	qbProvider.setupProvider(oFF.OuDisplayFormattingI18n.PROVIDER_NAME, true);
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_DISPLAY_FORMATTING_TITLE, "Display Properties");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_DISPLAY_FORMATTING_TITLE, "#XTIT: The heading of the section for the display properties");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_DISPLAY_FORMATTING_RESET, "Reset all to default");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_DISPLAY_FORMATTING_RESET, "#XBUT: A button to reset all settings to the default");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_FORMATTING_TEXT_SELECTION, "Text Selection");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_FORMATTING_TEXT_SELECTION, "#XFLD: A dropdown to select what text type should be formatted");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_FORMATTING_FONT, "Font");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_FORMATTING_FONT, "#XFLD: A dropdown to select the font family");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_FORMATTING_SIZE, "Size");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_FORMATTING_SIZE, "#XFLD: A dropdown to select the font size");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_FORMATTING_COLOR, "Color");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_FORMATTING_COLOR, "#XFLD: A dropdown to select the font color");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_FORMATTING_STYLE, "Style");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_FORMATTING_STYLE, "#XFLD: A dropdown to select the font style");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_AVOID_OVERLAP, "Avoid Overlap");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_AVOID_OVERLAP, "#XFLD: A switch to specify that the labels should not overlap");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_PLACEMENT, "Placement");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_PLACEMENT, "#XFLD: A dropdown to specify legend placement");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT, "Alignment");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT, "#XFLD: A split button to specify the text alignment");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_SHOW_LEGEND, "Show Legend");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_SHOW_LEGEND, "#XFLD: A switch to specify whether the legend is supposed to be shown");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_SHOW_DATA_LABEL, "Show Data Label");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_SHOW_DATA_LABEL, "#XFLD: A switch to specify whether the data label is supposed to be shown");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_SHOW_AXIS_TITLE, "Show Axis Title");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_SHOW_AXIS_TITLE, "#XFLD: A switch to specify whether the axis title is supposed to be shown");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_DS_TITLE, "Title");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_DS_TITLE, "#XSEL: A dropdown entry for selecting the 'title' to be formatted");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_DETAILS, "Details");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_DETAILS, "#XSEL: A dropdown entry for selecting the 'details' to be formatted");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_AXIS_LABEL, "Axis Label");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_AXIS_LABEL, "#XSEL: A dropdown entry for selecting the 'axis label' to be formatted");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_AXIS_TITLE, "Axis Title");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_AXIS_TITLE, "#XSEL: A dropdown entry for selecting the 'axis title' to be formatted");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_DATA_LABEL, "Data Label");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_DATA_LABEL, "#XSEL: A dropdown entry for selecting the 'data label' to be formatted");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_LEGEND, "Legend");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_LEGEND, "#XSEL: A dropdown entry for selecting the 'legend' to be formatted");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_DEFAULT, "Default");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_DEFAULT, "#XSEL: A dropdown entry to represent the default configuration");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_REGULAR, "Regular");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_REGULAR, "#XSEL: A dropdown entry to represent the Regular Font Face");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_BOLD, "Bold");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_BOLD, "#XSEL: A dropdown entry to represent the Bold Font Face");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_ITALIC, "Italic");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_ITALIC, "#XSEL: A dropdown entry to represent the Italic Font Face");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_BOLD_ITALIC, "Bold Italic");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_BOLD_ITALIC, "#XSEL: A dropdown entry to represent the Bold-Italic Font Face");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_PLACEMENT_BESIDE_CHART_RIGHT, "Beside Chart (Right)");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_PLACEMENT_BESIDE_CHART_RIGHT, "#XSEL: A dropdown entry to specify that the legend should be displayed right to the chart");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_PLACEMENT_ABOVE_CHART, "Above Chart");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_PLACEMENT_ABOVE_CHART, "#XSEL: A dropdown entry to specify that the legend should be displayed above the chart");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_PLACEMENT_BELOW_CHART, "Below Chart");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_PLACEMENT_BELOW_CHART, "#XSEL: A dropdown entry to specify that the legend should be displayed below the chart");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_LEFT, "Left");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_LEFT, "#XTOL: A tooltip for a split button to specify left text alignment");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_CENTER, "Center");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_CENTER, "#XTOL: A tooltip for a split button to specify centered text alignment");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_RIGHT, "Right");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_RIGHT, "#XTOL: A tooltip for a split button to specify right text alignment");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_TOP, "Top");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_TOP, "#XTOL: A tooltip for a split button to specify top text alignment");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_MIDDLE, "Middle");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_MIDDLE, "#XTOL: A tooltip for a split button to specify middle text alignment");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_BOTTOM, "Bottom");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_BOTTOM, "#XTOL: A tooltip for a split button to specify bottom text alignment");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_DIRECTION_HORIZONTAL, "Horizontal");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_DIRECTION_HORIZONTAL, "#XTOL: A tooltip for a split button to specify horizontal layout direction");
	qbProvider.addText(oFF.OuDisplayFormattingI18n.STYLE_DIRECTION_VERTICAL, "Vertical");
	qbProvider.addComment(oFF.OuDisplayFormattingI18n.STYLE_DIRECTION_VERTICAL, "#XTOL: A tooltip for a split button to specify vertical layout direction");
	return qbProvider;
};

oFF.AuKpiI18n = function() {};
oFF.AuKpiI18n.prototype = new oFF.DfXLocalizationProvider();
oFF.AuKpiI18n.prototype._ff_c = "AuKpiI18n";

oFF.AuKpiI18n.KPI_DEVIATION = "FF_GDS_KPI_DEVIATION";
oFF.AuKpiI18n.KPI_TARGET = "FF_GDS_KPI_TARGET";
oFF.AuKpiI18n.PROVIDER_NAME = "AuKpi";
oFF.AuKpiI18n.staticSetup = function()
{
	let kpiI18n = new oFF.AuKpiI18n();
	kpiI18n.setupProvider(oFF.AuKpiI18n.PROVIDER_NAME, true);
	kpiI18n.addText(oFF.AuKpiI18n.KPI_DEVIATION, "Deviation");
	kpiI18n.addComment(oFF.AuKpiI18n.KPI_DEVIATION, "#XTIT: title for the deviation figure");
	kpiI18n.addText(oFF.AuKpiI18n.KPI_TARGET, "Target");
	kpiI18n.addComment(oFF.AuKpiI18n.KPI_TARGET, "#XTIT: title for the target figure");
	return kpiI18n;
};

oFF.AuKpiView = function() {};
oFF.AuKpiView.prototype = new oFF.DfUiView();
oFF.AuKpiView.prototype._ff_c = "AuKpiView";

oFF.AuKpiView.create = function(genesis)
{
	return new oFF.AuKpiView().setupInternal(genesis);
};
oFF.AuKpiView.prototype.m_card = null;
oFF.AuKpiView.prototype.m_dataFetchListenerId = null;
oFF.AuKpiView.prototype.m_dataProvider = null;
oFF.AuKpiView.prototype.m_kpiDefinition = null;
oFF.AuKpiView.prototype.m_queryManager = null;
oFF.AuKpiView.prototype.m_renderer = null;
oFF.AuKpiView.prototype.m_rootLayout = null;
oFF.AuKpiView.prototype.beforeClose = function() {};
oFF.AuKpiView.prototype.destroyView = function()
{
	this.m_card = oFF.XObjectExt.release(this.m_card);
	this.m_rootLayout = oFF.XObjectExt.release(this.m_rootLayout);
	if (oFF.XObjectExt.isValidObject(this.m_dataProvider))
	{
		this.m_dataProvider.getEventing().getListenerForResultDataFetch().removeConsumerByUuid(this.m_dataFetchListenerId);
	}
	this.m_queryManager = null;
	this.m_dataProvider = null;
	this.m_kpiDefinition = null;
	this.m_renderer = oFF.XObjectExt.release(this.m_renderer);
};
oFF.AuKpiView.prototype.didBecomeHidden = function() {};
oFF.AuKpiView.prototype.didBecomeVisible = function() {};
oFF.AuKpiView.prototype.getDataProvider = function()
{
	return this.m_dataProvider;
};
oFF.AuKpiView.prototype.getKpiDefinition = function()
{
	return this.m_kpiDefinition;
};
oFF.AuKpiView.prototype.getQueryManager = function()
{
	return this.m_queryManager;
};
oFF.AuKpiView.prototype.getViewControl = function(genesis)
{
	this.m_rootLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	this.m_card = this.m_rootLayout.addNewItemOfType(oFF.UiType.INTEGRATION_CARD);
	return this.m_rootLayout;
};
oFF.AuKpiView.prototype.layoutView = function(viewControl)
{
	viewControl.useMaxSpace();
	viewControl.setFlex("1 1 auto");
	viewControl.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	this.m_card.useMaxSpace();
	this.setBusy(true);
};
oFF.AuKpiView.prototype.onResultEvent = function(evt)
{
	if (!oFF.XObjectExt.isValidObject(this.m_kpiDefinition))
	{
		return;
	}
	if (evt.getStep() === oFF.OlapDataProviderResultDataFetchStep.FETCH_STARTED)
	{
		this.setBusy(true);
	}
	else if (evt.getStep() === oFF.OlapDataProviderResultDataFetchStep.VISUALIZATION_FILLED && oFF.XObjectExt.isValidObject(this.m_kpiDefinition) && evt.getFilledVisualizationNames().contains(this.m_kpiDefinition.getName()))
	{
		this.setBusy(false);
		this.refreshKpi(this.m_kpiDefinition.getAvailableVisualizationContainer());
	}
	else if (evt.getStep() === oFF.OlapDataProviderResultDataFetchStep.ALL_DONE)
	{
		this.setBusy(false);
	}
};
oFF.AuKpiView.prototype.onVisualizationObjectFilled = function(extResult, visualisationContainer, customIdentifier)
{
	this.refreshKpi(visualisationContainer);
};
oFF.AuKpiView.prototype.refreshKpi = function(visualisationContainer)
{
	if (oFF.XObjectExt.isValidObject(visualisationContainer) && !visualisationContainer.isSyncCanceled())
	{
		let visualizationData = visualisationContainer.getVisualizationData();
		if (oFF.XObjectExt.isValidObject(this.m_card) && oFF.XObjectExt.isValidObject(visualizationData))
		{
			let resultStructure = this.m_renderer.renderData(visualizationData);
			this.m_card.setModelJson(resultStructure);
			this.setBusy(false);
		}
	}
};
oFF.AuKpiView.prototype.setBusy = function(busy)
{
	this.m_rootLayout.setBusy(busy);
};
oFF.AuKpiView.prototype.setDataProvider = function(dataProvider)
{
	if (oFF.XObjectExt.isValidObject(this.m_dataProvider))
	{
		this.m_dataProvider.getEventing().getListenerForResultDataFetch().removeConsumerByUuid(this.m_dataFetchListenerId);
	}
	this.m_dataProvider = dataProvider;
	this.setQueryManager(oFF.notNull(dataProvider) ? dataProvider.getQueryManager() : null);
	if (oFF.XObjectExt.isValidObject(this.m_dataProvider))
	{
		this.m_dataFetchListenerId = this.m_dataProvider.getEventing().getListenerForResultDataFetch().addConsumer(this.onResultEvent.bind(this));
	}
};
oFF.AuKpiView.prototype.setKpiDefinition = function(kpiDefinition)
{
	this.m_kpiDefinition = kpiDefinition;
};
oFF.AuKpiView.prototype.setQueryManager = function(queryManager)
{
	this.m_queryManager = queryManager;
};
oFF.AuKpiView.prototype.setupInternal = function(genesis)
{
	this.initView(genesis);
	this.m_renderer = oFF.KpiRendererFactory.createContainerRenderer(oFF.ProtocolBindingType.SAP_KPI_PROTOCOL);
	return this;
};
oFF.AuKpiView.prototype.setupView = function() {};
oFF.AuKpiView.prototype.updateKpi = function()
{
	if (oFF.XObjectExt.isValidObject(this.m_kpiDefinition))
	{
		this.refreshKpi(this.m_kpiDefinition.getAvailableVisualizationContainer());
	}
};

oFF.OuNumberFormattingI18n = function() {};
oFF.OuNumberFormattingI18n.prototype = new oFF.DfXLocalizationProvider();
oFF.OuNumberFormattingI18n.prototype._ff_c = "OuNumberFormattingI18n";

oFF.OuNumberFormattingI18n.PROVIDER_NAME = "NumberFormatting";
oFF.OuNumberFormattingI18n.STYLE_ACCOUNT_ALL = "FF_GDS_STYLE_ACCOUNT_ALL";
oFF.OuNumberFormattingI18n.STYLE_ACCOUNT_SELECTION = "FF_GDS_STYLE_ACCOUNT_SELECTION";
oFF.OuNumberFormattingI18n.STYLE_DECIMAL_PLACES = "FF_GDS_STYLE_DECIMAL_PLACES";
oFF.OuNumberFormattingI18n.STYLE_DEFAULT = "FF_GDS_STYLE_DEFAULT";
oFF.OuNumberFormattingI18n.STYLE_MEASURE_ALL = "FF_GDS_STYLE_MEASURE_ALL";
oFF.OuNumberFormattingI18n.STYLE_MEASURE_SELECTION = "FF_GDS_STYLE_MEASURE_SELECTION";
oFF.OuNumberFormattingI18n.STYLE_MIXED_UNITS_CURRENCY = "FF_GDS_STYLE_MIXED_UNITS_CURRENCY";
oFF.OuNumberFormattingI18n.STYLE_MIXED_UNITS_CURRENCY_LABEL = "FF_GDS_STYLE_MIXED_UNITS_CURRENCY_LABEL";
oFF.OuNumberFormattingI18n.STYLE_NUMBER_FORMAT_RESET = "FF_GDS_STYLE_NUMBER_FORMAT_RESET";
oFF.OuNumberFormattingI18n.STYLE_NUMBER_FORMAT_TITLE = "FF_GDS_STYLE_NUMBER_FORMAT_TITLE";
oFF.OuNumberFormattingI18n.STYLE_OTHER = "FF_GDS_STYLE_OTHER";
oFF.OuNumberFormattingI18n.STYLE_SCALE = "FF_GDS_STYLE_SCALE";
oFF.OuNumberFormattingI18n.STYLE_SCALE_FORMAT = "FF_GDS_STYLE_SCALE_FORMAT";
oFF.OuNumberFormattingI18n.STYLE_SCALE_FORMAT_LONG = "FF_GDS_STYLE_FORMAT_LONG";
oFF.OuNumberFormattingI18n.STYLE_SCALE_FORMAT_SHORT = "FF_GDS_STYLE_FORMAT_SHORT";
oFF.OuNumberFormattingI18n.STYLE_SCALE_LONG_BILLION = "FF_GDS_STYLE_SCALE_LONG_BILLION";
oFF.OuNumberFormattingI18n.STYLE_SCALE_LONG_MILLION = "FF_GDS_STYLE_SCALE_LONG_MILLION";
oFF.OuNumberFormattingI18n.STYLE_SCALE_LONG_THOUSAND = "FF_GDS_STYLE_SCALE_LONG_THOUSAND";
oFF.OuNumberFormattingI18n.STYLE_SCALE_UNFORMATTED = "FF_GDS_STYLE_SCALE_UNFORMATTED";
oFF.OuNumberFormattingI18n.STYLE_SIGN = "FF_GDS_STYLE_SIGN";
oFF.OuNumberFormattingI18n.getLocalization = function()
{
	return oFF.XLocalizationCenter.getCenter().getLocalizationProviderByName(oFF.OuNumberFormattingI18n.PROVIDER_NAME);
};
oFF.OuNumberFormattingI18n.staticSetup = function()
{
	let qbProvider = new oFF.OuNumberFormattingI18n();
	qbProvider.setupProvider(oFF.OuNumberFormattingI18n.PROVIDER_NAME, true);
	qbProvider.addText(oFF.OuNumberFormattingI18n.STYLE_NUMBER_FORMAT_TITLE, "Number Format");
	qbProvider.addComment(oFF.OuNumberFormattingI18n.STYLE_NUMBER_FORMAT_TITLE, "#XTIT: The heading of the section for number formatting");
	qbProvider.addText(oFF.OuNumberFormattingI18n.STYLE_NUMBER_FORMAT_RESET, "Reset all to default");
	qbProvider.addComment(oFF.OuNumberFormattingI18n.STYLE_NUMBER_FORMAT_RESET, "#XBUT: A button to reset all settings to the default");
	qbProvider.addText(oFF.OuNumberFormattingI18n.STYLE_MEASURE_SELECTION, "Measure Selection");
	qbProvider.addComment(oFF.OuNumberFormattingI18n.STYLE_MEASURE_SELECTION, "#XFLD: The description of a dropdown to select which measure to configure");
	qbProvider.addText(oFF.OuNumberFormattingI18n.STYLE_ACCOUNT_SELECTION, "Account Selection");
	qbProvider.addComment(oFF.OuNumberFormattingI18n.STYLE_ACCOUNT_SELECTION, "#XFLD: The description of a dropdown to select which account to configure");
	qbProvider.addText(oFF.OuNumberFormattingI18n.STYLE_MEASURE_ALL, "All Measures");
	qbProvider.addComment(oFF.OuNumberFormattingI18n.STYLE_MEASURE_ALL, "#XFLD: An entry in the list of measure to configure all measures at once");
	qbProvider.addText(oFF.OuNumberFormattingI18n.STYLE_ACCOUNT_ALL, "All Accounts");
	qbProvider.addComment(oFF.OuNumberFormattingI18n.STYLE_ACCOUNT_ALL, "#XFLD: An entry in the list of accounts to configure all accounts at once");
	qbProvider.addText(oFF.OuNumberFormattingI18n.STYLE_SCALE, "Scale");
	qbProvider.addComment(oFF.OuNumberFormattingI18n.STYLE_SCALE, "#XFLD: The description of a dropdown to set the scaling of numbers");
	qbProvider.addText(oFF.OuNumberFormattingI18n.STYLE_SCALE_UNFORMATTED, "Unformatted");
	qbProvider.addComment(oFF.OuNumberFormattingI18n.STYLE_SCALE_UNFORMATTED, "#XSEL: An entry in the list of scaling options to indicate that no format is being applied");
	qbProvider.addText(oFF.OuNumberFormattingI18n.STYLE_SCALE_LONG_THOUSAND, "Thousand");
	qbProvider.addComment(oFF.OuNumberFormattingI18n.STYLE_SCALE_LONG_THOUSAND, "#XSEL: Thousand");
	qbProvider.addText(oFF.OuNumberFormattingI18n.STYLE_SCALE_LONG_MILLION, "Million");
	qbProvider.addComment(oFF.OuNumberFormattingI18n.STYLE_SCALE_LONG_MILLION, "#XSEL: Million");
	qbProvider.addText(oFF.OuNumberFormattingI18n.STYLE_SCALE_LONG_BILLION, "Billion");
	qbProvider.addComment(oFF.OuNumberFormattingI18n.STYLE_SCALE_LONG_BILLION, "#XSEL: Billion");
	qbProvider.addText(oFF.OuNumberFormattingI18n.STYLE_SCALE_FORMAT, "Scale Format");
	qbProvider.addComment(oFF.OuNumberFormattingI18n.STYLE_SCALE_FORMAT, "#XFLD: The description of a dropdown to switch between short (k) and long (Thousand) scale representation");
	qbProvider.addText(oFF.OuNumberFormattingI18n.STYLE_SCALE_FORMAT_SHORT, "k, m, bn");
	qbProvider.addComment(oFF.OuNumberFormattingI18n.STYLE_SCALE_FORMAT_SHORT, "#XSEL: A dropdown entry to select short representation of scaling (e.g. k)");
	qbProvider.addText(oFF.OuNumberFormattingI18n.STYLE_SCALE_FORMAT_LONG, "Thousand, Million, Billion");
	qbProvider.addComment(oFF.OuNumberFormattingI18n.STYLE_SCALE_FORMAT_LONG, "#XSEL: A dropdown entry to select long representation of scaling (e.g. Thousand)");
	qbProvider.addText(oFF.OuNumberFormattingI18n.STYLE_DECIMAL_PLACES, "Decimal Places");
	qbProvider.addComment(oFF.OuNumberFormattingI18n.STYLE_DECIMAL_PLACES, "#XFLD: The description of a dropdown to set how many digits should be used for decimals");
	qbProvider.addText(oFF.OuNumberFormattingI18n.STYLE_SIGN, "Show Sign As");
	qbProvider.addComment(oFF.OuNumberFormattingI18n.STYLE_SIGN, "#XFLD: The description of a dropdown to configure how negative numbers should be represented");
	qbProvider.addText(oFF.OuNumberFormattingI18n.STYLE_DEFAULT, "Default");
	qbProvider.addComment(oFF.OuNumberFormattingI18n.STYLE_DEFAULT, "#XSEL: A dropdown entry to represent the default configuration");
	qbProvider.addText(oFF.OuNumberFormattingI18n.STYLE_OTHER, "Other");
	qbProvider.addComment(oFF.OuNumberFormattingI18n.STYLE_OTHER, "#XSEL: A fallback dropdown entry to represent an unknown setting");
	qbProvider.addText(oFF.OuNumberFormattingI18n.STYLE_MIXED_UNITS_CURRENCY_LABEL, "Mixed Units / Currencies:");
	qbProvider.addComment(oFF.OuNumberFormattingI18n.STYLE_MIXED_UNITS_CURRENCY_LABEL, "#XFLD: The description of a checkbox to enable the mixed units and currencies formatting");
	qbProvider.addText(oFF.OuNumberFormattingI18n.STYLE_MIXED_UNITS_CURRENCY, "Show Number Values");
	qbProvider.addComment(oFF.OuNumberFormattingI18n.STYLE_MIXED_UNITS_CURRENCY, "#XCKL: A checkbox to enable the mixed units and currencies formatting");
	return qbProvider;
};

oFF.OuCalcCommandPluginWithSharedSpace = function() {};
oFF.OuCalcCommandPluginWithSharedSpace.prototype = new oFF.HuDfCommandPlugin();
oFF.OuCalcCommandPluginWithSharedSpace.prototype._ff_c = "OuCalcCommandPluginWithSharedSpace";

oFF.OuCalcCommandPluginWithSharedSpace.prototype.getSharedDataSpace = function()
{
	return oFF.OuCalcSharedDataSpaceManager.create(this.getController().getProcess()).get();
};

oFF.OuCalcDetailsAreaView = function() {};
oFF.OuCalcDetailsAreaView.prototype = new oFF.DfUiContentView();
oFF.OuCalcDetailsAreaView.prototype._ff_c = "OuCalcDetailsAreaView";

oFF.OuCalcDetailsAreaView.create = function(validator, initialId, initialDescription, isEdit)
{
	let instance = new oFF.OuCalcDetailsAreaView();
	instance.m_i18n = oFF.XLocalizationCenter.getCenter().getLocalizationProviderByName(oFF.OuCalcDetailsAreaViewI18n.PROVIDER_NAME);
	instance.m_isEdit = isEdit;
	instance.m_validator = oFF.notNull(validator) ? validator : oFF.FeCalculationValidator.createEmpty();
	instance._setInitialData(initialId, initialDescription);
	instance.m_onIdChangedConsumers = oFF.XConsumerCollection.create();
	instance.m_onNameChangedConsumers = oFF.XConsumerCollection.create();
	return instance;
};
oFF.OuCalcDetailsAreaView.prototype.m_i18n = null;
oFF.OuCalcDetailsAreaView.prototype.m_idInput = null;
oFF.OuCalcDetailsAreaView.prototype.m_initDesc = null;
oFF.OuCalcDetailsAreaView.prototype.m_initId = null;
oFF.OuCalcDetailsAreaView.prototype.m_isEdit = false;
oFF.OuCalcDetailsAreaView.prototype.m_nameInput = null;
oFF.OuCalcDetailsAreaView.prototype.m_onIdChangedConsumers = null;
oFF.OuCalcDetailsAreaView.prototype.m_onNameChangedConsumers = null;
oFF.OuCalcDetailsAreaView.prototype.m_validator = null;
oFF.OuCalcDetailsAreaView.prototype._setInitialData = function(initialId, initialDescription)
{
	oFF.XObjectExt.assertStringNotNullAndNotEmptyExt(initialId, "Initial id cannot be null");
	oFF.XObjectExt.assertStringNotNullAndNotEmptyExt(initialDescription, "Initial description cannot be null");
	this.m_initId = initialId;
	this.m_validator.setId(initialId);
	this.m_initDesc = initialDescription;
};
oFF.OuCalcDetailsAreaView.prototype.addOnIdChangeConsumer = function(consumer)
{
	return this.m_onIdChangedConsumers.addConsumer(consumer);
};
oFF.OuCalcDetailsAreaView.prototype.addOnNameChangeConsumer = function(consumer)
{
	return this.m_onNameChangedConsumers.addConsumer(consumer);
};
oFF.OuCalcDetailsAreaView.prototype.buildViewUi = function(genesis)
{
	oFF.XObjectExt.assertNotNull(genesis);
	let mainLayout = genesis.newRoot(oFF.UiType.FLEX_LAYOUT);
	mainLayout.addCssClass("ffFormulaEditorDetailsAreaView");
	mainLayout.setDirection(oFF.UiFlexDirection.ROW);
	mainLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	mainLayout.setWrap(oFF.UiFlexWrap.NO_WRAP);
	this.createNameArea(mainLayout);
	this.createIDArea(mainLayout);
	this.validate();
	if (!this.m_isEdit)
	{
		this.m_idInput.registerOnLiveChange(oFF.UiLambdaLiveChangeListener.create((idEvent) => {
			this.m_nameInput.setPlaceholder(this.m_idInput.getValue());
			this.m_validator.setId(this.m_idInput.getValue());
			this.validate();
			this.m_onIdChangedConsumers.accept(this);
		}));
	}
	this.m_nameInput.registerOnLiveChange(oFF.UiLambdaLiveChangeListener.create((nameEvent) => {
		this.m_validator.setName(this.m_nameInput.getValue());
		this.validate();
		this.m_onNameChangedConsumers.accept(this);
	}));
};
oFF.OuCalcDetailsAreaView.prototype.clearErrors = function()
{
	this.clearInlineError(this.m_idInput);
	this.clearInlineError(this.m_nameInput);
};
oFF.OuCalcDetailsAreaView.prototype.clearInlineError = function(input)
{
	input.setValueState(oFF.UiValueState.NONE);
};
oFF.OuCalcDetailsAreaView.prototype.createIDArea = function(parent)
{
	oFF.XObjectExt.assertNotNull(parent);
	let layout = parent.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	layout.setDirection(oFF.UiFlexDirection.COLUMN);
	layout.addCssClass("ffFormulaEditor-DetailsAreaView-IDArea-Layout");
	let label = layout.addNewItemOfType(oFF.UiType.LABEL);
	let labelText = this.m_i18n.getText(oFF.OuCalcDetailsAreaViewI18n.FE_ID_AREA_LABEL);
	label.setText(labelText);
	label.setShowColon(true);
	this.m_idInput = layout.addNewItemOfType(oFF.UiType.INPUT);
	this.m_idInput.setValue(this.m_initId);
	this.m_idInput.addCssClass("ffFormulaEditor-DetailsAreaView-IDArea-Input");
	this.m_idInput.setRequired(true);
	this.m_idInput.setMaxLength(this.m_validator.getMaxLength());
	this.m_idInput.setEditable(!this.m_isEdit);
	label.setLabelFor(this.m_idInput);
};
oFF.OuCalcDetailsAreaView.prototype.createNameArea = function(parent)
{
	oFF.XObjectExt.assertNotNull(parent);
	let layout = parent.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	layout.setDirection(oFF.UiFlexDirection.COLUMN);
	layout.addCssClass("ffFormulaEditor-DetailsAreaView-NameArea-Layout");
	let label = layout.addNewItemOfType(oFF.UiType.LABEL);
	let labelText = this.m_i18n.getText(oFF.OuCalcDetailsAreaViewI18n.NAME_AREA_LABEL);
	label.setText(labelText);
	label.setShowColon(true);
	this.m_nameInput = layout.addNewItemOfType(oFF.UiType.INPUT);
	this.m_nameInput.addCssClass("ffFormulaEditor-DetailsAreaView-NameArea-Input");
	this.m_nameInput.setPlaceholder(this.m_initId);
	this.m_nameInput.addLabelledBy(label);
	this.m_nameInput.setMaxLength(this.m_validator.getMaxLength());
	if (!oFF.XStringUtils.isNullOrEmpty(this.m_initDesc))
	{
		this.m_nameInput.setValue(this.m_initDesc);
	}
};
oFF.OuCalcDetailsAreaView.prototype.destroyView = function()
{
	this.m_i18n = null;
	this.m_idInput = null;
	this.m_nameInput = null;
	this.m_initId = null;
	this.m_initDesc = null;
	this.m_onIdChangedConsumers.clear();
	this.m_onIdChangedConsumers = oFF.XObjectExt.release(this.m_onIdChangedConsumers);
	this.m_onNameChangedConsumers.clear();
	this.m_onNameChangedConsumers = oFF.XObjectExt.release(this.m_onNameChangedConsumers);
	this.m_validator = oFF.XObjectExt.release(this.m_validator);
};
oFF.OuCalcDetailsAreaView.prototype.displayInlineErrorMsg = function(input, msgError)
{
	input.setValueState(oFF.UiValueState.ERROR);
	input.setValueStateText(msgError);
};
oFF.OuCalcDetailsAreaView.prototype.focus = function()
{
	this.m_nameInput.focus();
};
oFF.OuCalcDetailsAreaView.prototype.getErrors = function()
{
	return this.m_validator.validate().getErrors();
};
oFF.OuCalcDetailsAreaView.prototype.getId = function()
{
	return this.m_idInput.getValue();
};
oFF.OuCalcDetailsAreaView.prototype.getName = function()
{
	return this.m_nameInput.getValue();
};
oFF.OuCalcDetailsAreaView.prototype.hasErrors = function()
{
	return this.m_validator.validate().hasErrors();
};
oFF.OuCalcDetailsAreaView.prototype.setInitialData = function(initialId, initialDescription)
{
	this._setInitialData(initialId, initialDescription);
	this.m_idInput.setValue(initialId);
	this.m_nameInput.setValue(initialDescription);
};
oFF.OuCalcDetailsAreaView.prototype.setupView = function() {};
oFF.OuCalcDetailsAreaView.prototype.validate = function()
{
	let messages = this.m_validator.validate();
	this.clearErrors();
	if (messages.hasErrors())
	{
		oFF.XStream.of(messages.getErrors()).forEach((error) => {
			let input = null;
			let errorI18n = null;
			if (error.getCode() === oFF.FeErrorCodes.CALCULATION_ID_MANDATORY)
			{
				input = this.m_idInput;
				errorI18n = oFF.OuCalcDetailsAreaViewI18n.ID_ERROR_MANDATORY;
			}
			else if (error.getCode() === oFF.FeErrorCodes.CALCULATION_ID_EXISTING)
			{
				input = this.m_idInput;
				errorI18n = oFF.OuCalcDetailsAreaViewI18n.ID_ERROR_EXISTING;
			}
			else if (error.getCode() === oFF.FeErrorCodes.CALCULATION_ID_MAX_LENGTH)
			{
				input = this.m_idInput;
				errorI18n = oFF.OuCalcDetailsAreaViewI18n.ID_ERROR_MAX_LENGTH;
			}
			else if (error.getCode() === oFF.FeErrorCodes.CALCULATION_ID_INVALID_CHARS)
			{
				input = this.m_idInput;
				errorI18n = oFF.OuCalcDetailsAreaViewI18n.ID_ERROR_INVALID_CHARS;
			}
			else if (error.getCode() === oFF.FeErrorCodes.CALCULATION_NAME_MAX_LENGTH)
			{
				input = this.m_nameInput;
				errorI18n = oFF.OuCalcDetailsAreaViewI18n.NAME_ERROR_MAX_LENGTH;
			}
			if (oFF.notNull(input))
			{
				this.displayInlineErrorMsg(input, this.m_i18n.getText(errorI18n));
			}
		});
	}
};

oFF.OuCalcAssistanceViewV2 = function() {};
oFF.OuCalcAssistanceViewV2.prototype = new oFF.DfUiContentView();
oFF.OuCalcAssistanceViewV2.prototype._ff_c = "OuCalcAssistanceViewV2";

oFF.OuCalcAssistanceViewV2.AI_PANEL_INDEX = 1;
oFF.OuCalcAssistanceViewV2.AI_PANEL_ITEM = "ai";
oFF.OuCalcAssistanceViewV2.FUNCTION_HELP_PANEL_INDEX = 0;
oFF.OuCalcAssistanceViewV2.FUNC_PANEL_ITEM = "functionHelp";
oFF.OuCalcAssistanceViewV2.SELECTION_CHANGE_SOURCE_INITIAL = "initial";
oFF.OuCalcAssistanceViewV2.SELECTION_CHANGE_SOURCE_PANEL_BUTTON = "panelButton";
oFF.OuCalcAssistanceViewV2.SELECTION_CHANGE_SOURCE_PERFORM_EXPLAIN = "performExplain";
oFF.OuCalcAssistanceViewV2.create = function(translationParser)
{
	let instance = new oFF.OuCalcAssistanceViewV2();
	instance.m_documentationView = oFF.OuCalcDocumentationView.create(translationParser);
	instance.m_onCollapseConsumers = oFF.XConsumerCollection.create();
	instance.m_onSelectionChangeConsumers = oFF.XBiConsumerCollection.create();
	return instance;
};
oFF.OuCalcAssistanceViewV2.createWithAI = function(initialData, translationParser, parser, formulaPresentation, genAiService, activityTracking)
{
	let instance = new oFF.OuCalcAssistanceViewV2();
	instance.m_documentationView = oFF.OuCalcDocumentationView.create(translationParser);
	instance.m_aiView = oFF.OuCalcAIView.create(parser, formulaPresentation, genAiService, activityTracking);
	instance.m_onCollapseConsumers = oFF.XConsumerCollection.create();
	instance.m_onSelectionChangeConsumers = oFF.XBiConsumerCollection.create();
	instance.m_initialData = initialData;
	instance.m_withAi = true;
	return instance;
};
oFF.OuCalcAssistanceViewV2.prototype.m_aiView = null;
oFF.OuCalcAssistanceViewV2.prototype.m_documentationView = null;
oFF.OuCalcAssistanceViewV2.prototype.m_initialData = null;
oFF.OuCalcAssistanceViewV2.prototype.m_onCollapseConsumers = null;
oFF.OuCalcAssistanceViewV2.prototype.m_onSelectionChangeConsumers = null;
oFF.OuCalcAssistanceViewV2.prototype.m_sidePanel = null;
oFF.OuCalcAssistanceViewV2.prototype.m_withAi = false;
oFF.OuCalcAssistanceViewV2.prototype.addAIPanelItem = function()
{
	let aiPanelItem = this.m_sidePanel.addNewItem();
	aiPanelItem.setName(oFF.OuCalcAssistanceViewV2.AI_PANEL_ITEM);
	let panelTitle = this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_AI_PANEL_TITLE);
	aiPanelItem.setText(panelTitle);
	aiPanelItem.setIcon("ai");
	aiPanelItem.setTooltip(panelTitle);
	this.m_aiView.renderView(this.getGenesis());
	this.m_aiView.getView().addCssClass("ffOuCalcAssistanceContentView");
	aiPanelItem.setContent(this.m_aiView.getView());
	this.m_aiView.setSelectedPanelByName(this.m_initialData.isEdit() ? oFF.OuCalcAIView.EXPLAIN_PANEL_NAME : oFF.OuCalcAIView.GENERATE_PANEL_NAME);
	this.m_aiView.setExplainText(this.m_initialData.getFormula().getText());
	return aiPanelItem;
};
oFF.OuCalcAssistanceViewV2.prototype.addDocumentationPanelItem = function()
{
	let docPanelItem = this.m_sidePanel.addNewItem();
	docPanelItem.setName(oFF.OuCalcAssistanceViewV2.FUNC_PANEL_ITEM);
	let panelTitle = this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_FUNC_HELP_PANEL_TITLE);
	docPanelItem.setText(panelTitle);
	if (this.isAIEnabled())
	{
		docPanelItem.setIcon("sys-help");
	}
	docPanelItem.setTooltip(panelTitle);
	this.m_documentationView.renderView(this.getGenesis());
	this.m_documentationView.getView().addCssClass("ffOuCalcAssistanceContentView");
	docPanelItem.setContent(this.m_documentationView.getView());
	return docPanelItem;
};
oFF.OuCalcAssistanceViewV2.prototype.addOnAddFormulaConsumers = function(consumers)
{
	if (this.m_withAi && oFF.FeFeatureToggle.isActive(oFF.FeFeatureToggle.GEN_AI_PHASE1))
	{
		return this.m_aiView.addOnAddFormulaConsumers(consumers);
	}
	return null;
};
oFF.OuCalcAssistanceViewV2.prototype.addOnCollapseConsumer = function(consumer)
{
	return this.m_onCollapseConsumers.addConsumer(consumer);
};
oFF.OuCalcAssistanceViewV2.prototype.addOnExplainFormulaConsumers = function(consumers)
{
	if (this.m_withAi && oFF.FeFeatureToggle.isActive(oFF.FeFeatureToggle.GEN_AI_PHASE1))
	{
		return this.m_aiView.addOnExplainFormulaConsumers(consumers);
	}
	return null;
};
oFF.OuCalcAssistanceViewV2.prototype.addOnSelectionChangeConsumer = function(consumer)
{
	return this.m_onSelectionChangeConsumers.addConsumer(consumer);
};
oFF.OuCalcAssistanceViewV2.prototype.buildViewUi = function(genesis)
{
	this.m_sidePanel = genesis.newRoot(oFF.UiType.SIDE_PANEL);
	this.m_sidePanel.addCssClass("ffOuCalcAssistancePanel");
	this.addDocumentationPanelItem();
	if (this.isAIEnabled())
	{
		this.addAIPanelItem();
		let firstRender = oFF.XBooleanValue.create(true);
		this.m_sidePanel.registerOnAfterRender(oFF.UiLambdaAfterRenderListener.create((event) => {
			let itemName = this.m_sidePanel.getSelectedItem() !== null ? this.m_sidePanel.getSelectedItem().getName() : null;
			this.m_onCollapseConsumers.accept(oFF.XBooleanValue.create(oFF.isNull(itemName)));
			let source = firstRender.getBoolean() ? oFF.OuCalcAssistanceViewV2.SELECTION_CHANGE_SOURCE_INITIAL : oFF.OuCalcAssistanceViewV2.SELECTION_CHANGE_SOURCE_PANEL_BUTTON;
			this.m_onSelectionChangeConsumers.accept(itemName, source);
			firstRender.setBoolean(false);
		}));
	}
	else
	{
		this.m_sidePanel.registerOnToggle(oFF.UiLambdaToggleListener.create((event) => {
			let item = event.getAffectedItem();
			if (oFF.notNull(item))
			{
				this.m_onCollapseConsumers.accept(oFF.XBooleanValue.create(!event.getParameters().getBooleanByKey("expanded")));
			}
		}));
	}
};
oFF.OuCalcAssistanceViewV2.prototype.destroyView = function()
{
	this.m_onCollapseConsumers.clear();
	this.m_onCollapseConsumers = oFF.XObjectExt.release(this.m_onCollapseConsumers);
	this.m_onSelectionChangeConsumers.clear();
	this.m_onSelectionChangeConsumers = oFF.XObjectExt.release(this.m_onSelectionChangeConsumers);
	this.m_documentationView = oFF.XObjectExt.release(this.m_documentationView);
	this.m_sidePanel = oFF.XObjectExt.release(this.m_sidePanel);
	this.m_aiView = oFF.XObjectExt.release(this.m_aiView);
};
oFF.OuCalcAssistanceViewV2.prototype.generateDocumentation = function(operatorName)
{
	if (oFF.XStringUtils.isNullOrEmpty(operatorName))
	{
		this.m_documentationView.getView().addCssClass("ffOuCalcAssistanceContentViewEmpty");
	}
	else
	{
		this.m_documentationView.getView().removeCssClass("ffOuCalcAssistanceContentViewEmpty");
	}
	this.m_documentationView.generateDocumentation(operatorName);
};
oFF.OuCalcAssistanceViewV2.prototype.getLocalization = function()
{
	return oFF.XLocalizationCenter.getCenter();
};
oFF.OuCalcAssistanceViewV2.prototype.isAIEnabled = function()
{
	return this.m_withAi;
};
oFF.OuCalcAssistanceViewV2.prototype.isCollapsed = function()
{
	return this.m_sidePanel.getSelectedItem() === null;
};
oFF.OuCalcAssistanceViewV2.prototype.performExplain = function(formulaText)
{
	if (this.isAIEnabled())
	{
		this.m_onSelectionChangeConsumers.accept(oFF.OuCalcAssistanceViewV2.AI_PANEL_ITEM, oFF.OuCalcAssistanceViewV2.SELECTION_CHANGE_SOURCE_PERFORM_EXPLAIN);
		this.setSelectedPanelByIndex(oFF.OuCalcAssistanceViewV2.AI_PANEL_INDEX);
		this.m_aiView.performExplain(formulaText);
	}
};
oFF.OuCalcAssistanceViewV2.prototype.setCollapsed = function(collapsed)
{
	if (this.m_sidePanel.getItems().size() === 1)
	{
		this.m_sidePanel.setExpanded(!collapsed);
	}
};
oFF.OuCalcAssistanceViewV2.prototype.setCustomMode = function(modeName)
{
	if (oFF.notNull(this.m_aiView))
	{
		this.m_aiView.setCustomMode(modeName);
	}
};
oFF.OuCalcAssistanceViewV2.prototype.setSelectedPanelByIndex = function(index)
{
	this.m_sidePanel.setSelectedItemByIndex(index);
};
oFF.OuCalcAssistanceViewV2.prototype.setupView = function() {};

oFF.OuCalcDocumentationView = function() {};
oFF.OuCalcDocumentationView.prototype = new oFF.DfUiContentView();
oFF.OuCalcDocumentationView.prototype._ff_c = "OuCalcDocumentationView";

oFF.OuCalcDocumentationView.DOC_CSS_CLASS = "ffFeDoc";
oFF.OuCalcDocumentationView.DOC_SECTION_CONTENT_CSS_CLASS = "ffFeSectionContent";
oFF.OuCalcDocumentationView.DOC_SECTION_CSS_CLASS = "ffFeDocSection";
oFF.OuCalcDocumentationView.DOC_SECTION_FIRST_LINE_CSS_CLASS = "ffFeSectionFirstLine";
oFF.OuCalcDocumentationView.DOC_SECTION_LABEL_CSS_CLASS = "ffFeSectionLabel";
oFF.OuCalcDocumentationView.DOC_SECTION_LINE_CSS_CLASS = "ffFeSectionLine";
oFF.OuCalcDocumentationView.EMPTY_DOC_CSS_CLASS = "ffOuCalcAssistanceContentEmpty";
oFF.OuCalcDocumentationView.EMPTY_STRING = "";
oFF.OuCalcDocumentationView.create = function(translationParser)
{
	let instance = new oFF.OuCalcDocumentationView();
	instance.m_changedConsumers = oFF.XConsumerCollection.create();
	instance.m_translatedDocMap = oFF.XHashMapByString.create();
	instance.m_translationParser = oFF.XObjectExt.assertNotNull(translationParser);
	return instance;
};
oFF.OuCalcDocumentationView.prototype.m_changedConsumers = null;
oFF.OuCalcDocumentationView.prototype.m_documentationLayout = null;
oFF.OuCalcDocumentationView.prototype.m_noFuncSelectedIllustratedMsg = null;
oFF.OuCalcDocumentationView.prototype.m_title = null;
oFF.OuCalcDocumentationView.prototype.m_translatedDocMap = null;
oFF.OuCalcDocumentationView.prototype.m_translationParser = null;
oFF.OuCalcDocumentationView.prototype.addChangeTitleConsumer = function(consumer)
{
	return this.m_changedConsumers.addConsumer(consumer);
};
oFF.OuCalcDocumentationView.prototype.announceUpdate = function()
{
	oFF.UiFramework.currentFramework().announce(this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_HELP_ANNOUNCE_UPDATE), oFF.UiAriaLiveMode.ASSERTIVE);
};
oFF.OuCalcDocumentationView.prototype.buildFirstLineV2 = function(firstLine, labelValue)
{
	let html = oFF.XStringBuffer.create();
	html.append("<div class=\"");
	html.append(oFF.OuCalcDocumentationView.DOC_SECTION_FIRST_LINE_CSS_CLASS);
	html.append("\">");
	html.append("<div role=\"heading\" aria-level=\"6\" class=\" ");
	html.append(oFF.OuCalcDocumentationView.DOC_SECTION_LABEL_CSS_CLASS);
	html.append("\">");
	html.append(labelValue);
	html.append("</div>");
	html.append("<p class=\"");
	html.append(oFF.OuCalcDocumentationView.DOC_SECTION_CONTENT_CSS_CLASS);
	html.append("\">");
	html.append(firstLine);
	html.append("</p>");
	html.append("</div>");
	return html.toString();
};
oFF.OuCalcDocumentationView.prototype.buildSection = function(lines, labelValue, cssClass, emptyFirstLine, showLabel)
{
	oFF.XObjectExt.assertNotNull(lines);
	oFF.XCollectionUtils.forEach(lines, (line) => {
		oFF.XStringUtils.assertNotNullOrEmpty(line);
	});
	let sectionLines = lines.createListCopy();
	if (emptyFirstLine)
	{
		sectionLines.insert(0, "");
	}
	if (oFF.isNull(labelValue))
	{
		throw oFF.XException.createIllegalArgumentException("Label value must not be null.");
	}
	let html = oFF.XStringBuffer.create();
	html.append("<section class=\"");
	html.append(oFF.OuCalcDocumentationView.DOC_SECTION_CSS_CLASS);
	html.append(" ");
	html.append(cssClass);
	html.append("\"");
	html.append(" aria-label=\"");
	html.append(labelValue);
	html.append("\"");
	html.append(">");
	let indexOfFirstLine = 0;
	if (showLabel)
	{
		let firstLine = sectionLines.get(indexOfFirstLine++);
		html.append(this.buildFirstLineV2(firstLine, labelValue));
	}
	for (let i = indexOfFirstLine; i < sectionLines.size(); i++)
	{
		html.append("<div class=\"");
		html.append(oFF.OuCalcDocumentationView.DOC_SECTION_LINE_CSS_CLASS);
		html.append("\">");
		html.append(sectionLines.get(i));
		html.append("</div>");
	}
	html.append("</section>");
	return html.toString();
};
oFF.OuCalcDocumentationView.prototype.buildViewUi = function(genesis)
{
	let mainLayout = genesis.newRoot(oFF.UiType.FLEX_LAYOUT);
	mainLayout.addCssClass("ffOuCalcDocumentationView");
	mainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_title = mainLayout.addNewItemOfType(oFF.UiType.TITLE);
	this.m_title.setTitleLevel(oFF.UiTitleLevel.H_5);
	this.m_title.setTitleStyle(oFF.UiTitleLevel.H_5);
	this.m_title.addCssClass("ffOuCalcDocumentationTitle");
	this.m_documentationLayout = mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_documentationLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_documentationLayout.addCssClass("ffOuCalcDocumentationContent");
	this.generateEmptyDocumentation();
};
oFF.OuCalcDocumentationView.prototype.destroyView = function()
{
	this.m_documentationLayout = null;
	this.m_changedConsumers.clear();
	this.m_changedConsumers = oFF.XObjectExt.release(this.m_changedConsumers);
	this.m_translatedDocMap.clear();
	this.m_translatedDocMap = oFF.XObjectExt.release(this.m_translatedDocMap);
};
oFF.OuCalcDocumentationView.prototype.generateDocumentation = function(operatorName)
{
	let emptyOperatorName = oFF.XStringUtils.isNullOrEmpty(operatorName);
	this.m_documentationLayout.clearItems();
	this.m_documentationLayout.addAttribute("op-name", operatorName);
	this.m_title.setVisible(!emptyOperatorName);
	if (emptyOperatorName)
	{
		this.showEmptyDocumentation();
		return;
	}
	this.m_documentationLayout.removeCssClass(oFF.OuCalcDocumentationView.EMPTY_DOC_CSS_CLASS);
	let doc = this.getDocumentation(operatorName);
	let html = oFF.XStringBuffer.create();
	html.append("<section class=\"");
	html.append(oFF.OuCalcDocumentationView.DOC_CSS_CLASS);
	html.append("\" ");
	html.append("aria-label=\"");
	html.append(this.getLocalization().getTextWithPlaceholder(oFF.OuCalcFormulaEditorI18n.FE_DOCUMENTATION, operatorName));
	html.append("\">");
	if (doc.hasSyntax())
	{
		html.append(this.buildSection(doc.getSyntax(), this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FE_SYNTAX), "ffFeDocSyntax", false, true));
	}
	if (doc.hasSummary())
	{
		html.append(this.buildSection(doc.getSummary(), this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FE_SUMMARY), "ffFeDocSummary", false, false));
	}
	if (doc.hasExample())
	{
		html.append(this.buildSection(doc.getExample(), this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FE_EXAMPLE), "ffFeDocExample", false, true));
	}
	if (doc.hasRemark())
	{
		html.append(this.buildSection(doc.getRemark(), this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FE_REMARK), "ffFeDocRemark", true, true));
	}
	html.append("</section>");
	this.m_documentationLayout.addNewItemOfType(oFF.UiType.HTML).setValue(html.toString());
	this.announceUpdate();
	this.setTitleAndNotify(operatorName);
};
oFF.OuCalcDocumentationView.prototype.generateEmptyDocumentation = function()
{
	this.m_noFuncSelectedIllustratedMsg = this.m_documentationLayout.newItemOfType(oFF.UiType.ILLUSTRATED_MESSAGE);
	this.m_noFuncSelectedIllustratedMsg.setEnableDefaultTitleAndDescription(false);
	this.m_noFuncSelectedIllustratedMsg.setIllustrationType(oFF.UiIllustratedMessageType.TENT);
	this.m_noFuncSelectedIllustratedMsg.setIllustrationSize(oFF.UiIllustratedMessageSize.AUTO);
	this.m_noFuncSelectedIllustratedMsg.setTitle(this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_HELP_EMPTY_TITLE));
	this.m_noFuncSelectedIllustratedMsg.setDescription(this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_HELP_EMPTY_DESCRIPTION));
};
oFF.OuCalcDocumentationView.prototype.getDocumentation = function(operatorName)
{
	let formulaItemMd = oFF.FeFormulaItemProvider.getInstance().getFormulaItem(operatorName).get().getMetadata();
	let doc = formulaItemMd.getDocumentation();
	let parsedDoc = this.m_translatedDocMap.getByKey(operatorName);
	if (oFF.isNull(parsedDoc))
	{
		parsedDoc = oFF.FeDoc.create(this.parseStringList(doc.getSummary()), this.parseStringList(doc.getSyntax()), this.parseStringList(doc.getExample()), this.parseStringList(doc.getRemark()));
		this.m_translatedDocMap.put(operatorName, parsedDoc);
	}
	return parsedDoc;
};
oFF.OuCalcDocumentationView.prototype.getLocalization = function()
{
	return oFF.XLocalizationCenter.getCenter();
};
oFF.OuCalcDocumentationView.prototype.getTitle = function()
{
	return this.m_title.getText();
};
oFF.OuCalcDocumentationView.prototype.notifyTitleChanged = function()
{
	this.m_changedConsumers.accept(this.m_title.getText());
};
oFF.OuCalcDocumentationView.prototype.parseStringList = function(list)
{
	let parsedList = oFF.XList.create();
	for (let i = 0; i < list.size(); i++)
	{
		parsedList.add(this.m_translationParser.parseText(list.get(i)));
	}
	return parsedList;
};
oFF.OuCalcDocumentationView.prototype.setTitleAndNotify = function(title)
{
	this.m_title.setText(title);
	this.notifyTitleChanged();
};
oFF.OuCalcDocumentationView.prototype.setupView = function() {};
oFF.OuCalcDocumentationView.prototype.showEmptyDocumentation = function()
{
	this.m_documentationLayout.addCssClass(oFF.OuCalcDocumentationView.EMPTY_DOC_CSS_CLASS);
	this.m_documentationLayout.addItem(this.m_noFuncSelectedIllustratedMsg);
	this.setTitleAndNotify(oFF.OuCalcDocumentationView.EMPTY_STRING);
};

oFF.OuCalcErrorsView = function() {};
oFF.OuCalcErrorsView.prototype = new oFF.DfUiContentView();
oFF.OuCalcErrorsView.prototype._ff_c = "OuCalcErrorsView";

oFF.OuCalcErrorsView.EMPTY_DOC_CSS_CLASS = "ffOuCalcAssistanceContentEmpty";
oFF.OuCalcErrorsView.EMPTY_STRING = "";
oFF.OuCalcErrorsView.create = function()
{
	let instance = new oFF.OuCalcErrorsView();
	instance.m_changedConsumers = oFF.XConsumerCollection.create();
	instance.m_isFormulaEmpty = true;
	return instance;
};
oFF.OuCalcErrorsView.prototype.m_changedConsumers = null;
oFF.OuCalcErrorsView.prototype.m_errors = null;
oFF.OuCalcErrorsView.prototype.m_isFormulaEmpty = false;
oFF.OuCalcErrorsView.prototype.m_mainLayout = null;
oFF.OuCalcErrorsView.prototype.m_messageView = null;
oFF.OuCalcErrorsView.prototype.m_noErrorIllustratedMsg = null;
oFF.OuCalcErrorsView.prototype.addChangeTitleConsumer = function(consumer)
{
	return this.m_changedConsumers.addConsumer(consumer);
};
oFF.OuCalcErrorsView.prototype.announceUpdate = function()
{
	oFF.UiFramework.currentFramework().announce(this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_ERRORS_ANNOUNCE_UPDATE), oFF.UiAriaLiveMode.ASSERTIVE);
};
oFF.OuCalcErrorsView.prototype.buildViewUi = function(genesis)
{
	this.m_mainLayout = genesis.newRoot(oFF.UiType.FLEX_LAYOUT);
	this.m_mainLayout.addCssClass("ffOuCalcErrorsView");
	this.m_mainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_messageView = this.m_mainLayout.addNewItemOfType(oFF.UiType.MESSAGE_VIEW);
	this.m_messageView.addCssClass("ffOuCalcAssistanceErrorList");
	this.m_noErrorIllustratedMsg = this.m_mainLayout.addNewItemOfType(oFF.UiType.ILLUSTRATED_MESSAGE);
	this.m_noErrorIllustratedMsg.setEnableDefaultTitleAndDescription(false);
	this.m_noErrorIllustratedMsg.addCssClass("ffOuCalcErrorEmptyMsg");
	this.m_noErrorIllustratedMsg.setIllustrationSize(oFF.UiIllustratedMessageSize.DOT);
	this.generateNoErrorsMessage();
};
oFF.OuCalcErrorsView.prototype.destroyView = function()
{
	this.m_messageView = null;
	this.m_noErrorIllustratedMsg = null;
	this.m_changedConsumers.clear();
	this.m_changedConsumers = oFF.XObjectExt.release(this.m_changedConsumers);
};
oFF.OuCalcErrorsView.prototype.generateErrorList = function(errors)
{
	this.m_mainLayout.removeCssClass(oFF.OuCalcErrorsView.EMPTY_DOC_CSS_CLASS);
	this.m_messageView.setVisible(true);
	this.m_noErrorIllustratedMsg.setVisible(false);
	for (let i = 0; i < errors.getErrors().size(); i++)
	{
		let errorText = errors.getErrors().get(i).getText();
		let msgItem = this.m_messageView.addNewItem();
		msgItem.setTitle(errorText);
		msgItem.setMessageType(oFF.UiMessageType.ERROR);
	}
};
oFF.OuCalcErrorsView.prototype.generateErrors = function(isChanged)
{
	this.m_messageView.clearItems();
	this.m_messageView.back();
	if (!this.hasErrors())
	{
		this.generateNoErrorsMessage();
	}
	else
	{
		this.generateErrorList(this.m_errors);
	}
	if (isChanged)
	{
		this.announceUpdate();
		this.notifyTitleChanged();
	}
};
oFF.OuCalcErrorsView.prototype.generateNoErrorsMessage = function()
{
	this.m_mainLayout.addCssClass(oFF.OuCalcErrorsView.EMPTY_DOC_CSS_CLASS);
	this.m_messageView.setVisible(false);
	this.m_noErrorIllustratedMsg.setVisible(true);
	let validFormulaI18nKey = this.m_isFormulaEmpty ? oFF.OuCalcFormulaEditorI18n.ASSISTANCE_ERRORS_EMPTY_FORMULA : oFF.OuCalcFormulaEditorI18n.ASSISTANCE_ERRORS_VALID_FORMULA;
	let messageType = this.m_isFormulaEmpty ? oFF.UiIllustratedMessageType.SIMPLE_EMPTY_LIST : oFF.UiIllustratedMessageType.SUCCESS_SCREEN;
	this.m_noErrorIllustratedMsg.setIllustrationType(messageType);
	this.m_noErrorIllustratedMsg.setTitle(this.getLocalization().getText(validFormulaI18nKey));
};
oFF.OuCalcErrorsView.prototype.getLocalization = function()
{
	return oFF.XLocalizationCenter.getCenter();
};
oFF.OuCalcErrorsView.prototype.getTitle = function()
{
	let numOfErrors = this.m_messageView.getNumberOfItems();
	if (numOfErrors === 0)
	{
		return oFF.OuCalcErrorsView.EMPTY_STRING;
	}
	else if (numOfErrors === 1)
	{
		return this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_ERRORS_TITLE_SINGLE);
	}
	else
	{
		return this.getLocalization().getTextWithPlaceholder(oFF.OuCalcFormulaEditorI18n.ASSISTANCE_ERRORS_TITLE_MULTIPLE, oFF.XInteger.convertToString(numOfErrors));
	}
};
oFF.OuCalcErrorsView.prototype.hasChanged = function(errors)
{
	let hasNotLocalErrors = oFF.isNull(this.m_errors) || !this.m_errors.hasErrors();
	let hasNotErrors = oFF.isNull(errors) || !errors.hasErrors();
	return hasNotLocalErrors !== hasNotErrors;
};
oFF.OuCalcErrorsView.prototype.hasErrors = function()
{
	return oFF.notNull(this.m_errors) && this.m_errors.hasErrors();
};
oFF.OuCalcErrorsView.prototype.notifyTitleChanged = function()
{
	this.m_changedConsumers.accept(this.getTitle());
};
oFF.OuCalcErrorsView.prototype.setErrors = function(errors)
{
	let hasChanged = this.hasChanged(errors);
	this.m_errors = errors;
	this.generateErrors(hasChanged);
};
oFF.OuCalcErrorsView.prototype.setFormulaEmpty = function(isEmpty)
{
	this.m_isFormulaEmpty = isEmpty;
	if (!this.hasErrors())
	{
		this.generateNoErrorsMessage();
	}
};
oFF.OuCalcErrorsView.prototype.setupView = function() {};

oFF.OuCalcAIDisclaimerWidget = function() {};
oFF.OuCalcAIDisclaimerWidget.prototype = new oFF.DfUiWidget();
oFF.OuCalcAIDisclaimerWidget.prototype._ff_c = "OuCalcAIDisclaimerWidget";

oFF.OuCalcAIDisclaimerWidget.create = function()
{
	return new oFF.OuCalcAIDisclaimerWidget();
};
oFF.OuCalcAIDisclaimerWidget.prototype.destroyWidget = function() {};
oFF.OuCalcAIDisclaimerWidget.prototype.getLocalization = function()
{
	return oFF.XLocalizationCenter.getCenter();
};
oFF.OuCalcAIDisclaimerWidget.prototype.getWidgetControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.FLEX_LAYOUT);
};
oFF.OuCalcAIDisclaimerWidget.prototype.layoutWidget = function(widgetControl)
{
	widgetControl.setDirection(oFF.UiFlexDirection.ROW);
	widgetControl.addCssClass("ffOuCalcAIDisclaimer");
	let disclaimerText = oFF.XStringUtils.concatenate3(this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FORMULA_EXPLAIN_DISCLAIMER_PART1), " ", this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FORMULA_EXPLAIN_DISCLAIMER_PART2));
	widgetControl.addNewItemOfType(oFF.UiType.TEXT).setText(disclaimerText).setTooltip(disclaimerText);
};
oFF.OuCalcAIDisclaimerWidget.prototype.setupWidget = function() {};

oFF.OuCalcCodeEditorViewV2 = function() {};
oFF.OuCalcCodeEditorViewV2.prototype = new oFF.DfUiContentView();
oFF.OuCalcCodeEditorViewV2.prototype._ff_c = "OuCalcCodeEditorViewV2";

oFF.OuCalcCodeEditorViewV2.ERROR_STATE_CSS_CLASS = "ffOuCalcCodeEditorViewErrorState";
oFF.OuCalcCodeEditorViewV2.create = function(formulaPresentation, preferences)
{
	let instance = new oFF.OuCalcCodeEditorViewV2();
	instance.m_onFuncHelpPressConsumers = oFF.XConsumerCollection.create();
	instance.m_onExplainPressConsumers = oFF.XConsumerCollection.create();
	instance.m_codeEditorWidget = oFF.OuCalcCodeEditorWidget.create(formulaPresentation, instance.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.EDITOR_NAME_FORMULA));
	instance.m_errorsView = oFF.OuCalcErrorsViewV2.create();
	instance.m_shouldFocus = false;
	instance.m_hasError = false;
	instance.m_preferences = preferences;
	instance.m_explainEnabled = true;
	return instance;
};
oFF.OuCalcCodeEditorViewV2.prototype.m_aiExplainBtn = null;
oFF.OuCalcCodeEditorViewV2.prototype.m_codeEditorWidget = null;
oFF.OuCalcCodeEditorViewV2.prototype.m_errorLayout = null;
oFF.OuCalcCodeEditorViewV2.prototype.m_errorsView = null;
oFF.OuCalcCodeEditorViewV2.prototype.m_explainEnabled = false;
oFF.OuCalcCodeEditorViewV2.prototype.m_hasError = false;
oFF.OuCalcCodeEditorViewV2.prototype.m_loadingIndicator = null;
oFF.OuCalcCodeEditorViewV2.prototype.m_mainLayout = null;
oFF.OuCalcCodeEditorViewV2.prototype.m_onExplainPressConsumers = null;
oFF.OuCalcCodeEditorViewV2.prototype.m_onFuncHelpPressConsumers = null;
oFF.OuCalcCodeEditorViewV2.prototype.m_preferences = null;
oFF.OuCalcCodeEditorViewV2.prototype.m_shouldFocus = false;
oFF.OuCalcCodeEditorViewV2.prototype.m_showErrorsTglBtn = null;
oFF.OuCalcCodeEditorViewV2.prototype.m_showFuncHelpTglBtn = null;
oFF.OuCalcCodeEditorViewV2.prototype.m_toolbar = null;
oFF.OuCalcCodeEditorViewV2.prototype.addAIButtons = function()
{
	this.m_aiExplainBtn = this.addNewToolbarButton(oFF.OuCalcFormulaEditorI18n.FORMULA_EXPLAIN_TEXT, "ffOuCCEditorExplainBtn", oFF.UiLambdaPressListener.create((controlEvent) => {
		this.m_onExplainPressConsumers.accept(null);
	}));
	this.m_aiExplainBtn.setIcon("ai");
};
oFF.OuCalcCodeEditorViewV2.prototype.addKeyboardHandlerToEditorFromModule = function()
{
	this.m_codeEditorWidget.addKeyboardHandlerToEditorFromModule();
};
oFF.OuCalcCodeEditorViewV2.prototype.addNewToolbarButton = function(i18nKey, cssClass, listener)
{
	let text = this.getLocalization().getText(i18nKey);
	let toolbarButton = this.m_toolbar.addNewItemOfType(oFF.UiType.BUTTON);
	toolbarButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
	toolbarButton.setText(text);
	toolbarButton.addCssClass(cssClass);
	toolbarButton.registerOnPress(listener);
	return toolbarButton;
};
oFF.OuCalcCodeEditorViewV2.prototype.addNewToolbarIconToggleButton = function(type, icon, i18nKey, cssClass, listener)
{
	let tooltip = this.getLocalization().getText(i18nKey);
	let toolbarButton = this.m_toolbar.addNewItemOfType(oFF.UiType.TOGGLE_BUTTON);
	toolbarButton.setIcon(icon);
	toolbarButton.setTooltip(tooltip);
	toolbarButton.addCssClass(cssClass);
	toolbarButton.setButtonType(oFF.isNull(type) ? oFF.UiButtonType.TRANSPARENT : type);
	toolbarButton.registerOnPress(listener);
	return toolbarButton;
};
oFF.OuCalcCodeEditorViewV2.prototype.addOnExplainPressConsumers = function(consumer)
{
	return this.m_onExplainPressConsumers.addConsumer(consumer);
};
oFF.OuCalcCodeEditorViewV2.prototype.addOnFunctionHelpPressConsumer = function(consumer)
{
	return this.m_onFuncHelpPressConsumers.addConsumer(consumer);
};
oFF.OuCalcCodeEditorViewV2.prototype.addOnGenerationPressConsumer = function(consumer)
{
	return null;
};
oFF.OuCalcCodeEditorViewV2.prototype.addOnMoreErrorPressConsumer = function(consumer)
{
	return null;
};
oFF.OuCalcCodeEditorViewV2.prototype.buildToolbar = function(layout)
{
	this.m_toolbar = layout.addNewItemOfType(oFF.UiType.TOOLBAR);
	this.m_toolbar.addCssClass("ffOuCCEditorToolbar");
	let label = this.m_toolbar.addNewItemOfType(oFF.UiType.LABEL);
	let titleText = this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.EDITOR_LABEL);
	label.addCssClass("ffOuCCEditorTitle");
	label.addCssClass("ffOuCalcTitle");
	label.setText(titleText);
	label.setLabelFor(this.m_codeEditorWidget.getView());
	this.m_loadingIndicator = this.m_toolbar.addNewItemOfType(oFF.UiType.ACTIVITY_INDICATOR);
	this.m_loadingIndicator.setIconSize(oFF.UiCssLength.create("0.5rem"));
	this.m_loadingIndicator.setMargin(oFF.UiCssBoxEdges.create("0 0 0 1rem"));
	this.m_loadingIndicator.setVisible(false);
	this.m_loadingIndicator.setTooltip(this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.EDITOR_SUGGESTIONS_TOOLTIP));
	this.m_toolbar.addNewItemOfType(oFF.UiType.SPACER);
	this.m_showErrorsTglBtn = this.addNewToolbarIconToggleButton(oFF.UiButtonType.NEGATIVE, "error", oFF.OuCalcFormulaEditorI18n.EDITOR_SHOW_ERRORS_BTN, "ffOuCCEditorErrorMessagesBtn", oFF.UiLambdaPressListener.create((controlEvent) => {
		this.setErrorsViewVisible(this.m_showErrorsTglBtn.isPressed());
	}));
	this.m_showErrorsTglBtn.setVisible(false);
	if (this.m_preferences.isGenAiEnabled())
	{
		this.addAIButtons();
		this.m_toolbar.addNewItemOfType(oFF.UiType.SEPARATOR);
	}
	this.addNewToolbarButton(oFF.OuCalcFormulaEditorI18n.EDITOR_FORMAT_BTN, "ffOuCCEditorFormatBtn", oFF.UiLambdaPressListener.create((controlEvent) => {
		if (!this.m_hasError)
		{
			this.m_codeEditorWidget.formatEditorText();
		}
	}));
	if (!this.m_preferences.isGenAiEnabled())
	{
		this.m_toolbar.addNewItemOfType(oFF.UiType.SEPARATOR);
		this.m_showFuncHelpTglBtn = this.addNewToolbarIconToggleButton(oFF.UiButtonType.TRANSPARENT, "sys-help", oFF.OuCalcFormulaEditorI18n.EDITOR_SHOW_FUNC_HELP_BTN, "ffOuCCEditorFuncHelpToggleBtn", oFF.UiLambdaPressListener.create((controlEvent) => {
			this.m_onFuncHelpPressConsumers.accept(oFF.XBooleanValue.create(!this.m_showFuncHelpTglBtn.isPressed()));
		}));
	}
};
oFF.OuCalcCodeEditorViewV2.prototype.buildViewUi = function(genesis)
{
	this.m_mainLayout = genesis.newRoot(oFF.UiType.FLEX_LAYOUT);
	this.m_mainLayout.addCssClass("ffOuCalcCodeEditorView");
	this.m_mainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	let editorLayout = this.m_mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	editorLayout.addCssClass("ffOuCalcCodeEditorLayout");
	editorLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.buildToolbar(editorLayout);
	this.m_codeEditorWidget.renderView(genesis);
	editorLayout.addItem(this.m_codeEditorWidget.getView());
	this.m_errorLayout = this.m_mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_errorLayout.addCssClass("ffOuCalcCodeErrorsLayout");
	this.m_errorLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_errorsView.renderView(genesis);
	this.m_errorLayout.addItem(this.m_errorsView.getView());
	this.m_errorsView.addRegisterOnCloseConsumer((event) => {
		this.setErrorsViewVisible(false);
		this.m_codeEditorWidget.focus();
	});
	this.m_errorsView.getView().registerOnAfterRender(oFF.UiLambdaAfterRenderListener.create((event) => {
		if (this.m_shouldFocus)
		{
			this.m_codeEditorWidget.focus();
		}
		this.m_shouldFocus = false;
	}));
	this.setErrorsViewVisible(false);
	this.updateButtonsEnable();
	this.setOnChange((formulaText) => {
		this.updateButtonsEnable();
	});
};
oFF.OuCalcCodeEditorViewV2.prototype.destroyView = function()
{
	this.m_onFuncHelpPressConsumers.clear();
	this.m_onFuncHelpPressConsumers = oFF.XObjectExt.release(this.m_onFuncHelpPressConsumers);
	this.m_onExplainPressConsumers.clear();
	this.m_onExplainPressConsumers = oFF.XObjectExt.release(this.m_onExplainPressConsumers);
	this.m_codeEditorWidget = oFF.XObjectExt.release(this.m_codeEditorWidget);
	this.m_aiExplainBtn = null;
	this.m_loadingIndicator = oFF.XObjectExt.release(this.m_loadingIndicator);
	this.m_toolbar = null;
	this.m_errorLayout = null;
	this.m_errorsView = oFF.XObjectExt.release(this.m_errorsView);
	this.m_showErrorsTglBtn = null;
	this.m_showFuncHelpTglBtn = null;
	this.m_mainLayout = null;
};
oFF.OuCalcCodeEditorViewV2.prototype.disableAutoCompletions = function()
{
	this.m_codeEditorWidget.disableAutoCompletions();
};
oFF.OuCalcCodeEditorViewV2.prototype.enableAutoCompletions = function()
{
	this.m_codeEditorWidget.enableAutoCompletions();
};
oFF.OuCalcCodeEditorViewV2.prototype.focus = function()
{
	this.m_codeEditorWidget.focus();
};
oFF.OuCalcCodeEditorViewV2.prototype.getLocalization = function()
{
	return oFF.OuCalcFormulaEditorI18n.getLocalization();
};
oFF.OuCalcCodeEditorViewV2.prototype.getSelectedText = function()
{
	return this.m_codeEditorWidget.getView().getSelectedText();
};
oFF.OuCalcCodeEditorViewV2.prototype.insertText = function(text)
{
	if (oFF.notNull(this.m_codeEditorWidget))
	{
		this.m_codeEditorWidget.insertText(text);
	}
};
oFF.OuCalcCodeEditorViewV2.prototype.openHintsList = function()
{
	this.m_codeEditorWidget.openHintsList();
};
oFF.OuCalcCodeEditorViewV2.prototype.setBusy = function(busy)
{
	this.m_mainLayout.setBusy(busy);
};
oFF.OuCalcCodeEditorViewV2.prototype.setBusyNonBlocking = function(busy)
{
	this.m_loadingIndicator.setVisible(busy);
};
oFF.OuCalcCodeEditorViewV2.prototype.setCtrlSpacePressedProcedure = function(procedure)
{
	this.m_codeEditorWidget.setCtrlSpacePressedProcedure(procedure);
};
oFF.OuCalcCodeEditorViewV2.prototype.setCursorPosition = function(cursorPosition)
{
	this.m_codeEditorWidget.setCursorPosition(cursorPosition);
};
oFF.OuCalcCodeEditorViewV2.prototype.setCustomCompleterJson = function(completions)
{
	this.m_codeEditorWidget.setCustomCompleterJson(completions);
};
oFF.OuCalcCodeEditorViewV2.prototype.setCustomMode = function(mode)
{
	this.m_codeEditorWidget.setCustomMode(mode);
};
oFF.OuCalcCodeEditorViewV2.prototype.setErrorState = function(hasErrors)
{
	if (hasErrors)
	{
		this.getView().addCssClass(oFF.OuCalcCodeEditorViewV2.ERROR_STATE_CSS_CLASS);
	}
	else
	{
		this.getView().removeCssClass(oFF.OuCalcCodeEditorViewV2.ERROR_STATE_CSS_CLASS);
	}
};
oFF.OuCalcCodeEditorViewV2.prototype.setErrorsViewVisible = function(visible)
{
	if (visible)
	{
		this.m_mainLayout.removeCssClass("ffOuCalcFullView");
	}
	else
	{
		this.m_mainLayout.addCssClass("ffOuCalcFullView");
	}
	this.m_showErrorsTglBtn.setPressed(visible);
	this.m_showErrorsTglBtn.setTooltip(this.getLocalization().getText(visible ? oFF.OuCalcFormulaEditorI18n.EDITOR_HIDE_ERRORS_BTN : oFF.OuCalcFormulaEditorI18n.EDITOR_SHOW_ERRORS_BTN));
	this.m_errorLayout.setVisible(visible);
};
oFF.OuCalcCodeEditorViewV2.prototype.setExplainFormulaEnabled = function(enabled)
{
	this.m_explainEnabled = enabled;
	this.updateButtonsEnable();
};
oFF.OuCalcCodeEditorViewV2.prototype.setFormula = function(formula)
{
	this.m_codeEditorWidget.setFormula(formula);
};
oFF.OuCalcCodeEditorViewV2.prototype.setFunctionHelpPressed = function(pressed)
{
	if (oFF.isNull(this.m_showFuncHelpTglBtn))
	{
		return;
	}
	this.m_showFuncHelpTglBtn.setTooltip(this.getLocalization().getText(pressed ? oFF.OuCalcFormulaEditorI18n.EDITOR_HIDE_FUNC_HELP_BTN : oFF.OuCalcFormulaEditorI18n.EDITOR_SHOW_FUNC_HELP_BTN));
	this.m_showFuncHelpTglBtn.setPressed(pressed);
};
oFF.OuCalcCodeEditorViewV2.prototype.setNaturalLanguageDescription = function(description) {};
oFF.OuCalcCodeEditorViewV2.prototype.setOnChange = function(consumer)
{
	this.m_codeEditorWidget.addOnChangeConsumer(consumer);
};
oFF.OuCalcCodeEditorViewV2.prototype.setOnCursorChange = function(consumer)
{
	this.m_codeEditorWidget.addOnCursorChangeConsumer(consumer);
};
oFF.OuCalcCodeEditorViewV2.prototype.setupView = function() {};
oFF.OuCalcCodeEditorViewV2.prototype.updateButtonsEnable = function()
{
	if (oFF.notNull(this.m_aiExplainBtn))
	{
		this.m_aiExplainBtn.setEnabled(this.m_explainEnabled && oFF.XStringUtils.isNotNullAndNotEmpty(this.m_codeEditorWidget.getView().getValue()));
	}
};
oFF.OuCalcCodeEditorViewV2.prototype.updateError = function(errors)
{
	this.m_errorsView.setErrors(errors);
	this.m_shouldFocus = true;
	this.m_hasError = errors.hasErrors();
	this.m_errorLayout.setVisible(false);
	this.setErrorsViewVisible(errors.hasErrors());
	this.setErrorState(errors.hasErrors());
	this.m_showErrorsTglBtn.setText(oFF.XInteger.convertToString(errors.getErrors().size()));
	this.m_showErrorsTglBtn.setVisible(errors.hasErrors());
	this.updateButtonsEnable();
};

oFF.OuCalcCodeEditorWidget = function() {};
oFF.OuCalcCodeEditorWidget.prototype = new oFF.DfUiWidget();
oFF.OuCalcCodeEditorWidget.prototype._ff_c = "OuCalcCodeEditorWidget";

oFF.OuCalcCodeEditorWidget.ARGUMENT_POSITION = "$1";
oFF.OuCalcCodeEditorWidget.CODE_TYPE = "plain_text";
oFF.OuCalcCodeEditorWidget.CTRL_KEY = "ControlLeft";
oFF.OuCalcCodeEditorWidget.EMPTY_STRING = "";
oFF.OuCalcCodeEditorWidget.FONT_FAMILY = "\"72Mono\", \"72Monofull\", lucida console, monospace";
oFF.OuCalcCodeEditorWidget.FONT_SIZE = "14px";
oFF.OuCalcCodeEditorWidget.HINT_PREFIX_IDENTIFIER_REGEX = "[\\[]";
oFF.OuCalcCodeEditorWidget.READONLY_CSS_NAME = "ffOuCalcCodeEditorWidgetDisabled";
oFF.OuCalcCodeEditorWidget.SPACE_KEY = "Space";
oFF.OuCalcCodeEditorWidget.START_AUTOCOMPLETE_COMMAND = "startAutocomplete";
oFF.OuCalcCodeEditorWidget.VALUE_OF_CODEEDITOR_KEY = "value";
oFF.OuCalcCodeEditorWidget.create = function(formulaPresentation, name)
{
	let instance = new oFF.OuCalcCodeEditorWidget();
	instance.m_formulaPresentation = formulaPresentation;
	instance.m_ctrlKeyPressed = false;
	instance.m_textChangeConsumers = oFF.XConsumerCollection.create();
	instance.m_cursorChangeConsumers = oFF.XConsumerCollection.create();
	instance.m_ctrlSpacePressedProcedures = oFF.XProcedureCollection.create();
	instance.m_name = name;
	return instance;
};
oFF.OuCalcCodeEditorWidget.prototype.m_ctrlKeyPressed = false;
oFF.OuCalcCodeEditorWidget.prototype.m_ctrlSpacePressedProcedures = null;
oFF.OuCalcCodeEditorWidget.prototype.m_cursorChangeConsumers = null;
oFF.OuCalcCodeEditorWidget.prototype.m_formulaPresentation = null;
oFF.OuCalcCodeEditorWidget.prototype.m_name = null;
oFF.OuCalcCodeEditorWidget.prototype.m_textChangeConsumers = null;
oFF.OuCalcCodeEditorWidget.prototype.addKeyboardHandlerToEditorFromModule = function()
{
	this.getEditor().runModule(oFF.FeKeyboardHandler.getModuleName());
};
oFF.OuCalcCodeEditorWidget.prototype.addOnChangeConsumer = function(consumer)
{
	return this.m_textChangeConsumers.addConsumer(consumer);
};
oFF.OuCalcCodeEditorWidget.prototype.addOnCursorChangeConsumer = function(consumer)
{
	return this.m_cursorChangeConsumers.addConsumer(consumer);
};
oFF.OuCalcCodeEditorWidget.prototype.announceUpdate = function()
{
	let text = oFF.XStringUtils.isNullOrEmpty(this.m_name) ? this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.EDITOR_ANNOUNCE_UPDATE) : this.getLocalization().getTextWithPlaceholder(oFF.OuCalcFormulaEditorI18n.EDITOR_NAMED_ANNOUNCE_UPDATE, this.m_name);
	oFF.UiFramework.currentFramework().announce(text, oFF.UiAriaLiveMode.ASSERTIVE);
};
oFF.OuCalcCodeEditorWidget.prototype.clear = function()
{
	this.setValue(null);
};
oFF.OuCalcCodeEditorWidget.prototype.destroyWidget = function()
{
	this.m_cursorChangeConsumers.clear();
	this.m_cursorChangeConsumers = oFF.XObjectExt.release(this.m_cursorChangeConsumers);
	this.m_textChangeConsumers.clear();
	this.m_textChangeConsumers = oFF.XObjectExt.release(this.m_textChangeConsumers);
	this.m_ctrlSpacePressedProcedures.clear();
	this.m_ctrlSpacePressedProcedures = oFF.XObjectExt.release(this.m_ctrlSpacePressedProcedures);
	oFF.FeCustomAceOverrides.create().reset();
};
oFF.OuCalcCodeEditorWidget.prototype.disableAutoCompletions = function()
{
	this.getEditor().removeCommand(oFF.OuCalcCodeEditorWidget.START_AUTOCOMPLETE_COMMAND, true);
};
oFF.OuCalcCodeEditorWidget.prototype.enableAutoCompletions = function()
{
	this.getEditor().addCommand(oFF.OuCalcCodeEditorWidget.START_AUTOCOMPLETE_COMMAND);
};
oFF.OuCalcCodeEditorWidget.prototype.focus = function()
{
	this.getEditor().focus();
};
oFF.OuCalcCodeEditorWidget.prototype.formatEditorText = function()
{
	let formula = oFF.FeFormula.createWithDisplayFormula(this.getEditor().getValue(), this.m_formulaPresentation);
	let formattedString = oFF.OuCalcFormulaFormatter.create().formatFormula(formula.getText());
	this.setFormula(oFF.FeFormula.create(formattedString, this.m_formulaPresentation));
};
oFF.OuCalcCodeEditorWidget.prototype.getEditor = function()
{
	return this.getView();
};
oFF.OuCalcCodeEditorWidget.prototype.getFormula = function()
{
	return oFF.FeFormula.createWithDisplayFormula(this.getEditor().getValue(), this.m_formulaPresentation);
};
oFF.OuCalcCodeEditorWidget.prototype.getLocalization = function()
{
	return oFF.OuCalcFormulaEditorI18n.getLocalization();
};
oFF.OuCalcCodeEditorWidget.prototype.getWidgetControl = function(genesis)
{
	let editor = genesis.newControl(oFF.UiType.CODE_EDITOR);
	editor.addCssClass("ffOuCalcCodeEditorWidget");
	editor.setWidth(null);
	return editor;
};
oFF.OuCalcCodeEditorWidget.prototype.insertText = function(text)
{
	oFF.XObjectExt.assertStringNotNullAndNotEmpty(text);
	let presentationText = this.m_formulaPresentation.getDisplayText(text);
	let currentCursorPosition = this.getEditor().getCursorPosition();
	let cursorOffset = oFF.XString.indexOf(presentationText, oFF.OuCalcCodeEditorWidget.ARGUMENT_POSITION);
	if (cursorOffset === -1)
	{
		cursorOffset = oFF.XString.size(presentationText);
	}
	this.getEditor().insertText(oFF.XString.replace(presentationText, oFF.OuCalcCodeEditorWidget.ARGUMENT_POSITION, oFF.OuCalcCodeEditorWidget.EMPTY_STRING)).setCursorPosition(oFF.UiCursorPosition.create(currentCursorPosition.getRow(), currentCursorPosition.getColumn() + cursorOffset));
	this.focus();
	this.announceUpdate();
};
oFF.OuCalcCodeEditorWidget.prototype.layoutWidget = function(widgetControl)
{
	widgetControl.setCodeType(oFF.OuCalcCodeEditorWidget.CODE_TYPE);
	widgetControl.useMaxSpace();
	widgetControl.setFontSize(oFF.UiCssLength.create(oFF.OuCalcCodeEditorWidget.FONT_SIZE));
	widgetControl.setFontFamily(oFF.OuCalcCodeEditorWidget.FONT_FAMILY);
	widgetControl.registerOnLiveChange(oFF.UiLambdaLiveChangeListener.create((eventOnLive) => {
		let formula = eventOnLive.getParameters().getStringByKeyExt(oFF.OuCalcCodeEditorWidget.VALUE_OF_CODEEDITOR_KEY, "");
		this.m_textChangeConsumers.accept(oFF.FeFormula.createWithDisplayFormula(formula, this.m_formulaPresentation));
	}));
	widgetControl.registerOnCursorChange(oFF.UiLambdaCursorChangeListener.create((eventOnCursor) => {
		this.m_cursorChangeConsumers.accept(this.getEditor().getCursorPosition());
	}));
	widgetControl.registerOnKeyDown(oFF.UiLambdaKeyDownListener.create((onKeyDownEvent) => {
		if (oFF.XString.isEqual(onKeyDownEvent.getCode(), oFF.OuCalcCodeEditorWidget.CTRL_KEY) && !this.m_ctrlKeyPressed)
		{
			this.m_ctrlKeyPressed = true;
		}
		else
		{
			if (oFF.XString.isEqual(onKeyDownEvent.getCode(), oFF.OuCalcCodeEditorWidget.SPACE_KEY))
			{
				if (this.m_ctrlKeyPressed)
				{
					this.m_ctrlKeyPressed = false;
					this.m_ctrlSpacePressedProcedures.execute();
				}
			}
		}
	}));
	widgetControl.registerOnKeyUp(oFF.UiLambdaKeyUpListener.create((onKeyUpEvent) => {
		if (oFF.XString.isEqual(onKeyUpEvent.getCode(), oFF.OuCalcCodeEditorWidget.CTRL_KEY))
		{
			this.m_ctrlKeyPressed = false;
		}
	}));
	oFF.FeCustomAceOverrides.create().apply();
};
oFF.OuCalcCodeEditorWidget.prototype.openHintsList = function()
{
	if (this.getEditor().getCustomCompleter() !== null && this.getEditor().getCustomCompleter().getCompletions().hasElements())
	{
		this.getEditor().executeCommand(oFF.OuCalcCodeEditorWidget.START_AUTOCOMPLETE_COMMAND);
	}
};
oFF.OuCalcCodeEditorWidget.prototype.setBusy = function(busy)
{
	this.getEditor().setBusy(busy);
};
oFF.OuCalcCodeEditorWidget.prototype.setCtrlSpacePressedProcedure = function(procedure)
{
	this.m_ctrlSpacePressedProcedures.addProcedure(procedure);
};
oFF.OuCalcCodeEditorWidget.prototype.setCursorPosition = function(cursorPosition)
{
	this.getEditor().setCursorPosition(cursorPosition);
};
oFF.OuCalcCodeEditorWidget.prototype.setCustomCompleterJson = function(completions)
{
	let patterns = oFF.PrList.create();
	patterns.add(oFF.PrString.createWithValue(oFF.OuCalcCodeEditorWidget.HINT_PREFIX_IDENTIFIER_REGEX));
	this.getEditor().setCustomCompleter(oFF.UiCustomCompleter.create(completions, patterns));
};
oFF.OuCalcCodeEditorWidget.prototype.setCustomMode = function(mode)
{
	this.getEditor().setCodeType(mode);
};
oFF.OuCalcCodeEditorWidget.prototype.setEditable = function(editable)
{
	this.getEditor().setEditable(editable);
	if (editable)
	{
		this.getEditor().removeCssClass(oFF.OuCalcCodeEditorWidget.READONLY_CSS_NAME);
	}
	else
	{
		this.getEditor().addCssClass(oFF.OuCalcCodeEditorWidget.READONLY_CSS_NAME);
	}
};
oFF.OuCalcCodeEditorWidget.prototype.setEditorValue = function(value)
{
	this.getEditor().setValue(value);
};
oFF.OuCalcCodeEditorWidget.prototype.setFormula = function(formula)
{
	this.setValue(formula.getDisplayText());
};
oFF.OuCalcCodeEditorWidget.prototype.setValue = function(value)
{
	this.setEditorValue(value);
	this.focus();
	this.announceUpdate();
};
oFF.OuCalcCodeEditorWidget.prototype.setupWidget = function() {};

oFF.OuCalcDisplayTypeWidget = function() {};
oFF.OuCalcDisplayTypeWidget.prototype = new oFF.DfUiWidget();
oFF.OuCalcDisplayTypeWidget.prototype._ff_c = "OuCalcDisplayTypeWidget";

oFF.OuCalcDisplayTypeWidget.DISPLAY_OPTION_MENU_BUTTON_ICON = "display";
oFF.OuCalcDisplayTypeWidget.DISPLAY_OPTION_SELECTED_ICON = "accept";
oFF.OuCalcDisplayTypeWidget.create = function()
{
	let instance = new oFF.OuCalcDisplayTypeWidget();
	instance.m_displayType = oFF.QueryPresentationUtils.DESCRIPTION;
	return instance;
};
oFF.OuCalcDisplayTypeWidget.prototype.m_displayType = null;
oFF.OuCalcDisplayTypeWidget.prototype.m_displayTypeMenu = null;
oFF.OuCalcDisplayTypeWidget.prototype.m_onDisplayTypeChanged = null;
oFF.OuCalcDisplayTypeWidget.prototype.addDisplayOptionMenuItem = function(i18nText, displayOption)
{
	this.m_displayTypeMenu.addNewItem().setText(this.getLocalization().getText(i18nText)).setCustomObject(displayOption).registerOnPress(this.getDisplayOptionMenuItemPressListener());
};
oFF.OuCalcDisplayTypeWidget.prototype.destroyWidget = function()
{
	this.m_displayType = null;
	this.m_displayTypeMenu = null;
	this.m_onDisplayTypeChanged = null;
};
oFF.OuCalcDisplayTypeWidget.prototype.getDisplayOptionMenuItemPressListener = function()
{
	return oFF.UiLambdaPressListener.create((controlEvent) => {
		let menuItem = controlEvent.getControl();
		this.setDisplayType(menuItem.getCustomObject());
		this.m_onDisplayTypeChanged(this.m_displayType);
	});
};
oFF.OuCalcDisplayTypeWidget.prototype.getLocalization = function()
{
	return oFF.XLocalizationCenter.getCenter();
};
oFF.OuCalcDisplayTypeWidget.prototype.getWidgetControl = function(genesis)
{
	let button = genesis.newControl(oFF.UiType.MENU_BUTTON);
	button.addCssClass("ffFeDisplayOption");
	button.setIcon(oFF.OuCalcDisplayTypeWidget.DISPLAY_OPTION_MENU_BUTTON_ICON);
	button.setTooltip(this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.DISPLAY_OPTIONS));
	button.setButtonType(oFF.UiButtonType.TRANSPARENT);
	return button;
};
oFF.OuCalcDisplayTypeWidget.prototype.layoutWidget = function(widgetControl)
{
	this.m_displayTypeMenu = this.getGenesis().newControl(oFF.UiType.MENU);
	this.m_displayTypeMenu.addCssClass("ffFeDisplayOptionMenu");
	this.addDisplayOptionMenuItem(oFF.OuCalcFormulaEditorI18n.DISPLAY_OPTIONS_DESCRIPTION, oFF.QueryPresentationUtils.DESCRIPTION);
	this.addDisplayOptionMenuItem(oFF.OuCalcFormulaEditorI18n.DISPLAY_OPTIONS_ID, oFF.QueryPresentationUtils.ID);
	this.addDisplayOptionMenuItem(oFF.OuCalcFormulaEditorI18n.DISPLAY_OPTIONS_ID_AND_DESCRIPTION, oFF.QueryPresentationUtils.ID_AND_DESCRIPTION);
	this.addDisplayOptionMenuItem(oFF.OuCalcFormulaEditorI18n.DISPLAY_OPTIONS_DESCRIPTION_AND_ID, oFF.QueryPresentationUtils.DESCRIPTION_AND_ID);
	widgetControl.setMenu(this.m_displayTypeMenu);
	this.updatedSelectedMenuItem();
};
oFF.OuCalcDisplayTypeWidget.prototype.setDisplayType = function(displayType)
{
	oFF.XObjectExt.assertNotNull(displayType);
	if (displayType !== this.m_displayType)
	{
		this.m_displayType = displayType;
		this.updatedSelectedMenuItem();
	}
};
oFF.OuCalcDisplayTypeWidget.prototype.setOnDisplayTypeChanged = function(onDisplayTypeChanged)
{
	this.m_onDisplayTypeChanged = onDisplayTypeChanged;
};
oFF.OuCalcDisplayTypeWidget.prototype.setupWidget = function() {};
oFF.OuCalcDisplayTypeWidget.prototype.updatedSelectedMenuItem = function()
{
	oFF.XStream.of(this.m_displayTypeMenu.getItems()).forEach((uiControl) => {
		let menuItem = uiControl;
		if (menuItem.getCustomObject() === this.m_displayType)
		{
			menuItem.setIcon(oFF.OuCalcDisplayTypeWidget.DISPLAY_OPTION_SELECTED_ICON).setSelected(true);
		}
		else
		{
			menuItem.setIcon(null).setSelected(false);
		}
	});
};

oFF.OuCalcFormulaElementListContentView = function() {};
oFF.OuCalcFormulaElementListContentView.prototype = new oFF.DfUiContentView();
oFF.OuCalcFormulaElementListContentView.prototype._ff_c = "OuCalcFormulaElementListContentView";

oFF.OuCalcFormulaElementListContentView.prototype.m_debouncingSearchMs = 0;
oFF.OuCalcFormulaElementListContentView.prototype.m_enableSearch = false;
oFF.OuCalcFormulaElementListContentView.prototype.m_header = null;
oFF.OuCalcFormulaElementListContentView.prototype.m_mainLayout = null;
oFF.OuCalcFormulaElementListContentView.prototype.m_noItemsIllustratedMsg = null;
oFF.OuCalcFormulaElementListContentView.prototype.m_onSelectConsumers = null;
oFF.OuCalcFormulaElementListContentView.prototype.m_panelWidgetList = null;
oFF.OuCalcFormulaElementListContentView.prototype.m_panelsLayout = null;
oFF.OuCalcFormulaElementListContentView.prototype.m_searchField = null;
oFF.OuCalcFormulaElementListContentView.prototype.addOnSelectConsumer = function(consumer)
{
	return this.m_onSelectConsumers.addConsumer(consumer);
};
oFF.OuCalcFormulaElementListContentView.prototype.addPanel = function(panel)
{
	this.m_panelWidgetList.add(panel);
};
oFF.OuCalcFormulaElementListContentView.prototype.announceUpdate = function()
{
	oFF.UiFramework.currentFramework().announce(this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.TAB_OBJECTS_ANNOUNCE_UPDATE), oFF.UiAriaLiveMode.ASSERTIVE);
};
oFF.OuCalcFormulaElementListContentView.prototype.buildViewUi = function(genesis)
{
	this.m_mainLayout = genesis.newRoot(oFF.UiType.FLEX_LAYOUT);
	this.m_mainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_mainLayout.addCssClass("ffFeElementListPanel");
	this.m_header = this.m_mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_header.setDirection(oFF.UiFlexDirection.ROW);
	this.m_header.addCssClass("ffFeElementListPanelHeader");
	if (this.m_enableSearch)
	{
		this.m_searchField = this.m_header.addNewItemOfType(oFF.UiType.SEARCH_FIELD);
		if (this.m_debouncingSearchMs > 0)
		{
			this.m_searchField.registerOnLiveChange(oFF.UiLambdaLiveChangeWithDebounceListener.create((searchControlEvent) => {
				this.filterItems();
			}, this.m_debouncingSearchMs));
		}
		else
		{
			this.m_searchField.registerOnLiveChange(oFF.UiLambdaLiveChangeListener.create((searchControlEvent) => {
				this.filterItems();
			}));
		}
		this.m_searchField.registerOnSearch(oFF.UiLambdaSearchListener.create((searchControlEvent) => {
			this.filterItems();
		}));
		this.m_searchField.addCssClass("ffFeElementListPanelSearch");
		this.m_noItemsIllustratedMsg = this.m_mainLayout.addNewItemOfType(oFF.UiType.ILLUSTRATED_MESSAGE);
		this.m_noItemsIllustratedMsg.addCssClass("ffFeElementListPanelNoItemsMsg");
		this.m_noItemsIllustratedMsg.setEnableDefaultTitleAndDescription(false);
		this.m_noItemsIllustratedMsg.setIllustrationType(oFF.UiIllustratedMessageType.NO_SEARCH_RESULTS);
		this.m_noItemsIllustratedMsg.setIllustrationSize(oFF.UiIllustratedMessageSize.AUTO);
		this.m_noItemsIllustratedMsg.setTitle(this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.LEFT_PANEL_NO_DATA_TITLE));
		this.m_noItemsIllustratedMsg.setDescription(this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.LEFT_PANEL_NO_DATA_DESCRIPTION));
		this.m_noItemsIllustratedMsg.setVisible(false);
	}
	this.m_panelsLayout = this.m_mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_panelsLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_panelsLayout.addCssClass("ffFeElementListPanelContent");
	this.buildUI();
	if (!this.m_header.hasItems())
	{
		this.m_header.setVisible(false);
	}
};
oFF.OuCalcFormulaElementListContentView.prototype.destroyView = function()
{
	this.m_searchField = null;
	this.m_noItemsIllustratedMsg = null;
	this.m_header = null;
	this.m_panelsLayout = null;
	this.m_mainLayout = null;
	this.m_onSelectConsumers.clear();
	this.m_onSelectConsumers = oFF.XObjectExt.release(this.m_onSelectConsumers);
	this.m_panelWidgetList.clear();
	this.m_panelWidgetList = oFF.XObjectExt.release(this.m_panelWidgetList);
};
oFF.OuCalcFormulaElementListContentView.prototype.filterItems = function()
{
	oFF.XStream.of(this.m_panelWidgetList).forEach((panelWidgetToFilter) => {
		panelWidgetToFilter.filterItems(this.m_searchField.getValue());
	});
	this.updateNoItemsIllustratedMessageVisibility();
	this.announceUpdate();
};
oFF.OuCalcFormulaElementListContentView.prototype.getLocalization = function()
{
	return oFF.XLocalizationCenter.getCenter();
};
oFF.OuCalcFormulaElementListContentView.prototype.onSelectConsumer = function(str)
{
	this.m_onSelectConsumers.accept(str);
};
oFF.OuCalcFormulaElementListContentView.prototype.setVisible = function(visible)
{
	this.getView().setVisible(visible);
};
oFF.OuCalcFormulaElementListContentView.prototype.setupInternal = function(enableSearch)
{
	this.m_enableSearch = enableSearch;
	this.m_debouncingSearchMs = 0;
	this.m_onSelectConsumers = oFF.XConsumerCollection.create();
	this.m_panelWidgetList = oFF.XList.create();
};
oFF.OuCalcFormulaElementListContentView.prototype.setupView = function() {};
oFF.OuCalcFormulaElementListContentView.prototype.updateNoItemsIllustratedMessageVisibility = function()
{
	let noItemsVisible = !oFF.XStream.of(this.m_panelWidgetList).anyMatch((panelWidget) => {
		return panelWidget.hasVisibleItems();
	});
	this.m_panelsLayout.setVisible(!noItemsVisible);
	this.m_noItemsIllustratedMsg.setVisible(noItemsVisible);
};

oFF.OuCalcFormulaElementListSidePanelView = function() {};
oFF.OuCalcFormulaElementListSidePanelView.prototype = new oFF.DfUiContentView();
oFF.OuCalcFormulaElementListSidePanelView.prototype._ff_c = "OuCalcFormulaElementListSidePanelView";

oFF.OuCalcFormulaElementListSidePanelView.create = function()
{
	let instance = new oFF.OuCalcFormulaElementListSidePanelView();
	instance.m_onPressConsumers = oFF.XConsumerCollection.create();
	return instance;
};
oFF.OuCalcFormulaElementListSidePanelView.prototype.m_expandIcon = null;
oFF.OuCalcFormulaElementListSidePanelView.prototype.m_onPressConsumers = null;
oFF.OuCalcFormulaElementListSidePanelView.prototype.addOnPressConsumer = function(consumer)
{
	return this.m_onPressConsumers.addConsumer(consumer);
};
oFF.OuCalcFormulaElementListSidePanelView.prototype.buildViewUi = function(genesis)
{
	let mainLayout = genesis.newRoot(oFF.UiType.FLEX_LAYOUT);
	mainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	mainLayout.addCssClass("sapMIBar");
	mainLayout.addCssClass("ffOuCalcFormulaElementListSidePanel");
	this.m_expandIcon = this.newItem(oFF.OuCalcFormulaElementListConst.EXPAND_NAME, oFF.OuCalcFormulaElementListConst.EXPAND_ICON, this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FE_BTN_EXPAND));
	let fxsIcon = this.newItem(oFF.OuCalcFormulaElementListConst.FUNCTIONS_NAME, oFF.OuCalcFormulaElementListConst.FUNCTIONS_ICON, oFF.OuCalcFormulaElementListConst.getFunctionTooltip());
	let objectsIcon = this.newItem(oFF.OuCalcFormulaElementListConst.OBJECTS_NAME, oFF.OuCalcFormulaElementListConst.OBJECTS_ICON, oFF.OuCalcFormulaElementListConst.getObjectsTooltip());
	let operatorsIcon = this.newItem(oFF.OuCalcFormulaElementListConst.OPERATORS_NAME, oFF.OuCalcFormulaElementListConst.OPERATIONS_ICON, oFF.OuCalcFormulaElementListConst.getOperatorsTooltip());
	mainLayout.addItem(this.m_expandIcon);
	mainLayout.addItem(objectsIcon);
	mainLayout.addItem(fxsIcon);
	mainLayout.addItem(operatorsIcon);
};
oFF.OuCalcFormulaElementListSidePanelView.prototype.destroyView = function()
{
	this.m_onPressConsumers = oFF.XObjectExt.release(this.m_onPressConsumers);
};
oFF.OuCalcFormulaElementListSidePanelView.prototype.focus = function()
{
	this.m_expandIcon.focus();
};
oFF.OuCalcFormulaElementListSidePanelView.prototype.getLocalization = function()
{
	return oFF.OuCalcFormulaEditorI18n.getLocalization();
};
oFF.OuCalcFormulaElementListSidePanelView.prototype.newItem = function(itemName, icon, tooltip)
{
	let item = this.getGenesis().newControl(oFF.UiType.BUTTON);
	item.addAttribute(oFF.OuCalcFormulaElementListConst.ATTRIBUTE_NAME, itemName);
	item.setButtonType(oFF.UiButtonType.TRANSPARENT);
	item.addCssClass("ffFeSidePanelItem");
	item.setIcon(icon);
	item.setTooltip(tooltip);
	item.registerOnPress(oFF.UiLambdaPressListener.create((controlEvent) => {
		this.m_onPressConsumers.accept(itemName);
	}));
	return item;
};
oFF.OuCalcFormulaElementListSidePanelView.prototype.setVisible = function(visible)
{
	this.getView().setVisible(visible);
};
oFF.OuCalcFormulaElementListSidePanelView.prototype.setupView = function() {};

oFF.OuCalcFormulaElementListView = function() {};
oFF.OuCalcFormulaElementListView.prototype = new oFF.DfUiContentView();
oFF.OuCalcFormulaElementListView.prototype._ff_c = "OuCalcFormulaElementListView";

oFF.OuCalcFormulaElementListView.create = function(formulaItems, datasource, feConfiguration, preferences, variableManager)
{
	let instance = new oFF.OuCalcFormulaElementListView();
	oFF.XObjectExt.assertNotNullExt(formulaItems, "Formula Items Provider null!");
	oFF.XObjectExt.assertNotNullExt(datasource, "Datasource Provider null!");
	oFF.XObjectExt.assertNotNullExt(feConfiguration, "Configuration null!");
	instance.m_formulaItems = oFF.XObjectExt.assertNotNull(formulaItems);
	instance.m_datasource = oFF.XObjectExt.assertNotNull(datasource);
	instance.m_feConfiguration = feConfiguration;
	instance.m_onSelectConsumers = oFF.XConsumerCollection.create();
	instance.m_onCollapseConsumers = oFF.XConsumerCollection.create();
	instance.m_preferences = oFF.XObjectExt.assertNotNull(preferences);
	instance.m_variableManager = variableManager;
	return instance;
};
oFF.OuCalcFormulaElementListView.prototype.m_calcOpView = null;
oFF.OuCalcFormulaElementListView.prototype.m_datasource = null;
oFF.OuCalcFormulaElementListView.prototype.m_feConfiguration = null;
oFF.OuCalcFormulaElementListView.prototype.m_formulaItems = null;
oFF.OuCalcFormulaElementListView.prototype.m_funcView = null;
oFF.OuCalcFormulaElementListView.prototype.m_objView = null;
oFF.OuCalcFormulaElementListView.prototype.m_onCollapseConsumers = null;
oFF.OuCalcFormulaElementListView.prototype.m_onSelectConsumers = null;
oFF.OuCalcFormulaElementListView.prototype.m_preferences = null;
oFF.OuCalcFormulaElementListView.prototype.m_sidePanel = null;
oFF.OuCalcFormulaElementListView.prototype.m_variableManager = null;
oFF.OuCalcFormulaElementListView.prototype.m_variablesView = null;
oFF.OuCalcFormulaElementListView.prototype.addFunctionPanelItem = function()
{
	let funcPanelItem = this.m_sidePanel.addNewItem();
	funcPanelItem.setText(oFF.OuCalcFormulaElementListConst.getFunctionTooltip());
	funcPanelItem.addAttribute(oFF.OuCalcFormulaElementListConst.ATTRIBUTE_NAME, oFF.OuCalcFormulaElementListConst.FUNCTIONS_NAME);
	funcPanelItem.setIcon(oFF.OuCalcFormulaElementListConst.FUNCTIONS_ICON);
	funcPanelItem.setTooltip(oFF.OuCalcFormulaElementListConst.getFunctionTooltip());
	this.m_funcView = oFF.OuCalcFunctionsView.create(this.m_formulaItems);
	this.m_funcView.renderView(this.getGenesis());
	funcPanelItem.setContent(this.m_funcView.getView());
};
oFF.OuCalcFormulaElementListView.prototype.addObjectsPanelItem = function()
{
	let objViewPanelItem = this.m_sidePanel.addNewItem();
	objViewPanelItem.setText(oFF.OuCalcFormulaElementListConst.getObjectsTooltip());
	objViewPanelItem.addAttribute(oFF.OuCalcFormulaElementListConst.ATTRIBUTE_NAME, oFF.OuCalcFormulaElementListConst.OBJECTS_NAME);
	objViewPanelItem.setIcon(oFF.OuCalcFormulaElementListConst.OBJECTS_ICON);
	objViewPanelItem.setTooltip(oFF.OuCalcFormulaElementListConst.getObjectsTooltip());
	this.m_objView = oFF.OuCalcObjectsView.create(this.m_datasource, this.m_feConfiguration, this.m_preferences.isModelPrefixEnabled());
	this.m_objView.renderView(this.getGenesis());
	objViewPanelItem.setContent(this.m_objView.getView());
};
oFF.OuCalcFormulaElementListView.prototype.addOnCollapseConsumer = function(consumer)
{
	return this.m_onCollapseConsumers.addConsumer(consumer);
};
oFF.OuCalcFormulaElementListView.prototype.addOnDisplayOptionPressedConsumer = function(consumer)
{
	if (this.m_preferences.isVariableSupportEnabled())
	{
		this.m_variablesView.addOnDisplayOptionPressedConsumer(consumer);
	}
	return this.m_objView.addOnDisplayOptionPressedConsumer(consumer);
};
oFF.OuCalcFormulaElementListView.prototype.addOnSelectConsumer = function(consumer)
{
	return this.m_onSelectConsumers.addConsumer(consumer);
};
oFF.OuCalcFormulaElementListView.prototype.addOnSelectFormulaItemConsumer = function(consumer)
{
	return this.m_funcView.addOnSelectFormulaItemConsumer(consumer);
};
oFF.OuCalcFormulaElementListView.prototype.addOnVariablesUpdatedProcedure = function(procedure)
{
	if (this.m_preferences.isVariableSupportEnabled())
	{
		return this.m_variablesView.addOnVariablesUpdatedProcedure(procedure);
	}
	return null;
};
oFF.OuCalcFormulaElementListView.prototype.addOperatorsPanelItem = function()
{
	let calcOpViewPanelItem = this.m_sidePanel.addNewItem();
	calcOpViewPanelItem.setText(oFF.OuCalcFormulaElementListConst.getOperatorsTooltip());
	calcOpViewPanelItem.addAttribute(oFF.OuCalcFormulaElementListConst.ATTRIBUTE_NAME, oFF.OuCalcFormulaElementListConst.OPERATORS_NAME);
	calcOpViewPanelItem.setIcon(oFF.OuCalcFormulaElementListConst.OPERATIONS_ICON);
	calcOpViewPanelItem.setTooltip(oFF.OuCalcFormulaElementListConst.getOperatorsTooltip());
	this.m_calcOpView = oFF.OuCalcOperatorsView.create(this.m_formulaItems);
	this.m_calcOpView.renderView(this.getGenesis());
	calcOpViewPanelItem.setContent(this.m_calcOpView.getView());
};
oFF.OuCalcFormulaElementListView.prototype.addVariablesPanelItem = function()
{
	let variablesViewPanelItem = this.m_sidePanel.addNewItem();
	variablesViewPanelItem.setText(oFF.OuCalcFormulaElementListConst.getVariablesTooltip());
	variablesViewPanelItem.addAttribute(oFF.OuCalcFormulaElementListConst.ATTRIBUTE_NAME, oFF.OuCalcFormulaElementListConst.VARIABLES_NAME);
	variablesViewPanelItem.setIcon(oFF.OuCalcFormulaElementListConst.VARIABLES_ICON);
	variablesViewPanelItem.setTooltip(oFF.OuCalcFormulaElementListConst.getVariablesTooltip());
	this.m_variablesView = oFF.OuCalcVariablesView.create(this.m_variableManager);
	this.m_variablesView.renderView(this.getGenesis());
	variablesViewPanelItem.setContent(this.m_variablesView.getView());
};
oFF.OuCalcFormulaElementListView.prototype.buildViewUi = function(genesis)
{
	this.m_sidePanel = genesis.newRoot(oFF.UiType.SIDE_PANEL);
	this.m_sidePanel.addCssClass("ffOuCalcFormulaElementListView");
	this.m_sidePanel.setSidePanelPosition(oFF.UiSidePanelPosition.LEFT);
	this.m_sidePanel.registerOnToggle(oFF.UiLambdaToggleListener.create((event) => {
		let item = event.getAffectedItem();
		if (oFF.notNull(item))
		{
			this.m_onCollapseConsumers.accept(oFF.XBooleanValue.create(!event.getParameters().getBooleanByKey("expanded")));
		}
	}));
	this.addFunctionPanelItem();
	this.addObjectsPanelItem();
	this.addOperatorsPanelItem();
	if (this.m_preferences.isVariableSupportEnabled())
	{
		this.addVariablesPanelItem();
	}
	this.m_objView.addOnSelectConsumer((selectedMember) => {
		this.m_onSelectConsumers.accept(selectedMember);
	});
	this.m_calcOpView.addOnSelectConsumer((selectedMember) => {
		this.m_onSelectConsumers.accept(selectedMember);
	});
	this.m_funcView.addOnSelectConsumer((selectedMember) => {
		this.m_onSelectConsumers.accept(selectedMember);
	});
	if (this.m_preferences.isVariableSupportEnabled())
	{
		this.m_variablesView.addOnSelectConsumer((selectedMember) => {
			this.m_onSelectConsumers.accept(selectedMember);
		});
	}
};
oFF.OuCalcFormulaElementListView.prototype.destroyView = function()
{
	this.m_formulaItems = null;
	this.m_preferences = null;
	this.m_datasource = null;
	this.m_sidePanel = null;
	this.m_onSelectConsumers.clear();
	this.m_onSelectConsumers = oFF.XObjectExt.release(this.m_onSelectConsumers);
	this.m_onCollapseConsumers.clear();
	this.m_onCollapseConsumers = oFF.XObjectExt.release(this.m_onCollapseConsumers);
	this.m_objView = oFF.XObjectExt.release(this.m_objView);
	this.m_funcView = oFF.XObjectExt.release(this.m_funcView);
	this.m_calcOpView = oFF.XObjectExt.release(this.m_calcOpView);
};
oFF.OuCalcFormulaElementListView.prototype.setCollapsed = function(collapsed)
{
	if (!collapsed)
	{
		this.m_sidePanel.setSelectedItemByIndex(0);
	}
	else
	{
		this.m_sidePanel.setExpanded(false);
	}
};
oFF.OuCalcFormulaElementListView.prototype.setDisplayType = function(displayType)
{
	this.m_objView.setDisplayType(displayType);
	if (this.m_preferences.isVariableSupportEnabled())
	{
		this.m_variablesView.setDisplayType(displayType);
	}
};
oFF.OuCalcFormulaElementListView.prototype.setupView = function() {};

oFF.OuCalcCustomTreeWidget = function() {};
oFF.OuCalcCustomTreeWidget.prototype = new oFF.DfUiWidget();
oFF.OuCalcCustomTreeWidget.prototype._ff_c = "OuCalcCustomTreeWidget";

oFF.OuCalcCustomTreeWidget.INITIAL_PADDING_LEFT_REM = 1;
oFF.OuCalcCustomTreeWidget.PADDING_LEFT_REM = 1;
oFF.OuCalcCustomTreeWidget.ROOT_DUMMY_NAME_ = "_CSTM_TREE_ROOT__";
oFF.OuCalcCustomTreeWidget.create = function()
{
	let instance = new oFF.OuCalcCustomTreeWidget();
	instance.m_root = oFF.OuCalcCustomTreeWidgetItem.createEmpty(oFF.OuCalcCustomTreeWidget.ROOT_DUMMY_NAME_);
	instance.m_onItemClickConsumers = oFF.XConsumerCollection.create();
	instance.m_onItemDblClickConsumers = oFF.XConsumerCollection.create();
	return instance;
};
oFF.OuCalcCustomTreeWidget.prototype.m_onItemClickConsumers = null;
oFF.OuCalcCustomTreeWidget.prototype.m_onItemDblClickConsumers = null;
oFF.OuCalcCustomTreeWidget.prototype.m_root = null;
oFF.OuCalcCustomTreeWidget.prototype._setChildrenVisibility = function(item, isVisiblePredicate)
{
	oFF.XStream.of(item.getChildren()).forEach((child) => {
		let childTreeItem = child.getUiItem();
		let visible = isVisiblePredicate(child);
		childTreeItem.setVisible(visible);
		if (child.isExpanded())
		{
			this._setChildrenVisibility(child, isVisiblePredicate);
		}
	});
};
oFF.OuCalcCustomTreeWidget.prototype.addItem = function(newItem)
{
	return this.m_root.addItem(newItem);
};
oFF.OuCalcCustomTreeWidget.prototype.addOnItemClick = function(consumer)
{
	return this.m_onItemClickConsumers.addConsumer(consumer);
};
oFF.OuCalcCustomTreeWidget.prototype.addOnItemDoubleClick = function(consumer)
{
	return this.m_onItemDblClickConsumers.addConsumer(consumer);
};
oFF.OuCalcCustomTreeWidget.prototype.applyToItems = function(consumer)
{
	this.m_root.applyToItems(consumer);
};
oFF.OuCalcCustomTreeWidget.prototype.createListItem = function(customTreeItem, customTreeItemParent, level)
{
	let listItem = this.getGenesis().newControl(oFF.UiType.CUSTOM_LIST_ITEM);
	listItem.setCustomObject(customTreeItem.getCustomObject());
	listItem.addCssClass("ffOuCustomTreeItem");
	if (customTreeItem.isEnabled())
	{
		listItem.setListItemType(oFF.UiListItemType.ACTIVE);
		listItem.registerOnPress(oFF.UiLambdaPressListener.create((clickEvent) => {
			this.m_onItemClickConsumers.accept(customTreeItem);
		}));
		listItem.registerOnDoubleClick(oFF.UiLambdaDoubleClickListener.create((doubleClickEvent) => {
			this.m_onItemDblClickConsumers.accept(customTreeItem);
		}));
	}
	else
	{
		listItem.setListItemType(oFF.UiListItemType.INACTIVE);
		listItem.addCssClass("ffOuCustomTreeItemDisabled");
	}
	listItem.addAttribute("item-level", oFF.XInteger.convertToString(level));
	listItem.addAttribute("item-name", customTreeItem.getName());
	listItem.setPadding(oFF.UiCssBoxEdges.create(this.generatePaddingByLevel(level)));
	if (customTreeItem.isRoot() || (oFF.notNull(customTreeItemParent) && customTreeItemParent === this.m_root))
	{
		listItem.addCssClass("ffOuCustomTreeItemRoot");
	}
	else if (oFF.notNull(customTreeItemParent))
	{
		listItem.addAttribute("item-parent", customTreeItemParent.getName());
	}
	else
	{
		listItem.addCssClass("ffOuCustomTreeItemOrphan");
	}
	listItem.addCssClass(customTreeItem.isLeaf() ? "ffOuCustomTreeItemLeaf" : "ffOuCustomTreeItemNode");
	return listItem;
};
oFF.OuCalcCustomTreeWidget.prototype.destroyWidget = function()
{
	this.m_root = oFF.XObjectExt.release(this.m_root);
	this.m_onItemClickConsumers = oFF.XObjectExt.release(this.m_onItemClickConsumers);
	this.m_onItemDblClickConsumers = oFF.XObjectExt.release(this.m_onItemDblClickConsumers);
};
oFF.OuCalcCustomTreeWidget.prototype.filterItems = function(visibilityPredicate)
{
	this.m_root.filterItems(visibilityPredicate);
	this.updateChildrenVisibility(this.m_root);
};
oFF.OuCalcCustomTreeWidget.prototype.generatePaddingByLevel = function(level)
{
	let paddingLeft = (oFF.OuCalcCustomTreeWidget.PADDING_LEFT_REM * level) + oFF.OuCalcCustomTreeWidget.INITIAL_PADDING_LEFT_REM;
	return oFF.XStringUtils.concatenate3("0rem 0rem 0rem ", oFF.XDouble.convertToString(paddingLeft), "rem");
};
oFF.OuCalcCustomTreeWidget.prototype.getChildren = function()
{
	return this.m_root.getChildren();
};
oFF.OuCalcCustomTreeWidget.prototype.getContent = function()
{
	return this.m_root.getContent();
};
oFF.OuCalcCustomTreeWidget.prototype.getCustomObject = function()
{
	return this.m_root.getCustomObject();
};
oFF.OuCalcCustomTreeWidget.prototype.getItemByName = function(name)
{
	return this.m_root.getItemByName(name);
};
oFF.OuCalcCustomTreeWidget.prototype.getName = function()
{
	return this.m_root.getName();
};
oFF.OuCalcCustomTreeWidget.prototype.getParent = function()
{
	return this.m_root.getParent();
};
oFF.OuCalcCustomTreeWidget.prototype.getUiItem = function()
{
	return null;
};
oFF.OuCalcCustomTreeWidget.prototype.getVisibleItems = function()
{
	return this.m_root.getVisibleItems();
};
oFF.OuCalcCustomTreeWidget.prototype.getWidgetControl = function(genesis)
{
	let list = genesis.newControl(oFF.UiType.LIST);
	list.addCssClass("ffOuCustomTreeWidget");
	return list;
};
oFF.OuCalcCustomTreeWidget.prototype.hasVisibleItems = function()
{
	return oFF.XStream.of(this.getView().getItems()).anyMatch((item) => {
		return item.isVisible();
	});
};
oFF.OuCalcCustomTreeWidget.prototype.isEnabled = function()
{
	return true;
};
oFF.OuCalcCustomTreeWidget.prototype.isExpanded = function()
{
	return this.m_root.isExpanded();
};
oFF.OuCalcCustomTreeWidget.prototype.isFiltered = function()
{
	return false;
};
oFF.OuCalcCustomTreeWidget.prototype.isLeaf = function()
{
	return this.m_root.isLeaf();
};
oFF.OuCalcCustomTreeWidget.prototype.isRoot = function()
{
	return true;
};
oFF.OuCalcCustomTreeWidget.prototype.layoutWidget = function(widgetControl)
{
	oFF.XStream.of(this.m_root.getChildren()).forEach((rootItem) => {
		this.renderTreeItem(rootItem, 0);
	});
	this.setItemExpanded(this.m_root, true);
};
oFF.OuCalcCustomTreeWidget.prototype.renderTreeItem = function(customTreeItem, level)
{
	let customTreeItemParent = customTreeItem.getParent().isPresent() ? customTreeItem.getParent().get() : null;
	let uiTreeItem = this.createListItem(customTreeItem, customTreeItemParent, level);
	this.getView().addItem(uiTreeItem);
	let listItemLayout = uiTreeItem.setNewContent(oFF.UiType.FLEX_LAYOUT);
	listItemLayout.addCssClass("ffOuCustomTreeItemLayout");
	listItemLayout.setDirection(oFF.UiFlexDirection.ROW);
	let expandBtn = listItemLayout.addNewItemOfType(oFF.UiType.BUTTON);
	expandBtn.setButtonType(oFF.UiButtonType.TRANSPARENT);
	expandBtn.addCssClass("ffOuCustomTreeItemExpand");
	expandBtn.setVisible(!customTreeItem.isLeaf());
	let content = customTreeItem.getContent();
	content.addCssClass("ffOuCustomTreeItemContent");
	listItemLayout.addItem(content);
	customTreeItem.setUiItem(uiTreeItem);
	if (!customTreeItem.isLeaf())
	{
		this.renderTreeItemChildren(customTreeItem, uiTreeItem, level);
		expandBtn.registerOnPress(oFF.UiLambdaPressListener.create((pressEvent) => {
			this.toggleItemExpanded(customTreeItem);
		}));
		this.setItemExpanded(customTreeItem, false);
	}
};
oFF.OuCalcCustomTreeWidget.prototype.renderTreeItemChildren = function(item, treeItem, level)
{
	let allChildrenLeaves = oFF.XBooleanValue.create(true);
	oFF.XStream.of(item.getChildren()).forEach((itemChild) => {
		allChildrenLeaves.setBoolean(allChildrenLeaves.getBoolean() && itemChild.isLeaf());
		this.renderTreeItem(itemChild, level + 1);
	});
	if (allChildrenLeaves.getBoolean())
	{
		treeItem.addCssClass("ffOuCustomTreeItemLastNode");
	}
};
oFF.OuCalcCustomTreeWidget.prototype.setChildrenVisibility = function(item, visible)
{
	this._setChildrenVisibility(item, (child) => {
		return visible && !child.isFiltered();
	});
};
oFF.OuCalcCustomTreeWidget.prototype.setContent = function(content)
{
	this.m_root.setContent(content);
};
oFF.OuCalcCustomTreeWidget.prototype.setExpanded = function(isExpanded)
{
	this.m_root.setExpanded(isExpanded);
};
oFF.OuCalcCustomTreeWidget.prototype.setFiltered = function(isFiltered)
{
	this.m_root.setFiltered(isFiltered);
};
oFF.OuCalcCustomTreeWidget.prototype.setItemExpanded = function(item, expanded)
{
	item.setExpanded(expanded);
	this.setChildrenVisibility(item, expanded);
	return item.isExpanded();
};
oFF.OuCalcCustomTreeWidget.prototype.setParent = function(parent)
{
	this.m_root.setParent(parent);
};
oFF.OuCalcCustomTreeWidget.prototype.setUiItem = function(uiTreeItem) {};
oFF.OuCalcCustomTreeWidget.prototype.setupWidget = function() {};
oFF.OuCalcCustomTreeWidget.prototype.toggleExpanded = function()
{
	return this.m_root.toggleExpanded();
};
oFF.OuCalcCustomTreeWidget.prototype.toggleItemExpanded = function(item)
{
	return this.setItemExpanded(item, item.toggleExpanded());
};
oFF.OuCalcCustomTreeWidget.prototype.updateChildrenVisibility = function(item)
{
	this._setChildrenVisibility(item, (child) => {
		return !child.isFiltered();
	});
};

oFF.OuAbstractCalcPanelWidget = function() {};
oFF.OuAbstractCalcPanelWidget.prototype = new oFF.DfUiWidget();
oFF.OuAbstractCalcPanelWidget.prototype._ff_c = "OuAbstractCalcPanelWidget";

oFF.OuAbstractCalcPanelWidget.prototype.m_consumersHandler = null;
oFF.OuAbstractCalcPanelWidget.prototype.m_displayOption = null;
oFF.OuAbstractCalcPanelWidget.prototype.m_hideIfEmpty = false;
oFF.OuAbstractCalcPanelWidget.prototype.m_lastTechnicalIdentifierSelected = null;
oFF.OuAbstractCalcPanelWidget.prototype.m_panelItems = null;
oFF.OuAbstractCalcPanelWidget.prototype.m_technicalIdentifierSelectedTimeoutId = null;
oFF.OuAbstractCalcPanelWidget.prototype._fireOnChange = function(elementKey)
{
	this.m_consumersHandler.fireEvent(oFF.UiEvent.ON_CHANGE.getName(), oFF.XStringValue.create(elementKey));
};
oFF.OuAbstractCalcPanelWidget.prototype._fireOnSelect = function(elementKey)
{
	this.m_consumersHandler.fireEvent(oFF.UiEvent.ON_SELECT.getName(), oFF.XStringValue.create(elementKey));
};
oFF.OuAbstractCalcPanelWidget.prototype.attachOnChange = function(consumer)
{
	this.m_consumersHandler.attachEventConsumer(oFF.UiEvent.ON_CHANGE.getName(), consumer);
};
oFF.OuAbstractCalcPanelWidget.prototype.attachOnSelect = function(consumer)
{
	this.m_consumersHandler.attachEventConsumer(oFF.UiEvent.ON_SELECT.getName(), consumer);
};
oFF.OuAbstractCalcPanelWidget.prototype.createListItem = function(panelItem)
{
	let listItem = this.getGenesis().newControl(oFF.UiType.CUSTOM_LIST_ITEM);
	listItem.setCustomObject(panelItem);
	listItem.addCssClass("ffFeListItem");
	if (panelItem.isEnabled())
	{
		listItem.setListItemType(oFF.UiListItemType.ACTIVE);
		listItem.registerOnPress(oFF.UiLambdaPressListener.create((clickEvent) => {
			this.fireOnChange(panelItem);
		}));
		listItem.registerOnDoubleClick(oFF.UiLambdaDoubleClickListener.create((doubleClickEvent) => {
			this.fireOnSelect(panelItem);
		}));
	}
	else
	{
		listItem.setListItemType(oFF.UiListItemType.INACTIVE);
		listItem.addCssClass("ffFeListItemDisabled");
	}
	listItem.setContent(this.createListItemContent(panelItem));
	return listItem;
};
oFF.OuAbstractCalcPanelWidget.prototype.createListItemButtons = function(panelItem)
{
	let listItemButtonsLayout = this.getGenesis().newControl(oFF.UiType.FLEX_LAYOUT);
	let listItemButton = listItemButtonsLayout.addNewItemOfType(oFF.UiType.BUTTON);
	listItemButton.setTooltip(oFF.XLocalizationCenter.getCenter().getText(oFF.XCommonI18n.ADD));
	listItemButton.setIcon("add");
	listItemButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
	listItemButton.addCssClass("ffFeItemAdd");
	listItemButton.registerOnPress(oFF.UiLambdaPressListener.create((pressEvent) => {
		this.handleLastTechnicalIdentifierSelectedPress(panelItem.getTechnicalIdentifier());
		this._fireOnSelect(panelItem.getTechnicalIdentifier());
	}));
	return listItemButtonsLayout;
};
oFF.OuAbstractCalcPanelWidget.prototype.createListItemContent = function(panelItem)
{
	let listItemLayout = this.getGenesis().newControl(oFF.UiType.FLEX_LAYOUT);
	listItemLayout.setDirection(oFF.UiFlexDirection.ROW);
	listItemLayout.setJustifyContent(oFF.UiFlexJustifyContent.SPACE_BETWEEN);
	listItemLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	listItemLayout.addAttribute("item-id", panelItem.getId());
	listItemLayout.addAttribute("item-name", panelItem.getDisplayName());
	listItemLayout.setTooltip(this.getTooltip(panelItem));
	listItemLayout.addCssClass("ffFeListItemContent");
	let listItemLabel = listItemLayout.addNewItemOfType(oFF.UiType.LABEL);
	listItemLabel.setText(this.getDisplayText(panelItem));
	listItemLabel.addCssClass("ffFeItemLabel");
	if (panelItem.isEnabled())
	{
		listItemLayout.addItem(this.createListItemButtons(panelItem));
	}
	return listItemLayout;
};
oFF.OuAbstractCalcPanelWidget.prototype.destroyWidget = function()
{
	this.m_panelItems = oFF.XObjectExt.release(this.m_panelItems);
	this.m_consumersHandler = oFF.XObjectExt.release(this.m_consumersHandler);
};
oFF.OuAbstractCalcPanelWidget.prototype.detachOnChange = function(consumer)
{
	this.m_consumersHandler.detachEventConsumer(oFF.UiEvent.ON_CHANGE.getName(), consumer);
};
oFF.OuAbstractCalcPanelWidget.prototype.detachOnSelect = function(consumer)
{
	this.m_consumersHandler.detachEventConsumer(oFF.UiEvent.ON_SELECT.getName(), consumer);
};
oFF.OuAbstractCalcPanelWidget.prototype.fireOnChange = function(panelItem)
{
	this._fireOnChange(panelItem.getDisplayName());
};
oFF.OuAbstractCalcPanelWidget.prototype.fireOnSelect = function(panelItem)
{
	if (!oFF.XString.isEqual(panelItem.getTechnicalIdentifier(), this.m_lastTechnicalIdentifierSelected))
	{
		this._fireOnSelect(panelItem.getTechnicalIdentifier());
	}
};
oFF.OuAbstractCalcPanelWidget.prototype.getConsumersOnChange = function()
{
	return this.m_consumersHandler.getEventConsumers(oFF.UiEvent.ON_CHANGE.getName());
};
oFF.OuAbstractCalcPanelWidget.prototype.getConsumersOnSelect = function()
{
	return this.m_consumersHandler.getEventConsumers(oFF.UiEvent.ON_SELECT.getName());
};
oFF.OuAbstractCalcPanelWidget.prototype.getDisplayText = function(panelItem)
{
	return panelItem.getDisplayText(this.m_displayOption);
};
oFF.OuAbstractCalcPanelWidget.prototype.getListItemLabel = function(control)
{
	let listItemLayout = control.getContent();
	return listItemLayout.getItem(0);
};
oFF.OuAbstractCalcPanelWidget.prototype.getTooltip = function(panelItem)
{
	let tooltip = oFF.XStringBuffer.create();
	tooltip.append(this.getDisplayText(panelItem));
	if (panelItem.getTooltip().isPresent())
	{
		tooltip.append(" - ");
		tooltip.append(panelItem.getTooltip().get());
	}
	return tooltip.toString();
};
oFF.OuAbstractCalcPanelWidget.prototype.handleLastTechnicalIdentifierSelectedPress = function(technicalIdentifier)
{
	if (oFF.XTimeout.getTimeLeftUntilExecution(this.m_technicalIdentifierSelectedTimeoutId) > 0)
	{
		oFF.XTimeout.clear(this.m_technicalIdentifierSelectedTimeoutId);
	}
	this.m_lastTechnicalIdentifierSelected = technicalIdentifier;
	this.m_technicalIdentifierSelectedTimeoutId = oFF.XTimeout.timeout(500, () => {
		this.m_lastTechnicalIdentifierSelected = null;
	});
};
oFF.OuAbstractCalcPanelWidget.prototype.isPanelItemVisible = function(calcPanelItem, text)
{
	return oFF.XStringUtils.isNullOrEmpty(text) || oFF.XString.containsString(oFF.XString.toUpperCase(calcPanelItem.getDisplayName()), oFF.XString.toUpperCase(text)) || oFF.XString.containsString(oFF.XString.toUpperCase(calcPanelItem.getId()), oFF.XString.toUpperCase(text));
};
oFF.OuAbstractCalcPanelWidget.prototype.setDisplayOption = function(displayOption)
{
	oFF.XObjectExt.assertNotNull(displayOption);
	if (this.m_displayOption !== displayOption)
	{
		this.m_displayOption = displayOption;
		this.updateListItemsText();
	}
};
oFF.OuAbstractCalcPanelWidget.prototype.setupInternalControl = function(panelItems, hideIfEmpty)
{
	oFF.XObjectExt.assertNotNull(panelItems);
	oFF.XCollectionUtils.forEach(panelItems, (item) => {
		oFF.XObjectExt.assertNotNull(item);
	});
	this.m_consumersHandler = oFF.SuEventConsumerHandler.create();
	this.m_panelItems = panelItems;
	this.m_displayOption = oFF.QueryPresentationUtils.DESCRIPTION;
	this.m_hideIfEmpty = hideIfEmpty;
};
oFF.OuAbstractCalcPanelWidget.prototype.setupWidget = function() {};
oFF.OuAbstractCalcPanelWidget.prototype.updateItemLabel = function(control, panelItem)
{
	let listItemLabel = this.getListItemLabel(control);
	listItemLabel.setText(this.getDisplayText(panelItem));
};

oFF.OlapUiCommonI18n = function() {};
oFF.OlapUiCommonI18n.prototype = new oFF.DfXLocalizationCommonsProvider();
oFF.OlapUiCommonI18n.prototype._ff_c = "OlapUiCommonI18n";

oFF.OlapUiCommonI18n.AXIS_COLUMNS = "FF_GDS_QB_AXIS_COLUMNS";
oFF.OlapUiCommonI18n.AXIS_ROWS = "FF_GDS_QB_AXIS_ROWS";
oFF.OlapUiCommonI18n.COMMON_ACCOUNT = "FF_GDS_QB_COMMON_ACCOUNT";
oFF.OlapUiCommonI18n.COMMON_MEASURES = "FF_GDS_QB_COMMON_MEASURES";
oFF.OlapUiCommonI18n.COMMON_MEMBER_WITHOUT_ID_TITLE = "FF_GDS_QB_MEMBER_WITHOUT_ID_TITLE";
oFF.OlapUiCommonI18n.COMMON_MORE = "FF_GDS_QB_COMMON_MORE";
oFF.OlapUiCommonI18n.COMMON_STRUCTURE = "FF_GDS_QB_COMMON_STRUCTURE";
oFF.OlapUiCommonI18n.PROVIDER_NAME = "OlapUiCommons";
oFF.OlapUiCommonI18n.staticSetup = function()
{
	let qbProvider = new oFF.OlapUiCommonI18n();
	qbProvider.setupProvider(oFF.OlapUiCommonI18n.PROVIDER_NAME, true);
	qbProvider.addText(oFF.OlapUiCommonI18n.AXIS_ROWS, "Rows");
	qbProvider.addComment(oFF.OlapUiCommonI18n.AXIS_ROWS, "#XTIT: The title of a section that contains all dimension of the row axis.");
	qbProvider.addText(oFF.OlapUiCommonI18n.AXIS_COLUMNS, "Columns");
	qbProvider.addComment(oFF.OlapUiCommonI18n.AXIS_COLUMNS, "#XTIT: The title of a section that contains all dimension of the column axis.");
	qbProvider.addText(oFF.OlapUiCommonI18n.COMMON_MEASURES, "Measures");
	qbProvider.addComment(oFF.OlapUiCommonI18n.COMMON_MEASURES, "#XTIT: The title of an element for the measure structure");
	qbProvider.addText(oFF.OlapUiCommonI18n.COMMON_STRUCTURE, "Structure");
	qbProvider.addComment(oFF.OlapUiCommonI18n.COMMON_STRUCTURE, "#XTIT: The title of an element for the second structure");
	qbProvider.addText(oFF.OlapUiCommonI18n.COMMON_ACCOUNT, "Accounts");
	qbProvider.addComment(oFF.OlapUiCommonI18n.COMMON_ACCOUNT, "#XTIT: The title of an element for the account dimension");
	qbProvider.addText(oFF.OlapUiCommonI18n.COMMON_MORE, "More");
	qbProvider.addComment(oFF.OlapUiCommonI18n.COMMON_MORE, "#XTOL: A tooltip of a button that offers additional options in the given context");
	qbProvider.addTextWithComment(oFF.OlapUiCommonI18n.COMMON_MEMBER_WITHOUT_ID_TITLE, "No Value", "#XTIT: A title for structure members that don't have an ID");
	return qbProvider;
};

oFF.VdOrcaScenario = function() {};
oFF.VdOrcaScenario.prototype = new oFF.XConstant();
oFF.VdOrcaScenario.prototype._ff_c = "VdOrcaScenario";

oFF.VdOrcaScenario.ANALYTIC_APP = null;
oFF.VdOrcaScenario.BOARD_ROOM = null;
oFF.VdOrcaScenario.LINKED_VARIABLE = null;
oFF.VdOrcaScenario.PLANNING_SEQUENCE = null;
oFF.VdOrcaScenario.SCHEDULING = null;
oFF.VdOrcaScenario.STORY = null;
oFF.VdOrcaScenario.s_lookup = null;
oFF.VdOrcaScenario.create = function(name)
{
	let scenario = oFF.XConstant.setupName(new oFF.VdOrcaScenario(), name);
	oFF.VdOrcaScenario.s_lookup.put(name, scenario);
	return scenario;
};
oFF.VdOrcaScenario.lookup = function(name)
{
	return oFF.VdOrcaScenario.s_lookup.getByKey(name);
};
oFF.VdOrcaScenario.staticSetup = function()
{
	oFF.VdOrcaScenario.s_lookup = oFF.XHashMapByString.create();
	oFF.VdOrcaScenario.STORY = oFF.VdOrcaScenario.create("story");
	oFF.VdOrcaScenario.ANALYTIC_APP = oFF.VdOrcaScenario.create("analytic_app");
	oFF.VdOrcaScenario.LINKED_VARIABLE = oFF.VdOrcaScenario.create("linked_variable");
	oFF.VdOrcaScenario.BOARD_ROOM = oFF.VdOrcaScenario.create("board_room");
	oFF.VdOrcaScenario.PLANNING_SEQUENCE = oFF.VdOrcaScenario.create("planning_sequence");
	oFF.VdOrcaScenario.SCHEDULING = oFF.VdOrcaScenario.create("scheduling");
};

oFF.OrcaLinkVarJoinMode = function() {};
oFF.OrcaLinkVarJoinMode.prototype = new oFF.XConstant();
oFF.OrcaLinkVarJoinMode.prototype._ff_c = "OrcaLinkVarJoinMode";

oFF.OrcaLinkVarJoinMode.INTERSECT = null;
oFF.OrcaLinkVarJoinMode.UNION = null;
oFF.OrcaLinkVarJoinMode.s_lookup = null;
oFF.OrcaLinkVarJoinMode.create = function(name)
{
	let obj = oFF.XConstant.setupName(new oFF.OrcaLinkVarJoinMode(), name);
	oFF.OrcaLinkVarJoinMode.s_lookup.put(obj.getName(), obj);
	return obj;
};
oFF.OrcaLinkVarJoinMode.lookup = function(name)
{
	return oFF.OrcaLinkVarJoinMode.s_lookup.getByKey(name);
};
oFF.OrcaLinkVarJoinMode.staticSetup = function()
{
	oFF.OrcaLinkVarJoinMode.s_lookup = oFF.XHashMapByString.create();
	oFF.OrcaLinkVarJoinMode.INTERSECT = oFF.OrcaLinkVarJoinMode.create("intersect");
	oFF.OrcaLinkVarJoinMode.UNION = oFF.OrcaLinkVarJoinMode.create("union");
};

oFF.OrcaLinkVarSubmitHandling = function() {};
oFF.OrcaLinkVarSubmitHandling.prototype = new oFF.XConstant();
oFF.OrcaLinkVarSubmitHandling.prototype._ff_c = "OrcaLinkVarSubmitHandling";

oFF.OrcaLinkVarSubmitHandling.NONE = null;
oFF.OrcaLinkVarSubmitHandling.SUBMIT_LINKED_DIRECT = null;
oFF.OrcaLinkVarSubmitHandling.SUBMIT_LINKED_RECURSIVE = null;
oFF.OrcaLinkVarSubmitHandling.s_lookup = null;
oFF.OrcaLinkVarSubmitHandling.create = function(name)
{
	let constant = oFF.XConstant.setupName(new oFF.OrcaLinkVarSubmitHandling(), name);
	oFF.OrcaLinkVarSubmitHandling.s_lookup.put(name, constant);
	return constant;
};
oFF.OrcaLinkVarSubmitHandling.lookupWithDefault = function(name)
{
	let constant = oFF.OrcaLinkVarSubmitHandling.s_lookup.getByKey(name);
	return oFF.notNull(constant) ? constant : oFF.OrcaLinkVarSubmitHandling.NONE;
};
oFF.OrcaLinkVarSubmitHandling.staticSetup = function()
{
	oFF.OrcaLinkVarSubmitHandling.s_lookup = oFF.XHashMapByString.create();
	oFF.OrcaLinkVarSubmitHandling.NONE = oFF.OrcaLinkVarSubmitHandling.create("none");
	oFF.OrcaLinkVarSubmitHandling.SUBMIT_LINKED_DIRECT = oFF.OrcaLinkVarSubmitHandling.create("submitLinkedDirect");
	oFF.OrcaLinkVarSubmitHandling.SUBMIT_LINKED_RECURSIVE = oFF.OrcaLinkVarSubmitHandling.create("submitLinkedRecursive");
};

oFF.DfOuOlapView = function() {};
oFF.DfOuOlapView.prototype = new oFF.DfUiContentView();
oFF.DfOuOlapView.prototype._ff_c = "DfOuOlapView";

oFF.DfOuOlapView.prototype.m_queryManager = null;
oFF.DfOuOlapView.prototype.destroyView = function() {};
oFF.DfOuOlapView.prototype.getLocalization = function()
{
	return oFF.XLocalizationCenter.getCenter();
};
oFF.DfOuOlapView.prototype.getQueryManager = function()
{
	return this.m_queryManager;
};
oFF.DfOuOlapView.prototype.initOlapView = function(genesis, queryManager)
{
	if (oFF.isNull(queryManager))
	{
		throw oFF.XException.createRuntimeException("Error while creating a olap ui view. Missing query manager!");
	}
	this.m_queryManager = queryManager;
	oFF.DfUiContentView.prototype.initView.call( this , genesis);
};
oFF.DfOuOlapView.prototype.releaseObject = function()
{
	this.m_queryManager = null;
	oFF.DfUiContentView.prototype.releaseObject.call( this );
};
oFF.DfOuOlapView.prototype.setQueryManager = function(queryManager)
{
	this.m_queryManager = queryManager;
};
oFF.DfOuOlapView.prototype.setupView = function()
{
	this.setupOlapView(this.m_queryManager);
};

oFF.OuDataSourceListPlugin = function() {};
oFF.OuDataSourceListPlugin.prototype = new oFF.XObject();
oFF.OuDataSourceListPlugin.prototype._ff_c = "OuDataSourceListPlugin";

oFF.OuDataSourceListPlugin.CONFIG_SYSTEM_NAME = "systemName";
oFF.OuDataSourceListPlugin.NOTIFY_DATA_SOURCE_SELECTED = "com.sap.ff.DataSourceListPlugin.Notification.DataSourceSelected";
oFF.OuDataSourceListPlugin.NOTIFY_DATA_SOURCE_SELECTED_DATA_SOURCE = "com.sap.ff.DataSourceListPlugin.NotificationData.DataSource";
oFF.OuDataSourceListPlugin.PLUGIN_NAME = "DataSourceListPlugin";
oFF.OuDataSourceListPlugin.prototype.m_controller = null;
oFF.OuDataSourceListPlugin.prototype.m_dataSourceListView = null;
oFF.OuDataSourceListPlugin.prototype.m_systemName = null;
oFF.OuDataSourceListPlugin.prototype._getController = function()
{
	return this.m_controller;
};
oFF.OuDataSourceListPlugin.prototype.buildPluginUi = function(genesis)
{
	this.m_dataSourceListView = oFF.OuDataSourceListView.create(this._getController().getProcess(), this.m_systemName);
	this.m_dataSourceListView.setDataSourceSelectedConsumer((dataSource) => {
		let tmpNotifyData = oFF.XNotificationData.create();
		tmpNotifyData.putXObject(oFF.OuDataSourceListPlugin.NOTIFY_DATA_SOURCE_SELECTED_DATA_SOURCE, dataSource);
		this._getController().getLocalNotificationCenter().postNotificationWithName(oFF.OuDataSourceListPlugin.NOTIFY_DATA_SOURCE_SELECTED, tmpNotifyData);
	});
	genesis.setRoot(this.m_dataSourceListView.renderView(genesis));
};
oFF.OuDataSourceListPlugin.prototype.destroyPlugin = function()
{
	this.m_dataSourceListView = oFF.XObjectExt.release(this.m_dataSourceListView);
	this.m_controller = null;
};
oFF.OuDataSourceListPlugin.prototype.didBecameHidden = function() {};
oFF.OuDataSourceListPlugin.prototype.didBecameVisible = function() {};
oFF.OuDataSourceListPlugin.prototype.getName = function()
{
	return oFF.OuDataSourceListPlugin.PLUGIN_NAME;
};
oFF.OuDataSourceListPlugin.prototype.getPluginCategory = function()
{
	return oFF.HuPluginCategory.OLAP;
};
oFF.OuDataSourceListPlugin.prototype.getPluginType = function()
{
	return oFF.HuPluginType.COMPONENT;
};
oFF.OuDataSourceListPlugin.prototype.onConfigurationChanged = function(configuration) {};
oFF.OuDataSourceListPlugin.prototype.onResize = function(offsetWidth, offsetHeight) {};
oFF.OuDataSourceListPlugin.prototype.processConfiguration = function(configuration)
{
	this.m_systemName = configuration.getStringByKey(oFF.OuDataSourceListPlugin.CONFIG_SYSTEM_NAME);
};
oFF.OuDataSourceListPlugin.prototype.setupPlugin = function(controller)
{
	this.m_controller = controller;
	return null;
};

oFF.OuUiMeasureInput = function() {};
oFF.OuUiMeasureInput.prototype = new oFF.DfUiWidget();
oFF.OuUiMeasureInput.prototype._ff_c = "OuUiMeasureInput";

oFF.OuUiMeasureInput.create = function(parentProcess, queryManager, dataProvider)
{
	let measureInput = new oFF.OuUiMeasureInput();
	measureInput.m_dataProvider = dataProvider;
	measureInput.m_queryManager = queryManager;
	measureInput.m_parentProcess = parentProcess;
	measureInput.m_hideCumulatedMeasures = false;
	measureInput.m_skipValidation = false;
	return measureInput;
};
oFF.OuUiMeasureInput.prototype.m_consumersHandler = null;
oFF.OuUiMeasureInput.prototype.m_dataProvider = null;
oFF.OuUiMeasureInput.prototype.m_filter = null;
oFF.OuUiMeasureInput.prototype.m_hideCumulatedMeasures = false;
oFF.OuUiMeasureInput.prototype.m_parentProcess = null;
oFF.OuUiMeasureInput.prototype.m_queryManager = null;
oFF.OuUiMeasureInput.prototype.m_skipValidation = false;
oFF.OuUiMeasureInput.prototype.attachOnChange = function(consumer)
{
	this.m_consumersHandler.attachEventConsumer(oFF.UiEvent.ON_CHANGE.getName(), consumer);
};
oFF.OuUiMeasureInput.prototype.destroyWidget = function()
{
	oFF.DfUiWidget.prototype.destroyView.call( this );
	this.m_dataProvider = oFF.XObjectExt.release(this.m_dataProvider);
	this.m_consumersHandler = oFF.XObjectExt.release(this.m_consumersHandler);
	this.m_filter = null;
};
oFF.OuUiMeasureInput.prototype.detachOnChange = function(consumer)
{
	this.m_consumersHandler.detachEventConsumer(oFF.UiEvent.ON_CHANGE.getName(), consumer);
};
oFF.OuUiMeasureInput.prototype.fireOnChange = function()
{
	this.m_consumersHandler.fireEvent(oFF.UiEvent.ON_CHANGE.getName(), this);
};
oFF.OuUiMeasureInput.prototype.focus = function()
{
	return this.getView().focus();
};
oFF.OuUiMeasureInput.prototype.getConsumersOnChange = function()
{
	return this.m_consumersHandler.getEventConsumers(oFF.UiEvent.ON_CHANGE.getName());
};
oFF.OuUiMeasureInput.prototype.getDisplayValue = function()
{
	if (this.getValue() !== null)
	{
		return oFF.QueryPresentationUtils.DESCRIPTION.getDisplayValueByType(this.getValue());
	}
	return "";
};
oFF.OuUiMeasureInput.prototype.getLocalization = function()
{
	return oFF.XLocalizationCenter.getCenter();
};
oFF.OuUiMeasureInput.prototype.getMeasureFromSelection = function(selection)
{
	let filterDialogValue = selection.get(0);
	return this.m_dataProvider.findMeasureByName(filterDialogValue.getName());
};
oFF.OuUiMeasureInput.prototype.getMeasureList = function()
{
	let measures = this.m_dataProvider.getMeasures();
	return oFF.isNull(this.m_filter) ? measures : oFF.XStream.of(measures).filter((measure) => {
		return this.m_filter(measure);
	}).collect(oFF.XStreamCollector.toList());
};
oFF.OuUiMeasureInput.prototype.getNewMeasureSuggestionItem = function(measure)
{
	let suggestionItem = this.getGenesis().newControl(oFF.UiType.DROPDOWN_ITEM);
	let text = oFF.QueryPresentationUtils.DESCRIPTION.getDisplayValueByType(measure);
	text = oFF.XString.replace(oFF.XString.replace(text, "\r", ""), "\n", "");
	suggestionItem.setText(text);
	suggestionItem.setCustomObject(measure);
	return suggestionItem;
};
oFF.OuUiMeasureInput.prototype.getValue = function()
{
	return this.getView().getCustomObject();
};
oFF.OuUiMeasureInput.prototype.getWidgetControl = function(genesis)
{
	let input = genesis.newControl(oFF.UiType.INPUT);
	input.addCssClass("ffAuGdsCFMeasureInput");
	return input;
};
oFF.OuUiMeasureInput.prototype.layoutWidget = function(widgetControl)
{
	this.setupValueHelperDialog();
	this.setupSuggestions();
	widgetControl.registerOnSuggestionSelect(this);
	widgetControl.registerOnEditingEnd(oFF.UiLambdaEditingEndListener.create((event) => {
		let valueText = widgetControl.getValue();
		let selectedValue = this.getValue();
		if (oFF.notNull(selectedValue) && oFF.isNull(valueText))
		{
			valueText = selectedValue.getText();
		}
		let newValue = null;
		if (oFF.notNull(valueText))
		{
			let measure = this.m_dataProvider.findMeasureByDisplayName(valueText);
			if (measure.isPresent())
			{
				if (oFF.notNull(selectedValue) && oFF.XString.isEqual(selectedValue.getText(), measure.get().getText()))
				{
					newValue = selectedValue;
				}
				else
				{
					newValue = measure.get();
				}
			}
		}
		if (newValue !== selectedValue || oFF.isNull(newValue))
		{
			widgetControl.setCustomObject(newValue);
			this.m_skipValidation = false;
			this.fireOnChange();
		}
	}));
};
oFF.OuUiMeasureInput.prototype.onSuggestionSelect = function(event)
{
	if (event.getControl() === this.getView())
	{
		this.getView().setCustomObject(event.getSelectedItem().getCustomObject());
		this.m_skipValidation = true;
		this.fireOnChange();
	}
};
oFF.OuUiMeasureInput.prototype.resetValueState = function()
{
	this.getView().setValueState(oFF.UiValueState.NONE);
};
oFF.OuUiMeasureInput.prototype.setEditable = function(editable)
{
	this.getView().setEditable(editable);
};
oFF.OuUiMeasureInput.prototype.setFilter = function(filter)
{
	this.m_filter = filter;
};
oFF.OuUiMeasureInput.prototype.setHideCumulatedMeasures = function(hideCumulatedMeasures)
{
	this.m_hideCumulatedMeasures = hideCumulatedMeasures;
};
oFF.OuUiMeasureInput.prototype.setMeasureInput = function(measure)
{
	this.setValue(measure);
	this.fireOnChange();
};
oFF.OuUiMeasureInput.prototype.setPlaceholder = function(placeholder)
{
	this.getView().setPlaceholder(placeholder);
};
oFF.OuUiMeasureInput.prototype.setValue = function(measure)
{
	let input = this.getView();
	input.setCustomObject(measure);
	if (oFF.isNull(measure))
	{
		input.setValue(null);
	}
	else
	{
		input.setValue(oFF.QueryPresentationUtils.DESCRIPTION.getDisplayValueByType(measure));
	}
};
oFF.OuUiMeasureInput.prototype.setValueState = function(valueState)
{
	this.getView().setValueState(valueState);
};
oFF.OuUiMeasureInput.prototype.setValueStateText = function(string)
{
	this.getView().setValueStateText(string);
};
oFF.OuUiMeasureInput.prototype.setupSuggestions = function()
{
	let input = this.getView();
	input.registerOnLiveChange(oFF.UiLambdaLiveChangeListener.create((event) => {
		input.clearSuggestions();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(input.getValue()))
		{
			let suggestions = oFF.XList.create();
			let measures = this.getMeasureList();
			oFF.XCollectionUtils.forEach(measures, (measure) => {
				suggestions.add(this.getNewMeasureSuggestionItem(measure));
			});
			input.addAllSuggestions(suggestions);
			input.showSuggestions();
		}
	}));
};
oFF.OuUiMeasureInput.prototype.setupValueHelperDialog = function()
{
	let input = this.getView();
	input.setShowValueHelp(true);
	input.registerOnValueHelpRequest(oFF.UiLambdaValueHelpRequestListener.create((event) => {
		this.m_skipValidation = true;
		let name = this.m_dataProvider.getMemberDimension().getName();
		let filterDialogRunner = oFF.FilterDialogProgramRunnerFactory.createForDimension(this.m_parentProcess, this.m_queryManager, name, input.getPlaceholder());
		let filterDialogConfig = oFF.PrFactory.createStructure();
		filterDialogConfig.putBoolean(oFF.FilterDialog.PARAM_SELECTION_REQUIRED, true);
		filterDialogConfig.putBoolean(oFF.FilterDialog.PARAM_HIDE_CUMULATED_MEASURES, this.m_hideCumulatedMeasures);
		filterDialogRunner.setConfigStructure(filterDialogConfig);
		if (this.getValue() !== null)
		{
			let defaultValue = oFF.XList.create();
			let fdValue = oFF.FilterDialogValueFactory.createValue(this.getValue().getName(), null, null);
			let hierarchyName = this.m_dataProvider.getMemberDimension().getDimension().getHierarchyName();
			if (oFF.XStringUtils.isNotNullAndNotEmpty(hierarchyName))
			{
				fdValue.setHierarchyName(hierarchyName);
			}
			defaultValue.add(fdValue);
			filterDialogRunner.getProgramStartData().putXObject(oFF.FilterDialog.PRG_DATA_DEFAULT_SELECTION, defaultValue);
		}
		filterDialogRunner.getProgramStartData().putXObject(oFF.FilterDialog.PRG_DATA_LISTENER_CLOSE, oFF.FilterDialogLambdaCloseListener.create((selection) => {
			let selectedMeasure = this.getMeasureFromSelection(selection);
			if (selectedMeasure.isPresent())
			{
				this.setMeasureInput(selectedMeasure.get());
			}
		}, null));
		filterDialogRunner.runProgram();
	}));
};
oFF.OuUiMeasureInput.prototype.setupWidget = function()
{
	this.m_consumersHandler = oFF.SuEventConsumerHandler.create();
};
oFF.OuUiMeasureInput.prototype.skipValidation = function()
{
	return this.m_skipValidation;
};

oFF.DialogDisplayMode = function() {};
oFF.DialogDisplayMode.prototype = new oFF.XConstant();
oFF.DialogDisplayMode.prototype._ff_c = "DialogDisplayMode";

oFF.DialogDisplayMode.DIALOG = null;
oFF.DialogDisplayMode.NAVIGATION = null;
oFF.DialogDisplayMode.PAGE = null;
oFF.DialogDisplayMode.staticSetup = function()
{
	oFF.DialogDisplayMode.DIALOG = oFF.XConstant.setupName(new oFF.DialogDisplayMode(), "Dialog");
	oFF.DialogDisplayMode.NAVIGATION = oFF.XConstant.setupName(new oFF.DialogDisplayMode(), "Navigation");
	oFF.DialogDisplayMode.PAGE = oFF.XConstant.setupName(new oFF.DialogDisplayMode(), "Page");
};

oFF.DialogGridFormat = function() {};
oFF.DialogGridFormat.prototype = new oFF.XConstant();
oFF.DialogGridFormat.prototype._ff_c = "DialogGridFormat";

oFF.DialogGridFormat.COMMA = null;
oFF.DialogGridFormat.EXCEL = null;
oFF.DialogGridFormat.SEMICOLON = null;
oFF.DialogGridFormat.create = function(name, separatorSymbol, decoratorSymbol)
{
	let obj = new oFF.DialogGridFormat();
	obj._setupInternal(name);
	obj.m_separatorSymbol = separatorSymbol;
	obj.m_decoratorSymbol = decoratorSymbol;
	return obj;
};
oFF.DialogGridFormat.staticSetup = function()
{
	oFF.DialogGridFormat.SEMICOLON = oFF.DialogGridFormat.create("Semicolon", ";", " ");
	oFF.DialogGridFormat.COMMA = oFF.DialogGridFormat.create("Comma", ",", " ");
	oFF.DialogGridFormat.EXCEL = oFF.DialogGridFormat.create("Excel", "\t", "");
};
oFF.DialogGridFormat.prototype.m_decoratorSymbol = null;
oFF.DialogGridFormat.prototype.m_separatorSymbol = null;
oFF.DialogGridFormat.prototype.getDecoratorSymbol = function()
{
	return this.m_decoratorSymbol;
};
oFF.DialogGridFormat.prototype.getSeparatorSymbol = function()
{
	return this.m_separatorSymbol;
};

oFF.DialogLabelMode = function() {};
oFF.DialogLabelMode.prototype = new oFF.XConstant();
oFF.DialogLabelMode.prototype._ff_c = "DialogLabelMode";

oFF.DialogLabelMode.KEY = null;
oFF.DialogLabelMode.KEY_AND_TEXT = null;
oFF.DialogLabelMode.TEXT = null;
oFF.DialogLabelMode.staticSetup = function()
{
	oFF.DialogLabelMode.KEY = oFF.XConstant.setupName(new oFF.DialogLabelMode(), "Key");
	oFF.DialogLabelMode.TEXT = oFF.XConstant.setupName(new oFF.DialogLabelMode(), "Text");
	oFF.DialogLabelMode.KEY_AND_TEXT = oFF.XConstant.setupName(new oFF.DialogLabelMode(), "KeyAndText");
};

oFF.QueryPresentationUtils = function() {};
oFF.QueryPresentationUtils.prototype = new oFF.XConstant();
oFF.QueryPresentationUtils.prototype._ff_c = "QueryPresentationUtils";

oFF.QueryPresentationUtils.DESCRIPTION = null;
oFF.QueryPresentationUtils.DESCRIPTION_AND_ID = null;
oFF.QueryPresentationUtils.ID = null;
oFF.QueryPresentationUtils.ID_AND_DESCRIPTION = null;
oFF.QueryPresentationUtils.PREFIX = " (";
oFF.QueryPresentationUtils.SUFFIX = ")";
oFF.QueryPresentationUtils.staticSetup = function()
{
	oFF.QueryPresentationUtils.ID = oFF.XConstant.setupName(new oFF.QueryPresentationUtils(), "id");
	oFF.QueryPresentationUtils.DESCRIPTION = oFF.XConstant.setupName(new oFF.QueryPresentationUtils(), "description");
	oFF.QueryPresentationUtils.ID_AND_DESCRIPTION = oFF.XConstant.setupName(new oFF.QueryPresentationUtils(), "idAndDescription");
	oFF.QueryPresentationUtils.DESCRIPTION_AND_ID = oFF.XConstant.setupName(new oFF.QueryPresentationUtils(), "descriptionAndId");
};
oFF.QueryPresentationUtils.prototype.composeDisplayStrings = function(key, text)
{
	if (this === oFF.QueryPresentationUtils.ID)
	{
		return key;
	}
	else if (this === oFF.QueryPresentationUtils.DESCRIPTION)
	{
		if (oFF.XStringUtils.isNullOrEmpty(text))
		{
			return key;
		}
		return text;
	}
	else if (this === oFF.QueryPresentationUtils.ID_AND_DESCRIPTION)
	{
		return oFF.XStringUtils.concatenate4(key, oFF.QueryPresentationUtils.PREFIX, text, oFF.QueryPresentationUtils.SUFFIX);
	}
	else if (this === oFF.QueryPresentationUtils.DESCRIPTION_AND_ID)
	{
		return oFF.XStringUtils.concatenate4(text, oFF.QueryPresentationUtils.PREFIX, key, oFF.QueryPresentationUtils.SUFFIX);
	}
	throw oFF.XException.createIllegalArgumentException("unknown presentation type");
};
oFF.QueryPresentationUtils.prototype.getDisplayValueByType = function(modelComponent)
{
	let dim;
	if (oFF.OlapUiDimensionUtil.isMember(modelComponent))
	{
		let member = oFF.OlapUiDimensionUtil.getMember(modelComponent);
		dim = member.getDimension();
		let key = null;
		let text = member.getDisplayDescription();
		let displayKeyValue = member.getFieldValue(dim.getDisplayKeyField());
		if (oFF.notNull(displayKeyValue))
		{
			key = displayKeyValue.getValue().getStringRepresentation();
		}
		let preventTechnicalKeys = member.getSession().hasFeature(oFF.FeatureToggleOlap.PREVENT_TECHNICAL_KEYS_IN_UI);
		if (preventTechnicalKeys && oFF.XStringUtils.isNullOrEmpty(key) && member.getMemberType() !== oFF.MemberType.FORMULA)
		{
			key = this.getLocalizationProvider().getText(oFF.OlapUiCommonI18n.COMMON_MEMBER_WITHOUT_ID_TITLE);
		}
		else if (oFF.XStringUtils.isNullOrEmpty(key) || member.isDisplayNameSet())
		{
			key = member.getDisplayName();
		}
		return this.composeDisplayStrings(key, text);
	}
	if (oFF.OlapUiDimensionUtil.isDimension(modelComponent))
	{
		dim = modelComponent;
		return this.composeDisplayStrings(dim.getDisplayName(), dim.getDisplayDescription());
	}
	if (oFF.OlapUiDimensionUtil.isAttribute(modelComponent))
	{
		let attribute = modelComponent;
		return this.composeDisplayStrings(attribute.getDisplayName(), attribute.getDisplayDescription());
	}
	return this.composeDisplayStrings(modelComponent.getName(), null);
};
oFF.QueryPresentationUtils.prototype.getLocalizationProvider = function()
{
	return oFF.XLocalizationCenter.getCenter().getLocalizationProviderByName(oFF.OlapUiCommonI18n.PROVIDER_NAME);
};

oFF.OuDataProviderActionListView = function() {};
oFF.OuDataProviderActionListView.prototype = new oFF.DfDataProviderUiView();
oFF.OuDataProviderActionListView.prototype._ff_c = "OuDataProviderActionListView";

oFF.OuDataProviderActionListView.PLUGIN_NAME = "DataProviderActionList";
oFF.OuDataProviderActionListView.createView = function()
{
	return new oFF.OuDataProviderActionListView();
};
oFF.OuDataProviderActionListView.prototype.m_actionList = null;
oFF.OuDataProviderActionListView.prototype.m_console = null;
oFF.OuDataProviderActionListView.prototype.m_executeButton = null;
oFF.OuDataProviderActionListView.prototype.m_parameterForm = null;
oFF.OuDataProviderActionListView.prototype._buildParameterSection = function(actionName)
{
	this.m_parameterForm.clearFormItems();
	if (oFF.XStringUtils.isNullOrEmpty(actionName))
	{
		return;
	}
	let actionManifest = this.getDataProvider().getActions().getActionManifest(actionName);
	let parameterDefinitions = actionManifest.getParameterList();
	for (let i = 0; i < parameterDefinitions.size(); i++)
	{
		let parameterDefinition = parameterDefinitions.get(i);
		let displayName = parameterDefinition.getDisplayName();
		if (oFF.XStringUtils.isNullOrEmpty(displayName))
		{
			displayName = parameterDefinition.getName();
		}
		this.m_parameterForm.addInput(parameterDefinition.getName(), null, displayName);
	}
};
oFF.OuDataProviderActionListView.prototype._executeDpAction = function(actionName)
{
	let parameters = oFF.XList.create();
	let jsonModel = this.m_parameterForm.getJsonModel();
	let iter = jsonModel.getKeysAsIterator();
	while (iter.hasNext())
	{
		let key = iter.next();
		let value = jsonModel.getStringByKey(key);
		parameters.add(value);
	}
	let stringActions = this.getDataProvider().getStringActions();
	let promise = stringActions.executeActionByName(actionName, parameters).onThen((result) => {
		this.setToConsole(oFF.XStringUtils.concatenate2(actionName, " success"));
		if (oFF.notNull(result))
		{
			this.appendToConsole(result.toString());
		}
	});
	promise.onCatch((err) => {
		this.setToConsole(oFF.notNull(err) ? err.getText() : null);
	});
};
oFF.OuDataProviderActionListView.prototype._updateUi = function()
{
	this.m_actionList.clearItems();
	this.m_parameterForm.clearFormItems();
	this.m_executeButton.setEnabled(false);
	if (this.getDataProvider() === null)
	{
		return;
	}
	let manifestComparator = oFF.XComparatorLambda.create((first, second) => {
		return oFF.XIntegerValue.create(oFF.XString.compare(first.getDisplayName(), second.getDisplayName()));
	});
	let actionManifests = this.getDataProvider().getActions().getActionManifests().createListCopy();
	actionManifests.sortByComparator(manifestComparator);
	for (let i = 0; i < actionManifests.size(); i++)
	{
		let actionManifest = actionManifests.get(i);
		let listItem = this.m_actionList.addNewItem();
		listItem.setName(actionManifest.getName());
		listItem.setText(actionManifest.getDisplayName());
	}
};
oFF.OuDataProviderActionListView.prototype.appendToConsole = function(msg)
{
	let buffer = oFF.XStringBuffer.create();
	buffer.append(this.m_console.getText());
	buffer.appendLine(msg);
	this.m_console.setText(buffer.toString());
};
oFF.OuDataProviderActionListView.prototype.destroyView = function()
{
	this.m_actionList = oFF.XObjectExt.release(this.m_actionList);
	this.m_parameterForm = oFF.XObjectExt.release(this.m_parameterForm);
	this.m_executeButton = oFF.XObjectExt.release(this.m_executeButton);
	this.m_console = oFF.XObjectExt.release(this.m_console);
};
oFF.OuDataProviderActionListView.prototype.getViewControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.FLEX_LAYOUT);
};
oFF.OuDataProviderActionListView.prototype.layoutView = function(viewControl)
{
	viewControl.setDirection(oFF.UiFlexDirection.COLUMN);
	let header = viewControl.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	header.setDirection(oFF.UiFlexDirection.ROW);
	header.setJustifyContent(oFF.UiFlexJustifyContent.END);
	let vertical = viewControl.addNewItemOfType(oFF.UiType.INTERACTIVE_SPLITTER);
	vertical.setOrientation(oFF.UiOrientation.VERTICAL);
	vertical.setEnableReordering(false);
	vertical.setFlex("auto");
	let upper = vertical.addNewItem();
	let horizontal = upper.setNewContent(oFF.UiType.INTERACTIVE_SPLITTER);
	horizontal.setOrientation(oFF.UiOrientation.HORIZONTAL);
	horizontal.setEnableReordering(false);
	horizontal.setFlex("auto");
	let left = horizontal.addNewItem();
	left.setDraggable(false);
	this.m_actionList = left.setNewContent(oFF.UiType.LIST);
	this.m_actionList.useMaxSpace();
	this.m_actionList.setSelectionMode(oFF.UiSelectionMode.SINGLE_SELECT_MASTER);
	this.m_actionList.registerOnSelectionChange(oFF.UiLambdaSelectionChangeListener.create((selectionEvent) => {
		let actionName = selectionEvent.getSelectedName();
		this.m_executeButton.setEnabled(oFF.XStringUtils.isNotNullAndNotEmpty(actionName));
		this._buildParameterSection(actionName);
	}));
	let right = horizontal.addNewItem();
	let actionArea = right.setNewContent(oFF.UiType.FLEX_LAYOUT);
	actionArea.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_parameterForm = oFF.UiForm.create(this.getGenesis());
	this.m_parameterForm.getView().useMaxSpace();
	actionArea.addItem(this.m_parameterForm.getView());
	let actionBar = actionArea.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	actionBar.setDirection(oFF.UiFlexDirection.ROW);
	actionBar.useMaxWidth();
	actionBar.setJustifyContent(oFF.UiFlexJustifyContent.END);
	this.m_executeButton = actionBar.addNewItemOfType(oFF.UiType.BUTTON);
	this.m_executeButton.setText("Run");
	this.m_executeButton.setButtonType(oFF.UiButtonType.PRIMARY);
	this.m_executeButton.setEnabled(false);
	this.m_executeButton.registerOnPress(oFF.UiLambdaPressListener.create((pressEvt) => {
		this._executeDpAction(this.m_actionList.getSelectedName());
	}));
	let lower = vertical.addNewItem();
	let scroll = lower.setNewContent(oFF.UiType.SCROLL_CONTAINER);
	scroll.setHorizontalScrolling(true);
	scroll.setVerticalScrolling(true);
	scroll.useMaxSpace();
	this.m_console = scroll.setNewContent(oFF.UiType.TEXT);
	this.m_console.addCssClass("dpActionListConsole");
};
oFF.OuDataProviderActionListView.prototype.onDataProviderSet = function(oldDataProvider, newDataProvider)
{
	this.m_console.setText("");
	this._updateUi();
};
oFF.OuDataProviderActionListView.prototype.setToConsole = function(msg)
{
	this.m_console.setText(msg);
};
oFF.OuDataProviderActionListView.prototype.setupView = function() {};

oFF.OuDataProviderLogView = function() {};
oFF.OuDataProviderLogView.prototype = new oFF.DfDataProviderUiView();
oFF.OuDataProviderLogView.prototype._ff_c = "OuDataProviderLogView";

oFF.OuDataProviderLogView.createView = function()
{
	return new oFF.OuDataProviderLogView();
};
oFF.OuDataProviderLogView.prototype.m_dpName = null;
oFF.OuDataProviderLogView.prototype.m_logList = null;
oFF.OuDataProviderLogView.prototype.m_logListenerId = null;
oFF.OuDataProviderLogView.prototype.addEntry = function(message)
{
	if (oFF.isNull(message))
	{
		return;
	}
	let item = this.createMessageEntry(message);
	this.m_logList.addItem(item);
};
oFF.OuDataProviderLogView.prototype.createMessageEntry = function(message)
{
	let listItem = this.getGenesis().newControl(oFF.UiType.CUSTOM_LIST_ITEM);
	listItem.setHighlight(this.getUiMessageType(message));
	let label = listItem.setNewContent(oFF.UiType.TEXT);
	let txt = message.getText();
	if (message.getMessageClass() !== null)
	{
		txt = oFF.XStringUtils.concatenate5("[", message.getMessageClass(), "]", " - ", txt);
	}
	else
	{
		txt = oFF.XStringUtils.concatenate5("[", message.getSeverity().getName(), "]", " - ", txt);
	}
	label.setText(txt);
	label.setWrapping(true);
	label.setPadding(oFF.UiCssBoxEdges.create("0.5rem"));
	label.setFontWeight(oFF.UiFontWeight.BOLDER);
	return listItem;
};
oFF.OuDataProviderLogView.prototype.destroyView = function()
{
	this.unobserveDataProvider(this.getDataProvider());
	this.m_dpName = oFF.XObjectExt.release(this.m_dpName);
	this.m_dpName = oFF.XObjectExt.release(this.m_dpName);
};
oFF.OuDataProviderLogView.prototype.getUiMessageType = function(message)
{
	if (message.getSeverity() === oFF.Severity.ERROR || message.getSeverity() === oFF.Severity.SEMANTICAL_ERROR)
	{
		return oFF.UiMessageType.ERROR;
	}
	else if (message.getSeverity() === oFF.Severity.WARNING)
	{
		return oFF.UiMessageType.ERROR;
	}
	else if (message.getSeverity() === oFF.Severity.INFO)
	{
		return oFF.UiMessageType.INFORMATION;
	}
	else if (message.getSeverity() === oFF.Severity.DEBUG)
	{
		return oFF.UiMessageType.INFORMATION;
	}
	return null;
};
oFF.OuDataProviderLogView.prototype.getViewControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.FLEX_LAYOUT);
};
oFF.OuDataProviderLogView.prototype.layoutView = function(viewControl)
{
	viewControl.setDirection(oFF.UiFlexDirection.COLUMN);
	let titleFlex = viewControl.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	titleFlex.setDirection(oFF.UiFlexDirection.COLUMN);
	titleFlex.setJustifyContent(oFF.UiFlexJustifyContent.START);
	titleFlex.setGap(oFF.UiCssGap.create("0.25rem"));
	titleFlex.setAlignItems(oFF.UiFlexAlignItems.START);
	titleFlex.setPadding(oFF.UiCssBoxEdges.create("0.5rem"));
	titleFlex.setWrap(oFF.UiFlexWrap.WRAP);
	let title = titleFlex.addNewItemOfType(oFF.UiType.TITLE);
	title.setTitleLevel(oFF.UiTitleLevel.H_6);
	title.setTitleStyle(oFF.UiTitleLevel.H_6);
	title.setText("Data Provider name:");
	this.m_dpName = titleFlex.addNewItemOfType(oFF.UiType.TEXT);
	this.m_dpName.setWrapping(true);
	this.m_dpName.setText("none");
	let buttonFlex = titleFlex.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	buttonFlex.setDirection(oFF.UiFlexDirection.COLUMN);
	buttonFlex.setAlignItems(oFF.UiFlexAlignItems.END);
	buttonFlex.useMaxWidth();
	let clearButton = buttonFlex.addNewItemOfType(oFF.UiType.BUTTON);
	clearButton.setIcon("clear-all");
	clearButton.setButtonType(oFF.UiButtonType.NEGATIVE);
	clearButton.setTooltip("Clear logs");
	clearButton.registerOnPress(oFF.UiLambdaPressListener.create((evt) => {
		this.getDataProvider().getLogger().clearAll();
		this.updateUi();
	}));
	let scroll = viewControl.addNewItemOfType(oFF.UiType.SCROLL_CONTAINER);
	scroll.setHorizontalScrolling(true);
	this.m_logList = scroll.setNewContent(oFF.UiType.LIST);
	this.m_logList.setWidth(oFF.UiCssLength.create("auto"));
};
oFF.OuDataProviderLogView.prototype.observeDataProvider = function(dataProvider)
{
	if (oFF.notNull(dataProvider))
	{
		this.m_logListenerId = dataProvider.getLogger().getLogListener().addConsumer(this.addEntry.bind(this));
	}
};
oFF.OuDataProviderLogView.prototype.onDataProviderSet = function(oldDataProvider, newDataProvider)
{
	this.unobserveDataProvider(oldDataProvider);
	this.observeDataProvider(newDataProvider);
	this.updateUi();
};
oFF.OuDataProviderLogView.prototype.setupView = function()
{
	this.m_logList = oFF.UiContextDummy.getSingleton();
};
oFF.OuDataProviderLogView.prototype.unobserveDataProvider = function(dataProvider)
{
	if (oFF.notNull(dataProvider) && oFF.notNull(this.m_logListenerId))
	{
		dataProvider.getLogger().getLogListener().removeConsumerByUuid(this.m_logListenerId);
		this.m_logListenerId = null;
	}
};
oFF.OuDataProviderLogView.prototype.updateUi = function()
{
	this.m_dpName.setText("none");
	this.m_logList.clearItems();
	if (this.getDataProvider() === null || this.getDataProvider().isReleased())
	{
		return;
	}
	this.m_dpName.setText(this.getDataProvider().getName());
	let log = this.getDataProvider().getLogger().getLog();
	oFF.XCollectionUtils.forEach(log, this.addEntry.bind(this));
};

oFF.OuAxesView = function() {};
oFF.OuAxesView.prototype = new oFF.DfUiContentView();
oFF.OuAxesView.prototype._ff_c = "OuAxesView";

oFF.OuAxesView.UI_CONTEXT = "Gds.Qb.Builder.ContextMenu";
oFF.OuAxesView._getLocalizationProvider = function()
{
	return oFF.XLocalizationCenter.getCenter().getLocalizationProviderByName(oFF.OuAxesViewI18n.PROVIDER_NAME);
};
oFF.OuAxesView.createView = function(process, genesis, configuration)
{
	let obj = new oFF.OuAxesView();
	obj.m_process = process;
	obj.m_config = configuration;
	obj.m_presentation = configuration.getDefaultPresentation();
	obj.initView(genesis);
	return obj;
};
oFF.OuAxesView.prototype.m_activeDisplayType = null;
oFF.OuAxesView.prototype.m_activeView = null;
oFF.OuAxesView.prototype.m_allEventId = null;
oFF.OuAxesView.prototype.m_chartView = null;
oFF.OuAxesView.prototype.m_config = null;
oFF.OuAxesView.prototype.m_dataProvider = null;
oFF.OuAxesView.prototype.m_dropdown = null;
oFF.OuAxesView.prototype.m_dropdownWrapper = null;
oFF.OuAxesView.prototype.m_gridView = null;
oFF.OuAxesView.prototype.m_onChange = null;
oFF.OuAxesView.prototype.m_presentation = null;
oFF.OuAxesView.prototype.m_process = null;
oFF.OuAxesView.prototype.m_root = null;
oFF.OuAxesView.prototype.m_scrollContainer = null;
oFF.OuAxesView.prototype.m_showDisplayType = false;
oFF.OuAxesView.prototype._activateChartView = function(chartDefinition)
{
	let chartType = chartDefinition.getChartSetting().getChartType();
	let selectedChartType = oFF.XCollectionUtils.findFirst(this.m_dropdown.getItems(), (option) => {
		return option.getCustomObject().getChartType() === chartType;
	});
	this.m_dropdown.setSelectedItem(oFF.notNull(selectedChartType) ? selectedChartType : null);
	let newDisplayType = oFF.OuAxesViewDisplayType.lookup(chartType.getName());
	if (this.m_activeDisplayType === newDisplayType && this.m_chartView.getChartDefinition() === chartDefinition)
	{
		return;
	}
	this.m_activeDisplayType = newDisplayType;
	this.m_chartView.setChartDefinition(chartDefinition);
	this._setActiveView(this.m_chartView);
};
oFF.OuAxesView.prototype._activateGridView = function()
{
	if (this.m_activeDisplayType === oFF.OuAxesViewDisplayType.GRID)
	{
		return;
	}
	let gridOption = oFF.XCollectionUtils.findFirst(this.m_dropdown.getItems(), (option) => {
		return option.getCustomObject() === oFF.OuAxesViewDisplayType.GRID;
	});
	this._setActiveView(this.m_gridView);
	this.m_dropdown.setSelectedItem(gridOption);
	this.m_activeDisplayType = oFF.OuAxesViewDisplayType.GRID;
	if (oFF.notNull(this.m_chartView))
	{
		this.m_chartView.removeAddedHeaderElements();
	}
};
oFF.OuAxesView.prototype._changeVizDisplayType = function(selectedItem, vizName)
{
	let selectedDisplayType = selectedItem.getCustomObject();
	let selectedVizType = selectedDisplayType.getVisualizationType();
	let vizNameToActivate = vizName;
	if (oFF.XStringUtils.isNullOrEmpty(vizNameToActivate))
	{
		if (selectedVizType === oFF.VisualizationType.GRID)
		{
			vizNameToActivate = this._getOrCreateTableDefinition().getName();
		}
		else
		{
			let chartType = selectedDisplayType.getChartType();
			vizNameToActivate = this._getOrCreateChartDefinition(chartType).getName();
			this.m_dataProvider.getActions().getVisualizationActions().setVisualizationChartType(vizNameToActivate, chartType);
		}
	}
	this._switchToExistingVisualization(selectedVizType, vizNameToActivate);
};
oFF.OuAxesView.prototype._getCurrentChartVisualization = function()
{
	if (this.getQueryManager() === null)
	{
		return null;
	}
	let visualizationManager = this.getQueryManager().getQueryModel().getVisualizationManager();
	let currentActiveVisualizationDefinition = visualizationManager.getCurrentActiveVisualizationDefinition();
	if (oFF.isNull(currentActiveVisualizationDefinition) || currentActiveVisualizationDefinition.getSemanticBindingType() !== oFF.SemanticBindingType.CHART)
	{
		return null;
	}
	return currentActiveVisualizationDefinition;
};
oFF.OuAxesView.prototype._getOrCreateChartDefinition = function(chartType)
{
	let visualizationManager = this.getQueryManager().getQueryModel().getVisualizationManager();
	let bindingType = oFF.VisualizationType.CHART.getDefaultProtocolBindingType();
	let chartDefinition = null;
	if (this.m_config.shouldUseExistingVisualizations())
	{
		chartDefinition = oFF.XCollectionUtils.findFirst(visualizationManager.getVisualizationDefinitions(), (vis) => {
			return vis.getProtocolBindingType() === bindingType;
		});
	}
	if (oFF.isNull(chartDefinition))
	{
		let uuid = oFF.XStringUtils.concatenate2("chart_created_by_axes_view_", chartType.getName());
		chartDefinition = visualizationManager.getOrCreateVisualisationDefinition(uuid, bindingType, oFF.SemanticBindingType.CHART);
	}
	let chartSetting = chartDefinition.getChartSetting();
	chartSetting.setChartType(chartType);
	if (chartSetting.getChartType().isSingleMeasureChartType())
	{
		let ctp = (cs, msg) => {
			let chartName = chartSetting.getChartType().getName();
			let message = oFF.OuAxesView._getLocalizationProvider().getTextWithPlaceholder2(oFF.OuAxesViewI18n.BUILDER_TOAST_MEMBERS_REMOVED, chartName, msg);
			let messageCenter = this.m_config.getMessageCenter();
			if (oFF.notNull(messageCenter))
			{
				messageCenter.showWarningToast(message);
			}
			else
			{
				oFF.XLogger.println(message);
			}
		};
		chartSetting.setToastPresenter(ctp);
	}
	return chartDefinition;
};
oFF.OuAxesView.prototype._getOrCreateTableDefinition = function()
{
	let visualizationManager = this.getQueryManager().getQueryModel().getVisualizationManager();
	let tableDefinition = null;
	if (this.m_config.shouldUseExistingVisualizations())
	{
		tableDefinition = visualizationManager.getOrCreateDefaultTableDefinition();
	}
	if (oFF.isNull(tableDefinition))
	{
		tableDefinition = visualizationManager.getOrCreateVisualisationDefinition("table_created_by_axes_view", oFF.ProtocolBindingType.SAC_TABLE_GRID, oFF.SemanticBindingType.TABLE);
	}
	return tableDefinition;
};
oFF.OuAxesView.prototype._notifyChangeListeners = function(currentVizType)
{
	if (oFF.notNull(this.m_onChange))
	{
		this.m_onChange(currentVizType);
	}
	if (oFF.notNull(this.m_dataProvider))
	{
		this.m_dataProvider.getEventing().notifyExternalModelChange(null);
	}
};
oFF.OuAxesView.prototype._observeDataProviderEvents = function()
{
	if (oFF.notNull(this.m_dataProvider))
	{
		this.m_allEventId = this.m_dataProvider.getEventing().getListenerForAll().addConsumer(this.onAnyDataProviderEvent.bind(this));
	}
};
oFF.OuAxesView.prototype._setActiveView = function(view)
{
	this.m_activeView = view;
	this.m_activeView.updateUi();
	this.m_activeView.setPresentation(this.m_presentation);
	this.m_scrollContainer.setContent(this.m_activeView.getView());
};
oFF.OuAxesView.prototype._switchToExistingVisualization = function(selectedVizType, vizName)
{
	if (this.getQueryManager() !== null)
	{
		let visualizationManager = this.getQueryManager().getQueryModel().getVisualizationManager();
		if (oFF.XString.isEqual(vizName, visualizationManager.getCurrentActiveVisualizationDefinition().getName()))
		{
			this._updateActiveView();
		}
		else
		{
			this.m_dataProvider.getActions().getVisualizationActions().setActiveVisualizationDefinition(vizName);
			this._notifyChangeListeners(selectedVizType);
		}
	}
};
oFF.OuAxesView.prototype._unobserveDataProviderEvents = function()
{
	if (oFF.notNull(this.m_dataProvider))
	{
		this.m_dataProvider.getEventing().getListenerForAll().removeConsumerByUuid(this.m_allEventId);
		this.m_allEventId = null;
	}
};
oFF.OuAxesView.prototype._updateActiveView = function()
{
	let chartDefinition = this._getCurrentChartVisualization();
	if (oFF.isNull(chartDefinition))
	{
		this._activateGridView();
		return;
	}
	this._activateChartView(chartDefinition);
};
oFF.OuAxesView.prototype._updateDisplayTypeVisibility = function()
{
	let dropdownVisible = this.m_showDisplayType;
	let queryManager = this.getQueryManager();
	if (dropdownVisible && oFF.notNull(queryManager))
	{
		if (queryManager.getQueryModel().isUniversalAccountModel())
		{
			dropdownVisible = this.m_config.isChartingPhase2Enabled();
		}
		else if (queryManager.getQueryModel().isAccountModel())
		{
			dropdownVisible = false;
		}
	}
	this.m_dropdownWrapper.setVisible(dropdownVisible);
};
oFF.OuAxesView.prototype.buildViewUi = function(genesis)
{
	this.m_root = genesis.newRoot(oFF.UiType.FLEX_LAYOUT);
	this.m_root.addCssClass("ffAxesView");
	this.m_root.setDirection(oFF.UiFlexDirection.COLUMN);
	if (this.m_config.isChartingEnabled())
	{
		this.m_showDisplayType = true;
		let i18n = oFF.OuAxesView._getLocalizationProvider();
		this.m_dropdownWrapper = this.m_root.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
		this.m_dropdownWrapper.addCssClass("ffAxesViewVisualizationDropdownContainer");
		this.m_dropdownWrapper.setPadding(oFF.UiCssBoxEdges.create("0.75rem 0.375rem"));
		this.m_dropdownWrapper.setFlex("0 0 auto");
		this.m_dropdownWrapper.setAlignItems(oFF.UiFlexAlignItems.CENTER);
		this.m_dropdownWrapper.setDirection(oFF.UiFlexDirection.COLUMN);
		this.m_dropdownWrapper.setHeight(oFF.UiCssLength.AUTO);
		let displayTypeLabel = this.m_dropdownWrapper.addNewItemOfType(oFF.UiType.LABEL);
		displayTypeLabel.setText(i18n.getText(oFF.OuAxesViewI18n.BUILDER_DISPLAY_TYPE));
		displayTypeLabel.setTextAlign(oFF.UiTextAlign.LEFT);
		displayTypeLabel.setAlignSelf(oFF.UiFlexAlignSelf.START);
		displayTypeLabel.setFlex("0 0 auto");
		displayTypeLabel.setPadding(oFF.UiCssBoxEdges.create("0 0 0.25rem 0"));
		this.m_dropdown = this.m_dropdownWrapper.addNewItemOfType(oFF.UiType.DROPDOWN);
		this.m_dropdown.addCssClass("ffAxesViewVisualizationDropdown");
		this.m_dropdown.useMaxWidth();
		this.m_dropdown.setFlex("0 0 auto");
		displayTypeLabel.setLabelFor(this.m_dropdown);
		oFF.XCollectionUtils.forEach(this.m_config.getSupportedDisplayTypes(), (displayType) => {
			let option = this.m_dropdown.addNewItem();
			option.setText(i18n.getText(displayType.getI18nKey()));
			option.setIcon(displayType.getIcon());
			option.setCustomObject(displayType);
		});
		this.m_dropdown.registerOnSelect(oFF.UiLambdaSelectListener.create((evt) => {
			let selectedItem = evt.getSelectedItem();
			this._changeVizDisplayType(selectedItem, null);
		}));
	}
	this.m_gridView = oFF.OuGridAxesView.createView(this.m_process, genesis, this.m_config);
	this.m_chartView = oFF.OuChartAxesView.createView(this.m_process, genesis, this.m_config);
	this.m_chartView.setHeaderLayout(this.m_dropdownWrapper);
	this.m_activeView = this.m_gridView;
	this.m_scrollContainer = this.m_root.addNewItemOfType(oFF.UiType.SCROLL_CONTAINER);
	this.m_scrollContainer.useMaxHeight();
	this.m_scrollContainer.addCssClass("ffAxesViewMainContainer");
};
oFF.OuAxesView.prototype.destroyView = function()
{
	this._unobserveDataProviderEvents();
	this.m_dropdown = oFF.XObjectExt.release(this.m_dropdown);
	this.m_dropdownWrapper = oFF.XObjectExt.release(this.m_dropdownWrapper);
	this.m_gridView = oFF.XObjectExt.release(this.m_gridView);
	this.m_chartView = oFF.XObjectExt.release(this.m_chartView);
	this.m_scrollContainer = oFF.XObjectExt.release(this.m_scrollContainer);
	this.m_root = oFF.XObjectExt.release(this.m_root);
	this.m_activeView = null;
	this.m_onChange = null;
	this.m_dataProvider = null;
	this.m_presentation = null;
	this.m_config = null;
	this.m_activeDisplayType = null;
};
oFF.OuAxesView.prototype.dragEnd = function()
{
	this.m_activeView.dragEnd();
};
oFF.OuAxesView.prototype.dragStartModelComponent = function(model)
{
	this.m_activeView.dragStartModelComponent(model);
};
oFF.OuAxesView.prototype.expandDimension = function(name)
{
	this.m_activeView.expandDimension(name);
};
oFF.OuAxesView.prototype.expandMember = function(dimName, memberName)
{
	this.m_activeView.expandMember(dimName, memberName);
};
oFF.OuAxesView.prototype.getDataProvider = function()
{
	return this.m_dataProvider;
};
oFF.OuAxesView.prototype.getProcess = function()
{
	return this.m_config.getApplication().getProcess();
};
oFF.OuAxesView.prototype.getQueryManager = function()
{
	return oFF.notNull(this.m_dataProvider) ? this.m_dataProvider.getQueryManager() : null;
};
oFF.OuAxesView.prototype.getSession = function()
{
	return this.m_config.getApplication().getProcess();
};
oFF.OuAxesView.prototype.onAnyDataProviderEvent = function(allEvt)
{
	let lifecycleEvent = allEvt.getLifecycleEvent();
	if (oFF.notNull(lifecycleEvent) && lifecycleEvent.getNewState() === oFF.DataProviderLifecycle.RELEASED)
	{
		this.setDataProvider(null);
		return;
	}
	let olapAllEvent = oFF.OlapDataProviderUtil.getOlapAllEvent(allEvt);
	if (oFF.notNull(olapAllEvent) && (olapAllEvent.getModelChangeEvent() !== null || olapAllEvent.getVisualizationChangeEvent() !== null || olapAllEvent.getResultDataFetchEvent() !== null))
	{
		this.updateUi();
	}
};
oFF.OuAxesView.prototype.setDataProvider = function(dataProvider)
{
	this._unobserveDataProviderEvents();
	this.m_dataProvider = dataProvider;
	this._observeDataProviderEvents();
	this._updateDisplayTypeVisibility();
	this.m_gridView.setDataProvider(this.m_dataProvider);
	this.m_chartView.setDataProvider(this.m_dataProvider);
	this._updateActiveView();
};
oFF.OuAxesView.prototype.setDisplayTypeForVisualization = function(displayType, vizName)
{
	let displayDropdownItem = oFF.XCollectionUtils.findFirst(this.m_dropdown.getItems(), (option) => {
		return option.getCustomObject() === displayType;
	});
	if (oFF.notNull(displayDropdownItem))
	{
		this.m_dropdown.setSelectedItem(displayDropdownItem);
		this._changeVizDisplayType(displayDropdownItem, vizName);
	}
};
oFF.OuAxesView.prototype.setDisplayTypeVisibility = function(visible)
{
	this.m_showDisplayType = visible;
	this._updateDisplayTypeVisibility();
};
oFF.OuAxesView.prototype.setOnChange = function(onChange)
{
	this.m_onChange = onChange;
	this.m_gridView.setOnChange(onChange);
	this.m_chartView.setOnChange(onChange);
};
oFF.OuAxesView.prototype.setPresentation = function(presentationType)
{
	this.m_presentation = presentationType;
	this.m_activeView.setPresentation(presentationType);
};
oFF.OuAxesView.prototype.setQueryManager = oFF.noSupport;
oFF.OuAxesView.prototype.setupView = function()
{
	this.m_dropdownWrapper = oFF.UiContextDummy.getSingleton();
	this.m_dropdown = oFF.UiContextDummy.getSingleton();
};
oFF.OuAxesView.prototype.updateUi = function()
{
	this._updateActiveView();
};

oFF.OuAxesViewDisplayType = function() {};
oFF.OuAxesViewDisplayType.prototype = new oFF.XConstant();
oFF.OuAxesViewDisplayType.prototype._ff_c = "OuAxesViewDisplayType";

oFF.OuAxesViewDisplayType.BAR = null;
oFF.OuAxesViewDisplayType.COLUMN = null;
oFF.OuAxesViewDisplayType.COLUMN_LINE = null;
oFF.OuAxesViewDisplayType.DOUGHNUT = null;
oFF.OuAxesViewDisplayType.GRID = null;
oFF.OuAxesViewDisplayType.LINE = null;
oFF.OuAxesViewDisplayType.METRIC = null;
oFF.OuAxesViewDisplayType.PIE = null;
oFF.OuAxesViewDisplayType.STACKED_AREA = null;
oFF.OuAxesViewDisplayType.STACKED_BAR = null;
oFF.OuAxesViewDisplayType.STACKED_COLUMN = null;
oFF.OuAxesViewDisplayType.STACKED_COLUMN_LINE = null;
oFF.OuAxesViewDisplayType.WATERFALL = null;
oFF.OuAxesViewDisplayType.s_lookup = null;
oFF.OuAxesViewDisplayType.create = function(name)
{
	return oFF.XConstant.setupName(new oFF.OuAxesViewDisplayType(), name);
};
oFF.OuAxesViewDisplayType.createExt = function(name, i18nKey, icon, vizType, chartType)
{
	let newConstant = oFF.OuAxesViewDisplayType.create(name);
	newConstant.m_i18nKey = i18nKey;
	newConstant.m_icon = icon;
	newConstant.m_vizType = vizType;
	newConstant.m_chartType = chartType;
	oFF.OuAxesViewDisplayType.s_lookup.put(name, newConstant);
	return newConstant;
};
oFF.OuAxesViewDisplayType.getAllChartDisplayTypes = function()
{
	return oFF.XCollectionUtils.filter(oFF.OuAxesViewDisplayType.s_lookup, (displayType) => {
		return displayType.getChartType() !== null;
	});
};
oFF.OuAxesViewDisplayType.lookup = function(name)
{
	return oFF.OuAxesViewDisplayType.s_lookup.getByKey(name);
};
oFF.OuAxesViewDisplayType.staticSetup = function()
{
	if (oFF.isNull(oFF.OuAxesViewDisplayType.s_lookup))
	{
		oFF.OuAxesViewDisplayType.s_lookup = oFF.XHashMapByString.create();
		oFF.OuAxesViewDisplayType.GRID = oFF.OuAxesViewDisplayType.createExt(oFF.SemanticBindingType.GRID.getName(), oFF.OuAxesViewI18n.BUILDER_GRID_OPTION, "table-view", oFF.VisualizationType.GRID, null);
		oFF.OuAxesViewDisplayType.BAR = oFF.OuAxesViewDisplayType.createExt(oFF.ChartType.BAR.getName(), oFF.OuAxesViewI18n.BUILDER_BAR_OPTION, oFF.ChartType.BAR.getIcon(), oFF.VisualizationType.CHART, oFF.ChartType.BAR);
		oFF.OuAxesViewDisplayType.COLUMN = oFF.OuAxesViewDisplayType.createExt(oFF.ChartType.COLUMN.getName(), oFF.OuAxesViewI18n.BUILDER_COLUMN_OPTION, oFF.ChartType.COLUMN.getIcon(), oFF.VisualizationType.CHART, oFF.ChartType.COLUMN);
		oFF.OuAxesViewDisplayType.STACKED_BAR = oFF.OuAxesViewDisplayType.createExt(oFF.ChartType.STACKED_BAR.getName(), oFF.OuAxesViewI18n.BUILDER_STACKED_BAR_OPTION, oFF.ChartType.STACKED_BAR.getIcon(), oFF.VisualizationType.CHART, oFF.ChartType.STACKED_BAR);
		oFF.OuAxesViewDisplayType.STACKED_COLUMN = oFF.OuAxesViewDisplayType.createExt(oFF.ChartType.STACKED_COLUMN.getName(), oFF.OuAxesViewI18n.BUILDER_STACKED_COLUMN_OPTION, oFF.ChartType.STACKED_COLUMN.getIcon(), oFF.VisualizationType.CHART, oFF.ChartType.STACKED_COLUMN);
		oFF.OuAxesViewDisplayType.LINE = oFF.OuAxesViewDisplayType.createExt(oFF.ChartType.LINE.getName(), oFF.OuAxesViewI18n.BUILDER_LINE_OPTION, oFF.ChartType.LINE.getIcon(), oFF.VisualizationType.CHART, oFF.ChartType.LINE);
		oFF.OuAxesViewDisplayType.PIE = oFF.OuAxesViewDisplayType.createExt(oFF.ChartType.PIE.getName(), oFF.OuAxesViewI18n.BUILDER_PIE_OPTION, oFF.ChartType.PIE.getIcon(), oFF.VisualizationType.CHART, oFF.ChartType.PIE);
		oFF.OuAxesViewDisplayType.DOUGHNUT = oFF.OuAxesViewDisplayType.createExt(oFF.ChartType.DOUGHNUT.getName(), oFF.OuAxesViewI18n.BUILDER_DONUT_OPTION, oFF.ChartType.DOUGHNUT.getIcon(), oFF.VisualizationType.CHART, oFF.ChartType.DOUGHNUT);
		oFF.OuAxesViewDisplayType.STACKED_AREA = oFF.OuAxesViewDisplayType.createExt(oFF.ChartType.AREA.getName(), oFF.OuAxesViewI18n.BUILDER_STACKED_AREA_OPTION, oFF.ChartType.AREA.getIcon(), oFF.VisualizationType.CHART, oFF.ChartType.AREA);
		oFF.OuAxesViewDisplayType.COLUMN_LINE = oFF.OuAxesViewDisplayType.createExt(oFF.ChartType.COMB_COLUMN_LINE.getName(), oFF.OuAxesViewI18n.BUILDER_COLUMN_LINE_OPTION, oFF.ChartType.COMB_COLUMN_LINE.getIcon(), oFF.VisualizationType.CHART, oFF.ChartType.COMB_COLUMN_LINE);
		oFF.OuAxesViewDisplayType.STACKED_COLUMN_LINE = oFF.OuAxesViewDisplayType.createExt(oFF.ChartType.COMB_STACKED_COLUMN_LINE.getName(), oFF.OuAxesViewI18n.BUILDER_STACKED_COLUMN_LINE_OPTION, oFF.ChartType.COMB_STACKED_COLUMN_LINE.getIcon(), oFF.VisualizationType.CHART, oFF.ChartType.COMB_STACKED_COLUMN_LINE);
		oFF.OuAxesViewDisplayType.METRIC = oFF.OuAxesViewDisplayType.createExt(oFF.ChartType.METRIC.getName(), oFF.OuAxesViewI18n.BUILDER_METRIC_OPTION, oFF.ChartType.METRIC.getIcon(), oFF.VisualizationType.CHART, oFF.ChartType.METRIC);
		oFF.OuAxesViewDisplayType.WATERFALL = oFF.OuAxesViewDisplayType.createExt(oFF.ChartType.WATERFALL.getName(), oFF.OuAxesViewI18n.BUILDER_WATERFALL_OPTION, oFF.ChartType.WATERFALL.getIcon(), oFF.VisualizationType.CHART, oFF.ChartType.WATERFALL);
	}
};
oFF.OuAxesViewDisplayType.prototype.m_chartType = null;
oFF.OuAxesViewDisplayType.prototype.m_i18nKey = null;
oFF.OuAxesViewDisplayType.prototype.m_icon = null;
oFF.OuAxesViewDisplayType.prototype.m_vizType = null;
oFF.OuAxesViewDisplayType.prototype.getChartType = function()
{
	return this.m_chartType;
};
oFF.OuAxesViewDisplayType.prototype.getI18nKey = function()
{
	return this.m_i18nKey;
};
oFF.OuAxesViewDisplayType.prototype.getIcon = function()
{
	return this.m_icon;
};
oFF.OuAxesViewDisplayType.prototype.getVisualizationType = function()
{
	return this.m_vizType;
};

oFF.OuChartAxesView = function() {};
oFF.OuChartAxesView.prototype = new oFF.DfUiContentView();
oFF.OuChartAxesView.prototype._ff_c = "OuChartAxesView";

oFF.OuChartAxesView.createView = function(process, genesis, configuration)
{
	let obj = new oFF.OuChartAxesView();
	obj.m_process = process;
	obj.m_config = configuration;
	obj.initView(genesis);
	return obj;
};
oFF.OuChartAxesView.getLocalizationProvider = function()
{
	return oFF.XLocalizationCenter.getCenter().getLocalizationProviderByName(oFF.OuAxesViewI18n.PROVIDER_NAME);
};
oFF.OuChartAxesView.prototype.m_accountsPanel = null;
oFF.OuChartAxesView.prototype.m_allEventId = null;
oFF.OuChartAxesView.prototype.m_allPanels = null;
oFF.OuChartAxesView.prototype.m_chartCommands = null;
oFF.OuChartAxesView.prototype.m_chartDefinition = null;
oFF.OuChartAxesView.prototype.m_chartOrientation = null;
oFF.OuChartAxesView.prototype.m_colorPanel = null;
oFF.OuChartAxesView.prototype.m_columnPanel = null;
oFF.OuChartAxesView.prototype.m_config = null;
oFF.OuChartAxesView.prototype.m_controller = null;
oFF.OuChartAxesView.prototype.m_dataProvider = null;
oFF.OuChartAxesView.prototype.m_defaultDropCondition = null;
oFF.OuChartAxesView.prototype.m_defaultDropInfoHead = null;
oFF.OuChartAxesView.prototype.m_defaultDropInfoListBetween = null;
oFF.OuChartAxesView.prototype.m_dimensionsPanel = null;
oFF.OuChartAxesView.prototype.m_dimensionsPanelLabel = null;
oFF.OuChartAxesView.prototype.m_focusMoreButton = false;
oFF.OuChartAxesView.prototype.m_focusedDim = null;
oFF.OuChartAxesView.prototype.m_headerLayout = null;
oFF.OuChartAxesView.prototype.m_kfsWillBeMeasures = false;
oFF.OuChartAxesView.prototype.m_leftRightPanel = null;
oFF.OuChartAxesView.prototype.m_linePanel = null;
oFF.OuChartAxesView.prototype.m_measurePanel = null;
oFF.OuChartAxesView.prototype.m_modelStateListenerId = null;
oFF.OuChartAxesView.prototype.m_onChange = null;
oFF.OuChartAxesView.prototype.m_orientationDropdown = null;
oFF.OuChartAxesView.prototype.m_overlapYAxisCheckBox = null;
oFF.OuChartAxesView.prototype.m_overlapYAxisLayout = null;
oFF.OuChartAxesView.prototype.m_panelExpansion = null;
oFF.OuChartAxesView.prototype.m_process = null;
oFF.OuChartAxesView.prototype.m_root = null;
oFF.OuChartAxesView.prototype.m_show100PCCheckBox = null;
oFF.OuChartAxesView.prototype.m_show100PCCheckBoxLayout = null;
oFF.OuChartAxesView.prototype.m_supportedVisualizations = null;
oFF.OuChartAxesView.prototype.m_yLeftPanel = null;
oFF.OuChartAxesView.prototype.m_yLeftyRightWrapperLabel = null;
oFF.OuChartAxesView.prototype.m_yRightPanel = null;
oFF.OuChartAxesView.prototype._observeDataProviderEvents = function()
{
	if (oFF.notNull(this.m_dataProvider))
	{
		this.m_allEventId = this.m_dataProvider.getEventing().getListenerForAll().addConsumer(this.onAnyDataProviderEvent.bind(this));
		this.m_modelStateListenerId = this.m_dataProvider.getEventing().getListenerForModelState().addConsumer(this.onModelStateChangeEvent.bind(this));
	}
};
oFF.OuChartAxesView.prototype._unobserveDataProviderEvents = function()
{
	if (oFF.notNull(this.m_dataProvider))
	{
		this.m_dataProvider.getEventing().getListenerForAll().removeConsumerByUuid(this.m_allEventId);
		this.m_dataProvider.getEventing().getListenerForAll().removeConsumerByUuid(this.m_modelStateListenerId);
		this.m_allEventId = null;
		this.m_modelStateListenerId = null;
	}
};
oFF.OuChartAxesView.prototype.addChartOrientation = function()
{
	if (!this.m_config.isChartingPhase2Enabled())
	{
		let i18n = oFF.OuChartAxesView.getLocalizationProvider();
		this.m_chartOrientation = this.m_root.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
		this.m_chartOrientation.setDirection(oFF.UiFlexDirection.COLUMN);
		this.m_chartOrientation.addCssClass("ffAxesViewVisualizationDropdownContainer");
		this.m_chartOrientation.setPadding(oFF.UiCssBoxEdges.create("10 0.375rem"));
		this.m_chartOrientation.setAlignItems(oFF.UiFlexAlignItems.START);
		this.m_chartOrientation.setJustifyContent(oFF.UiFlexJustifyContent.SPACE_BETWEEN);
		let labelWrapper = this.m_chartOrientation.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
		let chartOrientationLabel = labelWrapper.addNewItemOfType(oFF.UiType.LABEL);
		chartOrientationLabel.setText(i18n.getText(oFF.OuAxesViewI18n.BUILDER_CHART_ORIENTATION));
		chartOrientationLabel.setFlex("1");
		let dropdownWrapper = this.m_chartOrientation.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
		dropdownWrapper.setDirection(oFF.UiFlexDirection.COLUMN);
		dropdownWrapper.useMaxWidth();
		dropdownWrapper.setFlex("2");
		this.m_orientationDropdown = dropdownWrapper.addNewItemOfType(oFF.UiType.DROPDOWN);
		this.m_orientationDropdown.useMaxWidth();
		let optionHorizontal = this.m_orientationDropdown.addNewItem();
		optionHorizontal.setText(i18n.getText(oFF.OuAxesViewI18n.BUILDER_CHART_ORIENTATION_HORIZONTAL));
		optionHorizontal.setIcon("fpa/bar-rows");
		optionHorizontal.setName(oFF.ChartOrientation.HORIZONTAL.getName());
		optionHorizontal.setCustomObject(oFF.ChartOrientation.HORIZONTAL);
		let optionVertical = this.m_orientationDropdown.addNewItem();
		optionVertical.setText(i18n.getText(oFF.OuAxesViewI18n.BUILDER_CHART_ORIENTATION_VERTICAL));
		optionVertical.setIcon("fpa/bar-columns");
		optionVertical.setName(oFF.ChartOrientation.VERTICAL.getName());
		optionVertical.setCustomObject(oFF.ChartOrientation.VERTICAL);
		this.m_orientationDropdown.registerOnSelect(oFF.UiLambdaSelectListener.create((evt) => {
			let selectedItem = evt.getSelectedItem().getCustomObject();
			let currentChartOrientation = this.m_chartCommands.getChartOrientation();
			if (selectedItem !== currentChartOrientation)
			{
				this.m_chartCommands.setChartOrientation(selectedItem);
				this.notifyChangeListeners();
			}
		}));
	}
};
oFF.OuChartAxesView.prototype.addDimensionPanel = function(container, title, visualizationValueType)
{
	let dimPanelListConfig = this.getDimensionPanelListConfig();
	let dimensionPanelList = oFF.OuDimensionPanelList.createDimensionPanelList(this.m_process, this.getGenesis(), this, dimPanelListConfig);
	dimensionPanelList.setDragStartModelComponent(this.dragStartModelComponent.bind(this));
	dimensionPanelList.setDragEnd(this.dragEnd.bind(this));
	dimensionPanelList.getMenuButton().setVisible(false);
	dimensionPanelList.setCustomObject(visualizationValueType);
	this.configurePanel(container, dimensionPanelList, title);
	return dimensionPanelList;
};
oFF.OuChartAxesView.prototype.addMeasurePanelForLineCharts = function()
{
	this.m_leftRightPanel = this.m_root.addNewItemOfType(oFF.UiType.PANEL);
	this.m_leftRightPanel.removeAttribute(oFF.UtUi5AttributeConstants.FAST_NAV_GROUP);
	this.m_leftRightPanel.addCssClass("ffGdsQbFoldable");
	this.m_leftRightPanel.setExpandable(true);
	this.m_leftRightPanel.setExpanded(true);
	this.m_leftRightPanel.setBackgroundDesign(oFF.UiBackgroundDesign.TRANSPARENT);
	let headerLayout = this.m_leftRightPanel.setNewHeaderToolbar();
	headerLayout.removeAttribute(oFF.UtUi5AttributeConstants.FAST_NAV_GROUP);
	this.m_yLeftyRightWrapperLabel = headerLayout.addNewItemOfType(oFF.UiType.LABEL);
	this.m_yLeftyRightWrapperLabel.setFontSize(oFF.UiCssLength.create("1.125rem"));
	this.m_yLeftyRightWrapperLabel.setMargin(oFF.UiCssBoxEdges.create("0"));
	this.m_yLeftyRightWrapperLabel.setText(oFF.OuChartAxesView.getLocalizationProvider().getText(oFF.OlapUiCommonI18n.COMMON_MEASURES));
};
oFF.OuChartAxesView.prototype.addOverlapYAxisCheckBox = function()
{
	let activeViz = this.m_dataProvider.getQueryManager().getQueryModel().getVisualizationManager().getCurrentActiveVisualizationDefinition();
	let currentActiveVizIsTable = activeViz.getProtocolBindingType().isTypeOf(oFF.ProtocolBindingType.SAC_TABLE_GRID);
	if (oFF.notNull(this.m_headerLayout) && oFF.isNull(this.m_overlapYAxisLayout) && !currentActiveVizIsTable)
	{
		this.m_overlapYAxisLayout = this.m_headerLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
		this.m_overlapYAxisLayout.setPadding(oFF.UiCssBoxEdges.create("0 0 0.25rem 0"));
		this.m_overlapYAxisLayout.setDirection(oFF.UiFlexDirection.ROW);
		this.m_overlapYAxisLayout.useMaxWidth();
		this.m_overlapYAxisLayout.setAlignSelf(oFF.UiFlexAlignSelf.FLEX_START);
		this.m_overlapYAxisLayout.setAlignContent(oFF.UiFlexAlignContent.START);
		this.m_overlapYAxisLayout.setFlex("0 0 auto");
		this.m_overlapYAxisLayout.addCssClass("ffOverlapYAxisCheckBoxContainer");
		this.m_overlapYAxisCheckBox = this.m_overlapYAxisLayout.addNewItemOfType(oFF.UiType.CHECKBOX);
		this.m_overlapYAxisCheckBox.registerOnChange(oFF.UiLambdaChangeListener.create((evt1) => {
			let checkbox = evt1.getControl();
			this.setOverlapYAxis(checkbox.isChecked());
			this.notifyChangeListeners();
		}));
		let overlapYAxisLabel = this.m_overlapYAxisLayout.addNewItemOfType(oFF.UiType.LABEL);
		overlapYAxisLabel.setText(oFF.OuChartAxesView.getLocalizationProvider().getText(oFF.OuAxesViewI18n.BUILDER_OVERLAP_Y_AXIS));
		overlapYAxisLabel.setAlignSelf(oFF.UiFlexAlignSelf.CENTER);
		overlapYAxisLabel.setFlex("0 0 auto");
	}
};
oFF.OuChartAxesView.prototype.addPanel = function(container, title)
{
	let dimPanelListConfig = this.getDimensionPanelListConfig();
	dimPanelListConfig.setOnMemberItemCreated((memberView) => {
		memberView.getRoot().addCssClass("ffChartAxesChildItem");
		memberView.getRemoveButton().addCssClass("ffChartAxesRemoveButton");
	});
	let panelList = oFF.OuDimensionPanelList.createDimensionPanelList(this.m_process, this.getGenesis(), this, dimPanelListConfig);
	panelList.setDragStartModelComponent(this.dragStartModelComponent.bind(this));
	panelList.setDragEnd(this.dragEnd.bind(this));
	panelList.getMenuButton().setVisible(false);
	this.configurePanel(container, panelList, title);
	return panelList;
};
oFF.OuChartAxesView.prototype.addPlaceholderItem = function(container, label)
{
	container.setVisible(true);
	let i18n = oFF.OuChartAxesView.getLocalizationProvider();
	let placeholder = this.getGenesis().newControl(oFF.UiType.CUSTOM_LIST_ITEM);
	placeholder.addCssClass("ffGdsQbBuilderPanelChildItem");
	placeholder.addCssClass("ffGdsQbChartPanelEmptyPlaceholder");
	placeholder.setDraggable(false);
	let placeholderFlex = placeholder.setNewContent(oFF.UiType.FLEX_LAYOUT);
	placeholderFlex.useMaxWidth();
	placeholderFlex.setDirection(oFF.UiFlexDirection.ROW);
	placeholderFlex.setOverflow(oFF.UiOverflow.HIDDEN);
	placeholderFlex.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	placeholderFlex.setMinHeight(oFF.UiCssLength.create("2rem"));
	let infoLabel = placeholderFlex.addNewItemOfType(oFF.UiType.LABEL);
	infoLabel.setText(i18n.getText(label));
	infoLabel.setFontStyle(oFF.UiFontStyle.ITALIC);
	container.addItem(placeholder);
};
oFF.OuChartAxesView.prototype.addShow100PCCheckBox = function()
{
	this.m_show100PCCheckBoxLayout = this.m_root.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_show100PCCheckBoxLayout.setPadding(oFF.UiCssBoxEdges.create("5 0.375rem 3"));
	this.m_show100PCCheckBoxLayout.setDirection(oFF.UiFlexDirection.ROW);
	this.m_show100PCCheckBoxLayout.setFlex("0 0 auto");
	this.m_show100PCCheckBox = this.m_show100PCCheckBoxLayout.addNewItemOfType(oFF.UiType.CHECKBOX);
	this.m_show100PCCheckBox.registerOnChange(oFF.UiLambdaChangeListener.create((evt1) => {
		let checkbox = evt1.getControl();
		let stackingType = checkbox.isChecked() ? oFF.ChartStackingType.PERCENT : oFF.ChartStackingType.NORMAL;
		this.getChartDefinition().getChartSetting().setChartStackingType(stackingType);
		this.notifyChangeListeners();
	}));
	let show100PCLabel = this.m_show100PCCheckBoxLayout.addNewItemOfType(oFF.UiType.LABEL);
	show100PCLabel.setText(oFF.OuChartAxesView.getLocalizationProvider().getText(oFF.OuAxesViewI18n.BUILDER_SHOW_AS_100_PERCENT));
	show100PCLabel.setAlignSelf(oFF.UiFlexAlignSelf.CENTER);
	show100PCLabel.setFlex("0 0 auto");
};
oFF.OuChartAxesView.prototype.buildViewUi = function(genesis)
{
	this.m_root = genesis.newRoot(oFF.UiType.FLEX_LAYOUT);
	this.m_root.addCssClass("ffChartAxesView");
	this.m_root.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_root.setHeight(oFF.UiCssLength.AUTO);
	let i18n = oFF.OuChartAxesView.getLocalizationProvider();
	this.addChartOrientation();
	this.addShow100PCCheckBox();
	let phase3 = this.m_config.isChartingPhase_3Enabled();
	let accountsLabel = phase3 ? i18n.getText(oFF.OuAxesViewI18n.BUILDER_CHART_AXIS_Y) : i18n.getText(oFF.OlapUiCommonI18n.COMMON_ACCOUNT);
	this.m_accountsPanel = this.addPanel(this.m_root, accountsLabel);
	if (!phase3)
	{
		this.addMeasurePanelForLineCharts();
		let leftRightPanelLayout = this.m_leftRightPanel.setNewContent(oFF.UiType.FLEX_LAYOUT);
		leftRightPanelLayout.setDirection(oFF.UiFlexDirection.COLUMN);
		this.m_yLeftPanel = this.addPanel(leftRightPanelLayout, i18n.getText(oFF.OuAxesViewI18n.BUILDER_CHART_LINE_YLEFT));
		this.m_yRightPanel = this.addPanel(leftRightPanelLayout, i18n.getText(oFF.OuAxesViewI18n.BUILDER_CHART_LINE_YRIGHT));
	}
	else
	{
		this.m_leftRightPanel = oFF.UiContextDummy.getSingleton();
		this.m_yLeftyRightWrapperLabel = oFF.UiContextDummy.getSingleton();
		this.m_yLeftPanel = this.addPanel(this.m_root, i18n.getText(oFF.OuAxesViewI18n.BUILDER_CHART_LINE_YLEFT));
		this.m_yRightPanel = this.addPanel(this.m_root, i18n.getText(oFF.OuAxesViewI18n.BUILDER_CHART_LINE_YRIGHT));
	}
	this.m_columnPanel = this.addPanel(this.m_root, i18n.getText(oFF.OuAxesViewI18n.BUILDER_CHART_COLUMN));
	this.m_linePanel = this.addPanel(this.m_root, i18n.getText(oFF.OuAxesViewI18n.BUILDER_CHART_LINE));
	let measuresLabel = phase3 ? i18n.getText(oFF.OuAxesViewI18n.BUILDER_CHART_AXIS_Y) : i18n.getText(oFF.OlapUiCommonI18n.COMMON_MEASURES);
	this.m_measurePanel = this.addPanel(this.m_root, measuresLabel);
	let dimensionsLabel = phase3 ? i18n.getText(oFF.OuAxesViewI18n.BUILDER_CHART_AXIS_X) : i18n.getText(oFF.OuAxesViewI18n.BUILDER_CHART_DIMENSIONS);
	this.m_dimensionsPanel = this.addDimensionPanel(this.m_root, dimensionsLabel, oFF.VisualizationValueType.CATEGORY);
	this.m_colorPanel = this.addDimensionPanel(this.m_root, i18n.getText(oFF.OuAxesViewI18n.BUILDER_CHART_COLOR), oFF.VisualizationValueType.COLOR);
	this.m_dimensionsPanelLabel = this.m_dimensionsPanel.getPanelList().getPanelContent().insertNewItemOfType(oFF.UiType.LABEL, 0);
	this.m_dimensionsPanelLabel.setFontSize(oFF.UiCssLength.create("1rem"));
	this.m_dimensionsPanelLabel.addCssClass("ffGdsQbNavigationPanelDimensionAttributesList");
	this.m_dimensionsPanelLabel.setVisible(false);
	this.m_dimensionsPanelLabel.setFontWeight(oFF.UiFontWeight.BOLD);
	this.m_dimensionsPanelLabel.setTextAlign(oFF.UiTextAlign.LEFT);
	this.m_dimensionsPanelLabel.setFlex("0 0 auto");
};
oFF.OuChartAxesView.prototype.configureDragDropDimension = function(model, dimensionPanelList)
{
	let panelList = dimensionPanelList.getPanelList();
	let header = panelList.getHeaderLayout();
	let list = panelList.getList();
	let dropZone = panelList.getDropZone();
	let node = oFF.OlapUiDimensionUtil.getMemberNode(model);
	let universalAccountModel = this.getQueryManager().getQueryModel().isUniversalAccountModel();
	let isSecondaryStructureMember = oFF.notNull(node) && (node.getDimension().getDimensionType() === oFF.DimensionType.SECONDARY_STRUCTURE || node.getDimension().getDimensionType() === oFF.DimensionType.MEASURE_STRUCTURE && universalAccountModel);
	if (isSecondaryStructureMember)
	{
		this.setDropInfo(header, list, dropZone, oFF.UiLambdaDropListener.create((modelDrop1) => {
			this.moveDimensionToFeed(node.getDimension(), dimensionPanelList, modelDrop1, true);
			this.dropMeasureToFeed(dimensionPanelList, node, modelDrop1);
			this.notifyChangeListeners();
		}));
	}
	else if (oFF.OlapUiDimensionUtil.isDimension(model))
	{
		this.setDropInfo(header, list, dropZone, oFF.UiLambdaDropListener.create((modelDrop2) => {
			let modified = this.moveDimensionToFeed(model, dimensionPanelList, modelDrop2, false);
			if (modified)
			{
				this.notifyChangeListeners();
			}
		}));
	}
};
oFF.OuChartAxesView.prototype.configureDragDropMeasures = function(model, dimPanelList)
{
	let node = oFF.OlapUiDimensionUtil.getMemberNode(model);
	if (oFF.isNull(node))
	{
		return;
	}
	let panelList = dimPanelList.getPanelList();
	let header = panelList.getHeaderLayout();
	let list = panelList.getList();
	let dropZone = panelList.getDropZone();
	let memberDimension = node.getDimension();
	let measureBeingDropped = memberDimension.getDimensionType() === oFF.DimensionType.MEASURE_STRUCTURE && (this.m_kfsWillBeMeasures || dimPanelList === this.m_measurePanel);
	let accountMemberBeingDropped = memberDimension.getDimensionType() === oFF.DimensionType.ACCOUNT && !this.m_kfsWillBeMeasures && dimPanelList !== this.m_measurePanel;
	let allowDrop = measureBeingDropped || accountMemberBeingDropped;
	if (allowDrop)
	{
		this.setDropInfo(header, list, dropZone, oFF.UiLambdaDropListener.create((modelDrop) => {
			this.dropMeasureToFeed(dimPanelList, node, modelDrop);
			this.expandMemberNode(node);
			this.notifyChangeListeners();
		}));
	}
};
oFF.OuChartAxesView.prototype.configurePanel = function(container, dimPanelList, title)
{
	let panelList = dimPanelList.getPanelList();
	let panel = panelList.getPanel();
	panel.addAttribute(oFF.UtUi5AttributeConstants.FAST_NAV_GROUP, "true");
	panel.addCssClass("ffChartAxesViewPanel");
	panel.addCssClass("ffGdsQbBuilderPanelAxisPanel");
	panel.addCssClass("ffGdsQbFoldableBorderContent");
	panel.setHeight(oFF.UiCssLength.AUTO);
	panel.registerOnCollapse(oFF.UiLambdaCollapseListener.create((evt1) => {
		this.m_panelExpansion.putBoolean(title, false);
	}));
	panel.registerOnExpand(oFF.UiLambdaExpandListener.create((evt2) => {
		this.m_panelExpansion.putBoolean(title, true);
	}));
	panelList.getDropZone().setMinHeight(oFF.UiCssLength.create("2rem"));
	panelList.getHeaderLayout().addCssClass("ffChartAxesViewPanelHeaderToolbar");
	panelList.getTitle().setText(title);
	panelList.getList().setShowNoData(false);
	this.m_allPanels.add(dimPanelList);
	container.addItem(dimPanelList.getView());
};
oFF.OuChartAxesView.prototype.configurePanelVisibility = function()
{
	if (!oFF.XObjectExt.isValidObject(this.getQueryManager()) || !oFF.XObjectExt.isValidObject(this.getQueryManager().getQueryModel()) || !oFF.XObjectExt.isValidObject(this.m_chartDefinition))
	{
		return;
	}
	let queryModel = this.getQueryManager().getQueryModel();
	this.m_accountsPanel.setVisible(queryModel.isAccountModel());
	this.m_show100PCCheckBoxLayout.setVisible(false);
	let chartType = this.m_chartDefinition.getChartSetting().getChartType();
	if (chartType === oFF.ChartType.PIE || chartType === oFF.ChartType.DOUGHNUT)
	{
		this.m_leftRightPanel.setVisible(false);
		this.m_yLeftPanel.setVisible(false);
		this.m_yRightPanel.setVisible(false);
		this.m_chartOrientation.setVisible(false);
		this.m_dimensionsPanel.setVisible(false);
		this.m_columnPanel.setVisible(false);
		this.m_linePanel.setVisible(false);
		this.m_measurePanel.setVisible(!queryModel.isAccountModel());
		this.m_colorPanel.setVisible(true);
		this.removeAddedHeaderElements();
	}
	else if (chartType === oFF.ChartType.COMB_COLUMN_LINE || chartType === oFF.ChartType.COMB_STACKED_COLUMN_LINE)
	{
		this.m_measurePanel.setVisible(false);
		this.m_accountsPanel.setVisible(false);
		this.m_leftRightPanel.setVisible(false);
		this.m_yLeftPanel.setVisible(false);
		this.m_yRightPanel.setVisible(false);
		this.m_columnPanel.setVisible(true);
		this.m_linePanel.setVisible(true);
		this.m_chartOrientation.setVisible(false);
		this.m_dimensionsPanel.setVisible(true);
		this.m_colorPanel.setVisible(true);
		this.addOverlapYAxisCheckBox();
	}
	else if (chartType.isTypeOf(oFF.ChartType.BAR_COLUMN) || chartType === oFF.ChartType.AREA)
	{
		this.m_leftRightPanel.setVisible(false);
		this.m_yLeftPanel.setVisible(false);
		this.m_yRightPanel.setVisible(false);
		this.m_columnPanel.setVisible(false);
		this.m_linePanel.setVisible(false);
		this.m_measurePanel.setVisible(!queryModel.isAccountModel());
		this.m_chartOrientation.setVisible(true);
		this.m_dimensionsPanel.setVisible(true);
		this.m_colorPanel.setVisible(true);
		if (chartType.isStackingChartType())
		{
			this.m_show100PCCheckBoxLayout.setVisible(true);
		}
		this.removeAddedHeaderElements();
	}
	else if (chartType === oFF.ChartType.LINE)
	{
		this.m_measurePanel.setVisible(false);
		this.m_accountsPanel.setVisible(false);
		this.m_columnPanel.setVisible(false);
		this.m_linePanel.setVisible(false);
		this.m_leftRightPanel.setVisible(true);
		this.m_yLeftPanel.setVisible(true);
		this.m_yRightPanel.setVisible(true);
		this.m_chartOrientation.setVisible(false);
		this.m_dimensionsPanel.setVisible(true);
		this.m_colorPanel.setVisible(true);
		if (this.getQueryManager().getQueryModel().isUniversalAccountModel())
		{
			this.m_yLeftyRightWrapperLabel.setText(oFF.OuChartAxesView.getLocalizationProvider().getText(oFF.OlapUiCommonI18n.COMMON_ACCOUNT));
		}
		this.removeAddedHeaderElements();
	}
	else
	{
		this.setStatusMessage("unsupported chart type");
	}
};
oFF.OuChartAxesView.prototype.destroyView = function()
{
	this._unobserveDataProviderEvents();
	this.m_process = null;
	this.m_root = oFF.XObjectExt.release(this.m_root);
	this.m_panelExpansion = oFF.XObjectExt.release(this.m_panelExpansion);
	this.m_chartDefinition = null;
	this.m_chartCommands = oFF.XObjectExt.release(this.m_chartCommands);
	this.m_accountsPanel = oFF.XObjectExt.release(this.m_accountsPanel);
	this.m_measurePanel = oFF.XObjectExt.release(this.m_measurePanel);
	this.m_chartOrientation = null;
	this.m_orientationDropdown = null;
	this.m_dimensionsPanel = oFF.XObjectExt.release(this.m_dimensionsPanel);
	this.m_yLeftPanel = oFF.XObjectExt.release(this.m_yLeftPanel);
	this.m_yRightPanel = oFF.XObjectExt.release(this.m_yRightPanel);
	this.m_colorPanel = oFF.XObjectExt.release(this.m_colorPanel);
	this.m_config = null;
	this.m_yLeftyRightWrapperLabel = null;
	this.m_show100PCCheckBox = null;
};
oFF.OuChartAxesView.prototype.determineIfKFsWillBeMeasures = function()
{
	let queryModel = this.getQueryManager().getQueryModel();
	let accountDimension = queryModel.getAccountDimension();
	if (queryModel.isUniversalAccountModel())
	{
		let accountAxis = accountDimension.getAxisType();
		if (accountAxis === oFF.AxisType.COLUMNS)
		{
			this.m_kfsWillBeMeasures = false;
		}
	}
	else if (queryModel.isAccountModel())
	{
		this.m_kfsWillBeMeasures = false;
	}
};
oFF.OuChartAxesView.prototype.dragEnd = function()
{
	oFF.XCollectionUtils.forEach(this.m_allPanels, (dimPanelList) => {
		let panelList = dimPanelList.getPanelList();
		panelList.getHeaderLayout().setDropInfo(null);
		panelList.getList().setDropInfo(null);
		panelList.getDropZone().setDropInfo(null);
	});
};
oFF.OuChartAxesView.prototype.dragStartModelComponent = function(model)
{
	this.configureDragDropMeasures(model, this.m_accountsPanel);
	this.configureDragDropMeasures(model, this.m_measurePanel);
	this.configureDragDropMeasures(model, this.m_yLeftPanel);
	this.configureDragDropMeasures(model, this.m_yRightPanel);
	this.configureDragDropMeasures(model, this.m_columnPanel);
	this.configureDragDropMeasures(model, this.m_linePanel);
	this.configureDragDropDimension(model, this.m_dimensionsPanel);
	this.configureDragDropDimension(model, this.m_colorPanel);
};
oFF.OuChartAxesView.prototype.dropMeasureToFeed = function(panelList, node, modelDrop)
{
	let dropIndex = oFF.OuDesignerDragDropUtilities.calcDropIndex(modelDrop);
	this.moveMemberToIndexInternal(panelList, node, dropIndex);
};
oFF.OuChartAxesView.prototype.expandDimension = function(name)
{
	this.m_colorPanel.expandDimension(name);
	this.m_dimensionsPanel.expandDimension(name);
};
oFF.OuChartAxesView.prototype.expandMember = function(dimName, memberName)
{
	if (this.getQueryManager() === null)
	{
		return;
	}
	let dimension = this.getQueryManager().getQueryModel().getDimensionByName(dimName);
	let members = this.m_controller.getMembersByDimension(dimension);
	let node = members.getByKey(memberName);
	this.expandMemberNode(node);
};
oFF.OuChartAxesView.prototype.expandMemberNode = function(node)
{
	this.m_accountsPanel.expandToMemberNode(node);
	this.m_measurePanel.expandToMemberNode(node);
	this.m_yLeftPanel.expandToMemberNode(node);
	this.m_yRightPanel.expandToMemberNode(node);
};
oFF.OuChartAxesView.prototype.getChartDefinition = function()
{
	return this.m_chartDefinition;
};
oFF.OuChartAxesView.prototype.getDataProvider = function()
{
	return this.m_dataProvider;
};
oFF.OuChartAxesView.prototype.getDefaultDropCondition = function()
{
	if (oFF.isNull(this.m_defaultDropCondition))
	{
		this.m_defaultDropCondition = oFF.UiDropCondition.createSimple(null, this.getDragElementTag(), null);
	}
	return this.m_defaultDropCondition;
};
oFF.OuChartAxesView.prototype.getDefaultDropInfoHead = function()
{
	if (oFF.isNull(this.m_defaultDropInfoHead))
	{
		this.m_defaultDropInfoHead = oFF.UiDropInfo.create(oFF.UiDropPosition.ON, oFF.UiDropEffect.MOVE, oFF.UiDropLayout.DEFAULT, null);
	}
	return this.m_defaultDropInfoHead;
};
oFF.OuChartAxesView.prototype.getDefaultDropInfoList = function()
{
	if (oFF.isNull(this.m_defaultDropInfoListBetween))
	{
		this.m_defaultDropInfoListBetween = oFF.UiDropInfo.create(oFF.UiDropPosition.BETWEEN, oFF.UiDropEffect.MOVE, oFF.UiDropLayout.DEFAULT, oFF.UiAggregation.ITEMS);
	}
	return this.m_defaultDropInfoListBetween;
};
oFF.OuChartAxesView.prototype.getDimensionMemberVisibility = function(dimension)
{
	return this.m_controller.getMemberVisibility(dimension);
};
oFF.OuChartAxesView.prototype.getDimensionMembers = function(dimension)
{
	return this.m_controller.getMembersInOrder(dimension);
};
oFF.OuChartAxesView.prototype.getDimensionPanelListConfig = function()
{
	let dimPanelListConfig = oFF.OuDimensionPanelListConfig.createConfig(this.m_config.getApplication());
	dimPanelListConfig.setMenuProvider(this.m_config.getMenuProvider());
	dimPanelListConfig.setLocalizationProviderName(oFF.OuAxesViewI18n.PROVIDER_NAME);
	dimPanelListConfig.setDefaultPresentation(this.m_config.getDefaultPresentation());
	dimPanelListConfig.setCalculationsEnabled(this.m_config.isCalculationsEnabled());
	dimPanelListConfig.setRightClickContextMenuForDimensionEnabled(this.m_config.isRightClickContextMenuForDimensionEnabled());
	dimPanelListConfig.setRightClickContextMenuForAttributeEnabled(this.m_config.isRightClickContextMenuForAttributeEnabled());
	dimPanelListConfig.setRightClickContextMenuForMemberEnabled(this.m_config.isRightClickContextMenuForMemberEnabled());
	dimPanelListConfig.setDragElementTag(this.m_config.getDragElementTag());
	dimPanelListConfig.setShowMeasureMoreMenuButton(true);
	dimPanelListConfig.setFocusContext(this);
	return dimPanelListConfig;
};
oFF.OuChartAxesView.prototype.getDragElementTag = function()
{
	return this.m_config.getDragElementTag();
};
oFF.OuChartAxesView.prototype.getFocusedName = function()
{
	return this.m_focusedDim;
};
oFF.OuChartAxesView.prototype.getQueryManager = function()
{
	return oFF.notNull(this.m_dataProvider) ? this.m_dataProvider.getQueryManager() : null;
};
oFF.OuChartAxesView.prototype.getVisualizationTypeOfMember = function(member)
{
	let chartSetting = this.m_chartDefinition.getChartSetting();
	let types = chartSetting.getVisualizationValueTypes();
	for (let i = 0; i < types.size(); i++)
	{
		let visualizationValueType = types.get(i);
		let valueSelections = chartSetting.getTypedValueSelectionsForType(visualizationValueType);
		let selection = oFF.XCollectionUtils.findFirst(valueSelections, (valueSelection) => {
			return oFF.XString.isEqual(valueSelection.getDimensionMember().getName(), member.getName());
		});
		if (oFF.notNull(selection))
		{
			return visualizationValueType;
		}
	}
	return null;
};
oFF.OuChartAxesView.prototype.getVisualizationValueTypeForPanel = function(panelList)
{
	let chartType = this.m_chartDefinition.getChartSetting().getChartType();
	if (panelList === this.m_accountsPanel)
	{
		return chartType.getPrimaryValueFeed();
	}
	if (panelList === this.m_measurePanel)
	{
		if (this.getQueryManager().getQueryModel().isAccountModel())
		{
			return chartType.getFeedForQueryModelAxis(oFF.AxisType.ROWS);
		}
		return chartType.getPrimaryValueFeed();
	}
	if (panelList === this.m_yLeftPanel)
	{
		return chartType.getPrimaryValueFeed();
	}
	if (panelList === this.m_yRightPanel)
	{
		return chartType.getSecondaryValueFeed();
	}
	if (panelList === this.m_columnPanel)
	{
		return chartType.getPrimaryValueFeed();
	}
	if (panelList === this.m_linePanel)
	{
		return chartType.getSecondaryValueFeed();
	}
	if (panelList === this.m_dimensionsPanel)
	{
		return oFF.VisualizationValueType.CATEGORY;
	}
	if (panelList === this.m_colorPanel)
	{
		return oFF.VisualizationValueType.COLOR;
	}
	throw oFF.XException.createIllegalArgumentException("no viz value type for panel list");
};
oFF.OuChartAxesView.prototype.handleAttributeRemovalFromList = function(panelList, attribute) {};
oFF.OuChartAxesView.prototype.handleDimensionRemovalFromList = function(panelList, dimension)
{
	let visualizationType = panelList.getCustomObject();
	this.m_controller.removeDimension(dimension, () => {
		this.removeDimensionFromFeed(dimension, visualizationType);
		this.notifyChangeListeners();
	});
};
oFF.OuChartAxesView.prototype.handleMemberRemovalFromList = function(panelList, node)
{
	let visualizationType = panelList.getCustomObject();
	this.removeMeasureFromFeed(node, visualizationType);
};
oFF.OuChartAxesView.prototype.isFocusMoreButton = function()
{
	return this.m_focusMoreButton;
};
oFF.OuChartAxesView.prototype.moveChildrenIfAny = function(node, oldVisualizationValueType, newVisualizationValueType)
{
	if (node.hasChildren())
	{
		let chartSetting = this.m_chartDefinition.getChartSetting();
		let children = node.getChildren();
		for (let i = 0; i < children.size(); i++)
		{
			let child = children.get(i);
			let member = child.getDimensionMember();
			let newKeyfigureSelection = oFF.QKeyFigureSelection.create(this.getQueryManager().getQueryModel(), member, this.m_chartDefinition, newVisualizationValueType);
			chartSetting.removeTypedValueSelectionForDimensionMember(member, oldVisualizationValueType);
			if (oFF.notNull(newKeyfigureSelection))
			{
				chartSetting.addTypedValueSelection(newVisualizationValueType, newKeyfigureSelection);
			}
			this.moveChildrenIfAny(child, oldVisualizationValueType, newVisualizationValueType);
		}
	}
};
oFF.OuChartAxesView.prototype.moveDimensionToFeed = function(dimension, panelList, modelDrop, ignoreIndex)
{
	let visualizationValueType = this.getVisualizationValueTypeForPanel(panelList);
	let dropIndex = oFF.OuDesignerDragDropUtilities.calcDropIndex(modelDrop);
	let dimensionsInFeed = this.m_chartCommands.getDimensionInFeed(visualizationValueType);
	if (!oFF.XCollectionUtils.hasElements(dimensionsInFeed))
	{
		dropIndex = 0;
	}
	if (dimensionsInFeed.contains(dimension) && (ignoreIndex || dropIndex === dimensionsInFeed.getIndex(dimension)))
	{
		return false;
	}
	this.removeDimension(dimension);
	this.m_chartCommands.moveDimensionToFeedAtIndex(dimension, visualizationValueType, dropIndex);
	this.m_panelExpansion.putBoolean(panelList.getPanelList().getTitle().getText(), true);
	return true;
};
oFF.OuChartAxesView.prototype.moveMemberToIndex = function(panelList, node, index)
{
	this.moveMemberToIndexInternal(panelList, node, index);
	this.notifyChangeListeners();
};
oFF.OuChartAxesView.prototype.moveMemberToIndexInternal = function(panelList, node, index)
{
	let visualizationValueType = this.getVisualizationValueTypeForPanel(panelList);
	let member = node.getDimensionMember();
	let chartSetting = this.m_chartDefinition.getChartSetting();
	let oldVisualizationType = this.getVisualizationTypeOfMember(member);
	if (chartSetting.getChartType().isSingleMeasureChartType() && visualizationValueType === oFF.VisualizationValueType.SIZE)
	{
		chartSetting.clearTypedValueSelectionsForType(visualizationValueType);
		this.m_controller.removeAllMembers(member.getDimension());
	}
	this.m_controller.addMember(node);
	this.m_controller.moveMemberToIndex(node, index);
	let newKeyfigureSelection = oFF.QKeyFigureSelection.create(this.getQueryManager().getQueryModel(), member, this.m_chartDefinition, visualizationValueType);
	chartSetting.removeTypedValueSelectionForDimensionMember(member, oldVisualizationType);
	chartSetting.insertTypedValueSelection(visualizationValueType, index, newKeyfigureSelection);
	this.moveChildrenIfAny(node, oldVisualizationType, visualizationValueType);
	this.m_panelExpansion.putBoolean(panelList.getPanelList().getTitle().getText(), true);
};
oFF.OuChartAxesView.prototype.notifyChangeListeners = function()
{
	if (oFF.notNull(this.m_onChange))
	{
		this.m_onChange(null);
	}
	if (oFF.notNull(this.m_dataProvider))
	{
		if (oFF.notNull(this.m_chartDefinition))
		{
			this.m_dataProvider.getEventing().notifyExternalVisualizationChange(this.m_chartDefinition.getName());
		}
		this.m_dataProvider.getEventing().notifyExternalModelChange(null);
	}
};
oFF.OuChartAxesView.prototype.onAnyDataProviderEvent = function(allEvt)
{
	let lifecycleEvent = allEvt.getLifecycleEvent();
	if (oFF.notNull(lifecycleEvent) && lifecycleEvent.getNewState() === oFF.DataProviderLifecycle.RELEASED)
	{
		this.setDataProvider(null);
		return;
	}
	let olapAllEvent = oFF.OlapDataProviderUtil.getOlapAllEvent(allEvt);
	if (oFF.notNull(olapAllEvent))
	{
		if (olapAllEvent.getModelChangeEvent() !== null || olapAllEvent.getVisualizationChangeEvent() !== null)
		{
			this.updateUi();
			return;
		}
		let dataFetchEvent = olapAllEvent.getResultDataFetchEvent();
		if (oFF.notNull(this.m_chartDefinition) && oFF.notNull(dataFetchEvent))
		{
			if (dataFetchEvent.getStep() === oFF.OlapDataProviderResultDataFetchStep.VISUALIZATION_FILLED && dataFetchEvent.getFilledVisualizationNames().contains(this.m_chartDefinition.getName()))
			{
				this.updateUi();
			}
		}
	}
};
oFF.OuChartAxesView.prototype.onModelStateChangeEvent = function(evt)
{
	if (evt.getNewState() === oFF.OlapDataProviderModelState.QUERY)
	{
		this.updateUi();
	}
};
oFF.OuChartAxesView.prototype.placeholdersForMeasures = function()
{
	let message = !(this.getQueryManager().getQueryModel().isUniversalAccountModel() || this.getQueryManager().getQueryModel().isAccountModel()) ? oFF.OuAxesViewI18n.BUILDER_ADD_MEASURE_INFO : oFF.OuAxesViewI18n.BUILDER_ADD_ACCOUNT_INFO;
	let messageOptional = !(this.getQueryManager().getQueryModel().isUniversalAccountModel() || this.getQueryManager().getQueryModel().isAccountModel()) ? oFF.OuAxesViewI18n.BUILDER_ADD_MEASURE_OPTIONAL : oFF.OuAxesViewI18n.BUILDER_ADD_ACCOUNT_OPTIONAL;
	if (this.m_measurePanel.isVisible() && !this.m_measurePanel.getPanelList().getList().hasItems())
	{
		this.addPlaceholderItem(this.m_measurePanel.getPanelList().getList(), message);
	}
	else if (this.m_yRightPanel.isVisible())
	{
		let yLeftList = this.m_yLeftPanel.getPanelList().getList();
		let yRightList = this.m_yRightPanel.getPanelList().getList();
		if (!yLeftList.hasItems() && !yRightList.hasItems())
		{
			this.addPlaceholderItem(yLeftList, message);
			this.addPlaceholderItem(yRightList, message);
		}
		else if (!yLeftList.hasItems())
		{
			this.addPlaceholderItem(yLeftList, messageOptional);
		}
		else if (!yRightList.hasItems())
		{
			this.addPlaceholderItem(yRightList, messageOptional);
		}
	}
	else if (this.m_columnPanel.isVisible())
	{
		let columnList = this.m_columnPanel.getPanelList().getList();
		let lineList = this.m_linePanel.getPanelList().getList();
		if (!columnList.hasItems() && !lineList.hasItems())
		{
			this.addPlaceholderItem(columnList, message);
			this.addPlaceholderItem(lineList, message);
		}
		else if (!columnList.hasItems())
		{
			this.addPlaceholderItem(columnList, messageOptional);
		}
		else if (!lineList.hasItems())
		{
			this.addPlaceholderItem(lineList, messageOptional);
		}
	}
};
oFF.OuChartAxesView.prototype.removeAddedHeaderElements = function()
{
	if (oFF.notNull(this.m_overlapYAxisLayout))
	{
		this.m_headerLayout.removeItem(this.m_overlapYAxisLayout);
		this.m_overlapYAxisLayout = oFF.XObjectExt.release(this.m_overlapYAxisLayout);
		this.m_overlapYAxisCheckBox = oFF.XObjectExt.release(this.m_overlapYAxisCheckBox);
	}
};
oFF.OuChartAxesView.prototype.removeDimension = function(dimension)
{
	for (let i = 0; i < this.m_supportedVisualizations.size(); i++)
	{
		let visualizationValueType = this.m_supportedVisualizations.get(i);
		let colorDims = this.m_chartCommands.getDimensionInFeed(visualizationValueType);
		if (colorDims.contains(dimension))
		{
			this.m_chartCommands.removeDimensionFromFeed(dimension, visualizationValueType);
		}
	}
};
oFF.OuChartAxesView.prototype.removeDimensionFromFeed = function(dimension, visualizationValueType)
{
	this.m_chartCommands.removeDimensionFromFeed(dimension, visualizationValueType);
};
oFF.OuChartAxesView.prototype.removeMeasureFromFeed = function(node, visualizationValueType)
{
	let member = node.getDimensionMember();
	this.m_chartCommands.removeValueMapping(visualizationValueType, member);
	this.m_controller.removeMember(node);
	this.moveChildrenIfAny(node, visualizationValueType, null);
	this.notifyChangeListeners();
};
oFF.OuChartAxesView.prototype.resetFocus = function()
{
	this.m_focusedDim = null;
	this.m_focusMoreButton = false;
};
oFF.OuChartAxesView.prototype.resetUi = function()
{
	this.m_root.setBusy(false);
	this.getGenesis().setRoot(this.m_root);
};
oFF.OuChartAxesView.prototype.setChartDefinition = function(chartDefinition)
{
	this.m_chartDefinition = chartDefinition;
	if (this.getQueryManager() !== null)
	{
		this.m_chartCommands = this.getQueryManager().getQueryModel().getChartCommands(this.m_chartDefinition.getName());
	}
};
oFF.OuChartAxesView.prototype.setDataProvider = function(dataProvider)
{
	this._unobserveDataProviderEvents();
	this.m_dataProvider = dataProvider;
	this._observeDataProviderEvents();
	this.m_controller.setQueryManager(this.getQueryManager());
	this.updateUi();
};
oFF.OuChartAxesView.prototype.setDropInfo = function(header, list, dropZone, listener)
{
	header.setDropInfo(this.getDefaultDropInfoHead());
	header.setDropCondition(this.getDefaultDropCondition());
	header.registerOnDrop(listener);
	list.setDropInfo(this.getDefaultDropInfoList());
	list.setDropCondition(this.getDefaultDropCondition());
	list.registerOnDrop(listener);
	if (oFF.notNull(dropZone))
	{
		dropZone.setDropInfo(this.getDefaultDropInfoHead());
		dropZone.setDropCondition(this.getDefaultDropCondition());
		dropZone.registerOnDrop(listener);
	}
};
oFF.OuChartAxesView.prototype.setFocusMoreButton = function(focusMoreButton)
{
	this.m_focusMoreButton = focusMoreButton;
};
oFF.OuChartAxesView.prototype.setFocusedName = function(name)
{
	this.m_focusedDim = name;
};
oFF.OuChartAxesView.prototype.setHeaderLayout = function(headerLayout)
{
	this.m_headerLayout = headerLayout;
};
oFF.OuChartAxesView.prototype.setOnChange = function(onChange)
{
	this.m_onChange = onChange;
};
oFF.OuChartAxesView.prototype.setOverlapYAxis = function(allowOverlapYAxes)
{
	this.getChartDefinition().getChartSetting().setAreYAxisOnSameSide(!allowOverlapYAxes);
};
oFF.OuChartAxesView.prototype.setPresentation = function(presentationType)
{
	this.m_dimensionsPanel.setPresentation(presentationType);
	this.m_colorPanel.setPresentation(presentationType);
};
oFF.OuChartAxesView.prototype.setQueryManager = oFF.noSupport;
oFF.OuChartAxesView.prototype.setStatusMessage = function(message)
{
	let statusFlex = this.getGenesis().newRoot(oFF.UiType.FLEX_LAYOUT);
	statusFlex.useMaxSpace();
	statusFlex.setDirection(oFF.UiFlexDirection.COLUMN);
	statusFlex.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	let label = statusFlex.addNewItemOfType(oFF.UiType.LABEL);
	label.setTextAlign(oFF.UiTextAlign.CENTER);
	label.setText(message);
};
oFF.OuChartAxesView.prototype.setupView = function()
{
	this.m_controller = oFF.OuChartAxesController.createChartController();
	this.m_allPanels = oFF.XList.create();
	this.m_panelExpansion = oFF.XProperties.create();
	this.m_kfsWillBeMeasures = true;
	this.m_chartOrientation = oFF.UiContextDummy.getSingleton();
	this.m_orientationDropdown = oFF.UiContextDummy.getSingleton();
	this.m_show100PCCheckBox = oFF.UiContextDummy.getSingleton();
	this.m_supportedVisualizations = oFF.XListOfNameObject.create();
	this.m_supportedVisualizations.add(oFF.VisualizationValueType.COLOR);
	this.m_supportedVisualizations.add(oFF.VisualizationValueType.CATEGORY);
};
oFF.OuChartAxesView.prototype.updateDimensionFeed = function(dimensionPanelList, visualizationValueType)
{
	if (!dimensionPanelList.isVisible())
	{
		return;
	}
	let dimensions = this.m_chartCommands.getDimensionInFeed(visualizationValueType);
	dimensionPanelList.updateViewWithDimensions(dimensions);
	if (!dimensionPanelList.getPanelList().getList().hasItems())
	{
		this.addPlaceholderItem(dimensionPanelList.getPanelList().getList(), oFF.OuAxesViewI18n.BUILDER_ADD_DIMENSION_OPTIONAL);
	}
	if (dimensionPanelList === this.m_dimensionsPanel)
	{
		let phase3 = this.m_config.isChartingPhase_3Enabled();
		if (phase3)
		{
			let i18n = oFF.OuChartAxesView.getLocalizationProvider();
			let barType = this.getChartDefinition().getChartSetting().getChartType().isTypeOf(oFF.ChartType.BAR);
			let label = barType ? i18n.getText(oFF.OuAxesViewI18n.BUILDER_CHART_AXIS_Y) : i18n.getText(oFF.OuAxesViewI18n.BUILDER_CHART_AXIS_X);
			dimensionPanelList.getPanelList().getTitle().setText(label);
		}
		else
		{
			let i18n = oFF.OuChartAxesView.getLocalizationProvider();
			let xAxis = i18n.getText(oFF.OuAxesViewI18n.BUILDER_CHART_AXIS_X);
			let yAxis = i18n.getText(oFF.OuAxesViewI18n.BUILDER_CHART_AXIS_Y);
			let chartType = this.m_chartDefinition.getChartSetting().getChartType();
			let axisLabel = chartType === oFF.ChartType.LINE ? xAxis : chartType.isTypeOf(oFF.ChartType.COLUMN) ? xAxis : yAxis;
			this.m_dimensionsPanelLabel.setText(axisLabel);
			this.m_dimensionsPanelLabel.setVisible(true);
		}
	}
};
oFF.OuChartAxesView.prototype.updateMeasureFeed = function(dimPanelList, visualizationValueType)
{
	let panelList = dimPanelList.getPanelList();
	if (!panelList.isVisible())
	{
		return;
	}
	let lineChartMeasureAxis = dimPanelList === this.m_yLeftPanel || dimPanelList === this.m_yRightPanel;
	let combColumnLineMeasureAxis = dimPanelList === this.m_columnPanel || dimPanelList === this.m_linePanel;
	let phase3 = this.m_config.isChartingPhase_3Enabled();
	if (phase3 && !lineChartMeasureAxis && !combColumnLineMeasureAxis)
	{
		let i18n = oFF.OuChartAxesView.getLocalizationProvider();
		let barType = this.getChartDefinition().getChartSetting().getChartType().isTypeOf(oFF.ChartType.BAR);
		let pieOrDonut = this.getChartDefinition().getChartSetting().getChartType().isSingleMeasureChartType();
		let label = barType ? i18n.getText(oFF.OuAxesViewI18n.BUILDER_CHART_AXIS_X) : pieOrDonut ? i18n.getText(oFF.OuAxesViewI18n.BUILDER_CHART_VALUE_SELECTION) : i18n.getText(oFF.OuAxesViewI18n.BUILDER_CHART_AXIS_Y);
		panelList.getTitle().setText(label);
	}
	let queryModel = this.getQueryManager().getQueryModel();
	let accountModel = queryModel.isAccountModel();
	let mainMeasuresPanelList = dimPanelList === this.m_accountsPanel || lineChartMeasureAxis || combColumnLineMeasureAxis;
	let membersOfDimension = accountModel && mainMeasuresPanelList ? queryModel.getAccountDimension() : queryModel.getMeasureDimension();
	let membersOfNonAccountDimension = accountModel && membersOfDimension !== queryModel.getAccountDimension();
	let visualizationValueTypeToFetchMembers = membersOfNonAccountDimension ? null : visualizationValueType;
	let members = this.m_controller.getMembersInOrder(membersOfDimension);
	let visibleMembers = this.m_chartCommands.getMeasuresForDimension(visualizationValueTypeToFetchMembers, membersOfDimension);
	let visibleMemberNames = oFF.XStream.of(visibleMembers).collect(oFF.XStreamCollector.toSetOfString((visibleMember) => {
		return visibleMember.getName();
	}));
	dimPanelList.updateViewWithMembers(members, visibleMemberNames);
	dimPanelList.setCustomObject(visualizationValueTypeToFetchMembers);
};
oFF.OuChartAxesView.prototype.updateUi = function()
{
	this.m_root.setBusy(false);
	this.configurePanelVisibility();
	this.m_controller.updateMembers().onThen((membersChanged) => {
		if (membersChanged.getBoolean())
		{
			this.m_accountsPanel.markDirty();
			this.m_measurePanel.markDirty();
			this.m_yLeftPanel.markDirty();
			this.m_yRightPanel.markDirty();
			this.m_columnPanel.markDirty();
			this.m_linePanel.markDirty();
		}
		this.resetUi();
		if (!oFF.XObjectExt.isValidObject(this.getQueryManager()) || !oFF.XObjectExt.isValidObject(this.getQueryManager().getQueryModel()) || !oFF.XObjectExt.isValidObject(this.m_chartDefinition))
		{
			return;
		}
		this.determineIfKFsWillBeMeasures();
		let chartType = this.m_chartDefinition.getChartSetting().getChartType();
		this.updateMeasureFeed(this.m_accountsPanel, chartType.getPrimaryValueFeed());
		this.updateMeasureFeed(this.m_measurePanel, chartType.getPrimaryValueFeed());
		this.updateMeasureFeed(this.m_yLeftPanel, chartType.getPrimaryValueFeed());
		this.updateMeasureFeed(this.m_yRightPanel, chartType.getSecondaryValueFeed());
		this.updateMeasureFeed(this.m_columnPanel, chartType.getPrimaryValueFeed());
		this.updateMeasureFeed(this.m_linePanel, chartType.getSecondaryValueFeed());
		this.placeholdersForMeasures();
		let chartOrientation = this.m_chartCommands.getChartOrientation() !== null ? this.m_chartCommands.getChartOrientation() : oFF.ChartOrientation.HORIZONTAL;
		let selectedItem = this.m_orientationDropdown.getItemByName(chartOrientation.getName());
		this.m_orientationDropdown.setSelectedItem(selectedItem);
		let isShow100Pc = oFF.notNull(this.m_chartDefinition) && oFF.ChartStackingType.PERCENT.isEqualTo(this.m_chartDefinition.getChartSetting().getChartStackingType());
		this.m_show100PCCheckBox.setChecked(isShow100Pc);
		let allowOverlapYAxes = oFF.notNull(this.m_chartDefinition) && !this.m_chartDefinition.getChartSetting().areYAxisOnSameSide();
		if (oFF.notNull(this.m_overlapYAxisCheckBox))
		{
			this.m_overlapYAxisCheckBox.setChecked(allowOverlapYAxes);
		}
		this.updateDimensionFeed(this.m_dimensionsPanel, oFF.VisualizationValueType.CATEGORY);
		this.updateDimensionFeed(this.m_colorPanel, oFF.VisualizationValueType.COLOR);
		oFF.XCollectionUtils.forEach(this.m_allPanels, (dimPanelList) => {
			let panelList = dimPanelList.getPanelList();
			let hasItems = panelList.getList().hasItems();
			let panel = panelList.getPanel();
			panel.setExpandable(hasItems);
			panel.setExpanded(this.m_panelExpansion.getBooleanByKeyExt(panelList.getTitle().getText(), true));
		});
	});
};

oFF.OuGridAxesView = function() {};
oFF.OuGridAxesView.prototype = new oFF.DfUiContentView();
oFF.OuGridAxesView.prototype._ff_c = "OuGridAxesView";

oFF.OuGridAxesView.buildSplitterItems = function(splitter, content)
{
	let splitterItem = splitter.addNewItem();
	splitterItem.setContent(content);
	splitterItem.setMinHeight(oFF.UiCssLength.create("15%"));
	splitterItem.setHeight(oFF.UiCssLength.create("50%"));
	return splitterItem;
};
oFF.OuGridAxesView.createView = function(process, genesis, configuration)
{
	let obj = new oFF.OuGridAxesView();
	obj.m_process = process;
	obj.m_config = configuration;
	obj.initView(genesis);
	return obj;
};
oFF.OuGridAxesView.getLocalizationProvider = function()
{
	return oFF.XLocalizationCenter.getCenter().getLocalizationProviderByName(oFF.OuAxesViewI18n.PROVIDER_NAME);
};
oFF.OuGridAxesView.resetDropInfo = function(dimView)
{
	dimView.getHeader().setDropInfo(null);
	dimView.getChildrenList().setDropInfo(null);
};
oFF.OuGridAxesView.prototype.m_colSplitter = null;
oFF.OuGridAxesView.prototype.m_cols = null;
oFF.OuGridAxesView.prototype.m_config = null;
oFF.OuGridAxesView.prototype.m_controller = null;
oFF.OuGridAxesView.prototype.m_dataProvider = null;
oFF.OuGridAxesView.prototype.m_defaultDropCondition = null;
oFF.OuGridAxesView.prototype.m_defaultDropInfoHead = null;
oFF.OuGridAxesView.prototype.m_defaultDropInfoListBetween = null;
oFF.OuGridAxesView.prototype.m_defaultDropInfoListOn = null;
oFF.OuGridAxesView.prototype.m_focusMoreButton = false;
oFF.OuGridAxesView.prototype.m_focusedDimension = null;
oFF.OuGridAxesView.prototype.m_lifecycleChangeId = null;
oFF.OuGridAxesView.prototype.m_modelChangeId = null;
oFF.OuGridAxesView.prototype.m_modelStateListenerId = null;
oFF.OuGridAxesView.prototype.m_onChange = null;
oFF.OuGridAxesView.prototype.m_process = null;
oFF.OuGridAxesView.prototype.m_root = null;
oFF.OuGridAxesView.prototype.m_rowSplitter = null;
oFF.OuGridAxesView.prototype.m_rows = null;
oFF.OuGridAxesView.prototype.m_splitter = null;
oFF.OuGridAxesView.prototype.buildAxisView = function(text, axisType)
{
	let dimPanelListConfig = oFF.OuDimensionPanelListConfig.createConfig(this.m_config.getApplication());
	dimPanelListConfig.setMenuProvider(this.m_config.getMenuProvider());
	dimPanelListConfig.setLocalizationProviderName(oFF.OuAxesViewI18n.PROVIDER_NAME);
	dimPanelListConfig.setDefaultPresentation(this.m_config.getDefaultPresentation());
	dimPanelListConfig.setCalculationsEnabled(this.m_config.isCalculationsEnabled());
	dimPanelListConfig.setRightClickContextMenuForDimensionEnabled(this.m_config.isRightClickContextMenuForDimensionEnabled());
	dimPanelListConfig.setRightClickContextMenuForAttributeEnabled(this.m_config.isRightClickContextMenuForAttributeEnabled());
	dimPanelListConfig.setRightClickContextMenuForMemberEnabled(this.m_config.isRightClickContextMenuForMemberEnabled());
	dimPanelListConfig.setDragElementTag(this.m_config.getDragElementTag());
	dimPanelListConfig.setShowAttributes(true);
	dimPanelListConfig.setFocusContext(this);
	let dimensionPanelList = oFF.OuDimensionPanelList.createDimensionPanelList(this.m_process, this.getGenesis(), this, dimPanelListConfig);
	dimensionPanelList.setDragStartModelComponent(this.dragStartModelComponent.bind(this));
	dimensionPanelList.setDragEnd(this.dragEnd.bind(this));
	dimensionPanelList.getView().setExpandable(this.m_config.isUseRowsAndColumnsSplitterExpandable());
	dimensionPanelList.getView().setAnimated(!this.m_config.isUseRowsAndColumnsSplitterExpandable());
	let panelList = dimensionPanelList.getPanelList();
	let axisRoot = panelList.getPanel();
	axisRoot.addAttribute(oFF.UtUi5AttributeConstants.FAST_NAV_GROUP, "true");
	axisRoot.addCssClass(axisType === oFF.AxisType.ROWS ? "ffGdsQbBuilderPanelAxisRow" : "ffGdsQbBuilderPanelAxisColumn");
	let title = panelList.getTitle();
	title.setText(text);
	title.setTooltip(text);
	return dimensionPanelList;
};
oFF.OuGridAxesView.prototype.buildViewUi = function(genesis)
{
	this.m_root = genesis.newRoot(oFF.UiType.FLEX_LAYOUT);
	this.m_root.addCssClass("ffGridAxesView");
	this.m_root.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_root.useMaxSpace();
	let i18n = oFF.OuGridAxesView.getLocalizationProvider();
	this.m_rows = this.buildAxisView(i18n.getText(oFF.OlapUiCommonI18n.AXIS_ROWS), oFF.AxisType.ROWS);
	this.m_cols = this.buildAxisView(i18n.getText(oFF.OlapUiCommonI18n.AXIS_COLUMNS), oFF.AxisType.COLUMNS);
	this.m_rows.getView().setFlex("0 0 auto");
	this.m_cols.getView().setFlex("0 0 auto");
	this.m_rows.getView().setExpanded(true);
	this.m_cols.getView().setExpanded(true);
	this.m_splitter = this.m_root.addNewItemOfType(oFF.UiType.INTERACTIVE_SPLITTER);
	this.m_splitter.setOrientation(oFF.UiOrientation.VERTICAL);
	this.m_splitter.setEnableReordering(false);
	this.m_rowSplitter = oFF.OuGridAxesView.buildSplitterItems(this.m_splitter, this.m_rows.getView());
	this.m_colSplitter = oFF.OuGridAxesView.buildSplitterItems(this.m_splitter, this.m_cols.getView());
	this.m_rows.setOnPanelCollapsed(() => {
		this.m_rows.getView().setExpanded(false);
		this.updateSplitter();
	});
	this.m_cols.setOnPanelCollapsed(() => {
		this.m_cols.getView().setExpanded(false);
		this.updateSplitter();
	});
	this.m_rows.setOnPanelExpanded(() => {
		this.m_rows.getView().setExpanded(true);
		this.updateSplitter();
	});
	this.m_cols.setOnPanelExpanded(() => {
		this.m_cols.getView().setExpanded(true);
		this.updateSplitter();
	});
};
oFF.OuGridAxesView.prototype.configureDragDropAxis = function(model, axisType, view)
{
	let panelList = view.getPanelList();
	let header = panelList.getHeaderLayout();
	let list = panelList.getList();
	let dropZone = panelList.getDropZone();
	if (oFF.OlapUiDimensionUtil.isDimension(model))
	{
		let dim = model;
		this.setDropInfo(header, list, dropZone, true, oFF.UiLambdaDropListener.create((dimDrop) => {
			this.m_controller.handleDimDrop(dimDrop, dim, axisType);
			this.expandDimension(dim.getName());
			this.notifyChangeListeners();
		}));
	}
	else if (oFF.OlapUiDimensionUtil.isMemberNode(model) || oFF.OlapUiDimensionUtil.isAttribute(model))
	{
		this.setDropInfo(header, list, dropZone, true, oFF.UiLambdaDropListener.create((modelDrop) => {
			if (oFF.OlapUiDimensionUtil.isMemberNode(model))
			{
				let node = oFF.OlapUiDimensionUtil.getMemberNode(model);
				this.m_controller.handleMemberDrop(modelDrop, node, axisType);
				this.expandDimension(node.getDimension().getName());
				this.expandMemberNode(node);
				this.notifyChangeListeners();
			}
			else if (oFF.OlapUiDimensionUtil.isAttribute(model))
			{
				let attribute = model;
				this.m_controller.handleAttributeDrop(modelDrop, attribute, axisType);
				this.expandDimension(attribute.getDimension().getName());
				this.notifyChangeListeners();
			}
		}));
	}
};
oFF.OuGridAxesView.prototype.configureDropForDimension = function(model, view)
{
	let dim = view.getDimension();
	let header = view.getHeader();
	let list = view.getChildrenList();
	if (oFF.OlapUiDimensionUtil.isMemberNode(model))
	{
		let node = oFF.OlapUiDimensionUtil.getMemberNode(model);
		if (node.getDimension() === dim)
		{
			let allowBetween = this.m_controller.allowDropBetween(dim);
			this.setDropInfo(header, list, null, allowBetween, oFF.UiLambdaDropListener.create((headerDrop) => {
				this.m_controller.handleMemberDrop(headerDrop, node, null);
				this.expandDimension(dim.getName());
				this.expandMemberNode(node);
				this.notifyChangeListeners();
			}));
		}
	}
	else if (oFF.OlapUiDimensionUtil.isAttribute(model))
	{
		let attribute = model;
		if (attribute.getDimension() === dim)
		{
			this.setDropInfo(header, list, null, true, oFF.UiLambdaDropListener.create((listDrop) => {
				this.m_controller.handleAttributeDrop(listDrop, attribute, null);
				this.expandDimension(dim.getName());
				this.notifyChangeListeners();
			}));
		}
	}
};
oFF.OuGridAxesView.prototype.destroyView = function()
{
	this.unobserveDataProviderEvents();
	this.m_process = null;
	this.m_onChange = null;
	this.m_config = null;
	this.m_controller = oFF.XObjectExt.release(this.m_controller);
	this.m_focusedDimension = null;
	this.m_root = oFF.XObjectExt.release(this.m_root);
	this.m_rows = oFF.XObjectExt.release(this.m_rows);
	this.m_cols = oFF.XObjectExt.release(this.m_cols);
};
oFF.OuGridAxesView.prototype.dragEnd = function()
{
	this.m_rows.getPanelList().getHeaderLayout().setDropInfo(null);
	this.m_rows.getPanelList().getList().setDropInfo(null);
	this.m_cols.getPanelList().getHeaderLayout().setDropInfo(null);
	this.m_cols.getPanelList().getList().setDropInfo(null);
	oFF.XCollectionUtils.forEach(this.m_rows.getDimensionViews(), oFF.OuGridAxesView.resetDropInfo);
	oFF.XCollectionUtils.forEach(this.m_cols.getDimensionViews(), oFF.OuGridAxesView.resetDropInfo);
};
oFF.OuGridAxesView.prototype.dragStartModelComponent = function(model)
{
	this.configureDragDropAxis(model, oFF.AxisType.ROWS, this.m_rows);
	this.configureDragDropAxis(model, oFF.AxisType.COLUMNS, this.m_cols);
	oFF.XCollectionUtils.forEach(this.m_rows.getDimensionViews(), (rowDimView) => {
		this.configureDropForDimension(model, rowDimView);
	});
	oFF.XCollectionUtils.forEach(this.m_cols.getDimensionViews(), (colDimView) => {
		this.configureDropForDimension(model, colDimView);
	});
};
oFF.OuGridAxesView.prototype.expandDimension = function(name)
{
	this.m_rows.expandDimension(name);
	this.m_cols.expandDimension(name);
};
oFF.OuGridAxesView.prototype.expandMember = function(dimName, memberName)
{
	if (this.getQueryManager() === null)
	{
		return;
	}
	let dimension = this.getQueryManager().getQueryModel().getDimensionByName(dimName);
	if (oFF.isNull(dimension))
	{
		return;
	}
	let members = this.m_controller.getMembersByDimension(dimension);
	if (oFF.isNull(members))
	{
		return;
	}
	let node = members.getByKey(memberName);
	if (oFF.isNull(node))
	{
		return;
	}
	this.expandMemberNode(node);
};
oFF.OuGridAxesView.prototype.expandMemberNode = function(node)
{
	this.m_rows.expandToMemberNode(node);
	this.m_cols.expandToMemberNode(node);
};
oFF.OuGridAxesView.prototype.getDataProvider = function()
{
	return this.m_dataProvider;
};
oFF.OuGridAxesView.prototype.getDefaultDropCondition = function()
{
	if (oFF.isNull(this.m_defaultDropCondition))
	{
		this.m_defaultDropCondition = oFF.UiDropCondition.createSimple(null, this.getDragElementTag(), null);
	}
	return this.m_defaultDropCondition;
};
oFF.OuGridAxesView.prototype.getDefaultDropInfoHead = function()
{
	if (oFF.isNull(this.m_defaultDropInfoHead))
	{
		this.m_defaultDropInfoHead = oFF.UiDropInfo.create(oFF.UiDropPosition.ON, oFF.UiDropEffect.MOVE, oFF.UiDropLayout.DEFAULT, null);
	}
	return this.m_defaultDropInfoHead;
};
oFF.OuGridAxesView.prototype.getDefaultDropInfoList = function(between)
{
	if (between)
	{
		if (oFF.isNull(this.m_defaultDropInfoListBetween))
		{
			this.m_defaultDropInfoListBetween = oFF.UiDropInfo.create(oFF.UiDropPosition.BETWEEN, oFF.UiDropEffect.MOVE, oFF.UiDropLayout.DEFAULT, oFF.UiAggregation.ITEMS);
		}
		return this.m_defaultDropInfoListBetween;
	}
	if (oFF.isNull(this.m_defaultDropInfoListOn))
	{
		this.m_defaultDropInfoListOn = oFF.UiDropInfo.create(oFF.UiDropPosition.ON, oFF.UiDropEffect.MOVE, oFF.UiDropLayout.DEFAULT, null);
	}
	return this.m_defaultDropInfoListOn;
};
oFF.OuGridAxesView.prototype.getDimensionMemberVisibility = function(dimension)
{
	return this.m_controller.getMemberVisibility(dimension);
};
oFF.OuGridAxesView.prototype.getDimensionMembers = function(dimension)
{
	return this.m_controller.getMembersInOrder(dimension);
};
oFF.OuGridAxesView.prototype.getDragElementTag = function()
{
	return this.m_config.getDragElementTag();
};
oFF.OuGridAxesView.prototype.getFocusedName = function()
{
	return this.m_focusedDimension;
};
oFF.OuGridAxesView.prototype.getMenuProvider = function()
{
	return this.m_config.getMenuProvider();
};
oFF.OuGridAxesView.prototype.getQueryManager = function()
{
	return oFF.notNull(this.m_dataProvider) ? this.m_dataProvider.getQueryManager() : null;
};
oFF.OuGridAxesView.prototype.handleAttributeRemovalFromList = function(panelList, attribute)
{
	this.m_controller.removeAttribute(attribute);
	this.notifyChangeListeners();
};
oFF.OuGridAxesView.prototype.handleDimensionRemovalFromList = function(panelList, dimension)
{
	this.m_controller.removeDimension(dimension, this.notifyChangeListeners.bind(this));
};
oFF.OuGridAxesView.prototype.handleMemberRemovalFromList = function(panelList, node)
{
	this.m_controller.removeMember(node);
	this.notifyChangeListeners();
};
oFF.OuGridAxesView.prototype.isFocusMoreButton = function()
{
	return this.m_focusMoreButton;
};
oFF.OuGridAxesView.prototype.moveMemberToIndex = function(panelList, node, index)
{
	this.m_controller.moveMemberToIndex(node, index);
	this.notifyChangeListeners();
};
oFF.OuGridAxesView.prototype.notifyChangeListeners = function()
{
	if (oFF.notNull(this.m_onChange))
	{
		this.m_onChange(null);
	}
	if (oFF.notNull(this.m_dataProvider))
	{
		this.m_dataProvider.getEventing().notifyExternalModelChange(null);
	}
};
oFF.OuGridAxesView.prototype.observeDataProviderEvents = function()
{
	if (oFF.notNull(this.m_dataProvider))
	{
		this.m_lifecycleChangeId = this.m_dataProvider.getEventing().getListenerForLifecycle().addConsumer(this.onLifecycleChangeEvt.bind(this));
		this.m_modelChangeId = this.m_dataProvider.getEventing().getListenerForModelChanges().addConsumer(this.onModelChangeEvt.bind(this));
		this.m_modelStateListenerId = this.m_dataProvider.getEventing().getListenerForModelState().addConsumer(this.onModelStateChangeEvent.bind(this));
	}
};
oFF.OuGridAxesView.prototype.onLifecycleChangeEvt = function(evt)
{
	if (evt.getNewState() === oFF.DataProviderLifecycle.RELEASED)
	{
		this.setDataProvider(null);
	}
};
oFF.OuGridAxesView.prototype.onModelChangeEvt = function(evt)
{
	this.updateUi();
};
oFF.OuGridAxesView.prototype.onModelStateChangeEvent = function(evt)
{
	if (evt.getNewState() === oFF.OlapDataProviderModelState.QUERY)
	{
		this.updateUi();
	}
};
oFF.OuGridAxesView.prototype.resetFocus = function()
{
	this.m_focusedDimension = null;
	this.m_focusMoreButton = false;
};
oFF.OuGridAxesView.prototype.setDataProvider = function(dataProvider)
{
	this.unobserveDataProviderEvents();
	this.m_dataProvider = dataProvider;
	this.observeDataProviderEvents();
	this.m_controller.setQueryManager(this.getQueryManager());
	this.m_cols.hardResetUi();
	this.m_rows.hardResetUi();
	this.updateUi();
	if (this.getQueryManager() !== null && this.getMenuProvider() !== null)
	{
		let rowAxis = this.getQueryManager().getQueryModel().getAxis(oFF.AxisType.ROWS);
		let rowMenuButton = this.m_rows.getMenuButton();
		rowMenuButton.registerOnPress(oFF.UiLambdaPressListener.create((evt1) => {
			this.getMenuProvider().showAxisMenu(oFF.OuAxesView.UI_CONTEXT, evt1, rowAxis);
		}));
		let colAxis = this.getQueryManager().getQueryModel().getAxis(oFF.AxisType.COLUMNS);
		let colMenuButton = this.m_cols.getMenuButton();
		colMenuButton.registerOnPress(oFF.UiLambdaPressListener.create((evt2) => {
			this.getMenuProvider().showAxisMenu(oFF.OuAxesView.UI_CONTEXT, evt2, colAxis);
		}));
	}
};
oFF.OuGridAxesView.prototype.setDropInfo = function(header, list, dropZone, between, listener)
{
	header.setDropInfo(this.getDefaultDropInfoHead());
	header.setDropCondition(this.getDefaultDropCondition());
	header.registerOnDrop(listener);
	list.setDropInfo(this.getDefaultDropInfoList(between));
	list.setDropCondition(this.getDefaultDropCondition());
	list.registerOnDrop(listener);
	if (oFF.notNull(dropZone))
	{
		dropZone.setDropInfo(this.getDefaultDropInfoHead());
		dropZone.setDropCondition(this.getDefaultDropCondition());
		dropZone.registerOnDrop(listener);
	}
};
oFF.OuGridAxesView.prototype.setFocusMoreButton = function(focusMoreButton)
{
	this.m_focusMoreButton = focusMoreButton;
};
oFF.OuGridAxesView.prototype.setFocusedName = function(name)
{
	this.m_focusedDimension = name;
};
oFF.OuGridAxesView.prototype.setOnChange = function(onChange)
{
	this.m_onChange = onChange;
};
oFF.OuGridAxesView.prototype.setPresentation = function(presentationType)
{
	this.m_rows.setPresentation(presentationType);
	this.m_cols.setPresentation(presentationType);
};
oFF.OuGridAxesView.prototype.setQueryManager = oFF.noSupport;
oFF.OuGridAxesView.prototype.setupView = function()
{
	this.m_controller = oFF.OuGridAxesController.createController();
};
oFF.OuGridAxesView.prototype.unobserveDataProviderEvents = function()
{
	if (oFF.XObjectExt.isValidObject(this.m_dataProvider))
	{
		this.m_dataProvider.getEventing().getListenerForLifecycle().removeConsumerByUuid(this.m_lifecycleChangeId);
		this.m_dataProvider.getEventing().getListenerForModelChanges().removeConsumerByUuid(this.m_modelChangeId);
		this.m_dataProvider.getEventing().getListenerForModelState().removeConsumerByUuid(this.m_modelStateListenerId);
		this.m_lifecycleChangeId = null;
		this.m_modelChangeId = null;
		this.m_modelStateListenerId = null;
	}
};
oFF.OuGridAxesView.prototype.updateSplitter = function()
{
	this.m_cols.getView().removeCssClass("ffGdsQbBuilderPanelAxisColumnSplitterBorderTop");
	this.m_cols.getView().removeCssClass("ffGdsQbBuilderPanelAxisColumnSplitterBorderBottom");
	if (this.m_rows.getView().isExpanded() && this.m_cols.getView().isExpanded())
	{
		this.m_splitter.showResizerAtIndex(0);
		this.m_rowSplitter.setHeight(oFF.UiCssLength.create("50%"));
		this.m_colSplitter.setHeight(oFF.UiCssLength.create("50%"));
		this.m_rowSplitter.setMinHeight(oFF.UiCssLength.create("15%"));
		this.m_colSplitter.setMinHeight(oFF.UiCssLength.create("15%"));
	}
	else if (!this.m_rows.getView().isExpanded() && !this.m_cols.getView().isExpanded())
	{
		this.m_splitter.hideResizerAtIndex(0);
		this.m_rowSplitter.setHeight(oFF.UiCssLength.create("2.8125rem"));
		this.m_colSplitter.setHeight(oFF.UiCssLength.create("2.8125rem"));
		this.m_rowSplitter.setMinHeight(null);
		this.m_colSplitter.setMinHeight(null);
		this.m_cols.getView().addCssClass("ffGdsQbBuilderPanelAxisColumnSplitterBorderBottom");
	}
	else
	{
		this.m_splitter.hideResizerAtIndex(0);
		if (!this.m_rows.getView().isExpanded())
		{
			this.m_rowSplitter.setHeight(oFF.UiCssLength.create("2.8125rem"));
			this.m_colSplitter.setHeight(null);
			this.m_rowSplitter.setMinHeight(null);
			this.m_colSplitter.setMinHeight(null);
		}
		if (!this.m_cols.getView().isExpanded())
		{
			this.m_cols.getView().addCssClass("ffGdsQbBuilderPanelAxisColumnSplitterBorderTop");
			this.m_rowSplitter.setHeight(null);
			this.m_colSplitter.setHeight(oFF.UiCssLength.create("2.8125rem"));
			this.m_rowSplitter.setMinHeight(null);
			this.m_colSplitter.setMinHeight(null);
		}
	}
};
oFF.OuGridAxesView.prototype.updateUi = function()
{
	if (oFF.isNull(this.m_dataProvider))
	{
		return;
	}
	this.m_root.setBusy(true);
	this.m_controller.updateMembers().onThen((membersChanged) => {
		if (membersChanged.getBoolean())
		{
			this.m_rows.markDirty();
			this.m_cols.markDirty();
		}
		this.m_root.setBusy(false);
		this.m_rows.updateViewWithDimensions(this.getQueryManager().getQueryModel().getRowsAxis());
		this.m_cols.updateViewWithDimensions(this.getQueryManager().getQueryModel().getColumnsAxis());
	}).onCatch((err) => {
		let strip = this.getGenesis().newRoot(oFF.UiType.MESSAGE_STRIP);
		strip.setMessageType(oFF.UiMessageType.ERROR);
		strip.setText(err.getText());
	});
};

oFF.OuInventoryViewGroupPresentation = function() {};
oFF.OuInventoryViewGroupPresentation.prototype = new oFF.XConstant();
oFF.OuInventoryViewGroupPresentation.prototype._ff_c = "OuInventoryViewGroupPresentation";

oFF.OuInventoryViewGroupPresentation.ALL_COLLAPSED = null;
oFF.OuInventoryViewGroupPresentation.ALL_EXPANDED = null;
oFF.OuInventoryViewGroupPresentation.FLAT = null;
oFF.OuInventoryViewGroupPresentation.MIXED = null;
oFF.OuInventoryViewGroupPresentation.s_lookup = null;
oFF.OuInventoryViewGroupPresentation.create = function(name)
{
	let constant = oFF.XConstant.setupName(new oFF.OuInventoryViewGroupPresentation(), name);
	oFF.OuInventoryViewGroupPresentation.s_lookup.put(oFF.XString.toLowerCase(name), constant);
	return constant;
};
oFF.OuInventoryViewGroupPresentation.lookup = function(name)
{
	return oFF.OuInventoryViewGroupPresentation.s_lookup.getByKey(oFF.XString.toLowerCase(name));
};
oFF.OuInventoryViewGroupPresentation.staticSetup = function()
{
	oFF.OuInventoryViewGroupPresentation.s_lookup = oFF.XHashMapByString.create();
	oFF.OuInventoryViewGroupPresentation.MIXED = oFF.OuInventoryViewGroupPresentation.create("mixed");
	oFF.OuInventoryViewGroupPresentation.FLAT = oFF.OuInventoryViewGroupPresentation.create("flat");
	oFF.OuInventoryViewGroupPresentation.ALL_COLLAPSED = oFF.OuInventoryViewGroupPresentation.create("allCollapsed");
	oFF.OuInventoryViewGroupPresentation.ALL_EXPANDED = oFF.OuInventoryViewGroupPresentation.create("allExpanded");
};

oFF.OuDisplayFormattingView = function() {};
oFF.OuDisplayFormattingView.prototype = new oFF.DfUiContentView();
oFF.OuDisplayFormattingView.prototype._ff_c = "OuDisplayFormattingView";

oFF.OuDisplayFormattingView.ALIGNMENT_SECTION = "AlignmentSection";
oFF.OuDisplayFormattingView.AVOID_OVERLAP = "AvoidOverlap";
oFF.OuDisplayFormattingView.AXIS_LABEL_FORMATTING = "AxisLabelFormatting";
oFF.OuDisplayFormattingView.AXIS_TITLE_FORMATTING = "AxisTitleFormatting";
oFF.OuDisplayFormattingView.BLANK_STRING = " ";
oFF.OuDisplayFormattingView.COLOR = "Color";
oFF.OuDisplayFormattingView.DATA_LABEL_FORMATTING = "DataLabelFormatting";
oFF.OuDisplayFormattingView.DEFAULT_KEY = "DefaultKey";
oFF.OuDisplayFormattingView.FONT = "Font";
oFF.OuDisplayFormattingView.FONT_72_WEB = "72-Web";
oFF.OuDisplayFormattingView.FONT_ARIAL = "Arial";
oFF.OuDisplayFormattingView.FONT_COURIER = "Courier";
oFF.OuDisplayFormattingView.FONT_GEORGIA = "Georgia";
oFF.OuDisplayFormattingView.FONT_LATO = "Lato";
oFF.OuDisplayFormattingView.FONT_OPTIONS = "FontOptions";
oFF.OuDisplayFormattingView.FONT_TIMES_NEW_ROMAN = "Times New Roman";
oFF.OuDisplayFormattingView.FONT_TREBUCHET_MS = "Trebuchet MS";
oFF.OuDisplayFormattingView.FONT_VERDANA = "Verdana";
oFF.OuDisplayFormattingView.HORIZONTAL_ALIGNMENT = "HorizontalAlignment";
oFF.OuDisplayFormattingView.ICON_DIRECTION_HORIZONTAL = "fpa/grip-horizontal";
oFF.OuDisplayFormattingView.ICON_DIRECTION_VERTICAL = "fpa/grip-vertical";
oFF.OuDisplayFormattingView.ICON_TEXT_ALIGN_BOTTOM = "fpa/vertical-align-bottom";
oFF.OuDisplayFormattingView.ICON_TEXT_ALIGN_CENTER = "text-align-center";
oFF.OuDisplayFormattingView.ICON_TEXT_ALIGN_LEFT = "text-align-left";
oFF.OuDisplayFormattingView.ICON_TEXT_ALIGN_MIDDLE = "fpa/vertical-align-mittle";
oFF.OuDisplayFormattingView.ICON_TEXT_ALIGN_RIGHT = "text-align-right";
oFF.OuDisplayFormattingView.ICON_TEXT_ALIGN_TOP = "fpa/vertical-align-top";
oFF.OuDisplayFormattingView.LAYOUT_DIRECTION = "LayoutDirection";
oFF.OuDisplayFormattingView.LEGEND_FORMATTING = "LegendFormatting";
oFF.OuDisplayFormattingView.PLACEMENT = "Placement";
oFF.OuDisplayFormattingView.SHOWN = "Shown";
oFF.OuDisplayFormattingView.SIZE = "Size";
oFF.OuDisplayFormattingView.SIZE_10 = "10";
oFF.OuDisplayFormattingView.SIZE_12 = "12";
oFF.OuDisplayFormattingView.SIZE_14 = "14";
oFF.OuDisplayFormattingView.SIZE_16 = "16";
oFF.OuDisplayFormattingView.SIZE_18 = "18";
oFF.OuDisplayFormattingView.SIZE_20 = "20";
oFF.OuDisplayFormattingView.SIZE_22 = "22";
oFF.OuDisplayFormattingView.SIZE_24 = "24";
oFF.OuDisplayFormattingView.SIZE_32 = "32";
oFF.OuDisplayFormattingView.SIZE_48 = "48";
oFF.OuDisplayFormattingView.STYLE = "Style";
oFF.OuDisplayFormattingView.STYLE_BOLD = "Bold";
oFF.OuDisplayFormattingView.STYLE_BOLD_ITALIC = "BoldItalic";
oFF.OuDisplayFormattingView.STYLE_ITALIC = "Italic";
oFF.OuDisplayFormattingView.STYLE_REGULAR = "Regular";
oFF.OuDisplayFormattingView.TEXT_SELECTION = "TextSelection";
oFF.OuDisplayFormattingView.VERTICAL_ALIGNMENT = "VerticalAlignment";
oFF.OuDisplayFormattingView.createView = function(genesis)
{
	let obj = new oFF.OuDisplayFormattingView();
	obj.initView(genesis);
	return obj;
};
oFF.OuDisplayFormattingView.prototype.m_alignmentSection = null;
oFF.OuDisplayFormattingView.prototype.m_form = null;
oFF.OuDisplayFormattingView.prototype.m_loadedAvoidOverlapValue = null;
oFF.OuDisplayFormattingView.prototype.m_loadedColorValue = null;
oFF.OuDisplayFormattingView.prototype.m_loadedFontValue = null;
oFF.OuDisplayFormattingView.prototype.m_loadedHorizontalAlignmentValue = null;
oFF.OuDisplayFormattingView.prototype.m_loadedLayoutDirectionValue = null;
oFF.OuDisplayFormattingView.prototype.m_loadedPlacementValue = null;
oFF.OuDisplayFormattingView.prototype.m_loadedShownValue = null;
oFF.OuDisplayFormattingView.prototype.m_loadedSizeValue = null;
oFF.OuDisplayFormattingView.prototype.m_loadedStyleValue = null;
oFF.OuDisplayFormattingView.prototype.m_loadedVerticalAlignmentValue = null;
oFF.OuDisplayFormattingView.prototype.m_onChange = null;
oFF.OuDisplayFormattingView.prototype.m_queryManager = null;
oFF.OuDisplayFormattingView.prototype.m_section = null;
oFF.OuDisplayFormattingView.prototype.m_selectedText = null;
oFF.OuDisplayFormattingView.prototype.m_sharedExecution = false;
oFF.OuDisplayFormattingView.prototype.m_textFormattingVariableGroups = null;
oFF.OuDisplayFormattingView.prototype.addDropdown = function(name, text)
{
	let i18n = this.getLocalizationProvider();
	let formItem = this.m_form.addDropdown(name, null, i18n.getText(text), null, false);
	formItem.setLabelFontWeight(oFF.UiFontWeight.NORMAL);
};
oFF.OuDisplayFormattingView.prototype.addDropdownToSection = function(name, text)
{
	let i18n = this.getLocalizationProvider();
	let formItem = this.m_section.addDropdown(name, null, i18n.getText(text), null, false);
	formItem.setLabelFontWeight(oFF.UiFontWeight.NORMAL);
};
oFF.OuDisplayFormattingView.prototype.addSegmentedButton = function(name, text, options)
{
	let i18n = this.getLocalizationProvider();
	let formItem = this.m_alignmentSection.addSegmentedButton(name, null, oFF.XStringUtils.isNullOrEmpty(text) ? null : i18n.getText(text), options);
	formItem.setLabelFontWeight(oFF.UiFontWeight.NORMAL);
};
oFF.OuDisplayFormattingView.prototype.addSwitch = function(name, text)
{
	let i18n = this.getLocalizationProvider();
	let formItem = this.m_form.addSwitch(name, false, oFF.isNull(text) ? oFF.OuDisplayFormattingView.DEFAULT_KEY : i18n.getText(text));
	formItem.setOffText(oFF.OuDisplayFormattingView.BLANK_STRING);
	formItem.setOnText(oFF.OuDisplayFormattingView.BLANK_STRING);
	formItem.setLabelFontWeight(oFF.UiFontWeight.NORMAL);
};
oFF.OuDisplayFormattingView.prototype.applyStateToUi = function()
{
	this.setDropdownValue(oFF.OuDisplayFormattingView.TEXT_SELECTION, this.getTextSelections(), this.m_selectedText);
	this.setSectionDropdownValue(oFF.OuDisplayFormattingView.FONT, this.getFontOptions(), this.m_loadedFontValue);
	this.setSectionDropdownValue(oFF.OuDisplayFormattingView.SIZE, this.getSizeOptions(), this.m_loadedSizeValue);
	this.setDropdownValue(oFF.OuDisplayFormattingView.STYLE, this.getStyleOptions(), this.m_loadedStyleValue);
	this.setSectionColorValue(oFF.OuDisplayFormattingView.COLOR, this.m_loadedColorValue);
	this.setSwitchValue(oFF.OuDisplayFormattingView.SHOWN, this.m_loadedShownValue);
	this.setSwitchValue(oFF.OuDisplayFormattingView.AVOID_OVERLAP, this.m_loadedAvoidOverlapValue);
	this.setDropdownValue(oFF.OuDisplayFormattingView.PLACEMENT, this.getPlacementOptions(), this.m_loadedPlacementValue);
	this.setAlignmentValue(oFF.OuDisplayFormattingView.HORIZONTAL_ALIGNMENT, this.m_loadedHorizontalAlignmentValue);
	this.setAlignmentValue(oFF.OuDisplayFormattingView.VERTICAL_ALIGNMENT, this.m_loadedVerticalAlignmentValue);
	this.setAlignmentValue(oFF.OuDisplayFormattingView.LAYOUT_DIRECTION, this.m_loadedLayoutDirectionValue);
};
oFF.OuDisplayFormattingView.prototype.buildViewUi = function(genesis)
{
	this.m_form = oFF.UiForm.create(this.getGenesis());
	this.addDropdown(oFF.OuDisplayFormattingView.TEXT_SELECTION, oFF.OuDisplayFormattingI18n.STYLE_FORMATTING_TEXT_SELECTION);
	this.m_section = this.m_form.addFormSection(oFF.OuDisplayFormattingView.FONT_OPTIONS, "", true);
	this.addDropdownToSection(oFF.OuDisplayFormattingView.FONT, oFF.OuDisplayFormattingI18n.STYLE_FORMATTING_FONT);
	this.addDropdownToSection(oFF.OuDisplayFormattingView.SIZE, oFF.OuDisplayFormattingI18n.STYLE_FORMATTING_SIZE);
	this.m_section.addColorPicker(oFF.OuDisplayFormattingView.COLOR, "", this.getLocalizationProvider().getText(oFF.OuDisplayFormattingI18n.STYLE_FORMATTING_COLOR)).setColors(this.getDefaultColors());
	this.addDropdown(oFF.OuDisplayFormattingView.STYLE, oFF.OuDisplayFormattingI18n.STYLE_FORMATTING_STYLE);
	this.addSwitch(oFF.OuDisplayFormattingView.SHOWN, null);
	this.addSwitch(oFF.OuDisplayFormattingView.AVOID_OVERLAP, oFF.OuDisplayFormattingI18n.STYLE_AVOID_OVERLAP);
	this.addDropdown(oFF.OuDisplayFormattingView.PLACEMENT, oFF.OuDisplayFormattingI18n.STYLE_PLACEMENT);
	this.m_alignmentSection = this.m_form.addFormSection(oFF.OuDisplayFormattingView.ALIGNMENT_SECTION, this.getLocalizationProvider().getText(oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT), true);
	this.addSegmentedButton(oFF.OuDisplayFormattingView.HORIZONTAL_ALIGNMENT, "", this.getHorizontalAlignmentOptions());
	this.addSegmentedButton(oFF.OuDisplayFormattingView.VERTICAL_ALIGNMENT, "", this.getVerticalAlignmentOptions());
	this.addSegmentedButton(oFF.OuDisplayFormattingView.LAYOUT_DIRECTION, "", this.getLayoutDirectionOptions());
	genesis.setRoot(this.m_form.getView());
};
oFF.OuDisplayFormattingView.prototype.destroyView = function()
{
	this.m_form = oFF.XObjectExt.release(this.m_form);
};
oFF.OuDisplayFormattingView.prototype.getActiveVisualizationDefinition = function()
{
	let visualizationDefinition = null;
	if (oFF.notNull(this.m_queryManager))
	{
		visualizationDefinition = this.m_queryManager.getQueryModel().getVisualizationManager().getCurrentActiveVisualizationDefinition();
	}
	return visualizationDefinition;
};
oFF.OuDisplayFormattingView.prototype.getAlignmentButtonValue = function(key)
{
	let button = this.m_alignmentSection.getFormItemByKey(key);
	return oFF.isNull(button) || button.getValue() === null ? null : button.getValue().getStringRepresentation();
};
oFF.OuDisplayFormattingView.prototype.getCurrentSelection = function()
{
	let result = null;
	if (oFF.XCollectionUtils.hasElements(this.m_textFormattingVariableGroups))
	{
		result = this.m_textFormattingVariableGroups.getByKey(this.m_selectedText);
		if (oFF.isNull(result))
		{
			result = this.m_textFormattingVariableGroups.get(0);
		}
	}
	return result;
};
oFF.OuDisplayFormattingView.prototype.getDefaultColors = function()
{
	let colors = oFF.XList.create();
	colors.add("#427cac");
	colors.add("#bb0000");
	colors.add("#aaaa00");
	colors.add("#e78c07");
	colors.add("#2b7c2b");
	colors.add("#5e696e");
	colors.add("#678bc7");
	colors.add("#147575");
	colors.add("#d4f7db");
	colors.add("#3f8600");
	colors.add("#000000");
	colors.add("#ffffff");
	colors.add("#fafafa");
	colors.add("#666666");
	colors.add("#bfbfbf");
	return colors;
};
oFF.OuDisplayFormattingView.prototype.getDropdownValue = function(name)
{
	let dropdown = this.m_form.getFormItemByKey(name);
	return this.getDropdownValueExt(dropdown);
};
oFF.OuDisplayFormattingView.prototype.getDropdownValueExt = function(dropdown)
{
	return oFF.isNull(dropdown) || dropdown.getValue() === null ? null : dropdown.getValue().getStringRepresentation();
};
oFF.OuDisplayFormattingView.prototype.getFontOptions = function()
{
	let i18n = this.getLocalizationProvider();
	let selectionOptions = oFF.XLinkedHashMapByString.create();
	selectionOptions.put(oFF.OuDisplayFormattingView.DEFAULT_KEY, i18n.getText(oFF.OuDisplayFormattingI18n.STYLE_DEFAULT));
	selectionOptions.put(oFF.OuDisplayFormattingView.FONT_72_WEB, oFF.OuDisplayFormattingView.FONT_72_WEB);
	selectionOptions.put(oFF.OuDisplayFormattingView.FONT_ARIAL, oFF.OuDisplayFormattingView.FONT_ARIAL);
	selectionOptions.put(oFF.OuDisplayFormattingView.FONT_COURIER, oFF.OuDisplayFormattingView.FONT_COURIER);
	selectionOptions.put(oFF.OuDisplayFormattingView.FONT_GEORGIA, oFF.OuDisplayFormattingView.FONT_GEORGIA);
	selectionOptions.put(oFF.OuDisplayFormattingView.FONT_LATO, oFF.OuDisplayFormattingView.FONT_LATO);
	selectionOptions.put(oFF.OuDisplayFormattingView.FONT_TIMES_NEW_ROMAN, oFF.OuDisplayFormattingView.FONT_TIMES_NEW_ROMAN);
	selectionOptions.put(oFF.OuDisplayFormattingView.FONT_TREBUCHET_MS, oFF.OuDisplayFormattingView.FONT_TREBUCHET_MS);
	selectionOptions.put(oFF.OuDisplayFormattingView.FONT_VERDANA, oFF.OuDisplayFormattingView.FONT_VERDANA);
	return selectionOptions;
};
oFF.OuDisplayFormattingView.prototype.getHorizontalAlignmentOptions = function()
{
	let i18n = this.getLocalizationProvider();
	let selectionOptions = oFF.XList.create();
	selectionOptions.add(oFF.UiFormItemOption.create(oFF.CellAlignmentHorizontal.LEFT.getName(), null, oFF.OuDisplayFormattingView.ICON_TEXT_ALIGN_LEFT, i18n.getText(oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_LEFT)));
	selectionOptions.add(oFF.UiFormItemOption.create(oFF.CellAlignmentHorizontal.CENTER.getName(), null, oFF.OuDisplayFormattingView.ICON_TEXT_ALIGN_CENTER, i18n.getText(oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_CENTER)));
	selectionOptions.add(oFF.UiFormItemOption.create(oFF.CellAlignmentHorizontal.RIGHT.getName(), null, oFF.OuDisplayFormattingView.ICON_TEXT_ALIGN_RIGHT, i18n.getText(oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_RIGHT)));
	return selectionOptions;
};
oFF.OuDisplayFormattingView.prototype.getLayoutDirectionOptions = function()
{
	let i18n = this.getLocalizationProvider();
	let selectionOptions = oFF.XList.create();
	selectionOptions.add(oFF.UiFormItemOption.create(oFF.LayoutDirection.HORIZONTAL.getName(), null, oFF.OuDisplayFormattingView.ICON_DIRECTION_HORIZONTAL, i18n.getText(oFF.OuDisplayFormattingI18n.STYLE_DIRECTION_HORIZONTAL)));
	selectionOptions.add(oFF.UiFormItemOption.create(oFF.LayoutDirection.VERTICAL.getName(), null, oFF.OuDisplayFormattingView.ICON_DIRECTION_VERTICAL, i18n.getText(oFF.OuDisplayFormattingI18n.STYLE_DIRECTION_VERTICAL)));
	return selectionOptions;
};
oFF.OuDisplayFormattingView.prototype.getLocalizationProvider = function()
{
	return oFF.OuDisplayFormattingI18n.getLocalization();
};
oFF.OuDisplayFormattingView.prototype.getPlacementOptions = function()
{
	let i18n = this.getLocalizationProvider();
	let selectionOptions = oFF.XLinkedHashMapByString.create();
	selectionOptions.put(oFF.OuDisplayFormattingView.DEFAULT_KEY, i18n.getText(oFF.OuDisplayFormattingI18n.STYLE_DEFAULT));
	selectionOptions.put(oFF.ChartLegendPosition.RIGHT.getName(), i18n.getText(oFF.OuDisplayFormattingI18n.STYLE_PLACEMENT_BESIDE_CHART_RIGHT));
	selectionOptions.put(oFF.ChartLegendPosition.TOP.getName(), i18n.getText(oFF.OuDisplayFormattingI18n.STYLE_PLACEMENT_ABOVE_CHART));
	selectionOptions.put(oFF.ChartLegendPosition.BOTTOM.getName(), i18n.getText(oFF.OuDisplayFormattingI18n.STYLE_PLACEMENT_BELOW_CHART));
	return selectionOptions;
};
oFF.OuDisplayFormattingView.prototype.getQueryManager = function()
{
	return this.m_queryManager;
};
oFF.OuDisplayFormattingView.prototype.getSectionColorValue = function(key)
{
	let colorPicker = this.m_section.getFormItemByKey(key);
	return colorPicker.getValue() === null ? null : colorPicker.getValue().getStringRepresentation();
};
oFF.OuDisplayFormattingView.prototype.getSectionDropdownValue = function(name)
{
	let dropdown = this.m_section.getFormItemByKey(name);
	return this.getDropdownValueExt(dropdown);
};
oFF.OuDisplayFormattingView.prototype.getSizeOptions = function()
{
	let i18n = this.getLocalizationProvider();
	let selectionOptions = oFF.XLinkedHashMapByString.create();
	selectionOptions.put(oFF.OuDisplayFormattingView.DEFAULT_KEY, i18n.getText(oFF.OuDisplayFormattingI18n.STYLE_DEFAULT));
	selectionOptions.put(oFF.OuDisplayFormattingView.SIZE_10, oFF.OuDisplayFormattingView.SIZE_10);
	selectionOptions.put(oFF.OuDisplayFormattingView.SIZE_12, oFF.OuDisplayFormattingView.SIZE_12);
	selectionOptions.put(oFF.OuDisplayFormattingView.SIZE_14, oFF.OuDisplayFormattingView.SIZE_14);
	selectionOptions.put(oFF.OuDisplayFormattingView.SIZE_16, oFF.OuDisplayFormattingView.SIZE_16);
	selectionOptions.put(oFF.OuDisplayFormattingView.SIZE_18, oFF.OuDisplayFormattingView.SIZE_18);
	selectionOptions.put(oFF.OuDisplayFormattingView.SIZE_20, oFF.OuDisplayFormattingView.SIZE_20);
	selectionOptions.put(oFF.OuDisplayFormattingView.SIZE_22, oFF.OuDisplayFormattingView.SIZE_22);
	selectionOptions.put(oFF.OuDisplayFormattingView.SIZE_24, oFF.OuDisplayFormattingView.SIZE_24);
	selectionOptions.put(oFF.OuDisplayFormattingView.SIZE_32, oFF.OuDisplayFormattingView.SIZE_32);
	selectionOptions.put(oFF.OuDisplayFormattingView.SIZE_48, oFF.OuDisplayFormattingView.SIZE_48);
	return selectionOptions;
};
oFF.OuDisplayFormattingView.prototype.getStyleOptions = function()
{
	let i18n = this.getLocalizationProvider();
	let selectionOptions = oFF.XLinkedHashMapByString.create();
	selectionOptions.put(oFF.OuDisplayFormattingView.DEFAULT_KEY, i18n.getText(oFF.OuDisplayFormattingI18n.STYLE_DEFAULT));
	selectionOptions.put(oFF.OuDisplayFormattingView.STYLE_REGULAR, i18n.getText(oFF.OuDisplayFormattingI18n.STYLE_REGULAR));
	selectionOptions.put(oFF.OuDisplayFormattingView.STYLE_BOLD, i18n.getText(oFF.OuDisplayFormattingI18n.STYLE_BOLD));
	selectionOptions.put(oFF.OuDisplayFormattingView.STYLE_ITALIC, i18n.getText(oFF.OuDisplayFormattingI18n.STYLE_ITALIC));
	selectionOptions.put(oFF.OuDisplayFormattingView.STYLE_BOLD_ITALIC, i18n.getText(oFF.OuDisplayFormattingI18n.STYLE_BOLD_ITALIC));
	return selectionOptions;
};
oFF.OuDisplayFormattingView.prototype.getSwitchValue = function(key)
{
	let formSwitch = this.m_form.getFormItemByKey(key);
	let value = formSwitch.getValue();
	return oFF.TriStateBool.lookup(oFF.notNull(value) && value.getBoolean());
};
oFF.OuDisplayFormattingView.prototype.getTextSelections = function()
{
	let selectionOptions = oFF.XLinkedHashMapByString.create();
	oFF.XCollectionUtils.forEach(this.m_textFormattingVariableGroups, (group) => {
		selectionOptions.put(group.getName(), group.getText());
	});
	return selectionOptions;
};
oFF.OuDisplayFormattingView.prototype.getVerticalAlignmentOptions = function()
{
	let i18n = this.getLocalizationProvider();
	let selectionOptions = oFF.XList.create();
	selectionOptions.add(oFF.UiFormItemOption.create(oFF.CellAlignmentVertical.TOP.getName(), null, oFF.OuDisplayFormattingView.ICON_TEXT_ALIGN_TOP, i18n.getText(oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_TOP)));
	selectionOptions.add(oFF.UiFormItemOption.create(oFF.CellAlignmentVertical.MIDDLE.getName(), null, oFF.OuDisplayFormattingView.ICON_TEXT_ALIGN_MIDDLE, i18n.getText(oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_MIDDLE)));
	selectionOptions.add(oFF.UiFormItemOption.create(oFF.CellAlignmentVertical.BOTTOM.getName(), null, oFF.OuDisplayFormattingView.ICON_TEXT_ALIGN_BOTTOM, i18n.getText(oFF.OuDisplayFormattingI18n.STYLE_ALIGNMENT_BOTTOM)));
	return selectionOptions;
};
oFF.OuDisplayFormattingView.prototype.isActive = function()
{
	return oFF.XCollectionUtils.hasElements(this.m_textFormattingVariableGroups);
};
oFF.OuDisplayFormattingView.prototype.isResettable = function()
{
	let currentSelection = this.getCurrentSelection();
	return oFF.notNull(currentSelection) && (!currentSelection.isFontFamilyDefault() || !currentSelection.isFontSizeDefault() || !currentSelection.isFontColorDefault() || !currentSelection.isFillColorDefault() || !currentSelection.isFontBoldDefault() || !currentSelection.isFontItalicDefault() || !currentSelection.isFontUnderlineDefault() || !currentSelection.isFontStrikeThroughDefault() || !currentSelection.isShownDefault() || !currentSelection.isLayoutDirectionDefault() || !currentSelection.isAvoidOverlapDefault() || !currentSelection.isPlacementDefault() || !currentSelection.isHorizontalAlignmentDefault() || !currentSelection.isVerticalAlignmentDefault());
};
oFF.OuDisplayFormattingView.prototype.isVisible = function()
{
	return oFF.XCollectionUtils.hasElements(this.m_textFormattingVariableGroups);
};
oFF.OuDisplayFormattingView.prototype.loadState = function()
{
	if (oFF.XCollectionUtils.hasElements(this.m_textFormattingVariableGroups))
	{
		if (!this.m_textFormattingVariableGroups.containsKey(this.m_selectedText))
		{
			this.m_selectedText = this.m_textFormattingVariableGroups.get(0).getName();
		}
		let currentSelection = this.m_textFormattingVariableGroups.getByKey(this.m_selectedText);
		if (currentSelection.isFontFamilyDefault())
		{
			this.m_loadedFontValue = oFF.OuDisplayFormattingView.DEFAULT_KEY;
		}
		else
		{
			this.m_loadedFontValue = currentSelection.getFontFamily();
		}
		if (currentSelection.isFontSizeDefault())
		{
			this.m_loadedSizeValue = oFF.OuDisplayFormattingView.DEFAULT_KEY;
		}
		else
		{
			this.m_loadedSizeValue = oFF.XInteger.convertToString(currentSelection.getFontSize());
		}
		if (currentSelection.isFontColorDefault())
		{
			this.m_loadedColorValue = null;
		}
		else
		{
			this.m_loadedColorValue = currentSelection.getFontColor();
		}
		if (currentSelection.isFontBoldDefault() && currentSelection.isFontItalicDefault())
		{
			this.m_loadedStyleValue = oFF.OuDisplayFormattingView.DEFAULT_KEY;
		}
		else if (currentSelection.isFontBold().getBoolean() && currentSelection.isFontItalic().getBoolean())
		{
			this.m_loadedStyleValue = oFF.OuDisplayFormattingView.STYLE_BOLD_ITALIC;
		}
		else if (currentSelection.isFontBold().getBoolean())
		{
			this.m_loadedStyleValue = oFF.OuDisplayFormattingView.STYLE_BOLD;
		}
		else if (currentSelection.isFontItalic().getBoolean())
		{
			this.m_loadedStyleValue = oFF.OuDisplayFormattingView.STYLE_ITALIC;
		}
		else
		{
			this.m_loadedStyleValue = oFF.OuDisplayFormattingView.STYLE_REGULAR;
		}
		this.m_loadedShownValue = currentSelection.isShow();
		this.m_loadedAvoidOverlapValue = currentSelection.isAvoidOverlap();
		if (currentSelection.isPlacementDefault())
		{
			this.m_loadedPlacementValue = oFF.OuDisplayFormattingView.DEFAULT_KEY;
		}
		else
		{
			this.m_loadedPlacementValue = oFF.DfNameObject.getSafeName(currentSelection.getPlacement());
		}
		this.m_loadedHorizontalAlignmentValue = oFF.DfNameObject.getSafeName(currentSelection.getHorizontalAlignment());
		this.m_loadedVerticalAlignmentValue = oFF.DfNameObject.getSafeName(currentSelection.getVerticalAlignment());
		this.m_loadedLayoutDirectionValue = oFF.DfNameObject.getSafeName(currentSelection.getLayoutDirection());
	}
};
oFF.OuDisplayFormattingView.prototype.notifyChangeListeners = function()
{
	if (oFF.notNull(this.m_onChange))
	{
		this.m_onChange();
	}
};
oFF.OuDisplayFormattingView.prototype.pullStateFromUi = function()
{
	this.m_loadedFontValue = this.getSectionDropdownValue(oFF.OuDisplayFormattingView.FONT);
	this.m_loadedSizeValue = this.getSectionDropdownValue(oFF.OuDisplayFormattingView.SIZE);
	this.m_loadedStyleValue = this.getDropdownValue(oFF.OuDisplayFormattingView.STYLE);
	this.m_loadedColorValue = this.getSectionColorValue(oFF.OuDisplayFormattingView.COLOR);
	this.m_loadedPlacementValue = this.getDropdownValue(oFF.OuDisplayFormattingView.PLACEMENT);
	this.m_loadedHorizontalAlignmentValue = this.getAlignmentButtonValue(oFF.OuDisplayFormattingView.HORIZONTAL_ALIGNMENT);
	this.m_loadedVerticalAlignmentValue = this.getAlignmentButtonValue(oFF.OuDisplayFormattingView.VERTICAL_ALIGNMENT);
	this.m_loadedLayoutDirectionValue = this.getAlignmentButtonValue(oFF.OuDisplayFormattingView.LAYOUT_DIRECTION);
	this.m_loadedShownValue = this.getSwitchValue(oFF.OuDisplayFormattingView.SHOWN);
	this.m_loadedAvoidOverlapValue = this.getSwitchValue(oFF.OuDisplayFormattingView.AVOID_OVERLAP);
};
oFF.OuDisplayFormattingView.prototype.resetAvoidOverlap = function()
{
	this.m_loadedAvoidOverlapValue = oFF.TriStateBool._DEFAULT;
};
oFF.OuDisplayFormattingView.prototype.resetColor = function()
{
	this.m_loadedColorValue = oFF.OuDisplayFormattingView.DEFAULT_KEY;
};
oFF.OuDisplayFormattingView.prototype.resetFont = function()
{
	this.m_loadedFontValue = oFF.OuDisplayFormattingView.DEFAULT_KEY;
};
oFF.OuDisplayFormattingView.prototype.resetHorizontalAlignment = function()
{
	this.m_loadedHorizontalAlignmentValue = oFF.OuDisplayFormattingView.DEFAULT_KEY;
};
oFF.OuDisplayFormattingView.prototype.resetLayoutDirection = function()
{
	this.m_loadedLayoutDirectionValue = oFF.OuDisplayFormattingView.DEFAULT_KEY;
};
oFF.OuDisplayFormattingView.prototype.resetPlacement = function()
{
	this.m_loadedPlacementValue = oFF.OuDisplayFormattingView.DEFAULT_KEY;
};
oFF.OuDisplayFormattingView.prototype.resetShown = function()
{
	this.m_loadedShownValue = oFF.TriStateBool._DEFAULT;
};
oFF.OuDisplayFormattingView.prototype.resetSize = function()
{
	this.m_loadedSizeValue = oFF.OuDisplayFormattingView.DEFAULT_KEY;
};
oFF.OuDisplayFormattingView.prototype.resetStyle = function()
{
	this.m_loadedStyleValue = oFF.OuDisplayFormattingView.DEFAULT_KEY;
};
oFF.OuDisplayFormattingView.prototype.resetValues = function()
{
	let currentSelection = this.getCurrentSelection();
	if (this.isResettable())
	{
		this.resetFont();
		this.resetSize();
		this.resetColor();
		this.resetStyle();
		this.resetShown();
		this.resetAvoidOverlap();
		this.resetPlacement();
		this.resetHorizontalAlignment();
		this.resetVerticalAlignment();
		this.resetLayoutDirection();
		this.saveState();
	}
	else if (oFF.notNull(currentSelection))
	{
		this.m_loadedShownValue = currentSelection.isShow();
		this.m_form.getFormItemByKey(oFF.OuDisplayFormattingView.SHOWN).setValue(oFF.XBooleanValue.create(oFF.TriStateBool.isExplicitBooleanValue(this.m_loadedShownValue) && this.m_loadedShownValue.getBoolean()));
		this.m_loadedAvoidOverlapValue = currentSelection.isAvoidOverlap();
		this.m_form.getFormItemByKey(oFF.OuDisplayFormattingView.AVOID_OVERLAP).setValue(oFF.XBooleanValue.create(oFF.TriStateBool.isExplicitBooleanValue(this.m_loadedAvoidOverlapValue) && this.m_loadedAvoidOverlapValue.getBoolean()));
		this.m_loadedHorizontalAlignmentValue = oFF.DfNameObject.getSafeName(currentSelection.getHorizontalAlignment());
		this.m_alignmentSection.getFormItemByKey(oFF.OuDisplayFormattingView.HORIZONTAL_ALIGNMENT).setValue(oFF.XStringValue.create(this.m_loadedHorizontalAlignmentValue));
		this.m_loadedVerticalAlignmentValue = oFF.DfNameObject.getSafeName(currentSelection.getVerticalAlignment());
		this.m_alignmentSection.getFormItemByKey(oFF.OuDisplayFormattingView.VERTICAL_ALIGNMENT).setValue(oFF.XStringValue.create(this.m_loadedVerticalAlignmentValue));
		this.m_loadedLayoutDirectionValue = oFF.DfNameObject.getSafeName(currentSelection.getLayoutDirection());
		this.m_alignmentSection.getFormItemByKey(oFF.OuDisplayFormattingView.LAYOUT_DIRECTION).setValue(oFF.XStringValue.create(this.m_loadedLayoutDirectionValue));
	}
	this.m_section.getFormItemByKey(oFF.OuDisplayFormattingView.FONT).setValue(oFF.XStringValue.create(oFF.OuDisplayFormattingView.DEFAULT_KEY));
	this.m_section.getFormItemByKey(oFF.OuDisplayFormattingView.SIZE).setValue(oFF.XStringValue.create(oFF.OuDisplayFormattingView.DEFAULT_KEY));
	this.m_section.getFormItemByKey(oFF.OuDisplayFormattingView.COLOR).setValue(oFF.XStringValue.create(oFF.OuDisplayFormattingView.DEFAULT_KEY));
	this.m_form.getFormItemByKey(oFF.OuDisplayFormattingView.STYLE).setValue(oFF.XStringValue.create(oFF.OuDisplayFormattingView.DEFAULT_KEY));
	this.m_form.getFormItemByKey(oFF.OuDisplayFormattingView.PLACEMENT).setValue(oFF.XStringValue.create(oFF.OuDisplayFormattingView.DEFAULT_KEY));
	this.notifyChangeListeners();
};
oFF.OuDisplayFormattingView.prototype.resetVerticalAlignment = function()
{
	this.m_loadedVerticalAlignmentValue = oFF.OuDisplayFormattingView.DEFAULT_KEY;
};
oFF.OuDisplayFormattingView.prototype.saveState = function()
{
	let currentSelection = this.getCurrentSelection();
	if (oFF.notNull(currentSelection))
	{
		if (oFF.XString.isEqual(this.m_loadedColorValue, oFF.OuDisplayFormattingView.DEFAULT_KEY))
		{
			currentSelection.resetFontColor();
		}
		else
		{
			currentSelection.setFontColor(this.m_loadedColorValue);
		}
		if (oFF.XString.isEqual(this.m_loadedFontValue, oFF.OuDisplayFormattingView.DEFAULT_KEY))
		{
			currentSelection.resetFontFamily();
		}
		else
		{
			currentSelection.setFontFamily(this.m_loadedFontValue);
		}
		if (oFF.XString.isEqual(this.m_loadedSizeValue, oFF.OuDisplayFormattingView.DEFAULT_KEY))
		{
			currentSelection.resetFontSize();
		}
		else
		{
			currentSelection.setFontSize(oFF.XInteger.convertFromString(this.m_loadedSizeValue));
		}
		if (oFF.XString.isEqual(this.m_loadedStyleValue, oFF.OuDisplayFormattingView.DEFAULT_KEY))
		{
			currentSelection.resetFontItalic();
			currentSelection.resetFontBold();
		}
		else if (oFF.XString.isEqual(this.m_loadedStyleValue, oFF.OuDisplayFormattingView.STYLE_REGULAR))
		{
			currentSelection.setFontBold(oFF.TriStateBool._FALSE);
			currentSelection.setFontItalic(oFF.TriStateBool._FALSE);
		}
		else if (oFF.XString.isEqual(this.m_loadedStyleValue, oFF.OuDisplayFormattingView.STYLE_ITALIC))
		{
			currentSelection.setFontBold(oFF.TriStateBool._FALSE);
			currentSelection.setFontItalic(oFF.TriStateBool._TRUE);
		}
		else if (oFF.XString.isEqual(this.m_loadedStyleValue, oFF.OuDisplayFormattingView.STYLE_BOLD))
		{
			currentSelection.setFontBold(oFF.TriStateBool._TRUE);
			currentSelection.setFontItalic(oFF.TriStateBool._FALSE);
		}
		else if (oFF.XString.isEqual(this.m_loadedStyleValue, oFF.OuDisplayFormattingView.STYLE_BOLD_ITALIC))
		{
			currentSelection.setFontBold(oFF.TriStateBool._TRUE);
			currentSelection.setFontItalic(oFF.TriStateBool._TRUE);
		}
		if (!oFF.TriStateBool.isExplicitBooleanValue(this.m_loadedShownValue))
		{
			currentSelection.resetShown();
		}
		else
		{
			currentSelection.setShown(this.m_loadedShownValue);
		}
		if (!oFF.TriStateBool.isExplicitBooleanValue(this.m_loadedAvoidOverlapValue))
		{
			currentSelection.resetAvoidOverlap();
		}
		else
		{
			currentSelection.setAvoidOverlap(this.m_loadedAvoidOverlapValue);
		}
		if (oFF.XString.isEqual(this.m_loadedPlacementValue, oFF.OuDisplayFormattingView.DEFAULT_KEY))
		{
			currentSelection.resetPlacement();
		}
		else
		{
			currentSelection.setPlacement(oFF.ChartLegendPosition.lookup(this.m_loadedPlacementValue));
		}
		if (oFF.XString.isEqual(this.m_loadedHorizontalAlignmentValue, oFF.OuDisplayFormattingView.DEFAULT_KEY))
		{
			currentSelection.resetHorizontalAlignment();
		}
		else
		{
			currentSelection.setHorizontalAlignment(oFF.CellAlignmentHorizontal.lookup(this.m_loadedHorizontalAlignmentValue));
		}
		if (oFF.XString.isEqual(this.m_loadedVerticalAlignmentValue, oFF.OuDisplayFormattingView.DEFAULT_KEY))
		{
			currentSelection.resetVerticalAlignment();
		}
		else
		{
			currentSelection.setVerticalAlignment(oFF.CellAlignmentVertical.lookup(this.m_loadedVerticalAlignmentValue));
		}
		if (oFF.XString.isEqual(this.m_loadedLayoutDirectionValue, oFF.OuDisplayFormattingView.DEFAULT_KEY))
		{
			currentSelection.resetLayoutDirection();
		}
		else
		{
			currentSelection.setLayoutDirection(oFF.LayoutDirection.lookup(this.m_loadedLayoutDirectionValue));
		}
	}
	this.notifyChangeListeners();
};
oFF.OuDisplayFormattingView.prototype.setAlignmentValue = function(name, key)
{
	let segmentedButton = this.m_alignmentSection.getFormItemByKey(name);
	segmentedButton.setValue(oFF.XStringValue.create(key));
};
oFF.OuDisplayFormattingView.prototype.setDropdownValue = function(name, options, key)
{
	let dropdown = this.m_form.getFormItemByKey(name);
	this.setDropdownValueExt(dropdown, options, key);
};
oFF.OuDisplayFormattingView.prototype.setDropdownValueExt = function(dropdown, options, key)
{
	if (!options.containsKey(key))
	{
		options.put(key, "-");
	}
	dropdown.setDropdownItems(options);
	dropdown.setValue(oFF.XStringValue.create(key));
};
oFF.OuDisplayFormattingView.prototype.setOnChange = function(onChange)
{
	this.m_onChange = onChange;
};
oFF.OuDisplayFormattingView.prototype.setQueryManager = function(queryManager)
{
	this.m_queryManager = queryManager;
	if (oFF.notNull(this.m_queryManager))
	{
		this.updateVariableGroups();
	}
};
oFF.OuDisplayFormattingView.prototype.setSectionColorValue = function(key, value)
{
	let colorPicker = this.m_section.getFormItemByKey(key);
	if (oFF.XString.isEqual(value, oFF.OuDisplayFormattingView.DEFAULT_KEY))
	{
		colorPicker.setValue(oFF.XStringValue.create(""));
	}
	else
	{
		colorPicker.setValue(oFF.XStringValue.create(value));
	}
};
oFF.OuDisplayFormattingView.prototype.setSectionDropdownValue = function(name, options, key)
{
	let dropdown = this.m_section.getFormItemByKey(name);
	this.setDropdownValueExt(dropdown, options, key);
};
oFF.OuDisplayFormattingView.prototype.setSharedExecution = function(sharedExecution)
{
	this.m_sharedExecution = sharedExecution;
	if (oFF.notNull(this.m_queryManager))
	{
		this.updateVariableGroups();
	}
};
oFF.OuDisplayFormattingView.prototype.setSwitchValue = function(key, value)
{
	let formSwitch = this.m_form.getFormItemByKey(key);
	formSwitch.setValue(oFF.TriStateBool.isExplicitBooleanValue(value) ? oFF.XBooleanValue.create(value.getBoolean()) : oFF.XBooleanValue.create(false));
};
oFF.OuDisplayFormattingView.prototype.setupView = function() {};
oFF.OuDisplayFormattingView.prototype.updateAlignmentButton = function(name, visible)
{
	let segmentedButton = this.m_alignmentSection.getFormItemByKey(name);
	segmentedButton.setVisible(visible);
	segmentedButton.setValueChangedConsumer((key, newValue) => {
		this.pullStateFromUi();
		this.saveState();
	});
};
oFF.OuDisplayFormattingView.prototype.updateColorPickerExt = function(formItem, visible)
{
	formItem.setVisible(visible);
	formItem.setValueChangedConsumer((a, b) => {
		this.m_loadedColorValue = oFF.XValueUtil.getString(b);
		this.saveState();
	});
};
oFF.OuDisplayFormattingView.prototype.updateDropdown = function(name, defaultDropdownItems, visible)
{
	let formItem = this.m_form.getFormItemByKey(name);
	this.updateDropdownExt(formItem, defaultDropdownItems, visible);
};
oFF.OuDisplayFormattingView.prototype.updateDropdownExt = function(formItem, defaultDropdownItems, visible)
{
	formItem.setVisible(visible);
	formItem.setValueChangedConsumer((key, newValue) => {
		this.pullStateFromUi();
		this.saveState();
		formItem.setDropdownItems(defaultDropdownItems);
	});
};
oFF.OuDisplayFormattingView.prototype.updateSectionColorPicker = function(key, visible)
{
	let formItem = this.m_section.getFormItemByKey(key);
	this.updateColorPickerExt(formItem, visible);
};
oFF.OuDisplayFormattingView.prototype.updateSectionDropdown = function(name, defaultDropdownItems, visible)
{
	let formItem = this.m_section.getFormItemByKey(name);
	this.updateDropdownExt(formItem, defaultDropdownItems, visible);
};
oFF.OuDisplayFormattingView.prototype.updateSelectionDropdown = function()
{
	let formItem = this.m_form.getFormItemByKey(oFF.OuDisplayFormattingView.TEXT_SELECTION);
	formItem.setVisible(true);
	formItem.setValueChangedConsumer((key, newValue) => {
		this.m_selectedText = this.getDropdownValue(oFF.OuDisplayFormattingView.TEXT_SELECTION);
		formItem.setDropdownItems(this.getTextSelections());
		this.updateUi();
	});
};
oFF.OuDisplayFormattingView.prototype.updateSwitch = function(name, label, visible)
{
	let formSwitch = this.m_form.getFormItemByKey(name);
	formSwitch.setVisible(visible);
	if (oFF.notNull(label))
	{
		formSwitch.setText(label);
	}
	formSwitch.setValueChangedConsumer((key, newValue) => {
		this.pullStateFromUi();
		this.saveState();
	});
};
oFF.OuDisplayFormattingView.prototype.updateUi = function()
{
	if (oFF.notNull(this.m_queryManager))
	{
		this.updateVariableGroups();
		let currentSelection = this.getCurrentSelection();
		if (oFF.notNull(currentSelection))
		{
			this.updateSelectionDropdown();
			this.updateSectionDropdown(oFF.OuDisplayFormattingView.FONT, this.getFontOptions(), true);
			this.updateSectionDropdown(oFF.OuDisplayFormattingView.SIZE, this.getSizeOptions(), true);
			this.updateDropdown(oFF.OuDisplayFormattingView.STYLE, this.getStyleOptions(), true);
			this.updateSectionColorPicker(oFF.OuDisplayFormattingView.COLOR, true);
			this.updateDropdown(oFF.OuDisplayFormattingView.PLACEMENT, this.getPlacementOptions(), currentSelection.supportsPlacement());
			this.updateSwitch(oFF.OuDisplayFormattingView.SHOWN, currentSelection.getShowLabel(), currentSelection.supportsShown());
			this.updateSwitch(oFF.OuDisplayFormattingView.AVOID_OVERLAP, null, currentSelection.supportsAvoidOverlap());
			this.m_alignmentSection.setVisible(currentSelection.supportsHorizontalAlignment() || currentSelection.supportsVerticalAlignment() || currentSelection.supportsLayoutDirection());
			this.updateAlignmentButton(oFF.OuDisplayFormattingView.HORIZONTAL_ALIGNMENT, currentSelection.supportsHorizontalAlignment());
			this.updateAlignmentButton(oFF.OuDisplayFormattingView.VERTICAL_ALIGNMENT, currentSelection.supportsVerticalAlignment());
			this.updateAlignmentButton(oFF.OuDisplayFormattingView.LAYOUT_DIRECTION, currentSelection.supportsLayoutDirection());
			this.loadState();
			this.applyStateToUi();
			let isActive = this.isActive();
			oFF.XCollectionUtils.forEach(this.m_form.getAllFormItems(), (item) => {
				item.setEnabled(isActive);
			});
			oFF.XCollectionUtils.forEach(this.m_section.getAllFormItems(), (item) => {
				item.setEnabled(isActive);
			});
		}
		this.getView().setVisible(this.isVisible());
	}
};
oFF.OuDisplayFormattingView.prototype.updateVariableGroups = function()
{
	let loc = oFF.XLocalizationCenter.getCenter();
	let visualizationVariableHolder;
	let activeVisualizationDefinition = this.getActiveVisualizationDefinition();
	if (this.m_sharedExecution)
	{
		visualizationVariableHolder = this.m_queryManager.getQueryModel().getVisualizationManager();
	}
	else
	{
		visualizationVariableHolder = activeVisualizationDefinition;
	}
	this.m_textFormattingVariableGroups = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_textFormattingVariableGroups);
	this.m_textFormattingVariableGroups = oFF.XListOfNameObject.create();
	if (oFF.notNull(activeVisualizationDefinition) && activeVisualizationDefinition.getOlapComponentType().isTypeOf(oFF.OlapComponentType.VISUALIZATION_CHART_DEFINITION))
	{
		let variableGroup = oFF.OuTextFormattingVariableGroup.create(oFF.OuDisplayFormattingView.AXIS_LABEL_FORMATTING, loc.getText(oFF.OuDisplayFormattingI18n.STYLE_AXIS_LABEL), visualizationVariableHolder, oFF.OlapVisualizationConstants.AXIS_LABEL_STYLE_VARIABLE_FONT_FAMILY, oFF.OlapVisualizationConstants.AXIS_LABEL_STYLE_VARIABLE_FONT_SIZE, oFF.OlapVisualizationConstants.AXIS_LABEL_STYLE_VARIABLE_FONT_COLOR, oFF.OlapVisualizationConstants.AXIS_LABEL_STYLE_VARIABLE_FONT_ITALIC, oFF.OlapVisualizationConstants.AXIS_LABEL_STYLE_VARIABLE_FONT_BOLD);
		this.m_textFormattingVariableGroups.add(variableGroup);
		variableGroup = oFF.OuTextFormattingVariableGroup.create(oFF.OuDisplayFormattingView.AXIS_TITLE_FORMATTING, loc.getText(oFF.OuDisplayFormattingI18n.STYLE_AXIS_TITLE), visualizationVariableHolder, oFF.OlapVisualizationConstants.AXIS_TITLE_STYLE_VARIABLE_FONT_FAMILY, oFF.OlapVisualizationConstants.AXIS_TITLE_STYLE_VARIABLE_FONT_SIZE, oFF.OlapVisualizationConstants.AXIS_TITLE_STYLE_VARIABLE_FONT_COLOR, oFF.OlapVisualizationConstants.AXIS_TITLE_STYLE_VARIABLE_FONT_ITALIC, oFF.OlapVisualizationConstants.AXIS_TITLE_STYLE_VARIABLE_FONT_BOLD);
		variableGroup.setShowVN(oFF.OlapVisualizationConstants.AXIS_TITLE_STYLE_VARIABLE_ENABLED);
		variableGroup.setShowLabel(loc.getText(oFF.OuDisplayFormattingI18n.STYLE_SHOW_AXIS_TITLE));
		this.m_textFormattingVariableGroups.add(variableGroup);
		variableGroup = oFF.OuTextFormattingVariableGroup.create(oFF.OuDisplayFormattingView.DATA_LABEL_FORMATTING, loc.getText(oFF.OuDisplayFormattingI18n.STYLE_DATA_LABEL), visualizationVariableHolder, oFF.OlapVisualizationConstants.DATA_LABEL_STYLE_VARIABLE_FONT_FAMILY, oFF.OlapVisualizationConstants.DATA_LABEL_STYLE_VARIABLE_FONT_SIZE, oFF.OlapVisualizationConstants.DATA_LABEL_STYLE_VARIABLE_FONT_COLOR, oFF.OlapVisualizationConstants.DATA_LABEL_STYLE_VARIABLE_FONT_ITALIC, oFF.OlapVisualizationConstants.DATA_LABEL_STYLE_VARIABLE_FONT_BOLD);
		variableGroup.setShowVN(oFF.OlapVisualizationConstants.DATA_LABEL_STYLE_VARIABLE_ENABLED);
		variableGroup.setShowLabel(loc.getText(oFF.OuDisplayFormattingI18n.STYLE_SHOW_DATA_LABEL));
		variableGroup.setAvoidOverlapVN(oFF.OlapVisualizationConstants.DATA_LABEL_STYLE_VARIABLE_AVOID_OVERLAP);
		this.m_textFormattingVariableGroups.add(variableGroup);
		variableGroup = oFF.OuTextFormattingVariableGroup.create(oFF.OuDisplayFormattingView.LEGEND_FORMATTING, loc.getText(oFF.OuDisplayFormattingI18n.STYLE_LEGEND), visualizationVariableHolder, oFF.OlapVisualizationConstants.LEGEND_STYLE_VARIABLE_FONT_FAMILY, oFF.OlapVisualizationConstants.LEGEND_STYLE_VARIABLE_FONT_SIZE, oFF.OlapVisualizationConstants.LEGEND_STYLE_VARIABLE_FONT_COLOR, oFF.OlapVisualizationConstants.LEGEND_STYLE_VARIABLE_FONT_ITALIC, oFF.OlapVisualizationConstants.LEGEND_STYLE_VARIABLE_FONT_BOLD);
		variableGroup.setShowVN(oFF.OlapVisualizationConstants.LEGEND_STYLE_VARIABLE_ENABLED);
		variableGroup.setShowLabel(loc.getText(oFF.OuDisplayFormattingI18n.STYLE_SHOW_LEGEND));
		variableGroup.setPlacementVN(oFF.OlapVisualizationConstants.LEGEND_STYLE_VARIABLE_POSITION);
		variableGroup.setHorizontalAlignmentVN(oFF.OlapVisualizationConstants.LEGEND_STYLE_VARIABLE_HORIZONTAL_ALIGNMENT);
		variableGroup.setVerticalAlignmentVN(oFF.OlapVisualizationConstants.LEGEND_STYLE_VARIABLE_VERTICAL_ALIGNMENT);
		variableGroup.setLayoutDirectionVN(oFF.OlapVisualizationConstants.LEGEND_STYLE_VARIABLE_LAYOUT_DIRECTION);
		this.m_textFormattingVariableGroups.add(variableGroup);
	}
};

oFF.OuTableTextFormattingPropertiesGroup = function() {};
oFF.OuTableTextFormattingPropertiesGroup.prototype = new oFF.DfNameTextObject();
oFF.OuTableTextFormattingPropertiesGroup.prototype._ff_c = "OuTableTextFormattingPropertiesGroup";

oFF.OuTableTextFormattingPropertiesGroup.create = function(name, text, tableStyle)
{
	let instance = new oFF.OuTableTextFormattingPropertiesGroup();
	instance.setupWithNameText(name, text);
	instance.m_tableStyle = tableStyle;
	return instance;
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.m_showLabel = null;
oFF.OuTableTextFormattingPropertiesGroup.prototype.m_tableStyle = null;
oFF.OuTableTextFormattingPropertiesGroup.prototype.getFillColor = function()
{
	return this.m_tableStyle.getFillColor();
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.getFontColor = function()
{
	return this.m_tableStyle.getFontColor();
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.getFontFamily = function()
{
	return this.m_tableStyle.getFontFamily();
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.getFontSize = function()
{
	return oFF.XDouble.convertToInt(this.m_tableStyle.getFontSize());
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.getHorizontalAlignment = function()
{
	return this.m_tableStyle.getHorizontalAlignment();
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.getLayoutDirection = function()
{
	return null;
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.getPlacement = function()
{
	return null;
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.getShowLabel = function()
{
	return this.m_showLabel;
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.getVerticalAlignment = function()
{
	return this.m_tableStyle.getVerticalAlignment();
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.isAvoidOverlap = function()
{
	return null;
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.isAvoidOverlapDefault = function()
{
	return true;
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.isFillColorDefault = function()
{
	return oFF.XStringUtils.isNullOrEmpty(this.m_tableStyle.getFillColor());
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.isFontBold = function()
{
	return this.m_tableStyle.isFontBoldExt();
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.isFontBoldDefault = function()
{
	return !oFF.TriStateBool.isExplicitBooleanValue(this.m_tableStyle.isFontBoldExt());
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.isFontColorDefault = function()
{
	return oFF.XStringUtils.isNullOrEmpty(this.m_tableStyle.getFontColor());
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.isFontFamilyDefault = function()
{
	return oFF.XStringUtils.isNullOrEmpty(this.m_tableStyle.getFontFamily());
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.isFontItalic = function()
{
	return this.m_tableStyle.isFontItalicExt();
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.isFontItalicDefault = function()
{
	return !oFF.TriStateBool.isExplicitBooleanValue(this.m_tableStyle.isFontItalicExt());
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.isFontSizeDefault = function()
{
	return this.m_tableStyle.getFontSize() <= 0;
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.isFontStrikeThrough = function()
{
	return this.m_tableStyle.isFontStrikeThroughExt();
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.isFontStrikeThroughDefault = function()
{
	return !oFF.TriStateBool.isExplicitBooleanValue(this.m_tableStyle.isFontStrikeThroughExt());
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.isFontUnderline = function()
{
	return this.m_tableStyle.isFontUnderlineExt();
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.isFontUnderlineDefault = function()
{
	return !oFF.TriStateBool.isExplicitBooleanValue(this.m_tableStyle.isFontUnderlineExt());
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.isHorizontalAlignmentDefault = function()
{
	return this.m_tableStyle.getHorizontalAlignment() === null || this.m_tableStyle.getHorizontalAlignment() === oFF.CellAlignmentHorizontal.INHERIT;
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.isLayoutDirectionDefault = function()
{
	return true;
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.isPlacementDefault = function()
{
	return true;
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.isShow = function()
{
	return this.m_tableStyle.isShowFormattedText();
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.isShownDefault = function()
{
	return !oFF.TriStateBool.isExplicitBooleanValue(this.m_tableStyle.isShowFormattedText());
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.isVerticalAlignmentDefault = function()
{
	return this.m_tableStyle.getVerticalAlignment() === null || this.m_tableStyle.getVerticalAlignment() === oFF.CellAlignmentVertical.INHERIT;
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.resetAvoidOverlap = function() {};
oFF.OuTableTextFormattingPropertiesGroup.prototype.resetFillColor = function()
{
	this.m_tableStyle.setFillColor(null);
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.resetFontBold = function()
{
	this.m_tableStyle.setFontBoldExt(oFF.TriStateBool._DEFAULT);
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.resetFontColor = function()
{
	this.m_tableStyle.setFontColor(null);
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.resetFontFamily = function()
{
	this.m_tableStyle.setFontFamily(null);
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.resetFontItalic = function()
{
	this.m_tableStyle.setFontItalicExt(oFF.TriStateBool._DEFAULT);
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.resetFontSize = function()
{
	this.m_tableStyle.setFontSize(-1);
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.resetFontStrikeThrough = function()
{
	this.m_tableStyle.setFontStrikeThroughExt(oFF.TriStateBool._DEFAULT);
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.resetFontUnderline = function()
{
	this.m_tableStyle.setFontUnderlineExt(oFF.TriStateBool._DEFAULT);
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.resetHorizontalAlignment = function()
{
	this.m_tableStyle.setHorizontalAlignment(null);
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.resetLayoutDirection = function() {};
oFF.OuTableTextFormattingPropertiesGroup.prototype.resetPlacement = function() {};
oFF.OuTableTextFormattingPropertiesGroup.prototype.resetShown = function()
{
	this.m_tableStyle.setShowFormattedText(oFF.TriStateBool._DEFAULT);
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.resetVerticalAlignment = function()
{
	this.m_tableStyle.setVerticalAlignment(null);
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.setAvoidOverlap = function(avoidOverlap) {};
oFF.OuTableTextFormattingPropertiesGroup.prototype.setFillColor = function(fillColor)
{
	this.m_tableStyle.setFillColor(fillColor);
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.setFontBold = function(fontBold)
{
	this.m_tableStyle.setFontBoldExt(fontBold);
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.setFontColor = function(fontColor)
{
	this.m_tableStyle.setFontColor(fontColor);
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.setFontFamily = function(fontFamily)
{
	this.m_tableStyle.setFontFamily(fontFamily);
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.setFontItalic = function(fontItalic)
{
	this.m_tableStyle.setFontItalicExt(fontItalic);
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.setFontSize = function(fontSize)
{
	this.m_tableStyle.setFontSize(fontSize);
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.setFontStrikeThrough = function(fontStrikeThrough)
{
	this.m_tableStyle.setFontStrikeThroughExt(fontStrikeThrough);
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.setFontUnderline = function(fontUnderline)
{
	this.m_tableStyle.setFontUnderlineExt(fontUnderline);
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.setHorizontalAlignment = function(alignmentHorizontal)
{
	this.m_tableStyle.setHorizontalAlignment(alignmentHorizontal);
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.setLayoutDirection = function(layoutDirection) {};
oFF.OuTableTextFormattingPropertiesGroup.prototype.setPlacement = function(legendPosition) {};
oFF.OuTableTextFormattingPropertiesGroup.prototype.setShowLabel = function(showLabel)
{
	this.m_showLabel = showLabel;
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.setShown = function(shown)
{
	this.m_tableStyle.setShowFormattedText(shown);
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.setVerticalAlignment = function(alignmentVertical)
{
	this.m_tableStyle.setVerticalAlignment(alignmentVertical);
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.supportsAvoidOverlap = function()
{
	return false;
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.supportsFillColor = function()
{
	return true;
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.supportsFontStrikeThrough = function()
{
	return true;
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.supportsFontUnderline = function()
{
	return true;
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.supportsHorizontalAlignment = function()
{
	return true;
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.supportsLayoutDirection = function()
{
	return false;
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.supportsPlacement = function()
{
	return false;
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.supportsShown = function()
{
	return true;
};
oFF.OuTableTextFormattingPropertiesGroup.prototype.supportsVerticalAlignment = function()
{
	return true;
};

oFF.OuTextFormattingVariableGroup = function() {};
oFF.OuTextFormattingVariableGroup.prototype = new oFF.DfNameTextObject();
oFF.OuTextFormattingVariableGroup.prototype._ff_c = "OuTextFormattingVariableGroup";

oFF.OuTextFormattingVariableGroup.create = function(name, text, variableHolder, fontFamilyVN, fontSizeVN, fontColorVN, italicVN, boldVN)
{
	let instance = new oFF.OuTextFormattingVariableGroup();
	instance.setupWithNameText(name, text);
	instance.m_variableHolderContext = variableHolder;
	instance.m_fontFamilyVN = fontFamilyVN;
	instance.m_fontSizeVN = fontSizeVN;
	instance.m_fontColorVN = fontColorVN;
	instance.m_italicVN = italicVN;
	instance.m_boldVN = boldVN;
	return instance;
};
oFF.OuTextFormattingVariableGroup.prototype.m_avoidOverlapVN = null;
oFF.OuTextFormattingVariableGroup.prototype.m_boldVN = null;
oFF.OuTextFormattingVariableGroup.prototype.m_fillColorVN = null;
oFF.OuTextFormattingVariableGroup.prototype.m_fontColorVN = null;
oFF.OuTextFormattingVariableGroup.prototype.m_fontFamilyVN = null;
oFF.OuTextFormattingVariableGroup.prototype.m_fontSizeVN = null;
oFF.OuTextFormattingVariableGroup.prototype.m_horizontalAlignmentVN = null;
oFF.OuTextFormattingVariableGroup.prototype.m_italicVN = null;
oFF.OuTextFormattingVariableGroup.prototype.m_layoutDirectionVN = null;
oFF.OuTextFormattingVariableGroup.prototype.m_placementVN = null;
oFF.OuTextFormattingVariableGroup.prototype.m_showLabel = null;
oFF.OuTextFormattingVariableGroup.prototype.m_showVN = null;
oFF.OuTextFormattingVariableGroup.prototype.m_strikeThroughVN = null;
oFF.OuTextFormattingVariableGroup.prototype.m_underlineVN = null;
oFF.OuTextFormattingVariableGroup.prototype.m_variableHolderContext = null;
oFF.OuTextFormattingVariableGroup.prototype.m_verticalAlignmentVN = null;
oFF.OuTextFormattingVariableGroup.prototype.clearVariable = function(name)
{
	this.m_variableHolderContext.getVisualizationVariableHolder().clearVariable(name);
};
oFF.OuTextFormattingVariableGroup.prototype.ensureVariable = function(name, valueType)
{
	return oFF.isNull(name) ? null : this.getVariable(name).orElse(this.m_variableHolderContext.addNewSimpleTypeVariable(valueType, name, name, false));
};
oFF.OuTextFormattingVariableGroup.prototype.getFillColor = function()
{
	let variable = this.getVariable(this.m_fillColorVN);
	return variable.isPresent() ? variable.get().getString() : null;
};
oFF.OuTextFormattingVariableGroup.prototype.getFontColor = function()
{
	let variable = this.getVariable(this.m_fontColorVN);
	return variable.isPresent() ? variable.get().getString() : null;
};
oFF.OuTextFormattingVariableGroup.prototype.getFontFamily = function()
{
	let variable = this.getVariable(this.m_fontFamilyVN);
	return variable.isPresent() ? variable.get().getString() : null;
};
oFF.OuTextFormattingVariableGroup.prototype.getFontSize = function()
{
	let variable = this.getVariable(this.m_fontSizeVN);
	return variable.isPresent() ? variable.get().getInteger() : 0;
};
oFF.OuTextFormattingVariableGroup.prototype.getHorizontalAlignment = function()
{
	let variable = this.getVariableOrFallback(this.m_horizontalAlignmentVN);
	return variable.isPresent() ? oFF.CellAlignmentHorizontal.lookup(variable.get().getString()) : null;
};
oFF.OuTextFormattingVariableGroup.prototype.getLayoutDirection = function()
{
	let variable = this.getVariableOrFallback(this.m_layoutDirectionVN);
	return variable.isPresent() ? oFF.LayoutDirection.lookup(variable.get().getString()) : null;
};
oFF.OuTextFormattingVariableGroup.prototype.getPlacement = function()
{
	let variable = this.getVariable(this.m_placementVN);
	return variable.isPresent() ? oFF.ChartLegendPosition.lookup(variable.get().getString()) : null;
};
oFF.OuTextFormattingVariableGroup.prototype.getShowLabel = function()
{
	return this.m_showLabel;
};
oFF.OuTextFormattingVariableGroup.prototype.getVariable = function(name)
{
	return oFF.XOptional.ofNullable(oFF.isNull(name) ? null : this.m_variableHolderContext.getVariable(name));
};
oFF.OuTextFormattingVariableGroup.prototype.getVariableOrFallback = function(name)
{
	return oFF.XOptional.ofNullable(oFF.isNull(name) ? null : this.m_variableHolderContext.getVariableOrFallback(name));
};
oFF.OuTextFormattingVariableGroup.prototype.getVerticalAlignment = function()
{
	let variable = this.getVariableOrFallback(this.m_verticalAlignmentVN);
	return variable.isPresent() ? oFF.CellAlignmentVertical.lookup(variable.get().getString()) : null;
};
oFF.OuTextFormattingVariableGroup.prototype.isAvoidOverlap = function()
{
	let variable = this.getVariableOrFallback(this.m_avoidOverlapVN);
	return variable.isPresent() ? oFF.TriStateBool.lookup(variable.get().getBoolean()) : oFF.TriStateBool._DEFAULT;
};
oFF.OuTextFormattingVariableGroup.prototype.isAvoidOverlapDefault = function()
{
	let variable = this.getVariable(this.m_avoidOverlapVN);
	return !variable.isPresent() || variable.get().isEmpty();
};
oFF.OuTextFormattingVariableGroup.prototype.isFillColorDefault = function()
{
	let variable = this.getVariable(this.m_fillColorVN);
	return !variable.isPresent() || variable.get().isEmpty() || oFF.XStringUtils.isNullOrEmpty(variable.get().getString());
};
oFF.OuTextFormattingVariableGroup.prototype.isFontBold = function()
{
	let variable = this.getVariable(this.m_boldVN);
	return variable.isPresent() ? oFF.TriStateBool.lookup(variable.get().getBoolean()) : oFF.TriStateBool._DEFAULT;
};
oFF.OuTextFormattingVariableGroup.prototype.isFontBoldDefault = function()
{
	let variable = this.getVariable(this.m_boldVN);
	return !variable.isPresent() || variable.get().isEmpty();
};
oFF.OuTextFormattingVariableGroup.prototype.isFontColorDefault = function()
{
	let variable = this.getVariable(this.m_fontColorVN);
	return !variable.isPresent() || variable.get().isEmpty() || oFF.XStringUtils.isNullOrEmpty(variable.get().getString());
};
oFF.OuTextFormattingVariableGroup.prototype.isFontFamilyDefault = function()
{
	let variable = this.getVariable(this.m_fontFamilyVN);
	return !variable.isPresent() || variable.get().isEmpty() || oFF.XStringUtils.isNullOrEmpty(variable.get().getString());
};
oFF.OuTextFormattingVariableGroup.prototype.isFontItalic = function()
{
	let variable = this.getVariable(this.m_italicVN);
	return variable.isPresent() ? oFF.TriStateBool.lookup(variable.get().getBoolean()) : oFF.TriStateBool._DEFAULT;
};
oFF.OuTextFormattingVariableGroup.prototype.isFontItalicDefault = function()
{
	let variable = this.getVariable(this.m_italicVN);
	return !variable.isPresent() || variable.get().isEmpty();
};
oFF.OuTextFormattingVariableGroup.prototype.isFontSizeDefault = function()
{
	let variable = this.getVariable(this.m_fontSizeVN);
	return !variable.isPresent() || variable.get().isEmpty() || variable.get().getInteger() <= 0;
};
oFF.OuTextFormattingVariableGroup.prototype.isFontStrikeThrough = function()
{
	let variable = this.getVariable(this.m_strikeThroughVN);
	return variable.isPresent() ? oFF.TriStateBool.lookup(variable.get().getBoolean()) : oFF.TriStateBool._DEFAULT;
};
oFF.OuTextFormattingVariableGroup.prototype.isFontStrikeThroughDefault = function()
{
	let variable = this.getVariable(this.m_strikeThroughVN);
	return !variable.isPresent() || variable.get().isEmpty();
};
oFF.OuTextFormattingVariableGroup.prototype.isFontUnderline = function()
{
	let variable = this.getVariable(this.m_underlineVN);
	return variable.isPresent() ? oFF.TriStateBool.lookup(variable.get().getBoolean()) : oFF.TriStateBool._DEFAULT;
};
oFF.OuTextFormattingVariableGroup.prototype.isFontUnderlineDefault = function()
{
	let variable = this.getVariable(this.m_underlineVN);
	return !variable.isPresent() || variable.get().isEmpty();
};
oFF.OuTextFormattingVariableGroup.prototype.isHorizontalAlignmentDefault = function()
{
	let variable = this.getVariable(this.m_horizontalAlignmentVN);
	return !variable.isPresent() || variable.get().isEmpty();
};
oFF.OuTextFormattingVariableGroup.prototype.isLayoutDirectionDefault = function()
{
	let variable = this.getVariable(this.m_layoutDirectionVN);
	return !variable.isPresent() || variable.get().isEmpty();
};
oFF.OuTextFormattingVariableGroup.prototype.isPlacementDefault = function()
{
	let variable = this.getVariable(this.m_placementVN);
	return !variable.isPresent() || variable.get().isEmpty();
};
oFF.OuTextFormattingVariableGroup.prototype.isShow = function()
{
	let variable = this.getVariableOrFallback(this.m_showVN);
	return variable.isPresent() ? oFF.TriStateBool.lookup(variable.get().getBoolean()) : oFF.TriStateBool._DEFAULT;
};
oFF.OuTextFormattingVariableGroup.prototype.isShownDefault = function()
{
	let variable = this.getVariable(this.m_showVN);
	return !variable.isPresent() || variable.get().isEmpty();
};
oFF.OuTextFormattingVariableGroup.prototype.isVerticalAlignmentDefault = function()
{
	let variable = this.getVariable(this.m_verticalAlignmentVN);
	return !variable.isPresent() || variable.get().isEmpty();
};
oFF.OuTextFormattingVariableGroup.prototype.resetAvoidOverlap = function()
{
	this.getVariable(this.m_avoidOverlapVN).ifPresent((_var) => {
		_var.clear();
	});
};
oFF.OuTextFormattingVariableGroup.prototype.resetFillColor = function()
{
	this.getVariable(this.m_fillColorVN).ifPresent((_var) => {
		_var.clear();
	});
};
oFF.OuTextFormattingVariableGroup.prototype.resetFontBold = function()
{
	this.getVariable(this.m_boldVN).ifPresent((_var) => {
		_var.clear();
	});
};
oFF.OuTextFormattingVariableGroup.prototype.resetFontColor = function()
{
	this.getVariable(this.m_fontColorVN).ifPresent((_var) => {
		_var.clear();
	});
};
oFF.OuTextFormattingVariableGroup.prototype.resetFontFamily = function()
{
	this.getVariable(this.m_fontFamilyVN).ifPresent((_var) => {
		_var.clear();
	});
};
oFF.OuTextFormattingVariableGroup.prototype.resetFontItalic = function()
{
	this.getVariable(this.m_italicVN).ifPresent((_var) => {
		_var.clear();
	});
};
oFF.OuTextFormattingVariableGroup.prototype.resetFontSize = function()
{
	this.getVariable(this.m_fontSizeVN).ifPresent((_var) => {
		_var.clear();
	});
};
oFF.OuTextFormattingVariableGroup.prototype.resetFontStrikeThrough = function()
{
	this.getVariable(this.m_strikeThroughVN).ifPresent((_var) => {
		_var.clear();
	});
};
oFF.OuTextFormattingVariableGroup.prototype.resetFontUnderline = function()
{
	this.getVariable(this.m_underlineVN).ifPresent((_var) => {
		_var.clear();
	});
};
oFF.OuTextFormattingVariableGroup.prototype.resetHorizontalAlignment = function()
{
	this.getVariable(this.m_horizontalAlignmentVN).ifPresent((_var) => {
		_var.clear();
	});
};
oFF.OuTextFormattingVariableGroup.prototype.resetLayoutDirection = function()
{
	this.getVariable(this.m_layoutDirectionVN).ifPresent((_var) => {
		_var.clear();
	});
};
oFF.OuTextFormattingVariableGroup.prototype.resetPlacement = function()
{
	this.getVariable(this.m_placementVN).ifPresent((_var) => {
		_var.clear();
	});
};
oFF.OuTextFormattingVariableGroup.prototype.resetShown = function()
{
	this.getVariable(this.m_showVN).ifPresent((_var) => {
		_var.clear();
	});
};
oFF.OuTextFormattingVariableGroup.prototype.resetVerticalAlignment = function()
{
	this.getVariable(this.m_verticalAlignmentVN).ifPresent((_var) => {
		_var.clear();
	});
};
oFF.OuTextFormattingVariableGroup.prototype.setAvoidOverlap = function(avoidOverlap)
{
	if (!oFF.TriStateBool.isExplicitBooleanValue(avoidOverlap))
	{
		this.clearVariable(this.m_avoidOverlapVN);
	}
	else
	{
		this.setBooleanVariable(this.m_avoidOverlapVN, avoidOverlap);
	}
};
oFF.OuTextFormattingVariableGroup.prototype.setAvoidOverlapVN = function(avoidOverlapVN)
{
	this.m_avoidOverlapVN = avoidOverlapVN;
};
oFF.OuTextFormattingVariableGroup.prototype.setBooleanVariable = function(name, triStateBool)
{
	let variable = this.ensureVariable(name, oFF.XValueType.BOOLEAN);
	if (oFF.notNull(variable))
	{
		variable.setBoolean(oFF.notNull(triStateBool) && triStateBool.getBoolean());
	}
};
oFF.OuTextFormattingVariableGroup.prototype.setFillColor = function(fillColor)
{
	if (oFF.XStringUtils.isNullOrEmpty(fillColor))
	{
		this.clearVariable(this.m_fillColorVN);
	}
	else
	{
		this.setStringVariable(this.m_fillColorVN, fillColor);
	}
};
oFF.OuTextFormattingVariableGroup.prototype.setFillColorVN = function(fillColorVN)
{
	this.m_fillColorVN = fillColorVN;
};
oFF.OuTextFormattingVariableGroup.prototype.setFontBold = function(fontBold)
{
	if (!oFF.TriStateBool.isExplicitBooleanValue(fontBold))
	{
		this.clearVariable(this.m_boldVN);
	}
	else
	{
		this.setBooleanVariable(this.m_boldVN, fontBold);
	}
};
oFF.OuTextFormattingVariableGroup.prototype.setFontColor = function(fontColor)
{
	if (oFF.XStringUtils.isNullOrEmpty(fontColor))
	{
		this.clearVariable(this.m_fontColorVN);
	}
	else
	{
		this.setStringVariable(this.m_fontColorVN, fontColor);
	}
};
oFF.OuTextFormattingVariableGroup.prototype.setFontFamily = function(fontFamily)
{
	if (oFF.XStringUtils.isNullOrEmpty(fontFamily))
	{
		this.clearVariable(this.m_fontFamilyVN);
	}
	else
	{
		this.setStringVariable(this.m_fontFamilyVN, fontFamily);
	}
};
oFF.OuTextFormattingVariableGroup.prototype.setFontItalic = function(fontItalic)
{
	if (!oFF.TriStateBool.isExplicitBooleanValue(fontItalic))
	{
		this.clearVariable(this.m_italicVN);
	}
	else
	{
		this.setBooleanVariable(this.m_italicVN, fontItalic);
	}
};
oFF.OuTextFormattingVariableGroup.prototype.setFontSize = function(fontSize)
{
	if (fontSize <= 0)
	{
		this.clearVariable(this.m_fontSizeVN);
	}
	else
	{
		this.setIntegerVariable(this.m_fontSizeVN, fontSize);
	}
};
oFF.OuTextFormattingVariableGroup.prototype.setFontStrikeThrough = function(fontStrikeThrough)
{
	if (!oFF.TriStateBool.isExplicitBooleanValue(fontStrikeThrough))
	{
		this.clearVariable(this.m_strikeThroughVN);
	}
	else
	{
		this.setBooleanVariable(this.m_strikeThroughVN, fontStrikeThrough);
	}
};
oFF.OuTextFormattingVariableGroup.prototype.setFontUnderline = function(fontUnderline)
{
	if (!oFF.TriStateBool.isExplicitBooleanValue(fontUnderline))
	{
		this.clearVariable(this.m_underlineVN);
	}
	else
	{
		this.setBooleanVariable(this.m_underlineVN, fontUnderline);
	}
};
oFF.OuTextFormattingVariableGroup.prototype.setHorizontalAlignment = function(alignmentHorizontal)
{
	if (oFF.isNull(alignmentHorizontal))
	{
		this.clearVariable(this.m_horizontalAlignmentVN);
	}
	else
	{
		this.setStringVariable(this.m_horizontalAlignmentVN, alignmentHorizontal.getName());
	}
};
oFF.OuTextFormattingVariableGroup.prototype.setHorizontalAlignmentVN = function(alignmentVN)
{
	this.m_horizontalAlignmentVN = alignmentVN;
};
oFF.OuTextFormattingVariableGroup.prototype.setIntegerVariable = function(name, integerValue)
{
	let variable = this.ensureVariable(name, oFF.XValueType.INTEGER);
	if (oFF.notNull(variable))
	{
		variable.setInteger(integerValue);
	}
};
oFF.OuTextFormattingVariableGroup.prototype.setLayoutDirection = function(layoutDirection)
{
	if (oFF.isNull(layoutDirection))
	{
		this.clearVariable(this.m_layoutDirectionVN);
	}
	else
	{
		this.setStringVariable(this.m_layoutDirectionVN, layoutDirection.getName());
	}
};
oFF.OuTextFormattingVariableGroup.prototype.setLayoutDirectionVN = function(layoutDirectionVN)
{
	this.m_layoutDirectionVN = layoutDirectionVN;
};
oFF.OuTextFormattingVariableGroup.prototype.setPlacement = function(legendPosition)
{
	if (oFF.isNull(legendPosition))
	{
		this.clearVariable(this.m_placementVN);
	}
	else
	{
		this.setStringVariable(this.m_placementVN, legendPosition.getName());
	}
};
oFF.OuTextFormattingVariableGroup.prototype.setPlacementVN = function(placementVN)
{
	this.m_placementVN = placementVN;
};
oFF.OuTextFormattingVariableGroup.prototype.setShowLabel = function(showLabel)
{
	this.m_showLabel = showLabel;
};
oFF.OuTextFormattingVariableGroup.prototype.setShowVN = function(showVN)
{
	this.m_showVN = showVN;
};
oFF.OuTextFormattingVariableGroup.prototype.setShown = function(shown)
{
	if (!oFF.TriStateBool.isExplicitBooleanValue(shown))
	{
		this.clearVariable(this.m_showVN);
	}
	else
	{
		this.setBooleanVariable(this.m_showVN, shown);
	}
};
oFF.OuTextFormattingVariableGroup.prototype.setStrikeThroughVN = function(strikeThroughVN)
{
	this.m_strikeThroughVN = strikeThroughVN;
};
oFF.OuTextFormattingVariableGroup.prototype.setStringVariable = function(name, string)
{
	let variable = this.ensureVariable(name, oFF.XValueType.STRING);
	if (oFF.notNull(variable))
	{
		variable.setValueByString(string);
	}
};
oFF.OuTextFormattingVariableGroup.prototype.setUnderlineVN = function(underlineVN)
{
	this.m_underlineVN = underlineVN;
};
oFF.OuTextFormattingVariableGroup.prototype.setVerticalAlignment = function(alignmentVertical)
{
	if (oFF.isNull(alignmentVertical))
	{
		this.clearVariable(this.m_verticalAlignmentVN);
	}
	else
	{
		this.setStringVariable(this.m_verticalAlignmentVN, alignmentVertical.getName());
	}
};
oFF.OuTextFormattingVariableGroup.prototype.setVerticalAlignmentVN = function(alignmentVN)
{
	this.m_verticalAlignmentVN = alignmentVN;
};
oFF.OuTextFormattingVariableGroup.prototype.supportsAvoidOverlap = function()
{
	return oFF.XStringUtils.isNotNullAndNotEmpty(this.m_avoidOverlapVN);
};
oFF.OuTextFormattingVariableGroup.prototype.supportsFillColor = function()
{
	return oFF.XStringUtils.isNotNullAndNotEmpty(this.m_fillColorVN);
};
oFF.OuTextFormattingVariableGroup.prototype.supportsFontStrikeThrough = function()
{
	return oFF.XStringUtils.isNotNullAndNotEmpty(this.m_strikeThroughVN);
};
oFF.OuTextFormattingVariableGroup.prototype.supportsFontUnderline = function()
{
	return oFF.XStringUtils.isNotNullAndNotEmpty(this.m_underlineVN);
};
oFF.OuTextFormattingVariableGroup.prototype.supportsHorizontalAlignment = function()
{
	return oFF.XStringUtils.isNotNullAndNotEmpty(this.m_horizontalAlignmentVN);
};
oFF.OuTextFormattingVariableGroup.prototype.supportsLayoutDirection = function()
{
	return oFF.XStringUtils.isNotNullAndNotEmpty(this.m_layoutDirectionVN);
};
oFF.OuTextFormattingVariableGroup.prototype.supportsPlacement = function()
{
	return oFF.XStringUtils.isNotNullAndNotEmpty(this.m_placementVN);
};
oFF.OuTextFormattingVariableGroup.prototype.supportsShown = function()
{
	return oFF.XStringUtils.isNotNullAndNotEmpty(this.m_showVN);
};
oFF.OuTextFormattingVariableGroup.prototype.supportsVerticalAlignment = function()
{
	return oFF.XStringUtils.isNotNullAndNotEmpty(this.m_verticalAlignmentVN);
};

oFF.OuNumberFormattingView = function() {};
oFF.OuNumberFormattingView.prototype = new oFF.DfUiContentView();
oFF.OuNumberFormattingView.prototype._ff_c = "OuNumberFormattingView";

oFF.OuNumberFormattingView.ALL_KEY = "!all";
oFF.OuNumberFormattingView.DEFAULT_KEY = "!default";
oFF.OuNumberFormattingView.EMPTY_KEY = "!empty";
oFF.OuNumberFormattingView.FORMAT = "scaleFormat";
oFF.OuNumberFormattingView.MEMBER = "member";
oFF.OuNumberFormattingView.MIXED_KEY = "!mixed";
oFF.OuNumberFormattingView.MIXED_UNIT_CURRENCY = "mixedUnitCurrency";
oFF.OuNumberFormattingView.SCALE = "scale";
oFF.OuNumberFormattingView.SHIFT = "shift";
oFF.OuNumberFormattingView.SIGN = "sign";
oFF.OuNumberFormattingView.createView = function(genesis)
{
	let obj = new oFF.OuNumberFormattingView();
	obj.initView(genesis);
	return obj;
};
oFF.OuNumberFormattingView.prototype.m_commercialMinusEnabled = false;
oFF.OuNumberFormattingView.prototype.m_form = null;
oFF.OuNumberFormattingView.prototype.m_loadedValueFormat = null;
oFF.OuNumberFormattingView.prototype.m_loadedValueMember = null;
oFF.OuNumberFormattingView.prototype.m_loadedValueScale = null;
oFF.OuNumberFormattingView.prototype.m_loadedValueShift = null;
oFF.OuNumberFormattingView.prototype.m_loadedValueSign = null;
oFF.OuNumberFormattingView.prototype.m_loadedValueType = null;
oFF.OuNumberFormattingView.prototype.m_mixedUnitCurrencyLabel = null;
oFF.OuNumberFormattingView.prototype.m_onChange = null;
oFF.OuNumberFormattingView.prototype.m_queryManager = null;
oFF.OuNumberFormattingView.prototype.addCheckBox = function(name, label, text)
{
	let i18n = this.getLocalizationProvider();
	this.m_mixedUnitCurrencyLabel = this.m_form.addFormLabel(name, i18n.getText(label), i18n.getText(label));
	this.m_mixedUnitCurrencyLabel.setFontWeight(oFF.UiFontWeight.NORMAL).setVisible(false);
	let checkbox = this.m_form.addCheckbox(name, false, i18n.getText(text));
	checkbox.setVisible(false);
	checkbox.setValueChangedConsumer((key, newValue) => {
		this.saveState();
	});
};
oFF.OuNumberFormattingView.prototype.addDropdown = function(name, text)
{
	let i18n = this.getLocalizationProvider();
	let formItem = this.m_form.addDropdown(name, null, i18n.getText(text), null, false);
	formItem.setLabelFontWeight(oFF.UiFontWeight.NORMAL);
};
oFF.OuNumberFormattingView.prototype.addMeasureDropdown = function()
{
	let formItem = this.m_form.addDropdown(oFF.OuNumberFormattingView.MEMBER, this.m_loadedValueMember, oFF.OuNumberFormattingView.MEMBER, null, false);
	formItem.setLabelFontWeight(oFF.UiFontWeight.NORMAL);
};
oFF.OuNumberFormattingView.prototype.applyStateToUi = function()
{
	this.setDropdownValue(oFF.OuNumberFormattingView.MEMBER, this.getMemberOptions(), this.m_loadedValueMember);
	this.setDropdownValue(oFF.OuNumberFormattingView.SHIFT, this.getShiftOptions(), this.m_loadedValueShift);
	this.setDropdownValue(oFF.OuNumberFormattingView.FORMAT, this.getFormatOptions(), this.m_loadedValueFormat);
	this.setDropdownValue(oFF.OuNumberFormattingView.SCALE, this.getScaleOptions(), this.m_loadedValueScale);
	this.setDropdownValue(oFF.OuNumberFormattingView.SIGN, this.getSignOptions(), this.m_loadedValueSign);
	this.m_form.getFormItemByKey(oFF.OuNumberFormattingView.SHIFT).setVisible(this.m_loadedValueType !== oFF.XValueType.PERCENT);
	this.m_form.getFormItemByKey(oFF.OuNumberFormattingView.FORMAT).setVisible(this.m_loadedValueType !== oFF.XValueType.PERCENT);
};
oFF.OuNumberFormattingView.prototype.buildViewUi = function(genesis)
{
	this.m_form = oFF.UiForm.create(this.getGenesis());
	this.addMeasureDropdown();
	this.addDropdown(oFF.OuNumberFormattingView.SHIFT, oFF.OuNumberFormattingI18n.STYLE_SCALE);
	this.addDropdown(oFF.OuNumberFormattingView.FORMAT, oFF.OuNumberFormattingI18n.STYLE_SCALE_FORMAT);
	this.addDropdown(oFF.OuNumberFormattingView.SCALE, oFF.OuNumberFormattingI18n.STYLE_DECIMAL_PLACES);
	this.addDropdown(oFF.OuNumberFormattingView.SIGN, oFF.OuNumberFormattingI18n.STYLE_SIGN);
	this.addCheckBox(oFF.OuNumberFormattingView.MIXED_UNIT_CURRENCY, oFF.OuNumberFormattingI18n.STYLE_MIXED_UNITS_CURRENCY_LABEL, oFF.OuNumberFormattingI18n.STYLE_MIXED_UNITS_CURRENCY);
	genesis.setRoot(this.m_form.getView());
};
oFF.OuNumberFormattingView.prototype.clearLoadedValues = function()
{
	this.m_loadedValueMember = oFF.OuNumberFormattingView.EMPTY_KEY;
	this.m_loadedValueShift = oFF.OuNumberFormattingView.EMPTY_KEY;
	this.m_loadedValueScale = oFF.OuNumberFormattingView.EMPTY_KEY;
	this.m_loadedValueFormat = oFF.OuNumberFormattingView.EMPTY_KEY;
	this.m_loadedValueSign = oFF.OuNumberFormattingView.EMPTY_KEY;
};
oFF.OuNumberFormattingView.prototype.destroyView = function()
{
	this.m_loadedValueMember = null;
	this.m_loadedValueScale = null;
	this.m_loadedValueShift = null;
	this.m_loadedValueFormat = null;
	this.m_loadedValueSign = null;
	this.m_loadedValueType = null;
	this.m_form = oFF.XObjectExt.release(this.m_form);
	this.m_queryManager = null;
	this.m_mixedUnitCurrencyLabel = null;
};
oFF.OuNumberFormattingView.prototype.determineAllValue = function(currentAll, currentValue)
{
	if (oFF.isNull(currentAll))
	{
		return currentValue;
	}
	if (!oFF.XString.isEqual(currentValue, currentAll) && !oFF.XString.isEqual(currentValue, oFF.OuNumberFormattingView.MIXED_KEY))
	{
		return oFF.OuNumberFormattingView.MIXED_KEY;
	}
	return currentAll;
};
oFF.OuNumberFormattingView.prototype.getConstantValue = function(constant, isDefault)
{
	if (isDefault)
	{
		return oFF.OuNumberFormattingView.DEFAULT_KEY;
	}
	if (oFF.isNull(constant))
	{
		return oFF.OuNumberFormattingView.DEFAULT_KEY;
	}
	return constant.getName();
};
oFF.OuNumberFormattingView.prototype.getEffectiveCellValueTypeOfMember = function(member)
{
	return this.isPercentMember(member) ? oFF.XValueType.PERCENT : member.getCellValueType();
};
oFF.OuNumberFormattingView.prototype.getFormatOptions = function()
{
	let i18n = this.getLocalizationProvider();
	let formatOptions = oFF.XLinkedHashMapByString.create();
	formatOptions.put(oFF.OuNumberFormattingView.DEFAULT_KEY, i18n.getText(oFF.OuNumberFormattingI18n.STYLE_DEFAULT));
	formatOptions.put(oFF.ScaleFormat.SHORT.getName(), i18n.getText(oFF.OuNumberFormattingI18n.STYLE_SCALE_FORMAT_SHORT));
	formatOptions.put(oFF.ScaleFormat.LONG.getName(), i18n.getText(oFF.OuNumberFormattingI18n.STYLE_SCALE_FORMAT_LONG));
	return formatOptions;
};
oFF.OuNumberFormattingView.prototype.getLeadingStructure = function()
{
	let queryModel = this.m_queryManager.getQueryModel();
	if (queryModel.isLeadingStructureAccount())
	{
		return queryModel.getAccountDimension();
	}
	return queryModel.getMeasureDimension();
};
oFF.OuNumberFormattingView.prototype.getLocalizationProvider = function()
{
	return oFF.OuNumberFormattingI18n.getLocalization();
};
oFF.OuNumberFormattingView.prototype.getMemberOptions = function()
{
	let sortedMemberItems = oFF.XLinkedHashMapByString.create();
	let allStructureMembers = this.getStructureMembers();
	if (allStructureMembers.size() > 1)
	{
		let i18n = this.getLocalizationProvider();
		if (this.m_queryManager.getQueryModel().isLeadingStructureAccount())
		{
			sortedMemberItems.put(oFF.OuNumberFormattingView.ALL_KEY, i18n.getText(oFF.OuNumberFormattingI18n.STYLE_ACCOUNT_ALL));
		}
		else
		{
			sortedMemberItems.put(oFF.OuNumberFormattingView.ALL_KEY, i18n.getText(oFF.OuNumberFormattingI18n.STYLE_MEASURE_ALL));
		}
	}
	let memberItemsToSort = oFF.XStream.of(allStructureMembers).reduce(oFF.XLinkedHashMapByString.create(), (memberItems, member) => {
		let text = oFF.QueryPresentationUtils.DESCRIPTION.getDisplayValueByType(member);
		memberItems.put(member.getName(), text);
		return memberItems;
	});
	sortedMemberItems.putAll(oFF.XCollectionUtils.sortMapByValues(memberItemsToSort, oFF.XSortDirection.ASCENDING, false));
	return sortedMemberItems;
};
oFF.OuNumberFormattingView.prototype.getQueryManager = function()
{
	return this.m_queryManager;
};
oFF.OuNumberFormattingView.prototype.getScaleOptions = function()
{
	let i18n = this.getLocalizationProvider();
	let scaleOptions = oFF.XLinkedHashMapByString.create();
	scaleOptions.put(oFF.OuNumberFormattingView.DEFAULT_KEY, i18n.getText(oFF.OuNumberFormattingI18n.STYLE_DEFAULT));
	scaleOptions.put("0", "0");
	scaleOptions.put("1", "1");
	scaleOptions.put("2", "2");
	scaleOptions.put("3", "3");
	scaleOptions.put("4", "4");
	scaleOptions.put("5", "5");
	scaleOptions.put("6", "6");
	return scaleOptions;
};
oFF.OuNumberFormattingView.prototype.getShiftOptions = function()
{
	let i18n = this.getLocalizationProvider();
	let shiftOptions = oFF.XLinkedHashMapByString.create();
	shiftOptions.put(oFF.OuNumberFormattingView.DEFAULT_KEY, i18n.getText(oFF.OuNumberFormattingI18n.STYLE_DEFAULT));
	shiftOptions.put("0", i18n.getText(oFF.OuNumberFormattingI18n.STYLE_SCALE_UNFORMATTED));
	shiftOptions.put("-3", i18n.getText(oFF.OuNumberFormattingI18n.STYLE_SCALE_LONG_THOUSAND));
	shiftOptions.put("-6", i18n.getText(oFF.OuNumberFormattingI18n.STYLE_SCALE_LONG_MILLION));
	shiftOptions.put("-9", i18n.getText(oFF.OuNumberFormattingI18n.STYLE_SCALE_LONG_BILLION));
	return shiftOptions;
};
oFF.OuNumberFormattingView.prototype.getSignOptions = function()
{
	let i18n = this.getLocalizationProvider();
	let formatOptions = oFF.XLinkedHashMapByString.create();
	formatOptions.put(oFF.OuNumberFormattingView.DEFAULT_KEY, i18n.getText(oFF.OuNumberFormattingI18n.STYLE_DEFAULT));
	formatOptions.put(oFF.SignPresentation.BEFORE_NUMBER.getName(), "+ / -");
	formatOptions.put(oFF.SignPresentation.BRACKETS.getName(), "( )");
	if (this.m_commercialMinusEnabled)
	{
		formatOptions.put(oFF.SignPresentation.COMMERCIAL_MINUS.getName(), "\u0394");
	}
	return formatOptions;
};
oFF.OuNumberFormattingView.prototype.getStringValue = function(modelValue, isDefault)
{
	if (isDefault)
	{
		return oFF.OuNumberFormattingView.DEFAULT_KEY;
	}
	if (oFF.isNull(modelValue))
	{
		return oFF.OuNumberFormattingView.DEFAULT_KEY;
	}
	let stringValue = modelValue.getStringRepresentation();
	if (oFF.isNull(stringValue))
	{
		return oFF.OuNumberFormattingView.DEFAULT_KEY;
	}
	return stringValue;
};
oFF.OuNumberFormattingView.prototype.getStructureMembers = function()
{
	let result = oFF.XListOfNameObject.create();
	let leadingStructure = this.getLeadingStructure();
	if (oFF.isNull(leadingStructure))
	{
		return result;
	}
	let allStructureMembers = leadingStructure.getAllStructureMembers();
	for (let i = 0; i < allStructureMembers.size(); i++)
	{
		let member = allStructureMembers.get(i);
		if (member.getCellValueType() !== null && member.getCellValueType().isDateTime())
		{
			continue;
		}
		if (member.getResultVisibility() === oFF.ResultVisibility.HIDDEN)
		{
			continue;
		}
		result.add(member);
	}
	return result;
};
oFF.OuNumberFormattingView.prototype.isPercentMember = function(member)
{
	return member.getCellValueType() === oFF.XValueType.PERCENT || member.getQueryManager().getSystemType().isTypeOf(oFF.SystemType.HANA) && member.getNumericShiftExt(true) !== null && member.getNumericShiftExt(true).getInteger() === 2;
};
oFF.OuNumberFormattingView.prototype.loadState = function(memberName)
{
	this.clearLoadedValues();
	if (this.getLeadingStructure() === null)
	{
		return;
	}
	this.m_loadedValueMember = memberName;
	if (oFF.XString.isEqual(this.m_loadedValueMember, oFF.OuNumberFormattingView.EMPTY_KEY))
	{
		return;
	}
	if (oFF.XString.isEqual(this.m_loadedValueMember, oFF.OuNumberFormattingView.ALL_KEY))
	{
		this.loadStateOfAllMeasures();
	}
	else
	{
		let structure = this.getLeadingStructure();
		let member = structure.getStructureMember(memberName);
		this.loadStateOfMeasure(member);
	}
};
oFF.OuNumberFormattingView.prototype.loadStateOfAllMeasures = function()
{
	let numericShiftAll = null;
	let numericScaleAll = null;
	let formatAll = null;
	let signAll = null;
	let positionAll = null;
	let valueTypeAll = null;
	let members = this.getStructureMembers();
	if (oFF.XCollectionUtils.hasElements(members))
	{
		valueTypeAll = this.getEffectiveCellValueTypeOfMember(members.get(0));
	}
	for (let i = 0; i < members.size(); i++)
	{
		let member = members.get(i);
		let cellValueType = this.getEffectiveCellValueTypeOfMember(member);
		if (valueTypeAll !== cellValueType)
		{
			valueTypeAll = null;
		}
		if (cellValueType !== oFF.XValueType.PERCENT)
		{
			let numericShift = this.getStringValue(member.getNumericShiftExt(true), member.isNumericShiftDefaultExt(true));
			numericShiftAll = this.determineAllValue(numericShiftAll, numericShift);
			let numericScale = this.getStringValue(member.getNumericScale(), member.isNumericScaleDefault());
			numericScaleAll = this.determineAllValue(numericScaleAll, numericScale);
			let format = this.getConstantValue(member.getScaleFormat(), member.isScaleFormatDefault());
			formatAll = this.determineAllValue(formatAll, format);
		}
		let sign = this.getConstantValue(member.getSignPresentation(), member.isSignPresentationDefault());
		signAll = this.determineAllValue(signAll, sign);
		let position = this.getConstantValue(member.getScaleAndUnitPlacement(), member.isScaleAndUnitPlacementDefault());
		positionAll = this.determineAllValue(positionAll, position);
	}
	this.m_loadedValueMember = oFF.OuNumberFormattingView.ALL_KEY;
	this.m_loadedValueShift = numericShiftAll;
	this.m_loadedValueScale = numericScaleAll;
	this.m_loadedValueFormat = formatAll;
	this.m_loadedValueSign = signAll;
	this.m_loadedValueType = valueTypeAll;
};
oFF.OuNumberFormattingView.prototype.loadStateOfMeasure = function(member)
{
	let numericShift = this.getStringValue(member.getNumericShiftExt(true), member.isNumericShiftDefaultExt(true));
	let numericScale = this.getStringValue(member.getNumericScale(), member.isNumericScaleDefault());
	let format = this.getConstantValue(member.getScaleFormat(), member.isScaleFormatDefault());
	let sign = this.getConstantValue(member.getSignPresentation(), member.isSignPresentationDefault());
	this.m_loadedValueMember = member.getName();
	this.m_loadedValueShift = numericShift;
	this.m_loadedValueScale = numericScale;
	this.m_loadedValueFormat = format;
	this.m_loadedValueSign = sign;
	this.m_loadedValueType = this.getEffectiveCellValueTypeOfMember(member);
};
oFF.OuNumberFormattingView.prototype.notifyChangeListeners = function()
{
	if (oFF.notNull(this.m_onChange))
	{
		this.m_onChange();
	}
};
oFF.OuNumberFormattingView.prototype.resetFormatOptions = function()
{
	this.m_form.getFormItemByKey(oFF.OuNumberFormattingView.FORMAT).setDropdownItems(this.getFormatOptions());
};
oFF.OuNumberFormattingView.prototype.resetScaleOptions = function()
{
	this.m_form.getFormItemByKey(oFF.OuNumberFormattingView.SCALE).setDropdownItems(this.getScaleOptions());
};
oFF.OuNumberFormattingView.prototype.resetShiftOptions = function()
{
	this.m_form.getFormItemByKey(oFF.OuNumberFormattingView.SHIFT).setDropdownItems(this.getShiftOptions());
};
oFF.OuNumberFormattingView.prototype.resetSignOptions = function()
{
	this.m_form.getFormItemByKey(oFF.OuNumberFormattingView.SIGN).setDropdownItems(this.getSignOptions());
};
oFF.OuNumberFormattingView.prototype.resetValues = function()
{
	this.m_form.getFormItemByKey(oFF.OuNumberFormattingView.SHIFT).setValue(oFF.XStringValue.create(oFF.OuNumberFormattingView.DEFAULT_KEY));
	this.m_form.getFormItemByKey(oFF.OuNumberFormattingView.SCALE).setValue(oFF.XStringValue.create(oFF.OuNumberFormattingView.DEFAULT_KEY));
	this.m_form.getFormItemByKey(oFF.OuNumberFormattingView.FORMAT).setValue(oFF.XStringValue.create(oFF.OuNumberFormattingView.DEFAULT_KEY));
	this.m_form.getFormItemByKey(oFF.OuNumberFormattingView.SIGN).setValue(oFF.XStringValue.create(oFF.OuNumberFormattingView.DEFAULT_KEY));
	if (this.m_form.getFormItemByKey(oFF.OuNumberFormattingView.MIXED_UNIT_CURRENCY) !== null)
	{
		this.m_form.getFormItemByKey(oFF.OuNumberFormattingView.MIXED_UNIT_CURRENCY).setValue(oFF.XBooleanValue.create(false));
	}
	this.saveState();
	this.resetShiftOptions();
	this.resetScaleOptions();
	this.resetFormatOptions();
	this.resetSignOptions();
};
oFF.OuNumberFormattingView.prototype.saveMemberState = function(jsonModel, member)
{
	let numericShift = jsonModel.getStringByKey(oFF.OuNumberFormattingView.SHIFT);
	let numericScale = jsonModel.getStringByKey(oFF.OuNumberFormattingView.SCALE);
	let format = jsonModel.getStringByKey(oFF.OuNumberFormattingView.FORMAT);
	let sign = jsonModel.getStringByKey(oFF.OuNumberFormattingView.SIGN);
	if (!this.isPercentMember(member))
	{
		if (oFF.XString.isEqual(numericShift, oFF.OuNumberFormattingView.DEFAULT_KEY))
		{
			member.resetToDefaultNumericShift();
		}
		else if (!oFF.XString.isEqual(numericShift, oFF.OuNumberFormattingView.MIXED_KEY))
		{
			member.setNumericShiftExt(oFF.XInteger.convertFromString(numericShift), true);
		}
		if (oFF.XString.isEqual(format, oFF.OuNumberFormattingView.DEFAULT_KEY))
		{
			member.resetToDefaultScaleFormat();
		}
		else if (!oFF.XString.isEqual(format, oFF.OuNumberFormattingView.MIXED_KEY))
		{
			member.setScaleFormat(oFF.ScaleFormat.lookup(format));
		}
	}
	if (oFF.XString.isEqual(numericScale, oFF.OuNumberFormattingView.DEFAULT_KEY))
	{
		member.resetToDefaultNumericScale();
	}
	else if (!oFF.XString.isEqual(numericScale, oFF.OuNumberFormattingView.MIXED_KEY))
	{
		member.setNumericScale(oFF.XInteger.convertFromString(numericScale));
	}
	if (oFF.XString.isEqual(sign, oFF.OuNumberFormattingView.DEFAULT_KEY))
	{
		member.resetToDefaultSignPresentation();
	}
	else if (!oFF.XString.isEqual(sign, oFF.OuNumberFormattingView.MIXED_KEY))
	{
		member.setSignPresentation(oFF.SignPresentation.lookup(sign));
	}
	if (this.getQueryManager().getApplication().getSession().hasFeatureByName(oFF.OlapUiFeatureToggle.DATA_ANALYZER_TABLE_MIXED_UNITS))
	{
		member.setShowMixedUnitsCurrencies(jsonModel.getBooleanByKey(oFF.OuNumberFormattingView.MIXED_UNIT_CURRENCY));
	}
};
oFF.OuNumberFormattingView.prototype.saveState = function()
{
	let jsonModel = this.m_form.getJsonModel();
	if (this.getLeadingStructure() === null)
	{
		return;
	}
	let allMembers = this.getStructureMembers();
	let memberName = jsonModel.getStringByKey(oFF.OuNumberFormattingView.MEMBER);
	if (oFF.XString.isEqual(memberName, oFF.OuNumberFormattingView.EMPTY_KEY))
	{
		return;
	}
	else if (oFF.XString.isEqual(memberName, oFF.OuNumberFormattingView.ALL_KEY))
	{
		for (let i = 0; i < allMembers.size(); i++)
		{
			this.saveMemberState(jsonModel, allMembers.get(i));
		}
	}
	else
	{
		this.saveMemberState(jsonModel, allMembers.getByKey(memberName));
	}
	this.notifyChangeListeners();
};
oFF.OuNumberFormattingView.prototype.setCommercialMinusEnabled = function(commercialMinusEnabled)
{
	this.m_commercialMinusEnabled = commercialMinusEnabled;
};
oFF.OuNumberFormattingView.prototype.setDropdownValue = function(name, options, key)
{
	let dropdown = this.m_form.getFormItemByKey(name);
	if (!options.containsKey(key))
	{
		options.put(key, "-");
	}
	dropdown.setDropdownItems(options);
	dropdown.setValue(oFF.XStringValue.create(key));
};
oFF.OuNumberFormattingView.prototype.setOnChange = function(onChange)
{
	this.m_onChange = onChange;
};
oFF.OuNumberFormattingView.prototype.setQueryManager = function(queryManager)
{
	this.m_queryManager = queryManager;
	this.clearLoadedValues();
};
oFF.OuNumberFormattingView.prototype.setupView = function()
{
	this.clearLoadedValues();
};
oFF.OuNumberFormattingView.prototype.updateCheckBox = function(name, visible)
{
	this.m_mixedUnitCurrencyLabel.setVisible(visible);
	let formItem = this.m_form.getFormItemByKey(name);
	formItem.setEnabled(this.getLeadingStructure() !== null);
	formItem.setVisible(visible);
	formItem.setValueChangedConsumer((key, newValue) => {
		this.saveState();
	});
};
oFF.OuNumberFormattingView.prototype.updateDropdown = function(name, defaultDropdownItems, visible)
{
	let formItem = this.m_form.getFormItemByKey(name);
	formItem.setEnabled(this.getLeadingStructure() !== null);
	formItem.setVisible(visible);
	formItem.setValueChangedConsumer((key, newValue) => {
		this.saveState();
		formItem.setDropdownItems(defaultDropdownItems);
	});
};
oFF.OuNumberFormattingView.prototype.updateMeasureDropdown = function()
{
	let i18n = this.getLocalizationProvider();
	let measureText = i18n.getText(oFF.OuNumberFormattingI18n.STYLE_MEASURE_SELECTION);
	if (this.getQueryManager().getQueryModel().isLeadingStructureAccount())
	{
		measureText = i18n.getText(oFF.OuNumberFormattingI18n.STYLE_ACCOUNT_SELECTION);
	}
	let formItem = this.m_form.getFormItemByKey(oFF.OuNumberFormattingView.MEMBER);
	formItem.setText(measureText);
	formItem.setEnabled(this.getLeadingStructure() !== null);
	formItem.setValueChangedConsumer((key, newValue) => {
		let value = oFF.XValueUtil.getString(newValue);
		this.loadState(value);
		this.applyStateToUi();
	});
};
oFF.OuNumberFormattingView.prototype.updateUi = function()
{
	this.updateMeasureDropdown();
	this.updateDropdown(oFF.OuNumberFormattingView.SHIFT, this.getShiftOptions(), true);
	this.updateDropdown(oFF.OuNumberFormattingView.FORMAT, this.getFormatOptions(), true);
	this.updateDropdown(oFF.OuNumberFormattingView.SCALE, this.getScaleOptions(), true);
	this.updateDropdown(oFF.OuNumberFormattingView.SIGN, this.getSignOptions(), true);
	if (this.getQueryManager() !== null)
	{
		this.updateCheckBox(oFF.OuNumberFormattingView.MIXED_UNIT_CURRENCY, this.getQueryManager().getApplication().getSession().hasFeatureByName(oFF.OlapUiFeatureToggle.DATA_ANALYZER_TABLE_MIXED_UNITS));
	}
	let allStructureMembers = this.getStructureMembers();
	if (allStructureMembers.size() === 1)
	{
		this.loadState(allStructureMembers.get(0).getName());
	}
	else if (!oFF.XString.isEqual(this.m_loadedValueMember, oFF.OuNumberFormattingView.EMPTY_KEY))
	{
		this.loadState(this.m_loadedValueMember);
	}
	else
	{
		this.loadState(oFF.OuNumberFormattingView.ALL_KEY);
	}
	this.applyStateToUi();
};

oFF.OuCalcUiComponent = function() {};
oFF.OuCalcUiComponent.prototype = new oFF.XConstantWithParent();
oFF.OuCalcUiComponent.prototype._ff_c = "OuCalcUiComponent";

oFF.OuCalcUiComponent.ASSISTANCE_PANEL = null;
oFF.OuCalcUiComponent.CODE_EDITOR = null;
oFF.OuCalcUiComponent.DETAILS_PANEL = null;
oFF.OuCalcUiComponent.ERRORS_PANEL = null;
oFF.OuCalcUiComponent.FORMULA_ELEMENTS_PANEL = null;
oFF.OuCalcUiComponent.s_instances = null;
oFF.OuCalcUiComponent.create = function(name, parent)
{
	oFF.XStringUtils.assertNotNullOrEmpty(name);
	let argType = new oFF.OuCalcUiComponent();
	argType.setupExt(name, parent);
	oFF.OuCalcUiComponent.s_instances.put(name, argType);
	return argType;
};
oFF.OuCalcUiComponent.staticSetup = function()
{
	oFF.OuCalcUiComponent.s_instances = oFF.XHashMapByString.create();
	oFF.OuCalcUiComponent.DETAILS_PANEL = oFF.OuCalcUiComponent.create("DETAILS_PANEL", null);
	oFF.OuCalcUiComponent.CODE_EDITOR = oFF.OuCalcUiComponent.create("CODE_EDITOR", null);
	oFF.OuCalcUiComponent.ASSISTANCE_PANEL = oFF.OuCalcUiComponent.create("ASSISTANCE_PANEL", null);
	oFF.OuCalcUiComponent.FORMULA_ELEMENTS_PANEL = oFF.OuCalcUiComponent.create("FORMULA_ELEMENTS_PANEL", null);
	oFF.OuCalcUiComponent.ERRORS_PANEL = oFF.OuCalcUiComponent.create("ERRORS_PANEL", null);
};

oFF.OuCalcComponentPluginWithSharedSpace = function() {};
oFF.OuCalcComponentPluginWithSharedSpace.prototype = new oFF.HuDfComponentPlugin();
oFF.OuCalcComponentPluginWithSharedSpace.prototype._ff_c = "OuCalcComponentPluginWithSharedSpace";

oFF.OuCalcComponentPluginWithSharedSpace.prototype.getNotificationCenter = function()
{
	let notificationCenter = this.getProcess().getSharedNotificationCenter();
	return oFF.notNull(notificationCenter) ? notificationCenter : this.getController().getLocalNotificationCenter();
};
oFF.OuCalcComponentPluginWithSharedSpace.prototype.getSharedDataSpace = function()
{
	return oFF.OuCalcSharedDataSpaceManager.create(this.getController().getProcess()).get();
};

oFF.OuCalcFunctionsView = function() {};
oFF.OuCalcFunctionsView.prototype = new oFF.OuCalcFormulaElementListContentView();
oFF.OuCalcFunctionsView.prototype._ff_c = "OuCalcFunctionsView";

oFF.OuCalcFunctionsView.create = function(formulaItems)
{
	let instance = new oFF.OuCalcFunctionsView();
	instance.setupInternal(true);
	instance.m_formulaItems = oFF.XObjectExt.assertNotNull(formulaItems);
	instance.m_onSelectFormulaItemConsumers = oFF.XConsumerCollection.create();
	return instance;
};
oFF.OuCalcFunctionsView.prototype.m_formulaItems = null;
oFF.OuCalcFunctionsView.prototype.m_onSelectFormulaItemConsumers = null;
oFF.OuCalcFunctionsView.prototype.addFunctionsPanel = function(fctPanel)
{
	fctPanel.renderView(this.getGenesis());
	fctPanel.attachOnChange((docFunction) => {
		this.m_onSelectFormulaItemConsumers.accept(docFunction.toString());
	});
	fctPanel.attachOnSelect((codeEditorFunction) => {
		this.onSelectConsumer(codeEditorFunction.toString());
	});
	this.addPanel(fctPanel);
	this.m_panelsLayout.addItem(fctPanel.getView());
};
oFF.OuCalcFunctionsView.prototype.addOnSelectFormulaItemConsumer = function(consumer)
{
	return this.m_onSelectFormulaItemConsumers.addConsumer(consumer);
};
oFF.OuCalcFunctionsView.prototype.buildCategoryListPanel = function()
{
	let panelItems = oFF.XStream.of(this.m_formulaItems.getFunctions()).map((func) => {
		return oFF.OuCalcPanelItem.createWithCategory(func.getSyntax(), func.getDisplayName(), this.getCategoryI18n(func.getCategory().getName()));
	}).collect(oFF.XStreamCollector.toList());
	let fctPanel = oFF.OuCalcPanelCategorizedListWidget.createExt(panelItems, true);
	this.addFunctionsPanel(fctPanel);
};
oFF.OuCalcFunctionsView.prototype.buildUI = function()
{
	this.buildCategoryListPanel();
};
oFF.OuCalcFunctionsView.prototype.destroyView = function()
{
	this.m_formulaItems = null;
	this.m_onSelectFormulaItemConsumers.clear();
	this.m_onSelectFormulaItemConsumers = oFF.XObjectExt.release(this.m_onSelectFormulaItemConsumers);
	oFF.OuCalcFormulaElementListContentView.prototype.destroyView.call( this );
};
oFF.OuCalcFunctionsView.prototype.getCategoryI18n = function(categoryName)
{
	return this.getLocalization().getText(oFF.XStringUtils.concatenate3(oFF.OuCalcFormulaEditorI18n.FE_FUNCTIONS, "_", categoryName));
};

oFF.OuCalcObjectsView = function() {};
oFF.OuCalcObjectsView.prototype = new oFF.OuCalcFormulaElementListContentView();
oFF.OuCalcObjectsView.prototype._ff_c = "OuCalcObjectsView";

oFF.OuCalcObjectsView.HIERARCHY_DEBOUNCE_SEARCH_MS = 350;
oFF.OuCalcObjectsView.create = function(datasource, feConfiguration, enableModelPrefix)
{
	let instance = new oFF.OuCalcObjectsView();
	instance.setupInternal(true);
	instance.m_datasource = oFF.XObjectExt.assertNotNull(datasource);
	instance.m_feConfiguration = oFF.XObjectExt.assertNotNull(feConfiguration);
	instance.m_onDisplayTypeChanged = oFF.XConsumerCollection.create();
	instance.m_displayType = oFF.QueryPresentationUtils.DESCRIPTION;
	instance.m_enableModelPrefix = enableModelPrefix;
	return instance;
};
oFF.OuCalcObjectsView.prototype.m_datasource = null;
oFF.OuCalcObjectsView.prototype.m_dimensionsPanelItems = null;
oFF.OuCalcObjectsView.prototype.m_displayType = null;
oFF.OuCalcObjectsView.prototype.m_displayTypeWidget = null;
oFF.OuCalcObjectsView.prototype.m_enableModelPrefix = false;
oFF.OuCalcObjectsView.prototype.m_feConfiguration = null;
oFF.OuCalcObjectsView.prototype.m_measuresPanelItems = null;
oFF.OuCalcObjectsView.prototype.m_onDisplayTypeChanged = null;
oFF.OuCalcObjectsView.prototype.addOnDisplayOptionPressedConsumer = function(consumer)
{
	return this.m_onDisplayTypeChanged.addConsumer(consumer);
};
oFF.OuCalcObjectsView.prototype.areFlatPanels = function(panelItemList)
{
	return oFF.XStream.of(panelItemList).allMatch((panelItem) => {
		return !panelItem.getParentId().isPresent();
	});
};
oFF.OuCalcObjectsView.prototype.buildUI = function()
{
	this.m_displayTypeWidget = oFF.OuCalcDisplayTypeWidget.create();
	this.m_displayTypeWidget.setOnDisplayTypeChanged((displayType) => {
		this.m_onDisplayTypeChanged.accept(displayType);
	});
	this.m_displayTypeWidget.renderView(this.getGenesis());
	this.m_header.addItem(this.m_displayTypeWidget.getView());
	let measuresPanel = this.createPanel(this.m_feConfiguration.getStructureName(), this.m_measuresPanelItems, false);
	this.m_panelsLayout.addItem(measuresPanel);
	if (this.m_feConfiguration.dimensionsSupported())
	{
		let dimensionsPanel = this.createPanel(this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FE_DIMENSIONS), this.m_dimensionsPanelItems, false);
		this.m_panelsLayout.addItem(dimensionsPanel);
	}
};
oFF.OuCalcObjectsView.prototype.createPanel = function(panelName, panelItems, isExpandable)
{
	oFF.XObjectExt.assertNotNull(panelItems);
	oFF.XCollectionUtils.forEach(panelItems, (item) => {
		oFF.XObjectExt.assertNotNull(item);
	});
	if (oFF.XStringUtils.isNullOrEmpty(panelName))
	{
		throw oFF.XException.createIllegalStateException("Panel name must not be null or empty string");
	}
	let panelWidget = this.createPanelWidget(panelName, panelItems, isExpandable);
	panelWidget.renderView(this.getGenesis());
	panelWidget.attachOnSelect((memberName) => {
		this.onSelectConsumer(memberName.toString());
	});
	this.addPanel(panelWidget);
	return panelWidget.getView();
};
oFF.OuCalcObjectsView.prototype.createPanelWidget = function(panelName, panelItems, isExpandable)
{
	return this.panelsHierarchicalStructure(panelItems) ? oFF.OuCalcPanelHierarchyWidget.create(panelName, panelItems, isExpandable) : oFF.OuCalcPanelListWidget.create(panelName, panelItems, isExpandable);
};
oFF.OuCalcObjectsView.prototype.destroyView = function()
{
	this.m_datasource = null;
	oFF.XCollectionUtils.releaseEntriesFromCollection(this.m_measuresPanelItems);
	this.m_measuresPanelItems.clear();
	this.m_measuresPanelItems = oFF.XObjectExt.release(this.m_measuresPanelItems);
	oFF.XCollectionUtils.releaseEntriesFromCollection(this.m_dimensionsPanelItems);
	this.m_dimensionsPanelItems.clear();
	this.m_dimensionsPanelItems = oFF.XObjectExt.release(this.m_dimensionsPanelItems);
	oFF.OuCalcFormulaElementListContentView.prototype.destroyView.call( this );
};
oFF.OuCalcObjectsView.prototype.getDimensionDisabledTooltip = function(dimension)
{
	if (dimension.isVirtual())
	{
		return oFF.XLocalizationCenter.getCenter().getText(oFF.OuCalcFormulaEditorI18n.FE_DIMENSION_VIRTUAL_DISABLE);
	}
	if (!oFF.FeFeatureToggle.isActive(oFF.FeFeatureToggle.DATE_DIMENSIONS))
	{
		let parentDimension = this.m_datasource.getParentDimension(dimension);
		if (dimension.isDateDimension() || parentDimension.isPresent() && parentDimension.get().isDateDimension())
		{
			return oFF.XLocalizationCenter.getCenter().getText(oFF.OuCalcFormulaEditorI18n.FE_DIMENSION_DATE_DISABLE);
		}
	}
	return null;
};
oFF.OuCalcObjectsView.prototype.getMeasureId = function(measure)
{
	if (this.m_feConfiguration.hideTechnicalKeys() && !measure.hasAlias())
	{
		return this.getLocalization().getText(oFF.OlapUiCommonI18n.COMMON_MEMBER_WITHOUT_ID_TITLE);
	}
	return measure.getAlias();
};
oFF.OuCalcObjectsView.prototype.panelsHierarchicalStructure = function(panelItems)
{
	return oFF.XStream.of(panelItems).anyMatch((panelItem) => {
		return panelItem.isEnabled() && panelItem.getParentId().isPresent();
	});
};
oFF.OuCalcObjectsView.prototype.setDisplayType = function(displayType)
{
	oFF.XObjectExt.assertNotNull(displayType);
	this.m_displayType = displayType;
	this.updateObjectsViews();
	this.m_displayTypeWidget.setDisplayType(displayType);
};
oFF.OuCalcObjectsView.prototype.setupView = function()
{
	let panelItemComparator = oFF.XComparatorLambda.create((first, second) => {
		let firstText = oFF.XString.toLowerCase(first.getDisplayText(this.m_displayType));
		let secondText = oFF.XString.toLowerCase(second.getDisplayText(this.m_displayType));
		return oFF.XIntegerValue.create(oFF.XString.compare(firstText, secondText));
	});
	let measures = this.m_datasource.getAllVisibleMeasures();
	let disabledMeasTooltip = oFF.XLocalizationCenter.getCenter().getText(oFF.OuCalcFormulaEditorI18n.FE_MEASURE_DATE_DISABLE);
	this.m_measuresPanelItems = oFF.XStream.of(measures).map((m) => {
		let enabled = !m.getValueType().isDateLike();
		return oFF.OuCalcPanelItem.createExt(m.getAlias(), this.getMeasureId(m), m.getField(this.m_enableModelPrefix), m.getDescription(), enabled, this.m_feConfiguration.getStructureName(), enabled ? null : disabledMeasTooltip, m.getParentId().isPresent() ? m.getParentId().get() : null);
	}).collect(oFF.XStreamCollector.toList());
	if (this.areFlatPanels(this.m_measuresPanelItems))
	{
		this.m_measuresPanelItems.sortByComparator(panelItemComparator);
	}
	else
	{
		this.m_debouncingSearchMs = oFF.OuCalcObjectsView.HIERARCHY_DEBOUNCE_SEARCH_MS;
	}
	if (this.m_feConfiguration.dimensionsSupported())
	{
		this.m_dimensionsPanelItems = oFF.XCollectionUtils.map(this.m_datasource.getAllDimensions(), (d) => {
			let itemName = d.getAlias();
			let itemDesc = d.getDescription();
			if (d.getSelectedProperty().isPresent())
			{
				itemName = d.getSelectedProperty().get().getId();
				itemDesc = d.getSelectedProperty().get().getDescription();
			}
			let uniqueItemKey = d.generateUniqueKey();
			let disabledDimTooltip = this.getDimensionDisabledTooltip(d);
			return oFF.OuCalcPanelItem.createExt(uniqueItemKey, itemName, d.getField(this.m_enableModelPrefix), itemDesc, oFF.isNull(disabledDimTooltip), null, disabledDimTooltip, d.getParentId().orElse(null));
		});
		this.m_dimensionsPanelItems.sortByComparator(panelItemComparator);
		if (!this.areFlatPanels(this.m_dimensionsPanelItems))
		{
			this.m_debouncingSearchMs = oFF.OuCalcObjectsView.HIERARCHY_DEBOUNCE_SEARCH_MS;
		}
	}
};
oFF.OuCalcObjectsView.prototype.updateObjectsViews = function()
{
	oFF.XStream.of(this.m_panelWidgetList).forEach((panelWidget) => {
		panelWidget.setDisplayOption(this.m_displayType);
	});
};

oFF.OuCalcOperatorsView = function() {};
oFF.OuCalcOperatorsView.prototype = new oFF.OuCalcFormulaElementListContentView();
oFF.OuCalcOperatorsView.prototype._ff_c = "OuCalcOperatorsView";

oFF.OuCalcOperatorsView.create = function(formulaItems)
{
	let instance = new oFF.OuCalcOperatorsView();
	instance.setupInternal(false);
	instance.m_formulaItems = oFF.XObjectExt.assertNotNull(formulaItems);
	return instance;
};
oFF.OuCalcOperatorsView.prototype.m_formulaItems = null;
oFF.OuCalcOperatorsView.prototype.addPanelToLayout = function(panel)
{
	panel.renderView(this.getGenesis());
	panel.attachOnSelect((codeEditorOperator) => {
		this.onSelectConsumer(codeEditorOperator.toString());
	});
	this.m_panelsLayout.addItem(panel.getView());
};
oFF.OuCalcOperatorsView.prototype.buildList = function()
{
	let operators = this.m_formulaItems.getOperators();
	let mathPanelName = this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FE_OPERATORS);
	let condPanelName = this.getLocalization().getText(oFF.OuCalcFormulaEditorI18n.FE_CONDITIONS);
	let list = oFF.XList.create();
	oFF.XStream.of(operators).forEach((op) => {
		if (op.getCategory().isTypeOf(oFF.FeFormulaItemCategory.MATHEMATICAL))
		{
			list.add(oFF.OuCalcPanelItem.createWithCategory(op.getSyntax(), op.getDisplayName(), mathPanelName));
		}
		else if (op.getCategory().isTypeOf(oFF.FeFormulaItemCategory.CONDITIONAL))
		{
			list.add(oFF.OuCalcPanelItem.createWithCategory(op.getSyntax(), op.getDisplayName(), condPanelName));
		}
	});
	let listPanel = oFF.OuCalcPanelCategorizedListWidget.createExt(list, true);
	this.addPanelToLayout(listPanel);
};
oFF.OuCalcOperatorsView.prototype.buildUI = function()
{
	this.buildList();
};
oFF.OuCalcOperatorsView.prototype.destroyView = function()
{
	this.m_formulaItems = null;
	oFF.OuCalcFormulaElementListContentView.prototype.destroyView.call( this );
};

oFF.OuCalcVariablesView = function() {};
oFF.OuCalcVariablesView.prototype = new oFF.OuCalcFormulaElementListContentView();
oFF.OuCalcVariablesView.prototype._ff_c = "OuCalcVariablesView";

oFF.OuCalcVariablesView.create = function(variableManager)
{
	oFF.XObjectExt.assertNotNull(variableManager);
	let instance = new oFF.OuCalcVariablesView();
	instance.setupInternal(false);
	instance.updateOrCreateVariablePanelItems(variableManager);
	instance.m_variableManager = variableManager;
	instance.m_displayType = oFF.QueryPresentationUtils.DESCRIPTION;
	instance.m_onDisplayTypeChanged = oFF.XConsumerCollection.create();
	instance.m_onVariablesUpdated = oFF.XProcedureCollection.create();
	return instance;
};
oFF.OuCalcVariablesView.prototype.m_displayType = null;
oFF.OuCalcVariablesView.prototype.m_displayTypeWidget = null;
oFF.OuCalcVariablesView.prototype.m_onDisplayTypeChanged = null;
oFF.OuCalcVariablesView.prototype.m_onVariablesUpdated = null;
oFF.OuCalcVariablesView.prototype.m_variableManager = null;
oFF.OuCalcVariablesView.prototype.m_variablePanelItems = null;
oFF.OuCalcVariablesView.prototype.m_variablesWidget = null;
oFF.OuCalcVariablesView.prototype.addOnDisplayOptionPressedConsumer = function(consumer)
{
	return this.m_onDisplayTypeChanged.addConsumer(consumer);
};
oFF.OuCalcVariablesView.prototype.addOnVariablesUpdatedProcedure = function(procedure)
{
	return this.m_onVariablesUpdated.addProcedure(procedure);
};
oFF.OuCalcVariablesView.prototype.buildUI = function()
{
	this.renderVariablesWidget();
	let newVariableText = "New...";
	let newVariable = this.m_header.addNewItemOfType(oFF.UiType.BUTTON);
	newVariable.setText(newVariableText);
	newVariable.setTooltip(newVariableText);
	newVariable.addCssClass("ffFeNewVariableButton");
	newVariable.registerOnPress(oFF.UiLambdaPressListener.create((event) => {
		this.m_variableManager.openVariableCreateDialog(() => {
			this.refreshVariables();
		});
	}));
	this.m_displayTypeWidget = oFF.OuCalcDisplayTypeWidget.create();
	this.m_displayTypeWidget.setOnDisplayTypeChanged((displayType) => {
		this.m_onDisplayTypeChanged.accept(displayType);
	});
	this.m_displayTypeWidget.renderView(this.getGenesis());
	this.m_header.addItem(this.m_displayTypeWidget.getView());
};
oFF.OuCalcVariablesView.prototype.destroyView = function()
{
	this.m_variablePanelItems = oFF.XObjectExt.release(this.m_variablePanelItems);
	this.m_variablesWidget = oFF.XObjectExt.release(this.m_variablesWidget);
	this.m_displayType = oFF.XObjectExt.release(this.m_displayType);
	this.m_onDisplayTypeChanged = oFF.XObjectExt.release(this.m_onDisplayTypeChanged);
	this.m_onVariablesUpdated = oFF.XObjectExt.release(this.m_onVariablesUpdated);
	this.m_variableManager = null;
	oFF.OuCalcFormulaElementListContentView.prototype.destroyView.call( this );
};
oFF.OuCalcVariablesView.prototype.refreshVariables = function()
{
	this.updateOrCreateVariablePanelItems(this.m_variableManager);
	this.m_panelsLayout.removeItem(this.m_variablesWidget.getView());
	this.renderVariablesWidget();
	this.m_onVariablesUpdated.execute();
};
oFF.OuCalcVariablesView.prototype.renderVariablesWidget = function()
{
	this.m_variablesWidget = oFF.OuCalcPanelVariablesWidget.createVariablesWidget(this.m_variablePanelItems, (panelItemToEdit) => {
		let variableToEdit = this.m_variableManager.getVariableByAlias(panelItemToEdit.getId());
		if (variableToEdit.isPresent())
		{
			this.m_variableManager.openVariableUpdateDialog(variableToEdit.get(), () => {
				this.refreshVariables();
			});
		}
	}, (panelItemToDelete) => {
		let variableToDelete = this.m_variableManager.getVariableByAlias(panelItemToDelete.getId());
		if (variableToDelete.isPresent())
		{
			this.m_variableManager.deleteVariable(variableToDelete.get(), () => {
				this.refreshVariables();
			});
		}
	});
	this.m_variablesWidget.renderView(this.getGenesis());
	this.m_variablesWidget.attachOnSelect((variable) => {
		this.onSelectConsumer(variable.toString());
	});
	this.m_variablesWidget.setDisplayOption(this.m_displayType);
	this.m_panelsLayout.addItem(this.m_variablesWidget.getView());
};
oFF.OuCalcVariablesView.prototype.setDisplayType = function(displayType)
{
	oFF.XObjectExt.assertNotNull(displayType);
	this.m_displayType = displayType;
	this.m_variablesWidget.setDisplayOption(displayType);
	this.m_displayTypeWidget.setDisplayType(displayType);
};
oFF.OuCalcVariablesView.prototype.updateOrCreateVariablePanelItems = function(variableManager)
{
	this.m_variablePanelItems = oFF.XCollectionUtils.map(variableManager.getVariables(), (v) => {
		return oFF.OuCalcPanelItem.createExt(v.getId(), v.getAlias(), v.getField(false), v.getDescription(), true, null, v.getDescription(), null);
	});
};

oFF.OuAbstractCalcExpandablePanelWidget = function() {};
oFF.OuAbstractCalcExpandablePanelWidget.prototype = new oFF.OuAbstractCalcPanelWidget();
oFF.OuAbstractCalcExpandablePanelWidget.prototype._ff_c = "OuAbstractCalcExpandablePanelWidget";

oFF.OuAbstractCalcExpandablePanelWidget.prototype.m_isExpandable = false;
oFF.OuAbstractCalcExpandablePanelWidget.prototype.m_name = null;
oFF.OuAbstractCalcExpandablePanelWidget.prototype.m_panel = null;
oFF.OuAbstractCalcExpandablePanelWidget.prototype.destroyWidget = function()
{
	this.m_panel = null;
	oFF.OuAbstractCalcPanelWidget.prototype.destroyWidget.call( this );
};
oFF.OuAbstractCalcExpandablePanelWidget.prototype.getWidgetControl = function(genesis)
{
	this.m_panel = genesis.newControl(oFF.UiType.PANEL);
	return this.m_panel;
};
oFF.OuAbstractCalcExpandablePanelWidget.prototype.layoutWidget = function(widgetControl)
{
	this.m_panel.setExpanded(true);
	this.m_panel.setExpandable(this.m_isExpandable);
	this.m_panel.setText(this.m_name);
	this.m_panel.setTooltip(this.m_name);
	this.m_panel.useMaxWidth();
	this.m_panel.removeAttribute(oFF.UtUi5AttributeConstants.FAST_NAV_GROUP);
	this.m_panel.addCssClass("ffFePanel");
	this.m_panel.addCssClass(oFF.XStringUtils.concatenate2("ffFePanel-", oFF.XString.replace(this.m_name, " ", "")));
};
oFF.OuAbstractCalcExpandablePanelWidget.prototype.setupInternal = function(name, panelItems, isExpandable, hideIfEmpty)
{
	this.setupInternalControl(panelItems, hideIfEmpty);
	if (oFF.XStringUtils.isNullOrEmpty(name))
	{
		throw oFF.XException.createIllegalArgumentException("Name must not be null or empty string!");
	}
	this.m_name = name;
	this.m_isExpandable = isExpandable;
};

oFF.OuCalcPanelCategorizedListWidget = function() {};
oFF.OuCalcPanelCategorizedListWidget.prototype = new oFF.OuAbstractCalcPanelWidget();
oFF.OuCalcPanelCategorizedListWidget.prototype._ff_c = "OuCalcPanelCategorizedListWidget";

oFF.OuCalcPanelCategorizedListWidget.create = function(panelItems)
{
	return oFF.OuCalcPanelCategorizedListWidget.createExt(panelItems, false);
};
oFF.OuCalcPanelCategorizedListWidget.createExt = function(panelItems, hideIfEmpty)
{
	let instance = new oFF.OuCalcPanelCategorizedListWidget();
	instance.setupInternalControl(panelItems, hideIfEmpty);
	return instance;
};
oFF.OuCalcPanelCategorizedListWidget.prototype.m_groupHeaderListItemsByCategory = null;
oFF.OuCalcPanelCategorizedListWidget.prototype.m_list = null;
oFF.OuCalcPanelCategorizedListWidget.prototype.m_panelItemByCategory = null;
oFF.OuCalcPanelCategorizedListWidget.prototype.m_panelItemsNoCategory = null;
oFF.OuCalcPanelCategorizedListWidget.prototype.addPanelItems = function(panelItems)
{
	oFF.XCollectionUtils.forEach(panelItems, (panelItem) => {
		if (panelItem.isEnabled())
		{
			this.m_list.addItem(this.createListItem(panelItem));
		}
	});
};
oFF.OuCalcPanelCategorizedListWidget.prototype.destroyWidget = function()
{
	this.m_panelItemByCategory.clear();
	this.m_panelItemByCategory = oFF.XObjectExt.release(this.m_panelItemByCategory);
	this.m_panelItemsNoCategory.clear();
	this.m_panelItemsNoCategory = oFF.XObjectExt.release(this.m_panelItemsNoCategory);
	this.m_groupHeaderListItemsByCategory.clear();
	this.m_groupHeaderListItemsByCategory = oFF.XObjectExt.release(this.m_groupHeaderListItemsByCategory);
	this.m_list = oFF.XObjectExt.release(this.m_list);
	oFF.OuAbstractCalcPanelWidget.prototype.destroyWidget.call( this );
};
oFF.OuCalcPanelCategorizedListWidget.prototype.filterItems = function(text)
{
	let hasVisibleItems = oFF.XBooleanValue.create(false);
	let visibleCategorySet = oFF.XHashSetOfString.create();
	oFF.XStream.of(this.getListItems()).forEach((listItem) => {
		let calcPanelItem = listItem.getCustomObject();
		let itemVisible = this.isPanelItemVisible(calcPanelItem, text);
		hasVisibleItems.setBoolean(itemVisible || hasVisibleItems.getBoolean());
		listItem.setVisible(itemVisible);
		if (itemVisible && calcPanelItem.getCategory() !== null)
		{
			visibleCategorySet.add(calcPanelItem.getCategory());
		}
	});
	oFF.XStream.of(this.m_groupHeaderListItemsByCategory.getValuesAsReadOnlyList()).forEach((groupHeaderItem) => {
		groupHeaderItem.setVisible(visibleCategorySet.contains(groupHeaderItem.getText()));
	});
	if (this.m_hideIfEmpty)
	{
		this.setVisible(hasVisibleItems.getBoolean());
	}
};
oFF.OuCalcPanelCategorizedListWidget.prototype.getListItems = function()
{
	return oFF.XStream.of(this.m_list.getItems()).filter((item) => {
		return this.isListItem(item);
	}).collect(oFF.XStreamCollector.toList());
};
oFF.OuCalcPanelCategorizedListWidget.prototype.getWidgetControl = function(genesis)
{
	this.m_list = genesis.newControl(oFF.UiType.LIST);
	this.m_list.addCssClass("ffFePanel");
	return this.m_list;
};
oFF.OuCalcPanelCategorizedListWidget.prototype.hasVisibleItems = function()
{
	return oFF.XStream.of(this.getListItems()).anyMatch((item) => {
		return item.isVisible();
	});
};
oFF.OuCalcPanelCategorizedListWidget.prototype.isListItem = function(item)
{
	return item.getUiType().isTypeOf(oFF.UiType.CUSTOM_LIST_ITEM);
};
oFF.OuCalcPanelCategorizedListWidget.prototype.layoutWidget = function(widgetControl)
{
	this.m_list.addCssClass("ffFeFlatListPanel");
	this.addPanelItems(this.m_panelItemsNoCategory);
	let categories = oFF.XList.create();
	categories.addAll(this.m_panelItemByCategory.getKeysAsReadOnlyList());
	categories.sortByDirection(oFF.XSortDirection.ASCENDING);
	for (let i = 0; i < categories.size(); i++)
	{
		let groupHeaderListItem = this.getGenesis().newControl(oFF.UiType.GROUP_HEADER_LIST_ITEM);
		let categoryName = categories.get(i);
		groupHeaderListItem.setText(categoryName);
		groupHeaderListItem.setTooltip(categoryName);
		this.m_groupHeaderListItemsByCategory.put(categoryName, groupHeaderListItem);
		this.m_list.addItem(groupHeaderListItem);
		let panelItems = this.m_panelItemByCategory.getByKey(categoryName);
		panelItems.sortByComparator(oFF.XComparatorLambda.create((first, second) => {
			return oFF.FeFunctionComparator.compareFunctionName(first.getDisplayName(), second.getDisplayName());
		}));
		this.addPanelItems(panelItems);
	}
};
oFF.OuCalcPanelCategorizedListWidget.prototype.setupWidget = function()
{
	this.m_panelItemByCategory = oFF.XHashMapByString.create();
	this.m_panelItemsNoCategory = oFF.XList.create();
	this.m_groupHeaderListItemsByCategory = oFF.XHashMapByString.create();
	oFF.XStream.of(this.m_panelItems).forEach((panelItem) => {
		if (panelItem.getCategory() === null)
		{
			this.m_panelItemsNoCategory.add(panelItem);
		}
		else
		{
			let categoryName = panelItem.getCategory();
			let panelByCategoryList;
			if (this.m_panelItemByCategory.containsKey(categoryName))
			{
				panelByCategoryList = this.m_panelItemByCategory.getByKey(categoryName);
			}
			else
			{
				panelByCategoryList = oFF.XList.create();
				this.m_panelItemByCategory.put(categoryName, panelByCategoryList);
			}
			panelByCategoryList.add(panelItem);
		}
	});
};
oFF.OuCalcPanelCategorizedListWidget.prototype.updateListItemsText = function()
{
	for (let i = 0; i < this.m_list.getNumberOfItems(); i++)
	{
		let listItem = this.m_list.getItem(i);
		this.updateItemLabel(listItem, listItem.getCustomObject());
	}
};

oFF.OuLambdaSyncAction = function() {};
oFF.OuLambdaSyncAction.prototype = new oFF.SyncAction();
oFF.OuLambdaSyncAction.prototype._ff_c = "OuLambdaSyncAction";

oFF.OuLambdaSyncAction.create = function(context, listener, supplier, delayInMillis)
{
	let instance = new oFF.OuLambdaSyncAction();
	instance.setupAction(oFF.SyncType.NON_BLOCKING, listener, null, context);
	instance.m_resultSupplier = supplier;
	instance.m_delayInMillis = delayInMillis;
	return instance;
};
oFF.OuLambdaSyncAction.prototype.m_delayInMillis = 0;
oFF.OuLambdaSyncAction.prototype.m_resultSupplier = null;
oFF.OuLambdaSyncAction.prototype.m_timerId = null;
oFF.OuLambdaSyncAction.prototype.cancelSynchronization = function()
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_timerId))
	{
		oFF.XTimeout.clear(this.m_timerId);
		this.m_timerId = null;
		this.addError(0, "Canceled");
		oFF.SyncAction.prototype.cancelSynchronization.call( this );
	}
};
oFF.OuLambdaSyncAction.prototype.processSynchronization = function(syncType)
{
	this.m_timerId = oFF.XTimeout.timeout(this.m_delayInMillis, () => {
		try
		{
			let data = this.m_resultSupplier();
			if (this.isSyncCanceled())
			{
				this.addError(2, "Action has been canceled");
			}
			else
			{
				this.setData(data);
			}
			this.m_timerId = null;
			this.endSync();
		}
		catch (t)
		{
			this.addError(1, oFF.XException.getStackTrace(t, 0));
		}
	});
	return syncType !== oFF.SyncType.BLOCKING;
};
oFF.OuLambdaSyncAction.prototype.releaseObjectInternal = function()
{
	this.m_resultSupplier = null;
	this.m_timerId = null;
};

oFF.VdOrcaLevel = function() {};
oFF.VdOrcaLevel.prototype = new oFF.XConstantWithParent();
oFF.VdOrcaLevel.prototype._ff_c = "VdOrcaLevel";

oFF.VdOrcaLevel.CHART = null;
oFF.VdOrcaLevel.DEFAULT = null;
oFF.VdOrcaLevel.EXPLORER = null;
oFF.VdOrcaLevel.FILTER = null;
oFF.VdOrcaLevel.TABLE = null;
oFF.VdOrcaLevel.WIDGET = null;
oFF.VdOrcaLevel.s_lookup = null;
oFF.VdOrcaLevel.create = function(name, parent)
{
	let level = new oFF.VdOrcaLevel();
	level.setupExt(name, parent);
	oFF.VdOrcaLevel.s_lookup.put(name, level);
	return level;
};
oFF.VdOrcaLevel.lookup = function(name)
{
	return oFF.VdOrcaLevel.s_lookup.getByKey(name);
};
oFF.VdOrcaLevel.staticSetup = function()
{
	oFF.VdOrcaLevel.s_lookup = oFF.XHashMapByString.create();
	oFF.VdOrcaLevel.DEFAULT = oFF.VdOrcaLevel.create("default", null);
	oFF.VdOrcaLevel.WIDGET = oFF.VdOrcaLevel.create("widget", null);
	oFF.VdOrcaLevel.CHART = oFF.VdOrcaLevel.create("chart", oFF.VdOrcaLevel.WIDGET);
	oFF.VdOrcaLevel.TABLE = oFF.VdOrcaLevel.create("table", oFF.VdOrcaLevel.WIDGET);
	oFF.VdOrcaLevel.EXPLORER = oFF.VdOrcaLevel.create("explorer", oFF.VdOrcaLevel.WIDGET);
	oFF.VdOrcaLevel.FILTER = oFF.VdOrcaLevel.create("filter", null);
};

oFF.OuDummyView = function() {};
oFF.OuDummyView.prototype = new oFF.DfOuOlapView();
oFF.OuDummyView.prototype._ff_c = "OuDummyView";

oFF.OuDummyView.create = function(genesis, queryManager)
{
	let newView = new oFF.OuDummyView();
	newView.initOlapView(genesis, queryManager);
	return newView;
};
oFF.OuDummyView.prototype.buildViewUi = function(genesis)
{
	let dummyBtn = genesis.newControl(oFF.UiType.BUTTON);
	dummyBtn.setText("Dummy button");
	genesis.setRoot(dummyBtn);
};
oFF.OuDummyView.prototype.setupOlapView = function(queryManager) {};

oFF.OuCalcPanelHierarchyWidget = function() {};
oFF.OuCalcPanelHierarchyWidget.prototype = new oFF.OuAbstractCalcExpandablePanelWidget();
oFF.OuCalcPanelHierarchyWidget.prototype._ff_c = "OuCalcPanelHierarchyWidget";

oFF.OuCalcPanelHierarchyWidget.create = function(name, panelItems, isExpandable)
{
	return oFF.OuCalcPanelHierarchyWidget.createExt(name, panelItems, isExpandable, true);
};
oFF.OuCalcPanelHierarchyWidget.createExt = function(name, panelItems, isExpandable, hideIfEmpty)
{
	let instance = new oFF.OuCalcPanelHierarchyWidget();
	instance.setupInternal(name, panelItems, isExpandable, hideIfEmpty);
	return instance;
};
oFF.OuCalcPanelHierarchyWidget.prototype.m_treeWidget = null;
oFF.OuCalcPanelHierarchyWidget.prototype.addChildToCustomTree = function(treePanelItem, customTreeItemParent)
{
	let customTreeItemToAdd = oFF.OuCalcCustomTreeWidgetItem.create(treePanelItem.getUniqueKey(), this.createListItemContent(treePanelItem), treePanelItem.isEnabled(), treePanelItem);
	customTreeItemParent.addItem(customTreeItemToAdd);
	oFF.XStream.of(treePanelItem.getChildren()).forEach((treePanelItemChild) => {
		this.addChildToCustomTree(treePanelItemChild, customTreeItemToAdd);
	});
};
oFF.OuCalcPanelHierarchyWidget.prototype.createHierarchyPanelItem = function()
{
	let root = oFF.OuCalcTreePanelItem.createRoot();
	let treePanelItemIdMap = oFF.XHashMapByString.create();
	oFF.XCollectionUtils.forEach(this.m_panelItems, (panelItem) => {
		treePanelItemIdMap.put(panelItem.getUniqueKey(), oFF.OuCalcTreePanelItem.createWithItem(panelItem));
	});
	oFF.XCollectionUtils.forEach(this.m_panelItems, (panelItemToTree) => {
		let panelItemHToAdd = treePanelItemIdMap.getByKey(panelItemToTree.getUniqueKey());
		if (panelItemHToAdd.getParentId().isPresent())
		{
			if (treePanelItemIdMap.containsKey(panelItemHToAdd.getParentId().get()))
			{
				treePanelItemIdMap.getByKey(panelItemHToAdd.getParentId().get()).addChild(panelItemHToAdd);
			}
		}
		else
		{
			root.addChild(panelItemHToAdd);
		}
	});
	while (true)
	{
		let disabledPanelItemLeaves = oFF.XStream.of(treePanelItemIdMap.getValuesAsReadOnlyList()).filter((ph) => {
			return ph.isLeaf() && !ph.isEnabled();
		}).collect(oFF.XStreamCollector.toList());
		if (disabledPanelItemLeaves.size() === 0)
		{
			break;
		}
		oFF.XStream.of(disabledPanelItemLeaves).forEach((disabledLeaf) => {
			if (disabledLeaf.getParent().isPresent())
			{
				disabledLeaf.getParent().get().removeChild(disabledLeaf);
			}
			else
			{
				root.removeChild(disabledLeaf);
			}
			treePanelItemIdMap.remove(disabledLeaf.getUniqueKey());
		});
	}
	return root;
};
oFF.OuCalcPanelHierarchyWidget.prototype.destroyWidget = function()
{
	if (oFF.notNull(this.m_treeWidget))
	{
		this.m_treeWidget = oFF.XObjectExt.release(this.m_treeWidget);
	}
	oFF.OuAbstractCalcExpandablePanelWidget.prototype.destroyWidget.call( this );
};
oFF.OuCalcPanelHierarchyWidget.prototype.filterItems = function(text)
{
	this.m_treeWidget.filterItems((item) => {
		let calcPanelItem = item.getCustomObject();
		let isVisible = this.isPanelItemVisible(calcPanelItem, text);
		if (isVisible)
		{
			item.getParent().ifPresent((parent) => {
				parent.setExpanded(true);
			});
		}
		return isVisible;
	});
	if (this.m_hideIfEmpty)
	{
		this.setVisible(this.hasVisibleItems());
	}
};
oFF.OuCalcPanelHierarchyWidget.prototype.getListItemLabel = function(control)
{
	return control.getItem(0);
};
oFF.OuCalcPanelHierarchyWidget.prototype.hasVisibleItems = function()
{
	return this.m_treeWidget.hasVisibleItems();
};
oFF.OuCalcPanelHierarchyWidget.prototype.layoutWidget = function(widgetControl)
{
	oFF.OuAbstractCalcExpandablePanelWidget.prototype.layoutWidget.call( this , widgetControl);
	this.m_panel.addCssClass("ffFeHierarchyPanel");
	this.m_treeWidget.renderView(this.getGenesis());
	this.m_panel.setContent(this.m_treeWidget.getView());
	this.m_treeWidget.addOnItemClick((item) => {
		this.fireOnChange(item.getCustomObject());
	});
	this.m_treeWidget.addOnItemDoubleClick((item) => {
		this.fireOnSelect(item.getCustomObject());
	});
};
oFF.OuCalcPanelHierarchyWidget.prototype.setupWidget = function()
{
	oFF.OuAbstractCalcExpandablePanelWidget.prototype.setupWidget.call( this );
	this.m_treeWidget = oFF.OuCalcCustomTreeWidget.create();
	let treePanelItemRoot = this.createHierarchyPanelItem();
	oFF.XStream.of(treePanelItemRoot.getChildren()).forEach((rootPanel) => {
		this.addChildToCustomTree(rootPanel, this.m_treeWidget);
	});
	treePanelItemRoot.releaseObject();
};
oFF.OuCalcPanelHierarchyWidget.prototype.updateListItemsText = function()
{
	this.m_treeWidget.applyToItems((item) => {
		this.updateItemLabel(item.getContent(), item.getCustomObject());
	});
};

oFF.OuCalcPanelListWidget = function() {};
oFF.OuCalcPanelListWidget.prototype = new oFF.OuAbstractCalcExpandablePanelWidget();
oFF.OuCalcPanelListWidget.prototype._ff_c = "OuCalcPanelListWidget";

oFF.OuCalcPanelListWidget.create = function(name, panelItems, isExpandable)
{
	return oFF.OuCalcPanelListWidget.createExt(name, panelItems, isExpandable, true);
};
oFF.OuCalcPanelListWidget.createExt = function(name, panelItems, isExpandable, hideIfEmpty)
{
	let instance = new oFF.OuCalcPanelListWidget();
	instance.setupInternal(name, panelItems, isExpandable, hideIfEmpty);
	return instance;
};
oFF.OuCalcPanelListWidget.prototype.m_list = null;
oFF.OuCalcPanelListWidget.prototype.destroyWidget = function()
{
	this.m_list = oFF.XObjectExt.release(this.m_list);
	oFF.OuAbstractCalcExpandablePanelWidget.prototype.destroyWidget.call( this );
};
oFF.OuCalcPanelListWidget.prototype.filterItems = function(text)
{
	for (let i = 0; i < this.m_list.getNumberOfItems(); i++)
	{
		let calcPanelItem = this.m_list.getItem(i).getCustomObject();
		let itemVisible = this.isPanelItemVisible(calcPanelItem, text);
		this.m_list.getItem(i).setVisible(itemVisible);
	}
	if (this.m_hideIfEmpty)
	{
		this.setVisible(this.hasVisibleItems());
	}
};
oFF.OuCalcPanelListWidget.prototype.hasVisibleItems = function()
{
	return oFF.XStream.of(this.m_list.getItems()).anyMatch((item) => {
		return item.isVisible();
	});
};
oFF.OuCalcPanelListWidget.prototype.layoutWidget = function(widgetControl)
{
	oFF.OuAbstractCalcExpandablePanelWidget.prototype.layoutWidget.call( this , widgetControl);
	this.m_panel.addCssClass("ffFeFlatListPanel");
	this.m_list = this.m_panel.setNewContent(oFF.UiType.LIST);
	oFF.XCollectionUtils.forEach(this.m_panelItems, (item) => {
		if (item.isEnabled())
		{
			this.m_list.addItem(this.createListItem(item));
		}
	});
};
oFF.OuCalcPanelListWidget.prototype.updateListItemsText = function()
{
	for (let i = 0; i < this.m_list.getNumberOfItems(); i++)
	{
		let listItem = this.m_list.getItem(i);
		this.updateItemLabel(listItem, listItem.getCustomObject());
	}
};

oFF.OuCalcPanelVariablesWidget = function() {};
oFF.OuCalcPanelVariablesWidget.prototype = new oFF.OuCalcPanelCategorizedListWidget();
oFF.OuCalcPanelVariablesWidget.prototype._ff_c = "OuCalcPanelVariablesWidget";

oFF.OuCalcPanelVariablesWidget.createVariablesWidget = function(panelItems, onEdit, onDelete)
{
	let instance = new oFF.OuCalcPanelVariablesWidget();
	instance.m_onEdit = onEdit;
	instance.m_onDelete = onDelete;
	instance.setupInternalControl(panelItems.createListCopy(), true);
	return instance;
};
oFF.OuCalcPanelVariablesWidget.prototype.m_onDelete = null;
oFF.OuCalcPanelVariablesWidget.prototype.m_onEdit = null;
oFF.OuCalcPanelVariablesWidget.prototype.createListItemButtons = function(panelItem)
{
	let listItemButtonsLayout = oFF.OuCalcPanelCategorizedListWidget.prototype.createListItemButtons.call( this , panelItem);
	let deleteButton = listItemButtonsLayout.addNewItemOfType(oFF.UiType.BUTTON);
	deleteButton.setTooltip(oFF.XLocalizationCenter.getCenter().getText(oFF.XCommonI18n.DELETE));
	deleteButton.setIcon("delete");
	deleteButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
	deleteButton.addCssClass("ffFeItemDelete");
	deleteButton.registerOnPress(oFF.UiLambdaPressListener.create((pressEvent) => {
		this.m_onDelete(panelItem);
	}));
	let editButton = listItemButtonsLayout.addNewItemOfType(oFF.UiType.BUTTON);
	editButton.setTooltip(oFF.XLocalizationCenter.getCenter().getText(oFF.XCommonI18n.EDIT));
	editButton.setIcon("edit");
	editButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
	editButton.addCssClass("ffFeItemEdit");
	editButton.registerOnPress(oFF.UiLambdaPressListener.create((pressEvent) => {
		this.m_onEdit(panelItem);
	}));
	return listItemButtonsLayout;
};
oFF.OuCalcPanelVariablesWidget.prototype.destroyWidget = function()
{
	this.m_onEdit = null;
	this.m_onDelete = null;
	oFF.OuCalcPanelCategorizedListWidget.prototype.destroyWidget.call( this );
};

oFF.OuDataProviderActionListPlugin = function() {};
oFF.OuDataProviderActionListPlugin.prototype = new oFF.DfOuDataProviderComponentPlugin();
oFF.OuDataProviderActionListPlugin.prototype._ff_c = "OuDataProviderActionListPlugin";

oFF.OuDataProviderActionListPlugin.PLUGIN_NAME = "DataProviderActionList";
oFF.OuDataProviderActionListPlugin.prototype.m_view = null;
oFF.OuDataProviderActionListPlugin.prototype.buildDataProviderPluginUi = function(genesis)
{
	this.m_view = oFF.OuDataProviderActionListView.createView();
	this.m_view.renderView(genesis);
	genesis.setRoot(this.m_view.getView());
};
oFF.OuDataProviderActionListPlugin.prototype.destroyPlugin = function()
{
	this.m_view = oFF.XObjectExt.release(this.m_view);
	oFF.DfOuDataProviderComponentPlugin.prototype.destroyPlugin.call( this );
};
oFF.OuDataProviderActionListPlugin.prototype.getPluginCategory = function()
{
	return oFF.HuPluginCategory.OLAP;
};
oFF.OuDataProviderActionListPlugin.prototype.getPluginName = function()
{
	return oFF.OuDataProviderActionListPlugin.PLUGIN_NAME;
};
oFF.OuDataProviderActionListPlugin.prototype.onDataProviderModelChange = function(dataProvider, evt) {};
oFF.OuDataProviderActionListPlugin.prototype.onDataProviderReady = function(dataProvider)
{
	this.m_view.setDataProvider(dataProvider);
};
oFF.OuDataProviderActionListPlugin.prototype.onDataProviderReleased = function(dataProviderName) {};
oFF.OuDataProviderActionListPlugin.prototype.onDataProviderResultDataFetch = function(dataProvider, evt) {};
oFF.OuDataProviderActionListPlugin.prototype.onDataProviderVizChange = function(activeVizName, evt) {};

oFF.OuVisualizationCreator = function() {};
oFF.OuVisualizationCreator.prototype = new oFF.DfUiProgram();
oFF.OuVisualizationCreator.prototype._ff_c = "OuVisualizationCreator";

oFF.OuVisualizationCreator.BUTTON_CREATE = "VisualizationCreator_CreateButton";
oFF.OuVisualizationCreator.DEFAULT_PROGRAM_NAME = "VisualizationCreator";
oFF.OuVisualizationCreator.DROPDOWN_DATA_PROVIDER = "VisualizationCreator_DPDropdown";
oFF.OuVisualizationCreator.DROPDOWN_VIZ_TYPE = "VisualizationCreator_VizTypeDropdown";
oFF.OuVisualizationCreator.INPUT_VIZ_NAME = "VisualizationCreator_VizNameInput";
oFF.OuVisualizationCreator.PARAM_DATA_PROVIDER_NAME = "dataProviderName";
oFF.OuVisualizationCreator.PARAM_HIDE_DP = "hideDataProvider";
oFF.OuVisualizationCreator.createRunnerForContainerType = function(parentProcess, containerType)
{
	let tmpRunner = oFF.ProgramRunner.createRunner(parentProcess, oFF.OuVisualizationCreator.DEFAULT_PROGRAM_NAME);
	tmpRunner.setContainerType(containerType);
	return tmpRunner;
};
oFF.OuVisualizationCreator.prototype.m_addDPSharedStorageListenerId = null;
oFF.OuVisualizationCreator.prototype.m_changeDPPoolListenerId = null;
oFF.OuVisualizationCreator.prototype.m_createButton = null;
oFF.OuVisualizationCreator.prototype.m_dataProviderName = null;
oFF.OuVisualizationCreator.prototype.m_dpNameDropdown = null;
oFF.OuVisualizationCreator.prototype.m_form = null;
oFF.OuVisualizationCreator.prototype.m_hideDpDropdown = false;
oFF.OuVisualizationCreator.prototype.m_mainLayout = null;
oFF.OuVisualizationCreator.prototype.m_messagesLayout = null;
oFF.OuVisualizationCreator.prototype.m_removeDPSharedStorageListenerId = null;
oFF.OuVisualizationCreator.prototype.m_visualizationNameInput = null;
oFF.OuVisualizationCreator.prototype.m_visualizationTypeDropdown = null;
oFF.OuVisualizationCreator.prototype._buildLayoutUi = function()
{
	this.m_form = oFF.UiForm.create(this.getGenesis());
	let valueChangedConsumer = (key, value) => {
		this.m_createButton.setEnabled(this._isCreateAllowed());
	};
	this.m_dpNameDropdown = this.m_form.addDropdown(oFF.OuVisualizationCreator.DROPDOWN_DATA_PROVIDER, this.m_dataProviderName, "Choose Data Provider", null, true);
	this.m_dpNameDropdown.setRequired(true);
	if (this.m_hideDpDropdown)
	{
		this.m_dpNameDropdown.setVisible(false);
	}
	this.m_dpNameDropdown.setValueChangedConsumer(valueChangedConsumer);
	this._updateDataProviderMap();
	this._subscribeToDataProviderChanges();
	this.m_visualizationNameInput = this.m_form.addInput(oFF.OuVisualizationCreator.INPUT_VIZ_NAME, null, "Visualization Name");
	this.m_visualizationNameInput.setRequired(true);
	this.m_visualizationNameInput.setValueChangedConsumer(valueChangedConsumer);
	this.m_visualizationTypeDropdown = this.m_form.addDropdown(oFF.OuVisualizationCreator.DROPDOWN_VIZ_TYPE, null, "Visualization Type", null, true);
	this.m_visualizationTypeDropdown.setRequired(true);
	this.m_visualizationTypeDropdown.setValueChangedConsumer(valueChangedConsumer);
	this._populateVisualizationTypes();
	this.m_createButton = this.m_form.addFormButton(oFF.OuVisualizationCreator.BUTTON_CREATE, "Create Visualization", "Create", null, this._createVisualization.bind(this));
	this.m_createButton.setEnabled(this._isCreateAllowed());
	let view = this.m_form.getView();
	view.setPadding(oFF.UiCssBoxEdges.create("0.5rem"));
	this.m_mainLayout.addItem(view);
	this.m_messagesLayout = this.m_mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_messagesLayout.setDirection(oFF.UiFlexDirection.COLUMN).setPadding(oFF.UiCssBoxEdges.create("0.125rem 1rem")).setHeight(oFF.UiCssLength.create("5.5rem")).setOverflow(oFF.UiOverflow.AUTO);
};
oFF.OuVisualizationCreator.prototype._createVisualization = function()
{
	this.m_messagesLayout.clearItems();
	let strip = this.m_messagesLayout.addNewItemOfType(oFF.UiType.MESSAGE_STRIP);
	strip.setText("Processing").setMessageType(oFF.UiMessageType.INFORMATION).setShowIcon(true).setShowCloseButton(false).setMargin(oFF.UiCssBoxEdges.create("0.25rem 0rem"));
	let dpName = this.m_form.getJsonModel().getStringByKey(oFF.OuVisualizationCreator.DROPDOWN_DATA_PROVIDER);
	let vizName = this.m_form.getJsonModel().getStringByKey(oFF.OuVisualizationCreator.INPUT_VIZ_NAME);
	let vizType = this.m_form.getJsonModel().getStringByKey(oFF.OuVisualizationCreator.DROPDOWN_VIZ_TYPE);
	if (this._isCreateAllowed())
	{
		let dataProvider = this._getDataProvider(dpName);
		if (oFF.notNull(dataProvider))
		{
			let visualizationType = oFF.VisualizationType.lookup(vizType);
			let chartType = visualizationType === oFF.VisualizationType.CHART ? oFF.ChartType.BAR : null;
			let protocolBindingType = visualizationType.getDefaultProtocolBindingType();
			dataProvider.getActions().getVisualizationActions().getOrCreateVisualizationDefinition(vizName, visualizationType, protocolBindingType, chartType).onThen((vizDefinition) => {
				strip.setText("Visualization definition created successfully.").setMessageType(oFF.UiMessageType.SUCCESS);
			}).onCatch((error) => {
				strip.setText(error.getText()).setMessageType(oFF.UiMessageType.ERROR);
			});
		}
		else
		{
			strip.setText("Data provider not found.").setMessageType(oFF.UiMessageType.ERROR);
		}
	}
};
oFF.OuVisualizationCreator.prototype._getDataProvider = function(dataProviderName)
{
	let dataProvider = null;
	let dataProviderPool = this.getProcess().getDataProviderPool();
	if (oFF.notNull(dataProviderPool))
	{
		dataProvider = dataProviderPool.getDataProviderByName(dataProviderName);
	}
	if (oFF.isNull(dataProvider))
	{
		let sharedStorage = this.getProcessSharedDataSpace(oFF.OuDataProviderCommandPlugin.DEFAULT_SHARED_SPACE_NAME).getXObjectByKey(oFF.OuDataProviderCommandPlugin.SPACE_STORAGE);
		if (oFF.notNull(sharedStorage))
		{
			dataProvider = sharedStorage.getActiveDataProviders().getByKey(dataProviderName);
		}
	}
	return dataProvider;
};
oFF.OuVisualizationCreator.prototype._isCreateAllowed = function()
{
	let dpName = this.m_form.getJsonModel().getStringByKey(oFF.OuVisualizationCreator.DROPDOWN_DATA_PROVIDER);
	let vizName = this.m_form.getJsonModel().getStringByKey(oFF.OuVisualizationCreator.INPUT_VIZ_NAME);
	let vizType = this.m_form.getJsonModel().getStringByKey(oFF.OuVisualizationCreator.DROPDOWN_VIZ_TYPE);
	return oFF.XStringUtils.isNotNullAndNotEmpty(dpName) && oFF.XStringUtils.isNotNullAndNotEmpty(vizName) && oFF.XStringUtils.isNotNullAndNotEmpty(vizType);
};
oFF.OuVisualizationCreator.prototype._populateVisualizationTypes = function()
{
	let vizTypeMap = oFF.XHashMapByString.create();
	vizTypeMap.put(oFF.VisualizationType.GRID.getName(), oFF.VisualizationType.GRID.getName());
	vizTypeMap.put(oFF.VisualizationType.CHART.getName(), oFF.VisualizationType.CHART.getName());
	this.m_visualizationTypeDropdown.setDropdownItems(vizTypeMap);
};
oFF.OuVisualizationCreator.prototype._setupSharedDataSpace = function()
{
	let process = this.getProcess();
	let sharedDataSpace = process.getSharedDataSpace(oFF.OuDataProviderCommandPlugin.DEFAULT_SHARED_SPACE_NAME);
	if (oFF.isNull(sharedDataSpace))
	{
		sharedDataSpace = process.createSharedDataSpace(oFF.OuDataProviderCommandPlugin.DEFAULT_SHARED_SPACE_NAME);
	}
	if (!sharedDataSpace.containsKey(oFF.OuDataProviderCommandPlugin.SPACE_STORAGE))
	{
		let storage = oFF.OuDataProviderCPStorage.createDpStorage();
		sharedDataSpace.putXObject(oFF.OuDataProviderCommandPlugin.SPACE_STORAGE, storage);
	}
};
oFF.OuVisualizationCreator.prototype._subscribeToDataProviderChanges = function()
{
	let sharedStorage = this.getProcessSharedDataSpace(oFF.OuDataProviderCommandPlugin.DEFAULT_SHARED_SPACE_NAME).getXObjectByKey(oFF.OuDataProviderCommandPlugin.SPACE_STORAGE);
	let consumer = (key) => {
		this._updateDataProviderMap();
	};
	this.m_addDPSharedStorageListenerId = sharedStorage.getDataProviderAddListeners().addConsumer(consumer);
	this.m_removeDPSharedStorageListenerId = sharedStorage.getDataProviderRemoveListeners().addConsumer(consumer);
	let dataProviderPool = this.getProcess().getDataProviderPool();
	if (oFF.notNull(dataProviderPool))
	{
		this.m_changeDPPoolListenerId = dataProviderPool.addChangeConsumer((key) => {
			this._updateDataProviderMap();
		});
	}
};
oFF.OuVisualizationCreator.prototype._unsubscribeFromDataProviderChanges = function()
{
	let sharedStorage = this.getProcessSharedDataSpace(oFF.OuDataProviderCommandPlugin.DEFAULT_SHARED_SPACE_NAME).getXObjectByKey(oFF.OuDataProviderCommandPlugin.SPACE_STORAGE);
	if (oFF.notNull(this.m_addDPSharedStorageListenerId))
	{
		sharedStorage.getDataProviderAddListeners().removeConsumerByUuid(this.m_addDPSharedStorageListenerId);
	}
	if (oFF.notNull(this.m_removeDPSharedStorageListenerId))
	{
		sharedStorage.getDataProviderRemoveListeners().removeConsumerByUuid(this.m_removeDPSharedStorageListenerId);
	}
	let dataProviderPool = this.getProcess().getDataProviderPool();
	if (oFF.notNull(dataProviderPool) && oFF.notNull(this.m_changeDPPoolListenerId))
	{
		dataProviderPool.removeChangeConsumerByUuid(this.m_changeDPPoolListenerId);
	}
};
oFF.OuVisualizationCreator.prototype._updateDataProviderMap = function()
{
	let dpNames = oFF.XList.create();
	let dataProviderPool = this.getProcess().getDataProviderPool();
	if (oFF.notNull(dataProviderPool))
	{
		dpNames.addAll(dataProviderPool.getAllDataProviderNames());
	}
	let sharedStorage = this.getProcessSharedDataSpace(oFF.OuDataProviderCommandPlugin.DEFAULT_SHARED_SPACE_NAME).getXObjectByKey(oFF.OuDataProviderCommandPlugin.SPACE_STORAGE);
	if (oFF.notNull(sharedStorage))
	{
		oFF.XCollectionUtils.forEach(sharedStorage.getActiveDataProviders().getKeysAsReadOnlyList(), (dp) => {
			if (!dpNames.contains(dp))
			{
				dpNames.add(dp);
			}
		});
	}
	let dataProviderMap = oFF.XHashMapByString.create();
	oFF.XCollectionUtils.forEach(dpNames, (dp) => {
		dataProviderMap.put(dp, dp);
	});
	this.m_dpNameDropdown.setDropdownItems(dataProviderMap);
	this.m_dpNameDropdown.setEmptyItemText("");
};
oFF.OuVisualizationCreator.prototype.buildUi = function(genesis)
{
	this.setTitle("Create visualization");
	this.m_mainLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT).setDirection(oFF.UiFlexDirection.COLUMN).setPadding(oFF.UiCssBoxEdges.create("0.5rem 1rem"));
	this._buildLayoutUi();
	genesis.setRoot(this.m_mainLayout);
};
oFF.OuVisualizationCreator.prototype.getDefaultContainerSize = function()
{
	if (this.m_hideDpDropdown)
	{
		return oFF.UiSize.createByCss("30rem", "15rem");
	}
	else
	{
		return oFF.UiSize.createByCss("30rem", "21rem");
	}
};
oFF.OuVisualizationCreator.prototype.getProgramName = function()
{
	return oFF.OuVisualizationCreator.DEFAULT_PROGRAM_NAME;
};
oFF.OuVisualizationCreator.prototype.newProgram = function()
{
	let prg = new oFF.OuVisualizationCreator();
	prg.setup();
	return prg;
};
oFF.OuVisualizationCreator.prototype.prepareProgramMetadata = function(metadata) {};
oFF.OuVisualizationCreator.prototype.processArguments = function(args)
{
	this.m_dataProviderName = args.getStringByKey(oFF.OuVisualizationCreator.PARAM_DATA_PROVIDER_NAME);
	this.m_hideDpDropdown = args.getBooleanByKey(oFF.OuVisualizationCreator.PARAM_HIDE_DP);
};
oFF.OuVisualizationCreator.prototype.processConfiguration = function(configuration) {};
oFF.OuVisualizationCreator.prototype.releaseObject = function()
{
	this._unsubscribeFromDataProviderChanges();
	this.m_dataProviderName = null;
	this.m_dpNameDropdown = oFF.XObjectExt.release(this.m_dpNameDropdown);
	this.m_visualizationNameInput = oFF.XObjectExt.release(this.m_visualizationNameInput);
	this.m_visualizationTypeDropdown = oFF.XObjectExt.release(this.m_visualizationTypeDropdown);
	this.m_createButton = oFF.XObjectExt.release(this.m_createButton);
	this.m_form = oFF.XObjectExt.release(this.m_form);
	this.m_mainLayout = oFF.XObjectExt.release(this.m_mainLayout);
	this.m_messagesLayout = oFF.XObjectExt.release(this.m_messagesLayout);
	oFF.DfUiProgram.prototype.releaseObject.call( this );
};
oFF.OuVisualizationCreator.prototype.setupProgram = function()
{
	this._setupSharedDataSpace();
	return null;
};

oFF.OuDataProviderActionListProgram = function() {};
oFF.OuDataProviderActionListProgram.prototype = new oFF.DfDataProviderUiProgram();
oFF.OuDataProviderActionListProgram.prototype._ff_c = "OuDataProviderActionListProgram";

oFF.OuDataProviderActionListProgram.NAME = "DataProviderActionList";
oFF.OuDataProviderActionListProgram.prototype.m_view = null;
oFF.OuDataProviderActionListProgram.prototype.buildUi = function(genesis)
{
	this.m_view.renderView(genesis);
	genesis.setRoot(this.m_view.getView());
};
oFF.OuDataProviderActionListProgram.prototype.getProgramName = function()
{
	return oFF.OuDataProviderActionListProgram.NAME;
};
oFF.OuDataProviderActionListProgram.prototype.newProgram = function()
{
	let prg = new oFF.OuDataProviderActionListProgram();
	prg.m_view = oFF.OuDataProviderActionListView.createView();
	prg.setup();
	return prg;
};
oFF.OuDataProviderActionListProgram.prototype.onDataProviderSet = function(dataProvider)
{
	this.m_view.setDataProvider(dataProvider);
};
oFF.OuDataProviderActionListProgram.prototype.releaseObject = function()
{
	this.m_view = oFF.XObjectExt.release(this.m_view);
	oFF.DfDataProviderUiProgram.prototype.releaseObject.call( this );
};

oFF.OuDataProviderLogProgram = function() {};
oFF.OuDataProviderLogProgram.prototype = new oFF.DfDataProviderUiProgram();
oFF.OuDataProviderLogProgram.prototype._ff_c = "OuDataProviderLogProgram";

oFF.OuDataProviderLogProgram.NAME = "DataProviderLog";
oFF.OuDataProviderLogProgram.prototype.m_view = null;
oFF.OuDataProviderLogProgram.prototype.buildUi = function(genesis)
{
	this.m_view.renderView(genesis);
	genesis.setRoot(this.m_view.getView());
};
oFF.OuDataProviderLogProgram.prototype.getProgramName = function()
{
	return oFF.OuDataProviderLogProgram.NAME;
};
oFF.OuDataProviderLogProgram.prototype.newProgram = function()
{
	let prg = new oFF.OuDataProviderLogProgram();
	prg.m_view = oFF.OuDataProviderLogView.createView();
	prg.setup();
	return prg;
};
oFF.OuDataProviderLogProgram.prototype.onDataProviderSet = function(dataProvider)
{
	this.m_view.setDataProvider(dataProvider);
};
oFF.OuDataProviderLogProgram.prototype.releaseObject = function()
{
	this.m_view = oFF.XObjectExt.release(this.m_view);
	oFF.DfDataProviderUiProgram.prototype.releaseObject.call( this );
};

oFF.UiConvenienceCmdsMenu = function() {};
oFF.UiConvenienceCmdsMenu.prototype = new oFF.UiComposite();
oFF.UiConvenienceCmdsMenu.prototype._ff_c = "UiConvenienceCmdsMenu";

oFF.UiConvenienceCmdsMenu.create = function()
{
	let newObject = new oFF.UiConvenienceCmdsMenu();
	newObject.setup();
	return newObject;
};
oFF.UiConvenienceCmdsMenu.prototype.m_convenienceCommands = null;
oFF.UiConvenienceCmdsMenu.prototype.m_mainMenu = null;
oFF.UiConvenienceCmdsMenu.prototype.m_queryManager = null;
oFF.UiConvenienceCmdsMenu.prototype.addAxesClearAxesMenu = function(axesMenu)
{
	let clearAxisMenu = axesMenu.addNewItem().setName("clearAxisMenu").setText("Clear axis");
	clearAxisMenu.addNewItem().setName("clearRowAxis").setText("Row").registerOnPress(this);
	clearAxisMenu.addNewItem().setName("clearColumnAxis").setText("Column").registerOnPress(this);
	clearAxisMenu.addNewItem().setName("clearFreeAxis").setText("Free").registerOnPress(this);
	clearAxisMenu.addNewItem().setName("clearDynamicAxis").setText("Dynamic").registerOnPress(this);
	clearAxisMenu.addNewItem().setName("clearFilterAxis").setText("Filter").registerOnPress(this);
	clearAxisMenu.addNewItem().setName("clearRepositoryAxis").setText("Respository").registerOnPress(this);
	clearAxisMenu.addNewItem().setName("clearVirtualAxis").setText("Virtual").registerOnPress(this);
};
oFF.UiConvenienceCmdsMenu.prototype.addAxesColumnsMenu = function(queryModel, axesMenu)
{
	let columnsAxis = queryModel.getAxesManager().getColumnsAxis();
	if (oFF.notNull(columnsAxis))
	{
		let columnsMenu = axesMenu.addNewItem().setName("columnsMenuItem").setText("Columns").setCustomObject(columnsAxis);
		if (columnsAxis.supportsTotals())
		{
			let columnsTotalsMenu = columnsMenu.addNewItem().setTag("axesTotalsMenu").setText("Totals").setCustomObject(columnsAxis);
			columnsTotalsMenu.addNewItem().setTag("axesTotalsShow").setText("show").registerOnPress(this);
			columnsTotalsMenu.addNewItem().setTag("axesTotalsHide").setText("hide").registerOnPress(this);
		}
		else
		{
			columnsMenu.setEnabled(false);
		}
	}
};
oFF.UiConvenienceCmdsMenu.prototype.addAxesRowsMenu = function(queryModel, axesMenu)
{
	let rowsAxis = queryModel.getAxesManager().getRowsAxis();
	if (oFF.notNull(rowsAxis))
	{
		let rowsMenu = axesMenu.addNewItem().setName("rowsMenuItem").setText("Rows").setCustomObject(rowsAxis);
		if (rowsAxis.supportsTotals())
		{
			let rowsTotalsMenu = rowsMenu.addNewItem().setTag("axesTotalsMenu").setText("Totals").setCustomObject(rowsAxis);
			rowsTotalsMenu.addNewItem().setTag("axesTotalsShow").setText("show").registerOnPress(this);
			rowsTotalsMenu.addNewItem().setTag("axesTotalsHide").setText("hide").registerOnPress(this);
		}
		else
		{
			rowsMenu.setEnabled(false);
		}
	}
};
oFF.UiConvenienceCmdsMenu.prototype.addDimAttributesMenu = function(dimension, dimenionMenu)
{
	let attributesMenu = dimenionMenu.addNewItem().setName("attrMenu").setText("Attributes");
	let attributeList = dimension.getAttributes();
	if (attributeList.hasElements())
	{
		let attributeIterator = attributeList.getIterator();
		while (attributeIterator.hasNext())
		{
			let tmpAttr = attributeIterator.next();
			let attrText = tmpAttr.getText();
			let attrName = tmpAttr.getName();
			if (oFF.XStringUtils.isNullOrEmpty(attrText))
			{
				attrText = attrName;
			}
			let attrMenu = attributesMenu.addNewItem().setName(attrName).setTag("attributeItem").setText(attrText).setCustomObject(tmpAttr);
			attrMenu.addNewItem().setTag("attrShow").setText("show").setCustomObject(tmpAttr).registerOnPress(this);
			attrMenu.addNewItem().setTag("attrHide").setText("hide").setCustomObject(tmpAttr).registerOnPress(this);
		}
	}
	attributesMenu.setEnabled(attributesMenu.hasItems() ? true : false);
};
oFF.UiConvenienceCmdsMenu.prototype.addDimHierarchyMenu = function(dimension, dimenionMenu)
{
	let hierarchyMenu = dimenionMenu.addNewItem().setName("hierarchyMenu").setText("Hierarchy").setCustomObject(dimension);
	let hierarchies = dimension.getHierarchies();
	if (dimension.supportsHierarchy() && oFF.notNull(hierarchies))
	{
		let hierarchyIterator = hierarchies.getObjects().getIterator();
		while (hierarchyIterator.hasNext())
		{
			let tmpHier = hierarchyIterator.next();
			let hierarchyItem = hierarchyMenu.addNewItem().setTag("hierarchyItem").setText(tmpHier.getHierarchyName()).setCustomObject(tmpHier);
			hierarchyItem.addNewItem().setTag("activateHierarchy").setText("activate").registerOnPress(this);
			hierarchyItem.addNewItem().setTag("deactivateHierarchy").setText("deactivate").registerOnPress(this);
		}
	}
	hierarchyMenu.setEnabled(hierarchyMenu.hasItems() ? true : false);
};
oFF.UiConvenienceCmdsMenu.prototype.addDimSortingMenu = function(dimension, dimenionMenu)
{
	let dimSortMenu = dimenionMenu.addNewItem().setName("sortMenu").setText("Sort").setCustomObject(dimension);
	this.addSortSubmenuWithSortType(dimension, dimSortMenu, oFF.SortType.MEMBER_TEXT, "By text");
	this.addSortSubmenuWithSortType(dimension, dimSortMenu, oFF.SortType.MEMBER_KEY, "By key");
	this.addSortSubmenuWithSortType(dimension, dimSortMenu, oFF.SortType.HIERARCHY, "By hierarchy");
};
oFF.UiConvenienceCmdsMenu.prototype.addDimTotalsMenu = function(dimension, dimenionMenu)
{
	let dimTotalsMenu = dimenionMenu.addNewItem().setName("dimTotalsMenu").setText("Totals").setCustomObject(dimension);
	if (dimension.supportsTotals())
	{
		dimTotalsMenu.addNewItem().setTag("dimTotalsShow").setText("show").registerOnPress(this);
		dimTotalsMenu.addNewItem().setTag("dimTotalsHide").setText("hide").registerOnPress(this);
	}
	else
	{
		dimTotalsMenu.setEnabled(false);
	}
};
oFF.UiConvenienceCmdsMenu.prototype.addMoveDimensionToAxisMenu = function(dimension, dimenionMenu)
{
	let dimMoveToAxisMenu = dimenionMenu.addNewItem().setName("dimMoveToAxisMenu").setText("Move to axis").setCustomObject(dimension);
	if (dimension.supportsAxis(oFF.AxisType.ROWS))
	{
		dimMoveToAxisMenu.addNewItem().setTag("moveToAxisRows").setText("Rows").registerOnPress(this);
	}
	if (dimension.supportsAxis(oFF.AxisType.COLUMNS))
	{
		dimMoveToAxisMenu.addNewItem().setTag("moveToAxisColumns").setText("Columns").registerOnPress(this);
	}
	if (dimension.supportsAxis(oFF.AxisType.FREE))
	{
		dimMoveToAxisMenu.addNewItem().setTag("moveToAxisFree").setText("Free").registerOnPress(this);
	}
	if (dimension.supportsAxis(oFF.AxisType.DYNAMIC))
	{
		dimMoveToAxisMenu.addNewItem().setTag("moveToAxisDynamic").setText("Dynamic").registerOnPress(this);
	}
	if (dimension.supportsAxis(oFF.AxisType.FILTER))
	{
		dimMoveToAxisMenu.addNewItem().setTag("moveToAxisFilter").setText("Filter").registerOnPress(this);
	}
	if (dimension.supportsAxis(oFF.AxisType.REPOSITORY))
	{
		dimMoveToAxisMenu.addNewItem().setTag("moveToAxisRepository").setText("Repository").registerOnPress(this);
	}
	if (dimension.supportsAxis(oFF.AxisType.VIRTUAL))
	{
		dimMoveToAxisMenu.addNewItem().setTag("moveToAxisVirtual").setText("Virtual").registerOnPress(this);
	}
	dimMoveToAxisMenu.setEnabled(dimMoveToAxisMenu.hasItems() ? true : false);
};
oFF.UiConvenienceCmdsMenu.prototype.addSortSubmenuWithSortType = function(dimension, dimSortMenu, sortType, text)
{
	let dimSortByHierarchyMenu = dimSortMenu.addNewItem().setTag("sortBySubMenu").setText(text).setCustomObject(dimension);
	if (dimension.supportsSorting(sortType))
	{
		dimSortByHierarchyMenu.addNewItem().setTag("sortAsc").setText("Ascending").registerOnPress(this).setCustomObject(sortType);
		dimSortByHierarchyMenu.addNewItem().setTag("sortDesc").setText("Descending").registerOnPress(this).setCustomObject(sortType);
	}
	else
	{
		dimSortByHierarchyMenu.setEnabled(false);
	}
};
oFF.UiConvenienceCmdsMenu.prototype.initializeComposite = function()
{
	this.m_mainMenu = this.newControl(oFF.UiType.MENU);
	this.setBaseControl(this.m_mainMenu);
};
oFF.UiConvenienceCmdsMenu.prototype.onPress = function(event)
{
	let controlParent = event.getControl().getParent();
	if (oFF.notNull(controlParent) && (controlParent.getUiType() === oFF.UiType.MENU || controlParent.getUiType() === oFF.UiType.MENU_ITEM) && oFF.notNull(this.m_convenienceCommands))
	{
		this.getUiManager().getSession().notifyInterruptStepStart();
		let tmpDim;
		let dimensionName;
		if (oFF.XString.isEqual(controlParent.getTag(), "attributeItem"))
		{
			let tmpAttr = controlParent.getCustomObject();
			let attributeName = tmpAttr.getName();
			dimensionName = tmpAttr.getDimension().getName();
			switch (event.getControl().getTag())
			{
				case "attrShow":
					this.m_convenienceCommands.addAttributeToResultSet(dimensionName, attributeName);
					break;

				case "attrHide":
					this.m_convenienceCommands.removeAttributeFromResultSet(dimensionName, attributeName);
					break;

				default:
			}
		}
		else if (oFF.XString.isEqual(controlParent.getTag(), "hierarchyItem"))
		{
			tmpDim = controlParent.getParent().getCustomObject();
			let tmpHier = controlParent.getCustomObject();
			dimensionName = tmpDim.getName();
			let hierName = tmpHier.getHierarchyName();
			switch (event.getControl().getTag())
			{
				case "activateHierarchy":
					this.m_convenienceCommands.setDimensionHierarchy(dimensionName, hierName, true, 0);
					break;

				case "deactivateHierarchy":
					this.m_convenienceCommands.setDimensionHierarchy(dimensionName, hierName, false, 0);
					break;

				default:
			}
		}
		else if (oFF.XString.isEqual(controlParent.getName(), "dimTotalsMenu"))
		{
			tmpDim = controlParent.getCustomObject();
			dimensionName = tmpDim.getName();
			switch (event.getControl().getTag())
			{
				case "dimTotalsShow":
					this.m_convenienceCommands.setTotalsVisibleOnDimension(dimensionName, oFF.ResultVisibility.ALWAYS);
					break;

				case "dimTotalsHide":
					this.m_convenienceCommands.setTotalsVisibleOnDimension(dimensionName, oFF.ResultVisibility.HIDDEN);
					break;

				default:
			}
		}
		else if (oFF.XString.isEqual(controlParent.getTag(), "sortBySubMenu"))
		{
			tmpDim = controlParent.getCustomObject();
			let sortType = event.getControl().getCustomObject();
			dimensionName = tmpDim.getName();
			switch (event.getControl().getTag())
			{
				case "sortAsc":
					this.m_convenienceCommands.sort(sortType, null, dimensionName, null, null, null, oFF.XSortDirection.ASCENDING);
					break;

				case "sortDesc":
					this.m_convenienceCommands.sort(sortType, null, dimensionName, null, null, null, oFF.XSortDirection.DESCENDING);
					break;

				default:
			}
		}
		else if (oFF.XString.isEqual(controlParent.getName(), "dimMoveToAxisMenu"))
		{
			tmpDim = controlParent.getCustomObject();
			dimensionName = tmpDim.getName();
			switch (event.getControl().getTag())
			{
				case "moveToAxisRows":
					this.m_convenienceCommands.moveDimensionToAxis(dimensionName, oFF.AxisType.ROWS);
					break;

				case "moveToAxisColumns":
					this.m_convenienceCommands.moveDimensionToAxis(dimensionName, oFF.AxisType.COLUMNS);
					break;

				case "moveToAxisFree":
					this.m_convenienceCommands.moveDimensionToAxis(dimensionName, oFF.AxisType.FREE);
					break;

				case "moveToAxisDynamic":
					this.m_convenienceCommands.moveDimensionToAxis(dimensionName, oFF.AxisType.DYNAMIC);
					break;

				case "moveToAxisFilter":
					this.m_convenienceCommands.moveDimensionToAxis(dimensionName, oFF.AxisType.FILTER);
					break;

				case "moveToAxisRepository":
					this.m_convenienceCommands.moveDimensionToAxis(dimensionName, oFF.AxisType.REPOSITORY);
					break;

				case "moveToAxisVirtual":
					this.m_convenienceCommands.moveDimensionToAxis(dimensionName, oFF.AxisType.VIRTUAL);
					break;

				default:
			}
		}
		else if (oFF.XString.isEqual(controlParent.getTag(), "axesTotalsMenu"))
		{
			let tmpAxis = controlParent.getCustomObject();
			switch (event.getControl().getTag())
			{
				case "axesTotalsShow":
					this.m_convenienceCommands.setTotalsVisibleOnAxis(tmpAxis.getType(), oFF.ResultVisibility.ALWAYS);
					break;

				case "axesTotalsHide":
					this.m_convenienceCommands.setTotalsVisibleOnAxis(tmpAxis.getType(), oFF.ResultVisibility.HIDDEN);
					break;

				default:
			}
		}
		else if (oFF.XString.isEqual(controlParent.getName(), "clearAxisMenu"))
		{
			switch (event.getControl().getName())
			{
				case "clearRowAxis":
					this.m_convenienceCommands.clearAxis(oFF.AxisType.ROWS);
					break;

				case "clearColumnAxis":
					this.m_convenienceCommands.clearAxis(oFF.AxisType.COLUMNS);
					break;

				case "clearFreeAxis":
					this.m_convenienceCommands.clearAxis(oFF.AxisType.FREE);
					break;

				case "clearDynamicAxis":
					this.m_convenienceCommands.clearAxis(oFF.AxisType.DYNAMIC);
					break;

				case "clearFilterAxis":
					this.m_convenienceCommands.clearAxis(oFF.AxisType.FILTER);
					break;

				case "clearRepositoryAxis":
					this.m_convenienceCommands.clearAxis(oFF.AxisType.REPOSITORY);
					break;

				case "clearVirtualAxis":
					this.m_convenienceCommands.clearAxis(oFF.AxisType.VIRTUAL);
					break;

				default:
			}
		}
		else if (oFF.XString.isEqual(controlParent.getName(), "axesMenu"))
		{
			switch (event.getControl().getName())
			{
				case "switchAxesMenuItem":
					this.m_convenienceCommands.switchAxes();
					break;

				default:
			}
		}
		else if (oFF.XString.isEqual(event.getControl().getName(), "reset"))
		{
			this.m_convenienceCommands.reset();
		}
		else if (oFF.XString.isEqual(event.getControl().getName(), "resetToDefault"))
		{
			this.m_convenienceCommands.resetToDefault();
		}
		this.getUiManager().getSession().notifyInterruptStepEnd();
	}
};
oFF.UiConvenienceCmdsMenu.prototype.openAt = function(control)
{
	oFF.UiComposite.prototype.openAt.call( this , control);
	this.prepareMenu();
	if (this.m_mainMenu.hasItems())
	{
		this.m_mainMenu.openAt(control);
	}
	return this;
};
oFF.UiConvenienceCmdsMenu.prototype.prepareMenu = function()
{
	if (this.m_mainMenu.hasItems())
	{
		return;
	}
	if (oFF.isNull(this.m_queryManager))
	{
		this.retrieveQueryManager();
	}
	if (oFF.notNull(this.m_queryManager))
	{
		let dimensionList = this.m_queryManager.getDimensionAccessor().getDimensions();
		let dimensionIterator = dimensionList.getIterator();
		let dimensionsMenu = this.m_mainMenu.addNewItem().setName("dimMenu").setText("Dimensions");
		while (dimensionIterator.hasNext())
		{
			let tmpDim = dimensionIterator.next();
			if (tmpDim.isUniversalDisplayHierarchyDimension())
			{
				continue;
			}
			let dimText = tmpDim.getText();
			let dimName = tmpDim.getName();
			if (oFF.XStringUtils.isNullOrEmpty(dimText))
			{
				dimText = dimName;
			}
			let dimenionMenu = dimensionsMenu.addNewItem().setName(dimName).setText(dimText).setCustomObject(tmpDim);
			this.addDimHierarchyMenu(tmpDim, dimenionMenu);
			this.addDimAttributesMenu(tmpDim, dimenionMenu);
			this.addDimTotalsMenu(tmpDim, dimenionMenu);
			this.addDimSortingMenu(tmpDim, dimenionMenu);
			this.addMoveDimensionToAxisMenu(tmpDim, dimenionMenu);
		}
		let queryModel = this.m_queryManager.getQueryModel();
		if (oFF.notNull(queryModel))
		{
			let axesMenu = this.m_mainMenu.addNewItem().setName("axesMenu").setText("Axes");
			this.addAxesRowsMenu(queryModel, axesMenu);
			this.addAxesColumnsMenu(queryModel, axesMenu);
			axesMenu.addNewItem().setName("switchAxesMenuItem").setText("Switch axes").registerOnPress(this);
			this.addAxesClearAxesMenu(axesMenu);
		}
		this.m_mainMenu.addNewItem().setName("reset").setText("Reset").registerOnPress(this);
		this.m_mainMenu.addNewItem().setName("resetToDefault").setText("Reset to default").registerOnPress(this);
	}
	else
	{
		let newToast = this.newControl(oFF.UiType.TOAST);
		newToast.setText("No data provider specified!");
		newToast.setMessageType(oFF.UiMessageType.ERROR);
		newToast.open();
	}
};
oFF.UiConvenienceCmdsMenu.prototype.releaseObject = function()
{
	this.m_mainMenu = oFF.XObjectExt.release(this.m_mainMenu);
	this.m_convenienceCommands = null;
	this.m_queryManager = null;
	oFF.UiComposite.prototype.releaseObject.call( this );
};
oFF.UiConvenienceCmdsMenu.prototype.retrieveQueryManager = function()
{
	let dataProviderName = this.getCustomParameters().asStructure().getStringByKeyExt("dp", "");
	if (oFF.XStringUtils.isNotNullAndNotEmpty(dataProviderName))
	{
		let selectionExp = oFF.XStringUtils.concatenate2("dp:", dataProviderName);
		let process = this.getUiManager().getSession();
		let dataProvder = process.getSelector().selectComponentByExpr(selectionExp, oFF.SigSelDomain.DATA, this, 1, false);
		if (oFF.notNull(dataProvder))
		{
			this.m_queryManager = dataProvder.getQueryManager();
			this.m_convenienceCommands = this.m_queryManager.getConvenienceCommands();
		}
	}
};
oFF.UiConvenienceCmdsMenu.prototype.setCustomParameters = function(customParameters)
{
	oFF.UiComposite.prototype.setCustomParameters.call( this , customParameters);
	this.retrieveQueryManager();
	return this;
};
oFF.UiConvenienceCmdsMenu.prototype.setup = function()
{
	oFF.UiComposite.prototype.setup.call( this );
};

oFF.UiRedoButton = function() {};
oFF.UiRedoButton.prototype = new oFF.UiComposite();
oFF.UiRedoButton.prototype._ff_c = "UiRedoButton";

oFF.UiRedoButton.create = function()
{
	let newObject = new oFF.UiRedoButton();
	newObject.setup();
	return newObject;
};
oFF.UiRedoButton.prototype.m_application = null;
oFF.UiRedoButton.prototype.m_redoButton = null;
oFF.UiRedoButton.prototype.getButtonText = function()
{
	if (oFF.notNull(this.m_application))
	{
		let availableRedoStepCount = this.m_application.getUndoManager().getAvailableRedoStepCount();
		if (availableRedoStepCount > 0)
		{
			let redoStepCountStr = oFF.XInteger.convertToString(availableRedoStepCount);
			return oFF.XStringUtils.concatenate3("Redo (", redoStepCountStr, ")");
		}
	}
	return "Redo";
};
oFF.UiRedoButton.prototype.initializeComposite = function()
{
	this.m_application = this.getUiManager().getProcess().getApplication();
	if (oFF.notNull(this.m_application))
	{
		this.m_application.getUndoManager().registerUndoManagerListener(this);
	}
	this.m_redoButton = this.newControl(oFF.UiType.BUTTON);
	this.m_redoButton.setText("Redo");
	this.m_redoButton.registerOnPress(this);
	this.m_redoButton.setEnabled(false);
	this.setBaseControl(this.m_redoButton);
};
oFF.UiRedoButton.prototype.onPress = function(event)
{
	let newToast = this.newControl(oFF.UiType.TOAST);
	if (oFF.notNull(this.m_application))
	{
		this.m_application.getUndoManager().processRedo(null, null, null);
		newToast.setText("Redo!");
	}
	else
	{
		newToast.setText("Application not found! Redo not possible!");
		newToast.setMessageType(oFF.UiMessageType.ERROR);
	}
	newToast.open();
};
oFF.UiRedoButton.prototype.releaseObject = function()
{
	this.m_redoButton = oFF.XObjectExt.release(this.m_redoButton);
	this.m_application = null;
	oFF.UiComposite.prototype.releaseObject.call( this );
};
oFF.UiRedoButton.prototype.setMargin = function(margin)
{
	oFF.UiComposite.prototype.setMargin.call( this , margin);
	this.m_redoButton.setMargin(margin);
	return this;
};
oFF.UiRedoButton.prototype.setup = function()
{
	oFF.UiComposite.prototype.setup.call( this );
};
oFF.UiRedoButton.prototype.undoManagerStateChanged = function()
{
	if (oFF.notNull(this.m_application) && oFF.notNull(this.m_redoButton))
	{
		this.m_redoButton.setEnabled(this.m_application.getUndoManager().getAvailableRedoStepCount() > 0);
		this.m_redoButton.setText(this.getButtonText());
	}
};

oFF.UiUndoButton = function() {};
oFF.UiUndoButton.prototype = new oFF.UiComposite();
oFF.UiUndoButton.prototype._ff_c = "UiUndoButton";

oFF.UiUndoButton.create = function()
{
	let newObject = new oFF.UiUndoButton();
	newObject.setup();
	return newObject;
};
oFF.UiUndoButton.prototype.m_application = null;
oFF.UiUndoButton.prototype.m_undoButton = null;
oFF.UiUndoButton.prototype.getButtonText = function()
{
	if (oFF.notNull(this.m_application))
	{
		let availableUndoStepCount = this.m_application.getUndoManager().getAvailableUndoStepCount();
		if (availableUndoStepCount > 0)
		{
			let undoStepCountStr = oFF.XInteger.convertToString(availableUndoStepCount);
			return oFF.XStringUtils.concatenate3("Undo (", undoStepCountStr, ")");
		}
	}
	return "Undo";
};
oFF.UiUndoButton.prototype.initializeComposite = function()
{
	this.m_application = this.getUiManager().getProcess().getApplication();
	if (oFF.notNull(this.m_application))
	{
		this.m_application.getUndoManager().registerUndoManagerListener(this);
	}
	this.m_undoButton = this.newControl(oFF.UiType.BUTTON);
	this.m_undoButton.setText(this.getButtonText());
	this.m_undoButton.registerOnPress(this);
	this.m_undoButton.setEnabled(false);
	this.setBaseControl(this.m_undoButton);
};
oFF.UiUndoButton.prototype.onPress = function(event)
{
	let newToast = this.newControl(oFF.UiType.TOAST);
	if (oFF.notNull(this.m_application))
	{
		this.m_application.getUndoManager().processUndo(null, null, null);
		newToast.setText("Undo!");
	}
	else
	{
		newToast.setText("Application not found! Undo not possible!");
		newToast.setMessageType(oFF.UiMessageType.ERROR);
	}
	newToast.open();
};
oFF.UiUndoButton.prototype.releaseObject = function()
{
	this.m_undoButton = oFF.XObjectExt.release(this.m_undoButton);
	this.m_application = null;
	oFF.UiComposite.prototype.releaseObject.call( this );
};
oFF.UiUndoButton.prototype.setMargin = function(margin)
{
	oFF.UiComposite.prototype.setMargin.call( this , margin);
	this.m_undoButton.setMargin(margin);
	return this;
};
oFF.UiUndoButton.prototype.setup = function()
{
	oFF.UiComposite.prototype.setup.call( this );
};
oFF.UiUndoButton.prototype.undoManagerStateChanged = function()
{
	if (oFF.notNull(this.m_application) && oFF.notNull(this.m_undoButton))
	{
		this.m_undoButton.setEnabled(this.m_application.getUndoManager().getAvailableUndoStepCount() > 0);
		this.m_undoButton.setText(this.getButtonText());
	}
};

oFF.OlapUiModule = function() {};
oFF.OlapUiModule.prototype = new oFF.DfModule();
oFF.OlapUiModule.prototype._ff_c = "OlapUiModule";

oFF.OlapUiModule.s_module = null;
oFF.OlapUiModule.getInstance = function()
{
	if (oFF.isNull(oFF.OlapUiModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.OlapUiApiModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.ResourceExplorerModule.getInstance());
		oFF.OlapUiModule.s_module = oFF.DfModule.startExt(new oFF.OlapUiModule());
		oFF.DialogDisplayMode.staticSetup();
		oFF.DialogLabelMode.staticSetup();
		oFF.DialogGridFormat.staticSetup();
		oFF.DialogGridParser.staticSetup();
		oFF.OlapUiReadMode.staticSetup();
		oFF.FilterDialogViewType.staticSetup();
		oFF.FilterDialogTextUsageType.staticSetup();
		oFF.FilterDialogUsageTrackingConsumer.staticSetup();
		oFF.VdOrcaScenario.staticSetup();
		oFF.VdOrcaLevel.staticSetup();
		oFF.OrcaLinkVarJoinMode.staticSetup();
		oFF.OrcaLinkVarSubmitHandling.staticSetup();
		oFF.QueryPresentationUtils.staticSetup();
		oFF.OuInventoryViewGroupPresentation.staticSetup();
		oFF.OuCalcUiComponent.staticSetup();
		oFF.OuAxesViewDisplayType.staticSetup();
		oFF.UiType.UNDO_BUTTON.setFactory(new oFF.UiUndoButtonFactory());
		oFF.UiType.REDO_BUTTON.setFactory(new oFF.UiRedoButtonFactory());
		oFF.UiType.CONVENIENCE_CMDS_MENU.setFactory(new oFF.UiConvenienceCmdsMenuFactory());
		oFF.ProgramRegistry.setProgramFactory(new oFF.OuVisualizationCreator());
		oFF.ProgramRegistry.setProgramFactory(new oFF.OuDataProviderActionListProgram());
		oFF.ProgramRegistry.setProgramFactory(new oFF.OuDataProviderLogProgram());
		oFF.HuPluginRegistry.registerPluginByClass(oFF.XClass.create(oFF.OuDataProviderActionListPlugin));
		oFF.HuPluginRegistry.registerPluginByClass(oFF.XClass.create(oFF.OuDataSourceListPlugin));
		oFF.OlapUiCommonI18n.staticSetup();
		oFF.DataExportHelperI18n.staticSetup();
		oFF.OuAxesViewI18n.staticSetup();
		oFF.OuInventoryViewI18n.staticSetup();
		oFF.OuCalcDetailsAreaViewI18n.staticSetup();
		oFF.OuCalcFormulaEditorI18n.staticSetup();
		oFF.OuNumberFormattingI18n.staticSetup();
		oFF.OuDisplayFormattingI18n.staticSetup();
		oFF.OuFormulaValidationI18n.staticSetup();
		oFF.AuKpiI18n.staticSetup();
		oFF.DfModule.stopExt(oFF.OlapUiModule.s_module);
	}
	return oFF.OlapUiModule.s_module;
};
oFF.OlapUiModule.prototype.getName = function()
{
	return "ff8010.olap.ui";
};

oFF.OlapUiModule.getInstance();

return oFF;
} );
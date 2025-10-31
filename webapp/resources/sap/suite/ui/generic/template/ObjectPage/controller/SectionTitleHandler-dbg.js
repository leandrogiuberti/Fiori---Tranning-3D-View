sap.ui.define(["sap/ui/base/Object", "sap/base/util/extend", "sap/suite/ui/generic/template/genericUtilities/controlHelper", "sap/ui/core/library",
		"sap/suite/ui/generic/template/genericUtilities/FeLogger", "sap/ui/core/Element", "sap/ui/core/InvisibleText"
	], function(BaseObject, extend, controlHelper, SapCoreLibrary, FeLogger, Element, InvisibleText) {
		"use strict";

		var STYLE_CLASS_FOR_ADJUSTMENT = "sapUiTableOnObjectPageAdjustmentsForSection";
		var sClassName = "ObjectPage.controller.SectionTitleHandler";
		var oLogger = new FeLogger(sClassName).getLogger();

		function getMethods(oController, oObjectPage, oTemplateUtils) {

			var oViewPropertiesModel = oController.getOwnerComponent().getModel("_templPrivView");

			var mSubSectionTitleInfo = Object.create(null);

			var oAppComponent = oController.getOwnerComponent().getAppComponent();

			oObjectPage.getSections().forEach(function(oSection){
				var aSubSections = oSection.getSubSections();
				if (aSubSections.length === 1){
					var oSingleSubSection = aSubSections[0];
					var sSubSectionId = oSingleSubSection.getId();
					mSubSectionTitleInfo[sSubSectionId] = {
						isStaticallySingleChild: true
					};
				}
			});

			function fnSetAsTitleOwner(oControl, bIsStandardSection) {
				// If the manifest setting is set, then the title of the section will not be adjusted

				if (!oAppComponent.getMergeObjectPageSectionTitle()) {
					oLogger.warning("Title of the section will not be adjusted as the manifest setting \"mergeObjectPageSectionTitle\" is set.");
					return;
				}

				var oSubSection;
				for (var oTestControl = oControl; oTestControl; oTestControl = controlHelper.getParent(oTestControl)){
					if (controlHelper.isObjectPageSubSection(oTestControl)){
						if (oTestControl === oControl){
							var oTitleInfoToBeCleared = mSubSectionTitleInfo[oControl.getId()];
							if (oTitleInfoToBeCleared && oTitleInfoToBeCleared.titleOwner){
								oTitleInfoToBeCleared.titleOwner.reset();
							}
							return;
						}
						oSubSection = oTestControl;
						break;
					}
				}

				if (bIsStandardSection && (!oSubSection || oSubSection.getBlocks().concat(oSubSection.getMoreBlocks()).length > 1)){
					return;
				}
				var oSection = oSubSection.getParent();
				var aSubSections = oSection.getSubSections();
				var sSubSectionId = oSubSection.getId();
				var oTitleInfo = mSubSectionTitleInfo[sSubSectionId];
				if (oTitleInfo){
					if (oTitleInfo.titleOwner){
						oTitleInfo.titleOwner.reset();
					}
				} else {
					oTitleInfo = { };
					mSubSectionTitleInfo[sSubSectionId] = oTitleInfo;
				}
				var oSubSectionTitleBinding = oViewPropertiesModel.bindProperty("/#" + oSubSection.getId() + "/title");
				var oControlMetadata = oControl.getMetadata();
				var bHasHeader = oControlMetadata.hasProperty("header");
				var setHeader = (bHasHeader ? oControl.setHeader : oControl.setText).bind(oControl);
				var sCurrentHeader = bHasHeader ? oControl.getHeader() : oControl.getText();
				var bHasHeaderLevel = oControlMetadata.hasProperty("headerLevel");
				var setHeaderLevel = (bHasHeaderLevel ? oControl.setHeaderLevel : oControl.setLevel).bind(oControl);
				var bHasHeaderStyle = oControlMetadata.hasProperty("headerStyle");
				var setHeaderStyle = (bHasHeaderStyle ? oControl.setHeaderStyle : oControl.setTitleStyle).bind(oControl);
				var sCurrentHeaderLevel = bHasHeaderLevel ?  oControl.getHeaderLevel() : oControl.getLevel();
				var sCurrentHeaderStyle = bHasHeaderStyle ?  oControl.getHeaderStyle() : oControl.getTitleStyle();
				var fnAdjustTitle = function(){
					setHeader(oSubSectionTitleBinding.getValue());
					oSubSection.setShowTitle(false);
					oSubSection.setTitleLevel(SapCoreLibrary.TitleLevel.Auto);
					oSection.addStyleClass(STYLE_CLASS_FOR_ADJUSTMENT);
				};
				oSubSectionTitleBinding.attachChange(fnAdjustTitle);
				oTitleInfo.titleOwner = {
					reset: function(){
						setHeader(sCurrentHeader);
						setHeaderLevel(sCurrentHeaderLevel);
						setHeaderStyle(sCurrentHeaderStyle);
						oSection.removeStyleClass(STYLE_CLASS_FOR_ADJUSTMENT);
						oSubSection.setShowTitle(true);
						oSubSection.setTitleLevel(SapCoreLibrary.TitleLevel.H4);
						if (oTitleInfo.isStaticallySingleChild){
							oSection.setShowTitle(true);
							oSection.setTitleLevel(SapCoreLibrary.TitleLevel.H3);
						}
						delete oTitleInfo.titleOwner;
						oSubSectionTitleBinding.destroy();
					}
				};
				fnAdjustTitle();
				if (oTitleInfo.isStaticallySingleChild){
					oSection.setShowTitle(false);
					oSection.setTitleLevel(SapCoreLibrary.TitleLevel.Auto);
				}
				setHeaderLevel(oTitleInfo.isStaticallySingleChild ? SapCoreLibrary.TitleLevel.H3 : SapCoreLibrary.TitleLevel.H4); // If one Section has only 1 Sub-Section, then Control title is set as "H3" else Section Title is "H3" and Control Title is "H4"
				if (aSubSections.length === 1) { // If one Section has only 1 Sub-Section, then Control's headerStyle will be set as "H4" irrespective of the headerLevel. This is done as per the suggestion from Object Page Community
					setHeaderStyle(SapCoreLibrary.TitleLevel.H4);
				}
			}

			//This logic is only for the first subsection
			//If the title of the subsection is not visible, then set the title level of all the controls to H4 to maintain the proper hierarchy.
			function fnAdjustSubSectionTitle(oFirstSubSection) {
				if (oFirstSubSection && (
					(typeof oFirstSubSection.getTitleVisible === "function" && !oFirstSubSection.getTitleVisible()) ||
					(typeof oFirstSubSection.getEffectiveTitleLevel === "function" && oFirstSubSection.getEffectiveTitleLevel() === "H3")
				)) {
					var aBlocks = oFirstSubSection.getAggregation("blocks");
					if (aBlocks && aBlocks.length > 0) {
						var oBlock = aBlocks[0];
						if (oBlock.isA("sap.ui.layout.Grid")) {
							var aContent = oBlock.getAggregation("content");
							if (aContent && aContent.length > 0) {
								aContent.forEach(function(oControl) {
									//The title handling for other smart controls (SmartTable and SmartChart) is already handled.
									if (oControl.isA("sap.ui.comp.smartform.SmartForm")) {
										var oContent = oControl.getAggregation("content");
										var aFormContainers = oContent.getAggregation("formContainers");
										if (aFormContainers && aFormContainers.length > 0) {
											aFormContainers.forEach(function(oFormContainer) {
												var vTitle = oFormContainer.getAggregation("title");
												// Sometimes, vTitle is of type string when the form container is created / renamed by adaptation.
												// Hence, set the level to H4 only when the "vTitle" is of type "sap.ui.core.Title".
												if (vTitle && vTitle.setLevel) {
													vTitle.setLevel("H4");
												}
											});
										}
									}
								});
							}
						}
					}
				}

			}

			/**
			 * Adds accessible name to SmartForm control in situations when Section and SubSection does not have a visible title
			 * @param {sap.uxap.ObjectPageSubSection} oFirstSubSection The first SubSection in a given Section
			 */
			function fnAddAccessibleName(oFirstSubSection) {
				// return if either Section or SubSection titles are visible because controls should propogate the accessible name in these cases
				var oSection = oFirstSubSection.getParent();
				var bIsSectionTitleVisible = oSection && typeof oSection.getTitleVisible === "function" && oSection.getTitleVisible();
				var bIsSubSectionTitleVisible = oFirstSubSection && typeof oFirstSubSection.getTitleVisible === "function" && oFirstSubSection.getTitleVisible();
				if (bIsSectionTitleVisible || bIsSubSectionTitleVisible) {
					return;
				}

				// return if subsection content is not SmartForm or if it already has an accessible name
				var oSmartForm = controlHelper.searchInTree(oFirstSubSection, function (oElement) {
					return controlHelper.isSmartForm(oElement) ? oElement : null;
				});
				if (!oSmartForm || oSmartForm.getAriaLabelledBy().length !== 0) {
					return;
				}

				// set accessible name using a reference to the title in ObjectPageLayout's anchor bar
				var sObjectPageId = oSection.getParent().getId();
				var sSectionId = oSection.getId();
				var sAnchorBarSectionHeaderId = sObjectPageId + "-anchBar-" + sSectionId + "-anchor";
				oSmartForm.addAriaLabelledBy(sAnchorBarSectionHeaderId);
			}

			function fnSetHeaderSmartFormAriaLabelBy(oFirstSubSection) {
				var oSubSectionInfoObject = oTemplateUtils.oInfoObjectHandler.getControlInformation(oFirstSubSection.getId());
				oFirstSubSection.getBlocks().concat(oFirstSubSection.getMoreBlocks())
					.reduce(function(accBlock, currentBlock) {
						if (!currentBlock.getContent || !currentBlock.getContent() || !currentBlock.getContent().length) {
							return accBlock;
						}
						currentBlock.getContent().reduce(function(accContent, currentContent) {
							if (controlHelper.isSmartForm(currentContent)) {
								accContent.push(currentContent); // collect all SubSections SmartForms
							}
							return accContent;
						}, accBlock);
						return accBlock;
					}, [])
					.forEach(function(entry) {
						if (!oSubSectionInfoObject || (entry.getGroups().length === 1 && entry.getGroups()[0].getTitle && !entry.getGroups()[0].getTitle())) {
							// Case: header is editable. manifest.json, editableHeaderContent=true
							var sInvisibleTextID = `${entry.getId()}-ariaLabelBy-InvisibleText`,
								oInvisibleText = Element.getElementById(sInvisibleTextID);
							if (!oInvisibleText) {
								var customData = !entry.getCustomData() ? [] : entry.getCustomData().filter(function(entry) {return entry.getKey() === "smartFormAriaLabel";});
								if (customData.length && customData[0].getValue()) {
									oInvisibleText = new InvisibleText({id : sInvisibleTextID, text: customData[0].getValue()}).toStatic();
								}
							}
							if (oInvisibleText) {
								entry._suggestTitleId(oInvisibleText.getId()); // set Section title id that will be used for aria
							}
							return;
						}
					});
			}

			// public instance methods
			return {
				setAsTitleOwner: fnSetAsTitleOwner,
				adjustSubSectionTitle: fnAdjustSubSectionTitle,
				addAccessibleName: fnAddAccessibleName,
				setHeaderSmartFormAriaLabelBy: fnSetHeaderSmartFormAriaLabelBy //
			};
		}

		return BaseObject.extend("sap.suite.ui.generic.template.ObjectPage.controller.SectionTitleHandler", {
			constructor: function(oController, oObjectPage, oTemplateUtils) {
				extend(this, getMethods(oController, oObjectPage, oTemplateUtils));
			}
		});
	});

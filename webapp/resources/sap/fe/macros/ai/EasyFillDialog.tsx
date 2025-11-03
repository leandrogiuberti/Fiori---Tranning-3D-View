import type { EntityType, Property } from "@sap-ux/vocabularies-types";
import Log from "sap/base/Log";
import { and, equal, isEmpty, not } from "sap/fe/base/BindingToolkit";
import type { EnhanceWithUI5, PropertiesOf } from "sap/fe/base/ClassSupport";
import { createReference, defineReference, defineUI5Class, property } from "sap/fe/base/ClassSupport";
import type { Ref } from "sap/fe/base/jsx-runtime/jsx";
import { AILinkNotice } from "sap/fe/controls/easyFilter/AINotice";
import type { FEView } from "sap/fe/core/BaseController";
import type TemplateComponent from "sap/fe/core/TemplateComponent";
import BuildingBlock from "sap/fe/core/buildingBlocks/BuildingBlock";
import type { FieldSideEffectDictionary } from "sap/fe/core/controllerextensions/SideEffects";
import { CollaborationUtils } from "sap/fe/core/controllerextensions/collaboration/CollaborationCommon";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import type { DefinitionPage } from "sap/fe/core/definition/FEDefinition";
import { getLabel, isComputed, isImmutable } from "sap/fe/core/templating/PropertyHelper";
import Field from "sap/fe/macros/Field";
import { resolveTokenValue } from "sap/fe/macros/ai/EasyFilterDataFetcher";
import ValueListHelper, { type ValueListInfo } from "sap/fe/macros/internal/valuehelp/ValueListHelper";
import type { Button$PressEvent } from "sap/m/Button";
import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import FlexBox from "sap/m/FlexBox";
import FlexItemData from "sap/m/FlexItemData";
import FormattedText from "sap/m/FormattedText";
import HBox from "sap/m/HBox";
import IllustratedMessage from "sap/m/IllustratedMessage";
import IllustratedMessageSize from "sap/m/IllustratedMessageSize";
import IllustratedMessageType from "sap/m/IllustratedMessageType";
import MessageStrip from "sap/m/MessageStrip";
import MessageToast from "sap/m/MessageToast";
import OverflowToolbar from "sap/m/OverflowToolbar";
import ScrollContainer from "sap/m/ScrollContainer";
import Text from "sap/m/Text";
import TextArea from "sap/m/TextArea";
import Title from "sap/m/Title";
import ToggleButton from "sap/m/ToggleButton";
import ToolbarSpacer from "sap/m/ToolbarSpacer";
import VBox from "sap/m/VBox";
import { ButtonType, FlexDirection } from "sap/m/library";
import BindingInfo from "sap/ui/base/BindingInfo";
import type UI5Event from "sap/ui/base/Event";
import type { Control$ValidateFieldGroupEvent } from "sap/ui/core/Control";
import InvisibleText from "sap/ui/core/InvisibleText";
import CoreTitle from "sap/ui/core/Title";
import MessageType from "sap/ui/core/message/MessageType";
import ColumnLayout from "sap/ui/layout/form/ColumnLayout";
import Form from "sap/ui/layout/form/Form";
import FormContainer from "sap/ui/layout/form/FormContainer";
import FormElement from "sap/ui/layout/form/FormElement";
import type Context from "sap/ui/model/Context";
import FilterOperator from "sap/ui/model/FilterOperator";
import AnnotationHelper from "sap/ui/model/odata/v4/AnnotationHelper";
import type ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import FESRHelper from "sap/ui/performance/trace/FESRHelper";
import type { FieldMetadata } from "ux/eng/fioriai/reuse/easyfill/EasyFill";

const MAX_LENGTH = 2000;

@defineUI5Class("sap.fe.macros.ai.EasyFillDialog")
export default class EasyFillDialog extends BuildingBlock<
	Dialog,
	{
		enteredText: string;
		isBusy: boolean;
		currentlyEnteredText: string;
		incorrectValues: Record<string, unknown>;
		newValues: Record<string, unknown>;
		hasValues: boolean;
		hasError: boolean;
		hasIncorrectValues: boolean;
		stateType: "Initial" | "NoEntries" | "Error" | "HasEntries";
	}
> {
	@defineReference()
	$reviewArea!: Ref<FlexBox>;

	@defineReference()
	$scrollContainer!: Ref<FlexBox>;

	@property({ type: "Function" })
	getEditableFields?: Function;

	private _bindingContext?: Context;

	constructor(idOrProps: string | PropertiesOf<EasyFillDialog>, props?: PropertiesOf<EasyFillDialog>) {
		super(idOrProps, props);
	}

	onMetadataAvailable(_ownerComponent: TemplateComponent): void {
		super.onMetadataAvailable(_ownerComponent);
		this.state.newValues = {};
		this.state.hasValues = false;
		this.state.hasError = false;
		this.state.stateType = "Initial";
		this.content = this.createContent();
	}

	async onConfirm(_e: Button$PressEvent): Promise<void> {
		// Validate the data handling
		const mainPageBindingContext = this.getPageController().getView()?.getBindingContext();
		const allProps = [];
		const newValues = this._bindingContext?.getObject() ?? this.state.newValues;
		for (const newValuesKey in newValues) {
			if (newValuesKey !== "__bindingInfo" && !newValuesKey.startsWith("@$")) {
				if (typeof newValues[newValuesKey] !== "object") {
					mainPageBindingContext?.setProperty(newValuesKey, newValues[newValuesKey]);
					allProps.push(
						this.applyUpdatesForChange(this.getPageController().getView(), mainPageBindingContext.getPath(newValuesKey))
					);
				}
			}
		}
		try {
			await Promise.all(allProps);
			mainPageBindingContext.refresh();
		} catch (err) {
			Log.error("Failed to update data after change:" + err);
		}
		// Close nonetheless
		this.content?.close();
	}

	async applyUpdatesForChange(view: FEView, propertyPathForUpdate: string): Promise<void> {
		const metaModel = view.getModel().getMetaModel();
		const metaContext = metaModel.getMetaContext(propertyPathForUpdate);
		const dataModelObject = MetaModelConverter.getInvolvedDataModelObjects<Property>(metaContext);
		const targetContext = view.getBindingContext();
		try {
			const sideEffectsPromises: Promise<unknown>[] = [];
			const sideEffectsService = CollaborationUtils.getAppComponent(view).getSideEffectsService();

			// We have a target context, so we can retrieve the updated property
			const targetMetaPath = metaModel.getMetaPath(targetContext.getPath());
			const relativeMetaPathForUpdate = metaModel.getMetaPath(propertyPathForUpdate).replace(targetMetaPath, "").slice(1);
			sideEffectsPromises.push(sideEffectsService.requestSideEffects([relativeMetaPathForUpdate], targetContext, "$auto"));

			// Get the fieldGroupIds corresponding to pathForUpdate
			const fieldGroupIds = sideEffectsService.computeFieldGroupIds(
				dataModelObject.targetEntityType.fullyQualifiedName,
				dataModelObject.targetObject!.fullyQualifiedName
			);

			// Execute the side effects for the fieldGroupIds
			if (fieldGroupIds.length) {
				const pageController = view.getController();
				const sideEffectsMapForFieldGroup = pageController._sideEffects.getSideEffectsMapForFieldGroups(
					fieldGroupIds,
					targetContext
				) as FieldSideEffectDictionary;
				Object.keys(sideEffectsMapForFieldGroup).forEach((sideEffectName) => {
					const sideEffect = sideEffectsMapForFieldGroup[sideEffectName];
					sideEffectsPromises.push(
						pageController._sideEffects.requestSideEffects(sideEffect.sideEffects, sideEffect.context, "$auto", undefined, true)
					);
				});
			}

			await Promise.all(sideEffectsPromises);
		} catch (err) {
			Log.error("Failed to update data after change:" + err);
			throw err;
		}
	}

	onCancel(): void {
		this.content?.close();
	}

	open(): void {
		this.content?.open();
	}

	_getFieldMapping(definitionPage: DefinitionPage | undefined): FieldMetadata {
		const fieldMapping: FieldMetadata = {};
		if (definitionPage) {
			const pageTarget = definitionPage.getMetaPath().getTarget();
			let entityType: EntityType | undefined;
			switch (pageTarget._type) {
				case "EntitySet":
				case "Singleton":
					entityType = pageTarget.entityType;
					break;
				case "NavigationProperty":
					entityType = pageTarget.targetType;
					break;
			}

			if (entityType !== undefined) {
				for (const entityProperty of entityType.entityProperties) {
					if (
						!isImmutable(entityProperty) &&
						!isComputed(entityProperty) &&
						entityProperty.annotations.UI?.Hidden?.valueOf() !== true &&
						!entityProperty.targetType
					) {
						// If not immutable, computed or hidden, or a complex type add to the field mapping
						fieldMapping[entityProperty.name] = {
							description: getLabel(entityProperty) ?? entityProperty.name,
							dataType: entityProperty.type
						};
					}
				}
			}
		}
		return fieldMapping;
	}

	private generateListBinding(path: string, model: ODataModel): ODataListBinding {
		const transientListBinding = model.bindList(
			path,
			undefined,

			[],
			[],
			{
				$$updateGroupId: "submitLater"
			}
		);
		transientListBinding.refreshInternal = (): void => {
			/* */
		};
		return transientListBinding;
	}

	private onThumbPress(thumbUpButton: ToggleButton, thumbDownButton: ToggleButton): void {
		thumbUpButton.setEnabled(false);
		thumbDownButton.setEnabled(false);
		MessageToast.show(this.getTranslatedText("C_EASYEDIT_FEEDBACK_SENT"));
	}

	formatRemainingCharacters(value: string): string {
		return this.getTranslatedText("C_EASYEDIT_REMAINING_CHARACTERS", [MAX_LENGTH - (value?.length ?? 0)]);
	}

	onClearAll(): void {
		this.state.newValues = {};
		this.state.hasValues = false;
		this.state.hasIncorrectValues = false;
		this.state.enteredText = "";
		this.state.hasError = false;
		this.state.stateType = "Initial";
		this.state.currentlyEnteredText = "";
		this.state.incorrectValues = {};
	}

	onValidateFieldGroups(_e?: Control$ValidateFieldGroupEvent): void {
		const allFields = (this.$reviewArea.current?.getControlsByFieldGroupId("EasyFillField") as EnhanceWithUI5<Field>[]) ?? [];
		this.state.hasError = allFields.some((field: EnhanceWithUI5<Field>): boolean => {
			return (
				!!field.data("messageId") ||
				(!!(field as { getValueState?: Function }).getValueState &&
					(field as { getValueState?: Function }).getValueState?.() === "Error")
			);
		});
	}

	onFieldChange(ev: UI5Event<{}, Field>): void {
		ev.getSource().removeMessage(ev.getSource().data("messageId"));
		ev.getSource().data("messageId", undefined);
	}

	async onEasyEditPressed(): Promise<void> {
		// Call the AI service
		// Process through chat completion API
		const metaPath = this.getOwnerPageDefinition();
		const fieldMapping = this._getFieldMapping(metaPath);
		const easyFillLibrary = await import("ux/eng/fioriai/reuse/easyfill/EasyFill");
		const odataModel = this.getModel() as ODataModel;
		const transientListBinding = this.generateListBinding(
			odataModel.getMetaModel().getMetaPath(this.getPageController().getView()?.getBindingContext()?.getPath()),
			this.getModel() as ODataModel
		);
		this._bindingContext = transientListBinding.create({}, true);

		this.state.isBusy = true;
		try {
			const aiCallResult = await easyFillLibrary.extractFieldValuesFromText(this.state.enteredText, fieldMapping);
			this.state.isBusy = false;
			if (aiCallResult.success) {
				const updatedFields = aiCallResult.data;
				if (Object.keys(updatedFields).length === 0) {
					this.state.hasValues = false;
					this.state.hasIncorrectValues = false;
					this.state.stateType = "NoEntries";
					return;
				}
				this.state.stateType = "HasEntries";
				this.state.hasError = false;
				const editableFields = (await this.getEditableFields?.()) ?? {};
				this.state.hasValues = false;
				this.state.hasIncorrectValues = false;
				this.$scrollContainer.current?.destroy();

				const reviewAreaForm = (
					<Form editable={true} class={"sapUiSmallMarginTopBottom"} visible={this.bindState("hasValues")}>
						{{
							layout: <ColumnLayout columnsM={2} columnsL={2} columnsXL={2} labelCellsLarge={1} emptyCellsLarge={1} />
						}}
					</Form>
				) as Form;
				const incorrectValuesForm = (
					<Form editable={false} class={"sapUiSmallMarginTopBottom"} visible={this.bindState("hasIncorrectValues")}>
						{{
							layout: <ColumnLayout columnsM={2} columnsL={2} columnsXL={2} labelCellsLarge={1} emptyCellsLarge={1} />
						}}
					</Form>
				);
				const warningMessage = (
					<MessageStrip
						text={this.getTranslatedText("C_EASYEDIT_DIALOG_WARNING_MSG")}
						type={"Warning"}
						showIcon={true}
						visible={this.bindState("hasIncorrectValues")}
					></MessageStrip>
				);
				const thumbUpButton = (
					<ToggleButton
						icon={"sap-icon://thumb-up"}
						tooltip={this.getTranslatedText("C_EASYEDIT_THUMBS_UP")}
						type={"Transparent"}
						press={(): void => {
							return this.onThumbPress(thumbUpButton, thumbDownButton);
						}}
					/>
				);
				FESRHelper.setSemanticStepname(thumbUpButton, "press", "fe4:ef:thumbUp");
				const thumbDownButton = (
					<ToggleButton
						icon={"sap-icon://thumb-down"}
						tooltip={this.getTranslatedText("C_EASYEDIT_THUMBS_DOWN")}
						type={"Transparent"}
						press={(): void => {
							return this.onThumbPress(thumbUpButton, thumbDownButton);
						}}
					/>
				);
				FESRHelper.setSemanticStepname(thumbDownButton, "press", "fe4:ef:thumbDown");
				const aiNoticeText = (
					<HBox alignItems={"Center"} visible={equal(this.bindState("stateType"), "HasEntries")}>
						<AILinkNotice />
						<Text text={this.getTranslatedText("C_EASYEDIT_AI_NOTICE_TEXT")} class={"sapUiTinyMarginBegin"} />
						{thumbUpButton}, {thumbDownButton}
					</HBox>
				);
				const previousValuesFormContainer = (
					<FormContainer>{{ title: <CoreTitle text={this.getTranslatedText("C_EASYEDIT_PREVIOUS_VALUES")} /> }}</FormContainer>
				) as FormContainer;
				const previousValuesFormContainer2 = (
					<FormContainer>{{ title: <CoreTitle text={this.getTranslatedText("C_EASYEDIT_PREVIOUS_VALUES")} /> }}</FormContainer>
				) as FormContainer;
				const newValuesFormContainer = (
					<FormContainer>{{ title: <CoreTitle text={this.getTranslatedText("C_EASYEDIT_NEW_VALUES")} /> }}</FormContainer>
				) as FormContainer;
				const newValuesFormContainer2 = (
					<FormContainer>{{ title: <CoreTitle text={this.getTranslatedText("C_EASYEDIT_NEW_VALUES")} /> }}</FormContainer>
				) as FormContainer;
				const uiContext = this.getPageController().getModel("ui")?.createBindingContext("/easyEditDialog");

				this.getPageController().getModel("ui").setProperty("/easyEditDialog", {});
				uiContext.setProperty("isEditable", true);
				newValuesFormContainer.setBindingContext(uiContext, "ui");

				reviewAreaForm.addFormContainer(previousValuesFormContainer);
				reviewAreaForm.addFormContainer(newValuesFormContainer);
				incorrectValuesForm.addFormContainer(previousValuesFormContainer2);
				incorrectValuesForm.addFormContainer(newValuesFormContainer2);
				const newValues: Record<string, unknown> = {};
				const incorrectValues: Record<string, unknown> = {};
				newValuesFormContainer.setBindingContext(this._bindingContext);
				newValuesFormContainer2.setBindingContext(this.getModel("$componentState")?.createBindingContext("/incorrectValues"));
				newValuesFormContainer2.setModel(this.getModel("$componentState"));

				const $vBox = createReference<VBox>();
				this.$reviewArea.current?.addItem(
					<ScrollContainer ref={this.$scrollContainer} vertical={true} class={"sapUiContentPadding"}>
						{{
							content: (
								<VBox ref={$vBox}>
									{{
										items: [
											<HBox>
												{{ layoutData: <FlexItemData alignSelf="End" /> }}
												{aiNoticeText}
											</HBox>,
											<Title
												text={this.getTranslatedText("C_EASYEDIT_FILLED_FIELDS")}
												visible={this.bindState("hasValues")}
											/>,
											reviewAreaForm,
											<Title
												text={this.getTranslatedText("C_EASYEDIT_INCORRECT_FIELDS")}
												class={"sapUiSmallMarginTopBottom"}
												visible={this.bindState("hasIncorrectValues")}
											/>,
											warningMessage,
											incorrectValuesForm
										]
									}}
								</VBox>
							)
						}}
					</ScrollContainer>
				);

				for (const updatedField in updatedFields) {
					if (editableFields[updatedField] && editableFields[updatedField].isEditable === true) {
						this.state.hasValues = true;
						previousValuesFormContainer.addFormElement(
							<FormElement label={fieldMapping[updatedField].description}>
								<Field
									metaPath={updatedField}
									contextPath={this.getOwnerContextPath()}
									readOnly={true}
									required={false}
									visible={true}
								/>
							</FormElement>
						);

						const newField = this._getOwner()?.runAsOwner(() => {
							return (
								<Field
									_requiresValidation={true}
									validateFieldGroup={this.onValidateFieldGroups.bind(this)}
									fieldGroupIds={"EasyFillField"}
									metaPath={updatedField}
									contextPath={this.getOwnerContextPath()}
									change={this.onFieldChange.bind(this)}
								/>
							) as Field;
						}) as EnhanceWithUI5<Field>;
						newValuesFormContainer.addFormElement(
							<FormElement label={fieldMapping[updatedField].description}>{{ fields: newField }}</FormElement>
						);
						const metaModel = this.getMetaModel()!;
						const targetMetaPath = metaModel.getMetaPath(this._bindingContext.getPath(updatedField));
						const metaModelObj = metaModel.getObject(targetMetaPath);
						const valueExpression = AnnotationHelper.format(metaModelObj, {
							context: metaModel.createBindingContext(targetMetaPath)!
						});
						const parsedBinding = BindingInfo.parse(valueExpression);
						let errorMessage = "";
						if (parsedBinding && parsedBinding.type) {
							try {
								parsedBinding.type.validateValue(updatedFields[updatedField]);
							} catch (e) {
								this.state.hasError = true;
								errorMessage = (e as Error).message;
							}
						}

						// Fetch the value list for the given property path
						const valueList = await this._getValueList(targetMetaPath);

						// Initialize a flag to track validation errors
						let hasVHError = false;

						// Check if the value list is searchable and validate the updated field values
						if (valueList && ValueListHelper.isValueListSearchable(targetMetaPath, valueList)) {
							const values = await resolveTokenValue(
								valueList,
								{
									operator: FilterOperator.EQ,
									selectedValues: [updatedFields[updatedField] as string]
								},
								true
							);

							// Update the field value if it differs from the resolved value
							if (!values[0].noMatch) {
								updatedFields[updatedField] = values[0].selectedValues[0].value;
								errorMessage = "";
							} else {
								this.state.hasError = true;
								hasVHError = true;
								errorMessage = this.getTranslatedText("C_EASYEDIT_VH_ERROR", values[0].selectedValues[0].value);
							}
						}

						// Use a timeout to ensure validation runs correctly for the updated field
						setTimeout((): void => {
							newField.setValue(updatedFields[updatedField] as string);
							if (errorMessage.length > 0 || hasVHError) {
								const messageId = newField.addMessage({ type: MessageType.Error, message: errorMessage });
								newField.data("messageId", messageId);
							}
						}, 200);
					} else {
						incorrectValues[updatedField] = updatedFields[updatedField];
						this.state.hasIncorrectValues = true;
						previousValuesFormContainer2.addFormElement(
							<FormElement label={fieldMapping[updatedField]?.description ?? updatedField}>
								<Field
									metaPath={updatedField}
									contextPath={this.getOwnerContextPath()}
									readOnly={true}
									required={false}
									visible={true}
								/>
							</FormElement>
						);
						newValuesFormContainer2.addFormElement(
							<FormElement label={fieldMapping[updatedField]?.description ?? updatedField}>
								<Field metaPath={updatedField} contextPath={this.getOwnerContextPath()} readOnly={true} />
							</FormElement>
						);
					}
				}

				$vBox.current?.setBindingContext(this.getPageController().getView()?.getBindingContext());
				$vBox.current?.setModel(this.getPageController().getModel());
				$vBox.current?.setModel(this.getPageController().getModel("ui"), "ui");
				setTimeout((): void => {
					this.onValidateFieldGroups();
				}, 1000);

				this.state.newValues = newValues;
				this.state.incorrectValues = incorrectValues;
			} else {
				this.state.hasValues = false;
				this.state.hasIncorrectValues = false;
				this.state.stateType = "Error";
				this.state.newValues = {};
				this.state.incorrectValues = {};
			}
		} catch (e) {
			this.state.isBusy = false;
			this.state.hasValues = false;
			this.state.hasIncorrectValues = false;
			this.state.stateType = "Error";
			this.state.newValues = {};
			this.state.incorrectValues = {};
		}
	}

	createContent(): Dialog {
		const easyEditDescription = <InvisibleText text={this.getTranslatedText("C_EASYEDIT_DIALOG_DESCRIPTION")} />;

		const $easyFillButton = createReference<Button>();
		const $easyFillSaveButton = createReference<Button>();
		const $easyFillCancelButton = createReference<Button>();
		const $easyFillClearAllButton = createReference<Button>();
		const dialog = (
			<Dialog
				title={this.getTranslatedText("C_EASYEDIT_DIALOG_TITLE")}
				resizable={true}
				horizontalScrolling={false}
				verticalScrolling={false}
				contentWidth="1100px"
				contentHeight={"800px"}
				escapeHandler={(): void => {
					this.onCancel();
				}}
				afterClose={(): void => {
					this.destroy();
				}}
			>
				{{
					content: (
						<FlexBox direction={FlexDirection.Row} renderType={"Bare"} width={"100%"} height={"100%"}>
							<FlexBox
								width={"40%"}
								id={this.createId("inputArea")}
								direction={FlexDirection.Column}
								class={"sapUiContentPadding"}
								renderType={"Bare"}
							>
								<FormattedText
									htmlText={this.getTranslatedText("C_EASYEDIT_DIALOG_DESCRIPTION")}
									class={"sapUiTinyMarginBottom"}
								/>
								{easyEditDescription}
								<TextArea
									value={this.bindState("enteredText")}
									class={"sapUiTinyMarginBottom"}
									liveChange={(e): void => {
										this.state.currentlyEnteredText = e.getParameter("value") ?? "";
									}}
									width="100%"
									placeholder={this.getTranslatedText("C_EASYEDIT_TEXTAREA_PLACEHOLDER")}
									rows={20}
									growing={true}
									growingMaxLines={30}
									maxLength={MAX_LENGTH}
									ariaLabelledBy={easyEditDescription}
								/>
								<Text
									class={"sapUiTinyMarginBottom"}
									text={{
										path: "/currentlyEnteredText",
										model: "$componentState",
										formatter: this.formatRemainingCharacters.bind(this)
									}}
								>
									{{ layoutData: <FlexItemData alignSelf="End" /> }}
								</Text>
								<HBox>
									{{ layoutData: <FlexItemData alignSelf="End" /> }}
									<Button
										text={this.getTranslatedText("C_EASYEDIT_BUTTON")}
										icon={"sap-icon://ai"}
										enabled={not(isEmpty(this.bindState("currentlyEnteredText")))}
										press={this.onEasyEditPressed.bind(this)}
										ref={$easyFillButton}
										class={"sapUiSmallMarginEnd"}
									></Button>
									<Button
										text={this.getTranslatedText("C_EASYEDIT_DIALOG_CLEAR_ALL")}
										type={ButtonType.Transparent}
										press={this.onClearAll.bind(this)}
										ref={$easyFillClearAllButton}
									></Button>
								</HBox>
							</FlexBox>
							<FlexBox
								id={this.createId("reviewArea")}
								ref={this.$reviewArea}
								width={"60%"}
								renderType={"Bare"}
								busy={this.bindState("isBusy")}
								direction={FlexDirection.Column}
								class={"sapFeEasyFillReviewArea"}
							>
								<IllustratedMessage
									illustrationType={IllustratedMessageType.NoSearchResults}
									illustrationSize={IllustratedMessageSize.Large}
									title={this.getTranslatedText("C_EASYEDIT_DIALOG_REVIEW_TITLE")}
									description={this.getTranslatedText("C_EASYEDIT_DIALOG_REVIEW_DESCRIPTION")}
									visible={equal(this.bindState("stateType"), "Initial")}
								/>
								<IllustratedMessage
									illustrationType={IllustratedMessageType.NoEntries}
									illustrationSize={IllustratedMessageSize.Large}
									title={this.getTranslatedText("C_EASYEDIT_DIALOG_NO_ENTRIES_TITLE")}
									description={this.getTranslatedText("C_EASYEDIT_DIALOG_NO_ENTRIES_DESCRIPTION")}
									visible={equal(this.bindState("stateType"), "NoEntries")}
								/>
								<IllustratedMessage
									illustrationType={IllustratedMessageType.UnableToLoad}
									illustrationSize={IllustratedMessageSize.Large}
									title={this.getTranslatedText("C_EASYEDIT_DIALOG_ERROR_TITLE")}
									description={this.getTranslatedText("C_EASYEDIT_DIALOG_ERROR_DESCRIPTION")}
									visible={equal(this.bindState("stateType"), "Error")}
								/>
							</FlexBox>
						</FlexBox>
					),
					footer: (
						<OverflowToolbar>
							<ToolbarSpacer />
							<Button
								text={this.getTranslatedText("C_EASYEDIT_DIALOG_SAVE")}
								type="Emphasized"
								enabled={and(this.bindState("hasValues"), not(this.bindState("hasError")))}
								press={this.onConfirm.bind(this)}
								ref={$easyFillSaveButton}
							/>
							<Button
								text={this.getTranslatedText("C_EASYEDIT_DIALOG_CANCEL")}
								type="Transparent"
								press={this.onCancel.bind(this)}
								ref={$easyFillCancelButton}
							/>
						</OverflowToolbar>
					)
				}}
			</Dialog>
		);
		FESRHelper.setSemanticStepname($easyFillButton.current!, "press", "fai:ef:analyzeText");
		FESRHelper.setSemanticStepname($easyFillSaveButton.current!, "press", "fai:ef:save");
		FESRHelper.setSemanticStepname($easyFillCancelButton.current!, "press", "fai:ef:cancel");
		FESRHelper.setSemanticStepname($easyFillClearAllButton.current!, "press", "fai:ef:clearAll");
		return dialog;
	}

	async _getValueList(propertyPath: string): Promise<ValueListInfo | undefined> {
		const metaModel = this.getMetaModel()!;
		const valueLists = await ValueListHelper.getValueListInfo(undefined, propertyPath, undefined, metaModel);
		return valueLists[0];
	}
}

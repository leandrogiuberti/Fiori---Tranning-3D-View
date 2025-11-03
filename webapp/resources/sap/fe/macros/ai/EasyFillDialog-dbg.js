/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/base/BindingToolkit", "sap/fe/base/ClassSupport", "sap/fe/controls/easyFilter/AINotice", "sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/controllerextensions/collaboration/CollaborationCommon", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/templating/PropertyHelper", "sap/fe/macros/Field", "sap/fe/macros/ai/EasyFilterDataFetcher", "sap/fe/macros/internal/valuehelp/ValueListHelper", "sap/m/Button", "sap/m/Dialog", "sap/m/FlexBox", "sap/m/FlexItemData", "sap/m/FormattedText", "sap/m/HBox", "sap/m/IllustratedMessage", "sap/m/IllustratedMessageSize", "sap/m/IllustratedMessageType", "sap/m/MessageStrip", "sap/m/MessageToast", "sap/m/OverflowToolbar", "sap/m/ScrollContainer", "sap/m/Text", "sap/m/TextArea", "sap/m/Title", "sap/m/ToggleButton", "sap/m/ToolbarSpacer", "sap/m/VBox", "sap/m/library", "sap/ui/base/BindingInfo", "sap/ui/core/InvisibleText", "sap/ui/core/Title", "sap/ui/core/message/MessageType", "sap/ui/layout/form/ColumnLayout", "sap/ui/layout/form/Form", "sap/ui/layout/form/FormContainer", "sap/ui/layout/form/FormElement", "sap/ui/model/FilterOperator", "sap/ui/model/odata/v4/AnnotationHelper", "sap/ui/performance/trace/FESRHelper", "sap/fe/base/jsx-runtime/jsx", "sap/fe/base/jsx-runtime/jsxs"], function (Log, BindingToolkit, ClassSupport, AINotice, BuildingBlock, CollaborationCommon, MetaModelConverter, PropertyHelper, Field, EasyFilterDataFetcher, ValueListHelper, Button, Dialog, FlexBox, FlexItemData, FormattedText, HBox, IllustratedMessage, IllustratedMessageSize, IllustratedMessageType, MessageStrip, MessageToast, OverflowToolbar, ScrollContainer, Text, TextArea, Title, ToggleButton, ToolbarSpacer, VBox, library, BindingInfo, InvisibleText, CoreTitle, MessageType, ColumnLayout, Form, FormContainer, FormElement, FilterOperator, AnnotationHelper, FESRHelper, _jsx, _jsxs) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;
  function __ui5_require_async(path) {
    return new Promise((resolve, reject) => {
      sap.ui.require([path], module => {
        if (!(module && module.__esModule)) {
          module = module === null || !(typeof module === "object" && path.endsWith("/library")) ? {
            default: module
          } : module;
          Object.defineProperty(module, "__esModule", {
            value: true
          });
        }
        resolve(module);
      }, err => {
        reject(err);
      });
    });
  }
  var _exports = {};
  var FlexDirection = library.FlexDirection;
  var ButtonType = library.ButtonType;
  var resolveTokenValue = EasyFilterDataFetcher.resolveTokenValue;
  var isImmutable = PropertyHelper.isImmutable;
  var isComputed = PropertyHelper.isComputed;
  var getLabel = PropertyHelper.getLabel;
  var CollaborationUtils = CollaborationCommon.CollaborationUtils;
  var AILinkNotice = AINotice.AILinkNotice;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var defineReference = ClassSupport.defineReference;
  var createReference = ClassSupport.createReference;
  var not = BindingToolkit.not;
  var isEmpty = BindingToolkit.isEmpty;
  var equal = BindingToolkit.equal;
  var and = BindingToolkit.and;
  function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
  function _inheritsLoose(t, o) { t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o); }
  function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
  function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
  function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
  const MAX_LENGTH = 2000;
  let EasyFillDialog = (_dec = defineUI5Class("sap.fe.macros.ai.EasyFillDialog"), _dec2 = defineReference(), _dec3 = defineReference(), _dec4 = property({
    type: "Function"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlock) {
    function EasyFillDialog(idOrProps, props) {
      var _this;
      _this = _BuildingBlock.call(this, idOrProps, props) || this;
      _initializerDefineProperty(_this, "$reviewArea", _descriptor, _this);
      _initializerDefineProperty(_this, "$scrollContainer", _descriptor2, _this);
      _initializerDefineProperty(_this, "getEditableFields", _descriptor3, _this);
      return _this;
    }
    _exports = EasyFillDialog;
    _inheritsLoose(EasyFillDialog, _BuildingBlock);
    var _proto = EasyFillDialog.prototype;
    _proto.onMetadataAvailable = function onMetadataAvailable(_ownerComponent) {
      _BuildingBlock.prototype.onMetadataAvailable.call(this, _ownerComponent);
      this.state.newValues = {};
      this.state.hasValues = false;
      this.state.hasError = false;
      this.state.stateType = "Initial";
      this.content = this.createContent();
    };
    _proto.onConfirm = async function onConfirm(_e) {
      // Validate the data handling
      const mainPageBindingContext = this.getPageController().getView()?.getBindingContext();
      const allProps = [];
      const newValues = this._bindingContext?.getObject() ?? this.state.newValues;
      for (const newValuesKey in newValues) {
        if (newValuesKey !== "__bindingInfo" && !newValuesKey.startsWith("@$")) {
          if (typeof newValues[newValuesKey] !== "object") {
            mainPageBindingContext?.setProperty(newValuesKey, newValues[newValuesKey]);
            allProps.push(this.applyUpdatesForChange(this.getPageController().getView(), mainPageBindingContext.getPath(newValuesKey)));
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
    };
    _proto.applyUpdatesForChange = async function applyUpdatesForChange(view, propertyPathForUpdate) {
      const metaModel = view.getModel().getMetaModel();
      const metaContext = metaModel.getMetaContext(propertyPathForUpdate);
      const dataModelObject = MetaModelConverter.getInvolvedDataModelObjects(metaContext);
      const targetContext = view.getBindingContext();
      try {
        const sideEffectsPromises = [];
        const sideEffectsService = CollaborationUtils.getAppComponent(view).getSideEffectsService();

        // We have a target context, so we can retrieve the updated property
        const targetMetaPath = metaModel.getMetaPath(targetContext.getPath());
        const relativeMetaPathForUpdate = metaModel.getMetaPath(propertyPathForUpdate).replace(targetMetaPath, "").slice(1);
        sideEffectsPromises.push(sideEffectsService.requestSideEffects([relativeMetaPathForUpdate], targetContext, "$auto"));

        // Get the fieldGroupIds corresponding to pathForUpdate
        const fieldGroupIds = sideEffectsService.computeFieldGroupIds(dataModelObject.targetEntityType.fullyQualifiedName, dataModelObject.targetObject.fullyQualifiedName);

        // Execute the side effects for the fieldGroupIds
        if (fieldGroupIds.length) {
          const pageController = view.getController();
          const sideEffectsMapForFieldGroup = pageController._sideEffects.getSideEffectsMapForFieldGroups(fieldGroupIds, targetContext);
          Object.keys(sideEffectsMapForFieldGroup).forEach(sideEffectName => {
            const sideEffect = sideEffectsMapForFieldGroup[sideEffectName];
            sideEffectsPromises.push(pageController._sideEffects.requestSideEffects(sideEffect.sideEffects, sideEffect.context, "$auto", undefined, true));
          });
        }
        await Promise.all(sideEffectsPromises);
      } catch (err) {
        Log.error("Failed to update data after change:" + err);
        throw err;
      }
    };
    _proto.onCancel = function onCancel() {
      this.content?.close();
    };
    _proto.open = function open() {
      this.content?.open();
    };
    _proto._getFieldMapping = function _getFieldMapping(definitionPage) {
      const fieldMapping = {};
      if (definitionPage) {
        const pageTarget = definitionPage.getMetaPath().getTarget();
        let entityType;
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
            if (!isImmutable(entityProperty) && !isComputed(entityProperty) && entityProperty.annotations.UI?.Hidden?.valueOf() !== true && !entityProperty.targetType) {
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
    };
    _proto.generateListBinding = function generateListBinding(path, model) {
      const transientListBinding = model.bindList(path, undefined, [], [], {
        $$updateGroupId: "submitLater"
      });
      transientListBinding.refreshInternal = () => {
        /* */
      };
      return transientListBinding;
    };
    _proto.onThumbPress = function onThumbPress(thumbUpButton, thumbDownButton) {
      thumbUpButton.setEnabled(false);
      thumbDownButton.setEnabled(false);
      MessageToast.show(this.getTranslatedText("C_EASYEDIT_FEEDBACK_SENT"));
    };
    _proto.formatRemainingCharacters = function formatRemainingCharacters(value) {
      return this.getTranslatedText("C_EASYEDIT_REMAINING_CHARACTERS", [MAX_LENGTH - (value?.length ?? 0)]);
    };
    _proto.onClearAll = function onClearAll() {
      this.state.newValues = {};
      this.state.hasValues = false;
      this.state.hasIncorrectValues = false;
      this.state.enteredText = "";
      this.state.hasError = false;
      this.state.stateType = "Initial";
      this.state.currentlyEnteredText = "";
      this.state.incorrectValues = {};
    };
    _proto.onValidateFieldGroups = function onValidateFieldGroups(_e) {
      const allFields = this.$reviewArea.current?.getControlsByFieldGroupId("EasyFillField") ?? [];
      this.state.hasError = allFields.some(field => {
        return !!field.data("messageId") || !!field.getValueState && field.getValueState?.() === "Error";
      });
    };
    _proto.onFieldChange = function onFieldChange(ev) {
      ev.getSource().removeMessage(ev.getSource().data("messageId"));
      ev.getSource().data("messageId", undefined);
    };
    _proto.onEasyEditPressed = async function onEasyEditPressed() {
      // Call the AI service
      // Process through chat completion API
      const metaPath = this.getOwnerPageDefinition();
      const fieldMapping = this._getFieldMapping(metaPath);
      const easyFillLibrary = await __ui5_require_async("ux/eng/fioriai/reuse/easyfill/EasyFill");
      const odataModel = this.getModel();
      const transientListBinding = this.generateListBinding(odataModel.getMetaModel().getMetaPath(this.getPageController().getView()?.getBindingContext()?.getPath()), this.getModel());
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
          const reviewAreaForm = _jsx(Form, {
            editable: true,
            class: "sapUiSmallMarginTopBottom",
            visible: this.bindState("hasValues"),
            children: {
              layout: _jsx(ColumnLayout, {
                columnsM: 2,
                columnsL: 2,
                columnsXL: 2,
                labelCellsLarge: 1,
                emptyCellsLarge: 1
              })
            }
          });
          const incorrectValuesForm = _jsx(Form, {
            editable: false,
            class: "sapUiSmallMarginTopBottom",
            visible: this.bindState("hasIncorrectValues"),
            children: {
              layout: _jsx(ColumnLayout, {
                columnsM: 2,
                columnsL: 2,
                columnsXL: 2,
                labelCellsLarge: 1,
                emptyCellsLarge: 1
              })
            }
          });
          const warningMessage = _jsx(MessageStrip, {
            text: this.getTranslatedText("C_EASYEDIT_DIALOG_WARNING_MSG"),
            type: "Warning",
            showIcon: true,
            visible: this.bindState("hasIncorrectValues")
          });
          const thumbUpButton = _jsx(ToggleButton, {
            icon: "sap-icon://thumb-up",
            tooltip: this.getTranslatedText("C_EASYEDIT_THUMBS_UP"),
            type: "Transparent",
            press: () => {
              return this.onThumbPress(thumbUpButton, thumbDownButton);
            }
          });
          FESRHelper.setSemanticStepname(thumbUpButton, "press", "fe4:ef:thumbUp");
          const thumbDownButton = _jsx(ToggleButton, {
            icon: "sap-icon://thumb-down",
            tooltip: this.getTranslatedText("C_EASYEDIT_THUMBS_DOWN"),
            type: "Transparent",
            press: () => {
              return this.onThumbPress(thumbUpButton, thumbDownButton);
            }
          });
          FESRHelper.setSemanticStepname(thumbDownButton, "press", "fe4:ef:thumbDown");
          const aiNoticeText = _jsxs(HBox, {
            alignItems: "Center",
            visible: equal(this.bindState("stateType"), "HasEntries"),
            children: [_jsx(AILinkNotice, {}), _jsx(Text, {
              text: this.getTranslatedText("C_EASYEDIT_AI_NOTICE_TEXT"),
              class: "sapUiTinyMarginBegin"
            }), thumbUpButton, ", ", thumbDownButton]
          });
          const previousValuesFormContainer = _jsx(FormContainer, {
            children: {
              title: _jsx(CoreTitle, {
                text: this.getTranslatedText("C_EASYEDIT_PREVIOUS_VALUES")
              })
            }
          });
          const previousValuesFormContainer2 = _jsx(FormContainer, {
            children: {
              title: _jsx(CoreTitle, {
                text: this.getTranslatedText("C_EASYEDIT_PREVIOUS_VALUES")
              })
            }
          });
          const newValuesFormContainer = _jsx(FormContainer, {
            children: {
              title: _jsx(CoreTitle, {
                text: this.getTranslatedText("C_EASYEDIT_NEW_VALUES")
              })
            }
          });
          const newValuesFormContainer2 = _jsx(FormContainer, {
            children: {
              title: _jsx(CoreTitle, {
                text: this.getTranslatedText("C_EASYEDIT_NEW_VALUES")
              })
            }
          });
          const uiContext = this.getPageController().getModel("ui")?.createBindingContext("/easyEditDialog");
          this.getPageController().getModel("ui").setProperty("/easyEditDialog", {});
          uiContext.setProperty("isEditable", true);
          newValuesFormContainer.setBindingContext(uiContext, "ui");
          reviewAreaForm.addFormContainer(previousValuesFormContainer);
          reviewAreaForm.addFormContainer(newValuesFormContainer);
          incorrectValuesForm.addFormContainer(previousValuesFormContainer2);
          incorrectValuesForm.addFormContainer(newValuesFormContainer2);
          const newValues = {};
          const incorrectValues = {};
          newValuesFormContainer.setBindingContext(this._bindingContext);
          newValuesFormContainer2.setBindingContext(this.getModel("$componentState")?.createBindingContext("/incorrectValues"));
          newValuesFormContainer2.setModel(this.getModel("$componentState"));
          const $vBox = createReference();
          this.$reviewArea.current?.addItem(_jsx(ScrollContainer, {
            ref: this.$scrollContainer,
            vertical: true,
            class: "sapUiContentPadding",
            children: {
              content: _jsx(VBox, {
                ref: $vBox,
                children: {
                  items: [_jsxs(HBox, {
                    children: [{
                      layoutData: _jsx(FlexItemData, {
                        alignSelf: "End"
                      })
                    }, aiNoticeText]
                  }), _jsx(Title, {
                    text: this.getTranslatedText("C_EASYEDIT_FILLED_FIELDS"),
                    visible: this.bindState("hasValues")
                  }), reviewAreaForm, _jsx(Title, {
                    text: this.getTranslatedText("C_EASYEDIT_INCORRECT_FIELDS"),
                    class: "sapUiSmallMarginTopBottom",
                    visible: this.bindState("hasIncorrectValues")
                  }), warningMessage, incorrectValuesForm]
                }
              })
            }
          }));
          for (const updatedField in updatedFields) {
            if (editableFields[updatedField] && editableFields[updatedField].isEditable === true) {
              this.state.hasValues = true;
              previousValuesFormContainer.addFormElement(_jsx(FormElement, {
                label: fieldMapping[updatedField].description,
                children: _jsx(Field, {
                  metaPath: updatedField,
                  contextPath: this.getOwnerContextPath(),
                  readOnly: true,
                  required: false,
                  visible: true
                })
              }));
              const newField = this._getOwner()?.runAsOwner(() => {
                return _jsx(Field, {
                  _requiresValidation: true,
                  validateFieldGroup: this.onValidateFieldGroups.bind(this),
                  fieldGroupIds: "EasyFillField",
                  metaPath: updatedField,
                  contextPath: this.getOwnerContextPath(),
                  change: this.onFieldChange.bind(this)
                });
              });
              newValuesFormContainer.addFormElement(_jsx(FormElement, {
                label: fieldMapping[updatedField].description,
                children: {
                  fields: newField
                }
              }));
              const metaModel = this.getMetaModel();
              const targetMetaPath = metaModel.getMetaPath(this._bindingContext.getPath(updatedField));
              const metaModelObj = metaModel.getObject(targetMetaPath);
              const valueExpression = AnnotationHelper.format(metaModelObj, {
                context: metaModel.createBindingContext(targetMetaPath)
              });
              const parsedBinding = BindingInfo.parse(valueExpression);
              let errorMessage = "";
              if (parsedBinding && parsedBinding.type) {
                try {
                  parsedBinding.type.validateValue(updatedFields[updatedField]);
                } catch (e) {
                  this.state.hasError = true;
                  errorMessage = e.message;
                }
              }

              // Fetch the value list for the given property path
              const valueList = await this._getValueList(targetMetaPath);

              // Initialize a flag to track validation errors
              let hasVHError = false;

              // Check if the value list is searchable and validate the updated field values
              if (valueList && ValueListHelper.isValueListSearchable(targetMetaPath, valueList)) {
                const values = await resolveTokenValue(valueList, {
                  operator: FilterOperator.EQ,
                  selectedValues: [updatedFields[updatedField]]
                }, true);

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
              setTimeout(() => {
                newField.setValue(updatedFields[updatedField]);
                if (errorMessage.length > 0 || hasVHError) {
                  const messageId = newField.addMessage({
                    type: MessageType.Error,
                    message: errorMessage
                  });
                  newField.data("messageId", messageId);
                }
              }, 200);
            } else {
              incorrectValues[updatedField] = updatedFields[updatedField];
              this.state.hasIncorrectValues = true;
              previousValuesFormContainer2.addFormElement(_jsx(FormElement, {
                label: fieldMapping[updatedField]?.description ?? updatedField,
                children: _jsx(Field, {
                  metaPath: updatedField,
                  contextPath: this.getOwnerContextPath(),
                  readOnly: true,
                  required: false,
                  visible: true
                })
              }));
              newValuesFormContainer2.addFormElement(_jsx(FormElement, {
                label: fieldMapping[updatedField]?.description ?? updatedField,
                children: _jsx(Field, {
                  metaPath: updatedField,
                  contextPath: this.getOwnerContextPath(),
                  readOnly: true
                })
              }));
            }
          }
          $vBox.current?.setBindingContext(this.getPageController().getView()?.getBindingContext());
          $vBox.current?.setModel(this.getPageController().getModel());
          $vBox.current?.setModel(this.getPageController().getModel("ui"), "ui");
          setTimeout(() => {
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
    };
    _proto.createContent = function createContent() {
      const easyEditDescription = _jsx(InvisibleText, {
        text: this.getTranslatedText("C_EASYEDIT_DIALOG_DESCRIPTION")
      });
      const $easyFillButton = createReference();
      const $easyFillSaveButton = createReference();
      const $easyFillCancelButton = createReference();
      const $easyFillClearAllButton = createReference();
      const dialog = _jsx(Dialog, {
        title: this.getTranslatedText("C_EASYEDIT_DIALOG_TITLE"),
        resizable: true,
        horizontalScrolling: false,
        verticalScrolling: false,
        contentWidth: "1100px",
        contentHeight: "800px",
        escapeHandler: () => {
          this.onCancel();
        },
        afterClose: () => {
          this.destroy();
        },
        children: {
          content: _jsxs(FlexBox, {
            direction: FlexDirection.Row,
            renderType: "Bare",
            width: "100%",
            height: "100%",
            children: [_jsxs(FlexBox, {
              width: "40%",
              id: this.createId("inputArea"),
              direction: FlexDirection.Column,
              class: "sapUiContentPadding",
              renderType: "Bare",
              children: [_jsx(FormattedText, {
                htmlText: this.getTranslatedText("C_EASYEDIT_DIALOG_DESCRIPTION"),
                class: "sapUiTinyMarginBottom"
              }), easyEditDescription, _jsx(TextArea, {
                value: this.bindState("enteredText"),
                class: "sapUiTinyMarginBottom",
                liveChange: e => {
                  this.state.currentlyEnteredText = e.getParameter("value") ?? "";
                },
                width: "100%",
                placeholder: this.getTranslatedText("C_EASYEDIT_TEXTAREA_PLACEHOLDER"),
                rows: 20,
                growing: true,
                growingMaxLines: 30,
                maxLength: MAX_LENGTH,
                ariaLabelledBy: easyEditDescription
              }), _jsx(Text, {
                class: "sapUiTinyMarginBottom",
                text: {
                  path: "/currentlyEnteredText",
                  model: "$componentState",
                  formatter: this.formatRemainingCharacters.bind(this)
                },
                children: {
                  layoutData: _jsx(FlexItemData, {
                    alignSelf: "End"
                  })
                }
              }), _jsxs(HBox, {
                children: [{
                  layoutData: _jsx(FlexItemData, {
                    alignSelf: "End"
                  })
                }, _jsx(Button, {
                  text: this.getTranslatedText("C_EASYEDIT_BUTTON"),
                  icon: "sap-icon://ai",
                  enabled: not(isEmpty(this.bindState("currentlyEnteredText"))),
                  press: this.onEasyEditPressed.bind(this),
                  ref: $easyFillButton,
                  class: "sapUiSmallMarginEnd"
                }), _jsx(Button, {
                  text: this.getTranslatedText("C_EASYEDIT_DIALOG_CLEAR_ALL"),
                  type: ButtonType.Transparent,
                  press: this.onClearAll.bind(this),
                  ref: $easyFillClearAllButton
                })]
              })]
            }), _jsxs(FlexBox, {
              id: this.createId("reviewArea"),
              ref: this.$reviewArea,
              width: "60%",
              renderType: "Bare",
              busy: this.bindState("isBusy"),
              direction: FlexDirection.Column,
              class: "sapFeEasyFillReviewArea",
              children: [_jsx(IllustratedMessage, {
                illustrationType: IllustratedMessageType.NoSearchResults,
                illustrationSize: IllustratedMessageSize.Large,
                title: this.getTranslatedText("C_EASYEDIT_DIALOG_REVIEW_TITLE"),
                description: this.getTranslatedText("C_EASYEDIT_DIALOG_REVIEW_DESCRIPTION"),
                visible: equal(this.bindState("stateType"), "Initial")
              }), _jsx(IllustratedMessage, {
                illustrationType: IllustratedMessageType.NoEntries,
                illustrationSize: IllustratedMessageSize.Large,
                title: this.getTranslatedText("C_EASYEDIT_DIALOG_NO_ENTRIES_TITLE"),
                description: this.getTranslatedText("C_EASYEDIT_DIALOG_NO_ENTRIES_DESCRIPTION"),
                visible: equal(this.bindState("stateType"), "NoEntries")
              }), _jsx(IllustratedMessage, {
                illustrationType: IllustratedMessageType.UnableToLoad,
                illustrationSize: IllustratedMessageSize.Large,
                title: this.getTranslatedText("C_EASYEDIT_DIALOG_ERROR_TITLE"),
                description: this.getTranslatedText("C_EASYEDIT_DIALOG_ERROR_DESCRIPTION"),
                visible: equal(this.bindState("stateType"), "Error")
              })]
            })]
          }),
          footer: _jsxs(OverflowToolbar, {
            children: [_jsx(ToolbarSpacer, {}), _jsx(Button, {
              text: this.getTranslatedText("C_EASYEDIT_DIALOG_SAVE"),
              type: "Emphasized",
              enabled: and(this.bindState("hasValues"), not(this.bindState("hasError"))),
              press: this.onConfirm.bind(this),
              ref: $easyFillSaveButton
            }), _jsx(Button, {
              text: this.getTranslatedText("C_EASYEDIT_DIALOG_CANCEL"),
              type: "Transparent",
              press: this.onCancel.bind(this),
              ref: $easyFillCancelButton
            })]
          })
        }
      });
      FESRHelper.setSemanticStepname($easyFillButton.current, "press", "fai:ef:analyzeText");
      FESRHelper.setSemanticStepname($easyFillSaveButton.current, "press", "fai:ef:save");
      FESRHelper.setSemanticStepname($easyFillCancelButton.current, "press", "fai:ef:cancel");
      FESRHelper.setSemanticStepname($easyFillClearAllButton.current, "press", "fai:ef:clearAll");
      return dialog;
    };
    _proto._getValueList = async function _getValueList(propertyPath) {
      const metaModel = this.getMetaModel();
      const valueLists = await ValueListHelper.getValueListInfo(undefined, propertyPath, undefined, metaModel);
      return valueLists[0];
    };
    return EasyFillDialog;
  }(BuildingBlock), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "$reviewArea", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "$scrollContainer", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "getEditableFields", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _class2)) || _class);
  _exports = EasyFillDialog;
  return _exports;
}, false);
//# sourceMappingURL=EasyFillDialog-dbg.js.map

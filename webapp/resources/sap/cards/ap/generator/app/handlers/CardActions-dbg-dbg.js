/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
"use strict";

sap.ui.define(["sap/ui/core/library", "sap/ui/model/Filter", "../../helpers/FooterActions", "../../helpers/IntegrationCardHelper", "../../helpers/Transpiler", "../../utils/CommonUtils"], function (sap_ui_core_library, Filter, ____helpers_FooterActions, ____helpers_IntegrationCardHelper, ____helpers_Transpiler, ____utils_CommonUtils) {
  "use strict";

  const _iteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator")) : "@@iterator";
  function _settle(pact, state, value) {
    if (!pact.s) {
      if (value instanceof _Pact) {
        if (value.s) {
          if (state & 1) {
            state = value.s;
          }
          value = value.v;
        } else {
          value.o = _settle.bind(null, pact, state);
          return;
        }
      }
      if (value && value.then) {
        value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
        return;
      }
      pact.s = state;
      pact.v = value;
      const observer = pact.o;
      if (observer) {
        observer(pact);
      }
    }
  }
  const _Pact = /*#__PURE__*/function () {
    function _Pact() {}
    _Pact.prototype.then = function (onFulfilled, onRejected) {
      const result = new _Pact();
      const state = this.s;
      if (state) {
        const callback = state & 1 ? onFulfilled : onRejected;
        if (callback) {
          try {
            _settle(result, 1, callback(this.v));
          } catch (e) {
            _settle(result, 2, e);
          }
          return result;
        } else {
          return this;
        }
      }
      this.o = function (_this) {
        try {
          const value = _this.v;
          if (_this.s & 1) {
            _settle(result, 1, onFulfilled ? onFulfilled(value) : value);
          } else if (onRejected) {
            _settle(result, 1, onRejected(value));
          } else {
            _settle(result, 2, value);
          }
        } catch (e) {
          _settle(result, 2, e);
        }
      };
      return result;
    };
    return _Pact;
  }();
  function _isSettledPact(thenable) {
    return thenable instanceof _Pact && thenable.s & 1;
  }
  function _forTo(array, body, check) {
    var i = -1,
      pact,
      reject;
    function _cycle(result) {
      try {
        while (++i < array.length && (!check || !check())) {
          result = body(i);
          if (result && result.then) {
            if (_isSettledPact(result)) {
              result = result.v;
            } else {
              result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
              return;
            }
          }
        }
        if (pact) {
          _settle(pact, 1, result);
        } else {
          pact = result;
        }
      } catch (e) {
        _settle(pact || (pact = new _Pact()), 2, e);
      }
    }
    _cycle();
    return pact;
  }
  /**
   * Handles the change event for the title of an added action in the ComboBox control.
   *
   * @param {Event} oEvent - The event object triggered by the title change action.
   */
  const onAddedActionTitleChange = function (oEvent) {
    try {
      function _temp3() {
        renderCardPreview(manifest, model);
        transpileIntegrationCardToAdaptive(model);
      }
      const model = getDialogModel();
      const control = oEvent.getSource();
      const path = control?.getBindingContext()?.getPath();
      const manifest = getCurrentCardManifest();
      if (validateSelectedAction(control)) {
        const addedAction = model.getProperty(path);
        addedAction.titleKey = control.getSelectedKey();
        addedAction.title = control.getValue();
        addedAction.isStyleControlEnabled = true;
        updateRelativeproperties(addedAction, path || "");
        control.setValueState(ValueState.None);
      } else {
        if (control.getValue() === "" && control.getSelectedKey() === "") {
          control.setValueState(ValueState.None);
        } else {
          control.setValueState(ValueState.Error);
          control.setValueStateText(getTranslatedText("GENERATOR_ACTION_ERROR_TEXT"));
          const errorControls = model.getProperty("/configuration/errorControls");
          if (errorControls && !errorControls.includes(control)) {
            errorControls.push(control);
          }
        }
        control.focus();
      }
      resetCardActions(manifest);
      const addedActions = model.getProperty("/configuration/actions/addedActions");
      const _temp2 = _forOf(addedActions, function (action) {
        const _temp = function () {
          if (action.titleKey) {
            return Promise.resolve(addActionToCardManifest(manifest, action)).then(function () {});
          }
        }();
        if (_temp && _temp.then) return _temp.then(function () {});
      });
      return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(_temp3) : _temp3(_temp2));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Handles the change event for the style of an added action in the ComboBox control.
   *
   * @param {Event} oEvent - The event object triggered by the style change action.
   */
  function _forOf(target, body, check) {
    if (typeof target[_iteratorSymbol] === "function") {
      var iterator = target[_iteratorSymbol](),
        step,
        pact,
        reject;
      function _cycle(result) {
        try {
          while (!(step = iterator.next()).done && (!check || !check())) {
            result = body(step.value);
            if (result && result.then) {
              if (_isSettledPact(result)) {
                result = result.v;
              } else {
                result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
                return;
              }
            }
          }
          if (pact) {
            _settle(pact, 1, result);
          } else {
            pact = result;
          }
        } catch (e) {
          _settle(pact || (pact = new _Pact()), 2, e);
        }
      }
      _cycle();
      if (iterator.return) {
        var _fixup = function (value) {
          try {
            if (!step.done) {
              iterator.return();
            }
          } catch (e) {}
          return value;
        };
        if (pact && pact.then) {
          return pact.then(_fixup, function (e) {
            throw _fixup(e);
          });
        }
        _fixup();
      }
      return pact;
    }
    // No support for Symbol.iterator
    if (!("length" in target)) {
      throw new TypeError("Object is not iterable");
    }
    // Handle live collections properly
    var values = [];
    for (var i = 0; i < target.length; i++) {
      values.push(target[i]);
    }
    return _forTo(values, function (i) {
      return body(values[i]);
    }, check);
  }
  const ValueState = sap_ui_core_library["ValueState"];
  const addActionToCardManifest = ____helpers_FooterActions["addActionToCardManifest"];
  const removeActionFromManifest = ____helpers_FooterActions["removeActionFromManifest"];
  const resetCardActions = ____helpers_FooterActions["resetCardActions"];
  const updateCardManifestAction = ____helpers_FooterActions["updateCardManifestAction"];
  const getCurrentCardManifest = ____helpers_IntegrationCardHelper["getCurrentCardManifest"];
  const renderCardPreview = ____helpers_IntegrationCardHelper["renderCardPreview"];
  const transpileIntegrationCardToAdaptive = ____helpers_Transpiler["transpileIntegrationCardToAdaptive"];
  const getDialogModel = ____utils_CommonUtils["getDialogModel"];
  /**
   *
   * Handles the click event for adding a new action to the card.
   *
   */
  function onActionAddClick() {
    const model = getDialogModel();
    const addedActions = model.getProperty("/configuration/actions/addedActions");
    if (addedActions.length < 2) {
      addedActions.push({
        title: "",
        titleKey: "",
        style: "Default",
        enablePathKey: "",
        isStyleControlEnabled: false,
        isConfirmationRequired: false
      });
      model.setProperty("/configuration/actions/addedActions", addedActions);
      model.setProperty("/configuration/isEdited", true);
    }
    model.setProperty("/configuration/actions/isAddActionEnabled", addedActions.length < 2);
  }

  /**
   * Handles the delete event for removing an added action from the card.
   *
   * @param {Event} oEvent - The event object triggered by the delete action.
   */
  function onAddedActionDelete(oEvent) {
    const model = getDialogModel();
    const control = oEvent?.getSource();
    const path = control?.getBindingContext()?.getPath();
    const inputListControl = control.getParent()?.getParent();
    const innerControls = inputListControl?.findAggregatedObjects(true);
    const comboBox = innerControls?.find(control => control.getMetadata().getName() === "sap.m.ComboBox");
    comboBox?.setValueState(ValueState.None);
    if (comboBox) {
      const errorControls = model.getProperty("/configuration/errorControls") ?? [];
      const updatedErrorControls = errorControls.filter(control => control !== comboBox);
      model.setProperty("/configuration/errorControls", updatedErrorControls);
    }
    const actionIndex = Number(path?.split("/configuration/actions/addedActions/")[1]);
    const addedActions = model.getProperty("/configuration/actions/addedActions");
    const deletedAction = actionIndex !== undefined ? addedActions.splice(actionIndex, 1) : [];
    model.setProperty("/configuration/actions/addedActions", addedActions);
    model.setProperty("/configuration/actions/isAddActionEnabled", addedActions.length < 2);
    model.setProperty("/configuration/isEdited", true);
    const manifest = getCurrentCardManifest();
    removeActionFromManifest(manifest, deletedAction[0]);
    renderCardPreview(manifest, model);
    transpileIntegrationCardToAdaptive(model);
  }

  /**
   * Validates the selected action in the ComboBox control.
   *
   * @param {ComboBox} control - The ComboBox control containing the selected action.
   * @returns {boolean} true if the selected action is valid, false otherwise.
   */
  function validateSelectedAction(control) {
    const model = getDialogModel();
    const annotationActions = model.getProperty("/configuration/actions/annotationActions");
    return annotationActions.some(annotationAction => {
      return annotationAction.label === control.getValue() && annotationAction.action === control.getSelectedKey();
    });
  }

  /**
   * Updates the relative properties of an added action based on the annotation actions.
   *
   *
   * @param {ControlProperties} addedAction - The added action to be updated.
   * @param {string} path - The path in the model where the added action is stored.
   */
  function updateRelativeproperties(addedAction, path) {
    const model = getDialogModel();
    const annotationActions = model.getProperty("/configuration/actions/annotationActions");
    const relatedAnnotationAction = annotationActions.filter(annotationAction => {
      return annotationAction.label === addedAction.title && annotationAction.action === addedAction.titleKey;
    });
    if (relatedAnnotationAction.length) {
      let enabledPath = relatedAnnotationAction[0].enablePath;
      enabledPath = enabledPath?.indexOf("_it/") > -1 ? enabledPath?.replace("_it/", "") : enabledPath; // Remove instance of _it/ from the path
      const isConfirmationRequired = relatedAnnotationAction[0].isConfirmationRequired;
      if (enabledPath) {
        addedAction.enablePathKey = enabledPath;
      }
      if (isConfirmationRequired) {
        addedAction.isConfirmationRequired = isConfirmationRequired;
      }
    }
    if (path) {
      model.setProperty(path, addedAction);
    }
  }

  /**
   * Filters the available card actions in the ComboBox control based on the added actions.
   *
   * @param {ComboBox} comboBox - The ComboBox control containing the available actions.
   */
  function filterCardActions(comboBox) {
    const dialogModel = getDialogModel();
    const addedActions = dialogModel.getProperty("/configuration/actions/addedActions");
    const itemsBinding = comboBox.getBinding("items");
    const titleKey = comboBox.getSelectedKey();
    const actionToFilter = addedActions.filter(addedAction => addedAction.titleKey !== titleKey);
    const filter = actionToFilter.length ? new Filter("action", "NE", actionToFilter[0].titleKey) : [];
    itemsBinding.filter(filter);
  }

  /**
   * Loads the available actions into the ComboBox control and sets up filtering.
   *
   * @param {Event} controlEvent - The event object triggered by the control action.
   */
  function loadActions(controlEvent) {
    const comboBox = controlEvent.getSource();
    const itemsBinding = comboBox.getBinding("items");
    if (itemsBinding?.isSuspended()) {
      itemsBinding.refresh(true);
      itemsBinding.resume();
    }
    comboBox.addEventDelegate({
      onBeforeRendering: filterCardActions.bind(null, comboBox)
    });
  }
  function onAddedActionStyleChange(oEvent) {
    const model = getDialogModel();
    const control = oEvent.getSource();
    const path = control?.getBindingContext()?.getPath();
    const addedAction = model.getProperty(path);
    addedAction.style = control.getSelectedKey();
    model.setProperty(path, addedAction);
    const manifest = getCurrentCardManifest();
    updateCardManifestAction(manifest, addedAction);
    renderCardPreview(manifest, model);
    transpileIntegrationCardToAdaptive(model);
  }

  /**
   * Retrieves the translated text for the given key from the i18n model.
   *
   * @param {string} key - The key for which the translated text is to be retrieved.
   * @returns {string} The translated text corresponding to the provided key.
   */
  function getTranslatedText(key) {
    return getDialogModel("i18n").getObject(key);
  }
  var __exports = {
    __esModule: true
  };
  __exports.filterCardActions = filterCardActions;
  __exports.loadActions = loadActions;
  __exports.onActionAddClick = onActionAddClick;
  __exports.onAddedActionDelete = onAddedActionDelete;
  __exports.onAddedActionStyleChange = onAddedActionStyleChange;
  __exports.onAddedActionTitleChange = onAddedActionTitleChange;
  return __exports;
});
//# sourceMappingURL=CardActions-dbg-dbg.js.map

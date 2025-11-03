/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/dnd/DragDropInfo", "sap/ui/core/Element", "sap/ui/core/Lib", "sap/ui/core/library", "./utils/DragDropUtils"], function (DragDropInfo, Element, Lib, sap_ui_core_library, ___utils_DragDropUtils) {
  "use strict";

  const dnd = sap_ui_core_library["dnd"];
  const attachKeyboardHandler = ___utils_DragDropUtils["attachKeyboardHandler"];
  /**
   *
   * Abstract base class for panels inside My Home Settings Dialog.
   *
   * @extends sap.ui.core.Element
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.121
   *
   * @abstract
   * @private
   * @ui5-restricted ux.eng.s4producthomes1
   *
   * @alias sap.cux.home.BaseSettingsPanel
   */
  const BaseSettingsPanel = Element.extend("sap.cux.home.BaseSettingsPanel", {
    metadata: {
      library: "sap.cux.home",
      properties: {
        /**
         * Key of the settings panel.
         */
        key: {
          type: "string",
          group: "Misc",
          defaultValue: "",
          visibility: "hidden"
        },
        /**
         * Title of the settings panel.
         */
        title: {
          type: "string",
          group: "Misc",
          defaultValue: "",
          visibility: "hidden"
        },
        /**
         * Icon of the settings panel.
         */
        icon: {
          type: "sap.ui.core.URI",
          group: "Misc",
          defaultValue: "",
          visibility: "hidden"
        },
        /**
         * Specifies if header should be shown for the settings panel page.
         */
        showHeader: {
          type: "boolean",
          group: "Misc",
          defaultValue: true,
          visibility: "hidden"
        }
      },
      defaultAggregation: "content",
      aggregations: {
        /**
         * Content aggregation of the settings panel.
         */
        content: {
          type: "sap.ui.core.Control",
          singularName: "content",
          multiple: true,
          visibility: "hidden"
        },
        /**
         * Holds the actions to be shown within the settings panel.
         */
        actionButtons: {
          type: "sap.m.Button",
          multiple: true,
          singularName: "actionButton",
          visibility: "hidden"
        }
      },
      associations: {
        /**
         * Associations of the settings panel.
         * Id of the panel associated with the settings panel to be provided.
         * In case of multiple panels with same Id, the first panel will be associated.
         * If no panel is found with the provided id, the settings panel will not be associated with any panel.
         */
        panel: {
          type: "string"
        }
      },
      events: {
        /**
         * Fired whenever the panel has been navigated to.
         */
        panelNavigated: {
          parameters: {
            context: {
              type: "object"
            }
          }
        },
        /**
         * Fired whenever the associated settings dialog is closed.
         */
        onDialogClose: {}
      }
    },
    /**
     * Constructor for a new Base Settings Panel.
     *
     * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
     * @param {object} [settings] Initial settings for the new control
     */
    constructor: function _constructor(id, settings) {
      Element.prototype.constructor.call(this, id, settings);
      this._keyuserChanges = [];
    },
    /**
     * Init lifecycle method
     *
     * @public
     * @override
     */
    init: function _init() {
      this._i18nBundle = Lib.getResourceBundleFor("sap.cux.home.i18n");
      this._actionButtonsCache = [];
    },
    /**
     * Retrieves the BasePanel or BaseLayout associated with the BaseSettingsPanel.
     *
     * @returns {BasePanel | BaseLayout} The panel or layout associated with the BaseSettingsPanel
     * @private
     */
    _getPanel: function _getPanel() {
      return Element.getElementById(this.getAssociation("panel", null));
    },
    /**
     * Persists the dialog state by setting a property on the parent layout
     * indicating that the settings dialog should be persisted.
     *
     * @private
     */
    _persistDialog: function _persistDialog(dialog) {
      if (!dialog) return;
      const layout = dialog.getParent();
      const keyMap = {
        "sap.cux.home.SettingsDialog": "settingsDialogPersisted",
        "sap.cux.home.ContentAdditionDialog": "contentAdditionDialogPersisted"
      };
      const dialogName = dialog.getMetadata().getName();
      const persistPropertyName = dialogName in keyMap ? keyMap[dialogName] : undefined;
      if (persistPropertyName) {
        layout?.setProperty(persistPropertyName, true, true);
      }
    },
    /**
     * Checks if the dialog is persisted by examining the parent layout's persistence properties.
     *
     * @param {BaseSettingsDialog} dialog - The dialog to check for persistence status
     * @returns {boolean} True if the dialog is persisted (either settings dialog or content addition dialog), false otherwise
     *
     * @private
     */
    _isDialogPersisted: function _isDialogPersisted(dialog) {
      const layout = dialog.getParent();
      if (!layout) return false;
      return layout.getProperty("settingsDialogPersisted") === true || layout.getProperty("contentAdditionDialogPersisted") === true;
    },
    /**
     * Returns the KeyUser Changes made by user.
     *
     * @public
     */
    getKeyUserChanges: function _getKeyUserChanges() {
      return this._keyuserChanges;
    },
    /**
     * Add Changes made by user in case of KeyUser Settings Panel.
     *
     * @public
     */
    addKeyUserChanges: function _addKeyUserChanges(change) {
      this._keyuserChanges.push(change);
    },
    /**
     * Clear all KeyUser Changes made by user.
     *
     * @public
     */
    clearKeyUserChanges: function _clearKeyUserChanges() {
      this._keyuserChanges = [];
    },
    addDragDropConfigTo: function _addDragDropConfigTo(container, dropHandler) {
      container.addDragDropConfig(new DragDropInfo(`${container.getId()}--settingsDragDropConfig`, {
        sourceAggregation: "items",
        targetAggregation: "items",
        dropPosition: dnd.DropPosition.On,
        dropLayout: dnd.DropLayout.Horizontal,
        drop: dropHandler
      })).attachBrowserEvent("keydown", event => {
        const disableNavigation = event.metaKey || event.ctrlKey;
        void attachKeyboardHandler(event, disableNavigation, dragDropEvent => {
          dropHandler(dragDropEvent);
        });
      });
    },
    /**
     * Retrieves the action buttons from the panel.
     *
     * @public
     * @returns {Button[]} array of action buttons.
     */
    getActionButtons: function _getActionButtons() {
      return this._actionButtonsCache.slice();
    },
    /**
     * Adds an action button to the panel.
     *
     * @public
     * @param {Button} button - The button to add.
     * @returns {BaseSettingsPanel} The instance of the panel for chaining.
     */
    addActionButton: function _addActionButton(button) {
      this._actionButtonsCache.push(button);
      this.addAggregation("actionButtons", button);
      return this;
    },
    /**
     * Inserts an action button at a specific index in the panel.
     *
     * @public
     * @param {Button} button - The button to insert.
     * @param {number} index - The index at which to insert the button.
     * @returns {BaseSettingsPanel} The instance of the panel for chaining.
     */
    insertActionButton: function _insertActionButton(button, index) {
      this._actionButtonsCache.splice(index, 0, button);
      this.insertAggregation("actionButtons", button, index);
      return this;
    },
    /**
     * Removes an action button from the panel.
     *
     * @public
     * @param {Button} button - The button to remove.
     * @returns {Button | null} The removed button or null if not found.
     */
    removeActionButton: function _removeActionButton(button) {
      const removedButton = this._actionButtonsCache.splice(this._actionButtonsCache.indexOf(button), 1);
      this.removeAggregation("actionButtons", button);
      return removedButton[0] || null;
    },
    /**
     * Checks if the panel is supported. To be overridden by subclasses.
     *
     * @public
     * @async
     * @returns {Promise<boolean>} A promise that resolves to true if the panel is supported.
     */
    isSupported: function _isSupported() {
      try {
        return Promise.resolve(true);
      } catch (e) {
        return Promise.reject(e);
      }
    }
  });
  return BaseSettingsPanel;
});
//# sourceMappingURL=BaseSettingsPanel-dbg.js.map

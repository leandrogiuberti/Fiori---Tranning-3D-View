/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/m/ActionTile", "sap/m/ActionTileContent", "sap/m/Button", "sap/m/ContentConfig", "sap/m/Link", "sap/m/List", "sap/m/MessageBox", "sap/m/Popover", "sap/m/StandardListItem", "sap/m/TileAttribute", "sap/m/library", "sap/ui/core/format/NumberFormat", "./MenuItem", "./ToDoPanel", "./utils/DecisionDialog", "./utils/Device", "./utils/FESRUtil", "./utils/TaskUtils"], function (Log, ActionTile, ActionTileContent, Button, ContentConfig, Link, List, MessageBox, Popover, StandardListItem, TileAttribute, sap_m_library, NumberFormat, __MenuItem, __ToDoPanel, __DecisionDialog, ___utils_Device, ___utils_FESRUtil, ___utils_TaskUtils) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _catch(body, recover) {
    try {
      var result = body();
    } catch (e) {
      return recover(e);
    }
    if (result && result.then) {
      return result.then(void 0, recover);
    }
    return result;
  }
  const ButtonType = sap_m_library["ButtonType"];
  const ContentConfigType = sap_m_library["ContentConfigType"];
  const LoadState = sap_m_library["LoadState"];
  const PlacementType = sap_m_library["PlacementType"];
  const URLHelper = sap_m_library["URLHelper"];
  const MenuItem = _interopRequireDefault(__MenuItem);
  const ToDoPanel = _interopRequireDefault(__ToDoPanel);
  const DecisionDialog = _interopRequireDefault(__DecisionDialog);
  const getIconFrameBadge = __DecisionDialog["getIconFrameBadge"];
  const getIconFrameBadgeValueState = __DecisionDialog["getIconFrameBadgeValueState"];
  const calculateDeviceType = ___utils_Device["calculateDeviceType"];
  const DeviceType = ___utils_Device["DeviceType"];
  const fetchElementProperties = ___utils_Device["fetchElementProperties"];
  const addFESRId = ___utils_FESRUtil["addFESRId"];
  const addFESRSemanticStepName = ___utils_FESRUtil["addFESRSemanticStepName"];
  const FESR_EVENTS = ___utils_FESRUtil["FESR_EVENTS"];
  const fetchUserDetails = ___utils_TaskUtils["fetchUserDetails"];
  const formatDate = ___utils_TaskUtils["formatDate"];
  const getPriority = ___utils_TaskUtils["getPriority"];
  const getTaskUrl = ___utils_TaskUtils["getTaskUrl"];
  var Format = /*#__PURE__*/function (Format) {
    Format["CURRENCYVALUE"] = "CURRENCYVALUE";
    Format["CURRENCYCODE"] = "CURRENCYCODE";
    Format["USER"] = "USER";
    return Format;
  }(Format || {});
  var TextArrangement = /*#__PURE__*/function (TextArrangement) {
    TextArrangement["TextFirst"] = "TextFirst";
    TextArrangement["TextLast"] = "TextLast";
    TextArrangement["TextOnly"] = "TextOnly";
    TextArrangement["TextSeparate"] = "TextSeparate";
    return TextArrangement;
  }(TextArrangement || {});
  const Constants = {
    GRID_VIEW_MIN_ROWS: 1,
    GRID_VIEW_MAX_ROWS: 2,
    GRID_VIEW_MIN_WIDTH: 304,
    GRID_VIEW_TWO_COL_MIN_WIDTH: 374,
    GRID_VIEW_MAX_WIDTH: 583,
    CARD_HEIGHT: {
      // Cozy - Compact
      1: 220,
      // 214  - 226
      2: 272,
      // 265  - 278
      3: 324,
      // 318  - 330
      4: 376 // 370  - 382
    }
  };

  /**
   * Splits an array of task cards into smaller arrays, each with a maximum specified length.
   *
   * @param {Task[]} cards - The array of task cards to be split.
   * @param {number} maxLength - The maximum length of each sub-array.
   * @returns {Task[][]} - An array of sub-arrays, each containing a maximum of `maxLength` task cards.
   */
  function splitCards(cards, maxLength) {
    const cardSet = [];
    for (let i = 0; i < cards.length; i += maxLength) {
      cardSet.push(cards.slice(i, i + maxLength));
    }
    return cardSet;
  }

  /**
   *
   * Panel class for managing and storing Task cards.
   *
   * @extends ToDoPanel
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.121
   *
   * @private
   * @ui5-restricted ux.eng.s4producthomes1
   *
   * @alias sap.cux.home.TaskPanel
   */
  const TaskPanel = ToDoPanel.extend("sap.cux.home.TaskPanel", {
    metadata: {
      library: "sap.cux.home",
      properties: {
        /**
         * Specifies if actions should be enabled for the task cards.
         *
         * @public
         */
        enableActions: {
          type: "boolean",
          group: "Data",
          defaultValue: false,
          visibility: "public"
        },
        /**
         * Specifies the URL that fetches the custom attributes to be displayed along with the task cards.
         *
         * @public
         */
        customAttributeUrl: {
          type: "string",
          group: "Data",
          defaultValue: "",
          visibility: "public"
        }
      }
    },
    /**
     * Constructor for a new Task Panel.
     *
     * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
     * @param {object} [settings] Initial settings for the new control
     */
    constructor: function _constructor(id, settings) {
      ToDoPanel.prototype.constructor.call(this, id, settings);
    },
    /**
     * Init lifecycle method
     *
     * @private
     * @override
     */
    init: function _init() {
      ToDoPanel.prototype.init.call(this);
      this._customAttributeMap = {};
      this._taskDefinitionMap = {};

      //Configure Header
      this.setProperty("key", "tasks");
      this.setProperty("title", this._i18nBundle.getText("tasksTabTitle"));

      //Setup Menu Items - ensure that 'View All Tasks' item is the first item in the list
      this._viewAllTasksMenuItem = new MenuItem(`${this.getId()}-view-tasks-btn`, {
        title: this._i18nBundle.getText("viewAllTasksTitle"),
        icon: "sap-icon://inbox",
        visible: false,
        press: this._onPressViewAll.bind(this)
      });
      this.insertAggregation("menuItems", this._viewAllTasksMenuItem, 0);
      addFESRId(this._viewAllTasksMenuItem, "goToTaskSitution");

      //Add custom styles
      const [contentWrapper] = this.getContent() || [];
      contentWrapper?.addStyleClass("sapUiGridTaskLayout");
    },
    /**
     * Generates request URLs for fetching data based on the specified card count.
     * Overridden method to provide task-specific URLs.
     *
     * @private
     * @override
     * @param {number} cardCount - The number of cards to retrieve.
     * @returns {string[]} An array of request URLs.
     */
    generateRequestUrls: function _generateRequestUrls(cardCount) {
      const urls = [this.getCountUrl(), `${this.getDataUrl()},CustomAttributeData&$expand=CustomAttributeData&$skip=0&$top=${cardCount}`];
      const customAttributeUrl = this.getCustomAttributeUrl();
      if (customAttributeUrl) {
        urls.push(customAttributeUrl);
      }
      return urls;
    },
    /**
     * Generates a card template for tasks.
     * Overridden method from To-Do panel to generate task-specific card template.
     *
     * @private
     * @override
     * @param {string} id The ID for the template card.
     * @param {Context} context The context object.
     * @returns {Control} The generated card control template.
     */
    generateCardTemplate: function _generateCardTemplate(id, context) {
      const attributes = context.getObject().attributes?.map((attribute, index) => {
        return new TileAttribute(`${id}-${index}-attribute`, {
          label: attribute.label,
          contentConfig: new ContentConfig(`${id}-${index}-contentConfig`, {
            type: attribute.type,
            text: attribute.text,
            href: attribute.href
          })
        });
      });
      return new ActionTile(`${id}-actionTile`, {
        mode: "ActionMode",
        frameType: "TwoByOne",
        pressEnabled: true,
        enableIconFrame: true,
        enableDynamicHeight: true,
        enableNavigationButton: true,
        headerImage: "sap-icon://workflow-tasks",
        badgeIcon: getIconFrameBadge(context.getProperty("Priority")),
        badgeValueState: getIconFrameBadgeValueState(context.getProperty("Priority")),
        header: context.getProperty("TaskTitle"),
        state: context.getProperty("loadState"),
        priority: getPriority(context.getProperty("Priority")),
        priorityText: this._toPriorityText(getPriority(context.getProperty("Priority"))),
        press: event => this._onPressTask(event),
        tileContent: [new ActionTileContent(`${id}-actionTileContent`, {
          headerLink: new Link({
            text: context.getProperty("CreatedByName"),
            press: event => {
              void this._onClickCreatedBy(event);
            }
          }),
          attributes
        })],
        actionButtons: [(() => {
          const viewButton = new Button(`${id}-view-btn`, {
            text: this._i18nBundle.getText("viewButton"),
            press: event => event.getSource().getParent().firePress(),
            visible: context.getProperty("actions/length") === 0
          });
          addFESRSemanticStepName(viewButton, FESR_EVENTS.PRESS, "todoActionViewBtn");
          return viewButton;
        })(), (() => {
          const approveButton = new Button(`${id}-approve-btn`, {
            text: context.getProperty("actions/0/text"),
            type: context.getProperty("actions/0/type"),
            press: () => this._onActionButtonPress(context.getProperty("actions/0/pressHandler")),
            visible: context.getProperty("actions/0") !== undefined
          });
          addFESRSemanticStepName(approveButton, FESR_EVENTS.PRESS, "todoActionBtn");
          return approveButton;
        })(), (() => {
          const rejectButton = new Button(`${id}-reject-btn`, {
            text: context.getProperty("actions/1/text"),
            type: context.getProperty("actions/1/type"),
            press: () => this._onActionButtonPress(context.getProperty("actions/1/pressHandler")),
            visible: context.getProperty("actions/1") !== undefined
          });
          addFESRSemanticStepName(rejectButton, FESR_EVENTS.PRESS, "todoActionBtn");
          return rejectButton;
        })(), (() => {
          const overflowButton = new Button(`${id}-overflow-btn`, {
            icon: "sap-icon://overflow",
            type: ButtonType.Transparent,
            press: event => this._onOverflowButtonPress(event, context),
            visible: context.getProperty("actions/length") >= 3
          });
          addFESRSemanticStepName(overflowButton, FESR_EVENTS.PRESS, "todoActBtnOverflow");
          return overflowButton;
        })()]
      });
    },
    /**
     * Handles the press event of the overflow button.
     * Opens a Popover containing overflow actions.
     *
     * @private
     * @param {Event} event - The press event triggered by the overflow button.
     * @param {Context} context - The context containing all actions.
     * @returns {void}
     */
    _onOverflowButtonPress: function _onOverflowButtonPress(event, context) {
      const overflowButtons = context.getProperty("actions").slice(2);
      this._getOverflowButtonPopover(overflowButtons).openBy(event.getSource());
    },
    /**
     * Creates or retrieves the overflow button Popover.
     *
     * @private
     * @param {ActionButton[]} actionButtons - The array of overflow actions.
     * @returns {Popover} The overflow button Popover.
     */
    _getOverflowButtonPopover: function _getOverflowButtonPopover(actionButtons) {
      if (!this._overflowPopover) {
        this._overflowList = new List(`${this.getId()}-overflowList`);
        this._overflowPopover = new Popover(`${this.getId()}-overflowPopover`, {
          showHeader: false,
          content: this._overflowList,
          placement: PlacementType.VerticalPreferredBottom
        });
      }

      //setup task-specific with task-specific actions
      this._setupOverflowList(actionButtons);
      return this._overflowPopover;
    },
    /**
     * Sets up the overflow button list with the provided task-specific actions.
     *
     * @private
     * @param {ActionButton[]} actionButtons - The array of overflow actions.
     * @returns {void}
     */
    _setupOverflowList: function _setupOverflowList(actionButtons) {
      this._overflowList.destroyItems();
      actionButtons.forEach((actionButton, index) => {
        const listItem = new StandardListItem(`action-${index}`, {
          title: actionButton.text,
          type: "Active",
          press: () => this._onActionButtonPress(actionButton.pressHandler)
        });
        addFESRSemanticStepName(listItem, FESR_EVENTS.PRESS, "todoActionBtn");
        this._overflowList.addItem(listItem);
      });
    },
    /**
     * Handles the button press event and executes the provided press handler function,
     * which refreshes the UI after the button press action.
     *
     * @private
     * @param {Function} pressHandler - The function to be executed when the button is pressed.
     * @returns {void}
     */
    _onActionButtonPress: function _onActionButtonPress(pressHandler) {
      pressHandler(this._loadCards.bind(this));
    },
    /**
     * Retrieves custom attributes for a given task and formats them for display.
     * If the task has completion deadline and creation date, those attributes are also included.
     * If the task has a creator, the creator's name is included as well.
     *
     * @param {Task} task - The task object for which custom attributes are retrieved.
     * @returns {CustomAttribute[]} - An array of formatted custom attributes.
     */
    _getCustomAttributes: function _getCustomAttributes(task) {
      const finalAttributes = [];
      const maximumAttributeCount = 4;
      const customAttributes = this._customAttributeMap[task.TaskDefinitionID] || [];
      for (let custom_attribute of customAttributes) {
        const customAttribute = custom_attribute;
        const taskCustomAttributes = task.CustomAttributeData?.results;
        const existingAttribute = taskCustomAttributes.find(taskAttribute => {
          return taskAttribute.Name === customAttribute.name;
        });
        let value = "";
        if (existingAttribute && !customAttribute.referenced) {
          const attribute = {
            label: customAttribute.label + ":",
            type: ContentConfigType.Text
          };
          if (customAttribute.format) {
            value = this._formatCustomAttribute(customAttribute, taskCustomAttributes);
          } else if (customAttribute.textArrangement) {
            value = this._arrangeText(existingAttribute, customAttribute.textArrangement);
          } else {
            value = customAttribute.type === "Edm.DateTime" ? formatDate(existingAttribute.Value) : existingAttribute.Value;
          }
          attribute.text = value || "-";
          finalAttributes.push(attribute);
        }
      }

      // add common attributes
      this._addCommonAttributes(finalAttributes, task);
      return finalAttributes.slice(0, maximumAttributeCount);
    },
    /**
     * Formats the given unit of measure value and description based on the specified text arrangement.
     *
     * @private
     * @param {TaskCustomAttribute} customAttribute The custom attribute object.
     * @param {TextArrangement} textArrangement The text arrangement option.
     * @returns {string} The formatted value.
     */
    _arrangeText: function _arrangeText(customAttribute, textArrangement) {
      const value = customAttribute.Value.trim();
      const description = customAttribute.ValueText.trim();
      let formattedValue = "";
      switch (textArrangement) {
        case TextArrangement.TextFirst:
          formattedValue = `${description} (${value})`;
          break;
        case TextArrangement.TextLast:
          formattedValue = `${value} (${description})`;
          break;
        case TextArrangement.TextOnly:
          formattedValue = `${description}`;
          break;
        case TextArrangement.TextSeparate:
          formattedValue = `${value}`;
          break;
        default:
          // TextFirst
          formattedValue = `${description} ${value})`;
          break;
      }
      return formattedValue;
    },
    /**
     * Formats a custom attribute value based on its format type.
     *
     * @param {CustomAttribute} customAttribute - The custom attribute object.
     * @param {TaskCustomAttribute[]} taskAttributes - The array of task attributes.
     * @returns {string} - The formatted value.
     */
    _formatCustomAttribute: function _formatCustomAttribute(customAttribute, taskAttributes = []) {
      const findAttribute = attributeName => {
        return taskAttributes.find(oAttribute => {
          return oAttribute.Name === attributeName;
        });
      };
      const format = customAttribute.format?.toUpperCase();
      const currentAttribute = findAttribute(customAttribute.name);
      let formattedValue = currentAttribute?.Value;

      // Format = CurrencyValue
      if (format === Format.CURRENCYVALUE && customAttribute.reference) {
        const referencedAttribute = findAttribute(customAttribute.reference);
        if (referencedAttribute) {
          const currencyFormatter = NumberFormat.getCurrencyInstance();
          formattedValue = currencyFormatter.format(parseFloat(currentAttribute?.Value), referencedAttribute.Value);
        }
      } else if (format === Format.USER) {
        formattedValue = currentAttribute?.FormattedValue || currentAttribute?.Value;
      }
      return formattedValue;
    },
    /**
     * Adds common attributes to the final attributes list based on the provided task.
     * Common attributes include completion deadline, creation date, and creator's name.
     *
     * @param {CustomAttribute[]} finalAttributes - The array of custom attributes to which the common attributes will be added.
     * @param {Task} task - The task object containing data for common attributes.
     */
    _addCommonAttributes: function _addCommonAttributes(finalAttributes, task) {
      if (task.CompletionDeadline) {
        finalAttributes.push({
          label: this._i18nBundle.getText("dueDate") + ":",
          text: formatDate(task.CompletionDeadline, "MMM dd, YYYY hh:mm a"),
          type: ContentConfigType.Text
        });
      }
      if (task.CreatedOn) {
        finalAttributes.push({
          label: this._i18nBundle.getText("createdOn") + ":",
          text: formatDate(task.CreatedOn),
          type: ContentConfigType.Text
        });
      }
    },
    /**
     * Handles the press event of a task.
     *
     * @private
     * @param {Event} event - The press event.
     */
    _onPressTask: function _onPressTask(event) {
      if (this.getTargetAppUrl()) {
        const control = event.getSource();
        const context = control.getBindingContext();
        const loadState = context?.getProperty("loadState");
        const url = getTaskUrl(context?.getProperty("SAP__Origin"), context?.getProperty("InstanceID"), this.getTargetAppUrl());
        if (loadState !== LoadState.Loading) {
          URLHelper.redirect(url, false);
        }
      }
    },
    /**
     * Handles the click event on the "Created By" link.
     * Triggers email or opens a contact card if configuration is enabled
     *
     * @private
     * @param {Event} event - The event object.
     */
    _onClickCreatedBy: function _onClickCreatedBy(event) {
      try {
        const _this = this;
        const sourceControl = event.getSource();
        const {
          SAP__Origin: originId,
          CreatedBy: userId,
          TaskTitle: subject,
          CreatedByName: createdBy,
          InstanceID
        } = event.getSource().getBindingContext()?.getObject();
        const link = getTaskUrl(originId, InstanceID, _this.getTargetAppUrl());
        const triggerEmail = (email, {
          subject,
          body
        }) => {
          URLHelper.triggerEmail(email, subject, body);
        };
        const url = new URL(window.location.href);
        url.hash = link;
        const body = url.toString();
        return Promise.resolve(fetchUserDetails(originId, userId)).then(function (userData) {
          if (userData.Email) {
            sap.ui.require(["sap/suite/ui/commons/collaboration/ServiceContainer"], function (serviceContainer) {
              try {
                return Promise.resolve(serviceContainer.getServiceAsync()).then(function (teamsHelper) {
                  const _temp2 = function () {
                    if (teamsHelper.enableContactsCollaboration) {
                      const _temp = _catch(function () {
                        return Promise.resolve(teamsHelper.enableContactsCollaboration(userData.Email, {
                          subject,
                          body: encodeURIComponent(body)
                        })).then(function (_teamsHelper$enableCo) {
                          const popover = _teamsHelper$enableCo;
                          popover.openBy(sourceControl);
                        });
                      }, function (error) {
                        Log.error(error instanceof Error ? error.message : String(error));
                        triggerEmail(userData.Email, {
                          subject,
                          body
                        });
                      });
                      if (_temp && _temp.then) return _temp.then(function () {});
                    } else {
                      triggerEmail(userData.Email, {
                        subject,
                        body
                      });
                    }
                  }();
                  if (_temp2 && _temp2.then) return _temp2.then(function () {});
                });
              } catch (e) {
                return Promise.reject(e);
              }
            });
          } else {
            MessageBox.warning(_this._i18nBundle.getText("noEmail", [createdBy]));
          }
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Hook for processing data fetched from a batch call.
     * This method can be overridden to perform additional data processing operations.
     * In this implementation, it is consumed to handle task-related data, particularly
     * for extracting custom attributes if action cards are enabled.
     *
     * @private
     * @async
     * @param {unknown[]} results - Data retrieved from the batch call. Structure may vary based on the backend service.
     * @param {RequestOptions} options - Additional options for parsing the data.
     * @returns {Promise<void>} A Promise that resolves when the data processing is complete.
     */
    onDataReceived: function _onDataReceived(results, options) {
      try {
        const _this2 = this;
        const [tasks, taskDefinitions] = results;
        _this2._extractCustomAttributes(taskDefinitions);
        const _temp3 = function () {
          if (!options || options && !options.onlyCount) {
            return Promise.resolve(_this2._updateTasks(tasks)).then(function (updatedTasks) {
              _this2._oData.displayTiles = _this2._oData.tiles = updatedTasks;
            });
          }
        }();
        return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Updates the tasks with attributes and actions.
     *
     * @private
     * @param {Task[]} tasks - The array of tasks to update.
     * @returns {Promise<Task[]>} A promise that resolves with the updated array of tasks.
     */
    _updateTasks: function _updateTasks(tasks = []) {
      try {
        const _this3 = this;
        //add custom attributes to tasks
        let updatedTasks = _this3._addCustomAttributes(tasks);

        //add actions to tasks
        const _temp4 = function () {
          if (_this3.getEnableActions()) {
            //calculate unique task definitions
            const taskDefinitions = _this3._getTaskDefintions(updatedTasks);

            //download decision options for task defintions
            return Promise.resolve(_this3._downloadDecisionOptions(taskDefinitions)).then(function () {
              //append actions
              updatedTasks = _this3._addActions(updatedTasks);
            });
          }
        }();
        return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(function () {
          return updatedTasks;
        }) : updatedTasks);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Adds custom attributes to each task in the provided array.
     *
     * @private
     * @param {Task[]} tasks - The array of tasks to which custom attributes will be added.
     * @returns {Task[]} - A new array of tasks, each with added custom attributes.
     */
    _addCustomAttributes: function _addCustomAttributes(tasks) {
      return tasks.map(task => ({
        ...task,
        attributes: this._getCustomAttributes(task)
      }));
    },
    /**
     * Adds actions to the tasks based on their task definitions.
     *
     * @private
     * @param {Task[]} tasks - The array of tasks to which actions will be added.
     * @returns {Task[]} The array of tasks with actions added.
     */
    _addActions: function _addActions(tasks) {
      return tasks.map(task => {
        const key = task.SAP__Origin + task.TaskDefinitionID;
        return {
          ...task,
          actions: this._taskDefinitionMap[key] ? DecisionDialog.getTaskActions(task, this.getBaseUrl(), this._taskDefinitionMap, this._i18nBundle) : []
        };
      });
    },
    /**
     * Downloads decision options for the provided task definitions.
     *
     * @private
     * @param {Record<string, TaskDefinition>} taskDefinitions - The task definitions for which decision options will be downloaded.
     * @returns {Promise<void>} A promise that resolves when all decision options are downloaded and processed.
     */
    _downloadDecisionOptions: function _downloadDecisionOptions(taskDefinitions) {
      try {
        const _this4 = this;
        const decisionKeys = [];
        const decisionURLs = Object.keys(taskDefinitions).reduce((urls, key) => {
          if (!Object.keys(_this4._taskDefinitionMap).includes(key)) {
            decisionKeys.push(key);
            _this4._taskDefinitionMap[key] = [];
            const {
              SAP__Origin,
              InstanceID
            } = taskDefinitions[key];
            urls.push(`DecisionOptions?SAP__Origin='${SAP__Origin}'&InstanceID='${InstanceID}'`);
          }
          return urls;
        }, []);
        const _temp5 = function () {
          if (decisionURLs.length) {
            _this4._clearRequests();
            _this4.requests.push({
              baseURL: _this4.getBaseUrl(),
              requestURLs: decisionURLs,
              success: results => {
                results.forEach((decisionOptions, index) => {
                  _this4._taskDefinitionMap[decisionKeys[index]] = decisionOptions;
                });
                return Promise.resolve();
              }
            });
            return Promise.resolve(_this4._submitBatch()).then(function () {});
          }
        }();
        return Promise.resolve(_temp5 && _temp5.then ? _temp5.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Retrieves unique task definitions from the provided array of tasks.
     *
     * @private
     * @param {Task[]} tasks - The array of tasks from which to retrieve task definitions.
     * @returns {Record<string, TaskDefintion>} An object containing unique task definitions.
     */
    _getTaskDefintions: function _getTaskDefintions(tasks = []) {
      const taskDefinitions = {};
      tasks.forEach(task => {
        const key = task.SAP__Origin + task.TaskDefinitionID;
        if (!taskDefinitions[key]) {
          taskDefinitions[key] = {
            SAP__Origin: task.SAP__Origin,
            InstanceID: task.InstanceID,
            TaskDefinitionID: task.TaskDefinitionID
          };
        }
      });
      return taskDefinitions;
    },
    /**
     * Extracts Custom Attribute Information to create an attribute map from raw attribute data
     * received from call, which is used while task processing
     *
     * @private
     * @param {TaskDefinitionCollection[]} taskDefinitions - array of raw tasks definitions
     */
    _extractCustomAttributes: function _extractCustomAttributes(taskDefinitions = []) {
      taskDefinitions.forEach(taskDefinition => {
        const customAttributes = taskDefinition.CustomAttributeDefinitionData?.results || [];
        this._customAttributeMap[taskDefinition.TaskDefinitionID] = customAttributes.filter(oAttribute => oAttribute.Rank > 0).sort((attr1, attr2) => attr2.Rank - attr1.Rank).map(oAttribute => ({
          name: oAttribute.Name,
          label: oAttribute.Label,
          type: oAttribute.Type,
          format: oAttribute.Format,
          reference: oAttribute.Reference,
          referenced: oAttribute.Referenced,
          textArrangement: oAttribute.TextArrangement
        }));
      });
    },
    /**
     * Get the text for the "No Data" message.
     *
     * @private
     * @returns {string} The text for the "No Data" message.
     */
    getNoDataText: function _getNoDataText() {
      return this._i18nBundle.getText("noTaskTitle");
    },
    /**
     * Calculates the number of vertical cards that can fit within the available height of the given DOM element.
     *
     * @private
     * @override
     * @param {Element} domRef - The DOM element to calculate the vertical card count for.
     * @returns {number} - The number of vertical cards that can fit within the available height.
     */
    getVerticalCardCount: function _getVerticalCardCount(domRef, calculationProperties) {
      const domProperties = fetchElementProperties(domRef, ["padding-top"]);
      const parentDomProperties = fetchElementProperties(domRef.parentElement, ["height"]);
      const titleHeight = this.calculateTitleHeight();
      const availableHeight = parentDomProperties.height - domProperties["padding-top"] * 2 - titleHeight;
      const horizontalCardCount = this.getHorizontalCardCount(domRef);
      const isPlaceholder = calculationProperties?.isPlaceholder;
      const gap = 16;
      let height = 0;
      let verticalCardCount = 0;
      if (this._isLoaded()) {
        const cardSet = splitCards(this._oData.tiles, horizontalCardCount);
        const rowHeights = cardSet.map(cards => {
          const maxAttributes = cards.reduce(function (attributeCount, card) {
            card.attributes = card.attributes || [];
            return card.attributes.length > attributeCount ? card.attributes.length : attributeCount;
          }, 1);
          let visibleRowCount = Math.min(maxAttributes, 4);
          if (this._isGridLayoutAllowed()) {
            // If grid view is enabled, restrict the card height to 2 rows
            visibleRowCount = visibleRowCount > Constants.GRID_VIEW_MAX_ROWS ? Constants.GRID_VIEW_MAX_ROWS : Constants.GRID_VIEW_MIN_ROWS;
          }
          return Constants.CARD_HEIGHT[visibleRowCount] + gap;
        });
        for (let rowHeight of rowHeights) {
          if (height + rowHeight < availableHeight) {
            height += rowHeight;
            verticalCardCount++;
          } else {
            break;
          }
        }
      } else {
        verticalCardCount = Math.floor(availableHeight / Constants.CARD_HEIGHT[isPlaceholder ? "4" : "1"]);
      }
      return Math.max(verticalCardCount, 2);
    },
    /**
     * Adjusts the layout based on card count and device type.
     *
     * @private
     * @override
     */
    _adjustLayout: function _adjustLayout() {
      ToDoPanel.prototype._adjustLayout.call(this);
      this.setProperty("minCardWidth", this._isGridLayoutAllowed() ? Constants.GRID_VIEW_TWO_COL_MIN_WIDTH : Constants.GRID_VIEW_MIN_WIDTH);
      this.setProperty("maxCardWidth", Constants.GRID_VIEW_MAX_WIDTH);
    },
    /**
     * Determines if grid view is allowed for displaying card content based on the device type.
     *
     * @returns {boolean} `true` if the device type is either Desktop or LargeDesktop, otherwise `false`.
     */
    _isGridLayoutAllowed: function _isGridLayoutAllowed() {
      const deviceType = calculateDeviceType();
      return deviceType === DeviceType.LargeDesktop || deviceType === DeviceType.XLargeDesktop;
    },
    /**
     * Sets the target application URL and updates the visibility of the "View All Tasks" menu item.
     *
     * @param {string} targetAppUrl - The URL of the target application.
     * @returns {this} The current instance of the TaskPanel for method chaining.
     */
    setTargetAppUrl: function _setTargetAppUrl(targetAppUrl) {
      this._viewAllTasksMenuItem.setVisible(!!targetAppUrl);
      this.setProperty("targetAppUrl", targetAppUrl);
      return this;
    }
  });
  return TaskPanel;
});
//# sourceMappingURL=TaskPanel-dbg.js.map

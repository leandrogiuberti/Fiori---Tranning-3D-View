// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "./ContentNodeSelectorRenderer",
    "sap/base/util/deepClone",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/m/Label",
    "sap/m/MultiInput",
    "sap/m/Token",
    "sap/ui/core/Element",
    "sap/ui/core/Fragment",
    "sap/ui/core/Control",
    "sap/ui/Device",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/library",
    "sap/ushell/resources"
], (
    ContentNodeSelectorRenderer,
    deepClone,
    Column,
    ColumnListItem,
    Label,
    MultiInput,
    Token,
    Element,
    Fragment,
    Control,
    Device,
    Filter,
    FilterOperator,
    JSONModel,
    Config,
    Container,
    ushellLibrary,
    ushellResources
) => {
    "use strict";

    // shortcut for sap.ushell.ContentNodeType
    const ContentNodeType = ushellLibrary.ContentNodeType;

    /**
     * @alias sap.ushell.ui.ContentNodeSelector
     * @class
     * @classdesc Constructor for a new Content Node Selector.
     * The Content Node Selector is used for selecting a group or section as a destination for new bookmark tiles.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] Initial settings for the new control
     *
     * @extends sap.ui.core.Control
     *
     * @since 1.81
     *
     * @private
     */
    const ContentNodeSelector = Control.extend("sap.ushell.ui.ContentNodeSelector", /** @lends sap.ushell.ui.ContentNodeSelector.prototype */ {
        metadata: {
            library: "sap.ushell",
            aggregations: {
                content: {
                    type: "sap.m.MultiInput",
                    multiple: false,
                    visibility: "hidden"
                }
            },
            associations: {
                labelId: {
                    type: "sap.ui.core.Control",
                    multiple: false
                }
            },
            events: {
                /**
                 * Is triggered when the user changes their selection. The newly selected content nodes
                 * can be retrieved using {@link sap.ushell.ui.ContentNodeSelector#getSelectedContentNodes}.
                 */
                selectionChanged: {},
                valueHelpEndButtonPressed: {}
            }
        },
        renderer: ContentNodeSelectorRenderer
    });

    ContentNodeSelector.prototype.init = function () {
        this._oModel = new JSONModel({
            items: [],
            suggestions: [],
            isSpaces: Config.last("/core/spaces/enabled")
        });
        this._oDeviceModel = new JSONModel(Device);

        this.setModel(this._oModel, "_internal");
        this.setModel(this._oDeviceModel, "_device");
        this.setModel(ushellResources.i18nModel, "_i18n");

        if (!this.getAggregation("content")) {
            const oMultiInput = this._createMultiInput();
            this.setAggregation("content", oMultiInput);
        }

        this.setBusyIndicatorDelay(0); // TODO: the busy indicator delay should never be changed (this line should be removed)
        this._loadContentNodes()
            .then(this._overwriteLabel.bind(this));
    };

    ContentNodeSelector.prototype._createMultiInput = function () {
        const oMultiInput = new MultiInput({
            ariaLabelledBy: this.getLabelId(),
            valueHelpRequest: this._showValueHelp.bind(this),
            tokenUpdate: this._onTokenUpdate.bind(this),
            required: true,
            suggestionColumns: [
                new Column({
                    header: new Label({
                        text: "{= ${_internal>/isSpaces} ? ${_i18n>contentNodeSelectorPage} : ${_i18n>contentNodeSelectorHomepageGroup}}"
                    })
                }),
                new Column({
                    visible: "{= ${_internal>/isSpaces}}",
                    header: new Label({
                        text: "{_i18n>contentNodeSelectorSpace}"
                    })
                })
            ],
            suggestionRows: {
                path: "_internal>/suggestions",
                template: new ColumnListItem({
                    cells: [
                        new Label({
                            text: "{_internal>label}"
                        }),
                        new Label({
                            visible: "{_internal>/isSpaces}",
                            text: "{= ${_internal>spaceTitles}.join(', ')}"
                        })
                    ]
                }),
                templateShareable: false
            }
        });
        oMultiInput.addValidator(this._validateItem.bind(this));
        return oMultiInput;
    };

    /**
     * Updates the text of the associated labelId to the current mode the user is in.
     * This can be the classic homepage ("groups") or spaces mode ("pages").
     *
     * @private
     */
    ContentNodeSelector.prototype._overwriteLabel = function () {
        const sLabelId = this.getLabelId();
        const oLabel = Element.getElementById(sLabelId);

        if (oLabel && typeof oLabel.setText === "function") {
            if (this._oModel.getProperty("/isSpaces")) {
                oLabel.setText(ushellResources.i18n.getText("contentNodeSelectorHomepagePages"));
            } else {
                oLabel.setText(ushellResources.i18n.getText("contentNodeSelectorHomepageGroups"));
            }
        }

        if (oLabel && typeof oLabel.setRequired === "function" && oLabel.isPropertyInitial("required")) {
            oLabel.setRequired(true);
        }
    };

    ContentNodeSelector.prototype.exit = function () {
        this._oModel.destroy();
        this._oDeviceModel.destroy();
    };

    /**
     * @param {string} sLabelId the label id that should be set.
     * @returns {sap.ushell.ui.ContentNodeSelector} this sap.ushell.ui.ContentNodeSelector, to allow chaining.
     * @private
     */
    ContentNodeSelector.prototype.setLabelId = function (sLabelId) {
        this.setAssociation("labelId", sLabelId);
        this._overwriteLabel();

        const oMultiInput = this.getAggregation("content");
        if (oMultiInput) {
            oMultiInput.addAriaLabelledBy(sLabelId);
        }

        return this;
    };

    /**
     * Returns only the selected content nodes.
     * @returns {object[]} All selected content nodes
     */
    ContentNodeSelector.prototype.getSelectedContentNodes = function () {
        const oMultiInput = this.getAggregation("content");
        const aTokens = oMultiInput.getTokens();

        return aTokens.map((oToken) => {
            const oContentNode = oToken.getBindingContext("_internal").getObject();
            const oContentNodeCopy = deepClone(oContentNode);

            delete oContentNodeCopy.selected;
            delete oContentNodeCopy.spaceTitles;

            return oContentNodeCopy;
        });
    };

    /**
     * Checks whether the admin AND the user have enabled 'MyHome'
     *
     * @returns {Promise<boolean>} Resolves true, if admin adn user the user have enabled 'MyHome'.
     *
     * @private
     * @since 1.107.0
     */
    ContentNodeSelector.prototype._getMyHomeEnablement = function () {
        return new Promise((resolve, reject) => {
            const bMyHomeEnabled = Config.last("/core/spaces/myHome/enabled");
            const bUserMyHome = Container.getUser().getShowMyHome();
            resolve(bMyHomeEnabled && bUserMyHome);
        });
    };
    /**
     * This function assures that only traditional pages which can be personalized are returned.
     * In case a content node shall not be returned because of its type, this node and all of its children get removed from the result.
     * Parent nodes are returned even if they are not of the requested type.
     * @param {ContentNode[]} [aContentNodes] Types of content nodes to be returned. Defaults to all content node types defined in `sap.ushell.ContentNodeType`.
     *
     * @returns {Promise<ContentNode[]>} Resolves content nodes
     *
     * @private
     * @since 1.107.0
     */
    ContentNodeSelector.prototype._filterPersonalizableContentNodes = function (aContentNodes) {
        if (!Array.isArray(aContentNodes)) {
            return [];
        }

        return aContentNodes.reduce((aNodes, oContentNode) => {
            if (this._bShowOnlyMyHome && oContentNode.id !== this._sMyHomeSpaceId && oContentNode.id !== this._sMyHomePageId) {
                return aNodes;
            }
            oContentNode.children = this._filterPersonalizableContentNodes(oContentNode.children);
            if (oContentNode.type === ContentNodeType.HomepageGroup
                || (oContentNode.type === ContentNodeType.Space && oContentNode.children.length)
                || (oContentNode.type === ContentNodeType.Page && oContentNode.isContainer)) {
                aNodes.push(oContentNode);
            }
            return aNodes;
        }, []);
    };

    /**
     * Retrieves the list of content nodes from the sap.ushell Bookmark service and saves them in the _internal model.
     *
     * @returns {Promise<undefined>} A promise that is resolved once the Bookmark service is loaded.
     * @private
     */
    ContentNodeSelector.prototype._loadContentNodes = function () {
        this.setBusy(true);

        return Promise.all([
            Container.getServiceAsync("BookmarkV2"),
            this._getMyHomeEnablement()
        ]).then((aResult) => {
            const oBookmarkService = aResult[0];
            const bMyHomeEnabled = aResult[1];
            const bPersonalizationEnabled = Config.last("/core/shell/enablePersonalization");
            this._bShowOnlyMyHome = !bPersonalizationEnabled && bMyHomeEnabled;
            this._sMyHomeSpaceId = Config.last("/core/spaces/myHome/myHomeSpaceId");
            this._sMyHomePageId = Config.last("/core/spaces/myHome/myHomePageId");

            return oBookmarkService.getContentNodes().then((aContentNodes) => {
                aContentNodes = deepClone(aContentNodes);
                aContentNodes = this._filterPersonalizableContentNodes(aContentNodes);

                ContentNodeSelector._normalizeContentNodes(aContentNodes);
                this._oModel.setProperty("/items", aContentNodes);

                const aSuggestions = ContentNodeSelector._getSuggestions(aContentNodes);

                for (let i = 0; i < aSuggestions.length; i++) {
                    aSuggestions[i].selected = false;
                }

                this._oModel.setProperty("/suggestions", aSuggestions);

                this.setBusy(false);
            });
        });
    };

    /**
     * Creates and displays a value help dialog for selecting a content node.
     *
     * @param {sap.ui.base.Event} event The SAPUI5 event object.
     * @private
     */
    ContentNodeSelector.prototype._showValueHelp = function (event) {
        const oMultiInput = event.getSource();
        const sText = oMultiInput.getValue();

        if (!this._oValueHelpDialog) {
            Fragment.load({
                id: `${this.getId()}-ValueHelpDialog`,
                name: "sap.ushell.ui.ContentNodeSelectorValueHelp",
                controller: this
            }).then((oDialog) => {
                this.addDependent(oDialog);

                this._oValueHelpDialog = oDialog;
                this._openValueHelpDialog(sText);
            });
        } else {
            this._openValueHelpDialog(sText);
        }
    };

    /**
     * Opens the value help dialog and expands the tree control to the first level.
     *
     * @param {string} filterText The text by which the tree should be filtered when the dialog is opened.
     * @private
     */
    ContentNodeSelector.prototype._openValueHelpDialog = function (filterText) {
        const oTree = Fragment.byId(`${this.getId()}-ValueHelpDialog`, "ContentNodesTree");
        oTree.expandToLevel(1);

        this._oValueHelpDialog.open();

        const oSearchInput = Fragment.byId(`${this.getId()}-ValueHelpDialog`, "ContentNodesSearch");
        oSearchInput.setValue(filterText);

        // Also applies another filter
        this._onValueHelpSearch();
    };

    /**
     * Filters the tree control by the value from the search input.
     *
     * @private
     */
    ContentNodeSelector.prototype._onValueHelpSearch = function () {
        const oSearchInput = Fragment.byId(`${this.getId()}-ValueHelpDialog`, "ContentNodesSearch");
        const sFilterText = oSearchInput.getValue();
        const oTree = Fragment.byId(`${this.getId()}-ValueHelpDialog`, "ContentNodesTree");
        const oItemsBinding = oTree.getBinding("items");

        oItemsBinding.filter(new Filter({
            path: "label",
            operator: FilterOperator.Contains,
            value1: sFilterText
        }));
    };

    /**
     * Event handler for the begin button's press event.
     *
     * @private
     */
    ContentNodeSelector.prototype._onValueHelpBeginButtonPressed = function () {
        const oTree = Fragment.byId(`${this.getId()}-ValueHelpDialog`, "ContentNodesTree");

        const aSelectedContextsPaths = oTree.getSelectedContextPaths();

        const oMultiInput = this.getAggregation("content");
        oMultiInput.destroyTokens();

        let oToken;
        let sPath;
        for (let i = 0; i < aSelectedContextsPaths.length; i++) {
            sPath = aSelectedContextsPaths[i];

            const oModel = this.getModel("_internal");
            const iFoundIndex = oMultiInput.getAggregation("tokens")
                .map((oItem) => {
                    return oItem.getProperty("key");
                })
                .indexOf(oModel.getProperty(sPath).id);
            if (iFoundIndex < 0) {
                oToken = this._createToken(sPath);
                oMultiInput.addValidateToken({ token: oToken });
            }
        }

        oMultiInput.setValue("");
        this._oValueHelpDialog.close();
    };

    /**
     * Event handler for the end button's press event.
     *
     * @private
     */
    ContentNodeSelector.prototype._onValueHelpEndButtonPressed = function () {
        this.fireValueHelpEndButtonPressed();
        this._oValueHelpDialog.close();
    };

    /**
     * Event handler for the MultiInput's tokenUpdate event.
     *
     * @param {sap.ui.base.Event} event The SAPUI5 event object.
     * @private
     */
    ContentNodeSelector.prototype._onTokenUpdate = function (event) {
        const aAddedTokens = event.getParameter("addedTokens");
        const aRemovedTokens = event.getParameter("removedTokens");

        this._setTokensSelected(aAddedTokens, true);
        this._setTokensSelected(aRemovedTokens, false);

        // Fire the selectionChanged event asynchronously to wait for the MultiInput's token aggregation to be updated.
        setTimeout(this.fireSelectionChanged.bind(this), 0);
    };

    /**
     * Updates each token's "selected" property in the internal model with the given value.
     *
     * @param {sap.m.Token[]} tokens The updated tokens.
     * @param {boolean} selected The value to be set as the new "selected" property value.
     * @private
     */
    ContentNodeSelector.prototype._setTokensSelected = function (tokens, selected) {
        let oContext;

        for (let i = 0; i < tokens.length; i++) {
            oContext = tokens[i].getBindingContext("_internal");

            oContext.getModel().setProperty(oContext.getPath("selected"), selected);
        }
    };

    /**
     * Validates the selected suggestions and creates a new token for valid space/page combinations or classic homepage.
     *
     * @param {object} item The suggestions containing the text and item object.
     * @returns {sap.m.Token} The new token to be added to the tokens aggregation.
     * @private
     */
    ContentNodeSelector.prototype._validateItem = function (item) {
        if (item.suggestedToken) {
            return item.suggestedToken;
        }

        const oItem = item.suggestionObject;

        if (!oItem) {
            // The user must not add arbitrary text
            return null;
        }

        const oContext = oItem.getBindingContext("_internal");

        return this._createToken(oContext.getPath());
    };

    /**
     * Constructs a new sap.m.Token for the given path and sets its binding context to the given path.
     *
     * @param {string} path The binding path to create the token from.
     * @returns {sap.m.Token} The new sap.m.Token instance.
     * @private
     */
    ContentNodeSelector.prototype._createToken = function (path) {
        const oToken = new Token({
            key: "{_internal>id}",
            text: "{_internal>label}"
        });

        oToken.bindObject({
            path: path,
            model: "_internal"
        });

        return oToken;
    };

    /**
     * Retrieves the flat list of selectable suggestions for the MultiInput control.
     * The suggestions consist of the top-level elements along with their children.
     *
     * @param {object[]} items The list of content nodes from the Bookmark service.
     * @returns {object[]} A flat list of selectable content nodes.
     * @private
     * @static
     */
    ContentNodeSelector._getSuggestions = function (items) {
        const aSuggestions = [];

        ContentNodeSelector._getChildren(items, aSuggestions);

        return aSuggestions;
    };

    /**
     * Recursively looks for child objects and flattens the hierarchy of the given tree into the given aggregator.
     *
     * @param {object[]} items The (sub)tree of items whose children should be extracted.
     * @param {object[]} aggregator A list that receives all nested elements from the given tree.
     * @private
     * @static
     */
    ContentNodeSelector._getChildren = function (items, aggregator) {
        let oItem;

        for (let i = 0; i < items.length; i++) {
            oItem = items[i];

            if (oItem.isContainer && aggregator.indexOf(oItem) === -1) {
                aggregator.push(oItem);
            }

            if (oItem.children) {
                ContentNodeSelector._getChildren(oItem.children, aggregator);
            }
        }
    };

    /**
     * This function looks through each content node, compares if the node already exists,
     * and if so, will replace it with the reference to the already found content node.
     * If not, the reference to the first found node is used.
     *
     * @param {object[]} contentNodes The list of content nodes from the Bookmark service.
     * @private
     * @static
     */
    ContentNodeSelector._normalizeContentNodes = function (contentNodes) {
        const oPages = {};

        ContentNodeSelector._visitPages(contentNodes, (oSpace, oPage) => {
            oPage.spaceTitles = oPage.spaceTitles || [];

            if (oPages[oPage.id]) {
                oPages[oPage.id].spaceTitles.push(oSpace.label);
                return oPages[oPage.id];
            }

            oPage.spaceTitles.push(oSpace.label);
            oPages[oPage.id] = oPage;

            return oPage;
        });
    };

    /**
     * Loops through the given tree structure of Content Nodes and calls the given callback function for each
     * encountered Page. The function receives the current Space object and the current Page object as parameters.
     * The callback must return a page object to be written back to the Content Node tree.
     *
     * @param {object[]} contentNodes The list of content nodes from the Bookmark service.
     * @param {function} callback A callback function for each encountered Page.
     * @private
     * @static
     */
    ContentNodeSelector._visitPages = function (contentNodes, callback) {
        if (contentNodes === undefined || contentNodes === null) {
            return;
        }

        for (let i = 0; i < contentNodes.length; i++) {
            const oContentNode = contentNodes[i];
            if (oContentNode.type !== ContentNodeType.Space) {
                return;
            } if (oContentNode.children) {
                for (let k = 0; k < oContentNode.children.length; k++) {
                    const oPage = oContentNode.children[k];
                    oContentNode.children[k] = callback(oContentNode, oPage);
                }
            }
        }
    };

    /**
     * Clears the selection of underlying multi-input as well as in the model.
     *
     * @public
     *
     * @since 1.86.0
     */
    ContentNodeSelector.prototype.clearSelection = function () {
        const oMultiInput = this.getAggregation("content");
        const aTokens = oMultiInput.getTokens();

        aTokens.forEach((oToken) => {
            const oContentNode = oToken.getBindingContext("_internal");
            this._oModel.setProperty(oContentNode.getPath("selected"), false);
        });

        oMultiInput.destroyTokens();
    };

    /**
     * Sets the valueState of the underlying multi-input.
     *
     * @see sap.ui.core.ValueState
     * @param {sap.ui.core.ValueState} valueState the valueState to be set on the control
     *
     * @public
     *
     * @since 1.86.0
     */
    ContentNodeSelector.prototype.setValueState = function (valueState) {
        const oMultiInput = this.getAggregation("content");
        oMultiInput.setValueState(valueState);
    };

    /**
     * Sets the valueStateText of the underlying multi-input.
     *
     * @param {string} valueStateText the valueStateText to be set on the control
     *
     * @public
     *
     * @since 1.86.0
     */
    ContentNodeSelector.prototype.setValueStateText = function (valueStateText) {
        const oMultiInput = this.getAggregation("content");
        oMultiInput.setValueStateText(valueStateText);
    };

    return ContentNodeSelector;
});

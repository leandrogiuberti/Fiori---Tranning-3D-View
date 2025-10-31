// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @deprecated since 1.119
 * @fileoverview
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Element",
    "sap/ushell/Container"
], (Log, Element, Container) => {
    "use strict";

    function _removeHeaderItem (oItem, sLaunchpadState1, sLaunchpadState2) {
        Container.getRendererInternal("fiori2").hideHeaderItem(oItem.getId(), false, [sLaunchpadState1, sLaunchpadState2]);
    }

    function _addOptionsActionSheetButton (oButton, sLaunchpadState1, sLaunchpadState2) {
        Container.getRendererInternal("fiori2").showActionButton(oButton.getId(), false, [sLaunchpadState1, sLaunchpadState2]);
    }

    function _removeOptionsActionSheetButton (oButton, sLaunchpadState1, sLaunchpadState2) {
        Container.getRendererInternal("fiori2").hideActionButton(oButton.getId(), false, [sLaunchpadState1, sLaunchpadState2]);
    }

    function _setLeftPaneContent (oContent, sLaunchpadState1, sLaunchpadState2) {
        Container.getRendererInternal("fiori2").showLeftPaneContent(oContent.getId(), false, [sLaunchpadState1, sLaunchpadState2]);
    }

    function _removeLeftPaneContent (sLaunchpadState1, sLaunchpadState2) {
        Container.getRendererInternal("fiori2").hideLeftPaneContent(false, [sLaunchpadState1, sLaunchpadState2]);
    }

    function _addFloatingActionButton (oItem, sLaunchpadState1, sLaunchpadState2) {
        Container.getRendererInternal("fiori2").showFloatingActionButton(oItem.getId(), false, [sLaunchpadState1, sLaunchpadState2]);
    }

    function _removeFloatingActionButton (oItem, sLaunchpadState1, sLaunchpadState2) {
        Container.getRendererInternal("fiori2").hideFloatingActionButton(oItem.getId(), false, [sLaunchpadState1, sLaunchpadState2]);
    }

    function _addHeaderEndItem (oItem, sLaunchpadState1, sLaunchpadState2) {
        Container.getRendererInternal("fiori2").showHeaderEndItem(oItem.getId(), false, [sLaunchpadState1, sLaunchpadState2]);
    }

    function _removeHeaderEndItem (oItem, sLaunchpadState1, sLaunchpadState2) {
        Container.getRendererInternal("fiori2").hideHeaderEndItem(oItem.getId(), false, [sLaunchpadState1, sLaunchpadState2]);
    }

    /* -------------general functions Code ------------------------------------------------------*/
    function _getConfiguration () {
        return Container.getRendererInternal("fiori2").getModelConfiguration();
    }

    function _addEndUserFeedbackCustomUI () {
        Log.info("Application calls sap.ushell.Renderer.addEndUserFeedbackCustomUI. This function is deprecated. The call has no effect.");
    }

    function _addUserPreferencesEntry (entryObject) {
        Container.getRendererInternal("fiori2").addUserPreferencesEntry(entryObject);
    }

    function _addUserPreferencesGroupedEntry (entryObject) {
        Container.getRendererInternal("fiori2").addUserPreferencesGroupedEntry(entryObject);
    }

    function _setHeaderTitle (sTitle) {
        Container.getRendererInternal("fiori2").setHeaderTitle(sTitle);
    }

    function _setLeftPaneVisibility (sLaunchpadState, bVisible) {
        Container.getRendererInternal("fiori2").setLeftPaneVisibility(sLaunchpadState, bVisible);
    }

    function _setHeaderHiding (bHiding) {
        Container.getRendererInternal("fiori2").setHeaderHiding(bHiding);
    }

    function _setFooter (oFooter) {
        Container.getRendererInternal("fiori2").setFooter(oFooter);
    }

    function _removeFooter () {
        Container.getRendererInternal("fiori2").removeFooter();
    }

    // functions to be uses by a public API

    // a public API
    /**
     * @alias sap.ushell.renderers.fiori2.RendererExtensions
     * @namespace
     * @since 1.26
     * @deprecated since 1.119
     * @private
     */
    function RendererExtensions () {
        /**
         * Adds a ShellHeadItem to the headItems aggregation of the see sap.ushell.ui.shell.shell, in the given launchpad states
         * (see sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState).
         * If no launchpad states are provided the item will be added in all states.
         * The item is added to the left side of the header.
         * Currently you can add only one item. If an item already exists, the added item overrides the existing item,
         * and a warning is written to the log.
         *
         * @param {sap.ushell.ui.shell.ShellHeadItem} oItem
         *   The item to be added.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState1]
         *   A launchpad state in which to add the item.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState2]
         *   A launchpad state in which to add the item.
         *
         * @since 1.26
         *
         * @private
         */
        this.addHeaderItem = function (oItem, sLaunchpadState1, sLaunchpadState2) {
            Log.error("'sap.ushell.renderers.fiori2.RendererExtensions' is deprecated. Please use 'sap.ushell.Container.getRenderer('fiori2')' instead.");

            Container.getRendererInternal("fiori2").showHeaderItem(oItem.getId(), false, [sLaunchpadState1, sLaunchpadState2]);
        };

        this.setHeaderItemVisibility = function (sItem, sLaunchpadState, bToLocal, bIsVisible) {
            Log.error("'sap.ushell.renderers.fiori2.RendererExtensions' is deprecated. Please use 'sap.ushell.Container.getRenderer('fiori2')' instead.");

            const oItem = Element.getElementById(sItem);
            if (bIsVisible) {
                Container.getRendererInternal("fiori2").showHeaderItem(oItem.getId(), bToLocal, [sLaunchpadState]);
            }
        };

        this.addSubHeader = function (oItem, sLaunchpadState1, sLaunchpadState2) {
            Log.error("'sap.ushell.renderers.fiori2.RendererExtensions' is deprecated. Please use 'sap.ushell.Container.getRenderer('fiori2')' instead.");

            Container.getRendererInternal("fiori2").showSubHeader(oItem.getId(), false, [sLaunchpadState1, sLaunchpadState2]);
        };

        this.removeSubHeader = function (oItem, sLaunchpadState1, sLaunchpadState2) {
            Log.error("'sap.ushell.renderers.fiori2.RendererExtensions' is deprecated. Please use 'sap.ushell.Container.getRenderer('fiori2')' instead.");

            Container.getRendererInternal("fiori2").hideSubHeader(oItem.getId(), false, [sLaunchpadState1, sLaunchpadState2]);
        };

        /**
         * Adds a ShellHeadItem to the headEndItems aggregation of the see sap.ushell.ui.shell.shell, in the given launchpad states
         * (see sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState).
         * If no launchpad states are provided the item will be added in all states.
         * The item is added to the right side of the header.
         * Currently you can add only one item. If an item already exists, the added item overrides the existing item,
         * and a warning is written to the log.
         *
         * @param {sap.ushell.ui.shell.ShellHeadItem} oItem
         *   The item to be added.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState1]
         *   A launchpad state in which to add the item.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState2]
         *   A launchpad state in which to add the item.
         * @since 1.26
         *
         * @private
         */
        this.addHeaderEndItem = function (...args) {
            Log.error("'sap.ushell.renderers.fiori2.RendererExtensions' is deprecated. Please use 'sap.ushell.Container.getRenderer('fiori2')' instead.");

            _addHeaderEndItem(...args);
        };

        /**
         * Removes the ShellHeadItem from the headItems aggregation of the see sap.ushell.ui.shell.shell, in the given launchpad states
         * (see sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState).
         * If no launchpad states are provided the item is removed from all states.
         *
         * @param {sap.ushell.ui.shell.ShellHeadItem} oItem
         *   The item to be removed.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState1]
         *   A launchpad state from which to remove the item.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState2]
         *   A launchpad state from which to remove the item.
         * @since 1.26
         *
         * @private
         */
        this.removeHeaderItem = function (...args) {
            Log.error("'sap.ushell.renderers.fiori2.RendererExtensions' is deprecated. Please use 'sap.ushell.Container.getRenderer('fiori2')' instead.");

            _removeHeaderItem(...args);
        };

        /**
         * Removes the ShellHeadItem from the headEndItems aggregation of the see sap.ushell.ui.shell.shell, in the given launchpad states
         * (see sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState).
         * If no launchpad states are provided the item is removed from all states.
         *
         * @param {sap.ushell.ui.shell.ShellHeadItem} oItem
         *   The item to be removed.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState1]
         *   A launchpad state from which to remove the item.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState2]
         *   A launchpad state from which to remove the item.
         * @since 1.26
         *
         * @private
         */
        this.removeHeaderEndItem = function (...args) {
            Log.error("'sap.ushell.renderers.fiori2.RendererExtensions' is deprecated. Please use 'sap.ushell.Container.getRenderer('fiori2')' instead.");

            _removeHeaderEndItem(...args);
        };

        /**
         * Adds a custom control to a dedicated section within the End User Feedback dialog.
         *
         *
         * @param {sap.ui.core.Control}  oCustomUIContent
         *   The custom control to bee added within the End User Feedback dialog.
         * @param {boolean}  bShowCustomUIContent the visibility state of the added custom control. (default true)
         *
         * @since 1.26
         * @deprecated since 1.93. The functionality has been discontinued.
         * @private
         */
        this.addEndUserFeedbackCustomUI = function (...args) {
            Log.error("'sap.ushell.renderers.fiori2.RendererExtensions' is deprecated. Please use 'sap.ushell.Container.getRenderer('fiori2')' instead.");

            _addEndUserFeedbackCustomUI(...args);
        };

        /**
         * Adds a button to the action sheet which opens when clicking the 'options' button, in the given launchpad states
         * (see sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState).
         * If no launchpad states are provided the button will be added in all states.
         * The button is added to the action sheet before the Log Out button (if exists).
         * @param {sap.m.Button} oButton
         *   The button to be added. The button should have an icon, text, tooltip and a press callback
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState1]
         *   A launchpad state in which to add the button.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState2]
         *   A launchpad state in which to add the button.
         * @since 1.26
         *
         * @private
         */
        this.addOptionsActionSheetButton = function (...args) {
            Log.error("'sap.ushell.renderers.fiori2.RendererExtensions' is deprecated. Please use 'sap.ushell.Container.getRenderer('fiori2')' instead.");

            _addOptionsActionSheetButton(...args);
        };

        /**
         * Removes a button from the action sheet which opens when clicking the 'options' button, in the given launchpad states
         * (see sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState).
         * If no launchpad states are provided the button is removed from all states.
         * You can only remove buttons that were added to the action sheet using see sap.ushell.renderers.fiori2.RendererExtensions.addOptionsActionSheetButton
         *
         * @param {sap.m.Button} oButton
         *   The button to be removed.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState1]
         *   A launchpad state from which to remove the button.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState2]
         *   A launchpad state from which to remove the button.
         *
         * @since 1.26
         *
         * @private
         */
        this.removeOptionsActionSheetButton = function (...args) {
            Log.error("'sap.ushell.renderers.fiori2.RendererExtensions' is deprecated. Please use 'sap.ushell.Container.getRenderer('fiori2')' instead.");

            _removeOptionsActionSheetButton(...args);
        };

        /**
         * Displays a footer at the bottom of the Fiori launchpad page. The footer is added to all launchpad states.
         * @param {sap.m.IBar} oFooter
         *   The footer to set.
         * @since 1.26
         *
         * @private
         */
        this.setFooter = function (...args) {
            Log.error("'sap.ushell.renderers.fiori2.RendererExtensions' is deprecated. Please use 'sap.ushell.Container.getRenderer('fiori2')' instead.");

            _setFooter(...args);
        };

        /**
         * Removes the footer that was set using see sap.ushell.renderers.fiori2.RendererExtensions.setFooter from the
         * Fiori launchpad page. The footer is removed from all launchpad states.
         * Note that once removed, the footer might be destroyed and will not be available for reuse.
         * @since 1.26
         *
         * @private
         */
        this.removeFooter = function (...args) {
            Log.error("'sap.ushell.renderers.fiori2.RendererExtensions' is deprecated. Please use 'sap.ushell.Container.getRenderer('fiori2')' instead.");

            _removeFooter(...args);
        };

        /**
         * Add an entry to the User Preferences dialog box.
         * @param {object} oConfig - defines the configuration settings for the added entry.
         *  [entryHelpID] : {string} - the ID of the object.
         *  title : {string} - the title of the entry to be presented in the list of User Preferences. We recommend to use the string from the translation bundle.
         *  value : {string}/{function} - a string to be presented as the value of the entry OR a function to be called which returns a {@link jQuery.Promise} object.
         *  [onSave] : {function} - a function to be called which returns a {@link jQuery.Promise} object when clicking Save in the User Preferences dialog box.
         *  If an error occurs, pass the error message via the {@link jQuery.Promise} object. Errors are displayed in the log.
         *  [onCancel] : {function} - a function to be called that closes the User Preferences dialog box without saving any changes.
         *  content : {function} - a function to be called which returns a {@link jQuery.Promise} object which consists of a {sap.ui.core.Control} to be displayed in a follow-on dialog box.
         *
         * @since 1.27
         *
         * @private
         */
        this.addUserPreferencesEntry = function (...args) {
            Log.error("'sap.ushell.renderers.fiori2.RendererExtensions' is deprecated. Please use 'sap.ushell.Container.getRenderer('fiori2')' instead.");

            _addUserPreferencesEntry(...args);
        };

        /**
         * Add an entry to the User Preferences dialog box.
         * @param {object} oConfig - defines the configuration settings for the added entry.
         *  [entryHelpID] : {string} - the ID of the object.
         *  title : {string} - the title of the entry to be presented in the list of User Preferences. We recommend to use the string from the translation bundle.
         *  value : {string}/{function} - a string to be presented as the value of the entry OR a function to be called which returns a {@link jQuery.Promise} object.
         *  [onSave] : {function} - a function to be called which returns a {@link jQuery.Promise} object when clicking Save in the User Preferences dialog box.
         *  If an error occurs, pass the error message via the {@link jQuery.Promise} object. Errors are displayed in the log.
         *  [onCancel] : {function} - a function to be called that closes the User Preferences dialog box without saving any changes.
         *  content : {function} - a function to be called which returns a {@link jQuery.Promise} object which consists of a {sap.ui.core.Control} to be displayed in a follow-on dialog box.
         *  groupingId : {string} - The ID of the group this entry should be included in <br>
         *  groupingTabTitle : {string} - The tab title of the entry, when this entry is grouped. <br>
         *  groupingTabHelpId : {string} - The help ID for the grouped tab, when this entry is grouped. <br>
         *
         * @ui5-restricted sap.fe, sap.esh.search.ui
         * @since 1.110
         * @private
         */
        this.addUserPreferencesGroupedEntry = function (...args) {
            Log.error("'sap.ushell.renderers.fiori2.RendererExtensions' is deprecated. Please use 'sap.ushell.Container.getRenderer('fiori2')' instead.");

            _addUserPreferencesGroupedEntry(...args);
        };

        /**
         * Set the title in the Shell Header
         * @param {string} sTitle
         *  The text of the title to set
         *
         * @since 1.27
         *
         * @private
         */
        this.setHeaderTitle = function (...args) {
            Log.error("'sap.ushell.renderers.fiori2.RendererExtensions' is deprecated. Please use 'sap.ushell.Container.getRenderer('fiori2')' instead.");

            _setHeaderTitle(...args);
        };

        /**
         * Set the visibility of the Shell Header
         * @param {boolean} bHiding
         *  The visibility of the Shell Header
         *
         * @since 1.29
         *
         * @private
         */
        this.setHeaderHiding = function (...args) {
            Log.error("'sap.ushell.renderers.fiori2.RendererExtensions' is deprecated. Please use 'sap.ushell.Container.getRenderer('fiori2')' instead.");

            _setHeaderHiding(...args);
        };

        /**
         * The launchpad states that can be passed as a parameter.
         * Values:
         * App - launchpad state when running a Fiori app
         * Home - launchpad state when the home page is open
         *
         * @since 1.26
         *
         * @private
         */
        this.LaunchpadState = {
            App: "app",
            Home: "home"
        };

        /**
         * Adds a button to the bottom of the Fiori launchpad page, in the given launchpad states
         * (see sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState).
         * If no launchpad state is provided the button is added in all states.
         * @param {sap.m.Button} oButton
         *   The button to be added. The button should have an icon, text, a tooltip and a press callback
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState1]
         *   A launchpad state in which to add the button.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState2]
         *   A launchpad state in which to add the button.
         * @since 1.30
         *
         * @private
         */
        this.addFloatingActionButton = function (...args) {
            Log.error("'sap.ushell.renderers.fiori2.RendererExtensions' is deprecated. Please use 'sap.ushell.Container.getRenderer('fiori2')' instead.");

            _addFloatingActionButton(...args);
        };

        /**
         * Removes a button from the bottom of the Fiori launchpad page, in the given launchpad states
         * (see sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState).
         * If no launchpad state is provided the button is removed from all states.
         * You can only remove buttons that were added to the Fiori launchpad page using see sap.ushell.renderers.fiori2.RendererExtensions.addFloatingActionButton
         *
         * @param {sap.m.Button} oButton
         *   The button to be removed.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState1]
         *   A launchpad state from which to remove the button.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState2]
         *   A launchpad state from which to remove the button.
         * @since 1.30
         *
         * @private
         */
        this.removeFloatingActionButton = function (...args) {
            Log.error("'sap.ushell.renderers.fiori2.RendererExtensions' is deprecated. Please use 'sap.ushell.Container.getRenderer('fiori2')' instead.");

            _removeFloatingActionButton(...args);
        };

        /**
         * Sets the content of the left pane in Fiori launchpad, in the given launchpad states
         * (see sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState).
         * If no launchpad state is provided the content is added in all states.
         * @param {sap.ui.view} oView
         *   The content to set.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState1]
         *   A launchpad state in which to set the content.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState2]
         *   A launchpad state in which to set the content.
         * @since 1.30
         *
         * @private
         */
        this.setLeftPaneContent = function (...args) {
            Log.error("'sap.ushell.renderers.fiori2.RendererExtensions' is deprecated. Please use 'sap.ushell.Container.getRenderer('fiori2')' instead.");

            _setLeftPaneContent(...args);
        };

        /**
         * Removes content from the left pane content that was set using see sap.ushell.renderers.fiori2.RendererExtensions.setLeftPaneContent
         * in the Fiori launchpad, in the given launchpad states
         * (see sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState).
         * Note that once removed, the content might be destroyed and will not be available for reuse.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState1]
         *   A launchpad state in which to set the content.
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState2]
         *   A launchpad state in which to set the content.
         * @since 1.30
         *
         * @private
         */
        this.removeLeftPaneContent = function (...args) {
            Log.error("'sap.ushell.renderers.fiori2.RendererExtensions' is deprecated. Please use 'sap.ushell.Container.getRenderer('fiori2')' instead.");

            _removeLeftPaneContent(...args);
        };

        /**
         * Sets the visibility of the left pane in the Fiori launchpad, in the given launchpad states
         * (see sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState).
         * @param {sap.ushell.renderers.fiori2.RendererExtensions.LaunchpadState} [sLaunchpadState]
         *   A launchpad state in which to set the content.
         * @param {boolean} [bVisible]
         *   A boolean value stating whether the pane should be visible or not
         * @since 1.30
         *
         * @private
         */
        this.setLeftPaneVisibility = function (...args) {
            Log.error("'sap.ushell.renderers.fiori2.RendererExtensions' is deprecated. Please use 'sap.ushell.Container.getRenderer('fiori2')' instead.");

            _setLeftPaneVisibility(...args);
        };

        /**
         * Getter for shell configuration object
         *
         * @returns {object}
         *      shell configuration object
         * @private
         */
        this.getConfiguration = function (...args) {
            Log.error("'sap.ushell.renderers.fiori2.RendererExtensions' is deprecated. Please use 'sap.ushell.Container.getRenderer('fiori2')' instead.");

            return _getConfiguration(...args);
        };
    }

    /**
     * The RendererExtensions class which allows you to extend the fiori2 renderer
     * The following renderer lifecycle events are published:
     * rendererLoaded - is published when the renderer is loaded and indicates that the see sap.ushell.renderers.fiori2.RendererExtensions
     * APIs are available.
     * appOpened - is published when a Fiori app is opened.
     * appClosed - is published when a Fiori app is closed.
     * All events are published in the following channel: sap.ushell.renderers.fiori2.Renderer
     * @example to subscribe to an event:
     * EventBus.getInstance().subscribe("sap.ushell", "rendererLoaded", function() {
     *      const headItem1 = new sap.ushell.ui.shell.ShellHeadItem({
     *          id: "button1",
     *          icon: sap.ui.core.IconPool.getIconURI("sys-help"),
     *          press: function() {
     *              alert("the button was pressed");
     *          }
     *      });
     *      sap.ushell.renderers.fiori2.renderer.RendererExtensions.addHeaderItem(headItem1,sap.ushell.renderers.fiori2.renderer.RendererExtensions.LaunchpadState.Home);
     * });
     * @since 1.26
     *
     * @private
     */
    const RendererExtensions1 = new RendererExtensions();
    return RendererExtensions1;
}, /* bExport= */ true);

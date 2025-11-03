// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/View",
    "sap/ui/core/mvc/Controller",
    "sap/ui/thirdparty/jquery",
    "sap/m/MessageToast",
    "sap/ushell/resources",
    "sap/ushell/Container"
], (
    View,
    Controller,
    jQuery,
    MessageToast,
    resources,
    Container
) => {
    "use strict";

    /* global hasher */

    // Only used when CLASSIC HOMEPAGE is used
    let oCatalogsManager;

    return Controller.extend("sap.ushell.components.appfinder.HierarchyApps", {

        onInit: function () {
            const easyAccessSystemsModel = this.getView().getViewData().easyAccessSystemsModel;
            if (easyAccessSystemsModel) {
                this.getView().setModel(easyAccessSystemsModel, "easyAccessSystems");
            }
            oCatalogsManager = this.getView().getViewData().CatalogsManager && this.getView().getViewData().CatalogsManager.getInstance();
        },

        getCrumbsData: function (path, mainModel) {
            const pathChunks = path.split("/");
            pathChunks.splice(pathChunks.length - 2, 2);
            const newCrumbs = [];
            while (pathChunks.length) {
                const sPath = pathChunks.join("/");
                const text = mainModel.getProperty(`${sPath}/text`);
                newCrumbs.unshift({ text: text, path: sPath });
                pathChunks.splice(pathChunks.length - 2, 2);
            }
            return newCrumbs;
        },

        _updateAppBoxedWithPinStatuses: function (path) {
            const oView = this.getView();
            if (!path) {
                path = oView.layout.getBinding("items").getPath();
            }
            const easyAccessModel = oView.getModel("easyAccess");
            const appsData = easyAccessModel.getProperty(path) ? easyAccessModel.getProperty(path) : [];

            this.getView().oVisualizationOrganizerHelper.updateBookmarkCount.call(this, appsData)
                .then((updatedAppsData) => {
                    easyAccessModel.setProperty(path, updatedAppsData);
                });
        },

        updateBookmarkCount: function (appsData) {
            return Container.getServiceAsync("BookmarkV2")
                .then((BookmarkService) => {
                    const countPromiseList = appsData.map((appData) => {
                        return BookmarkService.countBookmarks(appData.url).then((count) => {
                            appData.bookmarkCount = count;
                            return appData;
                        });
                    });
                    return new Promise((fnResolve) => {
                        jQuery.when.apply(jQuery, countPromiseList).then(function () {
                            const aUpdatedAppsData = Array.prototype.slice.call(arguments);
                            fnResolve(aUpdatedAppsData);
                        });
                    });
                });
        },

        updatePageBindings: function (path) {
            this.getView().layout.bindAggregation("items", `easyAccess>${path}/apps`, this.getView().oItemTemplate);
            this._updateAppBoxedWithPinStatuses(`${path}/apps`);
            this.getView().breadcrumbs.bindProperty("currentLocationText", `easyAccess>${path}/text`);
            const crumbsData = this.getCrumbsData(path, this.getView().getModel("easyAccess"));
            this.getView().crumbsModel.setProperty("/crumbs", crumbsData);

            // when navigation in hierarchy folders had occureed and model had been updated
            // in case no results found we hide the app-boxes layout and display a message page with relevant message
            const aNewItems = this.getView().getModel("easyAccess").getProperty(`${path}/apps`);

            // call to update message with length of the items, and false indicating this is not searcg results
            this.getView().updateResultSetMessage(aNewItems.length, false);
        },

        onAppBoxPressed: function (oEvent) {
            if (oEvent.mParameters.srcControl.$().closest(".sapUshellPinButton").length) {
                return;
            }
            const sUrl = oEvent.getSource().getProperty("url");
            if (sUrl && sUrl.indexOf("#") === 0) {
                hasher.setHash(sUrl);
            }
        },

        _handleSuccessMessage: function (app, popoverResponse) {
            let message;
            const numberOfExistingGroups = popoverResponse.addToGroups ? popoverResponse.addToGroups.length : 0;
            const numberOfNewGroups = popoverResponse.newGroups ? popoverResponse.newGroups.length : 0;
            const totalNumberOfGroups = numberOfExistingGroups + numberOfNewGroups;

            if (totalNumberOfGroups === 1) {
                // determine the group's title
                let groupName;
                if (numberOfExistingGroups === 1) {
                    // for an existing group we have an object in the array items
                    groupName = popoverResponse.addToGroups[0].title;
                } else {
                    // for a new group, we have the title in the array items
                    groupName = popoverResponse.newGroups[0];
                }
                message = resources.i18n.getText("appAddedToSingleGroup", [app.text, groupName]);
            } else {
                message = resources.i18n.getText("appAddedToSeveralGroups", [app.text, totalNumberOfGroups]);
            }

            if (totalNumberOfGroups > 0) {
                MessageToast.show(message);
            }
            return message;
        },

        _prepareErrorMessage: function (aErroneousActions, sAppTitle) {
            let group;
            let sAction;
            let sFirstErroneousAddGroup;
            let iNumberOfFailAddActions = 0;
            let bCreateNewGroupFailed = false;
            let oMessage;

            for (const index in aErroneousActions) {
                // Get the data of the error (i.e. action name and group object).
                // the group's value:
                //   in case the group is an existing group we will have an object
                //   in case the group is a new group we will have a title instead of an object
                group = aErroneousActions[index].group;
                sAction = aErroneousActions[index].action;

                if (sAction === "addBookmark_ToExistingGroup") {
                    // add bookmark to EXISTING group failed
                    iNumberOfFailAddActions++;
                    if (iNumberOfFailAddActions === 1) {
                        sFirstErroneousAddGroup = group.title;
                    }
                } else if (sAction === "addBookmark_ToNewGroup") {
                    // add bookmark to a NEW group failed
                    iNumberOfFailAddActions++;
                    if (iNumberOfFailAddActions === 1) {
                        // in case of a new group we have the title and not an object
                        sFirstErroneousAddGroup = group;
                    }
                } else {
                    // sAction is "addBookmark_NewGroupCreation"
                    // e.g. new group creation failed
                    bCreateNewGroupFailed = true;
                }
            }

            // First - Handle bCreateNewGroupFailed
            if (bCreateNewGroupFailed) {
                if (aErroneousActions.length === 1) {
                    oMessage = { messageId: "fail_tile_operation_create_new_group" };
                } else {
                    oMessage = { messageId: "fail_tile_operation_some_actions" };
                }
                // Single error - it can be either one add action or one remove action
            } else if (aErroneousActions.length === 1) {
                oMessage = { messageId: "fail_app_operation_add_to_group", parameters: [sAppTitle, sFirstErroneousAddGroup] };
            } else {
                oMessage = { messageId: "fail_app_operation_add_to_several_groups", parameters: [sAppTitle] };
            }
            return oMessage;
        },

        /**
         * ONLY CALLED WHEN CLASSIC HOMEPAGE IS ENABLED!
         *
         * @param {*} app App
         * @param {*} popoverResponse Popover Response
         * @returns {*} res
         *
         * @deprecated since 1.112. Deprecated together with the classic homepage.
         */
        _handleBookmarkAppPopoverResponse: function (app, popoverResponse) {
            const addBookmarksPromiseList = [];

            popoverResponse.newGroups.forEach((group) => {
                addBookmarksPromiseList.push(this._createGroupAndAddBookmark(group, app));
            });

            popoverResponse.addToGroups.forEach((group) => {
                addBookmarksPromiseList.push(this._addBookmark(group, app));
            });

            return jQuery.when.apply(jQuery, addBookmarksPromiseList).then(function () {
                const resultList = Array.prototype.slice.call(arguments);
                this._handlePopoverGroupsActionPromises(app, popoverResponse, resultList);
            }.bind(this));
        },

        /**
         * ONLY CALLED WHEN CLASSIC HOMEPAGE IS ENABLED!
         *
         * @param {*} app App
         * @param {*} popoverResponse Popover Response
         * @param {*} resultList Result List
         *
         * @deprecated since 1.112. Deprecated together with the classic homepage.
         */
        _handlePopoverGroupsActionPromises: function (app, popoverResponse, resultList) {
            const errorList = resultList.filter((result, index, resultList) => {
                return !result.status;
            });
            if (errorList.length) {
                const oErrorMessageObj = this._prepareErrorMessage(errorList, app.text);

                oCatalogsManager.notifyOnActionFailure(oErrorMessageObj.messageId, oErrorMessageObj.parameters);
                return;
            }

            this._updateAppBoxedWithPinStatuses();

            this._handleSuccessMessage(app, popoverResponse);
        },

        /**
         * ONLY CALLED WHEN CLASSIC HOMEPAGE IS ENABLED!
         *
         * @param {*} newGroup Group
         * @param {*} app App
         * @returns {*} res
         *
         * @deprecated since 1.112. Deprecated together with the classic homepage.
         */
        _createGroupAndAddBookmark: function (newGroup, app) {
            const deferred = jQuery.Deferred(); let oResponseData = {};

            const newGroupPromise = oCatalogsManager.createGroup(newGroup);
            newGroupPromise.done((newGroupContext) => {
                const addBookmarkPromise = this._addBookmark(newGroupContext.getObject(), app, true);
                addBookmarkPromise.done((data) => {
                    deferred.resolve(data);
                }).fail(() => {
                    oResponseData = { group: newGroup, status: 0, action: "addBookmark_ToNewGroup" }; // 0 - failure
                    deferred.resolve(oResponseData);
                });
            }).fail(() => {
                oResponseData = { group: newGroup, status: 0, action: "addBookmark_NewGroupCreation" }; // 0 - failure
                deferred.resolve(oResponseData);
            });

            return deferred.promise();
        },

        _addBookmark: function (group, app, isNewGroup) {
            const deferred = jQuery.Deferred();
            let oResponseData = {};

            Container.getServiceAsync("BookmarkV2").then((oBookmarkService) => {
                const addBookmarkPromise = oBookmarkService.addBookmark({
                    url: app.url,
                    title: app.text,
                    subtitle: app.subtitle,
                    icon: app.icon
                }, group.object);

                const action = isNewGroup ? "addBookmark_ToNewGroup" : "addBookmark_ToExistingGroup";

                addBookmarkPromise.then(() => {
                    oResponseData = { group: group, status: 1, action: action }; // 1 - success
                    deferred.resolve(oResponseData);
                }).catch(() => {
                    oResponseData = { group: group, status: 0, action: action }; // 0 - failure
                    deferred.resolve(oResponseData);
                });
            });

            return deferred.promise();
        },

        showSaveAppPopover: function (oEvent) {
            this.getView().oVisualizationOrganizerHelper.onHierarchyAppsPinButtonClick.call(this, oEvent)
                .then((bUpdatePinStatus) => {
                    if (bUpdatePinStatus) {
                        this._updateAppBoxedWithPinStatuses();
                    }
                });
        },

        /**
         * ONLY CALLED WHEN CLASSIC HOMEPAGE IS ENABLED!
         * @param {*} event Event
         */
        showGroupListPopover: function (event) {
            const oModel = this.getView().getModel();
            const app = event.oSource.getParent().getBinding("title").getContext().getObject();
            const SourceControl = event.oSource;

            // if we in context of some dashboard group, no need to open popup
            if (oModel.getProperty("/groupContext").path) {
                const groupPath = oModel.getProperty("/groupContext").path;
                const oGroup = oModel.getProperty(groupPath);
                const customResponse = {
                    newGroups: [],
                    addToGroups: [oGroup]
                };
                this._handleBookmarkAppPopoverResponse(app, customResponse);
                return;
            }

            const groupData = oModel.getProperty("/groups").map((group) => {
                return {
                    selected: false,
                    initiallySelected: false,
                    oGroup: group
                };
            });

            View.create({
                viewName: "module:sap/ushell/components/appfinder/GroupListPopoverView",
                viewData: {
                    enableHideGroups: oModel.getProperty("/enableHideGroups"),
                    enableHelp: oModel.getProperty("/enableHelp"),
                    singleGroupSelection: true
                }
            }).then((GroupListPopoverView) => {
                GroupListPopoverView.getController().initializeData({
                    groupData: groupData
                });
                const popoverPromise = GroupListPopoverView.open(SourceControl);
                popoverPromise.then(this._handleBookmarkAppPopoverResponse.bind(this, app));
                this.getView().addDependent(GroupListPopoverView);
                return GroupListPopoverView;
            });
        },

        resultTextFormatter: function (oSystemSelected, iTotal) {
            const oResourceBundle = resources.i18n;
            if (oSystemSelected) {
                const sSystem = oSystemSelected.systemName ? oSystemSelected.systemName : oSystemSelected.systemId;
                let sResultText = "";
                if (iTotal) {
                    sResultText = oResourceBundle.getText("search_easy_access_results", [iTotal, sSystem]);
                }

                return sResultText;
            }
            return "";
        },

        showMoreResultsVisibilityFormatter: function (apps, total) {
            if (apps && apps.length < total) {
                return true;
            }
            return false;
        },

        showMoreResultsTextFormatter: function (apps, total) {
            if (!apps || !total) {
                return "";
            }
            const currentlyNumOfApps = apps.length;
            return resources.i18n.getText("EasyAccessSearchResults_ShowMoreResults", [currentlyNumOfApps, total]);
        }
    });
}, /* bExport= */ true);

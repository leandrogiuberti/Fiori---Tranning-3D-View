// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @file This file contains the BookmarkHandler class.
 *
 * Bookmark handling & SendAsEmail
 */
sap.ui.define([
    "sap/base/Log",
    "sap/m/library",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/Container",
    "sap/ushell/library",
    "sap/ushell/resources",
    "sap/ushell/state/ShellModel",
    "sap/ushell/utils"
], (
    Log,
    mobileLibrary,
    PostMessageManager,
    Container,
    ushellLibrary,
    ushellResources,
    ShellModel,
    ushellUtils
) => {
    "use strict";

    // shortcut for sap.m.URLHelper
    const URLHelper = mobileLibrary.URLHelper;

    // shortcut for sap.ushell.ContentNodeType
    const ContentNodeType = ushellLibrary.ContentNodeType;

    /**
     * Helper function for removing the service URL of dynamic bookmark tiles
     * if the bookmark is created from a local service provider
     * <p>
     * This is a short-term mitigation for customer incident 57472/2021.
     * The service URLs for dynamic tiles created as bookmark for apps created
     * locally on CF (either manually or deployed to the local HTML5 repo) cannot
     * be correctly constructed, because the path prefix cannot be resolved.
     * As intermediate workaround, we remove the service URL to avoid the display
     * of the ERROR state.
     *
     * @private
     * @param {object} oParameters parameters for bookmark creation
     * @param {object} oSystemContext the system context for bookmark creation
     */
    function stripBookmarkServiceUrlForLocalContentProvider (oParameters, oSystemContext) {
        if (!oParameters || !oParameters.serviceUrl || !oSystemContext) {
            return;
        }

        if (oSystemContext.id === "" || oSystemContext.id === "saas_approuter") {
            oParameters.serviceUrl = undefined;

            Log.warning("Dynamic data bookmarks tiles are not supported for local content providers");
        }
    }

    async function sendEmail (sTo = "", sSubject = "", sBody = "", sCc = "", sBcc = "", sIFrameURL, bSetAppStateToPublic) {
        let sFLPUrl = ushellUtils.getDocumentUrl();

        function replaceIframeUrlToFLPUrl (sIFrameURL1, sFLPUrl1, sXStateKey, sIStateKey, sXStateKeyNew, sIStateKeyNew) {
            // replace iframe url with flp url
            sSubject = sSubject.includes(sIFrameURL1) ? sSubject.replace(sIFrameURL1, sFLPUrl1) : sSubject;
            sBody = sBody.includes(sIFrameURL1) ? sBody.replace(sIFrameURL1, sFLPUrl1) : sBody;

            // for cases where we do not find iframe url, replace the app state keys
            if (sXStateKey && sXStateKeyNew) {
                sSubject = sSubject.includes(sXStateKey) ? sSubject.replaceAll(sXStateKey, sXStateKeyNew) : sSubject;
                sBody = sBody.includes(sXStateKey) ? sBody.replaceAll(sXStateKey, sXStateKeyNew) : sBody;
            }

            if (sIStateKey && sIStateKeyNew) {
                sSubject = sSubject.includes(sIStateKey) ? sSubject.replaceAll(sIStateKey, sIStateKeyNew) : sSubject;
                sBody = sBody.includes(sIStateKey) ? sBody.replaceAll(sIStateKey, sIStateKeyNew) : sBody;
            }
        }

        if (bSetAppStateToPublic) {
            const oAppStateService = await Container.getServiceAsync("AppState");
            oAppStateService.setAppStateToPublic(sIFrameURL)
                .then((sNewURL, sXStateKey, sIStateKey, sXStateKeyNew = "", sIStateKeyNew = "") => {
                    if (sXStateKeyNew) {
                        sFLPUrl = sFLPUrl.replace(sXStateKey, sXStateKeyNew);
                    }
                    if (sIStateKeyNew) {
                        sFLPUrl = sFLPUrl.replace(sIStateKey, sIStateKeyNew);
                    }
                    // check if the subject or the body of the email contain the IFrame URL
                    replaceIframeUrlToFLPUrl(sIFrameURL, sFLPUrl, sXStateKey, sIStateKey, sXStateKeyNew, sIStateKeyNew);
                    URLHelper.triggerEmail(sTo, sSubject, sBody, sCc, sBcc);
                })
                .catch((oError) => {
                    Log.error("Failed to set app state to public:", oError);
                });
        } else {
            // check if the subject or the body of the email contain the IFrame URL
            replaceIframeUrlToFLPUrl(sIFrameURL, sFLPUrl);
            URLHelper.triggerEmail(sTo, sSubject, sBody, sCc, sBcc);
        }
    }

    const oDistributionPolicies = {};

    const oServiceRequestHandlers = {
        /**
         * @private
         */
        "sap.ushell.services.Bookmark.addBookmarkUI5": {
            async handler (oMessageBody, oMessageEvent) {
                const { oParameters, vContainer } = oMessageBody;
                const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");

                const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();
                stripBookmarkServiceUrlForLocalContentProvider(oParameters, oSystemContext);

                const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                await BookmarkV2.addBookmark(oParameters, vContainer, oSystemContext.id);
            }
        },
        /**
         * {@link Bookmark@addBookmarkByGroupId} is mapped to {@link sap.ushell.services.Bookmark.addBookmark}
         * {@link Bookmark@addBookmark} is mapped to {@link sap.ushell.services.Bookmark.addBookmarkUI5}
         * @private
         */
        "sap.ushell.services.Bookmark.addBookmark": {
            async handler (oMessageBody, oMessageEvent) {
                /**
                 * @deprecated since 1.120. Deprecated together with the classic homepage.
                 */ // eslint-disable-next-line no-constant-condition
                if (true) {
                    const { oParameters, groupId } = oMessageBody;

                    const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");
                    const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();

                    const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                    await BookmarkV2.addBookmarkByGroupId(oParameters, groupId, oSystemContext.id);
                    return;
                }

                throw new Error("Bookmark.addBookmarkByGroupId is deprecated. Please use BookmarkV2.addBookmark instead.");
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Bookmark.getShellGroupIDs": {
            async handler (oMessageBody, oMessageEvent) {
                /**
                 * @deprecated since 1.120. Deprecated together with the classic homepage.
                 */ // eslint-disable-next-line no-constant-condition
                if (true) {
                    const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                    return BookmarkV2.getShellGroupIDs();
                }

                throw new Error("Bookmark.getShellGroupIDs is deprecated. Please use BookmarkV2.getContentNodes instead.");
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Bookmark.addCatalogTileToGroup": {
            async handler (oMessageBody, oMessageEvent) {
                Log.error("Bookmark.addCatalogTileToGroup is deprecated. Please use BookmarkV2.addBookmark instead.");

                /**
                 * @deprecated since 1.120. Deprecated together with the classic homepage.
                 */ // eslint-disable-next-line no-constant-condition
                if (true) {
                    const { sCatalogTileId, sGroupId, oCatalogData } = oMessageBody;
                    const Bookmark = await Container.getServiceAsync("Bookmark");

                    const oDeferred = Bookmark.addCatalogTileToGroup(sCatalogTileId, sGroupId, oCatalogData);
                    await ushellUtils.promisify(oDeferred);
                    return;
                }

                throw new Error("Bookmark.addCatalogTileToGroup is deprecated. Please use BookmarkV2.addBookmark instead.");
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Bookmark.countBookmarks": {
            async handler (oMessageBody, oMessageEvent) {
                const { sUrl } = oMessageBody;
                const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");

                const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();

                const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                return BookmarkV2.countBookmarks(sUrl, oSystemContext.id);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Bookmark.deleteBookmarks": {
            async handler (oMessageBody, oMessageEvent) {
                const { sUrl } = oMessageBody;
                const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");

                const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();

                const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                return BookmarkV2.deleteBookmarks(sUrl, oSystemContext.id);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Bookmark.updateBookmarks": {
            async handler (oMessageBody, oMessageEvent) {
                const { sUrl, oParameters } = oMessageBody;
                const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");

                const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();

                const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                return BookmarkV2.updateBookmarks(sUrl, oParameters, oSystemContext.id);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Bookmark.getContentNodes": {
            async handler (oMessageBody, oMessageEvent) {
                const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                return BookmarkV2.getContentNodes();
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Bookmark.addCustomBookmark": {
            async handler (oMessageBody, oMessageEvent) {
                const { sVizType, oConfig, vContentNodes } = oMessageBody;
                const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");

                const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();

                const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                await BookmarkV2.addCustomBookmark(sVizType, oConfig, vContentNodes, oSystemContext.id);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Bookmark.countCustomBookmarks": {
            async handler (oMessageBody, oMessageEvent) {
                const { oIdentifier } = oMessageBody;
                const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");

                const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();
                oIdentifier.contentProviderId = oSystemContext.id;

                const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                return BookmarkV2.countCustomBookmarks(oIdentifier);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Bookmark.updateCustomBookmarks": {
            async handler (oMessageBody, oMessageEvent) {
                const { oIdentifier, oConfig } = oMessageBody;
                const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");

                const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();
                oIdentifier.contentProviderId = oSystemContext.id;

                const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                return BookmarkV2.updateCustomBookmarks(oIdentifier, oConfig);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Bookmark.deleteCustomBookmarks": {
            async handler (oMessageBody, oMessageEvent) {
                const { oIdentifier } = oMessageBody;
                const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");

                const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();
                oIdentifier.contentProviderId = oSystemContext.id;

                const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                return BookmarkV2.deleteCustomBookmarks(oIdentifier);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Bookmark.addBookmarkToPage": {
            async handler (oMessageBody, oMessageEvent) {
                const { oParameters, sPageId } = oMessageBody;
                const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");

                const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();

                const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                await BookmarkV2.addBookmarkToPage(oParameters, sPageId, oSystemContext.id);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.BookmarkV2.addBookmarkUI5": {
            async handler (oMessageBody, oMessageEvent) {
                const { oParameters, vContainer } = oMessageBody;
                const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");

                const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();
                stripBookmarkServiceUrlForLocalContentProvider(oParameters, oSystemContext);

                const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                return BookmarkV2.addBookmark(oParameters, vContainer, oSystemContext.id);
            }
        },
        /**
         * {@link BookmarkV2@addBookmarkByGroupId} is mapped to {@link sap.ushell.services.BookmarkV2.addBookmark}
         * {@link BookmarkV2@addBookmark} is mapped to {@link sap.ushell.services.BookmarkV2.addBookmarkUI5}
         * @private
         */
        "sap.ushell.services.BookmarkV2.addBookmark": {
            async handler (oMessageBody, oMessageEvent) {
                /**
                 * @deprecated since 1.120. Deprecated together with the classic homepage.
                 */ // eslint-disable-next-line no-constant-condition
                if (true) {
                    const { oParameters, groupId } = oMessageBody;

                    const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");
                    const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();

                    const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                    await BookmarkV2.addBookmarkByGroupId(oParameters, groupId, oSystemContext.id);
                    return;
                }

                throw new Error("BookmarkV2.addBookmarkByGroupId is deprecated. Please use BookmarkV2.addBookmark instead.");
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.BookmarkV2.getShellGroupIDs": {
            async handler (oMessageBody, oMessageEvent) {
                /**
                 * @deprecated since 1.120. Deprecated together with the classic homepage.
                 */ // eslint-disable-next-line no-constant-condition
                if (true) {
                    const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                    return BookmarkV2.getShellGroupIDs();
                }

                throw new Error("BookmarkV2.getShellGroupIDs is deprecated. Please use BookmarkV2.getContentNodes instead.");
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.BookmarkV2.countBookmarks": {
            async handler (oMessageBody, oMessageEvent) {
                const { sUrl } = oMessageBody;
                const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");

                const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();

                const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                return BookmarkV2.countBookmarks(sUrl, oSystemContext.id);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.BookmarkV2.deleteBookmarks": {
            async handler (oMessageBody, oMessageEvent) {
                const { sUrl } = oMessageBody;
                const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");

                const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();

                const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                return BookmarkV2.deleteBookmarks(sUrl, oSystemContext.id);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.BookmarkV2.updateBookmarks": {
            async handler (oMessageBody, oMessageEvent) {
                const { sUrl, oParameters } = oMessageBody;
                const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");

                const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();

                const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                return BookmarkV2.updateBookmarks(sUrl, oParameters, oSystemContext.id);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.BookmarkV2.getContentNodes": {
            async handler (oMessageBody, oMessageEvent) {
                const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                return BookmarkV2.getContentNodes();
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.BookmarkV2.addCustomBookmark": {
            async handler (oMessageBody, oMessageEvent) {
                const { sVizType, oConfig, vContentNodes } = oMessageBody;
                const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");

                const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();

                const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                await BookmarkV2.addCustomBookmark(sVizType, oConfig, vContentNodes, oSystemContext.id);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.BookmarkV2.countCustomBookmarks": {
            async handler (oMessageBody, oMessageEvent) {
                const { oIdentifier } = oMessageBody;
                const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");

                const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();
                oIdentifier.contentProviderId = oSystemContext.id;

                const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                return BookmarkV2.countCustomBookmarks(oIdentifier);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.BookmarkV2.updateCustomBookmarks": {
            async handler (oMessageBody, oMessageEvent) {
                const { oIdentifier, oConfig } = oMessageBody;
                const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");

                const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();
                oIdentifier.contentProviderId = oSystemContext.id;

                const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                return BookmarkV2.updateCustomBookmarks(oIdentifier, oConfig);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.BookmarkV2.deleteCustomBookmarks": {
            async handler (oMessageBody, oMessageEvent) {
                const { oIdentifier } = oMessageBody;
                const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");

                const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();
                oIdentifier.contentProviderId = oSystemContext.id;

                const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                return BookmarkV2.deleteCustomBookmarks(oIdentifier);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.BookmarkV2.addBookmarkToPage": {
            async handler (oMessageBody, oMessageEvent) {
                const { oParameters, sPageId } = oMessageBody;
                const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");

                const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();

                const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                await BookmarkV2.addBookmarkToPage(oParameters, sPageId, oSystemContext.id);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.LaunchPage.getGroupsForBookmarks": {
            async handler (oMessageBody, oMessageEvent) {
                /**
                 * @deprecated since 1.120. Deprecated together with the classic homepage.
                 */ // eslint-disable-next-line no-constant-condition
                if (true) {
                    const FlpLaunchPage = await Container.getServiceAsync("FlpLaunchPage");

                    const oDeferred = FlpLaunchPage.getGroupsForBookmarks();

                    return ushellUtils.promisify(oDeferred);
                }

                throw new Error("LaunchPage.getGroupsForBookmarks is deprecated. Please use BookmarkV2.getContentNodes instead.");
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Menu.getSpacesPagesHierarchy": {
            async handler (oMessageBody, oMessageEvent) {
                const Menu = await Container.getServiceAsync("Menu");

                const aContentNodes = await Menu.getContentNodes([ContentNodeType.Space, ContentNodeType.Page]);

                return aContentNodes.map(({ id: spaceId, label: spaceLabel, children }) => {
                    return {
                        id: spaceId,
                        title: spaceLabel,
                        pages: (children || []).map(({ id: pageId, label: pageLabel }) => {
                            return {
                                id: pageId,
                                title: pageLabel
                            };
                        })
                    };
                });
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.CommonDataModel.getAllPages": {
            async handler (oMessageBody, oMessageEvent) {
                const CommonDataModel = await Container.getServiceAsync("CommonDataModel");

                return CommonDataModel.getAllPages();
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.ShellUIService.getShellGroupIDs": {
            async handler (oMessageBody, oMessageEvent) {
                /**
                 * @deprecated since 1.120. Deprecated together with the classic homepage.
                 */ // eslint-disable-next-line no-constant-condition
                if (true) {
                    const { bGetAll } = oMessageBody;
                    const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                    return BookmarkV2.getShellGroupIDs(bGetAll);
                }

                throw new Error("Bookmark.getShellGroupIDs is deprecated. Use BookmarkV2.getContentNodes instead.");
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.ShellUIService.addBookmark": {
            async handler (oMessageBody, oMessageEvent) {
                /**
                 * @deprecated since 1.120. Deprecated together with the classic homepage.
                 */ // eslint-disable-next-line no-constant-condition
                if (true) {
                    const { oParameters, groupId } = oMessageBody;

                    const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");
                    const oSystemContext = await AppLifeCycle.getCurrentApplication().getSystemContext();

                    const BookmarkV2 = await Container.getServiceAsync("BookmarkV2");

                    return BookmarkV2.addBookmarkByGroupId(oParameters, groupId, oSystemContext.id);
                }

                throw new Error("Bookmark.addBookmarkByGroupId is deprecated. Use BookmarkV2.addBookmark instead.");
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.ShellUIService.addBookmarkDialog": {
            async handler (oMessageBody, oMessageEvent) {
                const [AddBookmarkButton] = await ushellUtils.requireAsync(["sap/ushell/ui/footerbar/AddBookmarkButton"]);
                const dialogButton = new AddBookmarkButton();
                dialogButton.firePress({});
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.ShellUIService.getShellGroupTiles": {
            async handler (oMessageBody, oMessageEvent) {
                /**
                 * @deprecated since 1.120. Deprecated together with the classic homepage.
                 */ // eslint-disable-next-line no-constant-condition
                if (true) {
                    const { groupId } = oMessageBody;
                    const FlpLaunchPage = await Container.getServiceAsync("FlpLaunchPage");

                    const oDeferred = FlpLaunchPage.getTilesByGroupId(groupId);
                    return ushellUtils.promisify(oDeferred);
                }

                throw new Error("Classic homepage is deprecated.");
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.ShellUIService.sendUrlAsEmail": {
            async handler (oMessageBody, oMessageEvent) {
                const sAppName = ShellModel.getModel().getProperty("/application/title");

                let sSubject;
                if (sAppName === undefined) {
                    sSubject = ushellResources.i18n.getText("linkToApplication");
                } else {
                    sSubject = `${ushellResources.i18n.getText("linkTo")} '${sAppName}'`;
                }

                sendEmail(
                    "",
                    sSubject,
                    document.URL,
                    "",
                    "",
                    document.URL,
                    true
                );
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.ShellUIService.sendEmailWithFLPButton": {
            async handler (oMessageBody, oMessageEvent) {
                const { bSetAppStateToPublic } = oMessageBody;

                const sAppName = ShellModel.getModel().getProperty("/application/title");
                let sSubject;
                if (sAppName === undefined) {
                    sSubject = ushellResources.i18n.getText("linkToApplication");
                } else {
                    sSubject = `${ushellResources.i18n.getText("linkTo")} '${sAppName}'`;
                }

                sendEmail(
                    "",
                    sSubject,
                    document.URL,
                    "",
                    "",
                    document.URL,
                    bSetAppStateToPublic
                );
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.ShellUIService.sendEmail": {
            async handler (oMessageBody, oMessageEvent) {
                const { sTo, sSubject, sBody, sCc, sBcc, sIFrameURL, bSetAppStateToPublic } = oMessageBody;

                sendEmail(
                    sTo,
                    sSubject,
                    sBody,
                    sCc,
                    sBcc,
                    sIFrameURL,
                    bSetAppStateToPublic
                );
            }
        }
    };

    return {
        register () {
            Object.keys(oDistributionPolicies).forEach((sServiceRequest) => {
                const oDistributionPolicy = oDistributionPolicies[sServiceRequest];
                PostMessageManager.setDistributionPolicy(sServiceRequest, oDistributionPolicy);
            });

            Object.keys(oServiceRequestHandlers).forEach((sServiceRequest) => {
                const oHandler = oServiceRequestHandlers[sServiceRequest];
                PostMessageManager.setRequestHandler(sServiceRequest, oHandler.handler, oHandler.options);
            });
        },

        // for testing
        stripBookmarkServiceUrlForLocalContentProvider,
        sendEmail
    };
});

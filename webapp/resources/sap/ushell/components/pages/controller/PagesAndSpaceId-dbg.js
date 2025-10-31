// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/thirdparty/hasher",
    "sap/ushell/resources",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/utils/LaunchpadError"
], (hasher, resources, Config, Container, LaunchpadError) => {
    "use strict";

    // todo FLPCOREANDUX-10676: rework i18n for error handling, this conflicts with the usage in the boottask
    function PagesAndSpaceId () {}

    /**
     * Gets the url parameters and returns the spaceId and pageId of the target page.
     *
     * @param {string} [sShellHash] Hash part of a shell compliant URL
     * @returns {Promise<object>} Resolves to an object contains the pageId and spaceId
     * @private
     * @since 1.72.0
     */
    PagesAndSpaceId.prototype.getPageAndSpaceId = function (sShellHash) {
        return Container.getServiceAsync("URLParsing").then((urlParsingService) => {
            // during boottask the hash gets provided via parameter
            // within the controller it needs to be fetched via the hasher
            if (sShellHash === undefined) {
                sShellHash = hasher.getHash();
            }
            const oHash = urlParsingService.parseShellHash(sShellHash) || {};
            const oIntent = {
                semanticObject: oHash.semanticObject || "",
                action: oHash.action || ""
            };
            const oHashPartsParams = oHash.params || {};
            const aPageId = oHashPartsParams.pageId || [];
            const aSpaceId = oHashPartsParams.spaceId || [];

            return this._parsePageAndSpaceId(aPageId, aSpaceId, oIntent);
        });
    };

    /**
     * Parses the given spaceId and pageId. When there are no pageId and spaceId given but the intent is Shell-home,
     * returns the spaceId and pageId of the default page. When there is no pageId and spaceId, only a pageId or a
     * spaceId, or more than one pageId or spaceId given, returns a rejected promise with an error message.
     *
     * @param {string[]} pageId An array that contains the page id of the page which should be displayed
     * @param {string[]} spaceId An array that contains the space id of the page which should be displayed
     * @param {object} intent An object that contains the semantic object and action of the page which should be displayed
     * @returns {Promise<object>} Resolves to an object contains the pageId and spaceId
     * @private
     * @since 1.72.0
     */
    PagesAndSpaceId.prototype._parsePageAndSpaceId = function (pageId, spaceId, intent) {
        return new Promise((resolve, reject) => {
            this.getUserMyHomeEnablement().then(() => {
                if (pageId.length < 1 && spaceId.length < 1) {
                    const bIsShellHome = intent.semanticObject === "Shell" && intent.action === "home";
                    const bIsEmptyIntent = intent.semanticObject === "" && intent.action === "";

                    if (bIsShellHome || bIsEmptyIntent) {
                        this._getUserDefaultSpaceAndPage()
                            .then((oResult) => {
                                resolve(oResult);
                            })
                            .catch((oError) => {
                                reject(oError);
                            });
                        return;
                    }
                    const sMessage = resources.i18n.getText("PageRuntime.NoPageIdAndSpaceIdProvided");
                    reject(new LaunchpadError(sMessage, { translatedMessage: sMessage }));
                }

                if (pageId.length === 1 && spaceId.length === 0) {
                    const sMessage = resources.i18n.getText("PageRuntime.OnlyPageIdProvided");
                    reject(new LaunchpadError(sMessage, { translatedMessage: sMessage }));
                }

                if (pageId.length === 0 && spaceId.length === 1) {
                    const sMessage = resources.i18n.getText("PageRuntime.OnlySpaceIdProvided");
                    reject(new LaunchpadError(sMessage, { translatedMessage: sMessage }));
                }

                if (pageId.length > 1 || spaceId.length > 1) {
                    const sMessage = resources.i18n.getText("PageRuntime.MultiplePageOrSpaceIdProvided");
                    reject(new LaunchpadError(sMessage, { translatedMessage: sMessage }));
                }

                if (pageId[0] === "") {
                    const sMessage = resources.i18n.getText("PageRuntime.InvalidPageId");
                    reject(new LaunchpadError(sMessage, { translatedMessage: sMessage }));
                }

                if (spaceId[0] === "") {
                    const sMessage = resources.i18n.getText("PageRuntime.InvalidSpaceId");
                    reject(new LaunchpadError(sMessage, { translatedMessage: sMessage }));
                }

                resolve({
                    pageId: pageId[0],
                    spaceId: spaceId[0]
                });
            });
        });
    };

    /**
     * Returns a promise resolving the User Settings.
     *
     * @returns {Promise<boolean>} Either true, if user has enabled 'MyHome' or false if disabled.
     * @private
     */
    PagesAndSpaceId.prototype.getUserMyHomeEnablement = function () {
        return new Promise((resolve, reject) => {
            const bUserMyHome = Container.getUser().getShowMyHome();
            Config.emit("/core/spaces/myHome/userEnabled", bUserMyHome);
            resolve(bUserMyHome);
        });
    };

    /**
     * Returns the default page and the default space of the current user.
     * For its determination the Menu service is used to access the default
     * space: The first page in there is taken as the "default" page.
     *
     * The function also takes into account whether the current user would
     * like to see its My Home page. The config is updated and a notification
     * is published on the config event hub.
     *
     * @returns {Promise<object>} Resolves to an object that contains the pageId and spaceId of the page.
     *   Rejects if no space or page has been assigned to the user, if there's a problem accessing the default space,
     *   or if there was a problem determining whether myHome is enabled for the user.
     * @private
     * @since 1.72.0
     */
    PagesAndSpaceId.prototype._getUserDefaultSpaceAndPage = function () {
        return new Promise((resolve, reject) => {
            Promise.all([Container.getServiceAsync("Menu"), this.getUserMyHomeEnablement()]).then((aResults) => {
                const oMenuService = aResults[0];

                oMenuService.getDefaultSpace()
                    .then((oDefaultSpace) => {
                        if (!oDefaultSpace) {
                            const sMessage = resources.i18n.getText("PageRuntime.NoAssignedSpace");
                            reject(new LaunchpadError(sMessage, { translatedMessage: sMessage }));
                            return;
                        }

                        const oDefaultPage = oDefaultSpace && oDefaultSpace.children && oDefaultSpace.children[0];

                        if (!oDefaultPage) {
                            const sMessage = resources.i18n.getText("PageRuntime.NoAssignedPage");
                            reject(new LaunchpadError(sMessage, { translatedMessage: sMessage }));
                            return;
                        }

                        resolve({
                            spaceId: oDefaultSpace.id,
                            pageId: oDefaultPage.id
                        });
                    });
            })
                .catch((oError) => {
                    reject(oError);
                });
        });
    };

    return new PagesAndSpaceId();
});

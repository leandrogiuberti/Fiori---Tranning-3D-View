// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Core",
    "sap/ui/model/json/JSONModel",
    "sap/ui/util/openWindow",
    "sap/ushell/Container"
], (Controller, Core, JSONModel, openWindow, Container) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.PluginCEPSearchExtProvider.floating.controller", {
        onInit: function (oEvent) {
            this.oModel = new JSONModel();
            this.oModel.setData({message: ""});
            this.getView().setModel(this.oModel, "displayModel");
            this.pSearchCEPService = Container.getServiceAsync("SearchCEP");
        },

        onClose: function () {
            const oRenderer = Container.getRendererInternal("fiori2");
            oRenderer.setFloatingContainerVisibility(false);
            this.oModel.setProperty("/message", "");
        },

        onButtonPress: function (sParamString) {
            const aParams = sParamString.split("_");
            const sAction = aParams[0];
            const sListName = aParams[1];

            this.pSearchCEPService.then((oSearchCEPService) => {
                const fnGetConfig = this._getProviderConfig.bind(this);
                const oProvider = fnGetConfig(sListName);
                const fnHandleProvider = `${sAction}ExternalSearchProvider`;
                const oOptions = {
                    register: {
                        message: "added",
                        parameter: oProvider
                    },
                    unregister: {
                        message: "removed",
                        parameter: oProvider.id
                    }
                };

                oSearchCEPService[fnHandleProvider](oOptions[sAction].parameter).then(() => {
                    this.oModel.setProperty("/message", `New list ${oOptions[sAction].message}!`);
                    setTimeout(() => {
                        this.oModel.setProperty("/message", "");
                    }, 1500);
                });
            });
        },

        _navigateToUrl: function (sUrl) {
            openWindow(sUrl);
        },

        _getProviderConfig: function (sListName) {
            const that = this;
            const oListConfig = {
                travel: {
                    minQueryLength: 0,
                    maxQueryLength: 0,
                    items: [{
                        icon: "sap-icon://flight",
                        text: "Check popular destinations",
                        press: function () {
                            that._navigateToUrl("https://www.tripadvisor.com/TravelersChoice-Destinations-cPopular-g1");
                        }
                    }, {
                        icon: "sap-icon://suitcase",
                        text: "Book flights & hotels",
                        closePopover: false,
                        press: function () {
                            that._navigateToUrl("https://booking.com/");
                        }
                    }, {
                        icon: "sap-icon://employee-lookup",
                        text: "Hire local guides",
                        press: function () {
                            that._navigateToUrl("https://toursbylocals.com/");
                        }
                    }, {
                        icon: "sap-icon://business-card",
                        text: "Travel related blogs",
                        press: function () {
                            that._navigateToUrl("https://detailed.com/travel-blogs/");
                        }
                    }],
                    id: "travelAppsList",
                    title: "Your travel assistant"
                },
                course: {
                    minQueryLength: 1,
                    maxQueryLength: 100,
                    closePopover: false,
                    items: [{
                        icon: "sap-icon://e-learning",
                        text: "Top online courses for 2023",
                        press: function () {
                            that._navigateToUrl("https://nypost.com/article/best-online-classes/");
                        }
                    }, {
                        icon: "sap-icon://desktop-mobile",
                        text: "Study on the go",
                        closePopover: true,
                        press: function () {
                            that._navigateToUrl("https://elearningindustry.com/top-mobile-learning-platforms-lms-list");
                        }
                    }, {
                        icon: "sap-icon://accounting-document-verification",
                        text: "Get certified by universities",
                        press: function () {
                            that._navigateToUrl("https://www.coursera.org/degrees");
                        }
                    }, {
                        icon: "sap-icon://business-card",
                        text: "Education related blogs",
                        press: function () {
                            that._navigateToUrl("https://detailed.com/education-blogs/");
                        }
                    }, {
                        icon: "sap-icon://badge",
                        text: "Free online courses",
                        press: function () {
                            that._navigateToUrl("https://www.coursera.org/courses?query=free");
                        }
                    }, {
                        icon: "sap-icon://study-leave",
                        text: "Education vs. Experience",
                        press: function () {
                            that._navigateToUrl("https://www.investopedia.com/financial-edge/0511/work-experience-vs.-education-which-lands-you-the-best-job.aspx");
                        }
                    }, {
                        icon: "sap-icon://work-history",
                        text: "Managing a successful career",
                        press: function () {
                            that._navigateToUrl("https://www.indeed.com/career-advice/career-development/managing-a-career");
                        }
                    }, {
                        icon: "sap-icon://compare",
                        text: "Balancing work and study",
                        press: function () {
                            that._navigateToUrl("https://ici.net.au/blog/7-tips-for-balancing-work-and-study/");
                        }
                    }],
                    id: "studyCourseList",
                    title: "Explore online courses"
                }
            };

            const oList = {
                id: oListConfig[sListName].id,
                entryType: "app",
                title: oListConfig[sListName].title,
                titleVisible: true,
                minQueryLength: oListConfig[sListName].minQueryLength,
                maxQueryLength: oListConfig[sListName].maxQueryLength,
                defaultItemCount: 3,
                maxItemCount: 10,
                priority: 10,

                execSearch: function (sQuery) {
                    let aListItems = oListConfig[sListName].items;
                    if (sQuery) {
                        sQuery = sQuery.toLowerCase();

                        that.oModel.setProperty("/message", `Searching for '${sQuery.toUpperCase()}' ...`);
                        setTimeout(() => {
                            that.oModel.setProperty("/message", "");
                        }, 10000);
                        aListItems = aListItems.filter((oListItem) => {
                            const sItemText = oListItem.text.toLowerCase();
                            return sItemText.indexOf(sQuery) > -1;
                        });
                    }

                    return Promise.resolve(aListItems);
                },

                itemPress: function (oEvent) {
                    that.oModel.setProperty("/message", "List item pressed!");
                    setTimeout(() => {
                        that.oModel.setProperty("/message", "");
                    }, 1500);
                },

                popoverClosed: function () {
                    that.oModel.setProperty("/message", "Popover closed!");
                    setTimeout(() => {
                        that.oModel.setProperty("/message", "");
                    }, 2500);
                }
            };

            if (oListConfig[sListName].hasOwnProperty("closePopover")) {
                oList.closePopover = oListConfig[sListName].closePopover;
            }
            return oList;
        }
    });
});

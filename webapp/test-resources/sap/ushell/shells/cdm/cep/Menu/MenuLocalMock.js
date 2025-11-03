// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([], () => {
    "use strict";

    return {
        menu: [
            {
                id: "test-space-1",
                type: "space",
                title: "First Space - Mixed",
                icon: "sap-icon://home",
                subMenu: [
                    {
                        id: "page1",
                        type: "workpage",
                        title: "Test Page 1",
                        pageType: "page"
                    },
                    {
                        id: "testApp1#Default-VizId",
                        type: "visualization",
                        title: "Test App 1",
                        icon: "sap-icon://accept"
                    }
                ]
            },
            {
                id: "test-space-2",
                type: "space",
                title: "Second Space - Mixed",
                subMenu: [
                    {
                        id: "testApp2#Default-VizId",
                        type: "visualization",
                        title: "Test App 2"
                    },
                    {
                        id: "page2",
                        type: "workpage",
                        title: "Test Page 2",
                        pageType: "page"
                    }
                ]
            },
            {
                id: "test-space-3",
                type: "space",
                title: "Space - Only App",
                subMenu: [
                    {
                        id: "testApp2#Default-VizId",
                        type: "visualization",
                        title: "Test App 5"
                    }
                ]
            },
            {
                id: "test-space-4",
                type: "space",
                title: "Space - Only Page",
                subMenu: [
                    {
                        id: "test-page-5",
                        type: "workpage",
                        title: "Test Page 5",
                        pageType: "workpage"
                    }
                ]
            }
        ]
    };
});

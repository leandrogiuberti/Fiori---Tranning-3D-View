/*!
 * Copyright (c) 2009-2025 SAP SE, All Rights Reserved
 */
sap.ui.define(
  [
    "sap/ushell/thirdparty/webcomponents-fiori",
    "sap/ui/base/DataType",
    "sap/ushell/gen/ui5/webcomponents",
    "sap/ushell/gen/ui5/webcomponents-base",
  ],
  function (WebCPackage, DataType) {
    "use strict"
    const { registerEnum } = DataType

    const pkg = {
      _ui5metadata: {
        name: "sap/ushell/gen/ui5/webcomponents-fiori",
        version: "0.0.0-896d5863e",
        dependencies: ["sap.ui.core"],
        types: [
          "sap.ushell.gen.ui5.webcomponents-fiori.FCLLayout",
          "sap.ushell.gen.ui5.webcomponents-fiori.IllustrationMessageDesign",
          "sap.ushell.gen.ui5.webcomponents-fiori.IllustrationMessageType",
          "sap.ushell.gen.ui5.webcomponents-fiori.MediaGalleryItemLayout",
          "sap.ushell.gen.ui5.webcomponents-fiori.MediaGalleryLayout",
          "sap.ushell.gen.ui5.webcomponents-fiori.MediaGalleryMenuHorizontalAlign",
          "sap.ushell.gen.ui5.webcomponents-fiori.MediaGalleryMenuVerticalAlign",
          "sap.ushell.gen.ui5.webcomponents-fiori.NavigationLayoutMode",
          "sap.ushell.gen.ui5.webcomponents-fiori.NotificationListItemImportance",
          "sap.ushell.gen.ui5.webcomponents-fiori.PageBackgroundDesign",
          "sap.ushell.gen.ui5.webcomponents-fiori.SearchMode",
          "sap.ushell.gen.ui5.webcomponents-fiori.SideContentFallDown",
          "sap.ushell.gen.ui5.webcomponents-fiori.SideContentPosition",
          "sap.ushell.gen.ui5.webcomponents-fiori.SideContentVisibility",
          "sap.ushell.gen.ui5.webcomponents-fiori.SideNavigationItemDesign",
          "sap.ushell.gen.ui5.webcomponents-fiori.TimelineGrowingMode",
          "sap.ushell.gen.ui5.webcomponents-fiori.TimelineLayout",
          "sap.ushell.gen.ui5.webcomponents-fiori.UploadCollectionSelectionMode",
          "sap.ushell.gen.ui5.webcomponents-fiori.UploadState",
          "sap.ushell.gen.ui5.webcomponents-fiori.ViewSettingsDialogMode",
          "sap.ushell.gen.ui5.webcomponents-fiori.WizardContentLayout",
        ],
        interfaces: [
          "sap.ushell.gen.ui5.webcomponents-fiori.IMediaGalleryItem",
          "sap.ushell.gen.ui5.webcomponents-fiori.IProductSwitchItem",
          "sap.ushell.gen.ui5.webcomponents-fiori.ISearchScope",
          "sap.ushell.gen.ui5.webcomponents-fiori.ITimelineItem",
        ],
        controls: [
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.BarcodeScannerDialog",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.DynamicPage",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.DynamicPageHeader",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.DynamicPageTitle",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.DynamicSideContent",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.FilterItem",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.FilterItemOption",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.FlexibleColumnLayout",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.IllustratedMessage",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.MediaGallery",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.MediaGalleryItem",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.NavigationLayout",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.NotificationList",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.NotificationListGroupItem",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.NotificationListItem",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.Page",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.ProductSwitch",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.ProductSwitchItem",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.Search",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.SearchItem",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.SearchItemGroup",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.SearchItemShowMore",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.SearchMessageArea",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.SearchScope",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.ShellBar",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.ShellBarBranding",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.ShellBarItem",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.ShellBarSearch",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.ShellBarSpacer",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.SideNavigation",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.SideNavigationGroup",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.SideNavigationItem",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.SideNavigationSubItem",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.SortItem",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.Timeline",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.TimelineGroupItem",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.TimelineItem",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.UploadCollection",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.UploadCollectionItem",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.UserMenu",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.UserMenuAccount",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.UserMenuItem",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.UserMenuItemGroup",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.UserSettingsDialog",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.UserSettingsItem",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.UserSettingsView",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.ViewSettingsDialog",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.Wizard",
          "sap.ushell.gen.ui5.webcomponents-fiori.dist.WizardStep",
        ],
        elements: [],
        rootPath: "../",
      },
    }

    if (WebCPackage) {
      Object.keys(WebCPackage).forEach((key) => {
        if (key !== "default") {
          pkg[key] = WebCPackage[key]
        } else {
          if (typeof WebCPackage[key] === "object") {
            Object.assign(pkg, WebCPackage[key])
          }
        }
      })
    }

    /**
     * Different types of FCLLayout.
     *
     * @enum {string}
     *
     * @alias module:sap/ushell/gen/ui5/webcomponents-fiori.FCLLayout
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori FCLLayout
     *
     * @public
     */
    pkg["FCLLayout"] = {
      /**
       * The layout will display 1 column.
       *
       * @public
       */
      OneColumn: "OneColumn",
      /**
       *
       * Desktop: Defaults to 67 - 33 - -- percent widths of columns. Start (expanded) and Mid columns are displayed.
       * Tablet:  Defaults to 67 - 33 - -- percent widths of columns. Start (expanded) and Mid columns are displayed.
       * Phone:   Fixed -- 100 -- percent widths of columns, only the Mid column is displayed
       *
       * Use to display both a list and a detail page when the user should focus on the list page.
       *
       * @public
       */
      TwoColumnsStartExpanded: "TwoColumnsStartExpanded",
      /**
       * Desktop: Defaults to 33 - 67 - -- percent widths of columns. Start and Mid (expanded) columns are displayed
       * Tablet:  Defaults to 33 - 67 - -- percent widths of columns. Start and Mid (expanded) columns are displayed
       * Phone:   Fixed -- 100 -- percent widths of columns, only the Mid column is displayed
       *
       * Use to display both a list and a detail page when the user should focus on the detail page.
       *
       * @public
       */
      TwoColumnsMidExpanded: "TwoColumnsMidExpanded",
      /**
       * Desktop: Defaults to 25 - 50 - 25 percent widths of columns. Start, Mid (expanded) and End columns are displayed
       * Tablet:  Defaults to 0 - 67 - 33 percent widths of columns. Mid (expanded) and End columns are displayed, Start is accessible by dragging the columns-separator
       * Phone:   Fixed -- -- 100 percent widths of columns, only the End column is displayed
       *
       * Use to display all three pages (list, detail, detail-detail) when the user should focus on the detail.
       *
       * @public
       */
      ThreeColumnsMidExpanded: "ThreeColumnsMidExpanded",
      /**
       * Desktop: Defaults to 25 - 25 - 50 percent widths of columns. Start, Mid and End (expanded) columns are displayed
       * Tablet:  Defaults to 0 - 33 - 67 percent widths of columns. Mid and End (expanded) columns are displayed, Start is accessible by dragging the columns-separator
       * Phone:   Fixed -- -- 100 percent widths of columns (only the End column is displayed)
       *
       * Use to display all three pages (list, detail, detail-detail) when the user should focus on the detail-detail.
       *
       * @public
       */
      ThreeColumnsEndExpanded: "ThreeColumnsEndExpanded",
      /**
       * Desktop: Defaults to 67 - 33 - 0 percent widths of columns. Start (expanded) and Mid columns are displayed, End is accessible by dragging the columns-separator
       * Tablet:  Defaults to 67 - 33 - 0 percent widths of columns. Start (expanded) and Mid columns are displayed, End is accessible by dragging the columns-separator
       * Phone:   Fixed -- -- 100 percent widths of columns, only the End column is displayed
       *
       * Use to display the list and detail pages when the user should focus on the list.
       * The detail-detail is still loaded and easily accessible by dragging the columns-separator
       *
       * @public
       */
      ThreeColumnsStartExpandedEndHidden: "ThreeColumnsStartExpandedEndHidden",
      /**
       * Desktop: Defaults to 33 - 67 - 0 percent widths of columns. Start and Mid (expanded) columns are displayed, End is accessible by dragging the columns-separator
       * Tablet:  Defaults to 33 - 67 - 0 percent widths of columns. Start and Mid (expanded) columns are displayed, End is accessible by dragging the columns-separator
       * Phone:   Fixed -- -- 100 percent widths of columns, only the End column is displayed
       *
       * Use to display the list and detail pages when the user should focus on the detail.
       * The detail-detail is still loaded and easily accessible by dragging the columns-separator
       *
       * @public
       */
      ThreeColumnsMidExpandedEndHidden: "ThreeColumnsMidExpandedEndHidden",
      /**
       * Desktop: Defaults to 0 - 67 - 33 percent widths of columns. Start is hidden, Mid (expanded) and End columns are displayed.
       * Tablet:  Defaults to 0 - 67 - 33 percent widths of columns. Start is hidden, Mid (expanded) and End columns are displayed.
       * Phone:   Fixed -- 100 percent width of the Mid column, only the Mid column is displayed.
       *
       * Use to display the Mid and End columns while the Start column is hidden.
       *
       * @public
       */
      ThreeColumnsStartHiddenMidExpanded: "ThreeColumnsStartHiddenMidExpanded",
      /**
       * Desktop: Defaults to 0 - 33 - 67 percent widths of columns. Start is hidden, Mid and End (expanded) columns are displayed.
       * Tablet:  Defaults to 0 - 33 - 67 percent widths of columns. Start is hidden, Mid and End (expanded) columns are displayed.
       * Phone:   Fixed -- 100 percent width of the End column, only the End column is displayed.
       *
       * Use to display the Mid column and expanded End column while the grip of the separator is not visible.
       *
       * @public
       */
      ThreeColumnsStartHiddenEndExpanded: "ThreeColumnsStartHiddenEndExpanded",
      /**
       * Desktop: Fixed -- 100 -- percent widths of columns, only the Mid column is displayed
       * Tablet:  Fixed -- 100 -- percent widths of columns, only the Mid column is displayed
       * Phone:   Fixed -- 100 -- percent widths of columns, only the Mid column is displayed
       *
       * Use to display a detail page only, when the user should focus entirely on it.
       *
       * @public
       */
      MidColumnFullScreen: "MidColumnFullScreen",
      /**
       * Desktop: Fixed -- -- 100 percent widths of columns, only the End column is displayed
       * Tablet:  Fixed -- -- 100 percent widths of columns, only the End column is displayed
       * Phone:   Fixed -- -- 100 percent widths of columns, only the End column is displayed
       *
       * Use to display a detail-detail page only, when the user should focus entirely on it.
       *
       * @public
       */
      EndColumnFullScreen: "EndColumnFullScreen",
    }
    registerEnum("sap.ushell.gen.ui5.webcomponents-fiori.FCLLayout", pkg["FCLLayout"])
    /**
     * Different types of IllustrationMessageDesign.
     *
     * @enum {string}
     *
     * @alias module:sap/ushell/gen/ui5/webcomponents-fiori.IllustrationMessageDesign
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori IllustrationMessageDesign
     *
     * @public
     */
    pkg["IllustrationMessageDesign"] = {
      /**
       * Automatically decides the &lt;code&gt;Illustration&lt;/code&gt; size (&lt;code&gt;Base&lt;/code&gt;, &lt;code&gt;Dot&lt;/code&gt;, &lt;code&gt;Spot&lt;/code&gt;,
       * &lt;code&gt;Dialog&lt;/code&gt;, or &lt;code&gt;Scene&lt;/code&gt;) depending on the &lt;code&gt;IllustratedMessage&lt;/code&gt; container width.
       *
       * **Note:** &#x60;Auto&#x60; is the only option where the illustration size is changed according to
       * the available container width. If any other &#x60;IllustratedMessageSize&#x60; is chosen, it remains
       * until changed by the app developer.
       *
       * @public
       */
      Auto: "Auto",
      /**
       * Base &#x60;Illustration&#x60; size (XS breakpoint). Suitable for cards (two columns).
       *
       * **Note:** When &#x60;Base&#x60; is in use, no illustration is displayed.
       *
       * @public
       */
      Base: "Base",
      /**
       * Dot &lt;code&gt;Illustration&lt;/code&gt; size (XS breakpoint). Suitable for table rows.
       *
       * @public
       */
      Dot: "Dot",
      /**
       * Spot &lt;code&gt;Illustration&lt;/code&gt; size (S breakpoint). Suitable for cards (four columns).
       *
       * @public
       */
      Spot: "Spot",
      /**
       * Dialog &#x60;Illustration&#x60; size (M breakpoint). Suitable for dialogs.
       *
       * @public
       */
      Dialog: "Dialog",
      /**
       * Scene &#x60;Illustration&#x60; size (L breakpoint). Suitable for a &#x60;Page&#x60; or a table.
       *
       * @public
       */
      Scene: "Scene",
      /**
       * ExtraSmall &lt;code&gt;Illustration&lt;/code&gt; size (XS breakpoint). Suitable for table rows.
       *
       * @public
       */
      ExtraSmall: "ExtraSmall",
      /**
       * Small &lt;code&gt;Illustration&lt;/code&gt; size (S breakpoint). Suitable for cards (four columns).
       *
       * @public
       */
      Small: "Small",
      /**
       * Medium &#x60;Illustration&#x60; size (M breakpoint). Suitable for dialogs.
       *
       * @public
       */
      Medium: "Medium",
      /**
       * Large &#x60;Illustration&#x60; size (L breakpoint). Suitable for a &#x60;Page&#x60; or a table.
       *
       * @public
       */
      Large: "Large",
    }
    registerEnum(
      "sap.ushell.gen.ui5.webcomponents-fiori.IllustrationMessageDesign",
      pkg["IllustrationMessageDesign"],
    )
    /**
     * Different illustration types of Illustrated Message.
     *
     * @enum {string}
     *
     * @alias module:sap/ushell/gen/ui5/webcomponents-fiori.IllustrationMessageType
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori IllustrationMessageType
     *
     * @public
     */
    pkg["IllustrationMessageType"] = {
      /**
       * &quot;Achievement&quot; illustration type.
       *
       * @public
       */
      Achievement: "Achievement",
      /**
       * &quot;Adding Columns&quot; illustration type.
       *
       * @public
       */
      AddingColumns: "AddingColumns",
      /**
       * &quot;Add People To Calendar&quot; illustration type.
       *
       * @public
       */
      AddPeopleToCalendar: "AddPeopleToCalendar",
      /**
       * &quot;Before Search&quot; illustration type.
       *
       * @public
       */
      BeforeSearch: "BeforeSearch",
      /**
       * &quot;Drag Files To Upload&quot; illustration type.
       *
       * @public
       */
      DragFilesToUpload: "DragFilesToUpload",
      /**
       * &quot;Filtering Columns&quot; illustration type.
       *
       * @public
       */
      FilteringColumns: "FilteringColumns",
      /**
       * &quot;Grouping Columns&quot; illustration type.
       *
       * @public
       */
      GroupingColumns: "GroupingColumns",
      /**
       * &quot;New Mail&quot; illustration type.
       *
       * @public
       */
      NewMail: "NewMail",
      /**
       * &quot;No Activities&quot; illustration type.
       *
       * @public
       */
      NoActivities: "NoActivities",
      /**
       * &quot;No Columns Set&quot; illustration type.
       *
       * @public
       */
      NoColumnsSet: "NoColumnsSet",
      /**
       * &quot;No Data&quot; illustration type.
       *
       * @public
       */
      NoData: "NoData",
      /**
       * &quot;No Email&quot; illustration type.
       *
       * @public
       */
      NoMail: "NoMail",
      /**
       * &quot;No Email v1&quot; illustration type.
       *
       * @public
       */
      NoMail_v1: "NoMail_v1",
      /**
       * &quot;No Entries&quot; illustration type.
       *
       * @public
       */
      NoEntries: "NoEntries",
      /**
       * &quot;No Notifications&quot; illustration type.
       *
       * @public
       */
      NoNotifications: "NoNotifications",
      /**
       * &quot;No Saved Items&quot; illustration type.
       *
       * @public
       */
      NoSavedItems: "NoSavedItems",
      /**
       * &quot;No Saved Items v1&quot; illustration type.
       *
       * @public
       */
      NoSavedItems_v1: "NoSavedItems_v1",
      /**
       * &quot;No Search Results&quot; illustration type.
       *
       * @public
       */
      NoSearchResults: "NoSearchResults",
      /**
       * &quot;No Tasks&quot; illustration type.
       *
       * @public
       */
      NoTasks: "NoTasks",
      /**
       * &quot;No Tasks v1&quot; illustration type.
       *
       * @public
       */
      NoTasks_v1: "NoTasks_v1",
      /**
       * &quot;No Dimensions Set&quot; illustration type.
       *
       * @public
       */
      NoDimensionsSet: "NoDimensionsSet",
      /**
       * &quot;Unable To Load&quot; illustration type.
       *
       * @public
       */
      UnableToLoad: "UnableToLoad",
      /**
       * &quot;Unable To Load Image&quot; illustration type.
       *
       * @public
       */
      UnableToLoadImage: "UnableToLoadImage",
      /**
       * &quot;Unable To Upload&quot; illustration type.
       *
       * @public
       */
      UnableToUpload: "UnableToUpload",
      /**
       * &quot;Upload To Cloud&quot; illustration type.
       *
       * @public
       */
      UploadToCloud: "UploadToCloud",
      /**
       * &quot;Add Column&quot; illustration type.
       *
       * @public
       */
      AddColumn: "AddColumn",
      /**
       * &quot;Add People&quot; illustration type.
       *
       * @public
       */
      AddPeople: "AddPeople",
      /**
       * &quot;Add Dimensions&quot; illustration type.
       *
       * @public
       */
      AddDimensions: "AddDimensions",
      /**
       * &quot;Balloon Sky&quot; illustration type.
       *
       * @public
       */
      BalloonSky: "BalloonSky",
      /**
       * &quot;Connection&quot; illustration type.
       *
       * @public
       */
      Connection: "Connection",
      /**
       * &quot;Empty Calendar&quot; illustration type.
       *
       * @public
       */
      EmptyCalendar: "EmptyCalendar",
      /**
       * &quot;Empty List&quot; illustration type.
       *
       * @public
       */
      EmptyList: "EmptyList",
      /**
       * &quot;Empty Planning Calendar&quot; illustration type.
       *
       * @public
       */
      EmptyPlanningCalendar: "EmptyPlanningCalendar",
      /**
       * &quot;Error Screen&quot; illustration type.
       *
       * @public
       */
      ErrorScreen: "ErrorScreen",
      /**
       * &quot;Filter Table&quot; illustration type.
       *
       * @public
       */
      FilterTable: "FilterTable",
      /**
       * &quot;Group Table&quot; illustration type.
       *
       * @public
       */
      GroupTable: "GroupTable",
      /**
       * &quot;Key Task&quot; illustration type.
       *
       * @public
       */
      KeyTask: "KeyTask",
      /**
       * &quot;No Chart Data&quot; illustration type.
       *
       * @public
       */
      NoChartData: "NoChartData",
      /**
       * &quot;No Filter Results&quot; illustration type.
       *
       * @public
       */
      NoFilterResults: "NoFilterResults",
      /**
       * &quot;Page Not Found&quot; illustration type.
       *
       * @public
       */
      PageNotFound: "PageNotFound",
      /**
       * &quot;Reload Screen&quot; illustration type.
       *
       * @public
       */
      ReloadScreen: "ReloadScreen",
      /**
       * &quot;Resize Column&quot; illustration type.
       *
       * @public
       */
      ResizeColumn: "ResizeColumn",
      /**
       * &quot;Resizing Columns&quot; illustration type.
       *
       * @public
       */
      ResizingColumns: "ResizingColumns",
      /**
       * &quot;Receive Appreciation&quot; illustration type.
       *
       * @public
       */
      ReceiveAppreciation: "ReceiveAppreciation",
      /**
       * &quot;Search Earth&quot; illustration type.
       *
       * @public
       */
      SearchEarth: "SearchEarth",
      /**
       * &quot;Search Folder&quot; illustration type.
       *
       * @public
       */
      SearchFolder: "SearchFolder",
      /**
       * &quot;Sign Out&quot; illustration type.
       *
       * @public
       */
      SignOut: "SignOut",
      /**
       * &quot;Simple Balloon&quot; illustration type.
       *
       * @public
       */
      SimpleBalloon: "SimpleBalloon",
      /**
       * &quot;Simple Bell&quot; illustration type.
       *
       * @public
       */
      SimpleBell: "SimpleBell",
      /**
       * &quot;Simple Calendar&quot; illustration type.
       *
       * @public
       */
      SimpleCalendar: "SimpleCalendar",
      /**
       * &quot;Simple CheckMark&quot; illustration type.
       *
       * @public
       */
      SimpleCheckMark: "SimpleCheckMark",
      /**
       * &quot;Simple Connection&quot; illustration type.
       *
       * @public
       */
      SimpleConnection: "SimpleConnection",
      /**
       * &quot;Simple Empty Doc&quot; illustration type.
       *
       * @public
       */
      SimpleEmptyDoc: "SimpleEmptyDoc",
      /**
       * &quot;Simple Empty List&quot; illustration type.
       *
       * @public
       */
      SimpleEmptyList: "SimpleEmptyList",
      /**
       * &quot;Simple Error&quot; illustration type.
       *
       * @public
       */
      SimpleError: "SimpleError",
      /**
       * &quot;Simple Magnifier&quot; illustration type.
       *
       * @public
       */
      SimpleMagnifier: "SimpleMagnifier",
      /**
       * &quot;Simple Mail&quot; illustration type.
       *
       * @public
       */
      SimpleMail: "SimpleMail",
      /**
       * &quot;Simple No Saved Items&quot; illustration type.
       *
       * @public
       */
      SimpleNoSavedItems: "SimpleNoSavedItems",
      /**
       * &quot;Simple Not Found Magnifier&quot; illustration type.
       *
       * @public
       */
      SimpleNotFoundMagnifier: "SimpleNotFoundMagnifier",
      /**
       * &quot;Simple Reload&quot; illustration type.
       *
       * @public
       */
      SimpleReload: "SimpleReload",
      /**
       * &quot;Simple Task&quot; illustration type.
       *
       * @public
       */
      SimpleTask: "SimpleTask",
      /**
       * &quot;Sleeping Bell&quot; illustration type.
       *
       * @public
       */
      SleepingBell: "SleepingBell",
      /**
       * &quot;Sort Column&quot; illustration type.
       *
       * @public
       */
      SortColumn: "SortColumn",
      /**
       * &quot;Sorting Columns&quot; illustration type.
       *
       * @public
       */
      SortingColumns: "SortingColumns",
      /**
       * &quot;Success Balloon&quot; illustration type.
       *
       * @public
       */
      SuccessBalloon: "SuccessBalloon",
      /**
       * &quot;Success CheckMark&quot; illustration type.
       *
       * @public
       */
      SuccessCheckMark: "SuccessCheckMark",
      /**
       * &quot;Success HighFive&quot; illustration type.
       *
       * @public
       */
      SuccessHighFive: "SuccessHighFive",
      /**
       * &quot;Success Screen&quot; illustration type.
       *
       * @public
       */
      SuccessScreen: "SuccessScreen",
      /**
       * &quot;Survey&quot; illustration type.
       *
       * @public
       */
      Survey: "Survey",
      /**
       * &quot;Tent&quot; illustration type.
       *
       * @public
       */
      Tent: "Tent",
      /**
       * &quot;Upload Collection&quot; illustration type.
       *
       * @public
       */
      UploadCollection: "UploadCollection",
      /**
       * &quot;User Has Signed Up&quot; illustration type.
       *
       * @public
       */
      UserHasSignedUp: "UserHasSignedUp",
      /**
       * &quot;TntAvatar&quot; illustration type.
       *
       * @public
       */
      TntAvatar: "TntAvatar",
      /**
       * &quot;TntCalculator&quot; illustration type.
       *
       * @public
       */
      TntCalculator: "TntCalculator",
      /**
       * &quot;TntChartArea&quot; illustration type.
       *
       * @public
       */
      TntChartArea: "TntChartArea",
      /**
       * &quot;TntChartArea2&quot; illustration type.
       *
       * @public
       */
      TntChartArea2: "TntChartArea2",
      /**
       * &quot;TntChartBar&quot; illustration type.
       *
       * @public
       */
      TntChartBar: "TntChartBar",
      /**
       * &quot;TntChartBPMNFlow&quot; illustration type.
       *
       * @public
       */
      TntChartBPMNFlow: "TntChartBPMNFlow",
      /**
       * &quot;TntChartBullet&quot; illustration type.
       *
       * @public
       */
      TntChartBullet: "TntChartBullet",
      /**
       * &quot;TntChartDoughnut&quot; illustration type.
       *
       * @public
       */
      TntChartDoughnut: "TntChartDoughnut",
      /**
       * &quot;TntChartFlow&quot; illustration type.
       *
       * @public
       */
      TntChartFlow: "TntChartFlow",
      /**
       * &quot;TntChartGantt&quot; illustration type.
       *
       * @public
       */
      TntChartGantt: "TntChartGantt",
      /**
       * &quot;TntChartOrg&quot; illustration type.
       *
       * @public
       */
      TntChartOrg: "TntChartOrg",
      /**
       * &quot;TntChartPie&quot; illustration type.
       *
       * @public
       */
      TntChartPie: "TntChartPie",
      /**
       * &quot;TntCodePlaceholder&quot; illustration type.
       *
       * @public
       */
      TntCodePlaceholder: "TntCodePlaceholder",
      /**
       * &quot;TntCompany&quot; illustration type.
       *
       * @public
       */
      TntCompany: "TntCompany",
      /**
       * &quot;TntCompass&quot; illustration type.
       *
       * @public
       */
      TntCompass: "TntCompass",
      /**
       * &quot;TntComponents&quot; illustration type.
       *
       * @public
       */
      TntComponents: "TntComponents",
      /**
       * &quot;TntDialog&quot; illustration type.
       *
       * @public
       */
      TntDialog: "TntDialog",
      /**
       * &quot;TntEmptyContentPane&quot; illustration type.
       *
       * @public
       */
      TntEmptyContentPane: "TntEmptyContentPane",
      /**
       * &quot;TntExternalLink&quot; illustration type.
       *
       * @public
       */
      TntExternalLink: "TntExternalLink",
      /**
       * &quot;TntFaceID&quot; illustration type.
       *
       * @public
       */
      TntFaceID: "TntFaceID",
      /**
       * &quot;TntFingerprint&quot; illustration type.
       *
       * @public
       */
      TntFingerprint: "TntFingerprint",
      /**
       * &quot;TntHandshake&quot; illustration type.
       *
       * @public
       */
      TntHandshake: "TntHandshake",
      /**
       * &quot;TntHelp&quot; illustration type.
       *
       * @public
       */
      TntHelp: "TntHelp",
      /**
       * &quot;TntLock&quot; illustration type.
       *
       * @public
       */
      TntLock: "TntLock",
      /**
       * &quot;TntMission&quot; illustration type.
       *
       * @public
       */
      TntMission: "TntMission",
      /**
       * &quot;TntMissionFailed&quot; illustration type.
       *
       * @public
       */
      TntMissionFailed: "TntMissionFailed",
      /**
       * &quot;TntNoApplications&quot; illustration type.
       *
       * @public
       */
      TntNoApplications: "TntNoApplications",
      /**
       * &quot;TntNoFlows&quot; illustration type.
       *
       * @public
       */
      TntNoFlows: "TntNoFlows",
      /**
       * &quot;TntNoUsers&quot; illustration type.
       *
       * @public
       */
      TntNoUsers: "TntNoUsers",
      /**
       * &quot;TntRadar&quot; illustration type.
       *
       * @public
       */
      TntRadar: "TntRadar",
      /**
       * &quot;TntRoadMap&quot; illustration type.
       *
       * @public
       */
      TntRoadMap: "TntRoadMap",
      /**
       * &quot;TntSecrets&quot; illustration type.
       *
       * @public
       */
      TntSecrets: "TntSecrets",
      /**
       * &quot;TntServices&quot; illustration type.
       *
       * @public
       */
      TntServices: "TntServices",
      /**
       * &quot;TntSessionExpired&quot; illustration type.
       *
       * @public
       */
      TntSessionExpired: "TntSessionExpired",
      /**
       * &quot;TntSessionExpiring&quot; illustration type.
       *
       * @public
       */
      TntSessionExpiring: "TntSessionExpiring",
      /**
       * &quot;TntSettings&quot; illustration type.
       *
       * @public
       */
      TntSettings: "TntSettings",
      /**
       * &quot;TntSuccess&quot; illustration type.
       *
       * @public
       */
      TntSuccess: "TntSuccess",
      /**
       * &quot;TntSuccessfulAuth&quot; illustration type.
       *
       * @public
       */
      TntSuccessfulAuth: "TntSuccessfulAuth",
      /**
       * &quot;TntSystems&quot; illustration type.
       *
       * @public
       */
      TntSystems: "TntSystems",
      /**
       * &quot;TntTeams&quot; illustration type.
       *
       * @public
       */
      TntTeams: "TntTeams",
      /**
       * &quot;TntTools&quot; illustration type.
       *
       * @public
       */
      TntTools: "TntTools",
      /**
       * &quot;TntTutorials&quot; illustration type.
       *
       * @public
       */
      TntTutorials: "TntTutorials",
      /**
       * &quot;TntUnableToLoad&quot; illustration type.
       *
       * @public
       */
      TntUnableToLoad: "TntUnableToLoad",
      /**
       * &quot;TntUnlock&quot; illustration type.
       *
       * @public
       */
      TntUnlock: "TntUnlock",
      /**
       * &quot;TntUnsuccessfulAuth&quot; illustration type.
       *
       * @public
       */
      TntUnsuccessfulAuth: "TntUnsuccessfulAuth",
      /**
       * &quot;TntUser2&quot; illustration type.
       *
       * @public
       */
      TntUser2: "TntUser2",
    }
    registerEnum(
      "sap.ushell.gen.ui5.webcomponents-fiori.IllustrationMessageType",
      pkg["IllustrationMessageType"],
    )
    /**
     * Defines the layout of the content displayed in the `ui5-media-gallery-item`.
     *
     * @enum {string}
     *
     * @alias module:sap/ushell/gen/ui5/webcomponents-fiori.MediaGalleryItemLayout
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori MediaGalleryItemLayout
     *
     * @public
     */
    pkg["MediaGalleryItemLayout"] = {
      /**
       * Recommended to use when the item contains an image.
       *
       * When a thumbnail is selected, it makes the corresponding enlarged content appear in a square display area.
       *
       * @public
       */
      Square: "Square",
      /**
       * Recommended to use when the item contains video content.
       *
       * When a thumbnail is selected, it makes the corresponding enlarged content appear in a wide display area
       * (stretched to fill all of the available width) for optimal user experiance.
       *
       * @public
       */
      Wide: "Wide",
    }
    registerEnum(
      "sap.ushell.gen.ui5.webcomponents-fiori.MediaGalleryItemLayout",
      pkg["MediaGalleryItemLayout"],
    )
    /**
     * Defines the layout type of the thumbnails list of the `ui5-media-gallery` component.
     *
     * @enum {string}
     *
     * @alias module:sap/ushell/gen/ui5/webcomponents-fiori.MediaGalleryLayout
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori MediaGalleryLayout
     *
     * @public
     */
    pkg["MediaGalleryLayout"] = {
      /**
       * The layout is determined automatically.
       *
       * @public
       */
      Auto: "Auto",
      /**
       * Displays the layout as a vertical split between the thumbnails list and the selected image.
       *
       * @public
       */
      Vertical: "Vertical",
      /**
       * Displays the layout as a horizontal split between the thumbnails list and the selected image.
       *
       * @public
       */
      Horizontal: "Horizontal",
    }
    registerEnum(
      "sap.ushell.gen.ui5.webcomponents-fiori.MediaGalleryLayout",
      pkg["MediaGalleryLayout"],
    )
    /**
     * Defines the horizontal alignment of the thumbnails menu of the `ui5-media-gallery` component.
     *
     * @enum {string}
     *
     * @alias module:sap/ushell/gen/ui5/webcomponents-fiori.MediaGalleryMenuHorizontalAlign
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori MediaGalleryMenuHorizontalAlign
     *
     * @public
     */
    pkg["MediaGalleryMenuHorizontalAlign"] = {
      /**
       * Displays the menu on the left side of the target.
       *
       * @public
       */
      Left: "Left",
      /**
       * Displays the menu on the right side of the target.
       *
       * @public
       */
      Right: "Right",
    }
    registerEnum(
      "sap.ushell.gen.ui5.webcomponents-fiori.MediaGalleryMenuHorizontalAlign",
      pkg["MediaGalleryMenuHorizontalAlign"],
    )
    /**
     * Types for the vertical alignment of the thumbnails menu of the `ui5-media-gallery` component.
     *
     * @enum {string}
     *
     * @alias module:sap/ushell/gen/ui5/webcomponents-fiori.MediaGalleryMenuVerticalAlign
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori MediaGalleryMenuVerticalAlign
     *
     * @public
     */
    pkg["MediaGalleryMenuVerticalAlign"] = {
      /**
       * Displays the menu at the top of the reference control.
       *
       * @public
       */
      Top: "Top",
      /**
       * Displays the menu at the bottom of the reference control.
       *
       * @public
       */
      Bottom: "Bottom",
    }
    registerEnum(
      "sap.ushell.gen.ui5.webcomponents-fiori.MediaGalleryMenuVerticalAlign",
      pkg["MediaGalleryMenuVerticalAlign"],
    )
    /**
     * Specifies the navigation layout mode.
     *
     * @enum {string}
     *
     * @alias module:sap/ushell/gen/ui5/webcomponents-fiori.NavigationLayoutMode
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori NavigationLayoutMode
     *
     * @public
     */
    pkg["NavigationLayoutMode"] = {
      /**
       * Automatically calculates the navigation layout mode based on the screen device type.
       * &#x60;Expanded&#x60; on desktop and &#x60;Collapsed&#x60; on tablet and phone.
       *
       * @public
       */
      Auto: "Auto",
      /**
       * Collapsed side navigation.
       *
       * @public
       */
      Collapsed: "Collapsed",
      /**
       * Expanded side navigation.
       *
       * @public
       */
      Expanded: "Expanded",
    }
    registerEnum(
      "sap.ushell.gen.ui5.webcomponents-fiori.NavigationLayoutMode",
      pkg["NavigationLayoutMode"],
    )
    /**
     * Different types of NotificationListItemImportance.
     *
     * @enum {string}
     *
     * @alias module:sap/ushell/gen/ui5/webcomponents-fiori.NotificationListItemImportance
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori NotificationListItemImportance
     *
     * @public
     */
    pkg["NotificationListItemImportance"] = {
      /**
       * @public
       */
      Standard: "Standard",
      /**
       * @public
       */
      Important: "Important",
    }
    registerEnum(
      "sap.ushell.gen.ui5.webcomponents-fiori.NotificationListItemImportance",
      pkg["NotificationListItemImportance"],
    )
    /**
     * Available Page Background Design.
     *
     * @enum {string}
     *
     * @alias module:sap/ushell/gen/ui5/webcomponents-fiori.PageBackgroundDesign
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori PageBackgroundDesign
     *
     * @public
     */
    pkg["PageBackgroundDesign"] = {
      /**
       * Page background color when a List is set as the Page content.
       *
       * @public
       */
      List: "List",
      /**
       * A solid background color dependent on the theme.
       *
       * @public
       */
      Solid: "Solid",
      /**
       * Transparent background for the page.
       *
       * @public
       */
      Transparent: "Transparent",
    }
    registerEnum(
      "sap.ushell.gen.ui5.webcomponents-fiori.PageBackgroundDesign",
      pkg["PageBackgroundDesign"],
    )
    /**
     * Search mode options.
     *
     * @enum {string}
     *
     * @alias module:sap/ushell/gen/ui5/webcomponents-fiori.SearchMode
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori SearchMode
     *
     * @public
     */
    pkg["SearchMode"] = {
      /**
       * Search field with default appearance.
       *
       * @public
       */
      Default: "Default",
      /**
       * Search field with additional scope select.
       *
       * @public
       */
      Scoped: "Scoped",
    }
    registerEnum("sap.ushell.gen.ui5.webcomponents-fiori.SearchMode", pkg["SearchMode"])
    /**
     * SideContent FallDown options.
     *
     * @enum {string}
     *
     * @alias module:sap/ushell/gen/ui5/webcomponents-fiori.SideContentFallDown
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori SideContentFallDown
     *
     * @public
     */
    pkg["SideContentFallDown"] = {
      /**
       * Side content falls down on breakpoints below XL
       *
       * @public
       */
      BelowXL: "BelowXL",
      /**
       * Side content falls down on breakpoints below L
       *
       * @public
       */
      BelowL: "BelowL",
      /**
       * Side content falls down on breakpoints below M
       *
       * @public
       */
      BelowM: "BelowM",
      /**
       * Side content falls down on breakpoint M and the minimum width for the side content
       *
       * @public
       */
      OnMinimumWidth: "OnMinimumWidth",
    }
    registerEnum(
      "sap.ushell.gen.ui5.webcomponents-fiori.SideContentFallDown",
      pkg["SideContentFallDown"],
    )
    /**
     * Side Content position options.
     *
     * @enum {string}
     *
     * @alias module:sap/ushell/gen/ui5/webcomponents-fiori.SideContentPosition
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori SideContentPosition
     *
     * @public
     */
    pkg["SideContentPosition"] = {
      /**
       * The side content is on the right side of the main container
       * in left-to-right mode and on the left side in right-to-left mode.
       *
       * @public
       */
      End: "End",
      /**
       * The side content is on the left side of the main container
       * in left-to-right mode and on the right side in right-to-left mode.
       *
       * @public
       */
      Start: "Start",
    }
    registerEnum(
      "sap.ushell.gen.ui5.webcomponents-fiori.SideContentPosition",
      pkg["SideContentPosition"],
    )
    /**
     * Side Content visibility options.
     *
     * @enum {string}
     *
     * @alias module:sap/ushell/gen/ui5/webcomponents-fiori.SideContentVisibility
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori SideContentVisibility
     *
     * @public
     */
    pkg["SideContentVisibility"] = {
      /**
       * Show the side content on any breakpoint
       *
       * @public
       */
      AlwaysShow: "AlwaysShow",
      /**
       * Show the side content on XL breakpoint
       *
       * @public
       */
      ShowAboveL: "ShowAboveL",
      /**
       * Show the side content on L and XL breakpoints
       *
       * @public
       */
      ShowAboveM: "ShowAboveM",
      /**
       * Show the side content on M, L and XL breakpoints
       *
       * @public
       */
      ShowAboveS: "ShowAboveS",
      /**
       * Don&#x27;t show the side content on any breakpoints
       *
       * @public
       */
      NeverShow: "NeverShow",
    }
    registerEnum(
      "sap.ushell.gen.ui5.webcomponents-fiori.SideContentVisibility",
      pkg["SideContentVisibility"],
    )
    /**
     * SideNavigationItem designs.
     *
     * @enum {string}
     *
     * @alias module:sap/ushell/gen/ui5/webcomponents-fiori.SideNavigationItemDesign
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori SideNavigationItemDesign
     *
     * @public
     */
    pkg["SideNavigationItemDesign"] = {
      /**
       * Design for items that perform navigation, contain navigation child items, or both.
       *
       * @public
       */
      Default: "Default",
      /**
       * Design for items that trigger an action, such as opening a dialog.
       *
       * **Note:** Items with this design must not have sub-items.
       *
       * **Note:** Items that open a dialog must set &#x60;hasPopup&#x3D;&quot;dialog&quot;&#x60; via &#x60;accessibilityAttributes&#x60; property.
       *
       * @public
       */
      Action: "Action",
    }
    registerEnum(
      "sap.ushell.gen.ui5.webcomponents-fiori.SideNavigationItemDesign",
      pkg["SideNavigationItemDesign"],
    )
    /**
     * Timeline growing modes.
     *
     * @enum {string}
     *
     * @alias module:sap/ushell/gen/ui5/webcomponents-fiori.TimelineGrowingMode
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori TimelineGrowingMode
     *
     * @public
     */
    pkg["TimelineGrowingMode"] = {
      /**
       * Event &#x60;load-more&#x60; is fired
       * upon pressing a &quot;More&quot; button at the end.
       *
       * @public
       */
      Button: "Button",
      /**
       * Event &#x60;load-more&#x60; is fired upon scroll.
       *
       * @public
       */
      Scroll: "Scroll",
      /**
       * The growing feature is not enabled.
       *
       * @public
       */
      None: "None",
    }
    registerEnum(
      "sap.ushell.gen.ui5.webcomponents-fiori.TimelineGrowingMode",
      pkg["TimelineGrowingMode"],
    )
    /**
     * Available Timeline layout orientation
     *
     * @enum {string}
     *
     * @alias module:sap/ushell/gen/ui5/webcomponents-fiori.TimelineLayout
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori TimelineLayout
     *
     * @public
     */
    pkg["TimelineLayout"] = {
      /**
       * Vertical layout
       * Default type
       *
       * @public
       */
      Vertical: "Vertical",
      /**
       * Horizontal layout
       *
       * @public
       */
      Horizontal: "Horizontal",
    }
    registerEnum(
      "sap.ushell.gen.ui5.webcomponents-fiori.TimelineLayout",
      pkg["TimelineLayout"],
    )
    /**
     * Different UploadCollection selection modes.
     *
     * @enum {string}
     *
     * @alias module:sap/ushell/gen/ui5/webcomponents-fiori.UploadCollectionSelectionMode
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori UploadCollectionSelectionMode
     *
     * @public
     */
    pkg["UploadCollectionSelectionMode"] = {
      /**
       * Default mode (no selection).
       *
       * @public
       */
      None: "None",
      /**
       * Right-positioned single selection mode (only one list item can be selected).
       *
       * @public
       */
      Single: "Single",
      /**
       * Left-positioned single selection mode (only one list item can be selected).
       *
       * @public
       */
      SingleStart: "SingleStart",
      /**
       * Selected item is highlighted but no selection element is visible
       * (only one list item can be selected).
       *
       * @public
       */
      SingleEnd: "SingleEnd",
      /**
       * Selected item is highlighted and selection is changed upon arrow navigation
       * (only one list item can be selected - this is always the focused item).
       *
       * @public
       */
      SingleAuto: "SingleAuto",
      /**
       * Multi selection mode (more than one list item can be selected).
       *
       * @public
       */
      Multiple: "Multiple",
    }
    registerEnum(
      "sap.ushell.gen.ui5.webcomponents-fiori.UploadCollectionSelectionMode",
      pkg["UploadCollectionSelectionMode"],
    )
    /**
     * Different types of UploadState.
     *
     * @enum {string}
     *
     * @alias module:sap/ushell/gen/ui5/webcomponents-fiori.UploadState
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori UploadState
     *
     * @public
     */
    pkg["UploadState"] = {
      /**
       * The file has been uploaded successfully.
       *
       * @public
       */
      Complete: "Complete",
      /**
       * The file cannot be uploaded due to an error.
       *
       * @public
       */
      Error: "Error",
      /**
       * The file is awaiting an explicit command to start being uploaded.
       *
       * @public
       */
      Ready: "Ready",
      /**
       * The file is currently being uploaded.
       *
       * @public
       */
      Uploading: "Uploading",
    }
    registerEnum("sap.ushell.gen.ui5.webcomponents-fiori.UploadState", pkg["UploadState"])
    /**
     * Different types of Bar.
     *
     * @enum {string}
     *
     * @alias module:sap/ushell/gen/ui5/webcomponents-fiori.ViewSettingsDialogMode
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori ViewSettingsDialogMode
     *
     * @public
     */
    pkg["ViewSettingsDialogMode"] = {
      /**
       * Default type
       *
       * @public
       */
      Sort: "Sort",
      /**
       * Filter type
       *
       * @public
       */
      Filter: "Filter",
    }
    registerEnum(
      "sap.ushell.gen.ui5.webcomponents-fiori.ViewSettingsDialogMode",
      pkg["ViewSettingsDialogMode"],
    )
    /**
     * Enumeration for different content layouts of the `ui5-wizard`.
     *
     * @enum {string}
     *
     * @alias module:sap/ushell/gen/ui5/webcomponents-fiori.WizardContentLayout
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori WizardContentLayout
     *
     * @public
     */
    pkg["WizardContentLayout"] = {
      /**
       * Display the content of the &#x60;ui5-wizard&#x60; as multiple steps in a scroll section.
       *
       * @public
       */
      MultipleSteps: "MultipleSteps",
      /**
       * Display the content of the &#x60;ui5-wizard&#x60; as single step.
       *
       * @public
       */
      SingleStep: "SingleStep",
    }
    registerEnum(
      "sap.ushell.gen.ui5.webcomponents-fiori.WizardContentLayout",
      pkg["WizardContentLayout"],
    )

    // Interfaces
    /**
     * Interface for components that can be slotted inside `ui5-media-gallery` as items.
     *
     * @interface
     *
     * @name module:sap/ushell/gen/ui5/webcomponents-fiori.IMediaGalleryItem
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori IMediaGalleryItem
     *
     * @public
     */
    /**
     * Interface for components that may be slotted inside `ui5-product-switch` as items
     *
     * @interface
     *
     * @name module:sap/ushell/gen/ui5/webcomponents-fiori.IProductSwitchItem
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori IProductSwitchItem
     *
     * @public
     */
    /**
     * Interface for components that may be slotted inside a `ui5-search`
     *
     * @interface
     *
     * @name module:sap/ushell/gen/ui5/webcomponents-fiori.ISearchScope
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori ISearchScope
     *
     * @public
     */
    /**
     * Interface for components that may be slotted inside `ui5-timeline` as items
     *
     * @interface
     *
     * @name module:sap/ushell/gen/ui5/webcomponents-fiori.ITimelineItem
     *
     * @ui5-module-override sap/ushell/gen/ui5/webcomponents-fiori ITimelineItem
     *
     * @public
     */

    return pkg
  },
)

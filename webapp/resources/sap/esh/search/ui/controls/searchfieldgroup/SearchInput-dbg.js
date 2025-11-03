/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../i18n", "sap/m/Input", "sap/m/Label", "sap/m/Text", "sap/m/library", "sap/m/Column", "sap/m/ColumnListItem", "sap/m/CustomListItem", "sap/m/FlexItemData", "sap/m/BusyIndicator", "sap/m/FlexBox", "sap/ui/core/Icon", "sap/ui/layout/HorizontalLayout", "sap/ui/layout/VerticalLayout", "sap/ui/model/BindingMode", "../../SearchHelper", "../../suggestions/SuggestionType", "../../SearchShellHelperHorizonTheme", "../../eventlogging/UserEvents", "../../UIEvents", "sap/ui/Device", "./SearchObjectSuggestionImage", "sap/ui/core/Element", "sap/ui/core/EventBus", "sap/base/Log", "sap/m/Link"], function (__i18n, Input, Label, Text, sap_m_library, Column, ColumnListItem, CustomListItem, FlexItemData, BusyIndicator, FlexBox, Icon, HorizontalLayout, VerticalLayout, BindingMode, SearchHelper, __SuggestionType, __SearchShellHelperHorizonTheme, ____eventlogging_UserEvents, __UIEvents, Device, __SearchObjectSuggestionImage, Element, EventBus, Log, Link) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const i18n = _interopRequireDefault(__i18n);
  const FlexAlignItems = sap_m_library["FlexAlignItems"];
  const FlexDirection = sap_m_library["FlexDirection"];
  const FlexJustifyContent = sap_m_library["FlexJustifyContent"];
  const ListType = sap_m_library["ListType"];
  const SuggestionType = _interopRequireDefault(__SuggestionType);
  const UISuggestionType = __SuggestionType["Type"];
  const isSearchSuggestion = __SuggestionType["isSearchSuggestion"];
  const SearchShellHelperHorizonTheme = _interopRequireDefault(__SearchShellHelperHorizonTheme);
  const UserEventType = ____eventlogging_UserEvents["UserEventType"];
  const UIEvents = _interopRequireDefault(__UIEvents);
  const SearchObjectSuggestionImage = _interopRequireDefault(__SearchObjectSuggestionImage);
  /**
   * @namespace sap.esh.search.ui.controls
   */
  const SearchInput = Input.extend("sap.esh.search.ui.controls.SearchInput", {
    renderer: {
      apiVersion: 2
    },
    constructor: function _constructor(sId, options) {
      this.logger = Log.getLogger("sap.esh.search.ui.SearchInput");
      this.triggerSuggestionItemSelected = false;
      // ugly hack disable fullscreen input on phone - start     // ToDo: remove by switching search input to sap.m.SearchField
      // see also method isMobileDevice
      const phone = Device.system.phone;
      try {
        Device.system.phone = false; // ToDo, 'phone' is a constant (read-only)
        Input.prototype.constructor.call(this, sId, options);
      } finally {
        Device.system.phone = phone; // ToDo, 'phone' is a constant (read-only)
        // ugly hack - end
      }
      this.decorateHandleListNavigation();
      this.setStartSuggestion(0);
      this.setWidth("100%");
      this.setShowValueStateMessage(false);
      this.setShowTableSuggestionValueHelp(false);
      this.setEnableSuggestionsHighlighting(false);
      this.setShowSuggestion(true);
      this.setFilterSuggests(false);
      this.addSuggestionColumn(new Column(""));
      this.attachSuggestionItemSelected(this.handleSuggestionItemSelected.bind(this));
      this.setAutocomplete(false);
      this.setTooltip(i18n.getText("search"));
      this.bindProperty("placeholder", {
        path: "/searchTermPlaceholder",
        mode: BindingMode.OneWay
      });
      this.attachLiveChange(this.handleLiveChange.bind(this));
      this.setValueLiveUpdate(true);
      this.bindProperty("enabled", {
        parts: [{
          path: "/initializingObjSearch"
        }],
        formatter: initializingObjSearch => !initializingObjSearch
      });
      this.bindAggregation("suggestionRows", {
        path: "/suggestions",
        factory: (sId, oContext) => this.suggestionItemFactory(sId, oContext)
      });
      this.bindProperty("value", {
        path: "/uiFilter/searchTerm"
      });
      this.addStyleClass("searchInput");

      // disable fullscreen input on phone
      this._bUseDialog = false;
      this._bFullScreen = false;
      this.listNavigationMode = false;
    },
    isMobileDevice: function _isMobileDevice() {
      // ugly hack disable fullscreen input on phone - start
      return false;
      // ugly hack disable fullscreen input on phone - end
    },
    onfocusin: function _onfocusin(oEvent) {
      // keep type 'JQuery.Event' here, because of sap.m.Input, function 'onfocusin'
      Input.prototype.onfocusin.call(this, oEvent);
      const relatedTarget = oEvent.relatedTarget;
      if (relatedTarget?.classList?.contains("searchSuggestionColumnListItem") || this["_oSuggPopover"].isOpen()) {
        // this ignores focus events caused by clicking on suggestions items
        // focus events on suggestions items my cause side:
        // sometimes focus event sometimes is faster then suggestionItemSelected
        // in case suggestion list is cleared by focus event in suggestion handler
        // the subsequent suggestionsItem selected event fails
        return;
      }
      const oModel = this.getModel();
      if (oModel.getSearchBoxTerm().length === 0 && (oModel.config.bRecentSearches || oModel.config.aiSuggestions)) {
        oModel.doSuggestion();
      }
    },
    onsapenter: function _onsapenter(...args) {
      // if (!(this["_oSuggestionPopup"]?.isOpen() && this["_oSuggPopover"].getFocusedListItem())) {
      //     // if (!(this._oSuggestionPopup && this._oSuggestionPopup.isOpen() && this.["_oSuggPopover"]._iPopupListSelectedIndex >= 0)) {
      //     // check that enter happened in search input box and not on a suggestion item
      //     // enter on a suggestion is not handled in onsapenter but in handleSuggestionItemSelected
      //     (this.getModel() as SearchModel).invalidateQuery();
      //     this.triggerSearch();
      // }
      const isSuggestionFocused = this["_oSuggestionPopup"]?.isOpen() && this["_oSuggPopover"].getFocusedListItem();
      if (!isSuggestionFocused) {
        // no suggestion item focused -> trigger search
        this.getModel().invalidateQuery();
        this.triggerSearch();
        Input.prototype.onsapenter.apply(this, args);
      } else {
        // sugestion item focused -> trigger suggestion
        this.triggerSuggestionItemSelected = true;
        Input.prototype.onsapenter.apply(this, args);
        this.triggerSuggestionItemSelected = false;
      }
      // Input.prototype.onsapenter.apply(this, args);
    },
    // overwrite of UI5 base class method
    // this method is called by UI5 and triggers the suggestionItemSelected event
    // the method is called when
    // 1) suggestion popup is closed by focus out
    // 2) suggestion popup is closed by enter on suggestion item
    // for use case 1) we don't want that the suggestionItemSelectedEvent therefore we set triggerSelectionItemSelected=false
    // for use case 2) the suggestionItemSelectedEvent shall be created therefore in method onsapenter we set temporary triggerSelectionItemSelected=true
    updateSelectionFromList: function _updateSelectionFromList(item) {
      if (this.triggerSuggestionItemSelected) {
        // default UI5 logic which triggers handleSuggestionItemSelected
        // super.updateSelectionFromList(item);
        Input.prototype.updateSelectionFromList.apply(this, [item]); // alternative writing to avoid super private method call
      } else {
        // special logic in order to prevent that UI5 triggers handleSuggestionItemSelected
        // this.setSelectionUpdatedFromList(false);
        this["setSelectionUpdatedFromList"](false); // alternative writing to avoid super private method call
      }
    },
    triggerSearch: function _triggerSearch() {
      // the footer is rerendered after each search in stand alone UI -> error popover losts parent and jumps to the screen top.
      // solution: if the error popover shows, set footer invisible before next search.
      // popover.close() is not working. It is closed after footer invisible, so it still jumps
      const msgPopupId = this.getModel().getProperty("/messagePopoverControlId");
      const messagePopup = Element.getElementById(msgPopupId);
      if (this.getModel().getProperty("/errors").length > 0 && messagePopup?.isOpen()) {
        messagePopup.close();
        messagePopup.setVisible(false);
      }
      // it is necessay to do this in search input (and not in search model) because otherwise navigating back from the app to the
      // search UI would result in a repeated navigation to the app
      SearchHelper.subscribeOnlyOnce("triggerSearch", UIEvents.ESHSearchFinished, function () {
        this.getModel().autoStartApp();
      }, this);
      const oModel = this.getModel();
      if (this.getValue().trim() === "" && oModel.config.isUshell) {
        this.setValue("*"); // special behaviour for S/4
      }
      if (this.isNavigationAllowed()) {
        this.navigateToSearchApp();
      }
      this.destroySuggestionRows();
      oModel.abortSuggestions();
    },
    isNavigationAllowed: function _isNavigationAllowed() {
      const oModel = this.getModel();
      const searchBoxTerm = this.getValue();
      for (const handler of oModel.searchTermHandlers) {
        const searchTermWasHandled = handler.handleSearchTerm(searchBoxTerm);
        if (searchTermWasHandled === true) {
          this.focus(); // make sure that suggestions are visible in case there is an error message to show therein
          return false;
        }
      }
      return true;
    },
    decorateHandleListNavigation: function _decorateHandleListNavigation() {
      // ugly modifiaction: headers and busy indicator in suggestions shall not be selectable
      const suggestionPopover = this["_oSuggPopover"];
      if (suggestionPopover && suggestionPopover.handleListNavigation && !suggestionPopover.handleListNavigation.decorated) {
        const handleListNavigation = suggestionPopover.handleListNavigation;
        suggestionPopover.handleListNavigation = (...args) => {
          this.listNavigationMode = true;
          handleListNavigation.apply(suggestionPopover, args);
          // -handleListNavigation calls getVisible on the suggestion items in order to determine to which suggestion items we can navigate
          // -for suggestion items of type 'header' or 'busy indicator' (to which no navigation shall take place) the getVisible function is overwritten
          // -the overwritten getVisible function returns false only for listNavigationMode=true
          // ==> this way suggestion items of type 'header' or 'busy indicator' are visible but we cannot navigate to them
          this.listNavigationMode = false;
        };
        suggestionPopover.handleListNavigation.decorated = true;
      }
    },
    handleLiveChange: function _handleLiveChange() {
      const oModel = this.getModel();
      if (oModel.getSearchBoxTerm().length > 0 || oModel.config.bRecentSearches) {
        oModel.doSuggestion();
      } else {
        this.destroySuggestionRows();
        oModel.abortSuggestions();
        // set aria-expanded to false on the input element
        const domRef = this.getDomRef();
        if (domRef) {
          const input = domRef.querySelector("input");
          if (input) {
            input.setAttribute("aria-expanded", "false");
          }
        }
      }
    },
    handleSuggestionItemSelected: function _handleSuggestionItemSelected(oEvent) {
      const oModel = this.getModel();
      const searchBoxTerm = oModel.getSearchBoxTerm();
      const suggestion = oEvent.getParameter("selectedRow").getBindingContext().getObject();
      const suggestionTerm = suggestion.searchTerm || "";
      const dataSource = suggestion.dataSource || oModel.getDataSource();
      let targetURL = suggestion.url;
      const type = suggestion.uiSuggestionType;
      if (type === SuggestionType.Header || type === SuggestionType.BusyIndicator) {
        // workaroung in case someonw clicks on a header
        this.destroySuggestionRows();
        this.setValue("");
        return;
      }
      oModel.eventLogger.logEvent({
        type: UserEventType.SUGGESTION_SELECT,
        suggestionTitle: suggestion.title,
        suggestionType: type,
        suggestionTerm: suggestionTerm,
        searchTerm: searchBoxTerm,
        targetUrl: targetURL,
        dataSourceKey: dataSource ? dataSource.id : ""
      });
      if (oModel.config.bRecentSearches && oModel.recentlyUsedStorage && type === SuggestionType.Object) {
        // Object Suggestions in DSP open in new tab, thus we need to save it here.
        // All other suggestions trigger a search which will be added as a recent item through search model.
        oModel.recentlyUsedStorage.addItem(suggestion);
      }

      // remove any selection
      this.selectText(0, 0);
      switch (type) {
        case SuggestionType.Search:
          {
            if (isSearchSuggestion(suggestion)) {
              suggestion.titleNavigation.performNavigation();
            }
            break;
          }
        case SuggestionType.Transaction:
        case SuggestionType.App:
          // app or transactions suggestions -> start app

          // starting the app by hash change closes the suggestion popup
          // closing the suggestion popup again triggers the suggestion item selected event
          // in order to avoid to receive the event twice the suggestions are destroyed
          this.destroySuggestionRows();
          oModel.abortSuggestions();
          if (targetURL[0] === "#") {
            if (targetURL.indexOf("#Action-search") === 0 && (targetURL === SearchHelper.getHashFromUrl() || targetURL === decodeURIComponent(SearchHelper.getHashFromUrl()))) {
              // ugly workaround
              // in case the app suggestion points to the search app with query identical to current query
              // --> do noting except: restore query term + focus again the first item in the result list
              oModel.setSearchBoxTerm(oModel.query.filter.searchTerm, false);
              oModel.setDataSource(oModel.query.filter.dataSource, false);
              oModel.notifySubscribers(UIEvents.ESHSearchFinished);
              EventBus.getInstance().publish(UIEvents.ESHSearchFinished);
              return;
            }
            if (window["hasher"]) {
              if (targetURL[1] === window.hasher.prependHash) {
                // hasher preprends a "prependHash" character between "#" and the rest.
                // so we remove the same character to have the desired string in the end after hasher changed it
                // this avoids a wrong url if the application does not use window.hasher.getHash which removes prependHash again
                targetURL = targetURL.slice(0, 1) + targetURL.slice(2);
              }
              window["hasher"].setHash(targetURL);
            } else {
              window.location.href = targetURL;
            }
          } else {
            // special logging: only for urls started via suggestions
            // (apps/urls started via click ontile have logger in tile click handler)
            this.logRecentActivity(suggestion);
            window.open(targetURL, "_blank", "noopener,noreferrer");
            oModel.setSearchBoxTerm("", false);
          }

          // close the search field if suggestion is not search app
          if (oModel.config.isUshell && targetURL.indexOf("#Action-search") !== 0) {
            // 1) navigate to an app <> search
            if (!SearchShellHelperHorizonTheme.isSearchFieldExpandedByDefault()) {
              sap.ui.require("sap/esh/search/ui/SearchShellHelper").collapseSearch();
            }
          } else {
            // 2) navigate to search app
            this.focus();
          }
          break;
        case SuggestionType.DataSource:
          // data source suggestions
          // -> change datasource in dropdown
          // -> do not start search
          oModel.setDataSource(dataSource, false);
          oModel.setSearchBoxTerm("", false);
          this.focus();
          break;
        case SuggestionType.SearchTermData:
        case SuggestionType.SearchTermAI:
          // -> change search term + change datasource + start search
          oModel.setDataSource(dataSource, false);
          oModel.setSearchBoxTerm(suggestionTerm, false);
          oModel.invalidateQuery();
          this.navigateToSearchApp();
          break;
        case SuggestionType.SearchTermHistory:
          // history
          // -> change search term + change datasource + start search
          oModel.setDataSource(dataSource, false);
          oModel.setSearchBoxTerm(suggestionTerm, false);
          oModel.invalidateQuery();
          this.navigateToSearchApp();
          break;
        case SuggestionType.Object:
          {
            const objectSuggestion = suggestion;
            if (objectSuggestion.titleNavigation) {
              objectSuggestion.titleNavigation.performNavigation();
            }
            break;
          }
        default:
          break;
      }
    },
    logRecentActivity: function _logRecentActivity(suggestion) {
      // load ushell deps lazy only in case of FLP
      sap.ui.require(["sap/ushell/Config", "sap/ushell/services/AppType"], function (Config, AppType) {
        const bLogRecentActivity = Config.last("/core/shell/enableRecentActivity") && Config.last("/core/shell/enableRecentActivityLogging");
        if (bLogRecentActivity) {
          const oRecentEntry = {
            title: suggestion.title,
            appType: AppType.URL,
            url: suggestion.url,
            appId: suggestion.url
          };
          window.sap.ushell.Container.getRenderer("fiori2").logRecentActivity(oRecentEntry);
        }
      });
    },
    suggestionItemFactory: function _suggestionItemFactory(sId, oContext) {
      // set aria-expanded to true on the input element
      const domRef = this.getDomRef();
      if (domRef) {
        const input = domRef.querySelector("input");
        if (input) {
          input.setAttribute("aria-expanded", "true");
        }
      }
      const suggestion = oContext.getObject();
      switch (suggestion.uiSuggestionType) {
        case SuggestionType.Object:
          return this.objectSuggestionItemFactory(sId, oContext);
        case SuggestionType.Header:
          return this.headerSuggestionItemFactory(sId, oContext);
        case SuggestionType.BusyIndicator:
          return this.busyIndicatorSuggestionItemFactory(/* sId, oContext */);
        default:
          return this.regularSuggestionItemFactory(sId, oContext);
      }
    },
    busyIndicatorSuggestionItemFactory: function _busyIndicatorSuggestionItemFactory() {
      const cell = new VerticalLayout("", {
        content: [new BusyIndicator("", {
          size: "0.6rem"
        })]
      });
      cell["getText"] = () => {
        return this.getValue();
      };
      const listItem = new ColumnListItem("", {
        cells: [cell],
        type: ListType.Inactive
      });
      listItem.addStyleClass("searchSuggestion");
      listItem.addStyleClass("searchBusyIndicatorSuggestion");
      listItem.getVisible = this.assembleListNavigationModeGetVisibleFunction();
      return listItem;
    },
    headerSuggestionItemFactory: function _headerSuggestionItemFactory(sId, oContext) {
      const suggestion = oContext.getObject();
      const items = [];

      // left
      const leftItems = [];
      if (suggestion.uiSuggestionTypeOfSuggestionsInSection === UISuggestionType.SearchTermAI) {
        const icon = new Icon({
          src: "sap-icon://ai"
        });
        icon.addStyleClass("sapUiTinyMarginEnd");
        leftItems.push(icon);
      }
      const label = new Label("", {
        text: {
          path: "label"
        }
      });
      leftItems.push(label);
      const leftContent = new FlexBox("", {
        direction: FlexDirection.Row,
        justifyContent: FlexJustifyContent.Start,
        items: leftItems
      });
      items.push(leftContent);

      // right
      if (suggestion.helpLink) {
        const rightContent = new Link({
          text: i18n.getText("searchTermAILernMoreLink"),
          target: "_blank",
          href: suggestion.helpLink
        });
        items.push(rightContent);
      }

      // flexbox containing left and right
      const cell = new FlexBox("", {
        direction: FlexDirection.Row,
        justifyContent: FlexJustifyContent.SpaceBetween,
        items: items
      });
      cell["getText"] = () => {
        //return this.getValue();
        return suggestion.label;
        // workaround: return " " -> header cannot be auto selected by sap.m.Input because
        // input field text != suggestion.label " "
      };

      // column list item containing flexbo
      const listItem = new ColumnListItem("", {
        cells: [cell],
        type: ListType.Inactive
      });
      listItem.addStyleClass("searchSuggestion");
      listItem.addStyleClass("searchHeaderSuggestion");
      listItem.getVisible = this.assembleListNavigationModeGetVisibleFunction();
      return listItem;
    },
    assembleListNavigationModeGetVisibleFunction: function _assembleListNavigationModeGetVisibleFunction() {
      return () => {
        if (!this.listNavigationMode) {
          return true; // without the special list navigation mode we return the default value true
        }
        // in list navigation mode
        return false;
      };
    },
    assembleObjectSuggestionLabels: function _assembleObjectSuggestionLabels(suggestion) {
      // first line: label 1
      const labels = [];
      const label1 = new Label("", {
        text: {
          path: "label1"
        }
      });
      label1.addEventDelegate({
        onAfterRendering: () => {
          SearchHelper.boldTagUnescaper(label1.getDomRef());
        }
      }, label1);
      label1.addStyleClass("sapUshellSearchObjectSuggestion-Label1");
      labels.push(label1);

      // second line: label 2
      if (suggestion.label2) {
        const label2 = new Label("", {
          text: {
            path: "label2"
          }
        });
        label2.addEventDelegate({
          onAfterRendering: () => {
            SearchHelper.boldTagUnescaper(label2.getDomRef());
          }
        }, label2);
        label2.addStyleClass("sapUshellSearchObjectSuggestion-Label2");
        labels.push(label2);
      }
      const vLayout = new VerticalLayout("", {
        content: labels
      });
      vLayout.addStyleClass("sapUshellSearchObjectSuggestion-Labels");
      return vLayout;
    },
    objectSuggestionItemFactory: function _objectSuggestionItemFactory(sId, oContext) {
      const suggestion = oContext.getObject();
      const suggestionParts = [];

      // image
      if (suggestion.imageExists && suggestion.imageUrl) {
        if (suggestion.imageUrl.startsWith("sap-icon://")) {
          suggestionParts.push(new Icon("", {
            src: suggestion.imageUrl
          }).addStyleClass("sapUshellSearchObjectSuggestIcon"));
        } else {
          suggestionParts.push(new SearchObjectSuggestionImage("", {
            src: {
              path: "imageUrl"
            },
            isCircular: {
              path: "imageIsCircular"
            }
          }));
        }
      }

      // labels
      const suggestionPartsToAdd = this.assembleObjectSuggestionLabels(suggestion);
      suggestionParts.push(suggestionPartsToAdd);

      // combine image and labels
      const cell = new HorizontalLayout("", {
        content: suggestionParts
      });
      cell.addStyleClass("sapUshellSearchObjectSuggestion-Container");

      // there is an issue with focus on suggestions, which will be triggerd by loss of focus on the suggestion item
      // workaround: to avoid auto focus on object suggestions, we don't return the value of getText, so that the focus is not set
      // with solution above by overwriting of private method updateSelectionFromList, it could work without workaround
      cell["getText"] = () => {
        return this.getValue();
      };

      // suggestion list item
      const listItem = new ColumnListItem("", {
        cells: [cell],
        type: ListType.Active
      });
      listItem.addStyleClass("searchSuggestion");
      listItem.addStyleClass("searchObjectSuggestion");
      return listItem;
    },
    regularSuggestionItemFactory: function _regularSuggestionItemFactory(sId, oContext) {
      // icon at the front:
      const icon = new Icon("", {
        src: {
          path: "icon"
        }
      }).addStyleClass("suggestIcon").addStyleClass("sapUshellSearchSuggestAppIcon").addStyleClass("suggestListItemCell");

      // recent search suggestions which have a filter will get this additional icon
      // at the end of the line:
      const filterIcon = new Icon("", {
        src: {
          path: "filterIcon"
        }
      }).addStyleClass("suggestIcon").addStyleClass("sapUshellSearchSuggestFilterIcon").addStyleClass("suggestListItemCell");
      const layoutData = new FlexItemData("", {
        shrinkFactor: 1,
        minWidth: "4rem"
      });

      // label
      const label = new Text("", {
        text: {
          path: "label"
        },
        layoutData: layoutData,
        wrapping: false
      }).addStyleClass("suggestText").addStyleClass("suggestNavItem").addStyleClass("suggestListItemCell");
      const suggestion = oContext.getModel().getProperty(oContext.getPath());
      label.addEventDelegate({
        onAfterRendering: () => {
          const domref = label.getDomRef();
          const innerHTML = domref.innerHTML;
          const hasSpan = innerHTML.lastIndexOf("&lt;/span&gt;") > 0;
          if (suggestion.uiSuggestionType === SuggestionType.Search && hasSpan) {
            // recent suggestions can be entered by the user. Thus he could also enter "<b>bold</b>" as search term
            // and the boldTagUnescaper would then render the search term as bold html.
            // TODO: call boldTagUnescaper for everything which is not in the <span>
            const userEntered = innerHTML.slice(innerHTML.indexOf("&lt;span&gt;") + 12, innerHTML.lastIndexOf("&lt;/span&gt;"));
            const notUserEntered = innerHTML.slice(innerHTML.lastIndexOf("&lt;/span&gt;") + 13);
            const notUserEnteredHTML = SearchHelper.boldTagUnescaperForStrings(notUserEntered);
            domref.innerHTML = "<span>" + userEntered + "</span>" + notUserEnteredHTML;
          } else {
            SearchHelper.boldTagUnescaper(label.getDomRef());
          }
        }
      }, label);
      const items = [icon, label];
      if (suggestion.filterIcon) {
        items.push(filterIcon);
      }

      // combine app, icon and label into cell
      const cell = new CustomListItem("", {
        type: ListType.Active,
        content: new FlexBox("", {
          items,
          alignItems: FlexAlignItems.Center
        })
      });
      cell.addStyleClass("searchSuggestionCustomListItem");
      cell["getText"] = () => {
        return typeof suggestion?.filter?.searchTerm === "string" ? suggestion.filter.searchTerm : this.getValue();
      };
      const listItem = new ColumnListItem("", {
        cells: [cell],
        type: ListType.Active
      });
      cell.addStyleClass("searchSuggestionColumnListItem");
      if (suggestion.uiSuggestionType === SuggestionType.App) {
        if (suggestion.title && suggestion.title.indexOf("combinedAppSuggestion") >= 0) {
          listItem.addStyleClass("searchCombinedAppSuggestion");
        } else {
          listItem.addStyleClass("searchAppSuggestion");
        }
      }
      if (suggestion.uiSuggestionType === SuggestionType.DataSource) {
        listItem.addStyleClass("searchDataSourceSuggestion");
      }
      if (suggestion.uiSuggestionType === SuggestionType.SearchTermData) {
        listItem.addStyleClass("searchBOSuggestion");
      }
      if (suggestion.uiSuggestionType === SuggestionType.SearchTermAI) {
        listItem.addStyleClass("searchAISuggestion");
      }
      if (suggestion.uiSuggestionType === SuggestionType.SearchTermHistory) {
        listItem.addStyleClass("searchHistorySuggestion");
      }
      if (suggestion.uiSuggestionType === SuggestionType.Search) {
        listItem.addStyleClass("searchRecentSuggestion");
      }
      listItem.addStyleClass("searchSuggestion");
      return listItem;
    },
    navigateToSearchApp: function _navigateToSearchApp() {
      const oSearchModel = this.getModel();
      if (SearchHelper.isSearchAppActive() || !oSearchModel.config.isUshell) {
        // app running -> just fire query
        oSearchModel.fireSearchQuery();
      } else {
        // app not running -> start via hash
        // change hash:
        // - do not use Searchhelper.hasher here
        // - this is starting the search app from outside
        oSearchModel.resetSearchResultItemMemory();
        const sHash = oSearchModel.createSearchNavigationTargetCurrentState({
          updateUrl: true
        }).targetUrl;
        window.location.hash = sHash;
      }
    },
    onAfterRendering: function _onAfterRendering(oEvent) {
      Input.prototype.onAfterRendering.call(this, oEvent);
      const domRef = this.getDomRef();
      if (!domRef) return;
      const input = domRef.querySelector("input");
      if (!input) return;

      // Set input attributes
      input.setAttribute("autocomplete", "off");
      input.setAttribute("autocorrect", "off");
      // Additional hacks to show the "search" button on iOS keyboards:
      input.setAttribute("type", "search");
      input.setAttribute("name", "search");

      // Create form element
      const form = document.createElement("form");
      form.style.setProperty("width", "100%");
      form.setAttribute("action", "");
      form.addEventListener("submit", e => {
        e.preventDefault();
        return false;
      });

      // Get parent of input
      const inputParent = input.parentElement;
      if (!inputParent) return;

      // Append form to parent and move input into form
      inputParent.appendChild(form);
      form.appendChild(input);

      // set ARIA attributes on the input
      input.setAttribute("role", "combobox");
      input.setAttribute("aria-autocomplete", "list");
      input.setAttribute("aria-expanded", "false");
      input.setAttribute("aria-controls", this.getId() + "-popup");
      input.setAttribute("aria-label", i18n.getText("search"));
    },
    onValueRevertedByEscape: function _onValueRevertedByEscape() {
      // this method is called if ESC was pressed and
      // the value in it was not empty
      if (SearchHelper.isSearchAppActive()) {
        // dont delete the value if search app is active
        return;
      }
      this.setValue(" "); // add space as a marker for following ESC handler
    },
    onsapescape: function _onsapescape(oEvent) {
      // keep type 'JQuery.Event' here, because of sap.m.Input, function 'onsapescape'

      // set aria-expanded to false on the input element
      const domRef = this.getDomRef();
      if (domRef) {
        const input = domRef.querySelector("input");
        if (input) {
          input.setAttribute("aria-expanded", "false");
        }
      }
      Input.prototype.onsapescape.call(this, oEvent);
    }
  });
  return SearchInput;
});
//# sourceMappingURL=SearchInput-dbg.js.map

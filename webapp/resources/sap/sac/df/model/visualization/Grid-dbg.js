/*! SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
   */
sap.ui.define(
  "sap/sac/df/model/visualization/Grid",
  [
    "sap/ui/base/Object",
    "sap/sac/df/thirdparty/lodash",
    "sap/sac/df/firefly/library",
    "sap/sac/df/utils/SyncActionHelper",
    "sap/sac/df/model/MemberFilter",
    "sap/sac/df/types/DimensionType",
    "sap/sac/df/types/Axis",
    "sap/sac/df/utils/ListHelper",
    "sap/sac/df/model/visualization/Documents"
  ], /*eslint-disable max-params*/
  function (
    BaseObject,
    _,
    FF,
    SyncActionHelper,
    MemberFilter,
    DimensionType,
    AxisType,
    ListHelper,
    Document
  ) {
    "use strict";
    /*eslint-disable max-statements*/
    /**
         * @class
         * Grid Visualization Object
         *
         * @author SAP SE
         * @version 1.141.0
         * @public
         * @hideconstructor
         * @ui5-experimental-since 1.132
         * @alias sap.sac.df.model.visualization.Grid
         */
    var Grid = BaseObject.extend("sap.sac.df.model.visualization.Grid", /** @lends sap.sac.df.model.visualization.Grid.prototype */{
      constructor: function (oVisualization) {
        Object.assign(this, Object.getPrototypeOf(this));
        /** @private */
        this._Visualization = oVisualization;
        /** @private */
        this._DataProvider = oVisualization._DataProvider;
        this.Documents = new Document(this._DataProvider);
        Object.assign(this);

        this._getMemberByKey = function (oDim, sKey) {
          const oMember = _.find(oDim.getStructureMembers(), function (oStructureMember) {
            return oStructureMember && oStructureMember.Key === sKey;
          });
          return oMember && oMember.Name;
        };

        this._getVisibleMembers = function (oDimension) {
          const m_memberResults = FF.XHashMapByString.create();
          const dim = oDimension._FFDimension;
          const aVisibleMembers = [];
          return Promise.resolve().then(() => {
            let queryModel = this._DataProvider._getQueryModel();
            let structures = FF.QueryDesignerUtils.getStructureDimensions(queryModel);
            let promiseList = FF.XStream.of(structures).map((structure) => {
              return structure.getMemberManager().getMemberResult().onThen((result) => {
                m_memberResults.put(structure.getName(), result);
              });
            }).collect(FF.XPromiseList.toPromiseList());
            let allPromise = FF.XPromise.all(promiseList);
            return allPromise;
          }).then(() => {
            const members = m_memberResults.getByKey(dim.getName()).getAllNodes();
            if (!FF.XCollectionUtils.hasElements(members)) {
              return null;
            }
            let convenienceCommands = this._DataProvider._getQueryManager().getConvenienceCommands();
            let visibleMembers = convenienceCommands.getVisibleMembers(dim, members);
            if (dim.getDimensionType() === FF.DimensionType.ACCOUNT) {
              return FF.XStream.of(members).filter((a2) => {
                return visibleMembers.contains(a2.getName()) && a2.getDimensionMember().getResultVisibility() !== FF.ResultVisibility.HIDDEN;
              }).collect(FF.XStreamCollector.toListOfNameObject());
            } else {
              let memberOrder = convenienceCommands.getMembersInResultSetOrder(dim);
              return FF.XStream.of(memberOrder).filter((m) => {
                return visibleMembers.contains(m.getName()) && m.getResultVisibility() !== FF.ResultVisibility.HIDDEN;
              }).map((m2) => {
                return members.getByKey(m2.getName());
              }).collect(FF.XStreamCollector.toListOfNameObject());
            }
          }).then((oResult) => {
            if(oResult) {
              ListHelper.arrayFromList(oResult).forEach((oMember) => {
                aVisibleMembers.push(this._getMemberByKey(oDimension, oMember.getName()));
              });
            }
            return aVisibleMembers;
          });
        }.bind(this);


        /** @private */
        this._createAxesLayout = function () {
          let aMeasureStructureMembers = [];
          let aStructureMembers = [];
          const oMeasureStructureDim = this._DataProvider.getMeasureStructureDimension();
          const oStructureDim = this._DataProvider.getStructureDimension();
          return Promise.resolve().then(() => {
            if (oMeasureStructureDim) {
              return this._getVisibleMembers(oMeasureStructureDim).then((aVisibleMembers) => {
                aMeasureStructureMembers = aVisibleMembers;
              });
            }
          }).then(() => {
            if (oStructureDim) {
              return this._getVisibleMembers(oStructureDim).then((aVisibleMembers) => {
                aStructureMembers = aVisibleMembers;
              });
            }
          }).then(() => {
            return {
              Columns: _.map(_.sortBy(_.filter(this._DataProvider.Dimensions, {Axis: AxisType.Columns}), "Position"), (oDimension) => {
                return oDimension.Name;
              }),
              Rows: _.map(_.sortBy(_.filter(this._DataProvider.Dimensions, {Axis: AxisType.Rows}), "Position"), (oDimension) => {
                return oDimension.Name;
              }),
              MeasureStructureMembers: aMeasureStructureMembers,
              StructureMembers: aStructureMembers
            };
          });
        };
        /** @private */
        this._onVisualizationFilled = function () {
          return Promise.resolve(
            this._Visualization._getFFVisualization()
          ).then((oTableVisualization) => {
            if (oTableVisualization.getProtocolBindingType() === FF.ProtocolBindingType.SAC_TABLE_GRID) {
              let oActiveTableContainer = oTableVisualization.getActiveTableContainer();
              if (FF.notNull(oActiveTableContainer)) {
                const oGridCollector = oActiveTableContainer.getGridCollector();
                if (FF.notNull(oGridCollector) && oGridCollector.isValid()) {
                  let oTableVizData = oActiveTableContainer.getVisualizationData();
                  if (oTableVizData) {
                    return this._createAxesLayout();
                  }
                } else {
                  this._DataProvider._addMessagesToModel(oActiveTableContainer.getData());
                  this._DataProvider._Model.checkUpdate();
                  this._DataProvider._Model.fireRequestFailed({infoObject: this._DataProvider.Name});
                }
              }
            }
          }).then((oAxesLayout) => {
            try {
              this.AxesLayout = oAxesLayout;
              this._DataProvider._Model.checkUpdate();
              this._DataProvider.fireDataUpdated();
            } catch (e) {
              //Log.error("Grid Update failed", e);
            }
          });
        };
      }
    });

    /**
         * Get the data of the visualization
         * <pre><code>
         * "Cells": [],
         * "TotalColumns": Integer,
         * "TotalRows": Integer
         * </code></pre>
         * @returns {Promise<Object>} a promise which resolves with the visualization data
         * @public
         */
    Grid.prototype.getVisualizationData = function () {
      let oActiveTableContainer = this._Visualization._getFFVisualization().getActiveTableContainer();
      if (FF.notNull(oActiveTableContainer)) {
        const oGridCollector = oActiveTableContainer.getGridCollector();
        // oGridCollector.getData() is null in FPA10-10988
        if (FF.notNull(oGridCollector) && oActiveTableContainer.getVisualizationData() && oGridCollector.isValid()) {
          let oTableVizData = oActiveTableContainer.getVisualizationData();
          if (oTableVizData) {
            try {
              return FF.PivotTableExport.create(oTableVizData, oActiveTableContainer)._export().convertToNative();
            } catch (e) {
              //Log.error("Grid Update failed", e);
            }
          }
        }
      }
    };

    /**
         * Gets the cell context for a cell in the result set
         * @param {int} nRowIndex the row index of data cell
         * @param {int} nColumnIndex the column index of data cell
         * @returns {Promise<Object>} a promise which resolves with the retrieved cell context
         * @public
         */
    Grid.prototype.getCellContext = function (nRowIndex, nColumnIndex) {
      var that = this;
      var oCCProvider = FF.PivotTableCellContextProvider.create(that._DataProvider._getQueryManager());
      var oCellIndexInfo = FF.RsCellIndexInfo.create();
      let oActiveTableContainer = this._Visualization._getFFVisualization().getActiveTableContainer();
      const dataCellColumnIndex = oActiveTableContainer.getColumnTupleIndex(nColumnIndex);
      const dataCellRowIndex = oActiveTableContainer.getRowTupleIndex(nRowIndex);
      if (dataCellColumnIndex === -1 && dataCellRowIndex === -1) {
        return Promise.resolve("Cell could not be found!");
      }
      oCellIndexInfo.initialize(dataCellRowIndex, dataCellColumnIndex);
      let aCellContext;
      return SyncActionHelper.syncActionToPromise(
        oCCProvider.getCellContext,
        oCCProvider,
        oCellIndexInfo
      ).then((oCellContext) => {

        aCellContext = oCellContext ? oCellContext.convertToNative() : null;
        _.forEach(aCellContext, function (oCellContext) {
          oCellContext.SelectionVariant = MemberFilter.createSelectionVariantFromFFMemberFilter(oCellContext.Name, oCellContext.Filter);
          oCellContext.Filter = MemberFilter.createFromFFMemberFilter(oCellContext.Filter);
          oCellContext.MemberFilter = oCellContext.Filter;
        });
        aCellContext.Context = _.clone(aCellContext);
      }).then(() => {
        return this.getVisualizationData();
      }).then((oData) => {
        aCellContext.Cell = oData.Cells.filter((cell) => {
          return cell.Row === nRowIndex && cell.Column === nColumnIndex;
        });
        const aMeasureStructureMembers = [];
        const aStructureMembers = [];
        const aColumns = _.uniq(_.map(_.filter(oData.Cells, (cell) => {
          return cell.CellType === FF.PivotTableExportConstants.CT_DIM_MEMBER_COL && cell.Column === nColumnIndex;
        }), (colDim) => {
          if (colDim.Dimension === DimensionType.MeasureStructure) {
            aMeasureStructureMembers.push(colDim.Member);
          }
          if (colDim.Dimension === DimensionType.StructureDimension) {
            aStructureMembers.push(colDim.Member);
          }
          return colDim.Dimension;
        }));

        const aRows = _.uniq(_.map(_.filter(oData.Cells, (cell) => {
          return cell.CellType === FF.PivotTableExportConstants.CT_DIM_MEMBER_ROW && cell.Row === nRowIndex;
        }), (rowDim) => {
          if (rowDim.Dimension === DimensionType.MeasureStructure) {
            aMeasureStructureMembers.push(rowDim.Member);
          }
          if (rowDim.Dimension === DimensionType.StructureDimension) {
            aStructureMembers.push(rowDim.Member);
          }
          return rowDim.Dimension;
        }));

        aCellContext.Layout = {
          Columns: aColumns,
          Rows: aRows,
          MeasureStructureMembers: aMeasureStructureMembers,
          StructureMembers: aStructureMembers
        };

        return aCellContext;
      }).catch((oError) => {
        that._DataProvider._addMessagesToModel(oError.getMessages ? oError : []);
        return Promise.reject(oError);
      });
    };

    /**
         * Get active template
         * @return {sap.sac.df.types.configuration.TableTemplate} active template
         * @public
         */
    Grid.prototype.getActiveTemplate = function () {
      return this._DataProvider._getQueryManager().getConvenienceCommands().getLinkedTableDefinitionName(this._Visualization.Name, FF.OlapVisualizationConstants.TABLE_TEMPLATE_LINK);
    };

    /**
         * Set active template
         * @param {string} sTemplateName styling template name
         * @return {sap.sac.df.model.visualization.Grid} resolving to the axes layout object to allow chaining
         * @public
         */
    Grid.prototype.setActiveTemplate = function (sTemplateName) {
      this._DataProvider._getQueryManager().getConvenienceCommands().putLinkedTableDefinitionName(this._Visualization.Name, FF.OlapVisualizationConstants.TABLE_TEMPLATE_LINK, sTemplateName);
      return this;
    };

    /**
         * Set the dimensions on row and column axis
         * @param {sap.sac.df.model.visualization.Grid.AxesLayout} oAxisLayout an object containing the names of the dimensions on row and column axis. The order of the dimensions control the position on the axis.
         * @return {sap.sac.df.model.visualization.Grid} resolving to the axes layout object to allow chaining
         * @public
         */
    Grid.prototype.setAxesLayout = function (oAxisLayout) {

      this._DataProvider._getQueryManager().stopEventing();
      _.forEach(_.map(this._DataProvider.Dimensions, "Name"), (sDim) => {
        this._DataProvider._getQueryModel().getAxis(FF.AxisType.FREE).add(
          this._DataProvider._getQueryModel().getDimensionByName(
            this._DataProvider.getDimension(sDim).TechName
          )
        );
      });
      _.forEach(oAxisLayout[AxisType.Rows], (sDim) => {
        this._DataProvider.getDimension(sDim).toRows();
      });
      _.forEach(oAxisLayout[AxisType.Columns], (sDim) => {
        this._DataProvider.getDimension(sDim).toColumns();
      });

      const _customSort = function (oDimension) {
        const isStructureMember = oDimension._FFDimension.isStructure();
        const hierarchyActive = oDimension._FFDimension.isHierarchyActive();
        const supportsSort = FF.QueryDesignerUtils.supportsMemberSort(oDimension._FFDimension);
        return supportsSort && isStructureMember && !hierarchyActive;
      };

      const _setStructureMembers = function (oDimension, aMembers) {
        var aMemberFilter = [];
        let customOrder = FF.XList.create();
        _.forEach(aMembers, (sMember) => {
          var oStructureMember = oDimension.getStructureMember(sMember);
          if (oStructureMember) {
            var oMemberFilter = new MemberFilter([oStructureMember.Key], [oStructureMember.Name], [oStructureMember.Description]);
            aMemberFilter.push(oMemberFilter);
          }
          customOrder.add(oStructureMember.TechName);
        });
        oDimension.setMemberFilter(aMemberFilter);
        if (_customSort(oDimension)) {
          let sortingManager = oDimension._DataProvider._getQueryModel().getSortingManager();
          sortingManager.removeDimensionSorting(oDimension._FFDimension);
          sortingManager.removeFieldSorting(oDimension._FFDimension.getKeyField());
          sortingManager.applyCustomSort(oDimension._FFDimension, oDimension._FFDimension.getKeyField(), customOrder, FF.XSortDirection.ASCENDING, FF.CustomSortPosition.TOP, true);
        }
      };

      if (this._DataProvider.getMeasureStructureDimension() && oAxisLayout.MeasureStructureMembers) {
        if (oAxisLayout.MeasureStructureMembers.length > 0) {
          _setStructureMembers(this._DataProvider.getMeasureStructureDimension(), oAxisLayout.MeasureStructureMembers);
        } else if (oAxisLayout.MeasureStructureMembers === []) {
          this._DataProvider.getMeasureStructureDimension().clearMemberFilter();
        }
      }
      if (this._DataProvider.getStructureDimension() && oAxisLayout.StructureMembers) {
        if (oAxisLayout.StructureMembers.length > 0) {
          _setStructureMembers(this._DataProvider.getStructureDimension(), oAxisLayout.StructureMembers);
        } else if (oAxisLayout.StructureMembers === []) {
          this._DataProvider.getStructureDimension().clearMemberFilter();
        }
      }

      this._DataProvider._FFDataProvider.getEventing().notifyExternalModelChange(null);
      this._DataProvider._getQueryManager().resumeEventing();
      this._DataProvider._executeModelOperation();
      return this;
    };


    /**
         * Get the current axes layout for rows and columns
         * @return {sap.sac.df.model.visualization.Grid.AxesLayout} columns and rows axes layout object
         * @public
         */
    Grid.prototype.getAxesLayout = function () {
      return this.AxesLayout;
    };


    /** Map of properties, that are provided by the object. */
    Grid.M_PROPERTIES = {
      Documents: "Documents",
      AxesLayout: "AxesLayout"
    };

    /**
         * Documents
         * @name sap.sac.df.model.Grid#Documents
         * @type {sap.sac.df.model.visualization.Grid.Documents}
         * @property Documents
         * @public
         */

    /**
         * Axes Layout
         * @name sap.sac.df.model.Grid#AxesLayout
         * @type {sap.sac.df.model.visualization.Grid.AxesLayout}
         * @property AxesLayout
         * @public
         */

    /**
         * Axes Layout object type.
         *
         * @static
         * @constant
         * @ui5-experimental-since 1.132
         * @typedef {object} sap.sac.df.model.visualization.Grid.AxesLayout
         * @property {string[]} Columns dimensions on column axis
         * @property {string[]} Rows dimensions on row axis
         * @property {string[]} MeasureStructureMembers members of measure structure dimension
         * @property {string[]} StructureMembers members of structure dimension
         *
         * @public
         */

    return Grid;
  }
);
/*global sap, Promise */

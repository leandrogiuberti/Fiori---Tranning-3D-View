/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  function getNewsPagesPlaceholder() {
    return `
    <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop plContent plResponsivePadding" style="background-color:transparent">
        <div class="plText sapMGTLoadingShimmer plTextWeightL plTextWidthM" style="width: 225px;">
        </div>
        <div class="plPHPCardContainer plSectionMarginBottom">
            <div class="plPHPCard plPHPCardVersion2 PHPContentCard5 sapUiNoMarginTop" style="background-color:white">
                <div class="plPHPCardHeader">
                    <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop"></div>
                </div>
                <div class="plPHPCardContent">
                    <div style="vertical-align: inherit;">
                        <div
                            class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop plVerticalRepeater plPHPCardContentContainer">
                            <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plVerticalRepeaterItem"
                                style="width: 100%;"></div>
                            <div class="plText sapMGTLoadingShimmer plTextWeightS plTextWidthM plPHPCardContentText plVerticalRepeaterItem"
                                style="width: 80%;"></div>
                        </div>
                    </div>
                    <div class="plHorizontalLayout plHorizontalContent plTextAlignEnd plVerticalAlignBottom">
                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardFooterText"
                            style="width: 80px;"></div>
                    </div>
                </div>
            </div>
            <div class="plPHPCardVersion3 PHPContentCard6 sapUiNoMarginTop plSmallestVisibleSizeL">
                <div class="plPHPCardHeader"></div>
                <div class="plPHPCardContent">
                    <div
                        class="plVerticalLayout plVerticalContent plTextAlignplPHPCardContentContainer plVerticalAlignTop">
                        <div class="plHorizontalLayout plHorizontalContent plTextAlignCenter plVerticalAlignTop">
                            <div style="vertical-align: inherit; background-color:white;" class="plPHPCard">
                                <div
                                    class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop plVerticalRepeater plPHPCardContentItemContainer">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare plVerticalRepeaterItem">
                                    </div>
                                    <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plVerticalRepeaterItem"
                                        style="width: 100%;"></div>
                                    <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plVerticalRepeaterItem"
                                        style="width: 100%;"></div>
                                </div>
                            </div>
                            <div style="vertical-align: inherit; background-color:white;" class="plPHPCard">
                                <div
                                    class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop plVerticalRepeater plPHPCardContentItemContainer">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare plVerticalRepeaterItem">
                                    </div>
                                    <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plVerticalRepeaterItem"
                                        style="width: 100%;"></div>
                                    <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plVerticalRepeaterItem"
                                        style="width: 100%;"></div>
                                </div>
                            </div>
                        </div>
                        <div class="plHorizontalLayout plHorizontalContent plTextAlignCenter plVerticalAlignTop">
                            <div style="vertical-align: inherit; background-color:white;" class="plPHPCard">
                                <div
                                    class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop plVerticalRepeater plPHPCardContentItemContainer">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare plVerticalRepeaterItem">
                                    </div>
                                    <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plVerticalRepeaterItem"
                                        style="width: 100%;"></div>
                                    <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plVerticalRepeaterItem"
                                        style="width: 100%;"></div>
                                </div>
                            </div>
                            <div style="vertical-align: inherit; background-color:white;" class="plPHPCard">
                                <div
                                    class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop plVerticalRepeater plPHPCardContentItemContainer">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare plVerticalRepeaterItem">
                                    </div>
                                    <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plVerticalRepeaterItem"
                                        style="width: 100%;"></div>
                                    <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plVerticalRepeaterItem"
                                        style="width: 100%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="plPHPCard plPHPCardVersion3 PHPContentCard7 sapUiNoMarginTop plSmallestVisibleSizeL">
                <div class="plPHPCardHeader"></div>
                <div class="plPHPCardContent">
                    <div
                        class="plVerticalLayout plVerticalContent plTextAlignplPHPCardContentContainer plVerticalAlignTop">
                        <div class="plHorizontalLayout plHorizontalContent plTextAlignCenter plVerticalAlignTop">
                            <div style="vertical-align: inherit; background-color:white;">
                                <div
                                    class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop plVerticalRepeater plPHPCardContentItemContainer">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare plVerticalRepeaterItem">
                                    </div>
                                    <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plVerticalRepeaterItem"
                                        style="width: 100%;"></div>
                                    <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plVerticalRepeaterItem"
                                        style="width: 100%;"></div>
                                </div>
                            </div>
                            <div style="vertical-align: inherit; background-color:white;">
                                <div
                                    class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop plVerticalRepeater plPHPCardContentItemContainer">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare plVerticalRepeaterItem">
                                    </div>
                                    <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plVerticalRepeaterItem"
                                        style="width: 100%;"></div>
                                    <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plVerticalRepeaterItem"
                                        style="width: 100%;"></div>
                                </div>
                            </div>
                        </div>
                        <div class="plHorizontalLayout plHorizontalContent plTextAlignCenter plVerticalAlignTop">
                            <div style="vertical-align: inherit; background-color:white;">
                                <div
                                    class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop plVerticalRepeater plPHPCardContentItemContainer">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare plVerticalRepeaterItem">
                                    </div>
                                    <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plVerticalRepeaterItem"
                                        style="width: 100%;"></div>
                                    <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plVerticalRepeaterItem"
                                        style="width: 100%;"></div>
                                </div>
                            </div>
                            <div style="vertical-align: inherit; background-color:white;">
                                <div
                                    class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop plVerticalRepeater plPHPCardContentItemContainer">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare plVerticalRepeaterItem">
                                    </div>
                                    <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plVerticalRepeaterItem"
                                        style="width: 100%;"></div>
                                    <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plVerticalRepeaterItem"
                                        style="width: 100%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
  }
  var __exports = {
    __esModule: true
  };
  __exports.getNewsPagesPlaceholder = getNewsPagesPlaceholder;
  return __exports;
});
//# sourceMappingURL=NewsAndPagesPlaceholder-dbg.js.map

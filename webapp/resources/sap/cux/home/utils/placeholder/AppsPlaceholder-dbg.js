/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  function getAppsPlaceholder() {
    return `
        <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop plContent plResponsivePadding" style="background-color:transparent">
            <div class="plText sapMGTLoadingShimmer plTextWeightL plTextWidthM" style="width: 225px;"></div>
            <div class="plPHPCardContainer" style="background-color:white">
                <div class="plPHPCard plPHPCardVersion4 PHPContentCard8">
                    <div class="plPHPCardHeader"></div>
                    <div class="plPHPCardContent">
                        <div class="plHorizontalLayout plHorizontalContent plTextAlignStart plVerticalAlignTop">
                            <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop">
                                <div class="plHorizontalLayout plHorizontalContent plTextAlignStart plVerticalAlignTop">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare">
                                    </div>
                                    <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop">
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                    </div>
                                </div>
                                <div class="plHorizontalLayout plHorizontalContent plTextAlignStart plVerticalAlignTop">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare">
                                    </div>
                                    <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop">
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                    </div>
                                </div>
                                <div class="plHorizontalLayout plHorizontalContent plTextAlignStart plVerticalAlignTop">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare">
                                    </div>
                                    <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop">
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                    </div>
                                </div>
                                <div class="plHorizontalLayout plHorizontalContent plTextAlignStart plVerticalAlignTop">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare">
                                    </div>
                                    <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop">
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                    </div>
                                </div>
                                <div class="plHorizontalLayout plHorizontalContent plTextAlignStart plVerticalAlignTop">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare">
                                    </div>
                                    <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop">
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                    </div>
                                </div>
                            </div>
                            <div
                                class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop plSmallestVisibleSizeM">
                                <div class="plHorizontalLayout plHorizontalContent plTextAlignStart plVerticalAlignTop">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare">
                                    </div>
                                    <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop">
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                    </div>
                                </div>
                                <div class="plHorizontalLayout plHorizontalContent plTextAlignStart plVerticalAlignTop">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare">
                                    </div>
                                    <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop">
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                    </div>
                                </div>
                                <div class="plHorizontalLayout plHorizontalContent plTextAlignStart plVerticalAlignTop">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare">
                                    </div>
                                    <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop">
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                    </div>
                                </div>
                                <div class="plHorizontalLayout plHorizontalContent plTextAlignStart plVerticalAlignTop">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare">
                                    </div>
                                    <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop">
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                    </div>
                                </div>
                                <div class="plHorizontalLayout plHorizontalContent plTextAlignStart plVerticalAlignTop">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare">
                                    </div>
                                    <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop">
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                    </div>
                                </div>
                            </div>
                            <div
                                class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop plSmallestVisibleSizeL">
                                <div class="plHorizontalLayout plHorizontalContent plTextAlignStart plVerticalAlignTop">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare">
                                    </div>
                                    <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop">
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                    </div>
                                </div>
                                <div class="plHorizontalLayout plHorizontalContent plTextAlignStart plVerticalAlignTop">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare">
                                    </div>
                                    <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop">
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                    </div>
                                </div>
                                <div class="plHorizontalLayout plHorizontalContent plTextAlignStart plVerticalAlignTop">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare">
                                    </div>
                                    <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop">
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                    </div>
                                </div>
                                <div class="plHorizontalLayout plHorizontalContent plTextAlignStart plVerticalAlignTop">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare">
                                    </div>
                                    <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop">
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                    </div>
                                </div>
                                <div class="plHorizontalLayout plHorizontalContent plTextAlignStart plVerticalAlignTop">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare">
                                    </div>
                                    <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop">
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                    </div>
                                </div>
                            </div>
                            <div
                                class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop plSmallestVisibleSizeXL">
                                <div class="plHorizontalLayout plHorizontalContent plTextAlignStart plVerticalAlignTop">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare">
                                    </div>
                                    <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop">
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                    </div>
                                </div>
                                <div class="plHorizontalLayout plHorizontalContent plTextAlignStart plVerticalAlignTop">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare">
                                    </div>
                                    <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop">
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                    </div>
                                </div>
                                <div class="plHorizontalLayout plHorizontalContent plTextAlignStart plVerticalAlignTop">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare">
                                    </div>
                                    <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop">
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                    </div>
                                </div>
                                <div class="plHorizontalLayout plHorizontalContent plTextAlignStart plVerticalAlignTop">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare">
                                    </div>
                                    <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop">
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                    </div>
                                </div>
                                <div class="plHorizontalLayout plHorizontalContent plTextAlignStart plVerticalAlignTop">
                                    <div
                                        class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextSquare">
                                    </div>
                                    <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop">
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
                                            style="width: 100%;"></div>
                                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardContentText plPHPCardContentTextLine"
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
  __exports.getAppsPlaceholder = getAppsPlaceholder;
  return __exports;
});
//# sourceMappingURL=AppsPlaceholder-dbg.js.map

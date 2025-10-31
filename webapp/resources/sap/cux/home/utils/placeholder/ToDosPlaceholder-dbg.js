/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  function getTodosPlaceholder() {
    return `
        <div class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop plContent plResponsivePadding" style="background-color:transparent">
            <div class="plText sapMGTLoadingShimmer plTextWeightL plTextWidthM plPHPCardHeaderText" style="width: 225px;">
            </div>
            <div class="plPHPCardContainer plPHPCardContainerOverflowHidden plSectionMarginBottom">
                <div class="plPHPCard plPHPCardVersion1 PHPContentCard1" style="background-color:white">
                    <div class="plPHPCardHeader">
                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardHeaderText"
                            style="width: 100%;"></div>
                    </div>
                    <div class="plPHPCardContent">
                        <div style="vertical-align: inherit;">
                            <div
                                class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop plVerticalRepeater plPHPCardContentContainer">
                                <div class="plText sapMGTLoadingShimmer plTextWeightS plTextWidthM plPHPCardContentText plVerticalRepeaterItem"
                                    style="width: 80%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="plPHPCard plPHPCardVersion1 PHPContentCard2" style="background-color:white">
                    <div class="plPHPCardHeader">
                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardHeaderText"
                            style="width: 100%;"></div>
                    </div>
                    <div class="plPHPCardContent">
                        <div style="vertical-align: inherit;">
                            <div
                                class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop plVerticalRepeater plPHPCardContentContainer">
                                <div class="plText sapMGTLoadingShimmer plTextWeightS plTextWidthM plPHPCardContentText plVerticalRepeaterItem"
                                    style="width: 80%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="plPHPCard plPHPCardVersion1 PHPContentCard3 plSmallestVisibleSizeL" style="background-color:white">
                    <div class="plPHPCardHeader">
                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardHeaderText"
                            style="width: 100%;"></div>
                    </div>
                    <div class="plPHPCardContent">
                        <div style="vertical-align: inherit;">
                            <div
                                class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop plVerticalRepeater plPHPCardContentContainer">
                                <div class="plText sapMGTLoadingShimmer plTextWeightS plTextWidthM plPHPCardContentText plVerticalRepeaterItem"
                                    style="width: 80%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="plPHPCard plPHPCardVersion1 PHPContentCard4 plSmallestVisibleSizeXL" style="background-color:white">
                    <div class="plPHPCardHeader">
                        <div class="plText sapMGTLoadingShimmer plTextWeightM plTextWidthM plPHPCardHeaderText"
                            style="width: 100%;"></div>
                    </div>
                    <div class="plPHPCardContent">
                        <div style="vertical-align: inherit;">
                            <div
                                class="plVerticalLayout plVerticalContent plTextAlignStart plVerticalAlignTop plVerticalRepeater plPHPCardContentContainer">
                                <div class="plText sapMGTLoadingShimmer plTextWeightS plTextWidthM plPHPCardContentText plVerticalRepeaterItem"
                                    style="width: 80%;"></div>
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
  __exports.getTodosPlaceholder = getTodosPlaceholder;
  return __exports;
});
//# sourceMappingURL=ToDosPlaceholder-dbg.js.map

// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/core/Component",
    "sap/ui/test/actions/Press",
    "sap/ui/test/matchers/Properties",
    "sap/ui/qunit/utils/nextUIUpdate"
], (
    Opa5,
    Component,
    Press,
    Properties,
    nextUIUpdate
) => {
    "use strict";

    const sViewName = "sap.ushell.components.cepsearchresult.app.Main";

    Opa5.createPageObjects({
        inSearchApplication: {

            actions: {

                iSearchFor: function (sCategory, sSearchTerm) {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.ushell.components.cepsearchresult.app.util.controls.categories.Application",
                        success: function (aControls) {
                            Component.getComponentById("cepsearchresultAppComponent").getRootControl().getController().changeSearchTerm(sSearchTerm);
                            Component.getComponentById("cepsearchresultAppComponent").getRootControl().getController().changeCategory(sCategory);
                        }
                    });
                },

                iPressPagingButton: function (theButton) {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.ushell.components.cepsearchresult.app.util.controls.Paginator",
                        success: function (aPaginator) {
                            const aButtons = aPaginator[0].getAggregation("_buttons");
                            aButtons.forEach(async (oButton) => {
                                if (
                                    (theButton === "beginArrow" && oButton.getIcon() === "sap-icon://navigation-left-arrow") ||
                  (theButton === "endArrow" && oButton.getIcon() === "sap-icon://navigation-right-arrow") ||
                  (`${theButton}` === oButton.getText())
                                ) {
                                    Opa5.assert.ok(true, `Button ${theButton} is pressed`);
                                    new Press().executeOn(oButton);
                                    await nextUIUpdate();
                                }
                            });
                        }
                    });
                }
            },

            assertions: {

                iSeeThePageTitle: function (sTitle) {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Title",
                        matchers: new Properties({
                            text: sTitle
                        }),
                        success: function () {
                            Opa5.assert.ok(true, "The title was visible");
                        }
                    });
                },

                iSeeNoHighlighting: function () {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.ushell.components.cepsearchresult.app.util.controls.categories.Application",
                        success: function (aCat) {
                            const oDomRef = aCat[0].getDomRef();
                            const bHighlights0 = oDomRef.querySelectorAll(".defaultHighlightedText").length === 0;
                            Opa5.assert.ok(bHighlights0, "Highlights are not visible");
                        }
                    });
                },

                iSeeHighlightingFor: function (sText) {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.ushell.components.cepsearchresult.app.util.controls.categories.Application",
                        success: function (aCat) {
                            const oDomRef = aCat[0].getDomRef();
                            const aHighlights = Array.from(oDomRef.querySelectorAll(".defaultHighlightedText"));
                            let bOk = true;
                            aHighlights.forEach((o) => {
                                bOk = bOk && (o.innerText.toUpperCase() === sText.toUpperCase());
                            });
                            Opa5.assert.ok(bOk, "Highlights are visible");
                        }
                    });
                },

                iSeeTextInTileAtPos: function (sText, iItemPos) {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.ushell.ui.launchpad.VizInstanceCdm",
                        success: function (aCat) {
                            const sTitle = aCat[iItemPos].getTitle();
                            Opa5.assert.ok(sText === sTitle, `Tile at ${iItemPos} has title ${sText} ${sTitle}`);
                        }
                    });
                },

                iSeePaginator: function (oSettings) {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.ushell.components.cepsearchresult.app.util.controls.Paginator",
                        success: function (aPag) {
                            const aButtons = aPag[0].getAggregation("_buttons").filter((o) => {
                                return o.getVisible();
                            });
                            const iButtonCount = Object.keys(oSettings).length;
                            Opa5.assert.ok(aButtons.length === iButtonCount, "Paginator has expected button count");
                            let i = 0;
                            for (let n in oSettings) {
                                const oButton = aButtons[i];
                                if (n === "beginArrow") {
                                    Opa5.assert.ok(oButton.getIcon() === "sap-icon://navigation-left-arrow", `beginArrow Button is correctly shown at pos ${i}`);
                                } else if (n === "endArrow") {
                                    Opa5.assert.ok(oButton.getIcon() === "sap-icon://navigation-right-arrow", `endArrow Button is correctly shown at pos ${i}`);
                                } else {
                                    n = n.substring(1);
                                    Opa5.assert.ok(oButton.getText() === `${n}`, `Button ${n} is correctly shown at pos ${i}`);
                                }
                                if (oSettings[n] === "disabled") {
                                    Opa5.assert.ok(!oButton.getEnabled() && !oButton.getPressed(), `Button ${n} has disabled state`);
                                } else if (oSettings[n] === "enabled") {
                                    Opa5.assert.ok(oButton.getEnabled() && !oButton.getPressed(), `Button ${n} has enabled state`);
                                } else if (oSettings[n] === "selected") {
                                    Opa5.assert.ok(!oButton.getEnabled() && oButton.getPressed(), `Button ${n} has selected state`);
                                }
                                i += 1;
                            }
                        }
                    });
                }
            }
        }
    });
});

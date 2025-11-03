/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define([], function () {
    "use strict";

    return {
        threshold: 10,
        headerVisible: true,
        startY: undefined,
        app: undefined,
        jqView: undefined,

        startHandler: function (e) {
            if (
                this.app.getGlobalFilter() &&
                this.app.getGlobalFilter().hasOwnProperty("getVisible") &&
                this.app.getGlobalFilter().getVisible()
            ) {
                return;
            }
            this.startY = e.touches[0].pageY;
        },

        resizeHandler: function () {
            if (!this.headerVisible) {
                this.animateHeader.call(this, this.headerVisible);
            }
        },

        animateHeader: function (setVisible) {
            var jqHeaderVbox = this.jqView.find(".ovpApplication > .sapUiFixFlexFixed > .sapMVBox");
            var jqFlexContainerParent = this.jqView.find(".ovpApplication > .sapUiFixFlexFlexible");
            var jqFlexContainer = jqFlexContainerParent && jqFlexContainerParent.children();
            var translate;
            var that = this;

            if (setVisible) {
                translate = "translateY(0px)";
                jqHeaderVbox.add(jqFlexContainerParent).css({
                    transform: translate,
                    "-webkit-transform": translate
                });
                jqFlexContainerParent.one(
                    "transitionend",
                    function (e) {
                        if (that.headerVisible) {
                            jqFlexContainer.css({ bottom: "0px" });
                        }
                    }
                );
            } else {
                var oHeader = this.getView().byId("ovpMain").getHeader();
                //Animate dynamic header only when it is present
                if (oHeader) {
                    var headerHeight = oHeader.$().height();
                    jqFlexContainer.css({ bottom: "-" + headerHeight + "px" });
                    translate = "translateY(-" + headerHeight + "px)";
                    jqFlexContainerParent.add(jqHeaderVbox).css({
                        transform: translate,
                        "-webkit-transform": translate
                    });
                }
            }
        },

        moveHandler: function (e) {
            var moveY = e.touches[0].pageY;
            if (typeof this.startY === "undefined") {
                if (
                    this.app.getGlobalFilter() &&
                    this.app.getGlobalFilter().hasOwnProperty("getVisible") &&
                    this.app.getGlobalFilter().getVisible()
                ) {
                    return;
                }
                this.startY = moveY;
            }
            if (Math.abs(this.startY - moveY) < this.threshold) {
                return;
            }
            if (this.startY > moveY && this.headerVisible) {
                this.headerVisible = false;
                this.startY = moveY;
                this.animateHeader.call(this, this.headerVisible);
            }
            if (this.startY < moveY && !this.headerVisible) {
                this.headerVisible = true;
                this.startY = moveY;
                this.animateHeader.call(this, this.headerVisible);
            }
        },

        endHandler: function () {
            this.startY = undefined;
            return;
        },

        enable: function (app) {
            this.app = app;
            this.view = this.app.getView();
            this.jqView = this.view.$();
            var that = this;

            this.jqView.on("touchstart.headerHiding", function (oEvent) {
                that.startHandler.call(that, oEvent);
            });
            this.jqView.on("touchmove.headerHiding", function (oEvent) {
                that.moveHandler.call(that, oEvent);
            });
            this.jqView.on(
                "touchend.headerHiding touchcancel.headerHiding touchleave.headerHiding",
                function() {
                    that.endHandler.call(that);
                }
            );
            window.addEventListener("resize.headerHiding", function() {
                that.resizeHandler.call(that);
            });
        },

        disable: function () {
            this.jqView.off(
                "touchstart.headerHiding touchmove.headerHiding touchend.headerHiding touchcancel.headerHiding touchleave.headerHiding"
            );
            window.removeEventListener("resize.headerHiding");
        }
    };
}, /* bExport= */ true);

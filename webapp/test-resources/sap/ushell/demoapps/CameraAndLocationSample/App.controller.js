// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.CameraAndLocationSample.App", {
        onInit: function () { },

        onCameraOn: function () {
            const that = this;

            that.getView().byId("videoStatus").setText("Status: OFF");
            const video = document.querySelector(".videoElement");
            if (navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: true })
                    .then((stream) => {
                        video.srcObject = stream;
                        that.getView().byId("videoStatus").setText("Status: ON");
                    })
                    .catch((oError) => {
                        that.getView().byId("videoStatus").setText("Status: ERROR");
                    });
            } else {
                that.getView().byId("videoStatus").setText("Status: ERROR");
            }
        },

        onCameraOff: function () {
            const video = document.querySelector(".videoElement");
            video.srcObject = undefined;
            this.getView().byId("videoStatus").setText("Status: OFF");
        },

        onGetLocation: function () {
            const that = this;

            that.getView().byId("idLatitude").setValue("");
            that.getView().byId("idLongitude").setValue("");
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    that.getView().byId("idLatitude").setValue(position.coords.latitude);
                    that.getView().byId("idLongitude").setValue(position.coords.longitude);
                    that.getView().byId("locationStatus").setText("Status: OK");
                }, () => {
                    that.getView().byId("locationStatus").setText("Status: ERROR");
                });
            } else {
                that.getView().byId("locationStatus").setText("Status: ERROR");
            }
        }
    });
});

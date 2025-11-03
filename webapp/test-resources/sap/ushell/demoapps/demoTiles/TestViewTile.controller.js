// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/utils/WindowUtils"
], (
    Controller,
    hasher,
    WindowUtils
) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.demoTiles.TestViewTile", {
        _handleTilePress: function (oTileControl) {
            if (typeof oTileControl.attachPress === "function") {
                oTileControl.attachPress(() => {
                    if (typeof oTileControl.getTargetURL === "function") {
                        const sTargetURL = oTileControl.getTargetURL();
                        if (sTargetURL) {
                            if (sTargetURL[0] === "#") {
                                hasher.setHash(sTargetURL);
                            } else {
                                WindowUtils.openURL(sTargetURL, "_blank");
                            }
                        }
                    }
                });
            }
        }
    });
});

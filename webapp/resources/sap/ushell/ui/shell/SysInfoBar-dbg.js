// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.launchpad.SysInfoBar.
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/core/IconPool",
    "sap/ui/core/Icon",
    "sap/ushell/library", // css style dependency,
    "sap/m/Bar",
    "sap/m/Label",
    "sap/ui/core/CustomData",
    "./SysInfoBarRenderer"
], (
    Control,
    IconPool,
    Icon,
    ushellLibrary,
    Bar,
    Label,
    CustomData,
    SysInfoBarRenderer
) => {
    "use strict";

    const mColor = {
        orange: "sapUshellSysInfoBarOrange",
        Orange: "sapUshellSysInfoBarOrange",
        red: "sapUshellSysInfoBarRed",
        Red: "sapUshellSysInfoBarRed",
        pink: "sapUshellSysInfoBarPink",
        Pink: "sapUshellSysInfoBarPink",
        violet: "sapUshellSysInfoBarViolet",
        Violet: "sapUshellSysInfoBarViolet",
        blue: "sapUshellSysInfoBarBlue",
        Blue: "sapUshellSysInfoBarBlue",
        green: "sapUshellSysInfoBarGreen",
        Green: "sapUshellSysInfoBarGreen",
        grey: "sapUshellSysInfoBarGrey",
        Grey: "sapUshellSysInfoBarGrey",
        gray: "sapUshellSysInfoBarGrey",
        Gray: "sapUshellSysInfoBarGrey",
        pink2: "sapUshellSysInfoBarPink2",
        Pink2: "sapUshellSysInfoBarPink2",
        violet2: "sapUshellSysInfoBarViolet2",
        Violet2: "sapUshellSysInfoBarViolet2",
        blue2: "sapUshellSysInfoBarBlue2",
        Blue2: "sapUshellSysInfoBarBlue2",
        green2: "sapUshellSysInfoBarGreen2",
        Green2: "sapUshellSysInfoBarGreen2",
        grey2: "sapUshellSysInfoBarGrey2",
        Grey2: "sapUshellSysInfoBarGrey2",
        gray2: "sapUshellSysInfoBarGrey2",
        Gray2: "sapUshellSysInfoBarGrey2"
    };

    /**
     * @alias sap.ushell.ui.shell.SysInfoBar
     * @class
     * @classdesc Constructor for a new SysInfoBar.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] Initial settings for the new control
     *
     * @extends sap.ui.core.Control
     *
     * @private
     */
    const SysInfoBar = Control.extend("sap.ushell.ui.shell.SysInfoBar", /** @lends sap.ushell.ui.shell.SysInfoBar.prototype */ {
        metadata: {
            library: "sap.ushell",
            defaultAggregation: "_bar",
            properties: {
                /**
                 * Defines the icon to be displayed as graphical element.
                 * It can be an image or an icon from the icon font.
                 */
                icon: {type: "sap.ui.core.URI", group: "Appearance", defaultValue: ""},
                /**
                 * The main text which is rendered behind the icon.
                 */
                text: {type: "string", group: "Misc", defaultValue: ""},
                /**
                 * The sub text which is rendered behind the text property.
                 */
                subText: {type: "string", group: "Misc", defaultValue: ""},
                /**
                 * Determines the input parameter that can be a string of type HEX, RGB, HSV, or a CSS color name:
                 * <ul>
                 * <li>HEX - #FFFFFF</li>
                 * <li>RGB - rgb(255,255,255)</li>
                 * <li>HSV - hsv(360,100,100)</li>
                 * <li>CSS - red</li>
                 * </ul>
                 * Following color names are mapped to the corresponding internal Theme Parameters.
                 * In case a not mapped color is used, the control does not guarantee to fulfill ACC.
                 * <ul>
                 * <li>orange - sapShell_Category_3_Background</li>
                 * <li>red - sapShell_Category_11_Background</li>
                 * <li>pink - sapShell_Category_13_Background</li>
                 * <li>violet - sapShell_Category_12_Background</li>
                 * <li>blue - sapShell_Category_9_Background</li>
                 * <li>green - sapShell_Category_16_Background</li>
                 * <li>grey (deprecated) - sapShell_Category_15_Background</li>
                 * <li>gray - sapShell_Category_15_Background</li>
                 * </ul>
                 */
                color: {type: "string", group: "Misc", defaultValue: "orange"}
            },
            aggregations: {
                /**
                 * Internal aggregation of sap.m.Bar which contains the icon and two texts.
                 */
                _bar: {type: "sap.m.Bar", multiple: false, visibility: "hidden"}
            }
        },
        renderer: SysInfoBarRenderer
    });

    SysInfoBar.prototype.init = function () {
        const oBar = new Bar({
            id: `${this.getId()}-bar`
        }).addStyleClass("sapUshellSysInfoBar");
        oBar._setRootAccessibilityRole("complementary");
        oBar.data("sap-ui-fastnavgroup", "false", false); // Disable group for F6 handling
        this._oText = new Label({
            id: `${this.getId()}-text`,
            text: this.getText(),
            design: "Bold"
        }).addStyleClass("sapUshellSysInfoBarText");
        this._oSubText = new Label({
            id: `${this.getId()}-subText`,
            text: this.getSubText()
        }).addStyleClass("sapUshellSysInfoBarText");
        this.setAggregation("_bar", oBar, true);
        const oCustomData = new CustomData({
            key: "help-id",
            value: "FLP-SysInfoBar",
            writeToDom: true
        });
        this.addCustomData(oCustomData);
    };

    SysInfoBar.prototype.exit = function () {
        this._oIcon = null;
        this._oText = null;
        this._oSubText = null;
    };

    SysInfoBar.prototype.onBeforeRendering = function () {
        const oBar = this.getAggregation("_bar");
        oBar.removeAllContentMiddle();
        oBar.addContentMiddle(this._oIcon);
        oBar.addContentMiddle(this._oText);
        oBar.addContentMiddle(this._oSubText);
        if (this._isMappedColor(this.getColor())) {
            this.addStyleClass(this._getMappedColorClass(this.getColor()));
        } else {
            this.addStyleClass("sapUshellSysInfoBarCustom");
        }
    };

    SysInfoBar.prototype.setText = function (value) {
        this.setProperty("text", value, true);
        this._oText.setText(value);
    };

    SysInfoBar.prototype.setSubText = function (value) {
        this.setProperty("subText", value, true);
        this._oSubText.setText(value);
    };

    SysInfoBar.prototype.setIcon = function (value) {
        if (IconPool.isIconURI(value)) {
            if (this._oIcon) {
                this._oIcon.destroy();
                this._oIcon = null;
            }
            this._oIcon = IconPool.createControlByURI({
                id: `${this.getId()}-icon`,
                src: value,
                densityAware: true,
                useIconTooltip: true
            }, Icon).addStyleClass("sapUshellSysInfoBarText");
            this.invalidate();
        } else if (this._oIcon) {
            this._oIcon.destroy();
            this._oIcon = null;
        }
        this.setProperty("icon", value);
    };

    SysInfoBar.prototype.setColor = function (value) {
        const sColor = this.getColor();
        if (this._isMappedColor(sColor) && this.hasStyleClass(this._getMappedColorClass(sColor))) {
            this.removeStyleClass(this._getMappedColorClass(sColor));
        }
        this.setProperty("color", value);
    };

    SysInfoBar.prototype._isMappedColor = function (value) {
        return !!mColor[value];
    };

    SysInfoBar.prototype._getMappedColorClass = function (value) {
        return mColor[value] || "";
    };

    return SysInfoBar;
});


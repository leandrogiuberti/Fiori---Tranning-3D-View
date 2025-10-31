// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The <code>sap.ushell.User</code> object with related functions.
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/i18n/Localization",
    "sap/base/util/deepExtend",
    "sap/ui/base/EventProvider",
    "sap/ui/core/Locale",
    "sap/ui/core/LocaleData",
    "sap/ui/thirdparty/URI",
    "sap/ushell/utils",
    "sap/ui/core/Theming"
], (
    Log,
    Localization,
    deepExtend,
    EventProvider,
    Locale,
    LocaleData,
    URI,
    ushellUtils,
    Theming
) => {
    "use strict";

    // "private" methods (static) without need to access properties -------------

    /**
     * Clone a JSON object.
     *
     * @param {object} oObject object to clone
     * @returns {object} copy of the input object
     * @private
     */
    function clone (oObject) {
        if (oObject === undefined) {
            return undefined;
        }
        return deepExtend({}, oObject);
    }

    function getOrigin (oUri) {
        let sOrigin;

        if (oUri.host && typeof oUri.host === "function" && oUri.host()) {
            sOrigin = oUri.host();
            if (typeof oUri.protocol === "function" && oUri.protocol()) {
                sOrigin = `${oUri.protocol()}://${sOrigin}`;
            }
            return sOrigin;
        }
        return "";
    }

    /**
     * Determines if a theme is a SAP theme
     * @param {string} sTheme Theme to be tested
     * @returns {boolean} <code>true</code> if the theme is an SAP theme
     * @private
     */
    function isSapTheme (sTheme) {
        return sTheme.indexOf("sap_") === 0;
    }

    // "public class" -----------------------------------------------------------

    /**
     * Constructs a new representation (wrapper) of the user object as loaded by the ContainerAdapter.
     * @class
     * @param {object} oSettings the result provided by the ContainerAdapter
     * @since 1.15.0
     */
    function User (oSettings = {}) {
        // actually the parameter contains the container adapter config
        let aChangedProperties = [];
        let oCurrentTheme;
        let oStartupTheme;
        const oEventProvider = new EventProvider();

        // todo: ABAP specific code should be moved to ushell_abap
        // User profile and edit states are only available on ABAP platform
        const oEditStates = {};
        oSettings.userProfile?.forEach?.((entry) => {
            if (entry.id && entry.editState) {
                oEditStates[entry.id] = entry.editState;
            }
        });

        // The THEME_SET parameter from the user profile
        let sCurrentThemeSet = oSettings.userProfile?.find?.((entry) => entry.id === "THEME_SET")?.value || "";

        // constructor code below

        /**
         * Get the edit state of a user profile entry on ABAP platform.
         *
         * @param {string} sParameterId ID of the parameter like "CALENDAR_WEEK_NUMBERING" in ABAP notation
         * @returns {int} edit state of an entry. The possible values are:
         *   0: hidden
         *   1: readonly
         *   3: optional (editable)
         *   7: mandatory
         *   undefined: the entry is not available or user profile is not provided
         * @since 1.131.0
         * @private
         */
        this.getEditState = function (sParameterId) {
            return oEditStates[sParameterId];
        };

        /**
         * Returns this user's email address.
         *
         * @returns {string} this user's email address
         * @since 1.15.0
         */
        this.getEmail = function () {
            return oSettings.email;
        };

        /**
         * Returns this user's first name.
         *
         * @returns {string} this user's first name
         * @since 1.15.0
         */
        this.getFirstName = function () {
            return oSettings.firstName;
        };

        /**
         * Returns this user's full name.
         *
         * @returns {string} this user's full name
         * @since 1.15.0
         */
        this.getFullName = function () {
            return oSettings.fullName;
        };

        /**
         * Returns this user's Time Zone.
         *
         * @returns {string} this user's Time zone
         * @since 1.85
         */
        this.getTimeZone = function () {
            return oSettings.timeZone;
        };

        /**
         * Returns the type of the language and settings entry.
         * @returns {Promise<object>} A promise that resolves with the language and region settings entry.
         * @since 1.134.0
         */
        this.getLanguageAndRegionSettingsEntry = async () => {
            if (oSettings.getLanguageAndRegionSettingsEntry) {
                const oEntry = await oSettings.getLanguageAndRegionSettingsEntry();
                return oEntry;
            }

            const [oDefaultEntry] = await ushellUtils.requireAsync(["sap/ushell/components/shell/Settings/userLanguageRegion/UserLanguageRegionEntry"]);
            return oDefaultEntry;
        };

        /**
         * Returns this user's initials.
         *
         * @returns {string} this user's initials
         * @since 1.84.0
         */
        this.getInitials = function () {
            const sFullName = oSettings.fullName || "";
            let sInitials = "";
            let bNext = true;

            for (let i = 0, len = sFullName.length; i < len; ++i) {
                if (sFullName[i] === " ") {
                    bNext = true;
                } else if (bNext) {
                    bNext = false;
                    sInitials += sFullName[i];
                }
            }

            return sInitials;
        };

        /**
         * Returns this user's ID.
         *
         * @returns {string} this user's ID
         * @since 1.15.0
         */
        this.getId = function () {
            return oSettings.id;
        };

        /**
         * Returns this user's language.
         *
         * @returns {string} this user's language
         * @since 1.15.0
         */
        this.getLanguage = function () {
            return oSettings.language;
        };

        /**
         * Returns this user's language tag as defined by this <a href="http://tools.ietf.org/html/bcp47">spec</a>.
         *
         * @returns {string} this user's language tag according to BCP 47
         * @since 1.15.0
         */
        this.getLanguageBcp47 = function () {
            return oSettings.languageBcp47;
        };

        /**
         * Returns this user's language in a human readable format.
         *
         * @returns {string} this user's language according to locale
         * @since 1.67.0
         */
        this.getLanguageText = function () {
            const oLocale = new Locale(Localization.getLanguageTag());
            const oLocaleData = new LocaleData(oLocale);
            const sLanguageTag = Localization.getLanguageTag().toString();
            return (oLocaleData.getLanguageName(sLanguageTag) || this.getLanguage());
        };

        /**
         * Returns this user's last name.
         *
         * @returns {string} this user's last name
         * @since 1.15.0
         */
        this.getLastName = function () {
            return oSettings.lastName;
        };

        /**
         * Returns a URI to this user's image.
         *
         * @returns {string} a URI to this user's image
         * @since 1.21.1
         */
        this.getImage = function () {
            return oSettings.image;
        };

        /**
         * Returns calendar week numbering
         *
         * @returns {int|string} a Calendar week numbering
         * @since 1.118.0
         */
        this.getCalendarWeekNumbering = function () {
            return oSettings.calendarWeekNumbering || "Default";
        };

        /**
         * Sets the URI of this user's image.
         *
         * @param {string} [sUserImageURI] The user image URI.
         * @since 1.35.0
         */
        this.setImage = function (sUserImageURI) {
            oSettings.image = sUserImageURI;
            oEventProvider.fireEvent("onSetImage", sUserImageURI);
        };

        /**
         * Attaches an event handler fnFunction to be called upon the 'onSetImage' event of this sap.ushell.User.
         * Event is fired upon user image setting
         *
         * @param {function} [fnFunction] The function to be called when the event occurs.
         * @param {object} [oData] An application-specific payload object that will be passed to the event handler,
         *                         along with the event object when firing the event.
         * @since 1.35.0
         */
        this.attachOnSetImage = function (fnFunction, oData) {
            oEventProvider.attachEvent("onSetImage", fnFunction, oData);
        };

        /**
         * Returns <code>true</code> if SAP Jam is active for this user.
         *
         * @returns {boolean} <code>true</code> if SAP Jam is active for this user
         * @since 1.15.0
         */
        this.isJamActive = function () {
            return oSettings.isJamActive === true;
        };

        /**
         * Returns <code>true</code> if language is personalized for this user.
         * If not - the user takes the language from the browser
         *
         * @returns {boolean} <code>true</code> if language is personalized for this user
         * @since 1.48.0
         */
        this.isLanguagePersonalized = function () {
            return oSettings.isLanguagePersonalized === true;
        };

        /**
         * Returns this user's current theme.
         *
         * @param {string} [sThemeFormat] Format of the value to be returned. If not supplied the theme name (with no path) is returned.
         *   Possible types defined in sap.ushell.User.prototype.constants.themeFormat:
         *     - ORIGINAL_THEME either supplied by bootstrap or by user preferences
         *     - THEME_NAME_PLUS_URL e.g. myTheme@https://server.company.com/theme/path/sap-client=000/~2324edfj534ft43~
         *       If no URL is available it will return only the theme name.
         *     - NWBC returns the value for calling WDA & SAP GUI via NWBC
         * @returns {string} this user's selected theme
         * @since 1.15.0
         *
         * @private
         * @ui5-restricted NWBC
         */
        this.getTheme = function (sThemeFormat) {
            if (sThemeFormat === User.prototype.constants.themeFormat.ORIGINAL_THEME) {
                return oStartupTheme.originalTheme.theme;
            }
            if (sThemeFormat === User.prototype.constants.themeFormat.THEME_NAME_PLUS_URL) {
                return oCurrentTheme.theme + (oCurrentTheme.locationPath
                    ? `@${oCurrentTheme.locationOrigin}${oCurrentTheme.locationPath}`
                    : "");
            }
            if (sThemeFormat === User.prototype.constants.themeFormat.NWBC) {
                if (isSapTheme(oCurrentTheme.theme)) {
                    return oCurrentTheme.theme;
                    // the theme is fetched from the system the web content is served
                }
                return this.getTheme(User.prototype.constants.themeFormat.THEME_NAME_PLUS_URL);
                // custom themes are there only on the front-end server
            }
            return oCurrentTheme.theme; // to stay compatible
        };

        /**
         * Returns this user's current theme set.
         *
         * @returns {string} this user's selected theme set
         * @since 1.133.0
         *
         * @private
         */
        this.getThemeSet = function () {
            return sCurrentThemeSet;
        };

        /** Returns for this user's and the theme sTheme its theme root
         *
         * @param {string} [sTheme] for compatibility reason an empty object is returned if no theme range is defined
         * @returns {string} the theme root for the given theme
         * @since 1.50.0
         */
        this.getThemeRoot = function (sTheme) {
            if (oSettings.ranges && oSettings.ranges.theme &&
                oSettings.ranges.theme[sTheme] &&
                oSettings.ranges.theme[sTheme].themeRoot) {
                return oSettings.ranges.theme[sTheme].themeRoot;
            }
            return "";
        };

        /** Sets the missing theme root for a theme coming from a theme set
         * @param {object} oTheme the theme object
         * @param {string} oTheme.id the theme's ID
         * @param {string} oTheme.root the theme's path or root
         */
        this.addThemeRootForTheme = function (oTheme) {
            if (oSettings.ranges.theme[oTheme.id]) {
                oSettings.ranges.theme[oTheme.id].themeRoot = oTheme.root;
            } else {
                oSettings.ranges.theme[oTheme.id].displayName = "";
                oSettings.ranges.theme[oTheme.id].themeRoot = oTheme.root;
            }
        };

        /**
         * Mark the new theme set for saving.
         *
         * @param {string} sNewThemeSet The new selected theme set
         * @since 1.133
         */
        this.setThemeSet = function (sNewThemeSet) {
            if (this.isSetThemePermitted() === false) {
                const sErrorMessage = "setThemeSet is not permitted";
                Log.error(sErrorMessage);
                throw new Error(sErrorMessage);
            }

            if (sNewThemeSet !== sCurrentThemeSet) {
                this.setChangedProperties({
                    propertyName: "themeSet",
                    name: "THEME_SET"
                }, sCurrentThemeSet, sNewThemeSet);
                sCurrentThemeSet = sNewThemeSet;
            }
        };

        /**
         * Sets this user's selected language and applies it.
         * Also the language is prepared to be stored as next start language on the front-end server.
         * The save itself has to be triggered by method updateUserPreferences of the UserInfo service.
         *
         * @param {string} sNewLanguage The theme to be applied
         * @since 1.46.0
         */
        this.setLanguage = function (sNewLanguage) {
            if (sNewLanguage) {
                this.setChangedProperties({
                    propertyName: "language",
                    name: "LANGUAGE"
                }, oSettings.language, sNewLanguage);
                oSettings.language = sNewLanguage;
            }
        };

        /**
         * Returns <code>true</code> if accessibility is active for this user.
         *
         * @returns {boolean} <code>true</code> if accessibility is active for this user
         * @since 1.15.0
         */
        this.getAccessibilityMode = function () {
            return oSettings.accessibility;
        };

        /**
         * Set this user's Accessibility mode.
         *
         * @param {boolean} bAccessibility <code>true</code> if accessibility shall be active for this user
         * @since 1.15.0
         */
        this.setAccessibilityMode = function (bAccessibility) {
            if (this.isSetAccessibilityPermitted() === false) {
                const sErrorMessage = "setAccessibilityMode not permitted";
                Log.error(sErrorMessage);
                throw new Error(sErrorMessage);
            }

            oSettings.accessibility = bAccessibility;
        };

        /**
         * Returns <code>true</code> if the isAdminUser property is set on the server.
         * Note: it is set only in CEP scenario to allow page editing.
         *
         * @returns {boolean} <code>true</code> if the isAdminUser is true for this user
         * @private
         * @since 1.107.0
         */
        this.isAdminUser = function () {
            return oSettings.isAdminUser === true;
        };

        /**
         * Return <code>true</code> if user is permitted to modify accessibility property.
         *
         * @returns {boolean} <code>true</code> if user is permitted to modify accessibility property.
         * @since 1.15.0
         */
        this.isSetAccessibilityPermitted = function () {
            return oSettings.setAccessibilityPermitted;
        };

        /**
         * Return <code>true</code> if user is permitted to modify theme property.
         *
         * @returns {boolean} <code>true</code> if user is permitted to modify theme property.
         * @since 1.15.0
         */
        this.isSetThemePermitted = function () {
            return oSettings.setThemePermitted;
        };

        /**
         * Returns the content density mode for this user.
         *
         * @returns {string} the content density mode for this user
         * @see #setContentDensity
         * @since 1.30.0
         */
        this.getContentDensity = function () {
            return oSettings.contentDensity;
        };

        /**
         * Set the user's content density mode (e.g. "cozy", "compact"...)
         * @param {string} sContentDensity content density mode (e.g. "cozy", "compact"...)
         * @throws Throws {sErrorMsg} if the configuration of ContentDensity for the user is not permitted
         * @see #isSetContentDensityPermitted
         * @since 1.30.0
         */
        this.setContentDensity = function (sContentDensity) {
            if (this.isSetContentDensityPermitted() === false) {
                const sErrorMessage = "setContentDensity not permitted";
                Log.error(sErrorMessage);
                throw new Error(sErrorMessage);
            }
            Log.debug("[000] setContentDensity", sContentDensity, "User");
            this.setChangedProperties({
                propertyName: "contentDensity",
                name: "CONTENT_DENSITY"
            }, oSettings.contentDensity, sContentDensity);
            // test that setChangedProperties is called if it is allowed to change contentDensity
            oSettings.contentDensity = sContentDensity;
        };

        /**
         * Returns <code>true</code> if user has the permission to modify content density property.
         *
         * @returns {boolean} <code>true</code> if user is permitted to modify content density property.
         * @see #setContentDensity
         * @since 1.30.0
         */
        this.isSetContentDensityPermitted = function () {
            return oSettings.setContentDensityPermitted;
        };

        /**
         * Returns this user's array of changed properties.
         *
         * @returns {string} this user's array of changed properties
         * @since 1.23.0
         */
        this.getChangedProperties = function () {
            Log.debug("[000] user: getChangedProperties: aChangedProperties", JSON.stringify(aChangedProperties), "User");
            return deepExtend([], aChangedProperties); // return a clone
        };

        /**
         * Updates the ChangedProperties attributes array on each setter invocation
         *
         * @param {object} property property to change
         * @param {string} currentValue current property value
         * @param {string} newValue value after update of the properties is done
         * @since 1.23.0
         */
        this.setChangedProperties = function (property, currentValue, newValue) {
            Log.debug("[000] setChangedProperties", [property.name, currentValue, newValue], "User");
            aChangedProperties.push({
                propertyName: property.propertyName,
                name: property.name,
                oldValue: currentValue,
                newValue: newValue
            });
        };

        /**
         * Cleans the ChangedProperties array
         *
         * @since 1.23.0
         */
        this.resetChangedProperties = function () {
            Log.debug("[000] resetChangedProperties", "User");
            aChangedProperties = [];
        };

        /**
         * Removes one property from the ChangedProperties array
         *
         * @param {string} sPropertyName name of the property that should be removed from the ChangedProperties array
         * @since 1.65.0
         */
        this.resetChangedProperty = function (sPropertyName) {
            Log.debug("[000] resetChangedProperty: sPropertyName:", sPropertyName, "User");

            aChangedProperties = aChangedProperties.filter((oProperty) => {
                return !(sPropertyName === oProperty.propertyName);
            });
        };

        this.getTrackUsageAnalytics = function () {
            return oSettings.trackUsageAnalytics;
        };

        this.setTrackUsageAnalytics = function (bTrackUsageAnalytics) {
            this.setChangedProperties({
                propertyName: "trackUsageAnalytics",
                name: "TRACKING_USAGE_ANALYTICS"
            }, oSettings.trackUsageAnalytics, bTrackUsageAnalytics);
            oSettings.trackUsageAnalytics = bTrackUsageAnalytics;
        };

        /**
         * Sets this user's profile image consent.
         *
         * @param {boolean} isImageConsent Whether the user gives his consent to present his profile picture or not
         */
        this.setImageConsent = function (isImageConsent) {
            this.setChangedProperties({
                propertyName: "isImageConsent",
                name: "ISIMAGECONSENT"
            }, oSettings.isImageConsent, isImageConsent);
            oSettings.isImageConsent = isImageConsent;
        };

        /**
         * Returns whether the user gave his consent to show his profile picture in FLP
         *
         * @returns {boolean} Whether the user gave his consent to present his profile picture or not
         */
        this.getImageConsent = function () {
            return oSettings.isImageConsent;
        };

        /**
         * Returns the user decision to (not) import bookmarks from the classical FLP Home page
         *
         * @returns {string} Value of the flag
         * @private
         */
        this.getImportBookmarksFlag = function () {
            return oSettings.importBookmarks || null;
        };

        /**
         * Store user decision to (not) import bookmarks from the classical FLP Home page
         *
         * @param {string} sImportBookmarks the flag value.
         * The following values are accepted: "done", "dismissed", "not_required", "pending".
         * @private
         */
        this.setImportBookmarksFlag = function (sImportBookmarks) {
            this.setChangedProperties({
                propertyName: "importBookmarks",
                name: "MYHOME_IMPORT_FROM_CLASSIC"
            }, this.getImportBookmarksFlag() || "", sImportBookmarks);
            oSettings.importBookmarks = sImportBookmarks;
        };

        /**
         * Returns the user setting to show or hide the My Home Space.
         *
         * @returns {boolean} True in case the user selected to show the My Home Space.
         * @private
         */
        this.getShowMyHome = function () {
            return oSettings.showMyHome !== false;
        };

        /**
         * Store user decision to show or hide the My Home page
         *
         * @param {boolean} bShow boolean value.
         * @private
         */
        this.setShowMyHome = function (bShow) {
            bShow = !!bShow;
            this.setChangedProperties({
                propertyName: "showMyHome",
                name: "MYHOME_ENABLEMENT"
            }, oSettings.showMyHome, bShow);
            oSettings.showMyHome = bShow;
        };

        /**
         * Returns the user setting to auto detect dark mode.
         *
         * @returns {boolean} True in case the user selected to enable Dark Mode Auto Detection.
         * @private
         */
        this.getDetectDarkMode = function () {
            return oSettings.detectDarkMode !== false;
        };

        /**
         * Store user decision to enable or disable the Auto Dark Mode Detection
         *
         * @param {boolean} bDetectDarkMode boolean value.
         * @private
         */
        this.setDetectDarkMode = function (bDetectDarkMode) {
            bDetectDarkMode = !!bDetectDarkMode;
            this.setChangedProperties({
                propertyName: "detectDarkMode",
                name: "THEME_DARKMODE_AUTO_DETECTION"
            }, oSettings.detectDarkMode, bDetectDarkMode);
            oSettings.detectDarkMode = bDetectDarkMode;
        };

        // ------- Constructor -------
        const oSystemTheme = {
            locationPathUi5: (new URI(sap.ui.require.toUrl(""))).absoluteTo(document.location).pathname(),
            // ensure an absolute path
            locationPathCustom: oSettings.themeRoot || "",
            locationOrigin: getOrigin(new URI(document.location))
        };
        if (!oSystemTheme.locationPathUi5) {
            Log.warning("User: Could not set UI5 location path");
        }
        if (!oSystemTheme.locationPathCustom) {
            Log.warning("User: Could not set location path for custom themes");
        }
        if (!oSystemTheme.locationOrigin) {
            Log.warning("User: Could not set front-end server location origin");
        }
        const oBootTheme = oSettings.bootTheme || { theme: "", root: "" };
        oCurrentTheme = this._amendTheme(oBootTheme, oSystemTheme);
        oStartupTheme = oCurrentTheme;

        /**
         * Sets this user's selected theme and applies it.
         * Also the theme is prepared to be stored as next start theme on the front-end server.
         * The save itself has to be triggered by method updateUserPreferences of the UserInfo service.
         * The theme can have the following formats:
         *   - <SAP theme> (starts with sap_)
         *     Theme will be loaded from the standard UI5 theme path from the front-end server
         *   - <custom theme> (does not start with sap_)
         *     If root is supplied explicitly in oContainerAdapterConfig.ranges.theme[].themeRoot, it will be used.
         *     theme will be loaded from the standard custom theme path (system theme root) from the front-end server
         *   - <theme name>@<theme path>
         *     Theme will be loaded from the supplied path from the front-end server
         *   - <theme name>@<theme URL> (not only the theme path but has also the origin)
         *     Theme will be loaded from the supplied URL. There could occur same origin issues.
         * The theme root where the theme to be applied is read from is determined considering the theme name.
         * If the theme starts with sap_ the theme is read from the standard UI5 theme path.
         * For all other themes the front-end server's system theme root is used.
         *
         * @param {string} sNewTheme The theme to be applied
         * @since 1.15.0
         */
        this.setTheme = function (sNewTheme) {
            if (this.isSetThemePermitted() === false) {
                const sErrorMessage = "setTheme not permitted";
                Log.error(sErrorMessage);
                throw new Error(sErrorMessage);
            }

            oCurrentTheme = this._amendTheme({
                theme: sNewTheme,
                root: this.getThemeRoot(sNewTheme)
            }, oSystemTheme);

            if (sNewTheme !== oStartupTheme.originalTheme.theme) {
                this.setChangedProperties({
                    propertyName: "theme",
                    name: "THEME"
                }, oStartupTheme.originalTheme.theme, sNewTheme);
                oStartupTheme = oCurrentTheme;
            }

            this.applyTheme(sNewTheme);

            // TODO: ThemeHandler.applyTheme(sNewTheme);

            /*
            Thought:
            - setTheme is more a "updateThemeId()" on the user
            - The consumer of User.setTheme() would have to call "setTheme" also on the ThemeHandler to make it active (User object could only store data)

            */
        };

        /**
         * Applies the given theme temporarily, without changing the
         * current preference of the user.
         *
         * @param {string} sNewTheme
         *   The new theme
         *
         * @protected
         */
        this.applyTheme = function (sNewTheme) {
            const oTheme = this._amendTheme({
                theme: sNewTheme,
                root: this.getThemeRoot(sNewTheme)
            }, oSystemTheme);

            // change current display theme
            oCurrentTheme = oTheme;

            if (oTheme.suppliedRoot) {
                Theming.setThemeRoot(oTheme.theme, `${oTheme.suppliedRoot}/UI5/`); // Beware: setThemeRoot() is a restriced UI5 Core API - ushell is allowlisted!
            } else if (oTheme.path) {
                Theming.setThemeRoot(oTheme.theme, `${oTheme.path}/UI5/`); // Beware: setThemeRoot() is a restriced UI5 Core API - ushell is allowlisted!
            }
            Theming.setTheme(oTheme.theme);

            // send a message the Iframe to change its theme
            sap.ui.require(["sap/ushell/appIntegration/PostMessageManager"], (PostMessageManager) => {
                PostMessageManager.sendRequestToAllApplications(
                    "sap.ushell.appRuntime.themeChange",
                    {
                        currentThemeId: this.getTheme(User.prototype.constants.themeFormat.NWBC),
                        themeServiceRoute: `${window.location.protocol}//${window.location.host}/comsapuitheming.runtime/themeroot/v1`
                    },
                    false
                );
            });
        };
    }

    /**
     * Completes missing parts of a theme data set returning a new object
     * @param {object} oThemeInput Input theme object
     *   {
     *     theme: <theme_name> plus optional theme path or URL
     *     root:  <theme path or URL>
     *   }
     * @param {object} oSystemTheme Theme data from the front-end server
     *   {
     *     locationPathUi5: <location path from where the sap_ themes are loaded from>
     *     locationPathCustom: <standard location path from where the custom themes are loaded from>
     *     locationOrigin: <origin of the front-end server URL>
     *   }
     * @returns {object}
     *   {
     *     originalTheme: {
     *       theme: <theme name plus optional origin and path>,
     *       root: <might be empty
     *       suppliedRoot: <either split from the theme or the root member
     *     },
     *     theme: <theme name>,
     *     path: <theme path>,
     *     locationPath: <path of the theme loading URL>,
     *     locationOrigin: <origin of the theme loading URL>
     *   }
     * @private
     */
    User.prototype._amendTheme = function (oThemeInput, oSystemTheme) {
        if (!oThemeInput || !oThemeInput.theme || !oSystemTheme) {
            return {
                originalTheme: {
                    theme: "",
                    root: ""
                },
                theme: "",
                suppliedRoot: "",
                path: "",
                locationPath: "",
                locationOrigin: ""
            };
        }

        function splitRootAndAmend (sRoot, oTheme) {
            const oUrl = new URI(sRoot);
            const sOrigin = getOrigin(oUrl);

            // root has no origin -> use the system origin
            return {
                locationOrigin: sOrigin || oTheme.locationOrigin,
                locationPath: sOrigin ? oUrl.path() : sRoot
            };
        }

        const oThemeResult = {
            originalTheme: clone(oThemeInput)
        };
        let oRootParts;
        if (oThemeResult.originalTheme.theme.indexOf("@") > 0) {
            const aThemeParts = oThemeResult.originalTheme.theme.split("@", 2);
            oThemeResult.theme = aThemeParts[0];
            oThemeResult.suppliedRoot = aThemeParts[1];
            oRootParts = splitRootAndAmend(aThemeParts[1], oSystemTheme);
            oThemeResult.locationPath = oRootParts.locationPath;
            oThemeResult.path = oThemeResult.locationPath;
            oThemeResult.locationOrigin = oRootParts.locationOrigin;
            return oThemeResult;
        }
        oThemeResult.theme = oThemeResult.originalTheme.theme; // contains no path
        if (oThemeResult.originalTheme.root) {
            oThemeResult.suppliedRoot = oThemeResult.originalTheme.root;
            oRootParts = splitRootAndAmend(oThemeResult.originalTheme.root, oSystemTheme);
            oThemeResult.locationPath = oRootParts.locationPath;
            oThemeResult.path = oThemeResult.locationPath;
            oThemeResult.locationOrigin = oRootParts.locationOrigin;
            return oThemeResult;
        }
        // no root supplied
        oThemeResult.suppliedRoot = "";
        if (isSapTheme(oThemeResult.theme)) {
            // no root & sap theme
            oThemeResult.locationOrigin = oSystemTheme.locationOrigin;
            oThemeResult.locationPath = oSystemTheme.locationPathUi5;
            oThemeResult.path = "";
            return oThemeResult;
        }
        oThemeResult.locationOrigin = oSystemTheme.locationOrigin;
        oThemeResult.locationPath = oSystemTheme.locationPathCustom;
        oThemeResult.path = oThemeResult.locationPath;
        return oThemeResult;
    };

    User.prototype.constants = {
        /**
         * Enum for theme format.
         * @readonly
         * @enum {string}
         *   - ORIGINAL_THEME: either supplied by bootstrap or by user preferences
         *   - THEME_NAME_PLUS_URL: e.g. myTheme@https://server.company.com/theme/path/sap-client=000/~2324edfj534ft43~
         *   - NWBC: for calling WDA & SAP GUI via NWBC;
         *       for sap_ themes -> only theme name;
         *       for custom themes -> THEME_NAME_PLUS_URL
         * @since 1.34.0
         */
        themeFormat: {
            ORIGINAL_THEME: "O",
            // either supplied by bootstrap or by user preferences
            THEME_NAME_PLUS_URL: "N+U",
            // e.g. myTheme@https://server.company.com/theme/path/sap-client=000/~2324edfj534ft43~
            NWBC: "NWBC"
            // for calling WDA & SAP GUI via NWBC
        }
    };

    return User;
}, /* bExport= */ true);

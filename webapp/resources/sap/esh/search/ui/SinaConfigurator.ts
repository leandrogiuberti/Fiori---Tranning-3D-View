/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { sinaParameters } from "./SearchConfigurationSettings";
import { AvailableProviders, SinaConfiguration } from "./sinaNexTS/sina/SinaConfiguration";
import Log from "sap/base/Log";
import { Severity } from "./sinaNexTS/core/Log";
import SearchModel from "./SearchModel";
import { generateCustomNavigationTracker } from "./navigationtrackers/CustomNavigationTracker";
import { generateEventLoggerNavigationTracker } from "./navigationtrackers/EventLoggerNavigationTracker";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import UI5NumberFormat from "sap/ui/core/format/NumberFormat";
import UI5DateFormat from "sap/ui/core/format/DateFormat";
import i18n from "./i18n";
import Localization from "sap/base/i18n/Localization";

interface ConfigurationOptions {
    configureGetTextFromResourceBundle?: boolean;
    configureLogging?: boolean;
    configureCommonParameters?: boolean;
    configureNavigationTrackers?: boolean;
    configureFormatLibrary?: boolean;
    configureGetText?: boolean;
    configureLanguage?: boolean;
}

export class SinaConfigurator {
    model: SearchModel;
    loadedResourceBundles: Map<string, ResourceBundle>;

    constructor(model) {
        this.model = model;
        this.loadedResourceBundles = new Map();
    }

    configure(sinaConfigurations: Array<SinaConfiguration | AvailableProviders>): Array<SinaConfiguration> {
        const resultSinaConfigurations = [];
        for (const sinaConfiguration of sinaConfigurations) {
            resultSinaConfigurations.push(
                this.configureSina(sinaConfiguration, {
                    configureLogging: true,
                    configureCommonParameters: true,
                    configureNavigationTrackers: true,
                    configureGetTextFromResourceBundle: true,
                    configureFormatLibrary: true,
                    configureGetText: true,
                    configureLanguage: true,
                })
            );
        }
        return resultSinaConfigurations;
    }

    configureSina(
        sinaConfiguration: SinaConfiguration | AvailableProviders,
        configurationOptions: ConfigurationOptions
    ) {
        sinaConfiguration = this.normalizeConfiguration(sinaConfiguration);
        if (configurationOptions.configureCommonParameters) {
            this.configureCommonParameters(sinaConfiguration);
        }
        if (configurationOptions.configureFormatLibrary) {
            this.configureFormatLibrary(sinaConfiguration);
        }
        if (configurationOptions.configureLogging) {
            this.configureLogging(sinaConfiguration);
        }
        if (configurationOptions.configureNavigationTrackers) {
            this.configureNavigationTracking(sinaConfiguration);
        }
        if (configurationOptions.configureGetTextFromResourceBundle) {
            this.configureGetTextFromResourceBundle(sinaConfiguration);
        }
        if (configurationOptions.configureGetText) {
            this.configureGetText(sinaConfiguration);
        }
        if (configurationOptions.configureLanguage) {
            this.configureLanguage(sinaConfiguration);
        }
        if (sinaConfiguration.subProviders) {
            sinaConfiguration.subProviders = sinaConfiguration.subProviders.map((subProviderConfiguration) =>
                this.configureSina(subProviderConfiguration, {
                    configureNavigationTrackers: true,
                })
            );
        }
        return sinaConfiguration;
    }

    normalizeConfiguration(sinaConfiguration: SinaConfiguration | AvailableProviders): SinaConfiguration {
        if (typeof sinaConfiguration === "string") {
            return { provider: sinaConfiguration, url: "" };
        }
        return sinaConfiguration;
    }

    private configureLanguage(sinaConfiguration: SinaConfiguration) {
        if (this.model.config.isUshell && typeof (sap as any).cf === "undefined") {
            // is ushell but not cFLP / workzone (which defines sap.cf global)
            // which does not have a sap-usercontext cookie to determine the users language
            // do nothing, language setting will be done by ushell
            return;
        }
        if (!sinaConfiguration.getLanguage) {
            const getLanguageFunction = () => Localization.getLanguage();
            sinaConfiguration["getLanguage"] = getLanguageFunction;
        }
    }

    configureNavigationTracking(sinaConfiguration: SinaConfiguration) {
        sinaConfiguration.navigationTrackers = sinaConfiguration.navigationTrackers || [];
        sinaConfiguration.navigationTrackers.push(generateCustomNavigationTracker(this.model));
        sinaConfiguration.navigationTrackers.push(generateEventLoggerNavigationTracker(this.model));
    }

    configureCommonParameters(sinaConfiguration: SinaConfiguration) {
        for (const parameterName of sinaParameters) {
            if (!sinaConfiguration[parameterName]) {
                sinaConfiguration[parameterName] = this.model.config[parameterName];
            }
        }
    }

    configureFormatLibrary(sinaConfiguration: SinaConfiguration) {
        sinaConfiguration.NumberFormat = UI5NumberFormat;
        sinaConfiguration.DateFormat = UI5DateFormat;
    }

    configureLogging(sinaConfiguration: SinaConfiguration) {
        const sinaUI5Log = Log.getLogger("sap.esh.search.ui.sina");
        // log target
        sinaConfiguration.logTarget = {
            debug: sinaUI5Log.debug,
            info: sinaUI5Log.info,
            warn: sinaUI5Log.warning,
            error: sinaUI5Log.error,
        };
        // map UI5 loglevel to Sina loglevel:
        let sinaLogLevel = Severity.ERROR;
        switch (sinaUI5Log.getLevel()) {
            case Log.Level.ALL:
            case Log.Level.TRACE:
            case Log.Level.DEBUG:
                sinaLogLevel = Severity.DEBUG;
                break;
            case Log.Level.INFO:
                sinaLogLevel = Severity.INFO;
                break;
            case Log.Level.WARNING:
                sinaLogLevel = Severity.WARN;
                break;
        }
        sinaConfiguration.logLevel = sinaLogLevel;
    }

    configureGetTextFromResourceBundle(sinaConfiguration: SinaConfiguration) {
        sinaConfiguration.getTextFromResourceBundle = async (url: string, key: string): Promise<string> => {
            let resourceBundle: ResourceBundle;
            if (this.loadedResourceBundles.has(url)) {
                resourceBundle = this.loadedResourceBundles.get(url);
            } else {
                resourceBundle = await ResourceBundle.create({ url: url });
                this.loadedResourceBundles.set(url, resourceBundle);
            }
            return resourceBundle.getText(key);
        };
    }

    configureGetText(sinaConfiguration: SinaConfiguration) {
        sinaConfiguration.getText = i18n.getText.bind(i18n);
    }
}

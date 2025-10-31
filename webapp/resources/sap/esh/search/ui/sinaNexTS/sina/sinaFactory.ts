/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import * as sinaLog from "../core/Log";
import { NoValidEnterpriseSearchAPIConfigurationFoundError } from "../core/errors";
import * as util from "../core/util";
import { AbstractProvider } from "../providers/AbstractProvider";
import { Provider as ABAPODataProvider } from "../providers/abap_odata/Provider";
import { Provider as DummyProvider } from "../providers/dummy/Provider";
import { Provider as HANAODataProvider } from "../providers/hana_odata/Provider";
import { Provider as INAV2Provider } from "../providers/inav2/Provider";
import { MultiProvider } from "../providers/multi/Provider";
import { Provider as SampleProvider } from "../providers/sample/Provider";
import { Provider as Sample2Provider } from "../providers/sample2/Provider";
import { Sina } from "./Sina";
import { AvailableProviders, SinaConfiguration, _normalizeConfiguration } from "./SinaConfiguration";
import { injectGetText } from "./i18n";

if (
    typeof process !== "undefined" &&
    // eslint-disable-next-line no-undef
    process.env &&
    // eslint-disable-next-line no-undef
    process.env.NODE_ENV &&
    // eslint-disable-next-line no-undef
    process.env.NODE_ENV === "debug"
) {
    const logTest = new sinaLog.Log();
    sinaLog.Log.level = sinaLog.Severity.DEBUG;
    logTest.debug("SINA log level set to debug!");
}

export async function createAsync(configuration: SinaConfiguration | string): Promise<Sina> {
    const normalizedConfiguration = await _normalizeConfiguration(configuration);
    if (normalizedConfiguration.getText) {
        injectGetText(normalizedConfiguration.getText);
    }
    if (normalizedConfiguration.logTarget) {
        sinaLog.Log.persistency = normalizedConfiguration.logTarget;
    }
    if (typeof normalizedConfiguration.logLevel !== "undefined") {
        sinaLog.Log.level = normalizedConfiguration.logLevel;
    }
    const log = new sinaLog.Log("sinaFactory");
    log.debug("Creating new sina (esh client) instance using provider " + normalizedConfiguration.provider);
    let providerInstance: AbstractProvider;
    switch (normalizedConfiguration.provider) {
        case AvailableProviders.HANA_ODATA: {
            providerInstance = new HANAODataProvider();
            break;
        }
        case AvailableProviders.ABAP_ODATA: {
            providerInstance = new ABAPODataProvider();
            break;
        }
        case AvailableProviders.INAV2: {
            providerInstance = new INAV2Provider();
            break;
        }
        case AvailableProviders.MULTI: {
            providerInstance = new MultiProvider();
            break;
        }
        case AvailableProviders.SAMPLE: {
            providerInstance = new SampleProvider();
            break;
        }
        case AvailableProviders.SAMPLE2: {
            providerInstance = new Sample2Provider();
            break;
        }
        case AvailableProviders.MOCK_NLQRESULTS: {
            // eslint-disable-next-line
            // @ts-ignore
            const module = await import("/sap/esh/search/ui/sinaNexTS/providers/mock/MockNlqResultsProvider");
            providerInstance = new module.MockNlqResultsProvider();
            break;
        }
        case AvailableProviders.MOCK_SUGGESTIONTYPES: {
            const module = await import(
                // eslint-disable-next-line
                // @ts-ignore
                "/sap/esh/search/ui/sinaNexTS/providers/mock/MockSuggestionTypesProvider"
            );
            providerInstance = new module.MockSuggestionTypesProvider();
            break;
        }
        case AvailableProviders.MOCK_DELETEANDREORDER: {
            const module = await import(
                // eslint-disable-next-line
                // @ts-ignore
                "/sap/esh/search/ui/sinaNexTS/providers/mock/MockDeleteAndReorderProvider"
            );
            providerInstance = new module.MockDeleteAndReorderProvider();
            break;
        }
        case AvailableProviders.DUMMY: {
            providerInstance = new DummyProvider();
            break;
        }
        default: {
            // Do not print mock providers in error message
            throw new Error(
                "Unknown Provider: '" +
                    normalizedConfiguration.provider +
                    "' - Available Providers: " +
                    AvailableProviders.HANA_ODATA +
                    ", " +
                    AvailableProviders.ABAP_ODATA +
                    ", " +
                    AvailableProviders.INAV2 +
                    ", " +
                    AvailableProviders.MULTI +
                    ", " +
                    AvailableProviders.SAMPLE +
                    ", " +
                    AvailableProviders.SAMPLE2 +
                    ", " +
                    AvailableProviders.DUMMY
            );
        }
    }

    const sina = new Sina(providerInstance);
    await sina.initAsync(normalizedConfiguration);
    return sina;
}

export function createByTrialAsync(
    inputConfigurations: Array<SinaConfiguration | string | AvailableProviders>,
    checkSuccessCallback?: (sina: Sina) => boolean
): Promise<Sina> {
    let configurations;

    // normalize configurations
    return Promise.all(inputConfigurations.map(_normalizeConfiguration.bind(this)))
        .then(
            function (normalizedConfigurations) {
                // mixin url configuration into configurations
                configurations = normalizedConfigurations;
                return _mixinUrlConfiguration(configurations);
            }.bind(this)
        )
        .then(
            function () {
                // recursive creation of sina by loop at configurations
                // (first configuration which successfully creates sina wins)
                return _createSinaRecursively(configurations, checkSuccessCallback);
            }.bind(this)
        );
}

async function _readConfigurationFromUrl(): Promise<SinaConfiguration | void> {
    const sinaConfiguration = util.getUrlParameter("sinaConfiguration");
    if (sinaConfiguration) {
        return _normalizeConfiguration(sinaConfiguration);
    }
    const sinaProvider = util.getUrlParameter("sinaProvider");
    if (sinaProvider) {
        return _normalizeConfiguration(sinaProvider);
    }
    return Promise.resolve();
}

async function _createSinaRecursively(
    configurations: SinaConfiguration[],
    checkSuccessCallback?: (sina: Sina) => boolean
): Promise<Sina> {
    const log = new sinaLog.Log("sinaFactory");
    const errors = [];
    // set default for checkSuccesCallback
    checkSuccessCallback =
        checkSuccessCallback ||
        function () {
            return true;
        };

    const providersTried = [];
    // helper for recursion
    const doCreate = function (index): Promise<Sina> {
        if (index >= configurations.length) {
            let finalError;
            if (errors.length >= 1) {
                // display error of last sina config (this is what at least shall work)
                // - FLP:     ABAP OData and INA are failing -> at least app-search shall work
                // - DSP/SAC: Only one config -> shalll work
                finalError = new NoValidEnterpriseSearchAPIConfigurationFoundError(
                    providersTried.join(", "),
                    errors[errors.length - 1].error
                );
            } else {
                // no error details/previous (fallback, not expected)
                finalError = new NoValidEnterpriseSearchAPIConfigurationFoundError(providersTried.join(", "));
            }
            return Promise.reject(finalError);
        }
        const configuration = configurations[index];
        providersTried.push(configuration.provider);
        return createAsync(configuration).then(
            function (sina) {
                if (checkSuccessCallback(sina)) {
                    return sina;
                }
                return doCreate(index + 1);
            },
            function (error: Error) {
                log.info(error);
                errors.push({ index: index, error: error });
                return doCreate(index + 1);
            }
        );
    }.bind(this);

    // start recursion
    return doCreate(0);
}

async function _mixinUrlConfiguration(configurations: SinaConfiguration[]): Promise<void> {
    const configurationFromUrl = await _readConfigurationFromUrl();

    if (!configurationFromUrl) {
        return;
    }

    if (configurations.length === 1) {
        // 1) just merge url configuration into configuration
        _mergeConfiguration(configurations[0], configurationFromUrl);
        return;
    } else {
        // 2) use url configuration also for filtering (legacy: useful for forcing flp to use inav2 for a abap system which offers abap_odata and inav2)
        let found = false;
        for (let i = 0; i < configurations.length; ++i) {
            const configuration = configurations[i];

            // ignore dummy provider
            if (configuration.provider === AvailableProviders.DUMMY) {
                continue;
            }

            // remove not matching providers
            if (configuration.provider !== configurationFromUrl.provider) {
                configurations.splice(i, 1);
                i--;
                continue;
            }

            // merge ulr configuration into configuration
            found = true;
            _mergeConfiguration(configuration, configurationFromUrl);
        }
        if (!found) {
            configurations.splice(0, 0, configurationFromUrl);
        }
    }
}

function _mergeConfiguration(configuration1, configuration2) {
    // TODO: deep merge
    for (const property in configuration2) {
        configuration1[property] = configuration2[property];
    }
}

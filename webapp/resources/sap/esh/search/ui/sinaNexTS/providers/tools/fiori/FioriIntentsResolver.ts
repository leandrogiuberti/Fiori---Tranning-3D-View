/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { SinaObject, SinaObjectProperties } from "../../../sina/SinaObject";
import { AttributeType } from "../../../sina/AttributeType";
import { NavigationTarget } from "../../../sina/NavigationTarget";
import { getNavigationService } from "./NavigationServiceFactory";
import { Log } from "../../../core/Log";

type ResolverResult =
    | {
          defaultNavigationTarget?: NavigationTarget;
          navigationTargets?: Array<NavigationTarget>;
      }
    | undefined;

export type FioriIntentsResolverOptions = SinaObjectProperties;

export class FioriIntentsResolver extends SinaObject {
    private _fioriFrontendSystemInfo: { systemId: string; client: string };
    private _primaryIntentAction: string;
    private _suppressInSearchTag: string;
    private log = new Log("FioriIntentsResolver");

    constructor(properties: SinaObjectProperties) {
        super(properties);
        const uShellContainer = typeof window !== "undefined" ? window?.sap?.ushell?.["Container"] : null; // not available for sina on node.js
        if (uShellContainer) {
            this._fioriFrontendSystemInfo = {
                systemId: uShellContainer.getLogonSystem().getName(),
                client: uShellContainer.getLogonSystem().getClient(),
            };
            this._primaryIntentAction = "-displayFactSheet";
            this._suppressInSearchTag = "suppressInEnterpriseSearch".toLowerCase();
        } else {
            this._fioriFrontendSystemInfo = {
                systemId: "",
                client: "",
            };
        }
    }

    public async resolveIntents(vArgs: any | any[]): Promise<ResolverResult | Array<ResolverResult>> {
        // check navigation service
        const navigationService = await getNavigationService();
        if (!navigationService || !vArgs) {
            return {
                defaultNavigationTarget: vArgs.fallbackDefaultNavigationTarget,
            };
        }

        if (Array.isArray(vArgs)) {
            // mass request
            const promises = vArgs.map((_vArgs) => this.doResolveIntents(_vArgs));
            return await Promise.all(promises);
        } else {
            // single object request
            return await this.doResolveIntents(vArgs);
        }
    }

    private async doResolveIntents(options): Promise<ResolverResult> {
        // destructuring of input parameters
        const semanticObjectType = options.semanticObjectType;
        const semanticObjectTypeAttrs = options.semanticObjectTypeAttributes;
        const systemId = options.systemId;
        const client = options.client;
        const fallbackDefaultNavigationTarget = options.fallbackDefaultNavigationTarget;

        // no semantic object type -> return fallback navigation target
        if (!semanticObjectType || semanticObjectType.length === 0) {
            return {
                defaultNavigationTarget: fallbackDefaultNavigationTarget,
            };
        }

        // no semantic object type attributes -> return undefined (TODO: why not fallback navigation target?)
        if (!semanticObjectTypeAttrs || semanticObjectTypeAttrs.length === 0) {
            return undefined;
        }

        // convert semantic object type params into format suitable for navigation service
        const semanticObjectTypeAttrsAsParams = this.convertSemanticObjectTypeAttrs(semanticObjectTypeAttrs);

        // fetch primary intent & secondary intents
        const [primaryIntent, secondaryIntents] = await Promise.all([
            this.getPrimaryIntent(semanticObjectType, semanticObjectTypeAttrsAsParams),
            this.getSecondaryIntents(semanticObjectType, semanticObjectTypeAttrsAsParams),
        ]);

        // create result structure
        const result: ResolverResult = {
            defaultNavigationTarget: undefined,
            navigationTargets: [],
        };

        // assemble sap system
        const sapSystem = this.assembleSapSystem(systemId, client);

        // assemble default navigation target from primary intent
        let defaultNavigationTarget;
        if (primaryIntent && !this.shallIntentBeSuppressed(primaryIntent)) {
            defaultNavigationTarget = await this.getNavigationTargetForIntent(primaryIntent, sapSystem);
            result.defaultNavigationTarget = defaultNavigationTarget;
        }
        let primaryIntentExists = result.defaultNavigationTarget !== undefined;

        // assemble additional navigation targets from secondary intents
        if (!secondaryIntents) {
            return result;
        }
        const validSecondaryIntents = [];
        const validNavigationTargetPromises = [];
        for (const secondaryIntent of secondaryIntents) {
            if (this.shallIntentBeSuppressed(secondaryIntent)) {
                continue;
            }
            validSecondaryIntents.push(secondaryIntent);
            validNavigationTargetPromises.push(this.getNavigationTargetForIntent(secondaryIntent, sapSystem));
        }
        const validNavigationTargets = await Promise.all(validNavigationTargetPromises);
        for (let i = 0; i < validSecondaryIntents.length; ++i) {
            const validSecondaryIntent = validSecondaryIntents[i];
            const validNavigationTarget = validNavigationTargets[i];
            if (!primaryIntentExists && this.isPrimaryIntentAction(validSecondaryIntent)) {
                result.defaultNavigationTarget = validNavigationTarget;
                primaryIntentExists = true;
            } else if (
                !defaultNavigationTarget ||
                !validNavigationTarget.isEqualTo(defaultNavigationTarget)
            ) {
                result.navigationTargets.push(validNavigationTarget);
            }
        }

        return result;
    }

    private isPrimaryIntentAction(intent) {
        const action = intent.intent.substring(intent.intent.indexOf("-"), intent.intent.indexOf("?"));
        return action === this._primaryIntentAction;
    }

    private assembleSapSystem(systemId, client) {
        // Set sap-system parameter if:
        // 0) we run on cFLP in the cloud which is indicated by the global variable sap.cf
        // 1) systemId or client from search response are not undefined or empty
        // 2) fioriFrontendSystemInfo is *NOT* set
        // 3) fioriFrontendSystemInfo is set, but it contains different systemId and client info than the search response
        // TODO: this comment is misleading because it neglects the AND, OR conjunctions
        const sapSystem: {
            systemId: string;
            client: string;
            urlParameter?: string;
        } = {
            systemId: systemId || (this._fioriFrontendSystemInfo && this._fioriFrontendSystemInfo.systemId),
            client: client || (this._fioriFrontendSystemInfo.client && this._fioriFrontendSystemInfo.client),
        };

        if (
            (window.sap && window.sap["cf"]) || // 0)
            (systemId &&
                systemId.trim().length > 0 &&
                client &&
                client.trim().length > 0 && // 1)
                (!this._fioriFrontendSystemInfo || // 2)
                    !(
                        this._fioriFrontendSystemInfo.systemId === systemId &&
                        this._fioriFrontendSystemInfo.client === client
                    )))
        ) {
            // 3)
            sapSystem.urlParameter = "sap-system=sid(" + systemId + "." + client + ")";
        }

        return sapSystem;
    }

    private convertSemanticObjectTypeAttrs(semanticObjectTypeAttrs) {
        const semanticObjectTypeAttrsAsParams = {};
        for (const semanticObjectTypeAttr of semanticObjectTypeAttrs) {
            const value = this.convertAttributeValueToUI5DataTypeFormats(
                semanticObjectTypeAttr.value,
                semanticObjectTypeAttr.type
            );
            semanticObjectTypeAttrsAsParams[semanticObjectTypeAttr.name] = value;
        }
        return semanticObjectTypeAttrsAsParams;
    }

    private async getPrimaryIntent(semanticObjectType, semanticObjectTypeAttrsAsParams): Promise<any> {
        const navigationService = await getNavigationService();
        if (!navigationService || !navigationService.getPrimaryIntent) {
            return undefined;
        }
        try {
            return await this.convertJQueryDeferredToPromise(
                navigationService.getPrimaryIntent(semanticObjectType, semanticObjectTypeAttrsAsParams)
            );
        } catch (e) {
            this.log.warn("Error while fetching primary intent: " + e);
            return undefined; // TODO logging
        }
    }

    private async getSecondaryIntents(semanticObjectType, semanticObjectTypeAttrsAsParams) {
        const navigationService = await getNavigationService();
        if (!navigationService) {
            return undefined;
        }

        if (!navigationService.getLinks) {
            return undefined;
        }

        try {
            return await this.convertJQueryDeferredToPromise(
                navigationService.getLinks({
                    semanticObject: semanticObjectType,
                    params: semanticObjectTypeAttrsAsParams,
                    withAtLeastOneUsedParam: true,
                    sortResultOnTexts: true,
                })
            );
        } catch (e) {
            this.log.warn("Error while fetching secondary intents: " + e);
            return undefined; // TODO logging
        }
    }

    private shallIntentBeSuppressed(intent): boolean {
        if (intent.tags) {
            for (let i = 0; i < intent.tags.length; i++) {
                if (intent.tags[i].toLowerCase() === this._suppressInSearchTag) {
                    return true;
                }
            }
        }
        return false;
    }

    private async getNavigationTargetForIntent(intent, sapSystem) {
        const navigationService = await getNavigationService();

        let shellHash = intent.intent;

        if (sapSystem.urlParameter) {
            if (shellHash.indexOf("?") === -1) {
                shellHash += "?";
            } else {
                shellHash += "&";
            }
            shellHash += sapSystem.urlParameter;
        }

        const externalTarget = {
            target: {
                shellHash: shellHash,
            },
        };

        const externalHash = await this.convertJQueryDeferredToPromise(
            navigationService.hrefForExternalAsync(externalTarget)
        );

        const navigationObject = this.sina.createNavigationTarget({
            text: intent.text,
            targetUrl: externalHash,
            customWindowOpenFunction: () => {
                navigationService.toExternal(externalTarget);
            },
        });

        return navigationObject;
    }

    private convertAttributeValueToUI5DataTypeFormats(value, sinaAttributeType: AttributeType) {
        let year, month, day, hour, minute, seconds, microseconds;
        switch (sinaAttributeType) {
            case AttributeType.Timestamp:
                // sina: JavaScript Date object
                // UI5: "YYYY-MM-DDTHH:MM:SS.mmm"
                year = value.getUTCFullYear();
                month = value.getUTCMonth() + 1;
                day = value.getUTCDate();
                hour = value.getUTCHours();
                minute = value.getUTCMinutes();
                seconds = value.getUTCSeconds();
                microseconds = value.getUTCMilliseconds() * 1000;

                value =
                    this.addLeadingZeros(year.toString(), 4) +
                    "-" +
                    this.addLeadingZeros(month.toString(), 2) +
                    "-" +
                    this.addLeadingZeros(day.toString(), 2) +
                    "T" +
                    this.addLeadingZeros(hour.toString(), 2) +
                    ":" +
                    this.addLeadingZeros(minute.toString(), 2) +
                    ":" +
                    this.addLeadingZeros(seconds.toString(), 2) +
                    "." +
                    this.addLeadingZeros(microseconds.toString(), 3);
                break;
            case AttributeType.Date:
                // sina: JavaScript Date object
                // UI5: "YYYY-MM-DD"
                value = value.slice(0, 4) + "-" + value.slice(5, 7) + "-" + value.slice(8, 10);
                break;
        }
        return value;
    }

    private addLeadingZeros(value, length) {
        return "00000000000000".slice(0, length - value.length) + value;
    }

    private convertJQueryDeferredToPromise(deferred) {
        if (deferred.always) {
            // is deferred, convert needed
            return new Promise(function (resolve, reject) {
                deferred.then(resolve, reject);
            });
        } else {
            // is promise, convert not needed
            return deferred;
        }
    }
}

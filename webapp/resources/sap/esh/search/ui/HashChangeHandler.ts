/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { TechnicalEventType } from "./eventlogging/TechnicalEvents";
import SearchModel from "./SearchModel";

// track navigation
// model class for track navigation
// =======================================================================

const HashChangeHandler = {
    handle: async function (hashChangeInfo: {
        newShellHash: string;
        oldShellHash?: string;
        oldAppSpecificRoute?: string;
    }): Promise<void> {
        this.sourceUrlArray = [];
        if (hashChangeInfo.oldShellHash !== null) {
            this.sourceUrlArray.push(hashChangeInfo.oldShellHash);
        }
        if (hashChangeInfo.oldAppSpecificRoute !== null) {
            if (hashChangeInfo.oldAppSpecificRoute.substring(0, 2) === "&/") {
                // remove first special parameter indicator "&/"
                this.sourceUrlArray.push(hashChangeInfo.oldAppSpecificRoute.substring(2));
            } else {
                this.sourceUrlArray.push(hashChangeInfo.oldAppSpecificRoute);
            }
        }

        await this._createSearchModel();
        const event = {
            type: TechnicalEventType.HASH_CHANGE,
            sourceUrlArray: this.sourceUrlArray,
            targetUrl: "#" + hashChangeInfo.newShellHash,
            systemAndClient: this._getSID(),
        };
        if (event.targetUrl.indexOf("=") !== -1) {
            this.searchModel.sinaNext.logUserEvent(event);
        }
    },

    _createSearchModel: async function (): Promise<void> {
        if (this.initializedPromise) {
            return this.initializedPromise;
        }
        // get search model and call init
        this.searchModel = SearchModel.getModelSingleton({}, "flp");
        this.initializedPromise = this.searchModel.initBusinessObjSearch();
        return this.initializedPromise;
    },

    _getSID: function (): {
        systemId: string;
        client: string;
    } {
        // extract System and Client from sap-system=sid(BE1.001)
        const systemAndClient = {
            systemId: "",
            client: "",
        };
        const url = window.location.href;
        const systemBegin = url.indexOf("sap-system=sid(");

        if (systemBegin !== -1) {
            const systemEnd = url.substring(systemBegin).indexOf(")");
            if (systemEnd !== -1) {
                const systemInUrl = url.substring(systemBegin + 15, systemBegin + systemEnd);
                if (systemInUrl.split(".").length === 2) {
                    systemAndClient.systemId = systemInUrl.split(".")[0];
                    systemAndClient.client = systemInUrl.split(".")[1];
                }
            }
        }
        return systemAndClient;
    },
};

export default HashChangeHandler;

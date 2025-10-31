/* !
 * Copyright (c) 2009-2025 SAP SE, All Rights Reserved
 */

sap.ui.define([
    /*
     * Be careful with new dependencies.
     * Only include dependencies that are already bundled in
     * core-min/core-ext, appruntime or the flex-plugins bundle
     * otherwise load the library lazily before use.
     */
], (
) => {
    "use strict";

    return {
        STATUS_STARTING: "starting",
        STATUS_STARTED: "started",
        STATUS_STOPPING: "stopping",
        STATUS_STOPPED: "stopped"
    };
}, /* bExport= */true);

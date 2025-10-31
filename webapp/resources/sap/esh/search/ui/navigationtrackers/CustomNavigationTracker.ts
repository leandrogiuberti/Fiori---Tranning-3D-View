/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchModel from "../SearchModel";
import errors from "../error/errors";
import { NavigationTarget, NavigationTracker } from "../sinaNexTS/sina/NavigationTarget";

export function generateCustomNavigationTracker(model: SearchModel): NavigationTracker {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (navigationTarget: NavigationTarget) => {
        try {
            model.config.beforeNavigation(model);
        } catch (err) {
            const oError = new errors.ConfigurationExitError(
                "beforeNavigation",
                model.config.applicationComponent,
                err
            );
            throw oError;
        }
    };
}

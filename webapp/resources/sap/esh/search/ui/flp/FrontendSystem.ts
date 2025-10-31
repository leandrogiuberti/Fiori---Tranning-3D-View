/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import Container from "sap/ushell/Container";
import { System } from "../sinaNexTS/sina/System";

interface ExtendedContainer extends Container {
    getLogonSystem(): {
        getName(): string;
        getClient(): string;
    };
}

export default class FrontendSystem {
    private static fioriFrontendSystemInfo: System;

    static getSystem(): System {
        if (typeof FrontendSystem.fioriFrontendSystemInfo === "undefined") {
            FrontendSystem.fioriFrontendSystemInfo = new System({
                id:
                    (Container as ExtendedContainer).getLogonSystem().getName() +
                    "." +
                    (Container as ExtendedContainer).getLogonSystem().getClient(),
                label:
                    (Container as ExtendedContainer).getLogonSystem().getName() +
                    " " +
                    (Container as ExtendedContainer).getLogonSystem().getClient(),
            });
        }
        return FrontendSystem.fioriFrontendSystemInfo;
    }
}

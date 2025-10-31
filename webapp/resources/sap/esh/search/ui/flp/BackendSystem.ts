/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchModel from "../SearchModel";
import { System } from "../sinaNexTS/sina/System";

export default class BackendSystem {
    public static getSystem(searchModel: SearchModel): System {
        return searchModel.getProperty("/dataSources")[3]?.system;
    }
}

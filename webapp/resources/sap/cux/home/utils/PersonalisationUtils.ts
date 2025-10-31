/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import ManagedObject from "sap/ui/base/ManagedObject";
import BaseObject from "sap/ui/base/Object";
import Component from "sap/ui/core/Component";
import UIComponent from "sap/ui/core/UIComponent";

const defaultContainerId = "sap.cux";

/**
 *
 * Provides the util methods used for UshellPersonalizer.
 *
 * @extends sap.ui.BaseObject
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.122.0
 * @private
 *
 * @alias sap.cux.home.utils.PersonalisationUtils
 */

class PersonalisationUtils extends BaseObject {
	private persContainerId!: string;

	constructor() {
		super();
	}
	public getPersContainerId(oManagedObject: ManagedObject, bNewId: boolean = false): string {
		if (this.persContainerId && !bNewId) {
			return this.persContainerId;
		}
		return `${Component.getOwnerIdFor(oManagedObject)}--${defaultContainerId}`;
	}
	public setPersContainerId(persContainerId: string) {
		this.persContainerId = persContainerId;
	}
	public getOwnerComponent(oManagedObject: ManagedObject) {
		return Component.getOwnerComponentFor(oManagedObject) as UIComponent | undefined;
	}
}

export default new PersonalisationUtils();

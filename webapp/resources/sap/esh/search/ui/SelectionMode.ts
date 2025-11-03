/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
/*
We are currently not supporting list mode "SingleSelect" of sap.m.list/table.
To prevent confusion, use different names/values and internally map to UI list modes of sap.m.list/table.

sel mode -> list mode
None -> None
OneItem -> SingleSelectMaster (select item by press)
MultipleItems -> MultiSelect (select items by checkboxes)

Not supported
n.a. -> SingleSelect (select item by radio button on the right
n.a. -> SingleSelectLeft (select item by radio button on the left
*/

export enum SelectionMode {
    None = "None",
    OneItem = "OneItem",
    MultipleItems = "MultipleItems",
}

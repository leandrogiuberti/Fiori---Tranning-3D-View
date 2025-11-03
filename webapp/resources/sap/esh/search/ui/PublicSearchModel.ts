/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import Context from "sap/ui/model/Context";
import JSONModel from "sap/ui/model/json/JSONModel";
import SearchModel from "./SearchModel";
import { ResultSet, ResultSetItem, ResultSetItemData } from "./ResultSetApi";
import { clonePublic } from "./sinaNexTS/sina/cloneUtil";
import { FormattedResultItem } from "./SearchResultFormatter";

export interface $PublicSearchModelSettings {
    modelName: string;
    internalSearchModel: SearchModel;
}

/**
 * @namespace sap.esh.search.ui
 */

export default class PublicSearchModel extends JSONModel {
    private internalSearchModel: SearchModel;

    public static defaultModelName = "publicSearchModel";
    public static publicSearchModelPropertyPath: Array<{
        sourcePath: string | RegExp;
        targetPath?: string | ((sPath: string) => string);
    }> = [
        // when changing this list, make sure to keep QUnit test in sync: PublicSearchModel.spec.js
        { sourcePath: "/results" },
        {
            sourcePath: /^\/results\/.*\/selected$/, // RegExp: Starts with '/results' and ends with '/selected'
            targetPath: (sPath) => sPath.replace("/results/", "/results/items/"),
        },
        {
            sourcePath: /^\/tableRows\/.*\/selected$/, // RegExp: Starts with '/tableRows' and ends with '/selected'
            targetPath: (sPath) => sPath.replace("/tableRows/", "/results/items/"),
        },
        {
            sourcePath: /^\/results\/.*\/selectionEnabled$/, // RegExp: Starts with '/results' and ends with '/selectionEnabled'
            targetPath: (sPath) => sPath.replace("/results/", "/results/items/"),
        },
        {
            sourcePath: /^\/tableRows\/.*\/selectionEnabled$/, // RegExp: Starts with '/tableRows' and ends with '/selectionEnabled'
            targetPath: (sPath) => sPath.replace("/tableRows/", "/results/items/"),
        },
        {
            sourcePath: /^\/results\/.*\/customItemStyleClass$/, // RegExp: Starts with '/results' and ends with '/customItemStyleClass'
            targetPath: (sPath) => sPath.replace("/results/", "/results/items/"),
        },
        {
            sourcePath: /^\/tableRows\/.*\/customItemStyleClass$/, // RegExp: Starts with '/tableRows' and ends with '/customItemStyleClass'
            targetPath: (sPath) => sPath.replace("/tableRows/", "/results/items/"),
        },
        { sourcePath: "/count" },
        { sourcePath: "/config" },
        { sourcePath: "/singleSelectionSelected" },
        { sourcePath: "/multiSelectionSelected" },
        { sourcePath: "/multiSelectionObjects" },
        { sourcePath: "/resultviewSelectionVisibility" },
        { sourcePath: "/hierarchyNodePaths" },
    ];
    public modelName: string; // name used to bind to controls (see SearchCompositeControl)

    constructor(settings: Partial<$PublicSearchModelSettings>) {
        super();
        this.modelName = settings.modelName;
        this.internalSearchModel = settings.internalSearchModel;
    }

    public setPropertyFromInternalModel(
        internalModel: SearchModel,
        sPath: string,
        oValue: unknown,
        oContext?: Context,
        bAsyncUpdate?: boolean
    ) {
        let propertyValue;
        let absolutePath = sPath;
        if (oContext) {
            absolutePath = `${oContext.getPath()}/${sPath}`;
        }
        if (absolutePath === "/results") {
            const fnDataToBeCloned = (item) => {
                if (item["type"] === "appcontainer") {
                    return item.tiles;
                } else {
                    return item.sinaItem;
                }
            };
            // search results
            let searchResults: ResultSet;
            try {
                searchResults = {
                    items: (oValue as FormattedResultItem[]).map((searchResultItem, index) => {
                        // clone the attributes of 'sinaItem' (unformatted result item)
                        const clonedData = clonePublic(
                            fnDataToBeCloned(searchResultItem)
                        ) as ResultSetItemData;
                        const resultSetItem: ResultSetItem = {
                            key: searchResultItem.key,
                            data: clonedData,
                            title: searchResultItem.title,
                            selected: searchResultItem.selected,
                            setSelected: (select: boolean): void => {
                                internalModel.setProperty(`/results/${index}/selected`, select);
                            },
                            selectionEnabled: searchResultItem.selectionEnabled,
                            setSelectionEnabled: (enable: boolean): void => {
                                internalModel.setProperty(`/results/${index}/selectionEnabled`, enable);
                            },
                            customItemStyleClass: searchResultItem.customItemStyleClass, // css class to be added to result item (table, grid, list)
                            setCustomItemStyleClass: (customItemStyleClass: string): void => {
                                internalModel.setProperty(
                                    `/results/${index}/customItemStyleClass`,
                                    customItemStyleClass
                                );
                            },
                        };
                        return resultSetItem;
                    }),
                };
            } catch (error) {
                throw new Error("Public Model could not be updated. Error: " + error + ")");
            }

            propertyValue = searchResults;
        }
        if (!propertyValue) {
            propertyValue = oValue;
        }
        this.setPropertyInternal(absolutePath, propertyValue, undefined, bAsyncUpdate);
    }

    setPropertyInternal(sPath: string, oValue: unknown, oContext?: Context, bAsyncUpdate?: boolean): boolean {
        let absolutePath = sPath;
        let success;
        if (oContext) {
            absolutePath = `${oContext.getPath()}/${sPath}`;
        }
        const publicProperty = this.isPublicProperty(absolutePath);
        if (publicProperty.length > 0) {
            if (typeof publicProperty[0]?.targetPath !== "undefined") {
                // property shall be renamed for public model
                if (typeof publicProperty[0]?.targetPath === "function") {
                    success = super.setProperty(
                        publicProperty[0]?.targetPath(absolutePath),
                        oValue,
                        undefined,
                        bAsyncUpdate
                    );
                } else {
                    success = super.setProperty(
                        publicProperty[0]?.targetPath,
                        oValue,
                        oContext,
                        bAsyncUpdate
                    );
                }
            } else {
                // default
                success = super.setProperty(sPath, oValue, oContext, bAsyncUpdate);
            }
            // update 'multiSelectionObjects', ... of internal model
            if (absolutePath.startsWith("/results/") && absolutePath.endsWith("/selected")) {
                // console.log("SELECTION: publ model, set 'selected' property (path: '/results/.../selected')");
                this.internalSearchModel.updateMultiSelectionSelected();
            }
        } else {
            // this property is private and shall not be added to public search model
        }
        return success;
    }

    setProperty(sPath: string, oValue: unknown, oContext?: Context, bAsyncUpdate?: boolean): boolean {
        // in general we need to make sure this model is only updated by ELISA SearchModel !!!
        // Changeable properties:
        // - /results/items[...]/selected
        // - /results/items[...]/selectionEnabled
        // - /results/items[...]/customItemStyleClass
        let absolutePath = sPath;
        if (oContext) {
            absolutePath = `${oContext.getPath()}/${sPath}`;
        }

        if (absolutePath.startsWith("/results/items/") && absolutePath.endsWith("/selected")) {
            const successPublicModel = super.setProperty(sPath, oValue, oContext, bAsyncUpdate);
            // selected: Checkbox (item) is set (if visible -> see selection modes)
            const propertyPathSearchModel = `/results/${absolutePath
                .replace("/results/items/", "")
                .replace("/selected", "")}/selected`;
            const successInternalModel = this.internalSearchModel.setPropertyInternal(
                propertyPathSearchModel,
                oValue,
                undefined,
                bAsyncUpdate,
                false
            );
            console.log(
                "SELECTION: publ model, set 'selected' property (path: '/results/items/.../selected')"
            );
            this.internalSearchModel.updateMultiSelectionSelected();
            return successPublicModel && successInternalModel;
        } else if (absolutePath.startsWith("/results/items/") && absolutePath.endsWith("/selectionEnabled")) {
            const successPublicModel = super.setProperty(sPath, oValue, oContext, bAsyncUpdate);
            // selectionEnabled: Checkbox (item) is enabled (if visible -> see selection modes)
            const propertyPathSearchModel = `/results/${absolutePath
                .replace("/results/items/", "")
                .replace("/selectionEnabled", "")}/selectionEnabled`;
            const successInternalModel = this.internalSearchModel.setPropertyInternal(
                propertyPathSearchModel,
                oValue,
                undefined,
                bAsyncUpdate,
                false
            );
            return successPublicModel && successInternalModel;
        } else if (
            absolutePath.startsWith("/results/items/") &&
            absolutePath.endsWith("/customItemStyleClass")
        ) {
            const successPublicModel = super.setProperty(sPath, oValue, oContext, bAsyncUpdate);
            const propertyPathSearchModel = `/results/${absolutePath
                .replace("/results/items/", "")
                .replace("/customItemStyleClass", "")}/customItemStyleClass`;
            const successInternalModel = this.internalSearchModel.setPropertyInternal(
                propertyPathSearchModel,
                oValue,
                undefined,
                bAsyncUpdate,
                false
            );
            return successPublicModel && successInternalModel;
        } else {
            throw new Error(
                `The public search model '${this.modelName}' is read-only but for properties "/results/items/<idx>/selected", "/results/items/<idx>/selectionEnabled" and "/results/items/<idx>/customItemStyleClass". You are changing property '${absolutePath}'.`
            );
        }
    }

    isPublicProperty(sPath): Array<{
        sourcePath: string | RegExp;
        targetPath?: string | ((sPath: string) => string);
    }> {
        const publicProperty = PublicSearchModel.publicSearchModelPropertyPath.filter((prop) => {
            if (prop.sourcePath instanceof RegExp) {
                return sPath.match(prop.sourcePath);
            } else {
                return prop.sourcePath === sPath;
            }
        });
        return publicProperty;
    }
}

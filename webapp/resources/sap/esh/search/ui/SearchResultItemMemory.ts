/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
interface Item {
    expanded?: boolean;
}

export default class SearchResultSetItemMemory {
    items: { [key: string]: Item } = {};

    reset() {
        this.items = {};
    }

    getItem(key: string): Item {
        let item = this.items[key];
        if (!item) {
            item = {};
            this.items[key] = item;
        }
        return item;
    }

    setExpanded(key: string, expanded: boolean) {
        const item = this.getItem(key);
        item.expanded = expanded;
    }

    getExpanded(key: string) {
        return this.getItem(key).expanded;
    }
}

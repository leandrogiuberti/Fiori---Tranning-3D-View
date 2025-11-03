// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([], () => {
    "use strict";

    /**
     * Get the index of the group by group id.
     *
     * @param {object[]} groups Array of all groups
     * @param {string} groupId Id of the given group
     *
     * @returns {int} the index of the group or -1
     */
    function getIndexOfGroup (groups, groupId) {
        for (let i = 0; i < groups.length; i++) {
            if (groups[i].groupId === groupId) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Get the path for the given group in context of the groups model by group id.
     *
     * @param {object[]} groups Array of all groups
     * @param {string} groupId Id of the given group
     *
     * @returns {string} the path to the group like "/groups/0" or null
     */
    function getModelPathOfGroup (groups, groupId) {
        const iGroupIndex = getIndexOfGroup(groups, groupId);
        if (iGroupIndex < 0) {
            return null;
        }
        return `/groups/${iGroupIndex}`;
    }

    return {
        getIndexOfGroup: getIndexOfGroup,
        getModelPathOfGroup: getModelPathOfGroup
    };
});

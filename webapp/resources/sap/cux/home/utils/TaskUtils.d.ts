declare module "sap/cux/home/utils/TaskUtils" {
    import { Priority } from "sap/m/library";
    interface UserInfo {
        Email?: string;
    }
    enum TaskPriority {
        VERY_HIGH = "VERY_HIGH",
        HIGH = "HIGH",
        MEDIUM = "MEDIUM",
        LOW = "LOW"
    }
    const userInfo: Record<string, UserInfo>;
    /**
     * Get the task URL for a given task.
     *
     * @private
     * @param {string} originId - The origin ID of the task.
     * @param {string} instanceId - The instance ID of the task.
     * @returns {string} The task URL.
     */
    function getTaskUrl(originId: string, instanceId: string, targetAppUrl: string): string;
    /**
     * Fetches user details if required.
     *
     * @private
     * @param {string} originId - The origin ID.
     * @param {string} userId - The user ID.
     * @returns {Promise<UserInfo>} - A promise that resolves to the user information.
     */
    function fetchUserDetails(originId: string, userId: string): Promise<UserInfo>;
    /**
     * Fetches user information for a specific user.
     *
     * @private
     * @param {string} originId - The origin ID.
     * @param {string} userId - The user ID.
     * @returns {Promise<UserInfo>} - A promise that resolves to the user information.
     */
    function _fetchUserInfo(originId: string, userId: string): Promise<UserInfo>;
    /**
     * Check whether given dateString is of format YYYYMMDD and is a valid value for Date object.
     *
     * @param {string} dateString - The datestring to be checked for validity
     * @returns {Date} if its a valid date return the date else false
     * @private
     */
    function _isValidDate(dateString: string): boolean;
    /**
     * Parses different time formats supplied from the back-ends. It returns UNIX time stamp in milliseconds.
     * If Time Format contains unexpected symbols or Format is not recognized NaN is returned.
     * Referenced from: cross.fnd.fiori.inbox.CustomAttributeComparator
     *
     * @param {string | number} time date format to be parsed. If int UNIX time stamp in milliseconds is assumed.
     * @returns {number} UNIX time stamp in milliseconds. (milliseconds that have elapsed since 00:00:00 UTC, Thursday, 1 January 1970)
     * @private
     */
    function _getParsedTime(time: string | number): number;
    /**
     * Format a date string to a custom date and time format.
     *
     * @private
     * @param {string} dateStr - The date string to format.
     * @param {string} pattern - The pattern to be used for formatting the date.
     * @returns {string} The formatted date string.
     */
    function formatDate(dateStr: string, pattern?: string): string;
    /**
     * Convert a priority string to a corresponding priority value.
     *
     * @private
     * @param {TaskPriority} priority - The task priority string.
     * @returns {string} The corresponding priority value.
     */
    function getPriority(priority: TaskPriority): Priority;
}
//# sourceMappingURL=TaskUtils.d.ts.map
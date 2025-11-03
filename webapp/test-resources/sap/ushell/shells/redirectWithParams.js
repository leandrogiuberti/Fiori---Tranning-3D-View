// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * This script adds the current URLs parameters to the URL defined in a meta tag (http-equiv="Refresh") in the HTML page.
 * It does not expect URL parameters in the redirect URL and requires a redirect delay > 0 seconds.
 */
(function () {
    "use strict";

    const oMetaElement = document.querySelectorAll("meta[http-equiv='Refresh']");

    const sContentAttribute = oMetaElement.getAttribute("content");
    const regexResult = /; url=(.*)$/.exec(sContentAttribute);

    const sTargetUrl = regexResult[1];

    // It is not expected, that the redirected URL contains parameters.
    const sTargetUrlWithParams = sTargetUrl + window.location.search + window.location.hash;

    const sUpdatedContentAttribute = sContentAttribute.replace(sTargetUrl, sTargetUrlWithParams);

    // update the URL in the content attribute while keeping the delay and potential other parts untouched
    oMetaElement.setAttribute("content", sUpdatedContentAttribute);
})();

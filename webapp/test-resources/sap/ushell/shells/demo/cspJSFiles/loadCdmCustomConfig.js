// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
function getUrlParams () {
    "use strict";
    const vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
        vars[key] = value;
    });
    return vars;
}

const sConfigFileUrl = decodeURIComponent(getUrlParams().configFileUrl);

const oXHR = new XMLHttpRequest();
if (sConfigFileUrl !== "undefined") {
    oXHR.open("GET", sConfigFileUrl, false);
    oXHR.onreadystatechange = function () {
        "use strict";
        if (this.status === 200 && this.readyState === 4) {
            const oConfig = JSON.parse(oXHR.responseText);

            const oNewMetaElement = document.createElement("meta");
            oNewMetaElement.setAttribute("name", oConfig.name);
            oNewMetaElement.content = JSON.stringify(oConfig.content);
            document.head.appendChild(oNewMetaElement);
        }
    };
    oXHR.send();
}

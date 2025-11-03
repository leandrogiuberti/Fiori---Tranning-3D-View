sap.ui.define([
    "sap/ui/core/Lib",
    "./VBITransformer"
], function (Lib, VBITransformer) {
    "use strict";

    class SAPAutomationManager {
        constructor(map, LngLatBounds) {
            this.map = map;
            this.LngLatBounds = LngLatBounds;
        }


        /** Loads automation data from JSON */
        load(data) {
            if (!data?.Call) return;

            const calls = Array.isArray(data.Call) ? data.Call : [data.Call];
            calls.forEach(call => this.addAutomation(call));
        }
        createHandler(callData){
            if (callData.handler === "FLYTOHANDLER") {
                return this.flyToHandler(callData.Param);
                
            } else {
                return false;
            } 
        }
        /** creates handler functions*/
        addAutomation(callData) {
            let automationHandler = this.createHandler(callData);
            if(!automationHandler){
                return ;
            }
            let automation = {
                name: callData.name || "Unnamed",
                handler: callData.handler,
                delay: callData.delay || 1,
                earliest: callData.earliest || 1,
                retryAfterMS: callData.retryAfterMS || 0,
                reattempts: callData.reattempts || -1,
                attempts: 0,
                params: callData.Param,
                start: () => automationHandler.start()
            };
            this.scheduleAutomation(automation);           

        }

        /** Runs automation with delay & retries */
        scheduleAutomation(automation) {
            const now = new Date().getTime();
            const runningTime = now - (this.map.startTime || now);
            let delay = automation.delay;

            if (runningTime < automation.earliest) {
                delay = Math.max(delay, automation.earliest - runningTime);
            }

            setTimeout(() => this.executeAutomation(automation), delay);

        }

        /** Executes automation and handles retries */
        executeAutomation(automation) {
            const success = automation.start();
            if (!success && automation.retryAfterMS) {
                automation.attempts++;
                if (automation.reattempts === -1 || automation.attempts < automation.reattempts) {
                    setTimeout(() => this.executeAutomation(automation), automation.retryAfterMS);
                }
            }
        }
        /**To calculate bounds for zoom to features */
        calculatebounds() {
            let bounds = [];
            let geoJSON = VBI.VBITransformer.getTransformedJSON();
            geoJSON[1].features.forEach((marker) => {
                let markerCoordinates = marker.geometry.coordinates;

                if (marker.geometry.type === 'LineString') {
                    markerCoordinates.forEach((coord) => {
                        if (!bounds.some((b) => b[0] === coord[0] && b[1] === coord[1])) {
                            bounds.push(coord);
                        }
                    });
                } else {
                    if (!bounds.some((b) => b[0] === markerCoordinates[0] && b[1] === markerCoordinates[1])) {
                        bounds.push(markerCoordinates);
                    }
                }
            });
            let zoombounds;
            if (bounds.length > 0) {
                zoombounds = bounds.reduce((zoombounds, coord) => {
                    return zoombounds.extend(coord);
                }, new this.LngLatBounds(bounds[0], bounds[0]));

            }
            return zoombounds;
        }

        /** FLYTOHANDLER*/
        flyToHandler(params) {
            const x = parseFloat(params.find(p => p.name === "x")?.["#"]);
            const y = parseFloat(params.find(p => p.name === "y")?.["#"]);
            const zoom = parseFloat(params.find(p => p.name === "lod")?.["#"]) || 12;
            const speed = parseFloat(params.find(p => p.name === "velocity")?.["#"]) || 1;
            const zoomToAll = params.find(p => p.name === "zoomToAll")?.["#"] || false;

            if (zoomToAll) {
                let zoombounds = this.calculatebounds();
                //Focus the map into the features
                if (zoombounds) {
                    map.fitBounds(zoombounds, {
                        padding: 150
                    });
                }
                return true;
            } else if (x !== undefined && y !== undefined) {
                this.map.flyTo({
                    center: [x, y],
                    zoom: zoom,
                    speed: speed,
                    essential: true
                });
                return true;
            }
            return false;
        }
    }
    return SAPAutomationManager
});


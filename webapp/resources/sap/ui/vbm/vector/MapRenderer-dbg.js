
sap.ui.define([
	"../lib/sapvbi",
	"../lib/sapvobase",
	"../lib/sapactions",
	"../VBIRenderer",
	"./VectorUtils",
	"./thirdparty/MaplibreStyles",
	"./PayloadGenerator",
	"./RectangularSelection",
	"./LassoSelection",
	"./SAPNavControl",
	"./SAPAutomationManager",
	"sap/ui/core/Lib",
	//"../lib/sapscene",
	"./thirdparty/maplibregl",
	"./VBITransformer"
], function (vb, visualobjects, actions, VBIRenderer, VectorUtils, MaplibreStyles, PayloadGenerator, RectangularSelection, LassoSelection, SAPMapNavControl, SAPAutomationManager, Lib) {
	'use strict';
	visualobjects = {};
	VBI.MapRenderer = {};
	actions = {};
	var map_container = "";
	//let isDragging = false;
	//let startY;
	//let startYpx;
	// let isDrawing = false;
	// let isCtrlPressed = false;
	// let lassoPoints = [];
	let predefinedMarkers = [];
	let allMarkers = [];
	let lineDrag = false;
	let validDrop = false;
	let dragItems = {};
	let dropItems = {};
	let dragInstance = {};
	VBI.MapRenderer.name = undefined;
	let spotid = 0;
	let fixedBounds;
	var containerID;
	let previousCenter = null;
	let previousZoom = null;



	VBI.MapRenderer.setAdapter = (adapter) => {
		this._adapter = adapter;
		this._payloadGenerator = new PayloadGenerator(this._adapter);
	}

	// Process the GeoJSON spots and its properties
	VBI.MapRenderer._processGeoSpot = (source, data) => {

	}

	// Process the GeoJSON routes/links and its properties
	VBI.MapRenderer._processGeoRoutes = (source, data) => {

	}

	VBI.MapRenderer.renderMap = () => {

		if (this.map) {
			previousCenter = this.map.getCenter();
			previousZoom = this.map.getZoom();
			this.map.remove();
		}

		let geoJSON = VBI.VBITransformer.getTransformedJSON();

		map_container = VBIRenderer.getId();

		var styleSheet = document.createElement("style");

		styleSheet.textContent = MaplibreStyles.loadStyles();
		document.head.appendChild(styleSheet);

		const map = VectorUtils.createMap(geoJSON, map_container);
		map.doubleClickZoom.disable();

		if (previousCenter && previousZoom !== null) {
			map.jumpTo({
				center: [previousCenter.lng, previousCenter.lat],
				zoom: previousZoom

			});
		}

		const canvas = map.getCanvasContainer();
		const rectangularSelection = new RectangularSelection(map);
		const lassoSelection = new LassoSelection(map);
		const mapCanvas = map.getCanvas();
		const popupLink = new maplibregl.Popup({
			closeButton: false,
			closeOnClick: false
		});
		mapCanvas.id = VectorUtils._setcanvasid();
		// Set `true` to dispatch the event before other functions
		// call it. This is necessary for disabling the default map
		// dragging behaviour.
		canvas.addEventListener('mousedown', (e) => rectangularSelection.mouseDown(e, this.Rpressed), true);
		canvas.addEventListener('mousedown', (e) => lassoSelection.mouseDown(e, this.Apressed), true);
		map.touchZoomRotate.enable();
		this.map = map;
		map.on('load', () => {

			map.getCanvas().style.cursor = 'default';
			map.on('mouseup', function () {
				map.getCanvas().style.cursor = 'default';
			});
			map.getCanvas().addEventListener('mousemove', function () {
				map.getCanvas().style.cursor = 'default';
			});

			if (VBI.mapFlags.isLegendExists) {
				// Legend control
				VBI.VBITransformer._createLegend(map_container);
			}
			// Custom attribution/copyright control
			map.addControl(new maplibregl.AttributionControl({
				customAttribution: '<span>' + geoJSON[0].copyright + '</span>',
				compact: false
			})
			);
			//validate scale visiblity 
			var scaleControl = new maplibregl.ScaleControl({
				maxWidth: 80,
				unit: geoJSON[0].scaleType
			})
			if (VBI.mapFlags.scaleVisible) {
				// Scale control in mi,km or nm
				map.addControl(scaleControl);
			} else if (!VBI.mapFlags.scaleVisible && map.hasControl(scaleControl)) {
				map.removeControl(scaleControl);
			}

			// Parsing GeoJSON for each type of object
			map.addSource('geojson-source', {
				'type': 'geojson',
				'data': geoJSON[1]
			});

			let sapNavControl = new SAPMapNavControl(VBI.mapFlags.moveDisable, VBI.mapFlags.zoomDisable);
			if (VBI.mapFlags.navControlVisible) {
				map.addControl(sapNavControl, 'top-left');
			} else if (!VBI.mapFlags.navControlVisible && map.hasControl(sapNavControl)) {
				map.removeControl(sapNavControl);
			}

			//	map.addControl(new SAPMAPLgndControl(), 'top-right');
			// Create a popup, but don't add it to the map yet.
			const popup = new maplibregl.Popup({
				closeButton: false,
				closeOnClick: false,
				offset: {
					'top': [0, 0],
					'bottom': [0, -25]
				}
			});
			// add markers to map only for Points
			const pointFeatures = [];
			geoJSON[1].features.forEach((marker) => {
				let markerCoordinates = marker.geometry.coordinates;
				if (marker.geometry.type === 'Point') {
					// create a DOM element for the marker (parent div)
					let createdSpot = VectorUtils.createSpotElement(marker, spotid);
					const el = createdSpot.spotEl;
					spotid = createdSpot.spotId;
					if (marker.properties.Label) {
						const child_e1 = VectorUtils.createMarkerLabel(marker.properties.Label, marker.properties.LabelBGColor);
						el.appendChild(child_e1);
					}
					if (marker.properties.Icon) {
						const iconColor = marker.properties.contentColor ? marker.properties.contentColor : "#000000";
						// Create child element for the SAP icon (icon overlay)
						const child_el = VectorUtils.createIconElement(marker.properties.Icon, iconColor);
						child_el.id = '__mapspot' + spotid++;
						// Append the icon inside the marker
						el.appendChild(child_el);
					}
					//  add marker to map
					let spot = new maplibregl.Marker({
						element: el,
						draggable: true,
						anchor: 'bottom'
					}).setLngLat(marker.geometry.coordinates)
						.on('dragend', onDragEnd)
						.addTo(map);
					let originalpos = spot.getLngLat();
					spot.customProperties = { Key: marker.properties.Key };
					allMarkers.push(spot);
					function calculateBBox(featureCollection) {
						let minLon = Infinity, minLat = Infinity;
						let maxLon = -Infinity, maxLat = -Infinity;
						featureCollection.features.forEach(feature => {
							const featureCoordsStr = feature.properties.GeoPosition;
							const featureCoords = featureCoordsStr.split(";").slice(0, 2).map(Number);
							const lon = featureCoords[0];
							const lat = featureCoords[1];
							if (lon < minLon) minLon = lon;
							if (lon > maxLon) maxLon = lon;
							if (lat < minLat) minLat = lat;
							if (lat > maxLat) maxLat = lat;
						});
						return { minLon, minLat, maxLon, maxLat };
					}
					function isSpotInsideBBox(pos, bbox, tolerance = 0.05) {
						const [lon, lat] = [parseFloat(pos.lng), parseFloat(pos.lat)];
						return (
							lon >= bbox.minLon - tolerance &&
							lon <= bbox.maxLon + tolerance &&
							lat >= bbox.minLat - tolerance &&
							lat <= bbox.maxLat + tolerance
						);
					}
					function findDropSpots(pos, featureCollection, tolerance = 0.05) {
						let bbox = calculateBBox(featureCollection);

						if (!isSpotInsideBBox(pos, bbox, tolerance = 0.05)) {
							return null;
						}

						let dropSpots = featureCollection.features.filter(feature => {
							const featureCoordsStr = feature.properties.GeoPosition;
							const featureCoords = featureCoordsStr.split(";").slice(0, 2).map(Number);
							return isSpotInsideBBox({ lng: featureCoords[0], lat: featureCoords[1] }, bbox);
						});
						return dropSpots.length > 0 ? dropSpots : null;
					}
					VBI.MapRenderer.findNearestSpot = (pos, features1) => {
						let dropInstance = null;
						let minDistance = 100000;
						if (!Array.isArray(pos)) {
							pos = [parseFloat(pos.lng), parseFloat(pos.lat)];
						}

						features1.forEach(feature => {

							const featureCoordsStr = feature.properties.GeoPosition;
							const featureCoords = featureCoordsStr.split(";").slice(0, 2).map(Number);

							let distance = VBI.MapRenderer.haversineDistance(pos, featureCoords);

							// Check if this is the nearest spot
							if (distance < minDistance) {
								minDistance = distance;
								dropInstance = feature;
							}
						});
						return dropInstance;
					}
					VBI.MapRenderer.haversineDistance = (pos, featureCoords) => {
						const R = 6371000;
						const lat1 = pos[0]
						const lon1 = pos[1]
						const lat2 = featureCoords[0]
						const lon2 = featureCoords[1];
						const dLat = VBI.MapRenderer.toRad(lat2 - lat1);
						const dLon = VBI.MapRenderer.toRad(lon2 - lon1);
						const a =
							Math.sin(dLat / 2) * Math.sin(dLat / 2) +
							Math.cos(VBI.MapRenderer.toRad(lat1)) * Math.cos(VBI.MapRenderer.toRad(lat2)) *
							Math.sin(dLon / 2) * Math.sin(dLon / 2);
						const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
						return R * c;
					}
					// Helper function to convert degrees to radians
					VBI.MapRenderer.toRad = (value) => {
						return value * Math.PI / 180;
					}
					function onDragEnd(e) {
						map.getCanvas().style.cursor = 'default';
						let dragItems = [];
						let dropItems = [];
						const key = e.target.customProperties;
						const pos = e.target._lngLat;
						try {
							// Query all features from the layer "geojson-source-point"
							const features1 = map.queryRenderedFeatures({
								layers: ['geojson-source-point']
							});

							features1.forEach((feature, index) => {
								if (feature.properties && typeof feature.properties.Key !== 'undefined') {
									console.log(`Feature ${index} key:`, feature.properties.Key);
								} else {
									console.log(`Feature ${index} without key:`, feature);
								}
							});
							const dragInstance = features1.find(feature => {
								if (feature.properties) {
									console.log('Checking feature:', feature.properties.Key);
									return String(feature.properties.Key) === String(key.Key);
								}
								return false;
							});
							console.log('dragInstance:', dragInstance);

							if (VBI.VBITransformer && Array.isArray(VBI.VBITransformer.VisualObjs)) {
								const matchingVO = VBI.VBITransformer.VisualObjs.find(
									VO => VO.type === dragInstance.properties.type
								);

								if (matchingVO && matchingVO.DragSource && matchingVO.DragSource.DragItem) {
									if (Array.isArray(matchingVO.DragSource.DragItem)) {
										dragItems = matchingVO.DragSource.DragItem.map(item => item.type);
									} else {
										dragItems = [matchingVO.DragSource.DragItem.type];
									}
								} else {
									dragItems = [];
								}
							} else {
								console.error("VBITransformer.VisualObjs is undefined or not an array.");
							}

							console.log("Extracted dragItems:", dragItems);

							var dropInstance = VBI.MapRenderer.findNearestSpot(pos, features1);
							console.log('Nearest Spot:', dropInstance);
							// Haversine formula to calculate the distance between two coordinates in meters
							if (!dropInstance) {
								var features2 = map.queryRenderedFeatures(pos, {
									layers: ['geojson-source-route']
								});
								dropInstance = VBI.MapRenderer.findNearestSpot(pos, features2);
							}
							const featureCollection = {
								type: "FeatureCollection",
								features: [dragInstance, dropInstance]
							};
							const dropSpots = featureCollection.features;

							if (VBI.VBITransformer && Array.isArray(VBI.VBITransformer.VisualObjs)) {
								const matchingVO = VBI.VBITransformer.VisualObjs.find(
									VO => VO.type === dropInstance.properties.type
								);

								if (matchingVO && matchingVO.DropTarget && matchingVO.DropTarget.DropItem) {
									if (Array.isArray(matchingVO.DropTarget.DropItem)) {
										dropItems = matchingVO.DropTarget.DropItem.map(item => item.type);
									} else {

										dropItems = [matchingVO.DropTarget.DropItem.type];
									}
								} else {
									dropItems = [];
								}
							} else {
								console.error("VBITransformer.VisualObjs is undefined or not an array.");
							}

							console.log("Extracted dropItems:", dropItems);
							const validDrop = Array.isArray(dragItems) && dragItems.some(item => dropItems.includes(item));
							console.log("dragItems:", dragItems);
							console.log("dropItems:", dropItems);
							console.log("validDrop:", validDrop);
							if (validDrop) {
								map.getCanvas().style.cursor = 'copy';
							} else {
								// If not over a valid feature, show the "not-allowed" cursor
								map.getCanvas().style.cursor = 'not-allowed';
							}

							if (validDrop) {
								var dragInsId = VBI.VBITransformer.findObject(dragInstance.properties.type);
								var dropInsId = VBI.VBITransformer.findObject(dropInstance.properties.type);

								PayloadGenerator.triggerPayloaddnd(dragInsId, dropInsId, dragInstance, dropInstance, containerID);
							}
						} catch (error) {
							console.error('Error in onDragEnd:', error);
						}
						// Reset the dragged spot position if needed
						const lngLat = spot.getLngLat();
						if (lngLat.lng !== 0 && lngLat.lat !== 0) {
							spot.setLngLat(originalpos);
						}
						map.getCanvas().style.cursor = 'default';
					}

					// Function to return a promise that resolves when the map is clicked
					function getClickCoordinates() {
						return new Promise((resolve) => {
							map.once('click', function (e) {
								resolve(e.lngLat); // Resolve with the clicked coordinates
							});
						});
					};

					el.addEventListener('mouseenter', () => {
						//Check if a line is dragged here
						if (lineDrag) {
							validDrop = true;
							if (!that.Apressed && !that.Rpressed) {
								el.style.cursor = 'copy';
							}
						} else {
							// Change the cursor style as a UI indicator
							if (!that.Apressed && !that.Rpressed) {
								el.style.cursor = 'pointer';
							}
							if (that.Apressed || that.Rpressed) {
								el.style.cursor = 'crosshair';
							} else {
								function renderTooltip(marker, popup, map) {
									if (!document.getElementById('custom-maplibre-tooltip-style')) {
										const style = document.createElement('style');
										style.id = 'custom-maplibre-tooltip-style';
										style.innerHTML = `
                                            .maplibregl-popup {
                                                background: transparent !important;
                                                box-shadow: none !important;
                                                padding: 0 !important;
                                                width: auto;
                                            }
                                            .maplibregl-popup-content {
                                                background: transparent !important;
                                                padding: 0 !important;
                                                box-shadow: none !important;
                                                border-radius: 0 !important;
                                                width: auto;
                                            }
                                        `;
										document.head.appendChild(style);
									}

									const isDarkTheme = window.matchMedia &&
										window.matchMedia('(prefers-color-scheme: dark)').matches;

									const outerBorderColor = 'none';
									const innerBgColor = isDarkTheme ? '#545555' : '#f0f0f0';
									const textColor = isDarkTheme ? 'white' : 'f0f0f0';

									const tooltipContent = marker.properties.ToolTip.replace(/\n/g, '<br>');

								const tooltip = `

								<div style="
							      background-color: ${innerBgColor};
								  color: ${textColor};
                                  padding: 8px;
                                  border-radius: 6px;
                                  max-height: 180px;
                                  display: inline-block;
                                  font-family: Arial;
                                  font-size: 0.875rem;
                                  width: auto;
                                  white-space: nowrap;
                                  border: 2px solid ${outerBorderColor};
                                  ">
                                  ${tooltipContent}
                                  </div>`;

									popup.setLngLat(marker.geometry.coordinates)
										.setHTML(tooltip)
										.addTo(map);
								}

								// 2. Initial render
								renderTooltip(marker, popup, map);

								// 3. Re-render tooltip on system theme change
								window.matchMedia('(prefers-color-scheme: dark)')
									.addEventListener('change', () => {
										popup.remove();
										renderTooltip(marker, popup, map);
									});
							}
						}

					});
					async function triggerPayloadSpot(e, event) {
						let clickCoordinates = null;
						if (event === 'DETAIL_REQUEST') {
							// First, wait for the map click and get the coordinates
							clickCoordinates = await getClickCoordinates();
						} else {
							clickCoordinates = { lng: marker.geometry.coordinates[0], lat: marker.geometry.coordinates[1] };
						}
						const xyobj = VectorUtils.GetEventVPCoordsObj(e, map_container);
						marker.properties.x = xyobj.x;
						marker.properties.y = xyobj.y;
						PayloadGenerator.objectClick('Spot', event, marker, clickCoordinates);
					};

                    el.addEventListener('dblclick', (e) => {
						triggerPayloadSpot(e, 'DOUBLE_CLICK');
					});
					
					el.addEventListener('click', (e) => {
						//Trigger payload
						triggerPayloadSpot(e, 'DETAIL_REQUEST');
					});

					el.oncontextmenu = (e) => {
						//Trigger payload
						triggerPayloadSpot(e, 'CONTEXT_MENU_REQUEST');
					};
					el.addEventListener('mouseleave', () => {
						if (!that.Apressed && !that.Rpressed) {
							map.getCanvas().style.cursor = '';
						}
						popup.remove();
						validDrop = false;
					});

					// Check if the coordinates already exist in predefinedMarkers
					let exists = predefinedMarkers.some(
						(coords) => coords[0] === markerCoordinates[0] && coords[1] === markerCoordinates[1]
					);

					// If it doesn't exist, push the new coordinates
					if (!exists) {
						predefinedMarkers.push(markerCoordinates);
					}
				} else if (marker.geometry.type == "LineString") {

					if (marker.properties.Label) {
						const midpoint = getMidpoint(marker.geometry.coordinates);
				
						const routeLabelEl = VectorUtils.createRouteLabel(
							marker.properties.Label,
							marker.properties.LabelBGColor
						);
				
						new maplibregl.Marker({
							element: routeLabelEl,
							anchor: 'left',   
						})
						.setLngLat(midpoint)
						.addTo(map);
					}
					const coords = marker.geometry.coordinates;
					const startCoord = coords[0];  // First coordinate
					const endCoord = coords[coords.length - 1];  // Last coordinate

					// Calculate angle between the two points
					const angle = VectorUtils.calculateBearing(startCoord, endCoord);

					// Determine the arrow rotations
					const normalizedStartRotation = VectorUtils.normalizeAngle(90 + angle);  // Adjust for start arrow
					const normalizedEndRotation = angle > 90 ? VectorUtils.normalizeAngle(270 + angle) : VectorUtils.normalizeAngle(90 - angle);  // Adjust for end arrow

					if (coords.length > 1) {
						// Create start point
						const startPoint = {
							'type': 'Feature',
							'geometry': {
								'type': 'Point',
								'coordinates': coords[0]  // First coordinate
							},
							'properties': {
								'Color': marker.properties.Color,
								'BorderColor': marker.properties.BorderColor,
								'arrowRotation': normalizedStartRotation,
								'size': 0.07 * parseFloat(marker.properties.LineWidth),
								'borderSize': 0.07 * (parseFloat(marker.properties.LineWidth) + 1)
							}
						};

						// Create end point
						const endPoint = {
							'type': 'Feature',
							'geometry': {
								'type': 'Point',
								'coordinates': coords[coords.length - 1]  // Last coordinate
							},
							'properties': {
								'Color': marker.properties.Color,
								'BorderColor': marker.properties.BorderColor,
								'arrowRotation': normalizedEndRotation,
								'size': 0.07 * parseFloat(marker.properties.LineWidth),
								'borderSize': 0.07 * (parseFloat(marker.properties.LineWidth) + 1)
							}
						};

						// Add the points only if the arrow is supposed to be shown
						if (marker.properties.StartStyle === '1') {
							pointFeatures.push(startPoint);
						}
						if (marker.properties.EndStyle === '1') {
							pointFeatures.push(endPoint);
						}
					}
				}

			});
			if (VBI.mapFlags.automations) {
				let automations = new SAPAutomationManager(map, maplibregl.LngLatBounds);
				automations.load(VBI.mapFlags.automations);
			}
			map.addLayer({
				'id': 'geojson-source-point',
				'type': 'circle',
				'source': 'geojson-source',
				'paint': {
					'circle-opacity': 0 // Hide points by making them fully transparent
				},
				'filter': ['==', '$type', 'Point']
			});

			// First layer for the border (wider line)
			map.addLayer({
				'id': 'geojson-source-route-border',
				'type': 'line',
				'source': 'geojson-source',
				'layout': {
					'line-join': 'round',
					'line-cap': 'butt'
				},
				'paint': {
					'line-color': ['get', 'BorderColor'],
					'line-width': ['get', 'BorderWidth']  // Slightly wider for border effect
				},
				'filter': ['==', '$type', 'LineString']
			});
			map.addLayer({
				'id': 'geojson-source-route',
				'type': 'line',
				'source': 'geojson-source',
				'layout': {
					'line-join': 'round',
					'line-cap': 'butt'
				},
				'paint': {
					'line-color': ['get', 'Color'],
					'line-width': ['get', 'LineWidth']
				},
				'filter': ['==', '$type', 'LineString']
			});
			
			function getMidpoint(coords) {
				if (coords.length < 2) return coords[0]; 
				
				const start = coords[0];
				const end = coords[coords.length - 1];
				const midLng = (start[0] + end[0]) / 2;
				const midLat = (start[1] + end[1]) / 2;
				
				return [midLng, midLat];
			}

			// Create a new FeatureCollection for the points
			const pointGeoJSON = {
				'type': 'FeatureCollection',
				'features': pointFeatures
			};

			// Add the GeoJSON source for the points to the map
			map.addSource('line-end-points', {
				'type': 'geojson',
				'data': pointGeoJSON
			});

			VectorUtils.getArrowHead((image) => {
				map.addImage('arrow-icon', image, { sdf: true });
				// Add a layer to display the arrows borders at the start/end points
				map.addLayer({
					'id': 'route-end-arrows-border',
					'type': 'symbol',
					'source': 'line-end-points',
					'layout': {
						'icon-image': 'arrow-icon',  // base64 arrow icon
						'icon-size': ['get', 'borderSize'],
						'icon-allow-overlap': true,
						'icon-rotation-alignment': 'map',
						'icon-rotate': ['get', 'arrowRotation']  // Rotate based on calculated angle
					},
					'paint': {
						'icon-color': ['get', 'BorderColor']  // Match the arrow color with the line color
					}
				});

				// Add a layer to display the arrows at the start/end points
				map.addLayer({
					'id': 'route-end-arrows',
					'type': 'symbol',
					'source': 'line-end-points',
					'layout': {
						'icon-image': 'arrow-icon',  // Use your base64 arrow icon
						'icon-size': ['get', 'size'],
						'icon-allow-overlap': true,
						'icon-rotation-alignment': 'map',
						'icon-rotate': ['get', 'arrowRotation']  // Rotate based on calculated angle
					},
					'paint': {
						'icon-color': ['get', 'Color']  // Match the arrow color with the line color
					}
				});
			});
		});

		// Change mouse cursor when hovering over the line
		map.on('mouseenter', 'geojson-source-route', function (event) {
			if (!that.Apressed && !that.Rpressed) {
				map.getCanvas().style.cursor = 'pointer';
			}
				if (!document.getElementById('custom-maplibre-tooltip-style')) {
				const style = document.createElement('style');
				style.id = 'custom-maplibre-tooltip-style';
				style.innerHTML = `
                                            .maplibregl-popup {
                                                background: transparent !important;
                                                box-shadow: none !important;
                                                padding: 0 !important;
                                                width: auto;
                                            }
                                            .maplibregl-popup-content {
                                                background: transparent !important;
                                                padding: 0 !important;
                                                box-shadow: none !important;
                                                border-radius: 0 !important;
                                                width: auto;
                                            } `;
				document.head.appendChild(style);
			}

			const isDarkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
			
			const outerBorderColor = 'none';
			const innerBgColor = isDarkTheme ? '#545555' : '#f0f0f0';
			const textColor = isDarkTheme ? 'white' : 'f0f0f0';

			const coordinates = event.lngLat;
			const description = event.features[0].properties.ToolTip || "";

			const tooltipContent = description.replace(/\n/g, '<br>');

			const tooltip = ` <div style="
			                      background-color: ${innerBgColor};
                                  color: ${textColor};
                                  padding: 8px;
                                  border-radius: 6px;
                                  max-height: 180px;
                                  display: inline-block;
                                  font-family: Arial;
                                  font-size: 0.875rem;
                                  width: auto;
                                  white-space: nowrap;
                                  border: 2px solid ${outerBorderColor};
                                  ">
                                  ${tooltipContent}
                                  </div> `;

			popupLink.setLngLat(coordinates).setHTML(tooltip).addTo(map);

		});

		// Revert mouse cursor back when not hovering
		map.on('mouseleave', 'geojson-source-route', function () {
			if (!that.Apressed && !that.Rpressed) {
				map.getCanvas().style.cursor = '';
			}
			popupLink.remove();
		});
		
		map.on('click', 'geojson-source-route', function (e) {
			//Trigger payload
			triggerPayloadRoute(e, 'DETAIL_REQUEST');
		});

		function triggerPayloadRoute(e, event) {
			// Get the mouse coordinates within the map container
			const offsetX = e.offsetX;
			const offsetY = e.offsetY;
			const lngLat = map.unproject([offsetX, offsetY]);
			const coordinates = lngLat;
			// Get the GeoJSON properties of the clicked line feature
			const xyobj = VectorUtils.GetEventVPCoordsObj(e, map_container);
			var route = e.features[0];
			route.properties.x = xyobj.x;
			route.properties.y = xyobj.y;

			PayloadGenerator.objectClick('Link', event, route, coordinates);
		}
		function triggerPayloaddnd() {
			PayloadGenerator.objectDrop(action, dropItems);
		}

		map.on('mousedown', 'geojson-source-route', (e) => {
			dragInstance = map.queryRenderedFeatures(e.point, {
				layers: ['geojson-source-route']
			});

			if (dragInstance.length > 0) {
				const feature = dragInstance[0];
				const visualObjs = VBI.VBITransformer.VisualObjs;
				const matchingVO = visualObjs.find(VO => VO.type === feature.properties.type);

				if (matchingVO && matchingVO.DragSource && matchingVO.DragSource.DragItem) {
					dragItems = Array.isArray(matchingVO.DragSource.DragItem)
						? matchingVO.DragSource.DragItem.map(item => item.type)
						: [matchingVO.DragSource.DragItem.type];
				} else {
					dragItems = [];
				}

				console.log("Extracted Drag Items:", dragItems);
			}

			if (e.originalEvent.button === 0) {
				e.preventDefault();
				lineDrag = true;
				validDrop = false;

				map.getCanvas().style.cursor = 'default';
				map.on('mousemove', onMove);
				map.on('mouseup', onUp);


				if (!that.Apressed && !that.Rpressed) {
					map.getCanvas().style.cursor = 'pointer';
				}
				if (that.Apressed || that.Rpressed) {
					map.getCanvas().style.cursor = 'crosshair';
				}
			}
		});

		function onUp(e) {
			let dropInstance = null;
			var dropRoute = map.queryRenderedFeatures(e.point, {
				layers: ['geojson-source-route']
			});

			if (dropRoute.length > 0) {
				dropInstance = dropRoute[0];
			}
			if (!dropInstance && map.getLayer('geojson-source-point')) {
				var features1 = map.queryRenderedFeatures({ layers: ['geojson-source-point'] });
				var pos = e.lngLat;
				dropInstance = VBI.MapRenderer.findNearestSpot(pos, features1);
			}

			if (dropInstance) {
				if (e.originalEvent.button === 0) {
					const visualObjs = VBI.VBITransformer.VisualObjs;
					const matchingVO = visualObjs.find(VO => VO.type === dropInstance.properties.type);

					if (matchingVO && matchingVO.DropTarget && matchingVO.DropTarget.DropItem) {
						dropItems = Array.isArray(matchingVO.DropTarget.DropItem)
							? matchingVO.DropTarget.DropItem.map(item => item.type)
							: [matchingVO.DropTarget.DropItem.type];
					} else {
						dropItems = [];
					}

					console.log("Extracted Drop Items:", dropItems);

					validDrop = dragItems.some(item => dropItems.includes(item));

					if (validDrop) {
						// Trigger payload for valid drop
						var dragInsId = VBI.VBITransformer.findObject(dragInstance[0].properties.type);
						var dropInsId = VBI.VBITransformer.findObject(dropInstance.properties.type);
						PayloadGenerator.triggerPayloaddnd(dragInsId, dropInsId, dragInstance[0], dropInstance, map_container);
						console.log('Dropped on valid target');
					} else {
						console.log('Invalid drop');
					}
				}
			}

			// Reset cursor and remove event listeners
			map.getCanvas().style.cursor = 'default';
			setTimeout(() => {
				map.getCanvas().style.cursor = 'default';
			}, 100);
			map.off('mousemove', onMove);
			map.off('mouseup', onUp);
			lineDrag = false;
			validDrop = false;
		}

		function onMove(e) {
			const features = map.queryRenderedFeatures(e.point, {
				layers: ['geojson-source-route']
			});

			if (features.length > 0) {
				map.getCanvas().style.cursor = 'not-allowed';

				if (!that.Apressed && !that.Rpressed) {
					if (dragItems) {
						dropItems = VBI.VBITransformer.getddvalues(features[0], "DropTarget");
					}

					if (dragItems && dropItems) {
						validDrop = VectorUtils.isAccepted(dragItems, dropItems);
					}

					map.getCanvas().style.cursor = validDrop ? 'copy' : 'not-allowed';
				}
				else {

					map.getCanvas().style.cursor = 'default';
				}
			}
		}

		mapCanvas.oncontextmenu = (e) => {
			e.preventDefault();
			// Get the mouse coordinates within the map container
			const rect = canvas.getBoundingClientRect(); // Get map container position
			const x = e.clientX - rect.left;  // Relative to map
			const y = e.clientY - rect.top;
			const lngLat = map.unproject([x, y]);
			// Check if the right-click happened on the 'geojson-source-route' layer
			const features = map.queryRenderedFeatures([x, y], { layers: ['geojson-source-route'] });

			if (features.length > 0) {
				e.features = features;
				// The context menu is for the 'geojson-source-route' layer
				triggerPayloadRoute(e, 'CONTEXT_MENU_REQUEST');
			} else {
				// Get the mouse coordinates within the map container
				const offsetX = e.offsetX;
				const offsetY = e.offsetY;
				const lngLat = map.unproject([offsetX, offsetY]);
				// The context menu is for the map
				const coords = lngLat.lng + ";" + lngLat.lat + ";0.0";
				const currentZoom = map.getZoom();
				const center = map.getCenter();
				const currentCenter = center.lng + ";" + center.lat;
				const xyobj = VectorUtils.GetEventVPCoordsObj(e, map_container);
				const screenX = xyobj.x;
				const screenY = xyobj.y;
				PayloadGenerator.onMapContextMenu(coords, currentZoom, currentCenter, screenX, screenY);
			}
		};
		
		var that = this;
		map.on('idle', () => {
			const container = map.getContainer();
			containerID = container.id;
			console.log("Map container ID:", containerID);

			container.addEventListener('keydown', function (event) {
				switch (event.keyCode) {
					case 72:     // Reset map to initial view when 'h' is pressed
						map.setCenter([0, 0]);
						map.setZoom(2);
						map.getCanvas().style.cursor = '';
						break;
					case 82:
						if (!that.Rpressed) {
							// Disable default box zooming.
							that.Rpressed = true;
							that.Apressed = false;
							map.boxZoom.disable();
							map.getCanvas().style.cursor = 'crosshair';
						} else {
							// Enable default box zooming.
							that.Rpressed = false;
							map.boxZoom.enable();
							map.getCanvas().style.cursor = '';
						}
						break;
					case 65:
						if (!that.Apressed) {
							// Disable default box zooming.
							that.Apressed = true;
							that.Rpressed = false;
							map.boxZoom.disable();
							map.getCanvas().style.cursor = 'crosshair';
						} else {
							// Enable default box zooming.
							that.Apressed = false;
							map.boxZoom.enable();
							map.getCanvas().style.cursor = '';
						}
						break;
					default:
						break;
				}
				//Always trigger
				PayloadGenerator.KeyboardHandler(event, VBI.MapRenderer.name);
			});
		})

	}
	VBI.MapRenderer.actionName = (obj) => {
		const actions = Array.isArray(obj?.SAPVB?.Actions?.Set?.Action)
			? obj.SAPVB.Actions.Set.Action
			: [obj?.SAPVB?.Actions?.Set?.Action].filter(Boolean);

		const action = actions.find(act => act.refEvent === "KeyPress");
		VBI.MapRenderer.name = action?.name ?? undefined;
	};

	VBI.MapRenderer.createPopup = (htmlContent, posArray) => {
		let lngLat;
		switch (posArray[0]) {
			case "Spots":
				// Find the spot with the specified key
				const foundSpot = allMarkers.find(spot => spot.customProperties.Key === posArray[1]);
				lngLat = foundSpot?.getLngLat();
				break;
			default:
		}

		// VBI.MapRenderer.createPopup = (htmlContent, posArray) => {
		// 	let lngLat;
		// 	switch (posArray[0]) {
		// 		case "Spots":
		// 			const intervalId = setInterval(() => {
		// 				const foundSpot = allMarkers.find(spot => spot.customProperties.Key === posArray[1]);
		// 				if (foundSpot) {
		// 					clearInterval(intervalId);
		// 					const lngLat = foundSpot.getLngLat();
		// 					// Create the popup using lngLat and htmlContent.
		// 					// For example, if using Mapbox GL:
		// 					// new mapboxgl.Popup().setLngLat(lngLat).setHTML(htmlContent).addTo(map);
		// 					console.log("Popup created at", lngLat);
		// 				} else {
		// 					console.log("Waiting for marker with key:", posArray[1]);
		// 				}
		// 			}, 100); // Check every 100ms until the marker is found
		// 			break;
		// 		default:
		// 			// Handle other cases if needed.
		// 	}
		if (this.popup) {
			//Remove existing popups
			this.popup.remove();
		}
		// Create a Mapbox popup using the constructed HTML DOM
		this.popup = new maplibregl.Popup({
			closeButton: false,
			offset: [19, 15]
		}).setLngLat(lngLat)
			.setDOMContent(htmlContent)
			.addTo(this.map);
	}

	VBI.MapRenderer.closePopup = () => {
		this.popup?.remove();
	}
	VBI.MapRenderer.setRefMapLayerStack = (style, header) => {
		this.map.setStyle(style);
		// Add the headers only for the specific types of requests
		if (Object.keys(header).length != 0) {
			// Use transformRequest to modify requests for specific maps
			this.map.transformRequest = (url, resourceType) => {
				return {
					url: url,
					headers: header // Add the header
				};
			}
		}
	}

	VBI.MapRenderer.createMenu = (Menu, data) => {
		var contextMenuHandler = {};
		contextMenuHandler.cnt = 0;
		const xyparam = data.Params?.Param ? data.Params.Param : data.Param;
		for (var i = 0; i < xyparam.length; ++i) {
			if (xyparam[i].name === "x") {
				contextMenuHandler.m_x = parseInt(xyparam[i]["#"], 10);
			}
			if (xyparam[i].name === "y") {
				contextMenuHandler.m_y = parseInt(xyparam[i]["#"], 10);
			}
			if (xyparam[i].name === "scene") {
				contextMenuHandler.m_scene = xyparam[i]["#"];
			}
		}
		Menu.findMenuByID(data.refID).open(true, 0, "begin top", "begin top", this.map._container, "" + contextMenuHandler.m_x + " " + contextMenuHandler.m_y + "", "fit");
	}

});



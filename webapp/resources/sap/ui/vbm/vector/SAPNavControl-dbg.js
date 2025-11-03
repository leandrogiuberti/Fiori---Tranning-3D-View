sap.ui.define([
	"sap/ui/core/Lib",
], function (Lib) {
	"use strict";

	let isDragging = false;
	let startY = 0;
	let startYpx = 4.43911;

	class SAPMapNavControl {
		constructor(enableScrollArea = true, enableZoom = true) {
			this.enableScrollArea = enableScrollArea;
			this.enableZoom = enableZoom;
		}
		onAdd(map) {
			this.map = map;
			// Create main container
			this._container = document.createElement('div');
			this._container.id = '__xmlview1--vbi-vbi-nav';
			this._container.className = 'vbi-nav my-custom-control';
			this._container.setAttribute('role', 'Navigation');
			this._container.setAttribute('tabindex', '-1');
			this._container.style.opacity = '0.5';

			Lib.load({ name: "sap.ui.vbm.i18n" });

			var oResourceBundle = Lib.getResourceBundleFor("sap.ui.vbm.i18n")

			var sTooltipMoveLeft = oResourceBundle.getText("NAVCTL_TITLE_MOVE_LEFT");
			var sTooltipMoveRight = oResourceBundle.getText("NAVCTL_TITLE_MOVE_RIGHT");
			var sTooltipMoveUp = oResourceBundle.getText("NAVCTL_TITLE_MOVE_UP");
			var sTooltipMoveDown = oResourceBundle.getText("NAVCTL_TITLE_MOVE_DOWN");
			var sTooltipMove = oResourceBundle.getText("NAVCTL_TITLE_MOVE");
			var sTooltipZoom = oResourceBundle.getText("NAVCTL_TITLE_ZOOM");

			//Create cursor left div

			var cursorLeft = document.createElement('div');
			cursorLeft.id = '__xmlview1--vbi-vbi-cursor-left';
			cursorLeft.className = 'vbi-cursor-left';
			cursorLeft.setAttribute('role', sap.ui.core.AccessibleRole.Button);
			cursorLeft.setAttribute('aria-label', sTooltipMoveLeft);
			cursorLeft.setAttribute('tabindex', '2');
			cursorLeft.setAttribute('title', sTooltipMoveLeft);

			// Create cursor right div

			var cursorRight = document.createElement('div');
			cursorRight.id = '__xmlview1--vbi-vbi-cursor-right';
			cursorRight.className = 'vbi-cursor-right';
			cursorRight.setAttribute('role', 'Button');
			cursorRight.setAttribute('aria-label', sTooltipMoveRight);
			cursorRight.setAttribute('tabindex', '4');
			cursorRight.setAttribute('title', sTooltipMoveRight);

			// Create cursor top div

			var cursorTop = document.createElement('div');
			cursorTop.id = '__xmlview1--vbi-vbi-cursor-top';
			cursorTop.className = 'vbi-cursor-top';
			cursorTop.setAttribute('role', 'Button');
			cursorTop.setAttribute('aria-label', sTooltipMoveUp);
			cursorTop.setAttribute('tabindex', '1');
			cursorTop.setAttribute('title', sTooltipMoveUp);

			// Create cursor down div

			var cursorDown = document.createElement('div');
			cursorDown.id = '__xmlview1--vbi-vbi-cursor-down';
			cursorDown.className = 'vbi-cursor-down';
			cursorDown.setAttribute('role', 'Button');
			cursorDown.setAttribute('aria-label', sTooltipMoveDown);
			cursorDown.setAttribute('tabindex', '5');
			cursorDown.setAttribute('title', sTooltipMoveDown);

			// Create cursor reset div
			var cursorReset = document.createElement('div');
			cursorReset.id = '__xmlview1--vbi-vbi-cursor-reset';
			cursorReset.className = 'vbi-cursor-reset';
			cursorReset.setAttribute('role', 'Button');
			cursorReset.setAttribute('aria-label', sTooltipMove);
			cursorReset.setAttribute('tabindex', '3');
			cursorReset.setAttribute('title', sTooltipMove);

			this._container.addEventListener('mouseover', function () {
				this.style.opacity = '1';
				this.style.boxShadow = '0 0 25px rgba(255, 0, 0, 0.8)';
			});

			this._container.addEventListener('mouseout', function () {
				this.style.opacity = '0.5';
				this.style.boxShadow = 'none';
			});

			// Create scroll area container
			var scrollArea = document.createElement('div');
			scrollArea.id = '__xmlview1--vbi-vbi-scrollarea';
			scrollArea.className = 'vbi-scrollarea';
			scrollArea.setAttribute('role', 'Slider');
			scrollArea.setAttribute('tabindex', '0');

			// Create scroll line upper ending div
			var scrollLineUpperEnding = document.createElement('div');
			scrollLineUpperEnding.id = '__xmlview1--vbi-vbi-scrolllineupperending';
			scrollLineUpperEnding.className = 'vbi-scrolllineupperending';
			scrollLineUpperEnding.setAttribute('role', 'Img');
			scrollLineUpperEnding.setAttribute('tabindex', '-1');
			scrollLineUpperEnding.style.cursor = 'pointer';
			scrollLineUpperEnding.style.position = 'absolute';
			scrollLineUpperEnding.top = '20px';

			// Create scroll line div
			var scrollLine = document.createElement('div');
			scrollLine.id = '__xmlview1--vbi-vbi-scrollline';
			scrollLine.className = 'vbi-scrollline';
			scrollLine.setAttribute('role', 'Img');
			scrollLine.setAttribute('tabindex', '-1');

			// Create scroll line lower ending div
			var scrollLineLowerEnding = document.createElement('div');
			scrollLineLowerEnding.id = '__xmlview1--vbi-vbi-scrolllinelowerending';
			scrollLineLowerEnding.className = 'vbi-scrolllinelowerending';
			scrollLineLowerEnding.setAttribute('role', 'Img');
			scrollLineLowerEnding.setAttribute('tabindex', '-1');
			scrollLineLowerEnding.style.cursor = 'pointer';
			scrollLineLowerEnding.style.position = 'absolute';
			scrollLineLowerEnding.style.top = '90px';

			// Create scroll point div
			var scrollPoint = document.createElement('div');
			scrollPoint.id = '__xmlview1--vbi-vbi-scrollpoint';
			scrollPoint.className = 'vbi-scrollpoint';
			scrollPoint.setAttribute('role', 'Button');
			scrollPoint.setAttribute('aria-label', sTooltipZoom);
			scrollPoint.setAttribute('tabindex', '0');
			scrollPoint.setAttribute('title', sTooltipZoom);
			scrollPoint.style.top = '4.43911px';
			startYpx = 4.43911;

			scrollArea.appendChild(scrollLineUpperEnding);
			scrollArea.appendChild(scrollLine);
			scrollArea.appendChild(scrollLineLowerEnding);
			scrollArea.appendChild(scrollPoint);

			if (this.enableScrollArea) {
				this._container.appendChild(scrollArea);
			}

			// Create cursor div
			var cursor = document.createElement('div');
			cursor.id = '__xmlview1--vbi-vbi-cursor';
			cursor.className = 'vbi-cursor';
			cursor.setAttribute('role', 'Presentation');
			cursor.setAttribute('tabindex', '-1');
			// cursor.style.backgroundPosition = '-5px 305px';


			if (this.enableZoom) {
				this._container.appendChild(cursor);
			}

			// Create cursor grip container
			var cursorGrip = document.createElement('div');
			cursorGrip.id = '__xmlview1--vbi-vbi-cursor-grip';
			cursorGrip.className = 'vbi-cursor-grip';
			cursorGrip.setAttribute('role', 'Img');
			cursorGrip.setAttribute('tabindex', '-1');

			// Create cursor middle container
			var cursorMiddle = document.createElement('div');
			cursorMiddle.id = '__xmlview1--vbi-vbi-cursor-middle';
			cursorMiddle.className = 'vbi-cursor-middle';
			cursorMiddle.setAttribute('role', 'Img');
			cursorMiddle.setAttribute('tabindex', '0');

			// Append cursor buttons to cursor middle container
			cursorMiddle.appendChild(cursorLeft);
			cursorMiddle.appendChild(cursorRight);
			cursorMiddle.appendChild(cursorTop);
			cursorMiddle.appendChild(cursorDown);
			cursorMiddle.appendChild(cursorReset);

			cursorTop.addEventListener('click', function () {
				map.panBy([0, -100]); // Move map up
			});

			cursorDown.addEventListener('click', function () {
				map.panBy([0, 100]); // Move map down
			});

			cursorLeft.addEventListener('click', function () {
				map.panBy([-100, 0]); // Move map left
			});

			cursorRight.addEventListener('click', function () {
				map.panBy([100, 0]); // Move map right
			});
			cursorReset.addEventListener('click', function () {
				map.setCenter([0, 0]); // Reset map 
				map.setZoom(0);
			});


			// Function to handle mouse movement during dragging

			function onMouseMove(event) {
				if (!isDragging) return;
				const currentY = event.clientY;
				const deltaY = currentY - startY;
				let newTop = parseInt(scrollPoint.style.top || "0px") + deltaY;
				const upperBoundary = 0;
				const lowerBoundary = scrollLine.offsetHeight - scrollPoint.offsetHeight;
				newTop = Math.max(upperBoundary, Math.min(newTop, lowerBoundary));
				scrollPoint.style.top = `${newTop}px`;
				const zoomRange = map.getMaxZoom() - map.getMinZoom();
				const scrollPositionRatio = (newTop - upperBoundary) / (lowerBoundary - upperBoundary);
				const newZoom = map.getMinZoom() + scrollPositionRatio * zoomRange;
				map.setZoom(newZoom);
				startY = currentY;
			}

			function updateScrollLinePosition() {
				const zoomLevel = map.getZoom();
				const upperBoundary = 0;
				const lowerBoundary = scrollLine.offsetHeight - scrollPoint.offsetHeight;
				const maxScrollHeight = lowerBoundary - upperBoundary;
				const minZoom = map.getMinZoom();
				const maxZoom = map.getMaxZoom();
				const scrollPosition = ((zoomLevel - minZoom) / (maxZoom - minZoom)) * maxScrollHeight;
				scrollPoint.style.top = `${upperBoundary + scrollPosition}px`;
			}

			map.on('zoom', updateScrollLinePosition);
			map.on('move', updateScrollLinePosition);

			updateScrollLinePosition();

			scrollPoint.addEventListener('mousedown', (event) => {
				isDragging = true;
				startY = event.clientY;
				document.addEventListener('mousemove', onMouseMove);
				document.addEventListener('mouseup', onMouseUp);
			});


			function onMouseUp() {
				isDragging = false;
				document.removeEventListener('mousemove', onMouseMove);
				document.removeEventListener('mouseup', onMouseUp);
			}
			document.addEventListener('mouseup', onMouseUp);

			cursorGrip.appendChild(cursorMiddle);


			if (this.enableZoom) {
				this._container.appendChild(cursorGrip);
			}


			if (map && map.getContainer()) {
				map.getContainer().appendChild(this._container);
			}

			return this._container;
		}
		onRemove() {
			this._container.parentNode.removeChild(this._container);
			this.map = undefined;
		}

	}
	return SAPMapNavControl
});

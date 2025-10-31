/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/Device"], function (Device) {
  "use strict";

  /** Device widths in px */
  const DeviceWidth = {
    Mobile: 600,
    Tablet: 1024,
    Desktop: 1135,
    LargeDesktop: 1920
  };
  var DeviceType = /*#__PURE__*/function (DeviceType) {
    DeviceType["Mobile"] = "Mobile";
    DeviceType["Tablet"] = "Tablet";
    DeviceType["Desktop"] = "Desktop";
    DeviceType["LargeDesktop"] = "LargeDesktop";
    DeviceType["XLargeDesktop"] = "XLargeDesktop";
    return DeviceType;
  }(DeviceType || {});
  /**
   * Calculates the device type based on the given width.
   *
   * @param {number} [width=Device.resize.width] - The width of the device. Defaults to the current device width.
   * @returns {DeviceType} - The calculated device type.
   */
  function calculateDeviceType(width = Device.resize.width) {
    if (width < DeviceWidth.Mobile || Device.system.phone) {
      return DeviceType.Mobile;
    } else if (width < DeviceWidth.Tablet) {
      return DeviceType.Tablet;
    } else if (width < DeviceWidth.Desktop) {
      return DeviceType.Desktop;
    } else if (width < DeviceWidth.LargeDesktop) {
      return DeviceType.LargeDesktop;
    } else {
      return DeviceType.XLargeDesktop;
    }
  }

  /**
   * Fetches the specified CSS properties of a given DOM element and returns them as a record.
   *
   * @param {Element} domRef - The DOM element from which to fetch the properties.
   * @param {string[]} properties - An array of property names to fetch.
   * @returns {Record<string, number>} - A record where the keys are property names and the values are the corresponding property values as numbers.
   */
  function fetchElementProperties(domRef, properties) {
    const oProperties = {};
    properties.forEach(property => {
      oProperties[property] = parseFloat(window.getComputedStyle(domRef).getPropertyValue(property));
    });
    return oProperties;
  }

  /**
   * Calculates the card width based on the available width and certain constraints.
   *
   * @param {CardLayoutConfig} cardLayoutConfig - Card layout configuration containing container width, no. of cards, min and max width.
   * @returns {number} The calculated card width within specified constraints.
   */
  function calculateCardWidth(cardLayoutConfig) {
    const gap = cardLayoutConfig.gap;
    if (calculateDeviceType() === DeviceType.Mobile && !cardLayoutConfig.skipDeviceCheck) {
      const peekWidth = 76;
      if (cardLayoutConfig.totalCards === 1) {
        // Single card: full width, constrained
        return Math.max(cardLayoutConfig.minWidth, Math.min(cardLayoutConfig.containerWidth, cardLayoutConfig.maxWidth));
      } else {
        // Calculate width of the first card, reserving space for the peek of the second
        const mainCardWidth = cardLayoutConfig.containerWidth - peekWidth;
        // Clamp to min/max width
        return Math.max(cardLayoutConfig.minWidth, Math.min(mainCardWidth, cardLayoutConfig.maxWidth));
      }
    }
    let cardCountToUse;

    // Tablet mode: width between 600 and 1023
    if (calculateDeviceType() === DeviceType.Tablet && cardLayoutConfig.totalCards > 1 && !cardLayoutConfig.skipDeviceCheck) {
      const totalGap = gap; // gap between 2 cards
      const twoCardWidth = (cardLayoutConfig.containerWidth - totalGap) / 2;
      if (twoCardWidth >= cardLayoutConfig.minWidth && twoCardWidth <= cardLayoutConfig.maxWidth) {
        cardCountToUse = 2;
      } else {
        cardCountToUse = 1;
      }
    } else {
      // Step 1: How many cards *can* fit based on minWidth
      let possibleCardCount = 1;
      while (cardLayoutConfig.containerWidth / possibleCardCount >= cardLayoutConfig.minWidth + gap) {
        possibleCardCount++;
      }
      possibleCardCount--; // Last valid value
      // Step 2: If we have fewer cards than we *can* fit, stretch them
      cardCountToUse = cardLayoutConfig.skipDeviceCheck ? Math.min(possibleCardCount, cardLayoutConfig.totalCards) : Math.max(Math.min(possibleCardCount, cardLayoutConfig.totalCards), Math.min(cardLayoutConfig.totalCards, 3));
    }
    if (cardCountToUse <= 0) return cardLayoutConfig.minWidth;
    const totalGap = (cardCountToUse - 1) * gap;
    const cardWidth = (cardLayoutConfig.containerWidth - totalGap) / cardCountToUse;
    return Math.min(Math.max(cardWidth, cardLayoutConfig.minWidth), cardLayoutConfig.maxWidth);
  }
  var __exports = {
    __esModule: true
  };
  __exports.DeviceType = DeviceType;
  __exports.calculateDeviceType = calculateDeviceType;
  __exports.fetchElementProperties = fetchElementProperties;
  __exports.calculateCardWidth = calculateCardWidth;
  return __exports;
});
//# sourceMappingURL=Device-dbg.js.map

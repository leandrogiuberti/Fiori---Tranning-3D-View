sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/vbm/GeoMap",
	"sap/ui/vbm/Containers",
	"sap/ui/vbm/Container",
	"sap/m/Text",
	"sap/ui/test/utils/nextUIUpdate"
], function(jQuery, GeoMap, Containers, Container, Text, nextUIUpdate) {
	'use strict';
	// This unit test is covering message 1780022375
	// Container items are rendererd twice. It is expected they are rendered only once.

	// query for charts library, the microchart is positioned in a container vo

	QUnit.test("test loading scene", async function(assert) {
		var myText = new Text({
			text: "1111111111111111"
		});

		var geoMap = new GeoMap({
			vos: [
				new Containers("containers", {
					items: [
						new Container({
							position: '70;0;0',
							item: myText
						})
					]
				})
			]
		});

		geoMap.placeAt("content");
		
		await nextUIUpdate();

		    // Max wait time of 5 seconds
			const MAX_WAIT_TIME = 5000;
			const CHECK_INTERVAL = 100;


		    // Wait for the element to actually appear in the DOM
			await new Promise((resolve, reject) => {
		    let elapsedTime = 0;
			let checkExist = setInterval(() => {
			var numberOfLabels = jQuery('span').filter(function() {
				return jQuery(this).text() === '1111111111111111';
			}).length;

			if (numberOfLabels > 0) {
                clearInterval(checkExist);
                resolve();
            }

            elapsedTime += CHECK_INTERVAL;
            if (elapsedTime >= MAX_WAIT_TIME) {
                clearInterval(checkExist);
                reject(new Error("Label did not appear within the expected time"));
            }
        }, CHECK_INTERVAL);
    }).catch(error => assert.ok(false, error.message));

    var numberOfLabels = jQuery('span').filter(function() {
        return jQuery(this).text() === '1111111111111111';
    }).length;

	assert.equal(numberOfLabels, 1, "The container item is rendered only once");
});
});
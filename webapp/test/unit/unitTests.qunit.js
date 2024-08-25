/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"money_m/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});

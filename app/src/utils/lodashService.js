(function () {
	'use strict';

	// register the service as _
	angular
		.module('util.lodash', [])
		.factory('_', LodashService);

	// add LodashService dependencies to inject
	LodashService.$inject = ['$window'];

	/**
 	 * LodashService constructor
	 *
	 * @param $window
	 * @returns {exports._|*}
	 * @constructor
	 */
	function LodashService($window) {
		// remove lodash from global object
		var _ = $window._;
		delete $window._;


		return _;
	}

})();

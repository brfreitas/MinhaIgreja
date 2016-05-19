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

		_.mixin({'objectConverter': objectConverter});


		return _;

		function objectConverter(source, mapPropertiesTransform){
			var output = {};
			_.forEach(source, function(value, key) {
				key = mapPropertiesTransform[key] || key;
    		output[key] = value;
			});
			return output;
		}
	}

})();

(function(){
'use strict';
  angular
       .module('minhaIgrejaApp.customControls')
       .directive('toolbarSearch', function () {
          return {
            restrict: 'E',
            templateUrl: './src/components/customControls/toolbarSearch/toolbarSearch.html',
            scope: {
                search: '=',
                title: '@'
            }
          };
        });

})();

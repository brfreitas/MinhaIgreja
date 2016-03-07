(function(){
'use strict';
  angular
       .module('minhaIgrejaApp.customControls')
       .directive('toolbarEdit', function () {
          return {
            restrict: 'E',
            templateUrl: './src/components/customControls/toolbarEdit/toolbarEdit.html',
            scope: {
                save: '&',
                back: '&',
                title: '@',
                operationType: '=',
                formValidator: '='
            }
          };
        });

})();

(function() {
  'use strict';
  angular
    .module('minhaIgrejaApp.customControls')
    .directive('forceSelect', function() {
      function postLink(scope, element, attrs, autoComplete) {

        // we need to wait for the autocomplete directive
        // to be compiled
        function getInput() {
          return element.find('input').eq(0);
        }

        var listener = scope.$watch(getInput, function(input) {

          if (input.length) {
            listener(); // self release

            var ngModel = input.controller('ngModel');

            // this would be ideal but for some reason prevents the auto-select options from appearing
            // ngModel.$validators.forceSelect = function (modelValue, viewValue) {
            //   return !!autoComplete.scope.selectedItem;
            // };

            // this works as well
            input.on('blur', function() {
              setTimeout(function(){
                if (!autoComplete.scope.selectedItem) {
                  autoComplete.scope.searchText = null;
                  scope.$applyAsync(ngModel.$setValidity('selectValidValue', false));
                }else{
                  scope.$applyAsync(ngModel.$setValidity('selectValidValue', true));
                }
              }, 300);
            });
          }
        });

      }
      return {
        link: postLink,
        restrict: 'A',
        require: 'mdAutocomplete'
      };
    });

})();

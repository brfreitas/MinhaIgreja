(function(){
'use strict';
  angular
       .module('dashboards')
       .controller('DashboardController', [
          '$scope','$mdSidenav', '$mdBottomSheet', '$log', '$q',
          DashboardController
       ]);

  function DashboardController($scope, $mdSidenav, $mdBottomSheet, $log, $q) {
    var self = this;
    
  }

})();

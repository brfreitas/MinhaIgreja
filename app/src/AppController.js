(function(){
'use strict';
  angular
       .module('minhaIgrejaApp')
       .controller('AppController', [
          '$scope', '$mdSidenav', 'ssSideNav',
          AppController
       ]);

  function AppController( $scope,$mdSidenav, ssSideNav) {
    var self = this;
    self.onClickMenu = onClickMenu;
    self.title = '';
    self.changeTitle = changeTitle


    function changeTitle(title) {
        self.title = title;
    };
    function onClickMenu() {
        $mdSidenav('left').toggle();
    };

    self.menu = ssSideNav;
  }

})();

(function(){
'use strict';
  angular
       .module('memberships')
       .controller('MembershipController', [
          'membershipService','$mdSidenav', '$mdBottomSheet', '$log', '$q', '$mdToast', '$mdDialog', '$state',
          MembershipController
       ]);

  function MembershipController(membershipService, $mdSidenav, $mdBottomSheet, $log, $q, $mdToast, $mdDialo, $state) {
    var self = this;
    self.memberships = [];

    self.goEdit = goEdit

    

    membershipService.loadMemberships().then( function( memberships ) {
      self.memberships = [].concat(memberships);
    });

    function goEdit(id) {
      $state.go('app.edit-membership',{'membershipId':id});
    }





  }

})();

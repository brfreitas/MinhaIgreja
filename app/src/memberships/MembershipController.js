(function(){
'use strict';
  angular
       .module('memberships')
       .controller('MembershipController', [
          'membershipService','$mdSidenav', '$mdBottomSheet', '$log', '$q', '$mdToast', '$stateParams', '$mdDialog', '$state',
          MembershipController
       ]);

  function MembershipController(membershipService, $mdSidenav, $mdBottomSheet, $log, $q, $mdToast, $stateParams, $mdDialog, $state) {
    var self = this;
    self.memberships = [];
    self.goEdit = goEdit;
    self.toastMessage = $stateParams.toastMessage;



    membershipService.listMemberships().then( function( memberships ) {
      self.memberships = [].concat(memberships);
    });

    function goEdit(id) {
      $state.go('app.edit-membership',{'membershipId':id});
    }

    if(self.toastMessage!==null){
      showToast(self.toastMessage);
    }

    function showToast(msg){
      $mdToast.show(
        $mdToast.simple()
          .textContent(msg)
          .position("bottom right")
          .hideDelay(3000)
        );
    }




  }

})();

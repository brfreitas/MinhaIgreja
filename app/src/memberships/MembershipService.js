(function(){
  'use strict';

  angular.module('memberships')
         .service('membershipService', ['$q','$resource',MembershipsService]);

  function MembershipsService($q, $resource){
    var path =  './src/memberships/Membership.json';

    // Promise-based API
    return {
      loadMemberships: function() {
          return $resource(path).query().$promise;
        },
      getMembership: function(uuid){
        var deferred = $q.defer();
        $resource(path).query().$promise.then( function( memberships ) {
          angular.forEach(memberships,function(form){
            if(form.uuid == uuid) deferred.resolve(form);
          });
        });
        return deferred.promise;
      }
    };
  }

})();

(function(){
  'use strict';

   var db = require('./src/database/database.js');

  angular.module('maritalStatus')
         .service('maritalStatusService', ['$q','$resource',MaritalStatusService]);

  function MaritalStatusService($q, $resource){

    // Promise-based API
    return {
      listMaritalStatus: listMaritalStatus
    };

    function listMaritalStatus(){
        var deferred = $q.defer();
        var query = "SELECT ms._id ms_id, ms.description ms_description FROM marital_status ms ";
        db.connection.query(query, function (err, rows) {
            if (err) deferred.reject(err);
            deferred.resolve(rows);
        });
        return deferred.promise;
    }
  }

})();

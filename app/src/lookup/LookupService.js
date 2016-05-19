(function(){
  'use strict';

   var db = require('./src/database/database.js');

  angular.module('lookup')
         .service('lookupService', ['$q','$resource',LookupService]);

  function LookupService($q, $resource){

    // Promise-based API
    return {
      listMaritalStatus: listMaritalStatus,
      listCities: listCities,
      listStates: listStates,
      listReceiveType: listReceiveType
    };

    function listMaritalStatus(status){
        var deferred = $q.defer();
        var query = "SELECT ms._id value, ms.description description FROM marital_status ms WHERE LOWER(ms.description) like ?";
        db.pool.getConnection(function(err, connection) {
          connection.query(query, [status+"%"], function (err, rows) {
            connection.release();
            if (err) deferred.reject(err);
            deferred.resolve(rows);
          });

        });

        return deferred.promise;
    }
    function listReceiveType(receiveType){
        var deferred = $q.defer();
        var query = "SELECT rt._id value, rt.short_description description FROM receive_types rt WHERE LOWER(rt.short_description) like ?";
        db.pool.getConnection(function(err, connection) {
          connection.query(query, ["%"+receiveType+"%"], function (err, rows) {
            connection.release();
            if (err) deferred.reject(err);
            deferred.resolve(rows);
          });
        });
        return deferred.promise;
    }
    function listStates(stateName){
        var deferred = $q.defer();
        var query = "SELECT s._id value, s.name description, s.initials initials FROM states s WHERE LOWER(s.name) like ?";
        db.pool.getConnection(function(err, connection) {
          connection.query(query, [stateName+"%"], function (err, rows) {
            connection.release();
            if (err) deferred.reject(err);
            deferred.resolve(rows);
          });
        });
        return deferred.promise;
    }
    function listCities(stateId, cityName){
        var deferred = $q.defer();
        var query = "SELECT c._id value, c.name description, c.state_id state FROM cities c WHERE c.state_id = ? and LOWER(c.name) like ?";
        db.pool.getConnection(function(err, connection) {
          connection.query(query, [stateId, cityName+"%"], function (err, rows) {
            connection.release();
            if (err) deferred.reject(err);
            deferred.resolve(rows);
          });
        });
        return deferred.promise;
    }
  }

})();

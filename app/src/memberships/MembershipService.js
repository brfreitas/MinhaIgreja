(function(){
  'use strict';

   var db = require('./src/database/database.js'),
       fs = require('fs'),
       path = require('path');
   // Creates MySql database connection

  angular.module('memberships')
         .service('membershipService', ['$q','$resource',MembershipsService]);

  function MembershipsService($q, $resource){

    // Promise-based API
    return {
      listMemberships: listMemberships,
      insertMembership: insertMembership,
      updateMembership: updateMembership,
      getMembershipById: getMembershipById,
      filterWeddingMemberships: filterWeddingMemberships
    };

    function getMembershipById(_id){
        var deferred = $q.defer();
        var query = "SELECT p._id p_id, p.name p_name, p.birthday p_birthday, p.rg p_rg, p.cpf p_cpf, p.gender p_gender, " +
          " ms._id ms_id, ms.description ms_description, r._id r_id, r.short_description r_short_description, m.receive_date m_receive_date," +
          " m.spouse_name m_spouse_name, m.photo_filename m_photo_filename, m.phone1 m_phone1, m.phone2 m_phone2, m.phone3 m_phone3, " +
          " mspouse.person_id mspouse_person_id, pspouse.name pspouse_name, "+
          " pspouse.birthday pspouse_birthday, pspouse.cpf pspouse_cpf, a.place a_place, a.number a_number, a.complement a_complement," +
          " a.cep a_cep, a.neighborhood a_neighborhood, c._id c_id, c.name c_name,  s._id s_id, s.name s_name, s.initials s_initials" +
          " FROM memberships m " +
          " INNER JOIN persons p ON m.person_id = p._id" +
          " INNER JOIN marital_status ms ON ms._id = p.marital_status_id" +
          " INNER JOIN receive_types r ON r._id = m.receive_type_id" +
          " LEFT JOIN memberships mspouse ON mspouse.person_id = m.spouse_id" +
          " LEFT JOIN persons pspouse ON pspouse._id = mspouse.person_id" +
          " LEFT JOIN addresses a ON m.person_id = a.memberships_id" +
          " LEFT JOIN cities c ON c._id = a.city_id" +
          " LEFT JOIN states s ON s._id = c.state_id" +
          " WHERE m.person_id = ?";
        db.pool.getConnection(function(err, connection) {
          connection.query(query, [_id], function (err, rows) {
            connection.release();
            if (err) deferred.reject(err);
            deferred.resolve(rows);
          });
        });
        return deferred.promise;
    }

    function filterWeddingMemberships(name){
        var deferred = $q.defer();
        var query = 'SELECT p._id, p.name, p.birthday, p.cpf  FROM memberships m INNER JOIN persons p ON m.person_id = p._id WHERE p.marital_status_id = 2 AND LOWER(p.name ) like ?';
        db.pool.getConnection(function(err, connection) {
          connection.query(query, [name+"%"], function (err, rows) {
            connection.release();
            if (err) deferred.reject(err);
            deferred.resolve(rows);
          });
        });
        return deferred.promise;
    }

    function listMemberships(){
        var deferred = $q.defer();
        var query = 'SELECT p._id, p.name, m.photo_filename FROM memberships m INNER JOIN persons p ON m.person_id = p._id';
        db.pool.getConnection(function(err, connection) {
          connection.query(query, function (err, rows) {
            connection.release();
            if (err) deferred.reject(err);
            deferred.resolve(rows);
          });
        });
        return deferred.promise;
    }

    function insertMembership(membership, success, error){
      //FIXME: ajustar para promise
      db.pool.getConnection(function(err, connection) {
        connection.beginTransaction(function(err) {
          if (err) {
            connection.release();
            error();
            //throw err;
          }

          var personSql = getPersonSql(membership, false);
          connection.query(personSql.sql, personSql.values, function(err, resultPersons) {
            if (err) {
              return connection.rollback(function() {
                connection.release();
                error();
                //throw err;
              });
            }

            //var log = 'Post ' + resultPersons.insertId + ' added';
            membership.p_id = resultPersons.insertId;
            var membershipSql = getMembershipSql(membership, false);
            connection.query(membershipSql.sql, membershipSql.values, function(err, resultMembership) {
              if (err) {
                membership.p_id = null;
                return connection.rollback(function() {
                  connection.release();
                  error();
                  //throw err;
                });
              }
              uploadProfileImage(membership, connection);
            });


            if(hasAddress(membership)){
              var addressSql = getAddressSql(membership, false);
              connection.query(addressSql.sql, addressSql.values, function(err, result) {
                if (err) {
                  membership.p_id = null;
                  return connection.rollback(function() {
                    connection.release();
                    error();
                    //throw err;
                  });
                }

              });
          }

          connection.commit(function(err) {
            if (err) {
              return connection.rollback(function() {
                connection.release();
                error();
                //throw err;
              });
            }
            connection.release();
            success();
          });
          });
        });
      });
    }

    function uploadProfileImage(membership, connection){
      if(typeof(membership.picFile)=="object"){
        var ext = path.extname(membership.picFile.path);
        var filename = membership.p_id;
        var relativePath = 'assets/memberships/'+filename+ext;
        var newPath = __dirname+ '/' + relativePath;
        fs.readFile(membership.picFile.path, function (err, data) {
          fs.writeFile(newPath, data, function (err) {
            connection.query('UPDATE memberships SET photo_filename=? WHERE person_id=?', [relativePath, membership.p_id], function(err, resultUpdate) {
              if (err) {
                return connection.rollback(function() {
                  connection.release();
                  throw err;
                });
              }
            });

          });
        });
      }
    }

    function updateMembership(membership, success, error){
      //upload image here
      db.pool.getConnection(function(err, connection) {
        connection.beginTransaction(function(err) {
          if (err) {
            connection.release();
            error();
          }

          var personSql = getPersonSql(membership, true);
          connection.query(personSql.sql, personSql.values, function(err, resultPersons) {
            if (err) {
              return connection.rollback(function() {
                connection.release();
                error();
              });
            }

            var membershipSql = getMembershipSql(membership, true);
            connection.query(membershipSql.sql, membershipSql.values, function(err, resultMembership) {
              if (err) {
                membership.p_id = null;
                return connection.rollback(function() {
                  connection.release();
                  error();
                });
              }
              uploadProfileImage(membership, connection);

            });

            if(hasAddress(membership)){
              var addressSql = getAddressSql(membership, true);
              connection.query(addressSql.sql, addressSql.values, function(err, result) {
                if (err) {
                  return connection.rollback(function() {
                    connection.release();
                    error();
                  });
                }
              });
            }
            connection.commit(function(err) {
              if (err) {
                return connection.rollback(function() {
                  connection.release();
                  error();
                });
              }
              connection.release();
              success();
            });
          });
        });
      });
    }

    function getPersonSql(membership, update){
      var personArrValues = [];
      var personSql = update ? 'UPDATE persons SET ' : 'INSERT INTO persons (';
      var personSqlColumns = '';
      var personSqlValues = 'VALUES (';
      //Name
      if(update){
        personSqlColumns += 'name=?';
      }else{
        personSqlColumns += 'name';
        personSqlValues += '?';
      }
      personArrValues.push(membership.p_name);
      //birthday
      if(membership.p_birthday){
        if(update){
          personSqlColumns += ', birthday=?';
        }else{
          personSqlColumns += ', birthday';
          personSqlValues += ',?';
        }
        personArrValues.push(membership.p_birthday);
      }
      if(membership.p_rg){
        if(update){
          personSqlColumns += ', rg=?';
        }else{
          personSqlColumns += ', rg';
          personSqlValues += ',?';
        }
        personArrValues.push(membership.p_rg);
      }
      if(membership.p_cpf){
        if(update){
          personSqlColumns += ', cpf=?';
        }else{
          personSqlColumns += ', cpf';
          personSqlValues += ',?';
        }
        personArrValues.push(membership.p_cpf);
      }
      if(membership.p_gender){
        if(update){
          personSqlColumns += ', gender=?';
        }else{
          personSqlColumns += ', gender';
          personSqlValues += ',?';
        }
        personArrValues.push(membership.p_gender);
      }
      if(membership.maritalStatus){
        if(update){
          personSqlColumns += ', marital_status_id=?';
        }else{
          personSqlColumns += ', marital_status_id';
          personSqlValues += ',?';
        }
        personArrValues.push(membership.maritalStatus.value);
      }
      if(update){
        personArrValues.push(membership.p_id);
      }
       var finalSql = update ? personSql +personSqlColumns+' WHERE _id = ?' : personSql+personSqlColumns+') '+personSqlValues+')';

      return {
        sql: finalSql,
        values: personArrValues
      };
    }

    function getMembershipSql(membership, update){
      var membershipArrValues = [];
      var membershipSql = update ? 'UPDATE memberships SET ' : 'INSERT INTO memberships (';
      var membershipSqlColumns = '';
      var membershipSqlValues = 'VALUES (';
      //Person Id
      if(!update){
        membershipSqlColumns += 'person_id';
        membershipSqlValues += '?';
        membershipArrValues.push(membership.p_id);
      }
      //receiveType
      if(update){
        membershipSqlColumns += 'receive_type_id=?';
      }else{
        membershipSqlColumns += ', receive_type_id';
        membershipSqlValues += ',?';
      }
      membershipArrValues.push(membership.receiveType.value);
      if(update){
        membershipSqlColumns += ', receive_date=?';
      }else{
        membershipSqlColumns += ', receive_date';
        membershipSqlValues += ',?';
      }
      membershipArrValues.push(membership.m_receive_date);

      if(update){
        membershipSqlColumns += ', spouse_name=?';
      }else{
        membershipSqlColumns += ', spouse_name';
        membershipSqlValues += ',?';
      }
      membershipArrValues.push(membership.m_spouse_name);
      if(update){
        membershipSqlColumns += ', spouse_id=?';
      }else{
        membershipSqlColumns += ', spouse_id';
        membershipSqlValues += ',?';
      }
      if(membership.spouse)
        membershipArrValues.push(membership.spouse.value);
      else
        membershipArrValues.push(null);
      if(update){
          membershipSqlColumns += ', phone1=?';
      }else{
        membershipSqlColumns += ', phone1';
        membershipSqlValues += ',?';
      }
      membershipArrValues.push(membership.m_phone1);
      if(update){
        membershipSqlColumns += ', phone2=?';
      }else{
        membershipSqlColumns += ', phone2';
        membershipSqlValues += ',?';
      }
      membershipArrValues.push(membership.m_phone2);
      if(update){
        membershipSqlColumns += ', phone3=?';
      }else{
        membershipSqlColumns += ', phone3';
        membershipSqlValues += ',?';
      }
      membershipArrValues.push(membership.m_phone3);
      if(update){
        membershipArrValues.push(membership.p_id);
      }
      var finalSql = update ? membershipSql + membershipSqlColumns+' WHERE person_id = ?' : membershipSql+membershipSqlColumns+') '+membershipSqlValues+')';
      return {
        sql: finalSql,
        values: membershipArrValues
      };
    }

    function getAddressSql(membership, update){
      var addressArrValues = [];
      var addressSql = update ? 'UPDATE addresses SET ' : 'INSERT INTO addresses (';
      var addressSqlColumns = '';
      var addressSqlValues = 'VALUES (';
      //id
      if(!update){
        addressSqlColumns += 'memberships_id';
        addressSqlValues += '?';
        addressArrValues.push(membership.p_id);
      }
      //place
      if(update){
        addressSqlColumns += 'place = ?';
      }else {
        addressSqlColumns += ', place';
        addressSqlValues += ',?';
      }
      addressArrValues.push(membership.a_place);
      //number
      if(update){
        addressSqlColumns += ', number = ?';
      }
      else{
        addressSqlColumns += ', number';
        addressSqlValues += ',?';
      }
      addressArrValues.push(membership.a_number);
      //cep
      if(update){
        addressSqlColumns += ', cep = ?';
      }
      else{
        addressSqlColumns += ', cep';
        addressSqlValues += ',?';
      }
      addressArrValues.push(membership.a_cep);
      //complement
      if(update){
        addressSqlColumns += ', complement = ?';
      } else{
        addressSqlColumns += ', complement';
        addressSqlValues += ',?';
      }
      addressArrValues.push(membership.a_complement);
      //neighborhood
      if(update){
        addressSqlColumns += ', neighborhood = ?';
      }else{
        addressSqlColumns += ', neighborhood';
        addressSqlValues += ',?';
      }
      addressArrValues.push(membership.a_neighborhood);
      //city
      if(update){
        addressSqlColumns += ', city_id=?';
      }else{
        addressSqlColumns += ', city_id';
        addressSqlValues += ',?';
        addressArrValues.push(membership.city.value);
      }
      var finalSql = update ? addressSql + addressSqlColumns + ' WHERE person_id = ?' : addressSql + addressSqlColumns + ') ' + addressSqlValues + ')';
      return {
        sql: finalSql,
        values: addressArrValues
      };
    }

    function hasAddress(membership){
      if( membership.a_place || membership.a_number || membership.a_cep ||
        membership.a_complement || membership.a_neighborhood ||
        membership.a_cep || membership.state || membership.city){
          return true;
        }
        return false;

    }

  }

})();

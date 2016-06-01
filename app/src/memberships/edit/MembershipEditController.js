(function(){
'use strict';

  var fs = require('fs'),
      path = require('path');

  angular
       .module('memberships')
       .controller('MembershipEditController', [
          'lookupService','membershipService','$mdSidenav', '$mdBottomSheet', '$log', '$q', '$mdToast', '$mdDialog','$stateParams', '$state', '_',
          MembershipEditController
       ]);

  function MembershipEditController(lookupService,membershipService, $mdSidenav, $mdBottomSheet, $log, $q, $mdToast, $mdDialog, $stateParams, $state, _) {
    //region attributes declaration
    var self = this;
    //self.picFile =
    self.idMembership = $stateParams.membershipId;
    self.tabs = [];
    self.tempData = {};
    self.operationType = "N";
    self.defaultImage = "";
    //[{"description":"Solteriro", "value":"solteiro"},{"description":"Casado", "value":"casado"},{"description":"Divórsiado", "value":"divorsiado"},{"description":"Viúvo", "value":"viuvo"},];
    //[{"description":"Pernambuco", "value":"PE"},{"description":"Paraíba", "value":"PB"},{"description":"Rio Grande do Norte", "value":"RN"},{"description":"Ceará", "value":"CE"},];
     /*[
      {"description":"Por profissão de fé (Batismo)", "value":"B"},
      {"description":"Por carta (outra denominação)", "value":"COD"},
      {"description":"Por carta (mesma denominação)", "value":"CMD"},
      {"description":"Por Jurisdição a pedido (outra comunidade evangélica)", "value":"JPOCE"},
      {"description":"Por Jurisdição ex-ofício (igreja de denominação)", "value":"JEID"},
      {"description":"Restauração (afastados ou excluídos)", "value":"RAE"},
    ];*/

    //endregion

    //region methods interface

    self.querySearchMaritalStatus = querySearchMaritalStatus;
    self.querySearchReceiveType = querySearchReceiveType;
    self.querySearchSpouse = querySearchSpouse;
    self.querySearchStates = querySearchStates;
    self.querySearchCities = querySearchCities;
    self.stateItemChange = stateItemChange;
    self.back = back;
    self.save = save;
    self.fileSelected = fileSelected;
    self.hasSpouse = hasSpouse;
    self.addressRequired = verifyAddressRequired;

    //endregion

    function hasSpouse(){
      if(self.tempData.maritalStatus){
        if(self.tempData.maritalStatus.value == 2){
          return true;
        }
      }
      return false;
    }

    //region initialize view
    self.tempData.picFile = "assets/images/foto.png";
    if(self.idMembership){
      membershipService.getMembershipById(self.idMembership).then( function( membership ) {
        self.tempData = membership[0];
        self.tempData.maritalStatus = {"value": self.tempData.ms_id, "description": self.tempData.ms_description};
        self.tempData.receiveType = {"value": self.tempData.r_id, "description": self.tempData.r_short_description};
        if(self.tempData.ms_id == 2){
          if(self.tempData.mspouse_person_id){
            self.tempData.spouse  = {"_id" : self.tempData.mspouse_person_id, "name": self.tempData.pspouse_name, "birthday": self.tempData.pspouse_birthday, "cpf": self.tempData.pspouse_cpf};
          }else if(self.tempData.m_spouse_name){
            self.searchTextSpouse = self.tempData.m_spouse_name;
          }
        }
        if(self.tempData.c_id !== null){
          self.tempData.city = {"value": self.tempData.c_id, "description": self.tempData.c_name};
        }
        if(self.tempData.s_id !== null){
          self.tempData.state = {"value": self.tempData.s_id, "description": self.tempData.s_name};
        }
        if(!self.tempData.m_photo_filename){
          self.tempData.picFile = "assets/images/foto.png";
        }else{
          self.tempData.picFile = self.tempData.m_photo_filename;
        }
      });
      self.operationType = "U";
      self.title = "Alterar Membro";
    }else{
      self.title = "Novo Membro";
    }
    self.defaultImage = self.tempData.picFile;
    //endregion


    //region intialize lookups

    function querySearchMaritalStatus(query) {
      if(query){
        var deferred = $q.defer();
        var lowercaseQuery = angular.lowercase(query);
        lookupService.listMaritalStatus(lowercaseQuery).then(function( maritalStatus ) {
          deferred.resolve(maritalStatus);
        });
        return deferred.promise;
      }
      return [];
    }
    function querySearchReceiveType(query) {
      if(query){
        var deferred = $q.defer();
        var lowercaseQuery = angular.lowercase(query);
        lookupService.listReceiveType(lowercaseQuery).then(function( receiveTypes ) {
          deferred.resolve(receiveTypes);
        });
        return deferred.promise;
      }
      return [];
    }
    function querySearchSpouse(query) {
      //FIXME: filtrar apenas os casados sem conjuge associado
      if(query){
        var deferred = $q.defer();
        var lowercaseQuery = angular.lowercase(query);
        membershipService.filterWeddingMemberships(lowercaseQuery).then(function( members ) {
          deferred.resolve(members);
        });
        return deferred.promise;
      }
      return [];
    }
    function querySearchStates(query) {
      if(query){
        var deferred = $q.defer();
        var lowercaseQuery = angular.lowercase(query);
        lookupService.listStates(lowercaseQuery).then(function( states ) {
          deferred.resolve(states);
        });
        return deferred.promise;
      }
      return [];
    }
    function querySearchCities(query) {
      if(query){
        var deferred = $q.defer();
        var lowercaseQuery = angular.lowercase(query);
        lookupService.listCities(self.tempData.state.value, lowercaseQuery).then(function( cities ) {
          deferred.resolve(cities);
        });
        return deferred.promise;
      }
      return [];
    }
    //endregion

    function stateItemChange(){
      if(!self.tempData.state || self.tempData.state === null){
        self.tempData.city = null;
        self.searchTextCity = null;
      }
    }

    function querySearch(query, list) {
      var results = query ? list.filter( createFilterFor(query) ) : list;
      return results;

    }

    function createFilterForDependent(query, depItem) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(property) {
        return (property.description.indexOf(lowercaseQuery) === 0);
      };
    }
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(property) {
        return (angular.lowercase(property.description).indexOf(lowercaseQuery) === 0);
      };
    }

    function back() {
        $state.go('app.memberships');
    }

    function fileSelected($files, $file, $event, $rejectedFiles){
      if(!$file){
        self.tempData.picFile = self.defaultImage;
      }
    }

    function save(form) {
      var valid = validateData(form);
      if(valid){
        //FIXME: verificar nome conjuge
        if(self.tempData.maritalStatus.value == 2 && self.tempData.spouse === null){
          self.tempData.m_spouse_name = self.searchTextSpouse;
        }else{
          self.tempData.m_spouse_name = null;
        }
        if (self.tempData.p_id === undefined || self.tempData.p_id === null) insert();
        else update();
      }
    }

    function validateData(form){
      var valid = true;
      //Validação de casamento
      if(self.tempData.maritalStatus===null){
        valid = false;
        form.maritalStatus.$setValidity('required', false);
      }else if(self.tempData.maritalStatus == 2 && (self.tempData.spouse === null || self.tempData.m_wedding_date === null)){
        valid = false;
        if(self.tempData.spouse === null){
          form.spouse.$setValidity('required', false);
        }
        if(self.tempData.m_wedding_date){
          form.weddingDate.$setValidity('required', false);
        }
      }
      //Validação de endereço
      if(verifyAddressRequired()){
        if(!self.tempData.a_place){
          valid = false;
          form.place.$setValidity('required', false);
        }
        if(!self.tempData.a_number){
          valid = false;
          form.number.$setValidity('required', false);
        }
        if(!self.tempData.a_cep){
          valid = false;
          form.cep.$setValidity('required', false);
        }
        if(!self.tempData.a_neighborhood){
          valid = false;
          form.neighborhood.$setValidity('required', false);
        }
        if(!self.tempData.state){
          valid = false;
          form.state.$setValidity('required', false);
        }
        if(!self.tempData.city){
          valid = false;
          form.city.$setValidity('required', false);
        }
      }
      //Validação de recebimento
      if(self.tempData.receiveType === null){
        valid = false;
        form.receiveType.$setValidity('required', false);
      }
      return valid;
    }

    function verifyAddressRequired(){
      if( self.tempData.a_place || self.tempData.a_number || self.tempData.a_cep ||
        self.tempData.a_complement || self.tempData.a_neighborhood ||
        self.tempData.a_cep || self.tempData.state || self.tempData.city){
          return true;
        }
        return false;

    }

    //Permite agregar un nuevo elemento
    function insert() {
      membershipService.insertMembership(self.tempData, insertSuccess, insertError);
    }

    function insertSuccess(){
      goList('Membro cadastrado com sucesso!');
    }

    function insertError(){
      showToast('Falha ao cadastrar membro');
    }

    function showToast(msg){
      $mdToast.show(
        $mdToast.simple()
          .textContent(msg)
          .position("bottom right")
          .hideDelay(3000)
        );
    }

    //Permite modificar un registro
    function update() {
      membershipService.updateMembership(self.tempData, updateSuccess, updateError);
    }
    function updateSuccess(){
      goList('Membro alterado com sucesso!');
    }

    function updateError(){
      showToast('Falha ao alterar membro');
    }


    function mostrarError(msg) {
      simpleToastBase(msg, 'bottom right', 6000, 'X');
    }

    function goList(msg) {
      $state.go('app.memberships',{'toastMessage':msg});
    }

  }

  angular
       .module('memberships')
       .filter('startFrom', function() {
      return function(input, start) {
          start = +start; //parse to int
          return input.slice(start);
      };
  });

})();

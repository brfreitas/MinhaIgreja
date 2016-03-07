(function(){
'use strict';
  angular
       .module('memberships')
       .controller('MembershipEditController', [
          'membershipService','$mdSidenav', '$mdBottomSheet', '$log', '$q', '$mdToast', '$mdDialog','$stateParams', '$state', '_',
          MembershipEditController
       ]);

  function MembershipEditController(membershipService, $mdSidenav, $mdBottomSheet, $log, $q, $mdToast, $mdDialog, $stateParams, $state, _) {
    var self = this;
    self.idMembership = $stateParams.membershipId;
    self.tabs = [];
    self.tempData = {};
    self.operationType = "N";
    self.back = back;
    self.save = save;
    self.maritalStatus = [{"description":"Solteriro", "value":"solteiro"},{"description":"Casado", "value":"casado"},{"description":"Divórsiado", "value":"divorsiado"},{"description":"Viúvo", "value":"viuvo"},];
    self.states = [{"description":"Pernambuco", "value":"PE"},{"description":"Paraíba", "value":"PB"},{"description":"Rio Grande do Norte", "value":"RN"},{"description":"Ceará", "value":"CE"},];
    self.receives = [
                    {"description":"Por profissão de fé (Batismo)", "value":"B"},
                    {"description":"Por carta (outra denominação)", "value":"COD"},
                    {"description":"Por carta (mesma denominação)", "value":"CMD"},
                    {"description":"Por Jurisdição a pedido (outra comunidade evangélica)", "value":"JPOCE"},
                    {"description":"Por Jurisdição ex-ofício (igreja de denominação)", "value":"JEID"},
                    {"description":"Restauração (afastados ou excluídos)", "value":"RAE"},
                  ];




    if(self.idMembership){
      membershipService.getMembership(self.idMembership).then( function( membership ) {
        self.tempData = membership;
      });
      self.operationType = "U";
      self.title = "Alterar Membro";
    }else{
      console.log('NOK');
      self.title = "Novo Membro";
    }


    function back() {
        $state.go('app.memberships');
    }

    function save() {
      if (self.tempData.id === undefined) insert();
      else update();
    }

    //Permite agregar un nuevo elemento
    function insert() {
      //Fazer as validações client-side aqui
      var temp = _.find(self.table, function (x) { return x.id === self.selectedItem.id; });
      if (temp === undefined) {
          //lógica para chamar a api e add
          $mdDialog.hide('Formulário cadastado com sucesso');
      } else {
          $mdDialog.hide('Já existe um formulário com esses dados');
      }
    }

    //Permite modificar un registro
    function update() {
      //Determinando si existe el elemento con el ID especificado
      var index = _.findIndex(self.table, { 'id': self.selectedItem.id });
      if (index !== -1) {
        //lógica para alterar na API
        $mdDialog.hide('Formulário de inscrição editado com sucesso!');
      } else {
        $mdDialog.hide('Não foi possivel editar o formulário de inscrição selecionado');
      }
    }


    function mostrarError(msg) {
      simpleToastBase(msg, 'bottom right', 6000, 'X');
    }

  }

  angular
       .module('memberships')
       .filter('startFrom', function() {
      return function(input, start) {
          start = +start; //parse to int
          return input.slice(start);
      }
  });

})();

(function() {
  'use strict';

  angular
    .module('minhaIgrejaApp', ['ngAnimate', 'ngAria', 'ngCookies', 'ngMessages', 'ngResource', 'ngRoute', 'ngSanitize', 'ngMaterial',
      'ui.router', 'sasrio.angular-material-sidenav', 'dashboards', 'memberships','minhaIgrejaApp.auth', 'minhaIgrejaApp.customControls', 'login'
    ])
    .config(themeConfig)
    .config(routerConfig)
    .config(sideBarConfig)
    .run(appRun);

    themeConfig.$inject = ['$mdThemingProvider', '$mdIconProvider'];

    function themeConfig($mdThemingProvider, $mdIconProvider) {
      $mdIconProvider.defaultIconSet('./assets/svg/mdi.svg');
      $mdThemingProvider.theme('default')
        .primaryPalette('light-blue')
        .accentPalette('amber');

    }

    routerConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$httpProvider'];

    function routerConfig($stateProvider, $urlRouterProvider, $httpProvider) {
      $urlRouterProvider.otherwise("/");
      $httpProvider.interceptors.push('AuthInterceptor');
      $stateProvider
        .state({
          name: 'app',
          abstract: true,
          views: {
            'allContent': {
              templateUrl: './src/app.html',
              controller: 'AppController',
              controllerAs: 'appCtrl'
            }
          },
        })
        .state('login', {
          url: "/login",
          views: {
            'allContent': {
              templateUrl: './src/login/login.html',
              controller: 'LoginController',
              controllerAs: 'login'
            }

          }
        })
        .state('app.dashboard', {
          url: "/",
          views: {
            'mainView': {
              templateUrl: './src/dashboards/dashboard.html',
              controller: 'DashboardController',
              controllerAs: 'vm'
            }

          }
        })
        .state('app.memberships', {
          url: "/memberships",
          authenticate: false,
          views: {
            'mainView': {
              templateUrl: './src/memberships/memberships.html',
              controller: 'MembershipController',
              controllerAs: 'vm'
            }
          }
        })
        .state('app.edit-membership', {
          url: "/memberships/:membershipId",
          authenticate: false,
          views: {
            'mainView': {
              templateUrl: './src/memberships/edit/editForm.html',
              controller: 'MembershipEditController',
              controllerAs: 'vm'
            },
            'toolbarView': {
              templateUrl: './src/memberships/edit/toolbar.html',
              controller: 'MembershipEditController',
              controllerAs: 'vm'
            }
          }
        });

    }

    appRun.$inject = ['$rootScope', '$location', 'Auth'];
    function appRun($rootScope, $location, Auth) {
      // Redirect to login if route requires auth and you're not logged in
      $rootScope.$on('$stateChangeStart', function(event, next) {
        if (!next.authenticate) {
          return;
        }

        Auth.isLoggedInAsync(function(loggedIn) {
          if (!loggedIn || next.role && !Auth.hasRole(next.role)) {
            //$location.path('/');
            event.preventDefault();
             $rootScope.$evalAsync(function() {
               $location.path('/login');
             });
          }
        });
      });
    }

    sideBarConfig.$inject = ['$mdThemingProvider', 'ssSideNavSectionsProvider'];
    function sideBarConfig($mdThemingProvider, ssSideNavSectionsProvider) {
      ssSideNavSectionsProvider.initWithTheme($mdThemingProvider);
      ssSideNavSectionsProvider.initWithSections([{
        id: 'membership',
        name: 'Membros',
        state: 'app.memberships',
        type: 'link'
      }]);
    }
})();

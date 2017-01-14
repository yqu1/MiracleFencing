'use strict';

angular.module('fencingApp', ['ui.router', 'ngDialog', 'ngResource', 'ui.materialize', 'ngSanitize'])
.config(function($stateProvider, $urlRouterProvider) {
	$stateProvider

		.state('app', {
			url: '/',
			views: {
				'header': {
					templateUrl: 'views/mainheader.html',
					controller: 'fencingController'
				},
				'content': {
					templateUrl: 'views/main.html',
					controller: 'fencingController'
				},
				'footer': {
					templateUrl: 'views/footer.html'
				}
			}
		})

		.state('app.schedule', {
			url: 'schedule',
			views: {
				'content@': {
					templateUrl: 'views/schedule.html',
				}
			}
		})

		.state('app.login', {
			url: 'login',
			views: {
				'content@': {
					templateUrl: 'views/registration/login.html',
					controller: 'loginController'
				}
			}
		})

		.state('app.resources', {
			url: 'resources',
			views: {
				'content@': {
					templateUrl: 'views/resources.html',
				}
			}
		})


	$urlRouterProvider.otherwise('/');
})
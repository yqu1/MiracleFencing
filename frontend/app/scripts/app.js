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
			},
			authenticate: false
		})

		.state('app.schedule', {
			url: 'schedule',
			views: {
				'content@': {
					templateUrl: 'views/schedule.html',
				}
			},
			authenticate: false
		})

		.state('app.login', {
			url: 'login',
			views: {
				'content@': {
					templateUrl: 'views/registration/login.html',
					controller: 'loginController'
				}
			},
			authenticate: false
		})

		.state('app.signup', {
			url: 'signup',
			views: {
				'content@': {
					templateUrl: 'views/registration/signup.html',
					controller: 'signupController'
				}
			},
			authenticate: false
		})

		.state('app.resources', {
			url: 'resources',
			views: {
				'content@': {
					templateUrl: 'views/resources.html',
				}
			},
			authenticate: false
		})

		.state('app.duels', {
			url: 'duels',
			views: {
				'content@': {
					templateUrl: 'views/duels.html',
					controller: 'duelController'
				}
			},
			authenticate: true
		})

		.state('app.reg', {
					url: 'register',
					views: {
						'content@': {
							templateUrl: 'views/register.html',
							controller: 'regController'
						}
					},
					authenticate: false
				})

	$urlRouterProvider.otherwise('/');
})
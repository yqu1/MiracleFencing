'use strict';

angular.module('fencingApp', ['ui.router', 'ngDialog', 'ngResource'])
.config(function($stateProvider, $urlRouterProvider) {
	$stateProvider

		.state('app', {
			url: '/',
			views: {
				'header': {
					templateUrl: 'views/mainheader.html'
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


	$urlRouterProvider.otherwise('/');
})
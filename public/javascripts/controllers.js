'use strict';
angular.module('app.controllers', ['ngResource','ngCookies']);

var GlobalCtrl = ['$scope', '$resource', '$location', '$window', '$routeParams', '$cookies', '$route', function($scope,$resource,$location,$window,$routeParams,$cookies,$route){
	$scope.Settings = $resource('/resources/settings')
	$scope.location = $location
	$scope.resource = $resource
	$scope.route = $routeParams
	$scope.Math = $window.Math
	$scope.stats = function(metric, type){
		$scope.Stats.save({type:metric}, {ref: type}, function(response){
			//console.log(response);
		});
	}
	$scope.Settings.get({}, function(settings)	{ 
		$scope.settings = settings
		, $scope.Stats = $scope.resource('/resources/stats/:type', {_csrf: $cookies['csrf.token']})
		, $scope.Login = $scope.resource('/api/login', {_csrf: $cookies['csrf.token']}); 
	});
}];

var MainCtrl = ['$scope', function($scope){
}];

var LoginCtrl = ['$scope', '$window' , function($scope, $window){
	var prevUrl = $scope.location.$$search.url;
	$scope.loginSubmit = function(){
		$scope.Login.save(	{}
							, { username: $scope.username
							, password: $scope.password }
							, function(resp){
								if (resp.error === undefined){
									(prevUrl === undefined) ? $scope.location.path('/admin') : $window.location.href = prevUrl;
								} 
		});
	}
}];
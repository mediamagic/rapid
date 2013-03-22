'use strict';
angular.module('rapid.controllers', ['ngResource','ngCookies']);

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
		, $scope.Login = $scope.resource('/api/login', {_csrf: $cookies['csrf.token']})
		, $scope.Articles = $scope.resource('/resources/articles/:id')
	});
	$scope.filters = { category: 'all' }
}];

var MainCtrl = ['$scope', function($scope){
	$scope.getCategory = function(item){
		if ($scope.filters.category === '')
			return item;
		if( item.categories[$scope.filters.category] != undefined)
			return item;
	}
	$scope.orderCategory = function(item){
		return parseInt(item.categories[$scope.filters.category]);
	}
	$scope.Articles.query({}, function(resp){
		$scope.articles = resp;
	});
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
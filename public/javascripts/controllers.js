'use strict';
angular.module('rapid.controllers', ['ngResource','ngCookies', 'ui']);

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
	});
	$scope.filters = { category: 'all' }
}];

var MainCtrl = ['$scope', function($scope){
	$scope.Articles 		= $scope.resource('/resources/articles/:id')
	$scope.contentLoaded 	= false;

	$scope.getCategory = function(index){
		var item 	= $scope.articles[index]
			, arr 	= []
			, cat = $scope.filters.category
		arr.push('size'+item.preview.size);
		if (item.categories[cat] >= $scope.articles.length)
			arr.push('disabled');
		(item.preview.link.type == 'none') ? 
			arr.push('unlinked') : arr.push('linked')
		return arr;
	}

	$scope.Articles.query({}, function(resp){
		var cats = $scope.settings.categories
			, l = resp.length
		for (var cat in resp){
			var itm = resp[cat];
			for (var i = 0;i<cats.length;i++){
				var c = cats[i];
				if (itm.categories[c] == undefined) {
					itm.categories[c] = l;
					l++
				}
			}
		}
		$scope.articles = resp;
		$scope.contentLoaded = true;
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
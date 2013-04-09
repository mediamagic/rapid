'use strict';

angular.module  ( 'rapid.controllers'
				, 	[ 'ngResource'
					,'ngCookies'
					, 'ui' ] );

var GlobalCtrl= [ '$scope'
				, '$resource'
				, '$location'
				, '$window'
				, '$cookies'
				, '$http'
				, function ( $scope, $resource, $location, $window, $cookies, $http ) {
	$scope.Settings 	= $resource('/resources/settings')
	$scope.location 	= $location
	$scope.resource 	= $resource
	$scope.Settings.get({}, function(settings)	{ 
		$scope.settings = settings
		, $scope.Login 	= $scope.resource 	( '/api/login', { _csrf: encodeURIComponent($cookies['csrf.token']) } )
		$scope.$broadcast('settings_loaded');
		var cts 		= settings.categories
			, dfc 		= settings.defaultCategory
			, ct 		= (cts[dfc] != undefined) ? dfc : 'all';
		$scope.filters 	= { category: ct }
	});

	$scope.form 	= 	{ firstname: ''
						, lastname: ''
						, phone: ''
						, email: ''
						, type: 'private' }

	$scope.formReset = angular.copy($scope.form);

	$scope.formSubmit = function(a){
		if (a.leadForm.$invalid) {
			return a.leadForm.$setDirty();
		}
		$http.post('/resources/leads?_csrf='+encodeURIComponent($cookies['csrf.token']), $scope.form)
			.success(function ( data, status, headers, config ) {
				$window.alert('תודה, פנייתך התקבלה. נציגנו יחזרו אליך בהקדם');
				$scope.form = angular.copy($scope.formReset);
				var img = new Image();
				img.src = 'http://www.googleadservices.com/pagead/conversion/1000078520/?value=0&amp;label=gyfkCMCq2wMQuPnv3AM&amp;guid=ON&amp;script=0';
				return false;
			})
			.error(function (data, status, headers, config) {
				return false;
			});
	}
	$scope.global = {
		showForm :false
	}
}];

var MainCtrl = ['$scope', function ( $scope ){
	$scope.Articles 		= $scope.resource('/resources/articles/:id')
	$scope.contentLoaded 	= false;

	$scope.$on('settings_loaded', function(){
		$scope.getCategory = function ( index ){
			var item 	= $scope.articles[index]
				, arr 	= []
				, cat = $scope.filters.category
			arr.push('size'+item.preview.size);
			arr.push( (item.categories[cat] > $scope.articles.length) ? 'disabled' : 'enabled');
			arr.push( (item.preview.link.type == 'none') ? 'unlinked' : 'linked');
			return arr;
		}

		$scope.Articles.query({}, function ( resp ){
			var cats = $scope.settings.categories
				, l = resp.length +1;
			for (var cat in resp){
				var itm = resp[cat];
				for (var i in cats){
					if (itm.categories[i] == undefined) {
						itm.categories[i] = l;
						l++
					}
				}
			}
			$scope.articles = resp;
			$scope.contentLoaded = true;
		});
	})

	if ($scope.settings) {
		$scope.$emit('settings_loaded')
	}
}];

var LoginCtrl = ['$scope', '$window' , function ( $scope, $window ){
	var prevUrl = $scope.location.$$search.url;
	$scope.loginSubmit = function (){
		$scope.Login.save(	{}
							, { username: $scope.username
							, password: $scope.password }
							, function(resp){
				if (resp.error === 0){
					$window.location.href = '/admin';
				} 
			});
	}
}];
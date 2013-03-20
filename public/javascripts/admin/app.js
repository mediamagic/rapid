'use strict'; 

angular.module('admin', ['ngResource','ngCookies', 'ui']).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.
		when('/main', {templateUrl: '/views/admin/Main.html', controller: MainCtrl, name:'Main'}).
		when('/lists', {templateUrl: '/views/admin/Lists.html', controller: ListsCtrl, name:'lists'}).		
		when('/settings', {templateUrl: '/views/admin/Settings.html', controller: SettingsCtrl, name:'settings'}).
		when('/nominee/:id/settings', {templateUrl: '/views/admin/EditNominee.html', controller: EditNomineeCtrl, name:'nominee'}).
		when('/voters', {templateUrl: '/views/admin/Voters.html', controller: VotersCtrl, name:'Statistics'}).
		otherwise({redirectTo: '/main'});
}]).
filter('status', function() {
	return function(status) { 		
		if(status) 
			return 'enabled'
		
		return 'disabled';
	}
}).
filter('categories', function() {
	return function(categories) { 		
		var arr = [];

		for(var cat in categories){			
			arr.push(cat);
		}
		
		return arr.join(',');
	}
}).filter('category', function() {
	return function(items, category) { 		
		var arr = [];
		
		for(var item in items){						
			if(items[item].categories[category] != undefined)
				arr.push(items[item])
		}

		return arr;
	}
})
'use strict'; 

angular.module('rapid', ['ngResource', 'ngCookies', 'ui']).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.
		when('/main', {templateUrl: '/views/Main.html', controller: MainCtrl, name:'Main'}).
		when('/login', {templateUrl: '/views/Login.html', controller: LoginCtrl, name: 'Login'}).
		otherwise({redirectTo: '/main'});
}])
.directive('uiIsotope', function() {
 return {
    priority: 0,
    restrict: 'A',
    link: function(scope, elm, attr) {
    	var opts 	= JSON.parse(attr.options)
    	opts.getSortData = {}
    	for (var cat in scope.settings.categories) {
    		var c 	= scope.settings.categories[cat]
    		opts.getSortData[c] = createOrderFn(c);
    	}
    	setTimeout(function(){
    		$(elm).isotope(opts).isotope('reloadItems').isotope({sortBy:'all'});
    	},100)
    	scope.$watch('articles',function(n,o){
    		if (n!=o)
				$(elm).isotope('reloadItems');
    	})
    	scope.$watch('filters.category', function(n,o){
  			$(elm).isotope({sortBy:n});
    	})
    }
  }
})
.directive('isoItem', function() {
 return {
    priority: 0,
    restrict: 'A',
    link: function(scope, elm, attr) {
    	$(elm).bind('click', function(){
    		$(this).removeClass('preview').addClass('open');
    		$(elm).parent().isotope('reLayout', function(){
    			
    		});
    	})
    }
  }
});

//some closure magic
function createOrderFn(cat){
	var c = cat;
	return function(elm){
		var rel = $(elm).attr('rel')
			, tmp =  JSON.parse(rel)
		return parseInt(tmp[c]);
	}
}
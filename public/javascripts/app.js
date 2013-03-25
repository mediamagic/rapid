'use strict'; 

angular.module('rapid', ['ngResource', 'ngCookies', 'ui'])

.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
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
    	var opts = JSON.parse(attr.options)
    	opts.getSortData = {}
    	for (var cat in scope.settings.categories) {
    		var c 	= scope.settings.categories[cat]
    		opts.getSortData[c] = createOrderFn(c);
    	}
    	setTimeout(function(){
    		elm
                .isotope(opts)
                .isotope('reloadItems')
                .isotope({sortBy:'all'});
    	},100)
    	scope.$watch('articles',function(n,o){
    		if (n!=o)
				elm.isotope('reloadItems');
    	})
    	scope.$watch('filters.category', function(n,o){
  			elm.isotope({sortBy:n});
    	})
    }
  }
})

.directive('isoItem', function() {
    return {
        priority: 0,
        restrict: 'A',
        link: function(scope, elm, attr) {
            var itemIndex   = scope.$index
                , article   = scope.articles[itemIndex]
                , preview   = elm.children('.preview')
            createPreview(preview, article);
        }
    }
})


//some closure magic
function createOrderFn(cat){
	var c = cat;
	return function(elm){
		var rel   = $(elm).attr('rel')
			, tmp =  JSON.parse(rel)
		return parseInt(tmp[c]);
	}
}

function createPreview(elm, obj){
    var content = createContent(obj)
        , html  = '';
    switch(obj.preview.type) {
        case 'flash':
            break;
        case 'iframe':
            break;
        case 'image':
            break;
        case 'text':
        default:
            html = obj.preview.content;
            break;
    }
    elm
        .html(html)
        .css('background', obj.bgColor)
        .bind('click', function(){
            $('.close').click()
            elm
                .hide()
                .parent()
                .append(content.show())
                .parent()
                .isotope('reLayout');
        });
}

function createContent(obj){
    var elm = $('<div class="content"><div class="close">X</div></div>')
        , content = obj.content
        , html  = '';
    switch(content.type) {
        case 'flash':
            break;
        case 'iframe':
            break;
        case 'image':
            break;
        case 'text':
        default:
            html = content.content;
            break;
    }
    elm.
        append(html)
        .css('background', content.bgColor)
        .show()
        .children('.close')
        .bind('click', function(){
            elm.hide().siblings('.preview').show();
            elm
                .parent()
                .parent()
                .isotope('reLayout');
        })
    return elm;
}
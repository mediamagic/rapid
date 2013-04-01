'use strict'; 
angular.module('admin', ['ngResource','ngCookies', 'ui', 'ui.bootstrap']).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.
		when('/main', {templateUrl: '/views/admin/Main.html', controller: MainCtrl, name:'Main'}).
		when('/lists', {templateUrl: '/views/admin/Lists.html', controller: ListsCtrl, name:'Lists'}).		
		when('/editor', {templateUrl: '/views/admin/editor.html', controller: EditorCtrl, name:'Editor'}).
		when('/editor/:id', {templateUrl: '/views/admin/editor.html', controller: EditorCtrl, name:'Editor'}).
    when('/swfs', {templateUrl: '/views/admin/swfs.html', controller: SwfsCtrl, name:'Flash Resources'}).
    when('/categories', {templateUrl: '/views/admin/categories.html', controller: CategoriesCtrl, name:'Categories Manager'}).
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
			if(this.settings.categories[cat])
        arr.push(this.getCategoryName(cat))
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
}).filter('remove', function() {
  return function(items, category) {
    var obj = {};
    var isArray = false;

    if( Object.prototype.toString.call(items) === '[object Array]') {
      obj = [];
      isArray = true;
    }
    
    for(var item in items){   
      if(isArray) {
        if(items[item] !== category)
          obj.push(items[item])
      } else {        
        if(item !== category)
          obj[item] = items[item];
      }
    }    

    return obj;
  }
}).
filter('contentType', function() {
  return function(item) {     
    return item.preview.link.type == 'none' ? 'none' : item.preview.link.type == 'external' ? 'external' : item.content.type;
  }
}).filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
}).filter('articlesFilter', function() {
    return function(articles) {
        var input = [];
        var filters = this.filters;        

        for(var i in articles) {
          var article = articles[i];          

          var valid = {
                        text:false,
                        preview:false,
                        content:false,
                        status:false,
                        categories:false
          }

          var regex = new RegExp(filters.text, "gi");          

          if(filters.text.length == 0 || article.name.match(regex) || article.sidebar.title.match(regex) || article.sidebar.description.match(regex))
            valid.text = true;

          if(filters.preview == 0 || filters.preview == article.preview.type) 
            valid.preview = true;

          if(filters.content == 0 || (article.preview.link.type == "inner" && filters.content == article.content.type))
            valid.content = true;

          if(filters.status == 0 || filters.status == article.status.toString())
            valid.status = true;

          for(var cat in filters.categories) {                        
              if(article.categories[filters.categories[cat]] >= 0) {
                valid.categories = true;
                break;
              }            
          }
          
          if(valid.text && valid.preview && valid.content && valid.categories && valid.status)
            input.push(article)
        }

        this.pagination.main.pages = Math.ceil(input.length / this.pagination.main.total);

        return input;
    }
}).
directive('isoGallery', function(){
    return {
        priority: 0,
        restrict: 'A',
        link: function(scope, elm, attr) {          
            setTimeout(function(){
                var options = JSON.parse(elm.attr('iso-gallery'));
                elm.slidesjs({
                    width: parseInt(options.width),
                    height: parseInt(options.height),
                    navigation: {active: false},
                    play: {
                        auto: true
                    }
                })
            },100);
        }
    }
}).directive('uiIsotope', function() {
 return {
    priority: 0,
    restrict: 'A',
    link: function(scope, elm, attr) {

      var opts = JSON.parse(attr.options)
      opts.getSortData = {}
      for (var cat in scope.categories) {
        var c   = scope.categories[cat]
        opts.getSortData[c] = createOrderFn(c);
      }
      setTimeout(function(){
        elm
                .isotope(opts)
                .isotope('reloadItems')
                .isotope({sortBy:scope.filter.category});                
      },100)
      scope.$watch('isotopeContent.copy',function(n,o){
        if (n!=o && n != undefined) {
          setTimeout(function(){                    
            elm.isotope('reloadItems').isotope({sortBy:scope.filter.category});          
          },1);
        }
      }, true)
      scope.$watch('filter.category', function(n,o){        
        if (n!=o && n != undefined && scope.filter.category != 0) {          
          elm.isotope({sortBy:n});          
        }
      }, true)
    }
  }
 });

angular.module('ui.directives').directive('uiSortable', [
'ui.config', function(uiConfig) {
  var options;
  options = {};
  if (uiConfig.sortable != null) {
    angular.extend(options, uiConfig.sortable);
  }
  return {
    require: '?ngModel',
    link: function(scope, element, attrs, ngModel) {
      var onStart, onUpdate, opts, _start, _update;
      opts = angular.extend({}, options, scope.$eval(attrs.uiSortable));
      if (ngModel != null) {
        onStart = function(e, ui) {
          return ui.item.data('ui-sortable-start', ui.item.index());
        };
        onUpdate = function(e, ui) {
          var end, start;
          start = ui.item.data('ui-sortable-start');
          end = ui.item.index();
          ngModel.$modelValue.splice(end, 0, ngModel.$modelValue.splice(start, 1)[0]);
          return scope.$apply();
        };
        if (opts.start != null) {
          _start = opts.start;
          opts.start = function(e, ui) {
            onStart(e, ui);
            _start(e, ui);
            return scope.$apply();
          };
        } else {
          opts.start = onStart;
        }
        if (opts.update != null) {
          _update = opts.update;
          opts.update = function(e, ui) {
            onUpdate(e, ui);
            _update(e, ui);
            return scope.$apply();
          };
        } else {
          opts.update = onUpdate;
        }
      }
      return element.sortable(opts);
    }
  };
}
]);

function createOrderFn(cat){
  var c = cat;
  return function(elm){      
    var rel   = $(elm).attr('rel')
      , tmp =  JSON.parse(rel)
    return parseInt(tmp[c]);
  }
}
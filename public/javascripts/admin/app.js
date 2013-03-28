'use strict'; 
angular.module('admin', ['ngResource','ngCookies', 'ui', 'ui.bootstrap']).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider.
		when('/main', {templateUrl: '/views/admin/Main.html', controller: MainCtrl, name:'Main'}).
		when('/lists', {templateUrl: '/views/admin/Lists.html', controller: ListsCtrl, name:'Lists'}).		
		when('/editor', {templateUrl: '/views/admin/editor.html', controller: EditorCtrl, name:'Editor'}).
		when('/editor/:id', {templateUrl: '/views/admin/editor.html', controller: EditorCtrl, name:'Editor'}).
    when('/swfs', {templateUrl: '/views/admin/swfs.html', controller: SwfsCtrl, name:'Flash Resources'}).
		//when('/settings', {templateUrl: '/views/admin/Settings.html', controller: SettingsCtrl, name:'settings'}).		
		//when('/voters', {templateUrl: '/views/admin/Voters.html', controller: VotersCtrl, name:'Statistics'}).
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

// angular.module('ui.directives').directive('uiTinymce', ['ui.config', function (uiConfig) {
//   uiConfig.tinymce = uiConfig.tinymce || {};
//   return {
//     require: 'ngModel',
//     link: function (scope, elm, attrs, ngModel) {
//       scope.$watch('editor.tinymceOptions', function(n,o) {          
//           if(n != o && n != undefined) {
//             elm.tinymce(scope.editor.tinymceOptions);
//           }          
//       });
//       var expression,
//         options = {
//           // Update model on button click
//           onchange_callback: function (inst) {
//             if (inst.isDirty()) {
//               inst.save();
//               ngModel.$setViewValue(elm.val());
//               if (!scope.$$phase)
//                 scope.$apply();
//             }
//           },
//           // Update model on keypress
//           handle_event_callback: function (e) {
//             if (this.isDirty()) {
//               this.save();
//               ngModel.$setViewValue(elm.val());
//               if (!scope.$$phase)
//                 scope.$apply();
//             }
//             return true; // Continue handling
//           },
//           // Update model when calling setContent (such as from the source editor popup)
//           setup: function (ed) {
//             ed.onSetContent.add(function (ed, o) {
//               if (ed.isDirty()) {
//                 ed.save();
//                 ngModel.$setViewValue(elm.val());
//                 if (!scope.$$phase)
//                   scope.$apply();
//               }
//             });
//           }
//         };
//       if (attrs.uiTinymce) {
//         expression = scope.$eval(attrs.uiTinymce);
//       } else {
//         expression = {};
//       }
//       angular.extend(options, uiConfig.tinymce, expression);
//       setTimeout(function () {
//         elm.tinymce(options);
//       });
//     }
//   };
// }]);
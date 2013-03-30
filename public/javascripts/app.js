'use strict'; 

angular.module('rapid', ['ngResource', 'ngCookies', 'ui'])

.config(['$routeProvider'
        , '$locationProvider'
        , function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/main',  { templateUrl: '/views/Main.html'
                        , controller: MainCtrl, name:'Main' })
		.when('/login', { templateUrl: '/views/Login.html'
                        , controller: LoginCtrl, name: 'Login' })
		. otherwise(    { redirectTo: '/main' })
}])

.directive('uiIsotope', function() {
 return {
    priority: 0,
    restrict: 'A',
    link: function(scope, elm, attr) {

    	var opts = JSON.parse(attr.options)
    	opts.getSortData = {}
    	for (var cat in scope.settings.categories) {
    		var c 	= cat
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

.directive('isoItem', ['$compile', function(compile) {
    var staticForm = createForm();
    return {
        priority: 100,
        restrict: 'A',
        link: function(scope, elm, attr) {
            var itemIndex   = scope.$index
                , article   = scope.articles[itemIndex]
                , preview   = elm.children('.preview')
            article.index = itemIndex;
            article.form = staticForm;
            var element = createPreview(preview, article);
            compile(element.contents())(scope);
        }
    }
}])

.directive('isoGallery', function(){
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
                        auto: true,
                        restartDelay: 1000
                    }
                })
            },100);
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
    var html  = ''
        , d = obj.preview.size.split('x')
        , dim = { width:  d[0]*220 + ((d[0]-1)*20)
                , height: d[1]*220 + ((d[1]-1)*20) }
        , content = (obj.preview.link.type != 'none') 
            ? createContent(obj) : ''
    switch(obj.preview.type) {
        case 'flash':
            var w = $('<div></div>')
            w.flash({ swf: '/images/swfs/'+obj.preview.content
                    , width: dim.width
                    , height: dim.height
                    , wmode: 'transparent'
                    , allowFullScreen: false })
            html = w;
            break;
        case 'iframe':
            var w       = $('<iframe></iframe>')
                , src   = obj.preview.content
                , attrs =   { scrolling: 'no'
                            , frameborder: 0
                            , width: dim.width
                            , height: dim.height
                            , src: src }
            w.attr(attrs);
            html = w;
            break;
        case 'image':
            var w   = $('<div></div>')
                , c = obj.preview.content
            if (c.length > 1)
                w.attr('iso-gallery', JSON.stringify(dim))
            for(var i=0;i<c.length;i++){
                var img = $('<img />');
                img
                    .attr('src', '/images/imgs/'+c[i].hashName)
                    .appendTo(w);
            }
            html = w;
            break;
        case 'text':
        default:
            html = obj.preview.content;
            break;
    }
    elm
        .html(html)
        .css('background', obj.preview.bgColor)
        .siblings('.bind')
        .bind('click', function(){
            if (obj.preview.link.type == 'inner') {
                $('.close').click()
                elm
                    .hide()
                    .parent()
                    .removeClass('preview')
                    .addClass('content')
                    .append(content.show())
                    .parent()
                    .isotope('reLayout', function(){
                        var scrollItem = $('#item_'+obj.index).offset()
                            , anim = { scrollTop: scrollItem.top - 190}
                        $("html, body")
                            .animate(anim);
                    });
                    $('.article.preview').addClass('masked');
            } else {
                var win=window.open(obj.preview.link.url, '_blank');
                win.focus();
            }
        })
        .parent()
        .addClass('preview')
    return elm;
}

function createContent(obj){
    var elm = $('<div class="content"></div>')
        , content = obj.content
        , html  = ''
        , sideBar = createSidebar(obj.sidebar)
        , closeElm = $('<div></div>')
        , contentBar = $('<div></div>')
    closeElm
        .addClass('close')
        .html('x סגור')

    elm
        .append(closeElm)
        .append(sideBar)
        .append(contentBar)
        .append(obj.form.clone())
    console.log(obj.form);
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
    $(html).appendTo(contentBar);
    elm
        .css('background', obj.content.bgColor)
        .show()
        .children('.close')
        .bind('click', function(){
            elm
                .hide()
                .siblings('.preview')
                .show();
            elm
                .parent()
                .addClass('preview')
                .removeClass('content')
                .parent()
                .isotope('reLayout', function(){
                });
                $('.article.masked')
                    .removeClass('masked');
        })
    return elm;
}


function createSidebar(obj){
    var sidebar     = $('<div></div>')
        , title     = $('<div></div>')
        , content   = $('<div></div>')
        , link      = $('<a></a>')
    title
        .addClass('title')
        .html(obj.title)
        .appendTo(sidebar)
    content
        .addClass('content')
        .html(obj.description)
        .appendTo(sidebar)
    var attrs = { href: obj.readMore.url
                , target: '_blank' }
    link
        .addClass('link')
        .html(obj.readMore.title)
        .attr(attrs)
        .appendTo(sidebar)
    return sidebar
}

function createForm(){
    var elm     = $('<div></div>')
        , form  = $('<form></form>')
        , input = $('<input />')
        , names =   { firstname:{ type: 'text'
                                , placeholder: 'first name' 
                                , required: ''
                                , name: 'firstname' }
                    , lastname: { type: 'text'
                                , placeholder: 'last name' 
                                , required: ''
                                , name: 'lastname' } 
                    , phone:    { type: 'phone'
                                , placeholder: 'phone' 
                                , required: ''
                                , name: 'phone' }
                    , email:    { type: 'email'
                                , placeholder: 'email' 
                                , required: ''
                                , name: 'email' }
                    , priv:     { type: 'radio'
                                , placeholder: 'first name' 
                                , name: 'type'
                                , value: 'private' }
                    , business: { type: 'radio'
                                , placeholder: 'first name' 
                                , name: 'type'
                                , value: 'business' }
                    , submit:   { type: 'submit'
                                , value: 'submit' } }

    for (var i in names){
        var inputelm    = input.clone();
        inputelm
            .attr(names[i])
            .appendTo(form)
    }
    form
        .appendTo(elm);
    elm
        .addClass('form')

    return elm
}
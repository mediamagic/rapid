'use strict'; 

var staticForm = '';

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
.directive('uiIsotope', ['$compile', function(compile) {
 return {
    priority: 0,
    restrict: 'A',
    link: function(scope, elm, attr) {
    	var opts = JSON.parse(attr.options)
        staticForm = $('.form').clone();
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
        compile(staticForm)(scope);
    }
  }
}])

.directive('isoItem', ['$compile', function(compile) {
    return {
        priority: 100,
        restrict: 'A',
        link: function(scope, elm, attr) {
            var itemIndex   = scope.$index
                , article   = scope.articles[itemIndex]
                , preview   = elm.children('.preview')
            article.index = itemIndex;
            article.form = staticForm;
            article.compile = compile;
            article.scope = scope;
            var element = createPreview(preview, article);
            if (article.preview.type == 'flash' 
                || article.content.type == 'flash'){
                elm.addClass('hidden-phone hidden-tablet')
            }
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

.directive('totop', function(){
    return {
        priority:0,
        restrict: 'C',
        link: function(scope, elm, attr) {
            elm.bind('click', function(){
                var anim = { scrollTop: 0}
                $("html, body")
                    .animate(anim);
            })

            $(window).scroll(function(){
                var par = $(elm).parent()
                    , win = $(window)
                    , doc = $(document)
                    , coord =  par.width() 
                            - $(elm).width() 
                            + par.offset().left 
                            - 9
                    , top = win.scrollTop()
                    , port = win.height()
                    , height=  doc.height()
                    , footer = $('#footer').height()
                    , bottom = height-(top+port)
                    , css = { position: 'fixed'
                            , bottom: 20+footer
                            , left:  coord }
                if (port+top+20 == height) {
                    css.bottom = 20+footer;
                    $(elm)
                        .css(css)
                } else if (bottom-20 < footer) {
                    css.bottom = 20+footer+bottom;
                    $(elm)
                        .css(css)
                } else {
                    css.bottom = 0;
                    $(elm)
                        .css(css)
                }
            });
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
    html = parseContent(obj, dim, 'preview');
    elm
        .html(html)
        .css('background', obj.preview.bgColor)
        .parent()
        .addClass('preview')
        if (obj.preview.link.type == 'inner') {
            elm
                .siblings('.bind')
                .bind('click', function(){
                    $('.close').click()
                    var content = (obj.preview.link.type != 'none') 
                        ? createContent(obj) : ''
                    elm
                        .hide()
                        .parent()
                        .removeClass('preview')
                        .addClass('content')
                        .append(content.append(obj.form))
                        .show()
                        .parent()
                        .isotope('reLayout', function(){
                            var scrollItem = $('#item_'+obj.index).offset()
                                , anim = { scrollTop: scrollItem.top - 190}
                            $("html, body")
                                .animate(anim);
                        });
                        $('.article.preview').addClass('masked');
                })
        } else {
            elm
                .siblings('.bind')
                .bind('click', function(){
                    var win=window.open(obj.preview.link.url, '_blank');
                    win.focus();
                })
        }
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
    html = parseContent(obj,null,'content');
    contentBar.addClass('inner')
    contentBar.append(html)
    elm
        .css('background', obj.content.bgColor)
        .show(500)
        .children('.close')
        .bind('click', function(){
            elm
                .hide(500, function(){
                    $(this)
                        .html('')
                        .siblings('.preview')
                        .show()
                        .parent()
                        .addClass('preview')
                        .removeClass('content')
                        .parent()
                        .isotope('reLayout', function(){
                        });
                        $('.article.masked')
                            .removeClass('masked');
                        })
                })
    return elm;
}


function createSidebar(obj){
    var sidebar     = $('<div></div>')
        , divider   = $('<div></div>')
        , title     = $('<div></div>')
        , content   = $('<pre></pre>')
        , link      = $('<a></a>')
    sidebar.addClass('sidebar');

    divider
        .addClass('divider')
        .appendTo(sidebar)
    title
        .addClass('title')
        .html(obj.title)
        .appendTo(sidebar)
    content
        .addClass('description')
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

function parseContent(obj, dim, type){
    var html =''
        , content = obj[type].content;
    if (type === 'content')
        dim =   { width: '100%'
                , height: '100%' }
    switch(obj[type].type) {
        case 'flash':
            var w = $('<div class="flash"></div>')
            w.flash({ swf: '/images/swfs/'+content
                    , width: dim.width
                    , height: dim.height
                    , wmode: 'transparent'
                    , allowFullScreen: false })
            html = w;
            break;
        case 'iframe':
            var w       = $('<iframe class="iframe"></iframe>')
                , src   = content
                , attrs =   { scrolling: 'no'
                            , frameborder: 0
                            , width: dim.width
                            , height: dim.height
                            , src: src }
            w.attr(attrs);
            html = w;
            break;
        case 'image':
            var w   = $('<div class="image"></div>')
                , c = content
            if (c.length > 1) {
                console.log('more than one!');
                w.attr('iso-gallery', JSON.stringify(dim))
            }
            for(var i=0;i<c.length;i++){
                var img = $('<img />');
                img
                    .attr('src', '/images/imgs/'+c[i].hashName)
                    .appendTo(w);
            }
            html = obj.compile(w)(obj.scope);
            break;
        case 'video':
            var w       =   $('<iframe class="video"></iframe>')
                , src   =   '//www.youtube.com/embed/'+
                            content+
                            '?feature=oembed&autoplay=1&rel=0&wmode=transparent'
                , attrs =   { scrolling: 'no'
                            , frameborder: 0
                            , src: src }
            w.attr(attrs);
            html = w;
            break;
        case 'text':
        default:
                var wrapper = $('<html />')
                    , style = $('<link  />')
                        .attr(  { 'type': "text/css"
                                , 'rel': "stylesheet"
                                , 'href': "http://localhost:8080/stylesheets/tinyFonts.css" })
                    , head  = $('<head />')
                    , wrap  = $('<body />')
                        .attr('dir', 'rtl')
                style
                    .appendTo(head)
                wrap
                    .append(content)
                wrapper
                    .append(head)
                    .append(wrap)
                var iframe  = $('<iframe />')
                    .attr(  { 'frameborder':0
                            , style:"padding:0;border:none"
                            , scrolling: 'no'
                            , src: 'data:text/html;charset=utf-8,' + wrapper.html()
                        })
                    .attr('class', (obj[type].size || 'text' ))
            html = iframe;
            break;
    }
    return html;
}
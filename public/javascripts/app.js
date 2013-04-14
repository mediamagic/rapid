'use strict'; 

(function($) {
    var re = /([^&=]+)=?([^&]*)/g;
    var decode = function(str) {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    };
    $.parseParams = function(query) {
        var params = {}, e;
        if (query) {
            if (query.substr(0, 1) == '?') {
                query = query.substr(1);
            }

            while (e = re.exec(query)) {
                var k = decode(e[1]);
                var v = decode(e[2]);
                if (params[k] !== undefined) {
                    if (!$.isArray(params[k])) {
                        params[k] = [params[k]];
                    }
                    params[k].push(v);
                } else {
                    params[k] = v;
                }
            }
        }
        return params;
    };
})(jQuery);

var staticForm  = ''
    , host      = window.document.location.protocol+
                    '//'+window.document.location.host
    , ifr       = $('<html />')
    , style = $('<link  />')
        .attr(  { 'type': "text/css"
                , 'rel': "stylesheet"
                , 'href': "/stylesheets/tinyFonts.css" })
                , head  = $('<head />')
                , wrap  = $('<body />')
                    .attr('dir', 'rtl')
                , base = $('<base />')
                    .attr('href', host)
                base
                    .appendTo(head)
                style
                    .appendTo(head)
                ifr
                    .append(head)
                    .append(wrap)


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
            var dfc = scope.settings.defaultCategory
                , cts = scope.settings.categories
                , ct = (cts[dfc] != undefined) ? ct : 'all';
    		elm
                .isotope(opts)
                .isotope('reloadItems')
                .isotope({sortBy:ct});
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

.directive('toggleForm', function(){
    return {
        priority: 800,
        restrict: 'A',
        scope: false,
        link: function(scope, elm, attr) {
            elm.bind('click', function(){
                if (!scope.global.showForm) {
                    var anim = { scrollTop: 0 }
                    $("html, body")
                        .animate(anim);
                    scope.global.showForm = true;
                    $('#headerForm').show();

                } else {
                    scope.global.showForm = false;
                    $('#headerForm').hide();
                }
            });
        }
    }
})

.directive('totop', function(){
    return {
        priority:0,
        restrict: 'C',
        link: function(scope, elm, attr) {
            elm.bind('click', function(){
                var anim = { scrollTop: 0 }
                $("html, body")
                    .animate(anim);
            })
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
                    //obj.form = $('.form').clone();
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
        .show()
        .children('.close')
        .bind('click', function(){
            elm
                .hide(0, function(){
                    $(this).children('.inner').html('')
                    $(this)
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
                , swfUrl = (content.external) 
                    ? content.fileName : '/images/swfs/'+content.fileName
                , params = $.parseParams(content.params)
            w.flash({ swf: swfUrl
                    , width: dim.width
                    , height: dim.height
                    , wmode: 'transparent'
                    , allowFullScreen: false
                    , vars: params })
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
            var tmp = ifr.clone();
                tmp
                    .children('body')
                    .append(content)
            window.tmp = $('<div>').append(tmp).html();
            var iframe  = $('<iframe />')
                .attr(  { 'frameborder':0
                        , style:"padding:0;border:none"
                        , scrolling: 'no'
                        , src: 'javascript:(function(){document.open();var ht = parent.tmp;document.domain="' + document.domain + '";document.write(ht);document.close();})()'
                        , 'class': (obj[type].size || 'text' ) })
            html = iframe;
            break;
    }
    return html;
}
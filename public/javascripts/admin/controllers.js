'user strict';
angular.module('admin.controllers', ['ngResource', 'ngCookies', 'ui', 'ui.bootstrap']);
var GlobalCtrl = ['$scope', '$compile', '$filter', '$resource', '$location', '$window', '$routeParams','$cookies', function($scope, $compile, $filter, $resource,$location,$window,$routeParams,$cookies){
	$scope.window = $window
	, $scope.showMenu =true
	, $scope.Settings = $resource('/resources/settings', {_csrf: $cookies['csrf.token']}, {update: {method: 'PUT'}})
	, $scope.location = $location
	, $scope.resource = $resource
	, $scope.route = $routeParams
	, $scope.Math = $window.Math
	, $scope.Articles = $scope.resource('/resources/articles/:id', {_csrf: $cookies['csrf.token']}, {update: {method:'PUT'}, updateList: {method:'PUT', isArray:true} })
	//, $scope.Users = $scope.resource('/resources/users/:user/:vote', {_csrf: $cookies['csrf.token']}, {update: {method:'PUT'}})
	//, $scope.Voters = $scope.resource('/resources/voters/:voter', {_csrf: $cookies['csrf.token']})
	, $scope.Stats = $scope.resource('/resources/stats/:type', {_csrf: $cookies['csrf.token']})
	, $scope.Api = $scope.resource('/api/:action/:id', {_csrf: $cookies['csrf.token']});
	$scope.cookies = $cookies;
	$scope.Files = $scope.resource('/api/uploads/:type/:id', {_csrf: $cookies['csrf.token']});

	$scope.host = $scope.location.$$protocol + '://' + $scope.location.$$host + ($scope.location.$$port == 80 ? '' : ':' + $scope.location.$$port) + '/';

	$scope.content = [];
	$scope.isotopeContent = [];	
	$scope.categories = [];
	$scope.category = {};

	$scope.settingsLoaded = false;
	$scope.categoriesLoaded = false;

	$scope.filter = {
		category: 0
	}

	$scope.Settings.get({}, function(settings){
		$scope.settings = settings
		$scope.categories = $scope.settings.categories;// ['family', 'business', 'something', 'someothercat'];	

		$scope.buildArticles(function() {			
			$scope.settingsLoaded = true;
			$scope.$broadcast('SETTINGS_LOADED');
		}, null);
	});

	$scope.pagination = {
							main: {
								pages:1,
					  			page:1,
								total:10
							},
							swfs: {
								pages:1,
					  			page:1,
								total:3
							}
	}

	$scope.setPage = function (pageName, page) {
	    $scope.pagination[pageName].page = page;
  	};

	$scope.buildArticles = function(cb, content) {
		
		if(content) {
			$scope.content = $filter('orderBy')(content, '-_id');
			$scope.isotopeContent = angular.copy($scope.content);
			$scope.splitCategories();
			$scope.category[$scope.filter.category].sort($scope.compare);

			if(cb)
				cb();
		} else {
			$scope.Articles.query({}, function(res) {
				$scope.content = $filter('orderBy')(res, '-_id');
				$scope.isotopeContent = angular.copy($scope.content);
				$scope.splitCategories();

				if(cb)
					cb();
			});
		}
	}

	$scope.safeApply = function(fn) {
	  var phase = this.$root.$$phase;	  
	  if(phase == '$apply' || phase == '$digest') {
	    if(fn && (typeof(fn) === 'function')) {
	      fn();
	    }
	  } else {
	    this.$apply(fn);
	  }
	};

	$scope.compare = function(a,b) {
		a = parseInt(a.categories[$scope.filter.category]);
		b = parseInt(b.categories[$scope.filter.category]);
		if (a < b)
			return -1;
		if (a > b)
			return 1;
		return 0;
	}	

	$scope.splitCategories = function() {	
		$scope.category = {};	

		for(var cat = 0; cat < $scope.categories.length; cat++) {
			$scope.category[$scope.categories[cat]] = angular.copy($scope.content);

			var arr = $scope.category[$scope.categories[cat]];
			var newArr = [];
			for(var i = 0; i < arr.length; i++) {			
				if(arr[i].categories[$scope.categories[cat]] != undefined)
					newArr.push(arr[i]);
			}	

			$scope.category[$scope.categories[cat]] = newArr;			
		}

		$scope.categoriesLoaded = true;
	}

	$scope.editor = {
		defaultData: {
			name:'',
			sidebar: {
						title:'',
						description: '',
						readMore: {
									title:'',
									url: ''
						}
			},		
			categories: {				
			},							
			preview: {
						type:'text',
						link:{
										type:'none',
										url:'',
										text: ''
						},
						content:'',
						size:'1x1',
						bgColor:'#ffffff'										
			},
			content: {
						type:'text',							
						content:'',	
						bgColor:'#ffffff',										
			},		
		},
		data: {

		},
		open: {
			colorPickerClass:'colorPicker_1'			
		},
		closed: {
			colorPickerClass:'colorPicker_1',
			showLinkText: false,
			showLinkUrl: false,
			colorInput:'#ffffff'
		},
		previewDisplay: {
							width:220,
							height:220,
							margin:130,
							content: {
								text:'',
								flash:'',
								iframe:'',
								image:''
							}
		},
		defaultTempContent: {
			preview: {
						text: '<p dir="rtl"></p>',
						video: { 
									id:'',
									icon:'images/disabled.png',
									valid:false
						},
						flash: {
									data:{},
									url:''
						},
						iframe:'',
						image: []
					},
			content: {					
						text: '<p dir="rtl"></p>',
						video: { 
									id:'',
									icon:'images/disabled.png',
									valid:false
						},
						flash: {
									data:{},
									url:''
						},
						iframe:'',
						image: []
					}
		},
		tempContent: {
		},
		categories: [
		],
		files: {
			flash:[],
			images: []
		},		
		tinymceOptions: {
			// General options			
			theme : "advanced",
			plugins : "autolink,lists,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,wordcount,advlist,autosave,visualblocks",

			width: "460",
	  		height: "572",
			//directionality : "rtl",

			theme_advanced_fonts:"Arial=arial,Tahoma=tahoma",

			//content_css : "custom_content.css"

			// Theme options			
			theme_advanced_buttons1 : "newdocument,|,bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,fontselect,fontsizeselect",
			theme_advanced_buttons2 : "cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,blockquote,|,undo,redo",			
			theme_advanced_buttons3 : "link,unlink,image,cleanup,code,|,forecolor,backcolor, | ,charmap,iespell,media,advhr,|,ltr,rtl",
			theme_advanced_buttons4 : "tablecontrols,|,hr,removeformat,visualaid",
			//theme_advanced_toolbar_location : "external",
			theme_advanced_toolbar_location : "top",
			theme_advanced_toolbar_align : "left",
			theme_advanced_statusbar_location : "none",
			theme_advanced_resizing : false

			//onchange_callback:'$scope.tinymceChange'
		}
	}	

	// $scope.tinymceChange = function(elem) {
	// 	console.log('c')
	// }

	// change input color for preview mode in editor
	$scope.$watch('editor.data.preview.bgColor', function(n,o){
		if (n!=o && n!=undefined) {
			$scope.safeApply(function() {
				if(n == '#ffffff') {
					$scope.editor.closed.colorInput = '#000000';
				} else {
					$scope.editor.closed.colorInput = '#ffffff';
				}

				$scope.buildFlash('preview');
			});
		}
	});
	//

	// change the size of preview display by size
	$scope.$watch('editor.data.preview.size', function(n,o){
		if (n!=o && n!=undefined) {
			switch(n) {
				case '1x1':
					$scope.editor.previewDisplay.width = 220;
					$scope.editor.previewDisplay.height = 220;
					$scope.editor.previewDisplay.margin = 130;
				break;
				case '1x2':
					$scope.editor.previewDisplay.width = 220;
					$scope.editor.previewDisplay.height = 460;
					$scope.editor.previewDisplay.margin = 10;
				break;
				case '2x2':
					$scope.editor.previewDisplay.width = 460;
					$scope.editor.previewDisplay.height = 460;
					$scope.editor.previewDisplay.margin = 10;
				break;
				case '2x1':
					$scope.editor.previewDisplay.width = 460;
					$scope.editor.previewDisplay.height = 220;
					$scope.editor.previewDisplay.margin = 130;
				break;
				default:
				break;
			}

			if($scope.editor.data.preview.type == 'flash' && $scope.editor.tempContent.preview.flash.url.length > 0)
				$scope.buildFlash('preview');	

			if($scope.editor.data.preview.type == 'image' && $scope.editor.tempContent.preview.image.length > 0)
				$scope.buildGallery('preview');	
		}		
	});
	//

	$scope.$watch('editor.files.flash.length', function(n,o){
		if (n!=o && n!=undefined)
			$scope.pagination.swfs.pages = Math.ceil(n / $scope.pagination.swfs.total);
	});

	$scope.$watch('content.length', function(n,o){
		if (n!=o && n!=undefined)
			$scope.pagination.main.pages = Math.ceil(n / $scope.pagination.main.total);
	});

	$scope.Files.query({type:'swfs'}, function(res) {
		$scope.editor.files.flash = res;		
	});

	$scope.buildFlash = function(type) {
		if(type == 'preview') {
			var swf =	'<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0" width="' + $scope.editor.previewDisplay.width + '" height="' + $scope.editor.previewDisplay.height + '" id="previewFlash">' +
						'<param name="movie" value="' + $scope.editor.tempContent.preview.flash.url +'" />' + 
						'<param name="quality" value="high" />' +
						'<param name="bgcolor" value="' + $scope.editor.data.preview.bgColor + '" />' +
						'<embed src="' + $scope.editor.tempContent.preview.flash.url +'" quality="high" bgcolor="' + $scope.editor.data.preview.bgColor + '" width="' + $scope.editor.previewDisplay.width + '" height="' + $scope.editor.previewDisplay.height + '" name="previewFlash" align="" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer">' +
						'</embed>' +
						'</object>';
			$scope.editor.previewDisplay.content.flash = swf;
		} else if(type == 'content') {

		}
	}

	$scope.buildGallery = function(type) {
		var wrapper = angular.element('<div></div>');
		if($scope.editor.tempContent.preview.image.length > 1) 
			wrapper.attr('iso-gallery', '{ "width":' + $scope.editor.previewDisplay.width + ', "height":' + $scope.editor.previewDisplay.height + ' }');
		
		for(var image in $scope.editor.tempContent.preview.image) {
			var img = angular.element('<img />');
			img.attr('src', $scope.host + '/images/imgs/' + $scope.editor.tempContent.preview.image[image].hashName);
			img.attr('width', $scope.editor.previewDisplay.width);
			img.attr('height', $scope.editor.previewDisplay.height);
			img.appendTo(wrapper);
		}
					
		$scope.editor.previewDisplay.content.image = wrapper;			
		$compile($scope.editor.previewDisplay.content.image)($scope);	
	}

	$scope.triggerClick = function(div) {		
		$('#' + div).trigger('click');
	}

	$scope.uploading = false;
	$scope.progressBar = '0';
	$scope.uploadprogress = '';

	// $scope.uploadNewSwfResource = function(file) {
		
	// 	$scope.uploading = true;
	// 	var fd = new FormData();
	// 	fd.append('fileName', file);
	// 	fd.append('_csrf', $scope.cookies['csrf.token'])
		
	// 	var xhr = new XMLHttpRequest();      
		
	// 	var imageType = 'application/x-shockwave-flash';
	// 	if(!file.type.match(imageType))
	// 		return alert('only flash (SWF) type allowed!');

	// 	xhr.open("POST", "/api/uploads/swfs" , true);

	// 	xhr.onload = function(e) {			
	// 		var flash = JSON.parse(this.response);

	// 		$scope.safeApply(function() {				
	// 			$scope.editor.files.flash.push(flash);
	// 			$scope.progressBar = '0';
	// 			$scope.uploadprogress = '';
	// 			$scope.uploading = false;
	// 		});
	// 	}

	// 	xhr.upload.onprogress = function(e) {			
	// 		$scope.safeApply(function() {
	// 			if (e.lengthComputable) {
 //     				$scope.progressBar = Math.ceil(((e.loaded / e.total) * 100));
 //     				$scope.uploadprogress = $scope.progressBar + '%';     				
 //     			}
 //     		});
	// 	}

	// 	xhr.send(fd);
	// }

	$scope.uploadNewResource = function(type, fileType, file) {

		$scope.uploading = true;

		var fd = new FormData();
		fd.append('fileName', file);
		fd.append('_csrf', $scope.cookies['csrf.token'])
		
		var xhr = new XMLHttpRequest();        

		if(fileType == 'image') {
			var mimeType = /image.*/;				
			if(!file.type.match(mimeType))
				return alert('only image type allowed!');

			xhr.open("POST", "/api/uploads/images" , true);

			xhr.onload = function(e) {							
				var image = {
					fileName:file.name,
					hashName:JSON.parse(this.response).hashName
					//hashName: $scope.host + 'images/imgs/' + JSON.parse(this.response).hashName
				}

				$scope.safeApply(function() {
					$scope.editor.tempContent[type].image.push(image);
					$scope.progressBar = '0';
					$scope.uploadprogress = '';
					$scope.uploading = false;
				});
			}			
		} else if(fileType == 'flash') {
			var mimeType = 'application/x-shockwave-flash';
			if(!file.type.match(mimeType))
				return alert('only flash (SWF) type allowed!');

			xhr.open("POST", "/api/uploads/swfs" , true);

			xhr.onload = function(e) {
				var flash = JSON.parse(this.response);

				$scope.safeApply(function() {				
					$scope.editor.files.flash.push(flash);
					$scope.progressBar = '0';
					$scope.uploadprogress = '';
					$scope.uploading = false;
				});
			}
		}	

		xhr.onerror = function(e) {
			$scope.safeApply(function() {									
				$scope.progressBar = '0';
				$scope.uploadprogress = '';
				$scope.uploading = false;
			});
		}

		xhr.upload.onprogress = function(e) {
			$scope.safeApply(function() {
				if (e.lengthComputable) {
     				$scope.progressBar = Math.ceil(((e.loaded / e.total) * 100));
     				$scope.uploadprogress = $scope.progressBar + '%';     				
     			}
     		});
		}

		xhr.send(fd);
	}

	$scope.showSelectedSwf = function(type, swf) {
		$scope.editor.tempContent.preview.flash.data = swf.hashName;
	}

	// function createArticle(i){
	// 	 article = { sidebar:  { title:  'title ' + i
	// 	     , description: 'description ' + i
	// 	     , readMore: { title:  'read more ' +i
	// 	        , url:   'http://readmore/' +i } }
	// 	  , preview:  { type:  'text'
	// 	     , link:  { type: 'inner'
	// 	        , url:  'n-a'
	// 	        , text: 'mouse over text' }
	// 	     , content:  'this is the content in html'
	// 	     , size:  '1x1'
	// 	     , bgColor:  '#ffffff' }
	// 	  , content:  { type:  'text'
	// 	     , content:  'this is the inner content in html'
	// 	     , bgColor:  '#ffffff' }
	// 	  , categories:  { all:(i-1), family: (i-1), business: i, other: (i+1) }
	// 	  , status:  true
	// 	  , dateCreated: new Date()
	// 	 }
	// 	 $.ajax({
	// 	  url: '/resources/articles?_csrf=RtXJJh5Stt%2FBRZDi7cgEcr8m',
	// 	  data: article,
	// 	  type: 'POST',
	// 	  success: function(resp){
	// 	   console.log(resp);
	// 	  }
	// 	 })
	// 	}
}];

var MainCtrl = ['$scope', function($scope){
	// $scope.Users.query({}, function(response){
	// 	$scope.users = response;
	// });
	// $scope.Stats.query({type: 'visit'}, function(resp){
	// 	$scope.refs = resp;
	// });
	// $scope.Stats.query({type: 'share'}, function(resp){
	// 	$scope.shares = resp;
	// });

	$scope.toggleStatus = function(id) {				
		var item = null;

		for(var i in $scope.content) {		
			if($scope.content[i]._id == id)	{
				item = $scope.content[i];
				break;
			}
		}
				
		if(item) {
			item.status = !item.status;
			$scope.Articles.update({id:item._id}, { status:item.status }, function(res) { 				
				$scope.splitCategories();
			});
		}
	}

	$scope.itemPreview = function(id) {

	}

	$scope.getDateById = function(id) {
	    return new Date(parseInt(id.toString().slice(0,8), 16)*1000);
	}

	$scope.deleteArticle = function(id) {		
		var confirmText = 'are you sure you want to delete this article ?';
		var item = null;

		for(var i in $scope.content) {		
			if($scope.content[i]._id == id)	{
				item = $scope.content[i];
				break;
			}
		}

		if(item) {
			if(confirm(confirmText)) {	
				$scope.Articles.delete({id:item._id}, function(res) {									
					if(res.error == 0) {					
						$scope.content.splice($scope.content.indexOf(item), 1);
						$scope.splitCategories();
					}
				});
			}
		}
	}
}];

var ListsCtrl = ['$scope', function($scope){
	$scope.filter.category = 0;

	$scope.$watch('filter.category', function(n,o){
		if (n!=o && n!=0 && n!=undefined)
			$scope.category[n].sort($scope.compare);
	});
	
	$scope.showListsSaveButton = true;
	$scope.sortableOptions = {
								update: function(event, ui) {									
									for(var i = 0; i < $scope.category[$scope.filter.category].length; i++) {
										var item = $scope.category[$scope.filter.category][i];
										item.categories[$scope.filter.category] = i;
									}
								},
								start: function(event, ui) {
							        //ui.item.startPos = ui.item.index();							        
							    },
							    stop: function(event, ui) {								    	
							        // console.log("Start position: " + ui.item.startPos);
							        // console.log("New position: " + ui.item.index());							        
							    },
								axis: 'y'
	};	

	// $scope.orderCategories = function(item) {
	// 	var index = parseInt(item.categories[$scope.filter.category]);
	// 	return index;
	// }
	
	$scope.previewNewList = function() {
		$scope.showListsSaveButton = false;
		//$('#listsIsotop').isotope('reloadItems');
	}

	$scope.saveLists = function() {
		var newContent = {};

		for(var cat in $scope.category) {
			var content = $scope.category[cat];
			
			for(var i in content) {
				var item = content[i];
				var contentId = item._id;

				if(newContent[contentId] == undefined)
					newContent[contentId] = {};

				if(item.categories[cat] != undefined)
					newContent[contentId][cat] = item.categories[cat];
			}
		}
		
		// $scope.Articles.updateList({id:'resort'}, newContent, function(res) { 			
		// 	$scope.buildArticles(function() { 
				
		// 	}, res);
		// });
		
		for(var id in newContent) {
			var index = getIndexIfObjWithOwnAttr($scope.content, '_id', id);
			$scope.isotopeContent[index].categories = newContent[id];
			console.log($scope.isotopeContent[index].categories);
			console.log(newContent[id]);
			break;
		}		
	}

	var getIndexIfObjWithOwnAttr = function(array, attr, value) {
	    for(var i = 0; i < array.length; i++) {
	        if(array[i].hasOwnProperty(attr) && array[i][attr] === value) {
	            return i;
	        }
	    }
	    return -1;
	}

	// $scope.$watch("category['family']", function(n, o) {
	// 	console.log('change')
	// }, true);

	$scope.getListsItemIcon = function(item) {
		var classes = [];
		switch(item.preview.type) {
			case 'text':
				classes.push('icon-paragraph-right');
			break;
			case 'iframe':
				classes.push('icon-new-tab');
			break;
			case 'flash':
				classes.push('icon-font');
			break;			
			case 'image':
				classes.push('icon-pictures');
			break;
		}

		return classes;
	}

	// $scope.getCategory = function(index){
	// 	var item 	= $scope.category[$scope.filter.category][index]
	// 		, arr 	= []
	// 		, cat = $scope.filter.category
	// 	arr.push('size'+item.preview.size);
	// 	arr.push( (item.categories[cat] > $scope.category[$scope.filter.category].length) ? 'disabled' : 'enabled');
	// 	arr.push( (item.preview.link.type == 'none') ? 'unlinked' : 'linked');
	// 	return arr;
	// }

	$scope.getCategory = function(index){
		var item 	= $scope.isotopeContent[index]
			, arr 	= []
			, cat = $scope.filter.category
		arr.push('size'+item.preview.size);
		arr.push( (item.categories[cat] > $scope.isotopeContent.length) ? 'disabled' : 'enabled');
		arr.push( (item.preview.link.type == 'none') ? 'unlinked' : 'linked');
		return arr;
	}
}];

var EditorCtrl = ['$scope', '$filter', function($scope, $filter){
	var id = $scope.route.id;
	$scope.articleEditMode = false;
	$scope.articleButtonMode = 'Save';

	// make default objects
	$scope.editor.categories = [];	
	$scope.editor.data = angular.copy($scope.editor.defaultData);	
	$scope.editor.tempContent = angular.copy($scope.editor.defaultTempContent);	

	if(id != undefined) {		
		$scope.articleEditMode = true;
		$scope.articleButtonMode = 'Update';		
	}

	//fix for tinymce that wont let me update the preview content while two ng-model are connected to it
	$scope.$watch('editor.closed.tempContent', function(n, o) { 		
		if(n != '' && n != undefined)
			$scope.editor.data.preview.content = n;
	});

	$scope.$watch('editor.open.tempContent', function(n, o) { 		
		if(n != '' && n != undefined)
			$scope.editor.data.content.content = n;
	});
	//

	// // changing the preview display content LIVE
	// $scope.$watch('editor.data.preview.display', function(n, o) { 		
	// 	if(n != '' && n != undefined) {
	// 		//$scope.editor.data.preview.type
	// 		console.log(n)
	// 	}			
	// });
	// //
	$scope.$watch('editor.tempContent.preview.text', function(n, o) { 		
		if(n != o && n != '' && n != undefined) {
			$scope.editor.previewDisplay.content.text = n;
			//$('#previewDisplay').html(n);
		}			
	});

	$scope.$watch('editor.tempContent.preview.image', function(n, o) { 		
		if(n != o && n != '' && n != undefined)			
			$scope.buildGallery('preview');							
	}, true);	

	$scope.$watch('editor.data.preview.type', function(n, o) { 		
		if(n != o && n != '' && n != undefined) {
			console.log('changing preview type to ' + n)
		}			
	});	

	// $scope.handleFile = function(type, fileType, file) {

	// 	var fd = new FormData();
	// 	fd.append('fileName', file);
	// 	fd.append('_csrf', $scope.cookies['csrf.token'])
		
	// 	var xhr = new XMLHttpRequest();        

	// 	if(fileType == 'image') {
	// 		var imageType = /image.*/;				
	// 		if(!file.type.match(imageType))
	// 			return alert('only image type allowed!');

	// 		xhr.open("POST", "/api/uploads/images" , true);

	// 		xhr.onload = function(e) {							
	// 			var image = {
	// 				fileName:file.name,
	// 				hashName:JSON.parse(this.response).hashName
	// 				//hashName: $scope.host + 'images/imgs/' + JSON.parse(this.response).hashName
	// 			}

	// 			$scope.safeApply(function() {
	// 				$scope.editor.tempContent[type].image.push(image);
	// 				$scope.uploadprogress = '';
	// 			});
	// 		}			
	// 	} else if(fileType == 'flash') {
	// 		var imageType = 'application/x-shockwave-flash';
	// 		if(!file.type.match(imageType))
	// 			return alert('only flash (SWF) type allowed!');

	// 		xhr.open("POST", "/api/uploads/swfs" , true);

	// 		xhr.onload = function(e) {
	// 			var flash = JSON.parse(this.response);

	// 			$scope.safeApply(function() {
	// 				$scope.editor.tempContent[type].flash.data = flash.hashName;			
	// 				$scope.editor.files.flash.push(flash);
	// 				$scope.uploadprogress = '';
	// 			});
	// 		}
	// 	}	

	// 	xhr.upload.onprogress = function(e) {
	// 		$scope.safeApply(function() {
	// 			 if (e.lengthComputable)
 //     				 $scope.uploadprogress = Math.ceil(((e.loaded / e.total) * 100)) + '%';
 //     		});
	// 	}

	// 	xhr.send(fd);
	// }

	$scope.removeImage = function(type, image) {
		if(confirm('are you sure you want to remove this image ?')) {			
			var id = image.hashName.split('.')[0];

			if(id != undefined) {
				$scope.Files.delete({type:'imgs', id:id}, function(res) {									
					if(res.error == 0) {					
						var imageIndex = $scope.editor.tempContent[type].image.indexOf(image);
						$scope.editor.tempContent[type].image.splice(imageIndex, 1);
					}
				});
			}
		} else { 
			return; 
		}
	}

	$scope.checkLinkType = function(param)	{
		var type = $scope.editor.data.preview.link.type;

		// if(param === 'text') {
		// 	if(type === 'none') {
		// 		return false;
		// 	} else if(type === 'inner' && $scope.editor.data.preview.type != 'flash') {
		// 		// TODO: show Open Editor
		// 		return true;
		// 	} else if(type === 'external' && $scope.editor.data.preview.type != 'flash') {
		// 		return true;
		// 	}
		// } else if(param === 'url') {
		// 	if(type === 'none') {
		// 		return false;
		// 	} else if(type === 'external' && $scope.editor.data.preview.type != 'flash') {
		// 		return true;
		// 	}
		// }

		if(param === 'text') {
			if(type === 'none') {
				return false;
			} else if(type === 'inner') {
				// TODO: show Open Editor
				return true;
			} else if(type === 'external') {
				return true;
			}
		} else if(param === 'url') {
			if(type === 'none') {
				return false;
			} else if(type === 'external') {
				return true;
			}
		}

		return false;
	}

	// $scope.$watch("editor.data.preview.link.type", function(n, o) {
	// 	if(n === 'none') {
	// 		$scope.editor.
	// 	}
	// }, true);

	// var colorPicker = ['#ffffff', '#8c9299', '#4aa82e'];
	// $scope.toggleColor = function(status) {		
	// 	var currentColor = 0;

	// 	currentColor = $scope.editor[status].colorPickerClass.split('_')[1];

	// 	if(currentColor >= 1 && currentColor <3) {
	// 		currentColor++;
	// 	} else {
	// 		currentColor = 1;
	// 	}

	// 	if(status === 'open') {
	// 		$scope.editor.data.content.bgColor = colorPicker[currentColor - 1];
	// 	} else if (status === 'closed') {
	// 		$scope.editor.data.preview.bgColor = colorPicker[currentColor - 1];
	// 	}

	// 	$scope.safeApply(function() {	
	// 		$scope.editor[status].colorPickerClass = 'colorPicker_' + currentColor;			
	// 	});
	// }

	$scope.savingArticle = false;

	$scope.saveContent = function() {
		$scope.savingArticle = true;

		var newCategories = $scope.editor.categories;
		var oldCategories = $scope.editor.data.categories;

		// clean categories that was removed
		for(var cat in oldCategories) {
			if(newCategories.indexOf(cat) == -1 && cat != 'all') {
				delete oldCategories[cat]
			}			
		}

		// add new categories
		for(var cat in newCategories) {
			if(oldCategories[newCategories[cat]] == undefined) {
				oldCategories[newCategories[cat]] = $scope.category[newCategories[cat]].length;
			}
		}
		
		if(oldCategories['all'] == undefined)
			oldCategories.all = $scope.category['all'].length;
		

		// console.log('NEW cats');
		// for(var cat in newCategories) {
		// 	console.log(newCategories[cat]);
		// }

		// console.log('');
		// console.log('OLD cats');
		// for(var cat in oldCategories) {
		// 	console.log(cat + ' : ' + oldCategories[cat]);
		// }


		// updating data with current content
		//

		// preview content
		$scope.safeApply(function() {
			switch($scope.editor.data.preview.type) {
				case 'text':
					$scope.editor.data.preview.content = $scope.editor.tempContent.preview.text;					
				break;
				case 'video':					
					$scope.editor.data.preview.content = $scope.editor.tempContent.preview.video.id;					
				break;
				case 'iframe':
					$scope.editor.data.preview.content = $scope.editor.tempContent.preview.iframe;
				break;
				case 'flash':
					$scope.editor.data.preview.content = $scope.editor.tempContent.preview.flash.data;
				break;
				case 'image':
					$scope.editor.data.preview.content = $scope.editor.tempContent.preview.image;
				break;
				default:
				break;
			}

			switch($scope.editor.data.content.type) {
				case 'text':
					$scope.editor.data.content.content = $scope.editor.tempContent.content.text;					
				break;		
				case 'video':					
					$scope.editor.data.content.content = $scope.editor.tempContent.content.video.id;					
				break;
				case 'iframe':
					$scope.editor.data.content.content = $scope.editor.tempContent.content.iframe;
				break;		
				case 'flash':
					$scope.editor.data.content.content = $scope.editor.tempContent.content.flash.data;
				break;
				case 'image':
					$scope.editor.data.content.content = $scope.editor.tempContent.content.image;
				break;
				default:
				break;
			}
		});
		
		if($scope.articleEditMode) {
			$scope.Articles.update({id:id}, $scope.editor.data, function(res) { 
				for(var item in $scope.content) {
					if($scope.content[item]._id == id) {
						$scope.content[item] = res;
						$scope.splitCategories();
						$scope.savingArticle = false;
						break;
					}
				}
			});
		} else {
			$scope.Articles.save($scope.editor.data, function(res) { 
				if(res._id != undefined) {
					$scope.content.unshift(res);
					$scope.splitCategories();
					$scope.savingArticle = false;
				}		
			});
		}
	}

	$scope.$watch("editor.tempContent.preview.flash.data", function(n, o) {				
		if(n!= o && n != undefined) {
			$scope.safeApply(function() {
				$scope.editor.tempContent.preview.flash.url = $scope.host + 'images/swfs/' + n;

				$scope.buildFlash('preview');				
			});
		}
	}, true);	

	$scope.$watch("editor.tempContent.content.flash.data", function(n, o) {				
		if(n != undefined) {
			$scope.safeApply(function() {
				$scope.editor.tempContent.content.flash.url = $scope.host + 'images/swfs/' + n;
			});
		}
	}, true);

	$scope.updateIframePreview = function() {
		if($scope.editor.tempContent.preview.iframe.indexOf('//') != 0 && $scope.editor.tempContent.preview.iframe.indexOf('http'))
			$scope.editor.tempContent.preview.iframe = 'http://' + $scope.editor.tempContent.preview.iframe;
		
		$scope.editor.previewDisplay.content.iframe = '<iframe scrolling="no" src="' + $scope.editor.tempContent.preview.iframe + '" frameborder="0" width="' + $scope.editor.previewDisplay.width + '" height="' + $scope.editor.previewDisplay.height + '"></iframe>';
	}

	$scope.checkLinked = function() {
		if($scope.editor.data.preview.link.type == 'none')
			return "unlinked";

		return "linked";
	}

	$scope.$on('SETTINGS_LOADED', function(event) {
		$scope.loadContent();				
	});

	$scope.loadContent = function() {	
		//$scope.Files.query({type:'swfs'}, function(res) {
			//$scope.editor.files.flash = res;
			if($scope.articleEditMode) {
				for(var item in $scope.content) {
					if($scope.content[item]._id == id) {
						$scope.editor.data = $scope.content[item];
						$scope.loadTempContent(item);
						break;
					}
				}
				
				// $scope.safeApply(function() {	
				// 	$scope.editor.open.colorPickerClass = 'colorPicker_' + (colorPicker.indexOf($scope.editor.data.content.bgColor) + 1);
				// 	$scope.editor.closed.colorPickerClass = 'colorPicker_' + (colorPicker.indexOf($scope.editor.data.preview.bgColor) + 1);
				// });		

				for(var cat in $scope.editor.data.categories) {
					$scope.editor.categories.push(cat);
				}

			} else {
				// $scope.editor.data.categories[$scope.categories[0]] = $scope.category[$scope.categories[0]].length;		
				// $scope.editor.categories.push($scope.categories[0]);
				// console.log($scope.categories);				
			}
		//});
	}

	$scope.loadTempContent = function(index) {
		$scope.safeApply(function() {
			switch($scope.content[index].preview.type) {
				case 'text':
					$scope.editor.tempContent.preview.text = $scope.content[index].preview.content;
				break;
				case 'flash':
					for (var i in $scope.editor.files.flash){
						if ($scope.editor.data.preview.content === $scope.editor.files.flash[i].hashName) {
							$scope.editor.tempContent.preview.flash.data = $scope.editor.files.flash[i].hashName;
							break;
						}
					}
				break;
				case 'iframe':
					$scope.editor.tempContent.preview.iframe = $scope.content[index].preview.content;
				break;
				case 'image':					
					$scope.editor.tempContent.preview.image = $scope.content[index].preview.content;
				break;
				default:
				break;
			}

			switch($scope.content[index].content.type) {
				case 'text':
					$scope.editor.tempContent.content.text = $scope.content[index].content.content;
				break;
				case 'flash':
					for (var i in $scope.editor.files.flash){
						if ($scope.editor.data.content.content === $scope.editor.files.flash[i].hashName) {
							$scope.editor.tempContent.content.flash.data = $scope.editor.files.flash[i].hashName;
							break;
						}
					}
				break;
				case 'iframe':
					$scope.editor.tempContent.content.iframe = $scope.content[index].content.content;
				break;
				case 'image':					
					$scope.editor.tempContent.content.image = $scope.content[index].content.content;
				break;
				default:
				break;
			}
		});
	}

	$scope.videoCheck = function(id, cb){
		$scope.Api.get({action: 'videoCheck', id: id}, function (resp) {			
			var valid = (resp.type === undefined) ? false : true;
			cb(valid);
		});
	}

	$scope.checkVideo = function(type) {		
		$scope.videoCheck($scope.editor.tempContent[type].video.id, function(valid) {
			$scope.editor.tempContent[type].video.valid = valid;
			if(valid) {
				$scope.editor.tempContent[type].video.icon = 'images/enabled.png';
			} else {
				$scope.editor.tempContent[type].video.icon = 'images/disabled.png';
			}
		});
	}

	if($scope.settingsLoaded) 		
		$scope.loadContent();
}];

var SwfsCtrl = ['$scope', function($scope){
	
	// $scope.Files.query({type:'swfs'}, function(res) {
	// 	$scope.editor.files.flash = res;
	// });

	$scope.deleteSwf = function(swf) {
		var inUse = false;
		var confirmText = 'are you sure you want to delete ' + swf.fileName + ' ?';

		for(var item in $scope.content) {

			if($scope.content[item].preview.type == 'flash' && typeof($scope.content[item].preview.content) == 'string' && $scope.content[item].preview.content == swf.hashName) 
				inUse = true;

			if($scope.content[item].content.type == 'flash' && typeof($scope.content[item].content.content) == 'string' && $scope.content[item].content.content == swf.hashName)
				inUse = true;			

			if(inUse) {
				confirmText = 'one or more articles are using this SWF, are you sure you want to delete ' + swf.fileName + ' ?';
				break;
			}
		}

		if(confirm(confirmText)) {
			$scope.Files.delete({type:'swfs', id:swf._id}, function(res) {									
				if(res.error == 0) {					
					$scope.editor.files.flash.splice($scope.editor.files.flash.indexOf(swf), 1);					
				}
			});
		}
	}

	// $scope.uploadNewSwf = function(div) {		
	// 	$('#' + div).trigger('click');
	// }
}];

// var SettingsCtrl = ['$scope', function($scope){
// 	$scope.Settings.get({}, function(settings){
// 		$scope.settings = settings;
// 	});
// 	$scope.usersObj = [];
// 	$scope.Users.query({}, function(response){
// 		$scope.users = response;
// 	});
// 	$scope.fileElm = [];
// 	$scope.save = function(action){
// 		if (action==='title')
// 			$scope.Settings.update({},{title: $scope.settings.title}, function(resp){
// 				//console.log(resp);
// 			});
// 		else if (action==='toggle') {
// 			$scope.Settings.update({}, {modeState: !$scope.settings.modeState}, function(resp){
// 				//console.log(resp);
// 				$scope.settings.modeState = resp.modeState;
// 			});
// 		} else if (action==='facebook')
// 			$scope.Settings.update({}, {facebook: $scope.settings.facebook}, function(resp){
// 				$scope.settings.facebook = resp.facebook;
// 			});
// 	}
// 	$scope.updateUser = function(index){
// 		var sendObj = $scope.users[index];
// 		delete sendObj.votes, sendObj._id, sendObj.hidden;
// 		$scope.Users.update({user: sendObj._id}, sendObj, function(resp){
// 			//console.log(resp);
// 		});
// 	}
// 	$scope.videoCheck = function(id, cb){
// 		$scope.Api.get({action: 'videoCheck', id: id}, function (resp) {
// 			var invalid = (resp.type === undefined) ? true : false;
// 			cb( invalid );
// 		})
// 	}
// 	$scope.formInvalid = function(formObj, id){
// 		$scope.videoCheck(id, function(resp){
// 			formObj.$invalid = resp;
// 		});
// 	}
// 	$scope.setFiles = function (_element) {
// 		$scope.$apply(function ($scope) {
// 			for (var i=0;i<_element.files.length;i++){
// 				$scope.file = _element.files[i];
// 				$scope.prepareUpload(_element.files[i]);
// 			}
// 		});
// 	};
// 	$scope.prepareUpload = function(_file){
// 		var imageType = /image.*/
// 		if(!_file.type.match(imageType)){ 
// 			return alert('only images allowed');
// 		} else {
// 			var reader = new FileReader();
// 			reader.onload = (function (file){
// 				return function (env){
// 					$scope.upload();
// 				}
// 			}(_file))
// 			reader.readAsDataURL(_file);
// 		}
// 	}

// 	$scope.upload = function(){
// 		$scope.fd = new FormData();
// 		$scope.fd.append('leadersImage', $scope.file);
// 		$scope.fd.append('_csrf', $scope.cookies['csrf.token'])
// 		$scope.xhr = new XMLHttpRequest();
//         $scope.xhr.open("POST", "/api/upload/leaders" , true);
//        	$scope.xhr.send($scope.fd);
// 	}
// }];
'user strict';
angular.module('admin.controllers', ['ngResource', 'ngCookies', 'ui', 'ui.bootstrap']);
var GlobalCtrl = ['$scope', '$compile', '$filter', '$resource', '$location', '$window', '$routeParams','$cookies', function($scope, $compile, $filter, $resource,$location,$window,$routeParams,$cookies){
	$scope.window = $window
	, $scope.showMenu =true
	, $scope.Settings = $resource('/resources/settings/:type', {_csrf: $cookies['csrf.token']}, {update: {method: 'PUT'}})
	, $scope.Categories = $resource('/resources/settings/categories/:key', {_csrf: $cookies['csrf.token']}, {update: {method: 'PUT'}})
	, $scope.location = $location
	, $scope.resource = $resource
	, $scope.route = $routeParams
	, $scope.Math = $window.Math
	, $scope.Articles = $scope.resource('/resources/articles/:id', {_csrf: $cookies['csrf.token']}, {update: {method:'PUT'}, updateList: {method:'PUT', isArray:true} })
	, $scope.Stats = $scope.resource('/resources/stats/:type', {_csrf: $cookies['csrf.token']})
	, $scope.Api = $scope.resource('/api/:action/:id', {_csrf: $cookies['csrf.token']});
	$scope.cookies = $cookies;
	$scope.Files = $scope.resource('/api/uploads/:type/:id', {_csrf: $cookies['csrf.token']});

	$scope.host = $scope.location.$$protocol + '://' + $scope.location.$$host + ($scope.location.$$port == 80 ? '' : ':' + $scope.location.$$port) + '/';

	$scope.content = [];
	$scope.isotopeContent = {
		original: [],
		copy: []
	}	
	$scope.categories = [];
	$scope.category = {};
	$scope.categoryCopy = {};

	$scope.settingsLoaded = false;
	$scope.categoriesLoaded = false;

	$scope.filter = {
		category: 0
	}

	$scope.Settings.get({}, function(settings){
		$scope.settings = settings
		
		$scope.updateCategories();

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
								total:10
							}
	}

	$scope.updateCategories = function() {
		$scope.categories = [];
		for(var cat in $scope.settings.categories)
			$scope.categories.push(cat);
	}

	$scope.getCategoryName = function(key) {
		return $scope.settings.categories[key];
	}

	$scope.setPage = function (pageName, page) {
	    $scope.pagination[pageName].page = page;
  	};

	$scope.buildArticles = function(cb, content) {
		
		if(content) {
			$scope.content = content;
			$scope.createIsotopeContent();
			$scope.content = $filter('orderBy')($scope.content, '-_id');
			$scope.splitCategories();
			$scope.category[$scope.filter.category].sort($scope.compare);
			$scope.categoryCopy = angular.copy($scope.category);

			if(cb)
				cb();
		} else {
			$scope.Articles.query({}, function(res) {
				$scope.content = res;
				$scope.createIsotopeContent();
				$scope.content = $filter('orderBy')($scope.content, '-_id');
				$scope.splitCategories();
				$scope.categoryCopy = angular.copy($scope.category);

				if(cb)
					cb();
			});
		}
	}

	$scope.createIsotopeContent = function() {
		$scope.isotopeContent.original = angular.copy($scope.content);
		$scope.isotopeContent.original = $scope.reorderIsotopeContent($scope.isotopeContent.original);
		$scope.isotopeContent.copy = angular.copy($scope.isotopeContent.original);
	}

	$scope.reorderIsotopeContent = function(content) {	
		var cats = $scope.categories
			, l = content.length +1;
		for (var cat in content){
			var itm = content[cat];
			for (var i = 0;i<cats.length;i++){
				var c = cats[i];
				if (itm.categories[c] == undefined) {
					itm.categories[c] = l;
					l++;
				}
			}
		}

		return content;
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

	$scope.generateFontSizeForTinymce = function (start, end) {
		var fontSize = [];

		for(var i = start; i <= end; i++) {
			fontSize.push(i+ 'px=' + i + 'px');
		}
		
		return fontSize.join(',');
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
			colorPickerClass:'colorPicker_1',
			colorInput:'#ffffff'
		},
		closed: {
			colorPickerClass:'colorPicker_1',
			showLinkText: false,
			showLinkUrl: false,
			colorInput:'#ffffff'
		},
		displayDefault: {
					preview: {
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
					content: {
								width:700,
								height:464,
								margin:0,
								content: {
									text:'',
									video:'',
									flash:'',
									iframe:'',
									image:''
								}
					}
		},
		display: {

		},
		defaultTempContent: {
			preview: {
						//text: '<p dir="rtl", style="font-size:13px;"></p>',
						text:'',
						video: { 
									id:'',
									icon:'',
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
						text: '',
						video: { 
									id:'',
									icon:'',
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
		tinyImageUpload: {
			preview: null,
			content: null
		},
		tinymceOptions: {
			// General options			
			theme : "advanced",
			plugins : "autolink,lists,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,wordcount,advlist,autosave,visualblocks",

			width: "460",
	  		height: "572",
			//directionality : "rtl",

			theme_advanced_fonts:"Alfi=alfi regular,Alfi BOLD=alfi bold,Arial=arial,Tahoma=tahoma",

			content_css : "stylesheets/tinyFonts.css",

			// Theme options			
			theme_advanced_buttons1 : "uploadImage,newdocument,|,bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,fontselect,fontsizeselect",
			theme_advanced_buttons2 : "cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,blockquote,|,undo,redo",			
			theme_advanced_buttons3 : "link,unlink,image,cleanup,code,|,forecolor,backcolor, | ,charmap,iespell,media,advhr,|,ltr,rtl",
			theme_advanced_buttons4 : "tablecontrols,|,hr,removeformat,visualaid",
			//theme_advanced_toolbar_location : "external",
			theme_advanced_toolbar_location : "top",
			theme_advanced_toolbar_align : "left",
			theme_advanced_statusbar_location : "none",
			theme_advanced_resizing : false,

			theme_advanced_font_sizes : $scope.generateFontSizeForTinymce(7, 50),

			setup : function(ed) {
		        // Add a custom button
		        ed.addButton('uploadImage', {
		            title : 'Upload Image',
		            image : 'images/upload.png',
		            onclick : function() {
		                // Add you own code to execute something on click
		                $scope.editor.tinyImageUpload.preview = ed;
		                $scope.triggerClick('uploadNewImageTinymce_preview');		                
		            }
		        });
		    },

		    init_instance_callback : function(editor) {
		    	if(editor.startContent == '<p><br data-mce-bogus="1"></p>') {
		    		editor.execCommand("fontName", false, "alfi regular");
		    		editor.execCommand("fontSize", false, "13px");
		    	}
	        }

			//onchange_callback:'$scope.tinymceChange'
		},
		tinymceContentOptions: {
			// General options			
			theme : "advanced",
			plugins : "autolink,lists,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,wordcount,advlist,autosave,visualblocks",

			width: "700",
	  		height: "464",
			//directionality : "rtl",

			theme_advanced_fonts:"Alfi=alfi regular,Alfi BOLD=alfi bold,Arial=arial,Tahoma=tahoma",

			content_css : "stylesheets/tinyFonts.css",

			// Theme options			
			theme_advanced_buttons1 : "uploadImage,newdocument,|,bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,fontselect,fontsizeselect",
			theme_advanced_buttons2 : "cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,blockquote,|,undo,redo",			
			theme_advanced_buttons3 : "link,unlink,image,cleanup,code,|,forecolor,backcolor, | ,charmap,iespell,media,advhr,|,ltr,rtl",
			theme_advanced_buttons4 : "tablecontrols,|,hr,removeformat,visualaid",
			theme_advanced_toolbar_location : "external",			
			theme_advanced_toolbar_align : "left",
			theme_advanced_statusbar_location : "none",
			theme_advanced_resizing : false,
			theme_advanced_font_sizes : $scope.generateFontSizeForTinymce(7, 50),
			
			setup : function(ed) {
		        // Add a custom button
		        ed.addButton('uploadImage', {
		            title : 'Upload Image',
		            image : 'images/upload.png',
		            onclick : function() {
		                // Add you own code to execute something on click
		                $scope.editor.tinyImageUpload.content = ed;
		                $scope.triggerClick('uploadNewImageTinymce_content');		                
		            }
		        });
		    },

		    init_instance_callback : function(editor) {
		    	if(editor.startContent == '<p><br data-mce-bogus="1"></p>') {
		    		editor.execCommand("fontName", false, "alfi regular");
		    		editor.execCommand("fontSize", false, "13px");
		    	}
	        }

			//onchange_callback:'$scope.tinymceChange'
		}
	}	

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
	}, true);
	//

	// change input color for content mode in editor
	$scope.$watch('editor.data.content.bgColor', function(n,o){
		if (n!=o && n!=undefined) {
			$scope.safeApply(function() {
				if(n == '#ffffff') {
					$scope.editor.open.colorInput = '#000000';
				} else {
					$scope.editor.open.colorInput = '#ffffff';
				}

				$scope.buildFlash('content');
			});
		}
	}, true);
	//

	// change the size of preview display by size
	$scope.$watch('editor.data.preview.size', function(n,o){
	console.log('editor preview size changed')		
		if (n!=o && n!=undefined) {
			$scope.updatePreviewDisplaySize(n);
			$scope.rebuildGalleryOrFlash('preview');
		}		
	}, true);
	//

	$scope.updatePreviewDisplaySize = function(size) {
		switch(size) {
			case '1x1':
				$scope.editor.display.preview.width = 220;
				$scope.editor.display.preview.height = 220;
				$scope.editor.display.preview.margin = 130;
			break;
			case '1x2':
				$scope.editor.display.preview.width = 220;
				$scope.editor.display.preview.height = 460;
				$scope.editor.display.preview.margin = 10;
			break;
			case '2x2':
				$scope.editor.display.preview.width = 460;
				$scope.editor.display.preview.height = 460;
				$scope.editor.display.preview.margin = 10;
			break;
			case '2x1':
				$scope.editor.display.preview.width = 460;
				$scope.editor.display.preview.height = 220;
				$scope.editor.display.preview.margin = 130;
			break;
			default:
			break;
		}

		var previewIframeWraper = $('#preview_iframe_wrapper');

		if(previewIframeWraper) {
			previewIframeWraper.attr('width', $scope.editor.display.preview.width);
			previewIframeWraper.attr('height', $scope.editor.display.preview.height);
		}
	}

	$scope.rebuildGalleryOrFlash = function(type) {
		
		if($scope.editor.data[type].type == 'flash' && $scope.editor.tempContent[type].flash.url.length > 0)
				$scope.buildFlash(type);	

		if($scope.editor.data[type].type == 'image' && $scope.editor.tempContent[type].image.length > 0)
			$scope.buildGallery(type);
	}

	$scope.$watch('editor.files.flash.length', function(n,o){
		if (n!=o && n!=undefined)
			$scope.pagination.swfs.pages = Math.ceil(n / $scope.pagination.swfs.total);
	}, true);

	$scope.$watch('content.length', function(n,o){
		if (n!=o && n!=undefined)
			$scope.pagination.main.pages = Math.ceil(n / $scope.pagination.main.total);
	}, true);

	$scope.Files.query({type:'swfs'}, function(res) {
		$scope.editor.files.flash = res;		
	});

	$scope.buildFlash = function(type) {		
		var swf =	'<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0" width="' + $scope.editor.display[type].width + '" height="' + $scope.editor.display[type].height + '" id="previewFlash">' +
					'<param name="movie" value="' + $scope.editor.tempContent[type].flash.url +'" />' + 
					'<param name="quality" value="high" />' +
					'<param name="bgcolor" value="' + $scope.editor.data[type].bgColor + '" />' +
					'<embed src="' + $scope.editor.tempContent[type].flash.url +'" quality="high" bgcolor="' + $scope.editor.data[type].bgColor + '" width="' + $scope.editor.display[type].width + '" height="' + $scope.editor.display[type].height + '" name="previewFlash" align="" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer">' +
					'</embed>' +
					'</object>';
		$scope.editor.display[type].content.flash = swf;
	}

	$scope.buildGallery = function(type) {
		var wrapper = angular.element('<div></div>');
		if($scope.editor.tempContent[type].image.length > 1) 
			wrapper.attr('iso-gallery', '{ "width":' + $scope.editor.display[type].width + ', "height":' + $scope.editor.display[type].height + ' }');
		
		for(var image in $scope.editor.tempContent[type].image) {
			var img = angular.element('<img />');
			img.attr('src', $scope.host + '/images/imgs/' + $scope.editor.tempContent[type].image[image].hashName);
			//img.attr('width', $scope.editor.display[type].width);
			//img.attr('height', $scope.editor.display[type].height);
			img.appendTo(wrapper);
		}
					
		$scope.editor.display[type].content.image = wrapper;			
		$compile($scope.editor.display[type].content.image)($scope);		
	}

	$scope.triggerClick = function(div) {		
		$('#' + div).trigger('click');
	}

	$scope.upload = {
						preview: {
									uploading:false,
									progressBar:'0',
									uploadprogress:''
						},
						content: {
									uploading:false,
									progressBar:'0',
									uploadprogress:''
						},
						resource: {
									uploading:false,
									progressBar:'0',
									uploadprogress:''
						}
	} 

	$scope.uploadResourceImageForTiny = function(type, file) {
		$scope.upload[type].uploading = true;		 

		var fd = new FormData();
		fd.append('fileName', file);
		fd.append('_csrf', $scope.cookies['csrf.token'])
		
		var xhr = new XMLHttpRequest();  

		var mimeType = /image.*/;				
			if(!file.type.match(mimeType))
				return alert('only image type allowed!');

			xhr.open("POST", "/api/uploads/images" , true);

			xhr.onload = function(e) {							
				var image = {
					fileName:file.name,
					hashName:JSON.parse(this.response).hashName					
				}

				$scope.editor.tinyImageUpload[type].focus();
		        $scope.editor.tinyImageUpload[type].selection.setContent('<img src="' + $scope.host + 'images/imgs/' + image.hashName + '" alt="" />');

				$scope.safeApply(function() {					
					$scope.upload[type].progressBar = '0';
					$scope.upload[type].uploadprogress = '';
					$scope.upload[type].uploading = false;
				});
			}

		xhr.onerror = function(e) {
			$scope.safeApply(function() {									
				$scope.upload[type].progressBar = '0';
				$scope.upload[type].uploadprogress = '';
				$scope.upload[type].uploading = false;
			});
		}

		xhr.upload.onprogress = function(e) {
			$scope.safeApply(function() {
				if (e.lengthComputable) {
     				$scope.upload[type].progressBar = Math.ceil(((e.loaded / e.total) * 100));
     				$scope.upload[type].uploadprogress = $scope.upload[type].progressBar + '%';     				
     			}
     		});
		}

		xhr.send(fd);
	}

	$scope.uploadNewResource = function(type, fileType, file) {
		$scope.upload[type].uploading = true;		 

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
					$scope.upload[type].progressBar = '0';
					$scope.upload[type].uploadprogress = '';
					$scope.upload[type].uploading = false;
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
					$scope.upload[type].progressBar = '0';
					$scope.upload[type].uploadprogress = '';
					$scope.upload[type].uploading = false;
				});
			}
		}	

		xhr.onerror = function(e) {
			$scope.safeApply(function() {									
				$scope.upload[type].progressBar = '0';
				$scope.upload[type].uploadprogress = '';
				$scope.upload[type].uploading = false;
			});
		}

		xhr.upload.onprogress = function(e) {
			$scope.safeApply(function() {
				if (e.lengthComputable) {
     				$scope.upload[type].progressBar = Math.ceil(((e.loaded / e.total) * 100));
     				$scope.upload[type].uploadprogress = $scope.upload[type].progressBar + '%';     				
     			}
     		});
		}

		xhr.send(fd);
	}

	$scope.showSelectedSwf = function(type, swf) {
		$scope.editor.tempContent[type].flash.data = swf.hashName;		
	}

	$scope.menu = {
					article:'Add New Article'
	}

	$scope.updateMenuButtonText = function(button, text) {
		$scope.menu[button] = text;
	}

	$scope.$on('UPDATE_CATEGORY', function(event, cats, isoContent) {
		$scope.category = angular.copy(cats);
		$scope.isotopeContent.original = angular.copy(isoContent);		
	});
}];

var MainCtrl = ['$scope', function($scope){

	$scope.updateMenuButtonText('article', 'Add New Article');

	$scope.filters = {
		text:'',
		preview:0,
		content:0,
		status:0,
		categories: ['all']
	}

	$scope.$watch('filters.categories', function(n,o){
		if(n != o) {
			// make sure all is always selected if nothing else selected
			if(n.length == 0 && n.indexOf('all') === -1)
				n.push('all')
		}		
	}, true);

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
	$scope.updateMenuButtonText('article', 'Add New Article');

	$scope.filter.category = 0;	
	
	if($scope.settingsLoaded) {		
		$scope.categoryCopy = angular.copy($scope.category);
		$scope.isotopeContent.copy = angular.copy($scope.isotopeContent.original);
	}
	
	$scope.$watch('filter.category', function(n,o){				
		if (n!=o && n!=0 && n!=undefined && $scope.settingsLoaded && $scope.categoryCopy[n]) 			
			$scope.categoryCopy[n].sort($scope.compare);
	}, true);
	
	$scope.disableListsSaveButton = true;

	$scope.sortableOptions = {
								update: function(event, ui) {											
									for(var i = 0; i < $scope.categoryCopy[$scope.filter.category].length; i++) {
										var item = $scope.categoryCopy[$scope.filter.category][i];
										item.categories[$scope.filter.category] = i;
									}

									var newContent = {};
									for(var cat in $scope.categoryCopy) {
										var content = $scope.categoryCopy[cat];
										
										for(var i in content) {
											var item = content[i];
											var contentId = item._id;

											if(newContent[contentId] == undefined)
												newContent[contentId] = {};

											if(item.categories[cat] != undefined)
												newContent[contentId][cat] = item.categories[cat];
										}
									}
									var tempIsotopeContent = angular.copy($scope.isotopeContent.copy);
									for(var id in newContent) {
										var index = getIndexIfObjWithOwnAttr($scope.isotopeContent.copy, '_id', id);
										tempIsotopeContent[index].categories = newContent[id];						
									}					
									$scope.isotopeContent.copy = $scope.reorderIsotopeContent(tempIsotopeContent);									

									$scope.safeApply(function() {	
							        	$scope.disableListsSaveButton = false;	
							        });	
								},
								start: function(event, ui) {
							        //ui.item.startPos = ui.item.index();	
							        $scope.safeApply(function() {	
							        	$scope.disableListsSaveButton = true;	
							        });								        
							    },
							    stop: function(event, ui) {								    	
							        // console.log("Start position: " + ui.item.startPos);
							        // console.log("New position: " + ui.item.index());							        							        
							    },
								axis: 'y'
	};	

	$scope.saveLists = function() {
		$scope.safeApply(function() {	
	    	$scope.disableListsSaveButton = true;	
	    });	

		var newContent = {};

		for(var cat in $scope.categoryCopy) {
			var content = $scope.categoryCopy[cat];
			
			for(var i in content) {
				var item = content[i];
				var contentId = item._id;

				if(newContent[contentId] == undefined)
					newContent[contentId] = {};

				if(item.categories[cat] != undefined)
					newContent[contentId][cat] = item.categories[cat];
			}
		}
		
		$scope.Articles.updateList({id:'resort'}, newContent, function(res) {
			$scope.buildArticles(function() { 
				$scope.$emit('UPDATE_CATEGORY', $scope.categoryCopy, $scope.isotopeContent.copy); // updating scope.category at Global scope with the new order of category
				$scope.location.path('/main');				
			}, res);
		});				
	}

	var getIndexIfObjWithOwnAttr = function(array, attr, value) {
	    for(var i = 0; i < array.length; i++) {
	        if(array[i].hasOwnProperty(attr) && array[i][attr] === value) {
	            return i;
	        }
	    }
	    return -1;
	}

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

	$scope.getCategory = function(index){
		var item 	= $scope.isotopeContent.copy[index]
			, arr 	= []
			, cat = $scope.filter.category
		arr.push('size'+item.preview.size);
		arr.push( (item.categories[cat] > $scope.isotopeContent.copy.length) ? 'disabled' : 'enabled');
		// arr.push( (item.preview.link.type == 'none') ? 'unlinked' : 'linked');
		return arr;
	}

	$scope.isotopeValid = function() {
		if($scope.categoriesLoaded && $scope.filter.category != 0)
			return true;

		return false;
	}
}];

var EditorCtrl = ['$scope', '$filter', function($scope, $filter){
	$scope.updateMenuButtonText('article', 'Add New Article');

	var id = $scope.route.id;
	$scope.articleEditMode = false;
	$scope.articleButtonMode = 'Save';

	$scope.hide = {
		preview: false,
		content: true
	}

	$scope.changeArrowIcon = function(type) {
		if($scope.hide[type]) {
			return 'icon-arrow-down-2'; 
		}

		return 'icon-arrow-up-2';
	}	

	$scope.changeArrowIcon('preview');
	$scope.changeArrowIcon('content');

	$scope.slideToggle = function(type) {
		$scope.hide[type] = !$scope.hide[type];

		if(type == 'preview')
			$('#closedEditorWrapper').slideToggle('slow');
		if(type == 'content')
			$('#openEditorWrapper').slideToggle('slow');
	}
	
	$scope.$watch('editor.data.preview.link.type', function(n, o) {		
		if(n == 'inner') {
			$scope.hide.content = false;
			$scope.changeArrowIcon('content');
		}
	}, true);	

	$scope.$watch('editor.data.sidebar.readMore.url', function(n, o) {
		if(n != o) {			
			if(n.length >= 4)
				if(n.indexOf('http') != 0) {
					$scope.editor.data.sidebar.readMore.url = 'http://' + n;					
					setTimeout(function() {
						document.getElementById('contentLinkUrlInput').setSelectionRange($scope.editor.data.sidebar.readMore.url.length, $scope.editor.data.sidebar.readMore.url.length);
						document.getElementById('contentLinkUrlInput').focus();
					}, 1);				
				}
		}			
	}, true);

	$scope.$watch('editor.data.preview.link.url', function(n, o) {
		if(n != o) {			
			if(n.length >= 4)
				if(n.indexOf('http') != 0) {
					$scope.editor.data.preview.link.url = 'http://' + n;					
					setTimeout(function() {
						document.getElementById('previewLinkUrlInput').setSelectionRange($scope.editor.data.preview.link.url.length, $scope.editor.data.preview.link.url.length);
						document.getElementById('previewLinkUrlInput').focus();
					}, 1);				
				}
		}			
	}, true);

	// make default objects
	$scope.editor.categories = [];	
	$scope.editor.data = angular.copy($scope.editor.defaultData);
	$scope.editor.tempContent = angular.copy($scope.editor.defaultTempContent);		
	$scope.editor.display = angular.copy($scope.editor.displayDefault);

	if(id != undefined) {		
		$scope.articleEditMode = true;
		$scope.articleButtonMode = 'Update';
	}

	//fix for tinymce that wont let me update the preview content while two ng-model are connected to it
	$scope.$watch('editor.closed.tempContent', function(n, o) { 		
		if(n != '' && n != undefined)
			$scope.editor.data.preview.content = n;
	}, true);

	$scope.$watch('editor.open.tempContent', function(n, o) { 		
		if(n != '' && n != undefined)
			$scope.editor.data.content.content = n;
	}, true);
	//

	$scope.$watch('editor.tempContent.preview.text', function(n, o) { 			
		if(n != undefined) {
			$scope.safeApply(function() {						
				$scope.editor.display.preview.content.text = $scope.wrappWithIframe(n);
			});
			// $scope.safeApply(function() {	
			// 	$scope.editor.display.preview.content.text = n;
			// });			
		}			
	},true);

	$scope.wrappWithIframe = function(text) {
		var wrapper = $('<html />')			
			, base = $('<base />')
				.attr({'href': $scope.host})
	        , style = $('<link  />')
	            .attr(  { 'type': "text/css"
	                    , 'rel': "stylesheet"
	                    , 'href': $scope.host + "stylesheets/tinyFonts.css" })
	        , head  = $('<head />')
	        , wrap  = $('<body />')
	            .attr('dir', 'rtl')	    	    
	    base
	    	.appendTo(head)
	    style
	        .appendTo(head)
	    wrap
	        .append(text)
	    wrapper
	        .append(head)
	        .append(wrap)
	    var iframe  = $('<iframe />')
	        .attr(  { id:'preview_iframe_wrapper' 
	        		, 'frameborder':0
	                , style:"padding:0;border:none"
	                , scrolling: 'no'
	                , width: $scope.editor.display.preview.width
	                , height: $scope.editor.display.preview.height
	                , src: 'data:text/html;charset=utf-8,' + wrapper.html()
	            });
	        //.attr('class', (obj[type].size || 'text' ))

		return iframe;		
	}

	$scope.$watch('editor.tempContent.preview.image', function(n, o) { 		
		if(n != o && n != '' && n != undefined)			
			$scope.buildGallery('preview');							
	}, true);	

	$scope.$watch('editor.tempContent.content.image', function(n, o) { 		
		if(n != o && n != '' && n != undefined)			
			$scope.buildGallery('content');							
	}, true);

	$scope.$watch('editor.data.preview.type', function(n, o) { 		
		if(n != o && n != '' && n != undefined) {
			console.log('changing preview type to ' + n)
		}			
	}, true);	

	$scope.$watch('editor.data.content.type', function(n, o) { 		
		if(n != o && n != '' && n != undefined) {
			//console.log('changing content type to ' + n)			
			$scope.changeContentFormsSizes(n);
		}			
	}, true);

	$scope.changeContentFormsSizes = function(type) {
		if(type == 'text') {
			document.getElementById('upperTypeForm').style.width = 350 + 'px';
			document.getElementById('upperTypeForm').style.borderRight = 'none';			
		} else {			
			document.getElementById('upperTypeForm').style.width = 701 + 'px';			
			document.getElementById('upperTypeForm').style.borderRight = 'solid #ccc 1px';
		}		
	}

	$scope.changeContentFormsSizes('text');

	$scope.removeImage = function(type, image) {
		if(confirm('are you sure you want to remove this image ?')) {			
			var id = image.hashName.split('.')[0];

			if(id != undefined) {
				$scope.Files.delete({type:'images', id:id}, function(res) {									
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

	$scope.savingArticle = false;

	$scope.checkSaveStatus = function() {
		if($scope.editor.data.name.length > 2 && !$scope.savingArticle)
			return false;

		return true;
	}

	$scope.saveContent = function() {
		$scope.savingArticle = true;

		$scope.splitCategories();

		var newCategories = $scope.editor.categories;
		var oldCategories = $scope.editor.data.categories;

		// clean categories that was removed
		for(var cat in oldCategories) {
			if(newCategories.indexOf(cat) == -1 && cat != 'all') {				
				delete oldCategories[cat]
			}			

			if(!$scope.settings.categories[cat])
				delete oldCategories[cat];
		}

		// add new categories
		for(var cat in newCategories) {
			if(oldCategories[newCategories[cat]] == undefined && $scope.settings.categories[newCategories[cat]]) {				
				oldCategories[newCategories[cat]] = $scope.category[newCategories[cat]].length;
			}
		}
		
		if(oldCategories['all'] == undefined)
			oldCategories.all = $scope.category['all'].length;
		
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
						$scope.createIsotopeContent();
						$scope.splitCategories();
						$scope.location.path('/main');
						break;
					}
				}
			});
		} else {
			$scope.Articles.save($scope.editor.data, function(res) { 
				if(res._id != undefined) {
					$scope.content.unshift(res);
					$scope.createIsotopeContent();
					$scope.splitCategories();
					$scope.location.path('/main');
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
		if(n!= o && n != undefined) {
			$scope.safeApply(function() {
				$scope.editor.tempContent.content.flash.url = $scope.host + 'images/swfs/' + n;

				$scope.buildFlash('content');
			});
		}
	}, true);

	$scope.updateIframeDisplay = function(type) {
		if($scope.editor.tempContent[type].iframe.indexOf('//') != 0 && $scope.editor.tempContent[type].iframe.indexOf('http'))
			$scope.editor.tempContent[type].iframe = 'http://' + $scope.editor.tempContent[type].iframe;
		
		$scope.editor.display[type].content.iframe = '<iframe scrolling="no" src="' + $scope.editor.tempContent[type].iframe + '" frameborder="0" width="' + $scope.editor.display[type].width + '" height="' + $scope.editor.display[type].height + '"></iframe>';
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
		if($scope.articleEditMode) {
			$scope.updateMenuButtonText('article', 'Edit Article');				
			
			var exists = false;
			for(var item in $scope.content) {
				if($scope.content[item]._id == id) {						
					$scope.editor.data = angular.copy($scope.content[item]);
					$scope.loadTempContent(item);
					exists = true;
					break;
				}
			}

			if(!exists) { // if id not exists in content, that article is not longer exists so we redirect the user back to home
				$scope.location.path('/main');
				return;
			}		

			for(var cat in $scope.editor.data.categories) {							
				$scope.editor.categories.push(cat);
			}				

			$scope.updatePreviewDisplaySize($scope.editor.data.preview.size);				
		}
	}

	$scope.loadTempContent = function(index) {		
		$scope.safeApply(function() {
			switch($scope.content[index].preview.type) {
				case 'text':				
					$scope.editor.tempContent.preview.text = angular.copy($scope.content[index].preview.content);					
				break;
				case 'flash':
					for (var i in $scope.editor.files.flash){
						if ($scope.editor.data.preview.content === $scope.editor.files.flash[i].hashName) {
							$scope.editor.tempContent.preview.flash.data = angular.copy($scope.editor.files.flash[i].hashName);
							$scope.editor.tempContent.preview.flash.url = $scope.host + 'images/swfs/' + $scope.editor.tempContent.preview.flash.data;
							$scope.rebuildGalleryOrFlash('preview');
							break;
						}
					}
				break;
				case 'iframe':
					$scope.editor.tempContent.preview.iframe = angular.copy($scope.content[index].preview.content);
					$scope.updateIframeDisplay('preview');
				break;
				case 'image':
					$scope.editor.tempContent.preview.image = angular.copy($scope.content[index].preview.content);
					$scope.rebuildGalleryOrFlash('preview');
				break;
				default:
				break;
			}

			switch($scope.content[index].content.type) {
				case 'text':
					$scope.editor.tempContent.content.text = angular.copy($scope.content[index].content.content);
				break;
				case 'video':
					$scope.editor.tempContent.content.video.id = angular.copy($scope.content[index].content.content);
					$scope.buildEmbedVideo('content');
				break;
				case 'flash':
					for (var i in $scope.editor.files.flash){
						if ($scope.editor.data.content.content === $scope.editor.files.flash[i].hashName) {
							$scope.editor.tempContent.content.flash.data = angular.copy($scope.editor.files.flash[i].hashName);
							$scope.editor.tempContent.content.flash.url = $scope.host + 'images/swfs/' + $scope.editor.tempContent.content.flash.data;
							$scope.rebuildGalleryOrFlash('content');
							break;
						}
					}
				break;
				case 'iframe':
					$scope.editor.tempContent.content.iframe = angular.copy($scope.content[index].content.content);
					$scope.updateIframeDisplay('content');
				break;
				case 'image':					
					$scope.editor.tempContent.content.image = angular.copy($scope.content[index].content.content);
					$scope.rebuildGalleryOrFlash('content');
				break;
				default:
				break;
			}

			$scope.changeContentFormsSizes($scope.content[index].content.type);
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
				$scope.editor.tempContent[type].video.icon = 'green icon-checkmark';
				$scope.buildEmbedVideo(type);
			} else {
				$scope.editor.tempContent[type].video.icon = 'red icon-cancel-2';
			}
		});
	}

	$scope.buildEmbedVideo = function(type) {
		var videoId = $scope.editor.tempContent[type].video.id;
		var w =  $('<iframe class="player"></iframe>')
		, src =  '//www.youtube.com/embed/'+ videoId + '?feature=oembed&autoplay=1&rel=0&wmode=transparent'
		, attrs =	{ 
						scrolling: 'no',
		           		frameborder: 0,
		           		width:700,
		           		height:464,
        		   		src: src 
        			};
        w.attr(attrs);

        $scope.editor.display[type].content[$scope.editor.data[type].type] = w;
	}

	if($scope.settingsLoaded)
		$scope.loadContent();
}];

var SwfsCtrl = ['$scope', function($scope){
	$scope.updateMenuButtonText('article', 'Add New Article');

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
}];

var CategoriesCtrl = ['$scope', function($scope){	
	$scope.updateMenuButtonText('article', 'Add New Article');

	$scope.categoryName = '';

	$scope.minimumLength = 2;
	$scope.categoriesObject = {};

	$scope.$on('SETTINGS_LOADED', function(event) {
		$scope.categoriesObject = angular.copy($scope.settings.categories);
	});

	if($scope.settingsLoaded)
		$scope.categoriesObject = angular.copy($scope.settings.categories);	

	$scope.createNewCategory = function() {
		if($scope.categoryName.length > $scope.minimumLength) {
			
			$scope.Categories.save({ name: $scope.categoryName}, function(res) {
				$scope.safeApply(function() {
					$scope.settings.categories[res.key] = $scope.categoryName;
					$scope.updateCategories();
					$scope.categoriesObject[res.key] = $scope.categoryName;
					$scope.categoryName = '';
				});
			});
		}
	}

	$scope.checkIfValidCategory = function(category) {				
		if(category && category.length > $scope.minimumLength) {
			for(var cat in $scope.settings.categories) {
				if($scope.settings.categories[cat] == category) {					
					return true;
				}
			}

			return false;
		}

		return true;
	}

	$scope.changeName = function(key, value) {
		$scope.safeApply(function() {	
			$scope.categoriesObject[key] = value;
		});
	}

	$scope.updateCategory = function(key) {		
		$scope.Categories.update({ key:key }, { name: $scope.categoriesObject[key]}, function(res) {
			$scope.safeApply(function() {
				$scope.settings.categories[key] = angular.copy($scope.categoriesObject[key]);
				$scope.updateCategories();
			});
		});
	}

	$scope.deleteCategory = function(key) {
		console.log($scope.categoriesObject)
		var confirmText = 'are you sure you want to remove category ' + $scope.categoriesObject[key];

		// check if 1 or more articles are using this category at let the user know!!!
		var exists = false;
		for(var i in $scope.content) {
			var	item = angular.copy($scope.content[i]);

			if(item.categories[key] >= 0) {
				exists = true;
				confirmText = 'one or more articles are using this categoty, ' + confirmText;
				break;
			}
		}

		if(confirm(confirmText)) {
			$scope.Categories.delete({ key:key }, function(res) {
				$scope.safeApply(function() {
					delete $scope.categoriesObject[key];
					delete $scope.settings.categories[key];
					$scope.updateCategories();
				});
			});
		}
	}

	$scope.defaultCategory = function(key) {
		$scope.Settings.update({ defaultCategory:key }, function(res) {
			$scope.settings.defaultCategory = key;			
		});
	}

}];
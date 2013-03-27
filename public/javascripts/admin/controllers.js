'user strict';
angular.module('admin.controllers', ['ngResource', 'ngCookies', 'ui']);

var GlobalCtrl = ['$scope', '$filter', '$resource', '$location', '$window', '$routeParams','$cookies', function($scope, $filter, $resource,$location,$window,$routeParams,$cookies){
	$scope.window = $window
	, $scope.showMenu =true
	, $scope.Settings = $resource('/resources/settings', {_csrf: $cookies['csrf.token']}, {update: {method: 'PUT'}})
	, $scope.location = $location
	, $scope.resource = $resource
	, $scope.route = $routeParams
	, $scope.Math = $window.Math
	, $scope.Articles = $scope.resource('/resources/articles/:id', {_csrf: $cookies['csrf.token']}, {update: {method:'PUT'}})
	//, $scope.Users = $scope.resource('/resources/users/:user/:vote', {_csrf: $cookies['csrf.token']}, {update: {method:'PUT'}})
	//, $scope.Voters = $scope.resource('/resources/voters/:voter', {_csrf: $cookies['csrf.token']})
	, $scope.Stats = $scope.resource('/resources/stats/:type', {_csrf: $cookies['csrf.token']})
	, $scope.Api = $scope.resource('/api/:action/:id', {_csrf: $cookies['csrf.token']});
	$scope.cookies = $cookies;
	$scope.Files = $scope.resource('/api/uploads/:type/:id', {_csrf: $cookies['csrf.token']});

	$scope.host = $scope.location.$$protocol + '://' + $scope.location.$$host + ($scope.location.$$port == 80 ? '' : ':' + $scope.location.$$port) + '/';

	$scope.content = [];
	$scope.categories = [];

	$scope.settingsLoaded = false;

	$scope.Settings.get({}, function(settings){
		$scope.settings = settings
		$scope.categories = $scope.settings.categories;// ['family', 'business', 'something', 'someothercat'];	

		$scope.Articles.query({}, function(res) {
			$scope.content = $filter('orderBy')(res, '-_id');

			$scope.category = {};
			$scope.splitCategories();	

			$scope.settingsLoaded = true;
			$scope.$broadcast('SETTINGS_LOADED');
		});		
	});

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

	$scope.filterCategory = 0;
	

	// $scope.content = [
	// 					{
	// 						_id: 111111111111,
	// 						sidebar: {
	// 									title:'title1',
	// 									description: 'description1',
	// 									readMore: {
	// 												title:'title',
	// 												url: 'url'
	// 									}
	// 						},							
	// 						categories: {											
	// 										business:0
	// 						},					
	// 						preview: {
	// 									type:'text',
	// 									link:{
	// 													type:'none',
	// 													url:'url to the link',
	// 													text: 'text on mouse over'
	// 									},
	// 									content:'this is preview content',
	// 									size:'1x2',
	// 									bgColor:'#ffffff'										
	// 						},
	// 						content: {
	// 									type:'text',							
	// 									content:'this is the content',	
	// 									bgColor:'#ffffff',										
	// 						},			
	// 						dateCreated: new Date(),											
	// 						status: true
	// 					},
	// 					{
	// 						_id: 22222222222222,
	// 						sidebar: {
	// 									title:'title2',
	// 									description: 'description1',
	// 									readMore: {
	// 												title:'title',
	// 												url: 'url'
	// 									}
	// 						},							
	// 						categories: {
	// 										family:0,
	// 										business:1,
	// 										something:0
	// 						},					
	// 						preview: {
	// 									type:'video',
	// 									link:{
	// 													type:'none',
	// 													url:'url to the link',
	// 													text: 'text on mouse over'
	// 									},
	// 									content:'this is preview content',
	// 									size:'2x1',
	// 									bgColor:'#4aa82e'										
	// 						},
	// 						content: {
	// 									type:'video',							
	// 									content:'this is the content',	
	// 									bgColor:'#4aa82e',										
	// 						},			
	// 						dateCreated: new Date(),											
	// 						status: false
	// 					},
	// 					{
	// 						_id: 33333333333333,
	// 						sidebar: {
	// 									title:'title3',
	// 									description: 'description1',
	// 									readMore: {
	// 												title:'title',
	// 												url: 'url'
	// 									}
	// 						},							
	// 						categories: {
	// 										family:1,
	// 										business:2
	// 						},					
	// 						preview: {
	// 									type:'flash',
	// 									link:{
	// 													type:'inner',
	// 													url:'url to the link',
	// 													text: 'text on mouse over'
	// 									},
	// 									content:'this is preview content',
	// 									size:'1x1',
	// 									bgColor:'#ffffff'										
	// 						},
	// 						content: {
	// 									type:'flash',							
	// 									content:'this is the content',	
	// 									bgColor:'#ffffff',										
	// 						},			
	// 						dateCreated: new Date(),											
	// 						status: true
	// 					},
	// 					{
	// 						_id: 44444444444444444,
	// 						sidebar: {
	// 									title:'title4',
	// 									description: 'description1',
	// 									readMore: {
	// 												title:'title',
	// 												url: 'url'
	// 									}
	// 						},							
	// 						categories: {
	// 										family:2,
	// 										business:3

	// 						},					
	// 						preview: {
	// 									type:'iframe',
	// 									link:{
	// 													type:'external',
	// 													url:'url to the link',
	// 													text: 'text on mouse over'
	// 									},
	// 									content:'this is preview content',
	// 									size:'2x2',
	// 									bgColor:'#ffffff'										
	// 						},
	// 						content: {
	// 									type:'iframe',							
	// 									content:'this is the content',	
	// 									bgColor:'#ffffff',										
	// 						},			
	// 						dateCreated: new Date(),											
	// 						status: true
	// 					},
	// 					{
	// 						_id: 5555555555555555555,
	// 						sidebar: {
	// 									title:'title5',
	// 									description: 'description1',
	// 									readMore: {
	// 												title:'title',
	// 												url: 'url'
	// 									}
	// 						},							
	// 						categories: {
	// 										family:3,
	// 										something:1							
	// 						},					
	// 						preview: {
	// 									type:'image',
	// 									link:{
	// 													type:'inner',
	// 													url:'url to the link',
	// 													text: 'text on mouse over'
	// 									},
	// 									content:'this is preview content',
	// 									size:'1x1',
	// 									bgColor:'#8c9299'										
	// 						},
	// 						content: {
	// 									type:'image',							
	// 									content:'this is the content',	
	// 									bgColor:'#8c9299',										
	// 						},			
	// 						dateCreated: new Date(),											
	// 						status: true
	// 					}					
	// ]

	$scope.splitCategories = function() {		
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
	}

	$scope.editor = {
		data: {
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
						bgColor:''										
			},
			content: {
						type:'text',							
						content:'',	
						bgColor:'',										
			},		
		},
		open: {
			colorPickerClass:'colorPicker_1'			
		},
		closed: {
			colorPickerClass:'colorPicker_1',
			showLinkText: false,
			showLinkUrl: false			
		},
		tempContent: {
			preview: {
						text: '',
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
						text: '',
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

			width: "700",
	        height: "400",
			directionality : "rtl",

			//content_css : "custom_content.css"

			// Theme options
			theme_advanced_buttons1 : "save,newdocument,|,bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,styleselect,formatselect,fontselect,fontsizeselect",
			theme_advanced_buttons2 : "cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,blockquote,|,undo,redo,|,link,unlink,anchor,image,cleanup,help,code,|,insertdate,inserttime,preview,|,forecolor,backcolor",
			theme_advanced_buttons3 : "tablecontrols,|,hr,removeformat,visualaid,|,sub,sup,|,charmap,emotions,iespell,media,advhr,|,print,|,ltr,rtl,|,fullscreen",
			theme_advanced_buttons4 : "insertlayer,moveforward,movebackward,absolute,|,styleprops,|,cite,abbr,acronym,del,ins,attribs,|,visualchars,nonbreaking,template,pagebreak,restoredraft,visualblocks",
			theme_advanced_toolbar_location : "top",
			theme_advanced_toolbar_align : "left",
			theme_advanced_statusbar_location : "bottom",
			theme_advanced_resizing : false
		}
	}	

	$scope.Files.query({type:'swfs'}, function(res) {
		$scope.editor.files.flash = res;
	});

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

	$scope.toggleStatus = function(index) {				
		var item = $scope.content[index];
		item.status = !item.status;

		$scope.Articles.update({id:item._id}, { status:item.status }, function(res) { 
			console.log(res);			
			$scope.splitCategories();
		});
	}

	$scope.itemPreview = function(id) {

	}

	$scope.getDateById = function(id) {
	    return new Date(parseInt(id.toString().slice(0,8), 16)*1000);
	}
}];

var ListsCtrl = ['$scope', function($scope){

	function compare(a,b) {
		a = parseInt(a.categories[$scope.filterCategory]);
		b = parseInt(b.categories[$scope.filterCategory]);
		if (a < b)
			return -1;
		if (a > b)
			return 1;
		return 0;
	}

	$scope.$watch('filterCategory', function(n,o){
		if (n!=o)
			$scope.category[n].sort(compare);
	});

	$scope.showListsSaveButton = true;
	$scope.sortableOptions = {
								update: function(event, ui) {									
									for(var i = 0; i < $scope.category[$scope.filterCategory].length; i++) {
										var item = $scope.category[$scope.filterCategory][i];
										item.categories[$scope.filterCategory] = i;
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
	// 	var index = parseInt(item.categories[$scope.filterCategory]);
	// 	return index;				
	// }
	
	$scope.previewNewList = function() {
		$scope.showListsSaveButton = false;
	}

	// $scope.$watch("category['family']", function(n, o) {
	// 	console.log('change')
	// }, true);

}];

var EditorCtrl = ['$scope', function($scope){
	var id = $scope.route.id;

	//fix for tinymce that wont let me update the preview content while two ng-model are connected to it
	$scope.$watch('editor.closed.tempContent', function(n, o) { 		
		if(n != '' && n != undefined)
			$scope.editor.data.preview.content = n;
	});

	$scope.uploadprogress = '';

	$scope.handleFile = function(type, fileType, file) {

		var fd = new FormData();
		fd.append('fileName', file);
		fd.append('_csrf', $scope.cookies['csrf.token'])
		
		var xhr = new XMLHttpRequest();        

		if(fileType == 'image') {
			var imageType = /image.*/;				
			if(!file.type.match(imageType))
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
					$scope.uploadprogress = '';
				});
			}			
		} else if(fileType == 'flash') {
			var imageType = 'application/x-shockwave-flash';
			if(!file.type.match(imageType))
				return alert('only flash (SWF) type allowed!');

			xhr.open("POST", "/api/uploads/swfs" , true);

			xhr.onload = function(e) {
				$scope.safeApply(function() {
					$scope.editor.tempContent[type].flash.data = JSON.parse(this.response).hashName;			
					$scope.editor.files.flash.push(JSON.parse(this.response));
					$scope.uploadprogress = '';
				});
			}
		}	

		xhr.upload.onprogress = function(e) {
			$scope.safeApply(function() {
				 if (e.lengthComputable)
     				 $scope.uploadprogress = Math.ceil(((e.loaded / e.total) * 100)) + '%';
     		});
		}

		xhr.send(fd);
	}

	$scope.removeImage = function(type, image) {
		if(confirm('are you sure you want to remove this image ?')) {			
			var imageIndex = $scope.editor.tempContent[type].image.indexOf(image);
			$scope.editor.tempContent[type].image.splice(imageIndex, 1);
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

	var colorPicker = ['#ffffff', '#8c9299', '#4aa82e'];
	$scope.toggleColor = function(status) {		
		var currentColor = 0;

		currentColor = $scope.editor[status].colorPickerClass.split('_')[1];

		if(currentColor >= 1 && currentColor <3) {
			currentColor++;
		} else {
			currentColor = 1;
		}

		if(status === 'open') {
			$scope.editor.data.content.bgColor = colorPicker[currentColor - 1];
		} else if (status === 'closed') {
			$scope.editor.data.preview.bgColor = colorPicker[currentColor - 1];
		}

		$scope.safeApply(function() {	
			$scope.editor[status].colorPickerClass = 'colorPicker_' + currentColor;			
		});
	}

	$scope.saveContent = function() {
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
	}

	$scope.$watch("editor.tempContent.preview.flash.data", function(n, o) {				
		if(n != undefined) {
			$scope.safeApply(function() {
				$scope.editor.tempContent.preview.flash.url = $scope.host + 'images/swfs/' + n;
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

	$scope.$on('SETTINGS_LOADED', function(event) {					
		$scope.loadContent();
	});

	$scope.loadContent = function() {	
		//$scope.Files.query({type:'swfs'}, function(res) {
			//$scope.editor.files.flash = res;
			if(id != undefined) {
				for(var item in $scope.content) {
					if($scope.content[item]._id == id) {
						$scope.editor.data = $scope.content[item];
						$scope.loadTempContent(item);
						break;
					}
				}
				
				$scope.safeApply(function() {	
					$scope.editor.open.colorPickerClass = 'colorPicker_' + (colorPicker.indexOf($scope.editor.data.content.bgColor) + 1);
					$scope.editor.closed.colorPickerClass = 'colorPicker_' + (colorPicker.indexOf($scope.editor.data.preview.bgColor) + 1);
				});		

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
	$scope.uploading = false;

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

	$scope.uploadNewSwf = function() {
		$('#uploadNewSwfInput').trigger('click');
	}

	$scope.uploadNewSwfResource = function(file) {
		$scope.uploading = true;
		var fd = new FormData();
		fd.append('fileName', file);
		fd.append('_csrf', $scope.cookies['csrf.token'])
		
		var xhr = new XMLHttpRequest();      
		
		var imageType = 'application/x-shockwave-flash';
		if(!file.type.match(imageType))
			return alert('only flash (SWF) type allowed!');

		xhr.open("POST", "/api/uploads/swfs" , true);

		xhr.onload = function(e) {
			$scope.safeApply(function() {				
				$scope.editor.files.flash.push(JSON.parse(this.response));
				$scope.progressBar = '0';
				$scope.uploadprogress = '';
				$scope.uploading = false;
			});
		}

		xhr.upload.onprogress = function(e) {
			$scope.safeApply(function() {
				 if (e.lengthComputable)
     				 $scope.progressBar = Math.ceil(((e.loaded / e.total) * 100));
     				$scope.uploadprogress = Math.ceil(((e.loaded / e.total) * 100)) + '%';
     		});
		}

		xhr.send(fd);
	}
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
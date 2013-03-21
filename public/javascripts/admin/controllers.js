'user strict';
angular.module('admin.controllers', ['ngResource', 'ngCookies', 'ui']);

var GlobalCtrl = ['$scope', '$resource', '$location', '$window', '$routeParams','$cookies', function($scope,$resource,$location,$window,$routeParams,$cookies){
	$scope.window = $window
	, $scope.showMenu =true
	, $scope.Settings = $resource('/resources/settings', {_csrf: $cookies['csrf.token']}, {update: {method: 'PUT'}})
	, $scope.location = $location
	, $scope.resource = $resource
	, $scope.route = $routeParams
	, $scope.Math = $window.Math
	, $scope.Users = $scope.resource('/resources/users/:user/:vote', {_csrf: $cookies['csrf.token']}, {update: {method:'PUT'}})
	, $scope.Voters = $scope.resource('/resources/voters/:voter', {_csrf: $cookies['csrf.token']})
	, $scope.Stats = $scope.resource('/resources/stats/:type', {_csrf: $cookies['csrf.token']})
	, $scope.Api = $scope.resource('/api/:action/:id', {_csrf: $cookies['csrf.token']});
	$scope.cookies = $cookies;
	$scope.Settings.get({}, function(settings){
		$scope.settings = settings
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
	$scope.categories = ['family', 'business', 'something', 'someothercat'];	

	$scope.content = [
						{
							_id: 5976234598654832,
							sidebar: {
										title:'title1',
										description: 'description1',
										readMore: {
													title:'title',
													url: 'url'
										}
							},							
							categories: {											
											business:0
							},					
							preview: {
										type:'text/video/flash/iframe/image',
										link:{
														type:'none/inner/ext',
														url:'url to the link',
														text: 'text on mouse over'
										},
										content:'this is preview content',
										size:'1x1',
										bgColor:'#fff/green/grey'										
							},
							content: {
										type:'text/video/flash/iframe/image',							
										content:'this is the content',	
										bgColor:'#fff/green/grey',										
							},			
							dateCreated: new Date(),											
							status: true
						},
						{
							_id: 5976234598654832,
							sidebar: {
										title:'title2',
										description: 'description1',
										readMore: {
													title:'title',
													url: 'url'
										}
							},							
							categories: {
											family:0,
											business:1,
											something:0
							},					
							preview: {
										type:'text/video/flash/iframe/image',
										link:{
														type:'none/inner/ext',
														url:'url to the link',
														text: 'text on mouse over'
										},
										content:'this is preview content',
										size:'1x1',
										bgColor:'#fff/green/grey'										
							},
							content: {
										type:'text/video/flash/iframe/image',							
										content:'this is the content',	
										bgColor:'#fff/green/grey',										
							},			
							dateCreated: new Date(),											
							status: false
						},
						{
							_id: 5976234598654832,
							sidebar: {
										title:'title3',
										description: 'description1',
										readMore: {
													title:'title',
													url: 'url'
										}
							},							
							categories: {
											family:1,
											business:2
							},					
							preview: {
										type:'text/video/flash/iframe/image',
										link:{
														type:'none/inner/ext',
														url:'url to the link',
														text: 'text on mouse over'
										},
										content:'this is preview content',
										size:'1x1',
										bgColor:'#fff/green/grey'										
							},
							content: {
										type:'text/video/flash/iframe/image',							
										content:'this is the content',	
										bgColor:'#fff/green/grey',										
							},			
							dateCreated: new Date(),											
							status: true
						},
						{
							_id: 5976234598654832,
							sidebar: {
										title:'title4',
										description: 'description1',
										readMore: {
													title:'title',
													url: 'url'
										}
							},							
							categories: {
											family:2,
											business:3

							},					
							preview: {
										type:'text/video/flash/iframe/image',
										link:{
														type:'none/inner/ext',
														url:'url to the link',
														text: 'text on mouse over'
										},
										content:'this is preview content',
										size:'1x1',
										bgColor:'#fff/green/grey'										
							},
							content: {
										type:'text/video/flash/iframe/image',							
										content:'this is the content',	
										bgColor:'#fff/green/grey',										
							},			
							dateCreated: new Date(),											
							status: true
						},
						{
							_id: 5976234598654832,
							sidebar: {
										title:'title5',
										description: 'description1',
										readMore: {
													title:'title',
													url: 'url'
										}
							},							
							categories: {
											family:3,
											something:1							
							},					
							preview: {
										type:'text/video/flash/iframe/image',
										link:{
														type:'none/inner/ext',
														url:'url to the link',
														text: 'text on mouse over'
										},
										content:'this is preview content',
										size:'1x1',
										bgColor:'#fff/green/grey'										
							},
							content: {
										type:'text/video/flash/iframe/image',							
										content:'this is the content',	
										bgColor:'#fff/green/grey',										
							},			
							dateCreated: new Date(),											
							status: true
						}					
	]

	//$scope.tempContent = angular.copy($scope.content);

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
		console.log(id);
	}

	$scope.itemPreview = function(id) {

	}

	$scope.itemEdit = function(id) {

	}
}];

var ListsCtrl = ['$scope', function($scope){

	$scope.showListsSaveButton = true;
	$scope.sortableOptions = {
								update: function(event, ui) {	
									for(var i = 0; i < $scope.category[$scope.filterCategory].length; i++) {
										var item = $scope.category[$scope.filterCategory][i];
										item.categories[$scope.filterCategory] = i;
									}
								},
								axis: 'y'
	};	

	$scope.orderCategories = function(item) {		
		return item.categories[$scope.filterCategory];
		//return $scope.category[$scope.filterCategory];
	}
	
	$scope.previewNewList = function() {
		$scope.showListsSaveButton = false;
	}

	// $scope.$watch("category['family']", function(n, o) {
	// 	console.log('change')
	// }, true);

}];

var EditorCtrl = ['$scope', function($scope){
	var id = $scope.route.id;

	$scope.editor = {
		open: {
			colorPickerClass:'colorPicker_1'
		},
		closed: {
			colorPickerClass:'colorPicker_1'
		}
	}

	$scope.toggleColor = function(status) {		
		var currentColor = 0;

		currentColor = $scope.editor[status].colorPickerClass.split('_')[1];

		if(currentColor >= 1 && currentColor <3) {
			currentColor++;
		} else {
			currentColor = 1;
		}

		$scope.safeApply(function() {	
			$scope.editor[status].colorPickerClass = 'colorPicker_' + currentColor;			
		});
	}
	
	tinyMCE.init({
		// General options
		mode : "specific_textareas",
        editor_selector : "tinyEditor",
		theme : "advanced",
		plugins : "autolink,lists,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,wordcount,advlist,autosave,visualblocks",

		width: "700",
        height: "400",

		// Theme options
		theme_advanced_buttons1 : "save,newdocument,|,bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,styleselect,formatselect,fontselect,fontsizeselect",
		theme_advanced_buttons2 : "cut,copy,paste,pastetext,pasteword,|,search,replace,|,bullist,numlist,|,outdent,indent,blockquote,|,undo,redo,|,link,unlink,anchor,image,cleanup,help,code,|,insertdate,inserttime,preview,|,forecolor,backcolor",
		theme_advanced_buttons3 : "tablecontrols,|,hr,removeformat,visualaid,|,sub,sup,|,charmap,emotions,iespell,media,advhr,|,print,|,ltr,rtl,|,fullscreen",
		theme_advanced_buttons4 : "insertlayer,moveforward,movebackward,absolute,|,styleprops,|,cite,abbr,acronym,del,ins,attribs,|,visualchars,nonbreaking,template,pagebreak,restoredraft,visualblocks",
		theme_advanced_toolbar_location : "top",
		theme_advanced_toolbar_align : "left",
		theme_advanced_statusbar_location : "bottom",
		theme_advanced_resizing : false,

		// // Example content CSS (should be your site CSS)
		// content_css : "css/content.css",

		// // Drop lists for link/image/media/template dialogs
		// template_external_list_url : "lists/template_list.js",
		// external_link_list_url : "lists/link_list.js",
		// external_image_list_url : "lists/image_list.js",
		// media_external_list_url : "lists/media_list.js",

		// // Style formats
		// style_formats : [
		// 	{title : 'Bold text', inline : 'b'},
		// 	{title : 'Red text', inline : 'span', styles : {color : '#ff0000'}},
		// 	{title : 'Red header', block : 'h1', styles : {color : '#ff0000'}},
		// 	{title : 'Example 1', inline : 'span', classes : 'example1'},
		// 	{title : 'Example 2', inline : 'span', classes : 'example2'},
		// 	{title : 'Table styles'},
		// 	{title : 'Table row 1', selector : 'tr', classes : 'tablerow1'}
		// ],

		// // Replace values for the template plugin
		// template_replace_values : {
		// 	username : "Some User",
		// 	staffid : "991234"
		// }
	});

}];








var NomineesCtrl = ['$scope', function($scope){
	$scope.Users.query({}, function(response){
		$scope.users = response;
	});
}];

var NomineeCtrl = ['$scope', function($scope){
	var userId = $scope.route.id;
	$scope.Users.get({user: userId}, function(resp){
		$scope.user = resp;
		$scope.Voters.query({voted_user: userId}, function(resp){
			$scope.voters = resp;
		});
	});
}];

var EditNomineeCtrl = ['$scope', function($scope){
	var userId = $scope.route.id;
	$scope.Users.get({user: userId}, function(resp){
		$scope.user = resp;
	});
}];

var VotersCtrl = ['$scope', function($scope){
	$scope.Voters.query({}, function(resp){
		$scope.voters = resp;
	});
}];

var SettingsCtrl = ['$scope', function($scope){
	$scope.Settings.get({}, function(settings){
		$scope.settings = settings;
	});
	$scope.usersObj = [];
	$scope.Users.query({}, function(response){
		$scope.users = response;
	});
	$scope.fileElm = [];
	$scope.save = function(action){
		if (action==='title')
			$scope.Settings.update({},{title: $scope.settings.title}, function(resp){
				//console.log(resp);
			});
		else if (action==='toggle') {
			$scope.Settings.update({}, {modeState: !$scope.settings.modeState}, function(resp){
				//console.log(resp);
				$scope.settings.modeState = resp.modeState;
			});
		} else if (action==='facebook')
			$scope.Settings.update({}, {facebook: $scope.settings.facebook}, function(resp){
				$scope.settings.facebook = resp.facebook;
			});
	}
	$scope.updateUser = function(index){
		var sendObj = $scope.users[index];
		delete sendObj.votes, sendObj._id, sendObj.hidden;
		$scope.Users.update({user: sendObj._id}, sendObj, function(resp){
			//console.log(resp);
		});
	}
	$scope.videoCheck = function(id, cb){
		$scope.Api.get({action: 'videoCheck', id: id}, function (resp) {
			var invalid = (resp.type === undefined) ? true : false;
			cb( invalid );
		})
	}
	$scope.formInvalid = function(formObj, id){
		$scope.videoCheck(id, function(resp){
			formObj.$invalid = resp;
		});
	}
	$scope.setFiles = function (_element) {
		$scope.$apply(function ($scope) {
			for (var i=0;i<_element.files.length;i++){
				$scope.file = _element.files[i];
				$scope.prepareUpload(_element.files[i]);
			}
		});
	};
	$scope.prepareUpload = function(_file){
		var imageType = /image.*/
		if(!_file.type.match(imageType)){ 
			return alert('only images allowed');
		} else {
			var reader = new FileReader();
			reader.onload = (function (file){
				return function (env){
					$scope.upload();
				}
			}(_file))
			reader.readAsDataURL(_file);
		}
	}

	$scope.upload = function(){
		$scope.fd = new FormData();
		$scope.fd.append('leadersImage', $scope.file);
		$scope.fd.append('_csrf', $scope.cookies['csrf.token'])
		$scope.xhr = new XMLHttpRequest();
        $scope.xhr.open("POST", "/api/upload/leaders" , true);
       	$scope.xhr.send($scope.fd);
	}
}];
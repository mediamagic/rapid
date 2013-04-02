var mongoose = require('mongoose')
	, db = mongoose.connection
	, async = require('async');
/*
 * Users Schema
 */
var ArticlesSchema = new mongoose.Schema( 
	{ sidebar: 	{ title: 	{ type: String }
				, description: { type: String }
				, readMore: { title: 	{ type: String }
							, url: 		{ type: String } } }
	, preview: 	{ type:		{ type: String
							, default: 'text' }
				, link: 	{ type: { type: String
									, default: 'inner' }
							, url: 	{ type: String }
							, text: { type: String } }
				, content: 	{ type: mongoose.Schema.Types.Mixed } 
				, size: 	{ type: String
							, default: '1x1' } 
				, bgColor: 	{ type: String
							, default: '#ffffff' } }
	, content: 	{ type:		{ type: mongoose.Schema.Types.Mixed
							, default: 'text' }
				, content: 	{ type: mongoose.Schema.Types.Mixed } 
				, bgColor: 	{ type: String
							, default: '#ffffff' } }
	, categories: 	{ type: Object}
	, status: 	{ type: Boolean
				, default: false
				, index: true }
	, name:		{ type: String
				, required: true }

});

/*
 * Users manipulation
 */
function createReq(id, data, model){
	var _this = model;
	return function(callback){
		_this.update({_id:id}, {categories: data}, function(err,doc){
			if(err)
				callback(err);
			callback(null,doc);
		})
	}
}
module.exports = function(extendStaticMethods, cb){

	ArticlesSchema.statics = extendStaticMethods('Articles', ['list','get','add','edit','delete']);

	ArticlesSchema.statics.resort = function(data, cb){
		var functions = {}
			, _this = this;
		for (var i in data){
			var id = i
				, cat = data[i]
				, func = createReq(id, cat, _this.model('Articles'));
			functions[id] = func;
		}
		async.parallel(functions, function(err,results){
			if (err)
				return cb(err);
			_this.model('Articles').find({},{},{},function(err,doc){
				if (err)
					return cb(err)
				return cb(doc);
			});
		})
	}
	/*
	 * Users Model
	 */
	return cb(db.model('Articles', ArticlesSchema));
};
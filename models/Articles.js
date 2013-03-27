var mongoose = require('mongoose');
var db = mongoose.connection
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
				, content: 	{ type: String } 
				, bgColor: 	{ type: String
							, default: '#ffffff' } }
	, categories: 	{ type: Object}
	, status: 	{ type: Boolean
				, default: false }

});

/*
 * Users manipulation
 */

module.exports = function(extendStaticMethods, cb){

	ArticlesSchema.statics = extendStaticMethods('Articles', ['list','get','add','edit','delete']);
	/*
	 * Users Model
	 */
	return cb(db.model('Articles', ArticlesSchema));
};
var mongoose = require('mongoose');
var db = mongoose.connection
/*
 * Users Schema
 */
var swfsSchema = new mongoose.Schema(	{ fileName: String
										, hashName: String
										, params: String
										, external: String });

/*
 * Users manipulation
 */

module.exports = function(extendStaticMethods, cb){

	swfsSchema.statics = extendStaticMethods('Swfs', ['list','add', 'get', 'delete']);
	/*
	 * Users Model
	 */
	return cb(db.model('Swfs', swfsSchema));
};
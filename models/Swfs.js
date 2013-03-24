var mongoose = require('mongoose');
var db = mongoose.connection
/*
 * Users Schema
 */
var swfsSchema = new mongoose.Schema({
	fileName: String,
	hashName: String,
});

/*
 * Users manipulation
 */

module.exports = function(extendStaticMethods, cb){

	swfsSchema.statics = extendStaticMethods('Swfs', ['list','add']);
	/*
	 * Users Model
	 */
	return cb(db.model('Swfs', swfsSchema));
};
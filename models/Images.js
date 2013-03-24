var mongoose = require('mongoose');
var db = mongoose.connection
/*
 * Users Schema
 */
var imagesSchema = new mongoose.Schema({
	fileName: String,
	hashName: String,
});

/*
 * Users manipulation
 */

module.exports = function(extendStaticMethods, cb){

	imagesSchema.statics = extendStaticMethods('Images', ['list','add']);
	/*
	 * Users Model
	 */
	return cb(db.model('Images', imagesSchema));
};
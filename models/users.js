var mongoose = require('mongoose');
var db = mongoose.connection
/*
 * Users Schema
 */
var usersSchema = new mongoose.Schema({
	name: String,
	videoId: String,
	description: String,
	hidden: {type: Boolean, default: true},
	facebook: {
		shareImage: String,
		shareTitle: String,
		shareText: String,
		shareReference: Number
	}
});

/*
 * Users manipulation
 */

module.exports = function(extendStaticMethods, cb){

	usersSchema.statics = extendStaticMethods('Users', ['list','get','add','edit']);
	/*
	 * Users Model
	 */
	return cb(db.model('Users', usersSchema));
};
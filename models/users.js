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
	}ß
});

/*
 * Users manipulation
 */
usersSchema.statics = extendStaticMethods('Users', ['list','get','add','edit']);

/*
 * Users Model
 */
exports.Users = db.model('Users', usersSchema);

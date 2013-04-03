var mongoose = require('mongoose');
var db = mongoose.connection
/*
 * Users Schema
 */
var leadsSchema = new mongoose.Schema(	{ firstname: String
										, lastname: String
										, email: String
										, phone: String
										, marketing: Boolean
										, type: String } );
module.exports = function(extendStaticMethods, cb){
	leadsSchema.statics = extendStaticMethods( 'Leads', [ 'list','add' ] );
	return cb(db.model('Leads', leadsSchema));
};
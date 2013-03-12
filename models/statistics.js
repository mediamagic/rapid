/*
	 * Statistics Schema
	 */
	var referenceSchema = new mongoose.Schema({
		ref: {type: Number, default: 0, index: true},
		count: Number
	});

	var sharesSchema = new mongoose.Schema({
		ref: {type: String, index: true},
		count: Number
	});

	referenceSchema.statics = extendStaticMethods('References', ['list', 'upd']);
	sharesSchema.statics = extendStaticMethods('Shares', ['list', 'upd']);

	exports.Refs = db.model('References', referenceSchema);
	exports.Shares  = db.model('Shares', sharesSchema);
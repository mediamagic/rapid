/*
	 * Settings Schema
	 */
	var settingsSchema = new mongoose.Schema({
		modeState: {type: Boolean, default: true},
		title: String,
		facebook: {
			shareTitle: String,
			shareText: String,
			shareReference: Number
		}
	});

	/*
	 * Settings Manipulation
	 */
	settingsSchema.statics = extendStaticMethods('Settings', ['list', 'edit']);
	settingsSchema.statics.populate = function(data,cb){
		this.model('Settings').find({}, function(err,doc){
			if (err)
				return cb(err)
			if (typeof(doc) == 'null' || typeof(doc) == 'undefined' || doc.length == 0) {
				var Settings = db.model('Settings', settingsSchema);
				var tmp = new Settings(data);
				tmp.save(function(err,doc){
					if (err)
						return cb(err)
					return cb(doc);
				});
			} else {
				return cb();
			}
		});
	}
	settingsSchema.statics.list = function(params, cb){
		this.model('Settings').findOne(params,{},{sort:{dateCreated: 1}}).lean().exec(function(err,doc){
			if (err)
				return cb(err);
			return cb(null,doc);
		});
	}
	
	/*
	 * Settings Model
	 */
	exports.Settings = db.model('Settings', settingsSchema);

	/*
	 * Settings Auto-populate
	 */
	exports.Settings.count({}, function(err,c){
		if(err)
			return err;
		if (c == 0) {
			exports.Settings.populate({title: 'Telma Cookies'}, function(err, doc){
				if(err)
					return err;
			});
		} else 
			return;
	})
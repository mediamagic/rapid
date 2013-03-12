
	/*
	 * Power Users Schema
	 */
	var powerUsersSchema = new mongoose.Schema({
		username: {type: String, required: true, index: {unique:true} },
		password: {type: String, required: true},
		email: String,
		lastLogin: {type: Date, default: Date.now},
		lastIp: String,
		level: Number,
		name: {
			first: String,
			last: String
		},
		dateCreated: {type: Date, default: Date.now}
	});

	/*
	 * Power Users Manipulation
	 */
	powerUsersSchema.statics = extendStaticMethods('powerUsers', ['get','add']);
	powerUsersSchema.pre('save', function(next) {
		var user = this;
		if (!user.isModified('password')) return next();
		bcrypt.genSalt(10, function(err, salt) {
			if (err) return next(err);
			bcrypt.hash(user.password, salt, function(err, hash) {
				if (err) return next(err);
				user.password = hash;
				next();
			});
		});
	});
	powerUsersSchema.methods.comparePassword = function(candidatePassword, cb) {
		bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
			if (err) return cb(err);
			cb(null, isMatch);
		});
	};

	/*
	 * Power Users Model
	 */
	exports.powerUsers = db.model('powerUsers', powerUsersSchema);

	/*
	 * Power Users Auto-Populate master user
	 */
	exports.powerUsers.count({}, function(err,c){
		if(err)
			return err;
		if (c == 0) {
			var defaultPowerUser = {
				username: 'Admin',
				password: '$cookies2013!',
				email: 'info@mediamagic.co.il',
				level: 1,
				name: {
					first: 'Master',
					last: 'Admin'
				}
			}
			exports.powerUsers.add(defaultPowerUser, function(err, doc){
				if(err)
					return err;
			});
		} else 
			return;
	});

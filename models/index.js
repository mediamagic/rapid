var mongoose = require('mongoose');
try {
	var bcrypt = require('bcrypt');
} catch(e){

}
//mongoose.set('debug', function(a,b,c,d,e){console.log('---'); console.log(a); console.log(b); console.log(c); console.log(d);})
mongoose.connect('mongodb://localhost/APP');
var db = mongoose.connection
, ObjectId = mongoose.Schema.ObjectId;

function extendStaticMethods(modelName, registerArr){
	var registerArr = (registerArr === undefined) ? [] : registerArr;
	var methods = {}
	var template = {
		list: function(search, cb){
			if (search != undefined)
				try {
					delete search._csrf;
				} catch(e){
					
				}
			this.model(modelName).find(search,{},{sort:{dateCreated: 1}},function(err,doc){
				if (err)
					return cb(err);
				return cb(null,doc);
			});
		},
		get: function(params,cb){
			this.model(modelName).findOne(params, function(err,doc){
				if (err)
					return cb(err);
				return cb(null,doc);
			});
		},
		add: function(data,cb){
			delete data._csrf;
			var tmp = new this(data);
			tmp.save(function(err,doc){
				if(err)
					return cb(err);
				return cb(null,doc);
			});
		},
		edit: function(params,data,cb){
			this.model(modelName).findOne(params, function(err,doc){
				if (err)
					return cb(err);
				doc.set(data);
				doc.save(function(e,d){
					if (e)
						return cb(e);
					return cb(null,doc);
				});
			});
		},
		upd: function(params, data, options, cb){
			this.model(modelName).update(params, data, options, function(err,doc){
				if (err)
					return cb(err)
				return cb(null,doc);
			});
		},
		delete: function(params,cb){
			this.remove(params, function(err,doc){
				if (err)
					return cb(err);
				return cb(null,doc);
			});
		}
	}
	for (var i = 0; i < registerArr.length; i++){
		if (template[registerArr[i]] != undefined) {
			methods[registerArr[i]] = template[registerArr[i]];
		}
	}
	return methods;
}

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
}
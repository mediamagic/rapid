module.exports = function(db){
	function handle(err,doc){
		if (err)
			return err;
		return doc;
	}
	return {
		/*
		 * Statistics Operations
		 */
		index: function(req,res,next){
			db.Images.list({}, function(err,doc){
				return res.send(handle(err,doc));
			});
		},
		create: function(req,res,next){
			var obj 	= req.body
				, fs 	= require('fs');
			if (obj._csrf) delete obj._csrf;
			var tmp = new db.Images(obj.fileName);
			tmp.hashName = tmp._id + '.jpg';
			console.log(req.files);
			fs.readFile(req.files.fileName.path, function(err, data){
				if (err) {
					console.log('error 1');
					console.log(err);
					return res.send(500, err);
				}
				var newPath = global.root + "public/images/imgs/"+tmp.hashName;
				fs.writeFile(newPath, data, function(err){
					tmp.save(function(err,doc){
						if(err) {
							console.log('error 2');
							console.log(err);
							return res.send(handle(err,null));
						}
						return res.send(doc);
					});
				});
			});
		}
	}
}
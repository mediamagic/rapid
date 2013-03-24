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
				, fs 	= require('fs'),
				, path 	= require('path')
			if (obj._csrf) delete obj._csrf;
			var tmp = new db.Images(obj.fileName);
			console.log(req.files);
			fs.readFile(req.files.fileName.path, function(err, data){
				if (err) {
					console.log('error 1');
					console.log(err);
					return res.send(500, err);
				}
				var ext = path.extname(req.fileName.name||'').split('.');
				ext = ext[ext.length - 1];
				tmp.hashName = tmp._id + '.' + ext;
				var newPath = global.root + "public/images/imgs/"+tmp.hashName;
				console.log(newPath);
				fs.writeFile(newPath, data, function(err){
					if (err) {
						console.log('error 3')
						console.log(err);
						return res.send(handle(err,null))
					}
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
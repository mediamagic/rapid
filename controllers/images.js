module.exports = function(db){
	function handle(err,doc){
		if (err)
			return err;
		return doc;
	}
	return {
		load: function(req, res, next) {
			db.Images.get({_id:req.params.id},function(err,doc){
				if (doc) {
					req.image = doc;
					next();
				} else {
					res.send({'error' : 'Image Not Found'}, 404);
				}
	  		});
		},
		index: function(req,res,next){
			db.Images.list({}, function(err,doc){
				return res.send(handle(err,doc));
			});
		},
		create: function(req,res,next){
			var obj 	= req.body
				, fs 	= require('fs')
				, path 	= require('path')
			if (obj._csrf) delete obj._csrf;
			var tmp = new db.Images(obj.fileName);
			fs.readFile(req.files.fileName.path, function(err, data){
				if (err)
					return res.send(500, err);
				var ext = path.extname(req.files.fileName.name||'').split('.');
					ext = ext[ext.length - 1];
				tmp.hashName 	= tmp._id + '.' + ext;
				tmp.fileName 	= req.files.fileName.name;
				var newPath		= global.root + "public/images/imgs/"+tmp.hashName;
				fs.writeFile(newPath, data, function(err){
					if (err)
						return res.send(handle(err,null))
					tmp.save(function(err,doc){
						if(err)
							return res.send(handle(err,null));
						var obj = 	{ fileName: doc.fileName
									, hashName: doc.hashName }
						return res.send(obj);
					});
				});
			});
		},
		delete: function(req,res,next){
			var id = req.image.id;
			db.Images.delete({_id:id}, function(err,doc){
				fs.unlinkSync(global.root + "public/images/imgs/"+req.image.hashName);
				return res.send(handle(err,doc));
			})
		}
	}
}
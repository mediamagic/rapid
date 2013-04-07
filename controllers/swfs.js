var fs 	= require('fs')
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
		load: function(req, res, next) {
			db.Swfs.get({_id:req.params.id},function(err,doc){
				if (doc) {
					req.swf = doc;
					next();
				} else {
					res.send({'error' : 'swf Not Found'}, 404);
				}
	  		});
		},
		index: function(req,res,next){
			db.Swfs.list({}, function(err,doc){
				return res.send(handle(err,doc));
			});
		},
		create: function(req,res,next){
			var obj 	= req.body
				, path 	= require('path');
			if (obj._csrf) delete obj._csrf;
			var tmp = new db.Swfs(obj);
			if (obj.external) {
				tmp.external = true;
				tmp.fileName = obj.fileName;
				tmp.save(function(err,doc){
					if (err)
						return res.send(handle(err,null))
					var obj = 	{ fileName: doc.fileName
								, external: true
								, _id: doc._id }
					return res.send(obj);
				})
			} else {
				fs.readFile(req.files.fileName.path, function(err, data){
					if (err)
						return res.send(500, err);
					var ext = path.extname(req.files.fileName.name||'').split('.');
						ext = ext[ext.length - 1];
					tmp.hashName 	= tmp._id + '.' + ext;
					tmp.fileName 	= req.files.fileName.name;
					var newPath		= global.root + "public/images/swfs/"+tmp.hashName;
					fs.writeFile(newPath, data, function(err){
						if (err)
							return res.send(handle(err,null))
						tmp.save(function(err,doc){
							if(err)
								return res.send(handle(err,null));
							var obj = 	{ fileName: doc.fileName
										, hashName: doc.hashName
										, _id: doc._id }
							return res.send(obj);
						});
					});
				});
			}
		},
		update: function(req,res,next){
			var id = req.swf.id
				, data = req.body;
			db.Swfs.upd({_id:id}, data, function(err,doc){
				return res.send(handle(err,doc));
			});
		},
		del: function(req,res,next){
			var hashName = req.swf.hashName;
			db.Swfs.delete({_id:req.swf._id}, function(err, resp){
				if (err)
					return res.send(handle(err,null));
				if (!resp.external) {
					try {
						fs.unlinkSync(global.root + "public/images/swfs/"+hashName);
					} catch(e) {
						return res.send(handle(e,null));
					}
				}
				return res.send(handle(null,{error:0}));
			})
		}
	}
}
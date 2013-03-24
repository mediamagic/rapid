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
			db.Swfs.list({}, function(err,doc){
				return res.send(handle(err,doc));
			});
		},
		create: function(req,res,next){
			var obj 	= req.body
				, fs 	= require('fs')
				, path 	= require('path');
			if (obj._csrf) delete obj._csrf;
			var tmp = new db.Swfs(obj.fileName);
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
									, hashName: doc.hashName }
						return res.send(obj);
					});
				});
			});
		}
	}
}
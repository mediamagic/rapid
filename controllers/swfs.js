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
				, fs 	= require('fs');
			if (data._csrf) delete data._csrf;
			var tmp = new db.Swfs(obj.fileName);
			tmp.hashName = tmp._id + '.swf';
			fs.readFile(req.files.fileName, function(err, data){
				if (err)
					res.send(500, err);
				var newPath = global.root + "public/images/swf/"+tmp.hashName;
				fs.writeFile(newPath, data, function(err){
					tmp.save(function(err,doc){
						if(err)
							res.send(handle(err,null));
						return res.send(doc);
					});
				});
			});
		}
	}
}
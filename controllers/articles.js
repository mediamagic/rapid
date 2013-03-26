module.exports = function(db) {
	function handle(err,doc){
		if (err)
			return err;
		return doc;
	}
	return {
		/*
		 * User Operations
		 */
		load: function(req, res, next) {
			db.Articles.get({_id:req.params.id},function(err,doc){
				if (doc) {
					req.article = doc;
					next();
				} else {
					res.send({'error' : 'Article Not Found'}, 404);
				}
	  		});
		},
		index: function(req,res,next){
			db.Articles.find({},{},{},function(err,doc){
				return res.send(handle(err,doc));
			});
		},
		create: function(req,res,next){
			var data = req.body;
			db.Articles.add(data, function(err,doc){
				return res.send(handle(err,doc));
			});
		},
		show: function(req,res,next){
			return res.send(req.article);
		},
		update: function(req,res,next){
			var id = req.article.id;
			var data = req.body;
			db.Articles.edit({_id:id}, data, function(err,doc){
				return res.send(handle(err,doc));
			});
		}
	}
}
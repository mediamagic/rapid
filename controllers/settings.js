module.exports = function(db){
	function handle(err,doc){
		if (err)
			return err;
		return doc;
	}
	return {
		/*
		 * Settings Operations
		 */
		index: function(req,res,next){
			db.Settings.list({}, function(err,doc){
				return res.send(handle(err,doc));
			});
		},
		update: function(req,res,next){
			var id = req.params.id
				, data = req.body;
			db.Settings.edit({}, data, function(err,doc){
				return res.send(handle(err,doc));
			});
		},
		updateCategories: function(req,res,next){
			var id = req.params.id
				, data = req.body;
			db.Settings.findOne({}, function(err,doc){
				var itm = doc.categories;
				itm.set({categories:data})
				itm.save(function(err,doc){
					return res.send(handle(err,doc));
				});
			})
		}
	}
}
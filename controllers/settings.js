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
			var id = req.params.id;
			var data = req.body;
			db.Settings.edit({}, data, function(err,doc){
				return res.send(handle(err,doc));
			});
		}
	}
}
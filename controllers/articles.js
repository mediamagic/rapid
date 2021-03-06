var fs = require('fs');


module.exports = function(db) {
	function handle(err,doc){
		if (err)
			return err;
		if (doc==1)
			return {error:0};
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
			var finder = {}
			if (req.headers.referer.indexOf('admin') <0)
				finder.status = true;
			db.Articles.find(finder,{},{},function(err,doc){
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
		},
		del: function(req,res,next){
			var id = req.article.id;
			db.Articles.findOne({_id:id}, function(err,doc){
				var preview = doc.preview
					, content = doc.content
					, unlinkArr = []
					, searchArr = []
				if (preview.type === 'image'){
					unlinkArr = unlinkArr.concat(preview.content);
				}

				if (content.type === 'image'){
					unlinkArr = unlinkArr.concat(content.content);
				}
				for (var i=0;i<unlinkArr.length;i++){
				 	fs.unlinkSync(global.root + "public/images/imgs/"+unlinkArr[i].hashName);
					searchArr.push(unlinkArr[i].hashName);
				}
				db.Articles.delete({_id:id}, function(err,doc){
					if (unlinkArr.length > 0)
						db.Images.remove({hashName: { $in: searchArr }}, function(err,docs){
							return res.send(handle(err,{error: 0, type: 'removed article and images'}));
						})
					else
						return res.send(handle(err,{error: 0, type: 'removed article no images'}));
				})
			})
		},
		resort: function(req,res,ext){
			var data = req.body;
			db.Articles.resort(data, function(err,doc){
				return res.send(handle(err,doc));
			})
		}
	}
}
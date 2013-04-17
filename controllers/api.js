module.exports = function(db){
	var csv = require('csv')
	, methods = {}
	/*
	 * Gereric api utils
	 */
	methods.videoCheck = function (req,res,next) {
		var videoID = req.params.id;
		var http = require('http');
		var options = {
			host: "www.youtube.com",
			path: "/oembed?url=http%3A%2F%2Fyoutube.com%2Fwatch%3Fv%3D"+videoID+"&format=json"
		};
		var callback = function(response) {
			var str = '';
			response.on('data', function (chunk) {
			str += chunk;
		});
		response.on('end', function () {
		res.setHeader("Content-Type", "application/json");
				res.send(str);
			});
		}
		http.request(options, callback).end();
	}

	methods.createCSV = function(req,res,next){
		var params = {};
		if (req.params.id != undefined)
			params._id = req.params.id;
		db.Leads.list(params, function(err,resp){
			var tmp = [];
			tmp.push('"First Name",','"Last Name",','"Email",','"Phone",','"Marketing",','"Type",', '"Date"\n');
			for (var i = 0; i<resp.length;i++){
				var row = [];
				var val = resp[i];
				row.push('"'+val.firstname+'"','"'+val.lastname+'"','"'+val.email+'"','="'+val.phone+'"','"'+(val.marketing || 'false')+'"','"'+val.type +'"','"'+new Date(parseInt(val._id.toString().slice(0,8), 16)*1000)+'"\n')
				row = row.join(',');
				tmp.push(row);
				delete row;
			}
			resp = tmp.join('');
			delete tmp;
			csv()
			.from.array( resp )
			.to(function(data){
					res.set("Content-type", 'application/csv; charset=utf8');
					return res.end('\ufeff' + data, 'utf8');
				});
		});
	}

	methods.upload = function(req, res){
		if (req.params.type != 'leaders') {
			console.log(req.params.type)
			return res.send(403);
		}
		var fs = require('fs');
		fs.readFile(req.files.leadersImage.path, function(err, data){
			if (err)
				res.send(500, err);
			var newPath = global.root + "public/images/popup_bg_leaders.jpg";
			fs.writeFile(newPath, data, function(err){
				res.send(200, 'image uploaded');
			});
		});
	}

	return module.exports = methods;
}
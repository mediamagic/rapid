var email 	= require('emailjs')
	, smtp  = email.server.connect( { user: "benny@mmdev.co.il"
									, password: "chipo$$2010"
									, host: "smtp.gmail.com"
									, port: 465
									, ssl: true })
module.exports = function(db) {
	function handle(err,doc){
		if (err)
			return err;
		return doc;
	}
	return {
		index: function(req,res,next){
			db.Leads.find({},{},{},function(err,doc){
				return res.send(handle(err,doc));
			});
		},
		create: function(req,res,next){
			var data = req.body;
			db.Leads.add(data, function(err,doc){
				if (err)
					return res.send(handle(err,doc));
				var mail	= 	"<html><body>"+
								"<br> date sent: "+
								new Date().toISOString()
  									.replace(/T/, ' ')
  									.replace(/\..+/, '') +
								"<br> first name: "+
								data.firstname +
								"<br> last name: "+
								data.lastname +
								"<br> phone: "+
								data.phone +
								"<br> email: "+
								data.email +
								"<br> type: "+
								data.type +
								"<br> marketing: "+
								data.marketing +
								"</body></html>"
				, message =	{ text: "i hope this works"
							, from: "mediamagic mail server <info@mediamagic.co.il>"
							, to: "Skoda <skoda-service@champ.co.il>"
							, subject: "Skoda Rapid - " + data.type.toUpperCase()
							, attachment: 	{ data: mail
											, alternative:true } };
				res.send(handle(err,doc));
				smtp.send(message, function(err, message) { 
					return
				});
			});
		}
	}
}
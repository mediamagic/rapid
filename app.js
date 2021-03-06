var cluster = require('cluster')
  , numCPUs = require('os').cpus().length
  , i       = 0;

if (cluster.isMaster) {
  for (; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('death', function(worker) {
    cluster.fork();
  });
} else {
  var express = require('express')
    , routes  = require('./routes')
    , admin   = require('./routes/admin')
    , http    = require('http')
    , path    = require('path')
    , pass    = require('passport')
    , LocalS  = require('passport-local').Strategy
    , mcache  = require('connect-memcached')(express)
    , compress= require('node-minify')
    , app     = express()
    global.root = process.cwd() + '/';

  app.configure(function(){
    app.set('port', process.env.PORT || 8080);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.compress());
    app.use(express.favicon(__dirname + '/public/favicon.ico'));
    app.use(express.cookieParser()); 
    app.use(express.session(  { secret: "U^Z;$,^j6DZj<GGd"
                              , store: new mcache
                              , cookies:  { secure: false
                                          , maxAge: 86400000 } }));
    app.use(express.bodyParser({ keepExtensions: true}));
    app.use(express.methodOverride());
    app.use(express.csrf());
    app.use(function(req, res, next){
      var token = req.session._csrf
      , cookie  = req.cookies['csrf.token']
      , port    = (app.get('port') == 80 
                  || app.get('port') ==443) 
                  ? '' 
                  : ':'+app.get('port');
      if (token && cookie !== token)
        res.cookie('csrf.token', token);
      res.locals.requested_url = 
        req.protocol + '://' + req.host + req.path;
      next();
    });
    app.use(pass.initialize());
    app.use(pass.session());
    app.use(app.router);
  });

  app.configure('development', function(){
    app.use(express.logger('dev'));
    app.use(express.errorHandler());
    app.use(require('less-middleware')( { src: __dirname + '/public'
                                        , compress: true
                                        , optimization: 2 }));
    app.use(express.static(path.join(__dirname, 'public')));
    // new compress.minify({
    //   type: 'gcc',
    //   fileIn: ['public/javascripts/app.js', 'public/javascripts/controllers.js'],
    //   fileOut: 'public/javascripts/app.min.js',
    //   callback: function(err){
    //   console.log(err);
    //   }
    // });
    console.log('development mode');
  });

  app.configure('production', function(){
    var live = 86400000;
    app.use(express.static(path.join(__dirname, 'public'), {maxAge: live}));
    console.log('production mode');
  });

  //MIDDLEWARE
  function ensureAuthenticated(req, res, next){
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/#/login');
  }

  //load db async
  require('./models')(function(resp){
      Articles    = require('./controllers/articles')(resp)
    , Settings    = require('./controllers/settings')(resp)
    , Images      = require('./controllers/images')(resp)
    , Swfs        = require('./controllers/swfs')(resp)
    , Stats       = require('./controllers/statistics')(resp)
    , PowerUsers  = require('./controllers/powerUsers')(resp)
    , Api         = require('./controllers/api')(resp)
    , Leads       = require('./controllers/leads')(resp)

    pass.use(new LocalS(
      function(username, password, done){
        resp.powerUsers.find({username:username}, function(err,doc){
          if(err)
            return done(err)
          if (doc.length < 1)
            return done(null,false)
          doc[0].comparePassword(password, function(err,resp){
            if (err)
              return done(err)
            if (resp)
              return done(null, doc[0]);
            else
              return done(null, false);
          })
        })
      }
    ))

    pass.serializeUser(function(user,done){
      return done(null,user._id);
    })

    pass.deserializeUser(function(id,done){
      if (!id)
        return done(null,false);
      resp.powerUsers.find({_id: id}, function(err, resp){
        return done(null,resp);
      })
    })

    //VIEWS
    app.get ('/', routes.index);
    app.get ('/views/:view.html', routes.views);
    app.get ('/views/admin/:view.html', ensureAuthenticated, admin.views);
    app.get ('/admin*', ensureAuthenticated, admin.index);
    app.get ('/logout', function(req,res){
      req.logout();
      res.redirect('/');
    });

    //API
    app.post('/api/login', pass.authenticate('local'), function(req,res) {
      console.log(req.user);
      if (req.user) res.json({error:0});
      else res.send(401);
    });
    app.get ('/api/createCSV', ensureAuthenticated,  Api.createCSV);
    app.get ('/api/videoCheck/:id', Api.videoCheck);

    app.get ('/api/uploads/images', ensureAuthenticated, Images.index);
    app.post('/api/uploads/images', ensureAuthenticated, Images.create);
    app.del ('/api/uploads/images/:id', ensureAuthenticated, Images.load, Images.delete);
    app.get ('/api/uploads/swfs', ensureAuthenticated, Swfs.index);
    app.post('/api/uploads/swfs', ensureAuthenticated, Swfs.create);
    app.del ('/api/uploads/swfs/:id', ensureAuthenticated, Swfs.load, Swfs.del);
    app.put ('/api/uploads/swfs/:id', ensureAuthenticated, Swfs.load, Swfs.update);

    //RESTful RESOURCES
    app.get ('/resources/articles', Articles.index);
    app.get ('/resources/articles/:id', Articles.load, Articles.show);
    app.post('/resources/articles', ensureAuthenticated, Articles.create);
    app.put ('/resources/articles/resort', ensureAuthenticated, Articles.resort);
    app.put ('/resources/articles/:id', ensureAuthenticated, Articles.load, Articles.update);
    app.del ('/resources/articles/:id', ensureAuthenticated, Articles.load, Articles.del);
    app.put ('/resources/settings/categories/:key', ensureAuthenticated, Settings.updateCategories);
    app.del ('/resources/settings/categories/:key', ensureAuthenticated, Settings.deleteCategory);
    app.post('/resources/settings/categories', ensureAuthenticated, Settings.createCategory);
    app.get ('/resources/settings', Settings.index);
    app.put ('/resources/settings', ensureAuthenticated, Settings.update);
    app.post('/resources/stats/:type', Stats.create);
    app.get ('/resources/stats/:type', ensureAuthenticated, Stats.index);

    app.post('/resources/leads', Leads.create);
    app.get ('/resources/leads', ensureAuthenticated, Leads.index);

    var server = http.createServer(app);
    server.listen(app.get('port'), function(){
      console.log("Express server listening on port " + app.get('port'));
    });
  });
}
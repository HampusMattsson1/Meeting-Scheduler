/**
 * Index
 *
 * @author Hampus Mattsson
 */
"use strict";

// Change these to your situation
const port = 3000;
// const IP = "192.168.10.153";
const IP = "193.11.185.46";



const express = require("express");
const app = express();
// const Routes = require("./routes/routes.js");
const path = require("path");
const database = require("./src/scheduler_src.js");
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};



// var express = require('express');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var passport = require('passport');
var util = require('util');
var bunyan = require('bunyan');
var config = require('./config');

const urlencodeParser = bodyParser.urlencoded({"extended": false});

// set up database for express session
var MongoStore = require('connect-mongo')(expressSession);
var mongoose = require('mongoose');

// Start QuickStart here

var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

var log = bunyan.createLogger({
    name: 'Microsoft OIDC Example Web Application'
});


passport.serializeUser(function(user, done) {
    done(null, user.oid);
  });
  
  passport.deserializeUser(function(oid, done) {
    findByOid(oid, function (err, user) {
      done(err, user);
    });
  });
  
  // array to hold logged in users
  var users = [];
  
  var findByOid = function(oid, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
      var user = users[i];
     log.info('we are using user: ', user);
      if (user.oid === oid) {
        return fn(null, user);
      }
    }
    return fn(null, null);
  };


  passport.use(new OIDCStrategy({
    identityMetadata: config.creds.identityMetadata,
    clientID: config.creds.clientID,
    responseType: config.creds.responseType,
    responseMode: config.creds.responseMode,
    redirectUrl: config.creds.redirectUrl,
    allowHttpForRedirectUrl: config.creds.allowHttpForRedirectUrl,
    clientSecret: config.creds.clientSecret,
    validateIssuer: config.creds.validateIssuer,
    isB2C: config.creds.isB2C,
    issuer: config.creds.issuer,
    passReqToCallback: config.creds.passReqToCallback,
    scope: config.creds.scope,
    loggingLevel: config.creds.loggingLevel,
    nonceLifetime: config.creds.nonceLifetime,
    nonceMaxAmount: config.creds.nonceMaxAmount,
    useCookieInsteadOfSession: config.creds.useCookieInsteadOfSession,
    cookieEncryptionKeys: config.creds.cookieEncryptionKeys,
    clockSkew: config.creds.clockSkew,
  },
  function(iss, sub, profile, accessToken, refreshToken, done) {
    if (!profile.oid) {
      return done(new Error("No oid found"), null);
    }
    // asynchronous verification, for effect...
    process.nextTick(function () {
      findByOid(profile.oid, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          // "Auto-registration"
          users.push(profile);
          return done(null, profile);
        }
        return done(null, user);
      });
    });
  }
));


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
// app.use(express.logger());
app.use(methodOverride());
app.use(cookieParser());

// set up session middleware
if (config.useMongoDBSessionStore) {
  mongoose.connect(config.databaseUri);
  app.use(express.session({
    secret: 'secret',
    cookie: {maxAge: config.mongoDBSessionMaxAge * 1000},
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      clear_interval: config.mongoDBSessionMaxAge
    })
  }));
} else {
  app.use(expressSession({ secret: 'keyboard cat', resave: true, saveUninitialized: false }));
}

app.use(bodyParser.urlencoded({ extended : true }));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
// app.use(app.router);

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
  };
  
  app.get('/', function(req, res) {
    res.render('index', { user: req.user });
  });
  
  // '/account' is only available to logged in user
  app.get('/account', ensureAuthenticated, function(req, res) {
    let params = {
      active: { home: true }
    };
    res.render('scheduler/account', { user: req.user });
  });
  
  app.get('/login',
    function(req, res, next) {
      passport.authenticate('azuread-openidconnect', 
        { 
          response: res,                      // required
          resourceURL: config.resourceURL,    // optional. Provide a value if you want to specify the resource.
          customState: 'my_state',            // optional. Provide a value if you want to provide custom state value.
          failureRedirect: '/fail' 
        }
      )(req, res, next);
    },
    function(req, res) {
      log.info('Login was called in the Sample');
      res.redirect('/');
  });
  
  // 'GET returnURL'
  // `passport.authenticate` will try to authenticate the content returned in
  // query (such as authorization code). If authentication fails, user will be
  // redirected to '/' (home page); otherwise, it passes to the next middleware.
  app.get('/auth/openid/return',
    function(req, res, next) {
      passport.authenticate('azuread-openidconnect', 
        { 
          response: res,                      // required
          failureRedirect: '/fail'  
        }
      )(req, res, next);
    },
    function(req, res) {
      log.info('We received a return from AzureAD.');
      res.redirect('/');
    });
  
  // 'POST returnURL'
  // `passport.authenticate` will try to authenticate the content returned in
  // body (such as authorization code). If authentication fails, user will be
  // redirected to '/' (home page); otherwise, it passes to the next middleware.
  app.post('/auth/openid/return',
    function(req, res, next) {
      passport.authenticate('azuread-openidconnect', 
        { 
          response: res,                      // required
          failureRedirect: '/fail'  
        }
      )(req, res, next);
    },
    function(req, res) {
      log.info('We received a return from AzureAD.');
      res.redirect('/');
    });
  
  // 'logout' route, logout from passport, and destroy the session with AAD.
  app.get('/logout', function(req, res){
    req.session.destroy(function(err) {
      req.logOut();
      res.redirect(config.destroySessionUrl);
    });
  });
  
// app.listen(port);


// MY GETS & POSTS

app.get("/scheme", async (req, res) => {

  res.render("scheduler/scheme", { user: req.user });
});

app.post('/scheme',
    function(req, res, next) {
      passport.authenticate('azuread-openidconnect', 
        { 
          response: res,                      // required
          failureRedirect: '/fail'  
        }
      )(req, res, next);
    },
    async function(req, res) {
      log.info('We received a return from AzureAD.');
      // Adds user to database if it's not already there
      await database.addUser(req.user._json['email'], req.user.displayName);
      res.redirect('/scheme');
});

app.get('/data', async function(req, res){
  
  log.info('CALENDER TRIED TO ACCESS DATABASE');
  let data = await database.viewScheme(req.user._json['email']);
  res.send(data);

});


app.get("/scheduler", async (req, res) => {
  res.render("scheduler/scheduler", { user: req.user });
});

app.post("/scheduler", urlencodeParser, async (req, res) => {
  await database.createMeeting(req.user._json['email'], req.body.sdate, req.body.edate, req.body.text, "0");

  console.log("Meeting created");
  res.redirect("/scheme");
});


app.get("/v_scheduler", async (req, res) => {

  res.render("scheduler/v_scheduler", { user: req.user });
});

app.post("/v_scheduler", urlencodeParser, async (req, res) => {

  await database.createMeeting(req.user._json['email'], null, null, req.body.text, "1");

  let url = await database.viewNewVmeeting(req.user._json['email']);

  console.log("V_meeting created");
  res.redirect("/v_scheduler/" + url.id);
});

app.get("/v_scheduler/:id", ensureAuthenticated, async (req, res) => {

  let data = {
    // res: await database.viewNewVmeeting(req.user._json['email']),
    res: req.params.id,
    meeting_times: await database.getMeetingTimes(req.params.id),
    user: req.user
  };

  res.render("scheduler/v_scheduler_id", data);
});

app.post("/v_scheduler/:id", urlencodeParser, async (req, res) => {

  await database.addMeetingTime(req.body.id, req.body.sdate, req.body.edate);
  console.log("Meeting time created");

  res.redirect("/v_scheduler/" + req.body.id);
});

app.get("/meetings", ensureAuthenticated, async (req, res) => {

  let data = {
    res: await database.getMeetings(req.user._json['email']),
    user: req.user
  }

  res.render("scheduler/meetings", data);
});


app.get("/invite/:id", ensureAuthenticated, async (req, res) => {

  let data = {
    res: await database.viewMeeting(req.params.id),
    user: req.user
  };

  res.render("scheduler/invite", data);
});

app.post("/invite/:id", urlencodeParser, async (req, res) => {

  await database.joinMeeting()

  console.log("Meeting joined");
  res.redirect("/scheme");
});


app.get("/votepool/:id", async (req, res) => {

  let data = {
    meeting_id: await req.params.id,
    res: await database.votePool(req.params.id),
    user: req.user
  };

  res.render("scheduler/votepool", data);
});

app.get("/votepool/:id/:time", async (req, res) => {

  let data = {
    meeting_id: await req.params.id,
    time: await req.params.time,
    user: req.user
  };

  let values = await database.getTimes(data.time, data.meeting_id);

  let check = await database.checkOwner(data.meeting_id, req.user._json['email']);

  if (check)
  {
  await database.finalTime(data.meeting_id, values.start_date, values.end_date);
  console.log("TIME FINALIZED");
  }
  // res.render("scheduler/votepool", data);
  res.redirect("../../meetings");
});


app.get("/vote/:meeting_id", async (req, res) => {

  let data = {
    meeting_id: await req.params.meeting_id,
    res: await database.votePool(req.params.meeting_id),
    user: req.user
  };

  res.render("scheduler/vote", data);
});

app.get("/vote/:meeting_id/:vote_id", async (req, res) => {

  let check = await database.voteCheck(req.params.vote_id, req.user._json['email']);
  console.log(check);

  try {
    if (!check) {
      await database.addVote(req.params.meeting_id, req.params.vote_id, req.user._json['email']);
      console.log("VOTE ADDED");
    }
    else {
      console.log("YOU HAVE ALREADY VOTED");
    }
  }
  catch {
    console.log("Unable to add vote");
  }


  // let data = {
  //   res: await database.votePool(req.params.id),
  //   user: req.user
  // };

  // res.render("scheduler/vote", data);
  res.redirect("../../vote/" + req.params.meeting_id);
});


app.get("/edit/:meeting_id", ensureAuthenticated, async (req, res) => {

  let check = await database.checkOwner(req.params.id, req.user._json['email']);

  if (check)
  {
  let data = {
    meeting_id: await req.params.meeting_id,
    res: await database.editViewMeeting(req.params.meeting_id),
    user: req.user
  };

  res.render("scheduler/edit", data);
  }
  else
  {
    res.redirect("/scheme");
  }

});

app.post("/edit/:meeting_id", urlencodeParser, async (req, res) => {

  await database.saveMeetingEdit(req.body.id, req.user._json['email'], req.body.sdate, req.body.edate, req.body.text);
  console.log("Meeting settings saved");
  
  res.redirect("/meetings");
});

app.get("/edit/:meeting_id/delete", ensureAuthenticated, async (req, res) => {

  // CHECKA SÅ DU SKAPADE MÖTET
  let check = await database.checkOwner(req.params.meeting_id, req.user._json['email']);

  if (check) 
  {
    await database.deleteMeeting(req.params.meeting_id);
    console.log("MEETING DELETED");
  };

  res.redirect("/meetings");
});




app.get("/fail", async (req, res) => {
  res.render("scheduler/fail",{ user: req.user });
});



app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));


app.use((req, res, next) => {
    console.log(`Got a request on: ${req.path} (${req.method})`);
    next();
});

// app.use(Routes);


https.createServer(options, app).listen(port, IP, () => {
      console.log("Server listening on: " + IP + ":" + port);
});


// app.listen(port, '192.168.10.153', () => {
//     console.log("Server listening on: " + port);
// });

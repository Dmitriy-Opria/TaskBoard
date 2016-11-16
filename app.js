var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    debug = require('debug')('taskBoardProject:server'),
    lessMiddleware = require('less-middleware'),
    locale = require("locale"),
    supported = ["ru","en",'uk'],
    language,
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser');

//var form = new formidable.IncomingForm()


var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
var language;
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public/stylesheets')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(locale(supported));
app.use(function(req, res, next){
    language = req.locale;
    next();
});
app.locals.performDate = function(data){
    const moment = require('moment');
        moment.locale(language);
        return moment(data).format('D MMMM YYYY');
};
//========================= session ================================
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
//const mongoose = require('mongoose');
app.use(session({
    name: 'lalal',
    secret: 'foo',
    cookie: { path: '/', httpOnly: true, secure: false,maxAge: 60000 },
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ url: 'mongodb://localhost:27017/session' })
}));
//===================================================================
//========================= passport.js =============================

const passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy,
    User = require("./models/Task").User;

passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    },
    function(username, password, done) {
        User.findOne({email:username}, function(err,user){
            "use strict";
            if(err){
                console.error(err);
                return done(null, false, { message: 'Incorrect username.' });
            }
            else{

                if(user.password!==password) return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        })
    }
));
app.use(passport.initialize());
app.use(passport.session());
//app.use(app.router);
app.post('/login', passport.authenticate('local', {
    successRedirect: '/board',
    failureRedirect: '/'
}));
passport.serializeUser(function(user, done) {
    console.log(user);
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    console.log("deserialize:"+user);
    User.findOne({email:user.email}, function(err, user) {
        done(err, user);
   });
});
//===================================================================
app.use('/', routes);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

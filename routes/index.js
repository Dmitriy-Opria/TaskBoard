const express = require('express'),
    router = express.Router(),
    os = require('os'),
    fs = require('fs'),
    path = require('path'),
    multer = require('multer'),
    Task = require('../models/Task').Task,
    User = require('../models/Task').User,
    pug = require('pug'),
    async = require('async');

const upload = multer({dest: os.tmpdir()});// save to system tmp dir

router.get('/', function (req, res) {
    "use strict";
    res.render('welcome',{user: req.session.user});
});
router.get('/login',(req, res)=>{
    "use strict";
    if (req.session.user) {
        res.redirect("/board");
    }
    else{
        res.render("loginform");
    }
});
router.get('/register', (req,res)=>{
    "use strict";
    res.render("registerform");
});
router.post('/registerme', function (req, res) {
    "use strict";
    User.create({
        name: req.body.username,
        email: req.body.useremail,
        password: req.body.userpassword
    }, (err, savedObject) => {
        if (err) {
            console.error(err);
        }
        else {
            req.session.user = savedObject;
            req.session.save(function (err) {
                if (err) {
                    console.error(err);
                }
                else {
                    console.log(savedObject);
                    res.redirect("/profile");
                }
            });
        }
    })
});
router.get('/profile',(req,res)=>{
    "use strict";
    if(req.session.user){
        res.render("profile",{user: req.session.user});
    }
    else{
        res.redirect("/login");
    }
});
/* GET board page. */
router.get('/board', function (req, res) {
    console.log(req.user);
    if (req.session.user) {
        Task.find({}, function (err, tasks) {
            if (err) {
                console.error(err);
                res.statusCode(500);
            }
            else {
                res.render('index', {tasks: tasks});
            }
        });
    }
    else {
        res.redirect("/login");
    }
});
router.post('/logout', (req, res) => {
    "use strict";
    // req.logout();
    delete req.session.user;
    res.sendStatus(200).end();
});
router.post('/create', upload.array('files', 4), function (req, res) {
    "use strict";
    if (req.files.length > 0) {
        let arrayOfTask = [];
        req.files.forEach((elem) => {
            arrayOfTask.push((callback) => {
                fs.readFile(elem.path, (err, content) => {
                    if (!err) {
                        fs.writeFile(path.join(__dirname, '../public/images/') + elem.originalname, content, (err) => {
                            if (err) {
                                callback(err, null);
                            }
                            else {
                                callback(null, "images/" + elem.originalname);
                            }
                        })
                    }
                    else {
                        console.error(err);
                    }
                })
            });
        });

        async.parallel(arrayOfTask, (err, results) => {
            Task.create({
                description: req.body.description,
                priority: req.body.priority,
                images: results
            }, (err, object) => {
                if (err) {
                    console.error(err);
                    res.sendStatus(500);
                }
                object.dateOfcreation = req.app.locals.performDate(object.dateOfcreation);
                let template = pug.renderFile(path.join(__dirname, '../models/taskCard.pug'), {task: object});
                res.status(201).json({html: template});
            });
        })

    } else {
        Task.create({
            description: req.body.description,
            priority: req.body.priority
        }, function (err, object) {
            if (err) {
                console.error(err);
            }
            object.date = req.app.locals.performDate(object.dateOfcreation);
            let template = pug.renderFile(path.join(__dirname, '../models/taskCard.pug'), {task: object});
            res.status(201).json({html: template});
        });
    }

});
router.post('/change-state', function (req, res) {
    Task.findById(req.body.id, function (err, doc) {
        if (err) {
            res.sendStatus(404);
        }
        doc.status = req.body.status;
        doc.save(function (err) {
            if (err) res.sendStatus(500);
            res.sendStatus(200);
        });
    });
});
router.get('/task/:id', function (req, res, next) {

    Task.findById(req.params.id, function (err, doc) {
        if (err) next(err);
        res.render('taskdesk', {task: doc})
    })
});
router.post("/remove", function (req, res) {
    "use strict";
    if (!req.body.id) res.sendStatus(400);
    Task.remove({_id: req.body.id}, function (err) {
        if (err) res.sendStatus(500);
        res.sendStatus(200);
    });
});

module.exports = router;

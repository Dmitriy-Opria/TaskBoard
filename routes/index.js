const express = require('express'),
    router = express.Router(),
    os = require('os'),
    fs = require('fs'),
    path = require('path'),
    multer = require('multer'),
    Task = require('../models/Task').Task,
    User = require('../models/Task').User,
    Project = require('../models/Task').Project,
    pug = require('pug'),
    async = require('async'),
    mongoose = require('mongoose');

const upload = multer({dest: os.tmpdir()});// save to system tmp dir

router.get('/', (req, res) => {
    "use strict";
    res.render('welcome',{user: req.session.user});
});
router.get('/login',(req, res)=>{
    "use strict";
    if (req.session.user) {
        res.redirect("/profile");
    }
    else{
        res.render("loginform");
    }
});
router.get('/contacts',(req, res)=>{
    "use strict";
    console.log(req.session.user);
    if (req.session.user) {
        User.findById(req.session.user._id, function (err, user) {
            if (err) {
                console.error(err);
                res.statusCode(500);
            }
            else {
                res.render('contacts',{user: user});
            }
        });


    }
    else{
        res.redirect("/register");
    }
});
router.get('/register', (req,res)=>{
    "use strict";
    res.render("registerform");
});
router.post('/registerme', (req, res) => {
    /*
     const UserModel = new Schema({
     name:  String,
     surname: String,
     avatar:{ type: String, default: '/images/avatars/no-avatar_jpg.jpg' },
     email:  String,
     tel: { type: String, default: '-'},
     skype: { type: String, default: '-'},
     password: String,
     tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }]
     });
     */
    "use strict";
    console.log(req.body);
    User.create({
        name: req.body.userFirstName,
        surname: req.body.userLastName,
        email: req.body.userEmail,
        password: req.body.password
    }, (err, savedObject) => {
        if (err) {
            console.error(err);
        }
        else {
            req.session.user = savedObject;
            req.session.save((err) => {
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
        User
            .findById(req.session.user._id)
            .populate('projects') // only works if we pushed refs to children
            .exec((err, person) => {
                if (err) next(err);
                res.render("profile", {user: person});
            });

    }
    else{
        res.redirect("/login");
    }
});
/* GET board page. */
router.get('/board', (req, res) => {
    if (req.session.user) {
        Project
            .findOne({ _id: req.query.project })
            .populate('tasks') // only works if we pushed refs to children
            .exec(function (err, tasks) {
                if (err) {
                    console.error(err);
                    res.statusCode(500);
                }
                else {
                    console.log(tasks.tasks);
                   res.render('index', {user: req.session.user, tasks: tasks.tasks, ownerProject: req.query.project});
                }
            })

    }
    else {
        res.redirect("/login");
    }
});
router.get('/logout', (req, res) => {
    "use strict";
    // req.logout();
    delete req.session.user;
    req.session.save((err) => {
        if (err) {
            console.error(err);
            res.redirect('/');
        }
        else {
            res.redirect("/");
        }
    });
});
router.post('/create', upload.array('files', 4), (req, res, next) => {
    "use strict";

    console.log(req.body);
/*    var headers = req.headers.referer,
        projectID = headers.split("=");*/

    //console.log(projectID[1]);
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
                else {
                    Project.findOne({_id: req.body.ownerProject}, (err, doc) => {
                        doc.tasks.push(object);
                        doc.save((err) => {
                            if(err){
                                next(err);
                            }
                            else{
                                res.status(200);
                            }
                        });
                    })
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
        }, (err, object) => {
            if (err) {
                console.error(err);
            }
            else {
                Project.findOne({_id: req.body.ownerProject}, (err, doc) => {
                    doc.tasks.push(object);
                    doc.save((err) => {
                        if(err){
                            next(err);
                        }
                        else{
                            res.status(200);
                        }
                    });
                })
            }
            object.date = req.app.locals.performDate(object.dateOfcreation);
            let template = pug.renderFile(path.join(__dirname, '../models/taskCard.pug'), {task: object});
            res.status(201).json({html: template});
        });
    }

});
router.post('/change-state', (req, res) => {
    Task.findById(req.body.id, (err, doc) => {
        if (err) {
            res.sendStatus(404);
        }
        doc.status = req.body.status;
        doc.save(err => {
            if (err) res.sendStatus(500);
            res.sendStatus(200);
        });
    });
});
router.post('/change-avatar', upload.array('avatar', 1),function (req, res, next) {

    var filePath = req.files[0].path;
    var original = req.files[0].originalname;
    fs.readFile(filePath, function (err, content) {
        if(err){
            console.log(1);
            res.sendStatus(500);
        }
        else {
            fs.writeFile(path.join(__dirname, '../public/images/avatars/')+ original, content, function (err) {
                console.log(path.join(__dirname, '../public/images/avatars/') + original);
                if(err){
                    res.sendStatus(500);
                }
                else {
                    User.findByIdAndUpdate(req.session.user._id, {
                            $set: {
                                avatar: "images/avatars/" + original,
                            }
                        },
                        {new: true},
                        function (err) {
                            if (err) {
                                console.error(err);
                            }
                            else {
                                User.findById(req.session.user._id, function (err, person) {
                                    if (err) {
                                        console.error(err);
                                        res.statusCode(500);
                                    }
                                    else {
                                        res.status(201).json({person: person.avatar});
                                    }
                                });
                            }
                        });
                }
            })
        }
    })
});
router.post('/change-password', function (req, res) {
    req.check('password', 'Длина пароля должна быть 4-12 символов').isLength({min: 4, max: 12});
    req.check('confirmPassword', 'Пароли не совпадают').equals(req.body.password);

    var errors = req.validationErrors();
    User.findById(req.session.user._id, function (err, person) {
        if (err) {
            console.error(err);
            res.status(500).json({errInfo: "Ошибка!"});
        }
        else {
            if (person.password === req.body.oldPassword) {
                if (!errors) {
                    User.findByIdAndUpdate(req.session.user._id, {
                            $set: {
                                password: req.body.password
                            }
                        },
                        {new: true},
                        function (err) {
                            if (err) {
                                console.error(err);
                                res.status(500).json({errInfo: "Ошибка!"});
                            }
                            else{
                                res.sendStatus(200);
                            }

                        });
                }
                else{
                    console.log("Have validation errors");
                    res.status(500).json({errInfo: errors});
                }

            }
            else{
                console.log("wrong old password");
                res.status(500).json({errInfo: "Неправильный пароль"});
            }
        }
    });

});
router.post('/change-info', function (req, res) {
    User.findByIdAndUpdate(req.session.user._id, {
            $set: {
                name: req.body.userFirstName,
                surname: req.body.userLastName
            }
        },
        {new: true},
        function (err) {
            if (err) {
                console.error(err);
            }
            else {
                User.findById(req.session.user._id, function (err, info) {
                    if (err) {
                        console.error(err);
                        res.statusCode(500);
                    }
                    else {
                        res.sendStatus(200);
                    }
                });
            }
        });
});
router.post('/change-contacts', function (req, res) {
        User.findByIdAndUpdate(req.session.user._id, {
                $set: {
                    tel: req.body.userTelephone,
                    skype: req.body.userSkype
                }
            },
            {new: true},
            function (err) {
                if (err) {
                    console.error(err);
                }
                else {
                    User.findById(req.session.user._id, function (err, cont) {
                        if (err) {
                            console.error(err);
                            res.statusCode(500);
                        }
                        else {
                            res.sendStatus(200);
                        }
                    });
                }
            });


});
router.get('/task/:id', (req, res, next) => {

    Task.findById(req.params.id, (err, doc) => {
        if (err) next(err);
        res.render('taskdesk', {task: doc})
    })
});
router.post('/remove', (req, res) => {
    "use strict";
    if (!req.body.id) res.sendStatus(400);
    Task.findById(req.body.id, function (err, doc) {
        var filesArray = doc.images;
        for (var i = 0; i < filesArray.length; i++) {
            fs.unlink(path.join(__dirname, '../public/') + filesArray[i], (err) => {
                if (err) res.sendStatus(500);
            });
        }
        Task.remove({_id: req.body.id}, function (err) {
            if (err) {
                res.sendStatus(500);
            }
            else {
                res.sendStatus(200);
            }
        })

    });
});
router.post('/login', (req, res) => {
    "use strict";
    User.findByEmail(req.body.username, (err, user) => {
        if (err) {
            res.redirect('/');
        }
        else {
            req.session.user = user;
            req.session.save((err) => {
                if (err) {
                    console.error(err);
                    res.redirect('/');
                }
                else {
                    res.redirect("/profile");
                }
            });
        }
    })
});
router.post('/newproject', upload.single('cover'), (req, res, next) => {
    "use strict";
    /*
     const ProjectModel = new Schema({
     owner_id: { type: Schema.Types.ObjectId, ref: 'User' },
     name:  String,
     cover: { type: String, default: '/images/dc.png' },
     dateOfcreation:  { type: Date, default: Date.now },
     description:  String,
     tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }]
     });
     */
    req.checkBody('projectname', 'Invalid postparam').notEmpty().isLength({max: 30});
    req.checkBody('projectdescription', 'Invalid postparam').notEmpty().isLength({max: 255});
    if (req.file) {
        if (req.file.size > 8388608) next("Размер обложки проекта слишком большой (8мб максимум)");
        const newFileName = Date.now() + req.file.originalname;
        fs.readFile(req.file.path, function (err, content) {
            if (err) {
                next(err);
            }
            else {
                fs.writeFile(path.join(__dirname, '../public/images/covers/') + newFileName, content, function (err) {
                    if (err) {
                        next(err);
                    }
                    else {
                        Project.create({
                            name: req.body.projectname,
                            description: req.body.projectdescription,
                            cover: 'images/covers/' + newFileName
                        }, (err, project) => {
                            if (err) {
                                next(err);
                            }
                            else {
                                User.findOne({_id: req.session.user._id}, (err, doc) => {
                                    doc.projects.push(project);
                                    doc.save((err, updatedDoc) => {
                                        next(err);
                                        res.redirect('/profile');
                                    });
                                })
                            }
                        })
                    }
                })
            }
        })
    }
    else{
        Project.create({
            name: req.body.projectname,
            description: req.body.projectdescription,
            cover: 'images/dc.png'
        }, (err, project) => {
            if (err) {
                next(err);
            }
            else {
                User.findOne({_id: req.session.user._id}, (err, doc) => {
                    doc.projects.push(project);
                    doc.save((err, updatedDoc) => {
                        next(err);
                        res.redirect('/profile');
                    });
                })
            }
        })
    }





});

module.exports = router;
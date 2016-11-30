/**
 * Created by alexey-dev on 23.10.16.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskModel = new Schema({
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    executant: { type: Schema.Types.ObjectId, ref: 'User' },
    description:  String,
    priority: String,
    images:{ type: Array, default: [] },
    status:  { type: String, default: 'waiting' },
    dateOfcreation:  { type: Date, default: Date.now }
});

/**
 * Created by alexey-home on 16.11.16.
 */

const UserModel = new Schema({
    name:  String,
    surname: String,
    avatar:{ type: String, default: '/images/no-avatar_jpg.jpg' },
    email:  String,
    password: String,
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }]
});

const ProjectModel = new Schema({
    name:  String,
    cover: { type: String, default: '/images/dc.png' },
    dateOfcreation:  { type: Date, default: Date.now },
    description:  String,
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }]
});

const connection = mongoose.createConnection('mongodb://localhost:27017/taskboard');

const Task = connection.model('Task', TaskModel),
    User = connection.model('User', UserModel);
    Project = connection.model('User', ProjectModel);
module.exports.Task = Task;
module.exports.User = User;
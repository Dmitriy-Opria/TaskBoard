/**
 * Created by alexey-dev on 23.10.16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TaskModel = new Schema({
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

var UserModel = new Schema({
    name:  String,
    surname: String,
    avatar:{ type: String, default: '/images/avatars/no-avatar_jpg.jpg' },
    email:  String,
    tel: { type: String, default: '-'},
    skype: { type: String, default: '-'},
    password: String,
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }]
});

UserModel.statics.findByEmail = function(email, cb) {
    return this.find({ email: email }, cb);
};
var connection = mongoose.createConnection('mongodb://localhost:27017/taskboard');

var Task = connection.model('Task', TaskModel),
    User = connection.model('User', UserModel);
module.exports.Task = Task;
module.exports.User = User;
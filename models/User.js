
var connection = mongoose.createConnection('mongodb://localhost:27017/taskboard');

module.exports.Task = connection.model('Task', TaskModel);
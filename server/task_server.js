const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDef = protoLoader.loadSync("../protos/task.proto", {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const taskPackage = grpcObject.taskPackage;

const server = new grpc.Server();

let tasks = [
    { id: 1, title: 'Task 1', description: 'Description 1', completed: false },
    { id: 2, title: 'Task 2', description: 'Description 2', completed: false }
];

server.addService(taskPackage.TaskService.service, {
    getAllTasks: getAllTasks,
    createTask: createTask,
    getTask: getTask,
    updateTask: updateTask,
    deleteTask: deleteTask
});

function createTask(call, callback) {
    const task = call.request;
    task.id = tasks.length + 1;
    tasks.push(task);
    callback(null, task);
}

function getTask(call, callback) {
    const task = tasks.find(t => t.id === call.request.id);
    if (task) {
        callback(null, task);
    } else {
        callback({
            code: grpc.status.NOT_FOUND,
            details: 'Task not found'
        });
    }
}

function updateTask(call, callback) {
    const updatedTask = call.request;
    const existingTask = tasks.find(t => t.id === updatedTask.id);
    if (existingTask) {
        existingTask.title = updatedTask.title;
        existingTask.description = updatedTask.description;
        existingTask.completed = updatedTask.completed;
        callback(null, existingTask);
    } else {
        callback({
            code: grpc.status.NOT_FOUND,
            details: 'Task not found'
        });
    }
}

function deleteTask(call, callback) {
    const taskIndex = tasks.findIndex(t => t.id === call.request.id);
    if (taskIndex !== -1) {
        const deletedTask = tasks.splice(taskIndex, 1)[0];
        callback(null, deletedTask);
    } else {
        callback({
            code: grpc.status.NOT_FOUND,
            details: 'Task not found'
        });
    }
}

function getAllTasks(call, callback) {
    callback(null, { items: tasks });
}

server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), (error, port) => {
    if (error) {
        console.error(`Server failed to bind: ${error.message}`);
        return;
    }
    console.log(`Listening on port ${port}`);
    server.start();
});

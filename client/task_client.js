const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const readline = require('readline');


const packageDef = protoLoader.loadSync('../protos/task.proto', {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const taskPackage = grpcObject.taskPackage;

const client = new taskPackage.TaskService('localhost:50051', grpc.credentials.createInsecure());

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function showMenu() {
  console.log('\nSelect an action:');
  console.log('1. Create Task');
  console.log('2. Get Task');
  console.log('3. Update Task');
  console.log('4. Delete Task');
  console.log('5. Get All Tasks');
  rl.question('Enter the number of the action you want to perform: ', handleUserInput);
}

function handleUserInput(action) {
  switch (action) {
    case '1':
      createTask();
      break;
    case '2':
      getTask();
      break;
    case '3':
      updateTask();
      break;
    case '4':
      deleteTask();
      break;
    case '5':
      getAllTasks();
      break;
    default:
      console.log('Invalid action');
      showMenu();
      break;
  }
}

function createTask() {
  rl.question('Enter title: ', (title) => {
    rl.question('Enter description: ', (description) => {
      client.createTask({
        title,
        description,
        completed: false
      }, (err, response) => {
        if (err) {
          console.error('Error creating task:', err);
        } else {
          console.log('\nTask has been created:');
          formatTask(response);
        }
        showMenu();
      });
    });
  });
}

function getTask() {
  rl.question('Enter task ID: ', (id) => {
    client.getTask({ id: parseInt(id) }, (err, response) => {
      if (err) {
        console.error('Error reading task:', err);
      } else {
        console.log('\nTask has been read:');
        formatTask(response);
      }
      showMenu();
    });
  });
}

function updateTask() {
  rl.question('Enter task ID: ', (id) => {
    rl.question('Enter title: ', (title) => {
      rl.question('Enter description: ', (description) => {
        rl.question('Is completed (true/false): ', (completed) => {
          client.updateTask({
            id: parseInt(id),
            title,
            description,
            completed: completed === 'true'
          }, (err, response) => {
            if (err) {
              console.error('Error updating task:', err);
            } else {
              console.log('\nTask has been updated:');
              formatTask(response);
            }
            showMenu();
          });
        });
      });
    });
  });
}

function deleteTask() {
  rl.question('Enter task ID: ', (id) => {
    client.deleteTask({ id: parseInt(id) }, (err, response) => {
      if (err) {
        console.error('Error deleting task:', err);
      } else {
        console.log('\nTask has been deleted:');
        formatTask(response);
      }
      showMenu();
    });
  });
}

function getAllTasks() {
  client.getAllTasks({}, (err, response) => {
    if (err) {
      console.error('Error reading all tasks:', err);
    } else {
      console.log('\nRead all tasks from database:');
      formatTasks(response.items);
    }
    showMenu();
  });
}

function formatTask(task) {
  console.log(`  ID: ${task.id}`);
  console.log(`  Title: ${task.title}`);
  console.log(`  Description: ${task.description}`);
  console.log(`  Completed: ${task.completed}`);
}

function formatTasks(tasks) {
  tasks.forEach((task, index) => {
    console.log(`\nTask ${index + 1}:`);
    formatTask(task);
  });
}

showMenu();

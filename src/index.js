const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const user = users.find(user => user.username == username);

  if (!user) {
    response.status(404).json({error: 'Username doesn\'t exists!'});
  } else {
    request.user = user;
    next();
  }

}

function checksExistsTodo(request, response, next) {
  const { user } = request;

  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id == id);

  if (!todo) {
    return response.status(404).json({error: 'Todo não existe!'});
  }
  request.todo = todo;
  next();
}

app.post('/users', (request, response) => {

  const { name, username } = request.body; 

  const exists = users.some(user => user.username == username);

  if (exists) {
    return response.status(400).json({error: 'Username exists'});
  }

  const user = { 
    id: uuidv4(),
    name, 
    username, 
    todos: []
  }

  users.push(user);

  response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  
  response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todo = {
    id: uuidv4(),
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todo);

  response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { title, deadline } = request.body;

  const { todo } = request;

  todo.title = title;
  todo.deadline = deadline;

  response.status(200).json({
    title: todo.title,
    deadline: todo.deadline,
    done: todo.done
  });
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user, todo } = request;

  todo.done = true;

  user.todos = [...user.todos.splice(todo, 1), todo];
  
  response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user, todo } = request;

  user.todos.splice(todo, 1);

  response.status(204).send();
});

module.exports = app;
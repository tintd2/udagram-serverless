import { TodosAccess } from './todosAcess'
// import { getUploadUrl } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
import { TodoUpdate } from '../models/TodoUpdate'
import { getSignedUrlPromise } from './attachmentUtils'
createLogger
const todoAccess = new TodosAccess()
// TODO: Implement businessLogic
export async function createTodo(
  todoItem: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4()
  // const url = getUploadUrl(todoId)
  // const url = 'getUploadUrl(todoId)'
  // console.log('url', url);


  const bucketName = process.env.ATTACHMENT_S3_BUCKET
  const todo = {
    todoId: todoId,
    userId: userId,
    name: todoItem.name,
    dueDate: todoItem.dueDate,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
  }
  // console.log(todo);
  let todoRst: TodoItem = await todoAccess.createTodo(todo)
  // todoRst = {...todoRst, ...{uploadUrl: url}}
  return todoRst
}

export async function getUrl(todoId:string): Promise<string> {
  return await getSignedUrlPromise(todoId);
}

// TODO: Fixme
export async function updateTodo(
  todoItem: UpdateTodoRequest,
  todoId: String
): Promise<TodoUpdate> {
  return await todoAccess.updateTodo(
    {
      name: todoItem.name,
      dueDate: todoItem.dueDate,
      done: todoItem.done
    },
    todoId
  )
}

export async function deleteTodo(todo: TodoItem): Promise<boolean> {
  return await todoAccess.deleteToDo(todo)
}


export async function getAllToDo(): Promise<TodoItem[]> {
    return await todoAccess.getAllTodos()
}

export async function getTodo(todoId: string):  Promise<TodoItem> {
  return await todoAccess.getTodo(todoId);
}


export async function getSecret(key: string): Promise<string> {
  return await todoAccess.getSecret(key);
}
import { TodosAccess } from './todosAcess'
import { getUploadUrl } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
import { TodoUpdate } from '../models/TodoUpdate'
createLogger
const todoAccess = new TodosAccess()
// TODO: Implement businessLogic
export async function createTodo(
  todoItem: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4()
  const url = getUploadUrl(todoId)

  return await todoAccess.createTodo({
    todoId: todoId,
    userId: userId,
    name: todoItem.name,
    dueDate: todoItem.dueDate,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: url
  })
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

export async function deleteTodo(todoId: string): Promise<boolean> {
  return await todoAccess.deleteToDo(todoId)
}


export async function getAllToDo(): Promise<TodoItem[]> {
    return await todoAccess.getAllTodos()
}
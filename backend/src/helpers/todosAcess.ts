import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')
logger
// TODO: Implement the dataLayer logic
export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE
  ) {}

  async getAllTodos(): Promise<TodoItem[]> {
    console.log('Getting all todos')

    const result = await this.docClient
      .scan({
        TableName: this.todosTable
      })
      .promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async getTodo(id: string): Promise<TodoItem> {
    console.log('Getting todo' + id)

    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          HashKey: id
        }
      })
      .promise()

    const items = result.Item
    return items as TodoItem
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put(
        {
          TableName: this.todosTable,
          Item: todo
        },
        function (err, data) {
          if (err) console.log(err)
          else console.log(data)
        }
      )
      .promise()

    return todo
  }

  async updateTodo(todo: TodoUpdate, totoId: String): Promise<TodoUpdate> {
    await this.docClient
      .update(
        {
          TableName: this.todosTable,
          // Item: todo
          Key: {
            todoId: totoId
          },
          UpdateExpression:
            'set name = :name, dueDate = :dueDate, done = :done',
          ExpressionAttributeValues: {
            ':name': todo.name,
            ':dueDate': todo.dueDate,
            ':done': todo.done
          }
        },
        function (err, data) {
          if (err) console.log(err)
          else console.log(data)
        }
      )
      .promise()

    return todo
  }

  // TODO: udpate me later
  async deleteToDo(todoId: string): Promise<boolean> {
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: { todoId: todoId }
      })
      .promise()

    return true
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}

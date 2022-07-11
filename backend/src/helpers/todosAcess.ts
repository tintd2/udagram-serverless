import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
// import AWSXRay from "aws-xray-sdk-core"
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { SecretsManager } from 'aws-sdk'
// const AWSXRay = require('aws-xray-sdk')

AWSXRay.config([AWSXRay.plugins.EC2Plugin,AWSXRay.plugins.ElasticBeanstalkPlugin]);
const XAWS = AWSXRay.captureAWS(AWS)
// var AWSXRay = require('aws-xray-sdk');
const logger = createLogger('TodosAccess')

let catchedSecret: string;

// TODO: Implement the dataLayer logic
export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly secretClient: SecretsManager = createSecretClient()
  ) {}

  async getAllTodos(): Promise<TodoItem[]> {
    logger.info('getAllTodos');
    console.log('Getting all todos')

    const result = await this.docClient
      .scan({
        TableName: this.todosTable
      })
      .promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async getTodo(todoId: string): Promise<TodoItem> {
    console.log('Getting todo: ' + todoId)

    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          todoId: todoId
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
  async deleteToDo(todo: TodoItem): Promise<boolean> {
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: { 
          todoId: todo.todoId
        }
      },
      function (err, data) {
        if (err) console.log(err)
        else console.log("delete", data)
      })
      .promise()

    return true
  }

  // getSecret(key: string): string | PromiseLike<string> {
  //   throw new Error('Method not implemented.')
  // }

  async getSecret(secretId: string): Promise<string> {
    if (catchedSecret) return catchedSecret
    const data = await this.secretClient
      .getSecretValue({
        SecretId: secretId
      })
      .promise()

    catchedSecret = data.SecretString

    return JSON.parse(catchedSecret)
  }

}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    AWSXRay.setContextMissingStrategy("LOG_ERROR");
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}

function createSecretClient() {
  return new XAWS.SecretsManager({region: "us-east-1"});
}
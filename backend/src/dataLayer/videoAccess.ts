import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { VideoItem } from '../models/videos/VideoItem'



AWSXRay.config([
  AWSXRay.plugins.EC2Plugin,
  AWSXRay.plugins.ElasticBeanstalkPlugin
])
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('VideosAccess')

export class VideosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly table = process.env.VIDEOS_TABLE,
  ) {}

  async createVideo(video: VideoItem): Promise<VideoItem> {
    logger.info('Creating video', JSON.stringify(video));
    await this.docClient
      .put(
        {
          TableName: this.table,
          Item: video
        },
        function (err, data) {
          if (err) console.log(err)
          else console.log(data)
        }
      )
      .promise()

    return video
  }

  async getAllVideos(userId: string): Promise<VideoItem[]> {
    logger.info(userId)
    const result = await this.docClient
      .query({
        // IndexName: this.createdAtIndex,
        KeyConditionExpression: 'userId = :userId',
        TableName: this.table,
        ScanIndexForward: false,
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    const items = result.Items
    return items as VideoItem[]
  }

  async getVideo(videoId: string, userId: string): Promise<VideoItem> {
    const result = await this.docClient
      .get({
        TableName: this.table,
        Key: {
          videoId: videoId,
          userId: userId
        }
      })
      .promise()
    const items = result.Item
    return items as VideoItem
  }

  async deleteVideo(video: VideoItem): Promise<boolean> {
    await this.docClient
      .delete(
        {
          TableName: this.table,
          Key: {
            videoId: video.videoId,
            userId: video.userId
          }
        },
        function (err, data) {
          if (err) console.log(err)
          else console.log('delete', data)
        }
      )
      .promise()

    return true
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    AWSXRay.setContextMissingStrategy('LOG_ERROR')
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
 
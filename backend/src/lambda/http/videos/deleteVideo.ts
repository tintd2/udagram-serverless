import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../../utils/logger'
import { getUserId } from '../../utils'
import { deleteVideo, getVideo } from '../../../businessLogic/video'
const logger = createLogger('TodosAccess')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const videoId = event.pathParameters.videoId
    const userId = getUserId(event);
    const todo = await getVideo(videoId, userId);
    logger.info(todo);
    if (!todo) {
      throw new Error("404");
    }

    await deleteVideo(todo)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        delete: videoId
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )

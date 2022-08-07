import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

// import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { getUrl } from '../../businessLogic/todos'
// import { getUrl } from '../../helpers/todos'
// import { getUploadUrl } from '../../helpers/attachmentUtils'
 


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const videoId = event.pathParameters.videoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    let url = '';
    if (todoId) {
      url = await getUrl(todoId);
    } else {
      url = await getUrl(videoId);
    }
    const userId = getUserId(event);
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        uploadUrl: url,
        userId: userId
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

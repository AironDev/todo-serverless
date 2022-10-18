import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodos } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import { getUserId, Response } from '../utils';

const logger = createLogger('getTodos')

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    logger.info('Processing getTodos event', { event })

    const userId = getUserId(event)

    const res = await getTodos(userId)

    return Response(200, res)
  }
)

handler.use(
  cors({
    credentials: true
  })
)

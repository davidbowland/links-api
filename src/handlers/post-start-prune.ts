import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from '../types'
import { deleteDataById, scanExpiredIds } from '../services/dynamodb'
import { log, logError } from '../utils/logging'
import status from '../utils/status'

export const postStartPruneHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<any>> => {
  log('Received event', { ...event, body: undefined })
  try {
    const ids = await scanExpiredIds()
    for (const linkId of ids) {
      await deleteDataById(linkId)
    }

    return status.NO_CONTENT
  } catch (error) {
    logError(error)
    return { ...status.INTERNAL_SERVER_ERROR }
  }
}

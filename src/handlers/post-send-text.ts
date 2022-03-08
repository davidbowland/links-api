import { corsDomain } from '../config'
import { sendSms } from '../services/queue'
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from '../types'
import { extractJwtFromEvent } from '../utils/events'
import { log, logError } from '../utils/logging'
import status from '../utils/status'

export const postSendTextHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<any>> => {
  log('Received event', { ...event, body: undefined })
  try {
    const linkId = event.pathParameters.linkId
    const jwtPayload = extractJwtFromEvent(event)
    if (jwtPayload === null) {
      return { ...status.BAD_REQUEST, body: JSON.stringify({ message: 'Invalid JWT' }) }
    }
    await sendSms(jwtPayload.phone_number, `Your shortned URL is: ${corsDomain}/r/${linkId}`)

    return status.NO_CONTENT
  } catch (error) {
    logError(error)
    return { ...status.INTERNAL_SERVER_ERROR }
  }
}

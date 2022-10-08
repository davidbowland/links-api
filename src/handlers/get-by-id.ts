import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Link } from '../types'
import { getDataById, setDataById } from '../services/dynamodb'
import { log, logError } from '../utils/logging'
import status from '../utils/status'

const incrementAccessCount = async (linkId: string, link: Link): Promise<void> => {
  try {
    await setDataById(linkId, { ...link, accessCount: link.accessCount + 1, lastAccessed: new Date().getTime() })
  } catch (error) {
    logError(error)
  }
}

const fetchById = async (linkId: string): Promise<APIGatewayProxyResultV2<any>> => {
  try {
    const link = await getDataById(linkId)
    await incrementAccessCount(linkId, link)

    return { ...status.OK, body: JSON.stringify({ ...link, linkId }) }
  } catch (error) {
    return status.NOT_FOUND
  }
}

export const getByIdHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<any>> => {
  log('Received event', { ...event, body: undefined })
  const linkId = event.pathParameters?.linkId as string
  const result = await fetchById(linkId)
  return result
}

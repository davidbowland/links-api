import { getDataById } from '../services/dynamodb'
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from '../types'
import { log } from '../utils/logging'
import status from '../utils/status'

const fetchById = async (linkId: string): Promise<APIGatewayProxyResultV2<any>> => {
  try {
    const data = await getDataById(linkId)
    return { ...status.OK, body: JSON.stringify({ ...data, linkId }) }
  } catch (error) {
    return status.NOT_FOUND
  }
}

export const getByIdHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<any>> => {
  log('Received event', { ...event, body: undefined })
  const linkId = event.pathParameters.linkId
  const result = await fetchById(linkId)
  return result
}

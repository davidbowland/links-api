import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from '../types'
import { deleteDataById, getDataById } from '../services/dynamodb'
import { log, logError } from '../utils/logging'
import status from '../utils/status'

const fetchDataThenDelete = async (linkId: string): Promise<APIGatewayProxyResultV2<any>> => {
  try {
    const data = await getDataById(linkId)
    try {
      await deleteDataById(linkId)
      return { ...status.OK, body: JSON.stringify(data) }
    } catch (error) {
      logError(error)
      return status.INTERNAL_SERVER_ERROR
    }
  } catch (error) {
    return status.NO_CONTENT
  }
}

export const deleteByIdHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<any>> => {
  log('Received event', { ...event, body: undefined })
  const linkId = event.pathParameters?.linkId as string
  const result = await fetchDataThenDelete(linkId)
  return result
}

import { applyPatch } from 'fast-json-patch'

import { mutateObjectOnJsonPatch, throwOnInvalidJsonPatch } from '../config'
import { getDataById, setDataById } from '../services/dynamodb'
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Link, PatchOperation } from '../types'
import { extractJsonPatchFromEvent } from '../utils/events'
import { log, logError } from '../utils/logging'
import status from '../utils/status'

const applyJsonPatch = async (
  link: Link,
  linkId: string,
  patchOperations: PatchOperation[]
): Promise<APIGatewayProxyResultV2<any>> => {
  const updatedLink = applyPatch(link, patchOperations, throwOnInvalidJsonPatch, mutateObjectOnJsonPatch).newDocument
  try {
    await setDataById(linkId, updatedLink)
    return { ...status.OK, body: JSON.stringify(updatedLink) }
  } catch (error) {
    logError(error)
    return status.INTERNAL_SERVER_ERROR
  }
}

const patchById = async (linkId: string, patchOperations: PatchOperation[]): Promise<APIGatewayProxyResultV2<any>> => {
  try {
    const link = await getDataById(linkId)
    try {
      return await applyJsonPatch(link, linkId, patchOperations)
    } catch (error) {
      return { ...status.BAD_REQUEST, body: JSON.stringify({ message: error.message }) }
    }
  } catch {
    return status.NOT_FOUND
  }
}

export const patchItemHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<any>> => {
  log('Received event', { ...event, body: undefined })
  try {
    const linkId = event.pathParameters.linkId
    const patchOperations = extractJsonPatchFromEvent(event)
    const result = await patchById(linkId, patchOperations)
    return result
  } catch (error) {
    return { ...status.BAD_REQUEST, body: JSON.stringify({ message: error.message }) }
  }
}

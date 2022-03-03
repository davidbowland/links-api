import { apiUrl } from '../config'
import { getDataById, setDataById } from '../services/dynamodb'
import status from '../utils/status'
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from '../types'
import { extractLinkFromEvent } from '../utils/events'
import { log, logError } from '../utils/logging'

// Don't allow vowells, digits that look like vowells, or ambiguous characters
const allowedCharacters = '256789bcdfghjmnpqrstvwxz'

const valueToId = (value: number): string => {
  const digit = allowedCharacters.charAt(value % allowedCharacters.length)
  return value >= allowedCharacters.length ? valueToId(Math.floor(value / allowedCharacters.length)) + digit : digit
}

const idExists = async (linkId: string): Promise<boolean> => {
  try {
    await getDataById(linkId)
    return true
  } catch (error) {
    return false
  }
}

const getRandomId = async (minValue: number, maxValue: number): Promise<string> => {
  const randomValue = Math.round(Math.random() * (maxValue - minValue) + minValue)
  const linkId = valueToId(randomValue)
  if (await idExists(linkId)) {
    return getRandomId(minValue, maxValue)
  }
  return linkId
}

const getNextId = async (): Promise<string> => {
  const minValue = Math.pow(allowedCharacters.length, parseInt(process.env.ID_MIN_LENGTH, 10) - 1)
  const maxValue = Math.pow(allowedCharacters.length, parseInt(process.env.ID_MAX_LENGTH, 10))
  return getRandomId(minValue, maxValue)
}

export const postItemHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<any>> => {
  log('Received event', { ...event, body: undefined })
  try {
    const link = await extractLinkFromEvent(event)
    try {
      const linkId = await getNextId()
      await setDataById(linkId, link)
      return {
        ...status.CREATED,
        body: JSON.stringify({ ...link, linkId }),
        headers: { Location: `${apiUrl}/${linkId}` },
      }
    } catch (error) {
      logError(error)
      return status.INTERNAL_SERVER_ERROR
    }
  } catch (error) {
    return { ...status.BAD_REQUEST, body: JSON.stringify({ message: error }) }
  }
}

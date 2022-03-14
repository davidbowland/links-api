import { idMinLength, idMaxLength } from '../config'
import { getDataById } from '../services/dynamodb'

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

export const getNextId = async (): Promise<string> => {
  const minValue = Math.pow(allowedCharacters.length, idMinLength - 1)
  const maxValue = Math.pow(allowedCharacters.length, idMaxLength)
  return getRandomId(minValue, maxValue)
}

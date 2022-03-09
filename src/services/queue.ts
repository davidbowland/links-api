import axios, { AxiosResponse } from 'axios'

import { smsApiKeyName, smsApiUrl } from '../config'
import { getApiKey } from '../services/api-keys'
import { SMSMessage } from '../types'

const api = axios.create({
  baseURL: smsApiUrl,
})

/* Emails */

const convertContentsToJson = (to: string, contents: string): SMSMessage => ({
  to,
  contents,
  messageType: 'TRANSACTIONAL',
})

export const sendSms = (to: string, contents: string): Promise<AxiosResponse> =>
  Promise.resolve(convertContentsToJson(to, contents)).then(exports.sendRawSms)

export const sendRawSms = async (body: SMSMessage): Promise<AxiosResponse> => {
  const apiKey = await getApiKey(smsApiKeyName)
  return api.post('/messages', body, {
    headers: {
      'x-api-key': apiKey,
    },
  })
}

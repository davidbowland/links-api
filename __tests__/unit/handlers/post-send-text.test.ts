import { decodedJwt } from '../__mocks__'
import eventJson from '@events/post-send-text.json'
import { postSendTextHandler } from '@handlers/post-send-text'
import { mocked } from 'jest-mock'
import * as queue from '@services/queue'
import { APIGatewayProxyEventV2 } from '@types'
import * as events from '@utils/events'
import status from '@utils/status'

jest.mock('@services/queue')
jest.mock('@utils/events')
jest.mock('@utils/logging')

describe('post-item', () => {
  const event = eventJson as unknown as APIGatewayProxyEventV2

  beforeAll(() => {
    mocked(events).extractJwtFromEvent.mockReturnValue(decodedJwt)
    mocked(queue).sendSms.mockResolvedValue(undefined)
  })

  describe('postSendTextHandler', () => {
    test('expect INTERNAL_SERVER_ERROR when extractJwtFromEvent throws', async () => {
      mocked(events).extractJwtFromEvent.mockImplementationOnce(() => {
        throw new Error('JWT error')
      })
      const result = await postSendTextHandler(event)
      expect(result).toEqual(expect.objectContaining(status.INTERNAL_SERVER_ERROR))
    })

    test('expect BAD_REQUEST when JWT is invalid', async () => {
      mocked(events).extractJwtFromEvent.mockReturnValueOnce(null)
      const result = await postSendTextHandler(event)
      expect(result).toEqual({ statusCode: 400, body: JSON.stringify({ message: 'Invalid JWT' }) })
    })

    test('expect sendSMS is called and NO_CONTENT status returned', async () => {
      const result = await postSendTextHandler(event)
      expect(mocked(queue).sendSms).toHaveBeenCalledWith(
        '+15551234567',
        'Your shortned URL is: http://links.bowland.link/r/abc123'
      )
      expect(result).toEqual(status.NO_CONTENT)
    })
  })
})
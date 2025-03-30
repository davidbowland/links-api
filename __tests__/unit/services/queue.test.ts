import { sendSms } from '@services/queue'
import { smsApiKey } from '@config'

const mockPostEndpoint = jest.fn()
jest.mock('axios', () => ({
  create: jest.fn().mockReturnValue({
    post: (...args) => mockPostEndpoint(...args),
  }),
}))
jest.mock('axios-retry')
jest.mock('@utils/logging')

describe('queue', () => {
  describe('sendSms', () => {
    const body = {
      contents: 'Hello, Goodbye!',
      messageType: 'TRANSACTIONAL',
      to: '+1800JENNYCRAIG',
    }
    const contents = 'Hello, Goodbye!'
    const headers = { 'x-api-key': smsApiKey }
    const to = '+1800JENNYCRAIG'

    test('expect sms contents to be passed to the endpoint', async () => {
      await sendSms(to, contents)

      expect(mockPostEndpoint).toHaveBeenCalledWith('/messages', body, { headers })
    })
  })
})

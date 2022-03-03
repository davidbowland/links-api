import { link } from '../__mocks__'
import eventJson from '@events/post-item.json'
import { postItemHandler } from '@handlers/post-item'
import { mocked } from 'jest-mock'
import * as dynamodb from '@services/dynamodb'
import { APIGatewayProxyEventV2 } from '@types'
import * as events from '@utils/events'
import status from '@utils/status'

jest.mock('@services/dynamodb')
jest.mock('@utils/events')
jest.mock('@utils/logging')

describe('post-item', () => {
  const event = eventJson as unknown as APIGatewayProxyEventV2
  const mathRandom = Math.random
  const mockRandom = jest.fn()

  beforeAll(() => {
    mocked(dynamodb).getDataById.mockRejectedValue(undefined)
    mocked(dynamodb).setDataById.mockResolvedValue(undefined)
    mocked(events).extractLinkFromEvent.mockResolvedValue(link)

    Math.random = mockRandom.mockReturnValue(0.5)
  })

  afterAll(() => {
    Math.random = mathRandom
  })

  describe('postItemHandler', () => {
    test('expect BAD_REQUEST when link is invalid', async () => {
      mocked(events).extractLinkFromEvent.mockRejectedValueOnce('Bad request')
      const result = await postItemHandler(event)
      expect(result).toEqual(expect.objectContaining(status.BAD_REQUEST))
    })

    test('expect linkId passed to setDataById', async () => {
      await postItemHandler(event)
      expect(mocked(dynamodb).setDataById).toHaveBeenCalledWith('j2j2', expect.objectContaining({ url: link.url }))
    })

    test('expect second linkId when first exists', async () => {
      mocked(dynamodb).getDataById.mockResolvedValueOnce(link)
      mockRandom.mockReturnValueOnce(0.5)
      mockRandom.mockReturnValueOnce(0.25)
      await postItemHandler(event)
      expect(mocked(dynamodb).setDataById).toHaveBeenCalledWith('b2s2', expect.objectContaining({ url: link.url }))
    })

    test('expect INTERNAL_SERVER_ERROR on setDataByIndex reject', async () => {
      mocked(dynamodb).setDataById.mockRejectedValueOnce(undefined)
      const result = await postItemHandler(event)
      expect(result).toEqual(expect.objectContaining(status.INTERNAL_SERVER_ERROR))
    })

    test('expect CREATED and body', async () => {
      const result = await postItemHandler(event)
      expect(result).toEqual(expect.objectContaining(status.CREATED))
      expect(JSON.parse(result.body)).toEqual(expect.objectContaining({ url: link.url, linkId: 'j2j2' }))
    })

    test('expect Location header', async () => {
      const result = await postItemHandler(event)
      expect(result).toEqual(
        expect.objectContaining({ headers: { Location: 'https://links-api.bowland.link/v1/links/j2j2' } })
      )
    })
  })
})

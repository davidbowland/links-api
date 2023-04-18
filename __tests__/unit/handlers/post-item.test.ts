import { mocked } from 'jest-mock'

import * as dynamodb from '@services/dynamodb'
import * as events from '@utils/events'
import * as idGenerator from '@utils/id-generator'
import { link, linkId } from '../__mocks__'
import { APIGatewayProxyEventV2 } from '@types'
import eventJson from '@events/post-item.json'
import { postItemHandler } from '@handlers/post-item'
import status from '@utils/status'

jest.mock('@services/dynamodb')
jest.mock('@utils/events')
jest.mock('@utils/id-generator')
jest.mock('@utils/logging')

describe('post-item', () => {
  const event = eventJson as unknown as APIGatewayProxyEventV2

  beforeAll(() => {
    mocked(dynamodb).getDataById.mockRejectedValue(undefined)
    mocked(dynamodb).setDataById.mockResolvedValue(undefined)
    mocked(events).extractLinkFromEvent.mockReturnValue(link)
    mocked(idGenerator).getNextId.mockResolvedValue(linkId)
  })

  describe('postItemHandler', () => {
    test('expect BAD_REQUEST when link is invalid', async () => {
      mocked(events).extractLinkFromEvent.mockImplementationOnce(() => {
        throw new Error('Bad request')
      })
      const result = await postItemHandler(event)

      expect(result).toEqual(expect.objectContaining(status.BAD_REQUEST))
    })

    test('expect linkId passed to setDataById', async () => {
      await postItemHandler(event)

      expect(mocked(dynamodb).setDataById).toHaveBeenCalledWith('abc123', expect.objectContaining({ url: link.url }))
    })

    test('expect INTERNAL_SERVER_ERROR on setDataByIndex reject', async () => {
      mocked(dynamodb).setDataById.mockRejectedValueOnce(undefined)
      const result = await postItemHandler(event)

      expect(result).toEqual(expect.objectContaining(status.INTERNAL_SERVER_ERROR))
    })

    test('expect CREATED and body', async () => {
      const result = await postItemHandler(event)

      expect(result).toEqual(expect.objectContaining(status.CREATED))
      expect(JSON.parse(result.body)).toEqual(
        expect.objectContaining({ linkId: 'abc123', location: 'http://links.bowland.link/r/abc123', url: link.url })
      )
    })

    test('expect Location header', async () => {
      const result = await postItemHandler(event)

      expect(result).toEqual(expect.objectContaining({ headers: { Location: 'http://links.bowland.link/r/abc123' } }))
    })
  })
})

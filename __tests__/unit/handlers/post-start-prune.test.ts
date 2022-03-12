import { linkId } from '../__mocks__'
import eventJson from '@events/post-start-prune.json'
import { postStartPruneHandler } from '@handlers/post-start-prune'
import { mocked } from 'jest-mock'
import * as dynamodb from '@services/dynamodb'
import { APIGatewayProxyEventV2 } from '@types'
import status from '@utils/status'

jest.mock('@services/dynamodb')
jest.mock('@utils/logging')

describe('post-start-prune', () => {
  const event = eventJson as unknown as APIGatewayProxyEventV2

  beforeAll(() => {
    mocked(dynamodb).deleteDataById.mockResolvedValue(undefined)
    mocked(dynamodb).scanExpiredIds.mockResolvedValue([linkId])
  })

  describe('postStartPruneHandler', () => {
    test('expect INTERNAL_SERVER_ERROR when scanExpiredIds rejects', async () => {
      mocked(dynamodb).scanExpiredIds.mockRejectedValueOnce(undefined)
      const result = await postStartPruneHandler(event)
      expect(result).toEqual(expect.objectContaining(status.INTERNAL_SERVER_ERROR))
    })

    test('expect INTERNAL_SERVER_ERROR when deleteDataById rejects', async () => {
      mocked(dynamodb).deleteDataById.mockRejectedValueOnce(undefined)
      const result = await postStartPruneHandler(event)
      expect(result).toEqual(expect.objectContaining(status.INTERNAL_SERVER_ERROR))
    })

    test('expect linkId passed to deleteDataById', async () => {
      await postStartPruneHandler(event)
      expect(mocked(dynamodb).deleteDataById).toHaveBeenCalledWith(linkId)
    })

    test('expect NO_CONTENT', async () => {
      const result = await postStartPruneHandler(event)
      expect(result).toEqual(expect.objectContaining(status.NO_CONTENT))
    })
  })
})

import { link, linkId } from '../__mocks__'
import eventJson from '@events/delete-item.json'
import { deleteByIdHandler } from '@handlers/delete-item'
import { mocked } from 'jest-mock'
import * as dynamodb from '@services/dynamodb'
import { APIGatewayProxyEventV2 } from '@types'
import status from '@utils/status'

jest.mock('@services/dynamodb')
jest.mock('@utils/logging')

describe('delete-item', () => {
  const event = eventJson as unknown as APIGatewayProxyEventV2

  beforeAll(() => {
    mocked(dynamodb).deleteDataById.mockResolvedValue(undefined)
    mocked(dynamodb).getDataById.mockResolvedValue(link)
  })

  describe('deleteByIdHandler', () => {
    test('expect deleteDataById called when getDataById resolves', async () => {
      await deleteByIdHandler(event)
      expect(mocked(dynamodb).deleteDataById).toHaveBeenCalledWith(linkId)
    })

    test('expect deleteDataById not to be called when getDataById rejects', async () => {
      mocked(dynamodb).getDataById.mockRejectedValueOnce(undefined)
      await deleteByIdHandler(event)
      expect(mocked(dynamodb).deleteDataById).toHaveBeenCalledTimes(0)
    })

    test('expect INTERNAL_SERVER_ERROR on deleteDataById reject', async () => {
      mocked(dynamodb).deleteDataById.mockRejectedValueOnce(undefined)
      const result = await deleteByIdHandler(event)
      expect(result).toEqual(expect.objectContaining(status.INTERNAL_SERVER_ERROR))
    })

    test('expect OK when index exists', async () => {
      const result = await deleteByIdHandler(event)
      expect(result).toEqual({ ...status.OK, body: JSON.stringify(link) })
    })

    test('expect NO_CONTENT when index does not exist', async () => {
      mocked(dynamodb).getDataById.mockRejectedValueOnce(undefined)
      const result = await deleteByIdHandler(event)
      expect(result).toEqual(expect.objectContaining(status.NO_CONTENT))
    })
  })
})

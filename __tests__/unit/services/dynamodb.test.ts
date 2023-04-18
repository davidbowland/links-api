import { deleteDataById, getDataById, scanData, scanExpiredIds, setDataById } from '@services/dynamodb'
import { link, linkId } from '../__mocks__'

const mockSend = jest.fn()
jest.mock('@aws-sdk/client-dynamodb', () => ({
  BatchGetItemCommand: jest.fn().mockImplementation((x) => x),
  DeleteItemCommand: jest.fn().mockImplementation((x) => x),
  DynamoDB: jest.fn(() => ({
    send: (...args) => mockSend(...args),
  })),
  GetItemCommand: jest.fn().mockImplementation((x) => x),
  PutItemCommand: jest.fn().mockImplementation((x) => x),
  QueryCommand: jest.fn().mockImplementation((x) => x),
  ScanCommand: jest.fn().mockImplementation((x) => x),
}))
jest.mock('@utils/logging', () => ({
  xrayCapture: jest.fn().mockImplementation((x) => x),
}))

describe('dynamodb', () => {
  describe('deleteDataById', () => {
    test('expect index passed to delete', async () => {
      await deleteDataById(linkId)

      expect(mockSend).toHaveBeenCalledWith({
        Key: {
          LinkId: {
            S: `${linkId}`,
          },
        },
        TableName: 'links-table',
      })
    })
  })

  describe('getDataById', () => {
    beforeAll(() => {
      mockSend.mockResolvedValue({ Item: { Data: { S: JSON.stringify(link) } } })
    })

    test('expect id passed to get', async () => {
      await getDataById(linkId)

      expect(mockSend).toHaveBeenCalledWith({
        Key: {
          LinkId: {
            S: `${linkId}`,
          },
        },
        TableName: 'links-table',
      })
    })

    test('expect data parsed and returned', async () => {
      const result = await getDataById(linkId)

      expect(result).toEqual(link)
    })
  })

  describe('scanData', () => {
    beforeAll(() => {
      mockSend.mockResolvedValue({
        Items: [{ Data: { S: JSON.stringify(link) }, LinkId: { S: `${linkId}` } }],
      })
    })

    test('expect data parsed and returned', async () => {
      const result = await scanData()

      expect(result).toEqual([{ data: link, id: linkId }])
    })

    test('expect empty object with no data returned', async () => {
      mockSend.mockResolvedValueOnce({ Items: [] })
      const result = await scanData()

      expect(result).toEqual([])
    })
  })

  describe('scanExpiredIds', () => {
    beforeAll(() => {
      mockSend.mockResolvedValue({
        Items: [{ LinkId: { S: `${linkId}` } }],
      })
    })

    test('expect data parsed and returned', async () => {
      const result = await scanExpiredIds()

      expect(result).toEqual([linkId])
    })

    test('expect empty object with no data returned', async () => {
      mockSend.mockResolvedValueOnce({ Items: [] })
      const result = await scanExpiredIds()

      expect(result).toEqual([])
    })
  })

  describe('setDataById', () => {
    test('expect index and data passed to put', async () => {
      await setDataById(linkId, link)

      expect(mockSend).toHaveBeenCalledWith({
        Item: {
          Data: {
            S: JSON.stringify(link),
          },
          Expiration: {
            N: `${link.expiration}`,
          },
          LinkId: {
            S: `${linkId}`,
          },
        },
        TableName: 'links-table',
      })
    })

    test('expect expiration defaults to 0', async () => {
      const noExpirationLink = { ...link, expiration: undefined }
      await setDataById(linkId, noExpirationLink)

      expect(mockSend).toHaveBeenCalledWith({
        Item: {
          Data: {
            S: JSON.stringify(noExpirationLink),
          },
          Expiration: {
            N: '0',
          },
          LinkId: {
            S: `${linkId}`,
          },
        },
        TableName: 'links-table',
      })
    })
  })
})

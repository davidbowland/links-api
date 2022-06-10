import { deleteDataById, getDataById, scanData, scanExpiredIds, setDataById } from '@services/dynamodb'
import { link, linkId } from '../__mocks__'

const mockDeleteItem = jest.fn()
const mockGetItem = jest.fn()
const mockPutItem = jest.fn()
const mockScanTable = jest.fn()
jest.mock('aws-sdk', () => ({
  DynamoDB: jest.fn(() => ({
    deleteItem: (...args) => ({ promise: () => mockDeleteItem(...args) }),
    getItem: (...args) => ({ promise: () => mockGetItem(...args) }),
    putItem: (...args) => ({ promise: () => mockPutItem(...args) }),
    scan: (...args) => ({ promise: () => mockScanTable(...args) }),
  })),
}))

describe('dynamodb', () => {
  describe('deleteDataById', () => {
    test('expect index passed to delete', async () => {
      await deleteDataById(linkId)
      expect(mockDeleteItem).toHaveBeenCalledWith({
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
      mockGetItem.mockResolvedValue({ Item: { Data: { S: JSON.stringify(link) } } })
    })

    test('expect id passed to get', async () => {
      await getDataById(linkId)
      expect(mockGetItem).toHaveBeenCalledWith({
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
      mockScanTable.mockResolvedValue({
        Items: [{ Data: { S: JSON.stringify(link) }, LinkId: { S: `${linkId}` } }],
      })
    })

    test('expect data parsed and returned', async () => {
      const result = await scanData()
      expect(result).toEqual([{ data: link, id: linkId }])
    })

    test('expect empty object with no data returned', async () => {
      mockScanTable.mockResolvedValueOnce({ Items: [] })
      const result = await scanData()
      expect(result).toEqual([])
    })
  })

  describe('scanExpiredIds', () => {
    beforeAll(() => {
      mockScanTable.mockResolvedValue({
        Items: [{ LinkId: { S: `${linkId}` } }],
      })
    })

    test('expect data parsed and returned', async () => {
      const result = await scanExpiredIds()
      expect(result).toEqual([linkId])
    })

    test('expect empty object with no data returned', async () => {
      mockScanTable.mockResolvedValueOnce({ Items: [] })
      const result = await scanExpiredIds()
      expect(result).toEqual([])
    })
  })

  describe('setDataById', () => {
    test('expect index and data passed to put', async () => {
      await setDataById(linkId, link)
      expect(mockPutItem).toHaveBeenCalledWith({
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
      expect(mockPutItem).toHaveBeenCalledWith({
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

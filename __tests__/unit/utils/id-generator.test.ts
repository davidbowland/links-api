import { link } from '../__mocks__'
import { mocked } from 'jest-mock'
import * as dynamodb from '@services/dynamodb'
import { getNextId } from '@utils/id-generator'

jest.mock('@services/dynamodb')

describe('id-generator', () => {
  const mathRandom = Math.random
  const mockRandom = jest.fn()

  beforeAll(() => {
    Math.random = mockRandom.mockReturnValue(0.5)
  })

  afterAll(() => {
    Math.random = mathRandom
  })

  describe('getNextId', () => {
    beforeAll(() => {
      mocked(dynamodb).getDataById.mockRejectedValue(undefined)
    })

    test('expect id returned passed to setDataById', async () => {
      const result = await getNextId()
      expect(result).toEqual('j2j2')
    })

    test('expect second linkId when first exists', async () => {
      mocked(dynamodb).getDataById.mockResolvedValueOnce(link)
      mockRandom.mockReturnValueOnce(0.5)
      mockRandom.mockReturnValueOnce(0.25)
      const result = await getNextId()
      expect(result).toEqual('b2s2')
    })
  })
})

import { link, jsonPatchOperations } from '../__mocks__'
import patchEventJson from '@events/patch-item.json'
import postEventJson from '@events/post-item.json'
import { APIGatewayProxyEventV2 } from '@types'
import { extractLinkFromEvent, extractJsonPatchFromEvent } from '@utils/events'

describe('events', () => {
  describe('extractLinkFromEvent', () => {
    const event = postEventJson as unknown as APIGatewayProxyEventV2

    test('expect link from event', async () => {
      const result = await extractLinkFromEvent(event)
      expect(result).toEqual(expect.objectContaining({ url: link.url }))
    })

    test('expect link from event in base64', async () => {
      const tempEvent = {
        ...event,
        body: Buffer.from(event.body).toString('base64'),
        isBase64Encoded: true,
      } as unknown as APIGatewayProxyEventV2
      const result = await extractLinkFromEvent(tempEvent)
      expect(result).toEqual(expect.objectContaining({ url: link.url }))
    })

    test('expect reject on invalid event', async () => {
      const tempEvent = { ...event, body: JSON.stringify({}) } as unknown as APIGatewayProxyEventV2
      await expect(extractLinkFromEvent(tempEvent)).rejects.toBeDefined()
    })

    test('expect link to be formatted', async () => {
      const tempEmail = {
        ...link,
        foo: 'bar',
      }
      const tempEvent = { ...event, body: JSON.stringify(tempEmail) } as unknown as APIGatewayProxyEventV2
      const result = await extractLinkFromEvent(tempEvent)
      expect(result).toEqual(expect.objectContaining({ url: link.url }))
    })
  })

  describe('extractJsonPatchFromEvent', () => {
    test('expect preference from event', async () => {
      const result = await extractJsonPatchFromEvent(patchEventJson as unknown as APIGatewayProxyEventV2)
      expect(result).toEqual(jsonPatchOperations)
    })
  })
})

import { APIGatewayProxyEventV2, Link, PatchOperation } from '../types'

// 1 week = 7 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds = 604,800,000
const EXPIRATION_DURATION = 604_800_000

/* Links */

const isValidLink = (link: Link): Promise<Link> =>
  Promise.resolve()
    .then(() => link.url ?? Promise.reject('url missing from link'))
    .then(() => link)

export const formatLink = (link: Link): Promise<Link> =>
  isValidLink(link).then(() => ({
    accessCount: 0,
    expiration: new Date().getTime() + EXPIRATION_DURATION,
    url: link.url,
  }))

/* Event */

const parseEventBody = (event: APIGatewayProxyEventV2): unknown =>
  JSON.parse(
    event.isBase64Encoded && event.body ? Buffer.from(event.body, 'base64').toString('utf8') : (event.body as string)
  )

export const extractLinkFromEvent = (event: APIGatewayProxyEventV2): Promise<Link> =>
  formatLink(parseEventBody(event) as Link)

export const extractJsonPatchFromEvent = (event: APIGatewayProxyEventV2): PatchOperation[] =>
  parseEventBody(event) as PatchOperation[]

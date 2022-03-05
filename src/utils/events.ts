import { APIGatewayProxyEventV2, Link, PatchOperation, StringObject } from '../types'
import jwt from 'jsonwebtoken'

// 1 week = 7 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds = 604,800,000
const EXPIRATION_DURATION = 604_800_000

/* Links */

interface UnformattedLink {
  accessCount?: number
  expiration?: number
  lastAccessed?: number
  url: string
}

export const formatLink = (link: UnformattedLink): Link => {
  if (!link.url) {
    throw new Error('url missing from link')
  }
  if (new URL(link.url).protocol.match(/^https?:$/i) === null) {
    throw new Error('url must be http or https')
  }
  return {
    accessCount: link.accessCount ?? 0,
    expiration: link.expiration ?? new Date().getTime() + EXPIRATION_DURATION,
    lastAccessed: link.lastAccessed ?? 0,
    url: link.url,
  }
}

/* Event */

const parseEventBody = (event: APIGatewayProxyEventV2): unknown =>
  JSON.parse(
    event.isBase64Encoded && event.body ? Buffer.from(event.body, 'base64').toString('utf8') : (event.body as string)
  )

export const extractLinkFromEvent = (event: APIGatewayProxyEventV2): Link =>
  formatLink(parseEventBody(event) as UnformattedLink)

export const extractJsonPatchFromEvent = (event: APIGatewayProxyEventV2): PatchOperation[] =>
  parseEventBody(event) as PatchOperation[]

export const extractJwtFromEvent = (event: APIGatewayProxyEventV2): StringObject =>
  jwt.decode((event.headers.authorization || event.headers.Authorization).replace(/^Bearer /i, ''))

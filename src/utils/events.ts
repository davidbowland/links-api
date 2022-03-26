import jwt from 'jsonwebtoken'

import { APIGatewayProxyEventV2, Link, PatchOperation, StringObject } from '../types'
import { linkExpireDays } from '../config'

// 24 hours * 60 minutes * 60 seconds * 1000 milliseconds = 86,400,000
const EXPIRATION_DURATION = linkExpireDays * 86_400_000

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
  const lastExpiration = new Date().getTime() + EXPIRATION_DURATION
  if (link.expiration !== undefined && link.expiration > lastExpiration) {
    throw new Error('expiration is outside acceptable range')
  }
  return {
    accessCount: link.accessCount ?? 0,
    expiration: link.expiration ?? lastExpiration,
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

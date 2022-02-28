import { Link, PatchOperation } from '@types'

export const linkId = 'abc123'

export const link: Link = {
  accessCount: 7,
  expiration: 1646033707709,
  lastAccessed: 1646033707710,
  url: 'https://dbowland.com/'
}

export const jsonPatchOperations: PatchOperation[] = [{ op: 'replace', path: '/url', value: 'https://bowland.link/' }]

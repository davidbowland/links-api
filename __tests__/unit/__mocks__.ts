import { Link, PatchOperation } from '@types'

export const linkId = 'abc123'

export const link: Link = {
  accessCount: 7,
  expiration: 1646033707709,
  lastAccessed: 1646033707710,
  url: 'https://dbowland.com/',
}

export const jsonPatchOperations: PatchOperation[] = [{ op: 'replace', path: '/url', value: 'https://bowland.link/' }]

export const jwt =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NDY0NTM0MDgsImV4cCI6MTY3Nzk4OTQwOCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInBob25lX251bWJlciI6IisxNTU1MTIzNDU2NyIsIm5hbWUiOiJEYXZlIn0.cGg6zUrwlpzMIaczADmZLJgNDXMBPR2Gdixx_XlDr9Y'

export const decodedJwt = {
  name: 'Dave',
  phone_number: '+15551234567',
}

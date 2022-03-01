export * from 'aws-lambda'
export { Operation as PatchOperation } from 'fast-json-patch'

export interface Link {
  accessCount: number
  expiration?: number
  lastAccessed?: number
  url: string
}

export interface LinkBatch {
  [key: string]: Link
}

export interface StringObject {
  [key: string]: string
}

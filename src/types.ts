export * from 'aws-lambda'
export { Operation as PatchOperation } from 'fast-json-patch'

export interface Link {
  accessCount: number
  expiration: number
  lastAccessed?: number
  url: string
}

export interface LinkBatch {
  data: Link
  id: string
}

export interface StringObject {
  [key: string]: string
}

export type MessageType = 'PROMOTIONAL' | 'TRANSACTIONAL'

export interface SMSMessage {
  to: string
  contents: string
  messageType?: MessageType
}

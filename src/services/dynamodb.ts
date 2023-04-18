import {
  DeleteItemCommand,
  DeleteItemOutput,
  DynamoDB,
  GetItemCommand,
  PutItemCommand,
  PutItemOutput,
  ScanCommand,
  ScanOutput,
} from '@aws-sdk/client-dynamodb'

import { Link, LinkBatch } from '../types'
import { dynamodbTableName } from '../config'
import { xrayCapture } from '../utils/logging'

const dynamodb = xrayCapture(new DynamoDB({ apiVersion: '2012-08-10' }))

/* Delete item */

export const deleteDataById = async (linkId: string): Promise<DeleteItemOutput> => {
  const command = new DeleteItemCommand({
    Key: {
      LinkId: {
        S: `${linkId}`,
      },
    },
    TableName: dynamodbTableName,
  })
  return dynamodb.send(command)
}

/* Get single item */

export const getDataById = async (linkId: string): Promise<Link> => {
  const command = new GetItemCommand({
    Key: {
      LinkId: {
        S: `${linkId}`,
      },
    },
    TableName: dynamodbTableName,
  })
  const response = await dynamodb.send(command)
  return JSON.parse(response.Item.Data.S)
}

/* Scan for all items */

const getItemsFromScan = (response: ScanOutput): LinkBatch[] =>
  response.Items?.map((item) => ({
    data: JSON.parse(item.Data.S as string),
    id: item.LinkId.S as string,
  })) as LinkBatch[]

export const scanData = async (): Promise<LinkBatch[]> => {
  const command = new ScanCommand({
    AttributesToGet: ['Data', 'LinkId', 'Expiration'],
    TableName: dynamodbTableName,
  })
  const response = await dynamodb.send(command)
  return getItemsFromScan(response)
}

/* Scan for expired items */

export const scanExpiredIds = async (): Promise<any> => {
  const command = new ScanCommand({
    ExpressionAttributeValues: {
      ':v1': {
        N: '1',
      },
      ':v2': {
        N: `${new Date().getTime()}`,
      },
    },
    FilterExpression: 'Expiration BETWEEN :v1 AND :v2',
    IndexName: 'ExpirationIndex',
    TableName: dynamodbTableName,
  })
  const response = await dynamodb.send(command)
  return response.Items.map((item: any) => item.LinkId.S)
}

/* Set item */

export const setDataById = async (linkId: string, data: Link): Promise<PutItemOutput> => {
  const command = new PutItemCommand({
    Item: {
      Data: {
        S: JSON.stringify(data),
      },
      Expiration: {
        N: `${data.expiration ?? 0}`,
      },
      LinkId: {
        S: `${linkId}`,
      },
    },
    TableName: dynamodbTableName,
  })
  return dynamodb.send(command)
}

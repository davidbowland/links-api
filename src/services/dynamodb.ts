import { DynamoDB } from 'aws-sdk'

import { dynamodbTableName } from '../config'
import { Link, LinkBatch } from '../types'

const dynamodb = new DynamoDB({ apiVersion: '2012-08-10' })

/* Delete item */

export const deleteDataById = (linkId: string): Promise<DynamoDB.Types.DeleteItemOutput> =>
  dynamodb
    .deleteItem({
      Key: {
        LinkId: {
          S: `${linkId}`,
        },
      },
      TableName: dynamodbTableName,
    })
    .promise()

/* Get single item */

export const getDataById = (linkId: string): Promise<Link> =>
  dynamodb
    .getItem({
      Key: {
        LinkId: {
          S: `${linkId}`,
        },
      },
      TableName: dynamodbTableName,
    })
    .promise()
    .then((response) => response.Item.Data.S)
    .then(JSON.parse)

/* Scan for all items */

const getItemsFromScan = (response: DynamoDB.Types.ScanOutput): LinkBatch =>
  response.Items.reduce((result, item) => ({ ...result, [item.LinkId.S]: JSON.parse(item.Data.S) }), {} as LinkBatch)

export const scanData = (): Promise<LinkBatch> =>
  dynamodb
    .scan({
      AttributesToGet: ['Data', 'LinkId', 'Expiration'],
      TableName: dynamodbTableName,
    })
    .promise()
    .then((response) => getItemsFromScan(response))

/* Scan for expired items */

export const scanExpiredIds = (): Promise<any> =>
  dynamodb
    .scan({
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
    .promise()
    .then((response) => response.Items.map((item) => item.LinkId.S))

/* Set item */

export const setDataById = (linkId: string, data: Link): Promise<DynamoDB.Types.PutItemOutput> =>
  dynamodb
    .putItem({
      Item: {
        LinkId: {
          S: `${linkId}`,
        },
        Expiration: {
          N: `${data.expiration ?? 0}`,
        },
        Data: {
          S: JSON.stringify(data),
        },
      },
      TableName: dynamodbTableName,
    })
    .promise()

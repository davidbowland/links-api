import axios from 'axios'
import axiosRetry from 'axios-retry'

// Axios

axiosRetry(axios, { retries: 3 })

// API

export const apiUrl = process.env.API_URL as string

// Cognito

export const userPoolId = process.env.USER_POOL_ID as string

// DynamoDB

export const dynamodbTableName = process.env.DYNAMODB_TABLE_NAME as string

// JsonPatch

export const throwOnInvalidJsonPatch = true
export const mutateObjectOnJsonPatch = false

// Links

export const idMinLength = parseInt(process.env.ID_MIN_LENGTH as string, 10)
export const idMaxLength = parseInt(process.env.ID_MAX_LENGTH as string, 10)

// SMS Queue API

export const corsDomain = process.env.CORS_DOMAIN as string
export const smsApiKeyName = process.env.SMS_API_KEY_NAME as string
export const smsApiUrl = process.env.SMS_API_URL as string

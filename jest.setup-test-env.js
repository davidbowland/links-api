// Cognito

process.env.USER_POOL_ID = 'us-east-2_8765redfghuyt'

// DynamoDB

process.env.DYNAMODB_TABLE_NAME = 'links-table'

// Links

process.env.ID_MIN_LENGTH = '3'
process.env.ID_MAX_LENGTH = '4'
process.env.LINKS_EXPIRE_DAYS = '365'

// SMS Queue API

process.env.CORS_DOMAIN = 'http://links.bowland.link'
process.env.SMS_API_KEY = '3edfgr4ertyjkijhg8'
process.env.SMS_API_URL = 'https://sms-api.dbowland.com/v1'

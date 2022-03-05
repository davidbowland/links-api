#!/usr/bin/env bash

# Stop immediately on error
set -e

if [[ -z "$1" ]]; then
  $(./scripts/assumeDeveloperRole.sh)
fi

# Only install production modules
export NODE_ENV=production

# Build the project
SAM_TEMPLATE=template.yaml
sam build --template ${SAM_TEMPLATE}

# Start the API locally
export API_URL='https://links-api.bowland.link/v1'
export CORS_DOMAIN='http://links.bowland.link'
export DYNAMODB_TABLE_NAME=links-api-test
export ID_MIN_LENGTH=3
export ID_MAX_LENGTH=4
export SMS_API_KEY_NAME=sms-qu-ApiAp-3Ox0KVJulSZ0
export SMS_API_URL='https://sms-queue-api.bowland.link/v1'
export USER_POOL_ID=us-east-2_7k2VH6sSy
sam local start-api --region=us-east-2 --force-image-build

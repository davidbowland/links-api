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
export DYNAMODB_TABLE_NAME=links-api-test
export ID_MIN_LENGTH=3
export ID_MAX_LENGTH=4
sam local start-api --region=us-east-2 --force-image-build

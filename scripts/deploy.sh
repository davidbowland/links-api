#!/usr/bin/env bash

# Stop immediately on error
set -e

if [[ -z "$1" ]]; then
  $(./scripts/assumeDeveloperRole.sh)
fi

# Build from template

SAM_TEMPLATE=template.yaml
sam build --template ${SAM_TEMPLATE} --use-container -e NODE_ENV=production

# Deploy build lambda

SMS_API_KEY=$(aws apigateway get-api-key --api-key l3q9ffyih6 --include-value --region us-east-1 | jq -r .value)
TESTING_ARTIFACTS_BUCKET=links-lambda-test
TESTING_CLOUDFORMATION_EXECUTION_ROLE="arn:aws:iam::$AWS_ACCOUNT_ID:role/links-cloudformation-test"
TESTING_STACK_NAME=links-api-test
sam deploy --stack-name ${TESTING_STACK_NAME} \
           --capabilities CAPABILITY_IAM \
           --region us-east-2 \
           --s3-bucket ${TESTING_ARTIFACTS_BUCKET} \
           --s3-prefix links-api-test \
           --no-fail-on-empty-changeset \
           --role-arn ${TESTING_CLOUDFORMATION_EXECUTION_ROLE} \
           --parameter-overrides "Environment=test SmsApiKey=$SMS_API_KEY"

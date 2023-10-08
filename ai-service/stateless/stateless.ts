import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

import { Construct } from 'constructs';
import { Tracing } from 'aws-cdk-lib/aws-lambda';

export interface StatelessStackProps extends cdk.StackProps {
  table: dynamodb.Table;
}

export class AiServiceStatelessStack extends cdk.Stack {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: StatelessStackProps) {
    super(scope, id, props);

    this.table = props.table;

    const lambdaPowerToolsConfig = {
      LOG_LEVEL: 'DEBUG',
      POWERTOOLS_LOGGER_LOG_EVENT: 'true',
      POWERTOOLS_LOGGER_SAMPLE_RATE: '1',
      POWERTOOLS_TRACE_ENABLED: 'enabled',
      POWERTOOLS_TRACER_CAPTURE_HTTPS_REQUESTS: 'captureHTTPsRequests',
      POWERTOOLS_SERVICE_NAME: 'AiService',
      POWERTOOLS_TRACER_CAPTURE_RESPONSE: 'captureResult',
      POWERTOOLS_METRICS_NAMESPACE: 'Advocate',
    };

    const actionPromptLambda: nodeLambda.NodejsFunction =
      new nodeLambda.NodejsFunction(this, 'ActionPromptLambda', {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(
          __dirname,
          'src/adapters/primary/action-prompt/action-prompt.adapter.ts'
        ),
        memorySize: 1024,
        functionName: 'action-prompt-lambda',
        timeout: cdk.Duration.seconds(29),
        tracing: Tracing.ACTIVE,
        handler: 'handler',
        bundling: {
          minify: true,
          externalModules: [],
        },
        environment: {
          TABLE_NAME: this.table.tableName,
          ...lambdaPowerToolsConfig,
        },
      });

    // give the lambda access to the database table
    this.table.grantReadWriteData(actionPromptLambda);

    // allow the lambda function to use amazon bedrock
    actionPromptLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['bedrock:InvokeModel'],
        resources: [
          'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-v2',
        ],
      })
    );
    actionPromptLambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['bedrock:ListFoundationModels'],
        resources: ['*'],
      })
    );

    // create the api gateway prompt api
    const api: apigw.RestApi = new apigw.RestApi(this, 'AiApi', {
      description: 'Advocate AI API',
      endpointTypes: [apigw.EndpointType.EDGE],
      deploy: true,
      deployOptions: {
        stageName: 'prod',
        dataTraceEnabled: true,
        loggingLevel: apigw.MethodLoggingLevel.INFO,
        tracingEnabled: true,
        metricsEnabled: true,
      },
    });

    const prompts: apigw.Resource = api.root.addResource('prompts');

    // note: this is not production ready and you would use the most appropriate authentication for you
    const apiKey = api.addApiKey('AiApiKey', {
      apiKeyName: 'ai-api-key',
      value: 'ce6fd602-7923-4230-9517-f3a4cb8a25a4',
      description: 'The AI API Key',
    });
    apiKey.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    // hook up the post method to the lambda
    prompts.addMethod(
      'POST',
      new apigw.LambdaIntegration(actionPromptLambda, {
        proxy: true,
      }),
      {
        apiKeyRequired: true, // ensure that the consumer needs to send the api key
      }
    );

    // create a usage plan for the api with the relevant key
    const usagePlan = api.addUsagePlan('APIUsagePlan', {
      apiStages: [{ stage: api.deploymentStage }],
      name: 'AI-API-Usage-Plan-With-Key',
      description: 'The AI API Usage Plan',
      throttle: {
        rateLimit: 10,
        burstLimit: 2,
      },
    });
    usagePlan.addApiKey(apiKey);
    usagePlan.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  }
}

#!/usr/bin/env node

import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';

import { AiServiceStatefulStack } from '../stateful/stateful';
import { AiServiceStatelessStack } from '../stateless/stateless';

const app = new cdk.App();
const statefulStack = new AiServiceStatefulStack(
  app,
  'AiServiceStatefulStack',
  {
    env: {
      region: 'us-east-1',
    },
  }
);
new AiServiceStatelessStack(app, 'AiServiceStatelessStack', {
  table: statefulStack.table,
  env: {
    region: 'us-east-1',
  },
});

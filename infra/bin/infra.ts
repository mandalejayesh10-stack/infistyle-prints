#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfistyleCdkStack } from '../lib/cdk-stack';

const app = new cdk.App();

new InfistyleCdkStack(app, 'InfistyleCdkStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-south-1', // Default to Mumbai for Infistyle India
  },
});

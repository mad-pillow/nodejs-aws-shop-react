import * as cdk from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

export class AwsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create OAI (Origin Access Identity)
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      "Dmytro-Sychov-Static-Site-OAI"
    );

    // Create an S3 Bucket
    const s3Bucket = new s3.Bucket(this, "Dmytro-Sychov-Static-Site-Bucket", {
      bucketName: "dmytro-sychov-static-site-bucket",
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      websiteIndexDocument: "index.html",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      versioned: true,
    });

    // Add a bucket policy to allow CloudFront to read from the bucket
    s3Bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [s3Bucket.arnForObjects("*")],
        principals: [
          new iam.CanonicalUserPrincipal(
            originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );

    // Create a CloudFront distribution
    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "Dmytro-Sychov-Static-Site-Distribution",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: s3Bucket,
              originAccessIdentity,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
      }
    );

    // Deploy the project
    new s3deploy.BucketDeployment(this, "Dmytro-Sychov-Static-Site-Deploy", {
      sources: [s3deploy.Source.asset("../dist")],
      destinationBucket: s3Bucket,
      distribution,
      distributionPaths: ["/*"],
    });
  }
}

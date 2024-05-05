import { Construct } from 'constructs'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { RemovalPolicy } from 'aws-cdk-lib'

export const createS3TicketOrderImages = (scope: Construct) => {
	return new Bucket(scope, 'TicketOrderImagesBucket', {
		removalPolicy: RemovalPolicy.DESTROY,
	})
}

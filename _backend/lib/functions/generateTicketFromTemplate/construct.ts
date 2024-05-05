import { Duration } from 'aws-cdk-lib'
import { LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import * as path from 'path'

type CreateGenerateTicketFuncProps = {
	appName: string
	bucketName: string
	templateImageKey: string
	templateFontKey: string
	sharpLayerArn: string
	region: string
}
export const createGenerateTicketFunc = (
	scope: Construct,
	props: CreateGenerateTicketFuncProps
) => {
	const sharpLayer = LayerVersion.fromLayerVersionArn(
		scope,
		'SharpLayer',
		props.sharpLayerArn
	)

	const generateTicketFunc = new NodejsFunction(
		scope,
		`${props.appName}-generateTicketFunc`,
		{
			functionName: `${props.appName}-generateTicketFunc`,
			runtime: Runtime.NODEJS_18_X,
			timeout: Duration.seconds(10),
			memorySize: 256,
			handler: 'handler',
			entry: path.join(__dirname, `./main.ts`),
			layers: [sharpLayer],
			environment: {
				BUCKET_NAME: props.bucketName,
				TEMPLATE_IMAGE_KEY: props.templateImageKey,
				TEMPLATE_FONT_KEY: props.templateFontKey,
				REGION: props.region,
			},
			bundling: {
				externalModules: ['sharp'],
			},
		}
	)

	return generateTicketFunc
}

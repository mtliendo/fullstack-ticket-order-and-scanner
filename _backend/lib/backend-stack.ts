import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { createAuth } from './auth/cognito'
import { createAppSyncAPI } from './api/appsync'
import { createTicketOrderTable } from './tables/dynamodb'
import { CDKContext } from '../cdk.context'
import { createAmplifyHosting } from './hosting/amplify'
import { createGenerateTicketFunc } from './functions/generateTicketFromTemplate/construct'
import { createTicketOrderWebhookFunc } from './functions/stripeOrderWebhook/construct'
import { createS3TicketOrderImages } from './storage/ticketOrderImagesBucket'

export class BackendStack extends cdk.Stack {
	constructor(
		scope: Construct,
		id: string,
		props: cdk.StackProps,
		context: CDKContext
	) {
		super(scope, id, props)
		//* ///////// Provision Resources ///////////
		const appNameWithStage = `${context.appName}-${context.stage}`

		const auth = createAuth(this, { appName: appNameWithStage })

		const ticketOrderTable = createTicketOrderTable(this, {
			appName: appNameWithStage,
		})

		const ticketOrderWebhook = createTicketOrderWebhookFunc(this, {
			appName: appNameWithStage,
			account: context.env.account,
			region: context.env.region,
			stripeSecretName: context.stripe.STRIPE_CREDENTIALS_WITH_WEBHOOK_KEY_NAME,
		})

		const orderImagesBucket = createS3TicketOrderImages(this)

		const generateTicketFunc = createGenerateTicketFunc(this, {
			appName: appNameWithStage,
			region: context.env.region,
			bucketName: orderImagesBucket.bucketName,
			templateImageKey: context.sharp.templateImageKey,
			templateFontKey: context.sharp.templateFontKey,
			sharpLayerArn: context.sharp.sharpLayerArn,
		})

		const api = createAppSyncAPI(this, {
			appName: appNameWithStage,
			userPool: auth.userPool,
			authRole: auth.identityPool.authenticatedRole,
			unauthRole: auth.identityPool.unauthenticatedRole,
			identityPoolId: auth.identityPool.identityPoolId,
			generateTicketLambda: generateTicketFunc,
			ticketOrderWebhookLambda: ticketOrderWebhook.ticketOrderWebhookFunc,
			twilioSID: context.twilio.TWILIO_SID,
			region: context.env.region,
			account: context.env.account,
			twilioSecretName: context.twilio.TWILIO_SECRET_NAME,
			twilioPhoneNumber: context.twilio.TWILIO_PHONE_NUMBER,
			ticketOrderTable,
		})

		//* ///////// Configure Additional Resources and Environments ///////////
		orderImagesBucket.grantReadWrite(generateTicketFunc)

		ticketOrderWebhook.ticketOrderWebhookFunc.addEnvironment(
			'REGION',
			context.env.region
		)
		ticketOrderWebhook.ticketOrderWebhookFunc.addEnvironment(
			'APPSYNC_API_URL',
			api.graphqlUrl
		)
		ticketOrderWebhook.ticketOrderWebhookFunc.addEnvironment(
			'STRIPE_CREDENTIALS_WITH_WEBHOOK',
			context.stripe.STRIPE_CREDENTIALS_WITH_WEBHOOK_KEY_NAME
		)

		console.log(JSON.stringify(context, null, 2))

		// const amplifyHosting = createAmplifyHosting(this, {
		// 	appName: appNameWithStage,
		// 	account: context.env.account,
		// 	branch: context.branch,
		// 	ghOwner: context.hosting.ghOwner,
		// 	ghTokenName: context.hosting.ghTokenName,
		// 	repo: context.hosting.repo,
		// 	environmentVariables: {
		// 		userPoolId: auth.userPool.userPoolId,
		// 		userPoolClientId: auth.userPoolClient.userPoolClientId,
		// 		identityPoolId: auth.identityPool.identityPoolId,
		// 		region: this.region,
		// 		apiUrl: api.graphqlUrl,
		// 	},
		// })

		new cdk.CfnOutput(this, 'GraphQLAPIURL', {
			value: api.graphqlUrl,
		})
		new cdk.CfnOutput(this, 'GraphQLAPIID', {
			value: api.apiId,
		})
		new cdk.CfnOutput(this, 'UserPoolId', {
			value: auth.userPool.userPoolId,
		})
		new cdk.CfnOutput(this, 'UserPoolClientId', {
			value: auth.userPoolClient.userPoolClientId,
		})
		new cdk.CfnOutput(this, 'IdentityPoolId', {
			value: auth.identityPool.identityPoolId,
		})

		new cdk.CfnOutput(this, 'Region', {
			value: this.region,
		})

		// new cdk.CfnOutput(this, 'AmplifyAppId', {
		// 	value: amplifyHosting.appId,
		// })
		new cdk.CfnOutput(this, 'BucketName', {
			value: orderImagesBucket.bucketName,
		})

		new cdk.CfnOutput(this, 'ticketOrderWebhookURL', {
			value: ticketOrderWebhook.ticketOrderFunctionURL,
		})
	}
}

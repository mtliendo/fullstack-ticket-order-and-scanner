import { Construct } from 'constructs'
import * as path from 'path'
import {
	AuthorizationType,
	Definition,
	GraphqlApi,
	FieldLogLevel,
	FunctionRuntime,
	Code,
} from 'aws-cdk-lib/aws-appsync'
import { IRole, PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { UserPool } from 'aws-cdk-lib/aws-cognito'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { IFunction } from 'aws-cdk-lib/aws-lambda'

type AppSyncAPIProps = {
	appName: string
	userPool: UserPool
	authRole: IRole
	unauthRole: IRole
	identityPoolId: string
	ticketOrderTable: Table
	generateTicketLambda: IFunction
	ticketOrderWebhookLambda: IFunction
	region: string
	account: string
	twilioSecretName: string
	twilioSID: string
	twilioPhoneNumber: string
}

export const createAppSyncAPI = (scope: Construct, props: AppSyncAPIProps) => {
	const api = new GraphqlApi(scope, `${props.appName}`, {
		name: props.appName,
		definition: Definition.fromFile(path.join(__dirname, 'schema.graphql')),
		authorizationConfig: {
			defaultAuthorization: {
				authorizationType: AuthorizationType.USER_POOL,
				userPoolConfig: {
					userPool: props.userPool,
				},
			},
			additionalAuthorizationModes: [
				{
					authorizationType: AuthorizationType.IAM,
				},
			],
		},
		logConfig: {
			fieldLogLevel: FieldLogLevel.ALL,
		},
	})

	// Add the Datasource that my resolvers will make use of
	const tickedOrderDS = api.addDynamoDbDataSource(
		'TicketOrderDS',
		props.ticketOrderTable
	)

	const generateTicketLambdaDS = api.addLambdaDataSource(
		'generateTicketLambdaDS',
		props.generateTicketLambda
	)

	const secretsManagerDS = api.addHttpDataSource(
		'getSecretFromSecretsManagerDS',
		`https://secretsmanager.${props.region}.amazonaws.com`,
		{
			authorizationConfig: {
				signingRegion: props.region,
				signingServiceName: 'secretsmanager',
			},
		}
	)

	secretsManagerDS.grantPrincipal.addToPrincipalPolicy(
		new PolicyStatement({
			resources: [
				`arn:aws:secretsmanager:${props.region}:${props.account}:secret:${props.twilioSecretName}-*`,
			],
			actions: ['secretsmanager:GetSecretValue'],
		})
	)

	//www.twilio.com/docs/usage/apip
	const twilioDS = api.addHttpDataSource(
		'twilioAPIDS',
		'https://api.twilio.com'
	)

	// This will be used on the frontend. Only auth users.
	api.createResolver('getTicketOrderResolver', {
		typeName: 'Query',
		fieldName: 'getTicketOrder',
		dataSource: tickedOrderDS,
		runtime: FunctionRuntime.JS_1_0_0,
		code: Code.fromAsset(
			path.join(__dirname, 'JS_functions/getTicketOrder.js')
		),
	})

	//This will be used on the frontend to retrieve a ticket. Only auth users.
	api.createResolver('updateTicketOrderResolver', {
		typeName: 'Mutation',
		fieldName: 'updateTicketOrder',
		dataSource: tickedOrderDS,
		runtime: FunctionRuntime.JS_1_0_0,
		code: Code.fromAsset(
			path.join(__dirname, 'JS_functions/updateTicketOrder.js')
		),
	})

	//Function 1: Function to get the Stripe details and store the details in DynamoDB (DynamoDB Datasource)
	const addStripePaymentToDDB = tickedOrderDS.createFunction(
		'addStripePaymentToDDBFunction',
		{
			name: 'addStripePaymentToDDB',
			runtime: FunctionRuntime.JS_1_0_0,
			code: Code.fromAsset(
				path.join(__dirname, 'JS_functions/addStripePaymentToDDB.js')
			),
		}
	)

	//Function 2: Function to get the image from S3, create the ticket and store in S3 (Lambda Datasource)
	const generateTicketFromTemplate = generateTicketLambdaDS.createFunction(
		'generateTicketLambdaFunction',
		{
			name: 'generateTicketLambdaFunction',
		}
	)
	//Function 3: Function to get the secret from Secrets Manager,
	const fetchSecretFromSSM = secretsManagerDS.createFunction(
		'getTwilioSecretFunc',
		{
			name: 'getTwilioSecretFunc',
			runtime: FunctionRuntime.JS_1_0_0,
			code: Code.fromAsset(
				path.join(__dirname, 'JS_functions/getTwilioSecret.js')
			),
		}
	)

	//Function 4: Call the Twilio API (HTTP Resolver)
	const postMessageFromTwilio = twilioDS.createFunction('sendTwilioMessage', {
		name: 'sendTwilioMessage',
		runtime: FunctionRuntime.JS_1_0_0,
		code: Code.fromAsset(
			path.join(__dirname, 'JS_functions/sendTwilioMessage.js')
		),
	})
	//This will be a pipeline that creates the ticket and sends it to the user
	api.createResolver('createTicketOrderResolver', {
		typeName: 'Mutation',
		fieldName: 'createTicketOrder',
		runtime: FunctionRuntime.JS_1_0_0,
		code: Code.fromInline(
			`
			export function request(ctx) {
				ctx.stash.twilioSID = "${props.twilioSID}"
				ctx.stash.twilioPhoneNumber = "${props.twilioPhoneNumber}"
				return {}
			}

			export function response(ctx) {
				return ctx.prev.result
			}
			`
		),
		pipelineConfig: [
			addStripePaymentToDDB,
			generateTicketFromTemplate,
			fetchSecretFromSSM,
			postMessageFromTwilio,
		],
	})

	api.grantMutation(props.ticketOrderWebhookLambda)

	return api
}

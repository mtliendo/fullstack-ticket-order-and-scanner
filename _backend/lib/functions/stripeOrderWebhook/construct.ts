import { Duration } from 'aws-cdk-lib'
import * as aws_iam from 'aws-cdk-lib/aws-iam'
import { FunctionUrlAuthType, Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import * as path from 'path'

type TicketOrderWebhookFuncProps = {
	appName: string
	region: string
	account: string
	stripeSecretName: string
}

export const createTicketOrderWebhookFunc = (
	scope: Construct,
	props: TicketOrderWebhookFuncProps
) => {
	const ticketOrderWebhookFunc = new NodejsFunction(
		scope,
		`${props.appName}-ticketOrderWebhookFunc`,
		{
			functionName: `${props.appName}-ticketOrderWebhookFunc`,
			runtime: Runtime.NODEJS_18_X,
			handler: 'handler',
			entry: path.join(__dirname, `./main.ts`),
			timeout: Duration.seconds(30),
		}
	)

	const functionURL = ticketOrderWebhookFunc.addFunctionUrl({
		authType: FunctionUrlAuthType.NONE,
	})

	ticketOrderWebhookFunc.addToRolePolicy(
		new aws_iam.PolicyStatement({
			actions: ['secretsmanager:GetSecretValue'],
			resources: [
				`arn:aws:secretsmanager:${props.region}:${props.account}:secret:${props.stripeSecretName}-*`,
			],
		})
	)
	return { ticketOrderWebhookFunc, ticketOrderFunctionURL: functionURL.url }
}

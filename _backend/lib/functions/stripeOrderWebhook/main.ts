import {
	SecretsManagerClient,
	GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager'
import { AppSyncRequestIAM } from './appsyncAuthUtil'
import Stripe from 'stripe'
import { createTicketOrder } from '../../api/codegen/mutations'
import { CreateTicketOrderInput } from '../../api/codegen/API'

const client = new SecretsManagerClient()

type StripeSecrets = {
	STRIPE_SECRET_KEY: string
	STRIPE_SECRET_WEBHOOK: string
}
const fetchSecrets = async (secretName: string | undefined) => {
	try {
		const command = new GetSecretValueCommand({ SecretId: secretName })
		const response = await client.send(command)
		const secretValue = response.SecretString

		if (!secretValue) return null
		const stripeSecrets = JSON.parse(secretValue) as StripeSecrets
		return stripeSecrets
	} catch (error) {
		console.error('Error fetching secret:', error)
		return null
	}
}

exports.handler = async (event: any) => {
	const eventData = JSON.parse(event.body).data.object
	const stripeSecrets = await fetchSecrets(
		process.env.STRIPE_CREDENTIALS_WITH_WEBHOOK as string
	)

	if (!stripeSecrets) return { error: 'Missing secrets' }

	const stripe = new Stripe(stripeSecrets.STRIPE_SECRET_KEY)
	const sig = event.headers['stripe-signature']
	let verifiedEvent

	try {
		verifiedEvent = stripe.webhooks.constructEvent(
			event.body,
			sig,
			stripeSecrets.STRIPE_SECRET_WEBHOOK
		)
	} catch (err: any) {
		console.log('uh there was an error', err)
		return { error: err.message }
	}

	switch (verifiedEvent.type) {
		case 'checkout.session.completed':
			try {
				const res = await AppSyncRequestIAM({
					config: {
						region: process.env.REGION as string,
						url: process.env.APPSYNC_API_URL as string,
					},
					operation: {
						operationName: 'CreateTicketOrder',
						query: createTicketOrder,
						variables: {
							input: {
								amountPaidInCents: eventData.amount_total,
								email: eventData.customer_details.email,
								purchaser: eventData.customer_details.name,
								buyerPhoneNumber: eventData.customer_details.phone,
								stripeOrderId: eventData.id,
							} as CreateTicketOrderInput,
						},
					},
				})
				console.log('the appsync res', res)
			} catch (e) {
				console.log('error', e)
			}
			break
		default:
			console.log(`Unhandled verifiedEvent type ${verifiedEvent.type}`)
	}
}

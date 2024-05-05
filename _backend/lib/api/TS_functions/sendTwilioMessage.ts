import { Context, util } from '@aws-appsync/utils'

function toUrlEncodedString(obj: Record<string, string>) {
	return Object.keys(obj)
		.map((key) => {
			const encodedKey = util.urlEncode(key)
			const encodedValue = util.urlEncode(obj[key])
			return `${encodedKey}=${encodedValue}`
		})
		.join('&')
}

export function request(ctx: Context) {
	const base64Auth = util.base64Encode(`${ctx.stash.twilioSID}:${ctx.prev.result}`)

	const bodyToURLEncode = {
		To: ctx.stash.ticketOrderResult.buyerPhoneNumber,
		From: ctx.stash.twilioPhoneNumber,
		Body: `Thank you SO MUCH for your purchase!
					Here is your ticket:`,
		MediaUrl: ctx.stash.mediaUrl as string,
	}

	const urlEncodedBody = toUrlEncodedString(bodyToURLEncode)

	return {
		method: 'POST',
		resourcePath: `/2010-04-01/Accounts/${ctx.stash.twilioSID}/Messages.json`,
		params: {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization: `Basic ${base64Auth}`,
			},
			body: urlEncodedBody,
		},
	}
}

export function response(ctx: Context) {
	const parsedResult = JSON.parse(ctx.result.body)

	if (parsedResult.error_message) {
		util.appendError(parsedResult.error_message)
	}
	return 'Message successfully sent'
}

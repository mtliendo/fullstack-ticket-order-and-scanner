import { Context, util } from '@aws-appsync/utils'

export function request(ctx: Context) {
	//if the prev function was a lambda that returned a mediaURL for twilio
	if (ctx.prev.result.body.url) {
		ctx.stash.mediaUrl = ctx.prev.result.body.url
	}
	return {
		method: 'POST',
		version: '2018-05-29',
		resourcePath: '/',
		params: {
			headers: {
				'content-type': 'application/x-amz-json-1.1',
				'x-amz-target': 'secretsmanager.GetSecretValue',
			},
			body: {
				SecretId: 'twilio', //update to use envVars when released
			},
		},
	}
}

export function response(ctx: Context) {
	//"{Name: 'twilio', SecretString: "'abc123'"}"
	console.log(ctx.result.body)
	const result = JSON.parse(ctx.result.body).SecretString

	return JSON.parse(result).TWILIO_SECRET
}

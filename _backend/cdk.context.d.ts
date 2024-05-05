export type CDKContext = {
	appName: string
	stage: string
	branch: string
	env: {
		account: string
		region: string
	}
	hosting: {
		ghTokenName: string
		ghOwner: string
		repo: string
	}
	stripe: {
		STRIPE_CREDENTIALS_WITH_WEBHOOK_KEY_NAME: string
	}
	sharp: {
		sharpLayerArn: string
		templateImageKey: string
		templateFontKey: string
	}
	twilio: {
		TWILIO_SID: string
		TWILIO_SECRET_NAME: string
		TWILIO_PHONE_NUMBER: string
	}
}

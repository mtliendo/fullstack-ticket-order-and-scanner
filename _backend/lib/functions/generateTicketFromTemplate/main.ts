//! This function is invoked by a webhookcalls an AppSync API which itself calls another Lambda function as one of its steps. So we have a lambda -> Lambda coupling. Not a big deal because this is a webhook and happening serverside, but something to atleast be aware of.
import {
	S3Client,
	GetObjectCommand,
	PutObjectCommand,
	GetObjectCommandOutput,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import * as TextToSVG from 'text-to-svg'
import * as bwipjs from 'bwip-js'
import sharp = require('sharp')
import { writeFileSync } from 'fs'

// Create the S3 client
const s3Client = new S3Client({ region: process.env.REGION })
const templateKey = process.env.TEMPLATE_FONT_KEY as string
const downloadPath = `/tmp/${templateKey}`

// Create a  barcode
async function generateBarcode(text: string) {
	let svg = bwipjs.toSVG({
		bcid: 'code128', // Barcode type
		text, // Text to encode
		width: 80,
		includetext: true, // Show human-readable text under barcode (useful for manually entering ticket for redemption)
		textxalign: 'center', // Always good to set this
		textcolor: 'ff0000', // Red text
		rotate: 'L', //rotate barcode counter-clockwise
	})
	return Buffer.from(svg)
}

async function getFontFromS3AndSaveLocally() {
	const Bucket = process.env.BUCKET_NAME as string
	let fontRes: GetObjectCommandOutput | undefined

	try {
		fontRes = await s3Client.send(
			new GetObjectCommand({ Bucket, Key: templateKey })
		)
	} catch (e) {
		console.log('error getting template')
	}
	if (!fontRes?.Body) throw new Error('No body found in response')

	const fontByteArr = await fontRes.Body.transformToByteArray()
	const fontBuffer = Buffer.from(fontByteArr)
	writeFileSync(downloadPath, fontBuffer)
}

// Create an SVG from text
async function generateSVG(text: string) {
	const textToSVG = TextToSVG.loadSync(downloadPath)

	try {
		const svg = textToSVG.getSVG(text, {
			fontSize: 110,
			anchor: 'top',
			attributes: { fill: 'black' },
		})
		return Buffer.from(svg)
	} catch (err) {
		console.error('Error generating SVG:', err)
		throw err
	}
}

exports.handler = async (event: any) => {
	console.log('the event', event)
	// const args = JSON.parse(event).arguments.input
	const args = event.arguments.input

	const ticketId = args.stripeOrderId
	const customerName = args.purchaser as string
	const imgKey = `${customerName
		.split(' ')
		.join('-')
		.toLocaleLowerCase()}-${ticketId}.png`

	const Bucket = process.env.BUCKET_NAME as string
	const Key = process.env.TEMPLATE_IMAGE_KEY as string

	let res: GetObjectCommandOutput | undefined
	try {
		res = await s3Client.send(new GetObjectCommand({ Bucket, Key }))
	} catch (e) {
		console.log('error getting template')
	}

	if (!res?.Body) throw new Error('No body found in response')

	const imageByteArr = await res.Body.transformToByteArray()
	const imageBuffer = Buffer.from(imageByteArr)
	const templateImage = sharp(imageBuffer)

	// Generate  barcode for the ticket as buffer
	const barcodeImageBuffer = await generateBarcode(ticketId)

	// Get the font from S3 and Save it locally
	await getFontFromS3AndSaveLocally()

	// Generate customer name for ticket as buffer
	const customerNameImageBuffer = await generateSVG(customerName)

	// Params to overlay QR code onto the template
	const barcodeOverlay = {
		input: barcodeImageBuffer,
		left: 3400, // X position for QR code
		top: 400, // Y position for QR code
	}
	// Params to overlay SVG onto the template
	const svgOverlay = {
		input: customerNameImageBuffer,
		top: 700,
		left: 600,
	}

	const finishedImgBuffer = await templateImage
		.composite([barcodeOverlay, svgOverlay])
		.toBuffer()

	try {
		await s3Client.send(
			new PutObjectCommand({
				Bucket,
				Key: imgKey,
				Body: finishedImgBuffer,
				ContentType: 'image/png',
			})
		)

		const url = await getSignedUrl(
			s3Client,
			new GetObjectCommand({
				Bucket,
				Key: imgKey,
			}),
			{
				expiresIn: 3600, // URL expires in 1 hour
			}
		)

		console.log('the url that is signed', url)

		return {
			statusCode: 200,
			body: { url },
		}
	} catch (e) {
		console.log('uh oh', e)
		return {
			statusCode: 500,
		}
	}
}

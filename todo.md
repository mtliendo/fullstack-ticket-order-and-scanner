# Todo

As I develop, these are things that are still tbd.

## Cleanup

Now that the project is complete it's time to get it ready for sharing. 0. Allow barcode number to be printed on the barcode

1. Remove hardcoded API region and URL in StripeOrder Func in favor of envVars✅
2. Fix Twilio API Secret Key in secrets Manager so it has both SID and Auth Key in object, adjust code accordingly✅ (scoped out)
3. Parameratize values in cdk.context and adjust cdk.context.ts file accordingly✅
4. Pass the event name to the DB via the payment link id. Add the link id + name to the event ticket. (scoped out)
5. Host on Amplify
6. Create Simple landing page, add Stripe payment link
7. Add ability for frontend to scan a barcode have it redeemed in the db along with who redeemed it or the same but the logged in user can enter the barcode number.
8. Fill out readmes for frontend and backend

## Content

As with most projects, I learn a thing or two. While there is usually a "here is the full project post" it's helpful to breakdown the concepts into smaller digestible pieces.

From a content planning perspective, I create a post and share it online to all my social accounts. From there, I schedule a followup post for a week in the future and again a month in the future.

0. How to build a local ticketer using Sharp + Canva ✅

--- Monday

3. How to call AppSync from a Lambda function: 2 hours for video and blog + staging✅

---- Wednesday

2. How to create a Lambda Function URL for Stripe webhooks using the CDK: 3 hours for everything --Tuesday✅

3. How to configure a Lambda Layer and use it in your Lambda function (show sharp img resizer): 3 hours
4. How to Add a QR Code or barcode to an image in your Lambda function: 2 hours
5. How to add text and a custom font to an image in a Lambda function: 2 hours

---- Thursday

5. How to send a Twilio SMS in AppSync without a Lambda function: 2 hours
6. How to send a Twilio MMS in AppSync without a Lambda function: 2 hours
7. How to get a secret from Secrets Manager using AWS AppSync: 2 hours

---- Friday

14. Big full on project: 4 hours

---

Update AppSync Pagination example to use React Waypoint: https://www.npmjs.com/package/react-waypoint

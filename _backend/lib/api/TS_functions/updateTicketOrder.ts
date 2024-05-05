import { Context, util } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request(ctx: Context) {
	const id = ctx.args.input.id
	const now = util.time.nowISO8601()

	const updateObj: ddb.DynamoDBUpdateObject = {
		title: ddb.operations.replace(ctx.args.input.title),
		description: ddb.operations.replace(ctx.args.input.description),
		isCompleted: ddb.operations.replace(ctx.args.input.isCompleted),
		updatedAt: ddb.operations.replace(now),
	}

	return ddb.update({
		key: { id },
		update: updateObj,
	})
}

export function response(ctx: Context) {
	return ctx.result
}

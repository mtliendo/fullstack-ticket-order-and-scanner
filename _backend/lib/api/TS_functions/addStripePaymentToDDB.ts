import { Context, util } from '@aws-appsync/utils'
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request(ctx: Context) {
	const id = util.autoId()
	const now = util.time.nowISO8601()

	const item = {
		__typename: 'TicketOrder',
		id,
		createdAt: now,
		updatedAt: now,
		isRedeemed: false,
		...ctx.args.input,
	}

	return ddb.put({
		key: { id },
		item,
	})
}

export function response(ctx: Context) {
	ctx.stash.ticketOrderResult = ctx.result
	return ctx.result
}

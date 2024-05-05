import { RemovalPolicy } from 'aws-cdk-lib'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

type ticketOrderTableProps = {
	appName: string
}
export const createTicketOrderTable = (
	scope: Construct,
	props: ticketOrderTableProps
) => {
	const tableName = `${props.appName}Table`
	const table = new Table(scope, tableName, {
		partitionKey: { name: 'id', type: AttributeType.STRING },
		tableName,
		removalPolicy: RemovalPolicy.DESTROY,
		billingMode: BillingMode.PAY_PER_REQUEST,
	})

	return table
}

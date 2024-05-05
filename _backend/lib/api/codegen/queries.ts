/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getTicketOrder = /* GraphQL */ `query GetTicketOrder($id: String!) {
  getTicketOrder(id: $id) {
    id
    email
    createdAt
    updatedAt
    stripeOrderId
    amountPaidInCents
    purchaser
    redeemedBy
    isRedeemed
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetTicketOrderQueryVariables,
  APITypes.GetTicketOrderQuery
>;

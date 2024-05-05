/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createTicketOrder = /* GraphQL */ `mutation CreateTicketOrder($input: CreateTicketOrderInput!) {
  createTicketOrder(input: $input)
}
` as GeneratedMutation<
  APITypes.CreateTicketOrderMutationVariables,
  APITypes.CreateTicketOrderMutation
>;
export const updateTicketOrder = /* GraphQL */ `mutation UpdateTicketOrder($input: UpdateTicketOrderInput!) {
  updateTicketOrder(input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateTicketOrderMutationVariables,
  APITypes.UpdateTicketOrderMutation
>;

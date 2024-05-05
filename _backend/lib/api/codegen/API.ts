/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateTicketOrderInput = {
  stripeOrderId: string,
  email: string,
  amountPaidInCents: number,
  purchaser: string,
  buyerPhoneNumber: string,
};

export type UpdateTicketOrderInput = {
  id: string,
  redeemedBy?: string | null,
  isRedeemed: boolean,
};

export type TicketOrder = {
  __typename: "TicketOrder",
  id: string,
  email: string,
  createdAt: string,
  updatedAt: string,
  stripeOrderId: string,
  amountPaidInCents: number,
  purchaser: string,
  redeemedBy?: string | null,
  isRedeemed: boolean,
};

export type CreateTicketOrderMutationVariables = {
  input: CreateTicketOrderInput,
};

export type CreateTicketOrderMutation = {
  createTicketOrder: string,
};

export type UpdateTicketOrderMutationVariables = {
  input: UpdateTicketOrderInput,
};

export type UpdateTicketOrderMutation = {
  updateTicketOrder:  {
    __typename: "TicketOrder",
    id: string,
    email: string,
    createdAt: string,
    updatedAt: string,
    stripeOrderId: string,
    amountPaidInCents: number,
    purchaser: string,
    redeemedBy?: string | null,
    isRedeemed: boolean,
  },
};

export type GetTicketOrderQueryVariables = {
  id: string,
};

export type GetTicketOrderQuery = {
  getTicketOrder:  {
    __typename: "TicketOrder",
    id: string,
    email: string,
    createdAt: string,
    updatedAt: string,
    stripeOrderId: string,
    amountPaidInCents: number,
    purchaser: string,
    redeemedBy?: string | null,
    isRedeemed: boolean,
  },
};

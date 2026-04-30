"use client";

import {
  initializePaddle,
  type Environments,
  type Paddle,
  type PaddleEventData,
} from "@paddle/paddle-js";

const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN?.trim() ?? "";

export const PADDLE_ENVIRONMENT: Environments =
  process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "sandbox" ? "sandbox" : "production";

export type PaddleCreditCheckoutInput = {
  priceId: string;
  email: string;
  creditsToAdd: number;
};

export function isPaddleConfigured() {
  return PADDLE_CLIENT_TOKEN.length > 0;
}

export async function initializePaddleClient(
  eventCallback?: (event: PaddleEventData) => void,
): Promise<Paddle | null> {
  if (!isPaddleConfigured()) return null;

  try {
    const paddle = await initializePaddle({
      environment: PADDLE_ENVIRONMENT,
      token: PADDLE_CLIENT_TOKEN,
      eventCallback,
    });

    return paddle ?? null;
  } catch (error) {
    console.error("Paddle initialization failed:", error);
    return null;
  }
}

export function openPaddleCreditCheckout(
  paddle: Paddle,
  input: PaddleCreditCheckoutInput,
) {
  paddle.Checkout.open({
    items: [
      {
        priceId: input.priceId,
        quantity: 1,
      },
    ],
    customer: {
      email: input.email,
    },
    customData: {
      userEmail: input.email,
      creditsToAdd: input.creditsToAdd,
    },
  });
}

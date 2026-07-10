import { httpRouter } from "convex/server";
import { paymentWebhook } from "./subscriptions";
import { httpAction } from "./_generated/server";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const chat = httpAction(async (ctx, req) => {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    system:
      "You are a plain-English options trading assistant for Premia, an app that helps retail traders generate income from their stock positions. " +
      "Explain options concepts in cash flow terms: premium earned, daily income ($/day), and annualized return on capital. " +
      "Avoid using Greek letters (delta, gamma, theta) unless the user asks — and if you must use them, immediately explain in dollar terms what they mean. " +
      "When discussing a trade, always state: how much premium is collected, what the daily cash flow is, the annualized return %, the break-even price, and what happens at expiration. " +
      "Be honest about risks: capped upside on covered calls, obligation to buy on cash-secured puts, margin call risk on short options in margin accounts. " +
      "This is a calculator tool — not financial advice. Never recommend specific trades. Do not predict stock prices.",
    messages,
    async onFinish({ text }) {
      // implement your own logic here, e.g. for storing messages
      // or recording token usage
      console.log(text);
    },
  });

  // Respond with the stream
  return result.toDataStreamResponse({
    headers: {
      "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "http://localhost:5173",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
      Vary: "origin",
    },
  });
});

const http = httpRouter();

http.route({
  path: "/api/chat",
  method: "POST",
  handler: chat,
});

http.route({
  path: "/api/chat",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => {
    // Make sure the necessary headers are present
    // for this to be a valid pre-flight request
    const headers = request.headers;
    if (
      headers.get("Origin") !== null &&
      headers.get("Access-Control-Request-Method") !== null &&
      headers.get("Access-Control-Request-Headers") !== null
    ) {
      return new Response(null, {
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "http://localhost:5173",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400",
        }),
      });
    } else {
      return new Response();
    }
  }),
});

http.route({
  path: "/api/auth/webhook",
  method: "POST",
  handler: httpAction(async (_, request) => {
    // Make sure the necessary headers are present
    // for this to be a valid pre-flight request
    const headers = request.headers;
    if (
      headers.get("Origin") !== null &&
      headers.get("Access-Control-Request-Method") !== null &&
      headers.get("Access-Control-Request-Headers") !== null
    ) {
      return new Response(null, {
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "http://localhost:5173",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400",
        }),
      });
    } else {
      return new Response();
    }
  }),
});

http.route({
  path: "/payments/webhook",
  method: "POST",
  handler: paymentWebhook,
});

// Log that routes are configured
console.log("HTTP routes configured");

// Convex expects the router to be the default export of `convex/http.js`.
export default http;

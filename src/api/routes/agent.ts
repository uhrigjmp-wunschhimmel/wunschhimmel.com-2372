import { Hono } from "hono";
import { createAgentUIStreamResponse } from "ai";
import { createAgent } from "../agent";

type Bindings = {
  DB: D1Database;
  AI_GATEWAY_BASE_URL: string;
  AI_GATEWAY_API_KEY: string;
  AWIN_API_TOKEN: string;
  AWIN_PUBLISHER_ID: string;
  AMAZON_ACCESS_KEY: string;
  AMAZON_SECRET_KEY: string;
  AMAZON_PARTNER_TAG: string;
};

export const agentRoutes = new Hono<{ Bindings: Bindings }>();

agentRoutes.post("/messages", async (c) => {
  const { messages } = await c.req.json();
  const agent = createAgent();
  return createAgentUIStreamResponse({ agent, uiMessages: messages });
});

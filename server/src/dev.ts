import { serve } from "@hono/node-server";
import { getEnv } from "./config";
import app from "./index";

const env = getEnv();

serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`skillstep-api listening on http://localhost:${info.port}`);
});

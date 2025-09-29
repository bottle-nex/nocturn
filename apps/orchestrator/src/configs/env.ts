import { z } from "zod";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const envSchema = z.object({
  ORCH_REDIS_URL: z.url(),
});

function validateUrl() {
  try {
    return envSchema.parse(process.env);
  } catch {
    console.error("Environment validation failed:");
    process.exit(1);
  }
}

export const Env = validateUrl();

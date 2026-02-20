import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Helper to get directory names
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project Root is 3 levels up from src/lib (awcms-mcp/src/lib -> awcms-mcp/src -> awcms-mcp -> awcms-dev)
export const PROJECT_ROOT = path.resolve(__dirname, "../../../");

// Load Environment Variables with priority:
// 1. awcms-mcp/.env
// 2. awcms/.env
export function loadConfig() {
  const pathsToTry = [
    "awcms/.env",
    "awcms/.env.local",
    "awcms-mcp/.env",
    "awcms-mcp/.env.local"
  ];

  let envVars = { ...process.env };

  for (const relativePath of pathsToTry) {
    const fullPath = path.resolve(PROJECT_ROOT, relativePath);
    if (fs.existsSync(fullPath)) {
      console.error(`[Config] Loading environment from: ${fullPath}`);
      const parsed = dotenv.parse(fs.readFileSync(fullPath));
      envVars = { ...envVars, ...parsed };
    }
  }

  if (Object.keys(envVars).length === Object.keys(process.env).length) {
    console.error("[Config] Warning: No .env files found.");
  }

  return envVars;
}

export const env = loadConfig();

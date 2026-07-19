// Point every test at an isolated PGlite database, then create the schema
// (and bootstrap data) before the suite runs.
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

process.env.DATABASE_URL = fileURLToPath(new URL(".test-db", import.meta.url));

execSync("node scripts/setup-db.mjs", { stdio: "ignore" });

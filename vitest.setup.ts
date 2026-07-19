// Point every test at an isolated PGlite database, then create the schema
// (and bootstrap data) before the suite runs. Start fresh to avoid file locks.
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { rmSync } from "node:fs";

const dbPath = fileURLToPath(new URL(".test-db", import.meta.url));
process.env.DATABASE_URL = dbPath;
rmSync(dbPath, { recursive: true, force: true });

execSync("node scripts/setup-db.mjs", { stdio: "ignore" });

import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

function run(command: string) {
  console.log(`\n▶ ${command}`);
  execSync(command, { stdio: "inherit" });
}

// Ensure dist directory exists
const distDir = path.resolve("dist");
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Build backend (Node / Express)
run(
  "npx esbuild server/index.ts " +
    "--bundle " +
    "--platform=node " +
    "--format=cjs " +
    "--outfile=dist/index.cjs"
);

// Build frontend (Vite / React)
run("npx vite build");

console.log("\n✅ Build completed successfully");

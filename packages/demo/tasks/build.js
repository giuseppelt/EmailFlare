#!/usr/bin/env zx
import "zx/globals";

$.verbose = false;
if (os.platform() === "win32") {
    $.shell = "pwsh.exe";
    $.prefix = "";
}

const part = argv.part;
if (part) {
    console.log(chalk.bold("Building: ") + part);
}

if (!part || part === "app") {
    await spinner("app:typecheck", () => $`pnpm tsc`);
    console.log(" OK app:typecheck");

    await spinner("app:build", () => $`pnpm vite build`);
    console.log(" OK app:build");
}

if (!part || part === "template") {
    cd("../app");
    await spinner("template:app:typecheck", () => $`pnpm tsc`);
    console.log(" OK template:app:typecheck");

    await spinner("template:app:build", () => $`pnpm vite build`);
    console.log(" OK template:app:build");

    cd("../demo");
    await spinner("template:build", () => $`pnpm run --filter @emailflare/worker build:bun:win`);
    console.log(" OK template:build");

    await spinner("template:copy", async () => {
        // await fs.copyFile("../worker/dist/index.bundle.js", "./public/assets/emailflare.js.txt");
        await fs.copyFile("../worker/dist/index.bundle.js", "./dist/assets/emailflare.js.txt");
    });
    console.log(" OK template:copy");
}

console.log("\n");

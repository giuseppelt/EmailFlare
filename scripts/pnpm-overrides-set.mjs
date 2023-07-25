#!/usr/bin/env zx
import "zx/globals";

if (os.platform() === "win32") {
    $.shell = "pwsh.exe";
    $.prefix = "";
}

if (!fs.existsSync("pnpm-overrides.local.json")) {
    console.log("No override file found");
    process.exit(0);
}

const { overrides, patchedDependencies } = await fs.readJson("pnpm-overrides.local.json");

const json = await fs.readJson("package.json");
json.pnpm ??= {};
json.pnpm.overrides = overrides;
json.pnpm.patchedDependencies = patchedDependencies;
await fs.writeJson("package.json", json, { spaces: 4 });

if (overrides && Object.keys(overrides).length > 0) {
    console.log(chalk.bold("Using overrides:"));
    Object.entries(overrides).forEach(([key, value]) => {
        console.log(`${key}:\t${chalk.gray(value)}`);
    });
}
if (patchedDependencies && Object.keys(patchedDependencies).length > 0) {
    console.log(chalk.bold("Using patchedDependencies:"));
    Object.entries(patchedDependencies).forEach(([key, value]) => {
        console.log(`${key}:\t${chalk.gray(value)}`);
    });
}

console.log("\n");
console.log(chalk.bold("Installing dependencies"));
await $`pnpm install`;

console.log("\n");
console.log(chalk.bold("Update git index"));
await $`git update-index --skip-worktree ./package.json ./pnpm-lock.yaml`;

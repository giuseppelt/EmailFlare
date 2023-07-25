#!/usr/bin/env zx
import "zx/globals";

if (os.platform() === "win32") {
    $.shell = "pwsh.exe";
    $.prefix = "";
}


$.verbose = false;
const committedJson = await $`git show HEAD:package.json`;
$.verbose = true;

const { overrides, patchedDependencies } = JSON.parse(committedJson)?.pnpm || {};

let skipped = false;

const json = await fs.readJson("package.json");
json.pnpm ??= {};
json.pnpm.overrides = overrides;
json.pnpm.patchedDependencies = patchedDependencies;

if (skipped) {
    console.log(chalk.bold("No updated needed"));
} else {
    await fs.writeJson("package.json", json, { spaces: 4 });

    if (overrides && Object.keys(overrides).length > 0) {
        console.log(chalk.bold("Using overrides:"));
        Object.entries(overrides).forEach(([key, value]) => {
            console.log(`${key}: ${chalk.grey(value)}`);
        });
    } else {
        console.log(chalk.bold("Overrides cleared"));
    }

    if (patchedDependencies && Object.keys(patchedDependencies).length > 0) {
        console.log(chalk.bold("Using patchedDependencies:"));
        Object.entries(patchedDependencies).forEach(([key, value]) => {
            console.log(`${key}: ${chalk.grey(value)}`);
        });
    } else {
        console.log(chalk.bold("PatchedDependencies cleared"));
    }
}

console.log("\n");
console.log(chalk.bold("Installing dependencies"));
await $`pnpm install`;

console.log("\n");
console.log(chalk.bold("Update git index"));
await $`git update-index --no-skip-worktree ./package.json ./pnpm-lock.yaml`;

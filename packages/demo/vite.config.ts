import "dotenv/config";
import fs from "fs";
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import svgr from "vite-plugin-svgr";
import Icons from "unplugin-icons/vite";

process.env.VITE_APP_VERSION = JSON.parse(fs.readFileSync("./package.json", "utf-8")).version;

export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 3000,
  },
  plugins: [
    preact(),
    Icons({
      autoInstall: true,
      compiler: "jsx",
      jsx: "preact",
      defaultClass: "icon",
    }),
    svgr({
      svgrOptions: {
        svgProps: {
          fill: "currentColor",
          width: "1em",
          height: "1em",
        }
      }
    }),
  ],
});

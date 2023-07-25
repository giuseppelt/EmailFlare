import fs from "node:fs/promises";
import path from "node:path";


const MIME_MAP = {
    "$default": {
        contentType: "application/octet-stream",
        serialize: "binary"
    },
    "html": {
        contentType: "text/html",
        serialize: "string"
    },
    "htm": {
        contentType: "text/html",
        serialize: "string"
    },
    "js": {
        contentType: "text/javascript",
        serialize: "string"
    },
    "mjs": {
        contentType: "text/javascript",
        serialize: "string"
    },
    "json": {
        contentType: "application/json",
        serialize: "string"
    },
    "css": {
        contentType: "text/css",
        serialize: "string"
    },
    "svg": {
        contentType: "image/svg+xml",
        serialize: "string"
    },
    "png": {
        contentType: "image/png",
        serialize: "binary"
    },
    "jpeg": {
        contentType: "image/jpeg",
        serialize: "binary"
    },
    "jpg": {
        contentType: "image/jpeg",
        serialize: "binary"
    },
    "gif": {
        contentType: "image/gif",
        serialize: "binary"
    },
    "ico": {
        contentType: "image/x-icon",
        serialize: "binary"
    },
    "ttf": {
        contentType: "font/ttf",
        serialize: "binary"
    },
    "woff": {
        contentType: "font/woff",
        serialize: "binary"
    },
    "woff2": {
        contentType: "font/woff2",
        serialize: "binary"
    },
};

const SERIALIZERS = {
    /** @param {string} file */
    string: async (file) => ({
        data: (await fs.readFile(file, "utf8")).replaceAll("\r", ""),
        encoding: "utf8",
    }),

    /** @param {string} file */
    binary: async (file) => ({
        data: (await fs.readFile(file)).toString("utf16le"),
        encoding: "utf16le",
    }),
}

/** @param {string} dir */
export async function getStaticAssets(dir, basePath = "/") {
    /** @type {{
     *      path: string,
     *      contentType: string,
     *      encoding: "utf8" | "utf16le",
     *      data: any
     * }[]}
     **/
    const assets = [];

    for (const file of await fs.readdir(dir)) {
        if (file.includes(".")) {
            const ext = path.extname(file).substring(1);
            const meta = MIME_MAP[ext]
                || console.warn(`Unknown extension(${ext}): fallback to octet-stream`)
                || MIME_MAP.$default;

            assets.push({
                path: path.join(basePath, file).replaceAll("\\", "/"),
                contentType: meta.contentType,
                ...await SERIALIZERS[meta.serialize](path.join(dir, file))
            })
        } else {
            assets.push(...await getStaticAssets(path.join(dir, file), path.join(basePath, file)));
        }
    }

    return assets;
}

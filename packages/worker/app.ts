import { createCloudflareWorker } from "@httpc/adapter-cloudflare";
import { StaticFileParser, StaticFileCalls, StaticFileDescriptor } from "@httpc/server";
import * as api from "../api/src/calls";


export default function factory(assets: StaticFileDescriptor[] = []) {
    const CONFIG = (globalThis as any).ASSET_CONFIG;

    return createCloudflareWorker({
        calls: {
            api,
            ...StaticFileCalls({
                descriptors: [...assets, CONFIG].filter(x => !!x),
                caching: {
                    seconds: 3600 * 24 // 1day
                },
            })
        },
        parsers: [
            StaticFileParser({
                exclude: "/api",
            })
        ],
    })
};

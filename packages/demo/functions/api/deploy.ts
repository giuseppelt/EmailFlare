
interface Env {
    ASSETS: Fetcher
}

type Data = {
    config: any
    accountId: string
    workerName: string
    apiToken: string
    bindings?: {
        domain: string
        secret: string
        dkimKey: string
    }
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    if (request.method !== "POST") {
        return new Response(undefined, { status: 405 });
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        return new Response(undefined, { status: 415 });
    }

    const data = await request.json<Data>().catch(() => null);
    if (!data || typeof data !== "object" ||
        !data.accountId ||
        !data.apiToken ||
        !data.workerName ||
        !data.config
    ) {
        return new Response(JSON.stringify({ success: false, message: `Missing required data` }), { status: 400 });
    }

    const response = await deployWorker(data, env);
    if (response.status >= 400) {
        const output = await response.text();
        console.log(output);

        return new Response(JSON.stringify({ success: false, message: `Cloudflare deploy error: HTTP-${response.status}` }), {
            status: 400,
            headers: {
                "content-type": "application/json"
            }
        });
    }

    // const output = await response.json();
    // console.log(output);

    return new Response(JSON.stringify({ success: true }), {
        headers: {
            "content-type": "application/json"
        }
    });
}

async function deployWorker(params: Data, env: Env) {
    // const content = "";
    const response = await env.ASSETS.fetch("http://localhost/assets/emailflare.js.txt");
    const content = await response.text();

    const snippet = `globalThis.ASSET_CONFIG = {
  path: "/assets/config.js",
  contentType: "application/javascript",
  encoding: "utf8",
  data: \`export default ${JSON.stringify(params.config)}\`
};`

    const code = snippet + content;

    const metadata = {
        main_module: "worker.js",
        compatibility_date: "2023-03-14",
        compatibility_flags: ["nodejs_compat"],
        bindings: [
            params.bindings?.secret && { type: "secret_text", name: "SECRET_KEY", text: params.bindings.secret },
            params.bindings?.dkimKey && { type: "secret_text", name: "DKIM_PRIVATE_KEY", text: params.bindings.dkimKey },
            params.bindings?.domain && { type: "plain_text", name: "SENDER_DOMAIN", text: params.bindings.domain },
        ].filter(x => !!x)
    };

    const body = new FormData();
    body.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }), "metadata.json");
    body.append("worker.js", new Blob([code], { type: "application/javascript+module" }), "worker.js");

    return await fetch(`https://api.cloudflare.com/client/v4/accounts/${params.accountId}/workers/scripts/${params.workerName}`, {
        method: "PUT",
        headers: {
            authorization: `Bearer ${params.apiToken}`,
        },
        body
    });
}

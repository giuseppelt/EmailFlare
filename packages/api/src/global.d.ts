import type _fetch from "node-fetch";

declare global {
    export const fetch: typeof _fetch;
    export const {
        Headers,
        Request,
        Response,
    }: typeof import("node-fetch");
}


declare global {
    interface IHttpCContext {
        SENDER_DOMAIN: string
        SECRET_KEY: string
        DKIM_PRIVATE_KEY: string
    }
}

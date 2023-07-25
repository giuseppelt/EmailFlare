import { createClient, ClientDef, AuthHeader } from "@httpc/client";
import * as ApiCalls from "@emailflare/api/src/calls";


let SECRET = "";

export function setSecret(value: string) {
    SECRET = value;
}

export const api = createClient<ClientDef<typeof ApiCalls>>({
    endpoint: (import.meta.env.VITE_API_ENDPOINT || "") + "/api",
    middlewares: [
        AuthHeader("SECRET", () => SECRET)
    ]
})

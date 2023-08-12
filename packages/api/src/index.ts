import "dotenv/config";
import { createHttpCNodeServer } from "@httpc/server";
import * as calls from "./calls";


const PORT = Number(process.env.PORT) || 3000;

const server = createHttpCNodeServer({
    calls,
});

server.listen(PORT);
console.log("Server listening: %s", PORT);

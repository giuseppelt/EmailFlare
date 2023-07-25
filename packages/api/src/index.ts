import "dotenv/config";
import { createHttpCServer } from "@httpc/server";
import * as calls from "./calls";


const PORT = Number(process.env.PORT) || 3000;

const server = createHttpCServer({
    calls,
});

server.listen(PORT);
console.log("Server listening: %s", PORT);

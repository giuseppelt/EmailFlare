import app from "./app";
import { getStaticAssets } from "./tasks/assets" with { type: "macro" };


const ASSETS = getStaticAssets("../app/dist") as any as Awaited<ReturnType<typeof getStaticAssets>>;

export default app(ASSETS);

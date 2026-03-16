import { handle } from "hono/vercel";
import honoApp from "@/server/app";

export const GET = handle(honoApp);
export const POST = handle(honoApp);

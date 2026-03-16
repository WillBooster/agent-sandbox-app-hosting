import { Hono } from "hono";
import appsRoute from "@/server/routes/apps";
import appFilesRoute from "@/server/routes/appFiles";

const honoApp = new Hono().basePath("/api");

honoApp.get("/ping", (c) => c.json({ status: "ok" }));
honoApp.route("/apps", appsRoute);
honoApp.route("/apps", appFilesRoute);

export default honoApp;
